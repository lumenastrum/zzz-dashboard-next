import Link from "next/link";
import type { RosterEntry } from "@/lib/roster";
import { withBase } from "@/lib/base-path";
import { iconPath, tallPath, elementIcon, typeIcon, VOID_HUNTER_ICON, elementColor, elementGradient } from "@/lib/deck-config";
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

  return (
    <Link href={`/r/${a.slug}/`} className={`alb${a.voidHunter ? " vh" : ""}`} style={style}>
      <div className="vinyl" />
      <div className="sleeve">
        <div className="art" style={{ backgroundImage: `url(${withBase(tallPath(a.slug))})` }} />
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
