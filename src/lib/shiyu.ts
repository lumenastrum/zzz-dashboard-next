// Shiyu Defense logs — Andres's cleared cycles, the endgame counterpart to the Teams setlists.
// Editorial data (in code, like setlists.ts), profile-keyed. ZZZ's rating ladder is B → A → S → S+
// (S+ is season-only: an S in every room plus a total ≥ 100,000). Per Andres, each room records only
// the recommended attribute(s) + whether it's anomaly-recommended + the enemy resistance(s) — not the
// full scoring rules — plus the boss, the clearing team, and the run's scores.

import { PROFILE_KEY } from "./supabase";

export type ShiyuRating = "B" | "A" | "S" | "S+";

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

export interface ShiyuCycle {
  id: string;
  label: string; // cycle/season name
  date?: string; // YYYY-MM
  bestTotal: number;
  rank: string; // percentile string, e.g. "2.4%"
  highestRating: ShiyuRating;
  targets: ShiyuTarget[]; // the B/A/S/S+ challenge ladder
  rooms: ShiyuRoom[];
}

// Newest cycle first. Start with the most recent Critical Node; Room 1 seeded as the test.
const CYCLES: ShiyuCycle[] = [
  {
    id: "critical-node-2026-06",
    label: "Critical Node",
    date: "2026-06",
    bestTotal: 124968,
    rank: "2.4%",
    highestRating: "S+",
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

const BY_PROFILE: Record<string, ShiyuCycle[]> = {
  [PROFILE_KEY]: CYCLES,
};

export function shiyuCyclesFor(profileKey: string): ShiyuCycle[] {
  return BY_PROFILE[profileKey] ?? [];
}

export function hasShiyu(profileKey: string): boolean {
  return (BY_PROFILE[profileKey]?.length ?? 0) > 0;
}

// CSS-class suffix for a rating ("S+" -> "splus", else lowercase) — drives the .rate.r-* color.
export function ratingClass(r: ShiyuRating): string {
  return r === "S+" ? "splus" : r.toLowerCase();
}
