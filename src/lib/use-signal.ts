"use client";

import { useEffect, useState } from "react";
import { getSupabase, SUPABASE_TABLE } from "./supabase";
import {
  SIGNAL_PROFILE_KEY,
  emptySignalStore,
  type SignalStore,
} from "./signal-types";
import { summarize, type SignalSummary } from "./signal-analytics";

export type SignalStatus = "loading" | "ready" | "empty" | "error";

/**
 * Read-only loader for the signal archive (`andres-zzz-pulls` row). The row is
 * written exclusively by the `npm run signal` CLI — never from the browser —
 * so this fetches once on mount. Deliberately independent of DataProvider: the
 * multi-thousand-record archive must not ride the roster's auto-save.
 */
export function useSignal() {
  const [store, setStore] = useState<SignalStore | null>(null);
  const [status, setStatus] = useState<SignalStatus>("loading");

  useEffect(() => {
    let mounted = true;
    const supa = getSupabase();
    (async () => {
      if (!supa) {
        if (mounted) setStatus("error");
        return;
      }
      const { data: row, error } = await supa
        .from(SUPABASE_TABLE)
        .select("data")
        .eq("profile", SIGNAL_PROFILE_KEY)
        .maybeSingle();
      if (!mounted) return;
      if (error) {
        console.error("Signal archive load failed", error);
        setStatus("error");
        return;
      }
      if (!row?.data) {
        setStore(emptySignalStore());
        setStatus("empty");
        return;
      }
      setStore(row.data as SignalStore);
      setStatus("ready");
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const summary: SignalSummary | null = store ? summarize(store) : null;
  return { store, summary, status };
}
