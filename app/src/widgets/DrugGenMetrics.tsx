import { useMemo, useState } from 'react';
import { Btn, C, Controls, Slider, Stage, rng } from './_kit';

/**
 * Validity / uniqueness / novelty of a batch of generated molecules — and why those three are weak
 * proxies for usefulness. 200 samples are drawn from one of three toy generators:
 *  - 'model'    a SMILES language model sampled at temperature T: higher T gives more diverse strings
 *               but more often broken ones (unclosed rings, impossible valences).
 *  - 'copycat'  a model that has memorised its training set: everything valid, almost nothing novel.
 *  - 'alkane'   a degenerate generator emitting random-length straight-chain alkanes: validity,
 *               uniqueness and novelty all ≈ 100 %, usefulness ≈ 0.
 * Each sample is a dot: red = invalid, grey = duplicate of an earlier sample, blue = valid and unique
 * but already in the training set, green = valid + unique + novel. Faded dots fail a drug-likeness
 * filter — the thing the usual three metrics never measure. Rates are illustrative, not fitted.
 * props: { generator?: 'model'|'copycat'|'alkane' (default 'model'), temperature?: number (0.2–2, default 0.8),
 *          n?: number (default 200), seed?: number (default 7) }
 */
type Gen = 'model' | 'copycat' | 'alkane';

const RATES: Record<Gen, (T: number) => { valid: number; dup: number; known: number; drug: number }> = {
  model: (T) => ({
    valid: Math.max(0.08, 1 - 0.14 * T * T),
    dup: 0.55 * Math.exp(-1.8 * T),
    known: 0.35 * Math.exp(-1.5 * T),
    drug: 0.62 * Math.exp(-0.45 * Math.max(0, T - 0.5)),
  }),
  copycat: () => ({ valid: 0.99, dup: 0.78, known: 0.9, drug: 0.9 }),
  alkane: () => ({ valid: 1, dup: 0.04, known: 0.02, drug: 0.02 }),
};

const LABEL: Record<Gen, string> = {
  model: 'SMILES language model',
  copycat: 'memorised the training set',
  alkane: 'random alkane chains',
};

export default function DrugGenMetrics({ generator = 'model', temperature = 0.8, n = 200, seed = 7 }: {
  generator?: Gen; temperature?: number; n?: number; seed?: number;
}) {
  const [gen, setGen] = useState<Gen>(generator);
  const [T, setT] = useState(Math.max(0.2, Math.min(2, temperature)));
  const N = Math.max(40, Math.min(300, Math.round(n)));

  const { cats, drugs, m } = useMemo(() => {
    const r = RATES[gen](T);
    const g = rng(seed + Math.round(T * 50) + gen.length * 31);
    const cats: number[] = []; const drugs: boolean[] = [];
    for (let i = 0; i < N; i++) {
      let c = 3;
      if (g.u() > r.valid) c = 0;
      else if (g.u() < r.dup) c = 1;
      else if (g.u() < r.known) c = 2;
      cats.push(c);
      drugs.push(c > 0 && g.u() < r.drug);
    }
    const nInv = cats.filter((c) => c === 0).length;
    const nDup = cats.filter((c) => c === 1).length;
    const nKnown = cats.filter((c) => c === 2).length;
    const nNovel = cats.filter((c) => c === 3).length;
    const valid = N - nInv;
    const uniq = nKnown + nNovel;
    return {
      cats, drugs,
      m: [
        ['validity', valid / N, `${valid}/${N} parse`],
        ['uniqueness', uniq / Math.max(1, valid), `${uniq}/${valid} valid are distinct`],
        ['novelty', nNovel / Math.max(1, uniq), `${nNovel}/${uniq} unseen in training`],
        ['drug-like', drugs.filter(Boolean).length / N, `${drugs.filter(Boolean).length}/${N} pass a QED-style filter`],
      ] as [string, number, string][],
    };
  }, [gen, T, N, seed]);

  const cols = 20, dx = 14.4, dy = 9, x0 = 16, y0 = 26;
  const fill = [C[4], 'var(--muted)', C[1], C[0]];
  const BL = 86, BR = 302;

  return (
    <div>
      <Stage w={320} h={246} label={`Generated batch: validity ${(m[0][1] * 100).toFixed(0)}%, novelty ${(m[2][1] * 100).toFixed(0)}%`}>
        <text x={16} y={12} fontSize="8.5" fill="var(--fg)" fontWeight="bold">{N} sampled molecules — {LABEL[gen]}</text>
        <text x={16} y={21} fontSize="7.5" fill="var(--muted)">faded = fails a drug-likeness filter</text>
        {cats.map((c, i) => (
          <circle key={i} cx={x0 + (i % cols) * dx} cy={y0 + Math.floor(i / cols) * dy} r={2.9}
            fill={fill[c]} opacity={drugs[i] ? 1 : 0.3} />
        ))}
        <g fontSize="7.5" fill="var(--muted)">
          {[['invalid', 0], ['duplicate', 1], ['in training set', 2], ['novel', 3]].map(([t, c], i) => (
            <g key={i} transform={`translate(${16 + i * 76}, ${y0 + Math.ceil(N / cols) * dy + 6})`}>
              <circle cx={0} cy={-2.5} r={2.9} fill={fill[c as number]} />
              <text x={6} y={0}>{t as string}</text>
            </g>
          ))}
        </g>
        {m.map(([name, v, note], i) => {
          const y = 140 + i * 26;
          return (
            <g key={name}>
              <text x={2} y={y + 4} fontSize="8.5" fill="var(--fg)" fontWeight={i === 3 ? 'bold' : 'normal'}>{name}</text>
              <rect x={BL} y={y - 6} width={BR - BL} height={11} fill="var(--grid)" rx={2} />
              <rect x={BL} y={y - 6} width={Math.max(1, v * (BR - BL))} height={11} rx={2}
                fill={i === 3 ? C[2] : C[5]} opacity={0.85} />
              <text x={BL + 4} y={y + 2.5} fontSize="8" fill="var(--fg)" fontWeight="bold">{(v * 100).toFixed(0)}%</text>
              <text x={2} y={y + 15} fontSize="7" fill="var(--muted)">{note}</text>
            </g>
          );
        })}
      </Stage>
      <Controls>
        {(['model', 'copycat', 'alkane'] as Gen[]).map((g) => (
          <Btn key={g} active={gen === g} onClick={() => setGen(g)}>{g}</Btn>
        ))}
        {gen === 'model' && <Slider label="temperature T" min={0.2} max={2} step={0.05} value={T} onChange={setT} />}
      </Controls>
    </div>
  );
}
