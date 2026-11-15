/**
 * The Deep Sets architecture f(X) = ρ(⊕_{x∈X} φ(x)), compared with a plain MLP on the ordered list.
 * A small set of numbers is shown as chips. Each chip is pushed through the same encoder
 * φ(x) = (x, x², tanh 2x) — three bars per chip — and the bars are pooled with sum, mean or max into one
 * vector, which the decoder ρ(u) = u₁ − 0.4·u₂ + 1.5·u₃ turns into the final scalar.
 * Press "shuffle" and watch: the chips move, the pooled vector does not, and the Deep Sets output is
 * unchanged — that is permutation invariance by construction. The grey baseline is an order-dependent
 * readout wᵀx with fixed weights w, which jumps around on every shuffle.
 * "duplicate first" copies one element: sum and max react differently from mean, which is the practical
 * difference between the aggregators (counting versus averaging).
 * props: {
 *   values?: number[]              set elements, 2–7 of them (default [0.4, -1.1, 1.6, 0.2, -0.5])
 *   agg?: 'sum' | 'mean' | 'max'   pooling operator (default 'sum')
 *   showBaseline?: boolean         show the order-dependent comparison row (default true)
 * }
 */
import { useState } from 'react';
import { Btn, Controls, Stage } from './_kit';

const AGGS = ['sum', 'mean', 'max'] as const;
type Agg = (typeof AGGS)[number];
const DEF = [0.4, -1.1, 1.6, 0.2, -0.5];
const W = [0.9, -1.3, 0.5, 1.1, -0.7, 0.3, 0.8];
const PHI = (x: number) => [x, x * x, Math.tanh(2 * x)];
const RHO = (u: number[]) => u[0] - 0.4 * u[1] + 1.5 * u[2];
const NAMES = ['φ₁ = x', 'φ₂ = x²', 'φ₃ = tanh 2x'];

export default function MlDeepSetsPool({ values = DEF, agg = 'sum', showBaseline = true }: {
  values?: number[]; agg?: Agg; showBaseline?: boolean;
}) {
  const init = (values.length >= 2 && values.length <= 7 ? values : DEF).slice();
  const [xs, setXs] = useState<number[]>(init);
  const [a, setA] = useState<Agg>(AGGS.includes(agg) ? agg : 'sum');
  const [shuffles, setShuffles] = useState(0);

  const feats = xs.map(PHI);
  const pooled = [0, 1, 2].map((j) => {
    const col = feats.map((f) => f[j]);
    if (a === 'max') return Math.max(...col);
    const s = col.reduce((p, q) => p + q, 0);
    return a === 'mean' ? s / col.length : s;
  });
  const out = RHO(pooled);
  const base = xs.reduce((s, x, i) => s + x * W[i % W.length], 0);

  const shuffle = () => {
    const v = xs.slice();
    for (let i = v.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [v[i], v[j]] = [v[j], v[i]]; }
    setXs(v); setShuffles(shuffles + 1);
  };

  const cw = Math.min(50, 300 / xs.length);
  const bh = 26;
  return (
    <div>
      <Stage h={214} label="Deep Sets: encode every element, pool, then decode">
        <text x={6} y={13} fontSize="9" fill="var(--fg)">the set X (order is arbitrary)</text>
        {xs.map((x, i) => (
          <g key={i}>
            <rect x={8 + i * cw} y={20} width={cw - 8} height={20} rx={9} fill="var(--c2)" fillOpacity={0.18} stroke="var(--c2)" strokeWidth={0.9} />
            <text x={8 + i * cw + (cw - 8) / 2} y={34} fontSize="9.5" textAnchor="middle" fill="var(--fg)">{x.toFixed(1)}</text>
            {PHI(x).map((v, j) => (
              <rect key={j} x={8 + i * cw + 2 + j * ((cw - 12) / 3)} y={62 + bh / 2 - Math.max(0.8, Math.abs(v) * 7)}
                width={(cw - 12) / 3 - 1.5} height={Math.max(1.2, Math.abs(v) * 14)}
                fill={['var(--c1)', 'var(--c3)', 'var(--c4)'][j]} fillOpacity={0.7} />
            ))}
          </g>
        ))}
        <text x={6} y={55} fontSize="8" fill="var(--muted)">same encoder φ applied to each element → three features</text>
        <line x1={6} y1={88} x2={314} y2={88} stroke="var(--grid)" strokeWidth={0.6} />
        <text x={6} y={101} fontSize="9" fill="var(--fg)">pool with ⊕ = {a}: u = ⊕ φ(x)</text>
        {pooled.map((v, j) => (
          <g key={j}>
            <rect x={14 + j * 100} y={110} width={86} height={16} rx={3} fill="var(--surface)" stroke="var(--grid)" strokeWidth={0.7} />
            <text x={57 + j * 100} y={122} fontSize="9" textAnchor="middle" fill="var(--fg)">{NAMES[j]}: {v.toFixed(3)}</text>
          </g>
        ))}
        <text x={6} y={146} fontSize="9.5" fill="var(--c1)">Deep Sets output ρ(u) = {out.toFixed(4)}</text>
        <text x={6} y={159} fontSize="8" fill="var(--muted)">unchanged by every reordering — invariance is built in, not learned</text>
        {showBaseline && <>
          <text x={6} y={178} fontSize="9.5" fill="var(--c5)">order-dependent baseline wᵀx = {base.toFixed(4)}</text>
          <text x={6} y={191} fontSize="8" fill="var(--muted)">a plain MLP on the list: a different answer for (almost) every ordering</text>
        </>}
        <text x={314} y={208} fontSize="8" textAnchor="end" fill="var(--muted)">{shuffles} shuffle{shuffles === 1 ? '' : 's'} · |X| = {xs.length}</text>
      </Stage>
      <Controls>
        <Btn onClick={shuffle}>⇄ shuffle</Btn>
        {AGGS.map((k) => <Btn key={k} active={a === k} onClick={() => setA(k)}>{k}</Btn>)}
        <Btn onClick={() => xs.length < 7 && setXs([...xs, xs[0]])}>duplicate first</Btn>
        <Btn onClick={() => { setXs(init); setShuffles(0); }}>↺ reset</Btn>
      </Controls>
    </div>
  );
}
