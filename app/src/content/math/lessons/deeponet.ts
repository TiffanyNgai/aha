import type { LessonContent } from '../../types';

// DeepONet data flow: sensors → branch, query point → trunk, dot product → scalar.
const archSvg = `<svg viewBox="0 0 320 212" xmlns="http://www.w3.org/2000/svg" font-family="inherit">
  <text x="160" y="12" font-size="9.5" text-anchor="middle" fill="var(--fg)">DeepONet: two nets that meet in a dot product</text>

  <text x="14" y="34" font-size="8" fill="var(--c3)">input function u, read at m fixed sensors</text>
  ${Array.from({ length: 7 }, (_, i) => `<circle cx="${20 + i * 11}" cy="46" r="2.6" fill="var(--c3)"/>`).join('')}
  <text x="104" y="49" font-size="8" fill="var(--muted)">u(x₁)…u(x_m)</text>
  <path d="M60,54 L60,66" stroke="var(--muted)" stroke-width="0.9" marker-end="url(#ar)"/>
  <defs><marker id="ar" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="var(--muted)"/></marker></defs>
  <rect x="14" y="68" width="124" height="34" rx="4" fill="var(--surface)" stroke="var(--c3)"/>
  <text x="76" y="82" font-size="8.5" text-anchor="middle" fill="var(--fg)">BRANCH net</text>
  <text x="76" y="94" font-size="7.5" text-anchor="middle" fill="var(--muted)">ℝᵐ → ℝᵖ</text>

  <text x="186" y="34" font-size="8" fill="var(--c4)">query point y — any point you like</text>
  <circle cx="246" cy="46" r="3" fill="var(--c4)"/>
  <text x="256" y="49" font-size="8" fill="var(--muted)">y ∈ K₂</text>
  <path d="M246,54 L246,66" stroke="var(--muted)" stroke-width="0.9" marker-end="url(#ar)"/>
  <rect x="184" y="68" width="124" height="34" rx="4" fill="var(--surface)" stroke="var(--c4)"/>
  <text x="246" y="82" font-size="8.5" text-anchor="middle" fill="var(--fg)">TRUNK net</text>
  <text x="246" y="94" font-size="7.5" text-anchor="middle" fill="var(--muted)">ℝⁿ → ℝᵖ</text>

  <text x="76" y="118" font-size="8" text-anchor="middle" fill="var(--c3)">b₁ … b_p</text>
  <text x="246" y="118" font-size="8" text-anchor="middle" fill="var(--c4)">t₁(y) … t_p(y)</text>
  <path d="M76,124 L140,146" stroke="var(--c3)" stroke-width="0.9"/>
  <path d="M246,124 L182,146" stroke="var(--c4)" stroke-width="0.9"/>
  <rect x="118" y="148" width="86" height="26" rx="13" fill="var(--surface)" stroke="var(--c2)" stroke-width="1.2"/>
  <text x="161" y="165" font-size="9" text-anchor="middle" fill="var(--c2)">Σₖ bₖ tₖ(y) + b₀</text>
  <path d="M161,176 L161,186" stroke="var(--muted)" stroke-width="0.9" marker-end="url(#ar)"/>
  <text x="161" y="196" font-size="8.5" text-anchor="middle" fill="var(--c1)">𝒢θ(u)(y) — one number, for this u and this y</text>
  <text x="161" y="207" font-size="7.5" text-anchor="middle" fill="var(--muted)">sweep y to get the whole output function; the branch runs only once</text>
</svg>`;

export default {
  cards: [
    {
      kind: 'explain',
      title: 'From a 1995 formula to an architecture',
      body: String.raw`[Chen & Chen's theorem](@math/operator-universal-approximation) produces an expression of a very particular shape: a sum of products, where one factor sees only the input function and the other sees only the query point. Lu, Jin, Pang, Zhang & Karniadakis (*Nature Machine Intelligence*, 2021) made two changes and called the result **DeepONet**:

- replace the single hidden layer in each factor by a **deep** network;
- train the whole thing end to end on pairs $(u_i, y, \mathcal{G}(u_i)(y))$.

Everything else is the 1995 formula. The payoff of keeping its shape is that the output is a *function*: evaluate the trunk at any $y$ you want, on a grid or off it.`,
    },
    {
      kind: 'explain',
      title: 'The architecture',
      body: String.raw`Fix $m$ sensor locations $x_1,\dots,x_m$ once and for all. Given an input function $u$:

$$\mathcal{G}_\theta(u)(y) \;=\; \sum_{k=1}^{p} b_k\big(u(x_1),\dots,u(x_m)\big)\;t_k(y)\;+\;b_0 .$$

- The **branch** net maps $\mathbb{R}^m \to \mathbb{R}^p$. It can be an MLP, a CNN over the sensor grid, or anything else — the sensor values are just a vector.
- The **trunk** net maps the query point $y \in \mathbb{R}^n$ to $\mathbb{R}^p$. Lu et al. apply the activation to the trunk's *last* layer too, which matters: without it each $t_k$ would be a purely linear function of the last hidden features, and the basis would be less expressive.
- $b_0$ is a single learned scalar bias, and the paper reports it helps.

The width $p$ plays the role of $N$ in the theorem: it is the number of basis functions the output is expanded in. Typical values are tens to a few hundred.`,
      widget: { type: 'SvgDiagram', props: { svg: archSvg } },
    },
    {
      kind: 'widget',
      title: 'Branch × trunk, made explicit',
      body: String.raw`The target here is the operator Lu et al. use as their running example: the antiderivative $\mathcal{G}(u)(y) = \int_0^y u(s)\,ds$.

The input (left) is read at the orange sensors and nowhere else. The branch turns those numbers into the coefficients $b_1\dots b_p$ (the bars). The trunk supplies the faint purple basis functions $t_k$. Their dot product is the blue output curve, compared with the exact answer in grey.

Raise $p$: more basis functions, lower error. Switch the input to the narrow bump or the kink and watch what happens — those have structure *between* the sensors, which the branch simply cannot see.

In a real DeepONet both $b$ and $t$ are learned networks. Here they are written down in closed form — the branch fits a polynomial to the sensor values and integrates it, the trunk is the monomials $y^k$ — so that you can see the shape of the computation.`,
      widget: { type: 'MathDeepONetDot', props: { fn: 'wave', p: 3, m: 8 } },
    },
    {
      kind: 'mcq',
      prompt: String.raw`You have trained a DeepONet and want the predicted solution at $10{,}000$ query points for one input function $u$. How many times must the **branch** network run?`,
      choices: ['Once.', 'Ten thousand times, once per query point.', 'Once per sensor, so $m$ times.', 'Once per basis function, so $p$ times.'],
      answer: 0,
      why: String.raw`The branch depends only on $u$, so its $p$ coefficients are computed once and reused. Only the trunk runs per query point, followed by a length-$p$ dot product. This is precisely why the separable form is cheap to evaluate densely — and why it can give you the answer at off-grid points for free.`,
    },
    {
      kind: 'explain',
      title: 'Stacked and unstacked',
      body: String.raw`The 1995 formula has $N$ *independent* branch networks, one per term — the weights $\xi_{ij}^k$ carry the index $k$. Lu et al. call this the **stacked** version, and note it is wasteful: the first weight matrix alone has $p\,M\,m$ entries.

The **unstacked** version uses one branch network with $p$ outputs, sharing all hidden layers. It has far fewer parameters, trains faster, and the paper reports smaller generalisation error. Unstacked is what "DeepONet" means in practice.

The theorem does not literally cover the unstacked case, since it was stated with independent branches. This is a mild gap, and a good illustration of the general rule: the theorem guarantees the family is rich enough, and every engineering decision after that is empirical.`,
    },
    {
      kind: 'explain',
      title: 'The trunk is a learned basis — and that is the catch',
      body: String.raw`Rewrite the output as $\mathcal{G}_\theta(u) = \sum_k b_k(u)\,t_k$. The functions $t_k$ do **not** depend on $u$. So every prediction, for every input, lives in the same $p$-dimensional subspace $\mathrm{span}\{t_1,\dots,t_p\}$ of the output space.

That is a linear reconstruction, however nonlinear the branch is. And linear reconstruction has a hard floor: no choice of coefficients can beat the best $p$-dimensional linear approximation of the set of possible outputs, a quantity classical approximation theory calls the **Kolmogorov $p$-width** $d_p$. Lanthaler, Mishra & Karniadakis (2022) analyse DeepONet error through exactly this encoding, approximation and reconstruction split.

For diffusion-type problems, $d_p$ decays fast and $p \approx 50$ is plenty. For transport of a sharp front whose position varies — a moving shock, an advected pulse — $d_p$ decays only about as fast as $p^{-1/2}$ (Lanthaler, Molinaro, Hadorn & Mishra, 2023), and no amount of branch capacity rescues it.`,
    },
    {
      kind: 'widget',
      title: 'The floor you cannot train away',
      body: String.raw`Here is the same phenomenon in miniature: a target function projected onto the first $N$ elements of a *fixed* basis. The bars are the coefficients, the red curve the residual.

Even with the **optimal** coefficients — which is what "detune = 1" gives — the step target keeps a visible error at the jump that only shrinks slowly with $N$. A DeepONet's branch is choosing coefficients in exactly this situation. If the family of outputs needs a basis that moves with the input, a fixed basis is the bottleneck, and the branch is not where the problem is.

Switch to the parabola: a smooth target collapses into a couple of modes, which is the regime where DeepONet is excellent.`,
      widget: { type: 'MathL2Projection', props: { target: 'step', n: 3 } },
    },
    {
      kind: 'truefalse',
      prompt: String.raw`Making the branch network deeper and wider can, in principle, drive a DeepONet's error to zero for any continuous operator at fixed trunk width $p$.`,
      answer: false,
      why: String.raw`The output is confined to the $p$-dimensional span of the trunk functions, so the error is bounded below by the best $p$-term linear approximation of the output set — the Kolmogorov $p$-width. The branch chooses the coefficients inside that span and cannot escape it. To reduce the floor you must raise $p$, or change the reconstruction so the basis depends on $u$.`,
    },
    {
      kind: 'explain',
      title: 'Training',
      body: String.raw`A training example is a triple: an input function sampled at the sensors, a query point, and the true value there. Concretely, generate $n_u$ input functions (typically Gaussian random fields of a chosen smoothness, or a parametric family), solve each with a classical solver, and sample $n_y$ query points per solution. The dataset has $n_u \cdot n_y$ scalar targets.

The standard loss is the **relative** $L^2$ error, averaged over inputs:

$$\mathcal{L}(\theta) = \frac{1}{n_u}\sum_{i=1}^{n_u} \frac{\|\mathcal{G}_\theta(u_i) - \mathcal{G}(u_i)\|_{L^2}}{\|\mathcal{G}(u_i)\|_{L^2}},$$

with the norms approximated by sums over the sampled $y$. Relative rather than absolute, because solution magnitudes vary by orders of magnitude across a dataset and an absolute loss would simply ignore the small ones.`,
    },
    {
      kind: 'order',
      prompt: 'Order one forward pass of a trained DeepONet, for a new input function and a batch of query points.',
      steps: [
        String.raw`Evaluate the new input $u$ at the $m$ fixed sensor locations.`,
        String.raw`Push that length-$m$ vector through the branch to get coefficients $b_1,\dots,b_p$.`,
        String.raw`Push each query point $y$ through the trunk to get $t_1(y),\dots,t_p(y)$.`,
        String.raw`Take the dot product $\sum_k b_k t_k(y)$ and add the bias $b_0$.`,
        String.raw`Repeat the last two steps for every $y$ you want, reusing the same $b$.`,
      ],
      why: String.raw`The branch runs once per input function and the trunk once per query point, which is why dense output is cheap. If the new $u$ is not available exactly at the sensors you must interpolate it there first — an extra error source the architecture does not account for.`,
    },
    {
      kind: 'explain',
      title: 'Fixed sensors: what DeepONet is and is not invariant to',
      body: String.raw`Be precise about the asymmetry.

**Output side: grid-free.** $y$ is an argument of the trunk. Train on solutions sampled at 64 points, then evaluate at 4096, or on a scattered set, or on a different domain shape — no retraining, no change in parameters. This is genuine discretisation invariance of the output.

**Input side: not grid-free.** The branch's first layer has exactly $m$ inputs, bolted to $m$ specific locations. A new input measured on a different grid must be interpolated onto the sensors; change the sensor set and the branch must be retrained. Kovachki et al. (JMLR 2023) discuss DeepONet's fixed input sensors in exactly this light when placing it relative to neural operators.

In exchange, DeepONet is relaxed about geometry in a way the FNO is not: scattered sensors on an irregular domain are fine, because they are just a vector of numbers.`,
    },
    {
      kind: 'multi',
      prompt: 'Which statements about DeepONet are accurate?',
      choices: [
        'The output can be evaluated at query points never seen during training.',
        'The input function must be supplied at the same sensor locations used in training.',
        'The predicted output always lies in a fixed $p$-dimensional subspace of functions.',
        'It requires the input domain to be a regular rectangular grid.',
        'The branch must be a fully connected network.',
      ],
      answers: [0, 1, 2],
      why: String.raw`Free in $y$, fixed in the sensors, and linear in the reconstruction — those three together are the architecture's signature. Nothing requires a rectangular grid (scattered sensors are fine, which is a real advantage over spectral methods), and the branch can be a CNN, a GNN or anything else that eats the sensor vector.`,
    },
    {
      kind: 'numeric',
      prompt: String.raw`An unstacked DeepONet has $m = 100$ sensors, $p = 50$, a branch of shape $100 \to 100 \to 50$ and a trunk of shape $2 \to 100 \to 50$, every layer with a bias. How many weights and biases in total, excluding the final scalar $b_0$?`,
      answer: 20500,
      tolerance: 1,
      why: String.raw`Branch: $100\cdot100 + 100 = 10{,}100$, then $100\cdot50 + 50 = 5{,}050$, giving $15{,}150$. Trunk: $2\cdot100 + 100 = 300$, then $5{,}050$, giving $5{,}350$. Total $20{,}500$. Compare the stacked form of the same capacity, whose first branch matrix alone would need $p\cdot100\cdot100 = 500{,}000$ weights — that gap is why unstacked won.`,
    },
    {
      kind: 'explain',
      title: 'Variants worth knowing',
      body: String.raw`- **POD-DeepONet.** Replace the learned trunk by the leading POD (equivalently PCA) modes of the training outputs, and let the branch learn only the coefficients. Lu et al. (*CMAME*, 2022) report this is often more accurate and much easier to train — unsurprising, since POD gives the optimal fixed basis in the mean-square sense.
- **Physics-informed DeepONet.** Add the PDE residual of the predicted output as a loss term. The trunk is differentiable in $y$, so the residual is available by automatic differentiation at any point, with no mesh. Wang, Wang & Perdikaris (*Science Advances*, 2021) use this to cut, and sometimes eliminate, the need for solved training pairs.
- **Multiple outputs.** For a vector-valued solution, either split the $p$ channels into groups or use one trunk per component.
- **Feature expansions.** Feeding the trunk Fourier features of $y$ instead of raw coordinates helps when the output has fine detail, for the same reason it helps in other coordinate networks.`,
    },
    {
      kind: 'match',
      prompt: 'Match each component with its job.',
      pairs: [
        ['Branch net', String.raw`turns $m$ sensor values into $p$ coefficients`],
        ['Trunk net', String.raw`turns a query point $y$ into $p$ basis values`],
        ['Dot product', 'combines them into one scalar prediction'],
        [String.raw`Width $p$`, 'the dimension of the subspace all outputs live in'],
        ['POD modes', 'a fixed, optimal-in-mean-square replacement for the learned trunk'],
      ],
      why: String.raw`Keeping the two nets' jobs separate explains both the strength (the branch runs once, so dense evaluation is nearly free) and the weakness (the basis cannot adapt to the particular input, so $p$ sets an error floor).`,
    },
    {
      kind: 'fill',
      prompt: String.raw`In a DeepONet the ___ net reads the input at $m$ fixed sensors and the ___ net reads the query point; their ___ product is the prediction. Because the basis does not depend on the input, the reconstruction is ___, and its error is floored by the Kolmogorov width.`,
      bank: ['branch', 'trunk', 'dot', 'linear', 'cross', 'kernel', 'nonlinear', 'spectral'],
      answer: ['branch', 'trunk', 'dot', 'linear'],
      why: String.raw`Branch for the function, trunk for the point, dot product to join them. The word that matters most is the last: the branch is as nonlinear as you like, but the *reconstruction* step is a linear combination of fixed functions, and that is where the floor comes from.`,
    },
    {
      kind: 'explain',
      title: 'Key takeaways',
      body: String.raw`- **DeepONet** = $\sum_{k=1}^{p} b_k(u(x_1),\dots,u(x_m))\,t_k(y) + b_0$: a deep branch, a deep trunk, joined by a dot product — the Chen & Chen shape with depth and SGD added.
- The branch runs **once per input function**, the trunk **once per query point**, so dense or off-grid output is cheap. The output side is genuinely grid-free.
- The input side is not: the $m$ sensors are fixed, and new inputs must be interpolated onto them. Scattered sensors and irregular domains are fine, though, which spectral methods struggle with.
- **Unstacked** (one shared branch with $p$ outputs) beats the stacked form of the theorem on parameters and accuracy.
- Every prediction lies in $\mathrm{span}\{t_k\}$, so the error has a floor set by the Kolmogorov $p$-width of the output set. Fine for diffusion; punishing for moving sharp fronts.
- **POD-DeepONet** and **physics-informed DeepONet** are the two variants worth trying first.
- Next: a different answer to the same problem — [kernel integral layers](@math/neural-operator-framework).`,
    },
  ],
  references: [
    { authors: 'L. Lu, P. Jin, G. Pang, Z. Zhang, G. E. Karniadakis', title: 'Learning nonlinear operators via DeepONet based on the universal approximation theorem of operators', year: 2021, venue: 'Nature Machine Intelligence 3, 218–229' },
    { authors: 'L. Lu, X. Meng, S. Cai, Z. Mao, S. Goswami, Z. Zhang, G. E. Karniadakis', title: 'A comprehensive and fair comparison of two neural operators (with practical extensions) based on FAIR data', year: 2022, venue: 'Computer Methods in Applied Mechanics and Engineering 393, 114778', detail: 'POD-DeepONet and architectural extensions' },
    { authors: 'S. Lanthaler, S. Mishra, G. E. Karniadakis', title: 'Error estimates for DeepONets: a deep learning framework in infinite dimensions', year: 2022, venue: 'Transactions of Mathematics and Its Applications 6(1), tnac001' },
    { authors: 'S. Lanthaler, R. Molinaro, P. Hadorn, S. Mishra', title: 'Nonlinear reconstruction for operator learning of PDEs with discontinuities', year: 2023, venue: 'ICLR 2023 (arXiv:2210.01074)' },
    { authors: 'S. Wang, H. Wang, P. Perdikaris', title: 'Learning the solution operator of parametric partial differential equations with physics-informed DeepONets', year: 2021, venue: 'Science Advances 7(40), eabi8605' },
    { authors: 'N. Kovachki, Z. Li, B. Liu, K. Azizzadenesheli, K. Bhattacharya, A. Stuart, A. Anandkumar', title: 'Neural Operator: Learning Maps Between Function Spaces with Applications to PDEs', year: 2023, venue: 'Journal of Machine Learning Research 24(89), 1–97', detail: '§3 (DeepONet within the neural-operator taxonomy)' },
  ],
} satisfies LessonContent;
