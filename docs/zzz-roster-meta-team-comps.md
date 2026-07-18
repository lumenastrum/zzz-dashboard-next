# ZZZ Roster Meta / Most-Used Team Comps for Andres

Working document for mapping current ZZZ meta team structures onto Andres's actual roster from `/opt/data/projects/zzz-dashboard/data.json`.

Created 2026-06-14 as the second support doc for the future `gaming/zzz-team-building` skill.

## Scope

This doc is not a universal tier list. It answers:

> Given Andres's roster, what are the highest-value recurring team shells Clio should consider first for Shiyu Defense, Deadly Assault, and other endgame team planning?

It combines:

- Andres's dashboard roster and audit notes.
- Current-ish community/meta sources.
- Shiyu Defense analytics from Prydwen 2.8.2.
- Icy Veins team guides for key agents Andres owns.
- Team grammar from the companion doc: `docs/zzz-team-composition-technical-notes.md`.

## Andres Roster Snapshot

Dashboard updated: 2026-04-11.

### Attack

| Agent | Attr | Investment | Dashboard note |
|---|---|---:|---|
| Ye Shunguang | Physical | M1/W1 | Needs CRIT DMG |
| Evelyn | Fire | M3/W1 | High investment carry, core online |
| Seed | Electric | M0/W1 | Needs CRIT Rate |
| Soldier 0 Anby | Electric | M1/W1 | No note |
| Ellen | Ice | M0/W0 | Low investment / benched |
| Cissia | Electric | owned, not in dashboard yet | Electric Attack sub-DPS / Seed partner; verify exact investment |

### Anomaly

| Agent | Attr | Investment | Dashboard note |
|---|---|---:|---|
| Jane Doe | Physical | M3/W1 | High investment carry; AP/in-combat AP check |
| Alice | Physical | M1/W1 | Needs AP |
| Miyabi | Ice | M1/W1 | Needs CRIT DMG |
| Vivian | Ether | M2/W1 | No note |
| Burnice | Fire | M0/W1 | No note |
| Aria | Ether | M0/W1 | Angels of Delusion DPS; AP improvable |

### Stun

| Agent | Attr | Investment | Dashboard note |
|---|---|---:|---|
| Dialyn | Physical | M0/W1 | Rupture synergy candidate |
| Ju Fufu | Fire | M0/W1 | Off-field Fire Stun, Attack/Rupture friendly |
| Trigger | Electric | M0/W1 | Low-field stunner candidate |
| Lighter | Fire | M0/W0 | Low investment |
| Nangong Yu | Ether | M0/W1 | Anomaly-Stun hybrid, good baseline |

### Support / Utility

| Agent | Attr | Investment | Dashboard note |
|---|---|---:|---|
| Astra Yao | Ether | M1/W1 | Universal support |
| Lucia | Ether | M0/W1 | Rupture-oriented support |
| Yuzuha | Physical | M0/W1 | Anomaly support candidate |
| Sunna | Physical | M0/W1 | High Shiyu analytics performer / Physical support |
| Zhao | Ice | M0/W0 | Low investment, high analytics performer |

### Rapture / Rupture

| Agent | Attr | Investment | Dashboard note |
|---|---|---:|---|
| Yidhari | Ice | M0/W1 | Needs CRIT DMG |
| Yixuan | Ether / Auric Ink | M1/W1 | Needs CRIT Rate + CRIT DMG |

---

## Evidence Summary

### Prydwen Shiyu Defense Analytics 2.8.2

Source: <https://www.prydwen.gg/zenless/shiyu-defense>

Important caveat: Prydwen explicitly says analytics should not be used as pure pull-value comparisons. Data is phase-specific and filtered; M1+ S-rank teams are excluded in some configurations. Still useful for seeing which agents are performing in current Shiyu.

Andres-owned agents appearing high in 2.8.2 average-score table:

| Agent | Avg score | Notes |
|---|---:|---|
| Sunna | 34,500 | Highest table entry; Andres owns M0/W1 |
| Ye Shunguang | 33,488 | Very high; Andres owns M1/W1 but CD needs farming |
| Zhao | 33,046 | Very high; Andres owns low investment M0/W0 |
| Dialyn | 31,386 | Very high; Andres owns M0/W1 |
| Nangong Yu | 31,218 | Very high; Andres owns M0/W1 |
| Yuzuha | 30,263 | Strong; Andres owns M0/W1 |
| Miyabi | 29,647 | Strong; Andres owns M1/W1 |
| Lucia | 29,262 | Strong; Andres owns M0/W1 |
| Aria | 29,076 | Strong; Andres owns M0/W1 |
| Vivian | 28,646 | Strong; Andres owns M2/W1 |
| Seed | 28,309 | Solid; Andres owns M0/W1 |
| Astra Yao | 27,672 | Universal support; Andres owns M1/W1 |
| Trigger | 26,980 | Solid low-field stun/support candidate |
| Ju Fufu | 26,809 | Strong off-field Fire Stun |
| Burnice | 26,617 | Anomaly enabler |
| Alice | 26,565 | Anomaly DPS, needs AP |
| Soldier 0 Anby | 26,440 | Solid |
| Yixuan | 26,227 | Rupture, needs crit work |
| Yidhari | 26,145 | Rupture, needs CD |
| Jane Doe | 24,192 | Lower in current data despite M3/W1; still roster-invested |
| Evelyn | 24,128 | Lower in phase table but Andres's version is M3/W1 and core online |
| Lighter | 23,661 | Low investment on Andres account |
| Ellen | 23,041 | Low investment/benched |

Interpretation for Andres:

- His **meta-relevant support/stun bench is better than first glance**: Sunna, Dialyn, Nangong Yu, Yuzuha, Lucia, Astra, Ju Fufu, Trigger all matter.
- His **highest-investment personal carries** are not always the highest analytics entries for this phase, but M3/W1 Evelyn and Jane still deserve respect in matching rooms.
- Physical/Yunkui/Angels support pieces are important because current Shiyu data heavily rewards those ecosystems.

### Astra Yao Team Guide

Source: <https://www.icy-veins.com/zenless-zone-zero/astra-yao-teams>

Key points:

- Astra is one of the best universal Supports.
- Astra is especially strong with Evelyn; Icy Veins describes Astra as Evelyn's best teammate.
- Astra also works broadly with main DPS agents including Miyabi, Soldier 0 Anby, Seed, and Yixuan.
- Specialized archetypes can prefer specialized supports, e.g. Yuzuha for Anomaly, Lucia for Rupture.

Andres implication:

- Astra should be treated as a premium universal support, not automatically glued to every room.
- In lockout modes, allocate Astra to the team where her universal buffing and M1/W1 investment gives the largest marginal gain.

### Yixuan / Rupture Team Guides

Sources:

- <https://www.icy-veins.com/zenless-zone-zero/yixuan-teams>
- <https://www.icy-veins.com/zenless-zone-zero/lucia-teams>
- <https://www.icy-veins.com/zenless-zone-zero/pan-yinhu-teams>

Key points:

- Yixuan is a Rupture DPS; many generic buffs are less effective than direct Sheer Force / HP / CRIT / Rupture-compatible buffs.
- Lucia is described as the best Rupture support and the perfect teammate for Yixuan.
- Ju Fufu is one of Yixuan's best Stun options due to buffs and low field time.
- Dialyn is also very good for Yixuan if placed after the Rupture Agent; Icy says Dialyn can deal damage equal to 400% of the Rupture Agent's Sheer Force.
- Trigger is also a viable low-field stun option.
- Pan Yinhu is a key Rupture support in general but Andres does **not** currently own him according to dashboard.

Andres implication:

- The default Yixuan team should start from **Yixuan + Lucia + Ju Fufu/Dialyn**, not Yixuan + random high-investment carry.
- If Lucia is needed elsewhere, Astra can sub, but that is a fallback from a Rupture-specific perspective.

### Ju Fufu Team Guide

Sources:

- <https://www.icy-veins.com/zenless-zone-zero/ju-fufu-guide-best-builds>
- <https://www.itemd2r.com/en/blog/zenless-zone-zero/zless-zone-zero-ju-fufu-team-compositions-and-best-partners>

Key points:

- Ju Fufu is an off-field Fire Stun agent.
- She provides squad-wide CRIT DMG buffs and helps Attack/Rupture agents.
- Icy lists example shells including:
  - Rupture DPS + Ju Fufu + Pan Yinhu/Lucia.
  - Evelyn + Ju Fufu + Astra Yao.
- ItemD2R also lists Ju Fufu + Evelyn + Astra Yao and Ju Fufu + Yixuan + Pan Yinhu.

Andres implication:

- Ju Fufu is one of the few roster pieces that can reasonably support both Evelyn and Yixuan/Yidhari.
- In lockout, do not spend Ju Fufu casually; decide whether the room wants Fire Attack burst or Rupture burst more.

### Vivian / Yuzuha / Alice / Jane Anomaly Core Guides

Sources:

- <https://www.icy-veins.com/zenless-zone-zero/vivian-teams>
- <https://www.icy-veins.com/zenless-zone-zero/ukinami-yuzuha-teams>
- <https://www.icy-veins.com/zenless-zone-zero/alice-thymefield-teams>
- <https://www.icy-veins.com/zenless-zone-zero/jane-doe-guide-best-builds>
- <https://www.icy-veins.com/zenless-zone-zero/burnice-white-teams>

Key points:

- Vivian is T0 Ether Anomaly on Icy Veins and is explicitly framed around Abloom damage, off-field damage, and Anomaly application.
- Yuzuha's guide says **Vivian is Yuzuha's best teammate**: Yuzuha buffs while Vivian supplies off-field damage and high Anomaly Application.
- Vivian's guide lists Physical Anomaly DPS pairings including Alice and Jane; Alice is highlighted alongside Jane.
- Alice's guide says **Yuzuha is Alice's best teammate** and **Vivian is Alice's second-best teammate**; Vivian + Yuzuha are described as the best supports for Anomaly DPS, with Vivian providing application and Yuzuha buffs.
- Burnice remains a valid off-field Anomaly/application unit, but Yuzuha's guide describes Burnice as a **Vivian substitute** if Vivian is unavailable. This supports Andres's lived experience that Burnice is now more "yesterday's anomaly sub-DPS core" than first-choice on this roster.
- Jane's Icy guide says Jane M2 enables her to act as a sub-DPS in a mono-Physical team with Alice + Yuzuha, described as one of the strongest team compositions in the game. Andres has Jane M3, so this special team is unlocked.

Andres implication:

- Default Anomaly template should be **Anomaly DPS + Vivian + Yuzuha** when Vivian is not resisted and available.
- Burnice should be a fallback/substitute or a Fire-specific Anomaly enabler, not the default top-line sub-DPS if Vivian is available.
- Andres-custom special: **Alice / Jane Doe / Yuzuha** is legitimate because Andres has Jane M3; use in Physical-friendly / mono-Physical / Assault-focused situations.

### Aria / Nangong Yu / Sunna Angels Core Guides

Sources:

- <https://www.icy-veins.com/zenless-zone-zero/aria-teams>
- <https://www.icy-veins.com/zenless-zone-zero/nangong-yu-teams>
- <https://www.ldshop.gg/blog/zenless-zone-zero/nangong-yu-team.html>
- <https://gamerant.com/zenless-zone-zero-zzz-nangong-yu-team-comp-composition-best-pair-teammates/>

Key points:

- Aria is an on-field Ether Anomaly DPS who wants off-field/buff teammates; Icy warns most other Anomaly agents can conflict with her because they also want field time.
- Sunna directly activates/supports Aria's faction/core needs and buffs Aria's damage on Cat's Gaze targets.
- Nangong Yu is described as Aria's best Stun agent, providing Anomaly-focused buffs, Anomaly Buildup Rate, and damage support.
- Multiple secondary sources identify **Aria / Nangong Yu / Sunna** as the premium/final Angels of Delusion team.
- Nangong Yu is also a general Anomaly support/stun hybrid and can work with Miyabi, Alice, Yanagi, Jane, etc., but Icy notes Jane has less synergy with Nangong than with Vivian.

Andres implication:

- The default Aria team should be **Aria / Nangong Yu / Sunna**, not Aria / Vivian / Nangong Yu.
- Vivian should usually be saved for Alice/Jane/Miyabi anomaly shells rather than jammed into Aria unless Sunna is unavailable or room constraints demand it.
- Nangong is a real candidate for Miyabi anomaly shells; treat rumors of Miyabi+Nangong as plausible and source-backed enough to test.

### Seed / Cissia Attack-Core Guides

Sources:

- <https://www.icy-veins.com/zenless-zone-zero/seed-guide-best-builds>
- <https://www.icy-veins.com/zenless-zone-zero/cissia-teams>
- <https://www.icy-veins.com/zenless-zone-zero/cissia-profile-skills-mindscapes>
- <https://www.prydwen.gg/zenless/characters/seed>

Key points:

- Seed's kit revolves around a **Vanguard**, which must be another Attack Agent in the squad. Without a Vanguard, Seed loses major Basic/Ultimate damage, RES ignore, Steel Charge support, and mutual buff uptime.
- `Seed / Trigger / Astra` fails this structure because Trigger is Stun and Astra is Support.
- Cissia is an Electric Attack sub-DPS/main-DPS option and Icy identifies her as one of Seed's best secondary Attack partners, with a cited ~12% Seed damage increase over Orphie & Magus.
- Cissia's Additional Ability activates with another Stun character or same Electric attribute, and she gives squad CRIT DMG while Venom is active.
- Andres owns Cissia but the dashboard does not yet include her.

Andres implication:

- Default Seed shell should become **Seed / Cissia / support-or-stun**, not Seed / Trigger / Astra.
- Trigger can still be the third slot in Seed teams if Seed's Vanguard is already covered by Cissia.
- Soldier 0 Anby can also serve as another Attack partner contextually, but Cissia is the newly documented Seed partner.

### Team Builder / Generic Grammar

Source: <https://zenlesstools.online/tools/team-builder>

Key points:

- Hypercarry = main DPS + Stun + Support.
- Anomaly/Disorder = two Anomaly agents with different elements + flex.
- Mono element works best when synergy/passives still make sense.
- DPS + DPS + Support is only "decent" and should usually be treated as quick-swap/specific-kit territory.

Andres implication:

- Avoid ungrounded dual-carry drafts like `Yixuan / Evelyn / Astra` unless explicitly choosing a quick-swap/dual-DPS plan and verifying compatibility.

---

## Roster Team Shells — Priority List

These are not locked final teams. Treat them as **first-search candidates** when a room or boss asks for the matching damage profile.

## 1. Evelyn Premium Fire Hypercarry

### Default shell

```text
Evelyn / Ju Fufu / Astra Yao
```

### Archetype

Fire Attack hypercarry / crit-burst / stun-burst.

### Why it matters

- Evelyn is Andres's most complete Attack carry: M3/W1, core online, green audit.
- Astra is specifically cited as Evelyn's best teammate by Icy Veins.
- Ju Fufu is an off-field Fire Stun with squad CRIT DMG/burst utility and is explicitly listed in Evelyn shells.
- This is probably Andres's cleanest classic hypercarry team.

### Best for

- Fire recommended rooms.
- Crit/ATK/EX/Chain/Ultimate buff rooms.
- Stun/burst scoring.
- Non-Ether-resistant rooms if Astra personal damage matters, though Astra remains valuable mostly for support.

### Caution

- Consumes two premium lockout resources: Astra and Ju Fufu.
- If another room specifically demands Rupture, Ju Fufu may be more valuable there.
- If a room resists Fire, do not force this despite Evelyn's investment.

### Variants

```text
Evelyn / Lighter / Astra Yao
```

Use only if Ju Fufu is locked elsewhere and Lighter's low investment is acceptable.

```text
Evelyn / Ju Fufu / Sunna
```

Possible if Astra must be saved and Sunna's support package fits the room; verify kit/passives.

---

## 2. Yixuan Rupture Core

### Default shell

```text
Yixuan / Lucia / Ju Fufu
```

### Archetype

Rupture / Sheer hypercarry with Rupture-specific support + low-field stun.

### Why it matters

- Yixuan is M1/W1 and a T0-style Rupture carry in external guides.
- Lucia is the best Rupture support according to Icy Veins, buffing HP, Sheer Force, CRIT DMG, and Rupture-relevant stats.
- Ju Fufu is one of Yixuan's best Stun options and supports Attack/Rupture agents.

### Best for

- Sheer DMG / Rupture / Rapture buff rooms.
- Rooms where Ether/Auric Ink is not resisted.
- Bosses where DEF-ignoring or Sheer damage is favored.

### Caution

- Yixuan dashboard has CRIT Rate and CRIT DMG farming flags.
- If room has Ether resistance, Yixuan may be punished unless Sheer mechanics/buffs override enough.
- Do not pair Yixuan with another on-field carry by default.

### Important variant

```text
Yixuan / Lucia / Dialyn
```

Use when:

- Physical is recommended or Fire is resisted.
- Dialyn can exploit the Rupture synergy.
- Ju Fufu is reserved for Evelyn.

Placement note:

- Icy says Dialyn is very good if placed after the Rupture Agent and can deal damage equal to 400% of the Rupture Agent's Sheer Force. In practical planning, check in-game ordering/assist logic.

### Fallback variant

```text
Yixuan / Astra Yao / Dialyn or Ju Fufu
```

Use only when Lucia is not available or another Rupture unit needs Lucia harder.

---

## 3. Yidhari Rupture / Ice-Rupture Core

### Default shell

```text
Yidhari / Lucia / Ju Fufu
```

or

```text
Yidhari / Lucia / Dialyn
```

### Archetype

Ice Rupture / Sheer damage.

### Why it matters

- Yidhari is Ice Rapture/Rupture M0/W1.
- Lucia supports Rupture agents generally, not only Yixuan.
- Ju Fufu and Dialyn are both Rupture-friendly stunners.

### Best for

- Ice recommended rooms that also reward Rupture/Sheer or crit-burst.
- Rooms where Yixuan is punished by Ether resistance.
- Multi-room lockouts where Yixuan goes elsewhere.

### Caution

- Dashboard flags Yidhari's CRIT DMG as low.
- If the room purely rewards Ice Anomaly/Abloom, Miyabi/Aria/Vivian logic may beat Yidhari.

---

## 4. Alice / Vivian / Yuzuha Top-Line Anomaly Shell

### Default shell

```text
Alice / Vivian / Yuzuha
```

### Archetype

Physical Anomaly carry + Ether Anomaly sub-DPS/application + premier Anomaly support.

### Why it matters

- Icy describes Yuzuha as Alice's best teammate and Vivian as Alice's second-best teammate.
- Vivian + Yuzuha are described as the best supports for Anomaly DPS: Vivian provides application/off-field damage, Yuzuha buffs, Alice deals the main damage.
- This directly validates Andres's instinct that Vivian has largely dethroned Burnice as the premium anomaly sub-DPS/enabler when Vivian is available.
- Alice is M1/W1 on Andres's account and needs AP farming, but the shell is structurally premium.

### Best for

- Anomaly / Disorder rooms.
- Physical-friendly rooms that do not resist Physical.
- Rooms where Ether is not resisted and off-field application matters.
- Deadly Assault bosses where sustained Anomaly/Disorder mechanics matter.

### Caution

- Alice dashboard AP is red and needs farming.
- Vivian is Ether; do not force if powerful enemy resists Ether and Vivian's contribution is central.
- Yuzuha is a premium lockout resource for Anomaly teams.

### Andres-custom special: Alice / Jane / Yuzuha

```text
Alice / Jane Doe / Yuzuha
```

Use when:

- Physical is recommended or neutral.
- Physical is not resisted.
- The fight rewards Assault / mono-Physical anomaly / high Physical uptime.
- You specifically want to leverage Andres's **Jane M3**.

Why it matters:

- Icy's Jane guide says Jane M2 enables her to act as a sub-DPS in a mono-Physical team with Alice + Yuzuha, described as one of the strongest team comps. Andres has Jane M3, so this condition is satisfied.
- Community discussion also flags Alice/Yuzuha/Jane as a current strong Jane/Alice route, usually with M2+ Jane.

Caution:

- This is a special-case premium Physical anomaly team, not a generic Jane hypercarry.
- If Physical is resisted, downgrade heavily.
- It may compete with `Alice / Vivian / Yuzuha`; choose based on enemy resistance and whether Ether application or mono-Physical pressure is better.

### Burnice fallback variants

```text
Alice / Burnice / Yuzuha
Jane Doe / Burnice / Yuzuha
Miyabi / Burnice / Yuzuha
```

Use when:

- Vivian is locked elsewhere.
- Fire application is specifically rewarded.
- Fire + Physical Disorder is favored by the room.

Doc correction:

- Burnice is no longer the default top-line anomaly sub-DPS in Andres planning. Treat her as valid but usually behind Vivian unless the room specifically wants Fire.

---

## 5. Miyabi Ice Anomaly / Crit-Anomaly Core

### Candidate shells

```text
Miyabi / Nangong Yu / Astra Yao   ← BENCHMARKED WINNER
```

```text
Miyabi / Vivian / Yuzuha
```

```text
Miyabi / Nangong Yu / Yuzuha
```

```text
Miyabi / Burnice / Yuzuha
```

### Archetype

Ice/Frost crit-anomaly HYBRID carry. Miyabi scales off ATK and CRIT, not pure Anomaly — support choice must reflect this.

### Why it matters

- Miyabi is M1/W1 and still strong in Prydwen analytics.
- Vivian's guide explicitly says Miyabi is viable with Vivian even though Miyabi scales differently from ordinary Anomaly agents.
- Nangong Yu's guide explicitly lists Hoshimi Miyabi among Anomaly DPS partners and describes Nangong as an Anomaly-support style Stun agent.
- Ice rooms are common in Shiyu rotations.
- Dashboard says Miyabi's CRIT Rate is good but CRIT DMG is low, so rooms giving CRIT DMG or Ice DMG are excellent patches.

### BENCHMARK DATA (2026-06-14, Shiyu Room 1: AP +30 / Abloom +20% / Ice DMG +20% after EX / Resists Physical)

| Comp | Total Score | Damage Score | Carry DMG% | Notes |
|---|---:|---:|---:|---|
| Miyabi / Nangong / Astra | **37,190** | 32,190 | 79.6% | **WINNER by 4,332 points** |
| Miyabi / Nangong / Yuzuha | 32,858 | 27,858 | — | Yuzuha only buffs Anomaly half |
| Miyabi / Vivian / Yuzuha | 32,571 | 27,571 | 63% | Distributed damage, lower ceiling |

**Key finding: Astra > Yuzuha for Miyabi by a CANYON (4,332 points).** Miyabi is a hybrid crit-anomaly carry. ATK and CRIT buffs from Astra feed her ENTIRE damage profile. Yuzuha only buffs the Anomaly half. Astra buffed the whole girl. Yuzuha buffed half a girl. The math was never close.

**Secondary finding: Stun windows > Disorder for Miyabi.** Nangong's Anomaly-Stun hybrid support (stun windows + Anomaly Buildup Rate) outperformed Vivian's off-field Disorder cycling by 287 points. Burst > sustain when AP +30 accelerates buildup.

### Best for

- Ice recommended rooms.
- Anomaly/Abloom rooms where Ice is favored.
- Rooms where Physical is resisted and Fire/Ether options are awkward.
- ANY room with ATK/CRIT/EX buffs — Miyabi's hybrid scaling catches these.

### Caution

- **Do NOT default Yuzuha for Miyabi.** Yuzuha is correct for pure Anomaly carries (Alice, Jane). Miyabi is hybrid. Use Astra.
- `Miyabi / Zhao / Astra Yao` is **sussy** as a default. Zhao may be a useful Ice support/floor-raiser in analytics, but Andres's Zhao is low investment.
- Do not just pair Miyabi with Yidhari because both are Ice unless explicitly building an Ice dual-carry/attribute-stack plan.
- Need to verify Miyabi's current Additional Ability condition and whether the chosen supports activate it.

### Variants by room signal

Default (proven):

```text
Miyabi / Nangong Yu / Astra Yao
```

If Astra is locked and room says Ice + Anomaly/Disorder and Ether is not resisted:

```text
Miyabi / Vivian / Yuzuha
```

If room specifically rewards Fire + Anomaly or Vivian is locked:

```text
Miyabi / Burnice / Yuzuha
```

If room says Ice + Rupture:

```text
Yidhari / Lucia / Ju Fufu or Dialyn
```

Do not conflate these archetypes.

---

## 6. Aria / Nangong Yu / Sunna Angels Premium Core

### Default shell

```text
Aria / Nangong Yu / Sunna
```

### Archetype

Angels of Delusion premium Ether/Anomaly team: on-field Aria DPS + Nangong anomaly-stun support + Sunna support.

### Why it matters

- Aria wants off-field/buff teammates because she is an on-field Ether Anomaly DPS.
- Icy identifies Sunna as an Angels support who activates Aria's core/faction needs and buffs Aria's damage.
- Icy identifies Nangong Yu as Aria's best Stun agent, providing Anomaly-focused buffs and Anomaly Buildup Rate.
- LDShop and GameRant both identify **Nangong Yu + Aria + Sunna** as the definitive/best Angels of Delusion team.
- Andres owns all three pieces.

### Best for

- Ether recommended rooms.
- Abloom buff rooms where Ether is not resisted.
- Rooms that reward Anomaly plus stun/hybrid support.
- Situations where you want the faction-premium Angels package instead of borrowing Vivian/Yuzuha.

### Caution

- Do not run this into Ether resistance if Aria/Ether is the primary damage plan.
- Aria does not generally want random on-field Anomaly teammates because field-time conflict is real.
- Biggest Fan Bangboo should be checked if available; it is the Angels faction Bangboo and specifically supports Aria/Nangong/Sunna style teams.

### Flex variants

```text
Aria / Nangong Yu / Yuzuha
```

Use if Sunna is locked or Yuzuha's Anomaly buffs matter more for the room.

```text
Aria / Nangong Yu / Nicole or Astra Yao
```

Use only if support availability forces it; Icy notes Astra is more conditional for Aria unless M2, and Andres's Astra is M1.

Doc correction:

- `Aria / Vivian / Nangong Yu` is no longer the default. Vivian is better reserved for Alice/Jane/Miyabi anomaly shells unless the room demands it.

---

## 2b. Ye Shunguang Premium Physical Hypercarry ⭐ BENCHMARKED

### Default shell

```text
Ye Shunguang / Dialyn / Sunna
```

### Archetype

Physical Attack hypercarry / crit carry. Full Physical synergy.

### Why it matters

- **BENCHMARKED 2026-06-14: 42,138 total score (37,138 damage, optimized run), 95.1% YSG damage share.** Highest single-room score of the entire session.
- Beat Evelyn M3/W1 (33,971 in the same room with Dialyn + Astra) by **7,535 points** in a direct head-to-head. This is not marginal — it is a canyon.
- Ye Shunguang is consistently the highest-scoring carry across multiple sessions: 46,920 (DA Cycle 1), 42,104 (Shiyu S+ March 21), 41,506 (Shiyu June 14). Pattern is documented and undeniable.
- Sunna (34,500 Prydwen analytics — highest on roster) + Dialyn + YSG = full Physical squad where every member catches Physical room buffs.
- Room CRIT DMG buffs patch YSG's known CD farming deficit. In +30% CD rooms, her effective CD jumps from 142.8% to ~172.8% before any support buffs.
- Prydwen analytics: YSG at 33,488, Sunna at 34,500, Dialyn at 31,386 — all top-tier performers and all Physical.

### Best for

- Physical recommended rooms (even when Fire is also recommended — she beats Evelyn M3 with receipts).
- Crit/ATK/EX/Chain/Ultimate buff rooms.
- Any room giving CRIT DMG buffs (patches her deficit for free).
- Rooms where Physical is not resisted.

### Caution

- Dashboard says Ye needs CRIT DMG; but room buffs can compensate. Check room modifiers before benching her for stats.
- If room has Physical resistance, avoid.
- Consumes Dialyn and Sunna — verify lockout availability.

### PROMOTION NOTE

YSG was originally Shell 7 ("Candidate shell"). Promoted to Shell 2b after benchmark data proved she consistently outscores all other carries including Evelyn M3. **Stop defaulting to Evelyn in Physical-friendly rooms.** The eheh girl stays winning.

---

## 8. Seed / Cissia Electric Double-Attack Core

### Candidate shell

```text
Seed / Cissia / Trigger
```

or

```text
Seed / Cissia / Astra Yao or Sunna
```

### Archetype

Electric double-Attack / Vanguard core with either Stun or Support in the third slot.

### Why it matters

- Seed requires another **Attack Agent** as her Vanguard to unlock major damage, RES ignore, Steel Charge, and mutual buff mechanics.
- Cissia is an Electric Attack sub-DPS/main-DPS that Icy identifies as one of Seed's best secondary Attack partners.
- Icy says Cissia can increase Seed's damage by ~12% compared to Orphie & Magus and supports Electric Attack agents with DEF Ignore / CRIT DMG utility.
- Andres owns Cissia, but dashboard does not yet list her.

### Best for

- Electric recommended rooms.
- Rooms where Electric is neutral and other carry packages are locked.
- Content where double-Attack play is acceptable and you can manage field-time/rotation complexity.

### Caution

- `Seed / Trigger / Astra Yao` is invalid as a default Seed team because it does not provide Seed's Vanguard Attack partner.
- Double-Attack teams can be harder to pilot and may not always outperform normal Stun + Support structures.
- Dashboard says Seed needs CRIT Rate.
- Need Cissia investment added to dashboard before hard-ranking this shell.

---

## 9. Soldier 0 Anby / Trigger / Astra or Sunna

### Candidate shell

```text
Soldier 0 Anby / Trigger / Astra Yao
```

### Archetype

Electric Attack/crit shell.

### Why it matters

- Soldier 0 Anby has solid current analytics and M1/W1 on Andres account.
- Trigger is Electric Stun/low-field support candidate.
- Astra is broadly supportive of main DPS agents.

### Caution

- Less documented in this research pass than Evelyn/Yixuan/Burnice shells.
- Treat as a matchup/coverage team, not a default top priority.

---

## Lockout-Ready Team Packages

These packages are designed for Stage 5 / Deadly Assault style allocation where agents, Bangboo, and sometimes gear cannot repeat.

### Package A — Three coherent archetypes with minimal overlap ⭐ BENCHMARKED VARIANT

```text
1. Miyabi / Nangong Yu / Astra Yao        (37,190)
2. Yixuan / Lucia / Ju Fufu               (33,501)
3. Ye Shunguang / Dialyn / Sunna          (42,138)
```

**BENCHMARKED TOTAL: 112,829** (2026-06-14 Shiyu Critical Node, Room 3 optimized on second run)

Strengths:

- Highest proven total across all tested configurations.
- YSG/Dialyn/Sunna is the highest single-room score (42,138 optimized, 41,506 first run) across all sessions documented.
- Astra goes to Miyabi where hybrid scaling gets maximum value — proven 4,332 point advantage over Yuzuha.
- Clean lockout: no duplicate agents, every support allocated to where they give maximum marginal gain.
- Evelyn M3/W1, Vivian M2/W1, Yuzuha M0/W1, Alice M1/W1 all on bench = deep flex reserve.

Weaknesses:

- Evelyn M3 benched despite highest account investment. Feels wrong. Is correct.
- Yixuan loses Dialyn but keeps Lucia + Ju Fufu — 400 point cost vs Dialyn variant, overwhelmingly compensated by Room 3 gains.
- If Physical is resisted in YSG's room, the whole package needs restructuring.

Best when:

- One room wants Ice/Anomaly/Abloom.
- One room wants Sheer/Rupture.
- One room wants Physical/crit burst (or Fire+Physical where Physical catches more buffs).

### Package A-Classic — Original bible default (SUPERSEDED)

```text
1. Evelyn / Ju Fufu / Astra Yao
2. Yixuan / Lucia / Dialyn
3. Alice / Vivian / Yuzuha
```

Projected ~100K. Superseded by benchmarked Package A variant above. Preserved for reference.

### Package B — Ice/Anomaly emphasis

```text
1. Miyabi / Vivian / Yuzuha
2. Yixuan / Lucia / Dialyn
3. Evelyn / Ju Fufu / Astra Yao
```

Strengths:

- Covers Ice/Anomaly, Rupture, and Fire Attack.
- Keeps Evelyn premium team intact.
- Uses Yuzuha in Anomaly instead of Jane if Physical is resisted.

Weaknesses:

- Jane M3/W1 sits out.
- Need verify Miyabi/Vivian/Yuzuha passive and Disorder quality.

Best when:

- Room 1 favors Ice/Anomaly or Abloom and resists Physical.
- Room 2 favors Sheer/Rupture.
- Room 3 favors Fire/crit.

### Package C — Physical analytics emphasis

```text
1. Ye Shunguang / Dialyn / Sunna
2. Yixuan / Lucia / Ju Fufu
3. Aria / Nangong Yu / Yuzuha or Astra Yao
```

Strengths:

- Leans into Prydwen high-score Physical/Yunkui/Support performers.
- Gives Yixuan his preferred Lucia + Ju Fufu shell.
- Preserves an Angels/Ether-Anomaly room team.

Weaknesses:

- Ye's CRIT DMG is not finished.
- Third team depends heavily on room resistance.
- Evelyn may be benched despite strong account investment.

Best when:

- Current phase rewards Physical heavily and does not resist it.
- Evelyn's Fire rooms are weaker or covered by Ju Fufu/Yixuan need.

### Package D — If Astra must go to weakest team

```text
1. Evelyn / Ju Fufu / Sunna
2. Yixuan / Lucia / Dialyn
3. Miyabi / Vivian / Astra Yao
```

Rationale:

- Strong teams can sometimes function with specialized support instead of Astra.
- Put Astra where she raises the floor of a less polished team.

Caution:

- Only do this when the room assignment supports it. Astra remains Evelyn's best listed teammate.

---

## Room-Signal Mapping

Use this table before proposing teams.

| Room/Boss signal | First roster shells to test |
|---|---|
| Fire + crit/ATK/EX/Chain/Ultimate | Evelyn / Ju Fufu / Astra |
| Fire + Physical + crit | Evelyn shell or Ye/Dialyn/Sunna, depending resistances |
| Sheer DMG / Rupture / Rapture | Yixuan or Yidhari / Lucia / Ju Fufu or Dialyn |
| Physical recommended, no Physical resist | Ye/Dialyn/Sunna, Alice/Vivian/Yuzuha, or Alice/Jane/Yuzuha if mono-Physical/M3-Jane angle fits |
| Physical resisted | Avoid Jane/Ye as primary; use Miyabi/Yixuan/Evelyn/Aria depending buffs |
| Ice recommended + Anomaly/Abloom | Miyabi anomaly shell; consider Aria if Abloom-specific and Ether not resisted |
| Ice recommended + Sheer/Rupture | Yidhari / Lucia / Ju Fufu or Dialyn |
| Ether recommended / Abloom / Angels | Aria / Nangong Yu / Sunna; Vivian/Yuzuha anomaly shells if not field-time conflicting |
| Ether resisted | Avoid Aria/Vivian/Yixuan/Astra personal-damage reliance; Astra may still support if worth it |
| Anomaly/Disorder buff | Alice or Jane + Vivian + Yuzuha first; Burnice as Fire/fallback; Miyabi + Vivian/Nangong + support if Ice favored |
| Stun/burst window | Attack DPS + Ju Fufu/Dialyn/Trigger + Support |
| Deadly Assault mechanic task | Boss task first, then DPS. Do not ignore scoring mechanics for prettier team grammar. |

---

## Current Three-Room Draft Revisited with Better Grammar

Based on the screenshots from 2026-06-14:

### Room 1

Spec:

- AP +30.
- Abloom +20% DMG.
- Ice DMG +20% after EX for 15s.
- Recommended Ice.
- Physical resistance.

Better candidate shells:

```text
Miyabi / Vivian / Yuzuha
# or Miyabi / Nangong Yu / Yuzuha if anomaly-stun support is better
```

If Abloom/Ether is central and Ether is not resisted:

```text
Aria / Nangong Yu / Sunna
```

If Ice/Rupture is better than Anomaly:

```text
Yidhari / Lucia / Ju Fufu or Dialyn
```

Correction from earlier:

- `Miyabi / Yidhari / Astra` is probably too sussy unless treating it as a specific dual-carry/attribute-stack plan. Better to decide whether Room 1 is **Ice Anomaly** or **Ice Rupture**, then build that archetype.

### Room 2

Spec:

- Sheer DMG +35%.
- Physical DMG +10%.
- Basic/EX/Ultimate ignore 10% Physical RES.
- Recommended Fire + Physical.
- Resists Ice + Wind.

Better candidate shells:

```text
Yixuan / Lucia / Dialyn
```

or

```text
Yixuan / Lucia / Ju Fufu
```

If Yixuan is underperforming due to Ether/matchup or crit farm:

```text
Ye Shunguang / Dialyn / Sunna
```

or

```text
Alice / Vivian / Yuzuha
# or Alice / Jane Doe / Yuzuha if mono-Physical M3-Jane angle fits
```

Correction from earlier:

- `Yixuan / Evelyn / Astra` mixes two main damage plans and spends Astra without Rupture-specific logic. It should not be default.

### Room 3

Spec:

- ATK +10%.
- Basic/EX/Chain +20% DMG.
- Initial Energy +40.
- CRIT DMG +30%.
- Recommended Fire + Physical.
- Ether resistance.

Better candidate shell:

```text
Evelyn / Ju Fufu / Astra Yao
```

If Astra's Ether presence is a concern or she is locked:

```text
Evelyn / Ju Fufu / Sunna
```

Physical alternate:

```text
Ye Shunguang / Dialyn / Sunna or Astra Yao
```

Correction from earlier:

- The Evelyn/Ju Fufu/Astra instinct was actually structurally good, but should be framed as a proper **Fire Attack hypercarry** and checked against lockout/support allocation.

### First serious lockout draft for these screenshots

Assuming three rooms lock agents and gear:

```text
Room 1: Miyabi / Vivian / Yuzuha
Room 2: Yixuan / Lucia / Dialyn
Room 3: Evelyn / Ju Fufu / Astra Yao
```

Why this is cleaner:

- Room 1 gets Ice/Anomaly logic and avoids Physical resistance.
- Room 2 gets Rupture/Sheer logic with Lucia + Dialyn.
- Room 3 gets Fire/crit hypercarry with Evelyn + Ju Fufu + Astra.
- No duplicate agents.
- Each team has one coherent primary damage plan.

Possible swap:

```text
Room 1: Aria / Nangong Yu / Sunna
Room 2: Yixuan / Lucia / Dialyn
Room 3: Evelyn / Ju Fufu / Astra Yao
```

Use if Room 1's Abloom/Angels/Ether angle matters more than the Ice modifier and Ether is not resisted.

---

## Clio Future Behavior Rules

1. Start from these shells, not from random color matching.
2. Never recommend a dual-carry team without labeling it as dual-carry/quick-swap and explaining why.
3. Astra is premium but not infinite; lockout planning must ration her. **Proven best with Miyabi (hybrid scaling) over pure Anomaly carries.**
4. Lucia is the default Rupture support on Andres's roster.
5. **Yuzuha is the default Anomaly/Disorder support for PURE Anomaly carries (Alice, Jane). NOT for Miyabi.** Miyabi is hybrid — use Astra.
6. Vivian is the default premium Anomaly sub-DPS/enabler; Burnice is fallback or Fire-specific.
7. Ju Fufu is contested between Evelyn and Rupture teams.
8. Dialyn is not just "Physical Stun"; she is a Rupture-synergy stunner AND YSG's proven best stunner.
9. Sunna is high-value in current Shiyu data and part of both the premium Angels core AND the premium YSG Physical core.
10. Seed requires another Attack Agent; use Cissia/other Attack partner, not Seed/Trigger/Astra by default.
11. Zhao's current analytics are high, but Andres's Zhao is low investment and Miyabi/Zhao is sussy until specifically justified. Treat Zhao as promising utility, not automatic carry.
12. If an enemy resists the primary damage attribute, downgrade the shell unless the room buff overwhelmingly compensates.
13. **YSG is the silent hypercarry. In Physical-friendly rooms, she outscores Evelyn M3 consistently. Stop defaulting to Evelyn.** Benchmarked: 46,920 (DA), 42,104 (Shiyu March), 42,138 (Shiyu June). Pattern is structural, not lucky.
14. **Room CRIT DMG buffs patch YSG's CD deficit for free.** Always check room modifiers before benching her for stats.
15. **Stun windows > Disorder for hybrid carries.** Nangong + Astra outperformed Vivian + Yuzuha for Miyabi by 4,332 points. Burst > sustain when the carry scales off ATK/CRIT.

---

## Source URLs

- Prydwen Shiyu Defense Analytics: https://www.prydwen.gg/zenless/shiyu-defense
- Icy Veins Astra Yao Teams: https://www.icy-veins.com/zenless-zone-zero/astra-yao-teams
- Icy Veins Yixuan Teams: https://www.icy-veins.com/zenless-zone-zero/yixuan-teams
- Icy Veins Lucia Teams: https://www.icy-veins.com/zenless-zone-zero/lucia-teams
- Icy Veins Ju Fufu Guide: https://www.icy-veins.com/zenless-zone-zero/ju-fufu-guide-best-builds
- Icy Veins Vivian Teams: https://www.icy-veins.com/zenless-zone-zero/vivian-teams
- Icy Veins Yuzuha Teams: https://www.icy-veins.com/zenless-zone-zero/ukinami-yuzuha-teams
- Icy Veins Alice Teams: https://www.icy-veins.com/zenless-zone-zero/alice-thymefield-teams
- Icy Veins Jane Doe Build/Teams notes: https://www.icy-veins.com/zenless-zone-zero/jane-doe-guide-best-builds
- Icy Veins Aria Teams: https://www.icy-veins.com/zenless-zone-zero/aria-teams
- Icy Veins Nangong Yu Teams: https://www.icy-veins.com/zenless-zone-zero/nangong-yu-teams
- Icy Veins Seed Guide: https://www.icy-veins.com/zenless-zone-zero/seed-guide-best-builds
- Icy Veins Cissia Teams: https://www.icy-veins.com/zenless-zone-zero/cissia-teams
- Icy Veins Cissia Kit: https://www.icy-veins.com/zenless-zone-zero/cissia-profile-skills-mindscapes
- Icy Veins Burnice Teams: https://www.icy-veins.com/zenless-zone-zero/burnice-white-teams
- Icy Veins Pan Yinhu Teams: https://www.icy-veins.com/zenless-zone-zero/pan-yinhu-teams
- Icy Veins Belion Bangboo: https://www.icy-veins.com/zenless-zone-zero/belion-bangboo
- Icy Veins Shiyu Defense Guide: https://www.icy-veins.com/zenless-zone-zero/shiyu-defense
- Prydwen Attributes & Specialties: https://www.prydwen.gg/zenless/guides/agents-attributes
- ZenlessTools Team Builder: https://zenlesstools.online/tools/team-builder
- ItemD2R Ju Fufu Team Compositions: https://www.itemd2r.com/en/blog/zenless-zone-zero/zless-zone-zero-ju-fufu-team-compositions-and-best-partners

---

## Uncertainty Flags

- ZZZ meta changes quickly by patch and rotation. Verify active Shiyu/DA buffs and enemy resistances each time.
- Some guide sites summarize or scrape; prefer Prydwen/Icy/current in-game tooltips when they conflict.
- Additional Ability conditions are per-agent and must be verified in-game before final lock.
- Bangboo roster is not in the dashboard; future Clio should ask for or maintain a Bangboo list.
- Equipment locking matters in Stage 5 / Deadly Assault; dashboard does not currently capture full drive/W-Engine conflict details.
- Cissia is owned by Andres but not yet represented in dashboard data; verify her level/investment before final team ranking.


---

## Benchmark Log

### 2026-06-14 — Shiyu Critical Node, Full Three-Room Benchmark

**Final optimized lockout: 112,197**

| Room | Comp | Total | Damage | PP | Carry DMG% | Notes |
|---|---|---:|---:|---:|---:|---|
| 1 | Miyabi / Nangong / Astra | **37,190** | 32,190 | 5,000 | 79.6% | Astra > Yuzuha by 4,332. Hybrid scaling proven. |
| 2 | Yixuan / Lucia / Dialyn | **33,901** | 28,901 | 5,000 | 90.7% | Dialyn > Ju Fufu by 400. Sheer Force scaling wins. |
| 3 | YSG / Dialyn / Sunna | **41,506** | 36,506 | 5,000 | 95.1% | Beat Evelyn M3 by 7,535. Session high. |

**Full benchmark data (all runs, chronological):**

| Room | Comp | Total | Damage | PP | Key finding |
|---|---|---:|---:|---:|---|
| R1 | Miyabi / Vivian / Yuzuha | 32,571 | 27,571 | 5,000 | Baseline. Vivian 32.8% distributed damage. |
| R1 | Miyabi / Nangong / Yuzuha | 32,858 | 27,858 | 5,000 | Stun > Disorder by 287. |
| R1 | Miyabi / Nangong / Astra | **37,190** | 32,190 | 5,000 | **Astra > Yuzuha by canyon.** |
| R2 | Yixuan / Lucia / Dialyn | **33,901** | 28,901 | 5,000 | **Dialyn wins.** Sheer Force 400% scaling. |
| R2 | Yixuan / Lucia / Ju Fufu | 33,501 | 28,501 | 5,000 | Ju Fufu CRIT buffs insufficient. |
| R3 | Evelyn / Dialyn / Astra | 33,971 | 28,971 | 5,000 | Evelyn M3 baseline. Dialyn 15.5%. |
| R3 | YSG / Dialyn / Sunna | 41,506 | 36,506 | 5,000 | Gut call. Session-defining. |
| R3 | YSG / Dialyn / Sunna (run 2) | **42,138** | 37,138 | 5,000 | **"I can't help myself." +632 from mechanical optimization.** |

**Key session findings:**

1. **YSG > Evelyn M3 in Physical-friendly rooms.** 7,535 point gap. Not marginal. Structural. Promoted to Shell 2b.
2. **Astra > Yuzuha for Miyabi.** 4,332 point gap. Miyabi is hybrid, not pure Anomaly. Astra buffs the whole girl.
3. **Stun windows > Disorder for hybrid carries.** Nangong outperformed Vivian by 287 for Miyabi.
4. **Dialyn > Ju Fufu for Yixuan.** 400% Sheer Force scaling > CRIT DMG buffs. 400 point gap.
5. **Room signal > raw investment.** M1 YSG with deficit CD in a +30% CD room obliterated M3 Evelyn. Room buffs are force multipliers, not consolation prizes.
6. **Cross-room lockout optimization matters.** Moving Dialyn from Room 2 to Room 3 cost 400 points but gained 7,535. Net +7,135. Always think across rooms.

**Credit:** Andres's gut found YSG and Astra reallocation. Clio's bible provided the framework to benchmark systematically. The dynamic works.
