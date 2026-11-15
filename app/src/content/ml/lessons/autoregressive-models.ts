import type { LessonContent } from '../../types';

// Raster order over a 5×5 image + the two masked-convolution masks.
const RASTER_SVG = (() => {
  const cell = 15, ox = 12, oy = 26;
  let g = '';
  for (let i = 0; i < 5; i++) for (let j = 0; j < 5; j++) {
    const seen = i * 5 + j < 12;
    const cur = i * 5 + j === 12;
    g += `<rect x="${ox + j * cell}" y="${oy + i * cell}" width="${cell - 1}" height="${cell - 1}" rx="1.5" fill="${cur ? 'var(--c3)' : seen ? 'var(--c2)' : 'var(--surface)'}" fill-opacity="${cur ? 0.85 : seen ? 0.35 : 1}" stroke="var(--grid)" stroke-width="0.5"/>`;
  }
  const mask = (x0: number, title: string, selfOn: boolean) => {
    let m = `<text x="${x0 + 22}" y="${oy - 6}" font-size="8.5" text-anchor="middle" fill="var(--fg)">${title}</text>`;
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
      const before = i < 1 || (i === 1 && j < 1);
      const centre = i === 1 && j === 1;
      const on = before || (centre && selfOn);
      m += `<rect x="${x0 + j * 15}" y="${oy + i * 15}" width="14" height="14" fill="${on ? 'var(--c1)' : 'var(--surface)'}" fill-opacity="${on ? 0.55 : 1}" stroke="var(--grid)" stroke-width="0.5"/>` +
        `<text x="${x0 + j * 15 + 7}" y="${oy + i * 15 + 10}" font-size="8" text-anchor="middle" fill="var(--fg)">${on ? 1 : 0}</text>`;
    }
    return m;
  };
  return `<svg viewBox="0 0 320 150" xmlns="http://www.w3.org/2000/svg">
<text x="44" y="14" font-size="9" text-anchor="middle" fill="var(--fg)">raster order</text>
${g}
<text x="44" y="118" font-size="8" text-anchor="middle" fill="var(--muted)">blue = already generated</text>
<text x="44" y="129" font-size="8" text-anchor="middle" fill="var(--c3)">orange = the pixel being predicted</text>
<text x="44" y="140" font-size="8" text-anchor="middle" fill="var(--muted)">white = not allowed to look</text>
${mask(140, 'mask A (first layer)', false)}
${mask(240, 'mask B (later layers)', true)}
<text x="190" y="122" font-size="8" text-anchor="middle" fill="var(--muted)">A blocks the centre so the</text>
<text x="190" y="132" font-size="8" text-anchor="middle" fill="var(--muted)">pixel never sees itself;</text>
<text x="190" y="142" font-size="8" text-anchor="middle" fill="var(--muted)">B may reuse its own features.</text>
</svg>`;
})();

const TRAINVSSAMPLE_SVG = `<svg viewBox="0 0 320 170" xmlns="http://www.w3.org/2000/svg">
<defs><marker id="ar" viewBox="0 0 6 6" refX="5" refY="3" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="var(--muted)"/></marker></defs>
<text x="80" y="14" font-size="9.5" text-anchor="middle" fill="var(--c1)">TRAINING: one parallel pass</text>
${[0, 1, 2, 3].map((i) => `<rect x="${14 + i * 36}" y="24" width="30" height="18" rx="3" fill="var(--c1)" fill-opacity="0.25" stroke="var(--grid)"/><text x="${29 + i * 36}" y="37" font-size="9" text-anchor="middle" fill="var(--fg)">x${['₁', '₂', '₃', '₄'][i]}</text>`).join('')}
<rect x="14" y="52" width="138" height="16" rx="3" fill="var(--surface)" stroke="var(--fg)" stroke-width="0.8"/><text x="83" y="64" font-size="8.5" text-anchor="middle" fill="var(--fg)">masked network — all positions at once</text>
${[0, 1, 2, 3].map((i) => `<line x1="${29 + i * 36}" y1="68" x2="${29 + i * 36}" y2="78" stroke="var(--muted)" stroke-width="0.8" marker-end="url(#ar)"/><text x="${29 + i * 36}" y="92" font-size="8" text-anchor="middle" fill="var(--muted)">loss${['₁', '₂', '₃', '₄'][i]}</text>`).join('')}
<text x="83" y="110" font-size="8" text-anchor="middle" fill="var(--muted)">the true tokens are already known:</text>
<text x="83" y="120" font-size="8" text-anchor="middle" fill="var(--muted)">teacher forcing, cost O(1) passes</text>
<line x1="162" y1="18" x2="162" y2="160" stroke="var(--grid)" stroke-width="0.7"/>
<text x="242" y="14" font-size="9.5" text-anchor="middle" fill="var(--c5)">SAMPLING: D sequential passes</text>
${[0, 1, 2, 3].map((i) => `<rect x="${176 + i * 34}" y="24" width="28" height="18" rx="3" fill="var(--c5)" fill-opacity="${0.1 + 0.2 * i}" stroke="var(--grid)"/><text x="${190 + i * 34}" y="37" font-size="9" text-anchor="middle" fill="var(--fg)">x̂${['₁', '₂', '₃', '₄'][i]}</text><text x="${190 + i * 34}" y="52" font-size="7.5" text-anchor="middle" fill="var(--muted)">pass ${i + 1}</text>`).join('')}
<path d="M190,58 C198,78 214,78 222,60" stroke="var(--muted)" stroke-width="0.9" fill="none" marker-end="url(#ar)"/>
<path d="M224,58 C232,78 248,78 256,60" stroke="var(--muted)" stroke-width="0.9" fill="none" marker-end="url(#ar)"/>
<path d="M258,58 C266,78 282,78 290,60" stroke="var(--muted)" stroke-width="0.9" fill="none" marker-end="url(#ar)"/>
<text x="242" y="100" font-size="8" text-anchor="middle" fill="var(--muted)">each token must be drawn before</text>
<text x="242" y="110" font-size="8" text-anchor="middle" fill="var(--muted)">the next one can be conditioned on it</text>
<text x="160" y="140" font-size="8.5" text-anchor="middle" fill="var(--fg)">The asymmetry is the defining practical fact about autoregressive models:</text>
<text x="160" y="152" font-size="8.5" text-anchor="middle" fill="var(--fg)">cheap exact likelihood, expensive generation.</text>
</svg>`;

export default {
  cards: [
    {
      kind: 'explain',
      title: 'Guess the next one',
      body: String.raw`Cover the end of a sentence and ask someone to finish it. "The cat sat on the ___". They will say *mat*, or *sofa*, or *windowsill* — and the fact that they can do this at all means they carry a distribution over next words in their head.

That is the whole idea of an **autoregressive model**. Do not try to describe a whole image or a whole sentence in one go. Describe it **one piece at a time**, each piece conditioned on the pieces already written down.

It sounds like a modelling compromise. It is in fact an *exact* factorization: no variational bound as in a [VAE](@ml/vaes), no adversary as in a [GAN](@ml/gans), and — unlike a [flow](@ml/normalizing-flows) — no restriction to invertible layers. The likelihood it computes is exact, and the cost is paid somewhere else entirely.`,
    },
    {
      kind: 'explain',
      title: 'The chain rule is not an approximation',
      body: String.raw`Write a data point as an ordered list of $D$ components, $x=(x_1,\dots,x_D)$ — pixels in some fixed scanning order, tokens of a sentence, amino acids of a protein. The product rule of probability, applied $D-1$ times, gives

$$p(x)=p(x_1)\,p(x_2\mid x_1)\,p(x_3\mid x_1,x_2)\cdots p(x_D\mid x_{1:D-1})=\prod_{t=1}^{D}p(x_t\mid x_{<t}).$$

This is an **identity**, true for every joint distribution whatsoever. Nothing has been assumed and nothing has been lost.

So modelling $p(x)$ — a horribly high-dimensional object — has been turned into modelling $D$ ordinary **conditional** distributions, each over a single variable. If $x_t$ is one of $K$ discrete symbols, each factor is just a $K$-way classification: a [softmax](@ml/softmax-classification). We already know how to do that well.

The model is a network $f_\theta$ that reads $x_{<t}$ and emits the parameters of $p_\theta(x_t\mid x_{<t})$. Training is maximum likelihood,
$$\mathcal L(\theta)=-\sum_{t=1}^{D}\log p_\theta(x_t\mid x_{<t}),$$
which is exactly the familiar cross-entropy loss, summed over positions.`,
    },
    {
      kind: 'widget',
      title: 'Generate a sequence, factor by factor',
      body: String.raw`A toy model over four symbols. At each step the bars are the current conditional $p(\cdot\mid x_{<t})$; press **token ▶** to draw from it and the chain rule accumulates underneath: every token contributes one $\log p(x_t\mid x_{<t})$, and the running sum *is* $\log p(x)$ for the sequence so far.

Drop the temperature towards $0.2$ and the distribution sharpens to near-greedy; push it to $2$ and it flattens towards uniform. Here the temperature reshapes the model itself, $p\propto\exp(\text{logit}/T)$, so the bars, the tokens drawn and the running $\log p$ all refer to the *tempered* model; the model's own likelihood is the reading at $T=1$. (Changing $T$ restarts the sequence, since a half-finished chain would otherwise mix two models.)`,
      widget: { type: 'MlAutoregressiveSampler', props: { temperature: 1, length: 8, seed: 5 }, caption: 'Eight tokens, eight forward passes, eight softmaxes — and one exact log-likelihood.' },
    },
    {
      kind: 'numeric',
      prompt: String.raw`A language model assigns the conditional probabilities $0.5,\ 0.25,\ 0.1,\ 0.8$ to the four tokens of a sentence, in order. What is the model's **perplexity** on this sentence? (3 decimal places)`,
      answer: 3.162,
      tolerance: 0.004,
      why: String.raw`Perplexity is the geometric mean of $1/p$: $\mathrm{PPL}=\big(\prod_t p_t\big)^{-1/T}$. Here $\prod_t p_t=0.5\times0.25\times0.1\times0.8=0.01$, so $\mathrm{PPL}=0.01^{-1/4}=10^{1/2}=3.162$. Read it as "the model is as confused as if it were choosing uniformly among 3.16 options at each step". Averaging the probabilities instead of multiplying them is the usual slip — the chain rule multiplies.`,
    },
    {
      kind: 'explain',
      title: 'Cheap to score, slow to sample',
      body: String.raw`Here is the asymmetry that defines the whole family.

**Training is parallel.** During training the true $x$ is in front of you, so every conditional $p_\theta(x_t\mid x_{<t})$ can be evaluated *at the same time*, in one pass of a network that is **masked** so position $t$ cannot see positions $\ge t$. Feeding the ground-truth prefix rather than the model's own guesses is called **teacher forcing**.

**Sampling is sequential.** To generate, you must draw $x_1$, feed it back, draw $x_2$, feed it back… $D$ passes for $D$ components. A 1024-token paragraph needs 1024 passes; a $256\times256$ RGB image needs 196 608. No parallelism can remove the dependency, only hide its cost.

This is the mirror image of a GAN, which samples in one pass but cannot score, and the opposite end of the seesaw from a diffusion model, which trades many sampling steps for parallelism *within* each step.`,
      widget: { type: 'SvgDiagram', props: { svg: TRAINVSSAMPLE_SVG } },
    },
    {
      kind: 'mcq',
      prompt: 'Why can an autoregressive transformer be trained on a 1000-token sequence in a single forward pass, when generating 1000 tokens takes 1000 passes?',
      choices: [
        'Because during training the true prefix is already known, so all conditionals can be evaluated at once behind a causal mask',
        'Because the training loss only uses the final token, while generation needs all of them',
        'Because training uses an approximation to the likelihood that generation cannot use',
        'Because the model is only approximately autoregressive during training',
      ],
      answer: 0,
      why: String.raw`Teacher forcing is the key: the inputs for every position are the ground-truth tokens, which exist up front, so one masked pass produces all $D$ conditionals and all $D$ loss terms. At generation time token $t$ must be *drawn* before it can be fed in as context for $t+1$, so the passes cannot be merged. The loss uses every position, not just the last, and nothing about it is approximate.`,
    },
    {
      kind: 'widget',
      title: 'The mask that enforces the order',
      body: String.raw`The **causal mask** is on here — toggle it off and on to see what it does. Every attention weight with $j>i$ is driven to zero, so the vector at position $i$ is built only from positions $1,\dots,i$. That single change turns a bidirectional encoder into an autoregressive decoder — all $D$ conditionals, still in one pass.

This is the architecture behind GPT-style [language models](@ml/attention-transformers): the whole of "next-token prediction" is this mask plus a softmax over the vocabulary.`,
      widget: { type: 'MlAttentionHeatmap', props: { causal: true, query: 4, showScaling: false }, caption: 'Row $i$ of a causal attention map is supported only on columns $j\\le i$.' },
    },
    {
      kind: 'explain',
      title: 'Images in raster order: PixelCNN',
      body: String.raw`Nothing says the pieces have to be words. Van den Oord, Kalchbrenner & Kavukcuoglu (2016) applied the same recipe to pixels, scanning an image **row by row, left to right** and modelling each sub-pixel intensity as a 256-way softmax conditioned on everything earlier in the scan.

Their recurrent versions (PixelRNN) are accurate but slow to train. The convolutional version, **PixelCNN**, gets the parallel-training property back with **masked convolutions**: zero out the kernel weights that would read a pixel at or after the current one. Two masks are needed.
- **Mask A**, used in the first layer only, also blocks the centre tap — otherwise the model could read the very pixel it is predicting and the "likelihood" would be a fraud.
- **Mask B**, used in all later layers, allows the centre, because by then the centre holds *features* of strictly earlier pixels, not the pixel's own value.

A naive stack of masked square kernels leaves a **blind spot**: a wedge of pixels above and to the right that no amount of depth can reach. The Gated PixelCNN of van den Oord et al. (2016) fixes it by splitting the receptive field into a vertical stack and a horizontal stack that are combined at every layer.

One more design choice decides the quality of the fit: what family sits at the end. PixelRNN used a flat **256-way softmax** per sub-pixel, which has no idea that intensity 128 sits beside 129. **PixelCNN++** (Salimans, Karpathy, Chen & Kingma, 2017) replaced it with a **discretized mixture of logistics** — a continuous density integrated over each integer bin — for fewer parameters, built-in smoothness between adjacent intensities and better likelihoods. On CIFAR-10 the autoregressive models of that period reached roughly 2.9 bits per dimension, ahead of contemporaneous flows.`,
      widget: { type: 'SvgDiagram', props: { svg: RASTER_SVG }, caption: 'The scan order is a *choice*: the chain rule is valid for any of the $D!$ orders, but the network must be able to model the conditionals that order produces.' },
    },
    {
      kind: 'truefalse',
      prompt: 'Because the chain rule holds for any ordering of the components, the ordering chosen for an autoregressive model does not affect how well it fits the data.',
      answer: false,
      why: String.raw`The *factorization* is exact for every ordering, so an infinitely flexible model would not care. A real network is not infinitely flexible: raster order makes a pixel's nearest neighbours above and to the left easy to condition on, while an order that scattered neighbouring pixels far apart would demand much longer-range conditionals. Ordering is a genuine inductive bias — it is why text models read left to right and why order-agnostic training (NADE, XLNet) is a research topic rather than a free win.`,
    },
    {
      kind: 'explain',
      title: 'Reaching far back cheaply',
      body: String.raw`A conditional $p(x_t\mid x_{<t})$ may need to depend on something very far back. Three standard answers:

- **Recurrence** ([RNNs and LSTMs](@ml/lstm-gru)). The prefix is squeezed into a fixed-size hidden state. Unbounded context in principle, but training is sequential in $t$ and long-range gradients are fragile.
- **Dilated causal convolutions** (**WaveNet**, van den Oord et al., 2016, for raw audio at 16 kHz). Stack causal convolutions whose dilation doubles: $1,2,4,\dots$ With kernel width 2, a stack of $L$ layers has receptive field $2^{L}$ — exponential reach for linear depth and cost.
- **Causal self-attention** (the decoder transformer). Every position reaches every earlier position *directly*, in one layer. The price is $O(D^2)$ attention cost, which is what [efficient attention](@ml/efficient-attention) attacks.

Modern large language models are the third option at scale; the lesson on [tokenization and pretraining](@ml/tokenization-pretraining) picks that thread up.`,
    },
    {
      kind: 'numeric',
      prompt: String.raw`A WaveNet-style stack uses causal convolutions of kernel width 2 with dilations $1,2,4,\dots,512$ — one layer per dilation. How many time steps back can the top unit see, counting itself?`,
      answer: 1024,
      tolerance: 0.5,
      why: String.raw`A width-2 convolution with dilation $d$ adds $d$ extra steps of reach, so the receptive field is $1+\sum_{\ell}d_\ell = 1+(1+2+4+\cdots+512)=1+1023=1024$. Ten layers buy a context of 1024 samples, where ten plain width-2 layers would reach only 11. The doubling is what makes raw-audio modelling at 16 kHz feasible at all.`,
    },
    {
      kind: 'multi',
      prompt: 'Which of these are genuine properties of autoregressive models? (Select all that apply.)',
      choices: [
        'They give an exact log-likelihood, with no bound and no normalizing constant to estimate',
        'Generation costs one network pass per component',
        'They need an ordering of the components to be chosen in advance',
        'They can only be applied to discrete data such as text',
      ],
      answers: [0, 1, 2],
      why: String.raw`Each conditional is already normalized (a softmax, or a parametric density), so the product is a normalized likelihood — no partition function, no variational gap. The sequential cost and the need for an ordering are the two prices paid. Continuous data are fine: WaveNet's successors and PixelCNN++ use mixtures of logistics, and the conditionals could equally be Gaussians.`,
    },
    {
      kind: 'match',
      prompt: 'Match each model to the mechanism it uses to make position $t$ depend only on earlier positions.',
      pairs: [
        ['PixelCNN', 'Convolution kernels with the later-pixel weights zeroed (masks A and B)'],
        ['WaveNet', 'Causal convolutions with exponentially growing dilation'],
        ['GPT-style decoder', 'Attention logits set to $-\\infty$ for keys after the query'],
        ['Char-level LSTM', 'A hidden state carried forward one step at a time'],
      ],
      why: 'All four implement the same constraint — no peeking at the future — with different machinery, and that machinery decides the cost and the reach. Masks and causal attention keep training parallel; recurrence does not, but uses constant memory per step.',
    },
    {
      kind: 'order',
      prompt: 'Put the steps of one training update for an autoregressive language model in order.',
      steps: [
        'Take a batch of real sequences and shift them by one to form the prediction targets',
        'Run one forward pass through the causally masked network, producing logits at every position at once',
        'Turn each position’s logits into a conditional $p_\\theta(x_t\\mid x_{<t})$ with a softmax',
        'Sum the per-position cross-entropies $-\\log p_\\theta(x_t\\mid x_{<t})$ over the batch',
        'Backpropagate and take an optimizer step',
      ],
      why: 'The targets are the inputs shifted by one — that is all "next-token prediction" means mechanically. One masked pass yields every conditional, so the per-position losses can be summed before a single backward pass, which is why these models scale so well on parallel hardware.',
    },
    {
      kind: 'explain',
      title: 'The honest weaknesses',
      body: String.raw`- **Sampling latency.** $D$ sequential passes. Caching the keys and values of earlier positions removes the recomputation but not the serial chain; speculative decoding and distillation chip away at it ([decoding and efficient inference](@ml/llm-inference)).
- **Exposure bias.** Training conditions on true prefixes, generation conditions on the model's own output, so at generation time the model is asked about contexts it never saw while training. The *mismatch* is a fact of the training procedure; how much damage it does is genuinely contested, and the textbook story that errors inevitably compound is weaker than it is usually told. Experiments on text generation find that distortions do not simply accumulate step by step: models show a degree of self-recovery (He et al., 2021). The classic remedy, scheduled sampling (Bengio et al., 2015), is known to optimize an objective that is not consistent with the data distribution (Huszár, 2015), so a fix is not as simple as it sounds. Treat exposure bias as a real but modest and still-debated effect, not as the explanation for everything a sampler gets wrong.
- **No compact latent.** There is no $z$ to interpolate in or to compress with. Semantics live implicitly in the hidden states.
- **Likelihood is not perceptual quality.** A model can score well while producing samples a person judges poor, and vice versa (Theis, van den Oord & Bethge, 2016). This is why FID and human evaluation sit alongside bits-per-dimension.
- **An arbitrary order imposed on unordered data.** Molecules and sets have no canonical sequence; forcing one (a SMILES string, say) means the model must learn that many strings denote the same object.`,
    },
    {
      kind: 'fill',
      prompt: String.raw`An autoregressive model factorizes $p(x)$ with the ___ rule, which is an exact identity rather than an approximation. Training uses ___ forcing and costs one pass, while sampling costs ___ passes. PixelCNN enforces the ordering with ___ convolutions, and a decoder transformer does it with a causal ___ over the attention logits.`,
      bank: ['chain', 'teacher', 'D', 'two', 'masked', 'dilated', 'mask', 'softmax'],
      answer: ['chain', 'teacher', 'D', 'masked', 'mask'],
      why: String.raw`The chain rule $p(x)=\prod_t p(x_t\mid x_{<t})$ holds for every distribution. Teacher forcing feeds the ground-truth prefix so all positions can be scored in parallel; generation cannot do that and needs one pass per component. Masked convolutions and a causal attention mask are the two standard ways to make position $t$ blind to the future — dilation increases *reach*, it does not enforce causality by itself.`,
    },
    {
      kind: 'explain',
      title: 'Key takeaways',
      body: String.raw`- **Chain rule, exactly**: $p(x)=\prod_{t=1}^{D}p_\theta(x_t\mid x_{<t})$. No bound, no partition function, no adversary — the likelihood is exact and the loss is plain cross-entropy.
- **The trade**: one parallel masked pass to train (teacher forcing), $D$ sequential passes to sample.
- **Masking** is the mechanism: masked convolutions (PixelCNN, masks A and B), dilated causal convolutions (WaveNet), or a causal attention mask (decoder transformers).
- **Ordering** is a real inductive bias even though the factorization is order-independent.
- The **output family** matters: a 256-way softmax versus a discretized mixture of logistics changes both parameter count and likelihood.
- Weaknesses: slow generation, no latent space, likelihood that does not track perceived quality, and a train/generate mismatch (**exposure bias**) that is real but smaller and more debated than its reputation suggests.
- This is the backbone of modern [language models](@ml/tokenization-pretraining) — next-token prediction is exactly this lesson, scaled up.`,
    },
  ],
  references: [
    { authors: 'A. van den Oord, N. Kalchbrenner & K. Kavukcuoglu', title: 'Pixel Recurrent Neural Networks', year: 2016, venue: 'ICML', url: 'https://arxiv.org/abs/1601.06759' },
    { authors: 'A. van den Oord, N. Kalchbrenner, O. Vinyals, L. Espeholt, A. Graves & K. Kavukcuoglu', title: 'Conditional Image Generation with PixelCNN Decoders', year: 2016, venue: 'NeurIPS', url: 'https://arxiv.org/abs/1606.05328' },
    { authors: 'T. Salimans, A. Karpathy, X. Chen & D. P. Kingma', title: 'PixelCNN++: Improving the PixelCNN with Discretized Logistic Mixture Likelihood and Other Modifications', year: 2017, venue: 'ICLR', url: 'https://arxiv.org/abs/1701.05517' },
    { authors: 'A. van den Oord, S. Dieleman, H. Zen, K. Simonyan, O. Vinyals, A. Graves, N. Kalchbrenner, A. Senior & K. Kavukcuoglu', title: 'WaveNet: A Generative Model for Raw Audio', year: 2016, venue: 'arXiv:1609.03499', url: 'https://arxiv.org/abs/1609.03499' },
    { authors: 'T. He, J. Zhang, Z. Zhou & J. Glass', title: 'Exposure Bias versus Self-Recovery: Are Distortions Really Incremental for Autoregressive Text Generation?', year: 2021, venue: 'EMNLP', url: 'https://arxiv.org/abs/1905.10617' },
    { authors: 'S. Bengio, O. Vinyals, N. Jaitly & N. Shazeer', title: 'Scheduled Sampling for Sequence Prediction with Recurrent Neural Networks', year: 2015, venue: 'NeurIPS', url: 'https://arxiv.org/abs/1506.03099' },
    { authors: 'F. Huszár', title: 'How (not) to Train your Generative Model: Scheduled Sampling, Likelihood, Adversary?', year: 2015, venue: 'arXiv:1511.05101', url: 'https://arxiv.org/abs/1511.05101' },
    { authors: 'L. Theis, A. van den Oord & M. Bethge', title: 'A Note on the Evaluation of Generative Models', year: 2016, venue: 'ICLR', url: 'https://arxiv.org/abs/1511.01844' },
    { authors: 'H. Larochelle & I. Murray', title: 'The Neural Autoregressive Distribution Estimator', year: 2011, venue: 'AISTATS' },
  ],
} satisfies LessonContent;
