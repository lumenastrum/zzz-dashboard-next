import type { Metadata } from "next";
import { PROFILE_WIFE } from "@/lib/supabase";
import { pullPriorityFor } from "@/lib/pull-priority";
import { TopNav } from "@/components/TopNav";
import { PullCrate } from "@/components/PullCrate";

export const metadata: Metadata = {
  title: "Pull Priority · Cosmea's ZZZ · Soundsystem",
  description: "Cosmea's ranked ZZZ pull-priority wishlist — what to convene next, ranked by how it fits her roster and teams.",
};

// Cosmea's pull-priority wishlist (her-exclusive tab). Static page — the list is editorial data
// from pull-priority.ts, rendered as flippable record-sleeve crates. TopNav highlights "Pulls".
export default function WifePulls() {
  const recs = pullPriorityFor(PROFILE_WIFE);

  return (
    <div className="wrap">
      <TopNav base="/wife" active="pulls" />

      <div className="shead">
        <h2>Pull Priority</h2>
        <div className="eq">
          {[14, 9, 16, 7, 12, 6, 11, 8].map((h, i) => (
            <i key={i} style={{ height: h }} />
          ))}
        </div>
        <div className="ln" />
        <div className="cnt">{recs.length} On The Wishlist</div>
      </div>

      <div className="crate-grid">
        {recs.map((r) => (
          <PullCrate key={r.rank} rec={r} />
        ))}
      </div>

      <div className="hint">
        ▸ Flip a sleeve for the <b>liner notes</b>
      </div>
    </div>
  );
}
