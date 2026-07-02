// Read-only data peek — the CLI window into the Soundsystem for terminal Clios (Couch-Clio
// et al.) and anyone who'd rather not squint at screenshots. Pulls the LIVE Supabase blob
// (roster / discs / stats — the source of truth) and the in-code editorial endgame logs
// (shiyu.ts / assault.ts). Never writes anything.
//
//   npm run peek                          # roster summary, graded (default profile andres-zzz)
//   npm run peek -- roster --json         # full raw agents array (discs, subs, everything)
//   npm run peek -- agent alice           # one agent: discs + substats + grades + stat sheet
//   npm run peek -- shiyu                 # Shiyu Defense cycles + history
//   npm run peek -- assault               # Deadly Assault cycles + history
//   npm run peek -- blob --json           # the untouched Supabase row (data + updated_at)
//   npm run peek -- profiles              # every profile row in the table (incl. legacy)
//   --profile wife-zzz                    # works on any subcommand
//
// No-clone access (plain curl against Supabase REST / GH Pages JSON):
// see docs/couch-clio-data-access.md.
import { getSupabase, SUPABASE_TABLE, PROFILE_KEY } from "../src/lib/supabase";
import { ROSTER, rosterFor, displayMindscape } from "../src/lib/roster";
import { gradeBuild, computeStats, GRADING_CONFIG, type BuildGrade, type StatsResult } from "../src/lib/grading";
import { shiyuCyclesFor, shiyuHistoryFor } from "../src/lib/shiyu";
import { assaultCyclesFor, assaultHistoryFor, cyclePips } from "../src/lib/assault";
import type { Agent, DashboardData } from "../src/lib/types";

function arg(name: string, fallback?: string): string | undefined {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  if (hit) return hit.slice(`--${name}=`.length);
  const idx = process.argv.indexOf(`--${name}`);
  if (idx !== -1 && process.argv[idx + 1] && !process.argv[idx + 1].startsWith("--")) {
    return process.argv[idx + 1];
  }
  return fallback;
}

const JSON_MODE = process.argv.includes("--json");
const PROFILE = arg("profile", PROFILE_KEY)!;

// Positional args = everything after the script path that isn't a flag or a flag's value.
function positionals(): string[] {
  const out: string[] = [];
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith("--")) {
      if (!argv[i].includes("=") && argv[i + 1] && !argv[i + 1].startsWith("--")) i++;
      continue;
    }
    out.push(argv[i]);
  }
  return out;
}

async function fetchRow(profile: string): Promise<{ data: DashboardData; updated_at: string } | null> {
  const supa = getSupabase();
  if (!supa) throw new Error("No Supabase client");
  const { data: row, error } = await supa
    .from(SUPABASE_TABLE)
    .select("data,updated_at")
    .eq("profile", profile)
    .maybeSingle();
  if (error) throw error;
  return row ? { data: row.data as DashboardData, updated_at: row.updated_at as string } : null;
}

// Grading throws on identity-only agents (no discs) — a null grade renders as "—".
function tryGrade(a: Agent): BuildGrade | null {
  if (!a.discs?.pieces?.length) return null;
  try {
    return gradeBuild(a, GRADING_CONFIG);
  } catch {
    return null;
  }
}

function tryStats(a: Agent): StatsResult | null {
  try {
    return computeStats(a, GRADING_CONFIG);
  } catch {
    return null;
  }
}

function emit(obj: unknown) {
  console.log(JSON.stringify(obj, null, 2));
}

const pad = (s: unknown, n: number) => String(s ?? "").padEnd(n);
const num = (n: number) => n.toLocaleString("en-US");

async function cmdRoster() {
  const row = await fetchRow(PROFILE);
  if (!row) throw new Error(`No "${PROFILE}" row in ${SUPABASE_TABLE}.`);
  const { data, updated_at } = row;
  if (JSON_MODE) {
    emit({ profile: PROFILE, updated_at, meta: data.meta, agents: data.agents });
    return;
  }
  const byName = new Map(data.agents.map((a) => [a.name, a]));
  console.log(`\n● ${PROFILE} · "${data.meta?.title ?? "?"}" · blob updated ${updated_at}`);
  console.log(`  ${pad("AGENT", 16)}${pad("SECTION", 9)}${pad("ATTR", 11)}${pad("MS", 4)}${pad("LV", 4)}${pad("W-ENGINE", 30)}BUILD`);
  for (const r of rosterFor(PROFILE)) {
    const a = byName.get(r.name);
    const g = a ? tryGrade(a) : null;
    const we = a?.wengine ? `${a.wengine.name} ${a.wengine.rank ?? "S"}·${a.wengine.refine ?? "R1"}` : "—";
    const build = g ? `${g.buildLetter} (${g.buildPct}%)` : a ? "no discs" : "identity only";
    console.log(
      `  ${pad(r.name, 16)}${pad(r.section, 9)}${pad(r.attribute, 11)}${pad(displayMindscape(PROFILE, r.mindscape), 4)}${pad(a?.level ?? "—", 4)}${pad(we, 30)}${build}`,
    );
  }
  // Blob agents missing from the static roster (shouldn't happen, but surface rather than hide).
  const rosterNames = new Set(rosterFor(PROFILE).map((r) => r.name));
  const orphans = data.agents.filter((a) => !rosterNames.has(a.name));
  if (orphans.length) console.log(`  ⚠ in blob but not in ROSTER: ${orphans.map((a) => a.name).join(", ")}`);
  console.log(`  ${data.agents.length} build(s) in blob · ${rosterFor(PROFILE).length} agent(s) on roster\n`);
}

async function cmdAgent(query: string) {
  const row = await fetchRow(PROFILE);
  if (!row) throw new Error(`No "${PROFILE}" row in ${SUPABASE_TABLE}.`);
  const q = query.toLowerCase();
  const bySlug = ROSTER.find((r) => r.slug === q)?.name;
  const agent = row.data.agents.find(
    (a) => a.name.toLowerCase() === q || a.name === bySlug,
  );
  if (!agent) {
    const names = row.data.agents.map((a) => a.name).join(", ");
    throw new Error(`No build for "${query}" in ${PROFILE}. Builds: ${names}`);
  }
  const g = tryGrade(agent);
  const s = tryStats(agent);
  if (JSON_MODE) {
    emit({ profile: PROFILE, updated_at: row.updated_at, agent, grade: g, stats: s });
    return;
  }
  console.log(`\n● ${agent.name} · ${agent.section} · ${agent.attribute} · ${agent.rank ?? "?"}-rank ${agent.mindscape ?? ""} · Lv.${agent.level ?? "?"}`);
  if (agent.wengine) {
    console.log(`  W-ENGINE  ${agent.wengine.name} (${agent.wengine.rank ?? "S"} · ${agent.wengine.refine ?? "R1"})`);
  }
  if (agent.mainStats?.length) {
    console.log(`  SHEET     ${agent.mainStats.map((m) => `${m.stat} ${m.value}`).join(" · ")}`);
    if (agent.relevant?.length) console.log(`  SCALES ON ${agent.relevant.join(", ")}`);
  }
  if (agent.discs?.pieces?.length) {
    console.log(`  DISCS`);
    for (const p of agent.discs.pieces) {
      const gd = g?.discs.find((d) => d.slot === p.slot);
      const grade = gd ? `${pad(gd.letter, 4)}${String(gd.pct).padStart(3)}%` : "        ";
      console.log(`    [${p.slot}] ${grade}  ${pad(p.set, 22)} +${p.level ?? 15}  ${p.main.stat} ${p.main.value}`);
      for (const sub of p.subs) {
        console.log(`         ${pad("", 7)}· ${pad(sub.stat, 22)} ×${sub.rolls}${sub.value != null ? `  (${sub.value})` : ""}`);
      }
    }
    if (g) {
      console.log(`  SETS      ${g.sets.note}`);
      console.log(`  BUILD     ${g.buildLetter} (${g.buildPct}%)`);
      if (g.suggestions.length) console.log(`  SUGGEST   ${g.suggestions.map((x) => x.msg).join(" | ")}`);
    }
  } else {
    console.log(`  (no discs in blob — identity only)`);
  }
  if (s) {
    console.log(`  STATS (sheet → effective)`);
    for (const [k, v] of Object.entries(s.stats)) {
      console.log(`    ${pad(k, 24)}${v.sheet}${v.combat ? ` → ${v.effective} (+${v.combat} combat)` : ""}`);
    }
    if (s.buffs.length) console.log(`  BUFFS     ${s.buffs.map((b) => `${b.label} [${b.src}]`).join(" | ")}`);
  }
  console.log();
}

function cmdShiyu() {
  const cycles = shiyuCyclesFor(PROFILE);
  const history = shiyuHistoryFor(PROFILE);
  if (JSON_MODE) {
    emit({ profile: PROFILE, cycles, history });
    return;
  }
  console.log(`\n● Shiyu Defense — ${PROFILE}`);
  if (!cycles.length) console.log(`  (no editorial cycles for this profile)`);
  for (const c of cycles) {
    const grades = c.grades ? ` · grades S×${c.grades.s} A×${c.grades.a} B×${c.grades.b}` : "";
    console.log(`\n  CYCLE ${c.label} (${c.id})${c.date ? ` · unlocked ${c.date}` : ""}`);
    console.log(`    best ${num(c.bestTotal)} · top ${c.rank} · ${c.highestRating}${c.medal ? ` · medal: ${c.medal}` : ""}${grades}`);
    for (const t of c.targets) console.log(`    [${t.done ? "x" : " "}] ${t.rating}  ${t.desc}`);
    for (const r of c.rooms) {
      const boss = `${r.boss.tag ? `${r.boss.tag} - ` : ""}${r.boss.name} (Lv.${r.boss.level})`;
      console.log(`    Room ${r.room}  ${r.rating}  vs ${boss}`);
      console.log(`      rec: ${r.recommended.join("/") || "—"}${r.anomaly ? " (anomaly)" : ""} · res: ${r.resistance.join("/") || "—"}`);
      console.log(`      team: ${r.team.map((m) => m.name).join(", ")}${r.bangboo ? ` + ${r.bangboo.name}` : ""}`);
      console.log(`      score ${num(r.scores.total)} (dmg ${num(r.scores.damage)} / elim ${num(r.scores.elimination)})${r.time ? ` · ${r.time}` : ""}`);
    }
  }
  if (history.length) {
    console.log(`\n  HISTORY`);
    for (const h of history) {
      console.log(`    ${h.date}  ${pad(h.label, 22)}${pad(num(h.score), 9)}${pad(h.rating, 4)}S×${h.grades.s} A×${h.grades.a} B×${h.grades.b}`);
    }
  }
  console.log();
}

function cmdAssault() {
  const cycles = assaultCyclesFor(PROFILE);
  const history = assaultHistoryFor(PROFILE);
  if (JSON_MODE) {
    emit({ profile: PROFILE, cycles, history });
    return;
  }
  console.log(`\n● Deadly Assault — ${PROFILE}`);
  if (!cycles.length) console.log(`  (no editorial cycles for this profile)`);
  for (const c of cycles) {
    const pips = cyclePips(c);
    const medals = c.medals ? ` · medals crown×${c.medals.crown} shield×${c.medals.shield}` : "";
    console.log(`\n  CYCLE ${c.label} (${c.id})${c.date ? ` · from ${c.date}` : ""}`);
    console.log(`    best ${num(c.bestTotal)} · top ${c.rank} · pips ${pips.earned}/${pips.max}${medals}`);
    for (const r of c.rooms) {
      const boss = `${r.boss.tag ? `${r.boss.tag} - ` : ""}${r.boss.name} (Lv.${r.boss.level})`;
      console.log(`    Room ${r.room}  ${"●".repeat(r.pips)}${"○".repeat(3 - r.pips)}  vs ${boss}`);
      console.log(`      rec: ${r.recommended.join("/") || "—"}${r.specialty ? ` · specialty: ${r.specialty}` : ""} · res: ${r.resistance.join("/") || "None"}`);
      if (r.gimmick) console.log(`      gimmick: ${r.gimmick}`);
      if (r.buff) console.log(`      buff: ${r.buff.name}${r.buff.desc ? ` — ${r.buff.desc}` : ""}`);
      console.log(`      team: ${r.team.map((m) => m.name).join(", ")}${r.bangboo ? ` + ${r.bangboo.name}` : ""}`);
      console.log(`      score ${num(r.scores.total)} (dmg ${num(r.scores.damage)} / perf ${num(r.scores.performance)})`);
    }
  }
  if (history.length) {
    console.log(`\n  HISTORY`);
    for (const h of history) {
      console.log(`    ${h.date}  ${pad(h.label, 26)}${pad(num(h.score), 9)}top ${pad(h.rank, 7)}pips ${h.pips}`);
    }
  }
  console.log();
}

async function cmdBlob() {
  const row = await fetchRow(PROFILE);
  if (!row) throw new Error(`No "${PROFILE}" row in ${SUPABASE_TABLE}.`);
  emit({ profile: PROFILE, updated_at: row.updated_at, data: row.data });
}

async function cmdProfiles() {
  const supa = getSupabase();
  if (!supa) throw new Error("No Supabase client");
  const { data, error } = await supa.from(SUPABASE_TABLE).select("profile,updated_at").order("profile");
  if (error) throw error;
  if (JSON_MODE) {
    emit(data);
    return;
  }
  console.log(`\n● ${SUPABASE_TABLE} rows`);
  for (const r of data ?? []) console.log(`  ${pad(r.profile, 16)}updated ${r.updated_at}`);
  console.log();
}

async function main() {
  const [cmd = "roster", rest] = positionals();
  switch (cmd) {
    case "roster": return cmdRoster();
    case "agent":
      if (!rest) throw new Error(`Usage: npm run peek -- agent <name-or-slug> [--profile p] [--json]`);
      return cmdAgent(rest);
    case "shiyu": return cmdShiyu();
    case "assault": return cmdAssault();
    case "blob": return cmdBlob();
    case "profiles": return cmdProfiles();
    default:
      throw new Error(`Unknown subcommand "${cmd}". One of: roster, agent <name>, shiyu, assault, blob, profiles.`);
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
