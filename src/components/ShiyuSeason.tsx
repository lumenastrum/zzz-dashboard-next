import type { ShiyuCycle } from "@/lib/shiyu";
import { ratingClass } from "@/lib/shiyu";

// The season "master readout" — best total + rank + highest rating, then the B/A/S/S+ challenge
// ladder with check states. Pure presentation; mirrors the in-game Shiyu summary in Soundsystem chrome.
const fmt = (n: number) => n.toLocaleString("en-US");

export function ShiyuSeason({ cycle }: { cycle: ShiyuCycle }) {
  return (
    <section className="shiyu-season">
      <div className="ss-top">
        <div className="ss-cell ss-best">
          <span className="ss-k">Best Total · This Cycle</span>
          <span className="ss-score">{fmt(cycle.bestTotal)}</span>
        </div>
        <div className="ss-cell ss-rank">
          <span className="ss-k">Rank</span>
          <span className="ss-rankv">{cycle.rank}</span>
        </div>
        <div className="ss-cell ss-hr">
          <span className="ss-k">Highest Rating</span>
          <span className={`rate big r-${ratingClass(cycle.highestRating)}`}>{cycle.highestRating}</span>
        </div>
      </div>

      <div className="ss-targets">
        <span className="ss-k">Challenge Targets</span>
        <ul>
          {cycle.targets.map((t) => (
            <li key={t.rating} className={t.done ? "done" : undefined}>
              <span className={`rate r-${ratingClass(t.rating)}`}>{t.rating}</span>
              <span className="tg-desc">{t.desc}</span>
              <span className="tg-check" aria-label={t.done ? "achieved" : "not yet"}>{t.done ? "✓" : "○"}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
