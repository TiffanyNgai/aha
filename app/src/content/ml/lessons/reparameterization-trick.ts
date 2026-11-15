import type { LessonContent } from '../../types';

const DERIV = [
  String.raw`**The quantity.** Everything in this unit needs
$$\nabla_\phi\,\mathbb E_{q_\phi(z)}\big[f(z)\big]=\nabla_\phi\int q_\phi(z)\,f(z)\,dz.$$
The parameters $\phi$ are in the *measure*, not in $f$. Backpropagation has no rule for "differentiate a sampling step".`,
  String.raw`**Route 1: differentiate the density.** Push $\nabla_\phi$ inside the integral (legal when the support of $q_\phi$ does not depend on $\phi$ and the usual domination conditions hold):
$$\nabla_\phi\int q_\phi(z)f(z)\,dz=\int f(z)\,\nabla_\phi q_\phi(z)\,dz.$$
That is not an expectation yet — $\nabla_\phi q_\phi$ is not a density.`,
  String.raw`**The log-derivative identity.** $\nabla_\phi q_\phi=q_\phi\,\nabla_\phi\log q_\phi$, so
$$\nabla_\phi\mathbb E_{q_\phi}[f]=\mathbb E_{q_\phi}\big[f(z)\,\nabla_\phi\log q_\phi(z)\big].$$
This is the **score-function estimator**, also called REINFORCE (Williams, 1992) or the likelihood-ratio estimator. Sample $z\sim q_\phi$, weight the score $\nabla_\phi\log q_\phi(z)$ by the value $f(z)$, done.`,
  String.raw`**What it needs — and what it does not.** It needs: the ability to sample $q_\phi$, and a differentiable *density*. It does **not** need $f$ to be differentiable, or continuous, or even known in closed form. $f$ can be a simulator, a reward from an environment, or a discrete count. That generality is why it underlies [policy gradients](@ml/policy-gradients).`,
  String.raw`**Route 2: differentiate the sample.** Suppose we can write the draw as a deterministic function of the parameters and some *parameter-free* noise:
$$z=g_\phi(\varepsilon),\qquad \varepsilon\sim p(\varepsilon)\ \text{ fixed},\qquad g_\phi(\varepsilon)\sim q_\phi.$$
For a Gaussian this is the location–scale map $z=\mu_\phi+\sigma_\phi\odot\varepsilon$ with $\varepsilon\sim\mathcal N(0,I)$.`,
  String.raw`**Now the expectation is over something constant.**
$$\mathbb E_{q_\phi}[f(z)]=\mathbb E_{p(\varepsilon)}\big[f(g_\phi(\varepsilon))\big]\;\Longrightarrow\;\nabla_\phi\mathbb E_{q_\phi}[f]=\mathbb E_{p(\varepsilon)}\big[\nabla_z f(g_\phi(\varepsilon))\,\nabla_\phi g_\phi(\varepsilon)\big].$$
This is the **pathwise** or **reparameterization** estimator (Kingma & Welling, 2014; Rezende et al., 2014; long known in simulation as the pathwise derivative). The gradient is an ordinary chain rule through a deterministic computation graph.`,
  String.raw`**Both are unbiased.** Neither is an approximation: each is an exact expression for the same gradient, estimated by Monte Carlo. They differ only in **variance** — often by orders of magnitude, which in practice can be the difference between a model that trains and one that does not.`,
  String.raw`**The price of route 2.** $g_\phi$ must be differentiable in $\phi$. That excludes discrete $z$ outright, and requires $f$ to be differentiable in $z$. Where route 2 applies it usually wins on variance; where it does not, route 1 is the only thing standing.`,
];

export default {
  cards: [
    {
      kind: 'explain',
      title: 'The gradient you cannot take',
      body: String.raw`[Variational inference](@ml/variational-inference) ends with an optimization problem: maximize
$$\mathcal L(\phi)=\mathbb E_{q_\phi(z)}\big[\log p(x,z)-\log q_\phi(z)\big]$$
over the variational parameters $\phi$. To run SGD you need $\nabla_\phi\mathcal L$.

Here is the awkward part. In an ordinary loss, $\phi$ sits inside a function you can differentiate. Here $\phi$ determines **which distribution you draw from**. Write the estimate as "sample $z$, evaluate $f(z)$" and the derivative with respect to $\phi$ is simply not defined: sampling is not a differentiable operation.

This is not a VAE detail. The same expression — $\nabla_\theta\mathbb E_{p_\theta}[\,\text{something}\,]$ — is the gradient of a reinforcement-learning objective over trajectories, of an expected simulator output over inputs, of a hard-attention or discrete-routing model over its choices. Mohamed, Rosca, Figurnov & Mnih (2020) survey it as a problem at the core of supervised, unsupervised and reinforcement learning. It has two main general-purpose solutions, below (the survey also covers a third, measure-valued, family).`,
    },
    {
      kind: 'widget',
      title: 'Two routes to the same gradient',
      body: String.raw`Both derivations below are exact. Keep track of what each one *requires*, because that — not elegance — is what decides which you can use.`,
      widget: { type: 'StepReveal', props: { steps: DERIV, notes: ['φ is in the measure.', 'Differentiate the density.', 'REINFORCE.', 'Works on black boxes.', 'Move the randomness aside.', 'An ordinary chain rule.', 'Both unbiased; variance differs.', 'Needs differentiability.'] } },
    },
    {
      kind: 'mcq',
      prompt: String.raw`You are training a model whose latent $z$ selects one of 8 experts (a hard, discrete choice), and the downstream loss is a differentiable network applied to the chosen expert's output. Which estimator gives you an unbiased gradient of the expected loss with respect to the routing parameters?`,
      choices: [
        'The reparameterization estimator, since the loss itself is differentiable',
        'The score-function estimator, since it needs only to evaluate the loss at a sampled choice',
        'Neither: expectations over discrete variables have no unbiased gradient estimator',
        'Either one, since both are unbiased whenever the loss is differentiable',
      ],
      answer: 1,
      why: String.raw`Reparameterization needs $z=g_\phi(\varepsilon)$ to be differentiable in $\phi$, and there is no such map onto a discrete set — a differentiable function of continuous noise cannot land on eight isolated points and vary smoothly with $\phi$. The score-function estimator only ever *evaluates* $f$ at a sampled $z$, so discreteness costs it nothing. A differentiable downstream loss does not help, because the non-differentiability is at the sampling step. (Gumbel-softmax sidesteps this by relaxing the choice, at the cost of bias.)`,
    },
    {
      kind: 'explain',
      title: 'A toy where every variance is exact',
      body: String.raw`Strip the problem to its bones. Let $q_\phi(z)=\mathcal N(\mu,\sigma^2)$ with $\sigma$ fixed, let $f(z)=(z-c)^2$, and write $d=\mu-c$. Then
$$\mathcal L(\mu)=\mathbb E_q[f]=d^2+\sigma^2,\qquad \frac{d\mathcal L}{d\mu}=2d.$$

**Pathwise.** $z=\mu+\sigma\varepsilon$, so $\hat g_{\text{p}}=\frac{\partial}{\partial\mu}(d+\sigma\varepsilon)^2=2(d+\sigma\varepsilon)$ and
$$\operatorname{Var}(\hat g_{\text{p}})=4\sigma^2.$$
Notice what is **missing**: $d$. However far you are from the optimum, the noise in the gradient is the same.

**Score function.** $\nabla_\mu\log q=(z-\mu)/\sigma^2=\varepsilon/\sigma$, so $\hat g_{\text{s}}=(d+\sigma\varepsilon)^2\varepsilon/\sigma$ and a few Gaussian moments ($\mathbb E\varepsilon^4=3$, $\mathbb E\varepsilon^6=15$) give
$$\operatorname{Var}(\hat g_{\text{s}})=\frac{d^4}{\sigma^2}+14d^2+15\sigma^2.$$
Both have mean exactly $2d$. But the score-function variance contains $f$'s **magnitude**, raised to the fourth power in $d$. At $d=3,\sigma=1$ that is $81+126+15=222$ against $4$: the same gradient, estimated 55 times less precisely, from the same one sample.

The reason is structural. The pathwise estimator asks "which way should I move $z$ to improve $f$?" and gets $\nabla_z f$ — a *direction*. The score-function estimator never looks at $f$'s slope; it takes a random direction $\varepsilon$ and scales it by $f(z)$, learning only from the correlation between random jitter and outcome.

A sharp way to see the difference: add a constant $100$ to $f$. The true gradient is unchanged and the pathwise estimator does not notice, because $\nabla_z(f+100)=\nabla_z f$. The score-function estimator still has mean $2d$ — adding a constant is exactly a baseline shifted the wrong way — but its variance grows enormously, because every sample is now a huge number multiplying a random score. An estimator that is blind to a constant offset in the objective is the one you want.`,
    },
    {
      kind: 'widget',
      title: 'Watch the two histograms',
      body: String.raw`Seven hundred independent one-sample estimates of the same gradient, on a shared count scale. The dashed line is the exact answer. Both clouds are centred on it — both estimators are unbiased — but one is a spike and the other is a smear.

Slide $\mu-c$ up (further from the optimum, so $f$ is larger) and watch the score-function histogram spread out while the reparameterization histogram does not move at all. Raise $K$ and both shrink as $1/\sqrt K$, which is the expensive way to fix variance. Then press **baseline**: subtracting $\mathbb E[f]$ before weighting helps a great deal, and still does not close the gap.`,
      widget: { type: 'MlGradEstimatorVariance', props: { d: 3, sigma: 1, k: 1, trials: 700 } },
    },
    {
      kind: 'numeric',
      prompt: String.raw`At $d=\mu-c=3$ and $\sigma=1$, the single-sample variances are $\operatorname{Var}(\hat g_{\text{s}})=d^4/\sigma^2+14d^2+15\sigma^2$ and $\operatorname{Var}(\hat g_{\text{p}})=4\sigma^2$. How many independent samples $K$ would the score-function estimator need for its $K$-sample average to match the variance of a **single** pathwise sample?`,
      answer: 55.5,
      tolerance: 0.2,
      why: String.raw`Averaging $K$ i.i.d. estimates divides the variance by $K$, so we need $222/K=4$, i.e. $K=55.5$ — call it 56 draws of the model for every one the pathwise estimator needs. And because the reduction is only $1/K$, buying another factor of 10 in precision costs another factor of 100 in samples. Variance reduction by brute force is a losing trade.`,
    },
    {
      kind: 'numeric',
      prompt: String.raw`Now subtract the constant baseline $b=\mathbb E_q[f]=d^2+\sigma^2$ before weighting, giving $\hat g=(f(z)-b)\varepsilon/\sigma$. Its variance works out to $8d^2+10\sigma^2$. What is that at $d=3$, $\sigma=1$?`,
      answer: 82,
      tolerance: 0.5,
      why: String.raw`$8(9)+10=82$, down from 222 — a baseline removes the part of the variance that comes from $f$'s overall *level* rather than its variation, and it costs nothing in bias because $\mathbb E_q[b\,\nabla_\phi\log q_\phi]=b\,\nabla_\phi\!\int q_\phi=b\,\nabla_\phi 1=0$. But 82 is still twenty times the pathwise variance of 4. Baselines shrink the gap; they do not remove it.`,
    },
    {
      kind: 'explain',
      title: 'And it gets worse with dimension',
      body: String.raw`Extend the toy to $z\in\mathbb R^D$ with $q=\mathcal N(\mu,\sigma^2 I)$, $\mu\in\mathbb R^D$, and $f(z)=\sum_{j=1}^{D}(z_j-c)^2$. Take $d=0,\sigma=1$ and look at the gradient with respect to a *single* coordinate $\mu_1$:

- **Pathwise**: variance $=4\sigma^2$. At $D=1,10,100$ that is $4$, $4$, $4$.
- **Score function**: variance $=15+8(D-1)+(D-1)^2$. At $D=1,10,100$ that is $15$, $168$, $10608$.
- **Score function with a mean baseline**: variance $=10+2(D-1)$. At $D=1,10,100$ that is $10$, $28$, $208$.

The pathwise estimator is **flat in $D$**: coordinate $1$'s gradient depends on $\varepsilon_1$ alone, because $\nabla_z f$ tells it so. The score-function estimator multiplies the score of coordinate 1 by the *whole* objective, so every one of the other $D-1$ coordinates injects noise into it — quadratically in $D$ without a baseline, linearly with one. For a VAE with a 128-dimensional latent, that is the difference between a usable gradient and white noise.

Two honest caveats.
- This is not a theorem about all problems. If $f$ is very rough, $\nabla_z f$ can be enormous and the pathwise estimator can be the worse of the two. Mohamed et al. (2020) show cases where the ordering flips; the reliable statement is that the pathwise estimator exploits smoothness, and most deep-learning objectives are smooth in $z$.
- Low variance is not free of other sins. The pathwise ELBO gradient contains a score term whose expectation is zero but whose variance is not; **dropping** it ("sticking the landing", Roeder, Wu & Duvenaud, 2017) leaves the estimator unbiased and drives its variance to zero as $q\to p$.`,
    },
    {
      kind: 'multi',
      prompt: 'Which of these are genuine, bias-free ways to reduce the variance of a score-function gradient estimator?',
      choices: [
        String.raw`Subtracting a baseline $b$ that does not depend on the sampled $z$`,
        String.raw`Rao–Blackwellization: analytically integrating out part of the expectation instead of sampling it`,
        String.raw`Averaging over more samples per update`,
        String.raw`Clipping the estimator to a fixed range whenever it is large`,
        String.raw`Learned control variates such as REBAR or RELAX, built from a relaxed surrogate`,
      ],
      answers: [0, 1, 2, 4],
      why: String.raw`A baseline is unbiased because $\mathbb E_q[\nabla_\phi\log q_\phi]=0$, so subtracting any $z$-independent constant changes nothing in expectation. Rao–Blackwellization can only lower variance (conditioning never increases it) and is exact. More samples is the honest, expensive route. REBAR (Tucker et al., 2017) and RELAX (Grathwohl et al., 2018) use a *relaxed* estimator purely as a control variate, and subtract its own analytic expectation back, which keeps them unbiased. Clipping is the odd one out: it changes the mean and is therefore biased.`,
    },
    {
      kind: 'explain',
      title: 'When you are stuck with the score function',
      body: String.raw`Reparameterization needs $z=g_\phi(\varepsilon)$ differentiable. Three situations rule it out.

**Discrete latents.** A categorical draw cannot be a smooth function of continuous noise. This covers hard attention, discrete codes, text tokens, and discrete expert routing in a [mixture of experts](@ml/mixture-of-experts).

**$f$ is a black box.** Reward from an environment, output of a non-differentiable simulator, a metric computed by external code. [Policy gradients](@ml/policy-gradients) are exactly the score-function estimator applied to $\mathbb E_{\tau\sim\pi_\theta}[R(\tau)]$, which is why REINFORCE, baselines and advantage estimation occupy so much of RL: the field lives permanently on the high-variance route.

**The distribution has no location–scale form.** Gamma, Dirichlet, von Mises and friends. Partial rescues exist: *implicit reparameterization* (Figurnov, Mohamed & Mnih, 2018) differentiates through the CDF without needing an explicit $g_\phi$, and works for Gamma, Dirichlet, Student-$t$ and mixtures.

The standard workaround for the discrete case is to **relax** it. The **Gumbel-softmax** / **Concrete** distribution (Jang, Gu & Poole, 2017; Maddison, Mnih & Teh, 2017) replaces the arg-max in the Gumbel-max trick with a softmax at temperature $\tau$:
$$\tilde z_k=\frac{\exp\big((\log\pi_k+G_k)/\tau\big)}{\sum_{k'}\exp\big((\log\pi_{k'}+G_{k'})/\tau\big)},\qquad G_k\sim\text{Gumbel}(0,1),$$
which *is* reparameterizable. As $\tau\to0$ it approaches the true categorical, with gradient variance exploding; as $\tau$ grows the samples get soft and the bias grows. So you trade the score-function estimator's variance for a relaxation's bias, tuned by one temperature. **Straight-through** variants (hard sample forward, soft gradient backward) — the mechanism inside VQ-VAE — make the same trade more crudely still.`,
    },
    {
      kind: 'truefalse',
      prompt: 'Because the Gumbel-softmax estimator is reparameterizable, it gives an unbiased gradient for the original discrete objective.',
      answer: false,
      why: String.raw`It gives an unbiased gradient of a *different*, relaxed objective: the expectation under the Concrete distribution at temperature $\tau$, not under the categorical. The gap vanishes only as $\tau\to0$, and exactly there the gradient variance blows up. That bias is the price paid for leaving the score-function route — and it is why REBAR and RELAX bolt the relaxation on as a control variate instead, recovering unbiasedness.`,
    },
    {
      kind: 'match',
      prompt: 'Match each estimator or technique to its defining property.',
      pairs: [
        ['Score function (REINFORCE)', String.raw`$\mathbb E_q[f(z)\nabla_\phi\log q_\phi(z)]$ — needs no gradient of $f$, high variance`],
        ['Pathwise (reparameterization)', String.raw`$\mathbb E_\varepsilon[\nabla_z f\cdot\nabla_\phi g_\phi]$ — uses $\nabla_z f$, low variance, continuous only`],
        ['Baseline / control variate', 'Subtracts a term of known expectation; lowers variance, keeps the mean'],
        ['Gumbel-softmax', 'Reparameterizable relaxation of a categorical; biased, tuned by a temperature'],
        ['Implicit reparameterization', 'Differentiates through the CDF for distributions with no location–scale map'],
      ],
      why: String.raw`The split that matters is what each one is allowed to touch. The score function only evaluates $f$; the pathwise estimator differentiates it. Everything else on the list is a patch: baselines and control variates repair the score function's variance, relaxations extend reparameterization to discrete variables by accepting bias, and implicit reparameterization extends it to awkward continuous families without any.`,
    },
    {
      kind: 'order',
      prompt: 'Order one stochastic gradient step on a reparameterized ELBO for a single example.',
      steps: [
        String.raw`Evaluate the variational parameters $\mu_\phi(x)$, $\sigma_\phi(x)$`,
        String.raw`Draw the parameter-free noise $\varepsilon\sim\mathcal N(0,I)$`,
        String.raw`Form $z=\mu_\phi(x)+\sigma_\phi(x)\odot\varepsilon$, keeping it attached to the computation graph`,
        String.raw`Evaluate the ELBO terms $\log p_\theta(x\mid z)$ and the KL at that $z$`,
        String.raw`Backpropagate through $z$ into $\mu_\phi$ and $\sigma_\phi$, and take an SGD step on $(\theta,\phi)$`,
      ],
      why: String.raw`The noise must be drawn *before* $z$ is formed and then treated as a constant — if $\varepsilon$ were resampled inside the backward pass, or detached from $z$, the chain rule would have nothing to flow through. Detaching $z$ from the graph is the single most common implementation bug here: the code still runs, the loss still decreases a little through the decoder, and the encoder never learns.`,
    },
    {
      kind: 'fill',
      prompt: String.raw`The score-function estimator weights the ___ of $\log q_\phi$ by the value of $f$, so it works even when $f$ is not ___. The pathwise estimator instead writes $z=g_\phi(\varepsilon)$ with ___ noise, and uses $\nabla_z f$, which usually gives far lower ___.`,
      bank: ['gradient', 'differentiable', 'parameter-free', 'variance', 'bias', 'entropy', 'convex'],
      answer: ['gradient', 'differentiable', 'parameter-free', 'variance'],
      why: String.raw`Those four words are the whole comparison. Both estimators are unbiased, so *bias* never belongs in this sentence; the trade is generality (score function) against precision (pathwise). The noise must be parameter-free, otherwise the expectation still depends on $\phi$ and nothing has been gained.`,
    },
    {
      kind: 'explain',
      title: 'Key takeaways',
      body: String.raw`- The recurring problem is $\nabla_\phi\mathbb E_{q_\phi}[f(z)]$: the parameters are in the distribution, so you cannot simply backpropagate through a sample.
- **Score function / REINFORCE:** $\mathbb E_q[f(z)\nabla_\phi\log q_\phi(z)]$. Needs only to evaluate $f$ — discrete latents, black boxes, simulators, RL rewards. Unbiased, high variance.
- **Pathwise / reparameterization:** $z=g_\phi(\varepsilon)$ with $\varepsilon$ parameter-free, then $\mathbb E_\varepsilon[\nabla_z f\,\nabla_\phi g_\phi]$. Needs differentiability. Unbiased, usually far lower variance.
- The gap is concrete, not folklore: on $f(z)=(z-c)^2$ with $\mathcal N(\mu,1)$ at $\mu-c=3$, variances are $222$ against $4$; with a mean baseline, $82$ against $4$. In $D$ dimensions the score-function variance grows with $D$ while the pathwise variance does not.
- The reason is structural: the pathwise estimator reads $\nabla_z f$ — a direction — while the score function correlates random jitter with values of $f$.
- **Variance reduction** for the score function: baselines (free, unbiased), Rao–Blackwellization, more samples ($1/K$), learned control variates (REBAR, RELAX).
- **Discrete latents**: relax with Gumbel-softmax/Concrete and accept bias, use straight-through, or stay with the score function. Awkward continuous families: implicit reparameterization.
- This one trick is why [VAEs](@ml/vaes) train at all, and the ELBO plus reparameterization is the machinery underneath [diffusion models](@ml/diffusion-models).`,
    },
  ],
  references: [
    { authors: 'S. Mohamed, M. Rosca, M. Figurnov & A. Mnih', title: 'Monte Carlo Gradient Estimation in Machine Learning', year: 2020, venue: 'JMLR 21(132), 1–62', url: 'https://arxiv.org/abs/1906.10652' },
    { authors: 'D. P. Kingma & M. Welling', title: 'Auto-Encoding Variational Bayes', year: 2014, venue: 'ICLR', url: 'https://arxiv.org/abs/1312.6114' },
    { authors: 'D. J. Rezende, S. Mohamed & D. Wierstra', title: 'Stochastic Backpropagation and Approximate Inference in Deep Generative Models', year: 2014, venue: 'ICML', url: 'https://arxiv.org/abs/1401.4082' },
    { authors: 'M. Figurnov, S. Mohamed & A. Mnih', title: 'Implicit Reparameterization Gradients', year: 2018, venue: 'NeurIPS', url: 'https://arxiv.org/abs/1805.08498' },
    { authors: 'G. Tucker, A. Mnih, C. J. Maddison, J. Lawson & J. Sohl-Dickstein', title: 'REBAR: Low-variance, Unbiased Gradient Estimates for Discrete Latent Variable Models', year: 2017, venue: 'NeurIPS', url: 'https://arxiv.org/abs/1703.07370' },
    { authors: 'W. Grathwohl, D. Choi, Y. Wu, G. Roeder & D. Duvenaud', title: 'Backpropagation through the Void: Optimizing Control Variates for Black-Box Gradient Estimation', year: 2018, venue: 'ICLR', url: 'https://arxiv.org/abs/1711.00123' },
    { authors: 'R. J. Williams', title: 'Simple Statistical Gradient-Following Algorithms for Connectionist Reinforcement Learning', year: 1992, venue: 'Machine Learning 8, 229–256' },
    { authors: 'E. Jang, S. Gu & B. Poole', title: 'Categorical Reparameterization with Gumbel-Softmax', year: 2017, venue: 'ICLR', url: 'https://arxiv.org/abs/1611.01144' },
    { authors: 'C. J. Maddison, A. Mnih & Y. W. Teh', title: 'The Concrete Distribution: A Continuous Relaxation of Discrete Random Variables', year: 2017, venue: 'ICLR', url: 'https://arxiv.org/abs/1611.00712' },
    { authors: 'G. Roeder, Y. Wu & D. Duvenaud', title: 'Sticking the Landing: Simple, Lower-Variance Gradient Estimators for Variational Inference', year: 2017, venue: 'NeurIPS', url: 'https://arxiv.org/abs/1703.09194' },
  ],
} satisfies LessonContent;
