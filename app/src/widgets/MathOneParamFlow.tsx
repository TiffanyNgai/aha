import { useState } from 'react';
import { Btn, Controls, PlayPause, Slider, Stage, prefersReducedMotion, useFrame } from './_kit';

/**
 * A one-parameter subgroup t ↦ exp(tX) of GL(2,ℝ) flowing a shape across the plane.
 * The grey dashed "F" is the starting shape; the solid green "F" is its image under exp(tX).
 * Thin blue curves are the orbits {exp(sX)·p : s ∈ ℝ} of several seed points — the flow lines of
 * the vector field v(p) = X·p. A red dot rides its own orbit from s = 0 to s = t.
 * Readouts: the generator X, the group element exp(tX) and det exp(tX) = e^{t·tr X}.
 * Generators: 'rotation' (SO(2): circles), 'boost' (SL(2,ℝ) hyperbolas), 'shear' (nilpotent X,
 * exp is a finite sum), 'scale' (X = I: radial dilations), 'spiral' (rotation + dilation).
 * props: { gen?: 'rotation'|'boost'|'shear'|'scale'|'spiral'|'custom' (default 'rotation'),
 *          X?: [a,b,c,d] (used when gen = 'custom'), gens?: string[] (buttons, default all five),
 *          t?: number (default 0.9), tMax?: number (default 2), animate?: boolean (default true) }
 */
type M = [number, number, number, number];
type P = [number, number];
type G = 'rotation' | 'boost' | 'shear' | 'scale' | 'spiral' | 'custom';

const mm = (A: M, B: M): M => [A[0] * B[0] + A[1] * B[2], A[0] * B[1] + A[1] * B[3], A[2] * B[0] + A[3] * B[2], A[2] * B[1] + A[3] * B[3]];
const sc = (A: M, k: number): M => [A[0] * k, A[1] * k, A[2] * k, A[3] * k];
const ad = (A: M, B: M): M => [A[0] + B[0], A[1] + B[1], A[2] + B[2], A[3] + B[3]];
const I2: M = [1, 0, 0, 1];

/** exp(A) for a 2×2 matrix, by scaling-and-squaring with a Taylor series (accurate to ~1e-12 here). */
export function expm2(A0: M): M {
  const nrm = Math.max(...A0.map(Math.abs), 1e-12);
  const s = Math.max(0, Math.ceil(Math.log2(nrm)) + 2);
  const A = sc(A0, 1 / 2 ** s);
  let term: M = I2, out: M = I2;
  for (let k = 1; k <= 16; k++) { term = sc(mm(term, A), 1 / k); out = ad(out, term); }
  for (let i = 0; i < s; i++) out = mm(out, out);
  return out;
}
const ap = (A: M, p: P): P => [A[0] * p[0] + A[1] * p[1], A[2] * p[0] + A[3] * p[1]];

const GENS: Record<Exclude<G, 'custom'>, { X: M; label: string; note: string }> = {
  rotation: { X: [0, -1, 1, 0], label: 'rotation', note: 'tr X = 0, Xᵀ = −X → exp(tX) ∈ SO(2)' },
  boost: { X: [1, 0, 0, -1], label: 'boost', note: 'tr X = 0 → det = 1; orbits are hyperbolas' },
  shear: { X: [0, 1, 0, 0], label: 'shear', note: 'X² = 0 → exp(tX) = I + tX exactly' },
  scale: { X: [1, 0, 0, 1], label: 'scale', note: 'X = I → exp(tX) = eᵗI, a pure dilation' },
  spiral: { X: [0.3, -1, 1, 0.3], label: 'spiral', note: 'rotation + dilation; det = e^{0.6t}' },
};

// A letter "F" in world coordinates (closed outline), sitting to the right of the origin.
const SHAPE: P[] = [[0.5, -0.55], [0.5, 0.85], [1.45, 0.85], [1.45, 0.55], [0.8, 0.55], [0.8, 0.3],
  [1.3, 0.3], [1.3, 0.0], [0.8, 0.0], [0.8, -0.55]];
const SEEDS: P[] = [[1.0, 0.0], [1.9, 0.0], [0.0, 1.0], [0.0, 1.9], [-1.0, 0.0], [-1.9, 0.0],
  [0.0, -1.0], [0.0, -1.9], [1.3, 1.3], [-1.3, 1.3], [1.3, -1.3], [-1.3, -1.3]];

const CX = 108, CY = 100, S = 36, RNG = 2.75;
const px = (p: P): P => [CX + S * p[0], CY - S * p[1]];
const poly = (pts: P[]) => pts.map((p) => { const q = px(p); return `${q[0].toFixed(1)},${q[1].toFixed(1)}`; }).join(' ');
const f2 = (v: number) => (Math.abs(v) >= 100 ? v.toExponential(1) : Math.abs(v) < 5e-3 ? '0.00' : v.toFixed(2));

export default function MathOneParamFlow({ gen = 'rotation', X: Xc = [0, -1, 1, 0], gens, t: t0 = 0.9, tMax = 2, animate = true }: {
  gen?: G; X?: M; gens?: string[]; t?: number; tMax?: number; animate?: boolean;
}) {
  const [g, setG] = useState<G>(gen);
  const [t, setT] = useState(Math.max(-tMax, Math.min(tMax, t0)));
  const [run, setRun] = useState(animate && !prefersReducedMotion());
  useFrame((dt) => setT((v) => { const n = v + dt * 0.6; return n > tMax ? -tMax : n; }), run);

  const X: M = g === 'custom' ? Xc : GENS[g].X;
  const note = g === 'custom' ? 'custom generator' : GENS[g].note;
  const E = expm2(sc(X, t));
  const trX = X[0] + X[3];
  const buttons = (gens ?? ['rotation', 'boost', 'shear', 'scale', 'spiral']).filter((k): k is Exclude<G, 'custom'> => k in GENS);

  // orbit of each seed over the whole visible s-range, and the travelled arc of the marked seed
  const orbit = (p: P, s0: number, s1: number) => {
    const out: P[] = [];
    for (let i = 0; i <= 56; i++) {
      const s = s0 + ((s1 - s0) * i) / 56;
      const q = ap(expm2(sc(X, s)), p);
      if (Math.abs(q[0]) < 4.2 && Math.abs(q[1]) < 4.2) out.push(q); else if (out.length) break;
    }
    return out;
  };
  const span = g === 'rotation' ? [0, 2 * Math.PI] : [-tMax * 1.6, tMax * 1.6];
  const mark: P = [1.0, 0.0];
  const markNow = ap(E, mark);
  const mp = px(markNow);

  return (
    <div>
      <Stage w={320} h={210} label="One-parameter subgroup exp(tX) flowing a shape in the plane">
        <defs><clipPath id="opf-clip"><rect x={4} y={4} width={208} height={192} /></clipPath></defs>
        <g clipPath="url(#opf-clip)">
          {[-2, -1, 1, 2].map((k) => <g key={k}>
            <line x1={CX + S * k} x2={CX + S * k} y1={4} y2={196} stroke="var(--grid)" strokeWidth={0.5} />
            <line y1={CY - S * k} y2={CY - S * k} x1={4} x2={212} stroke="var(--grid)" strokeWidth={0.5} />
          </g>)}
          <line x1={4} x2={212} y1={CY} y2={CY} stroke="var(--fg)" strokeWidth={0.8} />
          <line y1={4} y2={196} x1={CX} x2={CX} stroke="var(--fg)" strokeWidth={0.8} />
          {SEEDS.map((p, i) => {
            const pts = orbit(p, span[0], span[1]);
            return pts.length > 1 ? <polyline key={i} points={poly(pts)} fill="none" stroke="var(--c2)" strokeWidth={0.9} opacity={0.55} /> : null;
          })}
          <polygon points={poly(SHAPE)} fill="none" stroke="var(--muted)" strokeWidth={1.2} strokeDasharray="3 2.5" />
          <polygon points={poly(SHAPE.map((p) => ap(E, p)))} fill="var(--c1)" fillOpacity={0.22} stroke="var(--c1)" strokeWidth={1.8} />
          <polyline points={poly(orbit(mark, 0, t))} fill="none" stroke="var(--c5)" strokeWidth={2} />
          <circle cx={px(mark)[0]} cy={px(mark)[1]} r={2.6} fill="var(--muted)" />
          <circle cx={mp[0]} cy={mp[1]} r={4.2} fill="var(--c5)" stroke="var(--surface)" strokeWidth={1.2} />
        </g>
        <text x={6} y={205} fontSize="8.5" fill="var(--muted)">orbits of exp(sX) · p &nbsp;|&nbsp; view ±{RNG.toFixed(1)}</text>

        <g fontSize="9.5" fill="var(--fg)">
          <text x={222} y={16} fontWeight="bold" fill="var(--c2)">generator X</text>
          <text x={224} y={31}>[ {f2(X[0])}  {f2(X[1])} ]</text>
          <text x={224} y={43}>[ {f2(X[2])}  {f2(X[3])} ]</text>
          <text x={222} y={60} fontSize="8.5" fill="var(--muted)">tr X = {f2(trX)}</text>

          <text x={222} y={84} fontWeight="bold" fill="var(--c1)">exp(tX)</text>
          <text x={224} y={99}>[ {f2(E[0])}  {f2(E[1])} ]</text>
          <text x={224} y={111}>[ {f2(E[2])}  {f2(E[3])} ]</text>

          <text x={222} y={132} fontSize="9">t = {t.toFixed(2)}</text>
          <text x={222} y={146} fontSize="9" fill="var(--c3)">det = e^(t·trX)</text>
          <text x={222} y={158} fontSize="9" fill="var(--c3)">&nbsp; = {f2(Math.exp(t * trX))}</text>
          <text x={222} y={178} fontSize="8" fill="var(--muted)">exp(0·X) = I</text>
          <text x={222} y={189} fontSize="8" fill="var(--muted)">exp(sX)exp(tX)</text>
          <text x={222} y={199} fontSize="8" fill="var(--muted)">&nbsp;= exp((s+t)X)</text>
        </g>
      </Stage>
      <div className="w-muted" style={{ fontSize: '0.8rem', marginTop: '0.1rem' }}>{note}</div>
      <Controls>
        <PlayPause running={run} set={setRun} />
        <Slider label="t" value={t} min={-tMax} max={tMax} step={0.01} onChange={(v) => { setRun(false); setT(v); }} />
      </Controls>
      <Controls>
        {buttons.map((k) => <Btn key={k} active={g === k} onClick={() => setG(k)}>{GENS[k].label}</Btn>)}
      </Controls>
    </div>
  );
}
