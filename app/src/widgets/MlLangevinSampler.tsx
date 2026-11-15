import { useEffect, useMemo, useRef, useState } from 'react';
import { Btn, C, Controls, PlayPause, Slider, Stage, pathOf, prefersReducedMotion, rng, scale, useFrame } from './_kit';

/**
 * Four MCMC samplers walking the same 2-D "banana" target, so you can watch step size trade
 * mixing against accuracy — and watch unadjusted Langevin converge to the WRONG distribution.
 *
 * Target: x₁ ~ N(0, 2²),  x₂ | x₁ ~ N(0.25(x₁² − 4), 1), i.e.
 *   U(x) = x₁²/8 + (x₂ − m)²/2 with m = 0.25(x₁² − 4),  ∇U = ( x₁/4 − 0.5x₁r ,  r ), r = x₂ − m.
 * Because the target factorizes we can draw EXACT samples (the faint grey cloud) for comparison.
 *
 * Samplers (ε = step size):
 *   rw    random-walk Metropolis:  x' = x + εη,                       MH accept
 *   ula   unadjusted Langevin:     x' = x − (ε²/2)∇U(x) + εη,         always accept  → biased
 *   mala  Metropolis-adjusted Langevin: same proposal + MH accept      → exact
 *   hmc   Hamiltonian Monte Carlo: `leap` leapfrog steps of size ε + MH accept
 *
 * The readout tracks the chain's running estimate of E[x₁²], whose true value is exactly 4. ULA's
 * estimate drifts above 4 as ε grows (for a Gaussian it inflates the variance by 1/(1 − ε²/4σ²));
 * the adjusted samplers stay near 4 but their acceptance rate falls instead.
 *
 * props: {
 *   method?: 'rw'|'ula'|'mala'|'hmc'  initial sampler (default 'ula')
 *   eps?: number        initial step size ε, 0.1–3 (default 1.2)
 *   leap?: number       leapfrog steps for HMC (default 12)
 *   trail?: number      how many recent states to draw (default 150)
 *   rate?: number       chain steps per second (default 22)
 *   seed?: number       PRNG seed (default 5)
 * }
 */
type Method = 'rw' | 'ula' | 'mala' | 'hmc';
const L = 26, T = 12, R = 312, Bm = 164;
const XR: [number, number] = [-6.5, 6.5];
const YR: [number, number] = [-5, 9.5];
const sx = scale(XR, [L, R]);
const sy = scale(YR, [Bm, T]);

const mOf = (x1: number) => 0.25 * (x1 * x1 - 4);
const U = (x: number[]) => {
  const r = x[1] - mOf(x[0]);
  return (x[0] * x[0]) / 8 + (r * r) / 2;
};
const gradU = (x: number[]) => {
  const r = x[1] - mOf(x[0]);
  return [x[0] / 4 - 0.5 * x[0] * r, r];
};

interface Chain { pts: [number, number][]; x: number[]; n: number; acc: number; s1: number }
const fresh = (): Chain => ({ pts: [[0, -1]], x: [0, -1], n: 0, acc: 0, s1: 0 });

export default function MlLangevinSampler({
  method: m0 = 'ula', eps: e0 = 1.2, leap = 12, trail = 150, rate = 22, seed = 5,
}: {
  method?: Method; eps?: number; leap?: number; trail?: number; rate?: number; seed?: number;
}) {
  const [method, setMethod] = useState<Method>(m0);
  const [eps, setEps] = useState(e0);
  const [running, setRunning] = useState(!prefersReducedMotion());
  const [chain, setChain] = useState<Chain>(fresh);
  const r = useRef(rng(seed));
  const carry = useRef(0);

  useEffect(() => { r.current = rng(seed); carry.current = 0; setChain(fresh()); }, [method, eps, seed]);

  const cloud = useMemo(() => {
    const q = rng(seed * 31 + 7);
    return Array.from({ length: 420 }, () => {
      const a = 2 * q.normal();
      return [a, mOf(a) + q.normal()] as [number, number];
    });
  }, [seed]);

  const step = (c: Chain): Chain => {
    const g = r.current;
    let { x } = c;
    let accepted = 0;
    if (method === 'hmc') {
      const p0 = [g.normal(), g.normal()];
      let q = [x[0], x[1]], p = [p0[0], p0[1]];
      let gr = gradU(q);
      for (let i = 0; i < leap; i++) {
        p = [p[0] - (eps / 2) * gr[0], p[1] - (eps / 2) * gr[1]];
        q = [q[0] + eps * p[0], q[1] + eps * p[1]];
        gr = gradU(q);
        p = [p[0] - (eps / 2) * gr[0], p[1] - (eps / 2) * gr[1]];
      }
      const H0 = U(x) + (p0[0] ** 2 + p0[1] ** 2) / 2;
      const H1 = U(q) + (p[0] ** 2 + p[1] ** 2) / 2;
      if (Number.isFinite(H1) && g.u() < Math.exp(H0 - H1)) { x = q; accepted = 1; }
    } else if (method === 'rw') {
      const y = [x[0] + eps * g.normal(), x[1] + eps * g.normal()];
      if (g.u() < Math.exp(U(x) - U(y))) { x = y; accepted = 1; }
    } else {
      const gx = gradU(x);
      const y = [x[0] - (eps * eps / 2) * gx[0] + eps * g.normal(), x[1] - (eps * eps / 2) * gx[1] + eps * g.normal()];
      if (method === 'ula') { x = y; accepted = 1; }
      else {
        const gy = gradU(y);
        const lq = (a: number[], b: number[], gb: number[]) => {
          // log q(a | b) up to the shared constant
          let s = 0;
          for (let i = 0; i < 2; i++) { const d = a[i] - b[i] + (eps * eps / 2) * gb[i]; s += -(d * d) / (2 * eps * eps); }
          return s;
        };
        const logA = U(x) - U(y) + lq(x, y, gy) - lq(y, x, gx);
        if (Number.isFinite(logA) && g.u() < Math.exp(logA)) { x = y; accepted = 1; }
      }
    }
    // ULA with ε above twice the smallest scale of the target diverges outright; park the chain
    // back at the origin rather than plotting NaNs, and keep counting steps honestly.
    if (!Number.isFinite(x[0]) || !Number.isFinite(x[1]) || Math.abs(x[0]) > 40 || Math.abs(x[1]) > 60) x = [0, -1];
    const pts = [...c.pts, [x[0], x[1]] as [number, number]];
    if (pts.length > trail) pts.splice(0, pts.length - trail);
    return { pts, x, n: c.n + 1, acc: c.acc + accepted, s1: c.s1 + x[0] * x[0] };
  };

  useFrame((dt) => {
    carry.current += dt * rate;
    const k = Math.min(8, Math.floor(carry.current));
    if (k <= 0) return;
    carry.current -= k;
    setChain((c) => { let out = c; for (let i = 0; i < k; i++) out = step(out); return out; });
  }, running);

  const path = pathOf(chain.pts.map(([a, b]) => [sx(a), sy(b)] as [number, number]));
  const est = chain.n ? chain.s1 / chain.n : 0;
  const accRate = chain.n ? chain.acc / chain.n : 0;
  const bias = est - 4;
  const names: Record<Method, string> = { rw: 'random-walk MH', ula: 'ULA (no correction)', mala: 'MALA', hmc: `HMC (L=${leap})` };

  return (
    <div>
      <Stage w={320} h={222} label="MCMC chain exploring a banana-shaped target">
        <rect x={L} y={T} width={R - L} height={Bm - T} fill="none" stroke="var(--grid)" strokeWidth={0.6} />
        {cloud.map(([a, b], i) => <circle key={i} cx={sx(a)} cy={sy(b)} r={1.1} fill="var(--muted)" opacity={0.3} />)}
        <path d={path} fill="none" stroke={C[1]} strokeWidth={0.8} opacity={0.75} />
        {chain.pts.map(([a, b], i) => <circle key={i} cx={sx(a)} cy={sy(b)} r={1.2} fill={C[1]} opacity={0.3 + (0.7 * i) / chain.pts.length} />)}
        <circle cx={sx(chain.x[0])} cy={sy(chain.x[1])} r={3.2} fill={C[2]} stroke="var(--fg)" strokeWidth={0.7} />
        <text x={L + 3} y={T + 9} fontSize="8" fill="var(--muted)">grey cloud = exact samples from the target</text>
        <text x={L} y={Bm + 10} fontSize="8" fill="var(--fg)">{names[method]}, ε = {eps.toFixed(2)}</text>
        <text x={R} y={Bm + 10} fontSize="8" fill="var(--muted)" textAnchor="end">
          {chain.n} steps · accept {(100 * accRate).toFixed(0)}%
        </text>
        <text x={L} y={Bm + 23} fontSize="8.5" fill="var(--fg)">
          chain estimate of E[x₁²]: <tspan fill={Math.abs(bias) > 0.6 ? C[4] : C[0]}>{est.toFixed(2)}</tspan>
          <tspan fill="var(--muted)">  (true value 4.00)</tspan>
        </text>
        <text x={L} y={Bm + 34} fontSize="8" fill="var(--muted)">
          {method === 'ula'
            ? 'No accept/reject step: the bias grows with ε and never averages away.'
            : 'Metropolis correction: exact in the limit, but ε too large means rejections.'}
        </text>
        <text x={L} y={Bm + 45} fontSize="8" fill="var(--muted)">
          {chain.n < 400 ? 'Let it run — a short chain is noisy even when the sampler is exact.' : ''}
        </text>
      </Stage>
      <Controls>
        <PlayPause running={running} set={setRunning} />
        {(['rw', 'ula', 'mala', 'hmc'] as Method[]).map((m) => (
          <Btn key={m} onClick={() => setMethod(m)} active={method === m}>{m.toUpperCase()}</Btn>
        ))}
        <Slider label="ε" value={eps} min={0.1} max={1.9} step={0.05} onChange={setEps} />
        <Btn onClick={() => { r.current = rng(seed); setChain(fresh()); }}>Reset</Btn>
      </Controls>
    </div>
  );
}
