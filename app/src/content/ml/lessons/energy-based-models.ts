import type { LessonContent } from '../../types';

// Positive phase pushes energy down at the data; negative phase pushes it up at model samples.
const PHASES_SVG = `<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg">
<defs>
  <marker id="dn" viewBox="0 0 6 6" refX="5" refY="3" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="var(--c1)"/></marker>
  <marker id="up" viewBox="0 0 6 6" refX="5" refY="3" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="var(--c5)"/></marker>
</defs>
<text x="160" y="13" font-size="9.5" text-anchor="middle" fill="var(--fg)">one gradient step on an energy function</text>
<path d="M14,52 C60,120 90,40 130,74 C170,106 210,38 250,82 C275,108 292,70 306,84" fill="none" stroke="var(--c3)" stroke-width="1.8"/>
<text x="14" y="46" font-size="8.5" fill="var(--c3)">E(x)</text>
<g>
  <circle cx="70" cy="86" r="3.2" fill="var(--c1)"/><circle cx="86" cy="72" r="3.2" fill="var(--c1)"/><circle cx="196" cy="66" r="3.2" fill="var(--c1)"/>
  <line x1="70" y1="92" x2="70" y2="112" stroke="var(--c1)" stroke-width="1.3" marker-end="url(#dn)"/>
  <line x1="86" y1="78" x2="86" y2="98" stroke="var(--c1)" stroke-width="1.3" marker-end="url(#dn)"/>
  <line x1="196" y1="72" x2="196" y2="92" stroke="var(--c1)" stroke-width="1.3" marker-end="url(#dn)"/>
  <animate attributeName="opacity" values="1;0.35;1" dur="3s" repeatCount="indefinite"/>
</g>
<g>
  <circle cx="140" cy="80" r="3.2" fill="var(--c5)"/><circle cx="268" cy="86" r="3.2" fill="var(--c5)"/>
  <line x1="140" y1="74" x2="140" y2="54" stroke="var(--c5)" stroke-width="1.3" marker-end="url(#up)"/>
  <line x1="268" y1="80" x2="268" y2="60" stroke="var(--c5)" stroke-width="1.3" marker-end="url(#up)"/>
  <animate attributeName="opacity" values="0.35;1;0.35" dur="3s" repeatCount="indefinite"/>
</g>
<text x="14" y="132" font-size="9" fill="var(--c1)">positive phase: real data x ~ p_data — push E DOWN</text>
<text x="14" y="146" font-size="9" fill="var(--c5)">negative phase: model samples x′ ~ p_θ — push E UP</text>
<text x="14" y="162" font-size="8.5" fill="var(--fg)">∇_θ(−log p_θ(x)) = ∇_θE_θ(x) − E_{x′~p_θ}[∇_θE_θ(x′)]</text>
<text x="14" y="174" font-size="8" fill="var(--muted)">At the optimum the two pulls cancel: the model generates what the data look like.</text>
</svg>`;

const MCMC_SVG = `<svg viewBox="0 0 320 150" xmlns="http://www.w3.org/2000/svg">
<text x="160" y="13" font-size="9.5" text-anchor="middle" fill="var(--fg)">where the negative samples come from</text>
${[['CD-k', 'start the chain at a data point, run k steps', 'var(--c2)', 36],
  ['PCD', 'keep a buffer of chains alive across updates', 'var(--c4)', 72],
  ['short-run MCMC', 'start from noise, run a fixed small budget', 'var(--c6)', 108]]
    .map(([n, d, c, y]) => `<rect x="10" y="${(y as number) - 14}" width="94" height="22" rx="4" fill="${c}" fill-opacity="0.22" stroke="${c}" stroke-width="0.9"/>` +
      `<text x="57" y="${(y as number)}" font-size="9" text-anchor="middle" fill="var(--fg)">${n}</text>` +
      `<text x="114" y="${(y as number)}" font-size="8.5" fill="var(--muted)">${d}</text>`).join('')}
<text x="10" y="134" font-size="8" fill="var(--fg)">All three are biased: none runs the chain to equilibrium. They differ in how the bias shows up —</text>
<text x="10" y="145" font-size="8" fill="var(--fg)">CD never raises E at modes far from the data; PCD and short-run chains can oscillate or diverge.</text>
</svg>`;

export default {
  cards: [
    {
      kind: 'explain',
      title: 'Score first, normalize later',
      body: String.raw`Most of the other models in this unit are built so that their probabilities add to one *by construction*: a softmax, a Gaussian, an invertible map, a decoder. That constraint is what forces the architecture into a particular shape.

An **energy-based model** throws the constraint away. Pick *any* function $E_\theta:\mathcal X\to\mathbb R$ you like — a ResNet ending in a single scalar is perfectly fine — and read it as a score of **implausibility**: low energy means "this looks like real data", high energy means "this does not".

Then declare

$$p_\theta(x)=\frac{e^{-E_\theta(x)}}{Z_\theta},\qquad Z_\theta=\int e^{-E_\theta(x)}\,dx.$$

The exponential makes it positive; dividing by $Z_\theta$ makes it integrate to one. Total architectural freedom — bought with one integral that is, in general, impossible to compute. The whole of this lesson is about living with that integral.`,
    },
    {
      kind: 'recall',
      title: 'Where the formula comes from',
      points: [
        'In statistical physics, a system in contact with a heat bath at temperature $T$ occupies state $x$ with probability $p(x)\\propto e^{-E(x)/k_BT}$ — the **Boltzmann distribution**.',
        'Low-energy states are exponentially more likely; the energy *scale* relative to $k_BT$ sets how sharply.',
        'The normalizer $Z=\\sum_x e^{-E(x)/k_BT}$ is the **partition function**, and $-k_BT\\log Z$ is the free energy.',
        'Only energy **differences** matter: adding a constant to $E$ multiplies $e^{-E}$ and $Z$ by the same factor.',
      ],
      link: 'physics/boltzmann-distribution',
    },
    {
      kind: 'explain',
      title: 'An unnormalized model is still a model',
      body: String.raw`In machine learning we set $k_BT=1$ (any temperature can be absorbed into $E_\theta$) and write $p_\theta(x)\propto e^{-E_\theta(x)}$.

Two consequences follow immediately, and they are the two faces of the same coin.

**The good face.** *Ratios* are free of $Z_\theta$:
$$\frac{p_\theta(x_1)}{p_\theta(x_2)}=e^{\,E_\theta(x_2)-E_\theta(x_1)}.$$
So is the gradient of the log-density in $x$, the **score**: $\nabla_x\log p_\theta(x)=-\nabla_xE_\theta(x)$, because $Z_\theta$ does not depend on $x$. Anything you can phrase in terms of comparisons or local gradients, you can compute.

**The bad face.** Any *absolute* probability needs $Z_\theta$, a $d$-dimensional integral over all of image space or all of configuration space. For a $32\times32$ RGB image that integral is over $\mathbb R^{3072}$. There is no closed form and no practical quadrature.`,
    },
    {
      kind: 'widget',
      title: 'Energy, density and sampling in one picture',
      body: String.raw`Top: an energy $E(x)$ with two wells. Bottom: the density $p(x)=e^{-E(x)/T}/Z$ it defines, with $Z$ computed here by brute-force numerical integration — a luxury available in one dimension and nowhere else.

Three things to try.
- Press **shift E by +5**. Watch the energy axis: every label climbs by 5, and the printed $Z$ falls by exactly the factor $e^{-5/T}$. The blue density below does not move at all. $Z$ absorbs the constant exactly, which is why an EBM only ever pins down energy *differences*.
- Raise the **barrier**, then press **↺ reset chains** so the histogram starts clean. The two wells stay where they are, but the Langevin chains stop crossing between them, and the histogram takes far longer to match the blue curve. That is **slow mixing**, and it is the practical reason EBM training is hard.
- Raise **T**. The density flattens: at high temperature the energy landscape barely matters.`,
      widget: { type: 'MlEnergyLandscape', props: { barrier: 2, temperature: 1, walkers: 40 }, caption: 'The dots are unadjusted Langevin chains $x\\leftarrow x-\\varepsilon\\nabla E(x)/T+\\sqrt{2\\varepsilon}\\,\\xi$ — gradient descent on energy plus noise.' },
    },
    {
      kind: 'numeric',
      prompt: String.raw`A tiny energy-based model has exactly three possible states, with energies $E=0$, $E=1$ and $E=2$ (and $T=1$). What probability does it assign to the lowest-energy state? (4 decimal places)`,
      answer: 0.6652,
      tolerance: 0.0008,
      why: String.raw`$Z=e^{0}+e^{-1}+e^{-2}=1+0.36788+0.13534=1.50321$, so $p=1/1.50321=0.6652$. Notice that here $Z$ was a sum of three terms; in a real model it is a sum over every possible image, which is why nothing in this calculation generalizes. Answering $1/3$ would ignore the energies entirely.`,
    },
    {
      kind: 'explain',
      title: 'The gradient has two phases',
      body: String.raw`Train by maximum likelihood anyway and see what happens. With $\log p_\theta(x)=-E_\theta(x)-\log Z_\theta$,

$$\nabla_\theta\log Z_\theta=\frac{1}{Z_\theta}\int -\nabla_\theta E_\theta(x)\,e^{-E_\theta(x)}dx=-\,\mathbb E_{x'\sim p_\theta}\big[\nabla_\theta E_\theta(x')\big].$$

Substituting, the gradient of the negative log-likelihood on a data point $x$ is

$$\boxed{\ \nabla_\theta\big(-\log p_\theta(x)\big)=\underbrace{\nabla_\theta E_\theta(x)}_{\text{positive phase}}-\underbrace{\mathbb E_{x'\sim p_\theta}\big[\nabla_\theta E_\theta(x')\big]}_{\text{negative phase}}.\ }$$

In words: **push the energy down at real data, push it up at the model's own samples.** When the two cancel in expectation, the model's samples are distributed like the data, and training stops.

The intractable integral has not vanished — it has turned into an **expectation under the model**, which is a sampling problem rather than an integration problem. That is real progress, because we have [MCMC](@ml/sampling-for-ml). It is also the catch: every gradient step needs fresh samples from a distribution we can only reach by running a Markov chain.`,
      widget: { type: 'SvgDiagram', props: { svg: PHASES_SVG } },
    },
    {
      kind: 'mcq',
      prompt: String.raw`During EBM training, what does the *negative phase* term $-\mathbb E_{x'\sim p_\theta}[\nabla_\theta E_\theta(x')]$ accomplish?`,
      choices: [
        'It raises the energy wherever the current model puts mass, so probability is taken away from regions the data do not occupy',
        'It subtracts a constant that keeps the loss positive',
        'It regularizes the weights towards zero, like weight decay',
        'It estimates the partition function $Z_\\theta$ so that the likelihood can be reported',
      ],
      answer: 0,
      why: String.raw`Without it, training would simply drive $E_\theta$ to $-\infty$ everywhere — the energy at the data would keep falling with nothing to oppose it, and the *relative* shape, which is all that matters, would never change. The negative phase supplies the opposition by lifting energy at the model's own samples. It never produces $Z_\theta$ itself: only $\nabla_\theta\log Z_\theta$, as an expectation.`,
    },
    {
      kind: 'explain',
      title: 'Contrastive divergence: stop the chain early',
      body: String.raw`Running an MCMC chain to equilibrium inside every gradient step is unaffordable. Hinton (2002) proposed a blunt shortcut, **contrastive divergence (CD-$k$)**: start the chain **at a training example** instead of at random, and run just $k$ steps — famously $k=1$.

The reasoning is that a data point is already in a high-probability region of a half-trained model, so a short chain lands somewhere plausible, and the direction of the resulting gradient is usually right even when its magnitude is not. CD-1 is biased — it is not the gradient of the log-likelihood, nor of any other function in general (Sutskever & Tieleman, 2010) — but it is cheap and it works well enough to have trained a generation of models.

Its natural home was the **restricted Boltzmann machine**: visible units $v$, hidden units $h$, and the bilinear energy
$$E(v,h)=-v^\top W h-b^\top v-c^\top h.$$
With no visible–visible or hidden–hidden connections, $p(h\mid v)$ and $p(v\mid h)$ both factorize completely, so a Gibbs step is one matrix multiply and one sigmoid per side. Stacks of RBMs trained this way gave the layer-wise pretraining of deep belief nets (Hinton, Osindero & Teh, 2006) that helped restart deep learning.`,
    },
    {
      kind: 'truefalse',
      prompt: 'Contrastive divergence computes an unbiased estimate of the maximum-likelihood gradient.',
      answer: false,
      why: String.raw`It is biased by construction: the negative samples come from a chain stopped after $k$ steps starting at the data, not from $p_\theta$. The bias is the price of making the negative phase affordable, and its characteristic symptom is that modes far from the data never get their energy raised, because a short chain starting at the data never visits them.`,
    },
    {
      kind: 'explain',
      title: 'Better negative samples',
      body: String.raw`Most progress since has been about improving the negative phase rather than the model.

- **Persistent CD** (Tieleman, 2008). Do not restart the chain at a data point each time. Keep a buffer of chains running *across* parameter updates. Because $\theta$ changes slowly, a chain that was near equilibrium before the update is nearly at equilibrium after it, so the samples are much closer to $p_\theta$ for the same compute.
- **Short-run Langevin from noise** (Nijkamp et al., 2019; Du & Mordatch, 2019). Start at noise, run a fixed small number of Langevin steps $x\leftarrow x-\tfrac{\varepsilon}{2}\nabla_xE_\theta(x)+\sqrt{\varepsilon}\,\xi$, and treat whatever comes out as the negative sample. With a replay buffer, spectral normalization and gradient clipping this scales to image-sized models — Du & Mordatch trained EBMs on CIFAR-10 and ImageNet $32\times32$ this way. The bias here is worth naming precisely: Nijkamp et al. showed that the short chain does *not* converge to $p_\theta$, and that what is really being fitted is the **short-run sampler** — the fixed noise-to-sample procedure, chains and all — rather than the energy. The samples can look good while $E_\theta$ itself is a poor density model, so an EBM trained this way should not be read as a calibrated likelihood.
- **Regularize the energy.** An $L_2$ penalty on $E_\theta(x)$ at both phases stops the energy scale running away, which is the standard failure mode when the chains are short.

Even so, EBM training remains the least stable procedure in this unit: there are two moving parts (the sampler and the parameters) and they can chase each other.`,
      widget: { type: 'SvgDiagram', props: { svg: MCMC_SVG }, caption: 'Each scheme buys a different trade between sample quality, compute and stability.' },
    },
    {
      kind: 'order',
      prompt: 'Put one persistent-contrastive-divergence update in order.',
      steps: [
        'Draw a minibatch of real examples $x$ from the training set',
        'Take the current states of the persistent chains from the replay buffer as the starting points',
        'Run a few Langevin or Gibbs steps on those chains using the current energy $E_\\theta$, and write the new states back to the buffer',
        'Compute the positive-phase term $\\nabla_\\theta E_\\theta(x)$ on the real batch and the negative-phase term on the chain states',
        'Update $\\theta$ with the difference of the two terms',
      ],
      why: 'The point of persistence is that the chains are never restarted: they carry their state across updates, so a few steps per update are enough to stay near equilibrium. Restarting them at the data each time would turn the procedure back into CD-$k$, with its characteristic blindness to distant modes.',
    },
    {
      kind: 'explain',
      title: 'Dodging the partition function entirely',
      body: String.raw`If sampling is the bottleneck, change the objective so that no sampling is needed.

- **Score matching** (Hyvärinen, 2005). Fit the model's score $\nabla_x\log p_\theta(x)=-\nabla_xE_\theta(x)$ to the data's score. The gradient is taken in $x$, not $\theta$, so $Z_\theta$ differentiates away completely and no MCMC appears anywhere. This is the door through which EBMs lead to [score matching](@ml/score-matching) and then to [diffusion models](@ml/diffusion-models).
- **Noise-contrastive estimation** (Gutmann & Hyvärinen, 2010). Train a classifier to distinguish real data from samples of a known noise distribution. The optimal classifier's logit is $\log p_{\text{data}}-\log p_{\text{noise}}$, so the unnormalized model is recovered up to a learnable constant — $\log Z$ is simply treated as one more parameter.
- **Pseudo-likelihood.** Replace $p(x)$ by $\prod_i p(x_i\mid x_{-i})$. Each conditional is a one-dimensional normalization, which is cheap. Consistent, but statistically weaker.

All three replace "estimate an intractable integral" with "optimize something local". Score matching turned out to be the one that scaled.`,
    },
    {
      kind: 'match',
      prompt: 'Match each training approach to how it deals with the partition function.',
      pairs: [
        ['Maximum likelihood with MCMC', 'Turns $\\nabla_\\theta\\log Z$ into an expectation over model samples'],
        ['Contrastive divergence', 'Approximates that expectation with a short chain started at the data'],
        ['Score matching', 'Differentiates in $x$, so the constant $Z$ disappears from the objective'],
        ['Noise-contrastive estimation', 'Learns $\\log Z$ as an extra parameter by classifying data against noise'],
      ],
      why: 'The four differ in *where* the intractable constant goes: into a sampling problem, into a biased approximation of that sampling problem, out of the objective altogether, or into an explicitly estimated parameter. Nothing computes the integral.',
    },
    {
      kind: 'multi',
      prompt: 'Which statements about energy-based models are true? (Select all that apply.)',
      choices: [
        'Any scalar-output network can serve as the energy, with no architectural constraint',
        'The score $\\nabla_x\\log p_\\theta(x)$ equals $-\\nabla_xE_\\theta(x)$ and needs no knowledge of $Z_\\theta$',
        'Adding a constant to $E_\\theta$ leaves the distribution unchanged',
        'Exact sample log-likelihoods can be reported for image-sized EBMs',
      ],
      answers: [0, 1, 2],
      why: String.raw`Freedom of architecture is the selling point, and both the score and ratios of densities are independent of $Z_\theta$; a shift in $E$ cancels between numerator and denominator. Reporting an exact likelihood is exactly what you cannot do: $Z_\theta$ would have to be computed, and the best available tools (annealed importance sampling and its relatives) give estimates with their own error bars.`,
    },
    {
      kind: 'fill',
      prompt: String.raw`An EBM defines $p_\theta(x)=e^{-E_\theta(x)}/Z_\theta$, where $Z_\theta$ is the ___ function. The likelihood gradient has a ___ phase that lowers the energy at real data and a ___ phase that raises it at model samples. Contrastive divergence approximates the second one with a ___ MCMC chain started at a data point, while score matching avoids $Z_\theta$ by differentiating with respect to ___ instead of the parameters.`,
      bank: ['partition', 'positive', 'negative', 'short', 'long', 'x', 'loss'],
      answer: ['partition', 'positive', 'negative', 'short', 'x'],
      why: String.raw`The two phases come straight from $\nabla_\theta(-\log p_\theta)=\nabla_\theta E_\theta(x)-\mathbb E_{p_\theta}[\nabla_\theta E_\theta]$. CD's whole idea is that the chain is *short* — a long chain would be unbiased but unaffordable. And because $Z_\theta$ has no $x$ in it, $\nabla_x\log p_\theta=-\nabla_xE_\theta$ exactly.`,
    },
    {
      kind: 'explain',
      title: 'Where the idea lives now',
      body: String.raw`EBMs are rarely the final product today, but the viewpoint is everywhere.

- **Diffusion models inherited the viewpoint.** A denoising network trained at many noise levels is learning $\nabla_x\log p_t(x)$ — an EBM's score, at every scale at once, but parameterized directly as a vector field rather than as $-\nabla_xE_\theta$. (That is a real difference, not a cosmetic one: a freely parameterized score network is generally not the gradient of any scalar, so there is no energy to recover from it.) The noise levels are what fixes the slow-mixing problem the widget shows: at high noise the landscape is smooth and the chain crosses freely.
- **Your classifier already is one.** Grathwohl et al. (2020) observed that a $K$-class classifier's logits $f_\theta(x)[y]$ define a joint EBM with $E_\theta(x,y)=-f_\theta(x)[y]$, and training it as such improves calibration and out-of-distribution detection.
- **Structured prediction.** LeCun et al.'s (2006) framing — a scalar compatibility between input and output, minimized at inference — covers conditional random fields, ranking losses and much of structured learning.
- **Physics and chemistry.** A learned interatomic potential *is* an energy function; sampling it with Langevin or molecular dynamics is the standard workflow, and the invariances it must obey are the subject of [E(3)-equivariant networks](@ml/e3-equivariant-networks).`,
    },
    {
      kind: 'explain',
      title: 'Key takeaways',
      body: String.raw`- An EBM is $p_\theta(x)=e^{-E_\theta(x)}/Z_\theta$ with an **arbitrary** scalar network $E_\theta$ — maximal architectural freedom, one intractable normalizer.
- Only energy **differences** matter; adding a constant to $E_\theta$ changes nothing.
- Density **ratios** and the **score** $\nabla_x\log p_\theta=-\nabla_xE_\theta$ are free of $Z_\theta$; absolute likelihoods are not.
- The likelihood gradient is **positive phase minus negative phase**: lower $E$ at the data, raise $E$ at samples from the model.
- The negative phase needs samples from $p_\theta$, hence MCMC: **CD-$k$** (short chain from the data), **PCD** (chains persisting across updates), **short-run Langevin from noise**.
- Objectives that sidestep $Z_\theta$ altogether: **score matching**, **noise-contrastive estimation**, **pseudo-likelihood**.
- The modern descendants are [score matching](@ml/score-matching) and [diffusion](@ml/diffusion-models), which solve the sampling problem by learning the score at many noise levels.`,
    },
  ],
  references: [
    { authors: 'G. E. Hinton', title: 'Training Products of Experts by Minimizing Contrastive Divergence', year: 2002, venue: 'Neural Computation 14(8), 1771–1800' },
    { authors: 'Y. LeCun, S. Chopra, R. Hadsell, M. Ranzato & F. Huang', title: 'A Tutorial on Energy-Based Learning', year: 2006, venue: 'in Predicting Structured Data, MIT Press' },
    { authors: 'T. Tieleman', title: 'Training Restricted Boltzmann Machines using Approximations to the Likelihood Gradient', year: 2008, venue: 'ICML' },
    { authors: 'Y. Du & I. Mordatch', title: 'Implicit Generation and Modeling with Energy-Based Models', year: 2019, venue: 'NeurIPS', url: 'https://arxiv.org/abs/1903.08689' },
    { authors: 'A. Hyvärinen', title: 'Estimation of Non-Normalized Statistical Models by Score Matching', year: 2005, venue: 'Journal of Machine Learning Research 6, 695–709' },
    { authors: 'I. Sutskever & T. Tieleman', title: 'On the Convergence Properties of Contrastive Divergence', year: 2010, venue: 'AISTATS' },
    { authors: 'G. E. Hinton, S. Osindero & Y. W. Teh', title: 'A Fast Learning Algorithm for Deep Belief Nets', year: 2006, venue: 'Neural Computation 18(7), 1527–1554' },
    { authors: 'E. Nijkamp, M. Hill, S.-C. Zhu & Y. N. Wu', title: 'Learning Non-Convergent Non-Persistent Short-Run MCMC Toward Energy-Based Model', year: 2019, venue: 'NeurIPS', url: 'https://arxiv.org/abs/1904.09770' },
    { authors: 'W. Grathwohl, K.-C. Wang, J.-H. Jacobsen, D. Duvenaud, M. Norouzi & K. Swersky', title: 'Your Classifier is Secretly an Energy Based Model and You Should Treat it Like One', year: 2020, venue: 'ICLR', url: 'https://arxiv.org/abs/1912.03263' },
    { authors: 'M. Gutmann & A. Hyvärinen', title: 'Noise-contrastive estimation: A new estimation principle for unnormalized statistical models', year: 2010, venue: 'AISTATS' },
  ],
} satisfies LessonContent;
