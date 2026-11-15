import type { LessonContent } from '../../types';

// One graph, two labellings, two different adjacency matrices.
const PERM_SVG = (() => {
  const A1 = [[0, 1, 1, 0], [1, 0, 1, 0], [1, 1, 0, 1], [0, 0, 1, 0]];
  const A2 = [[0, 1, 1, 1], [1, 0, 1, 0], [1, 1, 0, 0], [1, 0, 0, 0]];
  const mat = (A: number[][], x0: number, y0: number, col: string, title: string) =>
    `<text x="${x0 + 26}" y="${y0 - 6}" font-size="9" text-anchor="middle" fill="${col}">${title}</text>` +
    A.map((r, i) => r.map((v, j) =>
      `<rect x="${x0 + j * 13}" y="${y0 + i * 13}" width="12" height="12" fill="${v ? col : 'var(--surface)'}" fill-opacity="${v ? 0.75 : 1}" stroke="var(--grid)" stroke-width="0.4"/>` +
      `<text x="${x0 + j * 13 + 6}" y="${y0 + i * 13 + 9}" font-size="8" text-anchor="middle" fill="var(--fg)">${v}</text>`).join('')).join('');
  const nodes: [number, number, string, string][] = [[30, 40, '1', '2'], [30, 100, '2', '3'], [85, 70, '3', '1'], [135, 112, '4', '4']];
  const edges = [[0, 1], [1, 2], [2, 0], [2, 3]];
  return `<svg viewBox="0 0 320 160" xmlns="http://www.w3.org/2000/svg">
<text x="80" y="14" font-size="9" text-anchor="middle" fill="var(--fg)">one graph, two labellings</text>
${edges.map(([u, v]) => `<line x1="${nodes[u][0]}" y1="${nodes[u][1]}" x2="${nodes[v][0]}" y2="${nodes[v][1]}" stroke="var(--muted)" stroke-width="1.2"/>`).join('')}
${nodes.map(([x, y, a, b]) => `<circle cx="${x}" cy="${y}" r="11" fill="var(--surface)" stroke="var(--fg)" stroke-width="1"/><text x="${x}" y="${y + 3.5}" font-size="9" text-anchor="middle" fill="var(--c2)">${a}</text><text x="${x + 14}" y="${y - 9}" font-size="9" fill="var(--c3)">${b}</text>`).join('')}
${mat(A1, 170, 28, 'var(--c2)', 'A (blue labels)')}
${mat(A2, 248, 28, 'var(--c3)', 'A′ (orange)')}
<text x="160" y="150" font-size="8" text-anchor="middle" fill="var(--muted)">A′ = P A Pᵀ — different numbers, identical graph. A model must not care which one it gets.</text>
</svg>`;
})();

// Aggregate → update → readout, with the symmetry of each stage marked.
const MPNN_SVG = `<svg viewBox="0 0 320 170" xmlns="http://www.w3.org/2000/svg">
<defs><marker id="mp" viewBox="0 0 6 6" refX="5" refY="3" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="var(--fg)"/></marker></defs>
<circle cx="52" cy="78" r="15" fill="var(--c2)" fill-opacity="0.3" stroke="var(--fg)"/><text x="52" y="82" font-size="10" text-anchor="middle" fill="var(--fg)">hᵥ</text>
<circle cx="18" cy="30" r="10" fill="var(--c3)" fill-opacity="0.3" stroke="var(--muted)"/><text x="18" y="34" font-size="8" text-anchor="middle" fill="var(--fg)">h₁</text>
<circle cx="92" cy="26" r="10" fill="var(--c3)" fill-opacity="0.3" stroke="var(--muted)"/><text x="92" y="30" font-size="8" text-anchor="middle" fill="var(--fg)">h₂</text>
<circle cx="20" cy="132" r="10" fill="var(--c3)" fill-opacity="0.3" stroke="var(--muted)"/><text x="20" y="136" font-size="8" text-anchor="middle" fill="var(--fg)">h₃</text>
<line x1="18" y1="30" x2="52" y2="78" stroke="var(--muted)" stroke-width="1"/><line x1="92" y1="26" x2="52" y2="78" stroke="var(--muted)" stroke-width="1"/><line x1="20" y1="132" x2="52" y2="78" stroke="var(--muted)" stroke-width="1"/>
<circle r="3" fill="var(--c3)"><animateMotion path="M18,30 L52,78" dur="2.4s" repeatCount="indefinite"/></circle>
<circle r="3" fill="var(--c3)"><animateMotion path="M92,26 L52,78" dur="2.4s" begin="0.3s" repeatCount="indefinite"/></circle>
<circle r="3" fill="var(--c3)"><animateMotion path="M20,132 L52,78" dur="2.4s" begin="0.6s" repeatCount="indefinite"/></circle>
<line x1="72" y1="78" x2="112" y2="78" stroke="var(--fg)" stroke-width="0.8" marker-end="url(#mp)"/>
<text x="120" y="60" font-size="9" fill="var(--fg)">1. message ψ(hᵥ,hᵤ,eᵥᵤ)</text>
<text x="120" y="74" font-size="9" fill="var(--fg)">2. aggregate ⊕ (a sum, mean</text>
<text x="132" y="86" font-size="9" fill="var(--fg)">or max: order-blind)</text>
<text x="120" y="100" font-size="9" fill="var(--fg)">3. update hᵥ′ = φ(hᵥ, mᵥ)</text>
<text x="120" y="118" font-size="9" fill="var(--c2)">node features: EQUIVARIANT</text>
<text x="120" y="132" font-size="9" fill="var(--fg)">4. readout ⊕ over all nodes</text>
<text x="120" y="146" font-size="9" fill="var(--c1)">graph vector: INVARIANT</text>
<text x="160" y="164" font-size="8" text-anchor="middle" fill="var(--muted)">Every node runs steps 1–3 in parallel, with the same ψ and φ.</text>
</svg>`;

export default {
  cards: [
    {
      kind: 'explain',
      title: 'Data with no natural order',
      body: String.raw`A photo is a grid, a sentence is a sequence — both come with coordinates, which is exactly what [CNNs](@ml/cnns) and [transformers](@ml/attention-transformers) exploit. A **graph** has no such coordinates. A caffeine molecule, a social network, a road map, a protein contact map: they are a set of **nodes** joined by **edges**, and nothing says which node is "first".

Yet we want to predict things about them — a molecule's solubility, whether two people will become friends, the stress in a finite-element mesh.

A **graph neural network (GNN)** is a network whose answer does not depend on the arbitrary order in which we happened to write the nodes down.`,
    },
    {
      kind: 'recall',
      title: 'Graphs, in one card',
      points: [
        'A graph $G=(V,E)$ is a set of **nodes** $V$ (say $n$ of them) and **edges** $E\\subseteq V\\times V$ joining pairs.',
        'The **neighbourhood** $\\mathcal N(v)$ is the set of nodes joined to $v$; its size is the **degree** $d_v$.',
        'The **adjacency matrix** $A$ is $n\\times n$ with $A_{ij}=1$ when $i$ and $j$ are joined, else $0$. For an undirected graph $A=A^\\top$.',
        'Graphs can be weighted, directed, or carry labels on nodes and edges (atom type, bond order).',
      ],
      link: 'cs/graphs-intro',
    },
    {
      kind: 'explain',
      title: 'The relabelling problem',
      body: String.raw`Store a graph on a computer and you must pick an order for the nodes: node 1, node 2, … That choice is arbitrary, and there are $n!$ of them. For a 20-atom molecule that is about $2.4\times10^{18}$.

Writing $X\in\mathbb R^{n\times d}$ for the matrix of node features (row $v$ = the feature vector $\mathbf h_v$) and $P$ for a **permutation matrix** (one $1$ per row and column), relabelling sends

$$X\mapsto PX,\qquad A\mapsto PAP^\top.$$

Feeding $A$ to a plain [MLP](@ml/neural-networks-intro) would make the prediction depend on the labelling. Data augmentation over $n!$ orderings is hopeless. We build the symmetry in instead.`,
      widget: { type: 'SvgDiagram', props: { svg: PERM_SVG }, caption: 'The blue and orange adjacency matrices describe the *same* graph.' },
    },
    {
      kind: 'explain',
      title: 'Two targets: invariant and equivariant',
      body: String.raw`There are two things we might want, and the difference matters.

- A **graph-level** prediction (is this molecule toxic?) must be **permutation-invariant**: $f(PX,PAP^\top)=f(X,A)$. Relabel the nodes, get the identical answer.
- **Node-level** outputs (which atoms are in the binding pocket?) must be **permutation-equivariant**: $F(PX,PAP^\top)=P\,F(X,A)$. Relabel the nodes and the rows of the answer are relabelled the same way.

This is the same pair of ideas as translation equivariance and invariance in a [CNN](@ml/cnns) — only the group has changed from shifts to the symmetric group $S_n$.`,
    },
    {
      kind: 'mcq',
      prompt: 'A GNN outputs one vector per atom, and those vectors are fed to a sum over atoms to predict a molecular energy. Which description is right?',
      choices: [
        'The per-atom stage is permutation-equivariant and the summed energy is permutation-invariant.',
        'Both stages are permutation-invariant.',
        'The per-atom stage is invariant and the sum makes it equivariant.',
        'Neither stage has any symmetry unless the atoms are sorted by element first.',
      ],
      answer: 0,
      why: String.raw`Relabelling the atoms reorders the per-atom vectors in the same way — that is equivariance, not invariance (an invariant per-atom stage would give every atom the same vector). Summing a reordered list gives the same total, so the energy is invariant. Sorting is not needed and would not be differentiable or well defined for ties.`,
    },
    {
      kind: 'explain',
      title: 'Message passing',
      body: String.raw`Almost every GNN is an instance of one recipe, named **message passing** by Gilmer et al. (2017). One layer, run for every node $v$ at once:

$$\mathbf m_v=\bigoplus_{u\in\mathcal N(v)}\psi(\mathbf h_v,\mathbf h_u,\mathbf e_{vu}),\qquad \mathbf h_v'=\varphi(\mathbf h_v,\mathbf m_v).$$

- $\psi$ is a small learned network building a **message** from the pair (and the edge feature $\mathbf e_{vu}$, e.g. bond type).
- $\bigoplus$ is a **permutation-invariant aggregator** over the neighbours — a sum, mean or max. This is where the symmetry enters: a set has no order, so the aggregator must ignore it.
- $\varphi$ is a learned **update**, often $\mathrm{ReLU}(W_1\mathbf h_v+W_2\mathbf m_v)$.

The same $\psi,\varphi$ are used at every node — weight sharing, exactly as a CNN reuses one kernel at every pixel.`,
      widget: { type: 'SvgDiagram', props: { svg: MPNN_SVG }, caption: 'Because $\\bigoplus$ is order-blind, the whole layer is permutation-equivariant.' },
    },
    {
      kind: 'widget',
      title: 'Watch a feature spread',
      body: String.raw`Node $a$ starts at $1$ and every other node at $0$. Press **hop ▶** and the value flows along edges. After $t$ hops the non-zero nodes are exactly the ones within $t$ edges of $a$ — so a $t$-layer GNN gives each node a **receptive field** of its $t$-hop neighbourhood, the graph analogue of a CNN's receptive field.

Tap a different node to move the impulse. Switch the aggregator between **sum**, **mean** and **max** and watch how differently the numbers behave.`,
      widget: { type: 'MlGraphMessagePassing', props: { graph: 'house', agg: 'sum', steps: 0, source: 0 }, caption: 'The readout line at the bottom is a graph-level summary; relabelling the nodes cannot change it.' },
    },
    {
      kind: 'numeric',
      prompt: 'A GNN has 4 message-passing layers. Two atoms in a molecule are 5 bonds apart along the shortest path. How many layers would the network need, at minimum, for the first atom\'s representation to be influenced by the second?',
      answer: 5,
      why: 'Information travels exactly one edge per layer, so a node sees its $t$-hop neighbourhood after $t$ layers. With 4 layers an atom 5 bonds away is invisible. Stacking more layers fixes the reach but brings oversmoothing and oversquashing, which the expressivity lesson takes up.',
    },
    {
      kind: 'explain',
      title: 'GCN: the simplest useful layer',
      body: String.raw`Kipf & Welling (2017) stripped message passing down to a normalized average. Add self-loops, $\tilde A=A+I$, let $\tilde D$ be the diagonal matrix of row sums $\tilde d_i$, and set

$$H^{(l+1)}=\sigma\!\big(\tilde D^{-1/2}\tilde A\,\tilde D^{-1/2}H^{(l)}W^{(l)}\big).$$

Per node that reads $\mathbf h_v'=\sigma\big(W^\top\!\sum_{u\in\mathcal N(v)\cup\{v\}}\tfrac{1}{\sqrt{\tilde d_v\tilde d_u}}\mathbf h_u\big)$: a weighted average of the neighbours and the node itself, then one linear map and a nonlinearity.

The symmetric normalization $1/\sqrt{\tilde d_v\tilde d_u}$ keeps feature magnitudes stable — without it, hub nodes with hundreds of neighbours would blow up. Two such layers were enough to beat the then state of the art on citation-network node classification.`,
    },
    {
      kind: 'numeric',
      prompt: String.raw`In a GCN layer, node $v$ has 2 neighbours and node $u$ (one of them) has 3 neighbours. Self-loops are added, so $\tilde d_v=3$ and $\tilde d_u=4$. What coefficient $1/\sqrt{\tilde d_v\tilde d_u}$ multiplies $\mathbf h_u$ in the update of $v$? Give 4 decimal places.`,
      answer: 0.2887,
      tolerance: 0.0005,
      why: String.raw`$1/\sqrt{3\cdot4}=1/\sqrt{12}=0.2887$. Forgetting the self-loop gives $1/\sqrt{2\cdot3}=0.4082$ — the self-loop is what lets a node keep its own information, so it changes every coefficient.`,
    },
    {
      kind: 'explain',
      title: 'GAT: learn the weights',
      body: String.raw`A GCN's coefficients are fixed by the degrees. Veličković et al. (2018) let the network *learn* how much each neighbour matters, using [attention](@ml/attention-transformers):

$$e_{vu}=\mathrm{LeakyReLU}\big(\mathbf a^\top[\,W\mathbf h_v\,\|\,W\mathbf h_u\,]\big),\qquad \alpha_{vu}=\frac{\exp e_{vu}}{\sum_{w\in\mathcal N(v)}\exp e_{vw}},$$

then $\mathbf h_v'=\sigma\big(\sum_{u\in\mathcal N(v)}\alpha_{vu}W\mathbf h_u\big)$. The softmax runs over the neighbourhood only (the paper includes $v$ itself in $\mathcal N(v)$), so the layer is still permutation-equivariant and still costs $O(|E|)$.

As in a transformer, several **heads** are run in parallel (the paper uses 8) and concatenated, averaging instead of concatenating at the final layer. A GAT is essentially self-attention restricted to the edges of the graph.`,
    },
    {
      kind: 'match',
      prompt: 'Match each design choice to what it does.',
      pairs: [
        ['Sum aggregation over neighbours', 'Keeps how many neighbours there are, and lets sizes grow with degree'],
        ['Mean aggregation over neighbours', 'Records the neighbourhood’s average feature and ignores its size'],
        ['Attention coefficients $\\alpha_{vu}$', 'Lets the network weight neighbours unequally, learned from features'],
        ['Global sum/mean over all nodes', 'Turns an equivariant node field into one invariant graph vector'],
      ],
      why: 'Sum keeps multiplicity (how many neighbours, and how many of each kind); mean normalizes it away, which helps when degrees vary wildly but loses counting ability; attention makes the weights data-dependent; a global pool is the readout that converts equivariance into invariance.',
    },
    {
      kind: 'explain',
      title: 'Three levels of prediction',
      body: String.raw`After $T$ layers you have one vector $\mathbf h_v^{(T)}$ per node, and you read off whatever you need.

- **Node level** — classify each node (which protein residue binds?). Use $\mathbf h_v^{(T)}$ directly. Equivariant.
- **Edge level** — score each pair (will this link appear? is this a bond?). Use a function of $(\mathbf h_u^{(T)},\mathbf h_v^{(T)})$, symmetrized if the edge is undirected.
- **Graph level** — one answer per graph. **Readout**: $\mathbf h_G=\bigoplus_{v\in V}\mathbf h_v^{(T)}$ with sum, mean or max, then an MLP. Invariant.

For molecules, sum readout matches extensive quantities like energy (two copies of a molecule have twice the energy); mean suits intensive ones.`,
    },
    {
      kind: 'widget',
      title: 'Sum, mean and max behave differently',
      body: String.raw`Switch the aggregator on a 6-cycle. With **sum**, values roughly triple each hop (a node absorbs itself plus two neighbours). With **mean** everything drifts towards one shared value — after enough hops, every node looks the same, which is the **oversmoothing** problem of deep GCNs. With **max**, the impulse simply spreads as a plateau of $1$s and no magnitude information survives at all.`,
      widget: { type: 'MlGraphMessagePassing', props: { graph: 'ring', agg: 'mean', steps: 3, source: 0 }, caption: 'The next lesson shows that this choice also decides what the network can and cannot *tell apart*.' },
    },
    {
      kind: 'order',
      prompt: 'Put one message-passing layer, followed by a graph-level prediction, in order.',
      steps: [
        'For every ordered pair of joined nodes (v, u), compute a message ψ(hᵥ, hᵤ, eᵥᵤ)',
        'At each node, aggregate the incoming messages with an order-blind operator (sum, mean or max)',
        'Update each node: hᵥ′ = φ(hᵥ, mᵥ)',
        'Repeat for the remaining layers, so each node sees a wider neighbourhood',
        'Pool the final node vectors over all nodes into one graph vector',
        'Pass the graph vector through an MLP to get the prediction',
      ],
      why: 'Messages must exist before they can be aggregated, and aggregation before the update. Pooling happens once, after the last layer: pooling earlier would throw away the node identities the later layers need.',
    },
    {
      kind: 'truefalse',
      prompt: 'If two nodes of a graph have identical features and identical neighbourhoods (they are symmetric to one another), a message-passing GNN must give them identical outputs.',
      answer: true,
      why: 'Equivariance forces it. A relabelling that swaps two such nodes leaves the graph and features unchanged, so the output must also be unchanged — and equivariance says the two outputs swap. Both conditions hold only if the outputs are equal. This is a real limitation: a plain GNN cannot break ties between symmetric nodes, which is why positional or random node features are sometimes added.',
    },
    {
      kind: 'fill',
      prompt: 'A message-passing layer is permutation ___ because the neighbour aggregator ignores order; a global readout over all nodes is permutation ___. A GCN averages neighbours with fixed coefficients set by the ___, while a GAT learns them with ___.',
      bank: ['equivariant', 'invariant', 'degrees', 'attention', 'convolution', 'dropout'],
      answer: ['equivariant', 'invariant', 'degrees', 'attention'],
      why: 'Order-blind aggregation makes a layer commute with relabelling (equivariance); pooling over all nodes discards node identity entirely (invariance). GCN coefficients are $1/\\sqrt{\\tilde d_v\\tilde d_u}$, pure graph structure; GAT replaces them with learned softmax attention over each neighbourhood.',
    },
    {
      kind: 'explain',
      title: 'How it runs in practice',
      body: String.raw`- **Sparsity.** Messages are computed per edge, so one layer costs $O(|E|\,d^2)$, not $O(n^2)$. Real graphs have $|E|\ll n^2$.
- **Batching.** Several graphs are stacked into one big block-diagonal graph with no edges between them; a node-to-graph index vector tells the readout which nodes to pool together.
- **Edge and global features.** Gilmer et al.'s MPNN carries both, plus a "virtual node" joined to everything, giving long-range shortcuts.
- **Where you meet them.** Property prediction from molecular graphs is in [molecular property prediction](@drug/molecular-property-prediction); AlphaFold's Evoformer and structure module use graph-style attention over residue pairs ([AlphaFold](@drug/alphafold)).`,
    },
    {
      kind: 'explain',
      title: 'Key takeaways',
      body: String.raw`- Graphs have no canonical node order; the relevant symmetry group is $S_n$, acting by $X\mapsto PX$, $A\mapsto PAP^\top$.
- Node-level outputs should be **equivariant**, graph-level outputs **invariant**.
- **Message passing**: $\mathbf m_v=\bigoplus_{u\in\mathcal N(v)}\psi(\mathbf h_v,\mathbf h_u,\mathbf e_{vu})$, $\mathbf h_v'=\varphi(\mathbf h_v,\mathbf m_v)$. The order-blind $\bigoplus$ is what buys the symmetry; shared $\psi,\varphi$ are the weight sharing.
- **GCN** $=\sigma(\tilde D^{-1/2}\tilde A\tilde D^{-1/2}HW)$ — fixed degree-based weights. **GAT** replaces them with learned attention over each neighbourhood.
- $T$ layers give each node a $T$-hop receptive field; a global pool at the end gives the invariant graph vector.
- Cost is $O(|E|)$ per layer, and batches are block-diagonal graphs.`,
    },
  ],
  references: [
    { authors: 'J. Gilmer, S. S. Schoenholz, P. F. Riley, O. Vinyals & G. E. Dahl', title: 'Neural Message Passing for Quantum Chemistry', year: 2017, venue: 'ICML', url: 'https://arxiv.org/abs/1704.01212' },
    { authors: 'T. N. Kipf & M. Welling', title: 'Semi-Supervised Classification with Graph Convolutional Networks', year: 2017, venue: 'ICLR', url: 'https://arxiv.org/abs/1609.02907' },
    { authors: 'P. Veličković, G. Cucurull, A. Casanova, A. Romero, P. Liò & Y. Bengio', title: 'Graph Attention Networks', year: 2018, venue: 'ICLR', url: 'https://arxiv.org/abs/1710.10903' },
    { authors: 'M. M. Bronstein, J. Bruna, T. Cohen & P. Veličković', title: 'Geometric Deep Learning: Grids, Groups, Graphs, Geodesics, and Gauges', year: 2021, venue: 'arXiv:2104.13478', detail: 'Ch. 5.3 (graphs and sets)', url: 'https://arxiv.org/abs/2104.13478' },
    { authors: 'W. L. Hamilton', title: 'Graph Representation Learning', year: 2020, venue: 'Morgan & Claypool', detail: 'Ch. 5–6', url: 'https://www.cs.mcgill.ca/~wlh/grl_book/' },
  ],
} satisfies LessonContent;
