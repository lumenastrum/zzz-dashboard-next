import type { AssaultHistoryEntry, AssaultHistoryTarget } from "@/lib/assault";
import { AssaultPips } from "@/components/AssaultSeason";
import { DeckImg } from "@/components/deck/DeckImg";

// The rotation-history shelf under the Deadly Assault marquee — ShiyuHistory's sh-* card
// language, but richer rows: the in-game DA history screen keeps per-target boss + pips +
// team + score, so (unlike Shiyu's shelf, which drops enemy data) each card lists its three
// target rows in full. Entries without compiled targets fall back to the aggregate pip tally.
const fmt = (n: number) => n.toLocaleString("en-US");
const unlockDate = (iso: string) => {
  const [, m, d] = iso.split("-");
  return m && d ? `${m}/${d}` : iso || "—";
};

// One row of the card: a Trial target ("T1".."T3") or the Adversity node ("ADVERSITY", violet,
// carrying its own percentile beside the score — it never pools into the card's total).
function TargetRow({ t, tag, rank, adv }: { t: AssaultHistoryTarget; tag: string; rank?: string; adv?: boolean }) {
  return (
    <div className={adv ? "da-ht da-ht-adv" : "da-ht"}>
      <div className="da-ht-top">
        <small>{tag}</small>
        {t.bossSlug && (
          <span className="da-ht-ico" aria-hidden>
            <DeckImg src={`/assets/bosses/${t.bossSlug}.webp`} alt="" />
          </span>
        )}
        <span className="da-ht-boss">{t.boss}</span>
        <AssaultPips earned={t.pips} max={3} size={12} />
      </div>
      <div className="da-ht-row">
        {t.team.map((m) => (
          <DeckImg key={m.slug} className="sh-tp" src={`/assets/endgame/${m.slug}.webp`} alt={m.name} />
        ))}
        {t.bangboo && (
          <span className="da-ht-boo" title={`${t.bangboo.name} (Bangboo)`}>
            <DeckImg src={`/assets/bangboo/${t.bangboo.slug}.webp`} alt={t.bangboo.name} />
          </span>
        )}
        <b className="da-ht-score">
          {rank && <small>{rank}</small>}
          {fmt(t.score)}
        </b>
      </div>
    </div>
  );
}

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
              <b className="sh-date">{unlockDate(e.date)}</b>
              <span className="sh-unl">Unlocked</span>
              <span className="sh-rank">{e.rank}</span>
            </header>
            <div className="sh-score">
              <span className="sh-lbl">{e.label}</span>
              <span className="sh-sv">
                {fmt(e.score)} <small>Score</small>
              </span>
            </div>
            {e.targets && e.targets.length > 0 ? (
              <div className="da-hts">
                {e.targets.map((t, i) => (
                  <TargetRow key={i} t={t} tag={`T${i + 1}`} />
                ))}
                {e.adversity && <TargetRow t={e.adversity} tag="ADVERSITY" rank={e.adversity.rank} adv />}
              </div>
            ) : (
              <div className="da-hist-pips">
                <AssaultPips earned={e.pips} max={9} size={15} />
                <em>
                  {e.pips}/9
                </em>
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
