// Shiyu Defense logs — A.'s cleared cycles, the endgame counterpart to the Teams setlists.
// Editorial data (in code, like setlists.ts), profile-keyed. ZZZ's rating ladder is B → A → S → S+
// (S+ is season-only: an S in every room plus a total ≥ 100,000). Per A., each room records only
// the recommended attribute(s) + whether it's anomaly-recommended + the enemy resistance(s) — not the
// full scoring rules — plus the boss, the clearing team, and the run's scores.

import { PROFILE_KEY } from "./supabase";

export type ShiyuRating = "B" | "A" | "S" | "S+";

// House award for a cycle's rank — the game doesn't medal Shiyu rank; WE do (A.-approved
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
// data, per A.) plus every demoted full cycle. `teams` = the 3 clearing agents per room, in room
// order; optional until A. compiles the roster history.
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
  // 2026-09-04: screenshot-confirmed opening clear, 134,079 / S+ / 3.4%.
  // R1: Ice/Ether DMG +35%, CRIT DMG +25%; Attack hits on stunned enemies
  // reduce DEF 25% for 5s. R2: 2/3 Anomaly agents grant +10/60% Attribute
  // Anomaly DMG and 500/1,500 starting Decibels. R3: DEF +15%, Electric RES
  // ignore 20%; EX grants +5% CRIT Rate / +20% CRIT DMG for 15s.
  // Resistance chips describe the powerful enemy, not the preceding waves.
  // S×5 follows the season convention; the S+ result confirms all-room S.
  {
    id: "critical-node-2026-09-04",
    label: "Critical Node",
    date: "2026-09-04",
    frontier: "Fifth Frontier",
    bestTotal: 134079,
    rank: "3.4%",
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
        room: 1, rating: "S",
        recommended: ["Ice", "Ether"], resistance: [],
        boss: { name: "Tepes", slug: "tepes", level: 70 },
        team: [
          { slug: "yeshunguang", name: "Ye Shunguang" },
          { slug: "dialyn", name: "Dialyn" },
          { slug: "sunna", name: "Sunna" },
        ],
        bangboo: { name: "Sprout", slug: "sprout" },
        scores: { total: 43060, damage: 38060, elimination: 5000 },
        time: "01m 24s",
      },
      {
        room: 2, rating: "S",
        recommended: ["Ice", "Wind"], anomaly: true, resistance: ["Ether"],
        boss: { name: "Airspace Sentinel", slug: "airspacesentinel", level: 70 },
        team: [
          { slug: "remielledan", name: "Remielle Dan" },
          { slug: "janedoe", name: "Jane Doe" },
          { slug: "velina", name: "Velina" },
        ],
        bangboo: { name: "Ariel", slug: "ariel" },
        scores: { total: 48511, damage: 43511, elimination: 5000 },
        time: "01m 16s",
      },
      {
        room: 3, rating: "S",
        recommended: ["Electric", "Physical"], resistance: ["Ether"],
        boss: { name: "Lockspring", slug: "lockspring", level: 70 },
        team: [
          { slug: "cissia", name: "Cissia" },
          { slug: "seed", name: "Seed" },
          { slug: "astra", name: "Astra Yao" },
        ],
        bangboo: { name: "Plugboo", slug: "plugboo" },
        scores: { total: 42508, damage: 37508, elimination: 5000 },
        time: "01m 58s",
      },
    ],
  },
  // 2026-08-21 cycle, authored same night from A.'s result screenshots. NEW ALL-TIME BEST
  // TOTAL: 137,735 — beats 07-24's archive-crowned 137,438 by +297. The account refuses a
  // clean margin: first pass of the cycle sat 713 SHORT (136,725) and the re-runs found
  // +1,010 (R2 +533, R3 +477). R1 = the Blight trio's SECOND straight 50,000 cap on
  // Metamorphosed Avarus, 00m 50s to the second again (same room card as 08-07: Wind/
  // Physical anomaly shill, Fire res, +15% Anomaly DMG, 2/3 Anomaly agents +40/120 AP).
  // R3 = Thracian, NEW boss (Ice/Ether, NO resistances; Attack-specialty Basic ignores 30%
  // Ice RES, Attack-specialty EX/Chain -> +20% Ice DMG +40% CRIT DMG 15s): the CRIT DMG
  // room is YSG's by doctrine ("any CRIT DMG buff patches Ye's CD deficit for free") —
  // 46,598 first pass at 95.7% carry share, 47,075 optimized, her Shiyu best either way.
  // R2 = Mirage Archer rerun (06-26 room: Ether/Physical, Fire res; +20% Ether DMG, anomaly
  // procs -15% DEF/-15% All RES 10s): the Yixuan/Fufu/Lucia draft FLOPPED to ~33k (Ether
  // DMG% into a bucket her disc 5 already fills — a room buff is only a multiplier when
  // the bucket is empty; Law 5 footnote), Miyabi/NY/Astra 40,127 at 02m 32s then 40,660
  // at 01m 48s on the re-run — the clock was the lever, not the comp. Rank 2.5% as of 08-21 (S+ season card); grades S×5 mirrors the season
  // card convention of every prior cycle. Three room scores sum to bestTotal exactly.
  {
    id: "critical-node-2026-08-21",
    label: "Critical Node",
    date: "2026-08-21",
    frontier: "Fifth Frontier",
    bestTotal: 137735,
    rank: "2.5%",
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
        resistance: ["Fire"],
        boss: { name: "Avarus", tag: "Metamorphosed", slug: "metamorphosedavarus", level: 70 },
        team: [
          { slug: "remielledan", name: "Remielle Dan" },
          { slug: "janedoe", name: "Jane Doe" },
          { slug: "velina", name: "Velina" },
        ],
        bangboo: { name: "Ariel", slug: "ariel" },
        scores: { total: 50000, damage: 45000, elimination: 5000 },
        time: "00m 50s",
      },
      {
        room: 2,
        rating: "S",
        recommended: ["Ether", "Physical"],
        resistance: ["Fire"],
        boss: { name: "Mirage Archer Unit", tag: "A-H0L0 Construct", slug: "miragearcherunit", level: 70 },
        team: [
          { slug: "miyabi", name: "Miyabi" },
          { slug: "nangongyu", name: "Nangong Yu" },
          { slug: "astra", name: "Astra Yao" },
        ],
        bangboo: { name: "Biggest Fan", slug: "biggestfan" },
        scores: { total: 40660, damage: 35660, elimination: 5000 },
        time: "01m 48s",
      },
      {
        room: 3,
        rating: "S",
        recommended: ["Ice", "Ether"],
        resistance: [],
        boss: { name: "Thracian", slug: "thracian", level: 70 },
        team: [
          { slug: "yeshunguang", name: "Ye Shunguang" },
          { slug: "dialyn", name: "Dialyn" },
          { slug: "sunna", name: "Sunna" },
        ],
        bangboo: { name: "Sprout", slug: "sprout" },
        scores: { total: 47075, damage: 42075, elimination: 5000 },
      },
    ],
  },
  // 2026-08-07 cycle, authored 2026-08-14 from A.'s result screenshots, MID-CYCLE ("Defense
  // in Progress" through ~08-21; re-runs may still improve it). Best RANK ever logged (1.7%)
  // AND the account's first CAPPED Shiyu room: R1's total score ceiling is exactly 50,000
  // (A.-confirmed) and the Remielle/Jane/Velina anomaly trio hit it in 50s vs the brand-new
  // Metamorphosed Avarus — the same shell that capped Deadly Assault R1 at 65,000 on 08-01.
  // Remielle's Shiyu debut; R1's anomaly shill A.-confirmed 2026-08-14. R2 = the YSG/Dialyn/
  // Sunna Physical mono run INTO Physical resistance in a stun-shill room ("any boss, any
  // weather" receipt #3), glory re-run banked 42,800 same day — the three room scores sum to
  // bestTotal exactly. R3 = the Cissia/Seed/Astra Electric team's best score in the shell's
  // existence (ATK-shill room: Attack-specialty EX Specials grant +30% CRIT DMG,
  // A.-confirmed). NB: NOT the all-time best total — the in-game archive (2026-08-14
  // screenshot) crowns 07-24's 137,438; this sits second, 1,918 behind, with a week left.
  // Grades S×5 + Fifth Frontier + all unlock dates archive-confirmed same screenshot.
  {
    id: "critical-node-2026-08-07",
    label: "Critical Node",
    date: "2026-08-07",
    frontier: "Fifth Frontier",
    bestTotal: 135520,
    rank: "1.7%",
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
        resistance: ["Fire"],
        boss: { name: "Avarus", tag: "Metamorphosed", slug: "metamorphosedavarus", level: 70 },
        team: [
          { slug: "remielledan", name: "Remielle Dan" },
          { slug: "janedoe", name: "Jane Doe" },
          { slug: "velina", name: "Velina" },
        ],
        bangboo: { name: "Ariel", slug: "ariel" },
        scores: { total: 50000, damage: 45000, elimination: 5000 },
        time: "00m 50s",
      },
      {
        room: 2,
        rating: "S",
        recommended: ["Fire", "Electric"],
        resistance: ["Physical"],
        boss: { name: "Starlight Billy", tag: "Doppelganger", slug: "doppelgangerstarlightbilly", level: 70 },
        team: [
          { slug: "yeshunguang", name: "Ye Shunguang" },
          { slug: "dialyn", name: "Dialyn" },
          { slug: "sunna", name: "Sunna" },
        ],
        bangboo: { name: "Sprout", slug: "sprout" },
        scores: { total: 42800, damage: 37800, elimination: 5000 },
        time: "01m 36s",
      },
      {
        room: 3,
        rating: "S",
        recommended: ["Electric", "Physical"],
        resistance: ["Ether"],
        boss: { name: "Heretic Jester", tag: "Sacrifice", slug: "sacrificehereticjester", level: 70 },
        team: [
          { slug: "cissia", name: "Cissia" },
          { slug: "seed", name: "Seed" },
          { slug: "astra", name: "Astra Yao" },
        ],
        bangboo: { name: "Plugboo", slug: "plugboo" },
        scores: { total: 42720, damage: 37720, elimination: 5000 },
        time: "01m 52s",
      },
    ],
  },
  // 2026-06-26 cycle authored 2026-07-01 from A.'s result screenshots (132,385 at 1.9% as of
  // that session). Scores/attributes/resistances/times screenshot-exact; R1+R3 anomaly-
  // recommended, the S×5 grade card, and R3's slow 02m 20s clock all A.-confirmed 2026-07-01.
  // 2026-08-14 CORRECTION from the in-game archive: the cycle's FINAL banked best was
  // 135,344 — A. quietly re-ran his way to +2,959 after our logging session and never told
  // either of us. bestTotal now carries the archive truth; the room cards remain the 07/01-
  // logged receipts (their sum, 132,385, is the pre-re-run total) and the 1.9% rank is
  // as-of-07/01 (rank never renders once demoted to history).
  {
    id: "critical-node-2026-06-26",
    label: "Critical Node",
    date: "2026-06-26",
    frontier: "Fifth Frontier",
    bestTotal: 135344,
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
        bangboo: { name: "Ultra Jake", slug: "ultrajet" },
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
        // Slime" (the assets flip-flop on the name, A.-confirmed canon; see stage-shiyu.py).
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
        bangboo: { name: "Ultra Jake", slug: "ultrajet" },
        scores: { total: 43282, damage: 38282, elimination: 5000 },
        time: "01m 33s",
      },
    ],
  },
];

// Pre-editorial clear history (from A.'s in-game history screen, 2026-07-01). 14-day cadence,
// every one an S+ Fifth Frontier full-S clear. `teams` = A.'s compiled roster history (2026-07-01).
// NB: Zhao (05/01 R1) has no stash circle — stage-shiyu.py synthesizes his from the tall portrait.
const HISTORY: ShiyuHistoryEntry[] = [
  // 07/10 + 07/24 went HISTORY-DIRECT (logged 2026-08-14 from the in-game archive + A.'s
  // compiled teams — the DA 07/03 pattern: a superseded cycle skips the marquee, carrying
  // exactly what the archive keeps). 07/24's 137,438 was the ALL-TIME best total (set and
  // unlogged during the backlog window) until 08-21's 137,735 took it by +297. Boos (schema drops them): 07/10 R1 Ultra Jake /
  // R2 Snap / R3 Sprout; 07/24 R1 Sprout / R2 Ariel / R3 Biggest Fan.
  {
    id: "fifth-frontier-2026-07-24", date: "2026-07-24", label: "Fifth Frontier", score: 137438, rating: "S+", grades: { s: 5, a: 0, b: 0 },
    teams: [
      [{ slug: "yeshunguang", name: "Ye Shunguang" }, { slug: "dialyn", name: "Dialyn" }, { slug: "sunna", name: "Sunna" }],
      [{ slug: "remielledan", name: "Remielle Dan" }, { slug: "aria", name: "Aria" }, { slug: "velina", name: "Velina" }],
      [{ slug: "miyabi", name: "Miyabi" }, { slug: "nangongyu", name: "Nangong Yu" }, { slug: "astra", name: "Astra Yao" }],
    ],
  },
  {
    id: "fifth-frontier-2026-07-10", date: "2026-07-10", label: "Fifth Frontier", score: 125051, rating: "S+", grades: { s: 5, a: 0, b: 0 },
    teams: [
      [{ slug: "janedoe", name: "Jane Doe" }, { slug: "velina", name: "Velina" }, { slug: "yuzuha", name: "Yuzuha" }],
      [{ slug: "cissia", name: "Cissia" }, { slug: "seed", name: "Seed" }, { slug: "astra", name: "Astra Yao" }],
      [{ slug: "yeshunguang", name: "Ye Shunguang" }, { slug: "dialyn", name: "Dialyn" }, { slug: "sunna", name: "Sunna" }],
    ],
  },
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
