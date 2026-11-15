import { useMemo, useState } from 'react';
import { Btn, C, Controls, Slider, Stage } from './_kit';

/**
 * Three synthesizability scores disagreeing on the same six molecules.
 *  - SAscore (Ertl & Schuffenhauer 2009): 1 (easy) → 10 (hard), from ECFP fragment frequencies in PubChem
 *    plus a complexity penalty for rings, stereocentres, macrocycles and size.
 *  - SCScore (Coley et al. 2017): 1 → 5, a neural network trained on Reaxys reactions to score a product
 *    as more complex than its reactants.
 *  - RAscore (Thakkar et al. 2021): 0 → 1, a classifier predicting whether AiZynthFinder will find a route.
 * Every bar shows *difficulty* on a common 0–1 axis: (SA−1)/9, (SC−1)/4, and 1−RA. Pick a score to sort by;
 * the rank chips show where each score puts the molecule, and the footer gives Spearman's ρ between the
 * selected score's ranking and the other two, computed from the numbers shown. The slider sets a pass
 * threshold on the selected score, as a generative-model filter would.
 * The values are plausible illustrative numbers chosen to show the known disagreements (SAscore punishes
 * macrocyclic peptides that are routine to make; low SAscore does not mean a route exists), not measured output.
 * props: { score?: 'sa'|'sc'|'ra' (default 'sa'), threshold?: number (0–1 difficulty, default 0.5) }
 */

type Key = 'sa' | 'sc' | 'ra';
interface Cmpd { name: string; note: string; sa: number; sc: number; ra: number }

const MOLS: Cmpd[] = [
  { name: 'aspirin', note: 'two steps from phenol', sa: 1.6, sc: 2.0, ra: 0.99 },
  { name: 'ibuprofen', note: 'bulk drug, 3-step route', sa: 1.5, sc: 2.2, ra: 0.98 },
  { name: 'cyclic hexapeptide', note: 'routine on a peptide synthesiser', sa: 5.4, sc: 2.6, ra: 0.92 },
  { name: 'generated polyheteroarene', note: 'common fragments, no known route', sa: 2.9, sc: 3.1, ra: 0.04 },
  { name: 'morphine', note: '5 stereocentres, fused rings', sa: 4.8, sc: 4.1, ra: 0.21 },
  { name: 'paclitaxel', note: 'taxane core, 11 stereocentres', sa: 6.4, sc: 4.9, ra: 0.02 },
];

const LABEL: Record<Key, string> = { sa: 'SAscore', sc: 'SCScore', ra: 'RAscore' };
const COL: Record<Key, string> = { sa: C[1], sc: C[3], ra: C[2] };
/** Difficulty on a common 0 (easy) – 1 (hard) axis. */
const diff = (m: Cmpd, k: Key) => k === 'sa' ? (m.sa - 1) / 9 : k === 'sc' ? (m.sc - 1) / 4 : 1 - m.ra;
const shown = (m: Cmpd, k: Key) => k === 'sa' ? m.sa.toFixed(1) : k === 'sc' ? m.sc.toFixed(1) : m.ra.toFixed(2);

/** 1 = easiest. */
function ranks(k: Key): Map<string, number> {
  const order = [...MOLS].sort((a, b) => diff(a, k) - diff(b, k));
  return new Map(order.map((m, i) => [m.name, i + 1]));
}
function spearman(a: Map<string, number>, b: Map<string, number>) {
  const n = MOLS.length;
  const d2 = MOLS.reduce((s, m) => s + Math.pow(a.get(m.name)! - b.get(m.name)!, 2), 0);
  return 1 - (6 * d2) / (n * (n * n - 1));
}

export default function DrugSynthScores({ score = 'sa', threshold = 0.5 }: { score?: Key; threshold?: number }) {
  const [k, setK] = useState<Key>(['sa', 'sc', 'ra'].includes(score) ? score : 'sa');
  const [th, setTh] = useState(Math.max(0.05, Math.min(0.95, threshold)));

  const R = useMemo(() => ({ sa: ranks('sa'), sc: ranks('sc'), ra: ranks('ra') }), []);
  const rows = useMemo(() => [...MOLS].sort((a, b) => diff(a, k) - diff(b, k)), [k]);
  const others = (['sa', 'sc', 'ra'] as Key[]).filter((o) => o !== k);
  const pass = MOLS.filter((m) => diff(m, k) <= th);

  const BL = 128, BR = 302, RH = 30, TOP = 28;
  const H = TOP + MOLS.length * RH + 50;
  const bx = (v: number) => BL + v * (BR - BL);

  return (
    <div>
      <Stage w={320} h={H} label={`Synthesizability scores sorted by ${LABEL[k]}`}>
        <text x={4} y={10} fontSize="8.5" fontWeight="bold" fill="var(--fg)">Three scores, one question: can we make it?</text>
        <text x={BL} y={20} fontSize="6.6" fill="var(--muted)">easy</text>
        <text x={BR} y={20} fontSize="6.6" textAnchor="end" fill="var(--muted)">hard →</text>
        <line x1={BL} x2={BR} y1={23} y2={H - 46} stroke="var(--grid)" strokeWidth={0.5} />
        <line x1={bx(th)} x2={bx(th)} y1={23} y2={H - 46} stroke={COL[k]} strokeWidth={1} strokeDasharray="3 2" />
        <text x={bx(th)} y={H - 38} fontSize="6.2" textAnchor="middle" fill={COL[k]}>threshold</text>

        {rows.map((m, i) => {
          const y0 = TOP + i * RH;
          const ok = diff(m, k) <= th;
          return (
            <g key={m.name} opacity={ok ? 1 : 0.45}>
              <text x={4} y={y0 + 9} fontSize="7.6" fontWeight="bold" fill="var(--fg)">{m.name}</text>
              <text x={4} y={y0 + 18} fontSize="6.2" fill="var(--muted)">{m.note}</text>
              <text x={4} y={y0 + 27} fontSize="6.2" fill="var(--muted)">
                rank SA #{R.sa.get(m.name)} · SC #{R.sc.get(m.name)} · RA #{R.ra.get(m.name)}
              </text>
              {(['sa', 'sc', 'ra'] as Key[]).map((key, j) => {
                const w = Math.max(1.5, (bx(diff(m, key)) - BL));
                return (
                  <g key={key}>
                    <rect x={BL} y={y0 + 2 + j * 8} width={w} height={5.5} rx={1.5}
                      fill={COL[key]} opacity={key === k ? 1 : 0.5} />
                    <text x={BL - 3} y={y0 + 7 + j * 8} fontSize="5.8" textAnchor="end" fill={key === k ? COL[key] : 'var(--muted)'}>
                      {LABEL[key]}
                    </text>
                    <text x={BL + w + 3} y={y0 + 7 + j * 8} fontSize="5.8" fill="var(--muted)">{shown(m, key)}</text>
                  </g>
                );
              })}
            </g>
          );
        })}
        <g fontSize="7.2">
          <text x={4} y={H - 26} fill="var(--fg)">
            Sorted by {LABEL[k]} · {pass.length} of {MOLS.length} molecules pass the filter
          </text>
          <text x={4} y={H - 15} fill="var(--muted)">
            Spearman ρ vs {LABEL[others[0]]} {spearman(R[k], R[others[0]]).toFixed(2)} · vs {LABEL[others[1]]} {spearman(R[k], R[others[1]]).toFixed(2)}
          </text>
          <text x={4} y={H - 4} fontSize="6.6" fill="var(--muted)">
            {k === 'sa' ? 'SAscore calls the hexapeptide hard (big, macrocyclic) though a synthesiser makes it overnight.'
              : k === 'sc' ? 'SCScore scores complexity, not routes: the generated polyheteroarene looks ordinary.'
                : 'RAscore asks a planner for a route — the only score that notices the unmakeable generated molecule.'}
          </text>
        </g>
      </Stage>
      <Controls>
        {(['sa', 'sc', 'ra'] as Key[]).map((key) => (
          <Btn key={key} active={k === key} onClick={() => setK(key)}>{LABEL[key]}</Btn>
        ))}
        <Slider label="pass threshold" min={0.05} max={0.95} step={0.01} value={th} onChange={setTh} />
      </Controls>
    </div>
  );
}
