# ZZZ Grading Calibration — DPS Batch (2026-06-21)

Research pass to answer: **was the in-game character-screen highlighter enough to pick `relevant` stats,
or do the goalposts need more shape?** Verdict up front: **the highlighter picks the right *stats* but
cannot encode the goalpost *shapes*** — per-agent CRIT caps/breakpoints, per-archetype stat targets,
HP-as-offense for Rupture, and derived stats (Sheer Force). Calibration needs a per-archetype target
table + per-agent CRIT overrides + a "cap/overshoot" semantic.

## Method
- 11 DPS agents. Each researched independently across Prydwen, Game8, Icy Veins, genshin-builds,
  genshinlab, Mobalytics (evidence-only; cite-or-omit; priority-order vs hard-number distinguished).
- **Prydwen is the only site with hard endgame stat *numbers*** (its "Best Endgame Stats (Level 60)"
  block). Every other site is mostly priority-order. The numbers below are hand-pulled from Prydwen's
  build tab unless noted (MMP = MisterMenPlays, the one other numeric source, for Miyabi).

## Prydwen endgame targets (Level 60) + disc plan, per agent

| Agent | Arch | Disk 4 | Disk 5 | Disk 6 | ATK | HP | CRIT Rate | CRIT DMG | Other goalposts |
|---|---|---|---|---|---|---|---|---|---|
| Ye Shunguang | crit | ATK%>CDMG | PEN=ATK | ATK% | **3000+** | 10000+ | **cap ~50** (overcaps) | **180–200+** | PEN Ratio real slot-5 |
| Evelyn | crit | CDMG>CR | **PEN>FireDMG** | ATK% | 2600–3400+ | 10000+ | 80–100 eff (≥55 gear); **75% stat-screen cap** | 160–200+ | — |
| Ellen | crit | CDMG | **PEN>IceDMG** | ATK% | 2600–3000+ | 9500+ | 90–100 eff; **≤80 stat-screen w/ Deep Sea sig** | 120–180+ | PEN conditional |
| S0 Anby | crit | CR>=CDMG | ElecDMG>ATK% | ATK% | 2800–3200+ | 10000+ | 58–78 (pre-buff) | 160–200+ | CR favored (kit feeds CDMG) |
| Seed | crit | CDMG>CR | PEN=ATK=ElecDMG | ATK% | 2700–3000+ | 10000+ | 75–90+ | **110–140+** (low; kit feeds CDMG) | zero innate CR → steep CR; PEN% slot-5 ok |
| Miyabi | anomaly | CR (→80) | ATK/Ice/PEN | ATK% | 2700 (MMP) | — | **80 hard breakpoint → flip to CDMG** | 160 (MMP) | **AM≥115 set gate** (Branch&Blade 4pc); AP 230 (MMP) |
| Jane Doe | anomaly | AP | PEN/PhysDMG | AM | — | — | n/a (internal) | n/a | **AP 375** (→100% anomaly crit), **420** (+600 ATK cap); **AM 192+** |
| Aria | anomaly | AP | Ether/ATK | AM | 2600–2900+ | 9500+ | n/a | n/a | **AP 330–420+**, **AM 184–244** |
| Alice | anomaly | AP>ATK% | **PEN>PhysDMG>ATK%** | AM | 2600–2900+ | 9500+ | n/a | n/a | **AP 330–420+**, **AM 184+**; AM≥140 → 1.6 AP/excess pt |
| Yidhari | rupture | CR=CDMG | IceDMG>HP% | HP% | (minor) | **18,000–20,000+** | 58.6–65.8 stat / 90.6–97.2 combat | 120–150 | **Sheer Force 2400–2600**; HP=offense (0.1 SF/HP); wants <50% HP (+100% DMG); Adrenaline not Energy; Anomaly stats DEAD |
| Yixuan | rupture | CDMG=CR | EtherDMG>HP% | HP% | 1800–2000+ | **16,000–18,000+** | 80–90 (incl disc) | 140–160 | **Sheer Force 2100–2400**; HP=offense; **PEN DEAD** (Sheer ignores DEF); ER junk (Adrenaline cap 120) |

## Comparison vs current `LEVEL_CFG` (global defaults)

Current globals (deck-config.ts): ATK t2700/f4200 · HP t16000/f22000 · CRIT Rate t70/f100 ·
CRIT DMG t150/f260 · Energy Regen t1.4/f3 · Sheer Force t2400/f3200 · Impact t120/f200 ·
PEN Ratio t20/f60 · Anomaly Proficiency t330/f460 · Anomaly Mastery t184/f320.

| Stat | Global target | Reality | Verdict |
|---|---|---|---|
| **CRIT Rate** | 70 (linear) | per-agent **cap/breakpoint** 50→90; some flip past breakpoint; n/a for anomaly | ❌ **biggest miss** — must be per-agent + cap semantics |
| **ATK** | 2700 | crit ~2900, anomaly ~2700, **rupture ~1900** | ⚠️ per-archetype (Rupture wildly off) |
| **HP** | 16000 | goalpost **only for Rupture (~18k)**; filler for everyone else | ⚠️ Rupture-only offense stat |
| **CRIT DMG** | 150 | dedicated-crit 180–200; kit-fed 110–140; rupture 140–160 | ⚠️ per-agent bump |
| **Anomaly Proficiency** | 330 | real goal **375–420** | ⚠️ raise to ~375 |
| **Anomaly Mastery** | 184 | 184–244 (Jane 192) + Miyabi **115 set-gate** | ~OK, minor bump |
| **Sheer Force** | 2400 | Yidhari 2400–2600, Yixuan 2100–2400 | ✅ already well-calibrated |
| **PEN Ratio** | 20 (weight 1.0) | real **slot-5 main** for many (Prydwen rates PEN>elem DMG); **DEAD for Rupture** | ⚠️ raise weight; exclude for Rupture |
| **Energy Regen** | 1.4 | not a DPS goalpost; Rupture runs on Adrenaline | ❌ don't grade for these DPS |
| **Impact** | 120 | Stun-only (not this batch) | n/a here |

## Structural findings (what the highlighter cannot encode)
1. **CRIT Rate is a per-agent CAP/breakpoint, not a linear bar.** Ye caps ~50 (kit overcaps), Evelyn/Miyabi
   hard-break at 80 (Miyabi *flips* priority to CDMG past it), Ellen ~80 stat-screen, S0 Anby 58–78, Seed
   75–90, Yixuan 80–90, Yidhari 58–66 stat. A single global 70 + linear weight is wrong for nearly everyone.
   **Needs: per-agent `target` + `cap`, and overshoot stops counting (or lightly penalizes).**
2. **Per-archetype ATK / HP.** Rupture wants LOW ATK (~1900) and HIGH HP (~18k, as *offense* via Sheer Force);
   crit/anomaly want ATK ~2700–2900 and treat HP as filler. One global ATK/HP can't serve both.
3. **Derived stats.** Sheer Force = HP×0.1 + ATK×0.3 (Rupture); a disc highlighter never connects HP%/ATK%
   substats to it. Our Sheer Force target (2400) is already good — keep, scope to Rupture.
4. **Anomaly carries don't build CRIT** (Jane/Aria/Alice) — their crit is internal (Jane: AP 375 → 100% anomaly
   crit). Our anomaly weights already zero CRIT ✅ (validated). But AP target (330) is too low → 375.
5. **PEN Ratio is a legit slot-5 main** for many crit/anomaly agents (Prydwen repeatedly rates PEN Ratio above
   element DMG) — underweighted at 1.0 — and a **DEAD stat for Rupture** (Sheer ignores DEF).
6. **Mechanic gates the highlighter can't show:** Miyabi AM≥115 (set 4pc), Alice AM≥140 → 1.6 AP conversion,
   pre-combat vs in-combat CRIT (Yidhari 62→97). These are footnotes/tooltips, not gradeable bars.

## Proposed calibration (for A.'s sign-off — NOT yet implemented)
**Hybrid: per-archetype target defaults + per-agent CRIT overrides.** (Per-archetype alone can't capture CRIT;
Ye caps at 50 but Ellen wants 90 — both "crit" archetype. CRIT is irreducibly per-agent.)

- **Per-archetype `LEVEL_CFG` defaults:**
  - crit: ATK t2900/f3600 · CRIT DMG t180/f240 · (HP not graded)
  - anomaly: ATK t2700/f3200 · AP t375/f460 · AM t192/f320 · (CRIT not graded)
  - rupture: HP t18000/f22000 · Sheer Force t2400/f2800 · ATK t1900/f2400 · CRIT DMG t150/f220 · (PEN excluded)
- **Per-agent CRIT Rate overrides** `{target, cap}`: Ye 50/55 · Evelyn 80/85 · Miyabi 80/80(flip) · Ellen 85/95 ·
  S0 Anby 70/80 · Seed 82/92 · Yixuan 85/92 · Yidhari 62/68(stat-screen).
- **New `cap` semantic** on a `LevelCfg`: value past `cap` is wasted → VU bar clamps + grading weight on that
  stat zeroes past cap (or soft-penalizes). Drives both the Levels meter and the substat grade.

## Open decisions (taste calls)
1. **Structure:** per-archetype defaults + per-agent CRIT overrides — confirm? (vs full per-agent everything.)
2. **CRIT cap semantics:** hard clamp (overshoot wasted) / soft penalty / visual-notch-only? Affects grade weight.
3. **Grade-scale leniency:** keep interknot-lenient (SSS≥92.5) or tighten to honest now that targets are real?
4. **HP-as-offense for Rupture:** grade HP% as a damage goalpost for Yidhari/Yixuan (data says yes).

## Source notes
- Prydwen slugs are non-obvious for some: S0 Anby = `anby-demara-soldier-0`; Alice = `alice` (not
  `alice-thymefield`); rest are kebab display name.
- Most non-Prydwen sites are **priority-only** — for hard numbers, Prydwen (or MMP for Miyabi) is the source.
- "Folklore" numbers (e.g. Ellen ATK 2500 / ER 120–140%, Yixuan HP 18–20k) circulating in search snippets
  were NOT on fetched pages — excluded. Prydwen's actual numbers are above.

---

# Session 5 addendum — drop-in DPS batch (2026-06-21)

Four more agents, all reusing the session-4 structure (no new semantics). Prydwen "Best Endgame
Stats (Level 60)" + disc plan, hand-pulled through the single camoufox browser (BUILD react-tab).

| Agent | Arch | ATK | CRIT Rate | CRIT DMG | AP | AM | Energy Regen | Disk 4/5/6 mains |
|---|---|---|---|---|---|---|---|---|
| Cissia | crit | 2500–2700+ | **50–57** (w/ sig) | **110+** (low) | — | — | **scaling** (Core Passive) | CR>CDMG / ElecDMG>ATK% / **Energy Regen** |
| Velina | anomaly | 2400–2600+ | n/a | n/a | 330–420+ | — | **2.88** | AP / WindDMG=ATK%=PEN / **Energy Regen** |
| Burnice | anomaly | 2500–3200+ | n/a | n/a | 350–400+ | 153+ | (minimum) | AP / PEN>=FireDMG / **Anomaly Mastery** |
| Vivian | anomaly | **2000–2400+** | n/a | n/a | 380–450+ | 198+ | (minimum) | AP / EtherDMG>PEN=ATK% / **Anomaly Mastery** |

### Decisions / structural findings
1. **Cissia's CRIT is inverted from a normal crit DPS.** Her Festering Venom passive self-grants
   **+50% CRIT DMG** (combat, off the character screen), so her CRIT DMG *goalpost* is LOW (110+) and
   **CRIT Rate is the gear stat** (50–57 w/ signature). No mechanical CR cap (no conversion past a
   breakpoint), so **no `cap`** — just target/full.
2. **Cissia's Energy Regen has a real, computable cap.** Core Passive: squad DEF-Ignore = 3% flat +
   0.52% per 0.12 ER above 1.4, capped at 12.88%. Solve: (12.88−3)/0.52 = 19 steps → ER = 1.4 +
   19×0.12 = **3.68**. Past that, ER is wasted → `cap: 3.68`. Her seeded sheet ER is 3.74, so her meter
   reads **MAX/gold** (verified live). First non-CRIT cap; the meter's cap logic is generic, and the
   grade-clamp is CRIT-Rate-only (line 147), so an ER cap never touches grading.
3. **Velina & Burnice run Energy Regen / Anomaly Mastery on slot 6, not ATK%.** Velina's ER goalpost is
   2.88 (a real benchmark, not a cap). Burnice's slot 6 is **AM** (153+), so her `relevant` was wrong
   (`[ATK, AP, Energy Regen]`) → fixed to **`[ATK, AP, Anomaly Mastery]`**. Her sheet ER (1.56) confirms
   ER is not her goalpost.
4. **Vivian favors AP over ATK% in almost all cases** (Core Passive scales Abloom — the bulk of her DPS —
   directly with AP), so AP weight bumped 3.5 → **4.0** and her ATK goalpost set LOW (2000–2400). The bump
   moves her real build only ~1pp (33.2→32.1%); the low D is honest (her imported discs are full of dead
   CRIT/HP/DEF substats).
5. **Slot-main grading gap — FOUND SYSTEMIC, FIXED.** The archetype `mainStatPoints` tables only
   encode the *vanilla* main per slot, so any agent running a **kit-specific** slot-4/5/6 main fell to
   the off-meta `?? 1`. A full roster audit found this hit **5 calibrated agents**, not just ER:
   - **Yixuan / Yidhari** (Rupture) — **HP% on slot 6** (HP is their offense via Sheer Force).
   - **Miyabi** — **CRIT Rate on slot 4** (her signature CRIT-anomaly build; was grading **D**).
   - **Cissia / Velina** — **Energy Regen on slot 6**.
   - (Raw, deferred to the support batch: Yuzuha s6 AM, Lucia s4/s5 HP%.)

   **Fix:** `resolveArchetype` now deep-merges a per-agent `mainStatPoints` (per slot) OVER the archetype
   default — so the kit-main scores 3 (recommended) without dropping the archetype's vanilla mains.
   Added `mainStatPoints` overrides for the 5. Verified before→after: every fixed disc went off-meta→
   recommended (mainPts 1→3, mainStatOk false→true), Yixuan's build B→A, Miyabi's slot-4 D→C, and the
   false "off-meta main" verdict cleared on all five. No regressions.

**Remaining after this batch (9):** Stunners (Dialyn, Trigger, Ju Fufu, Lighter, Nangong Yu) need the
**Impact** goalpost axis; Supports (Astra Yao, Sunna, Yuzuha, Lucia) need a buffer philosophy.

## Miyabi disc-MAIN deep dive (2026-06-21) — r/MiyabiMains, beyond Prydwen

A sanity check on Prydwen's Miyabi mains turned up a bug in my first slot-fix and a comp-dependency the
aggregators flatten. Sources: Prydwen build tab + r/MiyabiMains megathread comments (the `HiImNotABot001`
breakdowns + the AM-vs-ATK% threads), pulled via the single camoufox browser (old.reddit HTML; Reddit's
`.json` is behind a bot wall).

- **Prydwen:** s4 `CRIT Rate% >= ATK%` · s5 `Ice DMG% = ATK%` · s6 `ATK%` · subs `CR(→80) >= CDMG = ATK% > AP = ATK = PEN`.
- **My first fix was wrong:** I'd added `CRIT DMG: 3` to her slot-4 mainStatPoints "for flexibility". CDMG is
  a top *substat*, **never the slot-4 main** (Prydwen + the sub agree). Removed — CDMG slot-4 now grades off-meta.
- **r/MiyabiMains tech (more granular than Prydwen):**
  - **s4:** CR *or* ATK% — ATK% becomes her best main once CR ≥ ~68% ("free AM" from CR carries below that). Never CDMG.
  - **s5:** `pen >= ice > atk` — **PEN is legit** (esp. Lycaon/shred comps), so we keep the anomaly-default PEN
    on slot 5 (I'd almost zeroed it from Prydwen alone — that would've been wrong).
  - **s6:** **AM ⇄ ATK%, comp-dependent.** AM when her ATK is already saturated by double ATK-buff / anomaly
    supports (Yuzu + Soukaku) or she needs the **Branch & Blade Song AM ≥ 115 gate** (+30% CDMG); ATK% with
    lighter ATK-buff comps (Astra + Nicole) for EBA3 oomph. Real-play reports: AM build ~2600 ATK vs ATK% build
    ~3105 ATK, "no real difference in actual use." So both are BiS → both score 3; AP is off-meta on s4 & s6.
- **Encoded:** `Miyabi.mainStatPoints = { "4": {CRIT Rate:3, ATK%:3, AP:0}, "6": {ATK%:3, Anomaly Mastery:3, AP:0} }`
  (slot 5 left to the anomaly default). Verified: her real build s4 C / s5 B / **s6 AM → A 69.4%**, CDMG-s4 &
  AP-s4/s6 swaps read off-meta, ATK%-s6 & PEN-s5 read BiS, zero false verdicts. **Takeaway:** main-stat "BiS" is
  often comp-dependent — encoding *both* valid mains at 3 is more honest than forcing one, and it's why we read
  the comments instead of trusting a single rating number.

## Stunner batch (2026-06-21) — there is NO blanket Impact benchmark

Bearings pass on the 5 built stunners: I drove Prydwen (camoufox solo), 5 "chibi-Clio" subagents swept the kit
mechanics (WebFetch + Jina only — never camoufox; parallel browsers dogpile). Verdict: stunners split **four ways**,
and only two even build Impact. No new engine mechanics needed — every case maps onto tools already shipped.

| Agent | El | Real axis | Disc 4/5/6 | Encoded |
|---|---|---|---|---|
| **Lighter** | Fire | **Impact** 170–195 (270 = full buff) + CR 50 KotS floor | CR≥CDMG / ATK%=Fire=PEN / **Impact** | stun · Impact 185/270, CR 50/80 · rel +CRIT Rate |
| **Trigger** | Elec | **Impact** 162–186 + **CR→Daze, hard cap 90** | CR / ElecDMG>ATK% / **Impact** | stun · Impact 175/240, **CR 80/cap90/95**, CDMG 100/160 |
| **Ju Fufu** | Fire | **ATK 3400** (squad-CDMG buff scales off ATK) + CR 50 floor | CR=ATK% / ATK% / Impact=ATK% | stun · `mainStatPoints {4,5: ATK%:3}` · ATK 3300/3500, CR 50/80, Impact 150/220 · rel CDMG→Impact |
| **Dialyn** | Phys | **CRIT Rate 80–100 → Impact** (core passive) + Energy Regen s6 | CR / ATK%≥Phys=PEN / **Energy Regen** | stun · `mainStatPoints {6: Energy Regen:3}` · CR 90/100, ER 2.0/3.0 (rel already correct) |
| **Nangong Yu** | Ether | **Anomaly** (AP 280–350, AM 173–211), AM>110 → Impact | AP / EtherDMG=ATK%>PEN / **AM** | anomaly · `mainStatPoints {6: AM:3}` · ATK 2350/2900, AP 320/420, AM 190/290 · rel +ATK |

**Reused, not rebuilt:** the **CRIT-cap clamp** (DPS) → Trigger's 90% daze cap. The **slot-6 `mainStatPoints` merge**
(Cissia/Velina) → Dialyn's Energy Regen & Nangong Yu's AM. The **anomaly archetype** (Alice/Jane/Aria) → Nangong Yu.
Impact goalpost shows ONLY for Lighter & Trigger; the rest grade on their real axis (their Impact is a derived output).

Verified: all 5 grade clean, targets resolve, Trigger's cap shows but doesn't trip (sheet CR 67.4 < 90), Dialyn ER-s6
& Ju Fufu ATK%-s4/5 & Nangong Yu AM-s6 all → pts3 BiS; build clean; live-confirmed on Trigger's deck. Builds land C/D
honestly (under-farmed stunners — e.g. Lighter's CR 14.6% screams "missing your KotS floor").

**Game-rule fix (DONE — A.'s correction).** The flag above turned out to be a hard game rule, not a taste call:
**slot 4 can roll Anomaly Proficiency but NEVER Anomaly Mastery; slot 6 can roll Anomaly Mastery but NEVER Anomaly
Proficiency** (slot 5 rolls neither). So the `anomaly` archetype's `s6: {AP:3, ...}` listed an **impossible main** —
a build the game can't produce. Fixed `anomaly` s6 → `{ATK%:2.5, AM:3}` (AP removed, AM is the only anomaly s6 main)
and the same impossible `AP` on `support` s6 → `AM:2`. Documented as top-level `_mainStatRule` so it can't be
re-added. Verified: all 6 anomaly agents' AM-s6 disc → pts3 BiS (was 2), no regressions (mainStatPoints don't touch
the ideal denominator); dropped Nangong Yu's now-redundant override and Miyabi's impossible `AP:0` on s6.

## Support batch (2026-06-21) — buff-scaling axes, breakpoint caps · ROSTER COMPLETE (24/24)

Bearings: Prydwen (camoufox-solo) + 4 chibi WebFetch sweeps. The unifying rule: **supports build a stat to SCALE A
TEAM BUFF, not for personal offense — and each buff CAPS at a hard breakpoint** (extra is wasted → a `cap`; meter-only,
the grade-clamp stays CRIT-Rate-only). CRIT/personal DMG are "any amount" filler, never goalposts.

| Agent | El | Buff-scaling axis (cap) | Disc 4/5/6 | Encoded |
|---|---|---|---|---|
| **Astra Yao** | Ether | **ATK 3430** (ally flat-ATK buff = 22% of her ATK, cap +1200) + ER | ATK% / ATK% / ER=ATK% | `mainStatPoints{4,5:ATK%:3}` · ATK 3300/**cap3430**/3600, ER 1.5/3 |
| **Sunna** | Phys | **ATK 3500** (buff = 30% of ATK, cap +1050) + ER (low 1.0 base) | ATK% / ATK% / ER | `{4,5:ATK%:3}` · ATK 3400/**cap3500**/3700, ER 1.4/3 |
| **Yuzuha** | Phys | **ATK 3000 + AM 200** (AM>100 → team Anomaly-Buildup/Disorder buff) + AP | ATK% / ATK% / **AM** | `{4,5:ATK%:3, 6:AM:3}` · ATK 2900/**cap3000**, AM 185/**cap200**, AP 200/300 |
| **Lucia** | Ether | **HP 24000** (Sheer Force squad buff scales off Max HP, cap 900 SF) | **HP% / HP% / HP%** | `weights{HP%:3.5}` + `{4,5,6:HP%:3}` · HP 22000/**cap24000**, ER 1.4/3 |

**New application of the cap semantic:** the breakpoint cap (Cissia ER / Trigger daze) now reads as **"buff maxed —
stop, pivot"** for a support. Live-verified: Astra's ATK 3671 ≥ 3430 → gold MAX (screenshot
`Claude Space/screenshots/astra-levels-support-atkcap.png`); Yuzuha ATK 3113 → MAX, AM 171 under its 200 cap; Lucia
HP 22,594 just over target, under the 24k cap. **Lucia is an HP-scaler in a support shell** (like Rupture) — needed
the HP% weight bump + triple HP% `mainStatPoints` (support archetype had no HP% main, so her HP% slots were off-meta).

**Reused, not rebuilt:** the breakpoint `cap` (Cissia/Trigger), the slot-6/4-5 `mainStatPoints` merge (ATK%, AM, HP%),
HP%-weight bump (Rupture). Verified: all 4 grade clean, zero impossible mains, every kit-main → pts3 BiS, build clean.

**🎉 ROSTER COMPLETE — 24/24 built agents calibrated** (Zhao is buildless/no discs, intentionally out).
