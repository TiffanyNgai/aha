import type { LessonContent } from '../../types';

// What the theorem delivers vs. what a practitioner needs.
const gapSvg = `<svg viewBox="0 0 320 206" xmlns="http://www.w3.org/2000/svg" font-family="inherit">
  <text x="160" y="13" font-size="9.5" text-anchor="middle" fill="var(--fg)">an existence theorem and the questions it leaves open</text>

  <rect x="8" y="22" width="148" height="172" rx="5" fill="none" stroke="var(--c1)" stroke-width="0.9"/>
  <text x="82" y="36" font-size="9" text-anchor="middle" fill="var(--c1)">what Chen &amp; Chen prove</text>
  <text x="16" y="54" font-size="8" fill="var(--fg)">✓ for every ε &gt; 0 …</text>
  <text x="16" y="68" font-size="8" fill="var(--fg)">✓ … some m, M, N exist</text>
  <text x="16" y="82" font-size="8" fill="var(--fg)">✓ … some weights exist</text>
  <text x="16" y="96" font-size="8" fill="var(--fg)">✓ sup error &lt; ε on V × K₂</text>
  <text x="16" y="110" font-size="8" fill="var(--fg)">✓ any non-polynomial σ</text>
  <text x="16" y="124" font-size="8" fill="var(--fg)">✓ G merely continuous</text>
  <text x="16" y="138" font-size="8" fill="var(--fg)">✓ V compact in C(K₁)</text>
  <text x="16" y="160" font-size="7.5" fill="var(--muted)">the branch × trunk shape</text>
  <text x="16" y="171" font-size="7.5" fill="var(--muted)">is what the proof produces,</text>
  <text x="16" y="182" font-size="7.5" fill="var(--muted)">and that is its real gift</text>

  <rect x="164" y="22" width="148" height="172" rx="5" fill="none" stroke="var(--c5)" stroke-width="0.9"/>
  <text x="238" y="36" font-size="9" text-anchor="middle" fill="var(--c5)">what it does not say</text>
  <text x="172" y="54" font-size="8" fill="var(--fg)">✗ how big m, M, N must be</text>
  <text x="172" y="68" font-size="8" fill="var(--fg)">✗ any rate in ε</text>
  <text x="172" y="82" font-size="8" fill="var(--fg)">✗ where to put the sensors</text>
  <text x="172" y="96" font-size="8" fill="var(--fg)">✗ that training finds them</text>
  <text x="172" y="110" font-size="8" fill="var(--fg)">✗ how much data is needed</text>
  <text x="172" y="124" font-size="8" fill="var(--fg)">✗ anything off V</text>
  <text x="172" y="138" font-size="8" fill="var(--fg)">✗ discretisation invariance</text>
  <text x="172" y="162" font-size="7.5" fill="var(--c5)">so DeepONet working well is</text>
  <text x="172" y="173" font-size="7.5" fill="var(--c5)">an empirical fact, not a</text>
  <text x="172" y="184" font-size="7.5" fill="var(--c5)">corollary of this theorem</text>
</svg>`;

export default {
  cards: [
    {
      kind: 'explain',
      title: 'The question',
      body: String.raw`For ordinary functions there is a famous reassurance. A one-hidden-layer network $\sum_i c_i\,\sigma(w_i\cdot x + \theta_i)$ can approximate **any** continuous $f : K \to \mathbb{R}$ on a compact set $K \subset \mathbb{R}^n$ to any accuracy, provided $\sigma$ is not a polynomial (Cybenko 1989; Hornik, Stinchcombe & White 1989; Leshno et al. 1993).

Operator learning needs the analogous reassurance one level up. The input is now a *function* $u$, not a point. Can a network approximate **any** continuous operator $\mathcal{G} : u \mapsto \mathcal{G}(u)$?

Tianping Chen and Hong Chen answered yes in 1995 — roughly two decades before DeepONet (Lu et al., first posted 2019) turned it into a working architecture — and the shape of their answer is literally the DeepONet architecture.`,
    },
    {
      kind: 'recall',
      title: 'Universal approximation for functions',
      points: [
        String.raw`A single hidden layer of width $M$ computes $\sum_{i=1}^{M} c_i\,\sigma(w_i\cdot x + \theta_i)$.`,
        String.raw`Such sums are **dense** in $C(K)$ for compact $K$, for any continuous non-polynomial $\sigma$.`,
        String.raw`It is an **existence** result: no bound on $M$, and no claim that gradient descent will find the weights.`,
        String.raw`Width can be exponential in the input dimension — universality and efficiency are different questions.`,
      ],
      link: 'ml/neural-networks-intro',
    },
    {
      kind: 'explain',
      title: 'Three problems hiding in one',
      body: String.raw`Approximating $\mathcal{G}(u)(y)$ means solving three problems at once:

1. **Encoding.** You cannot hand a network a whole function. You must reduce $u$ to finitely many numbers — here, its values at $m$ fixed **sensor** points $x_1,\dots,x_m$.
2. **Approximation.** Map those $m$ numbers to a description of the output function.
3. **Decoding.** Turn that description back into a function of the query point $y$.

Chen & Chen's choice for step 3 is the elegant part: rather than output values on a grid, output *coefficients* against a learned basis that is itself a network of $y$. Then the answer is a function and $y$ can be anything.

Write $b_k(u)$ for the $k$-th coefficient and $t_k(y)$ for the $k$-th basis function. The prediction is $\sum_k b_k(u)\,t_k(y)$ — a dot product.`,
    },
    {
      kind: 'explain',
      title: 'The theorem',
      body: String.raw`> **Chen & Chen (1995), universal approximation for operators.** Let $\sigma$ be continuous and not a polynomial. Let $K_1 \subset X$ be compact in a Banach space $X$, let $V \subset C(K_1)$ be **compact**, let $K_2 \subset \mathbb{R}^n$ be compact, and let $\mathcal{G} : V \to C(K_2)$ be a continuous operator. Then for every $\varepsilon > 0$ there are positive integers $m, M, N$, sensor points $x_1,\dots,x_m \in K_1$, and real constants $c_i^k, \xi_{ij}^k, \theta_i^k, \zeta_k$ and vectors $\omega_k \in \mathbb{R}^n$ such that
> $$\Big| \mathcal{G}(u)(y) - \sum_{k=1}^{N}\underbrace{\sum_{i=1}^{M} c_i^k\,\sigma\Big(\sum_{j=1}^{m}\xi_{ij}^k\,u(x_j) + \theta_i^k\Big)}_{\text{branch } b_k(u)}\ \underbrace{\sigma(\omega_k\cdot y + \zeta_k)}_{\text{trunk } t_k(y)} \Big| < \varepsilon$$
> for **all** $u \in V$ and **all** $y \in K_2$.

Read the braces. The inner double sum sees the input only through the $m$ sensor values; the right factor sees only $y$. Nothing couples them except the sum over $k$.`,
    },
    {
      kind: 'widget',
      title: 'Unpacking the formula',
      body: String.raw`Each step below is one layer of the expression, from the inside out.`,
      widget: {
        type: 'StepReveal',
        props: {
          steps: [
            String.raw`$u(x_1),\dots,u(x_m)$ — the function is replaced by $m$ numbers. This is the only place $u$ enters.`,
            String.raw`$\sigma\big(\sum_j \xi_{ij}^k u(x_j) + \theta_i^k\big)$ — one hidden unit of a plain network applied to those numbers.`,
            String.raw`$b_k(u) = \sum_{i=1}^{M} c_i^k\,\sigma(\cdots)$ — a width-$M$ network output. The **branch**: $N$ coefficients describing the input.`,
            String.raw`$t_k(y) = \sigma(\omega_k\cdot y + \zeta_k)$ — a single hidden unit in the query point. The **trunk**: a learned basis on $K_2$.`,
            String.raw`$\sum_{k=1}^{N} b_k(u)\,t_k(y)$ — the dot product. Output is a function of $y$, defined at every point of $K_2$.`,
          ],
          notes: [
            'The sensors are chosen once by the theorem and then fixed for every input.',
            'Exactly the sum-of-sigmoids from the classical theorem, with the sensor values as its input vector.',
            'Nothing requires the branch to be one hidden layer; depth only helps.',
            'The trunk is stated here with a single unit per k, but a deeper trunk is again covered by the same argument.',
            'Separable in u and y: this bilinear structure is what makes the output a function rather than a grid.',
          ],
        },
      },
    },
    {
      kind: 'mcq',
      prompt: String.raw`In the Chen & Chen expression, what is the role of the index $k$ running from $1$ to $N$?`,
      choices: [
        'It indexes the terms of the dot product: one coefficient from the branch times one basis function from the trunk.',
        'It indexes the sensor locations at which the input function is read.',
        'It indexes the hidden units inside the branch network.',
        'It indexes the training examples used to fit the weights.',
      ],
      answer: 0,
      why: String.raw`$N$ is the width of the dot product — effectively the number of basis functions the output is expanded in. The sensors are indexed by $j = 1..m$ and the branch's hidden units by $i = 1..M$; training examples do not appear in the statement at all, because the theorem is about existence of weights, not about fitting them.`,
    },
    {
      kind: 'explain',
      title: 'Why "not a polynomial"',
      body: String.raw`Chen & Chen work with the class $(\mathrm{TW})$ of *Tauber–Wiener* functions: those $\sigma$ for which sums $\sum c_i\sigma(w_i x + \theta_i)$ are dense in $C[a,b]$. For continuous $\sigma$, membership in $(\mathrm{TW})$ is equivalent to $\sigma$ not being a polynomial — the sharp condition proved by Leshno, Lin, Pinkus & Schocken (1993).

The reason a polynomial fails is immediate: if $\sigma$ has degree $d$, then every $\sigma(wx + \theta)$ is a polynomial of degree $\le d$, and so is every finite sum of them. Widening the layer buys nothing; the span is the fixed, finite-dimensional space of degree-$\le d$ polynomials. ReLU, tanh, sigmoid, GELU, sine — all fine.`,
    },
    {
      kind: 'truefalse',
      prompt: String.raw`With $\sigma(z) = z^2$, a sufficiently wide branch-and-trunk network can approximate any continuous operator to arbitrary accuracy.`,
      answer: false,
      why: String.raw`$z^2$ is a polynomial, so each factor stays inside a fixed finite-dimensional space of quadratics no matter how wide you make the network; the span cannot be dense. This is exactly the hypothesis the theorem needs. (The failure is not about smoothness — the perfectly smooth $\tanh$ is fine, and the non-smooth ReLU is fine too.)`,
    },
    {
      kind: 'explain',
      title: 'What the theorem does not give you',
      body: String.raw`This is where honesty matters, because the theorem is routinely overquoted.

It is a pure **existence** statement. For a given $\varepsilon$ it produces *some* $m$, $M$, $N$ and *some* weights — with no bound on any of them, and no rate. There is no inequality of the form "error $\le C\,N^{-\alpha}$" anywhere in it. It says nothing about:

- how many sensors you need, or where to put them;
- whether stochastic gradient descent on finitely many examples will find weights anywhere near the ones it promises;
- how much training data is required;
- behaviour on inputs outside the compact set $V$;
- discretisation invariance — the sensors are *fixed*, so the architecture it produces is not grid-free on the input side.

DeepONet works well on many problems. That is an empirical finding. It is not a consequence of this theorem.`,
      widget: { type: 'SvgDiagram', props: { svg: gapSvg } },
    },
    {
      kind: 'multi',
      prompt: 'Which of these follow from the Chen & Chen theorem?',
      choices: [
        String.raw`Branch × trunk networks are dense in the continuous operators on a compact $V$.`,
        String.raw`A trained DeepONet will generalise to inputs drawn from a different distribution.`,
        String.raw`There is a width $N$ achieving error below any prescribed $\varepsilon$.`,
        String.raw`The error decays at least as fast as $N^{-1/2}$.`,
        String.raw`Any continuous non-polynomial activation suffices.`,
      ],
      answers: [0, 2, 4],
      why: String.raw`Density, existence of a sufficient width, and the activation condition are precisely the content of the theorem. A *rate* in $N$ is exactly what it withholds, and nothing in it concerns a shifted input distribution — $V$ is fixed and the guarantee is uniform on $V$ and nowhere else.`,
    },
    {
      kind: 'explain',
      title: 'Why $V$ has to be compact',
      body: String.raw`The hypothesis that $V \subset C(K_1)$ is **compact** is doing real work, and it is also the hypothesis that connects theory to practice.

In infinite dimensions a closed bounded set need not be compact — the unit ball of $C(K_1)$ is not. Compactness here means the inputs are *uniformly* controlled: by Arzelà–Ascoli, bounded and equicontinuous. That rules out families with arbitrarily fine wiggles.

That restriction is not a technicality you can drop. If the inputs could oscillate arbitrarily fast, $m$ sensor readings could never pin $u$ down: two inputs agreeing at all $m$ sensors but differing wildly in between must have nearly the same prediction, while their true images could be far apart.

In practice $V$ is the support of your training distribution — Gaussian random fields of a fixed smoothness, say. Rougher inputs break the hypothesis before they break the network.`,
    },
    {
      kind: 'match',
      prompt: 'Match each symbol in the theorem with what it counts.',
      pairs: [
        [String.raw`$m$`, 'fixed sensor locations where the input is read'],
        [String.raw`$M$`, 'hidden units inside the branch network'],
        [String.raw`$N$`, 'terms in the dot product, i.e. learned basis functions'],
        [String.raw`$V$`, 'the compact set of input functions the guarantee covers'],
        [String.raw`$K_2$`, 'the compact set of query points $y$'],
      ],
      why: String.raw`Keeping these straight matters when reading parameter counts: the branch's first weight matrix alone has $N\cdot M\cdot m$ entries, which is why sensor count and width multiply rather than add.`,
    },
    {
      kind: 'numeric',
      prompt: String.raw`An architecture of this exact form uses $m = 100$ sensors, branch width $M = 40$ and $N = 20$ dot-product terms. How many weights $\xi_{ij}^k$ does it have?`,
      answer: 80000,
      tolerance: 1,
      why: String.raw`$\xi_{ij}^k$ carries three indices, $i \le M$, $j \le m$, $k \le N$, so the count is $40 \times 100 \times 20 = 80{,}000$. The $c_i^k$ and $\theta_i^k$ contribute only $800$ each. The sensor dimension multiplies everything, which is one reason practical DeepONets use a single branch network with $p$ outputs (sharing its hidden layers across all the coefficients) rather than $N$ independent branches.`,
    },
    {
      kind: 'explain',
      title: 'What came after: rates, and their price',
      body: String.raw`Quantitative theory arrived much later, and it is more sobering than the 1995 result.

Lanthaler, Mishra & Karniadakis (2022) split DeepONet error into three parts — **encoding** (losing information at the sensors), **approximation** (the networks themselves) and **reconstruction** (expressing the output in $N$ basis functions) — and prove explicit error estimates for specific PDE solution operators (they treat, for example, Burgers' equation and a Poisson-type problem), where the size needed grows with the accuracy in a way tied to the regularity of the problem.

The basis the trunk learns does not depend on $u$, so the output is always approximated in a fixed $N$-dimensional *linear* space. Lanthaler, Molinaro, Hadorn & Mishra (2023) show that when the outputs have slowly decaying Kolmogorov $N$-widths — for instance transport problems that carry a discontinuity around — any such linear reconstruction converges slowly in $N$, whatever the branch does.

Kovachki, Lanthaler & Mishra (2021) prove universality for Fourier neural operators and quantitative bounds for specific PDEs (Navier–Stokes among them), which show that for those problems the size need not blow up exponentially in $1/\varepsilon$; for a generic continuous operator no such saving can be expected.

The honest summary: universality is cheap and nearly automatic; **rates** are the hard currency, and they are bought with assumptions about the specific operator.`,
    },
    {
      kind: 'order',
      prompt: 'Order the logical steps of the proof strategy behind the theorem.',
      steps: [
        String.raw`Use compactness of $V$ to replace each $u$ by its values at finitely many sensors, with uniform error.`,
        String.raw`Observe that $\mathcal{G}$ then factors through a continuous map on a compact subset of $\mathbb{R}^m$.`,
        String.raw`Expand the output function in finitely many terms whose coefficients depend continuously on those $m$ numbers.`,
        String.raw`Approximate each coefficient map by a classical one-hidden-layer network (the branch).`,
        String.raw`Approximate each basis function of $y$ by a one-hidden-layer network (the trunk), and collect the errors.`,
      ],
      why: String.raw`The proof is a reduction, not a new approximation idea: compactness turns an infinite-dimensional input into $m$ numbers, after which everything is the classical finite-dimensional theorem applied twice — once in $u$'s sensor values and once in $y$. That is also why no rate falls out: each reduction step is itself rate-free.`,
    },
    {
      kind: 'fill',
      prompt: String.raw`The theorem requires $\sigma$ to be continuous and not a ___, and the input set $V$ to be ___ in $C(K_1)$. It is an ___ result: it gives no ___ for how the error shrinks with width.`,
      bank: ['polynomial', 'compact', 'existence', 'rate', 'constant', 'convex', 'asymptotic', 'bound'],
      answer: ['polynomial', 'compact', 'existence', 'rate'],
      why: String.raw`Polynomials span a fixed finite-dimensional space, so they cannot be dense; compactness of $V$ is what lets finitely many sensors represent every admissible input uniformly; and the conclusion quantifies over $\varepsilon$ with no control of the sizes involved, which is exactly the absence of a rate.`,
    },
    {
      kind: 'explain',
      title: 'Key takeaways',
      body: String.raw`- **Chen & Chen (1995)**: for continuous non-polynomial $\sigma$, compact $V \subset C(K_1)$ and continuous $\mathcal{G}: V \to C(K_2)$, branch × trunk sums $\sum_k b_k(u)\,t_k(y)$ are dense — uniformly over $u \in V$ and $y \in K_2$.
- The architecture *is* the theorem: branch reads $m$ fixed sensor values, trunk reads the query point $y$, output is their dot product — so the output is a function, evaluable anywhere in $K_2$.
- "Not a polynomial" is sharp: a polynomial activation leaves you inside a fixed finite-dimensional span.
- Compactness of $V$ is what makes finitely many sensors enough. It is also the mathematical version of "stay inside your training distribution".
- It is an **existence** theorem with **no rate**, and it says nothing about optimisation, data requirements or generalisation. DeepONet's practical performance is an empirical result that does not follow from it.
- Rates came later and cost assumptions: a trunk basis that does not depend on $u$ is a linear reconstruction, and for outputs with slowly decaying $N$-widths (e.g. moving discontinuities) it converges slowly (Lanthaler et al., 2023).
- Next: [DeepONet](@math/deeponet), the architecture this theorem suggested.`,
    },
  ],
  references: [
    { authors: 'T. Chen, H. Chen', title: 'Universal approximation to nonlinear operators by neural networks with arbitrary activation functions and its application to dynamical systems', year: 1995, venue: 'IEEE Transactions on Neural Networks 6(4), 911–917' },
    { authors: 'M. Leshno, V. Y. Lin, A. Pinkus, S. Schocken', title: 'Multilayer feedforward networks with a nonpolynomial activation function can approximate any function', year: 1993, venue: 'Neural Networks 6(6), 861–867' },
    { authors: 'L. Lu, P. Jin, G. Pang, Z. Zhang, G. E. Karniadakis', title: 'Learning nonlinear operators via DeepONet based on the universal approximation theorem of operators', year: 2021, venue: 'Nature Machine Intelligence 3, 218–229' },
    { authors: 'S. Lanthaler, S. Mishra, G. E. Karniadakis', title: 'Error estimates for DeepONets: a deep learning framework in infinite dimensions', year: 2022, venue: 'Transactions of Mathematics and Its Applications 6(1), tnac001' },
    { authors: 'S. Lanthaler, R. Molinaro, P. Hadorn, S. Mishra', title: 'Nonlinear reconstruction for operator learning of PDEs with discontinuities', year: 2023, venue: 'ICLR 2023 (arXiv:2210.01074)' },
    { authors: 'N. Kovachki, S. Lanthaler, S. Mishra', title: 'On universal approximation and error bounds for Fourier Neural Operators', year: 2021, venue: 'Journal of Machine Learning Research 22(290), 1–76' },
  ],
} satisfies LessonContent;
