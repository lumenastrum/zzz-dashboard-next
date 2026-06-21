import { ROSTER } from "@/lib/roster";
import { AgentRoute } from "./client";

// Pre-render a static page per roster slug (output: "export"). Adding an agent to the
// roster needs a rebuild + push to emit its /r/<slug>/ page; the *build data* itself is
// live from Supabase, so editing discs never needs a redeploy.
export function generateStaticParams() {
  return ROSTER.map((a) => ({ name: a.slug }));
}

export default async function AgentPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  return <AgentRoute slug={decodeURIComponent(name)} />;
}
