// Presentation maps for the "Now Playing" deck (ported from c-soundsystem.html's inline
// script, then expanded to the full seeded asset set). Grading *logic* lives in
// @/lib/grading; this file is only the chrome the engine doesn't care about — set
// colors/icons, cone geometry, editable stat pools, VU scaling, and icon resolvers.
// All icon resolvers are slug-based, so any agent/set/engine resolves once its art is
// staged (npm run stage); a missing file just self-hides via <DeckImg>'s onError.
import { GRADING_CONFIG } from "@/lib/grading";

// ---- slug + asset paths --------------------------------------------------
export const slugify = (s: string) =>
  s.toLowerCase().replace(/['’]/g, "").replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");

export const iconPath = (name: string) => `/assets/icons/${name}.webp`;
export const tallPath = (slug: string) => `/assets/tall/${slug}.webp`;

export const elementIcon = (attribute: string) => `element_${slugify(attribute)}`;
export const typeIcon = (section: string) => `type_${slugify(section)}`;
export const factionIcon = (faction: string) => `faction_${slugify(faction)}`;
export const wengineIcon = (name: string) => `wengine_${slugify(name)}`;
export const setIcon = (set: string) => `set_${slugify(set)}`;

// ---- disc sets -----------------------------------------------------------
// Color (cone glow / slot ring / track header accent) + short blurb per set. Icons are
// derived by slug (setIcon), so this only curates color/flavor. Sets the grader has
// effects for (grading-config setEffects) carry blurbs; the rest are cosmetic for now.
export interface SetMeta {
  icon: string;
  color: string;
  blurb: string;
}
const SET_CATALOG: Record<string, { color: string; blurb: string }> = {
  "Astral Voice": { color: "#b06bff", blurb: "" },
  "Branch & Blade Song": { color: "#9a6bff", blurb: "" },
  "Chaos Jazz": { color: "#ff7a3d", blurb: "" },
  "Dawn's Bloom": { color: "#ffb43c", blurb: "" },
  "Fanged Metal": { color: "#ff4d52", blurb: "Physical · Anomaly" },
  "Freedom Blues": { color: "#6aa6ff", blurb: "Anomaly Prof" },
  "Inferno Metal": { color: "#ff6a3d", blurb: "Fire DMG" },
  "King of the Summit": { color: "#6cc6ff", blurb: "" },
  "Moonlight Lullaby": { color: "#8aa6ff", blurb: "" },
  "Phaethon's Melody": { color: "#9a6bff", blurb: "Anomaly Prof" },
  "Polar Metal": { color: "#6cc6ff", blurb: "" },
  "Puffer Electro": { color: "#6cd6e0", blurb: "" },
  "Shadow Harmony": { color: "#9a6bff", blurb: "" },
  "Shining Aria": { color: "#ffd84a", blurb: "" },
  "Shockstar Disco": { color: "#ffd84a", blurb: "" },
  "Swing Jazz": { color: "#6aa6ff", blurb: "Energy" },
  "Thunder Metal": { color: "#b06bff", blurb: "" },
  "White Water Ballad": { color: "#6cd6e0", blurb: "" },
  "Woodpecker Electro": { color: "#9ee06a", blurb: "CRIT Rate" },
  "Wuthering Salon": { color: "#caa6ff", blurb: "" },
  "Yunkui Tales": { color: "#7ce0c0", blurb: "" },
};

// Set-swap dropdown choices — the full curated catalog (every set has a staged icon).
export const SET_CHOICES = Object.keys(SET_CATALOG);

const FALLBACK_COLOR = "#888";
export function setMeta(set: string | null | undefined): SetMeta {
  const cat = set ? SET_CATALOG[set] : undefined;
  return {
    icon: set ? setIcon(set) : "set_fanged_metal",
    color: cat?.color ?? FALLBACK_COLOR,
    blurb: cat?.blurb ?? "",
  };
}

// ---- editable stat pools -------------------------------------------------
export const SUBSTATS = [
  "ATK%", "ATK", "HP%", "HP", "DEF%", "DEF",
  "CRIT Rate", "CRIT DMG", "Flat PEN", "Anomaly Proficiency",
];

export const MAINS: Record<number, string[]> = {
  4: ["CRIT Rate", "CRIT DMG", "ATK%", "HP%", "DEF%", "Anomaly Proficiency"],
  5: ["Physical DMG", "ATK%", "HP%", "DEF%", "PEN Ratio"],
  6: ["ATK%", "HP%", "DEF%", "Anomaly Proficiency", "Anomaly Mastery", "PEN Ratio"],
};

// ---- equipment-frame cone geometry (%[left, top] on equip_frame.webp) ----
export const CONE: Record<number, [number, number]> = {
  1: [28.7, 18.5],
  2: [71.3, 18.5],
  3: [15.6, 50.5],
  4: [84.4, 50.5],
  5: [28.7, 82.5],
  6: [71.3, 82.5],
};

// ---- VU-meter scaling for the Levels panel -------------------------------
// `full` = value at 100% bar; `target` = the "good enough" notch. Keyed by the stat keys
// computeStats returns. Illustrative — refine alongside the base-stat curves.
export interface LevelCfg {
  full: number;
  target: number;
  unit: string;
}
export const LEVEL_CFG: Record<string, LevelCfg> = {
  "ATK": { full: 3400, target: 2700, unit: "" },
  "Anomaly Proficiency": { full: 460, target: 330, unit: "" },
  "Anomaly Mastery": { full: 320, target: 184, unit: "" },
};
export const LEVEL_ORDER = ["ATK", "Anomaly Proficiency", "Anomaly Mastery"];

// Best single-sub contribution, for scaling the substat bars in the inspector.
const partnerBoost = (GRADING_CONFIG as { partnerBoost?: number }).partnerBoost ?? 4.25;
export const MAX_CONTRIB = 6 * partnerBoost;

// 5-segment VU helper (cone grade meters).
export function segCount(pct: number, n = 5) {
  return Math.max(1, Math.round((pct / 100) * n));
}
