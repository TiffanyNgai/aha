import { useMemo, useState } from 'react';
import { Btn, C, Controls, Slider, Stage, pathOf, prefersReducedMotion, rng, scale, useFrame } from './_kit';

/**
 * Reward hacking in REINVENT-style molecular RL, as a schematic.
 * A pretrained SMILES prior is fine-tuned to maximise a scoring function; REINVENT's augmented
 * likelihood log P_aug = log P_prior + σ·S(x) uses σ to trade the prior off against the score.
 * Three curves over training steps: the scoring function's reward (what you optimise), the number of
 * distinct scaffolds in a batch (diversity), and "useful" molecules — ones a chemist would actually
 * make, which rise and then fall as the agent collapses onto whatever the score rewards.
 * Larger σ reaches a high reward faster and collapses harder; the diversity filter (penalising
 * scaffolds already sampled many times) keeps the batch spread out. Curves are illustrative shapes,
 * not measured data.
 * props: { sigma?: number (10–200, default 60), step?: number (0–200, default 200),
 *          filter?: boolean (default false), animate?: boolean (default false) }
 */
const NS = 24; // scaffolds in the pretrained batch

export default function DrugRewardHacking({ sigma = 60, step = 200, filter = false, animate = false }: {
  sigma?: number; step?: number; filter?: boolean; animate?: boolean;
}) {
  const [sg, setSg] = useState(Math.max(10, Math.min(200, sigma)));
  const [s, setS] = useState(Math.max(0, Math.min(200, step)));
  const [filt, setFilt] = useState(filter);
  const [run, setRun] = useState(animate && !prefersReducedMotion());
  useFrame((dt) => setS((x) => (x + dt * 45) % 200), run);

  const rate = 0.004 + 0.00006 * sg;
  const decay = (0.0008 + 0.00014 * sg) * (filt ? 0.55 : 1);
  const floorN = filt ? 0.42 * NS : 1;
  const reward = (x: number) => 1 - Math.exp(-rate * x);
  const scaf = (x: number) => floorN + (NS - floorN) * Math.exp(-decay * x);
  const useful = (x: number) => reward(x) * (0.25 + 0.75 * (scaf(x) - 1) / (NS - 1));

  const L = 30, R = 240, T = 16, B = 118;
  const sx = scale([0, 200], [L, R]);
  const sy = scale([0, 1], [B, T]);
  const curves = useMemo(() => {
    const xs = Array.from({ length: 101 }, (_, i) => i * 2);
    const mk = (f: (x: number) => number) => pathOf(xs.map((x) => [sx(x), sy(f(x))] as [number, number]));
    return [mk(reward), mk((x) => (scaf(x) - 1) / (NS - 1)), mk(useful)];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sg, filt]);

  const nS = scaf(s), r = reward(s), u = useful(s);
  const batch = useMemo(() => {
    const g = rng(1 + Math.round(s / 4) + sg + (filt ? 7 : 0));
    const k = Math.max(1, Math.round(nS / 3));
    return Array.from({ length: 30 }, () => (g.u() < 0.55 ? 0 : Math.floor(g.u() * k)));
  }, [s, sg, filt, nS]);

  return (
    <div>
      <Stage w={320} h={212} label={`At step ${s.toFixed(0)}: reward ${r.toFixed(2)}, ${nS.toFixed(0)} distinct scaffolds`}>
        <line x1={L} x2={R} y1={B} y2={B} stroke="var(--fg)" strokeWidth={0.8} />
        <line x1={L} x2={L} y1={T} y2={B} stroke="var(--fg)" strokeWidth={0.8} />
        {[0, 0.5, 1].map((v) => (
          <g key={v}>
            <line x1={L} x2={R} y1={sy(v)} y2={sy(v)} stroke="var(--grid)" strokeWidth={0.5} />
            <text x={L - 3} y={sy(v) + 3} fontSize="7" textAnchor="end" fill="var(--muted)">{v}</text>
          </g>
        ))}
        {[0, 100, 200].map((v) => <text key={v} x={sx(v)} y={B + 9} fontSize="7" textAnchor="middle" fill="var(--muted)">{v}</text>)}
        <text x={(L + R) / 2} y={B + 19} fontSize="7.5" textAnchor="middle" fill="var(--muted)">training steps</text>
        {curves.map((d, i) => <path key={i} d={d} fill="none" stroke={[C[2], C[1], C[0]][i]} strokeWidth={2} opacity={0.95} />)}
        <line x1={sx(s)} x2={sx(s)} y1={T} y2={B} stroke="var(--fg)" strokeWidth={0.8} strokeDasharray="3 2" />
        {[r, (nS - 1) / (NS - 1), u].map((v, i) => (
          <circle key={i} cx={sx(s)} cy={sy(v)} r={3} fill={[C[2], C[1], C[0]][i]} stroke="var(--surface)" strokeWidth={0.8} />
        ))}
        <g fontSize="7.5">
          <text x={R + 6} y={T + 6} fill={C[2]} fontWeight="bold">reward S(x)</text>
          <text x={R + 6} y={T + 16} fill={C[1]} fontWeight="bold">scaffold</text>
          <text x={R + 6} y={T + 25} fill={C[1]} fontWeight="bold">diversity</text>
          <text x={R + 6} y={T + 38} fill={C[0]} fontWeight="bold">useful</text>
          <text x={R + 6} y={T + 47} fill={C[0]} fontWeight="bold">molecules</text>
        </g>
        <text x={L} y={B + 34} fontSize="7.5" fill="var(--muted)">a batch of 30 samples at this step, coloured by scaffold:</text>
        {batch.map((c, i) => (
          <rect key={i} x={L + (i % 30) * 6.6} y={B + 38} width={5.4} height={9} rx={1.5}
            fill={C[c % 6]} opacity={c === 0 ? 1 : 0.65} />
        ))}
        <g fontSize="8">
          <text x={L} y={B + 62} fill="var(--fg)">
            step {s.toFixed(0)}: reward {r.toFixed(2)} · {nS.toFixed(0)} of {NS} scaffolds left · useful {(100 * u).toFixed(0)}%
          </text>
          <text x={L} y={B + 74} fill="var(--muted)" fontSize="7.5">
            {nS < 4 ? 'Mode collapse: the agent keeps re-drawing one high-scoring scaffold.'
              : filt ? 'The diversity filter keeps penalising scaffolds it has already seen.'
                : 'Reward is still climbing — check what the molecules actually look like.'}
          </text>
        </g>
      </Stage>
      <Controls>
        <Slider label="σ (score weight)" min={10} max={200} step={5} value={sg} onChange={setSg} format={(v) => v.toFixed(0)} />
        <Slider label="step" min={0} max={200} step={1} value={s} onChange={(x) => { setRun(false); setS(x); }} format={(v) => v.toFixed(0)} />
        <Btn onClick={() => setRun(!run)}>{run ? '⏸ Pause' : '▶ Train'}</Btn>
        <Btn active={filt} onClick={() => setFilt(!filt)}>diversity filter</Btn>
      </Controls>
    </div>
  );
}
