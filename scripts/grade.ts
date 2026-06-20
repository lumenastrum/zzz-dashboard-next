// Headless grade print — `npm run grade`. The CLI mirror of the dashboard's numbers.
// Mirrors WuWa's scripts/ pattern (tsx). Extend later with setdisc/swapdisc + Supabase writes.
import { ALICE } from "../src/lib/roster";
import { gradeBuild, computeStats, GRADING_CONFIG } from "../src/lib/grading";

const g = gradeBuild(ALICE, GRADING_CONFIG);
const s = computeStats(ALICE, GRADING_CONFIG);

console.log(`\n${g.agent} · ${g.archetypeLabel ?? g.archetype} · BUILD ${g.buildLetter} (${g.buildPct}%)`);
for (const d of g.discs) {
  console.log(`  Slot ${d.slot}  ${String(d.letter).padEnd(3)}  ${d.pct}%  ${d.set ?? ""} · ${d.mainStat ?? ""}`);
}
console.log("  SETS:", g.sets.note);
console.log("  SUGGEST:", g.suggestions.map((x) => x.msg).join(" | "));
console.log("\n  STAT SHEET (sheet → effective):");
for (const [k, v] of Object.entries(s.stats)) {
  console.log(`    ${k.padEnd(22)} ${v.sheet}${v.combat ? ` → ${v.effective} (+${v.combat} combat)` : ""}`);
}
console.log("  BUFFS:", s.buffs.map((b) => `${b.label} [${b.src}]`).join(" | "), "\n");
