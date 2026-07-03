"use client";

import { RosterTile, type TileGrade } from "@/components/RosterTile";
import { TopNav } from "@/components/TopNav";
import type { RosterEntry } from "@/lib/roster";
import { useData } from "@/lib/data-context";
import { gradeBuild, GRADING_CONFIG } from "@/lib/grading";

// Shared roster home (the "S-Rank Agents" album wall). Parameterized by the roster slice +
// link base so the default view (root, full roster) and the wife view (/wife, her owned slugs)
// render from one component. `base` threads into every tile's href so clicks stay in-profile.
// Client component: it reads the live Supabase blob (non-blocking — tiles render immediately)
// to grade every build, feeding each tile's VU strip. Strips sit dark until the data lands.
export function RosterHome({ roster, base = "" }: { roster: RosterEntry[]; base?: string }) {
  const { agentByName } = useData();

  const gradeFor = (name: string): TileGrade | null => {
    const agent = agentByName[name];
    if (!agent?.discs?.pieces?.length) return null;
    try {
      const g = gradeBuild(agent, GRADING_CONFIG);
      return { pct: g.buildPct, letter: g.buildLetter, color: g.buildColor };
    } catch {
      return null;
    }
  };

  return (
    <div className="wrap">
      <TopNav base={base} active="agents" />

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
          <RosterTile key={a.slug} a={a} base={base} grade={gradeFor(a.name)} />
        ))}
      </div>

      <div className="hint">
        ▸ Drop the needle on <b>Alice</b>
      </div>
    </div>
  );
}
