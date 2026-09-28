// Data contracts. Every Random Play component renders from these shapes — never from raw
// Supabase blobs or coach-pack JSON directly. Adapters live in derive.ts.
import type { Element, Grade } from "../tokens";

export type Section = "Anomaly" | "Attack" | "Stun" | "Support" | "Rupture";
export const SECTIONS: Section[] = ["Anomaly", "Attack", "Stun", "Support", "Rupture"];

export interface StatRow { stat: string; value: string }

/** One tape on the wall. Everything a spine, an open tape and a jacket cover need. */
export interface Agent {
  slug: string;
  name: string;
  /** Short name that fits a spine / nameplate ("Remielle", "S0 Anby"). */
  spine: string;
  section: Section;
  attribute: Element;
  faction: string;
  /** "Void Hunter: …", "Grandmaster", or "" — picks the film strip on the cover. */
  title: string;
  mindscape: number;
  /** Absent = identity-only agent (no build imported): renders as "on order". */
  grade?: Grade;
  pct?: number;
  engine?: { name: string; rank: string; refine: string };
  sets?: string;
  suggestion?: string;
  scalesOn: string[];
  sheet: StatRow[];
}

export interface DiscSub { stat: string; rolls: number; relevant: boolean }
export interface Disc {
  slot: 1 | 2 | 3 | 4 | 5 | 6;
  set: string;
  grade: Grade;
  pct: number;
  main: StatRow;
  subs: DiscSub[];
}
export interface Skill { name: string; level: number; max: number }
/** One breakpoint gauge. `value` is the character screen (out of combat). `full` is the gauge's end mark:
 *  the stat's cap when it has one (past it is wasted), else full marks. `combat` is the same stat with the
 *  in-combat-only buffs on top (W-engine passives, conditional set effects); present only when those buffs
 *  add something, with `combatFrom` naming them. */
export interface Goal {
  stat: string; value: number; target: number; full: number; min: number; max: number;
  targetLabel: string; fullLabel: string; note: string;
  combat?: number; combatFrom?: string;
}

/** Deep build data for one agent (discs, skills, goals). Optional per agent. */
export interface BuildDetail {
  slug: string;
  sheet?: StatRow[];
  sheetSource: string;
  discs?: Disc[];
  discSource?: string;
  weakestSlot?: number;
  skills?: Skill[];
  skillSource?: string;
  core?: string[];
  goals?: Goal[];
  engineBuffs?: string[];
  setBonus?: { sets: { name: string; pieces: number }[]; note: string };
  ratingLine?: string;
}

/**
 * Live disc editing for one tape's Scenes. The host owns the state: the dashboard wires these to its
 * blob mutators + grading engine (every change re-grades and saves through its own session-gated
 * path); the playground wires them to local state. Slots 1–3 have fixed mains in-game, so `mains`
 * only lists 4–6. `status` is what the panel tells the player about where the edits go.
 */
export type EditStatus = "live" | "saving" | "locked" | "local" | "error";
export interface SceneEditor {
  sets: string[];
  mains: Record<number, string[]>;
  substats: string[];
  onSet: (slot: number, set: string) => void;
  onMain: (slot: number, stat: string) => void;
  onSub: (slot: number, index: number, stat: string) => void;
  onRoll: (slot: number, index: number, delta: 1 | -1) => void;
  status: EditStatus;
}

export type Mode = "DA" | "Shiyu";
export interface Run { mode: Mode; date: string; score: number; boss: string; bangboo: string | null; team: string[] }

/** A "Triple Feature": one 3-agent lineup, merged from logged runs + setlist editorial. */
export interface Team {
  id: string;
  name: string;
  archetype: string;
  attribute: Element | "";
  /** Display order = the order of the best logged run (carry first), else the setlist order. */
  order: string[];
  roles: Record<string, string>;
  runs: Run[];
  best: Run | null;
  caps: number;
  bangboo: string | null;
  why: string;
  room: string;
  caution: string;
  variants: { team: string; when: string }[];
  inSetlists: boolean;
}

// ---------------------------------------------------------------- endgame (Shiyu + Deadly Assault)
export interface BossRef { name: string; /** Epithet the game prints above the name ("The Decider"). */ tag?: string; slug: string; level: number }

/** One room of one endgame cycle. Shiyu rooms carry `rating`; DA rooms carry `pips` + the house rules. */
export interface EndgameRoom {
  /** 1–3; Deadly Assault's Adversity room is 4. */
  room: number;
  boss: BossRef;
  recommended: Element[];
  resistance: Element[];
  team: string[];
  bangboo: string | null;
  score: number;
  /** Score split exactly as the game prints it: Damage + Elimination (Shiyu) / Performance (DA). */
  parts: { label: string; value: number }[];
  rating?: "S" | "A" | "B";
  pips?: number;
  /** Clear time as logged ("01m 24s"). Absent = not captured, never estimated. */
  time?: string;
  timeLimit?: string;
  specialty?: string;
  gimmick?: string;
  buff?: { name: string; slug: string; desc: string };
  anomaly?: boolean;
  /** Adversity star thresholds (10k/20k/30k). */
  targets?: number[];
}

export interface ShiyuCycle {
  id: string;
  date: string;
  label: string;
  frontier: string;
  /** The board's best total. Can differ from the room sum (a room scored higher before a re-run). */
  best: number;
  /** "1.9%" — null when the game hasn't posted a rank. */
  rank: string | null;
  highestRating: string;
  medal: string | null;
  targets: { rating: string; desc: string; done: boolean }[];
  rooms: EndgameRoom[];
}

export interface AssaultCycle {
  id: string;
  date: string;
  label: string;
  best: number;
  rank: string | null;
  medals: { crown: number; shield: number };
  rooms: EndgameRoom[];
  adversity: { best: number; rank: string | null; room: EndgameRoom } | null;
}

/** One point on the history strip. `cycle` indexes into `cycles` when the full card is on file. */
export interface HistoryPoint { date: string; score: number; rank: string | null; cycle: number | null }

export interface EndgameLedger<C> { cycles: C[]; history: HistoryPoint[] }

// ---------------------------------------------------------------- Signal Search (A.'s pull archive)
export type PullOutcome = "won" | "lost" | "guaranteed" | "plain";
/** One S-rank hit. `name` may be "" for grafted pre-window records whose item id never got mapped. */
export interface SignalPull { name: string; type: "Agents" | "W-Engines" | "Bangboo" | ""; time: string; pity: number; outcome: PullOutcome; channel: string }
export interface SignalChannel {
  /** Hoyo real_gacha_type ("2" = Exclusive…); doubles as the VCR channel number. */
  channel: string;
  name: string;
  total: number;
  sCount: number;
  aCount: number;
  avgPityS: number | null;
  currentPity: number;
  hardPity: number;
  longestDry: number;
  /** Coinflip channels only (Exclusive 50/50, W-Engine 75/25). */
  flip: { label: string; wins: number; challenges: number; onGuarantee: boolean } | null;
  /** Oldest → newest. */
  sRanks: SignalPull[];
}
export interface SignalArchive {
  /** When the archive was last synced from the game (NOT when this snapshot was taken). */
  lastSync: string;
  totalPulls: number;
  totalPolychrome: number;
  totalS: number;
  firstTime: string | null;
  lastTime: string | null;
  channels: SignalChannel[];
}

// ---------------------------------------------------------------- Staff Picks (a profile's pull-priority list)
export interface StaffPick {
  rank: number;
  name: string;
  section: string;
  attribute: string;
  /** The exact priority wording ("Very high · Remielle multiplier"). */
  priority: string;
  /** 1–5 signal strength. */
  tier: number;
  /** Emote asset names (agents/emote/<name>.webp). */
  emotes: string[];
  /** Paragraphs; a "\n" inside one is a soft line break. */
  why: string[];
  /** Team lines. */
  team: string[];
  upcoming: boolean;
  eta: string | null;
  leak: boolean;
}
