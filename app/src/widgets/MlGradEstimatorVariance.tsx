import { useMemo, useState } from 'react';
import { Btn, C, Controls, Slider, Stage, rng } from './_kit';

/**
 * Score-function (REINFORCE) vs reparameterization (pathwise) gradient estimators, on a toy problem
 * where every quantity is known in closed form.
 *
 * q_φ(z) = N(μ, σ²) with σ held fixed, f(z) = (z − c)². Writing d = μ − c,
 *   L(μ) = E_q[f] = d² + σ²,   exact gradient dL/dμ = 2d.
 *   pathwise:       ĝ = 2(μ + σε − c) = 2(d + σε)        Var = 4σ²
 *   score function: ĝ = (f(z) − b)·(z − μ)/σ² = (f − b)·ε/σ
 *                      b = 0:          Var = d⁴/σ² + 14d² + 15σ²
 *                      b = E[f] = d²+σ²: Var = 8d² + 10σ²
 * Both are exactly unbiased; only the spread differs, and it differs by orders of magnitude.
 * The widget draws `trials` independent K-sample estimates of each and histograms them on a SHARED
 * count scale against the exact gradient (dashed line), printing empirical and exact standard errors.
 *
 * props: {
 *   d?: number          initial μ − c, 0–4 (default 2)
 *   sigma?: number      initial σ, 0.3–2 (default 1)
 *   k?: number          initial number of samples per estimate K (default 1)
 *   baseline?: boolean  start with the mean baseline b = E[f] subtracted (default false)
 *   trials?: number     how many independent estimates to histogram (default 600)
 *   seed?: number       PRNG seed (default 11)
 * }
 */
const L = 30, T = 16, R = 312, B = 138;
const BINS = 49;

export default function MlGradEstimatorVariance({
  d: d0 = 2, sigma: s0 = 1, k: k0 = 1, baseline: b0 = false, trials = 600, seed = 11,
}: {
  d?: number; sigma?: number; k?: number; baseline?: boolean; trials?: number; seed?: number;
}) {
  const [d, setD] = useState(d0);
  const [sig, setSig] = useState(s0);
  const [K, setK] = useState(Math.max(1, Math.round(k0)));
  const [base, setBase] = useState(b0);
  const [nonce, setNonce] = useState(0);

  const exact = 2 * d;
  const varRp = (4 * sig * sig) / K;
  const varSf = (base ? 8 * d * d + 10 * sig * sig : (d ** 4) / (sig * sig) + 14 * d * d + 15 * sig * sig) / K;
  const sdRp = Math.sqrt(varRp), sdSf = Math.sqrt(varSf);

  const { rp, sf, mRp, mSf, eRp, eSf } = useMemo(() => {
    const r = rng(seed + nonce * 7919 + Math.round(d * 97) * 31 + Math.round(sig * 97) * 17 + K * 101 + (base ? 5 : 0));
    const b = base ? d * d + sig * sig : 0;
    const a: number[] = [], c: number[] = [];
    for (let t = 0; t < trials; t++) {
      let gp = 0, gs = 0;
      for (let i = 0; i < K; i++) {
        const e = r.normal();
        const z = d + sig * e;              // z − c
        gp += 2 * z;                        // pathwise
        gs += ((z * z - b) * e) / sig;      // score function
      }
      a.push(gp / K); c.push(gs / K);
    }
    const mean = (v: number[]) => v.reduce((p, q) => p + q, 0) / v.length;
    const sd = (v: number[], m: number) => Math.sqrt(v.reduce((p, q) => p + (q - m) ** 2, 0) / (v.length - 1));
    const m1 = mean(a), m2 = mean(c);
    return { rp: a, sf: c, mRp: m1, mSf: m2, eRp: sd(a, m1), eSf: sd(c, m2) };
  }, [d, sig, K, base, trials, seed, nonce]);

  const half = Math.max(3.1 * sdSf, 6 * sdRp, 0.5);
  const lo = exact - half, hi = exact + half;
  const bin = (v: number[]) => {
    const h = new Array(BINS).fill(0);
    for (const x of v) {
      let i = Math.floor(((x - lo) / (hi - lo)) * BINS);
      i = Math.max(0, Math.min(BINS - 1, i));
      h[i]++;
    }
    return h as number[];
  };
  const hRp = bin(rp), hSf = bin(sf);
  const top = Math.max(...hRp, ...hSf, 1);
  const px = (x: number) => L + ((x - lo) / (hi - lo)) * (R - L);
  const bw = (R - L) / BINS;
  const py = (n: number) => B - (n / top) * (B - T);

  const bars = (h: number[], col: string, op: number) =>
    h.map((n, i) => (n > 0 ? (
      <rect key={i} x={L + i * bw} y={py(n)} width={Math.max(0.7, bw - 0.3)} height={B - py(n)} fill={col} opacity={op} />
    ) : null));

  const fmt = (v: number) => (v >= 100 ? v.toFixed(0) : v >= 10 ? v.toFixed(1) : v.toFixed(2));

  return (
    <div>
      <Stage w={320} h={208} label="Histogram of score-function and reparameterization gradient estimates">
        <line x1={L} x2={R} y1={B} y2={B} stroke="var(--fg)" strokeWidth={0.8} />
        {bars(hSf, C[4], 0.55)}
        {bars(hRp, C[1], 0.8)}
        <line x1={px(exact)} x2={px(exact)} y1={T - 4} y2={B} stroke="var(--fg)" strokeWidth={1} strokeDasharray="3 2" />
        <text x={px(exact)} y={T - 6} fontSize="8" fill="var(--fg)" textAnchor="middle">exact ∇ = {exact.toFixed(1)}</text>
        <text x={L} y={B + 10} fontSize="7.5" fill="var(--muted)">{fmt(lo)}</text>
        <text x={R} y={B + 10} fontSize="7.5" fill="var(--muted)" textAnchor="end">{fmt(hi)}</text>
        <text x={(L + R) / 2} y={B + 10} fontSize="7.5" fill="var(--muted)" textAnchor="middle">gradient estimate</text>

        <rect x={L} y={B + 16} width={8} height={5} fill={C[1]} opacity={0.8} />
        <text x={L + 12} y={B + 21} fontSize="8" fill="var(--fg)">reparameterization</text>
        <text x={R} y={B + 21} fontSize="8" fill="var(--muted)" textAnchor="end">
          sd {fmt(eRp)} (exact {fmt(sdRp)}), mean {mRp.toFixed(2)}
        </text>
        <rect x={L} y={B + 28} width={8} height={5} fill={C[4]} opacity={0.55} />
        <text x={L + 12} y={B + 33} fontSize="8" fill="var(--fg)">score function</text>
        <text x={R} y={B + 33} fontSize="8" fill="var(--muted)" textAnchor="end">
          sd {fmt(eSf)} (exact {fmt(sdSf)}), mean {mSf.toFixed(2)}
        </text>
        <text x={L} y={B + 45} fontSize="8.5" fill="var(--c3)">
          standard deviation ratio: {fmt(sdSf / sdRp)}× worse{base ? ' (with baseline)' : ''}
        </text>
      </Stage>
      <Controls>
        <Slider label="μ − c" value={d} min={0} max={4} step={0.1} onChange={setD} />
        <Slider label="σ" value={sig} min={0.3} max={2} step={0.05} onChange={setSig} />
        <Slider label="K samples" value={K} min={1} max={32} step={1} onChange={(v) => setK(Math.round(v))} format={(v) => String(Math.round(v))} />
        <Btn onClick={() => setBase(!base)} active={base}>baseline</Btn>
        <Btn onClick={() => setNonce((n) => n + 1)}>Resample</Btn>
      </Controls>
    </div>
  );
}
