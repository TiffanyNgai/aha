import { useMemo, useState } from 'react';
import { Btn, C, Controls, Stage } from './_kit';

/**
 * Retrosynthesis as a tree search. The root is the target (celecoxib); expanding a molecule applies
 * every reaction template the policy proposes, each with a prior probability, and replaces that molecule
 * by the set of precursors the template needs. A branch terminates when every leaf is a purchasable
 * building block (✓); a molecule with no template and no supplier is a dead end (✗).
 * "Expand next" always expands the frontier molecule with the highest path score — the product of the
 * template priors from the root — i.e. best-first search, the greedy core of the MCTS used by
 * Segler et al.'s 3N-MCTS and by AiZynthFinder. "Large catalogue" switches from a small in-house stock
 * to a commercial one: with more molecules purchasable the same search stops earlier on a shorter route.
 * The chemistry is real (celecoxib is made by condensing 4-sulfamoylphenylhydrazine with a CF₃
 * 1,3-diketone, itself from a Claisen condensation of 4′-methylacetophenone with ethyl trifluoroacetate),
 * but the template priors are illustrative, not the output of a trained policy network.
 * props: { stock?: 'small'|'large' (default 'small'), steps?: number (expansions to pre-run, default 0) }
 */

interface Rxn { name: string; prior: number; kids: string[] }
interface Mol { label: string; stock: 'always' | 'large' | 'never'; rxns: Rxn[] }

const TREE: Record<string, Mol> = {
  celecoxib: {
    label: 'celecoxib', stock: 'never', rxns: [
      { name: 'pyrazole condensation (hydrazine + 1,3-diketone)', prior: 0.62, kids: ['diketone', 'arylhydrazine'] },
      { name: 'sulfonamide from ArSO₂Cl + NH₃', prior: 0.24, kids: ['sulfonylchloride', 'ammonia'] },
      { name: 'N-arylation of an NH-pyrazole', prior: 0.14, kids: ['pyrazoleNH', 'bromosulfonamide'] },
    ],
  },
  diketone: {
    label: 'CF₃ 1,3-diketone', stock: 'large', rxns: [
      { name: 'Claisen condensation (ketone + ester)', prior: 0.81, kids: ['acetophenone', 'etfa'] },
    ],
  },
  arylhydrazine: { label: '4-sulfamoylphenylhydrazine·HCl', stock: 'always', rxns: [] },
  acetophenone: { label: '4′-methylacetophenone', stock: 'always', rxns: [] },
  etfa: { label: 'ethyl trifluoroacetate', stock: 'always', rxns: [] },
  sulfonylchloride: {
    label: 'ArSO₂Cl intermediate', stock: 'never', rxns: [
      { name: 'chlorosulfonylation of an arene', prior: 0.50, kids: ['pyrazoleArene'] },
    ],
  },
  ammonia: { label: 'ammonia', stock: 'always', rxns: [] },
  pyrazoleNH: {
    label: 'NH-pyrazole core', stock: 'large', rxns: [
      { name: 'pyrazole condensation (hydrazine hydrate)', prior: 0.70, kids: ['diketone', 'hydrazineHydrate'] },
    ],
  },
  hydrazineHydrate: { label: 'hydrazine hydrate', stock: 'always', rxns: [] },
  bromosulfonamide: { label: '4-bromobenzenesulfonamide', stock: 'always', rxns: [] },
  pyrazoleArene: { label: 'N-phenylpyrazole core', stock: 'never', rxns: [] },
};

const stocked = (k: string, big: boolean) => TREE[k].stock === 'always' || (big && TREE[k].stock === 'large');

interface Row { id: string; kind: 'mol' | 'rxn'; depth: number; text: string; state: 'stock' | 'dead' | 'frontier' | 'open' | 'rxn'; score: number }

/** Walk the partially expanded tree, returning the display rows and the (sorted) frontier. */
function walkTree(open: string[], big: boolean) {
  const rows: Row[] = []; const frontier: { id: string; score: number }[] = [];
  const go = (k: string, id: string, depth: number, score: number) => {
    const m = TREE[k];
    const st: Row['state'] = stocked(k, big) ? 'stock' : m.rxns.length === 0 ? 'dead' : open.includes(id) ? 'open' : 'frontier';
    if (st === 'frontier') frontier.push({ id, score });
    rows.push({ id, kind: 'mol', depth, text: m.label, state: st, score });
    if (st !== 'open') return;
    m.rxns.forEach((r, i) => {
      rows.push({ id: `${id}.${i}`, kind: 'rxn', depth: depth + 1, text: `${r.name} · P ${r.prior.toFixed(2)}`, state: 'rxn', score: score * r.prior });
      r.kids.forEach((c, j) => go(c, `${id}.${i}.${j}`, depth + 2, score * r.prior));
    });
  };
  go('celecoxib', 'r', 0, 1);
  frontier.sort((a, b) => b.score - a.score);
  return { rows, frontier };
}

/** Deepest-first route reconstruction: building blocks bought, and the number of forward steps. */
function routeOf(k: string, id: string, open: string[], big: boolean): { blocks: string[]; n: number } | null {
  if (stocked(k, big)) return { blocks: [TREE[k].label], n: 0 };
  if (!open.includes(id)) return null;
  for (const [i, r] of TREE[k].rxns.entries()) {
    const parts = r.kids.map((c, j) => routeOf(c, `${id}.${i}.${j}`, open, big));
    if (parts.every((p) => p !== null)) {
      const ps = parts as { blocks: string[]; n: number }[];
      return { blocks: ps.flatMap((p) => p.blocks), n: 1 + ps.reduce((a, p) => a + p.n, 0) };
    }
  }
  return null;
}

const runSteps = (n: number, big: boolean) => {
  let o: string[] = [];
  for (let s = 0; s < n; s++) {
    const f = walkTree(o, big).frontier;
    if (!f.length) break;
    o = [...o, f[0].id];
  }
  return o;
};

export default function DrugRetroTree({ stock = 'small', steps = 0 }: { stock?: 'small' | 'large'; steps?: number }) {
  const [big, setBig] = useState(stock === 'large');
  const [open, setOpen] = useState<string[]>(() => runSteps(Math.max(0, Math.min(12, Math.round(steps))), stock === 'large'));

  const { rows, frontier } = useMemo(() => walkTree(open, big), [open, big]);
  const next = frontier[0];
  const found = routeOf('celecoxib', 'r', open, big);

  const RH = 12.5, TOP = 28;
  const H = TOP + rows.length * RH + 56;
  const colour = (r: Row) => r.kind === 'rxn' ? 'var(--muted)'
    : r.state === 'stock' ? C[0] : r.state === 'dead' ? C[4]
      : r.id === next?.id ? C[2] : r.state === 'open' ? C[1] : 'var(--fg)';
  const glyph = (r: Row) => r.kind === 'rxn' ? '↳' : r.state === 'stock' ? '✓' : r.state === 'dead' ? '✗' : r.state === 'open' ? '◆' : '○';

  return (
    <div>
      <Stage w={320} h={H} label={`Retrosynthetic tree for celecoxib after ${open.length} expansions`}>
        <text x={4} y={10} fontSize="8.5" fontWeight="bold" fill="var(--fg)">Retrosynthetic tree · target celecoxib</text>
        <text x={4} y={20} fontSize="6.8" fill="var(--muted)">
          {big ? 'large commercial catalogue' : 'small in-house stock'} · ✓ purchasable · ○ frontier · ◆ expanded · ✗ dead end
        </text>
        {rows.map((r, i) => {
          const y = TOP + i * RH + 8;
          const x = 5 + r.depth * 7;
          return (
            <g key={r.kind + r.id}>
              {r.id === next?.id && (
                <rect x={x - 3} y={y - 8} width={318 - x} height={11.5} fill={C[2]} opacity={0.15} rx={2} />
              )}
              <text x={x} y={y} fontSize="7.6" fill={colour(r)} fontWeight={r.depth === 0 ? 'bold' : 'normal'}>
                {glyph(r)} {r.text}
              </text>
              {r.kind === 'mol' && r.state === 'frontier' && (
                <text x={317} y={y} fontSize="6.4" textAnchor="end" fill="var(--muted)">{r.score.toFixed(2)}</text>
              )}
            </g>
          );
        })}
        <g fontSize="7.4">
          <text x={4} y={H - 42} fill="var(--fg)">
            {open.length} expansion{open.length === 1 ? '' : 's'} · frontier {frontier.length} molecule{frontier.length === 1 ? '' : 's'}
          </text>
          <text x={4} y={H - 31} fill={found ? C[0] : 'var(--muted)'} fontWeight={found ? 'bold' : 'normal'}>
            {found ? `Route found: ${found.n} forward step${found.n === 1 ? '' : 's'} from purchasable material.` : 'No complete route yet — keep expanding.'}
          </text>
          <text x={4} y={H - 20} fontSize="6.8" fill="var(--muted)">
            {found ? `Buy: ${[...new Set(found.blocks)].join(' + ')}` : 'Best-first expands the highest-score frontier molecule (highlighted).'}
          </text>
          <text x={4} y={H - 7} fontSize="6.8" fill="var(--muted)">
            {big ? 'A bigger catalogue ends the search sooner — at the price of the intermediate.'
              : 'With only cheap reagents in stock the search must go one step deeper.'}
          </text>
        </g>
      </Stage>
      <Controls>
        <Btn onClick={() => setOpen((o) => { const f = walkTree(o, big).frontier; return f.length ? [...o, f[0].id] : o; })}>Expand next</Btn>
        <Btn onClick={() => setOpen(runSteps(12, big))}>Expand all</Btn>
        <Btn active={big} onClick={() => { const nb = !big; setBig(nb); setOpen([]); }}>large catalogue</Btn>
        <Btn onClick={() => setOpen([])}>Reset</Btn>
      </Controls>
    </div>
  );
}
