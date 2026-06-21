"use client";

// Character-screen main-stat sheet under the cartridge: a 2-column grid (in-game reading order)
// where the agent's scaling stats light up gold. Those same `relevant` stats are what the Levels
// panel goalposts. Data lives on the agent object (andres-zzz blob) — the single source of truth.
import { statIcon, iconPath } from "@/lib/deck-config";
import { DeckImg } from "./DeckImg";

export function MainStats({
  rows,
  relevant,
}: {
  rows?: { stat: string; value: string }[];
  relevant?: string[];
}) {
  if (!rows || rows.length === 0) {
    return (
      <div className="mstats-empty">
        Main stats not entered yet — read off the character screen (or pull from the import).
      </div>
    );
  }
  const rel = new Set(relevant ?? []);
  return (
    <div className="mstats">
      {rows.map((r) => (
        <div key={r.stat} className={`mrow${rel.has(r.stat) ? " rel" : ""}`}>
          <DeckImg className="mi" src={iconPath(statIcon(r.stat))} alt="" />
          <span className="mn">{r.stat}</span>
          <span className="mv">{r.value}</span>
        </div>
      ))}
    </div>
  );
}
