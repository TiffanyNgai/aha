import type { LessonContent } from '../../types';

// A plain conv slides one filter; a group conv also rotates it.
const GCONV_SVG = `<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg">
<text x="78" y="14" font-size="9.5" text-anchor="middle" fill="var(--c2)">ordinary convolution</text>
<text x="238" y="14" font-size="9.5" text-anchor="middle" fill="var(--c4)">group convolution (p4)</text>
<rect x="18" y="24" width="120" height="78" fill="var(--surface)" stroke="var(--grid)" stroke-width="0.7"/>
${[0, 1, 2].map((i) => `<g><rect x="${26 + i * 40}" y="${34 + i * 18}" width="20" height="20" fill="var(--c2)" fill-opacity="0.35" stroke="var(--c2)" stroke-width="0.9"/><text x="${36 + i * 40}" y="${48 + i * 18}" font-size="9" text-anchor="middle" fill="var(--fg)">ψ</text></g>`).join('')}
<text x="78" y="116" font-size="8.5" text-anchor="middle" fill="var(--muted)">one filter ψ, copied to every</text>
<text x="78" y="127" font-size="8.5" text-anchor="middle" fill="var(--muted)">position: shift the input and</text>
<text x="78" y="138" font-size="8.5" text-anchor="middle" fill="var(--muted)">the output shifts with it</text>
<text x="78" y="156" font-size="9" text-anchor="middle" fill="var(--c2)">group = translations only</text>
<line x1="158" y1="20" x2="158" y2="166" stroke="var(--grid)" stroke-width="0.7"/>
<rect x="176" y="24" width="128" height="78" fill="var(--surface)" stroke="var(--grid)" stroke-width="0.7"/>
${[0, 1, 2, 3].map((k) => `<g transform="translate(${186 + k * 30} 52) rotate(${k * 90})"><rect x="-11" y="-11" width="22" height="22" fill="var(--c4)" fill-opacity="0.3" stroke="var(--c4)" stroke-width="0.9"/><path d="M-8,7 L-8,-8 L5,-8" fill="none" stroke="var(--fg)" stroke-width="1.4"/></g>`).join('')}
<text x="240" y="92" font-size="8.5" text-anchor="middle" fill="var(--muted)">ψ, r·ψ, r²·ψ, r³·ψ</text>
<text x="240" y="116" font-size="8.5" text-anchor="middle" fill="var(--muted)">one filter, copied to every position</text>
<text x="240" y="127" font-size="8.5" text-anchor="middle" fill="var(--muted)">AND every rotation: four output</text>
<text x="240" y="138" font-size="8.5" text-anchor="middle" fill="var(--muted)">channels, indexed by group elements</text>
<text x="240" y="156" font-size="9" text-anchor="middle" fill="var(--c4)">group = translations ⋊ 4 rotations</text>
<text x="160" y="175" font-size="8" text-anchor="middle" fill="var(--fg)">Same parameters, four times the weight sharing — the extra channels are free copies, not new weights.</text>
</svg>`;

export default {
  cards: [
    {
      kind: 'explain',
      title: 'A convolution only knows about shifts',
      body: String.raw`A [CNN](@ml/cnns) has one symmetry built in and it is a good one: slide the input and the feature maps slide with it. That single property is why convolutions beat dense layers on images.

But it is *only* shifts. Rotate a galaxy image by 30°, or flip a histology slide, and a CNN sees something essentially new. Nothing in the architecture ties the response to the upright filter to the response to the rotated one; the network has to learn rotated copies of every feature separately, from data, spending parameters and samples on a symmetry it was never told about.

For many domains the rotations are not optional. Astronomical images, aerial and satellite photographs, microscopy, crystal textures, and anything measured in a plane with no preferred "up" all come without a canonical orientation.

The [blueprint from the previous lesson](@ml/deep-sets-invariance) says what to do: enlarge the group, and build equivariance to the whole of it.`,
    },
    {
      kind: 'recall',
      title: 'Group actions and representations',
      points: [
        'A **group action** of $G$ on a space $\\mathcal X$ gives each $g\\in G$ a map $x\\mapsto g\\cdot x$, compatible with the group product.',
        'A **representation** $\\rho$ sends each $g$ to an invertible matrix $\\rho(g)$ with $\\rho(gh)=\\rho(g)\\rho(h)$ — the group acting *linearly* on a vector space.',
        'Different features can transform by different representations: a scalar by $\\rho(g)=1$, a vector in the plane by a $2\\times2$ rotation matrix, a permuted list by a permutation matrix.',
        'The groups here: $p4$ = translations plus the four $90^\\circ$ rotations; $p4m$ adds mirrors (8 point-group elements); $SO(2)$ is all continuous planar rotations.',
      ],
      link: 'math/representations-intro',
    },
    {
      kind: 'explain',
      title: 'Convolution is "try the filter everywhere"',
      body: String.raw`Rewrite a convolution to make its symmetry visible. The output at pixel $t$ is the input correlated with the filter **shifted to** $t$:

$$[f\star\psi](t)=\sum_{s}f(s)\,\psi(s-t).$$

Read it as: *for every element of the group (here, every translation $t$), move the filter by that element and measure the match.* The output is indexed by group elements. Nothing in that sentence mentions translations specifically.

So generalize. For a group $G$ acting on the input domain, define the **group correlation**

$$[f\star\psi](g)=\sum_{s}f(s)\,\psi(g^{-1}s),$$

now indexed by $g\in G$. Cohen & Welling (2016) showed that this construction is **equivariant for $G$** — exactly as a plain convolution is equivariant for translations — and Kondor & Trivedi (2018) proved a converse. Their statement is narrower than it is usually quoted: for a **compact** group $G$ acting **transitively** on the domain — so that the domain is a homogeneous space $G/H$, as the sphere is for $SO(3)$ — a linear map between spaces of functions on such domains is equivariant **if and only if** it is a (generalized) group convolution. The planar-translation case is the older, classical version of the same fact; the translation group is not compact, so it sits outside the compact-group theorem as stated. The result says nothing about nonlinear layers, and it does not say that equivariant layers on arbitrary domains must be convolutions.

For $G=p4$, "every group element" means every position *and* each of four rotations. The first layer therefore takes a plane image and produces a feature map on the **group**: four rotated copies of the response, stacked along a new axis.`,
      widget: { type: 'SvgDiagram', props: { svg: GCONV_SVG } },
    },
    {
      kind: 'widget',
      title: 'Rotate the input, permute the channels',
      body: String.raw`The lifting layer of a $p4$ G-CNN on a small $6\times6$ image. One $3\times3$ filter is rotated by $0°,90°,180°,270°$ and correlated with the image, producing four output channels labelled by the group elements $e,r,r^2,r^3$.

Press **rotate input 90°** and watch the two things that happen at once: each channel is rotated in space, **and** the four channels are cyclically permuted, $Y'_c=\mathrm{rot90}(Y_{c-1})$.

That joint "rotate the picture and shuffle the orientation axis" is precisely what equivariance to $p4$ means. The group now acts on the output by a *regular representation* — a permutation of the group axis combined with the spatial action.`,
      widget: { type: 'MlGroupConvP4', props: { turns: 0 }, caption: 'Take the maximum of each channel over space and the four numbers just get shuffled by a rotation. Pooling over them too gives a rotation-**invariant** feature.' },
    },
    {
      kind: 'mcq',
      prompt: 'In a $p4$ group-equivariant CNN, what happens to the feature maps when the input image is rotated by 90°?',
      choices: [
        'Each channel is rotated in space and the four orientation channels are cyclically permuted',
        'The feature maps are unchanged, because the layer is rotation-invariant',
        'Each channel is rotated in space, and the orientation channels stay where they are',
        'The feature maps change unpredictably, which is why a pooling layer is needed to repair them',
      ],
      answer: 0,
      why: String.raw`Equivariance means the output transforms in a *predictable* way, not that it stays still — a rotation acts on a feature map over the group by moving the pixels and relabelling the group axis together. Invariance arrives only after pooling over the group at the end, and if the orientation channels did not permute, the layer would not commute with rotation at all.`,
    },
    {
      kind: 'explain',
      title: 'What it costs and what it buys',
      body: String.raw`Mechanically, a G-CNN differs from a CNN in three places.

1. **Lifting layer.** Input on $\mathbb Z^2$, output on $G$. One learned filter per output channel, applied in $|H|$ transformed copies ($|H|=4$ for $p4$, $8$ for $p4m$, where $H$ is the point group).
2. **Group convolution layers.** Input and output both on $G$. The filter now also has a group axis, and transforming it permutes that axis as well as rotating space.
3. **Pooling over the group.** At the end, max or mean over the $|H|$ orientations collapses equivariance to invariance.

The accounting is pleasing. The **parameter** count of a layer changes by a factor of $|H|$ *in the filter's group axis only*, while the number of feature channels multiplies by $|H|$ for free — all those extra channels are transformed copies of the same weights, not new ones. Cohen & Welling's pitch was essentially this: you get the capacity of a much wider network at the parameter count of a narrow one, with the extra capacity constrained to be meaningful.

The **memory and compute** costs are real: activations grow by $|H|$. For $p4m$ that is $8\times$, which is why these models are common in microscopy and remote sensing (where the symmetry pays for itself) and rare in natural-image benchmarks (where photographs do have an "up").`,
    },
    {
      kind: 'numeric',
      prompt: String.raw`A $p4m$ G-CNN stores a feature map on a $32\times32$ spatial grid with 16 channels. Because the feature map lives on the group, it also carries one axis of size $|H|$ for the point group of $p4m$. How many numbers does one such feature map hold?`,
      answer: 131072,
      tolerance: 0.5,
      why: String.raw`$p4m$ has four rotations and a mirror, so $|H|=8$: the tensor is $32\times32\times16\times8=131\,072$ numbers, eight times the $32\times32\times16=16\,384$ a plain CNN would store. Using $|H|=4$ (that is $p4$, with no mirrors) gives half of it. This factor is the real cost of group equivariance — the parameters stay put, the activations do not.`,
    },
    {
      kind: 'order',
      prompt: 'Put a $p4$ G-CNN forward pass in order.',
      steps: [
        'Lift: correlate the planar input with the four rotated copies of each first-layer filter, producing a feature map indexed by the group',
        'Apply a pointwise nonlinearity, which acts identically at every position and every group element',
        'Run group-convolution layers whose filters also carry a group axis, keeping the feature maps on the group',
        'Pool over the group axis (max or mean) to collapse the orientation dimension',
        'Pool over space and apply an ordinary classification head',
      ],
      why: 'Lifting happens once, because afterwards the features already live on the group. A pointwise nonlinearity is safe at every stage precisely because it treats all positions and group elements alike. Group pooling must come after all the equivariant layers: do it early and the orientation information later layers need is gone.',
    },
    {
      kind: 'truefalse',
      prompt: 'A ReLU applied elementwise to a feature map over a group destroys the group equivariance of the network.',
      answer: false,
      why: String.raw`A pointwise nonlinearity commutes with any action that merely *moves and relabels* entries, which is what a regular representation does — the rotated-and-permuted copy of $\mathrm{ReLU}(Y)$ is $\mathrm{ReLU}$ of the rotated-and-permuted $Y$. This is why regular-representation G-CNNs can reuse the entire CNN toolbox. It stops being automatic for *steerable* features, whose channels mix under the group: there a ReLU is not equivariant, and gated or norm-based nonlinearities are used instead.`,
    },
    {
      kind: 'explain',
      title: 'Steerable CNNs: do not store the copies',
      body: String.raw`Copying filters works for a finite group. For continuous rotations $SO(2)$ there are infinitely many copies and the approach breaks down.

**Steerable** CNNs (Cohen & Welling, 2017; Worrall et al., 2017; Weiler & Cesa, 2019) change tactics. Instead of storing a rotated filter for each angle, expand the filter in a basis whose rotation behaviour is known in closed form — **circular harmonics** $e^{i m\theta}$ in 2D, **spherical harmonics** in 3D. Rotating such a basis function multiplies it by a phase:
$$\psi_m(R_\alpha^{-1}x)=e^{-i m\alpha}\psi_m(x).$$
The filter is "steered" to a new angle by multiplying coefficients, with no resampling and no interpolation error, for *any* angle.

The feature maps change character too. Rather than one copy per group element, a steerable network carries **fields**, each labelled by a representation of the group: a scalar field (unchanged by rotation), a vector field (rotated by $R$), and higher-frequency types. The representation theory of the group tells you exactly which filters are allowed between any pair of field types — the constraint becomes a linear equation on filter coefficients, solved once and then used as a fixed basis.

The trade versus the regular representation: steerable features are compact and handle continuous groups exactly, but ordinary pointwise nonlinearities no longer commute with the action, so you need norm-based or gated ones. This machinery is what the [$E(3)$ networks for molecules](@ml/e3-equivariant-networks) are built from.`,
    },
    {
      kind: 'match',
      prompt: 'Match each design to how it represents the group.',
      pairs: [
        ['Plain CNN', 'Translations only; one filter copied to every position'],
        ['$p4$ G-CNN (regular representation)', 'A feature value stored for every group element; the group permutes them'],
        ['Steerable CNN (irreducible representations)', 'Fields labelled by frequency; the group acts by a known matrix on each'],
        ['Data augmentation with random rotations', 'No representation at all; the symmetry is only encouraged by the loss'],
      ],
      why: 'The regular representation is simple and keeps ReLU legal, but costs a factor of $|G|$ in memory and only works for finite groups. Irreducible representations are compact and exact for continuous groups, at the price of restricted nonlinearities. Augmentation imposes no structure on the model at all.',
    },
    {
      kind: 'multi',
      prompt: 'Which are genuine advantages of a group-equivariant architecture over rotation augmentation? (Select all that apply.)',
      choices: [
        'The symmetry holds exactly, for every group element, at every point in parameter space',
        'Weight sharing across the group reduces the number of parameters needed for the same capacity',
        'Equivariance holds layer by layer, so intermediate features are structured, not just the final output',
        'It removes the need for any spatial pooling at the end of the network',
      ],
      answers: [0, 1, 2],
      why: String.raw`Exactness, parameter efficiency and per-layer structure are the three real wins — and the third matters most for dense prediction, where intermediate features are the product. Pooling is still needed: group pooling converts equivariance to invariance over orientations, and spatial pooling does the same for position. Equivariance organizes information; it does not summarize it.`,
    },
    {
      kind: 'fill',
      prompt: String.raw`A group convolution $[f\star\psi](g)=\sum_s f(s)\psi(g^{-1}s)$ produces a feature map indexed by elements of the ___. For $p4$ this adds an axis of size ___ to every feature map, while the parameter count stays tied to a single filter. Pooling over that axis at the end turns equivariance into ___. For continuous rotations the copies are replaced by a basis of circular ___, giving a ___ network.`,
      bank: ['group', 'four', 'eight', 'invariance', 'equivariance', 'harmonics', 'steerable', 'regular'],
      answer: ['group', 'four', 'invariance', 'harmonics', 'steerable'],
      why: String.raw`$p4$ has four rotations ($p4m$, with mirrors, has eight). The group axis is what gets pooled away to obtain invariance, and it must survive until then. Circular harmonics rotate by a phase, so a filter built from them can be steered to any angle exactly — the defining property of a steerable network.`,
    },
    {
      kind: 'explain',
      title: 'Where this is used',
      body: String.raw`- **Microscopy and digital pathology.** A cell in a slide has no canonical orientation; rotation and mirror equivariance is close to free accuracy, and $p4m$ models are standard.
- **Remote sensing and astronomy.** Aerial images and galaxy images likewise have no "up".
- **Spherical data.** Spherical CNNs (Cohen et al., 2018) build $SO(3)$-equivariant layers using the Fourier transform on the sphere, for omnidirectional images, climate fields and molecular surfaces.
- **Physics and chemistry.** The big one. Forces, energies and tensor properties must transform correctly under rotation, and the next lesson builds networks that do.
- **A general caution.** Real images are only *approximately* symmetric: sampling on a square grid is not exactly rotation-invariant, lighting comes from above, and text has an orientation. Over-constraining is a real failure mode, which is why relaxed and partially equivariant architectures are an active topic.`,
    },
    {
      kind: 'explain',
      title: 'Key takeaways',
      body: String.raw`- A convolution is "correlate with the filter moved by each group element". Replacing translations by a larger group $G$ gives the **group convolution** $[f\star\psi](g)=\sum_s f(s)\psi(g^{-1}s)$, which is equivariant — and, for a compact group acting transitively on the domain, every equivariant linear map has this form (Kondor & Trivedi, 2018).
- **Lift** from the plane to the group, run group convolutions, then **pool over the group** to get invariance.
- The **regular representation** stores one value per group element: simple, pointwise nonlinearities still work, memory grows by $|H|$ ($4$ for $p4$, $8$ for $p4m$), parameters do not.
- **Steerable** networks expand filters in circular or spherical harmonics, so filters can be steered to any angle exactly; features become **fields** labelled by representations, and nonlinearities must be chosen to respect them.
- The symmetry constraint is exact and layer-by-layer, which augmentation can never be — but only help when the data really have that symmetry.`,
    },
  ],
  references: [
    { authors: 'T. S. Cohen & M. Welling', title: 'Group Equivariant Convolutional Networks', year: 2016, venue: 'ICML', url: 'https://arxiv.org/abs/1602.07576' },
    { authors: 'T. S. Cohen & M. Welling', title: 'Steerable CNNs', year: 2017, venue: 'ICLR', url: 'https://arxiv.org/abs/1612.08498' },
    { authors: 'D. E. Worrall, S. J. Garbin, D. Turmukhambetov & G. J. Brostow', title: 'Harmonic Networks: Deep Translation and Rotation Equivariance', year: 2017, venue: 'CVPR', url: 'https://arxiv.org/abs/1612.04642' },
    { authors: 'M. Weiler & G. Cesa', title: 'General E(2)-Equivariant Steerable CNNs', year: 2019, venue: 'NeurIPS', url: 'https://arxiv.org/abs/1911.08251' },
    { authors: 'R. Kondor & S. Trivedi', title: 'On the Generalization of Equivariance and Convolution in Neural Networks to the Action of Compact Groups', year: 2018, venue: 'ICML', url: 'https://arxiv.org/abs/1802.03690' },
  ],
} satisfies LessonContent;
