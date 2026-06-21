// One-off migration: undo the import refine off-by-one. Enka `Weapon.UpgradeLevel` is the
// 1-indexed W-engine refinement (1=R1 … 5=R5); the old import did `UpgradeLevel + 1`, inflating
// every R1 engine to R2 across the whole roster. This sets every stored "R2" refine back to "R1"
// in BOTH public/data.json (surgical text replace — no whole-file reformat) and the andres-zzz
// Supabase blob (the live source of truth the deck reads).
//
//   npx tsx scripts/fix-refine.ts            # dry run — report only
//   npx tsx scripts/fix-refine.ts --write    # apply to data.json + blob
import { promises as fs } from "fs";
import path from "path";
import { getSupabase, PROFILE_KEY, SUPABASE_TABLE } from "../src/lib/supabase";

async function main() {
  const write = process.argv.includes("--write");

  // 1) data.json — surgical text replace, keeps the file's existing formatting/diff minimal.
  const seedPath = path.join(process.cwd(), "public", "data.json");
  const raw = await fs.readFile(seedPath, "utf-8");
  const seedHits = (raw.match(/"refine": "R2"/g) || []).length;
  const nextRaw = raw.replace(/"refine": "R2"/g, '"refine": "R1"');
  console.log(`data.json: ${seedHits} "refine":"R2" → "R1"`);

  // 2) andres-zzz blob — parse, fix every wengine.refine that reads R2.
  const supa = getSupabase();
  if (!supa) throw new Error("No Supabase client (check env).");
  const { data: row, error } = await supa
    .from(SUPABASE_TABLE)
    .select("data")
    .eq("profile", PROFILE_KEY)
    .maybeSingle();
  if (error) throw error;
  const blob = row?.data as { agents?: { name: string; wengine?: { refine?: string } }[] } | undefined;
  const blobHits: string[] = [];
  if (blob?.agents) {
    for (const a of blob.agents) {
      if (a.wengine?.refine === "R2") {
        a.wengine.refine = "R1";
        blobHits.push(a.name);
      }
    }
  }
  console.log(`blob: ${blobHits.length} agents fixed${blobHits.length ? ` (${blobHits.join(", ")})` : ""}`);

  if (!write) {
    console.log("DRY RUN — pass --write to apply.");
    return;
  }
  await fs.writeFile(seedPath, nextRaw, "utf-8");
  if (blob) {
    const { error: upErr } = await supa
      .from(SUPABASE_TABLE)
      .upsert(
        { profile: PROFILE_KEY, data: blob, updated_at: new Date().toISOString() },
        { onConflict: "profile" },
      );
    if (upErr) throw upErr;
  }
  console.log("✓ Applied to data.json + Supabase blob.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
