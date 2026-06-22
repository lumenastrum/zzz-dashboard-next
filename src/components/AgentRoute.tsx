"use client";

// Client bridge for the agent route (shared by the root /r/[name] and /wife/r/[name] routes):
// resolves the roster entry (static chrome) + the live build from the DataProvider, then renders
// the deck. The active profile comes from the URL (useProfile), and `base` keeps every internal
// link inside the current profile so /wife decks link back to /wife, not the root.
import Link from "next/link";
import { ROSTER } from "@/lib/roster";
import { useData } from "@/lib/data-context";
import { useProfile, profileHref } from "@/lib/profile";
import { AgentDeck } from "@/components/deck/AgentDeck";

function StatePanel({ base, title, children }: { base: string; title: string; children: React.ReactNode }) {
  return (
    <div className="wrap">
      <div className="shead">
        <h2>{title}</h2>
        <div className="ln" />
        <div className="cnt">
          <Link href={profileHref(base, "/")} className="back">◂ back to roster</Link>
        </div>
      </div>
      <div className="proof">{children}</div>
    </div>
  );
}

export function AgentRoute({ slug }: { slug: string }) {
  const entry = ROSTER.find((a) => a.slug === slug);
  const { base } = useProfile();
  const { data, agentByName, syncStatus, updateAgent } = useData();

  if (!entry) {
    return (
      <StatePanel base={base} title={slug}>
        <p className="note">Unknown agent — not in the roster.</p>
      </StatePanel>
    );
  }

  if (!data) {
    return (
      <StatePanel base={base} title={entry.name}>
        <p className="note">{syncStatus === "error" ? "Data unavailable." : "Syncing deck…"}</p>
      </StatePanel>
    );
  }

  // AgentDeck renders identity from the roster chrome even when no build exists yet,
  // so a newly-seeded agent still gets a real agent screen (title pill + portrait).
  const agent = agentByName[entry.name] ?? null;

  return (
    <div className="wrap deck-wrap">
      <AgentDeck
        agent={agent}
        entry={entry}
        base={base}
        syncStatus={syncStatus}
        onChange={(m) => updateAgent(entry.name, m)}
      />
    </div>
  );
}
