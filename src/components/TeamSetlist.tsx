import Link from "next/link";
import type { CSSProperties } from "react";
import type { Setlist, SetlistMember } from "@/lib/setlists";
import { elementColor, elementIcon, typeIcon, iconPath } from "@/lib/deck-config";
import { profileHref } from "@/lib/profile";
import { DeckImg } from "@/components/deck/DeckImg";
import { RecentBenchmarks } from "@/components/RecentBenchmarks";

// One benchmarked team "shell" as a Soundsystem setlist panel: a header (name + archetype +
// benchmark badge), three big glossy diagonal agent cards side by side (Carry → Stun → Support),
// a VU "carry damage share" meter + score, then the room signal / why / variants / caution from
// the bible. Pure presentation — element-accented via --ec (the shell's), each card re-accented to
// its own agent's element. Server component; the only client leaf is DeckImg (base-path'd <img>).

const fmt = (n: number) => n.toLocaleString("en-US");

function AgentCard({ m, base }: { m: SetlistMember; base: string }) {
  const style = { "--ec": elementColor(m.attribute) } as CSSProperties;
  return (
    <Link
      href={profileHref(base, `/r/${m.slug}/`)}
      className={`tcard role-${m.role.toLowerCase()}`}
      style={style}
      aria-label={`${m.name} — ${m.role}`}
    >
      <span className="tc-badges">
        <DeckImg src={iconPath(elementIcon(m.attribute))} alt={m.attribute} className="tc-ico" />
        <DeckImg src={iconPath(typeIcon(m.section))} alt={m.section} className="tc-ico" />
      </span>
      <DeckImg src={`/assets/teamcards/${m.slug}.webp`} alt={m.name} className="tc-pic" />
      <span className="tc-plate">
        <span className="tc-role">{m.role}</span>
        <span className="tc-name">{m.name}</span>
      </span>
    </Link>
  );
}

export function TeamSetlist({ set, base = "" }: { set: Setlist; base?: string }) {
  const style = { "--ec": elementColor(set.attribute) } as CSSProperties;
  const b = set.benchmark;
  const fill = b ? Math.round(b.carryShare / 5) : 0; // 20-segment meter

  return (
    <article className="setlist" style={style}>
      <header className="set-head">
        <div className="set-id">
          <h3>{set.name}</h3>
          <div className="set-arche">{set.archetype}</div>
        </div>
        {b ? (
          <span className="bench-badge">★ Benchmarked</span>
        ) : (
          <span className="src-tag">Guide-sourced</span>
        )}
      </header>

      <div className="set-body">
        <div className="set-main">
          <div className="tcards">
        {set.members.map((m) => (
          <AgentCard key={m.slug} m={m} base={base} />
        ))}
      </div>

      {b && (
        <div className="set-bench">
          <span className="sb-meter" aria-label={`carry damage share ${b.carryShare}%`}>
            {Array.from({ length: 20 }).map((_, i) => (
              <i key={i} className={i < fill ? "on" : undefined} />
            ))}
          </span>
          <span className="sb-score">
            <b>{fmt(b.score)}</b>
            <small>{b.carryShare}% carry dmg</small>
          </span>
          <span className="sb-meta">
            <span className="sb-label">{b.label}</span>
            <span className="sb-phase">{b.phase}</span>
          </span>
        </div>
      )}

      <div className="set-info">
        <div className="set-row">
          <span className="sk">Room</span>
          <span className="sv">{set.roomSignal}</span>
        </div>
        <div className="set-row">
          <span className="sk">Why</span>
          <span className="sv">{set.why}</span>
        </div>
        {set.variants?.length ? (
          <div className="set-row">
            <span className="sk">Variants</span>
            <span className="sv variants">
              {set.variants.map((v, i) => (
                <span key={i} className="variant">
                  <b>{v.team}</b> — {v.when}
                </span>
              ))}
            </span>
          </div>
        ) : null}
        {set.caution && (
          <div className="set-row caution">
            <span className="sk">⚠</span>
            <span className="sv">{set.caution}</span>
          </div>
        )}
      </div>
        </div>
        <RecentBenchmarks recent={set.recent} />
      </div>
    </article>
  );
}
