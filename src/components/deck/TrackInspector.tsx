"use client";

// The "track listing" — the selected disc's editable detail (ports renderTrack).
// Every control mutates the agent through the callbacks (which re-grade + schedule a
// Supabase save): set-swap dropdown, main-stat dropdown (slots 4–6), per-substat stat
// dropdown, and −/+ roll steppers. Slots 1–3 have fixed mains, shown read-only.
import type { DiscPiece } from "@/lib/types";
import type { GradedDisc } from "@/lib/grading";
import { SET_CHOICES, SUBSTATS, MAINS, MAX_CONTRIB, setMeta } from "@/lib/deck-config";
import { Segs } from "./Segs";

export function TrackInspector({
  disc,
  piece,
  onSetSet,
  onSetMain,
  onSetSub,
  onStepRoll,
}: {
  disc: GradedDisc;
  piece: DiscPiece;
  onSetSet: (slot: number, set: string) => void;
  onSetMain: (slot: number, stat: string) => void;
  onSetSub: (slot: number, index: number, stat: string) => void;
  onStepRoll: (slot: number, index: number, delta: number) => void;
}) {
  const slot = disc.slot;
  const m = setMeta(piece.set);
  const editableMain = slot >= 4;

  return (
    <div className="track" id="track">
      <div className="th">
        <div className="sn" style={{ ["--dc" as string]: m.color }}>{slot}</div>
        <div className="nm">
          <select
            className="ed setSel"
            value={piece.set}
            onChange={(e) => onSetSet(slot, e.target.value)}
          >
            {SET_CHOICES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <small>SLOT {slot} · MAIN</small>
        </div>
        <div className="gr">
          <b style={{ color: disc.color }}>{disc.letter}</b>
          <small>{disc.pct}%</small>
        </div>
      </div>

      <div className="body">
        <div className="mainstat">
          <span className="l">Main</span>
          <span className="v">
            {editableMain ? (
              <select
                className="ed mainSel"
                value={piece.main.stat}
                onChange={(e) => onSetMain(slot, e.target.value)}
              >
                {(MAINS[slot] ?? []).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            ) : (
              <>
                {piece.main.stat} <b style={{ color: "var(--amber)" }}>{piece.main.value}</b>
              </>
            )}
          </span>
        </div>

        <div className="eqsub">
          {disc.subs.map((s, i) => {
            const cls = s.dead ? "dead" : s.weight >= 3 ? "hot" : s.weight >= 2 ? "good" : "";
            const fill = Math.min(100, (s.contrib / MAX_CONTRIB) * 100);
            return (
              <div className={`row ${cls}`} key={i}>
                <select
                  className="ed subSel"
                  value={s.stat}
                  onChange={(e) => onSetSub(slot, i, e.target.value)}
                >
                  {SUBSTATS.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
                <span className="sl"><i style={{ width: `${fill}%` }} /></span>
                <span className="roll">
                  <button className="stp" onClick={() => onStepRoll(slot, i, -1)}>−</button>
                  <b>{s.rolls}</b>
                  <button className="stp" onClick={() => onStepRoll(slot, i, 1)}>+</button>
                </span>
              </div>
            );
          })}
        </div>

        <div className="score">
          <span className="segs"><Segs pct={disc.pct} /></span>
          <span className="pc">{disc.pct}</span>
        </div>
        <div className="edhint">
          ▸ edit <b>set</b> · <b>main</b> · <b>substat</b> · <b>rolls</b> — grade moves live
        </div>
      </div>
    </div>
  );
}
