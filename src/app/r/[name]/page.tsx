import { rosterFor } from "@/lib/roster";
import { PROFILE_KEY } from "@/lib/supabase";
import { AgentRoute } from "@/components/AgentRoute";

// Pre-render a static page per agent on the default (Andres) roster (output: "export"). Adding an
// agent needs a rebuild + push to emit its /r/<slug>/ page; the *build data* is live from Supabase,
// so editing discs never needs a redeploy. Wife-only agents are emitted under /wife/r/ instead.
export function generateStaticParams() {
  return rosterFor(PROFILE_KEY).map((a) => ({ name: a.slug }));
}

export default async function AgentPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  return <AgentRoute slug={decodeURIComponent(name)} />;
}
