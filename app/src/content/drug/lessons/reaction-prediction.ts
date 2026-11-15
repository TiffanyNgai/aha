import type { LessonContent } from '../../types';

const survivorSvg = `<svg viewBox="0 0 320 168" xmlns="http://www.w3.org/2000/svg">
<text x="10" y="13" font-size="9" fill="var(--muted)">what happens to a reaction on its way into a training set</text>
<g font-size="8.5">
<rect x="10" y="22" width="286" height="20" rx="4" fill="var(--c2)" fill-opacity="0.75"/>
<text x="10" y="52" fill="var(--fg)">reactions actually set up at the bench</text>
<rect x="10" y="60" width="150" height="20" rx="4" fill="var(--c3)" fill-opacity="0.75"/>
<text x="10" y="90" fill="var(--fg)">…that gave a usable yield</text>
<rect x="10" y="98" width="74" height="20" rx="4" fill="var(--c1)" fill-opacity="0.75"/>
<text x="10" y="128" fill="var(--fg)">…that someone published</text>
<rect x="10" y="136" width="52" height="20" rx="4" fill="var(--c5)" fill-opacity="0.85"/>
<text x="70" y="150" fill="var(--fg)">…text-mined cleanly into a dataset</text>
</g>
<text x="10" y="166" font-size="7.5" fill="var(--muted)">Widths are illustrative. The point is the shape: every stage selects for success, so the surviving data is almost all positive.</text>
</svg>`;

export default {
  cards: [
    {
      kind: 'explain',
      title: 'The arrow pointing forwards',
      body: String.raw`[Retrosynthesis](@drug/retrosynthesis) asks what would make a target. **Forward prediction** asks the opposite and much older question: *I am about to mix these things — what comes out?*

You need it for three separate jobs:

1. **Checking a plan.** Take each step a retrosynthetic planner proposed, run it forwards, and see whether the target comes back. That *round trip* is the cheapest available plausibility test.
2. **Reading an experiment.** A chemist about to commit a week of work wants to know which of three plausible products dominates.
3. **Automating.** A robot executing a route needs an expectation to compare its analytics against.

The honest framing: this is a model of what *chemists recorded*, which is a narrower thing than a model of chemistry.`,
    },
    {
      kind: 'explain',
      title: 'Three ways to predict a product',
      body: String.raw`- **Template-based.** Apply every reaction template that matches the reactants, generating a list of candidate products, then train a model to *rank* the candidates (Coley et al. 2017). Products are guaranteed chemically valid and you can always point to the rule that fired. Coverage is capped by the template library.
- **Graph edits.** Predict which bonds change. The Weisfeiler–Lehman difference network (Jin et al. 2017) scores every atom pair for likelihood of a bond change, picks the top few, and enumerates products consistent with those edits. It is fast and reflects the physical truth that most atoms do nothing.
- **Sequence to sequence.** Treat the reaction SMILES as a sentence to translate: reactants and reagents in, product out, token by token, with a transformer. No chemistry is hard-coded at all.

Each family also exists in reverse for retrosynthesis — the architectures are shared, only the direction of the data changes.`,
    },
    {
      kind: 'mcq',
      prompt: 'Which claim about a **template-based** forward model is correct?',
      choices: [
        'It can propose a transformation that appears nowhere in its rule set',
        'Its outputs are always parseable, chemically valid molecules',
        'It needs no reaction database to build',
        'It predicts yields as a by-product of ranking candidates',
      ],
      answer: 1,
      why: 'Candidates are produced by applying graph-rewrite rules to real reactants, so they are valid by construction — that is the central advantage. The rule set is extracted from a reaction database and bounds what the model can ever suggest, and ranking candidate products says nothing about how much of the winner you would isolate.',
    },
    {
      kind: 'widget',
      title: 'The Molecular Transformer',
      body: String.raw`Schwaller et al. (2019) pushed the translation framing hardest. The **Molecular Transformer** tokenises the reaction SMILES — reactants, then a separator, then reagents — atom by atom, and decodes the product SMILES autoregressively, with **beam search** returning a ranked list of candidate products and a softmax probability for each. On **USPTO-MIT**, the standard forward-prediction benchmark, it reaches **90.4 % top-1** accuracy when reagents are supplied separately from reactants, and **88.6 %** when reactants and reagents are simply mixed together in one string — both better than the template and graph-edit models of its day, with no chemical rules written by hand. On the harder **USPTO-STEREO** set, which keeps stereochemistry, the same model reaches only about **76–78 %**: a reminder that the headline number belongs to a particular benchmark, not to chemistry.

They also argued that the beam probabilities are a usable **confidence**: the model is well calibrated enough that low-probability predictions really are the ones more likely to be wrong.

Work through all three cases below before reading on.`,
      widget: { type: 'DrugReactionPredict', props: { case: 0, beams: 3 }, caption: 'Case 1 is routine and confident. Case 2 is a selectivity question and the beams split — useful. Case 3 is the failure mode worth remembering.' },
    },
    {
      kind: 'explain',
      title: '"No reaction" is not in the vocabulary',
      body: String.raw`A translation model must emit *something*. Trained only on reactions that produced a product, it has never once been shown an input whose correct output is "nothing happens" — so when you hand it two reactants that are simply unreactive, it confidently invents the product they would have given under conditions you did not supply.

This is not a bug in the architecture; it is the training distribution showing through. Fixes exist and all of them cost data: train on explicit negative examples, add a "no reaction" token and learn when to emit it, or treat low beam confidence as abstention. The last is the only one you get for free, and it is the weakest.

The practical rule: **a forward model's confidence is meaningful only over the kind of reaction it was trained on.** Outside that, confidence and correctness come apart.`,
    },
    {
      kind: 'truefalse',
      prompt: 'If a sequence-to-sequence reaction model assigns 0.95 probability to a product, that product is very likely to form.',
      answer: false,
      why: 'Only if the reaction resembles its training data. Because "no reaction" was never a training label, the model will also assign high probability to the product of a reaction that cannot proceed under the stated conditions. Calibration measured on a held-out slice of the same distribution does not transfer to inputs drawn from outside it.',
    },
    {
      kind: 'explain',
      title: 'Where the reactions come from',
      body: String.raw`Three sources carry essentially the whole field.

- **USPTO.** Daniel Lowe text-mined reactions from US patent grants and applications (1976 onwards) and released them openly: a few million extracted reaction records, heavily duplicated because the same text recurs across applications and the grants that follow them. The cleaned benchmarks carved out of it are much smaller — USPTO-full is of the order of a million reactions, USPTO-50K is fifty thousand. Every benchmark you have heard of — USPTO-50K, USPTO-MIT, USPTO-full — is a slice of this one dump. It is free, which is why it won.
- **Reaxys** and similar commercial databases (CAS SciFinder). Tens of millions of reactions curated from the journal and patent literature, with conditions and yields. Far richer, and licensed — so results on it are not reproducible by outsiders.
- **The Open Reaction Database (ORD)** (Kearnes et al. 2021). A deliberate attempt to fix the above: an open schema and repository for reaction data, designed to accept machine-generated and *unsuccessful* results, not only published highlights.`,
    },
    {
      kind: 'explain',
      title: 'Four biases baked into that data',
      body: String.raw`1. **Almost no failures.** A chemist runs a reaction, it gives 3 % of a tar, and it is never written down. Patents in particular report what worked. The dataset is a survivorship-biased record.
2. **Popularity skew.** Amide couplings, Suzuki couplings, Boc protections and a handful of other transformations dominate medicinal-chemistry data. A model can score well on average while being useless on anything unusual — which is exactly what you wanted help with.
3. **Noisy annotation.** Text mining must infer which molecules are reactants, which are reagents, and which atom in the product came from where. Erroneous **atom mapping** and reagents recorded as reactants are common; several USPTO benchmarks contain duplicated and mis-parsed entries.
4. **Conditions are mostly missing or free text.** Solvent, temperature, time, equivalents and catalyst loading decide the outcome, and in patent prose they are often absent, vague or unparseable.`,
      widget: { type: 'SvgDiagram', props: { svg: survivorSvg }, caption: 'The negative examples are not missing by accident — four separate filters each select for success before the data reaches you.' },
    },
    {
      kind: 'multi',
      prompt: 'Which of these are genuine consequences of training reaction models on text-mined patent data?',
      choices: [
        'The model rarely learns which reactions fail, because failures are seldom recorded',
        'Performance is strongest on the handful of couplings that dominate medicinal chemistry',
        'Atom-mapping errors can teach the model the wrong bond changes',
        'The model learns calibrated yields, because patents report yields reliably',
        'Reported accuracy is inflated when near-duplicate reactions straddle the train/test split',
      ],
      answers: [0, 1, 2, 4],
      why: 'Survivorship bias, popularity skew, mapping noise and duplicate leakage are all well documented in USPTO-derived sets. Yields are the weakest field of all: often absent, often optimised-best-run rather than typical, and reported inconsistently between patents and papers.',
    },
    {
      kind: 'explain',
      title: 'Predicting yield: the experiment that looked easy',
      body: String.raw`Products are discrete; yield is a number, and it is the number a chemist actually wants.

The modern attempt begins with **high-throughput experimentation (HTE)**. Ahneman et al. (*Science* 2018) ran a Buchwald–Hartwig C–N coupling screen of several thousand reactions in plates — a uniform grid of ligands, bases, additives and substrates, with yields measured the same way throughout. A random forest on molecular descriptors predicted held-out yields with high $R^2$. For a moment it looked like yield prediction was a solved supervised-learning problem.

HTE data is precious because it is the rare dataset that contains **zeros**: combinations that gave nothing were run and recorded, because the plate did not care.`,
    },
    {
      kind: 'explain',
      title: 'Why it generalises so poorly',
      body: String.raw`Chuang and Keiser (*Science* 2018) replied with an uncomfortable control. They re-ran the same pipeline with **deliberately uninformative inputs** — vectors of random numbers, and one-hot codes that merely *name* each ligand, base and additive without describing any of its chemistry — and got comparable performance on the random split. If features carrying no chemical information do as well, much of what the model learned was *which combinations in this plate tend to be good*, not chemistry.

Doyle's group replied in turn (Estrada et al., *Science* 2018): the descriptor model can be told apart from the random-feature ones, and it holds up better when whole additives are held out. Read the exchange as a disagreement about *how much* of the signal is chemical, not as a refutation — the lasting contribution is that an uninformative control is now expected.

The deeper issue is the **split**. A random split puts the same ligand, in the same plate, in both train and test, so the model interpolates within a grid it has largely memorised. Split instead by ligand, by substrate class, or by time — the splits that match how you would actually use the model — and performance falls sharply. Schwaller et al. (2021) found the same pattern for a transformer-based yield model: strong on random splits of HTE data, much weaker on out-of-sample ones.

Yield prediction is not solved. It is **interpolation inside a screening plate**, which is genuinely useful and is not the same claim.`,
      widget: { type: 'DrugSplitGap', props: { split: 'scaffold', seed: 4, k: 3 }, caption: 'The general phenomenon, shown for property prediction: the number you report is mostly a statement about how you split the data. Switch between random, scaffold and time splits.' },
    },
    {
      kind: 'numeric',
      prompt: 'A six-step route runs each step at 70 % yield. What is the overall yield, as a percentage? (Give the number to one decimal place.)',
      answer: 11.8,
      tolerance: 0.2,
      unit: '%',
      why: 'Yields multiply: $0.7^6 = 0.1176$, so about 11.8 %. This is why a planner that cheerfully adds a step is doing real damage, and why predicting *per-step* yield to ±10 % still leaves enormous uncertainty about whether a route delivers usable material.',
    },
    {
      kind: 'order',
      prompt: 'Order the steps of an honest evaluation of a new yield-prediction model.',
      steps: [
        'Choose a split that matches the intended use — new ligand, new substrate class, or later in time',
        'Fit an uninformative control, such as random features or the training-set mean, on the same split',
        'Train the real model on the training fold only, tuning on a validation fold',
        'Report performance on the held-out fold alongside the control',
        'State the chemistry the training set covers, and refuse predictions outside it',
      ],
      why: 'The split is chosen first because it defines the question; the trivial control is run so that the headline number has something to beat. Reporting a model without a baseline on a random split is exactly the pattern Chuang and Keiser exposed.',
    },
    {
      kind: 'match',
      prompt: 'Match each resource or model to what it is.',
      pairs: [
        ['USPTO reaction set', 'Openly released reactions text-mined from US patents'],
        ['Reaxys', 'A large curated commercial reaction database with conditions and yields'],
        ['Open Reaction Database', 'An open schema built to accept unsuccessful and machine-generated runs'],
        ['Molecular Transformer', 'Sequence-to-sequence product prediction with beam-search confidence'],
        ['Weisfeiler–Lehman difference network', 'Scores atom pairs for bond changes, then enumerates products'],
      ],
      why: 'The first three are data and the last two are models — and the data choices constrain the models far more than the architectures do. ORD exists precisely because the first two record success much better than failure.',
    },
    {
      kind: 'fill',
      prompt: 'Forward models are trained almost entirely on ___ examples, so a translation model cannot say "___ reaction". Yield models look excellent on a ___ split and much worse on a ligand or time split, which is why an uninformative ___ should always be reported alongside.',
      bank: ['positive', 'no', 'random', 'control', 'negative', 'scaffold'],
      answer: ['positive', 'no', 'random', 'control'],
      why: 'Survivorship in the data and optimism in the split are the two failure modes to check for in any reaction-prediction paper. A control fitted on the same split is what separates "the model learned chemistry" from "the split was easy".',
    },
    {
      kind: 'explain',
      title: 'Key takeaways',
      body: String.raw`- Forward prediction answers "what will these reactants give?" and is the cheapest check on a retrosynthetic plan — the **round trip**.
- Three families: **template-based** (valid and auditable, bounded by the rule set), **graph-edit** (predict the bonds that change), **sequence-to-sequence** (the Molecular Transformer, 90 % top-1 on USPTO-MIT but only about 76–78 % once stereochemistry is kept).
- Beam probabilities are a usable confidence *inside the training distribution*. Outside it, the model cannot say **"no reaction"** and will invent a product.
- The data is **USPTO** (open, text-mined, noisy), **Reaxys** (rich, licensed) and **ORD** (open, designed to hold failures). All of them under-record what did not work.
- **Yield prediction** works well inside an HTE plate and poorly outside one. Ahneman et al. (2018) showed the former; Chuang and Keiser (2018) asked how much of it survives an uninformative control, and the authors' reply disputed how much was lost — the methodological lesson stands either way.
- The single most important question to ask of any result here: **how was the data split, and what baseline was run on the same split?**`,
    },
  ],
  references: [
    { authors: 'Coley, C. W., Barzilay, R., Jaakkola, T. S., Green, W. H., Jensen, K. F.', title: 'Prediction of organic reaction outcomes using machine learning', year: 2017, venue: 'ACS Cent. Sci. 3, 434–443' },
    { authors: 'Jin, W., Coley, C. W., Barzilay, R., Jaakkola, T.', title: 'Predicting organic reaction outcomes with Weisfeiler-Lehman network', year: 2017, venue: 'Proc. NeurIPS 30' },
    { authors: 'Schwaller, P., Laino, T., Gaudin, T., et al.', title: 'Molecular Transformer: a model for uncertainty-calibrated chemical reaction prediction', year: 2019, venue: 'ACS Cent. Sci. 5, 1572–1583' },
    { authors: 'Ahneman, D. T., Estrada, J. G., Lin, S., Dreher, S. D., Doyle, A. G.', title: 'Predicting reaction performance in C–N cross-coupling using machine learning', year: 2018, venue: 'Science 360, 186–190' },
    { authors: 'Chuang, K. V., Keiser, M. J.', title: "Comment on 'Predicting reaction performance in C–N cross-coupling using machine learning'", year: 2018, venue: 'Science 362, eaat8603' },
    { authors: 'Estrada, J. G., Ahneman, D. T., Sheridan, R. P., Dreher, S. D., Doyle, A. G.', title: "Response to Comment on 'Predicting reaction performance in C–N cross-coupling using machine learning'", year: 2018, venue: 'Science 362, eaat8763' },
    { authors: 'Schwaller, P., Vaucher, A. C., Laino, T., Reymond, J.-L.', title: 'Prediction of chemical reaction yields using deep learning', year: 2021, venue: 'Mach. Learn.: Sci. Technol. 2, 015016' },
    { authors: 'Kearnes, S. M., Maser, M. R., Wleklinski, M., et al.', title: 'The Open Reaction Database', year: 2021, venue: 'J. Am. Chem. Soc. 143, 18820–18826' },
  ],
} satisfies LessonContent;
