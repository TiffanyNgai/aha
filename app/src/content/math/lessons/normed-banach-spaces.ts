import type { LessonContent } from '../../types';

// Continuous ramps f_n that are Cauchy in the L¹ norm but whose limit — a step function — is not continuous.
const PX = (x: number) => 30 + x * 272;
const PY = (y: number) => 158 - y * 128;
const ramp = (n: number) =>
  `M${PX(0)},${PY(0)} L${PX(0.5)},${PY(0)} L${PX(0.5 + 1 / n)},${PY(1)} L${PX(1)},${PY(1)}`;
const ns = [2, 4, 8, 16];
const cols = ['var(--c1)', 'var(--c2)', 'var(--c4)', 'var(--c6)'];
const rampSvg = `<svg viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg" font-family="inherit">
  <line x1="${PX(0)}" y1="${PY(0)}" x2="${PX(1)}" y2="${PY(0)}" stroke="var(--fg)" stroke-width="0.8"/>
  <line x1="${PX(0)}" y1="${PY(0)}" x2="${PX(0)}" y2="${PY(1.1)}" stroke="var(--fg)" stroke-width="0.8"/>
  <text x="${PX(0) - 4}" y="${PY(1) + 3}" font-size="9" text-anchor="end" fill="var(--muted)">1</text>
  <text x="${PX(0.5)}" y="${PY(0) + 12}" font-size="9" text-anchor="middle" fill="var(--muted)">½</text>
  <text x="${PX(1)}" y="${PY(0) + 12}" font-size="9" text-anchor="middle" fill="var(--muted)">1</text>
  <path d="M${PX(0)},${PY(0)} L${PX(0.5)},${PY(0)}" fill="none" stroke="var(--muted)" stroke-width="2.4" stroke-dasharray="5 3"/>
  <path d="M${PX(0.5)},${PY(1)} L${PX(1)},${PY(1)}" fill="none" stroke="var(--muted)" stroke-width="2.4" stroke-dasharray="5 3"/>
  <circle cx="${PX(0.5)}" cy="${PY(0)}" r="2.4" fill="var(--muted)"/>
  <circle cx="${PX(0.5)}" cy="${PY(1)}" r="2.4" fill="none" stroke="var(--muted)" stroke-width="1.4"/>
  ${ns.map((n, i) => `<path d="${ramp(n)}" fill="none" stroke="${cols[i]}" stroke-width="1.2" opacity="0.55"/>`).join('\n  ')}
  <path d="${ramp(2)}" fill="none" stroke="var(--c5)" stroke-width="2.4">
    <animate attributeName="d" dur="6s" repeatCount="indefinite"
      values="${ns.map(ramp).join(';')};${ramp(2)}" keyTimes="0;0.22;0.44;0.66;1"/>
  </path>
  <text x="${PX(0.52)}" y="${PY(0.25)}" font-size="9" fill="var(--c5)">fₙ continuous</text>
  <text x="${PX(0.04)}" y="${PY(0.86)}" font-size="9" fill="var(--muted)">limit: a step — not continuous</text>
  <text x="160" y="184" font-size="9" text-anchor="middle" fill="var(--fg)">‖fₙ − step‖₁ = area between them = 1/(2n) → 0</text>
</svg>`;

export default {
  cards: [
    {
      kind: 'explain',
      title: 'From distance to size',
      body: String.raw`A [metric](@math/metric-spaces) tells you how far apart two things are. In a **vector space** you can do better: give every vector its own **size**, and the distance comes for free as the size of the difference.

**Definition.** A **norm** on a real or complex vector space $X$ is a map $\|\cdot\| : X \to [0, \infty)$ with, for all $x, y \in X$ and scalars $\alpha$:

1. $\|x\| = 0 \iff x = 0$ (definiteness);
2. $\|\alpha x\| = |\alpha|\,\|x\|$ (absolute homogeneity);
3. $\|x + y\| \le \|x\| + \|y\|$ (the **triangle inequality**).

Then $d(x, y) = \|x - y\|$ is a metric, so every word from metric spaces — open, closed, convergent, Cauchy, continuous — applies verbatim. A vector space with a norm is a **normed space**.`,
    },
    {
      kind: 'widget',
      title: 'One space, many norms',
      body: String.raw`On $\mathbb{R}^n$ the standard family is, for $p \ge 1$,
$$\|x\|_p = \Big(\sum_{i=1}^n |x_i|^p\Big)^{1/p}, \qquad \|x\|_\infty = \max_i |x_i|.$$
A norm is completely described by its **unit ball** $\{x : \|x\| \le 1\}$: a diamond for $p=1$, a disc for $p=2$, a square for $p=\infty$. Homogeneity says every other ball is a scaled copy; the triangle inequality says the ball is **convex**. That is exactly why $p < 1$ fails — the "ball" becomes a pinched star.`,
      widget: { type: 'MathUnitBalls', props: { p: 2, r: 1, q: [0.7, 0.55] } },
    },
    {
      kind: 'recall',
      title: 'Carried over from metric spaces',
      points: [
        String.raw`$x_n \to x$ means $\|x_n - x\| \to 0$; $(x_n)$ is **Cauchy** if $\|x_m - x_n\| \to 0$ as $m, n \to \infty$.`,
        String.raw`**Complete** = every Cauchy sequence converges to a point *of the space*.`,
        String.raw`$\mathbb{R}$, $\mathbb{R}^n$ and $C[a,b]$ with the sup metric are complete; $\mathbb{Q}$, $(0,1)$ and $C[a,b]$ with the $L^1$ metric are not.`,
        String.raw`A contraction on a complete space has exactly one fixed point (Banach).`,
      ],
      link: 'math/metric-spaces',
    },
    {
      kind: 'mcq',
      prompt: String.raw`Which of these rules is **not** a norm on $\mathbb{R}^2$?`,
      choices: [
        String.raw`$\|x\| = |x_1| + |x_2|$`,
        String.raw`$\|x\| = \max(|x_1|, |x_2|)$`,
        String.raw`$\|x\| = |x_1|$`,
        String.raw`$\|x\| = \sqrt{x_1^2 + 4x_2^2}$`,
      ],
      answer: 2,
      why: String.raw`$|x_1|$ is homogeneous and satisfies the triangle inequality, but it vanishes on the whole $x_2$-axis — e.g. $\|(0, 7)\| = 0$ — so definiteness fails. (Such a rule is called a *seminorm*.) The sum and the max are the $p = 1$ and $p = \infty$ norms, and $\sqrt{x_1^2 + 4x_2^2}$ is the Euclidean norm after stretching the second coordinate, which is still a norm — its unit ball is an ellipse.`,
    },
    {
      kind: 'explain',
      title: 'Banach spaces: no missing limits',
      body: String.raw`> A **Banach space** is a normed space that is **complete**.

Why insist on this? Almost every construction in analysis produces an answer as a *limit of approximations*: a Fourier series, a Picard iteration, a minimising sequence, a numerical scheme. Completeness is the guarantee that the limit is an element of the space you are working in, so the answer actually exists.

Working in an incomplete space is like doing arithmetic in $\mathbb{Q}$ and asking for $\sqrt2$: you can write down better and better approximations that converge to nothing you are allowed to name.`,
    },
    {
      kind: 'widget',
      title: 'An incomplete normed space',
      body: String.raw`Take the continuous functions $C[0,1]$ with the **$L^1$ norm** $\|f\|_1 = \int_0^1 |f|$. The ramps $f_n$ below are continuous and form a Cauchy sequence: $\|f_n - f_m\|_1 \le \tfrac12\big|\tfrac1n - \tfrac1m\big|$. But the only candidate limit is a step function, which is **not continuous** — so the Cauchy sequence has no limit inside the space. $(C[0,1], \|\cdot\|_1)$ is *not* a Banach space.

The repair is to enlarge the space until the holes are filled. Doing that properly requires Lebesgue's integral and produces $L^1[0,1]$.`,
      widget: { type: 'SvgDiagram', props: { svg: rampSvg } },
    },
    {
      kind: 'truefalse',
      prompt: String.raw`$C[0,1]$ with the sup norm $\|f\|_\infty = \sup_{x}|f(x)|$ is a Banach space.`,
      answer: true,
      why: String.raw`If $(f_n)$ is Cauchy in $\|\cdot\|_\infty$ it is *uniformly* Cauchy, so it converges uniformly to some $f$, and a [uniform limit](@math/uniform-convergence) of continuous functions is continuous. So the limit stays in $C[0,1]$. The same set of functions with the $L^1$ norm is **not** complete — completeness is a property of the pair (space, norm), not of the set alone.`,
    },
    {
      kind: 'explain',
      title: 'The standard Banach spaces',
      body: String.raw`**Sequence spaces.** For $1 \le p < \infty$, $\ \ell^p = \{(x_1, x_2, \dots) : \sum_i |x_i|^p < \infty\}$ with $\|x\|_p = (\sum_i |x_i|^p)^{1/p}$; and $\ell^\infty$ = bounded sequences with the sup norm.

**Function spaces.** For $1 \le p < \infty$, $\ L^p(\Omega) = \{f : \int_\Omega |f|^p < \infty\}$ with $\|f\|_p = (\int_\Omega |f|^p)^{1/p}$, where functions equal almost everywhere count as the same (otherwise $\|f\|_p = 0$ would not force $f = 0$). $L^\infty$ uses the essential supremum.

Two inequalities make these work, for $\tfrac1p + \tfrac1q = 1$:

- **Hölder:** $\displaystyle\int |fg| \le \|f\|_p\,\|g\|_q$ — the generalisation of Cauchy–Schwarz ($p = q = 2$).
- **Minkowski:** $\|f + g\|_p \le \|f\|_p + \|g\|_p$ — this *is* the triangle inequality, and it is the reason $p \ge 1$ is required.

**Riesz–Fischer theorem:** every $\ell^p$ and every $L^p$, $1 \le p \le \infty$, is complete.`,
    },
    {
      kind: 'numeric',
      prompt: String.raw`Compute $\|f\|_2$ for $f(x) = x$ on $[0, 1]$, i.e. $\big(\int_0^1 x^2\,dx\big)^{1/2}$. Give 4 decimal places.`,
      answer: 0.5774,
      tolerance: 0.002,
      why: String.raw`$\int_0^1 x^2\,dx = \tfrac13$, so $\|f\|_2 = 1/\sqrt3 \approx 0.5774$. For comparison $\|f\|_1 = \int_0^1 x\,dx = 0.5$ and $\|f\|_\infty = 1$. On a set of total measure $1$ the $L^p$ norms increase with $p$ — a common trap is to assume they are all the same size.`,
    },
    {
      kind: 'multi',
      prompt: 'Which of these normed spaces are complete (Banach)?',
      choices: [
        String.raw`$\ell^2$ with $\|x\|_2$`,
        String.raw`$L^1[0,1]$ with $\|f\|_1$`,
        String.raw`$C[0,1]$ with $\|f\|_\infty$`,
        String.raw`$C[0,1]$ with $\|f\|_1 = \int_0^1 |f|$`,
        String.raw`the polynomials on $[0,1]$ with $\|f\|_\infty$`,
      ],
      answers: [0, 1, 2],
      why: String.raw`$\ell^2$ and $L^1[0,1]$ are complete by Riesz–Fischer, and $C[0,1]$ with the sup norm is complete because uniform limits of continuous functions are continuous. The continuous functions under the $L^1$ norm leak out to step functions. The polynomials leak out too: by Weierstrass's approximation theorem their uniform closure is all of $C[0,1]$, so e.g. partial sums of $e^x$ are Cauchy with a non-polynomial limit.`,
    },
    {
      kind: 'explain',
      title: 'Finite vs infinite dimensions',
      body: String.raw`In **finite** dimensions life is simple: all norms on $\mathbb{R}^n$ are **equivalent**, meaning each pair satisfies $c\|x\|_a \le \|x\|_b \le C\|x\|_a$ for fixed constants. (For instance $\|x\|_\infty \le \|x\|_2 \le \|x\|_1 \le n\|x\|_\infty$.) Equivalent norms give the same convergent sequences, the same open sets, the same continuous functions — so the choice of norm is only a matter of convenience. Every finite-dimensional normed space is automatically complete.

In **infinite** dimensions this collapses. On $C[0,1]$ we have $\|f\|_1 \le \|f\|_\infty$, but no constant works the other way: a spike of height $1$ and width $1/n$ has $\|f\|_\infty = 1$ while $\|f\|_1 \approx 1/(2n)$. Different norms really are different analyses.

**Riesz's theorem** makes the gap precise: the closed unit ball of a normed space is compact **if and only if** the space is finite-dimensional. Bounded closed sets being non-compact is the central difficulty of the whole subject.`,
    },
    {
      kind: 'fill',
      prompt: String.raw`A normed space that is ___ is called a ___ space. The closed unit ball of a normed space is compact exactly when the space is ___ -dimensional.`,
      bank: ['complete', 'Banach', 'finite', 'convex', 'Hilbert', 'infinite', 'bounded'],
      answer: ['complete', 'Banach', 'finite'],
      why: String.raw`Banach = normed + complete. Riesz's theorem says compactness of the closed unit ball characterises finite dimension; in $\ell^2$ the unit vectors $e_n$ satisfy $\|e_n - e_m\|_2 = \sqrt2$ for $n \ne m$, so they sit in the unit ball with no convergent subsequence.`,
    },
    {
      kind: 'explain',
      title: 'What completeness buys you',
      body: String.raw`Three payoffs you will use again and again.

1. **Neumann series.** If $X$ is Banach and $T$ is a bounded operator with $\|T\| < 1$, then $I - T$ is invertible and $(I - T)^{-1} = \sum_{n\ge0} T^n$. The series converges because $\sum \|T\|^n$ converges and the operators live in a complete space — "absolutely convergent $\Rightarrow$ convergent" is itself equivalent to completeness.
2. **Fixed points.** Banach's contraction theorem needs a complete space. Applied to $C[a,b]$ with the sup norm it gives [existence and uniqueness for ODEs](@math/existence-uniqueness).
3. **The three big theorems.** Uniform boundedness (Banach–Steinhaus), the open mapping theorem and the closed graph theorem all rest on the Baire category theorem, which holds in complete spaces. They are false without completeness.`,
    },
    {
      kind: 'order',
      prompt: String.raw`Put the proof that $\|T\| < 1 \Rightarrow I - T$ is invertible into order ($X$ a Banach space).`,
      steps: [
        String.raw`$\|T^n\| \le \|T\|^n$, because the operator norm is submultiplicative: $\|AB\| \le \|A\|\|B\|$.`,
        String.raw`So $\sum_{n \ge 0} \|T^n\| \le \sum_{n\ge0}\|T\|^n = \frac{1}{1 - \|T\|} < \infty$: the series is absolutely convergent.`,
        String.raw`The bounded operators on a Banach space form a Banach space, and there absolute convergence implies convergence. Call the sum $S = \sum_{n\ge0} T^n$.`,
        String.raw`Telescoping, $(I - T)\sum_{n=0}^{N} T^n = I - T^{N+1}$, and $\|T^{N+1}\| \le \|T\|^{N+1} \to 0$.`,
        String.raw`Letting $N \to \infty$ gives $(I - T)S = S(I - T) = I$, so $S = (I - T)^{-1}$, and $\|S\| \le (1 - \|T\|)^{-1}$. ∎`,
      ],
      why: String.raw`It is the geometric series $\tfrac{1}{1-t} = \sum t^n$, transplanted to operators. Completeness enters only at step 3 — and it is indispensable: without it the partial sums are Cauchy but need not converge to anything.`,
    },
    {
      kind: 'match',
      prompt: 'Match each space to the norm it is normally given.',
      pairs: [
        [String.raw`$\mathbb{R}^n$ (Euclidean)`, String.raw`$\big(\sum_i x_i^2\big)^{1/2}$`],
        [String.raw`$\ell^1$`, String.raw`$\sum_i |x_i|$`],
        [String.raw`$C[0,1]$`, String.raw`$\sup_{x \in [0,1]} |f(x)|$`],
        [String.raw`$L^p(\Omega)$`, String.raw`$\big(\int_\Omega |f|^p\big)^{1/p}$`],
        [String.raw`$\ell^\infty$`, String.raw`$\sup_i |x_i|$`],
      ],
      why: String.raw`Each is the $p$-norm pattern: sum (or integrate) the $p$-th powers and take the $p$-th root, with $p = \infty$ replaced by a supremum. All five are complete.`,
    },
    {
      kind: 'explain',
      title: 'Key takeaways',
      body: String.raw`- A **norm** gives vectors a size obeying definiteness, homogeneity and the triangle inequality; $d(x,y) = \|x-y\|$ then makes it a metric space.
- One vector space carries many norms. The unit ball is the norm's fingerprint, and it is always convex.
- A **Banach space** is a complete normed space: $\mathbb{R}^n$, $\ell^p$, $L^p$, and $C[a,b]$ with the sup norm. $C[a,b]$ with $\|\cdot\|_1$ is not.
- **Hölder** and **Minkowski** are what make the $L^p$ norms work; **Riesz–Fischer** says they are complete.
- In finite dimensions all norms are equivalent and the unit ball is compact. In infinite dimensions neither holds — that is the whole difficulty, and the subject of this unit.

Next: add an inner product, and lengths come with angles — [Hilbert spaces](@math/hilbert-spaces).`,
    },
  ],
  references: [
    { authors: 'E. Kreyszig', title: 'Introductory Functional Analysis with Applications', year: 1978, venue: 'Wiley', detail: 'Ch. 2 (normed spaces, Banach spaces, finite-dimensional spaces, compactness); Ch. 4 (Hahn–Banach, uniform boundedness, open mapping, closed graph)' },
    { authors: 'H. Brezis', title: 'Functional Analysis, Sobolev Spaces and Partial Differential Equations', year: 2011, venue: 'Springer Universitext', detail: 'Ch. 2 (the Baire category theorem and its three consequences); Ch. 4 (Lᵖ spaces: Hölder, Minkowski, Riesz–Fischer, duality)' },
    { authors: 'W. Rudin', title: 'Functional Analysis', year: 1991, venue: '2nd ed., McGraw-Hill', detail: 'Ch. 1 (topological vector spaces, normed spaces); Ch. 2 (completeness: Baire, Banach–Steinhaus, open mapping, closed graph)' },
    { authors: 'M. Reed, B. Simon', title: 'Methods of Modern Mathematical Physics I: Functional Analysis', year: 1980, venue: 'Revised ed., Academic Press', detail: 'Ch. III (Banach spaces; the Lᵖ and ℓᵖ examples, duals, the Riesz–Fischer theorem)' },
  ],
} satisfies LessonContent;
