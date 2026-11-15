import type { LessonContent } from '../../types';

const TAXONOMY = String.raw`<svg viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg" font-family="inherit">
  <defs>
    <style>
      .bx { fill: var(--surface); stroke: var(--fg); stroke-width: 0.9; rx: 4; }
      .lf { fill: var(--surface); stroke: var(--c2); stroke-width: 0.9; rx: 4; }
      .ln { stroke: var(--muted); stroke-width: 1; fill: none; }
      text { font-size: 9px; fill: var(--fg); }
      .m { fill: var(--muted); font-size: 8px; }
    </style>
  </defs>
  <rect class="bx" x="112" y="4" width="96" height="18"/>
  <text x="160" y="16" text-anchor="middle">model of p(x)</text>

  <path class="ln" d="M160,22 L160,30 L80,30 L80,40"><animate attributeName="stroke-dasharray" values="0 200;200 0" dur="1.6s" fill="freeze"/></path>
  <path class="ln" d="M160,22 L160,30 L268,30 L268,40"><animate attributeName="stroke-dasharray" values="0 200;200 0" dur="1.6s" fill="freeze"/></path>

  <rect class="bx" x="10" y="40" width="140" height="26"/>
  <text x="80" y="52" text-anchor="middle">explicit density</text>
  <text class="m" x="80" y="62" text-anchor="middle">you can score a given x</text>

  <rect class="bx" x="214" y="40" width="100" height="26"/>
  <text x="264" y="52" text-anchor="middle">implicit</text>
  <text class="m" x="264" y="62" text-anchor="middle">sampling only</text>

  <path class="ln" d="M80,66 L80,74 L54,74 L54,84"/>
  <path class="ln" d="M80,66 L80,74 L160,74 L160,84"/>
  <path class="ln" d="M264,66 L264,84"/>

  <rect class="bx" x="8" y="84" width="92" height="16"/>
  <text x="54" y="95" text-anchor="middle">exact log p(x)</text>
  <rect class="bx" x="110" y="84" width="100" height="16"/>
  <text x="160" y="95" text-anchor="middle">approximate</text>

  <rect class="lf" x="8" y="108" width="92" height="17"/>
  <text x="54" y="120" text-anchor="middle">autoregressive</text>
  <rect class="lf" x="8" y="130" width="92" height="17"/>
  <text x="54" y="142" text-anchor="middle">flows</text>

  <rect class="lf" x="110" y="108" width="100" height="17"/>
  <text x="160" y="120" text-anchor="middle">VAE (ELBO)</text>
  <rect class="lf" x="110" y="130" width="100" height="17"/>
  <text x="160" y="142" text-anchor="middle">energy-based</text>
  <rect class="lf" x="110" y="152" width="100" height="17"/>
  <text x="160" y="164" text-anchor="middle">diffusion</text>

  <rect class="lf" x="214" y="108" width="100" height="17"/>
  <text x="264" y="120" text-anchor="middle">GAN</text>

  <text class="m" x="8" y="182">fast, exact likelihood</text>
  <text class="m" x="8" y="193">slow or one-step sampling</text>
  <text class="m" x="214" y="182">sharp, fast samples</text>
  <text class="m" x="214" y="193">no likelihood at all</text>
</svg>`;

export default {
  cards: [
    {
      kind: 'explain',
      title: 'Learning to make new examples',
      body: String.raw`A classifier answers "is this a cat?". A **generative model** answers something harder: "what do cats look like?" — well enough to draw a cat nobody has ever seen.

Formally, you are given samples $x_1,\dots,x_n$ drawn from an unknown distribution $p_{\text{data}}(x)$ and you want a model $p_\theta(x)$ that is close to it. Note what is *missing*: there are no labels $y$. This is unsupervised learning.

The same machinery writes text, designs molecules, fills in missing pixels, compresses images and detects anomalies. The differences between the famous model families all come from one question: **what exactly are you willing to compute?**`,
    },
    {
      kind: 'explain',
      title: 'Three things you might want',
      body: String.raw`People say "generative model" for three quite different abilities, and almost no model gives all three cheaply:

1. **Sampling.** Produce a fresh $x\sim p_\theta$. This is what you need to *generate*.
2. **Density evaluation.** Given an $x$, return $p_\theta(x)$ (or $\log p_\theta(x)$). This is what you need for compression, anomaly detection and honest model comparison.
3. **Representation.** Produce a compact code $z$ that captures the structure of $x$, useful downstream.

A GAN gives you (1) only. A normalizing flow gives (1) and (2) exactly. A VAE gives (1) and (3) plus a *bound* on (2). Keep this checklist in mind — the rest of the unit is a tour of the trade-offs.`,
    },
    {
      kind: 'recall',
      title: 'Density estimation you have already met',
      points: [
        String.raw`A **Gaussian mixture** $p(x)=\sum_k\pi_k\,\mathcal N(x\mid\mu_k,\Sigma_k)$ is a generative model: sample a component, then sample from it.`,
        String.raw`**EM** fits it by alternating responsibilities $r_{ik}$ (E-step) with weighted re-estimates of $\pi_k,\mu_k,\Sigma_k$ (M-step).`,
        'EM never decreases the log-likelihood, but it can land in a local maximum.',
        'A mixture is the simplest latent-variable model: the latent variable is the component index.',
      ],
      link: 'ml/gmm-em',
    },
    {
      kind: 'widget',
      title: 'The family tree',
      body: String.raw`The first split is whether the model can **score** a point. An *explicit* model writes down a density you can evaluate; an *implicit* model is just a sampler — a function from noise to data, with no formula for how likely any particular $x$ is.`,
      widget: { type: 'SvgDiagram', props: { svg: TAXONOMY }, caption: 'Diffusion sits with the approximate-likelihood models: it optimizes a bound and samples by simulating a chain.' },
    },
    {
      kind: 'mcq',
      prompt: 'You want to flag anomalous network traffic by scoring how unlikely each new record is. Which family is the natural choice?',
      choices: [
        'A GAN, because it produces the sharpest samples',
        'A normalizing flow or an autoregressive model, because both give an exact log-likelihood',
        'Any model, since every generative model can report a density',
        'A VAE, because its ELBO is exactly the log-likelihood',
      ],
      answer: 1,
      why: String.raw`Anomaly scoring needs a number for a *given* $x$, which rules out implicit samplers like GANs — a GAN has no density function at all. Flows and autoregressive models evaluate $\log p_\theta(x)$ exactly. A VAE only gives a lower bound on $\log p_\theta(x)$, so a low ELBO is ambiguous: the model might be fine and the bound loose.`,
    },
    {
      kind: 'explain',
      title: 'Likelihood-based learning and its bias',
      body: String.raw`Likelihood-based models train by maximizing $\frac1n\sum_i\log p_\theta(x_i)$. As $n\to\infty$ this is the same as minimizing the **forward** KL divergence
$$D_{\mathrm{KL}}(p_{\text{data}}\,\|\,p_\theta)=\mathbb E_{p_{\text{data}}}\big[\log p_{\text{data}}(x)-\log p_\theta(x)\big].$$

The expectation is over the *data*, so the penalty is infinite wherever $p_{\text{data}}(x)>0$ but $p_\theta(x)\to0$. Forward KL is therefore **mode-covering** (also called zero-avoiding): the model would rather smear mass over empty regions than miss a real mode. This over-coverage is one commonly cited reason likelihood-trained models can produce blurry or occasionally nonsensical samples (though model capacity and the noise model matter too).

The **reverse** KL $D_{\mathrm{KL}}(p_\theta\|p_{\text{data}})$ takes the expectation over the model and is **mode-seeking**: it is happy to ignore whole modes as long as everything it does emit is plausible. See [entropy & KL](@stats/entropy-kl).`,
    },
    {
      kind: 'widget',
      title: 'Fitting a density is easy in 1D',
      body: String.raw`[Kernel density estimation](@ml/kernel-density-estimation) already solves low-dimensional density estimation: drop a bump on every data point. Slide the bandwidth and watch bias trade against variance.

Now imagine doing this for a $32\times32$ colour image, where $x$ lives in $\mathbb R^{3072}$. To cover that space with bumps the way we cover the line here you would need astronomically many samples. Deep generative models exist because **nonparametric density estimation does not survive high dimensions** — they replace "cover the space" with "learn structure".`,
      widget: { type: 'MlKDE', props: { n: 40, h: 0.4, showTrue: true } },
    },
    {
      kind: 'truefalse',
      prompt: 'A model can achieve excellent (low) test negative log-likelihood and still produce poor-looking samples.',
      answer: true,
      why: String.raw`Theis, van den Oord & Bethge (2016) made this precise: in high dimensions, likelihood and sample quality can be almost decoupled. Take a good model and mix it 1% good model, 99% white noise. The mixture's log-likelihood drops by at most $\log 100\approx4.6$ nats — negligible next to the thousands of nats in a 3072-dimensional image — yet 99 samples in 100 are pure noise. The converse also holds: a GAN can make beautiful samples while memorizing a few modes.`,
    },
    {
      kind: 'explain',
      title: 'Implicit models: a sampler without a density',
      body: String.raw`An implicit model defines $x=G_\theta(z)$ with $z\sim\mathcal N(0,I)$, and that is all. The density $p_\theta(x)$ exists in principle but is an intractable integral over all $z$ mapping to $x$; if $G_\theta$ maps a 100-dimensional $z$ into $\mathbb R^{3072}$, the model's support is a 100-dimensional surface and the density is not even a proper density on $\mathbb R^{3072}$.

So you cannot train it by maximum likelihood. Instead you need a **two-sample** criterion: a way to say "these fake samples look different from those real ones" using only samples from both sides. A learned classifier does exactly that, which is the [GAN](@ml/gans) idea.`,
    },
    {
      kind: 'explain',
      title: 'The trade-off triangle',
      body: String.raw`Practitioners talk about a **generative trilemma**: high sample quality, broad mode coverage and fast sampling — pick two.

- **Autoregressive** — exact likelihood, good coverage, but sampling costs one network pass *per dimension*.
- **Flow** — exact likelihood and one-pass sampling, bought with a restricted, invertible architecture.
- **VAE** — one-pass sampling and a useful code $z$, but only a bound on the likelihood, and blurry samples.
- **GAN** — one-pass sampling and sharp images, no likelihood, and coverage can collapse.
- **EBM** — flexible unnormalized density, but both training and sampling need MCMC.
- **Diffusion** — excellent quality and coverage, at the cost of many network passes per sample.

Nothing in this table is a law of nature — it summarizes where the field stands. Most progress since 2020 has been about moving a family to a better corner, for example distilling diffusion models down to one step.`,
    },
    {
      kind: 'multi',
      prompt: 'Which of these are genuine consequences of training by maximum likelihood (forward KL)? (Select all that apply.)',
      choices: [
        String.raw`The model is strongly penalized for assigning near-zero density to a real data point`,
        'The model is strongly penalized for putting density where there is no data',
        'The objective decomposes into a sum over training examples, so minibatch SGD applies',
        'The model is guaranteed to produce sharp, realistic samples',
      ],
      answers: [0, 2],
      why: String.raw`Forward KL averages $-\log p_\theta(x)$ over *real* points, so missing a real point costs a lot — that is the mode-covering, zero-avoiding behaviour. Putting mass on empty regions costs comparatively little, which is why likelihood models over-smooth. Independence across examples gives a sum, hence minibatching. Sharpness is simply not what the objective measures.`,
    },
    {
      kind: 'explain',
      title: 'How we report numbers',
      body: String.raw`Two scores dominate the literature.

**Bits per dimension (bpd)** for likelihood models. Convert the test negative log-likelihood of a $D$-dimensional example from nats to bits and divide by $D$:
$$\text{bpd}=\frac{-\log p_\theta(x)}{D\,\ln 2}.$$
It is literally the compression rate your model would achieve in bits per pixel-channel, so lower is better and the numbers are comparable across architectures (once everyone handles discrete pixels the same way, usually by *dequantizing* with uniform noise).

**FID** (Fréchet Inception Distance) for samplers. Push real and generated images through an Inception-v3 network, fit a Gaussian to each set of 2048-dimensional features, and take the Fréchet distance
$$\text{FID}=\lVert\mu_r-\mu_g\rVert^2+\operatorname{Tr}\!\big(\Sigma_r+\Sigma_g-2(\Sigma_r\Sigma_g)^{1/2}\big).$$
Lower is better. It needs no density, so it works for GANs — but it inherits whatever the Inception features happen to notice.`,
    },
    {
      kind: 'numeric',
      prompt: String.raw`A model assigns an average test negative log-likelihood of $6388$ nats to a $32\times32\times3$ image. What is its bits per dimension? (2 decimals)`,
      answer: 3.0,
      tolerance: 0.03,
      why: String.raw`$D=32\cdot32\cdot3=3072$ and $\text{bpd}=6388/(3072\ln 2)=6388/2129.3\approx3.00$. A raw 8-bit image costs 8 bpd, so this model compresses it to about 37% of its size. Forgetting the $\ln 2$ gives 2.08, which is the figure in *nats* per dimension, not bits.`,
    },
    {
      kind: 'match',
      prompt: 'Match each model family to the single trick that makes its likelihood tractable (or explains why it has none).',
      pairs: [
        ['Autoregressive', 'Chain rule: a product of 1D conditionals'],
        ['Normalizing flow', 'Invertible map plus the Jacobian determinant'],
        ['VAE', 'Variational lower bound on the log-likelihood'],
        ['Energy-based model', 'Unnormalized density; the partition function is left unevaluated'],
        ['GAN', 'No density: trained by a discriminator comparing samples'],
      ],
      why: String.raw`Each family picks a different escape route from the normalization problem. The chain rule normalizes one dimension at a time; a flow transports an already-normalized density and pays the change-of-variables factor; a VAE optimizes a bound instead of the real thing; an EBM refuses to normalize at all; a GAN abandons densities entirely.`,
    },
    {
      kind: 'fill',
      prompt: String.raw`Maximizing the likelihood is asymptotically the same as minimizing the ___ KL divergence, which is ___ and so tends to produce over-smoothed samples. A GAN instead needs only ___ from the model, never a density.`,
      bank: ['forward', 'reverse', 'mode-covering', 'mode-seeking', 'samples', 'gradients of the data', 'bits per dimension'],
      answer: ['forward', 'mode-covering', 'samples'],
      why: String.raw`Forward KL $D_{\mathrm{KL}}(p_{\text{data}}\|p_\theta)$ averages over real data, so it punishes missing modes far harder than wasted mass — mode-covering. Reverse KL does the opposite and is mode-seeking. GAN training only ever draws samples from $G_\theta$ and from the dataset.`,
    },
    {
      kind: 'order',
      prompt: 'Order the questions that pick a generative-model family for a new project.',
      steps: [
        'Do I need an exact likelihood (compression, anomaly scores, model comparison)?',
        'If not, do I need a latent representation I can encode into and manipulate?',
        'How many network evaluations can I afford per generated sample?',
        'Which failure mode hurts less: blurry averages or missing modes?',
        'Only then: pick the architecture and the evaluation metric to report',
      ],
      why: String.raw`Requirements first, architecture last. The likelihood question eliminates GANs immediately; the representation question separates VAEs and flows from plain autoregressive models; the compute budget separates one-pass models from iterative ones; and the failure-mode question is the honest version of "which looks better".`,
    },
    {
      kind: 'explain',
      title: 'Key takeaways',
      body: String.raw`- A generative model learns $p_\theta(x)\approx p_{\text{data}}(x)$ from unlabelled samples. Three separate abilities: **sample**, **score**, **encode**.
- **Explicit** models define a density; **implicit** models (GANs) define only a sampler, so they need a two-sample objective.
- Maximum likelihood = minimizing **forward KL** = mode-covering. Reverse KL is mode-seeking.
- Good likelihood and good samples can come apart in high dimensions (Theis et al., 2016). Report **bpd** for densities and **FID** for samplers, and distrust either alone.
- Coming up: [latent-variable models](@ml/latent-variable-models) and the ELBO, then [VAEs](@ml/vaes), [GANs](@ml/gans), [flows](@ml/normalizing-flows), [autoregressive models](@ml/autoregressive-models) and [energy-based models](@ml/energy-based-models).`,
    },
  ],
  references: [
    { authors: 'C. M. Bishop & H. Bishop', title: 'Deep Learning: Foundations and Concepts', year: 2024, venue: 'Springer', detail: 'Ch. 14, 17–20' },
    { authors: 'K. P. Murphy', title: 'Probabilistic Machine Learning: Advanced Topics', year: 2023, venue: 'MIT Press', detail: 'Ch. 20–24', url: 'https://probml.github.io/pml-book/book2.html' },
    { authors: 'L. Theis, A. van den Oord & M. Bethge', title: 'A Note on the Evaluation of Generative Models', year: 2016, venue: 'ICLR', url: 'https://arxiv.org/abs/1511.01844' },
    { authors: 'M. Heusel, H. Ramsauer, T. Unterthiner, B. Nessler & S. Hochreiter', title: 'GANs Trained by a Two Time-Scale Update Rule Converge to a Local Nash Equilibrium', year: 2017, venue: 'NeurIPS', detail: 'introduces FID', url: 'https://arxiv.org/abs/1706.08500' },
    { authors: 'I. Goodfellow, Y. Bengio & A. Courville', title: 'Deep Learning', year: 2016, venue: 'MIT Press', detail: 'Ch. 20', url: 'https://www.deeplearningbook.org/' },
  ],
} satisfies LessonContent;
