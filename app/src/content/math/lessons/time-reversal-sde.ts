import type { LessonContent } from '../../types';

export default {
  cards: [
    {
      kind: 'explain',
      title: 'Run the film backwards',
      body: String.raw`Drop a bead of ink in water. Forwards, it spreads into a featureless cloud — the SDE $dX = \sigma\,dW$ at work. Now play the film backwards: the cloud contracts, sharpens, and reassembles into a bead. Thermodynamically this looks absurd. Mathematically it is a perfectly well-defined stochastic process, and the question this lesson answers is:

> **Is the time-reversal of a diffusion also a diffusion — and if so, what is its drift?**

The answer, due to Anderson (1982), is yes, with one extra term. That term is $\nabla_x\log p_t(x)$, the **score**. Learn it from data and you can run the film backwards on purpose: that sentence is, almost exactly, the design of a modern diffusion model.`,
    },
    {
      kind: 'recall',
      title: 'Densities, not paths',
      points: [
        String.raw`For $dX = f(x,t)dt + g(t)dW$, the density $p_t(x)$ of $X_t$ obeys the **Fokker–Planck** equation $\partial_t p = -\partial_x(f\,p) + \tfrac12 g^2\partial_{xx}p$.`,
        'Drift transports probability; diffusion spreads it.',
        String.raw`Pure diffusion ($f=0$) gives the heat equation, whose solution from a point mass is $\mathcal N(x_0, g^2t)$.`,
        String.raw`A stationary density is one with $\partial_t p = 0$: the paths keep moving, the distribution does not.`,
      ],
      link: 'math/ito-calculus',
    },
    {
      kind: 'explain',
      title: 'Anderson’s reverse-time SDE',
      body: String.raw`Let $X_t$ solve the **forward** SDE on $[0,T]$:
$$dX_t = f(X_t, t)\,dt + g(t)\,dW_t,$$
and write $p_t$ for the density of $X_t$. The reversed process $\bar X_s = X_{T-s}$ is again a diffusion (Anderson, 1982). Following Song et al., write $X_t$ for that same process labelled by forward time $t$; it solves the following SDE, driven by its own Brownian motion $\bar W$:
$$\boxed{\,dX_t = \Big[f(X_t,t) - g(t)^2\,\nabla_x\log p_t(X_t)\Big]dt + g(t)\,d\bar W_t\,}$$
read with time running **backwards** from $T$ to $0$ (so $dt$ is a negative increment).

Three things to notice. The **diffusion coefficient is unchanged** — noise is time-symmetric. The drift picks up one new term, $-g^2\nabla\log p_t$. And that term depends on the **marginal density**, not on the path: the reverse process needs to know where the probability mass currently is.`,
    },
    {
      kind: 'explain',
      title: 'What the score is',
      body: String.raw`The **score** of a density $p$ is
$$s(x) = \nabla_x \log p(x) = \frac{\nabla_x p(x)}{p(x)}.$$
It is a vector field pointing **uphill in log-probability**, steeply where the density falls off fast and gently near a peak; it vanishes exactly at modes. Two properties make it the right object here:

- It does not need the normalising constant. If $p = \tilde p/Z$ then $\nabla\log p = \nabla\log\tilde p$ — the intractable $Z$ differentiates away. This is why scores are learnable when densities are not.
- For a Gaussian $\mathcal N(\mu,\varsigma^2)$ it is simply $s(x) = -(x-\mu)/\varsigma^2$: a linear spring pulling towards the mean, stiffer when the distribution is tight.

In the reverse SDE, $-g^2 s$ enters with a minus sign *and* time runs backwards, so the net effect is a pull **towards** high-density regions: the term that un-spreads the ink.`,
    },
    {
      kind: 'widget',
      title: 'A density and its score',
      body: String.raw`A Gaussian $\mathcal N(0,\varsigma^2)$ (green) and its score $-x/\varsigma^2$ (blue). The score is zero at the mode, negative to the right (pointing back left) and positive to the left. Shrink $\varsigma$: the density sharpens and the score steepens — a tight distribution pulls back hard. This linear case is exactly what appears in the reverse-time OU and variance-preserving diffusions.`,
      widget: {
        type: 'FunctionPlot',
        props: {
          fns: ['exp(-x^2/(2*s^2))/sqrt(2*PI*s^2)', '-x/s^2'],
          x: [-3, 3],
          y: [-3, 3],
          xLabel: 'x',
          yLabel: 'value',
          params: [{ name: 's', min: 0.4, max: 2, value: 1, label: 'width ς' }],
          labels: ['density p(x)', 'score ∇log p(x)'],
        },
      },
    },
    {
      kind: 'numeric',
      prompt: String.raw`What is the score $\nabla_x\log p(x)$ of the density $\mathcal N(0, 4)$ at the point $x = 3$?`,
      answer: -0.75,
      tolerance: 0.001,
      why: String.raw`For $\mathcal N(\mu,\varsigma^2)$, $\log p = -\frac{(x-\mu)^2}{2\varsigma^2} + \text{const}$, so the score is $-(x-\mu)/\varsigma^2 = -3/4$. The variance is 4, not the standard deviation — dividing by 2 instead of 4 is the usual slip. The sign is negative because $x=3$ lies to the right of the mode, so log-probability increases to the left.`,
    },
    {
      kind: 'mcq',
      prompt: String.raw`A forward process is $dX = -2X\,dt + 3\,dW$. Which drift does its reverse-time SDE use?`,
      choices: [
        String.raw`$-2x - 9\,\nabla_x\log p_t(x)$`,
        String.raw`$2x + 9\,\nabla_x\log p_t(x)$`,
        String.raw`$-2x - 3\,\nabla_x\log p_t(x)$`,
        String.raw`$-2x - \tfrac92\nabla_x\log p_t(x)$`,
      ],
      answer: 0,
      why: String.raw`Anderson's reverse drift is $f - g^2\nabla\log p_t$ with $f = -2x$ and $g = 3$, so the score is multiplied by $g^2 = 9$, giving $-2x - 9\nabla\log p_t$. The drift $f$ keeps its own sign — the time reversal is carried by integrating $dt$ backwards, not by flipping $f$. Using $g$ instead of $g^2$, or the half-coefficient $g^2/2$, are the two standard errors; the halved version is the *probability-flow ODE*, a different object.`,
    },
    {
      kind: 'explain',
      title: 'Why a score term has to appear',
      body: String.raw`Here is the idea in one line of physics. Fokker–Planck can be written as a conservation law, $\partial_t p = -\partial_x J$, with **probability current**
$$J(x,t) = f\,p - \tfrac12 g^2\,\partial_x p = \Big(f - \tfrac12 g^2\,\partial_x\log p\Big)p.$$
So the *average velocity* of probability mass at $(x,t)$ is $v = J/p = f - \tfrac12 g^2\nabla\log p$: the drift $f$ minus a term that always flows **downhill in density**, because diffusion carries mass from crowded regions to empty ones.

Now run the clock backwards, $s = T-t$. The reversed process must have the mean velocity $-v = -f + \tfrac12 g^2\nabla\log p$. But the reversed process is itself a diffusion with noise $g$, and that noise on its own spreads mass at average velocity $-\tfrac12 g^2\nabla\log p$ — so its drift $b$ must satisfy $b - \tfrac12 g^2\nabla\log p = -v$, i.e. $b = -f + g^2\nabla\log p$. Expressed with $dt$ running backwards (which flips the sign of the whole drift), this is $f - g^2\nabla\log p$. The factor 2 between $\tfrac12 g^2$ (the flow velocity) and $g^2$ (the reverse SDE drift) is not cosmetic: it is exactly the difference between the probability-flow ODE and the reverse SDE below.`,
    },
    {
      kind: 'explain',
      title: 'A case you can check by hand',
      body: String.raw`Take $f = 0$, $g = \sigma$ (pure diffusion) and start from $X_0\sim\mathcal N(0,\varsigma_0^2)$. Then $p_t = \mathcal N(0,\ \varsigma_t^2)$ with $\varsigma_t^2 = \varsigma_0^2 + \sigma^2t$, so
$$\nabla_x\log p_t(x) = -\frac{x}{\varsigma_0^2+\sigma^2 t}.$$
Anderson's reverse drift is therefore $0 - \sigma^2\cdot\big(-x/\varsigma_t^2\big) = +\sigma^2 x/\varsigma_t^2$. Because time runs backwards, a step of size $|dt|$ moves $x$ by $-\sigma^2x\,|dt|/\varsigma_t^2$ — **towards the origin**, and more strongly the narrower the current distribution.

Run it from $t=T$ down to $t=0$ and the spread contracts from $\varsigma_0^2 + \sigma^2T$ back to $\varsigma_0^2$, as it must. Note what the reverse process needed: not the forward path, only the *family of densities* $p_t$. That is the hinge the whole generative-modelling story swings on.`,
    },
    {
      kind: 'explain',
      title: 'The probability-flow ODE',
      body: String.raw`Keep the average velocity $v = f - \tfrac12 g^2\nabla\log p_t$ and throw the randomness away:
$$\frac{dx}{dt} = f(x,t) - \tfrac12 g(t)^2\,\nabla_x\log p_t(x).$$
This **probability-flow ODE** (Song et al., 2021) is deterministic, yet its solutions have **exactly the same marginal densities $p_t$** as the SDE at every time — by construction, since both give the same Fokker–Planck equation.

Same marginals, different paths. Individual trajectories differ completely: the SDE's are jagged and non-reversible run to run, the ODE's are smooth and reversible, giving an invertible map between noise and data. That invertibility is what lets diffusion models compute exact likelihoods and take big deterministic sampling steps; the price is that all the diversity must come from the initial noise draw.`,
    },
    {
      kind: 'widget',
      title: 'Same marginals, different paths',
      body: String.raw`Reverse-time sampling of a variance-preserving diffusion whose data are a mixture of three Gaussians, so the score is known **exactly** — no learning involved. Time runs down the page from pure noise to data. Jagged trajectories are the reverse **SDE**; smooth ones are the **probability-flow ODE** started from the same terminal noise. Watch where each lands: the endpoints form the same three clusters, but path by path they disagree.`,
      widget: { type: 'MlSdeOdePaths', props: { show: 'both', paths: 14 } },
    },
    {
      kind: 'truefalse',
      prompt: 'The probability-flow ODE and the reverse-time SDE, started from the same point, produce the same trajectory.',
      answer: false,
      why: String.raw`They match in **distribution at each time**, not path by path: the ODE is deterministic while the SDE keeps injecting noise, and the ODE's drift uses $\tfrac12g^2\nabla\log p$ against the SDE's $g^2\nabla\log p$. Equality of marginals is a statement about densities; it never implies equality of sample paths.`,
    },
    {
      kind: 'multi',
      prompt: 'What does Anderson’s reversal require or provide?',
      choices: [
        String.raw`The score $\nabla_x\log p_t(x)$ of the forward marginals, at every time`,
        String.raw`The same diffusion coefficient $g(t)$ as the forward process`,
        String.raw`A drift corrected by $-g^2\nabla_x\log p_t$`,
        String.raw`Knowledge of the individual forward path that was taken`,
        String.raw`That the forward process be stationary`,
      ],
      answers: [0, 1, 2],
      why: String.raw`The reversal needs the marginal densities through their scores, reuses the same diffusion coefficient, and shifts the drift by $-g^2\nabla\log p_t$. It emphatically does not need the realised forward path — if it did, you could never *generate* anything new. Nor does it need stationarity: the whole point is that $p_t$ changes with time.`,
    },
    {
      kind: 'explain',
      title: 'This is what a diffusion model is',
      body: String.raw`Put the pieces together and the recipe behind image, audio and molecule generators falls out:

1. **Choose a forward SDE** that destroys data into noise. Usually the variance-preserving one, $dX = -\tfrac12\beta(t)X\,dt + \sqrt{\beta(t)}\,dW$ — an [Ornstein–Uhlenbeck process](@math/ornstein-uhlenbeck) with a time-varying rate, whose transition law $\mathcal N(\sqrt{\bar\alpha_t}x_0, (1-\bar\alpha_t)I)$ is known in closed form, so any noise level can be sampled in one shot.
2. **Learn the score.** Train a network $s_\theta(x,t)\approx\nabla_x\log p_t(x)$ by denoising score matching: for Gaussian noising, the optimal denoiser and the score are related by $\nabla_x\log p_t(x) = -\varepsilon^\star/\sqrt{1-\bar\alpha_t}$, so "predict the noise you added" *is* score estimation.
3. **Sample by reversing.** Start from the terminal noise distribution and integrate Anderson's reverse SDE (or the probability-flow ODE) down to $t=0$ with $s_\theta$ in place of the true score.

Song et al. (2021) is the paper that framed the whole family this way and made the link explicit; see [score-based SDEs](@ml/score-sde) for the machine-learning side. The honest caveats: the score is only approximate, errors compound over the trajectory, the terminal distribution is only approximately Gaussian, and discretisation adds its own bias — which is why samplers, schedules and step counts are a research area of their own.`,
      widget: {
        type: 'DiffusionDenoise',
        props: { dataset: 'moons', mode: 'forward', sampler: 'ddpm', showScore: true },
      },
    },
    {
      kind: 'order',
      prompt: 'Put the score-based generative modelling pipeline in order.',
      steps: [
        'Pick a forward SDE whose transition law is known, so any noise level can be sampled directly from the data.',
        'Noise the training data to random times t and train a network to predict the added noise.',
        'Convert the trained denoiser into a score estimate of the forward marginals.',
        'Draw a sample from the terminal noise distribution.',
        'Integrate Anderson’s reverse-time SDE (or the probability-flow ODE) from T down to 0 with the learned score.',
      ],
      why: String.raw`Everything on the training side happens on the *forward* process, which is cheap because its transition law is closed-form — no path simulation is needed. The reverse SDE is used only at sampling time, and it can only be written down once a score estimate exists.`,
    },
    {
      kind: 'fill',
      prompt: String.raw`Anderson's reverse-time SDE is $dX = \big[f - $ ___ $\,\nabla_x\log p_t(X)\big]dt + $ ___ $\,d\bar W$, while the probability-flow ODE uses the coefficient ___ in front of the score.`,
      bank: [String.raw`$g^2$`, String.raw`$g$`, String.raw`$\tfrac12 g^2$`, String.raw`$2g^2$`, String.raw`$f$`],
      answer: [String.raw`$g^2$`, String.raw`$g$`, String.raw`$\tfrac12 g^2$`],
      why: String.raw`The reverse SDE keeps the forward diffusion coefficient $g$ and corrects the drift by the full $g^2$ times the score; the deterministic flow with the same marginals uses exactly half of that correction and no noise at all. Remembering which of the two carries the $\tfrac12$ is the single most common confusion in this subject.`,
    },
    {
      kind: 'explain',
      title: 'Key takeaways',
      body: String.raw`- **Anderson (1982):** the time reversal of $dX = f\,dt + g\,dW$ is again a diffusion,
$$dX = \big[f - g^2\nabla_x\log p_t(X)\big]dt + g\,d\bar W,$$
with $dt$ running backwards. The diffusion coefficient is unchanged; only the drift gains a term.
- That term is the **score** $\nabla_x\log p_t$ — uphill in log-density, zero at modes, independent of the normalising constant, and equal to $-(x-\mu)/\varsigma^2$ for a Gaussian.
- It appears because Fokker–Planck's probability current is $J = (f - \tfrac12g^2\nabla\log p)p$: reversing the transport while keeping the spreading doubles the score correction.
- The **probability-flow ODE** $\dot x = f - \tfrac12g^2\nabla\log p_t$ has the *same marginals* and *different paths* — deterministic, invertible, and the basis of exact likelihoods and fast samplers.
- The reverse process needs only the **marginal densities**, never the forward path. Estimate the score from data and you can generate: that is a diffusion model.

Next: where SDEs earn their keep across science and finance — [applications](@math/sde-applications).`,
    },
  ],
  references: [
    { authors: 'B. D. O. Anderson', title: 'Reverse-time diffusion equation models', year: 1982, venue: 'Stochastic Processes and their Applications 12(3), 313–326' },
    { authors: 'Y. Song, J. Sohl-Dickstein, D. P. Kingma, A. Kumar, S. Ermon, B. Poole', title: 'Score-based generative modeling through stochastic differential equations', year: 2021, venue: 'ICLR 2021', detail: 'Reverse-time SDE (eq. 6) and the probability-flow ODE (eq. 13)', url: 'https://arxiv.org/abs/2011.13456' },
    { authors: 'U. G. Haussmann, E. Pardoux', title: 'Time reversal of diffusions', year: 1986, venue: 'Annals of Probability 14(4), 1188–1205', detail: 'Rigorous conditions for the reversal' },
    { authors: 'P. Vincent', title: 'A connection between score matching and denoising autoencoders', year: 2011, venue: 'Neural Computation 23(7), 1661–1674' },
    { authors: 'C. Gardiner', title: 'Stochastic Methods: A Handbook for the Natural and Social Sciences', year: 2009, venue: '4th ed., Springer', detail: 'Ch. 5 (probability current and the Fokker–Planck equation)' },
  ],
} satisfies LessonContent;
