import type { Metadata } from "next";
import { RandomPlayHost } from "@/random-play-host/RandomPlayHost";

export const metadata: Metadata = {
  title: "Cosmea's ZZZ · Random Play",
  description: "Cosmea's ZZZ rental wall — her agents as tapes, builds graded live, and the Staff Picks shelf for what to pull next.",
};

// Cosmea's store: same stage, her profile (the /wife path selects the wife-zzz row + her roster slice).
export default function WifeHome() {
  return <RandomPlayHost />;
}
