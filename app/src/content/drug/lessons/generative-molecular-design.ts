import type { LessonContent } from '../../types';

const loopSvg = `<svg viewBox="0 0 320 170" xmlns="http://www.w3.org/2000/svg">
<g font-size="9" text-anchor="middle" font-weight="700">
<rect x="18" y="20" width="84" height="30" rx="8" fill="var(--c2)" fill-opacity="0.22" stroke="var(--c2)"/>
<text x="60" y="39" fill="var(--fg)">1. GENERATE</text>
<rect x="218" y="20" width="84" height="30" rx="8" fill="var(--c3)" fill-opacity="0.22" stroke="var(--c3)"/>
<text x="260" y="39" fill="var(--fg)">2. SCORE</text>
<rect x="218" y="110" width="84" height="30" rx="8" fill="var(--c1)" fill-opacity="0.22" stroke="var(--c1)"/>
<text x="260" y="129" fill="var(--fg)">3. SELECT</text>
<rect x="18" y="110" width="84" height="30" rx="8" fill="var(--c4)" fill-opacity="0.22" stroke="var(--c4)"/>
<text x="60" y="124" fill="var(--fg)">4. STEER</text>
<text x="60" y="135" fill="var(--muted)" font-weight="400" font-size="8">(retrain / reward)</text>
</g>
<g fill="none" stroke="var(--fg)" stroke-width="1.2">
<path d="M102,35 L212,35" marker-end="url(#ah)"/>
<path d="M260,50 L260,104" marker-end="url(#ah)"/>
<path d="M218,125 L108,125" marker-end="url(#ah)"/>
<path d="M60,110 L60,56" marker-end="url(#ah)"/>
</g>
<defs><marker id="ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="var(--fg)"/></marker></defs>
<circle r="4" fill="var(--c5)">
<animateMotion dur="7s" repeatCount="indefinite" path="M102,35 L212,35 L260,50 L260,104 L218,125 L108,125 L60,110 L60,56 L102,35"/>
</circle>
<text x="160" y="14" font-size="8" fill="var(--muted)" text-anchor="middle">a proposal engine, a judge, a filter — and feedback</text>
<text x="160" y="80" font-size="8" fill="var(--muted)" text-anchor="middle">every arrow is cheap; only leaving the loop costs money</text>
<text x="160" y="160" font-size="8" fill="var(--muted)" text-anchor="middle">exit → synthesis planning → make → assay</text>
</svg>`;

const gapSvg = `<svg viewBox="0 0 320 150" xmlns="http://www.w3.org/2000/svg">
<g font-size="8.5">
${[['molecules generated', 100, 'c2'], ['pass property filters', 44, 'c2'], ['a route can be planned', 21, 'c3'], ['actually synthesised', 4, 'c5'], ['assayed and active', 1, 'c1']].map((r, i) => {
  const w = Math.max(10, (r[1] as number) * 2.6);
  return `<rect x="10" y="${16 + i * 26}" width="${w}" height="17" rx="3" fill="var(--${r[2]})" fill-opacity="0.75"/>
<text x="${w + 16}" y="${28 + i * 26}" fill="var(--fg)">${r[0]}</text>`;
}).join('\n')}
<text x="10" y="146" fill="var(--muted)" font-size="8">Widths are illustrative; the exact drop-off differs wildly between papers — and most papers never report the last two bars at all.</text>
</g></svg>`;

export default {
  cards: [
    {
      kind: 'explain',
      title: 'Turning the arrow around',
      body: String.raw`Everything so far has pointed one way: you *have* a molecule, you *predict* a property. [QSAR](@drug/qsar), [docking](@drug/docking) and [property models](@drug/molecular-property-prediction) are all **forward** maps, molecule → number.

**Generative molecular design** (or *inverse design*) turns the arrow around: you state what you want — potent at this target, soluble, non-toxic, makeable — and a model proposes molecules that might have it.

Why bother? Because the space of drug-like molecules is often estimated at around $10^{60}$ structures. You cannot enumerate it, and even a 10-billion-compound catalogue is a vanishing speck of it. A generator lets you *sample* the interesting parts instead.`,
    },
    {
      kind: 'recall',
      title: 'Generative models in one minute',
      points: [
        'A **generative model** learns a distribution $p(x)$ over data and lets you **sample** new $x$ from it.',
        'Trained by maximum likelihood (autoregressive models, flows), by a variational bound (VAEs), adversarially (GANs) or by denoising (diffusion).',
        'Sampling with a *temperature* or *guidance* knob trades fidelity against diversity.',
        'A model can be **conditioned**: sample $p(x \\mid c)$ for a condition $c$ such as a target property.',
      ],
      link: 'ml/generative-modeling-intro',
    },
    {
      kind: 'explain',
      title: 'The generate–score–select loop',
      body: String.raw`Almost every method in this unit is the same loop wearing different clothes:

1. **Generate** candidate molecules (a language model over SMILES, a graph model, a 3D diffusion model, or a genetic algorithm).
2. **Score** each one with a cheap *in silico* oracle — a QSAR model, a docking score, a predicted $\log P$, a synthesizability estimate.
3. **Select** the best, or filter out the unacceptable.
4. **Steer** the generator with that feedback — by reinforcement learning, by fine-tuning on the winners, or by searching a latent space.

The loop is cheap, so you can run it millions of times. That is exactly why its weakest part matters so much: **the scoring function**. The generator will find whatever the score rewards.`,
      widget: { type: 'SvgDiagram', props: { svg: loopSvg }, caption: 'The dot does one lap in seconds and costs nothing. A single lap of the *real* loop — design, make, test — takes weeks and thousands of dollars.' },
    },
    {
      kind: 'mcq',
      prompt: 'Which task is **inverse design**?',
      choices: [
        'Predicting the solubility of a molecule you already have',
        'Proposing structures expected to inhibit a given kinase',
        'Measuring the melting point of a synthesised compound',
        'Ranking a purchasable catalogue by docking score',
      ],
      answer: 1,
      why: 'Inverse design starts from the desired property and produces structures. Predicting solubility and measuring a melting point are forward maps; ranking a fixed catalogue is virtual screening — it searches molecules that already exist rather than inventing them.',
    },
    {
      kind: 'explain',
      title: 'Two jobs, two kinds of benchmark',
      body: String.raw`Brown et al. (2019), introducing the **GuacaMol** benchmark suite, split the field cleanly in two:

- **Distribution learning** — can the model reproduce the training distribution? You sample a large batch and ask how molecule-like, how varied and how *similar in aggregate* to the training set it is.
- **Goal-directed generation** — can the model find molecules that score highly on a specified objective? GuacaMol's 20 tasks include rediscovering a known drug from its fingerprint, hitting an exact molecular formula, and multi-property objectives built around marketed drugs (for example an osimertinib- or ranolazine-flavoured objective).

A model can be excellent at one and useless at the other. Always ask which job a paper's numbers describe.`,
    },
    {
      kind: 'widget',
      title: 'Validity, uniqueness, novelty',
      body: String.raw`The three numbers reported in nearly every generative-chemistry paper, measured on a batch of samples:

- **Validity** — the fraction of outputs that parse into a chemically sensible molecule (rings closed, valences obeyed).
- **Uniqueness** — of the valid ones, the fraction that are distinct from each other.
- **Novelty** — of the distinct ones, the fraction not already in the training set.

Raise the sampling **temperature** and watch them trade off. Then press *copycat* and *alkane*.`,
      widget: { type: 'DrugGenMetrics', props: { generator: 'model', temperature: 0.8 }, caption: 'Faded dots fail a drug-likeness filter. Note what the three headline metrics do *not* notice.' },
    },
    {
      kind: 'explain',
      title: 'Why those three metrics are weak',
      body: String.raw`A generator that emits random-length straight-chain alkanes — $\texttt{CCCCCCCCCCCC}$, $\texttt{CCCCCCCCCCCCCCC}$, … — scores **100 % valid, ~100 % unique, ~100 % novel**. It is also completely useless.

The metrics are *necessary but nowhere near sufficient*: they are properties of strings, not of medicines. They say nothing about potency, selectivity, safety, synthesizability or whether the molecules resemble anything a chemist would make.

Better aggregate measures exist and are reported by GuacaMol and **MOSES** (Polykovskiy et al. 2020): the **Fréchet ChemNet Distance** (Preuer et al. 2018) compares the *distribution* of learned chemical features between generated and reference sets, and scaffold- and fragment-similarity scores compare the chemotypes produced. They are better. They are still not evidence that a molecule works.`,
    },
    {
      kind: 'multi',
      prompt: 'Which statements about validity, uniqueness and novelty are **true**? (Select all.)',
      choices: [
        'A generator of random long alkanes can score near 100 % on all three.',
        'High novelty implies the molecules are drug-like.',
        'Using SELFIES instead of SMILES makes validity 100 % by construction.',
        'Uniqueness near 0 % is a sign the model is repeating a few favourites.',
        'These three metrics measure how well a molecule binds its target.',
      ],
      answers: [0, 2, 3],
      why: 'Alkane spam maxes all three while being useless, SELFIES decodes any token string to a valid molecule, and collapsed uniqueness signals mode collapse. Novelty only means "not in the training file", and none of the three touches binding — that needs a scoring model or an experiment.',
    },
    {
      kind: 'explain',
      title: 'Benchmarks, and an awkward baseline',
      body: String.raw`Two reference suites dominate:

- **GuacaMol** (Brown et al. 2019) — ChEMBL-derived training set, distribution-learning plus 20 goal-directed tasks.
- **MOSES** (Polykovskiy et al. 2020) — about 1.9 million lead-like molecules from ZINC, with a fixed train/test split and a standard metric battery (validity, unique@1k/@10k, novelty, Fréchet ChemNet Distance, scaffold and fragment similarity, internal diversity, filter pass rate).

The awkward part: on goal-directed tasks, a plain **graph-based genetic algorithm** — random mutations and crossovers of molecular graphs, no learning at all — matches or beats most deep generative models (reported as a baseline in GuacaMol, and argued forcefully by Jensen 2019). A new architecture that merely beats "no optimiser" has shown very little.`,
    },
    {
      kind: 'truefalse',
      prompt: 'Deep generative models reliably beat simple genetic algorithms on goal-directed benchmarks such as GuacaMol.',
      answer: false,
      why: 'A graph genetic algorithm with no learned model is a startlingly strong baseline on these tasks; GuacaMol reported it as such and Jensen (2019) made the point explicitly. Whenever you read a goal-directed result, check which baselines were run.',
    },
    {
      kind: 'explain',
      title: 'The gap nobody reports',
      body: String.raw`Here is the uncomfortable fact of the field: **the overwhelming majority of molecules published by generative models are never synthesised, let alone tested.** The paper ends at the scoring function.

Gao and Coley (2020) put numbers on part of this by running computer-aided **synthesis planning** over sets of molecules proposed by many published generators. The fraction for which a plausible route could be found varied between models, and common heuristic synthesizability scores did not reliably track whether a route could actually be found. Optimisers that chase a score can drift into exotic, hard-to-make structures, which is why synthesizability needs its own check.

So a generative paper reporting only validity/uniqueness/novelty plus a docking score has demonstrated that *software ran*, not that chemistry happened.`,
      widget: { type: 'SvgDiagram', props: { svg: gapSvg }, caption: 'The attrition that generative papers usually stop short of.' },
    },
    {
      kind: 'order',
      prompt: 'Order the stages of an honest generative-design campaign, from first to last.',
      steps: [
        'Define the objective and the scoring functions',
        'Generate a large batch of candidate molecules',
        'Filter for drug-likeness, novelty and unwanted substructures',
        'Plan synthetic routes and drop what cannot be made',
        'Synthesise a short list of compounds',
        'Assay them and feed the measurements back',
      ],
      why: 'Scoring comes before generating — you cannot steer without an objective. Synthesis planning belongs *inside* the loop, not after it, because it rejects a large fraction of proposals. Only the final assay produces evidence.',
    },
    {
      kind: 'explain',
      title: 'Does it transfer to real molecules?',
      body: String.raw`Sometimes, with caveats.

- **GENTRL / DDR1** (Zhavoronkov et al. 2019, *Nat. Biotechnol.*): a generative pipeline proposed DDR1 kinase inhibitors; six were synthesised, four were active in biochemical assays, two were validated in cells, and one lead was tested in mice — a *full loop*, in 46 days. Walters and Murcko (2020) replied that the hit closely resembled known DDR1 inhibitors, so the chemistry achieved was modest relative to the headlines.
- **DSP-1181** (Exscientia/Sumitomo), announced in 2020 as an AI-designed molecule entering Phase 1, was later discontinued.
- A handful of AI-originated molecules have since reached Phase 2 — see [the rentosertib case study](@drug/case-rentosertib).

The pattern: generative models can genuinely accelerate *idea generation* inside a well-understood programme. None has yet been shown to invent a medicine on its own.`,
    },
    {
      kind: 'fill',
      prompt: 'GuacaMol separates ___ learning benchmarks from ___ generation benchmarks; the metric that compares learned feature *distributions* rather than individual molecules is the ___ ChemNet Distance.',
      bank: ['distribution', 'goal-directed', 'Fréchet', 'adversarial', 'Tanimoto', 'reinforcement'],
      answer: ['distribution', 'goal-directed', 'Fréchet'],
      why: 'Distribution learning asks whether samples look like the training data; goal-directed asks whether the model can optimise a stated objective. The Fréchet ChemNet Distance (Preuer et al. 2018) compares the two sets in a learned feature space — Tanimoto compares two individual fingerprints.',
    },
    {
      kind: 'match',
      prompt: 'Match each quantity to what it actually tells you.',
      pairs: [
        ['Validity', 'The string or graph decodes to a chemically sensible molecule'],
        ['Novelty', 'The molecule is absent from this particular training file'],
        ['Fréchet ChemNet Distance', 'The generated and reference sets look alike in aggregate'],
        ['Retrosynthesis success rate', 'A route to the molecule could be planned'],
        ['Assay IC₅₀', 'The molecule actually does something to the target'],
      ],
      why: 'The list runs from cheapest and least informative to most expensive and most informative. Only the last line is evidence about a drug; everything above it is evidence about software.',
    },
    {
      kind: 'explain',
      title: 'Key takeaways',
      body: String.raw`- **Generative design = inverse design**: state the objective, let a model propose structures. The alternative, enumerating $10^{60}$ molecules, is impossible.
- Nearly every method is the same **generate → score → select → steer** loop. Its quality is capped by the **scoring function**.
- **Validity, uniqueness and novelty** are necessary, cheap and weak: a random-alkane generator scores ~100 % on all three. Distribution metrics (Fréchet ChemNet Distance, scaffold similarity) are better but still not evidence of a drug.
- **GuacaMol** and **MOSES** standardised the benchmarks; a plain **graph genetic algorithm** remains a brutal baseline.
- **Most generated molecules are never made.** Synthesizability belongs inside the loop (Gao & Coley 2020), not in the discussion section.
- Real successes exist (DDR1, and later clinical-stage examples) but they accelerated chemistry teams rather than replacing them.`,
    },
  ],
  references: [
    { authors: 'Brown, N., Fiscato, M., Segler, M. H. S., Vaucher, A. C.', title: 'GuacaMol: benchmarking models for de novo molecular design', year: 2019, venue: 'J. Chem. Inf. Model. 59, 1096–1108' },
    { authors: 'Polykovskiy, D., Zhebrak, A., Sanchez-Lengeling, B., et al.', title: 'Molecular Sets (MOSES): a benchmarking platform for molecular generation models', year: 2020, venue: 'Front. Pharmacol. 11, 565644' },
    { authors: 'Gao, W., Coley, C. W.', title: 'The synthesizability of molecules proposed by generative models', year: 2020, venue: 'J. Chem. Inf. Model. 60, 5714–5723' },
    { authors: 'Zhavoronkov, A., Ivanenkov, Y. A., Aliper, A., et al.', title: 'Deep learning enables rapid identification of potent DDR1 kinase inhibitors', year: 2019, venue: 'Nat. Biotechnol. 37, 1038–1040' },
    { authors: 'Walters, W. P., Murcko, M.', title: 'Assessing the impact of generative AI on medicinal chemistry', year: 2020, venue: 'Nat. Biotechnol. 38, 143–145' },
    { authors: 'Jensen, J. H.', title: 'A graph-based genetic algorithm and generative model/Monte Carlo tree search for the exploration of chemical space', year: 2019, venue: 'Chem. Sci. 10, 3567–3572' },
    { authors: 'Preuer, K., Renz, P., Unterthiner, T., Hochreiter, S., Klambauer, G.', title: 'Fréchet ChemNet Distance: a metric for generative models for molecules in drug discovery', year: 2018, venue: 'J. Chem. Inf. Model. 58, 1736–1741' },
  ],
} satisfies LessonContent;
