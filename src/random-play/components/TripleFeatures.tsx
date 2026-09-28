"use client";
import { useAssets } from "../context";
import { BANGBOO_NAME, DA_CAP } from "../data/meta";
import type { Agent, Team } from "../data/types";
import { ELEMENT_COLORS } from "../tokens";
import { Halftone } from "./primitives";

const fmt = (n: number) => n.toLocaleString("en-US");
const shortDate = (d: string) => d.slice(5).replace("-", "/");
const ROW_STEP = 66; // rail row 60px + 6px gap — the highlight slides by this

export function TeamRail({ teams, current, onPick }: { teams: Team[]; current: number; onPick: (i: number) => void }) {
  const assets = useAssets();
  const runs = teams.reduce((s, t) => s + t.runs.length, 0);
  return (
    <div className="rp-rail">
      <div className="rp-rail__kicker">TRIPLE FEATURES</div>
      <div className="rp-rail__title">Team bundles</div>
      <div className="rp-rail__sub">{teams.length} BUNDLES · {runs} RUNS · BY PLAYS</div>
      <div className="rp-rail__list">
        <div className="rp-rail__sel" style={{ transform: `translateY(${current * ROW_STEP}px)` }} />
        {teams.map((t, i) => (
          <button key={t.id} className={`rp-rail__row${i === current ? " is-on" : ""}`} aria-current={i === current} onClick={() => i !== current && onPick(i)}>
            <span className="rp-rail__trio">{t.order.map((s) => <img key={s} src={assets.rect(s)} alt="" />)}</span>
            <span className="rp-rail__meta">
              <span className="rp-rail__name">{t.name}</span>
              <span className="rp-rail__stats">{t.runs.length ? `${t.runs.length}× · BEST ${fmt(t.best!.score)}` : "SETLIST · NOT LOGGED YET"}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function SquadCard({ agent: a, role, index, onOpen }: { agent: Agent; role: string; index: number; onOpen: () => void }) {
  const assets = useAssets();
  return (
    <button className="rp-squad" style={{ animationDelay: `${index * 90}ms` }} onClick={onOpen} aria-label={`Open ${a.name}'s tape`}>
      <div className="rp-squad__panel" style={{ backgroundColor: ELEMENT_COLORS[a.attribute] }}>
        <Halftone />
        <img className="rp-squad__wm" src={assets.element(a.attribute)} alt="" />
      </div>
      <img className="rp-squad__art" src={assets.squad(a.slug)} alt={a.name} />
      <div className="rp-squad__plate">
        <div><div className="rp-squad__name">{a.spine}</div><div className="rp-squad__role">{role.toUpperCase()} · M{a.mindscape}</div></div>
        <div className="rp-squad__icons"><img src={assets.element(a.attribute)} alt={a.attribute} /><img src={assets.specialty(a.section)} alt={a.section} /></div>
      </div>
    </button>
  );
}

export function BangbooBadge({ slug }: { slug: string | null }) {
  const assets = useAssets();
  const name = slug ? BANGBOO_NAME[slug] ?? slug : null;
  return (
    <div className="rp-bangboo">
      <div className="rp-bangboo__ring"><img src={slug ? assets.bangboo(slug) : assets.ui("socket-empty")} alt={name ?? "No Bangboo logged"} /></div>
      <div className="rp-bangboo__label">{name ? `BANGBOO · ${name.toUpperCase()}` : "NO BANGBOO LOGGED"}</div>
    </div>
  );
}

export interface FeatureStageProps { team: Team; number: number; roster: Record<string, Agent>; onOpenAgent: (slug: string) => void }

export function FeatureStage({ team: t, number, roster, onOpenAgent }: FeatureStageProps) {
  const top = t.runs.slice(0, 4);
  const attr = t.attribute || roster[t.order[0]]?.attribute || "";
  const chips: { label: string; hot?: boolean }[] = [];
  if (t.runs.length) chips.push({ label: `${t.runs.length} RUNS LOGGED` });
  if (t.best) chips.push({ label: `BEST ${fmt(t.best.score)} · ${[t.best.mode, t.best.boss, shortDate(t.best.date)].filter(Boolean).join(" · ").toUpperCase()}` });
  if (t.caps) chips.push({ label: `CAPPED${t.caps > 1 ? ` ×${t.caps}` : ""}`, hot: true });
  if (!t.inSetlists) chips.push({ label: "NOT IN THE SETLISTS YET", hot: true });
  if (!t.runs.length) chips.push({ label: "SETLIST PICK · UNTESTED" });
  const why = t.why || `Not in the setlists yet. You've run it ${t.runs.length} times and it peaked at ${fmt(t.best?.score ?? 0)}, so the logs got here before the doctrine did.`;
  return (
    // key on the team id → the whole stage remounts and every entrance animation replays
    <div key={t.id} className="rp-feature rp-hatch">
      <div className="rp-feature__head">
        <div className="rp-feature__kicker">TRIPLE FEATURE · NO. {String(number).padStart(2, "0")} · {attr.toUpperCase()}</div>
        <div className="rp-feature__title">{t.name}</div>
        <div className="rp-feature__arch">{t.archetype || `${t.order.map((s) => roster[s]?.name ?? s).join(" · ")} — straight from the logs`}</div>
        <div className="rp-feature__chips">{chips.map((c) => <span key={c.label} className={`rp-tchip${c.hot ? " is-hot" : ""}`}>{c.label}</span>)}</div>
      </div>
      <div className="rp-lineup">
        {t.order.map((s, i) => roster[s] && (
          <SquadCard key={s} agent={roster[s]} index={i} role={t.roles[s] ?? roster[s].section} onOpen={() => onOpenAgent(s)} />
        ))}
        <BangbooBadge slug={t.bangboo} />
      </div>
      {/* phone caption row (mobile.css): the zoomed plates' role lines shrink to ~4px there */}
      <div className="rp-lineup__cast">
        {t.order.map((s) => roster[s] && (
          <span key={s}><b>{roster[s].name}</b>{(t.roles[s] ?? roster[s].section).toUpperCase()} · M{roster[s].mindscape}</span>
        ))}
        <span><b>Bangboo</b>{t.bangboo ? (BANGBOO_NAME[t.bangboo] ?? t.bangboo).toUpperCase() : "NOT LOGGED"}</span>
      </div>
      <div className="rp-feature__notes">
        <div className="rp-feature__col-l">
          <div><div className="rp-feature__label">LINER NOTES</div><div className="rp-feature__prose">{why}</div></div>
          {t.room && <div><div className="rp-feature__label">PLAYS BEST IN</div><div className="rp-feature__prose">{t.room}</div></div>}
          {t.caution && <div><div className="rp-feature__label">HANDLE WITH CARE</div><div className="rp-feature__prose">{t.caution}</div></div>}
        </div>
        <div className="rp-feature__col-r">
          <div className="rp-feature__label">TOP SCREENINGS</div>
          {top.map((r) => (
            <div key={`${r.mode}${r.date}${r.score}`} className={`rp-run${r.mode === "DA" && r.score >= DA_CAP ? " is-cap" : ""}`}>
              <div className="rp-run__top"><span className="rp-run__score">{fmt(r.score)}</span><span className="rp-run__when">{r.mode} · {shortDate(r.date)}</span></div>
              <div className="rp-run__bar"><div style={{ width: `${Math.min(100, (r.score / DA_CAP) * 100)}%` }} /></div>
              <div className="rp-run__boss">{(r.boss || "Boss not logged").toUpperCase()}</div>
            </div>
          ))}
          {!top.length && <div className="rp-feature__prose">No screenings logged yet. This one's still shrink-wrapped.</div>}
          {t.variants.length > 0 && (
            <>
              <div className="rp-feature__label" style={{ marginTop: 10 }}>ALSO PLAYS AS</div>
              {t.variants.slice(0, 2).map((v) => <div key={v.team} className="rp-variant"><b>{v.team}</b> — {v.when}</div>)}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export interface TripleFeaturesProps { teams: Team[]; current: number; onPick: (i: number) => void; roster: Record<string, Agent>; onOpenAgent: (slug: string) => void; open: boolean }

export function TripleFeatures({ teams, current, onPick, roster, onOpenAgent, open }: TripleFeaturesProps) {
  return (
    <section className={`rp-view rp-teams${open ? " is-in" : ""}`} aria-label="Team bundles" aria-hidden={!open}>
      <TeamRail teams={teams} current={current} onPick={onPick} />
      <FeatureStage team={teams[current]} number={current + 1} roster={roster} onOpenAgent={onOpenAgent} />
    </section>
  );
}
