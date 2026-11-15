import type { LessonContent } from '../../types';

const COUPLING = String.raw`<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" font-family="inherit">
  <defs>
    <marker id="cpA" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="5" markerHeight="5" orient="auto">
      <path d="M0,0 L8,4 L0,8 z" fill="var(--muted)"/>
    </marker>
    <style>
      .b { fill: var(--surface); stroke: var(--fg); stroke-width: 0.9; rx: 4; }
      .n { fill: var(--surface); stroke: var(--c4); stroke-width: 1.2; rx: 4; }
      .a { stroke: var(--muted); stroke-width: 1; fill: none; marker-end: url(#cpA); }
      .p { stroke: var(--c2); stroke-width: 1.4; fill: none; marker-end: url(#cpA); }
      text { font-size: 9px; fill: var(--fg); }
      .m { fill: var(--muted); font-size: 8px; }
    </style>
  </defs>
  <rect class="b" x="6" y="18" width="52" height="24"/>
  <text x="32" y="34" text-anchor="middle">x₁:d</text>
  <rect class="b" x="6" y="104" width="52" height="24"/>
  <text x="32" y="120" text-anchor="middle">x_{d+1:D}</text>

  <path class="p" d="M59,30 L252,30"/>
  <text class="m" x="150" y="24" text-anchor="middle" fill="var(--c2)">copied unchanged — this is what makes it invertible</text>

  <path class="a" d="M80,34 L80,58 L104,58"/>
  <rect class="n" x="105" y="44" width="70" height="30"/>
  <text x="140" y="56" text-anchor="middle">net s, t</text>
  <text class="m" x="140" y="68" text-anchor="middle">any architecture</text>
  <path class="a" d="M176,59 L198,59 L198,110 L188,110"/>
  <text class="m" x="202" y="56">s, t</text>

  <path class="a" d="M59,116 L152,116"/>
  <circle cx="162" cy="116" r="10" class="b" fill="var(--surface)"/>
  <text x="162" y="119" text-anchor="middle">⊙</text>
  <path class="a" d="M173,116 L190,116"/>
  <circle cx="200" cy="116" r="10" class="b" fill="var(--surface)"/>
  <text x="200" y="119" text-anchor="middle">+</text>
  <path class="a" d="M211,116 L252,116"/>

  <rect class="b" x="253" y="18" width="60" height="24"/>
  <text x="283" y="34" text-anchor="middle">y₁:d</text>
  <rect class="b" x="253" y="104" width="60" height="24"/>
  <text x="283" y="120" text-anchor="middle">y_{d+1:D}</text>

  <text class="m" x="6" y="150">y_{d+1:D} = x_{d+1:D} ⊙ exp(s(x₁:d)) + t(x₁:d)</text>
  <text class="m" x="6" y="162">Jacobian is triangular  ⇒  log|det J| = Σⱼ sⱼ(x₁:d)</text>
  <text class="m" x="6" y="174">inverse: x_{d+1:D} = (y_{d+1:D} − t(y₁:d)) ⊙ exp(−s(y₁:d))</text>
</svg>`;

export default {
  cards: [
    {
      kind: 'explain',
      title: 'Bend a Gaussian until it fits',
      body: String.raw`Take a sheet of rubber with a simple pattern printed on it — a round Gaussian blob — and stretch it until the pattern matches the shape of your data. If you know exactly how much you stretched every part of the sheet, you know exactly how dark the ink became at every point. That is a **normalizing flow**: an invertible map $f_\theta$ between a simple base distribution and the data, with full bookkeeping of the stretching.

The payoff is unusual in generative modelling. Flows give you *both* exact likelihoods and one-pass sampling:
- **sample:** draw $z\sim\mathcal N(0,I)$, output $x=f_\theta(z)$;
- **score:** given $x$, run the map backwards to $z=f_\theta^{-1}(x)$ and read off $\log p_\theta(x)$ in closed form.

The price is paid in architecture: every layer must be invertible, and its Jacobian determinant must be cheap.`,
    },
    {
      kind: 'explain',
      title: 'Change of variables in one dimension',
      body: String.raw`Suppose $z$ has density $p_z$ and $x=f(z)$ for a strictly increasing, differentiable $f$. Probability mass is conserved: whatever lands in a tiny interval must have come from the interval that maps onto it, so
$$p_x(x)\,|dx| = p_z(z)\,|dz| \quad\Longrightarrow\quad p_x(x)=p_z\big(f^{-1}(x)\big)\,\left|\frac{df}{dz}\right|^{-1}.$$

Read the factor $|df/dz|$ as a local stretch. Where the map **stretches** ($|f'|>1$) the same mass is spread over a wider interval, so the density must go **down**; where it squeezes, the density goes up. On the log scale, which is where we work:
$$\log p_x(x)=\log p_z(z)-\log\left|\frac{df}{dz}\right|,\qquad z=f^{-1}(x).$$

Nothing here is specific to Gaussians — it is bookkeeping, and it is exact.`,
    },
    {
      kind: 'widget',
      title: 'Watch the Jacobian factor at work',
      body: String.raw`Bottom: the base density $p(z)=\mathcal N(0,1)$. Centre: the map $x=f(z)$. Left: the pushed-forward density $p(x)$.

The two shaded slabs always carry the **same probability mass** (printed). Move $z^*$ and change $a$: where the curve is steep the slab comes out wide and the density is short; where the curve is flat the slab is squeezed and the density spikes. Height always changes by exactly $1/\text{width}$ — that is $|f'|^{-1}$. Try the **scale** map to see the simplest case, $p_x(x)=p_z(x/a)/a$.`,
      widget: { type: 'MlChangeOfVariables', props: { map: 'warp', a: 1.5, zStar: 0.6 } },
    },
    {
      kind: 'numeric',
      prompt: String.raw`Let $z\sim\mathcal N(0,1)$ and $x=3z$. What is the density $p_x(0)$? (4 decimals)`,
      answer: 0.1330,
      tolerance: 0.0008,
      why: String.raw`$p_x(0)=p_z(0)/|f'| = \big(1/\sqrt{2\pi}\big)/3 = 0.39894/3 = 0.1330$. The map stretches by 3 everywhere, so every density value drops by a factor of 3 — consistent with $x\sim\mathcal N(0,9)$, whose peak is $1/(3\sqrt{2\pi})$. Forgetting the Jacobian would give $0.3989$, a density that integrates to 3.`,
    },
    {
      kind: 'explain',
      title: 'In $d$ dimensions: the log-determinant',
      body: String.raw`For $x=f(z)$ with $f:\mathbb R^d\to\mathbb R^d$ invertible and differentiable, the stretch factor becomes the absolute **determinant of the Jacobian matrix** $J_f(z)=\partial f/\partial z^{\!\top}$, which is exactly the local volume-scaling factor of the map:
$$\boxed{\ \log p_x(x)=\log p_z(z)-\log\big|\det J_f(z)\big|,\qquad z=f^{-1}(x).\ }$$

Two immediate consequences.

**The dimensions must match.** A determinant only exists for a square Jacobian, so the latent space of a flow has the *same* dimension as the data — no bottleneck, no compression, unlike a VAE.

**The determinant must be cheap.** A general $d\times d$ determinant costs $O(d^3)$. For a $32\times32\times3$ image, $d=3072$ and that is per layer, per example, per step. Hopeless. The entire design literature on flows is about building expressive invertible layers whose Jacobian is **triangular** or **diagonal**, so that the determinant is just a product of diagonal entries and the log-determinant is a sum of $d$ numbers.`,
    },
    {
      kind: 'truefalse',
      prompt: 'A normalizing flow can map a 100-dimensional latent variable to 3072-dimensional images, like the generator of a GAN.',
      answer: false,
      why: String.raw`The change-of-variables formula needs $\det J$, hence a square Jacobian, hence equal dimensions. A flow on $32\times32$ RGB images has a 3072-dimensional latent. That is a genuine architectural cost — flows cannot compress — and it is one reason they are often paired with a learned dimensionality reduction rather than used alone.`,
    },
    {
      kind: 'explain',
      title: 'Composing flows',
      body: String.raw`One cheap invertible layer is not expressive. But invertibility composes, and so does the log-determinant. With $f=f_K\circ\cdots\circ f_1$ and intermediate states $h_0=z,\ h_k=f_k(h_{k-1}),\ x=h_K$:
$$\log p_x(x)=\log p_z(z)-\sum_{k=1}^{K}\log\big|\det J_{f_k}(h_{k-1})\big|.$$
The determinant of a product is the product of determinants, so on the log scale the corrections simply **add**. Stack 32 layers and you pay 32 cheap sums.

The name now makes sense. Running the map in the $x\to z$ direction *normalizes* the data: it turns a complicated empirical distribution into a standard Gaussian. Training is plain maximum likelihood — minimize $-\frac1n\sum_i\log p_\theta(x_i)$ with the formula above — so, unlike a GAN, there is a single scalar objective that genuinely goes down.

Each layer must therefore satisfy three requirements at once:
1. **invertible**, with an inverse you can actually compute;
2. a **tractable** log-determinant;
3. **expressive** enough to be worth a layer.`,
    },
    {
      kind: 'explain',
      title: 'Coupling layers: RealNVP',
      body: String.raw`Building on their earlier NICE, Dinh, Sohl-Dickstein & Bengio (2017) gave a construction that satisfies all three with almost no compromise. Here $x$ and $y$ are one layer's *input* and *output* (not data and latent). Split the input in two, $x=(x_{1:d},x_{d+1:D})$. Leave the first half **untouched**, and transform the second half with an affine map whose coefficients are computed from the first half:
$$y_{1:d}=x_{1:d},\qquad y_{d+1:D}=x_{d+1:D}\odot\exp\big(s(x_{1:d})\big)+t(x_{1:d}).$$

The magic is that $s$ and $t$ can be **arbitrary** networks — deep convolutional nets, residual blocks, anything — because they are never inverted. To go backwards you first read off $x_{1:d}=y_{1:d}$, then re-run the same $s$ and $t$ on it and undo an elementwise affine map:
$$x_{d+1:D}=\big(y_{d+1:D}-t(y_{1:d})\big)\odot\exp\big(-s(y_{1:d})\big).$$

And the Jacobian is **block triangular**: $\partial y_{1:d}/\partial x_{d+1:D}=0$. Its determinant is the product of the diagonal, so
$$\log\big|\det J\big|=\sum_{j=d+1}^{D}s_j(x_{1:d}),$$
a sum of numbers the network already computed. No determinant is ever formed.

Since each layer leaves half the coordinates alone, flows alternate the mask — checkerboard patterns, then channel-wise splits — so every coordinate gets transformed and gets to condition.`,
    },
    {
      kind: 'widget',
      title: 'One affine coupling layer',
      widget: { type: 'SvgDiagram', props: { svg: COUPLING }, caption: String.raw`NICE (Dinh et al., 2015) is the special case $s\equiv0$: additive coupling, $\log|\det J|=0$, a *volume-preserving* flow.` },
    },
    {
      kind: 'numeric',
      prompt: String.raw`An affine coupling layer on $D=6$ dimensions splits 3/3 and its network outputs $s=(0.4,\,-0.9,\,0.2)$ for the transformed half. What is $\log|\det J|$ for this layer?`,
      answer: -0.3,
      tolerance: 0.001,
      why: String.raw`The log-determinant is the sum of the scale outputs: $0.4-0.9+0.2=-0.3$. The untransformed half contributes rows of the identity, whose diagonal entries are 1 and so add $\log 1=0$. A negative total means this layer *contracts* volume, which raises the density by $e^{0.3}$.`,
    },
    {
      kind: 'mcq',
      prompt: String.raw`In an affine coupling layer, why may the networks $s$ and $t$ be arbitrary non-invertible neural networks?`,
      choices: [
        'Because the layer is only approximately invertible, and the error is small in practice',
        String.raw`Because inverting the layer only requires *evaluating* $s$ and $t$ on the half that was copied unchanged`,
        String.raw`Because the Jacobian of $s$ and $t$ is added to the log-determinant`,
        'Because they are trained with a separate reconstruction loss that enforces invertibility',
      ],
      answer: 1,
      why: String.raw`The untouched half $y_{1:d}=x_{1:d}$ is available on the way back, so $s(y_{1:d})$ and $t(y_{1:d})$ can be recomputed exactly and the elementwise affine map undone. The layer is *exactly* invertible, by construction and not by training. And the Jacobians of $s$ and $t$ never appear: they sit in the zero block of the triangular Jacobian.`,
    },
    {
      kind: 'explain',
      title: 'Glow: three operations per step',
      body: String.raw`RealNVP alternates fixed masks, so which coordinates talk to which is hard-wired. **Glow** (Kingma & Dhariwal, 2018) made that permutation learnable, and reduced a flow step to three operations applied over and over:

1. **Actnorm** — a per-channel affine normalization $y=w\odot x+b$, initialized from the first minibatch so that activations start with zero mean and unit variance. Log-determinant $h\cdot w\cdot\sum_c\log|w_c|$ for an $h\times w$ feature map. It plays the role of batch normalization in a setting where batch statistics would break invertibility.
2. **Invertible $1\times1$ convolution** — a learned $c\times c$ matrix $W$ applied at every spatial position. This is a general, learnable mixing of channels, generalizing the fixed channel permutation of RealNVP. Its log-determinant is $h\cdot w\cdot\log|\det W|$: a $c\times c$ determinant with $c$ modest, computed once per layer, not per pixel. Glow also keeps $W$ in LU-factored form so the determinant is just a sum of logs of the diagonal.
3. **Affine coupling** — exactly as in RealNVP.

Both models use a **multi-scale** architecture: *squeeze* trades spatial resolution for channels, and *split* sends half the channels straight to the output as latents, so later layers work on fewer, coarser variables. This is what keeps the cost manageable, and it gives a latent hierarchy in which the fine detail is captured early.

Glow's party trick was semantic interpolation and attribute editing on high-resolution faces, performed purely by arithmetic in a latent space that was never trained to be semantic. On likelihood, flows of this era reached roughly 3.3–3.5 bits per dimension on CIFAR-10 — respectable, but behind the $\approx2.9$ of contemporaneous autoregressive models, which is the recurring trade: a flow buys fast sampling with a restricted architecture.`,
    },
    {
      kind: 'explain',
      title: 'Autoregressive flows: pick your fast direction',
      body: String.raw`There is a second way to get a triangular Jacobian: make coordinate $i$ depend only on coordinates before it.
$$x_i=u_i\cdot\exp\big(\alpha_i(x_{1:i-1})\big)+\mu_i(x_{1:i-1}).$$
The Jacobian $\partial x/\partial u$ is triangular, so $\log|\det J|=\sum_i\alpha_i$ again. But now the two directions cost different amounts:

- **Masked autoregressive flow** (MAF; Papamakarios, Pavlakou & Murray, 2017). Computing $u$ from a given $x$ is **one parallel pass** — every $\alpha_i,\mu_i$ depends on $x$, which you already have. Generating $x$ from $u$ is **sequential**, $D$ passes. Fast density evaluation, slow sampling.
- **Inverse autoregressive flow** (IAF; Kingma et al., 2016) conditions on $u_{1:i-1}$ instead. Exactly the reverse: fast sampling, slow density evaluation. That makes IAF ideal as a flexible posterior $q_\phi(z\mid x)$ inside a VAE, where you only need to score your own samples.

Coupling layers are the special case where the "autoregressive" dependence is coarsened to two blocks — less expressive per layer, but parallel in **both** directions, which is why they dominate standalone image flows.`,
    },
    {
      kind: 'multi',
      prompt: 'Which statements about normalizing flows are true? (Select all that apply.)',
      choices: [
        'Training is exact maximum likelihood, with a single scalar objective',
        'The latent space must have the same dimension as the data',
        'The log-determinants of stacked layers add up',
        'Any neural network can be used as a flow layer, as long as it is deep enough',
      ],
      answers: [0, 1, 2],
      why: String.raw`Exact likelihood is the headline property, and because $\det(AB)=\det A\det B$ the per-layer corrections add on the log scale. The square-Jacobian requirement forces equal dimensions. The last claim is exactly backwards: a flow layer must be invertible with a cheap log-determinant, which is a severe restriction — it is why coupling layers were an idea worth publishing.`,
    },
    {
      kind: 'explain',
      title: 'Honest limitations, and what came next',
      body: String.raw`- **No compression.** Equal dimensions everywhere means a flow cannot learn a low-dimensional code, and it must spend capacity modelling directions the data barely uses.
- **Topology.** A diffeomorphism cannot change the topology of the support. A single connected Gaussian cannot be mapped onto two genuinely disconnected clusters without extreme, numerically awkward stretching — the model instead builds a thin bridge between them.
- **Parameter hunger.** Each layer is weak, so flows need many layers and end up large relative to their likelihoods.
- **Discrete data.** Images are integers; fitting a continuous density to them can send the likelihood to infinity. Flows therefore **dequantize** — add uniform noise in $[0,1)$ to each pixel — which turns the reported figure into a lower bound on the discrete model's likelihood (Theis et al., 2016).
- **Out-of-distribution surprises.** Flows trained on CIFAR-10 can assign *higher* likelihood to SVHN images than to their own training distribution (Nalisnick et al., 2019), a caution against reading likelihood as typicality.

The modern descendant relaxes the discrete stack into continuous time: let $dx/dt=v_\theta(x,t)$ and the log-density evolves by the instantaneous change of variables $\tfrac{d}{dt}\log p = -\nabla\!\cdot v_\theta$, a trace instead of a determinant (continuous normalizing flows, Chen et al., 2018). Training those by likelihood needs an ODE solve per step; **[flow matching](@ml/flow-matching)** removes that by regressing the velocity field directly — and is where this thread rejoins [diffusion](@ml/diffusion-models).`,
    },
    {
      kind: 'order',
      prompt: 'Order the steps of computing the training loss for one example under a flow.',
      steps: [
        String.raw`Run the data backwards through the layers: $h_{k-1}=f_k^{-1}(h_k)$ down to $z=f^{-1}(x)$`,
        String.raw`Accumulate $\sum_k\log|\det J_{f_k}|$ along the way from the layers' scale outputs`,
        String.raw`Evaluate the base density $\log p_z(z)$ under $\mathcal N(0,I)$`,
        String.raw`Combine: $\log p_\theta(x)=\log p_z(z)-\sum_k\log|\det J_{f_k}|$`,
        String.raw`Backpropagate $-\log p_\theta(x)$ and update $\theta$`,
      ],
      why: String.raw`Scoring runs the flow in the *normalizing* direction, data to noise; generation runs it the other way. The log-determinants are collected as a by-product of the same pass, which is why training a flow costs barely more than a forward pass of a comparable network.`,
    },
    {
      kind: 'fill',
      prompt: String.raw`The change-of-variables formula reads $\log p_x(x)=\log p_z(z)-$ ___ . A coupling layer makes this cheap by leaving ___ of the coordinates unchanged, which makes the Jacobian ___ . Glow adds a learned invertible ___ convolution in place of a fixed channel permutation.`,
      bank: ['log|det J|', 'log p_z(z)', 'half', 'all', 'triangular', 'diagonal', '1×1', '3×3'],
      answer: ['log|det J|', 'half', 'triangular', '1×1'],
      why: String.raw`The copied half gives a zero off-diagonal block, so the Jacobian is block **triangular** and its determinant is the product of the diagonal — a *diagonal* Jacobian would mean a purely elementwise layer, which could not mix coordinates at all. Glow's $1\times1$ convolution is a learned $c\times c$ channel mixing with log-determinant $h\,w\log|\det W|$.`,
    },
    {
      kind: 'match',
      prompt: 'Match each flow component to its log-determinant.',
      pairs: [
        [String.raw`Affine coupling, scales $s$`, String.raw`$\sum_j s_j$`],
        [String.raw`Additive coupling (NICE)`, String.raw`$0$ — volume preserving`],
        [String.raw`Invertible $1\times1$ conv with matrix $W$ on an $h\times w$ map`, String.raw`$h\,w\,\log|\det W|$`],
        [String.raw`Elementwise scaling $x\mapsto a\odot x$`, String.raw`$\sum_j\log|a_j|$`],
        [String.raw`Continuous flow $dx/dt=v_\theta$`, String.raw`$\int\nabla\!\cdot v_\theta\,dt$`],
      ],
      why: String.raw`Every entry is the log of a volume-change factor. Triangular structure turns a determinant into a sum over the diagonal; the $1\times1$ convolution pays one small $c\times c$ determinant, reused at all $h\,w$ positions; and in continuous time the determinant becomes a trace, that is, a divergence.`,
    },
    {
      kind: 'explain',
      title: 'Key takeaways',
      body: String.raw`- A flow is an **invertible** map from a simple base density to the data, with exact likelihood $\log p_x(x)=\log p_z(z)-\log|\det J_f(z)|$.
- Stretching lowers density, squeezing raises it; the Jacobian determinant is the local volume-change factor, and log-determinants **add** across stacked layers.
- Latent and data dimensions must match, and the log-determinant must be cheap — so layers are built to have **triangular** Jacobians.
- **Coupling layers** (RealNVP) copy half the coordinates and affinely transform the rest; $s$ and $t$ may be arbitrary networks, and $\log|\det J|=\sum_j s_j$.
- **Glow** = actnorm + invertible $1\times1$ convolution + affine coupling, in a multi-scale stack.
- **MAF** is fast to score and slow to sample; **IAF** is the reverse, which makes it a good VAE posterior.
- Limitations: no compression, topology-preserving, parameter-hungry, and likelihood is not typicality. The continuous-time relaxation leads to [flow matching](@ml/flow-matching).`,
    },
  ],
  references: [
    { authors: 'L. Dinh, J. Sohl-Dickstein & S. Bengio', title: 'Density Estimation using Real NVP', year: 2017, venue: 'ICLR', url: 'https://arxiv.org/abs/1605.08803' },
    { authors: 'D. P. Kingma & P. Dhariwal', title: 'Glow: Generative Flow with Invertible 1x1 Convolutions', year: 2018, venue: 'NeurIPS', url: 'https://arxiv.org/abs/1807.03039' },
    { authors: 'L. Dinh, D. Krueger & Y. Bengio', title: 'NICE: Non-linear Independent Components Estimation', year: 2015, venue: 'ICLR Workshop', url: 'https://arxiv.org/abs/1410.8516' },
    { authors: 'G. Papamakarios, T. Pavlakou & I. Murray', title: 'Masked Autoregressive Flow for Density Estimation', year: 2017, venue: 'NeurIPS', url: 'https://arxiv.org/abs/1705.07057' },
    { authors: 'D. P. Kingma, T. Salimans, R. Jozefowicz, X. Chen, I. Sutskever & M. Welling', title: 'Improved Variational Inference with Inverse Autoregressive Flow', year: 2016, venue: 'NeurIPS', url: 'https://arxiv.org/abs/1606.04934' },
    { authors: 'E. Nalisnick, A. Matsukawa, Y. W. Teh, D. Gorur & B. Lakshminarayanan', title: 'Do Deep Generative Models Know What They Don\'t Know?', year: 2019, venue: 'ICLR', url: 'https://arxiv.org/abs/1810.09136' },
    { authors: 'D. J. Rezende & S. Mohamed', title: 'Variational Inference with Normalizing Flows', year: 2015, venue: 'ICML', url: 'https://arxiv.org/abs/1505.05770' },
    { authors: 'G. Papamakarios, E. Nalisnick, D. J. Rezende, S. Mohamed & B. Lakshminarayanan', title: 'Normalizing Flows for Probabilistic Modeling and Inference', year: 2021, venue: 'JMLR 22(57), 1–64', url: 'https://arxiv.org/abs/1912.02762' },
    { authors: 'R. T. Q. Chen, Y. Rubanova, J. Bettencourt & D. Duvenaud', title: 'Neural Ordinary Differential Equations', year: 2018, venue: 'NeurIPS', url: 'https://arxiv.org/abs/1806.07366' },
  ],
} satisfies LessonContent;
