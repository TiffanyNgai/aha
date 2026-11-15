import type { LessonContent } from '../../types';

const ELBO_STEPS = [
  String.raw`**What we want.** The posterior $p(z\mid x)=\dfrac{p(x,z)}{p(x)}$. The numerator is cheap — it is just prior times likelihood, which the model defines. The denominator $p(x)=\int p(x,z)\,dz$ is the problem.`,
  String.raw`**The move.** Pick *any* distribution $q(z)$ over the latents, from a family we can handle. Insert it into $\log p(x)$ for free, multiplying and dividing:
$$\log p(x)=\log\int q(z)\,\frac{p(x,z)}{q(z)}\,dz.$$`,
  String.raw`**Jensen.** $\log$ is concave, so $\log\mathbb E[\,\cdot\,]\ge\mathbb E[\log\,\cdot\,]$:
$$\log p(x)\;\ge\;\mathbb E_{q}\!\left[\log\frac{p(x,z)}{q(z)}\right]\;=:\;\mathcal L(q).$$
$\mathcal L(q)$ is the **evidence lower bound**, the ELBO. Every term inside it is computable: $p(x,z)$ we can evaluate, $q$ we chose.`,
  String.raw`**The exact version, which says more.** Do it again without Jensen. Start from the KL between $q$ and the true posterior:
$$D_{\mathrm{KL}}\big(q(z)\,\|\,p(z\mid x)\big)=\mathbb E_q\big[\log q(z)-\log p(z\mid x)\big]=\mathbb E_q\big[\log q(z)-\log p(x,z)\big]+\log p(x),$$
using $p(z\mid x)=p(x,z)/p(x)$ and the fact that $\log p(x)$ does not depend on $z$.`,
  String.raw`**Rearrange.** That last line is exactly
$$\boxed{\;\log p(x)=\mathcal L(q)+D_{\mathrm{KL}}\big(q(z)\,\|\,p(z\mid x)\big)\;}$$
an *identity*, true for every $q$. No approximation anywhere.`,
  String.raw`**Read it.** The left side is a constant: the data's log-evidence, fixed once the model is fixed. So pushing $\mathcal L(q)$ **up** pushes the KL to the posterior **down**, by exactly as much. Maximizing a computable bound and minimizing an incomputable divergence are the same act.`,
  String.raw`**And the bound is tight exactly when it should be.** KL $\ge0$ with equality iff $q=p(z\mid x)$. So $\mathcal L(q)\le\log p(x)$, with equality precisely when $q$ is the true posterior. The **gap you never see** is $D_{\mathrm{KL}}(q\|p(z\mid x))$ — you cannot evaluate it, which is why a high ELBO is encouraging but not a guarantee.`,
];

export default {
  cards: [
    {
      kind: 'explain',
      title: 'The denominator that ruins everything',
      body: String.raw`Bayesian inference is one line:
$$p(z\mid x)=\frac{p(x\mid z)\,p(z)}{p(x)},\qquad p(x)=\int p(x\mid z)\,p(z)\,dz.$$
Here $z$ is whatever you do not observe — cluster assignments, topic proportions, neural network weights, the latent code of an image — and $x$ is the data.

The top of that fraction is free: you wrote down the prior and the likelihood yourself. The bottom is an integral over every possible $z$. For a mixture of $K$ components and $n$ points it is a sum over $K^n$ assignments. For a neural network it is an integral over millions of dimensions. [Exact inference](@ml/graphical-models) is out of reach except on trees and conjugate toy models.

Two escapes exist. **Sample** from $p(z\mid x)$ without ever computing $p(x)$ — that is [MCMC](@ml/sampling-for-ml), asymptotically exact and often slow. Or **give up on exactness and optimize**: search a family of tractable distributions for the member closest to the posterior. That is variational inference, and it turns an integration problem into the thing modern computing is best at — gradient descent.`,
    },
    {
      kind: 'recall',
      title: 'KL divergence',
      points: [
        String.raw`$D_{\mathrm{KL}}(q\|p)=\mathbb E_{q}\!\left[\log\dfrac{q(z)}{p(z)}\right]$, measured in nats.`,
        String.raw`$D_{\mathrm{KL}}\ge 0$ always, with equality **iff** $q=p$ almost everywhere (Gibbs' inequality).`,
        String.raw`It is **not** symmetric and not a metric: $D_{\mathrm{KL}}(q\|p)\neq D_{\mathrm{KL}}(p\|q)$ in general.`,
        String.raw`$D_{\mathrm{KL}}(q\|p)=\infty$ whenever $q$ puts mass where $p$ has none — which is what makes it "exclusive".`,
      ],
      link: 'stats/entropy-kl',
    },
    {
      kind: 'widget',
      title: 'Deriving the ELBO',
      body: String.raw`We want $\arg\min_{q\in\mathcal Q}D_{\mathrm{KL}}\big(q(z)\|p(z\mid x)\big)$ — but that objective contains the very posterior we cannot compute. The derivation below shows why we can optimize it anyway.`,
      widget: { type: 'StepReveal', props: { steps: ELBO_STEPS, notes: ['The evidence is the obstacle.', 'A free multiplication by q/q.', 'Jensen gives a bound.', 'Now the exact route.', 'An identity, not an approximation.', 'Raise the bound, shrink the KL.', 'Tight iff q is the posterior.'] } },
    },
    {
      kind: 'explain',
      title: 'Two ways to read the ELBO',
      body: String.raw`Write $\mathcal L(q)=\mathbb E_q[\log p(x,z)-\log q(z)]$ and split it differently each time.

**As energy plus entropy.**
$$\mathcal L(q)=\underbrace{\mathbb E_q\big[\log p(x,z)\big]}_{\text{fit the joint}}+\underbrace{\mathbb H[q]}_{\text{stay spread out}}.$$
The first term wants $q$ to pile up wherever the model likes the data; the entropy term stops it collapsing to a point. This is the statistical-physics reading: $-\mathcal L$ is a **variational free energy**, and the whole method is the Gibbs–Bogoliubov–Feynman bound under another name.

**As reconstruction minus complexity.** Using $p(x,z)=p(x\mid z)p(z)$,
$$\mathcal L(q)=\underbrace{\mathbb E_q\big[\log p(x\mid z)\big]}_{\text{explain the data}}-\underbrace{D_{\mathrm{KL}}\big(q(z)\,\|\,p(z)\big)}_{\text{stay near the prior}}.$$
This is the form you meet in [VAEs](@ml/vaes), where the second term has a closed form for Gaussians. The two expressions are algebraically identical; the second only exists when the model factorizes as likelihood times prior.

Both make the same trade visible: an approximate posterior must explain the data **and** not stray far from the prior, and the exchange rate between the two is fixed — one nat of KL buys one nat of log-likelihood.`,
    },
    {
      kind: 'numeric',
      prompt: String.raw`A model has a single binary latent. The joint is $p(x,z{=}1)=0.1$ and $p(x,z{=}2)=0.3$. Take the variational distribution $q(1)=q(2)=0.5$. What is the ELBO $\mathcal L(q)=\sum_z q(z)\log\frac{p(x,z)}{q(z)}$, in nats? (3 decimals)`,
      answer: -1.060,
      tolerance: 0.004,
      why: String.raw`$0.5\log(0.1/0.5)+0.5\log(0.3/0.5)=0.5\log 0.2+0.5\log 0.6=-0.8047-0.2554=-1.060$. The true evidence is $\log(0.1+0.3)=\log 0.4=-0.916$, so the bound sits $0.144$ nats below it — and that gap is exactly $D_{\mathrm{KL}}\big(q\|p(z\mid x)\big)$ with $p(z\mid x)=(0.25,0.75)$. Check it: $0.5\log 2+0.5\log\tfrac23=0.144$. ✓`,
    },
    {
      kind: 'explain',
      title: 'Why reverse KL, and what it costs you',
      body: String.raw`Variational inference minimizes $D_{\mathrm{KL}}(q\|p)$ — the **reverse**, or *exclusive*, direction, with the expectation under $q$. That is not an aesthetic choice: it is the only direction you can compute, because $\mathbb E_{q}[\cdot]$ needs samples from $q$ (easy, you designed it) while $D_{\mathrm{KL}}(p\|q)=\mathbb E_{p}[\cdot]$ would need samples from the posterior you are trying to find.

The two directions behave completely differently when $q$ cannot match $p$:

- **Reverse $D_{\mathrm{KL}}(q\|p)$** is $\mathbb E_q[\log q-\log p]$. The integrand blows up wherever $q>0$ but $p\approx0$, so $q$ is *forbidden* from spreading into the posterior's low-density regions. It is **mode-seeking** and **under-dispersed**: it picks one mode and sits inside it.
- **Forward $D_{\mathrm{KL}}(p\|q)$** is $\mathbb E_p[\log p-\log q]$, which blows up wherever $p>0$ but $q\approx0$. So $q$ must cover everything $p$ covers: **mass-covering**, **over-dispersed**, averaging across modes. (This is the direction maximum likelihood minimizes, and the direction expectation propagation targets locally.)

The practical consequence is blunt and worth remembering: **mean-field VI typically understates posterior variance**. Point estimates and predictive means are usually fine. Credible intervals from a mean-field fit are too narrow, and you should not report them as though they were honest.`,
    },
    {
      kind: 'widget',
      title: 'The same Gaussian, fitted both ways',
      body: String.raw`The target (grey ellipses) is a correlated 2-D Gaussian. The approximating family is the factorized one, $q(z)=\mathcal N(0,s^2 I)$ — circles, which cannot tilt. Drag $\rho$ up and compare the two optima.

Reverse KL shrinks to fit *inside* the ridge: $s^2=1/\Lambda_{11}=1-\rho^2$, the inverse of a **precision** entry. Forward KL matches the marginals: $s^2=\Sigma_{11}=1$. At $\rho=0.9$ the reverse-KL fit has standard deviation $\sqrt{1-0.81}\approx0.44$ against a true marginal standard deviation of 1 — a credible interval less than half the right width.`,
      widget: { type: 'MlMeanFieldKL', props: { rho: 0.85, show: 'both' } },
    },
    {
      kind: 'mcq',
      prompt: 'A posterior has two well-separated modes. A unimodal Gaussian q is fitted by minimizing the reverse KL used in variational inference. What does it do?',
      choices: [
        'Sits on one of the two modes, with roughly the right local width',
        'Straddles the gap between the modes, placing most of its mass where the posterior has almost none',
        'Splits into two components automatically',
        'Returns an infinite divergence, so the optimization fails',
      ],
      answer: 0,
      why: String.raw`Reverse KL penalizes $q$-mass where $p$ is tiny, and the valley between the modes is exactly such a region — so the mode-seeking optimum picks one bump and ignores the other. Straddling the gap is what *forward* KL does: it refuses to leave any of $p$ uncovered and over-disperses instead. Neither direction can make a unimodal family multimodal, and both divergences stay finite here.`,
    },
    {
      kind: 'numeric',
      prompt: String.raw`The target is $\mathcal N(0,\Sigma)$ with $\Sigma=\begin{pmatrix}1&0.8\\0.8&1\end{pmatrix}$. The mean-field optimum of $D_{\mathrm{KL}}(q\|p)$ over $q(z)=\mathcal N(0,\operatorname{diag}(s_1^2,s_2^2))$ has $s_1^2=1/\Lambda_{11}$, where $\Lambda=\Sigma^{-1}$. What is $s_1^2$?`,
      answer: 0.36,
      tolerance: 0.005,
      why: String.raw`$\Lambda=\frac{1}{1-\rho^2}\begin{pmatrix}1&-\rho\\-\rho&1\end{pmatrix}$, so $\Lambda_{11}=1/(1-\rho^2)$ and $s_1^2=1-\rho^2=1-0.64=0.36$. The true marginal variance is $\Sigma_{11}=1$. Mean-field reports a standard deviation of $0.6$ instead of $1$: the stronger the correlation the family cannot represent, the worse the under-dispersion — and when the posterior correlation persists as data grows, so does the shortfall.`,
    },
    {
      kind: 'explain',
      title: 'Mean field and coordinate ascent',
      body: String.raw`The commonest family assumes the latents are independent under $q$:
$$q(z)=\prod_{j=1}^{m}q_j(z_j).$$
This is the **mean-field** family, borrowed from statistical physics. Remarkably, you do not have to choose the *form* of each $q_j$. Maximizing $\mathcal L$ over $q_j$ with every other factor held fixed gives a unique optimum:
$$\log q_j^{\star}(z_j)=\mathbb E_{q_{-j}}\big[\log p(z,x)\big]+\text{const},$$
the expected log joint with everything else averaged out. For models in the conjugate exponential family this expectation is a closed-form update of natural parameters, and $q_j^\star$ lands in a familiar family automatically.

Cycling through $j=1,\dots,m$ is **coordinate ascent variational inference** (CAVI). Each update can only raise $\mathcal L$, and $\mathcal L$ is bounded above by $\log p(x)$, so the algorithm converges — to a *local* optimum; the ELBO is generally not concave in $q$'s parameters, so restarts matter.

The resemblance to [EM](@stats/em-algorithm) is not a coincidence. EM is the special case where $z$ splits into local latents, handled by an exact $q=p(z\mid x,\theta)$ in the E-step, and global parameters $\theta$ given point estimates in the M-step. Full VI simply refuses to make that second distinction and keeps a distribution over everything.`,
    },
    {
      kind: 'order',
      prompt: 'Order one sweep of coordinate ascent variational inference (CAVI) on a mean-field family.',
      steps: [
        String.raw`Choose the factorization $q(z)=\prod_j q_j(z_j)$ and initialize every factor`,
        String.raw`Pick a coordinate $j$ and hold all the other factors $q_{-j}$ fixed`,
        String.raw`Compute $\mathbb E_{q_{-j}}[\log p(z,x)]$, the expected log joint with the others averaged out`,
        String.raw`Set $q_j\propto\exp\big(\mathbb E_{q_{-j}}[\log p(z,x)]\big)$ and normalize`,
        String.raw`Repeat for every $j$, then evaluate the ELBO and stop when it stops rising`,
      ],
      why: String.raw`Each coordinate update is the *exact* maximizer of $\mathcal L$ in that one factor, so no step size is involved and the ELBO rises monotonically — which is why monitoring the ELBO is the standard convergence check. Because the bound is not concave in general, a monotone rise guarantees a local optimum, not the global one.`,
    },
    {
      kind: 'explain',
      title: 'Scaling it up: stochastic, black-box, amortized',
      body: String.raw`Classical CAVI needs model-specific algebra and a full pass over the data per update. Three ideas removed all three limits (Blei, Kucukelbir & McAuliffe, 2017, survey this).

1. **Stochastic VI** (Hoffman et al., 2013). Split the latents into local ones (one per data point) and global ones. Subsample a minibatch, optimize its local factors, and take a noisy **natural-gradient** step on the global factors. Variational inference becomes an SGD problem and scales to millions of documents.
2. **Black-box VI** (Ranganath, Gerrish & Blei, 2014). Stop deriving updates. Parameterize $q_\lambda$, write $\nabla_\lambda\mathcal L$ as an expectation, and estimate it by Monte Carlo. You only ever need to *evaluate* $\log p(x,z)$, so one implementation serves every model — the idea behind **ADVI** (Kucukelbir et al., 2017) in Stan and Pyro, which transforms constrained latents to $\mathbb R^d$ and fits a Gaussian there.
3. **Amortization**. Instead of private parameters $\lambda_i$ per data point, train one network $q_\phi(z\mid x)$ that outputs them. Inference becomes a forward pass — the move that makes [VAEs](@ml/vaes) possible, at the cost of an *amortization gap*.

All three run on the same engine: a Monte Carlo estimate of $\nabla_\lambda\mathbb E_{q_\lambda}[\cdot]$. And that is a genuinely hard estimation problem, because the parameters sit in the distribution being sampled from. How much that choice matters — orders of magnitude in variance, which is the difference between training and not training — is the subject of [the next lesson](@ml/reparameterization-trick).`,
    },
    {
      kind: 'multi',
      prompt: 'Which statements about the ELBO are correct?',
      choices: [
        String.raw`$\log p(x)-\mathcal L(q)$ equals $D_{\mathrm{KL}}\big(q(z)\|p(z\mid x)\big)$ exactly`,
        String.raw`$\mathcal L(q)=\log p(x)$ if and only if $q$ is the exact posterior`,
        String.raw`Maximizing $\mathcal L$ over $q$ requires evaluating the evidence $p(x)$`,
        String.raw`A higher ELBO always means a better approximation to the posterior, for any two models`,
        String.raw`$\mathcal L$ can be written as $\mathbb E_q[\log p(x,z)]+\mathbb H[q]$`,
      ],
      answers: [0, 1, 4],
      why: String.raw`The decomposition $\log p(x)=\mathcal L+D_{\mathrm{KL}}(q\|p(z\mid x))$ is an identity, and the KL vanishes only at the true posterior. Nothing in $\mathcal L=\mathbb E_q[\log p(x,z)-\log q]$ mentions $p(x)$ — that is the entire point. Comparing ELBOs *across models* is unsafe: each one is the evidence minus its own unknown gap, so a model with a looser bound can lose to a worse model with a tighter one. Within a single model, a rising ELBO does mean a shrinking KL.`,
    },
    {
      kind: 'truefalse',
      prompt: 'Because the ELBO is a lower bound on the log evidence, a variational fit can only ever understate how well a model explains the data.',
      answer: true,
      why: String.raw`$\mathcal L(q)\le\log p(x)$ for every $q$, so the reported number is pessimistic about the *evidence*. The trap is the next inference people draw: when the gaps differ, comparing two models by their ELBOs can rank them backwards. Tighter bounds (importance-weighted ELBOs, which use $K$ samples) partly address this, and sampling-based estimates of $\log p(x)$ are used when the comparison really matters.`,
    },
    {
      kind: 'match',
      prompt: 'Match each object to its description.',
      pairs: [
        [String.raw`$\mathcal L(q)=\mathbb E_q[\log p(x,z)-\log q(z)]$`, 'The ELBO: a computable lower bound on the log evidence'],
        [String.raw`$D_{\mathrm{KL}}(q\|p(z\mid x))$`, 'The gap you cannot evaluate; zero only at the exact posterior'],
        [String.raw`$q(z)=\prod_j q_j(z_j)$`, 'Mean field: independence imposed on the approximation, not the model'],
        [String.raw`$\log q_j^\star\propto\mathbb E_{q_{-j}}[\log p(z,x)]$`, 'The CAVI coordinate update, optimal in one factor at a time'],
        [String.raw`$q_\phi(z\mid x)$ from a network`, 'Amortized inference: one forward pass instead of a per-example optimization'],
      ],
      why: String.raw`Everything hangs on the identity $\log p(x)=\mathcal L+D_{\mathrm{KL}}$. The bound is what you compute, the KL is what you silently pay, mean field is how you make $q$ tractable, CAVI is how you fit it by hand, and amortization is how you fit it with a network.`,
    },
    {
      kind: 'fill',
      prompt: String.raw`Variational inference turns inference into ___. It maximizes the ___, which is tight exactly when $q$ equals the true posterior. Because it uses the ___ KL, the fitted $q$ is mode-seeking and ___ the posterior variance.`,
      bank: ['optimization', 'ELBO', 'reverse', 'forward', 'understates', 'overstates', 'sampling'],
      answer: ['optimization', 'ELBO', 'reverse', 'understates'],
      why: String.raw`Reverse KL, $\mathbb E_q[\log q-\log p]$, is heavily penalized wherever $q$ has mass that $p$ does not, so the optimum hides inside a mode and comes out too narrow. The *forward* direction would over-disperse instead, but it needs expectations under the posterior — which is what we could not compute in the first place.`,
    },
    {
      kind: 'explain',
      title: 'Key takeaways',
      body: String.raw`- The posterior is hard because of the evidence $p(x)=\int p(x,z)\,dz$. VI replaces integration with optimization over a tractable family $\mathcal Q$.
- **The identity:** $\log p(x)=\mathcal L(q)+D_{\mathrm{KL}}\big(q(z)\|p(z\mid x)\big)$, for every $q$. The evidence is fixed, so raising the computable ELBO lowers the uncomputable KL by the same amount.
- Two readings: $\mathcal L=\mathbb E_q[\log p(x,z)]+\mathbb H[q]$ (energy plus entropy) and $\mathcal L=\mathbb E_q[\log p(x\mid z)]-D_{\mathrm{KL}}(q\|p(z))$ (reconstruction minus complexity).
- VI uses **reverse** KL because only $\mathbb E_q$ is computable. Price: mode-seeking behaviour and systematically **under-dispersed** posteriors — fine for point predictions, dangerous for credible intervals.
- **Mean field** $q=\prod_j q_j$ with the CAVI update $\log q_j^\star=\mathbb E_{q_{-j}}[\log p(z,x)]+c$; monotone, convergent, local.
- **Stochastic, black-box and amortized** VI scale it to big data and arbitrary models; all of them need a Monte Carlo gradient of an expectation whose distribution carries the parameters.
- The ELBO is a *bound*, so it understates the evidence by an unknown amount — be careful using it to compare models.`,
    },
  ],
  references: [
    { authors: 'D. M. Blei, A. Kucukelbir & J. D. McAuliffe', title: 'Variational Inference: A Review for Statisticians', year: 2017, venue: 'JASA 112(518), 859–877', url: 'https://arxiv.org/abs/1601.00670' },
    { authors: 'C. M. Bishop', title: 'Pattern Recognition and Machine Learning', year: 2006, venue: 'Springer', detail: 'Ch. 10 (Approximate Inference)' },
    { authors: 'K. P. Murphy', title: 'Probabilistic Machine Learning: Advanced Topics', year: 2023, venue: 'MIT Press', detail: 'Ch. 10 (Variational inference)' },
    { authors: 'M. D. Hoffman, D. M. Blei, C. Wang & J. Paisley', title: 'Stochastic Variational Inference', year: 2013, venue: 'JMLR 14, 1303–1347', url: 'https://arxiv.org/abs/1206.7051' },
    { authors: 'R. Ranganath, S. Gerrish & D. M. Blei', title: 'Black Box Variational Inference', year: 2014, venue: 'AISTATS', url: 'https://arxiv.org/abs/1401.0118' },
    { authors: 'A. Kucukelbir, D. Tran, R. Ranganath, A. Gelman & D. M. Blei', title: 'Automatic Differentiation Variational Inference', year: 2017, venue: 'JMLR 18(14), 1–45', url: 'https://arxiv.org/abs/1603.00788' },
  ],
} satisfies LessonContent;
