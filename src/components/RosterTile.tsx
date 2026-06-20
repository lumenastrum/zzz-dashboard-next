import Link from "next/link";
import type { RosterEntry } from "@/lib/roster";
import { withBase } from "@/lib/base-path";

// Album-sleeve roster tile (vinyl slides out on hover). CSS in globals.css (.alb).
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
