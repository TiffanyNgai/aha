import type { LessonContent } from '../../types';

// An integral operator (Tf)(x) = ∫ K(x,y) f(y) dy with a Gaussian kernel: input bumps come out smoothed.
const SIG = 0.05;
const K = (x: number, y: number) => Math.exp(-((x - y) ** 2) / (2 * SIG * SIG)) / (SIG * Math.sqrt(2 * Math.PI));
const fIn = (y: number) => ((y > 0.2 && y < 0.45) || (y > 0.62 && y < 0.68) ? 1 : 0);
const Tf = (x: number) => { let s = 0; for (let i = 0; i < 400; i++) { const y = (i + 0.5) / 400; s += K(x, y) * fIn(y); } return s / 400; };
const panel = (x0: number) => ({ x0, x1: x0 + 90, y0: 34, y1: 114 });
const curve = (g: (t: number) => number, p: { x0: number; x1: number; y0: number; y1: number }, lo = -0.15, hi = 1.3) => {
  const pts: string[] = [];
  for (let i = 0; i <= 120; i++) {
    const t = i / 120;
    const px = p.x0 + t * (p.x1 - p.x0);
    const py = p.y1 - ((Math.max(lo, Math.min(hi, g(t))) - lo) / (hi - lo)) * (p.y1 - p.y0);
    pts.push(`${i ? 'L' : 'M'}${px.toFixed(1)},${py.toFixed(1)}`);
  }
  return pts.join('');
};
const A = panel(14), B = panel(118), Cp = panel(216);
const NC = 18;
const cells: string[] = [];
for (let i = 0; i < NC; i++) for (let j = 0; j < NC; j++) {
  const x = (i + 0.5) / NC, y = (j + 0.5) / NC;
  const v = Math.min(1, K(x, y) / K(0, 0));
  if (v < 0.02) continue;
  const w = (B.x1 - B.x0) / NC, h = (B.y1 - B.y0) / NC;
  cells.push(`<rect x="${(B.x0 + i * w).toFixed(1)}" y="${(B.y0 + j * h).toFixed(1)}" width="${(w + 0.4).toFixed(1)}" height="${(h + 0.4).toFixed(1)}" fill="var(--c2)" opacity="${v.toFixed(2)}"/>`);
}
const kernelSvg = `<svg viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg" font-family="inherit">
  <text x="${A.x0}" y="26" font-size="9" fill="var(--c3)">input f(y)</text>
  <rect x="${A.x0}" y="${A.y0}" width="${A.x1 - A.x0}" height="${A.y1 - A.y0}" fill="none" stroke="var(--grid)"/>
  <path d="${curve(fIn, A)}" fill="none" stroke="var(--c3)" stroke-width="1.8"/>
  <text x="${B.x0}" y="26" font-size="9" fill="var(--c2)">kernel K(x, y)</text>
  <rect x="${B.x0}" y="${B.y0}" width="${B.x1 - B.x0}" height="${B.y1 - B.y0}" fill="none" stroke="var(--grid)"/>
  ${cells.join('\n  ')}
  <text x="${Cp.x0}" y="26" font-size="9" fill="var(--c1)">output (Tf)(x)</text>
  <rect x="${Cp.x0}" y="${Cp.y0}" width="${Cp.x1 - Cp.x0}" height="${Cp.y1 - Cp.y0}" fill="none" stroke="var(--grid)"/>
  <path d="${curve(Tf, Cp)}" fill="none" stroke="var(--c1)" stroke-width="2">
    <animate attributeName="stroke-dasharray" values="0 400;400 0" dur="3.5s" repeatCount="indefinite"/>
  </path>
  <text x="108" y="78" font-size="13" fill="var(--muted)">→</text>
  <text x="206" y="78" font-size="13" fill="var(--muted)">→</text>
  <text x="160" y="136" font-size="9.5" text-anchor="middle" fill="var(--fg)">(Tf)(x) = ∫₀¹ K(x, y) f(y) dy</text>
  <text x="160" y="152" font-size="8.5" text-anchor="middle" fill="var(--muted)">a continuous version of "matrix × vector": K is the matrix, the integral is the sum</text>
  <text x="160" y="168" font-size="8.5" text-anchor="middle" fill="var(--muted)">sharp edges come out rounded — the narrow spike is flattened most</text>
  <text x="160" y="184" font-size="8.5" text-anchor="middle" fill="var(--c4)">smoothing like this is exactly what makes T compact</text>
</svg>`;

export default {
  cards: [
    {
      kind: 'explain',
      title: 'Matrices, grown up',
      body: String.raw`In finite dimensions a linear map is a matrix, and every matrix is continuous. In infinite dimensions linearity alone is not enough: a linear map can send tiny inputs to enormous outputs. The maps that behave are called **bounded**, and they are the subject of this lesson.

A **linear operator** $T : X \to Y$ between normed spaces satisfies $T(\alpha x + \beta z) = \alpha Tx + \beta Tz$. Examples to keep in sight:

- **multiplication**: $(Mf)(x) = x\,f(x)$ on $L^2(0,1)$;
- **shift**: $R(x_1, x_2, \dots) = (0, x_1, x_2, \dots)$ on $\ell^2$;
- **integration**: $(Vf)(x) = \int_0^x f$;
- **differentiation**: $Df = f'$;
- **integral operators**: $(Tf)(x) = \int K(x,y) f(y)\,dy$.`,
    },
    {
      kind: 'explain',
      title: 'Bounded = continuous, and the operator norm',
      body: String.raw`$T$ is **bounded** if there is a constant $C$ with $\|Tx\|_Y \le C\,\|x\|_X$ for all $x$. The smallest such $C$ is the **operator norm**:
$$\|T\| \;=\; \sup_{x \ne 0} \frac{\|Tx\|_Y}{\|x\|_X} \;=\; \sup_{\|x\|_X \le 1} \|Tx\|_Y .$$
Read it as: *the worst stretch $T$ applies to any vector*.

> For a **linear** map, bounded $\iff$ continuous $\iff$ continuous at the single point $0$.

That equivalence is special to linear maps, and it is why "bounded operator" and "continuous operator" are used interchangeably. Note the clash of vocabulary: a bounded *operator* is not a bounded *function* — $\|Tx\|$ grows without limit as $\|x\|$ does. It is the *ratio* that is bounded.`,
    },
    {
      kind: 'order',
      prompt: String.raw`Arrange the proof that a linear $T : X \to Y$ continuous at $0$ is bounded.`,
      steps: [
        String.raw`Continuity at $0$ with $\varepsilon = 1$: there is $\delta > 0$ such that $\|z\| \le \delta \Rightarrow \|Tz\| \le 1$.`,
        String.raw`Take any $x \ne 0$ and rescale: $z = \dfrac{\delta}{\|x\|}\,x$ has $\|z\| = \delta$, so $\|Tz\| \le 1$.`,
        String.raw`By linearity $Tz = \dfrac{\delta}{\|x\|}Tx$, hence $\dfrac{\delta}{\|x\|}\|Tx\| \le 1$.`,
        String.raw`Rearranged: $\|Tx\| \le \dfrac{1}{\delta}\|x\|$ for every $x$, so $T$ is bounded with $\|T\| \le 1/\delta$.`,
        String.raw`Conversely a bounded $T$ obeys $\|Tx - Tz\| = \|T(x-z)\| \le \|T\|\,\|x - z\|$: it is Lipschitz, so continuous everywhere.`,
      ],
      why: String.raw`The whole trick is step 2: linearity lets you rescale any vector into the small ball where continuity gives you control, then scale the conclusion back out. Nothing like this works for nonlinear maps, which is why they can be continuous without any global bound.`,
    },
    {
      kind: 'widget',
      title: 'The operator norm is the biggest stretch',
      body: String.raw`In finite dimensions you can see $\|T\|$. A $2\times2$ matrix $A$ maps the unit circle to an ellipse, and the Euclidean operator norm $\|A\|_2$ is the **longest semi-axis** — that is, the largest singular value $\sigma_1$ from the [SVD](@math/diagonalization-svd). The smallest semi-axis $\sigma_2$ is the least stretch, and $\sigma_1/\sigma_2$ is the condition number.

Infinite-dimensional operators have the same picture in spirit: $\|T\|$ is how far $T$ can push the unit ball.`,
      widget: { type: 'MathSVD', props: { a: 2, b: 1, c: 0, d: 1 } },
    },
    {
      kind: 'numeric',
      prompt: String.raw`On $\mathbb{R}^2$ with the Euclidean norm, what is the operator norm of $A = \begin{pmatrix} 3 & 0 \\ 0 & -4\end{pmatrix}$?`,
      answer: 4,
      why: String.raw`$\|Ax\|^2 = 9x_1^2 + 16x_2^2 \le 16\|x\|^2$, with equality at $x = (0,1)$, so $\|A\| = 4$ — the largest singular value, $|{-4}|$. It is not $|3| + |-4| = 7$ (stretches along orthogonal axes do not add: the worst case is the single biggest one), and not $\det A = -12$ (a determinant measures area scaling, not the largest stretch).`,
    },
    {
      kind: 'explain',
      title: 'The space of operators',
      body: String.raw`Write $B(X, Y)$ for all bounded linear operators $X \to Y$, and $B(X) = B(X,X)$. With the operator norm it is itself a normed space, and:

- if $Y$ is a **Banach** space, so is $B(X,Y)$ — regardless of $X$;
- the norm is **submultiplicative**: $\|ST\| \le \|S\|\,\|T\|$, and $\|I\| = 1$.

So $B(X)$ is a *Banach algebra*: you can add, compose and take limits of operators. That is the setting in which $\sum_n T^n$ and $e^{T} = \sum_n T^n/n!$ make sense, which is how [matrix exponentials](@math/matrix-exponential) and semigroup solutions of evolution PDEs are built.`,
    },
    {
      kind: 'truefalse',
      prompt: String.raw`Differentiation $D f = f'$, from $C^1[0,1]$ into $C[0,1]$ with the sup norm on both, is a bounded operator.`,
      answer: false,
      why: String.raw`Take $f_n(x) = \sin(nx)$. Then $\|f_n\|_\infty = 1$ but $\|f_n'\|_\infty = n \to \infty$, so no constant $C$ works. Differentiation amplifies fine wiggles without limit — which is exactly why numerical differentiation of noisy data is unstable, and why PDE theory needs spaces like $H^k$ that build the derivative into the norm.`,
    },
    {
      kind: 'widget',
      title: 'Integral operators: continuous matrices',
      body: String.raw`The richest source of bounded operators on $L^2$ is a **kernel** $K(x,y)$:
$$(Tf)(x) = \int_0^1 K(x,y)\,f(y)\,dy .$$
Compare with $(Av)_i = \sum_j A_{ij} v_j$: the row index $i$ becomes $x$, the column index $j$ becomes $y$, the sum becomes an integral. If $K \in L^2([0,1]^2)$ then $T$ is bounded, with the **Hilbert–Schmidt bound**
$$\|T\| \;\le\; \Big(\iint |K(x,y)|^2\,dx\,dy\Big)^{1/2}.$$
Such operators are the solution formulas of linear PDEs: [Green's functions](@math/greens-functions) are precisely kernels of this kind.`,
      widget: { type: 'SvgDiagram', props: { svg: kernelSvg } },
    },
    {
      kind: 'numeric',
      prompt: String.raw`Let $(Tf)(x) = \int_0^1 xy\,f(y)\,dy$ on $L^2(0,1)$. Its Hilbert–Schmidt bound is $\big(\int_0^1\!\!\int_0^1 x^2y^2\,dx\,dy\big)^{1/2}$. Compute it, to 4 decimal places.`,
      answer: 0.3333,
      tolerance: 0.002,
      why: String.raw`The double integral factors: $\big(\int_0^1 x^2dx\big)\big(\int_0^1 y^2 dy\big) = \tfrac13\cdot\tfrac13 = \tfrac19$, so the bound is $1/3$. Here it is exact: $T$ has rank one, $Tf = \langle f, y\rangle\,x$, so $\|T\| = \|x\|_2\|y\|_2 = \tfrac{1}{\sqrt3}\cdot\tfrac{1}{\sqrt3} = \tfrac13$. For a general kernel the Hilbert–Schmidt quantity is only an upper bound.`,
    },
    {
      kind: 'explain',
      title: 'Dual spaces',
      body: String.raw`The special case $Y = \mathbb{R}$ (or $\mathbb{C}$) deserves its own name: $X^* = B(X, \mathbb{R})$ is the **dual space**, whose elements are bounded linear **functionals**. $X^*$ is always a Banach space, even when $X$ is not.

- $(\ell^p)^* \cong \ell^q$ and $(L^p)^* \cong L^q$ for $1 \le p < \infty$, with $\tfrac1p + \tfrac1q = 1$, the pairing being $\sum x_i y_i$ or $\int fg$. ($(\ell^\infty)^*$ is strictly bigger than $\ell^1$.)
- For a Hilbert space, [Riesz representation](@math/hilbert-spaces) gives $H^* \cong H$.
- **Hahn–Banach** guarantees the dual is rich: any bounded functional on a subspace extends to all of $X$ with the *same* norm. Consequence: for every $x \ne 0$ there is $\varphi \in X^*$ with $\|\varphi\| = 1$ and $\varphi(x) = \|x\|$, so functionals separate points.

Duals are how "weak" notions are defined — $x_n \rightharpoonup x$ **weakly** when $\varphi(x_n) \to \varphi(x)$ for every $\varphi \in X^*$. Weak convergence is genuinely weaker: in $\ell^2$ the basis vectors satisfy $e_n \rightharpoonup 0$ while $\|e_n\| = 1$ for all $n$.`,
    },
    {
      kind: 'mcq',
      prompt: String.raw`Which functional on $L^2(0,1)$ is **not** bounded?`,
      choices: [
        String.raw`$\varphi(f) = f(1/2)$`,
        String.raw`$\varphi(f) = \int_0^1 f(x)\,dx$`,
        String.raw`$\varphi(f) = \int_0^1 x f(x)\,dx$`,
        String.raw`$\varphi(f) = \int_0^{1/2} f(x)\,dx$`,
      ],
      answer: 0,
      why: String.raw`The three integral functionals are $\langle f, g\rangle$ with $g = 1$, $g = x$ and $g = \mathbf{1}_{[0,1/2]}$, all in $L^2$, so Cauchy–Schwarz bounds them (by $1$, $1/\sqrt3$ and $1/\sqrt2$). Point evaluation is not bounded — indeed not even well defined, since elements of $L^2$ are classes of functions agreeing almost everywhere and you may change $f(1/2)$ freely. (Making point evaluation bounded is one thing [Sobolev spaces](@math/sobolev-spaces) achieve.)`,
    },
    {
      kind: 'explain',
      title: 'Compact operators',
      body: String.raw`Among bounded operators, one class behaves almost like finite matrices.

**Definition.** $T$ is **compact** if the image $T(B)$ of the unit ball has compact closure: every bounded sequence $(x_n)$ has a subsequence with $(Tx_{n_k})$ **convergent**.

Intuitively, a compact operator *squashes* infinite dimensions: it damps high-frequency content so hard that the image is effectively finite-dimensional.

- Every bounded finite-rank operator is compact, and an operator-norm limit of finite-rank operators is compact. On a Hilbert space the converse also holds.
- Integral operators with $K \in L^2$ (Hilbert–Schmidt) are compact; so is $(Vf)(x) = \int_0^x f$.
- A diagonal operator $x \mapsto (\lambda_n x_n)$ on $\ell^2$ is compact **iff** $\lambda_n \to 0$.
- The identity on an infinite-dimensional space is **never** compact (Riesz's theorem again).

Compactness is the hypothesis that makes the spectral theorem and the Fredholm alternative work — the next lesson.`,
    },
    {
      kind: 'multi',
      prompt: 'Which operators are compact?',
      choices: [
        String.raw`The identity $I$ on $\ell^2$`,
        String.raw`$x \mapsto (x_1, x_2/2, x_3/3, \dots)$ on $\ell^2$`,
        String.raw`$(Tf)(x) = \int_0^1 e^{xy} f(y)\,dy$ on $L^2(0,1)$`,
        String.raw`The right shift $R(x_1,x_2,\dots) = (0,x_1,x_2,\dots)$ on $\ell^2$`,
        String.raw`Any bounded operator whose range is $2$-dimensional`,
      ],
      answers: [1, 2, 4],
      why: String.raw`Diagonal entries $1/n \to 0$ give compactness; $e^{xy}$ is continuous on $[0,1]^2$ hence in $L^2$, so that integral operator is Hilbert–Schmidt and compact; and a bounded operator of finite rank is always compact. The identity on an infinite-dimensional space is not, because $\|e_n - e_m\| = \sqrt2$ leaves no convergent subsequence — and the right shift fails for the same reason, since it is an isometry and preserves those gaps.`,
    },
    {
      kind: 'match',
      prompt: 'Match each operator to its norm.',
      pairs: [
        [String.raw`$(Mf)(x) = x f(x)$ on $L^2(0,1)$`, String.raw`$1$`],
        [String.raw`right shift on $\ell^2$`, String.raw`$1$ (an isometry)`],
        [String.raw`$x \mapsto (\lambda_n x_n)$ on $\ell^2$`, String.raw`$\sup_n |\lambda_n|$`],
        [String.raw`$A = \operatorname{diag}(3, -4)$ on $\mathbb{R}^2$`, String.raw`$4$`],
        [String.raw`$\varphi(f) = \int_0^1 f$ on $L^2(0,1)$`, String.raw`$\|1\|_{L^2} = 1$`],
      ],
      why: String.raw`In each case the norm is the largest factor by which the object can stretch a unit vector: the essential supremum of the multiplier, the supremum of the diagonal entries, the top singular value, or — by Riesz — the length of the representing function.`,
    },
    {
      kind: 'explain',
      title: 'Why this matters for machine learning',
      body: String.raw`A numerical PDE solver is a map from *input function* (a coefficient field, an initial condition, a forcing) to *output function* (the solution). That is an operator, often a nonlinear one, between infinite-dimensional spaces.

[Operator learning](@math/operator-learning-intro) trains a neural network to approximate such a map directly, instead of discretising and solving each time. The language of this lesson is what makes the idea precise: the "layers" of a [neural operator](@ml/neural-operators) are built from kernel integral operators $f \mapsto \int K(x,y) f(y)\,dy$ (typically added to a local linear term) followed by a pointwise nonlinearity, chosen so that the network acts on *functions* rather than on a fixed grid. Boundedness is what keeps the composition stable; the smoothing effect you saw in the kernel widget is why the learned map can be approximated at modest resolution.`,
    },
    {
      kind: 'fill',
      prompt: String.raw`For linear maps, bounded is the same as ___. The operator norm is the ___ stretch applied to a unit vector, and it is ___ : $\|ST\| \le \|S\|\|T\|$. An operator that maps the unit ball into a set with compact closure is called ___.`,
      bank: ['continuous', 'largest', 'submultiplicative', 'compact', 'smallest', 'additive', 'closed', 'dense'],
      answer: ['continuous', 'largest', 'submultiplicative', 'compact'],
      why: String.raw`Linearity turns a local condition (continuity at $0$) into a global one (a uniform bound). The supremum definition makes the norm the largest stretch, submultiplicativity follows by applying the bound twice, and compactness is the "effectively finite-dimensional" condition.`,
    },
    {
      kind: 'explain',
      title: 'Key takeaways',
      body: String.raw`- A linear operator is **bounded** iff $\|Tx\| \le C\|x\|$, iff it is **continuous**. The least such $C$ is the **operator norm** $\|T\| = \sup_{\|x\|\le1}\|Tx\|$.
- $B(X,Y)$ is Banach whenever $Y$ is, and the norm is submultiplicative — so power series in operators make sense.
- Differentiation is unbounded; multiplication, shifts and integral operators with $L^2$ kernels are bounded. Kernels are the continuous analogue of matrices.
- The **dual** $X^* = B(X,\mathbb{R})$ is $\ell^q$ for $\ell^p$, and $H$ itself for a Hilbert space; **Hahn–Banach** keeps it rich.
- **Compact** operators squash the unit ball into a relatively compact set. They are the limits of finite-rank operators and the ones with a clean spectral theory — [coming next](@math/operators-spectral).`,
    },
  ],
  references: [
    { authors: 'E. Kreyszig', title: 'Introductory Functional Analysis with Applications', year: 1978, venue: 'Wiley', detail: 'Ch. 2, §2.6–2.10 (linear operators, boundedness and continuity, the operator norm, functionals, the dual space); Ch. 8, §8.1 (compact linear operators)' },
    { authors: 'H. Brezis', title: 'Functional Analysis, Sobolev Spaces and Partial Differential Equations', year: 2011, venue: 'Springer Universitext', detail: 'Ch. 1 (Hahn–Banach theorems and the dual space); Ch. 3 (weak topologies); Ch. 6, §6.1 (compact operators)' },
    { authors: 'M. Reed, B. Simon', title: 'Methods of Modern Mathematical Physics I: Functional Analysis', year: 1980, venue: 'Revised ed., Academic Press', detail: 'Ch. VI (bounded operators: the operator norm, adjoints, compact operators §VI.5, Hilbert–Schmidt and trace-class operators §VI.6)' },
    { authors: 'W. Rudin', title: 'Functional Analysis', year: 1991, venue: '2nd ed., McGraw-Hill', detail: 'Ch. 4 (duality in Banach spaces, adjoints, compact operators); Ch. 12 (bounded operators on a Hilbert space)' },
  ],
} satisfies LessonContent;
