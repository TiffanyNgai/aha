import type { LessonContent } from '../../types';

// DeepONet: branch reads the input function, trunk reads the query point.
const DEEPONET_SVG = `<svg viewBox="0 0 320 175" xmlns="http://www.w3.org/2000/svg">
<defs><marker id="do" viewBox="0 0 6 6" refX="5" refY="3" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="var(--muted)"/></marker></defs>
<rect x="8" y="24" width="86" height="34" rx="4" fill="var(--c2)" fill-opacity="0.18" stroke="var(--c2)" stroke-width="0.9"/>
<text x="51" y="38" font-size="9" text-anchor="middle" fill="var(--fg)">u sampled at</text>
<text x="51" y="50" font-size="9" text-anchor="middle" fill="var(--fg)">fixed sensors x₁…x_m</text>
<rect x="8" y="104" width="86" height="28" rx="4" fill="var(--c4)" fill-opacity="0.18" stroke="var(--c4)" stroke-width="0.9"/>
<text x="51" y="122" font-size="9" text-anchor="middle" fill="var(--fg)">query point y</text>
<rect x="116" y="26" width="70" height="30" rx="4" fill="var(--surface)" stroke="var(--c2)" stroke-width="1.1"/>
<text x="151" y="45" font-size="9.5" text-anchor="middle" fill="var(--fg)">branch net</text>
<rect x="116" y="103" width="70" height="30" rx="4" fill="var(--surface)" stroke="var(--c4)" stroke-width="1.1"/>
<text x="151" y="122" font-size="9.5" text-anchor="middle" fill="var(--fg)">trunk net</text>
<line x1="95" y1="41" x2="113" y2="41" stroke="var(--muted)" stroke-width="1" marker-end="url(#do)"/>
<line x1="95" y1="118" x2="113" y2="118" stroke="var(--muted)" stroke-width="1" marker-end="url(#do)"/>
<text x="206" y="45" font-size="9" fill="var(--c2)">b ∈ ℝᵖ</text>
<text x="206" y="122" font-size="9" fill="var(--c4)">t ∈ ℝᵖ</text>
<line x1="188" y1="41" x2="246" y2="72" stroke="var(--muted)" stroke-width="1" marker-end="url(#do)"/>
<line x1="188" y1="118" x2="246" y2="88" stroke="var(--muted)" stroke-width="1" marker-end="url(#do)"/>
<circle cx="258" cy="80" r="12" fill="var(--surface)" stroke="var(--fg)" stroke-width="1"/>
<text x="258" y="84" font-size="11" text-anchor="middle" fill="var(--fg)">·</text>
<line x1="271" y1="80" x2="286" y2="80" stroke="var(--muted)" stroke-width="1" marker-end="url(#do)"/>
<text x="292" y="76" font-size="9" fill="var(--fg)">G(u)(y)</text>
<text x="160" y="152" font-size="8.5" text-anchor="middle" fill="var(--fg)">G(u)(y) ≈ Σ_{k=1}^{p} b_k(u(x₁),…,u(x_m)) · t_k(y)</text>
<text x="160" y="166" font-size="8" text-anchor="middle" fill="var(--muted)">The trunk learns a basis of functions; the branch learns the coefficients for this particular input.</text>
</svg>`;

export default {
  cards: [
    {
      kind: 'explain',
      title: 'Learn the solver, not the solution',
      body: String.raw`A weather model, a reservoir simulation, an aerodynamics study: each one solves the same partial differential equation again and again, with a different initial condition, a different coefficient field, a different boundary. Each solve takes hours on a cluster. The *equation* never changes — only the input function does.

So learn the map itself. Not "what is the temperature at this point", but

$$\mathcal G:\ a\ \longmapsto\ u,$$

a map whose **input is a function** (the initial condition, the permeability field) and whose **output is a function** (the solution). This is an **operator**, and a network trained to approximate one is a **neural operator**.

The prize is large: once trained, evaluating a neural operator is a single forward pass, which in the settings reported for Fourier neural operators was orders of magnitude faster than the numerical solver that generated the training data. The challenge is that the objects being mapped are infinite-dimensional, and a neural network only ever sees finitely many numbers.`,
    },
    {
      kind: 'recall',
      title: 'Operators between function spaces',
      points: [
        'A **function space** such as $L^2(D)$ or $C(D)$ has functions as its points; it is a vector space, usually infinite-dimensional.',
        'An **operator** maps functions to functions: differentiation $u\\mapsto u\'$, integration, convolution with a kernel, or the solution map of a PDE.',
        'The solution operator of a linear PDE is often an integral operator, $u(x)=\\int_D G(x,y)\\,a(y)\\,dy$, with $G$ the **Green\u2019s function**.',
        'A **discretization** replaces a function by its values on a mesh. The underlying operator does not depend on the mesh; a numerical scheme approximating it does.',
      ],
      link: 'math/operator-learning-intro',
    },
    {
      kind: 'explain',
      title: 'Why a CNN is not an operator',
      body: String.raw`The obvious thing to try is to sample the input function on a $64\times64$ grid, call the result an image, and train a [U-Net](@ml/unet-dense-prediction). This often works well — and it is not an operator.

What goes wrong is **resolution**. Such a network is a map $\mathbb R^{64\times64}\to\mathbb R^{64\times64}$. Hand it data on a $128\times128$ grid and the weights do not even have the right shape; interpolate to make them fit and the accuracy degrades, because the learned kernel has a width measured in *pixels*, not in *metres*. Train at one resolution and you have a model for that resolution.

A genuine neural operator is required to be **discretization-invariant**:

> the model is defined on functions, and sampling the input on any sufficiently fine mesh gives the same answer, up to discretization error — the *same weights*, on any mesh.

That single requirement is the dividing line, and it has real consequences: train on cheap coarse data, evaluate on a fine mesh (**zero-shot super-resolution**); handle irregular meshes; compare models across resolutions honestly.`,
    },
    {
      kind: 'mcq',
      prompt: 'What does "discretization invariance" require of a neural operator?',
      choices: [
        'The same trained weights can be applied at any mesh resolution, and the outputs converge as the mesh is refined',
        'The model gives identical predictions no matter how coarse the mesh, with no error at all',
        'The model must be retrained whenever the mesh changes, but the architecture stays the same',
        'The model must use a fixed number of grid points, chosen before training',
      ],
      answer: 0,
      why: String.raw`The point is that the weights parameterize an operator on functions, not a matrix on a particular grid — so they transfer across meshes and the predictions approach a limit as the mesh is refined. Discretization error does not vanish on a coarse mesh; the claim is about convergence, not perfection. Needing retraining per mesh, or a fixed grid size, is exactly the property a neural operator is designed not to have.`,
    },
    {
      kind: 'explain',
      title: 'DeepONet: branch and trunk',
      body: String.raw`The first widely used design comes from an old theorem. Chen & Chen (1995) proved a universal approximation result for *operators*: any continuous operator on a compact set of input functions can be approximated arbitrarily well (existence only: the theorem gives no rate and no bound on the number of sensors $m$ or the width $p$ needed) in the form

$$\mathcal G(a)(y)\ \approx\ \sum_{k=1}^{p}b_k\big(a(x_1),\dots,a(x_m)\big)\,t_k(y),$$

where the $x_i$ are fixed **sensor** locations where the input function is sampled. Lu et al. (2021) turned it into an architecture, **DeepONet**.

- The **branch net** reads the $m$ sensor values of the input function and outputs $p$ coefficients $b_1,\dots,b_p$.
- The **trunk net** reads a single query location $y$ and outputs $p$ values $t_1(y),\dots,t_p(y)$.
- The prediction at $y$ is their dot product.

The structure is a learned separation of variables. The trunk learns a **basis of functions** on the output domain, shared across all inputs; the branch learns the **coefficients** in that basis for the particular input at hand. Because $y$ is an argument rather than an index, the output can be queried at *any* point, on any mesh, at any resolution — an irregular output mesh costs nothing.

The input side is less flexible: the sensor locations $x_i$ are fixed at training time, so the input discretization is not free.`,
      widget: { type: 'SvgDiagram', props: { svg: DEEPONET_SVG } },
    },
    {
      kind: 'numeric',
      prompt: String.raw`A DeepONet with $p=4$ produces branch outputs $b=(2,\,-1,\,0.5,\,3)$ for a given input function, and trunk outputs $t=(1,\,0.5,\,-2,\,0.25)$ at the query point $y$. What does the model predict at $y$?`,
      answer: 1.25,
      tolerance: 0.005,
      why: String.raw`The prediction is the dot product $\sum_k b_kt_k = 2(1)+(-1)(0.5)+0.5(-2)+3(0.25)=2-0.5-1+0.75=1.25$. Note that only the trunk depends on $y$: to evaluate the same input function at a thousand output points you reuse one branch pass and run the trunk a thousand times, which is why DeepONet evaluation is so cheap.`,
    },
    {
      kind: 'explain',
      title: 'Operators as learned integral kernels',
      body: String.raw`The second design starts from what solution operators actually look like. For a linear PDE, the solution is an integral against a Green's function, $u(x)=\int_D G(x,y)a(y)\,dy$. So build a layer that *is* a kernel integral, with a learned kernel, and stack several with nonlinearities between them to handle the nonlinear case:

$$v_{t+1}(x)=\sigma\Big(W v_t(x)+\int_D \kappa_\theta(x,y)\,v_t(y)\,dy\Big).$$

The local term $Wv_t(x)$ is a pointwise linear map; the integral term is the non-local part that lets information travel across the whole domain in one layer — unlike a convolution, whose reach grows only with depth.

This is discretization-invariant by construction: an integral is approximated by a quadrature rule on whatever mesh you have, and refining the mesh refines the approximation without touching $\kappa_\theta$.

The catch is cost. Evaluated naively on $N$ mesh points the integral costs $O(N^2)$. Different ways of making it affordable give different members of the family: graph neural operators restrict the kernel to a local neighbourhood, multipole methods use a hierarchy of scales, and the **Fourier neural operator** takes the most elegant route of all.`,
    },
    {
      kind: 'explain',
      title: 'FNO: convolve by multiplying',
      body: String.raw`Assume the kernel is **translation-invariant**, $\kappa_\theta(x,y)=\kappa_\theta(x-y)$. Then the integral is a convolution, and the convolution theorem applies: convolution in space is **pointwise multiplication** in [Fourier space](@math/fourier-series).

The Fourier neural operator layer (Li et al., 2021) is therefore:

1. Take the discrete Fourier transform of $v_t$ (an FFT, $O(N\log N)$).
2. **Keep only the lowest $k_{\max}$ modes** and discard the rest.
3. Multiply each kept mode $k$ by a learned complex matrix $R_k$ — one per mode, acting across channels.
4. Inverse transform, add the pointwise term $Wv_t(x)$, and apply a nonlinearity.

Two properties fall out, and both matter.

**Global receptive field in one layer.** Every Fourier mode spans the whole domain, so a single layer couples every point to every other — no stack of local convolutions required.

**Discretization invariance.** The learned parameters are the $R_k$, indexed by *mode number*, not by grid position. Their count is $k_{\max}$, chosen by you, and completely independent of $N$. Resample the input on a finer grid and the same $R_k$ apply unchanged — which is exactly why an FNO trained at low resolution can be evaluated at high resolution.

Truncating the modes is also a deliberate low-pass regularizer: it keeps the parameter count small and smooths the output, at the cost of fine-scale detail and sharp features such as shocks.`,
    },
    {
      kind: 'widget',
      title: 'One spectral layer, live',
      body: String.raw`The grey dashed curve is the input function, sampled at $N$ points (the orange dots); the blue curve is the layer's output. The bars show each kept Fourier coefficient before and after multiplication by its learned weight.

Two experiments.
- Slide **grid points N** up and down with the band-limited input. Once $N$ is large enough to resolve the kept modes, the output curve does not move and the error against a dense reference is essentially zero — **discretization invariance**, visible. Drop $N$ too low and aliasing corrupts the coefficients.
- Change **modes kept $k_{\max}$**. The parameter count printed at the bottom follows $k_{\max}$ and ignores $N$ entirely. Switch to the input with an extra mode at $k=11$ and watch that component vanish from the output: anything above the cutoff is simply not representable.`,
      widget: { type: 'MlFourierLayer', props: { n: 24, kmax: 4, input: 'smooth' }, caption: 'Parameters scale with the number of modes, not with the size of the mesh.' },
    },
    {
      kind: 'order',
      prompt: 'Put one Fourier neural operator layer in order.',
      steps: [
        'Apply an FFT to the current feature function $v_t$ sampled on the mesh',
        'Truncate to the lowest $k_{\\max}$ Fourier modes, discarding the rest',
        'Multiply each retained mode by its own learned complex weight matrix $R_k$',
        'Apply an inverse FFT to return to physical space',
        'Add the pointwise linear term $Wv_t(x)$ and apply the nonlinearity',
      ],
      why: 'The spectral path is the non-local part of the kernel integral and the pointwise term is the local part; they are added before the nonlinearity, in the same way a residual branch is added to a skip connection. Truncating before multiplying is what keeps the parameter count tied to $k_{\\max}$ rather than to the mesh.',
    },
    {
      kind: 'truefalse',
      prompt: 'An FNO trained on data sampled at $64\\times64$ can be evaluated on a $256\\times256$ grid without retraining.',
      answer: true,
      why: String.raw`The learned weights $R_k$ are indexed by Fourier mode, not by grid point, so they transfer directly: the FFT is simply taken on the finer grid and the same modes are multiplied. This "zero-shot super-resolution" is the headline demonstration of discretization invariance. It is not magic, though — the extra resolution reveals only the frequencies below $k_{\max}$ that the model actually learned, and genuinely fine-scale structure is not recovered.`,
    },
    {
      kind: 'match',
      prompt: 'Match each architecture to how it represents the operator.',
      pairs: [
        ['DeepONet', 'A learned basis from the trunk, with coefficients from the branch'],
        ['Fourier neural operator', 'A translation-invariant kernel, applied by multiplying truncated Fourier modes'],
        ['Graph neural operator', 'A kernel integral restricted to a local neighbourhood on a mesh graph'],
        ['A plain U-Net on gridded data', 'A fixed-size map between arrays, tied to the resolution it was trained at'],
      ],
      why: 'Every neural operator is a way of making a kernel integral affordable while keeping it defined on functions. The U-Net is the control case: excellent in practice at one resolution, but a map between vectors rather than between function spaces, so nothing transfers across meshes.',
    },
    {
      kind: 'multi',
      prompt: 'Which of these are real limitations of the standard FNO? (Select all that apply.)',
      choices: [
        'Mode truncation smooths away sharp features such as shocks and discontinuities',
        'The plain version assumes a regular, periodic grid, so complex geometries need extra machinery',
        'Errors accumulate when the model is rolled out autoregressively over long time horizons',
        'The number of learned parameters grows with the number of mesh points',
      ],
      answers: [0, 1, 2],
      why: String.raw`Keeping only low modes is a low-pass filter, which is a feature for smooth solutions and a problem for shocks. The FFT wants a uniform periodic grid, so irregular domains need coordinate transforms, padding, or a geometry-aware variant. Long rollouts drift, as they do for every learned surrogate. The parameter count is the one thing that does *not* grow with the mesh: it is set by $k_{\max}$ and the channel width, which is the whole point.`,
    },
    {
      kind: 'explain',
      title: 'How they are actually used',
      body: String.raw`- **Surrogates inside a loop.** The real win is not one solve but thousands: uncertainty quantification, design optimization, inverse problems, ensemble forecasting. A surrogate that is slightly less accurate but vastly faster changes which questions can be asked.
- **Weather and climate.** Data-driven medium-range forecast models — FourCastNet among them — grew directly out of this line of work and run a forecast in a fraction of the time taken by a numerical model.
- **Hybrid schemes.** Use the operator as a coarse propagator or a preconditioner and keep a classical solver for correction, so the accuracy guarantee comes from numerics and the speed from the network.
- **Physics-informed training.** Add the PDE residual to the loss (as in physics-informed neural networks) to train with less labelled data and enforce the equation, not just the samples.
- **The honest caveat.** A neural operator interpolates within the distribution of inputs it was trained on. It carries no convergence guarantee and no error bound, so out-of-distribution coefficients, boundary conditions or Reynolds numbers are where these models fail — and they fail without warning.`,
    },
    {
      kind: 'fill',
      prompt: String.raw`A neural operator maps a function to a function, and its defining property is ___ invariance: the same weights apply at any mesh resolution. DeepONet splits the job into a ___ net reading the input function at fixed sensors and a ___ net reading the query point. An FNO instead applies a kernel integral by keeping the lowest ___ modes and multiplying each by a learned weight, so its parameter count is independent of the number of ___ points.`,
      bank: ['discretization', 'branch', 'trunk', 'Fourier', 'spatial', 'mesh', 'rotation'],
      answer: ['discretization', 'branch', 'trunk', 'Fourier', 'mesh'],
      why: String.raw`Discretization invariance is what separates an operator from an ordinary image-to-image network. In DeepONet the branch supplies coefficients and the trunk supplies the basis, so the output can be queried anywhere. In an FNO the weights are indexed by mode number, which is why refining the mesh changes the FFT but not the parameters.`,
    },
    {
      kind: 'explain',
      title: 'Key takeaways',
      body: String.raw`- A **neural operator** approximates a map between function spaces — typically the solution operator of a PDE — rather than a map between fixed-size arrays.
- The defining property is **discretization invariance**: one set of weights, any mesh, converging as the mesh refines. A CNN on gridded data does not have it.
- **DeepONet** = branch (coefficients from sensor values) $\times$ trunk (a learned basis evaluated at the query point), justified by Chen & Chen's operator universal-approximation theorem.
- The general recipe is a **learned kernel integral** $\int\kappa_\theta(x,y)v(y)\,dy$ plus a pointwise term; the variants differ in how they make the integral affordable.
- **FNO**: assume a translation-invariant kernel, so the integral becomes multiplication in Fourier space. Keep $k_{\max}$ modes, multiply by learned $R_k$, inverse FFT. Global receptive field in one layer, parameters independent of $N$, **zero-shot super-resolution**.
- Limits: mode truncation smooths shocks, plain FNO wants a periodic uniform grid, rollouts drift, and there is no error bound off the training distribution.`,
    },
  ],
  references: [
    { authors: 'L. Lu, P. Jin, G. Pang, Z. Zhang & G. E. Karniadakis', title: 'Learning nonlinear operators via DeepONet based on the universal approximation theorem of operators', year: 2021, venue: 'Nature Machine Intelligence 3, 218–229', url: 'https://arxiv.org/abs/1910.03193' },
    { authors: 'Z. Li, N. Kovachki, K. Azizzadenesheli, B. Liu, K. Bhattacharya, A. Stuart & A. Anandkumar', title: 'Fourier Neural Operator for Parametric Partial Differential Equations', year: 2021, venue: 'ICLR', url: 'https://arxiv.org/abs/2010.08895' },
    { authors: 'N. Kovachki, Z. Li, B. Liu, K. Azizzadenesheli, K. Bhattacharya, A. Stuart & A. Anandkumar', title: 'Neural Operator: Learning Maps Between Function Spaces With Applications to PDEs', year: 2023, venue: 'JMLR 24(89)', url: 'https://arxiv.org/abs/2108.08481' },
    { authors: 'T. Chen & H. Chen', title: 'Universal Approximation to Nonlinear Operators by Neural Networks with Arbitrary Activation Functions and Its Application to Dynamical Systems', year: 1995, venue: 'IEEE Transactions on Neural Networks 6(4), 911–917' },
    { authors: 'M. Raissi, P. Perdikaris & G. E. Karniadakis', title: 'Physics-Informed Neural Networks: A Deep Learning Framework for Solving Forward and Inverse Problems Involving Nonlinear Partial Differential Equations', year: 2019, venue: 'Journal of Computational Physics 378, 686–707' },
  ],
} satisfies LessonContent;
