import { useMemo, useState } from 'react';
import { Btn, C, Controls, Slider, Stage, pathOf, rng, scale, useFrame, prefersReducedMotion } from './_kit';

/**
 * A walk through the latent space of a molecular VAE, in 2D.
 * Grey dots are encoded training molecules; they lie near a curved low-dimensional "data manifold".
 * A and B are two real drugs (paracetamol and ibuprofen). The dashed chord is the straight-line
 * interpolation between their codes; the slider moves z along it and the decoded SMILES is printed.
 * Background shading = how reliably the decoder produces a valid molecule there (modelled as a
 * Gaussian falling off with distance to the nearest training code, σ = 0.9): the middle of the chord
 * leaves the manifold, and the decode there is broken (an unclosed ring/branch).
 * The "objective" view instead shades a surrogate property model's prediction; its optimum (★) sits
 * off the manifold, which is why latent optimisation must be kept inside the data region.
 * Decoded strings are illustrative real molecules, not the output of a trained model.
 * props: { t?: number (0–1, default 0), field?: 'validity'|'objective' (default 'validity'),
 *          animate?: boolean (default false), seed?: number (default 5) }
 */
const STEPS: [string, string, boolean][] = [
  ['CC(=O)NC1=CC=C(O)C=C1', 'paracetamol', true],
  ['CC(=O)NC1=CC=C(C)C=C1', "4'-methylacetanilide", true],
  ['CC(=O)NC1=CC=C(C=C1)C(C)C', '4-isopropylacetanilide', true],
  ['CC(=O)NC1=CC=C(C=C1)C(C)C(=O)O', '2-(4-acetamidophenyl)propanoic acid', true],
  ['CC(=O)NC1=CC=C(C=C1C(C)C(=O)O', 'unclosed ring + branch — not a molecule', false],
  ['CCNC1=CC=C(C=C1)C(C)C(=O)O', '2-(4-ethylaminophenyl)propanoic acid', true],
  ['CC(C)NC1=CC=C(C=C1)C(C)C(=O)O', 'isopropylamino analogue', true],
  ['CC(C)OC1=CC=C(C=C1)C(C)C(=O)O', 'isopropoxy analogue', true],
  ['CC(C)CC1=CC=C(C=C1)C(C)C(=O)O', 'ibuprofen', true],
];

/** Points on the curved manifold, parameterised by u in [0,1]. */
const arc = (u: number): [number, number] => [-2.6 + 5.2 * u, 1.5 * Math.sin(Math.PI * u) - 0.6];

export default function DrugLatentWalk({ t = 0, field = 'validity', animate = false, seed = 5 }: {
  t?: number; field?: 'validity' | 'objective'; animate?: boolean; seed?: number;
}) {
  const [tt, setTt] = useState(Math.max(0, Math.min(1, t)));
  const [mode, setMode] = useState<'validity' | 'objective'>(field);
  const [run, setRun] = useState(animate && !prefersReducedMotion());
  useFrame((dt) => setTt((x) => (x + dt * 0.18) % 1), run);

  const train = useMemo(() => {
    const g = rng(seed);
    return Array.from({ length: 90 }, () => {
      const u = g.u();
      const [a, b] = arc(u);
      return [a + 0.26 * g.normal(), b + 0.26 * g.normal()] as [number, number];
    });
  }, [seed]);

  const A = arc(0), B = arc(1);
  const zStar: [number, number] = [1.1, -2.1]; // surrogate optimum, off the manifold
  const z: [number, number] = [A[0] + tt * (B[0] - A[0]), A[1] + tt * (B[1] - A[1])];

  const validity = (p: [number, number]) => {
    let d2 = Infinity;
    for (const q of train) d2 = Math.min(d2, (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2);
    return Math.exp(-d2 / (2 * 0.9 * 0.9));
  };
  const objective = (p: [number, number]) =>
    Math.exp(-(((p[0] - zStar[0]) ** 2) / 4.5 + ((p[1] - zStar[1]) ** 2) / 3.0));

  const L = 10, R = 310, T = 14, Bm = 150;
  const sx = scale([-3.4, 3.4], [L, R]);
  const sy = scale([-3.0, 2.6], [Bm, T]);

  const grid = useMemo(() => {
    const out: [number, number, number, number][] = [];
    const nx = 34, ny = 22;
    for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) {
      const px = -3.4 + (6.8 * (i + 0.5)) / nx, py = -3.0 + (5.6 * (j + 0.5)) / ny;
      out.push([sx(px), sy(py), mode === 'validity' ? validity([px, py]) : objective([px, py]), 0]);
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, train]);

  const k = Math.min(STEPS.length - 1, Math.round(tt * (STEPS.length - 1)));
  const [smiles, name, ok] = STEPS[k];
  const v = validity(z), o = objective(z);
  const cellW = (R - L) / 34 + 0.6, cellH = (Bm - T) / 22 + 0.6;

  return (
    <div>
      <Stage w={320} h={222} label={`Latent walk at t = ${tt.toFixed(2)}, decoder validity ${(v * 100).toFixed(0)}%`}>
        {grid.map(([x, y, w], i) => (
          <rect key={i} x={x - cellW / 2} y={y - cellH / 2} width={cellW} height={cellH}
            fill={mode === 'validity' ? C[0] : C[3]} opacity={0.06 + 0.5 * w} />
        ))}
        {train.map((p, i) => <circle key={i} cx={sx(p[0])} cy={sy(p[1])} r={1.7} fill="var(--muted)" opacity={0.75} />)}
        <path d={pathOf([[sx(A[0]), sy(A[1])], [sx(B[0]), sy(B[1])]])} stroke="var(--fg)" strokeWidth={1}
          strokeDasharray="4 3" fill="none" />
        {mode === 'objective' && (
          <g>
            <text x={sx(zStar[0])} y={sy(zStar[1]) + 4} fontSize="13" textAnchor="middle" fill={C[4]}>★</text>
            <text x={sx(zStar[0])} y={sy(zStar[1]) + 14} fontSize="7" textAnchor="middle" fill={C[4]}>surrogate optimum</text>
          </g>
        )}
        {[[A, 'A'], [B, 'B']].map(([p, lab], i) => (
          <g key={i}>
            <circle cx={sx((p as number[])[0])} cy={sy((p as number[])[1])} r={4.5} fill={C[1]} stroke="var(--surface)" />
            <text x={sx((p as number[])[0])} y={sy((p as number[])[1]) - 7} fontSize="8" textAnchor="middle" fill={C[1]} fontWeight="bold">{lab as string}</text>
          </g>
        ))}
        <circle cx={sx(z[0])} cy={sy(z[1])} r={5} fill={ok ? C[2] : C[4]} stroke="var(--fg)" strokeWidth={0.8} />
        <text x={L + 2} y={T + 8} fontSize="7.5" fill="var(--muted)">
          {mode === 'validity' ? 'shading: P(decoder gives a valid molecule)' : 'shading: surrogate property prediction'}
        </text>
        <text x={R} y={Bm - 3} fontSize="7.5" textAnchor="end" fill="var(--muted)">grey dots = encoded training molecules</text>
        <g fontSize="8">
          <text x={4} y={Bm + 16} fill="var(--fg)">t = {tt.toFixed(2)} · decoder validity {(v * 100).toFixed(0)}% · surrogate {o.toFixed(2)}</text>
          <text x={4} y={Bm + 30} fill={ok ? C[0] : C[4]} fontWeight="bold" fontFamily="ui-monospace, monospace">{smiles}</text>
          <text x={4} y={Bm + 42} fill={ok ? 'var(--muted)' : C[4]}>{ok ? '✓ valid — ' : '✗ invalid — '}{name}</text>
          <text x={4} y={Bm + 58} fill="var(--muted)" fontSize="7.5">
            {mode === 'validity'
              ? 'The chord leaves the data manifold near t = 0.5, and the decode breaks.'
              : 'Maximising the surrogate pulls you to ★, where the decoder no longer works.'}
          </text>
        </g>
      </Stage>
      <Controls>
        <Slider label="t (A → B)" min={0} max={1} step={0.005} value={tt} onChange={(x) => { setRun(false); setTt(x); }} />
        <Btn onClick={() => setRun(!run)}>{run ? '⏸ Pause' : '▶ Walk'}</Btn>
        <Btn active={mode === 'validity'} onClick={() => setMode('validity')}>validity</Btn>
        <Btn active={mode === 'objective'} onClick={() => setMode('objective')}>objective</Btn>
      </Controls>
    </div>
  );
}
