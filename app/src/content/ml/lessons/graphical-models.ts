import type { LessonContent } from '../../types';

const MOTIFS = String.raw`<svg viewBox="0 0 320 196" xmlns="http://www.w3.org/2000/svg" font-family="inherit">
  <defs>
    <marker id="gmA" viewBox="0 0 8 8" refX="7.4" refY="4" markerWidth="5" markerHeight="5" orient="auto">
      <path d="M0,0 L8,4 L0,8 z" fill="var(--muted)"/>
    </marker>
    <style>
      .n { fill: var(--surface); stroke: var(--fg); stroke-width: 1; }
      .obs { fill: var(--c3); stroke: var(--fg); stroke-width: 1; opacity: 0.55; }
      .e { stroke: var(--muted); stroke-width: 1.1; fill: none; marker-end: url(#gmA); }
      text { font-size: 9px; fill: var(--fg); text-anchor: middle; }
      .t { font-size: 8px; fill: var(--muted); }
      .k { font-size: 8.5px; fill: var(--c2); }
      .r { font-size: 8.5px; fill: var(--c5); }
    </style>
  </defs>

  <text class="t" x="53" y="12">chain  a → b → c</text>
  <circle class="n" cx="16" cy="34" r="8.5"/><text x="16" y="37">a</text>
  <path class="e" d="M25,34 L44,34"/>
  <circle class="obs" cx="53" cy="34" r="8.5"/><text x="53" y="37">b</text>
  <path class="e" d="M62,34 L81,34"/>
  <circle class="n" cx="90" cy="34" r="8.5"/><text x="90" y="37">c</text>
  <text class="k" x="53" y="56">blocked when b is observed</text>

  <text class="t" x="160" y="12">fork  a ← b → c</text>
  <circle class="obs" cx="160" cy="22" r="8.5"/><text x="160" y="25">b</text>
  <path class="e" d="M153,30 L131,44"/>
  <path class="e" d="M167,30 L189,44"/>
  <circle class="n" cx="125" cy="48" r="8.5"/><text x="125" y="51">a</text>
  <circle class="n" cx="195" cy="48" r="8.5"/><text x="195" y="51">c</text>
  <text class="k" x="160" y="68">blocked when b is observed</text>

  <text class="t" x="268" y="12">collider  a → b ← c</text>
  <circle class="n" cx="236" cy="22" r="8.5"/><text x="236" y="25">a</text>
  <circle class="n" cx="300" cy="22" r="8.5"/><text x="300" y="25">c</text>
  <path class="e" d="M242,30 L261,44"/>
  <path class="e" d="M294,30 L275,44"/>
  <circle class="n" cx="268" cy="48" r="8.5"/><text x="268" y="51">b</text>
  <text class="r" x="268" y="68">OPENED when b is observed</text>

  <line x1="8" y1="80" x2="312" y2="80" stroke="var(--grid)" stroke-width="0.8"/>

  <text class="t" x="160" y="96">the collider, concretely: two independent causes of one alarm</text>
  <circle class="n" cx="80" cy="118" r="20"/><text x="80" y="115">burglar</text><text x="80" y="126" class="t">P = 0.01</text>
  <circle class="n" cx="240" cy="118" r="20"/><text x="240" y="115">quake</text><text x="240" y="126" class="t">P = 0.01</text>
  <path class="e" d="M97,129 L140,150"/>
  <path class="e" d="M223,129 L180,150"/>
  <rect class="obs" x="135" y="152" width="50" height="20" rx="4"/>
  <text x="160" y="166">alarm = on</text>
  <text class="k" x="160" y="188">knowing it was a quake pushes P(burglar | alarm) back down: they compete</text>
  <path d="M100,112 L220,112" stroke="var(--c5)" stroke-width="1" stroke-dasharray="4 3" fill="none">
    <animate attributeName="stroke-dashoffset" values="14;0" dur="1.4s" repeatCount="indefinite"/>
  </path>
  <text class="r" x="160" y="107">induced dependence</text>
</svg>`;

export default {
  cards: [
    {
      kind: 'explain',
      title: 'The table nobody can write down',
      body: String.raw`Suppose you want a model of 30 yes/no medical symptoms and findings. The joint distribution $p(x_1,\dots,x_{30})$ is a table with $2^{30}\approx 10^9$ entries, and because they must sum to 1 you need $2^{30}-1$ free numbers. You cannot store it, you cannot estimate it, and you certainly cannot explain it.

Yet real variables are not all tangled with each other. Whether it rained last night tells you a lot about whether the grass is wet, and almost nothing extra once you already know the grass is wet.

A **probabilistic graphical model** turns that intuition into mathematics. Draw a graph whose nodes are the variables; the *missing edges* encode conditional independencies; and those independencies let the enormous joint be written as a product of small local pieces. Compact storage, learnable parameters, and a picture you can argue about — all from the same object.`,
    },
    {
      kind: 'explain',
      title: 'Bayes nets: a product of local conditionals',
      body: String.raw`A **directed graphical model** (Bayes net) is a directed *acyclic* graph on $x_1,\dots,x_n$ together with one conditional distribution per node, given its parents $\mathrm{pa}(i)$:
$$p(x_1,\dots,x_n)=\prod_{i=1}^{n}p\big(x_i\mid x_{\mathrm{pa}(i)}\big).$$
Acyclicity is what makes this a valid distribution: order the nodes so parents come first, and the product is just the chain rule with most of the conditioning dropped.

The classic toy net: $\text{Season}\to\text{Rain}$, $\text{Season}\to\text{Sprinkler}$, $\text{Rain}\to\text{Wet grass}\leftarrow\text{Sprinkler}$, and $\text{Wet grass}\to\text{Slippery}$. With all five variables binary the factorization needs
$$1+2+2+4+2=11$$
free numbers, against $2^5-1=31$ for the raw table. On 30 variables with at most 3 parents each the saving is from $10^9$ to a few hundred.

Arrows are not automatically causal. They are a *factorization order*; a graph is causal only when you additionally claim that intervening on a parent changes the child — the subject of [causal DAGs](@stats/causal-graphs-dags).`,
    },
    {
      kind: 'numeric',
      prompt: String.raw`A Bayes net has eight binary variables in a single chain, $x_1\to x_2\to\cdots\to x_8$. How many free parameters does it need?`,
      answer: 15,
      why: String.raw`$x_1$ needs 1 number; each of the other seven needs 2 (one per value of its single parent): $1+7\times 2=15$. The unrestricted joint over eight binary variables would need $2^8-1=255$. A chain is as cheap as any connected tree over binary variables; cost grows as $2^{|\mathrm{pa}(i)|}$ per node, so it is the number of *parents*, not the number of variables, that hurts.`,
    },
    {
      kind: 'widget',
      title: 'Three motifs, and the one that behaves backwards',
      body: String.raw`Every path through a graph is built from three local patterns. Shaded means *observed*.

For a chain and a fork, observing the middle node **blocks** the path: $a$ and $c$ become independent given $b$. Both are the familiar "common cause / common mediator" stories.

The **collider** $a\to b\leftarrow c$ does the opposite. $a$ and $c$ start out independent; observing their shared effect $b$ makes them **dependent**. This is *explaining away*, and it is the single most counter-intuitive fact about graphical models.`,
      widget: { type: 'SvgDiagram', props: { svg: MOTIFS }, caption: 'A burglar and an earthquake are independent — until the alarm goes off, after which each one argues against the other.' },
    },
    {
      kind: 'mcq',
      prompt: String.raw`Burglary and Earthquake are marginally independent causes of Alarm. You hear the alarm, then learn from the radio that there was an earthquake. What happens to $P(\text{Burglary})$?`,
      choices: [
        'It goes up, because an earthquake and a burglary are both bad-night events',
        'It goes down, because the earthquake already explains the alarm',
        'It is unchanged, because burglary and earthquake are independent',
        'It is unchanged, because the alarm is already observed',
      ],
      answer: 1,
      why: String.raw`Conditioning on the collider Alarm opens a path between its two parents, so they stop being independent: $P(B\mid A,E)<P(B\mid A)$. This is *explaining away*. Marginal independence of $B$ and $E$ is real, but it is exactly the thing that conditioning on the shared effect destroys — the hallmark of a collider.`,
    },
    {
      kind: 'widget',
      title: 'Read independencies off the graph',
      body: String.raw`Pick a pair $X,Y$ with the buttons, then **tap** any other node to put it in the conditioning set $Z$. The widget hunts for an **active trail** from $X$ to $Y$: an undirected path on which every chain and fork node is *outside* $Z$ and every collider is *inside* $Z$ (or has a descendant inside $Z$).

If an active trail exists the pair is **d-connected** and the trail is highlighted. If every trail is blocked they are **d-separated**, and then $X\perp Y\mid Z$ in *every* distribution that factorizes over this graph.

Try Rain vs Sprinkler three times: with nothing observed (the fork through Season is open, so they are d-connected), then with Season observed (blocked), then with Season **and** Wet grass observed (the collider reopens them).`,
      widget: { type: 'MlDSeparation', props: { query: 0 } },
    },
    {
      kind: 'explain',
      title: 'd-separation, stated once',
      body: String.raw`Let $X,Y,Z$ be disjoint sets of nodes. A trail between a node of $X$ and a node of $Y$ is **active given $Z$** if at every intermediate node $b$:
- $b$ is a chain or fork node and $b\notin Z$; or
- $b$ is a **collider** and $b\in Z$, or some descendant of $b$ is in $Z$.

$X$ and $Y$ are **d-separated by $Z$** if no active trail exists. The two directions matter and are not symmetric in strength:
- **Soundness.** d-separation $\Rightarrow$ $X\perp Y\mid Z$ in every distribution factorizing over the graph.
- **The converse fails.** A particular distribution may have *extra* independencies that the graph does not show (a parameter can be set so that an arrow does nothing). So d-connection means "the graph *permits* dependence", not "they are dependent".

A useful special case: the **Markov blanket** of a node — its parents, its children, and its children's other parents. Conditioning on the blanket d-separates the node from everything else in the graph. That is exactly the set a Gibbs sampler needs to resample one variable, and it is why Gibbs updates stay local.`,
    },
    {
      kind: 'multi',
      prompt: String.raw`In the net $\text{Season}\to\text{Rain}$, $\text{Season}\to\text{Sprinkler}$, $\text{Rain}\to\text{Wet}$, $\text{Sprinkler}\to\text{Wet}$, $\text{Wet}\to\text{Slippery}$, which statements are true?`,
      choices: [
        'Rain and Sprinkler are dependent when nothing is observed',
        'Rain and Sprinkler are independent given Season',
        'Rain and Sprinkler are independent given Season and Wet grass',
        'Slippery is independent of Rain given Wet grass',
        'The Markov blanket of Rain is {Season, Wet grass, Sprinkler}',
      ],
      answers: [0, 1, 3, 4],
      why: String.raw`The fork through Season is open until Season is observed, so Rain and Sprinkler start dependent and become independent given Season. Adding Wet grass — their common child, a collider — reopens the path and makes them dependent again (if the grass is wet and it did not rain, the sprinkler was probably on). Wet grass is a chain node between Rain and Slippery, so observing it blocks that route. Rain's blanket is its parent Season, its child Wet grass, and Wet grass's other parent Sprinkler.`,
    },
    {
      kind: 'recall',
      title: 'Bayes’ rule, the engine underneath',
      points: [
        String.raw`$p(z\mid x)=\dfrac{p(x\mid z)\,p(z)}{p(x)}$, with $p(x)=\sum_z p(x\mid z)p(z)$ the normalizing evidence.`,
        String.raw`Posterior $\propto$ likelihood $\times$ prior; the denominator is the expensive part.`,
        String.raw`Independence: $p(a,b)=p(a)p(b)$. Conditional independence: $p(a,b\mid c)=p(a\mid c)p(b\mid c)$.`,
        'Conditional independence neither implies nor is implied by marginal independence — colliders are the standard counterexample.',
      ],
      link: 'stats/conditional-probability-bayes',
    },
    {
      kind: 'explain',
      title: 'Undirected models: when there is no natural "cause"',
      body: String.raw`Pixels in an image, atoms in a lattice, words in a sentence — nothing points anywhere. For these, use a **Markov random field** (undirected graphical model): a product over the **cliques** (fully connected subsets) $\mathcal C$ of the graph,
$$p(x)=\frac1Z\prod_{c\in\mathcal C}\psi_c(x_c),\qquad Z=\sum_{x}\prod_{c}\psi_c(x_c).$$
The factors $\psi_c\ge 0$ are arbitrary non-negative *potentials*, not probabilities, which is why the global constant $Z$ — the **partition function** — is needed. Computing $Z$ is the central difficulty of undirected models, and the reason [energy-based models](@ml/energy-based-models) are hard to train.

Independence is now trivially easy to read: $X\perp Y\mid Z$ whenever every path from $X$ to $Y$ passes through $Z$. No collider exception. The **Hammersley–Clifford theorem** says that for strictly positive distributions this graph separation property and the clique factorization above are the same thing.

The two formalisms are not interchangeable. A collider $a\to b\leftarrow c$ cannot be drawn as an MRF (no undirected graph gives $a\perp c$ while $a\not\perp c\mid b$), and a 4-cycle MRF has no equivalent DAG. **Factor graphs** — a bipartite graph of variables and explicit factor nodes — cover both and are what message-passing algorithms actually run on.`,
    },
    {
      kind: 'match',
      prompt: 'Match each term to what it means.',
      pairs: [
        ['Bayes net factorization', String.raw`$\prod_i p(x_i\mid x_{\mathrm{pa}(i)})$ — locally normalized, no global constant`],
        ['MRF factorization', String.raw`$\frac1Z\prod_c\psi_c(x_c)$ — arbitrary potentials, one global partition function`],
        ['d-separation', 'Graph test for independence in directed models, with the collider exception'],
        ['Markov blanket', 'Parents, children and children’s other parents: all a node needs'],
        ['Factor graph', 'Bipartite variables-and-factors graph that message passing runs on'],
      ],
      why: String.raw`The deep difference is normalization. Each Bayes-net factor is itself a distribution, so sampling is a single forward sweep and the likelihood is free. MRF potentials are unnormalized, so you get modelling freedom and pay for it with $Z$. d-separation and the Markov blanket are both *graph* notions that hold for every distribution respecting the graph.`,
    },
    {
      kind: 'explain',
      title: 'Inference: message passing, and where it breaks',
      body: String.raw`With a model in hand you want posteriors: $p(x_i\mid x_{\text{obs}})$, or the marginal likelihood $p(x_{\text{obs}})$. Naively that is a sum over everything unobserved, exponential in the number of variables.

**Variable elimination** does better by pushing sums inward — the distributive law, $\sum_b f(a,b)g(b,c)$ costs far less than expanding first. On a tree, organizing those eliminations gives **belief propagation** (the sum–product algorithm): each node sends its neighbour the product of all *other* incoming messages, summed over itself,
$$m_{i\to j}(x_j)=\sum_{x_i}\psi_{ij}(x_i,x_j)\,\psi_i(x_i)\prod_{k\in N(i)\setminus j}m_{k\to i}(x_i),$$
and after two sweeps every exact marginal is available. The forward–backward algorithm for HMMs and [dynamic programming](@cs/dynamic-programming) are the same computation in costume.

On a general graph you first **moralize** (marry the parents of each collider, drop directions) and triangulate into a junction tree; the cost is exponential in the **treewidth**, one less than the size of the largest clique you end up with. For a $n\times n$ image grid treewidth is $n$, so exact inference is hopeless. Exact inference in general Bayes nets is NP-hard (Cooper, 1990), and so is approximating it to a fixed accuracy (Dagum & Luby, 1993).

That dead end is the whole reason for the rest of this unit: when exact inference is impossible you either **optimize** an approximate posterior — [variational inference](@ml/variational-inference) — or **sample** from the true one — [MCMC](@ml/sampling-for-ml). Running belief propagation on a loopy graph anyway ("loopy BP") is a third option: no guarantees, often surprisingly good, and in fact a fixed-point method for a variational objective of its own (the Bethe free energy).`,
    },
    {
      kind: 'order',
      prompt: 'Order the steps of exact inference by variable elimination on a discrete Bayes net.',
      steps: [
        'Write the joint as the product of the conditional probability tables',
        'Fix the observed variables to their values, reducing those tables',
        'Choose an elimination ordering for the remaining unobserved variables',
        'For each variable in turn: multiply together every factor mentioning it, then sum it out',
        'Multiply the surviving factors and normalize to get the queried posterior',
      ],
      why: String.raw`Clamping the evidence first shrinks every table it touches, so it is done before any summation. The ordering is where all the cost lives: a good ordering keeps intermediate factors small, a bad one builds a factor over nearly every variable. Finding the optimal ordering is itself NP-hard, which is the computational face of treewidth.`,
    },
    {
      kind: 'truefalse',
      prompt: 'Belief propagation gives exact marginals on any graph, provided you run enough iterations.',
      answer: false,
      why: String.raw`Sum–product is exact on **trees** (and on junction trees), where it converges after two sweeps. On a graph with cycles the same messages circulate and double-count evidence: "loopy BP" may oscillate, and when it converges its beliefs are fixed points of the Bethe approximation, not the true marginals. It is often an excellent heuristic — turbo and LDPC decoders are loopy BP — but it carries no exactness guarantee.`,
    },
    {
      kind: 'fill',
      prompt: String.raw`A directed model factorizes as a product of local ___, so no global normalizing constant is needed. An undirected model factorizes over ___ and does need one, called the ___. In a directed graph, observing a ___ makes its two parents dependent.`,
      bank: ['conditionals', 'cliques', 'partition function', 'collider', 'fork', 'likelihood', 'treewidth'],
      answer: ['conditionals', 'cliques', 'partition function', 'collider'],
      why: String.raw`Each Bayes-net factor is already a normalized conditional, so the product is automatically a distribution. MRF potentials are not, so the sum $Z$ over all configurations must be computed — the single hardest quantity in undirected modelling. Observing a *fork* node does the opposite of a collider: it blocks the path.`,
    },
    {
      kind: 'explain',
      title: 'Key takeaways',
      body: String.raw`- A graphical model trades a table of size $2^n$ for a product of small local factors. The **missing** edges are the content.
- **Bayes net:** $p(x)=\prod_i p(x_i\mid x_{\mathrm{pa}(i)})$ on a DAG, locally normalized, free likelihood, ancestral sampling in one sweep.
- Three motifs: chain and fork are **blocked** by observing the middle node; a **collider** is *opened* by it — explaining away.
- **d-separation** is a sound graph test: no active trail $\Rightarrow$ conditional independence in every distribution the graph allows. The converse can fail for particular parameter settings.
- **MRFs** factorize over cliques with potentials and one partition function $Z$; separation is the plain path criterion (Hammersley–Clifford).
- **Exact inference** is message passing: exact on trees, exponential in treewidth in general, NP-hard to do or even approximate in the worst case.
- Which is why the next lessons replace exact inference with [optimization](@ml/variational-inference) or [sampling](@ml/sampling-for-ml).`,
    },
  ],
  references: [
    { authors: 'C. M. Bishop', title: 'Pattern Recognition and Machine Learning', year: 2006, venue: 'Springer', detail: 'Ch. 8 (Graphical Models)' },
    { authors: 'D. Koller & N. Friedman', title: 'Probabilistic Graphical Models: Principles and Techniques', year: 2009, venue: 'MIT Press', detail: 'Ch. 3–4, 9–10' },
    { authors: 'K. P. Murphy', title: 'Probabilistic Machine Learning: Advanced Topics', year: 2023, venue: 'MIT Press', detail: 'Ch. 4 (Graphical models), Ch. 9 (Message passing)' },
    { authors: 'G. F. Cooper', title: 'The Computational Complexity of Probabilistic Inference Using Bayesian Belief Networks', year: 1990, venue: 'Artificial Intelligence 42(2–3), 393–405' },
    { authors: 'P. Dagum & M. Luby', title: 'Approximating Probabilistic Inference in Bayesian Belief Networks is NP-Hard', year: 1993, venue: 'Artificial Intelligence 60(1), 141–153' },
    { authors: 'M. J. Wainwright & M. I. Jordan', title: 'Graphical Models, Exponential Families, and Variational Inference', year: 2008, venue: 'Foundations and Trends in Machine Learning 1(1–2)' },
  ],
} satisfies LessonContent;
