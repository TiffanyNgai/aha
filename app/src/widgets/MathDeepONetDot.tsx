/**
 * The DeepONet shape: branch · trunk.
 *
 * Target operator: the antiderivative, G(u)(y) = ∫₀ʸ u(s) ds on [0, 1] — the example Lu et al. (2021) use.
 * The input function u is read ONLY at m fixed sensor points x₁…x_m (the orange dots). Those m numbers go
 * into the *branch*, which here produces p coefficients b₁…b_p by least-squares fitting u on the sensors
 * with a degree-(p−1) polynomial and integrating it term by term. The *trunk* supplies p functions of the
 * query point, t_k(y) = yᵏ. The prediction is their dot product
 *      Ĝ(u)(y) = Σ_{k=1..p} b_k · t_k(y),
 * which you can evaluate at ANY y, not just on a grid. A real DeepONet learns both nets instead of being
 * handed this closed form, but the shape — "branch picks coefficients, trunk picks a basis" — is identical.
 * Watch two things: raising p adds basis functions and the error falls; and the sensors never move, so an
 * input sampled somewhere else cannot be fed in at all.
 *
 * props: {
 *   fn?: 'wave' | 'ramp' | 'bump' | 'kink'   which input function u (default 'wave')
 *   p?: number   trunk/branch width, 1–6 (default 3)
 *   m?: number   number of fixed sensors, 4–16 (default 8)
 *   switchable?: boolean   show the input-function buttons (default true)
 * }
 */
import { useState } from 'react';
import { Axes, Btn, Controls, Slider, Stage, pathOf } from './_kit';

type Fn = 'wave' | 'ramp' | 'bump' | 'kink';
const U: Record<Fn, { u: (x: number) => number; G: (y: number) => number; label: string }> = {
  wave: { u: (x) => Math.sin(2 * Math.PI * x), G: (y) => (1 - Math.cos(2 * Math.PI * y)) / (2 * Math.PI), label: 'sin 2πx' },
  ramp: { u: (x) => 1 - 2 * x, G: (y) => y - y * y, label: '1 − 2x' },
  bump: { u: (x) => Math.exp(-40 * (x - 0.5) ** 2), G: (y) => { let s = 0; for (let i = 0; i < 600; i++) { const t = (y * (i + 0.5)) / 600; s += Math.exp(-40 * (t - 0.5) ** 2); } return (s * y) / 600; }, label: 'narrow bump' },
  kink: { u: (x) => Math.abs(x - 0.5) - 0.25, G: (y) => { let s = 0; for (let i = 0; i < 600; i++) { const t = (y * (i + 0.5)) / 600; s += Math.abs(t - 0.5) - 0.25; } return (s * y) / 600; }, label: '|x − ½| − ¼' },
};

/** Gaussian elimination with partial pivoting. */
function solve(A: number[][], b: number[]): number[] {
  const n = b.length, M = A.map((r, i) => [...r, b[i]]);
  for (let c = 0; c < n; c++) {
    let piv = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[piv][c])) piv = r;
    [M[c], M[piv]] = [M[piv], M[c]];
    const d = M[c][c] || 1e-300;
    for (let r = c + 1; r < n; r++) { const g = M[r][c] / d; for (let k = c; k <= n; k++) M[r][k] -= g * M[c][k]; }
  }
  const x = new Array(n).fill(0);
  for (let c = n - 1; c >= 0; c--) {
    let s = M[c][n];
    for (let k = c + 1; k < n; k++) s -= M[c][k] * x[k];
    x[c] = s / (M[c][c] || 1e-300);
  }
  return x;
}

/** Branch: least-squares polynomial fit of u on the sensors, integrated ⇒ coefficients of yᵏ. */
function branch(u: (x: number) => number, xs: number[], p: number): number[] {
  const A = Array.from({ length: p }, (_, i) => Array.from({ length: p }, (_, j) => xs.reduce((s, x) => s + x ** i * x ** j, 0)));
  const rhs = Array.from({ length: p }, (_, i) => xs.reduce((s, x) => s + x ** i * u(x), 0));
  const a = solve(A, rhs);
  return a.map((ak, k) => ak / (k + 1)); // ∫ a_k x^k = a_k y^{k+1}/(k+1)
}

export default function MathDeepONetDot({ fn = 'wave', p = 3, m = 8, switchable = true }: {
  fn?: Fn; p?: number; m?: number; switchable?: boolean;
}) {
  const [name, setName] = useState<Fn>(U[fn] ? fn : 'wave');
  const [P, setP] = useState(Math.max(1, Math.min(6, Math.round(p))));
  const M = Math.max(4, Math.min(16, Math.round(m)));
  const { u, G, label } = U[name];
  const xs = Array.from({ length: M }, (_, i) => (i + 0.5) / M);
  const b = branch(u, xs, P);
  const pred = (y: number) => b.reduce((s, bk, k) => s + bk * y ** (k + 1), 0);
  const err = Array.from({ length: 201 }, (_, i) => Math.abs(pred(i / 200) - G(i / 200))).reduce((a, c) => Math.max(a, c), 0);

  const L: [number, number, number, number] = [26, 16, 148, 86];
  const R: [number, number, number, number] = [188, 16, 310, 86];
  const put = (box: [number, number, number, number], lo: number, hi: number) => ({
    sx: (x: number) => box[0] + x * (box[2] - box[0]),
    sy: (v: number) => box[3] - ((Math.max(lo, Math.min(hi, v)) - lo) / (hi - lo)) * (box[3] - box[1]),
  });
  const SL = put(L, -1.15, 1.15), SR = put(R, -0.32, 0.32);
  const cL = (g: (x: number) => number) => pathOf(Array.from({ length: 121 }, (_, i) => [SL.sx(i / 120), SL.sy(g(i / 120))]));
  const cR = (g: (y: number) => number) => pathOf(Array.from({ length: 121 }, (_, i) => [SR.sx(i / 120), SR.sy(g(i / 120))]));

  const bw = Math.min(20, 110 / P), bx = 40, by = 148, hmax = Math.max(0.02, ...b.map(Math.abs));

  return (
    <div>
      <Stage h={196} label="DeepONet branch and trunk combined by a dot product">
        <Axes x={[0, 1]} y={[-1.15, 1.15]} box={L} grid={false} />
        <text x={L[0]} y={11} fontSize="8" fill="var(--fg)">input u(x) = {label}</text>
        <path d={cL(u)} fill="none" stroke="var(--muted)" strokeWidth={1.3} />
        {xs.map((x, i) => <circle key={i} cx={SL.sx(x)} cy={SL.sy(u(x))} r={2.2} fill="var(--c3)" />)}
        <text x={L[0]} y={96} fontSize="7.5" fill="var(--c3)">{M} fixed sensors — the only thing the branch ever sees</text>

        <Axes x={[0, 1]} y={[-0.32, 0.32]} box={R} grid={false} />
        <text x={R[0]} y={11} fontSize="8" fill="var(--fg)">output: ∫₀ʸ u</text>
        {Array.from({ length: P }, (_, k) => (
          <path key={k} d={cR((y) => 0.25 * y ** (k + 1))} fill="none" stroke="var(--c4)" strokeWidth={0.7} opacity={0.45} />
        ))}
        <path d={cR(G)} fill="none" stroke="var(--muted)" strokeWidth={1.4} strokeDasharray="3 2" />
        <path d={cR(pred)} fill="none" stroke="var(--c2)" strokeWidth={1.9} />
        <text x={R[0]} y={96} fontSize="7.5" fill="var(--c4)">faint purple: the p trunk functions t_k(y) = yᵏ</text>

        <text x={160} y={112} fontSize="9" textAnchor="middle" fill="var(--fg)">Ĝ(u)(y) = Σₖ bₖ · tₖ(y)   — branch coefficients × trunk basis</text>
        <text x={26} y={130} fontSize="8" fill="var(--c1)">branch output b₁…b_p</text>
        <line x1={26} y1={by} x2={300} y2={by} stroke="var(--fg)" strokeWidth={0.6} />
        {b.map((bk, k) => (
          <g key={k}>
            <rect x={bx + k * (bw + 6)} y={bk >= 0 ? by - (Math.abs(bk) / hmax) * 22 : by} width={bw} height={Math.max(0.6, (Math.abs(bk) / hmax) * 22)} fill={bk >= 0 ? 'var(--c1)' : 'var(--c5)'} opacity={0.85} />
            <text x={bx + k * (bw + 6) + bw / 2} y={by + 9} fontSize="7.5" textAnchor="middle" fill="var(--muted)">b{k + 1}</text>
          </g>
        ))}
        <text x={310} y={140} fontSize="8" textAnchor="end" fill="var(--c2)">max error {err.toFixed(4)}</text>
        <text x={310} y={151} fontSize="8" textAnchor="end" fill="var(--muted)">p = {P} basis functions</text>
        <text x={26} y={170} fontSize="8" fill="var(--fg)">y is a *query point*: the output is a function, so ask for any y you like, on or off a grid.</text>
        <text x={26} y={182} fontSize="8" fill="var(--c5)">The input side is not that free — move or thin the sensors and the branch must be retrained.</text>
        <text x={26} y={193} fontSize="8" fill="var(--muted)">A trained DeepONet learns b and t; here they are written down so you can see the shape.</text>
      </Stage>
      <Controls>
        <Slider label="width p" min={1} max={6} step={1} value={P} onChange={(v) => setP(Math.round(v))} format={(v) => v.toFixed(0)} />
        {switchable && (Object.keys(U) as Fn[]).map((k) => (
          <Btn key={k} active={name === k} onClick={() => setName(k)}>{U[k].label}</Btn>
        ))}
      </Controls>
    </div>
  );
}
