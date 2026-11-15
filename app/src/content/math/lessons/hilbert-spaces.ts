import type { LessonContent } from '../../types';

export default {
  cards: [
    {
      kind: 'explain',
      title: 'Banach spaces with angles',
      body: String.raw`A [norm](@math/normed-banach-spaces) measures length. An **inner product** measures length *and* angle, and that single extra structure is what makes infinite-dimensional geometry behave almost like $\mathbb{R}^n$: projections, orthonormal bases, Pythagoras, least squares.

**Definition.** A **Hilbert space** is a vector space $H$ with an inner product $\langle \cdot, \cdot \rangle$ that is **complete** in the induced norm $\|x\| = \sqrt{\langle x, x\rangle}$.

Equivalently: a Banach space whose norm happens to come from an inner product. Hilbert spaces are the spaces of quantum mechanics, of signal processing, of least squares, and of the weak formulations of PDEs you will meet later in this unit.`,
    },
    {
      kind: 'recall',
      title: 'Inner products, from linear algebra',
      points: [
        String.raw`$\langle u, v\rangle$ is linear in each slot, symmetric ($\langle u,v\rangle = \overline{\langle v,u\rangle}$ for complex scalars) and positive: $\langle v, v\rangle > 0$ for $v \ne 0$.`,
        String.raw`$\|v\| = \sqrt{\langle v,v\rangle}$, and **Cauchy–Schwarz**: $|\langle u,v\rangle| \le \|u\|\,\|v\|$.`,
        String.raw`$u \perp v$ means $\langle u,v\rangle = 0$; then $\|u+v\|^2 = \|u\|^2 + \|v\|^2$ (Pythagoras).`,
        String.raw`Coordinates in an orthonormal basis are just inner products: $v = \sum_i \langle v, q_i\rangle\, q_i$.`,
      ],
      link: 'math/inner-products-orthogonality',
    },
    {
      kind: 'explain',
      title: 'The two examples to keep in mind',
      body: String.raw`**$\ell^2$** — square-summable sequences $x = (x_1, x_2, \dots)$ with $\sum_i |x_i|^2 < \infty$, under
$$\langle x, y\rangle = \sum_{i=1}^{\infty} x_i \overline{y_i}.$$

**$L^2(\Omega)$** — square-integrable functions on a region $\Omega$, under
$$\langle f, g\rangle = \int_\Omega f\,\overline{g}\,.$$

Both are complete (Riesz–Fischer), so both are Hilbert spaces. $L^2$ is the only $L^p$ that is: the $p = 2$ case is special precisely because $\sum |x_i|^p$ is a *quadratic* form only when $p = 2$. And "square-integrable" is not an arbitrary choice — in physics $\int |f|^2$ is an energy, and in statistics it is a variance.`,
    },
    {
      kind: 'mcq',
      prompt: String.raw`A norm comes from an inner product **iff** it obeys the parallelogram law $\|x+y\|^2 + \|x-y\|^2 = 2\|x\|^2 + 2\|y\|^2$ (Jordan–von Neumann). Test $x = (1,0)$, $y = (0,1)$ in $\mathbb{R}^2$ with the max norm $\|\cdot\|_\infty$. What do you find?`,
      choices: [
        String.raw`Left side $2$, right side $4$ — so $\|\cdot\|_\infty$ is not from an inner product.`,
        String.raw`Left side $4$, right side $4$ — so $\|\cdot\|_\infty$ is from an inner product.`,
        String.raw`Left side $8$, right side $4$ — the law fails the other way.`,
        String.raw`The law cannot be tested on two vectors; it is a statement about every pair at once.`,
      ],
      answer: 0,
      why: String.raw`$x + y = (1,1)$ and $x - y = (1,-1)$ both have max norm $1$, so the left side is $1 + 1 = 2$, while $2\|x\|_\infty^2 + 2\|y\|_\infty^2 = 2 + 2 = 4$. One failing pair is enough to disqualify a norm, which is why $\ell^\infty$, $\ell^1$ and $C[0,1]$ with the sup norm are Banach but not Hilbert. (With the Euclidean norm both sides would be $4$.)`,
    },
    {
      kind: 'explain',
      title: 'The projection theorem',
      body: String.raw`This is the theorem that does the work.

> **Projection theorem.** Let $M$ be a **closed** subspace of a Hilbert space $H$ and let $x \in H$. Then there is a unique $m \in M$ closest to $x$, it is characterised by $x - m \perp M$, and $H = M \oplus M^{\perp}$: every $x$ splits uniquely as $x = m + m^{\perp}$.

Two things to notice. *Closed* is essential: the polynomials inside $L^2[0,1]$ are a subspace with no nearest point to a general $f$, because the infimum is approached but never attained inside the set. And completeness is essential: the minimising sequence is Cauchy, and you need its limit to exist in $H$.

The characterisation "the error is orthogonal to the subspace" is the same normal-equations idea as least squares, now in infinitely many dimensions.`,
    },
    {
      kind: 'widget',
      title: 'Best approximation in $L^2$',
      body: String.raw`Here $H = L^2(0,1)$, the subspace is $M_N = \operatorname{span}\{e_1, \dots, e_N\}$ with $e_k(x) = \sqrt2 \sin(k\pi x)$ (an orthonormal set), and the projection is $P_N f = \sum_{k \le N} \langle f, e_k\rangle e_k$.

Drag the **detune** slider to change the first coefficient away from $\langle f, e_1\rangle$. Two readouts move together: the error $\|f - g\|$ grows, and the residual stops being orthogonal to the subspace. That is the projection theorem in action — minimal error and orthogonal residual are the *same* condition.`,
      widget: { type: 'MathL2Projection', props: { target: 'step', n: 3 }, caption: String.raw`Switch the target to **parabola** (smooth, zero at both ends) and watch how few modes it needs compared with the **step**.` },
    },
    {
      kind: 'numeric',
      prompt: String.raw`In $L^2(-1,1)$, what is the best approximation of $f(x) = x^2$ by a **constant** function? (Give the value of that constant.)`,
      answer: 0.3333,
      tolerance: 0.002,
      why: String.raw`The subspace is spanned by $\mathbf{1}$, so the projection is $\frac{\langle f, \mathbf{1}\rangle}{\langle \mathbf{1},\mathbf{1}\rangle} = \frac{\int_{-1}^{1} x^2 dx}{\int_{-1}^{1} 1\,dx} = \frac{2/3}{2} = \tfrac13$ — the **average** of $f$. Not $f$'s midrange value $1/2$, and not its value at the midpoint $0$: the $L^2$-best constant is always the mean.`,
    },
    {
      kind: 'explain',
      title: 'Orthonormal bases, Bessel and Parseval',
      body: String.raw`Let $\{e_k\}_{k\ge1}$ be an **orthonormal** set: $\langle e_j, e_k\rangle = \delta_{jk}$. Write $c_k = \langle x, e_k\rangle$ for the coefficients.

- **Bessel's inequality:** $\sum_k |c_k|^2 \le \|x\|^2$, always. (It says the projection is never longer than the original.)
- The set is an **orthonormal basis** if it is *maximal* — no nonzero vector is orthogonal to all of them. Equivalently, the set of finite linear combinations is dense in $H$.
- For an orthonormal basis, Bessel becomes an equality, **Parseval's identity**: $\ \|x\|^2 = \sum_k |c_k|^2$, and $x = \sum_k c_k e_k$ with the series converging **in norm**.

"Basis" here is not the linear-algebra kind: we allow infinite sums, not just finite ones. A Hilbert space is **separable** when it has a countable orthonormal basis; every separable infinite-dimensional Hilbert space is isomorphic to $\ell^2$ via $x \mapsto (c_1, c_2, \dots)$. So in a real sense there is only *one* such space, seen in different costumes.`,
    },
    {
      kind: 'explain',
      title: 'Fourier series, re-read',
      body: String.raw`The functions
$$\frac{1}{\sqrt{2\pi}},\quad \frac{\cos nx}{\sqrt{\pi}},\quad \frac{\sin nx}{\sqrt{\pi}} \qquad (n \ge 1)$$
form an orthonormal **basis** of $L^2(-\pi, \pi)$. So [Fourier series](@math/fourier-series) is not a separate theory at all — it is the coordinate expansion $x = \sum_k \langle x, e_k\rangle e_k$ in one particular basis, and Parseval is the statement that total energy equals the sum of the energies of the harmonics.

This re-reading tells you exactly what convergence you get for free: $\|f - S_N\|_2 \to 0$ for **every** $f \in L^2$, no smoothness required. Pointwise or uniform convergence is a strictly harder question, and the answer depends on $f$.`,
    },
    {
      kind: 'numeric',
      prompt: String.raw`Apply Parseval to the square wave $f = \operatorname{sign}(\sin x)$ on $(-\pi, \pi)$, whose only nonzero coefficients are $\langle f, \sin(nx)/\sqrt\pi\rangle = 4/(n\sqrt\pi)$ for odd $n$. Since $\|f\|_2^2 = 2\pi$, Parseval gives $\sum_{n \text{ odd}} 1/n^2 = ?$ Give 4 decimal places.`,
      answer: 1.2337,
      tolerance: 0.003,
      why: String.raw`Parseval: $2\pi = \sum_{n\text{ odd}} \big(4/(n\sqrt\pi)\big)^2 = \frac{16}{\pi}\sum_{n\text{ odd}} \frac{1}{n^2}$, so $\sum_{n\text{ odd}} n^{-2} = \frac{2\pi^2}{16} = \frac{\pi^2}{8} \approx 1.2337$. (Subtracting the even terms $\tfrac14\sum n^{-2}$ then recovers Euler's $\sum_{n\ge1} n^{-2} = \pi^2/6$.)`,
    },
    {
      kind: 'widget',
      title: 'Norm convergence is not pointwise convergence',
      body: String.raw`"$\|f - S_N\|_2 \to 0$" is a statement about a *total* error, an integral. It says nothing about any individual point.

- **Fourier sums** of a square wave: the $L^2$ error shrinks to $0$, yet the overshoot beside the jump never does (the Gibbs phenomenon, about $9\%$ of the jump), so $\sup|f - S_N|$ stays bounded away from $0$; and at the jump itself $S_N = 0 \ne \pm1$ for every $N$.
- **Typewriter sequence**: a bump of width $1/m$ marching across $(0,1)$, then a narrower one, and so on. $\|g_k\|_2 = 1/\sqrt{m} \to 0$, yet at *every* point $x$ the values are $1$ infinitely often — there is no pointwise limit anywhere.`,
      widget: { type: 'MathNormVsPointwise', props: { mode: 'fourier', k: 4 }, caption: String.raw`Move the probe $x_0$ and watch the right-hand panel: in **typewriter** mode it never settles, however far you push $k$.` },
    },
    {
      kind: 'truefalse',
      prompt: String.raw`If $f_n \to f$ in $L^2(0,1)$, then $f_n(x) \to f(x)$ for every $x$.`,
      answer: false,
      why: String.raw`The typewriter sequence converges to $0$ in $L^2$ but at no point at all. What *is* true is weaker: some **subsequence** converges almost everywhere. Conversely, pointwise convergence does not give $L^2$ convergence either — a spike of height $n$ and width $1/n^2$ tends to $0$ at every point $x \ne 0$ while $\|f_n\|_2 = 1$.`,
    },
    {
      kind: 'explain',
      title: 'Riesz representation: every functional is an inner product',
      body: String.raw`A **bounded linear functional** is a linear map $\varphi : H \to \mathbb{R}$ (or $\mathbb{C}$) with $|\varphi(x)| \le C\|x\|$. One obvious way to build one is to fix $y \in H$ and set $\varphi(x) = \langle x, y\rangle$; Cauchy–Schwarz shows it is bounded with $\|\varphi\| \le \|y\|$.

> **Riesz representation theorem.** On a Hilbert space, *every* bounded linear functional is of that form: there is a unique $y \in H$ with $\varphi(x) = \langle x, y\rangle$ for all $x$, and $\|\varphi\| = \|y\|$.

So $H$ is its own dual, $H^* \cong H$ — a luxury Banach spaces do not have. The proof is the projection theorem in disguise: if $\varphi \ne 0$, then $\ker\varphi$ is a closed subspace of codimension $1$, and $y$ is built from a unit vector in $(\ker\varphi)^{\perp}$.

This one theorem is the engine of the [Lax–Milgram theorem](@math/weak-solutions), which is how existence of solutions to elliptic PDEs is proved.`,
    },
    {
      kind: 'mcq',
      prompt: String.raw`Which statement about $H = L^2(0,1)$ follows from the Riesz representation theorem?`,
      choices: [
        String.raw`Every bounded linear $\varphi : H \to \mathbb{R}$ is $\varphi(f) = \int_0^1 f g$ for exactly one $g \in L^2(0,1)$.`,
        String.raw`Every linear $\varphi : H \to \mathbb{R}$, bounded or not, is $\varphi(f) = \int_0^1 fg$ for some $g$.`,
        String.raw`Evaluation at a point, $\varphi(f) = f(1/2)$, is a bounded functional on $H$.`,
        String.raw`$H$ has a countable orthonormal basis.`,
      ],
      answer: 0,
      why: String.raw`Riesz is exactly the "bounded functional = inner product with a unique vector" statement, and on $L^2$ the inner product is $\int fg$. Dropping boundedness is false — using the axiom of choice one can build unbounded linear functionals. Point evaluation is not even well defined on $L^2$, whose elements are equivalence classes agreeing almost everywhere, let alone bounded. Separability of $L^2(0,1)$ is true but is a different theorem.`,
    },
    {
      kind: 'multi',
      prompt: 'Which of these are Hilbert spaces with their usual norms?',
      choices: [
        String.raw`$\ell^2$`,
        String.raw`$L^2(\mathbb{R})$`,
        String.raw`$\ell^1$`,
        String.raw`$C[0,1]$ with $\|f\|_\infty$`,
        String.raw`$\mathbb{R}^n$ with the Euclidean norm`,
      ],
      answers: [0, 1, 4],
      why: String.raw`$\ell^2$, $L^2$ and Euclidean $\mathbb{R}^n$ all have norms built from a sum or integral of squares, and all are complete. $\ell^1$ and the sup norm on $C[0,1]$ are complete but fail the parallelogram law, so no inner product can produce them — they are Banach only.`,
    },
    {
      kind: 'match',
      prompt: 'Match each Hilbert-space statement to its name.',
      pairs: [
        [String.raw`$|\langle x,y\rangle| \le \|x\|\|y\|$`, 'Cauchy–Schwarz'],
        [String.raw`$\sum_k |\langle x, e_k\rangle|^2 \le \|x\|^2$ for any orthonormal set`, 'Bessel’s inequality'],
        [String.raw`$\|x\|^2 = \sum_k |\langle x, e_k\rangle|^2$ for an orthonormal **basis**`, 'Parseval’s identity'],
        [String.raw`$H = M \oplus M^\perp$ for closed $M$`, 'projection theorem'],
        [String.raw`every bounded $\varphi$ is $\langle \cdot, y\rangle$ for a unique $y$`, 'Riesz representation'],
      ],
      why: String.raw`Bessel holds for *any* orthonormal set; it upgrades to Parseval exactly when the set is maximal, i.e. a basis. The projection theorem is what makes "closest point" meaningful, and Riesz identifies $H$ with its dual.`,
    },
    {
      kind: 'fill',
      prompt: String.raw`In a Hilbert space the error of the best approximation from a closed subspace $M$ is ___ to $M$. An orthonormal set is a basis when it is ___, and then ___ 's identity holds. Convergence of $\sum c_k e_k$ is in ___, not necessarily pointwise.`,
      bank: ['orthogonal', 'maximal', 'Parseval', 'norm', 'parallel', 'Bessel', 'finite', 'measure'],
      answer: ['orthogonal', 'maximal', 'Parseval', 'norm'],
      why: String.raw`Orthogonality of the residual *is* optimality; maximality is what turns Bessel's inequality into Parseval's equality; and the expansion converges in the $L^2$ norm, which — as the typewriter sequence shows — permits very bad pointwise behaviour.`,
    },
    {
      kind: 'explain',
      title: 'Key takeaways',
      body: String.raw`- A **Hilbert space** is a complete inner-product space: $\ell^2$, $L^2(\Omega)$, $\mathbb{R}^n$. A norm is of this type exactly when it obeys the parallelogram law.
- **Projection theorem:** a closed subspace has a unique nearest point, characterised by an orthogonal residual, and $H = M \oplus M^{\perp}$.
- An **orthonormal basis** is a maximal orthonormal set; coefficients are inner products, Bessel becomes **Parseval**, and every separable Hilbert space is $\ell^2$ in disguise.
- [Fourier series](@math/fourier-series) is just the expansion in one such basis: it always converges **in norm**, which says nothing pointwise.
- **Riesz representation:** every bounded linear functional is $\langle\cdot, y\rangle$. $H^\ast \cong H$.

Next: the maps *between* these spaces — [bounded linear operators](@math/bounded-operators) — and, after that, learning such maps with neural networks in [neural operators](@ml/neural-operators).`,
    },
  ],
  references: [
    { authors: 'E. Kreyszig', title: 'Introductory Functional Analysis with Applications', year: 1978, venue: 'Wiley', detail: 'Ch. 3 (inner product spaces and Hilbert spaces: projection theorem §3.3, orthonormal sets and Bessel §3.4–3.5, total sets, Riesz representation §3.8)' },
    { authors: 'H. Brezis', title: 'Functional Analysis, Sobolev Spaces and Partial Differential Equations', year: 2011, venue: 'Springer Universitext', detail: 'Ch. 5 (Hilbert spaces: projection on a closed convex set, Riesz–Fréchet representation, Hilbert bases)' },
    { authors: 'M. Reed, B. Simon', title: 'Methods of Modern Mathematical Physics I: Functional Analysis', year: 1980, venue: 'Revised ed., Academic Press', detail: 'Ch. II (Hilbert spaces: the Riesz lemma, orthonormal bases, separability, L² and ℓ²)' },
    { authors: 'W. Rudin', title: 'Real and Complex Analysis', year: 1987, venue: '3rd ed., McGraw-Hill', detail: 'Ch. 4 (elementary Hilbert space theory: orthogonality, Fourier series as an orthonormal expansion, Riesz–Fischer and Parseval)' },
  ],
} satisfies LessonContent;
