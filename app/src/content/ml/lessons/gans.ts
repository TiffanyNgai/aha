import type { LessonContent } from '../../types';

const PD = '(0.5*exp(-0.5*((x+1.5)/0.5)^2)+0.5*exp(-0.5*((x-1.5)/0.5)^2))/(0.5*sqrt(2*PI))';
const PG = 'exp(-0.5*((x-m)/s)^2)/(s*sqrt(2*PI))';
const DSTAR = `(${PD})/((${PD})+(${PG})+1e-12)`;

const GAME = String.raw`<svg viewBox="0 0 320 160" xmlns="http://www.w3.org/2000/svg" font-family="inherit">
  <defs>
    <marker id="ganA" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="5" markerHeight="5" orient="auto">
      <path d="M0,0 L8,4 L0,8 z" fill="var(--muted)"/>
    </marker>
    <style>
      .b { fill: var(--surface); stroke: var(--fg); stroke-width: 0.9; rx: 4; }
      .g { fill: var(--surface); stroke: var(--c3); stroke-width: 1.2; rx: 4; }
      .d { fill: var(--surface); stroke: var(--c2); stroke-width: 1.2; rx: 4; }
      .a { stroke: var(--muted); stroke-width: 1; fill: none; marker-end: url(#ganA); }
      text { font-size: 9px; fill: var(--fg); }
      .m { fill: var(--muted); font-size: 8px; }
    </style>
  </defs>
  <rect class="b" x="4" y="14" width="52" height="24"/>
  <text x="30" y="30" text-anchor="middle">z ~ N(0,I)</text>
  <path class="a" d="M57,26 L72,26"/>
  <rect class="g" x="73" y="12" width="58" height="28"/>
  <text x="102" y="30" text-anchor="middle">generator G</text>
  <path class="a" d="M132,26 L160,26 L160,58"/>
  <text class="m" x="136" y="22">fake x = G(z)</text>

  <rect class="b" x="4" y="86" width="60" height="24"/>
  <text x="34" y="102" text-anchor="middle">real data</text>
  <path class="a" d="M65,98 L160,98 L160,80"/>

  <rect class="d" x="128" y="58" width="64" height="22"/>
  <text x="160" y="72" text-anchor="middle">critic D</text>
  <path class="a" d="M193,69 L224,69"/>
  <rect class="b" x="225" y="56" width="90" height="26"/>
  <text x="270" y="67" text-anchor="middle">D(x) ∈ (0,1)</text>
  <text class="m" x="270" y="77" text-anchor="middle">"probability it is real"</text>

  <path d="M250,84 L250,128 L102,128 L102,44" stroke="var(--c5)" stroke-width="1" fill="none" stroke-dasharray="4 3" marker-end="url(#ganA)">
    <animate attributeName="stroke-dashoffset" values="28;0" dur="1.4s" repeatCount="indefinite"/>
  </path>
  <text class="m" x="176" y="140" text-anchor="middle" fill="var(--c5)">G is trained by the gradient that flows back through D</text>
  <text class="m" x="4" y="154">D maximises the objective · G minimises it · no likelihood anywhere</text>
</svg>`;

export default {
  cards: [
    {
      kind: 'explain',
      title: 'A forger and a detective',
      body: String.raw`A forger paints fakes; a detective tries to tell them from real paintings. Each one's progress makes the other's job harder. If the detective ever becomes unable to do better than a coin flip, the fakes are — by that detective's standards — indistinguishable from real.

A **generative adversarial network** (Goodfellow et al., 2014) is that scenario, written as an optimization problem. There is no density anywhere: the generator $G_\theta$ is just a function that turns noise into data, and the only feedback it ever receives is the gradient flowing back through the discriminator.

That is both the appeal and the curse. Dropping likelihood buys razor-sharp samples, because nothing ever forces the model to average. It also throws away every convergence guarantee that maximum likelihood gave us.`,
    },
    {
      kind: 'widget',
      title: 'The game',
      widget: { type: 'SvgDiagram', props: { svg: GAME }, caption: String.raw`$G$ never sees a real image. It only ever sees how $D$ reacts to its output.` },
    },
    {
      kind: 'explain',
      title: 'The minimax objective',
      body: String.raw`The discriminator $D_\psi:\mathcal X\to(0,1)$ outputs its belief that an input is real. Train it as a binary classifier, with real data labelled 1 and generated data labelled 0:
$$V(D,G)=\mathbb E_{x\sim p_{\text{data}}}\big[\log D(x)\big]+\mathbb E_{z\sim p(z)}\big[\log\big(1-D(G(z))\big)\big].$$
That is just the (negated) binary cross-entropy of the two-class problem. The generator wants the opposite:
$$\min_G\ \max_D\ V(D,G).$$

In practice you alternate: $k$ gradient *ascent* steps on $\psi$, then one descent step on $\theta$. Usually $k=1$. There is no loss that both players are reducing — the quantity $V$ goes up for one and down for the other, so a decreasing training curve means nothing here.`,
    },
    {
      kind: 'widget',
      title: 'The optimal discriminator',
      body: String.raw`For a **fixed** $G$, the inner maximization can be solved pointwise. The integrand at each $x$ is $p_{\text{data}}(x)\log D+p_g(x)\log(1-D)$, which is maximized at
$$D^\star(x)=\frac{p_{\text{data}}(x)}{p_{\text{data}}(x)+p_g(x)}.$$
Slide the generator's mean $m$ and width $s$. The curve $D^\star$ is 1 where only real data lives, 0 where only fakes live, and $\tfrac12$ where the two densities agree. Park the generator on one mode and watch $D^\star$ stay pinned near 1 over the other — that is the gradient signal that is *supposed* to push $G$ back out.`,
      widget: {
        type: 'FunctionPlot',
        props: {
          fns: [PD, PG, DSTAR],
          x: [-4, 4], y: [0, 1.1],
          params: [
            { name: 'm', min: -3, max: 3, value: 1.5, label: 'generator mean m' },
            { name: 's', min: 0.3, max: 1.5, value: 0.5, label: 'generator width s' },
          ],
          labels: ['p_data (two modes)', 'p_g (generator)', 'D*(x)'],
          xLabel: 'x', yLabel: 'density / D*',
        },
        caption: String.raw`At $m\approx\pm1.5$, $s=0.5$ the generator has **mode-collapsed**: it is perfect on one mode and absent from the other.`,
      },
    },
    {
      kind: 'explain',
      title: 'What the game actually minimizes',
      body: String.raw`Substitute $D^\star$ back into $V$:
$$V(D^\star,G)=\mathbb E_{p_{\text{data}}}\!\left[\log\frac{p_{\text{data}}}{p_{\text{data}}+p_g}\right]+\mathbb E_{p_g}\!\left[\log\frac{p_g}{p_{\text{data}}+p_g}\right]=-\log 4+2\,D_{\mathrm{JS}}(p_{\text{data}}\,\|\,p_g),$$
where the **Jensen–Shannon divergence** is the symmetric quantity
$$D_{\mathrm{JS}}(p\|q)=\tfrac12 D_{\mathrm{KL}}\big(p\big\|\tfrac{p+q}2\big)+\tfrac12 D_{\mathrm{KL}}\big(q\big\|\tfrac{p+q}2\big)\ \in[0,\log 2].$$

So with a perfect discriminator the generator is minimizing JS divergence, whose unique minimum is $p_g=p_{\text{data}}$, where $D^\star\equiv\tfrac12$ and $V=-\log4\approx-1.386$.

Three caveats, all of which matter in practice: $D$ is never optimal; it is a neural network, not an arbitrary function; and the generator takes one small step at a time rather than fully re-minimizing. The theorem describes a game that nobody actually plays.`,
    },
    {
      kind: 'numeric',
      prompt: String.raw`At the ideal equilibrium $p_g=p_{\text{data}}$, what value does $V(D^\star,G)$ take? (3 decimals)`,
      answer: -1.386,
      tolerance: 0.005,
      why: String.raw`When the densities match, $D^\star(x)=\tfrac12$ everywhere, so $V=\log\tfrac12+\log\tfrac12=-2\log2=-\log4\approx-1.386$. Equivalently $D_{\mathrm{JS}}=0$ in $V=-\log4+2D_{\mathrm{JS}}$. A discriminator loss hovering near $\log 4$ (its positive counterpart, $\approx1.386$) is the textbook sign of a balanced game.`,
    },
    {
      kind: 'explain',
      title: 'The saturating-gradient problem',
      body: String.raw`Early in training $G$ is terrible, $D$ wins easily, and $D(G(z))\approx0$. Write $D=\sigma(a)$ with $a$ the discriminator's logit. The generator's own term, $\log(1-D(G(z)))=\log(1-\sigma(a))$, has derivative $-\sigma(a)=-D$ with respect to the logit, which goes to $0$ when $D(G(z))\approx0$: the loss is flat in exactly the regime where the generator is losing. It receives almost no signal at the moment it needs one most.

Goodfellow et al.'s fix, used in essentially every implementation since, is the **non-saturating loss**. Instead of minimizing $\log(1-D(G(z)))$, *maximize* $\log D(G(z))$:
$$\mathcal L_G=-\mathbb E_{z}\big[\log D_\psi(G_\theta(z))\big].$$
Both want $D(G(z))$ to be large, but the second has logit-derivative $-(1-D)$, whose magnitude tends to $1$ when the generator is losing, instead of vanishing. (Measured against $D$ itself the slopes are $1/(1-D)$ and $1/D$; the sigmoid's factor $D(1-D)$ is what turns them into $D$ and $1-D$.) It is no longer the same minimax game (it no longer corresponds to minimizing JS), but it trains.`,
    },
    {
      kind: 'widget',
      title: 'Gradient magnitude vs how badly the generator is losing',
      body: String.raw`Horizontal axis: $D(G(z))$, the discriminator's current (mis)judgement of a fake. Vertical axis: how hard each generator loss pushes the discriminator's logit $a$, $|\partial\mathcal L_G/\partial a|$.`,
      widget: {
        type: 'FunctionPlot',
        props: {
          fns: ['x', '1-x'],
          x: [0, 1], y: [0, 1.1],
          labels: ['saturating: |∂ log(1−D)/∂a| = D', 'non-saturating: |∂(−log D)/∂a| = 1−D'],
          xLabel: 'D(G(z))', yLabel: 'gradient magnitude (w.r.t. logit)',
        },
        caption: String.raw`On the left ($D$ winning) the saturating loss gives $\approx0$ while the non-saturating loss gives $\approx1$. On the right the roles reverse, which is harmless: a generator that is already fooling $D$ does not need a shove.`,
      },
    },
    {
      kind: 'mcq',
      prompt: String.raw`Why do implementations train the generator to maximize $\log D(G(z))$ instead of minimizing $\log(1-D(G(z)))$?`,
      choices: [
        'It makes the game exactly equivalent to minimizing the Wasserstein distance',
        'It gives the generator large gradients precisely when the discriminator is confidently rejecting its samples',
        'It removes the need to train a discriminator at all',
        'It converts the minimax problem into a convex optimization problem',
      ],
      answer: 1,
      why: String.raw`The two objectives push in the same direction but with different gradient profiles: with respect to the logit, $-\log D$ has slope of magnitude $1-D\to1$ as $D(G(z))\to0$, exactly the early-training regime where $\log(1-D)$ has slope $D\to0$ and is flat. It is not the Wasserstein objective — that needs an unbounded, Lipschitz-constrained critic — and the problem remains non-convex and adversarial throughout.`,
    },
    {
      kind: 'explain',
      title: 'Mode collapse and other ways it goes wrong',
      body: String.raw`**Mode collapse.** The generator discovers one output (or a small family) that the current discriminator rates highly, and emits only that. Nothing in $\mathcal L_G$ rewards diversity: the generator is optimizing per-sample plausibility, not coverage. (An old intuition blames the order of $\min_G\max_D$ versus $\max_D\min_G$; later work has questioned that explanation, so treat the cause as not fully settled.) Collapse is often *cyclic*: $G$ hops from mode to mode, chased by $D$, and never settles.

**Vanishing gradients from a too-good discriminator.** If the supports of $p_g$ and $p_{\text{data}}$ barely overlap — likely, since both are low-dimensional surfaces in a high-dimensional space — a discriminator can separate them perfectly, and JS divergence sits at its maximum $\log 2$ with zero gradient almost everywhere. Arjovsky & Bottou (2017) analysed this formally.

**Non-convergence.** Even in simple games, simultaneous gradient descent–ascent can orbit the equilibrium rather than approach it.

The practical toolkit: the non-saturating loss, careful architecture (DCGAN conventions), **spectral normalization** of the discriminator (Miyato et al., 2018), **two time-scale** learning rates (Heusel et al., 2017), gradient penalties, large batches (BigGAN), and minibatch features that let $D$ notice a lack of variety.`,
    },
    {
      kind: 'multi',
      prompt: 'Which of these are real, commonly cited failure modes of GAN training? (Select all that apply.)',
      choices: [
        'The generator produces only a few distinct outputs regardless of the input noise',
        'A discriminator that separates real from fake almost perfectly leaves the generator with vanishing gradients',
        'The KL term of the objective collapses to zero so the latent is ignored',
        'Training oscillates indefinitely instead of converging to an equilibrium',
      ],
      answers: [0, 1, 3],
      why: String.raw`Mode collapse, vanishing gradients from an over-strong discriminator, and non-convergent oscillation are the classic three. A vanishing KL term is **posterior collapse**, which belongs to [VAEs](@ml/vaes) — a GAN has no KL term in its objective and no encoder to collapse.`,
    },
    {
      kind: 'explain',
      title: 'Wasserstein GAN: change the distance',
      body: String.raw`If the trouble is that JS divergence saturates when the two distributions do not overlap, use a distance that does not. The **Wasserstein-1** (earth-mover) distance
$$W_1(p,q)=\inf_{\gamma\in\Pi(p,q)}\ \mathbb E_{(x,y)\sim\gamma}\big[\lVert x-y\rVert\big]$$
is the minimum cost of transporting one pile of earth into the other. For two point masses a distance $d$ apart, $W_1=d$ — it varies smoothly with $d$, whereas JS is stuck at $\log 2$ for every $d>0$.

The infimum is intractable, but **Kantorovich–Rubinstein duality** turns it into a maximization:
$$W_1(p,q)=\sup_{\lVert f\rVert_L\le1}\ \mathbb E_{p}[f(x)]-\mathbb E_{q}[f(x)],$$
over all **1-Lipschitz** functions $f$. Parameterize $f$ by a network — now called a **critic**, because it outputs a real score rather than a probability — and you get WGAN (Arjovsky, Chintala & Bottou, 2017):
$$\min_G\ \max_{\psi:\ \lVert f_\psi\rVert_L\le1}\ \mathbb E_{p_{\text{data}}}[f_\psi(x)]-\mathbb E_{z}\big[f_\psi(G_\theta(z))\big].$$

Three consequences: there is no $\log$ and no sigmoid; you can and should train the critic to near-optimality each round, because a better critic now means a *better* gradient rather than a vanishing one; and the critic's value is a usable estimate of $W_1$, so for once the loss curve correlates with sample quality.

Enforcing the Lipschitz constraint is the hard part. The original paper clipped weights to $[-c,c]$, which the authors themselves called a poor solution; the **gradient penalty** $\lambda\big(\lVert\nabla_{\hat x}f_\psi(\hat x)\rVert_2-1\big)^2$ on points interpolated between real and fake (Gulrajani et al., 2017) and spectral normalization are the standard replacements.`,
    },
    {
      kind: 'truefalse',
      prompt: 'In a Wasserstein GAN it is beneficial to train the critic close to optimality before each generator update, whereas in the original GAN an over-trained discriminator can stall the generator.',
      answer: true,
      why: String.raw`This inversion is WGAN's selling point. Under $W_1$ the optimal critic supplies a well-behaved gradient everywhere, so WGAN implementations typically run several critic steps (often 5) per generator step. Under the Jensen–Shannon objective a near-perfect discriminator saturates, its outputs pinned at 0 and 1, and the generator's gradient vanishes.`,
    },
    {
      kind: 'explain',
      title: 'Evaluating a model with no likelihood',
      body: String.raw`You cannot report bits per dimension for a GAN — there is no density. The field settled on sample-based scores.

**Fréchet Inception Distance** (Heusel et al., 2017) is the standard. Embed real and generated images with the 2048-dimensional pool3 features of an Inception-v3 network, fit one Gaussian to each set, and take the Fréchet (Wasserstein-2) distance between those Gaussians:
$$\text{FID}=\lVert\mu_r-\mu_g\rVert_2^2+\operatorname{Tr}\!\Big(\Sigma_r+\Sigma_g-2\big(\Sigma_r\Sigma_g\big)^{1/2}\Big).$$
Lower is better; 0 means the two feature Gaussians coincide. It responds to both fidelity and diversity — a mode-collapsed generator has too small a $\Sigma_g$, which the trace term punishes.

Know its limits. FID assumes Gaussian features, depends on a particular ImageNet classifier (so it transfers poorly to faces, medical images or anything non-natural), is biased upward for small sample counts (50k generated images is the usual convention), and summarizes fidelity and diversity in one number. **Precision and recall** metrics separate those two axes, and the older **Inception Score** (Salimans et al., 2016) never looks at the real data at all, so it cannot detect memorization.`,
    },
    {
      kind: 'numeric',
      prompt: String.raw`In a toy 1-D "feature space", real features are $\mathcal N(0,1)$ and generated features are $\mathcal N(2,4)$. Compute the Fréchet distance $(\mu_r-\mu_g)^2+\sigma_r^2+\sigma_g^2-2\sigma_r\sigma_g$.`,
      answer: 5,
      tolerance: 0.01,
      why: String.raw`$(0-2)^2=4$ for the mean term, and the covariance term is $1+4-2\sqrt{1\cdot4}=5-4=1$, giving 5. In one dimension the covariance part collapses to $(\sigma_r-\sigma_g)^2$. Note that matching the mean alone is not enough: a generator with the right average but the wrong spread — the signature of mode collapse — still scores badly.`,
    },
    {
      kind: 'order',
      prompt: 'Order one iteration of standard (non-saturating) GAN training.',
      steps: [
        String.raw`Draw a minibatch of real $x$ and a minibatch of noise $z$`,
        String.raw`Generate fakes $G_\theta(z)$ and detach them from the generator's graph`,
        String.raw`Update $\psi$ by ascending $\log D_\psi(x)+\log\big(1-D_\psi(G_\theta(z))\big)$`,
        String.raw`Draw fresh noise, generate again, and this time keep the graph`,
        String.raw`Update $\theta$ by descending $-\log D_\psi(G_\theta(z))$, with $\psi$ frozen`,
      ],
      why: String.raw`Detaching during the discriminator step stops that gradient from reaching $G$ — a classic implementation bug when forgotten. The generator step needs the gradient to pass *through* the frozen discriminator and into $G$, which is why the fakes must be regenerated with the graph intact.`,
    },
    {
      kind: 'match',
      prompt: 'Match each idea to what it contributes.',
      pairs: [
        [String.raw`$D^\star=p_{\text{data}}/(p_{\text{data}}+p_g)$`, 'The optimal discriminator for a fixed generator'],
        ['Non-saturating loss', 'Large generator gradients while the discriminator is winning'],
        ['Jensen–Shannon divergence', 'What the idealized minimax game minimizes'],
        ['1-Lipschitz critic', 'Makes the critic estimate the Wasserstein-1 distance'],
        ['FID', 'Sample-based score comparing Inception feature statistics'],
      ],
      why: String.raw`The first three describe the original game and its one necessary repair; the fourth replaces the divergence itself to avoid saturation; the fifth is how anyone compares two GANs at all, since no likelihood is available.`,
    },
    {
      kind: 'fill',
      prompt: String.raw`With the optimal discriminator, the original GAN objective equals $-\log 4+2\,D_{\mathrm{JS}}(p_{\text{data}}\|p_g)$, so the generator is minimizing the ___ divergence. When a generator produces only a narrow slice of the data distribution, this is called ___. WGAN replaces the divergence with the ___ distance, estimated through a ___ critic.`,
      bank: ['Jensen–Shannon', 'Kullback–Leibler', 'mode collapse', 'posterior collapse', 'Wasserstein-1', 'total variation', '1-Lipschitz', 'sigmoid'],
      answer: ['Jensen–Shannon', 'mode collapse', 'Wasserstein-1', '1-Lipschitz'],
      why: String.raw`The $-\log4+2D_{\mathrm{JS}}$ identity is the content of Goodfellow et al.'s Theorem 1. Mode collapse is loss of *diversity*; posterior collapse is a VAE disease. Kantorovich–Rubinstein duality expresses $W_1$ as a supremum over 1-Lipschitz functions, which is precisely why the critic must be constrained — an unconstrained critic would drive the objective to infinity.`,
    },
    {
      kind: 'explain',
      title: 'Key takeaways',
      body: String.raw`- A GAN is an **implicit** model: a noise-to-data generator trained only through a discriminator. No density, no likelihood.
- Objective $V(D,G)=\mathbb E_{p_{\text{data}}}[\log D]+\mathbb E_{p_g}[\log(1-D)]$; the optimal $D^\star=p_{\text{data}}/(p_{\text{data}}+p_g)$ turns it into $-\log4+2D_{\mathrm{JS}}$.
- Usually use the **non-saturating** generator loss $-\log D(G(z))$: same fixed point, usable gradients early on.
- Signature failures: **mode collapse**, vanishing gradients from a too-strong discriminator, and oscillation.
- **WGAN** swaps JS for $W_1$ via a 1-Lipschitz critic (weight clipping, then gradient penalty or spectral norm), giving smoother gradients and a loss that tracks quality.
- Evaluate with **FID** (plus precision/recall), and remember it is an Inception-feature Gaussian approximation, not a likelihood.
- GANs remain useful where one-step sampling matters — including as fast distillations of [diffusion models](@ml/diffusion-models).`,
    },
  ],
  references: [
    { authors: 'I. J. Goodfellow, J. Pouget-Abadie, M. Mirza, B. Xu, D. Warde-Farley, S. Ozair, A. Courville & Y. Bengio', title: 'Generative Adversarial Nets', year: 2014, venue: 'NeurIPS', url: 'https://arxiv.org/abs/1406.2661' },
    { authors: 'M. Arjovsky & L. Bottou', title: 'Towards Principled Methods for Training Generative Adversarial Networks', year: 2017, venue: 'ICLR', url: 'https://arxiv.org/abs/1701.04862' },
    { authors: 'M. Arjovsky, S. Chintala & L. Bottou', title: 'Wasserstein GAN', year: 2017, venue: 'ICML', url: 'https://arxiv.org/abs/1701.07875' },
    { authors: 'I. Gulrajani, F. Ahmed, M. Arjovsky, V. Dumoulin & A. Courville', title: 'Improved Training of Wasserstein GANs', year: 2017, venue: 'NeurIPS', url: 'https://arxiv.org/abs/1704.00028' },
    { authors: 'M. Heusel, H. Ramsauer, T. Unterthiner, B. Nessler & S. Hochreiter', title: 'GANs Trained by a Two Time-Scale Update Rule Converge to a Local Nash Equilibrium', year: 2017, venue: 'NeurIPS', detail: 'introduces FID', url: 'https://arxiv.org/abs/1706.08500' },
    { authors: 'T. Miyato, T. Kataoka, M. Koyama & Y. Yoshida', title: 'Spectral Normalization for Generative Adversarial Networks', year: 2018, venue: 'ICLR', url: 'https://arxiv.org/abs/1802.05957' },
  ],
} satisfies LessonContent;
