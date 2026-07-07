import type { Metadata } from "next";
import { PROFILE_KEY } from "@/lib/supabase";
import { setlistsFor } from "@/lib/setlists";
import { TopNav } from "@/components/TopNav";
import { TeamSetlist } from "@/components/TeamSetlist";

export const metadata: Metadata = {
  title: "Teams · ZZZ · Soundsystem",
  description:
    "A.'s benchmarked ZZZ team setlists — curated, in-game-verified squad shells with archetype, room signal, and real Shiyu benchmark scores.",
};

// A.'s Teams tab — benchmarked team "setlists" from the meta-comps bible, rendered as glossy
// diagonal-card panels. Static page; the shells are editorial data (setlists.ts). TopNav lights "Teams".
export default function Teams() {
  const sets = setlistsFor(PROFILE_KEY);
  const benched = sets.filter((s) => s.benchmark).length;

  return (
    <div className="wrap">
      <TopNav active="teams" />

      <div className="shead">
        <h2>Setlists</h2>
        <div className="eq">
          {[14, 9, 16, 7, 12, 6, 11, 8].map((h, i) => (
            <i key={i} style={{ height: h }} />
          ))}
        </div>
        <div className="ln" />
        <div className="cnt">{sets.length} Shells · {benched} Benchmarked</div>
      </div>

      <div className="setlists">
        {sets.map((s) => (
          <TeamSetlist key={s.id} set={s} />
        ))}
      </div>

      <div className="hint">
        ▸ <b>★ Benchmarked</b> = your own Shiyu runs (phase-specific) · the rest are guide-sourced shells
      </div>
    </div>
  );
}
