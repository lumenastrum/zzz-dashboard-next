// Deadly Assault logs — the second, rotating endgame mode (sibling to shiyu.ts, same editorial
// pattern: in-code, profile-keyed, newest cycle first). A cycle is a boss trio; each room is a
// 3-minute score attack against one boss. Score = Damage Score + Performance Points (perf caps
// at 5,000). Each room's Challenge Target ladder (6,000 / 14,000 / 20,000 pts) awards up to 3
// pips (ui/da-pip.webp); a full cycle is 9. Per A., each room records the recommended
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
  // The room's in-game name when it isn't a plain numbered target. Version 3.1 split the mode
  // into three "Trial Mode" challenges + a harder "Adversity Mode" node with its own goalposts,
  // so the header reads this instead of "Target N" when set.
  label?: string;
  boss: AssaultBoss;
  timeLimit?: string; // the room's clock, e.g. "03m 00s" — a time LIMIT, not a clear time
  recommended: string[]; // recommended attribute(s), e.g. ["Ice", "Ether"]; [] renders "None"
  specialty?: string; // "Suitable for Agents with X specialty" — e.g. "Anomaly", "Stun"
  resistance: string[]; // powerful-enemy resistance(s); [] renders as "None"
  gimmick?: string; // one-line Enemy Details mechanic, abridged
  // The Current Buff A. ran. slug -> /assets/ui/da-buff-<slug>.webp — an icon ARCHETYPE
  // (element/atk/ruin) the game reuses across rotations under fresh names; desc = wiki effect
  // text (fandom Deadly_Assault/<date> page), surfaced as the chip's tooltip.
  buff?: { name: string; slug: string; desc?: string };
  pips: number; // challenge-target pips earned, 0–3
  targets?: [number, number, number]; // score thresholds; defaults to ASSAULT_TARGETS
  scores: { total: number; damage: number; performance: number };
  // Set when the boss actually DIED inside the time limit instead of the clock running out.
  // A kill maxes the damage score at DAMAGE_MAX (60,000); performance already caps at 5,000,
  // so a killed room reads exactly 65,000 — a perfect, not a coincidence. Worth a stamp.
  killed?: boolean;
  team: AssaultMember[]; // the 3 agents that ran it
  bangboo?: { name: string; slug: string }; // 4th slot -> /assets/bangboo/<slug>.webp
}

// Career medal tallies from the result screen's badge plate — crown = top-tier medal, shield =
// second tier (A.-confirmed 2026-07-01). Account-wide totals, not per-cycle.
export interface AssaultMedals {
  crown: number;
  // Trial Mode's plate shows two tallies; Adversity Mode's shows only a crowned badge (its
  // second slot displays the best score, not a second medal count), so this stays optional.
  shield?: number;
}

// Adversity Mode — Version 3.1's separate "extra hard" Deadly Assault node. It runs alongside
// the three Trial Mode targets but is scored entirely in its own right: its own total, its own
// ranking percentile, its own badge plate (A.-confirmed 2026-08-01). Its score does NOT pool
// into the Trial Mode best total, which is why it lives BESIDE `rooms` and never inside it —
// folding it in would silently inflate `bestTotal` and push the pip tally to 12 when Trial Mode
// is scored out of 9.
export interface AssaultAdversity {
  room: AssaultRoom; // same poster shape; carries its own `targets` ladder
  bestTotal: number;
  rank: string;
  medals?: AssaultMedals;
}

export interface AssaultCycle {
  id: string;
  label: string; // rotation name — we name cycles by the headline boss
  date?: string; // cycle start date, YYYY-MM-DD (when A. supplies it)
  bestTotal: number; // sum of the Trial Mode trio's best scores — Adversity is NOT included
  rank: string; // percentile string, e.g. "2.47%"
  medals?: AssaultMedals;
  rooms: AssaultRoom[]; // Trial Mode targets only
  adversity?: AssaultAdversity; // 3.1+ rotations only
}

// The standard Trial Mode Challenge Target ladder; per-room `targets` overrides it.
export const ASSAULT_TARGETS: [number, number, number] = [6000, 14000, 20000];

// Adversity Mode's own, harder ladder (Version 3.1).
export const ADVERSITY_TARGETS: [number, number, number] = [10000, 20000, 30000];

// Score ceilings for a Trial Mode room. Killing the boss inside the limit maxes the damage
// score outright — A.-confirmed 2026-08-01 when Remielle's squad killed Girtablullu and the
// room read exactly 60,000 + 5,000. So 65,000 is a perfect room, and the meters should say so.
// The 60,000 kill-zone PREDATES 3.1 (A.-confirmed same day), which is why the Damage VU bar
// scales against it for every logged rotation, not just 3.1+ ones. Nobody had ever reached it
// before — the previous best single room was 48,170 (07/17, Notorious Pompey).
export const DAMAGE_MAX = 60000;
export const PERFORMANCE_MAX = 5000;

// Newest cycle first. CYCLES[0] gets the marquee; older entries demote to the history shelf
// (via toHistory). To log a new rotation: author it HERE at the top — done.
//
// Girtablullu rotation fully authored 2026-07-01: lineups + bangboos + medal semantics from
// A., buffs + dates from the fandom wiki (icons matched against his result screenshots).
// Scores/pips/attributes/gimmicks are screenshot-exact. Nothing pending.
const CYCLES: AssaultCycle[] = [
  // 07/29 rotation — Version 3.1 "The Long Goodbye". The patch reset the mode MID-CADENCE:
  // it superseded the 07/17 cycle on 07/29 05:59, twelve days in, not the fourteen the cadence
  // implied. 3.1 also renamed the three targets "Trial Mode" and added a separately-scored
  // Adversity Mode alongside them (see AssaultAdversity).
  //
  // Named for the kill, not the boss — A.'s call, and it earns it. Remielle Dan came home on
  // 07/29 and five days later put Girtablullu on the floor: the first boss DEATH in the whole
  // log. A kill maxes the damage score at DAMAGE_MAX, so Target 1 reads a perfect 65,000.
  // Two more firsts: 155,461 is a ~22k rotation PB (old best 133,373) and 1.59% is the best
  // ranking ever (old best 1.81%). All three targets were led by a Void Hunter — Remielle,
  // Miyabi, Ye Shunguang, three of the four we own, one per room.
  //
  // Sourcing note: A.'s screenshots are PRIMARY here. The fandom page's Stage Details block
  // reads "Weakness: None" on every challenge, but that field is NOT the in-game Recommended
  // Attributes row — the wiki carries real weaknesses as enemy-card icons instead. Target 1
  // genuinely is None; Targets 2 and 3 are not. Use the wiki for buff/mechanic prose only.
  {
    id: "da-angelfall-2026-07",
    label: "Angelfall Rotation",
    date: "2026-07-29", // runs 07/29 10:00 UTC+8 → 08/13 03:59 server time (fandom wiki)
    bestTotal: 155461,
    rank: "1.59%",
    medals: { crown: 21, shield: 9 }, // 20→21: this rotation crowned
    rooms: [
      {
        room: 1,
        boss: { name: "Girtablullu - Stagnant Aberrant", slug: "girtablullu", level: 70 },
        timeLimit: "03m 00s",
        recommended: [], // screen reads "None" — this one really is attribute-agnostic
        specialty: "Anomaly",
        resistance: [],
        gimmick:
          "Each Attribute Anomaly stacks a matching Blight Mark (30s, ×2) — every stack raises Attribute Anomaly DMG taken 8% and Corruptive Barrier DMG taken 8%; inflicting Impaired or Shutdown grants the squad +60 Anomaly Proficiency for 30s.",
        buff: {
          name: "United Strength",
          slug: "element",
          desc: "2/3 Anomaly-specialty Agents grant the squad +30/+70 Anomaly Proficiency and +10%/+25% Attribute Anomaly DMG. Inflicting an Attribute Anomaly cuts the enemy's All-Attribute RES 15% for 10s.",
        },
        pips: 3,
        killed: true, // the boss DIED — damage maxed, hence the exactly-round 65,000
        scores: { total: 65000, damage: 60000, performance: 5000 },
        team: [
          { slug: "remielledan", name: "Remielle Dan" },
          { slug: "janedoe", name: "Jane Doe" },
          { slug: "velina", name: "Velina" },
        ],
        bangboo: { name: "Ariel", slug: "ariel" },
      },
      {
        room: 2,
        boss: { name: "Dead End Butcher", tag: "Notorious", slug: "notoriousdeadendbutcher", level: 70 },
        timeLimit: "03m 00s",
        recommended: ["Ice", "Ether"],
        resistance: [],
        gimmick:
          "Attribute Anomaly deals +50% DMG to boss enemies. In its Ether Enhanced state the Butcher takes 15% less DMG and 30% less Daze — triggering Disorder forces it out immediately, and each Disorder banks 300 Performance Points (cap 5,000).",
        buff: {
          name: "Sneak Attack",
          slug: "atk",
          desc: "Agent ATK +10%, Anomaly Proficiency +30, CRIT DMG +40%. Inflicting an Attribute Anomaly cuts the enemy's DEF 10% for 10s.",
        },
        pips: 3,
        scores: { total: 40653, damage: 35653, performance: 5000 },
        team: [
          { slug: "miyabi", name: "Miyabi" },
          { slug: "nangongyu", name: "Nangong Yu" },
          { slug: "astra", name: "Astra Yao" },
        ],
        bangboo: { name: "Biggest Fan", slug: "biggestfan" },
      },
      {
        room: 3,
        boss: { name: "Unknown Corruption Complex", slug: "complexcorrupted", level: 70 },
        timeLimit: "03m 00s",
        recommended: ["Electric", "Ether"],
        resistance: [],
        gimmick:
          "Enough DMG to the boss's legs triggers Impaired; breaking them restores 1,000 Decibels and stacks Disintegration (20s, ×4), each stack adding +25% CRIT DMG on hit. Each successful impair banks 800 Performance Points (cap 5,000).",
        buff: {
          name: "Heartcrusher",
          slug: "atk", // same archetype icon as Sneak Attack — correct, the game reuses it
          desc: "Agent CRIT DMG +30%. Attack-specialty Agents gain +10% ATK and +30% Basic Attack DMG, and their Basic Attacks ignore 15% of enemy DEF.",
        },
        pips: 3,
        // A. ran the in-element Seed/Cissia/Astra shell first for ~40k, then threw the
        // off-element Ye Shunguang Void Hunter shell at it and beat the Electric team outright.
        // 49,808 also breaks that shell's own all-time room record (48,170 vs Pompey, 07/17).
        scores: { total: 49808, damage: 44808, performance: 5000 },
        team: [
          { slug: "yeshunguang", name: "Ye Shunguang" },
          { slug: "dialyn", name: "Dialyn" },
          { slug: "sunna", name: "Sunna" },
        ],
        bangboo: { name: "Sprout", slug: "sprout" },
      },
    ],
    // 3.1's separate "extra hard" node — its own board, so none of this touches bestTotal above.
    // A. 3-pipped it on the harder 10k/20k/30k ladder with the same squad that killed Target 1.
    // Its badge plate differs from Trial's: one crowned badge (×1) and a second slot that shows
    // the best score rather than a second tally — hence no `shield`.
    adversity: {
      bestTotal: 34308,
      rank: "7.54%",
      medals: { crown: 1 },
      room: {
        room: 4, // keeps the anchor id unique; `label` suppresses the "Target 4" header + watermark
        label: "Adversity Mode",
        boss: { name: "Integrated - Girtablullu", slug: "girtablullu", level: 70 },
        timeLimit: "03m 00s",
        recommended: [],
        resistance: [],
        targets: ADVERSITY_TARGETS,
        gimmick:
          "Every Agent hit stacks 1 Dissonance (max 1/s per Agent); at 10 the stacks clear and the boss enters Dissonant — +40% Attribute Anomaly DMG taken for 10s. Inflicting an Attribute Anomaly grants the squad Transmutation (+15% DMG dealt, +20 Anomaly Proficiency, 10s). Parries, Chain Parries and a fast Corruptive Barrier break bank Performance Points (cap 5,000).",
        buff: {
          name: "United Strength",
          slug: "element",
          desc: "2/3 Anomaly-specialty Agents grant the squad +30/+70 Anomaly Proficiency and +10%/+25% Attribute Anomaly DMG. Inflicting an Attribute Anomaly cuts the enemy's All-Attribute RES 15% for 10s.",
        },
        pips: 3,
        // ⚠️ UNVERIFIED: the Damage meter on this card scales against the Trial DAMAGE_MAX
        // (60,000) because Adversity's own kill-zone has never been observed. Its goalposts are
        // 1.5× Trial's, so its real ceiling is plausibly higher — meaning this bar may understate
        // how close the run got. Confirm the first time a kill lands here, then either give the
        // room its own ceiling or leave it. Nothing else depends on the number.
        scores: { total: 34308, damage: 29308, performance: 5000 },
        team: [
          { slug: "remielledan", name: "Remielle Dan" },
          { slug: "janedoe", name: "Jane Doe" },
          { slug: "velina", name: "Velina" },
        ],
        bangboo: { name: "Ariel", slug: "ariel" },
      },
    },
  },
  // 07/17 rotation, authored from A.'s screenshots 2026-07-17 (day one — the fandom wiki page
  // for this cycle doesn't exist yet, so screenshots are the primary source this time; the boss
  // text was cross-verified word-for-word against the 05/08 page, which unmasks "???" as
  // Phaethon). Scorched Horizon headlines again after 05/08 — hence the "II".
  {
    id: "da-scorchedhorizon-2026-07",
    label: "Scorched Horizon Rotation II",
    // ran 07/17 04:00 → 07/29 05:59, NOT the 07/31 the 14-day cadence implied: Version 3.1
    // dropped on 07/29 and cut the rotation short (wiki-confirmed 2026-08-01). The cadence is
    // not a reliable date oracle across a version boundary — read the rotation's wiki page.
    date: "2026-07-17",
    bestTotal: 129122,
    rank: "2.34%",
    medals: { crown: 20, shield: 9 }, // 18→20: both cycles logged 2026-07-17 crowned
    rooms: [
      {
        room: 1,
        boss: { name: "??? of the Scorched Horizon", slug: "scorchedhorizon", level: 70 },
        timeLimit: "03m 00s",
        recommended: ["Wind", "Ice"],
        specialty: "Anomaly",
        resistance: ["Physical"],
        gimmick:
          "Gale Scorcher grants 5 stacks of Into Flames — each is +10% DMG dealt and −25% CRIT DMG taken; every Anomaly inflicted strips a stack and raises Abloom DMG taken 10% for 15s (stacks ×3).",
        buff: {
          name: "Deconstruction",
          slug: "element",
          desc: "Agent Anomaly Proficiency +45. Inflicting an Attribute Anomaly cuts the enemy's DEF 10% for 10s; triggering Disorder cuts an additional 15% for 10s.",
        },
        pips: 3,
        scores: { total: 33191, damage: 28691, performance: 4500 },
        team: [
          { slug: "miyabi", name: "Miyabi" },
          { slug: "nangongyu", name: "Nangong Yu" },
          { slug: "astra", name: "Astra Yao" },
        ],
        bangboo: { name: "BaddieBoo", slug: "baddieboo" },
      },
      {
        room: 2,
        boss: { name: "Pompey", tag: "Notorious", slug: "notoriouspompey", level: 70 },
        timeLimit: "03m 00s",
        recommended: ["Fire"],
        resistance: ["Electric"],
        gimmick:
          "Defensive Assists and Chain Attacks each apply a 20s stack of Weakening (durations tracked separately) — Agent CRIT DMG +15% per stack on the target.",
        buff: {
          name: "Oblivion",
          slug: "atk",
          desc: "Agent Daze +20%; Ultimates and Chain Attacks ignore 30% of the enemy's All-Attribute RES. After a Chain Attack, squad ATK +10% and CRIT DMG +15% for 20s (stacks ×3).",
        },
        pips: 3,
        scores: { total: 48170, damage: 46770, performance: 1400 },
        team: [
          { slug: "yeshunguang", name: "Ye Shunguang" },
          { slug: "dialyn", name: "Dialyn" },
          { slug: "sunna", name: "Sunna" },
        ],
        bangboo: { name: "Sprout", slug: "sprout" },
      },
      {
        room: 3,
        boss: { name: "Miasmic Fiend - Unfathomable", slug: "miasmicfiend", level: 70 },
        timeLimit: "03m 00s",
        recommended: ["Physical", "Ether"],
        specialty: "Anomaly",
        resistance: ["Fire"],
        gimmick:
          "Each Attribute Anomaly stacks +8% Anomaly DMG taken (×6); casting Miasmic Shield consumes the stacks, each raising the shield's reduction efficiency 2.5%.",
        buff: {
          name: "Frostbite Breath",
          slug: "element",
          desc: "Agent Wind and Ice DMG +20%, Anomaly Proficiency +20. Inflicting an Attribute Anomaly cuts the enemy's All-DMG RES 10% and raises the squad's Attribute Anomaly DMG 10% for 15s.",
        },
        pips: 3,
        scores: { total: 47761, damage: 42761, performance: 5000 },
        team: [
          { slug: "janedoe", name: "Jane Doe" },
          { slug: "velina", name: "Velina" },
          { slug: "yuzuha", name: "Yuzuha" },
        ],
        bangboo: { name: "Ultra Jake", slug: "ultrajet" },
      },
    ],
  },
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
        bangboo: { name: "Ultra Jake", slug: "ultrajet" },
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

// Pre-editorial scorebook (A.'s in-game history screen + compiled rosters, 2026-07-01).
// 14-day cadence, every target 3-pipped across all five rotations. NB: A.'s notes said
// "05/28" for one cycle — the screenshot reads 05/08 Unlocked and the cadence + team match
// confirm it, so 05/08 is canon. Per-cycle score sums verified against Best Total, all five.
const HISTORY: AssaultHistoryEntry[] = [
  // 07/03 cycle, authored history-direct 2026-07-17 from A.'s result screen (the 07/17 reset
  // superseded it the same day, so it never needed the full marquee treatment). Girtablullu
  // headlines a second consecutive rotation — hence the "II".
  {
    id: "da-girtablullu-2026-07", date: "2026-07-03", label: "Girtablullu Rotation II", score: 128846, rank: "1.81%", pips: 9,
    targets: [
      {
        boss: "Girtablullu", bossSlug: "girtablullu", score: 46894, pips: 3,
        team: [{ slug: "janedoe", name: "Jane Doe" }, { slug: "velina", name: "Velina" }, { slug: "yuzuha", name: "Yuzuha" }],
        bangboo: { name: "Ultra Jake", slug: "ultrajet" },
      },
      {
        boss: 'Primordial Nightmare - "The Creator"', bossSlug: "nineveh", score: 46467, pips: 3,
        team: [{ slug: "yeshunguang", name: "Ye Shunguang" }, { slug: "dialyn", name: "Dialyn" }, { slug: "sunna", name: "Sunna" }],
        bangboo: { name: "Sprout", slug: "sprout" },
      },
      {
        boss: "Ye Shiyuan the Thrall", bossSlug: "yeshiyuanthethrall", score: 35485, pips: 3,
        team: [{ slug: "yixuan", name: "Yixuan" }, { slug: "jufufu", name: "Ju Fufu" }, { slug: "lucia", name: "Lucia" }],
        bangboo: { name: "Belion", slug: "belion" },
      },
    ],
  },
  {
    id: "da-miasmicfiend-2026-06", date: "2026-06-05", label: "Miasmic Fiend Rotation", score: 117112, rank: "4.05%", pips: 9,
    targets: [
      {
        boss: "Miasmic Fiend - Unfathomable", bossSlug: "miasmicfiend", score: 42366, pips: 3,
        team: [{ slug: "janedoe", name: "Jane Doe" }, { slug: "velina", name: "Velina" }, { slug: "yuzuha", name: "Yuzuha" }],
        bangboo: { name: "Ultra Jake", slug: "ultrajet" },
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
