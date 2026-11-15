import { useMemo, useState } from 'react';
import { Btn, C, Controls, Stage } from './_kit';

/**
 * d-separation explorer on the classic "sprinkler" Bayes net
 *   Season → Rain, Season → Sprinkler, Rain → Wet grass, Sprinkler → Wet grass, Wet grass → Slippery.
 *
 * Pick a query pair X, Y with the buttons, then TAP any other node to put it in the conditioning
 * set Z (tap again to remove it). The widget searches for an **active trail** between X and Y using
 * the standard rule applied at every intermediate node b of a trail a – b – c:
 *   • chain (a→b→c) or fork (a←b→c): active iff b ∉ Z
 *   • collider (a→b←c):              active iff b ∈ Z **or** some descendant of b ∈ Z
 * If an active trail exists the pair is d-connected (the graph permits dependence) and the trail is
 * drawn in orange; if none exists they are d-separated, hence independent in every distribution that
 * factorizes over the graph.
 *
 * props: {
 *   query?: number     index of the initial X–Y query, 0–3 (default 0 = Rain vs Sprinkler)
 *   observed?: string[]  initial conditioning set, node ids from 'S','R','P','W','L' (default [])
 *   controls?: boolean   show the query buttons (default true)
 * }
 */
type Id = 'S' | 'R' | 'P' | 'W' | 'L';
const NODES: { id: Id; label: string; x: number; y: number }[] = [
  { id: 'S', label: 'Season', x: 160, y: 26 },
  { id: 'R', label: 'Rain', x: 62, y: 86 },
  { id: 'P', label: 'Sprinkler', x: 258, y: 86 },
  { id: 'W', label: 'Wet grass', x: 160, y: 146 },
  { id: 'L', label: 'Slippery', x: 160, y: 200 },
];
const EDGES: [Id, Id][] = [['S', 'R'], ['S', 'P'], ['R', 'W'], ['P', 'W'], ['W', 'L']];
const QUERIES: { x: Id; y: Id; text: string }[] = [
  { x: 'R', y: 'P', text: 'Rain ⟂ Sprinkler?' },
  { x: 'R', y: 'L', text: 'Rain ⟂ Slippery?' },
  { x: 'S', y: 'W', text: 'Season ⟂ Wet?' },
  { x: 'P', y: 'L', text: 'Sprinkler ⟂ Slippery?' },
];
const pos = (id: Id) => NODES.find((n) => n.id === id)!;
const isEdge = (a: Id, b: Id) => EDGES.some((e) => e[0] === a && e[1] === b);
const nbrs = (v: Id) => EDGES.filter((e) => e.includes(v)).map((e) => (e[0] === v ? e[1] : e[0]));

/** b itself or one of its descendants lies in Z. */
function activated(b: Id, Z: Set<Id>): boolean {
  const stack: Id[] = [b]; const seen = new Set<Id>();
  while (stack.length) {
    const v = stack.pop()!;
    if (seen.has(v)) continue;
    seen.add(v);
    if (Z.has(v)) return true;
    for (const e of EDGES) if (e[0] === v) stack.push(e[1]);
  }
  return false;
}

/** First active trail from x to y, or null if the pair is d-separated given Z. */
function findTrail(x: Id, y: Id, Z: Set<Id>): Id[] | null {
  const path: Id[] = [x]; const seen = new Set<Id>([x]);
  const go = (): Id[] | null => {
    const cur = path[path.length - 1];
    if (cur === y && path.length > 1) return [...path];
    for (const n of nbrs(cur)) {
      if (seen.has(n)) continue;
      if (path.length >= 2) {
        const prev = path[path.length - 2];
        const collider = isEdge(prev, cur) && isEdge(n, cur);
        if (!(collider ? activated(cur, Z) : !Z.has(cur))) continue;
      }
      seen.add(n); path.push(n);
      const r = go();
      if (r) return r;
      path.pop(); seen.delete(n);
    }
    return null;
  };
  return go();
}

export default function MlDSeparation({ query = 0, observed = [], controls = true }: {
  query?: number; observed?: string[]; controls?: boolean;
}) {
  const [qi, setQi] = useState(Math.max(0, Math.min(QUERIES.length - 1, Math.round(query))));
  const [Zs, setZs] = useState<Id[]>(observed.filter((o): o is Id => NODES.some((n) => n.id === o)));
  const q = QUERIES[qi];
  const Z = useMemo(() => new Set(Zs.filter((z) => z !== q.x && z !== q.y)), [Zs, q]);
  const trail = useMemo(() => findTrail(q.x, q.y, Z), [q, Z]);
  const onTrail = (a: Id, b: Id) => {
    if (!trail) return false;
    for (let i = 0; i + 1 < trail.length; i++) if ((trail[i] === a && trail[i + 1] === b) || (trail[i] === b && trail[i + 1] === a)) return true;
    return false;
  };
  const toggle = (id: Id) => {
    if (id === q.x || id === q.y) return;
    setZs((s) => (s.includes(id) ? s.filter((v) => v !== id) : [...s, id]));
  };
  const role = (id: Id) => (id === q.x ? 'X' : id === q.y ? 'Y' : Z.has(id) ? 'Z' : '');
  const fillOf = (id: Id) => (role(id) === 'Z' ? C[1] : role(id) ? C[3] : 'var(--surface)');

  return (
    <div>
      <Stage w={320} h={250} label="d-separation on a five-node Bayes net">
        <defs>
          <marker id="mlds-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M0,1 L10,5 L0,9 z" fill="var(--muted)" />
          </marker>
          <marker id="mlds-arh" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M0,1 L10,5 L0,9 z" fill={C[2]} />
          </marker>
        </defs>
        {EDGES.map(([a, b]) => {
          const A = pos(a); const B = pos(b);
          const dx = B.x - A.x; const dy = B.y - A.y; const L = Math.hypot(dx, dy);
          const hit = onTrail(a, b);
          return (
            <line key={a + b} x1={A.x + (dx / L) * 20} y1={A.y + (dy / L) * 13} x2={B.x - (dx / L) * 24} y2={B.y - (dy / L) * 15}
              stroke={hit ? C[2] : 'var(--muted)'} strokeWidth={hit ? 2.4 : 1.3} markerEnd={`url(#${hit ? 'mlds-arh' : 'mlds-ar'})`} />
          );
        })}
        {NODES.map((n) => (
          <g key={n.id} onPointerDown={() => toggle(n.id)} style={{ cursor: 'pointer' }}>
            <ellipse cx={n.x} cy={n.y} rx={30} ry={14} fill={fillOf(n.id)} fillOpacity={role(n.id) ? 0.3 : 1}
              stroke={role(n.id) === 'Z' ? C[1] : role(n.id) ? C[3] : 'var(--muted)'} strokeWidth={role(n.id) ? 2 : 1.2} />
            {role(n.id) === 'Z' && <ellipse cx={n.x} cy={n.y} rx={33.5} ry={17.5} fill="none" stroke={C[1]} strokeWidth={1} />}
            <text x={n.x} y={n.y + 3.2} fontSize="9" textAnchor="middle" fill="var(--fg)">{n.label}</text>
            {role(n.id) && <text x={n.x + 36} y={n.y + 3} fontSize="9" fill={role(n.id) === 'Z' ? C[1] : C[3]}>{role(n.id)}</text>}
          </g>
        ))}
        <text x={6} y={228} fontSize="9" fill="var(--fg)">
          {q.x} ⟂ {q.y} | Z = {`{${[...Z].join(', ')}}`}
        </text>
        <text x={6} y={242} fontSize="10" fill={trail ? C[2] : C[0]}>
          {trail ? `d-connected — active trail ${trail.join(' – ')}` : 'd-separated ⇒ independent'}
        </text>
        <text x={314} y={228} fontSize="8" textAnchor="end" fill="var(--muted)">tap a node to observe it</text>
      </Stage>
      {controls && (
        <Controls>
          {QUERIES.map((Q, i) => <Btn key={i} active={i === qi} onClick={() => setQi(i)}>{Q.text}</Btn>)}
          <Btn onClick={() => setZs([])}>↺ clear Z</Btn>
        </Controls>
      )}
    </div>
  );
}
