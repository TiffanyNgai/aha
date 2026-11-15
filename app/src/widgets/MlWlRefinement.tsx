/**
 * 1-WL colour refinement (the Weisfeiler–Leman test) run on two graphs side by side.
 * Round 0 gives every node the same colour. Each round replaces a node's colour by a fresh colour
 * standing for the pair (its old colour, the sorted multiset of its neighbours' colours); the colour
 * dictionary is shared by both graphs, exactly as in the isomorphism test. After each round the two
 * colour histograms are compared: if they ever differ the graphs are certainly non-isomorphic, and if
 * they stay equal once refinement has stabilised 1-WL — and therefore any message-passing GNN — cannot
 * tell the graphs apart.
 *   'cycles' the 6-cycle C6 vs two disjoint triangles: every node always looks identical, so WL fails.
 *   'mixed'  C4 ∪ K2 vs the path P6: the same degree sequence, and identical after one round, but WL
 *            pulls them apart at round 2.
 * props: {
 *   pair?: 'cycles' | 'mixed'   (default 'cycles')
 *   round?: number              initial round, 0–3 (default 0)
 *   pairs?: ('cycles'|'mixed')[]  which pairs the buttons offer ([] hides them; default both)
 * }
 */
import { useMemo, useState } from 'react';
import { Btn, Controls, Stage } from './_kit';

type Gr = { name: string; pts: [number, number][]; edges: [number, number][] };
const ring = (cx: number, cy: number, r: number, k: number, from = -Math.PI / 2) =>
  Array.from({ length: k }, (_, i) => [cx + r * Math.cos(from + (2 * Math.PI * i) / k), cy + r * Math.sin(from + (2 * Math.PI * i) / k)] as [number, number]);
const cyc = (k: number, o = 0): [number, number][] => Array.from({ length: k }, (_, i) => [o + i, o + ((i + 1) % k)]);

const PAIRS: Record<string, [Gr, Gr]> = {
  cycles: [
    { name: 'C₆ (one 6-cycle)', pts: ring(76, 78, 50, 6), edges: cyc(6) },
    { name: '2·C₃ (two triangles)', pts: [...ring(46, 46, 28, 3), ...ring(110, 110, 28, 3)], edges: [...cyc(3), ...cyc(3, 3)] },
  ],
  mixed: [
    { name: 'C₄ ∪ K₂', pts: [[36, 36], [100, 36], [100, 90], [36, 90], [40, 138], [100, 138]], edges: [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5]] },
    { name: 'P₆ (a path)', pts: [[16, 56], [40, 100], [64, 56], [88, 100], [112, 56], [136, 100]], edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5]] },
  ],
};
const PAL = ['var(--c2)', 'var(--c3)', 'var(--c1)', 'var(--c4)', 'var(--c5)', 'var(--c6)'];
const LET = 'ABCDEF';
const RMAX = 3;

/** Colours of both graphs at every round, using one shared signature dictionary per round. */
function refine([ga, gb]: [Gr, Gr]) {
  const adj = (g: Gr) => { const a: number[][] = g.pts.map(() => []); g.edges.forEach(([u, v]) => { a[u].push(v); a[v].push(u); }); return a; };
  const A = [adj(ga), adj(gb)];
  let cols = [ga.pts.map(() => 0), gb.pts.map(() => 0)];
  const hist = [cols];
  for (let r = 0; r < RMAX; r++) {
    const dict = new Map<string, number>();
    const next = cols.map((c, gi) => c.map((cv, v) => {
      const key = cv + '|' + A[gi][v].map((u) => c[u]).sort((x, y) => x - y).join(',');
      if (!dict.has(key)) dict.set(key, dict.size);
      return dict.get(key)!;
    }));
    cols = next;
    hist.push(cols);
  }
  return hist;
}
const tally = (c: number[]) => {
  const m = new Map<number, number>();
  c.forEach((x) => m.set(x, (m.get(x) ?? 0) + 1));
  return [...m.entries()].sort((a, b) => a[0] - b[0]).map(([k, n]) => `${n}×${LET[k % 6]}`).join(', ');
};

export default function MlWlRefinement({ pair = 'cycles', round = 0, pairs = ['cycles', 'mixed'] }: {
  pair?: string; round?: number; pairs?: string[];
}) {
  const [p, setP] = useState(PAIRS[pair] ? pair : 'cycles');
  const [r, setR] = useState(Math.max(0, Math.min(RMAX, Math.round(round))));
  const gs = PAIRS[p];
  const hist = useMemo(() => refine(gs), [gs]);
  const [ca, cb] = hist[r];
  const ta = tally(ca), tb = tally(cb);
  const same = ta === tb;
  const split = hist.findIndex(([x, y]) => tally(x) !== tally(y));

  const panel = (g: Gr, cols: number[], dx: number) => (
    <g transform={`translate(${dx} 0)`}>
      <text x={76} y={14} fontSize="9" textAnchor="middle" fill="var(--fg)">{g.name}</text>
      {g.edges.map(([u, v], i) => (
        <line key={i} x1={g.pts[u][0]} y1={g.pts[u][1]} x2={g.pts[v][0]} y2={g.pts[v][1]} stroke="var(--muted)" strokeWidth={1.2} />
      ))}
      {g.pts.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r={11} fill={PAL[cols[i] % 6]} fillOpacity={0.75} stroke="var(--fg)" strokeWidth={0.9} />
          <text x={x} y={y + 3.5} fontSize="9" textAnchor="middle" fill="var(--fg)">{LET[cols[i] % 6]}</text>
        </g>
      ))}
      <text x={76} y={170} fontSize="9" textAnchor="middle" fill="var(--fg)">{tally(cols)}</text>
    </g>
  );

  return (
    <div>
      <Stage h={210} label="Weisfeiler–Leman colour refinement on two graphs">
        <text x={160} y={14} fontSize="9" textAnchor="middle" fill="var(--muted)">round {r}</text>
        {panel(gs[0], ca, 2)}
        {panel(gs[1], cb, 166)}
        <line x1={160} y1={20} x2={160} y2={158} stroke="var(--grid)" strokeWidth={0.6} />
        <line x1={6} y1={178} x2={314} y2={178} stroke="var(--grid)" strokeWidth={0.6} />
        <text x={160} y={192} fontSize="9" textAnchor="middle" fill={same ? 'var(--c5)' : 'var(--c1)'}>
          {same ? 'histograms identical — still indistinguishable' : `histograms differ — non-isomorphic, proved at round ${split}`}
        </text>
        <text x={160} y={205} fontSize="8" textAnchor="middle" fill="var(--muted)">
          {split < 0 ? 'refinement is already stable: 1-WL (and every message-passing GNN) fails here' : 'a difference at any round is a certificate of non-isomorphism'}
        </text>
      </Stage>
      <Controls>
        <Btn onClick={() => setR(Math.max(0, r - 1))}>◀ round</Btn>
        <Btn onClick={() => setR(Math.min(RMAX, r + 1))}>round ▶</Btn>
        {pairs.filter((k) => PAIRS[k]).map((k) => (
          <Btn key={k} active={p === k} onClick={() => { setP(k); setR(0); }}>{k === 'cycles' ? 'C₆ vs 2·C₃' : 'C₄∪K₂ vs P₆'}</Btn>
        ))}
      </Controls>
    </div>
  );
}
