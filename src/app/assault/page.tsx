import type { Metadata } from "next";
import { RandomPlayHost } from "@/random-play-host/RandomPlayHost";

export const metadata: Metadata = {
  title: "Now Showing · Deadly Assault · ZZZ · Random Play",
  description: "A.'s Deadly Assault rotations on the marquee — box-office totals, the three screens, and every past showing.",
};

// Static entry point: opens the stage on Now Showing (Deadly Assault).
export default function AssaultPage() {
  return <RandomPlayHost initial={{ view: "assault" }} />;
}
