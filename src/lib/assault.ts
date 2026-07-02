// Deadly Assault logs — the second, rotating endgame mode (sibling to shiyu.ts, same editorial
// pattern: in-code, profile-keyed, newest cycle first). A cycle is a boss trio; each room is a
// 3-minute score attack against one boss. Score = Damage Score + Performance Points (perf caps
// at 5,000). Each room's Challenge Target ladder (6,000 / 14,000 / 20,000 pts) awards up to 3
// pips (ui/da-pip.webp); a full cycle is 9. Per Andres, each room records the recommended
// attribute(s) + the powerful-enemy resistance(s) + the boss's specialty suitability + a one-line
// gimmick — not the full Enemy Details text.

import { PROFILE_KEY } from "./supabase";

export interface AssaultMember {
  slug: string; // roster slug -> /assets/teamcards/<slug>.webp + /r/<slug>/
  name: string;
}

export interface AssaultBoss {
  name: string;
  tag?: string; // variant label, e.g. "Notorious"
  slug: string; // -> /assets/enemies/<slug>.webp (full-body render, staged by stage-assault.py)
  level: number;
}

export interface AssaultRoom {
  room: number;
  boss: AssaultBoss;
  timeLimit?: string; // the room's clock, e.g. "03m 00s" — a time LIMIT, not a clear time
  recommended: string[]; // recommended attribute(s), e.g. ["Ice", "Ether"]
  specialty?: string; // "Suitable for Agents with X specialty" — e.g. "Anomaly", "Stun"
  resistance: string[]; // powerful-enemy resistance(s); [] renders as "None"
  gimmick?: string; // one-line Enemy Details mechanic, abridged
  buff?: { name: string; slug: string }; // chosen Current Buff (icons not staged yet — data-ready)
  pips: number; // challenge-target pips earned, 0–3
  targets?: [number, number, number]; // score thresholds; defaults to ASSAULT_TARGETS
  scores: { total: number; damage: number; performance: number };
  team: AssaultMember[]; // the 3 agents that ran it
  bangboo?: { name: string; slug: string }; // 4th slot -> /assets/bangboo/<slug>.webp
}

// Career medal tallies from the result screen's badge plate (crown = round top-tier medal,
// shield = the second-tier shield). Account-wide totals, not per-cycle — semantics per Andres.
export interface AssaultMedals {
  crown: number;
  shield: number;
}

export interface AssaultCycle {
  id: string;
  label: string; // rotation name — we name cycles by the headline boss
  date?: string; // cycle start date, YYYY-MM-DD (when Andres supplies it)
  bestTotal: number; // sum of the trio's best scores
  rank: string; // percentile string, e.g. "2.47%"
  medals?: AssaultMedals;
  rooms: AssaultRoom[];
}

// The standard Challenge Target ladder — every room this cycle uses it; per-room `targets`
// overrides if a future rotation changes the goalposts.
export const ASSAULT_TARGETS: [number, number, number] = [6000, 14000, 20000];

// Newest cycle first. CYCLES[0] gets the marquee; older entries demote to the history shelf
// (via toHistory). To log a new rotation: author it HERE at the top — done.
//
// Lineups Andres-confirmed 2026-07-01; still pending from him: bangboos (thumbnails are opaque),
// cycle start date, and buff names/icons. Scores/pips/attributes/gimmicks are screenshot-exact.
const CYCLES: AssaultCycle[] = [
  {
    id: "da-girtablullu-2026-06",
    label: "Girtablullu Rotation",
    bestTotal: 133373,
    rank: "2.47%",
    medals: { crown: 18, shield: 9 },
    rooms: [
      {
        room: 1,
        boss: { name: "Girtablullu", slug: "girtablullu", level: 70 },
        timeLimit: "03m 00s",
        recommended: ["Wind"],
        specialty: "Anomaly",
        resistance: [],
        gimmick:
          "Each Anomaly inflicted stacks Shadow — the boss takes +7.5% Anomaly DMG and +5% Vortex DMG per stack, up to 3.",
        pips: 3,
        scores: { total: 47282, damage: 42282, performance: 5000 },
        team: [
          { slug: "aria", name: "Aria" },
          { slug: "velina", name: "Velina" },
          { slug: "yuzuha", name: "Yuzuha" },
        ],
      },
      {
        room: 2,
        boss: { name: "Marionette", tag: "Notorious", slug: "notoriousmarionette", level: 70 },
        timeLimit: "03m 00s",
        recommended: ["Ice", "Ether"],
        resistance: [],
        gimmick:
          "Boss DMG +25%; destroying a clone (or stunning the main body) stacks On Thin Ice — each cuts boss DMG 5% and raises its Ice/Ether DMG taken.",
        pips: 3,
        scores: { total: 45086, damage: 40886, performance: 4200 },
        team: [
          { slug: "yixuan", name: "Yixuan" },
          { slug: "jufufu", name: "Ju Fufu" },
          { slug: "lucia", name: "Lucia" },
        ],
      },
      {
        room: 3,
        boss: { name: "Ye Shiyuan the Thrall", slug: "yeshiyuanthethrall", level: 70 },
        timeLimit: "03m 00s",
        recommended: ["Ice", "Physical", "Wind"],
        specialty: "Stun",
        resistance: ["Electric"],
        gimmick:
          "As Sobek and the Thrall alternate turns, the Thrall stacks Contract (+15% Anomaly Buildup RES each) and Self-Sacrifice, up to 3.",
        pips: 3,
        scores: { total: 41005, damage: 36005, performance: 5000 },
        team: [
          { slug: "yeshunguang", name: "Ye Shunguang" },
          { slug: "dialyn", name: "Dialyn" },
          { slug: "sunna", name: "Sunna" },
        ],
      },
    ],
  },
];

// A compact history entry — demoted full cycles (and, eventually, any pre-editorial scorebook
// Andres compiles, same as Shiyu's).
export interface AssaultHistoryEntry {
  id: string;
  date: string; // cycle start date, YYYY-MM-DD ("" until supplied)
  label: string;
  score: number;
  rank: string;
  pips: number; // of 9
  teams?: AssaultMember[][]; // per-room trios, in room order
}

const BY_PROFILE: Record<string, AssaultCycle[]> = {
  [PROFILE_KEY]: CYCLES,
};

export function assaultCyclesFor(profileKey: string): AssaultCycle[] {
  return BY_PROFILE[profileKey] ?? [];
}

function toHistory(c: AssaultCycle): AssaultHistoryEntry {
  return {
    id: c.id,
    date: c.date ?? "",
    label: c.label,
    score: c.bestTotal,
    rank: c.rank,
    pips: c.rooms.reduce((n, r) => n + r.pips, 0),
    teams: c.rooms.length ? c.rooms.map((r) => r.team) : undefined,
  };
}

// Everything below the marquee, newest first. (ISO dates sort lexicographically.)
export function assaultHistoryFor(profileKey: string): AssaultHistoryEntry[] {
  return (BY_PROFILE[profileKey] ?? []).slice(1).map(toHistory).sort((x, y) => y.date.localeCompare(x.date));
}

export function hasAssault(profileKey: string): boolean {
  return (BY_PROFILE[profileKey]?.length ?? 0) > 0;
}

// Total pips across a cycle's rooms (out of rooms × 3) — the season readout's 9/9.
export function cyclePips(c: AssaultCycle): { earned: number; max: number } {
  return { earned: c.rooms.reduce((n, r) => n + r.pips, 0), max: c.rooms.length * 3 };
}
