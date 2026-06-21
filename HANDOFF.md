# ZZZ Dashboard Redesign — "Soundsystem" · Handoff

**Last updated:** 2026-06-20 · **Status:** deck ported + Supabase live + **full 25-agent roster** +
**Void Hunter tier** shipped (verified, committed `741d939`). Remaining: **disc builds** (only Alice
has one), real stat curves, other tabs, missing factions, GH remote, Python/tsx CLI.

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

## This repo (`Gacha Dashboards/zzz-dashboard-next/`)
```
src/app/            layout (wraps <DataProvider>) · page.tsx (roster home) · r/[name]/{page,client}.tsx
src/components/
  RosterTile.tsx      album tile: tall-portrait art + element/type/void-hunter corner badges
  deck/               AgentDeck (orchestrator) · Levels · EquipStack · TrackInspector · DeckFoot · DeckImg · Segs
src/lib/
  grading/            the engine (grading.js + grading-config.json + grading.d.ts + index.ts → GRADING_CONFIG)
  roster.ts           ROSTER (25 agents) + ALICE reference build + agentBySlug
  deck-config.ts      SET_CATALOG, CONE coords, MAINS/SUBSTATS, LEVEL_CFG, ELEMENT_COLOR, icon resolvers, elementGradient
  data-context.tsx    DataProvider (Supabase load→fallback→seed, debounced save), useData/updateAgent
  types.ts · supabase.ts · base-path.ts
scripts/  grade.ts (npm run grade) · seed.ts (npm run seed) · stage-assets.ts (npm run stage)
public/assets/  icons/ (element/type/faction/set/wengine/rank/equip_frame) · tall/ (portraits)
```
**Supabase source-of-truth map:** legacy `andres` / `wife` rows = roster METADATA only (the old vanilla
dashboard — no disc builds). NEW `andres-zzz` / `wife-zzz` rows = THIS dashboard's editable blob
(`{meta, agents[]}`; only Alice has a build so far). Don't touch the legacy `../zzz-dashboard` repo.

## DONE (2026-06-20)

**Commits:** `22d3c60` scaffold · `2f636f4` deck + Supabase + asset landscape · `741d939` Void Hunter tier + 25-agent roster.

- ✅ **Now Playing deck** ported 1:1 from Mockup C → `src/components/deck/`. Modal → **route per agent**
  (`/r/[slug]`: server `page.tsx` generateStaticParams + client `client.tsx` useData bridge). Editable
  disc inspector re-grades live; equip frame is an `<img>` (withBase) not CSS `url()` for GH Pages.
- ✅ **Supabase live** — `data-context.tsx`, WuWa pattern but **non-blocking**. `andres-zzz` row →
  `/data.json` seed → seeds Supabase; `updateAgent` → debounced 650ms save. Verified: live edit moved
  Slot 3 C→SSS / build 70.5%→80% / verdict retargeted, persisted across reload. Alice ATK 2,769.
- ✅ **Asset pipeline** — `npm run stage` (`stage-assets.ts`) copies+renames the seeded `../ZZZ *` art
  into `public/assets/{icons,tall}` with slug names; idempotent, re-run as art is added. All resolvers
  slug-based (element/type/faction/set/wengine). ~102 assets staged. **9 elements** incl. Frost/Auric
  Ink/Honed Edge; Auric Ink is GOLD (#e9b560).
- ✅ **Roster tiles** — element + type icon corner badges; art = tall portrait (square art only existed
  for 12). Faction icon wired on the deck plate (long names overflow a deck-top chip).
- ✅ **Void Hunter tier** (Miyabi · Yixuan · Ye Shunguang) — `RosterEntry` gained `faction/title/voidHunter`.
  Per-element gradient accent (`elementGradient` from sampled `ELEMENT_COLOR`) on tile vinyl/strip/title
  + deck title pill; white-masked void-hunter badge. Ye Shunguang title "Void Hunter: Qingming Arbiter".
- ✅ **AgentDeck handles build-less agents** — renders identity (header/turntable/title pill) from roster
  chrome with a `.nobuild-card` where the stack goes; `.tt` min-height keeps the portrait full. So every
  rostered agent has a real agent screen pre-build.
- ✅ **Full 25-agent roster** imported from the legacy `andres` Supabase row (REAL mindscapes), grouped
  by section, element corrections applied, accents = element colors, **12 canonical factions filled**
  (rest blank — see below). All 25 tiles render with art.
- ✅ Verified throughout: build + tsc + lint clean (**28 pages**), screenshot QA, Alice deck unregressed.

## Next steps (next session)

1. **Disc builds — the real unlock.** Only Alice has a build (Supabase had no disc data). Enter each
   agent's W-Engine + 6 discs (set/level/main/substats+rolls) into the `andres-zzz` blob → their deck
   grades live. Consider a `tsx` CLI (like WuWa's `scripts/update.ts`) `setdisc`/`swapdisc` to enter
   them headlessly. Fill `agentOverrides` for hybrids (Miyabi crit-anom, etc.).
2. **Missing factions (11)** — Vivian, Aria, Velina, Seed, Cissia, Dialyn, Nangong Yu, Lucia, Sunna,
   Zhao, Yidhari left blank (uncertain/newer agents). Andres to provide; one-line edits in `roster.ts`.
3. **Real stat data** — replace calibrated `agent.base` + `rollValues` with exact ZZZ base-stat curves +
   real W-Engine values; refine `LEVEL_CFG` full/target. (Per-archetype LEVEL_CFG when non-anomaly builds land.)
4. **Other tabs** — wire the home faceplate tabs (Levels / Teams / Pulls) to real routes + build them.
5. **GitHub remote + Pages** — add remote, copy WuWa's `.github/workflows/pages.yml`, push.
   `basePath`/`assetPrefix` already set to `/zzz-dashboard-next`.
6. **Stretch:** conditional effect toggles ("in rotation" switch for Fanged/Phaethon 4pc); Zhao tall
   portrait has no current source (orphan staged copy in use — re-seed if a real one arrives).

## How to run
- **App:** `npm run dev` → http://localhost:3000 → click an agent → `/r/<slug>/` (the deck).
- `npm run build` static export (`out/`) · `npm run grade` headless Alice grade · `npm run seed`
  regenerate `public/data.json` from ALICE · `npm run stage` (re)copy seeded art into `public/assets/`.
- **Reference prototype:** `cd ../zzz-redesign-mockups` → `View Mockups.bat`, open `c-soundsystem.html`.
