import type { Metadata } from "next";
import { rosterFor } from "@/lib/roster";
import { PROFILE_WIFE } from "@/lib/supabase";
import { RosterHome } from "@/components/RosterHome";

export const metadata: Metadata = {
  title: "Courtney's ZZZ · Soundsystem",
  description: "Courtney's ZZZ agent roster, disc-drive grading, and stat audits — New Eridu hi-fi.",
};

// Wife's roster home — same component as the root, scoped to her owned agents and the /wife base.
export default function WifeHome() {
  return <RosterHome roster={rosterFor(PROFILE_WIFE)} base="/wife" />;
}
