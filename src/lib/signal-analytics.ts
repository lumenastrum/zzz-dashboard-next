/**
 * Pure derived stats over the signal archive — no React, imported by both the
 * /signal page and the sync CLI's summary printout.
 *
 * Everything walks each channel OLDEST-first (records are stored newest-first,
 * so walks reverse a copy): pity is "pulls since the last S-rank, inclusive",
 * and the coinflip state machine is — S-rank hit: if the guarantee flag is up
 * it's GUARANTEED (flag down, not a challenge); else it's a challenge, and a
 * standard-pool item means LOST (flag up) while anything else means WON.
 */

import {
  COINFLIP_CHANNELS,
  HARD_PITY,
  POLYCHROME_PER_PULL,
  SIGNAL_CHANNELS,
  STANDARD_S_SET,
  type SignalRecord,
  type SignalStore,
} from "./signal-types";

export type SignalOutcome = "won" | "lost" | "guaranteed" | "plain";

/** One S-rank hit, decorated for the timeline. */
export interface SRankPull {
  record: SignalRecord;
  channel: string;
  pity: number;
  outcome: SignalOutcome;
}

export interface ChannelSummary {
  channel: string;
  name: string;
  total: number;
  sCount: number;
  aCount: number;
  sRanks: SRankPull[]; // oldest-first
  avgPityS: number | null;
  currentPity: number;
  hardPity: number;
  longestDry: number;
  /** Coinflip channels only. */
  flipLabel?: string;
  flipWins?: number;
  flipChallenges?: number;
  /** True while the account sits on a lost flip (next S is guaranteed). */
  onGuarantee?: boolean;
}

export interface SignalSummary {
  totalPulls: number;
  totalPolychrome: number;
  totalS: number;
  firstTime: string | null;
  lastTime: string | null;
  channels: ChannelSummary[]; // PRIMARY order first, then any extras with data
}

const byTimeAsc = (a: SignalRecord, b: SignalRecord): number =>
  a.time < b.time ? -1 : a.time > b.time ? 1 : a.id < b.id ? -1 : a.id > b.id ? 1 : 0;

export function summarizeChannel(
  channel: string,
  records: SignalRecord[],
): ChannelSummary {
  const asc = [...records].sort(byTimeAsc);
  const isFlip = channel in COINFLIP_CHANNELS;

  const sRanks: SRankPull[] = [];
  let sincePity = 0;
  let longestDry = 0;
  let guarantee = false;
  let flipWins = 0;
  let flipChallenges = 0;
  let aCount = 0;

  for (const r of asc) {
    sincePity++;
    if (r.rank_type === "3") aCount++;
    if (r.rank_type !== "4") continue;

    let outcome: SignalOutcome = "plain";
    if (isFlip) {
      if (guarantee) {
        outcome = "guaranteed";
        guarantee = false;
      } else {
        flipChallenges++;
        // Unresolved names (grafted, unmapped item id) can't be classified —
        // count the challenge, call it plain. None exist among current S-ranks.
        if (!r.name) outcome = "plain";
        else if (STANDARD_S_SET.has(r.name)) {
          outcome = "lost";
          guarantee = true;
        } else {
          outcome = "won";
          flipWins++;
        }
      }
    }
    sRanks.push({ record: r, channel, pity: sincePity, outcome });
    longestDry = Math.max(longestDry, sincePity);
    sincePity = 0;
  }
  longestDry = Math.max(longestDry, sincePity);

  const pities = sRanks.map((s) => s.pity);
  return {
    channel,
    name: SIGNAL_CHANNELS[channel] ?? `Channel ${channel}`,
    total: asc.length,
    sCount: sRanks.length,
    aCount,
    sRanks,
    avgPityS: pities.length
      ? pities.reduce((a, b) => a + b, 0) / pities.length
      : null,
    currentPity: sincePity,
    hardPity: HARD_PITY[channel] ?? 90,
    longestDry,
    ...(isFlip
      ? {
          flipLabel: COINFLIP_CHANNELS[channel],
          flipWins,
          flipChallenges,
          onGuarantee: guarantee,
        }
      : {}),
  };
}

export function summarize(store: SignalStore): SignalSummary {
  const keys = Object.keys(store.channels).filter(
    (k) => (store.channels[k] ?? []).length > 0,
  );
  // Stable display order: the SIGNAL_CHANNELS declaration order, extras last.
  const declared = Object.keys(SIGNAL_CHANNELS);
  keys.sort((a, b) => {
    const ia = declared.indexOf(a);
    const ib = declared.indexOf(b);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });

  const channels = keys.map((k) => summarizeChannel(k, store.channels[k]));
  const all = keys.flatMap((k) => store.channels[k]);
  const times = all.map((r) => r.time).sort();
  const totalPulls = all.length;

  return {
    totalPulls,
    totalPolychrome: totalPulls * POLYCHROME_PER_PULL,
    totalS: channels.reduce((n, c) => n + c.sCount, 0),
    firstTime: times[0] ?? null,
    lastTime: times[times.length - 1] ?? null,
    channels,
  };
}

/** All S-ranks across channels, newest-first — the timeline feed. */
export function sRankLedger(summary: SignalSummary): SRankPull[] {
  return summary.channels
    .flatMap((c) => c.sRanks)
    .sort((a, b) => byTimeAsc(b.record, a.record));
}
