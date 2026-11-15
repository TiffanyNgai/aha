import { useState } from 'react';
import { Btn, C, Controls, Stage } from './_kit';

/**
 * Forward reaction prediction as sequence-to-sequence translation, Molecular Transformer style
 * (Schwaller et al. 2019): the reaction SMILES "reactants > reagents" is tokenised atom by atom and the
 * decoder writes the product SMILES one token at a time. Beam search returns a ranked list of candidate
 * products; the softmax probability of each beam is the model's "confidence".
 * Pick a reaction to see its token strip and the top-3 beams. The easy case is answered confidently and
 * correctly; the selectivity case splits the beams, which is a usable uncertainty signal; the third case
 * is a pair of reactants that do not react, where the model confidently invents a product because
 * "no reaction" is not something a translation model can say.
 * Tokens are real SMILES tokens; the probabilities are illustrative, chosen to show the behaviour, not
 * the output of a trained model.
 * props: { case?: number (0–2, default 0), beams?: number (1–3, default 3) }
 */

interface Beam { smiles: string; p: number; name: string; right: boolean }
interface Case {
  title: string; tag: string; reactants: string[]; reagent: string;
  beams: Beam[]; moral: string;
}

const CASES: Case[] = [
  {
    title: 'Amide coupling', tag: 'thousands of examples in the training set',
    reactants: ['C', 'C', '(', '=', 'O', ')', 'C', 'l', '.', 'N', 'C', 'c', '1', 'c', 'c', 'c', 'c', 'c', '1'],
    reagent: 'Et3N, CH2Cl2',
    beams: [
      { smiles: 'CC(=O)NCc1ccccc1', p: 0.96, name: 'N-benzylacetamide', right: true },
      { smiles: 'CC(=O)OCc1ccccc1', p: 0.02, name: 'benzyl acetate', right: false },
      { smiles: 'CC(=O)O', p: 0.01, name: 'acetic acid (hydrolysis)', right: false },
    ],
    moral: 'A reaction the model has seen thousands of times: right answer, and the confidence means something.',
  },
  {
    title: 'Chemoselectivity: amine vs alcohol', tag: 'two nucleophiles, one acylating agent',
    reactants: ['N', 'C', 'C', 'O', '.', 'C', 'C', '(', '=', 'O', ')', 'O', 'C', '(', 'C', ')', '=', 'O'],
    reagent: '0 °C, 1 equiv',
    beams: [
      { smiles: 'CC(=O)NCCO', p: 0.81, name: 'N-acylated (correct: N is more nucleophilic)', right: true },
      { smiles: 'CC(=O)OCCN', p: 0.14, name: 'O-acylated', right: false },
      { smiles: 'CC(=O)NCCOC(C)=O', p: 0.04, name: 'double acylation', right: false },
    ],
    moral: 'Selectivity questions split the beams. The spread between beam 1 and beam 2 is a usable uncertainty signal.',
  },
  {
    title: 'A reaction that does not happen', tag: 'no Lewis acid, so nothing should react',
    reactants: ['c', '1', 'c', 'c', 'c', 'c', 'c', '1', '.', 'C', 'C', 'O', 'C', '(', 'C', ')', '=', 'O'],
    reagent: 'none (no AlCl3)',
    beams: [
      { smiles: 'CC(=O)c1ccccc1', p: 0.72, name: 'acetophenone — a Friedel–Crafts product', right: false },
      { smiles: 'c1ccccc1', p: 0.14, name: 'benzene unchanged — the real outcome', right: true },
      { smiles: 'CC(=O)Oc1ccccc1', p: 0.06, name: 'phenyl acetate', right: false },
    ],
    moral: 'A translation model must emit a product: "no reaction" is not in its vocabulary unless it was trained to say so.',
  },
];

export default function DrugReactionPredict({ case: c0 = 0, beams = 3 }: { case?: number; beams?: number }) {
  const [c, setC] = useState(Math.max(0, Math.min(CASES.length - 1, Math.round(c0))));
  const [n, setN] = useState(Math.max(1, Math.min(3, Math.round(beams))));
  const K = CASES[c];
  const list = K.beams.slice(0, n);

  const TW = 13.5, perRow = 22;
  const rows = Math.ceil(K.reactants.length / perRow);
  const BT = 56 + rows * 18;

  return (
    <div>
      <Stage w={320} h={BT + 96} label={`Forward prediction for ${K.title}`}>
        <text x={4} y={10} fontSize="8.3" fontWeight="bold" fill="var(--fg)">{K.title}</text>
        <text x={4} y={19} fontSize="6.5" fill="var(--muted)">{K.tag}</text>
        <text x={4} y={32} fontSize="6.8" fill="var(--muted)">input tokens (reaction SMILES, one per box):</text>
        {K.reactants.map((t, i) => {
          const row = Math.floor(i / perRow), col = i % perRow;
          return (
            <g key={i}>
              <rect x={5 + col * TW} y={38 + row * 18} width={TW - 1.5} height={13} rx={2}
                fill={t === '.' ? C[3] : 'var(--surface)'} opacity={t === '.' ? 0.35 : 1} stroke="var(--grid)" strokeWidth={0.6} />
              <text x={5 + (col + 0.5) * TW - 0.75} y={47.5 + row * 18} fontSize="7" textAnchor="middle"
                fontFamily="ui-monospace, monospace" fill="var(--fg)">{t}</text>
            </g>
          );
        })}
        <text x={4} y={BT - 4} fontSize="6.6" fill="var(--muted)">reagents / conditions: {K.reagent}</text>
        <text x={4} y={BT + 10} fontSize="7" fill="var(--fg)" fontWeight="bold">decoder beams →</text>
        {list.map((b, i) => {
          const y = BT + 20 + i * 18;
          return (
            <g key={i}>
              <rect x={5} y={y} width={Math.max(3, 230 * b.p)} height={6} rx={1.5} fill={b.right ? C[0] : C[4]} opacity={0.75} />
              <text x={240} y={y + 6} fontSize="6.8" fill="var(--fg)">p = {b.p.toFixed(2)}</text>
              <text x={5} y={y + 14.5} fontSize="6.6" fontFamily="ui-monospace, monospace" fill={b.right ? C[0] : 'var(--muted)'}>
                {b.smiles}
              </text>
              <text x={5 + b.smiles.length * 4.1 + 6} y={y + 14.5} fontSize="6.2" fill="var(--muted)">{b.name}</text>
            </g>
          );
        })}
        <text x={4} y={BT + 30 + n * 18} fontSize="6.6" fill="var(--muted)">{K.moral}</text>
        <text x={4} y={BT + 42 + n * 18} fontSize="6.4" fill="var(--muted)">
          Beam probabilities are the product of the per-token softmaxes, renormalised over the beams kept.
        </text>
      </Stage>
      <Controls>
        {CASES.map((k, i) => <Btn key={i} active={c === i} onClick={() => setC(i)}>{['easy', 'selective', 'no reaction'][i]}</Btn>)}
        <Btn onClick={() => setN(n === 3 ? 1 : n + 1)}>beams: {n}</Btn>
      </Controls>
    </div>
  );
}
