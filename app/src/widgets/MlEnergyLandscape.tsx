/**
 * An energy-based model in one dimension: E(x), the density p(x) = exp(−E(x)/T)/Z, and Langevin walkers.
 * Top panel: the energy E(x) (orange) with a draggable barrier height, plus the walkers shown as dots
 * sitting on the curve. Bottom panel: the exact Boltzmann density p(x) ∝ exp(−E(x)/T) (blue), normalised
 * by a numerically integrated partition function Z = ∫exp(−E(x)/T)dx, together with the running histogram
 * of walker positions — so you can watch Markov-chain sampling converge to the model it defines.
 * Walkers follow unadjusted Langevin dynamics x ← x − ε·E'(x)/T + √(2ε)·ξ, ξ ~ N(0,1).
 * Things to notice: raising the barrier makes the chain mix slowly between the two wells (the practical
 * reason EBM training is hard); raising T flattens p; and the "shift E by +5" button leaves p identical,
 * because the shift cancels between exp(−E/T) and Z — energies are only defined up to a constant.
 * props: {
 *   barrier?: number     height of the central barrier, 0–4 (default 2)
 *   temperature?: number T, 0.2–3 (default 1)
 *   eps?: number         Langevin step size ε (default 0.01)
 *   walkers?: number     number of chains, 1–80 (default 40)
 *   seed?: number        (default 4)
 * }
 */
import { useMemo, useRef, useState } from 'react';
import { Axes, Btn, Controls, PlayPause, Slider, Stage, pathOf, prefersReducedMotion, rng, scale, useFrame } from './_kit';

const XMIN = -3, XMAX = 3;
/** Double well: quartic plus a Gaussian bump of adjustable height at the origin. */
const energy = (x: number, b: number, shift: number) =>
  0.6 * (x * x - 1.6) * (x * x - 1.6) + b * Math.exp(-4 * x * x) + shift;
const grad = (x: number, b: number) =>
  2.4 * x * (x * x - 1.6) - 8 * b * x * Math.exp(-4 * x * x);

export default function MlEnergyLandscape({ barrier = 2, temperature = 1, eps = 0.01, walkers = 40, seed = 4 }: {
  barrier?: number; temperature?: number; eps?: number; walkers?: number; seed?: number;
}) {
  const [b, setB] = useState(Math.max(0, Math.min(4, barrier)));
  const [T, setT] = useState(Math.max(0.2, Math.min(3, temperature)));
  const [shift, setShift] = useState(0);
  const [running, setRunning] = useState(!prefersReducedMotion());
  const n = Math.max(1, Math.min(80, Math.round(walkers)));
  const r = useRef(rng(seed));
  const [xs, setXs] = useState<number[]>(() => Array.from({ length: n }, (_, i) => -2.4 + (4.8 * i) / Math.max(1, n - 1)));
  const [hist, setHist] = useState<number[]>(() => Array(24).fill(0));

  const bin = (x: number) => Math.max(0, Math.min(23, Math.floor(((x - XMIN) / (XMAX - XMIN)) * 24)));
  useFrame(() => {
    const nx = xs.map((x) => {
      let v = x;
      for (let k = 0; k < 5; k++) v = v - (eps * grad(v, b)) / T + Math.sqrt(2 * eps) * r.current.normal();
      return Math.max(XMIN, Math.min(XMAX, v));
    });
    setXs(nx);
    setHist((h) => { const g = h.slice(); nx.forEach((x) => { g[bin(x)] += 1; }); return g; });
  }, running);

  // Partition function by the trapezoid rule on a fine grid.
  const { Z, pmax } = useMemo(() => {
    const M = 600, dx = (XMAX - XMIN) / M;
    let z = 0, pm = 0;
    for (let i = 0; i <= M; i++) {
      const x = XMIN + i * dx;
      const w = Math.exp(-energy(x, b, shift) / T);
      z += (i === 0 || i === M ? 0.5 : 1) * w * dx;
      pm = Math.max(pm, w);
    }
    return { Z: z, pmax: pm / z };
  }, [b, T, shift]);

  const topBox: [number, number, number, number] = [30, 12, 310, 96];
  const botBox: [number, number, number, number] = [30, 118, 310, 186];
  const sx = scale([XMIN, XMAX], [topBox[0], topBox[2]]);
  const emin = shift, emax = shift + Math.max(4, 1.6 + b);
  const sey = scale([emin - 0.6, emax], [topBox[3], topBox[1]]);
  const spy = scale([0, Math.max(1e-6, pmax) * 1.15], [botBox[3], botBox[1]]);
  const grid = Array.from({ length: 121 }, (_, i) => XMIN + ((XMAX - XMIN) * i) / 120);
  const htot = hist.reduce((a, c) => a + c, 0) || 1;

  return (
    <div>
      <Stage h={212} label="energy landscape, Boltzmann density and Langevin samples">
        <Axes x={[XMIN, XMAX]} y={[emin - 0.6, emax]} box={topBox} grid={false} yLabel="E(x)" />
        <path d={pathOf(grid.map((x) => [sx(x), sey(energy(x, b, shift))]))} fill="none" stroke="var(--c3)" strokeWidth={1.8} />
        {xs.map((x, i) => <circle key={i} cx={sx(x)} cy={sey(energy(x, b, shift))} r={2} fill="var(--c5)" opacity={0.75} />)}
        <text x={306} y={24} fontSize="8" textAnchor="end" fill="var(--c5)">{n} Langevin chains</text>

        <Axes x={[XMIN, XMAX]} y={[0, Math.max(1e-6, pmax) * 1.15]} box={botBox} grid={false} xLabel="x" yLabel="p(x)" />
        {hist.map((c, i) => {
          const w = (XMAX - XMIN) / 24;
          const x0 = XMIN + i * w;
          const d = c / htot / w;
          return <rect key={i} x={sx(x0)} y={spy(Math.min(d, pmax * 1.15))} width={(topBox[2] - topBox[0]) / 24 - 1}
            height={Math.max(0, botBox[3] - spy(Math.min(d, pmax * 1.15)))} fill="var(--c6)" opacity={0.35} />;
        })}
        <path d={pathOf(grid.map((x) => [sx(x), spy(Math.exp(-energy(x, b, shift) / T) / Z)]))} fill="none" stroke="var(--c2)" strokeWidth={1.8} />
        <text x={306} y={130} fontSize="8" textAnchor="end" fill="var(--c2)">p = e^(−E/T)/Z</text>
        <text x={306} y={140} fontSize="8" textAnchor="end" fill="var(--c6)">sample histogram</text>
        <text x={6} y={200} fontSize="8.5" fill="var(--fg)">Z = ∫e^(−E/T)dx = {Z < 1e-3 || Z > 1e4 ? Z.toExponential(2) : Z.toFixed(4)}</text>
        <text x={314} y={200} fontSize="8.5" textAnchor="end" fill="var(--muted)">E shifted by {shift.toFixed(0)} — p unchanged</text>
        <text x={6} y={210} fontSize="8" fill="var(--muted)">Z is the integral we cannot do in high dimensions; sampling never needs it.</text>
      </Stage>
      <Controls>
        <PlayPause running={running} set={setRunning} />
        <Btn onClick={() => { setHist(Array(24).fill(0)); setXs(Array.from({ length: n }, (_, i) => -2.4 + (4.8 * i) / Math.max(1, n - 1))); }}>↺ reset chains</Btn>
        <Btn active={shift !== 0} onClick={() => setShift(shift === 0 ? 5 : 0)}>shift E by +5</Btn>
        <Slider label="barrier height" min={0} max={4} step={0.1} value={b} onChange={setB} />
        <Slider label="temperature T" min={0.2} max={3} step={0.05} value={T} onChange={setT} />
      </Controls>
    </div>
  );
}
