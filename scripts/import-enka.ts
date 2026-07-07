// Import real disc builds from an Enka / interknot showcase payload → the andres-zzz blob.
//
//   npm run import           # dry-run: decode + grade the 6 showcase agents, print, write NOTHING
//   npm run import -- --write  # merge the decoded builds into Supabase (andres-zzz) + public/data.json
//
// ZZZ only exposes the 6 agents pinned in the in-game showcase, so each pull covers ≤6.
// Rotate the showcase + re-pull (or feed a fresh --file) to cover the rest of the roster.
//
// Maps are anchored to canonical game data (Enka avatars.json + EN loc), NOT guessed:
//   - PropertyId → stat key: derived from ZZZ per-roll value signatures, cross-checked on Alice/Jane.
//   - suite id → set name:   Enka EquipmentSuit_*_name (EN).
//   - avatar id → roster:     Enka avatars.json (Name/ProfessionType/ElementTypes).
import { promises as fs } from "fs";
import path from "path";
import { gradeBuild, GRADING_CONFIG } from "../src/lib/grading";
import { getSupabase, PROFILE_KEY, SUPABASE_TABLE } from "../src/lib/supabase";
import type { Agent, DashboardData, DiscPiece, DiscSub } from "../src/lib/types";

// ---- canonical maps ------------------------------------------------------
// PropertyId → our canonical stat key. Mains and subs share ids for most stats; element
// DMG mains differ by element (315xx Physical … 319xx Ether) and the engine collapses
// "<Element> DMG" → "Attribute DMG" for main-point lookup.
const PROP: Record<number, string> = {
  11102: "HP%", 11103: "HP", 12102: "ATK%", 12103: "ATK", 13102: "DEF%", 13103: "DEF",
  20103: "CRIT Rate", 21103: "CRIT DMG", 23203: "Flat PEN", 31203: "Anomaly Proficiency",
  31402: "Anomaly Mastery", 30502: "Energy Regen", 23103: "PEN Ratio", 12202: "Impact",
  31503: "Physical DMG", 31603: "Fire DMG", 31703: "Ice DMG", 31803: "Electric DMG", 31903: "Ether DMG",
};

// suit id (EquipId[0:3] + "00") → set name. Enka EN loc, restricted to sets seen here +
// a couple neighbours; extend as new showcases surface unseen suites.
const SUIT: Record<string, string> = {
  "31000": "Woodpecker Electro", "31300": "Freedom Blues", "31600": "Swing Jazz",
  "32600": "Fanged Metal", "32700": "Branch & Blade Song", "33000": "Phaethon's Melody",
  "33100": "Yunkui Tales", "33500": "White Water Ballad", "33900": "Wuthering Salon",
  "33200": "King of the Summit", "32800": "Astral Voice", "33300": "Dawn's Bloom", "32200": "Inferno Metal",
  "32900": "Shadow Harmony", "31800": "Chaos Jazz", "33400": "Moonlight Lullaby", "31200": "Shockstar Disco",
  "31100": "Puffer Electro",
};

// avatar id → roster identity (name MUST equal the ROSTER entry's `name`, that's the deck key).
// Enka's internal codename ≠ our roster name in two spots: 1431 "Zhenzhen" is localized as
// Ye Shunguang, and 1561 (newer than Enka's avatars.json) is Velina — both confirmed by A..
const AVATAR: Record<number, { name: string; slug: string }> = {
  1261: { name: "Jane Doe", slug: "janedoe" },
  1401: { name: "Alice", slug: "alice" },
  1371: { name: "Yixuan", slug: "yixuan" },
  1051: { name: "Yidhari", slug: "yidhari" },
  1431: { name: "Ye Shunguang", slug: "yeshunguang" }, // Enka codename "Zhenzhen"
  1561: { name: "Velina", slug: "velina" },            // not in Enka avatars.json yet
  1481: { name: "Dialyn", slug: "dialyn" },
  1311: { name: "Astra Yao", slug: "astra" },
  1091: { name: "Miyabi", slug: "miyabi" },            // Enka codename "Unagi"
  1501: { name: "Aria", slug: "aria" },
  1521: { name: "Cissia", slug: "cissia" },
  1321: { name: "Evelyn", slug: "evelyn" },
  1461: { name: "Seed", slug: "seed" },
  1381: { name: "Soldier 0 Anby", slug: "soldier0anby" }, // Enka codename "SilverAnby"
  1171: { name: "Burnice", slug: "burnice" },
  1361: { name: "Trigger", slug: "trigger" },
  1491: { name: "Sunna", slug: "sunna" },
  1411: { name: "Yuzuha", slug: "yuzuha" },
  1451: { name: "Lucia", slug: "lucia" },
  1331: { name: "Vivian", slug: "vivian" },
  1191: { name: "Ellen", slug: "ellen" },
  1391: { name: "Ju Fufu", slug: "jufufu" },     // Enka confirms 1391=Jufufu, 1161=Lighter (not swapped)
  1161: { name: "Lighter", slug: "lighter" },
  1511: { name: "Nangong Yu", slug: "nangongyu" },
};

// manual W-engine names for engines too new for interknot's `c` catalog (so they decode null).
const WENGINE_OVERRIDE: Record<string, string> = {
  velina: "Joyau Doré",
};

// stats displayed as a percentage; everything else is a flat integer.
const PERCENT = new Set([
  "HP%", "ATK%", "DEF%", "CRIT Rate", "CRIT DMG", "PEN Ratio", "Energy Regen", "Impact",
  "Anomaly Mastery", "Physical DMG", "Fire DMG", "Ice DMG", "Electric DMG", "Ether DMG",
]);
const RANK: Record<string, string> = { "2": "B", "3": "A", "4": "S" };

// ---- decode --------------------------------------------------------------
const propName = (id: number): string => {
  const n = PROP[id];
  if (!n) throw new Error(`Unmapped PropertyId ${id} — add it to PROP (see Enka property table)`);
  return n;
};

// Main display value: payload raw × 4 = internal value (validated on HP/ATK/DEF/AP/element
// across Alice + Jane). Percent stats render internal/100 + "%"; flats render direct.
function mainValue(id: number, raw: number): string | number {
  const stat = propName(id);
  const internal = raw * 4;
  if (PERCENT.has(stat)) {
    const pct = internal / 100;
    return `${Number.isInteger(pct) ? pct : +pct.toFixed(1)}%`;
  }
  return internal;
}

interface DecodedAgent { id: number; agent: Agent; resolved: boolean; weapon: string | null; }

function decodeAvatar(av: any, c: Record<string, any>): DecodedAgent {
  const id: number = av.Id;
  const ident = AVATAR[id];
  const pieces: DiscPiece[] = av.EquippedList.map((e: any): DiscPiece => {
    const eq = e.Equipment;
    const eid = String(eq.Id);
    const suit = SUIT[eid.slice(0, 3) + "00"] ?? `Suit ${eid.slice(0, 3)}`;
    const mp = eq.MainPropertyList[0];
    const subs: DiscSub[] = eq.RandomPropertyList.map((s: any): DiscSub => ({
      stat: propName(s.PropertyId),
      rolls: s.PropertyLevel,
    }));
    return {
      slot: e.Slot,
      set: suit,
      rank: RANK[eid[3]] ?? "S",
      level: eq.Level,
      main: { stat: propName(mp.PropertyId), value: mainValue(mp.PropertyId, mp.PropertyValue) },
      subs,
    };
  });

  const weapon: string | null =
    (av.Weapon?.Id ? c[String(av.Weapon.Id)]?.name : null) ?? WENGINE_OVERRIDE[ident?.slug ?? ""] ?? null;

  const agent: Agent = {
    name: ident?.name ?? `Unknown ${id}`,
    section: "ANOMALY", // refined below from resolved roster; placeholder for unresolved
    attribute: "Physical",
    rank: "S",
    mindscape: `M${av.TalentLevel ?? 0}`,
    level: av.Level ?? 60,
    discs: { pieces: pieces.sort((a, b) => a.slot - b.slot) },
  };
  // Enka `UpgradeLevel` is the 1-indexed W-engine refinement (1=R1 … 5=R5), NOT 0-indexed — do NOT
  // add 1. The old `+ 1` inflated every R1 engine to R2 across the whole roster (fixed 2026-06-21).
  if (weapon) agent.wengine = { name: weapon, rank: "S", refine: `R${av.Weapon?.UpgradeLevel ?? 1}` };

  return { id, agent, resolved: Boolean(ident), weapon };
}

// section/attribute come from the live ROSTER (so they match the rest of the dashboard);
// importer only owns the build (discs + wengine + mindscape).
async function loadRosterMeta(): Promise<Record<string, { section: string; attribute: string; faction?: string }>> {
  const { ROSTER } = await import("../src/lib/roster");
  return Object.fromEntries(
    ROSTER.map((r) => [r.name, { section: r.section, attribute: r.attribute, faction: r.faction }]),
  );
}

async function main() {
  const args = process.argv.slice(2);
  const write = args.includes("--write");
  const fileArg = args.find((a) => a.startsWith("--file="))?.slice("--file=".length);
  const file = fileArg ?? path.join(process.cwd(), "scripts", "fixtures", "showcase-1001327696.json");

  const payload = JSON.parse(await fs.readFile(file, "utf-8"));
  const list = payload?.data?.PlayerInfo?.ShowcaseDetail?.AvatarList ?? [];
  const c = payload?.c ?? {};
  const meta = await loadRosterMeta();

  console.log(`\n● Enka import · ${list.length} showcase agents · UID ${payload?.data?.uid ?? "?"}\n`);

  const decoded = list.map((av: any) => decodeAvatar(av, c));
  const toWrite: Agent[] = [];
  const unresolved: DecodedAgent[] = [];

  for (const d of decoded) {
    if (d.resolved) {
      const m = meta[d.agent.name];
      if (m) { d.agent.section = m.section.toUpperCase(); d.agent.attribute = m.attribute; if (m.faction) d.agent.faction = m.faction; }
      const g = gradeBuild(d.agent, GRADING_CONFIG);
      const chips = g.discs.map((x) => x.letter).join("·");
      console.log(`✓ ${d.agent.name.padEnd(12)} ${d.agent.mindscape}  build ${g.buildLetter} (${g.buildPct}%)  discs ${chips}`);
      console.log(`    ${g.sets.note}${d.weapon ? `  ·  W: ${d.weapon}` : ""}`);
      toWrite.push(d.agent);
    } else {
      unresolved.push(d);
    }
  }

  for (const d of unresolved) {
    const sets = d.agent.discs!.pieces.reduce((acc: Record<string, number>, p) => ((acc[p.set] = (acc[p.set] || 0) + 1), acc), {});
    const setStr = Object.entries(sets).map(([s, n]) => `${s}×${n}`).join(", ");
    console.log(`⚠ UNRESOLVED avatar ${d.id}  ${d.agent.mindscape}  ${d.weapon ? `W: ${d.weapon}` : ""}`);
    console.log(`    sets: ${setStr}`);
    console.log(`    mains: ${d.agent.discs!.pieces.map((p) => `s${p.slot}=${p.main.stat}`).join(" ")}`);
    console.log(`    → add to AVATAR map once identified, then re-run.`);
  }

  console.log(`\n${toWrite.length} resolved build(s) ready; ${unresolved.length} unresolved.\n`);

  if (!write) {
    console.log("DRY RUN — pass --write to merge into Supabase + public/data.json.\n");
    return;
  }

  // ---- merge into the andres-zzz blob -------------------------------------
  const supa = getSupabase();
  if (!supa) throw new Error("No Supabase client");
  const { data: row, error } = await supa.from(SUPABASE_TABLE).select("data").eq("profile", PROFILE_KEY).maybeSingle();
  if (error) throw error;

  const base: DashboardData = (row?.data as DashboardData) ?? {
    meta: { title: "Zenless Zone Zero · Soundsystem", updated: "", maxLevel: 60 }, agents: [],
  };
  const byName = new Map(base.agents.map((a) => [a.name, a]));
  for (const a of toWrite) byName.set(a.name, a); // imported build replaces any stub

  // Prune blob agents that aren't in the roster — every agent needs a roster entry to have a
  // deck, so a name not in ROSTER is a stale artifact (e.g. an Enka codename written before a
  // localization fix). Keeps the blob ⊆ roster.
  const rosterNames = new Set(Object.keys(meta));
  const pruned: string[] = [];
  for (const name of [...byName.keys()]) {
    if (!rosterNames.has(name)) { byName.delete(name); pruned.push(name); }
  }
  if (pruned.length) console.log(`  pruned ${pruned.length} non-roster agent(s): ${pruned.join(", ")}`);

  const merged: DashboardData = {
    ...base,
    meta: { ...base.meta, totalAgents: byName.size, updated: new Date().toISOString().slice(0, 10) },
    agents: [...byName.values()],
  };

  const { error: upErr } = await supa
    .from(SUPABASE_TABLE)
    .upsert({ profile: PROFILE_KEY, data: merged, updated_at: new Date().toISOString() }, { onConflict: "profile" });
  if (upErr) throw upErr;

  const seed = path.join(process.cwd(), "public", "data.json");
  await fs.writeFile(seed, JSON.stringify(merged, null, 2) + "\n", "utf-8");

  console.log(`✓ Wrote ${toWrite.length} build(s) → Supabase (${PROFILE_KEY}) + ${seed}`);
  console.log(`  blob now holds ${merged.agents.length} agent(s): ${merged.agents.map((a) => a.name).join(", ")}\n`);
}

main().catch((e) => { console.error(e); process.exit(1); });
