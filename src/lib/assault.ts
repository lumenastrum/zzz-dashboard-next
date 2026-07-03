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
  // The Current Buff Andres ran. slug -> /assets/ui/da-buff-<slug>.webp — an icon ARCHETYPE
  // (element/atk/ruin) the game reuses across rotations under fresh names; desc = wiki effect
  // text (fandom Deadly_Assault/<date> page), surfaced as the chip's tooltip.
  buff?: { name: string; slug: string; desc?: string };
  pips: number; // challenge-target pips earned, 0–3
  targets?: [number, number, number]; // score thresholds; defaults to ASSAULT_TARGETS
  scores: { total: number; damage: number; performance: number };
  team: AssaultMember[]; // the 3 agents that ran it
  bangboo?: { name: string; slug: string }; // 4th slot -> /assets/bangboo/<slug>.webp
}

// Career medal tallies from the result screen's badge plate — crown = top-tier medal, shield =
// second tier (Andres-confirmed 2026-07-01). Account-wide totals, not per-cycle.
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
// Girtablullu rotation fully authored 2026-07-01: lineups + bangboos + medal semantics from
// Andres, buffs + dates from the fandom wiki (icons matched against his result screenshots).
// Scores/pips/attributes/gimmicks are screenshot-exact. Nothing pending.
const CYCLES: AssaultCycle[] = [
  {
    id: "da-girtablullu-2026-06",
    label: "Girtablullu Rotation",
    date: "2026-06-19", // runs 06/19 04:00 → 07/03 03:59 server time (fandom wiki)
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
        buff: {
          name: "Northern Wind",
          slug: "element",
          desc: "Agent ATK +10%. Inflicting Vortex raises the squad's ATK +5% and Anomaly Proficiency +10 for 15s (stacks ×3). Wind/Ice Anomalies cut the enemy's DEF 10% for 20s.",
        },
        pips: 3,
        scores: { total: 47282, damage: 42282, performance: 5000 },
        team: [
          { slug: "aria", name: "Aria" },
          { slug: "velina", name: "Velina" },
          { slug: "yuzuha", name: "Yuzuha" },
        ],
        bangboo: { name: "Ultra Jet", slug: "ultrajet" },
      },
      {
        room: 2,
        boss: { name: "Marionette", tag: "Notorious", slug: "notoriousmarionette", level: 70 },
        timeLimit: "03m 00s",
        recommended: ["Ice", "Ether"],
        resistance: [],
        gimmick:
          "Boss DMG +25%; destroying a clone (or stunning the main body) stacks On Thin Ice — each cuts boss DMG 5% and raises its Ice/Ether DMG taken 10%.",
        buff: {
          name: "Shatter",
          slug: "ruin",
          desc: "Agent Sheer DMG +20%, HP +15%. After an EX Special, Rupture agents deal +40% CRIT DMG and their EX Special/Ultimate ignore 15% of enemy Physical and Ether RES for 15s.",
        },
        pips: 3,
        scores: { total: 45086, damage: 40886, performance: 4200 },
        team: [
          { slug: "yixuan", name: "Yixuan" },
          { slug: "jufufu", name: "Ju Fufu" },
          { slug: "lucia", name: "Lucia" },
        ],
        bangboo: { name: "Belion", slug: "belion" },
      },
      {
        room: 3,
        boss: { name: "Ye Shiyuan the Thrall", slug: "yeshiyuanthethrall", level: 70 },
        timeLimit: "03m 00s",
        recommended: ["Ice", "Physical", "Wind"],
        specialty: "Stun",
        resistance: ["Electric"],
        gimmick:
          "As Sobek and the Thrall alternate turns, the Thrall stacks Contract (+15% Anomaly Buildup RES each) and Self-Sacrifice, up to 3; stunned, he takes +50% CRIT DMG.",
        buff: {
          name: "Onslaught",
          slug: "atk",
          desc: "Attack agents' Ether and Ice DMG +35%. Basic Attacks and Ultimates deal +20% DMG ignoring 10% DEF. After a Chain or EX Special, CRIT DMG +45% for 20s.",
        },
        pips: 3,
        scores: { total: 41005, damage: 36005, performance: 5000 },
        team: [
          { slug: "yeshunguang", name: "Ye Shunguang" },
          { slug: "dialyn", name: "Dialyn" },
          { slug: "sunna", name: "Sunna" },
        ],
        bangboo: { name: "Sprout", slug: "sprout" },
      },
    ],
  },
];

// One target row on a history card — the in-game history screen shows boss + pips + team + score
// per target, so (unlike Shiyu's history, which drops enemy data) we keep the full row.
export interface AssaultHistoryTarget {
  boss: string; // display name as the history card shows it, e.g. "Discordant Solo - ???"
  // -> /assets/bosses/<slug>.webp — the in-game target-rail head banner (staged by
  // stage-assault.py). Optional: unmapped bosses just render without a mugshot.
  bossSlug?: string;
  score: number;
  pips: number; // 0–3
  team: AssaultMember[];
  bangboo?: { name: string; slug: string };
}

// A compact history entry — demoted full cycles + the pre-editorial scorebook below.
export interface AssaultHistoryEntry {
  id: string;
  date: string; // cycle unlock date, YYYY-MM-DD
  label: string; // our rotation name (headline = first target's boss)
  score: number;
  rank: string;
  pips: number; // of 9
  targets?: AssaultHistoryTarget[]; // per-target rows, in target order
}

// Pre-editorial scorebook (Andres's in-game history screen + compiled rosters, 2026-07-01).
// 14-day cadence, every target 3-pipped across all five rotations. NB: Andres's notes said
// "05/28" for one cycle — the screenshot reads 05/08 Unlocked and the cadence + team match
// confirm it, so 05/08 is canon. Per-cycle score sums verified against Best Total, all five.
const HISTORY: AssaultHistoryEntry[] = [
  {
    id: "da-miasmicfiend-2026-06", date: "2026-06-05", label: "Miasmic Fiend Rotation", score: 117112, rank: "4.05%", pips: 9,
    targets: [
      {
        boss: "Miasmic Fiend - Unfathomable", bossSlug: "miasmicfiend", score: 42366, pips: 3,
        team: [{ slug: "janedoe", name: "Jane Doe" }, { slug: "velina", name: "Velina" }, { slug: "yuzuha", name: "Yuzuha" }],
        bangboo: { name: "Ultra Jet", slug: "ultrajet" },
      },
      {
        boss: "Ye Shiyuan the Thrall", bossSlug: "yeshiyuanthethrall", score: 38238, pips: 3,
        team: [{ slug: "yeshunguang", name: "Ye Shunguang" }, { slug: "dialyn", name: "Dialyn" }, { slug: "sunna", name: "Sunna" }],
        bangboo: { name: "Sprout", slug: "sprout" },
      },
      {
        boss: "The Defiler", bossSlug: "isoldethedefiler", score: 36508, pips: 3,
        team: [{ slug: "seed", name: "Seed" }, { slug: "cissia", name: "Cissia" }, { slug: "astra", name: "Astra Yao" }],
        bangboo: { name: "Snap", slug: "snap" },
      },
    ],
  },
  {
    id: "da-deadendbutcher-2026-05", date: "2026-05-22", label: "Dead End Butcher Rotation", score: 97949, rank: "5.51%", pips: 9,
    targets: [
      {
        boss: "Notorious - Dead End Butcher", bossSlug: "notoriousdeadendbutcher", score: 31160, pips: 3,
        team: [{ slug: "miyabi", name: "Miyabi" }, { slug: "vivian", name: "Vivian" }, { slug: "astra", name: "Astra Yao" }],
        bangboo: { name: "Robin", slug: "robin" },
      },
      {
        boss: "Ye Shiyuan the Thrall", bossSlug: "yeshiyuanthethrall", score: 30295, pips: 3,
        team: [{ slug: "yidhari", name: "Yidhari" }, { slug: "dialyn", name: "Dialyn" }, { slug: "lucia", name: "Lucia" }],
        bangboo: { name: "Ms. Esme", slug: "msesme" },
      },
      {
        boss: "Discordant Solo - ???", bossSlug: "discordantsolo", score: 36494, pips: 3,
        team: [{ slug: "aria", name: "Aria" }, { slug: "nangongyu", name: "Nangong Yu" }, { slug: "yuzuha", name: "Yuzuha" }],
        bangboo: { name: "Biggest Fan", slug: "biggestfan" },
      },
    ],
  },
  {
    id: "da-scorchedhorizon-2026-05", date: "2026-05-08", label: "Scorched Horizon Rotation", score: 98817, rank: "7.78%", pips: 9,
    targets: [
      {
        boss: "??? of the Scorched Horizon", bossSlug: "scorchedhorizon", score: 32792, pips: 3,
        team: [{ slug: "miyabi", name: "Miyabi" }, { slug: "nangongyu", name: "Nangong Yu" }, { slug: "astra", name: "Astra Yao" }],
        bangboo: { name: "Robin", slug: "robin" },
      },
      {
        boss: "Wandering Hunter", bossSlug: "wanderinghunter", score: 32490, pips: 3,
        team: [{ slug: "yidhari", name: "Yidhari" }, { slug: "dialyn", name: "Dialyn" }, { slug: "lucia", name: "Lucia" }],
        bangboo: { name: "Ms. Esme", slug: "msesme" },
      },
      {
        boss: "The Defiler", bossSlug: "isoldethedefiler", score: 33535, pips: 3,
        team: [{ slug: "seed", name: "Seed" }, { slug: "cissia", name: "Cissia" }, { slug: "sunna", name: "Sunna" }],
        bangboo: { name: "Snap", slug: "snap" },
      },
    ],
  },
  {
    id: "da-sanguinesweeper-2026-04", date: "2026-04-24", label: "Sanguine Sweeper Rotation", score: 104840, rank: "3.91%", pips: 9,
    targets: [
      {
        boss: "Sanguine Sweeper", bossSlug: "sanguinesweeper", score: 37122, pips: 3,
        team: [{ slug: "aria", name: "Aria" }, { slug: "nangongyu", name: "Nangong Yu" }, { slug: "sunna", name: "Sunna" }],
        bangboo: { name: "Biggest Fan", slug: "biggestfan" },
      },
      {
        boss: 'Primordial Nightmare - "The Creator"', bossSlug: "nineveh", score: 29461, pips: 3,
        team: [{ slug: "yeshunguang", name: "Ye Shunguang" }, { slug: "dialyn", name: "Dialyn" }, { slug: "zhao", name: "Zhao" }],
        bangboo: { name: "Sprout", slug: "sprout" },
      },
      {
        boss: "The Defiler", bossSlug: "isoldethedefiler", score: 38257, pips: 3,
        team: [{ slug: "seed", name: "Seed" }, { slug: "cissia", name: "Cissia" }, { slug: "astra", name: "Astra Yao" }],
        bangboo: { name: "Plugboo", slug: "plugboo" },
      },
    ],
  },
  {
    id: "da-discordantsolo-2026-04", date: "2026-04-10", label: "Discordant Solo Rotation", score: 124329, rank: "2.58%", pips: 9,
    targets: [
      {
        boss: "Discordant Solo - ???", bossSlug: "discordantsolo", score: 40414, pips: 3,
        team: [{ slug: "aria", name: "Aria" }, { slug: "nangongyu", name: "Nangong Yu" }, { slug: "yuzuha", name: "Yuzuha" }],
        bangboo: { name: "Biggest Fan", slug: "biggestfan" },
      },
      {
        boss: "Unknown Corruption Complex", bossSlug: "complexcorrupted", score: 40572, pips: 3,
        team: [{ slug: "seed", name: "Seed" }, { slug: "cissia", name: "Cissia" }, { slug: "astra", name: "Astra Yao" }],
        bangboo: { name: "Plugboo", slug: "plugboo" },
      },
      {
        boss: "Ye Shiyuan the Thrall", bossSlug: "yeshiyuanthethrall", score: 43343, pips: 3,
        team: [{ slug: "yeshunguang", name: "Ye Shunguang" }, { slug: "dialyn", name: "Dialyn" }, { slug: "sunna", name: "Sunna" }],
        bangboo: { name: "Sprout", slug: "sprout" },
      },
    ],
  },
];

const BY_PROFILE: Record<string, AssaultCycle[]> = {
  [PROFILE_KEY]: CYCLES,
};

const HISTORY_BY_PROFILE: Record<string, AssaultHistoryEntry[]> = {
  [PROFILE_KEY]: HISTORY,
};

export function assaultCyclesFor(profileKey: string): AssaultCycle[] {
  return BY_PROFILE[profileKey] ?? [];
}

// Demote a full editorial cycle to a history card — target rows come along for free.
function toHistory(c: AssaultCycle): AssaultHistoryEntry {
  return {
    id: c.id,
    date: c.date ?? "",
    label: c.label,
    score: c.bestTotal,
    rank: c.rank,
    pips: c.rooms.reduce((n, r) => n + r.pips, 0),
    targets: c.rooms.length
      ? c.rooms.map((r) => ({
          boss: r.boss.tag ? `${r.boss.tag} - ${r.boss.name}` : r.boss.name,
          // room slugs double as boss-icon slugs (stage-assault.py stages both under them),
          // so demoted cycles keep their history mugshots for free
          bossSlug: r.boss.slug,
          score: r.scores.total,
          pips: r.pips,
          team: r.team,
          bangboo: r.bangboo,
        }))
      : undefined,
  };
}

// Everything below the marquee: demoted full cycles + the pre-editorial scorebook, newest first.
// (ISO dates sort lexicographically.)
export function assaultHistoryFor(profileKey: string): AssaultHistoryEntry[] {
  const demoted = (BY_PROFILE[profileKey] ?? []).slice(1).map(toHistory);
  const legacy = HISTORY_BY_PROFILE[profileKey] ?? [];
  return [...demoted, ...legacy].sort((x, y) => y.date.localeCompare(x.date));
}

export function hasAssault(profileKey: string): boolean {
  return (BY_PROFILE[profileKey]?.length ?? 0) > 0;
}

// Total pips across a cycle's rooms (out of rooms × 3) — the season readout's 9/9.
export function cyclePips(c: AssaultCycle): { earned: number; max: number } {
  return { earned: c.rooms.reduce((n, r) => n + r.pips, 0), max: c.rooms.length * 3 };
}
