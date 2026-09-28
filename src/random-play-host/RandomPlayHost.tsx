"use client";
// The one client stage that hosts Random Play in the dashboard (random-play/docs/07-migration.md).
// Every route renders this with an `initial` state (the static entry point), then the URL follows the
// store's state with `router.replace` (no scroll, no history spam). Data: the roster is code, the builds
// are the live Supabase blob (DataProvider), endgame + setlists + picks are the editorial TS sources,
// Signal is its own read-only row. Disc edits go through DataProvider's `updateAgent` — the same
// session-gated, debounced, optimistic-locked save the old deck used — and re-grade on every render.
import { Suspense, useCallback, useEffect, useMemo, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  RandomPlay, RandomPlayProvider, deriveAssault, derivePicks, deriveShiyu, deriveSignal, deriveTeams, flattenRuns,
  type CoachAssault, type CoachPicks, type CoachSetlists, type CoachShiyu, type CoachSignal, type EditStatus, type JacketTab,
  type RandomPlayState, type SceneEditor, type View,
} from "@/random-play";
import { useData, type SyncStatus } from "@/lib/data-context";
import { useProfile } from "@/lib/use-profile";
import { useSignal } from "@/lib/use-signal";
import { rosterFor } from "@/lib/roster";
import { setlistsFor } from "@/lib/setlists";
import { shiyuCyclesFor, shiyuHistoryFor } from "@/lib/shiyu";
import { assaultCyclesFor, assaultHistoryFor } from "@/lib/assault";
import { pullPriorityFor } from "@/lib/pull-priority";
import { MAINS, SET_CHOICES, SUBSTATS } from "@/lib/deck-config";
import { PROFILE_KEY } from "@/lib/supabase";
import { withBase } from "@/lib/base-path";
import { RP_VENDORED } from "@/random-play/vendored";
import { liveAgent, liveDetail, mainValueFor } from "./live";

const ASSETS = { assetBase: withBase("/rp"), assetVersion: RP_VENDORED };

const VIEWS: View[] = ["shelf", "tape", "teams", "shiyu", "assault", "signal", "picks"];
const TABS = ["specs", "scenes", "chapters"];
const SYNC: Record<SyncStatus, EditStatus> = { loading: "live", live: "live", saving: "saving", local: "local", error: "error", locked: "locked" };

/** ?tape=alice&tab=scenes · ?view=teams&feature=2 · ?view=shiyu&cycle=1 · ?view=picks&pick=3 */
function fromParams(sp: URLSearchParams, base: Partial<RandomPlayState>): Partial<RandomPlayState> {
  const s = { ...base };
  const view = sp.get("view") as View | null;
  if (view && VIEWS.includes(view)) s.view = view;
  const tape = sp.get("tape");
  if (tape) { s.selected = tape; s.view = "tape"; }
  const tab = TABS.indexOf(sp.get("tab") ?? "");
  if (tab >= 0) s.tab = tab as JacketTab;
  const n = (k: string) => { const v = Number(sp.get(k)); return Number.isInteger(v) && v >= 0 ? v : undefined; };
  if (n("feature") != null) s.team = n("feature");
  if (n("cycle") != null) { if (s.view === "assault") s.assault = n("cycle"); else s.shiyu = n("cycle"); }
  if (n("pick") != null) s.pick = n("pick");
  return s;
}

function toParams(s: RandomPlayState): string {
  const p = new URLSearchParams();
  if (s.view === "tape") { p.set("tape", s.selected); if (s.tab) p.set("tab", TABS[s.tab]); }
  else if (s.view !== "shelf") p.set("view", s.view);
  if (s.view === "teams" && s.team) p.set("feature", String(s.team));
  if (s.view === "shiyu" && s.shiyu) p.set("cycle", String(s.shiyu));
  if (s.view === "assault" && s.assault) p.set("cycle", String(s.assault));
  if (s.view === "picks" && s.pick) p.set("pick", String(s.pick));
  const q = p.toString();
  return q ? `?${q}` : "";
}

export interface RandomPlayHostProps { initial?: Partial<RandomPlayState> }

/** Static-export rule: `useSearchParams` needs a Suspense boundary above it, or the build refuses the page. */
export function RandomPlayHost(props: RandomPlayHostProps) {
  return (
    <div className="rp-host">
      <Suspense fallback={<RandomPlayProvider {...ASSETS}><Shell line="REWINDING…" /></RandomPlayProvider>}>
        <Host {...props} />
      </Suspense>
    </div>
  );
}

function Shell({ line }: { line: string }) {
  return (
    <div className="rp-peg rp-host__shell" role="status">
      <span className="rp-host__line">{line}</span>
    </div>
  );
}

function Host({ initial }: RandomPlayHostProps) {
  const { key: profileKey, base, isWife } = useProfile();
  const { agentByName, syncStatus, updateAgent } = useData();
  const { store, summary } = useSignal(!isWife); // A.'s archive only; Cosmea's store has no Channel Search
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  // The URL is read ONCE, on mount: the store keeps its own state after that and only writes the URL back.
  const initialRef = useRef<Partial<RandomPlayState> | null>(null);
  if (initialRef.current === null) initialRef.current = fromParams(sp, initial ?? {});

  const entries = useMemo(() => rosterFor(profileKey), [profileKey]);
  const bySlug = useMemo(() => Object.fromEntries(entries.map((e) => [e.slug, e])), [entries]);
  const loaded = Object.keys(agentByName).length > 0;

  // Every derived thing depends on the live blob: a disc edit re-runs the grader for the whole wall.
  const agents = useMemo(() => entries.map((e) => liveAgent(e, agentByName[e.name], profileKey)), [entries, agentByName, profileKey]);
  const details = useMemo(() => {
    const out: Record<string, NonNullable<ReturnType<typeof liveDetail>>> = {};
    for (const e of entries) { const d = liveDetail(e, agentByName[e.name]); if (d) out[e.slug] = d; }
    return out;
  }, [entries, agentByName]);

  // Editorial sources are code: shaped like the coach pack so the framework's adapters take them as-is.
  const editorial = useMemo(() => {
    const shiyu = { profiles: { [profileKey]: { cycles: shiyuCyclesFor(profileKey), history: shiyuHistoryFor(profileKey) } } } as unknown as CoachShiyu;
    const assault = { profiles: { [profileKey]: { cycles: assaultCyclesFor(profileKey), history: assaultHistoryFor(profileKey) } } } as unknown as CoachAssault;
    const setlists = { profiles: { [profileKey]: setlistsFor(profileKey) } } as unknown as CoachSetlists;
    const runs = flattenRuns(assault as unknown as { profiles: Record<string, unknown> }, shiyu as unknown as { profiles: Record<string, unknown> }, profileKey);
    const picksList = derivePicks({ profiles: { [profileKey]: pullPriorityFor(profileKey) } } as unknown as CoachPicks, profileKey);
    return {
      teams: deriveTeams(setlists, runs, profileKey),
      shiyu: deriveShiyu(shiyu, profileKey),
      assault: deriveAssault(assault, profileKey),
      picks: picksList.length ? { list: picksList, forName: isWife ? "Cosmea" : "A.", staff: "Clio" } : undefined,
    };
  }, [profileKey, isWife]);

  const signal = useMemo(() => (summary && store ? deriveSignal(summary as unknown as CoachSignal, store.lastSync) : undefined), [summary, store]);

  const editorFor = useCallback((slug: string): SceneEditor | undefined => {
    const entry = bySlug[slug];
    const blob = entry && agentByName[entry.name];
    if (!blob?.discs?.pieces?.length) return undefined; // read-only tape (no build in the blob)
    const edit = (slot: number, fn: (p: NonNullable<typeof blob.discs>["pieces"][number]) => void) =>
      updateAgent(entry.name, (a) => { const p = a.discs?.pieces.find((x) => x.slot === slot); if (p) fn(p); });
    return {
      sets: SET_CHOICES, mains: MAINS, substats: SUBSTATS, status: SYNC[syncStatus],
      onSet: (slot, set) => edit(slot, (p) => { p.set = set; }),
      onMain: (slot, stat) => edit(slot, (p) => { p.main.stat = stat; const v = mainValueFor(slot, stat); if (v != null) p.main.value = v; }),
      onSub: (slot, i, stat) => edit(slot, (p) => { if (p.subs[i]) p.subs[i].stat = stat; }),
      onRoll: (slot, i, d) => edit(slot, (p) => { const s = p.subs[i]; if (s) s.rolls = Math.max(1, Math.min(6, (s.rolls || 0) + d)); }),
    };
  }, [bySlug, agentByName, updateAgent, syncStatus]);

  // URL follows the store. Canonical root of the profile (+ params); the static /r/<slug>/ etc. pages are
  // entry points only. `replace`, never `push`: views stay mounted, there's nothing to go "back" to inside.
  const onStateChange = useCallback((s: RandomPlayState) => {
    const target = `${base}/${toParams(s)}`;
    if (`${pathname}${window.location.search}` !== target) router.replace(target, { scroll: false });
  }, [router, pathname, base]);

  useEffect(() => { document.title = `${isWife ? "Cosmea's " : ""}Zenless Zone Zero · Random Play`; }, [isWife]);

  if (!loaded) {
    return (
      <RandomPlayProvider {...ASSETS}>
        <Shell line={syncStatus === "error" ? "TAPES NOT ON FILE · THE SHELF COULDN'T BE REACHED" : "REWINDING THE TAPES…"} />
      </RandomPlayProvider>
    );
  }
  // Only defined keys may reach `initial`: RandomPlay spreads it over its defaults, so an explicit
  // `view: undefined` would blank the store (no view on, status "undefined", pill at index -1).
  const init0 = initialRef.current ?? {};
  const init: Partial<RandomPlayState> = Object.fromEntries(Object.entries(init0).filter(([, v]) => v !== undefined));
  init.selected = init0.selected && bySlug[init0.selected] ? init0.selected : agents[0]?.slug;
  if (init0.view === "tape" && !bySlug[init0.selected ?? ""]) init.view = "shelf"; // unknown slug → the wall, never the first tape
  return (
    <RandomPlayProvider {...ASSETS}>
      <RandomPlay
        key={profileKey}
        agents={agents} details={details} teams={editorial.teams} shiyu={editorial.shiyu} assault={editorial.assault}
        signal={isWife ? undefined : signal} picks={editorial.picks} uid={isWife ? undefined : store?.uid || undefined}
        initial={init}
        onStateChange={onStateChange} editorFor={editorFor} sync={SYNC[syncStatus]}
      />
    </RandomPlayProvider>
  );
}

export const DEFAULT_PROFILE = PROFILE_KEY;
