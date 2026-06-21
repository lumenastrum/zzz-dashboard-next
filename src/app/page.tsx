import { ROSTER } from "@/lib/roster";
import { RosterTile } from "@/components/RosterTile";

export default function Home() {
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
        <div className="cnt">{ROSTER.length} Tracks Owned</div>
      </div>

      <div className="roster">
        {ROSTER.map((a) => (
          <RosterTile key={a.slug} a={a} />
        ))}
      </div>

      <div className="hint">
        ▸ Drop the needle on <b>Alice</b>
      </div>
    </div>
  );
}
