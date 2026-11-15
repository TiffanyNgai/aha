import { useMemo, useState } from 'react';
import { Axes, Btn, Controls, Slider, Stage, pathOf, scale } from './_kit';

type Target = 'step' | 'tent' | 'parabola';
/**
 * Best approximation in L²(0, 1). The target f (grey) is projected onto the subspace spanned by the first
 * N orthonormal functions e_k(x) = √2 sin(kπx): P_N f = Σ_{k≤N} ⟨f, e_k⟩ e_k (blue). The residual
 * r = f − g is drawn in red, and the bars show the coefficients ⟨f, e_k⟩ (kept ones solid).
 * The "detune c₁" slider multiplies the first coefficient by a factor, so you can check two things:
 *   (1) the L² error is smallest exactly at the projection (detune = 1), and
 *   (2) only there is the residual orthogonal to every kept basis function (max |⟨r, e_k⟩| drops to ≈ 0).
 * Integrals are midpoint sums with 2400 points, so the readouts are accurate to about 1e-3.
 * props: { target?: 'step' | 'tent' | 'parabola' (default 'step'), n?: number of modes kept (0–12, default 3),
 *          kMax?: number of coefficients computed (4–12, default 12), detune?: number (0–2, default 1),
 *          switchable?: boolean (show the target buttons, default true) }
 */
const F: Record<Target, (x: number) => number> = {
  step: (x) => (x < 0.5 ? 1 : 0),
  tent: (x) => 1 - Math.abs(2 * x - 1),
  parabola: (x) => 6 * x * (1 - x),
};
const NAME: Record<Target, string> = { step: 'step', tent: 'tent', parabola: 'parabola' };
const basis = (k: number, x: number) => Math.SQRT2 * Math.sin(k * Math.PI * x);
const QN = 2400;
const inner = (g: (x: number) => number, h: (x: number) => number) => {
  let s = 0;
  for (let i = 0; i < QN; i++) { const x = (i + 0.5) / QN; s += g(x) * h(x); }
  return s / QN;
};

export default function MathL2Projection({ target = 'step', n = 3, kMax = 12, detune = 1, switchable = true }: {
  target?: Target; n?: number; kMax?: number; detune?: number; switchable?: boolean;
}) {
  const K = Math.max(4, Math.min(12, Math.round(kMax)));
  const [tg, setTg] = useState<Target>(target);
  const [N, setN] = useState(Math.max(0, Math.min(K, Math.round(n))));
  const [d, setD] = useState(detune);
  const f = F[tg];
  const c = useMemo(() => Array.from({ length: K }, (_, i) => inner(F[tg], (x) => basis(i + 1, x))), [tg, K]);

  const coef = (k: number) => (k === 1 ? d * c[0] : c[k - 1]);
  const g = (x: number) => { let s = 0; for (let k = 1; k <= N; k++) s += coef(k) * basis(k, x); return s; };
  const r = (x: number) => f(x) - g(x);
  const err = Math.sqrt(Math.max(0, inner(r, r)));
  const best = useMemo(() => {
    const p = (x: number) => { let s = 0; for (let k = 1; k <= N; k++) s += c[k - 1] * basis(k, x); return s; };
    const q = (x: number) => f(x) - p(x);
    return Math.sqrt(Math.max(0, inner(q, q)));
  }, [tg, N, c]);
  let perp = 0;
  for (let k = 1; k <= N; k++) perp = Math.max(perp, Math.abs(inner(r, (x) => basis(k, x))));

  const y: [number, number] = [-0.7, 1.75];
  const box: [number, number, number, number] = [30, 8, 312, 128];
  const sx = scale([0, 1], [box[0], box[2]]), sy = scale(y, [box[3], box[1]]);
  const S = 400;
  const curve = (h: (x: number) => number, split = false) => {
    const segs: [number, number][][] = [[]];
    for (let i = 0; i <= S; i++) {
      const x = i / S; const v = h(x);
      if (split && Math.abs(x - 0.5) < 0.5 / S) { segs.push([]); continue; }
      segs[segs.length - 1].push([sx(x), sy(Math.max(y[0], Math.min(y[1], v)))]);
    }
    return segs.filter((s) => s.length > 1).map(pathOf).join(' ');
  };
  const bars = c.map((v, i) => {
    const w = 18, x0 = 34 + i * 23;
    const h = Math.min(34, Math.abs(v) * 42);
    return { x: x0, w, h, up: v >= 0, on: i < N, k: i + 1, v: i === 0 ? d * v : v };
  });

  return (
    <div>
      <Stage w={320} h={210} label="Best approximation of a function in L squared">
        <Axes x={[0, 1]} y={y} box={box} xLabel="x" />
        <path d={curve(f, tg === 'step')} fill="none" stroke="var(--muted)" strokeWidth={2.2} />
        <path d={curve(r)} fill="none" stroke="var(--c5)" strokeWidth={1} strokeDasharray="3 2" opacity={0.8} />
        <path d={curve(g)} fill="none" stroke="var(--c2)" strokeWidth={2} />
        <text x={box[2]} y={box[1] + 9} textAnchor="end" fontSize="8" fill="var(--muted)">f</text>
        <text x={box[2]} y={box[1] + 19} textAnchor="end" fontSize="8" fill="var(--c2)">g = Σ c_k e_k</text>
        <text x={box[2]} y={box[1] + 29} textAnchor="end" fontSize="8" fill="var(--c5)">residual f − g</text>
        <line x1={30} x2={312} y1={152} y2={152} stroke="var(--grid)" strokeWidth={0.6} />
        {bars.map((b) => (
          <g key={b.k}>
            <rect x={b.x} y={b.up ? 152 - b.h : 152} width={b.w} height={Math.max(0.6, b.h)}
              fill={b.on ? (b.up ? 'var(--c1)' : 'var(--c5)') : 'var(--grid)'} opacity={b.on ? 0.9 : 0.6} />
            <text x={b.x + b.w / 2} y={168} textAnchor="middle" fontSize="7" fill="var(--muted)">{b.k}</text>
          </g>
        ))}
        <text x={30} y={183} fontSize="8.5" fill="var(--fg)">
          ‖f − g‖ = {err.toFixed(4)}   (best possible with N = {N}: {best.toFixed(4)})
        </text>
        <text x={30} y={196} fontSize="8.5" fill={perp < 1e-3 ? 'var(--c1)' : 'var(--c5)'}>
          max&nbsp;|⟨f − g, e_k⟩|, k ≤ N: {perp.toFixed(4)} {perp < 1e-3 ? '→ residual ⟂ subspace' : '→ not orthogonal'}
        </text>
        <text x={30} y={207} fontSize="7.5" fill="var(--muted)">coefficients ⟨f, e_k⟩, k = 1…{K}</text>
      </Stage>
      <Controls>
        {switchable && (['step', 'tent', 'parabola'] as Target[]).map((t) => (
          <Btn key={t} active={tg === t} onClick={() => setTg(t)}>{NAME[t]}</Btn>
        ))}
        <Slider label="N modes kept" value={N} min={0} max={K} step={1} onChange={(v) => setN(Math.round(v))} format={(v) => String(v)} />
        <Slider label="detune c₁ ×" value={d} min={0} max={2} step={0.05} onChange={setD} />
        {d !== 1 && <Btn onClick={() => setD(1)}>reset c₁</Btn>}
      </Controls>
    </div>
  );
}
