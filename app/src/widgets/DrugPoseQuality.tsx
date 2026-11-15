import { useMemo, useState } from 'react';
import { Btn, C, Controls, Slider, Stage, scale } from './_kit';

/**
 * Why "RMSD < 2 Å" is not enough: a toy 2D pose checked the PoseBusters way.
 * The pale ligand is the crystal (reference) pose inside a pocket of protein atoms; the solid one is
 * the prediction, which you move, rotate, stretch the bonds of and twist a torsion in. The readout
 * gives the symmetry-naive heavy-atom RMSD (1 layout unit = 1.6 Å) next to four physical-plausibility
 * checks of the kind PoseBusters runs: bond lengths within 25 % of the reference, no intramolecular
 * clash, no steric clash with the protein, and no badly eclipsed torsion. A pose is only counted as a
 * success if it passes the RMSD test AND every check.
 * props: { dx?: number (−2–2, default 0), angle?: number (degrees, default 0), bond?: number (0.6–1.5,
 *          default 1), torsion?: number (degrees, default 180) }
 */
const REF: [number, number][] = [[-2.0, 0.1], [-1.1, 0.65], [-0.1, 0.25], [0.9, 0.75], [1.9, 0.35], [-0.2, -0.85], [0.6, -1.5]];
const BONDS: [number, number][] = [[0, 1], [1, 2], [2, 3], [3, 4], [2, 5], [5, 6]];
const BRANCH = [5, 6];
const UNIT = 1.6; // Å per layout unit

const POCKET: [number, number][] = [];
for (let a = 28; a <= 332; a += 19) POCKET.push([3.5 * Math.cos((a * Math.PI) / 180), 3.3 * Math.sin((a * Math.PI) / 180)]);

export default function DrugPoseQuality({ dx = 0, angle = 0, bond = 1, torsion = 180 }: {
  dx?: number; angle?: number; bond?: number; torsion?: number;
}) {
  const [off, setOff] = useState(Math.max(-2, Math.min(2, dx)));
  const [rot, setRot] = useState(angle);
  const [bl, setBl] = useState(Math.max(0.6, Math.min(1.5, bond)));
  const [tor, setTor] = useState(torsion);

  const pred = useMemo(() => {
    const cx = REF.reduce((s, p) => s + p[0], 0) / REF.length;
    const cy = REF.reduce((s, p) => s + p[1], 0) / REF.length;
    const th = (rot * Math.PI) / 180;
    // rotate the branch about atom 2 by (tor − 180)°
    const base = REF.map((p, i) => {
      if (!BRANCH.includes(i)) return p;
      const a = ((tor - 180) * Math.PI) / 180;
      const vx = p[0] - REF[2][0], vy = p[1] - REF[2][1];
      return [REF[2][0] + vx * Math.cos(a) - vy * Math.sin(a), REF[2][1] + vx * Math.sin(a) + vy * Math.cos(a)] as [number, number];
    });
    return base.map(([x, y]) => {
      const ux = (x - cx) * bl, uy = (y - cy) * bl;
      return [cx + ux * Math.cos(th) - uy * Math.sin(th) + off, cy + ux * Math.sin(th) + uy * Math.cos(th) + off * 0.25] as [number, number];
    });
  }, [off, rot, bl, tor]);

  const rmsd = UNIT * Math.sqrt(pred.reduce((s, p, i) => s + (p[0] - REF[i][0]) ** 2 + (p[1] - REF[i][1]) ** 2, 0) / REF.length);

  const bonded = new Set(BONDS.flatMap(([a, b]) => [`${a}-${b}`, `${b}-${a}`]));
  let minIntra = Infinity;
  for (let i = 0; i < pred.length; i++) for (let j = i + 1; j < pred.length; j++) {
    if (bonded.has(`${i}-${j}`)) continue;
    minIntra = Math.min(minIntra, Math.hypot(pred[i][0] - pred[j][0], pred[i][1] - pred[j][1]));
  }
  let minProt = Infinity;
  for (const p of pred) for (const q of POCKET) minProt = Math.min(minProt, Math.hypot(p[0] - q[0], p[1] - q[1]));
  const strain = 0.5 * (1 - Math.cos((3 * tor * Math.PI) / 180));

  const checks: [string, boolean, string][] = [
    ['bond lengths', Math.abs(bl - 1) <= 0.25, `${(bl * 100).toFixed(0)}% of reference`],
    ['no internal clash', minIntra * UNIT >= 1.8, `closest non-bonded pair ${(minIntra * UNIT).toFixed(1)} Å`],
    ['no protein clash', minProt * UNIT >= 2.1, `closest protein atom ${(minProt * UNIT).toFixed(1)} Å`],
    ['torsion not eclipsed', strain < 0.75, `strain ${strain.toFixed(2)}`],
  ];
  const allOk = checks.every((c) => c[1]);
  const near = rmsd < 2;

  const sx = scale([-4.6, 4.6], [20, 196]);
  const sy = scale([-4.2, 4.2], [156, 16]);
  const lig = (pts: [number, number][], col: string, op: number) => (
    <g opacity={op}>
      {BONDS.map(([a, b], i) => (
        <line key={i} x1={sx(pts[a][0])} y1={sy(pts[a][1])} x2={sx(pts[b][0])} y2={sy(pts[b][1])} stroke={col} strokeWidth={2.4} strokeLinecap="round" />
      ))}
      {pts.map((p, i) => <circle key={i} cx={sx(p[0])} cy={sy(p[1])} r={3.2} fill={col} />)}
    </g>
  );

  return (
    <div>
      <Stage w={320} h={196} label={`RMSD ${rmsd.toFixed(2)} Å; physical checks ${allOk ? 'pass' : 'fail'}`}>
        {POCKET.map((p, i) => <circle key={i} cx={sx(p[0])} cy={sy(p[1])} r={5.5} fill={C[3]} opacity={0.22} stroke={C[3]} strokeWidth={0.6} />)}
        <text x={20} y={12} fontSize="7.5" fill="var(--muted)">protein pocket atoms</text>
        {lig(REF, 'var(--muted)', 0.55)}
        {lig(pred, allOk && near ? C[0] : C[4], 1)}
        <g fontSize="8">
          <text x={206} y={22} fill="var(--fg)" fontWeight="bold">RMSD {rmsd.toFixed(2)} Å</text>
          <text x={206} y={33} fill={near ? C[0] : C[4]}>{near ? '✓ under 2 Å' : '✗ over 2 Å'}</text>
          {checks.map(([name, ok, note], i) => (
            <g key={name}>
              <text x={206} y={50 + i * 20} fill={ok ? C[0] : C[4]} fontSize="7.5">{ok ? '✓' : '✗'} {name}</text>
              <text x={206} y={59 + i * 20} fill="var(--muted)" fontSize="6.5">{note}</text>
            </g>
          ))}
          <text x={206} y={136} fontSize="8" fontWeight="bold" fill={near && allOk ? C[0] : C[4]}>
            {near && allOk ? 'counted as a hit' : near ? 'close but' : 'wrong pose'}
          </text>
          <text x={206} y={146} fontSize="8" fontWeight="bold" fill={near && allOk ? C[0] : C[4]}>
            {near && allOk ? '' : near ? 'not physical' : ''}
          </text>
        </g>
        <text x={20} y={176} fontSize="7.5" fill="var(--muted)">pale = crystal pose · solid = prediction · 1 unit = 1.6 Å</text>
        <text x={20} y={188} fontSize="7.5" fill="var(--fg)">
          {near && !allOk ? 'A pose can be "accurate" by RMSD and still be impossible.' : near && allOk ? 'Accurate and physically plausible.' : 'Too far from the crystal pose to count.'}
        </text>
      </Stage>
      <Controls>
        <Slider label="shift" min={-2} max={2} step={0.02} value={off} onChange={setOff} />
        <Slider label="rotate °" min={-180} max={180} step={1} value={rot} onChange={setRot} format={(v) => v.toFixed(0)} />
        <Slider label="bond length ×" min={0.6} max={1.5} step={0.01} value={bl} onChange={setBl} />
        <Slider label="torsion °" min={0} max={360} step={1} value={tor} onChange={setTor} format={(v) => v.toFixed(0)} />
        <Btn onClick={() => { setOff(0); setRot(0); setBl(1); setTor(180); }}>Reset</Btn>
      </Controls>
    </div>
  );
}
