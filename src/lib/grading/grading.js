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

const ELEMENT_DMG = /(Physical|Fire|Ice|Electric|Ether|Frost|Auric|Lunar) DMG$/i;

/** Resolve an agent's archetype config (section map → override → merged weights). */
export function resolveArchetype(agent, cfg) {
  const ov = cfg.agentOverrides?.[agent.name];
  const name = ov?.archetype
    || cfg.sectionToArchetype[String(agent.section || "").toUpperCase()]
    || "attack";
  const base = cfg.archetypes[name];
  if (!base) throw new Error(`Unknown archetype "${name}" for ${agent.name}`);
  const weights = ov?.weights ? { ...base.weights, ...ov.weights } : base.weights;
  return { ...base, weights, name };
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

/**
 * Grade a whole agent build.
 * agent = { name, section, attribute, ..., discs:{ pieces:[ <piece> x6 ] } }
 */
export function gradeBuild(agent, cfg) {
  const A = resolveArchetype(agent, cfg);
  const pieces = agent.discs?.pieces || [];
  const discs = pieces.map((p) => gradeDisc(p, A, cfg));
  const buildPct = discs.length ? discs.reduce((s, d) => s + d.pct, 0) / discs.length : 0;
  const sets = computeSets(pieces, cfg);
  const tier = letterFor(buildPct, cfg);
  return {
    agent: agent.name, archetype: A.name, archetypeLabel: A.label,
    buildPct: +buildPct.toFixed(1), buildLetter: tier.letter, buildColor: tier.color,
    discs, sets, suggestions: suggest(discs, sets, A),
  };
}

/* ---- Sheet vs Effective stat sheet ---------------------------------------
 * Sheet     = the character-screen number = base + disc mains/subs + W-Engine base/advanced + sheet-scope set bonuses
 * Effective = Sheet + combat-only buffs    = W-Engine passive + combat-scope set bonuses
 * DMG% / Buildup effects never touch the sheet — returned as `buffs` for display.
 * agent.base    = { atkPool, AP, AM }  (illustrative calibration constants — refine to exact ZZZ later)
 * agent.wengine = { name, base:{ATK}, advanced:{label}, passive:[ mod ] }   mod = {label,kind,stat,value,scope}
 */
const _num = (v) => (typeof v === "number" ? v : parseFloat(String(v).replace(/[^0-9.\-]/g, "")) || 0);

/** Merge a W-Engine's reference data (base ATK / advanced / passive — stripped by Enka imports,
 *  so they live in cfg.wengines keyed by name) UNDER the agent's own wengine fields (name/rank/
 *  refine win). The cartridge card and the Sheet-vs-Effective layer both read through this. */
export function resolveWengine(we, cfg) {
  if (!we) return null;
  return { ...(cfg?.wengines?.[we.name] || {}), ...we };
}

export function computeStats(agent, cfg, opts = {}) {
  const rv = cfg.rollValues || {};
  const pieces = agent.discs?.pieces || [];
  let atkPct = 0, flatAtk = 0, apDiscs = 0, amDiscs = 0;
  for (const p of pieces) {
    const ms = p.main?.stat, mv = p.main?.value;
    if (ms === "ATK%") atkPct += _num(mv);
    else if (ms === "ATK") flatAtk += _num(mv);
    else if (ms === "Anomaly Proficiency") apDiscs += _num(mv);
    else if (ms === "Anomaly Mastery") amDiscs += _num(mv);
    for (const s of p.subs || []) {
      const amt = (s.rolls || 0) * (rv[s.stat] || 0);
      if (s.stat === "ATK%") atkPct += amt;
      else if (s.stat === "ATK") flatAtk += amt;
      else if (s.stat === "Anomaly Proficiency") apDiscs += amt;
    }
  }
  const base = agent.base || {}, we = resolveWengine(agent.wengine, cfg) || {};
  // The Sheet baseline. Prefer the REAL character-screen values (opts.sheet — the seeded main
  // stats); fall back to the illustrative base+disc computation for pre-seed agents. The stats
  // we report = opts.stats (the agent's relevant/goalposted stats), default to the anomaly trio.
  const legacy = {
    "ATK": Math.round(((base.atkPool || 0) + (we.base?.ATK || 0)) * (1 + atkPct / 100) + flatAtk),
    "Anomaly Proficiency": Math.round((base.AP || 0) + apDiscs),
    "Anomaly Mastery": Math.round((base.AM || 0) + amDiscs),
  };
  const override = opts.sheet || {};
  const statKeys = (opts.stats && opts.stats.length)
    ? opts.stats
    : ["ATK", "Anomaly Proficiency", "Anomaly Mastery"];
  const sheet = {};
  for (const k of statKeys) sheet[k] = override[k] != null ? _num(override[k]) : (legacy[k] ?? 0);
  // Seeded (override) values ARE the character screen — sheet-scope set/W-Engine bonuses are
  // already baked in, so don't re-add them (double-count). Only combat-scope buffs layer on.
  const overridden = new Set(statKeys.filter((k) => override[k] != null));

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

export default { resolveArchetype, resolveWengine, gradeDisc, computeSets, gradeBuild, computeStats, swapDiscSet };
