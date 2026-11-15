import type { LessonContent } from '../../types';

// Lifting → T kernel-integral layers → projection.
const stackSvg = `<svg viewBox="0 0 320 196" xmlns="http://www.w3.org/2000/svg" font-family="inherit">
  <defs><marker id="nar" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="var(--muted)"/></marker></defs>
  <text x="160" y="12" font-size="9.5" text-anchor="middle" fill="var(--fg)">a neural operator is a sandwich</text>

  <text x="24" y="40" font-size="8" text-anchor="middle" fill="var(--c3)">a(x)</text>
  <path d="M10,56 C16,42 22,62 30,48 C34,42 38,52 40,50" fill="none" stroke="var(--c3)" stroke-width="1.4"/>
  <text x="24" y="72" font-size="7" text-anchor="middle" fill="var(--muted)">1 channel</text>
  <path d="M44,52 L58,52" stroke="var(--muted)" stroke-width="0.9" marker-end="url(#nar)"/>
  <rect x="60" y="38" width="30" height="30" rx="4" fill="var(--surface)" stroke="var(--c3)"/>
  <text x="75" y="57" font-size="10" text-anchor="middle" fill="var(--fg)">P</text>
  <text x="75" y="80" font-size="7" text-anchor="middle" fill="var(--muted)">lift,</text>
  <text x="75" y="89" font-size="7" text-anchor="middle" fill="var(--muted)">pointwise</text>
  <path d="M92,52 L106,52" stroke="var(--muted)" stroke-width="0.9" marker-end="url(#nar)"/>

  <rect x="108" y="32" width="104" height="42" rx="5" fill="none" stroke="var(--c2)" stroke-width="1.1"/>
  <text x="160" y="47" font-size="8.5" text-anchor="middle" fill="var(--c2)">T kernel layers</text>
  <text x="160" y="60" font-size="7.5" text-anchor="middle" fill="var(--fg)">v ↦ σ(Wv + 𝒦v + b)</text>
  <text x="160" y="70" font-size="7" text-anchor="middle" fill="var(--muted)">d_v channels throughout</text>
  <path d="M214,52 L228,52" stroke="var(--muted)" stroke-width="0.9" marker-end="url(#nar)"/>
  <rect x="230" y="38" width="30" height="30" rx="4" fill="var(--surface)" stroke="var(--c1)"/>
  <text x="245" y="57" font-size="10" text-anchor="middle" fill="var(--fg)">Q</text>
  <text x="245" y="80" font-size="7" text-anchor="middle" fill="var(--muted)">project,</text>
  <text x="245" y="89" font-size="7" text-anchor="middle" fill="var(--muted)">pointwise</text>
  <path d="M262,52 L276,52" stroke="var(--muted)" stroke-width="0.9" marker-end="url(#nar)"/>
  <path d="M280,58 C286,44 292,64 300,50 C304,44 308,54 312,50" fill="none" stroke="var(--c1)" stroke-width="1.6">
    <animate attributeName="stroke-dasharray" values="0 90;90 0" dur="2.6s" repeatCount="indefinite"/>
  </path>
  <text x="296" y="40" font-size="8" text-anchor="middle" fill="var(--c1)">u(x)</text>

  <text x="14" y="112" font-size="8.5" fill="var(--fg)">inside one layer, at a point x:</text>
  <circle cx="40" cy="146" r="5" fill="var(--c2)"/>
  <text x="40" y="164" font-size="7.5" text-anchor="middle" fill="var(--muted)">x</text>
  <text x="62" y="134" font-size="8" fill="var(--c4)">W v(x)</text>
  <text x="62" y="145" font-size="7" fill="var(--muted)">local: this point only</text>
  ${Array.from({ length: 11 }, (_, i) => `<line x1="40" y1="146" x2="${150 + (i % 4) * 36}" y2="${118 + Math.floor(i / 4) * 20}" stroke="var(--c6)" stroke-width="0.4" opacity="0.6"/>`).join('')}
  ${Array.from({ length: 11 }, (_, i) => `<circle cx="${150 + (i % 4) * 36}" cy="${118 + Math.floor(i / 4) * 20}" r="2" fill="var(--c6)"/>`).join('')}
  <text x="150" y="174" font-size="8" fill="var(--c6)">∫ κθ(x, y) v(y) dy — every y in the domain</text>
  <text x="14" y="190" font-size="7.5" fill="var(--muted)">κθ is a function of coordinates, so the same weights work on any grid; the sum over y is just quadrature</text>
</svg>`;

export default {
  cards: [
    {
      kind: 'explain',
      title: 'Steal the answer from the linear case',
      body: String.raw`For a *linear* PDE $L u = f$ we already know what the solution operator looks like, exactly:

$$u(x) = \int_D G(x, y)\, f(y)\, dy.$$

No approximation, no network: the solution operator **is** an integral against the [Green's function](@math/greens-functions). If someone asked you to design a layer that could represent a solution operator, this is the answer you would copy.

Two obstacles. First, $G$ is known in closed form only for simple domains and constant coefficients. Second, most interesting problems are nonlinear, and then no single $G$ exists.

Neural operators (Li et al. 2020–21; Kovachki et al., JMLR 2023) fix both the same way: **learn** the kernel, and **stack** the layers with a nonlinearity in between.`,
    },
    {
      kind: 'recall',
      title: 'Green’s functions',
      points: [
        String.raw`$G(\cdot, y)$ is the response to a unit point source: $L\,G(\cdot, y) = \delta(\cdot - y)$, plus boundary conditions.`,
        String.raw`Superposition gives $u(x) = \int G(x,y) f(y)\,dy$ — the continuous analogue of multiplying by $A^{-1}$.`,
        String.raw`On all of $\mathbb{R}^n$ with constant coefficients, $G$ depends only on $x - y$, so the integral is a **convolution**.`,
        String.raw`$G$ depends on the domain, the boundary conditions and the coefficients — change any of them and you need a new $G$.`,
      ],
      link: 'math/greens-functions',
    },
    {
      kind: 'explain',
      title: 'Where the coefficient enters',
      body: String.raw`Return to Darcy flow, $-\nabla\cdot(a\nabla u) = f$, and suppose $f$ is fixed while $a$ varies. For each $a$ the problem is linear in $u$, so it has a Green's function — but one that depends on $a$:

$$u(x) = \int_D G_a(x, y)\, f(y)\, dy.$$

The map $a \mapsto u$ is nonlinear precisely because $a \mapsto G_a$ is. So a useful learned kernel should be allowed to depend on the input field as well as on position:

$$\kappa_\phi\big(x,\ y,\ a(x),\ a(y)\big).$$

That is the kernel in Li et al.'s graph neural operator, and it is a direct transcription of "the Green's function depends on the coefficient". Everything else in the framework is bookkeeping around this object.`,
    },
    {
      kind: 'explain',
      title: 'The architecture',
      body: String.raw`A neural operator is three stages.

1. **Lift.** A pointwise map $P$ (a shared little MLP, applied at each $x$ independently) sends the input $a(x)$ — one or a few numbers — to a vector $v_0(x) \in \mathbb{R}^{d_v}$ of $d_v$ **channels**, typically $d_v \sim 20$–$100$. Exactly the role of the hidden width in an ordinary network.
2. **Iterate.** For $t = 0, \dots, T-1$,
   $$v_{t+1}(x) \;=\; \sigma\Big(\underbrace{W_t\,v_t(x)}_{\text{local}} \;+\; \underbrace{\int_D \kappa_{\phi_t}(x,y)\,v_t(y)\,dy}_{\text{global}} \;+\; b_t(x)\Big).$$
   $W_t$ is a $d_v \times d_v$ matrix applied pointwise, $\kappa_{\phi_t}$ is the learned kernel, $\sigma$ is a pointwise nonlinearity such as GELU. Usually $T$ is 4–8.
3. **Project.** A pointwise map $Q$ sends $v_T(x)$ back to the output $u(x)$.

Only step 2 moves information between points. $P$, $Q$ and $W_t$ are all local.`,
      widget: { type: 'SvgDiagram', props: { svg: stackSvg } },
    },
    {
      kind: 'mcq',
      prompt: String.raw`Why is the pointwise term $W_t\,v_t(x)$ included, when the kernel integral is the expressive part?`,
      choices: [
        'It is a residual-style local path: it preserves pointwise information that the smoothing integral loses, and keeps gradients flowing through the stack.',
        'Without it the layer would not be linear.',
        'It makes the layer discretisation-invariant; the integral alone is not.',
        'It is required for the universal approximation proof to go through.',
      ],
      answer: 0,
      why: String.raw`Integral operators with nice kernels are smoothing — they damp exactly the high-frequency detail that a local, full-rank matrix multiply retains. In the FNO this becomes essential, because the spectral path deletes modes above $k_{\max}$ outright and the $W$ path is the only thing left carrying them. Discretisation invariance comes from $\kappa$ being a function of coordinates, and holds with or without $W$.`,
    },
    {
      kind: 'explain',
      title: 'Why this is discretisation-invariant',
      body: String.raw`Look at what the parameters are. $\phi_t$ parametrises a **function** $\kappa_{\phi_t}(x,y)$ of continuous coordinates. $W_t$, $P$ and $Q$ are small matrices acting on channels, at a point. None of them has a shape that mentions the grid.

So the layer is defined on functions. To compute it you must approximate the integral, and *any* quadrature will do:

$$\int_D \kappa_\phi(x,y)v(y)\,dy \;\approx\; \sum_{j=1}^{N} w_j\,\kappa_\phi(x, y_j)\,v(y_j),$$

a uniform grid with $w_j = |D|/N$, a Monte Carlo sample, a finite-element mesh, scattered sensors. Refine the point set and the sum converges to the integral. That is the entire argument, and it is why the same trained $\phi$ transfers to a finer grid: the discretisation lives in the quadrature, not in the parameters. This is a statement about the *model's* limit: it needs a kernel regular enough for the quadrature to converge, and it does not say the transferred model is accurate on the finer grid.

Compare a [CNN](@ml/cnns), whose $3\times3$ kernel has nine numbers attached to nine *grid offsets*. Halve the grid spacing and those nine numbers now describe a physically smaller stencil. The weights mean something different; the network has not transferred, it has been reinterpreted.`,
    },
    {
      kind: 'widget',
      title: 'Local stencil versus global kernel',
      body: String.raw`This is an ordinary convolution: a $3\times3$ kernel sliding over an image. Everything it computes at a pixel comes from that pixel and its eight neighbours. Its nine weights are indexed by grid offsets, so they only mean anything relative to a fixed spacing — and the receptive field grows only one ring per layer.

A kernel integral layer is the opposite extreme: every output point sees *every* input point in one shot, weighted by $\kappa_\phi(x,y)$ evaluated at real coordinates. For elliptic problems that is the physically right structure, because a Green's function has global support: squeeze the permeability anywhere and the pressure changes everywhere.

The price is that the global version costs $O(N^2)$ work per layer, which the next card is about.`,
      widget: { type: 'MlConvKernel', props: { image: 'edge', kernel: 'blur', padding: 1 } },
    },
    {
      kind: 'truefalse',
      prompt: String.raw`Suppose the kernel $\kappa$ does not depend on the input field, $P$ and $Q$ are linear, and every $\sigma$ is the identity. Then a stack of kernel-integral layers could still represent a nonlinear operator.`,
      answer: false,
      why: String.raw`Under those assumptions each layer is $v \mapsto Wv + \mathcal{K}v + b$, an affine operator, and composing affine operators gives an affine operator — the composite kernel is just the iterated integral of the individual ones. Depth would buy nothing but a different linear map. The pointwise nonlinearity between integrals is one source of nonlinearity that makes depth meaningful, exactly as in an ordinary network. (A kernel that depends on $a(x), a(y)$, or nonlinear $P$ and $Q$, would be others; they are excluded here.)`,
    },
    {
      kind: 'explain',
      title: 'The $O(N^2)$ problem, and four escapes',
      body: String.raw`Evaluated naively on $N$ points, one kernel layer costs $N^2$ kernel evaluations. On a $64\times64$ grid that is already about $1.7\times10^7$ per layer per channel pair; on $256\times256$ it is $4\times10^9$. Unusable.

Every practical neural operator is a way of not doing that sum. Kovachki et al. organise them:

- **Graph neural operator (GNO).** Truncate $\kappa$ to a ball $|x-y| \le r$ and Nyström-subsample the points: a message-passing graph network. Cost $O(N k)$ with $k$ neighbours. Handles arbitrary geometry; local support hurts for elliptic problems.
- **Low-rank (LNO).** Force $\kappa(x,y) = \sum_{r=1}^{R}\psi_r(x)\varphi_r(y)$. Then the integral is $R$ inner products, $O(NR)$. This is a separable kernel — and note it makes the layer's reconstruction linear in the same way a DeepONet trunk is.
- **Multipole / multilevel (MGNO).** Borrow the fast multipole idea: near interactions exactly, far interactions through a coarse hierarchy. $O(N)$.
- **Fourier (FNO).** Assume $\kappa(x,y) = \kappa(x-y)$, so the integral is a convolution, and do it by FFT. $O(N\log N)$, and the subject of the [next lesson](@math/fourier-neural-operator).`,
    },
    {
      kind: 'numeric',
      prompt: String.raw`A kernel layer is evaluated by direct quadrature on a $64 \times 64$ grid. How many kernel evaluations $\kappa_\phi(x_i, y_j)$ does one layer need?`,
      answer: 16777216,
      tolerance: 1,
      why: String.raw`$N = 64^2 = 4096$ points, and every output point sums over every input point, so $N^2 = 4096^2 = 16{,}777{,}216$. By comparison an FFT-based layer costs on the order of $N\log_2 N = 4096 \times 12 \approx 49{,}000$ — about 340 times less, and the gap widens with $N$.`,
    },
    {
      kind: 'match',
      prompt: 'Match each neural-operator variant with the structural assumption that makes it fast.',
      pairs: [
        ['Graph neural operator', String.raw`the kernel is truncated to a ball $|x-y|\le r$`],
        ['Low-rank neural operator', String.raw`$\kappa(x,y) = \sum_r \psi_r(x)\varphi_r(y)$, a sum of $R$ separable terms`],
        ['Multipole neural operator', 'far-field interactions are handled on coarse levels of a hierarchy'],
        ['Fourier neural operator', String.raw`$\kappa(x,y) = \kappa(x-y)$, so the integral is a convolution`],
        ['Direct quadrature', 'no assumption at all — and quadratic cost'],
      ],
      why: String.raw`Each variant trades a different piece of generality for speed: locality, rank, scale separation or translation invariance. Knowing which assumption you have bought tells you where the method will fail — a truncated kernel on an elliptic problem, for instance, cannot transmit a global pressure response.`,
    },
    {
      kind: 'order',
      prompt: 'Order the derivation of a kernel-integral layer from the Green’s-function picture.',
      steps: [
        String.raw`For a linear problem, write the exact solution operator $u(x) = \int G(x,y) f(y)\,dy$.`,
        String.raw`Note that for a parametric family the kernel depends on the input field, $G = G_a$, which is where nonlinearity in $a$ comes from.`,
        String.raw`Replace the unknown $G_a$ by a learned kernel $\kappa_\phi(x,y,a(x),a(y))$.`,
        String.raw`Add a pointwise linear term and a bias so the layer keeps local, high-frequency information.`,
        String.raw`Apply a pointwise nonlinearity and stack $T$ such layers, between a lifting $P$ and a projection $Q$.`,
      ],
      why: String.raw`Each step adds exactly one thing the previous one lacked: superposition gives the integral form, parametric dependence makes it nonlinear, learning removes the need for a closed-form $G$, the local term restores what smoothing destroys, and the nonlinearity makes depth worth having.`,
    },
    {
      kind: 'multi',
      prompt: 'Which properties does the kernel-integral framework have?',
      choices: [
        'The parameter count is independent of the number of grid points.',
        'The same trained weights can be applied to a point cloud that is not a regular grid.',
        'Each layer propagates information globally across the domain in one step.',
        'It guarantees the learned operator satisfies the PDE exactly.',
        'Direct evaluation of the integral is cheap on fine grids.',
      ],
      answers: [0, 1, 2],
      why: String.raw`Parameters describe $\kappa_\phi$ as a function of coordinates, so they do not scale with $N$ and the quadrature can use any point set — that is the whole appeal, and the global reach per layer is what distinguishes it from a convolution. Nothing enforces the PDE unless you add a residual loss, and direct quadrature is $O(N^2)$, which is why the fast variants exist.`,
    },
    {
      kind: 'fill',
      prompt: String.raw`A kernel-integral layer replaces the Green's function by a learned ___, adds a pointwise ___ term plus a bias, and applies a ___ so that stacking layers is worth doing. The parameters describe a function of ___, which is why the layer transfers between grids.`,
      bank: ['kernel', 'linear', 'nonlinearity', 'coordinates', 'matrix', 'quadratic', 'normalisation', 'channels'],
      answer: ['kernel', 'linear', 'nonlinearity', 'coordinates'],
      why: String.raw`The kernel carries the global structure, the pointwise linear term carries what smoothing destroys, the nonlinearity makes depth non-trivial, and parametrising by continuous coordinates — rather than by grid offsets — is precisely what a CNN does not do.`,
    },
    {
      kind: 'explain',
      title: 'Key takeaways',
      body: String.raw`- The exact solution operator of a linear PDE is an integral against a **Green's function**. A kernel-integral layer is that formula with $G$ replaced by a learned $\kappa_\phi$.
- For a parametric family the Green's function depends on the input field, $G_a$; letting $\kappa_\phi$ see $a(x)$ and $a(y)$ is how the nonlinearity in $a$ gets in.
- A **neural operator** is: pointwise lifting $P$ to $d_v$ channels $\to$ $T$ layers $v \mapsto \sigma(Wv + \mathcal{K}v + b)$ $\to$ pointwise projection $Q$.
- $\kappa_\phi$ is a function of continuous coordinates, so the parameters never mention the grid; the discretisation is only a **quadrature rule**, and refining it converges. That is the invariance.
- The local $W$ path matters: integral operators smooth, and $W$ keeps the high-frequency, pointwise content.
- Direct quadrature is $O(N^2)$. Graph truncation, low rank, multipole and Fourier are four ways out — each buying speed with a structural assumption.
- Next: the Fourier route, [FNO](@math/fourier-neural-operator).`,
    },
  ],
  references: [
    { authors: 'N. Kovachki, Z. Li, B. Liu, K. Azizzadenesheli, K. Bhattacharya, A. Stuart, A. Anandkumar', title: 'Neural Operator: Learning Maps Between Function Spaces with Applications to PDEs', year: 2023, venue: 'Journal of Machine Learning Research 24(89), 1–97', detail: '§4 (kernel integral operators and the GNO / LNO / MGNO / FNO family)' },
    { authors: 'Z. Li, N. Kovachki, K. Azizzadenesheli, B. Liu, K. Bhattacharya, A. Stuart, A. Anandkumar', title: 'Neural Operator: Graph Kernel Network for Partial Differential Equations', year: 2020, venue: 'arXiv:2003.03485', url: 'https://arxiv.org/abs/2003.03485' },
    { authors: 'Z. Li, N. Kovachki, K. Azizzadenesheli, B. Liu, K. Bhattacharya, A. Stuart, A. Anandkumar', title: 'Multipole Graph Neural Operator for Parametric Partial Differential Equations', year: 2020, venue: 'Advances in Neural Information Processing Systems 33' },
    { authors: 'L. C. Evans', title: 'Partial Differential Equations', year: 2010, venue: '2nd ed., AMS Graduate Studies in Mathematics 19', detail: '§2.2 (fundamental solutions and Green’s functions)' },
    { authors: 'K. Bhattacharya, B. Hosseini, N. B. Kovachki, A. M. Stuart', title: 'Model Reduction and Neural Networks for Parametric PDEs', year: 2021, venue: 'SMAI Journal of Computational Mathematics 7, 121–157' },
  ],
} satisfies LessonContent;
