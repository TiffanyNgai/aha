import { useState } from 'react';
import { Btn, Controls, PlayPause, Slider, Stage, prefersReducedMotion, useFrame } from './_kit';

/**
 * The 2:1 cover SU(2) → SO(3), shown as a rotation about the z-axis.
 * Left dial: an object (arrow + flag) carried by the rotation R(θ) ∈ SO(3). It is back where it
 * started at θ = 360°.
 * Right dial: the phase of a spinor component under U(θ) = exp(−iθσ_z/2) = diag(e^{−iθ/2}, e^{+iθ/2}).
 * The phase turns at HALF the rate, so at θ = 360° it has only gone half way round: U = −I. Only at
 * θ = 720° is the spinor back to where it began. Two elements ±U of SU(2) give the same rotation.
 * The track underneath marks where R and where U return to the identity.
 * props: { theta?: number (degrees 0–720, default 0), animate?: boolean (default true),
 *          speed?: number (degrees per second, default 90), buttons?: boolean (default true) }
 */
const LX = 78, RX = 240, CY = 82, R = 52;
const T0 = 18, T1 = 302, TY = 170; // track
const rad = (d: number) => (d * Math.PI) / 180;
const fmt = (v: number) => (Math.abs(v) < 5e-4 ? '0.000' : v.toFixed(3));

/** Arrow with a small flag, drawn from the dial centre out to radius R, rotated by `a` degrees. */
function Needle({ cx, a, col, dash, len }: { cx: number; a: number; col: string; dash?: boolean; len: number }) {
  const r = rad(a), c = Math.cos(r), s = Math.sin(r);
  const tip: [number, number] = [cx + len * c, CY - len * s];
  const nx = -s, ny = -c; // unit normal in screen coords
  const b: [number, number] = [cx + 0.6 * len * c, CY - 0.6 * len * s];
  const flag = `${b[0]},${b[1]} ${b[0] + 13 * nx},${b[1] + 13 * ny} ${b[0] + 0.3 * len * c + 13 * nx},${b[1] - 0.3 * len * s + 13 * ny} ${b[0] + 0.3 * len * c},${b[1] - 0.3 * len * s}`;
  return (
    <g>
      <polygon points={flag} fill={col} fillOpacity={dash ? 0.12 : 0.3} stroke={col} strokeWidth={dash ? 1 : 1.4} strokeDasharray={dash ? '3 2' : undefined} />
      <line x1={cx} y1={CY} x2={tip[0]} y2={tip[1]} stroke={col} strokeWidth={dash ? 1.4 : 2.6} strokeDasharray={dash ? '3 2' : undefined} strokeLinecap="round" />
      <circle cx={tip[0]} cy={tip[1]} r={dash ? 2.4 : 3.6} fill={col} />
    </g>
  );
}

/** Arc from angle 0 to angle a (degrees, anticlockwise) at radius rr. */
function arc(cx: number, a: number, rr: number) {
  const steps = Math.max(2, Math.round(Math.abs(a) / 6));
  const pts: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const r = rad((a * i) / steps);
    pts.push(`${(cx + rr * Math.cos(r)).toFixed(1)},${(CY - rr * Math.sin(r)).toFixed(1)}`);
  }
  return pts.join(' ');
}

export default function MathDoubleCover({ theta = 0, animate = true, speed = 90, buttons = true }: {
  theta?: number; animate?: boolean; speed?: number; buttons?: boolean;
}) {
  const [th, setTh] = useState(Math.max(0, Math.min(720, theta)));
  const [run, setRun] = useState(animate && !prefersReducedMotion());
  useFrame((dt) => setTh((v) => (v + dt * speed) % 720), run);

  const half = th / 2;
  const cosH = Math.cos(rad(half)), sinH = Math.sin(rad(half));
  const tx = (d: number) => T0 + ((T1 - T0) * d) / 720;
  const sign = cosH > 1e-6 ? '+' : cosH < -1e-6 ? '−' : '';

  return (
    <div>
      <Stage w={320} h={212} label="SU(2) double covers SO(3): a 360° rotation flips the sign of a spinor">
        {[[LX, 'var(--c2)', 'object in ℝ³ : R(θ)'], [RX, 'var(--c4)', 'spinor phase : e^(iθ/2)']].map(([cx, col, lab], i) => (
          <g key={i}>
            <circle cx={cx as number} cy={CY} r={R} fill="var(--surface)" stroke="var(--grid)" strokeWidth={1} />
            <circle cx={cx as number} cy={CY} r={2.4} fill="var(--fg)" />
            <text x={cx as number} y={20} fontSize="9" textAnchor="middle" fontWeight="bold" fill={col as string}>{lab as string}</text>
          </g>
        ))}
        {/* left: the rotation itself */}
        <Needle cx={LX} a={0} col="var(--muted)" dash len={R - 6} />
        <polyline points={arc(LX, th % 360, R - 14)} fill="none" stroke="var(--c2)" strokeWidth={1.2} opacity={0.6} />
        <Needle cx={LX} a={th} col="var(--c2)" len={R - 6} />
        {/* right: the half-angle phase */}
        <Needle cx={RX} a={0} col="var(--muted)" dash len={R - 6} />
        <polyline points={arc(RX, half, R - 14)} fill="none" stroke="var(--c4)" strokeWidth={1.2} opacity={0.6} />
        <Needle cx={RX} a={half} col="var(--c4)" len={R - 6} />
        <text x={RX} y={CY + R + 13} fontSize="8.5" textAnchor="middle" fill="var(--muted)">half the angle</text>
        <text x={LX} y={CY + R + 13} fontSize="8.5" textAnchor="middle" fill="var(--muted)">full angle</text>

        {/* track */}
        <line x1={T0} x2={T1} y1={TY} y2={TY} stroke="var(--grid)" strokeWidth={2} />
        {[0, 360, 720].map((d) => <g key={d}>
          <line x1={tx(d)} x2={tx(d)} y1={TY - 6} y2={TY + 6} stroke="var(--fg)" strokeWidth={1} />
          <text x={tx(d)} y={TY + 17} fontSize="8" textAnchor="middle" fill="var(--muted)">{d}°</text>
          <text x={tx(d)} y={TY - 10} fontSize="8" textAnchor="middle" fill="var(--c2)">R = I</text>
        </g>)}
        {[0, 720].map((d) => <text key={d} x={tx(d)} y={TY - 20} fontSize="8" textAnchor="middle" fill="var(--c4)">U = +I</text>)}
        <text x={tx(360)} y={TY - 20} fontSize="8" textAnchor="middle" fill="var(--c5)" fontWeight="bold">U = −I</text>
        <line x1={T0} x2={tx(th)} y1={TY} y2={TY} stroke="var(--c1)" strokeWidth={2.5} />
        <circle cx={tx(th)} cy={TY} r={4.5} fill="var(--c1)" stroke="var(--surface)" strokeWidth={1.2} />

        <g fontSize="9.5" fill="var(--fg)">
          <text x={T0} y={197}>θ = {th.toFixed(0)}°</text>
          <text x={T0 + 62} y={197} fill="var(--c4)">e^(iθ/2) = {fmt(cosH)} {sinH < 0 ? '−' : '+'} {fmt(Math.abs(sinH))}i</text>
          <text x={T0} y={208} fontSize="9" fill={Math.abs(cosH) > 0.999 ? (cosH > 0 ? 'var(--c1)' : 'var(--c5)') : 'var(--muted)'}>
            {Math.abs(th % 720) < 1 || Math.abs((th % 720) - 720) < 1
              ? 'U = +I : the spinor is back'
              : Math.abs((th % 720) - 360) < 1
                ? 'U = −I : same rotation, opposite spinor'
                : `U = diag(e^(−iθ/2), e^(+iθ/2)), sign of cos(θ/2) is ${sign || '0'}`}
          </text>
        </g>
      </Stage>
      <Controls>
        <PlayPause running={run} set={setRun} />
        <Slider label="θ" value={th} min={0} max={720} step={1} onChange={(v) => { setRun(false); setTh(v); }} format={(v) => `${v.toFixed(0)}°`} />
      </Controls>
      {buttons && <Controls>
        {[0, 180, 360, 540, 720].map((d) => <Btn key={d} active={Math.abs(th - d) < 0.5} onClick={() => { setRun(false); setTh(d); }}>{d}°</Btn>)}
      </Controls>}
    </div>
  );
}
