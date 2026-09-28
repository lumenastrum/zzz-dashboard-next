import type { ReactNode } from "react";
import type { Grade } from "../tokens";

/** Round build-grade sticker. `grade` undefined = identity-only agent ("–"). */
export function GradeSticker({ grade, small, className }: { grade?: Grade; small?: boolean; className?: string }) {
  const cls = `rp-grade rp-grade--${grade ?? "none"}${small ? " is-sm" : ""}${className ? ` ${className}` : ""}`;
  return <span className={cls} aria-label={grade ? `Build grade ${grade}` : "No build"}>{grade ?? "–"}</span>;
}

export function Chip({ icon, children, plain }: { icon?: string; children: ReactNode; plain?: boolean }) {
  return <span className={`rp-chip${plain ? " is-plain" : ""}`}>{icon && <img src={icon} alt="" />}{children}</span>;
}

/** Mono section label with an optional right-aligned source line ("IN-GAME · 09/27"). */
export function Eyebrow({ children, source, className }: { children: ReactNode; source?: ReactNode; className?: string }) {
  return <div className={`rp-eyebrow${className ? ` ${className}` : ""}`}><span>{children}</span>{source && <span className="rp-eyebrow__src">{source}</span>}</div>;
}

/** Halftone overlay — risograph dots on any coloured panel. Parent must be positioned. */
export const Halftone = () => <div className="rp-dots" aria-hidden="true" />;

export const PlayGlyph = ({ size = 16, color = "#17130F" }: { size?: number; color?: string }) => (
  <svg width={size * 0.8} height={size} viewBox="0 0 16 18" aria-hidden="true"><path d="M2 1.5 L14.5 9 L2 16.5 Z" fill={color} /></svg>
);
export const RewindGlyph = () => (
  <svg width="18" height="14" viewBox="0 0 18 14" aria-hidden="true"><path d="M8 1 L1 7 L8 13 Z M17 1 L10 7 L17 13 Z" fill="currentColor" /></svg>
);
export const Chevron = ({ dir }: { dir: "left" | "right" }) => (
  <svg width="10" height="16" viewBox="0 0 10 16" aria-hidden="true">
    <path d={dir === "left" ? "M8.5 1.5 L2.5 8 L8.5 14.5" : "M1.5 1.5 L7.5 8 L1.5 14.5"} stroke="currentColor" strokeWidth="2.5" fill="none" />
  </svg>
);
