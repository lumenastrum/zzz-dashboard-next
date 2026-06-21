# ZZZ Dashboard Redesign — "Soundsystem" · Handoff

**Last updated:** 2026-06-21 (session 7 — DISC-SET COVERAGE + SET-SWAP RECOMPUTE) · master @ `c8ce305`+1, GH Pages deploying.
**Status:** deck + Supabase + 25-agent roster + Enka builds + full calibration + **live stat recompute (now incl. SET-swaps)** + all 24 W-engine cartridges + **all 18 disc sets (2pc+4pc) accounted for & reflected**.

**★ LIVE STAT RECOMPUTE (the headline) — VALIDATED AGAINST THE ACTUAL GAME, DEPLOYED.** The deck is no longer a
snapshot: editing a disc recomputes the character screen AND the goalpost meters live, on ZZZ's real stat formulas
(reverse-engineered from scratch — `docs/stat-formulas.md`). `computeSheet` recomputes from a back-solved `agent.base`
+ current discs: ATK `(base+WE)·(1+Σ%)+flat`; **AM is `base·(1+AM%)`** (percentage, NOT flat — this was a bug); Sheer
Force `0.3·ATK + 0.1·HP`; CR/CDMG additive off innate 5%/50%. `scripts/derive-bases.mjs` (`npm run derive-bases`)
back-solves every agent's hidden base from their seed — proven correct because base CRIT falls out to exactly 5.0%,
base CDMG to 50.0%, and Miyabi's base CR = 5 + 24 (her engine). `base` lives on the andres-zzz blob.
**CROSS-CHECKED VS ANDRES'S LIVE GAME SCREEN: recomputed Yuzuha matched in-game exactly** as he edited her discs
(Anomaly Prof 129 → 147 → 156, exactly +9 per AP roll). Disc roll badge now shows the in-game upgrade count (rolls-1;
base = +0). **Known v1 limit:** set-swaps don't retro-adjust the few sheet-scope set stats folded into base — disc
main/substat edits recompute exactly.

**Session 5 calibration — 🎉 ROSTER COMPLETE, 24/24:** (a) drop-in DPS (Cissia + Velina/Burnice/Vivian from Prydwen);
Cissia's exact ER cap 3.68 → gold/MAX. (b) systemic slot-main `mainStatPoints` merge in `resolveArchetype` (Rupture
HP%, Miyabi CR, Cissia/Velina ER). (c) Miyabi mains corrected (r/MiyabiMains: AM⇄ATK% comp-dependent, never CDMG-s4).
(d) Stunner batch — 5 agents across 4 axes (Trigger CR-cap 90, Dialyn ER, Nangong Yu anomaly). (e) Game-rule fix:
impossible AP-on-slot-6 mains removed, `_mainStatRule` pinned (slot 4 = AP-only, slot 6 = AM-only). (f) Support batch —
4 buff-scaling agents with breakpoint caps (Astra/Sunna ATK, Yuzuha ATK+AM, Lucia HP). **All 5 session-5 commits
pushed** (`fc96fdf` stunners · `7576dc7` game-rule · `3f2ac19` supports · `0a6930c` live-recompute · `2480d5b` roll-fix).
See `docs/grading-calibration.md` + `docs/stat-formulas.md`.
**This session (3):** factions 100% filled, deck polish (in-game slot order, big grade letters, faction
in header, bigger W-Engine core), **slug diacritic bugfix**, **Main Stats panel** (character-screen sheet,
gold = relevant), **stats flow into the Levels goalposts** (Sheet vs Effective restored via `wengines`
config), **single source of truth migration** (mainStats on the agent blob, `main-stats.ts` retired), and
**all 24 built agents seeded** with real character-screen stats + highlights. **GitHub remote LIVE + pushed**
(`lumenastrum/zzz-dashboard-next`, master @ `b1705bb`). Remaining: grade/goalpost calibration (targets are
rough globals), per-agent `wengines` configs (cartridge effects), other tabs, GH Pages workflow, Zhao (buildless).

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
- ⚠️ **Nangong Yu = hybrid Stunner** (Andres-confirmed — do NOT flip her to Anomaly): section stays **Stun**,
  but she scales off **Anomaly Prof, not Impact**, so she runs an anomaly disc build (AP/AM mains, Phaethon +
  Freedom Blues, Ether DMG). Graded via an `agentOverrides` entry (`"Nangong Yu": {archetype: "anomaly"}`) so
  her AP build scores on anomaly weights despite the Stun section. (A wrong section drives the wrong archetype,
  so for hybrids decouple the two with an override rather than changing the section.)
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
- ✅ **`ZOOM` + `NUDGE` art-direction layer** in `RosterTile.tsx` — global zoom (currently 2.1875) + per-agent
  `{dx,dy,dz}` nudges, hand-tuned with Andres ("boyfriend-eyeball pass"). `HOLD = 1/1.4` pins agents out of
  a global zoom round. This is the human-tuned layer; `portrait-frames.ts` is the regenerable measured layer.
- ✅ **Deck portrait squish fixed** (`globals.css .tt .pimg`: `width:auto; max-width:none`) — same Tailwind
  preflight `max-width:100%` clamp bug as the WuWa tall portraits.
- ✅ **Void Hunter titles**: Miyabi "Void Hunter: Isshin Muga", Yixuan "Grandmaster" (custom variant title).
- ✅ **Cartridge "Signature" accuracy** — the deck no longer claims every W-engine is a signature.
  `STANDARD_WENGINES` + `isSignatureEngine()` in `deck-config.ts`; standard-channel engines (The Brimstone,
  Hellfire Gears, …) read "Standard", real signatures read "Signature". Plus 3 W-engine cartridge icons added.
- ✅ Verified live throughout: deck renders (incl. Miyabi/Velina/Trigger/Nangong Yu/Lighter/Ellen) + full
  roster grid, cartridge labels, zero console errors. Build clean (28 pages) at every step.

**Session 2's work was later merged to `master`; the GitHub remote now exists (see session 3).**

## DONE — session 3 (2026-06-21): factions, deck polish, Main Stats + stat flow, full seeding

**Pushed to `lumenastrum/zzz-dashboard-next` master (through `b1705bb`).**

- ✅ **Factions 100%** — filled the 12 missing + corrections (Trigger→Obol, Soldier 0 Anby→Defense Force -
  Silver Squad, Krampus Compliance Authority). `FACTION_ICON_ALIAS` in deck-config maps full org-path display
  names → staged squad icons (Roscaelifer… → external_strategy_department, etc.). All 14 unique resolve.
- ✅ **Deck polish** — (1) header now reads `NOW PLAYING · NAME // FACTION` with the faction icon promoted to a
  34px badge; foot plate decluttered (type was a dupe of the top-right pill). (2) Equipment-frame **cones in
  in-game slot order**: 1-2-3 down the left column (top→bottom), 4-5-6 up the right (bottom→top) — `CONE` map in
  deck-config; validated vs fixed mains (slot 1 HP / 2 ATK / 3 DEF). (3) Per-disc **letter grade promoted to a
  big 22px badge** (`.gletter`), dropped the S-rank coin + "Lv 15/15". (4) **W-Engine core 28%→34%**.
- ✅ **Slug diacritic bugfix** — `slugify` now NFD-normalizes + strips combining marks (é→e), so Velina's
  "Joyau Doré" resolves `wengine_joyau_dore.webp` (was `joyau_dor`, self-hid). Mirrored into stage-assets.ts.
- ✅ **Main Stats panel** (`MainStats.tsx`) — 10-stat character sheet under the cartridge, 2-col in-game order,
  the agent's **scaling stats lit gold**. Stat icons stage as `stat_*` (incl. Sheer Force + Automatic Adrenaline
  Accumulation for Rupture). `STAT_SHEET` + `statIcon` in deck-config.
- ✅ **Stats flow into the Levels goalposts** — `computeStats(agent, cfg, {sheet, stats})` takes the seeded
  character-screen values as the **Sheet** (was illustrative `base` consts → wrong) and goalposts the agent's
  `relevant` stats. **Sheet vs Effective restored**: W-Engine base/advanced/passive (stripped by the Enka
  import) now live in a name-keyed **`wengines` config** + `resolveWengine()` — feeds both the cartridge AND the
  combat layer. ⚠️ **Only Alice has a `wengines` entry so far** — the other 23 cartridges show name only.
- ✅ **Single source of truth** (Andres's call) — `mainStats` + `relevant` live **on the agent object** in the
  andres-zzz blob; **`main-stats.ts` retired**. Authored in `data.json` (seed), pushed to the blob via
  **`npm run sync-stats -- --write`** (mirrors the import's seed→blob write). The "JSON seed is bait" rule holds.
- ✅ **All 24 built agents seeded** with real character-screen stats + gold highlights (read off in-game shots,
  pixel-cropped for accuracy). `LEVEL_CFG` expanded (HP, CRIT Rate, CRIT DMG, Energy Regen, Impact, Sheer Force,
  PEN Ratio). Two Rupture sheets (Yixuan, Yidhari). **Only Zhao unseeded (buildless — no deck panel).**
- 🐛 **Double-count fix** — seeded Sheet already includes sheet-scope set/W-Engine bonuses, so computeStats now
  skips re-adding them for overridden stats (Dialyn CRIT was 107.4% vs real 99.4%); only combat-scope buffs layer.
- ⚠️ **Gold-detection caveat:** a kit-given non-default value (Evelyn's PEN 24%, Ellen's PEN 32%) can render in a
  shade that reads as "gold" but is NOT a relevant highlight. Evelyn confirmed/fixed; **Ellen's PEN excluded,
  pending Andres confirm.**

## DONE — session 4 (2026-06-21): per-agent grade calibration + CRIT hard-clamp

**The pinned taste call, shipped for the 11 main DPS.** Research-then-build; build clean (28 pages), live-verified.

- ✅ **Calibration research** — 11 DPS agents (Ye Shunguang, Miyabi, Alice, Jane Doe, Aria, Evelyn, Seed, Soldier 0
  Anby, Ellen, Yidhari, Yixuan) researched across Prydwen/Game8/Icy Veins/genshin-builds/genshinlab/Mobalytics
  (evidence-only, cite-or-omit). **Prydwen is the only site with hard endgame *numbers*** — I hand-drove the single
  camoufox browser through all 11 Prydwen build tabs (slug gotchas: S0 Anby = `anby-demara-soldier-0`, Alice =
  `alice`; build data is lazy-rendered behind the BUILD react-tab). Full report → **`docs/grading-calibration.md`**.
- ✅ **Decisions (Andres):** **full per-agent** targets · **hard clamp** past CRIT cap · **keep lenient** scale (SSS≥92.5).
- ✅ **Per-agent targets** live in `grading-config.json` `agentOverrides[name].targets` (single source: the engine reads
  the CRIT `cap`, the Levels meter reads target/full via `levelCfgFor` in deck-config). 11 agents seeded with
  Prydwen-calibrated ATK/HP/CRIT/AP/AM/Sheer-Force goalposts.
- ✅ **CRIT Rate hard clamp** (`gradeBuild`) — if the seeded character-screen CRIT Rate ≥ the agent's `cap`, CRIT Rate
  substat weight → 0 (and CRIT Rate stripped from partner pairs so the slot-4/5 boost can't revive it); CR-stacked
  discs grade as the wasted value they are + a gold **"CRIT capped → CDMG"** verdict. **Live-verified:** Evelyn
  (sheetCR 80.2 ≥ cap 80) → CAPPED, 4 dead CR subs, build 46.2%, meter shows MAX + 20 gold segs + "CAP 80%".
- ✅ **Cap-aware Levels meter** — cap stats scale to the cap, go gold + "MAX" once reached, suppress the amber/red
  high-fill tint (hitting cap is the GOAL), show "TGT n · CAP m". `Levels` now takes `agentName`.
- ✅ **Rupture PEN = dead** — Yixuan/Yidhari `weights` zero PEN Ratio + Flat PEN (Sheer DMG ignores DEF).
- ✅ **Confirmed Ellen's PEN** = conditional/kit, NOT a core goalpost (Evelyn precedent held). Anomaly CR-zeroing validated.
- ⚠️ **Still GLOBAL defaults:** the other **14 agents** (stunners/supports/the rest) — no per-agent `targets` yet, so
  they use `LEVEL_CFG`. And `relevant` lists weren't re-audited (e.g. ensure Rupture shows HP/Sheer Force, anomaly hides CRIT).
- ☐ **Not yet committed/pushed** — review the diff, then commit + push.

## DONE — session 5 (2026-06-21): drop-in DPS calibration (Cissia + anomaly trio)

**The four DPS-shaped agents that reuse session-4's structure, no new semantics.** Research-then-build, build clean
(28 pages), live-verified through the real deck UI.

- ✅ **Prydwen research** — Cissia (crit), Velina/Burnice/Vivian (anomaly) endgame stats + disc plans hand-pulled
  through the single camoufox browser (BUILD react-tab). Numbers + decisions → `docs/grading-calibration.md` §5.
- ✅ **Per-agent `targets`** added to `grading-config.json` for all 4. Highlights: **Cissia** is kit-inverted
  (passive self-feeds +50% CDMG → CRIT DMG goalpost LOW at 110, CRIT Rate is the gear stat, **no cap**), plus a
  **mechanically-exact Energy Regen cap of 3.68** (her Core Passive DEF-Ignore maxes there: 1.4 + 19×0.12). **Vivian**
  AP weight 3.5→4.0 (Abloom scales on AP) + LOW ATK target (2000–2400).
- ✅ **First non-CRIT cap, live-verified:** Cissia's ER (sheet 3.74 ≥ cap 3.68) renders **gold + MAX**, 20/20 capped
  segments, "TGT 3 · CAP 3.68" — screenshot `Claude Space/screenshots/cissia-levels-er-cap.png`. The cap-clamp on
  grading stays CRIT-Rate-only (grading.js:147), so the ER cap is meter-only (confirmed: Cissia `capped=false`).
- ✅ **`relevant` audit:** **Burnice** fixed `[ATK, AP, Energy Regen]` → **`[ATK, AP, Anomaly Mastery]`** (her slot-6
  main is AM, sheet ER is near-minimum 1.56). Velina keeps ER (real 2.88 goalpost), Vivian/Cissia unchanged.
- ⚠️ **Burnice `relevant` is the ONE delta vs the live blob** — diffed the andres-zzz Supabase blob against the edited
  seed: only Burnice differs, everything else identical. Needs `npm run sync-stats -- --write` to surface live (targets
  already live — they're bundled in the build, not the blob). **Not yet synced/committed/pushed.**
- ✅ **Slot-main grading fix (systemic — Andres's catch).** A roster audit found the off-meta `?? 1` main-stat
  fallback hit **5 calibrated agents**, not just ER: **Yixuan/Yidhari** HP% s6 (Rupture offense), **Miyabi** CRIT
  Rate s4 (her signature disc was grading **D**), **Cissia/Velina** ER s6. Fixed by deep-merging a per-agent
  `mainStatPoints` over the archetype default in `resolveArchetype` (grading.js) + overrides for the 5. Verified
  before→after: every fixed disc off-meta→recommended, Yixuan B→A, Miyabi s4 D→C, false "off-meta" verdicts cleared,
  no regressions, build clean, live-confirmed on Miyabi's deck. (Raw supports Yuzuha s6=AM / Lucia s4,5=HP% deferred
  to the support batch.)
- ✅ **Miyabi mains corrected (r/MiyabiMains dive).** Sanity-checking Prydwen caught a bug in the above fix: I'd put
  `CRIT DMG:3` on her slot 4 — wrong (CDMG is a top *substat*, never the s4 main). Pulled the MiyabiMains megathread
  (camoufox, old.reddit) for the real tech: s4 = CR/ATK% (no CDMG), s5 PEN stays valid (Lycaon comps — almost zeroed
  it), **s6 AM ⇄ ATK% is comp-dependent** (AM for saturated-ATK / B&BS AM≥115 gate; ATK% for lighter buff comps) → both
  encoded BiS(3), AP off-meta on s4/s6. Her real AM s6 now grades **A**. Full trail in docs/grading-calibration.md.

## DONE — session 6 (2026-06-21): all 22 remaining W-engine configs

**Next-step #2 SHIPPED — every cartridge is now populated.** Research-swarm-then-translate; build clean (28 pages),
live-verified through the real deck (Ellen + Yixuan screenshots in `Claude Space/screenshots/`).

- ✅ **Research swarm** — 3 parallel WebFetch agents (the blessed gacha-research pattern, no camoufox) cross-checked
  all 22 engines across ≥2 sources (zzz.gg / senpailife / Game8 / Prydwen / genshin.gg). **Two systemic traps caught:**
  (a) **zzz.gg serves Phase-5 passive text by default, not R1** — every signature is R1 (Andres's pref), so R5 numbers
  would've been ~2× too strong; re-pulled R1 from Game8's per-phase tables. (b) **Game8's base ATK is the Lv1 figure**
  (638/665/611), not Lv60 — real Lv60 is 713/714, or **684** for the two standard ATK%-engines (Brimstone, Hellfire Gears).
- ✅ **22 `wengines` entries** added to `grading-config.json` (now 24 incl. Alice + Miyabi). Each = `base.ATK` +
  `advanced.label` + R1 `passive[]`. Translation rules (consumption verified in `grading.js`): **point-additive** combat
  stat buffs (CRIT Rate/DMG, flat AP/AM/Impact, ER/s) → `kind:"stat", scope:"combat"` (layer onto the Effective meter iff
  the stat is in `relevant`); **multiplicative** %-buffs (ATK%/HP%/Impact%) + element/skill **DMG%** + squad buffs →
  **chips** (`kind:"buff"/"dmg"/"buildup"`) — the combat layer ADDS `m.value`, so %-mult can't touch a meter honestly.
- ✅ **Isolated change** — `base.ATK` is **cartridge-display-only** (`derive-bases` folds the engine ATK into `agent.base`,
  `computeSheet` never reads `we.base.ATK`), so no re-derive, no Supabase sync (config is bundled in the build), no
  recompute drift. Base-ATK conflicts (Cloudcleave 713 vs 743) are cosmetic — flagged in per-engine `_comment`s.
- ✅ **Verified live:** Ellen `ATK 684 · ATK +30%` + passive `ATK +3.5%/stk (x8)` → chip (not faked on the ATK meter);
  Yixuan `Qingming Birdcage` + CRIT RATE meter `53.8%→73.8%` ghost-segment sourced `+20 · QINGMING BIRDCAGE (COMBAT)`.
  Smoke-tested all 24 through the real engine: no throws, no additive-on-mult deltas, all names resolve.
- ✅ **In-game truth pass (Andres) — all 3 flags cleared:** Cloudcleave base ATK = **743**; **Flight of Fancy** R1 =
  **40% Anomaly Buildup + 20 AP/stk (x6)** — my halve-the-R5 derivation was wrong (R5 = R1×1.6, not ×2), patched;
  **Dreamlit Hearth** confirmed (ER 0.4/s, Ether Veil → squad +25% DMG + 15% Max HP) — matched the Game8 single source
  exactly, no change. Every W-engine entry is now sourced or in-game-confirmed.

## DONE — session 7 (2026-06-21): disc-set coverage + set-swap recompute

**Two arcs: full set-effect coverage, then set-swap sheet recompute.** Research-swarm-then-build; build clean (28
pages), live-verified through the real deck (a UI set-swap moved the sheet, then reverted clean).

- ✅ **Set coverage 8 → 18** (`feat c8ce305`). 10 sets had NO `setEffects` (King of the Summit, Yunkui Tales, Dawn's
  Bloom, Moonlight Lullaby, Wuthering Salon, White Water Ballad, Shadow Harmony, Chaos Jazz, Shockstar Disco, Puffer
  Electro) so they rendered blank pills + contributed nothing; 4 more were missing their 4pc. Filled all via a 3-agent
  cross-checked swarm (zero conflicts). **Bug fix:** Swing Jazz 2pc was "+2 Energy Regen" flat — actually **+20% ER**.
  Scope rule: 2pc flat stats → `sheet`; element/Basic-Attack DMG% + Daze → `combat` chips; conditional 4pc → `combat`.
- ✅ **Set-swap sheet recompute** — the v1 limit is GONE. New `setSheetAccum(pieces, cfg)` in `grading.js` tallies the
  **sheet-scope set stat bonuses from the ACTIVE sets** (2pc when ≥2 pieces, 4pc when ≥4), shaped like `discAccum`.
  `computeSheet` now merges disc + set pools (`base × (1+(discPct+setPct)) + flats`), and `derive-bases` subtracts the
  same set bonuses — so **`agent.base` is now character + W-Engine only** (set-free). Swapping a disc SET retro-adjusts
  the sheet live. (W-Engine advanced stays in `base` — engines aren't swappable in the UI.)
- ✅ **Re-derived + re-synced** — `npm run derive-bases --write` (self-consistency worst error **1**, rounding) →
  `npm run sync-stats --write` pushed the set-free bases to the `andres-zzz` blob.
- ✅ **Verified:** additive (Woodpecker break → CR −8), multiplicative (Astral Voice break → ATK −base×0.10 = −165 on
  Astra), Rupture propagation (Yunkui HP break → HP & Sheer Force both drop). **Live UI:** Yixuan CRIT RATE 53.8% →
  45.8% when slot-4 Woodpecker swapped to Fanged Metal, then reverted (blob confirmed clean: base CR 2.6, slot-4 restored).
- ⚠️ **Sync gotcha (learned):** the DataProvider debounce-saves the in-memory blob, so if a deck is **open in a browser
  across a `derive-bases`+`sync-stats`**, it can clobber the push back to the old base (I hit this — base CR reverted to
  10.6, double-counting +8 live). Fix = close/park the deck (about:blank) before re-syncing. Fresh production loads are
  unaffected. After any re-derive, re-sync with **no deck open**, then verify the blob.
- 🐛 **Multiplicative-stat recompute fix (Andres caught: Ju Fufu ATK).** On an ATK%-advanced engine (Roaring Fur-nace
  ATK +30%), editing disc ATK% drifted the sheet ATK (−15 vs in-game 3301) — the engine's always-on 30% was folded into
  `agent.base` **multiplicatively**, but ZZZ SUMS every %, so `base×(1+newDisc%)` ≠ `P×(1+30%+newDisc%)`. Fix: new
  `weaponAdvanceAccum(we)` parses the engine's MULTIPLICATIVE advanced stat (ATK%/HP%/DEF%/AM%/Impact%/ER%) and SUMS it
  into `computeSheet` + `derive-bases` (additive advanced — CR/CDMG/AP/PEN — stays in base, no artifact). `agent.base` is
  now character(+core)-only for multiplicative stats. Re-derived (self-consistency worst 1) + re-synced. Ju Fufu ATK now
  **exact 3301** (live-verified); 8/10 stats exact. (Residual DEF +15 / Impact +2 are pre-engine-advance — approximate
  `rollValues` + the seed-snapshot base vs his edited blob discs; untracked stats, not a regression.)

## Next steps (next session)

**Four big arcs DONE:** ✅ calibration (24/24) · ✅ live recompute (disc **+ set** swaps) · ✅ all 24 W-engine cartridges
· ✅ all 18 disc sets + set-swap sheet. ✅ GH Pages auto-deploys on push. Remaining = polish/breadth:

1. ✅ ~~Set-swap sheet stats (the v1 limit)~~ — **DONE session 7** (`setSheetAccum`; see above). Note W-Engine **advanced**
   is still in `base` (display label only) — fine until/unless W-engine swap becomes a UI feature.
2. ✅ ~~Per-agent `wengines` configs~~ — **DONE session 6** (all 24 cartridges).
3. **Other faceplate tabs** — wire the home tabs (Levels / Teams / Pulls) to real routes + build them.
4. **AM `full` goalposts (optional)** — tighten them; AM is low-mobility (main + engine/set only, no substat rolls), so
   the meters otherwise read perpetually partial.
5. **Loose ends** — confirm Ellen's PEN Ratio (kit-value, excluded; Evelyn precedent); Zhao is buildless (no discs → no
   build panel; `npm run import` + seed if ever wanted). Roster effectively complete at 24/25.

## How to run
- **App:** `npm run dev` → http://localhost:3000 → click an agent → `/r/<slug>/` (the deck).
- **Seeding main stats:** edit `mainStats`/`relevant` in `public/data.json`, then `npm run sync-stats -- --write`
  to push to the andres-zzz blob (the live source of truth). Dry-run without `--write`.
- `npm run import [-- --file=… --write]` import builds from an Enka showcase payload · `npm run frames` re-measure
  face crops · `npm run build` static export · `npm run grade` headless grade · `npm run stage` (re)copy art.
- **Reference prototype:** `cd ../zzz-redesign-mockups` → `View Mockups.bat`, open `c-soundsystem.html`.
