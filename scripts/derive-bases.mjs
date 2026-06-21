// Derive each agent's hidden BASE stats from their seed (sheet - discs, inverting the ZZZ formulas)
// and write agent.base into public/data.json. Then computeSheet(base, discs) reproduces the seed AND
// responds to live disc edits. base folds in W-Engine/core/sheet-set sources (constant per agent).
//   node scripts/derive-bases.mjs            # dry run + self-consistency check
//   node scripts/derive-bases.mjs --write    # persist agent.base into data.json
import fs from "node:fs";
import { discAccum, computeSheet } from "../src/lib/grading/grading.js";

const write = process.argv.includes("--write");
const cfg = JSON.parse(fs.readFileSync(new URL("../src/lib/grading/grading-config.json", import.meta.url)));
const path = new URL("../public/data.json", import.meta.url);
const data = JSON.parse(fs.readFileSync(path));
const num = (v) => (typeof v === "number" ? v : parseFloat(String(v).replace(/[^0-9.\-]/g, "")) || 0);

let worstErr = 0, worstWho = "";
for (const agent of data.agents) {
  const s = Object.fromEntries((agent.mainStats || []).map((r) => [r.stat, num(r.value)]));
  const d = discAccum(agent.discs?.pieces || [], cfg);
  // invert per stat (full precision — no rounding, so computeSheet reproduces the seed exactly)
  agent.base = {
    "ATK": (s["ATK"] - d.flatAtk) / (1 + d.atkPct / 100),
    "HP": (s["HP"] - d.flatHp) / (1 + d.hpPct / 100),
    "DEF": (s["DEF"] - d.flatDef) / (1 + d.defPct / 100),
    "CRIT Rate": (s["CRIT Rate"] ?? 5) - d.crPct,
    "CRIT DMG": (s["CRIT DMG"] ?? 50) - d.cdPct,
    "Anomaly Proficiency": (s["Anomaly Proficiency"] ?? 0) - d.apFlat,
    "Anomaly Mastery": (s["Anomaly Mastery"] ?? 0) / (1 + d.amPct / 100),
    "Impact": (s["Impact"] ?? 0) / (1 + d.impactPct / 100),
    "Energy Regen": (s["Energy Regen"] ?? 0) / (1 + d.erPct / 100),
    "PEN Ratio": (s["PEN Ratio"] ?? 0) - d.penRatio,
  };
  // round bases for storage compactness, but keep enough precision that the forward reproduces the seed
  for (const k of Object.keys(agent.base)) agent.base[k] = +agent.base[k].toFixed(3);
  // self-consistency: computeSheet must reproduce the seed for the agent's relevant stats
  const fwd = computeSheet(agent, cfg);
  for (const k of (agent.relevant || [])) {
    if (s[k] == null || fwd[k] == null) continue;
    const err = Math.abs(fwd[k] - s[k]);
    if (err > worstErr) { worstErr = err; worstWho = `${agent.name}.${k} (seed ${s[k]} vs fwd ${fwd[k]})`; }
  }
}

console.log(`Derived base for ${data.agents.length} agents.`);
console.log(`Worst self-consistency error: ${worstErr} @ ${worstWho}`);
console.log(worstErr <= 1 ? "✓ within rounding (<=1) — recompute reproduces the seed" : "✗ FORMULA MISMATCH — investigate");
if (write) { fs.writeFileSync(path, JSON.stringify(data, null, 2) + "\n"); console.log("✓ wrote agent.base into public/data.json"); }
else console.log("DRY RUN — pass --write to persist.");
