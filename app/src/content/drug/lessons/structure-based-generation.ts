import type { LessonContent } from '../../types';

const pocketSvg = `<svg viewBox="0 0 320 160" xmlns="http://www.w3.org/2000/svg">
<path d="M26,132 C26,52 66,22 118,22 C150,22 162,46 160,66 C158,88 134,92 134,110 C134,126 150,132 170,132 C214,132 236,96 236,62 C236,38 258,24 282,30"
 fill="none" stroke="var(--c4)" stroke-width="13" stroke-linecap="round" opacity="0.3"/>
<text x="250" y="20" font-size="8" fill="var(--c4)" text-anchor="middle">protein</text>
<g>
${[[96, 70], [112, 86], [86, 94], [106, 104], [120, 64], [92, 112], [122, 98], [78, 80]].map((p, i) => `
<circle cx="${p[0]}" cy="${p[1]}" r="4.5" fill="var(--c${(i % 5) + 1})">
<animate attributeName="cx" values="${p[0] - 34 + (i % 3) * 12};${p[0]}" dur="5s" begin="${i * 0.12}s" repeatCount="indefinite"/>
<animate attributeName="cy" values="${p[1] + 30 - (i % 4) * 10};${p[1]}" dur="5s" begin="${i * 0.12}s" repeatCount="indefinite"/>
<animate attributeName="opacity" values="0.15;1" dur="5s" begin="${i * 0.12}s" repeatCount="indefinite"/>
</circle>`).join('')}
</g>
<g font-size="8" fill="var(--muted)">
<text x="12" y="16">t = T: a cloud of noise</text>
<text x="12" y="152">t = 0: atom types and 3D coordinates, shaped by the pocket it is conditioned on</text>
</g>
<text x="104" y="140" font-size="8" fill="var(--c1)" text-anchor="middle" font-weight="700">ligand</text>
</svg>`;

const equiSvg = `<svg viewBox="0 0 320 140" xmlns="http://www.w3.org/2000/svg">
<g font-size="8" text-anchor="middle">
<text x="80" y="14" fill="var(--fg)" font-weight="700">rotate the pocket …</text>
<text x="240" y="14" fill="var(--fg)" font-weight="700">… and the output rotates with it</text>
<g transform="translate(80,74)">
<g><animateTransform attributeName="transform" type="rotate" values="0;360" dur="9s" repeatCount="indefinite"/>
<path d="M-34,16 C-34,-20 -8,-34 16,-26" fill="none" stroke="var(--c4)" stroke-width="10" opacity="0.35" stroke-linecap="round"/>
<circle cx="-10" cy="-6" r="4" fill="var(--c1)"/><circle cx="4" cy="2" r="4" fill="var(--c2)"/>
<line x1="-10" y1="-6" x2="4" y2="2" stroke="var(--fg)" stroke-width="1.5"/>
</g></g>
<g transform="translate(240,74)">
<g><animateTransform attributeName="transform" type="rotate" values="0;360" dur="9s" repeatCount="indefinite"/>
<path d="M-34,16 C-34,-20 -8,-34 16,-26" fill="none" stroke="var(--c4)" stroke-width="10" opacity="0.35" stroke-linecap="round"/>
<circle cx="-10" cy="-6" r="4" fill="var(--c1)"/><circle cx="4" cy="2" r="4" fill="var(--c2)"/>
<line x1="-10" y1="-6" x2="4" y2="2" stroke="var(--fg)" stroke-width="1.5"/>
</g></g>
<text x="160" y="78" font-size="14" fill="var(--fg)">=</text>
<text x="160" y="126" fill="var(--muted)">E(3) equivariance: the model does not have to learn chemistry separately</text>
<text x="160" y="136" fill="var(--muted)">for every orientation, so far less data and compute is wasted</text>
</g></svg>`;

export default {
  cards: [
    {
      kind: 'explain',
      title: 'Design inside the hole',
      body: String.raw`Everything so far generates molecules in the abstract and then asks a scoring function whether they fit. **Structure-based generation** inverts that: the binding pocket is an *input*, and the model emits a molecule already positioned inside it.

The appeal is obvious. Instead of sampling from all of drug-like chemistry and hoping a tiny fraction is complementary to your target, you condition the generator on the actual shape, charge and hydrogen-bonding pattern of the site. The classic human skill of "growing" a ligand into a pocket becomes a learned sampler.

This only became practical when two things arrived: large sets of protein–ligand complexes with 3D coordinates, and neural networks that respect the symmetries of 3D space.`,
    },
    {
      kind: 'recall',
      title: 'What docking gave us, and did not',
      points: [
        'Docking searches **position, orientation and torsions** of an *existing* ligand in a rigid pocket, then scores it.',
        'It is good at poses and at **enriching** a large library, poor at absolute affinity.',
        'It can only rank molecules you already have — the library is the limit.',
        'Generative pocket-conditioned models remove that limit, but inherit docking scores as their usual *judge*.',
      ],
      link: 'drug/docking',
    },
    {
      kind: 'explain',
      title: 'Where the training data comes from',
      body: String.raw`Two datasets dominate this literature:

- **CrossDocked2020** (Francoeur et al. 2020) — millions of poses produced by cross-docking ligands into related binding sites from the PDB, filtered by pocket similarity and pose quality. Large, but the great majority of its complexes are *computationally generated*, not experimental.
- **Binding MOAD** — curated experimentally determined complexes with measured affinities. Much smaller, much cleaner.

The usual filtered CrossDocked training split contains on the order of $10^5$ pocket–ligand pairs. That sounds like a lot until you remember how many distinct protein folds and chemotypes exist. **The data is the binding constraint on this whole field**, and much of it is docking output — so a model trained on it partly learns to imitate a docking program.`,
    },
    {
      kind: 'mcq',
      prompt: 'Why is it a concern that much of CrossDocked2020 consists of computationally docked poses rather than crystal structures?',
      choices: [
        'Docked poses take up more disk space',
        'A model trained on them partly learns to reproduce the docking program’s errors and biases, not experimental reality',
        'Docked poses have no atom coordinates',
        'It makes the dataset too small to train on',
      ],
      answer: 1,
      why: 'Supervised models imitate their labels. If the labels are a search algorithm’s best guess, the model inherits that algorithm’s systematic errors — and evaluating the result with the same kind of docking score hides the problem rather than revealing it.',
    },
    {
      kind: 'explain',
      title: 'Autoregressive 3D: Pocket2Mol',
      body: String.raw`**Pocket2Mol** (Peng et al. 2022, *ICML*) samples a ligand atom by atom inside the pocket. An E(3)-equivariant graph network encodes the protein atoms together with the atoms placed so far, and then three heads decide, at each step:

- whether to continue at all;
- which element the next atom is;
- **where** it goes, as a position relative to a chosen "frontier" atom, and which bonds it forms.

The design point is that sampling is a direct forward pass — earlier 3D generators (for example Luo et al. 2021, who used MCMC) sampled positions from a predicted atomic density with MCMC, which was far slower and produced less chemically sensible geometry.

Being autoregressive, it inherits the usual benefits — valence masking, cheap conditioning on what is already placed — and the usual cost: the atom ordering is an arbitrary modelling choice.`,
    },
    {
      kind: 'recall',
      title: 'Diffusion models in one minute',
      points: [
        'A **forward** process gradually adds Gaussian noise to data until it is pure noise.',
        'A network is trained to predict that noise (equivalently, the score $\\nabla_x \\log p_t(x)$) at every noise level.',
        'Sampling runs the process **backwards**: start from noise and denoise step by step.',
        'The data here is not an image but a set of atoms — each with coordinates in $\\mathbb{R}^3$ and a categorical type.',
      ],
      link: 'ml/diffusion-models',
    },
    {
      kind: 'widget',
      title: 'Denoising, in two dimensions',
      body: String.raw`Press *reverse* and watch particles move from pure noise onto a structured distribution. A 3D molecular diffusion model does precisely this, with each particle an atom carrying a position and an element, and with the denoiser conditioned on the surrounding protein.`,
      widget: { type: 'DiffusionDenoise', props: { dataset: 'gmm', mode: 'reverse', steps: 60 }, caption: 'A toy 2D diffusion model. Replace the two axes with $(x, y, z)$ coordinates and add an atom-type channel, and you have the shape of a molecular diffusion model.' },
    },
    {
      kind: 'explain',
      title: 'DiffSBDD: equivariant diffusion in a pocket',
      body: String.raw`**DiffSBDD** (Schneuing et al. 2024, *Nat. Comput. Sci.*) applies denoising diffusion to the joint object (atom coordinates, atom types) of a ligand, conditioned on the pocket. Two framings are offered:

- a **conditional** model, where the pocket is fixed context passed to the denoiser at every step;
- an **inpainting** framing, where a single model of the joint protein–ligand system has the protein atoms held fixed and the ligand region filled in — which lets the same trained model do scaffold hopping or fragment linking without retraining.

The network is **E(3)-equivariant**: rotate or translate the pocket and every predicted coordinate rotates and translates identically. That is not a cosmetic nicety. Without it the model must separately learn each orientation of each interaction, wasting data it does not have.`,
      widget: { type: 'SvgDiagram', props: { svg: pocketSvg }, caption: 'Pocket-conditioned denoising: a cloud of noise condenses into atoms with types and positions, shaped by the site it sits in.' },
    },
    {
      kind: 'widget',
      title: 'Why equivariance matters',
      body: String.raw`A molecule in a pocket has no privileged coordinate frame. An **equivariant** model is built so that transforming the input transforms the output in the same way, by construction — the alternative is data augmentation, which only approximates the symmetry and costs training signal.`,
      widget: { type: 'SvgDiagram', props: { svg: equiSvg }, caption: 'Rotation of the input gives exactly the rotated output. See [equivariant networks](@ml/e3-equivariant-networks) for how the layers are built.' },
    },
    {
      kind: 'truefalse',
      prompt: 'An E(3)-equivariant generator will propose the same molecule, rotated accordingly, if you rotate the input pocket.',
      answer: true,
      why: 'That is the definition of equivariance: a transformation of the input produces the correspondingly transformed output. (With stochastic sampling the statement holds for the output *distribution*: the set of molecules the model proposes rotates with the pocket.) A non-equivariant network has no such guarantee and may propose something quite different.',
    },
    {
      kind: 'order',
      prompt: 'Order a pocket-conditioned diffusion run from start to finish.',
      steps: [
        'Extract the binding-site atoms from the protein structure',
        'Initialise a set of ligand atoms as pure Gaussian noise in the site',
        'Repeatedly denoise coordinates and atom types, conditioned on the pocket',
        'Infer bonds and sanitise the resulting molecule',
        'Re-dock, score and filter the generated molecules',
        'Plan a synthesis and make the survivors',
      ],
      why: 'Diffusion produces a point cloud of typed atoms, so bond perception and sanitisation are a separate post-processing step — a frequent source of weird output. Everything after that is the same filtering any generative method needs.',
    },
    {
      kind: 'explain',
      title: 'The evaluation problem is severe here',
      body: String.raw`Papers in this area typically report, for the generated molecules: a **Vina docking score**, **QED**, an **SA score**, and the observation that the generated molecules often dock *better than the crystal ligand*. Treat that last claim with suspicion, for three compounding reasons.

**1. Circularity.** Docking scores are the judge, and much of the training data is docking output. You are grading the model with a relative of its own teacher.

**2. Docking scores grow with size and greasiness.** A bigger, more lipophilic molecule buries more surface and scores better, with no implication for real affinity. Comparisons must control for heavy-atom count — "ligand efficiency" style — or they measure mass, not design.

**3. The geometry is often physically bad.** Follow-up analyses of generated poses (notably the PoseCheck work of Harris et al. 2023) found widespread steric clashes with the protein and high internal strain energies in molecules from several leading structure-based generators. A pose can win on a docking score while being impossible.

None of this means the models are worthless; it means the reported numbers are not evidence of the thing they appear to measure.`,
    },
    {
      kind: 'multi',
      prompt: 'Which checks would strengthen a structure-based generation paper? (Select all.)',
      choices: [
        'Reporting ligand efficiency or size-matched comparisons instead of raw docking scores',
        'Measuring steric clashes and internal strain energy of the generated poses',
        'Reporting a higher mean Vina score than the reference ligands',
        'Testing on pockets whose sequences are dissimilar to anything in training',
        'Synthesising and assaying a subset of the proposals',
      ],
      answers: [0, 1, 3, 4],
      why: 'Size control, physical plausibility, held-out protein families and actual experiments all attack a specific way the headline number can be hollow. Beating the crystal ligand on a docking score is the claim most easily produced by simply generating bigger, greasier molecules.',
    },
    {
      kind: 'match',
      prompt: 'Match each structure-based approach to its mechanism.',
      pairs: [
        ['Pocket2Mol', 'Autoregressive, equivariant: place one atom at a time in the site'],
        ['DiffSBDD (conditional)', 'Denoise ligand coordinates and types with the pocket as context'],
        ['DiffSBDD (inpainting)', 'Model protein and ligand jointly; fix the protein, fill in the ligand'],
        ['Classical docking', 'Search poses of an existing ligand and score them'],
      ],
      why: 'The first three generate new chemical matter inside the site and differ in how the atoms appear; docking does not generate anything, it only places and ranks molecules you already own.',
    },
    {
      kind: 'fill',
      prompt: 'Pocket-conditioned generators are trained mostly on ___ , a largely cross-docked dataset; DiffSBDD uses an E(3)-___ network so rotating the pocket rotates the output; and the most common judge of the results is a ___ score, which also grew the training data.',
      bank: ['CrossDocked2020', 'equivariant', 'docking', 'PDBBind', 'invariant', 'QED'],
      answer: ['CrossDocked2020', 'equivariant', 'docking'],
      why: 'CrossDocked2020 supplies the scale (at the price of being mostly computational), equivariance supplies the symmetry for free, and docking scores supply the evaluation — which is exactly the circularity to be wary of. An *invariant* network would output a number unchanged by rotation; coordinates need equivariance.',
    },
    {
      kind: 'explain',
      title: 'Key takeaways',
      body: String.raw`- **Structure-based generation** conditions on the pocket, so complementarity is built in rather than filtered for afterwards.
- **Pocket2Mol** places atoms autoregressively; **DiffSBDD** denoises coordinates and atom types, either conditionally or as inpainting of a joint protein–ligand model.
- **E(3) equivariance** is what makes these models learnable from $10^5$-scale data.
- Training data is dominated by **cross-docked** poses, so models partly imitate docking programs.
- Evaluation is the weak point: docking scores are **circular**, **size-biased**, and silent about physical plausibility — generated poses often clash and are strained. Demand size-matched comparisons, geometry checks, held-out protein families and, ideally, experiments.`,
    },
  ],
  references: [
    { authors: 'Schneuing, A., Harris, C., Du, Y., et al.', title: 'Structure-based drug design with equivariant diffusion models', year: 2024, venue: 'Nat. Comput. Sci. 4, 899–909 (arXiv:2210.13695)' },
    { authors: 'Peng, X., Luo, S., Guan, J., Xie, Q., Peng, J., Ma, J.', title: 'Pocket2Mol: efficient molecular sampling based on 3D protein pockets', year: 2022, venue: 'Proc. ICML 2022, PMLR 162, 17644–17655' },
    { authors: 'Luo, S., Guan, J., Ma, J., Peng, J.', title: 'A 3D generative model for structure-based drug design', year: 2021, venue: 'Adv. Neural Inf. Process. Syst. 34 (NeurIPS 2021)' },
    { authors: 'Francoeur, P. G., Masuda, T., Sunseri, J., et al.', title: 'Three-dimensional convolutional neural networks and a cross-docked data set for structure-based drug design', year: 2020, venue: 'J. Chem. Inf. Model. 60, 4200–4215' },
    { authors: 'Hoogeboom, E., Satorras, V. G., Vignac, C., Welling, M.', title: 'Equivariant diffusion for molecule generation in 3D', year: 2022, venue: 'Proc. ICML 2022, PMLR 162, 8867–8887' },
    { authors: 'Harris, C., Didi, K., Jamasb, A. R., et al.', title: 'Benchmarking generated poses: how rational is structure-based drug design with generative models?', year: 2023, venue: 'arXiv:2308.07413' },
  ],
} satisfies LessonContent;
