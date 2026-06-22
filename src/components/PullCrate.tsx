"use client";

import { useState, type CSSProperties } from "react";
import type { PullRec } from "@/lib/pull-priority";
import { elementColor, elementIcon, typeIcon, iconPath } from "@/lib/deck-config";
import { DeckImg } from "@/components/deck/DeckImg";

// A "wishlist crate" — one pull-priority pick as a flippable record sleeve. Front face is the
// cover art (emote sticker + rank + name + element/type + a 5-bar VU priority meter); flipping it
// (hover on desktop, tap on touch) reveals the liner notes (the why + the teams she'd run).
// Element-accented via --ec; tier drives the meter fill + heat color (see globals.css .crate).
export function PullCrate({ rec }: { rec: PullRec }) {
  const [flipped, setFlipped] = useState(false);
  const style = { "--ec": elementColor(rec.attribute) } as CSSProperties;

  // Touch devices have no hover → tap flips. On hover-capable devices CSS handles the flip on
  // hover/focus, so we leave `flipped` untouched there (avoids a hover+state double-rotation).
  const toggle = () => {
    if (typeof window !== "undefined" && !window.matchMedia("(hover: hover)").matches) {
      setFlipped((f) => !f);
    }
  };

  return (
    <div
      className={`crate${flipped ? " flipped" : ""}${rec.upcoming ? " soon" : ""}`}
      data-tier={rec.tier}
      style={style}
      tabIndex={0}
      onClick={toggle}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setFlipped((f) => !f);
        }
      }}
      aria-label={`${rec.name} — ${rec.priority} pull priority`}
    >
      <div className="ci">
        {/* ---- FRONT: cover art ---- */}
        <div className="cf front">
          <div className="crate-top">
            <span className="rank">#{rec.rank}</span>
            <span className="meter" aria-label={`signal ${rec.tier} of 5`}>
              {Array.from({ length: 5 }).map((_, i) => (
                <i key={i} className={i < rec.tier ? "on" : undefined} />
              ))}
            </span>
          </div>

          <div className="cover">
            {rec.upcoming && <span className="soon-tag">◷ Upcoming</span>}
            <span className="halo" />
            <span className={`stickers${rec.emotes.length > 1 ? " duo" : ""}`}>
              {rec.emotes.map((slug) => (
                <DeckImg key={slug} className="emote" src={`/assets/emotes/${slug}.webp`} alt={rec.name} />
              ))}
            </span>
          </div>

          <div className="crate-id">
            <div className="cn">{rec.name}</div>
            <div className="cm">
              <DeckImg src={iconPath(typeIcon(rec.section.split(" ")[0]))} alt="" className="ci-ico" />
              <span>{rec.section}</span>
              <em>·</em>
              <DeckImg src={iconPath(elementIcon(rec.attribute))} alt="" className="ci-ico" />
              <span>{rec.attribute}</span>
            </div>
          </div>

          <div className="prio">{rec.priority}</div>
          {rec.upcoming && (
            <div className="eta">
              {rec.eta}
              {rec.leak && <span className="leak">leak</span>}
            </div>
          )}
        </div>

        {/* ---- BACK: liner notes ---- */}
        <div className="cf back">
          <div className="back-head">
            <span className="rank">#{rec.rank}</span>
            <span className="bn">{rec.name}</span>
          </div>
          <p className="why">{rec.why}</p>
          <div className="team">
            <span className="tk">Runs in</span>
            {rec.team}
          </div>
        </div>
      </div>
    </div>
  );
}
