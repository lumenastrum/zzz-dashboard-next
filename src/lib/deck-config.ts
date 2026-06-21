// Presentation maps for the "Now Playing" deck (ported from c-soundsystem.html's inline
// script, then expanded to the full seeded asset set). Grading *logic* lives in
// @/lib/grading; this file is only the chrome the engine doesn't care about — set
// colors/icons, cone geometry, editable stat pools, VU scaling, and icon resolvers.
// All icon resolvers are slug-based, so any agent/set/engine resolves once its art is
// staged (npm run stage); a missing file just self-hides via <DeckImg>'s onError.
import { GRADING_CONFIG } from "@/lib/grading";

// ---- slug + asset paths --------------------------------------------------
// NFD-normalize + strip combining marks so accented names fold to ASCII (é→e, ô→o) the way
// the wiki-sourced art filenames do — otherwise "Joyau Doré" slugs to "joyau_dor" (é dropped as
// a separator) and misses the staged "joyau_dore" icon. Keep in lockstep with stage-assets.ts.
export const slugify = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "")
    .replace(/['’]/g, "").replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");

export const iconPath = (name: string) => `/assets/icons/${name}.webp`;
export const tallPath = (slug: string) => `/assets/tall/${slug}.webp`;

export const elementIcon = (attribute: string) => `element_${slugify(attribute)}`;
export const typeIcon = (section: string) => `type_${slugify(section)}`;
export const VOID_HUNTER_ICON = "type_void_hunter";

// In-game element colors, sampled (dominant non-extreme pixel) from each element icon.
// Drives the Void Hunter gradient accents so each elite reads in their own element's hue.
export const ELEMENT_COLOR: Record<string, string> = {
  physical: "#fcbf01",
  fire: "#f74c0f",
  ice: "#00dada",
  electric: "#14b0ff",
  ether: "#9a4fbb",
  frost: "#39dcf7",
  auric_ink: "#e9b560",
  honed_edge: "#9bb4fb",
  wind: "#95c9ff",
};
const clampByte = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
const hexRgb = (h: string) => {
  const m = h.replace("#", "");
  return [0, 2, 4].map((i) => parseInt(m.slice(i, i + 2), 16));
};
const toHex = (rgb: number[]) => "#" + rgb.map((v) => clampByte(v).toString(16).padStart(2, "0")).join("");
const mix = (hex: string, target: string, t: number) => {
  const a = hexRgb(hex), b = hexRgb(target);
  return toHex(a.map((v, i) => v + (b[i] - v) * t));
};
export const elementColor = (attribute: string) => ELEMENT_COLOR[slugify(attribute)] ?? "#9a6bff";
// A 3-stop sheen gradient in the element's hue (light → base → deep).
export const elementGradient = (attribute: string) => {
  const c = elementColor(attribute);
  return `linear-gradient(120deg, ${mix(c, "#ffffff", 0.42)} 0%, ${c} 50%, ${mix(c, "#1a0f1e", 0.34)} 100%)`;
};
// Some agents display under their full org-path faction name, but the in-game icon is filed
// under the core squad name. Map the long display slug → the staged icon basename so the plate
// still shows the squad badge. (Display string stays whatever roster.ts says.)
const FACTION_ICON_ALIAS: Record<string, string> = {
  roscaelifer_external_strategy_department: "external_strategy_department",
  public_security_metropolitan_order_division: "metropolitan_order_division",
};
export const factionIcon = (faction: string) => {
  const s = slugify(faction);
  return `faction_${FACTION_ICON_ALIAS[s] ?? s}`;
};
export const wengineIcon = (name: string) => `wengine_${slugify(name)}`;
export const setIcon = (set: string) => `set_${slugify(set)}`;

// Standard-channel S-rank W-engines — generic, not any agent's signature. The cartridge only
// claims "Signature" for engines NOT in this set, so a standard engine (e.g. an agent running
// The Brimstone or Hellfire Gears) reads as "Standard". Extend as new standard engines ship.
export const STANDARD_WENGINES = new Set([
  "Steel Cushion", "The Brimstone", "The Restrained", "Hellfire Gears",
  "Fusion Compiler", "Weeping Cradle",
]);
export const isSignatureEngine = (name: string | undefined | null) =>
  !!name && !STANDARD_WENGINES.has(name);

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
  6: ["ATK%", "HP%", "DEF%", "Anomaly Proficiency", "Anomaly Mastery", "Impact", "Energy Regen", "PEN Ratio"],
};

// ---- equipment-frame cone geometry (%[left, top] on equip_frame.webp) ----
// In-game slot order: 1-2-3 down the LEFT column (top→bottom), 4-5-6 up the RIGHT column
// (bottom→top). The six physical cone positions are fixed by the frame art; only which slot
// number sits where changes here. Slot identity (main-stat rules, grading) is unaffected.
export const CONE: Record<number, [number, number]> = {
  1: [28.7, 18.5], // top-left
  2: [15.6, 50.5], // mid-left
  3: [28.7, 82.5], // bottom-left
  4: [71.3, 82.5], // bottom-right
  5: [84.4, 50.5], // mid-right
  6: [71.3, 18.5], // top-right
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
