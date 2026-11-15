import { useMemo, useState } from 'react';
import { Btn, Controls, Slider, Stage, pathOf, rng, scale } from './_kit';

/**
 * Empirical convergence test for SDE solvers on geometric Brownian motion
 *   dX = μX dt + σX dW,  X₀ = 1,  T = 1,
 * whose exact solution X_T = exp((μ − σ²/2)T + σW_T) is known, so the error can be measured.
 * Every path is generated once on a fine grid of 2048 Brownian increments; each coarse grid of
 * N = 2^j steps sums blocks of those SAME increments, so solver and exact solution are driven by one
 * Brownian path (this is what makes a *strong* error meaningful).
 * mode 'strong' (default): log–log plot of E|X_T − X_T^Δ| against Δt, for Euler–Maruyama and Milstein,
 *   with reference slopes ½ and 1. Fitted slopes are printed.
 * mode 'weak': log–log plot of |mean(X_T^Δ) − mean(X_T)| against Δt (Euler–Maruyama), reference slope 1. The
 *   exact and numerical means use the SAME paths (common random numbers), which removes most Monte-Carlo noise.
 *   The dashed curve is 2 standard errors of the paired difference; where the error meets it, the
 *   measurement stops meaning anything.
 * props: { mode?: 'strong' | 'weak' (default 'strong'), mu?: number (default 1), sigma?: number (default 0.5),
 *          M?: number (paths, 100–2000, default 600), seed?: number (default 5) }
 */
export default function MathSdeConvergence({ mode = 'strong', mu: mu0 = 1, sigma: s0 = 0.5, M: M0 = 600, seed = 5 }: {
  mode?: 'strong' | 'weak'; mu?: number; sigma?: number; M?: number; seed?: number;
}) {
  const [mu, setMu] = useState(mu0);
  const [sigma, setSigma] = useState(s0);
  const [M, setM] = useState(Math.max(100, Math.min(2000, M0)));
  const [sd, setSd] = useState(seed);
  const [view, setView] = useState<'strong' | 'weak'>(mode);

  const FINE = 2048, T = 1;
  const levels = [4, 5, 6, 7, 8, 9]; // N = 2^j coarse steps

  const res = useMemo(() => {
    const R = rng(sd * 97 + 13);
    const dtf = T / FINE;
    const sqf = Math.sqrt(dtf);
    const sumAbsEM = levels.map(() => 0), sumAbsMil = levels.map(() => 0);
    const sumEM = levels.map(() => 0);
    let sumExact = 0;
    const sumD = levels.map(() => 0), sumD2 = levels.map(() => 0);
    const inc = new Float64Array(FINE);
    for (let p = 0; p < M; p++) {
      let W = 0;
      for (let i = 0; i < FINE; i++) { const d = sqf * R.normal(); inc[i] = d; W += d; }
      const exact = Math.exp((mu - sigma * sigma / 2) * T + sigma * W);
      sumExact += exact;
      levels.forEach((j, li) => {
        const N = 2 ** j, R0 = FINE / N, dt = T / N;
        let xe = 1, xm = 1, idx = 0;
        for (let n = 0; n < N; n++) {
          let dW = 0;
          for (let r = 0; r < R0; r++) dW += inc[idx++];
          xe = xe + mu * xe * dt + sigma * xe * dW;
          xm = xm + mu * xm * dt + sigma * xm * dW + 0.5 * sigma * sigma * xm * (dW * dW - dt);
        }
        sumAbsEM[li] += Math.abs(xe - exact);
        sumAbsMil[li] += Math.abs(xm - exact);
        sumEM[li] += xe;
        sumD[li] += xe - exact; sumD2[li] += (xe - exact) ** 2;
      });
    }
    const meanExact = sumExact / M;
    const floors = levels.map((_, li) => 2 * Math.sqrt(Math.max(0, sumD2[li] / M - (sumD[li] / M) ** 2)) / Math.sqrt(M));
    return {
      dts: levels.map((j) => T / 2 ** j),
      em: sumAbsEM.map((s) => s / M),
      mil: sumAbsMil.map((s) => s / M),
      weak: sumEM.map((s) => Math.abs(s / M - meanExact)),
      floors,
    };
  }, [mu, sigma, M, sd]);

  const fit = (ys: number[]) => {
    const xs = res.dts.map((d) => Math.log10(d));
    const ls = ys.map((y) => Math.log10(Math.max(y, 1e-12)));
    const mx = xs.reduce((a, b) => a + b, 0) / xs.length, my = ls.reduce((a, b) => a + b, 0) / ls.length;
    let num = 0, den = 0;
    xs.forEach((x, i) => { num += (x - mx) * (ls[i] - my); den += (x - mx) ** 2; });
    return num / den;
  };

  const series = view === 'strong'
    ? [{ name: 'Euler–Maruyama', short: 'E–M', ys: res.em, c: 'var(--c2)' }, { name: 'Milstein', short: 'Milstein', ys: res.mil, c: 'var(--c3)' }]
    : [{ name: 'Euler–Maruyama (weak)', short: 'E–M', ys: res.weak, c: 'var(--c2)' }];

  const box: [number, number, number, number] = [32, 12, 236, 160];
  const xr: [number, number] = [Math.log10(res.dts[res.dts.length - 1]) - 0.2, Math.log10(res.dts[0]) + 0.2];
  const all = series.flatMap((s) => s.ys).filter((v) => v > 0).map((v) => Math.log10(v));
  if (all.length === 0) all.push(-3, -1);
  const lo = Math.min(...all, ...res.floors.map((f) => Math.log10(Math.max(f, 1e-6)))) - 0.4;
  const hi = Math.max(...all) + 0.3;
  const sx = scale(xr, [box[0], box[2]]);
  const sy = scale([lo, hi], [box[3], box[1]]);
  const clamp = (v: number) => Math.max(box[1], Math.min(box[3], sy(v)));

  const refLine = (slope: number, anchorY: number) => {
    const x0 = xr[0], x1 = xr[1];
    return pathOf([[sx(x0), clamp(anchorY + slope * (x0 - x1))], [sx(x1), clamp(anchorY)]]);
  };
  const topY = hi - 0.15;

  return (
    <div>
      <Stage w={320} h={200} label="Log-log convergence plot for SDE solvers">
        <rect x={box[0]} y={box[1]} width={box[2] - box[0]} height={box[3] - box[1]} fill="none" stroke="var(--grid)" />
        {res.dts.map((d) => (
          <line key={d} x1={sx(Math.log10(d))} x2={sx(Math.log10(d))} y1={box[1]} y2={box[3]} stroke="var(--grid)" strokeWidth={0.4} />
        ))}
        <path d={refLine(0.5, topY)} stroke="var(--muted)" strokeWidth={0.9} strokeDasharray="3 2" fill="none" />
        <path d={refLine(1, topY - 0.25)} stroke="var(--muted)" strokeWidth={0.9} strokeDasharray="1 2" fill="none" />
        <text x={box[2] - 2} y={clamp(topY) - 2} fontSize="7.5" textAnchor="end" fill="var(--muted)">slope ½</text>
        <text x={box[2] - 2} y={clamp(topY - 0.25) + 8} fontSize="7.5" textAnchor="end" fill="var(--muted)">slope 1</text>
        {view === 'weak' && (
          <>
            <path d={pathOf(res.dts.map((d, i) => [sx(Math.log10(d)), clamp(Math.log10(Math.max(res.floors[i], 1e-12)))]))} stroke="var(--c5)" strokeWidth={0.9} strokeDasharray="2 2" fill="none" />
            <text x={box[0] + 2} y={box[3] - 3} fontSize="7.5" fill="var(--c5)">dashed: Monte-Carlo noise (2 s.e.)</text>
          </>
        )}
        {series.map((s) => (
          <g key={s.name}>
            <path d={pathOf(res.dts.map((d, i) => [sx(Math.log10(d)), clamp(Math.log10(Math.max(s.ys[i], 1e-12)))]))} stroke={s.c} strokeWidth={1.3} fill="none" />
            {res.dts.map((d, i) => (
              <circle key={d} cx={sx(Math.log10(d))} cy={clamp(Math.log10(Math.max(s.ys[i], 1e-12)))} r={2} fill={s.c} />
            ))}
          </g>
        ))}
        <text x={box[0]} y={box[3] + 10} fontSize="8" fill="var(--muted)">log₁₀ Δt →</text>
        <text x={box[0] + 2} y={box[1] + 8} fontSize="8" fill="var(--muted)">log₁₀ error</text>
        {series.map((s, i) => (
          <g key={s.name}>
            <line x1={244} x2={254} y1={18 + i * 28} y2={18 + i * 28} stroke={s.c} strokeWidth={2} />
            <text x={258} y={21 + i * 28} fontSize="7.5" fill="var(--fg)">{s.short}</text>
            <text x={244} y={33 + i * 28} fontSize="7.5" fill="var(--muted)">slope {fit(s.ys).toFixed(2)}</text>
          </g>
        ))}
        <text x={box[0]} y={182} fontSize="8.5" fill="var(--fg)">
          {view === 'strong' ? 'strong error E|X_T − X_T^Δ|' : 'weak error |E X_T − E X_T^Δ|'} · {M} paths
        </text>
        <text x={box[0]} y={193} fontSize="8.5" fill="var(--muted)">dX = μX dt + σX dW, X₀ = 1, T = 1</text>
      </Stage>
      <Controls>
        <Btn active={view === 'strong'} onClick={() => setView('strong')}>Strong</Btn>
        <Btn active={view === 'weak'} onClick={() => setView('weak')}>Weak</Btn>
        <Slider label="μ" min={-1} max={2} step={0.1} value={mu} onChange={setMu} />
        <Slider label="σ" min={0.1} max={1.2} step={0.05} value={sigma} onChange={setSigma} />
        <Slider label="paths" min={100} max={2000} step={100} value={M} onChange={setM} format={(v) => String(v)} />
        <Btn onClick={() => setSd((v) => v + 1)}>New noise</Btn>
      </Controls>
    </div>
  );
}
