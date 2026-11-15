import type { LessonContent } from '../../types';

export default {
  cards: [
    {
      kind: 'explain',
      title: 'Almost every SDE must be simulated',
      body: String.raw`Closed-form solutions exist for a handful of SDEs — linear ones, geometric Brownian motion, Ornstein–Uhlenbeck. Everything else, from a neuron model to an interest-rate curve to the reverse-time process inside a diffusion model, is studied by **simulating paths**.

That raises a question with a genuinely surprising answer: *how wrong is a simulated path?* Transplanting the error theory you know for ODEs gives the wrong answer here — not off by a constant, but off in the **exponent**. This lesson explains why, fixes it, and shows how to measure a solver's accuracy yourself.`,
    },
    {
      kind: 'recall',
      title: 'Euler–Maruyama',
      points: [
        String.raw`$X_{n+1} = X_n + \mu(X_n,t_n)\Delta t + \sigma(X_n,t_n)\,\Delta W_n$ with $\Delta W_n = \sqrt{\Delta t}\,Z_n$, $Z_n\sim\mathcal N(0,1)$ independent.`,
        String.raw`The $\sqrt{\Delta t}$ is forced: $\operatorname{Var}(\Delta W) = \Delta t$.`,
        'One run gives one path; statistics come from averaging many runs.',
        'With σ = 0 it reduces exactly to Euler’s method for an ODE.',
      ],
      link: 'math/sde-intro',
    },
    {
      kind: 'explain',
      title: 'Why the usual ODE error analysis fails',
      body: String.raw`[Euler's method](@math/numerical-ode) is analysed by Taylor expansion: $y(t+\Delta t) = y + y'\Delta t + \tfrac12 y''\Delta t^2+\cdots$, so one step is wrong by $O(\Delta t^2)$ and $T/\Delta t$ steps accumulate to $O(\Delta t)$ — first order. Two ingredients make that work: the solution is differentiable, and the errors line up in powers of $\Delta t$.

Both fail here. The solution path has **no derivative anywhere**, so there is no Taylor series in $\Delta t$. The honest expansion — the **Itô–Taylor** expansion — is a series in iterated stochastic integrals, and its natural unit of size is $\sqrt{\Delta t}$, because $\Delta W \sim \sqrt{\Delta t}$. Terms you would discard as "second order" in an ODE sit at order $\Delta t$ here, which is only *half* an order below the leading noise term.

Halving $\Delta t$ in an ODE solver is a factor-of-two win. In an SDE solver it may be a factor of $\sqrt2$.`,
    },
    {
      kind: 'widget',
      title: 'What order looks like for an ODE',
      body: String.raw`The baseline to keep in mind. For the deterministic $y' = y$, the right-hand log–log plot of global error against step size $h$ has clean slopes 1 (Euler), 2 (Heun) and 4 (RK4) — straight lines over many decades, with no averaging and no randomness. Every SDE plot later in this lesson is a noisy, shallower version of this one.`,
      widget: { type: 'MathOdeSolvers', props: { mode: 'order', f: 'y', exact: 'exp(x)', logN: 3 } },
    },
    {
      kind: 'mcq',
      prompt: String.raw`What is the central obstacle to reusing the ODE Taylor-series error analysis for SDEs?`,
      choices: [
        String.raw`Increments scale like $\sqrt{\Delta t}$, so there is no expansion in whole powers of $\Delta t$`,
        String.raw`Random number generators are not accurate enough`,
        String.raw`SDE solutions are discontinuous, so Taylor's theorem does not apply`,
        String.raw`The drift $\mu$ is usually not Lipschitz`,
      ],
      answer: 0,
      why: String.raw`Brownian increments are of size $\sqrt{\Delta t}$ and the path is nowhere differentiable, so the expansion must be in iterated stochastic integrals with half-integer orders. Solutions of SDEs are continuous, not discontinuous; the drift is normally assumed Lipschitz; and the quality of the random numbers is a separate (minor) concern.`,
    },
    {
      kind: 'explain',
      title: 'Two different questions, two different errors',
      body: String.raw`"How accurate is the solver?" hides two questions.

**Strong (pathwise) error** — *does my simulated path track the true path?*
$$e_{\text{strong}}(\Delta t) = \mathbb E\big|X_T - X_T^{\Delta t}\big|,$$
where both are driven by **the same** Brownian motion. A method has **strong order $p$** if $e_{\text{strong}} \le C\,\Delta t^{p}$. This is the one you need when the path itself is the object: a specific noise realisation, a sensitivity, a pathwise optimisation.

**Weak error** — *do my statistics come out right?*
$$e_{\text{weak}}(\Delta t) = \big|\mathbb E\,g(X_T) - \mathbb E\,g(X_T^{\Delta t})\big|$$
for smooth test functions $g$ (take $g(x)=x$, $x^2$, …). **Weak order $q$** means $e_{\text{weak}}\le C\,\Delta t^{q}$. This is the one you need for option prices, expectations, densities and histograms — most of applied practice.

**Euler–Maruyama has strong order $\tfrac12$ and weak order $1$.**`,
    },
    {
      kind: 'explain',
      title: 'Where the ½ comes from',
      body: String.raw`Expand one Euler–Maruyama step against the truth. The largest term the scheme omits is
$$\tfrac12\,\sigma\sigma'\big((\Delta W)^2 - \Delta t\big),$$
of size $O(\Delta t)$ — far bigger than an ODE's $O(\Delta t^2)$ local error. But it has **mean zero**, so over $N = T/\Delta t$ steps these errors do not add up; they add in *quadrature*:
$$\text{total} \sim \sqrt N \cdot O(\Delta t) = \sqrt{T/\Delta t}\cdot \Delta t = O(\sqrt{\Delta t}).$$
Strong order $\tfrac12$. For the **weak** error those same mean-zero terms cancel in the expectation entirely, leaving only the genuinely biased terms of size $O(\Delta t^2)$ per step, i.e. $O(\Delta t)$ overall — weak order 1. Same scheme, same noise; different question, different exponent.`,
    },
    {
      kind: 'numeric',
      prompt: String.raw`Euler–Maruyama has strong order $\tfrac12$. By what factor must you shrink $\Delta t$ to divide the strong error by 10?`,
      answer: 100,
      tolerance: 0.5,
      why: String.raw`Error $\propto \Delta t^{1/2}$, so dividing the error by 10 needs $\Delta t$ divided by $10^2 = 100$ — and therefore 100 times the work. Answering 10 would be right for a first-order method; the half-order is exactly what makes pathwise accuracy expensive.`,
    },
    {
      kind: 'explain',
      title: 'Milstein: add back the missing term',
      body: String.raw`If the omitted term is $\tfrac12\sigma\sigma'((\Delta W)^2 - \Delta t)$, then put it in. The **Milstein scheme** (1974) is
$$X_{n+1} = X_n + \mu\,\Delta t + \sigma\,\Delta W_n + \tfrac12\,\sigma\,\sigma'\big((\Delta W_n)^2 - \Delta t\big),$$
with $\mu,\sigma,\sigma'$ evaluated at $(X_n, t_n)$ and $\sigma' = \partial\sigma/\partial x$. It needs **no extra random numbers** — only the same $\Delta W_n$, squared — and reaches **strong order 1**, with weak order still 1.

Two caveats worth knowing. If $\sigma$ does not depend on $x$ then $\sigma' = 0$: Milstein *is* Euler–Maruyama, and Euler–Maruyama already has strong order 1 for additive noise. And in several dimensions with non-commuting noise, the analogous correction involves iterated integrals $\int\!\!\int dW^i\,dW^j$ (Lévy areas) that cannot be sampled from the increments alone — which is why high-order strong schemes are rare in practice.`,
    },
    {
      kind: 'fill',
      prompt: String.raw`The Milstein scheme adds the term $\tfrac12\sigma\sigma'\big(($___$)^2 - $___$\big)$ to Euler–Maruyama, lifting the ___ order from ½ to 1.`,
      bank: [String.raw`$\Delta W$`, String.raw`$\Delta t$`, String.raw`$\sqrt{\Delta t}$`, 'strong', 'weak'],
      answer: [String.raw`$\Delta W$`, String.raw`$\Delta t$`, 'strong'],
      why: String.raw`The correction is $(\Delta W)^2 - \Delta t$, which has mean zero because $\mathbb E[(\Delta W)^2] = \Delta t$ — that subtraction is what keeps the scheme unbiased. It fixes the pathwise (strong) error; the weak order was already 1 and stays there.`,
    },
    {
      kind: 'truefalse',
      prompt: String.raw`For additive noise, $dX = \mu(X)\,dt + \sigma\,dW$ with $\sigma$ a constant, the Milstein scheme is identical to Euler–Maruyama.`,
      answer: true,
      why: String.raw`The Milstein correction carries a factor $\sigma' = d\sigma/dx$, which is zero for constant $\sigma$, so the two schemes coincide step for step. Consistently, Euler–Maruyama already achieves strong order 1 in the additive-noise case — the half-order penalty is caused by *state-dependent* noise.`,
    },
    {
      kind: 'widget',
      title: 'Measuring the orders',
      body: String.raw`Geometric Brownian motion, where the exact solution is known, so errors are real errors. Every path is generated once on a fine grid and the coarse grids **sum the same increments**, so solver and truth share a Brownian path. Fitted slopes sit near $0.5$ for Euler–Maruyama and $1.0$ for Milstein. Press **Weak** to switch to $|\mathbb E X_T - \mathbb E X_T^{\Delta}|$, estimated from the same paths for both means: the slope becomes 1 — until the curve meets the dashed Monte-Carlo noise level (two standard errors) and the measurement stops meaning anything. Raise the path count to push that level down.`,
      widget: { type: 'MathSdeConvergence', props: { mode: 'strong', mu: 1, sigma: 0.5, M: 600 } },
    },
    {
      kind: 'explain',
      title: 'How to test a stochastic solver, properly',
      body: String.raw`A recipe you can run on any scheme:

1. Pick a test SDE with a **known exact solution** (geometric Brownian motion or Ornstein–Uhlenbeck).
2. Draw $M$ paths of Brownian increments on a **fine** grid of $2^{K}$ steps.
3. For each coarse level $\Delta t = 2^{-j}T$, **sum blocks** of the fine increments. Never redraw them — solver and truth must share one Brownian path, or the strong error is meaningless.
4. Average $|X_T - X_T^{\Delta t}|$ over the $M$ paths; plot it against $\Delta t$ on log–log axes; fit the slope.
5. Sanity-check the statistics: your estimate has Monte-Carlo error about $\text{sd}/\sqrt M$. Report it, and never read a slope from points buried in it.
6. For weak order, replace step 4 with $|\overline{g(X_T)} - \mathbb E g(X_T)|$ and expect to need many more paths — the quantity you are measuring is now a *difference of averages*, so the noise does not cancel.

Higham (2001) gives this test as short, complete MATLAB programs and is the standard starting point.`,
    },
    {
      kind: 'multi',
      prompt: 'Which of these are necessary for a valid *strong* convergence test?',
      choices: [
        'Drive the coarse and the exact solution with the same Brownian path',
        'Build coarse increments by summing blocks of fine increments',
        'Use an SDE whose exact solution is known (or a reference solution on a much finer grid)',
        'Report or bound the Monte-Carlo error of the average',
        'Draw fresh random numbers independently at each step size',
      ],
      answers: [0, 1, 2, 3],
      why: String.raw`Strong error compares *paths*, so the comparison is only meaningful when both are driven by one Brownian motion — which is exactly what summing blocks of fine increments achieves. You also need something to compare against, and an error bar on the Monte-Carlo average. Redrawing fresh noise at each step size destroys the pairing: you would then be measuring the spread of the solution itself, roughly constant in $\Delta t$, and would see slope 0.`,
    },
    {
      kind: 'explain',
      title: 'Where solvers go wrong in practice',
      body: String.raw`- **Non-Lipschitz coefficients.** The order theorems assume globally Lipschitz $\mu,\sigma$. For superlinear drifts such as $dX = -X^3dt + dW$, Hutzenthaler, Jentzen and Kloeden (2011) proved that explicit Euler–Maruyama diverges — its absolute moments blow up as $\Delta t\to0$. **Tamed** or implicit variants fix this.
- **Positivity.** Euler–Maruyama applied to geometric Brownian motion or to $dv = \kappa(\theta - v)dt + \xi\sqrt v\,dW$ can step to a negative value that the true solution never visits. Simulate $\log S$ instead, or use a scheme designed for the square root.
- **Stiffness.** A fast-decaying drift bounds the stable step size exactly as it does for ODEs; implicit treatment of the drift (with explicit noise) is the usual remedy.
- **Reusing noise.** When comparing two models or differentiating a parameter, use **common random numbers**: fix the increments and vary only the parameter. The difference of averages then has far smaller variance.`,
    },
    {
      kind: 'match',
      prompt: 'Match each scheme or setting to its strong order.',
      pairs: [
        ['Euler–Maruyama, state-dependent noise σ(x)', 'Strong order ½'],
        ['Euler–Maruyama, additive noise σ constant', 'Strong order 1, because the correction term is zero'],
        ['Milstein, state-dependent noise', 'Strong order 1, with the correction term added back'],
        ['Euler’s method on an ODE (no noise)', 'Order 1, errors adding linearly rather than in quadrature'],
      ],
      why: String.raw`The half-order penalty comes from the term $\tfrac12\sigma\sigma'((\Delta W)^2-\Delta t)$, which vanishes when $\sigma$ is constant and is added back by Milstein — so both of those cases recover order 1. The ODE case is the familiar first-order one, but its local errors accumulate additively instead of in quadrature.`,
    },
    {
      kind: 'explain',
      title: 'Key takeaways',
      body: String.raw`- There is no Taylor series in $\Delta t$ for an SDE solution; the Itô–Taylor expansion moves in half-powers because $\Delta W\sim\sqrt{\Delta t}$.
- **Strong error** compares paths under the *same* noise; **weak error** compares statistics. They have different orders.
- **Euler–Maruyama**: strong order $\tfrac12$, weak order $1$. Cutting the pathwise error by 10 costs 100× the steps.
- **Milstein** adds $\tfrac12\sigma\sigma'((\Delta W)^2-\Delta t)$, needs no new random numbers, and gives strong order 1. It reduces to Euler–Maruyama for additive noise.
- **To test a solver:** known exact solution, one fine Brownian path per sample, coarse increments summed from it, log–log slope, and an honest Monte-Carlo error bar.
- Order theorems assume Lipschitz coefficients; superlinear drifts can make explicit Euler–Maruyama diverge outright.

Next: an SDE where everything can be computed by hand — the [Ornstein–Uhlenbeck process](@math/ornstein-uhlenbeck).`,
    },
  ],
  references: [
    { authors: 'D. J. Higham', title: 'An algorithmic introduction to numerical simulation of stochastic differential equations', year: 2001, venue: 'SIAM Review 43(3), 525–546', detail: 'Strong and weak convergence experiments with complete code' },
    { authors: 'P. E. Kloeden, E. Platen', title: 'Numerical Solution of Stochastic Differential Equations', year: 1992, venue: 'Springer', detail: 'Ch. 5 (stochastic Taylor expansions) and the chapters on strong and weak Taylor approximations' },
    { authors: 'G. N. Milstein', title: 'Approximate integration of stochastic differential equations', year: 1974, venue: 'Theory of Probability and its Applications 19(3), 557–562' },
    { authors: 'M. Hutzenthaler, A. Jentzen, P. E. Kloeden', title: 'Strong and weak divergence in finite time of Euler’s method for stochastic differential equations with non-globally Lipschitz continuous coefficients', year: 2011, venue: 'Proceedings of the Royal Society A 467, 1563–1576' },
    { authors: 'M. Hutzenthaler, A. Jentzen, P. E. Kloeden', title: 'Strong convergence of an explicit numerical method for SDEs with non-globally Lipschitz continuous coefficients', year: 2012, venue: 'Annals of Applied Probability 22(4), 1611–1641', detail: 'The tamed Euler scheme' },
  ],
} satisfies LessonContent;
