import type { Agent } from "./types";

export interface RosterEntry {
  name: string;
  slug: string; // portrait filename + route param
  section: string;
  attribute: string;
  mindscape: number;
  el: string; // accent color
}

// Seed roster (static for now — swaps to live Supabase in the data-wiring step).
export const ROSTER: RosterEntry[] = [
  { name: "Alice", slug: "alice", section: "Anomaly", attribute: "Physical", mindscape: 1, el: "#ffb43c" },
  { name: "Miyabi", slug: "miyabi", section: "Anomaly", attribute: "Frost", mindscape: 1, el: "#6cc6ff" },
  { name: "Evelyn", slug: "evelyn", section: "Attack", attribute: "Fire", mindscape: 1, el: "#ff6a4d" },
  { name: "Yixuan", slug: "yixuan", section: "Rapture", attribute: "Auric", mindscape: 0, el: "#b06bff" },
  { name: "Vivian", slug: "vivian", section: "Anomaly", attribute: "Ether", mindscape: 1, el: "#caa6ff" },
  { name: "Ju Fufu", slug: "jufufu", section: "Stun", attribute: "Fire", mindscape: 0, el: "#ff5a6e" },
  { name: "Ellen", slug: "ellen", section: "Attack", attribute: "Ice", mindscape: 2, el: "#6cc6ff" },
  { name: "Burnice", slug: "burnice", section: "Anomaly", attribute: "Fire", mindscape: 6, el: "#ff7a3d" },
  { name: "Jane Doe", slug: "janedoe", section: "Anomaly", attribute: "Physical", mindscape: 1, el: "#9a6bff" },
  { name: "Trigger", slug: "trigger", section: "Stun", attribute: "Electric", mindscape: 0, el: "#6cc6ff" },
  { name: "Lighter", slug: "lighter", section: "Stun", attribute: "Fire", mindscape: 1, el: "#ff6a4d" },
  { name: "Yuzuha", slug: "yuzuha", section: "Support", attribute: "Physical", mindscape: 0, el: "#9ee06a" },
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
