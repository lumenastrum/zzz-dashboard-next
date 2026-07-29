"use client";

import { useMemo, useState } from "react";
import { withBase } from "@/lib/base-path";
import { wengineIcon } from "@/lib/deck-config";
import { ROSTER } from "@/lib/roster";
import { useSignal } from "@/lib/use-signal";
import {
  summarizeChannel,
  type ChannelSummary,
  type SRankPull,
  type SignalOutcome,
} from "@/lib/signal-analytics";

// The Signal Archive — A.'s full gacha pull history as a Soundsystem surface.
// Channel cards are broadcast "stations" (click to tune), S-ranks render as a
// face timeline with outcome-colored rings, and the pity spread is a VU
// histogram. Data is CLI-written (npm run signal); this surface is read-only.

const OUTCOME_COLOR: Record<SignalOutcome, string> = {
  won: "var(--green)",
  lost: "var(--red)",
  guaranteed: "var(--amber)",
  plain: "var(--chrome)",
};
const OUTCOME_TAG: Record<SignalOutcome, string> = {
  won: "WON FLIP",
  lost: "LOST FLIP",
  guaranteed: "GUARANTEED",
  plain: "S-RANK",
};

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
const SLUG_BY_NAME = new Map(ROSTER.map((r) => [norm(r.name), r.slug]));
// Gacha-API short names → roster slugs. The pull ledger says "Remielle" but the
// roster (and her staged face) say "Remielle Dan" — norm() can't bridge a missing
// surname, so alias it (same pattern as BOO_ART below).
SLUG_BY_NAME.set("remielle", "remielledan");

// Gacha bangboo name → staged art under /assets/bangboo/. The boo's real name
// is "Ultra Jake" (API + in-game, A.-verified 2026-07-27); the asset was
// staged as ultrajet.webp during the DA session under a misremembered name —
// the slug stays, the alias bridges it.
const BOO_ART: Record<string, string> = {
  "Biggest Fan": "biggestfan",
  "Ultra Jake": "ultrajet",
};

const pityColor = (pity: number, cap: number): string => {
  const f = pity / cap;
  return f <= 0.55 ? "var(--green)" : f <= 0.82 ? "var(--amber)" : "var(--red)";
};

/** Circular face for an S-rank — art per item type, letter tile as the floor. */
function SigFace({ s }: { s: SRankPull }) {
  const [failed, setFailed] = useState(false);
  const { name, item_type } = s.record;

  // Agents: roster endgame art; off-roster agents (standard-pool 50/50
  // losses…) ship faces under their normalized name (koleda.webp etc., ripped
  // in-game circle icons). Engines reuse the deck's staged wengine icons;
  // named bangboos use the DA/Shiyu boo art. Anything unresolved → tile.
  let src: string | undefined;
  let fit: "cover" | "contain" = "cover";
  if (item_type === "Agents" && name) {
    const slug = SLUG_BY_NAME.get(norm(name)) ?? norm(name);
    src = `/assets/endgame/${slug}.webp`;
  } else if (item_type === "W-Engines" && name) {
    src = `/assets/icons/${wengineIcon(name)}.webp`;
    fit = "contain";
  } else if (item_type === "Bangboo" && BOO_ART[name]) {
    src = `/assets/bangboo/${BOO_ART[name]}.webp`;
    fit = "contain";
  }

  const ring = `2px solid ${OUTCOME_COLOR[s.outcome]}`;
  const label = name || `#${s.record.item_id}`;
  const title = `${label} · ${OUTCOME_TAG[s.outcome]} · pity ${s.pity} · ${s.record.time.slice(0, 10)}`;

  if (!src || failed) {
    return (
      <div className="sig-face sig-face-tile" title={title} style={{ border: ring }}>
        {label.replace(/^\[.*?\]\s*/, "").charAt(0) || "?"}
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className="sig-face"
      src={withBase(src)}
      alt={label}
      title={title}
      onError={() => setFailed(true)}
      style={{ border: ring, objectFit: fit, padding: fit === "contain" ? 4 : 0 }}
    />
  );
}

function StationCard({
  c,
  on,
  onTune,
}: {
  c: ChannelSummary;
  on: boolean;
  onTune: () => void;
}) {
  const meter = Math.min(1, c.currentPity / c.hardPity);
  return (
    <button className={`sig-card${on ? " on" : ""}`} onClick={onTune}>
      <div className="sig-card-head">
        <span className="sig-ch">CH·{c.channel.padStart(2, "0")}</span>
        <span className="sig-name">{c.name}</span>
      </div>
      <div className="sig-big">
        {c.total.toLocaleString()}
        <i>pulls</i>
      </div>
      <div className="sig-row">
        <span>
          <b style={{ color: "var(--yellow)" }}>{c.sCount}</b> S-rank
        </span>
        <span>
          avg pity <b>{c.avgPityS != null ? c.avgPityS.toFixed(1) : "—"}</b>
        </span>
      </div>
      {c.flipChallenges != null && c.flipChallenges > 0 && (
        <div className="sig-row">
          <span>
            {c.flipLabel}{" "}
            <b style={{ color: "var(--green)" }}>
              {c.flipWins}W/{c.flipChallenges}
            </b>{" "}
            ({Math.round(((c.flipWins ?? 0) / c.flipChallenges) * 100)}%)
          </span>
          {c.onGuarantee && <span className="sig-guar">GUARANTEE UP</span>}
        </div>
      )}
      <div className="sig-meter" title={`current pity ${c.currentPity} of ${c.hardPity}`}>
        <i
          style={{
            width: `${Math.max(2, meter * 100)}%`,
            background: pityColor(c.currentPity, c.hardPity),
          }}
        />
        <span>
          {c.currentPity}/{c.hardPity}
        </span>
      </div>
    </button>
  );
}

function PityHistogram({ c }: { c: ChannelSummary }) {
  const buckets = useMemo(() => {
    const n = Math.ceil(c.hardPity / 10);
    const out = Array.from({ length: n }, () => 0);
    for (const s of c.sRanks) {
      out[Math.min(n - 1, Math.floor((s.pity - 1) / 10))]++;
    }
    return out;
  }, [c]);
  const max = Math.max(1, ...buckets);

  return (
    <div className="sig-histo">
      {buckets.map((v, i) => (
        <div key={i} className="sig-bin" title={`pity ${i * 10 + 1}–${(i + 1) * 10}: ${v}`}>
          <div className="sig-bar">
            <i
              style={{
                height: `${(v / max) * 100}%`,
                background: pityColor((i + 0.5) * 10, c.hardPity),
                opacity: v === 0 ? 0.18 : 1,
              }}
            />
          </div>
          <span>{v > 0 ? v : ""}</span>
          <b>{i * 10 + 1}–{(i + 1) * 10}</b>
        </div>
      ))}
    </div>
  );
}

export function SignalDeck() {
  const { store, summary, status } = useSignal();
  const [tuned, setTuned] = useState("2");

  const channel = useMemo(() => {
    if (!store || !summary) return null;
    const hit = summary.channels.find((c) => c.channel === tuned);
    if (hit) return hit;
    return summary.channels[0] ?? summarizeChannel(tuned, []);
  }, [store, summary, tuned]);

  if (status === "loading") {
    return <div className="sig-status">TUNING…</div>;
  }
  if (status === "error") {
    return <div className="sig-status">SIGNAL LOST — archive fetch failed, refresh to retry</div>;
  }
  if (status === "empty" || !summary || !channel) {
    return <div className="sig-status">NO CARRIER — run `npm run signal` to bank the archive</div>;
  }

  const ledger = [...channel.sRanks].reverse(); // newest first
  const span =
    summary.firstTime && summary.lastTime
      ? `${summary.firstTime.slice(0, 10)} → ${summary.lastTime.slice(0, 10)}`
      : "—";

  return (
    <>
      <div className="shead">
        <h2>Signal Archive</h2>
        <div className="eq">
          {[11, 16, 7, 13, 9, 15, 6, 12].map((h, i) => (
            <i key={i} style={{ height: h }} />
          ))}
        </div>
        <div className="ln" />
        <div className="cnt">{summary.totalPulls.toLocaleString()} Signals Banked</div>
      </div>

      <div className="sig-cards">
        {summary.channels.map((c) => (
          <StationCard
            key={c.channel}
            c={c}
            on={c.channel === channel.channel}
            onTune={() => setTuned(c.channel)}
          />
        ))}
      </div>

      <div className="sig-section">
        <h3>
          S-Rank Ledger <span className="sig-sub">· {channel.name}</span>
        </h3>
        {ledger.length === 0 ? (
          <div className="sig-none">No S-ranks on this channel yet.</div>
        ) : (
          <>
            <div className="sig-faces">
              {ledger.map((s) => (
                <SigFace key={s.record.id} s={s} />
              ))}
            </div>
            <div className="sig-legend">
              <span style={{ color: "var(--green)" }}>● won flip</span>
              <span style={{ color: "var(--red)" }}>● lost flip</span>
              <span style={{ color: "var(--amber)" }}>● guaranteed</span>
              <span style={{ color: "var(--chrome)" }}>● no flip</span>
              <span className="sig-hint">hover a face for the receipt</span>
            </div>
          </>
        )}
      </div>

      <div className="sig-section">
        <h3>
          Pity Spread <span className="sig-sub">· {channel.name} · longest dry {channel.longestDry}</span>
        </h3>
        <PityHistogram c={channel} />
      </div>

      <div className="sig-foot">
        <span>
          <b>{summary.totalPolychrome.toLocaleString()}</b> Polychrome burned
        </span>
        <span>
          span <b>{span}</b>
        </span>
        <span>
          uid <b>{store?.uid || "—"}</b>
        </span>
        <span className="sig-prov">
          API window ∪ rng.moe graft — the archive outlives Hoyo&apos;s 6-month memory
        </span>
      </div>
    </>
  );
}
