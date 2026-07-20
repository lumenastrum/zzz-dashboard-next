import type { Metadata } from "next";
import { TopNav } from "@/components/TopNav";
import { DeckImg } from "@/components/deck/DeckImg";
import { tallPath, iconPath, elementIcon, typeIcon, elementColor } from "@/lib/deck-config";
import type { CSSProperties } from "react";

export const metadata: Metadata = {
  title: "Anniversary Selector · Cosmea's ZZZ · Soundsystem",
  description:
    "One free S-rank agent + signature W-engine from the v3.1 anniversary — scored for Cosmea's account and ranked with a verdict.",
};

// The 2nd-anniversary free S-rank selector guide (her-exclusive, launched from the Pulls tab).
// Fully static editorial infographic — verdict + scores follow the account doctrine in
// docs/wife-pull-priority-runbook.md (complete premium lanes; mindscapes only when freely given).
// Research: chibi-verified 2026-07-20 vs Game8 / Icy-Veins / Mobalytics / Prydwen; kit numbers
// are pre-3.1 and may shift at launch.

const ec = (attr: string) => ({ "--ec": elementColor(attr) } as CSSProperties);

// Doctrine scorecard rows (0–5 per axis). Hugo renders as a veto row, no meters.
const MATRIX = [
  { slug: "lucia", name: "Lucia", attr: "Ether", scores: [5, 5, 0, 5] },
  { slug: "janedoe", name: "Jane Doe", attr: "Physical", scores: [3, 2, 5, 1] },
  { slug: "trigger", name: "Trigger", attr: "Electric", scores: [3, 3, 1, 3] },
  { slug: "soldier0anby", name: "Soldier 0 Anby", attr: "Electric", scores: [2, 3, 2, 2] },
];
const AXES = ["Fits her lanes", "Instant power", "Opens a new team", "Ready to field"];

function Meter({ n }: { n: number }) {
  return (
    <span className="meter" aria-label={`${n} of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <i key={i} className={i < n ? "on" : undefined} />
      ))}
    </span>
  );
}

export default function WifeSelector() {
  return (
    <div className="wrap">
      <TopNav base="/wife" active="pulls" />

      <div className="shead">
        <h2>Anniversary Selector</h2>
        <div className="eq">
          {[11, 16, 8, 14, 6, 12, 9, 15].map((h, i) => (
            <i key={i} style={{ height: h }} />
          ))}
        </div>
        <div className="ln" />
        <div className="cnt">1 Free S-Rank · Signature Included</div>
      </div>

      {/* ---- hero ---- */}
      <section className="sel-hero">
        <div className="sel-kicker">2nd Anniversary Gift · v3.1 &ldquo;The Long Goodbye&rdquo; · from Jul 29</div>
        <h3>
          Pick <em>one</em> agent — their signature W-engine comes with them.
        </h3>
        <div className="sel-sub">
          Scored for <b>your</b> account: complete premium lanes · cover endgame rooms · zero wasted dupes
        </div>
      </section>

      {/* ---- the verdict: pick + runner-up ---- */}
      <section className="sel-verdict">
        <article className="sv-card win" style={ec("Ether")}>
          <div className="sv-tag">▲ THE PICK</div>
          <div className="sv-art">
            <DeckImg src={tallPath("lucia")} alt="Lucia" className="sv-pic" />
          </div>
          <div className="sv-id">
            <h4>Lucia</h4>
            <div className="sv-meta">
              <DeckImg src={iconPath(elementIcon("Ether"))} alt="" className="ci-ico" />
              <span>Ether</span>
              <em>·</em>
              <DeckImg src={iconPath(typeIcon("Support"))} alt="" className="ci-ico" />
              <span>Support</span>
              <em>·</em>
              <span>already yours → becomes M1</span>
            </div>
          </div>
          <div className="sv-stats">
            <div className="svs">
              <b>18%</b>
              <small>enemy RES ignored, squad-wide (M1)</small>
            </div>
            <div className="svs">
              <b>2×</b>
              <small>Yixuan Ults in one stun window (M1 rotation)</small>
            </div>
            <div className="svs">
              <b>+25%</b>
              <small>team DMG from Dreamlit Hearth (her signature)</small>
            </div>
          </div>
          <div className="sv-why">
            Her M1 is rated <b>one of the strongest in the game</b> — and it lands on the support your{" "}
            <b>Yixuan</b> and <b>Yidhari</b> teams already run every rotation. No farming, no new
            playstyle: claim, equip, and your two best lanes hit harder <em>that same day</em>.
          </div>
          <div className="sv-teams">
            <span className="tk">Instantly upgrades</span>
            <span className="chip">Yixuan + Lucia + Dialyn</span>
            <span className="chip">Yidhari + Lucia + Ju Fufu</span>
          </div>
        </article>

        <article className="sv-card alt" style={ec("Physical")}>
          <div className="sv-tag">◇ THE GREEDY PICK</div>
          <div className="sv-art">
            <DeckImg src={tallPath("janedoe")} alt="Jane Doe" className="sv-pic" />
          </div>
          <div className="sv-id">
            <h4>Jane Doe</h4>
            <div className="sv-meta">
              <DeckImg src={iconPath(elementIcon("Physical"))} alt="" className="ci-ico" />
              <span>Physical</span>
              <em>·</em>
              <DeckImg src={iconPath(typeIcon("Anomaly"))} alt="" className="ci-ico" />
              <span>Anomaly</span>
              <em>·</em>
              <span>new — arrives at M0</span>
            </div>
          </div>
          <div className="sv-why">
            The only pick that <b>opens a brand-new team</b> from agents you already own — and she gets
            a free kit buff in 3.1. But she&rsquo;s a project: discs to farm, an execution-heavy
            playstyle to learn, and the showcase damage you&rsquo;ve seen isn&rsquo;t what M0 delivers.
          </div>
          <div className="sv-teams">
            <span className="tk">Would open</span>
            <span className="chip">Jane + Vivian + Yuzuha</span>
            <span className="chip">Jane + Alice + Yuzuha</span>
          </div>
          <div className="sv-discount">
            <span className="tk">The receipt discount — A.&rsquo;s Jane is M3, yours would be M0</span>
            <div className="svd-row">
              <span>Showcase Jane (M2+)</span>
              <i className="svd-bar">
                <b style={{ width: "100%" }} />
              </i>
            </div>
            <div className="svd-row">
              <span>Selector Jane (M0)</span>
              <i className="svd-bar">
                <b style={{ width: "55%" }} />
              </i>
            </div>
            <small>≈45% of her famous Assault damage lives in Mindscape 2 — a free copy doesn&rsquo;t include it.</small>
          </div>
        </article>
      </section>

      {/* ---- the rest of the pool ---- */}
      <section className="sel-rest">
        <article className="pool-card" style={ec("Electric")}>
          <DeckImg src={tallPath("trigger")} alt="Trigger" className="pool-pic" />
          <div className="pool-body">
            <h5>Trigger</h5>
            <div className="pool-note">Genuinely great stunner — but the seat&rsquo;s taken.</div>
            <div className="pool-fine">
              Dialyn is <b>guaranteed</b> Aug 19 (no-50/50), Ju Fufu holds today, and Norma may join. A
              third premium stunner covers nothing new.
            </div>
          </div>
        </article>
        <article className="pool-card" style={ec("Electric")}>
          <DeckImg src={tallPath("soldier0anby")} alt="Soldier 0 Anby" className="pool-pic" />
          <div className="pool-body">
            <h5>Soldier 0 Anby</h5>
            <div className="pool-note">Strong solo carry — wrong lane for this account.</div>
            <div className="pool-fine">
              The Electric plan is already <b>Cissia now, Seed later</b>. She&rsquo;d compete with her
              own teammates for the same rooms.
            </div>
          </div>
        </article>
        <article className="pool-card veto" style={ec("Ice")}>
          <div className="pool-veto-stamp">VETO</div>
          <div className="pool-body">
            <h5>Hugo</h5>
            <div className="pool-note">Personal veto. Respected. 💅</div>
            <div className="pool-fine">
              (For the record: fine carry, but he wants a double-stun shell — Lighter + Lycaon — that
              this roster isn&rsquo;t building. Nothing of value is lost.)
            </div>
          </div>
        </article>
      </section>

      {/* ---- doctrine scorecard ---- */}
      <section className="sel-matrix">
        <div className="sm-head">
          <span className="tk">The scorecard</span>
          <span className="sm-sub">scored on the account doctrine — not vacuum tiers</span>
        </div>
        <div className="sm-grid" role="table">
          <div className="sm-row sm-cols" role="row">
            <span />
            {AXES.map((a) => (
              <span key={a} className="sm-axis">
                {a}
              </span>
            ))}
          </div>
          {MATRIX.map((m) => (
            <div key={m.slug} className="sm-row" role="row" style={ec(m.attr)}>
              <span className="sm-name">
                <DeckImg src={iconPath(elementIcon(m.attr))} alt="" className="ci-ico" />
                {m.name}
              </span>
              {m.scores.map((s, i) => (
                <span key={i} className="sm-cell">
                  <Meter n={s} />
                </span>
              ))}
            </div>
          ))}
          <div className="sm-row veto" role="row">
            <span className="sm-name">Hugo</span>
            <span className="sm-cell sm-veto" style={{ gridColumn: "2 / -1" }}>
              — vetoed, no scores needed —
            </span>
          </div>
        </div>
      </section>

      <div className="hint">
        ▸ Chibi-verified 2026-07-20 · Game8, Icy-Veins, Mobalytics, Prydwen · pre-3.1 numbers — final kits may
        shift at launch
      </div>
    </div>
  );
}
