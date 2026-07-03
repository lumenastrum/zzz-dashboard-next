import type { CSSProperties } from "react";
import type { AssaultCycle } from "@/lib/assault";
import { cyclePips } from "@/lib/assault";
import { elementColor } from "@/lib/deck-config";
import { DeckImg } from "@/components/deck/DeckImg";

// The Deadly Assault season readout — best total + ranking + pip tally + career medals on one
// row (Shiyu's ss-* master-readout language), then the in-game bottom-of-screen boss trio as a
// rail of score tiles, each anchor-linking to its room card. The DA fang wordmark ghosts the
// panel's top-right (same invert trick as the Shiyu badge — the asset is black-on-transparent).
const fmt = (n: number) => n.toLocaleString("en-US");

function Pips({ earned, max, size = 18 }: { earned: number; max: number; size?: number }) {
  return (
    <span className="da-pips" style={{ "--pip": `${size}px` } as CSSProperties}>
      {Array.from({ length: max }, (_, i) => (
        <DeckImg key={i} src="/assets/ui/da-pip.webp" alt="" className={`da-pip${i < earned ? " on" : ""}`} />
      ))}
    </span>
  );
}

export { Pips as AssaultPips };

export function AssaultSeason({ cycle }: { cycle: AssaultCycle }) {
  const pips = cyclePips(cycle);

  return (
    <section className="shiyu-season da-season">
      <DeckImg className="ss-wm da-wm" src="/assets/ui/da-logo.webp" alt="" />
      <div className="ss-top">
        <div className="ss-best">
          <span className="ss-k">Best Total Score · This Rotation</span>
          <b>{fmt(cycle.bestTotal)}</b>
        </div>
        <div className="ss-cells">
          <div className="ss-cell">
            <span className="ss-k">Ranking</span>
            <b>{cycle.rank}</b>
          </div>
          <div className="ss-cell">
            <span className="ss-k">Challenge Goals</span>
            <span className="da-pipline">
              <Pips earned={pips.earned} max={pips.max} />
              <em>
                {pips.earned}/{pips.max}
              </em>
            </span>
          </div>
          {cycle.medals && (
            <div className="ss-cell">
              <span className="ss-k">Career Medals</span>
              <span className="da-medals">
                <span className="da-medal crown">
                  <i>♛</i> {cycle.medals.crown}
                </span>
                <span className="da-medal shield">
                  <i>⛨</i> {cycle.medals.shield}
                </span>
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="da-rail-row">
        {cycle.rooms.map((r) => (
          <a
            key={r.room}
            href={`#da-room-${r.room}`}
            className="da-boss-tile"
            style={{ "--ec": elementColor(r.recommended[0] ?? "Ether") } as CSSProperties}
          >
            {/* the in-game DA rail's own head banner (IconMonster art), ghosted right */}
            <span className="da-bt-ico" aria-hidden>
              <DeckImg src={`/assets/bosses/${r.boss.slug}.webp`} alt="" />
            </span>
            <span className="da-bt-body">
              <span className="da-bt-name">
                {r.boss.tag && <small>{r.boss.tag} · </small>}
                {r.boss.name}
              </span>
              <Pips earned={r.pips} max={3} size={14} />
              <b className="da-bt-score">{fmt(r.scores.total)}</b>
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
