"use client";
import type { CSSProperties } from "react";
import { useAssets } from "../context";
import { HAS_EMOTE } from "../data/meta";
import type { Agent, BuildDetail, Disc, EditStatus, SceneEditor } from "../data/types";
import { ELEMENT_COLORS } from "../tokens";
import { Eyebrow, GradeSticker, PlayGlyph } from "./primitives";

const pctOf = (v: number, lo: number, hi: number) => Math.round(((v - lo) / (hi - lo)) * 1000) / 10;
const delay = (ms: number): CSSProperties => ({ transitionDelay: `${ms}ms` });
// gauge numbers: thousands commas, at most 2 decimals (Energy Regen), float noise trimmed (3.1999… → 3.2)
const fmtNum = (v: number) => (+v.toFixed(2)).toLocaleString("en-US");
// width of a gauge mark label: 10px mono + .04em tracking ≈ 6.6px a character (measured 09/28)
const labelPx = (s: string) => s.length * 6.6;

// ============================================================ 01 SPECS
export function SpecsPanel({ agent: a, detail }: { agent: Agent; detail?: BuildDetail }) {
  const assets = useAssets();
  const sheet = detail?.sheet ?? a.sheet;
  if (!a.grade || !sheet.length) {
    return (
      <div className="rp-placeholder rp-stagger" style={delay(120)}>
        <img className="rp-placeholder__stamp" src={assets.ui("stamp-empty-character")} alt="Empty character" />
        <b>On order</b>No build imported for this agent yet. Identity only — the tape case is on the shelf, the tape isn't.
      </div>
    );
  }
  return (
    <div className="rp-specs">
      <div className="rp-sheet">
        <Eyebrow className="rp-stagger" source={detail?.sheetSource ?? "DASHBOARD BLOB"}>TECHNICAL SPECIFICATIONS</Eyebrow>
        <div className="rp-stagger" style={{ marginTop: 8, ...delay(180) }}>
          {sheet.map((r) => (
            <div key={r.stat} className={`rp-sheet__row${a.scalesOn.includes(r.stat) ? " is-hot" : ""}`}>
              <span className="rp-sheet__stat">{r.stat}</span><span className="rp-sheet__lead" /><span className="rp-sheet__val">{r.value}</span>
            </div>
          ))}
        </div>
        <div className="rp-sheet__foot rp-stagger" style={delay(240)}>HIGHLIGHTED = WHAT {a.name.toUpperCase()} SCALES ON ({a.scalesOn.join(" · ").toUpperCase()})</div>
      </div>
      {/* three gauges + engine + sets overflow the 720px stage at the default rhythm → dense mode (measured 9–35px, 09/28) */}
      <div className={`rp-specs__side${(detail?.goals?.length ?? 0) >= 3 ? " is-dense" : ""}`}>
        {detail?.goals && (
          <>
            <Eyebrow className="rp-stagger" source="GRADING TARGETS">BREAKPOINTS</Eyebrow>
            {detail.goals.map((g) => {
              // the character screen is the paused frame; combat is the tape playing: in-fight-only buffs
              // print as a hatched run past the solid sheet bar, and the chip (same hatch) keys it
              const inFight = g.combat != null && g.combat > g.value ? g.combat : undefined;
              return (
              <div key={g.stat} className="rp-gauge rp-stagger" style={delay(300)}>
                <div className="rp-gauge__top">
                  <span className="rp-gauge__label">{g.stat.toUpperCase()}</span>
                  <span className="rp-gauge__read">
                    {inFight != null && (
                      <span className="rp-gauge__play" title={g.combatFrom ? `In combat, with ${g.combatFrom}` : "In combat"}>
                        <i className="rp-gauge__swatch" aria-hidden="true" /><PlayGlyph size={9} />{fmtNum(inFight)} IN COMBAT
                      </span>
                    )}
                    <span className="rp-gauge__val">{g.value.toLocaleString("en-US")}</span>
                  </span>
                </div>
                <div className="rp-gauge__track">
                  {inFight != null && (
                    <div className="rp-gauge__combat" style={{ left: `${pctOf(g.value, g.min, g.max)}%`, width: `${pctOf(inFight, g.min, g.max) - pctOf(g.value, g.min, g.max)}%` }} />
                  )}
                  <div className="rp-gauge__fill" style={{ width: `${pctOf(g.value, g.min, g.max)}%` }} />
                  <div className="rp-gauge__mark" style={{ left: `${pctOf(g.target, g.min, g.max)}%` }} />
                  <div className="rp-gauge__mark" style={{ left: `${pctOf(g.full, g.min, g.max)}%` }} />
                </div>
                <div className="rp-gauge__marks">
                  {/* the target label ends at its mark (or starts there from the left quarter). On a zero-based
                      scale the target usually sits near the end mark, so when the two labels would meet on the
                      narrowest track (290px, a 320 phone) they merge into one end-anchored line, in mark order */}
                  {g.targetLabel && (100 - pctOf(g.target, g.min, g.max)) * 2.9 < labelPx(g.fullLabel) + 16 ? (
                    <span className="is-end">{g.targetLabel} · {g.fullLabel}</span>
                  ) : (
                    <>
                      <span className={pctOf(g.target, g.min, g.max) < 25 ? "is-after" : "is-before"} style={{ left: `${pctOf(g.target, g.min, g.max)}%` }}>{g.targetLabel}</span>
                      <span className="is-end">{g.fullLabel}</span>
                    </>
                  )}
                </div>
                <div className="rp-note">
                  {g.note}
                  {inFight != null && <> In combat: <b>+{fmtNum(inFight - g.value)}</b>{g.combatFrom ? ` from ${g.combatFrom}` : ""}.</>}
                </div>
              </div>
              );
            })}
          </>
        )}
        <div className="rp-card rp-stagger" style={delay(360)}>
          <img className="rp-card__icon" src={a.engine ? assets.wengine(a.engine.name) : assets.ui("socket-empty")} alt="" />
          <div>
            <div className="rp-card__kicker">W-ENGINE · {a.engine ? `${a.engine.rank}·${a.engine.refine}` : "NONE"}</div>
            <div className="rp-card__name">{a.engine?.name ?? "Not equipped"}</div>
            {detail?.engineBuffs && <ul>{detail.engineBuffs.map((b) => <li key={b}>{b}</li>)}</ul>}
          </div>
        </div>
        <div className="rp-stagger" style={delay(420)}>
          <Eyebrow>DRIVE DISC SETS</Eyebrow>
          {detail?.setBonus ? (
            <div className="rp-sets">
              {detail.setBonus.sets.map((s) => <div key={s.name} className="rp-sets__row"><img src={assets.set(s.name)} alt="" />{s.name} ×{s.pieces}</div>)}
              <div className="rp-note">{detail.setBonus.note}</div>
            </div>
          ) : <div className="rp-note" style={{ marginTop: 8 }}>{a.sets ?? "No sets on file"}</div>}
        </div>
      </div>
    </div>
  );
}

// ============================================================ 02 SCENES (drive discs)
const MAX_ROLLS = 6; // ZZZ PropertyLevel: 1 base + up to 5 upgrades

/** One drive disc. With an `editor`, the set, the main (slots 4–6) and every substat + roll count become
 *  native pickers/steppers: native so phones get their own wheel, styled so they read as Random Play. */
function SceneCard({ disc: d, reroll, index, editor }: { disc: Disc; reroll: boolean; index: number; editor?: SceneEditor }) {
  const assets = useAssets();
  const mains = editor?.mains[d.slot];
  const opts = (list: string[], current: string) => (list.includes(current) ? list : [current, ...list]);
  return (
    <div className={`rp-disc rp-stagger${editor ? " is-edit" : ""}`} style={delay(120 + index * 60)}>
      {reroll && <div className="rp-disc__reroll">RE-ROLL ME</div>}
      <div className="rp-disc__top">
        <span className="rp-disc__scene"><img src={assets.ui(`socket-${d.slot}`)} alt="" />SCENE 0{d.slot}</span>
        <GradeSticker grade={d.grade} small />
      </div>
      <div className="rp-disc__main">
        <img className="rp-disc__set" src={assets.set(d.set)} alt={d.set} />
        <div className="rp-disc__id">
          {editor ? (
            <select className="rp-select rp-select--set" value={d.set} aria-label={`Scene 0${d.slot} set`} onChange={(e) => editor.onSet(d.slot, e.target.value)}>
              {opts(editor.sets, d.set).map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          ) : (
            <div className="rp-disc__setname">{d.set}</div>
          )}
          {editor && mains ? (
            <select className="rp-select rp-select--main" value={d.main.stat} aria-label={`Scene 0${d.slot} main stat`} onChange={(e) => editor.onMain(d.slot, e.target.value)}>
              {opts(mains, d.main.stat).map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          ) : (
            <div className="rp-disc__mainstat">{d.main.stat}</div>
          )}
          <div className="rp-disc__mainval">{d.main.value}</div>
        </div>
      </div>
      <div className="rp-disc__subs">
        {d.subs.map((s, i) => (
          <div key={editor ? i : s.stat} className={`rp-sub${s.relevant ? " is-rel" : ""}${editor ? " is-edit" : ""}`}>
            {editor ? (
              <select className="rp-select rp-select--sub" value={s.stat} aria-label={`Scene 0${d.slot} substat ${i + 1}`} onChange={(e) => editor.onSub(d.slot, i, e.target.value)}>
                {opts(editor.substats, s.stat).map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            ) : (
              <span>{s.stat}</span>
            )}
            <span className="rp-sub__roll">
              {editor && <button type="button" className="rp-sub__step" aria-label={`${s.stat}: remove a roll`} disabled={s.rolls <= 1} onClick={() => editor.onRoll(d.slot, i, -1)}>−</button>}
              <span className="rp-sub__ticks" title={editor ? `+${s.rolls - 1} upgrades` : undefined}>{Array.from({ length: s.rolls }, (_, k) => <i key={k} className={k ? "is-up" : ""} />)}</span>
              {editor && <button type="button" className="rp-sub__step" aria-label={`${s.stat}: add a roll`} disabled={s.rolls >= MAX_ROLLS} onClick={() => editor.onRoll(d.slot, i, 1)}>+</button>}
            </span>
          </div>
        ))}
      </div>
      <div className="rp-disc__pct"><div className="rp-disc__bar"><div style={{ width: `${d.pct}%` }} /></div><span>{d.pct}%</span></div>
    </div>
  );
}

const STATUS_LINE: Record<EditStatus, string> = {
  live: "EDITS SAVE TO THE SHELF",
  saving: "SAVING…",
  locked: "SIGN IN TO SAVE · EDITS STAY ON THIS SCREEN UNTIL THEN",
  local: "LOCAL EDITS ONLY · NOTHING IS SAVED",
  error: "SAVE FAILED · YOUR NEXT EDIT RETRIES",
};

export function ScenesPanel({ agent: a, detail, editor }: { agent: Agent; detail?: BuildDetail; editor?: SceneEditor }) {
  const assets = useAssets();
  if (!detail?.discs) {
    return (
      <div className="rp-placeholder rp-stagger" style={delay(120)}>
        <b>Tape not rewound</b>Disc-by-disc scenes aren't loaded for {a.name}. Set line on file: {a.sets ?? "none"}
        <div className="rp-sockets">
          {[0, 1, 2, 3, 4, 5].map((i) => <img key={i} src={assets.ui("socket-empty")} alt="" style={delay(200 + i * 60)} />)}
        </div>
      </div>
    );
  }
  const weakest = detail.discs.find((d) => d.slot === detail.weakestSlot);
  return (
    <>
      <Eyebrow className="rp-stagger" source={editor ? <span className={`rp-scenes__status is-${editor.status}`} role="status"><i aria-hidden="true" />{STATUS_LINE[editor.status]}</span> : detail.discSource}>SCENE SELECTION · 6 DRIVE DISCS</Eyebrow>
      <div className="rp-discs">{detail.discs.map((d, i) => <SceneCard key={d.slot} disc={d} index={i} reroll={d.slot === detail.weakestSlot} editor={editor} />)}</div>
      {weakest && (
        <div className="rp-note rp-stagger" style={{ marginTop: 18, display: "flex", gap: 10, alignItems: "center", ...delay(480) }}>
          <span className="rp-infobadge" aria-hidden="true">!</span>
          <span>Bold rows are rolls {a.spine} actually uses. Orange ticks = upgrade hits. Weakest disc: <b>Scene 0{weakest.slot}, {weakest.grade} · {weakest.pct}%</b>, the best re-roll target.{editor ? " Every pick re-grades the tape on the spot." : ""}</span>
        </div>
      )}
    </>
  );
}

// ============================================================ 03 CHAPTERS (skills, core, cinema)
export function ChaptersPanel({ agent: a, detail }: { agent: Agent; detail?: BuildDetail }) {
  const assets = useAssets();
  const col = ELEMENT_COLORS[a.attribute];
  return (
    <div className="rp-chapters">
      <div>
        <Eyebrow className="rp-stagger" source={detail?.skillSource ?? "NOT LOGGED"}><span className="rp-chapters__eyebrow">CHAPTER SELECT · SKILLS</span></Eyebrow>
        {detail?.skills ? (
          <div className="rp-skills">
            {detail.skills.map((s, i, all) => {
              const low = s.level < s.max;
              // one sticker per tape: only the lowest skill (the one to rewind first) gets it, and the
              // sleepy emote only rides along for agents who have one (HAS_EMOTE; 11 of 26)
              const rewind = low && s === all.reduce((m, x) => (x.level < m.level ? x : m));
              return (
                <div key={s.name} className="rp-skill rp-stagger" style={delay(180 + i * 60)}>
                  {rewind && <>{HAS_EMOTE.has(a.slug) && <img className="rp-skill__snooze" src={assets.emote(a.slug)} alt="" />}<div className="rp-skill__sticker">BE KIND, REWIND</div></>}
                  <div className="rp-skill__top">
                    <span className="rp-skill__name">{s.name}</span>
                    <span className={`rp-skill__lv${low ? " is-warn" : ""}`}>{String(s.level).padStart(2, "0")}<small>/{s.max}</small></span>
                  </div>
                  <div className="rp-segs">
                    {Array.from({ length: s.max }, (_, k) => (
                      <i key={k} className={k < s.level ? `is-lit${low ? " is-hot" : ""}` : ""} style={delay(250 + i * 70 + k * 35)} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rp-placeholder rp-stagger" style={{ width: 470, ...delay(180) }}><b>Not logged</b>Skill levels aren't in the dashboard data yet.</div>
        )}
      </div>
      <div className="rp-chapters__side">
        {detail?.core && (
          <div className="rp-stagger" style={delay(180)}>
            <Eyebrow source={detail.core.length === 6 ? "A–F · MAXED" : `${detail.core.length} OF 6`}>CORE SKILL</Eyebrow>
            <div className="rp-core">
              {["A", "B", "C", "D", "E", "F"].map((l, i) => (
                <span key={l} className={detail.core!.includes(l) ? "" : "is-dark"} style={delay(300 + i * 60)}>{l}</span>
              ))}
            </div>
          </div>
        )}
        <div className="rp-stagger" style={delay(240)}>
          <Eyebrow source={`${a.mindscape} OF 6 UNLOCKED`}>CINEMA</Eyebrow>
          <div className="rp-reel">
            {[1, 2, 3, 4, 5, 6].map((n) => {
              const lit = n <= a.mindscape;
              return (
                <div key={n} className={`rp-reel__cell${lit ? " is-lit" : ""}`}>
                  <img className="rp-reel__frame" src={assets.ui("film-cell")} alt="" />
                  <div className="rp-reel__win" style={lit ? { background: col } : undefined}>
                    {n}{lit && <img src={assets.circle(a.slug)} alt="" style={delay(350 + (n - 1) * 180)} />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="rp-note rp-stagger" style={delay(300)}>Mindscape reads as film: each unlocked Cinema is a lit frame on the reel.</div>
      </div>
    </div>
  );
}
