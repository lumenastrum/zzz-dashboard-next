import type { Metadata } from "next";
import { RandomPlayHost } from "@/random-play-host/RandomPlayHost";

export const metadata: Metadata = {
  title: "Triple Features · ZZZ · Random Play",
  description: "A.'s ZZZ team bundles — every three-agent lineup with its logged runs, best scores and liner notes.",
};

// Static entry point: opens the stage on Triple Features (teams = setlists merged with the logs).
export default function Teams() {
  return <RandomPlayHost initial={{ view: "teams" }} />;
}
