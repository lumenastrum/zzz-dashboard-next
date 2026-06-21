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
  PROFILE_KEY,
  SAVE_DEBOUNCE_MS,
  SUPABASE_TABLE,
} from "./supabase";
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
  const supa = getSupabase();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        let loaded: DashboardData | null = null;

        if (supa) {
          const { data: row, error } = await supa
            .from(SUPABASE_TABLE)
            .select("data")
            .eq("profile", PROFILE_KEY)
            .maybeSingle();
          if (error) {
            console.warn("Supabase load error, falling back to JSON seed", error);
          } else if (row?.data) {
            loaded = row.data as DashboardData;
          }
        }

        if (!loaded) {
          const resp = await fetch(`${BASE_PATH}/data.json`, { cache: "no-store" });
          if (!resp.ok) throw new Error("HTTP " + resp.status);
          loaded = (await resp.json()) as DashboardData;
          // Seed the Supabase row so the next load is live (and CLI/other surfaces share it).
          if (supa) {
            await supa
              .from(SUPABASE_TABLE)
              .upsert(
                { profile: PROFILE_KEY, data: loaded, updated_at: new Date().toISOString() },
                { onConflict: "profile" },
              );
          }
        }

        if (!mounted) return;
        latest.current = loaded;
        setData(loaded);
        setSyncStatus(supa ? "live" : "local");
      } catch (e) {
        console.error("Data load failed", e);
        if (mounted) setSyncStatus("error");
      }
    })();
    return () => {
      mounted = false;
    };
  }, [supa]);

  const scheduleSave = useCallback(() => {
    if (!supa) {
      setSyncStatus("local");
      return;
    }
    setSyncStatus("saving");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      if (!latest.current) return;
      try {
        const { error } = await supa
          .from(SUPABASE_TABLE)
          .upsert(
            { profile: PROFILE_KEY, data: latest.current, updated_at: new Date().toISOString() },
            { onConflict: "profile" },
          );
        if (error) throw error;
        setSyncStatus("live");
      } catch (e) {
        console.error("Save failed", e);
        setSyncStatus("error");
      }
    }, SAVE_DEBOUNCE_MS);
  }, [supa]);

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
      .eq("profile", PROFILE_KEY)
      .maybeSingle();
    if (!error && row?.data) {
      const fresh = row.data as DashboardData;
      latest.current = fresh;
      setData(fresh);
      setSyncStatus("live");
    } else {
      setSyncStatus("error");
    }
  }, [supa]);

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
