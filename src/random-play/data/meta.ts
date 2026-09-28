// Static facts the data doesn't carry: short spine names, game icon numbers, sticker availability,
// Bangboo display names, crest file aliases, and the DA score cap. Keep in sync with
// scripts/assemble-assets.py ROSTER when an agent is added.

/** Game icon number (IconRole<NN>) per slug — from Enka avatars.json; codenames via Enka locs.json. */
export const ICON_ID: Record<string, number> = {
  alice: 46, miyabi: 13, janedoe: 24, vivian: 41, burnice: 32, aria: 57, velina: 64, remielledan: 67,
  yeshunguang: 55, evelyn: 37, ellen: 21, soldier0anby: 40, seed: 48, cissia: 60, jufufu: 43, trigger: 39,
  lighter: 26, dialyn: 54, nangongyu: 59, astra: 36, yuzuha: 47, lucia: 50, sunna: 58, zhao: 56,
  yixuan: 44, yidhari: 52, yanagi: 31,
};

/** Names that don't fit a 70px spine or a squad nameplate. Everything else uses `name`. */
export const SPINE_NAME: Record<string, string> = {
  remielledan: "Remielle",
  soldier0anby: "S0 Anby",
};

/** Agents with a chat-emote sticker in assets/agents/emote/. */
export const HAS_EMOTE = new Set([
  "burnice", "aria", "velina", "remielledan", "evelyn", "seed", "trigger", "lighter", "dialyn", "nangongyu", "sunna",
]);

/** Bangboo slug → display name. `ultrajet` is the asset slug; the in-game name is Ultra Jake. */
export const BANGBOO_NAME: Record<string, string> = {
  ariel: "Ariel", baddieboo: "Baddieboo", belion: "Belion", biggestfan: "Biggest Fan", msesme: "Ms. Esme",
  plugboo: "Plugboo", robin: "Robin", sharkboo: "Sharkboo", snap: "Snap", sprout: "Sprout", ultrajet: "Ultra Jake",
};

/** Faction name → crest file stem where a plain slugify doesn't match the ripped file name. */
export const CREST_ALIAS: Record<string, string> = {
  "Roscaelifer External Strategy Department": "external_strategy_department",
  "Public Security: Metropolitan Order Division": "metropolitan_order_division",
};

/** Deadly Assault per-room ceiling. A run at the cap is flagged (orange bar, "CAPPED ×n"). */
export const DA_CAP = 65000;

/** Editorial names for logged lineups the setlists haven't adopted yet (key = sorted slugs). */
export const LOGGED_TEAM_NAMES: Record<string, string> = {
  "janedoe/remielledan/velina": "The Blight Trio",
  "aria/remielledan/velina": "The Encore",
};

/** Shiyu Critical Node per-room ceiling (45,000 damage + 5,000 elimination), measured 09/19. */
export const SHIYU_ROOM_CAP = 50000;
/** The in-game per-room rating ladder ("Reach 8,000 points for the current room" …). */
export const SHIYU_RATING_TARGETS = [{ rating: "B", score: 8000 }, { rating: "A", score: 16000 }, { rating: "S", score: 25000 }] as const;
/** S+ needs an S in every room AND this total. */
export const SHIYU_SPLUS_TOTAL = 100000;

/** Dashboard emote stems that differ from the roster slug (Staff Picks + Signal reference emotes by stem). */
export const EMOTE_ALIAS: Record<string, string> = { nangong: "nangongyu", remielle: "remielledan" };

/** Gacha-API agent names → asset slugs where normalising the name isn't enough. */
export const PULL_NAME_ALIAS: Record<string, string> = { astrayao: "astra", remielle: "remielledan", soldier0anby: "soldier0anby" };
/** Gacha-API Bangboo names → bangboo asset slugs. The boo's real name is Ultra Jake; the asset kept `ultrajet`. */
export const BANGBOO_BY_NAME: Record<string, string> = { "Ultra Jake": "ultrajet", "Biggest Fan": "biggestfan" };
