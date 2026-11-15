import type { LessonContent } from '../../types';

const HMC_STEPS = [
  String.raw`**The idea.** A random walk explores by diffusing, which costs $O(d)$ steps to cross a distribution in $d$ dimensions. HMC instead gives the sampler **momentum**, so it travels in long, coherent arcs. Think of a puck sliding on a frictionless landscape rather than a drunk stumbling across it.`,
  String.raw`**Invent a physical system.** Augment the state $x$ with a momentum $v\in\mathbb R^d$ and define a Hamiltonian
$$H(x,v)=\underbrace{U(x)}_{-\log p(x)}+\underbrace{\tfrac12\|v\|^2}_{\text{kinetic energy}}.$$
The joint density $\propto e^{-H(x,v)}=p(x)\cdot\mathcal N(v;0,I)$ **factorizes**, so if we sample $(x,v)$ correctly and throw $v$ away, the $x$'s are exact samples from $p$. The momentum is pure scaffolding.`,
  String.raw`**Step 1: refresh the momentum.** Draw $v\sim\mathcal N(0,I)$, ignoring the old one. This is a valid Gibbs update of the $v$ block, since $v$ is independent of $x$ under the joint. It is also the only place new randomness enters.`,
  String.raw`**Step 2: follow the dynamics.** Hamilton's equations, $\dot x=v$, $\dot v=-\nabla U(x)$, conserve $H$ exactly — so in continuous time the proposal would always be accepted, however far it travels. Simulate them with $L$ **leapfrog** steps of size $\varepsilon$:
$$v\leftarrow v-\tfrac{\varepsilon}{2}\nabla U(x),\qquad x\leftarrow x+\varepsilon v,\qquad v\leftarrow v-\tfrac{\varepsilon}{2}\nabla U(x).$$`,
  String.raw`**Why leapfrog and not Euler.** The leapfrog integrator is **volume-preserving** (its Jacobian determinant is exactly 1) and **reversible** (negate $v$ and it retraces its path). Those two properties are precisely what a Metropolis proposal needs for the acceptance ratio to collapse to a difference of energies. Plain Euler has neither, and its energy drifts away without bound.`,
  String.raw`**Step 3: correct the integration error.** Leapfrog conserves $H$ only approximately, so accept the endpoint $(x^\*,v^\*)$ with probability
$$\min\Big(1,\;\exp\big(H(x,v)-H(x^\*,v^\*)\big)\Big).$$
All discretization error is absorbed here: the chain's stationary distribution is **exactly** $p$ for any $\varepsilon$ and $L$. A bad $\varepsilon$ costs you acceptances, never correctness.`,
  String.raw`**What you must tune.** $\varepsilon$ too large and leapfrog goes unstable (energy explodes, everything is rejected); too small and you crawl. $L$ too small and you are back to a random walk; too large and the trajectory can loop back ("U-turn") and waste work. **NUTS** (Hoffman & Gelman, 2014) chooses $L$ automatically by extending the trajectory until it starts doubling back, and tunes $\varepsilon$ to a target acceptance rate — which is why Stan and PyMC need no hand-tuning.`,
  String.raw`**The payoff.** On a $d$-dimensional product target, the number of steps needed scales as $O(d)$ for random-walk Metropolis, $O(d^{1/3})$ for MALA and $O(d^{1/4})$ for HMC, with optimal acceptance rates of about $0.234$, $0.574$ and $0.651$ respectively. Gradients are what buy the improvement — and gradients are the one thing machine learning always has.`,
];

export default {
  cards: [
    {
      kind: 'explain',
      title: 'The other way out',
      body: String.raw`[Variational inference](@ml/variational-inference) handled an intractable posterior by replacing it with the nearest member of a family you can write down. You get an answer fast, and you get it wrong by an amount you cannot measure.

Sampling makes the opposite bargain. Never compute $p(z\mid x)$; just produce a stream of draws $z^{(1)},z^{(2)},\dots$ whose histogram converges to it, and answer every question by averaging:
$$\mathbb E_{p(z\mid x)}[h(z)]\approx\frac1T\sum_{t=1}^{T}h\big(z^{(t)}\big).$$
Asymptotically exact, with error you can estimate from the samples themselves — and potentially very slow, with no reliable way to know when you have waited long enough.

The crucial enabling fact: **Markov chain Monte Carlo needs only $p$ up to a constant.** Every method below uses $p(z\mid x)$ solely through $\log p(x,z)$ or its gradient, and the unknown evidence $p(x)$ cancels. The thing that made exact inference impossible is simply never touched.`,
    },
    {
      kind: 'recall',
      title: 'MCMC in one card',
      points: [
        String.raw`Build a Markov chain whose **stationary distribution** is the target $\pi$; run it, and after a burn-in its states are (correlated) draws from $\pi$.`,
        String.raw`**Detailed balance** $\pi(x)T(x\to y)=\pi(y)T(y\to x)$ is a sufficient condition for $\pi$ to be stationary; with irreducibility and aperiodicity the chain converges to it.`,
        String.raw`**Metropolis–Hastings:** propose $y\sim q(y\mid x)$, accept with probability $\min\!\big(1,\frac{\pi(y)q(x\mid y)}{\pi(x)q(y\mid x)}\big)$. Only *ratios* of $\pi$ appear, so normalizing constants cancel.`,
        String.raw`Samples are **autocorrelated**: $T$ draws are worth an *effective sample size* $T_{\text{eff}}<T$, and the Monte Carlo standard error goes as $1/\sqrt{T_{\text{eff}}}$.`,
      ],
      link: 'stats/mcmc',
    },
    {
      kind: 'explain',
      title: 'Why a random walk is not enough',
      body: String.raw`Plain random-walk Metropolis proposes $y=x+\varepsilon\eta$, $\eta\sim\mathcal N(0,I)$, and asks whether the target likes $y$ better. It is beautifully general: all it needs is to *evaluate* $\pi$ up to a constant.

It is also doomed in high dimension. A blind step of size $\varepsilon$ in $d$ dimensions is almost surely a step into a region of lower density, because almost every direction is a bad direction. To keep acceptance reasonable you must shrink $\varepsilon$ like $d^{-1/2}$, and then crossing the distribution takes $O(d)$ steps. In a 1000-dimensional posterior that is hopeless.

The fix is to stop proposing blindly. The target hands you a free signal — the **score**
$$\nabla_x\log\pi(x)=-\nabla_x U(x),\qquad U:=-\log\pi,$$
which points uphill in density and, like everything else here, does not depend on the normalizing constant. A proposal that drifts along the score goes where the mass is. Machine learning is the ideal setting for this, because $\nabla\log\pi$ is exactly what automatic differentiation gives you for free.`,
    },
    {
      kind: 'explain',
      title: 'Langevin dynamics',
      body: String.raw`Consider the **overdamped Langevin** [stochastic differential equation](@math/sde-intro)
$$dX_t=\nabla\log\pi(X_t)\,dt+\sqrt{2}\,dW_t,$$
a particle pulled uphill in log-density and kicked around by [Brownian motion](@math/brownian-motion). Its Fokker–Planck equation has $\pi$ as the unique stationary density: the drift concentrates probability and the noise spreads it, and the factor $\sqrt 2$ is precisely the balance point. Run it forever and you are sampling from $\pi$.

Discretize with Euler–Maruyama at step $h$ and you get the **unadjusted Langevin algorithm** (ULA):
$$x_{k+1}=x_k+h\,\nabla\log\pi(x_k)+\sqrt{2h}\,\eta_k,\qquad \eta_k\sim\mathcal N(0,I).$$
(The widget below writes the same step as $x-\tfrac{\varepsilon^2}{2}\nabla U+\varepsilon\eta$, which is this with $h=\varepsilon^2/2$.)

And here is the catch that everything else in this lesson is organized around. **ULA does not sample from $\pi$.** The SDE does; its discretization does not. For a Gaussian target $\mathcal N(0,\sigma^2)$ the chain's stationary variance works out to
$$\sigma^2_{\text{ULA}}=\frac{\sigma^2}{1-h/(2\sigma^2)}>\sigma^2,$$
over-dispersed, and the bias is $O(h)$ — it does not shrink by running longer, only by taking smaller steps, which costs mixing speed. Worse, for $h\ge 2\sigma^2$ the chain diverges outright (Roberts & Tweedie, 1996).`,
    },
    {
      kind: 'widget',
      title: 'Four samplers, one banana',
      body: String.raw`The grey cloud is 420 **exact** draws from the target (its two factors are Gaussian, so we can sample it directly and compare honestly). The blue path is the chain.

Watch the readout: the chain's running estimate of $\mathbb E[x_1^2]$, whose true value is exactly 4.

- **RW**: wanders, rejects more and more as $\varepsilon$ grows, slow to cross the ridge — but the estimate stays near 4.
- **ULA**: moves confidently along the score and never rejects — and settles on the wrong answer. At $\varepsilon=0.5$ it is within about 10% of 4; at $1.2$ a long run gives about $7$ (and the chain keeps flying off and being reset); at $1.9$ it is past $50$ and effectively diverging. The target is not Gaussian, so the exact numbers differ from the Gaussian formula, but the trend is the same. Running longer does not help.
- **MALA**: the same proposal with a Metropolis test. The estimate returns to 4 at *every* $\varepsilon$; the acceptance rate falls instead.
- **HMC**: long coherent arcs. Drop $\varepsilon$ to about **0.5** before judging it — at $\varepsilon=1.2$ with $L=12$ the leapfrog integrator is already near its stability limit and most proposals are rejected, which is precisely the tuning failure described below. At $0.5$ it accepts about 96% and moves furthest per step of the four.`,
      widget: {
        type: 'MlLangevinSampler', props: { method: 'ula', eps: 1.2, leap: 12 },
        caption: 'Bias and variance in sampling are different diseases: a longer run cures variance, and does nothing at all for ULA’s bias.',
      },
    },
    {
      kind: 'mcq',
      prompt: 'You run the unadjusted Langevin algorithm for ten million steps and its estimate of a posterior variance is still 15% too large. What is the most likely explanation?',
      choices: [
        'The chain has not yet reached its stationary distribution; run it longer',
        'The discretization makes the chain stationary at a distribution close to, but not equal to, the target',
        'The score function is being computed incorrectly',
        'Monte Carlo error: ten million correlated samples is a small effective sample size',
      ],
      answer: 1,
      why: String.raw`ULA is Euler–Maruyama applied to an SDE, and the discretized chain has its own stationary distribution with an $O(h)$ offset from $\pi$ — over-dispersed, by $\sigma^2/(1-h/2\sigma^2)$ in the Gaussian case. That is *bias*, so averaging more of it converges to the wrong number; longer runs and effective-sample-size arguments address variance only. Adding the Metropolis accept/reject step (MALA) removes the bias exactly.`,
    },
    {
      kind: 'numeric',
      prompt: String.raw`Run ULA on the target $\mathcal N(0,1)$ with step size $h=0.5$. Its stationary variance is $\sigma^2/(1-h/(2\sigma^2))$. What variance does the chain actually converge to? (3 decimals)`,
      answer: 1.333,
      tolerance: 0.004,
      why: String.raw`$1/(1-0.5/2)=1/0.75=1.333$ — the chain is 33% too wide, forever. Halving $h$ to $0.25$ gives $1/0.875=1.143$, confirming the $O(h)$ scaling: to get the bias down by a factor of 10 you take ten times as many steps to travel the same distance. This single trade — accuracy against speed, with no accept/reject step to rescue you — is why MALA exists.`,
    },
    {
      kind: 'explain',
      title: 'MALA: one accept/reject step buys exactness',
      body: String.raw`The **Metropolis-adjusted Langevin algorithm** uses the ULA step as a *proposal* and then applies a Metropolis–Hastings test. The proposal is Gaussian but **asymmetric** — it is centred at $x+h\nabla\log\pi(x)$, which is not symmetric in $x$ and $y$ — so the $q$ ratio does not cancel:
$$\alpha=\min\left(1,\;\frac{\pi(y)\,q(x\mid y)}{\pi(x)\,q(y\mid x)}\right),\qquad q(y\mid x)=\mathcal N\big(y;\,x+h\nabla\log\pi(x),\,2hI\big).$$
Forgetting that asymmetry is the classic MALA bug: the chain looks fine and samples the wrong distribution.

What you gain is absolute. Detailed balance now holds for $\pi$ itself, so the stationary distribution is **exact for every step size**. What you pay is that a too-large $h$ no longer silently biases your answer — it loudly rejects your proposals, which is a failure mode you can actually see in the acceptance rate. That is the deal MCMC always offers: correct and diagnosable, or fast and quietly wrong.

MALA still proposes one step at a time, so it still diffuses. To stop diffusing altogether you need momentum.`,
    },
    {
      kind: 'widget',
      title: 'Hamiltonian Monte Carlo',
      body: String.raw`HMC is the workhorse behind Stan, PyMC and NumPyro, and the reason modern Bayesian statistics is practical at all. It is also a small masterpiece of construction: physics supplies a proposal whose acceptance probability is a difference of energies.`,
      widget: {
        type: 'StepReveal',
        props: {
          steps: HMC_STEPS,
          notes: ['Momentum beats diffusion.', 'An auxiliary variable that factorizes.', 'Gibbs on the momentum block.', 'Leapfrog integration.', 'Volume-preserving and reversible.', 'Exact for any ε and L.', 'ε and L, or let NUTS do it.', 'Better scaling in dimension.'],
        },
      },
    },
    {
      kind: 'order',
      prompt: 'Order one HMC transition.',
      steps: [
        String.raw`Draw a fresh momentum $v\sim\mathcal N(0,I)$`,
        String.raw`Record the current energy $H(x,v)=U(x)+\tfrac12\|v\|^2$`,
        String.raw`Run $L$ leapfrog steps of size $\varepsilon$ to reach a proposal $(x^\*,v^\*)$`,
        String.raw`Accept $x^\*$ with probability $\min\big(1,e^{H(x,v)-H(x^\*,v^\*)}\big)$, otherwise keep $x$`,
        String.raw`Discard the momentum and record $x$ as one sample`,
      ],
      why: String.raw`The momentum is resampled *before* the energy is recorded, because the accept/reject test compares the energy at the start of this trajectory with the energy at its end. Discarding $v$ at the end is legitimate because the joint density factorizes as $p(x)\mathcal N(v;0,I)$, so marginalizing the momentum leaves the $x$-marginal untouched.`,
    },
    {
      kind: 'multi',
      prompt: 'Which statements about HMC are correct?',
      choices: [
        'Its stationary distribution is exactly the target for any step size, because of the Metropolis correction',
        'The leapfrog integrator is used because it is volume-preserving and reversible',
        'Momentum is a modelling assumption about the posterior and must be chosen to match it',
        'Taking too large a leapfrog step size shows up as a collapsing acceptance rate rather than as a biased answer',
        'It needs the gradient of the log target, so it does not apply to discrete parameters',
      ],
      answers: [0, 1, 3, 4],
      why: String.raw`The accept/reject test absorbs all integration error, so correctness never depends on tuning — tuning only buys efficiency, and a bad $\varepsilon$ announces itself through rejections. Leapfrog's volume preservation is what makes the acceptance ratio a plain energy difference. The momentum is an auxiliary variable invented for the algorithm, not a claim about the posterior; its covariance (the "mass matrix") is a *tuning* choice that preconditions the geometry. Discrete parameters have no gradient, so they are usually marginalized out or updated by a separate Gibbs or Metropolis move.`,
    },
    {
      kind: 'explain',
      title: 'Scaling to deep learning: SG-MCMC, and an honest warning',
      body: String.raw`Every method above needs $\nabla\log\pi(x)$ over the *whole* dataset, and MALA and HMC need a full-data evaluation for each accept/reject test. On a million examples, one HMC step is a full epoch. Bayesian neural networks cannot be sampled this way.

**Stochastic gradient Langevin dynamics** (Welling & Teh, 2011) does the obvious thing: use a [minibatch](@ml/sgd-minibatch) gradient, and drop the Metropolis test entirely (you cannot afford it):
$$\theta_{k+1}=\theta_k+\frac{h_k}{2}\Big(\nabla\log p(\theta_k)+\frac{N}{|B|}\sum_{i\in B}\nabla\log p(x_i\mid\theta_k)\Big)+\sqrt{h_k}\,\eta_k.$$
This is SGD plus injected Gaussian noise of a carefully chosen size. With step sizes decreasing so that $\sum_k h_k=\infty$ and $\sum_k h_k^2<\infty$, the discretization bias and the minibatch noise both vanish asymptotically, and the iterates become posterior samples. **SGHMC** (Chen, Fox & Guestrin, 2014) adds momentum with a friction term that compensates for the gradient noise, which is why it looks so much like SGD with momentum.

Now the honest part. In practice step sizes are held constant, not decreased to zero, so the bias does **not** vanish; minibatch noise adds an extra, unaccounted diffusion; and in a network with millions of parameters and enormous numbers of symmetric modes, no chain explores the posterior in any meaningful sense — it explores one basin. Published SG-MCMC results for deep nets also often need a "cold posterior" ($p(\theta\mid\mathcal D)^{1/T}$ with $T<1$) to match the accuracy of plain SGD (Wenzel et al., 2020), which is an admission that something in the setup — the prior, the likelihood under data augmentation, or the sampler — is not right. Treat SG-MCMC in deep learning as a useful stochastic exploration heuristic, not as posterior sampling with the guarantees that phrase usually carries. [The next lesson](@ml/bayesian-deep-learning) takes that question head on.`,
    },
    {
      kind: 'truefalse',
      prompt: 'Because stochastic gradient Langevin dynamics is derived from an SDE whose stationary distribution is the posterior, running it at a fixed step size on a neural network yields samples from the posterior.',
      answer: false,
      why: String.raw`Two separate leaks. The Euler discretization has an $O(h)$ bias that only a decreasing step schedule (or a Metropolis test you cannot afford) removes, and the minibatch gradient injects extra noise beyond the $\sqrt{h}$ term the derivation accounts for. At a fixed $h$ both persist. The asymptotic guarantee in Welling & Teh (2011) requires $h_k\to0$ with $\sum h_k=\infty$, a regime almost nobody runs.`,
    },
    {
      kind: 'explain',
      title: 'Sampling as generation',
      body: String.raw`Everything so far treated sampling as *inference*. In generative modelling the same algorithms are the **generator**.

An [energy-based model](@ml/energy-based-models) defines $p_\theta(x)\propto e^{-E_\theta(x)}$. You cannot normalize it, but you can run Langevin dynamics on it, because the intractable $Z$ drops out of $\nabla_x\log p_\theta=-\nabla_x E_\theta$. Training by contrastive divergence is exactly "run a short chain, push the energy of the samples up and the energy of the data down".

[Score matching](@ml/score-matching) goes further and learns $s_\theta(x)\approx\nabla_x\log p(x)$ directly, never naming an energy at all — and then generates by Langevin. The difficulty is that the learned score is bad in the empty regions where a chain spends its early life, which is why Song & Ermon (2019) used **annealed** Langevin dynamics: run chains at a ladder of decreasing noise levels, each initialized from the last. Take that ladder to a continuum and you have [diffusion models](@ml/diffusion-models), where the reverse-time SDE is a non-equilibrium cousin of the Langevin step you just met — same score, same noise, but a schedule that runs for a fixed finite time rather than waiting for stationarity.

So the gradient-based samplers in this lesson are not a statistical side road. They are the inner loop of modern generative modelling.`,
    },
    {
      kind: 'match',
      prompt: 'Match each sampler or diagnostic to the statement that pins it down.',
      pairs: [
        ['Random-walk Metropolis', 'Needs only to evaluate the target; step size must shrink like $d^{-1/2}$'],
        ['ULA', 'Score-guided and never rejects, so it is biased by $O(h)$'],
        ['MALA', 'ULA proposal plus an asymmetric-proposal Metropolis test: exact for any step size'],
        ['HMC', 'Auxiliary momentum and leapfrog arcs; best dimension scaling of the four'],
        ['$\\hat R$ and effective sample size', 'Diagnostics that can reveal failure but never certify convergence'],
      ],
      why: String.raw`The progression is a single idea applied repeatedly: use more information about the target (values, then gradients, then gradients plus momentum) to propose better moves, and keep a Metropolis test wherever you can afford one to stay exact. The diagnostics sit outside that progression: $\hat R$ comparing between- and within-chain variance across several over-dispersed starts (Gelman & Rubin, 1992; rank-normalized in Vehtari et al., 2021) catches chains that disagree, but chains that agree may simply be stuck in the same place.`,
    },
    {
      kind: 'fill',
      prompt: String.raw`MCMC needs the target only up to a ___, which is why the evidence never has to be computed. Langevin dynamics adds a drift along the ___ of the log target. Without an accept/reject step the discretized chain is ___; adding one gives MALA, which is exact for any step size. HMC introduces an auxiliary ___ so that proposals travel in long coherent arcs.`,
      bank: ['constant', 'gradient', 'biased', 'momentum', 'unbiased', 'prior', 'entropy'],
      answer: ['constant', 'gradient', 'biased', 'momentum'],
      why: String.raw`Only ratios $\pi(y)/\pi(x)$ ever appear, so the normalizer cancels — the single property that makes MCMC applicable to posteriors and to energy-based models alike. The $O(h)$ discretization bias of ULA is removed by the Metropolis test, not by longer runs, and momentum is what converts diffusive exploration into ballistic exploration.`,
    },
    {
      kind: 'explain',
      title: 'Key takeaways',
      body: String.raw`- Sampling is the asymptotically exact alternative to variational inference. MCMC needs the target only **up to a normalizing constant**, so the intractable evidence never appears.
- Random-walk Metropolis is general and scales badly: $O(d)$ steps, optimal acceptance $\approx0.234$.
- **Langevin**: the SDE $dX=\nabla\log\pi\,dt+\sqrt2\,dW$ has $\pi$ as its stationary density. Its Euler discretization, **ULA**, does not — it is over-dispersed with an $O(h)$ bias that longer runs cannot fix.
- **MALA** = ULA proposal + Metropolis test (remember the asymmetric $q$ ratio): exact for any $h$; a bad $h$ costs acceptances, not correctness. $O(d^{1/3})$, optimal acceptance $\approx0.574$.
- **HMC**: auxiliary momentum, leapfrog (volume-preserving and reversible), energy-difference acceptance. $O(d^{1/4})$, optimal acceptance $\approx0.651$; NUTS tunes $L$ and $\varepsilon$ for you.
- **SG-MCMC** (SGLD, SGHMC) scales to deep nets by using minibatch gradients and dropping the Metropolis test, at the cost of a bias that in practice is never removed. Be sceptical of the word "posterior" there.
- Diagnostics ($\hat R$, effective sample size, trace plots) detect failure; nothing certifies convergence.
- The same machinery generates: Langevin on an energy, annealed Langevin on a learned score, and from there [diffusion models](@ml/diffusion-models).`,
    },
  ],
  references: [
    { authors: 'R. M. Neal', title: 'MCMC using Hamiltonian Dynamics', year: 2011, venue: 'Handbook of Markov Chain Monte Carlo, Chapman & Hall/CRC', url: 'https://arxiv.org/abs/1206.1901' },
    { authors: 'C. M. Bishop', title: 'Pattern Recognition and Machine Learning', year: 2006, venue: 'Springer', detail: 'Ch. 11 (Sampling Methods)' },
    { authors: 'M. Welling & Y. W. Teh', title: 'Bayesian Learning via Stochastic Gradient Langevin Dynamics', year: 2011, venue: 'ICML' },
    { authors: 'G. O. Roberts & R. L. Tweedie', title: 'Exponential Convergence of Langevin Distributions and Their Discrete Approximations', year: 1996, venue: 'Bernoulli 2(4), 341–363' },
    { authors: 'G. O. Roberts & J. S. Rosenthal', title: 'Optimal Scaling of Discrete Approximations to Langevin Diffusions', year: 1998, venue: 'J. R. Stat. Soc. B 60(1), 255–268' },
    { authors: 'A. Beskos, N. Pillai, G. Roberts, J.-M. Sanz-Serna & A. Stuart', title: 'Optimal Tuning of the Hybrid Monte Carlo Algorithm', year: 2013, venue: 'Bernoulli 19(5A), 1501–1534', url: 'https://arxiv.org/abs/1001.4460' },
    { authors: 'T. Chen, E. B. Fox & C. Guestrin', title: 'Stochastic Gradient Hamiltonian Monte Carlo', year: 2014, venue: 'ICML', url: 'https://arxiv.org/abs/1402.4102' },
    { authors: 'F. Wenzel et al.', title: 'How Good is the Bayes Posterior in Deep Neural Networks Really?', year: 2020, venue: 'ICML', url: 'https://arxiv.org/abs/2002.02405' },
    { authors: 'M. D. Hoffman & A. Gelman', title: 'The No-U-Turn Sampler: Adaptively Setting Path Lengths in Hamiltonian Monte Carlo', year: 2014, venue: 'JMLR 15, 1593–1623', url: 'https://arxiv.org/abs/1111.4246' },
    { authors: 'A. Vehtari, A. Gelman, D. Simpson, B. Carpenter & P.-C. Bürkner', title: 'Rank-Normalization, Folding, and Localization: An Improved R-hat for Assessing Convergence of MCMC', year: 2021, venue: 'Bayesian Analysis 16(2), 667–718', url: 'https://arxiv.org/abs/1903.08008' },
  ],
} satisfies LessonContent;
