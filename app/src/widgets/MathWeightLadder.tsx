import { useState } from 'react';
import { Btn, Controls, Stage } from './_kit';

/**
 * Weights and ladder operators of the spin-j irreducible representation of su(2) ≅ so(3).
 * The rungs are the weights m = j, j−1, …, −j (eigenvalues of J_z). Press J₊ / J₋ to move the
 * highlighted state up or down; the arrow is labelled with the exact matrix element
 * √(j(j+1) − m(m±1)), which vanishes at the top and bottom rung — that is what makes the
 * representation finite-dimensional, of dimension 2j+1.
 * Right panel (optional): the Clebsch–Gordan decomposition j ⊗ j₂ = (j+j₂) ⊕ … ⊕ |j−j₂|,
 * with the dimension check (2j+1)(2j₂+1) = Σ (2J+1).
 * props: { j?: number (0, 0.5, 1, …, 3; default 1), j2?: number (default 0.5),
 *          m?: number (starting weight, default j), showTensor?: boolean (default true),
 *          jList?: number[] (buttons, default [0, 0.5, 1, 1.5, 2]) }
 */
const HALF = ['0', '½', '1', '3/2', '2', '5/2', '3', '7/2', '4'];
const sj = (x: number) => {
  const k = Math.round(2 * x);
  if (k >= 0 && k < HALF.length) return HALF[k];
  return (k % 2 ? `${k}/2` : String(k / 2));
};
const sm = (x: number) => (x < 0 ? '−' + sj(-x) : sj(x));
const Y0 = 46, Y1 = 162, LX0 = 50, LX1 = 128;

export default function MathWeightLadder({ j = 1, j2 = 0.5, m: m0, showTensor = true, jList = [0, 0.5, 1, 1.5, 2] }: {
  j?: number; j2?: number; m?: number; showTensor?: boolean; jList?: number[];
}) {
  const [J, setJ] = useState(Math.max(0, Math.min(4, Math.round(2 * j) / 2)));
  const [m, setM] = useState(m0 ?? Math.max(0, Math.min(4, Math.round(2 * j) / 2)));
  const n = Math.round(2 * J) + 1;
  const mm = Math.max(-J, Math.min(J, Math.round(m - J) + J)); // snap into the ladder
  const ys = (v: number) => (n === 1 ? (Y0 + Y1) / 2 : Y1 - ((v + J) / (2 * J)) * (Y1 - Y0));
  const coef = (v: number, up: boolean) => Math.sqrt(Math.max(0, J * (J + 1) - v * (v + (up ? 1 : -1))));
  const up = coef(mm, true), dn = coef(mm, false);

  const Jt = Math.round(2 * Math.max(0, Math.min(4, j2))) / 2;
  const parts: number[] = [];
  for (let k = Math.abs(J - Jt); k <= J + Jt + 1e-9; k += 1) parts.push(+k.toFixed(1));
  const total = parts.reduce((a, v) => a + 2 * v + 1, 0);

  return (
    <div>
      <Stage w={320} h={212} label="Weights and ladder operators of the spin-j representation of su(2)">
        <text x={8} y={16} fontSize="10" fontWeight="bold" fill="var(--c2)">spin j = {sj(J)} · dim = {n}</text>
        <text x={8} y={29} fontSize="8.5" fill="var(--muted)">weights m (eigenvalues of J_z)</text>
        {Array.from({ length: n }, (_, i) => J - i).map((v) => {
          const y = ys(v), cur = Math.abs(v - mm) < 1e-9;
          return <g key={v}>
            <line x1={LX0} x2={LX1} y1={y} y2={y} stroke={cur ? 'var(--c2)' : 'var(--grid)'} strokeWidth={cur ? 2.4 : 1.4} />
            <text x={LX0 - 6} y={y + 3.5} fontSize="9.5" textAnchor="end" fill={cur ? 'var(--c2)' : 'var(--muted)'} fontWeight={cur ? 'bold' : 'normal'}>{sm(v)}</text>
            {cur && <circle cx={(LX0 + LX1) / 2} cy={y} r={4.6} fill="var(--c2)" />}
          </g>;
        })}
        {/* ladder arrows out of the current rung */}
        {n > 1 && <g fontSize="8.5">
          {up > 1e-9 && <g>
            <line x1={LX1 - 14} x2={LX1 - 14} y1={ys(mm) - 3} y2={ys(mm + 1) + 5} stroke="var(--c1)" strokeWidth={1.6} markerEnd="" />
            <polygon points={`${LX1 - 14},${ys(mm + 1) + 1} ${LX1 - 17.5},${ys(mm + 1) + 7} ${LX1 - 10.5},${ys(mm + 1) + 7}`} fill="var(--c1)" />
            <text x={LX1 + 2} y={(ys(mm) + ys(mm + 1)) / 2 + 3} fill="var(--c1)">J₊ · {up.toFixed(2)}</text>
          </g>}
          {dn > 1e-9 && <g>
            <line x1={LX0 + 14} x2={LX0 + 14} y1={ys(mm) + 3} y2={ys(mm - 1) - 5} stroke="var(--c5)" strokeWidth={1.6} />
            <polygon points={`${LX0 + 14},${ys(mm - 1) - 1} ${LX0 + 10.5},${ys(mm - 1) - 7} ${LX0 + 17.5},${ys(mm - 1) - 7}`} fill="var(--c5)" />
            <text x={LX0 + 20} y={(ys(mm) + ys(mm - 1)) / 2 + 3} fill="var(--c5)">J₋ · {dn.toFixed(2)}</text>
          </g>}
        </g>}
        <text x={8} y={180} fontSize="9" fill={up < 1e-9 ? 'var(--c1)' : 'var(--muted)'}>{up < 1e-9 ? 'J₊ kills the top weight → 0' : `J₊|j,m⟩ = ${up.toFixed(3)} |j,m+1⟩`}</text>
        <text x={8} y={192} fontSize="9" fill={dn < 1e-9 ? 'var(--c5)' : 'var(--muted)'}>{dn < 1e-9 ? 'J₋ kills the bottom weight → 0' : `J₋|j,m⟩ = ${dn.toFixed(3)} |j,m−1⟩`}</text>
        <text x={8} y={205} fontSize="9" fill="var(--c3)">Casimir J² = j(j+1) = {(J * (J + 1)).toFixed(2)} on every rung</text>

        {showTensor && <g>
          <line x1={176} x2={176} y1={10} y2={160} stroke="var(--grid)" strokeWidth={1} />
          <text x={186} y={16} fontSize="9.5" fontWeight="bold" fill="var(--c4)">j ⊗ j₂ with j₂ = {sj(Jt)}</text>
          <text x={186} y={34} fontSize="10">{sj(J)} ⊗ {sj(Jt)} =</text>
          {parts.map((p, i) => (
            <text key={p} x={196} y={50 + i * 14} fontSize="9.5" fill="var(--c4)">
              {i ? '⊕ ' : '  '}spin {sj(p)}  (dim {2 * p + 1})
            </text>
          ))}
          <text x={186} y={54 + parts.length * 14} fontSize="8.5" fill="var(--muted)">
            {n}·{2 * Jt + 1} = {n * (2 * Jt + 1)} = {total} ✓
          </text>
        </g>}
      </Stage>
      <Controls>
        <Btn onClick={() => setM(Math.min(J, mm + 1))}>J₊ raise</Btn>
        <Btn onClick={() => setM(Math.max(-J, mm - 1))}>J₋ lower</Btn>
        <Btn onClick={() => setM(J)}>top weight</Btn>
      </Controls>
      <Controls>
        {jList.map((v) => <Btn key={v} active={Math.abs(J - v) < 1e-9} onClick={() => { setJ(v); setM(v); }}>j = {sj(v)}</Btn>)}
      </Controls>
    </div>
  );
}
