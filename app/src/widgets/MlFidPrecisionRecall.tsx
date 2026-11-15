import { useMemo, useState } from 'react';
import { Btn, Controls, Slider, Stage, rng, scale } from './_kit';

/**
 * Why one number cannot describe sample quality. Grey = a "real" set of 180 points drawn from three
 * Gaussian modes; coloured = 180 "generated" points you corrupt with three knobs:
 *   modes   how many of the three modes the generator covers (mode collapse / mode dropping)
 *   spread  the generator's standard deviation as a multiple of the real one (blurry = too wide)
 *   shift   a constant offset added to every generated point (a systematic bias)
 * Three metrics are recomputed live, all on the raw 2-D coordinates (a real FID uses 2048-d Inception
 * features — the arithmetic is identical, the features are not):
 *   FID  = |μr − μg|² + Tr(Σr + Σg − 2(ΣrΣg)^{1/2}), the Fréchet distance between the fitted Gaussians.
 *          For 2×2 matrices Tr(M^{1/2}) = √(Tr M + 2√(det M)), so this is exact, not estimated.
 *   precision = fraction of generated points lying inside the real manifold, and
 *   recall    = fraction of real points inside the generated manifold, where "manifold" is the union of
 *          balls of radius the k-th nearest-neighbour distance (Kynkäänniemi et al. 2019, k = 3).
 * Dropping modes collapses recall while precision stays high; widening the spread leaves recall high and
 * lowers precision — and FID can be smaller for the too-wide model than for the mode-collapsed one.
 * That dissociation is the point of the widget.
 * props: { modes?: 1|2|3 (default 3), spread?: number (0.4–2.5, default 1), shift?: number (0–1.5, default 0),
 *          n?: number (default 180), seed?: number (default 6) }
 */
const CENTRES: [number, number][] = [[-1.3, -0.9], [1.4, 1.0], [1.0, -1.3]];
const SIG = 0.42;

function fit(p: [number, number][]) {
  const n = p.length;
  const mx = p.reduce((s, q) => s + q[0], 0) / n, my = p.reduce((s, q) => s + q[1], 0) / n;
  let a = 0, b = 0, c = 0;
  for (const [x, y] of p) { a += (x - mx) ** 2; b += (x - mx) * (y - my); c += (y - my) ** 2; }
  return { mx, my, a: a / n, b: b / n, c: c / n };
}

/** k-th nearest-neighbour radius of every point of `set` within `set`. */
function knnRadii(set: [number, number][], k: number) {
  return set.map(([x, y]) => {
    const d = set.map(([u, v]) => Math.hypot(x - u, y - v)).sort((p, q) => p - q);
    return d[Math.min(k, d.length - 1)];
  });
}
const covered = (q: [number, number], set: [number, number][], rad: number[]) =>
  set.some(([u, v], i) => Math.hypot(q[0] - u, q[1] - v) <= rad[i]);

export default function MlFidPrecisionRecall({ modes: m0 = 3, spread: s0 = 1, shift: h0 = 0, n = 180, seed = 6 }: {
  modes?: 1 | 2 | 3; spread?: number; shift?: number; n?: number; seed?: number;
}) {
  const [modes, setModes] = useState<1 | 2 | 3>(m0);
  const [spread, setSpread] = useState(s0);
  const [shift, setShift] = useState(h0);
  const R = 3; const box: [number, number, number, number] = [10, 6, 206, 196];
  const sx = scale([-R, R], [box[0], box[2]]); const sy = scale([-R, R], [box[3], box[1]]);

  const real = useMemo(() => {
    const r = rng(seed);
    return Array.from({ length: n }, (_, i): [number, number] => {
      const c = CENTRES[i % 3];
      return [c[0] + SIG * r.normal(), c[1] + SIG * r.normal()];
    });
  }, [n, seed]);

  const gen = useMemo(() => {
    const r = rng(seed + 100);
    return Array.from({ length: n }, (_, i): [number, number] => {
      const c = CENTRES[i % modes];
      return [c[0] + shift + SIG * spread * r.normal(), c[1] + shift + SIG * spread * r.normal()];
    });
  }, [n, seed, modes, spread, shift]);

  const { fid, prec, rec } = useMemo(() => {
    const A = fit(real), B = fit(gen);
    const dm = (A.mx - B.mx) ** 2 + (A.my - B.my) ** 2;
    // M = Σr Σg (2×2); Tr(M^{1/2}) = sqrt(Tr M + 2 sqrt(det M)) for PSD 2×2.
    const trM = A.a * B.a + A.b * B.b + (A.b * B.b + A.c * B.c);
    const detM = (A.a * A.c - A.b * A.b) * (B.a * B.c - B.b * B.b);
    const trSqrt = Math.sqrt(Math.max(0, trM + 2 * Math.sqrt(Math.max(0, detM))));
    const fid = dm + A.a + A.c + B.a + B.c - 2 * trSqrt;
    const rr = knnRadii(real, 3), rg = knnRadii(gen, 3);
    const prec = gen.filter((q) => covered(q, real, rr)).length / gen.length;
    const rec = real.filter((q) => covered(q, gen, rg)).length / real.length;
    return { fid: Math.max(0, fid), prec, rec };
  }, [real, gen]);

  const bar = (v: number, y: number, c: string) => (
    <g>
      <rect x={228} y={y} width={80} height={7} rx={3} fill="var(--grid)" />
      <rect x={228} y={y} width={80 * Math.min(1, v)} height={7} rx={3} fill={c} />
    </g>
  );

  return (
    <div>
      <Stage label="FID, precision and recall on a toy two-dimensional example">
        <rect x={box[0]} y={box[1]} width={box[2] - box[0]} height={box[3] - box[1]} fill="none" stroke="var(--grid)" />
        {real.map(([x, y], i) => <circle key={'r' + i} cx={sx(x)} cy={sy(y)} r={1.5} fill="var(--muted)" opacity={0.55} />)}
        {gen.map(([x, y], i) => <circle key={'g' + i} cx={sx(x)} cy={sy(y)} r={1.5} fill="var(--c4)" opacity={0.75} />)}
        <g fontSize="8.5">
          <text x={14} y={16} fill="var(--muted)">grey: real</text>
          <text x={14} y={27} fill="var(--c4)">purple: generated</text>
        </g>
        <g fontSize="9" fill="var(--fg)">
          <text x={228} y={24}>FID = {fid.toFixed(2)}</text>
          <text x={228} y={40} fill="var(--muted)" fontSize="7.5">(2-D coords, not</text>
          <text x={228} y={49} fill="var(--muted)" fontSize="7.5">Inception features)</text>
          <text x={228} y={72}>precision {prec.toFixed(2)}</text>
          <text x={228} y={104}>recall {rec.toFixed(2)}</text>
        </g>
        {bar(prec, 78, 'var(--c2)')}
        {bar(rec, 110, 'var(--c3)')}
        <g fontSize="7.5" fill="var(--muted)">
          <text x={228} y={138}>precision ↓ =</text>
          <text x={228} y={148}>off-manifold</text>
          <text x={228} y={166}>recall ↓ =</text>
          <text x={228} y={176}>modes missing</text>
        </g>
      </Stage>
      <Controls>
        <Btn active={modes === 1} onClick={() => setModes(1)}>1 mode</Btn>
        <Btn active={modes === 2} onClick={() => setModes(2)}>2 modes</Btn>
        <Btn active={modes === 3} onClick={() => setModes(3)}>3 modes</Btn>
        <Slider label="spread" min={0.4} max={2.5} step={0.05} value={spread} onChange={setSpread} />
        <Slider label="shift" min={0} max={1.5} step={0.05} value={shift} onChange={setShift} />
      </Controls>
    </div>
  );
}
