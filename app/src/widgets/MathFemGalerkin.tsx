import { useState } from 'react';
import { Axes, Btn, Controls, Slider, Stage, pathOf, scale } from './_kit';

type Load = 'const' | 'sine' | 'wiggle';
/**
 * Piecewise-linear (P1) finite elements for −u'' = f on (0, 1) with u(0) = u(1) = 0.
 * The weak problem "find u ∈ H¹₀ with ∫u'v' = ∫fv for all v ∈ H¹₀" is restricted to the subspace V_h of
 * continuous piecewise-linear functions on a uniform mesh of n elements, spanned by the hat functions φ_i
 * (drawn faintly at the bottom). That gives the tridiagonal system (1/h)·tridiag(−1, 2, −1) u = b with
 * b_i = ∫ f φ_i (composite Simpson), solved here by the Thomas algorithm.
 * Grey = exact solution, blue = Galerkin solution u_h with its nodal values marked.
 *   'const'  f = 1,            u = x(1 − x)/2
 *   'sine'   f = π² sin(πx),   u = sin(πx)
 *   'wiggle' f = 9π² sin(3πx), u = sin(3πx)   (needs a fine mesh)
 * Readouts: the largest error over the whole interval (it shrinks like h²) and the largest error AT the
 * nodes — in this 1D problem the latter is ≈ 0 whatever the mesh, a well-known superconvergence quirk.
 * props: { load?: 'const' | 'sine' | 'wiggle' (default 'const'), n?: elements (2–24, default 4),
 *          switchable?: boolean (default true) }
 */
const PI = Math.PI;
const FS: Record<Load, { f: (x: number) => number; u: (x: number) => number; y: [number, number]; tex: string }> = {
  const: { f: () => 1, u: (x) => (x * (1 - x)) / 2, y: [-0.03, 0.17], tex: 'f = 1' },
  sine: { f: (x) => PI * PI * Math.sin(PI * x), u: (x) => Math.sin(PI * x), y: [-0.15, 1.2], tex: 'f = π² sin πx' },
  wiggle: { f: (x) => 9 * PI * PI * Math.sin(3 * PI * x), u: (x) => Math.sin(3 * PI * x), y: [-1.3, 1.3], tex: 'f = 9π² sin 3πx' },
};
/** Composite Simpson of g on [a, b] with m (even) subintervals. */
const simp = (g: (x: number) => number, a: number, b: number, m = 16) => {
  const h = (b - a) / m; let s = g(a) + g(b);
  for (let i = 1; i < m; i++) s += g(a + i * h) * (i % 2 ? 4 : 2);
  return (s * h) / 3;
};

export default function MathFemGalerkin({ load = 'const', n = 4, switchable = true }: {
  load?: Load; n?: number; switchable?: boolean;
}) {
  const [ld, setLd] = useState<Load>(load);
  const [N, setN] = useState(Math.max(2, Math.min(24, Math.round(n))));
  const { f, u, y, tex } = FS[ld];
  const h = 1 / N, m = N - 1;

  // load vector and Thomas solve for (1/h) tridiag(-1, 2, -1) U = b
  const b: number[] = [];
  for (let i = 1; i <= m; i++) {
    const xi = i * h;
    b.push(simp((x) => f(x) * (x - (xi - h)) / h, xi - h, xi) + simp((x) => f(x) * ((xi + h) - x) / h, xi, xi + h));
  }
  const cp = new Array(m).fill(0), dp = new Array(m).fill(0);
  const diag = 2 / h, off = -1 / h;
  for (let i = 0; i < m; i++) {
    const den = diag - off * (i ? cp[i - 1] : 0);
    cp[i] = off / den;
    dp[i] = (b[i] - off * (i ? dp[i - 1] : 0)) / den;
  }
  const U = new Array(m).fill(0);
  for (let i = m - 1; i >= 0; i--) U[i] = dp[i] - cp[i] * (i < m - 1 ? U[i + 1] : 0);
  const nodes = [0, ...U, 0];
  const uh = (x: number) => {
    const t = Math.min(N - 1e-12, Math.max(0, x / h)); const i = Math.floor(t);
    return nodes[i] + (t - i) * (nodes[i + 1] - nodes[i]);
  };

  let maxErr = 0, nodeErr = 0;
  for (let i = 0; i <= 1000; i++) { const x = i / 1000; maxErr = Math.max(maxErr, Math.abs(u(x) - uh(x))); }
  for (let i = 0; i <= N; i++) nodeErr = Math.max(nodeErr, Math.abs(u(i * h) - nodes[i]));

  const box: [number, number, number, number] = [32, 10, 312, 132];
  const sx = scale([0, 1], [box[0], box[2]]), sy = scale(y, [box[3], box[1]]);
  const exact = pathOf(Array.from({ length: 301 }, (_, i) => [sx(i / 300), sy(u(i / 300))] as [number, number]));
  const fem = pathOf(nodes.map((v, i) => [sx(i * h), sy(v)] as [number, number]));
  const hatTop = 162, hatBot = 182;

  return (
    <div>
      <Stage w={320} h={200} label="Finite element approximation of a Poisson problem">
        <Axes x={[0, 1]} y={y} box={box} xLabel="x" />
        <path d={exact} fill="none" stroke="var(--muted)" strokeWidth={2.4} />
        <path d={fem} fill="none" stroke="var(--c2)" strokeWidth={1.8} />
        {nodes.map((v, i) => <circle key={i} cx={sx(i * h)} cy={sy(v)} r={2.2} fill="var(--c2)" />)}
        <text x={box[2]} y={box[1] + 9} textAnchor="end" fontSize="8" fill="var(--muted)">exact u</text>
        <text x={box[2]} y={box[1] + 19} textAnchor="end" fontSize="8" fill="var(--c2)">u_h ∈ V_h</text>

        {Array.from({ length: m }, (_, i) => i + 1).map((i) => (
          <path key={i} d={pathOf([[sx((i - 1) * h), hatBot], [sx(i * h), hatTop], [sx((i + 1) * h), hatBot]])}
            fill="none" stroke="var(--c1)" strokeWidth={0.9} opacity={0.65} />
        ))}
        <line x1={box[0]} x2={box[2]} y1={hatBot} y2={hatBot} stroke="var(--grid)" strokeWidth={0.6} />
        <text x={box[0]} y={hatTop - 4} fontSize="7.5" fill="var(--c1)">hat basis φ₁ … φ_{m} (h = 1/{N})</text>

        <text x={14} y={147} fontSize="8.5" fill="var(--fg)">{tex} · n = {N} elements</text>
        <text x={170} y={147} fontSize="8.5" fill="var(--c5)">max |u − u_h| = {maxErr.toExponential(1)}</text>
        <text x={14} y={196} fontSize="8" fill="var(--muted)">largest error at the nodes: {nodeErr.toExponential(1)}</text>
      </Stage>
      <Controls>
        {switchable && (['const', 'sine', 'wiggle'] as Load[]).map((t) => (
          <Btn key={t} active={ld === t} onClick={() => setLd(t)}>{FS[t].tex}</Btn>
        ))}
        <Slider label="elements n" value={N} min={2} max={24} step={1} onChange={(v) => setN(Math.round(v))} format={(v) => String(v)} />
      </Controls>
    </div>
  );
}
