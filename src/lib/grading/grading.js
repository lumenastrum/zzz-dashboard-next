/*
 * ZZZ disc-grading engine — Soundsystem dashboard.
 * Pure functions, zero IO: the caller injects the parsed grading-config.json.
 * Same module powers the live browser UI (regrade on every edit) and a Node/Python-mirrored CLI.
 *
 * Model (per disc):
 *   discScore = mainStatPoints * mainWeightMultiplier  +  Σ_substats ( rolls × weight )
 *   maxScore  = 3 * mainWeightMultiplier                +  idealRollScore(slot, archetype)
 *   pct       = clamp(discScore / maxScore * 100)
 *   letter    = scale lookup (SSS … E)
 *
 * Weights come from the agent's archetype table; on slots 4 & 5 the "partner" of the chosen
 * main stat (e.g. ATK% ⇄ Anomaly Proficiency) gets boosted — the stat you DIDN'T take as the
 * main is more valuable as a substat. Roll count = ZZZ PropertyLevel (1–6).
 */

const ELEMENT_DMG = /(Physical|Fire|Ice|Electric|Ether|Wind|Frost|Auric|Lunar) DMG$/i;

/** Resolve an agent's archetype config (section map → override → merged weights). */
export function resolveArchetype(agent, cfg) {
  const ov = cfg.agentOverrides?.[agent.name];
  const name = ov?.archetype
    || cfg.sectionToArchetype[String(agent.section || "").toUpperCase()]
    || "attack";
  const base = cfg.archetypes[name];
  if (!base) throw new Error(`Unknown archetype "${name}" for ${agent.name}`);
  const weights = ov?.weights ? { ...base.weights, ...ov.weights } : base.weights;
  // Per-agent mainStatPoints: deep-merge each overridden slot OVER the archetype default, so a
  // kit-specific slot main (Rupture HP% on 6, Miyabi CRIT Rate on 4, Cissia/Velina Energy Regen on 6)
  // scores as the recommended main instead of falling to the off-meta `?? 1` — without dropping the
  // archetype's vanilla mains for that slot.
  let mainStatPoints = base.mainStatPoints;
  if (ov?.mainStatPoints) {
    mainStatPoints = { ...base.mainStatPoints };
    for (const slot of Object.keys(ov.mainStatPoints)) {
      mainStatPoints[slot] = { ...(base.mainStatPoints?.[slot] || {}), ...ov.mainStatPoints[slot] };
    }
  }
  return { ...base, weights, mainStatPoints, name };
}

/** Element-specific DMG mains all collapse to the "Attribute DMG" key for points lookup. */
function mainKey(stat) {
  return ELEMENT_DMG.test(stat || "") ? "Attribute DMG" : (stat || "");
}

/** Effective substat weight, applying the slot-4/5 partner boost. */
function effWeight(stat, slot, mainStat, A, cfg) {
  let w = A.weights[stat] ?? 0;
  if ((slot === 4 || slot === 5)
      && A.pairs?.includes(mainStat) && A.pairs?.includes(stat) && stat !== mainStat) {
    w = Math.max(w, cfg.partnerBoost);
  }
  return w;
}

/** Best achievable substat score for a slot: cap the top weight at 6 rolls, 1 roll each on the next 3. */
function idealRollScore(slot, mainStat, A, cfg) {
  const pool = Object.keys(A.weights)
    .map((s) => effWeight(s, slot, mainStat, A, cfg))
    .sort((a, b) => b - a);
  const [w0 = 0, w1 = 0, w2 = 0, w3 = 0] = pool;
  const cap = cfg.rollModel.maxRollsPerSub;       // 6
  const total = cfg.rollModel.totalRollsAtMax;    // 9
  const spill = Math.max(0, total - cap);         // 3 rolls spread on the other subs
  // distribute the spill 1-per-sub across w1..w3 (already their base roll); here base+0 since
  // the 4 subs each carry 1 base roll counted in `total`. Optimal = cap on w0, base on rest.
  return w0 * cap + (w1 + w2 + w3) * Math.min(1, spill);
}

function letterFor(pct, cfg) {
  return cfg.scale.find((t) => pct >= t.min) || cfg.scale[cfg.scale.length - 1];
}

/**
 * Grade a single disc.
 * piece = { slot, set, rank, level, main:{stat,value}, subs:[{stat, rolls, value}] }
 */
export function gradeDisc(piece, A, cfg) {
  const slot = piece.slot;
  const mStat = mainKey(piece.main?.stat || "");
  const mainPts = slot <= 3 ? 3 : (A.mainStatPoints?.[String(slot)]?.[mStat] ?? 1);

  let rollScore = 0;
  const subs = (piece.subs || []).map((s) => {
    const w = effWeight(s.stat, slot, piece.main?.stat, A, cfg);
    const contrib = (s.rolls || 1) * w;
    rollScore += contrib;
    return { ...s, weight: w, contrib: +contrib.toFixed(2), useful: w >= 2, dead: w === 0 };
  });

  const mult = cfg.mainWeightMultiplier;
  const score = mainPts * mult + rollScore;
  const maxScore = 3 * mult + idealRollScore(slot, piece.main?.stat, A, cfg);
  const pct = Math.max(0, Math.min(100, (score / maxScore) * 100));
  const tier = letterFor(pct, cfg);

  return {
    slot, set: piece.set || null, mainStat: piece.main?.stat || null,
    mainPts, mainStatOk: slot <= 3 || mainPts >= 2,
    rollScore: +rollScore.toFixed(2), pct: +pct.toFixed(1),
    letter: tier.letter, color: tier.color, subs,
  };
}

/** Tally sets across pieces; flag the ideal 4pc+2pc and list active bonuses. */
export function computeSets(pieces, cfg = {}) {
  const counts = {};
  for (const p of pieces) if (p.set) counts[p.set] = (counts[p.set] || 0) + 1;
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const active = sorted
    .filter(([, c]) => c >= 2)
    .map(([set, c]) => ({
      set, count: c, pc: c >= 4 ? 4 : 2,
      bonus: cfg.setBonuses?.[set]?.[c >= 4 ? "4pc" : "2pc"] || null,
    }));
  const top = sorted[0]?.[1] || 0;
  const second = sorted[1]?.[1] || 0;
  const ideal = top >= 4 && second >= 2;
  const note = ideal
    ? `${sorted[0][0]} 4pc + ${sorted[1][0]} 2pc`
    : (top >= 4 ? `${sorted[0][0]} 4pc (no 2pc partner)` : "Incomplete — no 4-set bonus");
  return { counts, active, ideal, note };
}

function suggest(discs, sets, A) {
  const out = [];
  if (!sets.ideal) out.push({ type: "set", msg: `Set bonus: ${sets.note}` });
  for (const d of discs) {
    if (d.slot > 3 && !d.mainStatOk) {
      out.push({ type: "main", slot: d.slot, msg: `Slot ${d.slot} main "${d.mainStat}" is off-meta for ${A.label || A.name}` });
    }
  }
  const weak = [...discs].sort((a, b) => a.pct - b.pct)[0];
  if (weak) out.push({ type: "reroll", slot: weak.slot, msg: `Weakest disc: Slot ${weak.slot} (${weak.letter} · ${weak.pct}%) — best re-roll target` });
  return out;
}

/** Character-screen value of a stat from the agent's seeded mainStats (null if unseeded). */
function sheetStatValue(agent, stat) {
  const row = (agent.mainStats || []).find((r) => r.stat === stat);
  return row ? _num(row.value) : null;
}

/**
 * Grade a whole agent build.
 * agent = { name, section, attribute, ..., discs:{ pieces:[ <piece> x6 ] } }
 *
 * Per-agent CRIT-Rate hard clamp: agentOverrides[name].targets["CRIT Rate"].cap sets the stat-screen
 * ceiling. If the seeded character-screen CRIT Rate is at/over it, extra CRIT Rate is wasted — we zero
 * its substat weight (and drop it from the partner pairs so the slot-4/5 boost can't revive it) so
 * CR-stacked discs grade honestly, and prepend a verdict redirecting those rolls to CRIT DMG.
 */
export function gradeBuild(agent, cfg) {
  const A0 = resolveArchetype(agent, cfg);
  const pieces = agent.discs?.pieces || [];

  const critCap = cfg.agentOverrides?.[agent.name]?.targets?.["CRIT Rate"]?.cap;
  const sheetCRIT = critCap != null ? sheetStatValue(agent, "CRIT Rate") : null;
  const capped = critCap != null && sheetCRIT != null && sheetCRIT >= critCap;
  const A = capped
    ? { ...A0, weights: { ...A0.weights, "CRIT Rate": 0 }, pairs: (A0.pairs || []).filter((p) => p !== "CRIT Rate") }
    : A0;

  const discs = pieces.map((p) => gradeDisc(p, A, cfg));
  const buildPct = discs.length ? discs.reduce((s, d) => s + d.pct, 0) / discs.length : 0;
  const sets = computeSets(pieces, cfg);
  const tier = letterFor(buildPct, cfg);
  const suggestions = suggest(discs, sets, A);
  if (capped) {
    suggestions.unshift({
      type: "cap", stat: "CRIT Rate",
      msg: `CRIT Rate capped (${sheetCRIT}% ≥ ${critCap}%) — extra CRIT Rate rolls are wasted; redirect to CRIT DMG`,
    });
  }
  return {
    agent: agent.name, archetype: A.name, archetypeLabel: A.label,
    buildPct: +buildPct.toFixed(1), buildLetter: tier.letter, buildColor: tier.color,
    discs, sets, suggestions,
    critCap: critCap ?? null, sheetCRIT, capped,
  };
}

/* ---- Sheet vs Effective stat sheet ---------------------------------------
 * Sheet     = the character-screen number = base + disc mains/subs + W-Engine base/advanced + sheet-scope set bonuses
 * Effective = Sheet + combat-only buffs    = W-Engine passive + combat-scope set bonuses
 * DMG% / Buildup effects never touch the sheet — returned as `buffs` for display.
 * agent.base    = back-solved hidden base stats keyed by stat (ATK/HP/DEF/CRIT Rate/.../Anomaly Mastery)
 *                 from scripts/derive-bases — computeSheet recomputes the screen from base + live discs.
 * agent.wengine = { name, base:{ATK}, advanced:{label}, passive:[ mod ] }   mod = {label,kind,stat,value,scope}
 */
const _num = (v) => (typeof v === "number" ? v : parseFloat(String(v).replace(/[^0-9.\-]/g, "")) || 0);

/** Merge a W-Engine's reference data (base ATK / advanced / passive — stripped by Enka imports,
 *  so they live in cfg.wengines keyed by name) UNDER the agent's own wengine fields (name/rank/
 *  refine win). The cartridge card and the Sheet-vs-Effective layer both read through this. */
export function resolveWengine(we, cfg) {
  if (!we) return null;
  const ref = cfg?.wengines?.[we.name] || {};
  const out = { ...ref, ...we };
  // Refine-aware passive: a catalog entry may list per-refine passives under `refines` (R1..R5) for
  // engines actually run at varying refinements (e.g. Courtney's A-ranks — Weeping Gemini R1 on Yanagi,
  // R2 on Vivian). base ATK + advanced stat are LEVEL-based (refine-independent); only the passive scales.
  // Falls back R<refine> → R1 → the flat `passive`. Entries without `refines` are unchanged (back-compat).
  if (ref.refines) {
    out.passive = ref.refines[we.refine] || ref.refines.R1 || ref.passive || [];
    delete out.refines;
  }
  return out;
}

/** Accumulate disc main + substat contributions into stat pools, using cfg.discMains (S-rank +15
 *  main values) and cfg.rollValues (per-roll substat values). Percentage pools carry the % number
 *  (30 = 30%); flat pools are raw. Element DMG mains collapse to "Attribute DMG" (skipped — not a
 *  sheet stat). Shared by computeStats (forward sheet) and scripts/derive-bases (inverse). */
export function discAccum(pieces, cfg) {
  const dm = cfg.discMains || {}, rv = cfg.rollValues || {};
  const a = { atkPct: 0, flatAtk: 0, hpPct: 0, flatHp: 0, defPct: 0, flatDef: 0, crPct: 0, cdPct: 0,
    apFlat: 0, amPct: 0, impactPct: 0, erPct: 0, penRatio: 0, flatPen: 0 };
  const route = {
    "ATK%": "atkPct", "ATK": "flatAtk", "HP%": "hpPct", "HP": "flatHp", "DEF%": "defPct", "DEF": "flatDef",
    "CRIT Rate": "crPct", "CRIT DMG": "cdPct", "Anomaly Proficiency": "apFlat", "Anomaly Mastery": "amPct",
    "Impact": "impactPct", "Energy Regen": "erPct", "PEN Ratio": "penRatio", "Flat PEN": "flatPen",
  };
  for (const p of (pieces || [])) {
    const ms = mainKey(p.main?.stat);
    const mv = dm[String(p.slot)]?.[ms];
    if (mv != null && route[ms]) a[route[ms]] += mv;
    for (const s of (p.subs || [])) {
      if (route[s.stat]) a[route[s.stat]] += (rv[s.stat] || 0) * (s.rolls || 0);
    }
  }
  return a;
}

/** Route a {stat,value,unit} stat mod into a discAccum-shaped pool (percentage pools carry the %
 *  number, flat pools raw). Shared by setSheetAccum so set %-stats fold in exactly like disc %-stats. */
function routeStatMod(a, stat, value, unit) {
  const pct = unit === "%";
  switch (stat) {
    case "ATK": pct ? (a.atkPct += value) : (a.flatAtk += value); break;
    case "HP": pct ? (a.hpPct += value) : (a.flatHp += value); break;
    case "DEF": pct ? (a.defPct += value) : (a.flatDef += value); break;
    case "CRIT Rate": a.crPct += value; break;
    case "CRIT DMG": a.cdPct += value; break;
    case "Anomaly Proficiency": a.apFlat += value; break;
    case "Anomaly Mastery": a.amPct += value; break;
    case "Impact": a.impactPct += value; break;
    case "Energy Regen": a.erPct += value; break;
    case "PEN Ratio": a.penRatio += value; break;
    case "Flat PEN": a.flatPen += value; break;
  }
}

/** Accumulate the SHEET-scope stat bonuses from a build's ACTIVE sets (2pc when >=2 pieces, 4pc when
 *  >=4) into the same pool shape as discAccum. Only kind:"stat" + scope:"sheet" effects — the always-on
 *  ones that show on the character screen (Woodpecker +8% CR, Astral Voice +10% ATK, Freedom Blues
 *  +30 AP, Swing Jazz +20% ER, …); combat-scope + dmg/buildup are layered separately by computeStats.
 *  Pulling these out of agent.base (see scripts/derive-bases) is what lets a disc SET-swap retro-adjust
 *  the sheet: base becomes character + W-Engine only, the swappable set stats are added live here. */
export function setSheetAccum(pieces, cfg = {}) {
  const a = { atkPct: 0, flatAtk: 0, hpPct: 0, flatHp: 0, defPct: 0, flatDef: 0, crPct: 0, cdPct: 0,
    apFlat: 0, amPct: 0, impactPct: 0, erPct: 0, penRatio: 0, flatPen: 0 };
  const { active } = computeSets(pieces, cfg);
  for (const s of active) {
    const defs = cfg.setEffects?.[s.set] || {};
    const tiers = s.pc === 4 ? ["2pc", "4pc"] : ["2pc"];
    for (const t of tiers) {
      for (const m of (defs[t] || [])) {
        if (m.kind === "stat" && m.scope === "sheet") routeStatMod(a, m.stat, m.value, m.unit);
      }
    }
  }
  return a;
}

/** Parse a W-Engine's MULTIPLICATIVE advanced stat (ATK%/HP%/DEF%/AM%/Impact%/ER%) into a discAccum-shaped
 *  pool, so it gets SUMMED with disc/set %s instead of multiplied into agent.base. ZZZ's real formula sums
 *  every %; folding the advanced % into base made multiplicative stats (e.g. ATK on an ATK%-engine) drift
 *  once disc %s were edited — base*(1+newDisc%) != base/(1+adv%)*(1+adv%+newDisc%). ADDITIVE advanced stats
 *  (CRIT Rate/DMG, Anomaly Prof, PEN) have no such artifact, so they stay folded in base. `we` must be the
 *  RESOLVED engine (resolveWengine), so the advanced label is present even for Enka-imported agents. */
export function weaponAdvanceAccum(we) {
  const a = { atkPct: 0, hpPct: 0, defPct: 0, amPct: 0, impactPct: 0, erPct: 0 };
  const m = /^(ATK|HP|DEF|Anomaly Mastery|Impact|Energy Regen)\s*\+\s*([\d.]+)%$/.exec(we?.advanced?.label || "");
  if (!m) return a;
  const key = { "ATK": "atkPct", "HP": "hpPct", "DEF": "defPct", "Anomaly Mastery": "amPct", "Impact": "impactPct", "Energy Regen": "erPct" }[m[1]];
  a[key] += parseFloat(m[2]);
  return a;
}

/** Recompute the character-screen (unconditional) sheet from agent.base + current discs, applying the
 *  researched ZZZ formulas (docs/stat-formulas.md): ATK/HP/DEF multiply (base × (1+%) + flat); AM /
 *  Impact / Energy Regen multiply base by (1+%); CRIT Rate/DMG, Anomaly Proficiency, PEN Ratio add;
 *  Sheer Force = 0.3·ATK + 0.1·HP (Rupture). base is character-only for multiplicative stats — the
 *  W-Engine advanced % (weaponAdvanceAccum) and sheet-scope SET % (setSheetAccum) are SUMMED in live, so
 *  editing a disc OR swapping a set OR (in principle) the engine retro-adjusts the sheet & goalposts. */
export function computeSheet(agent, cfg) {
  const b = agent.base || {};
  const pieces = agent.discs?.pieces || [];
  const d = discAccum(pieces, cfg);
  const s = setSheetAccum(pieces, cfg);
  const w = weaponAdvanceAccum(resolveWengine(agent.wengine, cfg));
  // disc + sheet-scope set + W-engine-advanced contributions share each multiplicative pool (all summed)
  const ATK = (b.ATK || 0) * (1 + (d.atkPct + s.atkPct + w.atkPct) / 100) + d.flatAtk + s.flatAtk;
  const HP = (b.HP || 0) * (1 + (d.hpPct + s.hpPct + w.hpPct) / 100) + d.flatHp + s.flatHp;
  const DEF = (b.DEF || 0) * (1 + (d.defPct + s.defPct + w.defPct) / 100) + d.flatDef + s.flatDef;
  const sheet = {
    "ATK": Math.round(ATK),
    "HP": Math.round(HP),
    "DEF": Math.round(DEF),
    "CRIT Rate": +((b["CRIT Rate"] || 0) + d.crPct + s.crPct).toFixed(1),
    "CRIT DMG": +((b["CRIT DMG"] || 0) + d.cdPct + s.cdPct).toFixed(1),
    "Anomaly Proficiency": Math.round((b["Anomaly Proficiency"] || 0) + d.apFlat + s.apFlat),
    "Anomaly Mastery": Math.round((b["Anomaly Mastery"] || 0) * (1 + (d.amPct + s.amPct + w.amPct) / 100)),
    "Impact": Math.round((b["Impact"] || 0) * (1 + (d.impactPct + s.impactPct + w.impactPct) / 100)),
    "Energy Regen": +((b["Energy Regen"] || 0) * (1 + (d.erPct + s.erPct + w.erPct) / 100)).toFixed(2),
    "PEN Ratio": +((b["PEN Ratio"] || 0) + d.penRatio + s.penRatio).toFixed(1),
  };
  if (String(agent.section || "").toUpperCase() === "RUPTURE") {
    sheet["Sheer Force"] = Math.round(0.3 * ATK + 0.1 * HP);
  }
  return sheet;
}

export function computeStats(agent, cfg, opts = {}) {
  const pieces = agent.discs?.pieces || [];
  const we = resolveWengine(agent.wengine, cfg) || {};
  const statKeys = (opts.stats && opts.stats.length)
    ? opts.stats
    : ["ATK", "Anomaly Proficiency", "Anomaly Mastery"];
  // The SHEET (character screen) is COMPUTED from base + current discs (computeSheet), so editing a
  // disc flows straight into the stats and goalposts. opts.sheet (the seeded snapshot) is only a
  // fallback — for an agent without a derived base, or a stat key computeSheet doesn't produce.
  const computed = agent.base ? computeSheet(agent, cfg) : {};
  const override = opts.sheet || {};
  const sheet = {};
  for (const k of statKeys) {
    sheet[k] = computed[k] != null ? computed[k] : (override[k] != null ? _num(override[k]) : 0);
  }
  // Computed/seeded sheet already folds in all unconditional sources (W-Engine/core/sheet-set are
  // absorbed into base), so don't re-add sheet-scope set bonuses onto a complete key — only
  // combat-scope buffs layer on for Effective. (Set-swaps don't retro-adjust sheet-scope set stats
  // baked into base — a v1 limitation; disc main/substat edits recompute exactly.)
  const overridden = new Set(statKeys.filter((k) => computed[k] != null || override[k] != null));

  const sets = computeSets(pieces, cfg);
  const combat = {};
  for (const k of statKeys) combat[k] = [];
  const buffs = [];
  const apply = (m, src) => {
    if (m.kind === "stat") {
      if (m.scope === "combat" && combat[m.stat]) combat[m.stat].push({ ...m, src });
      else if (m.scope === "sheet" && sheet[m.stat] != null && !overridden.has(m.stat)) sheet[m.stat] += m.value;
    } else buffs.push({ ...m, src });
  };
  // W-Engine combat effects — `we` is already resolved against cfg.wengines, so passive is present
  // even for Enka-imported agents (which only carry name/rank/refine).
  (we.passive || []).forEach((m) => apply(m, we.name || "W-Engine"));
  for (const s of sets.active) {
    const defs = cfg.setEffects?.[s.set] || {};
    const tiers = s.pc === 4 ? ["2pc", "4pc"] : ["2pc"];
    tiers.forEach((t) => (defs[t] || []).forEach((m) => apply(m, `${s.set} ${t}`)));
  }

  const mk = (key) => {
    const cs = combat[key] || [];
    const add = cs.reduce((a, m) => a + m.value, 0);
    return { sheet: sheet[key], combat: add, effective: sheet[key] + add, sources: cs };
  };
  const stats = {};
  for (const k of statKeys) stats[k] = mk(k);
  return { stats, buffs, sets };
}

/** Swap a disc's set in place (e.g. Slot 6 Fanged Metal → Phaethon's Melody) and return a fresh build grade. */
export function swapDiscSet(agent, slot, newSet, cfg) {
  const next = structuredClone(agent);
  const piece = next.discs.pieces.find((p) => p.slot === slot);
  if (!piece) throw new Error(`No disc in slot ${slot}`);
  piece.set = newSet;
  return { agent: next, grade: gradeBuild(next, cfg) };
}

export default { resolveArchetype, resolveWengine, gradeDisc, computeSets, gradeBuild, computeStats, swapDiscSet, discAccum, setSheetAccum, weaponAdvanceAccum, computeSheet };
