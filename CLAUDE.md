# ZZZ Dashboard "Soundsystem" — context for Claude / Clio

Next.js rebuild of the ZZZ dashboard, **"Soundsystem"** direction (hi-fi/vinyl; discs = records,
equipment = speaker stack). Sibling to `wuwa-dashboard-next`. The **legacy** `../zzz-dashboard`
(vanilla HTML + `zzz_update.py`) is SEPARATE — do not touch it; this repo is the modern replacement.

## Stack & conventions (match wuwa-dashboard-next)
- `@/*` → `src/*`. Plain `<img>`/`fetch` paths need `withBase()` (base-path.ts) for prod prefixing.
- Supabase: shared `dashboard_profiles` table, **new** profile rows `andres-zzz` / `wife-zzz` so the
  legacy `andres`/`wife` ZZZ rows are untouched. Anon key public by design — but **read-only since
  the 2026-07-07 RLS lockdown**: writes need the owner's session. The always-on disc/roll controls
  still edit local state for anyone, but `commit()` gates on a session — no session → syncStatus
  `"locked"` + `<AuthGate>` sign-in overlay (`src/components/auth-gate.tsx`), which resumes the save
  on success. The unload `flush()` PATCH rides the session JWT (mirrored in `accessToken` ref), not
  the anon key, and skips (keeping `dirty`) when signed out.

## The grading engine (`src/lib/grading/`)
- `grading.js` is the **single source of truth**, validated, framework-agnostic ESM. Don't fork it —
  import from `@/lib/grading` (typed via `grading.d.ts`). `GRADING_CONFIG` = the parsed JSON.
  Edit logic there, types in `grading.d.ts`.
- Weights/scale/effects all live in `grading-config.json` — tune there, the app re-grades.

## Grading model (see docs/ + ../zzz-redesign-mockups/grading/GRADING_SPEC.md)
- Per-disc: `mainPts + Σ(rolls × weight)` → % → letter. Weights per **archetype** (from `section`),
  agent overrides allowed. Slot 4/5 **partner boost** (off-main stat → 4.25).
- Sheet vs Effective: effects tagged `scope: sheet|combat`, `kind: stat|dmg|buildup`. Combat stat mods
  only show in Effective; dmg/buildup are buff chips.
- Stat base numbers are **calibrated/illustrative** (atkPool 880 → ATK≈2769) — refine to exact ZZZ later.

## Signal Search (gacha pull) archive
- **Sync:** `npm run signal` — open Signal Search **history in-game first** (the authed getGachaLog
  URL lands in the Steam install's webcache, authkey ~24h). Pages every channel and union-merges
  **by record id** (never deletes) into the `andres-zzz-pulls` Supabase row; Hoyo serves a rolling
  ~6-month window, the archive outlives it. `--dry` previews, `--url`/`--cache` override discovery,
  `--graft <file>` imports a historical export (master fixture or a raw zzz.rng.moe backup).
- **Surface:** `/signal` (A.-only tab; Cosmea's Pulls tab is the wishlist). Read-only via anon key;
  the CLI is the sole writer. Analytics (pity walks, 50/50 state machine) live in
  `src/lib/signal-analytics.ts` — the standard-pool sets in `signal-types.ts` were validated
  exactly against rng.moe's lifetime counters; keep them current when Hoyo adds standard agents.
- `scripts/signal-names.json` = item_id→name for records that aged out of the API unnamed
  (built from Enka's store; 12 old bangboo ids remain unnamed — cosmetic only).
  `scripts/fixtures/signal-*.json` are **gitignored on purpose** (private account data).

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
- Don't commit `Co-Authored-By` if deploying on Vercel free tier? (WuWa note — confirm before pushing.)
