/**
 * One spectral convolution layer of a Fourier Neural Operator, on a 2π-periodic input function.
 * The input a(x) is sampled at N grid points (dots). The layer takes a discrete Fourier transform of
 * those samples, throws away every mode above k_max, multiplies each surviving coefficient by a learned
 * complex weight R_k, and transforms back — so the output is a continuous function, plotted as a curve.
 * Two things are worth watching: the number of learned weights is 2(k_max+1) real numbers, set by k_max
 * and NOT by N; and once N is large enough to resolve the kept modes, changing N leaves the output curve
 * unchanged (discretisation invariance). Drop N too low and aliasing corrupts the coefficients, which the
 * error readout against a dense N = 256 reference reports.
 * props: {
 *   n?: number        grid points N, 6–64 (default 24)
 *   kmax?: number     highest kept mode k_max, 0–8 (default 4)
 *   input?: 'smooth' | 'rough'   band-limited test function, or one with high-frequency content (default 'smooth')
 * }
 */
import { useState } from 'react';
import { Axes, Btn, Controls, Slider, Stage, pathOf } from './_kit';

const TAU = Math.PI * 2;
const FNS: Record<string, (x: number) => number> = {
  smooth: (x) => Math.sin(x) + 0.5 * Math.sin(3 * x) + 0.4 * Math.cos(5 * x),
  rough: (x) => Math.sin(x) + 0.5 * Math.sin(3 * x) + 0.4 * Math.cos(5 * x) + 0.45 * Math.sin(11 * x),
};
/** Learned-weight stand-in: a fixed complex gain per mode. */
const R = (k: number): [number, number] => {
  const r = 1 / (1 + 0.3 * k), p = 0.7 * k;
  return [r * Math.cos(p), r * Math.sin(p)];
};

/** Fourier coefficients c_k = (1/N) Σ_n a_n e^{-i k x_n}, k = 0…kmax, from N uniform samples. */
function coeffs(f: (x: number) => number, N: number, kmax: number): [number, number][] {
  const out: [number, number][] = [];
  for (let k = 0; k <= kmax; k++) {
    let re = 0, im = 0;
    for (let n = 0; n < N; n++) {
      const x = (TAU * n) / N, v = f(x);
      re += v * Math.cos(k * x); im -= v * Math.sin(k * x);
    }
    out.push([re / N, im / N]);
  }
  return out;
}
/** Re Σ_k (2 − [k=0]) R_k c_k e^{i k x}: the filtered signal, as a continuous function of x. */
const synth = (c: [number, number][]) => (x: number) =>
  c.reduce((s, [cr, ci], k) => {
    const [rr, ri] = R(k);
    const pr = cr * rr - ci * ri, pi = cr * ri + ci * rr;
    return s + (k === 0 ? 1 : 2) * (pr * Math.cos(k * x) - pi * Math.sin(k * x));
  }, 0);

export default function MlFourierLayer({ n = 24, kmax = 4, input = 'smooth' }: { n?: number; kmax?: number; input?: string }) {
  const [N, setN] = useState(Math.max(6, Math.min(64, Math.round(n))));
  const [K, setK] = useState(Math.max(0, Math.min(8, Math.round(kmax))));
  const [fn, setFn] = useState(FNS[input] ? input : 'smooth');
  const f = FNS[fn];

  const c = coeffs(f, N, K);
  const cRef = coeffs(f, 256, K);
  const g = synth(c), gRef = synth(cRef);
  const err = Array.from({ length: 200 }, (_, i) => Math.abs(g((TAU * i) / 200) - gRef((TAU * i) / 200))).reduce((a, b) => Math.max(a, b), 0);

  const box: [number, number, number, number] = [30, 12, 312, 108];
  const sx = (x: number) => box[0] + (x / TAU) * (box[2] - box[0]);
  const sy = (y: number) => box[3] - ((y + 2.2) / 4.4) * (box[3] - box[1]);
  const curve = (h: (x: number) => number) => pathOf(Array.from({ length: 161 }, (_, i) => [sx((TAU * i) / 160), sy(h((TAU * i) / 160))]));

  const bx0 = 34, bw = Math.min(26, 258 / (K + 1)), by = 182;
  return (
    <div>
      <Stage h={212} label="a Fourier-neural-operator spectral layer">
        <Axes x={[0, TAU]} y={[-2.2, 2.2]} box={box} xLabel="x" grid={false} />
        <path d={curve(f)} fill="none" stroke="var(--muted)" strokeWidth={1} strokeDasharray="3 2" />
        <path d={curve(g)} fill="none" stroke="var(--c2)" strokeWidth={1.8} />
        {Array.from({ length: N }, (_, i) => (TAU * i) / N).map((x, i) => (
          <circle key={i} cx={sx(x)} cy={sy(f(x))} r={2} fill="var(--c3)" />
        ))}
        <text x={34} y={22} fontSize="8" fill="var(--muted)">grey dashed: input a(x)</text>
        <text x={34} y={32} fontSize="8" fill="var(--c2)">blue: layer output</text>
        <text x={312} y={22} fontSize="8" textAnchor="end" fill="var(--c3)">N = {N} samples</text>
        <text x={34} y={128} fontSize="9" fill="var(--fg)">|c_k| kept (orange) → |R_k c_k| (blue)</text>
        <line x1={30} y1={by} x2={312} y2={by} stroke="var(--fg)" strokeWidth={0.7} />
        {c.map(([cr, ci], k) => {
          const mag = Math.hypot(cr, ci), [rr, ri] = R(k);
          const out = mag * Math.hypot(rr, ri), H = 44;
          return (
            <g key={k}>
              <rect x={bx0 + k * (bw + 4)} y={by - mag * H} width={bw / 2 - 1} height={Math.max(0.5, mag * H)} fill="var(--c3)" opacity={0.8} />
              <rect x={bx0 + k * (bw + 4) + bw / 2} y={by - out * H} width={bw / 2 - 1} height={Math.max(0.5, out * H)} fill="var(--c2)" opacity={0.8} />
              <text x={bx0 + k * (bw + 4) + bw / 2 - 1} y={by + 9} fontSize="8" textAnchor="middle" fill="var(--muted)">{k}</text>
            </g>
          );
        })}
        <text x={312} y={198} fontSize="8" textAnchor="end" fill="var(--fg)">{2 * (K + 1)} learned numbers (independent of N)</text>
        <text x={312} y={208} fontSize="8" textAnchor="end" fill={err < 1e-6 ? 'var(--c1)' : 'var(--c5)'}>
          error vs N = 256: {err < 1e-6 ? '≈ 0 — discretisation-invariant' : err.toFixed(3) + ' — aliased'}
        </text>
      </Stage>
      <Controls>
        <Slider label="grid points N" min={6} max={64} step={1} value={N} onChange={(v) => setN(Math.round(v))} format={(v) => v.toFixed(0)} />
        <Slider label="modes kept k_max" min={0} max={8} step={1} value={K} onChange={(v) => setK(Math.round(v))} format={(v) => v.toFixed(0)} />
        <Btn active={fn === 'smooth'} onClick={() => setFn('smooth')}>band-limited (k ≤ 5)</Btn>
        <Btn active={fn === 'rough'} onClick={() => setFn('rough')}>extra mode at k = 11</Btn>
      </Controls>
    </div>
  );
}
