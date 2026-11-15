import type { LessonContent } from '../../types';

const flows: [string, string, string][] = [
  ['Non-equilibrium thermodynamics', '→', 'Diffusion models (2015, 2020)'],
  ['Reverse-time SDEs (control theory)', '→', 'The score SDE (2021)'],
  ['Optimal transport (1781, 1942)', '→', 'Wasserstein GAN, flow matching'],
  ['Spin glasses & Ising models', '→', 'Hopfield nets, Boltzmann machines'],
  ['Infinite-width limits (mean field)', '→', 'NTK, μP hyperparameter transfer'],
  ['Group representation theory', '→', 'Equivariant networks for molecules'],
  ['Machine learning', '⇄', 'Structure biology, weather, plasma control'],
];
const mapSvg = `<svg viewBox="0 0 320 ${28 + flows.length * 27}" xmlns="http://www.w3.org/2000/svg" font-family="inherit">
  <text x="6" y="12" font-size="10" fill="var(--fg)">Where the ideas came from (and one that went back)</text>
  ${flows.map(([a, arrow, b], i) => {
    const y = 22 + i * 27;
    const last = i === flows.length - 1;
    const col = last ? 'var(--c1)' : 'var(--c4)';
    return `<g>
      <rect x="6" y="${y}" width="140" height="22" rx="4" fill="var(--surface)" stroke="${col}" stroke-width="1"/>
      <text x="12" y="${y + 14}" font-size="8" fill="var(--fg)">${a}</text>
      <text x="153" y="${y + 15}" font-size="11" fill="${col}" text-anchor="middle">${arrow}
        <animate attributeName="opacity" values="0.35;1;0.35" dur="2.8s" begin="${i * 0.3}s" repeatCount="indefinite"/>
      </text>
      <rect x="162" y="${y}" width="152" height="22" rx="4" fill="var(--surface)" stroke="var(--c2)" stroke-width="1"/>
      <text x="168" y="${y + 14}" font-size="8" fill="var(--fg)">${b}</text>
    </g>`;
  }).join('')}
</svg>`;

export default {
  cards: [
    {
      kind: 'explain',
      title: 'Almost nothing here was invented here',
      body: String.raw`The equations behind the most successful generative models of the 2020s were written down by a physicist studying molecular machines, a control theorist studying filtering, and an eighteenth-century engineer asking how to move a pile of earth. None of them were thinking about images.

That is not a curiosity. It is how this field works: the mathematics of a well-developed subject arrives in machine learning with a century of results attached, and someone notices that a learning problem has the same shape.

This lesson gives the **mechanism** of each transfer — what exactly was borrowed, and what it bought — rather than the name-drop. It also says where each analogy stops being true, because several of them are repeated well past their expiry date.`,
      widget: { type: 'SvgDiagram', props: { svg: mapSvg } },
    },
    {
      kind: 'explain',
      title: 'Thermodynamics → diffusion models',
      body: String.raw`In statistical physics there is a family of results about processes driven slowly away from equilibrium. The **Jarzynski equality** (1997) relates the work done along such a process to a free-energy difference, and it underlies **annealed importance sampling**, a technique for estimating the normalising constant of a hard distribution by bridging it to an easy one through a chain of intermediate distributions.

**Sohl-Dickstein, Weiss, Maheswaranathan and Ganguli (2015, ICML)** took that structure literally. Their proposal:

1. Define a forward process that slowly destroys structure in the data by repeated small diffusion steps, ending at a simple distribution (a Gaussian).
2. Because each step is small, its *reverse* is also approximately a small Gaussian step. So learn the reverse.
3. Sampling = start from the easy distribution and run the learned reverse chain.

The crucial borrowed insight is step 2: *if each forward step is small enough, the reverse step has the same functional form*. That is a result about diffusion processes, not about neural networks. It is what makes the whole scheme trainable at all.

The idea sat relatively quiet for five years until **Ho, Jain and Abbeel (2020, DDPM)** found the parameterisation and loss weighting that made it work at image scale. See [denoising diffusion](@ml/diffusion-models).`,
      widget: {
        type: 'StepReveal',
        props: {
          steps: [
            String.raw`**The physics statement.** A diffusion $d\mathbf x=\mathbf f\,dt+g\,d\mathbf w$ run forward in time mixes any starting distribution toward equilibrium. The density obeys the Fokker–Planck equation.`,
            String.raw`**The control-theory statement (Anderson, 1982).** The time reversal of that diffusion is *also* a diffusion, with drift $\mathbf f-g^2\nabla_{\mathbf x}\log p_t(\mathbf x)$. This came out of the filtering and smoothing literature, decades before anyone generated an image with it.`,
            String.raw`**The one unknown.** Everything in that reverse drift is chosen by you except $\nabla\log p_t$, the **score** of the noised data distribution.`,
            String.raw`**The learning problem.** Estimating a score looks impossible (it involves the unknown data density) until you notice that denoising gives it to you for free: the optimal denoiser at noise level $\sigma$ is $\mathbf x+\sigma^2\nabla\log p_\sigma(\mathbf x)$. That identity is Tweedie's formula, from 1950s empirical-Bayes statistics.`,
            String.raw`**The result.** Three borrowed pieces — a thermodynamic bridging scheme, a reverse-time SDE from control theory, and an empirical-Bayes identity from statistics — compose into [the score SDE](@ml/score-sde), and the only machine learning in it is "fit a function with a neural network".`,
          ],
          notes: [
            'Non-equilibrium statistical mechanics, roughly 1990s.',
            'B. D. O. Anderson, Stochastic Processes and their Applications, 1982.',
            '',
            'Tweedie’s formula; named by Robbins (1956), attributed to M. C. K. Tweedie.',
            'Song et al., ICLR 2021, assembled exactly this.',
          ],
        },
      },
    },
    {
      kind: 'recall',
      title: 'Recall: reverse-time SDEs',
      points: [
        String.raw`A stochastic differential equation $d\mathbf x=\mathbf f(\mathbf x,t)\,dt+g(t)\,d\mathbf w$ moves a point by a deterministic **drift** plus Gaussian **noise** in each instant.`,
        String.raw`**Anderson's theorem (1982):** running it backwards in time gives another SDE, with drift $\mathbf f-g^2\nabla_{\mathbf x}\log p_t(\mathbf x)$ and the same diffusion coefficient.`,
        String.raw`The extra term $\nabla\log p_t$ — the **score** — points uphill in the density at time $t$. It is what undoes the spreading.`,
        String.raw`This is a theorem about diffusions. It was proved for filtering problems and had nothing to do with generative modelling for forty years.`,
      ],
      link: 'math/time-reversal-sde',
    },
    {
      kind: 'mcq',
      prompt: 'Why was Anderson’s 1982 reverse-time SDE theorem so useful for generative modelling, rather than merely elegant?',
      choices: [
        'It proves that a neural network can approximate any continuous function',
        'It reduces "learn to invert a complicated corruption process" to "estimate one quantity, the score, which denoising gives you a training target for"',
        'It shows the forward noising process is optimal in the Wasserstein sense',
        'It guarantees that the generated samples match the data distribution exactly',
      ],
      answer: 1,
      why: String.raw`The value of the theorem is that it isolates a single unknown. Everything else in the reverse drift is the forward process you chose. Universal approximation is a separate and much weaker statement; nothing here says the forward process is optimal, and the exactness holds only in the idealised case where the score is learned perfectly.`,
    },
    {
      kind: 'explain',
      title: 'Optimal transport → flow matching',
      body: String.raw`In 1781 Gaspard Monge asked how to move a pile of earth into a given shape with the least total work. **Kantorovich (1942)** gave the problem its modern linear-programming form. **Benamou and Brenier (2000)** then gave a *dynamic* version: instead of a static plan matching source points to target points, describe a time-dependent velocity field $\mathbf v_t$ that flows one distribution into the other, and minimise $\int\!\int\|\mathbf v_t\|^2 p_t$ subject to the continuity equation $\partial_t p_t+\nabla\cdot(p_t\mathbf v_t)=0$.

That is, structurally, exactly what a modern generative model does: learn a velocity field that transports noise into data. **Lipman et al. (2023, ICLR, flow matching)** and **Liu et al. (2023, ICLR, rectified flow)** build the model around it, regressing $\mathbf v_\theta$ on straight conditional paths. See [flow matching](@ml/flow-matching).

What the transport view buys, concretely: **straightness**. A true optimal-transport displacement moves mass along straight lines at constant speed. A straight trajectory can be integrated exactly by a single Euler step — which is why pushing couplings toward optimal transport is the main route to few-step generation. **Tong et al. (2024, TMLR)** pair samples within each minibatch by solving a small optimal-transport problem, which straightens paths and speeds up sampling.

**Where it breaks.** Minibatch optimal transport is not optimal transport: the coupling computed inside a batch of 256 is a biased estimate of the coupling between the full distributions, and the bias does not vanish by averaging. The method is used because it helps, not because the theory covers it.`,
    },
    {
      kind: 'numeric',
      prompt: String.raw`A generative flow has been trained so that every trajectory from noise to data is perfectly straight with constant velocity. How many Euler integration steps are needed to reach the endpoint with zero discretisation error?`,
      answer: 1,
      why: String.raw`Euler's method is exact for a constant velocity, so one step of size 1 lands exactly on the endpoint. This is the entire motivation for rectified flow and for optimal-transport couplings: curvature in the trajectories, not anything about the model's capacity, is what forces many sampling steps. Real trained flows are not perfectly straight, so in practice you still need several.`,
    },
    {
      kind: 'explain',
      title: 'Statistical physics → learning theory',
      body: String.raw`Physics gave machine learning two separate things: models, and a way of analysing them.

**Models.** A **spin glass** is a lattice of magnetic spins with random interactions — a system with an energy function and many local minima. **Hopfield (1982, PNAS)** noticed that if you choose the interactions suitably, the local minima of such a system can be made to store patterns, and the dynamics then retrieves the stored pattern nearest to an input. **Ackley, Hinton and Sejnowski (1985)** made it probabilistic: the Boltzmann machine puts the Boltzmann distribution $p(\mathbf x)\propto e^{-E(\mathbf x)/T}$ over binary states and learns $E$. That line leads directly to today's [energy-based models](@ml/energy-based-models). The 2024 Nobel Prize in Physics went to Hopfield and Hinton for this work.

**Analysis.** Statistical physics is good at systems with very many interacting components where you want *typical* behaviour, not worst case. **Gardner (1988)** used the replica method — a physics technique for averaging over random disorder — to compute the storage capacity of a perceptron: how many random patterns a network of given size can classify. Classical learning theory, built on [VC dimension](@ml/pac-learning-vc), gives worst-case bounds that are often vacuous for modern networks; the physics style of analysis asks instead what happens for typical data, and gets sharper answers.

The modern descendants are **infinite-width limits**. **Jacot, Gabriel and Hongler (2018, NeurIPS)** showed that as width goes to infinity under a particular scaling, training behaves like kernel regression with a fixed kernel — the **neural tangent kernel**. Beautiful, and a trap: in that limit the features never change, which is precisely the thing deep learning is supposed to do. **Chizat, Oyallon and Bach (2019)** called it the *lazy* regime and showed real networks often do not train in it. The repair is a different scaling, the feature-learning or **μP** limit (**Yang and Hu, 2021**), which — as the [previous lesson](@ml/frontier-why-hard) noted — does pay off practically as hyperparameter transfer.`,
    },
    {
      kind: 'match',
      prompt: 'Match each borrowed object to the thing in machine learning it became.',
      pairs: [
        ['Ising model / spin glass energy', 'Hopfield networks and Boltzmann machines'],
        ['Reverse-time diffusion (Anderson, 1982)', 'The reverse SDE in score-based generative models'],
        ['Benamou–Brenier dynamic optimal transport', 'Flow matching’s velocity field and continuity equation'],
        ['Irreducible group representations', 'Steerable filters in equivariant molecular networks'],
        ['Gibbs free energy / variational bound', 'The ELBO in variational inference'],
      ],
      why: String.raw`In each case the mathematics transferred intact; only the interpretation changed. The last is the closest of all — the ELBO *is* the variational free energy of statistical mechanics, derived from the same Gibbs inequality, which is why physicists find [variational inference](@ml/variational-inference) immediately familiar.`,
    },
    {
      kind: 'explain',
      title: 'Group theory → equivariant networks',
      body: String.raw`A **group** is a set of transformations you can compose and undo — rotations of a molecule, translations of an image, permutations of a set. A function $f$ is **equivariant** to a group $G$ if transforming the input transforms the output the same way: $f(g\cdot x)=g\cdot f(x)$ for every $g\in G$. (If the output does not change at all, $f$ is **invariant**.)

The energy of a molecule does not depend on where it sits or how it is turned, so it is invariant to the group of rotations, reflections and translations of three-dimensional space. The forces *rotate with* the molecule, so they are equivariant. A network that does not know this must learn it from data, one orientation at a time.

Building it in is a hypothesis-class restriction: you only allow functions that commute with the group action. **Cohen and Welling (2016, ICML)** did it for discrete rotations on images; **Thomas et al. (2018)** and **Weiler et al. (2018, 3D steerable CNNs)** did it for continuous three-dimensional rotations by expressing features in terms of **irreducible representations** — the indivisible pieces into which any representation of a group decomposes — and combining them with tensor products. **Batzner et al. (2022, Nature Communications, NequIP)** and **Batatia et al. (2022, NeurIPS, MACE)** applied this to interatomic potentials. The NequIP authors reported accuracy matching or beating earlier models trained on up to roughly three orders of magnitude more data on their benchmarks — a claim about the settings they tested, not a universal factor. See [group-equivariant networks](@ml/equivariant-networks) and [E(3)-equivariant networks](@ml/e3-equivariant-networks).

**Where it is contested.** The sample-efficiency argument is strongest when data is scarce. As molecular datasets have grown, large unconstrained models trained with rotation augmentation have become competitive with equivariant ones on some benchmarks, and equivariant architectures are more expensive per parameter. As of 2026 whether exact equivariance is worth its cost at large data scale is an open argument, not a settled fact.`,
    },
    {
      kind: 'multi',
      prompt: 'Which of these are genuine consequences of building exact equivariance into an architecture? (Select all that apply.)',
      choices: [
        'The hypothesis class is restricted to functions that commute with the group action',
        'Fewer training examples are typically needed, because the symmetry does not have to be learned',
        'The model is guaranteed to be more accurate than a non-equivariant model with the same compute budget',
        'Predictions are exactly consistent under the symmetry, rather than approximately so',
        'Each parameter typically costs more compute, because of the structured operations involved',
      ],
      answers: [0, 1, 3, 4],
      why: String.raw`Restriction, sample efficiency, exactness and extra cost per parameter all follow from the construction. The accuracy guarantee does not: a smaller hypothesis class helps only if the truth lies inside it and the budget is better spent that way, which is exactly the point under dispute at large data scale.`,
    },
    {
      kind: 'explain',
      title: 'A borrowing that did not hold up',
      body: String.raw`Not every import survives. The **information bottleneck** is the cautionary tale.

**Tishby, Pereira and Bialek (1999)** proposed, from information theory, that a good representation $T$ of input $X$ for predicting $Y$ should maximise the mutual information $I(T;Y)$ while minimising $I(X;T)$ — keep what is predictive, throw away the rest. **Shwartz-Ziv and Tishby (2017)** reported that deep networks trained by SGD show two distinct phases: a fitting phase where $I(T;Y)$ rises, then a long **compression** phase where $I(X;T)$ falls, which they proposed as the mechanism of generalisation.

**Saxe et al. (2018, ICLR)** examined the claim and found it tied to an incidental detail. The compression phase appeared with saturating activations such as $\tanh$ and largely disappeared with ReLU networks; networks that generalised well often showed no compression; and the measured mutual information depended heavily on the binning scheme used to estimate it — for a deterministic network with continuous activations, $I(X;T)$ is in principle infinite, so the measured values depend on the estimator, and the compression curves in particular were shown to depend on the binning choice.

The theory is not refuted as a *framework* and remains actively studied. What failed was the specific empirical claim that compression explains generalisation. The general lesson: when a borrowed quantity is hard to estimate in the new setting, the estimator can produce the phenomenon you were hoping to see.`,
    },
    {
      kind: 'truefalse',
      prompt: String.raw`Saxe et al. (2018) showed the information-bottleneck framework is mathematically wrong.`,
      answer: false,
      why: String.raw`They challenged an empirical claim, not the mathematics. The information bottleneck is a well-defined optimisation problem; what did not replicate was the finding that deep networks universally undergo a compression phase and that this explains generalisation. Distinguishing "the theory is wrong" from "this particular experiment does not support it" is most of the work in reading a contested result.`,
    },
    {
      kind: 'explain',
      title: 'What machine learning exported',
      body: String.raw`The traffic runs both ways, and the exports are now substantial.

- **Structural biology.** AlphaFold2 (**Jumper et al., 2021, Nature**) and its successors changed what a structural biologist does first. Protein language models — **Rives et al. (2021, PNAS)**, **Lin et al. (2023, Science)** — brought sequence-model pretraining into the field wholesale.
- **Computational chemistry.** Machine-learned interatomic potentials fit to quantum-chemistry calculations now run molecular dynamics at near-quantum accuracy for a tiny fraction of the cost, which changes which simulations are possible rather than merely making them faster.
- **Weather and climate.** GraphCast (**Lam et al., 2023, Science**) and neural general circulation models (**Kochkov et al., 2024, Nature**) have been benchmarked against operational physics-based systems, and forecasting centres have begun to evaluate and deploy learned models. Notably, the learned models are far cheaper to run, not merely competitive in accuracy.
- **Physics.** Neural-network quantum states (**Carleo and Troyer, 2017, Science**) represent many-body wavefunctions with networks; normalizing flows have been used to sample lattice field theories (**Albergo, Kanwar and Shanahan, 2019, Physical Review D**); reinforcement learning has controlled a real tokamak plasma (**Degrave et al., 2022, Nature**).
- **The tooling, which is the underrated one.** Automatic differentiation, GPU array programming and the habit of writing a simulator so that you can differentiate through it came out of deep-learning infrastructure and are now standard equipment across computational science.`,
    },
    {
      kind: 'fill',
      prompt: String.raw`Diffusion models borrowed the idea that a slowly-run corruption process has a reverse of the same form, from ___ thermodynamics. Flow matching borrowed the ___ formulation of optimal transport, in which a velocity field satisfies a continuity equation. Equivariant molecular networks borrowed ___ representations from group theory.`,
      bank: ['non-equilibrium', 'equilibrium', 'dynamic', 'static', 'irreducible', 'faithful'],
      answer: ['non-equilibrium', 'dynamic', 'irreducible'],
      why: String.raw`Each word is doing real work. Equilibrium thermodynamics has nothing to say about a process being driven; the static Kantorovich plan has no time axis to integrate along; and it is specifically the decomposition into irreducible pieces that tells you which tensor products are allowed.`,
    },
    {
      kind: 'explain',
      title: 'Where the analogies break',
      body: String.raw`Borrowed language outlives its justification, so it is worth being blunt about four cases.

- **"Diffusion models are physics."** The forward process is chosen because it has closed-form Gaussian marginals, not because data physically diffuses. No conservation law is imposed, the "temperature" in a sampler is a software knob, and nothing in the model obeys a thermodynamic constraint. The *mathematics* of diffusion transferred; the physics did not come with it.
- **"Neural networks work like brains."** Backpropagation requires each unit to know the weights of the units downstream of it — the weight-transport problem — which has no clear biological implementation. Brains learn continually and online, which is exactly what artificial networks [cannot do](@ml/frontier-open-problems). The analogy was a source of inspiration, not a source of constraints.
- **"Attention" in a transformer.** A softmax-weighted average over value vectors. The name is a metaphor, and as the previous lesson described, reading the weights as an explanation of the model's reasoning is contested at best.
- **The neural tangent kernel.** Exactly correct in its limit, and that limit describes a regime where no feature learning occurs. A theory can be true and still describe something other than the system you care about.

By contrast, one analogy is not a metaphor at all: the ELBO really is the variational free energy, derived from the same inequality. Knowing which is which saves a lot of confusion.`,
    },
    {
      kind: 'order',
      prompt: 'Order the historical steps by which a theorem about filtering became a way to generate images.',
      steps: [
        'Anderson (1982) proves that the time reversal of a diffusion is a diffusion whose drift contains the score',
        'Sohl-Dickstein et al. (2015) propose learning the reverse of a slow corruption process, borrowing the bridging idea from non-equilibrium thermodynamics',
        'Ho, Jain & Abbeel (2020) find a parameterisation and loss weighting that make the scheme work at image scale',
        'Song et al. (2021) show the discrete chain is a discretisation of an SDE, and apply Anderson’s reversal directly',
        'Karras et al. (2022) separate schedule, preconditioning, loss weighting and solver as independent design choices',
      ],
      why: String.raw`Note the nearly four-decade gap between the theorem and its use, and that the engineering breakthrough (2020) came *before* the clean theoretical framing (2021), not after. That ordering is common: the framework usually arrives to explain something that already works.`,
    },
    {
      kind: 'explain',
      title: 'Key takeaways',
      body: String.raw`- Diffusion models compose three borrowed results: a non-equilibrium bridging scheme (Sohl-Dickstein et al., 2015), Anderson's 1982 reverse-time SDE from control theory, and Tweedie's empirical-Bayes identity. The learning content is "fit a function".
- Flow matching is the Benamou–Brenier dynamic form of optimal transport, learned. Straight paths integrate in one step, which is why optimal-transport couplings matter — though minibatch optimal transport is a biased approximation of the real thing.
- Statistical physics gave both models (Hopfield networks, Boltzmann machines) and a style of analysis (typical-case rather than worst-case; infinite-width limits). The NTK limit is exact and describes a regime without feature learning; μP is the useful repair.
- Group theory gives exact symmetry by restricting the hypothesis class. It buys sample efficiency and exactness, costs compute, and its value at very large data scale is currently contested.
- Not every import works: the information-bottleneck compression story did not survive Saxe et al. (2018), largely because the borrowed quantity was hard to estimate in the new setting.
- Exports are now substantial: protein structure and design, interatomic potentials, operational weather forecasting, plasma control, and — most pervasively — differentiable programming as scientific infrastructure.`,
    },
  ],
  references: [
    { authors: 'J. Sohl-Dickstein, E. A. Weiss, N. Maheswaranathan & S. Ganguli', title: 'Deep Unsupervised Learning using Nonequilibrium Thermodynamics', year: 2015, venue: 'ICML', url: 'https://arxiv.org/abs/1503.03585' },
    { authors: 'J.-D. Benamou & Y. Brenier', title: 'A computational fluid mechanics solution to the Monge–Kantorovich mass transfer problem', year: 2000, venue: 'Numerische Mathematik 84, 375–393' },
    { authors: 'M. M. Bronstein, J. Bruna, T. Cohen & P. Veličković', title: 'Geometric Deep Learning: Grids, Groups, Graphs, Geodesics, and Gauges', year: 2021, venue: 'arXiv:2104.13478', url: 'https://arxiv.org/abs/2104.13478' },
    { authors: 'A. M. Saxe, Y. Bansal, J. Dapello, M. Advani, A. Kolchinsky, B. D. Tracey & D. D. Cox', title: 'On the Information Bottleneck Theory of Deep Learning', year: 2018, venue: 'ICLR', url: 'https://openreview.net/forum?id=ry_WPG-A-' },
    { authors: 'Y. Bahri, J. Kadmon, J. Pennington, S. S. Schoenholz, J. Sohl-Dickstein & S. Ganguli', title: 'Statistical Mechanics of Deep Learning', year: 2020, venue: 'Annual Review of Condensed Matter Physics 11, 501–528' },
  ],
} satisfies LessonContent;
