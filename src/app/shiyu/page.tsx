import type { Metadata } from "next";
import { PROFILE_KEY } from "@/lib/supabase";
import { shiyuCyclesFor, shiyuHistoryFor } from "@/lib/shiyu";
import { TopNav } from "@/components/TopNav";
import { ShiyuSeason } from "@/components/ShiyuSeason";
import { ShiyuRoomCard } from "@/components/ShiyuRoomCard";
import { ShiyuHistory } from "@/components/ShiyuHistory";

export const metadata: Metadata = {
  title: "Shiyu Defense · ZZZ · Soundsystem",
  description: "Andres's Shiyu Defense clears — best total, rating ladder, and per-room boss / team / score logs.",
};

// Shiyu Defense tab — the endgame counterpart to Teams. Static page; cycles are editorial data
// (shiyu.ts). The most recent cycle gets the full marquee (season readout + boss-poster rooms);
// older cycles auto-demote to the compact clear-history shelf. TopNav lights "Shiyu".
export default function Shiyu() {
  const cycles = shiyuCyclesFor(PROFILE_KEY);
  const cycle = cycles[0]; // most recent — the marquee
  const history = shiyuHistoryFor(PROFILE_KEY);

  return (
    <div className="wrap">
      <TopNav active="shiyu" />

      <div className="shead">
        <h2>Shiyu Defense</h2>
        <div className="eq">
          {[12, 7, 15, 9, 16, 6, 11, 8].map((h, i) => (
            <i key={i} style={{ height: h }} />
          ))}
        </div>
        <div className="ln" />
        <div className="cnt">{cycle ? `${cycle.label} · ${cycle.date}` : "No cycles logged"}</div>
      </div>

      {cycle ? (
        <>
          <ShiyuSeason cycle={cycle} />
          <div className="shiyu-rooms">
            {cycle.rooms.map((r) => (
              <ShiyuRoomCard key={r.room} room={r} />
            ))}
          </div>
        </>
      ) : (
        <div className="hint">No Shiyu cycles logged yet</div>
      )}

      <ShiyuHistory entries={history} />

      <div className="hint">
        ▸ Newest cycle gets the full treatment · older clears file into the history shelf
      </div>
    </div>
  );
}
