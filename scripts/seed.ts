// Generate public/data.json (the Supabase seed) from the canonical roster source.
// `npm run seed`. Supabase becomes the source of truth once the row exists; this seed
// only loads when the row is missing, so re-run it whenever the bundled baseline should
// change. Mirrors WuWa's "data.json is the seed, not the truth" model.
import { promises as fs } from "fs";
import path from "path";
import { ALICE } from "../src/lib/roster";
import type { DashboardData } from "../src/lib/types";

const data: DashboardData = {
  meta: {
    title: "Zenless Zone Zero · Soundsystem",
    updated: new Date().toISOString().slice(0, 10),
    totalAgents: 1,
    maxLevel: 60,
  },
  // Only Alice has a full ported build for now — other agents grade once their
  // pieces are entered (CLI/edit) and land in the Supabase blob.
  agents: [ALICE],
};

async function main() {
  const out = path.join(process.cwd(), "public", "data.json");
  await fs.writeFile(out, JSON.stringify(data, null, 2) + "\n", "utf-8");
  console.log(`seeded ${out} → ${data.agents.length} agent(s)`);
}

main();
