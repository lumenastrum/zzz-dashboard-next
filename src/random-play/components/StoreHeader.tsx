"use client";
import { useEffect, useRef, type CSSProperties } from "react";
import { PlayGlyph } from "./primitives";

export type SectionId = "wall" | "features" | "register" | "showing" | "channel" | "picks";
const ALL_SECTIONS: { id: SectionId; label: string; hint: string }[] = [
  { id: "wall", label: "RENTAL WALL", hint: "Agent roster" },
  { id: "features", label: "TRIPLE FEATURES", hint: "Teams" },
  { id: "register", label: "THE REGISTER", hint: "Shiyu Defense" },
  { id: "showing", label: "NOW SHOWING", hint: "Deadly Assault" },
  { id: "channel", label: "CHANNEL SEARCH", hint: "Signal Search archive" },
  { id: "picks", label: "STAFF PICKS", hint: "Who to pull next" },
];

export interface StoreHeaderProps {
  /** Which sections this profile has (in store order); defaults to all. */
  sections?: SectionId[];
  section: SectionId;
  onSection: (s: SectionId) => void;
  /** Right-hand status line ("PLAY · REMIELLE DAN"). */
  status: string;
  /** Lamp blinks while a tape or feature is "playing". */
  live: boolean;
  uid?: string;
}

export function StoreHeader({ sections, section, onSection, status, live, uid }: StoreHeaderProps) {
  const SECTIONS = sections ? ALL_SECTIONS.filter((s) => sections.includes(s.id)) : ALL_SECTIONS;
  const idx = SECTIONS.findIndex((s) => s.id === section);
  // Narrow layouts scroll the section row sideways: keep the active one in view. Scrolls ONLY the row
  // (never the page); a no-op on the desktop stage, where the row doesn't overflow.
  const nav = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = nav.current, btn = el?.children[idx + 1] as HTMLElement | undefined; // [0] is the pill
    if (el && btn && el.scrollWidth > el.clientWidth) el.scrollTo({ left: btn.offsetLeft - (el.clientWidth - btn.offsetWidth) / 2, behavior: "smooth" });
  }, [idx]);
  return (
    <header className="rp-header">
      <div className="rp-header__brand">
        <span className="rp-header__logo"><PlayGlyph /></span>
        <span className="rp-disp rp-header__wordmark">Random Play</span>
      </div>
      <nav ref={nav} className="rp-sections" aria-label="Sections">
        <span className="rp-sections__pill" style={{ "--rp-idx": idx } as CSSProperties} />
        {SECTIONS.map((s) => (
          <button key={s.id} className={`rp-sections__btn${s.id === section ? " is-on" : ""}`} aria-current={s.id === section} title={s.hint} onClick={() => onSection(s.id)}>
            {s.label}
          </button>
        ))}
      </nav>
      <div className="rp-header__right rp-mono">
        <span className="rp-status"><i className={`rp-status__lamp${live ? " is-on" : ""}`} />{status}</span>
        {uid && <span>PROXY UID {uid}</span>}
      </div>
    </header>
  );
}

/** VHS tracking band. Give it a new `key` on every view change and it sweeps once. */
export const TrackingBand = () => <div className="rp-tracking" aria-hidden="true" />;
