import type { LessonContent } from '../../types';

export default {
  cards: [
    {
      kind: 'explain',
      title: 'Noise on a leash',
      body: String.raw`Brownian motion wanders away forever: $\operatorname{Var}(W_t) = t$ grows without bound. Almost nothing in nature does that. A molecule's velocity, a protein's concentration, an interest rate, the temperature of a room — all fluctuate, but around a level they keep returning to.

Add a restoring pull to the noise and you get the **Ornstein–Uhlenbeck (OU) process**:
$$dX_t = \theta\,(m - X_t)\,dt + \sigma\,dW_t,\qquad \theta > 0.$$
Above the mean level $m$ the drift pushes down; below it, up; always proportional to the distance. It is the simplest equation with both noise and memory — and, with geometric Brownian motion, one of the few non-trivial SDEs that can be solved completely by hand. That combination is why it turns up everywhere.`,
    },
    {
      kind: 'explain',
      title: 'Three parameters, three jobs',
      body: String.raw`Take $m = 0$ for the rest of the lesson (replace $X$ by $X - m$ to put it back):
$$dX_t = -\theta X_t\,dt + \sigma\,dW_t.$$
- $m$ — the level the process reverts **to**.
- $\theta$ — the **rate** of reversion, in units of 1/time. Its reciprocal $1/\theta$ is the time the process takes to forget where it was.
- $\sigma$ — the **strength of the kicks**, in units of (state)/$\sqrt{\text{time}}$.

Two competing effects: the drift contracts, the noise inflates. The balance between them is the whole story, and the next few cards compute it exactly.`,
    },
    {
      kind: 'widget',
      title: 'Solving it exactly',
      widget: {
        type: 'StepReveal',
        props: {
          steps: [
            String.raw`The drift is linear, so try the **integrating factor** $e^{\theta t}$, exactly as for the ODE $x' = -\theta x$.`,
            String.raw`Apply Itô's lemma to $f(t,x) = e^{\theta t}x$. Since $f_{xx} = 0$, there is **no Itô correction**: $d\big(e^{\theta t}X_t\big) = \theta e^{\theta t}X_t\,dt + e^{\theta t}\,dX_t$.`,
            String.raw`Substitute $dX_t = -\theta X_t\,dt + \sigma\,dW_t$. The two drift terms cancel: $d\big(e^{\theta t}X_t\big) = \sigma e^{\theta t}\,dW_t$.`,
            String.raw`Integrate from 0 to $t$: $e^{\theta t}X_t - X_0 = \sigma\int_0^t e^{\theta s}\,dW_s$.`,
            String.raw`Multiply by $e^{-\theta t}$: $\displaystyle X_t = X_0e^{-\theta t} + \sigma\int_0^t e^{-\theta(t-s)}\,dW_s.$`,
            String.raw`Read it off: a **deterministic decay** of the initial condition, plus an **exponentially weighted average of past kicks** — recent noise counts most, noise from long ago has been forgotten.`,
          ],
          notes: [
            'Same first move as for a linear ODE.',
            'Itô’s correction term is ½σ²f_xx, and f is linear in x, so it vanishes.',
            'This is why OU is solvable: the equation for e^{θt}X has no X left in it.',
            'The right-hand side is an Itô integral of a deterministic function.',
            'This is the explicit solution, valid for every path.',
            'The weight e^{−θ(t−s)} is the memory kernel.',
          ],
        },
      },
    },
    {
      kind: 'explain',
      title: 'The law of X at any time',
      body: String.raw`The solution is $X_0e^{-\theta t}$ plus an Itô integral of a **deterministic** integrand, and such an integral is exactly Gaussian with mean 0. So $X_t$ is **normal** — no approximation, at every $t$. Its mean decays and its variance follows from the Itô isometry:
$$\mathbb E[X_t] = x_0e^{-\theta t},\qquad \operatorname{Var}(X_t) = \sigma^2\!\int_0^t e^{-2\theta(t-s)}ds = \frac{\sigma^2}{2\theta}\big(1 - e^{-2\theta t}\big).$$
The mean reverts with time constant $1/\theta$, so the **half-life** of a displacement is $\ln 2/\theta$. The variance starts at 0 and saturates at $\sigma^2/2\theta$: unlike Brownian motion, the spread stops growing.`,
    },
    {
      kind: 'numeric',
      prompt: String.raw`An OU process with $\theta = 0.5$ starts at $x_0 = 4$ (reverting to 0). What is $\mathbb E[X_2]$?`,
      answer: 1.4715,
      tolerance: 0.01,
      why: String.raw`$\mathbb E[X_t] = x_0e^{-\theta t} = 4e^{-0.5\cdot2} = 4e^{-1} \approx 1.47$. After one time constant $1/\theta = 2$ the displacement has shrunk to a fraction $1/e \approx 37\%$ of its initial size — not to zero, and not linearly.`,
    },
    {
      kind: 'widget',
      title: 'Pull against kick',
      body: String.raw`Twelve OU paths from $X_0 = 2$ over $[0,1]$, with the histogram of $X_1$ over 600 runs and the exact normal density in red. Raise $\theta$: the paths are yanked to 0 faster *and* fluctuate in a narrower band — the two effects you can now read off the formulas $x_0e^{-\theta t}$ and $\sigma^2(1-e^{-2\theta t})/2\theta$. Raise $\sigma$ instead and only the band widens.`,
      widget: { type: 'MathSdePaths', props: { mode: 'ou', theta: 3, sigma: 1 } },
    },
    {
      kind: 'explain',
      title: 'The stationary distribution',
      body: String.raw`Let $t\to\infty$. The memory of $x_0$ decays to nothing and the variance saturates:
$$X_t \ \longrightarrow\ \mathcal N\!\Big(0,\ \frac{\sigma^2}{2\theta}\Big) =: \pi.$$
$\pi$ is the **stationary** (or invariant, or equilibrium) distribution: start the process with $X_0\sim\pi$ and $X_t\sim\pi$ for all $t$ — the distribution stops moving, even though every path keeps moving.

The same answer from the [Fokker–Planck equation](@math/ito-calculus): set $\partial_t p = 0$ in $\partial_t p = \partial_x(\theta x\,p) + \tfrac12\sigma^2\partial_{xx}p$ and solve, giving $p_\infty(x)\propto e^{-\theta x^2/\sigma^2}$ — the same Gaussian. Written as $p_\infty \propto e^{-2U(x)/\sigma^2}$ with potential $U(x) = \tfrac12\theta x^2$, this is a Boltzmann distribution: *the OU process is a particle in a quadratic well at temperature $\sigma^2/2$.* This reading is the bridge to sampling, below.

Note the asymmetry: more pull **or** less noise narrows $\pi$, and only the ratio $\sigma^2/\theta$ matters for its width.`,
    },
    {
      kind: 'mcq',
      prompt: String.raw`You double both $\theta$ and $\sigma$ in $dX = -\theta X\,dt + \sigma\,dW$. What happens to the stationary distribution?`,
      choices: [
        'Its variance doubles',
        'It is unchanged',
        'Its variance halves',
        'Its variance quadruples',
      ],
      answer: 0,
      why: String.raw`The stationary variance is $\sigma^2/2\theta$. Doubling $\sigma$ multiplies it by 4, doubling $\theta$ divides it by 2, net factor 2. The process also relaxes twice as fast, but relaxation *speed* and equilibrium *width* are controlled by different combinations — $\theta$ alone and $\sigma^2/\theta$ respectively.`,
    },
    {
      kind: 'explain',
      title: 'Memory: the autocorrelation function',
      body: String.raw`Started in equilibrium, OU is a **stationary Gaussian process**: all its statistics are shift-invariant in time, so it is fully described by one function of the lag $\tau$:
$$\operatorname{Cov}(X_t, X_{t+\tau}) = \frac{\sigma^2}{2\theta}\,e^{-\theta|\tau|}, \qquad \operatorname{Corr}(X_t, X_{t+\tau}) = e^{-\theta|\tau|}.$$
Correlation decays **exponentially** with lag, with **correlation time** $\tau_c = 1/\theta$. Brownian motion, by contrast, has $\operatorname{Corr}(W_s,W_t) = \sqrt{s/t}$ for $s\le t$: it is not stationary, depends on the times rather than the lag, and decays only as a slow power law — it never settles into a finite memory.

Two consequences used constantly in practice:
- Samples taken closer together than $\tau_c$ are nearly redundant. Averaging $n$ of them is worth roughly $n\,\Delta t/(2\tau_c)$ independent samples — the origin of the **effective sample size** in MCMC diagnostics.
- The Fourier transform of $e^{-\theta|\tau|}$ is the **Lorentzian** power spectrum $S(\omega) = \sigma^2/(\theta^2+\omega^2)$: flat (white) below $\omega\approx\theta$, falling like $1/\omega^2$ above it. OU is the standard model of band-limited noise in physics and electronics.`,
    },
    {
      kind: 'widget',
      title: 'How fast does it forget?',
      body: String.raw`The correlation $e^{-\theta|\tau|}$ between $X_t$ and $X_{t+\tau}$ (green), with the $1/e$ level marked (blue). Where the curves cross is the correlation time $\tau_c = 1/\theta$. Slide $\theta$: a stiff process (large $\theta$) forgets almost immediately and looks like white noise; a slack one stays correlated for a long time and looks like a slowly drifting baseline.`,
      widget: {
        type: 'FunctionPlot',
        props: {
          fns: ['exp(-th*abs(x))', '0.3679'],
          x: [0, 8],
          y: [0, 1.05],
          xLabel: 'lag τ',
          yLabel: 'correlation',
          params: [{ name: 'th', min: 0.2, max: 4, value: 1, label: 'reversion rate θ' }],
          labels: ['exp(−θ|τ|)', '1/e level'],
        },
      },
    },
    {
      kind: 'fill',
      prompt: String.raw`For OU the correlation between $X_t$ and $X_{t+\tau}$ is ___, so the correlation time is $\tau_c = $ ___, and the stationary variance is ___.`,
      bank: [String.raw`$e^{-\theta|\tau|}$`, String.raw`$e^{-\theta^2\tau}$`, String.raw`$1/\theta$`, String.raw`$\theta$`, String.raw`$\sigma^2/2\theta$`, String.raw`$\sigma^2\theta/2$`],
      answer: [String.raw`$e^{-\theta|\tau|}$`, String.raw`$1/\theta$`, String.raw`$\sigma^2/2\theta$`],
      why: String.raw`Correlation decays exponentially at rate $\theta$, so it falls to $1/e$ after a time $1/\theta$. The equilibrium width balances kicks against pull and depends only on the ratio $\sigma^2/\theta$ — doubling the pull halves the variance.`,
    },
    {
      kind: 'explain',
      title: 'You never need Euler–Maruyama for this one',
      body: String.raw`Because the increment over any step is Gaussian with known mean and variance, OU can be simulated **exactly**, with no discretisation error at any step size:
$$X_{n+1} = e^{-\theta\Delta t}X_n + \sigma\sqrt{\frac{1 - e^{-2\theta\Delta t}}{2\theta}}\;Z_n,\qquad Z_n\sim\mathcal N(0,1)\ \text{independent}.$$
This is an **AR(1)** time series with coefficient $\phi = e^{-\theta\Delta t}$ — OU is the continuous-time limit of the autoregressive model, and sampling it on a grid gives back AR(1) exactly.

Compare Euler–Maruyama, $X_{n+1} = (1-\theta\Delta t)X_n + \sigma\sqrt{\Delta t}Z_n$: it is the first-order expansion of the exact rule, and it is unstable once $\theta\Delta t > 2$. Two uses for the exact scheme: generating long correlated noise traces cheaply, and providing a **reference solution** for testing other solvers — which is why OU is the standard test problem for convergence studies.`,
    },
    {
      kind: 'truefalse',
      prompt: String.raw`The exact update $X_{n+1} = e^{-\theta\Delta t}X_n + \sigma\sqrt{(1-e^{-2\theta\Delta t})/2\theta}\,Z_n$ gives samples with the correct distribution however large $\Delta t$ is.`,
      answer: true,
      why: String.raw`The OU transition law is exactly normal with mean $e^{-\theta\Delta t}x_n$ and variance $\sigma^2(1-e^{-2\theta\Delta t})/2\theta$, and that is precisely what the update draws, so the joint law of the samples is exact for any step. Note what this does *not* give you: values between the grid points. Euler–Maruyama, in contrast, is only an approximation and blows up for $\theta\Delta t > 2$.`,
    },
    {
      kind: 'explain',
      title: 'Why it is the workhorse',
      body: String.raw`The same four lines of algebra get reused across fields:

- **Physics.** Uhlenbeck and Ornstein (1930) wrote it for the *velocity* of a Brownian particle: $m\,dv = -\gamma v\,dt + \sqrt{2\gamma k_BT}\,dW$. Here $\theta = \gamma/m$ and the stationary variance is $\sigma^2/2\theta = k_BT/m$ — exactly equipartition, $\tfrac12m\langle v^2\rangle = \tfrac12k_BT$. The noise strength and the friction are locked together by the temperature: the **fluctuation–dissipation relation**. Integrating $v$ gives back ordinary diffusion on timescales $\gg m/\gamma$.
- **Finance.** Vasicek (1977) modelled the short interest rate as $dr = a(b-r)dt + \sigma dW$ — an early and influential mean-reverting term-structure model, still a reference point for rate and spread models. Commodity and volatility models use the same shape, usually on a log scale to keep values positive.
- **Sampling.** Replace the quadratic well by a general potential $U = -\log p$ and you get **Langevin dynamics**, $dX = \nabla\log p(X)\,dt + \sqrt2\,dW$, whose stationary distribution is $p$. OU is the case $p$ Gaussian, and it is the case where the convergence rate can be computed exactly — so it is the model problem for every mixing-time analysis.
- **Generative models.** The variance-preserving forward process of [score-based diffusion](@ml/score-sde), $dX = -\tfrac12\beta(t)X\,dt + \sqrt{\beta(t)}\,dW$, is an OU process with a time-varying rate. Its exact transition law is why you can jump straight to any noise level $t$ in training without simulating the path.
- **Biology and neuroscience.** Subthreshold membrane potential driven by synaptic bombardment, and population sizes fluctuating around a carrying capacity, are both modelled as OU to first order.`,
    },
    {
      kind: 'multi',
      prompt: 'Which statements about the OU process are correct?',
      choices: [
        String.raw`$X_t$ is exactly normally distributed at every $t$, for any starting point`,
        String.raw`Its stationary distribution is $\mathcal N(0, \sigma^2/2\theta)$`,
        String.raw`Its autocorrelation decays exponentially with time constant $1/\theta$`,
        String.raw`Sampling it on a uniform grid gives an AR(1) series`,
        String.raw`Its variance grows linearly in $t$ forever`,
      ],
      answers: [0, 1, 2, 3],
      why: String.raw`Linear drift plus additive noise keeps everything Gaussian, with stationary law $\mathcal N(0,\sigma^2/2\theta)$, exponential memory of time constant $1/\theta$, and an exact AR(1) sampling rule. Linear growth of the variance forever is the behaviour of *Brownian motion*; OU's variance saturates at $\sigma^2/2\theta$, which is the point of the restoring drift.`,
    },
    {
      kind: 'match',
      prompt: 'Match each quantity to the formula that gives it.',
      pairs: [
        ['Mean at time t from x₀', String.raw`$x_0e^{-\theta t}$`],
        ['Variance at time t from x₀', String.raw`$\dfrac{\sigma^2}{2\theta}\big(1-e^{-2\theta t}\big)$`],
        ['Half-life of a displacement', String.raw`$\ln 2/\theta$`],
        ['Correlation at lag τ in equilibrium', String.raw`$e^{-\theta|\tau|}$`],
        ['Power spectrum', String.raw`$\sigma^2/(\theta^2+\omega^2)$, a Lorentzian`],
      ],
      why: String.raw`The mean follows the noiseless ODE, so it decays as a plain exponential at rate $\theta$; the variance relaxes at rate $2\theta$ because variances involve squares. The half-life solves $e^{-\theta t} = \tfrac12$, and the Lorentzian spectrum is the Fourier transform of the exponential autocorrelation.`,
    },
    {
      kind: 'explain',
      title: 'Key takeaways',
      body: String.raw`- $dX = \theta(m - X)dt + \sigma\,dW$: the simplest SDE with both noise and a memory of where it should be.
- **Exact solution** by integrating factor: $X_t = x_0e^{-\theta t} + \sigma\int_0^t e^{-\theta(t-s)}dW_s$ — decay of the past plus an exponentially weighted sum of kicks. No Itô correction appears, because the transformation is linear.
- $X_t\sim\mathcal N\big(x_0e^{-\theta t},\ \tfrac{\sigma^2}{2\theta}(1-e^{-2\theta t})\big)$, converging to the **stationary** $\mathcal N(0,\sigma^2/2\theta) \propto e^{-2U/\sigma^2}$ with $U = \tfrac12\theta x^2$.
- **Memory**: correlation $e^{-\theta|\tau|}$, correlation time $1/\theta$, Lorentzian spectrum $\sigma^2/(\theta^2+\omega^2)$.
- **Exactly simulable** as AR(1) with $\phi = e^{-\theta\Delta t}$ — the standard reference solution for testing SDE solvers.
- It is the Gaussian special case of Langevin sampling, the velocity of a Brownian particle (where fluctuation–dissipation fixes $\sigma$ from the friction and temperature), the Vasicek interest rate, and the forward process of VP diffusion models.

Next: run a diffusion **backwards** in time and watch a score term appear — [reverse-time SDEs](@math/time-reversal-sde).`,
    },
  ],
  references: [
    { authors: 'G. E. Uhlenbeck, L. S. Ornstein', title: 'On the theory of the Brownian motion', year: 1930, venue: 'Physical Review 36, 823–841' },
    { authors: 'C. Gardiner', title: 'Stochastic Methods: A Handbook for the Natural and Social Sciences', year: 2009, venue: '4th ed., Springer', detail: 'Sec. 3.8.4 (the Ornstein–Uhlenbeck process) and Ch. 4 (linear SDEs)' },
    { authors: 'B. Øksendal', title: 'Stochastic Differential Equations: An Introduction with Applications', year: 2003, venue: '6th ed., Springer', detail: 'Ch. 5 (linear SDEs solved by integrating factors)' },
    { authors: 'O. Vasicek', title: 'An equilibrium characterization of the term structure', year: 1977, venue: 'Journal of Financial Economics 5(2), 177–188' },
    { authors: 'Y. Song, J. Sohl-Dickstein, D. P. Kingma, A. Kumar, S. Ermon, B. Poole', title: 'Score-based generative modeling through stochastic differential equations', year: 2021, venue: 'ICLR 2021', detail: 'The variance-preserving SDE is a time-rescaled Ornstein–Uhlenbeck process', url: 'https://arxiv.org/abs/2011.13456' },
  ],
} satisfies LessonContent;
