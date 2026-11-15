import type { LessonContent } from '../../types';

const LAPLACE_STEPS = [
  String.raw`**Start from the thing you already have.** Train the network normally with weight decay. That is MAP estimation: $\theta_{\text{MAP}}=\arg\max_\theta\big[\log p(\mathcal D\mid\theta)+\log p(\theta)\big]$, with the $\ell_2$ penalty playing the role of a Gaussian prior $\mathcal N(0,\alpha^{-1}I)$.`,
  String.raw`**Taylor-expand the log posterior around it.** Write $\mathcal E(\theta)=-\log p(\theta\mid\mathcal D)$. At a mode the gradient vanishes, so to second order
$$\mathcal E(\theta)\approx\mathcal E(\theta_{\text{MAP}})+\tfrac12(\theta-\theta_{\text{MAP}})^\top H\,(\theta-\theta_{\text{MAP}}),\qquad H=\nabla^2\mathcal E\big|_{\theta_{\text{MAP}}}.$$`,
  String.raw`**Exponentiate.** A quadratic in the exponent is a Gaussian:
$$p(\theta\mid\mathcal D)\approx\mathcal N\big(\theta;\ \theta_{\text{MAP}},\ H^{-1}\big).$$
That is the **Laplace approximation** (MacKay, 1992). No retraining, no new objective, no sampling — a curvature computation bolted onto a finished model.`,
  String.raw`**The Hessian is the problem.** For $P$ parameters $H$ is $P\times P$: a ResNet-50 would need $10^{15}$ entries. It is also **not positive definite** in general — deep loss surfaces have negative curvature directions, and a Gaussian needs a PSD precision.`,
  String.raw`**Both problems, one fix.** Use the **generalized Gauss–Newton** matrix $G=\sum_i J_i^\top\Lambda_i J_i+\alpha I$, where $J_i=\partial f_\theta(x_i)/\partial\theta$ and $\Lambda_i$ is the Hessian of the loss in *output* space. $G$ is PSD by construction, and equals the Fisher information for the usual likelihoods. Then approximate its *structure*: diagonal, Kronecker-factored (K-FAC), or low-rank.`,
  String.raw`**Or shrink the problem instead.** **Last-layer Laplace**: treat only the output layer's weights as random and the features as fixed. Now $P$ is a few thousand, $G$ is exact and small, and the model is exactly Bayesian linear regression on learned features. Cheap, and surprisingly effective.`,
  String.raw`**Predict by linearizing, not by sampling.** Sampling weights from $\mathcal N(\theta_{\text{MAP}},H^{-1})$ and running them through the net works badly: the Gaussian is only valid locally, and a sampled $\theta$ is often a worse network. Instead linearize the *function*, $f_\theta(x)\approx f_{\theta_{\text{MAP}}}(x)+J(x)(\theta-\theta_{\text{MAP}})$, giving a closed-form predictive
$$f(x)\sim\mathcal N\big(f_{\theta_{\text{MAP}}}(x),\ J(x)H^{-1}J(x)^\top\big).$$
This **linearized Laplace** is consistently the better of the two (Daxberger et al., 2021), and it is what the widget above computes exactly.`,
  String.raw`**Then tune the prior precision.** $\alpha$ controls the whole scale of the uncertainty, and the result is genuinely sensitive to it. Fit it by maximizing the Laplace estimate of the marginal likelihood, or on a validation set. Reporting Laplace uncertainties without tuning $\alpha$ is reporting an arbitrary number.`,
];

export default {
  cards: [
    {
      kind: 'explain',
      title: 'Confident about nothing',
      body: String.raw`Feed a trained image classifier a photograph of static, or a digit rotated 90°, or an X-ray from a scanner it has never seen. It will usually return a class with 99% confidence. Worse, this is not a bug you can train away: for a plain ReLU network, scaling any input far enough from the data drives the softmax confidence towards **1** — you can prove it from the piecewise-linear structure (Hein, Andriushchenko & Bitterwolf, 2019).

A point estimate $\theta_{\text{MAP}}$ has exactly one opinion about every input and no way to say "I have not seen anything like this". What is missing is **epistemic** uncertainty: uncertainty about the *model*, which should be large where data is absent and shrink as data arrives.

Bayesian deep learning is the attempt to supply it. This lesson is about which of its methods actually deliver, because the honest answer is narrower than the literature's enthusiasm suggests — and the method with the best track record is the one with the least Bayesian pedigree.`,
    },
    {
      kind: 'recall',
      title: 'Uncertainty and calibration',
      points: [
        String.raw`**Aleatoric** uncertainty is noise in the data; more data does not reduce it. **Epistemic** uncertainty is model ignorance; more data should.`,
        String.raw`**Calibrated** means: among predictions made with confidence $p$, a fraction $p$ are correct. Measured by reliability diagrams and ECE, scored by NLL and Brier.`,
        'Modern deep nets are systematically over-confident (Guo et al., 2017); temperature scaling fixes much of it in-distribution without changing accuracy.',
        'Calibration measured in-distribution usually degrades under distribution shift — which is exactly when you needed it.',
      ],
      link: 'ml/calibration-uncertainty',
    },
    {
      kind: 'explain',
      title: 'What a Bayesian neural network would be',
      body: String.raw`Put a prior $p(\theta)$ on the weights, condition on data, and predict by **marginalizing** rather than by picking a winner:
$$p(y\mid x,\mathcal D)=\int p(y\mid x,\theta)\,p(\theta\mid\mathcal D)\,d\theta\;\approx\;\frac1S\sum_{s=1}^{S}p\big(y\mid x,\theta^{(s)}\big).$$
Where the plausible $\theta$'s agree, the predictive is sharp. Where they disagree — away from the data — it is wide. That is epistemic uncertainty, for free, from one integral.

Now the obstacles, which are worse than for any posterior in this unit:

- **Dimension.** $\theta$ has $10^7$–$10^{11}$ components. [MCMC](@ml/sampling-for-ml) cannot explore that, and [mean-field VI](@ml/variational-inference) covers it only with a diagonal Gaussian.
- **Symmetry.** Permuting the hidden units of a layer with $h$ units gives $h!$ weight vectors computing the *identical* function. The posterior has an astronomical number of exactly equivalent modes, so "exploring the posterior" in weight space is largely a waste of effort — what matters is the distribution over **functions**.
- **Priors nobody can defend.** What does $\mathcal N(0,\alpha^{-1}I)$ on convolution kernels mean? Weight decay is not a considered belief about functions, and the induced function-space prior is mostly unexamined.
- **The cold-posterior effect.** Empirically, tempering the posterior as $p(\theta\mid\mathcal D)^{1/T}$ with $T<1$ — i.e. deliberately trusting it *less* — often predicts better than $T=1$ (Wenzel et al., 2020). Something in the standard setup (prior, likelihood under data augmentation, or the sampler) is misspecified, and this is still argued about.

Wilson & Izmailov (2020) make the useful reframing: the goal is not to find or describe the true posterior. It is to **average predictions over several genuinely different good solutions**. Ask of each method below: does it do that?`,
    },
    {
      kind: 'widget',
      title: 'Four methods, one dataset, one gap',
      body: String.raw`The model is a one-hidden-layer network with frozen random features and a trained output layer, so every method is computed in closed form — nothing here depends on a training run going well. The data come in two clusters with an obvious **gap**, and the honest test is simple: *does the band widen in the gap and outside the data?* The readout gives you the 2σ width at three places, so it is a number rather than an impression.

Step through the buttons and watch that one number. **map**: a point estimate — one answer everywhere, band = the noise level. **ensemble**: $0.25$ on data, $0.49$ in the gap, $0.65$ extrapolating. **laplace**: $0.27\to0.53\to0.68$. **dropout**: $0.45\to0.30\to0.46$ — the only one of the four whose band does not grow where the data stops.`,
      widget: {
        type: 'MlBnnPredictive', props: { method: 'ensemble', members: 8 },
        caption: 'Any method can produce error bars. The question is whether they grow where your knowledge stops.',
      },
    },
    {
      kind: 'mcq',
      prompt: 'What is the single most important property to demand of an epistemic uncertainty estimate?',
      choices: [
        'That it is large on average, so the model is never over-confident',
        'That it grows where training data is absent and shrinks as relevant data arrives',
        'That it is derived from a mathematically Bayesian procedure',
        'That it can be computed from a single trained network',
      ],
      answer: 1,
      why: String.raw`Epistemic uncertainty is *about the data you have*, so its defining behaviour is responsiveness to data coverage — wide off-distribution, narrowing as evidence accumulates. A uniformly inflated band passes no test that matters: it is just a worse-calibrated model with a wider interval. Bayesian provenance is a means and not the property itself (deep ensembles have little of it and perform best), and cheapness is a practical preference, not a criterion of correctness.`,
    },
    {
      kind: 'explain',
      title: 'Method 1: variational inference over weights',
      body: String.raw`The textbook route. Put a factorized Gaussian over every weight, $q_\phi(\theta)=\prod_j\mathcal N(\theta_j;\mu_j,\sigma_j^2)$, and maximize the ELBO with the [reparameterization trick](@ml/reparameterization-trick). This is **Bayes by Backprop** (Blundell et al., 2015): each weight gets a mean and a standard deviation, so the network has twice the parameters and each forward pass samples them.

It is the most principled option and the one people reach for first. It is also, in practice, the most disappointing:

- **Mean field cannot represent what matters.** Weights in a network are enormously correlated; a diagonal Gaussian is blind to all of it, and reverse-KL [under-dispersion](@ml/variational-inference) makes the problem worse.
- **One mode only.** The ELBO is optimized around a single basin, so there is no averaging over genuinely different solutions.
- **It is hard to train.** Gradient noise from sampling weights slows optimization, and accuracy typically lands below a plain network trained the same way.

Natural-gradient and structured-covariance variants (noisy Adam/K-FAC, VOGN) close much of the accuracy gap and are far better engineered, but they are considerably more involved than the alternatives below for an uncertainty quality that is at best comparable.`,
    },
    {
      kind: 'widget',
      title: 'Method 2: the Laplace approximation',
      body: String.raw`The cheapest respectable method: do nothing differently during training, then fit a Gaussian to the curvature at the solution you already have.`,
      widget: { type: 'StepReveal', props: { steps: LAPLACE_STEPS, notes: ['MAP training is already step one.', 'Second-order Taylor at the mode.', 'A Gaussian posterior, post hoc.', 'P×P and not PSD.', 'Use the GGN, approximate its structure.', 'Or just the last layer.', 'Linearize rather than sample weights.', 'Tune the prior precision, or the scale is arbitrary.'] } },
    },
    {
      kind: 'numeric',
      prompt: String.raw`Last-layer Laplace on a model with one output weight $w$. The data give $\sum_i \phi_i^2=80$ with observation-noise variance $\sigma_n^2=0.25$, and the prior is $\mathcal N(0,\alpha^{-1})$ with $\alpha=1$. The posterior precision is $\sum_i\phi_i^2/\sigma_n^2+\alpha$. What is the posterior standard deviation of $w$? (3 decimals)`,
      answer: 0.056,
      tolerance: 0.002,
      why: String.raw`Precision $=80/0.25+1=321$, so the standard deviation is $1/\sqrt{321}=0.0558$. Two things are worth noticing. The data term dominates the prior by a factor of 320, which is why $\alpha$ matters much less here than in a network where most directions are barely constrained — there the prior sets the uncertainty almost alone. And the precision grows linearly with the amount of data, so the posterior width shrinks as $1/\sqrt n$: this estimate behaves the way epistemic uncertainty is supposed to.`,
    },
    {
      kind: 'explain',
      title: 'Method 3: MC dropout, and why it oversells',
      body: String.raw`The most cited and the most oversold. Train with [dropout](@ml/regularization) as usual, then — the only new idea — **leave dropout on at test time**, run $S$ forward passes, and use the spread of the predictions as uncertainty. Gal & Ghahramani (2016) showed this corresponds to variational inference with a particular (Bernoulli mixture) approximate posterior. Two lines of code, no retraining, no extra parameters.

Here is what the widget shows and the analysis confirms. For a last layer with weights $w$ and features $\phi(x)$, dropping units at rate $p$ gives a predictive variance of roughly
$$\frac{p}{1-p}\sum_j w_j^2\,\phi_j(x)^2.$$
Read that carefully: it is controlled by **the dropout rate you happened to pick**, and it is only weakly a function of $x$. It does not know where your data was.

The consequences are real, not pedantic:
- **Here it does not widen in the gap — it narrows.** Read the 2σ widths off the widget. The ensemble goes $0.25$ on data $\to0.49$ in the gap $\to0.65$ extrapolating; Laplace goes $0.27\to0.53\to0.68$. MC dropout at $p=0.3$ goes $0.45\to\mathbf{0.30}\to0.46$: *narrower* where it knows least, because $\sum_j w_j^2\phi_j(x)^2$ happens to dip there (this is one random-feature model and one seed; the point is that nothing in the formula forces a widening). It is not tracking data coverage.
- **It does not vanish with more data.** At a fixed rate $p$, collect ten times the data and the dropout spread is essentially unchanged. Epistemic uncertainty that ignores evidence is not epistemic uncertainty. (Making it shrink requires tuning or annealing $p$, which almost nobody does.)
- **It degrades badly under shift.** In the largest careful comparison to date (Ovadia et al., 2019), MC dropout was clearly behind ensembles, and its quality fell as the test distribution moved away from training.

None of this makes it worthless. It is nearly free, it is better than a bare softmax, and for ranking which inputs are hard it often works. But reported as "Bayesian uncertainty from our network", it claims more than it delivers.`,
    },
    {
      kind: 'truefalse',
      prompt: 'Holding the dropout rate fixed, MC dropout’s predictive uncertainty shrinks towards zero as the training set grows large.',
      answer: false,
      why: String.raw`The spread is approximately $\frac{p}{1-p}\sum_j w_j^2\phi_j(x)^2$: it is a function of the dropout rate and the learned weights, not of how much data supported them. More data changes $w$ but does not drive the variance to zero. A genuine epistemic posterior concentrates as $n$ grows — Laplace's precision, for instance, grows linearly in $n$ — which is the behaviour MC dropout at a fixed rate does not have.`,
    },
    {
      kind: 'explain',
      title: 'Methods 4 and 5: SWAG, and the one that wins',
      body: String.raw`**SWAG** (Maddox et al., 2019) notices that SGD already explores a basin for you. Run training to convergence, then keep averaging: record the iterates, and fit a Gaussian whose mean is the running average (SWA) and whose covariance is a diagonal plus low-rank fit to the deviations. Sample from it, update the batch-norm statistics, average the predictions. **One training run**, a modest bookkeeping overhead, and a real improvement over a single network. It still describes a single basin.

**Deep ensembles** (Lakshminarayanan, Pritzel & Blundell, 2017) are embarrassingly simple: train $M$ copies of the same network from different random initializations and average their predictive distributions. No prior, no ELBO, no curvature. It was not even presented as a Bayesian method.

It is also, consistently, the best-performing one. In Ovadia et al.'s (2019) benchmark across image, text and genomics tasks and a range of shifts, deep ensembles gave the best accuracy, NLL and calibration, and — the part that matters — degraded most gracefully as the test distribution moved. Most of the benefit arrives by $M\approx5$.

Why does the unprincipled method win? Because different random initializations converge to **functionally different** solutions in different basins, so averaging them is genuine marginalization over distinct modes, which is exactly what every single-basin method (VI, Laplace, SWAG, MC dropout) cannot do. Wilson & Izmailov (2020) argue on these grounds that deep ensembles are a *better* posterior approximation than methods with more Bayesian paperwork, and **MultiSWAG** — a SWAG fit around each ensemble member — combines the two and does better still.

The cost is honest and plain: $M\times$ the training compute and $M\times$ the inference cost. Cheaper imitations (snapshot ensembles from one cyclic-schedule run, BatchEnsemble's shared weights with rank-1 per-member factors) recover part of the gain for a fraction of the cost, and lose some of it because their members are less diverse.`,
    },
    {
      kind: 'multi',
      prompt: 'Which of these statements are supported by the empirical evidence discussed here?',
      choices: [
        'Deep ensembles are usually the strongest baseline for calibration under distribution shift',
        'Most of a deep ensemble’s benefit is already present at about five members',
        'MC dropout gives epistemic uncertainty that reliably grows far from the training data',
        'Linearized Laplace predictions generally beat sampling weights from the Laplace Gaussian',
        'Methods that explore a single loss basin cannot average over functionally distinct solutions',
      ],
      answers: [0, 1, 3, 4],
      why: String.raw`Ovadia et al. (2019) found ensembles best and most robust to shift, with diminishing returns after roughly five members. Daxberger et al. (2021) found the linearized (GGN) predictive clearly better than sampling weights, because the Gaussian is only trustworthy very near the mode. The single-basin point is definitional: VI, Laplace, SWAG and MC dropout all describe one mode, which is precisely what ensembles do not. MC dropout is the claim that fails: its spread is set by the dropout rate and is close to flat in the input.`,
    },
    {
      kind: 'explain',
      title: 'An honest scorecard',
      body: String.raw`What to actually use, in order of how much the evidence supports it.

**Use these.**
- **Deep ensembles** ($M=5$). Best calibration, best accuracy, best behaviour under shift, trivially parallel, no new hyperparameters. Expensive; worth it when the uncertainty matters.
- **Temperature scaling** on a single net. Not epistemic at all — it rescales confidences, nothing more — but it is almost free and, *in-distribution*, it closes most of the calibration gap. Always do this, including on top of an ensemble.
- **Linearized last-layer Laplace**. Post-hoc, one run, closed-form predictive, well-behaved asymptotics. Fixes the ReLU over-confidence pathology (Kristiadi, Hein & Hennig, 2020). Needs the prior precision tuned. The best cheap *epistemic* option.
- **SWAG / MultiSWAG**. One run, better than a single net, and MultiSWAG (several SWAG runs from different initializations) matches or beats a plain deep ensemble at higher cost.

**Use with your eyes open.**
- **MC dropout**. Nearly free and better than nothing; useful for *ranking* uncertain inputs. Do not present it as a calibrated posterior, and do not expect it to widen off-distribution or shrink with data.
- **Mean-field VI over weights**. Principled, hard to train, usually loses accuracy, and single-basin. Structured variants are better and much more work.
- **SG-MCMC**. Beautiful theory, and in deep nets the step sizes are never small enough for the guarantees to apply. See the [sampling lesson](@ml/sampling-for-ml).

**And know what none of them do.** Every method here assumes test data resemble training data. Under genuine distribution shift all of them degrade; ensembles just degrade more slowly. For a guarantee rather than an estimate, you need a different tool: [conformal prediction](@ml/calibration-uncertainty) gives finite-sample coverage for any model — under an exchangeability assumption that shift also breaks.`,
    },
    {
      kind: 'match',
      prompt: 'Match each method to the honest one-line verdict.',
      pairs: [
        ['Deep ensembles', 'Least Bayesian, best results; averages over functionally distinct basins; M× cost'],
        ['Linearized last-layer Laplace', 'Post-hoc and closed-form; the best cheap epistemic option, if you tune the prior precision'],
        ['SWAG', 'A Gaussian fitted to the SGD trajectory: one run, one basin, a real improvement'],
        ['MC dropout', 'Nearly free; spread set by the dropout rate, so it barely tracks the data'],
        ['Mean-field VI over weights', 'Most principled, hardest to train, single-basin and under-dispersed'],
      ],
      why: String.raw`The pattern across the five is the same question asked each time: how many genuinely different functions does this method average over? Ensembles average over several, everything else over one — and the Bayesian credentials of a method turn out to predict its performance much less well than that count does.`,
    },
    {
      kind: 'order',
      prompt: 'Order a defensible uncertainty pipeline for a deployed classifier, cheapest useful step first.',
      steps: [
        'Hold out a validation set that was never used for training or model selection',
        'Fit a temperature on validation NLL and report accuracy, NLL and ECE with a reliability diagram',
        'Train additional members from different random initializations and average their predictive distributions',
        'Re-check calibration of the ensemble, and re-fit the temperature on top of it',
        'Evaluate on deliberately shifted data (corruptions, a different site, a later time period) and report the degradation',
        'Wrap the final model in split conformal prediction to get sets with finite-sample marginal coverage',
      ],
      why: String.raw`Clean held-out data comes first, or every later number is contaminated. Temperature scaling is almost free and should be exhausted before paying for an ensemble. Ensembling changes the confidences, so the temperature must be re-fitted afterwards rather than carried over. The shift evaluation is the step most often skipped and the one that most often changes the conclusion — in-distribution calibration is not evidence of anything outside it.`,
    },
    {
      kind: 'fill',
      prompt: String.raw`The exact Bayesian predictive requires ___ over the weight posterior. The ___ approximation fits a Gaussian to the curvature at the MAP solution, post hoc. MC dropout's spread is governed by the dropout ___ rather than by the data. Across careful benchmarks, ___ give the best calibration under distribution shift.`,
      bank: ['marginalizing', 'Laplace', 'rate', 'deep ensembles', 'MC dropout', 'temperature', 'maximizing'],
      answer: ['marginalizing', 'Laplace', 'rate', 'deep ensembles'],
      why: String.raw`Marginalizing — not maximizing — is the defining Bayesian operation, and it is what ensembles approximate crudely but across several basins, which turns out to matter more than approximating it precisely within one. The dropout-rate dependence is exactly why MC dropout's bands do not widen where your data runs out.`,
    },
    {
      kind: 'explain',
      title: 'Key takeaways',
      body: String.raw`- A point-estimate network has **no epistemic uncertainty**; a plain ReLU net's confidence even tends to 1 far from the data (Hein et al., 2019).
- The Bayesian answer is to **marginalize**: $p(y\mid x,\mathcal D)=\int p(y\mid x,\theta)p(\theta\mid\mathcal D)d\theta$. In a network this is blocked by dimension, by factorially many symmetric modes, by indefensible weight priors, and by the unresolved cold-posterior effect.
- The test that matters: does the uncertainty **grow where data is absent** and **shrink as data arrives**?
- **Deep ensembles** ($M\approx5$) pass it best and degrade most gracefully under shift (Ovadia et al., 2019), because different initializations find functionally different solutions. Cost: $M\times$ everything.
- **Linearized last-layer Laplace** is the best cheap epistemic option: post-hoc, closed-form, prior precision must be tuned. **SWAG** is the best one-run option; **MultiSWAG** combines both.
- **MC dropout** is nearly free and genuinely oversold: its spread is set by the dropout rate, barely widens off-distribution, and does not shrink with more data.
- **Mean-field VI over weights** is the most principled and the least rewarding in practice; **SG-MCMC** in deep nets does not deliver the guarantees its name implies.
- **Temperature scaling** is not epistemic but is almost free and fixes most in-distribution miscalibration — do it anyway, including on top of an ensemble. And evaluate under shift, or you have measured nothing.`,
    },
  ],
  references: [
    { authors: 'B. Lakshminarayanan, A. Pritzel & C. Blundell', title: 'Simple and Scalable Predictive Uncertainty Estimation using Deep Ensembles', year: 2017, venue: 'NeurIPS', url: 'https://arxiv.org/abs/1612.01474' },
    { authors: 'Y. Ovadia, E. Fertig, J. Ren, Z. Nado, D. Sculley, S. Nowozin, J. V. Dillon, B. Lakshminarayanan & J. Snoek', title: 'Can You Trust Your Model’s Uncertainty? Evaluating Predictive Uncertainty Under Dataset Shift', year: 2019, venue: 'NeurIPS', url: 'https://arxiv.org/abs/1906.02530' },
    { authors: 'E. Daxberger, A. Kristiadi, A. Immer, R. Eschenhagen, M. Bauer & P. Hennig', title: 'Laplace Redux — Effortless Bayesian Deep Learning', year: 2021, venue: 'NeurIPS', url: 'https://arxiv.org/abs/2106.14806' },
    { authors: 'W. J. Maddox, P. Izmailov, T. Garipov, D. P. Vetrov & A. G. Wilson', title: 'A Simple Baseline for Bayesian Uncertainty in Deep Learning (SWAG)', year: 2019, venue: 'NeurIPS', url: 'https://arxiv.org/abs/1902.02476' },
    { authors: 'A. G. Wilson & P. Izmailov', title: 'Bayesian Deep Learning and a Probabilistic Perspective of Generalization', year: 2020, venue: 'NeurIPS', url: 'https://arxiv.org/abs/2002.08791' },
    { authors: 'M. Hein, M. Andriushchenko & J. Bitterwolf', title: 'Why ReLU Networks Yield High-Confidence Predictions Far Away from the Training Data and How to Mitigate the Problem', year: 2019, venue: 'CVPR', url: 'https://arxiv.org/abs/1812.05720' },
    { authors: 'C. Guo, G. Pleiss, Y. Sun & K. Q. Weinberger', title: 'On Calibration of Modern Neural Networks', year: 2017, venue: 'ICML', url: 'https://arxiv.org/abs/1706.04599' },
    { authors: 'C. Blundell, J. Cornebise, K. Kavukcuoglu & D. Wierstra', title: 'Weight Uncertainty in Neural Networks', year: 2015, venue: 'ICML', url: 'https://arxiv.org/abs/1505.05424' },
    { authors: 'A. Kristiadi, M. Hein & P. Hennig', title: 'Being Bayesian, Even Just a Bit, Fixes Overconfidence in ReLU Networks', year: 2020, venue: 'ICML', url: 'https://arxiv.org/abs/2002.10118' },
    { authors: 'D. J. C. MacKay', title: 'A Practical Bayesian Framework for Backpropagation Networks', year: 1992, venue: 'Neural Computation 4(3), 448–472' },
    { authors: 'F. Wenzel et al.', title: 'How Good is the Bayes Posterior in Deep Neural Networks Really?', year: 2020, venue: 'ICML', url: 'https://arxiv.org/abs/2002.02405' },
    { authors: 'Y. Gal & Z. Ghahramani', title: 'Dropout as a Bayesian Approximation: Representing Model Uncertainty in Deep Learning', year: 2016, venue: 'ICML', url: 'https://arxiv.org/abs/1506.02142' },
  ],
} satisfies LessonContent;
