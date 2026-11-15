import type { LessonContent } from '../../types';

const spaceSvg = `<svg viewBox="0 0 320 150" xmlns="http://www.w3.org/2000/svg">
<g font-size="8" text-anchor="middle">
<text x="54" y="14" fill="var(--fg)" font-weight="700">translation</text>
<text x="54" y="24" fill="var(--muted)">R³ — 3 numbers</text>
<rect x="18" y="34" width="72" height="62" rx="6" fill="none" stroke="var(--c2)" stroke-dasharray="3 2"/>
<circle cx="54" cy="65" r="5" fill="var(--c2)">
<animate attributeName="cx" values="34;74;44;54" dur="6s" repeatCount="indefinite"/>
<animate attributeName="cy" values="50;80;60;65" dur="6s" repeatCount="indefinite"/></circle>
<text x="54" y="110" fill="var(--muted)">where the ligand sits</text>

<text x="160" y="14" fill="var(--fg)" font-weight="700">rotation</text>
<text x="160" y="24" fill="var(--muted)">SO(3) — 3 numbers</text>
<circle cx="160" cy="65" r="30" fill="none" stroke="var(--c3)" stroke-dasharray="3 2"/>
<g transform="translate(160,65)"><g><animateTransform attributeName="transform" type="rotate" values="0;360" dur="6s" repeatCount="indefinite"/>
<line x1="-20" y1="0" x2="20" y2="0" stroke="var(--c3)" stroke-width="2.4"/>
<circle cx="20" cy="0" r="4" fill="var(--c3)"/></g></g>
<text x="160" y="110" fill="var(--muted)">how it is oriented</text>

<text x="262" y="14" fill="var(--fg)" font-weight="700">torsions</text>
<text x="262" y="24" fill="var(--muted)">a torus — m numbers</text>
<g transform="translate(262,65)">
<line x1="-26" y1="0" x2="0" y2="0" stroke="var(--fg)" stroke-width="2"/>
<g><animateTransform attributeName="transform" type="rotate" values="-50;50;-50" dur="4s" repeatCount="indefinite"/>
<line x1="0" y1="0" x2="24" y2="0" stroke="var(--c5)" stroke-width="2"/>
<circle cx="24" cy="0" r="4" fill="var(--c5)"/></g>
<circle cx="0" cy="0" r="3" fill="var(--fg)"/></g>
<text x="262" y="110" fill="var(--muted)">one angle per rotatable bond</text>
<text x="160" y="132" fill="var(--fg)" font-weight="700">the pose manifold has 3 + 3 + m dimensions</text>
<text x="160" y="144" fill="var(--muted)">DiffDock diffuses on this product space instead of searching it</text>
</g></svg>`;

export default {
  cards: [
    {
      kind: 'explain',
      title: 'Docking as generation',
      body: String.raw`Classical [docking](@drug/docking) is a *search*: enumerate poses, score them, return the best. It is slow, it depends on a crude scoring function, and its search can simply miss the right answer.

**DiffDock** (Corso et al. 2023, *ICLR*) reframes the problem. Instead of searching for the pose that minimises a score, train a **generative model over poses** and sample from it. Docking becomes: draw 10 or 40 poses from the learned distribution, then rank them with a separate confidence model.

That reframing matters for an honest reason: it changes what "being wrong" looks like. A search returns one answer with a misleadingly precise score; a generative model returns a *distribution*, which can be broad when the model has no idea — information a chemist can act on.`,
    },
    {
      kind: 'recall',
      title: 'Docking, in four lines',
      points: [
        'A **pose** = ligand position (3), orientation (3) and one torsion angle per rotatable bond.',
        'Every docking program = a **search algorithm** + a **scoring function**.',
        'Re-docking into the correct (holo) structure often reproduces crystal poses within 2 Å RMSD; affinity prediction is much weaker.',
        '**Blind docking** — no pocket given — is far harder than docking into a defined box.',
      ],
      link: 'drug/docking',
    },
    {
      kind: 'explain',
      title: 'Diffusing on the right space',
      body: String.raw`DiffDock's technical core is choosing *what* to add noise to. Adding Gaussian noise to raw atom coordinates would destroy bond lengths and angles — you would be generating broken molecules and then needing to repair them.

Instead the ligand's internal geometry is kept fixed (from an RDKit conformer) and the diffusion runs over the **degrees of freedom of a pose**:

- **translation** in $\mathbb{R}^3$;
- **rotation** in $\mathrm{SO}(3)$, the group of 3D rotations;
- **torsion angles**, one per rotatable bond, living on a torus $\mathbb{T}^m$ (each angle wraps at $2\pi$).

So the model diffuses on a $(3+3+m)$-dimensional manifold, with a noise process defined properly on each factor. The score network is an SE(3)-equivariant graph network over the protein and ligand atoms. Bond lengths and angles are *never* perturbed, so they are automatically preserved.`,
      widget: { type: 'SvgDiagram', props: { svg: spaceSvg }, caption: 'The three factors of the pose manifold. Diffusing here, rather than on raw coordinates, keeps the molecule intact by construction.' },
    },
    {
      kind: 'numeric',
      prompt: 'On what dimension of manifold does DiffDock run its diffusion process for a ligand with 7 rotatable bonds?',
      answer: 13,
      tolerance: 0,
      unit: 'dimensions',
      why: '3 translational + 3 rotational + 7 torsional = 13. Note that this is the same count as the classical docking search space — the difference is that DiffDock samples from a learned distribution over it rather than searching it with Monte Carlo.',
    },
    {
      kind: 'explain',
      title: 'The confidence model',
      body: String.raw`A generative model gives you samples, not a ranking. DiffDock therefore trains a **second** network — the confidence model — which takes a sampled pose and predicts the probability that it is within 2 Å RMSD of the true one. Sample $N$ poses, rank by confidence, report the top one.

Two things follow:

- The confidence score is a **calibrated-ish self-assessment**, not an affinity. It says "I think this pose is right", not "this binds at 10 nM". Using it to rank *different ligands* is a misuse, though a tempting one.
- Accuracy improves with the number of samples: more draws, more chances that a good pose is in the set for the confidence model to find.

On the PDBBind blind-docking benchmark, DiffDock reported roughly **38 % of top-ranked poses within 2 Å**, against about **23 %** for the strongest search-based baseline in the same blind setting — a genuine and large jump. It was also notably more robust than classical docking when given **computationally predicted** (ESMFold) structures instead of crystal ones.`,
    },
    {
      kind: 'mcq',
      prompt: 'What does DiffDock’s confidence model predict?',
      choices: [
        'The binding free energy of the ligand',
        'The probability that a sampled pose is within 2 Å RMSD of the true pose',
        'Which pocket on the protein is the true binding site',
        'The synthetic accessibility of the ligand',
      ],
      answer: 1,
      why: 'It is trained to recognise its own good poses — a pose-correctness classifier used to rank samples. Reading it as an affinity is a common and serious mistake: a model can be very confident about the pose of a compound that does not bind at all.',
    },
    {
      kind: 'explain',
      title: 'Enter PoseBusters',
      body: String.raw`Buttenschoen, Morris and Deane (2024, *Chem. Sci.*) asked a question the field had skipped: **are these poses physically possible?**

They assembled a clean benchmark of 428 recent, carefully curated protein–ligand complexes from the PDB (chosen to post-date the training data of the methods tested) and ran every predicted pose through a battery of checks, which their open-source *posebusters* tool still applies:

- **chemical validity and consistency** — the output is the molecule you asked for, sanitisable, with the right stereochemistry;
- **intramolecular validity** — bond lengths, bond angles and aromatic-ring planarity within tolerance of reference values; no internal steric clash; internal energy not wildly above a conformer ensemble;
- **intermolecular validity** — no steric clash with the protein, no implausible volume overlap.

A prediction counts as a success only if it is both **accurate** (RMSD < 2 Å) and **PB-valid**.`,
    },
    {
      kind: 'widget',
      title: 'Accurate but impossible',
      body: String.raw`Move, rotate, stretch and twist the predicted pose. The RMSD readout and the physical checks respond independently — and that is the whole point. Try shrinking the bond lengths while keeping the pose on top of the reference: the RMSD stays small and the molecule becomes nonsense.`,
      widget: { type: 'DrugPoseQuality', props: {}, caption: 'A toy 2D version of the PoseBusters checks. Real tools compare bond lengths and angles against reference distributions and check internal energy against a conformer ensemble.' },
    },
    {
      kind: 'truefalse',
      prompt: 'A predicted pose with RMSD of 1.2 Å from the crystal pose is necessarily a chemically and physically plausible structure.',
      answer: false,
      why: 'RMSD measures only the average distance between corresponding atoms. A pose can hit that target while having distorted bond lengths, a clash with the protein, a broken aromatic ring or inverted stereochemistry — exactly the failure modes PoseBusters was built to expose.',
    },
    {
      kind: 'explain',
      title: 'What they found',
      body: String.raw`Two results, both unwelcome.

**1. Physical validity cuts the success rates of many deep-learning methods.** Several methods that predict coordinates directly looked competitive on RMSD alone but lost a large share of their "successes" once the pose had to be physically valid as well. DiffDock, which keeps bond geometry fixed, lost much less on internal geometry, but still produced poses with steric clashes. Classical docking programs such as AutoDock Vina and GOLD, whose scoring functions include explicit steric and geometric terms, were rarely invalid and came out **ahead overall** on this benchmark (with the caveat that they were given the binding pocket, whereas DiffDock docks blind).

**2. Generalisation to novel sequences is poor.** When test proteins were filtered to be dissimilar from anything in training, deep-learning performance fell further. Much of the apparent skill was recognition of familiar proteins and familiar ligands, not learned physics.

The paper's title says it plainly: AI-based docking methods *fail to generate physically valid poses or generalise to novel sequences*. The field's response has been productive — physical validity checks are now routinely reported, and later methods target them directly — but the lesson generalises well beyond docking.`,
    },
    {
      kind: 'multi',
      prompt: 'Which practices make a reported ML-docking result trustworthy? (Select all.)',
      choices: [
        'Reporting the fraction of predictions that are both under 2 Å RMSD and physically valid',
        'Testing on complexes released after the model’s training data was assembled',
        'Reporting the mean RMSD over all predictions only',
        'Excluding test proteins with high sequence similarity to training proteins',
        'Comparing against a well-tuned classical docking program',
      ],
      answers: [0, 1, 3, 4],
      why: 'Joint accuracy-and-validity reporting, temporal splits, sequence-similarity filtering and a strong classical baseline each close a specific loophole. A mean RMSD hides the distribution and is dominated by catastrophic misses, so it is the least informative summary on the list.',
    },
    {
      kind: 'explain',
      title: 'Why the leaderboards were misleading',
      body: String.raw`It is worth being precise about *how* an honest-looking benchmark went wrong, because the same traps recur everywhere in this unit.

- **Ligand leakage.** PDBBind splits by complex, but the same ligand, or a close analogue, often appears in several complexes. A model can memorise a ligand's bound conformation.
- **Protein leakage.** The same target family dominates the PDB — kinases, proteases, carbonic anhydrase. A random split leaves near-duplicates on both sides.
- **Holo structures.** Most benchmarks dock into the protein structure *solved with that ligand bound*, whose side chains are already arranged around it. Real prospective docking has no such luxury — this is the [induced-fit](@drug/docking-validation) problem.
- **Metric myopia.** RMSD < 2 Å is a convenient scalar that ignores everything chemistry cares about, which is precisely the gap PoseBusters measured.

None of these is dishonesty. They are the defaults, and defaults are how fields fool themselves.`,
    },
    {
      kind: 'order',
      prompt: 'Order the stages of a DiffDock prediction.',
      steps: [
        'Generate a 3D conformer of the ligand with fixed bond lengths and angles',
        'Initialise many poses by sampling noise over translation, rotation and torsions',
        'Run the reverse diffusion steps with the SE(3)-equivariant score network',
        'Score each sampled pose with the confidence model',
        'Return the highest-confidence pose, then check it for physical validity',
      ],
      why: 'Internal geometry is fixed first precisely so diffusion never breaks it; the reverse process produces a set of candidate poses; the confidence model ranks them. The validity check is a separate step the original pipeline did not include — which is the point of PoseBusters.',
    },
    {
      kind: 'match',
      prompt: 'Match each component or critique to what it concerns.',
      pairs: [
        ['SO(3) diffusion', 'Noise applied to the ligand’s orientation'],
        ['Confidence model', 'Ranking sampled poses by predicted correctness'],
        ['PoseBusters checks', 'Bond geometry, internal strain and steric clashes'],
        ['Sequence-similarity filtering', 'Testing generalisation to unfamiliar proteins'],
        ['Holo-structure benchmarks', 'Pockets already shaped around the ligand being docked'],
      ],
      why: 'The first two are parts of the method, the last three are ways a benchmark can flatter it. Keeping them straight is the difference between reading a paper and believing it.',
    },
    {
      kind: 'fill',
      prompt: 'DiffDock diffuses over ___ , rotations and torsions rather than raw coordinates, ranks its samples with a ___ model, and the benchmark ___ showed that many deep-learning docking methods produce poses that are accurate by RMSD yet physically invalid.',
      bank: ['translations', 'confidence', 'PoseBusters', 'bond lengths', 'scoring', 'GuacaMol'],
      answer: ['translations', 'confidence', 'PoseBusters'],
      why: 'Bond lengths are precisely what DiffDock does *not* perturb, which is why its outputs have sane local geometry even when the pose is wrong. The confidence model does the ranking, and PoseBusters supplied the physical-validity critique; GuacaMol benchmarks molecule generation, not docking.',
    },
    {
      kind: 'explain',
      title: 'Key takeaways',
      body: String.raw`- **DiffDock** turns docking into sampling: diffusion over the $(3+3+m)$-dimensional pose manifold of translations, rotations and torsions, with internal geometry held fixed.
- A separate **confidence model** ranks samples by predicted pose correctness. It is not an affinity, and must not be used as one.
- Its headline blind-docking result (~38 % top-1 under 2 Å versus ~23 % for the best search-based baseline) was a real advance, and it degrades gracefully on predicted structures.
- **PoseBusters** (Buttenschoen et al. 2024) showed that requiring *physical validity* removes a large share of the successes of many deep-learning docking methods (less so for DiffDock, which preserves bond geometry), that generalisation to novel sequences is weak, and that well-run classical docking (given the pocket) was still ahead on a clean benchmark.
- The transferable lesson: **a single scalar metric on a leaky benchmark will eventually be optimised instead of the problem.** Ask what the metric cannot see.`,
    },
  ],
  references: [
    { authors: 'Corso, G., Stärk, H., Jing, B., Barzilay, R., Jaakkola, T.', title: 'DiffDock: diffusion steps, twists, and turns for molecular docking', year: 2023, venue: 'Proc. ICLR 2023 (arXiv:2210.01776)' },
    { authors: 'Buttenschoen, M., Morris, G. M., Deane, C. M.', title: 'PoseBusters: AI-based docking methods fail to generate physically valid poses or generalise to novel sequences', year: 2024, venue: 'Chem. Sci. 15, 3130–3139' },
    { authors: 'Trott, O., Olson, A. J.', title: 'AutoDock Vina: improving the speed and accuracy of docking with a new scoring function, efficient optimization, and multithreading', year: 2010, venue: 'J. Comput. Chem. 31, 455–461' },
    { authors: 'Jumper, J., Evans, R., Pritzel, A., et al.', title: 'Highly accurate protein structure prediction with AlphaFold', year: 2021, venue: 'Nature 596, 583–589' },
    { authors: 'Ho, J., Jain, A., Abbeel, P.', title: 'Denoising diffusion probabilistic models', year: 2020, venue: 'Adv. Neural Inf. Process. Syst. 33 (NeurIPS 2020)' },
  ],
} satisfies LessonContent;
