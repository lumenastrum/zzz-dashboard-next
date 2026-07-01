import type { ShiyuHistoryEntry } from "@/lib/shiyu";
import { ratingClass } from "@/lib/shiyu";
import { DeckImg } from "@/components/deck/DeckImg";

// The clear-history block — the archive shelf under the marquee. Compact cards echoing the
// in-game history screen: "MM/DD Unlocked" + season badge, frontier + score, the S/A/B grade-card
// counts (zeros dimmed), and — when the roster history is compiled — the 3 clearing agents per
// room as mini endgame portraits. No enemy data here by design.
const fmt = (n: number) => n.toLocaleString("en-US");
const unlockDate = (iso: string) => {
  const [, m, d] = iso.split("-");
  return m && d ? `${m}/${d}` : iso;
};

export function ShiyuHistory({ entries }: { entries: ShiyuHistoryEntry[] }) {
  if (entries.length === 0) return null;

  return (
    <section className="shiyu-history">
      <div className="sh-head">
        <h3>Clear History</h3>
        <div className="ln" />
        <span className="cnt">{entries.length} past cycle{entries.length === 1 ? "" : "s"}</span>
      </div>
      <div className="sh-grid">
        {entries.map((e) => (
          <article className="sh-card" key={e.id}>
            <header className="sh-top">
              <b className="sh-date">{unlockDate(e.date)}</b>
              <span className="sh-unl">Unlocked</span>
              <span className={`rate sh-rate r-${ratingClass(e.rating)}`}>{e.rating}</span>
            </header>
            <div className="sh-score">
              <span className="sh-lbl">{e.label}</span>
              <span className="sh-sv">
                {fmt(e.score)} <small>Score</small>
              </span>
            </div>
            <div className="sh-grades">
              {(["s", "a", "b"] as const).map((g) => (
                <span key={g} className={`sh-grade${e.grades[g] > 0 ? "" : " zero"}`}>
                  <span className={`rate r-${g}`}>{g.toUpperCase()}</span>
                  <em>×{e.grades[g]}</em>
                </span>
              ))}
            </div>
            {e.teams && e.teams.length > 0 && (
              <div className="sh-teams">
                {e.teams.map((team, i) => (
                  <span className="sh-room" key={i}>
                    <small>R{i + 1}</small>
                    {team.map((m) => (
                      <DeckImg key={m.slug} className="sh-tp" src={`/assets/endgame/${m.slug}.webp`} alt={m.name} />
                    ))}
                  </span>
                ))}
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
