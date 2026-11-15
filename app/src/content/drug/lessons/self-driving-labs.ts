import type { LessonContent } from '../../types';

const platformSvg = `<svg viewBox="0 0 320 196" xmlns="http://www.w3.org/2000/svg">
<text x="160" y="13" font-size="9" fill="var(--muted)" text-anchor="middle">design – make – test – analyse, with no human in the inner loop</text>
<g font-size="9" font-weight="700" text-anchor="middle" fill="var(--fg)">
<rect x="104" y="24" width="112" height="30" rx="8" fill="var(--c2)" fill-opacity="0.22" stroke="var(--c2)"/>
<text x="160" y="43">DESIGN</text>
<rect x="222" y="82" width="90" height="30" rx="8" fill="var(--c3)" fill-opacity="0.22" stroke="var(--c3)"/>
<text x="267" y="101">MAKE</text>
<rect x="104" y="140" width="112" height="30" rx="8" fill="var(--c1)" fill-opacity="0.22" stroke="var(--c1)"/>
<text x="160" y="159">TEST</text>
<rect x="8" y="82" width="90" height="30" rx="8" fill="var(--c4)" fill-opacity="0.22" stroke="var(--c4)"/>
<text x="53" y="101">ANALYSE</text>
</g>
<g font-size="7.5" fill="var(--muted)" text-anchor="middle">
<text x="160" y="66">model proposes the next batch</text>
<text x="267" y="122">flow reactor / liquid handler</text>
<text x="267" y="131">robotic arm reconfigures it</text>
<text x="160" y="182">in-line LC-MS, NMR, HPLC</text>
<text x="53" y="122">fit the surrogate</text>
<text x="53" y="131">update beliefs</text>
</g>
<g fill="none" stroke="var(--fg)" stroke-width="1.3">
<path d="M216,44 Q264,52 266,78" marker-end="url(#ch)"/>
<path d="M258,112 Q212,146 220,152" marker-end="url(#ch)"/>
<path d="M104,155 Q56,148 54,116" marker-end="url(#ch)"/>
<path d="M62,82 Q102,50 100,42" marker-end="url(#ch)"/>
</g>
<defs><marker id="ch" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="var(--fg)"/></marker></defs>
<circle r="4.5" fill="var(--c5)">
<animateMotion dur="8s" repeatCount="indefinite" path="M216,44 Q264,52 266,78 L258,112 Q212,146 160,155 Q56,148 54,116 L62,82 Q102,50 160,39 L216,44"/>
</circle>
<text x="160" y="104" font-size="8" fill="var(--muted)" text-anchor="middle">one lap: hours</text>
<text x="160" y="114" font-size="8" fill="var(--muted)" text-anchor="middle">a human lap: weeks</text>
<text x="160" y="194" font-size="7.5" fill="var(--muted)" text-anchor="middle">The loop is only "closed" if the arrow from ANALYSE back to DESIGN needs no person.</text>
</svg>`;

export default {
  cards: [
    {
      kind: 'explain',
      title: 'The slow half of the loop',
      body: String.raw`Everything in this subject so far has been cheap. A docking run costs seconds; a generative batch costs an afternoon. Then the route is planned, and the molecule enters the part of the process that still runs at human speed: ordering reagents, running a reaction, working it up, characterising it, getting the assay back. Weeks.

A **self-driving laboratory** closes that gap by putting the slow half under machine control too. The loop is the familiar **design–make–test–analyse (DMTA)** cycle, and the word that matters is **closed**: the output of the analysis feeds the next design *without a person in between*.

That one condition is a high bar, and it is the one you should check every single time the phrase is used.`,
    },
    {
      kind: 'widget',
      title: 'What a closed loop actually contains',
      body: String.raw`Four components, each of which has to work unattended:

- **Design** — a model that chooses the next experiments from everything measured so far.
- **Make** — hardware that executes them: a flow reactor, a liquid handler, a robotic arm.
- **Test** — in-line or at-line analytics that turn a vial into a number, automatically.
- **Analyse** — a pipeline that parses that number, updates the model, and triggers the next round.

Most published "automated" platforms are strong on *make* and weak on *analyse*. A system where a graduate student exports a chromatogram each evening and re-runs the optimiser is an automated lab, not a self-driving one — a useful thing, just not the thing being claimed.`,
      widget: { type: 'SvgDiagram', props: { svg: platformSvg }, caption: 'The dot does a lap in seconds here; a real platform takes hours, and a human team takes weeks. The factor is the entire value proposition.' },
    },
    {
      kind: 'mcq',
      prompt: 'Which setup best meets the definition of a **closed-loop** platform?',
      choices: [
        'A robot runs a 96-well plate each night; a chemist reads the results each morning and picks the next plate',
        'Software selects a batch, the platform runs and analyses it, and the results automatically update the model that selects the next batch',
        'A high-throughput screen runs a fixed, pre-specified library of 100,000 compounds end to end',
        'A generative model proposes 10,000 molecules and a CRO is asked to make the best twenty',
      ],
      answer: 1,
      why: 'Closure means the analysis feeds the next decision with no human step. The overnight-plate arrangement breaks the loop at exactly that point; a fixed library has no decision to make at all; and outsourcing synthesis reintroduces a multi-week human-paced step.',
    },
    {
      kind: 'explain',
      title: 'Why flow chemistry suits machines',
      body: String.raw`Most synthesis automation is built on **flow chemistry**: reagents are pumped continuously through tubing and heated reactor coils rather than stirred in a flask.

The reasons are mundane and decisive:

- **No handling between steps.** The output of one coil is the input of the next — "telescoping" — so there is nothing for a robot to pick up, filter or transfer.
- **Heat and mass transfer are excellent** in narrow tubing, so reactions can be run hotter, faster and more safely, including with reagents too hazardous to hold in a flask.
- **Residence time, temperature and stoichiometry are just numbers** set by pump rates and a heater — precisely the knobs an optimiser can turn.
- **In-line analytics.** The stream can be sent straight through a UV, IR, LC-MS or benchtop NMR detector, which is how the *test* step becomes automatic.

What flow is bad at: solids. Precipitates block tubing, and a great deal of real chemistry makes solids.`,
    },
    {
      kind: 'explain',
      title: 'The hardware spectrum',
      body: String.raw`"Robotic lab" spans several genuinely different designs.

- **Fixed liquid handlers.** A plate-based pipetting robot with a fixed deck. Mature, reliable, used daily in screening — and limited to chemistry that happens in a well.
- **Modular flow platforms.** Pumps, coils and separators that can be plumbed into different configurations. Coley et al. (2019) added a robotic arm that physically reconfigures the fluidic modules between routes, so one machine can run many different syntheses.
- **Chemical programming languages.** The Chemputer (Steiner et al., 2019) represents a synthesis as code in a hardware-independent language, so a published procedure can be compiled onto a standard rig and re-run elsewhere. That reproducibility claim is arguably the more important contribution.
- **Mobile robots.** Rather than automate the instruments, automate the *chemist*: Burger et al. (2020) used a free-roaming robot that walked between existing, unmodified instruments.`,
    },
    {
      kind: 'match',
      prompt: 'Match each platform idea to its defining move.',
      pairs: [
        ['Flow chemistry', 'Pump reagents continuously through coils instead of stirring flasks'],
        ['Modular reconfiguration', 'A robotic arm replumbs the fluidic hardware between different routes'],
        ['Chemical programming language', 'Encode a procedure as portable code so another rig can re-run it'],
        ['Mobile robotic chemist', 'Leave the instruments alone and move a robot between them'],
        ['In-line analytics', 'Measure the stream as it leaves the reactor, with no sample handling'],
      ],
      why: 'These solve different bottlenecks: flow removes handling, reconfiguration removes single-purpose hardware, a programming language removes irreproducibility, mobility removes the cost of retrofitting a lab, and in-line analytics is what makes the loop closable at all.',
    },
    {
      kind: 'explain',
      title: 'The model in the loop',
      body: String.raw`The decision-making half is [active learning](@drug/uncertainty-active-learning) applied to real experiments, usually as **Bayesian optimisation**: fit a surrogate — commonly a Gaussian process — to everything measured so far, then pick the next batch by maximising an acquisition function that trades predicted value against predicted uncertainty.

Three features of real platforms shape the choice of algorithm:

- **Batches, not single points.** The plate or the rack has a fixed size, so you must select several diverse experiments at once; naively taking the top $k$ gives you $k$ near-identical runs.
- **Costs differ.** Changing a temperature is free; changing a catalyst means a new vial. Cost-aware acquisition matters.
- **Experiments fail.** Pumps block, injections miss. The loop needs to record a failure as data rather than crash.

Shields et al. (*Nature* 2021) put this on a firm footing for reaction optimisation, benchmarking Bayesian optimisation against human experts given the same budget — and finding it competitive with, and on average better than, the chemists.`,
    },
    {
      kind: 'widget',
      title: 'Optimising conditions, round by round',
      body: String.raw`A two-variable condition landscape — temperature and catalyst loading — with a sharp global optimum and a broad mediocre one, which is the usual shape. Run rounds with each strategy and compare how many experiments it takes to find the good region.

Then do the thing most papers do not: compare against **random search** with the same budget. On easy landscapes random is surprisingly hard to beat, and a method that only beats a full-factorial grid has beaten the weakest possible baseline.`,
      widget: { type: 'DrugClosedLoop', props: { strategy: 'bo', rounds: 3, batch: 4, kappa: 2, seed: 3 }, caption: 'Switch to "peek" to see the hidden truth the optimiser is searching. Note how a batch of four taken greedily would collapse onto one spot without the local penalisation.' },
    },
    {
      kind: 'numeric',
      prompt: 'The mobile robotic chemist of Burger et al. (2020) performed 688 experiments over 8 days of autonomous operation. How many experiments per day is that, to the nearest whole number?',
      answer: 86,
      tolerance: 1,
      why: '688 ÷ 8 = 86 per day, running continuously. The comparison the paper draws is not against a human doing 86 a day, but against a human doing a handful — the throughput gain comes from unattended operation at night and over weekends as much as from speed per experiment.',
    },
    {
      kind: 'truefalse',
      prompt: 'A closed-loop platform that reaches a high-yielding condition set faster than a full-factorial grid has demonstrated that its optimiser is good.',
      answer: false,
      why: 'A full-factorial grid is close to the weakest baseline available — it spends most of its budget on obviously bad corners. The baseline that matters is random search with the same number of experiments, and a surprising number of landscapes are smooth enough that random does nearly as well. Without that comparison the result shows the hardware worked, not that the algorithm helped.',
    },
    {
      kind: 'explain',
      title: 'What has actually been demonstrated: synthesis',
      body: String.raw`Two results anchor the organic-synthesis side.

**Granda et al. (*Nature* 2018)** coupled an organic synthesis robot to a machine-learning model that predicted, from in-line spectroscopic data, whether a given combination of reagents would react at all. Of roughly a thousand possible combinations of 18 starting materials, the robot ran only about **10 %**, and the model predicted the reactivity of the rest with better than **80 %** accuracy. A chemist then followed those predictions up by hand, and four new reactions came out of it. The target was *discovering reactions*, not making a specified molecule — and note where the human sat: at the end, doing the chemistry that turned a prediction into a result.

**Coley et al. (*Science* 2019)** did the complementary thing. Their platform took a target, planned a route with computer-aided synthesis planning, had a chemist approve and refine it, then compiled it into a flow recipe that a robotic arm physically assembled from modules. They produced fifteen medicinally relevant small molecules this way.

Note the human in that second sentence. The route review was deliberate, and it was not automated away.`,
    },
    {
      kind: 'order',
      prompt: 'Order one round of a closed-loop reaction-optimisation campaign.',
      steps: [
        'Fit the surrogate model to every experiment measured so far',
        'Score the candidate condition space with an acquisition function balancing value and uncertainty',
        'Select a diverse batch that fits the platform\'s capacity and reagent constraints',
        'Execute the batch on the hardware, recording failures as data rather than discarding them',
        'Quantify each run with in-line analytics and write the results to the database',
        'Trigger the next round automatically from the updated database',
      ],
      why: 'Fitting precedes scoring because the acquisition function is defined by the posterior; diversity is imposed at the batch step, after ranking, or the whole batch lands on one point. The last step is the one that distinguishes a closed loop from a fast manual one.',
    },
    {
      kind: 'explain',
      title: 'What has actually been demonstrated: discovery campaigns',
      body: String.raw`**Burger et al. (*Nature* 2020)** ran a mobile robot through 688 experiments over eight days in a ten-variable space of photocatalyst mixtures for hydrogen production from water, choosing each batch by Bayesian optimisation. It found mixtures **six times more active** than the starting formulations, in a search no human team would have had the patience to run.

**Boiko et al. (*Nature* 2023)** connected a large language model to a liquid handler and to documentation search, and had it plan and execute palladium-catalysed cross-couplings with minimal human specification.

Both are real and impressive. Both are also worth reading narrowly: the first optimised a mixture within a defined ten-variable space; the second executed well-known couplings. Neither discovered a drug, and neither claimed to.`,
    },
    {
      kind: 'explain',
      title: 'Demonstrated, versus the press release',
      body: String.raw`The field's most instructive episode is the **A-Lab** (Szymanski et al., *Nature* 2023), an autonomous inorganic-materials platform reported to have synthesised 41 novel compounds in 17 days. Within months, independent solid-state chemists and crystallographers re-examined the published powder-diffraction data. Leeman et al. (*PRX Energy* 2024) went through every claimed product and argued that **none of them was established as a new material**: most were better read as known, compositionally *disordered* versions of the predicted ordered phases, or as mixtures, and the automated Rietveld refinements behind the assignments were not reliable enough to tell the difference. The automation worked. The *autonomous interpretation* of the analytical data, which is the step that turns a vial into a scientific claim, was the weak link.

Four habits that separate a result from a headline:

1. **Was the loop closed, or was a person in it?** Say where the human was.
2. **What was the baseline, on the same budget?** Random search, or an expert chemist.
3. **Who checked the analytical data?** Automated structure assignment is the least mature component.
4. **How general is the hardware?** A platform that runs one reaction class very well is a good tool and a bad general claim.

> Nothing here says self-driving labs do not work. It says the demonstrated claim is usually narrower than the summary of it.`,
    },
    {
      kind: 'multi',
      prompt: 'Which questions genuinely discriminate a strong self-driving-lab result from a weak one?',
      choices: [
        'Was the analysis-to-design step automatic, or did a person intervene each round?',
        'Was the optimiser compared against random search on the same experimental budget?',
        'Were the automated structure or product assignments independently checked?',
        'How many experiments per day the hardware can run at maximum throughput',
        'Is the platform limited to one reaction class, or did it handle several?',
      ],
      answers: [0, 1, 2, 4],
      why: 'Closure, a fair baseline, verified analytics and generality are the four things that can each invalidate a claim on their own. Peak throughput is a specification of the hardware — a machine that runs a thousand useless experiments a day has optimised the wrong quantity.',
    },
    {
      kind: 'fill',
      prompt: 'A self-driving lab closes the ___–make–test–analyse cycle, usually built on ___ chemistry so that reagents move without handling and can be measured ___-line. The model in the loop is typically ___ optimisation over a surrogate, and the baseline it must beat is ___ search.',
      bank: ['design', 'flow', 'in', 'Bayesian', 'random', 'batch', 'grid'],
      answer: ['design', 'flow', 'in', 'Bayesian', 'random'],
      why: 'Each blank is a load-bearing component: without in-line analytics the loop cannot close, and without a random-search comparison the optimiser has not been shown to contribute anything over the hardware.',
    },
    {
      kind: 'explain',
      title: 'Key takeaways',
      body: String.raw`- A **self-driving lab** closes design–make–test–analyse so that the analysis updates the next design **with no human in between**. Most "automated" platforms break the loop exactly there.
- **Flow chemistry** suits automation: no handling between steps, excellent heat and mass transfer, conditions that are literally numbers, and in-line analytics. It struggles with solids.
- Hardware ranges from fixed liquid handlers to modular flow platforms with reconfiguring arms, chemical programming languages for reproducibility, and mobile robots that use ordinary instruments.
- The decision layer is **batch Bayesian optimisation** — value plus uncertainty, with diversity and cost constraints. Shields et al. (2021) found it competitive with expert chemists on reaction optimisation.
- Landmarks: **Granda 2018** (robot discovers reactivity), **Coley 2019** (planned routes compiled to flow, fifteen molecules, chemist-reviewed), **Burger 2020** (688 experiments in 8 days, roughly sixfold improvement).
- The **A-Lab** episode is the cautionary one: automated synthesis is further along than automated *interpretation* of the resulting data.
- Ask every time: was the loop closed, what was the baseline on the same budget, who verified the analytics, and how general is the hardware?`,
    },
  ],
  references: [
    { authors: 'Coley, C. W., Thomas, D. A., Lummiss, J. A. M., et al.', title: 'A robotic platform for flow synthesis of organic compounds informed by AI planning', year: 2019, venue: 'Science 365, eaax1566' },
    { authors: 'Steiner, S., Wolf, J., Glatzel, S., et al.', title: 'Organic synthesis in a modular robotic system driven by a chemical programming language', year: 2019, venue: 'Science 363, eaav2211' },
    { authors: 'Granda, J. M., Donina, L., Dragone, V., Long, D.-L., Cronin, L.', title: 'Controlling an organic synthesis robot with machine learning to search for new reactivity', year: 2018, venue: 'Nature 559, 377–381' },
    { authors: 'Burger, B., Maffettone, P. M., Gusev, V. V., et al.', title: 'A mobile robotic chemist', year: 2020, venue: 'Nature 583, 237–241' },
    { authors: 'Shields, B. J., Stevens, J., Li, J., et al.', title: 'Bayesian reaction optimization as a tool for chemical synthesis', year: 2021, venue: 'Nature 590, 89–96' },
    { authors: 'Boiko, D. A., MacKnight, R., Kline, B., Gomes, G.', title: 'Autonomous chemical research with large language models', year: 2023, venue: 'Nature 624, 570–578' },
    { authors: 'Szymanski, N. J., Rendy, B., Fei, Y., et al.', title: 'An autonomous laboratory for the accelerated synthesis of novel materials', year: 2023, venue: 'Nature 624, 86–91' },
    { authors: 'Leeman, J., Liu, Y., Stiles, J., Lee, S. B., Bhatt, P., Schoop, L. M., Palgrave, R. G.', title: 'Challenges in high-throughput inorganic material prediction and autonomous synthesis', year: 2024, venue: 'PRX Energy 3, 011002' },
  ],
} satisfies LessonContent;
