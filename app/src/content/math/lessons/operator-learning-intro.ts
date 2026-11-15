import type { LessonContent } from '../../types';

// Grid-regression surrogate vs operator surrogate: what each one actually consumes and produces.
const shapesSvg = `<svg viewBox="0 0 320 210" xmlns="http://www.w3.org/2000/svg" font-family="inherit">
  <text x="160" y="12" font-size="9.5" text-anchor="middle" fill="var(--fg)">the same task, two different objects to learn</text>

  <rect x="8" y="22" width="304" height="78" rx="5" fill="none" stroke="var(--c3)" stroke-width="0.9"/>
  <text x="16" y="36" font-size="9" fill="var(--c3)">grid regression (CNN surrogate)</text>
  <rect x="18" y="44" width="58" height="46" fill="none" stroke="var(--grid)"/>
  ${Array.from({ length: 5 }, (_, i) => `<line x1="${18 + i * 14.5}" y1="44" x2="${18 + i * 14.5}" y2="90" stroke="var(--grid)" stroke-width="0.5"/>`).join('')}
  ${Array.from({ length: 4 }, (_, j) => `<line x1="18" y1="${44 + j * 15.3}" x2="76" y2="${44 + j * 15.3}" stroke="var(--grid)" stroke-width="0.5"/>`).join('')}
  <text x="47" y="99" font-size="7.5" text-anchor="middle" fill="var(--muted)">64×64 array</text>
  <text x="92" y="70" font-size="12" fill="var(--muted)">→</text>
  <rect x="108" y="48" width="80" height="38" rx="4" fill="var(--surface)" stroke="var(--c3)"/>
  <text x="148" y="66" font-size="8" text-anchor="middle" fill="var(--fg)">fixed-shape net</text>
  <text x="148" y="78" font-size="7.5" text-anchor="middle" fill="var(--muted)">4096 in, 4096 out</text>
  <text x="200" y="70" font-size="12" fill="var(--muted)">→</text>
  <rect x="216" y="44" width="58" height="46" fill="none" stroke="var(--grid)"/>
  ${Array.from({ length: 5 }, (_, i) => `<line x1="${216 + i * 14.5}" y1="44" x2="${216 + i * 14.5}" y2="90" stroke="var(--grid)" stroke-width="0.5"/>`).join('')}
  ${Array.from({ length: 4 }, (_, j) => `<line x1="216" y1="${44 + j * 15.3}" x2="274" y2="${44 + j * 15.3}" stroke="var(--grid)" stroke-width="0.5"/>`).join('')}
  <text x="245" y="99" font-size="7.5" text-anchor="middle" fill="var(--c5)">64×64 — and only that</text>

  <rect x="8" y="110" width="304" height="92" rx="5" fill="none" stroke="var(--c2)" stroke-width="0.9"/>
  <text x="16" y="124" font-size="9" fill="var(--c2)">operator learning</text>
  <path d="M18,176 C30,142 44,186 58,152 C68,130 72,166 76,160" fill="none" stroke="var(--c4)" stroke-width="1.6"/>
  <text x="47" y="190" font-size="7.5" text-anchor="middle" fill="var(--muted)">a function a(x)</text>
  <text x="92" y="162" font-size="12" fill="var(--muted)">→</text>
  <rect x="108" y="142" width="80" height="38" rx="4" fill="var(--surface)" stroke="var(--c2)"/>
  <text x="148" y="158" font-size="8" text-anchor="middle" fill="var(--fg)">operator 𝒢θ</text>
  <text x="148" y="170" font-size="7.5" text-anchor="middle" fill="var(--muted)">weights independent of N</text>
  <text x="200" y="162" font-size="12" fill="var(--muted)">→</text>
  <path d="M216,170 C230,150 242,176 256,154 C266,140 270,160 274,156" fill="none" stroke="var(--c1)" stroke-width="1.8">
    <animate attributeName="stroke-dasharray" values="0 200;200 0" dur="3s" repeatCount="indefinite"/>
  </path>
  <text x="245" y="190" font-size="7.5" text-anchor="middle" fill="var(--c1)">a function u(x) — ask for any x</text>
</svg>`;

export default {
  cards: [
    {
      kind: 'explain',
      title: 'The solver you have to run ten thousand times',
      body: String.raw`A groundwater engineer has one PDE — Darcy's law — and ten thousand different rock permeability maps. An aerodynamicist has one Navier–Stokes solver and a catalogue of wing shapes. A seismologist inverts for the earth's structure by running the wave equation again and again.

In each case the *equation* never changes. What changes is an input **field**: a coefficient, an initial condition, a forcing, a boundary shape. Each run of a classical solver throws away everything it learned from the previous run.

The idea of **operator learning** is to spend that effort once: learn the map

$$\mathcal{G} : \underbrace{a}_{\text{input field}} \ \longmapsto \ \underbrace{u}_{\text{solution field}}$$

from a few thousand solved examples, then evaluate it in milliseconds for every new $a$.`,
    },
    {
      kind: 'recall',
      title: 'Operators, from functional analysis',
      points: [
        String.raw`An **operator** is a map between spaces of *functions*, e.g. $L^2(D) \to L^2(D)$, not between lists of numbers.`,
        String.raw`A linear operator is **bounded** iff $\|Tv\| \le C\|v\|$, iff it is continuous; $\|T\|$ is the worst stretch it applies.`,
        String.raw`**Integral operators** $(Tv)(x) = \int K(x,y)v(y)\,dy$ are the continuous analogue of matrix–vector products. They will reappear as the layers of a neural operator.`,
        String.raw`Compact operators smooth: they damp high frequencies hard, which is why solution maps of elliptic PDEs are easier to approximate than they look.`,
      ],
      link: 'math/bounded-operators',
    },
    {
      kind: 'explain',
      title: 'A concrete solution operator',
      body: String.raw`Take steady **Darcy flow** on the unit square $D$: given a permeability field $a(x) > 0$ and a fixed forcing $f$, solve

$$-\nabla\cdot\big(a(x)\,\nabla u(x)\big) = f(x) \ \text{ in } D, \qquad u = 0 \text{ on } \partial D.$$

For each $a$ there is exactly one $u$. So there is a genuine map $\mathcal{G}: a \mapsto u$ from one space of functions to another. Three things to notice:

- $\mathcal{G}$ is **nonlinear** in $a$, even though the PDE is linear in $u$. Doubling $a$ halves $u$.
- $\mathcal{G}$ is defined on *functions*, before any grid is chosen.
- A classical solver is one particular way of computing $\mathcal{G}$, accurate but slow.

Operator learning fits a parametric family $\mathcal{G}_\theta \approx \mathcal{G}$ to pairs $(a_i, u_i)$ produced by that solver.`,
    },
    {
      kind: 'mcq',
      prompt: String.raw`For the [heat equation](@math/pde-heat-equation) $u_t = k u_{xx}$ on a rod with ends held at zero, which map is the *solution operator* that an operator-learning method would target?`,
      choices: [
        String.raw`initial profile $u_0(\cdot)$ $\mapsto$ the profile $u(\cdot, T)$ at a fixed later time $T$`,
        String.raw`the diffusivity $k$ $\mapsto$ the number $u(0.5, T)$`,
        String.raw`the grid spacing $h$ $\mapsto$ the discretisation error`,
        String.raw`the pair $(x, t)$ $\mapsto$ the number $u(x, t)$ for one fixed initial condition`,
      ],
      answer: 0,
      why: String.raw`An operator takes a *function* in and gives a *function* out, so "initial profile to later profile" is the only choice of that shape. Mapping $(x,t)$ to a number is what a plain neural network — or a PINN — does for a *single* problem instance: change the initial condition and you must retrain. Mapping a scalar to a scalar is ordinary regression.`,
    },
    {
      kind: 'widget',
      title: 'An operator you already know',
      body: String.raw`The heat equation's solution operator $S_T : u_0 \mapsto u(\cdot, T)$ is linear, and in the sine basis it is diagonal: the mode $\sin(nx)$ is multiplied by $e^{-k n^2 T}$. Watch the bars. High modes are crushed, so $S_T$ maps wildly different inputs to outputs that look alike.

That smoothing is good news for learning: the output lives, to a good approximation, in a low-dimensional space, so a network with a modest number of parameters has a chance. It is also bad news in disguise — recovering $u_0$ from $u(\cdot,T)$ is the famously ill-posed backwards heat problem, and *that* operator no network can learn stably.`,
      widget: { type: 'MathHeatModes', props: { initial: 'box', D: 1 } },
    },
    {
      kind: 'explain',
      title: 'Why not just train a CNN on the grid?',
      body: String.raw`The obvious surrogate: discretise $a$ on a $64\times64$ grid, discretise $u$ on the same grid, and train a [convolutional network](@ml/cnns) from one array to the other. People do this and it often works.

But that network has learned a map $\mathbb{R}^{4096} \to \mathbb{R}^{4096}$. It is welded to that grid:

- Hand it a $128\times128$ field and the input layer does not fit. Even "fully convolutional" versions change meaning, because a $3\times3$ kernel covers half the physical distance it used to.
- Its output exists only at those 4096 pixels. Want the solution at a point between them? Interpolate, and inherit the interpolation error.
- Refine the grid and you must regenerate data and retrain from scratch.

An operator, by contrast, is a map between function spaces. If a method is a real approximation of one, the grid should be an implementation detail.`,
      widget: { type: 'SvgDiagram', props: { svg: shapesSvg } },
    },
    {
      kind: 'explain',
      title: 'Discretisation invariance, stated carefully',
      body: String.raw`Let $\mathcal{G}_\theta$ be a trained model and let $\mathcal{P}_N$ denote "sample a function at $N$ points". The model is **discretisation-invariant** when the *same parameters* $\theta$ define a map on functions, and

$$\mathcal{G}_\theta^{(N)}(\mathcal{P}_N a) \ \longrightarrow\ \mathcal{G}_\theta(a) \qquad \text{as } N \to \infty,$$

with no retraining, no change in the number of parameters, and a limit that does not depend on *which* sequence of grids you used (Kovachki et al., JMLR 2023, call this *discretisation convergence*).

Two consequences worth separating:

1. **Zero-shot evaluation on a finer grid.** Train at one resolution, deploy at another.
2. **The parameter count is set by the architecture, not by $N$.** A spectral layer keeping $k_{\max}$ modes has a fixed budget of weights whether $N$ is 32 or 32,000.

It is not a claim of *accuracy* at any resolution — only that refining the grid converges to something, and converges to the model's own answer.`,
    },
    {
      kind: 'widget',
      title: 'Same weights, finer grid',
      body: String.raw`The target is the solution operator of $-u'' = f$ on a periodic interval. Blue is a spectral operator layer: it reads the $N$ samples, keeps $k_{\max}$ modes, reweights them and returns a **function**. Orange is a stand-in for a grid surrogate trained on a fixed mesh.

Drag $N$ upward. The blue curve stops moving — the same weights, a finer grid, the same answer, and the error readout confirms it. The orange curve never improves: its error is the interpolation error of the mesh it was born on.

Now drag $N$ *down*. Below about $N=13$ the blue curve starts to move and the drift readout becomes non-zero. The forcing here has content up to $k=7$, and a mode folds onto a kept one unless $N > 7 + k_{\max}$ (only when the input is band-limited to $k_{\max}$ does the familiar $2k_{\max}+1$ suffice). Discretisation invariance is a statement about refining, not about any grid whatsoever: samples too sparse to resolve the input alias high frequencies onto low ones.`,
      widget: { type: 'MathResolutionTransfer', props: { n: 9, kmax: 5, nTrain: 9 } },
    },
    {
      kind: 'truefalse',
      prompt: String.raw`If a model is discretisation-invariant, then training it on a coarse grid and evaluating on a fine one will give at least as accurate an answer as the coarse evaluation.`,
      answer: false,
      why: String.raw`Invariance says the fine-grid output *converges to the model's own answer*, not that the answer is right. Anything the coarse training data never contained — a boundary layer, a shock, features above the resolved band — is simply absent from what the model learned, and evaluating on a finer grid produces a smooth, confident, wrong picture of it. Accuracy at high resolution has to be measured against high-resolution truth, not assumed.`,
    },
    {
      kind: 'match',
      prompt: 'Match each object with what it actually is.',
      pairs: [
        [String.raw`$a \mapsto u$ for Darcy flow`, String.raw`a nonlinear operator between function spaces`],
        [String.raw`$u_0 \mapsto u(\cdot, T)$ for the heat equation`, String.raw`a linear, compact, smoothing operator`],
        [String.raw`A CNN trained on $64\times64$ fields`, String.raw`a map $\mathbb{R}^{4096}\to\mathbb{R}^{4096}$ tied to one grid`],
        [String.raw`A PINN fitted to one initial condition`, String.raw`an approximation of a single function $u(x,t)$`],
        [String.raw`A Green's function $G(x,y)$`, String.raw`the kernel of a linear solution operator`],
      ],
      why: String.raw`The first two are the targets of operator learning; the next two are objects of lower ambition — a fixed-grid regression and a single solution. The Green's function is the classical case where the operator is known in closed form, which is exactly the template the kernel layers of a [neural operator](@math/neural-operator-framework) imitate.`,
    },
    {
      kind: 'explain',
      title: 'Amortisation: the real economic argument',
      body: String.raw`Operator learning is almost never cheaper for *one* solve. Training needs a dataset, and every example in that dataset is produced by the classical solver you were trying to avoid.

The honest accounting for $Q$ queries:

$$\text{classical} = Q\,T_{\text{solve}}, \qquad \text{learned} = \underbrace{N_{\text{train}}T_{\text{solve}}}_{\text{data}} + \underbrace{T_{\text{fit}}}_{\text{training}} + Q\,T_{\text{infer}}.$$

So the method pays off only in the **many-query** regime: uncertainty quantification over thousands of samples, Bayesian inversion, design optimisation, real-time control. Reported "1000× speedups" are almost always $T_{\text{solve}}/T_{\text{infer}}$ with the first two terms left out of the picture. We will come back to this honestly in [practice](@math/operator-learning-practice).`,
    },
    {
      kind: 'numeric',
      prompt: String.raw`A classical solve takes 60 s. Training a surrogate needs 2000 solved examples plus 14,400 s of fitting, and each learned inference takes 0.05 s. How many queries $Q$ must you make before the learned route is cheaper in total? Give $Q$ to the nearest whole query.`,
      answer: 2242,
      tolerance: 50,
      unit: 'queries',
      why: String.raw`Set $60Q = 2000(60) + 14{,}400 + 0.05Q$, i.e. $59.95\,Q = 134{,}400$, so $Q \approx 2242$. Note what dominates: the 120,000 s of data generation is eight times the fitting cost. Quoting the speedup as $60/0.05 = 1200\times$ is true only for queries beyond the break-even point.`,
    },
    {
      kind: 'explain',
      title: 'Two families, one unit',
      body: String.raw`Two designs dominate, and this unit takes each in turn.

**DeepONet** (Lu et al., *Nature Machine Intelligence*, 2021). Read the input function at $m$ fixed **sensor** locations; a *branch* net turns those $m$ numbers into $p$ coefficients; a *trunk* net turns the query point $y$ into $p$ basis values; the output is their dot product. It is backed by an approximation theorem of [Chen & Chen (1995)](@math/operator-universal-approximation).

**Neural operators** (Li et al., ICLR 2021; Kovachki et al., JMLR 2023). Build layers that act on functions directly: a learned **kernel integral** $\int \kappa_\theta(x,y)\,v(y)\,dy$, straight out of the [Green's function](@math/greens-functions) picture, plus a pointwise nonlinearity. Doing that integral by multiplication in [Fourier](@math/fourier-transform) space gives the [FNO](@math/fourier-neural-operator).

They differ most on the *input* side: DeepONet fixes its sensors; an FNO can in principle take any grid.`,
    },
    {
      kind: 'order',
      prompt: 'Put a realistic operator-learning project in order.',
      steps: [
        String.raw`Decide the operator: which input field varies, which output field you need, and over which distribution of inputs.`,
        String.raw`Generate training pairs $(a_i, u_i)$ with a trusted classical solver — usually the dominant cost.`,
        String.raw`Choose an architecture and train $\mathcal{G}_\theta$, typically on a relative $L^2$ loss.`,
        String.raw`Test at a *finer* resolution than you trained on, against high-resolution reference solutions.`,
        String.raw`Test *outside* the training distribution, and report where accuracy collapses.`,
        String.raw`Deploy only in a many-query loop, with the classical solver kept for verification.`,
      ],
      why: String.raw`The distribution of inputs is part of the specification, not an afterthought: a learned operator is only an operator on the data distribution it saw. The fine-resolution test checks the discretisation claim; the out-of-distribution test checks the claim people actually care about, and is the one most often skipped.`,
    },
    {
      kind: 'multi',
      prompt: 'Which situations are a genuinely good fit for operator learning?',
      choices: [
        'Monte Carlo uncertainty quantification over 50,000 random permeability fields of the same statistical family.',
        'A one-off, high-accuracy simulation that will be published as a reference solution.',
        'Real-time inner-loop evaluation inside a shape-optimisation routine.',
        'Extrapolating to inputs far rougher than anything in the training set.',
        'Bayesian inversion where each MCMC step needs one forward solve.',
      ],
      answers: [0, 2, 4],
      why: String.raw`All three good cases are many-query loops over one fixed input distribution, which is exactly what amortisation needs. A single reference solve can never repay the data-generation cost, and "far rougher than the training set" is extrapolation: a learned operator has no mechanism that makes it right there, and it will not tell you it is wrong.`,
    },
    {
      kind: 'fill',
      prompt: String.raw`Operator learning targets a map between ___ spaces rather than between fixed-length vectors. A model is discretisation-___ when the same parameters define a map on functions whose grid outputs converge as $N$ grows. The cost of training is dominated by ___ generation, so the method only pays off in the ___-query regime.`,
      bank: ['function', 'invariant', 'data', 'many', 'metric', 'dependent', 'gradient', 'single'],
      answer: ['function', 'invariant', 'data', 'many'],
      why: String.raw`Those four words are the whole lesson: the object learned is a map between function spaces; the architectural property that makes it more than grid regression is discretisation invariance; the bill is paid in classical solves; and it is repaid only across many queries.`,
    },
    {
      kind: 'explain',
      title: 'Key takeaways',
      body: String.raw`- A **solution operator** maps an input *field* (coefficient, initial condition, forcing) to a solution *field*. Darcy flow's $a \mapsto u$ is nonlinear even though the PDE is linear in $u$.
- A CNN surrogate learns $\mathbb{R}^{N}\to\mathbb{R}^{N}$ and is welded to one grid. **Discretisation invariance** means the same parameters act on functions, so refining the grid converges without retraining and the parameter count does not grow with $N$.
- Invariance is a statement about *convergence*, not accuracy, and it fails below the resolution needed to represent what the model keeps.
- Smoothing operators (elliptic and parabolic solution maps) are the friendly case; their ill-posed inverses are not.
- The economics are amortisation: data generation dominates, so only **many-query** settings pay for themselves.
- Next: the [approximation theorem](@math/operator-universal-approximation) behind DeepONet, then [kernel integral layers](@math/neural-operator-framework).`,
    },
  ],
  references: [
    { authors: 'N. Kovachki, Z. Li, B. Liu, K. Azizzadenesheli, K. Bhattacharya, A. Stuart, A. Anandkumar', title: 'Neural Operator: Learning Maps Between Function Spaces with Applications to PDEs', year: 2023, venue: 'Journal of Machine Learning Research 24(89), 1–97', detail: '§1–2 (operator learning, discretisation invariance)' },
    { authors: 'L. Lu, P. Jin, G. Pang, Z. Zhang, G. E. Karniadakis', title: 'Learning nonlinear operators via DeepONet based on the universal approximation theorem of operators', year: 2021, venue: 'Nature Machine Intelligence 3, 218–229' },
    { authors: 'Z. Li, N. Kovachki, K. Azizzadenesheli, B. Liu, K. Bhattacharya, A. Stuart, A. Anandkumar', title: 'Fourier Neural Operator for Parametric Partial Differential Equations', year: 2021, venue: 'ICLR 2021', url: 'https://arxiv.org/abs/2010.08895' },
    { authors: 'K. Bhattacharya, B. Hosseini, N. B. Kovachki, A. M. Stuart', title: 'Model Reduction and Neural Networks for Parametric PDEs', year: 2021, venue: 'SMAI Journal of Computational Mathematics 7, 121–157' },
    { authors: 'L. C. Evans', title: 'Partial Differential Equations', year: 2010, venue: '2nd ed., AMS Graduate Studies in Mathematics 19', detail: '§6.2 (existence and uniqueness for second-order elliptic equations — the well-posedness behind the Darcy solution operator)' },
  ],
} satisfies LessonContent;
