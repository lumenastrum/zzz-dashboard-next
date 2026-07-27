/**
 * Id-keyed archival merge for signal records.
 *
 * Hoyo only serves a rolling ~6-month window, so the archive's job is to
 * accumulate forever: every merge is a pure UNION by record id — records are
 * never deleted, and a channel that ages entirely out of the window keeps its
 * history untouched.
 *
 * Ids are globally unique and chronologically ordered (hour-bucket prefix +
 * sequence, all 19 digits), which also makes them the tiebreaker for the
 * ten-pulls-share-one-timestamp problem that forces WuWa's convene merge into
 * a time-boundary splice. Same idea, better primary key.
 */

import type { SignalRecord } from "./signal-types";

/** Newest-first: time desc, id desc as the intra-second tiebreaker. */
const byTimeDesc = (a: SignalRecord, b: SignalRecord): number =>
  a.time < b.time ? 1 : a.time > b.time ? -1 : a.id < b.id ? 1 : a.id > b.id ? -1 : 0;

/**
 * Union-merge `incoming` into `existing`. On an id collision the record with a
 * resolved `name` wins (fresh API records carry names; grafted pre-window
 * records may not); when both are named, `incoming` wins. Returns newest-first
 * plus how many ids were genuinely new.
 */
export function mergeById(
  existing: SignalRecord[],
  incoming: SignalRecord[],
): { merged: SignalRecord[]; added: number } {
  const byId = new Map<string, SignalRecord>();
  for (const r of existing) byId.set(r.id, r);
  let added = 0;
  for (const r of incoming) {
    const prev = byId.get(r.id);
    if (!prev) {
      byId.set(r.id, r);
      added++;
    } else if (r.name || !prev.name) {
      byId.set(r.id, r);
    }
  }
  return { merged: [...byId.values()].sort(byTimeDesc), added };
}
