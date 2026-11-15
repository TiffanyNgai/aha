import { useMemo, useState } from 'react';
import { Btn, C, Controls, Slider, Stage, pathOf, rng, scale } from './_kit';

/**
 * A closed-loop optimisation of reaction conditions, as a self-driving lab would run it.
 * The hidden "true" yield surface over temperature (40–140 °C) and catalyst loading (0.5–5 mol%) has a
 * sharp global optimum (~92 %) and a broad, mediocre local one (~38 %) — the usual shape of a real
 * condition landscape. Each round the platform runs a batch of experiments, measures yield with noise
 * (σ = 2 %), and refits a Gaussian-process surrogate (RBF kernel, exact Cholesky inference).
 *  - 'bo'      picks the batch by maximising the UCB acquisition μ(x) + κ·σ(x), with local penalisation
 *              so the points in one batch are not all identical: explore where the model is unsure,
 *              exploit where it predicts well.
 *  - 'random'  samples conditions uniformly — the honest baseline every paper should report.
 *  - 'grid'    runs a full-factorial grid in order, the way conditions were screened before.
 * The map shows the GP posterior mean (or the hidden truth, with "peek"); dots are experiments, shaded
 * by round. The trace below is best-yield-so-far against experiments run, with the random baseline dashed.
 * props: { strategy?: 'bo'|'random'|'grid' (default 'bo'), rounds?: number (0–8, default 3),
 *          batch?: number (2–6, default 4), kappa?: number (default 2), seed?: number (default 3) }
 */

type Strat = 'bo' | 'random' | 'grid';
const NX = 21, NY = 15;
const GX = Array.from({ length: NX }, (_, i) => i / (NX - 1));
const GY = Array.from({ length: NY }, (_, j) => j / (NY - 1));

/** True yield (%) on the unit square. */
const truth = (x: number, y: number) =>
  92 * Math.exp(-(Math.pow(x - 0.66, 2) / 0.035 + Math.pow(y - 0.34, 2) / 0.055))
  + 38 * Math.exp(-(Math.pow(x - 0.18, 2) / 0.07 + Math.pow(y - 0.82, 2) / 0.10));

const kern = (a: [number, number], b: [number, number], ell = 0.22, sf = 1) =>
  sf * sf * Math.exp(-(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2)) / (2 * ell * ell));

function chol(A: number[][]) {
  const n = A.length, L = A.map(() => new Array(n).fill(0) as number[]);
  for (let i = 0; i < n; i++) for (let j = 0; j <= i; j++) {
    let s = A[i][j];
    for (let k = 0; k < j; k++) s -= L[i][k] * L[j][k];
    L[i][j] = i === j ? Math.sqrt(Math.max(s, 1e-10)) : s / L[j][j];
  }
  return L;
}
function solveChol(L: number[][], b: number[]) {
  const n = b.length, z = new Array(n).fill(0) as number[], x = new Array(n).fill(0) as number[];
  for (let i = 0; i < n; i++) { let s = b[i]; for (let k = 0; k < i; k++) s -= L[i][k] * z[k]; z[i] = s / L[i][i]; }
  for (let i = n - 1; i >= 0; i--) { let s = z[i]; for (let k = i + 1; k < n; k++) s -= L[k][i] * x[k]; x[i] = s / L[i][i]; }
  return x;
}

interface Obs { x: number; y: number; v: number; round: number }

/** GP posterior (mean, sd) in yield units, on the display grid. */
function posterior(obs: Obs[]) {
  const mu0 = 30, sc0 = 40, noise = 2 / sc0;
  if (!obs.length) return { mean: GY.map(() => GX.map(() => mu0)), sd: GY.map(() => GX.map(() => sc0)) };
  const X = obs.map((o) => [o.x, o.y] as [number, number]);
  const yv = obs.map((o) => (o.v - mu0) / sc0);
  const K = X.map((a, i) => X.map((b, j) => kern(a, b) + (i === j ? noise * noise + 1e-7 : 0)));
  const L = chol(K);
  const alpha = solveChol(L, yv);
  const mean: number[][] = [], sd: number[][] = [];
  for (const gy of GY) {
    const mr: number[] = [], sr: number[] = [];
    for (const gx of GX) {
      const ks = X.map((a) => kern(a, [gx, gy]));
      mr.push(mu0 + sc0 * ks.reduce((s, kv, i) => s + kv * alpha[i], 0));
      const v = solveChol(L, ks);
      sr.push(sc0 * Math.sqrt(Math.max(1e-6, 1 - ks.reduce((s, kv, i) => s + kv * v[i], 0))));
    }
    mean.push(mr); sd.push(sr);
  }
  return { mean, sd };
}

/** Run the whole campaign deterministically. */
function campaign(strat: Strat, rounds: number, batch: number, kappa: number, seed: number): Obs[] {
  const g = rng(seed);
  const obs: Obs[] = [];
  const add = (x: number, y: number, round: number) => obs.push({ x, y, v: Math.max(0, truth(x, y) + 2 * g.normal()), round });
  // every campaign starts from the same 4 space-filling conditions
  [[0.15, 0.2], [0.85, 0.25], [0.3, 0.85], [0.75, 0.8]].forEach(([x, y]) => add(x, y, 0));
  for (let r = 1; r <= rounds; r++) {
    if (strat === 'random') { for (let b = 0; b < batch; b++) add(g.u(), g.u(), r); continue; }
    if (strat === 'grid') {
      for (let b = 0; b < batch; b++) {
        const n = (r - 1) * batch + b, cols = 5;
        add(0.1 + 0.2 * (n % cols), 0.1 + 0.2 * (Math.floor(n / cols) % 5), r);
      }
      continue;
    }
    const { mean, sd } = posterior(obs);
    const taken: [number, number][] = [];
    for (let b = 0; b < batch; b++) {
      let best = -Infinity, bx = 0, by = 0;
      GY.forEach((gy, j) => GX.forEach((gx, i) => {
        let a = mean[j][i] + kappa * sd[j][i];
        for (const [tx, ty] of taken) a -= 60 * Math.exp(-(Math.pow(gx - tx, 2) + Math.pow(gy - ty, 2)) / (2 * 0.09 * 0.09));
        if (a > best) { best = a; bx = gx; by = gy; }
      }));
      taken.push([bx, by]); add(bx, by, r);
    }
  }
  return obs;
}

const heat = (v: number) => {
  const t = Math.max(0, Math.min(1, v / 95));
  return { fill: t < 0.5 ? C[1] : C[2], op: 0.12 + 0.78 * (t < 0.5 ? t * 1.3 : t) };
};

export default function DrugClosedLoop({ strategy = 'bo', rounds = 3, batch = 4, kappa = 2, seed = 3 }: {
  strategy?: Strat; rounds?: number; batch?: number; kappa?: number; seed?: number;
}) {
  const [st, setSt] = useState<Strat>(strategy);
  const [r, setR] = useState(Math.max(0, Math.min(8, Math.round(rounds))));
  const [peek, setPeek] = useState(false);
  const B = Math.max(2, Math.min(6, Math.round(batch)));

  const obs = useMemo(() => campaign(st, r, B, kappa, seed), [st, r, B, kappa, seed]);
  const base = useMemo(() => campaign('random', 8, B, kappa, seed + 101), [B, kappa, seed]);
  const { mean } = useMemo(() => posterior(obs), [obs]);

  const L = 36, R = 212, T = 24, Bm = 134;
  const sx = scale([0, 1], [L, R]), sy = scale([0, 1], [Bm, T]);
  const cw = (R - L) / (NX - 1), ch = (Bm - T) / (NY - 1);

  const bestSoFar = (o: Obs[]) => { let m = 0; return o.map((p) => (m = Math.max(m, p.v))); };
  const mine = bestSoFar(obs), rand = bestSoFar(base).slice(0, Math.max(obs.length, 8));
  const tL = 34, tR = 306, tT = 158, tB = 212;
  const tx = scale([0, Math.max(12, mine.length, rand.length)], [tL, tR]);
  const ty = scale([0, 100], [tB, tT]);
  const toPts = (a: number[]): [number, number][] => a.map((v, i) => [tx(i + 1), ty(v)]);

  return (
    <div>
      <Stage w={320} h={244} label={`Closed-loop condition optimisation, ${st}, round ${r}`}>
        <text x={4} y={10} fontSize="8.3" fontWeight="bold" fill="var(--fg)">Design → make → test → analyse</text>
        <text x={4} y={19} fontSize="6.5" fill="var(--muted)">
          {peek ? 'hidden true yield surface' : 'GP posterior mean yield'} · {obs.length} experiments run
        </text>
        {GY.map((gy, j) => GX.map((gx, i) => {
          const v = peek ? truth(gx, gy) : mean[j][i];
          const h = heat(v);
          return <rect key={`${i}-${j}`} x={sx(gx) - cw / 2} y={sy(gy) - ch / 2} width={cw} height={ch} fill={h.fill} opacity={h.op} />;
        }))}
        <rect x={L - cw / 2} y={T - ch / 2} width={R - L + cw} height={Bm - T + ch} fill="none" stroke="var(--fg)" strokeWidth={0.6} />
        {obs.map((o, i) => (
          <circle key={i} cx={sx(o.x)} cy={sy(o.y)} r={o.round === r && r > 0 ? 3.2 : 2.2}
            fill={o.round === 0 ? 'none' : 'var(--surface)'} stroke={o.round === r && r > 0 ? C[4] : 'var(--fg)'}
            strokeWidth={o.round === r && r > 0 ? 1.4 : 0.8} opacity={0.4 + 0.6 * (o.round / Math.max(1, r))} />
        ))}
        <text x={(L + R) / 2} y={Bm + 12} fontSize="6.8" textAnchor="middle" fill="var(--fg)">temperature 40 → 140 °C</text>
        <text x={L - 4} y={T - 6} fontSize="6.8" fill="var(--fg)">catalyst 0.5 → 5 mol%</text>
        <g fontSize="6.6" fill="var(--muted)">
          <text x={R + 6} y={T + 8} fill="var(--fg)" fontSize="7">best yield</text>
          <text x={R + 6} y={T + 19} fill={C[0]} fontSize="9" fontWeight="bold">{Math.max(...obs.map((o) => o.v)).toFixed(0)} %</text>
          <text x={R + 6} y={T + 32}>after {obs.length} runs</text>
          <text x={R + 6} y={T + 46} fill="var(--fg)" fontSize="7">random at</text>
          <text x={R + 6} y={T + 56}>the same cost</text>
          <text x={R + 6} y={T + 68} fill={C[5]} fontSize="9" fontWeight="bold">
            {Math.max(...base.slice(0, obs.length).map((o) => o.v)).toFixed(0)} %
          </text>
          <text x={R + 6} y={T + 84} fontSize="6.2">◯ seed batch</text>
          <text x={R + 6} y={T + 93} fontSize="6.2">● later rounds</text>
          <text x={R + 6} y={T + 102} fontSize="6.2" fill={C[4]}>● this round</text>
        </g>
        <line x1={tL} x2={tR} y1={tB} y2={tB} stroke="var(--fg)" strokeWidth={0.7} />
        <line x1={tL} x2={tL} y1={tT} y2={tB} stroke="var(--fg)" strokeWidth={0.7} />
        {[0, 50, 100].map((v) => <text key={v} x={tL - 3} y={ty(v) + 2.4} fontSize="6" textAnchor="end" fill="var(--muted)">{v}</text>)}
        <path d={pathOf(toPts(rand))} fill="none" stroke={C[5]} strokeWidth={1.1} strokeDasharray="3 2" />
        <path d={pathOf(toPts(mine))} fill="none" stroke={C[0]} strokeWidth={1.6} />
        <text x={tL + 2} y={tT - 3} fontSize="6.6" fill="var(--fg)">best yield so far (%) vs experiments</text>
        <text x={tR} y={tB + 9} fontSize="6.4" textAnchor="end" fill="var(--muted)">experiments →</text>
        <text x={4} y={238} fontSize="6.6" fill="var(--muted)">
          {st === 'bo' ? 'UCB first probes where the model is unsure, then homes in on the sharp optimum.'
            : st === 'grid' ? 'A fixed grid spends every run whether or not the data already answered the question.'
              : 'Random search is a fair baseline — and on an easy landscape it is hard to beat.'}
        </text>
      </Stage>
      <Controls>
        <Btn active={st === 'bo'} onClick={() => setSt('bo')}>Bayesian opt</Btn>
        <Btn active={st === 'random'} onClick={() => setSt('random')}>random</Btn>
        <Btn active={st === 'grid'} onClick={() => setSt('grid')}>grid screen</Btn>
        <Slider label="rounds" min={0} max={8} step={1} value={r} onChange={setR} format={(v) => `${v}`} />
        <Btn active={peek} onClick={() => setPeek(!peek)}>peek at truth</Btn>
      </Controls>
    </div>
  );
}
