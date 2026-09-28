// Asset URL resolver. Components never hard-code paths: they ask this for a URL, and the host app
// decides where assets/ is served from (Vite playground: "", dashboard: e.g. "/zzz-dashboard-next/rp").
import { CREST_ALIAS } from "./data/meta";

// Matches the dashboard's icon file names: accents stripped ("Joyau Doré" → joyau_dore), apostrophes
// dropped ("Kraken's Cradle" → krakens_cradle, "Phaethon's Melody" → phaethons_melody), "&" dropped.
// scripts/check-assets.ts proves every roster URL resolves — run it after touching this.
export const slugify = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
    .replace(/['’&]/g, "").replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");

export type UiAsset =
  | "film-cell" | "film-strip-voidhunter" | "film-strip-grandmaster" | "film-strip-standard"
  | "socket-1" | "socket-2" | "socket-3" | "socket-4" | "socket-5" | "socket-6" | "socket-empty"
  | "stamp-empty-character" | "zzz-mark" | "texture-hatch" | "texture-paper"
  | "medal-silver" | "medal-gold" | "medal-diamond" | "medal-master" | "medal-legend"
  | "da-pip" | "da-logo" | "shiyu-logo";

export function createAssets(base = "") {
  const b = base.replace(/\/$/, "");
  const u = (p: string) => `${b}/${p}`;
  return {
    base: b,
    /** 3:5 face-framed box front (300×500) — spines + covers without key art. */
    jacket: (slug: string) => u(`agents/jacket/${slug}.webp`),
    /** Jacket-cover art: face-centred crop of the key art at the cover's 520:718 aspect, ≤1040px wide. */
    cover: (slug: string) => u(`agents/cover/${slug}.webp`),
    /** Full-height transparent key art (the source every cover is cut from). */
    tall: (slug: string) => u(`agents/tall/${slug}.webp`),
    /** IconRoleSelect — slanted squad-picker bust (leans "\"), ~225–249×250. */
    squad: (slug: string) => u(`agents/squad/${slug}.webp`),
    /** IconRoleGeneral — slanted switcher rectangle, ~180×64. */
    rect: (slug: string) => u(`agents/rect/${slug}.webp`),
    /** Endgame face circle, 142×142. */
    circle: (slug: string) => u(`agents/circle/${slug}.webp`),
    emote: (slug: string) => u(`agents/emote/${slug}.webp`),
    element: (attr: string) => u(`icons/element/${slugify(attr)}.webp`),
    specialty: (section: string) => u(`icons/specialty/${slugify(section)}.webp`),
    set: (name: string) => u(`icons/set/${slugify(name)}.webp`),
    wengine: (name: string) => u(`icons/wengine/${slugify(name)}.webp`),
    crest: (faction: string) => u(`crests/${CREST_ALIAS[faction] ?? slugify(faction)}.webp`),
    bangboo: (slug: string) => u(`bangboo/${slug}.webp`),
    ui: (name: UiAsset) => u(`ui/${name}.webp`),
    /** Boss one-sheet: transparent 484×668 cutout, keyed by the coach pack's boss slug. */
    enemy: (slug: string) => u(`enemies/${slug}.webp`),
    /** Deadly Assault house-rule icon by buff slug (atk / element / stun / ruin / sharp). */
    buff: (slug: string) => u(`ui/da-buff-${slug}.webp`),
  };
}
export type Assets = ReturnType<typeof createAssets>;
