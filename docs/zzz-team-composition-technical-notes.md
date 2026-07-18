# ZZZ Team Composition Technical Notes

Working document for building a future Hermes/Clio skill for Zenless Zone Zero team planning across Shiyu Defense, Deadly Assault, and similar endgame modes.

Created from Chibi-Clio research swarm on 2026-06-14 after Andres correctly flagged that initial team suggestions were too vibes-based and violated core ZZZ composition grammar.

## Purpose

When planning ZZZ teams, do **not** start from element matching alone. A valid team needs:

1. A coherent **damage plan**.
2. Correct **role grammar** for that damage plan.
3. Active **Additional Abilities / Core Skill conditions** where possible.
4. A mode-aware assignment strategy, especially when teams/gear/Bangboo lock.
5. A current-room check for buffs, weaknesses, resistances, enemy mechanics, and scoring rules.

This doc is intentionally technical and correction-oriented. It exists to prevent sussy team comps like stacking multiple main carries with no role logic, reusing locked supports, or treating every recommended attribute as equivalent.

---

## 1. ZZZ Team-Building Grammar

### 1.1 Team Shape

A standard ZZZ combat team is:

- **3 Agents**
- **1 Bangboo**

The fourth circular slot in some UI screenshots may show the Bangboo/assist slot depending on context; do not assume it means a fourth Agent unless the mode explicitly supports one.

### 1.2 Additional Ability / Core Skill Activation

Most agents have an Additional Ability condition. Historically this was often:

- Same **Faction**, or
- Same **Attribute**

However, newer agents can require different conditions, such as:

- Same **Specialty**
- A specific companion specialty
- A specific mechanic/attribute pairing

**Rule:** Before finalizing a serious team, verify each selected agent's Additional Ability condition from in-game tooltip or a current database. Do not infer from old launch-era patterns.

### 1.3 Attribute Matching Is Necessary but Not Sufficient

Recommended attributes and enemy weaknesses matter, but they do not automatically produce a good team.

Bad pattern:

- "Room recommends Fire/Physical, so use every Fire/Physical carry."

Good pattern:

- Pick the room's best matching **primary damage archetype**, then fill the supporting roles that make that archetype function.

### 1.4 Bangboo Synergy

Bangboo selection should follow the team plan:

- Match team attribute/faction requirements where possible.
- Prefer a synergistic A-rank Bangboo over a mismatched S-rank Bangboo if the passive condition is important.
- In lockout modes, Bangboo are often locked too, so do not assign the same one to multiple rooms/bosses unless the mode permits reuse.

---

## 2. Agent Specialties / Core Roles

### 2.1 Attack

**Primary job:** direct crit-scaling DPS.

Typical stats:

- ATK
- CRIT Rate
- CRIT DMG
- PEN / PEN Ratio depending on kit

Typical team grammar:

- **Attack DPS + Stun + Support**
- Sometimes **Attack DPS + Support + Support** if the DPS can operate without stun or if the content rewards frontloaded damage.
- Sometimes dual-DPS/quick-swap if specific kits support it, but this is not the default assumption.

Rotation logic:

1. Stunner builds Daze.
2. Support applies buff/debuff.
3. Attack DPS unloads burst during stun or buff window.

Examples from Andres's roster:

- Evelyn: Fire Attack, M3/W1, high-investment carry. Strong candidate for Fire/crit/burst rooms.
- Ye Shunguang: Physical Attack, M1/W1, but dashboard flags CRIT DMG farming need.
- Seed: Electric Attack, M0/W1, dashboard flags CRIT Rate farming need.
- Ellen: Ice Attack, M0/W0, low investment/benched.

### 2.2 Stun

**Primary job:** build Daze and create stun windows.

Typical stats:

- Impact
- Energy Regen / EX uptime when relevant

Team grammar:

- The standard hypercarry shell is **DPS + Stun + Support**.
- A stunner is especially valuable for Attack carries that spike during stun windows.
- Some modern stunners may have off-field or hybrid mechanics, so verify exact kit.

Examples from Andres's roster:

- Dialyn: Physical Stun, M0/W1.
- Ju Fufu: Fire Stun, M0/W1.
- Trigger: Electric Stun, M0/W1.
- Lighter: Fire Stun, M0/W0, low investment.
- Nangong Yu: Ether Stun / Anomaly-Stun hybrid, M0/W1, sig Lv60. Dashboard says good baseline, AP next.

### 2.3 Anomaly

**Primary job:** apply Attribute Anomalies and/or trigger Disorder.

Typical stats:

- Anomaly Mastery: buildup speed.
- Anomaly Proficiency: anomaly damage.
- ATK may still matter depending on kit/snapshot.

Important mechanics:

- Anomaly damage generally does not crit.
- Anomaly teams care about buildup, application order, and Disorder timing.
- Disorder occurs when a second different Attribute Anomaly interacts with an existing one.

Team grammar:

- **Anomaly + Anomaly + Flex** for Disorder teams.
- Flex is usually Support, Stun, or a specialist who enables the anomaly loop.
- Mono/near-mono anomaly can work if the kit rewards it, but do not assume Disorder exists without different anomaly attributes.

Examples from Andres's roster:

- Jane Doe: Physical Anomaly, M3/W1, high-investment carry; dashboard says confirm in-combat AP before heavy refarm.
- Alice: Physical Anomaly, M1/W1; dashboard says farm AP.
- Miyabi: Ice/Frost Anomaly, M1/W1; dashboard says farm CRIT DMG.
- Vivian: Ether Anomaly, M2/W1.
- Burnice: Fire Anomaly, M0/W1.
- Aria: Ether Anomaly / Abloom, M0/W1; dashboard says sheet AP has room but in-combat AP is healthy via sig/set.

### 2.4 Support

**Primary job:** buff allies, debuff enemies, provide energy/utility/healing depending on kit.

Typical stats:

- Energy Regen.
- ATK or other kit-specific scaling stat.
- Whatever stat the support's buff uses.

Team grammar:

- Most teams want one support.
- Universal supports are often the highest-pressure lockout resource.
- Do not assign the same universal support to every room in a lockout mode.

Examples from Andres's roster:

- Astra Yao: Ether Support, M1/W1, universal support. Extremely valuable but must be rationed in Stage 5 / Deadly Assault if locked.
- Lucia: Ether Support, M0/W1.
- Yuzuha: Physical Support, M0/W1.
- Sunna: Physical Support, M0/W1.
- Zhao: Ice Defense/Support-like unit, M0/W0, low investment but potentially high utility depending current kit/meta.

### 2.5 Defense

**Primary job:** shields, mitigation, counters, defensive utility; many Defense agents function as hybrid supports.

Typical stats:

- HP / DEF depending on shield scaling.
- Impact or Energy Regen if kit needs it.

Team grammar:

- Defense can replace Support or flex slot if the unit provides enough buffs/utility.
- Do not treat Defense as dead weight; modern Defense units can be damage amplifiers.
- But for score/time modes, only bring Defense if it actively improves uptime, buffs, or survival enough to increase score.

Examples from Andres's roster:

- Zhao appears as Support in the dashboard but may function closer to Ice Defense/support utility depending current ZZZ taxonomy. Verify in-game.

### 2.6 Rupture

**Primary job:** Sheer/Special damage track, often less dependent on normal DEF-reduction rules.

Important caveat:

- Rupture is newer than the original five specialties. Public source quality is weaker and more patch-sensitive. Exact formulas should be verified from in-game/current guides.

Common claims from community sources:

- Rupture uses Sheer DMG / Sheer Force mechanics.
- Rupture may not benefit equally from ordinary ATK buffs or DEF shred.
- Dedicated Rupture supports/buffs can matter more than generic Attack support.
- Some Rupture agents may use nonstandard resources such as Adrenaline-like mechanics rather than conventional Energy.

Team grammar:

- **Rupture DPS + appropriate Support + Stun/Flex**.
- In rooms that explicitly buff Sheer DMG, prioritize Rupture agents over generic Physical/Fire matching unless the roster investment gap is massive.

Examples from Andres's roster:

- Yixuan: Ether Rapture/Rupture, M1/W1, dashboard says farm CRIT Rate and CRIT DMG.
- Yidhari: Ice Rapture/Rupture, M0/W1, dashboard says farm CRIT DMG.

Note: Andres's dashboard uses `RAPTURE`; community sources often use `Rupture`. Treat as the same specialty family unless the game client distinguishes them differently in the current patch.

---

## 3. Core Team Archetypes

### 3.1 Hypercarry / Burst

Default form:

- **Main DPS + Stun + Support**

Use when:

- Main DPS is Attack or crit-scaling damage dealer.
- Room rewards stun/burst/chain/EX/Ultimate/CRIT.
- Enemy has high uptime vulnerability during stun.

Planning checklist:

- Does the DPS match weakness or avoid resistance?
- Does the stunner match team condition or element/faction when needed?
- Does the support activate the DPS/stunner Additional Ability?
- Does the support's buff actually help the DPS damage type?

### 3.2 Anomaly / Disorder

Default form:

- **Anomaly A + Anomaly B + Support/Flex**

Use when:

- Room buffs Anomaly Proficiency, buildup, Disorder, Abloom, or anomaly-specific effects.
- Enemy is not resistant to the relevant attributes.
- The two anomaly agents can create meaningful anomaly interactions.

Planning checklist:

- Do the anomaly attributes differ if Disorder is the plan?
- Is the flex amplifying anomaly damage/buildup, or just matching an attribute symbol?
- Are AP/AM thresholds good enough from the dashboard?
- Is the room rewarding anomaly damage or just generic damage?

### 3.3 Mono / Attribute Stack

Default form:

- Three agents that share an attribute/faction enough to activate passives and Bangboo.

Use when:

- Room strongly favors one attribute.
- Agent Additional Abilities line up naturally.
- Bangboo passive strongly rewards same attribute/faction.

Caution:

- Mono teams can fail if they lack role grammar. Three Ice units is not automatically better than Ice DPS + correct support + correct stunner.

### 3.4 Rupture / Sheer Team

Default form:

- **Rupture DPS + Rupture-compatible Support + Stun/Flex**

Use when:

- Room buffs Sheer DMG, Sheer Force, Rupture, or similar mechanics.
- Boss has resistance profile that does not punish the Rupture agent's attribute.

Caution:

- Generic ATK buffs, DEF shred, or anomaly supports may be less valuable for Rupture than for Attack/Anomaly carries. Verify with current kit data.

### 3.5 Dual Carry / Quick-Swap

Default form:

- **Carry A + Carry B + Support/Flex**

Use only when:

- Agents' kits explicitly support quick-swap or off-field damage.
- Room demands two damage profiles and role compression is available.
- You are intentionally sacrificing stun/support structure for rotation uptime.

Caution:

- Do not casually pair two on-field carries because both match the recommended attribute.

---

## 4. Endgame Mode Rules

### 4.1 Shiyu Defense — General

Shiyu Defense is a recurring endgame DPS/scoring mode.

General planning priorities:

1. Read room buffs.
2. Read recommended attributes.
3. Read enemy resistances.
4. Identify whether the room is asking for Attack, Anomaly, Stun, Rupture, Defense/counter, or generic burst.
5. Build a coherent team archetype.
6. Distribute locked agents/Bangboo/gear across teams if the stage locks them.

### 4.2 Shiyu Defense Critical Node / Stage 5 Style Rooms

Current screenshot pattern from Andres's 2026-06-14 cycle:

Each room has:

- S/A/B point thresholds.
- Damage Score.
- Elimination Score.
- Time-based score multiplier text partially visible.
- Recommended attributes.
- Powerful enemy resistances.
- Level 70 enemy card.

Known current-room examples from the screenshots:

#### Room 1

- Buffs:
  - Agent Anomaly Proficiency +30.
  - Abloom +20% DMG.
  - After EX Special Attack, Ice DMG +20% for 15s; retriggers reset duration.
- Recommended: Ice.
- Resistance: Physical.
- Planning implication:
  - Ice + Anomaly/Abloom emphasis.
  - Avoid Physical damage as a primary plan.
  - Candidate archetypes: Ice Anomaly, Abloom/Ether anomaly if not resisted and room mechanics justify it, but still obey team grammar.

#### Room 2

- Buffs:
  - Sheer DMG +35%.
  - Physical DMG +10%.
  - Basic/EX/Ultimate ignore 10% enemy Physical RES on hit.
- Recommended: Fire, Physical.
- Resistances: Ice, Wind.
- Planning implication:
  - Strong Rupture/Sheer signal.
  - Physical is supported, but Sheer buff is larger.
  - Avoid Ice/Wind primary damage.
  - Candidate archetypes: Rupture team, Physical hypercarry/anomaly if Rupture roster is weaker, Fire hypercarry if investment gap is decisive.

#### Room 3

- Buffs:
  - ATK +10%.
  - Basic/EX/Chain Attack DMG +20%.
  - Initial Energy +40.
  - Bonus CRIT DMG +30%.
- Recommended: Fire, Physical.
- Resistance: Ether.
- Planning implication:
  - Crit/burst/Attack-friendly room.
  - Fire/Physical hypercarry is preferred.
  - Avoid Ether personal damage as primary plan, though an Ether support may still be acceptable if their value is mostly buffs and they are not needed elsewhere.

### 4.3 Shiyu Stage 5 / Multi-Room Lockout Heuristic

If Stage 5 has three one-team rooms and agent/Bangboo/equipment lock applies:

1. Do **not** reuse Astra/Yuzuha/Lucia/Sunna/Bangboo across all three rooms.
2. Assign scarce universal supports where they raise the weakest viable team, not automatically to the strongest carry.
3. Treat each room as a draft problem:
   - Room asks for a damage type.
   - Roster offers candidate carries.
   - Supports/stunners are rationed.
   - Gear/Bangboo must not conflict.
4. Save best-fit carry for the room where they gain the most from buffs and avoid resistance.
5. If one room has a huge buff for a weaker carry, use that buff to free a stronger carry for another room.

### 4.4 Deadly Assault

Deadly Assault is a 3-boss score mode.

Common rules from research:

- Three bosses.
- Three separate teams.
- Agents and Bangboo generally cannot be repeated across bosses after locked.
- Equipment may also be locked depending current implementation.
- Full premium reward often requires fewer than perfect stars; do not over-optimize the weakest team if rewards are already secured.

Planning priorities:

1. Boss weakness/resistance.
2. Boss-specific mechanics/performance-point tasks.
3. Seasonal selectable buff.
4. Roster's top 2 teams get hardest/restrictive bosses.
5. Weakest team gets easiest boss or the boss where mechanics can compensate for damage.

Deadly Assault warning:

- Raw DPS is not the only scoring source. Boss tasks/performance points can dominate. If the boss asks for parries, destroying clones, triggering impaired status, anomaly stacks, etc., the team must satisfy that mechanic even if another team has better sheet DPS.

---

## 5. Screenshot-Based Planning Procedure for Clio

When Andres sends Shiyu/Deadly Assault screenshots, follow this exact order.

### Step 1 — Extract the room spec

Record:

- Room number / boss name.
- Enemy level.
- Recommended attributes.
- Powerful enemy resistances.
- Full visible modifier text.
- Cut-off/scroll indicators.
- Score target thresholds.
- Any visible time/scoring multipliers.

### Step 2 — Classify the room signal

Ask what the room is actually rewarding:

- Attack / crit burst?
- Anomaly / Disorder / Abloom?
- Rupture / Sheer?
- Stun / Daze / Chain Attack?
- Defensive Assist / parry / survival?
- Specific Attribute DMG?
- Generic damage with time multiplier?

### Step 3 — Filter candidates

For each roster candidate:

- Is their primary damage resisted?
- Do they benefit from the room buff?
- Are they built enough according to dashboard audit?
- Do they need a specific support/stunner to function?
- Are they already needed harder elsewhere?

### Step 4 — Build by archetype, not by color matching

Choose one:

- Hypercarry: DPS + Stun + Support.
- Anomaly/Disorder: Anomaly + Anomaly + Flex.
- Rupture: Rupture DPS + Rupture-compatible support + flex/stun.
- Mono/Attribute: only if passives and roles still make sense.
- Mechanic team: boss task first, DPS second.

### Step 5 — Check lockout resources

Before final answer:

- Are any Agents reused across locked rooms?
- Are any Bangboo reused across locked rooms?
- Are any W-Engines/Drive Discs locked/duplicated in the mode?
- Did we spend all universal supports too early?

### Step 6 — Produce two outputs

1. **Technical spec** for the room.
2. **Team draft with confidence level**:
   - Primary team.
   - Alternate team.
   - Why each agent is there.
   - What would make the answer change.

Never present a first-pass team as final if enemy Details, exact Additional Abilities, Bangboo roster, or gear locks are unknown.

---

## 6. Andres Roster Notes from Dashboard

Source: `/opt/data/projects/zzz-dashboard/data.json`, updated 2026-04-11.

### High-value / invested agents

- Evelyn — Fire Attack, M3/W1, high investment carry, core stats online.
- Jane Doe — Physical Anomaly, M3/W1, high investment carry; AP confirmation needed.
- Astra Yao — Ether Support, M1/W1, universal support.
- Vivian — Ether Anomaly, M2/W1.
- Miyabi — Ice Anomaly, M1/W1; needs CRIT DMG farming.
- Yixuan — Ether Rapture/Rupture, M1/W1; needs CRIT Rate and CRIT DMG.
- Ye Shunguang — Physical Attack, M1/W1; needs CRIT DMG.
- Alice — Physical Anomaly, M1/W1; needs AP.

### Useful role pieces

- Ju Fufu — Fire Stun, M0/W1.
- Dialyn — Physical Stun, M0/W1.
- Trigger — Electric Stun, M0/W1.
- Nangong Yu — Ether Stun/Anomaly-Stun hybrid, M0/W1; good baseline, AP next.
- Yuzuha — Physical Support, M0/W1.
- Sunna — Physical Support, M0/W1.
- Lucia — Ether Support, M0/W1.
- Zhao — Ice Support/Defense-like slot, M0/W0, dashboard marks low investment.

### Farming pressure

- Branch & Blade Song priority for Miyabi/Yidhari.
- Several crit carries remain CD/CR constrained.
- Several Anomaly units need AP confirmation/farming.

---

## 7. Correction Notes from This Session

These are the mistakes this skill must prevent.

### Mistake 1 — Reusing Astra everywhere

Astra is a universal support, but in Stage 5 / Deadly Assault lockout contexts she cannot be assumed available for every room.

Correct behavior:

- First draft may mention "if reuse is allowed".
- Serious draft must allocate unique teams.

### Mistake 2 — Treating a 4th slot as a 4th Agent

ZZZ combat teams are normally 3 Agents + Bangboo. UI slots can mislead.

Correct behavior:

- Do not recommend four Agents unless confirmed by mode.

### Mistake 3 — Pairing carries without role grammar

E.g., suggesting Yixuan + Evelyn + Astra without verifying if Yixuan and Evelyn are fighting for the same on-field/burst role or whether the room supports dual-carry quick-swap.

Correct behavior:

- Identify one main damage plan.
- Pick the support/stunner/flex that enables it.

### Mistake 4 — Overweighting recommended attributes

Recommended attributes are filters, not team structure.

Correct behavior:

- Use recommended attributes after selecting archetype.
- Enemy resistances are often more important than recommendations.

### Mistake 5 — Ignoring Additional Abilities

Modern ZZZ agents can have nonstandard Additional Ability conditions.

Correct behavior:

- Mark Additional Ability verification as required before final lock.

---

## 8. Source URLs from Research Swarm

Use these as starting points; verify live patch details in-game or from current databases.

- Prydwen ZZZ Guides / Analytics: https://www.prydwen.gg/zenless/
- Prydwen Shiyu Defense Analytics: https://www.prydwen.gg/zenless/shiyu-defense
- Icy Veins Shiyu Defense Critical Node: https://www.icy-veins.com/zenless-zone-zero/shiyu-defense-critical-node
- Icy Veins Deadly Assault: https://www.icy-veins.com/zenless-zone-zero/deadly-assault
- ZZZ Fandom Deadly Assault: https://zenless-zone-zero.fandom.com/wiki/Deadly_Assault
- ZZZ Fandom Shiyu Defense / Critical Node: https://zenless-zone-zero.fandom.com/wiki/Shiyu_Defense/Critical_Node
- ZZZ Fandom W-Engine / Specialties reference: https://zenless-zone-zero.fandom.com/wiki/W-Engine
- ZZZ Fandom Impact: https://zenless-zone-zero.fandom.com/wiki/Impact
- ZZZ Fandom Defense: https://zenless-zone-zero.fandom.com/wiki/Defense
- ZZZ Fandom Rupture: https://zenless-zone-zero.fandom.com/wiki/Rupture
- ZenlessTools Team Builder: https://zenlesstools.online/tools/team-builder
- TheGamer Deadly Assault guide: https://www.thegamer.com/zenless-zone-zero-zzz-complete-deadly-assault-guide/
- TOPUPlive Shiyu Defense 2.5 rework article: https://www.topuplive.com/article/zzz-2-5-shiyu-defense-rework-new-rules-and-rewards.html
- LDShop Deadly Assault guide: https://www.ldshop.gg/blog/guide/zzz-deadly-assault-guide.html
- GameMarket Deadly Assault rotation deep dive: https://gamemarket.gg/news/zenless-zone-zero/zzz-deadly-assault-guide-26-rotation-deep-dive
- Joytify ZZZ combat stats/mechanics guide: https://www.joytify.com/blog/en-us/rpg-others/zenless-zone-zero/zenless-zone-zero-combat-stats-mechanics-guide/
- GameRant character specialty overview: https://gamerant.com/zenless-zone-zero-character-specialty-explained-classrole/
- Eurogamer Agent specialties/attributes: https://www.eurogamer.net/zenless-zone-zero-agent-specialties-attributes
- HoYoLAB Agent/specialty guide: https://www.hoyolab.com/article/42896232
- Honey Hunter ZZZ class/specialty data: https://zzz.honeyhunterworld.com/6-class?lang=EN

---

## 9. Uncertainty Flags

- Patch-specific mode rules change. Always verify current in-game UI.
- Rupture/Rapture exact formulas are more source-fragile than original specialties.
- Agent Additional Ability conditions are per-agent and may differ from old faction/attribute rules.
- Prydwen analytics and community tier data are useful but not canon; treat as evidence, not gospel.
- Some sources use leaked or beta data. Exact numbers must be verified when the game UI/tooltips differ.

---

## 10. Future Skill Shape

Potential skill name: `zzz-team-building` under category `gaming`.

Skill trigger:

- Use when Andres asks for ZZZ team planning, Shiyu Defense, Deadly Assault, roster audit, room screenshot analysis, or multi-team lockout allocation.

Skill should include:

- Screenshot extraction checklist.
- Team archetype grammar.
- Andres dashboard lookup step.
- Lockout allocation rules.
- Output format:
  - Room spec.
  - Damage signal.
  - Candidate pool.
  - Primary draft.
  - Alternate draft.
  - Missing verification.

Style requirement:

- Research mode stays Clio/gyaru, but composition logic must be disciplined. Flirty is fine. Sussy teams are not.
