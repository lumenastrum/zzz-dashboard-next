# ZZZ Dashboard Redesign — "Soundsystem" · Handoff

**Last updated:** 2026-06-20 · **Status:** Next.js repo scaffolded; **Now Playing deck ported +
Supabase wired live** (verified end-to-end). Remaining: real stat curves, other tabs, Python CLI, GH remote.

---

## The vision

A ground-up redesign of Andres's ZZZ roster/stat dashboard, **deliberately distinct from the WuWa
dashboard**. Direction chosen: **"Soundsystem"** — New Eridu hi-fi/vinyl identity. Disc drives ARE
records, the equipment screen IS a speaker stack, stats read as VU meters, the agent sheet is a
"Now Playing" deck. The headline feature is **disc-drive grading** (like we grade WuWa echoes), with
a click-to-inspect modal that grades each disc, swaps sets, edits substats, and shows Sheet vs
Effective stats — all live.

Three directions were mocked; **C (Soundsystem) won**. A ("After Dark", dark glass) and B ("Hollow
Arcade", paper/hazard) are kept for reference.

---

## Where the work lives (`Claude Space/zzz-redesign-mockups/`)

```
a-after-dark.html        Mockup A (reference, not chosen)
b-hollow-arcade.html     Mockup B (reference, not chosen)
c-soundsystem.html       ★ Mockup C — the chosen design, LIVE + engine-wired + editable
View Mockups.bat         double-click → serves on :8091, opens C
assets/                  staged Alice art: tall portrait, roster portraits, icons (rank/type/element/
                         faction/w-engine/disc-sets), equip_frame.webp (the real in-game disc frame), coin_S
grading/                 the grading + stats engine (framework-agnostic ESM)
  grading.js               pure engine: gradeDisc / gradeBuild / computeSets / swapDiscSet / computeStats
  grading-config.json      OUR archetype weight tables, SSS…E scale, rollValues, setEffects (all data-driven)
  demo.mjs                 node smoke test for grading
  GRADING_SPEC.md          schema + Supabase + CLI + real-time data flow
  package.json             {"type":"module"} so node treats .js as ESM
research/
  interknot-grading-decoded.md   how interknot-network.com grades (reverse-engineered, see below)
  interknot_api_foxed.network-response   raw 273KB API payload for UID 1001327696
```

Source art for new ZZZ icons (faction/element/disc/w-engine/frame/tall portraits) is in
`Claude Space/Gacha Dashboards/ZZZ *` folders. Legacy dashboard (DO NOT TOUCH, keep separate) is
`Claude Space/Gacha Dashboards/zzz-dashboard/` (vanilla HTML + Supabase, `zzz_update.py` CLI).

---

## What's built & validated

### Mockup C (`c-soundsystem.html`) — fully interactive
- **"Now Playing" deck modal** for Alice Thymefield (S / Anomaly / Physical / Spook Shack / M1).
- **Real in-game equipment frame** (`equip_frame.webp`) with the actual disc-set icons seated in the
  6 cones (Fanged Metal red ×4, Phaethon's Melody purple ×2), W-Engine sphere in the center recess,
  S-coin + Lv labels — looks exactly in-game, then our audit layer painted on top.
- **Per-disc grade chips** (SSS…E) on each cone; click a cone → the EQ-style inspector retunes.
- **Live editing:** per-substat stat dropdown + roll steppers (−/+), main-stat dropdown (slots 4–6),
  set-swap dropdown. Every edit re-grades instantly.
- **Master gauge** (build %/letter, conic gradient) + **verdict** (weakest-disc re-roll, set warnings).
- **Sheet vs Effective LEVELS:** ATK / Anomaly Proficiency / Anomaly Mastery shown as VU meters with
  Sheet→Effective (ghost segments for combat-only buffs), target notches, and source labels.
- **Effects surfaced:** W-Engine passive line on the cartridge card; set 2pc/4pc effect blurbs on the
  pills; combat-buff chips (DMG%/Buildup) that never touch the sheet.

Verified live (through real UI controls, not faked): editing a substat moved Slot 3 C→A and the build
71%→76.2% with the re-roll suggestion auto-retargeting; swapping Slot 6's set broke the 2pc bonus and
the verdict warned; changing Slot 6's main to Anomaly Mastery moved AM sheet 195→287.

### The engine (`grading/grading.js`) — pure, framework-agnostic
- `gradeBuild(agent, cfg)` → per-disc `{letter,color,pct,subs}`, `sets.active`, `buildLetter/Pct`,
  `suggestions`.
- `computeStats(agent, cfg)` → per-stat `{sheet, combat, effective, sources}` + `buffs` + `sets`.
- `swapDiscSet`, `gradeDisc`, `computeSets` exported too. No IO — caller injects parsed config, so the
  same module powers the browser UI today and the Python-free CLI / a Node runner later.

### Grading model (ours, informed by interknot — see research)
```
discScore = mainStatPoints × mainWeightMultiplier + Σ subs(rolls × weight)
pct = clamp(discScore / idealForSlot × 100) → letter (SSS≥92.5 … E)
```
- Weights are **per-archetype** (anomaly/attack/stun/support), from the agent's `section`, with
  per-agent overrides. Editable in `grading-config.json`.
- **Partner boost:** on slots 4/5 the partner of the chosen main (ATK%⇄AP, CR⇄CD) jumps to 4.25.
- **Sheet vs Effective:** effects tagged `scope: sheet|combat` and `kind: stat|dmg|buildup`. Sheet stat
  mods fold into the character-screen number; combat stat mods only appear in Effective; dmg/buildup
  become chips. Driven by `setEffects` + the agent's `wengine.passive`.

---

## What we learned from interknot-network.com (research/)
Reverse-engineered its live API. **Two-layer system:** (1) per-disc letter grade = weighted-substat-roll
(per-agent/per-slot weights, partner boost, roll count = Enka `PropertyLevel`); (2) overall agent rank
= full DPS-sim percentile ("TOP x%"). We **adopt layer 1** with our own weights and the SSS…E scale
(Andres's call — "a little vanity doesn't hurt"); we **skip the DPS sim** and use an honest build-% +
re-roll verdict instead.

---

## Decisions locked
- Direction: **Soundsystem (C)**.
- Grade scale: **SSS · SS · S · A · B · C · D · E** (mirrors interknot).
- Weights: **our own archetype tables**, hand-tunable per agent.
- Discs are **swappable** (per-piece `set`), **editable**, **live-regrading**, **Supabase-persisted**.
- Stats show **Sheet vs Effective**; combat-only buffs (W-Engine passive, set bonuses) surfaced.
- Keep the **legacy `zzz-dashboard` repo separate**; this becomes its own project/repo (parallel to
  `wuwa-dashboard-next`).

---

## DONE (2026-06-20 — this session)

- ✅ **Stack decision:** Next.js (matches WuWa). Modal → **route per agent** (`/r/[slug]`), since the
  scaffold + WuWa both use routes (deep-linkable, static-export-friendly). Deck *visual* is 1:1 with C.
- ✅ **Engine ported** earlier (scaffold): `src/lib/grading/` imported as `@/lib/grading`.
- ✅ **Deck ported** → `src/components/deck/` (`AgentDeck` orchestrator + `Levels` · `EquipStack` ·
  `TrackInspector` · `DeckFoot` + `DeckImg`/`Segs`). Presentation maps in `src/lib/deck-config.ts`
  (SET_META, CONE coords, MAINS/SUBSTATS, LEVEL_CFG, icon resolvers). Equipment frame is an `<img>`,
  not a CSS `url()`, so `withBase()` prefixes it for GH Pages.
- ✅ **Supabase wired live** — `src/lib/data-context.tsx` (WuWa pattern, but **non-blocking** so the
  static roster home doesn't wait on the fetch). Loads row `andres-zzz` → falls back to `/data.json`
  seed → seeds Supabase. `updateAgent(name, mutator)` → debounced save (650ms). Seed generated from
  `ALICE` via `npm run seed` → `public/data.json`. Layout wraps `<DataProvider>`; `/r/[name]` split
  into server `page.tsx` (generateStaticParams from ROSTER) + client `client.tsx` (useData bridge).
- ✅ **Verified end-to-end:** `npm run build` clean (12 agent pages), lint clean, 0 console errors,
  21/21 deck images load. Live edit through real controls moved Slot 3 **C 43.3% → SSS 100%**, build
  **70.5% A → 80% S**, verdict auto-retargeted to Slot 6; reload re-loads the saved build from Supabase
  (then reverted to pristine). ATK reads 2,769 / AP 300→345 / AM 195→255 — matches the engine exactly.

## Next steps (next session)

1. **Real stat data** — replace the calibrated base/W-Engine numbers (`agent.base` atkPool/AP/AM +
   `rollValues` in grading-config) with exact ZZZ base-stat curves + real W-Engine passive values;
   map Enka `PropertyId` → stat keys if we ever auto-import from a UID. Refine `LEVEL_CFG` full/target.
2. **Roster + other tabs** — wire the home faceplate tabs (Levels / Teams / Pulls) to real routes;
   build Stat Audit / Teams / Pulls in the new shell. Home roster is still static `ROSTER` chrome.
3. **More agent builds** — only Alice has a full build. Enter the rest (they show a "build not entered"
   state until their `discs.pieces` land in the Supabase blob). Fill `agentOverrides` for hybrids
   (Miyabi crit-anom, etc.).
4. **Port `gradeBuild`/`computeStats` to Python** for `zzz_update.py` (`grade`/`setdisc`/`swapdisc`) so
   the CLI matches the dashboard headless — OR build a `tsx` CLI like WuWa's `scripts/update.ts`.
5. **GitHub remote + Pages** — add the remote, `.github/workflows/pages.yml` (copy WuWa's), push.
   `basePath`/`assetPrefix` already set to `/zzz-dashboard-next`.
6. **Conditional effect toggles** (stretch) — "in rotation" switch so Fanged 4pc / Phaethon 4pc
   conditional buffs flip Effective on/off.

## How to run
- **App:** `npm run dev` → http://localhost:3000 → roster → click Alice → `/r/alice/` (the deck).
  `npm run build` for static export; `npm run grade` headless; `npm run seed` to regenerate data.json.
- **Reference prototype:** `cd ../zzz-redesign-mockups` → `View Mockups.bat`, open `c-soundsystem.html`.
