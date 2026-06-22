"use client";

// Live data layer for the ZZZ Soundsystem dashboard.
// Mirrors wuwa-dashboard-next/src/lib/data-context.tsx: load the Supabase row,
// fall back to the bundled /data.json seed (and seed Supabase from it), then save
// edits back with a debounce. Two differences from WuWa:
//   1. NON-BLOCKING — the static roster home renders immediately; only data-dependent
//      views (the deck) wait on `data`. WuWa gates the whole app behind a loading screen.
//   2. `updateAgent(name, mutator)` — ergonomic per-agent edit that the deck wires its
//      disc dropdowns / roll steppers into (each edit re-grades + schedules a save).
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  getSupabase,
  SAVE_DEBOUNCE_MS,
  SUPABASE_TABLE,
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
} from "./supabase";
import { useProfile } from "./profile";
import { BASE_PATH } from "./base-path";
import type { Agent, DashboardData } from "./types";

export type SyncStatus = "loading" | "live" | "saving" | "local" | "error";

interface DataContextValue {
  data: DashboardData | null;
  agents: Agent[];
  agentByName: Record<string, Agent>;
  syncStatus: SyncStatus;
  update: (mutator: (draft: DashboardData) => void) => void;
  updateAgent: (name: string, mutator: (agent: Agent) => void) => void;
  reload: () => Promise<void>;
}

const DataCtx = createContext<DataContextValue | null>(null);

function deriveAgents(data: DashboardData | null) {
  const agents = data?.agents ?? [];
  const agentByName = Object.fromEntries(agents.map((a) => [a.name, a]));
  return { agents, agentByName };
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("loading");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latest = useRef<DashboardData | null>(null);
  const dirty = useRef(false); // unsaved edits pending (cleared only on confirmed save)
  const version = useRef(0); // bumped per edit, so an in-flight save knows if it's been superseded
  const supa = getSupabase();
  // Which Supabase row this route reads/writes — root → andres-zzz, /wife → wife-zzz.
  const { key: profileKey, isWife } = useProfile();

  useEffect(() => {
    let mounted = true;
    setSyncStatus("loading");
    (async () => {
      try {
        let loaded: DashboardData | null = null;

        if (supa) {
          const { data: row, error } = await supa
            .from(SUPABASE_TABLE)
            .select("data")
            .eq("profile", profileKey)
            .maybeSingle();
          if (error) {
            console.warn("Supabase load error, falling back to JSON seed", error);
          } else if (row?.data) {
            loaded = row.data as DashboardData;
          }
        }

        if (!loaded && !isWife) {
          // Default profile only: the bundled data.json is ANDRES's seed, so never auto-seed a
          // secondary profile (e.g. wife) from it. Her blob is seeded out-of-band (seed-profile).
          const resp = await fetch(`${BASE_PATH}/data.json`, { cache: "no-store" });
          if (!resp.ok) throw new Error("HTTP " + resp.status);
          loaded = (await resp.json()) as DashboardData;
          if (supa) {
            await supa
              .from(SUPABASE_TABLE)
              .upsert(
                { profile: profileKey, data: loaded, updated_at: new Date().toISOString() },
                { onConflict: "profile" },
              );
          }
        }

        if (!mounted) return;
        latest.current = loaded;
        setData(loaded);
        // A missing secondary-profile row isn't an error per se, but there's no build data to show.
        setSyncStatus(loaded ? (supa ? "live" : "local") : "error");
      } catch (e) {
        console.error("Data load failed", e);
        if (mounted) setSyncStatus("error");
      }
    })();
    return () => {
      mounted = false;
    };
  }, [supa, profileKey, isWife]);

  // The actual persist (debounced path). Uses the supabase-js client with full error handling.
  // `dirty` is cleared ONLY on confirmed success, and only if no newer edit landed during the
  // round-trip (version guard) — so an edit made mid-save is never silently dropped.
  const commit = useCallback(async () => {
    if (!supa || !latest.current || !dirty.current) return;
    if (saveTimer.current) { clearTimeout(saveTimer.current); saveTimer.current = null; }
    const v = version.current;
    setSyncStatus("saving");
    try {
      const { error } = await supa
        .from(SUPABASE_TABLE)
        .upsert(
          { profile: profileKey, data: latest.current, updated_at: new Date().toISOString() },
          { onConflict: "profile" },
        );
      if (error) throw error;
      if (version.current === v) {
        dirty.current = false;
        setSyncStatus("live");
      } // else: a newer edit arrived mid-save — leave dirty; its debounce will persist it
    } catch (e) {
      console.error("Save failed", e);
      setSyncStatus("error"); // dirty stays true → retried by the next edit / flush
    }
  }, [supa, profileKey]);

  // Land a pending edit synchronously when the page is hidden / refreshed / closed. The supabase-js
  // client's fetch is NOT keepalive, so a debounced (or in-flight) save is cancelled on unload — that
  // is the disc-edit rollback. A raw keepalive POST survives teardown (the blob is well under the
  // ~64KB keepalive cap). Fire-and-forget by design; clears dirty since we've dispatched the freshest.
  const flush = useCallback(() => {
    if (!supa || !latest.current || !dirty.current) return;
    if (saveTimer.current) { clearTimeout(saveTimer.current); saveTimer.current = null; }
    dirty.current = false;
    try {
      fetch(`${SUPABASE_URL}/rest/v1/${SUPABASE_TABLE}?on_conflict=profile`, {
        method: "POST",
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json",
          Prefer: "resolution=merge-duplicates,return=minimal",
        },
        body: JSON.stringify({ profile: profileKey, data: latest.current, updated_at: new Date().toISOString() }),
        keepalive: true,
      });
    } catch {
      /* page going away — best effort */
    }
  }, [supa, profileKey]);

  // Flush before any refresh/close/tab-switch. visibilitychange(hidden) is the reliable cross-platform
  // signal; pagehide backs it up for reloads/navigations. Cleanup also flushes, so switching profiles
  // (or unmounting) with a pending edit doesn't drop it — the cleanup runs the prior profile's closure.
  useEffect(() => {
    const onVis = () => { if (document.visibilityState === "hidden") flush(); };
    const onPageHide = () => flush();
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("pagehide", onPageHide);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pagehide", onPageHide);
      flush();
    };
  }, [flush]);

  const scheduleSave = useCallback(() => {
    if (!supa) {
      setSyncStatus("local");
      return;
    }
    version.current++;
    dirty.current = true;
    setSyncStatus("saving");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => { void commit(); }, SAVE_DEBOUNCE_MS);
  }, [supa, commit]);

  const update = useCallback(
    (mutator: (draft: DashboardData) => void) => {
      setData((prev) => {
        if (!prev) return prev;
        const draft = structuredClone(prev);
        mutator(draft);
        latest.current = draft;
        return draft;
      });
      scheduleSave();
    },
    [scheduleSave],
  );

  const updateAgent = useCallback(
    (name: string, mutator: (agent: Agent) => void) => {
      update((draft) => {
        const a = draft.agents?.find((x) => x.name === name);
        if (a) mutator(a);
      });
    },
    [update],
  );

  const reload = useCallback(async () => {
    if (!supa) return;
    setSyncStatus("loading");
    const { data: row, error } = await supa
      .from(SUPABASE_TABLE)
      .select("data")
      .eq("profile", profileKey)
      .maybeSingle();
    if (!error && row?.data) {
      const fresh = row.data as DashboardData;
      latest.current = fresh;
      setData(fresh);
      setSyncStatus("live");
    } else {
      setSyncStatus("error");
    }
  }, [supa, profileKey]);

  const { agents, agentByName } = deriveAgents(data);

  return (
    <DataCtx.Provider
      value={{ data, agents, agentByName, syncStatus, update, updateAgent, reload }}
    >
      {children}
    </DataCtx.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataCtx);
  if (!ctx) throw new Error("useData must be used inside <DataProvider>");
  return ctx;
}
