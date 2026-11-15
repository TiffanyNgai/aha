import type { LessonContent } from '../../types';

const ARCH = String.raw`<svg viewBox="0 0 320 170" xmlns="http://www.w3.org/2000/svg" font-family="inherit">
  <defs>
    <marker id="vaeA" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="5" markerHeight="5" orient="auto">
      <path d="M0,0 L8,4 L0,8 z" fill="var(--muted)"/>
    </marker>
    <style>
      .b { fill: var(--surface); stroke: var(--fg); stroke-width: 0.9; rx: 4; }
      .e { fill: var(--surface); stroke: var(--c2); stroke-width: 1.1; rx: 4; }
      .d { fill: var(--surface); stroke: var(--c3); stroke-width: 1.1; rx: 4; }
      .a { stroke: var(--muted); stroke-width: 1; fill: none; marker-end: url(#vaeA); }
      text { font-size: 9px; fill: var(--fg); }
      .m { fill: var(--muted); font-size: 8px; }
    </style>
  </defs>
  <rect class="b" x="6" y="52" width="34" height="30"/>
  <text x="23" y="71" text-anchor="middle">x</text>
  <path class="a" d="M41,67 L55,67"/>
  <rect class="e" x="56" y="44" width="46" height="46"/>
  <text x="79" y="63" text-anchor="middle">encoder</text>
  <text class="m" x="79" y="76" text-anchor="middle">q_φ(z|x)</text>
  <path class="a" d="M103,58 L119,42"/>
  <path class="a" d="M103,76 L119,92"/>
  <rect class="b" x="120" y="30" width="30" height="22"/>
  <text x="135" y="45" text-anchor="middle">μ</text>
  <rect class="b" x="120" y="82" width="30" height="22"/>
  <text x="135" y="97" text-anchor="middle">σ</text>
  <circle cx="135" cy="134" r="12" fill="var(--surface)" stroke="var(--c4)" stroke-width="1.1"/>
  <text x="135" y="137" text-anchor="middle">ε</text>
  <text class="m" x="135" y="158" text-anchor="middle">ε ~ N(0, I)</text>
  <path class="a" d="M151,41 L172,55"/>
  <path class="a" d="M151,93 L172,64"/>
  <path class="a" d="M147,130 L172,72"/>
  <rect class="b" x="173" y="52" width="38" height="30"/>
  <text x="192" y="65" text-anchor="middle">z</text>
  <text class="m" x="192" y="76" text-anchor="middle">μ+σ⊙ε</text>
  <path class="a" d="M212,67 L226,67"/>
  <rect class="d" x="227" y="44" width="46" height="46"/>
  <text x="250" y="63" text-anchor="middle">decoder</text>
  <text class="m" x="250" y="76" text-anchor="middle">p_θ(x|z)</text>
  <path class="a" d="M274,67 L288,67"/>
  <rect class="b" x="289" y="52" width="27" height="30"/>
  <text x="302" y="71" text-anchor="middle">x̂</text>
  <text class="m" x="6" y="18">gradients flow back through the whole chain:</text>
  <text class="m" x="6" y="29">the randomness sits in ε, off to the side</text>
  <path d="M300,96 L300,110 L60,110 L60,96" stroke="var(--c5)" stroke-width="0.9" fill="none" stroke-dasharray="3 2" marker-end="url(#vaeA)">
    <animate attributeName="stroke-dashoffset" values="20;0" dur="1.5s" repeatCount="indefinite"/>
  </path>
  <text class="m" x="180" y="122" text-anchor="middle" fill="var(--c5)">∇ of the ELBO</text>
</svg>`;

export default {
  cards: [
    {
      kind: 'explain',
      title: 'An autoencoder that can dream',
      body: String.raw`An ordinary autoencoder squeezes $x$ through a bottleneck and reconstructs it. Useful — but you cannot *generate* with it. Pick a random point in its code space and the decoder usually returns garbage, because nothing ever told the encoder what the code space should look like as a whole.

A **variational autoencoder** (Kingma & Welling, 2014; Rezende, Mohamed & Wierstra, 2014) fixes this with two changes:
1. the encoder outputs a **distribution** $q_\phi(z\mid x)$, not a point;
2. that distribution is pushed toward a fixed prior $p(z)=\mathcal N(0,I)$.

Now the whole code space is populated, so sampling $z\sim\mathcal N(0,I)$ and decoding gives a plausible new $x$. It is a latent-variable model that happens to be trained with an encoder bolted on.`,
    },
    {
      kind: 'recall',
      title: 'The ELBO',
      points: [
        String.raw`A latent-variable model is $p_\theta(x)=\int p_\theta(x\mid z)p(z)\,dz$, and the posterior $p_\theta(z\mid x)$ is intractable.`,
        String.raw`**Exact identity:** $\log p_\theta(x)=\mathcal L+D_{\mathrm{KL}}\big(q(z)\|p_\theta(z\mid x)\big)$, so the ELBO $\mathcal L$ is a lower bound.`,
        String.raw`Implementable form: $\mathcal L=\mathbb E_{q}[\log p_\theta(x\mid z)]-D_{\mathrm{KL}}\big(q(z)\|p(z)\big)$.`,
        'EM is coordinate ascent on this bound; variational inference optimizes a restricted q instead.',
      ],
      link: 'ml/latent-variable-models',
    },
    {
      kind: 'explain',
      title: 'Amortized inference',
      body: String.raw`Classical variational inference keeps private parameters $(m_i,s_i)$ for every training point $x_i$ and re-optimizes them after every update to $\theta$. For a million images that is a million little optimizations per epoch.

The VAE **amortizes** the cost: one neural network $q_\phi(z\mid x)=\mathcal N\big(\mu_\phi(x),\operatorname{diag}\sigma_\phi^2(x)\big)$ predicts the variational parameters for *any* $x$ in a single forward pass. Inference becomes a function call.

You pay for this with the **amortization gap**: a shared network cannot hit the per-example optimum exactly, so $\mathcal L$ sits a little below even the best achievable bound. The total slack is therefore two gaps stacked — the approximation gap (diagonal Gaussians cannot equal the true posterior) plus the amortization gap (Cremer, Li & Duvenaud, 2018).`,
    },
    {
      kind: 'explain',
      title: 'The objective, written out',
      body: String.raw`For one example, with $z\in\mathbb R^M$ and prior $\mathcal N(0,I)$:
$$\mathcal L(\theta,\phi;x)=\underbrace{\mathbb E_{q_\phi(z\mid x)}\big[\log p_\theta(x\mid z)\big]}_{\text{reconstruction}}-\underbrace{D_{\mathrm{KL}}\big(q_\phi(z\mid x)\,\big\|\,\mathcal N(0,I)\big)}_{\text{rate}}.$$

The KL term has a closed form for diagonal Gaussians — no sampling needed:
$$D_{\mathrm{KL}}=\tfrac12\sum_{j=1}^{M}\Big(\mu_j^2+\sigma_j^2-1-\log\sigma_j^2\Big).$$
It is zero exactly when $\mu=0$ and $\sigma=1$, and it grows if the encoder either shifts the code away from the origin or makes it more certain than the prior.

The reconstruction term is estimated with a single sample of $z$ per example — surprisingly, that is enough, because SGD averages over examples anyway. Which leaves one problem: how do you differentiate through a sampling step?`,
    },
    {
      kind: 'widget',
      title: 'The reparameterization trick',
      widget: {
        type: 'StepReveal',
        props: {
          steps: [
            String.raw`**The problem.** We need $\nabla_\phi\,\mathbb E_{q_\phi(z\mid x)}[f(z)]$, but $\phi$ sits in the *distribution we sample from*, not in $f$. Backpropagation has no path through "draw a sample".`,
            String.raw`**The generic fix (score function / REINFORCE).** $\nabla_\phi\mathbb E_{q_\phi}[f]=\mathbb E_{q_\phi}\big[f(z)\,\nabla_\phi\log q_\phi(z\mid x)\big]$. Unbiased, works for discrete $z$ — but its variance is notoriously large, because $f(z)$ multiplies the whole gradient.`,
            String.raw`**The reparameterization.** Move the randomness out of the parameters: write $z=\mu_\phi(x)+\sigma_\phi(x)\odot\varepsilon$ with $\varepsilon\sim\mathcal N(0,I)$ fixed and parameter-free. Then $z\sim q_\phi(z\mid x)$ exactly.`,
            String.raw`**Now the expectation no longer depends on $\phi$:** $\mathbb E_{q_\phi}[f(z)]=\mathbb E_{\varepsilon\sim\mathcal N(0,I)}\big[f(\mu_\phi+\sigma_\phi\odot\varepsilon)\big]$, so $\nabla_\phi$ passes straight inside and hits $f$ through the chain rule.`,
            String.raw`**Why it helps.** This *pathwise* estimator uses $\nabla f$, not just the value of $f$, so it typically has far lower variance. One sample per example usually suffices.`,
            String.raw`**The catch.** It needs $z$ to be a differentiable function of $\phi$ and of parameter-free noise. That rules out discrete latents, which is why discrete VAEs need Gumbel-softmax relaxations, vector quantization with a straight-through estimator, or the score-function estimator after all.`,
          ],
          notes: ['Sampling blocks the gradient.', 'One general answer, with a variance problem.', 'A location–scale rewrite.', 'The expectation is now over fixed noise.', 'Gradients of f, not just values of f.', 'Continuous latents only.'],
        },
      },
    },
    {
      kind: 'widget',
      title: 'Where the gradient flows',
      body: String.raw`The stochastic node $\varepsilon$ hangs off to the side. Every arrow on the main path — $x\to\mu,\sigma\to z\to\hat x$ — is a deterministic, differentiable function, so one backward pass trains the encoder and the decoder together.`,
      widget: { type: 'SvgDiagram', props: { svg: ARCH }, caption: 'Without the reparameterization, the backward arrow would stop dead at the sampling step.' },
    },
    {
      kind: 'mcq',
      prompt: 'What is the main practical advantage of the reparameterization (pathwise) gradient estimator over the score-function (REINFORCE) estimator for a VAE?',
      choices: [
        'It is unbiased, whereas the score-function estimator is biased',
        'It has much lower variance, because it differentiates through the sampled value instead of weighting by the loss',
        'It works for discrete latent variables, which the score-function estimator cannot handle',
        'It removes the need to sample z at all',
      ],
      answer: 1,
      why: String.raw`Both estimators are unbiased; variance is the whole story. The pathwise estimator uses $\nabla_z f$, so it knows which *direction* to move the code, while the score-function estimator only reweights random directions by $f(z)$. On discrete latents the situation reverses: there the score-function estimator still applies and the reparameterization does not. And a sample of $\varepsilon$ is still drawn every step.`,
    },
    {
      kind: 'numeric',
      prompt: String.raw`For a one-dimensional latent, the encoder outputs $\mu=1$ and $\sigma=0.5$. What is $D_{\mathrm{KL}}\big(\mathcal N(1,0.25)\,\|\,\mathcal N(0,1)\big)$ in nats? (3 decimals)`,
      answer: 0.818,
      tolerance: 0.004,
      why: String.raw`$\tfrac12(\mu^2+\sigma^2-1-\log\sigma^2)=\tfrac12\big(1+0.25-1-\log 0.25\big)=\tfrac12(0.25+1.386)=0.818$ nats. Both deviations cost: the shifted mean contributes $\mu^2/2=0.5$, and being *more* certain than the prior contributes the rest. A perfectly uninformative code ($\mu=0,\sigma=1$) would cost 0.`,
    },
    {
      kind: 'widget',
      title: 'A latent space you can sample from',
      body: String.raw`Six training images are encoded at the numbered posteriors; the dashed rings are the prior. Drag the dot, or press **Sample p(z)** to draw $z\sim\mathcal N(0,I)$ and decode it.

Two things to notice. Land on a posterior and the output is crisp. Land in a **gap between** posteriors — which the prior happily does — and the decoder returns an average of several images: a smudge that looks like nothing in the training set. Press **Grid** for the classic latent-manifold picture, and raise $\tau$ to make the decoder smoother and the blur worse.`,
      widget: { type: 'MlVaeLatent', props: { tau: 0.5, z: [0.9, 0.6] } },
    },
    {
      kind: 'explain',
      title: 'Why VAE samples look blurry',
      body: String.raw`Two distinct causes, often confused.

**1. The likelihood.** With $p_\theta(x\mid z)=\mathcal N\big(f_\theta(z),\sigma^2 I\big)$ the reconstruction term is $-\|x-f_\theta(z)\|^2/2\sigma^2+$const, so the decoder's optimum is the **conditional mean** $\mathbb E[x\mid z]$. If a code is consistent with an edge at pixel 40 or at pixel 42, the mean puts a soft grey ramp across both. Averaging in pixel space *is* blur. A GAN never averages, because its objective asks "is this plausible?", not "is this close on average?".

**2. The prior hole.** The **aggregate posterior** $q_\phi(z)=\frac1n\sum_i q_\phi(z\mid x_i)$ is what the decoder actually sees during training, and it need not match $p(z)=\mathcal N(0,I)$. Wherever the prior puts mass that the aggregate posterior does not, you sample codes the decoder has never been trained on — the gaps in the widget. This is a mismatch at generation time only; reconstructions can look fine while samples do not.

Fixes used in practice: richer likelihoods (a discretized logistic or an autoregressive decoder), learned priors (VampPrior, or a second-stage model fitted to $q_\phi(z)$), and discrete latents (**VQ-VAE**, van den Oord et al. 2017), which is why modern systems use a VAE as a *compressor* and fit a second generative model in its latent space — exactly the recipe of [latent diffusion](@ml/latent-diffusion).`,
    },
    {
      kind: 'multi',
      prompt: 'Which of these genuinely contribute to blurry VAE samples? (Select all that apply.)',
      choices: [
        'A Gaussian likelihood makes the optimal decoder output the conditional mean of all images consistent with the code',
        'The aggregate posterior does not match the prior, so sampled codes land where the decoder was never trained',
        'The reparameterization trick introduces bias into the gradient',
        'The KL term is computed in closed form instead of by sampling, which smooths the decoder',
      ],
      answers: [0, 1],
      why: String.raw`Pixel-space averaging and prior holes are the two direct causes. The reparameterization estimator is exactly unbiased — its merit is low variance — and the closed-form KL is simply the exact value of that term; neither adds blur. (A loose bound can also matter, but it is a weaker and less settled explanation than these two.)`,
    },
    {
      kind: 'explain',
      title: 'Posterior collapse',
      body: String.raw`The opposite failure. Look at the objective again:
$$\mathcal L=\mathbb E_{q_\phi}[\log p_\theta(x\mid z)]-D_{\mathrm{KL}}\big(q_\phi(z\mid x)\,\|\,p(z)\big).$$
Setting $q_\phi(z\mid x)=p(z)$ for every $x$ makes the second term exactly **zero**. That is a free win, and it is only a bad deal if the decoder can use $z$ to improve the first term by more than the KL costs.

So if the decoder is powerful enough to model $x$ on its own — a strong autoregressive decoder for text is the classic case (Bowman et al., 2016) — the model settles into **posterior collapse**: $z$ carries no information, the encoder is ignored and you are left with an ordinary language model wearing a VAE costume. Often only a few latent dimensions survive while the rest collapse.

There is an information-theoretic reading: the KL term is the **rate** of the code in nats, and the model will pay zero rate unless the distortion saving exceeds it. Standard remedies:
- **KL annealing**: multiply the KL by $\beta$ ramped from 0 to 1, so the model first learns to use $z$;
- **free bits** (Kingma et al., 2016): stop charging for the KL of a dimension until it exceeds $\lambda$ nats;
- **weaken the decoder**, e.g. by limiting its context or dropping input words;
- **discrete latents** (VQ-VAE), whose fixed uniform prior makes the KL term a constant, so there is no KL pressure towards the prior (though VQ models have their own failure, codebook collapse).

The $\beta$ knob is interesting in its own right: **$\beta$-VAE** (Higgins et al., 2017) keeps $\beta>1$ permanently, trading reconstruction quality for more factorized, often more interpretable codes.`,
    },
    {
      kind: 'truefalse',
      prompt: 'During posterior collapse the ELBO becomes very negative, so it is easy to spot in the training loss alone.',
      answer: false,
      why: String.raw`Collapse is a *good* local optimum of the ELBO, not a bad one: the model gives up the KL cost and the total bound is often respectable. The symptom is the KL term going to ≈0 nats while reconstruction stalls at whatever the unconditional decoder can do. That is why practitioners log the reconstruction and KL terms separately rather than just the ELBO.`,
    },
    {
      kind: 'order',
      prompt: 'Order one VAE training step on a minibatch.',
      steps: [
        String.raw`Encode: compute $\mu_\phi(x)$ and $\sigma_\phi(x)$`,
        String.raw`Compute the closed-form $D_{\mathrm{KL}}\big(q_\phi(z\mid x)\|\mathcal N(0,I)\big)$ from $\mu$ and $\sigma$`,
        String.raw`Draw $\varepsilon\sim\mathcal N(0,I)$ and set $z=\mu+\sigma\odot\varepsilon$`,
        String.raw`Decode $z$ and evaluate $\log p_\theta(x\mid z)$`,
        String.raw`Backpropagate $-\mathcal L$ through decoder, $z$, and encoder; update $\theta$ and $\phi$ together`,
      ],
      why: String.raw`The KL needs only the encoder's outputs, so it is computed analytically and never sampled. The single $\varepsilon$ draw is what makes the reconstruction term differentiable in $\phi$. Encoder and decoder share one objective and one backward pass — there is no alternating inner loop as in EM.`,
    },
    {
      kind: 'fill',
      prompt: String.raw`In the reparameterization trick we write $z = $ ___ $+$ ___ $\odot\,\varepsilon$ with $\varepsilon\sim\mathcal N(0,I)$. If the KL term of a trained VAE sits at almost 0 nats, the model is suffering from ___.`,
      bank: ['μ_φ(x)', 'σ_φ(x)', 'posterior collapse', 'mode collapse', 'ε', 'the amortization gap'],
      answer: ['μ_φ(x)', 'σ_φ(x)', 'posterior collapse'],
      why: String.raw`The location–scale form moves all the randomness into $\varepsilon$. A KL of ~0 means $q_\phi(z\mid x)$ has become the prior for every $x$, so the code carries no information: posterior collapse. *Mode collapse* is a different disease, belonging to [GANs](@ml/gans), where the generator emits only a few kinds of sample.`,
    },
    {
      kind: 'match',
      prompt: 'Match each VAE phenomenon to its cause.',
      pairs: [
        ['Blurry samples', 'A Gaussian likelihood makes the decoder predict a conditional mean'],
        ['Posterior collapse', 'A decoder strong enough that the KL cost of using z is not worth paying'],
        ['Amortization gap', 'One shared encoder cannot hit each example’s optimal q'],
        ['Approximation gap', 'A diagonal Gaussian q cannot equal the true posterior'],
        ['Samples worse than reconstructions', 'The aggregate posterior does not match the prior'],
      ],
      why: String.raw`The two gaps are about *inference* quality and both make the bound looser. Blur and collapse are about the *objective*'s incentives. The reconstruction-versus-sample discrepancy is purely a mismatch between $q_\phi(z)$ and $p(z)$, and is the one you can diagnose by decoding codes drawn from the aggregate posterior instead of the prior.`,
    },
    {
      kind: 'explain',
      title: 'Key takeaways',
      body: String.raw`- A VAE is a latent-variable model trained on the ELBO with an **amortized** encoder $q_\phi(z\mid x)=\mathcal N(\mu_\phi,\operatorname{diag}\sigma_\phi^2)$.
- $\mathcal L=\mathbb E_{q_\phi}[\log p_\theta(x\mid z)]-D_{\mathrm{KL}}(q_\phi\|p)$; the KL is closed form, $\tfrac12\sum_j(\mu_j^2+\sigma_j^2-1-\log\sigma_j^2)$.
- The **reparameterization trick** $z=\mu+\sigma\odot\varepsilon$ makes the sampling step differentiable and gives a low-variance, unbiased gradient. Continuous latents only.
- **Blurry samples** come from pixel-space averaging under a Gaussian likelihood plus holes between the aggregate posterior and the prior.
- **Posterior collapse** is the KL term reaching 0 because the decoder does not need $z$; fight it with annealing, free bits, a weaker decoder or discrete latents.
- A fixed forward noising process turns this same ELBO into [diffusion](@ml/diffusion-models); a VAE used purely as a compressor is the first stage of [latent diffusion](@ml/latent-diffusion).`,
    },
  ],
  references: [
    { authors: 'D. P. Kingma & M. Welling', title: 'Auto-Encoding Variational Bayes', year: 2014, venue: 'ICLR', url: 'https://arxiv.org/abs/1312.6114' },
    { authors: 'D. J. Rezende, S. Mohamed & D. Wierstra', title: 'Stochastic Backpropagation and Approximate Inference in Deep Generative Models', year: 2014, venue: 'ICML', url: 'https://arxiv.org/abs/1401.4082' },
    { authors: 'C. Cremer, X. Li & D. Duvenaud', title: 'Inference Suboptimality in Variational Autoencoders', year: 2018, venue: 'ICML', url: 'https://arxiv.org/abs/1801.03558' },
    { authors: 'D. P. Kingma, T. Salimans, R. Jozefowicz, X. Chen, I. Sutskever & M. Welling', title: 'Improved Variational Inference with Inverse Autoregressive Flow', year: 2016, venue: 'NeurIPS', detail: 'introduces free bits', url: 'https://arxiv.org/abs/1606.04934' },
    { authors: 'S. R. Bowman, L. Vilnis, O. Vinyals, A. M. Dai, R. Jozefowicz & S. Bengio', title: 'Generating Sentences from a Continuous Space', year: 2016, venue: 'CoNLL', url: 'https://arxiv.org/abs/1511.06349' },
    { authors: 'I. Higgins, L. Matthey, A. Pal, C. Burgess, X. Glorot, M. Botvinick, S. Mohamed & A. Lerchner', title: 'beta-VAE: Learning Basic Visual Concepts with a Constrained Variational Framework', year: 2017, venue: 'ICLR' },
    { authors: 'A. van den Oord, O. Vinyals & K. Kavukcuoglu', title: 'Neural Discrete Representation Learning (VQ-VAE)', year: 2017, venue: 'NeurIPS', url: 'https://arxiv.org/abs/1711.00937' },
  ],
} satisfies LessonContent;
