/**
 * The lifting layer of a p4 group-equivariant CNN (Cohen & Welling 2016) on a 6×6 toy image.
 * One 3×3 filter ψ is rotated by 0°, 90°, 180° and 270° and correlated with the image, giving FOUR
 * output channels indexed by the group elements e, r, r², r³ — a feature map living on the group,
 * not just on the plane. Press "rotate input" and watch what happens: each channel is rotated in
 * space AND the four channels are cyclically permuted, Y'_c = rot90(Y_{c−1}). That joint
 * rotate-and-permute is what equivariance to the group p4 means; summing or maxing over the four
 * channels afterwards turns it into a rotation-invariant feature.
 * props: {
 *   turns?: number     initial rotation of the input, 0–3 quarter turns (default 0)
 *   filter?: number[][]  3×3 filter (default an asymmetric corner detector)
 *   image?: number[][]   6×6 binary image (default an L shape)
 * }
 */
import { useState } from 'react';
import { Btn, Controls, Stage } from './_kit';

const L_IMAGE = [
  [0, 0, 0, 0, 0, 0],
  [0, 1, 0, 0, 0, 0],
  [0, 1, 0, 0, 0, 0],
  [0, 1, 0, 0, 0, 0],
  [0, 1, 1, 1, 0, 0],
  [0, 0, 0, 0, 0, 0],
];
const PSI = [[0, 1, 0], [0, 1, 0], [0, 0, 1]];
const rot90 = (g: number[][]): number[][] => g.map((_, i) => g.map((row) => row[g.length - 1 - i]));
const rotk = (g: number[][], k: number) => { let o = g; for (let t = 0; t < ((k % 4) + 4) % 4; t++) o = rot90(o); return o; };
const corr = (f: number[][], p: number[][]) => {
  const m = f.length - p.length + 1;
  return Array.from({ length: m }, (_, i) => Array.from({ length: m }, (_, j) =>
    p.reduce((s, row, a) => s + row.reduce((t, w, b) => t + w * f[i + a][j + b], 0), 0)));
};
const same = (a: number[][], b: number[][]) => a.every((r, i) => r.every((v, j) => Math.abs(v - b[i][j]) < 1e-9));
const LBL = ['e', 'r', 'r²', 'r³'];

function Grid({ x, y, cell, g, maxAbs, nums }: { x: number; y: number; cell: number; g: number[][]; maxAbs: number; nums?: boolean }) {
  return (
    <g>
      {g.map((row, i) => row.map((v, j) => (
        <rect key={`${i},${j}`} x={x + j * cell} y={y + i * cell} width={cell - 0.6} height={cell - 0.6}
          fill={v === 0 ? 'var(--surface)' : v > 0 ? 'var(--c2)' : 'var(--c5)'} fillOpacity={v === 0 ? 1 : 0.25 + 0.7 * (Math.abs(v) / maxAbs)}
          stroke="var(--grid)" strokeWidth={0.4} />
      )))}
      {nums && g.map((row, i) => row.map((v, j) => (
        <text key={`t${i},${j}`} x={x + j * cell + cell / 2 - 0.3} y={y + i * cell + cell / 2 + 3} fontSize="7.5" textAnchor="middle" fill="var(--fg)">{v}</text>
      )))}
    </g>
  );
}

export default function MlGroupConvP4({ turns = 0, filter = PSI, image = L_IMAGE }: {
  turns?: number; filter?: number[][]; image?: number[][];
}) {
  const [k, setK] = useState(((Math.round(turns) % 4) + 4) % 4);
  const base = image.length === 6 ? image : L_IMAGE;
  const psi = filter.length === 3 ? filter : PSI;

  const img = rotk(base, k);
  const chans = [0, 1, 2, 3].map((c) => corr(img, rotk(psi, c)));
  const chans0 = [0, 1, 2, 3].map((c) => corr(base, rotk(psi, c)));
  const predicted = [0, 1, 2, 3].map((c) => rotk(chans0[(((c - k) % 4) + 4) % 4], k));
  const ok = chans.every((y, c) => same(y, predicted[c]));
  const mx = Math.max(1, ...chans.flat(2).map(Math.abs));
  const pools = chans.map((y) => Math.max(...y.flat()));
  const poolSame = pools.slice().sort().join() === chans0.map((y) => Math.max(...y.flat())).sort().join();

  return (
    <div>
      <Stage h={216} label="p4 lifting convolution: four rotated copies of one filter">
        <text x={8} y={12} fontSize="9" fill="var(--fg)">input, rotated {k * 90}°</text>
        <Grid x={8} y={18} cell={12} g={img} maxAbs={1} />
        <text x={96} y={12} fontSize="9" fill="var(--fg)">filter ψ</text>
        <Grid x={96} y={18} cell={12} g={psi} maxAbs={1} nums />
        <text x={96} y={74} fontSize="8" fill="var(--muted)">rotate ψ by</text>
        <text x={96} y={85} fontSize="8" fill="var(--muted)">0°, 90°, 180°, 270°</text>
        <text x={96} y={100} fontSize="8" fill="var(--c2)">→ 4 channels</text>
        {[0, 1, 2, 3].map((c) => {
          const gx = 164 + (c % 2) * 78, gy = 18 + Math.floor(c / 2) * 80;
          return (
            <g key={c}>
              <text x={gx} y={gy - 3} fontSize="9" fill="var(--fg)">channel {LBL[c]}</text>
              <Grid x={gx} y={gy} cell={13} g={chans[c]} maxAbs={mx} nums />
              <text x={gx} y={gy + 63} fontSize="7.5" fill="var(--muted)">= rot{k * 90}° of {LBL[(((c - k) % 4) + 4) % 4]}⁰</text>
            </g>
          );
        })}
        <text x={8} y={122} fontSize="8" fill="var(--muted)">max over the</text>
        <text x={8} y={132} fontSize="8" fill="var(--muted)">4 channels:</text>
        <text x={8} y={146} fontSize="9" fill="var(--c1)">{pools.map((v, i) => `${LBL[i]}:${v}`).join('  ')}</text>
        <text x={8} y={160} fontSize="8" fill={poolSame ? 'var(--c1)' : 'var(--c5)'}>{poolSame ? 'same multiset ⇒ invariant' : 'multiset changed'}</text>
        <line x1={6} y1={186} x2={314} y2={186} stroke="var(--grid)" strokeWidth={0.6} />
        <text x={8} y={200} fontSize="9" fill={ok ? 'var(--c1)' : 'var(--c5)'}>{ok ? "✓ Y'_c = rot90ᵏ(Y_{c−k}): rotated in space, permuted in channel" : '✗ mismatch'}</text>
        <text x={8} y={212} fontSize="8" fill="var(--muted)">⁰ superscript 0 = the channel of the unrotated input</text>
      </Stage>
      <Controls>
        <Btn onClick={() => setK((k + 1) % 4)}>rotate input 90°</Btn>
        <Btn onClick={() => setK(0)}>reset</Btn>
      </Controls>
    </div>
  );
}
