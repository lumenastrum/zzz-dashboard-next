import type { Metadata } from "next";
import { PROFILE_KEY } from "@/lib/supabase";
import { assaultCyclesFor, assaultHistoryFor } from "@/lib/assault";
import { TopNav } from "@/components/TopNav";
import { AssaultSeason } from "@/components/AssaultSeason";
import { AssaultRoomCard } from "@/components/AssaultRoomCard";
import { AssaultHistory } from "@/components/AssaultHistory";

export const metadata: Metadata = {
  title: "Deadly Assault · ZZZ · Soundsystem",
  description:
    "Andres's Deadly Assault rotations — best total, ranking, challenge-goal pips, and per-boss score / team logs.",
};

// Deadly Assault tab — the second, rotating endgame mode (Shiyu's sibling). Static page; cycles
// are editorial data (assault.ts). The current rotation gets the marquee (season readout +
// boss-poster target cards); older rotations auto-demote to the history shelf. TopNav lights
// "Assault".
export default function Assault() {
  const cycles = assaultCyclesFor(PROFILE_KEY);
  const cycle = cycles[0]; // current rotation — the marquee
  const history = assaultHistoryFor(PROFILE_KEY);

  return (
    <div className="wrap">
      <TopNav active="assault" />

      <div className="shead">
        <h2>Deadly Assault</h2>
        <div className="eq">
          {[12, 7, 15, 9, 16, 6, 11, 8].map((h, i) => (
            <i key={i} style={{ height: h }} />
          ))}
        </div>
        <div className="ln" />
        <div className="cnt">{cycle ? cycle.label + (cycle.date ? ` · ${cycle.date}` : "") : "No rotations logged"}</div>
      </div>

      {cycle ? (
        <>
          <AssaultSeason cycle={cycle} />
          <div className="shiyu-rooms">
            {cycle.rooms.map((r) => (
              <AssaultRoomCard key={r.room} room={r} />
            ))}
          </div>
        </>
      ) : (
        <div className="hint">No Deadly Assault rotations logged yet</div>
      )}

      <AssaultHistory entries={history} />

      <div className="hint">
        ▸ Current rotation gets the full treatment · past rotations file into the history shelf
      </div>
    </div>
  );
}
