// The "Levels" VU-meter panel — Sheet vs Effective per stat (ports renderLevels/vuRow).
// Lit segments = Sheet; hollow "ghost" segments extend to Effective (combat-only buffs);
// a notch marks the target. Below: combat-buff chips (DMG%/buildup that never touch the
// sheet) + the dead-stat row.
import type { StatLine, StatsResult } from "@/lib/grading";
import { LEVEL_CFG, LEVEL_ORDER, type LevelCfg } from "@/lib/deck-config";

const fmt = (n: number) => Number(n).toLocaleString("en-US");

function VuRow({ label, s, c }: { label: string; s: StatLine; c: LevelCfg }) {
  const N = 20;
  const sp = Math.min(100, (s.sheet / c.full) * 100);
  const ep = Math.min(100, (s.effective / c.full) * 100);
  const tp = Math.min(100, (c.target / c.full) * 100);
  const sheetOn = Math.round((N * sp) / 100);
  const effOn = Math.round((N * ep) / 100);
  const srcs = [...new Set(s.sources.map((m) => m.src))].join(", ");

  return (
    <div className="vu">
      <div className="vr">
        <span className="l">{label}</span>
        <span className="v">
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
            const z = i / N;
            if (z > 0.8) cls += " red";
            else if (z > 0.6) cls += " amber";
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
        <span className="tg">TGT {fmt(c.target)}+</span>
      </div>
    </div>
  );
}

export function Levels({ stats }: { stats: StatsResult }) {
  return (
    <div className="levels">
      {LEVEL_ORDER.filter((k) => stats.stats[k] && LEVEL_CFG[k]).map((k) => (
        <VuRow key={k} label={k} s={stats.stats[k]} c={LEVEL_CFG[k]} />
      ))}

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
      <div className="deadrow">
        <span>CRIT Rate / DMG</span>
        <b>Silent — Anomaly scaling</b>
      </div>
    </div>
  );
}
