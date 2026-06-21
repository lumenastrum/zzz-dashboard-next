// Footer — active set pills (with 2pc/4pc effect blurbs) + the master gauge
// (conic build %/letter) and the live verdict (set warning · off-meta main · re-roll
// target). Ports renderFoot.
import type { BuildGrade } from "@/lib/grading";
import { GRADING_CONFIG } from "@/lib/grading";
import { setMeta, iconPath } from "@/lib/deck-config";
import { DeckImg } from "./DeckImg";

type EffectDef = { label: string };
const SET_EFFECTS =
  (GRADING_CONFIG as { setEffects?: Record<string, { "2pc"?: EffectDef[]; "4pc"?: EffectDef[] }> })
    .setEffects ?? {};

export function DeckFoot({ grade }: { grade: BuildGrade }) {
  const reroll = grade.suggestions.find((x) => x.type === "reroll");
  const setWarn = grade.suggestions.find((x) => x.type === "set");
  const mainWarn = grade.suggestions.find((x) => x.type === "main");
  const capWarn = grade.suggestions.find((x) => x.type === "cap");

  const verdict: React.ReactNode[] = [];
  if (capWarn)
    verdict.push(
      <b style={{ color: "#ffd84a" }} key="c" title={capWarn.msg}>CRIT capped → CDMG</b>,
    );
  if (setWarn) verdict.push(<b style={{ color: "var(--red)" }} key="s">{grade.sets.note}</b>);
  if (mainWarn)
    verdict.push(<b style={{ color: "var(--red)" }} key="m">Slot {mainWarn.slot} main off-meta</b>);
  if (reroll)
    verdict.push(
      <span key="r">
        re-cut <b>Slot {reroll.slot}</b> ({grade.discs.find((d) => d.slot === reroll.slot)?.letter})
      </span>,
    );

  const bl = grade.buildLetter;

  return (
    <div className="foot" id="foot">
      {grade.sets.active.map((s) => {
        const m = setMeta(s.set);
        const defs = SET_EFFECTS[s.set] ?? {};
        const fxList = s.pc === 4 ? [...(defs["2pc"] ?? []), ...(defs["4pc"] ?? [])] : defs["2pc"] ?? [];
        const fx = fxList.map((e) => e.label).join(" · ");
        return (
          <div className="setp" key={s.set}>
            <DeckImg src={iconPath(m.icon)} alt={s.set} />
            <div className="n">
              {s.set}
              <small>{(m.blurb || "").toUpperCase()}</small>
              <span className="fx">{fx}</span>
            </div>
            <div className={`pc ${s.pc === 4 ? "f" : "p"}`}>{s.pc}PC</div>
          </div>
        );
      })}

      <div className="master">
        <div
          className="gauge"
          style={{
            background: `conic-gradient(${grade.buildColor} 0 ${grade.buildPct}%, #241d2c ${grade.buildPct}% 100%)`,
          }}
        >
          <b style={{ color: grade.buildColor, fontSize: bl.length > 2 ? 15 : 20 }}>{bl}</b>
        </div>
        <div className="mt">
          Master <b>{grade.buildPct}%</b>
          {verdict.length > 0 && " · "}
          {verdict.map((p, i) => (
            <span key={i}>
              {i > 0 && " · "}
              {p}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
