"use client";
// STAFF PICKS: a profile's pull-priority list as the most video-store thing there is: handwritten
// shelf-talker cards. Rank = the order she should pull in (pure roster fit, per the dashboard's
// doctrine); tier = signal strength as stars; the big card is the pitch (why + the teams it builds).
import type { CSSProperties } from "react";
import { useAssets } from "../context";
import type { StaffPick } from "../data/types";
import { ELEMENT_COLORS, type Element } from "../tokens";
import { useTake } from "./endgame";

const Stars = ({ n }: { n: number }) => (
  <span className="rp-stars" role="img" aria-label={`Tier ${n} of 5`}>
    {[1, 2, 3, 4, 5].map((i) => <i key={i} className={i <= n ? "is-on" : ""}>★</i>)}
  </span>
);
// Deterministic hang angle per card (no Math.random: the render must be stable)
const tilt = (rank: number) => ((rank * 37) % 7 - 3) * 0.55;
const elColor = (attr: string) => ELEMENT_COLORS[attr as Element] ?? "#8A7E6E";

export function ShelfTalker({ p, on, onPick, index }: { p: StaffPick; on: boolean; onPick: () => void; index: number }) {
  const assets = useAssets();
  return (
    <button className={`rp-talker${on ? " is-on" : ""}${p.upcoming ? " is-soon" : ""}`} aria-pressed={on} onClick={onPick}
      style={{ "--rp-tilt": `rotate(${tilt(p.rank)}deg)`, animationDelay: `${index * 60}ms` } as CSSProperties}
      aria-label={`Staff pick number ${p.rank}: ${p.name}, ${p.priority}`}>
      <span className="rp-talker__tape" aria-hidden="true" />
      <span className="rp-talker__edge" style={{ background: elColor(p.attribute) }} aria-hidden="true" />
      <span className="rp-talker__rank">#{p.rank}</span>
      <span className="rp-talker__faces">
        {p.emotes.map((e) => <img key={e} src={assets.emote(e)} alt="" />)}
      </span>
      <span className="rp-talker__name">{p.name}</span>
      <span className="rp-talker__meta">{p.attribute.toUpperCase()} · {p.section.toUpperCase()}</span>
      <Stars n={p.tier} />
      {p.upcoming && <span className="rp-talker__soon">COMING SOON</span>}
      {p.leak && <span className="rp-talker__rumor">RUMOR</span>}
    </button>
  );
}

export interface StaffPicksProps { picks: StaffPick[]; current: number; onPick: (i: number) => void; forName: string; staff: string; open: boolean }

export function StaffPicks({ picks, current, onPick, forName, staff, open }: StaffPicksProps) {
  const assets = useAssets();
  const take = useTake(open);
  const p = picks[current];
  return (
    <section className={`rp-view rp-picks rp-peg${open ? " is-in" : ""}`} aria-label="Staff picks: what to pull next" aria-hidden={!open}>
      {!p ? (
        <div className="rp-placeholder rp-picks__empty"><b>No staff picks</b>Nobody's written a pull list for this profile yet.</div>
      ) : (
        <>
          <div key={`head-${take}`} className="rp-picks__head">
            <div>
              <div className="rp-picks__kicker">STAFF PICKS · WHAT TO PULL NEXT · FOR {forName.toUpperCase()}</div>
              <h2 className="rp-picks__title">Staff Picks</h2>
              <div className="rp-picks__sub">Ranked by how much each one completes your teams, not by what's on banner today. Stars = how loud the signal is.</div>
            </div>
            <div className="rp-picks__sign">Hand-picked by<b>{staff}</b></div>
          </div>
          <div key={`shelf-${take}`} className="rp-picks__shelf">
            {picks.map((x, i) => <ShelfTalker key={x.rank} p={x} index={i} on={i === current} onPick={() => onPick(i)} />)}
          </div>
          <article key={`card-${p.rank}-${take}`} className="rp-pickcard">
            <div className="rp-pickcard__side" style={{ background: elColor(p.attribute) }}>
              <div className="rp-dots" aria-hidden="true" />
              <div className="rp-pickcard__rank">#{p.rank}</div>
              <div className={`rp-pickcard__faces is-${p.emotes.length}`}>{p.emotes.map((e) => <img key={e} src={assets.emote(e)} alt="" />)}</div>
            </div>
            <div className="rp-pickcard__body">
              <div className="rp-pickcard__kicker">STAFF PICK · {p.attribute.toUpperCase()} · {p.section.toUpperCase()}{p.eta ? ` · ${p.eta.toUpperCase()}` : ""}</div>
              <div className="rp-pickcard__top">
                <h3 className="rp-pickcard__name">{p.name}</h3>
                <Stars n={p.tier} />
              </div>
              <div className="rp-pickcard__priority">{p.priority}</div>
              <div className="rp-pickcard__cols">
                <div className="rp-pickcard__why">
                  {p.why.map((para, i) => <p key={i}>{para.split("\n").map((line, j) => <span key={j}>{j > 0 && <br />}{line}</span>)}</p>)}
                </div>
                <div className="rp-pickcard__team">
                  <div className="rp-pickcard__label">TEAMS THIS PICK BUILDS</div>
                  {p.team.map((t) => <div key={t} className="rp-pickcard__line">{t}</div>)}
                  {p.leak && <div className="rp-pickcard__rumor">Kit and teams come from leaks and beta. They can change before launch.</div>}
                </div>
              </div>
              <div className="rp-pickcard__sig">— {staff}, staff ♡</div>
            </div>
          </article>
        </>
      )}
    </section>
  );
}
