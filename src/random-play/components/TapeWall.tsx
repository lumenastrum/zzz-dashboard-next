"use client";
import { useAssets } from "../context";
import { HAS_EMOTE } from "../data/meta";
import { SECTIONS, type Agent, type Section } from "../data/types";
import { ELEMENT_COLORS } from "../tokens";
import { GradeSticker, Halftone, PlayGlyph } from "./primitives";

export type GenreFilter = "All" | Section;

export function GenreFilterBar({ agents, value, onChange }: { agents: Agent[]; value: GenreFilter; onChange: (f: GenreFilter) => void }) {
  const opts: GenreFilter[] = ["All", ...SECTIONS];
  return (
    <div className="rp-filters">
      <div className="rp-filters__pills" role="group" aria-label="Filter by specialty">
        {opts.map((f) => (
          <button key={f} className={`rp-pill${f === value ? " is-on" : ""}`} aria-pressed={f === value} onClick={() => onChange(f)}>
            {f.toUpperCase()} <span className="rp-pill__n">{f === "All" ? agents.length : agents.filter((a) => a.section === f).length}</span>
          </button>
        ))}
      </div>
      <div className="rp-legend">
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}><GradeSticker grade="B" small />BUILD RATING</span>
        <span>M# = CINEMA</span>
        <span className="rp-legend__click">CLICK A TAPE · PLAY TO OPEN</span>
        <span className="rp-legend__tap">TAP A TAPE · PLAY TO OPEN</span>
      </div>
    </div>
  );
}

export interface TapeProps {
  agent: Agent;
  open: boolean;
  dim?: boolean;
  /** First click opens the tape on the shelf; clicking an open tape plays it. */
  onSelect: () => void;
  onPlay: () => void;
}

export function Tape({ agent: a, open, dim, onSelect, onPlay }: TapeProps) {
  const assets = useAssets();
  const col = ELEMENT_COLORS[a.attribute];
  return (
    <div className={`rp-tape${open ? " is-open" : ""}${dim ? " is-dim" : ""}`}>
      <div className="rp-tape__band" style={{ background: col }} />
      <div className="rp-tape__art" style={{ backgroundColor: col }}>
        <Halftone />
        <img className="rp-tape__jacket" src={assets.jacket(a.slug)} alt="" />
        <span className="rp-tape__el"><img src={assets.element(a.attribute)} alt={a.attribute} /></span>
        <GradeSticker grade={a.grade} className="rp-tape__grade" />
        {!a.grade && <img className="rp-tape__stamp" src={assets.ui("stamp-empty-character")} alt="Empty character" />}
        {HAS_EMOTE.has(a.slug) && <span className="rp-tape__sticker"><img src={assets.emote(a.slug)} alt="" /></span>}
      </div>
      <div className="rp-tape__spine rp-hatch">
        <span className="rp-disp rp-tape__name">{a.spine}</span>
        <span className="rp-mono rp-tape__ms">M{a.mindscape}</span>
      </div>
      <div className="rp-tape__front">
        <div className="rp-disp rp-tape__fname">{a.name}</div>
        <div className="rp-mono rp-tape__fengine">{a.engine ? `${a.engine.name} · ${a.engine.rank}·${a.engine.refine}` : "No build on file"}</div>
        <div className="rp-mono rp-tape__frow"><span>{a.grade ? `BUILD ${a.pct}%` : "ON ORDER"}</span><span>CINEMA {a.mindscape}/6</span></div>
        <button className="rp-tape__play" onClick={onPlay} tabIndex={open ? 0 : -1}><PlayGlyph size={14} />Play tape</button>
      </div>
      <button className="rp-tape__hit" onClick={open ? onPlay : onSelect} aria-label={`${a.name}, ${a.section}, build ${a.grade ?? "none"}`} />
    </div>
  );
}

/** Two shelves: Anomaly + Attack, then Stun + Support + Rupture (26 tapes fit 1344px with one open). */
const SHELVES: Section[][] = [["Anomaly", "Attack"], ["Stun", "Support", "Rupture"]];

export interface TapeWallProps {
  agents: Agent[];
  selected: string;
  filter: GenreFilter;
  onSelect: (slug: string) => void;
  onPlay: (slug: string) => void;
}

export function TapeWall({ agents, selected, filter, onSelect, onPlay }: TapeWallProps) {
  const assets = useAssets();
  return (
    <div className="rp-shelves">
      {SHELVES.map((row, i) => (
        <div key={i} className="rp-shelf">
          <div className="rp-shelf__row">
            {row.map((sec) => {
              const list = agents.filter((a) => a.section === sec);
              return (
                <div key={sec} className="rp-shelf__group">
                  <div className="rp-shelf__label">
                    <img src={assets.specialty(sec)} alt="" />
                    <span className="rp-shelf__genre">{sec}</span>
                    <span className="rp-shelf__count">{list.length} {list.length === 1 ? "TITLE" : "TITLES"}</span>
                  </div>
                  <div className="rp-shelf__tapes">
                    {list.map((a) => (
                      <Tape key={a.slug} agent={a} open={a.slug === selected} dim={filter !== "All" && filter !== a.section}
                        onSelect={() => onSelect(a.slug)} onPlay={() => onPlay(a.slug)} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="rp-shelf__plank" />
        </div>
      ))}
    </div>
  );
}

export function Ticker({ text }: { text: string }) {
  return <div className="rp-ticker" aria-hidden="true"><div className="rp-ticker__run"><span>{text}</span><span>{text}</span></div></div>;
}

export function Clerk({ line = "PLEASE RETURN TAPES BEFORE THE NEXT SHIYU ROTATION!", bangboo = "ultrajet" }: { line?: string; bangboo?: string }) {
  const assets = useAssets();
  return (
    <div className="rp-clerk">
      <div className="rp-clerk__bubble">{line}</div>
      <img src={assets.bangboo(bangboo)} alt="Ultra Jake minding the counter" />
    </div>
  );
}
