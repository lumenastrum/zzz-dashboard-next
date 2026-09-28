"use client";
// CHANNEL SEARCH: A.'s Signal Search archive as the store's back room. A VCR's auto channel search
// is literally a signal search, and Hoyo's channel ids even read as tuner channels (CH 02 Exclusive,
// CH 03 W-Engine, CH 01 Standard, CH 05 Bangboo). Each channel is a deck in the AV rack: the tape
// counter is the current pity. Every S-rank ever pulled is a punch on the member card, ringed by
// how the coinflip went. All math is the dashboard's (signal-analytics.ts); this only draws it.
import { useState } from "react";
import { useAssets } from "../context";
import { pullArt, signalLedger } from "../data/store";
import type { PullOutcome, SignalArchive, SignalChannel, SignalPull } from "../data/types";
import { fmt, useTake } from "./endgame";

const pad = (n: number, w = 3) => String(n).padStart(w, "0");
const OUTCOME: Record<PullOutcome, { label: string; glyph: string }> = {
  won: { label: "WON THE FLIP", glyph: "✓" },
  lost: { label: "LOST THE FLIP", glyph: "✕" },
  guaranteed: { label: "GUARANTEED", glyph: "★" },
  plain: { label: "NO FLIP", glyph: "" },
};
const daysSince = (iso: string) => Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86400000));
const md = (t: string) => `${t.slice(5, 7)}/${t.slice(8, 10)}`;

/** One VCR deck = one channel. The deck is the tuner button: pressing it filters the room to that channel. */
export function Deck({ c, tuned, onTune, index }: { c: SignalChannel; tuned: boolean; onTune: () => void; index: number }) {
  const segs = Math.round(c.hardPity / 5);
  const lit = Math.min(segs, Math.ceil(c.currentPity / 5));
  const lost = c.flip ? c.sRanks.filter((p) => p.outcome === "lost").length : 0;
  return (
    <button className={`rp-deck${tuned ? " is-on" : ""}`} style={{ animationDelay: `${index * 90}ms` }} aria-pressed={tuned} onClick={onTune}
      aria-label={`Channel ${c.channel}, ${c.name}: pity ${c.currentPity} of ${c.hardPity}. ${tuned ? "Tuned in; press to show all channels" : "Press to tune in"}`}>
      <span className="rp-deck__ch"><small>CH</small><b>{pad(Number(c.channel), 2)}</b></span>
      <span className="rp-deck__id">
        <span className="rp-deck__name">{c.name}</span>
        <span className="rp-deck__slot" aria-hidden="true" />
        <span className="rp-deck__meta">{fmt(c.total)} SIGNALS · S×{c.sCount} · A×{fmt(c.aCount)}</span>
      </span>
      <span className="rp-deck__vfd">
        <span className="rp-deck__label">PITY</span>
        <span className="rp-deck__count"><i aria-hidden="true">888</i><b>{pad(c.currentPity)}</b></span>
        <span className="rp-deck__of">/{c.hardPity}</span>
        <span className="rp-deck__segs" aria-hidden="true">
          {Array.from({ length: segs }, (_, k) => <i key={k} className={k < lit ? "is-lit" : ""} style={{ animationDelay: `${300 + k * 25}ms` }} />)}
        </span>
      </span>
      <span className="rp-deck__stats">
        <span><small>AVG PITY</small>{c.avgPityS?.toFixed(1) ?? "—"}</span>
        <span><small>DRIEST</small>{c.longestDry}</span>
        {c.flip ? (
          <span className="rp-deck__flip"><small>{c.flip.label}</small>{c.flip.wins}W–{lost}L</span>
        ) : <span className="rp-deck__flip is-none"><small>COINFLIP</small>NONE</span>}
      </span>
      <span className="rp-deck__lamps">
        <span className={`rp-lamp${tuned ? " is-on" : ""}`}><i />PLAY</span>
        <span className={`rp-lamp${c.flip?.onGuarantee ? " is-on" : ""}`}><i />{c.flip ? "GUARANTEED" : "NO 50/50"}</span>
      </span>
    </button>
  );
}

function Punch({ p, dim, gap, onHover, active }: { p: SignalPull; dim: boolean; gap: boolean; onHover: (p: SignalPull | null) => void; active: boolean }) {
  const assets = useAssets();
  const [failed, setFailed] = useState(false);
  const art = pullArt(p);
  const src = !art || failed ? null : art.kind === "circle" ? assets.circle(art.key) : art.kind === "wengine" ? assets.wengine(art.key) : assets.bangboo(art.key);
  const name = p.name || "Unidentified S-rank";
  return (
    <button className={`rp-punch is-${p.outcome}${dim ? " is-dim" : ""}${gap ? " is-gap" : ""}${active ? " is-hover" : ""}${art?.kind === "circle" ? "" : " is-item"}`}
      aria-label={`${name}, ${p.time.slice(0, 10)}, pity ${p.pity}, ${OUTCOME[p.outcome].label}${gap ? ", archive gap before this pull" : ""}`}
      onMouseEnter={() => onHover(p)} onFocus={() => onHover(p)} onBlur={() => onHover(null)}>
      {src ? <img src={src} alt="" onError={() => setFailed(true)} /> : <span className="rp-punch__none">?</span>}
      {OUTCOME[p.outcome].glyph && <span className="rp-punch__glyph" aria-hidden="true">{OUTCOME[p.outcome].glyph}</span>}
    </button>
  );
}

/** Where S-ranks landed, in 10-pull bins. Single series: no legend, the title names it. */
function PitySpread({ pulls, hard }: { pulls: SignalPull[]; hard: number }) {
  const bins = Array.from({ length: Math.ceil(hard / 10) }, (_, i) => ({ lo: i * 10 + 1, hi: (i + 1) * 10, n: 0 }));
  let over = 0;
  for (const p of pulls) { if (p.pity > hard) over++; else bins[Math.min(bins.length - 1, Math.floor((p.pity - 1) / 10))].n++; }
  const max = Math.max(1, ...bins.map((b) => b.n));
  const peak = bins.reduce((a, b) => (b.n > a.n ? b : a));
  return (
    <div className="rp-spread">
      <div className="rp-spread__title">PITY SPREAD <span>WHERE {pulls.length} S-RANKS LANDED · 10-PULL BINS</span></div>
      <div className="rp-spread__plot">
        {bins.map((b) => (
          <div key={b.lo} className="rp-spread__col" title={`${b.n} S-rank${b.n === 1 ? "" : "s"} at pity ${b.lo}–${b.hi}`}>
            <span className="rp-spread__n">{b === peak || b.n === 0 ? b.n : ""}</span>
            <span className="rp-spread__bar" style={{ height: `${(b.n / max) * 100}%` }} />
            <span className="rp-spread__x">{b.hi}</span>
          </div>
        ))}
      </div>
      {over > 0 && <div className="rp-spread__note">+{over} past hard pity: an archive gap, not luck (see the marked punch).</div>}
    </div>
  );
}

export interface ChannelSearchProps { archive: SignalArchive | null; uid?: string; open: boolean }

export function ChannelSearch({ archive, uid, open }: ChannelSearchProps) {
  const take = useTake(open);
  const [tuned, setTuned] = useState<string | null>(null);
  const [hover, setHover] = useState<SignalPull | null>(null);
  if (!archive) {
    return (
      <section className={`rp-view rp-channel rp-peg${open ? " is-in" : ""}`} aria-label="Signal Search: channel search" aria-hidden={!open}>
        <div className="rp-placeholder rp-channel__empty"><b>No signal</b>No pull archive on file for this profile.</div>
      </section>
    );
  }
  // the dashboard's primary order: the channels you actually pull on first (Exclusive, W-Engine, Standard, Bangboo)
  const ORDER = ["2", "3", "1", "5"];
  const rank = (ch: string) => (ORDER.includes(ch) ? ORDER.indexOf(ch) : 99);
  const decks = archive.channels.filter((c) => c.total >= 100).sort((a, b) => rank(a.channel) - rank(b.channel));
  const archived = archive.channels.filter((c) => c.total < 100);
  const ledger = signalLedger(archive);
  const hard = Object.fromEntries(archive.channels.map((c) => [c.channel, c.hardPity]));
  const scope = tuned ? archive.channels.find((c) => c.channel === tuned)! : null;
  const scoped = scope ? scope.sRanks : ledger;
  const stale = archive.lastSync ? daysSince(archive.lastSync) : null;
  const flips = archive.channels.filter((c) => c.flip);
  return (
    <section className={`rp-view rp-channel rp-peg${open ? " is-in" : ""}`} aria-label="Signal Search: channel search" aria-hidden={!open}>
      <div key={`head-${take}`} className="rp-channel__head">
        <div>
          <div className="rp-channel__kicker">CHANNEL SEARCH · SIGNAL ARCHIVE{uid ? ` · PROXY UID ${uid}` : ""}</div>
          <h2 className="rp-channel__title">Channel Search</h2>
          <div className="rp-channel__sub">
            {fmt(archive.totalPulls)} signals · {fmt(archive.totalPolychrome)} Polychrome · {archive.totalS} S-ranks
            {archive.firstTime && archive.lastTime && <> · {archive.firstTime.slice(0, 10)} → {archive.lastTime.slice(0, 10)}</>}
          </div>
        </div>
        {archive.lastSync && (
          <div className={`rp-channel__sync${stale !== null && stale > 14 ? " is-stale" : ""}`}>
            <small>LAST SYNC FROM THE GAME</small><b>{md(archive.lastSync)}</b>
            <small>{stale === null ? "" : stale > 14 ? `${stale} DAYS AGO · BE KIND, RE-SYNC` : stale === 0 ? "TODAY" : `${stale} DAYS AGO`}</small>
          </div>
        )}
      </div>

      <div key={`rack-${take}`} className="rp-rack">
        {decks.map((c, i) => <Deck key={c.channel} c={c} index={i} tuned={tuned === c.channel} onTune={() => setTuned(tuned === c.channel ? null : c.channel)} />)}
        {archived.map((c) => (
          <div key={c.channel} className="rp-rack__archived">CH {pad(Number(c.channel), 2)} · {c.name.toUpperCase()} · {c.total} SIGNALS · S×{c.sCount} · OFF THE AIR (AGED OUT OF THE GAME'S API; KEPT FROM A BACKUP)</div>
        ))}
      </div>

      <aside className="rp-channel__side">
        <PitySpread key={`spread-${tuned}-${take}`} pulls={scoped} hard={scope?.hardPity ?? 90} />
        <div className="rp-luck">
          <div className="rp-luck__title">COINFLIPS <span>CHALLENGES ONLY · GUARANTEES DON'T COUNT</span></div>
          {flips.map((c) => {
            const rate = c.flip!.challenges ? c.flip!.wins / c.flip!.challenges : 0;
            const odds = c.flip!.label === "75/25" ? 0.75 : 0.5;
            return (
              <div key={c.channel} className="rp-luck__row">
                <span className="rp-luck__name">{c.name.replace(" Channel", "").toUpperCase()} · {c.flip!.label}</span>
                <span className="rp-luck__bar"><span style={{ width: `${rate * 100}%` }} /><i style={{ left: `${odds * 100}%` }} title={`${odds * 100}% = the odds`} /></span>
                <span className="rp-luck__val">{(rate * 100).toFixed(0)}% <small>{c.flip!.wins}/{c.flip!.challenges}</small></span>
              </div>
            );
          })}
          <div className="rp-luck__note">The tick marks the posted odds. Above it is running hot.</div>
        </div>
      </aside>

      <div className="rp-card-punch">
        <div className="rp-card-punch__head">
          <span className="rp-card-punch__title">MEMBER CARD · EVERY S-RANK{scope ? ` · CH ${pad(Number(scope.channel), 2)} TUNED` : ""}</span>
          <span className="rp-card-punch__legend">
            {(["won", "lost", "guaranteed", "plain"] as PullOutcome[]).map((o) => (
              <span key={o} className={`rp-legend-dot is-${o}`}><i>{OUTCOME[o].glyph}</i>{OUTCOME[o].label}</span>
            ))}
            <span className="rp-legend-dot is-gap"><i>!</i>ARCHIVE GAP</span>
          </span>
        </div>
        <div key={`punches-${take}`} className="rp-card-punch__holes" onMouseLeave={() => setHover(null)}>
          {ledger.map((p, i) => (
            <Punch key={`${p.channel}-${p.time}-${i}`} p={p} dim={!!tuned && p.channel !== tuned} gap={p.pity > (hard[p.channel] ?? 90)} onHover={setHover} active={hover === p} />
          ))}
        </div>
        <div className="rp-card-punch__readout" role="status">
          {hover ? (
            <>
              <b>{hover.name || "Unidentified S-rank"}</b>
              <span>{hover.time.slice(0, 10)} · CH {pad(Number(hover.channel), 2)} · PITY {hover.pity}{hover.pity > (hard[hover.channel] ?? 90) ? ` (PAST THE ${hard[hover.channel]} HARD PITY: AT LEAST ONE S-RANK IS MISSING FROM THE ARCHIVE BEFORE THIS ONE)` : ""} · {OUTCOME[hover.outcome].label}</span>
              {!hover.name && <span>GRAFTED FROM A BACKUP; ITS ITEM ID WAS NEVER MAPPED TO A NAME.</span>}
            </>
          ) : <span>HOVER OR TAB TO A PUNCH FOR THE PULL. PRESS A DECK TO TUNE THE CARD TO ONE CHANNEL.</span>}
        </div>
      </div>
    </section>
  );
}
