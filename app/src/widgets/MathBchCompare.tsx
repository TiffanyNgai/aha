import { useState } from 'react';
import { Btn, Controls, PlayPause, Slider, Stage, prefersReducedMotion, useFrame } from './_kit';

/**
 * Why exp(A)exp(B) ≠ exp(A + B): three images of the same little shape, under
 *   exp(sA)exp(sB)  (green, solid)   —  do B first, then A
 *   exp(sB)exp(sA)  (orange, dotted) —  the other order
 *   exp(s(A + B))   (blue, dashed)   —  one single flow along A + B
 * The grey dashed outline is the shape at s = 0. Slide s from 0 to 1 (or press Play).
 * Readouts: the commutator [A, B] = AB − BA, the measured gap max|exp(sA)exp(sB) − exp(s(A+B))|
 * and the first Baker–Campbell–Hausdorff prediction (s²/2)·max|[A, B]|, which matches for small s.
 * When A and B commute the three images coincide for every s.
 * props: { A?: [a,b,c,d], B?: [a,b,c,d] (2×2 generators; default a pair of opposite shears),
 *          s?: number (0–1, default 1), presets?: boolean (default true), animate?: boolean (default true) }
 */
type M = [number, number, number, number];
type P = [number, number];

const mm = (X: M, Y: M): M => [X[0] * Y[0] + X[1] * Y[2], X[0] * Y[1] + X[1] * Y[3], X[2] * Y[0] + X[3] * Y[2], X[2] * Y[1] + X[3] * Y[3]];
const sc = (X: M, k: number): M => [X[0] * k, X[1] * k, X[2] * k, X[3] * k];
const ad = (X: M, Y: M): M => [X[0] + Y[0], X[1] + Y[1], X[2] + Y[2], X[3] + Y[3]];
const sub = (X: M, Y: M): M => ad(X, sc(Y, -1));
const I2: M = [1, 0, 0, 1];
function expm(A0: M): M {
  const n = Math.max(...A0.map(Math.abs), 1e-12);
  const k = Math.max(0, Math.ceil(Math.log2(n)) + 2);
  const A = sc(A0, 1 / 2 ** k);
  let term: M = I2, out: M = I2;
  for (let j = 1; j <= 16; j++) { term = sc(mm(term, A), 1 / j); out = ad(out, term); }
  for (let i = 0; i < k; i++) out = mm(out, out);
  return out;
}
const ap = (X: M, p: P): P => [X[0] * p[0] + X[1] * p[1], X[2] * p[0] + X[3] * p[1]];
const mx = (X: M) => Math.max(...X.map(Math.abs));

const PRESETS: [string, M, M][] = [
  ['two shears', [0, 1, 0, 0], [0, 0, 1, 0]],
  ['turn + stretch', [0, -1, 1, 0], [0.6, 0, 0, -0.6]],
  ['commuting', [0, -1, 1, 0], [0.5, 0, 0, 0.5]],
];

const SHAPE: P[] = [[0, 0], [1, 0], [1, 0.6], [0.5, 0.6], [0.5, 1], [0, 1]];
const CX = 104, CY = 104, S = 29;
const px = (p: P): P => [CX + S * p[0], CY - S * p[1]];
const poly = (pts: P[]) => pts.map((p) => { const q = px(p); return `${q[0].toFixed(1)},${q[1].toFixed(1)}`; }).join(' ');
const f2 = (v: number) => (Math.abs(v) < 5e-3 ? '0.00' : v.toFixed(2));

export default function MathBchCompare({ A: A0 = [0, 1, 0, 0], B: B0 = [0, 0, 1, 0], s: s0 = 1, presets = true, animate = true }: {
  A?: M; B?: M; s?: number; presets?: boolean; animate?: boolean;
}) {
  const [[A, B], setAB] = useState<[M, M]>([A0, B0]);
  const [s, setS] = useState(Math.max(0, Math.min(1, s0)));
  const [run, setRun] = useState(animate && !prefersReducedMotion());
  useFrame((dt) => setS((v) => (v + dt * 0.3) % 1.0001), run);

  const AB = expm(sc(A, s)); const BA = expm(sc(B, s));
  const order1 = mm(AB, BA);           // exp(sA) exp(sB)
  const order2 = mm(BA, AB);           // exp(sB) exp(sA)
  const sum = expm(sc(ad(A, B), s));   // exp(s(A+B))
  const comm = sub(mm(A, B), mm(B, A));
  const gap = mx(sub(order1, sum));
  const pred = (s * s / 2) * mx(comm);

  return (
    <div>
      <Stage w={320} h={212} label="exp(A)exp(B) compared with exp(A+B)">
        <defs><clipPath id="bch-clip"><rect x={4} y={4} width={200} height={196} /></clipPath></defs>
        <g clipPath="url(#bch-clip)">
          {[-3, -2, -1, 1, 2, 3].map((k) => <g key={k}>
            <line x1={CX + S * k} x2={CX + S * k} y1={4} y2={200} stroke="var(--grid)" strokeWidth={0.5} />
            <line y1={CY - S * k} y2={CY - S * k} x1={4} x2={204} stroke="var(--grid)" strokeWidth={0.5} />
          </g>)}
          <line x1={4} x2={204} y1={CY} y2={CY} stroke="var(--fg)" strokeWidth={0.7} />
          <line y1={4} y2={200} x1={CX} x2={CX} stroke="var(--fg)" strokeWidth={0.7} />
          <polygon points={poly(SHAPE)} fill="var(--muted)" fillOpacity={0.12} stroke="var(--muted)" strokeWidth={1} strokeDasharray="2 2" />
          <polygon points={poly(SHAPE.map((p) => ap(order1, p)))} fill="var(--c1)" fillOpacity={0.2} stroke="var(--c1)" strokeWidth={2} />
          <polygon points={poly(SHAPE.map((p) => ap(order2, p)))} fill="none" stroke="var(--c3)" strokeWidth={1.6} strokeDasharray="1.5 2.5" />
          <polygon points={poly(SHAPE.map((p) => ap(sum, p)))} fill="none" stroke="var(--c2)" strokeWidth={1.8} strokeDasharray="5 3" />
        </g>
        <g fontSize="8.5">
          <text x={6} y={14} fill="var(--c1)">exp(sA)exp(sB)</text>
          <text x={6} y={25} fill="var(--c3)">exp(sB)exp(sA)</text>
          <text x={6} y={36} fill="var(--c2)">exp(s(A+B))</text>
          <text x={6} y={208} fill="var(--muted)">s = {s.toFixed(2)}</text>
        </g>
        <g fontSize="9.5" fill="var(--fg)">
          <text x={210} y={16} fontWeight="bold" fill="var(--c4)">[A, B] = AB − BA</text>
          <text x={214} y={31}>[ {f2(comm[0])}  {f2(comm[1])} ]</text>
          <text x={214} y={43}>[ {f2(comm[2])}  {f2(comm[3])} ]</text>
          <text x={210} y={62} fontSize="8.5" fill="var(--muted)">{mx(comm) < 1e-9 ? 'A and B commute' : 'A and B do not commute'}</text>

          <text x={210} y={86} fontWeight="bold">measured gap</text>
          <text x={214} y={100} fill="var(--c5)">{gap.toFixed(3)}</text>
          <text x={210} y={118} fontSize="8.5" fill="var(--muted)">max entry of</text>
          <text x={210} y={128} fontSize="8.5" fill="var(--muted)">exp(sA)exp(sB)</text>
          <text x={210} y={138} fontSize="8.5" fill="var(--muted)">− exp(s(A+B))</text>

          <text x={210} y={158} fontWeight="bold">BCH 1st term</text>
          <text x={214} y={172} fill="var(--c6)">{pred.toFixed(3)}</text>
          <text x={210} y={186} fontSize="8.5" fill="var(--muted)">(s²/2)·max|[A,B]|</text>
          <text x={210} y={203} fontSize="8" fill="var(--muted)">equal only if [A,B]=0</text>
        </g>
      </Stage>
      <Controls>
        <PlayPause running={run} set={setRun} />
        <Slider label="s" value={s} min={0} max={1} step={0.005} onChange={(v) => { setRun(false); setS(v); }} />
      </Controls>
      {presets && <Controls>
        {PRESETS.map(([l, a, b]) => <Btn key={l} active={mx(sub(A, a)) < 1e-9 && mx(sub(B, b)) < 1e-9} onClick={() => setAB([a, b])}>{l}</Btn>)}
      </Controls>}
    </div>
  );
}
