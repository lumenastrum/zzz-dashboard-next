"use client";
// NOW SHOWING: Deadly Assault as the cinema half of the store. The rotation goes up on a marquee
// letterboard, each boss is a one-sheet poster (pips = critic stars, the lineup = the billing block,
// the score = the box office, the 65,000 cap = SOLD OUT), Adversity is the midnight showing, and
// every poster turns over to its synopsis (the room's gimmick + house rule).
import { useState, type CSSProperties } from "react";
import { useAssets } from "../context";
import { useTake } from "./endgame";
import { BANGBOO_NAME, DA_CAP } from "../data/meta";
import type { Agent, AssaultCycle, EndgameLedger, EndgameRoom } from "../data/types";
import { ELEMENT_COLORS } from "../tokens";
import { CastCircles, clock, ElementChips, fmt, HistoryStrip, shortDate } from "./endgame";
import { Halftone } from "./primitives";

/** Marquee letterboard: every character is its own felt-board letter, hung slightly off true. Letters are
 *  grouped per word (each word keeps its trailing space) so a narrow board wraps between words, never
 *  through one; `i` stays the position in the whole string, so tilt and delay are unchanged. */
export function Letterboard({ text }: { text: string }) {
  const words = text.toUpperCase().split(" ");
  let i = -1;
  return (
    <span className="rp-letters" aria-label={text}>
      {words.map((word, w) => (
        <span key={w} className="rp-letters__w">
          {[...(w < words.length - 1 ? `${word} ` : word)].map((ch) => {
            const k = ++i;
            return (
              <span key={k} aria-hidden="true" className={`rp-letters__c${ch === " " ? " is-space" : ""}`}
                style={{ "--rp-tilt": `translateY(${((k * 7) % 5) - 2}px) rotate(${(((k * 37) % 7) - 3) * 0.6}deg)`, animationDelay: `${300 + k * 35}ms` } as CSSProperties}>
                {ch}
              </span>
            );
          })}
        </span>
      ))}
    </span>
  );
}

const Pips = ({ n, of = 3 }: { n: number; of?: number }) => {
  const assets = useAssets();
  return (
    <span className="rp-pips" role="img" aria-label={`${n} of ${of} stars`}>
      {Array.from({ length: of }, (_, i) => <img key={i} src={assets.ui("da-pip")} alt="" className={i < n ? "is-lit" : ""} />)}
    </span>
  );
};

const titleSize = (name: string) => (name.length <= 12 ? 40 : name.length <= 20 ? 32 : 27);

export interface PosterProps {
  room: EndgameRoom;
  index: number;
  roster: Record<string, Agent>;
  midnight?: { best: number; rank: string | null };
}

export function Poster({ room: r, index, roster, midnight }: PosterProps) {
  const assets = useAssets();
  const [flipped, setFlipped] = useState(false);
  const capped = !midnight && r.score >= DA_CAP;
  const scaleMax = midnight && r.targets?.length ? r.targets[r.targets.length - 1] * 1.2 : DA_CAP;
  const pct = (v: number) => `${Math.min(100, (v / scaleMax) * 100)}%`;
  const names = Object.fromEntries(r.team.map((s) => [s, roster[s]?.name ?? s]));
  const bb = r.bangboo ? BANGBOO_NAME[r.bangboo] ?? r.bangboo : null;
  const panel = r.recommended[0] ? ELEMENT_COLORS[r.recommended[0]] : ELEMENT_COLORS.Fire;
  const screen = midnight ? "MIDNIGHT SHOWING" : `SCREEN ${r.room}`;
  return (
    <article className={`rp-poster${flipped ? " is-flipped" : ""}${midnight ? " is-midnight" : ""}`} style={{ animationDelay: `${index * 110}ms` }}>
      <button className="rp-poster__hit" aria-pressed={flipped} onClick={() => setFlipped((f) => !f)}
        aria-label={`${r.boss.name}, ${fmt(r.score)}. ${flipped ? "Turn back to the poster" : "Turn over for the synopsis"}`}>
        <div className="rp-poster__card">
          <div className="rp-poster__face rp-poster__front">
            <div className="rp-poster__top">
              <span>{screen}{r.timeLimit ? ` · ${clock(r.timeLimit)}` : ""}</span>
              {typeof r.pips === "number" && <Pips n={r.pips} />}
            </div>
            <div className="rp-poster__art" style={{ backgroundColor: panel }}>
              <Halftone />
              <img className="rp-poster__boss" src={assets.enemy(r.boss.slug)} alt="" />
              {r.buff && (
                <span className="rp-poster__buff"><img src={assets.buff(r.buff.slug)} alt="" /><span>{r.buff.name.toUpperCase()}</span></span>
              )}
              {capped && <span className="rp-poster__soldout">SOLD OUT<small>65,000 · CAPPED</small></span>}
            </div>
            <div className="rp-poster__title">
              <span className="rp-poster__pres">{midnight ? "ADVERSITY · A RANDOM PLAY LATE SHOW" : r.specialty ? `${r.specialty.toUpperCase()} WANTED` : "A DEADLY ASSAULT PICTURE"}</span>
              <span className="rp-poster__name" style={{ fontSize: titleSize(r.boss.name) }}>{r.boss.name}</span>
            </div>
            <div className="rp-poster__billing">
              <CastCircles team={r.team} bangboo={r.bangboo} names={names} size="sm" />
              <div className="rp-poster__credits">
                <small>STARRING</small> {r.team.map((s) => roster[s]?.name ?? s).join("  ")}
                {bb ? <> <small>AND</small> {bb} <small>AS THE BANGBOO</small></> : <> <small>NO BANGBOO LOGGED</small></>}
              </div>
            </div>
            <div className="rp-poster__box">
              <div className="rp-poster__gross"><small>{midnight ? "LATE-SHOW GROSS" : "BOX OFFICE"}</small><b>{fmt(r.score)}</b></div>
              <div className={`rp-poster__bar${capped ? " is-cap" : ""}`}>
                <span style={{ width: pct(r.score) }} />
                {midnight && r.targets?.map((t, i) => <i key={t} style={{ left: pct(t) }} title={`${i + 1}★ at ${fmt(t)}`} />)}
              </div>
              <div className="rp-poster__scale">
                {midnight && r.targets ? r.targets.map((t, i) => <span key={t} style={{ left: pct(t) }}>{i + 1}★ {t / 1000}K</span>)
                  : <span className="is-end">{capped ? "AT THE CAP" : `${fmt(DA_CAP - r.score)} TO THE CAP`}</span>}
              </div>
            </div>
          </div>

          <div className="rp-poster__face rp-poster__back rp-paperstock">
            <div className="rp-poster__backhead"><span>{screen} · SYNOPSIS</span><span>LV {r.boss.level}</span></div>
            <div className="rp-poster__backname">{r.boss.name}</div>
            <p className="rp-poster__syn">{r.gimmick ?? "No synopsis logged for this room."}</p>
            {r.buff && (
              <div className="rp-poster__rule">
                <img src={assets.buff(r.buff.slug)} alt="" />
                <div><b>HOUSE RULE · {r.buff.name.toUpperCase()}</b><p>{r.buff.desc}</p></div>
              </div>
            )}
            <div className="rp-poster__facts">
              <ElementChips label="REC" elements={r.recommended} />
              <ElementChips label="RESISTS" elements={r.resistance} />
            </div>
            <div className="rp-poster__split">
              {r.parts.map((p) => <span key={p.label}><small>{p.label.toUpperCase()}</small>{fmt(p.value)}</span>)}
              <span className="is-total"><small>TOTAL</small>{fmt(r.score)}</span>
            </div>
            {midnight && <div className="rp-poster__midrank">ADVERSITY BEST {fmt(midnight.best)} · {midnight.rank ? `TOP ${midnight.rank}` : "RANK NOT POSTED"}</div>}
            <div className="rp-poster__turn">↺ TURN BACK</div>
          </div>
        </div>
      </button>
    </article>
  );
}

export interface NowShowingProps {
  ledger: EndgameLedger<AssaultCycle>;
  current: number;
  onPick: (i: number) => void;
  roster: Record<string, Agent>;
  open: boolean;
}

export function NowShowing({ ledger, current, onPick, roster, open }: NowShowingProps) {
  const assets = useAssets();
  const take = useTake(open);
  const c = ledger.cycles[current];
  return (
    <section className={`rp-view rp-cinema rp-hatch${open ? " is-in" : ""}`} aria-label="Deadly Assault: now showing" aria-hidden={!open}>
      {!c ? (
        <div className="rp-placeholder rp-cinema__empty"><b>House lights down</b>No Deadly Assault rotations on file for this profile yet. Nothing on the bill.</div>
      ) : (
        <>
          <div className="rp-marquee">
            <i className="rp-marquee__bulbs is-top" aria-hidden="true" />
            <i className="rp-marquee__bulbs is-bottom" aria-hidden="true" />
            <img className="rp-marquee__logo" src={assets.ui("da-logo")} alt="Deadly Assault" />
            <div className="rp-marquee__board">
              <div className="rp-marquee__kicker">NOW SHOWING · DEADLY ASSAULT · OPENED {shortDate(c.date)}</div>
              <Letterboard key={`${c.id}-${take}`} text={c.label} />
            </div>
            <div className="rp-marquee__gross">
              <small>BOX OFFICE TOTAL</small>
              <b>{fmt(c.best)}</b>
              <span>{c.rank ? `TOP ${c.rank}` : "RANK NOT POSTED"} · {c.medals.crown} CROWNS · {c.medals.shield} SHIELDS</span>
            </div>
          </div>
          <div key={`${c.id}-${take}`} className="rp-posters">
            {c.rooms.map((r, i) => <Poster key={r.room} room={r} index={i} roster={roster} />)}
            {c.adversity ? (
              <Poster room={c.adversity.room} index={3} roster={roster} midnight={{ best: c.adversity.best, rank: c.adversity.rank }} />
            ) : (
              <article className="rp-poster is-midnight is-none" style={{ animationDelay: "330ms" }}>
                <div className="rp-poster__none"><small>MIDNIGHT SHOWING</small><b>No late show on file</b>Adversity wasn't logged for this rotation. The slot stays dark rather than guessed.</div>
              </article>
            )}
          </div>
          <div className="rp-cinema__office">
            <HistoryStrip tone="ink" points={ledger.history} current={current} onPick={onPick}
              title="BOX OFFICE HISTORY" sub={`${ledger.history.length} ROTATIONS · ${ledger.cycles.length} WITH POSTERS ON FILE · CLICK A LIT BAR TO RE-HANG THE BILL`} />
          </div>
        </>
      )}
    </section>
  );
}
