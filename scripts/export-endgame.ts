// Serialize the in-code editorial endgame logs (shiyu.ts / assault.ts) to static JSON under
// public/data/, so every GH Pages deploy publishes them at stable, curl-able URLs:
//
//   https://lumenastrum.github.io/zzz-dashboard-next/data/shiyu.json
//   https://lumenastrum.github.io/zzz-dashboard-next/data/assault.json
//
// Wired as `prebuild` (runs on every `npm run build`, including the Pages workflow), so the
// JSON can never drift from the TS source. public/data/ is gitignored — generated artifact.
//
// Roster/discs/stats are deliberately NOT exported here: their truth is the Supabase blob,
// and a committed snapshot would create a second, stale truth. Pull those via Supabase REST
// (see docs/couch-clio-data-access.md) or `npm run peek`.
import { promises as fs } from "fs";
import path from "path";
import { PROFILE_KEY, PROFILE_WIFE } from "../src/lib/supabase";
import { shiyuCyclesFor, shiyuHistoryFor } from "../src/lib/shiyu";
import { assaultCyclesFor, assaultHistoryFor } from "../src/lib/assault";

const PROFILES = [PROFILE_KEY, PROFILE_WIFE];

async function main() {
  const dir = path.join(process.cwd(), "public", "data");
  await fs.mkdir(dir, { recursive: true });

  const generated = new Date().toISOString();
  const shiyu = {
    generated,
    profiles: Object.fromEntries(
      PROFILES.map((p) => [p, { cycles: shiyuCyclesFor(p), history: shiyuHistoryFor(p) }]),
    ),
  };
  const assault = {
    generated,
    profiles: Object.fromEntries(
      PROFILES.map((p) => [p, { cycles: assaultCyclesFor(p), history: assaultHistoryFor(p) }]),
    ),
  };

  await fs.writeFile(path.join(dir, "shiyu.json"), JSON.stringify(shiyu, null, 2) + "\n");
  await fs.writeFile(path.join(dir, "assault.json"), JSON.stringify(assault, null, 2) + "\n");

  for (const p of PROFILES) {
    const s = shiyu.profiles[p];
    const a = assault.profiles[p];
    console.log(
      `  ${p}: shiyu ${s.cycles.length} cycle(s) + ${s.history.length} history · assault ${a.cycles.length} cycle(s) + ${a.history.length} history`,
    );
  }
  console.log(`✓ public/data/shiyu.json + assault.json`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
