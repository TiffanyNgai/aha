import type { LessonContent } from '../../types';

export default {
  cards: [
    {
      kind: 'explain',
      title: 'One tiny step, repeated for ever',
      body: String.raw`Compound interest: grow by $a/N$ per period, $N$ periods, and as $N \to \infty$ you get $(1 + a/N)^N \to e^{a}$. The same limit works for matrices:
$$e^{A} \;=\; \lim_{N\to\infty}\Big(I + \tfrac{A}{N}\Big)^{N}.$$

That is exactly the move we need. A Lie group's elements sit on a curved manifold; its "infinitesimal motions" live in a flat vector space at the identity. The **matrix exponential** is the bridge: hand it an infinitesimal motion $X$, and it repeats that motion infinitely finely to give you a finite group element.`,
    },
    {
      kind: 'explain',
      title: 'The definition, and why it always works',
      body: String.raw`For any square matrix $A$ (real or complex),
$$\exp(A) \;=\; \sum_{k=0}^{\infty} \frac{A^{k}}{k!} \;=\; I + A + \frac{A^{2}}{2} + \frac{A^{3}}{6} + \cdots,$$
with the convention $A^{0} = I$.

This **always converges**, with no conditions at all. Using any norm with $\|AB\| \le \|A\|\,\|B\|$ (the operator norm, say), the terms obey $\|A^{k}/k!\| \le \|A\|^{k}/k!$, and $\sum \|A\|^{k}/k! = e^{\|A\|}$ is finite. An absolutely convergent series of matrices converges, so $\exp(A)$ is a perfectly well-defined matrix — entry by entry.

The familiar scalar case is $n = 1$.`,
    },
    {
      kind: 'explain',
      title: 'Worked example: the series becomes a rotation',
      body: String.raw`Take the one generator of $\mathfrak{so}(2)$, $J = \begin{pmatrix}0&-1\\1&0\end{pmatrix}$ — a $90^\circ$ turn. Watch the series fold itself into sine and cosine.`,
      widget: {
        type: 'StepReveal',
        props: {
          steps: [
            String.raw`$J^{2} = \begin{pmatrix}0&-1\\1&0\end{pmatrix}\begin{pmatrix}0&-1\\1&0\end{pmatrix} = \begin{pmatrix}-1&0\\0&-1\end{pmatrix} = -I$. So $J$ behaves exactly like the imaginary unit $i$.`,
            String.raw`Therefore the powers cycle: $J^{0}=I,\ J^{1}=J,\ J^{2}=-I,\ J^{3}=-J,\ J^{4}=I,\dots$`,
            String.raw`$\exp(\theta J) = \sum_k \dfrac{\theta^{k}J^{k}}{k!} = \Big(1 - \dfrac{\theta^{2}}{2!} + \dfrac{\theta^{4}}{4!} - \cdots\Big) I \;+\; \Big(\theta - \dfrac{\theta^{3}}{3!} + \cdots\Big) J.`,
            String.raw`Those two brackets are the Taylor series of $\cos\theta$ and $\sin\theta$:
$$\exp(\theta J) = \cos\theta\, I + \sin\theta\, J = \begin{pmatrix}\cos\theta & -\sin\theta\\ \sin\theta & \cos\theta\end{pmatrix}.$$`,
            String.raw`So the single matrix $J$ **generates** the whole rotation group $SO(2)$, and Euler's formula $e^{i\theta} = \cos\theta + i\sin\theta$ is the $1\times1$ complex version of the same calculation.`,
          ],
          notes: ['', 'Every even power is ±I, every odd power is ±J.', 'Split the sum into even k and odd k.', '', 'One real parameter θ, one matrix J: a one-parameter subgroup.'],
        },
      },
    },
    {
      kind: 'numeric',
      prompt: String.raw`A real $2\times2$ matrix $A$ has trace $2$. What is $\det \exp(A)$? (Give a decimal to 3 significant figures.)`,
      answer: 7.389,
      tolerance: 0.01,
      why: String.raw`$\det \exp(A) = e^{\operatorname{tr}A} = e^{2} \approx 7.389$. The determinant of the exponential depends only on the trace of $A$ — never on $\det A$, which is the usual wrong guess. One consequence: $\exp(A)$ is invertible for every $A$, because $e^{\operatorname{tr}A}$ is never zero.`,
    },
    {
      kind: 'explain',
      title: 'The rules of the game',
      body: String.raw`For all square matrices $A, B$ of the same size and all real $s, t$:

1. $\exp(0) = I$, and $\dfrac{d}{dt}\exp(tA) = A\exp(tA) = \exp(tA)\,A$.
2. $\exp(sA)\exp(tA) = \exp\big((s+t)A\big)$ — powers of the *same* matrix behave perfectly.
3. $\exp(A)$ is always invertible, with $\exp(A)^{-1} = \exp(-A)$.
4. $\exp(PAP^{-1}) = P\exp(A)P^{-1}$ for invertible $P$.
5. $\det\exp(A) = e^{\operatorname{tr}A}$.
6. $\exp(A^{\mathsf T}) = \exp(A)^{\mathsf T}$ and $\exp(A^{*}) = \exp(A)^{*}$.
7. **If $AB = BA$**, then $\exp(A+B) = \exp(A)\exp(B)$. Without that hypothesis this is *false* — see below.

Rules 3, 5 and 6 are already powerful: they are how we will read off the Lie algebras of $SL_n$, $O(n)$ and $U(n)$.`,
    },
    {
      kind: 'mcq',
      prompt: String.raw`$X$ is a real $3\times3$ matrix with $X^{\mathsf T} = -X$ (skew-symmetric). What can you say about $\exp(X)$?`,
      choices: [
        String.raw`It is orthogonal with determinant $1$, i.e. a rotation.`,
        String.raw`It is skew-symmetric.`,
        String.raw`It is orthogonal with determinant $-1$, i.e. a reflection.`,
        String.raw`Nothing in general — $\exp$ does not preserve any such structure.`,
      ],
      answer: 0,
      why: String.raw`Using $\exp(X^{\mathsf T}) = \exp(X)^{\mathsf T}$ and $\exp(-X) = \exp(X)^{-1}$: $\exp(X)^{\mathsf T} = \exp(X^{\mathsf T}) = \exp(-X) = \exp(X)^{-1}$, which is exactly orthogonality. And a skew-symmetric matrix has zero diagonal, so $\operatorname{tr}X = 0$ and $\det\exp(X) = e^{0} = 1$. The exponential of a skew matrix is never itself skew: every $3\times3$ skew matrix has determinant $0$, while $\exp(X)$ has determinant $1$. And that same $+1$ puts reflections out of reach.`,
    },
    {
      kind: 'widget',
      title: 'exp(tX): one matrix, a whole flow',
      body: String.raw`Fix $X$ and let $t$ run: the curve $t \mapsto \exp(tX)$ sweeps out a one-parameter subgroup, and each point of the plane slides along the orbit $\{\exp(tX)\mathbf p\}$. The thin blue curves are those orbits — the integral curves of the vector field $\mathbf v(\mathbf p) = X\mathbf p$.

Try all five generators and watch the readout $\det\exp(tX) = e^{t\,\operatorname{tr}X}$:

- **rotation** $X = \begin{pmatrix}0&-1\\1&0\end{pmatrix}$: circles, $\det = 1$ always.
- **boost** $X = \begin{pmatrix}1&0\\0&-1\end{pmatrix}$: hyperbolas, still $\det = 1$ because $\operatorname{tr}X = 0$.
- **shear** $X = \begin{pmatrix}0&1\\0&0\end{pmatrix}$: here $X^{2} = 0$, so the series stops: $\exp(tX) = I + tX$ exactly.
- **scale** $X = I$: $\exp(tI) = e^{t}I$, and areas grow like $e^{2t}$.
- **spiral** $X = \begin{pmatrix}0.3&-1\\1&0.3\end{pmatrix}$: rotation plus dilation, so the orbits spiral outward and $\det = e^{0.6t}$.`,
      widget: { type: 'MathOneParamFlow', props: { gen: 'boost', tMax: 2 } },
    },
    {
      kind: 'explain',
      title: 'One-parameter subgroups — and why exp solves x′ = Ax',
      body: String.raw`A **one-parameter subgroup** of $GL_n$ is a continuous map $\gamma : \mathbb{R} \to GL_n$ with
$$\gamma(0) = I, \qquad \gamma(s+t) = \gamma(s)\gamma(t).$$

**Theorem.** Every one-parameter subgroup is $\gamma(t) = \exp(tX)$ for exactly one matrix $X$, namely $X = \gamma'(0)$.

So "a smooth one-dial family of transformations" and "a matrix $X$" are the same information. That single theorem is why Lie algebras exist.

It also hands you linear ODEs. Since $\frac{d}{dt}\exp(tA) = A\exp(tA)$, the function
$$\mathbf x(t) = \exp(tA)\,\mathbf x_0$$
satisfies $\mathbf x' = A\mathbf x$ with $\mathbf x(0) = \mathbf x_0$ — and by uniqueness it is *the* solution. The flow of a linear system **is** a one-parameter subgroup.`,
    },
    {
      kind: 'recall',
      title: 'Linear systems, from the ODE unit',
      points: [
        String.raw`$\mathbf x' = A\mathbf x$ has solution $\mathbf x(t) = \exp(tA)\mathbf x_0$.`,
        String.raw`If $A\mathbf v = \lambda \mathbf v$ then $\exp(tA)\mathbf v = e^{\lambda t}\mathbf v$: eigenvectors give straight-line solutions.`,
        String.raw`Real negative eigenvalues decay, positive ones grow, complex ones $\alpha \pm i\beta$ spiral with frequency $\beta$.`,
        String.raw`A repeated eigenvalue with too few eigenvectors produces the extra factor $t$ — the shear case $\exp(tN) = I + tN$.`,
      ],
      link: 'math/ode-linear-systems',
    },
    {
      kind: 'widget',
      title: 'The order matters: exp(A)exp(B) ≠ exp(A+B)',
      body: String.raw`Take the two opposite shears $A = \begin{pmatrix}0&1\\0&0\end{pmatrix}$ and $B = \begin{pmatrix}0&0\\1&0\end{pmatrix}$. Flow along $A$ then along $B$, and you do **not** land where the single flow along $A + B$ takes you — nor where flowing along $B$ then $A$ takes you. Three different answers.

Slide $s$ from 0: the three shapes separate slowly, as $s^2$, not as $s$. Press **commuting** to see the three collapse onto each other, which is the case $AB = BA$.`,
      widget: { type: 'MathBchCompare', props: { A: [0, 1, 0, 0], B: [0, 0, 1, 0], s: 1 } },
    },
    {
      kind: 'explain',
      title: 'Baker–Campbell–Hausdorff, to first order',
      body: String.raw`How badly does $\exp(A)\exp(B)$ miss $\exp(A+B)$? Multiply out the two series and collect terms:
$$\exp(A)\exp(B) = I + (A+B) + \tfrac12\big(A^{2} + 2AB + B^{2}\big) + \cdots$$
while
$$\exp(A+B) = I + (A+B) + \tfrac12\big(A^{2} + AB + BA + B^{2}\big) + \cdots$$
Subtract: the first difference is $\tfrac12(AB - BA)$. That object has a name — the **commutator**
$$[A, B] = AB - BA.$$

The **Baker–Campbell–Hausdorff formula** says the product is still an exponential, of
$$\exp(A)\exp(B) = \exp\Big(A + B + \tfrac12[A,B] + \tfrac1{12}\big[A,[A,B]\big] - \tfrac1{12}\big[B,[A,B]\big] + \cdots\Big),$$
for $A$, $B$ small enough — and **every term after $A+B$ is built only from commutators**. Nothing but brackets. That is the clue that the bracket, not the product, is the right structure on the infinitesimal level: it is the whole content of the [Lie algebra](@math/lie-algebras).`,
    },
    {
      kind: 'numeric',
      prompt: String.raw`With $A = \begin{pmatrix}0&1\\0&0\end{pmatrix}$ and $B = \begin{pmatrix}0&0\\1&0\end{pmatrix}$, compute the top-left entry of $\exp(A)\exp(B)$. (Both matrices square to zero, so each exponential is exactly $I + \text{matrix}$.)`,
      answer: 2,
      why: String.raw`$\exp(A) = I + A = \begin{pmatrix}1&1\\0&1\end{pmatrix}$ and $\exp(B) = I + B = \begin{pmatrix}1&0\\1&1\end{pmatrix}$, so $\exp(A)\exp(B) = \begin{pmatrix}2&1\\1&1\end{pmatrix}$. By contrast $A + B = \begin{pmatrix}0&1\\1&0\end{pmatrix}$ squares to $I$, giving $\exp(A+B) = \cosh(1)I + \sinh(1)(A+B)$, whose top-left entry is $\cosh 1 \approx 1.543$ — not 2.`,
    },
    {
      kind: 'explain',
      title: 'Computing exp in practice',
      body: String.raw`Nobody sums the series by hand. Three tricks cover almost everything:

**Diagonalise.** If $A = PDP^{-1}$ with $D = \operatorname{diag}(\lambda_1,\dots,\lambda_n)$, then
$$\exp(A) = P\,\operatorname{diag}(e^{\lambda_1},\dots,e^{\lambda_n})\,P^{-1}.$$
Example: $A = \begin{pmatrix}0&1\\1&0\end{pmatrix}$ has [eigenvalues](@math/eigenvalues) $\pm1$ with eigenvectors $(1,1)$ and $(1,-1)$, giving $\exp(A) = \begin{pmatrix}\cosh 1 & \sinh 1\\ \sinh 1 & \cosh 1\end{pmatrix}$.

**Nilpotent part.** If $N^{m} = 0$ the series *terminates*: $\exp(N) = I + N + \cdots + \frac{N^{m-1}}{(m-1)!}$. Split $A = D + N$ with $DN = ND$ and use rule 7.

**Structure.** For a skew $3\times3$ matrix you get Rodrigues' formula instead of any series — the [SO(3) lesson](@math/so3-su2) derives it.

Numerically, naive summing is unstable; libraries use *scaling and squaring*: compute $\exp(A/2^{k})$ from a short series, then square the result $k$ times, using $\exp(A) = \big(\exp(A/2^{k})\big)^{2^{k}}$.`,
    },
    {
      kind: 'order',
      prompt: String.raw`Order the steps for computing $\exp(tA)$ of a diagonalisable matrix $A$.`,
      steps: [
        String.raw`Find the eigenvalues of $A$ from $\det(A - \lambda I) = 0$.`,
        String.raw`Find an eigenvector for each eigenvalue and put them in the columns of $P$, so that $A = PDP^{-1}$ with $D$ diagonal.`,
        String.raw`Exponentiate the diagonal matrix entrywise: $\exp(tD) = \operatorname{diag}(e^{\lambda_1 t}, \dots, e^{\lambda_n t})$.`,
        String.raw`Conjugate back: $\exp(tA) = P\exp(tD)P^{-1}$.`,
        String.raw`Sanity-check with $\det\exp(tA) = e^{t\,\operatorname{tr}A}$ and $\exp(0\cdot A) = I$.`,
      ],
      why: String.raw`The whole method rests on $\exp(PDP^{-1}) = P\exp(D)P^{-1}$, which needs $P$ and $D$ before anything can be exponentiated. Exponentiating entry by entry is legitimate *only* for a diagonal matrix — doing it to a general $A$ is the classic blunder.`,
    },
    {
      kind: 'truefalse',
      prompt: String.raw`Every matrix in $SL_2(\mathbb{R})$ (real, $\det = 1$) is $\exp(X)$ for some real $X$ with $\operatorname{tr} X = 0$.`,
      answer: false,
      why: String.raw`Take $M = \operatorname{diag}(-2, -\tfrac12)$: $\det M = 1$, but $\operatorname{tr}M = -2.5$. A real traceless $2\times2$ $X$ has eigenvalues $\pm\lambda$ (real) or $\pm i\mu$, so $\exp(X)$ has trace $2\cosh\lambda \ge 2$ or $2\cos\mu \ge -2$ — never below $-2$. So $M$ is not an exponential. The exponential *is* surjective for compact connected groups such as $SO(3)$, $SU(2)$ and $U(n)$, which is why the failure is easy to overlook.`,
    },
    {
      kind: 'fill',
      prompt: String.raw`The series $\exp(A) = \sum_k A^k/k!$ converges for ___ square matrix. Its inverse is always ___, and $\det\exp(A) = $ ___. The identity $\exp(A+B) = \exp(A)\exp(B)$ needs $A$ and $B$ to ___.`,
      bank: ['every', 'only a diagonalisable', '$\\exp(-A)$', '$\\exp(A)^{\\mathsf T}$', '$e^{\\operatorname{tr}A}$', '$\\det A$', 'commute', 'be invertible'],
      answer: ['every', '$\\exp(-A)$', '$e^{\\operatorname{tr}A}$', 'commute'],
      why: String.raw`Convergence is unconditional because $\|A^k/k!\| \le \|A\|^k/k!$. Since $A$ and $-A$ commute, $\exp(A)\exp(-A) = \exp(0) = I$, so the exponential is always invertible — no condition needed. And it is the *trace* of $A$, not its determinant, that controls $\det\exp(A)$.`,
    },
    {
      kind: 'explain',
      title: 'Key takeaways',
      body: String.raw`- $\exp(A) = \sum_{k\ge0} A^{k}/k!$ converges for **every** square matrix.
- $\exp(\theta J) $ with $J = \begin{pmatrix}0&-1\\1&0\end{pmatrix}$ is the rotation by $\theta$ — the matrix version of $e^{i\theta}$.
- Key rules: $\frac{d}{dt}\exp(tA) = A\exp(tA)$, $\exp(A)^{-1} = \exp(-A)$, $\exp(PAP^{-1}) = P\exp(A)P^{-1}$, $\det\exp(A) = e^{\operatorname{tr}A}$.
- Every **one-parameter subgroup** $\gamma(s+t) = \gamma(s)\gamma(t)$ is $\exp(tX)$ for a unique $X = \gamma'(0)$; hence $\mathbf x(t) = \exp(tA)\mathbf x_0$ solves $\mathbf x' = A\mathbf x$.
- $\exp(A)\exp(B) \ne \exp(A+B)$ unless $AB = BA$. The leading error is $\tfrac12[A,B]$, and the full **BCH formula** is built entirely out of commutators.
- Compute by diagonalising, by truncating a nilpotent series, or numerically by scaling and squaring.

Next: the commutator turns the tangent space at the identity into an algebra — [Lie algebras](@math/lie-algebras).`,
    },
  ],
  references: [
    { authors: 'B. C. Hall', title: 'Lie Groups, Lie Algebras, and Representations: An Elementary Introduction', year: 2015, venue: '2nd ed., Springer GTM 222', detail: 'Ch. 2 (the matrix exponential, the logarithm, one-parameter subgroups); Ch. 5 (the Baker–Campbell–Hausdorff formula)' },
    { authors: 'J. Stillwell', title: 'Naive Lie Theory', year: 2008, venue: 'Springer UTM', detail: 'Ch. 4 (the exponential map), Ch. 7 (the matrix logarithm and the BCH series)' },
    { authors: 'C. Moler, C. Van Loan', title: 'Nineteen dubious ways to compute the exponential of a matrix, twenty-five years later', year: 2003, venue: 'SIAM Review 45(1), 3–49' },
    { authors: 'M. W. Hirsch, S. Smale, R. L. Devaney', title: 'Differential Equations, Dynamical Systems, and an Introduction to Chaos', year: 2013, venue: '3rd ed., Academic Press', detail: 'Ch. 6 (higher-dimensional linear algebra and the exponential of a matrix)' },
  ],
} satisfies LessonContent;
