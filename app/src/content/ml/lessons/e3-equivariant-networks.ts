import type { LessonContent } from '../../types';

// Feature types ℓ = 0,1,2 and the tensor-product paths between them.
const TENSOR_SVG = `<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg">
<text x="160" y="13" font-size="9.5" text-anchor="middle" fill="var(--fg)">feature types and the paths that combine them</text>
${[[0, 'ℓ = 0  scalar', '1 component · energy, charge', 'var(--c1)'],
   [1, 'ℓ = 1  vector', '3 components · force, dipole', 'var(--c2)'],
   [2, 'ℓ = 2  rank-2', '5 components · quadrupole', 'var(--c4)']]
    .map(([l, n, d, c]) => {
      const y = 34 + (l as number) * 30;
      return `<rect x="10" y="${y - 13}" width="86" height="22" rx="4" fill="${c}" fill-opacity="0.22" stroke="${c}" stroke-width="0.9"/>` +
        `<text x="53" y="${y + 2}" font-size="9" text-anchor="middle" fill="var(--fg)">${n}</text>` +
        `<text x="104" y="${y + 2}" font-size="8.5" fill="var(--muted)">${d}</text>`;
    }).join('')}
<text x="10" y="124" font-size="9" fill="var(--fg)">tensor product (Clebsch–Gordan): ℓ₁ ⊗ ℓ₂ → ℓ, for |ℓ₁−ℓ₂| ≤ ℓ ≤ ℓ₁+ℓ₂</text>
<text x="10" y="139" font-size="8.5" fill="var(--c2)">1 ⊗ 1 → 0  (a dot product: two vectors give a scalar)</text>
<text x="10" y="152" font-size="8.5" fill="var(--c2)">1 ⊗ 1 → 1  (a cross product: two vectors give a vector)</text>
<text x="10" y="165" font-size="8.5" fill="var(--c4)">1 ⊗ 1 → 2  (the traceless symmetric part)</text>
<text x="10" y="178" font-size="8" fill="var(--muted)">Each type rotates by its own (2ℓ+1)×(2ℓ+1) matrix, so the layer can never mix them wrongly.</text>
</svg>`;

export default {
  cards: [
    {
      kind: 'explain',
      title: 'A molecule does not know which way is up',
      body: String.raw`Give a network the 3D coordinates of the atoms in a molecule and ask for its energy. Now pick the molecule up, turn it round, and ask again. The answer must be **identical** — not nearly identical, identical. Energy is a property of the shape, not of the coordinate system the shape happened to be written in.

Now ask instead for the **force on each atom**. Turn the molecule and every force arrow must turn with it. Same transformation, two different required behaviours: the energy is **invariant**, the forces are **equivariant**.

Getting this right is not cosmetic. A model whose predicted forces do not rotate with the molecule will produce different dynamics depending on how the simulation box was oriented, which is physically meaningless. Build the symmetry in and it is impossible to get wrong — and, as it turns out, you often need far less training data.`,
    },
    {
      kind: 'explain',
      title: 'The group is $E(3)$',
      body: String.raw`The symmetries of empty three-dimensional space form the **Euclidean group** $E(3)$: all translations, all rotations, and reflections. Its pieces have names you will meet constantly.

- $SO(3)$ — rotations alone.
- $O(3)$ — rotations and reflections; $O(3)=SO(3)\times\{\pm1\}$, with the sign recording **parity**.
- $SE(3)$ — rotations and translations, no reflections: the "proper" rigid motions.
- $E(3)$ — all of the above, i.e. translations together with $O(3)$.

Translation equivariance is easy and usually handled once and for all by working with **relative** positions $\mathbf r_{ij}=\mathbf x_i-\mathbf x_j$, which are already translation-invariant. Permutation equivariance over atoms comes from using a [GNN](@ml/gnns). What remains, and what is genuinely hard, is $O(3)$.

A target's required behaviour is fixed by what kind of physical quantity it is:
- **scalars** (energy, charge, a predicted $pK_a$) must be invariant;
- **vectors** (force, dipole moment, velocity) must rotate with the molecule;
- **rank-2 tensors** (polarizability, stress) must transform as $T\mapsto RTR^\top$.`,
    },
    {
      kind: 'widget',
      title: 'Relative coordinates versus raw coordinates',
      body: String.raw`Four atoms, each carrying a predicted vector. Solid arrows: rotate the molecule first, then run the model. Dashed arrows: run the model, then rotate the prediction.

The **relative** model builds each output from differences $\mathbf x_i-\mathbf x_j$ scaled by functions of the distances $\|\mathbf x_i-\mathbf x_j\|$. The two arrow sets coincide at every angle — the square commutes exactly, and it does so because of how the function is written, not because of anything it learned.

The **raw** model (the *raw coordinates* button) applies a generic linear map to the coordinates. At $\theta=0$ it looks fine. Turn the dial and the two predictions separate. No amount of training fixes this: in three dimensions a fixed matrix $M$ satisfies $MRx=RMx$ for all rotations $R$ only if $M$ is a multiple of the identity. (The widget draws a 2D slice, where the commuting matrices are the rotation-and-scaling ones; the model's $M$ is not one of them.)`,
      widget: { type: 'MlEquivarianceSquare', props: { model: 'relative', theta: 40 }, caption: 'The invariant readout $\\sum_{i<j}\\|x_i-x_j\\|$ never changes — distances are the raw material of every invariant model.' },
    },
    {
      kind: 'mcq',
      prompt: 'A network predicts a molecule\'s energy from interatomic distances only, then obtains forces as $\\mathbf F_i=-\\partial E/\\partial\\mathbf x_i$. What symmetry properties does this give?',
      choices: [
        'The energy is $E(3)$-invariant and the forces are automatically equivariant, because the gradient of an invariant scalar is an equivariant vector',
        'Both the energy and the forces are invariant, since both are computed from distances',
        'The energy is invariant but the forces must be made equivariant by a separate output head',
        'Neither is guaranteed, because differentiating a network destroys its symmetry properties',
      ],
      answer: 0,
      why: String.raw`Distances are unchanged by rotation, translation and reflection, so $E$ is $E(3)$-invariant. Differentiating with respect to position then gives a vector that rotates correctly: if $E(R\mathbf x)=E(\mathbf x)$ then $\nabla_{\mathbf x}E$ picks up exactly one factor of $R$. This is the standard construction for machine-learned force fields, and it has a second gift — forces obtained as a gradient are automatically **conservative**, so energy is conserved along a simulated trajectory.`,
    },
    {
      kind: 'explain',
      title: 'The invariant route, and where it runs out',
      body: String.raw`The simplest way to be invariant is to throw away everything that is not.

**SchNet** (Schütt et al., 2017) is a message-passing GNN whose messages depend only on the interatomic distance $r_{ij}$, expanded in a basis of radial functions and fed through a continuous-filter convolution. Every internal feature is a scalar, so invariance is immediate and a ReLU is perfectly safe.

It works well, but it is **incomplete**, and it is worth being exact about in what sense. The *complete* matrix of all pairwise distances does fix a structure — up to rotation, translation and **reflection**; that is classical distance geometry. What SchNet actually sees is much less: the distances to neighbours within a cutoff, gathered independently at each atom. Pairs of distinct local environments that agree on every such distance exist (Pozdnyakov et al., 2020, who found degenerate pairs for angle-based three-body features too), and a distance-only model is forced to give them the same energy. And because the reflection ambiguity survives even in the full distance matrix, no purely distance-based model can tell a molecule from its mirror image.

The natural repair is to add more invariants.
- **Angles** between bonds: $\cos\theta_{ijk}$ from triples (**DimeNet**, Gasteiger et al., 2020).
- **Signed dihedral angles** (or the signed volume) from quadruples. The sign is what a reflection flips, so this is what can distinguish a molecule from its mirror image; an unsigned $\cos\phi$ cannot.

Each extra order costs combinatorially more terms — pairs, then triples, then quadruples — and you never get a clean guarantee that you have enough. The alternative is to stop discarding the directional information in the first place, and instead carry it in features that *know how to rotate*.`,
    },
    {
      kind: 'explain',
      title: 'EGNN: the cheap equivariant trick',
      body: String.raw`Satorras, Hoogeboom & Welling (2021) found a construction with almost no machinery. Each node carries an invariant feature $\mathbf h_i$ **and** a coordinate $\mathbf x_i$, updated like this:

$$\mathbf m_{ij}=\varphi_e\big(\mathbf h_i,\mathbf h_j,\|\mathbf x_i-\mathbf x_j\|^2\big),$$
$$\mathbf x_i'=\mathbf x_i+\frac{1}{n-1}\sum_{j\neq i}(\mathbf x_i-\mathbf x_j)\,\varphi_x(\mathbf m_{ij}),\qquad \mathbf h_i'=\varphi_h\Big(\mathbf h_i,\sum_{j}\mathbf m_{ij}\Big).$$

Look at what makes it work. The networks $\varphi_e,\varphi_x,\varphi_h$ only ever see **invariant** inputs (features and squared distances), so their outputs are invariant scalars. Those scalars are then used only as **coefficients on the relative vectors** $\mathbf x_i-\mathbf x_j$, which rotate correctly. An invariant scalar times an equivariant vector is an equivariant vector, and a sum of such is too.

So the layer is $E(n)$-equivariant for any dimension $n$, with no spherical harmonics, no representation theory, and essentially the cost of an ordinary GNN. That combination made EGNN the default first thing to try — and a very strong baseline for molecular generation.

Its limitation is the mirror of its simplicity: all the directional information is squeezed through single scalar coefficients, so the model can only build outputs in the span of the relative vectors it was given.`,
    },
    {
      kind: 'order',
      prompt: 'Put one EGNN layer in order.',
      steps: [
        'For each neighbour pair, compute the squared distance $\\|\\mathbf x_i-\\mathbf x_j\\|^2$, which is invariant',
        'Feed the two node features and that distance to $\\varphi_e$ to get an invariant message $\\mathbf m_{ij}$',
        'Turn each message into a scalar weight $\\varphi_x(\\mathbf m_{ij})$ and multiply it onto the relative vector $\\mathbf x_i-\\mathbf x_j$',
        'Add the weighted relative vectors to update the coordinate $\\mathbf x_i$',
        'Update the invariant feature $\\mathbf h_i$ from its old value and the aggregated messages',
      ],
      why: 'Every learned network in the layer consumes only invariant quantities, so nothing it outputs can rotate the wrong way. Direction enters exactly once, as the relative vectors being scaled — if $\\varphi_x$ were allowed to read the raw coordinates instead of the distance, equivariance would be lost immediately.',
    },
    {
      kind: 'explain',
      title: 'Tensor features: carrying direction properly',
      body: String.raw`The general solution comes from the representation theory of $SO(3)$, and it is the 3D version of the [steerable filters](@ml/equivariant-networks) of the previous lesson.

Every feature is labelled by an integer **type** $\ell=0,1,2,\dots$ and has $2\ell+1$ components. Under a rotation $R$ a type-$\ell$ feature transforms by the corresponding **Wigner-D** matrix $D^{(\ell)}(R)$, a $(2\ell+1)\times(2\ell+1)$ matrix. Type 0 is a scalar (invariant), type 1 is an ordinary 3-vector, type 2 behaves like a traceless symmetric $3\times3$ tensor.

Direction enters through the **spherical harmonics**: a unit vector $\hat{\mathbf r}_{ij}$ is expanded as $Y^{(\ell)}(\hat{\mathbf r}_{ij})$, which is a type-$\ell$ object by construction. Radial distance is handled separately by a learned radial function $R(r_{ij})$, which is a scalar.

Features of different types are combined by the **tensor product** with **Clebsch–Gordan coefficients**: combining types $\ell_1$ and $\ell_2$ yields types $\ell$ with $|\ell_1-\ell_2|\le\ell\le\ell_1+\ell_2$. You already know the $\ell=1$ cases: the dot product of two vectors ($1\otimes1\to0$) and the cross product ($1\otimes1\to1$). The coefficients are fixed by the group, not learned; what is learned is one scalar weight per allowed **path**. Tensor Field Networks (Thomas et al., 2018) introduced this for point clouds, and SE(3)-Transformers (Fuchs et al., 2020) added attention to it.`,
      widget: { type: 'SvgDiagram', props: { svg: TENSOR_SVG }, caption: 'Truncating at a maximum type $\\ell_{\\max}$ is the main accuracy–cost dial: higher $\\ell$ resolves finer angular detail and costs more.' },
    },
    {
      kind: 'numeric',
      prompt: String.raw`An $E(3)$-equivariant network carries 16 channels of each feature type $\ell=0,1,2$. A type-$\ell$ feature has $2\ell+1$ components. How many numbers does one atom's feature vector hold?`,
      answer: 144,
      tolerance: 0.5,
      why: String.raw`Each type contributes $16\times(2\ell+1)$: $16\times1=16$ scalars, $16\times3=48$ vector components and $16\times5=80$ type-2 components, giving $16+48+80=144$. Counting 16 numbers per type (48 in total) is the usual slip — it forgets that higher types are multi-component objects, which is precisely what lets them carry direction.`,
    },
    {
      kind: 'truefalse',
      prompt: 'An ordinary elementwise ReLU can be applied to the type-1 (vector) features of an $E(3)$-equivariant network without breaking equivariance.',
      answer: false,
      why: String.raw`Rotating a vector mixes its three components, and $\mathrm{ReLU}$ applied componentwise does not commute with that mixing: $\mathrm{ReLU}(Rv)\neq R\,\mathrm{ReLU}(v)$ in general. Equivariant networks therefore use **gated** nonlinearities — compute a scalar from the norm, pass *that* through the nonlinearity, and multiply it onto the vector — or act on norms directly. Only type-0 features may be fed to an arbitrary pointwise nonlinearity (parity-odd scalars need odd functions), which is exactly why fully invariant models like SchNet are so much simpler to build.`,
    },
    {
      kind: 'explain',
      title: 'Machine-learned interatomic potentials',
      body: String.raw`The payoff arrived in computational chemistry. **NequIP** (Batzner et al., *Nature Communications* 13, 2453, 2022) built an $E(3)$-equivariant message-passing potential with tensor features and reported state-of-the-art accuracy with remarkable data efficiency: the authors state that it outperforms existing models with up to three orders of magnitude fewer training data, training on of order a thousand reference configurations or fewer per system in several benchmarks.

The explanation is the same one that applies to every symmetry: the network does not have to spend data learning that physics is rotationally symmetric, because it cannot express anything else.

**MACE** (Batatia et al., 2022) pushed it further by forming **higher body-order** messages — products of several neighbour contributions within one layer, rather than only pairwise ones. That buys the descriptive power of 3- and 4-body terms with far fewer message-passing layers, which keeps the receptive field small and makes the model easy to parallelize. **Allegro** (Musaelian et al., 2023) removes message passing between atoms altogether in favour of strictly local equivariant features, trading some expressivity for scaling to very large systems.

These models now run molecular dynamics at close to quantum-chemical accuracy and orders of magnitude lower cost than the underlying calculations — see [molecular dynamics](@drug/molecular-dynamics) and [force fields](@drug/force-fields) for what that replaces.`,
    },
    {
      kind: 'match',
      prompt: 'Match each architecture to the mechanism it uses for 3D symmetry.',
      pairs: [
        ['SchNet', 'Messages depend only on interatomic distances: everything is a scalar'],
        ['DimeNet', 'Adds bond angles from triples of atoms as extra invariants'],
        ['EGNN', 'Invariant scalars used as coefficients on relative position vectors'],
        ['NequIP / MACE', 'Spherical-harmonic features of type $\\ell$ combined by tensor products'],
      ],
      why: 'They sit on a ladder of expressivity and cost. Distance-only models are simplest but incomplete; adding angles patches specific gaps; EGNN keeps direction with one scalar coefficient per neighbour; tensor-field models carry full angular information at every type, which is the most expressive and the most expensive.',
    },
    {
      kind: 'multi',
      prompt: 'Which choices would break the $E(3)$ equivariance of a molecular network? (Select all that apply.)',
      choices: [
        'Feeding raw atomic coordinates $\\mathbf x_i$ directly to an MLP',
        'Applying a componentwise ReLU to type-1 features',
        'Concatenating the global centre of mass to every node feature as a 3-vector',
        'Using the interatomic distance $\\|\\mathbf x_i-\\mathbf x_j\\|$ in a radial basis expansion',
      ],
      answers: [0, 1, 2],
      why: String.raw`Raw coordinates are neither translation- nor rotation-invariant, so an MLP reading them learns a coordinate frame. A componentwise ReLU does not commute with the mixing of vector components. A centre-of-mass 3-vector rotates under $R$, so concatenating it to an invariant feature mixes two different representations and the result transforms as neither. A distance is a genuine invariant, and a radial expansion of it is the standard, safe input.`,
    },
    {
      kind: 'fill',
      prompt: String.raw`In three dimensions the relevant symmetry group is ___(3), whose rotation part acts on a type-$\ell$ feature with $2\ell+1$ components. Direction enters through the ___ harmonics, and features of different types are combined by a ___ product with Clebsch–Gordan coefficients. A molecule's energy must be ___ under rotation, while the forces on its atoms must be ___.`,
      bank: ['E', 'S', 'spherical', 'circular', 'tensor', 'inner', 'invariant', 'equivariant'],
      answer: ['E', 'spherical', 'tensor', 'invariant', 'equivariant'],
      why: String.raw`$E(3)$ is translations plus $O(3)$. Spherical harmonics are the 3D analogue of the circular harmonics used in the plane, and the Clebsch–Gordan tensor product is the only way to multiply two features and know in advance how the result rotates. Energy is a scalar and forces are vectors — and obtaining the forces as $-\nabla_{\mathbf x}E$ gets the second property for free from the first.`,
    },
    {
      kind: 'explain',
      title: 'Parity, chirality and when not to use $O(3)$',
      body: String.raw`One subtlety worth knowing, because it bites in drug discovery.

$O(3)$ includes **reflections**. A network built to be $O(3)$-invariant therefore gives a molecule and its mirror image exactly the same answer. For energy in free space that is correct. It is wrong whenever the target quantity itself depends on handedness. Two **enantiomers** of a drug-like molecule often bind a chiral protein pocket with very different affinity, so a model that scores a ligand on its own, with the protein implicit, must not give both mirror images the same score; and pseudoscalar properties such as optical rotation flip sign under reflection. (If the whole protein–ligand complex is fed in jointly, mirroring everything at once is a harmless symmetry, but mirroring only the ligand is a different configuration that the model must be able to see.)

The fix is either to use $SE(3)$ only, dropping reflections, or to keep $O(3)$ and track **parity** as well as type: features are labelled $\ell$ together with a sign $e$ (even) or $o$ (odd), and quantities that pick up an extra sign under reflection — pseudoscalars, pseudovectors, the signed volume $(\mathbf r_1\times\mathbf r_2)\cdot\mathbf r_3$ — are allowed to appear. A pseudoscalar output may then take opposite values on the two mirror images, which is what chirality demands. The **e3nn** library encodes exactly this in its "0e, 0o, 1e, 1o" notation, where the letter is the parity of the feature.

The general moral holds throughout this unit: **impose the symmetry the problem actually has, and no more**. Imposing reflection invariance on a chiral problem is as damaging as learning a coordinate frame on a rotationally symmetric one.`,
    },
    {
      kind: 'explain',
      title: 'Key takeaways',
      body: String.raw`- The group is $E(3)$: translations, rotations and reflections. Handle translation with relative vectors $\mathbf r_{ij}$ and permutation with a GNN; the hard part is $O(3)$.
- Energy is **invariant**; forces, dipoles and velocities are **equivariant**. Taking forces as $-\nabla_{\mathbf x}E$ gives equivariance *and* conservation for free.
- **Invariant models** (SchNet, DimeNet) use distances and angles: simple and safe, but distances alone are incomplete and each extra order costs combinatorially.
- **EGNN**: invariant scalars multiplying relative vectors. Cheap, dimension-agnostic, a strong baseline — and limited to the span of those vectors.
- **Tensor-field models** (TFN, NequIP, MACE): features of type $\ell$ with $2\ell+1$ components transforming by Wigner-D matrices, built from **spherical harmonics** and combined by **Clebsch–Gordan tensor products**. Most expressive, most expensive, and markedly more data-efficient in practice.
- Pointwise nonlinearities are legal only on type-0 features; higher types need **gated** nonlinearities.
- Track **parity** (or use $SE(3)$) when chirality matters: $O(3)$-invariance equates a molecule with its mirror image, which is wrong for handedness-dependent targets such as activity against a chiral protein.`,
    },
  ],
  references: [
    { authors: 'N. Thomas, T. Smidt, S. Kearnes, L. Yang, L. Li, K. Kohlhoff & P. Riley', title: 'Tensor Field Networks: Rotation- and Translation-Equivariant Neural Networks for 3D Point Clouds', year: 2018, venue: 'arXiv:1802.08219', url: 'https://arxiv.org/abs/1802.08219' },
    { authors: 'V. G. Satorras, E. Hoogeboom & M. Welling', title: 'E(n) Equivariant Graph Neural Networks', year: 2021, venue: 'ICML', url: 'https://arxiv.org/abs/2102.09844' },
    { authors: 'S. Batzner, A. Musaelian, L. Sun, M. Geiger, J. P. Mailoa, M. Kornbluth, N. Molinari, T. E. Smidt & B. Kozinsky', title: 'E(3)-equivariant graph neural networks for data-efficient and accurate interatomic potentials', year: 2022, venue: 'Nature Communications 13, 2453', url: 'https://www.nature.com/articles/s41467-022-29939-5' },
    { authors: 'I. Batatia, D. P. Kovács, G. N. C. Simm, C. Ortner & G. Csányi', title: 'MACE: Higher Order Equivariant Message Passing Neural Networks for Fast and Accurate Force Fields', year: 2022, venue: 'NeurIPS', url: 'https://arxiv.org/abs/2206.07697' },
    { authors: 'K. T. Schütt, P.-J. Kindermans, H. E. Sauceda, S. Chmiela, A. Tkatchenko & K.-R. Müller', title: 'SchNet: A continuous-filter convolutional neural network for modeling quantum interactions', year: 2017, venue: 'NeurIPS', url: 'https://arxiv.org/abs/1706.08566' },
  ],
} satisfies LessonContent;
