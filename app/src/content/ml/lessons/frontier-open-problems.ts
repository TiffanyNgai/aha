import type { LessonContent } from '../../types';

const probs: [string, string][] = [
  ['Reliable reasoning', 'Same accuracy when the names and numbers change'],
  ['Sample efficiency', 'Human-level language from ~10⁸ words, not 10¹³'],
  ['Continual learning', 'Learn task 50 without losing task 1 — or plasticity'],
  ['Interpretability', 'Predict an edit’s effect before making it'],
  ['Honest evaluation', 'A score that survives being written down publicly'],
  ['Alignment & control', 'A specification the optimiser cannot satisfy cheaply'],
  ['Calibrated doubt', '“I don’t know” that is right as often as it claims'],
];
const mapSvg = `<svg viewBox="0 0 320 ${30 + probs.length * 30}" xmlns="http://www.w3.org/2000/svg" font-family="inherit">
  <text x="6" y="12" font-size="10" fill="var(--fg)">Open problem → what a solution would look like</text>
  ${probs.map(([p, s], i) => {
    const y = 20 + i * 30;
    return `<g>
      <rect x="6" y="${y}" width="118" height="26" rx="4" fill="var(--surface)" stroke="var(--c5)" stroke-width="1"/>
      <text x="12" y="${y + 16}" font-size="9" fill="var(--fg)">${p}</text>
      <path d="M126 ${y + 13} L 146 ${y + 13}" stroke="var(--c2)" stroke-width="1.4" marker-end=""/>
      <circle cx="146" cy="${y + 13}" r="2.5" fill="var(--c2)">
        <animate attributeName="opacity" values="0.3;1;0.3" dur="2.6s" begin="${i * 0.3}s" repeatCount="indefinite"/>
      </circle>
      <text x="154" y="${y + 16}" font-size="8.5" fill="var(--muted)">${s}</text>
    </g>`;
  }).join('')}
</svg>`;

export default {
  cards: [
    {
      kind: 'explain',
      title: 'The other list',
      body: String.raw`Every field has two lists. One is the things that work, which gets written up and announced. The other is the things that do not, which mostly lives in corridors, reviewer comments and the limitations section nobody reads.

This lesson is the second list for machine learning as of 2026. The rule we will hold ourselves to is the one mathematicians use for open problems: state it precisely enough that **you would recognise a solution if someone handed you one**. "Make models smarter" is not an open problem. "Keep accuracy unchanged when the names and numbers in a word problem are swapped" is.

One of the seven below sounds like a weekend project. It is not.`,
      widget: { type: 'SvgDiagram', props: { svg: mapSvg } },
    },
    {
      kind: 'explain',
      title: '1. Reasoning that does not wobble',
      body: String.raw`Modern systems solve competition mathematics. They also fail on near-identical problems with the surface details changed, which means something other than the reasoning is doing part of the work.

**Mirzadeh et al. (2024, GSM-Symbolic)** took the widely used GSM8K grade-school maths benchmark and rebuilt each question from a template, so they could resample the names and numbers. Performance on the resampled variants was lower on average than on the original questions for the models they tested, and variance across resamplings was large. They then built **GSM-NoOp**, adding one clause that looks relevant but changes nothing — "five of the kiwis were smaller than average" — and reported accuracy drops of up to about 65% across the models tested — the worst case, seen on a small model, not a typical figure.

**Huang et al. (2024, ICLR)** tested the natural fix: let the model check its own work. Without an external signal telling it which answers are wrong, self-correction did not improve accuracy, and often made it worse — the model revises correct answers as readily as incorrect ones.

**The precise open problem.** Build a system whose accuracy on a task is invariant to semantically irrelevant perturbations of the problem statement, and which can tell you, better than chance, which of its own answers are wrong — without an external verifier.`,
    },
    {
      kind: 'mcq',
      prompt: 'A model scores 92% on a maths benchmark and 71% on a template-regenerated version of the same benchmark with different names and numbers. Which conclusion does this evidence actually support?',
      choices: [
        'The model is doing no reasoning at all; it is a lookup table',
        'Part of the 92% comes from something other than solving the problem — memorised items, surface patterns, or both — and the 71% is the better estimate of the capability',
        'The regenerated benchmark is harder, so the comparison is meaningless',
        'The model needs a larger context window',
      ],
      answer: 1,
      why: String.raw`A 21-point gap on problems of the same stated difficulty is evidence that the original score was inflated, not that reasoning is absent — 71% is still far above chance and far above what a lookup table could do. Calling the new set "just harder" is the thing the template construction is designed to rule out: the generator produces items from the same schema. Context length is unrelated.`,
    },
    {
      kind: 'explain',
      title: '2. Learning from an ordinary amount of data',
      body: String.raw`A thirteen-year-old has heard or read on the order of 100 million words. A frontier language model is trained on something like ten trillion tokens — roughly a hundred thousand times more — and is still worse at many things that child can do. That gap is the **sample-efficiency problem**, and it is not closing.

It has a practical edge too. **Villalobos et al. (2024, ICML)** estimated the total stock of public human-written text and projected that compute-optimal training runs would exhaust it somewhere in the late 2020s or early 2030s — a projection with wide error bars, not a measurement. Synthetic data is the obvious patch, and its limits are not understood.

Reinforcement learning has the same problem in sharper form. The **Atari 100k** benchmark restricts an agent to 100,000 environment steps, about two hours of play. **Ye et al. (2021, EfficientZero)** reported performance above the human median there, a real milestone — but it took a learned world model plus heavy search, and the result does not carry over to open-ended environments.

**The precise open problem.** Match a frontier model's performance on a fixed task suite using two orders of magnitude less training data, without distilling from a model that saw more.`,
    },
    {
      kind: 'explain',
      title: '3. Learning something new without losing the old',
      body: String.raw`Train a network on task A, then on task B, and its performance on A collapses. **McCloskey and Cohen (1989)** named this **catastrophic forgetting**; it is still here. The standard workaround is to avoid continual learning entirely: retrain from scratch on all the data, every time. That is expensive, and impossible if the old data is gone.

**Kirkpatrick et al. (2017, PNAS)** proposed elastic weight consolidation — penalise changes to weights the old task was sensitive to, measured by the Fisher information. It helps on small sequences of tasks and degrades over long ones, because the constraints accumulate until nothing can move.

Which points at a second, less obvious failure. **Dohare et al. (2024, Nature)** showed that standard deep-learning methods trained continually lose **plasticity**: over a long sequence of tasks, the network becomes progressively less able to learn *new* things at all, with units saturating and effective rank falling. They proposed continual backpropagation — selectively re-initialising low-utility units — and showed it maintains plasticity in their settings.

**The precise open problem.** A learner that, after 1000 sequential tasks, is as good at task 1 as a fresh model trained only on task 1, and as fast at learning task 1001 as a fresh model — at no more than constant memory per task.`,
    },
    {
      kind: 'truefalse',
      prompt: 'Catastrophic forgetting and loss of plasticity are the same phenomenon described in two ways.',
      answer: false,
      why: String.raw`They are opposite failures of the same system. Forgetting is the network changing *too much*: old knowledge is overwritten. Loss of plasticity is the network being able to change *too little*: it can no longer fit new data. A method that only freezes weights to stop forgetting will make plasticity worse, which is why the two have to be measured separately (Dohare et al., 2024).`,
    },
    {
      kind: 'explain',
      title: '4. Knowing what is inside',
      body: String.raw`**Interpretability** means being able to say what computation a trained network performs, in terms a person can check. We can inspect every weight; that is not the obstacle. The obstacle is that the weights do not come labelled.

The leading approach as of 2026 is **sparse dictionary learning**. The idea rests on **superposition** (**Elhage et al., 2022**): a network with $d$ neurons appears to represent far more than $d$ distinct features by storing them as overlapping directions, tolerable because any given input activates only a few. A **sparse autoencoder** (SAE) is trained to re-express an activation vector as a sparse combination of a large learned dictionary, in the hope that dictionary entries correspond to human-meaningful features. **Bricken et al. (2023)** demonstrated this on a one-layer model and **Templeton et al. (2024)** scaled it to a production model, finding features that could be turned up or down with legible effects on behaviour.

That is real progress and it is not a solution. The dictionary size and sparsity penalty are free choices with no ground truth to set them against; runs that differ only in random seed can find substantially different features (Paulo and Belrose, 2025); and "this feature is interpretable to me" is not a measurement. We will come back to *why* in the next lesson.

**The precise open problem.** Given a trained network and a behaviour, produce an account of the mechanism that lets you predict, before you make it, what a specified edit to the weights will do — and be right.`,
    },
    {
      kind: 'match',
      prompt: 'Match each open problem to the observation that makes it concrete.',
      pairs: [
        ['Reliable reasoning', 'Accuracy falls when an irrelevant clause is added to the question'],
        ['Loss of plasticity', 'After many sequential tasks the network can no longer fit new data'],
        ['Interpretability', 'Two sparse autoencoder runs on the same model find different feature sets'],
        ['Sample efficiency', 'A child reaches fluency on ~10⁸ words; a model needs ~10¹³ tokens'],
        ['Evaluation', 'A freshly written equivalent of a benchmark gives lower scores for some models'],
      ],
      why: String.raw`Each pairing turns a slogan into something measurable, which is the only form in which an open problem is useful. Notice that four of the five are measured by a *gap* between two conditions, not by an absolute number — that is usually how you detect that a reported capability is partly illusory.`,
    },
    {
      kind: 'explain',
      title: '5. Evaluation that is not already broken',
      body: String.raw`A benchmark is a public target, and the field optimises against public targets. Two things then happen.

**Saturation.** MMLU (**Hendrycks et al., 2021**) was designed to be hard across 57 subjects; within a few years top scores were high enough that the remaining gap was dominated by ambiguous and mislabelled items. Each replacement — GPQA (**Rein et al., 2023**), SWE-bench (**Jimenez et al., 2024**), ARC-AGI (**Chollet, 2019**), Humanity's Last Exam (**Phan et al., 2025**) — has had a shorter useful life than the one before.

**Contamination.** Training corpora are scraped from the web; benchmarks are published on the web. **Sainz et al. (2023)** documented how widespread the overlap is and how hard it is to rule out. The usual defence, removing exact n-gram matches, does not catch paraphrases, translations, or discussions of the answer. A cleaner test is to write a *new* benchmark to the same specification: **Zhang et al. (2024)** did this for grade-school maths (GSM1k) and found accuracy drops of up to roughly 13 points for some model families and essentially none for others — which is itself the informative part.

**The precise open problem.** An evaluation protocol that can be published, used repeatedly for years, and still give an unbiased estimate of capability. Private held-out sets help and are not a solution: they decay with every query, and they cannot be audited by anyone outside.`,
    },
    {
      kind: 'multi',
      prompt: 'Which of these are real reasons a published benchmark loses its value over time? (Select all that apply.)',
      choices: [
        'Test items leak into training corpora scraped from the web',
        'Researchers select architectures and hyperparameters by looking at the benchmark, which is a form of fitting to it',
        'The remaining errors concentrate on ambiguous or mislabelled items, so differences stop being meaningful',
        'Benchmarks become invalid after a fixed number of years regardless of use',
        'Published leaderboards create an incentive to report the best of many runs',
      ],
      answers: [0, 1, 2, 4],
      why: String.raw`Leakage, community-level overfitting, label-noise ceilings and selective reporting all degrade a benchmark through *use*. Nothing happens to an unused benchmark sitting in a drawer — which is exactly why held-out and freshly regenerated test sets are the standard remedy, and why the decay is proportional to attention rather than to time.`,
    },
    {
      kind: 'explain',
      title: '6. Saying what you want and getting it',
      body: String.raw`**Alignment** here means the narrow engineering version: making a system's behaviour match the objective its designers intended, rather than the objective they accidentally wrote down. **Amodei et al. (2016)** laid out the problem; the failure modes have been catalogued ever since.

- **Reward hacking / specification gaming.** An optimiser finds a high-reward behaviour you did not intend. In RL this is ancient and well documented: boats that spin in circles collecting points instead of finishing the race. With learned reward models it is subtler, because the reward model itself is a neural network with its own blind spots, and the policy is explicitly optimising to find them.
- **Sycophancy.** **Sharma et al. (2024, ICLR)** showed that models trained on human preference data tend to agree with the user's stated view, and traced it to the preference data: human raters, on average, prefer responses that agree with them. The training did exactly what it was told.
- **Jailbreaks.** **Zou et al. (2023)** found adversarial suffixes, discovered by gradient search on open models, that transfer to closed ones and reliably elicit refused behaviour. Patching individual attacks is routine; a defence with a guarantee is not available.

**The precise open problem.** A training procedure such that an optimiser given far more compute than the designers still cannot find a policy that scores well while violating the intent — or, failing that, a way to detect when it has.`,
    },
    {
      kind: 'widget',
      title: '7. The one that sounds easy',
      body: String.raw`Here is a question any reasonable person would expect to be answerable: *did this model memorise this particular test item?* We can see the training data. We can see the model. Follow the argument.`,
      widget: {
        type: 'StepReveal',
        props: {
          steps: [
            String.raw`**Memorisation certainly happens.** Carlini et al. (2021) extracted verbatim training sequences — including personal data — from a deployed language model by sampling and filtering. Carlini et al. (2023) then showed memorisation grows with model size, with how often a string was duplicated, and with how much context you prompt with.`,
            String.raw`**So just check for the item.** The obvious test is **membership inference**: build a statistic (say, the model's loss on the item) and threshold it. Members of the training set should have lower loss than non-members.`,
            String.raw`**It does not work at scale.** Duan et al. (2024) evaluated membership-inference attacks across model and data sizes and found performance barely above chance. Three reasons: the training set is enormous relative to any one item, models see most data roughly once, and "member" versus "non-member" is a blurred line when near-duplicates of the item are in the corpus anyway.`,
            String.raw`**The blur is the real problem.** If a paraphrase of your test question appeared in training, is the item memorised? Any threshold you pick encodes an answer to a question nobody has defined.`,
            String.raw`**And it compounds.** "Remove this fact from the model" — machine unlearning — inherits the same difficulty: you cannot verify a removal you cannot define. Retraining without the data is the only method with a clear semantics, and it costs a full training run.`,
          ],
          notes: [
            'Extracting Training Data from Large Language Models, USENIX Security 2021; Quantifying Memorization Across Neural Language Models, ICLR 2023.',
            'This is the standard privacy-auditing tool, and it works well on small models trained for many epochs.',
            '“Do Membership Inference Attacks Work on Large Language Models?”, COLM 2024.',
            'Compare: deciding whether a person “remembers” a fact they have heard paraphrased a thousand times.',
            'Which is why contamination in benchmarks (problem 5) cannot simply be measured away.',
          ],
        },
      },
    },
    {
      kind: 'explain',
      title: 'The sibling problem: knowing when you do not know',
      body: String.raw`The other deceptively simple one is **calibrated uncertainty**: a model whose stated confidence matches its accuracy, on inputs it was not trained for. On the training distribution this is largely a solved engineering problem — [temperature scaling](@ml/calibration-uncertainty) recovers calibration with a single fitted parameter.

Off-distribution it falls apart. **Ovadia et al. (2019, NeurIPS)** shifted the test data in controlled ways and found that the quality of every method's uncertainty estimates degraded as the shift grew, with accuracy falling while confidence often did not follow; deep ensembles held up best but still degraded. And the case we most want calibration for — a question the model has never seen anything like — is exactly the case with no held-out data to calibrate on.

**The precise open problem.** Produce confidence values that remain calibrated under shifts not seen at calibration time, with a check that does not require labelled data from the shifted distribution.`,
    },
    {
      kind: 'fill',
      prompt: String.raw`Membership inference fails on frontier models partly because each item is seen roughly ___ during training, and partly because near-duplicates blur the line between ___ and non-member. Separately, confidence estimates stay usable on the training distribution but degrade under distribution ___.`,
      bank: ['once', 'a thousand times', 'member', 'outlier', 'shift', 'collapse'],
      answer: ['once', 'member', 'shift'],
      why: String.raw`Single-epoch training on an enormous corpus leaves almost no loss gap between seen and unseen items, which is what a membership attack needs; and duplication means the categories themselves overlap. The calibration point is separate but has the same flavour — the guarantee holds only where you measured it.`,
    },
    {
      kind: 'order',
      prompt: 'You want to know whether a model genuinely solves a class of problems. Order these tests from weakest to strongest evidence.',
      steps: [
        'Its score on the public benchmark everyone reports',
        'Its score on the same benchmark after removing items with exact n-gram overlap with the training corpus',
        'Its score on template-regenerated items with new names and numbers',
        'Its score on a freshly written benchmark built to the same specification after the model was frozen',
        'Its score on that fresh benchmark, plus unchanged accuracy when irrelevant clauses are inserted',
      ],
      why: String.raw`Each step closes one route by which the number could be inflated: leakage, then surface memorisation, then specification-level contamination, then reliance on incidental cues. The last is the strongest because it tests invariance rather than just novelty — a model can score well on fresh items and still be reading the wrong signal.`,
    },
    {
      kind: 'numeric',
      prompt: String.raw`A child has encountered roughly $10^8$ words by age 13. A model is trained on roughly $1.3\times10^{13}$ tokens. Taking tokens and words as comparable, what is the ratio, to the nearest power of ten? Give the exponent (e.g. answer 4 for $10^4$).`,
      answer: 5,
      tolerance: 0.5,
      why: String.raw`$1.3\times10^{13}/10^8=1.3\times10^5$, so about $10^5$. The number is rough — tokens are not words and the child's figure is an estimate — but the order of magnitude is the point, and it has not improved as models have got better. Any claim to have "solved" sample efficiency has to move this exponent.`,
    },
    {
      kind: 'explain',
      title: 'Key takeaways',
      body: String.raw`- As of 2026 the headline open problems are: reasoning that is invariant to irrelevant changes; sample efficiency; continual learning without forgetting *or* loss of plasticity; interpretability you can act on; evaluation that survives publication; and alignment under optimisation pressure.
- Each is stated as a recognisable target. Most are measured by a **gap** between two conditions — original versus regenerated benchmark, task 1 before versus after task 50 — not by an absolute score.
- Continual learning has two opposite failure modes: forgetting (changing too much) and loss of plasticity (no longer able to change). Fixing one naively worsens the other (Dohare et al., 2024).
- The deceptively easy ones: deciding whether a model memorised a specific item (membership inference is near chance at scale; Duan et al., 2024) and staying calibrated off-distribution (Ovadia et al., 2019).
- Nothing here is a prediction that these will stay open. They are the things that, as of 2026, nobody can do.`,
    },
  ],
  references: [
    { authors: 'G. Paulo & N. Belrose', title: 'Sparse Autoencoders Trained on the Same Data Learn Different Features', year: 2025, venue: 'arXiv:2501.16615', url: 'https://arxiv.org/abs/2501.16615' },
    { authors: 'I. Mirzadeh, K. Alizadeh, H. Shahrokhi, O. Tuzel, S. Bengio & M. Farajtabar', title: 'GSM-Symbolic: Understanding the Limitations of Mathematical Reasoning in Large Language Models', year: 2024, venue: 'arXiv:2410.05229 (ICLR 2025)', url: 'https://arxiv.org/abs/2410.05229' },
    { authors: 'S. Dohare, J. F. Hernandez-Garcia, Q. Lan, P. Rahman, A. R. Mahmood & R. S. Sutton', title: 'Loss of plasticity in deep continual learning', year: 2024, venue: 'Nature 632, 768–774' },
    { authors: 'M. Duan, A. Suri, N. Mireshghallah, S. Min, W. Shi, L. Zettlemoyer, Y. Tsvetkov, Y. Choi, D. Evans & H. Hajishirzi', title: 'Do Membership Inference Attacks Work on Large Language Models?', year: 2024, venue: 'COLM', url: 'https://arxiv.org/abs/2402.07841' },
    { authors: 'Y. Ovadia, E. Fertig, J. Ren, et al.', title: 'Can You Trust Your Model’s Uncertainty? Evaluating Predictive Uncertainty Under Dataset Shift', year: 2019, venue: 'NeurIPS' },
    { authors: 'M. Sharma, M. Tong, T. Korbak, et al.', title: 'Towards Understanding Sycophancy in Language Models', year: 2024, venue: 'ICLR', url: 'https://arxiv.org/abs/2310.13548' },
  ],
} satisfies LessonContent;
