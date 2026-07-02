// Shiyu Defense logs — Andres's cleared cycles, the endgame counterpart to the Teams setlists.
// Editorial data (in code, like setlists.ts), profile-keyed. ZZZ's rating ladder is B → A → S → S+
// (S+ is season-only: an S in every room plus a total ≥ 100,000). Per Andres, each room records only
// the recommended attribute(s) + whether it's anomaly-recommended + the enemy resistance(s) — not the
// full scoring rules — plus the boss, the clearing team, and the run's scores.

import { PROFILE_KEY } from "./supabase";

export type ShiyuRating = "B" | "A" | "S" | "S+";

// House award for a cycle's rank — the game doesn't medal Shiyu rank; WE do (Andres-approved
// flourish). Renders /assets/ui/medal-<medal>.webp on the season readout.
export type ShiyuMedal = "silver" | "gold" | "diamond" | "master" | "legend";

export interface ShiyuMember {
  slug: string; // roster slug -> /assets/endgame/<slug>.webp + /r/<slug>/
  name: string;
}

export interface ShiyuBoss {
  name: string;
  tag?: string; // variant label, e.g. "Miasma"
  slug: string; // -> /assets/bosses/<slug>.webp
  level: number;
}

export interface ShiyuRoom {
  room: number;
  rating: ShiyuRating; // per-room max is S (S+ is a season award)
  recommended: string[]; // recommended attribute(s), e.g. ["Ice"]
  anomaly?: boolean; // "Anomaly recommended"
  resistance: string[]; // enemy resistance attribute(s), e.g. ["Physical"]
  boss: ShiyuBoss;
  team: ShiyuMember[]; // the 3 agents that cleared it
  bangboo?: { name: string; slug: string }; // 4th team slot -> /assets/bangboo/<slug>.webp
  scores: { total: number; damage: number; elimination: number };
  time?: string; // clear time, e.g. "01m 43s"
}

export interface ShiyuTarget {
  rating: ShiyuRating;
  desc: string;
  done: boolean;
}

// In-game grade-card counts from the clear-history screen (S ×5 / A ×0 / B ×0). Authored, not
// derived: the game grades ALL floors while we only log the interesting rooms editorially, so a
// count derived from `rooms` would under-report.
export interface ShiyuGradeCounts {
  s: number;
  a: number;
  b: number;
}

export interface ShiyuCycle {
  id: string;
  label: string; // cycle/season name
  date?: string; // unlock date, YYYY-MM-DD (drives the history card's "MM/DD Unlocked")
  frontier?: string; // in-game frontier name, e.g. "Fifth Frontier" — shown once demoted to history
  bestTotal: number;
  rank: string; // percentile string, e.g. "2.4%"
  medal?: ShiyuMedal; // our house award for the rank (see ShiyuMedal)
  highestRating: ShiyuRating;
  grades?: ShiyuGradeCounts; // in-game grade cards; falls back to counting `rooms` when absent
  targets: ShiyuTarget[]; // the B/A/S/S+ challenge ladder
  rooms: ShiyuRoom[];
}

// A compact clear-history entry — cycles cleared BEFORE the editorial era (no enemy/score-breakdown
// data, per Andres) plus every demoted full cycle. `teams` = the 3 clearing agents per room, in room
// order; optional until Andres compiles the roster history.
export interface ShiyuHistoryEntry {
  id: string;
  date: string; // unlock date, YYYY-MM-DD
  label: string; // frontier name on the card
  score: number;
  rating: ShiyuRating; // the badge (season rating)
  grades: ShiyuGradeCounts;
  teams?: ShiyuMember[][];
}

// Newest cycle first. CYCLES[0] gets the full marquee treatment; older entries auto-demote to the
// clear-history block (via toHistory). To log a new clear: author it HERE at the top — done.
const CYCLES: ShiyuCycle[] = [
  // 2026-06-26 cycle authored 2026-07-01 from Andres's result screenshots (his best season to
  // date: 132,385 at 1.9%). Scores/attributes/resistances/times screenshot-exact; R1+R3
  // anomaly-recommended, the S×5 grade card, and R3's slow 02m 20s clock all Andres-confirmed
  // 2026-07-01. Nothing pending.
  {
    id: "critical-node-2026-06-26",
    label: "Critical Node",
    date: "2026-06-26",
    frontier: "Fifth Frontier",
    bestTotal: 132385,
    rank: "1.9%",
    medal: "legend",
    highestRating: "S+",
    grades: { s: 5, a: 0, b: 0 },
    targets: [
      { rating: "S+", desc: "S-rating in all rooms · total ≥ 100,000", done: true },
      { rating: "S", desc: "S-rating in all rooms", done: true },
      { rating: "A", desc: "A-rating in all rooms", done: true },
      { rating: "B", desc: "B-rating in all rooms", done: true },
    ],
    rooms: [
      {
        room: 1,
        rating: "S",
        recommended: ["Wind", "Physical"],
        anomaly: true,
        resistance: ["Ether"],
        boss: { name: "Abyssal Enforcer", tag: "Miasma", slug: "miasmaabyssalenforcer", level: 70 },
        team: [
          { slug: "janedoe", name: "Jane Doe" },
          { slug: "velina", name: "Velina" },
          { slug: "yuzuha", name: "Yuzuha" },
        ],
        bangboo: { name: "Ultra Jet", slug: "ultrajet" },
        scores: { total: 45215, damage: 40215, elimination: 5000 },
        time: "01m 20s",
      },
      {
        room: 2,
        rating: "S",
        recommended: ["Ether", "Physical"],
        resistance: ["Fire"],
        boss: { name: "Mirage Archer Unit", tag: "A-H0L0 Construct", slug: "miragearcherunit", level: 70 },
        team: [
          { slug: "yeshunguang", name: "Ye Shunguang" },
          { slug: "dialyn", name: "Dialyn" },
          { slug: "sunna", name: "Sunna" },
        ],
        bangboo: { name: "Sprout", slug: "sprout" },
        scores: { total: 42393, damage: 37393, elimination: 5000 },
        time: "01m 30s",
      },
      {
        room: 3,
        rating: "S",
        recommended: ["Ice"],
        anomaly: true,
        resistance: ["Physical"],
        // In-game name this cycle is "Komano Manato" — same beast/render as 06-12's "Norano
        // Slime" (the assets flip-flop on the name, Andres-confirmed canon; see stage-shiyu.py).
        boss: { name: "Komano Manato", tag: "Miasma", slug: "miasmanoranoslime", level: 70 },
        team: [
          { slug: "miyabi", name: "Miyabi" },
          { slug: "nangongyu", name: "Nangong Yu" },
          { slug: "astra", name: "Astra Yao" },
        ],
        bangboo: { name: "BaddieBoo", slug: "baddieboo" },
        scores: { total: 44777, damage: 39777, elimination: 5000 },
        time: "02m 20s",
      },
    ],
  },
  {
    id: "critical-node-2026-06-12",
    label: "Critical Node",
    date: "2026-06-12",
    frontier: "Fifth Frontier",
    bestTotal: 124968,
    rank: "2.4%",
    medal: "legend",
    highestRating: "S+",
    grades: { s: 5, a: 0, b: 0 },
    targets: [
      { rating: "S+", desc: "S-rating in all rooms · total ≥ 100,000", done: true },
      { rating: "S", desc: "S-rating in all rooms", done: true },
      { rating: "A", desc: "A-rating in all rooms", done: true },
      { rating: "B", desc: "B-rating in all rooms", done: true },
    ],
    rooms: [
      {
        room: 1,
        rating: "S",
        recommended: ["Ice"],
        anomaly: true,
        resistance: ["Physical"],
        boss: { name: "Norano Slime", tag: "Miasma", slug: "miasmanoranoslime", level: 70 },
        team: [
          { slug: "miyabi", name: "Miyabi" },
          { slug: "nangongyu", name: "Nangong Yu" },
          { slug: "astra", name: "Astra Yao" },
        ],
        bangboo: { name: "Sharkboo", slug: "sharkboo" },
        scores: { total: 38938, damage: 33938, elimination: 5000 },
        time: "01m 43s",
      },
      {
        room: 2,
        rating: "S",
        recommended: ["Fire", "Physical"],
        resistance: ["Ice", "Wind"],
        boss: { name: "Covenant Guardian", slug: "covenantguardian", level: 70 },
        team: [
          { slug: "yeshunguang", name: "Ye Shunguang" },
          { slug: "dialyn", name: "Dialyn" },
          { slug: "sunna", name: "Sunna" },
        ],
        bangboo: { name: "Sprout", slug: "sprout" },
        scores: { total: 42748, damage: 37748, elimination: 5000 },
        time: "01m 31s",
      },
      {
        room: 3,
        rating: "S",
        recommended: ["Fire", "Physical"],
        resistance: ["Ether"],
        boss: { name: "Isolde Slime", tag: "Miasma", slug: "miasmaisoldeslime", level: 70 },
        team: [
          { slug: "burnice", name: "Burnice" },
          { slug: "velina", name: "Velina" },
          { slug: "yuzuha", name: "Yuzuha" },
        ],
        bangboo: { name: "Ultra Jet", slug: "ultrajet" },
        scores: { total: 43282, damage: 38282, elimination: 5000 },
        time: "01m 33s",
      },
    ],
  },
];

// Pre-editorial clear history (from Andres's in-game history screen, 2026-07-01). 14-day cadence,
// every one an S+ Fifth Frontier full-S clear. `teams` = Andres's compiled roster history (2026-07-01).
// NB: Zhao (05/01 R1) has no stash circle — stage-shiyu.py synthesizes his from the tall portrait.
const HISTORY: ShiyuHistoryEntry[] = [
  {
    id: "fifth-frontier-2026-05-29", date: "2026-05-29", label: "Fifth Frontier", score: 106942, rating: "S+", grades: { s: 5, a: 0, b: 0 },
    teams: [
      [{ slug: "yeshunguang", name: "Ye Shunguang" }, { slug: "dialyn", name: "Dialyn" }, { slug: "sunna", name: "Sunna" }],
      [{ slug: "miyabi", name: "Miyabi" }, { slug: "nangongyu", name: "Nangong Yu" }, { slug: "yuzuha", name: "Yuzuha" }],
      [{ slug: "seed", name: "Seed" }, { slug: "cissia", name: "Cissia" }, { slug: "astra", name: "Astra Yao" }],
    ],
  },
  {
    id: "fifth-frontier-2026-05-15", date: "2026-05-15", label: "Fifth Frontier", score: 113718, rating: "S+", grades: { s: 5, a: 0, b: 0 },
    teams: [
      [{ slug: "miyabi", name: "Miyabi" }, { slug: "vivian", name: "Vivian" }, { slug: "astra", name: "Astra Yao" }],
      [{ slug: "alice", name: "Alice" }, { slug: "janedoe", name: "Jane Doe" }, { slug: "yuzuha", name: "Yuzuha" }],
      [{ slug: "aria", name: "Aria" }, { slug: "nangongyu", name: "Nangong Yu" }, { slug: "sunna", name: "Sunna" }],
    ],
  },
  {
    id: "fifth-frontier-2026-05-01", date: "2026-05-01", label: "Fifth Frontier", score: 116923, rating: "S+", grades: { s: 5, a: 0, b: 0 },
    teams: [
      [{ slug: "yeshunguang", name: "Ye Shunguang" }, { slug: "dialyn", name: "Dialyn" }, { slug: "zhao", name: "Zhao" }],
      [{ slug: "seed", name: "Seed" }, { slug: "cissia", name: "Cissia" }, { slug: "astra", name: "Astra Yao" }],
      [{ slug: "aria", name: "Aria" }, { slug: "nangongyu", name: "Nangong Yu" }, { slug: "sunna", name: "Sunna" }],
    ],
  },
  {
    id: "fifth-frontier-2026-04-17", date: "2026-04-17", label: "Fifth Frontier", score: 112162, rating: "S+", grades: { s: 5, a: 0, b: 0 },
    teams: [
      [{ slug: "aria", name: "Aria" }, { slug: "nangongyu", name: "Nangong Yu" }, { slug: "sunna", name: "Sunna" }],
      [{ slug: "seed", name: "Seed" }, { slug: "cissia", name: "Cissia" }, { slug: "astra", name: "Astra Yao" }],
      [{ slug: "yixuan", name: "Yixuan" }, { slug: "dialyn", name: "Dialyn" }, { slug: "lucia", name: "Lucia" }],
    ],
  },
];

const BY_PROFILE: Record<string, ShiyuCycle[]> = {
  [PROFILE_KEY]: CYCLES,
};

const HISTORY_BY_PROFILE: Record<string, ShiyuHistoryEntry[]> = {
  [PROFILE_KEY]: HISTORY,
};

export function shiyuCyclesFor(profileKey: string): ShiyuCycle[] {
  return BY_PROFILE[profileKey] ?? [];
}

// Demote a full editorial cycle to a history card. Grade counts prefer the authored in-game
// `grades` (the game grades all floors; we log fewer rooms); teams come along for free.
function toHistory(c: ShiyuCycle): ShiyuHistoryEntry {
  const counted: ShiyuGradeCounts = { s: 0, a: 0, b: 0 };
  for (const r of c.rooms) {
    if (r.rating === "S") counted.s += 1;
    else if (r.rating === "A") counted.a += 1;
    else if (r.rating === "B") counted.b += 1;
  }
  return {
    id: c.id,
    date: c.date ?? "",
    label: c.frontier ?? c.label,
    score: c.bestTotal,
    rating: c.highestRating,
    grades: c.grades ?? counted,
    teams: c.rooms.length ? c.rooms.map((r) => r.team) : undefined,
  };
}

// Everything below the marquee: demoted full cycles + the pre-editorial scorebook, newest first.
// (ISO dates sort lexicographically.)
export function shiyuHistoryFor(profileKey: string): ShiyuHistoryEntry[] {
  const demoted = (BY_PROFILE[profileKey] ?? []).slice(1).map(toHistory);
  const legacy = HISTORY_BY_PROFILE[profileKey] ?? [];
  return [...demoted, ...legacy].sort((x, y) => y.date.localeCompare(x.date));
}

export function hasShiyu(profileKey: string): boolean {
  return (BY_PROFILE[profileKey]?.length ?? 0) > 0;
}

// CSS-class suffix for a rating ("S+" -> "splus", else lowercase) — drives the .rate.r-* color.
export function ratingClass(r: ShiyuRating): string {
  return r === "S+" ? "splus" : r.toLowerCase();
}
