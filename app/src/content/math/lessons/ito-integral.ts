import type { LessonContent } from '../../types';

export default {
  cards: [
    {
      kind: 'explain',
      title: 'The integral we want, and cannot have',
      body: String.raw`We want to add up random kicks weighted by a changing strategy:
$$\int_0^T H_t\,dW_t \ \ \stackrel{?}{=}\ \ \lim \sum_i H_{\tau_i}\big(W_{t_{i+1}} - W_{t_i}\big),$$
where $H_t$ might be the number of shares you hold, the noise amplitude of an SDE, or the gain of a filter, and $\tau_i$ is some chosen point in $[t_i, t_{i+1}]$.

Every classical integral is built from sums like this, so it looks routine. It is not. [Brownian paths have infinite length](@math/brownian-motion), and that single fact wrecks the classical construction — and makes the *choice of $\tau_i$* matter.`,
    },
    {
      kind: 'recall',
      title: 'The two variations of a Brownian path',
      points: [
        String.raw`**Quadratic variation:** $\sum_i (\Delta W_i)^2 \to t$ — non-random, and the same for almost every path.`,
        String.raw`**Total variation:** $\sum_i |\Delta W_i| \to \infty$ on every interval, however short.`,
        String.raw`For a smooth $f$, those are the other way round: $\sum(\Delta f)^2 \to 0$ and $\sum|\Delta f| < \infty$.`,
        String.raw`Increments scale like $\sqrt{\Delta t}$, not $\Delta t$ — the root of both facts.`,
      ],
      link: 'math/brownian-motion',
    },
    {
      kind: 'explain',
      title: 'Why Riemann–Stieltjes fails',
      body: String.raw`The classical generalisation of $\int f\,dx$ to a non-uniform "clock" $g$ is the **Riemann–Stieltjes** integral $\int_a^b f\,dg = \lim\sum f(\tau_i)\,(g(t_{i+1}) - g(t_i))$.

Its existence rests on $g$ having **bounded variation**: $\sum|\Delta g|\le V<\infty$. Then changing the tag point $\tau_i$ changes the sum by at most $(\max_i \operatorname{osc} f)\cdot V \to 0$, so all tag choices give the same limit. This is not a technicality. A standard consequence of the uniform boundedness (Banach–Steinhaus) theorem and the Riesz representation of the dual of $C[a,b]$ is that if the Riemann–Stieltjes sums against $g$ converge for **every** continuous $f$, then $g$ must have bounded variation (see Protter, *Stochastic Integration and Differential Equations*, the introduction to Ch. II). So if $g$ has unbounded variation, some continuous $f$ has sums that do **not** converge.

Brownian motion has unbounded variation on every interval. So "$\int H\,dW$, pathwise, in the Riemann–Stieltjes sense" does not exist. We are not being fussy; the limit genuinely is not there.`,
    },
    {
      kind: 'widget',
      title: 'How it works when the integrator is nice',
      body: String.raw`For the ordinary Riemann integral of a smooth $f$, the gap between the largest and smallest possible tagged sums (the orange leftover area) shrinks to zero as the mesh refines — which is exactly why nobody ever asks you *where* in each subinterval to evaluate $f$. Hold on to this picture: in the next widget the same gap refuses to close.`,
      widget: { type: 'MathRiemannSums', props: { fn: 'x^2', a: 0, b: 1, n: 4, exact: 0.3333333 } },
    },
    {
      kind: 'mcq',
      prompt: String.raw`Why can't $\int_0^T H\,dW$ be defined path-by-path as a Riemann–Stieltjes integral?`,
      choices: [
        String.raw`Brownian paths have unbounded variation, so tagged sums need not converge`,
        String.raw`Brownian paths are not continuous`,
        String.raw`$W_t$ can be negative, and Stieltjes integrators must be increasing`,
        String.raw`The integrand $H$ is random`,
      ],
      answer: 0,
      why: String.raw`Riemann–Stieltjes integration needs the integrator to have finite total variation; Brownian motion's is infinite on every interval, so different tag points give different limits (or none). Brownian paths *are* continuous, Stieltjes integrators need not be increasing (differences of increasing functions are fine), and randomness of $H$ is not itself an obstacle — the integral is built one path at a time in the classical theory.`,
    },
    {
      kind: 'explain',
      title: 'The tag point now changes the answer',
      body: String.raw`Take $H_t = W_t$ and compute the sums with three tag choices. Using the algebraic identity $b(b-a) = \tfrac12(b^2-a^2) + \tfrac12(b-a)^2$ and its mirror image, the sums telescope into

- **left** $\tau_i = t_i$: $\ \sum W_{t_i}\Delta W_i = \tfrac12 W_T^2 - \tfrac12\sum(\Delta W_i)^2 \to \tfrac12(W_T^2 - T)$,
- **endpoint average** $\tfrac12(W_{t_i}+W_{t_{i+1}})$: $\ \to \tfrac12 W_T^2$,
- **right** $\tau_i = t_{i+1}$: $\ \to \tfrac12(W_T^2 + T)$.

Three different answers; the left and right versions differ by exactly the quadratic variation $T$, with the average halfway between. In a classical integral this gap would vanish; here it is the whole point. So "the" integral does not exist — **a convention must be chosen**, and the choice has consequences.`,
    },
    {
      kind: 'widget',
      title: 'The gap that never closes',
      body: String.raw`The same Brownian path on grids of $N = 2^k$ intervals, with Riemann sums for $\int_0^t W\,dW$. Blue uses the **left** point and converges to $\tfrac12(W_t^2 - t)$ (dashed). Orange uses the **endpoint average** and equals $\tfrac12W_t^2$ (dotted) on every single grid. Refine as far as you like: the two never meet, because their difference is $\tfrac12\sum(\Delta W)^2 \to t/2$.`,
      widget: { type: 'MathQuadraticVariation', props: { mode: 'integral', logN: 5 } },
    },
    {
      kind: 'explain',
      title: 'Itô’s choice: always look left',
      body: String.raw`Itô (1944) fixes $\tau_i = t_i$, the **left** endpoint, and requires the integrand to be **adapted** (also called non-anticipating): $H_t$ may depend on everything known by time $t$, but not on the future.

The financial reading makes the choice feel inevitable: $H_{t_i}$ is the position you hold *going into* the interval, and $\Delta W_i$ is the price move you then experience. You must commit before you see the move. Any other tag point lets the strategy peek at the increment it is about to be paid for.

The mathematical payoff is the same statement in disguise: $H_{t_i}$ is **independent of** $\Delta W_i$, which hands us two properties that the midpoint rule cannot have.`,
    },
    {
      kind: 'explain',
      title: 'What left-endpoint buys: a martingale and an isometry',
      body: String.raw`With $H$ adapted and $\mathbb E\int_0^T H_t^2\,dt<\infty$:

**Zero mean / martingale.** $\mathbb E[H_{t_i}\Delta W_i] = \mathbb E[H_{t_i}]\,\mathbb E[\Delta W_i] = 0$ by independence, so
$$\mathbb E\Big[\int_0^T H\,dW\Big] = 0,\qquad M_t = \int_0^t H\,dW \ \text{is a martingale}.$$
**Itô isometry.** Cross terms $\mathbb E[H_{t_i}\Delta W_i H_{t_j}\Delta W_j]$ with $i<j$ vanish for the same reason, and the diagonal gives $\mathbb E[H_{t_i}^2]\Delta t$:
$$\mathbb E\Big[\Big(\int_0^T H_t\,dW_t\Big)^2\Big] = \mathbb E\Big[\int_0^T H_t^2\,dt\Big].$$
A hard stochastic object becomes an ordinary integral. These two identities are the entire working toolkit.`,
    },
    {
      kind: 'widget',
      title: 'Building the integral properly',
      widget: {
        type: 'StepReveal',
        props: {
          steps: [
            String.raw`**Step 1 — simple integrands.** Let $H_t = \sum_{i} h_i\,\mathbf 1_{(t_i,\,t_{i+1}]}(t)$ be piecewise constant, with $h_i$ known at time $t_i$. *Define* $\int_0^T H\,dW = \sum_i h_i(W_{t_{i+1}} - W_{t_i})$. No limit, no controversy.`,
            String.raw`**Step 2 — the isometry, on simple integrands.** Expanding the square and killing cross terms gives $\mathbb E[(\sum h_i\Delta W_i)^2] = \sum\mathbb E[h_i^2]\Delta t_i = \mathbb E\int_0^T H^2\,dt$.`,
            String.raw`**Step 3 — read it as a distance.** The map $H\mapsto\int H\,dW$ preserves length: it sends the space $L^2(dt\times d\mathbb P)$ of integrands isometrically into the space $L^2(d\mathbb P)$ of random variables.`,
            String.raw`**Step 4 — approximate.** Every adapted $H$ with $\mathbb E\int_0^T H^2dt<\infty$ is an $L^2$-limit of simple integrands $H^{(n)}$.`,
            String.raw`**Step 5 — pass to the limit.** By the isometry, $\mathbb E[(\int H^{(n)}dW - \int H^{(m)}dW)^2] = \mathbb E\int (H^{(n)}-H^{(m)})^2dt \to 0$, so the integrals form a Cauchy sequence. *Define* $\int H\,dW$ as its limit.`,
            String.raw`**Step 6 — inherit the properties.** Mean zero, the isometry and the martingale property survive the limit, because $L^2$ convergence preserves them.`,
          ],
          notes: [
            'Adaptedness is built in: hᵢ is chosen before the increment happens.',
            'This is where left-endpoint evaluation is used; the midpoint rule breaks the cross-term argument.',
            'Isometry = "distance-preserving map".',
            'Completeness of L² is doing the real work here.',
            'Cauchy + complete space ⇒ a limit exists. This is why we needed the isometry first.',
            'Nothing here used a pathwise limit — the integral is defined in mean square.',
          ],
        },
      },
    },
    {
      kind: 'numeric',
      prompt: String.raw`Use the Itô isometry to compute $\operatorname{Var}\!\Big(\int_0^2 W_t\,dW_t\Big)$.`,
      answer: 2,
      tolerance: 0.01,
      why: String.raw`The mean is 0, so the variance is $\mathbb E\int_0^2 W_t^2\,dt = \int_0^2 t\,dt = 2$. Check it directly: the integral equals $\tfrac12(W_2^2-2)$, and with $\mathbb E[W_2^4] = 3\cdot2^2 = 12$ the variance is $(12 - 8 + 4)/4 = 2$.`,
    },
    {
      kind: 'multi',
      prompt: String.raw`Which integrands $H$ are legitimate for the Itô integral $\int_0^1 H_t\,dW_t$?`,
      choices: [
        String.raw`$H_t = W_t$`,
        String.raw`$H_t = \sin(t)$`,
        String.raw`$H_t = \max_{s\le t} W_s$`,
        String.raw`$H_t = W_1$ (the terminal value, for every $t$)`,
        String.raw`$H_t = \mathbf 1\{W_1 > 0\}$`,
      ],
      answers: [0, 1, 2],
      why: String.raw`Legitimate integrands are adapted — determined by information available at time $t$ — and square-integrable. The current value, a deterministic function of time, and the running maximum all qualify. Using the terminal value $W_1$ at earlier times, or an indicator of its sign, means the strategy knows the future; such integrands break the independence of $H_{t_i}$ from $\Delta W_i$ and with it the martingale property.`,
    },
    {
      kind: 'explain',
      title: 'Itô vs Stratonovich, plainly',
      body: String.raw`Choosing the endpoint **average** instead gives the **Stratonovich** integral, written $\int H\circ dW$. The two are different objects, both perfectly rigorous:

- **Tag point:** Itô takes the left endpoint; Stratonovich the average of the endpoints.
- **Mean:** Itô has mean zero and is a martingale; Stratonovich generally has neither.
- **Chain rule:** Itô needs the $\tfrac12\sigma^2 f''$ correction; Stratonovich uses the ordinary one.
- **Peeking:** Itô's integrand cannot see the increment it multiplies; Stratonovich's half can.

They are two coordinates for the same process: the Itô SDE $dX = \mu\,dt + \sigma(X)\,dW$ describes the same $X$ as the Stratonovich SDE $dX = \big(\mu - \tfrac12\sigma\sigma'\big)dt + \sigma(X)\circ dW$. When $\sigma$ is constant, $\sigma' = 0$ and they coincide.

**Use Itô** for finance, filtering, and anything where "no peeking" and zero mean matter — and because Euler–Maruyama converges to it. **Use Stratonovich** when the noise is an idealisation of a real signal with a short correlation time (the Wong–Zakai theorem) or when you want ordinary calculus, e.g. on manifolds.`,
    },
    {
      kind: 'truefalse',
      prompt: String.raw`For a *deterministic* integrand such as $H_t = t^2$, the Itô and Stratonovich integrals $\int_0^1 H\,dW$ and $\int_0^1 H\circ dW$ are equal.`,
      answer: true,
      why: String.raw`The two differ by a term built from how the integrand co-varies with $W$; a deterministic $H$ does not move with the noise at all, so the difference is zero. Concretely, $\sum (H(\tau_i) - H(t_i))\Delta W_i$ has mean 0 and variance of order $\Delta t\to 0$. The integrals differ only when $H$ itself is driven by the same Brownian motion, as for $H = W$.`,
    },
    {
      kind: 'match',
      prompt: 'Match each limit to the tag rule that produces it, for Riemann sums of ∫₀ᵀ W dW.',
      pairs: [
        [String.raw`Left endpoint $W_{t_i}$`, String.raw`$\tfrac12(W_T^2 - T)$, mean 0`],
        [String.raw`Endpoint average $\tfrac12(W_{t_i}+W_{t_{i+1}})$`, String.raw`$\tfrac12 W_T^2$, mean $T/2$`],
        [String.raw`Right endpoint $W_{t_{i+1}}$`, String.raw`$\tfrac12(W_T^2 + T)$, mean $T$`],
        [String.raw`Any tag point, with a smooth integrator $g$ of bounded variation`, 'All give the same classical answer'],
      ],
      why: String.raw`The left and right limits differ by the quadratic variation $T$, and the endpoint average sits halfway; the tag point decides how much of $\tfrac12\sum(\Delta W)^2\to T/2$ is added to the left-point sum. Only the left-endpoint version has mean zero, because only then is the integrand independent of the increment it multiplies. With a bounded-variation integrator the whole ambiguity disappears.`,
    },
    {
      kind: 'fill',
      prompt: String.raw`The Itô integral evaluates the integrand at the ___ endpoint of each interval, which makes it a ___ with mean zero; the Stratonovich integral uses the ___ of the endpoints and obeys the ordinary chain rule.`,
      bank: ['left', 'right', 'average', 'martingale', 'density', 'midpoint'],
      answer: ['left', 'martingale', 'average'],
      why: String.raw`Left-endpoint evaluation makes $H_{t_i}$ independent of $\Delta W_i$, so every term has mean zero and the running integral is a martingale. Averaging the endpoints restores the ordinary chain rule at the cost of that zero-mean property.`,
    },
    {
      kind: 'explain',
      title: 'Key takeaways',
      body: String.raw`- Brownian motion has **unbounded variation**, so $\int H\,dW$ cannot be a pathwise Riemann–Stieltjes integral: the tag point changes the answer.
- For $\int_0^T W\,dW$ the left, average and right tags give $\tfrac12(W_T^2 - T)$, $\tfrac12W_T^2$, $\tfrac12(W_T^2+T)$ — spaced by $T/2$, so the extremes differ by the quadratic variation $T$.
- **Itô's convention**: left endpoint, **adapted** integrands. The integrand cannot see the increment it multiplies.
- That buys **mean zero / the martingale property** and the **Itô isometry** $\mathbb E[(\int H\,dW)^2] = \mathbb E\int H^2dt$.
- The integral is built in three moves: define it on simple integrands, prove the isometry, extend by mean-square limits.
- **Stratonovich** (endpoint average) keeps the ordinary chain rule but loses mean zero; convert by shifting the drift by $-\tfrac12\sigma\sigma'$.

Next: equations driven by this integral — [stochastic differential equations](@math/sde-intro).`,
    },
  ],
  references: [
    { authors: 'P. E. Protter', title: 'Stochastic Integration and Differential Equations', year: 2004, venue: '2nd ed., Springer', detail: 'Introduction to Ch. II: the integrator must have finite variation for pathwise Riemann–Stieltjes integrals of all continuous integrands' },
    { authors: 'K. Itô', title: 'Stochastic integral', year: 1944, venue: 'Proceedings of the Imperial Academy (Tokyo) 20, 519–524' },
    { authors: 'B. Øksendal', title: 'Stochastic Differential Equations: An Introduction with Applications', year: 2003, venue: '6th ed., Springer', detail: 'Ch. 3 (construction of the Itô integral, the isometry, Itô vs Stratonovich)' },
    { authors: 'I. Karatzas, S. Shreve', title: 'Brownian Motion and Stochastic Calculus', year: 1991, venue: '2nd ed., Springer', detail: 'Ch. 3.2 (stochastic integration with respect to continuous martingales)' },
    { authors: 'E. Wong, M. Zakai', title: 'On the convergence of ordinary integrals to stochastic integrals', year: 1965, venue: 'Annals of Mathematical Statistics 36(5), 1560–1564' },
    { authors: 'D. J. Higham', title: 'An algorithmic introduction to numerical simulation of stochastic differential equations', year: 2001, venue: 'SIAM Review 43(3), 525–546', detail: 'Numerical computation of Itô and Stratonovich integrals' },
  ],
} satisfies LessonContent;
