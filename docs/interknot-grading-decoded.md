# How interknot-network.com grades discs — decoded (2026-06-20)

Reverse-engineered from the live API for **Foxed / UID 1001327696** (your account).
Endpoint: `GET https://interknot-network.com/api/api.php?uid=<UID>&version=1.1`
Raw payload saved alongside this file: `interknot_api_foxed.network-response` (273 KB JSON).

## TL;DR — it's a TWO-LAYER system

1. **Per-disc letter grade** (`SSS · SS · S · A · B · C · D · E`, shown on each disc in the hex frame)
   → a **weighted-substat-roll** score. This is the tractable one and matches our plan.
2. **Overall agent rank** (`#11108 · TOP 52.87%`, the red banner)
   → a **full DPS simulation** of the agent's rotation using actual equipped stats, then
   ranked as a percentile against everyone else on the leaderboard. Big engine. Out of scope for us.

Your Alice card read: overall **#11108 / TOP 52.87%**, discs **SS · A · S · B · C · E** (slots 1–6).

---

## Layer 1 — per-disc grade (the part we want)

### The data they start from (Enka showcase format)
Each disc in `data.PlayerInfo.ShowcaseDetail.AvatarList[].EquippedList[]`:
```
Slot, Equipment.Id (set), Level(15), BreakLevel(5 = S-rank),
MainPropertyList:   [{PropertyId, PropertyValue}]          // the main stat
RandomPropertyList: [{PropertyId, PropertyLevel, PropertyValue}]  // the 4 substats
```
**`PropertyLevel` = the roll count (1–6).** A substat that rolled into 4 times has PropertyLevel 4.
That roll count is the quality signal.

### The weight tables (per agent, per slot) — `y.<agent>.dps[0].stats[0].partitions[]`
`partitions` = the **6 disc slots**. Each slot lists its allowed **main stats** (each with a
`points` rating) and a **substat weight vector**. Score a disc by:

```
discScore = mainStatPoints  +  Σ_substats ( PropertyLevel(rolls) × weight[substatName] )
          → normalized → letter tier
```

### Alice's actual table (Anomaly / Physical) — this is the gold
| Slot | Main stat (points) | Substat weights (only non-zero shown) |
|------|--------------------|----------------------------------------|
| 1 | HP (3) | **ATK% 3.5 · Anomaly Proficiency 3.5** · ATK 0.5 · Flat PEN 0.5 |
| 2 | ATK (3) | ATK% 3.5 · Anomaly Proficiency 3.5 · ATK 0.5 · Flat PEN 0.5 |
| 3 | DEF (3) | ATK% 3.5 · Anomaly Proficiency 3.5 · ATK 0.5 · Flat PEN 0.5 |
| 4 | **Anomaly Prof (3)** or ATK% (2) | if AP main → **ATK% sub = 4.25**; if ATK% main → **AP sub = 4.25** · ATK 0.5 · PEN 0.5 |
| 5 | Physical DMG (3) / PEN Ratio (3) / ATK% (2) | ATK% 3.5 · AP 3.5 (or off-main → 4.25) · ATK 0.5 · PEN 0.5 |
| 6 | Anomaly Mastery (3) | ATK% 3.5 · Anomaly Proficiency 3.5 · ATK 0.5 · Flat PEN 0.5 |

**Everything not listed = weight 0**: HP%, DEF%, CRIT Rate, CRIT DMG, flat HP, flat DEF.
→ Confirms our instinct hard: **crit is literally worth nothing on Anomaly Alice.**

Two clever bits worth stealing:
- **Dynamic re-weighting** (slots 4/5): the stat you *didn't* take as the main becomes more
  valuable as a substat (3.5 → 4.25). Rewards covering both ATK% and AP.
- **Main-stat `points`** separates "right main stat" from "good substats" — a wrong main stat
  (e.g. ATK% on slot 4 = 2 pts vs AP = 3 pts) caps the disc before substats even count.

Weights are **per-agent**: Yixuan / Yidhari weight HP% at 3 (HP scalers); Alice / Jane Doe weight it 0.

### Grade scale (from the cards)
`SSS · SS · S · A · B · C · D · E` — gold for the S-tiers, purple A, red B/E, white C.
Yi Xuan also showed special **ZERO** and **OXO** badges (top-tier / themed labels).

### Sets & W-Engines are also rated
- `y.alice.dps[0].sets[].drives`: **Fanged Metal 4pc = 4 pts**, Phaethon's Melody / Freedom Blues = 3.
- `wengines` tier list per agent: **Practiced Perfection = 5 (BiS)**, Angel in the Shell / Timeweaver ≈ 4–4.5, down to filler.

---

## Layer 2 — overall agent rank (the DPS sim, FYI only)
`y.<agent>.dps[]` is a full damage model: rotation strings (`basic [1,2,3,4,5,6,6,6,5,5]`),
move-value IDs (`mvs`), buffs, skill priority, mindscape effects. They run the rotation with your
real stats → a damage number → percentile vs the leaderboard (`getCurrentRank.php`, `addToLeaderboard.php`).
`w.<id>` even carries community usage counts (21,012 Alice builds sampled). This is a serious
theorycraft engine — **not worth rebuilding for a personal dashboard.**

---

## What this means for OUR Soundsystem dashboard
- ✅ Our design instinct was right: **per-disc letter grade as a chip on the real hex frame**, plus an
  **"improve" verdict** — that's exactly interknot's UI. Validation.
- **Adopt Layer 1.** Store per-disc substats with roll counts; grade via the weighted-roll formula.
- **Weights:** start with **per-archetype** tables (Anomaly / Attack-crit / Stun / Support / Anomaly-Mastery),
  override per-agent where it matters (Alice = the table above). Don't need interknot's data — these
  weights are standard theorycraft we can define ourselves and hand-tune.
- **Skip the DPS percentile.** Replace their "TOP x%" with our own honest **build-quality %**
  (achieved weighted rolls ÷ theoretical max) + the re-roll verdict. Cheaper, still useful.
- Open question for Andres: grade scale — mirror their `SSS…E`, or keep our cleaner `S/A/B/C/D`?
