import { useMemo, useState } from 'react';
import { Btn, Controls, Slider, Stage, pathOf, rng, scale } from './_kit';

/**
 * Scaling limit of a simple random walk. Each path takes N independent ±1 steps; step n is plotted at
 * time t = n/N and height S_n / N^α. The SAME underlying ±1 increments are reused as N grows, so you
 * watch one family of walks refine rather than a new picture each time.
 *   α = 1/2 (Donsker's scaling): the picture is stable as N grows — the limit is Brownian motion,
 *            and the endpoint spread stays ≈ 1.
 *   α > 1/2: every path is squashed onto the axis (the limit is the constant 0).
 *   α < 1/2: paths blow off the chart (no limit).
 * The readout gives the sample standard deviation of the rescaled endpoint over 200 walks, next to the
 * CLT prediction N^(1/2−α).
 * props: { logN?: number (log2 of the number of steps, 3–12, default 6), alpha?: number (default 0.5),
 *          paths?: number (walks drawn, 1–6, default 5), seed?: number (default 11) }
 */
export default function MathRandomWalkScaling({ logN = 6, alpha = 0.5, paths = 5, seed = 11 }: {
  logN?: number; alpha?: number; paths?: number; seed?: number;
}) {
  const [k, setK] = useState(Math.max(3, Math.min(12, Math.round(logN))));
  const [a, setA] = useState(alpha);
  const [sd, setSd] = useState(seed);
  const N = 2 ** k;
  const shown = Math.max(1, Math.min(6, paths));

  const sim = useMemo(() => {
    const R = rng(sd * 2654435761);
    const MAX = 4096;
    const drawn: number[][] = [];
    const ends: number[] = [];
    for (let p = 0; p < 200; p++) {
      const keep = p < shown;
      let s = 0;
      const pts: number[] = keep ? [0] : [];
      for (let n = 0; n < Math.min(N, MAX); n++) {
        s += R.u() < 0.5 ? -1 : 1;
        if (keep) pts.push(s);
      }
      // walks longer than MAX steps reuse the same stream length; N is capped at 4096 by the slider
      if (keep) drawn.push(pts);
      ends.push(s);
    }
    return { drawn, ends };
  }, [k, sd, shown, N]);

  const scl = N ** a;
  const ends = sim.ends.map((v) => v / scl);
  const m = ends.reduce((x, y) => x + y, 0) / ends.length;
  const sdEnd = Math.sqrt(ends.reduce((x, y) => x + (y - m) ** 2, 0) / (ends.length - 1));
  const predicted = N ** (0.5 - a);

  const box: [number, number, number, number] = [26, 10, 310, 168];
  const yr: [number, number] = [-3, 3];
  const sx = scale([0, 1], [box[0], box[2]]);
  const sy = scale(yr, [box[3], box[1]]);
  const cl = (v: number) => Math.max(box[1] - 4, Math.min(box[3] + 4, sy(v)));
  const stride = Math.max(1, Math.ceil(N / 420));

  return (
    <div>
      <Stage w={320} h={200} label={`Random walk rescaled by N^${a} with N = ${N} steps`}>
        <rect x={box[0]} y={box[1]} width={box[2] - box[0]} height={box[3] - box[1]} fill="none" stroke="var(--grid)" />
        {[-2, -1, 1, 2].map((v) => (
          <line key={v} x1={box[0]} x2={box[2]} y1={sy(v)} y2={sy(v)} stroke="var(--grid)" strokeWidth={0.5} />
        ))}
        <line x1={box[0]} x2={box[2]} y1={sy(0)} y2={sy(0)} stroke="var(--fg)" strokeWidth={0.7} />
        {[-2, 0, 2].map((v) => (
          <text key={v} x={box[0] - 3} y={sy(v) + 3} fontSize="8" textAnchor="end" fill="var(--muted)">{v}</text>
        ))}
        {sim.drawn.map((pts, i) => {
          const d: [number, number][] = [];
          for (let n = 0; n < pts.length; n += stride) d.push([sx(n / (pts.length - 1)), cl(pts[n] / scl)]);
          d.push([sx(1), cl(pts[pts.length - 1] / scl)]);
          return <path key={i} d={pathOf(d)} stroke={`var(--c${(i % 6) + 1})`} strokeWidth={1} fill="none" opacity={0.85} />;
        })}
        <text x={box[0] + 4} y={box[1] + 10} fontSize="8.5" fill="var(--fg)">S⌊Nt⌋ / N^{a.toFixed(2)}</text>
        <text x={box[2] - 2} y={box[3] - 4} fontSize="8" textAnchor="end" fill="var(--muted)">t = 1</text>
        <text x={box[0]} y={184} fontSize="8.5" fill="var(--fg)">
          N = {N} steps · endpoint sd over 200 walks: {sdEnd < 1e4 ? sdEnd.toFixed(3) : sdEnd.toExponential(1)}
        </text>
        <text x={box[0]} y={195} fontSize="8.5" fill="var(--muted)">
          CLT prediction N^(1/2 − α) = {predicted < 1e4 ? predicted.toFixed(3) : predicted.toExponential(1)}
        </text>
      </Stage>
      <Controls>
        <Slider label="log₂N" min={3} max={12} step={1} value={k} onChange={setK} format={(v) => String(2 ** v)} />
        <Btn active={Math.abs(a - 0.25) < 1e-9} onClick={() => setA(0.25)}>α = ¼</Btn>
        <Btn active={Math.abs(a - 0.5) < 1e-9} onClick={() => setA(0.5)}>α = ½</Btn>
        <Btn active={Math.abs(a - 1) < 1e-9} onClick={() => setA(1)}>α = 1</Btn>
        <Btn onClick={() => setSd((v) => v + 1)}>New walks</Btn>
      </Controls>
    </div>
  );
}
