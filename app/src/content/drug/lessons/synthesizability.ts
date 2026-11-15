import type { LessonContent } from '../../types';

const bottomUpSvg = `<svg viewBox="0 0 320 172" xmlns="http://www.w3.org/2000/svg">
<text x="10" y="13" font-size="9" fill="var(--muted)">two ways to get a molecule that can be made</text>
<g font-size="8.5" fill="var(--fg)">
<text x="10" y="30" font-weight="700" fill="var(--c5)">top-down: design, then hope</text>
<rect x="10" y="36" width="62" height="22" rx="4" fill="var(--c5)" fill-opacity="0.22" stroke="var(--c5)"/>
<text x="41" y="51" text-anchor="middle">generate</text>
<rect x="88" y="36" width="62" height="22" rx="4" fill="var(--c5)" fill-opacity="0.22" stroke="var(--c5)"/>
<text x="119" y="51" text-anchor="middle">score</text>
<rect x="166" y="36" width="62" height="22" rx="4" fill="var(--c5)" fill-opacity="0.22" stroke="var(--c5)"/>
<text x="197" y="51" text-anchor="middle">plan route</text>
<rect x="244" y="36" width="66" height="22" rx="4" fill="var(--muted)" fill-opacity="0.2" stroke="var(--muted)"/>
<text x="277" y="51" text-anchor="middle">most fail</text>
<path d="M72,47 L86,47" stroke="var(--fg)" stroke-width="1.1" marker-end="url(#sh)"/>
<path d="M150,47 L164,47" stroke="var(--fg)" stroke-width="1.1" marker-end="url(#sh)"/>
<path d="M228,47 L242,47" stroke="var(--fg)" stroke-width="1.1" marker-end="url(#sh)"/>
<text x="10" y="86" font-weight="700" fill="var(--c2)">bottom-up: build only what is reachable</text>
<rect x="10" y="92" width="76" height="22" rx="4" fill="var(--c2)" fill-opacity="0.22" stroke="var(--c2)"/>
<text x="48" y="107" text-anchor="middle">pick building block</text>
<rect x="102" y="92" width="76" height="22" rx="4" fill="var(--c3)" fill-opacity="0.22" stroke="var(--c3)"/>
<text x="140" y="107" text-anchor="middle">pick reaction</text>
<rect x="194" y="92" width="116" height="22" rx="4" fill="var(--c1)" fill-opacity="0.22" stroke="var(--c1)"/>
<text x="252" y="107" text-anchor="middle">product + its route, free</text>
<path d="M86,103 L100,103" stroke="var(--fg)" stroke-width="1.1" marker-end="url(#sh)"/>
<path d="M178,103 L192,103" stroke="var(--fg)" stroke-width="1.1" marker-end="url(#sh)"/>
<path d="M252,116 Q150,142 50,118" fill="none" stroke="var(--c2)" stroke-width="1.2" stroke-dasharray="4 3" marker-end="url(#sh)">
  <animate attributeName="stroke-dashoffset" values="14;0" dur="1.3s" repeatCount="indefinite"/></path>
<text x="152" y="140" font-size="8" fill="var(--muted)" text-anchor="middle">grow again</text>
</g>
<defs><marker id="sh" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="var(--fg)"/></marker></defs>
<text x="10" y="162" font-size="7.5" fill="var(--muted)">Bottom-up generation cannot produce an unmakeable molecule, because the route is constructed first.</text>
<text x="10" y="170" font-size="7.5" fill="var(--muted)">The price: it can only reach molecules your reaction and block sets span.</text>
</svg>`;

export default {
  cards: [
    {
      kind: 'explain',
      title: 'The molecules that only exist on screens',
      body: String.raw`Run a [generative model](@drug/generative-molecular-design) against a docking score for long enough and it will hand you something spectacular: a strained bicyclic core decorated with four adjacent stereocentres, two anti-aromatic rings and a functional group nobody has installed since 1974. It scores wonderfully. No one can make it.

This is not a rare accident, it is the expected outcome. The optimiser pushes into whatever region the scoring function rewards, and "a chemist could make this" was not part of the score. So the field bolts on a **synthesizability score**: a cheap number, computable in milliseconds, that estimates how hard a molecule would be to make.

Cheap and approximate is the point. A score you can run on ten million candidates is worth more here than a correct answer you can run on ten.`,
    },
    {
      kind: 'explain',
      title: 'SAscore: fragments plus a complexity penalty',
      body: String.raw`Ertl and Schuffenhauer (2009) built the score everyone still uses, in two halves.

**Fragment contribution.** Count how often each circular atom environment in your molecule appears across PubChem. Common fragments are things chemists evidently make easily; rare ones are not. Average their log-frequencies.

**Complexity penalty.** Subtract terms for size, ring complexity, macrocycles, spiro centres, fused ring systems and stereocentres.

The result is squashed onto **1 (easy) to 10 (hard)**. It takes microseconds, needs no training beyond a frequency table, and ships in RDKit — which is why it is in essentially every generative-design pipeline.

It is also a *complexity* score wearing a synthesizability label. Those are not the same thing.`,
    },
    {
      kind: 'explain',
      title: 'SCScore and RAscore: two other bets',
      body: String.raw`**SCScore** (Coley et al. 2018) learns from reactions instead of fragments. Train a network on a large reaction corpus with one constraint: for every recorded reaction, the product must score *higher* than its reactants, because synthesis generally builds complexity. The learned 1–5 scale therefore encodes "how many synthetic steps of elaboration does this molecule look like?" — a question about reactions, not about substructure frequency.

**RAscore** (Thakkar et al. 2021) gives up on complexity altogether and predicts the thing you care about directly: it is a classifier trained to say whether **AiZynthFinder will find a route** for this molecule. Output is a probability from 0 to 1, and it runs thousands of times faster than the planner it imitates.

Each is a different proxy for the same unobservable: SAscore proxies by fragment rarity, SCScore by reaction-step count, RAscore by a planner's verdict.`,
    },
    {
      kind: 'widget',
      title: 'Three scores, one set of molecules',
      body: String.raw`Because they proxy different things, they disagree — sometimes spectacularly. Sort by each score in turn and watch the ranking reshuffle; the footer gives Spearman's rank correlation between whichever score you picked and the other two.

Pay particular attention to two rows:

- The **cyclic hexapeptide** is routine on a peptide synthesiser, yet SAscore punishes it hard for being a macrocycle. A complexity heuristic sees difficulty where automation has removed it.
- The **generated polyheteroarene** is built from perfectly common fragments, so SAscore likes it — while no planner can find a route to it. Low complexity does not imply a route exists.`,
      widget: { type: 'DrugSynthScores', props: { score: 'sa', threshold: 0.5 }, caption: 'The threshold slider is the filter a generative pipeline actually applies. Move it and watch which molecules you would have thrown away.' },
    },
    {
      kind: 'mcq',
      prompt: 'A cyclic hexapeptide gets a poor (hard) SAscore but is produced routinely by solid-phase synthesis. What does this reveal?',
      choices: [
        'SAscore is miscalibrated and should be rescaled',
        'SAscore measures structural complexity, which is only a proxy for synthetic difficulty',
        'Peptides are not drug-like, so the score is irrelevant',
        'The molecule must in fact be hard to make',
      ],
      answer: 1,
      why: 'The macrocycle and size penalties fire on a structure whose difficulty has been engineered away by automated peptide coupling — the proxy and the target have come apart. Rescaling would not help, because the error is in what the score represents, not in its units.',
    },
    {
      kind: 'truefalse',
      prompt: 'A molecule with an excellent SAscore is guaranteed to have at least one published or plannable synthetic route.',
      answer: false,
      why: 'SAscore only says the molecule is assembled from fragments that are individually common and that it is not structurally baroque. Those fragments may be impossible to join in that arrangement. Route existence is a different question, which is exactly what retrosynthesis-based scores such as RAscore were built to answer.',
    },
    {
      kind: 'explain',
      title: 'Retrosynthesis-based scoring: the expensive, honest option',
      body: String.raw`The least indirect answer is to just run the planner: hand the molecule to [AiZynthFinder or ASKCOS](@drug/retrosynthesis) and see whether it returns a route whose leaves are all purchasable.

Advantages: it answers the actual question, and it hands you the route, so you can look at it.

Costs and caveats:
- **Seconds to minutes per molecule**, versus microseconds for SAscore. You cannot run it on ten million candidates inside a generative loop, which is why RAscore exists as its fast imitation.
- It inherits every flaw of the planner: the stock file, the template library, and the gap between a route *existing* and a route *working*.
- Its verdict is **not binary in the way it is reported**. "No route found in 60 seconds with this stock" is routinely read as "unmakeable".

A reasonable production stack uses a cheap score as a first filter and the planner on the survivors.`,
    },
    {
      kind: 'match',
      prompt: 'Match each score to the quantity it is actually built from.',
      pairs: [
        ['SAscore', 'Fragment frequencies in a large compound database, plus complexity penalties'],
        ['SCScore', 'A network trained so products score above their own reactants'],
        ['RAscore', 'A classifier predicting whether a retrosynthesis planner succeeds'],
        ['Running the planner itself', 'A searched tree whose leaves are all purchasable'],
      ],
      why: 'Each row is a different proxy, which is why their rankings disagree. Knowing which quantity a score is built from tells you in advance where it will be wrong — fragment rarity fails on automated chemistry, planner imitation fails wherever the planner does.',
    },
    {
      kind: 'explain',
      title: 'How bad is the problem, measured?',
      body: String.raw`Gao and Coley (2020) ran a computer-aided synthesis planner (ASKCOS) over the molecules proposed by a range of published generative models. Many of the generators produced structures the planner could not solve, even when they scored well on standard benchmarks. Adding a synthetic-complexity heuristic to the objective steered generation toward more makeable chemistry, but at some cost to the primary objective — evidence that the two pull against each other. Optimising hard for a property drives a generator toward exactly the exotic regions where chemistry runs out.

Two structural reasons this happens:

1. **Reward hacking.** The scoring function is a model. Any model has blind spots, and an optimiser is a machine for finding them. Unmakeable structures are frequently where the blind spots are.
2. **The objective is silent on chemistry.** Nothing in a docking score, a $\log P$ estimate or a QSAR prediction mentions reagents. The generator has no gradient telling it to stay reachable unless you supply one.`,
      widget: { type: 'DrugRewardHacking', caption: 'The same dynamic in general form: an optimiser pointed at a proxy will find the places where the proxy and the truth disagree.' },
    },
    {
      kind: 'multi',
      prompt: 'Why do generative models so reliably propose unmakeable molecules?',
      choices: [
        'The scoring function usually says nothing about chemistry, so nothing penalises unreachability',
        'An optimiser exploits blind spots in any learned score, and exotic structures are often where they are',
        'Pushing a generator toward its primary objective tends to trade off against synthesizability',
        'SMILES strings cannot represent makeable molecules',
        'Validity filters on the generated string already guarantee a route exists',
      ],
      answers: [0, 1, 2],
      why: 'Reward hacking plus a silent objective is the whole story, and Gao and Coley observed the trade-off between objective and makeability directly. SMILES represents makeable and unmakeable molecules equally well, and string validity only means the valences parse — it says nothing about reagents.',
    },
    {
      kind: 'explain',
      title: 'Building-block-constrained generation',
      body: String.raw`The deeper fix is to stop generating molecules and start generating **routes**. Instead of proposing a structure and asking afterwards whether it is reachable, choose a purchasable building block, choose a reaction template, and let the *product* be whatever that gives. Repeat to grow a synthesis tree.

The molecule and its route arrive together, so the output is synthesizable by construction. Approaches in this family include **synthesis-DAG** generators and **SynNet**-style amortised tree generation (Gao, Mercado and Coley, 2022), as well as enumeration over make-on-demand spaces such as the multi-billion-compound catalogues discussed in [ultra-large libraries](@drug/ultra-large-libraries).

The trade-off is real and worth stating: you can now only reach molecules spanned by your reaction set and your block set. You have swapped an unmakeable-molecule problem for a restricted-chemistry problem — and in a programme that needs genuinely novel chemistry, that restriction binds.`,
      widget: { type: 'SvgDiagram', props: { svg: bottomUpSvg }, caption: 'Top-down filters after the fact and throws most of its work away; bottom-up never generates the waste, at the cost of a smaller reachable space.' },
    },
    {
      kind: 'order',
      prompt: 'Order a sensible synthesizability triage, from the step applied to the most molecules to the step applied to the fewest.',
      steps: [
        'Filter the raw generated batch on a microsecond-scale score such as SAscore',
        'Score the survivors with a learned route-likelihood model such as RAscore',
        'Run a full retrosynthesis planner on the shortlist and inspect the returned routes',
        'Have a chemist review the best routes for selectivity, protecting groups and conditions',
        'Order the building blocks and run the chemistry',
      ],
      why: 'Cost per molecule rises by orders of magnitude from each step to the next, so the cheap, crude filters go first on the big numbers and the expensive, trustworthy judgements go last on the few. Running the planner on the raw batch is the common mistake — it is affordable only after the first filter.',
    },
    {
      kind: 'fill',
      prompt: '___ score estimates difficulty from fragment frequency plus complexity penalties; ___ learns that products are more complex than their reactants; ___ predicts whether a retrosynthesis planner will succeed. Generating the route alongside the molecule is called ___-up design.',
      bank: ['SAscore', 'SCScore', 'RAscore', 'bottom', 'top', 'Tanimoto'],
      answer: ['SAscore', 'SCScore', 'RAscore', 'bottom'],
      why: 'The three scores are three proxies at increasing cost and increasing directness. Bottom-up design sidesteps all of them by making unreachability impossible to express in the first place.',
    },
    {
      kind: 'explain',
      title: 'The honest state of the art',
      body: String.raw`Where the field actually stands, stated plainly:

- The scores **rank reasonably and classify badly**. Used to sort a batch, they are useful. Used as a hard pass/fail gate on an individual molecule, they will be confidently wrong on the interesting cases — unusual chemistry is exactly where fragment statistics are thin.
- They correlate with each other only moderately, and all of them correlate imperfectly with chemists' judgement. There is no gold-standard label, because "makeable" depends on who, with what budget, by when.
- **Bottom-up generation works** and is increasingly the default for production campaigns, at the known cost of restricted chemical space.
- Nothing here predicts **yield, cost, scale-up or time**, which are the quantities a programme is actually constrained by. A one-step route from a building block costing a lot per gram can be far worse than a four-step route from cheap feedstocks.

The right posture: treat every synthesizability number as a prioritisation aid, and treat a chemist's read of a concrete route as the evidence.`,
    },
    {
      kind: 'explain',
      title: 'Key takeaways',
      body: String.raw`- Generative models produce unmakeable molecules **by default**, because the objective says nothing about chemistry and an optimiser exploits whatever the score ignores.
- **SAscore** (1–10) = fragment frequency + complexity penalties; **SCScore** (1–5) = learned from reactions so products exceed reactants; **RAscore** (0–1) = fast imitation of a retrosynthesis planner.
- They are **proxies for different things** and disagree accordingly — SAscore punishes macrocyclic peptides that a synthesiser makes routinely, and likes common-fragment molecules with no route.
- **Running the planner** answers the real question and hands you a route, but costs seconds per molecule and inherits all of the planner's limits — including that "no route found" is not "unmakeable".
- **Gao and Coley (2020)** found that many generators propose molecules a planner cannot solve, and that steering toward makeability costs some of the primary objective.
- **Bottom-up, building-block-constrained generation** makes the problem unrepresentable, at the price of a smaller reachable space.
- No score predicts yield, cost or time. Use them to rank; use a chemist and a concrete route to decide.`,
    },
  ],
  references: [
    { authors: 'Ertl, P., Schuffenhauer, A.', title: 'Estimation of synthetic accessibility score of drug-like molecules based on molecular complexity and fragment contributions', year: 2009, venue: 'J. Cheminform. 1, 8' },
    { authors: 'Coley, C. W., Rogers, L., Green, W. H., Jensen, K. F.', title: 'SCScore: synthetic complexity learned from a reaction corpus', year: 2018, venue: 'J. Chem. Inf. Model. 58, 252–261' },
    { authors: 'Thakkar, A., Chadimová, V., Bjerrum, E. J., Engkvist, O., Reymond, J.-L.', title: 'Retrosynthetic accessibility score (RAscore) – rapid machine learned synthesizability classification from AI driven retrosynthetic planning', year: 2021, venue: 'Chem. Sci. 12, 3339–3349' },
    { authors: 'Gao, W., Coley, C. W.', title: 'The synthesizability of molecules proposed by generative models', year: 2020, venue: 'J. Chem. Inf. Model. 60, 5714–5723' },
    { authors: 'Gao, W., Mercado, R., Coley, C. W.', title: 'Amortized tree generation for bottom-up synthesis planning and synthesizable molecular design', year: 2022, venue: 'Proc. ICLR 2022' },
  ],
} satisfies LessonContent;
