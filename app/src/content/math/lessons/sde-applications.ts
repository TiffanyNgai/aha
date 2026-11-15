import type { LessonContent } from '../../types';

export default {
  cards: [
    {
      kind: 'explain',
      title: 'One equation, four literatures',
      body: String.raw`$$dX_t = \mu(X_t,t)\,dt + \sigma(X_t,t)\,dW_t$$
is written by physicists sampling a Boltzmann distribution, by quants pricing options, by ecologists modelling a population near its carrying capacity, and by machine-learning researchers explaining why stochastic gradient descent generalises. Same symbols, four very different claims about reality.

This lesson walks through those four, and is deliberately careful about a question the textbooks often skip: **in each case, is the SDE the actual model, a provable limit of a more honest model, or just a suggestive analogy?** The answers differ, and knowing which is which is most of the skill.`,
    },
    {
      kind: 'explain',
      title: 'Langevin dynamics: turning a density into a dynamics',
      body: String.raw`Suppose you can evaluate $\log p(x)$ up to a constant and want samples from $p$. Run
$$dX_t = \nabla_x\log p(X_t)\,dt + \sqrt2\,dW_t.$$
Its stationary density **is** $p$. The check is one line of Fokker–Planck: equilibrium with zero probability current needs $\mu\,p = \tfrac12\sigma^2\partial_x p$, and with $\sigma^2 = 2$ that is exactly $\mu = \partial_x\log p$.

Writing $p\propto e^{-U}$ turns it into a physical statement: a particle sliding down a potential $U$ while being kicked. The drift finds the minima; the noise refuses to let it settle, and the trade-off reproduces the Boltzmann weight. The quadratic case $U = \tfrac12\theta x^2$ is precisely the [Ornstein–Uhlenbeck process](@math/ornstein-uhlenbeck).

**How loose is it?** Not loose at all in continuous time — this is a theorem. The looseness enters on the computer: the discretised chain samples a slightly wrong distribution, which is why **MALA** adds a Metropolis accept/reject step to remove the bias, and why unadjusted Langevin is only used when that bias is cheaper than the rejections. See [MCMC](@stats/mcmc).`,
    },
    {
      kind: 'widget',
      title: 'The drift field of a double well',
      body: String.raw`The Langevin drift $\nabla\log p$ for a two-well density, $U(x,y) = (x^2-1)^2 + y^2$. Arrows flow into the two minima at $x = \pm1$; the deterministic flow alone would trap a particle in whichever well it started in, forever. Noise is what lets it cross the ridge at $x=0$ — rarely, at a rate falling exponentially in the barrier height (Kramers' law). This is the central difficulty of sampling: the drift finds modes, but only the noise can move between them.`,
      widget: { type: 'PhasePortrait', props: { dx: '-4*x*(x^2-1)', dy: '-2*y', range: 2 } },
    },
    {
      kind: 'mcq',
      prompt: String.raw`Which SDE has the target density $p$ as its stationary distribution?`,
      choices: [
        String.raw`$dX = \nabla\log p(X)\,dt + \sqrt2\,dW$`,
        String.raw`$dX = -\nabla\log p(X)\,dt + \sqrt2\,dW$`,
        String.raw`$dX = \nabla\log p(X)\,dt + dW$`,
        String.raw`$dX = \nabla p(X)\,dt + \sqrt2\,dW$`,
      ],
      answer: 0,
      why: String.raw`Zero probability current requires $\mu = \tfrac12\sigma^2\nabla\log p$, so the drift must be $+\nabla\log p$ when $\sigma^2 = 2$. Flipping the sign drives the process *away* from high-density regions. Keeping $\sigma = 1$ halves the noise variance and gives the stationary density $p^2$ (renormalised) instead of $p$. And using $\nabla p$ rather than $\nabla\log p$ loses the division by $p$, so the dynamics depends on the normalising constant.`,
    },
    {
      kind: 'explain',
      title: 'Black–Scholes: pricing by hedging away the noise',
      body: String.raw`Model a share price as geometric Brownian motion, $dS = \mu S\,dt + \sigma S\,dW$. Black, Scholes and Merton (1973) observed that an option on $S$ can be **replicated** by continuously rebalancing a portfolio of the share and cash. Itô's lemma applied to the option value $V(S,t)$ shows that holding $\partial V/\partial S$ shares cancels the $dW$ term exactly. A portfolio with no noise must earn the risk-free rate $r$, or there is arbitrage — and that argument yields the Black–Scholes PDE
$$\frac{\partial V}{\partial t} + \tfrac12\sigma^2S^2\frac{\partial^2V}{\partial S^2} + rS\frac{\partial V}{\partial S} - rV = 0.$$
Two features surprise newcomers: the drift $\mu$ has vanished (hedging removed it), and the equation is the [heat equation](@math/pde-heat-equation) in disguise after a change of variables.

**How loose is it?** The hedging argument is exact *given the model*; the model is the weak part. Real returns have fat tails and jumps, volatility is neither constant nor deterministic (the "volatility smile" is the market pricing in that fact), rebalancing is discrete and costly, and liquidity evaporates exactly when you need it. Practitioners use Black–Scholes mainly as a **quoting convention** — a monotone map between price and implied volatility — rather than as a belief about the world.`,
    },
    {
      kind: 'widget',
      title: 'Multiplicative noise and the log-normal tail',
      body: String.raw`Geometric Brownian motion from $S_0=1$, with the law of $S_1$ on the right. The paths never cross zero — noise proportional to the state vanishes as the state does — and the terminal distribution is **log-normal**: skewed, with a long right tail and a mode below the mean. Raise $\sigma$ and the gap between the typical outcome and the average outcome widens, even though the drift is unchanged. That gap is the $-\tfrac12\sigma^2$ Itô correction made visible.`,
      widget: { type: 'MathSdePaths', props: { mode: 'gbm', mu: 0.5, sigma: 0.5 } },
    },
    {
      kind: 'numeric',
      prompt: String.raw`For $dS = \mu S\,dt + \sigma S\,dW$ with $\mu = 0.10$ and $\sigma = 0.40$ per year, what is the drift of $\log S$ per year?`,
      answer: 0.02,
      tolerance: 0.001,
      why: String.raw`Itô's lemma gives $d\log S = (\mu - \tfrac12\sigma^2)dt + \sigma\,dW$, so the drift is $0.10 - \tfrac12(0.16) = 0.02$. The *expected price* still grows at 10% per year, but the *typical* (median) price grows at only 2% — volatility drags the median below the mean. Taking the answer to be 0.10 ignores the Itô correction, which here eats 80% of the growth.`,
    },
    {
      kind: 'explain',
      title: 'Population and biological noise',
      body: String.raw`A population of size $N$ near its carrying capacity $K$ is usually written as logistic growth plus noise, but *which* noise matters:

- **Demographic noise** — births and deaths are individually random. Over a short interval the number of events is of order $N$ and their fluctuation of order $\sqrt N$, giving $dN = rN(1 - N/K)\,dt + \sigma\sqrt{N}\,dW$. The $\sqrt N$ means relative fluctuations shrink like $1/\sqrt N$: noise dominates small populations and is negligible for large ones. This is why small populations go extinct even when the deterministic model predicts a healthy equilibrium.
- **Environmental noise** — good years and bad years hit every individual at once: $dN = rN(1-N/K)dt + \sigma N\,dW$, proportional to $N$, so relative fluctuations do *not* shrink with population size.

Same equation, different exponent on $N$, opposite conclusions about whether large populations are safe.

**How loose is it?** Better than analogy, but with limits. For density-dependent birth–death chains, Kurtz (1970, 1971) proved a law of large numbers (the scaled chain converges to the logistic ODE over any fixed time horizon), and the fluctuations of order $1/\sqrt N$ around it are described by a Gaussian diffusion of exactly the $\sqrt N$-noise form above (Ethier and Kurtz 1986, Ch. 11; Gardiner, Ch. 7). The same construction gives Gillespie's **chemical Langevin equation** for reaction networks and the Wright–Fisher diffusion in population genetics. But the approximation is only valid for fluctuations of that size: it fails exactly where it matters most — at small $N$, near extinction, and for rare large deviations — where you should simulate the discrete chain instead.`,
    },
    {
      kind: 'truefalse',
      prompt: String.raw`With demographic noise $\sigma\sqrt N\,dW$, the *relative* size of fluctuations, $\text{sd}(N)/N$, shrinks as the population grows.`,
      answer: true,
      why: String.raw`The noise term scales as $\sqrt N$ while the population scales as $N$, so relative fluctuations fall like $1/\sqrt N$ — the law-of-large-numbers effect, and the reason large populations behave almost deterministically. Environmental noise $\sigma N\,dW$ is the contrasting case: it scales *with* $N$, so being large is no protection.`,
    },
    {
      kind: 'explain',
      title: 'SGD as an SDE',
      body: String.raw`[Mini-batch SGD](@ml/sgd-minibatch) updates $\theta_{k+1} = \theta_k - \eta\,\widehat{\nabla L}(\theta_k)$, where the batch gradient is the full gradient plus mean-zero noise. Treating one step as a time increment $\eta$ and invoking a central-limit argument for the batch gives the **stochastic modified equation**
$$d\theta = -\nabla L(\theta)\,dt + \sqrt{\tfrac{\eta}{B}}\,\Sigma(\theta)^{1/2}\,dW,$$
with $\Sigma$ the per-example gradient covariance and $B$ the batch size. Read off the consequences: the noise scale is set by the **ratio $\eta/B$**, a "temperature". Doubling the learning rate and the batch size together leaves the dynamics unchanged — the linear scaling rule, used to keep large-batch training working. A higher temperature flattens the effective stationary distribution over parameters, which is the usual story for why moderate SGD noise biases training towards flat minima — a hypothesis, not an established theorem. The linear scaling rule itself is also known to break down at very large batch sizes.

**How loose is it?** Loosest of the four. Gradient noise is not exactly Gaussian (whether it is heavy-tailed in practice is debated); $\Sigma(\theta)$ is strongly anisotropic and state-dependent, so there is generally no potential whose Boltzmann distribution SGD samples; the weak approximation holds to $O(\eta)$ or $O(\eta^2)$ for *small* learning rates, while the interesting phenomena happen at large ones; and training is non-stationary, so "stationary distribution" talk is at best a local statement. Treat it as a source of hypotheses — the linear scaling rule among them — not as proof.`,
    },
    {
      kind: 'widget',
      title: 'The noise that the SDE is modelling',
      body: String.raw`Full-batch gradient descent (grey, dashed) and mini-batch SGD (coloured) on a least-squares problem, with the loss contours behind them. SGD does not converge to the minimum: it reaches a neighbourhood and then rattles around in it. Shrink the batch size $B$ or raise the learning rate $\eta$ and the cloud widens — that width is the $\sqrt{\eta/B}$ in the SDE. Switch on the decaying schedule and the temperature is annealed to zero, which is what makes the iterates settle.`,
      widget: { type: 'MlSGDNoise', props: { n: 200, batch: 4, lr: 0.15, showGD: true } },
    },
    {
      kind: 'fill',
      prompt: String.raw`In the SDE picture of SGD the noise scale is set by the ratio ___, so doubling the learning rate and the ___ together leaves the dynamics roughly unchanged. In Langevin sampling the analogous role is played by the ___.`,
      bank: [String.raw`$\eta/B$`, String.raw`$\eta B$`, 'batch size', 'number of epochs', 'temperature', 'gradient norm'],
      answer: [String.raw`$\eta/B$`, 'batch size', 'temperature'],
      why: String.raw`Averaging $B$ independent gradients divides the noise variance by $B$; each step adds noise of variance $\propto\eta^2/B$ over a time $\eta$, so the noise strength per unit time is $\propto\eta/B$, the temperature-like quantity — the content of the linear scaling rule. Langevin dynamics makes the same trade-off explicit: noise strength against the pull of the drift.`,
    },
    {
      kind: 'multi',
      prompt: 'In which of these cases is the SDE a *provable* limit of a more detailed model, rather than an analogy?',
      choices: [
        'Langevin dynamics as a sampler for a given density p (in continuous time)',
        'The diffusion limit of a birth–death chain for a large population',
        'Brownian motion as the limit of a rescaled random walk',
        'SGD as a continuous-time stochastic process at a practical learning rate',
        'Geometric Brownian motion as a description of real share prices',
      ],
      answers: [0, 1, 2],
      why: String.raw`The Langevin stationary density is a one-line Fokker–Planck theorem; Kurtz's limit theorems make the population diffusion a genuine large-$N$ approximation for fluctuations of size $1/\sqrt N$; Donsker's theorem does the same for the random walk. The SGD approximation needs small learning rates and a Gaussian-noise assumption that real gradients violate, and geometric Brownian motion is a modelling *choice* about markets that fat tails and volatility smiles visibly contradict.`,
    },
    {
      kind: 'explain',
      title: 'A wider sweep, briefly',
      body: String.raw`- **Neuroscience.** Subthreshold membrane potential under synaptic bombardment is modelled as an Ornstein–Uhlenbeck process; add a firing threshold and you get the leaky integrate-and-fire neuron, whose spike times are first-passage times of an OU process.
- **Chemistry.** Gillespie's chemical Langevin equation is the large-copy-number limit of the exact stochastic simulation algorithm for reaction networks.
- **Filtering and tracking.** The Kalman–Bucy filter is the exact solution of an estimation problem posed with linear SDEs; its nonlinear cousins run particle filters over SDE dynamics.
- **Climate and turbulence.** Hasselmann's 1976 model treats weather as fast noise driving slow climate variables — an OU process with a very long correlation time.
- **Generative models.** The forward and [reverse-time SDEs](@math/time-reversal-sde) of diffusion models, where the "physics" is invented on purpose so that it can be reversed.`,
    },
    {
      kind: 'explain',
      title: 'When the SDE model is the wrong model',
      body: String.raw`Four warning signs that a diffusion is not what you want:

1. **Jumps.** SDE paths are continuous. Market crashes, neuron spikes and single-molecule binding events are not. Jump-diffusions or point processes are the honest models; fitting a diffusion to jumpy data silently absorbs the jumps into an inflated $\sigma$.
2. **Heavy tails.** Gaussian increments mean Gaussian tails. If your increments have infinite variance, Donsker's theorem does not apply and the limit is a stable process, not Brownian motion.
3. **Memory.** Brownian motion is Markov with independent increments. Viscoelastic media, networks and many biological signals show long-range correlations; those need fractional Brownian motion or an explicitly augmented state.
4. **Which calculus.** When white noise is an idealisation of a real signal with a short but non-zero correlation time, the physically correct limit is **Stratonovich**, not Itô (Wong–Zakai). Choosing the wrong convention for state-dependent noise shifts the drift by $\tfrac12\sigma\sigma'$ — a real, measurable difference, not bookkeeping.

The common failure mode is not using the wrong SDE; it is forgetting that an SDE was ever a choice.`,
    },
    {
      kind: 'match',
      prompt: 'Match each application to the SDE it uses.',
      pairs: [
        ['Sampling from a density p', String.raw`$dX = \nabla\log p(X)\,dt + \sqrt2\,dW$`],
        ['Black–Scholes share price', String.raw`$dS = \mu S\,dt + \sigma S\,dW$`],
        ['Demographic noise in a population', String.raw`$dN = rN(1-N/K)dt + \sigma\sqrt N\,dW$`],
        ['Velocity of a Brownian particle', String.raw`$dv = -(\gamma/m)v\,dt + \sigma\,dW$`],
        ['Mini-batch SGD', String.raw`$d\theta = -\nabla L\,dt + \sqrt{\eta/B}\,\Sigma^{1/2}dW$`],
      ],
      why: String.raw`The pattern to notice is how the noise scales with the state: constant for a Brownian particle's velocity, proportional to $S$ for prices (so they stay positive), proportional to $\sqrt N$ for counting noise, and set by the gradient covariance for SGD. The drift is just the deterministic model you already had.`,
    },
    {
      kind: 'explain',
      title: 'Key takeaways',
      body: String.raw`- **Langevin:** $dX = \nabla\log p\,dt + \sqrt2\,dW$ has stationary density $p$ — a theorem in continuous time, biased once discretised, which is what MALA's accept step repairs.
- **Black–Scholes:** geometric Brownian motion plus continuous hedging removes the drift and gives a heat-equation PDE. Exact given the model; the model has fat tails, jumps and a volatility smile working against it.
- **Populations:** demographic noise scales as $\sqrt N$ (relative fluctuations die out, extinction threatens small populations); environmental noise scales as $N$ (size is no protection). Provable as a large-$N$ limit of a birth–death chain — and unreliable precisely at small $N$.
- **SGD:** $d\theta = -\nabla L\,dt + \sqrt{\eta/B}\,\Sigma^{1/2}dW$ explains the linear scaling rule and the noise-flat-minima story, but rests on Gaussian, small-$\eta$ assumptions that practice violates. Hypothesis generator, not proof.
- **Red flags for any diffusion model:** jumps, heavy tails, long memory, and an unexamined choice between Itô and Stratonovich.`,
    },
  ],
  references: [
    { authors: 'F. Black, M. Scholes', title: 'The pricing of options and corporate liabilities', year: 1973, venue: 'Journal of Political Economy 81(3), 637–654' },
    { authors: 'R. C. Merton', title: 'Theory of rational option pricing', year: 1973, venue: 'Bell Journal of Economics and Management Science 4(1), 141–183' },
    { authors: 'D. T. Gillespie', title: 'The chemical Langevin equation', year: 2000, venue: 'Journal of Chemical Physics 113(1), 297–306' },
    { authors: 'T. G. Kurtz', title: 'Solutions of ordinary differential equations as limits of pure jump Markov processes', year: 1970, venue: 'Journal of Applied Probability 7(1), 49–58' },
    { authors: 'T. G. Kurtz', title: 'Limit theorems for sequences of jump Markov processes approximating ordinary differential processes', year: 1971, venue: 'Journal of Applied Probability 8(2), 344–356' },
    { authors: 'S. N. Ethier, T. G. Kurtz', title: 'Markov Processes: Characterization and Convergence', year: 1986, venue: 'Wiley', detail: 'Ch. 11 (density dependent population processes)' },
    { authors: 'Q. Li, C. Tai, W. E', title: 'Stochastic modified equations and dynamics of stochastic gradient algorithms I: mathematical foundations', year: 2019, venue: 'Journal of Machine Learning Research 20(40), 1–47' },
    { authors: 'S. Mandt, M. D. Hoffman, D. M. Blei', title: 'Stochastic gradient descent as approximate Bayesian inference', year: 2017, venue: 'Journal of Machine Learning Research 18(134), 1–35' },
    { authors: 'C. Gardiner', title: 'Stochastic Methods: A Handbook for the Natural and Social Sciences', year: 2009, venue: '4th ed., Springer', detail: 'Ch. 5 (Fokker–Planck equation) and Ch. 7 (master equations, birth–death processes and their diffusion approximation)' },
  ],
} satisfies LessonContent;
