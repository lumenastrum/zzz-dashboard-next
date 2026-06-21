import Link from "next/link";
import type { RosterEntry } from "@/lib/roster";
import { withBase } from "@/lib/base-path";
import { iconPath, tallPath, elementIcon, typeIcon, VOID_HUNTER_ICON, elementColor, elementGradient } from "@/lib/deck-config";
import { portraitFrame } from "@/lib/portrait-frames";
import { DeckImg } from "@/components/deck/DeckImg";

// Album-sleeve roster tile (vinyl slides out on hover). Element + type icon badges sit in
// the art's top-left corner. Void Hunter agents get a third badge (a white-filled mask of
// the void-hunter icon so it reads on the dark backing) + a gradient accent derived from
// their element's color (--vh-grad). A missing icon self-hides via DeckImg. CSS: globals.css.
export function RosterTile({ a }: { a: RosterEntry }) {
  const style: React.CSSProperties = a.voidHunter
    ? ({ "--ec": elementColor(a.attribute), "--vh-grad": elementGradient(a.attribute) } as React.CSSProperties)
    : ({ "--ec": a.el } as React.CSSProperties);
  const vhMask = `url("${withBase(iconPath(VOID_HUNTER_ICON))}")`;
  // Global roster face-zoom (boyfriend-eyeball pass). 1 = measured framing; >1 zooms in about
  // the tile center (faces stay put, just bigger). Tweak this one number to retune the whole grid.
  const ZOOM = 2.1875; // global roster face-zoom, cumulative (1.5625 × 1.4). One number retunes the grid.
  const HOLD = 1 / 1.4; // holds an agent OUT of the latest +40% global round (pins it at the prior zoom).
  // Per-agent eyeball tuning, in tile-% at the live zoom: dy+ = DOWN, dy- = UP; dx+ = RIGHT, dx- = LEFT.
  // dz = extra per-agent zoom multiplier on top of ZOOM (HOLD = excluded from the last global bump).
  const NUDGE: Record<string, { dx?: number; dy?: number; dz?: number }> = {
    // — Anomaly —
    alice: { dy: 20 },
    miyabi: { dy: 50, dx: -10, dz: HOLD },
    janedoe: { dy: 30 },
    vivian: { dy: -70, dx: 15, dz: 1.3 * HOLD * 1.1 * 1.1 },
    aria: { dx: -5, dy: 20 },
    velina: { dx: -65 },
    // — Attack —
    yeshunguang: { dx: -10 },
    evelyn: { dy: 35, dx: 10 },
    ellen: { dx: 30, dy: 15 },          // Ellen Joe
    soldier0anby: { dy: 15 },
    seed: { dx: 10, dy: 10 },
    // — Stun —
    jufufu: { dy: -40, dx: 40, dz: HOLD * 1.15 * 1.1 },
    trigger: { dy: 30, dz: 1.15 },
    lighter: { dy: 20, dx: -10, dz: 1.15 },
    nangongyu: { dx: -60, dy: -10 },
    // — Support —
    astra: { dy: 10 },
    yuzuha: { dy: -60, dx: 15, dz: 1.1 },
    zhao: { dx: 35, dy: -60, dz: HOLD },
    // — Rupture —
    yixuan: { dx: -25, dy: 25, dz: 1.1 },
    yidhari: { dx: 25, dy: 20 },
  };
  const m = portraitFrame(a.slug);
  const n = NUDGE[a.slug] ?? {};
  const z = ZOOM * (n.dz ?? 1);
  const f = {
    height: m.height * z,
    top: 50 + z * (m.top - 50) + (n.dy ?? 0),
    left: 50 + z * (m.left - 50) + (n.dx ?? 0),
  };


  return (
    <Link href={`/r/${a.slug}/`} className={`alb${a.voidHunter ? " vh" : ""}`} style={style}>
      <div className="vinyl" />
      <div className="sleeve">
        <div className="art">
          <DeckImg
            className="pf"
            src={tallPath(a.slug)}
            alt={a.name}
            style={{ height: `${f.height}%`, left: `${f.left}%`, top: `${f.top}%` }}
          />
        </div>
        <div className="badges">
          <DeckImg src={iconPath(elementIcon(a.attribute))} alt={a.attribute} />
          <DeckImg src={iconPath(typeIcon(a.section))} alt={a.section} />
          {a.voidHunter && (
            <span className="vh-badge" title="Void Hunter" aria-label="Void Hunter">
              <i style={{ WebkitMaskImage: vhMask, maskImage: vhMask }} />
            </span>
          )}
        </div>
        <div className="lab">
          <div className="nm">
            {a.name}
            {a.title ? <small className="title">{a.title}</small> : <small>{a.section}</small>}
          </div>
          <div className="me">M{a.mindscape}</div>
        </div>
        <div className="strip">
          {Array.from({ length: 8 }).map((_, i) => (
            <i key={i} />
          ))}
        </div>
      </div>
    </Link>
  );
}
