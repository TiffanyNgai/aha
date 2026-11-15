import type { LessonContent } from '../../types';

export default {
  cards: [
    {
      kind: 'explain',
      title: 'A coin flip every second, then every millisecond',
      body: String.raw`Stand on a number line. Every second, flip a coin: heads step $+1$, tails step $-1$. After $N$ flips you are at
$$S_N = \xi_1 + \xi_2 + \cdots + \xi_N,\qquad \xi_i = \pm 1 \text{ with probability } \tfrac12 \text{ each}.$$
That is the **simple random walk** — a jerky, discrete thing.

Now speed it up. Flip every millisecond, every microsecond, taking smaller steps each time. Does the staircase settle down into a *curve*? Astonishingly, yes — provided you shrink the steps at exactly the right rate. The object you get is **Brownian motion**, and this lesson builds it.`,
    },
    {
      kind: 'explain',
      title: 'How far does a random walk get?',
      body: String.raw`The steps $\xi_i$ are independent with mean $0$ and variance $1$. So
$$\mathbb E[S_N] = 0,\qquad \operatorname{Var}(S_N) = \operatorname{Var}(\xi_1) + \cdots + \operatorname{Var}(\xi_N) = N,$$
using that variances of **independent** things add. The typical distance from the origin is therefore
$$\text{sd}(S_N) = \sqrt N,$$
not $N$. A million coin flips leaves you about a thousand steps from home, not a million: the kicks largely cancel.

This single fact — spread grows like $\sqrt{\text{time}}$ — is the seed of everything that follows.`,
    },
    {
      kind: 'numeric',
      prompt: String.raw`After $N = 400$ steps of the $\pm1$ walk, what is the standard deviation of $S_N$?`,
      answer: 20,
      tolerance: 0.01,
      why: String.raw`$\operatorname{Var}(S_{400}) = 400$ because each step contributes variance 1 and they are independent, so the standard deviation is $\sqrt{400} = 20$. Answering 400 confuses the variance with the standard deviation; answering 0 confuses the *mean* with the spread.`,
    },
    {
      kind: 'recall',
      title: 'What the CLT promises',
      points: [
        String.raw`For independent, identically distributed $\xi_i$ with mean $\mu$ and finite variance $\sigma^2$, the standardised sum $\dfrac{S_N - N\mu}{\sigma\sqrt N}$ converges in distribution to $\mathcal N(0,1)$.`,
        'Convergence in distribution means probabilities converge, not the random numbers themselves.',
        'The limit does not remember the shape of the step distribution — only its mean and variance.',
        'Finite variance is essential: heavy-tailed steps converge to other (stable) laws instead.',
      ],
      link: 'stats/central-limit-theorem',
    },
    {
      kind: 'explain',
      title: 'The rescaling that works',
      body: String.raw`Fit $N$ steps into one unit of time and shrink each step by a factor $N^{-\alpha}$. Define a function of continuous time $t\in[0,1]$:
$$W^{(N)}(t) = \frac{S_{\lfloor Nt\rfloor}}{N^{\alpha}}$$
(the brackets $\lfloor\cdot\rfloor$ mean "round down": at time $t$ you have taken $\lfloor Nt\rfloor$ steps).

Which $\alpha$ keeps the picture alive? At $t = 1$ the numerator has spread $\sqrt N$, so
$$\text{sd}\big(W^{(N)}(1)\big) = N^{1/2 - \alpha}.$$
- $\alpha > \tfrac12$: this $\to 0$. The limit is the constant zero — you over-squashed.
- $\alpha < \tfrac12$: this $\to\infty$. Nothing converges.
- $\alpha = \tfrac12$: it equals $1$ for every $N$. Goldilocks.`,
    },
    {
      kind: 'widget',
      title: 'Find the right exponent yourself',
      body: String.raw`Five independent walks, rescaled as $S_{\lfloor Nt\rfloor}/N^{\alpha}$. Raise $N$ with the slider and watch each scaling choice: with $\alpha = 1$ the paths flatten onto the axis, with $\alpha = \tfrac14$ they fly off the chart, and with $\alpha = \tfrac12$ the picture is **statistically the same at every $N$** — only finer. Compare the measured endpoint spread with the predicted $N^{1/2-\alpha}$.`,
      widget: { type: 'MathRandomWalkScaling', props: { logN: 6, alpha: 0.5, paths: 5 } },
    },
    {
      kind: 'mcq',
      prompt: String.raw`Someone rescales as $S_{\lfloor Nt\rfloor}/N$ and takes $N\to\infty$. What do they get?`,
      choices: [
        'The constant function 0',
        'Brownian motion, just with a different variance',
        'A straight line of random slope',
        'Nothing — the paths diverge',
      ],
      answer: 0,
      why: String.raw`Dividing by $N$ when the spread is only $\sqrt N$ gives standard deviation $N^{-1/2}\to 0$ at every time, so the whole path is crushed onto the axis. This is really the law of large numbers: $S_N/N\to \mathbb E[\xi] = 0$. Divergence is what happens for exponents *below* $\tfrac12$, and no rescaling by a constant power can turn a collapsing limit back into Brownian motion.`,
    },
    {
      kind: 'explain',
      title: 'Why the limit exists — and what it looks like',
      body: String.raw`Fix $\alpha = \tfrac12$. Three observations pin down the limit $W$:

1. **One time.** $W^{(N)}(t) = S_{\lfloor Nt\rfloor}/\sqrt N$ is a sum of about $Nt$ steps divided by $\sqrt N$. By the CLT it converges to $\mathcal N(0, t)$ — mean zero, **variance equal to the elapsed time**.
2. **Several times.** Steps in disjoint blocks of the walk are independent, so increments over disjoint time intervals stay independent in the limit, each $W(t) - W(s) \sim \mathcal N(0, t-s)$.
3. **The whole path.** Donsker's **invariance principle** (1951) upgrades this from finitely many times to convergence of the entire path as a random continuous function.

"Invariance" is the punchline: $\pm1$ steps, Gaussian steps, or any steps with mean $0$ and finite variance all give the *same* limit.`,
    },
    {
      kind: 'multi',
      prompt: 'Which step distributions, rescaled by √N, converge to the same Brownian motion? (Steps are independent and identically distributed.)',
      choices: [
        String.raw`$\xi = \pm1$ with probability $\tfrac12$ each`,
        String.raw`$\xi \sim \mathcal N(0,1)$`,
        String.raw`$\xi$ uniform on $[-\sqrt3, \sqrt3]$`,
        String.raw`$\xi \sim \mathcal N(0.1,\,1)$`,
        String.raw`$\xi$ Cauchy (density $\frac{1}{\pi(1+x^2)}$)`,
      ],
      answers: [0, 1, 2],
      why: String.raw`Donsker's theorem needs mean $0$ and variance $1$ (any finite variance works after rescaling). The $\pm1$, standard normal and uniform-on-$[-\sqrt3,\sqrt3]$ steps all have mean 0 and variance 1. A mean of $0.1$ adds a deterministic drift of size $0.1N/\sqrt N = 0.1\sqrt N\to\infty$, so that walk runs away. Cauchy steps have infinite variance and converge to a jumpy stable process, not to Brownian motion.`,
    },
    {
      kind: 'explain',
      title: 'Continuous: the steps vanish',
      body: String.raw`Why is the limit continuous, when every approximation is a staircase? Because the jumps shrink. The rescaled walk moves $1/\sqrt N$ at each step, so the biggest jump anywhere in $[0,1]$ is $N^{-1/2}\to 0$, while the time between jumps is $1/N\to 0$ too.

More carefully, the rescaled walk is **tight**: for any $\varepsilon$, the chance that it moves more than $\varepsilon$ during any time interval of length $\delta$ can be made small by taking $\delta$ small, *uniformly in $N$*. Tightness plus the CLT is exactly the recipe for a continuous limit. The result — a probability measure on the space of continuous paths — is **Wiener measure**, built by Norbert Wiener in 1923.`,
    },
    {
      kind: 'explain',
      title: 'Nowhere differentiable: the steps vanish too slowly',
      body: String.raw`Continuity needs displacement $\to 0$ as the time step does. Differentiability needs more: displacement divided by time step must *settle down*. It does not.

Over a time gap $h$ the typical displacement is $\sqrt h$, so the difference quotient has typical size
$$\frac{|W(t+h) - W(t)|}{h} \approx \frac{\sqrt h}{h} = \frac{1}{\sqrt h}\ \longrightarrow\ \infty.$$
Zoom in by a factor of 100 in time and the wiggle only shrinks by 10 — the path looks just as jagged, forever. This is **self-similarity**: $W(ct)$ has the same law as $\sqrt c\,W(t)$.

Paley, Wiener and Zygmund (1933) made it a theorem: with probability one, a Brownian path is differentiable at **no** time at all. Not "almost nowhere" — nowhere.`,
    },
    {
      kind: 'widget',
      title: 'The difference quotient blows up',
      body: String.raw`The typical size of $|W(t+h) - W(t)|/h$ is $h^{-1/2}$ (green), against the constant slope a differentiable function would need (blue). Shrink $h$: a smooth function's quotient settles, Brownian motion's runs away. Note how slowly it runs away — $h^{-1/2}$, not $h^{-1}$ — which is why the path is still continuous.`,
      widget: {
        type: 'FunctionPlot',
        props: {
          fns: ['1/sqrt(x)', 'c'],
          x: [0.002, 0.5],
          y: [0, 25],
          xLabel: 'time gap h',
          yLabel: 'typical |ΔW|/h',
          params: [{ name: 'c', min: 1, max: 10, value: 3, label: 'slope of a smooth function' }],
          labels: ['Brownian motion: h^(−1/2)', 'differentiable function'],
        },
      },
    },
    {
      kind: 'truefalse',
      prompt: 'Brownian paths are continuous but have no derivative anywhere; there is no contradiction because continuity only requires the displacement to shrink, not the displacement-to-time ratio to converge.',
      answer: true,
      why: String.raw`Exactly. Displacement over a gap $h$ is of order $\sqrt h\to0$, giving continuity; the ratio $\sqrt h/h = h^{-1/2}$ diverges, killing differentiability. Weierstrass had already shown such functions exist; Brownian motion shows the *typical* random path is one.`,
    },
    {
      kind: 'order',
      prompt: 'Put the construction of Brownian motion from a random walk in order.',
      steps: [
        String.raw`Take independent $\pm1$ steps $\xi_1,\dots,\xi_N$ and form the partial sums $S_n$.`,
        String.raw`Compute $\operatorname{Var}(S_N) = N$, so the walk spreads like $\sqrt N$.`,
        String.raw`Rescale time by $N$ and space by $\sqrt N$: $W^{(N)}(t) = S_{\lfloor Nt\rfloor}/\sqrt N$.`,
        String.raw`Apply the CLT at each time to get $\mathcal N(0,t)$ marginals with independent increments.`,
        String.raw`Check tightness so the whole path converges, not just finitely many times (Donsker).`,
        String.raw`Conclude: the limit is Brownian motion — continuous, Gaussian, nowhere differentiable.`,
      ],
      why: String.raw`The variance calculation is what tells you the right space scaling; only after fixing $\sqrt N$ does the CLT apply at each fixed time, and only after tightness can you talk about the limit of entire paths rather than of individual snapshots.`,
    },
    {
      kind: 'fill',
      prompt: String.raw`To get a limit we divide space by ___ while dividing time by $N$. The limit path is ___ everywhere but ___ nowhere.`,
      bank: [String.raw`$\sqrt N$`, String.raw`$N$`, String.raw`$N^2$`, 'continuous', 'differentiable', 'bounded', 'constant'],
      answer: [String.raw`$\sqrt N$`, 'continuous', 'differentiable'],
      why: String.raw`Space scales as the square root of time because independent variances add: $\operatorname{Var}(S_N) = N$. The limit inherits continuity from vanishing step sizes, but the ratio $\sqrt h / h$ diverges, so no derivative exists at any point.`,
    },
    {
      kind: 'match',
      prompt: 'Match each scaling choice to the limit it produces.',
      pairs: [
        [String.raw`$S_{\lfloor Nt\rfloor}/\sqrt N$`, 'Brownian motion'],
        [String.raw`$S_{\lfloor Nt\rfloor}/N$`, 'The constant 0 (law of large numbers)'],
        [String.raw`$S_{\lfloor Nt\rfloor}/N^{1/4}$`, 'No limit: the paths blow up'],
        [String.raw`$S_{\lfloor Nt\rfloor}/\sqrt N$ with Cauchy steps`, 'No Brownian limit: variance is infinite'],
      ],
      why: String.raw`The endpoint spread of $S_{\lfloor Nt\rfloor}/N^{\alpha}$ is $N^{1/2-\alpha}$, which vanishes for $\alpha>\tfrac12$, explodes for $\alpha<\tfrac12$ and is constant at $\alpha = \tfrac12$. Donsker's theorem additionally requires finite step variance, which the Cauchy distribution lacks.`,
    },
    {
      kind: 'explain',
      title: 'Key takeaways',
      body: String.raw`- A simple random walk has $\operatorname{Var}(S_N) = N$: spread grows like $\sqrt{\text{time}}$, because independent variances add.
- The only scaling with a non-trivial limit is **time/$N$, space/$\sqrt N$**. Too much shrinking gives 0; too little gives divergence.
- The limit exists by the **CLT** (one time), independence of disjoint blocks (several times) and **tightness** (whole paths) — Donsker's invariance principle. The step distribution is forgotten; only mean 0 and finite variance matter.
- The limit is **continuous** (jumps $\sim N^{-1/2}\to0$) but **nowhere differentiable** (difference quotients $\sim h^{-1/2}\to\infty$), and **self-similar**: $W(ct)\overset{d}{=}\sqrt c\,W(t)$.

Next, we stop building it and start using it: the defining properties of the [Wiener process](@math/brownian-motion).`,
    },
  ],
  references: [
    { authors: 'P. Mörters, Y. Peres', title: 'Brownian Motion', year: 2010, venue: 'Cambridge University Press', detail: 'Ch. 1 (construction, continuity), Ch. 1.3 (nowhere differentiability), Ch. 5.3 (Donsker’s invariance principle)' },
    { authors: 'N. Wiener', title: 'Differential-space', year: 1923, venue: 'Journal of Mathematics and Physics 2, 131–174' },
    { authors: 'R. E. A. C. Paley, N. Wiener, A. Zygmund', title: 'Notes on random functions', year: 1933, venue: 'Mathematische Zeitschrift 37, 647–668', detail: 'Almost every Brownian path is nowhere differentiable' },
    { authors: 'P. Billingsley', title: 'Convergence of Probability Measures', year: 1999, venue: '2nd ed., Wiley', detail: 'Ch. 2 (tightness), Ch. 8 (Donsker’s theorem)' },
    { authors: 'A. Einstein', title: 'Über die von der molekularkinetischen Theorie der Wärme geforderte Bewegung von in ruhenden Flüssigkeiten suspendierten Teilchen', year: 1905, venue: 'Annalen der Physik 17, 549–560', detail: 'Mean squared displacement proportional to time' },
  ],
} satisfies LessonContent;
