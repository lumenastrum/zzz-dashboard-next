"use client";

import { useState } from "react";
import type { RecentBench } from "@/lib/setlists";
import { DeckImg } from "@/components/deck/DeckImg";

// The Recent Benchmarks sidebar — last ~5 top scores for a shell, toggled between Shiyu Defense
// and Deadly Assault. The toggle is the in-game pill switch (knob left = Shiyu, knob right = DA);
// the knob image swaps to point at the active mode. Element-accented via the inherited --ec.
type Mode = "shiyu" | "da";
const fmt = (n: number) => n.toLocaleString("en-US");
const LABEL: Record<Mode, string> = { shiyu: "Shiyu", da: "Deadly Assault" };

export function RecentBenchmarks({ recent }: { recent?: RecentBench }) {
  const [mode, setMode] = useState<Mode>("shiyu");
  const runs = (mode === "shiyu" ? recent?.shiyu : recent?.deadlyAssault) ?? [];

  return (
    <aside className="set-recent">
      <div className="rb-head">Recent Benchmarks</div>

      <button
        type="button"
        className="rb-switch"
        onClick={() => setMode((m) => (m === "shiyu" ? "da" : "shiyu"))}
        aria-label={`Showing ${LABEL[mode]} scores — tap to switch`}
      >
        <span className={`rb-mode${mode === "shiyu" ? " on" : ""}`}>Shiyu</span>
        <DeckImg className="rb-knob" src={`/assets/ui/switch-${mode === "shiyu" ? "shiyu" : "da"}.webp`} alt="" />
        <span className={`rb-mode${mode === "da" ? " on" : ""}`}>Deadly Assault</span>
      </button>

      {runs.length ? (
        <ol className="rb-list">
          {runs.slice(0, 5).map((r, i) => (
            <li key={i} className="rb-row">
              <span className="rb-rank">{i + 1}</span>
              <span className="rb-score">{fmt(r.score)}</span>
              <span className="rb-ctx">
                {r.where}
                {r.date ? <em> · {r.date}</em> : null}
              </span>
            </li>
          ))}
        </ol>
      ) : (
        <div className="rb-empty">No {LABEL[mode]} runs logged yet</div>
      )}
    </aside>
  );
}
