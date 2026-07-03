"use client";

// The "Stack" — the real in-game equipment frame (equip_frame.webp) with the six disc
// cones seated on it (each a click-to-select grade meter) and the W-Engine core in the
// center recess. Ports renderCones + the static .wcore markup.
import type { Agent } from "@/lib/types";
import type { BuildGrade } from "@/lib/grading";
import { CONE, setMeta, setIcon, wengineIcon, iconPath, segCount } from "@/lib/deck-config";
import { DeckImg } from "./DeckImg";

export function EquipStack({
  agent,
  grade,
  selSlot,
  onSelect,
}: {
  agent: Agent;
  grade: BuildGrade;
  /** transient spotlight slot (null = nothing pulsed) — mirrors the audit card flash */
  selSlot: number | null;
  onSelect: (slot: number) => void;
}) {
  const pieces = agent.discs?.pieces ?? [];
  const we = agent.wengine;

  return (
    <div className="equip" id="equip">
      {/* The frame is an <img> (not a CSS background) so withBase() prefixes it for
          GH Pages — CSS url() to /public doesn't get the prod basePath. */}
      <DeckImg className="equip-frame" src={iconPath("equip_frame")} alt="" />
      <div className="wcore">
        {we && <DeckImg src={iconPath(wengineIcon(we.name))} alt={we.name} />}
        <div className="lvl">
          <DeckImg src={iconPath("coin_S")} alt="" />
          <span>Lv. {agent.level ?? 60}/60</span>
        </div>
      </div>

      {grade.discs.map((d) => {
        const piece = pieces.find((p) => p.slot === d.slot);
        const m = setMeta(piece?.set);
        const [x, y] = CONE[d.slot] ?? [50, 50];
        const onN = segCount(d.pct, 5);
        return (
          <div
            key={d.slot}
            className={`cone${d.slot === selSlot ? " sel" : ""}`}
            style={{
              left: `${x}%`,
              top: `${y}%`,
              ["--dc" as string]: m.color,
              ["--gc" as string]: d.color,
            }}
            onClick={() => onSelect(d.slot)}
          >
            <div className="disc">
              {piece && <DeckImg src={iconPath(setIcon(piece.set))} alt={piece.set} />}
            </div>
            <div className="gvu">
              {Array.from({ length: 5 }).map((_, i) => (
                <i key={i} className={i < onN ? "on" : ""} />
              ))}
            </div>
            <div className="gletter"><b>{d.letter}</b></div>
          </div>
        );
      })}
    </div>
  );
}
