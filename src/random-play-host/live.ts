// Live adapters: the Supabase blob (one Agent per built character, discs as `discs.pieces`) → Random
// Play's contracts, graded by the dashboard's own engine on every call. The framework never sees the
// blob; the host re-runs these whenever the blob changes, which is what makes a disc edit re-grade the
// tape, move the cover's RATED card, the Specs sheet and the breakpoint gauges in the same render.
//
// Ported from random-play/scripts/build-details.ts (which ran the same maths through `npm run peek`);
// skills + core still come from the vendored June showcase snapshot (they aren't in the blob yet) and
// are labelled as such on the Chapters tab.
import { computeSheet, computeStats, gradeBuild, GRADING_CONFIG, type BuildGrade, type SetActive } from "@/lib/grading";
import { fmtStat } from "@/lib/deck-config";
import { displayMindscape, type RosterEntry } from "@/lib/roster";
import type { Agent as BlobAgent } from "@/lib/types";
import type { Agent, BuildDetail, Disc, Element, Goal, Grade, Section, StatRow } from "@/random-play";
import { SPINE_NAME } from "@/random-play/data/meta";
import { BUILD_DETAILS } from "@/random-play/data/fixtures/builds";

interface Cfg {
  agentOverrides?: Record<string, { targets?: Record<string, { target: number; full: number; cap?: number }> }>;
  setEffects?: Record<string, Record<string, { label: string }[]>>;
  discMains?: Record<string, Record<string, number>>;
}
const cfg = GRADING_CONFIG as unknown as Cfg;

// The dashboard scale runs E → SSS; the store's stickers stop at S. SS/SSS are still S-tier, so they fold
// into S and the exact % rides along on every card.
const letter = (l: string): Grade => (l.startsWith("S") ? "S" : (l as Grade));
const fmtVal = (v: number | string) => (typeof v === "number" ? v.toLocaleString("en-US") : v);
const num = (v: string | number | undefined) => (v == null ? NaN : Number(String(v).replace(/[,%]/g, "")));
const PCT_STATS = new Set(["CRIT Rate", "CRIT DMG", "PEN Ratio"]);
const show = (stat: string, v: number) => `${Number.isInteger(v) ? v.toLocaleString("en-US") : v.toFixed(1)}${PCT_STATS.has(stat) ? "%" : ""}`;
const WORDS = ["no", "one", "two", "three", "four", "five", "six"];

export function tryGrade(a: BlobAgent | undefined): BuildGrade | null {
  if (!a?.discs?.pieces?.length) return null;
  try { return gradeBuild(a, GRADING_CONFIG); } catch { return null; }
}

/** Character-screen rows: the seeded `mainStats` with the live recompute overlaid, exactly as the deck shows them. */
export function liveSheet(a: BlobAgent | undefined): StatRow[] {
  if (!a?.mainStats?.length) return [];
  let live: Record<string, number> | null = null;
  if (a.base && a.discs?.pieces?.length) { try { live = computeSheet(a, GRADING_CONFIG); } catch { live = null; } }
  return a.mainStats.map((r) => (live && live[r.stat] != null ? { stat: r.stat, value: fmtStat(r.stat, live[r.stat]) } : { stat: r.stat, value: String(r.value) }));
}

/** One tape on the wall, from the roster entry (identity) + the blob agent (build). */
export function liveAgent(entry: RosterEntry, blob: BlobAgent | undefined, profileKey: string): Agent {
  const g = tryGrade(blob);
  const ms = displayMindscape(profileKey, blob?.mindscape ?? entry.mindscape, entry.name);
  return {
    slug: entry.slug,
    name: entry.name,
    spine: SPINE_NAME[entry.slug] ?? entry.name,
    section: entry.section as Section,
    attribute: entry.attribute as Element,
    faction: entry.faction ?? "",
    title: entry.title ?? "",
    mindscape: Number(String(ms).replace(/\D/g, "")) || 0,
    grade: g ? letter(g.buildLetter) : undefined,
    pct: g?.buildPct,
    engine: blob?.wengine ? { name: blob.wengine.name, rank: blob.wengine.rank ?? "S", refine: blob.wengine.refine ?? "R1" } : undefined,
    sets: g?.sets.note,
    suggestion: g?.suggestions[0]?.msg,
    scalesOn: blob?.relevant ?? [],
    sheet: liveSheet(blob),
  };
}

function goals(name: string, relevant: string[], sheet: StatRow[]): Goal[] | undefined {
  const targets = cfg.agentOverrides?.[name]?.targets;
  if (!targets) return undefined;
  // at most 3 gauges fit the Specs column: stats the agent scales on come first, in her own order
  const order = Object.keys(targets).sort((a, b) => (relevant.includes(a) ? relevant.indexOf(a) : 99) - (relevant.includes(b) ? relevant.indexOf(b) : 99));
  const out: Goal[] = [];
  for (const stat of order) {
    const t = targets[stat];
    const value = num(sheet.find((r) => r.stat === stat)?.value);
    if (!Number.isFinite(value)) continue; // stat not on the sheet → no gauge, never a guess
    const step = t.full < 10 ? 0.1 : 1; // Energy Regen lives in 1–4: integer rounding would flatten the gauge
    const min = Math.floor(Math.min(t.target * 0.8, value * 0.95) / step) * step;
    const max = Math.ceil((Math.max(t.full, value) * 1.045) / step) * step;
    let note: string;
    if (t.cap != null && value >= t.cap) note = `At the ${show(stat, t.cap)} cap: extra ${stat} is wasted, so the grader moves the weight elsewhere.`;
    else if (value >= t.full) note = `Past full marks by ${show(stat, +(value - t.full).toFixed(1))}.`;
    else if (value >= t.target) note = `Past the ${show(stat, t.target)} target. ${show(stat, +(t.full - value).toFixed(1))} more to full marks.`;
    else note = `${show(stat, +(t.target - value).toFixed(1))} short of the ${show(stat, t.target)} target.`;
    out.push({ stat, value, target: t.target, full: t.full, min, max, targetLabel: `${show(stat, t.target)} TARGET`, fullLabel: `${show(stat, t.full)} FULL`, note });
    if (out.length === 3) break;
  }
  return out.length ? out : undefined;
}

function setNote(active: SetActive[]): string {
  const four = active.find((a) => a.pc >= 4);
  const pick = four ?? active[0];
  if (!pick) return "No set bonus active.";
  const fx = cfg.setEffects?.[pick.set]?.[four ? "4pc" : "2pc"];
  return fx?.length ? `${four ? "4pc" : "2pc"}: ${fx.map((e) => e.label).join(" · ")}` : `${pick.set} ${pick.pc}pc (effect text not in the grading config).`;
}

function ratingLine(discs: Disc[]): string {
  const weak = discs.filter((d) => ["C", "D", "E"].includes(d.grade)).map((d) => `0${d.slot}`);
  if (!weak.length) return "No weak discs: every scene grades B or better.";
  return `Contains ${WORDS[weak.length]} weak disc${weak.length > 1 ? "s" : ""} (Scene${weak.length > 1 ? "s" : ""} ${weak.join(", ")}).`;
}

/** Deep build data for one tape. Live from the blob where the blob has it; the vendored snapshot fills skills/core
 *  (and, for a tape with no blob build, its hand-built discs, read-only). Undefined = honest placeholders. */
export function liveDetail(entry: RosterEntry, blob: BlobAgent | undefined): BuildDetail | undefined {
  const fx = BUILD_DETAILS[entry.slug] as BuildDetail | undefined;
  const g = tryGrade(blob);
  const sheet = liveSheet(blob);
  const d: BuildDetail = { slug: entry.slug, sheetSource: blob?.base ? "DASHBOARD BLOB · LIVE SHEET" : "DASHBOARD BLOB · SEEDED SHEET" };
  if (sheet.length) d.sheet = sheet;
  else if (fx?.sheet) { d.sheet = fx.sheet; d.sheetSource = fx.sheetSource; }

  if (g && blob?.discs?.pieces?.length) {
    d.discSource = "DASHBOARD BLOB · LIVE";
    d.discs = blob.discs.pieces
      .map((pc) => {
        const gd = g.discs.find((x) => x.slot === pc.slot);
        return {
          slot: pc.slot as Disc["slot"], set: pc.set, grade: gd ? letter(gd.letter) : ("E" as Grade), pct: gd?.pct ?? 0,
          main: { stat: pc.main.stat, value: fmtVal(pc.main.value) },
          subs: pc.subs.map((s) => ({ stat: s.stat, rolls: s.rolls, relevant: !!gd?.subs.find((x) => x.stat === s.stat)?.useful })),
        };
      })
      .sort((x, y) => x.slot - y.slot);
    d.weakestSlot = d.discs.reduce((w, x) => (x.pct < w.pct ? x : w)).slot;
    d.ratingLine = ratingLine(d.discs);
    try {
      const opts = blob.mainStats?.length ? { sheet: Object.fromEntries(blob.mainStats.map((r) => [r.stat, r.value])), stats: blob.relevant } : undefined;
      const st = computeStats(blob, GRADING_CONFIG, opts);
      const eng = st.buffs.filter((b) => b.src === blob.wengine?.name).map((b) => b.label);
      if (eng.length) d.engineBuffs = eng;
      if (st.sets.active.length) d.setBonus = { sets: st.sets.active.map((s) => ({ name: s.set, pieces: s.count })), note: setNote(st.sets.active) };
    } catch { /* stats are decoration on the Specs tab; the discs already graded */ }
  } else if (fx?.discs) {
    d.discs = fx.discs; d.discSource = fx.discSource; d.weakestSlot = fx.weakestSlot; d.ratingLine = fx.ratingLine;
    d.engineBuffs = fx.engineBuffs; d.setBonus = fx.setBonus;
  }

  d.goals = goals(entry.name, blob?.relevant ?? [], d.sheet ?? []) ?? fx?.goals;
  if (fx?.skills) { d.skills = fx.skills; d.skillSource = fx.skillSource; }
  if (fx?.core) d.core = fx.core;
  return d.discs || d.sheet || d.skills ? d : undefined;
}

/** The +15 S-rank main value for a slot's stat (grading-config `discMains`), formatted like the blob stores it:
 *  Anomaly Proficiency is flat, every other editable main is a percent. */
export function mainValueFor(slot: number, stat: string): number | string | undefined {
  // the config keys every slot-5 element bonus as one "Attribute DMG" entry
  const v = cfg.discMains?.[String(slot)]?.[/ DMG$/.test(stat) ? "Attribute DMG" : stat];
  if (v == null) return undefined;
  return stat === "Anomaly Proficiency" ? v : `${v}%`;
}
