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
import { useProfile } from "./use-profile";
import { BASE_PATH } from "./base-path";
import type { Agent, DashboardData } from "./types";
import { AuthGate } from "@/components/auth-gate";

// "locked": an edit is pending but there's no owner session — anon is read-only
// under RLS (2026-07-07 lockdown). The AuthGate overlay opens; sign-in resumes the save.
export type SyncStatus = "loading" | "live" | "saving" | "local" | "error" | "locked";

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
  const [authNeeded, setAuthNeeded] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latest = useRef<DashboardData | null>(null);
  const dirty = useRef(false); // unsaved edits pending (cleared only on confirmed save)
  const version = useRef(0); // bumped per edit, so an in-flight save knows if it's been superseded
  const loadedAt = useRef<string | null>(null); // the updated_at we loaded — optimistic-lock token
  const accessToken = useRef<string | null>(null); // owner JWT, mirrored sync for the keepalive flush
  const supa = getSupabase();

  // Track the owner session. supabase-js persists/refreshes it; the ref gives the
  // synchronous unload flush a token without an async getSession() call.
  useEffect(() => {
    if (!supa) return;
    void supa.auth.getSession().then(({ data: s }) => {
      accessToken.current = s.session?.access_token ?? null;
    });
    const { data: sub } = supa.auth.onAuthStateChange((_event, session) => {
      accessToken.current = session?.access_token ?? null;
    });
    return () => sub.subscription.unsubscribe();
  }, [supa]);
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
            .select("data,updated_at")
            .eq("profile", profileKey)
            .maybeSingle();
          if (error) {
            console.warn("Supabase load error, falling back to JSON seed", error);
          } else if (row?.data) {
            loaded = row.data as DashboardData;
            loadedAt.current = (row as { updated_at?: string }).updated_at ?? null;
          }
        }

        if (!loaded && !isWife) {
          // Default profile only: the bundled data.json is ANDRES's seed, so never auto-seed a
          // secondary profile (e.g. wife) from it. Her blob is seeded out-of-band (seed-profile).
          const resp = await fetch(`${BASE_PATH}/data.json`, { cache: "no-store" });
          if (!resp.ok) throw new Error("HTTP " + resp.status);
          loaded = (await resp.json()) as DashboardData;
          if (supa) {
            const stamp = new Date().toISOString();
            await supa
              .from(SUPABASE_TABLE)
              .upsert(
                { profile: profileKey, data: loaded, updated_at: stamp },
                { onConflict: "profile" },
              );
            loadedAt.current = stamp;
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

  // Reload the live row into local state — also the conflict-recovery path. Resets the optimistic-lock
  // token and clears dirty (local unsaved edits are intentionally dropped; we reload precisely to
  // replace stale local state with the authoritative row).
  const reload = useCallback(async () => {
    if (!supa) return;
    setSyncStatus("loading");
    const { data: row, error } = await supa
      .from(SUPABASE_TABLE)
      .select("data,updated_at")
      .eq("profile", profileKey)
      .maybeSingle();
    if (!error && row?.data) {
      latest.current = row.data as DashboardData;
      loadedAt.current = (row as { updated_at?: string }).updated_at ?? null;
      dirty.current = false;
      setData(row.data as DashboardData);
      setSyncStatus("live");
    } else {
      setSyncStatus("error");
    }
  }, [supa, profileKey]);

  // The actual persist (debounced path). OPTIMISTIC CONCURRENCY: the UPDATE is conditional on the
  // row's updated_at still matching what we loaded, so a STALE surface (a second tab / Couch-Clio
  // holding an old blob) can't clobber newer data — its write matches 0 rows and we reload instead of
  // overwriting. `dirty` clears only on confirmed success, version-guarded so a mid-save edit isn't lost.
  const commit = useCallback(async () => {
    if (!supa || !latest.current || !dirty.current) return;
    if (saveTimer.current) { clearTimeout(saveTimer.current); saveTimer.current = null; }
    // Writes need the owner session (anon is read-only). Keep `dirty` — after
    // sign-in the AuthGate onSuccess re-runs commit and the edit lands.
    if (!accessToken.current) {
      setSyncStatus("locked");
      setAuthNeeded(true);
      return;
    }
    const v = version.current;
    const stamp = new Date().toISOString();
    setSyncStatus("saving");
    try {
      let q = supa
        .from(SUPABASE_TABLE)
        .update({ data: latest.current, updated_at: stamp })
        .eq("profile", profileKey);
      if (loadedAt.current) q = q.eq("updated_at", loadedAt.current);
      const { data: rows, error } = await q.select("updated_at");
      if (error) throw error;
      if (!rows || rows.length === 0) {
        // The row changed under us (another surface wrote). Don't clobber — pull the fresh state.
        console.warn("Save conflict: row changed elsewhere; reloading instead of overwriting");
        await reload();
        return;
      }
      // Re-arm the lock token from the row's CANONICAL updated_at (DB format), so the next
      // conditional write matches exactly rather than relying on our generated ISO string.
      loadedAt.current = (rows[0] as { updated_at?: string }).updated_at ?? stamp;
      if (version.current === v) {
        dirty.current = false;
        setSyncStatus("live");
      } // else: a newer edit arrived mid-save — leave dirty; its debounce will persist it
    } catch (e) {
      console.error("Save failed", e);
      setSyncStatus("error"); // dirty stays true → retried by the next edit / flush
    }
  }, [supa, profileKey, reload]);

  // Land a pending edit synchronously when the page is hidden / refreshed / closed. The supabase-js
  // client's fetch is NOT keepalive, so a debounced (or in-flight) save is cancelled on unload — that
  // was the disc-edit rollback. A raw keepalive PATCH survives teardown (blob << ~64KB keepalive cap)
  // and is ALSO conditioned on updated_at, so a stale tab's unload-flush can't clobber newer data either.
  const flush = useCallback(() => {
    if (!supa || !latest.current || !dirty.current) return;
    // No owner session → the PATCH would bounce off RLS anyway; keep the edit
    // dirty so a later signed-in save (or the AuthGate flow) can land it.
    if (!accessToken.current) return;
    if (saveTimer.current) { clearTimeout(saveTimer.current); saveTimer.current = null; }
    dirty.current = false;
    const stamp = new Date().toISOString();
    const filter = `profile=eq.${encodeURIComponent(profileKey)}`
      + (loadedAt.current ? `&updated_at=eq.${encodeURIComponent(loadedAt.current)}` : "");
    try {
      fetch(`${SUPABASE_URL}/rest/v1/${SUPABASE_TABLE}?${filter}`, {
        method: "PATCH",
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${accessToken.current}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({ data: latest.current, updated_at: stamp }),
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

  const { agents, agentByName } = deriveAgents(data);

  return (
    <DataCtx.Provider
      value={{ data, agents, agentByName, syncStatus, update, updateAgent, reload }}
    >
      {children}
      <AuthGate
        open={authNeeded}
        onClose={() => setAuthNeeded(false)}
        onSuccess={() => {
          setAuthNeeded(false);
          void commit();
        }}
      />
    </DataCtx.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataCtx);
  if (!ctx) throw new Error("useData must be used inside <DataProvider>");
  return ctx;
}
