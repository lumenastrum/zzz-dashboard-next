/* eslint-disable @next/next/no-img-element */
"use client";

// Plain <img> with base-path prefixing + graceful self-hide on load error.
// Static export means no next/image optimization (images:{unoptimized}), and the
// deck pulls a mix of staged/unstaged art — a missing icon should vanish, not 404-box.
// `failed` is tracked per-src so a prop change (e.g. a disc set swap) re-attempts.
import { useState, type CSSProperties } from "react";
import { withBase } from "@/lib/base-path";

export function DeckImg({
  src,
  className,
  alt = "",
  style,
}: {
  src: string;
  className?: string;
  alt?: string;
  style?: CSSProperties;
}) {
  const [failed, setFailed] = useState<string | null>(null);
  if (failed === src) return null;
  return (
    <img
      src={withBase(src)}
      className={className}
      alt={alt}
      style={style}
      onError={() => setFailed(src)}
    />
  );
}
