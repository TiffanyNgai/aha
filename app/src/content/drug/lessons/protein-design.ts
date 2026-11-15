import type { LessonContent } from '../../types';

const loopSvg = `<svg viewBox="0 0 320 206" xmlns="http://www.w3.org/2000/svg">
<g font-size="8.5" text-anchor="middle">
<rect x="4" y="30" width="200" height="86" rx="8" fill="var(--c2)" fill-opacity="0.07" stroke="var(--c2)" stroke-dasharray="4 3"/>
<text x="104" y="24" fill="var(--c2)" font-weight="700">in silico — hours, millions of designs</text>
<rect x="212" y="30" width="104" height="86" rx="8" fill="var(--c5)" fill-opacity="0.07" stroke="var(--c5)" stroke-dasharray="4 3"/>
<text x="264" y="24" fill="var(--c5)" font-weight="700">wet lab — months, dozens</text>
<rect x="12" y="52" width="56" height="40" rx="6" fill="var(--c1)" fill-opacity="0.2" stroke="var(--c1)"/>
<text x="40" y="68" fill="var(--fg)" font-weight="700">backbone</text><text x="40" y="80" fill="var(--muted)">shape only</text>
<rect x="80" y="52" width="56" height="40" rx="6" fill="var(--c3)" fill-opacity="0.2" stroke="var(--c3)"/>
<text x="108" y="68" fill="var(--fg)" font-weight="700">sequence</text><text x="108" y="80" fill="var(--muted)">which residues</text>
<rect x="148" y="52" width="48" height="40" rx="6" fill="var(--c4)" fill-opacity="0.2" stroke="var(--c4)"/>
<text x="172" y="68" fill="var(--fg)" font-weight="700">refold</text><text x="172" y="80" fill="var(--muted)">+ filter</text>
<rect x="220" y="52" width="40" height="40" rx="6" fill="var(--c5)" fill-opacity="0.2" stroke="var(--c5)"/>
<text x="240" y="68" fill="var(--fg)" font-weight="700">express</text><text x="240" y="80" fill="var(--muted)">genes</text>
<rect x="268" y="52" width="40" height="40" rx="6" fill="var(--c5)" fill-opacity="0.2" stroke="var(--c5)"/>
<text x="288" y="68" fill="var(--fg)" font-weight="700">test</text><text x="288" y="80" fill="var(--muted)">bind? fold?</text>
<g stroke="var(--fg)" fill="none" marker-end="url(#ar)">
<path d="M68,72 L78,72"/><path d="M136,72 L146,72"/><path d="M196,72 L218,72"/><path d="M260,72 L266,72"/>
</g>
<defs><marker id="ar" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="var(--fg)"/></marker></defs>
<path d="M288,92 L288,142 L172,142" fill="none" stroke="var(--c6)" stroke-dasharray="4 3" marker-end="url(#ar2)"/>
<defs><marker id="ar2" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="var(--c6)"/></marker></defs>
<circle r="3" fill="var(--c6)"><animateMotion dur="4s" repeatCount="indefinite" path="M288,92 L288,142 L172,142"/></circle>
<text x="230" y="154" fill="var(--c6)">learn from the failures</text>
<text x="160" y="176" fill="var(--muted)">The in-silico funnel is cheap; every arrow into the red box costs real money.</text>
<text x="160" y="190" fill="var(--muted)">Success is measured on the right, never on the left.</text>
</g></svg>`;

export default {
  cards: [
    {
      kind: 'explain',
      title: 'A fold that had never existed',
      body: String.raw`In 2003 Brian Kuhlman and David Baker's group asked a computer for something nature had not made: a 93-residue α/β protein with a topology absent from the Protein Data Bank. They called it **Top7**. They synthesised the gene, expressed the protein, crystallised it — and the structure matched the design model to about 1.2 Å (Kuhlman et al. 2003).

That is the whole promise of computational protein design. You are not searching a catalogue for a molecule that happens to work. You are writing one.

This unit covers how that is done today: generating a shape, choosing a sequence for it, checking the two agree, and being honest about how often the result actually works.`,
    },
    {
      kind: 'recall',
      title: 'Protein structure, in four levels',
      points: [
        '**Primary**: the sequence of amino acids, written N-terminus to C-terminus.',
        '**Secondary**: local backbone patterns held by backbone hydrogen bonds — α-helices and β-sheets.',
        '**Tertiary**: how those elements pack into one 3D fold, usually around a **buried hydrophobic core**.',
        '**Quaternary**: how several chains assemble.',
        'The 20 side chains differ in size, charge and greasiness; burying a charged one without a partner is expensive.',
      ],
      link: 'bio/protein-structure',
    },
    {
      kind: 'explain',
      title: 'Why this is not medicinal chemistry',
      body: String.raw`Designing a protein and designing a small molecule are different jobs:

- **The object folds.** A small molecule is more or less the thing you drew. A protein is a one-dimensional string that must spontaneously find one three-dimensional shape. You design the string; the shape is a consequence you have to predict.
- **The search space is astronomically larger.** Enumerable drug-like [chemical space](@drug/chemical-space) is often quoted at around $10^{60}$ molecules. A 100-residue protein has $20^{100} \approx 10^{130}$ possible sequences.
- **The interfaces are flat and large.** A small-molecule pocket buries roughly 300–500 Å²; a protein–protein interface typically buries around 1500–2000 Å² of mostly featureless surface. That is bad news for small molecules and the reason biologics can hit "undruggable" targets ([new modalities](@drug/new-modalities)).
- **The downstream problems change.** No oral dosing, no [CYP metabolism](@med/drug-metabolism-cyp) to worry about — instead expression yield, aggregation, immunogenicity and cold-chain storage.`,
    },
    {
      kind: 'numeric',
      prompt: String.raw`How many sequences of length 60 can be written from the 20 standard amino acids? Give $\log_{10}$ of that number, to one decimal place.`,
      answer: 78.1,
      tolerance: 0.2,
      why: String.raw`$20^{60}$, so $\log_{10}(20^{60}) = 60\log_{10}20 = 60 \times 1.30103 = 78.06$. There are roughly $10^{78}$ sequences for a small 60-residue domain — within a few orders of magnitude of the estimated $10^{80}$ atoms in the observable universe. Enumeration is never the plan; the point of design is to go straight to a good region.`,
    },
    {
      kind: 'explain',
      title: 'The inverse problem, split in two',
      body: String.raw`[Structure prediction](@drug/alphafold) answers: *given this sequence, what shape?* Design asks the inverse: *given this shape (or this job), what sequence?*

Almost every modern pipeline splits the inverse problem in two:

1. **Backbone generation** — produce the 3D trace of the main chain (N, Cα, C atoms per residue) that could do the job. No side chains yet, so no sequence yet.
2. **Sequence design**, also called **inverse folding** — choose the amino acid at each position so that this backbone is the sequence's preferred fold.

Then a third step checks the two agree: fold the designed sequence with a predictor and see whether you get your backbone back.`,
    },
    {
      kind: 'widget',
      title: 'The design cycle',
      body: 'Everything to the left of the red box is simulation: fast, cheap, and only ever a prediction. The experiment on the right is the only place where "it worked" means anything.',
      widget: { type: 'SvgDiagram', props: { svg: loopSvg }, caption: 'A typical campaign generates $10^4$–$10^6$ designs in silico, filters them down to tens or hundreds, orders synthetic genes, and tests those.' },
    },
    {
      kind: 'explain',
      title: 'The classical route: Rosetta fixed-backbone design',
      body: String.raw`For twenty years the standard method was **Rosetta fixed-backbone design**. You hand it a backbone and it answers two coupled questions at once:

- which **amino acid** sits at each position, and
- which **rotamer** — which of the handful of commonly observed side-chain conformations — that amino acid adopts.

Side chains are drawn from a **rotamer library** (the backbone-dependent Dunbrack library), so the problem becomes discrete: pick one label per position, minimising a physically motivated energy. Rosetta solves it by **simulated annealing**, proposing single-position changes and accepting uphill moves less and less often as a Monte-Carlo temperature falls.`,
    },
    {
      kind: 'widget',
      title: 'Pack the core yourself',
      body: 'Six buried positions, eight choices each. Tap a position to cycle its amino acid, or press Anneal to watch Monte Carlo do it. Try filling the core with tryptophans, and then with alanines.',
      widget: {
        type: 'DrugRotamerPack',
        props: { anneal: false },
        caption: 'Over-pack and you pay a steep repulsive price; under-pack and you leave a void. Bury a polar side chain with no hydrogen-bond partner and you pay for that too. The real packer does this for a hundred positions with tens of rotamers each.',
      },
    },
    {
      kind: 'mcq',
      prompt: 'Why does a design energy function punish a buried polar or charged side chain that has no hydrogen-bonding partner?',
      choices: [
        'Because burying it costs the desolvation penalty of stripping off its water without paying it back',
        'Because polar atoms are larger than non-polar atoms and will not fit',
        'Because polar residues cannot appear in α-helices',
        'Because the rotamer library contains no conformations for polar residues',
      ],
      answer: 0,
      why: 'A charged or polar group in water is hydrogen-bonded to solvent. Moving it into a greasy core breaks those bonds; unless a partner inside replaces them, the move costs free energy. Size is not the issue — lysine and leucine have almost the same volume — and polar residues are common in helices and well represented in rotamer libraries.',
    },
    {
      kind: 'explain',
      title: 'What is in the energy function',
      body: String.raw`Rosetta's all-atom energy (the current version is called **REF15**, Alford et al. 2017) is a weighted sum of terms, each a function of atom positions:

- **Lennard-Jones** attraction and repulsion, split into \`fa_atr\` and \`fa_rep\` — the same physics as a [force field](@drug/force-fields), but with a softened repulsive wall so that annealing is not trapped by tiny clashes.
- **Implicit solvation** (\`fa_sol\`, Lazaridis–Karplus): burying a polar atom costs, burying a greasy one pays.
- **Hydrogen bonding**, with explicit orientation dependence.
- **Coulomb electrostatics** with a distance-dependent dielectric.
- **Statistical terms**: the probability of a rotamer given the backbone (\`fa_dun\`) and of backbone torsions (\`rama\`), both derived from the PDB.
- **Reference energies** per amino acid, which set the baseline composition.

The weights were fitted to reproduce experimental data, so the output is in **Rosetta Energy Units**, only loosely convertible to kcal/mol. It is a *scoring* function, not a free energy.`,
    },
    {
      kind: 'multi',
      prompt: 'Which of these are genuine limitations of classical Rosetta fixed-backbone design? (Select all.)',
      choices: [
        'The backbone is frozen, so the sequence cannot ask for a slightly different shape',
        'Energies are in Rosetta Energy Units and are not true binding or folding free energies',
        'It cannot place side chains at all, only backbones',
        'Annealing over rotamers is a heuristic search with no guarantee of finding the global optimum',
        'It requires an experimentally determined structure of the designed protein as input',
      ],
      answers: [0, 1, 3],
      why: 'Freezing the backbone, the heuristic nature of the Monte-Carlo packer, and the fact that REU are not free energies are all real constraints. Placing side chains is precisely what the packer does, and the input backbone can be a designed or predicted one — no experimental structure of the design is needed (there is none yet).',
    },
    {
      kind: 'explain',
      title: 'Hallucination: the first deep-learning route',
      body: String.raw`The first deep-learning designs did not generate backbones directly. In **network hallucination** (Anishchenko et al. 2021) you start from a *random* sequence, run a structure predictor on it, and then change the sequence by Monte Carlo so that the predicted structure becomes as **confident and non-random-looking** as possible — formally, so that the predicted distance maps move far away from a background distribution.

Optimise long enough and the network "hallucinates" a sequence it is sure folds into something. Many of those designs expressed as soluble monomers, and experimental structures of a few of them matched the hallucinated models. It was a striking proof that a structure predictor contains enough knowledge to design with — but each design needs its own expensive optimisation run.`,
    },
    {
      kind: 'explain',
      title: 'The modern stack',
      body: String.raw`Since 2022 the standard pipeline is three deep models in a row:

1. **[RFdiffusion](@drug/rfdiffusion-backbones)** (or a similar generative model) proposes backbones — unconditionally, around a fixed functional motif, or against a target surface.
2. **[ProteinMPNN](@drug/inverse-folding)** writes sequences for each backbone, in about a second each.
3. **[AlphaFold2](@drug/alphafold)** or **[ESMFold](@drug/protein-language-models)** folds those sequences back, and the designs whose predictions reproduce the intended backbone survive.

The three steps are independent models that happen to compose. That modularity is why the field moved so fast: swap a better generator in, and the rest of the pipeline is unchanged.`,
    },
    {
      kind: 'order',
      prompt: 'Put a modern de novo binder campaign in order.',
      steps: [
        'Choose the target and pick hotspot residues on its surface',
        'Generate thousands of backbones against that surface',
        'Design several sequences per backbone with an inverse-folding model',
        'Re-predict each sequence and keep those that reproduce the designed complex',
        'Order synthetic genes for the survivors and express them',
        'Measure binding, then solve a structure for the best hits',
      ],
      why: 'Design runs shape-first, then sequence, then an in-silico check, and only then does anything get made. Re-prediction before ordering is the cheap filter that decides how many of your expensive wet-lab slots are wasted.',
    },
    {
      kind: 'explain',
      title: 'The filters are proxies, not proof',
      body: String.raw`Three numbers do most of the filtering, and all three are predictions about predictions:

- **Self-consistency RMSD (scRMSD)**: design sequences for a backbone, fold them, and measure the backbone RMSD between prediction and design. Under about 2 Å is the usual pass mark.
- **pLDDT**: the predictor's own per-residue confidence.
- **Interface predicted aligned error (pAE interaction)**: for a binder, the predicted error in the relative placement of binder and target.

A design that passes all three has only shown that a generator and a predictor agree with each other. They share training data, biases and blind spots. Nothing has been measured. Expect most passing designs to fail in the lab — the next lesson puts numbers on "most".`,
    },
    {
      kind: 'truefalse',
      prompt: 'A design with self-consistency RMSD of 0.8 Å and mean pLDDT of 92 is very likely to fold and bind as intended when expressed.',
      answer: false,
      why: 'Those numbers say a structure predictor is confident that this sequence adopts the backbone you generated. They say nothing about expression, solubility, aggregation, or whether the modelled interface is real. In many published campaigns only a small fraction of designs that pass such filters turn out to bind.',
    },
    {
      kind: 'fill',
      prompt: 'Design is split into ___ generation, then sequence design (also called ___ folding), then a check in which the designed sequence is folded by a structure ___ and compared with the intended shape.',
      bank: ['backbone', 'inverse', 'predictor', 'ligand', 'forward', 'docking'],
      answer: ['backbone', 'inverse', 'predictor'],
      why: 'Shape first, sequence second, and the self-consistency check third. "Forward folding" is what the predictor does in the check — the design step itself goes the other way, which is why it is called inverse folding.',
    },
    {
      kind: 'match',
      prompt: 'Match each milestone to what it showed.',
      pairs: [
        ['Top7 (Kuhlman et al. 2003)', 'Computation alone can design a brand-new fold'],
        ['Hallucination (Anishchenko et al. 2021)', 'A structure predictor can be optimised against to invent proteins'],
        ['RFdiffusion (Watson et al. 2023)', 'Backbones can be generated directly by denoising'],
        ['ProteinMPNN (Dauparas et al. 2022)', 'A fast network writes sequences far better than the old packer'],
      ],
      why: 'The four steps are: physics-based design, optimising against a predictor, generative backbones, and learned inverse folding. The last two are the pair that pushed experimental success rates up, and each has its own lesson in this unit.',
    },
    {
      kind: 'explain',
      title: 'Key takeaways',
      body: String.raw`- Protein design is an **inverse problem**: the sequence you write has to fold itself into the shape you want.
- The space is vast ($20^{100}\approx10^{130}$) and protein–protein interfaces are large and flat, which is exactly why biologics reach targets small molecules cannot.
- **Rosetta fixed-backbone design** picks amino acids *and* rotamers by simulated annealing under a weighted all-atom energy (REF15): Lennard-Jones, implicit solvation, hydrogen bonds, electrostatics, rotamer and backbone statistics. Its units are **REU**, not free energies.
- **Top7** proved the idea in 2003; **hallucination** proved predictors could be designed against in 2021.
- The modern stack is **generate a backbone → inverse-fold it → re-predict and filter**.
- **scRMSD, pLDDT and pAE interaction are proxies.** Two models agreeing is not an experiment.`,
    },
  ],
  references: [
    { authors: 'Kuhlman, B., Dantas, G., Ireton, G. C., Varani, G., Stoddard, B. L., Baker, D.', title: 'Design of a novel globular protein fold with atomic-level accuracy', year: 2003, venue: 'Science 302, 1364–1368' },
    { authors: 'Huang, P.-S., Boyken, S. E., Baker, D.', title: 'The coming of age of de novo protein design', year: 2016, venue: 'Nature 537, 320–327' },
    { authors: 'Alford, R. F., Leaver-Fay, A., Jeliazkov, J. R., et al.', title: 'The Rosetta all-atom energy function for macromolecular modeling and design', year: 2017, venue: 'J. Chem. Theory Comput. 13, 3031–3048' },
    { authors: 'Anishchenko, I., Pellock, S. J., Chidyausiku, T. M., et al.', title: 'De novo protein design by deep network hallucination', year: 2021, venue: 'Nature 600, 547–552' },
    { authors: 'Dauparas, J., Anishchenko, I., Bennett, N., et al.', title: 'Robust deep learning-based protein sequence design using ProteinMPNN', year: 2022, venue: 'Science 378, 49–56' },
    { authors: 'Watson, J. L., Juergens, D., Bennett, N. R., et al.', title: 'De novo design of protein structure and function with RFdiffusion', year: 2023, venue: 'Nature 620, 1089–1100' },
  ],
} satisfies LessonContent;
