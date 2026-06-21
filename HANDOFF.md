# ZZZ Dashboard Redesign — "Soundsystem" · Handoff

**Last updated:** 2026-06-21 (session 5) · **Status:** deck + Supabase + 25-agent roster + Enka builds shipped.
**★ LIVE STAT RECOMPUTE (session 5g):** the deck is no longer a snapshot — editing a disc now recomputes the
character screen AND the goalpost meters live. Deciphered ZZZ's real stat formulas (`docs/stat-formulas.md`):
`computeSheet` recomputes the sheet from a back-solved `agent.base` + current discs (ATK `(base+WE)(1+%)+flat`;
**AM is `base×(1+AM%)`** not flat — was a bug; Sheer Force `0.3·ATK + 0.1·HP`). `scripts/derive-bases.mjs` back-solves
every agent's hidden base from their seed (validated: base CRIT pops to 5.0%, base CDMG 50.0%, Miyabi base CR =
5+24 engine). `base` synced to the blob. **Validated on Andres's live Yuzuha edit:** his slot-3 AP×4 sub edit now
flows to her screen (AP 129→147 = +2 rolls×9). Pending: his in-game cross-check of the recomputed numbers.
**Session 5:** (a) drop-in DPS calibration — Cissia + Velina/Burnice/Vivian goalposted from Prydwen (15/24 DPS now
calibrated); Cissia's mechanically-exact Energy-Regen cap (3.68) renders gold/MAX; Burnice `relevant` ER→AM (synced).
(b) **Systemic slot-main grading fix** — per-agent `mainStatPoints` merge in `resolveArchetype` un-breaks kit-specific
mains for 5 agents (Rupture HP%, Miyabi CRIT Rate, Cissia/Velina ER). (c) **Miyabi mains corrected** (r/MiyabiMains).
(d) **Stunner batch** — all 5 calibrated across 4 axes (bearings: Prydwen + 5 chibi WebFetch sweeps); reused the
CRIT-cap (Trigger 90), slot-6 merge (Dialyn ER / Nangong Yu AM), anomaly archetype (Nangong Yu). (e) **Game-rule fix**:
removed impossible AP-on-slot-6 mains (anomaly+support), pinned `_mainStatRule`. (f) **Support batch** — all 4 done on
buff-scaling axes with breakpoint caps (Astra/Sunna ATK, Yuzuha ATK+AM, Lucia HP); the cap now reads "buff maxed".
**🎉 ROSTER COMPLETE — 24/24 calibrated.** First 3 commits PUSHED; `fc96fdf` (stunners), `7576dc7` (game-rule),
+ the support commit are local. See docs/grading-calibration.md.
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

## Next steps (next session)

1. ✅ **CALIBRATION COMPLETE — 24/24 built agents** (drop-in DPS + slot-main fix + Miyabi mains + stunners + game-rule
   + supports). Goalposts/grades are real for every built agent; only Zhao is uncalibrated (buildless, intentionally
   out). Game-rule fix done (slot 4 = AP-only, slot 6 = AM-only; impossible AP-on-s6 removed, pinned `_mainStatRule`).
   Future non-calibration candidates: other faceplate tabs (Levels/Teams/Pulls routes); optionally tighten AM `full`
   values (AM is low-mobility — main + engine/set only, no substat rolls).
2. **Per-agent `wengines` configs** — only Alice has one, so the other 23 cartridges show the engine name but no
   ATK/advanced/passive line, and no combat Sheet→Effective. Add each engine's base ATK + advanced + combat
   passive to `grading-config.json` `wengines` (web-sourceable from the engine description). Keyed by name.
3. **Confirm Ellen's PEN Ratio** — excluded as a likely kit-value (Evelyn precedent); Andres to verify.
4. **Other tabs** — wire the home faceplate tabs (Levels / Teams / Pulls) to real routes + build them.
5. **GitHub Pages workflow** — remote is live + pushed, but there's **no `.github/workflows/`** yet, so it's not
   auto-deploying. Copy WuWa's `pages.yml`. `basePath`/`assetPrefix` already set to `/zzz-dashboard-next`.
6. **Zhao** — buildless (no discs), so her deck shows no build/stat panel. Build her in-game + `npm run import`,
   then seed her stats, if ever wanted. Otherwise the roster is effectively complete at 24/25.

## How to run
- **App:** `npm run dev` → http://localhost:3000 → click an agent → `/r/<slug>/` (the deck).
- **Seeding main stats:** edit `mainStats`/`relevant` in `public/data.json`, then `npm run sync-stats -- --write`
  to push to the andres-zzz blob (the live source of truth). Dry-run without `--write`.
- `npm run import [-- --file=… --write]` import builds from an Enka showcase payload · `npm run frames` re-measure
  face crops · `npm run build` static export · `npm run grade` headless grade · `npm run stage` (re)copy art.
- **Reference prototype:** `cd ../zzz-redesign-mockups` → `View Mockups.bat`, open `c-soundsystem.html`.
