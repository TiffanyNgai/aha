import type { LessonContent } from '../../types';

export default {
  cards: [
    {
      kind: 'explain',
      title: 'Four axioms, one process',
      body: String.raw`[Shrinking a random walk](@math/random-walks-to-brownian) produced a limit. Rather than carry the construction around forever, we promote its properties to a **definition**. A process $(W_t)_{t\ge0}$ is a **standard Brownian motion** (or **Wiener process**) if:

1. $W_0 = 0$.
2. **Independent increments:** for $t_0 < t_1 < \cdots < t_n$, the increments $W_{t_1}-W_{t_0},\ \dots,\ W_{t_n}-W_{t_{n-1}}$ are independent.
3. **Stationary Gaussian increments:** $W_t - W_s \sim \mathcal N(0,\ t-s)$ for $s<t$ — mean zero, variance the *elapsed time*.
4. **Continuous paths:** $t\mapsto W_t$ is continuous, with probability one.

Wiener (1923) proved such a process exists. Everything else in this lesson is a consequence of these four lines.`,
    },
    {
      kind: 'explain',
      title: 'The covariance is min(s, t)',
      body: String.raw`Properties 1–3 fix every joint distribution, because a Gaussian family is determined by its means and covariances. Means are zero, and for $s \le t$:
$$\operatorname{Cov}(W_s, W_t) = \operatorname{Cov}\big(W_s,\ W_s + (W_t - W_s)\big) = \operatorname{Var}(W_s) + 0 = s,$$
since $W_s$ (built from increments before $s$) is independent of the increment after $s$. So
$$\operatorname{Cov}(W_s, W_t) = \min(s,t).$$
A compact restatement of the definition: **Brownian motion is the continuous Gaussian process with mean 0 and covariance $\min(s,t)$.** For example $\operatorname{Corr}(W_1, W_4) = 1/\sqrt{1\cdot4} = 0.5$: the paths remember, but weakly.`,
    },
    {
      kind: 'numeric',
      prompt: String.raw`For standard Brownian motion, what is $\operatorname{Cov}(W_2, W_5)$?`,
      answer: 2,
      tolerance: 0.001,
      why: String.raw`The covariance is $\min(2,5) = 2$. Only the shared history up to time 2 is common to both; the increment from 2 to 5 is independent of $W_2$ and contributes nothing. Answering 5 or 10 treats the two times symmetrically, which the independent-increment structure forbids.`,
    },
    {
      kind: 'widget',
      title: 'Paths and the √t envelope',
      body: String.raw`Twelve simulated Brownian paths on $[0,1]$ ($\sigma = 1$), with the distribution of $W_1$ built from 600 of them on the right; the red curve is the exact $\mathcal N(0,1)$ density. The cloud of paths widens like $\sqrt t$, not $t$. Press "New noise" a few times: the individual paths never repeat, but the histogram always lands on the same bell curve.`,
      widget: { type: 'MathSdePaths', props: { mode: 'bm', sigma: 1, shown: 12, steps: 300 } },
    },
    {
      kind: 'numeric',
      prompt: String.raw`What is $\mathbb P(W_9 > 6)$? (Use $\mathbb P(Z > 2) = 0.0228$ for a standard normal $Z$.)`,
      answer: 0.0228,
      tolerance: 0.002,
      why: String.raw`$W_9 \sim \mathcal N(0, 9)$, so its standard deviation is $\sqrt 9 = 3$ and $\{W_9 > 6\} = \{Z > 6/3 = 2\}$, probability $0.0228$. The classic slip is to divide by the variance 9 instead of the standard deviation 3, giving the much larger $\mathbb P(Z > 0.67)$.`,
    },
    {
      kind: 'explain',
      title: 'Scaling, symmetry, and starting over',
      body: String.raw`Each of these is again a standard Brownian motion — check the covariance of each against $\min(s,t)$:

- **Scaling (self-similarity):** $\widetilde W_t = c^{-1/2}W_{ct}$ for any $c>0$. Zooming in on time by $100$ and on space by $10$ gives a statistically identical picture.
- **Symmetry:** $-W_t$.
- **Time inversion:** $tW_{1/t}$ for $t>0$ (and $0$ at $t=0$). The behaviour near $t=0$ mirrors the behaviour at $t=\infty$.
- **Fresh start (Markov):** for fixed $s$, $\widetilde W_t = W_{s+t} - W_s$ is a Brownian motion independent of everything up to time $s$.

Note what is *not* on the list: $W_{2t}$ alone, whose variance is $2t$ — it is a Brownian motion sped up, i.e. $\sqrt2$ times a standard one.`,
    },
    {
      kind: 'mcq',
      prompt: String.raw`Which of these processes is **not** a standard Brownian motion?`,
      choices: [
        String.raw`$X_t = W_{2t}$`,
        String.raw`$X_t = \tfrac{1}{2}W_{4t}$`,
        String.raw`$X_t = W_{t+3} - W_3$`,
        String.raw`$X_t = -W_t$`,
      ],
      answer: 0,
      why: String.raw`Standard Brownian motion must satisfy $\operatorname{Var}(X_t) = t$. Speeding up time alone gives $\operatorname{Var}(W_{2t}) = 2t$, too big by a factor of 2; the fix is to divide by $\sqrt2$, exactly as $\tfrac12 W_{4t}$ does. Restarting at time 3 and negating both preserve all four defining properties.`,
    },
    {
      kind: 'explain',
      title: 'The Markov and martingale properties',
      body: String.raw`Write $\mathcal F_s$ for "everything observed up to time $s$". The fresh-start property says the future depends on the past **only through the present value**:
$$\mathbb P\big(W_{s+t}\in A \mid \mathcal F_s\big) = \mathbb P\big(W_{s+t}\in A \mid W_s\big).$$
That is the **Markov property**. Knowing the entire wiggly history tells you nothing extra about tomorrow beyond today's position.

Taking expectations of $W_{s+t} = W_s + (W_{s+t}-W_s)$ and using that the increment has mean zero,
$$\mathbb E[W_{s+t}\mid\mathcal F_s] = W_s.$$
That is the **martingale** property: Brownian motion is a fair game. Betting systems cannot beat it, and this is precisely what makes the [Itô integral](@math/ito-integral) have mean zero.`,
    },
    {
      kind: 'truefalse',
      prompt: String.raw`If a Brownian path has gone up for the last ten seconds, it is slightly more likely to go down in the next second (a "correction").`,
      answer: false,
      why: String.raw`The increment over the next second is independent of the entire past and has mean zero, so the past gives no information about its sign — this is the martingale property. The intuition that a run "must correct" is the gambler's fallacy; from any current position, the next move is symmetric — equally likely up or down.`,
    },
    {
      kind: 'explain',
      title: 'Quadratic variation: the fact everything rests on',
      body: String.raw`Chop $[0,t]$ into $N$ equal pieces of length $\Delta t = t/N$ and add up **squared** increments:
$$Q_N = \sum_{i=1}^{N}(\Delta W_i)^2.$$
Each $\Delta W_i\sim\mathcal N(0,\Delta t)$, so $\mathbb E[(\Delta W_i)^2] = \Delta t$ and (fourth moment of a normal) $\operatorname{Var}[(\Delta W_i)^2] = 2(\Delta t)^2$. The pieces are independent, so
$$\mathbb E[Q_N] = N\Delta t = t,\qquad \operatorname{Var}(Q_N) = 2N(\Delta t)^2 = 2t\,\Delta t\ \longrightarrow\ 0.$$
The randomness **cancels in the limit**: $Q_N \to t$, the same number for (almost) every path. This deterministic quantity is the **quadratic variation** of $W$ on $[0,t]$, written $\langle W\rangle_t = t$.`,
    },
    {
      kind: 'widget',
      title: 'Squared increments converge, absolute ones do not',
      body: String.raw`One fixed Brownian path, resampled on grids of $N = 2^k$ intervals. Blue: the running $\sum(\Delta W)^2$, which hugs the dashed line $y = t$ ever more tightly as $k$ grows. Orange: $\sum|\Delta W|$, the path's **length**, which grows without bound (like $\sqrt{2N/\pi}$) and leaves the chart. Finite quadratic variation, infinite total variation — in one picture.`,
      widget: { type: 'MathQuadraticVariation', props: { mode: 'qv', logN: 4 } },
    },
    {
      kind: 'explain',
      title: 'Why infinite length changes everything',
      body: String.raw`For a smooth function $f$, squared increments are of size $(f'\Delta t)^2 \sim (\Delta t)^2$, so their sum is of order $N(\Delta t)^2 = t\,\Delta t\to 0$: smooth functions have **zero** quadratic variation. Brownian motion's is $t$ — finite and non-zero, yet random increments still add up to a deterministic number.

The flip side: $\mathbb E|\Delta W_i| = \sqrt{2\Delta t/\pi}$, so $\sum_i \mathbb E|\Delta W_i| = N\sqrt{2\Delta t/\pi} = \sqrt{2Nt/\pi}\to\infty$. Brownian paths have **infinite length on every interval**, however short.

That is fatal for the usual theory of integration: $\int_0^T H\,dW$ cannot be built as a Riemann–Stieltjes integral, which needs the integrator to have finite variation. It is also the source of Itô's extra term, since $(\Delta W)^2 \approx \Delta t$ refuses to be negligible. Both threads are picked up next.`,
    },
    {
      kind: 'multi',
      prompt: 'Which statements about standard Brownian motion are true?',
      choices: [
        String.raw`$\operatorname{Var}(W_t) = t$`,
        String.raw`Its quadratic variation on $[0,t]$ equals $t$ for almost every path`,
        String.raw`Its total path length on $[0,1]$ is finite but large`,
        String.raw`$\mathbb E[W_{s+t}\mid \mathcal F_s] = W_s$`,
        String.raw`$W_{s+t} - W_s$ is independent of $W_s$`,
      ],
      answers: [0, 1, 3, 4],
      why: String.raw`Variance equal to elapsed time, quadratic variation $t$, the martingale identity and independent increments are all part of (or immediate from) the definition. The claim about finite path length is the false one: $\sum|\Delta W| \sim \sqrt{2N/\pi}\to\infty$, so the length is infinite on every interval.`,
    },
    {
      kind: 'explain',
      title: 'Lévy’s characterisation',
      body: String.raw`Two properties out of the four turn out to be enough. **Lévy's theorem:** if $M_t$ is a continuous martingale with $M_0 = 0$ and quadratic variation $\langle M\rangle_t = t$, then $M$ **is** a standard Brownian motion.

So "fair game + squared wiggles accumulate at rate 1 + continuous" forces Gaussian increments; you never have to assume normality. This is why quadratic variation, not the bell curve, is the real protagonist: it is the quantity that identifies Brownian motion, drives Itô's lemma, and sets the accuracy of every numerical scheme in this unit.`,
    },
    {
      kind: 'fill',
      prompt: String.raw`Standard Brownian motion has increments $W_t - W_s \sim \mathcal N(0, $ ___ $)$, covariance $\operatorname{Cov}(W_s,W_t) = $ ___, and quadratic variation on $[0,t]$ equal to ___.`,
      bank: [String.raw`$t-s$`, String.raw`$\sqrt{t-s}$`, String.raw`$\min(s,t)$`, String.raw`$st$`, String.raw`$t$`, String.raw`$t^2$`],
      answer: [String.raw`$t-s$`, String.raw`$\min(s,t)$`, String.raw`$t$`],
      why: String.raw`The *variance* of an increment is the elapsed time $t-s$ (its standard deviation is $\sqrt{t-s}$). The covariance is the shared history $\min(s,t)$. Squared increments sum to $t$, the quadratic variation.`,
    },
    {
      kind: 'match',
      prompt: 'Match each property of Brownian motion to what it says.',
      pairs: [
        ['Self-similarity', String.raw`$c^{-1/2}W_{ct}$ is again a standard Brownian motion`],
        ['Markov property', 'Given the present position, the future ignores the past'],
        ['Martingale property', String.raw`$\mathbb E[W_t\mid\mathcal F_s] = W_s$: no predictable drift`],
        ['Quadratic variation', String.raw`$\sum(\Delta W)^2 \to t$, a non-random limit`],
        ['Unbounded variation', String.raw`$\sum|\Delta W| \to \infty$: paths have infinite length`],
      ],
      why: String.raw`Self-similarity is about rescaling, the Markov property about forgetting history, the martingale property about zero expected change, and the two variation statements about how squared versus absolute increments accumulate — finite for squares, infinite for absolute values.`,
    },
    {
      kind: 'explain',
      title: 'Key takeaways',
      body: String.raw`- **Definition:** $W_0=0$, independent increments, $W_t-W_s\sim\mathcal N(0,t-s)$, continuous paths. Equivalently: the continuous Gaussian process with mean 0 and $\operatorname{Cov}(W_s,W_t)=\min(s,t)$.
- **Symmetries:** $c^{-1/2}W_{ct}$, $-W_t$, $tW_{1/t}$ and $W_{s+t}-W_s$ are all standard Brownian motions.
- **Markov:** the future depends on the past only through the present. **Martingale:** $\mathbb E[W_t\mid\mathcal F_s]=W_s$.
- **Quadratic variation $\langle W\rangle_t = t$** — random increments, deterministic limit. Smooth functions give 0.
- **Total variation is infinite**, so Riemann–Stieltjes integration against $dW$ is impossible; a new integral is needed.
- **Lévy:** continuous martingale $+$ quadratic variation $t$ $\Rightarrow$ Brownian motion.

Next: building that new integral — [the Itô integral](@math/ito-integral).`,
    },
  ],
  references: [
    { authors: 'P. Mörters, Y. Peres', title: 'Brownian Motion', year: 2010, venue: 'Cambridge University Press', detail: 'Ch. 1 (definition, scaling, Markov property), Ch. 1.3 (variation of paths)' },
    { authors: 'B. Øksendal', title: 'Stochastic Differential Equations: An Introduction with Applications', year: 2003, venue: '6th ed., Springer', detail: 'Ch. 2 (Brownian motion, basic properties)' },
    { authors: 'I. Karatzas, S. Shreve', title: 'Brownian Motion and Stochastic Calculus', year: 1991, venue: '2nd ed., Springer', detail: 'Ch. 1–2; Lévy’s characterisation in Thm. 3.3.16' },
    { authors: 'C. Gardiner', title: 'Stochastic Methods: A Handbook for the Natural and Social Sciences', year: 2009, venue: '4th ed., Springer', detail: 'Ch. 3 (the Wiener process)' },
  ],
} satisfies LessonContent;
