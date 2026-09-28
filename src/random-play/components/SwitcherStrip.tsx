"use client";
import type { CSSProperties } from "react";
import { useAssets } from "../context";
import type { Agent } from "../data/types";
import { Chevron } from "./primitives";

const VISIBLE = 5;
// 100px per slot (rectangles are ~118px wide at 42px tall, so neighbours interlock): the step lives in CSS
// (--rp-rect-step) so the mobile layout can show one slot instead of five.

export interface SwitcherStripProps {
  agents: Agent[];
  current: string;
  onPick: (slug: string) => void;
}

/** The game's own agent strip (IconRoleGeneral rectangles) as a 5-up carousel that keeps the
 *  current tape centred and clamps at the ends instead of showing empty slots. */
export function SwitcherStrip({ agents, current, onPick }: SwitcherStripProps) {
  const assets = useAssets();
  const idx = Math.max(0, agents.findIndex((a) => a.slug === current));
  const start = Math.max(0, Math.min(idx - 2, agents.length - VISIBLE));
  const prev = agents[(idx - 1 + agents.length) % agents.length];
  const next = agents[(idx + 1) % agents.length];
  return (
    <div className="rp-switcher" role="group" aria-label="Switch tape">
      <button className="rp-switcher__arrow" onClick={() => onPick(prev.slug)} aria-label={`Previous tape: ${prev.name}`}><Chevron dir="left" /></button>
      <div className="rp-switcher__view">
        <div className="rp-switcher__track" style={{ "--rp-start": start, "--rp-idx": idx } as CSSProperties}>
          {agents.map((a, i) => (
            <button key={a.slug} className={`rp-switcher__item${i === idx ? " is-on" : ""}`} aria-label={a.name} aria-current={i === idx}
              onClick={() => i !== idx && onPick(a.slug)}>
              <img src={assets.rect(a.slug)} alt="" />
            </button>
          ))}
        </div>
      </div>
      <button className="rp-switcher__arrow" onClick={() => onPick(next.slug)} aria-label={`Next tape: ${next.name}`}><Chevron dir="right" /></button>
    </div>
  );
}
