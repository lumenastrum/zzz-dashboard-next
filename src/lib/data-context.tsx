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
            { profile: profileKey, data: latest.current, updated_at: new Date().toISOString() },
            { onConflict: "profile" },
          );
        if (error) throw error;
        setSyncStatus("live");
      } catch (e) {
        console.error("Save failed", e);
        setSyncStatus("error");
      }
    }, SAVE_DEBOUNCE_MS);
  }, [supa, profileKey]);

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
