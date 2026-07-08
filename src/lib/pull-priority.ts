// Cosmea's pull-priority wishlist — a her-exclusive, ranked "what to pull next" list driven
// by her current roster + known teams. Ported verbatim from the legacy `wife-data.json`
// `pullRecommendations` block (the old vanilla dashboard baked it into the page, not Supabase).
//
// This is editorial roster analysis, not live-edited gear, so it lives in code (version-controlled)
// rather than the Supabase blob. Re-rank / re-word here when her roster shifts or new agents drop.
//
// `tier` (1–5) drives the VU "signal-strength" meter + heat color on each crate; it's a coarse
// read of `priority` (the exact wording she sees). `emotes` are slugs under public/assets/emotes/
// (staged by scripts/stage-emotes.py). One entry (#8) bundles two alt picks → two cover stickers.

export interface PullRec {
  rank: number;
  name: string;
  section: string;    // ZZZ specialty — card subtitle + type accent
  attribute: string;  // ZZZ element — drives the crate's element accent color
  priority: string;   // exact priority wording (the badge label)
  tier: number;       // 1–5 signal strength (meter fill + heat color)
  emotes: string[];   // emote slug(s) -> /assets/emotes/<slug>.webp
  why: string;
  team: string;
  upcoming?: boolean;  // unreleased — render a "soon" marker + eta instead of a pull-now pick
  eta?: string;        // release window for upcoming units (e.g. "v3.0 Ph.2 · ~Jul 2026")
  leak?: boolean;      // kit/teams sourced from leaks/beta — may change before live
}

// Ordered by rank (the home renders in this order). Tiers: 5 = must-pull, 1 = lowest current need.
export const WIFE_PULL_PRIORITY: PullRec[] = [
  {
    rank: 1, name: "Dialyn", section: "Stun", attribute: "Physical",
    priority: "Highest impact", tier: 5, emotes: ["dialyn"],
    why: "Best single account upgrade because she directly improves Ye Shunguang and Yixuan, two of her strongest foundations — and with Sunna (and her signature) home as of July 8, Dialyn is the LAST missing piece of the premium Ye Shunguang shell. She adds Stun DMG multiplier, longer stun windows, and Ultimate conversion for burst-heavy teams.",
    team: "Primary teams: Ye Shunguang + Dialyn + Sunna (the full premium shell); Yixuan + Dialyn + Lucia. Also flexible as a premium stun slot.",
  },
  // Sunna — PULLED 2026-07-08 (with signature W-engine)! Crate retired from the wishlist;
  // she now lives on the roster. Everything below shifted up one rank.
  {
    rank: 2, name: "Seed", section: "Attack", attribute: "Electric",
    priority: "Very high", tier: 4, emotes: ["seed"],
    why: "Best partner for Cissia and the cleanest way to turn her Electric roster into a real second carry lane. This also improves missing Electric coverage quality beyond solo Cissia/Yanagi setups.",
    team: "Primary team: Seed + Cissia + Astra/Sunna/Nicole. Helps Electric coverage.",
  },
  {
    rank: 3, name: "Burnice", section: "Anomaly", attribute: "Fire",
    priority: "High", tier: 4, emotes: ["burnice"],
    why: "Best Fire-coverage pull for this account because she also plugs into existing Anomaly cores. She gives Fire anomaly, off-field pressure, and Disorder value with Alice, Miyabi, Vivian, Yanagi, and Yuzuha.",
    team: "Primary teams: Alice/Miyabi/Yanagi + Burnice + Yuzuha/Astra. Fills Fire coverage without needing a whole new support shell.",
  },
  {
    rank: 4, name: "Norma", section: "Stun", attribute: "Fire",
    priority: "High · Upcoming", tier: 4, emotes: ["norma"],
    upcoming: true, eta: "v3.0 Ph.2 · ~Jul 2026", leak: true,
    why: "Leaked Fire stunner who drops straight into two lanes she already runs: her Stun-DMG amp and Sheer Force–friendly buffs feed the Yixuan/Yidhari Rupture core, and she takes the stun seat for Ye Shunguang and Cissia. Every support the meta comps want — Lucia, Astra, Zhao — is already on her bench. Held back only by overlapping Ju Fufu and still being beta (numbers may shift).",
    team: "Rupture: Norma + Yixuan/Yidhari + Lucia. Attack: Norma + Ye Shunguang + Astra/Zhao; Norma + Cissia + Astra. Leaked v3.0 Phase 2 — subject to change.",
  },
  {
    rank: 5, name: "Evelyn", section: "Attack", attribute: "Fire",
    priority: "Medium-high", tier: 3, emotes: ["evelyn"],
    why: "Direct Fire DPS coverage if she wants a conventional Fire carry. Lower than Burnice because the account already leans heavily into Anomaly/Rupture cores and Evelyn wants more dedicated chain/stun support.",
    team: "Primary team: Evelyn + Dialyn/Lighter/Ju Fufu + Astra/Lucy/Nicole. Fills pure Fire attack coverage.",
  },
  {
    rank: 6, name: "Pan Yinhu", section: "Rupture", attribute: "Physical",
    priority: "Medium", tier: 3, emotes: ["panyinhu"],
    why: "Useful Rupture specialist for Yixuan/Yidhari teams, especially as an accessible non-limited teammate. Lower priority because she already has Lucia and Ju Fufu, so Rupture is functional now.",
    team: "Primary teams: Yixuan/Yidhari + Lucia + Pan Yinhu/Ju Fufu/Dialyn.",
  },
  {
    rank: 7, name: "Nangong Yu", section: "Stun", attribute: "Ether",
    priority: "Medium-low", tier: 2, emotes: ["nangong"],
    why: "Useful flexible support/utility option for Alice and Vivian-style teams, but less urgent because she already has Yuzuha, Astra, Nicole, Zhao, Vivian, and Yanagi covering those shells.",
    team: "Primary teams: Alice/Vivian + Yuzuha/Nangong Yu + anomaly partner.",
  },
  {
    rank: 8, name: "Lycaon or Soukaku", section: "Stun · Support", attribute: "Ice",
    priority: "Low", tier: 2, emotes: ["lycaon", "soukaku"],
    why: "Optional Miyabi luxury/F2P-friendly Ice lane pieces. Her Miyabi already has strong Disorder teammates in Yanagi, Vivian, Yuzuha, Astra, and Nicole, so this is refinement rather than a core need.",
    team: "Primary team: Miyabi + Lycaon + Soukaku. Helps Ice coverage, but Miyabi is already covered.",
  },
  {
    rank: 9, name: "Trigger", section: "Stun", attribute: "Electric",
    priority: "Low", tier: 2, emotes: ["trigger"],
    why: "Good stun/Aftershock utility and an alternate slot for Electric or Ye teams, but she is less important without Soldier 0 Anby and after adding Dialyn/Ju Fufu/Zhao options.",
    team: "Primary teams: Soldier 0 Anby + Trigger + Orphie/Magus, or flex stun for Ye/Cissia stages.",
  },
  {
    rank: 10, name: "Velina", section: "Anomaly", attribute: "Wind",
    priority: "Low · Off-archetype", tier: 2, emotes: ["velina"],
    why: "Top-tier in a vacuum and the gateway to Wind anomaly — but her Vortex mechanic OVERRIDES Disorder, the exact engine Alice, Miyabi, Yanagi, and Vivian are built on, so she fights her own anomaly core. She owns none of the non-Disorder carries (Jane Doe/Aria/Burnice) that make Velina shine; only Yuzuha synergizes. Skip unless she pulls a dedicated Vortex DPS to build around.",
    team: "Intended: a non-Disorder anomaly DPS + Velina + Yuzuha (Jane Doe / Aria / Burnice). None owned yet — Yuzuha is the only existing piece.",
  },
  {
    rank: 11, name: "Aria", section: "Anomaly", attribute: "Ether",
    priority: "Lowest current need", tier: 1, emotes: ["aria"],
    why: "Strong Ether/Anomaly option, but her account already has heavy Ether presence with Yixuan, Vivian, Lucia, Astra, and Nicole. Pull only if she wants an Ether anomaly carry specifically — though Sunna joining the roster does hand this team its premium support for free.",
    team: "Primary team: Aria + Sunna/Yuzuha + Nangong Yu. Ether coverage is already healthy.",
  },
];

// Per-profile pull-priority list. Only Cosmea (wife-zzz) has one; A.'s view returns [].
const BY_PROFILE: Record<string, PullRec[]> = {
  "wife-zzz": WIFE_PULL_PRIORITY,
};

export function pullPriorityFor(profileKey: string): PullRec[] {
  return BY_PROFILE[profileKey] ?? [];
}

// Whether a profile exposes the Pulls tab at all (gates the nav link + the route's existence).
export function hasPullPriority(profileKey: string): boolean {
  return (BY_PROFILE[profileKey]?.length ?? 0) > 0;
}
