/**
 * Types for the Signal Search (gacha pull) archive.
 *
 * Pull data lives in its OWN Supabase row (profile key `andres-zzz-pulls`),
 * separate from the roster blob — the multi-thousand-record history must never
 * ride the roster's 650ms auto-save. Mirrors the WuWa dashboard's convene
 * architecture (`andres-wuwa-pulls`), adapted for Hoyo's API shape.
 *
 * Records are stored verbatim as Hoyo's getGachaLog API returns them, keyed
 * into per-channel arrays (newest-first). All derived stats (pity, coinflips,
 * dry streaks) are computed at read time in `signal-analytics.ts`.
 *
 * Why id-keyed merging works here (unlike WuWa's time-boundary splice): Hoyo
 * record ids are globally unique and stable — hour-bucket prefix + sequence —
 * verified against a rng.moe backup (366 overlapping records, zero id/rarity
 * mismatches). So the archive is a pure union by id; nothing is ever deleted.
 */

export const SIGNAL_PROFILE_KEY = "andres-zzz-pulls";

/** Polychrome cost of a single signal. */
export const POLYCHROME_PER_PULL = 160;

/**
 * real_gacha_type → channel name. "13" appeared once (Jan 2026, 53 records,
 * aged out of the API entirely — those records survive only via the rng.moe
 * graft); kept so its history renders. "12" has never served a record.
 */
export const SIGNAL_CHANNELS: Record<string, string> = {
  "1": "Star-Studded Cast",
  "2": "Exclusive Channel",
  "3": "W-Engine Channel",
  "5": "Bangboo Channel",
  "13": "Special Channel",
};

/** Channels surfaced as primary cards, in display order. */
export const PRIMARY_CHANNELS = ["2", "3", "1", "5"] as const;

/** Hard pity (guaranteed S-rank) per channel. */
export const HARD_PITY: Record<string, number> = {
  "1": 90,
  "2": 90,
  "3": 80,
  "5": 80,
  "13": 80,
};

/**
 * Channels with a featured-vs-standard coinflip. Exclusive = 50/50; W-Engine =
 * 75/25. After a loss the next S-rank is guaranteed featured (not a challenge).
 */
export const COINFLIP_CHANNELS: Record<string, string> = {
  "2": "50/50",
  "3": "75/25",
};

/**
 * The permanent standard-pool S-ranks. On a coinflip channel, an S-rank IN the
 * set is a lost flip; anything else is a win. Validated against rng.moe's own
 * lifetime counters (agents 21W/34 challenges, engines 12W/17 at 2026-03-24) —
 * the walk in signal-analytics reproduces both exactly.
 */
export const STANDARD_S_AGENTS = [
  "Koleda",
  "Grace Howard",
  "Nekomata",
  "Rina",
  "Von Lycaon",
  "Soldier 11",
] as const;

export const STANDARD_S_ENGINES = [
  "Steel Cushion",
  "Hellfire Gears",
  "Weeping Cradle",
  "Fusion Compiler",
  "The Restrained",
  "The Brimstone",
] as const;

export const STANDARD_S_SET = new Set<string>([
  ...STANDARD_S_AGENTS,
  ...STANDARD_S_ENGINES,
]);

/** A raw pull record as Hoyo's getGachaLog API returns it. */
export interface SignalRecord {
  /** Globally unique, chronologically ordered (hour bucket + sequence). */
  id: string;
  uid: string;
  gacha_id: string;
  gacha_type: string;
  item_id: string;
  count: string;
  /** "YYYY-MM-DD HH:mm:ss" in server-local time (prod_gf_us = UTC-5). */
  time: string;
  /** May be "" for grafted pre-window records whose item id is unmapped. */
  name: string;
  lang: string;
  /** "Agents" | "W-Engines" | "Bangboo" (may be "" on grafted records). */
  item_type: string;
  /** "2" | "3" | "4" (B/A/S) — Hoyo counts rarity from 2. */
  rank_type: string;
}

/** The full stored blob in the `andres-zzz-pulls` Supabase row. */
export interface SignalStore {
  /** ISO timestamp of the last successful sync. */
  lastSync: string;
  uid: string;
  region: string;
  /** key = real_gacha_type as a string; records newest-first per channel. */
  channels: Record<string, SignalRecord[]>;
}

export function emptySignalStore(): SignalStore {
  return { lastSync: "", uid: "", region: "", channels: {} };
}

/** Signal-history tab gate — the archive is A.'s profile only. */
export function hasSignal(profileKey: string): boolean {
  return profileKey === "andres-zzz";
}
