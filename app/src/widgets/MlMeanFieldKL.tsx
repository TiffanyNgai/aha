import { useState } from 'react';
import { Btn, C, Controls, Slider, Stage, pathOf, scale } from './_kit';

/**
 * Mean-field approximation of a correlated 2-D Gaussian, fitted two ways.
 *
 * Target p = N(0, Σ) with Σ = [[1, ρ], [ρ, 1]] (grey ellipses = 1σ and 2σ contours).
 * The approximating family is the factorized ("mean-field") set q(z) = N(0, s²I), drawn as circles.
 *   • reverse KL, argmin_q KL(q‖p): the exclusive / mode-seeking direction used by variational
 *     inference. The optimum has s² = 1/Λ₁₁ = 1 − ρ², i.e. the inverse of a PRECISION entry, so q is
 *     narrower than p's marginals — the classic under-dispersion.
 *   • forward KL, argmin_q KL(p‖q): moment matching. The optimum has s² = Σ₁₁ = 1, so q matches the
 *     marginals and spreads over the whole of p.
 * The strip underneath shows the z₁ marginals, where the width difference is easiest to see.
 * The table prints both divergences for both fits (each fit wins its own column).
 *
 * props: {
 *   rho?: number        initial correlation ρ ∈ (−0.95, 0.95) (default 0.85)
 *   show?: 'reverse'|'forward'|'both'   which fit to draw (default 'both')
 *   controls?: boolean  show the slider and buttons (default true)
 * }
 */
type Mode = 'reverse' | 'forward' | 'both';
const BOX: [number, number, number, number] = [40, 10, 220, 190];
const STRIP: [number, number, number, number] = [40, 212, 220, 264];
const px = scale([-3.2, 3.2], [BOX[0], BOX[2]]);
const py = scale([-3.2, 3.2], [BOX[3], BOX[1]]);
const PPU = (BOX[2] - BOX[0]) / 6.4;

const klQP = (s2: number, r: number) => 0.5 * ((2 * s2) / (1 - r * r) - 2 - Math.log((s2 * s2) / (1 - r * r)));
const klPQ = (s2: number, r: number) => 0.5 * (2 / s2 - 2 - Math.log((1 - r * r) / (s2 * s2)));

export default function MlMeanFieldKL({ rho = 0.85, show = 'both', controls = true }: {
  rho?: number; show?: Mode; controls?: boolean;
}) {
  const [r, setR] = useState(Math.max(-0.95, Math.min(0.95, rho)));
  const [mode, setMode] = useState<Mode>(show);
  const sRev = Math.sqrt(1 - r * r);
  const sFwd = 1;
  const showRev = mode !== 'forward';
  const showFwd = mode !== 'reverse';

  const dens = (x: number, s: number) => Math.exp(-0.5 * (x / s) ** 2) / (s * Math.sqrt(2 * Math.PI));
  const hx = scale([-3.2, 3.2], [STRIP[0], STRIP[2]]);
  const hy = scale([0, 1.05], [STRIP[3], STRIP[1]]);
  const curve = (s: number) => pathOf(Array.from({ length: 97 }, (_, i) => {
    const x = -3.2 + (6.4 * i) / 96;
    return [hx(x), hy(dens(x, s))] as [number, number];
  }));

  const row = (name: string, s2: number, col: string) =>
    `${name}  s=${Math.sqrt(s2).toFixed(2)}   ${klQP(s2, r).toFixed(2)}   ${klPQ(s2, r).toFixed(2)}` + col;

  return (
    <div>
      <Stage w={320} h={286} label="Mean-field Gaussian fitted to a correlated Gaussian by reverse and forward KL">
        {[-3, -2, -1, 0, 1, 2, 3].map((v) => (
          <g key={v}>
            <line x1={px(v)} x2={px(v)} y1={BOX[1]} y2={BOX[3]} stroke="var(--grid)" strokeWidth={0.5} />
            <line y1={py(v)} y2={py(v)} x1={BOX[0]} x2={BOX[2]} stroke="var(--grid)" strokeWidth={0.5} />
          </g>
        ))}
        <line x1={BOX[0]} x2={BOX[2]} y1={py(0)} y2={py(0)} stroke="var(--fg)" strokeWidth={0.7} />
        <line y1={BOX[1]} y2={BOX[3]} x1={px(0)} x2={px(0)} stroke="var(--fg)" strokeWidth={0.7} />
        {[1, 2].map((k) => (
          <ellipse key={'p' + k} cx={px(0)} cy={py(0)} rx={PPU * k * Math.sqrt(1 + r)} ry={PPU * k * Math.sqrt(1 - r)}
            transform={`rotate(-45 ${px(0)} ${py(0)})`} fill="var(--c2)" fillOpacity={k === 1 ? 0.14 : 0.07} stroke="var(--c2)" strokeWidth={1.2} />
        ))}
        {showRev && [1, 2].map((k) => (
          <circle key={'r' + k} cx={px(0)} cy={py(0)} r={PPU * k * sRev} fill="none" stroke={C[4]} strokeWidth={1.4} strokeDasharray={k === 1 ? '' : '3 2'} />
        ))}
        {showFwd && [1, 2].map((k) => (
          <circle key={'f' + k} cx={px(0)} cy={py(0)} r={PPU * k * sFwd} fill="none" stroke={C[0]} strokeWidth={1.4} strokeDasharray={k === 1 ? '' : '3 2'} />
        ))}
        <text x={BOX[0] + 3} y={BOX[1] + 9} fontSize="8" fill="var(--fg)">z₂</text>
        <text x={BOX[2] - 3} y={BOX[3] - 4} fontSize="8" textAnchor="end" fill="var(--fg)">z₁</text>
        <text x={226} y={22} fontSize="8.5" fill="var(--c2)">p: Σ=[[1,ρ],[ρ,1]]</text>
        {showRev && <text x={226} y={38} fontSize="8.5" fill={C[4]}>q: min KL(q‖p)</text>}
        {showRev && <text x={226} y={49} fontSize="8.5" fill={C[4]}>s = {sRev.toFixed(3)}</text>}
        {showFwd && <text x={226} y={66} fontSize="8.5" fill={C[0]}>q: min KL(p‖q)</text>}
        {showFwd && <text x={226} y={77} fontSize="8.5" fill={C[0]}>s = {sFwd.toFixed(3)}</text>}
        <text x={226} y={100} fontSize="8" fill="var(--muted)">ρ = {r.toFixed(2)}</text>
        <text x={226} y={112} fontSize="8" fill="var(--muted)">p marginal</text>
        <text x={226} y={122} fontSize="8" fill="var(--muted)">sd = 1.000</text>
        <text x={226} y={140} fontSize="8" fill="var(--muted)">reverse KL</text>
        <text x={226} y={150} fontSize="8" fill="var(--muted)">loses</text>
        <text x={226} y={160} fontSize="8" fill={C[4]}>{((1 - sRev) * 100).toFixed(0)}% of width</text>

        <text x={BOX[0]} y={204} fontSize="8" fill="var(--fg)">z₁ marginal densities</text>
        <line x1={STRIP[0]} x2={STRIP[2]} y1={STRIP[3]} y2={STRIP[3]} stroke="var(--fg)" strokeWidth={0.7} />
        <path d={curve(1)} fill="none" stroke="var(--c2)" strokeWidth={1.6} />
        {showRev && <path d={curve(sRev)} fill="none" stroke={C[4]} strokeWidth={1.4} />}
        {showFwd && <path d={curve(sFwd)} fill="none" stroke={C[0]} strokeWidth={1.4} strokeDasharray="3 2" />}

        <text x={230} y={210} fontSize="7.5" fill="var(--muted)">KL(q‖p) KL(p‖q)</text>
        {showRev && <text x={230} y={224} fontSize="7.5" fill={C[4]}>{klQP(sRev * sRev, r).toFixed(2)}      {klPQ(sRev * sRev, r).toFixed(2)}</text>}
        {showFwd && <text x={230} y={238} fontSize="7.5" fill={C[0]}>{klQP(1, r).toFixed(2)}      {klPQ(1, r).toFixed(2)}</text>}
        <text x={230} y={254} fontSize="7" fill="var(--muted)">each fit wins</text>
        <text x={230} y={263} fontSize="7" fill="var(--muted)">its own column</text>
        <text x={4} y={280} fontSize="7.5" fill="var(--muted)">{row('', 0, '')}</text>
      </Stage>
      {controls && (
        <Controls>
          <Slider label="correlation ρ" min={-0.95} max={0.95} step={0.01} value={r} onChange={setR} format={(v) => v.toFixed(2)} />
          <Btn active={mode === 'reverse'} onClick={() => setMode('reverse')}>KL(q‖p)</Btn>
          <Btn active={mode === 'forward'} onClick={() => setMode('forward')}>KL(p‖q)</Btn>
          <Btn active={mode === 'both'} onClick={() => setMode('both')}>both</Btn>
        </Controls>
      )}
    </div>
  );
}
