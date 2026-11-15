import type { LessonContent } from '../../types';

export default {
  cards: [
    {
      kind: 'explain',
      title: 'Eigenvalues without a determinant',
      body: String.raw`In finite dimensions, $\lambda$ is an eigenvalue of $A$ exactly when $A - \lambda I$ is not invertible, and you detect that with $\det(A-\lambda I) = 0$. In infinite dimensions there is no determinant — and worse, "not invertible" splits into several genuinely different failures.

An operator can be non-injective; injective with range that is not even dense; or injective with dense range that still is not everything, so that an inverse exists on a dense set but is unbounded. Each failure mode is a different kind of spectrum. The payoff for sorting them out is large: diagonalising an operator is how you solve the heat equation, how a vibrating drum is decomposed into modes, and how quantum mechanics turns an observable into a set of possible measurements.`,
    },
    {
      kind: 'explain',
      title: 'The resolvent set and the spectrum',
      body: String.raw`Let $T \in B(X)$ be a [bounded operator](@math/bounded-operators) on a complex Banach space.

**Definition.** $\lambda$ lies in the **resolvent set** $\rho(T)$ if $T - \lambda I$ is a bijection of $X$ with a bounded inverse $R_\lambda = (T-\lambda I)^{-1}$. The **spectrum** is everything else: $\sigma(T) = \mathbb C \setminus \rho(T)$.

(For bounded $T$ on a Banach space, bijectivity already forces the inverse to be bounded, by the open mapping theorem. So the real content is "bijective".)

The spectrum splits by *how* bijectivity fails:

- **point spectrum** $\sigma_p$: $T - \lambda I$ is **not injective**. Then $\lambda$ is an *eigenvalue* and $\ker(T-\lambda I)$ is its eigenspace. This is the only case that exists in finite dimensions.
- **continuous spectrum** $\sigma_c$: injective, with **dense but not closed** range. An inverse exists on a dense set but is unbounded.
- **residual spectrum** $\sigma_r$: injective, with range **not even dense**.`,
    },
    {
      kind: 'widget',
      title: 'Four spectra you can probe',
      body: String.raw`Move the probe $\lambda$ and read its classification. Four standard operators, each showing something new:

- **multiplication** $(Mf)(x) = xf(x)$ on $L^2(0,1)$: self-adjoint, $\sigma(M) = [0,1]$, and **not one single eigenvalue** — $(x-\lambda)f = 0$ forces $f = 0$ almost everywhere. All of the spectrum is continuous.
- **right shift** on $\ell^2$: $\sigma$ is the closed unit disc, no eigenvalues, the interior residual and the boundary continuous.
- **left shift**: same disc, but now the interior is *all* eigenvalues, with eigenvector $(1,\lambda,\lambda^2,\dots)$.
- **compact diagonal** $Ae_n = e_n/n$: eigenvalues $1/n$ piling up at $0$, which itself lies in the continuous spectrum.`,
      widget: { type: 'MathSpectrumLine', props: { op: 'mult', re: 0.5, im: 0.3 }, caption: String.raw`The right shift and the left shift are adjoints of each other and have the *same* spectrum — but one has no eigenvalues and the other has a disc full of them.` },
    },
    {
      kind: 'mcq',
      prompt: String.raw`What is the spectrum of $(Mf)(x) = x\,f(x)$ on $L^2(0,1)$?`,
      choices: [
        String.raw`$\sigma(M) = [0,1]$, entirely continuous spectrum: no eigenvalues at all.`,
        String.raw`$\sigma(M) = [0,1]$, every point an eigenvalue with eigenfunction $\delta_\lambda$.`,
        String.raw`$\sigma(M) = \{0\}$, since $M$ has no fixed directions.`,
        String.raw`$\sigma(M) = \emptyset$, since $M - \lambda I$ is injective for every $\lambda$.`,
      ],
      answer: 0,
      why: String.raw`$(x-\lambda)f(x) = 0$ forces $f = 0$ off the single point $\lambda$, hence $f = 0$ in $L^2$ — so $M-\lambda I$ is injective and there are no eigenvalues. For $\lambda \in [0,1]$ the inverse "divide by $x-\lambda$" is unbounded (test it on narrow bumps near $x=\lambda$), so those $\lambda$ are in the spectrum; outside $[0,1]$ division is bounded. A delta is not an element of $L^2$, so it cannot be an eigenfunction. And the spectrum of a bounded operator on a complex Banach space is never empty.`,
    },
    {
      kind: 'explain',
      title: 'What is always true',
      body: String.raw`For every bounded $T$ on a complex Banach space $X \ne \{0\}$:

- $\sigma(T)$ is **non-empty**, **closed** and **bounded** — hence compact. (Non-emptiness is a Liouville argument: $\lambda \mapsto R_\lambda$ is analytic on $\rho(T)$ and decays at infinity, so an empty spectrum would make it a bounded entire function, hence $0$.)
- $\sigma(T) \subseteq \{|\lambda| \le \|T\|\}$, because for $|\lambda| > \|T\|$ the Neumann series $-\frac1\lambda\sum_{n\ge0}(T/\lambda)^n$ converges and inverts $T-\lambda I$.
- The **spectral radius** $r(T) = \sup\{|\lambda| : \lambda \in \sigma(T)\}$ satisfies the Gelfand formula
$$r(T) = \lim_{n\to\infty}\|T^n\|^{1/n} \;\le\; \|T\| .$$

The last inequality can be strict, and when it is, the gap matters: $r(T) < 1$ is exactly the condition for $T^n \to 0$ in operator norm, which is why it, and not $\|T\| < 1$, governs the convergence of iterative solvers.`,
    },
    {
      kind: 'numeric',
      prompt: String.raw`Let $A = \begin{pmatrix}0 & 5\\ 0 & 0\end{pmatrix}$ on $\mathbb C^2$. Its operator norm is $5$. What is its spectral radius $r(A)$?`,
      answer: 0,
      why: String.raw`$A^2 = 0$, so $\|A^n\|^{1/n} = 0$ for $n \ge 2$ and the Gelfand limit is $0$; equivalently $\det(A-\lambda I) = \lambda^2$, so $\sigma(A) = \{0\}$. The norm is $5$ and the spectral radius is $0$: a nilpotent operator stretches vectors a lot in one step and dies in two. Answering $5$ confuses the norm with the spectral radius — they agree for self-adjoint operators but not in general.`,
    },
    {
      kind: 'explain',
      title: 'Self-adjointness tames everything',
      body: String.raw`On a Hilbert space, the **adjoint** $T^{*}$ is defined by $\langle Tx, y\rangle = \langle x, T^{*}y\rangle$, and $T$ is **self-adjoint** when $T = T^{*}$. (In matrix terms: Hermitian.) Four consequences, all easy and all decisive:

- $\langle Tx,x\rangle$ is **real** for every $x$; hence every eigenvalue is real, and in fact $\sigma(T) \subset \mathbb R$.
- Eigenvectors for distinct eigenvalues are **orthogonal**: $(\lambda-\mu)\langle x,y\rangle = \langle Tx,y\rangle - \langle x,Ty\rangle = 0$.
- The **residual spectrum is empty**: if $T - \lambda I$ is injective with $\lambda$ real, its range is automatically dense.
- $\|T\| = r(T) = \sup_{\|x\|=1}|\langle Tx,x\rangle|$ — the norm is computed by the quadratic form, and the spectrum reaches all the way out to it.

This is the infinite-dimensional continuation of what you know about symmetric matrices from [diagonalisation](@math/diagonalization-svd). What is missing so far is a *basis* of eigenvectors — and for that, boundedness is not enough.`,
    },
    {
      kind: 'explain',
      title: 'The spectral theorem for compact self-adjoint operators',
      body: String.raw`Add compactness and the finite-dimensional picture returns almost intact.

> **Theorem (Hilbert–Schmidt).** Let $T$ be a **compact self-adjoint** operator on a Hilbert space $H \ne \{0\}$. Then:
> 1. $\|T\|$ or $-\|T\|$ is an eigenvalue, so a largest one exists.
> 2. The nonzero eigenvalues are real, form a finite or countable set, and each has **finite** multiplicity; if there are infinitely many, then $\lambda_n \to 0$.
> 3. There is an **orthonormal system** $\{e_n\}$ of eigenvectors, $Te_n = \lambda_n e_n$ with $\lambda_n \neq 0$, such that
> $$Tx \;=\; \sum_n \lambda_n \langle x, e_n\rangle\, e_n \qquad \text{for every } x \in H.$$
> 4. $H = \ker T \,\oplus\, \overline{\operatorname{span}}\{e_n\}$. If $H$ is separable, adjoining an orthonormal basis of $\ker T$ gives an orthonormal basis of $H$ made entirely of eigenvectors.

Read item 3 as: $T$ is **diagonal** in a suitable orthonormal basis, with the diagonal entries tending to zero. Compare with the finite-dimensional spectral theorem — the only new features are that $0$ may be in the spectrum without being an eigenvalue, and that the eigenvalues must accumulate at $0$ and nowhere else.

> **Fredholm alternative** (same hypotheses, $\lambda \ne 0$): either $(T-\lambda I)x = y$ has a unique solution for every $y$, or the homogeneous equation has a finite-dimensional space of solutions, and then $(T-\lambda I)x = y$ is solvable exactly for $y \perp \ker(T - \lambda I)$. There is no middle case.`,
    },
    {
      kind: 'widget',
      title: 'A compact operator’s spectrum, up close',
      body: String.raw`Here is the diagonal operator $Ae_n = e_n/n$ on $\ell^2$ — compact and self-adjoint. Probe the eigenvalues $1, \tfrac12, \tfrac13, \dots$: they are isolated points of positive multiplicity, exactly as the theorem promises, and they crowd towards $0$.

And $0$ itself? It belongs to $\sigma(A)$ but is **not** an eigenvalue: $A$ is injective, its range is dense, but the inverse $e_n \mapsto n e_n$ is unbounded. So $0$ sits in the continuous spectrum. That is the one way the infinite-dimensional picture genuinely differs — and it is unavoidable, since $0 \in \sigma(T)$ for every compact operator on an infinite-dimensional space.`,
      widget: { type: 'MathSpectrumLine', props: { op: 'compact', re: 0.5, im: 0 } },
    },
    {
      kind: 'order',
      prompt: String.raw`Arrange the standard proof that a compact self-adjoint $T \ne 0$ has an eigenvalue of modulus $\|T\|$.`,
      steps: [
        String.raw`Self-adjointness gives $\|T\| = \sup_{\|x\|=1}|\langle Tx,x\rangle|$, so choose unit vectors $x_n$ with $\langle Tx_n,x_n\rangle \to \lambda$, where $|\lambda| = \|T\|$.`,
        String.raw`Expand $\|Tx_n - \lambda x_n\|^2 = \|Tx_n\|^2 - 2\lambda\langle Tx_n,x_n\rangle + \lambda^2 \le 2\lambda^2 - 2\lambda\langle Tx_n,x_n\rangle \to 0$.`,
        String.raw`Compactness: pass to a subsequence along which $Tx_{n_k}$ converges, say to $y$.`,
        String.raw`Since $Tx_{n_k} - \lambda x_{n_k} \to 0$ and $\lambda \ne 0$, the vectors $x_{n_k} = \frac1\lambda\big(Tx_{n_k} - (Tx_{n_k} - \lambda x_{n_k})\big)$ converge too, to $x = y/\lambda$, a unit vector.`,
        String.raw`Continuity of $T$ gives $Tx = \lambda x$ with $\|x\| = 1$: an eigenvector with eigenvalue $\lambda$ of modulus $\|T\|$.`,
        String.raw`Restrict $T$ to the closed invariant subspace $\{x\}^{\perp}$, which is again compact and self-adjoint, and repeat to generate the whole orthonormal system.`,
      ],
      why: String.raw`The structure is: self-adjointness turns the norm into a *maximisation problem*, compactness turns the maximising sequence into a convergent one, and continuity turns the limit into a genuine eigenvector. Drop compactness and step 3 fails — which is exactly why the multiplication operator, self-adjoint with $\|M\| = 1$, has no eigenvector at all.`,
    },
    {
      kind: 'explain',
      title: 'Where this is really used: a vibrating string',
      body: String.raw`Consider $-u'' = \lambda u$ on $(0,\pi)$ with $u(0) = u(\pi) = 0$. The solutions are
$$u_n(x) = \sqrt{2/\pi}\,\sin(nx), \qquad \lambda_n = n^2, \qquad n = 1,2,3,\dots$$
an orthonormal basis of $L^2(0,\pi)$ consisting of eigenfunctions. But $-d^2/dx^2$ is *unbounded*, so the theorem above does not apply to it directly. The trick is to invert it: the solution operator $G$ sending $f$ to the solution of $-u'' = f$ is an integral operator with the [Green's function](@math/greens-functions) as kernel, and that operator **is** compact and self-adjoint, with eigenvalues $1/n^2 \to 0$. Apply the spectral theorem to $G$ and read the conclusion back on $-d^2/dx^2$.

That is why the sine series diagonalises the [heat equation](@math/pde-heat-equation): below, each mode is an eigenvector, so it simply decays by its own factor $e^{-Dn^2t}$, independently of all the others. A hard PDE becomes infinitely many trivial ODEs.`,
      widget: { type: 'MathHeatModes', props: { initial: 'box', D: 1 } },
    },
    {
      kind: 'numeric',
      prompt: String.raw`The Dirichlet problem $-u'' = \lambda u$ on $(0,\pi)$, $u(0)=u(\pi)=0$, has eigenvalues $\lambda_n = n^2$. What is the fourth smallest eigenvalue?`,
      answer: 16,
      why: String.raw`The eigenvalues in increasing order are $1, 4, 9, 16, \dots$, so the fourth is $4^2 = 16$. Answering $4$ would be giving $n$ instead of $\lambda_n$. Note that these grow without bound — unbounded operators have unbounded spectra — while the eigenvalues $1/n^2$ of the *inverse* operator shrink to zero, as a compact operator's must.`,
    },
    {
      kind: 'explain',
      title: 'The unbounded case: what changes',
      body: String.raw`Most operators that matter in physics and PDE — differentiation, the Laplacian, position, momentum, the Hamiltonian — are **unbounded**. Four things change, and the differences are not technicalities.

1. **The domain is part of the operator.** An unbounded $T$ is defined only on a dense subspace $D(T) \subset H$. $-d^2/dx^2$ with Dirichlet conditions and $-d^2/dx^2$ with periodic conditions are *different operators* with different spectra.
2. **Symmetric is weaker than self-adjoint.** $\langle Tx,y\rangle = \langle x,Ty\rangle$ for $x,y \in D(T)$ makes $T$ *symmetric*; self-adjointness also demands $D(T^{*}) = D(T)$. This is a real distinction: $-i\,d/dx$ on $C_c^\infty(0,1)$ is symmetric and has a whole circle of self-adjoint extensions (boundary conditions $u(1) = e^{i\alpha}u(0)$), each with a different spectrum (the deficiency indices are $(1,1)$ on the interval, which is what allows one free phase $\alpha$); on the half-line $(0,\infty)$ the same expression has deficiency indices $(1,0)$ or $(0,1)$ — unequal — and so has **no** self-adjoint extension at all. The spectral theorem needs self-adjoint, not merely symmetric.
3. **The spectrum may be unbounded and purely continuous.** Position $x$ and momentum $-i\,d/dx$ on $L^2(\mathbb R)$ both have $\sigma = \mathbb R$ with no eigenvalues: $e^{ikx}$ is not square-integrable.
4. **The theorem becomes an integral.** For self-adjoint $T$ there is a projection-valued measure $E$ on $\mathbb R$ with $T = \int_{\mathbb R}\lambda\,dE(\lambda)$ — a continuous "sum" replacing $\sum_n \lambda_n \langle\cdot,e_n\rangle e_n$. Discrete eigenvalues correspond to atoms of $E$.

One rescue is worth remembering: if $T$ is self-adjoint and its resolvent $(T-\lambda_0 I)^{-1}$ is **compact** for a single $\lambda_0 \in \rho(T)$, the discrete picture comes back in full — an orthonormal basis of eigenfunctions with $|\lambda_n| \to \infty$. That is the case for the Dirichlet Laplacian on a bounded domain, and it is why drums have a discrete set of tones while a free particle does not.`,
    },
    {
      kind: 'truefalse',
      prompt: String.raw`Every bounded self-adjoint operator on a separable Hilbert space has an orthonormal basis of eigenvectors.`,
      answer: false,
      why: String.raw`Multiplication by $x$ on $L^2(0,1)$ is bounded and self-adjoint and has **no eigenvectors whatsoever**, so certainly no basis of them. Self-adjointness alone gives a real spectrum and a spectral *measure*; getting an honest eigenbasis needs an extra hypothesis such as compactness (or compact resolvent in the unbounded case). In finite dimensions compactness is automatic, which is why the distinction is invisible there.`,
    },
    {
      kind: 'match',
      prompt: 'Match each operator to its spectrum.',
      pairs: [
        [String.raw`$(Mf)(x) = xf(x)$ on $L^2(0,1)$`, String.raw`$[0,1]$, all continuous spectrum`],
        [String.raw`right shift on $\ell^2$`, String.raw`the closed unit disc, with no eigenvalues`],
        [String.raw`$Ae_n = e_n/n$ on $\ell^2$`, String.raw`$\{1, \tfrac12, \tfrac13, \dots\} \cup \{0\}$`],
        [String.raw`$-d^2/dx^2$ on $(0,\pi)$, Dirichlet`, String.raw`$\{1, 4, 9, 16, \dots\}$, unbounded`],
        [String.raw`$-i\,d/dx$ on $L^2(\mathbb R)$`, String.raw`all of $\mathbb R$, with no eigenvalues`],
      ],
      why: String.raw`Two patterns to carry away. Compact operators have eigenvalues accumulating only at $0$, and $0$ always belongs to the spectrum; unbounded self-adjoint operators can have eigenvalues marching off to infinity (when the resolvent is compact) or no eigenvalues at all (when the spectrum is continuous). "Spectrum" is the robust notion; "eigenvalue" is the fragile one.`,
    },
    {
      kind: 'fill',
      prompt: String.raw`The spectrum of a bounded operator on a complex Banach space is always non-empty and ___ . For a self-adjoint operator it lies in ___ . If in addition the operator is ___ , there is an orthonormal system of eigenvectors with eigenvalues tending to ___ .`,
      bank: ['compact', 'ℝ', 'ℂ', 'compact', 'zero', 'infinity', 'countable', 'unbounded'],
      answer: ['compact', 'ℝ', 'compact', 'zero'],
      why: String.raw`Closed and bounded makes the spectrum compact as a *subset of the plane*; the same word then reappears as a hypothesis on the *operator*, which is why the bank holds two copies of it. Self-adjointness pins the spectrum to the real line, and compactness of the operator forces the nonzero eigenvalues to accumulate only at $0$ — the one place the finite-dimensional picture had to give way.`,
    },
    {
      kind: 'explain',
      title: 'Key takeaways',
      body: String.raw`- $\lambda \in \rho(T)$ when $T-\lambda I$ is boundedly invertible; $\sigma(T)$ is everything else, and splits into **point** (not injective), **continuous** (dense non-closed range) and **residual** (range not dense) parts.
- For bounded $T$ on a complex Banach space, $\sigma(T)$ is **non-empty and compact**, contained in $|\lambda| \le \|T\|$, with spectral radius $r(T) = \lim\|T^n\|^{1/n}$, possibly $< \|T\|$.
- **Self-adjoint:** $\sigma(T)\subset\mathbb R$, no residual spectrum, eigenvectors for distinct eigenvalues orthogonal, and $\|T\| = r(T) = \sup_{\|x\|=1}|\langle Tx,x\rangle|$.
- **Spectral theorem (compact self-adjoint):** $\pm\|T\|$ contains an eigenvalue; nonzero eigenvalues are real with finite multiplicity and accumulate only at $0$; $Tx = \sum_n\lambda_n\langle x,e_n\rangle e_n$; and $H = \ker T \oplus \overline{\operatorname{span}}\{e_n\}$, giving an eigenbasis when $H$ is separable. Plus the **Fredholm alternative** at every $\lambda \ne 0$.
- Boundedness alone is **not** enough: multiplication by $x$ on $L^2(0,1)$ is bounded and self-adjoint with no eigenvectors.
- **Unbounded operators**: the domain is part of the data; symmetric $\ne$ self-adjoint; the spectrum may be unbounded or purely continuous; the theorem becomes $T = \int\lambda\,dE(\lambda)$. A **compact resolvent** restores the eigenbasis, with $|\lambda_n|\to\infty$ — the case of the Dirichlet Laplacian on a bounded domain.

Next: the function spaces in which those PDE operators are actually self-adjoint — [Sobolev spaces](@math/sobolev-spaces).`,
    },
  ],
  references: [
    { authors: 'E. Kreyszig', title: 'Introductory Functional Analysis with Applications', year: 1978, venue: 'Wiley', detail: 'Ch. 7 (spectral theory in normed spaces: resolvent, spectral radius, Neumann series); Ch. 8, §8.3–8.6 (spectral properties of compact operators, the Fredholm alternative); Ch. 9 (bounded self-adjoint operators); Ch. 10 (unbounded operators)' },
    { authors: 'H. Brezis', title: 'Functional Analysis, Sobolev Spaces and Partial Differential Equations', year: 2011, venue: 'Springer Universitext', detail: 'Ch. 6 (compact operators: the Riesz–Fredholm theory, the Fredholm alternative, the spectral decomposition of compact self-adjoint operators, Sturm–Liouville problems)' },
    { authors: 'M. Reed, B. Simon', title: 'Methods of Modern Mathematical Physics I: Functional Analysis', year: 1980, venue: 'Revised ed., Academic Press', detail: 'Ch. VI (bounded operators, the spectrum, compact operators and the Hilbert–Schmidt theorem); Ch. VII (the spectral theorem and projection-valued measures); Ch. VIII (unbounded operators, self-adjointness)' },
    { authors: 'M. Reed, B. Simon', title: 'Methods of Modern Mathematical Physics II: Fourier Analysis, Self-Adjointness', year: 1975, venue: 'Academic Press', detail: '§X.1 (symmetric versus self-adjoint operators; deficiency indices and the self-adjoint extensions of −i d/dx)' },
    { authors: 'W. Rudin', title: 'Functional Analysis', year: 1991, venue: '2nd ed., McGraw-Hill', detail: 'Ch. 10 (Banach algebras and the spectral radius formula); Ch. 12–13 (bounded and unbounded operators on a Hilbert space, the spectral theorem)' },
  ],
} satisfies LessonContent;
