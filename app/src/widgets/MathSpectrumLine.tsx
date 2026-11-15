import { useState } from 'react';
import { Btn, Controls, Slider, Stage } from './_kit';

type Op = 'right' | 'left' | 'mult' | 'compact';
/**
 * The spectrum of four standard operators, drawn in the complex plane, with a probe λ you can move
 * (Re and Im sliders) and a live classification of λ as resolvent / point / continuous / residual.
 *   'right'   right shift R(x₁,x₂,…) = (0,x₁,x₂,…) on ℓ²: σ = closed unit disc; no eigenvalues;
 *             |λ| < 1 is residual spectrum (range not dense); |λ| = 1 is continuous spectrum.
 *   'left'    left shift L(x₁,x₂,…) = (x₂,x₃,…) on ℓ²: σ = closed unit disc; |λ| < 1 is point spectrum
 *             (eigenvector (1, λ, λ², …)); |λ| = 1 is continuous spectrum; residual part empty.
 *   'mult'    (Mf)(x) = x f(x) on L²(0,1): self-adjoint, σ = [0,1], ALL of it continuous spectrum —
 *             not a single eigenvalue.
 *   'compact' diagonal A eₙ = eₙ/n on ℓ²: compact self-adjoint, eigenvalues 1/n, and 0 ∈ σ(A) is in the
 *             continuous spectrum (A is injective with dense, non-closed range).
 * In the two real-spectrum modes the probe snaps to a nearby eigenvalue so you can land on one exactly.
 * props: { op?: 'right' | 'left' | 'mult' | 'compact' (default 'right'), re?: number (default 0.5),
 *          im?: number (default 0.3), switchable?: boolean (default true) }
 */
const NAME: Record<Op, string> = { right: 'right shift', left: 'left shift', mult: 'multiply by x', compact: 'diagonal 1/n' };
const KIND = {
  res: { label: 'resolvent set', col: 'var(--muted)', note: '(T − λI)⁻¹ exists and is bounded' },
  pt: { label: 'point spectrum', col: 'var(--c5)', note: 'T − λI is not injective: λ is an eigenvalue' },
  cont: { label: 'continuous spectrum', col: 'var(--c3)', note: 'injective, range dense but not all of the space' },
  resid: { label: 'residual spectrum', col: 'var(--c4)', note: 'injective, but the range is not even dense' },
};

export default function MathSpectrumLine({ op = 'right', re = 0.5, im = 0.3, switchable = true }: {
  op?: Op; re?: number; im?: number; switchable?: boolean;
}) {
  const [o, setO] = useState<Op>(op);
  const [a, setA] = useState(re);
  const [b, setB] = useState(im);
  const real = o === 'mult' || o === 'compact';
  let x = a, yv = real ? 0 : b;
  if (o === 'compact') { for (let n = 1; n <= 24; n++) if (Math.abs(a - 1 / n) < 0.025) x = 1 / n; if (Math.abs(a) < 0.025) x = 0; }
  const rad = Math.hypot(x, yv);

  let kind: keyof typeof KIND = 'res';
  if (o === 'right') kind = rad > 1.02 ? 'res' : Math.abs(rad - 1) <= 0.02 ? 'cont' : 'resid';
  else if (o === 'left') kind = rad > 1.02 ? 'res' : Math.abs(rad - 1) <= 0.02 ? 'cont' : 'pt';
  else if (o === 'mult') kind = x >= -0.001 && x <= 1.001 ? 'cont' : 'res';
  else { const eig = [...Array(24)].some((_, i) => Math.abs(x - 1 / (i + 1)) < 1e-9); kind = eig ? 'pt' : Math.abs(x) < 1e-9 ? 'cont' : 'res'; }
  const K = KIND[kind];

  const cx = 150, cy = 86, R = 62;
  const px = cx + x * R, py = cy - yv * R;
  const eigs = Array.from({ length: 16 }, (_, i) => 1 / (i + 1));

  return (
    <div>
      <Stage w={320} h={200} label="Spectrum of a linear operator in the complex plane">
        <line x1={cx - 100} x2={cx + 100} y1={cy} y2={cy} stroke="var(--fg)" strokeWidth={0.8} />
        {!real && <line x1={cx} x2={cx} y1={cy - 80} y2={cy + 80} stroke="var(--fg)" strokeWidth={0.8} />}
        <text x={cx + 102} y={cy + 10} fontSize="8" fill="var(--muted)">Re λ</text>
        {!real && <text x={cx + 3} y={cy - 82} fontSize="8" fill="var(--muted)">Im λ</text>}
        <line x1={cx + R} x2={cx + R} y1={cy - 2} y2={cy + 2} stroke="var(--fg)" />
        <text x={cx + R} y={cy + 12} fontSize="8" textAnchor="middle" fill="var(--muted)">1</text>

        {(o === 'right' || o === 'left') && (
          <>
            <circle cx={cx} cy={cy} r={R} fill={o === 'left' ? 'var(--c5)' : 'var(--c4)'} opacity={0.17} />
            <circle cx={cx} cy={cy} r={R} fill="none" stroke="var(--c3)" strokeWidth={2.4} />
            <text x={cx} y={cy - R - 5} fontSize="8" textAnchor="middle" fill="var(--c3)">|λ| = 1: continuous</text>
            <text x={cx} y={cy + 20} fontSize="8" textAnchor="middle" fill={o === 'left' ? 'var(--c5)' : 'var(--c4)'}>
              {o === 'left' ? '|λ| < 1: eigenvalues' : '|λ| < 1: residual'}
            </text>
          </>
        )}
        {o === 'mult' && (
          <>
            <line x1={cx} x2={cx + R} y1={cy} y2={cy} stroke="var(--c3)" strokeWidth={5} strokeLinecap="round" opacity={0.85} />
            <text x={cx + R / 2} y={cy - 10} fontSize="8" textAnchor="middle" fill="var(--c3)">σ(M) = [0, 1], all continuous</text>
            <text x={cx + R / 2} y={cy + 22} fontSize="8" textAnchor="middle" fill="var(--muted)">no eigenvalues at all</text>
          </>
        )}
        {o === 'compact' && (
          <>
            {eigs.map((e, i) => <circle key={i} cx={cx + e * R} cy={cy} r={2.6} fill="var(--c5)" />)}
            <circle cx={cx} cy={cy} r={3.4} fill="none" stroke="var(--c3)" strokeWidth={1.6} />
            <text x={cx + R / 2} y={cy - 12} fontSize="8" textAnchor="middle" fill="var(--c5)">eigenvalues 1, ½, ⅓, …</text>
            <text x={cx - 4} y={cy + 22} fontSize="8" textAnchor="end" fill="var(--c3)">0: continuous, not an eigenvalue</text>
          </>
        )}

        <circle cx={px} cy={py} r={4.6} fill="none" stroke={K.col} strokeWidth={2} />
        <circle cx={px} cy={py} r={1.6} fill={K.col} />
        <text x={16} y={160} fontSize="9.5" fill="var(--fg)">
          λ = {x.toFixed(2)}{real ? '' : (yv < 0 ? ' − ' : ' + ') + Math.abs(yv).toFixed(2) + 'i'}  ·  |λ| = {rad.toFixed(2)}
        </text>
        <text x={16} y={175} fontSize="10" fill={K.col}>{K.label}</text>
        <text x={16} y={190} fontSize="8" fill="var(--muted)">{K.note}</text>
      </Stage>
      <Controls>
        {switchable && (['right', 'left', 'mult', 'compact'] as Op[]).map((t) => (
          <Btn key={t} active={o === t} onClick={() => { setO(t); setA(t === 'compact' ? 0.5 : t === 'mult' ? 0.4 : 0.5); setB(t === 'right' || t === 'left' ? 0.3 : 0); }}>{NAME[t]}</Btn>
        ))}
        <Slider label="Re λ" value={a} min={-1.5} max={1.5} step={0.01} onChange={setA} />
        {!real && <Slider label="Im λ" value={b} min={-1.5} max={1.5} step={0.01} onChange={setB} />}
        {!real && <Btn onClick={() => { setA(0.6); setB(0.8); }}>put λ on |λ| = 1</Btn>}
      </Controls>
    </div>
  );
}
