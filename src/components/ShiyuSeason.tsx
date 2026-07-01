import { Fragment } from "react";
import type { ShiyuCycle, ShiyuRating } from "@/lib/shiyu";
import { ratingClass } from "@/lib/shiyu";
import { DeckImg } from "@/components/deck/DeckImg";

// The season "master readout", Marquee edition — house medal + best total + rank + highest
// rating on one row, then the B→A→S→S+ challenge ladder as a connected horizontal stepper.
// The in-game Shiyu badge ghosts the panel's top-right corner.
const fmt = (n: number) => n.toLocaleString("en-US");
const LADDER: ShiyuRating[] = ["B", "A", "S", "S+"]; // display order (data lists newest-first)

export function ShiyuSeason({ cycle }: { cycle: ShiyuCycle }) {
  const steps = LADDER.flatMap((r) => cycle.targets.find((t) => t.rating === r) ?? []);

  return (
    <section className="shiyu-season">
      <DeckImg className="ss-wm" src="/assets/ui/shiyu-logo.webp" alt="" />
      <div className="ss-top">
        {cycle.medal && (
          <DeckImg className="ss-medal" src={`/assets/ui/medal-${cycle.medal}.webp`} alt={`${cycle.medal} medal`} />
        )}
        <div className="ss-best">
          <span className="ss-k">Best Total · This Cycle</span>
          <b>{fmt(cycle.bestTotal)}</b>
        </div>
        <div className="ss-cells">
          <div className="ss-cell">
            <span className="ss-k">Rank</span>
            <b>{cycle.rank}</b>
            {cycle.medal && <span className="ss-medal-name">{cycle.medal}</span>}
          </div>
          <div className="ss-cell">
            <span className="ss-k">Highest Rating</span>
            <span className={`rate ss-hrv r-${ratingClass(cycle.highestRating)}`}>{cycle.highestRating}</span>
          </div>
        </div>
      </div>

      <div className="ss-ladder">
        {steps.map((t, i) => (
          <Fragment key={t.rating}>
            {i > 0 && <span className={`ss-lnk${steps[i - 1].done && t.done ? " done" : ""}`} />}
            <div className={`ss-step${t.done ? " done" : ""}`}>
              <span className={`rate r-${ratingClass(t.rating)}`}>{t.rating}</span>
              <small>{t.desc}</small>
              <span className="ss-chk" aria-label={t.done ? "achieved" : "not yet"}>{t.done ? "✓" : "○"}</span>
            </div>
          </Fragment>
        ))}
      </div>
    </section>
  );
}
