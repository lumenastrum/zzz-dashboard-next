import Link from "next/link";
import type { CSSProperties } from "react";
import type { AssaultRoom } from "@/lib/assault";
import { ASSAULT_TARGETS } from "@/lib/assault";
import { elementColor, elementIcon, iconPath } from "@/lib/deck-config";
import { profileHref } from "@/lib/profile";
import { DeckImg } from "@/components/deck/DeckImg";
import { VuBar, litSegs } from "@/components/ShiyuRoomCard";
import { AssaultPips } from "@/components/AssaultSeason";

// One Deadly Assault target — a boss poster in the Shiyu marquee language (full-body render
// bottom-anchored on the right, left content column), with the mode's own fingerprints: the
// in-game frame's vertical DEADLY ASSAULT rail down the left edge, a giant outlined target
// number instead of a rating letter (DA doesn't grade — it counts pips), the 6k/14k/20k
// challenge-goal ladder, and a Damage + Performance score split (performance caps at 5,000).
// Element-accented (--ec) by the first recommended attribute.
const fmt = (n: number) => n.toLocaleString("en-US");
const PERF_MAX = 5000; // performance points cap per room — a maxed bar reads as "can't go higher"

export function AssaultRoomCard({ room, base = "" }: { room: AssaultRoom; base?: string }) {
  const accent = room.recommended[0] ?? "Ether";
  const style = { "--ec": elementColor(accent) } as CSSProperties;
  const perfMaxed = room.scores.performance >= PERF_MAX;
  const targets = room.targets ?? ASSAULT_TARGETS;

  return (
    <article id={`da-room-${room.room}`} className="shiyu-room da-room" style={style}>
      <i className="sr-hz" aria-hidden />
      <span className="da-rail" aria-hidden>
        Deadly Assault
      </span>
      <span className="sr-wm da-no-wm" aria-hidden>{`0${room.room}`}</span>
      <DeckImg className="sr-render" src={`/assets/enemies/${room.boss.slug}.webp`} alt={room.boss.name} />
      <div className="sr-boss-tag">
        <span className="sr-lv">LV {room.boss.level}</span>
        <span className="sr-bn">{room.boss.name}</span>
        {room.boss.tag && <span className="sr-tag">{room.boss.tag}</span>}
      </div>

      <div className="sr-in da-in">
        <header className="sr-head">
          <span className="sr-no">Target {room.room}</span>
          {room.timeLimit && (
            <span className="sr-time" title="time limit">
              ◷ {room.timeLimit}
            </span>
          )}
          <span className="da-head-pips">
            <AssaultPips earned={room.pips} max={3} size={24} />
          </span>
        </header>

        <div className="sr-total">
          <span className="sr-k">Total Score</span>
          <b>{fmt(room.scores.total)}</b>
        </div>

        <div className="sr-vu">
          <VuBar label="Damage" value={room.scores.damage} lit={litSegs(room.scores.damage, room.scores.total)} />
          <VuBar
            label="Performance"
            value={room.scores.performance}
            lit={litSegs(room.scores.performance, PERF_MAX)}
            maxed={perfMaxed}
          />
        </div>

        {/* challenge-goal ladder: one chip per threshold, lit in pip order */}
        <div className="da-goals">
          {targets.map((t, i) => (
            <span key={t} className={`da-goal${i < room.pips ? " hit" : ""}`}>
              <DeckImg src="/assets/ui/da-pip.webp" alt="" className={`da-pip${i < room.pips ? " on" : ""}`} />
              {fmt(t)}
            </span>
          ))}
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
              {room.specialty && <span className="sr-chip anom">{room.specialty}</span>}
            </span>
          </div>
          <div className="sr-attr">
            <span className="sr-al">Resistance</span>
            <span className="sr-chips">
              {room.resistance.length ? (
                room.resistance.map((a) => (
                  <span key={a} className="sr-chip res">
                    <DeckImg src={iconPath(elementIcon(a))} alt={a} className="sr-ai" />
                    {a}
                  </span>
                ))
              ) : (
                <span className="sr-chip none">None</span>
              )}
            </span>
          </div>
        </div>

        {room.gimmick && <p className="da-gimmick">{room.gimmick}</p>}

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
