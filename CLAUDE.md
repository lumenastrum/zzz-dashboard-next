# ZZZ Dashboard "Random Play" — context for Claude / Clio

Next.js ZZZ dashboard, now on the **Random Play** design framework (a video store: agents = tapes on
the Rental Wall, builds = tape jackets with Specs / Scenes / Chapters, teams = Triple Features, Shiyu =
The Register, Deadly Assault = Now Showing, Signal = Channel Search, Cosmea's pulls = Staff Picks).
Random Play replaced the "Soundsystem" look on 2026-09-28. Sibling to `wuwa-dashboard-next`. The
**legacy** `../zzz-dashboard` (vanilla HTML + `zzz_update.py`) is SEPARATE — do not touch it.

## Random Play (the UI)
- **Vendored** at `src/random-play/` from `../random-play` (that repo holds the framework's docs,
  tokens pipeline, playground and tests; `src/random-play/VENDORED.md` records the sha). While that
  repo is alive, change the framework THERE and re-vendor with `npm run rp:vendor` (scrubs real names —
  this repo is public; only "A." and "Cosmea"). Assets ship in `public/rp/` (served at `/rp`).
- **One client stage**: `src/random-play-host/RandomPlayHost.tsx` hosts every route. Pages are static
  entry points that pass an `initial` view (`/teams/` → Triple Features, `/r/<slug>/` → that tape);
  after that the URL follows the store (`?tape=alice&tab=scenes`, `?view=shiyu&cycle=1`) via
  `router.replace`. The profile is the path prefix, as before (`/wife` → `wife-zzz`).
- **Live data**: `src/random-play-host/live.ts` grades the Supabase blob with `@/lib/grading` on every
  render (roster identity from `roster.ts`; endgame, setlists and picks from their TS sources; Signal
  from its own row). Skills/core still come from the vendored June showcase snapshot until they land
  in the blob.
- **Disc editing lives in the Scenes tab** (set / main on slots 4–6 / substat + roll steppers). The
  editor calls DataProvider's `updateAgent`, so it's the SAME session-gated, debounced,
  optimistic-locked save as the old deck; the whole wall re-grades in the same render. A main-stat
  swap also writes the +15 main value from `grading-config.discMains`.
- `TopNav` is gone from every route except `/wife/selector` (still Soundsystem, still styled by the
  old half of `globals.css`). The rest of the Soundsystem components/CSS are dead code awaiting
  deletion (random-play/docs/07-migration.md, step 7).
- **NEVER `next dev` on Andres's boxes** (Turbopack took the studio PC down, 2026-09-28). QA the real
  thing: `npm run build` then `py scripts/serve-out.py 8090` → `http://127.0.0.1:8090/zzz-dashboard-next/`.

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
