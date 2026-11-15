import type { LessonContent } from '../../types';

export default {
  cards: [
    {
      kind: 'explain',
      title: 'The straight line you were promised',
      body: String.raw`[Flow matching](@ml/flow-matching) trains on straight conditional paths $\mathbf x_t=(1-t)\mathbf x_0+t\mathbf x_1$ — and then the learned flow curves anyway. The curvature is not a bug in the training: it is forced by the *pairing*. Each noise sample is matched with a **random** data point, so the segments cross everywhere, and an ODE is not allowed to cross itself. Averaging crossing targets bends the trajectories.

Curvature costs money at sampling time. A single Euler step follows a tangent line; the further the true path bends away from that line, the more steps you need. **Rectified flow** (Liu, Gong & Liu, 2023) attacks the pairing instead of the solver.

Below, round 0: each grey noise point joined to a random green data point. Count the crossings.`,
      widget: { type: 'MlReflowStraighten', props: { dataset: 'gmm', round: 0, particles: 26 } },
    },
    {
      kind: 'recall',
      title: 'Recall: what flow matching trains',
      points: [
        String.raw`Sample $\mathbf x_0\sim p_0$ (noise), $\mathbf x_1\sim p_1$ (data), $t\sim\mathcal U[0,1]$, and set $\mathbf x_t=(1-t)\mathbf x_0+t\mathbf x_1$.`,
        String.raw`Regress $\mathbf v_\theta(\mathbf x_t,t)$ onto $\mathbf x_1-\mathbf x_0$ with squared loss.`,
        String.raw`The minimizer is the **marginal velocity** $\mathbf v^\star_t(\mathbf x)=\mathbb E[\mathbf x_1-\mathbf x_0\mid\mathbf x_t=\mathbf x]$.`,
        String.raw`Sampling integrates $\dot{\mathbf x}=\mathbf v_\theta(\mathbf x,t)$ from $t=0$ to $t=1$; the marginals $p_t$ come out right no matter how the pairs were drawn.`,
      ],
      link: 'ml/flow-matching',
    },
    {
      kind: 'explain',
      title: 'A coupling, not just a pair of distributions',
      body: String.raw`Write $(\mathbf X_0,\mathbf X_1)$ for the **coupling**: a joint distribution whose marginals are the noise and the data. Vanilla flow matching uses the *independent* coupling $\mathbf X_0\perp\mathbf X_1$, but nothing in the derivation requires it. Any coupling with the right marginals gives a valid training signal, because the conditional-expectation argument only ever looks at $\mathbf x_t$.

The **rectified flow** of a coupling is the ODE $\dot{\mathbf z}=\mathbf v^\star(\mathbf z,t)$ with
$$\mathbf v^\star(\mathbf z,t)=\mathbb E\big[\mathbf X_1-\mathbf X_0\ \big|\ (1-t)\mathbf X_0+t\mathbf X_1=\mathbf z\big].$$
Call the map it induces $\mathbf X_0\mapsto\mathbf Z_1$. Two things are true of $\mathbf Z_1$ and will do all the work: it has the **same law as $\mathbf X_1$**, and it is a *deterministic function* of $\mathbf X_0$.`,
    },
    {
      kind: 'explain',
      title: 'Straightness, defined',
      body: String.raw`Measure how far a flow is from being a set of straight lines:
$$S=\int_0^1\mathbb E\Big\|\big(\mathbf Z_1-\mathbf Z_0\big)-\mathbf v^\star(\mathbf Z_t,t)\Big\|^2\,dt .$$
$S=0$ means every trajectory moves with a constant velocity — the velocity that happens to equal its own total displacement. Then
$$\mathbf Z_1=\mathbf Z_0+\mathbf v^\star(\mathbf Z_0,0)$$
**exactly**: one Euler step, one network call, zero discretization error. Any solver, any step size, same answer.

So "few-step sampling" is not really a question about numerical analysis. It is a question about how straight the flow is, and straightness is decided by the coupling.`,
    },
    {
      kind: 'numeric',
      prompt: String.raw`A 1-D toy. Noise takes values $0$ or $2$ with probability $\tfrac12$ each; data takes values $10$ or $12$ with probability $\tfrac12$ each. Under the **independent** coupling, what is the expected squared transport cost $\mathbb E\big[(\mathbf X_1-\mathbf X_0)^2\big]$?`,
      answer: 102,
      tolerance: 0.01,
      why: String.raw`All four pairs are equally likely: $(0,10)\to100$, $(0,12)\to144$, $(2,10)\to64$, $(2,12)\to100$, giving $(100+144+64+100)/4=102$. The monotone (optimal-transport) coupling $0\leftrightarrow10$, $2\leftrightarrow12$ costs $(100+100)/2=100$ instead — lower, and its two segments do not cross. Cheaper transport and straighter paths are the same phenomenon.`,
    },
    {
      kind: 'explain',
      title: 'Reflow: use the model to repair its own pairing',
      body: String.raw`Here is the trick. Train a flow on the independent coupling. Then **simulate it**: draw $\mathbf X_0$, integrate accurately to get $\mathbf Z_1$, and keep the *pair*. You now own a new coupling $(\mathbf X_0,\mathbf Z_1)$ of the same two marginals — but this one was built by an ODE, so it never crosses itself.

Retrain flow matching from scratch on these pairs. The result is the **2-rectified flow**. Repeat for a $k$-rectified flow. The whole procedure is called **reflow**:
> independent pairs → train → simulate → rectified pairs → retrain → …

Each round costs a full training run plus a round of (offline, parallelisable) sampling. In exchange the next model's conditional paths are nearly the paths it should actually follow.`,
    },
    {
      kind: 'widget',
      title: 'Round 0 versus round 1',
      body: String.raw`Press **Round 1 (reflow)** to swap the random pairing for the rectified one $(\mathbf x_0,\mathbf z_1)$ produced by integrating the round-0 flow. The crossing counter drops sharply. Turn on **ODE paths** to see the round-0 trajectories that produced those endpoints: they are curved (the "mean bend" readout is each path's largest distance from its own chord, averaged over paths), and *that* curvature is what round 1 removes, because round 1's targets are the chords themselves.

Two details worth noticing. The green data cloud is unchanged in both views — reflow never alters the marginals, only who is paired with whom. And the round-1 segments still cross a little: one reflow round reduces curvature, it does not abolish it.`,
      widget: { type: 'MlReflowStraighten', props: { dataset: 'moons', round: 1, particles: 30, showPaths: true } },
    },
    {
      kind: 'mcq',
      prompt: 'What does one round of reflow change about the model?',
      choices: [
        'The distribution of generated samples, which becomes closer to the data distribution.',
        'The joint pairing of noise with data used as training targets, while the marginal at t = 1 stays the same in theory.',
        'The ODE solver, replacing Euler with a second-order method.',
        'The noise schedule α_t and σ_t used to build x_t.',
      ],
      answer: 1,
      why: String.raw`Reflow rewires *which* $\mathbf x_1$ each $\mathbf x_0$ is sent to. Because $\mathbf Z_1$ has the same law as $\mathbf X_1$, the target marginal is untouched in theory — in practice it drifts slightly, since the simulated $\mathbf Z_1$ carries the previous model's error. The interpolation $\mathbf x_t=(1-t)\mathbf x_0+t\mathbf x_1$ and the solver are the same before and after.`,
    },
    {
      kind: 'widget',
      title: 'Why rewiring can only help',
      body: String.raw`Three guarantees from Liu, Gong & Liu (2023), in order of how much they buy you.`,
      widget: {
        type: 'StepReveal',
        props: {
          steps: [
            String.raw`**Marginal preservation.** $\mathbf v^\star$ generates the probability path $p_t$ of $\mathbf x_t=(1-t)\mathbf X_0+t\mathbf X_1$ (that is the continuity-equation argument of flow matching). At $t=1$ this is the data law, so $\mathbf Z_1\overset{d}{=}\mathbf X_1$: reflow is free in distribution.`,
            String.raw`**Reduced transport cost.** For *every* convex $c$, $\mathbb E\,c(\mathbf Z_1-\mathbf X_0)\le\mathbb E\,c(\mathbf X_1-\mathbf X_0)$. One inequality, all costs at once — the rectified coupling is never worse than the one it came from.`,
            String.raw`Sketch: $\mathbf Z_1-\mathbf X_0=\int_0^1\mathbf v^\star(\mathbf Z_t,t)\,dt$ is an *average* of displacements $\mathbf X_1-\mathbf X_0$, taken conditional on position. Jensen's inequality then pushes $c$ inside the average.`,
            String.raw`**Straightening.** Liu et al. bound the best straightness over the first $K$ rounds: $\min_{k\le K}S(\mathbf Z^k)\le O(1/K)$. That is a guarantee about the best round so far, not a statement that every round improves, and the $1/K$ rate is slow — in practice the first round or two is where the gain lives.`,
            String.raw`What is *not* guaranteed: convergence to the optimal-transport coupling. Reflow lowers convex costs monotonically; it need not reach the minimum.`,
          ],
          notes: ['The free lunch.', '', 'Jensen is the whole proof.', 'Diminishing returns are real.', 'A common misreading.'],
        },
      },
    },
    {
      kind: 'truefalse',
      prompt: String.raw`Repeating reflow enough times is guaranteed to produce the optimal-transport coupling between the noise and the data.`,
      answer: false,
      why: String.raw`Reflow guarantees that each round does not *increase* any convex transport cost, and that the best straightness over $K$ rounds is $O(1/K)$ — neither statement implies the limit is the OT coupling. (The OT coupling *is* a fixed point worth knowing about: for the quadratic cost its displacement interpolation consists of straight, non-crossing segments, so its rectified flow is perfectly straight.) In practice people run one or two rounds, because each round also re-injects the previous model's simulation error.`,
    },
    {
      kind: 'explain',
      title: 'The error that accumulates',
      body: String.raw`Round $k+1$ is trained on samples produced by model $k$. Whatever model $k$ got wrong becomes *ground truth* for its successor, and there is no mechanism to notice. So the picture is a trade:
- **Straightness improves**, so few-step and one-step sampling get much better.
- **Full-budget sample quality degrades slightly** with each round, because the training set is now synthetic.

This is why rectified flow is usually run as: train a good round-0 model, do **one** reflow, then *distil* — fit a one-step student $\mathbf x_0\mapsto\hat{\mathbf z}_1$ directly on the pairs. Distillation on a straight flow is easy, which is the point: the teacher's answer is almost a linear function of the input. **InstaFlow** (Liu et al., 2024) applied exactly this pipeline to Stable Diffusion to get a one-step text-to-image model.`,
    },
    {
      kind: 'order',
      prompt: 'Order the stages of the rectified-flow pipeline that ends in a one-step generator.',
      steps: [
        String.raw`Train a flow-matching model on the independent coupling $(\mathbf X_0,\mathbf X_1)$`,
        String.raw`Integrate its ODE accurately from many noise draws to get pairs $(\mathbf X_0,\mathbf Z_1)$`,
        String.raw`Retrain flow matching on those pairs — the 2-rectified flow`,
        String.raw`Distil the 2-rectified flow into a one-step map $\mathbf x_0\mapsto\hat{\mathbf z}_1$`,
        String.raw`Sample with a single network call`,
      ],
      why: String.raw`Simulation happens between training runs, not inside them — it is offline and embarrassingly parallel. Distilling last matters: a near-straight teacher makes the student's regression target almost linear in $\mathbf x_0$, which is why distilling a *curved* diffusion model into one step is much harder.`,
    },
    {
      kind: 'explain',
      title: 'Straightening without simulating: minibatch OT',
      body: String.raw`Reflow needs a trained model before it can improve the coupling. An alternative fixes the coupling *during* training: inside each minibatch of $B$ noise samples and $B$ data samples, solve the small assignment problem
$$\min_{\pi\in\Pi_B}\ \sum_{i}\big\|\mathbf x_1^{\pi(i)}-\mathbf x_0^{i}\big\|^2$$
with the Hungarian algorithm or Sinkhorn, and pair the points accordingly before building $\mathbf x_t$. This is **minibatch OT flow matching** (Pooladian et al., 2023; Tong et al., 2024): cheap, single-stage, and it straightens noticeably.

The catch is honest and well known: the minibatch OT plan is a **biased** estimate of the full OT plan. As $B$ grows the bias shrinks but the assignment cost grows; at image scale, with $B$ in the hundreds against a dataset of millions, two randomly drawn batches barely overlap, and the gain over the independent coupling shrinks.`,
    },
    {
      kind: 'fill',
      prompt: String.raw`Reflow replaces the ___ coupling with pairs $(\mathbf x_0,\mathbf z_1)$ obtained by ___ the current flow. The law of $\mathbf z_1$ ___ that of the data, and the expected squared transport cost ___ .`,
      bank: ['independent', 'optimal-transport', 'simulating', 'inverting', 'matches', 'differs from', 'does not increase', 'is driven to zero'],
      answer: ['independent', 'simulating', 'matches', 'does not increase'],
      why: String.raw`The new pairing comes from integrating the ODE forward (not inverting anything). Marginal preservation gives $\mathbf Z_1\overset{d}{=}\mathbf X_1$ exactly in theory, and the convex-cost theorem gives a non-increase — not a decrease to zero, since the cost is bounded below by the true OT cost.`,
    },
    {
      kind: 'match',
      prompt: 'Match each way of getting few-step samples to what it costs.',
      pairs: [
        ['Higher-order ODE solver (Heun, DPM-Solver)', 'No retraining, but extra network calls per step and a floor set by the path curvature'],
        ['Reflow', 'A second full training run plus offline simulation; straightens the flow itself'],
        ['Minibatch OT coupling', 'Single training run; a biased approximation of the true coupling, weaker at large scale'],
        ['One-step distillation', 'A student model fitted to teacher outputs; cheapest at inference, loses some fidelity'],
      ],
      why: String.raw`The first acts only on the sampler, so it can never beat the curvature of the underlying trajectories. The middle two change what the trajectories *are*. Distillation abandons the ODE entirely and simply memorises its input–output map — fastest, and the most lossy.`,
    },
    {
      kind: 'explain',
      title: 'Rectified flow in production',
      body: String.raw`**Stable Diffusion 3** (Esser et al., 2024) is trained as a rectified flow: the straight interpolation $\mathbf x_t=(1-t)\mathbf x_0+t\mathbf x_1$, the velocity target $\mathbf x_1-\mathbf x_0$, no reflow round. Two reported findings matter for anyone training one.

First, **where you spend $t$ matters**. Uniform $t$ wastes capacity near the endpoints, where the regression problem is easy. They sample $t$ from a **logit-normal** distribution, concentrating training on mid-range times where the velocity is genuinely ambiguous, and found this beat uniform sampling in a large systematic comparison of formulations.

Second, a straight *training path* does not make the *learned* flow straight: the marginal field still curves, so SD3-class models are normally sampled with a few tens of solver steps. Rectified-flow training is attractive for its simplicity, stability and scaling behaviour as much as for step count, and few-step generation at that scale is usually obtained by additional distillation (for example [consistency models](@ml/consistency-models) and related methods).`,
    },
    {
      kind: 'multi',
      prompt: 'Which statements about rectified flow are correct? (Select all that apply.)',
      choices: [
        'If a flow is perfectly straight, one Euler step reproduces the exact ODE solution.',
        'Reflow preserves the generated marginal distribution in theory, but not exactly in practice.',
        'Reflow improves straightness, and the improvement per round grows as rounds accumulate.',
        'Choosing a better noise-to-data coupling can reduce curvature without changing the solver.',
      ],
      answers: [0, 1, 3],
      why: String.raw`Straight means constant velocity, so $\mathbf z_1=\mathbf z_0+\mathbf v(\mathbf z_0,0)$ is exact. In practice each round trains on the previous model's samples, so its errors are inherited. The straightness guarantee is only $O(1/K)$ for the best of $K$ rounds — slow, diminishing returns, which is why one or two rounds is standard (nothing says the gain per round grows). And curvature is a property of the trajectories, fixed by the coupling, entirely upstream of the integrator.`,
    },
    {
      kind: 'explain',
      title: 'Key takeaways',
      body: String.raw`- Curved trajectories, not weak solvers, are what force many sampling steps; curvature comes from the **coupling**, since crossing straight lines must be averaged into bent ones.
- Straightness $S=\int_0^1\mathbb E\|(\mathbf Z_1-\mathbf Z_0)-\mathbf v^\star(\mathbf Z_t,t)\|^2dt$; $S=0$ makes one Euler step exact.
- **Reflow**: simulate the flow, keep the pairs $(\mathbf x_0,\mathbf z_1)$, retrain. Guarantees: same marginals, no convex transport cost increases, best straightness over $K$ rounds $O(1/K)$.
- Reflow does *not* converge to the OT coupling, and each round inherits the previous model's error — one or two rounds, then distil.
- **Minibatch OT** straightens in a single stage but is a biased coupling, weaker as the dataset dwarfs the batch.
- SD3 trains with the rectified-flow interpolation plus logit-normal $t$ sampling; simplicity and scaling, not only step count.`,
    },
  ],
  references: [
    { authors: 'X. Liu, C. Gong & Q. Liu', title: 'Flow Straight and Fast: Learning to Generate and Transfer Data with Rectified Flow', year: 2023, venue: 'ICLR', url: 'https://arxiv.org/abs/2209.03003' },
    { authors: 'X. Liu, X. Zhang, J. Ma, J. Peng & Q. Liu', title: 'InstaFlow: One Step is Enough for High-Quality Diffusion-Based Text-to-Image Generation', year: 2024, venue: 'ICLR', url: 'https://arxiv.org/abs/2309.06380' },
    { authors: 'P. Esser et al.', title: 'Scaling Rectified Flow Transformers for High-Resolution Image Synthesis', year: 2024, venue: 'ICML', url: 'https://arxiv.org/abs/2403.03206' },
    { authors: 'A.-A. Pooladian, H. Ben-Hamu, C. Domingo-Enrich, B. Amos, Y. Lipman & R. T. Q. Chen', title: 'Multisample Flow Matching: Straightening Flows with Minibatch Couplings', year: 2023, venue: 'ICML', url: 'https://arxiv.org/abs/2304.14772' },
    { authors: 'A. Tong, K. Fatras, N. Malkin, G. Huguet, Y. Zhang, J. Rector-Brooks, G. Wolf & Y. Bengio', title: 'Improving and Generalizing Flow-Based Generative Models with Minibatch Optimal Transport', year: 2024, venue: 'TMLR', url: 'https://arxiv.org/abs/2302.00482' },
  ],
} satisfies LessonContent;
