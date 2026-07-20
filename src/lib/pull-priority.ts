// Cosmea's pull-priority wishlist — a her-exclusive, ranked "what to pull next" list driven
// by her current roster + known teams. Ported verbatim from the legacy `wife-data.json`
// `pullRecommendations` block (the old vanilla dashboard baked it into the page, not Supabase).
//
// This is editorial roster analysis, not live-edited gear, so it lives in code (version-controlled)
// rather than the Supabase blob. Re-rank / re-word here when her roster shifts or new agents drop.
//
// `tier` (1–5) drives the VU "signal-strength" meter + heat color on each crate; it's a coarse
// read of `priority` (the exact wording she sees). `emotes` are slugs under public/assets/emotes/
// (staged by scripts/stage-emotes.py). One entry (#10) bundles two alt picks → two cover stickers.
//
// Last re-rank 2026-07-20: Norma went LIVE (current banner, ends when v3.1 drops Jul 29) and the
// v3.1 "The Long Goodbye" anniversary livestream (Jul 17) confirmed the next wave — Remielle Dan
// (Ph.1) + Sigrid (Ph.2) added, Dialyn's no-50/50 anniversary rerun noted, Trigger claimable free.

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
  eta?: string;        // release window for upcoming units (e.g. "v3.1 Ph.1 · Jul 29 2026")
  leak?: boolean;      // kit/teams sourced from leaks/beta — may change before live
}

// Ordered by rank (the home renders in this order). Tiers: 5 = must-pull, 1 = lowest current need.
export const WIFE_PULL_PRIORITY: PullRec[] = [
  {
    rank: 1, name: "Dialyn", section: "Stun", attribute: "Physical",
    priority: "Highest impact · No-50/50 Aug 19", tier: 5, emotes: ["dialyn"],
    why: "Best single account upgrade because she directly improves Ye Shunguang and Yixuan, two of her strongest foundations — and with Sunna (and her signature) home as of July 8, Dialyn is the LAST missing piece of the premium Ye Shunguang shell. She adds Stun DMG multiplier, longer stun windows, and Ultimate conversion for burst-heavy teams. And now there's a golden window: the v3.1 anniversary \"Exclusive Rescreening\" (Aug 19 – Sept 8) reruns her with NO 50/50 — first pity is guaranteed Dialyn. Plan the pull budget around that banner.",
    team: "Primary teams: Ye Shunguang + Dialyn + Sunna (the full premium shell); Yixuan + Dialyn + Lucia. Also flexible as a premium stun slot.",
  },
  // Sunna — PULLED 2026-07-08 (with signature W-engine)! Crate retired from the wishlist;
  // she now lives on the roster. Everything below shifted up one rank.
  {
    rank: 2, name: "Norma", section: "Stun", attribute: "Fire",
    priority: "High · On banner NOW", tier: 4, emotes: ["norma"],
    why: "LIVE and pullable right now — and her banner closes when v3.1 arrives July 29, so this is the decision window. Everything the leak-era read promised held up: her Stun-DMG amp and Sheer Force–friendly buffs feed the Yixuan/Yidhari Rupture core, and she takes the stun seat for Ye Shunguang and Cissia. Every support the meta comps want — Lucia, Astra, Zhao — is already on her bench. Bonus future-proofing: she's the purpose-built partner (same faction) for Sigrid in v3.1 Phase 2, so pulling Norma now sets up that lane too. Tempered only by overlapping Ju Fufu on the stun seat.",
    team: "Rupture: Norma + Yixuan/Yidhari + Lucia. Attack: Norma + Ye Shunguang + Astra/Zhao; Norma + Cissia + Astra. Later: Norma + Sigrid + Astra if Sigrid joins in Ph.2.",
  },
  {
    rank: 3, name: "Remielle Dan", section: "Anomaly", attribute: "Lumiflux",
    priority: "High · 3.1 Ph.1", tier: 4, emotes: ["remielle"],
    upcoming: true, eta: "v3.1 Ph.1 · Jul 29 2026", leak: true,
    why: "The anniversary headliner — and maybe the best roster-fit pull of v3.1 for THIS account. New Lumiflux-element Anomaly sub-DPS whose whole kit amplifies other agents' anomalies: she primes enemies with Lumiflux Buildup off-field, and when a teammate triggers an Attribute Anomaly it detonates as Refringe, boosting that Anomaly's total damage and banking stacks for a big AoE nuke. Unlike Velina she doesn't override Disorder — she FEEDS on it, which means Alice, Miyabi, Yanagi, Vivian and Yuzuha (her strongest core) are exactly the triple-Anomaly comps Remielle was built for. Reported to stay available the whole patch, not just Phase 1. Kit numbers are still settling post-livestream.",
    team: "Any triple-Anomaly lane she already fields: Alice/Miyabi/Yanagi + Remielle + Vivian/Yuzuha. v3.1 Phase 1 (Jul 29) — exact numbers still beta, verdict may sharpen at launch.",
  },
  {
    rank: 4, name: "Seed", section: "Attack", attribute: "Electric",
    priority: "Very high", tier: 4, emotes: ["seed"],
    why: "Best partner for Cissia and the cleanest way to turn her Electric roster into a real second carry lane. This also improves missing Electric coverage quality beyond solo Cissia/Yanagi setups.",
    team: "Primary team: Seed + Cissia + Astra/Sunna/Nicole. Helps Electric coverage.",
  },
  {
    rank: 5, name: "Burnice", section: "Anomaly", attribute: "Fire",
    priority: "High", tier: 4, emotes: ["burnice"],
    why: "Best Fire-coverage pull for this account because she also plugs into existing Anomaly cores. She gives Fire anomaly, off-field pressure, and Disorder value with Alice, Miyabi, Vivian, Yanagi, and Yuzuha.",
    team: "Primary teams: Alice/Miyabi/Yanagi + Burnice + Yuzuha/Astra. Fills Fire coverage without needing a whole new support shell.",
  },
  {
    rank: 6, name: "Sigrid", section: "Attack", attribute: "Ice",
    priority: "Medium · 3.1 Ph.2", tier: 3, emotes: ["sigrid"],
    upcoming: true, eta: "v3.1 Ph.2 · Aug 19 2026", leak: true,
    why: "Premium Ice on-field burst carry — her Sky Knight stance turns \"Draw\" hits into +crit windows and escalating Holster follow-ups, and her ideal team is literally Norma + Astra, both of which this account can field. Ranked medium because the Attack lane is already premium (Ye Shunguang + Sunna, with Dialyn's guaranteed banner in the same phase) and Ice is covered by Miyabi/Yidhari — she's a want, not a gap. If Norma comes home this week, Sigrid's stock rises: same faction, purpose-built pairing. She also got buffed repeatedly in beta; if those land live, re-evaluate upward.",
    team: "Premium: Sigrid + Norma + Astra. Budget: Sigrid + Lycaon + Soukaku. v3.1 Phase 2 (Aug 19) — shares the phase with Dialyn's no-50/50 rerun, so budget carefully.",
  },
  {
    rank: 7, name: "Evelyn", section: "Attack", attribute: "Fire",
    priority: "Medium-high", tier: 3, emotes: ["evelyn"],
    why: "Direct Fire DPS coverage if she wants a conventional Fire carry. Lower than Burnice because the account already leans heavily into Anomaly/Rupture cores and Evelyn wants more dedicated chain/stun support.",
    team: "Primary team: Evelyn + Dialyn/Lighter/Ju Fufu + Astra/Lucy/Nicole. Fills pure Fire attack coverage.",
  },
  {
    rank: 8, name: "Pan Yinhu", section: "Rupture", attribute: "Physical",
    priority: "Medium", tier: 3, emotes: ["panyinhu"],
    why: "Useful Rupture specialist for Yixuan/Yidhari teams, especially as an accessible non-limited teammate. Lower priority because she already has Lucia and Ju Fufu, so Rupture is functional now.",
    team: "Primary teams: Yixuan/Yidhari + Lucia + Pan Yinhu/Ju Fufu/Dialyn.",
  },
  {
    rank: 9, name: "Nangong Yu", section: "Stun", attribute: "Ether",
    priority: "Medium-low", tier: 2, emotes: ["nangong"],
    why: "Useful flexible support/utility option for Alice and Vivian-style teams, but less urgent because she already has Yuzuha, Astra, Nicole, Zhao, Vivian, and Yanagi covering those shells.",
    team: "Primary teams: Alice/Vivian + Yuzuha/Nangong Yu + anomaly partner.",
  },
  {
    rank: 10, name: "Lycaon or Soukaku", section: "Stun · Support", attribute: "Ice",
    priority: "Low", tier: 2, emotes: ["lycaon", "soukaku"],
    why: "Optional Miyabi luxury/F2P-friendly Ice lane pieces. Her Miyabi already has strong Disorder teammates in Yanagi, Vivian, Yuzuha, Astra, and Nicole, so this is refinement rather than a core need.",
    team: "Primary team: Miyabi + Lycaon + Soukaku. Helps Ice coverage, but Miyabi is already covered.",
  },
  {
    rank: 11, name: "Trigger", section: "Stun", attribute: "Electric",
    priority: "Low · FREE via selector", tier: 2, emotes: ["trigger"],
    why: "Good stun/Aftershock utility and an alternate slot for Electric or Ye teams — but do NOT spend pulls here: the v3.1 anniversary hands out a FREE S-rank selector (Jane Doe / Soldier 0-Anby / Hugo / Trigger / Lucia) plus that agent's signature W-engine. Trigger can be claimed there for zero Polychromes. (Worth weighing Jane Doe from the same selector, though — see the Velina crate.)",
    team: "Primary teams: Soldier 0 Anby + Trigger + Orphie/Magus, or flex stun for Ye/Cissia stages.",
  },
  {
    rank: 12, name: "Velina", section: "Anomaly", attribute: "Wind",
    priority: "Low · Off-archetype", tier: 2, emotes: ["velina"],
    why: "Top-tier in a vacuum and the gateway to Wind anomaly — but her Vortex mechanic OVERRIDES Disorder, the exact engine Alice, Miyabi, Yanagi, and Vivian are built on, so she fights her own anomaly core. She owns none of the non-Disorder carries (Jane Doe/Aria/Burnice) that make Velina shine; only Yuzuha synergizes. One new wrinkle: the v3.1 anniversary free S-rank selector includes Jane Doe — claiming Jane there (with signature) would hand this lane its first real carry for free and soften the anti-synergy argument. Still skip unless that happens.",
    team: "Intended: a non-Disorder anomaly DPS + Velina + Yuzuha (Jane Doe / Aria / Burnice). Jane via the free selector is the cheapest way in — Yuzuha is the only piece owned today.",
  },
  {
    rank: 13, name: "Aria", section: "Anomaly", attribute: "Ether",
    priority: "Lowest current need", tier: 1, emotes: ["aria"],
    why: "Strong Ether/Anomaly option, but her account already has heavy Ether presence with Yixuan, Vivian, Lucia, Astra, and Nicole. Pull only if she wants an Ether anomaly carry specifically — though Sunna joining the roster does hand this team its premium support for free. Heads-up: Aria RERUNS alongside Remielle in v3.1 Phase 1 (Jul 29 – Aug 19), so if the want ever becomes real, that's the window.",
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
