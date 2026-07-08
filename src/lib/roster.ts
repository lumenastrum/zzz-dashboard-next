import type { Agent } from "./types";
import { PROFILE_WIFE } from "./supabase";

export interface RosterEntry {
  name: string;
  slug: string; // portrait filename + route param
  section: string;
  attribute: string;
  mindscape: number;
  el: string; // accent color (solid; void hunters also get the --vh-grad gradient)
  faction?: string;
  title?: string; // custom pill title (e.g. "Void Hunter: Qingming Arbiter")
  voidHunter?: boolean; // elite tier — gradient accent + void-hunter badge
  wifeOnly?: boolean; // in the shared roster for her view, but hidden from the default (A.) view
}

// Full roster — imported from the legacy `andres` Supabase row (real mindscapes), with
// element corrections (Frost/Auric Ink/Honed Edge), accents = each element's sampled color,
// and canonical factions where known (others left for A.). Grouped by section.
// Build data (discs/W-Engine) is NOT in the legacy row, so decks render the identity card
// until a build lands in the andres-zzz blob. el accents mirror ELEMENT_COLOR (deck-config).
export const ROSTER: RosterEntry[] = [
  // — Anomaly —
  { name: "Alice", slug: "alice", section: "Anomaly", attribute: "Physical", mindscape: 1, el: "#fcbf01", faction: "Spook Shack" },
  { name: "Miyabi", slug: "miyabi", section: "Anomaly", attribute: "Frost", mindscape: 1, el: "#39dcf7",
    faction: "Hollow Special Operations Section 6", title: "Void Hunter: Isshin Muga", voidHunter: true },
  { name: "Jane Doe", slug: "janedoe", section: "Anomaly", attribute: "Physical", mindscape: 3, el: "#fcbf01", faction: "Criminal Investigation Special Response Team 29" },
  { name: "Vivian", slug: "vivian", section: "Anomaly", attribute: "Ether", mindscape: 2, el: "#9a4fbb", faction: "Mockingbird" },
  { name: "Burnice", slug: "burnice", section: "Anomaly", attribute: "Fire", mindscape: 0, el: "#f74c0f", faction: "Sons of Calydon" },
  { name: "Aria", slug: "aria", section: "Anomaly", attribute: "Ether", mindscape: 0, el: "#9a4fbb", faction: "Angels of Delusion" },
  { name: "Velina", slug: "velina", section: "Anomaly", attribute: "Wind", mindscape: 1, el: "#95c9ff", faction: "Roscaelifer External Strategy Department" },
  { name: "Yanagi", slug: "yanagi", section: "Anomaly", attribute: "Electric", mindscape: 0, el: "#14b0ff", faction: "Hollow Special Operations Section 6", wifeOnly: true }, // wife-only; mindscape placeholder (she edits)
  // — Attack —
  { name: "Ye Shunguang", slug: "yeshunguang", section: "Attack", attribute: "Honed Edge", mindscape: 1, el: "#9bb4fb",
    faction: "Yunkui Summit", title: "Void Hunter: Qingming Arbiter", voidHunter: true },
  { name: "Evelyn", slug: "evelyn", section: "Attack", attribute: "Fire", mindscape: 3, el: "#f74c0f", faction: "Stars of Lyra" },
  { name: "Ellen", slug: "ellen", section: "Attack", attribute: "Ice", mindscape: 0, el: "#00dada", faction: "Victoria Housekeeping Co." },
  { name: "Soldier 0 Anby", slug: "soldier0anby", section: "Attack", attribute: "Electric", mindscape: 1, el: "#14b0ff", faction: "Defense Force - Silver Squad" },
  { name: "Seed", slug: "seed", section: "Attack", attribute: "Electric", mindscape: 0, el: "#14b0ff", faction: "Obol Squad" },
  { name: "Cissia", slug: "cissia", section: "Attack", attribute: "Electric", mindscape: 0, el: "#14b0ff", faction: "Public Security: Metropolitan Order Division" },
  // — Stun —
  { name: "Ju Fufu", slug: "jufufu", section: "Stun", attribute: "Fire", mindscape: 0, el: "#f74c0f", faction: "Yunkui Summit" },
  { name: "Trigger", slug: "trigger", section: "Stun", attribute: "Electric", mindscape: 0, el: "#14b0ff", faction: "Obol Squad" },
  { name: "Lighter", slug: "lighter", section: "Stun", attribute: "Fire", mindscape: 0, el: "#f74c0f", faction: "Sons of Calydon" },
  { name: "Dialyn", slug: "dialyn", section: "Stun", attribute: "Physical", mindscape: 0, el: "#fcbf01", faction: "Krampus Compliance Authority" },
  { name: "Nangong Yu", slug: "nangongyu", section: "Stun", attribute: "Ether", mindscape: 0, el: "#9a4fbb", faction: "Angels of Delusion" }, // hybrid Stunner — scales off Anomaly Prof (grades via anomaly override)
  // — Support —
  { name: "Astra Yao", slug: "astra", section: "Support", attribute: "Ether", mindscape: 1, el: "#9a4fbb", faction: "Stars of Lyra" },
  { name: "Yuzuha", slug: "yuzuha", section: "Support", attribute: "Physical", mindscape: 0, el: "#fcbf01", faction: "Spook Shack" },
  { name: "Lucia", slug: "lucia", section: "Support", attribute: "Ether", mindscape: 0, el: "#9a4fbb", faction: "Spook Shack" },
  { name: "Sunna", slug: "sunna", section: "Support", attribute: "Physical", mindscape: 0, el: "#fcbf01", faction: "Angels of Delusion" },
  { name: "Zhao", slug: "zhao", section: "Support", attribute: "Ice", mindscape: 0, el: "#00dada", faction: "Krampus Compliance Authority" },
  // — Rupture —
  { name: "Yixuan", slug: "yixuan", section: "Rupture", attribute: "Auric Ink", mindscape: 1, el: "#e9b560",
    faction: "Yunkui Summit", title: "Grandmaster", voidHunter: true },
  { name: "Yidhari", slug: "yidhari", section: "Rupture", attribute: "Ice", mindscape: 0, el: "#00dada", faction: "Spook Shack" },
];

// Per-profile ownership → which roster slugs appear on a profile's home (and get static agent
// pages). Profiles NOT listed here get the full ROSTER (the default A. view). Slug order
// here is cosmetic; the home renders in ROSTER order via rosterFor's filter.
export const PROFILE_ROSTER: Record<string, string[]> = {
  // Wife's roster — derived from her legacy `wife` Supabase row (minus base Anby + Nicole),
  // plus Yanagi. Yanagi + Zhao have no build on A.'s side → identity-only until filled.
  // Sunna pulled 2026-07-08 (with signature) — build cloned from A.'s via scripts/clone-agent.ts.
  "wife-zzz": [
    "alice", "miyabi", "vivian", "yanagi",
    "yeshunguang", "cissia",
    "jufufu",
    "astra", "yuzuha", "lucia", "sunna", "zhao",
    "yixuan", "yidhari",
  ],
};

// Cosmea's account runs every agent at base mindscape (M0). Both the static ROSTER and her
// cloned blob builds inherited A.'s mindscapes, so her views display M0 across the board.
// Centralized here so the rule lives in one place if her account ever varies per-agent later.
// `raw` accepts the roster number (e.g. 1) or a blob string (e.g. "M0"); returns a display string.
export function displayMindscape(profileKey: string, raw: number | string | undefined): string {
  if (profileKey === PROFILE_WIFE) return "M0";
  if (typeof raw === "number") return `M${raw}`;
  return raw ?? "M0";
}

// Roster slice for a profile: its owned slugs (in ROSTER order), or the full roster if unlisted.
export function rosterFor(profileKey: string): RosterEntry[] {
  const slugs = PROFILE_ROSTER[profileKey];
  if (!slugs) return ROSTER.filter((a) => !a.wifeOnly); // default (A.) view hides wife-only agents
  const owned = new Set(slugs);
  return ROSTER.filter((a) => owned.has(a.slug));
}

// Full Alice build (ported from Mockup C) — drives the engine until Supabase is wired.
export const ALICE: Agent = {
  name: "Alice",
  section: "ANOMALY",
  attribute: "Physical",
  specialty: "Anomaly",
  faction: "Spook Shack",
  rank: "S",
  mindscape: "M1",
  level: 60,
  base: { atkPool: 880, AP: 26, AM: 195 },
  wengine: {
    name: "Practiced Perfection",
    rank: "S",
    refine: "R1",
    base: { ATK: 713 },
    advanced: { label: "Anomaly Prof +32%" },
    passive: [
      { label: "+60 Anomaly Mastery", kind: "stat", stat: "Anomaly Mastery", value: 60, scope: "combat" },
      { label: "+45 Anomaly Proficiency (4 stacks)", kind: "stat", stat: "Anomaly Proficiency", value: 45, scope: "combat" },
    ],
  },
  discs: {
    pieces: [
      { slot: 1, set: "Fanged Metal", rank: "S", level: 15, main: { stat: "HP", value: 2200 },
        subs: [{ stat: "ATK%", rolls: 3 }, { stat: "Anomaly Proficiency", rolls: 2 }, { stat: "Flat PEN", rolls: 1 }, { stat: "CRIT DMG", rolls: 1 }] },
      { slot: 2, set: "Fanged Metal", rank: "S", level: 15, main: { stat: "ATK", value: 316 },
        subs: [{ stat: "Anomaly Proficiency", rolls: 4 }, { stat: "ATK%", rolls: 2 }, { stat: "Flat PEN", rolls: 1 }, { stat: "CRIT Rate", rolls: 1 }] },
      { slot: 3, set: "Fanged Metal", rank: "S", level: 15, main: { stat: "DEF", value: 48 },
        subs: [{ stat: "ATK%", rolls: 1 }, { stat: "Anomaly Proficiency", rolls: 1 }, { stat: "CRIT DMG", rolls: 3 }, { stat: "HP", rolls: 3 }] },
      { slot: 4, set: "Fanged Metal", rank: "S", level: 15, main: { stat: "Anomaly Proficiency", value: 92 },
        subs: [{ stat: "ATK%", rolls: 5 }, { stat: "Flat PEN", rolls: 2 }, { stat: "ATK", rolls: 1 }, { stat: "HP%", rolls: 1 }] },
      { slot: 5, set: "Phaethon's Melody", rank: "S", level: 15, main: { stat: "Physical DMG", value: "30%" },
        subs: [{ stat: "Anomaly Proficiency", rolls: 3 }, { stat: "ATK%", rolls: 3 }, { stat: "ATK", rolls: 2 }, { stat: "CRIT DMG", rolls: 1 }] },
      { slot: 6, set: "Phaethon's Melody", rank: "S", level: 15, main: { stat: "Anomaly Proficiency", value: 92 },
        subs: [{ stat: "ATK%", rolls: 2 }, { stat: "ATK", rolls: 2 }, { stat: "Flat PEN", rolls: 2 }, { stat: "CRIT Rate", rolls: 3 }] },
    ],
  },
};

export function agentBySlug(slug: string): Agent | null {
  if (slug === "alice") return ALICE;
  return null; // other agents port as we build them out
}
