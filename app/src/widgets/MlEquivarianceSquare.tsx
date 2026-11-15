/**
 * The equivariance square, tested on a small point cloud.
 * Four points carry a predicted vector per point (think: a force on each atom). Turn the rotation dial θ
 * and the widget draws, on the same rotated points, two sets of arrows:
 *   solid   f(R·x)   — rotate the input first, then run the model
 *   dashed  R·f(x)   — run the model first, then rotate its output
 * A model is equivariant exactly when the two agree for every θ, i.e. the square commutes.
 *   'relative' builds each output from relative positions, f_i = Σ_{j≠i} (x_i − x_j)·w(‖x_i − x_j‖)
 *              (the EGNN-style update): the arrows coincide at every angle.
 *   'raw'      feeds the coordinates to a generic linear layer, f_i = M x_i with a fixed non-rotational M:
 *              the two arrow sets drift apart as soon as θ ≠ 0.
 * The readout also prints Σ_{i<j}‖x_i − x_j‖, an invariant scalar: it never changes under rotation.
 * props: {
 *   model?: 'relative' | 'raw'  (default 'relative')
 *   theta?: number              initial rotation in degrees (default 40)
 *   showBoth?: boolean          show the model picker (default true)
 * }
 */
import { useState } from 'react';
import { Btn, Controls, Slider, Stage } from './_kit';

const PTS: [number, number][] = [[-1.25, -0.6], [0.35, -0.95], [1.15, 0.45], [-0.45, 1.05]];
const M: [number, number, number, number] = [0.5, -1.0, 0.8, 0.4]; // a generic linear map: not a rotation or scaling
const rot = (p: [number, number], a: number): [number, number] => [p[0] * Math.cos(a) - p[1] * Math.sin(a), p[0] * Math.sin(a) + p[1] * Math.cos(a)];

function predict(pts: [number, number][], model: string): [number, number][] {
  if (model === 'raw') return pts.map(([x, y]) => [M[0] * x + M[1] * y, M[2] * x + M[3] * y]);
  return pts.map((pi, i) => {
    let vx = 0, vy = 0;
    pts.forEach((pj, j) => {
      if (i === j) return;
      const dx = pi[0] - pj[0], dy = pi[1] - pj[1];
      const d = Math.hypot(dx, dy);
      const w = Math.exp(-d);              // a scalar function of the distance only
      vx += dx * w; vy += dy * w;
    });
    return [vx, vy] as [number, number];
  });
}

export default function MlEquivarianceSquare({ model = 'relative', theta = 40, showBoth = true }: {
  model?: string; theta?: number; showBoth?: boolean;
}) {
  const [m, setM] = useState(model === 'raw' ? 'raw' : 'relative');
  const [deg, setDeg] = useState(theta);
  const a = (deg * Math.PI) / 180;

  const rp = PTS.map((p) => rot(p, a));
  const fRx = predict(rp, m);                       // model applied to the rotated cloud
  const Rfx = predict(PTS, m).map((v) => rot(v, a)); // model applied first, output then rotated

  const S = 46, CX = 160, CY = 96, VS = 34;
  const px = (p: [number, number]) => [CX + S * p[0], CY - S * p[1]] as [number, number];
  const gap = Math.max(...fRx.map((v, i) => Math.hypot(v[0] - Rfx[i][0], v[1] - Rfx[i][1])));
  const inv = PTS.reduce((s, p, i) => s + PTS.slice(i + 1).reduce((t, q) => t + Math.hypot(p[0] - q[0], p[1] - q[1]), 0), 0);

  const arrow = (p: [number, number], v: [number, number], col: string, dash?: string) => {
    const [x, y] = px(p);
    return <line x1={x} y1={y} x2={x + VS * v[0]} y2={y - VS * v[1]} stroke={col} strokeWidth={1.6} strokeDasharray={dash} markerEnd={`url(#eqa-${dash ? 'd' : 's'})`} />;
  };

  return (
    <div>
      <Stage h={212} label="does rotating the input and rotating the output agree?">
        <defs>
          <marker id="eqa-s" viewBox="0 0 6 6" refX="5" refY="3" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="var(--c2)" /></marker>
          <marker id="eqa-d" viewBox="0 0 6 6" refX="5" refY="3" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="var(--c3)" /></marker>
        </defs>
        <circle cx={CX} cy={CY} r={S * 1.45} fill="none" stroke="var(--grid)" strokeWidth={0.6} strokeDasharray="3 3" />
        <line x1={CX} y1={CY} x2={CX + S * 1.45 * Math.cos(a)} y2={CY - S * 1.45 * Math.sin(a)} stroke="var(--grid)" strokeWidth={0.8} />
        {rp.map((p, i) => <g key={i}>{arrow(p, Rfx[i], 'var(--c3)', '3 2')}{arrow(p, fRx[i], 'var(--c2)')}</g>)}
        {rp.map((p, i) => { const [x, y] = px(p); return <circle key={i} cx={x} cy={y} r={5} fill="var(--surface)" stroke="var(--fg)" strokeWidth={1.2} />; })}
        <text x={6} y={14} fontSize="9" fill="var(--c2)">solid: f(R·x)</text>
        <text x={6} y={26} fontSize="9" fill="var(--c3)">dashed: R·f(x)</text>
        <text x={314} y={14} fontSize="9" textAnchor="end" fill="var(--fg)">θ = {deg.toFixed(0)}°</text>
        <text x={314} y={26} fontSize="8" textAnchor="end" fill="var(--muted)">{m === 'raw' ? 'f(x)ᵢ = M xᵢ' : 'fᵢ = Σⱼ (xᵢ−xⱼ)·w(dᵢⱼ)'}</text>
        <line x1={6} y1={180} x2={314} y2={180} stroke="var(--grid)" strokeWidth={0.6} />
        <text x={6} y={194} fontSize="9" fill={gap < 1e-9 ? 'var(--c1)' : 'var(--c5)'}>
          max‖f(R·x) − R·f(x)‖ = {gap < 1e-9 ? '0 — equivariant ✓' : gap.toFixed(3) + ' — not equivariant ✗'}
        </text>
        <text x={6} y={207} fontSize="8" fill="var(--muted)">invariant readout Σᵢ&lt;ⱼ ‖xᵢ − xⱼ‖ = {inv.toFixed(3)} at every θ</text>
      </Stage>
      <Controls>
        <Slider label="rotation θ" min={0} max={360} step={1} value={deg} onChange={setDeg} format={(v) => `${v.toFixed(0)}°`} />
        {showBoth && <>
          <Btn active={m === 'relative'} onClick={() => setM('relative')}>relative positions</Btn>
          <Btn active={m === 'raw'} onClick={() => setM('raw')}>raw coordinates</Btn>
        </>}
      </Controls>
    </div>
  );
}
