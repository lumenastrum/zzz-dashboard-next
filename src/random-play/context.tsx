"use client";
import { createContext, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { createAssets, type Assets } from "./assets";

const AssetsContext = createContext<Assets>(createAssets(""));

/** The desktop stage's design width (docs/02). Between FLOW_BELOW and this, the stage scales to fit. */
export const STAGE_W = 1440;
/** Below this container width the views reflow instead (mobile.css `@container rp (max-width: 1099px)`). */
export const FLOW_BELOW = 1100;

// Layout effect on the client (no flash of an unscaled stage), plain effect on the server (no SSR warning).
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export interface RandomPlayProviderProps {
  /** Where the host serves this repo's assets/ folder ("" in the playground). */
  assetBase?: string;
  /** Cache key appended to every asset URL (`?v=`); hosts pass their vendored sha / build id. */
  assetVersion?: string;
  accent?: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

/**
 * Root of every Random Play surface. Scopes the stylesheet (.rp-root), resolves asset URLs, and
 * hands texture URLs to CSS as custom properties so no stylesheet ever hard-codes an asset path.
 *
 * It also fits the fixed 1440px stage to narrower laptops: it measures its own width and publishes
 * `--rp-fit` (≤ 1), which the stage applies with `zoom`. CSS can't divide a length by a length in every
 * browser yet, hence the ResizeObserver. Below FLOW_BELOW the phone/tablet flow layout takes over and
 * ignores `--rp-fit`.
 */
export function RandomPlayProvider({ assetBase = "", assetVersion, accent, className, style, children }: RandomPlayProviderProps) {
  const assets = useMemo(() => createAssets(assetBase, assetVersion), [assetBase, assetVersion]);
  const root = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState(1);
  useIsoLayoutEffect(() => {
    const el = root.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const toFit = (w: number) => (w >= STAGE_W || w < FLOW_BELOW ? 1 : Math.floor((w / STAGE_W) * 10000) / 10000);
    // Scrollbar feedback: scaling can shorten the page enough to drop the vertical scrollbar, which widens
    // the root, which scales the stage back up, which brings the scrollbar back… An A→B→A flip between two
    // close widths is that loop: settle on the SMALLER width (its stage fits in both scrollbar states)
    // until a genuinely new width arrives.
    let prev = -1, prev2 = -1, pinned: [number, number] | null = null;
    const measure = (w: number) => {
      w = Math.round(w);
      if (pinned && (w === pinned[0] || w === pinned[1])) { setFit(toFit(pinned[0])); return; }
      pinned = null;
      if (w === prev2 && w !== prev && Math.abs(w - prev) <= 24) pinned = [Math.min(w, prev), Math.max(w, prev)];
      prev2 = prev; prev = w;
      setFit(toFit(pinned ? pinned[0] : w));
    };
    measure(el.clientWidth);
    const ro = new ResizeObserver(([e]) => measure(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const vars = {
    "--rp-tex-hatch": `url(${assets.ui("texture-hatch")})`,
    "--rp-tex-paper": `url(${assets.ui("texture-paper")})`,
    "--rp-fit": fit,
    ...(accent ? { "--rp-accent": accent } : {}),
    ...style,
  } as CSSProperties;
  return (
    <AssetsContext.Provider value={assets}>
      <div ref={root} className={`rp-root${className ? ` ${className}` : ""}`} style={vars}>{children}</div>
    </AssetsContext.Provider>
  );
}

export const useAssets = () => useContext(AssetsContext);
