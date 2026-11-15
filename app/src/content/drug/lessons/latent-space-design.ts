import type { LessonContent } from '../../types';

const vaeSvg = `<svg viewBox="0 0 320 150" xmlns="http://www.w3.org/2000/svg">
<g font-size="8.5" text-anchor="middle">
<text x="34" y="52" font-family="ui-monospace, monospace" fill="var(--fg)">CCO...</text>
<text x="34" y="64" fill="var(--muted)" font-size="7.5">SMILES x</text>
<path d="M58,48 L80,48 L96,58 L96,78 L80,88 L58,88 Z" fill="var(--c2)" fill-opacity="0.25" stroke="var(--c2)"/>
<text x="77" y="66" fill="var(--fg)">encoder</text>
<text x="77" y="76" fill="var(--muted)" font-size="7">q(z|x)</text>
<circle cx="160" cy="68" r="26" fill="var(--c4)" fill-opacity="0.2" stroke="var(--c4)"/>
<text x="160" y="66" fill="var(--fg)">latent z</text>
<text x="160" y="77" fill="var(--muted)" font-size="7">a vector of numbers</text>
<path d="M224,48 L246,48 L262,58 L262,78 L246,88 L224,88 Z" fill="var(--c3)" fill-opacity="0.25" stroke="var(--c3)" transform="rotate(180 243 68)"/>
<text x="243" y="66" fill="var(--fg)">decoder</text>
<text x="243" y="76" fill="var(--muted)" font-size="7">p(x|z)</text>
<text x="294" y="64" font-family="ui-monospace, monospace" fill="var(--fg)">CCO...</text>
<text x="294" y="52" fill="var(--muted)" font-size="7.5">reconstruction</text>
<rect x="128" y="108" width="64" height="24" rx="6" fill="var(--c1)" fill-opacity="0.22" stroke="var(--c1)"/>
<text x="160" y="118" fill="var(--fg)">property</text>
<text x="160" y="128" fill="var(--fg)">predictor</text>
<text x="160" y="146" fill="var(--muted)" font-size="7.5">trained jointly, so z is organised by property</text>
<text x="160" y="16" fill="var(--muted)" font-size="7.5">loss = reconstruction + KL(q(z|x) || N(0, I)) + property error</text>
</g>
<g stroke="var(--fg)" stroke-width="1" fill="none">
<path d="M48,68 L56,68"/><path d="M98,68 L132,68"/><path d="M188,68 L222,68"/><path d="M264,68 L272,68"/>
<path d="M160,96 L160,106" stroke-dasharray="3 2"/>
</g>
<circle r="3" fill="var(--c5)"><animateMotion dur="4s" repeatCount="indefinite" path="M48,68 L132,68"/></circle>
<circle r="3" fill="var(--c5)"><animateMotion dur="4s" begin="1.2s" repeatCount="indefinite" path="M188,68 L272,68"/></circle>
</svg>`;

const jtSvg = `<svg viewBox="0 0 320 136" xmlns="http://www.w3.org/2000/svg">
<g font-size="8" text-anchor="middle">
<text x="54" y="14" fill="var(--fg)" font-weight="700">1. junction tree</text>
<circle cx="30" cy="48" r="11" fill="var(--c2)" fill-opacity="0.3" stroke="var(--c2)"/><text x="30" y="51" fill="var(--fg)">ring</text>
<circle cx="66" cy="38" r="11" fill="var(--c3)" fill-opacity="0.3" stroke="var(--c3)"/><text x="66" y="41" fill="var(--fg)">C=O</text>
<circle cx="66" cy="76" r="11" fill="var(--c1)" fill-opacity="0.3" stroke="var(--c1)"/><text x="66" y="79" fill="var(--fg)">ring</text>
<circle cx="98" cy="96" r="11" fill="var(--c4)" fill-opacity="0.3" stroke="var(--c4)"/><text x="98" y="99" fill="var(--fg)">N</text>
<g stroke="var(--fg)" stroke-width="1"><path d="M41,48 L55,40"/><path d="M39,55 L57,71"/><path d="M76,82 L88,91"/></g>
<text x="54" y="122" fill="var(--muted)" font-size="7">nodes = whole substructures from a vocabulary</text>
<text x="160" y="56" font-size="14" fill="var(--fg)">→</text>
<text x="246" y="14" fill="var(--fg)" font-weight="700">2. assemble</text>
<g stroke="var(--fg)" stroke-width="1.4" fill="none">
<path d="M206,56 L221,47 L236,56 L236,74 L221,83 L206,74 Z"/>
<path d="M236,56 L252,47"/><path d="M252,47 L252,30"/>
<path d="M252,47 L268,56 L268,74 L252,83 L236,74"/>
</g>
<text x="252" y="26" fill="var(--c3)" font-size="8">O</text>
<text x="246" y="104" fill="var(--muted)" font-size="7">pick how neighbours fuse; every</text>
<text x="246" y="114" fill="var(--muted)" font-size="7">option checked for valence → always valid</text>
</g></svg>`;

export default {
  cards: [
    {
      kind: 'explain',
      title: 'A continuous map of chemistry',
      body: String.raw`Molecules are **discrete**: you cannot add 0.3 of a nitrogen. That rules out every smooth optimiser — gradient descent, Bayesian optimisation, simple interpolation.

Gómez-Bombarelli et al. (2018, *ACS Central Science*) proposed the fix that defined a decade of work: learn an **encoder** that maps a molecule to a point $z$ in a continuous vector space, and a **decoder** that maps points back to molecules. Optimise in $z$, where calculus works, then decode.

The claim is seductive — "chemistry becomes a vector space". The rest of this lesson is about how far it actually holds.`,
    },
    {
      kind: 'recall',
      title: 'VAEs in one minute',
      points: [
        'An **encoder** $q_\\phi(z \\mid x)$ maps each input to a *distribution* over latent codes; a **decoder** $p_\\theta(x \\mid z)$ maps a code back to data.',
        'Training maximises the ELBO: a reconstruction term minus $\\mathrm{KL}\\!\\left(q_\\phi(z\\mid x)\\,\\|\\,p(z)\\right)$ against a prior $p(z)=\\mathcal{N}(0, I)$.',
        'That KL term pulls codes towards the prior, so the latent space is **filled in** rather than a scatter of isolated points — which is what makes interpolation meaningful.',
        'Sampling uses the **reparameterisation trick**, $z = \\mu + \\sigma \\odot \\epsilon$, so gradients flow through the sampling step.',
      ],
      link: 'ml/vaes',
    },
    {
      kind: 'explain',
      title: 'The SMILES VAE',
      body: String.raw`The 2018 architecture is deliberately plain. Molecules are written as [SMILES](@drug/molecular-representations) strings, one-hot encoded character by character. A convolutional encoder compresses the string into the mean and variance of a Gaussian over a latent vector of a couple of hundred dimensions; a recurrent decoder writes the string back out, one character at a time. Training sets were drug-like molecules from ZINC (about 250 000) and the small-molecule set QM9.

Crucially, they also trained a small **property predictor** on $z$ *jointly* with the autoencoder. Without it the latent space organises itself by whatever makes strings easy to reconstruct; with it, the space becomes organised by the property you care about, so that moving in a particular direction changes that property smoothly.`,
      widget: { type: 'SvgDiagram', props: { svg: vaeSvg }, caption: 'Encoder, latent space, decoder — plus the joint property head that makes the latent space useful for optimisation.' },
    },
    {
      kind: 'widget',
      title: 'Walk between two drugs',
      body: String.raw`The slider moves $z$ along the straight line between the codes of paracetamol (**A**) and ibuprofen (**B**). Grey dots are encoded training molecules; the shading is how reliably the decoder returns a valid molecule there.

Watch what happens in the middle of the walk — and then switch to the **objective** view.`,
      widget: { type: 'DrugLatentWalk', props: { field: 'validity' }, caption: 'Decoded structures here are illustrative real molecules, not the output of a trained model; the geometry is the point.' },
    },
    {
      kind: 'mcq',
      prompt: 'A straight-line interpolation between two valid molecules decodes to nonsense half way along. What is the most likely explanation?',
      choices: [
        'The two endpoint molecules were encoded incorrectly',
        'The midpoint lies in a region of latent space with little training data, where the decoder was never constrained',
        'The decoder is deterministic',
        'The latent space has too few dimensions to hold two molecules',
      ],
      answer: 1,
      why: 'The decoder is only trained to behave on codes the encoder actually produces. Training data occupies a thin, curved region; a straight chord between two points on it can pass through empty space, where the decoder extrapolates — producing unclosed rings or impossible valences. The endpoints themselves are fine.',
    },
    {
      kind: 'explain',
      title: 'Bayesian optimisation over the latent space',
      body: String.raw`With a continuous space in hand, the 2018 paper ran **Bayesian optimisation**:

1. Encode a set of training molecules to get points $z_i$ with measured or computed scores $y_i$.
2. Fit a **Gaussian-process** surrogate $\hat{f}(z)$ to those pairs — a cheap model of the objective *with error bars*.
3. Maximise an **acquisition function** (e.g. expected improvement) that rewards both a high predicted score and high uncertainty, giving a new $z^{*}$.
4. Decode $z^{*}$, score the molecule properly, add it to the data, repeat.

The surrogate makes each step cheap; the uncertainty makes the search explore rather than hammer one spot.`,
    },
    {
      kind: 'recall',
      title: 'Gaussian processes, briefly',
      points: [
        'A GP places a distribution over functions; conditioning on observations gives a posterior **mean** and a **variance** at every input.',
        'The variance grows away from the data — exactly the "I have not looked here" signal an optimiser needs.',
        'Acquisition functions such as **expected improvement** turn mean and variance into a single number to maximise.',
        'GPs scale poorly (cost grows roughly as the cube of the number of points), so latent-space BO works with hundreds to thousands of observations, not millions.',
      ],
      link: 'ml/gaussian-processes',
    },
    {
      kind: 'widget',
      title: 'The surrogate, and where it sends you',
      body: String.raw`A one-dimensional cartoon of the surrogate: the band is the posterior uncertainty. An optimiser is pulled towards high mean **and** high uncertainty — and high uncertainty is precisely where the model has no data, which in a molecular latent space means where the decoder is unreliable.`,
      widget: { type: 'MlGPPosterior', props: { kernel: 'rbf', lengthScale: 0.35, samples: 2, meanLabel: 'surrogate score' }, caption: 'Tap to add observations. Notice how the band collapses where you add data and balloons where you do not.' },
    },
    {
      kind: 'explain',
      title: 'Three ways it goes wrong',
      body: String.raw`**1. Invalid decodes.** A character-level SMILES decoder has no idea that rings must close. A substantial fraction of sampled strings are not molecules at all — the single biggest complaint about the original model, and the motivation for [SELFIES](@drug/molecular-representations) and for graph decoders.

**2. Off-manifold optima.** The surrogate is only trustworthy near the data, but its maximum is often far from it. Decode there and you get junk, or a molecule whose true score is nothing like the prediction. Fixes: constrain the search to a trust region, penalise low decoder confidence, or re-encode and re-score every proposal.

**3. Objective hacking.** The field's favourite benchmark objective, **penalised $\log P$** ($\log P$ minus a synthetic-accessibility penalty minus a large-ring penalty), is unbounded — it simply rewards more carbon. Optimisers duly return long greasy chains with spectacular scores and no use whatsoever. A high penalised-$\log P$ number in a paper is a statement about the benchmark, not the model.`,
    },
    {
      kind: 'truefalse',
      prompt: 'Because the Gaussian-process surrogate reports uncertainty, latent-space Bayesian optimisation is safe from proposing molecules the decoder cannot handle.',
      answer: false,
      why: 'Uncertainty makes the search *prefer* unexplored regions, which in a molecular latent space are exactly the regions where the decoder was never trained. This is why practical implementations add a trust region or a validity penalty on top of the acquisition function.',
    },
    {
      kind: 'explain',
      title: 'JT-VAE: never generate an invalid molecule',
      body: String.raw`Jin, Barzilay and Jaakkola (2018, *ICML*) removed the validity problem by changing *what* is decoded. Their **junction-tree VAE** represents a molecule at two levels:

- a **junction tree** whose nodes are entire chemically valid substructures — rings, bonds, small functional groups — taken from a vocabulary mined from the training set (a few hundred such pieces from ZINC);
- the **molecular graph** itself.

Generation runs in two phases: decode the tree (which piece connects to which), then **assemble** the pieces into a graph, enumerating the ways neighbouring fragments can be fused and scoring each. Because every piece is valid and every join is valence-checked, **100 % of outputs are valid molecules** — not as a measured statistic but by construction.`,
      widget: { type: 'SvgDiagram', props: { svg: jtSvg }, caption: 'Scaffold first, atoms second. Building from valid pieces removes an entire failure mode.' },
    },
    {
      kind: 'order',
      prompt: 'Order the steps of generating a molecule with a junction-tree VAE.',
      steps: [
        'Sample a latent code z',
        'Decode a tree of substructures chosen from the fragment vocabulary',
        'Enumerate the valence-legal ways neighbouring fragments can be joined',
        'Score the candidate assemblies and pick one',
        'Output the assembled molecular graph',
      ],
      why: 'The tree fixes *which* pieces are present and how they are connected at the coarse level; assembly resolves *exactly* which atoms are fused, and is where validity is enforced. Reversing tree and assembly would lose the guarantee.',
    },
    {
      kind: 'match',
      prompt: 'Match each component of a latent-space design system to its job.',
      pairs: [
        ['Encoder', 'Maps a molecule to a distribution over latent codes'],
        ['KL term in the ELBO', 'Pulls codes towards the prior so the space has no holes'],
        ['Joint property predictor', 'Organises the latent space along the property of interest'],
        ['Gaussian-process surrogate', 'Cheap score estimate with uncertainty, fitted on few points'],
        ['Trust region', 'Keeps proposals close to data the decoder can handle'],
      ],
      why: 'Each piece addresses one failure of the naive idea: encoding makes chemistry continuous, the KL term makes it dense, the property head makes it navigable, the surrogate makes search cheap, and the trust region stops the search leaving the region where any of that is true.',
    },
    {
      kind: 'fill',
      prompt: 'In a VAE the ___ term keeps latent codes close to the prior, the ___ turns a code back into a molecule, and a Gaussian-process ___ provides cheap score estimates with error bars during Bayesian optimisation.',
      bank: ['KL', 'decoder', 'surrogate', 'encoder', 'reward', 'softmax'],
      answer: ['KL', 'decoder', 'surrogate'],
      why: 'The KL divergence against $\\mathcal{N}(0,I)$ is what makes the latent space continuous and interpolable; the decoder is the generative half; the surrogate is the cheap stand-in for the expensive objective inside the BO loop.',
    },
    {
      kind: 'multi',
      prompt: 'Which claims about latent-space molecular design are **well supported**? (Select all.)',
      choices: [
        'A junction-tree VAE produces valid molecules by construction.',
        'Character-level SMILES decoders can emit strings that are not molecules.',
        'A record penalised-logP score demonstrates that a model designs good drugs.',
        'Jointly training a property predictor on the latent code makes the space easier to optimise in.',
        'Interpolating between two training molecules always yields chemically sensible intermediates.',
      ],
      answers: [0, 1, 3],
      why: 'Validity by construction, invalid SMILES decodes and property-organised latent spaces are all established. Penalised logP is an unbounded, hackable benchmark, and a straight chord between two codes can leave the data manifold entirely.',
    },
    {
      kind: 'explain',
      title: 'Key takeaways',
      body: String.raw`- A **VAE** gives molecules a continuous address, so smooth optimisers become usable. Gómez-Bombarelli et al. (2018) made this the standard recipe.
- Add a **joint property predictor** so the latent space is organised by the thing you want, then run **Bayesian optimisation** with a Gaussian-process surrogate.
- Three failure modes: **invalid decodes**, **off-manifold optima** (the surrogate's best point is where the decoder is worst), and **objective hacking** — penalised $\log P$ being the field's cautionary tale.
- **JT-VAE** (Jin et al. 2018) builds from a vocabulary of valid fragments and assembles them with valence checks, making every output a real molecule.
- A continuous latent space solves the *representation* problem. It does not solve the *scoring* problem, which is where [multi-objective optimisation](@drug/multi-objective-optimization) and [synthesizability](@drug/synthesizability) come in.`,
    },
  ],
  references: [
    { authors: 'Gómez-Bombarelli, R., Wei, J. N., Duvenaud, D., et al.', title: 'Automatic chemical design using a data-driven continuous representation of molecules', year: 2018, venue: 'ACS Cent. Sci. 4, 268–276' },
    { authors: 'Jin, W., Barzilay, R., Jaakkola, T.', title: 'Junction tree variational autoencoder for molecular graph generation', year: 2018, venue: 'Proc. ICML 2018, PMLR 80, 2323–2332' },
    { authors: 'Kingma, D. P., Welling, M.', title: 'Auto-encoding variational Bayes', year: 2014, venue: 'Proc. ICLR 2014 (arXiv:1312.6114)' },
    { authors: 'Krenn, M., Häse, F., Nigam, A., Friederich, P., Aspuru-Guzik, A.', title: 'Self-referencing embedded strings (SELFIES): a 100% robust molecular string representation', year: 2020, venue: 'Mach. Learn.: Sci. Technol. 1, 045024' },
    { authors: 'Brown, N., Fiscato, M., Segler, M. H. S., Vaucher, A. C.', title: 'GuacaMol: benchmarking models for de novo molecular design', year: 2019, venue: 'J. Chem. Inf. Model. 59, 1096–1108' },
  ],
} satisfies LessonContent;
