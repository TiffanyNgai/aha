import { useRef, useState } from 'react';
import { Controls, PlayPause, Slider, Stage, prefersReducedMotion, useFrame } from './_kit';

/**
 * Noether's theorem made visible, on a 2D oscillator with potential V = ½(x² + ω²y²), ω = 1 + ε.
 * Left: the orbit, traced live (RK4). Right: two running strip charts of the energy
 * E = ½(vx² + vy²) + V and the angular momentum L = x·v_y − y·v_x, each against its starting
 * value (dashed line), with the measured drift in percent.
 * With ε = 0 the potential is rotationally symmetric — the orbit is a closed ellipse and L is flat.
 * Turn ε up and the symmetry is gone: the orbit opens into a Lissajous figure and L visibly swings,
 * while E stays flat because the force law still does not depend on the time.
 * props: { eps?: number (0–0.8, default 0), speed?: number (time units per second, default 1.6),
 *          start?: [x, y, vx, vy] (default [1.4, 0, 0, 0.95]), animate?: boolean (default true),
 *          window?: number (time span of the strip charts, default 14) }
 */
type S = [number, number, number, number];
const BX = 86, BY = 105, PS = 36;           // orbit panel centre and pixels per unit
const TX0 = 188, TX1 = 314;                  // strip chart x range
const EY = [32, 88] as const, LY = [112, 168] as const;

const deriv = (s: S, w2: number): S => [s[2], s[3], -s[0], -w2 * s[1]];
function rk4(s: S, h: number, w2: number): S {
  const a = deriv(s, w2);
  const s2 = s.map((v, i) => v + (h / 2) * a[i]) as S; const b = deriv(s2, w2);
  const s3 = s.map((v, i) => v + (h / 2) * b[i]) as S; const c = deriv(s3, w2);
  const s4 = s.map((v, i) => v + h * c[i]) as S; const d = deriv(s4, w2);
  return s.map((v, i) => v + (h / 6) * (a[i] + 2 * b[i] + 2 * c[i] + d[i])) as S;
}
const energy = (s: S, w2: number) => 0.5 * (s[2] * s[2] + s[3] * s[3]) + 0.5 * (s[0] * s[0] + w2 * s[1] * s[1]);
const angmom = (s: S) => s[0] * s[3] - s[1] * s[2];

export default function MathNoetherOrbit({ eps = 0, speed = 1.6, start = [1.4, 0, 0, 0.95], animate = true, window: win = 14 }: {
  eps?: number; speed?: number; start?: S; animate?: boolean; window?: number;
}) {
  const [ep, setEp] = useState(Math.max(0, Math.min(0.8, eps)));
  const [run, setRun] = useState(animate && !prefersReducedMotion());
  const [, force] = useState(0);
  const st = useRef<{ s: S; t: number; path: [number, number][]; hist: [number, number, number][]; ep: number }>({
    s: [...start] as S, t: 0, path: [], hist: [], ep: ep,
  });
  const w2 = (1 + ep) * (1 + ep);
  if (st.current.ep !== ep) st.current = { s: [...start] as S, t: 0, path: [], hist: [], ep };

  const E0 = energy(start as S, w2), L0 = angmom(start as S);
  useFrame((dt) => {
    const c = st.current;
    const target = Math.min(0.08, dt) * speed;
    const h = 0.004;
    for (let done = 0; done < target; done += h) { c.s = rk4(c.s, h, w2); c.t += h; }
    c.path.push([c.s[0], c.s[1]]);
    c.hist.push([c.t, energy(c.s, w2), angmom(c.s)]);
    if (c.path.length > 900) c.path.shift();
    if (c.hist.length > 900) c.hist.shift();
    force((v) => v + 1);
  }, run);

  const c = st.current;
  const t = c.t;
  const t0 = Math.max(0, t - win);
  const tx = (v: number) => TX0 + ((v - t0) / win) * (TX1 - TX0);
  const band = (lo: number, hi: number, v: number, ref: number, amp: number) =>
    (lo + hi) / 2 - ((v - ref) / amp) * ((hi - lo) / 2) * 0.86;
  const Es = c.hist.map((r) => r[1]), Ls = c.hist.map((r) => r[2]);
  const ampE = Math.max(0.06, ...Es.map((v) => Math.abs(v - E0) * 1.3));
  const ampL = Math.max(0.06, ...Ls.map((v) => Math.abs(v - L0) * 1.3));
  const line = (key: 0 | 1, lo: number, hi: number, ref: number, amp: number) =>
    c.hist.filter((r) => r[0] >= t0).map((r) => `${tx(r[0]).toFixed(1)},${band(lo, hi, r[key + 1], ref, amp).toFixed(1)}`).join(' ');
  const nowE = Es.length ? Es[Es.length - 1] : E0;
  const nowL = Ls.length ? Ls[Ls.length - 1] : L0;
  const drift = (v: number, ref: number) => (Math.abs(ref) < 1e-9 ? '—' : `${(((v - ref) / Math.abs(ref)) * 100).toFixed(1)}%`);
  const pathD = c.path.map(([x, y], i) => `${i ? 'L' : 'M'}${(BX + PS * x).toFixed(1)},${(BY - PS * y).toFixed(1)}`).join('');

  return (
    <div>
      <Stage w={320} h={212} label="Energy and angular momentum along an orbit, with and without rotational symmetry">
        <defs><clipPath id="no-orb"><rect x={6} y={24} width={160} height={162} /></clipPath></defs>
        <text x={8} y={16} fontSize="9.5" fontWeight="bold" fill="var(--c2)">V = ½(x² + ω²y²), ω = {(1 + ep).toFixed(2)}</text>
        <g clipPath="url(#no-orb)">
          {[0.6, 1.2, 1.8].map((r) => (
            <ellipse key={r} cx={BX} cy={BY} rx={PS * r} ry={(PS * r) / (1 + ep)} fill="none" stroke="var(--grid)" strokeWidth={0.6} />
          ))}
          <line x1={6} x2={166} y1={BY} y2={BY} stroke="var(--fg)" strokeWidth={0.6} opacity={0.5} />
          <line y1={24} y2={186} x1={BX} x2={BX} stroke="var(--fg)" strokeWidth={0.6} opacity={0.5} />
          <path d={pathD} fill="none" stroke="var(--c2)" strokeWidth={1.3} opacity={0.75} />
          <circle cx={BX + PS * c.s[0]} cy={BY - PS * c.s[1]} r={4.2} fill="var(--c5)" stroke="var(--surface)" strokeWidth={1.2} />
        </g>
        <text x={8} y={198} fontSize="8.5" fill="var(--muted)">
          {ep < 1e-9 ? 'ε = 0: V depends only on the distance — rotations are a symmetry' : 'ε > 0: V also depends on the direction — rotations are not'}
        </text>
        <text x={8} y={208} fontSize="8.5" fill="var(--muted)">grey curves: level sets of V · t = {t.toFixed(1)}</text>

        {([['energy E', EY, 'var(--c3)', nowE, E0, ampE, 0], ['angular momentum L', LY, 'var(--c4)', nowL, L0, ampL, 1]] as const).map(([lab, yy, col, now, ref, amp, k]) => (
          <g key={lab as string}>
            <rect x={TX0} y={yy[0]} width={TX1 - TX0} height={yy[1] - yy[0]} fill="var(--surface)" stroke="var(--grid)" strokeWidth={0.8} />
            <line x1={TX0} x2={TX1} y1={(yy[0] + yy[1]) / 2} y2={(yy[0] + yy[1]) / 2} stroke="var(--muted)" strokeWidth={0.8} strokeDasharray="3 3" />
            <polyline points={line(k as 0 | 1, yy[0], yy[1], ref as number, amp as number)} fill="none" stroke={col as string} strokeWidth={1.6} />
            <text x={TX0} y={yy[0] - 12} fontSize="9" fontWeight="bold" fill={col as string}>{lab as string}</text>
            <text x={TX0} y={yy[0] - 3} fontSize="8.5" fill="var(--muted)">
              now {(now as number).toFixed(3)} · start {(ref as number).toFixed(3)}
            </text>
            <text x={TX1} y={yy[1] + 9} fontSize="8.5" textAnchor="end" fill={col as string}>drift {drift(now as number, ref as number)}</text>
          </g>
        ))}
        <text x={TX0} y={196} fontSize="8.5" fill="var(--muted)">time-shift symmetry → E</text>
        <text x={TX0} y={206} fontSize="8.5" fill="var(--muted)">rotation symmetry → L</text>
      </Stage>
      <Controls>
        <PlayPause running={run} set={setRun} />
        <Slider label="ε" value={ep} min={0} max={0.8} step={0.01} onChange={setEp} />
      </Controls>
    </div>
  );
}
