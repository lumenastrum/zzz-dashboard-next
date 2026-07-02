# ZZZ Dashboard "Soundsystem" — context for Claude / Clio

Next.js rebuild of the ZZZ dashboard, **"Soundsystem"** direction (hi-fi/vinyl; discs = records,
equipment = speaker stack). Sibling to `wuwa-dashboard-next`. The **legacy** `../zzz-dashboard`
(vanilla HTML + `zzz_update.py`) is SEPARATE — do not touch it; this repo is the modern replacement.

## Stack & conventions (match wuwa-dashboard-next)
- Next 16, App Router, `output: "export"` (static → `out/`, GH Pages via `basePath`). React 19, TS,
  Tailwind v4 (`@tailwindcss/postcss`), `tsx` for `scripts/`.
- `@/*` → `src/*`. Plain `<img>`/`fetch` paths need `withBase()` (base-path.ts) for prod prefixing.
- Supabase: shared `dashboard_profiles` table, **new** profile rows `andres-zzz` / `wife-zzz` so the
  legacy `andres`/`wife` ZZZ rows are untouched. Anon key public by design.

## The grading engine (`src/lib/grading/`)
- `grading.js` is the **single source of truth**, validated, framework-agnostic ESM. Don't fork it —
  import from `@/lib/grading` (typed via `grading.d.ts`). `GRADING_CONFIG` = the parsed JSON.
- `gradeBuild(agent, cfg)` → per-disc letters (SSS…E) + build % + suggestions.
- `computeStats(agent, cfg)` → Sheet vs Effective per stat + combat buffs.
- `swapDiscSet(agent, slot, set, cfg)` → disc-swap + regrade.
- Weights/scale/effects all live in `grading-config.json` — tune there, the app re-grades.

## Grading model (see docs/ + ../zzz-redesign-mockups/grading/GRADING_SPEC.md)
- Per-disc: `mainPts + Σ(rolls × weight)` → % → letter. Weights per **archetype** (from `section`),
  agent overrides allowed. Slot 4/5 **partner boost** (off-main stat → 4.25).
- Sheet vs Effective: effects tagged `scope: sheet|combat`, `kind: stat|dmg|buildup`. Combat stat mods
  only show in Effective; dmg/buildup are buff chips.
- Stat base numbers are **calibrated/illustrative** (atkPool 880 → ATK≈2769) — refine to exact ZZZ later.

## Where things are
- Full interactive reference UI: `../zzz-redesign-mockups/c-soundsystem.html` (the look/feel spec).
- `HANDOFF.md` — status + numbered next steps. Read first when resuming.
- `npm run peek` — read-only CLI over everything (roster/agent/shiyu/assault/blob/profiles,
  `--json`, `--profile`). Curl recipes for no-clone access: `docs/couch-clio-data-access.md`.
- `npm run build` auto-runs `export-endgame.ts` (prebuild) → publishes `data/shiyu.json` +
  `data/assault.json` on GH Pages (gitignored locally; endgame truth stays in the TS source).

## Gotchas
- Static export: no server-side Supabase at request time — data loads client-side (port the WuWa
  DataProvider pattern when wiring Supabase).
- `grading.js` is excluded from eslint (it's shared validated JS); edit logic there, types in `grading.d.ts`.
- Don't commit `Co-Authored-By` if deploying on Vercel free tier? (WuWa note — confirm before pushing.)
