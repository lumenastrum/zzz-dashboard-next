import { RosterTile } from "@/components/RosterTile";
import type { RosterEntry } from "@/lib/roster";

// Shared roster home (the "S-Rank Agents" album wall). Parameterized by the roster slice +
// link base so the default view (root, full roster) and the wife view (/wife, her owned slugs)
// render from one component. `base` threads into every tile's href so clicks stay in-profile.
export function RosterHome({ roster, base = "" }: { roster: RosterEntry[]; base?: string }) {
  return (
    <div className="wrap">
      <header className="face">
        <div className="brand">
          <span className="led" />
          <div>
            <h1>
              Zenless <b>{"//"}</b> Soundsystem
            </h1>
            <div className="sub">New Eridu · Hi-Fi Proxy Deck</div>
          </div>
        </div>
        <nav className="tnav">
          <a className="on" href="#">Agents</a>
          <a href="#">Levels</a>
          <a href="#">Teams</a>
          <a href="#">Pulls</a>
        </nav>
      </header>

      <div className="shead">
        <h2>S-Rank Agents</h2>
        <div className="eq">
          {[10, 16, 7, 13, 9, 15, 6, 12].map((h, i) => (
            <i key={i} style={{ height: h }} />
          ))}
        </div>
        <div className="ln" />
        <div className="cnt">{roster.length} Tracks Owned</div>
      </div>

      <div className="roster">
        {roster.map((a) => (
          <RosterTile key={a.slug} a={a} base={base} />
        ))}
      </div>

      <div className="hint">
        ▸ Drop the needle on <b>Alice</b>
      </div>
    </div>
  );
}
