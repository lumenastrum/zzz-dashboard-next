// Clone ONE agent's build from one profile's Supabase blob into another — append-only.
//
//   npm run clone-agent -- --agent sunna --to wife-zzz             # dry run
//   npm run clone-agent -- --agent sunna --to wife-zzz --write     # push to Supabase
//
// This is the surgical sibling of seed-profile.ts: seed-profile OVERWRITES the whole
// target blob (fine for bootstrap, catastrophic once the target holds hand-entered
// builds — Cosmea's discs + back-solved bases live only in Supabase). This script
// reads the target blob, appends a deep-clone of the source agent, bumps meta, and
// writes back with an optimistic-concurrency guard (conditional on the row's
// updated_at, mirroring the browser's commit()), so a mid-flight browser save can't
// be clobbered — on a conflict it aborts and you just re-run.
//
// Exists because Cosmea pulling an agent A. already owns is a recurring event
// (first use: Sunna + signature, 2026-07-08). The cloned build is an editable
// PLACEHOLDER — her real discs/stats replace it in-app or via a stats feed.
//
// Writes ride the service key (scripts/service-key.ts) since the RLS lockdown.
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_TABLE } from "../src/lib/supabase";
import { ROSTER } from "../src/lib/roster";
import type { Agent, DashboardData } from "../src/lib/types";
import { serviceKey } from "./service-key";

function arg(name: string, fallback?: string): string | undefined {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  if (hit) return hit.slice(`--${name}=`.length);
  const idx = process.argv.indexOf(`--${name}`);
  if (idx !== -1 && process.argv[idx + 1] && !process.argv[idx + 1].startsWith("--")) {
    return process.argv[idx + 1];
  }
  return fallback;
}

async function main() {
  const agentArg = arg("agent");
  const from = arg("from", "andres-zzz")!;
  const to = arg("to")!;
  const write = process.argv.includes("--write");
  if (!agentArg || !to) throw new Error("Usage: --agent <name|slug> --to <profile> [--from andres-zzz] [--write]");

  // Accept a roster slug or an exact agent name.
  const bySlug = ROSTER.find((r) => r.slug === agentArg.toLowerCase());
  const agentName = bySlug?.name ?? agentArg;

  const supa = createClient(SUPABASE_URL, serviceKey());

  const load = async (profile: string) => {
    const { data: row, error } = await supa
      .from(SUPABASE_TABLE)
      .select("data, updated_at")
      .eq("profile", profile)
      .maybeSingle();
    if (error) throw error;
    if (!row) throw new Error(`No "${profile}" row in ${SUPABASE_TABLE}.`);
    return { blob: row.data as DashboardData, updatedAt: row.updated_at as string };
  };

  const src = await load(from);
  const tgt = await load(to);

  const source = src.blob.agents.find((a) => a.name === agentName);
  if (!source) throw new Error(`"${agentName}" has no build in ${from} (names: ${src.blob.agents.map((a) => a.name).join(", ")})`);
  if (tgt.blob.agents.some((a) => a.name === agentName)) {
    throw new Error(`"${agentName}" is already in ${to} — this script is append-only. Edit in-app or patch directly.`);
  }

  const clone: Agent = JSON.parse(JSON.stringify(source));
  const next: DashboardData = {
    ...tgt.blob,
    meta: {
      ...tgt.blob.meta,
      updated: new Date().toISOString().slice(0, 10),
      totalAgents: tgt.blob.agents.length + 1,
    },
    agents: [...tgt.blob.agents, clone],
  };

  const we = clone.wengine ? `${clone.wengine.name} ${clone.wengine.rank ?? "S"}·${clone.wengine.refine ?? "R1"}` : "(none)";
  const sets = [...new Set(clone.discs?.pieces?.map((p) => p.set) ?? [])].join(" + ") || "(no discs)";
  console.log(`\n● clone ${agentName}: ${from} → ${to}`);
  console.log(`  engine: ${we}`);
  console.log(`  discs:  ${sets}`);
  console.log(`  target: ${tgt.blob.agents.length} agents → ${next.agents.length} (updated_at lock ${tgt.updatedAt})`);

  if (!write) {
    console.log(`\nDRY RUN — pass --write to append to ${to}.\n`);
    return;
  }

  // Conditional update — 0 rows matched ⇒ someone wrote between our read and now.
  const { data: updated, error } = await supa
    .from(SUPABASE_TABLE)
    .update({ data: next, updated_at: new Date().toISOString() })
    .eq("profile", to)
    .eq("updated_at", tgt.updatedAt)
    .select("profile");
  if (error) throw error;
  if (!updated?.length) {
    throw new Error(`CONFLICT: ${to} changed since read (browser save mid-flight?). Nothing written — re-run.`);
  }
  console.log(`\n✓ ${agentName} appended to ${to} (${next.agents.length} agents).\n`);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
