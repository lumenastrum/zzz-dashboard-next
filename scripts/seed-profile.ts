// Clone an owned subset of one profile's builds into another profile's Supabase blob.
//
//   npm run seed-profile -- --to wife-zzz             # dry run (default --from andres-zzz)
//   npm run seed-profile -- --to wife-zzz --write     # push to Supabase
//
// Ownership comes from PROFILE_ROSTER[to] in roster.ts (a slug list). Only agents that BOTH
// (a) appear in that list AND (b) have a real build in --from get cloned. Owned agents with no
// source build (e.g. Yanagi — not on A.'s account — or Zhao — never imported) are left out
// of the blob → their decks render the identity card until real discs are entered/imported.
import { getSupabase, SUPABASE_TABLE } from "../src/lib/supabase";
import { ROSTER, PROFILE_ROSTER } from "../src/lib/roster";
import type { Agent, DashboardData } from "../src/lib/types";

// Browser-tab / blob title per target profile (hers reads "Cosmea's", his stays default).
const META_TITLE: Record<string, string> = {
  "wife-zzz": "Cosmea's ZZZ · Soundsystem",
};

// Replace an agent's W-engine WHOLESALE (drops the source signature's base/passive/advanced so a
// borrowed A-rank doesn't inherit a stale combat buff). No-op if the agent isn't in the blob.
function setWengine(a: Agent | undefined, name: string, rank: string, refine: string) {
  if (a) a.wengine = { name, rank, refine };
}

// Target-specific seed adjustments applied AFTER cloning the source builds: real gear on the
// target account that differs from the source (A.), plus placeholder builds for agents the
// source doesn't own. One-time bootstrap — she edits the rest in-app.
const SEED_ADJUST: Record<string, (agents: Agent[]) => void> = {
  "wife-zzz": (agents) => {
    const by = (n: string) => agents.find((a) => a.name === n);
    // Cosmea's A-rank W-engines (not A.'s signatures).
    setWengine(by("Lucia"), "Kaboom the Cannon", "A", "R3");
    setWengine(by("Vivian"), "Weeping Gemini", "A", "R2");
    setWengine(by("Ju Fufu"), "Precious Fossilized Core", "A", "R5");
    // Yanagi: source has no Yanagi build, so seed her DISC SET from Vivian's (placeholder — adjusted
    // manually) with Yanagi's own identity + W-engine. mainStats/base omitted so the character screen
    // doesn't show Vivian's numbers under Yanagi's name; the disc grade still lights up.
    const vivian = by("Vivian");
    if (vivian?.discs?.pieces?.length) {
      agents.push({
        name: "Yanagi",
        section: "ANOMALY",
        attribute: "Electric",
        faction: "Hollow Special Operations Section 6",
        rank: "S",
        mindscape: "M0",
        level: 60,
        discs: JSON.parse(JSON.stringify(vivian.discs)),
        wengine: { name: "Weeping Gemini", rank: "A", refine: "R1" },
      });
    }
  },
};

function arg(name: string, fallback?: string): string | undefined {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  if (hit) return hit.slice(`--${name}=`.length);
  const idx = process.argv.indexOf(`--${name}`);
  if (idx !== -1 && process.argv[idx + 1] && !process.argv[idx + 1].startsWith("--")) {
    return process.argv[idx + 1];
  }
  return fallback;
}

async function loadBlob(supa: ReturnType<typeof getSupabase>, profile: string): Promise<DashboardData | null> {
  const { data: row, error } = await supa!.from(SUPABASE_TABLE).select("data").eq("profile", profile).maybeSingle();
  if (error) throw error;
  return (row?.data as DashboardData) ?? null;
}

async function main() {
  const from = arg("from", "andres-zzz")!;
  const to = arg("to")!;
  const write = process.argv.includes("--write");
  if (!to) throw new Error("--to <profile> is required (e.g. --to wife-zzz)");

  const slugs = PROFILE_ROSTER[to];
  if (!slugs) throw new Error(`No PROFILE_ROSTER entry for "${to}" — add the owned slug list in roster.ts first.`);

  // slug list → owned agent NAMES (the deck key), via ROSTER.
  const slugToName = new Map(ROSTER.map((r) => [r.slug, r.name]));
  const ownedNames = new Set(slugs.map((s) => slugToName.get(s)).filter(Boolean) as string[]);
  const unmapped = slugs.filter((s) => !slugToName.has(s));
  if (unmapped.length) console.warn(`  ⚠ slugs with no ROSTER entry (skipped): ${unmapped.join(", ")}`);

  const supa = getSupabase();
  if (!supa) throw new Error("No Supabase client");

  const src = await loadBlob(supa, from);
  if (!src) throw new Error(`No ${from} blob in Supabase to clone from.`);

  const cloned: Agent[] = JSON.parse(JSON.stringify(src.agents.filter((a) => ownedNames.has(a.name))));

  // Apply target-specific gear corrections + placeholder builds (e.g. Yanagi from Vivian's discs).
  SEED_ADJUST[to]?.(cloned);

  const clonedNames = new Set(cloned.map((a) => a.name));
  const ownedNoBuild = [...ownedNames].filter((n) => !clonedNames.has(n));

  const we = (a: Agent) => (a.wengine ? ` [${a.wengine.name} ${a.wengine.rank ?? "S"}·${a.wengine.refine ?? "R1"}]` : "");
  console.log(`\n● seed ${from} → ${to}`);
  console.log(`  owned (roster): ${ownedNames.size}  ·  builds in blob: ${cloned.length}`);
  console.log(`  builds:`);
  for (const a of cloned) console.log(`    ${a.name.padEnd(14)}${we(a)}`);
  console.log(`  no build: ${ownedNoBuild.join(", ") || "(none)"}  → identity-only decks (fill later)`);

  const existing = await loadBlob(supa, to);
  if (existing) {
    console.log(`  ⚠ ${to} ALREADY EXISTS with ${existing.agents?.length ?? 0} agent(s) — this OVERWRITES it.`);
  }

  const blob: DashboardData = {
    meta: {
      title: META_TITLE[to] ?? src.meta?.title ?? "Zenless Zone Zero · Soundsystem",
      updated: new Date().toISOString().slice(0, 10),
      totalAgents: cloned.length,
      maxLevel: src.meta?.maxLevel ?? 60,
    },
    agents: cloned,
  };

  if (!write) {
    console.log(`\nDRY RUN — pass --write to upsert ${to}.\n`);
    return;
  }

  const { error } = await supa
    .from(SUPABASE_TABLE)
    .upsert({ profile: to, data: blob, updated_at: new Date().toISOString() }, { onConflict: "profile" });
  if (error) throw error;
  console.log(`\n✓ Wrote ${to} → ${cloned.length} cloned build(s).\n`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
