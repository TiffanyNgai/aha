import type { LessonContent } from '../../types';

export default {
  cards: [
    {
      kind: 'explain',
      title: 'Two bad models, one good number',
      body: String.raw`A generative model can fail in two opposite ways. It can produce beautiful samples that only ever cover a corner of the data — **mode collapse**, the classic [GAN](@ml/gans) pathology. Or it can cover everything while producing blurry nonsense in between. These are *different* failures and no single scalar can separate them, yet most papers still lead with one: FID.

The widget below makes the dissociation concrete. Grey is the real data (three modes), purple is a generator you can break in three ways.

Drop to **1 mode**: recall falls to about a third while precision stays near 1. Now put all three modes back and push **spread** to 2.5: recall returns to 1 and precision falls instead — and FID is *smaller* here than it was for the collapsed model, even though a large share of the samples are now off-manifold. One number cannot tell you which failure you are looking at.`,
      widget: { type: 'MlFidPrecisionRecall', props: { modes: 3, spread: 1, shift: 0 } },
    },
    {
      kind: 'explain',
      title: 'Four questions, not one',
      body: String.raw`Before choosing a metric, decide what you are actually asking. Four questions recur, and they come apart:

1. **Fidelity.** Do individual samples look like plausible data? (precision-style metrics, human raters)
2. **Diversity / coverage.** Does the model reach all of the data distribution? (recall-style metrics, mode counts)
3. **Density estimation.** Does the model assign sensible probability to held-out data? (log-likelihood, bits per dimension)
4. **Novelty and safety.** Is the model producing new things, or reciting its training set? (memorisation audits, near-duplicate search)

A model can be excellent at (1) and terrible at (2), or excellent at (3) and terrible at (1) — the next few cards show exactly how. "Which model is best?" is not a well-posed question until you name the column.`,
    },
    {
      kind: 'explain',
      title: 'Likelihood and bits per dimension',
      body: String.raw`For models that define an explicit density — [autoregressive models](@ml/autoregressive-models), [normalizing flows](@ml/normalizing-flows), diffusion models via the probability-flow ODE — the natural score is the held-out negative log-likelihood. To compare across datasets it is normalised:
$$\text{bits/dim}=\frac{-\log p(\mathbf x)}{D\,\ln 2},$$
where $D$ is the number of dimensions (for $32\times32$ colour images, $D=3\times32\times32=3072$).

Three things to get right before quoting one. Images are **discrete** (8-bit integers), so a continuous density must be *dequantised* — add uniform noise in $[0,1)$ and the result bounds the discrete likelihood; comparing a dequantised number to a genuinely discrete one is meaningless. Diffusion models report a **bound** (the ELBO) unless they use the exact ODE likelihood. And a model trained with DDPM's $\mathcal L_{\text{simple}}$ is explicitly *not* optimising likelihood, so its bits/dim is not where it is trying to win.`,
    },
    {
      kind: 'numeric',
      prompt: String.raw`A model reports an average negative log-likelihood of $6400$ nats per CIFAR-10 image, where each image has $D=3\times32\times32=3072$ dimensions. What is this in bits per dimension?`,
      answer: 3.006,
      tolerance: 0.01,
      why: String.raw`Convert nats to bits and divide by the dimension: $6400/(3072\times\ln 2)=6400/2129.3\approx3.006$. The $\ln2\approx0.693$ is the only subtlety — forgetting it gives $2.08$, which would be a suspiciously good score. For reference, the score-SDE paper reports 2.99 bits/dim on CIFAR-10 via the exact ODE likelihood.`,
    },
    {
      kind: 'explain',
      title: 'Why a great likelihood does not mean great samples',
      body: String.raw`**Theis, van den Oord & Bethge (2016)** made this precise with an argument you can check in one line. Take a superb sample generator $p$ and a useless noise model $n$, and mix them:
$$q(\mathbf x)=0.01\,p(\mathbf x)+0.99\,n(\mathbf x)\ \ \Longrightarrow\ \ \log q(\mathbf x)\ \ge\ \log p(\mathbf x)-\ln 100 .$$
The penalty is $4.61$ nats *in total*. Spread over $D=3072$ dimensions that is $4.61/(3072\ln2)\approx0.0022$ bits/dim — invisible against typical scores around 3. Yet **99% of $q$'s samples are pure noise**.

Run the argument backwards and you get the other direction: a model that memorises the training set produces perfect-looking samples and assigns near-zero density to anything held out. In high dimensions, log-likelihood and sample quality are close to independent axes. They should both be reported, and neither should be called "quality".`,
    },
    {
      kind: 'truefalse',
      prompt: String.raw`If model A has a better held-out log-likelihood than model B, its samples will look at least as good as B's.`,
      answer: false,
      why: String.raw`The mixture construction $q=0.01p+0.99n$ costs only about $0.002$ bits/dim while making 99% of samples noise, so a tiny likelihood advantage carries no information about sample quality at all. The converse also fails: likelihood in high dimensions is dominated by local statistics, and models can be ranked by it in an order that no human rater reproduces.`,
    },
    {
      kind: 'explain',
      title: 'FID: the Fréchet Inception Distance',
      body: String.raw`**Heusel et al. (2017)** proposed the metric that took over the field. Push $N$ real and $N$ generated images through an **Inception-v3** network trained on ImageNet, keep the 2048-dimensional pool3 activations, fit one Gaussian to each set, and report the Fréchet (Wasserstein-2) distance between the two Gaussians:
$$\text{FID}=\|\boldsymbol\mu_r-\boldsymbol\mu_g\|^2+\operatorname{Tr}\Big(\Sigma_r+\Sigma_g-2\big(\Sigma_r\Sigma_g\big)^{1/2}\Big).$$
Lower is better; 0 means the two fitted Gaussians coincide. Its virtues are real: it compares against the data (unlike Inception Score), it is sensitive to blur and to artefacts, it responds to mode dropping, and it correlates with human judgement far better than the pixel-space distances it replaced.

Note what it is *not*: it is not a distance between the distributions, only between two Gaussian summaries of them in a particular feature space.`,
    },
    {
      kind: 'mcq',
      prompt: 'A model generates only one of the three real modes, but generates it perfectly. What happens to FID and to k-NN precision/recall?',
      choices: [
        'FID is near zero; precision and recall are both near 1.',
        'FID rises because the fitted covariance and mean are wrong; precision stays high while recall falls.',
        'FID is unchanged, since every individual sample is realistic.',
        'Precision falls to roughly 1/3 while recall stays at 1.',
      ],
      answer: 1,
      why: String.raw`Every generated sample lies inside the real manifold, so precision is high; two thirds of the real data has no generated neighbour, so recall collapses. FID notices — the Gaussian fitted to one mode has the wrong mean and a far smaller covariance — but it returns a single number that an identical-sized penalty from blurry samples would also produce. Precision is about the *generated* points, so it does not fall when a mode is dropped.`,
    },
    {
      kind: 'explain',
      title: 'What is documented to be wrong with FID',
      body: String.raw`Not folklore — each of these has a paper.

- **The estimator is biased, and the bias depends on $N$.** FID computed on 10k samples is systematically larger than on 50k from the same model, so numbers from different papers are often not comparable. Chong & Forsyth (2020) quantified this and proposed extrapolating to $\text{FID}_\infty$.
- **The Gaussian assumption is false.** Inception features are not Gaussian, so the metric throws away every moment above the second. Two very different distributions can share a mean and covariance.
- **Low-level image processing moves it.** Parmar, Zhang & Zhu (2022) showed that the resizing filter, the JPEG quantisation and the image library used in preprocessing change FID by amounts comparable to real model differences — hence "clean-FID".
- **It inherits ImageNet's priorities.** Kynkäänniemi et al. (2023) showed FID can be improved substantially by shifting the generated set's *ImageNet class histogram* toward the reference, without improving the images.
- **It disagrees with humans.** Stein et al. (2023) ran a large human study and found FID's ranking of modern models did not match human judgement, with alternative feature extractors (e.g. DINOv2) agreeing better.

None of this makes FID useless. It makes it a **relative** diagnostic, valid within one codebase and one fixed protocol, and not a quantity to compare across papers to two decimal places.`,
    },
    {
      kind: 'multi',
      prompt: 'Which of these are documented problems with FID? (Select all that apply.)',
      choices: [
        'Its value depends on the number of samples used, so results from different sample sizes are not comparable.',
        'It summarises the feature distributions by their mean and covariance only.',
        'It is sensitive to image resizing and compression choices made before the metric is computed.',
        'It cannot detect mode dropping at all.',
      ],
      answers: [0, 1, 2],
      why: String.raw`Sample-size bias, the Gaussian summary and preprocessing sensitivity are all measured effects with papers attached. Mode dropping *is* detected — losing a mode changes both the mean and the covariance — but the metric cannot tell you that mode dropping rather than blur was the cause, which is the real complaint.`,
    },
    {
      kind: 'explain',
      title: 'Splitting quality into two numbers',
      body: String.raw`**Sajjadi et al. (2018)** argued that a one-dimensional score cannot express a two-dimensional failure, and proposed a precision/recall *curve*. **Kynkäänniemi et al. (2019)** gave the version most people use, based on $k$-nearest-neighbour manifolds:

- Build the real manifold as the union of balls around each real sample, each with radius its $k$-th nearest-neighbour distance (typically $k=3$); do the same for the generated set.
- **Precision** = the fraction of *generated* samples that land inside the real manifold — fidelity.
- **Recall** = the fraction of *real* samples inside the generated manifold — coverage.

The honest caveat: both are sensitive to outliers, because one stray real sample inflates its own $k$-NN radius and swallows a large region. **Naeem et al. (2020)** proposed **density** and **coverage** as more robust replacements, which is the pair to prefer when the data has heavy tails.`,
    },
    {
      kind: 'match',
      prompt: 'Match each metric to the question it answers.',
      pairs: [
        ['Bits per dimension on held-out data', 'Does the model assign sensible probability to data it has not seen?'],
        ['FID', 'How far apart are Gaussian summaries of real and generated features?'],
        ['k-NN precision', 'What fraction of generated samples are realistic?'],
        ['k-NN recall / coverage', 'What fraction of the real distribution does the model reach?'],
        ['Near-duplicate search against the training set', 'Is the model producing new samples or reproducing its training data?'],
      ],
      why: String.raw`Each row answers a different question, and a model can score well on any subset while failing the rest. The useful habit is to pick the question first and the metric second — the reverse order is how a leaderboard number ends up standing in for a claim nobody tested.`,
    },
    {
      kind: 'explain',
      title: 'Humans: necessary, expensive, and easy to do badly',
      body: String.raw`For images, audio and text, human judgement is the thing automatic metrics are proxies *for*, so at some point you have to ask people. The standard designs:

- **Two-alternative forced choice.** Show a rater one real and one generated sample, ask which is real; the "fooling rate" tends to 50% for a perfect model.
- **Pairwise model comparison.** Show two models' outputs for the same prompt, ask which is better, and aggregate into a ranking.
- **Rated attributes.** Separate scales for realism, prompt alignment, aesthetics — because raters otherwise collapse everything into one impression.

Where it goes wrong: too few raters and too few prompts (variance swamps the effect), unmeasured rater expertise, cherry-picked prompts, no measure of agreement between raters, and comparisons run at different sampling settings — guidance scale alone can move perceived quality more than the architecture being tested. Report the number of raters, the prompt set, the sampling configuration, and a confidence interval, or the study is not interpretable.`,
    },
    {
      kind: 'fill',
      prompt: String.raw`FID fits a ___ to Inception features of each set and compares them; it is therefore blind to all moments beyond the ___ . Precision measures the fraction of ___ samples inside the real manifold, and recall the fraction of ___ samples inside the generated manifold.`,
      bank: ['Gaussian', 'histogram', 'second', 'fourth', 'generated', 'real', 'held-out'],
      answer: ['Gaussian', 'second', 'generated', 'real'],
      why: String.raw`A Gaussian is determined by its mean and covariance, so anything in the third moment upward is invisible to FID. The precision/recall pair is deliberately asymmetric: precision asks about the generator's output, recall asks whether the data is reachable — swapping them is the single most common error in reading these numbers.`,
    },
    {
      kind: 'explain',
      title: 'Domain metrics, and the memorisation check nobody runs',
      body: String.raw`Outside natural images the standard metrics do not exist, and surrogate metrics breed fast. Molecular generation reports **validity, uniqueness and novelty** — and the widget below shows how easily all three are gamed: a toy generator emitting straight-chain alkanes scores near 100% on every one while being useless (real validity/uniqueness/novelty rates depend on how varied the chains are).

The check that actually matters and is most often skipped is **memorisation**. Carlini et al. (2023) extracted verbatim training images from production diffusion models by generating many samples per prompt and searching for near-duplicates. A model's FID can be flattered by reproducing training data, since training data is, by construction, perfectly realistic. Any evaluation that reports fidelity without a nearest-neighbour search against the training set is incomplete — and for anything deployed, it is a legal and privacy question, not only a scientific one.`,
      widget: { type: 'DrugGenMetrics', props: { generator: 'alkane', n: 200 }, caption: String.raw`Switch the generator to **copycat** (a memoriser): validity stays high while novelty collapses (and, in this toy, uniqueness drops too) — only a metric that looks at the training set notices the memorisation.` },
    },
    {
      kind: 'order',
      prompt: 'Order a defensible evaluation protocol for a new image generator.',
      steps: [
        'State the claim and the question it belongs to: fidelity, diversity, likelihood or novelty',
        'Fix the protocol: sample count, preprocessing, feature extractor, sampling settings — identical for every model compared',
        'Report a fidelity/diversity pair (precision and recall, or density and coverage) alongside any single-number score',
        'Run a nearest-neighbour search against the training set to rule out memorisation',
        'Run a human study on the specific claim, with enough raters and prompts to put a confidence interval on it',
      ],
      why: String.raw`The order matters because each step constrains the next: the claim decides the metric, the protocol decides whether two numbers can be compared at all, and automatic metrics are screening tools whose job is to decide what is worth a human study. Reversing it — compute FID, then write the claim it supports — is how the field accumulated unreproducible rankings.`,
    },
    {
      kind: 'explain',
      title: 'Key takeaways',
      body: String.raw`- Fidelity, diversity, density estimation and novelty are **four different questions**. No scalar answers more than one.
- **Bits/dim** $=-\log p(\mathbf x)/(D\ln2)$ needs matched dequantisation to be comparable, and a bound is not a likelihood.
- Likelihood and sample quality are nearly independent in high dimensions: $q=0.01p+0.99n$ costs about $0.002$ bits/dim and makes 99% of samples noise (Theis et al., 2016).
- **FID** = Fréchet distance between Gaussians fitted to Inception features. Documented problems: sample-size bias, the Gaussian summary, preprocessing sensitivity, ImageNet-class dependence, and disagreement with human raters.
- Report a **pair**: precision/recall (Kynkäänniemi et al., 2019) or the outlier-robust density/coverage (Naeem et al., 2020).
- **Human studies** are the ground truth the proxies approximate — and are only interpretable with rater counts, prompt sets, sampling settings and error bars.
- Always check **memorisation**: realistic samples can be training samples.`,
    },
  ],
  references: [
    { authors: 'M. Heusel, H. Ramsauer, T. Unterthiner, B. Nessler & S. Hochreiter', title: 'GANs Trained by a Two Time-Scale Update Rule Converge to a Local Nash Equilibrium', year: 2017, venue: 'NeurIPS (introduces FID)', url: 'https://arxiv.org/abs/1706.08500' },
    { authors: 'L. Theis, A. van den Oord & M. Bethge', title: 'A note on the evaluation of generative models', year: 2016, venue: 'ICLR', url: 'https://arxiv.org/abs/1511.01844' },
    { authors: 'T. Kynkäänniemi, T. Karras, S. Laine, J. Lehtinen & T. Aila', title: 'Improved Precision and Recall Metric for Assessing Generative Models', year: 2019, venue: 'NeurIPS', url: 'https://arxiv.org/abs/1904.06991' },
    { authors: 'G. Parmar, R. Zhang & J.-Y. Zhu', title: 'On Aliased Resizing and Surprising Subtleties in GAN Evaluation', year: 2022, venue: 'CVPR', url: 'https://arxiv.org/abs/2104.11222' },
    { authors: 'G. Stein et al.', title: 'Exposing flaws of generative model evaluation metrics and their unfair treatment of diffusion models', year: 2023, venue: 'NeurIPS', url: 'https://arxiv.org/abs/2306.04675' },
    { authors: 'M. J. Chong & D. Forsyth', title: 'Effectively Unbiased FID and Inception Score and Where to Find Them', year: 2020, venue: 'CVPR', url: 'https://arxiv.org/abs/1911.07023' },
    { authors: 'T. Kynkäänniemi, T. Karras, M. Aittala, T. Aila & J. Lehtinen', title: 'The Role of ImageNet Classes in Fréchet Inception Distance', year: 2023, venue: 'ICLR', url: 'https://arxiv.org/abs/2203.06026' },
    { authors: 'M. S. M. Sajjadi, O. Bachem, M. Lucic, O. Bousquet & S. Gelly', title: 'Assessing Generative Models via Precision and Recall', year: 2018, venue: 'NeurIPS', url: 'https://arxiv.org/abs/1806.00035' },
    { authors: 'M. F. Naeem, S. J. Oh, Y. Uh, Y. Choi & J. Yoo', title: 'Reliable Fidelity and Diversity Metrics for Generative Models', year: 2020, venue: 'ICML', url: 'https://arxiv.org/abs/2002.09797' },
    { authors: 'N. Carlini et al.', title: 'Extracting Training Data from Diffusion Models', year: 2023, venue: 'USENIX Security', url: 'https://arxiv.org/abs/2301.13188' },
  ],
} satisfies LessonContent;
