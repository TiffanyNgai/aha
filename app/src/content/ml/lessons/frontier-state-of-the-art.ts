import type { LessonContent } from '../../types';

const rows: [string, string][] = [
  ['2012', 'AlexNet: deep CNNs win ImageNet'],
  ['2016', 'AlphaGo beats Lee Sedol (Nature)'],
  ['2017', 'Transformer architecture'],
  ['2020', 'GPT-3: few-shot in-context learning'],
  ['2020', 'DDPM — diffusion becomes competitive'],
  ['2020', 'AlphaFold2 at CASP14'],
  ['2022', 'Chinchilla rewrites the scaling recipe'],
  ['2022', 'InstructGPT: RLHF post-training'],
  ['2023', 'GraphCast beats HRES on most targets'],
  ['2023', 'RFdiffusion: designed binders, tested'],
  ['2024–25', 'RL on verifiable rewards; IMO-level maths'],
];
const timelineSvg = `<svg viewBox="0 0 320 ${28 + rows.length * 23}" xmlns="http://www.w3.org/2000/svg" font-family="inherit">
  <text x="6" y="12" font-size="10" fill="var(--fg)">Things that worked, roughly in order</text>
  <line x1="58" y1="22" x2="58" y2="${20 + rows.length * 23}" stroke="var(--grid)" stroke-width="2"/>
  ${rows.map(([yr, txt], i) => {
    const y = 36 + i * 23;
    return `<g>
      <circle cx="58" cy="${y - 4}" r="3.5" fill="var(--c2)">
        <animate attributeName="r" values="3.5;5.5;3.5" dur="2.4s" begin="${i * 0.25}s" repeatCount="indefinite"/>
      </circle>
      <text x="50" y="${y}" text-anchor="end" font-size="9" fill="var(--c3)">${yr}</text>
      <text x="68" y="${y}" font-size="9" fill="var(--fg)">${txt}</text>
    </g>`;
  }).join('')}
</svg>`;

const ladder: [string, string, string][] = [
  ['Strongest', 'Independently graded, pre-registered', 'AlphaFold2 at CASP14 — targets sealed, scored by organisers'],
  ['Strong', 'Held-out benchmark, code + weights public', 'GraphCast vs ECMWF HRES on 1380 targets'],
  ['Medium', 'Public benchmark, closed model', 'Scores on MMLU / GPQA from an API-only system'],
  ['Weak', 'Self-reported, self-graded', 'A blog post naming a score with no protocol'],
  ['Weakest', 'Curated demo reel', 'A page of hand-picked generated videos'],
];
const ladderSvg = `<svg viewBox="0 0 320 ${26 + ladder.length * 34}" xmlns="http://www.w3.org/2000/svg" font-family="inherit">
  <text x="6" y="12" font-size="10" fill="var(--fg)">How much a claim is worth, by how it was checked</text>
  ${ladder.map(([tag, how, eg], i) => {
    const y = 22 + i * 34;
    const col = ['var(--c1)', 'var(--c1)', 'var(--c3)', 'var(--c5)', 'var(--c5)'][i];
    return `<g>
      <rect x="6" y="${y}" width="308" height="30" rx="4" fill="var(--surface)" stroke="${col}" stroke-width="1"/>
      <text x="12" y="${y + 12}" font-size="9" fill="${col}">${tag}</text>
      <text x="62" y="${y + 12}" font-size="9" fill="var(--fg)">${how}</text>
      <text x="12" y="${y + 24}" font-size="8" fill="var(--muted)">${eg}</text>
    </g>`;
  }).join('')}
</svg>`;

export default {
  cards: [
    {
      kind: 'explain',
      title: 'Ten years is a long time',
      body: String.raw`In 2015, getting a computer to say what was in a photograph was a research result. Translating a paragraph produced something you could just about follow. Predicting a protein's shape from its sequence was a problem the field had worked on for fifty years without solving. Generating a convincing photograph of nothing in particular was out of reach.

All four of those are now routine, and some of them are commercial products. This lesson is about what machine learning can **reliably** do as of 2026, and — just as important — how to tell a result that was actually checked from one that was announced.

The frontier moves fast. Everything here has a date attached. Treat anything newer than this lesson as something you have to look up yourself.`,
      widget: { type: 'SvgDiagram', props: { svg: timelineSvg } },
    },
    {
      kind: 'explain',
      title: 'Demonstrated, claimed, and advertised',
      body: String.raw`Three different things get called "results" in machine learning, and they are not equally trustworthy.

- **Demonstrated.** Someone ran a protocol they did not control the answers to — a sealed competition, a held-out test set released after the model was frozen, a wet-lab experiment — and the numbers were checked by someone else.
- **Claimed.** A number on a public benchmark, reported by the people who built the system. Often honest, but the test items may have been in the training data, the baseline may be under-tuned, and nobody outside can re-run it.
- **Advertised.** A demo page, a video reel, a screenshot. Selected by the people who made it, from an unknown number of attempts.

None of these is worthless. But a sentence like "model X can now do Y" means something completely different depending on which of the three it came from.`,
      widget: { type: 'SvgDiagram', props: { svg: ladderSvg }, caption: 'The same capability claim is worth very different amounts depending on who checked it.' },
    },
    {
      kind: 'mcq',
      prompt: 'A lab announces that its new image generator "achieves photorealism", illustrated with twelve striking images on a web page, and reports no numbers. A second lab reports a worse-looking model with a Fréchet Inception Distance (FID) on a standard dataset, plus code and weights. Which is the stronger evidence of capability, and why?',
      choices: [
        'The twelve images, because human eyes are the real test of image quality',
        'The FID result with released code, because someone else can recompute it on the same data and check whether the model was cherry-picked',
        'Neither, because FID and visual inspection measure the same thing',
        'The twelve images, because FID is known to be meaningless',
      ],
      answer: 1,
      why: String.raw`The point is not that FID is a good measure of beauty — it is a flawed proxy, and [evaluating generative models](@ml/generative-evaluation) is genuinely hard. The point is reproducibility: a released model and a stated protocol let a third party sample afresh and find out how many tries the pretty pictures took. A demo reel gives you no denominator. Dismissing FID entirely overshoots: it is a weak but checkable signal, which beats an uncheckable one.`,
    },
    {
      kind: 'explain',
      title: 'Scale: the thing that actually changed',
      body: String.raw`The single biggest difference between 2015 and 2026 is not a new idea. It is that the same ideas were run at a thousand times the size, and got predictably better.

**Kaplan et al. (2020)** found that test loss for language models falls as a smooth power law in parameters, data and compute over many orders of magnitude. **Hoffmann et al. (2022, "Chinchilla")** then showed the earlier recipe was allocating that compute wrongly: for a fixed budget, you should train a smaller model on far more data. Their 70-billion-parameter Chinchilla outperformed the 280-billion-parameter Gopher trained on the same compute.

Two honest caveats. The *loss* is predictable; which specific skills appear at which scale is much less so. And the Chinchilla fit itself was later disputed — **Besiroglu et al. (2024)** re-fit the published data and found errors in one of the three estimation approaches, giving somewhat different optimal ratios. See [scaling laws](@ml/scaling-laws).`,
    },
    {
      kind: 'explain',
      title: 'Generative modelling: diffusion and flows took over',
      body: String.raw`Around 2014–2018, generative image modelling meant [GANs](@ml/gans): a generator and a discriminator playing a minimax game. They produced sharp images but were unstable to train and prone to mode collapse.

Three papers changed the default. **Sohl-Dickstein et al. (2015)** proposed learning to reverse a gradual noising process. **Ho, Jain & Abbeel (2020, DDPM)** made it work at image scale with a simple noise-prediction loss. **Song et al. (2021)** showed the whole family is one [stochastic differential equation](@ml/score-sde) and reported FID 2.20 on CIFAR-10 — then a record. **Dhariwal & Nichol (2021)** titled their paper "Diffusion Models Beat GANs on Image Synthesis", and the field agreed.

Since then: [latent diffusion](@ml/latent-diffusion) (Rombach et al., CVPR 2022) moved the process into a compressed space, making high-resolution generation cheap, and [flow matching](@ml/flow-matching) (Lipman et al., ICLR 2023) replaced the score with a directly regressed velocity field, which is simpler and trains stably. Both are standard in 2026.

What is *demonstrated*: high-fidelity still images and audio, with public models and reproducible metrics. What is largely *advertised*: long, coherent video. Public systems generate striking clips, but there is no widely accepted held-out benchmark for video realism, so the honest statement is "impressive demos, unquantified reliability".`,
    },
    {
      kind: 'truefalse',
      prompt: 'Diffusion models replaced GANs because diffusion has a theoretical guarantee that GANs lack: the trained diffusion model provably recovers the true data distribution.',
      answer: false,
      why: String.raw`There is no such guarantee in practice. The reverse-SDE construction is exact only if the learned score equals the true score at every noise level — which is exactly the thing that is approximated. Diffusion won on *engineering* grounds: a stable regression loss instead of a two-player game, so training does not collapse, and sample quality improves monotonically with model size and steps.`,
    },
    {
      kind: 'explain',
      title: 'Language models: pretraining plus post-training',
      body: String.raw`A modern language system is built in two stages that are easy to confuse.

1. **Pretraining.** Next-token prediction on an enormous text corpus. This is where almost all the compute goes and where the knowledge comes from. **Brown et al. (2020, GPT-3)** showed that a large enough pretrained model can do new tasks from a few examples in the prompt, with no weight updates — [in-context learning](@ml/in-context-learning).
2. **Post-training.** A comparatively tiny amount of extra training that decides how the model behaves. **Ouyang et al. (2022, InstructGPT)** used [reinforcement learning from human feedback](@ml/rlhf-dpo): collect human preference comparisons, fit a reward model, optimise the policy against it with a KL penalty. Human raters preferred the 1.3-billion-parameter InstructGPT output to the 175-billion-parameter GPT-3 output — a striking demonstration that the behaviour, not the knowledge, was the bottleneck.

**Rafailov et al. (2023, DPO)** later showed you can skip the explicit reward model and optimise the preference objective directly, which is now a common default because it is far simpler to run.`,
    },
    {
      kind: 'explain',
      title: 'RL on verifiable rewards: the 2024–25 shift',
      body: String.raw`Preference-based post-training teaches *style*. The newer idea is to post-train on tasks where a program can check the answer: a maths problem with a known result, a unit test that passes or fails. The reward is then not a learned proxy but a fact. This is [RL for reasoning](@ml/rl-for-reasoning).

**DeepSeek-AI (Guo et al., 2025, Nature 645, 633–638; preprint arXiv:2501.12948)** released DeepSeek-R1 with open weights and a described recipe — large-scale RL on verifiable maths and code problems, with group-relative policy optimisation (GRPO) — and reported that long chains of reasoning emerged from the RL itself rather than being imitated. Because the weights are public, others could and did re-run the evaluations.

Why this matters and where it stops: the method needs a cheap, reliable verifier. Maths and code have one. "Write a good summary", "give sound legal advice" and "design a safe bridge" do not. As of 2026 the measured gains concentrate in exactly the domains with automatic checkers, which is a strong clue about the mechanism — and a warning against reading them as general intelligence gains.`,
    },
    {
      kind: 'widget',
      title: 'Case study: how an IMO claim was checked',
      body: String.raw`In July 2025 two labs announced gold-medal-level performance at the International Mathematical Olympiad. The announcements were not equally verifiable, and the difference is instructive.`,
      widget: {
        type: 'StepReveal',
        props: {
          steps: [
            String.raw`**Background.** In 2024, Google DeepMind's AlphaProof and AlphaGeometry 2 solved four of six IMO problems, scoring 28/42 — silver-medal level. The solutions were graded by two named mathematicians, Tim Gowers and Joseph Myers, and the system took up to several days on some problems, far beyond the contest time limit. Both caveats were stated by the lab.`,
            String.raw`**2025, DeepMind.** An advanced version of Gemini with "Deep Think" was reported to solve five of six problems (35/42) within the 4.5-hour time limit, and the lab stated that the result was **certified by the IMO's own coordinators** using the contest's marking scheme.`,
            String.raw`**2025, OpenAI.** An experimental model was announced with the same 35/42 score, but this was **self-reported**: OpenAI said its solutions were graded by a panel of former IMO medallists it arranged, not by the IMO. Press accounts also said the announcement came before the date organisers had asked labs to wait for; details of that request are disputed, so treat that point as unsettled.`,
            String.raw`**The difference.** Same claimed capability; different grader. One result was certified by the body that owns the exam, the other graded by a panel the claimant chose. Both may well be correct — but only one is *demonstrated* in the strict sense.`,
            String.raw`**What it does not show.** Olympiad problems are short, self-contained, and have known-correct answers, which is exactly the regime where verifiable-reward training works. It is not evidence about open-ended research mathematics, where there is nothing to check against.`,
          ],
          notes: [
            'Reported by Google DeepMind, July 2024; the lab named its two graders.',
            'Announced by Google DeepMind, July 2025.',
            'Announced by OpenAI, July 2025, with its own grading panel; the lab said it would release solutions for scrutiny.',
            'Independent grading is the cheapest thing a lab can do to make a claim credible, and the first thing dropped under launch pressure.',
            'Compare: a research mathematician\'s open problem has no answer key, so there is no reward signal to train on.',
          ],
        },
      },
    },
    {
      kind: 'explain',
      title: 'Science models: the strongest demonstrations',
      body: String.raw`Some of the most solid results in modern ML come from the sciences, because those fields already had sealed-answer evaluation protocols.

- **Protein structure.** **Jumper et al. (2021, Nature)** entered AlphaFold2 in CASP14, a blind biennial competition where targets are structures that have been solved experimentally but not yet published. AlphaFold2's median accuracy across targets was far ahead of every other group and competitive with experiment for many proteins. CASP is a sealed competition, so this is as strong as evidence gets. **Abramson et al. (2024, Nature)** extended the approach to complexes with ligands and nucleic acids (AlphaFold3). The 2024 Nobel Prize in Chemistry went in part to this line of work.
- **Protein design.** **Dauparas et al. (2022, Science, ProteinMPNN)** and **Watson et al. (2023, Nature, RFdiffusion)** designed new proteins that were then **synthesised and tested in a laboratory**. Wet-lab validation is a different and stronger kind of evidence than any benchmark score.
- **Weather.** **Lam et al. (2023, Science, GraphCast)** compared a learned 10-day global forecast against ECMWF's HRES, the operational gold standard, and reported better accuracy on about 90% of 1380 verification targets. **Price et al. (2024, Nature, GenCast)** extended this to probabilistic ensembles. Weather is unusually clean to evaluate: reality arrives a week later and settles the matter.
- **Control.** **Degrave et al. (2022, Nature)** trained a reinforcement-learning controller for the magnetic coils of the TCV tokamak and ran it on the real machine.

What these share: the evaluation was designed by someone other than the modeller, and often by physical reality.`,
    },
    {
      kind: 'multi',
      prompt: 'Which of these are genuine reasons the AlphaFold2 CASP14 result is unusually strong evidence, compared with a typical benchmark number? (Select all that apply.)',
      choices: [
        'The answers were experimental structures not yet public when the predictions were submitted, so they could not have been in the training data',
        'Scoring was done by the competition organisers using a protocol fixed in advance',
        'It proves the model understands protein physics',
        'The task has a ground truth that exists independently of machine learning — an experimentally determined structure',
        'It means protein folding, including dynamics and binding affinity, is now a solved problem',
      ],
      answers: [0, 1, 3],
      why: String.raw`Blind targets, pre-fixed external scoring and a physically real ground truth are exactly the three things most ML benchmarks lack. The two overclaims are different failures: accurate prediction is not evidence of a physical mechanism being represented, and AlphaFold predicts a single static structure — it does not give conformational ensembles, binding affinities, or the effect of most point mutations. Those remain open.`,
    },
    {
      kind: 'explain',
      title: 'Where the record is contested',
      body: String.raw`Not every headline survived contact with specialists.

**Materials discovery.** **Merchant et al. (2023, Nature, GNoME)** reported 2.2 million predicted new crystal structures, of which about 380,000 were predicted stable, and a companion paper (**Szymanski et al., 2023, Nature**) reported an autonomous "A-Lab" that synthesised dozens of new compounds. Both were challenged. **Cheetham and Seshadri (2024, Chemistry of Materials)** examined a sample of the GNoME structures and argued there was little evidence that the examined structures were simultaneously new, credible and useful — many being close variants of known materials. **Leeman et al. (2024, PRX Energy)** re-analysed the A-Lab diffraction data and argued that none of the claimed new compounds had been convincingly demonstrated. The original authors disputed parts of both critiques. As of 2026 this is **contested**, and you should say so rather than citing the headline number.

**Emergent abilities.** Several papers reported that capabilities appear "suddenly" above a scale threshold. **Schaeffer, Miranda and Koyejo (2023, NeurIPS)** argued that the sharpness is often an artefact of the *metric*: a discontinuous score like exact-match turns a smooth improvement into a step. This does not mean nothing surprising happens with scale, but it does mean a jump in a plot is not by itself evidence of a phase transition. Also contested.

**Robotics and autonomy.** Generalist robot policies produce impressive videos and, as of 2026, no held-out benchmark that the field agrees on. Driverless taxi services do operate commercially in several cities, with safety analyses published by the operators themselves — real deployment, but self-reported evidence in a narrowly fenced operating domain.`,
    },
    {
      kind: 'match',
      prompt: 'Match each 2020s result to the kind of evidence it rests on.',
      pairs: [
        ['AlphaFold2 at CASP14', 'Blind competition scored by external organisers'],
        ['RFdiffusion binders', 'Designs synthesised and tested in a wet lab'],
        ['A text-to-video system\'s launch page', 'Curated samples, no stated protocol'],
        ['A score on a public multiple-choice benchmark from an API-only model', 'Self-reported, non-reproducible, possibly contaminated'],
        ['GraphCast vs ECMWF HRES', 'Comparison against an operational baseline on future weather'],
      ],
      why: String.raw`The useful habit is to ask "who chose the test, and who marked it?" before asking how big the number is. The same capability claim can sit anywhere on this ladder, and the position tells you more than the headline.`,
    },
    {
      kind: 'fill',
      prompt: String.raw`Post-training with ___ rewards — a unit test or a known numerical answer — produced large measured gains in maths and code. It does not transfer directly to open-ended writing, because there is no cheap ___. Pretraining, by contrast, is where nearly all the ___ is spent.`,
      bank: ['verifiable', 'adversarial', 'verifier', 'discriminator', 'compute', 'memory'],
      answer: ['verifiable', 'verifier', 'compute'],
      why: String.raw`The mechanism is the checker. Where a program can grade the output, reinforcement learning has a dense honest signal; where it cannot, you are back to a learned reward model and all its failure modes. And the division of labour is lopsided: post-training shapes behaviour using a tiny fraction of the compute that pretraining consumed.`,
    },
    {
      kind: 'order',
      prompt: 'You read a press release claiming a new model "solves" a hard task. Order the checks, most informative first.',
      steps: [
        'Find the actual artefact — paper, technical report or model card — behind the press release',
        'Identify the evaluation set and ask whether it could plausibly be in the training data',
        'Check who graded the result and whether the protocol was fixed before the model was frozen',
        'Compare against the strongest existing baseline at matched compute, not against a weak one',
        'Look for an independent re-run: released weights, released code, or a third party reporting the same number',
      ],
      why: String.raw`Each step can kill the claim outright, and they get progressively more expensive to perform, so doing them in this order wastes the least of your time. Notice that the size of the number never appears in the list — it is the last thing that matters.`,
    },
    {
      kind: 'numeric',
      prompt: String.raw`Suppose test loss follows $L(C)=0.3+1.2\,C^{-0.05}$, where $C$ is training compute in arbitrary units. Starting at $C=10^6$, by what factor must you increase $C$ to halve the *reducible* part of the loss, $1.2\,C^{-0.05}$? Give the factor (not its logarithm).`,
      answer: 1048576,
      tolerance: 1000,
      why: String.raw`Halving requires $(kC)^{-0.05}=\tfrac12 C^{-0.05}$, so $k^{-0.05}=1/2$ and $k=2^{20}\approx1.05\times10^6$. The starting point is irrelevant — that is what a power law means. This is the real shape of "scaling works": it works, and it is brutally expensive, which is why the field also hunts for better data and better algorithms.`,
    },
    {
      kind: 'explain',
      title: 'Key takeaways',
      body: String.raw`- As of 2026, machine learning reliably does several things that were research problems in 2015: image and audio generation, protein structure prediction, medium-range weather forecasting, general-purpose text generation, and maths or code where an automatic checker exists.
- Most of the change came from running known ideas at far larger scale ([scaling laws](@ml/scaling-laws); Kaplan et al. 2020, Hoffmann et al. 2022 — the latter's fit itself later disputed by Besiroglu et al. 2024).
- Generative modelling consolidated on diffusion and [flow matching](@ml/flow-matching), for engineering reasons (stable regression losses), not because of a correctness guarantee.
- Language systems are pretraining plus a thin post-training layer; RL on **verifiable** rewards is what drove the 2024–25 reasoning gains, and it stops where the verifier stops.
- The strongest results come from sciences with sealed evaluation: CASP, wet-lab validation, operational weather forecasts.
- Contested, not settled: large-scale materials-discovery claims (GNoME and A-Lab, challenged in 2024), "emergent abilities" as genuine phase transitions, and generalist robotics.
- Before the number, ask who chose the test and who marked it.`,
    },
  ],
  references: [
    { authors: 'J. Jumper, R. Evans, A. Pritzel, et al.', title: 'Highly accurate protein structure prediction with AlphaFold', year: 2021, venue: 'Nature 596, 583–589', url: 'https://www.nature.com/articles/s41586-021-03819-2' },
    { authors: 'J. Hoffmann, S. Borgeaud, A. Mensch, et al.', title: 'Training Compute-Optimal Large Language Models', year: 2022, venue: 'NeurIPS', url: 'https://arxiv.org/abs/2203.15556' },
    { authors: 'R. Lam, A. Sanchez-Gonzalez, M. Willson, et al.', title: 'Learning skillful medium-range global weather forecasting (GraphCast)', year: 2023, venue: 'Science 382(6677), 1416–1421' },
    { authors: 'A. K. Cheetham & R. Seshadri', title: 'Artificial Intelligence Driving Materials Discovery? Perspective on the Article: Scaling Deep Learning for Materials Discovery', year: 2024, venue: 'Chemistry of Materials 36(8), 3490–3495' },
    { authors: 'R. Schaeffer, B. Miranda & S. Koyejo', title: 'Are Emergent Abilities of Large Language Models a Mirage?', year: 2023, venue: 'NeurIPS', url: 'https://arxiv.org/abs/2304.15004' },
  ],
} satisfies LessonContent;
