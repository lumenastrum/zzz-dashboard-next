"use client";

// Client bridge for the agent route: resolves the roster entry (static chrome) + the
// live build from the DataProvider, then renders the deck. Loading/empty/unknown states
// are handled here so the static roster home never blocks on the Supabase round-trip.
import Link from "next/link";
import { ROSTER } from "@/lib/roster";
import { useData } from "@/lib/data-context";
import { AgentDeck } from "@/components/deck/AgentDeck";

function StatePanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="wrap">
      <div className="shead">
        <h2>{title}</h2>
        <div className="ln" />
        <div className="cnt">
          <Link href="/" className="back">◂ back to roster</Link>
        </div>
      </div>
      <div className="proof">{children}</div>
    </div>
  );
}

export function AgentRoute({ slug }: { slug: string }) {
  const entry = ROSTER.find((a) => a.slug === slug);
  const { data, agentByName, syncStatus, updateAgent } = useData();

  if (!entry) {
    return (
      <StatePanel title={slug}>
        <p className="note">Unknown agent — not in the roster.</p>
      </StatePanel>
    );
  }

  if (!data) {
    return (
      <StatePanel title={entry.name}>
        <p className="note">{syncStatus === "error" ? "Data unavailable." : "Syncing deck…"}</p>
      </StatePanel>
    );
  }

  const agent = agentByName[entry.name];
  if (!agent || !agent.discs?.pieces?.length) {
    return (
      <StatePanel title={entry.name}>
        <p className="note">
          Build not entered yet — Alice is the reference build. Other agents grade once their
          discs are entered.
        </p>
      </StatePanel>
    );
  }

  return (
    <div className="wrap deck-wrap">
      <AgentDeck
        agent={agent}
        entry={entry}
        syncStatus={syncStatus}
        onChange={(m) => updateAgent(agent.name, m)}
      />
    </div>
  );
}
