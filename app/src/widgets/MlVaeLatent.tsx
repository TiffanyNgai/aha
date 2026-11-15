import { useMemo, useState } from 'react';
import { Btn, Controls, PlayPause, Slider, Stage, prefersReducedMotion, rng, scale, useFrame } from './_kit';

/**
 * A toy two-dimensional VAE latent space you can sample from.
 *
 * Six 8×8 "training images" (prototypes) sit at fixed encoder means μ_k on a circle of radius 1.35;
 * the small circles are their posteriors q(z|x_k) = N(μ_k, σ_q² I). The dashed rings are the 1σ and 2σ
 * contours of the prior p(z) = N(0, I). The decoder is the exact posterior mean of a mixture-of-prototypes
 * model: x̂(z) = Σ_k w_k(z)·G_k with w_k(z) ∝ exp(−‖z − μ_k‖²/(2τ²)). So z near one μ_k decodes to a crisp
 * prototype, while z in a gap decodes to a *blend* — the blurry-sample pathology of VAEs trained with a
 * Gaussian likelihood. The footer reports exp(H(w)), the effective number of prototypes being averaged.
 *
 * Drag (or tap) inside the latent plane to move z. "Sample p(z)" draws z ~ N(0, I). "Grid" replaces the
 * plane with the classic latent-manifold figure: the decoded image on a 7×7 grid of z values.
 *
 * props: {
 *   tau?: number        decoder smoothness τ, 0.15–1.5 (default 0.5)
 *   sigmaQ?: number     posterior std σ_q drawn around each μ_k (default 0.3)
 *   z?: [number, number]  initial latent point (default [0.9, 0.6])
 *   view?: 'point' | 'grid'   initial view (default 'point')
 *   walk?: boolean      start the animated tour of latent space (default false)
 *   seed?: number       seed for the prior sampler (default 7)
 * }
 */
const GLYPHS: { name: string; rows: string[] }[] = [
  { name: 'ring', rows: ['..####..', '.#....#.', '#......#', '#......#', '#......#', '#......#', '.#....#.', '..####..'] },
  { name: 'bar', rows: ['...##...', '..###...', '...##...', '...##...', '...##...', '...##...', '...##...', '..####..'] },
  { name: 'cross', rows: ['##....##', '.##..##.', '..####..', '...##...', '...##...', '..####..', '.##..##.', '##....##'] },
  { name: 'tee', rows: ['########', '########', '...##...', '...##...', '...##...', '...##...', '...##...', '...##...'] },
  { name: 'ell', rows: ['.##.....', '.##.....', '.##.....', '.##.....', '.##.....', '.##.....', '.##.####', '.######.'] },
  { name: 'plus', rows: ['...##...', '...##...', '...##...', '########', '########', '...##...', '...##...', '...##...'] },
];
const PIX = GLYPHS.map((g) => g.rows.flatMap((r) => [...r].map((c) => (c === '#' ? 1 : 0))));
const MU: [number, number][] = GLYPHS.map((_, k) => {
  const a = (2 * Math.PI * k) / GLYPHS.length - Math.PI / 2;
  return [1.35 * Math.cos(a), 1.35 * Math.sin(a)];
});

function decode(z: [number, number], tau: number): { px: number[]; eff: number } {
  const d2 = MU.map(([a, b]) => (z[0] - a) ** 2 + (z[1] - b) ** 2);
  const m = Math.min(...d2);
  const e = d2.map((d) => Math.exp(-(d - m) / (2 * tau * tau)));
  const S = e.reduce((a, b) => a + b, 0);
  const w = e.map((v) => v / S);
  const px = new Array(64).fill(0);
  w.forEach((wk, k) => { for (let i = 0; i < 64; i++) px[i] += wk * PIX[k][i]; });
  const H = -w.reduce((s, v) => s + (v > 1e-12 ? v * Math.log(v) : 0), 0);
  return { px, eff: Math.exp(H) };
}

function Glyph({ px, x, y, size }: { px: number[]; x: number; y: number; size: number }) {
  const c = size / 8;
  return (
    <g>
      <rect x={x} y={y} width={size} height={size} fill="var(--surface)" stroke="var(--grid)" strokeWidth={0.5} />
      {px.map((v, i) => (v < 0.05 ? null : (
        <rect key={i} x={x + (i % 8) * c} y={y + Math.floor(i / 8) * c} width={c + 0.15} height={c + 0.15} fill="var(--fg)" opacity={v} />
      )))}
    </g>
  );
}

export default function MlVaeLatent({ tau: tau0 = 0.5, sigmaQ = 0.3, z: z0 = [0.9, 0.6], view: view0 = 'point', walk = false, seed = 7 }: {
  tau?: number; sigmaQ?: number; z?: [number, number]; view?: 'point' | 'grid'; walk?: boolean; seed?: number;
}) {
  const [tau, setTau] = useState(tau0);
  const [z, setZ] = useState<[number, number]>(z0);
  const [grid, setGrid] = useState(view0 === 'grid');
  const [running, setRunning] = useState(walk && !prefersReducedMotion());
  const [phase, setPhase] = useState(0);
  const r = useMemo(() => rng(seed), [seed]);

  useFrame((dt) => {
    setPhase((p) => {
      const q = p + dt;
      setZ([1.75 * Math.sin(0.62 * q), 1.75 * Math.sin(0.83 * q + 1.1)]);
      return q;
    });
  }, running && !grid);

  const R = 2.6;
  const box: [number, number, number, number] = [10, 12, 172, 174];
  const sx = scale([-R, R], [box[0], box[2]]);
  const sy = scale([-R, R], [box[3], box[1]]);
  const inv = (px: number, py: number): [number, number] => [
    -R + ((px - box[0]) / (box[2] - box[0])) * 2 * R,
    R - ((py - box[1]) / (box[3] - box[1])) * 2 * R,
  ];
  const { px, eff } = decode(z, tau);
  const logPrior = -0.5 * (z[0] ** 2 + z[1] ** 2) - Math.log(2 * Math.PI);

  const gridCells = useMemo(() => {
    if (!grid) return [];
    const n = 7, lo = -1.9, hi = 1.9;
    return Array.from({ length: n * n }, (_, i) => {
      const cx = i % n, cy = Math.floor(i / n);
      const zz: [number, number] = [lo + ((hi - lo) * cx) / (n - 1), hi - ((hi - lo) * cy) / (n - 1)];
      return { cx, cy, px: decode(zz, tau).px };
    });
  }, [grid, tau]);

  const drag = (e: React.PointerEvent<SVGRectElement>) => {
    if (e.type === 'pointermove' && e.buttons === 0) return;
    const svg = (e.target as SVGElement).ownerSVGElement;
    const ctm = svg?.getScreenCTM();
    if (!svg || !ctm) return;
    const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
    const q = pt.matrixTransform(ctm.inverse());
    setRunning(false);
    setZ(inv(q.x, q.y));
  };

  const cell = 24, g0 = (320 - 7 * cell) / 2;
  return (
    <div>
      <Stage w={320} h={grid ? 196 : 190} label="Two-dimensional VAE latent space with a decoder">
        {grid ? (
          <g>
            {gridCells.map((c) => <Glyph key={`${c.cx}-${c.cy}`} px={c.px} x={g0 + c.cx * cell} y={8 + c.cy * cell} size={cell - 1.5} />)}
            <g fontSize="8.5" fill="var(--muted)">
              <text x={160} y={188} textAnchor="middle">decoder output over a 7×7 grid of z in [−1.9, 1.9]²</text>
            </g>
          </g>
        ) : (
          <g>
            <rect x={box[0]} y={box[1]} width={box[2] - box[0]} height={box[3] - box[1]} fill="var(--surface)" stroke="var(--grid)" strokeWidth={0.6} />
            {[1, 2].map((k) => (
              <circle key={k} cx={sx(0)} cy={sy(0)} r={(sx(k) - sx(0))} fill="none" stroke="var(--c2)" strokeWidth={0.7} strokeDasharray="3 3" opacity={0.8} />
            ))}
            <text x={sx(0) + (sx(2) - sx(0)) * 0.72} y={sy(0) - (sx(2) - sx(0)) * 0.72} fontSize="7.5" fill="var(--c2)">prior 2σ</text>
            {MU.map(([a, b], k) => (
              <g key={k}>
                <circle cx={sx(a)} cy={sy(b)} r={sx(sigmaQ) - sx(0)} fill="var(--c1)" opacity={0.18} stroke="var(--c1)" strokeWidth={0.7} />
                <text x={sx(a)} y={sy(b) + 3} fontSize="7" textAnchor="middle" fill="var(--c1)">{k + 1}</text>
              </g>
            ))}
            <line x1={sx(-R)} x2={sx(R)} y1={sy(0)} y2={sy(0)} stroke="var(--fg)" strokeWidth={0.4} opacity={0.4} />
            <line y1={sy(-R)} y2={sy(R)} x1={sx(0)} x2={sx(0)} stroke="var(--fg)" strokeWidth={0.4} opacity={0.4} />
            <circle cx={sx(z[0])} cy={sy(z[1])} r={4} fill="var(--c3)" stroke="var(--surface)" strokeWidth={1.2} />
            <rect x={box[0]} y={box[1]} width={box[2] - box[0]} height={box[3] - box[1]} fill="transparent"
              style={{ touchAction: 'none', cursor: 'crosshair' }}
              onPointerDown={drag} onPointerMove={drag} />
            <text x={box[0] + 3} y={box[1] + 9} fontSize="8" fill="var(--muted)">latent z</text>
            <Glyph px={px} x={200} y={24} size={104} />
            <g fontSize="8.5">
              <text x={252} y={18} textAnchor="middle" fill="var(--c3)">decoded x̂ = g(z)</text>
              <text x={200} y={146} fill="var(--muted)">z = ({z[0].toFixed(2)}, {z[1].toFixed(2)})</text>
              <text x={200} y={158} fill="var(--muted)">log p(z) = {logPrior.toFixed(2)}</text>
              <text x={200} y={170} fill={eff > 1.6 ? 'var(--c5)' : 'var(--c1)'}>blend of {eff.toFixed(2)} images</text>
              <text x={200} y={182} fill="var(--muted)">{eff > 1.6 ? 'blurry average' : 'sharp'}</text>
            </g>
          </g>
        )}
      </Stage>
      <Controls>
        <Btn active={grid} onClick={() => setGrid(!grid)}>{grid ? 'single z' : 'Grid'}</Btn>
        {!grid && <Btn onClick={() => { setRunning(false); setZ([r.normal(), r.normal()]); }}>Sample p(z)</Btn>}
        {!grid && <PlayPause running={running} set={setRunning} />}
        <Slider label="decoder τ" min={0.15} max={1.5} step={0.01} value={tau} onChange={setTau} />
      </Controls>
    </div>
  );
}
