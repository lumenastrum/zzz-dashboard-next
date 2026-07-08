// Merge fields from a JSON file into ONE agent inside a profile's Supabase blob.
//
//   npm run patch-agent -- --agent sunna --profile wife-zzz --file patch.json           # dry run
//   npm run patch-agent -- --agent sunna --profile wife-zzz --file patch.json --write   # push
//
// The patch file is a partial Agent object — top-level fields replace wholesale
// (mainStats, base, level, wengine, ...), everything else on the agent is untouched.
// This is the tool for the documented finalize flow (feed real mainStats from a
// character-screen shot now, PATCH the back-solved base later) that used to be
// ad-hoc Node fetches with the anon key — dead since the 2026-07-07 RLS lockdown.
//
// Same safety rails as clone-agent.ts: service key, dry-run by default, and an
// optimistic-concurrency guard on updated_at (a mid-flight browser save aborts the
// write — re-run). Run with no live deck open on the target profile regardless.
import { readFileSync } from "node:fs";
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
  const profile = arg("profile");
  const file = arg("file");
  const write = process.argv.includes("--write");
  if (!agentArg || !profile || !file) {
    throw new Error("Usage: --agent <name|slug> --profile <profile> --file <patch.json> [--write]");
  }

  const patch = JSON.parse(readFileSync(file, "utf8")) as Partial<Agent>;
  const fields = Object.keys(patch);
  if (!fields.length) throw new Error(`${file} is an empty patch.`);
  if ("name" in patch) throw new Error("Refusing to patch `name` — that's the agent's identity key.");

  const bySlug = ROSTER.find((r) => r.slug === agentArg.toLowerCase());
  const agentName = bySlug?.name ?? agentArg;

  const supa = createClient(SUPABASE_URL, serviceKey());
  const { data: row, error: loadErr } = await supa
    .from(SUPABASE_TABLE)
    .select("data, updated_at")
    .eq("profile", profile)
    .maybeSingle();
  if (loadErr) throw loadErr;
  if (!row) throw new Error(`No "${profile}" row in ${SUPABASE_TABLE}.`);

  const blob = row.data as DashboardData;
  const idx = blob.agents.findIndex((a) => a.name === agentName);
  if (idx === -1) {
    throw new Error(`"${agentName}" not in ${profile} (names: ${blob.agents.map((a) => a.name).join(", ")})`);
  }

  const before = blob.agents[idx];
  const after: Agent = { ...before, ...patch };
  const next: DashboardData = {
    ...blob,
    meta: { ...blob.meta, updated: new Date().toISOString().slice(0, 10) },
    agents: blob.agents.map((a, i) => (i === idx ? after : a)),
  };

  console.log(`\n● patch ${agentName} @ ${profile} ← ${file}`);
  for (const f of fields) {
    const fmt = (v: unknown) => {
      const s = JSON.stringify(v);
      return s && s.length > 72 ? s.slice(0, 69) + "…" : s;
    };
    console.log(`  ${f}: ${fmt((before as Record<string, unknown>)[f])}\n  ${" ".repeat(f.length)}→ ${fmt((patch as Record<string, unknown>)[f])}`);
  }
  console.log(`  (updated_at lock ${row.updated_at})`);

  if (!write) {
    console.log(`\nDRY RUN — pass --write to patch ${profile}.\n`);
    return;
  }

  const { data: updated, error } = await supa
    .from(SUPABASE_TABLE)
    .update({ data: next, updated_at: new Date().toISOString() })
    .eq("profile", profile)
    .eq("updated_at", row.updated_at)
    .select("profile");
  if (error) throw error;
  if (!updated?.length) {
    throw new Error(`CONFLICT: ${profile} changed since read (browser save mid-flight?). Nothing written — re-run.`);
  }
  console.log(`\n✓ ${agentName} patched (${fields.join(", ")}).\n`);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
