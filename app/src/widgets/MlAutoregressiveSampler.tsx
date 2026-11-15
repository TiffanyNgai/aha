/**
 * Sampling from a toy autoregressive model, one token at a time.
 * The vocabulary is 4 symbols. The model is a fixed first-order chain: the next-token distribution
 * p(x_t | x_<t) depends on the previous token through a hand-made logit table (plus a start row),
 * so every conditional is explicit and the chain rule p(x) = Π_t p(x_t | x_<t) can be shown adding up
 * on the log scale as you generate.
 * Press "token ▶" to draw the next token from p(·|x_<t) (or take the argmax in greedy mode). The bars
 * show the current conditional at the chosen temperature T: p ∝ exp(logit / T). Small T sharpens
 * towards greedy, large T flattens towards uniform. The footer prints Σ_t log p(x_t | x_<t), i.e.
 * log p(x) for the sequence generated so far, and the per-token perplexity exp(−(1/t)Σ log p).
 * props: {
 *   temperature?: number   initial T, 0.2–2 (default 1)
 *   length?: number        sequence length, 3–10 (default 8)
 *   greedy?: boolean       start in greedy (argmax) mode (default false)
 *   seed?: number          sampling seed (default 5)
 *   vocab?: string[]       exactly 4 symbols (default ['A','B','C','D'])
 * }
 */
import { useState } from 'react';
import { Btn, Controls, Slider, Stage, rng } from './_kit';

// Row 0 = start-of-sequence; rows 1..4 = conditional logits given the previous token.
const LOGITS: number[][] = [
  [1.2, 0.6, 0.0, -0.4],
  [-0.5, 1.8, 0.3, -0.8],
  [0.2, -0.6, 2.0, 0.1],
  [1.4, 0.0, -0.7, 1.1],
  [0.6, 1.0, -0.2, 0.4],
];
const PAL = ['var(--c2)', 'var(--c3)', 'var(--c1)', 'var(--c4)'];

const softmax = (z: number[], T: number) => {
  const m = Math.max(...z);
  const e = z.map((v) => Math.exp((v - m) / T));
  const s = e.reduce((a, b) => a + b, 0);
  return e.map((v) => v / s);
};

export default function MlAutoregressiveSampler({ temperature = 1, length = 8, greedy = false, seed = 5, vocab = ['A', 'B', 'C', 'D'] }: {
  temperature?: number; length?: number; greedy?: boolean; seed?: number; vocab?: string[];
}) {
  const V = vocab.length === 4 ? vocab : ['A', 'B', 'C', 'D'];
  const L = Math.max(3, Math.min(10, Math.round(length)));
  const [T, setT] = useState(Math.max(0.2, Math.min(2, temperature)));
  const [gre, setGre] = useState(greedy);
  const [sd, setSd] = useState(seed);
  const [seq, setSeq] = useState<number[]>([]);
  const [lps, setLps] = useState<number[]>([]);

  const prev = seq.length === 0 ? 0 : seq[seq.length - 1] + 1;
  const p = softmax(LOGITS[prev], T);
  const done = seq.length >= L;

  const next = () => {
    if (done) return;
    let k = 0;
    if (gre) {
      p.forEach((v, i) => { if (v > p[k]) k = i; });
    } else {
      const u = rng(sd * 1000 + seq.length + 1).u();
      let acc = 0;
      k = p.length - 1;
      for (let i = 0; i < p.length; i++) { acc += p[i]; if (u < acc) { k = i; break; } }
    }
    setSeq([...seq, k]);
    setLps([...lps, Math.log(p[k])]);
  };
  const reset = (newSeed = sd) => { setSeq([]); setLps([]); setSd(newSeed); };

  const logp = lps.reduce((a, b) => a + b, 0);
  const ppl = lps.length ? Math.exp(-logp / lps.length) : NaN;

  const bx = 150, bw = 38, base = 118;
  return (
    <div>
      <Stage h={210} label="autoregressive sampling, token by token">
        <text x={6} y={14} fontSize="9" fill="var(--fg)">generated so far</text>
        {Array.from({ length: L }, (_, i) => {
          const x = 8 + i * 30;
          const tok = seq[i];
          return (
            <g key={i}>
              <rect x={x} y={22} width={26} height={26} rx={4}
                fill={tok === undefined ? 'var(--surface)' : PAL[tok]} fillOpacity={tok === undefined ? 1 : 0.55}
                stroke={i === seq.length ? 'var(--c3)' : 'var(--grid)'} strokeWidth={i === seq.length ? 1.8 : 0.8} />
              <text x={x + 13} y={40} fontSize="11" textAnchor="middle" fill="var(--fg)">{tok === undefined ? '·' : V[tok]}</text>
              <text x={x + 13} y={57} fontSize="7" textAnchor="middle" fill="var(--muted)">{lps[i] === undefined ? '' : lps[i].toFixed(2)}</text>
            </g>
          );
        })}
        <text x={6} y={74} fontSize="8" fill="var(--muted)">small grey numbers: log p(xₜ | x&lt;ₜ) for the token drawn there</text>

        <text x={6} y={92} fontSize="9" fill="var(--fg)">
          {done ? 'sequence finished' : `next conditional p(· | previous = ${seq.length === 0 ? '⟨start⟩' : V[seq[seq.length - 1]]})`}
        </text>
        {p.map((v, i) => (
          <g key={i}>
            <rect x={bx + i * bw} y={base - v * 56} width={bw - 8} height={Math.max(0.6, v * 56)} fill={PAL[i]} fillOpacity={0.7} />
            <text x={bx + i * bw + (bw - 8) / 2} y={base + 10} fontSize="9" textAnchor="middle" fill="var(--fg)">{V[i]}</text>
            <text x={bx + i * bw + (bw - 8) / 2} y={base - v * 56 - 3} fontSize="7.5" textAnchor="middle" fill="var(--muted)">{v.toFixed(2)}</text>
          </g>
        ))}
        <line x1={bx - 4} y1={base} x2={bx + 4 * bw} y2={base} stroke="var(--fg)" strokeWidth={0.7} />
        <text x={8} y={base - 30} fontSize="8" fill="var(--muted)">p ∝ exp(logit / T)</text>
        <text x={8} y={base - 18} fontSize="8" fill="var(--muted)">T = {T.toFixed(2)}{gre ? ', greedy' : ''}</text>

        <line x1={6} y1={146} x2={314} y2={146} stroke="var(--grid)" strokeWidth={0.6} />
        <text x={6} y={162} fontSize="9" fill="var(--fg)">log p(x) = Σₜ log p(xₜ | x&lt;ₜ) = {lps.length ? logp.toFixed(3) : '—'}</text>
        <text x={6} y={176} fontSize="9" fill="var(--fg)">perplexity exp(−(1/t)Σ log p) = {lps.length ? ppl.toFixed(2) : '—'}</text>
        <text x={6} y={192} fontSize="8" fill="var(--muted)">one exact likelihood, no integral: every factor is a softmax you already computed.</text>
        <text x={6} y={204} fontSize="8" fill="var(--muted)">sampling is sequential — {L} forward passes for {L} tokens.</text>
      </Stage>
      <Controls>
        <Btn onClick={next}>token ▶</Btn>
        <Btn onClick={() => reset(sd + 1)}>↺ restart</Btn>
        <Btn active={gre} onClick={() => { setGre(!gre); reset(); }}>greedy</Btn>
        <Slider label="temperature T" min={0.2} max={2} step={0.05} value={T} onChange={(v) => { setT(v); reset(); }} />
      </Controls>
    </div>
  );
}
