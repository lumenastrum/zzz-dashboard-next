// A.'s ZZZ team "setlists" — curated squad shells that drive the Teams tab. Like
// pull-priority.ts, this is EDITORIAL roster analysis (not live-edited gear), so it lives in
// version-controlled code rather than the Supabase blob.
//
// Sourced from the legacy dashboard's bible (`../zzz-dashboard/docs/zzz-roster-meta-team-comps.md`
// + `…technical-notes.md`). A shell carries a `benchmark` block ONLY when A. actually ran it on
// his account (Shiyu Critical Node, 2026-06-14) — those numbers are PHASE-SPECIFIC (that cycle's
// room buffs/resistances) and shown with their phase context. Shells without a benchmark are
// guide-sourced (Prydwen / Icy Veins) recommendations, tagged as such — no invented scores.

import { PROFILE_KEY } from "./supabase";

export type TeamRole = "Carry" | "Sub-DPS" | "Stun" | "Support" | "Flex";

export interface SetlistMember {
  name: string;
  slug: string; // roster slug -> /assets/teamcards/<slug>.webp + /r/<slug>/
  role: TeamRole;
  section: string; // ZZZ specialty (drives the type icon)
  attribute: string; // ZZZ element (per-card accent color + element icon)
}

export interface SetlistVariant {
  team: string; // "Yixuan / Lucia / Dialyn"
  when: string; // when you'd run this instead
}

export interface SetlistBenchmark {
  score: number; // single-room total from the benchmark log
  carryShare: number; // % of damage the carry contributed (the honest VU meter value)
  label: string; // the headline finding
  phase: string; // phase + room context that keeps the number honest
}

// A single logged run for the Recent Benchmarks sidebar. `score` is the run total; `where` is the
// room/boss/stage label; `date` (YYYY-MM-DD) when known. Add new runs to the front (newest first).
export interface BenchRun {
  score: number;
  where: string;
  date?: string;
}

// Per-shell recent benchmark log, split by endgame mode (the Shiyu/Deadly-Assault toggle).
export interface RecentBench {
  shiyu: BenchRun[];
  deadlyAssault: BenchRun[];
}

export interface Setlist {
  id: string;
  name: string; // shell name
  archetype: string; // role grammar / damage plan
  attribute: string; // shell accent element (the carry's)
  members: SetlistMember[]; // 3 agents, lead first
  benchmark?: SetlistBenchmark; // present only for comps A. benchmarked himself
  roomSignal: string; // when to bring it
  why: string; // why it matters
  variants?: SetlistVariant[];
  caution?: string;
  recent?: RecentBench; // last ~5 top scores per mode (Recent Benchmarks sidebar); fill as runs happen
}

export const ANDRES_SETLISTS: Setlist[] = [
  {
    id: "physical-hypercarry",
    name: "Physical Hypercarry",
    archetype: "Attack hypercarry · DPS + Stun + Support · full Physical synergy",
    attribute: "Honed Edge",
    members: [
      { name: "Ye Shunguang", slug: "yeshunguang", role: "Carry", section: "Attack", attribute: "Honed Edge" },
      { name: "Dialyn", slug: "dialyn", role: "Stun", section: "Stun", attribute: "Physical" },
      { name: "Sunna", slug: "sunna", role: "Support", section: "Support", attribute: "Physical" },
    ],
    benchmark: {
      score: 42138,
      carryShare: 95.1,
      label: "#1 single-room score · beat Evelyn M3 by 7,535",
      phase: "Shiyu Critical Node · 2026-06-14 · Room 3 (optimized)",
    },
    roomSignal: "Physical recommended (even alongside Fire) · CRIT DMG / ATK / EX / Chain / Ultimate buff rooms",
    why:
      "Ye Shunguang is the silent hypercarry — in Physical-friendly rooms she outscored Evelyn M3/W1 by 7,535 points head-to-head. Sunna (highest Prydwen analytics on the roster) and Dialyn make a full Physical squad where every member catches Physical room buffs, and any CRIT DMG room buff patches Ye's known CD deficit for free.",
    variants: [
      { team: "Ye Shunguang / Dialyn / Astra Yao", when: "Sunna locked elsewhere — Astra raises the floor" },
    ],
    caution: "If Physical is resisted, bench her. Consumes Dialyn + Sunna — check lockout availability.",
    recent: {
      shiyu: [
        { score: 42138, where: "Room 3 (opt)", date: "2026-06-14" },
        { score: 41506, where: "Room 3", date: "2026-06-14" },
        { score: 42104, where: "S+ Stage", date: "2026-03-21" },
      ],
      deadlyAssault: [{ score: 46920, where: "Cycle 1" }],
    },
  },
  {
    id: "ice-crit-anomaly",
    name: "Ice Crit-Anomaly Core",
    archetype: "Hybrid crit-anomaly carry · DPS + Stun + Support",
    attribute: "Frost",
    members: [
      { name: "Miyabi", slug: "miyabi", role: "Carry", section: "Anomaly", attribute: "Frost" },
      { name: "Nangong Yu", slug: "nangongyu", role: "Stun", section: "Stun", attribute: "Ether" },
      { name: "Astra Yao", slug: "astra", role: "Support", section: "Support", attribute: "Ether" },
    ],
    benchmark: {
      score: 37190,
      carryShare: 79.6,
      label: "Astra > Yuzuha by 4,332",
      phase: "Shiyu Critical Node · 2026-06-14 · Room 1",
    },
    roomSignal: "Ice recommended · Anomaly / Abloom where Ice is favored · any room with ATK / CRIT / EX buffs",
    why:
      "Miyabi scales off ATK and CRIT, not pure Anomaly — so Astra, who buffs her whole kit, beat Yuzuha, who only buffs the anomaly half, by a canyon. Nangong Yu's anomaly-stun windows also edged out Vivian's Disorder cycling: burst beats sustain when the carry is hybrid.",
    variants: [
      { team: "Miyabi / Vivian / Yuzuha", when: "Ice + Anomaly/Disorder room, Ether not resisted" },
      { team: "Miyabi / Burnice / Yuzuha", when: "Fire anomaly specifically rewarded, or Vivian locked" },
    ],
    caution: "Do NOT default Yuzuha for Miyabi — she's hybrid, not pure Anomaly. Yuzuha is for Alice / Jane.",
    recent: {
      shiyu: [{ score: 37190, where: "Room 1", date: "2026-06-14" }],
      deadlyAssault: [],
    },
  },
  {
    id: "ether-rupture",
    name: "Ether Rupture Core",
    archetype: "Rupture / Sheer hypercarry · DPS + Stun + Support",
    attribute: "Auric Ink",
    members: [
      { name: "Yixuan", slug: "yixuan", role: "Carry", section: "Rupture", attribute: "Auric Ink" },
      { name: "Ju Fufu", slug: "jufufu", role: "Stun", section: "Stun", attribute: "Fire" },
      { name: "Lucia", slug: "lucia", role: "Support", section: "Support", attribute: "Ether" },
    ],
    benchmark: {
      score: 33501,
      carryShare: 90.7,
      label: "Yixuan's Rupture shell · Dialyn swap nets +400",
      phase: "Shiyu Critical Node · 2026-06-14 · Room 2",
    },
    roomSignal: "Sheer DMG / Rupture buff rooms · Ether / Auric Ink not resisted · DEF-ignore favored",
    why:
      "Yixuan is a T0 Rupture carry. Lucia is the best Rupture support (HP, Sheer Force, CRIT DMG, Rupture buffs), and Ju Fufu — her usual partner — is one of her best low-field stun options. Dialyn can swap in for Fufu and actually edges ~400 higher (her damage scales to 400% of Yixuan's Sheer Force) when she's free.",
    variants: [
      { team: "Yixuan / Lucia / Dialyn", when: "Dialyn free — swaps in for Ju Fufu; nets ~+400 (Sheer 400% scaling)" },
      { team: "Yixuan / Lucia / Astra Yao", when: "Lucia needed elsewhere — Astra is the fallback support" },
    ],
    caution: "Yixuan needs CRIT Rate + CRIT DMG farming. If Ether is resisted, Sheer may not fully save her. Never pair a second on-field carry.",
    recent: {
      shiyu: [{ score: 33501, where: "Room 2", date: "2026-06-14" }],
      deadlyAssault: [],
    },
  },
  {
    id: "fire-hypercarry",
    name: "Fire Hypercarry",
    archetype: "Fire Attack hypercarry · DPS + Stun + Support",
    attribute: "Fire",
    members: [
      { name: "Evelyn", slug: "evelyn", role: "Carry", section: "Attack", attribute: "Fire" },
      { name: "Ju Fufu", slug: "jufufu", role: "Stun", section: "Stun", attribute: "Fire" },
      { name: "Astra Yao", slug: "astra", role: "Support", section: "Support", attribute: "Ether" },
    ],
    roomSignal: "Fire recommended · crit / ATK / EX / Chain / Ultimate buff rooms · stun-burst scoring",
    why:
      "Evelyn is the most complete Attack carry on the account (M3/W1, core online). Astra is cited as her single best teammate, and Ju Fufu adds off-field Fire stun + squad CRIT DMG. The cleanest classic hypercarry — but heads up: in Physical-friendly rooms the Ye Shunguang shell outscored an Evelyn M3 baseline by 7,535, so don't auto-default Evelyn.",
    variants: [
      { team: "Evelyn / Lighter / Astra Yao", when: "Ju Fufu locked in a Rupture room" },
      { team: "Evelyn / Ju Fufu / Sunna", when: "Astra saved for Miyabi, or Ether resisted" },
    ],
    caution: "Consumes two premium supports (Astra + Ju Fufu). If Fire is resisted, don't force it despite her investment.",
  },
  {
    id: "physical-anomaly",
    name: "Top-Line Anomaly",
    archetype: "Anomaly / Disorder · Carry + sub-DPS + Support",
    attribute: "Physical",
    members: [
      { name: "Alice", slug: "alice", role: "Carry", section: "Anomaly", attribute: "Physical" },
      { name: "Vivian", slug: "vivian", role: "Sub-DPS", section: "Anomaly", attribute: "Ether" },
      { name: "Yuzuha", slug: "yuzuha", role: "Support", section: "Support", attribute: "Physical" },
    ],
    roomSignal: "Anomaly / Disorder buff rooms · Physical not resisted · off-field application rewarded",
    why:
      "Yuzuha is Alice's best teammate and Vivian her second-best — together they're the premier Anomaly support core: Vivian supplies off-field application + Disorder, Yuzuha buffs, Alice deals the damage. The structurally premium anomaly shell when Vivian isn't resisted.",
    variants: [
      { team: "Alice / Jane Doe / Yuzuha", when: "Mono-Physical / Assault rooms — your Jane M3 unlocks this S-tier comp" },
      { team: "Alice / Burnice / Yuzuha", when: "Vivian locked, or Fire application rewarded" },
    ],
    caution: "Alice's AP needs farming. Vivian is Ether — don't force if Ether is resisted and her contribution is central.",
  },
  {
    id: "angels-anomaly",
    name: "Angels Premium",
    archetype: "Ether Anomaly · on-field DPS + Anomaly-Stun + Support",
    attribute: "Ether",
    members: [
      { name: "Aria", slug: "aria", role: "Carry", section: "Anomaly", attribute: "Ether" },
      { name: "Nangong Yu", slug: "nangongyu", role: "Stun", section: "Stun", attribute: "Ether" },
      { name: "Sunna", slug: "sunna", role: "Support", section: "Support", attribute: "Physical" },
    ],
    roomSignal: "Ether recommended · Abloom buff rooms · anomaly + stun/hybrid support rewarded",
    why:
      "The definitive Angels of Delusion package. Aria is an on-field Ether Anomaly DPS who wants off-field buffers; Sunna activates her faction/core and buffs Cat's Gaze damage, and Nangong Yu is her best stun (Anomaly buffs + Buildup Rate). All three owned — faction-premium.",
    variants: [
      { team: "Aria / Nangong Yu / Yuzuha", when: "Sunna locked, or anomaly buffs matter more for the room" },
    ],
    caution: "Don't run into Ether resistance if Aria is the damage plan. Aria dislikes random on-field anomaly teammates (field-time conflict).",
  },
  {
    id: "ice-rupture",
    name: "Ice Rupture Core",
    archetype: "Ice Rupture / Sheer · DPS + Support + Stun",
    attribute: "Ice",
    members: [
      { name: "Yidhari", slug: "yidhari", role: "Carry", section: "Rupture", attribute: "Ice" },
      { name: "Dialyn", slug: "dialyn", role: "Stun", section: "Stun", attribute: "Physical" },
      { name: "Lucia", slug: "lucia", role: "Support", section: "Support", attribute: "Ether" },
    ],
    roomSignal: "Ice recommended + Sheer / Rupture · rooms where Ether resistance punishes Yixuan",
    why:
      "Yidhari is the Ice answer when Yixuan gets hit by Ether resistance. Dialyn is her main stun — her damage scales to 400% of the Rupture agent's Sheer Force — backed by Lucia, the best Rupture support. Slot her into Ice rooms that also reward Sheer / Rupture.",
    variants: [
      { team: "Yidhari / Lucia / Ju Fufu", when: "Dialyn locked elsewhere — Ju Fufu is the Fire-stun fallback" },
    ],
    caution: "Yidhari's CRIT DMG needs farming. If a room purely rewards Ice Anomaly / Abloom, Miyabi may beat her.",
  },
  {
    id: "electric-attack",
    name: "Electric Double-Attack",
    archetype: "Electric Vanguard core · Attack + Attack (Vanguard) + Support",
    attribute: "Electric",
    members: [
      { name: "Seed", slug: "seed", role: "Carry", section: "Attack", attribute: "Electric" },
      { name: "Cissia", slug: "cissia", role: "Sub-DPS", section: "Attack", attribute: "Electric" },
      { name: "Astra Yao", slug: "astra", role: "Support", section: "Support", attribute: "Ether" },
    ],
    roomSignal: "Electric recommended · double-Attack / Vanguard play acceptable",
    why:
      "Seed's kit needs another Attack Agent as her Vanguard to unlock her big Basic/Ultimate damage, RES ignore, and Steel Charge — Cissia is her best documented Vanguard (~+12% Seed damage vs Orphie & Magus) and feeds squad CRIT DMG. With the Vanguard covered, Astra's universal buffs noticeably outperform a third stun in the support slot.",
    variants: [
      { team: "Seed / Cissia / Trigger", when: "Astra saved elsewhere — Trigger is the stun fallback" },
    ],
    caution: "Seed needs CRIT Rate farming. NOT Seed / Trigger / Astra — that has no Attack Vanguard. Verify Cissia's investment before hard-ranking.",
  },
  {
    id: "electric-crit",
    name: "Electric Crit Shell",
    archetype: "Electric Attack hypercarry · DPS + Stun + Support",
    attribute: "Electric",
    members: [
      { name: "Soldier 0 Anby", slug: "soldier0anby", role: "Carry", section: "Attack", attribute: "Electric" },
      { name: "Trigger", slug: "trigger", role: "Stun", section: "Stun", attribute: "Electric" },
      { name: "Astra Yao", slug: "astra", role: "Support", section: "Support", attribute: "Ether" },
    ],
    roomSignal: "Electric recommended · crit / stun-burst rooms",
    why:
      "A solid Electric crit shell — Soldier 0 Anby (M1/W1, good analytics) with Trigger's Electric stun and Astra's universal buffs. Treat it as a coverage / matchup team rather than a top-priority default.",
    variants: [
      { team: "Soldier 0 Anby / Trigger / Sunna", when: "Astra saved for Miyabi" },
    ],
    caution: "Less battle-tested than the Evelyn / Yixuan shells — a coverage pick, not a default.",
  },
];

// Per-profile setlists. Only A. (andres-zzz) has a benchmarked bible so far; Cosmea's
// shells follow once her cards are staged. A.'s view → these; everyone else → [].
const BY_PROFILE: Record<string, Setlist[]> = {
  [PROFILE_KEY]: ANDRES_SETLISTS,
};

export function setlistsFor(profileKey: string): Setlist[] {
  return BY_PROFILE[profileKey] ?? [];
}

// Whether a profile exposes the Teams tab at all (gates the nav link + the route's content).
export function hasSetlists(profileKey: string): boolean {
  return (BY_PROFILE[profileKey]?.length ?? 0) > 0;
}
