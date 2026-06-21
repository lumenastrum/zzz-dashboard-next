# ZZZ Dashboard Redesign — "Soundsystem" · Handoff

**Last updated:** 2026-06-20 · **Status:** deck + Supabase + 25-agent roster + Void Hunter tier shipped;
**Enka disc-build importer live (24 of 25 agents have real builds)** + **face-framed roster tiles** done
this session. Remaining: only **Zhao** buildless (one more showcase pull), grade calibration, real stat
curves, anomaly-only Levels panel, other tabs, GH remote.

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

## DONE — session 2 (2026-06-20): Enka import + face-framed tiles

- ✅ **Enka disc-build importer** (`npm run import` · `scripts/import-enka.ts`). Decodes an Enka/interknot
  showcase payload → our `discs.pieces` schema → merges into the `andres-zzz` blob + `data.json` (prunes
  blob to roster). Live pull: `curl -A <browser UA> "https://interknot-network.com/api/api.php?uid=<UID>&version=1.1"`
  (Cloudflare clears with a browser UA), save to `scripts/fixtures/`, `npm run import -- --file=… --write`.
  Maps anchored to **canonical Enka data** (avatars.json + EN loc), not guesses — `PROP`/`SUIT`/`AVATAR`/
  `WENGINE_OVERRIDE` maps in the script. Decode model: substat `PropertyValue` = per-roll increment;
  `PropertyLevel` = roll count; main display value = raw × 4 (percent stats ÷100); `EquipId[0:3]+"00"` = suit id.
- ✅ **24 of 25 agents have real builds** (4 showcase pulls of 6 — the in-game showcase caps at 6). Only
  **Zhao** is left. Grades + sets + W-engines all live. `Yidhari` got an `agentOverrides` entry (attack +
  HP% 3.0, like Yixuan). PropertyId `12202` = Impact (stun slot-6 main).
- ⚠️ **Roster fix: Nangong Yu was Stun → corrected to Anomaly** — her real gear is pure anomaly (AP + AM
  mains, Phaethon + Freedom Blues, Ether DMG); no stun agent runs AP/AM mains. The roster section drives the
  grading archetype, so a wrong section grades the build on the wrong weights.
- ⚠️ **Enka codename ≠ our name + verify every avatar id (don't trust signature-engine guesses):** `1261`=Jane
  Doe (NOT Alice — `1401` is Alice), `1431` "Zhenzhen"=Ye Shunguang, `1091` "Unagi"=Miyabi, `1381`
  "SilverAnby"=Soldier 0 Anby. Enka also corrected a Ju Fufu/Lighter mixup I'd guessed from W-engines. New
  agents (Velina `1561`, Seed `1461`, Sunna `1491`, Lucia `1451`, Nangong Yu `1511`) aren't in Enka's
  avatars.json yet — ID via theorycraft (`y`) keys + element/mindscape/build profile (crit-rolls vs support).
- ✅ **Face-framed roster tiles.** Tiles cover-fit whole sprites → squished; now a bust crop. `npm run frames`
  (`scripts/measure-frames.py`) measures each sprite's **alpha silhouette** → `{top,left,height}` in
  `src/lib/portrait-frames.ts`; `RosterTile` renders a height-driven `<img.pf>` (`width:auto;max-width:none`
  beats Tailwind's preflight clamp), per-agent positioned. Composition outliers (Miyabi's wolf companion)
  hand-framed via the `OVERRIDES` map in the script.
- ✅ **`ZOOM` + `NUDGE` art-direction layer** in `RosterTile.tsx` — global zoom (currently 1.5625) + per-agent
  `{dx,dy,dz}` nudges, hand-tuned with Andres ("boyfriend-eyeball pass"). `HOLD = 1/1.4` pins agents out of
  a global zoom round. This is the human-tuned layer; `portrait-frames.ts` is the regenerable measured layer.
- ✅ **Deck portrait squish fixed** (`globals.css .tt .pimg`: `width:auto; max-width:none`) — same Tailwind
  preflight `max-width:100%` clamp bug as the WuWa tall portraits.
- ✅ **Void Hunter titles**: Miyabi "Void Hunter: Isshin Muga", Yixuan "Grandmaster" (custom variant title).
- ✅ Verified live: Miyabi/Velina/Yixuan/Ye Shunguang decks + full roster grid, zero console errors.

## Next steps (next session)

1. **Last agent's build (Zhao)** — showcase Zhao + re-pull live,
   `npm run import -- --file=… --write`. New avatar ids → add to the `AVATAR` map (+ `SUIT` names / `WENGINE_OVERRIDE`
   as new sets/engines surface). Fill `agentOverrides` for any hybrids.
2. **Grade calibration** (Andres's call, pinned as final polish) — the scale reads harsh (benchmarks vs a
   theoretically perfect disc, so good builds land C/B). Decide interknot-lenient vs honest vs in-between.
3. **Real stat data** — exact ZZZ base-stat curves + W-Engine values; **per-archetype `LEVEL_CFG`** (the Levels
   panel is anomaly-only, so crit/HP agents show AP/AM 0). Map W-engine passives for the Sheet/Effective buffs.
4. **Other tabs** — wire the home faceplate tabs (Levels / Teams / Pulls) to real routes + build them.
5. **Remaining factions** — a few still blank in `roster.ts` (one-line edits as Andres provides).
6. **GitHub remote + Pages** — add remote, copy WuWa's `.github/workflows/pages.yml`, push.
   `basePath`/`assetPrefix` already set to `/zzz-dashboard-next`.

## How to run
- **App:** `npm run dev` → http://localhost:3000 → click an agent → `/r/<slug>/` (the deck).
- `npm run import [-- --file=… --write]` import builds from an Enka showcase payload · `npm run frames` re-measure
  face crops · `npm run build` static export · `npm run grade` headless grade · `npm run stage` (re)copy art.
- **Reference prototype:** `cd ../zzz-redesign-mockups` → `View Mockups.bat`, open `c-soundsystem.html`.
