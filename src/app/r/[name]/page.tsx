import { rosterFor } from "@/lib/roster";
import { PROFILE_KEY } from "@/lib/supabase";
import { RandomPlayHost } from "@/random-play-host/RandomPlayHost";

// Pre-render a static entry point per agent on the default (A.) roster (output: "export"): it opens the
// stage on that tape. Adding an agent needs a rebuild + push to emit its /r/<slug>/ page; the *build
// data* is live from Supabase, so editing discs never needs a redeploy. Wife-only agents are emitted
// under /wife/r/ instead.
export function generateStaticParams() {
  return rosterFor(PROFILE_KEY).map((a) => ({ name: a.slug }));
}

export default async function AgentPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  return <RandomPlayHost initial={{ view: "tape", selected: decodeURIComponent(name) }} />;
}
