import type { Metadata } from "next";
import { RandomPlayHost } from "@/random-play-host/RandomPlayHost";

export const metadata: Metadata = {
  title: "Channel Search · Signal Archive · ZZZ · Random Play",
  description: "Full-lifetime Signal Search (gacha pull) archive — every channel, pity walk, and coinflip receipt, preserved past Hoyo's rolling window.",
};

// Static entry point: opens the stage on Channel Search (A.'s archive; data loads client-side from the
// `andres-zzz-pulls` Supabase row — the CLI `npm run signal` is the only writer).
export default function SignalPage() {
  return <RandomPlayHost initial={{ view: "signal" }} />;
}
