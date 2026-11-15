import type { LessonContent } from '../../types';

// Coefficient schedules, plotted against t on [0,1].
const LIN_A = '1-x';
const LIN_B = 'x';
const TRIG_A = 'cos(PI*x/2)';
const TRIG_B = 'sin(PI*x/2)';
const GAMMA = 'sqrt(2*x*(1-x))';

export default {
  cards: [
    {
      kind: 'explain',
      title: 'One line that contains all of them',
      body: String.raw`[DDPM](@ml/diffusion-models), the [score SDE](@ml/score-sde), [flow matching](@ml/flow-matching) and [rectified flow](@ml/rectified-flow) were invented from four different starting points — a variational bound, a time-reversed SDE, a continuity equation, a transport coupling. **Albergo and Vanden-Eijnden** noticed that all four build the same kind of object: a path of distributions defined by writing down an explicit random variable that interpolates the endpoints.

$$\mathbf x_t=\alpha_t\,\mathbf x_0+\beta_t\,\mathbf x_1+\gamma_t\,\mathbf z,\qquad \mathbf z\sim\mathcal N(0,I)\ \text{independent}.$$

That is the **stochastic interpolant**. Choose three scalar functions and you have chosen a generative model. Below: the linear choice (rectified flow) and the trigonometric one, plus a possible $\gamma_t$.`,
      widget: {
        type: 'FunctionPlot',
        props: {
          fns: [LIN_A, LIN_B, TRIG_A, GAMMA],
          x: [0, 1], y: [0, 1.1],
          labels: ['linear α', 'linear β', 'trig α', 'γ'],
          xLabel: 't', yLabel: 'coefficient',
        },
        caption: String.raw`Every curve obeys the same boundary conditions: $\alpha$ starts at 1 and ends at 0, $\beta$ does the reverse, and $\gamma=\sqrt{2t(1-t)}$ vanishes at both ends so the endpoints are exactly $\mathbf x_0$ and $\mathbf x_1$. The trigonometric $\beta_t=\sin(\tfrac{\pi t}{2})$ is omitted: it is the mirror image of the trig $\alpha$.`,
      },
    },
    {
      kind: 'recall',
      title: 'Recall: what flow matching gave us',
      points: [
        String.raw`A velocity field $\mathbf v_t(\mathbf x)$ transports $p_0$ to $p_1$ if it satisfies the continuity equation $\partial_tp_t+\nabla\cdot(p_t\mathbf v_t)=0$.`,
        String.raw`Defining $\mathbf x_t$ explicitly from $(\mathbf x_0,\mathbf x_1)$ makes a conditional target available in closed form.`,
        String.raw`Square-loss regression recovers a conditional expectation, so the learned field is $\mathbb E[\dot{\mathbf x}_t\mid\mathbf x_t]$ — no simulation during training.`,
        String.raw`Sampling integrates $\dot{\mathbf x}=\mathbf v_\theta(\mathbf x,t)$ from noise to data.`,
      ],
      link: 'ml/flow-matching',
    },
    {
      kind: 'explain',
      title: 'The definition, precisely',
      body: String.raw`Fix two distributions $\rho_0$ and $\rho_1$ on $\mathbb R^d$ and any coupling $(\mathbf x_0,\mathbf x_1)$ of them. Pick $\alpha,\beta,\gamma:[0,1]\to\mathbb R$, differentiable, with
$$\alpha_0=1,\ \alpha_1=0,\qquad \beta_0=0,\ \beta_1=1,\qquad \gamma_0=\gamma_1=0,\ \gamma_t>0 \text{ on } (0,1).$$
Then $\mathbf x_t=\alpha_t\mathbf x_0+\beta_t\mathbf x_1+\gamma_t\mathbf z$ satisfies $\mathbf x_0\big|_{t=0}\sim\rho_0$ and $\mathbf x_1\big|_{t=1}\sim\rho_1$ by construction. Write $\rho_t$ for its law.

Two vocabulary notes. If $\rho_0=\mathcal N(0,I)$ the interpolant is called **one-sided** — the base is already Gaussian and $\gamma_t\mathbf z$ is redundant. If both ends are data (image-to-image, say), it is **two-sided**, and then $\gamma_t\mathbf z$ earns its keep: it smooths $\rho_t$ so that a score exists even when both endpoints live on thin manifolds.`,
    },
    {
      kind: 'explain',
      title: 'Two things to learn, both by least squares',
      body: String.raw`Differentiate the interpolant: $\dot{\mathbf x}_t=\dot\alpha_t\mathbf x_0+\dot\beta_t\mathbf x_1+\dot\gamma_t\mathbf z$ — known exactly for each sampled triple. The **velocity** is its conditional expectation,
$$\mathbf b_t(\mathbf x)=\mathbb E\big[\dot\alpha_t\mathbf x_0+\dot\beta_t\mathbf x_1+\dot\gamma_t\mathbf z\ \big|\ \mathbf x_t=\mathbf x\big],$$
learned by minimising $\mathbb E\|\mathbf b_\theta(\mathbf x_t,t)-\dot{\mathbf x}_t\|^2$.

The **score** comes from the same samples, for free:
$$\nabla\log\rho_t(\mathbf x)=-\frac{1}{\gamma_t}\,\mathbb E\big[\mathbf z\mid\mathbf x_t=\mathbf x\big],$$
learned by regressing $\boldsymbol\eta_\theta(\mathbf x_t,t)$ onto $\mathbf z$ and dividing. One interpolant, two fields, two independent square losses — and neither needs an ODE solve.`,
    },
    {
      kind: 'widget',
      title: 'Why the conditional expectation is the right field',
      body: String.raw`The argument is three lines and it never mentions diffusion, bounds or likelihoods.`,
      widget: {
        type: 'StepReveal',
        props: {
          steps: [
            String.raw`For a test function $\varphi$, $\dfrac{d}{dt}\mathbb E\,\varphi(\mathbf x_t)=\mathbb E\big[\nabla\varphi(\mathbf x_t)\cdot\dot{\mathbf x}_t\big]$ — just the chain rule.`,
            String.raw`Condition on position (tower rule): $=\mathbb E\big[\nabla\varphi(\mathbf x_t)\cdot\mathbb E[\dot{\mathbf x}_t\mid\mathbf x_t]\big]=\int\nabla\varphi\cdot\mathbf b_t\,\rho_t\,d\mathbf x$.`,
            String.raw`Integrate by parts: $\int\varphi\,\partial_t\rho_t=-\int\varphi\,\nabla\cdot(\mathbf b_t\rho_t)$ for all $\varphi$, hence $\partial_t\rho_t+\nabla\cdot(\mathbf b_t\rho_t)=0$.`,
            String.raw`So the ODE $\dot{\mathbf X}=\mathbf b_t(\mathbf X)$ transports $\rho_0$ to $\rho_1$ exactly. The quadratic loss $\mathbb E\|\mathbf b_\theta-\dot{\mathbf x}_t\|^2$ has $\mathbf b_t$ as its unique minimiser, so regression on the *known* $\dot{\mathbf x}_t$ learns it.`,
            String.raw`Nothing used Gaussianity of $\rho_0$, a Markov chain, or a likelihood bound. Only: the interpolant is explicit, so $\dot{\mathbf x}_t$ is explicit.`,
          ],
          notes: ['', 'The same tower-rule move as in conditional flow matching.', '', 'Transport, from scratch.', 'This is the unification.'],
        },
      },
    },
    {
      kind: 'numeric',
      prompt: String.raw`The trigonometric one-sided interpolant $x_t=\cos(\tfrac{\pi t}{2})x_0+\sin(\tfrac{\pi t}{2})x_1$ (with $\gamma\equiv0$). For the pair $x_0=2$, $x_1=-1$, what is $\dot x_t$ at $t=\tfrac13$?`,
      answer: -2.9311,
      tolerance: 0.01,
      why: String.raw`$\dot x_t=-\tfrac{\pi}{2}\sin(\tfrac{\pi t}{2})x_0+\tfrac{\pi}{2}\cos(\tfrac{\pi t}{2})x_1$. At $t=\tfrac13$ the angle is $\pi/6$, so $\sin=0.5$ and $\cos=\tfrac{\sqrt3}{2}\approx0.8660$, giving $\tfrac{\pi}{2}\big(-0.5\cdot2+0.8660\cdot(-1)\big)=\tfrac{\pi}{2}(-1.8660)\approx-2.9311$. Unlike the linear interpolant, the conditional velocity now depends on $t$ — the paths are curved even before any averaging.`,
    },
    {
      kind: 'mcq',
      prompt: 'What makes the regression target in a stochastic interpolant available without simulating anything?',
      choices: [
        'The forward process is a Markov chain whose transition kernel is Gaussian.',
        'x_t is written as an explicit algebraic function of samples we can draw, so its time derivative is an explicit function of the same samples.',
        'The ODE is solved once at initialisation and cached.',
        'The score is assumed to be zero at t = 0 and t = 1.',
      ],
      answer: 1,
      why: String.raw`Because $\mathbf x_t=\alpha_t\mathbf x_0+\beta_t\mathbf x_1+\gamma_t\mathbf z$ is a formula, $\dot{\mathbf x}_t=\dot\alpha_t\mathbf x_0+\dot\beta_t\mathbf x_1+\dot\gamma_t\mathbf z$ is also a formula — evaluate both on a drawn triple and you have an input–target pair. No Markov assumption is used anywhere, and nothing is solved or cached; the score is generally non-zero throughout.`,
    },
    {
      kind: 'explain',
      title: 'From one interpolant, a whole family of samplers',
      body: String.raw`Having both $\mathbf b_t$ and the score $\mathbf s_t=\nabla\log\rho_t$ unlocks a one-parameter family of samplers that all share the marginals $\rho_t$. For any non-negative $\varepsilon(t)$,
$$d\mathbf X_t=\big[\mathbf b_t(\mathbf X_t)+\varepsilon(t)\,\mathbf s_t(\mathbf X_t)\big]dt+\sqrt{2\varepsilon(t)}\,d\mathbf W_t .$$
Check the extremes: $\varepsilon\equiv0$ is the probability-flow ODE $\dot{\mathbf X}=\mathbf b_t(\mathbf X)$; larger $\varepsilon$ adds a Langevin-like push toward high density plus matching noise, and the two contributions cancel in the Fokker–Planck equation exactly as they did in the [score SDE](@ml/score-sde).

Why bother? Noise is **self-correcting**: a sample that drifts off $\rho_t$ through error gets pulled back toward high density, so with a generous step budget stochastic samplers can reach better quality (as in the [score SDE](@ml/score-sde) and [DDIM](@ml/ddim-sampling) lessons, they degrade faster than the ODE when steps are few). The ODE wins on determinism, invertibility, exact likelihoods and few-step efficiency.`,
      widget: { type: 'MlSdeOdePaths', props: { show: 'both', paths: 14 }, caption: String.raw`The $\varepsilon=0$ and $\varepsilon>0$ ends of the family on a 1-D mixture: same marginals at every time, completely different paths.` },
    },
    {
      kind: 'truefalse',
      prompt: String.raw`Changing $\varepsilon(t)$ changes the distribution of the samples the model produces at $t=1$.`,
      answer: false,
      why: String.raw`Every member of the family induces the same Fokker–Planck equation for $\rho_t$, so with the *exact* $\mathbf b_t$ and $\mathbf s_t$ the law at each time — including $t=1$ — is identical in exact arithmetic (with learned, imperfect fields the members differ in how errors accumulate). What changes is the *path* taken, hence the sensitivity to discretization error and the behaviour at small step counts. Individual trajectories, and the noise-to-sample map, differ completely.`,
    },
    {
      kind: 'explain',
      title: 'Diffusion and flow matching as two settings of the dial',
      body: String.raw`Take $\rho_0=\mathcal N(0,I)$, so the interpolant is one-sided and we may absorb $\gamma_t\mathbf z$ into $\alpha_t\mathbf x_0$.

- $\alpha_t=1-t$, $\beta_t=t$: the straight interpolant. Velocity target $\mathbf x_1-\mathbf x_0$. This is flow matching / rectified flow.
- $\alpha_t=\sqrt{1-\bar\alpha(t)}$, $\beta_t=\sqrt{\bar\alpha(t)}$ for the VP schedule $\bar\alpha$: the DDPM marginals, exactly. (Here $t=0$ is pure noise, so $\bar\alpha(0)=0$: time is reversed relative to the score-SDE lesson, and DDPM's $\bar\alpha$ only approximately reaches 0.) Its probability-flow ODE is the one the score SDE derives, and the noise-regression target plays the role of DDPM's $\boldsymbol\varepsilon_\theta$.
- $\alpha_t=\cos(\tfrac{\pi t}{2})$, $\beta_t=\sin(\tfrac{\pi t}{2})$: variance-preserving for Gaussian endpoints, since $\alpha_t^2+\beta_t^2=1$.

The point is not that these are equivalent models — they are not, the paths and the learned functions differ — but that the *design space* is three scalar functions, and the training recipe never changes.`,
    },
    {
      kind: 'match',
      prompt: 'Match each object in the interpolant framework to its role.',
      pairs: [
        [String.raw`$\alpha_t,\beta_t$`, 'Boundary-respecting schedule that decides the shape of the probability path'],
        [String.raw`$\gamma_t\mathbf z$`, 'Extra Gaussian smoothing, essential when neither endpoint is Gaussian'],
        [String.raw`$\mathbf b_t(\mathbf x)=\mathbb E[\dot{\mathbf x}_t\mid\mathbf x_t=\mathbf x]$`, 'Velocity field solving the continuity equation for ρ_t'],
        [String.raw`$\varepsilon(t)$`, 'Sampler-side noise level; zero gives the ODE, positive gives an SDE with the same marginals'],
      ],
      why: String.raw`The first three are model-side: they define $\rho_t$ and the field that transports it. $\varepsilon(t)$ is chosen after training and changes only the trajectories, not the marginals — which is why one trained pair $(\mathbf b_\theta,\boldsymbol\eta_\theta)$ supports many samplers.`,
    },
    {
      kind: 'explain',
      title: 'What you get that diffusion did not give you',
      body: String.raw`Classical diffusion needs the base to be the Gaussian that the forward noising process converges to. An interpolant has no forward process, so $\rho_0$ can be **anything you can sample**:

- **Image-to-image and translation.** Set $\rho_0$ to one data distribution and $\rho_1$ to another; the two-sided interpolant with $\gamma_t>0$ transports between them directly, with no detour through noise.
- **Informative priors.** Start from a blurred, downsampled or physically-simulated version of the target instead of white noise, which shortens the distance the model must cover.
- **Data-dependent couplings.** The pairing $(\mathbf x_0,\mathbf x_1)$ is free, so paired data (a photo and its sketch) can be coupled directly — the same lever [reflow](@ml/rectified-flow) and minibatch OT pull, used for conditioning instead of for straightness.

The flip side is that two-sided interpolants genuinely need the $\gamma_t\mathbf z$ term, and the score blows up like $1/\gamma_t$ near the endpoints, so the choice of $\gamma$ is a real design decision rather than a formality.`,
    },
    {
      kind: 'fill',
      prompt: String.raw`In $\mathbf x_t=\alpha_t\mathbf x_0+\beta_t\mathbf x_1+\gamma_t\mathbf z$, the boundary conditions require $\alpha_1=$ ___ and $\beta_1=$ ___ . The learned velocity is the conditional expectation of ___ given $\mathbf x_t$, and the score is recovered from the conditional expectation of ___ .`,
      bank: ['0', '1', 'ẋ_t', 'x_t', 'z', 'α_t'],
      answer: ['0', '1', 'ẋ_t', 'z'],
      why: String.raw`At $t=1$ the interpolant must reduce to $\mathbf x_1$, so $\alpha_1=0$, $\beta_1=1$ and $\gamma_1=0$. Regressing on the known derivative gives $\mathbf b_t=\mathbb E[\dot{\mathbf x}_t\mid\mathbf x_t]$; regressing on the latent noise gives $\mathbb E[\mathbf z\mid\mathbf x_t]$, and $\nabla\log\rho_t=-\mathbb E[\mathbf z\mid\mathbf x_t]/\gamma_t$.`,
    },
    {
      kind: 'order',
      prompt: 'Order the steps of building a generative model from a stochastic interpolant.',
      steps: [
        String.raw`Choose $\rho_0$, $\rho_1$ and a coupling of them`,
        String.raw`Choose schedules $\alpha_t,\beta_t,\gamma_t$ satisfying the boundary conditions`,
        String.raw`Draw $(\mathbf x_0,\mathbf x_1,\mathbf z,t)$ and form $\mathbf x_t$ and $\dot{\mathbf x}_t$`,
        String.raw`Fit $\mathbf b_\theta$ to $\dot{\mathbf x}_t$ and $\boldsymbol\eta_\theta$ to $\mathbf z$ by square loss`,
        String.raw`Choose $\varepsilon(t)$ and integrate the corresponding ODE or SDE from $\rho_0$ to $t=1$`,
      ],
      why: String.raw`Modelling decisions (endpoints, coupling, schedule) come first and fix the probability path; training is pure regression on explicitly computable targets; the sampler is picked last, after the weights exist, which is exactly why one model supports many samplers.`,
    },
    {
      kind: 'multi',
      prompt: 'Which are genuine consequences of the stochastic-interpolant viewpoint? (Select all that apply.)',
      choices: [
        'The base distribution need not be Gaussian, so the model can transport between two data distributions.',
        'Velocity and score are two regressions on the same samples, each available in closed form as a target.',
        'The framework removes the need to integrate anything at sampling time.',
        'Diffusion-model marginals and flow-matching paths are both instances of one interpolant family, differing in the coefficient functions.',
      ],
      answers: [0, 1, 3],
      why: String.raw`Arbitrary endpoints and the twin regressions are the two headline gains, and the shared-family view is the unification — of the path construction, not of loss weightings, parameterisations or samplers, which still differ. Sampling still integrates an ODE or SDE — getting to one step needs distillation or [consistency models](@ml/consistency-models), which are a separate idea layered on top.`,
    },
    {
      kind: 'explain',
      title: 'Caveats worth stating',
      body: String.raw`The framework unifies the *construction* of these models, not their *performance*. Three honest limits:

1. **Unification is not equivalence.** Two interpolants with the same endpoints give different $\rho_t$, different learning problems and different sample quality. Which schedule works best remains empirical.
2. **Endpoint singularities.** With $\gamma_t\to0$ at the ends, $\nabla\log\rho_t\sim1/\gamma_t$ diverges; training and sampling are usually truncated to $t\in[\delta,1-\delta]$, exactly as diffusion models truncate near $t=0$.
3. **The hard parts survive.** Architecture, conditioning, guidance and compute dominate real results. The interpolant view tells you what you are free to change, not what to change it to.`,
    },
    {
      kind: 'explain',
      title: 'Key takeaways',
      body: String.raw`- A **stochastic interpolant** is an explicit random variable $\mathbf x_t=\alpha_t\mathbf x_0+\beta_t\mathbf x_1+\gamma_t\mathbf z$ joining any two distributions.
- Because $\mathbf x_t$ is a formula, $\dot{\mathbf x}_t$ is a formula: the velocity $\mathbf b_t=\mathbb E[\dot{\mathbf x}_t\mid\mathbf x_t]$ and the score $-\mathbb E[\mathbf z\mid\mathbf x_t]/\gamma_t$ are both learned by plain square-loss regression, simulation-free.
- The chain rule plus the tower rule plus integration by parts gives the continuity equation — the whole theory, with no SDE, bound or Markov chain.
- One trained model, a family of samplers: $d\mathbf X=[\mathbf b+\varepsilon\mathbf s]dt+\sqrt{2\varepsilon}\,d\mathbf W$ shares the marginals for every $\varepsilon(t)\ge0$.
- Special cases: linear $\alpha,\beta$ is rectified flow; $\sqrt{1-\bar\alpha},\sqrt{\bar\alpha}$ is DDPM; two-sided interpolants do image-to-image without passing through noise.`,
    },
  ],
  references: [
    { authors: 'M. S. Albergo & E. Vanden-Eijnden', title: 'Building Normalizing Flows with Stochastic Interpolants', year: 2023, venue: 'ICLR', url: 'https://arxiv.org/abs/2209.15571' },
    { authors: 'M. S. Albergo, N. M. Boffi & E. Vanden-Eijnden', title: 'Stochastic Interpolants: A Unifying Framework for Flows and Diffusions', year: 2023, venue: 'arXiv:2303.08797', url: 'https://arxiv.org/abs/2303.08797' },
    { authors: 'M. S. Albergo, M. Goldstein, N. M. Boffi, R. Ranganath & E. Vanden-Eijnden', title: 'Stochastic Interpolants with Data-Dependent Couplings', year: 2024, venue: 'ICML', url: 'https://arxiv.org/abs/2310.03725' },
    { authors: 'Y. Lipman, M. Havasi, P. Holderrieth, N. Shaul, M. Le, B. Karrer, R. T. Q. Chen, D. Lopez-Paz, H. Ben-Hamu & I. Gat', title: 'Flow Matching Guide and Code', year: 2024, venue: 'arXiv:2412.06264', url: 'https://arxiv.org/abs/2412.06264' },
    { authors: 'Y. Song, J. Sohl-Dickstein, D. P. Kingma, A. Kumar, S. Ermon & B. Poole', title: 'Score-Based Generative Modeling through Stochastic Differential Equations', year: 2021, venue: 'ICLR', url: 'https://arxiv.org/abs/2011.13456' },
  ],
} satisfies LessonContent;
