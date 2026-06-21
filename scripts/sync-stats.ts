// Push each agent's `mainStats` + `relevant` from public/data.json INTO the andres-zzz Supabase
// blob — the live source of truth the deck reads. Authoring stays in data.json (the seed); this
// is the one-directional seed→blob migration, run after editing mainStats in data.json.
//
//   npm run sync-stats            # dry run — shows what would change
//   npm run sync-stats -- --write # push to Supabase
//
// NOTE: this OVERWRITES mainStats/relevant on the blob from the seed. Safe while stats aren't
// browser-editable. Once they ARE editable → Supabase, the blob becomes sole truth and this
// stops being run (or switch to fill-missing). Disc/W-engine fields are never touched.
import { promises as fs } from "fs";
import path from "path";
import { getSupabase, PROFILE_KEY, SUPABASE_TABLE } from "../src/lib/supabase";

interface SeedAgent {
  name: string;
  mainStats?: { stat: string; value: string }[];
  relevant?: string[];
  base?: Record<string, number>;
}

async function main() {
  const write = process.argv.includes("--write");
  const seedPath = path.join(process.cwd(), "public", "data.json");
  const seed = JSON.parse(await fs.readFile(seedPath, "utf-8")) as { agents: SeedAgent[] };
  const seedByName = new Map(seed.agents.map((a) => [a.name, a]));

  const supa = getSupabase();
  if (!supa) throw new Error("No Supabase client");
  const { data: row, error } = await supa
    .from(SUPABASE_TABLE)
    .select("data")
    .eq("profile", PROFILE_KEY)
    .maybeSingle();
  if (error) throw error;
  if (!row?.data) throw new Error(`No ${PROFILE_KEY} blob in Supabase — load the app once to seed it.`);

  const blob = row.data as { agents: SeedAgent[] };
  const synced: string[] = [];
  for (const a of blob.agents) {
    const s = seedByName.get(a.name);
    if (!s?.mainStats) continue;
    a.mainStats = s.mainStats;
    if (s.relevant) a.relevant = s.relevant;
    if (s.base) a.base = s.base; // derived hidden base stats → enables live disc→sheet recompute
    synced.push(a.name);
  }
  console.log(`agents with mainStats → ${synced.length}: ${synced.join(", ") || "(none)"}`);
  if (!write) {
    console.log("DRY RUN — pass --write to push to Supabase.");
    return;
  }
  const { error: upErr } = await supa
    .from(SUPABASE_TABLE)
    .upsert(
      { profile: PROFILE_KEY, data: blob, updated_at: new Date().toISOString() },
      { onConflict: "profile" },
    );
  if (upErr) throw upErr;
  console.log(`✓ Pushed mainStats/relevant → Supabase (${PROFILE_KEY}).`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
