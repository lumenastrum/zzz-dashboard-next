import type { Agent } from "./types";

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
}

// Full roster — imported from the legacy `andres` Supabase row (real mindscapes), with
// element corrections (Frost/Auric Ink/Honed Edge), accents = each element's sampled color,
// and canonical factions where known (others left for Andres). Grouped by section.
// Build data (discs/W-Engine) is NOT in the legacy row, so decks render the identity card
// until a build lands in the andres-zzz blob. el accents mirror ELEMENT_COLOR (deck-config).
export const ROSTER: RosterEntry[] = [
  // — Anomaly —
  { name: "Alice", slug: "alice", section: "Anomaly", attribute: "Physical", mindscape: 1, el: "#fcbf01", faction: "Spook Shack" },
  { name: "Miyabi", slug: "miyabi", section: "Anomaly", attribute: "Frost", mindscape: 1, el: "#39dcf7",
    faction: "Hollow Special Operations Section 6", voidHunter: true },
  { name: "Jane Doe", slug: "janedoe", section: "Anomaly", attribute: "Physical", mindscape: 3, el: "#fcbf01", faction: "Criminal Investigation Special Response Team 29" },
  { name: "Vivian", slug: "vivian", section: "Anomaly", attribute: "Ether", mindscape: 2, el: "#9a4fbb" },
  { name: "Burnice", slug: "burnice", section: "Anomaly", attribute: "Fire", mindscape: 0, el: "#f74c0f", faction: "Sons of Calydon" },
  { name: "Aria", slug: "aria", section: "Anomaly", attribute: "Ether", mindscape: 0, el: "#9a4fbb" },
  { name: "Velina", slug: "velina", section: "Anomaly", attribute: "Wind", mindscape: 0, el: "#95c9ff" },
  // — Attack —
  { name: "Ye Shunguang", slug: "yeshunguang", section: "Attack", attribute: "Honed Edge", mindscape: 1, el: "#9bb4fb",
    faction: "Yunkui Summit", title: "Void Hunter: Qingming Arbiter", voidHunter: true },
  { name: "Evelyn", slug: "evelyn", section: "Attack", attribute: "Fire", mindscape: 3, el: "#f74c0f", faction: "Stars of Lyra" },
  { name: "Ellen", slug: "ellen", section: "Attack", attribute: "Ice", mindscape: 0, el: "#00dada", faction: "Victoria Housekeeping Co." },
  { name: "Soldier 0 Anby", slug: "soldier0anby", section: "Attack", attribute: "Electric", mindscape: 1, el: "#14b0ff", faction: "Obol Squad" },
  { name: "Seed", slug: "seed", section: "Attack", attribute: "Electric", mindscape: 0, el: "#14b0ff" },
  { name: "Cissia", slug: "cissia", section: "Attack", attribute: "Electric", mindscape: 0, el: "#14b0ff" },
  // — Stun —
  { name: "Ju Fufu", slug: "jufufu", section: "Stun", attribute: "Fire", mindscape: 0, el: "#f74c0f", faction: "Yunkui Summit" },
  { name: "Trigger", slug: "trigger", section: "Stun", attribute: "Electric", mindscape: 0, el: "#14b0ff", faction: "Criminal Investigation Special Response Team 29" },
  { name: "Lighter", slug: "lighter", section: "Stun", attribute: "Fire", mindscape: 0, el: "#f74c0f", faction: "Sons of Calydon" },
  { name: "Dialyn", slug: "dialyn", section: "Stun", attribute: "Physical", mindscape: 0, el: "#fcbf01" },
  { name: "Nangong Yu", slug: "nangongyu", section: "Stun", attribute: "Ether", mindscape: 0, el: "#9a4fbb" },
  // — Support —
  { name: "Astra Yao", slug: "astra", section: "Support", attribute: "Ether", mindscape: 1, el: "#9a4fbb", faction: "Stars of Lyra" },
  { name: "Yuzuha", slug: "yuzuha", section: "Support", attribute: "Physical", mindscape: 0, el: "#fcbf01" },
  { name: "Lucia", slug: "lucia", section: "Support", attribute: "Ether", mindscape: 0, el: "#9a4fbb" },
  { name: "Sunna", slug: "sunna", section: "Support", attribute: "Physical", mindscape: 0, el: "#fcbf01" },
  { name: "Zhao", slug: "zhao", section: "Support", attribute: "Ice", mindscape: 0, el: "#00dada" },
  // — Rupture —
  { name: "Yixuan", slug: "yixuan", section: "Rupture", attribute: "Auric Ink", mindscape: 1, el: "#e9b560",
    faction: "Yunkui Summit", voidHunter: true },
  { name: "Yidhari", slug: "yidhari", section: "Rupture", attribute: "Ice", mindscape: 0, el: "#00dada" },
];

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
