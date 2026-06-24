import Link from "next/link";
import type { CSSProperties } from "react";
import type { ShiyuRoom } from "@/lib/shiyu";
import { ratingClass } from "@/lib/shiyu";
import { elementColor, elementIcon, iconPath } from "@/lib/deck-config";
import { profileHref } from "@/lib/profile";
import { DeckImg } from "@/components/deck/DeckImg";

// One cleared Shiyu room: scores on the left, a "team" sub-panel on the right (boss + recommended /
// resistance attributes + the clearing agents). Element-accented (--ec) by the recommended attribute.
const fmt = (n: number) => n.toLocaleString("en-US");
const pct = (part: number, whole: number) => (whole > 0 ? Math.round((part / whole) * 100) : 0);
const ELIM_MAX = 5000; // elimination caps at 5,000 per room — a maxed bar reads as "can't go higher"

export function ShiyuRoomCard({ room, base = "" }: { room: ShiyuRoom; base?: string }) {
  const accent = room.recommended[0] ?? "Ice";
  const style = { "--ec": elementColor(accent) } as CSSProperties;
  const elimMaxed = room.scores.elimination >= ELIM_MAX;

  return (
    <article className="shiyu-room" style={style}>
      <header className="sr-head">
        <span className="sr-no">Room {room.room}</span>
        {room.time && <span className="sr-time">◷ {room.time}</span>}
        <span className={`rate big r-${ratingClass(room.rating)}`}>{room.rating}</span>
      </header>

      <div className="sr-body">
        {/* left — score breakdown */}
        <div className="sr-scores">
          <div className="sr-total">
            <span className="sr-k">Total Score</span>
            <span className="sr-tv">{fmt(room.scores.total)}</span>
          </div>
          <div className="sr-bars">
            <div className="sr-bar">
              <span className="sr-bl">Damage</span>
              <span className="sr-track">
                <i style={{ width: `${pct(room.scores.damage, room.scores.total)}%` }} />
              </span>
              <span className="sr-bv">{fmt(room.scores.damage)}</span>
            </div>
            <div className={`sr-bar${elimMaxed ? " maxed" : ""}`}>
              <span className="sr-bl">Elimination</span>
              <span className="sr-track">
                <i style={{ width: `${Math.min(100, pct(room.scores.elimination, ELIM_MAX))}%` }} />
              </span>
              <span className="sr-bv">
                {fmt(room.scores.elimination)}
                {elimMaxed && <em className="sr-max">MAX</em>}
              </span>
            </div>
          </div>
        </div>

        {/* right — team / boss panel */}
        <div className="sr-team">
          <div className="sr-boss">
            <DeckImg className="sr-boss-img" src={`/assets/bosses/${room.boss.slug}.webp`} alt={room.boss.name} />
            <div className="sr-boss-id">
              <span className="sr-lv">Lv {room.boss.level}</span>
              <span className="sr-bn">{room.boss.name}</span>
              {room.boss.tag && <span className="sr-tag">{room.boss.tag}</span>}
            </div>
          </div>

          <div className="sr-attrs">
            <div className="sr-attr">
              <span className="sr-al">Recommended</span>
              <span className="sr-chips">
                {room.recommended.map((a) => (
                  <span key={a} className="sr-chip">
                    <DeckImg src={iconPath(elementIcon(a))} alt={a} className="sr-ai" />
                    {a}
                  </span>
                ))}
                {room.anomaly && <span className="sr-chip anom">Anomaly</span>}
              </span>
            </div>
            <div className="sr-attr">
              <span className="sr-al">Resistance</span>
              <span className="sr-chips">
                {room.resistance.map((a) => (
                  <span key={a} className="sr-chip res">
                    <DeckImg src={iconPath(elementIcon(a))} alt={a} className="sr-ai" />
                    {a}
                  </span>
                ))}
              </span>
            </div>
          </div>

          <div className="sr-agents">
            {room.team.map((m) => (
              <Link key={m.slug} href={profileHref(base, `/r/${m.slug}/`)} className="sr-agent" title={m.name}>
                <DeckImg src={`/assets/endgame/${m.slug}.webp`} alt={m.name} className="sr-aimg" />
              </Link>
            ))}
            {room.bangboo && (
              <span className="sr-agent sr-boo" title={`${room.bangboo.name} (Bangboo)`}>
                <DeckImg src={`/assets/bangboo/${room.bangboo.slug}.webp`} alt={room.bangboo.name} className="sr-aimg" />
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
