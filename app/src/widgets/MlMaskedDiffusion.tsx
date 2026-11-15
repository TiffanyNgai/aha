import { useMemo, useState } from 'react';
import { Btn, Controls, Slider, Stage, rng } from './_kit';

/**
 * Masked (absorbing-state) diffusion on a short token sequence.
 * Forward: each position i carries a fixed threshold u_i ~ U(0,1); at time t the token is replaced by
 * [MASK] iff u_i < t. Masking is therefore monotone in t — once absorbed, a token never comes back, and
 * at t = 1 the whole sequence is masks. This is exactly the absorbing-state forward process of D3PM /
 * masked diffusion language models.
 * Reverse: start from all masks and unmask positions as t decreases. The order button chooses which
 * position is filled next: 'random' (the order the training objective assumes) or 'confidence' (fill the
 * position the model is surest about first — the any-order decoding trick used in practice).
 * The readout shows t, how many positions are masked, and the per-step loss weight 1/t that the masked
 * diffusion ELBO puts on each prediction.
 * props: {
 *   tokens?: string[]   the sequence, 4–14 short words (default a 9-word sentence)
 *   t?: number          initial time in [0,1] (default 0.5)
 *   mode?: 'forward'|'reverse'   initial direction (default 'forward')
 *   order?: 'random'|'confidence'  reverse unmasking order (default 'random')
 *   seed?: number       (default 4)
 * }
 */
const DEFAULT = ['the', 'small', 'cat', 'sat', 'on', 'a', 'very', 'warm', 'mat'];

export default function MlMaskedDiffusion({ tokens = DEFAULT, t: t0 = 0.5, mode: m0 = 'forward', order: o0 = 'random', seed = 4 }: {
  tokens?: string[]; t?: number; mode?: 'forward' | 'reverse'; order?: 'random' | 'confidence'; seed?: number;
}) {
  const toks = tokens.slice(0, 14);
  const n = toks.length;
  const [t, setT] = useState(Math.min(1, Math.max(0, t0)));
  const [mode, setMode] = useState(m0);
  const [order, setOrder] = useState(o0);

  // u_i: forward absorption threshold. conf_i: a fixed pseudo-confidence for the reverse ordering.
  const { u, conf } = useMemo(() => {
    const r = rng(seed);
    const u = Array.from({ length: n }, () => r.u());
    const conf = Array.from({ length: n }, (_, i) => 0.45 + 0.5 * r.u() + (toks[i].length <= 3 ? 0.25 : 0));
    return { u, conf };
  }, [n, seed, toks]);

  // Reverse order: positions are revealed one at a time as t falls from 1 to 0.
  const revealRank = useMemo(() => {
    const idx = Array.from({ length: n }, (_, i) => i);
    const key = order === 'confidence' ? (i: number) => -conf[i] : (i: number) => u[i];
    idx.sort((a, b) => key(a) - key(b));
    const rank = new Array<number>(n);
    idx.forEach((pos, k) => { rank[pos] = k; });
    return rank;
  }, [n, order, u, conf]);

  const masked = (i: number) => (mode === 'forward' ? u[i] < t : revealRank[i] >= Math.round((1 - t) * n));
  const nMasked = toks.reduce((s, _, i) => s + (masked(i) ? 1 : 0), 0);

  // Layout: wrap chips into rows inside a 320-wide viewBox.
  const chips = useMemo(() => {
    const out: { x: number; y: number; w: number; i: number }[] = [];
    let x = 8, y = 30;
    toks.forEach((w, i) => {
      const width = Math.max(30, 8 + 6.1 * Math.max(w.length, 6));
      if (x + width > 312) { x = 8; y += 28; }
      out.push({ x, y, w: width, i }); x += width + 5;
    });
    return out;
  }, [toks]);
  const h = (chips.length ? chips[chips.length - 1].y : 30) + 80;

  return (
    <div>
      <Stage w={320} h={h} label="Masked diffusion on a token sequence">
        <g fontSize="9" fill="var(--muted)">
          <text x={8} y={14}>{mode === 'forward' ? 'forward: tokens are absorbed into [MASK]' : 'reverse: masks are filled in, one position at a time'}</text>
        </g>
        {chips.map(({ x, y, w, i }) => {
          const m = masked(i);
          return (
            <g key={i}>
              <rect x={x} y={y} width={w} height={20} rx={5}
                fill={m ? 'var(--surface)' : 'var(--c1)'} fillOpacity={m ? 1 : 0.22}
                stroke={m ? 'var(--c5)' : 'var(--c1)'} strokeWidth={0.9}
                strokeDasharray={m ? '3 2' : undefined} />
              <text x={x + w / 2} y={y + 14} textAnchor="middle" fontSize="9.5"
                fill={m ? 'var(--c5)' : 'var(--fg)'}>{m ? '[MASK]' : toks[i]}</text>
              <text x={x + w / 2} y={y + 29} textAnchor="middle" fontSize="7" fill="var(--muted)">{i + 1}</text>
            </g>
          );
        })}
        <g fontSize="9.5" fill="var(--fg)">
          <text x={8} y={h - 34}>t = {t.toFixed(2)}</text>
          <text x={74} y={h - 34} fill="var(--c5)">masked: {nMasked}/{n}</text>
          <text x={176} y={h - 34} fill="var(--muted)">ELBO weight 1/t = {t > 0.02 ? (1 / t).toFixed(1) : '∞'}</text>
          <text x={8} y={h - 16} fontSize="8" fill="var(--muted)">
            {mode === 'forward' ? 'each position masks independently with probability t' : `unmasking order: ${order}`}
          </text>
        </g>
      </Stage>
      <Controls>
        <Btn active={mode === 'forward'} onClick={() => setMode('forward')}>Forward</Btn>
        <Btn active={mode === 'reverse'} onClick={() => setMode('reverse')}>Reverse</Btn>
        <Slider label="t" min={0} max={1} step={1 / (2 * n)} value={t} onChange={setT} />
        {mode === 'reverse' && <Btn active={order === 'random'} onClick={() => setOrder('random')}>Random order</Btn>}
        {mode === 'reverse' && <Btn active={order === 'confidence'} onClick={() => setOrder('confidence')}>Confidence order</Btn>}
      </Controls>
    </div>
  );
}
