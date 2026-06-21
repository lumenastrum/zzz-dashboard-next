// VU segment bar (the prototype's segBar): N cells, the first `pct%` lit, with the
// top fifth going amber→red. Used by the disc-score bar; the Levels panel rolls its
// own variant because it overlays "ghost" effective-only segments.
export function Segs({ pct, n = 20 }: { pct: number; n?: number }) {
  const on = Math.round((n * pct) / 100);
  return (
    <>
      {Array.from({ length: n }).map((_, i) => {
        let cls = "";
        if (i < on) {
          cls = "on";
          const z = i / n;
          if (z > 0.8) cls += " red";
          else if (z > 0.6) cls += " amber";
        }
        return <i key={i} className={cls} />;
      })}
    </>
  );
}
