import type { LessonContent } from '../../types';

const blockers: [string, string][] = [
  ['No ground truth', 'Nobody can label “a good summary”, so we optimise a proxy'],
  ['Contamination', 'The test set is on the web; so is the training corpus'],
  ['Cost of evidence', 'A clean ablation at frontier scale is unaffordable'],
  ['Non-identifiability', 'Many explanations fit the same behaviour equally well'],
  ['Noise & weak baselines', 'The claimed gain is inside the seed-to-seed spread'],
];
const blockerSvg = `<svg viewBox="0 0 320 ${26 + blockers.length * 32}" xmlns="http://www.w3.org/2000/svg" font-family="inherit">
  <text x="6" y="12" font-size="10" fill="var(--fg)">Five blockers that are not “we need a cleverer idea”</text>
  ${blockers.map(([k, v], i) => {
    const y = 20 + i * 32;
    return `<g>
      <rect x="6" y="${y}" width="308" height="28" rx="4" fill="var(--surface)" stroke="var(--c5)" stroke-width="1"/>
      <rect x="6" y="${y}" width="4" height="28" rx="2" fill="var(--c5)">
        <animate attributeName="opacity" values="0.35;1;0.35" dur="3s" begin="${i * 0.4}s" repeatCount="indefinite"/>
      </rect>
      <text x="16" y="${y + 12}" font-size="9.5" fill="var(--c5)">${k}</text>
      <text x="16" y="${y + 23}" font-size="8.5" fill="var(--muted)">${v}</text>
    </g>`;
  }).join('')}
</svg>`;

const tried: [string, string, string][] = [
  ['Saliency maps', 'Explain a prediction by pixel importance', 'Failed sanity checks (2018–19)'],
  ['Attention weights', 'Read attention as the explanation', 'Contested; not unique (2019)'],
  ['EWC & friends', 'Penalise changes to important weights', 'Stalls over long task sequences'],
  ['n-gram decontamination', 'Delete test strings from training data', 'Misses paraphrase and translation'],
  ['Learned reward models', 'Replace the missing ground truth', 'Optimised against → reward hacking'],
  ['Sparse autoencoders', 'Decompose activations into features', 'Partly works; no ground truth yet'],
];
const triedSvg = `<svg viewBox="0 0 320 ${26 + tried.length * 31}" xmlns="http://www.w3.org/2000/svg" font-family="inherit">
  <text x="6" y="12" font-size="10" fill="var(--fg)">Tried → what happened</text>
  ${tried.map(([a, b, c], i) => {
    const y = 20 + i * 31;
    const ok = i === 5;
    return `<g>
      <rect x="6" y="${y}" width="308" height="27" rx="4" fill="var(--surface)" stroke="var(--grid)" stroke-width="1"/>
      <text x="12" y="${y + 11}" font-size="9" fill="var(--c2)">${a}</text>
      <text x="12" y="${y + 22}" font-size="8" fill="var(--muted)">${b}</text>
      <text x="308" y="${y + 17}" text-anchor="end" font-size="8" fill="${ok ? 'var(--c1)' : 'var(--c5)'}">${c}</text>
    </g>`;
  }).join('')}
</svg>`;

export default {
  cards: [
    {
      kind: 'explain',
      title: 'Not "we need a cleverer idea"',
      body: String.raw`When a problem stays open for twenty years, the tempting explanation is that nobody has had the right insight yet. For most of the problems in the previous lesson, that is not what is going on.

The blockers are more boring and more stubborn: there is no ground truth to train against, the evaluation is already compromised, the experiment that would settle the question costs more than the research budget, or several incompatible explanations fit the evidence equally well and no measurement distinguishes them.

This lesson takes each blocker, says what it is, and — the part that matters — names what has been **tried**, what stalled, and why.`,
      widget: { type: 'SvgDiagram', props: { svg: blockerSvg } },
    },
    {
      kind: 'explain',
      title: 'Blocker 1: there is no ground truth for what we want',
      body: String.raw`Supervised learning needs a target. For "is this a cat", the target exists and people agree on it. For "is this a good summary", "is this answer helpful", "is this generated image realistic", there is no measurement in the world to compare against. So the field substitutes a **proxy**: something cheap and automatic that correlates with what we want.

Every proxy has been found wanting once it became a target.

- **BLEU**, the machine-translation metric, compares n-gram overlap with reference translations. **Callison-Burch, Osborne and Koehn (2006, EACL)** showed that a higher BLEU score does not imply a better translation when systems differ in kind. **Reiter (2018, Computational Linguistics)** reviewed the accumulated validity evidence and concluded BLEU is defensible for comparing similar MT systems in aggregate and is **not** validated for scoring individual outputs or for natural-language generation in general. It is still widely reported.
- **FID**, the standard image-generation metric, is the Fréchet distance between Inception network features of real and generated images. **Chong and Forsyth (2020, CVPR)** showed it is biased by the number of samples, so two papers using different sample counts are not comparable. **Kynkäänniemi et al. (2023, ICLR)** showed FID is strongly influenced by how well the generated images match ImageNet *class* statistics, which has little to do with perceptual quality.
- **Learned reward models** are the deliberate attempt to fix this: train a network to predict human preference, then optimise against it. This replaces a missing ground truth with an approximation that the policy is explicitly searching for the flaws in.`,
    },
    {
      kind: 'widget',
      title: 'Why optimising a proxy degrades it',
      body: String.raw`This is Goodhart's law with a mechanism attached. Follow the chain for a learned reward model.`,
      widget: {
        type: 'StepReveal',
        props: {
          steps: [
            String.raw`**What we want:** some true quality $Q(x)$ of an output — helpfulness, correctness, beauty. Not measurable.`,
            String.raw`**What we have:** human comparisons. Noisy, inconsistent between raters, and systematically biased (longer answers and agreeable answers are preferred, on average).`,
            String.raw`**What we fit:** a reward model $R_\phi(x)$ trained on those comparisons. On the *data distribution it was trained on*, $R_\phi$ correlates well with $Q$. That is all the training guarantees.`,
            String.raw`**What we then do:** optimise the policy to maximise $R_\phi$. This deliberately moves the policy's outputs **off** the distribution where $R_\phi$ was validated, toward the region where $R_\phi$ is highest — which includes everywhere $R_\phi$ is wrongly high.`,
            String.raw`**The result:** reward goes up, true quality eventually goes down. The standard patch is a KL penalty pinning the policy near the original model, which limits the damage by limiting the optimisation — you buy safety by not optimising very hard.`,
            String.raw`**Why it is not a bug to be fixed:** the gap is between $R_\phi$ and an unmeasurable $Q$. You cannot shrink an error you cannot evaluate. This is why [RL on verifiable rewards](@ml/rl-for-reasoning) worked where preference RL plateaued: a unit test *is* $Q$, not a model of it.`,
          ],
          notes: [
            '', 'Sharma et al. (2024) traced sycophancy to exactly this rater bias.',
            'Validity on-distribution is the only thing an i.i.d. training guarantee gives you.',
            'This is adversarial search against your own evaluator, by construction.',
            'The KL coefficient is, in effect, a dial between “cautious” and “exploits the reward model”.',
            'Which also explains why the gains concentrate in maths and code.',
          ],
        },
      },
    },
    {
      kind: 'mcq',
      prompt: 'A team reports that their new model achieves a much better score on a learned reward model than the baseline, and concludes it produces better answers. What is the strongest objection?',
      choices: [
        'Reward models are always inaccurate, so the comparison is worthless',
        'The new model was optimised against that reward model, so its score is partly a measure of how well it found the reward model’s errors; a comparison needs either held-out human judgement or a reward model the policy was not trained on',
        'The baseline should have been trained for longer',
        'Reward scores cannot be compared between models of different sizes',
      ],
      answer: 1,
      why: String.raw`The problem is not inaccuracy in general — it is that optimisation against an evaluator makes that evaluator's score an unreliable estimate for the thing being optimised, while remaining fine for the thing that was not. Saying reward models are "always worthless" overstates it; they are informative precisely when the system was not trained to climb them.`,
    },
    {
      kind: 'explain',
      title: 'Blocker 2: the evaluation is already compromised',
      body: String.raw`Measuring whether a benchmark leaked into a training corpus requires three things you usually do not have: access to the training corpus, a definition of "leaked", and a way to check at the scale of trillions of tokens.

What has been tried:
- **Exact-match decontamination** — delete any training document sharing a long n-gram with a test item. Standard practice; defeated by paraphrase, translation, reformatting and discussion of the answer.
- **Canaries** — insert unique random strings into a dataset and later check whether a model reproduces them. This detects verbatim memorisation of the canary, not of the dataset.
- **Membership inference** — ask the model directly. As the [previous lesson](@ml/frontier-open-problems) described, **Duan et al. (2024)** found these attacks near chance on large models.
- **Fresh benchmarks** — the only method that works. **Recht et al. (2019, ICML)** rebuilt the ImageNet test set from scratch following the original collection protocol; every classifier lost roughly 11 to 14 points of accuracy, although the *ranking* of models was preserved. **Zhang et al. (2024)** did the same for grade-school maths and found drops for some model families and not others.

So the field knows how to get a clean number. It costs a new dataset each time, and that dataset starts decaying the moment it is published.`,
    },
    {
      kind: 'truefalse',
      prompt: String.raw`The Recht et al. (2019) result — every ImageNet classifier scored substantially lower on a freshly collected test set — means the published rankings between those models were wrong.`,
      answer: false,
      why: String.raw`Accuracy dropped on the new test set, but the ordering was largely preserved: better models on the old test set were still better on the new one. That is the useful distinction. A shift in the test data moved *absolute* numbers ("95% accurate") much more than *relative* ones ("A beats B"). Whether the same holds for contamination is a separate, open question.`,
    },
    {
      kind: 'explain',
      title: 'Blocker 3: the decisive experiment is unaffordable',
      body: String.raw`In most sciences, if two explanations disagree you run the experiment. In frontier-scale ML you often cannot, because the experiment is a training run.

The standard response is to ablate at small scale and assume the conclusion transfers. Sometimes it does not, and the field's own history is the proof. **Kaplan et al. (2020)** derived a compute-optimal recipe that implied scaling parameters much faster than data; it guided major training runs for about two years. **Hoffmann et al. (2022)** re-ran the sweep more carefully and found parameters and tokens should scale roughly in proportion, meaning the previous generation of models had been substantially under-trained. Nobody had caught it earlier because re-running the sweep is itself enormously expensive.

The story has a second instalment. **Besiroglu et al. (2024)** attempted to replicate Chinchilla's own fit from the published data and reported that one of the three estimation approaches had errors, giving noticeably different optimal ratios and implausibly tight confidence intervals. A replication of a scaling study — using only the numbers in the paper — found problems in the correction to the previous study.

There is a genuine partial fix. **Yang and Hu (2021)** and **Yang et al. (2021)** derived a parameterisation (μP) in which the optimal learning rate and related hyperparameters are stable as width grows, so you can tune on a small model and transfer the settings to a large one. That is an actual theory-driven reduction in the cost of evidence, and it is widely used. It covers hyperparameters, not architectural or data decisions.`,
    },
    {
      kind: 'numeric',
      prompt: String.raw`Training compute is approximately $C\approx 6ND$ for $N$ parameters and $D$ training tokens. If you follow a compute-optimal rule where $D$ scales in proportion to $N$, how many times cheaper is an ablation run at one tenth the parameter count?`,
      answer: 100,
      tolerance: 0.5,
      why: String.raw`With $D\propto N$ we get $C\propto N^2$, so dividing $N$ by 10 divides compute by $10^2=100$. This is why everyone ablates small — and the same quadratic is why conclusions from a 100× cheaper run are testing a genuinely different regime. Answering 10 treats $D$ as fixed, which is the non-compute-optimal setting.`,
    },
    {
      kind: 'explain',
      title: 'Blocker 4: many explanations fit equally well',
      body: String.raw`A quantity is **non-identifiable** when the data cannot distinguish between different values of it. Interpretability is riddled with this: the network's behaviour constrains its internal description much less tightly than it looks.

- **Attention weights.** The obvious reading is that a high attention weight means "this token mattered". **Jain and Wallace (2019, NAACL)** found that for many trained models you can construct *different* attention distributions giving the *same* prediction, so the weights do not uniquely explain the output. **Wiegreffe and Pinter (2019, EMNLP)** replied that this depends on what you mean by explanation, and that adversarially constructed distributions are not the ones the model actually produces. The debate was never resolved; both positions are defensible, which is itself the point.
- **Saliency maps.** **Adebayo et al. (2018, NeurIPS)** ran a devastatingly simple test: randomise the model's weights and recompute the saliency map. Several popular methods produced nearly the same picture, meaning they were largely reflecting the input image rather than the model. **Hooker et al. (2019, NeurIPS)** added a retraining-based benchmark and found several methods no better than a random ranking of pixels.
- **Sparse autoencoders.** The modern approach, and better grounded — but the dictionary size, the sparsity coefficient and the random seed are all free, and there is no ground-truth feature list to score against. Follow-up work in 2025 reported that SAEs trained on the same model and data but with different random seeds can share only a minority of their features (**Paulo and Belrose, 2025**), and that on one benchmark of concept detection and steering, SAEs trailed simple baselines (**Wu et al., 2025, ICML, AxBench**). Both are single studies on particular models and settings. Treat the approach as promising and unsettled.

What ties these together: an explanation is only as good as the test that could falsify it, and for "what is this network computing" we mostly lack the test.`,
    },
    {
      kind: 'match',
      prompt: 'Match each attempted solution to the specific reason it stalled.',
      pairs: [
        ['Exact n-gram decontamination', 'Catches verbatim copies but not paraphrases or translations'],
        ['Elastic weight consolidation', 'Constraints accumulate until the network can no longer learn'],
        ['Saliency maps', 'Outputs barely change when the model’s weights are randomised'],
        ['Learned reward models', 'The policy is optimised to find exactly where they are wrong'],
        ['Ablating at small scale', 'The regime being tested differs from the one being claimed'],
      ],
      why: String.raw`Each of these was a reasonable idea that failed for a reason specific to it, not from lack of effort. Knowing *which* failure mode applies tells you what a real fix would have to do — and a method that dodges one of these failures usually walks into another.`,
    },
    {
      kind: 'explain',
      title: 'Blocker 5: the improvement is inside the noise',
      body: String.raw`The cheapest way to appear to make progress is to compare a carefully tuned new method against a baseline nobody tuned. When somebody checks, a surprising amount of reported progress goes away.

- **Melis, Dyer and Blunsom (2018, ICLR)** tuned a plain LSTM language model with a serious hyperparameter search and found it matched or beat the architectures published after it. The gains had been in the tuning budget.
- **Dacrema, Cremonesi and Jannach (2019, RecSys)** tried to reproduce recent neural recommender papers. Most could not be reproduced at all from what was published; of those that could, most were beaten by simple, properly tuned baselines.
- **Musgrave, Belongie and Lim (2020, ECCV)** evaluated a decade of deep metric learning under one fair protocol with equal tuning and found improvements over much older methods far smaller than claimed.
- **Henderson et al. (2018, AAAI)** showed that in deep reinforcement learning, different random seeds can reverse which algorithm looks better, and that typical papers report too few runs to tell.
- **Agarwal et al. (2021, NeurIPS)** quantified it: with the handful of runs that RL papers can afford, point estimates of aggregate score are badly unreliable. They recommended interquartile means and stratified bootstrap confidence intervals and released tooling for it. This one partly worked — reporting standards in RL measurably improved afterwards.

There is a structural reason this persists. Publishing requires a positive result; tuning your own method harder than the baseline is rewarded, is not misconduct, and is nearly invisible to reviewers.`,
    },
    {
      kind: 'widget',
      title: 'The scoreboard',
      body: String.raw`Six serious attempts at the problems in the previous lesson, and what became of each.`,
      widget: { type: 'SvgDiagram', props: { svg: triedSvg }, caption: 'Only the last is still live as of 2026 — and it is "partly works", not "solved".' },
    },
    {
      kind: 'multi',
      prompt: 'A paper reports that a new architecture beats the previous best by 0.4 points on a standard benchmark. Which follow-up questions would materially change how much you believe it? (Select all that apply.)',
      choices: [
        'How many random seeds were run, and what was the spread across them?',
        'Was the baseline tuned with the same hyperparameter search budget as the new method?',
        'Was the compute per run matched between the two?',
        'Did the authors use a GPU or a TPU?',
        'Is the benchmark old enough that community-level overfitting and contamination are likely?',
      ],
      answers: [0, 1, 2, 4],
      why: String.raw`Seed spread, tuning budget, matched compute and benchmark age are precisely the four channels through which a 0.4-point gap turns out to be nothing (Melis et al. 2018; Henderson et al. 2018; Agarwal et al. 2021; Recht et al. 2019). The hardware brand affects reproducibility details and cost, but does not make a small gap real or fake.`,
    },
    {
      kind: 'explain',
      title: 'What actually broke through, and why',
      body: String.raw`Three things genuinely moved, and in each case the mechanism was the same: somebody **found a real measurement** where there had been a proxy.

1. **Verifiable rewards.** Where a program can mark the answer — unit tests, numerical results, formal proof checkers — the ground-truth problem simply vanishes, and reinforcement learning works. This is the main reason reasoning on maths and code improved sharply in 2024–25 while open-ended writing did not. It is a narrow fix, and honest practitioners describe it that way.
2. **Better statistics for small sample sizes.** Agarwal et al.'s (2021) interval estimates did not need new compute, only a different analysis of runs people were already doing. Cheap methodological fixes are rare and worth noticing.
3. **Hyperparameter transfer (μP).** A theoretical result about infinite-width limits turned into a concrete reduction in the cost of tuning large models. This is the clearest case of theory paying a bill in modern deep learning.

And one that is **partly** working: sparse-autoencoder interpretability. **Templeton et al. (2024)** found features in a production model that could be amplified or suppressed with legible behavioural effects — a causal test, not just a correlation. That is a real advance on saliency maps, and it still has no ground truth to be scored against.`,
    },
    {
      kind: 'fill',
      prompt: String.raw`Reinforcement learning from human preferences plateaus because the reward model is a ___ for an unmeasurable target, and the policy is optimised to find its errors. Reinforcement learning on unit tests does not have this problem because the reward is a ___. Meanwhile, ablation studies are run at small scale because compute grows roughly as the ___ of model size under a compute-optimal rule.`,
      bank: ['proxy', 'prior', 'measurement', 'preference', 'square', 'logarithm'],
      answer: ['proxy', 'measurement', 'square'],
      why: String.raw`Those three words name the three structural blockers in one sentence: a missing target, a real one where you are lucky enough to have it, and the cost curve that stops you checking. $C\approx6ND$ with $D\propto N$ gives $C\propto N^2$.`,
    },
    {
      kind: 'order',
      prompt: 'Order these diagnostics by how much they cost to run, cheapest first.',
      steps: [
        'Re-analyse the published runs with bootstrap confidence intervals instead of point estimates',
        'Re-run the paper’s experiment with five additional random seeds',
        'Re-tune the baseline with the same hyperparameter search budget as the proposed method',
        'Collect a fresh test set following the original dataset’s collection protocol',
        'Repeat the study at full frontier scale to check that the conclusion transfers',
      ],
      why: String.raw`The cheapest checks are the ones that reuse data you already have, and they catch a large share of spurious results — which is the argument for doing them as a matter of routine. The cost rises by orders of magnitude at each step, and the last is usually out of reach for anyone outside a handful of labs. That asymmetry shapes what the field can know.`,
    },
    {
      kind: 'explain',
      title: 'Key takeaways',
      body: String.raw`- The blockers are structural, not a shortage of ideas: no ground truth for the target, a compromised evaluation, an unaffordable decisive experiment, non-identifiable explanations, and effect sizes inside the noise.
- Proxies degrade when optimised, and for a specific reason: optimisation moves outputs off the distribution where the proxy was validated. BLEU (Reiter, 2018), FID (Chong & Forsyth 2020; Kynkäänniemi et al. 2023) and learned reward models are the same story at different scales.
- Fresh test sets are the only reliable decontamination (Recht et al., 2019) — and they cost a new dataset each time. Note the Recht et al. finding: a re-collected test set moved absolute scores far more than rankings.
- Interpretability stalled on non-identifiability: saliency maps survived neither a weight-randomisation sanity check (Adebayo et al., 2018) nor a retraining benchmark (Hooker et al., 2019); attention-as-explanation remains contested (Jain & Wallace 2019; Wiegreffe & Pinter 2019).
- A large share of reported progress disappears against equally tuned baselines (Melis et al. 2018; Dacrema et al. 2019; Musgrave et al. 2020) and inside seed variance (Henderson et al. 2018).
- What broke through did so by replacing a proxy with a real measurement: verifiable rewards, better interval statistics, and μP hyperparameter transfer.`,
    },
  ],
  references: [
    { authors: 'G. Paulo & N. Belrose', title: 'Sparse Autoencoders Trained on the Same Data Learn Different Features', year: 2025, venue: 'arXiv:2501.16615', url: 'https://arxiv.org/abs/2501.16615' },
    { authors: 'Z. Wu, A. Arora, A. Geiger, et al.', title: 'AxBench: Steering LLMs? Even Simple Baselines Outperform Sparse Autoencoders', year: 2025, venue: 'ICML', url: 'https://arxiv.org/abs/2501.17148' },
    { authors: 'E. Reiter', title: 'A Structured Review of the Validity of BLEU', year: 2018, venue: 'Computational Linguistics 44(3), 393–401' },
    { authors: 'J. Adebayo, J. Gilmer, M. Muelly, I. Goodfellow, M. Hardt & B. Kim', title: 'Sanity Checks for Saliency Maps', year: 2018, venue: 'NeurIPS', url: 'https://arxiv.org/abs/1810.03292' },
    { authors: 'B. Recht, R. Roelofs, L. Schmidt & V. Shankar', title: 'Do ImageNet Classifiers Generalize to ImageNet?', year: 2019, venue: 'ICML', url: 'https://arxiv.org/abs/1902.10811' },
    { authors: 'R. Agarwal, M. Schwarzer, P. S. Castro, A. Courville & M. G. Bellemare', title: 'Deep Reinforcement Learning at the Edge of the Statistical Precipice', year: 2021, venue: 'NeurIPS', url: 'https://arxiv.org/abs/2108.13264' },
    { authors: 'G. Yang, E. J. Hu, I. Babuschkin, et al.', title: 'Tensor Programs V: Tuning Large Neural Networks via Zero-Shot Hyperparameter Transfer', year: 2021, venue: 'NeurIPS', url: 'https://arxiv.org/abs/2203.03466' },
  ],
} satisfies LessonContent;
