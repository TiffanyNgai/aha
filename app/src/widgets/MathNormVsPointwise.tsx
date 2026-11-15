import { useMemo, useState } from 'react';
import { Axes, Btn, Controls, PlayPause, Slider, Stage, pathOf, prefersReducedMotion, scale, useFrame } from './_kit';

type Mode = 'fourier' | 'typewriter';
/**
 * Convergence in the L²(0,1) norm does not imply pointwise convergence.
 *   'fourier':    gₖ = Sₖ, the partial sum of the expansion of the square wave f (= 1 on (0,½), −1 on (½,1))
 *                 in the orthonormal basis e_n(x) = √2 sin(nπx). ‖f − Sₖ‖₂ → 0, but the overshoot next to
 *                 the jump never shrinks (Gibbs), so sup|f − Sₖ| does NOT go to 0, and at the jump itself
 *                 Sₖ(½) = 0 ≠ ±1 for every k.
 *   'typewriter': gₖ is the indicator of a sliding interval of width 1/m marching across (0,1)
 *                 (k enumerates the pairs m = 1, 2, 3, …, j = 0 … m−1). ‖gₖ‖₂ = 1/√m → 0, yet at EVERY x
 *                 the values gₖ(x) are 1 infinitely often and 0 infinitely often: no pointwise limit anywhere.
 * Top: target f (grey) and gₖ (blue). Bottom left: the error norm against k. Bottom right: the value gₖ(x₀)
 * at a probe point x₀ you can move.
 * props: { mode?: 'fourier' | 'typewriter' (default 'fourier'), k?: initial index (default 4),
 *          kMax?: number (6–60, default 30), x0?: probe point in (0,1) (default 0.5),
 *          speed?: indices per second when playing (default 1.4), switchable?: boolean (default true) }
 */
const SQ = (x: number) => (x < 0.5 ? 1 : -1);
// typewriter index k = 1,2,3,… ↦ (m, j) with m ≥ 1, 0 ≤ j < m
const tw = (k: number) => { let m = 1, i = k; while (i > m) { i -= m; m += 1; } return { m, j: i - 1 }; };

export default function MathNormVsPointwise({ mode = 'fourier', k = 4, kMax = 30, x0 = 0.5, speed = 1.4, switchable = true }: {
  mode?: Mode; k?: number; kMax?: number; x0?: number; speed?: number; switchable?: boolean;
}) {
  const K = Math.max(6, Math.min(60, Math.round(kMax)));
  const [md, setMd] = useState<Mode>(mode);
  const [idx, setIdx] = useState(Math.max(1, Math.min(K, Math.round(k))));
  const [p, setP] = useState(Math.min(0.99, Math.max(0.01, x0)));
  const [running, setRunning] = useState(false);
  useFrame((dt) => setIdx((v) => (v + dt * speed > K + 0.5 ? 1 : v + dt * speed)), running && !prefersReducedMotion());
  const n = Math.max(1, Math.round(idx));

  // Fourier coefficients of the square wave against e_q(x) = √2 sin(qπx): ⟨f, e_q⟩ = √2 (1 − 2cos(qπ/2) + (−1)^q)/(qπ)
  const cf = useMemo(() => Array.from({ length: K }, (_, i) => {
    const q = i + 1;
    return (Math.SQRT2 * (1 - 2 * Math.cos((q * Math.PI) / 2) + (q % 2 ? -1 : 1))) / (q * Math.PI);
  }), [K]);
  const partial = (q: number, x: number) => { let s = 0; for (let i = 1; i <= q; i++) s += cf[i - 1] * Math.SQRT2 * Math.sin(i * Math.PI * x); return s; };

  const target = md === 'fourier' ? SQ : () => 0;
  const gk = (q: number, x: number) => {
    if (md === 'fourier') return partial(q, x);
    const { m, j } = tw(q);
    return x >= j / m && x < (j + 1) / m ? 1 : 0;
  };
  // ‖f − g_q‖₂: exact tail sum for Fourier (Parseval), exact 1/√m for the typewriter
  const errOf = (q: number) => {
    if (md === 'typewriter') return 1 / Math.sqrt(tw(q).m);
    let s = 0; for (let i = q + 1; i <= 4000; i++) {
      const c = (Math.SQRT2 * (1 - 2 * Math.cos((i * Math.PI) / 2) + (i % 2 ? -1 : 1))) / (i * Math.PI);
      s += c * c;
    }
    return Math.sqrt(Math.max(0, s));
  };
  const err = errOf(n);
  // sampled sup-norm error
  let sup = 0;
  for (let i = 0; i <= 2000; i++) { const x = i / 2000; sup = Math.max(sup, Math.abs(gk(n, x) - target(x))); }

  const y: [number, number] = md === 'fourier' ? [-1.6, 1.6] : [-0.35, 1.45];
  const box: [number, number, number, number] = [28, 8, 312, 104];
  const sx = scale([0, 1], [box[0], box[2]]), sy = scale(y, [box[3], box[1]]);
  const draw = (h: (x: number) => number, jumpAt?: number) => {
    const segs: [number, number][][] = [[]];
    for (let i = 0; i <= 600; i++) {
      const x = i / 600;
      if (jumpAt !== undefined && Math.abs(x - jumpAt) < 1 / 1200) { segs.push([]); continue; }
      segs[segs.length - 1].push([sx(x), sy(Math.max(y[0], Math.min(y[1], h(x))))]);
    }
    return segs.filter((s) => s.length > 1).map(pathOf).join(' ');
  };
  const twJumps = md === 'typewriter' ? [tw(n).j / tw(n).m, (tw(n).j + 1) / tw(n).m] : [];

  // mini panels
  const mx = scale([1, K], [140, 182]), my = scale([0, 1.25], [196, 150]);
  const px = scale([1, K], [245, 308]);

  return (
    <div>
      <Stage w={320} h={212} label="Norm convergence without pointwise convergence">
        <Axes x={[0, 1]} y={y} box={box} xLabel="x" />
        {md === 'fourier'
          ? <path d={draw(SQ, 0.5)} fill="none" stroke="var(--muted)" strokeWidth={2} />
          : <line x1={box[0]} x2={box[2]} y1={sy(0)} y2={sy(0)} stroke="var(--muted)" strokeWidth={2} />}
        <path d={draw((x) => gk(n, x), twJumps[0])} fill="none" stroke="var(--c2)" strokeWidth={1.8} />
        {md === 'typewriter' && twJumps.map((v, i) => (
          <line key={i} x1={sx(v)} x2={sx(v)} y1={sy(0)} y2={sy(1)} stroke="var(--c2)" strokeWidth={1.8} />
        ))}
        <line x1={sx(p)} x2={sx(p)} y1={box[1]} y2={box[3]} stroke="var(--c4)" strokeWidth={0.8} strokeDasharray="2 2" />
        <circle cx={sx(p)} cy={sy(Math.max(y[0], Math.min(y[1], gk(n, p))))} r={2.6} fill="var(--c4)" />
        <text x={box[0] + 2} y={box[1] + 8} fontSize="8" fill="var(--c2)">
          {md === 'fourier' ? `S_${n}` : `g_${n}  (m = ${tw(n).m}, j = ${tw(n).j})`}
        </text>

        <text x={14} y={128} fontSize="8.5" fill="var(--fg)">‖f − g‖₂ = {err.toFixed(3)}</text>
        <text x={14} y={139} fontSize="8.5" fill="var(--c5)">sup |f − g| = {sup.toFixed(3)}</text>
        <text x={14} y={150} fontSize="8.5" fill="var(--c4)">g(x₀) = {gk(n, p).toFixed(3)}</text>

        <text x={140} y={146} fontSize="7.5" fill="var(--muted)">‖f − g_k‖₂ vs k</text>
        <line x1={140} x2={182} y1={196} y2={196} stroke="var(--grid)" strokeWidth={0.6} />
        {Array.from({ length: K }, (_, i) => i + 1).map((q) => (
          <circle key={q} cx={mx(q)} cy={my(Math.min(1.25, errOf(q)))} r={q === n ? 2 : 1.1}
            fill={q === n ? 'var(--c5)' : 'var(--c2)'} opacity={q === n ? 1 : 0.55} />
        ))}
        <text x={245} y={146} fontSize="7.5" fill="var(--muted)">g_k(x₀) vs k</text>
        <line x1={245} x2={308} y1={196} y2={196} stroke="var(--grid)" strokeWidth={0.6} />
        {Array.from({ length: K }, (_, i) => i + 1).map((q) => (
          <circle key={q} cx={px(q)} cy={scale([-1.3, 1.3], [200, 148])(Math.max(-1.3, Math.min(1.3, gk(q, p))))}
            r={q === n ? 2 : 1.1} fill={q === n ? 'var(--c5)' : 'var(--c4)'} opacity={q === n ? 1 : 0.55} />
        ))}
        <text x={320} y={208} textAnchor="end" fontSize="7" fill="var(--muted)">k = 1…{K}</text>
      </Stage>
      <Controls>
        {switchable && (
          <>
            <Btn active={md === 'fourier'} onClick={() => { setMd('fourier'); setIdx(4); }}>Fourier sums</Btn>
            <Btn active={md === 'typewriter'} onClick={() => { setMd('typewriter'); setIdx(4); }}>typewriter</Btn>
          </>
        )}
        <PlayPause running={running} set={setRunning} />
        <Slider label="k" value={n} min={1} max={K} step={1} onChange={(v) => { setRunning(false); setIdx(v); }} format={(v) => String(v)} />
        <Slider label="probe x₀" value={p} min={0.01} max={0.99} step={0.01} onChange={setP} />
      </Controls>
    </div>
  );
}
