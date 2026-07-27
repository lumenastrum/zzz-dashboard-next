#!/usr/bin/env node
/**
 * Signal Search (gacha pull) history sync — the ZZZ sibling of the WuWa
 * dashboard's convene-sync.
 *
 * Digs the authed getGachaLog URL out of ZZZ's Chromium webcache, pages Hoyo's
 * official API across every channel, and union-merges (by record id — never
 * deletes) into the Supabase row `andres-zzz-pulls`. Hoyo serves a rolling
 * ~6-month window; the archive outlives it.
 *
 * The URL only lands in the webcache when you open Signal Search History
 * IN-GAME, and its authkey expires in ~24h. Flow: launch ZZZ → open Signal
 * Search → history → run this.
 *
 * Usage:
 *   npm run signal                          auto-find URL in the webcache
 *   npm run signal -- --url "https://…"     paste the URL yourself
 *   npm run signal -- --cache "C:\path"     override the Cache_Data dir
 *   npm run signal -- --dry                 fetch + print, do NOT write
 *   npm run signal -- --graft file.json     graft a historical export (the
 *       master archive fixture or a raw zzz.rng.moe backup), then exit.
 *       Graft is also id-union — existing named records always survive.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { serviceKey } from "./service-key";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { SUPABASE_URL, SUPABASE_TABLE } from "../src/lib/supabase";
import {
  SIGNAL_CHANNELS,
  SIGNAL_PROFILE_KEY,
  emptySignalStore,
  type SignalRecord,
  type SignalStore,
} from "../src/lib/signal-types";
import { mergeById } from "../src/lib/signal-merge";
import { summarize } from "../src/lib/signal-analytics";

/** Channels to page. 12/13 have never/rarely served records but cost one probe each. */
const SYNC_CHANNELS = ["1", "2", "3", "5", "12", "13"];
const PAGE_DELAY_MS = 250;
/** Runaway guard — the API serves 5/page regardless of the size param. */
const MAX_PAGES = 2000;

/**
 * Server-local (prod_gf_us) = UTC-5, proven exact against 366 records shared
 * between the API and a rng.moe backup (0.0s residual). Used only when
 * normalizing a backup's epoch-ms timestamps into the archive's time strings.
 */
const SERVER_UTC_OFFSET_H = -5;

/** rng.moe gachaType → real_gacha_type channel key. */
const RNGMOE_CHANNEL: Record<string, string> = {
  "1001": "1",
  "2001": "2",
  "3001": "3",
  "5001": "5",
  "13001": "13",
};

/** Known webcache roots, freshest-mtime version folder wins. */
const CACHE_ROOTS = [
  "C:\\Program Files (x86)\\Steam\\steamapps\\common\\Zenless Zone Zero\\games\\ZenlessZoneZero Game\\ZenlessZoneZero_Data\\webCaches",
  "D:\\Games\\HoYoPlay\\games\\ZenlessZoneZero Game\\ZenlessZoneZero_Data\\webCaches",
];

function arg(flag: string): string | undefined {
  const i = process.argv.indexOf(flag);
  return i >= 0 ? process.argv[i + 1] : undefined;
}
const hasFlag = (flag: string) => process.argv.includes(flag);
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ── URL discovery ─────────────────────────────────────────────────────

function findCacheDir(): string | null {
  const override = arg("--cache") ?? process.env.ZZZ_CACHE_PATH;
  if (override) return override;
  let best: { mtime: number; dir: string } | null = null;
  for (const root of CACHE_ROOTS) {
    if (!existsSync(root)) continue;
    for (const ver of readdirSync(root)) {
      const dir = join(root, ver, "Cache", "Cache_Data");
      if (!existsSync(dir)) continue;
      const mtime = statSync(dir).mtimeMs;
      if (!best || mtime > best.mtime) best = { mtime, dir };
    }
  }
  return best?.dir ?? null;
}

/** Scan data_* cache files for getGachaLog URLs; freshest timestamp param wins. */
function findUrlInCache(cacheDir: string): string | null {
  const urlRe = /https:\/\/[\x21-\x7e]+?getGachaLog\?[\x21-\x7e]+/g;
  let best: { ts: number; url: string } | null = null;
  for (const f of readdirSync(cacheDir)) {
    if (!f.startsWith("data_")) continue;
    let bytes: Buffer;
    try {
      bytes = readFileSync(join(cacheDir, f));
    } catch {
      continue; // locked harder than usual — the other data_ files still scan
    }
    for (const m of bytes.toString("latin1").matchAll(urlRe)) {
      const ts = Number(new URL(m[0]).searchParams.get("timestamp") ?? 0);
      if (!best || ts > best.ts) best = { ts, url: m[0] };
    }
  }
  return best?.url ?? null;
}

// ── API ───────────────────────────────────────────────────────────────

interface ApiResponse {
  retcode: number;
  message: string;
  data: { list: SignalRecord[] } | null;
}

function buildQuery(baseUrl: string, channel: string, endId: string): string {
  const u = new URL(baseUrl);
  // Strip the webview's own paging/init params; keep auth + identity.
  for (const k of [
    "page",
    "size",
    "end_id",
    "gacha_type",
    "gacha_id",
    "init_log_gacha_type",
    "init_log_gacha_base_type",
  ]) {
    u.searchParams.delete(k);
  }
  u.searchParams.set("page", "1");
  u.searchParams.set("size", "20");
  u.searchParams.set("end_id", endId);
  u.searchParams.set("real_gacha_type", channel);
  return u.toString();
}

async function fetchPage(
  baseUrl: string,
  channel: string,
  endId: string,
): Promise<SignalRecord[]> {
  const res = await fetch(buildQuery(baseUrl, channel, endId), {
    headers: { "User-Agent": "Mozilla/5.0" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = (await res.json()) as ApiResponse;
  if (json.retcode !== 0) {
    throw new Error(
      `API retcode ${json.retcode}: ${json.message}` +
        (json.retcode === -101
          ? "\n  → The authkey expired (~24h). Open Signal Search history in-game, then re-run."
          : ""),
    );
  }
  return json.data?.list ?? [];
}

async function fetchChannel(baseUrl: string, channel: string): Promise<SignalRecord[]> {
  const out: SignalRecord[] = [];
  let endId = "0";
  for (let page = 1; page <= MAX_PAGES; page++) {
    const list = await fetchPage(baseUrl, channel, endId);
    if (list.length === 0) break;
    const nextEnd = list[list.length - 1].id;
    if (nextEnd === endId) break; // cursor not advancing — defensive stop
    out.push(...list);
    endId = nextEnd;
    await sleep(PAGE_DELAY_MS);
  }
  return out;
}

// ── graft normalization ───────────────────────────────────────────────

interface RngmoeItem {
  uid: number | string;
  id: number | string;
  timestamp: number;
  rarity: number;
  gacha: number | string;
  gachaType: number | string;
}

function serverTime(epochMs: number): string {
  const d = new Date(epochMs + SERVER_UTC_OFFSET_H * 3600_000);
  return d.toISOString().slice(0, 19).replace("T", " ");
}

/** item_id → {name, item_type} learned from every named record we hold. */
function nameIndex(store: SignalStore): Map<string, { name: string; item_type: string }> {
  const idx = new Map<string, { name: string; item_type: string }>();
  for (const recs of Object.values(store.channels)) {
    for (const r of recs) {
      if (r.name && !idx.has(r.item_id)) {
        idx.set(r.item_id, { name: r.name, item_type: r.item_type });
      }
    }
  }
  // Curated map for item ids that aged out of the API before we ever saw them
  // named (built from Hakush data — regenerate via scripts/signal-names.json).
  const namesPath = join(process.cwd(), "scripts", "signal-names.json");
  if (existsSync(namesPath)) {
    const extra = JSON.parse(readFileSync(namesPath, "utf8")) as Record<
      string,
      { name: string; item_type: string }
    >;
    for (const [id, v] of Object.entries(extra)) {
      if (!idx.has(id)) idx.set(id, v);
    }
  }
  return idx;
}

/** Accepts the master-archive fixture shape OR a raw zzz.rng.moe backup. */
function normalizeGraft(
  raw: unknown,
  store: SignalStore,
): Record<string, SignalRecord[]> {
  const doc = raw as Record<string, unknown>;
  const byChannel: Record<string, SignalRecord[]> = {};
  const idx = nameIndex(store);

  if (Array.isArray(doc.pulls)) {
    // Our fixture shape: API-shaped records carrying _real_gacha_type.
    for (const p of doc.pulls as (SignalRecord & { _real_gacha_type: string })[]) {
      const ch = p._real_gacha_type;
      const rec: SignalRecord = {
        id: p.id,
        uid: p.uid,
        gacha_id: p.gacha_id ?? "",
        gacha_type: p.gacha_type ?? ch,
        item_id: String(p.item_id),
        count: p.count ?? "1",
        time: p.time,
        name: p.name || (idx.get(String(p.item_id))?.name ?? ""),
        lang: p.lang ?? "en-us",
        item_type: p.item_type || (idx.get(String(p.item_id))?.item_type ?? ""),
        rank_type: String(p.rank_type),
      };
      (byChannel[ch] ??= []).push(rec);
    }
    return byChannel;
  }

  // Raw rng.moe backup: data.profiles.<n>.stores["0"].items[gachaType][].
  const data = doc.data as
    | { profiles?: Record<string, { bindUid?: number; stores?: Record<string, { items?: Record<string, RngmoeItem[]> }> }> }
    | undefined;
  const profiles = data?.profiles;
  if (!profiles) throw new Error("Unrecognized graft file shape (neither fixture nor rng.moe backup).");
  for (const prof of Object.values(profiles)) {
    const items = prof.stores?.["0"]?.items;
    if (!items) continue;
    for (const [gt, list] of Object.entries(items)) {
      const ch = RNGMOE_CHANNEL[gt];
      if (!ch) {
        console.log(`  ⚠ unknown rng.moe gachaType ${gt} — skipped ${list.length} records`);
        continue;
      }
      for (const it of list) {
        const itemId = String(it.id);
        const known = idx.get(itemId);
        (byChannel[ch] ??= []).push({
          id: String(it.uid),
          uid: String(prof.bindUid ?? store.uid ?? ""),
          gacha_id: String(it.gacha ?? ""),
          gacha_type: ch,
          item_id: itemId,
          count: "1",
          time: serverTime(it.timestamp),
          name: known?.name ?? "",
          lang: "en-us",
          item_type: known?.item_type ?? "",
          rank_type: String(it.rarity),
        });
      }
    }
  }
  return byChannel;
}

// ── main ──────────────────────────────────────────────────────────────

async function loadStore(): Promise<{ supabase: SupabaseClient; store: SignalStore }> {
  const supabase = createClient(SUPABASE_URL, serviceKey());
  let store: SignalStore = emptySignalStore();
  const { data: row, error } = await supabase
    .from(SUPABASE_TABLE)
    .select("data")
    .eq("profile", SIGNAL_PROFILE_KEY)
    .maybeSingle();
  if (error) throw error;
  if (row?.data) store = row.data as SignalStore;
  return { supabase, store };
}

function printSummary(store: SignalStore) {
  const sum = summarize(store);
  console.log(
    `\n${"═".repeat(52)}\n` +
      `  TOTAL  ${sum.totalPulls.toLocaleString()} signals · ` +
      `${sum.totalPolychrome.toLocaleString()} Polychrome · ${sum.totalS} S-rank\n` +
      `  SPAN   ${sum.firstTime ?? "—"} → ${sum.lastTime ?? "—"}\n` +
      `${"═".repeat(52)}`,
  );
  for (const c of sum.channels) {
    const avg = c.avgPityS != null ? `avg pity ${c.avgPityS.toFixed(1)}` : "no S-rank";
    const flip =
      c.flipChallenges != null && c.flipChallenges > 0
        ? ` · ${c.flipLabel} ${c.flipWins}W/${c.flipChallenges} (${Math.round(
            ((c.flipWins ?? 0) / c.flipChallenges) * 100,
          )}%)${c.onGuarantee ? " · ON GUARANTEE" : ""}`
        : "";
    console.log(
      `  ${c.name.padEnd(18)} ${String(c.total).padStart(5)} pulls · ${String(c.sCount).padStart(3)} S · ${avg} · current ${c.currentPity}/${c.hardPity}${flip}`,
    );
  }
}

async function save(supabase: SupabaseClient, store: SignalStore) {
  const { error } = await supabase.from(SUPABASE_TABLE).upsert(
    {
      profile: SIGNAL_PROFILE_KEY,
      data: store,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "profile" },
  );
  if (error) throw error;
  console.log(`\n✓ saved to Supabase (profile=${SIGNAL_PROFILE_KEY})`);
}

async function main() {
  const dry = hasFlag("--dry");
  const graftFile = arg("--graft");
  const { supabase, store } = await loadStore();

  if (graftFile) {
    console.log(`• Grafting ${graftFile}`);
    const raw = JSON.parse(readFileSync(graftFile, "utf8"));
    const byChannel = normalizeGraft(raw, store);
    let totalAdded = 0;
    for (const [ch, recs] of Object.entries(byChannel)) {
      const { merged, added } = mergeById(store.channels[ch] ?? [], recs);
      store.channels[ch] = merged;
      totalAdded += added;
      console.log(
        `  [${ch}] ${(SIGNAL_CHANNELS[ch] ?? ch).padEnd(18)} +${added} grafted = ${merged.length}`,
      );
    }
    if (!store.uid) {
      const first = Object.values(store.channels).flat()[0];
      if (first?.uid) store.uid = first.uid;
    }
    printSummary(store);
    if (dry) return console.log("\n(--dry: nothing written)");
    console.log(`\n${totalAdded} records grafted.`);
    return save(supabase, store);
  }

  // 1. Resolve the gacha-log URL.
  let url = arg("--url");
  if (!url) {
    const cacheDir = findCacheDir();
    if (!cacheDir) {
      console.error("✕ No ZZZ webcache found. Pass --cache or --url.");
      process.exit(1);
    }
    console.log(`• Scanning webcache: ${cacheDir}`);
    url = findUrlInCache(cacheDir) ?? undefined;
  }
  if (!url) {
    console.error(
      "✕ No getGachaLog URL in the webcache.\n" +
        "  → Launch ZZZ, open Signal Search → history, then re-run.\n" +
        '  → Or paste one: npm run signal -- --url "https://…"',
    );
    process.exit(1);
  }
  const region = new URL(url).searchParams.get("region") ?? "";
  console.log(`✓ URL found · region ${region}`);

  // 2. Page every channel; merge per channel on success so one failure
  //    (e.g. expired key mid-run) never touches the others' stored history.
  let totalAdded = 0;
  for (const ch of SYNC_CHANNELS) {
    try {
      const fresh = await fetchChannel(url, ch);
      if (fresh.length === 0) {
        if (SIGNAL_CHANNELS[ch] && (store.channels[ch]?.length ?? 0) > 0) {
          console.log(`  [${ch}] ${SIGNAL_CHANNELS[ch].padEnd(18)} window empty — archive kept`);
        }
        continue;
      }
      const { merged, added } = mergeById(store.channels[ch] ?? [], fresh);
      store.channels[ch] = merged;
      totalAdded += added;
      if (!store.uid) store.uid = fresh[0].uid;
      console.log(
        `  [${ch}] ${(SIGNAL_CHANNELS[ch] ?? ch).padEnd(18)} ${String(fresh.length).padStart(5)} in window · +${added} new = ${merged.length}`,
      );
    } catch (e) {
      console.log(`  [${ch}] ${(SIGNAL_CHANNELS[ch] ?? ch).padEnd(18)} FAILED — kept previous`);
      console.log(`        ${(e as Error).message.split("\n")[0]}`);
    }
  }

  store.region = region || store.region;
  store.lastSync = new Date().toISOString();

  printSummary(store);
  console.log(`\n${totalAdded} new record(s) this sync.`);

  if (dry) return console.log("\n(--dry: nothing written to Supabase)");
  return save(supabase, store);
}

main().catch((e) => {
  console.error("✕", e instanceof Error ? e.message : e);
  process.exit(1);
});
