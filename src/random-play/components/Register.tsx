"use client";
// THE REGISTER: Shiyu Defense as the store's front counter. The cycle prints out as a receipt
// (rooms are line items, the challenge targets are checkboxes, the rating is a rubber stamp);
// each room is a rental slip; the register tape along the bottom is every cycle ever rung up.
import { useAssets } from "../context";
import { useTake } from "./endgame";
import { BANGBOO_NAME, SHIYU_RATING_TARGETS, SHIYU_ROOM_CAP, SHIYU_SPLUS_TOTAL } from "../data/meta";
import type { Agent, EndgameLedger, EndgameRoom, ShiyuCycle } from "../data/types";
import { ELEMENT_COLORS } from "../tokens";
import { CastCircles, clock, ElementChips, fmt, HistoryStrip, shortDate } from "./endgame";
import { GradeSticker, Halftone } from "./primitives";

const pad2 = (n: number) => String(n).padStart(2, "0");
const ABBR: Record<string, string> = { Damage: "DMG", Elimination: "ELIM", Performance: "PERF" };
const Check = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M2 6.5 L5 9.2 L10 2.8" stroke="currentColor" strokeWidth="2.2" fill="none" /></svg>
);

export function Receipt({ cycle: c }: { cycle: ShiyuCycle }) {
  const sum = c.rooms.reduce((s, r) => s + r.score, 0);
  const [y, m, d] = c.date.split("-");
  return (
    // the caller keys this on cycle + take → it remounts and prints again
    <div className="rp-receipt" aria-label={`Receipt for the ${shortDate(c.date)} Shiyu cycle`}>
      <div className="rp-receipt__paper">
        <div className="rp-receipt__store">▶ RANDOM PLAY</div>
        <div className="rp-receipt__addr">SIXTH STREET · NEW ERIDU</div>
        <div className="rp-receipt__rule is-double" />
        <div className="rp-receipt__line"><span>SHIYU DEFENSE</span><span>{c.label.toUpperCase()}</span></div>
        <div className="rp-receipt__line"><span>{c.frontier.toUpperCase() || "FRONTIER NOT LOGGED"}</span><span>{m}/{d}/{y}</span></div>
        <div className="rp-receipt__line is-dim"><span>RECEIPT</span><span>#CN-{m}{d}</span></div>
        <div className="rp-receipt__rule" />
        {c.rooms.map((r) => (
          <div key={r.room} className="rp-receipt__item">
            <div className="rp-receipt__line is-strong">
              <span className="rp-receipt__name">{pad2(r.room)} {r.boss.name.toUpperCase()}</span>
              <span>{fmt(r.score)} {r.rating ?? ""}</span>
            </div>
            <div className="rp-receipt__line is-dim">
              <span>{r.parts.map((p) => `${ABBR[p.label] ?? p.label.toUpperCase()} ${fmt(p.value)}`).join(" · ")}</span>
              <span>{r.time ? clock(r.time) : ""}</span>
            </div>
          </div>
        ))}
        <div className="rp-receipt__rule" />
        <div className="rp-receipt__line"><span>ROOM SUM</span><span>{fmt(sum)}</span></div>
        <div className="rp-receipt__line is-total"><span>BEST TOTAL</span><span>{fmt(c.best)}</span></div>
        {sum !== c.best && <div className="rp-receipt__note">* The board keeps the best total. The rooms show the last run of each.</div>}
        <div className="rp-receipt__line"><span>RANK</span><span>{c.rank ? `TOP ${c.rank}` : "NOT POSTED"}</span></div>
        <div className="rp-receipt__rule is-double" />
        <div className="rp-receipt__line is-dim"><span>CHALLENGE TARGETS</span><span>{c.targets.filter((t) => t.done).length}/{c.targets.length}</span></div>
        {c.targets.map((t) => (
          <div key={t.rating} className={`rp-receipt__target${t.done ? " is-done" : ""}`}>
            <span className="rp-receipt__box">{t.done && <Check />}</span>
            <b>{t.rating}</b>
            <span>{t.desc}</span>
          </div>
        ))}
        <div className="rp-receipt__rule is-double" />
        <div className="rp-receipt__barcode" aria-hidden="true" />
        <div className="rp-receipt__thanks">THANK YOU · BE KIND, REWIND</div>
      </div>
      {c.highestRating && (
        <div className="rp-stamp" aria-label={`Highest rating ${c.highestRating}`}>
          <small>RATED</small><b>{c.highestRating}</b><small>{c.best >= SHIYU_SPLUS_TOTAL ? "100K+" : "THIS CYCLE"}</small>
        </div>
      )}
    </div>
  );
}

function ScoreBar({ room: r }: { room: EndgameRoom }) {
  const capped = r.score >= SHIYU_ROOM_CAP;
  const pct = (v: number) => `${Math.min(100, (v / SHIYU_ROOM_CAP) * 100)}%`;
  return (
    <div className="rp-slipbar">
      <div className="rp-slipbar__marks" aria-hidden="true">
        {SHIYU_RATING_TARGETS.map((t) => <span key={t.rating} style={{ left: pct(t.score) }}>{t.rating} {t.score / 1000}K</span>)}
        <span className="is-end">CAP 50K</span>
      </div>
      <div className="rp-slipbar__track" role="img" aria-label={`${fmt(r.score)} of ${fmt(SHIYU_ROOM_CAP)}: ${r.parts.map((p) => `${p.label} ${fmt(p.value)}`).join(", ")}`}>
        {r.parts.map((p, i) => <span key={p.label} className={`rp-slipbar__seg is-${i}`} style={{ width: pct(p.value) }} />)}
        {SHIYU_RATING_TARGETS.map((t) => <i key={t.rating} style={{ left: pct(t.score) }} />)}
      </div>
      <div className="rp-slipbar__legend">
        {r.parts.map((p, i) => <span key={p.label}><i className={`is-${i}`} />{p.label.toUpperCase()} {fmt(p.value)}</span>)}
        {capped && <span className="rp-slipbar__capped">CAPPED</span>}
      </div>
    </div>
  );
}

export function RoomSlip({ room: r, index, roster, onOpenAgent }: { room: EndgameRoom; index: number; roster: Record<string, Agent>; onOpenAgent: (s: string) => void }) {
  const assets = useAssets();
  const panel = r.recommended[0] ? ELEMENT_COLORS[r.recommended[0]] : "#3A332B";
  const names = Object.fromEntries(r.team.map((s) => [s, roster[s]?.name ?? s]));
  return (
    <article className="rp-slip" style={{ animationDelay: `${220 + index * 110}ms` }}>
      <div className="rp-slip__art" style={{ backgroundColor: panel }}>
        <Halftone />
        <img className="rp-slip__boss" src={assets.enemy(r.boss.slug)} alt="" />
        <span className="rp-slip__no">ROOM<b>{pad2(r.room)}</b></span>
      </div>
      {r.rating && <GradeSticker grade={r.rating} className="rp-slip__rating" />}
      <div className="rp-slip__info">
        <div className="rp-slip__kicker">
          {r.boss.tag && <span>{r.boss.tag.toUpperCase()}</span>}
          <span>LV {r.boss.level}</span>
          {r.anomaly && <span className="is-hot">ANOMALY ROOM</span>}
          <span>{r.time ? `CLEARED ${clock(r.time)}` : "CLEAR TIME NOT LOGGED"}</span>
        </div>
        <h3 className="rp-slip__name">{r.boss.name}</h3>
        <div className="rp-slip__els">
          <ElementChips label="REC" elements={r.recommended} />
          <ElementChips label="RESISTS" elements={r.resistance} />
        </div>
        <div className="rp-slip__score">
          <span className="rp-slip__total">{fmt(r.score)}</span>
          <ScoreBar room={r} />
        </div>
      </div>
      <div className="rp-slip__cast">
        <div className="rp-slip__label">STARRING</div>
        <CastCircles team={r.team} bangboo={r.bangboo} names={names} onOpen={onOpenAgent} />
        <div className="rp-slip__names">{r.team.map((s) => roster[s]?.spine ?? s).join(" · ")}</div>
        <div className="rp-slip__bb">{r.bangboo ? `WITH ${(BANGBOO_NAME[r.bangboo] ?? r.bangboo).toUpperCase()}` : "NO BANGBOO LOGGED"}</div>
      </div>
    </article>
  );
}

export interface RegisterProps {
  ledger: EndgameLedger<ShiyuCycle>;
  current: number;
  onPick: (i: number) => void;
  roster: Record<string, Agent>;
  onOpenAgent: (slug: string) => void;
  open: boolean;
}

export function Register({ ledger, current, onPick, roster, onOpenAgent, open }: RegisterProps) {
  const assets = useAssets();
  const take = useTake(open);
  const c = ledger.cycles[current];
  return (
    <section className={`rp-view rp-register rp-peg${open ? " is-in" : ""}`} aria-label="Shiyu Defense: the register" aria-hidden={!open}>
      {!c ? (
        <div className="rp-placeholder rp-register__empty"><b>Register closed</b>No Shiyu cycles on file for this profile yet. Nothing rung up, nothing to print.</div>
      ) : (
        <>
          <Receipt key={`${c.id}-${take}`} cycle={c} />
          <div className="rp-register__main">
            <div key={`${c.id}-${take}`} className="rp-register__head">
              <div>
                <div className="rp-register__kicker">THE REGISTER · SHIYU DEFENSE · {c.frontier.toUpperCase()}</div>
                <h2 className="rp-register__title">{c.label} <span>{shortDate(c.date)}</span></h2>
                <div className="rp-register__sub">{c.rooms.length} rooms rung up · best {fmt(c.best)} · source: coach pack, logged in-game</div>
              </div>
              <div className="rp-register__rank">
                {c.medal && <img src={assets.ui(`medal-${c.medal}` as "medal-legend")} alt={`${c.medal} medal`} />}
                <div><small>RANK</small><b>{c.rank ? `TOP ${c.rank}` : "—"}</b><small>{c.rank ? "OF ALL PROXIES" : "NOT POSTED YET"}</small></div>
              </div>
            </div>
            <div key={`${c.id}-${take}-slips`} className="rp-register__slips">
              {c.rooms.map((r, i) => <RoomSlip key={r.room} room={r} index={i} roster={roster} onOpenAgent={onOpenAgent} />)}
            </div>
          </div>
          <div className="rp-register__tape">
            <HistoryStrip tone="paper" points={ledger.history} current={current} onPick={onPick}
              title="REGISTER TAPE" sub={`${ledger.history.length} CYCLES RUNG UP · ${ledger.cycles.length} WITH FULL CARDS · CLICK A DARK BAR TO REPRINT`}
              reference={{ value: SHIYU_SPLUS_TOTAL, label: "S+ 100K" }} />
          </div>
        </>
      )}
    </section>
  );
}
