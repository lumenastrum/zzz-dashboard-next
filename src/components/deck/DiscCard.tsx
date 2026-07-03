"use client";

// One disc of the 6-Disc Audit — a full editable "track" card. All six render at once in
// the audit grid (replacing the old click-to-inspect single panel) so the whole loadout
// reads at a single glance; every control still mutates through the same callbacks
// (re-grade + debounced Supabase save): set-swap dropdown, main-stat dropdown (slots 4–6,
// fixed mains on 1–3 shown read-only), per-substat stat dropdown, and −/+ roll steppers.
import type { DiscPiece } from "@/lib/types";
import type { GradedDisc } from "@/lib/grading";
import { SET_CHOICES, SUBSTATS, MAINS, MAX_CONTRIB, setMeta, setIcon, iconPath } from "@/lib/deck-config";
import { DeckImg } from "./DeckImg";
import { Segs } from "./Segs";

export function DiscCard({
  disc,
  piece,
  sel,
  onSetSet,
  onSetMain,
  onSetSub,
  onStepRoll,
}: {
  disc: GradedDisc;
  piece: DiscPiece;
  /** transient spotlight from a cone click — flashes the card's set-color ring */
  sel: boolean;
  onSetSet: (slot: number, set: string) => void;
  onSetMain: (slot: number, stat: string) => void;
  onSetSub: (slot: number, index: number, stat: string) => void;
  onStepRoll: (slot: number, index: number, delta: number) => void;
}) {
  const slot = disc.slot;
  const m = setMeta(piece.set);
  const editableMain = slot >= 4;
  // the grader knows when a 4–6 main is off the agent's profile — surface it
  const offProfile = editableMain && !disc.mainStatOk;

  return (
    <div
      className={`dcard${sel ? " sel" : ""}`}
      id={`disc-card-${slot}`}
      style={{ ["--dc" as string]: m.color, ["--gc" as string]: disc.color }}
    >
      <div className="dhead">
        <span className="dslot">{slot}</span>
        <DeckImg className="dset-ico" src={iconPath(setIcon(piece.set))} alt="" />
        <div className="dset">
          <select
            className="ed setSel"
            value={piece.set}
            onChange={(e) => onSetSet(slot, e.target.value)}
          >
            {SET_CHOICES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <small>Partition {slot}</small>
        </div>
        <div className="dgr">
          <b>{disc.letter}</b>
          <small>{disc.pct}%</small>
        </div>
      </div>

      <div className={`dmain${offProfile ? " off" : ""}`}>
        <span className="l">Main</span>
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
          <span className="mn">{piece.main.stat}</span>
        )}
        {offProfile ? (
          <span className="offtag" title="This main stat isn't on the agent's graded profile">off-profile</span>
        ) : (
          // fixed slots (1–3) show the seeded value; editable mains would desync it on swap
          !editableMain && <span className="mv">{piece.main.value}</span>
        )}
      </div>

      <div className="dsubs">
        {disc.subs.map((s, i) => {
          const cls = s.dead ? "dead" : s.weight >= 3 ? "hot" : s.weight >= 2 ? "good" : "";
          const fill = Math.min(100, (s.contrib / MAX_CONTRIB) * 100);
          return (
            <div className={`drow ${cls}`} key={i}>
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
                <button className="stp" aria-label={`${s.stat} remove roll`} onClick={() => onStepRoll(slot, i, -1)}>−</button>
                {/* in-game UPGRADE count: data stores rolls as base(1)+upgrades → display rolls-1 */}
                <b>+{s.rolls - 1}</b>
                <button className="stp" aria-label={`${s.stat} add roll`} onClick={() => onStepRoll(slot, i, 1)}>+</button>
              </span>
            </div>
          );
        })}
      </div>

      <div className="dscore">
        <span className="segs"><Segs pct={disc.pct} /></span>
        <span className="pc">{disc.pct}</span>
      </div>
    </div>
  );
}
