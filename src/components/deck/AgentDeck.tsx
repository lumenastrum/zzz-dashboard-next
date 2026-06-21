"use client";

// The "Now Playing" deck — the full agent profile ported from c-soundsystem.html.
// Renders an agent's IDENTITY (header · turntable · title pill) for any rostered agent,
// and the BUILD panels (cartridge · Levels · Stack · Foot) only when a disc build exists
// in the Supabase blob. Identity falls back to the static roster chrome, so a newly-seeded
// agent (no build yet) still gets a real agent screen. Every disc edit routes through
// `onChange` → the DataProvider's debounced save.
import { useState } from "react";
import Link from "next/link";
import type { Agent } from "@/lib/types";
import type { RosterEntry } from "@/lib/roster";
import { gradeBuild, computeStats, GRADING_CONFIG } from "@/lib/grading";
import type { SyncStatus } from "@/lib/data-context";
import {
  elementIcon,
  typeIcon,
  factionIcon,
  wengineIcon,
  iconPath,
  tallPath,
  VOID_HUNTER_ICON,
  elementGradient,
} from "@/lib/deck-config";
import { DeckImg } from "./DeckImg";
import { Levels } from "./Levels";
import { EquipStack } from "./EquipStack";
import { TrackInspector } from "./TrackInspector";
import { DeckFoot } from "./DeckFoot";

const titleCase = (s: string) =>
  s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : s;

const SYNC_LABEL: Record<SyncStatus, { dot: string; text: string }> = {
  loading: { dot: "var(--mut)", text: "SYNC…" },
  live: { dot: "var(--green)", text: "LIVE" },
  saving: { dot: "var(--amber)", text: "SAVING" },
  local: { dot: "var(--mut)", text: "LOCAL" },
  error: { dot: "var(--red)", text: "OFFLINE" },
};

export function AgentDeck({
  agent,
  entry,
  onChange,
  syncStatus = "local",
}: {
  agent: Agent | null;
  entry: RosterEntry;
  onChange: (mutator: (a: Agent) => void) => void;
  syncStatus?: SyncStatus;
}) {
  const [selSlot, setSelSlot] = useState(4);

  const hasBuild = !!agent?.discs?.pieces?.length;
  const grade = hasBuild ? gradeBuild(agent as Agent, GRADING_CONFIG) : null;
  const stats = hasBuild ? computeStats(agent as Agent, GRADING_CONFIG) : null;
  const pieces = agent?.discs?.pieces ?? [];

  const disc = grade ? grade.discs.find((d) => d.slot === selSlot) ?? grade.discs[0] : undefined;
  const piece = disc ? pieces.find((p) => p.slot === disc.slot) : undefined;

  // edit helpers — locate the piece in a draft and mutate it (re-grades + saves)
  const editPiece = (slot: number, fn: (p: typeof pieces[number]) => void) =>
    onChange((a) => {
      const p = a.discs?.pieces.find((x) => x.slot === slot);
      if (p) fn(p);
    });
  const onSetSet = (slot: number, set: string) => editPiece(slot, (p) => { p.set = set; });
  const onSetMain = (slot: number, stat: string) => editPiece(slot, (p) => { p.main.stat = stat; });
  const onSetSub = (slot: number, i: number, stat: string) =>
    editPiece(slot, (p) => { if (p.subs[i]) p.subs[i].stat = stat; });
  const onStepRoll = (slot: number, i: number, d: number) =>
    editPiece(slot, (p) => {
      const s = p.subs[i];
      if (s) s.rolls = Math.max(0, Math.min(6, (s.rolls || 0) + d));
    });

  // identity — the build wins where present, else the static roster chrome
  const name = agent?.name ?? entry.name;
  const faction = agent?.faction ?? entry.faction;
  const attribute = agent?.attribute ?? entry.attribute;
  const section = agent?.section ?? entry.section;
  const specialty = agent?.specialty || titleCase(section);
  const mindscape = agent?.mindscape ?? `M${entry.mindscape}`;
  const level = agent?.level ?? 60;
  const rank = agent?.rank ?? "S";
  const { title, voidHunter } = entry;
  const we = agent?.wengine;
  const sync = SYNC_LABEL[syncStatus];

  const titlePill = title ? (
    <span
      className={`title-pill${voidHunter ? " vh" : ""}`}
      style={voidHunter ? ({ "--vh-grad": elementGradient(attribute) } as React.CSSProperties) : undefined}
    >
      {voidHunter && <DeckImg src={iconPath(VOID_HUNTER_ICON)} alt="Void Hunter" />}
      {title}
    </span>
  ) : null;

  return (
    <div className="deck">
      <div className="deck-top">
        <span className="led" />
        <div className="np">Now Playing</div>
        <div className="nm">
          {name} <small>{"// "}{specialty}</small>
        </div>
        <div className="spec">
          <span className="chip">
            <DeckImg src={iconPath(elementIcon(attribute))} alt={attribute} />
            {attribute}
          </span>
          <span className="chip">
            <DeckImg src={iconPath(typeIcon(section))} alt={specialty} />
            {specialty}
          </span>
          <span className="chip">
            {mindscape} · LV{level}
          </span>
          <span className="chip" title={`Supabase: ${syncStatus}`}>
            <span
              className="led"
              style={{ width: 7, height: 7, background: sync.dot, boxShadow: `0 0 8px ${sync.dot}` }}
            />
            {sync.text}
          </span>
          <Link href="/" className="xbtn" aria-label="Back to roster">✕</Link>
        </div>
      </div>

      <div className="deck-body">
        <div className="tt">
          <div className="platter" />
          <DeckImg className="pimg" src={tallPath(entry.slug)} alt={name} />
          <div className="plate">
            <div className="fac">
              {faction && <DeckImg src={iconPath(factionIcon(faction))} alt="" style={{ width: 15, height: 15, objectFit: "contain", flexShrink: 0 }} />}
              {faction ?? "—"} · {specialty}
            </div>
            <div className="big">{name}</div>
            {titlePill}
            <div className="meta">
              <span className="mp">RANK <b>{rank}</b></span>
              <span className="mp">MINDSCAPE <b>{mindscape}</b></span>
              <span className="mp">LV <b>{level}</b></span>
            </div>
          </div>
        </div>

        <div className="rack">
          {hasBuild && grade && stats ? (
            <>
              <div className="rtop">
                <div>
                  <div className="modlbl"><span className="dot" />Cartridge · W-Engine</div>
                  {we && (
                    <div className="cart">
                      <div className="disc-bg" />
                      <DeckImg src={iconPath(wengineIcon(we.name))} alt={we.name} />
                      <div>
                        <div className="wn">{we.name}</div>
                        <div className="wr">
                          <span className="tag s">{we.rank ?? "S"}</span>
                          <span className="tag r">{we.refine ?? "R1"} · Signature</span>
                        </div>
                        <div className="wp">
                          ATK <b>{we.base?.ATK ?? "—"}</b>
                          {we.advanced?.label ? <> · {we.advanced.label}</> : null}
                        </div>
                        {we.passive && we.passive.length > 0 && (
                          <div className="wpass">
                            <span className="pi">✦</span> Passive:{" "}
                            {we.passive.map((m, i) => (
                              <span key={i}>
                                {i > 0 && " · "}
                                <span className="cmb">{m.label}</span>
                              </span>
                            ))}{" "}
                            <b>(in-combat)</b>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <div className="modlbl"><span className="dot" />Levels</div>
                  <Levels stats={stats} />
                </div>
              </div>

              <div className="modlbl"><span className="dot" />The Stack · 6-Disc Audit</div>
              <div className="stack">
                <EquipStack agent={agent as Agent} grade={grade} selSlot={disc?.slot ?? selSlot} onSelect={setSelSlot} />
                {disc && piece ? (
                  <TrackInspector
                    disc={disc}
                    piece={piece}
                    onSetSet={onSetSet}
                    onSetMain={onSetMain}
                    onSetSub={onSetSub}
                    onStepRoll={onStepRoll}
                  />
                ) : (
                  <div className="track" />
                )}
              </div>

              <DeckFoot grade={grade} />
            </>
          ) : (
            <>
              <div className="modlbl"><span className="dot" />The Stack · 6-Disc Audit</div>
              <div className="nobuild-card">
                <b>Disc build not entered yet.</b>
                <span>Add {name}&apos;s W-Engine + 6 discs to grade the build and light up the stack.</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
