/**
 * Discretisation invariance, side by side with a fixed-grid surrogate.
 *
 * The target is the solution operator of the periodic Poisson problem −u'' = f on [0, 2π] (mean-zero
 * data), which in Fourier space is exactly û_k = f̂_k / k². Two surrogates try to imitate it:
 *   • "neural operator" — reads the N samples of f, takes a discrete Fourier transform, keeps modes
 *     |k| ≤ k_max, multiplies each by a weight (here the ideal 1/k², the thing training would learn) and
 *     transforms back. Its output is a *function*, so it can be evaluated anywhere, and once N passes the
 *     alias-free limit N > k_max + 7 (the forcing has content up to k = 7; 2·k_max + 1 only suffices for input band-limited to k_max) the curve stops changing: the same weights work on every finer grid.
 *   • "fixed-grid surrogate" — a stand-in for a CNN trained on a grid of nTrain points. It is exact at
 *     its own nodes and piecewise linear in between, and refining N does nothing for it: its error is
 *     stuck at the interpolation error of the grid it was trained on.
 * Readouts give the max error of each against the exact solution, and the parameter counts.
 *
 * props: {
 *   n?: number        evaluation grid points N, 5–80 (default 9)
 *   kmax?: number     modes kept by the neural operator, 1–10 (default 5)
 *   nTrain?: number   training-grid size of the fixed-grid surrogate, 5–24 (default 9)
 *   showGrid?: boolean  draw the fixed-grid surrogate too (default true)
 * }
 */
import { useState } from 'react';
import { Axes, Btn, Controls, Slider, Stage, pathOf } from './_kit';

const TAU = Math.PI * 2;
/** Mean-zero forcing with content up to k = 7. */
const f = (x: number) => Math.sin(x) + 0.6 * Math.sin(3 * x) + 0.5 * Math.cos(7 * x);
/** Exact solution of −u'' = f: divide each mode by k². */
const uExact = (x: number) => Math.sin(x) + (0.6 / 9) * Math.sin(3 * x) + (0.5 / 49) * Math.cos(7 * x);

/** Spectral surrogate: coefficients from N samples, weight 1/k², resynthesised as a continuous function. */
function spectral(N: number, kmax: number): (x: number) => number {
  const c: [number, number][] = [];
  for (let k = 0; k <= kmax; k++) {
    let re = 0, im = 0;
    for (let n = 0; n < N; n++) {
      const x = (TAU * n) / N, v = f(x);
      re += v * Math.cos(k * x); im -= v * Math.sin(k * x);
    }
    c.push([re / N, im / N]);
  }
  return (x: number) => {
    let s = 0;
    for (let k = 1; k <= kmax; k++) {
      const [cr, ci] = c[k], w = 1 / (k * k);
      s += 2 * (cr * w * Math.cos(k * x) - ci * w * Math.sin(k * x));
    }
    return s;
  };
}

/** Fixed-grid surrogate: exact at nTrain nodes, linear in between, whatever N you ask for. */
function gridSurrogate(nTrain: number): (x: number) => number {
  const h = TAU / nTrain;
  const v = Array.from({ length: nTrain + 1 }, (_, i) => uExact(i * h));
  return (x: number) => {
    const t = ((x % TAU) + TAU) % TAU, i = Math.min(nTrain - 1, Math.floor(t / h)), a = (t - i * h) / h;
    return v[i] * (1 - a) + v[i + 1] * a;
  };
}

const maxErr = (g: (x: number) => number) =>
  Array.from({ length: 400 }, (_, i) => Math.abs(g((TAU * i) / 400) - uExact((TAU * i) / 400)))
    .reduce((a, b) => Math.max(a, b), 0);

export default function MathResolutionTransfer({ n = 9, kmax = 5, nTrain = 9, showGrid = true }: {
  n?: number; kmax?: number; nTrain?: number; showGrid?: boolean;
}) {
  const [N, setN] = useState(Math.max(5, Math.min(80, Math.round(n))));
  const [K, setK] = useState(Math.max(1, Math.min(10, Math.round(kmax))));
  const [grid, setGrid] = useState(showGrid);
  const M = Math.max(5, Math.min(24, Math.round(nTrain)));

  const gNO = spectral(N, K), gCNN = gridSurrogate(M), gRef = spectral(256, K);
  const eNO = maxErr(gNO), eCNN = maxErr(gCNN);
  // Drift against the SAME model read on a very fine grid: this is the discretisation-invariance check,
  // and unlike eNO it is not contaminated by the truncation error that k_max costs you at every N.
  const drift = Array.from({ length: 400 }, (_, i) => Math.abs(gNO((TAU * i) / 400) - gRef((TAU * i) / 400)))
    .reduce((a, b) => Math.max(a, b), 0);

  const box: [number, number, number, number] = [30, 14, 312, 112];
  const sx = (x: number) => box[0] + (x / TAU) * (box[2] - box[0]);
  const sy = (y: number) => box[3] - ((y + 1.3) / 2.6) * (box[3] - box[1]);
  const curve = (h: (x: number) => number) =>
    pathOf(Array.from({ length: 241 }, (_, i) => [sx((TAU * i) / 240), sy(h((TAU * i) / 240))]));

  return (
    <div>
      <Stage h={196} label="the same trained operator evaluated on a finer grid">
        <Axes x={[0, TAU]} y={[-1.3, 1.3]} box={box} xLabel="x" grid={false} />
        <path d={curve(uExact)} fill="none" stroke="var(--muted)" strokeWidth={1.2} strokeDasharray="3 2" />
        {grid && <path d={curve(gCNN)} fill="none" stroke="var(--c3)" strokeWidth={1.5} />}
        <path d={curve(gNO)} fill="none" stroke="var(--c2)" strokeWidth={1.9} />
        {Array.from({ length: N }, (_, i) => (TAU * i) / N).map((x, i) => (
          <circle key={i} cx={sx(x)} cy={sy(f(x) * 0.35 - 1.05)} r={1.7} fill="var(--c4)" />
        ))}
        <text x={34} y={24} fontSize="8" fill="var(--muted)">grey dashed: exact solution u</text>
        <text x={34} y={34} fontSize="8" fill="var(--c2)">blue: neural operator (a function, evaluated anywhere)</text>
        {grid && <text x={34} y={44} fontSize="8" fill="var(--c3)">orange: surrogate locked to its {M}-point training grid</text>}
        <text x={312} y={24} fontSize="8" textAnchor="end" fill="var(--c4)">N = {N} input samples</text>

        <text x={30} y={132} fontSize="8.5" fill="var(--c2)">
          neural operator — error vs exact: {eNO.toFixed(4)}; drift vs its own N = 256 answer:{' '}
          <tspan fill={drift < 1e-6 ? 'var(--c1)' : 'var(--c5)'}>
            {drift < 1e-6 ? '≈ 0 — discretisation-invariant' : drift.toFixed(4) + ' — aliased, N too coarse'}
          </tspan>
        </text>
        {grid && (
          <text x={30} y={146} fontSize="8.5" fill="var(--c3)">
            fixed-grid surrogate — error vs exact: {eCNN.toFixed(4)}; refining N never moves it
          </text>
        )}
        <text x={30} y={163} fontSize="8" fill="var(--fg)">weights: {2 * K} numbers for the spectral layer, set by k_max = {K}, not by N</text>
        <text x={30} y={175} fontSize="8" fill="var(--muted)">the grid surrogate has one input and one output slot per node: change N and it must be retrained</text>
        <text x={30} y={187} fontSize="8" fill="var(--c5)">the drift goes to zero; the error vs exact does not — it floors at the truncation error of k_max</text>
      </Stage>
      <Controls>
        <Slider label="grid points N" min={5} max={80} step={1} value={N} onChange={(v) => setN(Math.round(v))} format={(v) => v.toFixed(0)} />
        <Slider label="modes kept k_max" min={1} max={10} step={1} value={K} onChange={(v) => setK(Math.round(v))} format={(v) => v.toFixed(0)} />
        <Btn active={grid} onClick={() => setGrid(!grid)}>{grid ? 'hide' : 'show'} fixed-grid surrogate</Btn>
      </Controls>
    </div>
  );
}
