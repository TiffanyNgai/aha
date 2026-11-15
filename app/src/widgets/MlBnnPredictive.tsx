import { useMemo, useState } from 'react';
import { Axes, Btn, C, Controls, Slider, Stage, pathOf, rng, scale } from './_kit';

/**
 * Four ways of putting error bars on a neural network, run on the SAME model and the SAME data,
 * so the comparison is apples to apples.
 *
 * The "network" is a random-feature model: φ_j(x) = √(2/D)·cos(ω_j x + b_j) with ω_j ~ N(0, 1/ℓ²)
 * and a trained linear output layer — i.e. a one-hidden-layer net with frozen random hidden units.
 * That makes every method exact in closed form instead of a training run, while keeping the
 * qualitative behaviour of last-layer methods on real nets. Data: two clusters with a GAP in the
 * middle, so honest epistemic uncertainty must grow there and outside the data.
 *
 *   map       one ridge fit. The band is the learned noise σ_n only: NO epistemic uncertainty.
 *   ensemble  M independently initialized members (own random features, own bootstrap resample),
 *             predictive variance = spread of members + σ_n². Widens in the gap and outside.
 *   dropout   MC dropout on the hidden layer at rate p. Weights are fitted with the exactly
 *             equivalent per-feature ridge penalty (p/(1−p))Σ_i φ_ij², then `draws` Bernoulli masks
 *             are sampled at test time. The spread is ≈ (p/(1−p))Σ_j w_j²φ_j(x)² — roughly FLAT in
 *             x, so it barely grows in the gap, and it is set by p, not by the data.
 *   laplace   Gaussian posterior over the output weights, A = ΦᵀΦ/σ_n² + αI, mean A⁻¹Φᵀy/σ_n²,
 *             var(x) = φ(x)ᵀA⁻¹φ(x) + σ_n². Exact for this model; the linearized-Laplace recipe.
 *
 * The readout prints the band's 2σ half-width at a point inside the data and at the centre of the
 * gap, so "does it actually widen?" is a number rather than an impression.
 *
 * props: {
 *   method?: 'map'|'ensemble'|'dropout'|'laplace'  initial method (default 'ensemble')
 *   members?: number   ensemble size M, 2–16 (default 8)
 *   p?: number         dropout rate, 0.05–0.6 (default 0.3)
 *   draws?: number     MC dropout masks / member curves drawn (default 24)
 *   noise?: number     observation noise σ_n (default 0.12)
 *   alpha?: number     prior precision α for Laplace (default 1)
 *   showMembers?: boolean  draw the individual sampled functions (default true)
 *   seed?: number      PRNG seed (default 4)
 * }
 */
type Method = 'map' | 'ensemble' | 'dropout' | 'laplace';
const L = 28, T = 10, R = 312, Bm = 150;
const D = 28, ELL = 0.32;
const XR: [number, number] = [-1.25, 1.25];
const YR: [number, number] = [-2, 2];
const sx = scale(XR, [L, R]);
const sy = scale(YR, [Bm, T]);
const GRID = Array.from({ length: 101 }, (_, i) => XR[0] + ((XR[1] - XR[0]) * i) / 100);
const truth = (x: number) => 0.85 * Math.sin(4 * x) + 0.3 * x;

function features(x: number, w: number[], b: number[]) {
  const s = Math.sqrt(2 / D);
  return w.map((wi, j) => s * Math.cos(wi * x + b[j]));
}
function drawFeatures(seed: number) {
  const g = rng(seed);
  const w = Array.from({ length: D }, () => g.normal() / ELL);
  const b = Array.from({ length: D }, () => 2 * Math.PI * g.u());
  return { w, b };
}
/** Lower Cholesky of a symmetric positive-definite matrix (in place on a copy). */
function chol(A: number[][]) {
  const n = A.length, M = A.map((r) => r.slice());
  for (let i = 0; i < n; i++) {
    for (let j = 0; j <= i; j++) {
      let s = M[i][j];
      for (let k = 0; k < j; k++) s -= M[i][k] * M[j][k];
      M[i][j] = i === j ? Math.sqrt(Math.max(s, 1e-10)) : s / M[j][j];
    }
    for (let j = i + 1; j < n; j++) M[i][j] = 0;
  }
  return M;
}
function cholSolve(M: number[][], bv: number[]) {
  const n = bv.length, z = new Array(n).fill(0), x = new Array(n).fill(0);
  for (let i = 0; i < n; i++) { let s = bv[i]; for (let k = 0; k < i; k++) s -= M[i][k] * z[k]; z[i] = s / M[i][i]; }
  for (let i = n - 1; i >= 0; i--) { let s = z[i]; for (let k = i + 1; k < n; k++) s -= M[k][i] * x[k]; x[i] = s / M[i][i]; }
  return x;
}
/** Ridge / MAP fit with a per-feature penalty vector. Returns weights and the Cholesky of the precision. */
function fit(Phi: number[][], y: number[], pen: number[]) {
  const A: number[][] = Array.from({ length: D }, (_, i) => Array.from({ length: D }, (_, j) => {
    let s = i === j ? pen[i] : 0;
    for (let n = 0; n < Phi.length; n++) s += Phi[n][i] * Phi[n][j];
    return s;
  }));
  const rhs = Array.from({ length: D }, (_, i) => Phi.reduce((s, row, n) => s + row[i] * y[n], 0));
  const M = chol(A);
  return { w: cholSolve(M, rhs), M };
}

export default function MlBnnPredictive({
  method: m0 = 'ensemble', members = 8, p: p0 = 0.3, draws = 24, noise = 0.12, alpha = 1,
  showMembers = true, seed = 4,
}: {
  method?: Method; members?: number; p?: number; draws?: number; noise?: number; alpha?: number;
  showMembers?: boolean; seed?: number;
}) {
  const [method, setMethod] = useState<Method>(m0);
  const [p, setP] = useState(p0);
  const [M, setM] = useState(Math.max(2, Math.min(16, Math.round(members))));

  const data = useMemo(() => {
    const g = rng(seed * 13 + 1);
    const xs: number[] = [];
    for (let i = 0; i < 8; i++) xs.push(-0.95 + 0.085 * i);
    for (let i = 0; i < 8; i++) xs.push(0.36 + 0.085 * i);
    return xs.map((x) => [x, truth(x) + noise * g.normal()] as [number, number]);
  }, [seed, noise]);

  const curves = useMemo(() => {
    const X = data.map((d) => d[0]), Y = data.map((d) => d[1]);
    const base = drawFeatures(seed * 101 + 3);
    const Phi = X.map((x) => features(x, base.w, base.b));
    const mean = new Array(GRID.length).fill(0);
    const sd = new Array(GRID.length).fill(0);
    const samples: number[][] = [];

    if (method === 'map' || method === 'laplace') {
      const lam = alpha * noise * noise;
      const { w, M: Lc } = fit(Phi, Y, new Array(D).fill(lam));
      GRID.forEach((x, i) => {
        const f = features(x, base.w, base.b);
        mean[i] = f.reduce((s, v, j) => s + v * w[j], 0);
        if (method === 'laplace') {
          // A = ΦᵀΦ/σ² + αI = (ΦᵀΦ + ασ²I)/σ², so A⁻¹ = σ²(ΦᵀΦ + λI)⁻¹
          const v = cholSolve(Lc, f);
          sd[i] = Math.sqrt(noise * noise * f.reduce((s, fv, j) => s + fv * v[j], 0) + noise * noise);
        } else sd[i] = noise;
      });
    } else if (method === 'ensemble') {
      const fs: number[][] = [];
      for (let m = 0; m < M; m++) {
        const g = rng(seed * 977 + m * 61 + 7);
        const feat = drawFeatures(seed * 31 + m * 17 + 2);
        const idx = X.map(() => Math.floor(g.u() * X.length));           // bootstrap resample
        const Pm = idx.map((k) => features(X[k], feat.w, feat.b));
        const Ym = idx.map((k) => Y[k]);
        const { w } = fit(Pm, Ym, new Array(D).fill(alpha * noise * noise));
        fs.push(GRID.map((x) => features(x, feat.w, feat.b).reduce((s, v, j) => s + v * w[j], 0)));
      }
      GRID.forEach((_, i) => {
        const vals = fs.map((f) => f[i]);
        const mu = vals.reduce((s, v) => s + v, 0) / M;
        const vr = vals.reduce((s, v) => s + (v - mu) ** 2, 0) / M;
        mean[i] = mu; sd[i] = Math.sqrt(vr + noise * noise);
      });
      samples.push(...fs);
    } else {
      // Dropout-regularized fit: E_mask ||y − Φ(m/(1−p))w||² = ||y − Φw||² + (p/(1−p))Σ_i φ_ij² w_j²
      const k = p / (1 - p);
      const pen = Array.from({ length: D }, (_, j) => k * Phi.reduce((s, row) => s + row[j] * row[j], 0));
      const { w } = fit(Phi, Y, pen);
      const g = rng(seed * 7 + 19);
      const fs: number[][] = [];
      for (let s0 = 0; s0 < draws; s0++) {
        const mask = Array.from({ length: D }, () => (g.u() < p ? 0 : 1 / (1 - p)));
        fs.push(GRID.map((x) => features(x, base.w, base.b).reduce((s, v, j) => s + v * w[j] * mask[j], 0)));
      }
      GRID.forEach((_, i) => {
        const vals = fs.map((f) => f[i]);
        const mu = vals.reduce((s, v) => s + v, 0) / draws;
        const vr = vals.reduce((s, v) => s + (v - mu) ** 2, 0) / draws;
        mean[i] = mu; sd[i] = Math.sqrt(vr + noise * noise);
      });
      samples.push(...fs);
    }
    return { mean, sd, samples };
  }, [method, M, p, draws, noise, alpha, seed, data]);

  const at = (x: number) => Math.round(((x - XR[0]) / (XR[1] - XR[0])) * 100);
  const wIn = 2 * curves.sd[at(-0.6)];
  const wGap = 2 * curves.sd[at(0)];
  const wOut = 2 * curves.sd[at(1.2)];

  const band = pathOf(GRID.map((x, i) => [sx(x), sy(Math.min(YR[1], curves.mean[i] + 2 * curves.sd[i]))] as [number, number]))
    + 'L' + GRID.map((x, i) => `${sx(x).toFixed(2)},${sy(Math.max(YR[0], curves.mean[i] - 2 * curves.sd[i])).toFixed(2)}`).reverse().join('L') + 'Z';
  const names: Record<Method, string> = { map: 'single net (MAP)', ensemble: `deep ensemble (M=${M})`, dropout: `MC dropout (p=${p.toFixed(2)})`, laplace: 'Laplace / last-layer Bayes' };

  return (
    <div>
      <Stage w={320} h={214} label="Predictive uncertainty from four approximate-Bayes methods">
        <Axes x={XR} y={YR} box={[L, T, R, Bm]} grid={false} />
        <rect x={sx(-0.3)} y={T} width={sx(0.3) - sx(-0.3)} height={Bm - T} fill="var(--muted)" opacity={0.08} />
        <text x={sx(0)} y={T + 8} fontSize="7.5" fill="var(--muted)" textAnchor="middle">no data here</text>
        <path d={band} fill={C[1]} opacity={0.18} />
        {showMembers && curves.samples.slice(0, 14).map((f, m) => (
          <path key={m} d={pathOf(GRID.map((x, i) => [sx(x), sy(Math.max(YR[0], Math.min(YR[1], f[i])))] as [number, number]))}
            fill="none" stroke={C[1]} strokeWidth={0.5} opacity={0.35} />
        ))}
        <path d={pathOf(GRID.map((x) => [sx(x), sy(truth(x))] as [number, number]))} fill="none" stroke="var(--muted)" strokeWidth={0.9} strokeDasharray="3 2" />
        <path d={pathOf(GRID.map((x, i) => [sx(x), sy(Math.max(YR[0], Math.min(YR[1], curves.mean[i])))] as [number, number]))} fill="none" stroke={C[1]} strokeWidth={1.6} />
        {data.map(([x, y], i) => <circle key={i} cx={sx(x)} cy={sy(y)} r={2} fill={C[4]} />)}
        <text x={L} y={Bm + 14} fontSize="8.5" fill="var(--fg)">{names[method]}</text>
        <text x={R} y={Bm + 14} fontSize="7.5" fill="var(--muted)" textAnchor="end">dashed = true function</text>
        <text x={L} y={Bm + 27} fontSize="8" fill="var(--fg)">
          2σ band width — on data: {wIn.toFixed(2)} · in the gap: <tspan fill={wGap > 1.8 * wIn ? C[0] : C[4]}>{wGap.toFixed(2)}</tspan> · extrapolating: {wOut.toFixed(2)}
        </text>
        <text x={L} y={Bm + 39} fontSize="8" fill="var(--muted)">
          {method === 'map' ? 'A point estimate has one answer everywhere. The band is just the noise level.'
            : method === 'ensemble' ? 'Members agree where there is data and fan out where there is none.'
            : method === 'dropout' ? 'The spread is set by p, not by the data: it hardly notices the gap.'
            : 'Widens where the features are least constrained by the data.'}
        </text>
      </Stage>
      <Controls>
        {(['map', 'ensemble', 'dropout', 'laplace'] as Method[]).map((m) => (
          <Btn key={m} onClick={() => setMethod(m)} active={method === m}>{m}</Btn>
        ))}
        {method === 'ensemble' && <Slider label="M" value={M} min={2} max={16} step={1} onChange={(v) => setM(Math.round(v))} format={(v) => String(Math.round(v))} />}
        {method === 'dropout' && <Slider label="p" value={p} min={0.05} max={0.6} step={0.05} onChange={setP} />}
      </Controls>
    </div>
  );
}
