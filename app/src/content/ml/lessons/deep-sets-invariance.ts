import type { LessonContent } from '../../types';

// The two commuting squares: invariance and equivariance.
const SQUARES_SVG = `<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg">
<defs><marker id="sq" viewBox="0 0 6 6" refX="5" refY="3" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="var(--muted)"/></marker></defs>
<text x="78" y="14" font-size="9.5" text-anchor="middle" fill="var(--c2)">INVARIANT   f(g·x) = f(x)</text>
<text x="240" y="14" font-size="9.5" text-anchor="middle" fill="var(--c4)">EQUIVARIANT   f(g·x) = g·f(x)</text>
${[[8, 'var(--c2)'], [170, 'var(--c4)']].map(([ox, col]) => {
    const o = ox as number;
    return `<text x="${o + 10}" y="46" font-size="10" fill="var(--fg)">x</text>` +
      `<text x="${o + 118}" y="46" font-size="10" text-anchor="end" fill="var(--fg)">g·x</text>` +
      `<line x1="${o + 22}" y1="42" x2="${o + 96}" y2="42" stroke="var(--muted)" stroke-width="1" marker-end="url(#sq)"/>` +
      `<text x="${o + 59}" y="36" font-size="8" text-anchor="middle" fill="var(--muted)">act by g</text>` +
      `<line x1="${o + 12}" y1="52" x2="${o + 12}" y2="94" stroke="${col}" stroke-width="1.1" marker-end="url(#sq)"/>` +
      `<line x1="${o + 108}" y1="52" x2="${o + 108}" y2="94" stroke="${col}" stroke-width="1.1" marker-end="url(#sq)"/>` +
      `<text x="${o + 16}" y="76" font-size="8" fill="${col}">f</text>` +
      `<text x="${o + 112}" y="76" font-size="8" fill="${col}">f</text>`;
  }).join('')}
<text x="20" y="110" font-size="10" fill="var(--fg)">f(x)</text>
<text x="126" y="110" font-size="10" text-anchor="end" fill="var(--fg)">f(x)</text>
<text x="78" y="126" font-size="8.5" text-anchor="middle" fill="var(--c2)">identical — the output never moves</text>
<text x="182" y="110" font-size="10" fill="var(--fg)">f(x)</text>
<text x="296" y="110" font-size="10" text-anchor="end" fill="var(--fg)">g·f(x)</text>
<line x1="206" y1="106" x2="258" y2="106" stroke="var(--c4)" stroke-width="1" marker-end="url(#sq)"/>
<text x="240" y="126" font-size="8.5" text-anchor="middle" fill="var(--c4)">the output moves the same way</text>
<text x="160" y="150" font-size="8.5" text-anchor="middle" fill="var(--fg)">Invariance is the special case where g acts trivially on the output.</text>
<text x="160" y="164" font-size="8.5" text-anchor="middle" fill="var(--muted)">Stack equivariant layers, finish with one invariant pooling step: that is the whole recipe.</text>
</svg>`;

export default {
  cards: [
    {
      kind: 'explain',
      title: 'The question a model should not be able to ask',
      body: String.raw`A bag of atoms. A point cloud from a lidar scan. A set of particle tracks in a detector. The items arrived in *some* order, because a computer had to store them in *some* order, but the order carries no information. If your network's prediction changes when you shuffle the list, part of its capacity is being spent on an answer to a question that has no meaning.

The fix is not more data. It is to build a network for which the question cannot be asked — one whose output is **mathematically forced** to be unchanged by reordering.

This is the central idea of geometric deep learning: identify the transformations that should not matter, and make them structurally impossible to notice. Shifts for images, reorderings for sets, rotations for molecules, relabellings for [graphs](@ml/gnns). One principle, many groups.`,
    },
    {
      kind: 'recall',
      title: 'Groups, in one card',
      points: [
        'A **group** $G$ is a set with an associative product, an identity $e$, and an inverse for every element.',
        'A **group action** on a space $\\mathcal X$ assigns to each $g\\in G$ a map $x\\mapsto g\\cdot x$ with $e\\cdot x=x$ and $g\\cdot(h\\cdot x)=(gh)\\cdot x$.',
        'The symmetries of an object form a group: rotations $SO(3)$, translations $\\mathbb R^d$, reorderings of $n$ items — the **symmetric group** $S_n$, of size $n!$.',
        'Two actions of the same group on different spaces (input and output) are what let us compare "move then predict" with "predict then move".',
      ],
      link: 'math/groups-intro',
    },
    {
      kind: 'explain',
      title: 'Invariance and equivariance, precisely',
      body: String.raw`Let $G$ act on the input space and (possibly differently) on the output space. A map $f$ is

- **invariant** if $f(g\cdot x)=f(x)$ for every $g\in G$ and every $x$;
- **equivariant** if $f(g\cdot x)=g\cdot f(x)$ for every $g$ and $x$.

Invariance is the special case of equivariance in which $G$ acts trivially on the output.

The distinction decides what you can stack. Invariance is a **destructive** operation: once applied, the information about which $g$ was used is gone, and no later layer can recover it. Equivariance is **structure-preserving**: it can be composed indefinitely, because the composition of two equivariant maps is equivariant.

Hence the universal design pattern, and it is worth memorizing:

> **many equivariant layers, then one invariant pooling step, then an ordinary head.**

A [CNN](@ml/cnns) is translation-equivariant in its convolutions and translation-invariant only after global pooling. A GNN is permutation-equivariant in its layers and invariant only after readout. The same shape appears again for rotations, and again for $E(3)$.`,
      widget: { type: 'SvgDiagram', props: { svg: SQUARES_SVG } },
    },
    {
      kind: 'widget',
      title: 'Does the square commute?',
      body: String.raw`Four points, each carrying a predicted vector — think of a force on each atom. Turn the dial $\theta$ and the widget draws both routes round the square: solid arrows for $f(R\cdot x)$ (rotate the input, then run the model) and dashed arrows for $R\cdot f(x)$ (run the model, then rotate its output).

With the **relative** model, which builds each output only from differences $x_i-x_j$, the two sets of arrows sit exactly on top of each other at every angle. Press **raw coordinates** to switch to the other model, in which coordinates are fed to a generic linear layer: the arrows agree at $\theta=0$ and drift apart immediately afterwards, and the readout reports the gap as non-zero.

That drift is what a model trained with rotation augmentation is left fighting at test time. The relative model never has the fight.`,
      widget: { type: 'MlEquivarianceSquare', props: { model: 'relative', theta: 40 }, caption: 'The scalar $\\sum_{i<j}\\|x_i-x_j\\|$ printed below is *invariant*: it does not move at all.' },
    },
    {
      kind: 'mcq',
      prompt: 'A segmentation network takes an image and outputs one label per pixel. Which symmetry property should it have with respect to translating the input image?',
      choices: [
        'Equivariant: shifting the image should shift the label map by the same amount',
        'Invariant: the label map should be identical whatever the shift',
        'Neither, because segmentation is a per-pixel task and symmetry applies only to whole-image predictions',
        'Invariant during training and equivariant at test time',
      ],
      answer: 0,
      why: String.raw`The output lives in the same spatial domain as the input, so the group must act on it too: move the cat three pixels right and its mask should move three pixels right. An invariant label map would be a map that refuses to move when the object does — clearly wrong. Invariance is the right requirement only when the output has no spatial structure left, such as a single class label for the whole image.`,
    },
    {
      kind: 'explain',
      title: 'Why not just augment the data?',
      body: String.raw`You could train an ordinary MLP and show it many shuffled copies of each set. Sometimes that works. Three reasons architecture usually wins.

- **It is exact.** An equivariant architecture satisfies the constraint for every $g$, including ones never seen in training, and at every point in parameter space — before training, during it, and after. Augmentation gives approximate invariance on the training distribution and no guarantee off it.
- **It is cheaper.** For sets the group has $n!$ elements; for a 20-item set that is $2.4\times10^{18}$ orderings. You cannot cover that by sampling. Weight sharing restricts the hypothesis space instead, which cuts the number of parameters and the sample complexity together.
- **It composes.** An equivariant layer can be followed by another, so the symmetry survives depth. Augmentation operates on the model as a whole and gives no per-layer structure to build on.

The trade is real, though. Hard-wiring a symmetry the data do *not* have is a modelling error you cannot train away — a network invariant to reflection will never tell your left hand from your right.`,
    },
    {
      kind: 'truefalse',
      prompt: 'A network trained with heavy data augmentation over a symmetry group is exactly invariant to that group once training converges.',
      answer: false,
      why: String.raw`Augmentation makes invariance a *soft preference* fitted on the training distribution: it is approximate, it degrades off-distribution, and it can be measured to fail by simply testing a transformation the model happened not to see enough of. A built-in symmetry holds identically, for every group element and every input, as an algebraic property of the architecture. Augmentation is still useful — including as a cheap stand-in for symmetries too awkward to build in — but "trained to be invariant" and "is invariant" are different statements.`,
    },
    {
      kind: 'explain',
      title: 'Deep Sets: what every invariant set function looks like',
      body: String.raw`For sets there is a remarkably clean answer, due to Zaheer et al. (2017). Under suitable conditions (sets of fixed size or from a countable universe; for continuous functions, $\phi$ and $\rho$ are taken to be continuous), a function $f$ of a set $X=\{x_1,\dots,x_n\}$ is **permutation-invariant if and only if** it can be written in the **sum-decomposition** form

$$f(X)=\rho\Big(\sum_{x\in X}\phi(x)\Big)$$

for some functions $\phi$ and $\rho$.

Read that twice: it is not a useful special case, it is a *characterization*. Every invariant set function has this shape, and everything of this shape is invariant.

The architecture writes itself. Encode each element with a shared network $\phi$ — the same $\phi$ for all of them, which is the weight sharing. Add the encodings up; addition is commutative, so the order is destroyed exactly here and nowhere else. Then decode the single pooled vector with $\rho$. The set can have any size, since a sum does not care how many terms it has.

PointNet (Qi et al., 2017) is the same design with max-pooling instead of sum, applied to 3D point clouds, and was one of the first architectures to consume raw point sets directly.`,
    },
    {
      kind: 'widget',
      title: 'Encode, pool, decode',
      body: String.raw`Each chip is one element of the set; the three bars under it are $\phi(x)=(x,\,x^2,\,\tanh 2x)$. The row below shows the pooled vector $u=\bigoplus\phi(x)$, and then $\rho(u)$, the final answer.

Press **shuffle** repeatedly. The chips rearrange, the pooled vector does not move by a digit, and the Deep Sets output is identical every time. The grey baseline $w^\top x$ — an ordinary dense layer reading the list in order — jumps on every single shuffle.

Then press **duplicate first**, which adds a copy of the chip currently on the left, and compare the three aggregators. **Sum** changes, because it counts the extra element. **Mean** changes only a little, since it just moves towards the copied value and has no idea that the set grew. **Max** does not change at all, because a repeated element adds no new extreme. Mean and max throwing away counts is the same loss that limits [GNN expressivity](@ml/gnn-expressivity).`,
      widget: { type: 'MlDeepSetsPool', props: { agg: 'sum' }, caption: 'Invariance here is arithmetic, not training: addition simply does not have an order.' },
    },
    {
      kind: 'numeric',
      prompt: String.raw`Use the sum-decomposition $\phi(x)=(x,\,x^2)$, pooled by summing, with $\rho(u_1,u_2)=u_2/n-(u_1/n)^2$ for a set of $n$ elements. Applied to the set $\{2,4,9\}$, what does this network output? (3 decimal places)`,
      answer: 8.667,
      tolerance: 0.005,
      why: String.raw`$u_1=2+4+9=15$ and $u_2=4+16+81=101$, with $n=3$, so the output is $101/3-(15/3)^2=33.667-25=8.667$ — the variance of the set. It is a nice demonstration that genuinely useful statistics are sum-decomposable: count, mean, variance, any moment, and (approximately, with a suitable $\phi$) the maximum too. Dividing before summing instead of after would compute something else entirely.`,
    },
    {
      kind: 'order',
      prompt: 'Put a Deep Sets forward pass in order.',
      steps: [
        'Apply the same encoder $\\phi$ to every element of the set, independently',
        'Combine the encodings with a permutation-invariant pooling operator (sum, mean or max)',
        'Feed the single pooled vector to the decoder $\\rho$',
        'Read off the set-level prediction',
      ],
      why: 'The encoder must act element-wise and with shared weights, or different positions would be treated differently and invariance would be lost. Pooling is the one and only place the ordering is destroyed, and everything after it sees a single vector, so nothing downstream can reintroduce order dependence.',
    },
    {
      kind: 'explain',
      title: 'The fine print, and equivariant set layers',
      body: String.raw`Two caveats and one extension.

**The latent has to be wide enough.** Wagstaff et al. (2019) showed that representing *all* continuous permutation-invariant functions of sets of $N$ real numbers with *continuous* $\phi$ and $\rho$ in sum-decomposition form requires the pooled vector to have dimension at least $N$ (and dimension $N$ suffices). With a narrower latent space, some continuous invariant functions simply have no such representation. Without the continuity requirement the obstruction disappears, since a discontinuous $\phi$ can encode a whole set into one number, which is useless for learning. A universality theorem says a representation exists; it does not promise that a narrow bottleneck will do.

**Pooling choice is a modelling choice.** Sum keeps counts (how many of each kind), mean discards size, max keeps only extremes and is robust to outliers. Any of them might be right: molecular energy is extensive, so it should be a sum; an average bond length is a mean.

**Equivariant set layers.** If you want *per-element* outputs rather than one answer, Deep Sets also gives the linear equivariant maps. A linear map $\mathbb R^n\to\mathbb R^n$ commuting with all $n!$ permutations is spanned by just two matrices, the identity $I$ and the all-ones $\mathbf 1\mathbf 1^\top$, so the layer is
$$f(\mathbf x)=\sigma\big(\lambda\,\mathbf x+\gamma\,(\mathbf 1^\top\mathbf x)\mathbf 1\big)$$
— "each element, plus a shared summary of all elements", with two parameters per channel pair.

That is a very restrictive layer, and the standard way to make it expressive is to let elements interact pairwise: **self-attention without positional encodings is a permutation-equivariant set layer**, which is why a transformer applied to a set behaves sensibly and why Set Transformer (Lee et al., 2019) works. Seen this way, positional encodings are precisely the device that *breaks* the set symmetry when the data really are a sequence.`,
    },
    {
      kind: 'match',
      prompt: 'Match each data type to the group whose action a model should respect.',
      pairs: [
        ['A set of particles with no order', 'The symmetric group $S_n$ of reorderings'],
        ['A natural image', 'Translations of the plane'],
        ['A molecule in 3D space', 'Rotations, reflections and translations: $E(3)$'],
        ['A graph stored with an arbitrary node numbering', 'Node relabellings, acting by $A\\mapsto PAP^\\top$'],
      ],
      why: 'Choosing the group is the first and most consequential design decision — everything else follows from it. Note how the same group can act differently on different outputs: $S_n$ acts trivially on a set-level scalar (invariance) and by permutation on per-element outputs (equivariance).',
    },
    {
      kind: 'multi',
      prompt: 'Which statements about Deep Sets and set functions are true? (Select all that apply.)',
      choices: [
        'Every permutation-invariant set function can be written as $\\rho(\\sum_x\\phi(x))$ under the theorem’s conditions',
        'The encoder $\\phi$ must share its weights across all elements',
        'Self-attention with no positional encoding is permutation-equivariant',
        'Sum pooling and mean pooling give the same architecture up to a constant factor',
      ],
      answers: [0, 1, 2],
      why: String.raw`The sum-decomposition result is a characterization, not just a sufficient condition, and shared weights are what make the element-wise stage symmetric. Attention computes each output from a softmax-weighted sum over all tokens, which is order-blind until positional information is added. Sum and mean differ by a factor of $n$ that *depends on the input*, so they are genuinely different functions — mean cannot count and sum can.`,
    },
    {
      kind: 'fill',
      prompt: String.raw`A map with $f(g\cdot x)=f(x)$ is called ___, while $f(g\cdot x)=g\cdot f(x)$ is called ___. The standard blueprint stacks many layers of the second kind and finishes with one ___ pooling step. For sets, every invariant function has the form $\rho(\sum_x\phi(x))$, where $\phi$ has ___ weights across elements, and the group involved is the ___ group $S_n$.`,
      bank: ['invariant', 'equivariant', 'invariant', 'shared', 'separate', 'symmetric', 'orthogonal'],
      answer: ['invariant', 'equivariant', 'invariant', 'shared', 'symmetric'],
      why: String.raw`Invariance destroys the group information and so belongs at the end; equivariance preserves it and so composes through depth. Shared weights are exactly what makes the element-wise encoder treat all positions alike — the set analogue of a convolution reusing one kernel at every pixel. $S_n$, the symmetric group, has $n!$ elements.`,
    },
    {
      kind: 'explain',
      title: 'Key takeaways',
      body: String.raw`- Pick the group $G$ of transformations that should not change the answer; that choice *is* the inductive bias.
- **Invariant**: $f(g\cdot x)=f(x)$. **Equivariant**: $f(g\cdot x)=g\cdot f(x)$. Invariance is the trivial-output special case.
- **Blueprint**: stack equivariant layers, pool once invariantly, then an ordinary head. CNNs, GNNs, Deep Sets and $E(3)$ networks are all instances.
- Architecture beats augmentation: exact for every group element, cheaper in samples and parameters, and composable — but wrong if the data do not actually have the symmetry.
- **Deep Sets**: every permutation-invariant set function is $\rho(\sum_{x}\phi(x))$ with shared $\phi$ — a characterization, not a heuristic. PointNet is the max-pooling version.
- Fine print: for sets of $N$ scalars, a continuous sum-decomposition needs a pooled dimension of at least $N$ for full universality (Wagstaff et al., 2019), and sum / mean / max are genuinely different models.
- Linear permutation-equivariant layers have just two free parameters ($I$ and $\mathbf 1\mathbf 1^\top$); **self-attention without positional encodings** is the expressive equivariant set layer.`,
    },
  ],
  references: [
    { authors: 'M. Zaheer, S. Kottur, S. Ravanbakhsh, B. Póczos, R. Salakhutdinov & A. J. Smola', title: 'Deep Sets', year: 2017, venue: 'NeurIPS', url: 'https://arxiv.org/abs/1703.06114' },
    { authors: 'C. R. Qi, H. Su, K. Mo & L. J. Guibas', title: 'PointNet: Deep Learning on Point Sets for 3D Classification and Segmentation', year: 2017, venue: 'CVPR', url: 'https://arxiv.org/abs/1612.00593' },
    { authors: 'E. Wagstaff, F. B. Fuchs, M. Engelcke, I. Posner & M. A. Osborne', title: 'On the Limitations of Representing Functions on Sets', year: 2019, venue: 'ICML', url: 'https://arxiv.org/abs/1901.09006' },
    { authors: 'J. Lee, Y. Lee, J. Kim, A. R. Kosiorek, S. Choi & Y. W. Teh', title: 'Set Transformer: A Framework for Attention-based Permutation-Invariant Neural Networks', year: 2019, venue: 'ICML', url: 'https://arxiv.org/abs/1810.00825' },
    { authors: 'M. M. Bronstein, J. Bruna, T. Cohen & P. Veličković', title: 'Geometric Deep Learning: Grids, Groups, Graphs, Geodesics, and Gauges', year: 2021, venue: 'arXiv:2104.13478', detail: 'Ch. 3–4 (the blueprint)', url: 'https://arxiv.org/abs/2104.13478' },
  ],
} satisfies LessonContent;
