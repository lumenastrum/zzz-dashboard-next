// Domain schema for the ZZZ Soundsystem dashboard.
// Mirrors the extended `discs` JSONB blob (see grading/GRADING_SPEC.md §1).

export type Scope = "sheet" | "combat";
export type ModKind = "stat" | "dmg" | "buildup";

export interface DiscSub {
  stat: string;
  rolls: number; // ZZZ PropertyLevel, 1–6
  value?: string | number;
}

export interface DiscMain {
  stat: string;
  value: string | number;
}

export interface DiscPiece {
  slot: number; // 1–6
  set: string; // editable → enables disc-swapping
  rank?: string; // S / A / B
  level?: number; // +0 … +15
  main: DiscMain;
  subs: DiscSub[];
}

export interface EffectMod {
  label: string;
  kind: ModKind;
  stat: string;
  value: number;
  unit?: string;
  scope: Scope;
  cond?: boolean;
}

export interface WEngine {
  name: string;
  rank?: string;
  refine?: string; // e.g. "R1"
  base?: { ATK?: number };
  advanced?: { label: string };
  passive?: EffectMod[];
}

export interface Agent {
  name: string;
  section: string; // ATTACK | ANOMALY | STUN | SUPPORT | RAPTURE
  attribute: string; // Physical | Fire | Ice | Electric | Ether
  specialty?: string;
  faction?: string;
  rank?: string; // S / A
  mindscape?: string; // M0 … M6
  level?: number;
  // illustrative stat baseline for the Sheet/Effective sheet — refine to exact ZZZ later
  base?: { atkPool?: number; AP?: number; AM?: number };
  wengine?: WEngine;
  discs?: { pieces: DiscPiece[] };
  notes?: string | null;
}

// Loose shape of grading-config.json — engine reads it dynamically.
export type GradingConfig = Record<string, unknown>;

// Supabase JSONB blob (one row per profile in dashboard_profiles).
export interface DashboardData {
  meta: { title: string; updated: string; totalAgents?: number; maxLevel?: number };
  agents: Agent[];
  // audit / sessions / pullRecommendations carry over from the legacy schema as we port tabs
  [key: string]: unknown;
}
