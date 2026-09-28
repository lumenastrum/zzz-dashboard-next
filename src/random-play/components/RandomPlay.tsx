"use client";
import { useMemo, useState } from "react";
import type { Agent, AssaultCycle, BuildDetail, EditStatus, EndgameLedger, SceneEditor, ShiyuCycle, SignalArchive, StaffPick, Team } from "../data/types";
import { ChannelSearch } from "./ChannelSearch";
import { NowShowing } from "./NowShowing";
import { Register } from "./Register";
import { StaffPicks } from "./StaffPicks";
import { StoreHeader, TrackingBand, type SectionId } from "./StoreHeader";
import { TapeJacket, type JacketTab } from "./TapeJacket";
import { Clerk, GenreFilterBar, TapeWall, Ticker, type GenreFilter } from "./TapeWall";
import { TripleFeatures } from "./TripleFeatures";

export type View = "shelf" | "tape" | "teams" | "shiyu" | "assault" | "signal" | "picks";

/** `shiyu` / `assault` = the cycle index on show in each ledger (0 = newest); `pick` = the open staff pick. */
export interface RandomPlayState { view: View; selected: string; tab: JacketTab; filter: GenreFilter; team: number; shiyu: number; assault: number; pick: number }

const SECTION_OF: Record<View, SectionId> = { shelf: "wall", tape: "wall", teams: "features", shiyu: "register", assault: "showing", signal: "channel", picks: "picks" };
const VIEW_OF: Record<SectionId, View> = { wall: "shelf", features: "teams", register: "shiyu", showing: "assault", channel: "signal", picks: "picks" };
const EMPTY = { cycles: [], history: [] };

export interface RandomPlayProps {
  agents: Agent[];
  teams: Team[];
  /** Deep build data by slug (discs, skills, goals). Agents without it render honest placeholders. */
  details?: Record<string, BuildDetail>;
  /** Shiyu Defense ledger (`deriveShiyu`) → The Register. */
  shiyu?: EndgameLedger<ShiyuCycle>;
  /** Deadly Assault ledger (`deriveAssault`) → Now Showing. */
  assault?: EndgameLedger<AssaultCycle>;
  /** Signal Search archive (`deriveSignal`) → Channel Search. A.'s profile only. */
  signal?: SignalArchive;
  /** Pull-priority list (`derivePicks`) → Staff Picks, with who it's for and who picked. */
  picks?: { list: StaffPick[]; forName: string; staff: string };
  uid?: string;
  initial?: Partial<RandomPlayState>;
  /** Fired on every state change — the dashboard syncs this to the URL (see docs/07-migration.md). */
  onStateChange?: (s: RandomPlayState) => void;
  /** Live disc editing per tape (see `SceneEditor`); return undefined for tapes that can't be edited. */
  editorFor?: (slug: string) => SceneEditor | undefined;
  /** Where edits are going right now; shows on the header status line while it isn't "live". */
  sync?: EditStatus;
}

const SYNC_SUFFIX: Record<EditStatus, string> = { live: "", saving: " · SAVING", locked: " · SIGN IN TO SAVE", local: " · LOCAL", error: " · SAVE FAILED" };

/**
 * Reference composition: every view stays MOUNTED and trades places with CSS transitions (shelf blurs
 * back, jacket wipes in from the right, features rise from the bottom, …). Unmounting a view would kill
 * its exit animation — keep this shape when porting to the dashboard. Sections are profile-aware: a
 * section only exists when its data does (Cosmea has Staff Picks and no Signal; A. the reverse).
 */
export function RandomPlay({ agents, teams, details = {}, shiyu = EMPTY, assault = EMPTY, signal, picks, uid, initial, onStateChange, editorFor, sync = "live" }: RandomPlayProps) {
  const [s, setS] = useState<RandomPlayState>({ view: "shelf", selected: agents[0]?.slug ?? "", tab: 0, filter: "All", team: 0, shiyu: 0, assault: 0, pick: 0, ...initial });
  const [sweep, setSweep] = useState(0); // bumps on every view change → TrackingBand remounts and sweeps
  const roster = useMemo(() => Object.fromEntries(agents.map((a) => [a.slug, a])), [agents]);
  const agent = roster[s.selected] ?? agents[0];
  const hasPicks = !!picks?.list.length;

  const sections: SectionId[] = [
    "wall",
    ...(teams.length ? ["features" as const] : []),
    ...(shiyu.cycles.length ? ["register" as const] : []),
    ...(assault.cycles.length ? ["showing" as const] : []),
    ...(signal ? ["channel" as const] : []),
    ...(hasPicks ? ["picks" as const] : []),
  ];

  const set = (patch: Partial<RandomPlayState>) => {
    const next = { ...s, ...patch };
    if (patch.view && patch.view !== s.view) setSweep((n) => n + 1);
    setS(next);
    onStateChange?.(next);
  };

  const status = {
    tape: `PLAY · ${agent.name.toUpperCase()}`,
    teams: "PLAY · TRIPLE FEATURES",
    shiyu: `PRINT · SHIYU ${shiyu.cycles[s.shiyu]?.date.slice(5).replace("-", "/") ?? ""}`,
    assault: `PLAY · DEADLY ASSAULT ${assault.cycles[s.assault]?.date.slice(5).replace("-", "/") ?? ""}`,
    signal: "SCAN · CHANNEL SEARCH",
    picks: `PLAY · STAFF PICK #${picks?.list[s.pick]?.rank ?? ""}`,
    shelf: `STOP · ${agents.length} TITLES ON SHELF`,
  }[s.view] + SYNC_SUFFIX[sync];
  const ticker = `NOW SHOWING — ${agent.name.toUpperCase()} · ${agent.section.toUpperCase()} · ${agent.attribute.toUpperCase()} · RATED ${agent.grade ?? "–"} ··· ${agents.length} TITLES ON THE WALL ··· BE KIND, REWIND ··· PLEASE RETURN TAPES BEFORE THE NEXT SHIYU ROTATION ···`;

  return (
    <div className="rp-app rp-peg">
      <StoreHeader sections={sections} section={SECTION_OF[s.view]} onSection={(id: SectionId) => set({ view: VIEW_OF[id] })} status={status} live={s.view !== "shelf"} />
      {sweep > 0 && <TrackingBand key={sweep} />}

      <section className={`rp-view rp-shelfview${s.view !== "shelf" ? " is-away" : ""}`} aria-label="Agent roster shelf" aria-hidden={s.view !== "shelf"}>
        <GenreFilterBar agents={agents} value={s.filter} onChange={(filter) => set({ filter })} />
        <TapeWall agents={agents} selected={s.selected} filter={s.filter}
          onSelect={(selected) => set({ selected })} onPlay={(selected) => set({ selected, view: "tape" })} />
        <Clerk />
        <Ticker text={ticker} />
      </section>

      {teams.length > 0 && (
        <TripleFeatures teams={teams} current={Math.min(s.team, teams.length - 1)} onPick={(team) => set({ team })} roster={roster}
          onOpenAgent={(selected) => set({ selected, view: "tape" })} open={s.view === "teams"} />
      )}

      <Register ledger={shiyu} current={s.shiyu} onPick={(i) => set({ shiyu: i })} roster={roster}
        onOpenAgent={(selected) => set({ selected, view: "tape" })} open={s.view === "shiyu"} />

      <NowShowing ledger={assault} current={s.assault} onPick={(i) => set({ assault: i })} roster={roster} open={s.view === "assault"} />

      {signal && <ChannelSearch archive={signal} uid={uid} open={s.view === "signal"} />}

      {hasPicks && (
        <StaffPicks picks={picks!.list} current={Math.min(s.pick, picks!.list.length - 1)} onPick={(pick) => set({ pick })}
          forName={picks!.forName} staff={picks!.staff} open={s.view === "picks"} />
      )}

      <TapeJacket agents={agents} agent={agent} detail={details[agent.slug]} tab={s.tab} editor={editorFor?.(agent.slug)}
        onTab={(tab) => set({ tab })} onPick={(selected) => set({ selected })} onRewind={() => set({ view: "shelf" })} open={s.view === "tape"} />
    </div>
  );
}
