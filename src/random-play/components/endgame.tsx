"use client";
// Shared pieces of the two endgame surfaces (The Register = Shiyu, Now Showing = Deadly Assault).
import { useEffect, useState } from "react";
import { useAssets } from "../context";
import type { HistoryPoint } from "../data/types";
import type { Element } from "../tokens";

/**
 * Bumps every time a mounted view opens. Views never unmount (docs/03), so their entrance
 * animations ran once at page load, hidden; keying content on the take replays them on open.
 */
export function useTake(open: boolean) {
  const [take, setTake] = useState(0);
  useEffect(() => { if (open) setTake((t) => t + 1); }, [open]);
  return take;
}

export const fmt = (n: number) => n.toLocaleString("en-US");
/** "2026-09-18" → "09/18" */
export const shortDate = (d: string) => d.slice(5).replace("-", "/");
/** "01m 24s" → "01:24" */
export const clock = (t: string) => t.replace(/(\d+)m\s*(\d+)s/, "$1:$2");

/** Element icons with names, for recommended / resistance rows. */
export function ElementChips({ label, elements, tone = "paper" }: { label: string; elements: Element[]; tone?: "paper" | "ink" }) {
  const assets = useAssets();
  return (
    <span className={`rp-elrow is-${tone}`}>
      <span className="rp-elrow__label">{label}</span>
      {elements.length ? elements.map((e) => (
        <span key={e} className="rp-elrow__el"><img src={assets.element(e)} alt="" />{e}</span>
      )) : <span className="rp-elrow__el is-none">NONE</span>}
    </span>
  );
}

const PLOT_H = 110; // px of bar height; the 20px date row sits under it
const DATE_H = 20;
const niceMax = (v: number) => {
  const step = 10 ** Math.floor(Math.log10(v)) / 2; // 50,000 steps at this scale
  return Math.ceil((v * 1.06) / step) * step;
};

export interface HistoryStripProps {
  points: HistoryPoint[];
  /** Index into `cycles` of the card on show. */
  current: number;
  onPick: (cycle: number) => void;
  title: string;
  sub: string;
  /** Optional reference line (Shiyu's S+ threshold). */
  reference?: { value: number; label: string };
  tone: "paper" | "ink";
}

/**
 * Single-series column chart of every logged cycle total, oldest → newest. It doubles as the cycle
 * picker: columns with a full card on file are buttons; the rest are history-only (still focusable,
 * so their tooltip is reachable by keyboard). Zero baseline, hairline grid, labels only on the record
 * and the selected cycle, one tooltip per column (docs: dataviz marks + interaction specs).
 */
export function HistoryStrip({ points, current, onPick, title, sub, reference, tone }: HistoryStripProps) {
  const [hover, setHover] = useState<number | null>(null);
  if (!points.length) {
    return <div className={`rp-hist is-${tone}`}><div className="rp-hist__head"><span className="rp-hist__title">{title}</span></div><div className="rp-hist__empty">No cycles logged yet. The tape is still blank.</div></div>;
  }
  const max = niceMax(Math.max(...points.map((p) => p.score), reference?.value ?? 0));
  const record = points.reduce((a, b) => (b.score > a.score ? b : a));
  const ticks = [0, max / 2, max];
  const tip = hover !== null ? points[hover] : null;
  return (
    <div className={`rp-hist is-${tone}`}>
      <div className="rp-hist__head">
        <span className="rp-hist__title">{title}</span>
        <span className="rp-hist__sub">{sub}</span>
      </div>
      <div className="rp-hist__plot">
        {ticks.map((t) => (
          <div key={t} className="rp-hist__grid" style={{ bottom: DATE_H + (t / max) * PLOT_H }}><span>{t ? `${t / 1000}K` : "0"}</span></div>
        ))}
        {reference && (
          <div className="rp-hist__ref" style={{ bottom: DATE_H + (reference.value / max) * PLOT_H }}><span>{reference.label}</span></div>
        )}
        <div className="rp-hist__cols" onMouseLeave={() => setHover(null)}>
          {points.map((p, i) => {
            const on = p.cycle === current;
            const isRecord = p === record;
            const cls = `rp-hist__col${on ? " is-on" : ""}${p.cycle === null ? " is-ghost" : ""}${hover === i ? " is-hover" : ""}`;
            return (
              <button key={p.date} className={cls} aria-pressed={p.cycle === null ? undefined : on} aria-disabled={p.cycle === null}
                aria-label={`${shortDate(p.date)}: ${fmt(p.score)}${p.rank ? `, rank top ${p.rank}` : ""}${p.cycle === null ? ", history only" : ""}`}
                onMouseEnter={() => setHover(i)} onFocus={() => setHover(i)} onBlur={() => setHover(null)}
                onClick={() => p.cycle !== null && !on && onPick(p.cycle)}>
                <span className="rp-hist__barwrap">
                  {(on || isRecord) && (
                    <span className="rp-hist__cap" style={{ bottom: `${(p.score / max) * 100}%` }}>
                      {isRecord && <em>RECORD</em>}{fmt(p.score)}
                    </span>
                  )}
                  <span className="rp-hist__bar" style={{ height: `${(p.score / max) * 100}%`, animationDelay: `${i * 40}ms` }} />
                </span>
                <span className="rp-hist__date">{shortDate(p.date)}</span>
              </button>
            );
          })}
        </div>
        {tip && (
          <div className="rp-hist__tip" style={{ left: `${((hover! + 0.5) / points.length) * 100}%` }} role="status">
            <b>{fmt(tip.score)}</b>
            <span>{shortDate(tip.date)}{tip.rank ? ` · TOP ${tip.rank}` : ""}</span>
            <span>{tip.cycle === null ? "HISTORY ONLY · NO CARD ON FILE" : tip.cycle === current ? "ON SHOW NOW" : "CLICK TO PULL THIS CARD"}</span>
          </div>
        )}
      </div>
    </div>
  );
}

/** Round endgame face circles for a lineup (+ Bangboo), optionally clickable to open the tape. */
export function CastCircles({ team, bangboo, names, onOpen, size = "md" }: {
  team: string[]; bangboo: string | null; names: Record<string, string>; onOpen?: (slug: string) => void; size?: "md" | "sm";
}) {
  const assets = useAssets();
  return (
    <span className={`rp-cast is-${size}`}>
      {team.map((s, i) => onOpen && names[s] ? (
        <button key={s} className="rp-cast__face" style={{ zIndex: 3 - i }} onClick={() => onOpen(s)} aria-label={`Open ${names[s]}'s tape`}>
          <img src={assets.circle(s)} alt="" />
        </button>
      ) : (
        <span key={s} className="rp-cast__face" style={{ zIndex: 3 - i }}><img src={assets.circle(s)} alt={names[s] ?? s} /></span>
      ))}
      <span className="rp-cast__plus" aria-hidden="true">+</span>
      <span className={`rp-cast__bb${bangboo ? "" : " is-empty"}`}>
        <img src={bangboo ? assets.bangboo(bangboo) : assets.ui("socket-empty")} alt={bangboo ? `Bangboo ${bangboo}` : "No Bangboo logged"} />
      </span>
    </span>
  );
}
