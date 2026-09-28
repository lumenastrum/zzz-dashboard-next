"use client";
import type { CSSProperties } from "react";
import { useAssets } from "../context";
import type { Agent, BuildDetail, SceneEditor } from "../data/types";
import { ELEMENT_COLORS, GRADES } from "../tokens";
import { ChaptersPanel, ScenesPanel, SpecsPanel } from "./panels";
import { Chip, Halftone, RewindGlyph } from "./primitives";
import { SwitcherStrip } from "./SwitcherStrip";

export type JacketTab = 0 | 1 | 2;
const TABS = ["SPECS", "SCENES", "CHAPTERS"] as const;

function stripFor(title: string) {
  if (title.startsWith("Void Hunter")) return "film-strip-voidhunter" as const;
  if (title === "Grandmaster") return "film-strip-grandmaster" as const;
  return "film-strip-standard" as const;
}

/** Box front: film-reel spine, key art on a halftone element panel, Cinema badge, medal, title block, rating box. */
export function JacketCover({ agent: a, detail }: { agent: Agent; detail?: BuildDetail }) {
  const assets = useAssets();
  const medal = a.grade ? GRADES[a.grade].medal : null;
  return (
    <div className="rp-cover">
      <div className="rp-cover__strip" style={{ backgroundImage: `url(${assets.ui(stripFor(a.title))})` }} aria-hidden="true" />
      <div className="rp-cover__band"><span>RANDOM PLAY ORIGINAL</span><img src={assets.ui("zzz-mark")} alt="ZZZ" /></div>
      <div className="rp-cover__art" style={{ backgroundColor: ELEMENT_COLORS[a.attribute] }}>
        <Halftone />
        {/* key forces a remount → the swap keyframe replays whenever the agent changes */}
        <img key={a.slug} className="rp-cover__img" src={assets.cover(a.slug)} alt={`${a.name} key art`} />
        <div className="rp-cover__cinema"><small>CINEMA</small><b>{a.mindscape}/6</b></div>
        {medal && <img className="rp-cover__medal" src={assets.ui(`medal-${medal}`)} alt={`${medal} tier — build grade ${a.grade}`} />}
      </div>
      <div className="rp-cover__title">
        <div className="rp-rating">
          <div className="rp-rating__label">RATED</div>
          <div className="rp-rating__row"><span className="rp-rating__grade">{a.grade ?? "–"}</span><span className="rp-rating__pct">{a.grade ? `BUILD ${a.pct}%` : "NOT RATED"}</span></div>
          <div className="rp-rating__line">{detail?.ratingLine ?? a.suggestion ?? "No build imported yet"}</div>
        </div>
        <div className="rp-cover__pres">A RANDOM PLAY PRESENTATION</div>
        <div className="rp-cover__name" style={{ fontSize: a.name.length > 12 ? 60 : 74 }}>{a.name}</div>
        <div className="rp-cover__tagline">{a.title || a.faction}</div>
        <div className="rp-cover__faction"><img src={assets.crest(a.faction)} alt="" />{a.faction.toUpperCase()}</div>
      </div>
    </div>
  );
}

export interface TapeJacketProps {
  agents: Agent[];
  agent: Agent;
  detail?: BuildDetail;
  tab: JacketTab;
  onTab: (t: JacketTab) => void;
  onPick: (slug: string) => void;
  onRewind: () => void;
  open: boolean;
  /** Live disc editing for this tape's Scenes (see `SceneEditor`). Absent = read-only. */
  editor?: SceneEditor;
}

export function TapeJacket({ agents, agent: a, detail, tab, onTab, onPick, onRewind, open, editor }: TapeJacketProps) {
  const assets = useAssets();
  const panelCls = (i: number) => `rp-panel${i === tab ? " is-on" : i < tab ? " is-prev" : ""}`;
  return (
    <section className={`rp-view rp-jacket${open ? " is-in" : ""}`} aria-label={`${a.name} build`} aria-hidden={!open}>
      <JacketCover agent={a} detail={detail} />
      <div className="rp-back rp-paperstock">
        <div className="rp-back__row">
          <button className="rp-rewind" onClick={onRewind}><RewindGlyph />BE KIND, REWIND</button>
          <SwitcherStrip agents={agents} current={a.slug} onPick={onPick} />
        </div>
        <div key={a.slug} className="rp-back__swap">
          <div className="rp-back__chips">
            <Chip icon={assets.element(a.attribute)}>{a.attribute.toUpperCase()}</Chip>
            <Chip icon={assets.specialty(a.section)}>{a.section.toUpperCase()}</Chip>
            <Chip plain>LV. 60</Chip>
            <Chip plain>{a.engine ? `${a.engine.name.toUpperCase()} · ${a.engine.refine}` : "NO W-ENGINE ON FILE"}</Chip>
          </div>
          <div className="rp-tabs" role="tablist">
            {TABS.map((t, i) => (
              <button key={t} role="tab" aria-selected={i === tab} className={`rp-tab${i === tab ? " is-on" : ""}`} onClick={() => onTab(i as JacketTab)}>
                <span className="rp-tab__no">0{i + 1}</span><span className="rp-tab__label">{t}</span>
              </button>
            ))}
            <div className="rp-tabs__ink" style={{ "--rp-tab": tab } as CSSProperties} />
          </div>
          <div className="rp-stage">
            <div className={panelCls(0)} role="tabpanel"><SpecsPanel agent={a} detail={detail} /></div>
            <div className={panelCls(1)} role="tabpanel"><ScenesPanel agent={a} detail={detail} editor={editor} /></div>
            <div className={panelCls(2)} role="tabpanel"><ChaptersPanel agent={a} detail={detail} /></div>
          </div>
        </div>
      </div>
    </section>
  );
}
