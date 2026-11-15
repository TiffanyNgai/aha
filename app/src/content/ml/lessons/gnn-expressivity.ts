import type { LessonContent } from '../../types';

// Two 2-regular graphs on 6 nodes that message passing cannot tell apart.
const TWIN_SVG = (() => {
  const ring = (cx: number, cy: number, r: number, n: number) =>
    Array.from({ length: n }, (_, i) => {
      const a = (Math.PI * 2 * i) / n - Math.PI / 2;
      return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as [number, number];
    });
  const A = ring(78, 72, 42, 6);
  const B1 = ring(200, 52, 24, 3);
  const B2 = ring(262, 96, 24, 3);
  const node = ([x, y]: [number, number]) =>
    `<circle cx="${x}" cy="${y}" r="8" fill="var(--c2)" fill-opacity="0.35" stroke="var(--fg)" stroke-width="0.9"/>`;
  const edge = (p: [number, number], q: [number, number]) =>
    `<line x1="${p[0]}" y1="${p[1]}" x2="${q[0]}" y2="${q[1]}" stroke="var(--muted)" stroke-width="1.2"/>`;
  const cyc = (pts: [number, number][]) => pts.map((p, i) => edge(p, pts[(i + 1) % pts.length])).join('');
  return `<svg viewBox="0 0 320 170" xmlns="http://www.w3.org/2000/svg">
<text x="78" y="16" font-size="9.5" text-anchor="middle" fill="var(--fg)">one 6-cycle</text>
<text x="232" y="16" font-size="9.5" text-anchor="middle" fill="var(--fg)">two triangles</text>
${cyc(A)}${A.map(node).join('')}
${cyc(B1)}${cyc(B2)}${[...B1, ...B2].map(node).join('')}
<line x1="150" y1="24" x2="150" y2="124" stroke="var(--grid)" stroke-width="0.7"/>
<text x="160" y="140" font-size="8.5" text-anchor="middle" fill="var(--muted)">6 nodes each · every node has degree 2 · identical features</text>
<text x="160" y="152" font-size="8.5" text-anchor="middle" fill="var(--c5)">every message-passing GNN gives these two graphs the same output</text>
<text x="160" y="164" font-size="8" text-anchor="middle" fill="var(--muted)">yet one is connected and the other is not — a difference nothing local can see</text>
</svg>`;
})();

const OVER_SVG = `<svg viewBox="0 0 320 160" xmlns="http://www.w3.org/2000/svg">
<text x="80" y="14" font-size="9.5" text-anchor="middle" fill="var(--c5)">oversmoothing</text>
<text x="240" y="14" font-size="9.5" text-anchor="middle" fill="var(--c4)">oversquashing</text>
${[0, 1, 2, 3].map((l) => [0, 1, 2, 3, 4].map((i) => {
    const o = 0.95 - l * 0.26;
    return `<circle cx="${18 + i * 28}" cy="${34 + l * 22}" r="6" fill="var(--c2)" fill-opacity="${(i % 2 ? o : 1 - o) * 0.9 + 0.08}" stroke="var(--grid)" stroke-width="0.5"/>`;
  }).join('')).join('')}
<text x="80" y="134" font-size="8" text-anchor="middle" fill="var(--muted)">layer by layer, node features</text>
<text x="80" y="144" font-size="8" text-anchor="middle" fill="var(--muted)">converge to one shared vector</text>
<text x="80" y="154" font-size="8" text-anchor="middle" fill="var(--muted)">— nodes become indistinguishable</text>
<line x1="156" y1="22" x2="156" y2="120" stroke="var(--grid)" stroke-width="0.7"/>
${[0, 1, 2, 3].map((i) => `<circle cx="178" cy="${32 + i * 20}" r="6" fill="var(--c4)" fill-opacity="0.35" stroke="var(--grid)" stroke-width="0.5"/><line x1="184" y1="${32 + i * 20}" x2="232" y2="66" stroke="var(--muted)" stroke-width="0.8"/>`).join('')}
<circle cx="240" cy="66" r="8" fill="var(--c3)" fill-opacity="0.5" stroke="var(--fg)" stroke-width="0.9"/>
<line x1="248" y1="66" x2="268" y2="66" stroke="var(--c5)" stroke-width="2"/>
${[0, 1, 2, 3].map((i) => `<circle cx="296" cy="${32 + i * 20}" r="6" fill="var(--c4)" fill-opacity="0.35" stroke="var(--grid)" stroke-width="0.5"/><line x1="276" y1="66" x2="290" y2="${32 + i * 20}" stroke="var(--muted)" stroke-width="0.8"/>`).join('')}
<text x="240" y="134" font-size="8" text-anchor="middle" fill="var(--muted)">exponentially many distant nodes</text>
<text x="240" y="144" font-size="8" text-anchor="middle" fill="var(--muted)">must pass through one edge,</text>
<text x="240" y="154" font-size="8" text-anchor="middle" fill="var(--muted)">compressed into one fixed vector</text>
</svg>`;

export default {
  cards: [
    {
      kind: 'explain',
      title: 'Two graphs a GNN cannot tell apart',
      body: String.raw`[Message passing](@ml/gnns) is elegant, cheap and permutation-equivariant. It is also, provably, **blind** to certain differences between graphs — and the blindness is not a bug in some particular architecture, but a limit of the recipe itself.

Here is the standard example. On the left, six nodes in a single ring. On the right, six nodes in two separate triangles. Every node in both pictures has exactly two neighbours, and every node starts with the same feature. Run any number of message-passing layers with any learned $\psi$ and $\varphi$, and every node in both graphs will hold the **same** vector at every step — so any readout gives the same answer.

One graph is connected and the other is not. A GNN cannot see the difference.`,
      widget: { type: 'SvgDiagram', props: { svg: TWIN_SVG } },
    },
    {
      kind: 'explain',
      title: 'Colour refinement: the 1-WL test',
      body: String.raw`To say *exactly* how blind, we need a yardstick, and a 1968 algorithm of Weisfeiler and Leman provides it. **1-WL colour refinement** is a cheap heuristic for deciding whether two graphs are isomorphic.

1. Give every node the same colour.
2. Repeat: replace each node's colour by a **fresh colour standing for the pair** (its old colour, the *sorted multiset* of its neighbours' colours). Use one shared colour dictionary for both graphs.
3. Stop when the partition of nodes into colour classes stops changing.
4. Compare the two graphs' **colour histograms**. Different histogram $\Rightarrow$ definitely non-isomorphic. Same histogram $\Rightarrow$ the test cannot decide.

Compare that with one message-passing layer: a node's new state is a function of (its old state, the multiset of its neighbours' states). It is the *same* update. The only difference is that WL uses a perfect hash where a GNN uses a learned, continuous function — and a learned function can at best match a perfect hash, never beat it.`,
    },
    {
      kind: 'widget',
      title: 'Run the test yourself',
      body: String.raw`Step through the rounds on the two graphs. The letters are colours, the line underneath is the histogram.

On $C_6$ versus two triangles, every node always has the same colour, in both graphs, forever — the refinement is stable from round 0 and the histograms are identical. 1-WL fails, and so does every message-passing GNN.

Now switch to the second pair, $C_4\cup K_2$ versus the path $P_6$. They have the same number of nodes and edges and, after one round, the same histogram. At round 2 the colours split and the histograms separate: this pair *is* within reach, but only once information has travelled two hops.`,
      widget: { type: 'MlWlRefinement', props: { pair: 'cycles', round: 0 }, caption: 'A difference at any round certifies non-isomorphism; agreement at stability certifies nothing.' },
    },
    {
      kind: 'order',
      prompt: 'Put one round of 1-WL colour refinement in order.',
      steps: [
        'For each node, collect the multiset of its neighbours’ current colours',
        'Sort that multiset so the result does not depend on the order the neighbours were listed in',
        'Hash the pair (own colour, sorted multiset) to a new colour, using one dictionary shared by both graphs',
        'Assign every node its new colour simultaneously',
        'Compare the two graphs’ colour histograms, and stop if the partition into colour classes did not change',
      ],
      why: 'Sorting the multiset is what makes the step permutation-invariant — it is the exact counterpart of the order-blind aggregator in a GNN. Sharing one dictionary across both graphs is essential: colours have to be comparable between the two, or the histograms would be meaningless.',
    },
    {
      kind: 'numeric',
      prompt: String.raw`Run 1-WL on the 6-node path $P_6$ (a chain $1-2-3-4-5-6$), starting from one colour for every node. How many **distinct colours** are there after round 2?`,
      answer: 3,
      tolerance: 0.5,
      why: String.raw`Round 1 splits the nodes by degree: the two endpoints get one colour, the four interior nodes another — 2 colours. Round 2 looks at neighbour multisets: nodes 2 and 5 each see one endpoint and one interior node, while nodes 3 and 4 see two interior nodes, so the interior class splits in two — 3 colours. Round 3 changes nothing, so refinement is already stable. The nodes have effectively been labelled by their distance from the nearer end.`,
    },
    {
      kind: 'explain',
      title: 'The theorem',
      body: String.raw`Two groups proved the same thing at the same time — Xu, Hu, Leskovec & Jegelka (ICLR 2019) and Morris et al. (AAAI 2019).

> **Message-passing GNNs are at most as expressive as the 1-WL test** at distinguishing non-isomorphic graphs. If 1-WL assigns two graphs the same colour histogram, no message-passing GNN, of any depth or width, can give them different outputs.

Read the conditions carefully, because they are what the proof uses. The network must be an ordinary message-passing one: each layer updates a node from (its own state, the multiset of its neighbours' states), with the *same* functions at every node, and no extra inputs — no node identifiers, no randomness, no global coordinates. Given that, a short induction shows that whenever two nodes have the same WL colour at round $l$ they have the same GNN state at layer $l$, so the GNN can never split what WL has merged.

And the bound is tight: with the right design, a GNN *matches* 1-WL. The condition is that each layer's aggregate-and-update must be **injective on multisets** — distinct neighbour multisets must give distinct outputs — and the matching direction also assumes the input features come from a **countable** set, which is what makes such an injection constructible.

That condition is exactly where **sum**, **mean** and **max** part company.
- $\{1,1,1\}$ and $\{1,1\}$: the **mean** is $1$ for both, the **max** is $1$ for both; the **sum** is $3$ versus $2$.
- $\{a,a,b\}$ and $\{a,b,b\}$: mean differs here, but max does not.

Mean sees only proportions; max sees only the set of distinct values. Sum keeps the full multiset, and it is the only one of the three that can.`,
    },
    {
      kind: 'mcq',
      prompt: 'What does the result "message passing is bounded by 1-WL" actually claim?',
      choices: [
        'If 1-WL cannot separate two graphs, no message-passing GNN can separate them either',
        'A GNN can distinguish any two graphs that are not isomorphic, given enough layers',
        'The WL test is a special case of a graph convolutional network with learned weights',
        'A GNN is strictly weaker than 1-WL, so some pairs 1-WL separates are beyond any GNN',
      ],
      answer: 0,
      why: String.raw`The theorem is an *upper* bound on what message passing can tell apart, and the bound is achieved: a GNN whose aggregation is injective on multisets is exactly as strong as 1-WL, neither strictly weaker nor stronger. Distinguishing all non-isomorphic graphs would solve graph isomorphism with a polynomial-time local algorithm, which nobody knows how to do. And the direction of the comparison matters: WL is the yardstick, not an instance of the architecture.`,
    },
    {
      kind: 'explain',
      title: 'GIN: hitting the bound',
      body: String.raw`The **Graph Isomorphism Network** is the minimal architecture that reaches 1-WL power:

$$\mathbf h_v^{(l+1)}=\mathrm{MLP}^{(l)}\Big((1+\epsilon^{(l)})\,\mathbf h_v^{(l)}+\sum_{u\in\mathcal N(v)}\mathbf h_u^{(l)}\Big).$$

Three deliberate choices.
- **Sum**, not mean or max, so the multiset survives aggregation.
- The scalar $\epsilon$ (fixed or learned) weights the node's own feature differently from the neighbour sum, so the two can be told apart: with a plain $\mathbf h_v+\sum\mathbf h_u$, a node with feature $a$ and neighbours $\{b\}$ would look identical to one with feature $b$ and neighbours $\{a\}$. The injectivity proof needs a generic $\epsilon$ (an irrational one); the popular GIN-0 variant fixes $\epsilon=0$ and works well in practice.
- An **MLP** rather than a single linear layer, because a universal approximator is needed to realize an injective function on multisets; a linear map could not.

For graph-level readout, GIN concatenates the pooled features from *every* layer, so information from shallow (local) and deep (global) rounds is all available — the same reason 1-WL compares histograms at each round rather than only at stability.`,
    },
    {
      kind: 'widget',
      title: 'Watch the aggregators lose information',
      body: String.raw`Set the aggregator to **mean** and press **hop ▶** (the widget runs up to 4 hops). Every node's value drifts towards the same number, $1/6$ on this ring. Four hops only get part of the way (the values still range from about $0.10$ to $0.24$), but each hop narrows the gap, and given enough hops the graph would be one flat colour with no node distinguishable from any other.

With **max** the values saturate at $1$ and stop carrying any magnitude at all. Only **sum** keeps growing in a way that still depends on how many neighbours contributed what — which is exactly the counting ability that the expressivity theorem turns on.

The flattening you see under *mean* also has a name of its own, and it is the subject of the next card.`,
      widget: { type: 'MlGraphMessagePassing', props: { graph: 'ring', agg: 'mean', steps: 0, source: 0, showReadout: true }, caption: 'Counting ability and numerical stability pull in opposite directions: sum keeps information but grows, mean is stable but forgets.' },
    },
    {
      kind: 'multi',
      prompt: 'Which of these can a standard message-passing GNN *not* do, however deep it is? (Select all that apply.)',
      choices: [
        'Distinguish two non-isomorphic regular graphs with the same number of nodes, the same degree and identical node features',
        'Count how many triangles a node belongs to',
        'Give two structurally symmetric nodes of the same graph different outputs',
        'Classify nodes using their own input features',
      ],
      answers: [0, 1, 2],
      why: String.raw`Regular graphs are the classic 1-WL failure: colour refinement never splits anything, so the two graphs stay identical. Triangle counting needs to know whether two of a node's neighbours are joined to *each other*, which no node ever learns from its own neighbourhood multiset. Symmetric nodes must receive equal outputs by equivariance. Using input features is of course fine — and distinct input features are precisely what rescues many real molecular graphs in practice.`,
    },
    {
      kind: 'explain',
      title: 'Buying more power',
      body: String.raw`Four families of fix, with different costs.

- **Higher-order WL.** $k$-WL colours $k$-tuples of nodes instead of single nodes, giving a strict hierarchy of increasing power (Cai, Fürer & Immerman, 1992). The matching networks (k-GNNs, PPGN) operate on $k$-tuples or $k$-sets of nodes, so the cost grows polynomially in $n$ with exponent $k$ (PPGN, with 3-WL power, needs $O(n^3)$ time), which is already painful for graphs of any size.
- **Unique or random node identifiers.** Give each node a random feature and the symmetry is broken, so the network can count — but it is no longer permutation-invariant unless you average over draws, trading exactness for variance.
- **Structural and positional encodings.** Append features that the network cannot compute itself: Laplacian eigenvectors, random-walk return probabilities, shortest-path distances, or counts of small subgraphs. Cheap, effective, and the most common fix in practice.
- **Subgraph GNNs.** Run the GNN on a *collection* of perturbed copies of the graph — one per deleted node, say — and pool the results. Strictly more powerful than 1-WL, at a cost of roughly $n$ forward passes.

A caution worth keeping: WL-expressivity measures the ability to distinguish *worst-case* graphs. On real molecular datasets a plain GNN with good atom features is often not limited by expressivity at all, but by data and by the two problems below.`,
    },
    {
      kind: 'match',
      prompt: 'Match each aggregator or design to what it can and cannot represent.',
      pairs: [
        ['Mean aggregation', 'Sees proportions only: $\\{1,1,1\\}$ and $\\{1,1\\}$ are identical to it'],
        ['Max aggregation', 'Sees the set of distinct values only, and ignores multiplicity entirely'],
        ['Sum aggregation with an MLP', 'Injective on multisets, so it reaches the 1-WL bound'],
        ['Laplacian eigenvector features', 'Supplies global position that no local aggregation could compute'],
      ],
      why: 'Expressivity is decided by what the aggregator throws away. Mean discards size, max discards multiplicity, sum keeps both — and the MLP afterwards is what turns "keeps the information" into "can use the information". Positional features add something orthogonal: knowledge of where a node sits in the whole graph.',
    },
    {
      kind: 'explain',
      title: 'Oversmoothing: too many layers',
      body: String.raw`Expressivity says *shallow* GNNs cannot see enough. You might hope to fix things by stacking layers. Two separate problems say otherwise.

**Oversmoothing** (Li, Han & Wu, 2018). A GCN layer is a normalized average over neighbours, which is a smoothing operator. Apply a smoothing operator many times and everything converges: as depth grows, node representations within a connected component converge to the same values (up to a degree-dependent scale factor for the symmetric normalization), and the discriminative information is lost. A useful way to measure it is the **Dirichlet energy** $\sum_{(u,v)\in E}\|\mathbf h_u-\mathbf h_v\|^2$, which decays geometrically with depth for a contracting layer.

This is why most GCNs and GATs in practice have **2 to 4 layers**, and why deeper ones need residual connections, initial-residual terms (APPNP, GCNII), normalization across nodes, or edge dropout to survive.`,
      widget: { type: 'SvgDiagram', props: { svg: OVER_SVG }, caption: 'Two failure modes of depth, pulling in opposite directions: too much mixing, and not enough capacity to carry what is mixed.' },
    },
    {
      kind: 'truefalse',
      prompt: 'Oversmoothing and oversquashing are two names for the same phenomenon.',
      answer: false,
      why: String.raw`They are different, and they conflict. **Oversmoothing** is too much mixing: after many layers neighbouring representations become identical. **Oversquashing** (Alon & Yahav, 2021) is too little capacity: to reach a node $k$ hops away, a message must pass through a neighbourhood whose size grows exponentially in $k$, all compressed into one fixed-width vector, so long-range signal is crushed at bottleneck edges. Adding layers makes oversmoothing worse, and it does not cure oversquashing, because the extra reach just funnels even more nodes through the same fixed-width vectors — which is why the usual fixes are structural (rewiring, adding a virtual node, graph transformers) rather than simply deeper.`,
    },
    {
      kind: 'fill',
      prompt: String.raw`Message passing is at most as powerful as the ___ test at telling graphs apart, and a GIN reaches that bound by using ___ aggregation followed by an MLP. Mean aggregation loses the ___ of the neighbour multiset. Stacking too many layers causes ___, where node features converge to one vector, while long-range information is crushed at bottlenecks — a separate problem called ___.`,
      bank: ['1-WL', 'sum', 'mean', 'size', 'oversmoothing', 'oversquashing', 'dropout'],
      answer: ['1-WL', 'sum', 'size', 'oversmoothing', 'oversquashing'],
      why: String.raw`A learned layer cannot beat the perfect hash that 1-WL uses, and sum plus an MLP is injective on multisets, so it matches it. Mean divides out the neighbour count, so $\{1,1,1\}$ and $\{1,1\}$ collapse together. The two depth pathologies are distinct: one is too much mixing, the other too little capacity.`,
    },
    {
      kind: 'explain',
      title: 'Key takeaways',
      body: String.raw`- A message-passing layer *is* one round of **1-WL colour refinement**, with a learned function in place of a perfect hash.
- **Theorem** (Xu et al.; Morris et al., 2019): message-passing GNNs are at most as expressive as 1-WL, and injective aggregation attains that bound.
- **Sum** aggregation is injective on multisets; **mean** forgets size, **max** forgets multiplicity. **GIN** = sum $+\,(1+\epsilon)$ self-term $+$ MLP.
- Known blind spots: regular graphs, triangle and cycle counting, telling symmetric nodes apart.
- More power costs more: $k$-WL (cost growing as $n^k$), subgraph GNNs ($\approx n$ passes), or cheap **positional/structural features** — usually the best value.
- Depth brings **oversmoothing** (features converge; keep GCNs shallow or add residual terms) and **oversquashing** (exponential neighbourhoods squeezed through bottleneck edges; fix by rewiring or global attention).
- Worst-case expressivity is not the same as practical accuracy: on real molecules, features and data often bind first.`,
    },
  ],
  references: [
    { authors: 'K. Xu, W. Hu, J. Leskovec & S. Jegelka', title: 'How Powerful are Graph Neural Networks?', year: 2019, venue: 'ICLR', url: 'https://arxiv.org/abs/1810.00826' },
    { authors: 'C. Morris, M. Ritzert, M. Fey, W. L. Hamilton, J. E. Lenssen, G. Rattan & M. Grohe', title: 'Weisfeiler and Leman Go Neural: Higher-order Graph Neural Networks', year: 2019, venue: 'AAAI', url: 'https://arxiv.org/abs/1810.02244' },
    { authors: 'Q. Li, Z. Han & X.-M. Wu', title: 'Deeper Insights into Graph Convolutional Networks for Semi-Supervised Learning', year: 2018, venue: 'AAAI', url: 'https://arxiv.org/abs/1801.07606' },
    { authors: 'U. Alon & E. Yahav', title: 'On the Bottleneck of Graph Neural Networks and its Practical Implications', year: 2021, venue: 'ICLR', url: 'https://arxiv.org/abs/2006.05205' },
    { authors: 'J.-Y. Cai, M. Fürer & N. Immerman', title: 'An optimal lower bound on the number of variables for graph identification', year: 1992, venue: 'Combinatorica 12(4), 389–410' },
  ],
} satisfies LessonContent;
