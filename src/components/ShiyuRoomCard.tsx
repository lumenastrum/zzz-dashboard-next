import Link from "next/link";
import type { CSSProperties } from "react";
import type { ShiyuRoom } from "@/lib/shiyu";
import { ratingClass } from "@/lib/shiyu";
import { elementColor, elementIcon, iconPath } from "@/lib/deck-config";
import { profileHref } from "@/lib/profile";
import { DeckImg } from "@/components/deck/DeckImg";

// One cleared Shiyu room, Marquee edition — a boss poster. The full-body enemy render
// (/assets/enemies/<boss.slug>.webp, staged by stage-shiyu.py) anchors the right edge and
// pops above the card top; a giant outlined rating letter watermarks behind it. Left column:
// score + VU-segment bars + attribute chips + the team as Teams-tab diagonal cards.
// Element-accented (--ec) by the recommended attribute. A boss without a staged render
// degrades gracefully (DeckImg self-hides; the nameplate still identifies the room).
const fmt = (n: number) => n.toLocaleString("en-US");
const ELIM_MAX = 5000; // elimination caps at 5,000 per room — a maxed bar reads as "can't go higher"
const SEGS = 20; // VU bar resolution

export const litSegs = (part: number, whole: number) =>
  Math.max(0, Math.min(SEGS, Math.round((whole > 0 ? part / whole : 0) * SEGS)));

// Shared with AssaultRoomCard — one VU language across both endgame tabs.
export function VuBar({ label, value, lit, maxed }: { label: string; value: number; lit: number; maxed?: boolean }) {
  return (
    <div className={`sr-bar${maxed ? " maxed" : ""}`}>
      <span className="sr-bl">{label}</span>
      <span className="sr-segs">
        {Array.from({ length: SEGS }, (_, i) => (
          <i key={i} className={i < lit ? "on" : undefined} />
        ))}
      </span>
      <span className="sr-bv">
        {fmt(value)}
        {maxed && <em className="sr-max">MAX</em>}
      </span>
    </div>
  );
}

export function ShiyuRoomCard({ room, base = "" }: { room: ShiyuRoom; base?: string }) {
  const accent = room.recommended[0] ?? "Ice";
  const style = { "--ec": elementColor(accent) } as CSSProperties;
  const elimMaxed = room.scores.elimination >= ELIM_MAX;

  return (
    <article className="shiyu-room" style={style}>
      <i className="sr-hz" aria-hidden />
      <span className="sr-wm" aria-hidden>{room.rating}</span>
      <DeckImg className="sr-render" src={`/assets/enemies/${room.boss.slug}.webp`} alt={room.boss.name} />
      <div className="sr-boss-tag">
        <span className="sr-lv">LV {room.boss.level}</span>
        <span className="sr-bn">{room.boss.name}</span>
        {room.boss.tag && <span className="sr-tag">{room.boss.tag}</span>}
      </div>

      <div className="sr-in">
        <header className="sr-head">
          <span className="sr-no">Room {room.room}</span>
          {room.time && <span className="sr-time">◷ {room.time}</span>}
          <span className={`rate sr-rate r-${ratingClass(room.rating)}`}>{room.rating}</span>
        </header>

        <div className="sr-total">
          <span className="sr-k">Total Score</span>
          <b>{fmt(room.scores.total)}</b>
        </div>

        <div className="sr-vu">
          <VuBar label="Damage" value={room.scores.damage} lit={litSegs(room.scores.damage, room.scores.total)} />
          <VuBar label="Elimination" value={room.scores.elimination} lit={litSegs(room.scores.elimination, ELIM_MAX)} maxed={elimMaxed} />
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

        <div className="sr-crew">
          {room.team.map((m) => (
            <Link key={m.slug} href={profileHref(base, `/r/${m.slug}/`)} className="sr-card" title={m.name}>
              <DeckImg src={`/assets/teamcards/${m.slug}.webp`} alt={m.name} className="sr-cp" />
              <span className="sr-cn">{m.name}</span>
            </Link>
          ))}
          {room.bangboo && (
            <span className="sr-boo" title={`${room.bangboo.name} (Bangboo)`}>
              <DeckImg src={`/assets/bangboo/${room.bangboo.slug}.webp`} alt={room.bangboo.name} className="sr-bimg" />
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
