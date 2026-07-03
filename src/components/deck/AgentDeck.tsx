"use client";

// The "Now Playing" deck — the full agent profile ported from c-soundsystem.html.
// Renders an agent's IDENTITY (header · turntable · title pill) for any rostered agent,
// and the BUILD panels (cartridge · Levels · Stack · Foot) only when a disc build exists
// in the Supabase blob. Identity falls back to the static roster chrome, so a newly-seeded
// agent (no build yet) still gets a real agent screen. Every disc edit routes through
// `onChange` → the DataProvider's debounced save.
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Agent } from "@/lib/types";
import type { RosterEntry } from "@/lib/roster";
import { gradeBuild, computeStats, computeSheet, resolveWengine, GRADING_CONFIG } from "@/lib/grading";
import type { SyncStatus } from "@/lib/data-context";
import {
  elementIcon,
  typeIcon,
  factionIcon,
  wengineIcon,
  iconPath,
  tallPath,
  VOID_HUNTER_ICON,
  elementColor,
  elementGradient,
  isSignatureEngine,
  fmtStat,
} from "@/lib/deck-config";
import { withBase } from "@/lib/base-path";
import { profileHref, profileFromPath } from "@/lib/profile";
import { displayMindscape } from "@/lib/roster";
import { DeckImg } from "./DeckImg";
import { Levels } from "./Levels";
import { MainStats } from "./MainStats";
import { EquipStack } from "./EquipStack";
import { DiscCard } from "./DiscCard";
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
  base = "",
}: {
  agent: Agent | null;
  entry: RosterEntry;
  onChange: (mutator: (a: Agent) => void) => void;
  syncStatus?: SyncStatus;
  base?: string;
}) {
  // transient spotlight: clicking a cone flashes + scrolls to its audit card (all six
  // cards are always visible now, so "selection" is a wayfinding pulse, not a gate)
  const [selSlot, setSelSlot] = useState<number | null>(null);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (flashTimer.current) clearTimeout(flashTimer.current); }, []);
  const spotlight = (slot: number) => {
    setSelSlot(slot);
    if (flashTimer.current) clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setSelSlot(null), 1600);
    document.getElementById(`disc-card-${slot}`)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  const hasBuild = !!agent?.discs?.pieces?.length;
  const grade = hasBuild ? gradeBuild(agent as Agent, GRADING_CONFIG) : null;
  // The agent's character-screen values (mainStats) are the Sheet; its `relevant` stats are what
  // the Levels panel goalposts. Effective layers the combat buffs (sets + W-Engine) on top.
  const statsOpts = agent?.mainStats?.length
    ? { sheet: Object.fromEntries(agent.mainStats.map((r) => [r.stat, r.value])), stats: agent.relevant }
    : undefined;
  const stats = hasBuild ? computeStats(agent as Agent, GRADING_CONFIG, statsOpts) : null;
  const pieces = agent?.discs?.pieces ?? [];
  // Live-recomputed character screen: editing a disc moves the sheet (and the gold-relevant rows).
  // Overlay the computed values onto the seeded rows, preserving order + any non-computed rows.
  const liveSheet = hasBuild && agent?.base ? computeSheet(agent as Agent, GRADING_CONFIG) : null;
  const mainRows = agent?.mainStats?.map((r) =>
    liveSheet && liveSheet[r.stat] != null ? { stat: r.stat, value: fmtStat(r.stat, liveSheet[r.stat]) } : r,
  );

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
      // floor at 1: a substat always holds its base value (1 roll); the UI shows rolls-1 as the
      // in-game upgrade count, so 1 = base (+0), 6 = base + 5 upgrades (+5).
      if (s) s.rolls = Math.max(1, Math.min(6, (s.rolls || 0) + d));
    });

  // identity — the build wins where present, else the static roster chrome
  const name = agent?.name ?? entry.name;
  const faction = agent?.faction ?? entry.faction;
  const attribute = agent?.attribute ?? entry.attribute;
  const section = agent?.section ?? entry.section;
  const specialty = agent?.specialty || titleCase(section);
  const mindscape = displayMindscape(profileFromPath(base || "/").key, agent?.mindscape ?? entry.mindscape);
  const level = agent?.level ?? 60;
  const rank = agent?.rank ?? "S";
  const { title, voidHunter } = entry;
  // Film-strip backdrop (ripped from ZZZ's RoleInfo agent screen): tinted to the agent's
  // element hue, scroll variant keyed to elite tier. Grandmasters and Void Hunters get the
  // in-game special strips; everyone else gets the standard reel.
  const filmVariant = !voidHunter ? "standard" : title === "Grandmaster" ? "grandmaster" : "voidhunter";
  const filmUrl = withBase(`/assets/filmstrip-${filmVariant}.png`);
  const we = resolveWengine(agent?.wengine ?? null, GRADING_CONFIG);
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
        <div className="np-id">
          {faction && (
            <DeckImg className="fac-badge" src={iconPath(factionIcon(faction))} alt={faction} />
          )}
          <div className="nm">
            {name}
            {faction && <small>{" // "}{faction}</small>}
          </div>
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
          <Link href={profileHref(base, "/")} className="xbtn" aria-label="Back to roster">✕</Link>
        </div>
      </div>

      <div className="deck-body">
        <div
          className="tt"
          style={{
            "--ec": elementColor(attribute),
            "--film": `url(${filmUrl})`,
            "--reel": `url(${withBase("/assets/filmstrip-reel.png")})`,
          } as React.CSSProperties}
        >
          <div className="filmreel" aria-hidden />
          <div className="filmstrip" aria-hidden />
          <DeckImg className="pimg" src={tallPath(entry.slug)} alt={name} />
          <div className="plate">
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
                          <span className="tag r">{we.refine ?? "R1"} · {isSignatureEngine(we.name, we.rank) ? "Signature" : "Standard"}</span>
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
                  <div className="modlbl mstats-lbl"><span className="dot" />Main Stats</div>
                  <MainStats rows={mainRows} relevant={agent?.relevant} />
                </div>
                <div>
                  <div className="modlbl"><span className="dot" />Levels</div>
                  <Levels stats={stats} agentName={name} />
                </div>
              </div>

              <div className="modlbl"><span className="dot" />The Stack · 6-Disc Audit</div>
              <div className="stack">
                <EquipStack agent={agent as Agent} grade={grade} selSlot={selSlot} onSelect={spotlight} />
                <div className="audit-grid">
                  {[...grade.discs].sort((a, b) => a.slot - b.slot).map((d) => {
                    const p = pieces.find((x) => x.slot === d.slot);
                    return p ? (
                      <DiscCard
                        key={d.slot}
                        disc={d}
                        piece={p}
                        sel={d.slot === selSlot}
                        onSetSet={onSetSet}
                        onSetMain={onSetMain}
                        onSetSub={onSetSub}
                        onStepRoll={onStepRoll}
                      />
                    ) : null;
                  })}
                </div>
                <div className="edhint">
                  ▸ edit <b>set</b> · <b>main</b> · <b>substat</b> · <b>rolls</b> — grades move live · tap a cone to spotlight its disc
                </div>
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
