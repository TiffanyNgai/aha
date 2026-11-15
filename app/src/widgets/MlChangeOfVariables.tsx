import { useMemo, useState } from 'react';
import { Btn, Controls, Slider, Stage, pathOf, scale } from './_kit';

/**
 * The change-of-variables formula for densities, drawn the classic way.
 *
 * Bottom strip: the base density p_z = N(0,1). Centre panel: an invertible, increasing map x = f(z)
 * (z horizontal, x vertical). Left strip: the pushed-forward density, drawn parametrically as
 * (f(z), p_z(z)/|f'(z)|) — i.e. p_x(x) = p_z(f⁻¹(x)) · |df/dz|⁻¹.
 *
 * A shaded slab [z*−δ, z*+δ] is mapped to [f(z*−δ), f(z*+δ)]. Both slabs carry the SAME probability mass
 * (printed), so where the map stretches (|f'| > 1) the density must drop, and where it squeezes it must rise.
 * That is the Jacobian factor; in d dimensions |f'| becomes |det ∂f/∂z|.
 *
 * Maps (all increasing, so invertible):
 *   'warp'  f(z) = z + a·tanh z      f'(z) = 1 + a·sech²z      (a > −1)
 *   'scale' f(z) = a·z               f'(z) = a
 *   'sinh'  f(z) = sinh(az)/a        f'(z) = cosh(az)
 *
 * props: {
 *   map?: 'warp' | 'scale' | 'sinh'   initial map (default 'warp')
 *   a?: number        initial map parameter (default 1.5 for 'warp')
 *   zStar?: number    initial probe point z* (default 0.6)
 *   delta?: number    half-width of the shaded slab (default 0.3)
 *   showMaps?: boolean  show the map-selector buttons (default true)
 * }
 */
type MapName = 'warp' | 'scale' | 'sinh';
const RANGE: Record<MapName, [number, number, number]> = { warp: [-0.8, 3, 1.5], scale: [0.3, 3, 1.6], sinh: [0.3, 2, 1] };
const F: Record<MapName, (z: number, a: number) => number> = {
  warp: (z, a) => z + a * Math.tanh(z),
  scale: (z, a) => a * z,
  sinh: (z, a) => Math.sinh(a * z) / a,
};
const DF: Record<MapName, (z: number, a: number) => number> = {
  warp: (z, a) => 1 + a / Math.cosh(z) ** 2,
  scale: (_z, a) => a,
  sinh: (z, a) => Math.cosh(a * z),
};
const LABEL: Record<MapName, string> = { warp: 'f(z) = z + a·tanh z', scale: 'f(z) = a·z', sinh: 'f(z) = sinh(az)/a' };
const phi = (z: number) => Math.exp(-0.5 * z * z) / Math.sqrt(2 * Math.PI);

export default function MlChangeOfVariables({ map: map0 = 'warp', a: a0, zStar: zs0 = 0.6, delta = 0.3, showMaps = true }: {
  map?: MapName; a?: number; zStar?: number; delta?: number; showMaps?: boolean;
}) {
  const [map, setMap] = useState<MapName>(map0);
  const [a, setA] = useState(a0 ?? RANGE[map0][2]);
  const [zs, setZs] = useState(zs0);
  const f = (z: number) => F[map](z, a);
  const df = (z: number) => DF[map](z, a);

  const Z: [number, number] = [-3, 3];
  const grid = useMemo(() => Array.from({ length: 301 }, (_, i) => Z[0] + ((Z[1] - Z[0]) * i) / 300), []);
  const xs = grid.map(f);
  const XM = Math.max(1.5, Math.min(9, Math.max(Math.abs(xs[0]), Math.abs(xs[300]))));
  const X: [number, number] = [-XM, XM];
  const dens = grid.map((z) => phi(z) / Math.abs(df(z)));
  const D = Math.max(0.42, ...dens.filter((_, i) => Math.abs(xs[i]) <= XM));

  // layout: left strip = p_x, centre = the map, bottom strip = p_z
  const cL = 96, cR = 306, cT = 10, cB = 136;          // centre panel
  const lL = 12, lR = 92;                               // p_x strip (density grows leftwards from lR)
  const bT = 142, bB = 186;                             // p_z strip (density grows downwards from bT)
  const sz = scale(Z, [cL, cR]);
  const sx = scale(X, [cB, cT]);
  const sdX = scale([0, D], [lR, lL]);
  const sdZ = scale([0, D], [bT, bB]);

  // mass of the slab, by trapezoid on the base side (identical after the map)
  const mass = useMemo(() => {
    let m = 0; const n = 200; const h = (2 * delta) / n;
    for (let i = 0; i < n; i++) m += 0.5 * h * (phi(zs - delta + i * h) + phi(zs - delta + (i + 1) * h));
    return m;
  }, [zs, delta]);
  const zA = zs - delta, zB = zs + delta;
  const xA = f(zA), xB = f(zB);
  const stretch = (xB - xA) / (zB - zA);
  const clampX = (v: number) => Math.max(X[0], Math.min(X[1], v));

  const curve = pathOf(grid.map((z, i) => [sz(z), sx(clampX(xs[i]))]));
  const pzPath = pathOf(grid.map((z) => [sz(z), sdZ(phi(z))]));
  const pxPath = pathOf(grid.filter((_, i) => Math.abs(xs[i]) <= XM).map((z) => [sdX(Math.min(D, phi(z) / Math.abs(df(z)))), sx(f(z))]));

  return (
    <div>
      <Stage w={320} h={214} label="Change of variables: a density pushed through an invertible map">
        <rect x={sz(zA)} y={cT} width={sz(zB) - sz(zA)} height={cB - cT} fill="var(--c2)" opacity={0.13} />
        <rect x={cL} y={sx(clampX(xB))} width={cR - cL} height={Math.max(0.6, sx(clampX(xA)) - sx(clampX(xB)))} fill="var(--c3)" opacity={0.13} />
        <rect x={sz(zA)} y={bT} width={sz(zB) - sz(zA)} height={bB - bT} fill="var(--c2)" opacity={0.22} />
        <rect x={lL} y={sx(clampX(xB))} width={lR - lL} height={Math.max(0.6, sx(clampX(xA)) - sx(clampX(xB)))} fill="var(--c3)" opacity={0.22} />

        <line x1={cL} x2={cR} y1={cB} y2={cB} stroke="var(--fg)" strokeWidth={0.7} />
        <line x1={cL} x2={cL} y1={cT} y2={cB} stroke="var(--fg)" strokeWidth={0.7} />
        <line x1={lL} x2={lR} y1={cB} y2={cB} stroke="var(--grid)" strokeWidth={0.6} />
        <line x1={cL} x2={cR} y1={bT} y2={bT} stroke="var(--grid)" strokeWidth={0.6} />
        <path d={curve} fill="none" stroke="var(--c4)" strokeWidth={2} />
        <path d={pzPath} fill="none" stroke="var(--c2)" strokeWidth={1.8} />
        <path d={pxPath} fill="none" stroke="var(--c3)" strokeWidth={1.8} />

        <circle cx={sz(zs)} cy={sx(clampX(f(zs)))} r={2.6} fill="var(--c4)" />
        <line x1={sz(zs)} x2={sz(zs)} y1={sx(clampX(f(zs)))} y2={bT} stroke="var(--c2)" strokeWidth={0.6} strokeDasharray="2 2" />
        <line x1={lR} x2={sz(zs)} y1={sx(clampX(f(zs)))} y2={sx(clampX(f(zs)))} stroke="var(--c3)" strokeWidth={0.6} strokeDasharray="2 2" />

        <g fontSize="8">
          <text x={cR} y={cB - 4} textAnchor="end" fill="var(--c4)">{LABEL[map]}</text>
          <text x={cL + 3} y={cT + 8} fill="var(--muted)">x</text>
          <text x={cR - 2} y={bT + 10} textAnchor="end" fill="var(--c2)">p(z) = N(0,1)</text>
          <text x={lL + 2} y={cT + 8} fill="var(--c3)">p(x)</text>
          <text x={lL + 2} y={bT + 12} fill="var(--muted)">slab width ×{stretch.toFixed(2)}</text>
          <text x={lL + 2} y={bT + 23} fill="var(--muted)">height ×{(1 / stretch).toFixed(2)}</text>
          <text x={lL + 2} y={bT + 34} fill="var(--muted)">mass = {mass.toFixed(3)}</text>
          <text x={lL} y={200} fill="var(--fg)">
            p(x*) = p(z*)/|f′(z*)| = {phi(zs).toFixed(3)} / {df(zs).toFixed(2)} = {(phi(zs) / Math.abs(df(zs))).toFixed(3)}
          </text>
          <text x={lL} y={210} fill="var(--muted)">log p(x*) = log p(z*) − log|f′(z*)| = {Math.log(phi(zs)).toFixed(2)} − {Math.log(Math.abs(df(zs))).toFixed(2)}</text>
        </g>
      </Stage>
      <Controls>
        <Slider label="z*" min={-2.4} max={2.4} step={0.02} value={zs} onChange={setZs} />
        <Slider label="a" min={RANGE[map][0]} max={RANGE[map][1]} step={0.02} value={a} onChange={setA} />
        {showMaps && (['warp', 'scale', 'sinh'] as MapName[]).map((m) => (
          <Btn key={m} active={map === m} onClick={() => { setMap(m); setA(RANGE[m][2]); }}>{m}</Btn>
        ))}
      </Controls>
    </div>
  );
}
