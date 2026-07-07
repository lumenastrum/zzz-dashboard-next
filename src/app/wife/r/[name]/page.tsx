import type { Metadata } from "next";
import { rosterFor } from "@/lib/roster";
import { PROFILE_WIFE } from "@/lib/supabase";
import { AgentRoute } from "@/components/AgentRoute";

export const metadata: Metadata = {
  title: "Cosmea's ZZZ · Soundsystem",
};

// Pre-render a static page per agent on the wife roster (output: "export"). Build data is live
// from the wife-zzz Supabase row — editing discs never needs a redeploy; only roster changes do.
export function generateStaticParams() {
  return rosterFor(PROFILE_WIFE).map((a) => ({ name: a.slug }));
}

export default async function WifeAgentPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  return <AgentRoute slug={decodeURIComponent(name)} />;
}
