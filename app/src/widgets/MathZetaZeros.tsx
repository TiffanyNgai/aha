import { useMemo, useState } from 'react';
import { Axes, Btn, Controls, Slider, Stage, pathOf, scale } from './_kit';

/**
 * The Riemann zeta function along a vertical line Re(s) = σ.
 * Plots |ζ(σ + it)| against t. On the critical line σ = 1/2 the curve touches zero at the
 * "non-trivial zeros" (t ≈ 14.13, 21.02, 25.01, …); slide σ away from 1/2 and the dips lift off
 * the axis. The Riemann hypothesis says every non-trivial zero sits exactly at σ = 1/2 —
 * nobody has found one off the line, and nobody has proved there are none.
 * ζ is computed from the alternating (Dirichlet eta) series with repeated averaging,
 * accurate to about 1e-6 over the range shown.
 * props: { tMin?: number (default 0), tMax?: number (default 50), sigma?: number (default 0.5),
 *          lockSigma?: boolean (default false — hides the σ slider) }
 */

/** ζ(σ + it) via η(s)/(1 − 2^{1−s}), with the alternating series Euler-accelerated. */
function zeta(sigma: number, t: number): [number, number] {
  const M = 80, R = 30;
  let re = 0, im = 0;
  const pr: number[] = [], pi: number[] = [];
  for (let n = 1; n <= M; n++) {
    const ln = Math.log(n), mag = Math.pow(n, -sigma), sgn = n % 2 ? 1 : -1;
    re += sgn * mag * Math.cos(t * ln);
    im -= sgn * mag * Math.sin(t * ln);
    pr.push(re); pi.push(im);
  }
  let ar = pr.slice(-R - 1), ai = pi.slice(-R - 1);
  while (ar.length > 1) {
    const nr: number[] = [], ni: number[] = [];
    for (let i = 0; i + 1 < ar.length; i++) { nr.push((ar[i] + ar[i + 1]) / 2); ni.push((ai[i] + ai[i + 1]) / 2); }
    ar = nr; ai = ni;
  }
  const m = Math.pow(2, 1 - sigma), l2 = Math.log(2);
  const dr = 1 - m * Math.cos(t * l2), di = m * Math.sin(t * l2);
  const d2 = dr * dr + di * di || 1e-30;
  return [(ar[0] * dr + ai[0] * di) / d2, (ai[0] * dr - ar[0] * di) / d2];
}

const absZeta = (sigma: number, t: number) => Math.hypot(...zeta(sigma, t));

export default function MathZetaZeros({ tMin = 0, tMax = 50, sigma = 0.5, lockSigma = false }: {
  tMin?: number; tMax?: number; sigma?: number; lockSigma?: boolean;
}) {
  const [sig, setSig] = useState(sigma);
  const [showZeros, setShowZeros] = useState(true);

  const { pts, dips, yMax } = useMemo(() => {
    const N = 600;
    const vals: [number, number][] = [];
    for (let i = 0; i <= N; i++) {
      const t = tMin + ((tMax - tMin) * i) / N;
      vals.push([t, absZeta(sig, t)]);
    }
    // Local minima, refined by ternary search: these are the zeros when σ = 1/2.
    const found: [number, number][] = [];
    for (let i = 1; i < N; i++) {
      if (vals[i][1] < vals[i - 1][1] && vals[i][1] < vals[i + 1][1]) {
        let lo = vals[i - 1][0], hi = vals[i + 1][0];
        for (let k = 0; k < 40; k++) {
          const a = lo + (hi - lo) / 3, b = hi - (hi - lo) / 3;
          if (absZeta(sig, a) < absZeta(sig, b)) hi = b; else lo = a;
        }
        const t = (lo + hi) / 2;
        found.push([t, absZeta(sig, t)]);
      }
    }
    const top = Math.max(1, ...vals.map((v) => v[1]));
    return { pts: vals, dips: found, yMax: Math.ceil(top * 10) / 10 };
  }, [sig, tMin, tMax]);

  const box: [number, number, number, number] = [26, 16, 312, 150];
  const sx = scale([tMin, tMax], [box[0], box[2]]);
  const sy = scale([0, yMax], [box[3], box[1]]);
  const onLine = Math.abs(sig - 0.5) < 1e-9;
  const lowest = dips.length ? Math.min(...dips.map((d) => d[1])) : 0;

  return (
    <div>
      <Stage w={320} h={200} label="Magnitude of the Riemann zeta function along a vertical line">
        <Axes x={[tMin, tMax]} y={[0, yMax]} box={box} xLabel="t" yLabel="|ζ(σ + it)|" />
        <path d={pathOf(pts.map(([t, v]) => [sx(t), sy(v)]))} fill="none" stroke="var(--c2)" strokeWidth={1.3} />
        {showZeros && dips.filter((d) => d[1] < 0.35).map(([t, v], i) => (
          <g key={i}>
            <circle cx={sx(t)} cy={sy(v)} r={2.6} fill={v < 0.01 ? 'var(--c5)' : 'var(--c3)'} />
            {i < 4 && <text x={sx(t)} y={sy(v) + 14} fontSize="7.5" textAnchor="middle" style={{ fill: 'var(--muted)' }}>
              {t.toFixed(2)}
            </text>}
          </g>
        ))}
        <text x={26} y={168} fontSize="9" style={{ fill: 'var(--fg)' }}>
          σ = {sig.toFixed(2)}{onLine ? '  (the critical line)' : ''} — {dips.length} dip{dips.length === 1 ? '' : 's'} shown
        </text>
        <text x={26} y={182} fontSize="9" style={{ fill: lowest < 1e-5 ? 'var(--c5)' : 'var(--c3)' }}>
          {lowest < 1e-5
            ? 'smallest dip ≈ 0 — these are genuine zeros'
            : `smallest dip ≈ ${lowest.toFixed(3)} — the curve never reaches 0`}
        </text>
        <text x={26} y={195} fontSize="8" style={{ fill: 'var(--muted)' }}>
          RH: every non-trivial zero has σ = 1/2. Unproved as of 2026.
        </text>
      </Stage>
      <Controls>
        {!lockSigma && <Slider label="σ (real part)" value={sig} min={0.5} max={1} step={0.01} onChange={setSig} />}
        <Btn onClick={() => setShowZeros(!showZeros)} active={showZeros}>Mark dips</Btn>
        <Btn onClick={() => setSig(0.5)}>Back to σ = 1/2</Btn>
      </Controls>
    </div>
  );
}
