import { rosterFor } from "@/lib/roster";
import { PROFILE_KEY } from "@/lib/supabase";
import { RosterHome } from "@/components/RosterHome";

// Default view (Andres) — his roster at the clean root (wife-only agents hidden). Wife → /wife.
export default function Home() {
  return <RosterHome roster={rosterFor(PROFILE_KEY)} />;
}
