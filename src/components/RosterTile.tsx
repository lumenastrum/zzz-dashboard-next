import Link from "next/link";
import type { RosterEntry } from "@/lib/roster";
import { withBase } from "@/lib/base-path";
import { iconPath, elementIcon, typeIcon } from "@/lib/deck-config";
import { DeckImg } from "@/components/deck/DeckImg";

// Album-sleeve roster tile (vinyl slides out on hover). Element + type icon badges sit
// in the art's top-left corner (game-card style); a missing icon self-hides via DeckImg.
// CSS in globals.css (.alb).
export function RosterTile({ a }: { a: RosterEntry }) {
  return (
    <Link
      href={`/r/${a.slug}/`}
      className="alb"
      style={{ "--ec": a.el } as React.CSSProperties}
    >
      <div className="vinyl" />
      <div className="sleeve">
        <div className="art" style={{ backgroundImage: `url(${withBase(`/assets/portraits/${a.slug}.png`)})` }} />
        <div className="badges">
          <DeckImg src={iconPath(elementIcon(a.attribute))} alt={a.attribute} />
          <DeckImg src={iconPath(typeIcon(a.section))} alt={a.section} />
        </div>
        <div className="lab">
          <div className="nm">
            {a.name}
            <small>{a.section}</small>
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
