// Coach Pack exporter — the machine-first data plane for the ZZZ Team Coach.
//
// Writes public/coach/ so every GH Pages deploy publishes, at stable curl-able URLs:
//
//   https://lumenastrum.github.io/zzz-dashboard-next/coach/manifest.json
//   https://lumenastrum.github.io/zzz-dashboard-next/coach/roster.json
//   https://lumenastrum.github.io/zzz-dashboard-next/coach/setlists.json
//
// COACH.md (the authored doctrine, committed) lives in the same folder; these JSONs are
// generated artifacts (gitignored, like public/data/). roster.json is a DATED build-time
// snapshot of the live Supabase blob — the manifest carries the live REST recipe as the
// freshness upgrade path, so the snapshot never masquerades as a second truth
// (export-endgame.ts's concern, honored via labeling instead of omission: plain-URL
// consumers like GPT surfaces can't send the apikey header a live REST read needs).
//
// Endgame history IS mirrored here (coach/shiyu.json + coach/assault.json, copied from
// the export-endgame output that prebuild runs first) so the whole pack lives under ONE
// path prefix — a field session showed a fetch tool grabbing /coach/* fine while a
// /data/* fetch failed transiently, and the coach flow shouldn't die on a path hop.
// data/shiyu.json + data/assault.json keep publishing unchanged for other consumers.
import { promises as fs } from "fs";
import path from "path";
import {
  getSupabase,
  SUPABASE_TABLE,
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  PROFILE_KEY,
  PROFILE_WIFE,
} from "../src/lib/supabase";
import { rosterFor, displayMindscape, type RosterEntry } from "../src/lib/roster";
import { gradeBuild, GRADING_CONFIG, type BuildGrade } from "../src/lib/grading";
import { setlistsFor } from "../src/lib/setlists";
import type { Agent, DashboardData } from "../src/lib/types";

const BASE = "https://lumenastrum.github.io/zzz-dashboard-next";
const PROFILES = [PROFILE_KEY, PROFILE_WIFE];
const PROFILE_LABEL: Record<string, string> = {
  [PROFILE_KEY]: "A.",
  [PROFILE_WIFE]: "Cosmea",
};

interface AgentDigest {
  name: string;
  slug: string;
  section: string; // in-game specialty tab (display)
  gradingArchetype: string; // how the build actually scales — hybrids diverge from section
  attribute: string;
  faction?: string;
  title?: string;
  mindscape: string;
  level?: number;
  wengine?: { name: string; rank?: string; refine?: string };
  build: { letter: string; pct: number; sets: string; suggestions: string[] } | null;
  sheet?: { stat: string; value: number | string }[]; // character-screen main stats
  scalesOn?: string[]; // the stats this agent's damage actually keys off
}

function archetypeFor(entry: RosterEntry): string {
  const overrides = (GRADING_CONFIG as { agentOverrides?: Record<string, unknown> }).agentOverrides ?? {};
  const o = overrides[entry.name];
  if (o && typeof o === "object" && "archetype" in o && typeof o.archetype === "string") {
    return o.archetype;
  }
  return entry.section.toLowerCase();
}

function tryGrade(a: Agent): BuildGrade | null {
  if (!a.discs?.pieces?.length) return null;
  try {
    return gradeBuild(a, GRADING_CONFIG);
  } catch {
    return null;
  }
}

async function fetchRow(profile: string): Promise<{ data: DashboardData; updated_at: string }> {
  const supa = getSupabase();
  if (!supa) throw new Error("No Supabase client");
  const { data: row, error } = await supa
    .from(SUPABASE_TABLE)
    .select("data,updated_at")
    .eq("profile", profile)
    .maybeSingle();
  if (error) throw error;
  if (!row) throw new Error(`No "${profile}" row in ${SUPABASE_TABLE}`);
  return { data: row.data as DashboardData, updated_at: row.updated_at as string };
}

function digest(profile: string, entry: RosterEntry, blobAgent: Agent | undefined): AgentDigest {
  const g = blobAgent ? tryGrade(blobAgent) : null;
  return {
    name: entry.name,
    slug: entry.slug,
    section: entry.section,
    gradingArchetype: archetypeFor(entry),
    attribute: entry.attribute,
    faction: entry.faction,
    title: entry.title,
    mindscape: displayMindscape(profile, blobAgent?.mindscape ?? entry.mindscape),
    level: blobAgent?.level,
    wengine: blobAgent?.wengine
      ? { name: blobAgent.wengine.name, rank: blobAgent.wengine.rank, refine: blobAgent.wengine.refine }
      : undefined,
    build: g
      ? {
          letter: g.buildLetter,
          pct: g.buildPct,
          sets: g.sets.note,
          suggestions: g.suggestions.map((s) => s.msg),
        }
      : null,
    sheet: blobAgent?.mainStats?.map((m) => ({ stat: m.stat, value: m.value })),
    scalesOn: blobAgent?.relevant,
  };
}

async function main() {
  const dir = path.join(process.cwd(), "public", "coach");
  await fs.mkdir(dir, { recursive: true });
  const generated = new Date().toISOString();

  // roster.json — live-blob digests, per profile, stamped with BOTH clocks (deploy + data).
  const rosterOut: Record<string, unknown> = {};
  for (const p of PROFILES) {
    const { data, updated_at } = await fetchRow(p);
    const byName = new Map(data.agents.map((a) => [a.name, a]));
    rosterOut[p] = {
      label: PROFILE_LABEL[p],
      blobUpdatedAt: updated_at,
      agents: rosterFor(p).map((r) => digest(p, r, byName.get(r.name))),
    };
  }
  await fs.writeFile(
    path.join(dir, "roster.json"),
    JSON.stringify({ generated, profiles: rosterOut }, null, 2) + "\n",
  );

  // setlists.json — the editorial team shells, verbatim (benchmarks, room signals, cautions).
  const setlistsOut = Object.fromEntries(PROFILES.map((p) => [p, setlistsFor(p)]));
  await fs.writeFile(
    path.join(dir, "setlists.json"),
    JSON.stringify({ generated, profiles: setlistsOut }, null, 2) + "\n",
  );

  // Full two-way mirroring — every pack file exists under BOTH /coach/ and /data/.
  // Field sessions produced opposite failures (a /data/ fetch hiccup on one surface, a
  // provenance check bouncing /coach/ roster+setlists on another), so symmetry is the fix:
  // endgame exports copy INTO coach/ (export-endgame ran first in the prebuild chain),
  // roster/setlists/manifest copy OUT to data/.
  const dataDir = path.join(process.cwd(), "public", "data");
  await fs.mkdir(dataDir, { recursive: true });
  for (const f of ["shiyu.json", "assault.json"]) {
    await fs.copyFile(path.join(dataDir, f), path.join(dir, f));
  }
  for (const f of ["roster.json", "setlists.json"]) {
    await fs.copyFile(path.join(dir, f), path.join(dataDir, f));
  }

  // manifest.json — the pack's front door for machines.
  const manifest = {
    pack: "zzz-coach-pack",
    version: 1,
    generated,
    entry: `${BASE}/coach/COACH.md`,
    profiles: PROFILE_LABEL,
    data: {
      roster: {
        url: `${BASE}/coach/roster.json`,
        mirror: `${BASE}/data/roster.json`,
        note: "Build-time snapshot of the live roster blob; per-profile blobUpdatedAt inside. For fresher truth use data.liveRoster. Identical mirror at the data/ URL if one path fails.",
      },
      setlists: {
        url: `${BASE}/coach/setlists.json`,
        mirror: `${BASE}/data/setlists.json`,
        note: "Editorial team shells with A.-run benchmarks, room signals, and cautions. Identical mirror at the data/ URL if one path fails.",
      },
      shiyu: {
        url: `${BASE}/coach/shiyu.json`,
        mirror: `${BASE}/data/shiyu.json`,
        note: "Shiyu Defense log — cycles[0] is the current rotation; history is older, newest first. Identical mirror at the data/ URL if one path fails.",
      },
      assault: {
        url: `${BASE}/coach/assault.json`,
        mirror: `${BASE}/data/assault.json`,
        note: "Deadly Assault log — same shape convention as shiyu. Identical mirror at the data/ URL if one path fails.",
      },
      liveRoster: {
        url: `${SUPABASE_URL}/rest/v1/${SUPABASE_TABLE}?profile=eq.${PROFILE_KEY}&select=data,updated_at`,
        headers: { apikey: SUPABASE_ANON_KEY },
        note: "Live Supabase read (anon key is public + SELECT-only by design). Use when your surface can send headers; otherwise the roster.json snapshot + its blobUpdatedAt stamp is your floor.",
      },
    },
    freshness: {
      rule: "State the age of what you read. roster.json carries blobUpdatedAt; endgame JSONs carry generated. If the current in-game rotation is newer than the newest logged cycle, ask A. for room cards before drafting.",
    },
  };
  await fs.writeFile(path.join(dir, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");

  for (const p of PROFILES) {
    const r = rosterOut[p] as { agents: AgentDigest[]; blobUpdatedAt: string };
    const built = r.agents.filter((a) => a.build).length;
    console.log(`  ${p}: ${r.agents.length} agent(s), ${built} with builds · blob ${r.blobUpdatedAt}`);
  }
  console.log(`✓ public/coach/manifest.json + roster.json + setlists.json`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
