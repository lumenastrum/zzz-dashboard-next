// Cosmea's pull-priority wishlist — a her-exclusive, ranked "what to pull next" list driven
// by her current roster + known teams. Ported verbatim from the legacy `wife-data.json`
// `pullRecommendations` block (the old vanilla dashboard baked it into the page, not Supabase).
//
// This is editorial roster analysis, not live-edited gear, so it lives in code (version-controlled)
// rather than the Supabase blob. Re-rank / re-word here when her roster shifts or new agents drop.
//
// `tier` (1–5) drives the VU "signal-strength" meter + heat color on each crate; it's a coarse
// read of `priority` (the exact wording she sees). `emotes` are slugs under public/assets/emotes/
// (staged by scripts/stage-emotes.py). One entry (#9) bundles two alt picks → two cover stickers.
//
// why/team are rich liner notes (components/liner.tsx): "\n\n" = paragraph break, "\n" = soft
// line break, and agent/element/specialty vocabulary is auto-highlighted at render time.
//
// Last re-rank 2026-07-20: Norma went LIVE (current banner, ends when v3.1 drops Jul 29) and the
// v3.1 "The Long Goodbye" anniversary livestream (Jul 17) confirmed the next wave — Remielle Dan
// (Ph.1) + Sigrid (Ph.2) added, Dialyn's no-50/50 anniversary rerun noted, Trigger claimable free.
// Same day, order re-grounded in pure fit (A.'s call): Seed back above Norma, then Burnice ↔ Evelyn
// swapped — Evelyn opens the missing premium Fire lane; Burnice is a sub-DPS with no home lane here
// (her one Shiyu/DA showing in A.'s history was WITH Velina, who isn't on this roster).
//
// 2026-08-08: Seed PULLED at M0W1 via the Filmgoer Thank-You Gift → her crate retired. Full
// account re-rank against A.'s 6 Shiyu seasons + 9 DA rotations: Dialyn remains the safest
// account-wide completion; Remielle's arrival launches Velina from old #10 to #2; Evelyn remains
// the only premium Fire-lane opener; Nangong's repeated Miyabi receipts move her into the top four.
//
// 2026-08-19: Dialyn PULLED day one of the no-50/50 rescreening (with signature Yesterday Calls)
// → crate retired, ranks 2-11 shift to 1-10. v3.1 Ph.2 went live same day: Sigrid's `upcoming`
// flag dropped (banner runs Aug 19 – Sept 8) and Aria's Ph.1 rerun closed.

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
//
// ORDER SEMANTICS (per A., 2026-07-20): rank = pure roster-fit, best-for-her-account first,
// descending. That's how Cosmea reads it. Availability (live banner, rerun windows, no-50/50)
// DECORATES the badge/eta/why text but never drives the order — a top-fit pick with no banner
// still outranks a lesser fit that happens to be pullable today.
//
// ACCOUNT DOCTRINE (per A., same day): mindscape value is a NO-factor — she never pulls dupes.
// The main factor is COMPLETING PREMIUM TEAM COMPS for endgame room coverage (Shiyu / Deadly
// Assault want several element-diverse premium lanes). A lane-opener outranks a rotational piece;
// a sub-DPS with no home lane on this roster ranks bottom-barrel regardless of vacuum tier.
export const WIFE_PULL_PRIORITY: PullRec[] = [
  // Sunna — PULLED 2026-07-08 (with signature W-engine); crate retired.
  // Remielle Dan — PULLED 2026-08-01 (with signature, Ode of Resurrected Wings); crate retired.
  // Seed — PULLED 2026-08-08 at M0W1 via the v3.1 Filmgoer Thank-You Gift; crate retired.
  // Dialyn — PULLED 2026-08-19 (day one of the no-50/50 Exclusive Rescreening, with signature
  // Yesterday Calls). The premium Ye Shunguang shell is COMPLETE. Crate retired.
  {
    rank: 1, name: "Velina", section: "Anomaly", attribute: "Wind",
    priority: "Very high · Remielle multiplier", tier: 4, emotes: ["velina"],
    why: "Remielle changed the math. Velina is no longer an off-archetype luxury: she opens the account's totally missing Wind lane and completes multiple triple-Anomaly structures around Remielle, Alice, Vivian, or Yanagi.\n\nA.'s receipts prove the ceiling: Velina teams cleared five DA rooms at a 46,076 average even before the 65,000 Remielle/Jane/Velina boss kill is counted. That 65k had a perfect anomaly room buff and stronger mindscapes, so treat it as ceiling proof — not an M0 score promise.\n\nThe Marcel selector went to Lucia M1R1, so Jane is now a future package piece rather than a free shortcut. Velina still has owned Remielle/Alice/Vivian partners without her.",
    team: "Remielle + Alice/Vivian/Yanagi + Velina\nCeiling package: Remielle + Jane Doe + Velina\nAlso opens Wind coverage.",
  },
  {
    rank: 2, name: "Evelyn", section: "Attack", attribute: "Fire",
    priority: "High · Opens the Fire lane", tier: 4, emotes: ["evelyn"],
    why: "The cleanest remaining lane opener. Fire is the only element with no premium main carry on the account, while both teammates are already home: Ju Fufu takes the stun seat and Astra supplies the premium support.\n\nEvelyn alone turns Fire from a coverage hole into a real Shiyu/Deadly Assault room answer. Norma is a later refinement, not a prerequisite.",
    team: "Evelyn + Norma/Ju Fufu + Astra\nCompletes the last uncovered element for endgame room coverage.",
  },
  {
    rank: 3, name: "Nangong Yu", section: "Stun", attribute: "Ether",
    priority: "High · Proven Miyabi finisher", tier: 4, emotes: ["nangong"],
    why: "The other missing stunner with hard receipts. Nangong immediately completes Miyabi + Nangong Yu + Astra — A.'s repeated shell averaged 41,858 across the two scored Shiyu seasons and also cleared three DA rooms.\n\nShe has 12 combined Shiyu/DA appearances across four team shapes, making her a real account-depth pull rather than a single-comp ornament. She ranks below Velina and Evelyn because Miyabi already has functional Yanagi/Vivian variants, but the upgrade is proven.",
    team: "Miyabi + Nangong Yu + Astra\nAlso flexes into Alice/Yanagi anomaly-stun shells.",
  },
  {
    rank: 4, name: "Aria", section: "Anomaly", attribute: "Ether",
    priority: "Medium · Remielle shell", tier: 3, emotes: ["aria"],
    why: "Remielle gives Aria a real owned home now: Aria + Remielle + Vivian/Sunna is a complete triple-Anomaly structure instead of a speculative Ether side project. A.'s Aria teams appear seven times across Shiyu/DA and average 40,328 across four scored DA rooms.\n\nShe stays below the top three because Alice already covers the on-field Anomaly job and Ether is crowded. Her rerun closed with Ph.1 on Aug 19 — save for the next window if the shell still wants her.",
    team: "Aria + Remielle + Vivian/Sunna\nProven alternative: Aria + Nangong Yu/Velina + Sunna/Yuzuha.",
  },
  {
    rank: 5, name: "Norma", section: "Stun", attribute: "Fire",
    priority: "Medium · Future Fire refinement", tier: 3, emotes: ["norma"],
    why: "A flexible generalist stunner with squad buffs who can rotate through Attack and Rupture teams. But she still opens no lane by herself: Dialyn — home as of Aug 19 — owns the premium Ye/Rupture upgrade, and Norma becomes an anchor only after Evelyn or Sigrid joins.\n\nHer banner closed July 29. Save for the rerun if the Fire lane is built; do not treat her as a substitute for its missing carry.",
    team: "Future: Evelyn + Norma + Astra · Sigrid + Norma + Astra\nFlex: Ye/Cissia/Yixuan/Yidhari, when their premium seat is occupied.",
  },
  {
    rank: 6, name: "Burnice", section: "Anomaly", attribute: "Fire",
    priority: "Medium-low · Real Remielle home", tier: 2, emotes: ["burnice"],
    why: "Remielle rescues Burnice from the old 'no home lane' verdict: Remielle + Burnice + Miyabi is now a real owned shell, and Burnice remains a flexible off-field anomaly partner.\n\nThe evidence is still thin — one logged Shiyu room at 43,282, and it used missing Velina — so she stays below the standalone completions. She also does not solve the premium Fire-carry hole; that is Evelyn's job.",
    team: "Remielle + Burnice + Miyabi\nAlternative: Velina + Burnice + Yuzuha.",
  },
  {
    rank: 7, name: "Sigrid", section: "Attack", attribute: "Ice",
    priority: "Medium-low · On banner NOW", tier: 2, emotes: ["sigrid"],
    why: "A premium Ice on-field burst carry whose ideal shell is Sigrid + Norma + Astra. Her debut banner is LIVE (v3.1 Ph.2, Aug 19 – Sept 8).\n\nThe problem is account fit: Ice is already saturated by Miyabi and Yidhari, and Norma is not owned. With Dialyn secured on day one, any pull here is a want and future package, not a coverage fix.",
    team: "Premium: Sigrid + Norma + Astra\nBudget: Sigrid + Lycaon + Soukaku.",
  },
  {
    rank: 8, name: "Pan Yinhu", section: "Support", attribute: "Physical",
    priority: "Low · Passive acquisition", tier: 2, emotes: ["panyinhu"],
    why: "An accessible Rupture specialist for Yixuan/Yidhari teams, but Lucia and Ju Fufu already make both lanes functional — and Dialyn now holds the premium seat.\n\nUseful if acquired incidentally. Do not spend limited-pull currency chasing this slot.",
    team: "Yixuan/Yidhari + Lucia + Pan Yinhu\nBudget alternative only.",
  },
  {
    rank: 9, name: "Trigger", section: "Stun", attribute: "Electric",
    priority: "Low · Selector skipped", tier: 2, emotes: ["trigger"],
    why: "Good Aftershock/stun depth, and Seed + Cissia + Trigger can release Astra for another room. But Electric coverage is already complete, and with Dialyn home, Nangong Yu solves the bigger remaining gap.\n\nThe Marcel selector was spent on Lucia M1R1, correctly prioritizing two owned Rupture lanes over another Electric seat. Do not spend Polychromes chasing Trigger now.",
    team: "Seed + Cissia + Trigger\nFlex stun when Astra is locked elsewhere.",
  },
  {
    rank: 10, name: "Lycaon or Soukaku", section: "Stun · Support", attribute: "Ice",
    priority: "Lowest · Passive acquisition", tier: 1, emotes: ["lycaon", "soukaku"],
    why: "Optional Miyabi luxury pieces only. Miyabi already has Yanagi, Vivian, Yuzuha, and Astra variants, while Ice coverage is saturated by Yidhari too.\n\nTake them from standard/passive acquisition; do not target them with limited currency.",
    team: "Miyabi + Lycaon + Soukaku\nRefinement only — no new lane.",
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
