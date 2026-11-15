import type { LessonContent } from '../../types';

// One FNO block: spectral path (FFT, truncate, multiply, inverse FFT) in parallel with a pointwise W.
const blockSvg = `<svg viewBox="0 0 320 206" xmlns="http://www.w3.org/2000/svg" font-family="inherit">
  <defs><marker id="far" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="var(--muted)"/></marker></defs>
  <text x="160" y="12" font-size="9.5" text-anchor="middle" fill="var(--fg)">one FNO block: two paths, added</text>

  <circle cx="16" cy="92" r="4" fill="var(--c2)"/>
  <text x="16" y="110" font-size="8" text-anchor="middle" fill="var(--fg)">v(x)</text>
  <path d="M22,88 L36,50" stroke="var(--muted)" stroke-width="0.8" marker-end="url(#far)"/>
  <path d="M22,98 L36,140" stroke="var(--muted)" stroke-width="0.8" marker-end="url(#far)"/>

  <rect x="38" y="30" width="38" height="28" rx="4" fill="var(--surface)" stroke="var(--c6)"/>
  <text x="57" y="48" font-size="9" text-anchor="middle" fill="var(--fg)">FFT</text>
  <path d="M78,44 L90,44" stroke="var(--muted)" stroke-width="0.8" marker-end="url(#far)"/>
  <rect x="92" y="26" width="66" height="36" rx="4" fill="var(--surface)" stroke="var(--c6)"/>
  <text x="125" y="40" font-size="8" text-anchor="middle" fill="var(--fg)">keep |k| ≤ k_max</text>
  <text x="125" y="52" font-size="8" text-anchor="middle" fill="var(--c5)">drop the rest</text>
  <path d="M160,44 L172,44" stroke="var(--muted)" stroke-width="0.8" marker-end="url(#far)"/>
  <rect x="174" y="26" width="62" height="36" rx="4" fill="var(--surface)" stroke="var(--c1)" stroke-width="1.2"/>
  <text x="205" y="40" font-size="8.5" text-anchor="middle" fill="var(--c1)">× R_k</text>
  <text x="205" y="52" font-size="7.5" text-anchor="middle" fill="var(--muted)">learned, per mode</text>
  <path d="M238,44 L250,44" stroke="var(--muted)" stroke-width="0.8" marker-end="url(#far)"/>
  <rect x="252" y="30" width="44" height="28" rx="4" fill="var(--surface)" stroke="var(--c6)"/>
  <text x="274" y="48" font-size="9" text-anchor="middle" fill="var(--fg)">iFFT</text>
  <text x="166" y="18" font-size="7.5" text-anchor="middle" fill="var(--c6)">global path — the kernel integral, done by multiplication</text>

  <rect x="92" y="126" width="66" height="30" rx="4" fill="var(--surface)" stroke="var(--c4)"/>
  <text x="125" y="145" font-size="9" text-anchor="middle" fill="var(--fg)">W v(x)</text>
  <text x="125" y="168" font-size="7.5" text-anchor="middle" fill="var(--c4)">local path — passes every frequency,</text>
  <text x="125" y="178" font-size="7.5" text-anchor="middle" fill="var(--c4)">including the ones just thrown away</text>
  <path d="M160,141 L250,141" stroke="var(--muted)" stroke-width="0.8" marker-end="url(#far)"/>

  <path d="M296,44 L306,44 L306,86" stroke="var(--muted)" stroke-width="0.8"/>
  <path d="M258,141 L306,141 L306,100" stroke="var(--muted)" stroke-width="0.8" marker-end="url(#far)"/>
  <circle cx="306" cy="93" r="7" fill="var(--surface)" stroke="var(--c2)"/>
  <text x="306" y="97" font-size="9" text-anchor="middle" fill="var(--c2)">+</text>
  <text x="306" y="112" font-size="8" text-anchor="middle" fill="var(--fg)">σ</text>
  <text x="160" y="196" font-size="7.5" text-anchor="middle" fill="var(--muted)">R_k is a complex d_v × d_v matrix for each kept mode: the parameter count depends on k_max and d_v, never on N</text>
</svg>`;

export default {
  cards: [
    {
      kind: 'explain',
      title: 'One assumption buys an FFT',
      body: String.raw`The [kernel-integral layer](@math/neural-operator-framework) is $\int_D \kappa_\phi(x,y)v(y)\,dy$, and the problem with it is the $O(N^2)$ price tag.

Now make one assumption, the same one that makes a free-space Green's function a *fundamental solution*: the kernel is **translation-invariant**,

$$\kappa_\phi(x, y) = \kappa_\phi(x - y).$$

Then the integral is a convolution, $(\kappa_\phi * v)(x)$, and the convolution theorem turns it into pointwise multiplication in frequency space. An FFT costs $O(N\log N)$. That single substitution is the Fourier Neural Operator (Li et al., ICLR 2021).`,
    },
    {
      kind: 'recall',
      title: 'The convolution theorem',
      points: [
        String.raw`$\widehat{(f * g)}(\xi) = \hat f(\xi)\,\hat g(\xi)$ — convolution in $x$ is multiplication in $\xi$.`,
        String.raw`Differentiation becomes multiplication by $2\pi i\xi$, which is why constant-coefficient PDEs diagonalise in Fourier space.`,
        String.raw`On a periodic domain the transform is a Fourier *series*: a discrete set of modes $k \in \mathbb{Z}^d$.`,
        String.raw`The FFT computes all $N$ discrete coefficients in $O(N\log N)$ instead of $O(N^2)$.`,
      ],
      link: 'math/fourier-transform',
    },
    {
      kind: 'explain',
      title: 'Parametrise the kernel in Fourier space',
      body: String.raw`Here is the derivation in three lines. Write $\mathcal{F}$ for the Fourier transform on the periodic domain.

$$(\mathcal{K}v)(x) = \int_D \kappa_\phi(x-y)\,v(y)\,dy \;\;\Longrightarrow\;\; \mathcal{F}(\mathcal{K}v)(k) = \hat\kappa_\phi(k)\cdot\hat v(k).$$

So the layer is completely described by the numbers $\hat\kappa_\phi(k)$. The FNO's move is to skip $\kappa_\phi$ entirely and **learn $\hat\kappa_\phi(k)$ directly**, calling it $R_k$:

$$(\mathcal{K}v)(x) = \mathcal{F}^{-1}\big(R \cdot \mathcal{F}(v)\big)(x).$$

With $d_v$ channels, $\hat v(k) \in \mathbb{C}^{d_v}$ and each $R_k$ is a complex $d_v \times d_v$ matrix mixing channels at that frequency.

Finally, **truncate**: keep only $|k| \le k_{\max}$ and set the rest to zero. (For real-valued fields the negative modes are complex conjugates of the positive ones, so implementations store only $k \ge 0$ in one dimension, which is why the parameter count below uses $k_{\max}$ matrices rather than $2k_{\max}+1$.) This is what makes the parameter list finite, and it is a deliberate low-pass filter.`,
    },
    {
      kind: 'widget',
      title: 'A spectral layer you can poke',
      body: String.raw`One spectral convolution on a periodic input, with a single channel so you can see the whole thing. The dots are the $N$ samples; the bars are the kept coefficients $|c_k|$ before and after multiplication by the learned weight.

Two experiments.

1. Fix $k_{\max}$ and slide $N$ upward. The output curve stops changing and the error readout drops to zero — **the same weights, any finer grid**. Note the count in the corner: the number of learned numbers is set by $k_{\max}$, not by $N$.
2. Switch the input to the one with a mode at $k = 11$ and lower $N$ to 15 or below (with $k_{\max}=4$). The coefficients become wrong, because the mode at 11 folds down onto a kept mode whenever $|11-N| \le k_{\max}$. (Even the band-limited input, with content up to $k=5$, aliases once $N \le 9$.) That is **aliasing**, and it is the standard way the invariance claim breaks.`,
      widget: { type: 'MlFourierLayer', props: { n: 24, kmax: 4, input: 'smooth' } },
    },
    {
      kind: 'mcq',
      prompt: String.raw`In an FNO spectral layer, what exactly are the learned parameters of the global path?`,
      choices: [
        String.raw`One complex $d_v \times d_v$ matrix $R_k$ for each kept wavenumber $k$.`,
        String.raw`The values of $\kappa_\phi(x-y)$ at every pair of grid offsets.`,
        String.raw`The Fourier coefficients of the input function.`,
        String.raw`A single complex scalar applied to all frequencies.`,
      ],
      answer: 0,
      why: String.raw`The whole point is to parametrise the kernel's *transform* rather than the kernel: one channel-mixing matrix per kept mode. Learning $\kappa$ on grid offsets would reintroduce a grid dependence; the input's coefficients are data, not parameters; and a single scalar across all frequencies is what the pointwise $W$ path effectively is, which is why it cannot replace this one.`,
    },
    {
      kind: 'numeric',
      prompt: String.raw`A 1D FNO spectral layer has $d_v = 32$ channels and keeps the $16$ modes $k = 0,1,\dots,15$, each with its own complex $d_v \times d_v$ matrix $R_k$. How many **real** parameters does the spectral path hold?`,
      answer: 32768,
      tolerance: 1,
      why: String.raw`$16$ modes $\times\ 32 \times 32$ complex entries $\times\ 2$ reals per complex number $= 32{,}768$. Notice what is missing from that calculation: $N$. Train on $N = 64$ or $N = 4096$ and the parameter list is identical — which is the arithmetic behind discretisation invariance.`,
    },
    {
      kind: 'explain',
      title: 'The full block, and why $W$ is not optional',
      body: String.raw`A complete FNO layer is

$$v_{t+1}(x) = \sigma\Big(\underbrace{W_t\,v_t(x) + b_t}_{\text{local}} \;+\; \underbrace{\mathcal{F}^{-1}\big(R_t\cdot\mathcal{F}(v_t)\big)(x)}_{\text{spectral}}\Big),$$

with four to six such layers between a pointwise lifting $P$ and projection $Q$, exactly as in the general framework.

The spectral path has *deleted* every mode above $k_{\max}$. If it were the only path, the network would be a low-pass filter with a nonlinearity, and sharp features could never survive to the output. The pointwise $W_t$ is the fix: multiplying by a matrix at each point is, in Fourier space, the same matrix applied to **every** mode including the discarded ones. It cannot shape frequencies individually, but it carries them through.

So: the spectral path supplies selective, global, low-frequency structure; the local path supplies unselective, pointwise, all-frequency throughput. Neither alone is enough.`,
      widget: { type: 'SvgDiagram', props: { svg: blockSvg } },
    },
    {
      kind: 'truefalse',
      prompt: String.raw`Because the spectral path keeps only modes $|k| \le k_{\max}$, an FNO's output cannot contain frequencies above $k_{\max}$.`,
      answer: false,
      why: String.raw`Two routes get around the cut. The pointwise $W$ path passes all frequencies untouched, and the pointwise nonlinearity $\sigma$ *creates* new ones — a cubic-ish nonlinearity applied to a mode at $k$ produces content at $3k$. That is a feature when it lets the network represent sharp output, and a hazard when the grid cannot resolve the frequencies created, because they alias back down.`,
    },
    {
      kind: 'explain',
      title: 'What the resolution independence actually gives you',
      body: String.raw`Li et al. (ICLR 2021) demonstrate **zero-shot super-resolution**: an FNO trained on data at one grid resolution is evaluated, without retraining, at a higher one, and the reported error stays close to the training-resolution error. For a CNN surrogate the corresponding experiment is simply not available.

Be clear about what this is and is not.

- It **is** a statement that the architecture defines a grid-free map, so deployment resolution is a free parameter.
- It **is not** a claim that the model knows anything about scales it never saw. If the training data at coarse resolution never contained a thin boundary layer, the fine-resolution output will be a smooth, confident fabrication in that region.
- The error against *high-resolution truth* can be worse than the error against coarse truth, even when the model's own output barely changes.

The practical use is deployment flexibility, and transfer of the expensive part (training) across the cheap part (meshing).`,
    },
    {
      kind: 'multi',
      prompt: 'Which assumptions does a standard FNO make about the problem?',
      choices: [
        'The domain is sampled on a uniform rectangular grid.',
        'The domain is periodic, or has been padded so that it may be treated as periodic.',
        'The kernel is translation-invariant within each layer.',
        'The PDE is linear.',
        'The solution operator is smoothing in the sense that low modes carry most of the signal.',
      ],
      answers: [0, 1, 2, 4],
      why: String.raw`The FFT needs a uniform grid and periodicity (Li et al. pad non-periodic domains with a strip of zeros for exactly this reason), and translation invariance is what turns the integral into a convolution in the first place. Mode truncation is a bet that the low modes matter most. Nonlinearity in the PDE is no obstacle at all — that is what $\sigma$ and the stacking are for.`,
    },
    {
      kind: 'order',
      prompt: 'Order one forward pass through an FNO spectral path.',
      steps: [
        String.raw`Take the FFT of each of the $d_v$ channels of $v_t$ over the spatial grid.`,
        String.raw`Discard every coefficient with $|k| > k_{\max}$.`,
        String.raw`For each kept mode $k$, multiply the length-$d_v$ coefficient vector by the learned complex matrix $R_k$.`,
        String.raw`Pad the modified coefficients back with zeros up to the full grid of wavenumbers.`,
        String.raw`Take the inverse FFT to return to physical space, and add the $W_t v_t(x) + b_t$ path before applying $\sigma$.`,
      ],
      why: String.raw`The zero-padding step is the one people forget, and it matters: it is where the truncation becomes an explicit low-pass filter on the output of that path, which is why the local path has to be there to carry the rest.`,
    },
    {
      kind: 'explain',
      title: 'Where this breaks',
      body: String.raw`- **Non-uniform geometry.** The FFT wants a regular grid on a box. Irregular domains need padding, masking, or a coordinate map — Geo-FNO learns a deformation to a regular latent grid. A DeepONet or a graph neural operator has no such difficulty.
- **Aliasing from $\sigma$.** The nonlinearity is applied *pointwise on the discrete grid*, so new high frequencies it creates get folded back rather than resolved. Bartolucci et al. (NeurIPS 2023) show that this makes the standard FNO only approximately discretisation-invariant, and propose formulations that are alias-free by construction.
- **Sharp fronts.** A spectral representation truncated at $k_{\max}$ handles discontinuities badly, and the deleted modes are exactly the ones a shock needs.
- **Memory.** $R$ holds $O(k_{\max}^d\,d_v^2)$ complex numbers, which grows fast with dimension $d$: this, not $N$, is the FNO's scaling problem.

None of this makes the FNO a bad method. It makes it a method with a stated domain of validity, which is the most anyone should ask.`,
    },
    {
      kind: 'match',
      prompt: 'Match each FNO design choice with its consequence.',
      pairs: [
        [String.raw`Learn $R_k$ rather than $\kappa(x-y)$`, 'parameters live in frequency space and never mention the grid'],
        [String.raw`Truncate at $k_{\max}$`, 'finite parameter list, and a deliberate low-pass filter'],
        [String.raw`Keep the pointwise $W$ path`, 'all frequencies, including deleted ones, reach the output'],
        ['Use the FFT', String.raw`$O(N\log N)$ per layer, but a uniform periodic grid is required`],
        [String.raw`Apply $\sigma$ pointwise on the grid`, 'new high frequencies are created, and can alias'],
      ],
      why: String.raw`Every row is a trade. The first three are what make the FNO work; the last two are what bound where it works. Reading the architecture this way tells you in advance which benchmark it will struggle on.`,
    },
    {
      kind: 'fill',
      prompt: String.raw`Assuming the kernel is translation-___ turns the integral into a convolution, which the convolution theorem performs as ___ in Fourier space. The FNO learns the transform $R_k$ directly and keeps modes up to $k_{\max}$, so the parameter count depends on $k_{\max}$ and the number of ___, not on $N$. The pointwise path is kept because the spectral path acts as a ___ filter.`,
      bank: ['invariant', 'multiplication', 'channels', 'low-pass', 'symmetric', 'convolution', 'samples', 'high-pass'],
      answer: ['invariant', 'multiplication', 'channels', 'low-pass'],
      why: String.raw`Translation invariance is the structural assumption, multiplication is what it buys, the parameter count is $O(k_{\max}^d d_v^2)$, and truncation is a low-pass filter — which is precisely why the architecture needs a second path that is not frequency-selective.`,
    },
    {
      kind: 'explain',
      title: 'Key takeaways',
      body: String.raw`- Assume $\kappa_\phi(x,y) = \kappa_\phi(x-y)$ and the kernel integral becomes a **convolution**; the convolution theorem makes it a multiplication, and the FFT makes it $O(N\log N)$.
- The FNO parametrises the kernel's **transform**: a learned complex $d_v\times d_v$ matrix $R_k$ for each mode with $|k| \le k_{\max}$. The parameter count is $O(k_{\max}^d d_v^2)$ and contains no $N$.
- A block is $v \mapsto \sigma\big(Wv + b + \mathcal{F}^{-1}(R\,\mathcal{F}v)\big)$. The spectral path is global and frequency-selective but low-pass; the local path is unselective but passes everything. Both are needed.
- **Zero-shot super-resolution**: train at one resolution, deploy at another. It is deployment flexibility, not knowledge of unseen scales.
- Costs of the assumption: a uniform, periodic (or padded) grid; aliasing introduced by the pointwise $\sigma$; poor handling of sharp fronts; memory growing like $k_{\max}^d$.
- Next: what all of this looks like when you actually have to train it — [operator learning in practice](@math/operator-learning-practice).`,
    },
  ],
  references: [
    { authors: 'Z. Li, N. Kovachki, K. Azizzadenesheli, B. Liu, K. Bhattacharya, A. Stuart, A. Anandkumar', title: 'Fourier Neural Operator for Parametric Partial Differential Equations', year: 2021, venue: 'ICLR 2021', url: 'https://arxiv.org/abs/2010.08895' },
    { authors: 'N. Kovachki, Z. Li, B. Liu, K. Azizzadenesheli, K. Bhattacharya, A. Stuart, A. Anandkumar', title: 'Neural Operator: Learning Maps Between Function Spaces with Applications to PDEs', year: 2023, venue: 'Journal of Machine Learning Research 24(89), 1–97', detail: '§4.4 (the Fourier integral operator layer)' },
    { authors: 'N. Kovachki, S. Lanthaler, S. Mishra', title: 'On universal approximation and error bounds for Fourier Neural Operators', year: 2021, venue: 'Journal of Machine Learning Research 22(290), 1–76' },
    { authors: 'F. Bartolucci, E. de Bézenac, B. Raonić, R. Molinaro, S. Mishra, R. Alaifari', title: 'Representation Equivalent Neural Operators: a Framework for Alias-free Operator Learning', year: 2023, venue: 'Advances in Neural Information Processing Systems 36' },
    { authors: 'Z. Li, D. Z. Huang, B. Liu, A. Anandkumar', title: 'Fourier Neural Operator with Learned Deformations for PDEs on General Geometries', year: 2023, venue: 'Journal of Machine Learning Research 24(388), 1–26' },
  ],
} satisfies LessonContent;
