import type { LessonContent } from '../../types';

const TRAJ_SVG = `<svg viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg">
  <path d="M278,28 C238,72 206,62 164,104 C128,140 92,158 52,162" fill="none"
        stroke="var(--c4)" stroke-width="2" />
  <g stroke="var(--c3)" stroke-width="1" stroke-dasharray="4 3" opacity="0.85">
    <line x1="278" y1="28" x2="52" y2="162"><animate attributeName="opacity" values="0.2;1;0.2" dur="3s" begin="0s" repeatCount="indefinite"/></line>
    <line x1="206" y1="62" x2="52" y2="162"><animate attributeName="opacity" values="0.2;1;0.2" dur="3s" begin="0.6s" repeatCount="indefinite"/></line>
    <line x1="164" y1="104" x2="52" y2="162"><animate attributeName="opacity" values="0.2;1;0.2" dur="3s" begin="1.2s" repeatCount="indefinite"/></line>
    <line x1="112" y1="146" x2="52" y2="162"><animate attributeName="opacity" values="0.2;1;0.2" dur="3s" begin="1.8s" repeatCount="indefinite"/></line>
  </g>
  <g fill="var(--c4)">
    <circle cx="278" cy="28" r="4"/><circle cx="206" cy="62" r="4"/>
    <circle cx="164" cy="104" r="4"/><circle cx="112" cy="146" r="4"/>
  </g>
  <circle cx="52" cy="162" r="6" fill="var(--c1)"/>
  <g font-size="9" fill="var(--fg)">
    <text x="250" y="20">x_T</text>
    <text x="214" y="56">t₃</text>
    <text x="176" y="100">t₂</text>
    <text x="122" y="140">t₁</text>
    <text x="34" y="182">x_ε (data)</text>
    <text x="8" y="16" fill="var(--c4)">— probability-flow ODE trajectory</text>
    <text x="8" y="30" fill="var(--c3)">-- f(x, t): same endpoint from anywhere</text>
  </g>
</svg>`;

export default {
  cards: [
    {
      kind: 'explain',
      title: 'Ask the trajectory where it ends',
      body: String.raw`[Fast samplers](@ml/ddim-sampling) got diffusion from 1000 network calls to 10–50 by solving the probability-flow ODE better. But every solver has the same handicap: it only knows the *slope* at the current point, so it has to inch along the curve.

**Consistency models** (Song, Dhariwal, Chen & Sutskever, 2023) ask the network a different question. Instead of "which way does this trajectory go?", ask "**where does this trajectory end?**" Call that function $f(\mathbf x,t)$. If a network could answer it, generation would be one call: draw noise, ask, done.

The purple curve is one ODE trajectory. The dashed arrows are $f$: every point on the curve must be mapped to the *same* green endpoint.`,
      widget: { type: 'SvgDiagram', props: { svg: TRAJ_SVG } },
    },
    {
      kind: 'recall',
      title: 'Recall: the probability-flow ODE',
      points: [
        String.raw`A diffusion model defines a deterministic ODE whose marginals match the noising process: $\dfrac{d\mathbf x}{dt}=\dfrac{\mathbf x-D_\theta(\mathbf x;t)}{t}$ in the EDM parameterisation, where $D_\theta$ is the denoiser.`,
        String.raw`Solutions are unique, so trajectories never cross: each noise vector $\mathbf x_T$ has exactly one destination.`,
        String.raw`Running it from $t=T$ down to a small $\epsilon$ (never to exactly 0 — the score diverges) produces a sample.`,
        String.raw`DDIM is Euler on this ODE; Heun and DPM-Solver are better discretizations of the same curve.`,
      ],
      link: 'ml/score-sde',
    },
    {
      kind: 'explain',
      title: 'The consistency function',
      body: String.raw`Fix the ODE trajectory $\{\mathbf x_t\}_{t\in[\epsilon,T]}$ passing through a given point. Define
$$f(\mathbf x_t,t)=\mathbf x_\epsilon\quad\text{for every }t,$$
the map from any point on a trajectory to that trajectory's endpoint. Two properties define it:

1. **Self-consistency.** $f(\mathbf x_t,t)=f(\mathbf x_{t'},t')$ whenever $\mathbf x_t$ and $\mathbf x_{t'}$ lie on the same trajectory. (Hence the name — the model must agree with itself along a curve.)
2. **Boundary condition.** $f(\mathbf x_\epsilon,\epsilon)=\mathbf x_\epsilon$: at the bottom of the trajectory there is nothing left to do.

The boundary condition is what stops the trivial solution. Self-consistency alone is satisfied by $f\equiv\mathbf 0$, or by any constant — those are the collapse modes the training has to rule out, and pinning the value at $t=\epsilon$ does it.`,
    },
    {
      kind: 'explain',
      title: 'Building the boundary condition into the architecture',
      body: String.raw`Rather than hope the network learns $f(\mathbf x,\epsilon)=\mathbf x$, enforce it by construction, exactly as EDM preconditions its denoiser:
$$f_\theta(\mathbf x,t)=c_{\text{skip}}(t)\,\mathbf x+c_{\text{out}}(t)\,F_\theta(\mathbf x,t),$$
with $c_{\text{skip}}(\epsilon)=1$ and $c_{\text{out}}(\epsilon)=0$, so at $t=\epsilon$ the network's contribution is switched off and $f_\theta$ is the identity whatever $F_\theta$ says. Song et al. use
$$c_{\text{skip}}(t)=\frac{\sigma_{\text{data}}^2}{(t-\epsilon)^2+\sigma_{\text{data}}^2},\qquad c_{\text{out}}(t)=\frac{\sigma_{\text{data}}\,(t-\epsilon)}{\sqrt{\sigma_{\text{data}}^2+t^2}},$$
with $\sigma_{\text{data}}=0.5$ and $\epsilon=0.002$. At large $t$ the skip connection fades and the network does all the work; near $\epsilon$ it is almost a pass-through. $F_\theta$ can be any diffusion backbone, so the architecture is unchanged.`,
    },
    {
      kind: 'numeric',
      prompt: String.raw`With $\sigma_{\text{data}}=0.5$ and $\epsilon=0.002$, compute $c_{\text{skip}}(t)$ at $t=1$.`,
      answer: 0.2006,
      tolerance: 0.002,
      why: String.raw`$c_{\text{skip}}(1)=\dfrac{0.25}{(1-0.002)^2+0.25}=\dfrac{0.25}{0.99600+0.25}=\dfrac{0.25}{1.24600}\approx0.2006$. At $t=1$ only about a fifth of the output is the input passed through; by $t=\epsilon$ the same formula gives exactly 1, which is the boundary condition the parameterisation guarantees.`,
    },
    {
      kind: 'mcq',
      prompt: String.raw`Why is the boundary condition $f(\mathbf x_\epsilon,\epsilon)=\mathbf x_\epsilon$ essential rather than cosmetic?`,
      choices: [
        'Without it the ODE would have no unique solution.',
        'Without it the self-consistency objective is minimised by any constant function, including the zero map.',
        'Without it the model could not be conditioned on text.',
        'Without it the network would have the wrong number of parameters.',
      ],
      answer: 1,
      why: String.raw`Self-consistency only says "agree along a trajectory"; a function that returns the same vector everywhere agrees perfectly and generates nothing. Anchoring the value at $t=\epsilon$ to the input makes the only consistent solution the true endpoint map. Uniqueness of the ODE solution is a property of the ODE, not of $f$, and holds regardless.`,
    },
    {
      kind: 'widget',
      title: 'Consistency distillation: use a teacher to take one step',
      body: String.raw`Suppose you already have a trained diffusion model $\mathbf s_\phi$ — the teacher. Discretize $[\epsilon,T]$ into $t_1=\epsilon<\dots<t_N=T$ and train as follows.`,
      widget: {
        type: 'StepReveal',
        props: {
          steps: [
            String.raw`Draw data $\mathbf x$ and a random index $n$; form the noisy point $\mathbf x_{t_{n+1}}=\mathbf x+t_{n+1}\mathbf z$, $\mathbf z\sim\mathcal N(0,I)$.`,
            String.raw`Take **one** solver step of the teacher's ODE from $t_{n+1}$ down to $t_n$, giving $\hat{\mathbf x}^\phi_{t_n}$. The two points now sit (approximately) on one trajectory.`,
            String.raw`Loss: $\ \mathcal L_{\text{CD}}=\mathbb E\big[\lambda(t_n)\,d\big(f_\theta(\mathbf x_{t_{n+1}},t_{n+1}),\ f_{\theta^-}(\hat{\mathbf x}^\phi_{t_n},t_n)\big)\big]$ for a metric $d$ ($\ell_2$, $\ell_1$ or LPIPS).`,
            String.raw`$\theta^-$ is a **stop-gradient**, slowly-updated copy of $\theta$ (an exponential moving average). The target must not be differentiated, or the pair collapses onto each other.`,
            String.raw`Chaining the constraint down the grid, the boundary condition at $t_1=\epsilon$ propagates upward: the only consistent solution maps every point to its own trajectory's endpoint.`,
          ],
          notes: ['One noise level, one draw.', 'The teacher supplies the trajectory.', 'Only one teacher call per training step.', 'The usual bootstrapping safeguard.', 'Why an anchored chain beats a free-floating one.'],
        },
      },
    },
    {
      kind: 'truefalse',
      prompt: String.raw`In consistency distillation the target $f_{\theta^-}(\hat{\mathbf x}^\phi_{t_n},t_n)$ is treated as a constant: no gradient flows through it.`,
      answer: true,
      why: String.raw`The objective is a bootstrapped one — the model is its own target, as in temporal-difference learning. Differentiating both arms lets the network minimise the loss by making the two outputs drift together toward anything at all; the stop-gradient plus the EMA target keeps the target slow-moving and the boundary condition doing the anchoring.`,
    },
    {
      kind: 'explain',
      title: 'Consistency training: throw the teacher away',
      body: String.raw`The teacher is only used to guess the neighbouring point on the trajectory, which means it is only used to estimate a score. But there is a free unbiased estimate of that score. With $\mathbf x_t=\mathbf x+t\mathbf z$,
$$\nabla\log p_t(\mathbf x_t)=-\,\mathbb E\!\left[\frac{\mathbf x_t-\mathbf x}{t^2}\,\Big|\,\mathbf x_t\right],$$
and inside the expectation a *single* $(\mathbf x,\mathbf z)$ pair is already unbiased. So replace the two points by
$$\mathbf x_{t_{n+1}}=\mathbf x+t_{n+1}\mathbf z,\qquad \mathbf x_{t_n}=\mathbf x+t_n\mathbf z,$$
**the same $\mathbf x$ and the same $\mathbf z$**, and drop the teacher entirely. That is **consistency training (CT)**. Song et al. prove the CT objective differs from the CD objective by $o(\Delta t)$, so as the grid is refined the two agree — CT is a legitimate standalone generative model, not merely a distillation shortcut.

The catch: the two points lie on the same *conditional* line, not the same marginal trajectory, and that approximation is only good for small $\Delta t$. CT therefore needs a **curriculum**: start with few discretization steps $N$ (low variance, high bias) and increase $N$ during training.`,
    },
    {
      kind: 'widget',
      title: 'What the teacher is doing, and why few steps hurt it',
      body: String.raw`This is the deterministic sampler a consistency model is trying to replace. Keep $\eta=0$ and drag the step count down from 20 to 4: the trajectories are coarse chords of a curved path, and the endpoints drift off the data. A consistency model is trained to land where the *converged* trajectory lands, in one call — so its error has a completely different character from a solver's: not accumulated discretization drift, but regression error on a hard function.`,
      widget: { type: 'MlDdimEta', props: { dataset: 'moons', eta: 0, steps: 8, trails: 8 } },
    },
    {
      kind: 'match',
      prompt: 'Match each few-step method to the thing that defines it.',
      pairs: [
        ['Consistency distillation', 'Bootstrapped self-consistency along a pretrained teacher’s ODE trajectories'],
        ['Consistency training', 'The same objective with the teacher replaced by a single-sample score estimate'],
        ['Progressive distillation', 'Repeatedly halving the step count, one student generation per halving'],
        ['Reflow', 'Rewiring the noise–data coupling so the trajectories themselves become straight'],
      ],
      why: String.raw`Consistency methods learn the *endpoint map* directly; progressive distillation keeps learning a sampler but with bigger steps; [reflow](@ml/rectified-flow) changes the geometry of the trajectories instead of how they are traversed. Only consistency training needs no pretrained diffusion model at all.`,
    },
    {
      kind: 'explain',
      title: 'Two steps are much better than one',
      body: String.raw`A consistency model is not restricted to one call. **Multistep consistency sampling** alternates jumping and re-noising:
1. $\mathbf x\leftarrow f_\theta(\mathbf x_T,T)$ — a full jump to a clean estimate;
2. re-noise to an intermediate level, $\mathbf x\leftarrow\mathbf x+\sqrt{\tau_i^2-\epsilon^2}\,\mathbf z$;
3. jump again, $\mathbf x\leftarrow f_\theta(\mathbf x,\tau_i)$; repeat for a handful of $\tau$'s.

Each re-noising re-randomises the fine detail while keeping the coarse content, letting the next jump fix what the previous one blurred. Empirically the second step buys a large improvement and the gains then flatten — which is itself a diagnostic: it says the one-step map is still systematically wrong, not merely noisy.`,
    },
    {
      kind: 'order',
      prompt: 'Order the operations in two-step consistency sampling.',
      steps: [
        String.raw`Draw $\mathbf x\sim\mathcal N(0,T^2I)$`,
        String.raw`Jump to a clean estimate: $\mathbf x\leftarrow f_\theta(\mathbf x,T)$`,
        String.raw`Re-noise to an intermediate level $\tau$: $\mathbf x\leftarrow\mathbf x+\sqrt{\tau^2-\epsilon^2}\,\mathbf z$`,
        String.raw`Jump again: $\mathbf x\leftarrow f_\theta(\mathbf x,\tau)$`,
        String.raw`Output $\mathbf x$`,
      ],
      why: String.raw`The pattern is "denoise completely, then partially re-noise" — the same loop as [DDIM](@ml/ddim-sampling) with $\eta>0$, except that each denoise is a single jump to $t=\epsilon$ rather than a small step. Two network calls total, so NFE = 2.`,
    },
    {
      kind: 'explain',
      title: 'The gap, stated honestly',
      body: String.raw`Consistency models are genuinely fast and genuinely worse than their teachers at full budget. Four things are consistently reported and worth remembering.

- **One step trails many steps.** In the original paper, one-step consistency distillation reached FID 3.55 on CIFAR-10 and 6.20 on ImageNet 64×64, beating earlier distillation methods, but those numbers are still behind diffusion models sampled with tens of steps (see the paper's tables). Two-step sampling improves them but does not erase the gap.
- **Distillation beat training-from-scratch** in the 2023 paper. **Song & Dhariwal (2024)** then changed that with better techniques — dropping the EMA target, a Pseudo-Huber metric $\sqrt{\|\Delta\|^2+c^2}-c$ to tame outliers, improved noise-level weighting, and a curriculum on $N$ — making CT competitive with CD.
- **Diversity is a standing worry, not a uniform finding.** Few-step distilled models are often reported to lose some coverage relative to their teachers (more clearly for adversarial or heavily guided distillation than in the original CM tables), which is the kind of failure a single FID number hides — check precision/recall too ([evaluation](@ml/generative-evaluation)).
- **Training is delicate.** A bootstrapped objective with a moving target is sensitive to the metric $d$, the discretization curriculum and the EMA rate; continuous-time formulations were unstable until later work (Lu & Song, 2025) rebuilt the parameterisation and normalisation to scale them.

Meanwhile the practical impact is real: **latent consistency models** (Luo et al., 2023) distilled Stable-Diffusion-class models into 2–4 step samplers, and the LCM-LoRA variant made that distillation a small add-on rather than a full retrain.`,
    },
    {
      kind: 'fill',
      prompt: String.raw`A consistency model maps any point on an ODE trajectory to its ___ . The condition $f(\mathbf x_\epsilon,\epsilon)=\mathbf x_\epsilon$ rules out the ___ solution. Consistency ___ needs a pretrained teacher, while consistency ___ replaces it with a single-sample score estimate.`,
      bank: ['endpoint', 'midpoint', 'constant', 'linear', 'distillation', 'training', 'guidance'],
      answer: ['endpoint', 'constant', 'distillation', 'training'],
      why: String.raw`The endpoint is $\mathbf x_\epsilon$, the bottom of the trajectory. A constant map is perfectly self-consistent and perfectly useless, which is why the boundary condition is hard-wired into the architecture. CD queries a teacher ODE; CT exploits $\nabla\log p_t(\mathbf x_t)=-\mathbb E[(\mathbf x_t-\mathbf x)/t^2\mid\mathbf x_t]$, whose single-sample version needs no model.`,
    },
    {
      kind: 'multi',
      prompt: 'Which statements about consistency models are accurate? (Select all that apply.)',
      choices: [
        'The same trained model can be sampled in one step or in several, trading compute for quality.',
        'The training target is held fixed by a stop-gradient, making the objective a bootstrapped one.',
        'A consistency model evaluates the ODE solver internally at sampling time.',
        'One-step FID is typically worse than that of the multi-step teacher it was distilled from.',
      ],
      answers: [0, 1, 3],
      why: String.raw`Multistep sampling is jump-then-re-noise, which is why the same weights serve 1, 2 or 4 NFE. The stop-gradient is what keeps the bootstrap from collapsing. No solver runs at sampling time — that is the entire point; the solver appears only inside *distillation training*, and not at all in consistency training. The quality gap at one step is the standard caveat.`,
    },
    {
      kind: 'explain',
      title: 'Key takeaways',
      body: String.raw`- A **consistency function** $f(\mathbf x_t,t)=\mathbf x_\epsilon$ maps any point of a probability-flow ODE trajectory to that trajectory's endpoint — so generation is one network call.
- Self-consistency plus the **boundary condition** $f(\mathbf x_\epsilon,\epsilon)=\mathbf x_\epsilon$ pins down the function; the boundary condition is built into the architecture via $f_\theta=c_{\text{skip}}\mathbf x+c_{\text{out}}F_\theta$ with $c_{\text{skip}}(\epsilon)=1$, $c_{\text{out}}(\epsilon)=0$.
- **CD** gets neighbouring trajectory points from a teacher's ODE step; **CT** gets them from $\mathbf x+t_n\mathbf z$ and $\mathbf x+t_{n+1}\mathbf z$ with shared $\mathbf x,\mathbf z$, and needs no teacher.
- The loss is bootstrapped: EMA target, stop-gradient, careful metric and a curriculum on the number of discretization steps.
- **Multistep sampling** (jump, re-noise, jump) closes much of the gap at 2–4 NFE.
- Few-step quality still trails the full-budget teacher, and diversity may suffer — report more than one number.`,
    },
  ],
  references: [
    { authors: 'Y. Song, P. Dhariwal, M. Chen & I. Sutskever', title: 'Consistency Models', year: 2023, venue: 'ICML', url: 'https://arxiv.org/abs/2303.01469' },
    { authors: 'Y. Song & P. Dhariwal', title: 'Improved Techniques for Training Consistency Models', year: 2024, venue: 'ICLR', url: 'https://arxiv.org/abs/2310.14189' },
    { authors: 'S. Luo, Y. Tan, L. Huang, J. Li & H. Zhao', title: 'Latent Consistency Models: Synthesizing High-Resolution Images with Few-Step Inference', year: 2023, venue: 'arXiv:2310.04378', url: 'https://arxiv.org/abs/2310.04378' },
    { authors: 'C. Lu & Y. Song', title: 'Simplifying, Stabilizing and Scaling Continuous-Time Consistency Models', year: 2025, venue: 'ICLR', url: 'https://arxiv.org/abs/2410.11081' },
    { authors: 'T. Karras, M. Aittala, T. Aila & S. Laine', title: 'Elucidating the Design Space of Diffusion-Based Generative Models', year: 2022, venue: 'NeurIPS', url: 'https://arxiv.org/abs/2206.00364' },
  ],
} satisfies LessonContent;
