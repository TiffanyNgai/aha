import type { LessonContent } from '../../types';

const rolloutSvg = `<svg viewBox="0 0 320 140" xmlns="http://www.w3.org/2000/svg">
<g font-size="9" font-family="ui-monospace, monospace" text-anchor="middle">
${['C', 'C', '(', '=', 'O', ')', 'N', 'c', '1', 'c', 'c', 'c', 'c', 'c', '1'].map((ch, i) => {
  const x = 14 + i * 20;
  return `<rect x="${x - 8}" y="30" width="16" height="18" rx="3" fill="var(--c2)" fill-opacity="${0.12 + 0.05 * (i % 4)}" stroke="var(--c2)" stroke-width="0.7">
<animate attributeName="fill-opacity" values="0.08;0.55;0.2" dur="4.5s" begin="${i * 0.28}s" repeatCount="indefinite"/></rect>
<text x="${x}" y="43" fill="var(--fg)">${ch === '&' ? '&amp;' : ch}</text>`;
}).join('\n')}
<text x="160" y="18" font-size="8" font-family="inherit" fill="var(--muted)">the policy writes one token at a time: an episode = one molecule</text>
<text x="160" y="64" font-size="8" font-family="inherit" fill="var(--muted)">no reward yet … no reward yet … no reward yet …</text>
<rect x="104" y="76" width="112" height="22" rx="6" fill="var(--c1)" fill-opacity="0.25" stroke="var(--c1)"/>
<text x="160" y="91" font-size="9" font-family="inherit" fill="var(--fg)" font-weight="700">score S(x) at the end</text>
<text x="160" y="114" font-size="8" font-family="inherit" fill="var(--muted)">one scalar for ~40 decisions — a hard credit-assignment problem,</text>
<text x="160" y="126" font-size="8" font-family="inherit" fill="var(--muted)">and the only thing the agent is ever told about chemistry</text>
</g></svg>`;

export default {
  cards: [
    {
      kind: 'explain',
      title: 'A chemist that plays a game',
      body: String.raw`Latent-space optimisation needs a differentiable path from code to score. Reinforcement learning needs no such thing: it only needs to be able to **try** something and be **told a number**.

That is a perfect fit for molecular design. Writing a [SMILES](@drug/molecular-representations) string is a sequence of choices — pick a token, pick the next — and the score of the finished molecule is the reward. Any oracle works: a QSAR model, a docking score, a hand-built filter, even a sum of all three. It need not be differentiable, continuous or even sane.

The best-known instance is **REINVENT** (Olivecrona et al. 2017, *J. Cheminform.*), still the backbone of several industrial design platforms.`,
    },
    {
      kind: 'recall',
      title: 'Policy gradients in one minute',
      points: [
        'A **policy** $\\pi_\\theta(a \\mid s)$ gives the probability of action $a$ in state $s$; here the state is the partial SMILES and the action is the next token.',
        'REINFORCE updates $\\theta$ along $\\nabla_\\theta \\log \\pi_\\theta(a \\mid s)\\, R$ — make high-reward actions more likely, low-reward ones less.',
        'The estimator is unbiased but **high variance**; baselines and advantage estimates reduce it.',
        'Rewards that only arrive at the end of an episode make **credit assignment** hard: which of the 40 tokens deserves the praise?',
      ],
      link: 'ml/policy-gradients',
    },
    {
      kind: 'explain',
      title: 'Step 1: learn the language of chemistry',
      body: String.raw`You do not start from random tokens. First you train a **prior**: an ordinary recurrent language model over SMILES strings from a large database such as ChEMBL, trained purely to predict the next character (Segler et al. 2018 demonstrated this works beautifully).

After pretraining, sampling from the prior gives molecules that look like a plausible medicinal-chemistry catalogue: valid most of the time, reasonable sizes, familiar rings. It knows *nothing* about your target — but it knows what a molecule looks like.

This two-stage shape (pretrain on everything, fine-tune towards an objective) is exactly the recipe used for language models, and it matters for the same reason: it is what keeps the fine-tuned model from drifting into gibberish.`,
      widget: { type: 'SvgDiagram', props: { svg: rolloutSvg }, caption: 'One episode = one molecule. Reward arrives only at the final token.' },
    },
    {
      kind: 'explain',
      title: 'Step 2: REINVENT’s augmented likelihood',
      body: String.raw`The obvious fine-tuning scheme — pure policy gradient on the score — destroys the prior: the agent forgets how to write molecules and chases the score with degenerate strings. REINVENT's fix is to define a target distribution that blends the two.

For a generated molecule $A$ with score $S(A) \in [0,1]$, define the **augmented likelihood**

$$\log P_{\text{aug}}(A) = \log P_{\text{prior}}(A) + \sigma\, S(A)$$

and train the agent to match it, minimising

$$\mathcal{L}(\theta) = \left[\log P_{\text{aug}}(A) - \log P_{\text{agent}}(A)\right]^2 .$$

Read it as: *stay as close to the prior as you can, except where the score says otherwise*. The constant $\sigma$ sets the exchange rate between "looks like a real molecule" and "scores well". Small $\sigma$: timid, prior-like, slow. Large $\sigma$: aggressive, fast — and far more likely to break.`,
    },
    {
      kind: 'widget',
      title: 'Watch the reward go up and the chemistry go down',
      body: String.raw`A schematic training run. The orange curve is the scoring function — the thing being optimised, which only ever improves. The blue curve is scaffold diversity in each batch. The green curve is the molecules you would actually want to make.

Raise $\sigma$ and run it again. Then turn on the diversity filter.`,
      widget: { type: 'DrugRewardHacking', props: { sigma: 60, step: 200 }, caption: 'Illustrative shapes, not measured data — but this is the pattern every practitioner recognises: the reward curve is the least informative plot in the paper.' },
    },
    {
      kind: 'mcq',
      prompt: 'What happens as the weight $\\sigma$ in the augmented likelihood is increased?',
      choices: [
        'The agent stays closer to the pretrained prior',
        'The score matters more relative to the prior, so the agent optimises faster but drifts further from realistic chemistry',
        'The scoring function becomes more accurate',
        'The generated molecules become more diverse',
      ],
      answer: 1,
      why: '$\\sigma$ multiplies the score term in $\\log P_{\\text{prior}} + \\sigma S$, so a larger value buys score at the expense of prior likelihood. Faster optimisation comes with harder mode collapse — and $\\sigma$ cannot change how good the scoring function itself is.',
    },
    {
      kind: 'explain',
      title: 'Reward hacking: the agent is not cheating, you are',
      body: String.raw`An RL agent optimises **the score you wrote**, not the thing you meant. Every weakness in the oracle becomes a strategy. Recurring examples:

- **Unbounded objectives.** Penalised $\log P$ rewards carbon; the agent returns long greasy chains.
- **QSAR blind spots.** A classifier trained on a few thousand actives has regions of chemical space where it confidently predicts "active" because nothing like that was in its training set. The agent finds them — this is [out-of-domain extrapolation](@drug/benchmarks-splits-leakage) weaponised.
- **Docking-score pathologies.** Scores grow with molecular size, so optimising a docking score alone yields enormous greasy molecules that bury a lot of surface and bind nothing.
- **Substructure gaming.** If the reward counts a pharmacophore match, the agent will attach that pharmacophore to anything.

The agent is behaving correctly. The specification was wrong.`,
    },
    {
      kind: 'truefalse',
      prompt: 'A reinforcement-learning run whose reward curve rises smoothly to near 1.0 has produced good molecules.',
      answer: false,
      why: 'A reward near 1.0 means the agent satisfied the oracle, which is a statement about the oracle. Reward hacking, mode collapse onto a single scaffold, and unsynthesizable outputs all show up as *excellent* reward curves. Always inspect the molecules and the diversity.',
    },
    {
      kind: 'explain',
      title: 'Mode collapse and diversity filters',
      body: String.raw`The second failure is structural rather than semantic. Once the agent finds one high-scoring scaffold, policy gradients reinforce it, it is sampled more, it is reinforced more. Within a few hundred steps a batch of 128 "molecules" can be 128 near-copies.

Standard countermeasures:

- **Diversity filters / scaffold memory** — keep a record of the Bemis–Murcko [scaffolds](@drug/scaffolds-chemotypes) already generated and zero or discount the reward for a scaffold seen more than $k$ times. The agent is forced to go and find another hill.
- **Experience replay with deduplication** — reuse good molecules but never the same one twice.
- **Entropy or KL regularisation** — the prior term already does some of this, and running several agents with different seeds covers more ground.

Diversity is not a nicety. A programme needs several chemotypes, because most will die for reasons the score never modelled.`,
    },
    {
      kind: 'multi',
      prompt: 'Which additions genuinely protect an RL molecular-design run from producing useless output? (Select all.)',
      choices: [
        'A scaffold-based diversity filter that penalises repeated chemotypes',
        'Increasing $\\sigma$ so the reward rises faster',
        'A synthesizability term (e.g. an SA score or a retrosynthesis check) inside the reward',
        'Substructure filters that reject reactive or toxic groups',
        'Reporting the mean reward over the final 100 steps',
      ],
      answers: [0, 2, 3],
      why: 'Diversity filters fight mode collapse, synthesizability terms fight unmakeable outputs, and structural alerts fight chemically obnoxious ones. Raising $\\sigma$ accelerates all of those problems, and the mean final reward is a measure of the oracle, not of the molecules.',
    },
    {
      kind: 'explain',
      title: 'What REINVENT actually demonstrated',
      body: String.raw`The original paper is careful and worth reading for its experiments:

- **Structural steering** — asked to avoid sulphur, the fine-tuned agent produced almost no sulphur-containing molecules while still writing drug-like structures.
- **Rediscovery** — given a similarity reward to celecoxib with celecoxib removed from training, the agent regenerated celecoxib itself, showing the search could reach a specified point in chemical space.
- **Target-directed design** — with a support-vector-machine activity model for the dopamine D2 receptor as the reward, the great majority of generated compounds were predicted active, including structures unlike the training actives.

Note the honest reading: these are demonstrations that *the optimiser works*, judged against models. Later versions (REINVENT 2–4) add multi-parameter scoring, diversity filters, scaffold decoration and linker design, and are used in real programmes — but the compounds are still filtered, chosen and made by chemists.`,
    },
    {
      kind: 'order',
      prompt: 'Order a REINVENT-style design run from first step to last.',
      steps: [
        'Pretrain an RNN prior on a large SMILES database such as ChEMBL',
        'Define a scoring function combining activity, properties and synthesizability',
        'Copy the prior to create the agent and sample a batch of molecules',
        'Score the batch and compute the augmented-likelihood loss',
        'Update the agent, applying the diversity filter to repeated scaffolds',
        'Inspect the surviving chemotypes and send a short list for synthesis',
      ],
      why: 'The prior must exist before the agent can be initialised from it, and the scoring function must exist before any batch can be scored. The loop is sample → score → update; the human inspection at the end is not optional.',
    },
    {
      kind: 'fill',
      prompt: 'REINVENT trains the agent to match the augmented likelihood $\\log P_{\\text{prior}} + \\sigma S(A)$, so the ___ keeps the agent writing realistic molecules while $\\sigma$ weights the ___; a scaffold ___ is added to stop the agent collapsing onto one chemotype.',
      bank: ['prior', 'score', 'filter', 'decoder', 'gradient', 'latent'],
      answer: ['prior', 'score', 'filter'],
      why: 'The prior term is the regulariser that preserves chemistry learned from ChEMBL; $\\sigma$ scales the reward against it; the diversity filter (scaffold memory) attacks mode collapse, which neither of the other two terms addresses.',
    },
    {
      kind: 'match',
      prompt: 'Match each pathology to the countermeasure that targets it.',
      pairs: [
        ['Agent forgets how to write valid molecules', 'Keep the prior term in the augmented likelihood'],
        ['Every sample shares one scaffold', 'Scaffold memory / diversity filter'],
        ['Proposals cannot be synthesised', 'Add a synthesizability term to the reward'],
        ['Agent exploits a QSAR model’s blind spot', 'Applicability-domain check or model ensemble in the reward'],
      ],
      why: 'Each countermeasure acts on a different part of the system: the prior protects the language, the filter protects diversity, the synthesizability term protects makeability, and uncertainty-aware scoring protects against trusting the oracle outside its training distribution.',
    },
    {
      kind: 'explain',
      title: 'Key takeaways',
      body: String.raw`- RL needs only an **oracle you can call**, so any scoring function — differentiable or not — can drive molecular design.
- **REINVENT** pretrains a SMILES RNN **prior**, then fine-tunes towards $\log P_{\text{prior}} + \sigma S(A)$. The prior term is what keeps the output chemical; $\sigma$ sets how hard you push.
- **Reward hacking is the default outcome**, not an edge case: unbounded objectives, QSAR blind spots and size-biased docking scores are all exploited enthusiastically.
- **Mode collapse** is equally routine; scaffold-based **diversity filters** are standard practice.
- A rising reward curve is close to worthless as evidence. Look at the molecules, the scaffold count, and whether anything was [made](@drug/synthesizability).`,
    },
  ],
  references: [
    { authors: 'Olivecrona, M., Blaschke, T., Engkvist, O., Chen, H.', title: 'Molecular de-novo design through deep reinforcement learning', year: 2017, venue: 'J. Cheminform. 9, 48' },
    { authors: 'Segler, M. H. S., Kogej, T., Tyrchan, C., Waller, M. P.', title: 'Generating focused molecule libraries for drug discovery with recurrent neural networks', year: 2018, venue: 'ACS Cent. Sci. 4, 120–131' },
    { authors: 'Blaschke, T., Arús-Pous, J., Chen, H., et al.', title: 'REINVENT 2.0: an AI tool for de novo drug design', year: 2020, venue: 'J. Chem. Inf. Model. 60, 5918–5922' },
    { authors: 'Gao, W., Coley, C. W.', title: 'The synthesizability of molecules proposed by generative models', year: 2020, venue: 'J. Chem. Inf. Model. 60, 5714–5723' },
    { authors: 'Sutton, R. S., Barto, A. G.', title: 'Reinforcement Learning: An Introduction', year: 2018, venue: '2nd ed., MIT Press', detail: 'Ch. 13 (policy-gradient methods)' },
  ],
} satisfies LessonContent;
