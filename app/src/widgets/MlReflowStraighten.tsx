import { useMemo, useState } from 'react';
import { Btn, Controls, PlayPause, Slider, Stage, rng, scale, useFrame } from './_kit';
import { posteriorMean, toyData, type ToyName } from './_mlToyData';

/**
 * Reflow: rewiring the noise→data coupling so the straight lines stop crossing.
 *  • "Round 0" draws the INDEPENDENT coupling (x0, x1) used by vanilla flow matching: each noise point is
 *    joined to a randomly drawn data point, so the segments cross all over the square.
 *  • "Round 1" draws the RECTIFIED coupling (x0, z1), where z1 is the endpoint reached by integrating the
 *    round-0 marginal ODE dx/dt = (E[x1 | x_t] − x)/(1 − t) from x0 (exact denoiser for the toy set).
 *    Those segments cross far less, which is the whole point of reflow.
 * The crossing counter counts intersecting pairs among the drawn segments. "ODE paths" overlays the curved
 * round-0 marginal trajectories; the dashed chord next to each shows how far a path bends away from a
 * straight line — the error a one-step Euler sampler would make.
 * Round-1 paths are drawn as the straight chords of the rectified coupling (the regression targets reflow
 * uses), not as a re-trained velocity field.
 * props: {
 *   dataset?: 'moons'|'spiral'|'ring'|'gmm'|'smile'  (default 'gmm')
 *   round?: 0|1        which coupling to show first (default 0)
 *   particles?: number segments drawn, 8–60 (default 26)
 *   showPaths?: boolean start with the curved ODE paths on (default false)
 *   seed?: number      (default 11)
 * }
 */
export default function MlReflowStraighten({ dataset = 'gmm', round: r0 = 0, particles = 26, showPaths = false, seed = 11 }: {
  dataset?: ToyName; round?: 0 | 1; particles?: number; showPaths?: boolean; seed?: number;
}) {
  const n = Math.max(8, Math.min(60, Math.round(particles)));
  const data = useMemo(() => toyData(dataset, 200, 4), [dataset]);
  const R = 3.2; const box: [number, number, number, number] = [58, 6, 262, 194];
  const sx = scale([-R, R], [box[0], box[2]]); const sy = scale([-R, R], [box[3], box[1]]);
  const [round, setRound] = useState<0 | 1>(r0);
  const [paths, setPaths] = useState(showPaths);
  const [t, setT] = useState(0);
  const [running, setRunning] = useState(true);

  const K = 48;
  const { x0, x1, z1, traj, bend } = useMemo(() => {
    const r = rng(seed);
    const x0 = Array.from({ length: n }, () => [r.normal() * 1.1, r.normal() * 1.1] as [number, number]);
    const x1 = Array.from({ length: n }, () => data[Math.floor(r.u() * data.length)]);
    const traj = x0.map(([a, b]) => {
      const out: [number, number][] = [[a, b]]; let x = a, y = b;
      for (let k = 0; k < K; k++) {
        const tk = k / K, dt = 1 / K;
        const [mx, my] = posteriorMean(data, x, y, tk, 1 - tk);
        x += (dt * (mx - x)) / (1 - tk); y += (dt * (my - y)) / (1 - tk);
        out.push([x, y]);
      }
      return out;
    });
    const z1 = traj.map((p) => p[p.length - 1]);
    // Mean (over paths) of the largest distance from the path to its own chord.
    let bend = 0;
    traj.forEach((p, i) => {
      const [ax, ay] = p[0]; const [bx, by] = z1[i];
      const L = Math.hypot(bx - ax, by - ay) || 1; let mx = 0;
      for (const [px, py] of p) mx = Math.max(mx, Math.abs((bx - ax) * (ay - py) - (ax - px) * (by - ay)) / L);
      bend += mx;
    });
    return { x0, x1, z1, traj, bend: bend / n };
  }, [data, n, seed]);

  const ends = round === 0 ? x1 : z1;
  const crossings = useMemo(() => {
    const side = (a: number[], b: number[], c: number[]) => Math.sign((b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]));
    let c = 0;
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
      const [p, q, u, v] = [x0[i], ends[i], x0[j], ends[j]];
      if (side(p, q, u) !== side(p, q, v) && side(u, v, p) !== side(u, v, q)) c++;
    }
    return c;
  }, [x0, ends, n]);

  useFrame((dt) => setT((v) => (v + dt / 4 > 1.25 ? 0 : v + dt / 4)), running);
  const tc = Math.min(1, t);
  const col = round === 0 ? 'var(--c2)' : 'var(--c4)';
  const pos = (i: number): [number, number] => [(1 - tc) * x0[i][0] + tc * ends[i][0], (1 - tc) * x0[i][1] + tc * ends[i][1]];

  return (
    <div>
      <Stage label="Reflow straightens the noise-to-data coupling">
        <rect x={box[0]} y={box[1]} width={box[2] - box[0]} height={box[3] - box[1]} fill="none" stroke="var(--grid)" />
        {data.map(([x, y], i) => <circle key={'d' + i} cx={sx(x)} cy={sy(y)} r={1.2} fill="var(--c1)" opacity={0.3} />)}
        {paths && traj.map((p, i) => (
          <polyline key={'tr' + i} points={p.map(([a, b]) => `${sx(a)},${sy(b)}`).join(' ')} fill="none" stroke="var(--c3)" strokeWidth={0.6} opacity={0.5} />
        ))}
        {x0.map((p, i) => (
          <line key={'s' + i} x1={sx(p[0])} y1={sy(p[1])} x2={sx(ends[i][0])} y2={sy(ends[i][1])} stroke={col} strokeWidth={0.6} opacity={0.5} />
        ))}
        {x0.map((p, i) => <circle key={'n' + i} cx={sx(p[0])} cy={sy(p[1])} r={1.6} fill="var(--muted)" />)}
        {x0.map((_, i) => { const [x, y] = pos(i); return <circle key={'m' + i} cx={sx(x)} cy={sy(y)} r={2.2} fill={col} />; })}
        <g fontSize="9" fill="var(--fg)">
          <text x={4} y={14}>{round === 0 ? 'round 0: independent (x₀, x₁)' : 'round 1: rectified (x₀, z₁)'}</text>
          <text x={4} y={27} fill={col}>crossings: {crossings}</text>
          <text x={4} y={40}>t = {tc.toFixed(2)}</text>
          {paths && <text x={4} y={53} fill="var(--c3)">mean bend: {bend.toFixed(2)}</text>}
          <text x={4} y={190} fill="var(--c1)">green = data</text>
        </g>
      </Stage>
      <Controls>
        <Btn active={round === 0} onClick={() => setRound(0)}>Round 0</Btn>
        <Btn active={round === 1} onClick={() => setRound(1)}>Round 1 (reflow)</Btn>
        <Btn active={paths} onClick={() => setPaths(!paths)}>ODE paths</Btn>
        <Slider label="t" min={0} max={1} step={0.01} value={tc} onChange={(v) => { setRunning(false); setT(v); }} />
        <PlayPause running={running} set={setRunning} />
      </Controls>
    </div>
  );
}
