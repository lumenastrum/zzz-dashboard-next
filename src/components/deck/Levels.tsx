// The "Levels" VU-meter panel — Sheet vs Effective per stat (ports renderLevels/vuRow).
// Lit segments = Sheet; hollow "ghost" segments extend to Effective (combat-only buffs);
// a notch marks the target. Targets are per-agent (levelCfgFor) — a stat with a `cap` (per-agent
// CRIT Rate) scales the bar to the cap, goes gold + "MAX" once reached, and suppresses the generic
// amber/red high-fill tint (for a capped stat, hitting the top is the GOAL, not a warning).
// Below: combat-buff chips (DMG%/buildup that never touch the sheet) + the dead-stat row.
import type { StatLine, StatsResult } from "@/lib/grading";
import { levelCfgFor, type LevelCfg } from "@/lib/deck-config";

const fmt = (n: number) => Number(n).toLocaleString("en-US");

function VuRow({ label, s, c }: { label: string; s: StatLine; c: LevelCfg }) {
  const N = 20;
  const isCap = c.cap != null;
  const scaleMax = c.cap ?? c.full;      // cap stats fill to the cap, not the (higher) full
  const sp = Math.min(100, (s.sheet / scaleMax) * 100);
  const ep = Math.min(100, (s.effective / scaleMax) * 100);
  const tp = Math.min(100, (c.target / scaleMax) * 100);
  const sheetOn = Math.round((N * sp) / 100);
  const effOn = Math.round((N * ep) / 100);
  const capped = isCap && s.sheet >= (c.cap as number);
  const srcs = [...new Set(s.sources.map((m) => m.src))].join(", ");

  return (
    <div className="vu">
      <div className="vr">
        <span className="l">{label}</span>
        <span className="v">
          {capped && <span className="capmax">MAX</span>}
          {s.combat > 0 ? (
            <>
              <span className="sheet">{fmt(s.sheet)}{c.unit}</span>
              <span className="arr">→</span>
              <span className="eff">{fmt(s.effective)}{c.unit}</span>
            </>
          ) : (
            <>{fmt(s.sheet)}{c.unit}</>
          )}
        </span>
      </div>
      <div className="segs">
        {Array.from({ length: N }).map((_, i) => {
          let cls = "";
          if (i < sheetOn) {
            cls = "on";
            if (capped) cls += " capped";
            else if (!isCap) {
              const z = i / N;
              if (z > 0.8) cls += " red";
              else if (z > 0.6) cls += " amber";
            }
          } else if (i < effOn) {
            cls = "ghost";
          }
          return <i key={i} className={cls} />;
        })}
        <span className="notch" style={{ left: `${tp}%` }} />
      </div>
      <div className="vsrc">
        {s.combat > 0 ? (
          <span className="cmb">+{s.combat} {label} · {srcs} (combat)</span>
        ) : (
          <span />
        )}
        <span className="tg">
          {isCap ? (
            <>TGT {fmt(c.target)}{c.unit} · <span className="cap">CAP {fmt(c.cap as number)}{c.unit}</span></>
          ) : (
            <>TGT {fmt(c.target)}{c.unit}+</>
          )}
        </span>
      </div>
    </div>
  );
}

export function Levels({ stats, agentName }: { stats: StatsResult; agentName?: string }) {
  return (
    <div className="levels">
      {/* the agent's relevant stats (seed order); each goalposted via per-agent levelCfgFor */}
      {Object.keys(stats.stats).map((k) => {
        const c = levelCfgFor(agentName, k);
        return c ? <VuRow key={k} label={k} s={stats.stats[k]} c={c} /> : null;
      })}

      {stats.buffs.length > 0 && (
        <div className="buffs">
          {stats.buffs.map((b, i) => (
            <span className={`bf ${b.kind === "dmg" ? "dmg" : ""}`} key={i}>
              <b>{b.label}</b>
              <span className="src">{b.src}</span>
            </span>
          ))}
        </div>
      )}

      <div className="modnote">
        ▸ sheet = character screen · effective = in-combat (chips never show on the sheet)
      </div>
    </div>
  );
}
