import Link from "next/link";
import { ROSTER, agentBySlug } from "@/lib/roster";
import { gradeBuild, computeStats, GRADING_CONFIG } from "@/lib/grading";

export function generateStaticParams() {
  return ROSTER.map((a) => ({ name: a.slug }));
}

export default async function AgentPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const entry = ROSTER.find((a) => a.slug === name);
  const agent = agentBySlug(name);

  return (
    <div className="wrap">
      <div className="shead">
        <h2>{entry?.name ?? name}</h2>
        <div className="ln" />
        <div className="cnt">
          <Link href="/" className="back">
            ◂ back to roster
          </Link>
        </div>
      </div>

      {agent ? (
        (() => {
          const grade = gradeBuild(agent, GRADING_CONFIG);
          const stats = computeStats(agent, GRADING_CONFIG);
          return (
            <div className="proof">
              <h3>
                Build {grade.buildLetter} · {grade.buildPct}%
              </h3>
              <div className="grow">
                {grade.discs.map((d) => (
                  <span className="chip" key={d.slot}>
                    Slot {d.slot} <b style={{ color: d.color }}>{d.letter}</b> · {d.pct}%
                  </span>
                ))}
              </div>
              <div className="grow">
                {Object.entries(stats.stats).map(([k, s]) => (
                  <span className="chip" key={k}>
                    {k}: {s.sheet}
                    {s.combat > 0 ? (
                      <>
                        {" → "}
                        <b style={{ color: "var(--violet)" }}>{s.effective}</b>
                      </>
                    ) : null}
                  </span>
                ))}
              </div>
              <p className="note">
                engine wired ✓ — sheet vs effective + grading computed live from{" "}
                <code>@/lib/grading</code>. Full &quot;Now Playing&quot; deck UI (the editable hex
                frame + VU meters) ports from Mockup C next.
              </p>
            </div>
          );
        })()
      ) : (
        <div className="proof">
          <h3>{entry?.name ?? name}</h3>
          <p className="note">Build data not ported yet — Alice is the reference build. More agents to come.</p>
        </div>
      )}
    </div>
  );
}
