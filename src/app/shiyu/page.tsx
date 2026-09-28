import type { Metadata } from "next";
import { RandomPlayHost } from "@/random-play-host/RandomPlayHost";

export const metadata: Metadata = {
  title: "The Register · Shiyu Defense · ZZZ · Random Play",
  description: "A.'s Shiyu Defense clears as register receipts — best total, rating ladder, and per-room boss / team / score slips.",
};

// Static entry point: opens the stage on The Register (Shiyu Defense).
export default function ShiyuPage() {
  return <RandomPlayHost initial={{ view: "shiyu" }} />;
}
