import type { Metadata } from "next";
import { TopNav } from "@/components/TopNav";
import { SignalDeck } from "@/components/SignalDeck";

export const metadata: Metadata = {
  title: "Signal Archive · ZZZ · Soundsystem",
  description:
    "Full-lifetime Signal Search (gacha pull) archive — every channel, pity walk, and coinflip receipt, preserved past Hoyo's rolling window.",
};

// A.'s pull-history archive (his-exclusive tab — Cosmea's Pulls tab is the
// wishlist). Data loads client-side from the `andres-zzz-pulls` Supabase row;
// the CLI (`npm run signal`) is the only writer.
export default function SignalPage() {
  return (
    <div className="wrap">
      <TopNav active="signal" />
      <SignalDeck />
    </div>
  );
}
