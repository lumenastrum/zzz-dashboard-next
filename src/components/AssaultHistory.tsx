import type { AssaultHistoryEntry } from "@/lib/assault";
import { AssaultPips } from "@/components/AssaultSeason";
import { DeckImg } from "@/components/deck/DeckImg";

// The rotation-history shelf under the Deadly Assault marquee — ShiyuHistory's sh-* card
// language, with the mode's own vitals: pip tally (of 9) instead of grade cards, ranking
// instead of a season rating. Empty until a second rotation is logged (cycles auto-demote).
const fmt = (n: number) => n.toLocaleString("en-US");
const startDate = (iso: string) => {
  const [, m, d] = iso.split("-");
  return m && d ? `${m}/${d}` : iso || "—";
};

export function AssaultHistory({ entries }: { entries: AssaultHistoryEntry[] }) {
  if (entries.length === 0) return null;

  return (
    <section className="shiyu-history">
      <div className="sh-head">
        <h3>Rotation History</h3>
        <div className="ln" />
        <span className="cnt">
          {entries.length} past rotation{entries.length === 1 ? "" : "s"}
        </span>
      </div>
      <div className="sh-grid">
        {entries.map((e) => (
          <article className="sh-card" key={e.id}>
            <header className="sh-top">
              <b className="sh-date">{startDate(e.date)}</b>
              <span className="sh-unl">Rotation</span>
              <span className="sh-rank">{e.rank}</span>
            </header>
            <div className="sh-score">
              <span className="sh-lbl">{e.label}</span>
              <span className="sh-sv">
                {fmt(e.score)} <small>Score</small>
              </span>
            </div>
            <div className="da-hist-pips">
              <AssaultPips earned={e.pips} max={9} size={15} />
              <em>
                {e.pips}/9
              </em>
            </div>
            {e.teams && e.teams.length > 0 && (
              <div className="sh-teams">
                {e.teams.map((team, i) => (
                  <span className="sh-room" key={i}>
                    <small>T{i + 1}</small>
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
