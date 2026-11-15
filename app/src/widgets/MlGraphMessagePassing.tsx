/**
 * Message passing on a small graph, one hop at a time.
 * Every node holds one number h_v. A step updates all nodes in parallel from their neighbours:
 *   sum   h_v ← h_v + Σ_{u∈N(v)} h_u          (GIN-style injective aggregation; values grow)
 *   mean  h_v ← (h_v + Σ_{u∈N(v)} h_u)/(1+deg v)   (GCN-style averaging; values level off = oversmoothing)
 *   max   h_v ← max(h_v, max_{u∈N(v)} h_u)
 * Start from an "impulse": the tapped node holds 1 and every other node 0, so after t steps the
 * non-zero nodes are exactly the t-hop neighbourhood — the receptive field of one node after t layers.
 * Messages animate as dots travelling along every edge in both directions. The readout line shows
 * Σ_v h_v and mean_v h_v, permutation-invariant summaries of the whole graph.
 * props: {
 *   graph?: 'house' | 'path' | 'tree' | 'ring'   (default 'house')
 *   agg?: 'sum' | 'mean' | 'max'                 (default 'sum')
 *   steps?: number        initial number of hops, 0–4 (default 0)
 *   source?: number       index of the impulse node (default 0)
 *   showReadout?: boolean show the graph-level readout line (default true)
 * }
 */
import { useMemo, useState } from 'react';
import { Btn, Controls, Slider, Stage, prefersReducedMotion, useFrame } from './_kit';

type G = { nodes: [number, number][]; edges: [number, number][]; names: string[] };
const GRAPHS: Record<string, G> = {
  house: {
    nodes: [[55, 132], [150, 132], [150, 66], [55, 66], [102, 22]],
    edges: [[0, 1], [1, 2], [2, 3], [3, 0], [2, 4], [3, 4]],
    names: ['a', 'b', 'c', 'd', 'e'],
  },
  path: {
    nodes: [[25, 80], [70, 80], [115, 80], [160, 80], [205, 80]],
    edges: [[0, 1], [1, 2], [2, 3], [3, 4]],
    names: ['a', 'b', 'c', 'd', 'e'],
  },
  tree: {
    nodes: [[105, 24], [55, 80], [155, 80], [25, 136], [85, 136], [125, 136], [185, 136]],
    edges: [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6]],
    names: ['r', 'u', 'v', 'w', 'x', 'y', 'z'],
  },
  ring: {
    nodes: Array.from({ length: 6 }, (_, i) => {
      const a = (Math.PI * 2 * i) / 6 - Math.PI / 2;
      return [105 + 72 * Math.cos(a), 80 + 56 * Math.sin(a)] as [number, number];
    }),
    edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0]],
    names: ['a', 'b', 'c', 'd', 'e', 'f'],
  },
};
const AGGS = ['sum', 'mean', 'max'] as const;
type Agg = (typeof AGGS)[number];
const TMAX = 4;

function history(g: G, src: number, agg: Agg): number[][] {
  const n = g.nodes.length;
  const nb: number[][] = g.nodes.map(() => []);
  g.edges.forEach(([a, b]) => { nb[a].push(b); nb[b].push(a); });
  let h: number[] = g.nodes.map((_, i) => (i === src ? 1 : 0));
  const out: number[][] = [h];
  for (let t = 0; t < TMAX; t++) {
    h = h.map((hv, v) => {
      if (agg === 'max') return Math.max(hv, ...nb[v].map((u) => h[u]));
      const s = hv + nb[v].reduce((acc, u) => acc + h[u], 0);
      return agg === 'mean' ? s / (1 + nb[v].length) : s;
    });
    out.push(h);
  }
  return out;
}

export default function MlGraphMessagePassing({ graph = 'house', agg = 'sum', steps = 0, source = 0, showReadout = true }: {
  graph?: string; agg?: Agg; steps?: number; source?: number; showReadout?: boolean;
}) {
  const g = GRAPHS[graph] ?? GRAPHS.house;
  const [a, setA] = useState<Agg>(AGGS.includes(agg) ? agg : 'sum');
  const [t, setT] = useState(Math.max(0, Math.min(TMAX, Math.round(steps))));
  const [src, setSrc] = useState(Math.max(0, Math.min(g.nodes.length - 1, source)));
  const [flow, setFlow] = useState(prefersReducedMotion() ? 0 : -1);
  useFrame((dt) => setFlow((p) => (p < 0 ? p : p + dt * 1.6 > 1 ? -1 : p + dt * 1.6)), flow >= 0);

  const hist = useMemo(() => history(g, src, a), [g, src, a]);
  const h = hist[t];
  const hmax = Math.max(1e-9, ...h);
  const total = h.reduce((x, y) => x + y, 0);
  const step = (dt: number) => { const nt = Math.max(0, Math.min(TMAX, t + dt)); if (nt !== t) { setT(nt); if (dt > 0 && !prefersReducedMotion()) setFlow(0); } };

  return (
    <div>
      <Stage label="node features spreading hop by hop">
        {g.edges.map(([u, v], i) => {
          const [x1, y1] = g.nodes[u]; const [x2, y2] = g.nodes[v];
          return (
            <g key={i}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--muted)" strokeWidth={1.2} />
              {flow >= 0 && [1, -1].map((d) => {
                const p = d > 0 ? flow : 1 - flow;
                return <circle key={d} cx={x1 + (x2 - x1) * p} cy={y1 + (y2 - y1) * p} r={2.6} fill="var(--c3)" />;
              })}
            </g>
          );
        })}
        {g.nodes.map(([x, y], i) => (
          <g key={i} onClick={() => setSrc(i)} style={{ cursor: 'pointer' }}>
            <circle cx={x} cy={y} r={15} fill="var(--c2)" fillOpacity={0.12 + 0.75 * (h[i] / hmax)} stroke={i === src ? 'var(--c3)' : 'var(--fg)'} strokeWidth={i === src ? 2.2 : 1} />
            <text x={x} y={y + 3.5} fontSize="9" textAnchor="middle" fill="var(--fg)">{h[i] === 0 ? '0' : h[i] >= 100 ? h[i].toFixed(0) : h[i].toFixed(2)}</text>
            <text x={x} y={y - 18} fontSize="8" textAnchor="middle" fill="var(--muted)">{g.names[i]}</text>
          </g>
        ))}
        <text x={316} y={18} fontSize="9" textAnchor="end" fill="var(--fg)">after {t} hop{t === 1 ? '' : 's'}</text>
        <text x={316} y={32} fontSize="8" textAnchor="end" fill="var(--c3)">impulse at {g.names[src]}</text>
        <text x={316} y={48} fontSize="8" textAnchor="end" fill="var(--muted)">{h.filter((v) => v > 0).length} of {h.length} nodes reached</text>
        {showReadout && <>
          <line x1={4} y1={164} x2={316} y2={164} stroke="var(--grid)" strokeWidth={0.6} />
          <text x={4} y={180} fontSize="9" fill="var(--fg)">readout Σ h = {total >= 100 ? total.toFixed(0) : total.toFixed(3)}</text>
          <text x={316} y={180} fontSize="9" textAnchor="end" fill="var(--fg)">mean h = {(total / h.length).toFixed(3)}</text>
          <text x={160} y={194} fontSize="8" textAnchor="middle" fill="var(--muted)">both unchanged if the nodes are relabelled: permutation-invariant</text>
        </>}
      </Stage>
      <Controls>
        <Btn onClick={() => step(-1)}>◀ hop</Btn>
        <Btn onClick={() => step(1)}>hop ▶</Btn>
        {AGGS.map((k) => <Btn key={k} active={a === k} onClick={() => setA(k)}>{k}</Btn>)}
        <Slider label="hops t" min={0} max={TMAX} step={1} value={t} onChange={(v) => setT(v)} />
      </Controls>
    </div>
  );
}
