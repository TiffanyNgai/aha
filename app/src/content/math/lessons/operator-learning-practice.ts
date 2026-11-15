import type { LessonContent } from '../../types';

// Schematic shapes only — deliberately unlabelled axes, no benchmark numbers.
const panelA = (() => {
  // Log–log sketch: top of the box = large error, right of the box = finer grid.
  const X0 = 30, X1 = 148, Y0 = 36, Y1 = 112;
  const yFloor = Y1 - 18;
  const p = (f: (t: number) => number) =>
    Array.from({ length: 41 }, (_, i) => {
      const t = i / 40;
      return `${i ? 'L' : 'M'}${(X0 + t * (X1 - X0)).toFixed(1)},${f(t).toFixed(1)}`;
    }).join('');
  return {
    X0, X1, Y0, Y1, yFloor,
    classical: p((t) => Y0 + 6 + t * (Y1 - 4 - (Y0 + 6))),
    learned: p((t) => Y0 + 20 + (yFloor - (Y0 + 20)) * (1 - Math.exp(-4.5 * t))),
  };
})();
const trendSvg = `<svg viewBox="0 0 320 206" xmlns="http://www.w3.org/2000/svg" font-family="inherit">
  <text x="160" y="12" font-size="9" text-anchor="middle" fill="var(--muted)">schematic shapes only — no axis values, because the numbers are problem-specific</text>

  <text x="30" y="28" font-size="8.5" fill="var(--fg)">error vs grid resolution (log–log)</text>
  <rect x="${panelA.X0}" y="${panelA.Y0}" width="${panelA.X1 - panelA.X0}" height="${panelA.Y1 - panelA.Y0}" fill="none" stroke="var(--grid)"/>
  <path d="${panelA.classical}" fill="none" stroke="var(--c1)" stroke-width="1.6"/>
  <path d="${panelA.learned}" fill="none" stroke="var(--c2)" stroke-width="1.8"/>
  <text x="34" y="46" font-size="7.5" fill="var(--c1)">classical solver: slope −p</text>
  <text x="34" y="56" font-size="7.5" fill="var(--c2)">learned operator: plateau</text>
  <line x1="${panelA.X0}" y1="${panelA.yFloor}" x2="${panelA.X1}" y2="${panelA.yFloor}" stroke="var(--c5)" stroke-width="0.6" stroke-dasharray="2 2"/>
  <text x="${panelA.X1}" y="${panelA.yFloor - 3}" font-size="7" text-anchor="end" fill="var(--c5)">floor set by data + architecture</text>
  <text x="${panelA.X0}" y="${panelA.Y1 + 10}" font-size="7.5" fill="var(--muted)">finer grid →</text>

  <text x="186" y="28" font-size="8.5" fill="var(--fg)">error vs training-set size (log–log)</text>
  <rect x="186" y="36" width="122" height="76" fill="none" stroke="var(--grid)"/>
  <path d="M190,48 L306,96" fill="none" stroke="var(--c4)" stroke-width="1.8"/>
  <text x="192" y="64" font-size="7.5" fill="var(--c4)">shallow slope (varies:</text>
  <text x="192" y="74" font-size="7.5" fill="var(--c4)">with problem)</text>
  <text x="192" y="84" font-size="7.5" fill="var(--c4)">diminishing returns</text>
  <text x="186" y="122" font-size="7.5" fill="var(--muted)">more solved examples →</text>

  <text x="14" y="140" font-size="8.5" fill="var(--fg)">the cost ledger people usually quote, and the one they usually hide</text>
  <rect x="14" y="146" width="140" height="48" rx="4" fill="none" stroke="var(--c1)"/>
  <text x="22" y="160" font-size="8" fill="var(--c1)">quoted: T_solve / T_infer</text>
  <text x="22" y="172" font-size="7.5" fill="var(--muted)">one classical solve vs one</text>
  <text x="22" y="182" font-size="7.5" fill="var(--muted)">forward pass. Reported: orders of magnitude.</text>
  <rect x="166" y="146" width="142" height="48" rx="4" fill="none" stroke="var(--c5)"/>
  <text x="174" y="160" font-size="8" fill="var(--c5)">omitted: data + training</text>
  <text x="174" y="172" font-size="7.5" fill="var(--muted)">thousands of classical solves,</text>
  <text x="174" y="182" font-size="7.5" fill="var(--muted)">plus GPU-hours, paid up front.</text>
</svg>`;

export default {
  cards: [
    {
      kind: 'explain',
      title: 'The gap between a table and a deployment',
      body: String.raw`Papers on operator learning report a relative $L^2$ error on a held-out set drawn from the same distribution as the training data, on the same geometry, at one or two resolutions, for a single forward prediction.

A deployment asks a different set of questions. What happens on an input rougher than anything you trained on? What is the error after a hundred autoregressive steps? What did the dataset cost? Would a well-tuned classical solver with a coarse mesh have been good enough?

This lesson is the part that benchmark tables leave out. None of it says operator learning does not work. It says the claims have shapes, and it is worth knowing their shapes before you build on them.`,
    },
    {
      kind: 'explain',
      title: 'Data: the bill nobody puts on the slide',
      body: String.raw`Training pairs $(a_i, u_i)$ come from the classical solver you were hoping to replace. Typical published datasets hold $10^3$–$10^4$ examples, and each is a full simulation.

Just as important, and less often discussed: **the input distribution is part of the specification**. You must choose it before you generate anything.

- A Gaussian random field with a covariance of your choosing — the length scale you pick becomes the roughness the model can handle.
- A parametric family: Reynolds numbers in a band, obstacle shapes from a catalogue, boundary data from a few modes.

The trained operator is an approximation **on that distribution and nowhere else**. This is not a soft warning: it is the compactness hypothesis of [the approximation theorem](@math/operator-universal-approximation) restated in engineering terms. Widening the distribution after the fact means regenerating the dataset.`,
    },
    {
      kind: 'numeric',
      prompt: String.raw`A training set needs 10,000 simulations, each taking 90 s on one CPU core. How many **core-hours** does generating the data cost?`,
      answer: 250,
      tolerance: 1,
      unit: 'core-hours',
      why: String.raw`$10{,}000 \times 90\ \text{s} = 900{,}000\ \text{s} = 250$ core-hours. That is modest for this toy timing — but scale the solve to 15 minutes, as a 3D turbulent case easily does, and the same dataset costs 2500 core-hours before a single gradient step. Data generation, not GPU time, is usually the dominant line item.`,
    },
    {
      kind: 'explain',
      title: 'Targets and the loss',
      body: String.raw`The standard objective is the **relative** $L^2$ error, averaged over inputs:

$$\mathcal{L}(\theta) = \frac{1}{n}\sum_{i=1}^{n} \frac{\|\mathcal{G}_\theta(a_i) - u_i\|_{L^2(D)}}{\|u_i\|_{L^2(D)}}.$$

Three things it is doing:

- **Relative**, because solution magnitudes vary by orders of magnitude across a dataset and an absolute loss would quietly optimise only the largest ones.
- **$L^2$ over the domain**, not pointwise MSE at scattered points, so the quantity being minimised is a norm on functions — the thing the operator framing says you care about.
- **Averaged over inputs**, which means the reported error is a mean. A mean relative error that looks excellent is compatible with a long tail of inputs where the model is badly wrong, and the tail is what breaks a pipeline. Always look at the error distribution, not just its mean.`,
    },
    {
      kind: 'widget',
      title: 'What you are competing with',
      body: String.raw`Before judging a surrogate, look at the incumbent. This is piecewise-linear finite elements for $-u'' = f$. Slide the mesh: the maximum error falls like $h^2$, predictably, with a proof behind it, and you can make it as small as you are willing to pay for.

That is the property a learned operator does **not** have. There is no knob you can turn to buy accuracy at run time, and no a-priori bound relating the error to anything you control. The exchange on offer is: give up guaranteed convergence, gain a constant-time evaluation.

Try the 'wiggle' load on a coarse mesh to see the classical failure mode too — under-resolution. It is honest about it: refine and it goes away.`,
      widget: { type: 'MathFemGalerkin', props: { load: 'const', n: 4 } },
    },
    {
      kind: 'explain',
      title: 'Error versus resolution: the plateau',
      body: String.raw`Evaluate a trained neural operator at increasing resolution and measure against high-resolution reference solutions. The curve has a characteristic shape: it improves while the grid is too coarse to resolve what the model represents, then **flattens**.

The plateau is the model's own approximation error — set by the architecture ($k_{\max}$, width, depth), by the amount and resolution of the training data, and by optimisation. Refining the mesh does not touch any of those.

This is the sharp practical meaning of the distinction made in the [intro](@math/operator-learning-intro): discretisation invariance says the output *converges*, and the plateau is what it converges to. A paper that reports "error unchanged across resolutions" is reporting the plateau, which is simultaneously the good news (resolution independence) and the bad news (no convergence).

A corollary worth internalising: for a problem needing six-digit accuracy, operator learning is currently not a candidate at all.`,
    },
    {
      kind: 'widget',
      title: 'Two curves and a ledger',
      body: String.raw`Axis values are deliberately absent — the shapes are general, the numbers are problem-specific and copying someone else's would be meaningless.

**Left**: classical error falls on a straight log–log line with the method's convergence order; the learned error flattens onto a floor.

**Right**: error against dataset size is also roughly a power law, with a problem-dependent exponent. Subramanian et al. (NeurIPS 2023), studying transfer and scaling for neural operators across PDE families, report error that falls roughly as a power law in training-set size, with exponents that depend on the PDE family and the model; they also report that pretraining across PDE families lowers the data needed when fine-tuning. Treat any single exponent as problem-specific.

**Bottom**: the two halves of the cost ledger. The left box is what gets quoted; the right box is what gets paid.`,
      widget: { type: 'SvgDiagram', props: { svg: trendSvg } },
    },
    {
      kind: 'mcq',
      prompt: String.raw`A trained FNO reports the same relative error at $64^2$, $128^2$ and $256^2$. What does this tell you?`,
      choices: [
        'The architecture is behaving as a grid-free operator, and the error has reached a floor set by data, architecture and training.',
        'The model has converged to the true solution operator.',
        'The model would be even more accurate at $512^2$.',
        'The training data must have been generated at all three resolutions.',
      ],
      answer: 0,
      why: String.raw`A flat error across resolutions is the signature of discretisation invariance *plus* a plateau: the output stops changing, and what it has stopped at is the model's own approximation error. It is not convergence to the truth — the constant value is exactly the gap that refining cannot close — and nothing suggests a finer grid would help, since the floor is independent of the mesh.`,
    },
    {
      kind: 'explain',
      title: 'Physics-informed training: what it fixes',
      body: String.raw`Adding the PDE residual of the prediction to the loss,

$$\mathcal{L} = \underbrace{\mathcal{L}_{\text{data}}}_{\text{solved pairs}} + \lambda\,\underbrace{\big\|\,\mathcal{N}[\mathcal{G}_\theta(a)]\,\big\|^2}_{\text{PDE residual}} + \text{boundary terms},$$

is the main lever for cutting data cost. Wang, Wang & Perdikaris (*Science Advances*, 2021) do this for DeepONet, where the trunk is differentiable in $y$ so the residual is available anywhere by automatic differentiation; PINO (Li et al., 2024) does the analogous thing for the FNO, computing derivatives spectrally or by finite differences on the grid.

What it buys: far fewer solved examples, and predictions that respect the equation at points the data never covered.

What it does not buy: the residual is an *additional* objective, not a constraint, and nothing guarantees it is small at test time. Balancing $\lambda$ against the data term is genuinely difficult, and residual losses have well-documented optimisation pathologies — Krishnapriyan et al. (NeurIPS 2021) show PINN training failing on problems whose solutions the same network can represent perfectly. Treat it as a strong regulariser, not as a correctness guarantee.`,
    },
    {
      kind: 'truefalse',
      prompt: String.raw`Adding a PDE-residual term to the training loss guarantees the trained operator's predictions satisfy the PDE.`,
      answer: false,
      why: String.raw`It is a penalty in a non-convex objective, minimised approximately, on a finite set of collocation points, traded off against the data term by a hand-chosen $\lambda$. A small *training* residual does not imply a small test residual, and optimisation can stall on the residual term even when the architecture could represent the solution exactly. It reduces data requirements and improves physical plausibility; it does not certify anything.`,
    },
    {
      kind: 'explain',
      title: 'Where it genuinely wins',
      body: String.raw`Three conditions, and you want all three.

1. **Many queries over one fixed input distribution.** Monte Carlo uncertainty quantification, Bayesian inversion, design optimisation, real-time control. Thousands of forward solves amortise the dataset.
2. **Moderate accuracy is enough.** A few percent relative error, used to screen candidates or propagate uncertainty, with a classical solver kept for the final answer.
3. **The input distribution is genuinely fixed and can be sampled.** You can generate the data, and deployment inputs will look like it.

And the honest version of the speedup claim. Over $Q$ queries the ratio is

$$\text{speedup} = \frac{Q\,T_{\text{solve}}}{N_{\text{train}}T_{\text{solve}} + T_{\text{fit}} + Q\,T_{\text{infer}}},$$

which tends to $T_{\text{solve}}/T_{\text{infer}}$ only as $Q \to \infty$. A headline "1000× faster" is that limit. At the break-even $Q$ the speedup is exactly $1$, and below it the method is slower than doing nothing clever. Quote the ratio *with* $N_{\text{train}}$ included, or say plainly that you have excluded it.`,
    },
    {
      kind: 'multi',
      prompt: 'Which of these would make you trust a reported speedup figure more?',
      choices: [
        'The number of training simulations and their individual cost are stated.',
        'The break-even query count is computed.',
        'The error is reported as a distribution over test inputs, not only as a mean.',
        'The comparison is against the best-tuned classical solver at the accuracy the surrogate actually achieves.',
        'The surrogate is evaluated on a finer grid than it was trained on.',
      ],
      answers: [0, 1, 2, 3],
      why: String.raw`The first two restore the hidden half of the ledger; the third exposes the tail that a mean hides; the fourth is the fairest comparison, since a classical solver asked for only a few percent accuracy can run on a much coarser mesh than the reference run and is often far faster than the headline suggests. Fine-grid evaluation is a nice demonstration of discretisation invariance, but it says nothing about cost.`,
    },
    {
      kind: 'explain',
      title: 'Where it does not work',
      body: String.raw`- **Out-of-distribution inputs.** The failure mode is not a loud error but a plausible, smooth, wrong field. A model trained on Gaussian random fields of one length scale degrades on rougher ones; one trained in a Reynolds-number band does not extrapolate out of it. There is no mechanism that would make it right there, and no built-in signal that it is wrong — which is why uncertainty estimates and a classical spot-check matter.
- **Sharp shocks and discontinuities.** A spectral representation truncated at $k_{\max}$ handles these badly: the deleted modes are exactly what a discontinuity needs, and the result is ringing. Fine-tuned architectures help; the difficulty is structural.
- **Long autoregressive rollouts.** Learn a one-step operator $u^n \mapsto u^{n+1}$ and apply it repeatedly, and each step feeds its own error back in as input — compounding, and now out of distribution, since the model never trained on its own outputs. Errors typically grow faster than linearly and rollouts can become unstable. Training on multi-step losses, or learning the whole space–time map in one shot, mitigates it but does not remove it.
- **Tight accuracy requirements**, per the plateau above.`,
    },
    {
      kind: 'match',
      prompt: 'Match each failure with its underlying cause.',
      pairs: [
        ['Error stops improving on finer grids', 'approximation floor from architecture, data and optimisation'],
        ['Smooth, confident, wrong output on a rough input', 'the test input is outside the training distribution'],
        ['Ringing near a discontinuity', 'spectral truncation discards the modes a shock needs'],
        ['Blow-up after many time steps', 'autoregressive error compounding and self-generated inputs'],
        ['Reported 1000× speedup not seen in practice', 'data-generation and training cost excluded from the ratio'],
      ],
      why: String.raw`Each cause sits in a different place: the architecture, the data distribution, the representation, the deployment loop, and the accounting. Diagnosing which one you are hitting determines the fix — more capacity, more or broader data, a different representation, a multi-step loss, or an honest ledger.`,
    },
    {
      kind: 'order',
      prompt: 'Order an evaluation protocol that would survive a sceptical reviewer.',
      steps: [
        String.raw`State the input distribution explicitly and hold out a test set drawn from it.`,
        String.raw`Report the full distribution of relative errors on that set, not only the mean.`,
        String.raw`Evaluate at a finer resolution than training, against high-resolution reference solutions.`,
        String.raw`Evaluate on inputs deliberately outside the training distribution, and report where accuracy collapses.`,
        String.raw`For time-dependent problems, report error as a function of rollout length.`,
        String.raw`Give the full cost ledger: data-generation solves, training time, inference time, and the break-even query count.`,
      ],
      why: String.raw`The order moves from the easiest claim to the hardest. In-distribution mean error is what everyone reports; the error distribution, the fine-grid test and the out-of-distribution test are what tell you whether the model is usable; and the ledger is what tells you whether it was worth building. Skipping the last three is how a good benchmark number becomes a bad deployment.`,
    },
    {
      kind: 'fill',
      prompt: String.raw`The cost of operator learning is dominated by ___ generation, which is why speedups must be quoted with a break-even ___ count. Refining the grid does not reduce error past a ___ set by architecture and data, and the most dangerous failure is a confident wrong answer on an input that is out of ___.`,
      bank: ['data', 'query', 'plateau', 'distribution', 'gradient', 'batch', 'residual', 'range'],
      answer: ['data', 'query', 'plateau', 'distribution'],
      why: String.raw`Those four are the sober summary of the unit: you pay in classical solves, you are repaid per query, you cannot buy accuracy at run time, and the guarantee — such as it is — holds only on the distribution you trained on.`,
    },
    {
      kind: 'explain',
      title: 'Key takeaways',
      body: String.raw`- **Data dominates the bill.** Every training example is a classical solve, and the input distribution you choose when generating it becomes the only region where the model means anything.
- Train on **relative $L^2$**, and report the error *distribution*, not just its mean.
- **Error vs resolution plateaus.** Discretisation invariance says the output converges; the plateau is what it converges to. There is no run-time accuracy knob, so tight-tolerance work stays classical.
- **Error vs data** typically falls as a power law with a problem-dependent exponent, so each extra factor of ten in data buys a diminishing return.
- **Physics-informed losses** cut data requirements and improve plausibility. They are penalties, not constraints, and bring their own optimisation difficulties.
- **Wins**: many-query loops — UQ, Bayesian inversion, design search, real-time control — over a fixed distribution at moderate accuracy.
- **Losses**: out-of-distribution inputs (silent failure), sharp shocks, long autoregressive rollouts, high-accuracy requirements.
- **Quote speedups honestly**: $Q\,T_{\text{solve}} / (N_{\text{train}}T_{\text{solve}} + T_{\text{fit}} + Q\,T_{\text{infer}})$, and give the break-even $Q$. The headline ratio is the $Q \to \infty$ limit.`,
    },
  ],
  references: [
    { authors: 'N. Kovachki, Z. Li, B. Liu, K. Azizzadenesheli, K. Bhattacharya, A. Stuart, A. Anandkumar', title: 'Neural Operator: Learning Maps Between Function Spaces with Applications to PDEs', year: 2023, venue: 'Journal of Machine Learning Research 24(89), 1–97', detail: '§7 (numerical experiments, error and cost)' },
    { authors: 'L. Lu, X. Meng, S. Cai, Z. Mao, S. Goswami, Z. Zhang, G. E. Karniadakis', title: 'A comprehensive and fair comparison of two neural operators (with practical extensions) based on FAIR data', year: 2022, venue: 'Computer Methods in Applied Mechanics and Engineering 393, 114778' },
    { authors: 'M. V. de Hoop, D. Z. Huang, E. Qian, A. M. Stuart', title: 'The Cost-Accuracy Trade-Off in Operator Learning with Neural Networks', year: 2022, venue: 'Journal of Machine Learning 1(3), 299–341' },
    { authors: 'S. Subramanian, P. Harrington, K. Keutzer, W. Bhimji, D. Morozov, M. Mahoney, A. Gholami', title: 'Towards Foundation Models for Scientific Machine Learning: Characterizing Scaling and Transfer Behavior', year: 2023, venue: 'Advances in Neural Information Processing Systems 36' },
    { authors: 'Z. Li, H. Zheng, N. Kovachki, D. Jin, H. Chen, B. Liu, K. Azizzadenesheli, A. Anandkumar', title: 'Physics-Informed Neural Operator for Learning Partial Differential Equations', year: 2024, venue: 'ACM/IMS Journal of Data Science 1(3), Article 9' },
    { authors: 'S. Wang, H. Wang, P. Perdikaris', title: 'Learning the solution operator of parametric partial differential equations with physics-informed DeepONets', year: 2021, venue: 'Science Advances 7(40), eabi8605' },
    { authors: 'A. S. Krishnapriyan, A. Gholami, S. Zhe, R. M. Kirby, M. W. Mahoney', title: 'Characterizing possible failure modes in physics-informed neural networks', year: 2021, venue: 'Advances in Neural Information Processing Systems 34' },
  ],
} satisfies LessonContent;
