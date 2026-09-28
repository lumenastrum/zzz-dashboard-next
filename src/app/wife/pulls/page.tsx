import type { Metadata } from "next";
import { RandomPlayHost } from "@/random-play-host/RandomPlayHost";

export const metadata: Metadata = {
  title: "Staff Picks · Cosmea's ZZZ · Random Play",
  description: "Cosmea's ranked ZZZ pull-priority wishlist as the store's Staff Picks shelf — what to convene next and why.",
};

// Static entry point: opens Cosmea's store on Staff Picks (her-exclusive section; the list is editorial
// data from pull-priority.ts). The anniversary selector guide still lives at /wife/selector/.
export default function WifePulls() {
  return <RandomPlayHost initial={{ view: "picks" }} />;
}
