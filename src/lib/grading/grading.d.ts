// Type surface for the shared grading engine (grading.js — validated plain ESM).
// Keeps the engine framework-agnostic while giving the Next app full DX.
import type { Agent, GradingConfig } from "@/lib/types";

export interface GradedSub {
  stat: string;
  rolls: number;
  weight: number;
  contrib: number;
  useful: boolean;
  dead: boolean;
}

export interface GradedDisc {
  slot: number;
  set: string | null;
  mainStat: string | null;
  mainPts: number;
  mainStatOk: boolean;
  rollScore: number;
  pct: number;
  letter: string;
  color: string;
  subs: GradedSub[];
}

export interface SetActive {
  set: string;
  count: number;
  pc: number;
  bonus: string | null;
}

export interface SetInfo {
  counts: Record<string, number>;
  active: SetActive[];
  ideal: boolean;
  note: string;
}

export interface Suggestion {
  type: "set" | "main" | "reroll" | "cap";
  slot?: number;
  stat?: string;
  msg: string;
}

export interface BuildGrade {
  agent: string;
  archetype: string;
  archetypeLabel?: string;
  buildPct: number;
  buildLetter: string;
  buildColor: string;
  discs: GradedDisc[];
  sets: SetInfo;
  suggestions: Suggestion[];
  /** Per-agent CRIT-Rate stat-screen ceiling (null if the agent has no cap). */
  critCap?: number | null;
  /** The seeded character-screen CRIT Rate read for the clamp (null if unseeded / no cap). */
  sheetCRIT?: number | null;
  /** True when sheetCRIT ≥ critCap — extra CRIT Rate is graded as dead weight. */
  capped?: boolean;
}

export interface StatLine {
  sheet: number;
  combat: number;
  effective: number;
  sources: Array<{ label: string; value: number; scope: string; src: string }>;
}

export interface StatBuff {
  label: string;
  kind: "stat" | "dmg" | "buildup";
  stat: string;
  value: number;
  scope: string;
  src: string;
}

export interface StatsResult {
  stats: Record<string, StatLine>;
  buffs: StatBuff[];
  sets: SetInfo;
}

export function resolveArchetype(agent: Agent, cfg: GradingConfig): unknown;
export function resolveWengine(we: Agent["wengine"] | null, cfg: GradingConfig): NonNullable<Agent["wengine"]> | null;
export function gradeDisc(piece: unknown, archetype: unknown, cfg: GradingConfig): GradedDisc;
export function computeSets(pieces: unknown[], cfg?: GradingConfig): SetInfo;
export function gradeBuild(agent: Agent, cfg: GradingConfig): BuildGrade;
export interface ComputeStatsOpts {
  /** Real character-screen values (the seeded main stats) — used as the Sheet baseline. */
  sheet?: Record<string, string | number>;
  /** The stats to report (the agent's relevant/goalposted stats). Defaults to the anomaly trio. */
  stats?: string[];
}
export function computeStats(agent: Agent, cfg: GradingConfig, opts?: ComputeStatsOpts): StatsResult;
export function swapDiscSet(
  agent: Agent,
  slot: number,
  newSet: string,
  cfg: GradingConfig
): { agent: Agent; grade: BuildGrade };
