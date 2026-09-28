// Adapters: coach-pack JSON → Random Play contracts. The dashboard calls these with the same files
// it already publishes (out/coach/*.json), so the framework never reads Supabase directly.
import type { Element, Grade } from "../tokens";
import { DA_CAP, LOGGED_TEAM_NAMES, SPINE_NAME } from "./meta";
import type { Agent, AssaultCycle, EndgameLedger, EndgameRoom, HistoryPoint, Mode, Run, Section, ShiyuCycle, Team } from "./types";

// ---------------------------------------------------------------- roster
interface CoachAgent {
  name: string; slug: string; section: Section; attribute: Element; faction: string; title?: string;
  mindscape: string; wengine?: { name: string; rank: string; refine: string };
  build?: { letter: Grade; pct: number; sets: string; suggestions?: string[] };
  sheet?: { stat: string; value: string }[]; scalesOn?: string[];
}
export interface CoachRoster { profiles: Record<string, { agents: CoachAgent[] }> }

export function deriveRoster(roster: CoachRoster, profile = "andres-zzz"): Agent[] {
  return roster.profiles[profile].agents.map((a) => ({
    slug: a.slug,
    name: a.name,
    spine: SPINE_NAME[a.slug] ?? a.name,
    section: a.section,
    attribute: a.attribute,
    faction: a.faction,
    title: a.title ?? "",
    mindscape: Number(String(a.mindscape).replace(/\D/g, "")) || 0,
    grade: a.build?.letter,
    pct: a.build?.pct,
    engine: a.wengine,
    sets: a.build?.sets,
    suggestion: a.build?.suggestions?.[0],
    scalesOn: a.scalesOn ?? [],
    sheet: a.sheet ?? [],
  }));
}

// ---------------------------------------------------------------- runs
type Json = unknown;
interface RawTeamRoom { team: { slug: string }[]; bangboo?: { slug: string }; boss?: string | { name: string }; scores?: { total: number }; score?: number; total?: number }

const isRoom = (o: Record<string, Json>): o is Record<string, Json> & RawTeamRoom =>
  Array.isArray(o.team) && o.team.length === 3 && typeof (o.team[0] as { slug?: unknown })?.slug === "string";

function walk(node: Json, mode: Mode, date: string, out: Run[]) {
  if (Array.isArray(node)) { node.forEach((n) => walk(n, mode, date, out)); return; }
  if (!node || typeof node !== "object") return;
  const o = node as Record<string, Json>;
  const d = typeof o.date === "string" ? o.date : date;
  if (isRoom(o)) {
    const boss = typeof o.boss === "string" ? o.boss : o.boss?.name ?? "";
    out.push({
      mode, date: d, boss,
      score: o.scores?.total ?? o.score ?? o.total ?? 0,
      bangboo: o.bangboo?.slug ?? null,
      team: o.team.map((t) => t.slug),
    });
  }
  for (const v of Object.values(o)) walk(v, mode, d, out);
}

const teamKey = (slugs: string[]) => [...slugs].sort().join("/");

/**
 * Every logged 3-agent room across Deadly Assault + Shiyu, DE-DUPLICATED.
 *
 * The coach pack carries both `cycles` and `history`, and history REPEATS the current cycles
 * (history stores `boss` as a plain string, cycles as an object). A naive walk double-counts:
 * 80 raw lineups → 63 real on the 2026-09-26 snapshot. Key = mode + date + sorted team + score;
 * when two copies collide, keep whichever knows the boss name.
 */
export function flattenRuns(assault: { profiles: Record<string, Json> }, shiyu: { profiles: Record<string, Json> }, profile = "andres-zzz"): Run[] {
  const raw: Run[] = [];
  walk(assault.profiles[profile], "DA", "", raw);
  walk(shiyu.profiles[profile], "Shiyu", "", raw);
  const seen = new Map<string, Run>();
  for (const r of raw) {
    const k = `${r.mode}|${r.date}|${teamKey(r.team)}|${r.score}`;
    const prev = seen.get(k);
    if (!prev) seen.set(k, r);
    else if (!prev.boss && r.boss) seen.set(k, { ...prev, boss: r.boss, bangboo: prev.bangboo ?? r.bangboo });
  }
  return [...seen.values()];
}

// ---------------------------------------------------------------- teams
interface Setlist {
  id: string; name: string; archetype: string; attribute: Element;
  members: { slug: string; role: string }[];
  why: string; roomSignal: string; caution: string; variants?: { team: string; when: string }[];
}
export interface CoachSetlists { profiles: Record<string, Setlist[]> }

export interface DeriveTeamsOptions {
  /** Logged lineups not in the setlists appear once they have at least this many runs. */
  minLoggedRuns?: number;
}

/**
 * Triple Features = setlist shells ∪ frequently-logged lineups, merged on member set.
 * Logs carry the truth first (a new shell shows up in the logs before anyone writes it into
 * setlists.ts), so a logged-only lineup is surfaced with `inSetlists: false` instead of hidden.
 * Sorted by play count, then best score.
 */
export function deriveTeams(setlists: CoachSetlists, runs: Run[], profile = "andres-zzz", opts: DeriveTeamsOptions = {}): Team[] {
  const minRuns = opts.minLoggedRuns ?? 3;
  const byKey = new Map<string, Run[]>();
  for (const r of runs) {
    const k = teamKey(r.team);
    byKey.set(k, [...(byKey.get(k) ?? []), r]);
  }
  const build = (key: string, rs: Run[], sl?: Setlist): Team => {
    const sorted = [...rs].sort((a, b) => b.score - a.score || b.date.localeCompare(a.date));
    const best = sorted[0] ?? null;
    const bbCount = new Map<string, number>();
    for (const r of rs) if (r.bangboo) bbCount.set(r.bangboo, (bbCount.get(r.bangboo) ?? 0) + 1);
    const bangboo = [...bbCount.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
    return {
      id: sl?.id ?? key.replace(/\//g, "-"),
      name: sl?.name ?? LOGGED_TEAM_NAMES[key] ?? key,
      archetype: sl?.archetype ?? "",
      attribute: sl?.attribute ?? "",
      order: best?.team ?? sl?.members.map((m) => m.slug) ?? key.split("/"),
      roles: Object.fromEntries((sl?.members ?? []).map((m) => [m.slug, m.role])),
      runs: sorted,
      best,
      caps: rs.filter((r) => r.mode === "DA" && r.score >= DA_CAP).length,
      bangboo,
      why: sl?.why ?? "",
      room: sl?.roomSignal ?? "",
      caution: sl?.caution ?? "",
      variants: sl?.variants ?? [],
      inSetlists: !!sl,
    };
  };
  const teams: Team[] = [];
  const used = new Set<string>();
  for (const sl of setlists.profiles[profile] ?? []) {
    const k = teamKey(sl.members.map((m) => m.slug));
    used.add(k);
    teams.push(build(k, byKey.get(k) ?? [], sl));
  }
  for (const [k, rs] of byKey) if (!used.has(k) && rs.length >= minRuns) teams.push(build(k, rs));
  return teams.sort((a, b) => b.runs.length - a.runs.length || (b.best?.score ?? 0) - (a.best?.score ?? 0));
}

// ---------------------------------------------------------------- endgame ledgers (Shiyu + DA)
interface RawRoom {
  room: number; rating?: "S" | "A" | "B"; pips?: number;
  recommended?: Element[]; resistance?: Element[]; anomaly?: boolean;
  boss: { name: string; tag?: string; slug: string; level?: number };
  team: { slug: string }[]; bangboo?: { slug: string } | null;
  scores: { total: number; damage?: number; elimination?: number; performance?: number };
  time?: string; timeLimit?: string; specialty?: string; gimmick?: string;
  buff?: { name: string; slug: string; desc: string }; targets?: number[];
}
interface RawShiyuCycle {
  id: string; date: string; label: string; frontier?: string; bestTotal: number; rank?: string;
  medal?: string; highestRating?: string; targets?: { rating: string; desc: string; done: boolean }[]; rooms: RawRoom[];
}
interface RawAssaultCycle {
  id: string; date: string; label: string; bestTotal: number; rank?: string; medals?: { crown?: number; shield?: number };
  rooms: RawRoom[]; adversity?: { bestTotal: number; rank?: string; room: RawRoom };
}
interface RawHistory { id?: string; date: string; score: number; rank?: string }
interface RawLedger<C> { cycles?: C[]; history?: RawHistory[] }
export interface CoachShiyu { profiles: Record<string, RawLedger<RawShiyuCycle>> }
export interface CoachAssault { profiles: Record<string, RawLedger<RawAssaultCycle>> }

/** "—", "" and missing all mean "the game hasn't posted a rank": null, never a fake number. */
const rankOf = (r?: string) => (r && /\d/.test(r) ? r : null);

function room(r: RawRoom): EndgameRoom {
  const parts = [{ label: "Damage", value: r.scores.damage }, { label: "Elimination", value: r.scores.elimination },
    { label: "Performance", value: r.scores.performance }].filter((p): p is { label: string; value: number } => typeof p.value === "number");
  return {
    room: r.room,
    boss: { name: r.boss.name, tag: r.boss.tag, slug: r.boss.slug, level: r.boss.level ?? 70 },
    recommended: r.recommended ?? [],
    resistance: r.resistance ?? [],
    team: r.team.map((t) => t.slug),
    bangboo: r.bangboo?.slug ?? null,
    score: r.scores.total,
    parts,
    rating: r.rating, pips: r.pips, time: r.time, timeLimit: r.timeLimit, specialty: r.specialty,
    gimmick: r.gimmick, buff: r.buff, anomaly: r.anomaly, targets: r.targets,
  };
}

/**
 * Timeline = full cycles ∪ history rows, one point per date, oldest → newest. History REPEATS some
 * cycles (the same trap as flattenRuns), so dates collide; the cycle copy wins and keeps `cycle`,
 * which is what lets the strip double as the cycle picker.
 */
function timeline(cycles: { date: string; best: number; rank: string | null }[], history: RawHistory[]): HistoryPoint[] {
  const byDate = new Map<string, HistoryPoint>();
  for (const h of history) byDate.set(h.date, { date: h.date, score: h.score, rank: rankOf(h.rank), cycle: null });
  cycles.forEach((c, i) => {
    const h = byDate.get(c.date);
    byDate.set(c.date, { date: c.date, score: c.best, rank: c.rank ?? h?.rank ?? null, cycle: i });
  });
  return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
}

export function deriveShiyu(shiyu: CoachShiyu, profile = "andres-zzz"): EndgameLedger<ShiyuCycle> {
  const p = shiyu.profiles[profile] ?? {};
  const cycles: ShiyuCycle[] = (p.cycles ?? []).map((c) => ({
    id: c.id, date: c.date, label: c.label, frontier: c.frontier ?? "",
    best: c.bestTotal, rank: rankOf(c.rank), highestRating: c.highestRating ?? "", medal: c.medal ?? null,
    targets: c.targets ?? [], rooms: c.rooms.map(room),
  }));
  return { cycles, history: timeline(cycles, p.history ?? []) };
}

export function deriveAssault(assault: CoachAssault, profile = "andres-zzz"): EndgameLedger<AssaultCycle> {
  const p = assault.profiles[profile] ?? {};
  const cycles: AssaultCycle[] = (p.cycles ?? []).map((c) => ({
    id: c.id, date: c.date, label: c.label, best: c.bestTotal, rank: rankOf(c.rank),
    medals: { crown: c.medals?.crown ?? 0, shield: c.medals?.shield ?? 0 },
    rooms: c.rooms.map(room),
    adversity: c.adversity ? { best: c.adversity.bestTotal, rank: rankOf(c.adversity.rank), room: room(c.adversity.room) } : null,
  }));
  return { cycles, history: timeline(cycles, p.history ?? []) };
}
