import type { LessonContent } from '../../types';

const disconnectSvg = `<svg viewBox="0 0 320 150" xmlns="http://www.w3.org/2000/svg">
<text x="160" y="13" font-size="9" fill="var(--muted)" text-anchor="middle">one disconnection: the amide bond of paracetamol</text>
<g font-size="9" fill="var(--fg)">
<rect x="104" y="26" width="112" height="28" rx="6" fill="var(--c2)" fill-opacity="0.22" stroke="var(--c2)"/>
<text x="160" y="44" text-anchor="middle">TARGET  Ar–NH–C(=O)CH₃</text>
<path d="M150,22 L170,58" stroke="var(--c5)" stroke-width="2" stroke-dasharray="5 3">
  <animate attributeName="stroke-dashoffset" values="16;0" dur="1.4s" repeatCount="indefinite"/>
</path>
<text x="196" y="22" font-size="8" fill="var(--c5)">cut here</text>
<path d="M160,56 L160,74" stroke="var(--fg)" stroke-width="1.2" marker-end="url(#rh)"/>
<text x="176" y="70" font-size="8" fill="var(--muted)">⇒ (retro arrow)</text>
<rect x="18" y="80" width="130" height="26" rx="6" fill="var(--c3)" fill-opacity="0.22" stroke="var(--c3)"/>
<text x="83" y="97" text-anchor="middle" font-size="8.5">SYNTHON  Ar–NH⁻</text>
<rect x="172" y="80" width="130" height="26" rx="6" fill="var(--c3)" fill-opacity="0.22" stroke="var(--c3)"/>
<text x="237" y="97" text-anchor="middle" font-size="8.5">SYNTHON  CH₃C⁺=O</text>
<rect x="18" y="112" width="130" height="26" rx="6" fill="var(--c1)" fill-opacity="0.22" stroke="var(--c1)"/>
<text x="83" y="129" text-anchor="middle" font-size="8.5">4-aminophenol</text>
<rect x="172" y="112" width="130" height="26" rx="6" fill="var(--c1)" fill-opacity="0.22" stroke="var(--c1)"/>
<text x="237" y="129" text-anchor="middle" font-size="8.5">acetic anhydride</text>
</g>
<defs><marker id="rh" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="var(--fg)"/></marker></defs>
<text x="160" y="148" font-size="7.5" fill="var(--muted)" text-anchor="middle">synthons are idealised fragments; the bottom row is their real, buyable equivalents</text>
</svg>`;

const scoreSvg = `<svg viewBox="0 0 320 160" xmlns="http://www.w3.org/2000/svg">
<text x="10" y="13" font-size="9" fill="var(--muted)">what a retrosynthesis number can mean</text>
<g font-size="8.5">
<rect x="10" y="22" width="300" height="30" rx="5" fill="var(--c2)" fill-opacity="0.18" stroke="var(--c2)"/>
<text x="18" y="35" fill="var(--fg)" font-weight="700">top-k accuracy (single step)</text>
<text x="18" y="46" fill="var(--muted)">the one recorded precursor set is in the model's top k</text>
<rect x="10" y="58" width="300" height="30" rx="5" fill="var(--c3)" fill-opacity="0.18" stroke="var(--c3)"/>
<text x="18" y="71" fill="var(--fg)" font-weight="700">solve rate (multi-step)</text>
<text x="18" y="82" fill="var(--muted)">search found a tree whose every leaf is in the stock file</text>
<rect x="10" y="94" width="300" height="30" rx="5" fill="var(--c1)" fill-opacity="0.18" stroke="var(--c1)"/>
<text x="18" y="107" fill="var(--fg)" font-weight="700">round-trip / expert review</text>
<text x="18" y="118" fill="var(--muted)">a forward model or a chemist believes each step</text>
<rect x="10" y="130" width="300" height="24" rx="5" fill="var(--c5)" fill-opacity="0.22" stroke="var(--c5)"/>
<text x="18" y="146" fill="var(--fg)" font-weight="700">someone ran it and isolated the product</text>
</g>
<path d="M6,22 L6,154" stroke="var(--muted)" stroke-width="1"/>
<text x="4" y="20" font-size="7" fill="var(--muted)">cheap, weak</text>
</svg>`;

export default {
  cards: [
    {
      kind: 'explain',
      title: 'The question every design ends on',
      body: String.raw`You have a molecule on a screen. It docks beautifully, the property predictions are green, the patent lawyer likes it. Now a chemist asks the only question that matters next: **can we make it, and how long will it take?**

**Retrosynthesis** is the discipline of answering that *backwards*. Instead of starting from a shelf of chemicals and asking what they might give you, you start from the target and repeatedly ask: *what simpler molecules, in one reaction, would have produced this?* You stop when every molecule you are left with can be bought.

Computers have been attempting this since 1969. It is one of the oldest AI problems in chemistry, and it is still not solved.`,
    },
    {
      kind: 'recall',
      title: 'Reaction mechanisms, in brief',
      points: [
        'A reaction is electrons moving: a **nucleophile** (electron-rich) attacks an **electrophile** (electron-poor).',
        'Functional groups determine which bonds are reactive; the rest of the molecule mostly watches.',
        '**Selectivity** — chemo-, regio- and stereo- — decides which of several possible products you actually get.',
        '**Protecting groups** temporarily mask a reactive group so a reaction happens somewhere else.',
        'Conditions (solvent, temperature, catalyst, equivalents) are part of the reaction, not decoration.',
      ],
      link: 'chem/reaction-mechanisms',
    },
    {
      kind: 'explain',
      title: "Corey's language: disconnection, synthon, equivalent",
      body: String.raw`E. J. Corey formalised the backwards move in the 1960s and won the 1990 Nobel Prize in Chemistry for it. Three words carry the whole idea:

- A **disconnection** is an imagined bond cut in the target, written with a double-shafted retro arrow $\Rightarrow$. It is the reverse of a reaction you know how to run.
- The idealised fragments it leaves are **synthons** — usually charged, often not real molecules.
- A **synthetic equivalent** is the stable, purchasable reagent that plays a synthon's part.

Cut paracetamol's amide bond and the synthons are an aryl nitrogen anion and an acetyl cation; their equivalents are 4-aminophenol and acetic anhydride. That pair is the actual industrial route.`,
      widget: { type: 'SvgDiagram', props: { svg: disconnectSvg }, caption: 'A good disconnection is one whose forward reaction is reliable, cheap and selective — not merely one that is topologically possible.' },
    },
    {
      kind: 'mcq',
      prompt: 'Which of these is a **strategic** disconnection rather than merely a legal one?',
      choices: [
        'Cutting a C–C bond in the middle of an unactivated alkyl chain',
        'Cutting the amide bond of a secondary amide into an amine and an acid chloride',
        'Cutting an aromatic ring into six separate carbon atoms',
        'Cutting a C–H bond to give a carbanion and a proton',
      ],
      answer: 1,
      why: 'A disconnection is only useful if its forward direction is a reaction chemists actually run reliably — amide coupling is among the most used reactions in medicinal chemistry. Unactivated alkyl C–C bonds and C–H bonds have no general, selective forming reaction in that sense, and shredding an arene into atoms corresponds to no reaction at all.',
    },
    {
      kind: 'widget',
      title: 'The retrosynthetic tree',
      body: String.raw`Apply disconnections recursively and you get a tree. The root is the target. Each **reaction node** below a molecule is one disconnection; its children are *all* the precursors that reaction needs — so you must solve every one of them. That makes it an **AND/OR tree**: you choose *one* reaction (OR) but then owe *all* of its precursors (AND).

A branch **terminates successfully** when every leaf is in your **stock**: a file of purchasable building blocks, typically a vendor catalogue plus whatever is on your own shelves. A molecule with no applicable reaction and no supplier is a dead end.

Expand the tree below and watch where it stops. Then switch to the large catalogue — nothing about the chemistry changed, but the search succeeds sooner.`,
      widget: { type: 'DrugRetroTree', props: { stock: 'small', steps: 0 }, caption: 'Celecoxib, expanded best-first: always open the frontier molecule with the highest product of template priors. "Solved" is a statement about your stock file as much as about your algorithm.' },
    },
    {
      kind: 'numeric',
      prompt: 'A single-step model proposes on average 10 plausible disconnections for any molecule. How many distinct 4-step route prefixes would an exhaustive breadth-first search have to enumerate?',
      answer: 10000,
      tolerance: 0,
      why: 'Branching factor 10 over 4 levels gives $10^4 = 10{,}000$, and real policies propose far more than 10. The combinatorial explosion is exactly why retrosynthesis needs guided *search* rather than enumeration — and why a good priority ordering matters more than a slightly better single-step model.',
    },
    {
      kind: 'explain',
      title: 'Expert systems and reaction templates',
      body: String.raw`The first programme, **LHASA** (Corey & Wipke, *Science* 1969), stored transforms written by hand by chemists. Encoding chemistry by hand is slow, so by the 2010s the rules were being **extracted automatically** from reaction databases.

A **reaction template** is a subgraph-rewrite rule: a SMARTS-like pattern describing the atoms and bonds that change, plus their immediate environment. Extract one from each recorded reaction, keep those seen often enough, and a few hundred thousand reactions become tens of thousands of templates. A neural **policy** then ranks which templates to try on a given molecule.

Templates are interpretable, always produce chemically valid precursors, and are trivially auditable. Their weakness is equally clear: **a template can never propose a reaction absent from the database**, and a pattern that is too general fires where the chemistry would not.`,
    },
    {
      kind: 'explain',
      title: 'Learned, template-free models',
      body: String.raw`The alternative is to let a model write the precursors itself.

- **Sequence to sequence.** Treat retrosynthesis as translation: input the product [SMILES](@drug/molecular-representations), output the reactant SMILES, token by token (Liu et al. 2017 first did this with an LSTM; transformers followed).
- **Graph edits.** Predict which bonds break, giving *synthons*, then complete each synthon into a real reactant.
- **Hybrids** such as conditional graph logic networks keep templates but learn jointly over which template and which atoms it applies to.

Template-free models can emit chemistry no template covers, and they handle unusual rings gracefully. In exchange they can emit **invalid or absurd** precursors, they are hard to audit, and their apparent novelty is often just a template they memorised without saying so.`,
    },
    {
      kind: 'match',
      prompt: 'Match each property to the approach it describes.',
      pairs: [
        ['Reaction template', 'A subgraph-rewrite rule extracted from recorded reactions'],
        ['In-scope filter', 'A learned check on whether a proposed reaction is plausible'],
        ['Sequence-to-sequence retrosynthesis', 'Product SMILES in, reactant SMILES out, token by token'],
        ['Stock file', 'The set of molecules a branch is allowed to terminate on'],
        ['Rollout policy', 'A deliberately cheap descent used only to estimate a value'],
      ],
      why: 'Templates, the in-scope filter and the rollout policy are three separate learned or extracted components of one planner — it is worth keeping them apart, because papers improve one and report the gain as if the whole system got better. The stock file is not part of the model at all, which is exactly why it can inflate results.',
    },
    {
      kind: 'widget',
      title: 'Search: Monte Carlo tree search over disconnections',
      body: String.raw`A ranked list of single steps is not a route. You need **search** over the tree, and the budget is finite.

Segler, Preuss and Waller (*Nature* 2018) used **Monte Carlo tree search** guided by three neural networks — an *expansion* policy proposing templates, an *in-scope filter* judging whether a proposed reaction is plausible, and a fast *rollout* policy for simulations. The four phases below repeat thousands of times per target.

The alternative family treats the AND/OR tree as a shortest-path problem: **Retro\*** and related A\*-style searches learn an admissible-ish cost for each molecule and expand the cheapest frontier. AiZynthFinder, the widely used open-source tool, uses MCTS as its default search.`,
      widget: {
        type: 'StepReveal',
        props: {
          steps: [
            '**Selection.** From the root, repeatedly descend to the child maximising a UCT-style score: average value so far plus an exploration bonus that favours rarely visited branches.',
            '**Expansion.** At the chosen leaf, run the policy network and add child reaction nodes for its top-ranked templates, filtered by the in-scope network.',
            '**Simulation (rollout).** From a new child, apply the fast rollout policy greedily until every leaf is in stock (success) or the depth budget runs out (failure).',
            '**Update.** Propagate the rollout outcome back up the path, updating each node\'s visit count and average value, so the next selection is better informed.',
          ],
          notes: [
            'Exploration bonus is what stops the search from committing to the first plausible-looking disconnection.',
            'This is the expensive step: each expansion is a forward pass plus a substructure match against the template library.',
            'Rollouts are deliberately cheap and bad. Their job is a noisy value estimate, not a route.',
            'Thousands of iterations later, the most-visited path from the root is returned as the proposed route.',
          ],
        },
        caption: 'The same algorithm family as game-playing search, with "win the game" replaced by "every leaf is purchasable".',
      },
    },
    {
      kind: 'order',
      prompt: 'Put one iteration of neural-guided MCTS retrosynthesis in order.',
      steps: [
        'Descend from the root to a frontier node, balancing value against an exploration bonus',
        'Run the policy network on that molecule and add child reaction nodes for its top templates',
        'Filter out proposed reactions the in-scope model judges implausible',
        'Roll out greedily from a new child until stock is reached or the depth limit is hit',
        'Back up the outcome, updating visit counts and values along the path',
      ],
      why: 'Selection, expansion, simulation and update is the standard MCTS cycle; the in-scope filter sits inside expansion so implausible reactions are never searched. Backing up the result before the next descent is what makes later iterations smarter than earlier ones.',
    },
    {
      kind: 'explain',
      title: 'How success is reported',
      body: String.raw`Three very different numbers all get called "accuracy".

**Top-$k$ accuracy (single step).** On a held-out set such as USPTO-50K, does the *one recorded* precursor set appear among the model's top $k$ suggestions? Without being told the reaction class, published models land at roughly 40–55 % top-1 on USPTO-50K (the exact figure depends on the model and the split) and far higher by top-10. The flaw is structural: a chemically excellent alternative disconnection counts as wrong, because the benchmark has exactly one key.

**Solve rate (multi-step).** The fraction of targets for which the search returns a complete tree within a budget of expansions or seconds. This number is extremely sensitive to things that are not the algorithm — enlarge the stock file and it rises on its own.

**Route quality.** Does the route resemble what a chemist would do? This needs a different kind of evidence entirely.`,
      widget: { type: 'SvgDiagram', props: { svg: scoreSvg }, caption: 'Going down the ladder costs more and means more. Most papers report only the top two rungs.' },
    },
    {
      kind: 'truefalse',
      prompt: 'If a retrosynthesis tool raises its reported solve rate from 80 % to 92 %, its chemistry must have improved.',
      answer: false,
      why: 'Solve rate is "a tree was found whose leaves are all in the stock file, within budget". Swapping a 20,000-compound in-house stock for a 2-million-compound vendor catalogue, or raising the expansion budget, lifts the number without changing a single prediction. Always ask which stock and which budget were used.',
    },
    {
      kind: 'explain',
      title: 'Existence is easy; plausibility is hard',
      body: String.raw`A returned route asserts: *for each step, some template matched, and the leaves are purchasable.* That is a claim about **pattern matching**, not about chemistry. The gap between the two is where the field actually lives.

What templates routinely ignore:
- **Chemoselectivity.** The template fires on the ester you meant; the molecule also contains an aldehyde that reacts faster.
- **Protecting groups.** A real route spends steps masking and unmasking groups. Planners often silently assume the problem away.
- **Stereochemistry**, ring strain, and whether the precursor is stable enough to isolate.
- **Conditions, yield and purification.** Almost no planner predicts them, and a route of eight steps at 30 % each delivers well under a percent overall.

The partial answers are to check each step with a [forward reaction model](@drug/reaction-prediction) — a *round trip*: does the predicted product come back? — to benchmark against literature routes, to ask chemists in a blind comparison, or, best of all, to run it.

Segler et al. ran that blind comparison carefully, and it is worth knowing exactly what it measured. Forty-five postgraduate organic chemists (in Münster and Shanghai) were shown pairs of routes to the same target and asked which they *preferred*, without knowing the source. Against routes from the literature they showed no statistically significant preference (about 43 % chose the literature route and 57 % the computed one), so the computed routes were judged **comparable to** published ones — a claim about plausibility as a chemist reads it, not about whether the routes work. A second test, against routes from a heuristic best-first search with no neural guidance, did show a clear preference (about 68 %) for the neural-guided routes.`,
    },
    {
      kind: 'multi',
      prompt: 'Which pieces of evidence genuinely bear on whether a *proposed route is plausible* (not merely whether one exists)?',
      choices: [
        'A forward reaction model reproduces the target from each predicted precursor set',
        'Every leaf of the tree appears in a vendor catalogue',
        'Chemists blind to the source rate the route as comparable to literature routes',
        'The route was executed and the product isolated and characterised',
        'The search completed in under two seconds',
      ],
      answers: [0, 2, 3],
      why: 'Round-trip consistency, blind expert judgement and actual execution all test whether the chemistry would work. Purchasable leaves and a fast runtime are properties of the stock file and the hardware — a route can be instant, fully buyable, and complete nonsense.',
    },
    {
      kind: 'fill',
      prompt: 'An imagined bond cut in the target is a ___; the idealised fragments it leaves are ___, and the real reagents that play their part are synthetic ___. A search terminates successfully when every leaf lies in the ___.',
      bank: ['disconnection', 'synthons', 'equivalents', 'stock', 'template', 'rollout'],
      answer: ['disconnection', 'synthons', 'equivalents', 'stock'],
      why: "Corey's vocabulary maps directly onto the data structures: a disconnection is an edge in the tree, synthons are the abstract children, equivalents are what the stock file is searched for. Keeping the last term in mind stops you reading a solve rate as a statement about chemistry.",
    },
    {
      kind: 'explain',
      title: 'Key takeaways',
      body: String.raw`- **Retrosynthesis works backwards** from a target to purchasable building blocks, in Corey's language of disconnections, synthons and synthetic equivalents.
- The search space is an **AND/OR tree**: pick one reaction, then owe *all* its precursors. Branching of ten over four levels is already $10^4$ prefixes, so guided search is unavoidable.
- **Templates** (rules extracted from reaction databases) give valid, auditable precursors but cannot leave recorded chemistry; **template-free** models reach further and guarantee less.
- **Segler et al. (2018)** combined three neural networks with Monte Carlo tree search; AiZynthFinder is the open-source descendant, and A\*-style searches such as Retro\* are the main alternative.
- **Top-$k$ accuracy** penalises correct-but-unrecorded answers; **solve rate** mostly measures your stock file and your compute budget.
- Proving a route *exists* in a template library is cheap. Showing it is **plausible** needs round-trip checks, blind expert review, or a flask — and that is the real open problem.`,
    },
  ],
  references: [
    { authors: 'Corey, E. J., Cheng, X.-M.', title: 'The Logic of Chemical Synthesis', year: 1989, venue: 'Wiley', detail: 'Ch. 1–2 (retrosynthetic analysis, strategic bonds)' },
    { authors: 'Corey, E. J., Wipke, W. T.', title: 'Computer-assisted design of complex organic syntheses', year: 1969, venue: 'Science 166, 178–192' },
    { authors: 'Segler, M. H. S., Preuss, M., Waller, M. P.', title: 'Planning chemical syntheses with deep neural networks and symbolic AI', year: 2018, venue: 'Nature 555, 604–610' },
    { authors: 'Genheden, S., Thakkar, A., Chadimová, V., Reymond, J.-L., Engkvist, O., Bjerrum, E.', title: 'AiZynthFinder: a fast, robust and flexible open-source software for retrosynthetic planning', year: 2020, venue: 'J. Cheminform. 12, 70' },
    { authors: 'Schwaller, P., Petraglia, R., Zullo, V., et al.', title: 'Predicting retrosynthetic pathways using transformer-based models and a hyper-graph exploration strategy', year: 2020, venue: 'Chem. Sci. 11, 3316–3325' },
  ],
} satisfies LessonContent;
