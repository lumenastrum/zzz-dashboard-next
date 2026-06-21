// Copy + rename the seeded ZZZ art from the parent `Gacha Dashboards/ZZZ *` folders
// into public/assets/{icons,tall} with slugified names the deck resolvers expect
// (element_*, type_*, faction_*, set_*, wengine_*, rank_*, wrank_*, equip_frame, <slug>.webp).
// `npm run stage`. Re-run whenever Andres seeds more art — it's idempotent (overwrites).
// Source filenames are wiki-style + URL-encoded (%26 = &, %27 = '); we decode then slugify.
import { promises as fs } from "fs";
import path from "path";

const ROOT = process.cwd();
const SRC = path.join(ROOT, ".."); // Gacha Dashboards/
const ICONS = path.join(ROOT, "public", "assets", "icons");
const TALL = path.join(ROOT, "public", "assets", "tall");

const slug = (s: string) =>
  decodeURIComponent(s).toLowerCase().replace(/['’]/g, "").replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
const strip = (f: string, pre: string, suf: string) => f.slice(pre.length, f.length - suf.length);

// Tall-portrait file core (Agent_<core>_Portrait.webp) → roster slug. Multi-word agents
// use concatenated slugs (Jane Doe → janedoe) to match roster.ts, so this needs to be explicit.
const PORTRAIT_SLUG: Record<string, string> = {
  Alice_Thymefield: "alice",
  Aria_Human: "aria",
  Astra_Yao: "astra",
  Burnice_White: "burnice",
  Cissia: "cissia",
  Dialyn: "dialyn",
  Ellen_Joe: "ellen",
  Evelyn_Chevalier: "evelyn",
  Hoshimi_Miyabi: "miyabi",
  Jane_Doe: "janedoe",
  Ju_Fufu: "jufufu",
  Lighter: "lighter",
  Lucia_Elowen: "lucia",
  Nangong_Yu: "nangongyu",
  Seed: "seed",
  "Soldier_0_-_Anby": "soldier0anby",
  Trigger: "trigger",
  Ukinami_Yuzuha: "yuzuha",
  Vivian_Banshee: "vivian",
  Yixuan: "yixuan",
  // newly-seeded agents not yet in roster.ts — slug guesses; rename here when documented
  Velina_Airgid: "velina",
  Ye_Shunguang: "yeshunguang",
  Ye_Shunguang_Enlightened_Mind: "yeshunguang_enlightened",
  Yidhari_Murphy: "yidhari",
};

interface Rule {
  dir: string;
  outDir: string;
  map: (file: string) => string | null;
}

const RULES: Rule[] = [
  { dir: "ZZZ Element Icons", outDir: ICONS, map: (f) => `element_${slug(strip(f, "Icon_", ".webp"))}.webp` },
  { dir: "ZZZ Agent Type Icons", outDir: ICONS, map: (f) => `type_${slug(strip(f, "Icon_", ".webp"))}.webp` },
  { dir: "ZZZ Faction icons", outDir: ICONS, map: (f) => `faction_${slug(strip(f, "Faction_", "_Icon.webp"))}.webp` },
  { dir: "ZZZ Disc Drive Sets", outDir: ICONS, map: (f) => `set_${slug(strip(f, "Drive_Disc_", "_Icon.webp"))}.webp` },
  { dir: "ZZZ W-Engines", outDir: ICONS, map: (f) => `wengine_${slug(strip(f, "W-Engine_", ".webp"))}.webp` },
  { dir: "ZZZ Agent Rank Icons", outDir: ICONS, map: (f) => `rank_${strip(f, "Icon_AgentRank_", ".webp")}.webp` },
  { dir: "ZZZ W-Engine Rank Icons", outDir: ICONS, map: (f) => `wrank_${strip(f, "Icon_Item_Rank_", ".webp")}.webp` },
  { dir: "ZZZ Disc Drive Layout", outDir: ICONS, map: (f) => (f === "Equipment_Menu_Screen.webp" ? "equip_frame.webp" : null) },
  {
    dir: "ZZZ tall portraits",
    outDir: TALL,
    // Known agents use the curated short slug; anything newly-seeded falls back to a
    // concatenated slug (no underscores, matching jane_doe→janedoe) so it still stages.
    // Rename in PORTRAIT_SLUG when the agent is documented in roster.ts.
    map: (f) => {
      const core = strip(f, "Agent_", "_Portrait.webp");
      const s = PORTRAIT_SLUG[core] ?? slug(core).replace(/_/g, "");
      return `${s}.webp`;
    },
  },
];

async function run(rule: Rule): Promise<{ dir: string; copied: number; skipped: string[] }> {
  const dir = path.join(SRC, rule.dir);
  let files: string[];
  try {
    files = await fs.readdir(dir);
  } catch {
    return { dir: rule.dir, copied: 0, skipped: ["(folder missing)"] };
  }
  await fs.mkdir(rule.outDir, { recursive: true });
  let copied = 0;
  const skipped: string[] = [];
  for (const f of files) {
    if (!f.toLowerCase().endsWith(".webp")) continue;
    const target = rule.map(f);
    if (!target) {
      skipped.push(f);
      continue;
    }
    await fs.copyFile(path.join(dir, f), path.join(rule.outDir, target));
    copied++;
  }
  return { dir: rule.dir, copied, skipped };
}

async function main() {
  let total = 0;
  for (const rule of RULES) {
    const r = await run(rule);
    total += r.copied;
    const note = r.skipped.length ? `  (skipped: ${r.skipped.join(", ")})` : "";
    console.log(`  ${r.copied.toString().padStart(2)} ← ${r.dir}${note}`);
  }
  console.log(`staged ${total} assets into public/assets/`);
}

main();
