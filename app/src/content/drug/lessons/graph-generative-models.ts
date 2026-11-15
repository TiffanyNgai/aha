import type { LessonContent } from '../../types';

const growSvg = `<svg viewBox="0 0 320 160" xmlns="http://www.w3.org/2000/svg">
<g font-size="8" text-anchor="middle">
${[0, 1, 2, 3].map((k) => {
  const x = 40 + k * 80;
  const atoms = [[[0, 0]], [[0, 0], [16, -9]], [[0, 0], [16, -9], [32, 0]], [[0, 0], [16, -9], [32, 0], [16, 16]]][k] as number[][];
  const bonds = [[], [[0, 1]], [[0, 1], [1, 2]], [[0, 1], [1, 2], [0, 3]]][k] as number[][];
  const cols = ['var(--fg)', 'var(--c2)', 'var(--fg)', 'var(--c5)'];
  return `<g transform="translate(${x - 16},54)">
${bonds.map((b) => `<line x1="${atoms[b[0]][0]}" y1="${atoms[b[0]][1]}" x2="${atoms[b[1]][0]}" y2="${atoms[b[1]][1]}" stroke="var(--fg)" stroke-width="1.6"/>`).join('')}
${atoms.map((a, i) => `<circle cx="${a[0]}" cy="${a[1]}" r="5.5" fill="${cols[i]}" opacity="${i === atoms.length - 1 ? 1 : 0.45}"/>`).join('')}
</g>
<text x="${x}" y="24" fill="var(--fg)" font-weight="700">step ${k + 1}</text>
<text x="${x}" y="100" fill="var(--muted)">${['add C', 'add N, bond to C', 'add C, bond to N', 'add O, bond to C'][k]}</text>`;
}).join('\n')}
<text x="160" y="124" fill="var(--c1)" font-weight="700">valence mask at every step</text>
<text x="160" y="138" fill="var(--muted)">an atom already at its valence limit is removed from the action set,</text>
<text x="160" y="150" fill="var(--muted)">so an impossible bond is never even an option</text>
</g>
<g stroke="var(--fg)" stroke-width="1" opacity="0.5">
<path d="M64,58 L72,58"/><path d="M144,58 L152,58"/><path d="M224,58 L232,58"/>
</g></svg>`;

export default {
  cards: [
    {
      kind: 'explain',
      title: 'Generate the thing itself',
      body: String.raw`A SMILES string is a *serialisation* of a molecule, and a fragile one: delete a bracket and it stops being chemistry. Generating strings means a model must spend capacity learning a syntax that has nothing to do with molecules — matching ring-closure digits, balancing parentheses.

**Graph generative models** skip the encoding and build the object directly: a set of atoms (nodes, labelled by element, charge, maybe chirality) and bonds (edges, labelled by order). Two consequences follow immediately:

- the model can be made **permutation invariant** — atom numbering is arbitrary and should not matter;
- **validity can be enforced as you build**, because you always know how many bonds each atom already has.`,
    },
    {
      kind: 'recall',
      title: 'Graph neural networks, briefly',
      points: [
        'A GNN passes **messages** along edges: each node updates its vector from its neighbours, repeated for several layers.',
        'After $T$ layers a node "sees" everything within $T$ bonds — its receptive field.',
        'A permutation-invariant **readout** (sum, mean, attention) turns node vectors into one graph vector.',
        'The same machinery that *encodes* a molecular graph also scores the next action when *generating* one.',
      ],
      link: 'ml/gnns',
    },
    {
      kind: 'widget',
      title: 'Message passing, the encoder half',
      body: String.raw`Before a model can decide what to add to a partial molecule, it must summarise what is already there. Step through message passing on a small molecule: every atom pools its neighbours, and after a few steps each atom's vector reflects its whole local environment.

A generative model reuses exactly this: encode the partial graph, then predict the next action from the node vectors.`,
      widget: { type: 'DrugMessagePassing', props: { molecule: 'paracetamol', steps: 1 }, caption: 'Tap an atom to see its receptive field after $t$ steps. The mean vector at the bottom is a permutation-invariant summary of the partial molecule.' },
    },
    {
      kind: 'explain',
      title: 'Autoregressive graph generation',
      body: String.raw`The dominant recipe builds a molecule one decision at a time. At each step the model encodes the partial graph with a GNN and then chooses an action:

1. **stop**, or add a new atom of some element;
2. choose which existing atom to **bond** it to (or add a bond between two existing atoms);
3. choose the **bond order**.

The decisive trick is **masking**. Before sampling, every action that would violate a valence rule — a fifth bond to carbon, a bond to an atom that is already full — has its probability set to zero. The model therefore cannot produce an invalid molecule even in principle, and it never wastes capacity learning not to.

Examples: **GCPN** (You et al. 2018) trains such a policy with reinforcement learning and an adversarial reward; **GraphAF** (Shi et al. 2020) does it with an autoregressive flow; **MolGAN** (De Cao & Kipf 2018) instead emits a whole adjacency tensor at once.`,
      widget: { type: 'SvgDiagram', props: { svg: growSvg }, caption: 'Each step is a classification over a masked action set. The mask is where validity comes from.' },
    },
    {
      kind: 'mcq',
      prompt: 'Why can an autoregressive graph generator guarantee 100 % chemical validity while a character-level SMILES model cannot?',
      choices: [
        'Graph models are trained on more data',
        'Valence rules can be applied as a mask over the next action, so illegal choices have probability zero',
        'Graphs have fewer atoms than SMILES strings',
        'Graph models use larger neural networks',
      ],
      answer: 1,
      why: 'Validity in a graph model is a hard constraint on the action set at each step, checked with ordinary chemistry rules. A character-level SMILES model has to *learn* to close rings and respect valence statistically, so some fraction of samples fails. Data volume and network size do not change this.',
    },
    {
      kind: 'explain',
      title: 'Atoms are small; fragments are better',
      body: String.raw`Atom-by-atom generation has a practical weakness: a benzene ring takes six atom actions and six bond actions, and any slip in the middle gives a strange, strained ring that no chemist would draw. Long action sequences also make credit assignment hard.

So most modern models generate **fragments** or **motifs** instead — whole rings, functional groups, common linkers — drawn from a vocabulary mined from the training set. [JT-VAE](@drug/latent-space-design) is the canonical example: decode a tree of substructures, then assemble. Others attach motifs directly to a growing graph.

The trade-off is explicit and worth stating: a fragment vocabulary **buys realism and shortens the search, at the cost of never inventing a ring system the vocabulary lacks**. For a lead-optimisation programme that is usually a feature. For genuine scaffold discovery it is a cage.`,
    },
    {
      kind: 'truefalse',
      prompt: 'A fragment-based generator can, in principle, produce ring systems that do not appear in its fragment vocabulary.',
      answer: false,
      why: 'Rings enter only as whole vocabulary items, so an unseen ring system cannot be assembled — fusing two known rings is possible, inventing a new one is not. Atom-by-atom generators can reach such structures, which is their compensation for being harder to train.',
    },
    {
      kind: 'explain',
      title: 'Three ways to order the decisions',
      body: String.raw`"Autoregressive" hides a design choice: in what order are the atoms generated? A molecular graph has no natural ordering, so training must pick one — canonical SMILES order, breadth-first from a random start, or a random permutation. Different choices give different models of the same data, and the likelihood a model reports is only comparable within one convention.

Two alternatives dodge the ordering question:

- **One-shot** models (MolGAN and friends) emit the whole adjacency and atom-type tensor in a single pass. Fast, permutation-aware, but struggles to scale past small molecules and tends to produce low-quality graphs.
- **Discrete diffusion** over graphs (DiGress, Vignac et al. 2023) starts from a random graph and iteratively denoises node and edge categories. No ordering is needed, and the whole graph is revised at every step.`,
    },
    {
      kind: 'match',
      prompt: 'Match each family of graph generator to its defining mechanism.',
      pairs: [
        ['Autoregressive atom-by-atom', 'Sample masked actions that add atoms and bonds in sequence'],
        ['Fragment / motif based', 'Assemble whole substructures from a learned vocabulary'],
        ['One-shot (adjacency tensor)', 'Emit all nodes and edges in a single forward pass'],
        ['Discrete graph diffusion', 'Denoise node and edge categories over many steps'],
      ],
      why: 'The families differ in how many decisions they make and in what order. Sequential models get easy valence masking; one-shot and diffusion models avoid having to invent an atom ordering, but must keep the whole graph coherent.',
    },
    {
      kind: 'widget',
      title: 'Grading the output',
      body: String.raw`Validity is no longer interesting once it is guaranteed by construction — which is exactly why graph papers must be judged on everything else. Sample a batch and look at what the headline metrics miss.`,
      widget: { type: 'DrugGenMetrics', props: { generator: 'alkane' }, caption: 'The *alkane* generator is valid, unique and novel — and worthless. Switch to *copycat* to see the opposite failure: perfectly drug-like, zero novelty.' },
    },
    {
      kind: 'explain',
      title: 'What the benchmarks actually measure',
      body: String.raw`**MOSES** (Polykovskiy et al. 2020, about 1.9 million lead-like ZINC molecules) and **GuacaMol** (Brown et al. 2019, a ChEMBL-derived set) report batteries that go well beyond the big three:

- **Fréchet ChemNet Distance (FCD)** — distance between generated and reference sets in a learned chemical feature space; sensitive to subtle distribution shifts.
- **SNN** — average similarity of each generated molecule to its nearest reference neighbour.
- **Fragment (Frag) and scaffold (Scaf) similarity** — do you make the same *kinds* of pieces and the same chemotypes?
- **Internal diversity** — average pairwise dissimilarity within the generated set; the direct mode-collapse detector.
- **Filters** — the fraction passing standard medicinal-chemistry structural alerts.

Read these together. A model with perfect validity, high novelty and poor FCD is generating valid molecules that are not like medicines.`,
    },
    {
      kind: 'multi',
      prompt: 'A graph model reports 100 % validity, 99 % novelty and a poor (large) Fréchet ChemNet Distance. What can you reasonably conclude? (Select all.)',
      choices: [
        'Validity tells you almost nothing here, since it is enforced by construction',
        'The generated molecules differ in aggregate from the reference distribution',
        'The model has discovered a promising new region of drug-like chemistry',
        'High novelty is consistent with generating strange, non-drug-like structures',
        'The model has definitely mode-collapsed',
      ],
      answers: [0, 1, 3],
      why: 'Construction-guaranteed validity is uninformative, a large FCD says the batch does not resemble the reference set, and novelty only means "unseen". Calling the region promising needs evidence the metrics do not provide, and mode collapse would show up as low internal diversity or low uniqueness, which were not reported.',
    },
    {
      kind: 'explain',
      title: 'The genetic-algorithm problem',
      body: String.raw`Jensen (2019, *Chem. Sci.*) implemented a plain **graph genetic algorithm**: take a population of molecules, mutate them (change an atom, add or remove a ring, break a bond) and cross them over (swap fragments between two parents), keep the best, repeat. No neural network anywhere.

On goal-directed benchmarks it matched or beat the deep generative models of the day, and GuacaMol reported the same sting from its own baselines. A follow-on literature on sample-efficiency benchmarks has reinforced the point: when the oracle is cheap, search beats learning surprisingly often.

The honest conclusion is not "deep learning is useless here". It is that **a new generative architecture must be compared against a competent genetic algorithm**, and that the interesting claim is usually about *sample efficiency* — how few oracle calls you need — rather than the best score eventually reached.`,
    },
    {
      kind: 'numeric',
      prompt: 'An atom-by-atom generator builds benzene, C₆H₆, using one action to add each heavy atom and one action to form each bond (hydrogens implicit). How many actions is that in total?',
      answer: 12,
      tolerance: 0,
      unit: 'actions',
      why: '6 carbons plus 6 ring bonds (a ring of $n$ atoms has $n$ bonds, since the last bond closes it) = 12 actions. A fragment-based generator places the same ring in one action — the reason motif vocabularies shorten the search so dramatically.',
    },
    {
      kind: 'fill',
      prompt: 'Graph generators enforce validity with a valence ___ over the next action; ___ vocabularies place whole rings in one step; and the metric that compares generated and reference sets in a learned feature space is the ___ ChemNet Distance.',
      bank: ['mask', 'fragment', 'Fréchet', 'prior', 'atom', 'Tanimoto'],
      answer: ['mask', 'fragment', 'Fréchet'],
      why: 'Masking zeroes out illegal actions before sampling; fragment (motif) vocabularies trade coverage for realism and speed; FCD is the distribution-level metric, whereas Tanimoto compares two individual fingerprints.',
    },
    {
      kind: 'explain',
      title: 'Key takeaways',
      body: String.raw`- Generating the **graph** rather than a string removes the syntax problem and allows **valence masking**, so validity becomes a construction guarantee rather than a statistic.
- **Autoregressive** models add atoms and bonds step by step (GCPN, GraphAF); **fragment-based** models assemble vocabulary pieces (JT-VAE); **one-shot** and **discrete-diffusion** models avoid picking an atom ordering at all.
- Fragment vocabularies buy realism and speed but **cannot invent an unseen ring system**.
- Once validity is free, judge models on **FCD, scaffold and fragment similarity, internal diversity and filter pass rates** — and on the molecules themselves.
- A **graph genetic algorithm** is the baseline that matters (Jensen 2019); the defensible claim for a learned model is usually **sample efficiency**, not peak score.`,
    },
  ],
  references: [
    { authors: 'Jin, W., Barzilay, R., Jaakkola, T.', title: 'Junction tree variational autoencoder for molecular graph generation', year: 2018, venue: 'Proc. ICML 2018, PMLR 80, 2323–2332' },
    { authors: 'You, J., Liu, B., Ying, R., Pande, V., Leskovec, J.', title: 'Graph convolutional policy network for goal-directed molecular graph generation', year: 2018, venue: 'Adv. Neural Inf. Process. Syst. 31 (NeurIPS 2018)' },
    { authors: 'Shi, C., Xu, M., Zhu, Z., Zhang, W., Zhang, M., Tang, J.', title: 'GraphAF: a flow-based autoregressive model for molecular graph generation', year: 2020, venue: 'Proc. ICLR 2020 (arXiv:2001.09382)' },
    { authors: 'De Cao, N., Kipf, T.', title: 'MolGAN: an implicit generative model for small molecular graphs', year: 2018, venue: 'arXiv:1805.11973 (ICML 2018 Workshop on Theoretical Foundations and Applications of Deep Generative Models)' },
    { authors: 'Jensen, J. H.', title: 'A graph-based genetic algorithm and generative model/Monte Carlo tree search for the exploration of chemical space', year: 2019, venue: 'Chem. Sci. 10, 3567–3572' },
    { authors: 'Polykovskiy, D., Zhebrak, A., Sanchez-Lengeling, B., et al.', title: 'Molecular Sets (MOSES): a benchmarking platform for molecular generation models', year: 2020, venue: 'Front. Pharmacol. 11, 565644' },
    { authors: 'Vignac, C., Krawczuk, I., Siraudin, A., et al.', title: 'DiGress: discrete denoising diffusion for graph generation', year: 2023, venue: 'Proc. ICLR 2023 (arXiv:2209.14734)' },
  ],
} satisfies LessonContent;
