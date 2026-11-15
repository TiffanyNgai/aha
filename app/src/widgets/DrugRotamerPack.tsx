import { useState } from 'react';
import { Btn, C, Controls, Stage, prefersReducedMotion, rng, useFrame } from './_kit';

/**
 * Fixed-backbone design, the Rosetta way: the backbone is given, and you choose one amino acid (and
 * implicitly one rotamer) at each of six core positions so that the total energy is as low as possible.
 * The toy energy, in arbitrary "energy units", has the flavour of the real Rosetta terms:
 *   packing   — the cavity holds ~900 Å³ of side chain; over-filling is punished hard (like fa_rep),
 *               under-filling leaves a void and is punished gently (like fa_atr + fa_sol);
 *   buriedpolar — +3.5 per polar side chain buried with no partner (like an unsatisfied fa_sol penalty);
 *   strain    — a small cost proportional to side-chain volume (big side chains lose more entropy, like fa_dun);
 *   clash     — +2.2 for each neighbouring pair whose volumes together exceed 400 Å³.
 * Tap a position to cycle its amino acid, or let "anneal" run Metropolis Monte Carlo at a falling
 * temperature — the search Rosetta's packer actually uses. The numbers are a teaching cartoon, not REU.
 * props: { anneal?: boolean (default false), seed?: number (default 5) }
 */
const LIB: [string, number, boolean][] = [
  ['A', 89, false], ['S', 89, true], ['V', 140, false], ['K', 169, true],
  ['L', 167, false], ['I', 167, false], ['F', 190, false], ['W', 228, false],
];
const NPOS = 6;
const TARGET = 900;

function energy(ix: number[]) {
  const vol = ix.reduce((s, k) => s + LIB[k][1], 0);
  const pack = vol > TARGET ? 0.055 * (vol - TARGET) : 0.018 * (TARGET - vol);
  const polar = 3.5 * ix.filter((k) => LIB[k][2]).length;
  const strain = ix.reduce((s, k) => s + 0.009 * LIB[k][1], 0);
  let clash = 0;
  for (let i = 0; i < NPOS; i++) if (LIB[ix[i]][1] + LIB[ix[(i + 1) % NPOS]][1] > 400) clash += 2.2;
  return { pack, polar, strain, clash, total: pack + polar + strain + clash, vol };
}

export default function DrugRotamerPack({ anneal = false, seed = 5 }: { anneal?: boolean; seed?: number }) {
  const [ix, setIx] = useState<number[]>(() => { const g = rng(seed); return Array.from({ length: NPOS }, () => Math.floor(g.u() * LIB.length)); });
  const [run, setRun] = useState(anneal && !prefersReducedMotion());
  const [T, setT] = useState(3);
  const [sd, setSd] = useState(seed);
  const [best, setBest] = useState<number | null>(null);

  useFrame((dt) => {
    const g = rng(Math.floor(Math.random() * 1e9));
    let cur = ix.slice(), e = energy(cur).total, temp = T;
    for (let s = 0; s < 6; s++) {
      const p = Math.floor(g.u() * NPOS), a = Math.floor(g.u() * LIB.length);
      const trial = cur.slice(); trial[p] = a;
      const et = energy(trial).total;
      if (et < e || g.u() < Math.exp(-(et - e) / Math.max(0.05, temp))) { cur = trial; e = et; }
      temp = Math.max(0.05, temp * 0.995);
    }
    setIx(cur);
    setT(Math.max(0.05, T - dt * 0.55));
    setBest((b) => (b === null ? e : Math.min(b, e)));
    if (T <= 0.06) setRun(false);
  }, run);

  const E = energy(ix);
  const cx = 110, cy = 92;
  const terms: [string, number, string][] = [
    ['packing', E.pack, C[1]], ['buried polar', E.polar, C[4]], ['strain', E.strain, C[3]], ['clash', E.clash, C[2]],
  ];

  return (
    <div>
      <Stage w={320} h={222} label={`Fixed-backbone packing, total energy ${E.total.toFixed(1)}`}>
        <circle cx={cx} cy={cy} r={62} fill="var(--grid)" fillOpacity={0.5} stroke="var(--muted)" strokeDasharray="3 3" />
        <text x={cx} y={cy - 70} fontSize="7.5" textAnchor="middle" fill="var(--muted)">fixed backbone · buried core</text>
        {ix.map((k, i) => {
          const a = (2 * Math.PI * i) / NPOS - Math.PI / 2;
          const px = cx + 40 * Math.cos(a), py = cy + 40 * Math.sin(a);
          const [aa, vol, pol] = LIB[k];
          return (
            <g key={i} onClick={() => { setRun(false); setIx(ix.map((q, j) => (j === i ? (q + 1) % LIB.length : q))); }} style={{ cursor: 'pointer' }}>
              <circle cx={px} cy={py} r={3 + 0.055 * vol} fill={pol ? C[4] : C[1]} fillOpacity={0.4} stroke={pol ? C[4] : C[1]} />
              <text x={px} y={py + 3} fontSize="9" textAnchor="middle" fill="var(--fg)" fontWeight="700">{aa}</text>
            </g>
          );
        })}
        <g fontSize="7.5">
          <text x={182} y={24} fill="var(--fg)" fontWeight="700">energy terms</text>
          {terms.map(([n, v, col], k) => (
            <g key={n}>
              <text x={182} y={40 + k * 17} fill="var(--muted)">{n}</text>
              <rect x={182} y={44 + k * 17} width={Math.max(1, Math.min(124, v * 9))} height={6} rx={3} fill={col} opacity={0.85} />
              <text x={310} y={40 + k * 17} textAnchor="end" fill="var(--fg)">{v.toFixed(1)}</text>
            </g>
          ))}
          <text x={182} y={120} fill="var(--fg)" fontWeight="700">total {E.total.toFixed(1)}</text>
          <text x={182} y={132} fill="var(--muted)">core volume {E.vol} / {TARGET} Å³</text>
          <text x={182} y={144} fill="var(--muted)">{best === null ? 'best: —' : `best seen ${best.toFixed(1)}`}</text>
          <text x={6} y={174} fill="var(--fg)">
            Search space: {LIB.length}<tspan baselineShift="super" fontSize="5.5">{NPOS}</tspan> = {Math.pow(LIB.length, NPOS).toLocaleString('en-US')} sequences — and that is six positions with no rotamers.
          </text>
          <text x={6} y={190} fill="var(--muted)">Tap a position to cycle its amino acid. Blue = hydrophobic, purple = polar.</text>
          <text x={6} y={202} fill="var(--muted)">
            Monte-Carlo temperature {T.toFixed(2)} — high T accepts uphill moves, low T only downhill ones.
          </text>
          <text x={6} y={214} fill="var(--muted)">Low energy here means a well-packed, all-hydrophobic core. Real designs score ~20 such terms.</text>
        </g>
      </Stage>
      <Controls>
        <Btn onClick={() => { setT(3); setBest(null); setRun(!run); }}>{run ? '⏸ Pause' : '▶ Anneal'}</Btn>
        <Btn onClick={() => { const g = rng(sd + 1); setSd(sd + 1); setRun(false); setIx(Array.from({ length: NPOS }, () => Math.floor(g.u() * LIB.length))); }}>randomise</Btn>
        <Btn onClick={() => {
          setRun(false);
          let cur = ix.slice();
          for (let i = 0; i < NPOS; i++) {
            let bi = cur[i], be = Infinity;
            for (let k = 0; k < LIB.length; k++) { const tr = cur.slice(); tr[i] = k; const e = energy(tr).total; if (e < be) { be = e; bi = k; } }
            cur[i] = bi;
          }
          setIx(cur);
        }}>greedy pass</Btn>
      </Controls>
    </div>
  );
}
