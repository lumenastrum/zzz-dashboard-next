# ZZZ Stat Formulas — for live disc→sheet→goalpost recompute (2026-06-21)

Research: Clio (camoufox-solo on fandom wiki) + 2 chibi-Clio WebFetch sweeps. Sources: ZZZ Fandom wiki
(Stats / ATK / Anomaly Mastery / Anomaly Proficiency / Sheer Force), arkkus damage-calc gist, Prydwen, Game8.

## Master formula (the wiki's canonical form)

```
Final = ( Base × (1 + Σ%_unconditional) + Σflat_unconditional ) × (1 + Σ%_conditional) + Σflat_conditional
```

- **Character screen = the UNCONDITIONAL layer** = `Base × (1 + Σ%_uncond) + Σflat_uncond`.
  Unconditional = disc mains/subs + W-Engine base/secondary(advanced) + always-on 2pc set stats + core passive.
- **Conditional layer = our "combat" / Effective** = 4pc set effects + W-Engine passive + skill buffs (our `combat`-scope mods).
- **CRIT Rate, CRIT DMG, PEN, PEN Ratio, DMG%** have NO base multiplier — all bonuses are purely **additive**.

## Per-stat (the SHEET / unconditional value)

| Stat | Formula | Notes |
|---|---|---|
| **ATK** | `(char_base_ATK + WE_base_ATK) × (1 + ΣATK%) + Σflat_ATK` | ATK% = disc mains/subs + WE-2nd + 2pc + core. flat = slot-2 main (316) + flat-ATK subs (19/roll). |
| **HP** | `char_base_HP × (1 + ΣHP%) + Σflat_HP` | flat = slot-1 main (2200) + flat-HP subs (112/roll). |
| **DEF** | `char_base_DEF × (1 + ΣDEF%) + Σflat_DEF` | flat = slot-3 main (184) + flat-DEF subs (15/roll). |
| **CRIT Rate** | `5% + ΣCR%` (additive) | CR main(s4)=24%, CR sub=2.4%/roll, Woodpecker 2pc +8%. |
| **CRIT DMG** | `50% + ΣCDMG%` (additive) | CDMG main(s4)=48%, CDMG sub=4.8%/roll. |
| **Anomaly Proficiency** | `base_AP + Σflat_AP` (FLAT, additive) | AP main(s4)=92 flat, AP sub=9/roll, engines/sets give flat AP. base_AP ~115 anomaly / lower else. |
| **Anomaly Mastery** | `base_AM × (1 + ΣAM%)` (★ PERCENTAGE) | AM main(s6)=**30%**, WE-advanced AM=12–30%. **AM is NOT a substat.** base_AM ~115 anomaly / ~95 else. |
| **Impact** | `base_Impact × (1 + ΣImpact%)` | Impact main(s6)=18%. NOT a substat. base_Impact higher for Stun agents. |
| **Energy Regen** | `base_ER × (1 + ΣER%)` | ER main(s6)=60%. NOT a substat. base_ER agent-specific (~1.2 typical; not a confirmed universal). |
| **PEN Ratio** | `ΣPEN%` (additive) | PEN Ratio main(s5)=24%. (Flat PEN is the substat, 9/roll — separate stat.) |
| **Sheer Force** | `ATK × 0.30 + flat_SF` | universal Rupture. **Yixuan/Yidhari kit adds `+ MaxHP × 0.001`** (1% HP → +0.1 SF). PEN/PEN-Ratio are dead for Sheer DMG. |

## Disc values (S-rank, +15) — confirmed

- **Slot 1/2/3 mains (fixed):** flat HP 2200 · flat ATK 316 · flat DEF 184.
- **Slot 4/5/6 mains:** HP%/ATK% 30 · DEF% 48 · CRIT Rate 24 · CRIT DMG 48 · Anomaly Prof **92 flat** · PEN Ratio 24 ·
  Element DMG 30 · **Anomaly Mastery 30% (percentage)** · Impact 18% · Energy Regen 60%.
- **Substat per roll:** ATK%/HP% 3 · flat ATK 19 · flat HP 112 · DEF% 4.8 · flat DEF 15 · CRIT Rate **2.4** ·
  CRIT DMG **4.8** · Anomaly Prof **9** · flat PEN 9. **NOT substats:** Anomaly Mastery, Impact, Energy Regen, PEN Ratio, Element DMG.
- **Roll model:** S-rank starts 3–4 substats (25% start at 4), +15 gives 5 upgrade ticks; one sub caps at 6 total applications. (Our `rollModel` already matches.)

## The "AP → AM" claim — RESOLVED: they are independent (3 confirmations)

Andres' hypothesis was that AM is produced from a certain amount of AP. It does not hold:
1. **Wiki** (both the AM and AP pages): no derivation; each is `1% buildup-rate` (AM) / `1% anomaly DMG` (AP), parallel stats.
2. **Andres' own seed data:** no-AM-source agents — **Trigger AP 212 → AM 96** vs **Sunna AP 131 → AM 96**. AP swings 1.6×, AM is identical. If AM came from AP, Trigger's would tower.
3. **arkkus damage-calc gist:** `AM Bonus = 1 + AM/100` (buildup-rate multiplier), `AP Bonus = AP/100` (anomaly-DMG addend) — independent.

The directionally-correct kernel of the intuition: **AM is a special % stat** (`base × (1+AM%)`, no substat) while **AP is flat** — that asymmetry is real; the cross-derivation isn't.

## Wiring plan (next: implement in `computeStats`)

1. **Back-solve each agent's base stats once** from their seed (`base = invert the formula on the current sheet+discs+WE`):
   - Multiplicative stats: `base = (sheet − Σflat_disc) / (1 + Σ%_disc + Σ%_WE-2nd + Σ%_2pc-uncond)`. (Core-passive % is unknown
     in our data → folded into `base`; constant per agent, so it cancels for *relative* disc edits. Validate the residual.)
   - Flat/additive stats: `base = sheet − Σ(disc + WE + 2pc contributions)`.
   - Store as `agent.base = {ATK,HP,DEF,AM,AP,Impact,CRIT Rate,CRIT DMG,Energy Regen,...}` (script: derive-bases).
2. **Rewire `computeStats`** to COMPUTE the sheet from `base + current discs + WE + uncond sets` (drop the `opts.sheet`
   snapshot-passthrough for stats we can compute). Editing a disc → recompute → goalposts move.
3. **Validate vs Yuzuha** (Andres edited her discs in-game/on the live site): recompute her sheet from her discs, compare
   to her real character screen. Tune `rollValues`/base derivation until it matches. Yuzuha is the ground-truth oracle.

**Engine corrections this surfaces:** (a) AM main is **%** not flat (current `computeStats` adds it flat — bug); (b) ATK is
multiplicative `(base+WE)×(1+%)+flat` not the rough `atkPool` model; (c) Sheer Force needs the per-agent HP kit term.
