import type { AssaultAdversity } from "@/lib/assault";
import { AssaultRoomCard } from "@/components/AssaultRoomCard";
import { AssaultPips } from "@/components/AssaultSeason";

// Adversity Mode — Version 3.1's separate "extra hard" node. The game scores it in its own
// right (own total, own ranking, own badges) and it does NOT pool into the Trial Mode total,
// so it gets its own readout band rather than a fourth target card. The visual break is the
// point: these numbers must never read as part of the 9-pip Trial run above them.
const fmt = (n: number) => n.toLocaleString("en-US");

export function AssaultAdversityPanel({
  adversity,
  base = "",
}: {
  adversity: AssaultAdversity;
  base?: string;
}) {
  return (
    <section className="da-adv">
      <div className="da-adv-bar">
        <span className="da-adv-tag">
          Adversity Mode
          <small>Scored separately</small>
        </span>
        <div className="ss-cells">
          <div className="ss-cell">
            <span className="ss-k">Best Score</span>
            <b>{fmt(adversity.bestTotal)}</b>
          </div>
          <div className="ss-cell">
            <span className="ss-k">Ranking</span>
            <b>{adversity.rank}</b>
          </div>
          <div className="ss-cell">
            <span className="ss-k">Challenge Goals</span>
            <span className="da-pipline">
              <AssaultPips earned={adversity.room.pips} max={3} />
              <em>{adversity.room.pips}/3</em>
            </span>
          </div>
          {adversity.medals && (
            <div className="ss-cell">
              <span className="ss-k">Badges</span>
              <span className="da-medals">
                <span className="da-medal crown">
                  <i>♛</i> {adversity.medals.crown}
                </span>
                {adversity.medals.shield !== undefined && (
                  <span className="da-medal shield">
                    <i>⛨</i> {adversity.medals.shield}
                  </span>
                )}
              </span>
            </div>
          )}
        </div>
      </div>
      <AssaultRoomCard room={adversity.room} base={base} />
    </section>
  );
}
