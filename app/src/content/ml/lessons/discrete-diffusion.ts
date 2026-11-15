import type { LessonContent } from '../../types';

export default {
  cards: [
    {
      kind: 'explain',
      title: 'There is no halfway between "cat" and "dog"',
      body: String.raw`Every diffusion model so far has added Gaussian noise to a real-valued vector. Pixels tolerate that: a slightly noisy pixel is still a pixel. A **token** does not. There is no word three-quarters of the way from *cat* to *dog*, no atom that is 0.4 carbon, no bond that is 30% aromatic.

So how do you run diffusion on discrete data? Replace "add a little noise" with "**corrupt a little**": at each step, each token has a small chance of being replaced — most usefully, by a special `+"`[MASK]`"+` symbol it can never escape from. Slide $t$ below and watch a sentence dissolve.`,
      widget: { type: 'MlMaskedDiffusion', props: { mode: 'forward', t: 0.45 } },
    },
    {
      kind: 'recall',
      title: 'Recall: Markov chains',
      points: [
        String.raw`A Markov chain on a finite state space is a matrix $Q$ with $Q_{ij}=\Pr(\text{next}=j\mid\text{now}=i)$; rows are probability vectors.`,
        String.raw`A row vector of probabilities evolves as $\mathbf p\mapsto\mathbf pQ$, and over $t$ steps as $\mathbf pQ^{(1)}Q^{(2)}\cdots Q^{(t)}$.`,
        String.raw`An **absorbing state** $m$ has $Q_{mm}=1$: once entered, never left.`,
        String.raw`If every state eventually reaches the absorbing one, the chain converges to it with probability 1 — the discrete analogue of noise swallowing the signal.`,
      ],
      link: 'stats/markov-chains',
    },
    {
      kind: 'explain',
      title: 'Why the continuous recipe does not simply transfer',
      body: String.raw`The obvious workaround is to embed tokens as vectors, diffuse in $\mathbb R^d$, and round at the end. **Diffusion-LM** (Li et al., 2022) did exactly this and it works, but three problems are structural rather than incidental.

1. **Rounding is a cliff.** The model's loss lives in embedding space while the thing being evaluated is a discrete argmax. Small embedding errors are free until they cross a decision boundary, then catastrophic — so the loss gradient is a poor guide to token accuracy.
2. **The geometry is made up.** Gaussian noise says nearby embeddings are interchangeable. For learned embeddings that is roughly true; for a vocabulary of 50k subwords it is often nonsense, and for *categorical* attributes with no order at all (atom type, bond type) it is simply false.
3. **Structure is destroyed.** Add Gaussian noise to a one-hot adjacency matrix and a sparse molecular graph becomes a dense real matrix. Sparsity, valence, connectivity — every feature a graph network reads — is gone at moderate noise.

The alternative is to keep the data discrete the whole way through and make the *corruption* discrete too.`,
    },
    {
      kind: 'explain',
      title: 'D3PM: diffusion with transition matrices',
      body: String.raw`**Austin et al. (2021)** define the forward process directly on the categorical variable. For a vocabulary of size $K$, represent a token as a one-hot row $\mathbf x$ and pick a transition matrix $Q_t\in\mathbb R^{K\times K}$ per step:
$$q(\mathbf x_t\mid\mathbf x_{t-1})=\operatorname{Cat}\big(\mathbf x_t;\ \mathbf x_{t-1}Q_t\big),\qquad q(\mathbf x_t\mid\mathbf x_0)=\operatorname{Cat}\big(\mathbf x_t;\ \mathbf x_0\bar Q_t\big),\ \ \bar Q_t=Q_1Q_2\cdots Q_t .$$
Because the matrices multiply, the $t$-step marginal is closed-form — the discrete counterpart of $\mathbf x_t=\sqrt{\bar\alpha_t}\mathbf x_0+\sqrt{1-\bar\alpha_t}\boldsymbol\varepsilon$, and the reason training needs no simulation. The posterior $q(\mathbf x_{t-1}\mid\mathbf x_t,\mathbf x_0)$ is also closed-form, so the usual ELBO applies, and the model is parameterised as a prediction of $\mathbf x_0$.

Everything now hinges on the choice of $Q_t$, and the choice is where the *domain knowledge* goes.`,
    },
    {
      kind: 'match',
      prompt: 'Match each D3PM transition matrix to the structure it encodes.',
      pairs: [
        ['Uniform: swap to a random token with probability β_t', 'No structure at all; the limit is a uniform distribution over the vocabulary'],
        ['Absorbing: move to [MASK] with probability β_t', 'Tokens are either known or unknown; the limit is an all-mask sequence'],
        ['Discretized Gaussian over neighbouring categories', 'Ordinal data such as pixel intensities, where categories have a natural order'],
        ['Transitions weighted by embedding similarity', 'Tokens with similar learned meanings are confusable'],
      ],
      why: String.raw`The matrix *is* the inductive bias: it says which corruptions are considered mild. Uniform noise destroys information immediately and symmetrically; absorbing noise destroys it one position at a time and records which positions are gone; the ordinal and embedding kernels encode a notion of "nearby category". Austin et al. found the absorbing kernel strongest for text.`,
    },
    {
      kind: 'explain',
      title: 'The absorbing case: masking is diffusion',
      body: String.raw`Give the vocabulary one extra symbol $m=$ `+"`[MASK]`"+String.raw` and let
$$Q_t=(1-\beta_t)I+\beta_t\,\mathbf 1\,\mathbf e_m^{\top}.$$
Each token independently either stays as it is or jumps to $m$ forever. The cumulative process is as simple as it gets: a token is masked at time $t$ with probability $1-\alpha_t$, independently of everything else, where $\alpha_t=\prod_{s\le t}(1-\beta_s)$.

In continuous time, write $\alpha_t$ for the probability a position is *still visible*, with $\alpha_0=1$ and $\alpha_1=0$. The forward process is then almost embarrassingly simple — and completely specified by one scalar function. The common choice is the linear schedule $\alpha_t=1-t$, so at time $t$ a fraction $t$ of the sequence is masked.`,
    },
    {
      kind: 'numeric',
      prompt: String.raw`A discrete-time absorbing process with $T=4$ steps uses $\beta_t=\dfrac{1}{T-t+1}$, i.e. $\beta_1=\tfrac14,\ \beta_2=\tfrac13,\ \beta_3=\tfrac12,\ \beta_4=1$. What is the probability that a given token is **still unmasked** after step 3?`,
      answer: 0.25,
      tolerance: 0.001,
      why: String.raw`Survival multiplies: $(1-\tfrac14)(1-\tfrac13)(1-\tfrac12)=\tfrac34\cdot\tfrac23\cdot\tfrac12=\tfrac14$. This schedule is designed so that the survival probability after $t$ steps is exactly $(T-t)/T$ — a *linear* masking schedule, and $\beta_4=1$ guarantees everything is masked at the end.`,
    },
    {
      kind: 'widget',
      title: 'Running it backwards: any order you like',
      body: String.raw`Switch to **Reverse** and drag $t$ from 1 down to 0. The model starts from a sequence of masks and fills positions in, a few at a time, each prediction conditioned on everything currently visible.

Nothing forces left-to-right. Try **Random order** (what the training objective assumes, since the forward process masks positions independently) against **Confidence order** (fill the position the model is surest about first). Confidence-first decoding is the standard practical trick and it is strictly a *sampler* choice — same weights, different order.

Note the `+"`ELBO weight 1/t`"+String.raw` readout: predictions made when almost everything is masked are weighted far more heavily than predictions made at the end. The next card says why.`,
      widget: { type: 'MlMaskedDiffusion', props: { mode: 'reverse', t: 0.6, order: 'confidence' } },
    },
    {
      kind: 'widget',
      title: 'The loss is weighted masked-token prediction',
      body: String.raw`For the absorbing process the ELBO collapses into something a BERT user would recognise.`,
      widget: {
        type: 'StepReveal',
        props: {
          steps: [
            String.raw`Forward: each position is masked independently with probability $1-\alpha_t$. So $q(\mathbf x_t\mid\mathbf x_0)$ factorises over positions — no interaction to model.`,
            String.raw`Reverse: an unmasked position stays as it is (the process is absorbing, so its value is already known). Only masked positions need a prediction.`,
            String.raw`The continuous-time negative ELBO reduces to $\displaystyle\int_0^1\frac{\alpha_t'}{1-\alpha_t}\ \mathbb E_{\mathbf x_t}\!\!\sum_{i:\,x_t^i=m}\!\log p_\theta\big(x_0^i\mid\mathbf x_t\big)\,dt$ — cross-entropy on masked positions, nothing else.`,
            String.raw`With $\alpha_t=1-t$ the weight is $1/t$: the handful of predictions made when the sequence is almost entirely masked dominate the loss.`,
            String.raw`So **masked diffusion = BERT with a random mask rate and a principled $1/t$ weighting** — and unlike BERT it is a proper generative model with a likelihood bound.`,
          ],
          notes: ['Independence is what makes it cheap.', 'Half the work disappears.', 'Sahoo et al. and Shi et al. (2024).', 'Hard examples, high weight.', 'The punchline.'],
        },
      },
    },
    {
      kind: 'mcq',
      prompt: 'Why does the masked-diffusion loss only involve the currently masked positions?',
      choices: [
        'Because the unmasked positions are too easy to predict and are dropped as an optimisation.',
        'Because the forward process is absorbing: an unmasked token has not been corrupted, so the reverse step has nothing to infer about it.',
        'Because masked positions have a higher learning rate.',
        'Because the vocabulary excludes the [MASK] token.',
      ],
      answer: 1,
      why: String.raw`In an absorbing chain, seeing a real token at time $t$ tells you with certainty that it was that token at time 0 — the reverse posterior for that position is a point mass and contributes zero KL. Dropping those terms is exact, not a heuristic. (It is also why the loss is much cheaper than it looks.)`,
    },
    {
      kind: 'explain',
      title: 'Relatives: any-order autoregression, and BERT',
      body: String.raw`Absorbing diffusion sits between two things you already know.

- **Autoregressive models** factor $p(\mathbf x)=\prod_i p(x_i\mid x_{<i})$ in one fixed order. Masked diffusion effectively averages over *all* orders — it is an **any-order autoregressive model** in disguise, a connection made explicit by Hoogeboom et al.'s Autoregressive Diffusion Models (2022). That is where the extra flexibility comes from: infilling, editing, and parallel decoding are natural, whereas an [autoregressive model](@ml/autoregressive-models) must generate left to right.
- **BERT** trains the same conditional $p(x_i\mid\text{visible})$ but at a single fixed mask rate and with no weighting, which is why it cannot be sampled from coherently. Varying the rate over $[0,1]$ and weighting by $1/t$ is precisely what turns the same network into a generative model with a bound on $\log p(\mathbf x)$.

The price is paid in likelihood. Averaging over orders is strictly harder than learning one order, and masked diffusion language models still report worse perplexity than a comparable autoregressive model of the same size. What they buy is the ability to decode many tokens per step and to fill holes anywhere.`,
    },
    {
      kind: 'truefalse',
      prompt: String.raw`Unmasking several positions in a single reverse step is mathematically exact, as long as the model is well trained.`,
      answer: false,
      why: String.raw`Filling $k$ positions at once samples each from its own marginal $p_\theta(x_i\mid\mathbf x_t)$ and so treats them as **conditionally independent** given the current partial sequence — which they are not ("New ___ ___" is happy to become "New York City" or "New South Wales", but the independent sampler can produce "New York Wales"). Revealing fewer positions per step (so taking more steps) reduces the error; the whole speed advantage of parallel decoding is spending exactly this budget.`,
    },
    {
      kind: 'explain',
      title: 'The other route: model the ratios, not the mask',
      body: String.raw`Masked diffusion predicts $\mathbf x_0$. A different and more general construction asks for the discrete analogue of the **score**. In continuous space the score is $\nabla\log p_t(\mathbf x)$; on a discrete state space there is no gradient, but there are **ratios between neighbouring states**:
$$s_\theta(\mathbf x)_{\mathbf y}\ \approx\ \frac{p_t(\mathbf y)}{p_t(\mathbf x)}\quad\text{for }\mathbf y\text{ differing from }\mathbf x\text{ in one position}.$$
**Lou, Meng & Ermon (2024)** call this the concrete score and train it with **score entropy**, a loss designed to be a proper, non-negative, Bregman-type divergence for positive ratios (naive score matching is unstable here because ratios are unbounded and must stay positive). Their SEDD models report perplexities competitive with a GPT-2 of comparable size, which was strong early evidence that non-autoregressive language modelling need not cost a large quality penalty.

The practical difference: ratio-based models can also use a **uniform** corruption kernel, so a token already generated can in principle be *changed* later, whereas pure absorbing diffusion can never revise a decision — once unmasked, fixed (remasking samplers are a patch for this). The caveat: SEDD's best reported results came from its absorbing variant, and with an absorbing kernel it is closely related to the masked-diffusion objective above.`,
    },
    {
      kind: 'order',
      prompt: 'Order the steps of generating one sequence from a masked diffusion language model.',
      steps: [
        String.raw`Initialise all $L$ positions to `+"`[MASK]`"+String.raw` and set $t=1$`,
        String.raw`Run the network once on the current partial sequence to get $p_\theta(x_0^i\mid\mathbf x_t)$ at every masked position`,
        String.raw`Choose which positions to reveal this step (random, or the most confident ones)`,
        String.raw`Sample tokens for those positions and write them in; leave the rest masked`,
        String.raw`Decrease $t$ and repeat until no masks remain`,
      ],
      why: String.raw`One network call serves every masked position, which is what makes parallel decoding cheap; the choice of *how many* positions to reveal per step is the quality/speed dial. Nothing here is left-to-right, and nothing re-examines a position once written — that limitation is specific to the absorbing kernel.`,
    },
    {
      kind: 'explain',
      title: 'Molecules and graphs',
      body: String.raw`Molecular graphs are the case where discreteness is not a nuisance but the entire point. A molecule is a set of atom types and a sparse matrix of bond types; a 0.3-strength bond does not exist, and valence rules are exact.

**DiGress** (Vignac et al., 2023) runs D3PM-style discrete diffusion jointly on node categories (atom types) and edge categories (bond types, including "no bond"). Two design choices matter:
- The transition matrices are chosen so that the limiting distribution is the **marginal** distribution of atom and bond types in the training set, not the uniform one. Noising toward realistic marginals keeps the intermediate graphs chemically plausible and measurably improves results.
- The denoiser is fed cheap **structural features** (cycle counts, spectral features) that a message-passing network cannot compute itself, since the noisy graph is still a genuine graph at every step — which it would not be under Gaussian noise.

The same argument applies to protein sequence design, where the alphabet is 20 amino acids with no ordering, and to any categorical scientific data.`,
    },
    {
      kind: 'fill',
      prompt: String.raw`In absorbing-state diffusion the forward process sends each token to ___ with growing probability, and the limiting state is a sequence of ___ . The training loss is cross-entropy over the ___ positions only, weighted by $1/t$ under a linear schedule. Decoding many positions in one step assumes they are conditionally ___ .`,
      bank: ['[MASK]', 'a random token', 'masks', 'embeddings', 'masked', 'visible', 'independent', 'identical'],
      answer: ['[MASK]', 'masks', 'masked', 'independent'],
      why: String.raw`The absorbing kernel moves probability only toward $m$, so the $t=1$ state is all masks. Visible positions contribute zero KL, so only masked ones enter the loss. And joint sampling from per-position marginals is exactly an independence assumption — the source of parallel decoding's error.`,
    },
    {
      kind: 'multi',
      prompt: 'Which are real advantages of discrete diffusion over a left-to-right autoregressive model? (Select all that apply.)',
      choices: [
        'Infilling: conditioning on arbitrary known positions requires no special training.',
        'Multiple tokens can be produced per network call, trading quality for latency.',
        'It achieves strictly better likelihood on text at matched model size.',
        'For graphs and molecules it keeps the intermediate states valid discrete objects.',
      ],
      answers: [0, 1, 3],
      why: String.raw`Any-order training is what makes arbitrary conditioning and parallel decoding natural, and keeping graphs discrete is why the molecular case works at all. Likelihood is the standing weakness: averaging over orders is a harder learning problem than one fixed order, and reported perplexities for diffusion language models remain behind comparable autoregressive models — SEDD narrowed the gap rather than closing it.`,
    },
    {
      kind: 'explain',
      title: 'Key takeaways',
      body: String.raw`- Gaussian noise has no meaning on categories: rounding is a cliff, embedding geometry is invented, and sparse structure is destroyed. Corrupt discretely instead.
- **D3PM** replaces the Gaussian kernel with transition matrices $Q_t$; $\bar Q_t=Q_1\cdots Q_t$ keeps the $t$-step marginal closed-form, so training stays simulation-free.
- The choice of $Q_t$ is the inductive bias: uniform, **absorbing ([MASK])**, ordinal, or embedding-similarity. Absorbing wins for text.
- Masked diffusion's ELBO is **weighted cross-entropy on masked positions** — BERT with a random mask rate and a $1/t$ weight, plus a genuine likelihood bound.
- It is an any-order autoregressive model: free infilling and parallel decoding, at the cost of perplexity, and parallel steps assume conditional independence.
- **SEDD** models ratios $p_t(\mathbf y)/p_t(\mathbf x)$ instead, which also permits uniform kernels (and so revising tokens), though its strongest variant was absorbing.
- **DiGress** applies the same machinery to molecular graphs, noising toward dataset marginals so intermediate graphs stay chemically sensible.`,
    },
  ],
  references: [
    { authors: 'J. Austin, D. D. Johnson, J. Ho, D. Tarlow & R. van den Berg', title: 'Structured Denoising Diffusion Models in Discrete State-Spaces', year: 2021, venue: 'NeurIPS', url: 'https://arxiv.org/abs/2107.03006' },
    { authors: 'A. Lou, C. Meng & S. Ermon', title: 'Discrete Diffusion Modeling by Estimating the Ratios of the Data Distribution', year: 2024, venue: 'ICML', url: 'https://arxiv.org/abs/2310.16834' },
    { authors: 'S. S. Sahoo, M. Arriola, Y. Schiff, A. Gokaslan, E. Marroquin, J. T. Chiu, A. Rush & V. Kuleshov', title: 'Simple and Effective Masked Diffusion Language Models', year: 2024, venue: 'NeurIPS', url: 'https://arxiv.org/abs/2406.07524' },
    { authors: 'C. Vignac, I. Krawczuk, A. Siraudin, B. Wang, V. Cevher & P. Frossard', title: 'DiGress: Discrete Denoising Diffusion for Graph Generation', year: 2023, venue: 'ICLR', url: 'https://arxiv.org/abs/2209.14734' },
    { authors: 'E. Hoogeboom, A. A. Gritsenko, J. Bastings, B. Poole, R. van den Berg & T. Salimans', title: 'Autoregressive Diffusion Models', year: 2022, venue: 'ICLR', url: 'https://arxiv.org/abs/2110.02037' },
    { authors: 'X. L. Li, J. Thickstun, I. Gulrajani, P. Liang & T. B. Hashimoto', title: 'Diffusion-LM Improves Controllable Text Generation', year: 2022, venue: 'NeurIPS', url: 'https://arxiv.org/abs/2205.14217' },
    { authors: 'J. Shi, K. Han, Z. Wang, A. Doucet & M. K. Titsias', title: 'Simplified and Generalized Masked Diffusion for Discrete Data', year: 2024, venue: 'NeurIPS', url: 'https://arxiv.org/abs/2406.04329' },
  ],
} satisfies LessonContent;
