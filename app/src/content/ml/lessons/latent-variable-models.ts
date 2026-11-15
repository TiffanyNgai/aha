import type { LessonContent } from '../../types';

export default {
  cards: [
    {
      kind: 'explain',
      title: 'Hidden causes',
      body: String.raw`A photo of a face is 150,000 numbers, but the things that actually vary are few: pose, lighting, expression, identity. Those few numbers are never written in the file. They are **latent** — hidden.

A **latent-variable model** says the data were produced in two steps:
1. draw a hidden code $z\sim p(z)$ from a simple **prior** (usually $\mathcal N(0,I)$);
2. draw the observation $x\sim p_\theta(x\mid z)$ from a **decoder** (or likelihood).

The model of the data is what is left after forgetting $z$:
$$p_\theta(x)=\int p_\theta(x\mid z)\,p(z)\,dz.$$
A simple prior pushed through a flexible decoder gives a very complicated $p_\theta(x)$. That is the whole trick — and the integral is where all the difficulty lives.`,
    },
    {
      kind: 'recall',
      title: 'You have already built one: the Gaussian mixture',
      points: [
        String.raw`In a GMM the latent $z\in\{1,\dots,K\}$ is the component label, $p(z=k)=\pi_k$, and $p(x\mid z=k)=\mathcal N(x\mid\mu_k,\Sigma_k)$.`,
        String.raw`The integral becomes a sum: $p(x)=\sum_k\pi_k\,\mathcal N(x\mid\mu_k,\Sigma_k)$ — tractable because $K$ is small.`,
        String.raw`The **posterior** $p(z=k\mid x)$ is the *responsibility* $r_k$, computed by Bayes' rule in one line.`,
        String.raw`**EM** alternates computing responsibilities with re-estimating $\pi_k,\mu_k,\Sigma_k$; it never decreases $\log p(x)$.`,
      ],
      link: 'ml/gmm-em',
    },
    {
      kind: 'widget',
      title: 'A latent-variable model you can watch being fitted',
      body: String.raw`Each point's colour is its posterior over the hidden label. The whole of this unit is about what to do when $z$ is *continuous* and high-dimensional, so that this sum becomes an integral you cannot do.`,
      widget: { type: 'MlGmmEM', props: { K: 3, dataset: 'mixed' } },
    },
    {
      kind: 'explain',
      title: 'Continuous latents: the linear-Gaussian case',
      body: String.raw`Let $z\in\mathbb R^M$ with $z\sim\mathcal N(0,I)$ and a **linear** decoder
$$x = Wz+\mu+\varepsilon,\qquad \varepsilon\sim\mathcal N(0,\sigma^2 I).$$
Because everything is Gaussian and linear, the integral has a closed form:
$$p_\theta(x)=\mathcal N\big(x\mid\mu,\ WW^{\!\top}+\sigma^2 I\big).$$
This is **probabilistic PCA** (Tipping & Bishop, 1999); it is ordinary [PCA](@ml/pca) in the limit $\sigma^2\to0$. The posterior is Gaussian too:
$$p(z\mid x)=\mathcal N\big(M^{-1}W^{\!\top}(x-\mu),\ \sigma^2M^{-1}\big),\qquad M=W^{\!\top}W+\sigma^2 I.$$

So a continuous latent is *not* automatically hard. What breaks the moment you make the decoder a neural network is that neither the integral nor the posterior stays Gaussian.`,
    },
    {
      kind: 'numeric',
      prompt: String.raw`Take the 1D case $x = 2z+\varepsilon$ with $z\sim\mathcal N(0,1)$ and $\varepsilon\sim\mathcal N(0,1)$ ($W=2$, $\mu=0$, $\sigma^2=1$). What is the variance of the posterior $p(z\mid x)$?`,
      answer: 0.2,
      tolerance: 0.002,
      why: String.raw`Here $M=W^2+\sigma^2=4+1=5$, so the posterior variance is $\sigma^2/M=1/5=0.2$ and the posterior mean is $2x/5$. Observing $x$ has cut the variance of $z$ from 1 down to 0.2. Note the marginal variance of $x$ is $W^2+\sigma^2=5$, a different quantity.`,
    },
    {
      kind: 'explain',
      title: 'Why the integral is hopeless',
      body: String.raw`With a neural decoder $p_\theta(x\mid z)=\mathcal N\big(f_\theta(z),\sigma^2 I\big)$, the marginal
$$p_\theta(x)=\int \mathcal N\big(x\mid f_\theta(z),\sigma^2I\big)\,\mathcal N(z\mid 0,I)\,dz$$
has no closed form, and $z$ may have 100 or more dimensions.

Could we just average? Draw $z^{(1)},\dots,z^{(S)}\sim\mathcal N(0,I)$ and take $\hat p=\frac1S\sum_s p_\theta(x\mid z^{(s)})$. It is unbiased, but useless: for a given $x$ almost every prior sample decodes to something completely unlike $x$, so almost every term is astronomically small. The estimator's variance is enormous, and $\log\hat p$ is badly biased downward.

The fix is **importance sampling**: draw $z$ from somewhere sensible — near the codes that could plausibly have produced *this* $x$. That "somewhere sensible" is the posterior $p_\theta(z\mid x)$, which by Bayes' rule is
$$p_\theta(z\mid x)=\frac{p_\theta(x\mid z)p(z)}{p_\theta(x)}$$
and needs the very quantity we cannot compute. Hence: approximate it.`,
    },
    {
      kind: 'mcq',
      prompt: String.raw`Why is estimating $p_\theta(x)$ by averaging $p_\theta(x\mid z^{(s)})$ over prior samples $z^{(s)}\sim p(z)$ impractical in high dimensions?`,
      choices: [
        'The estimator is biased, so it converges to the wrong value',
        'Almost all prior samples land in regions that explain x terribly, so nearly all terms are negligible and the variance is huge',
        String.raw`$p_\theta(x\mid z)$ cannot be evaluated for a given $z$`,
        'Sampling from a standard Gaussian is computationally expensive',
      ],
      answer: 1,
      why: String.raw`The estimator is perfectly unbiased for $p_\theta(x)$ — that is not the problem. The problem is concentration: the posterior occupies a vanishing fraction of the prior's volume, so a few rare draws carry all the mass and any feasible $S$ misses them. Evaluating the decoder density at a given $z$ is cheap, and so is Gaussian sampling.`,
    },
    {
      kind: 'explain',
      title: 'Introduce a guess: the variational distribution',
      body: String.raw`Pick any distribution $q(z)$ over the latent that you *can* sample from and evaluate — say $\mathcal N(m,\operatorname{diag}(s^2))$. Multiply and divide inside the integral:
$$\log p_\theta(x)=\log\int q(z)\,\frac{p_\theta(x\mid z)p(z)}{q(z)}\,dz=\log\ \mathbb E_{q}\!\left[\frac{p_\theta(x,z)}{q(z)}\right].$$
The ratio $p_\theta(x,z)/q(z)$ is an **importance weight**: it corrects for sampling from $q$ instead of the prior.

The expectation is still inside a logarithm, which is what blocks a Monte-Carlo estimate from being an unbiased estimate of $\log p$. One application of **Jensen's inequality** ($\log$ is concave, so $\log\mathbb E[\cdot]\ge\mathbb E[\log\cdot]$) moves the log inside and gives a lower bound we can actually optimize.`,
    },
    {
      kind: 'widget',
      title: 'The ELBO, twice',
      body: String.raw`Two derivations of the same inequality. The second one is more informative: it tells you *exactly* how much the bound loses.`,
      widget: {
        type: 'StepReveal',
        props: {
          steps: [
            String.raw`**Route 1 (Jensen).** $\log p_\theta(x)=\log\mathbb E_{q}\!\left[\dfrac{p_\theta(x,z)}{q(z)}\right]\ \ge\ \mathbb E_{q}\!\left[\log\dfrac{p_\theta(x,z)}{q(z)}\right]\ =:\ \mathcal L(q,\theta)$.`,
            String.raw`$\mathcal L$ is the **evidence lower bound (ELBO)**: "evidence" is the old name for $p_\theta(x)$, and this is a lower bound on its log.`,
            String.raw`**Route 2 (exact identity).** Write $p_\theta(x,z)=p_\theta(z\mid x)\,p_\theta(x)$ inside the expectation:
$$\mathbb E_q\!\left[\log\frac{p_\theta(z\mid x)p_\theta(x)}{q(z)}\right]=\log p_\theta(x)-D_{\mathrm{KL}}\big(q(z)\,\|\,p_\theta(z\mid x)\big).$$`,
            String.raw`So **exactly**: $\ \log p_\theta(x)=\mathcal L(q,\theta)+D_{\mathrm{KL}}\big(q(z)\|p_\theta(z\mid x)\big)$.`,
            String.raw`The KL is $\ge0$, which re-proves the bound — and names the gap. The bound is **tight** ($\mathcal L=\log p_\theta(x)$) if and only if $q$ equals the true posterior.`,
            String.raw`Therefore maximizing $\mathcal L$ over $q$ does two useful things at once: it tightens the bound on $\log p_\theta(x)$ *and* drives $q$ toward the posterior. Maximizing over $\theta$ then fits the model.`,
          ],
          notes: ['One line of Jensen.', 'The name.', 'No inequality used here — this is an identity.', 'The decomposition.', 'The gap is a KL divergence.', 'Why one objective does inference and learning together.'],
        },
      },
    },
    {
      kind: 'numeric',
      prompt: String.raw`For a particular $x$ and a particular $q$, the ELBO is $-98.4$ nats while the true $\log p_\theta(x)$ is $-96.1$ nats. What is $D_{\mathrm{KL}}\big(q(z)\|p_\theta(z\mid x)\big)$, in nats?`,
      answer: 2.3,
      tolerance: 0.02,
      why: String.raw`The identity $\log p_\theta(x)=\mathcal L+D_{\mathrm{KL}}$ gives $D_{\mathrm{KL}}=-96.1-(-98.4)=2.3$ nats. Because the gap is a KL it can never be negative — the ELBO can never exceed the true log-likelihood, which is why reporting an ELBO is always a *conservative* claim about a model.`,
    },
    {
      kind: 'explain',
      title: 'The ELBO you actually implement',
      body: String.raw`Split $p_\theta(x,z)=p_\theta(x\mid z)p(z)$ inside the expectation:
$$\mathcal L(q,\theta)=\underbrace{\mathbb E_{q(z)}\big[\log p_\theta(x\mid z)\big]}_{\text{reconstruction}}-\underbrace{D_{\mathrm{KL}}\big(q(z)\,\|\,p(z)\big)}_{\text{regularizer}}.$$

Read it as a tug-of-war:
- The first term wants $q$ to concentrate on codes that reconstruct *this* $x$ well.
- The second wants $q$ to look like the prior — to stay vague, cheap to describe.

That second reading is literal. In bits, $D_{\mathrm{KL}}(q\|p)$ is the extra cost of transmitting a code drawn from $q$ using a code-book built for $p$, so the ELBO is (minus) the length of a two-part message: first the latent, then the residual. Maximizing the ELBO is therefore minimizing the expected length of such a message (the idea behind *bits-back coding*).

A third, equivalent grouping is $\mathcal L=\mathbb E_q[\log p_\theta(x,z)]+\mathbb H[q]$ — fit the joint, but keep $q$ as uncertain as possible.`,
    },
    {
      kind: 'truefalse',
      prompt: String.raw`If the family of approximate posteriors $q$ is rich enough to contain the true posterior $p_\theta(z\mid x)$, then maximizing the ELBO over $q$ makes it equal to $\log p_\theta(x)$.`,
      answer: true,
      why: String.raw`The gap is exactly $D_{\mathrm{KL}}(q\|p_\theta(z\mid x))$, which is zero only when $q=p_\theta(z\mid x)$. If that posterior is reachable, the maximizing $q$ finds it and the bound closes. In practice $q$ is restricted — typically to diagonal Gaussians — so a stubborn gap remains, and the model is quietly pushed toward having posteriors that the restricted family *can* match.`,
    },
    {
      kind: 'explain',
      title: 'EM is ELBO maximization',
      body: String.raw`With the ELBO in hand, [EM](@ml/gmm-em) stops looking like a separate algorithm. It is coordinate ascent on $\mathcal L(q,\theta)$, one example's $q_i$ at a time:

- **E-step:** maximize over $q_i$ with $\theta$ fixed. When the posterior is available in closed form the maximizer is $q_i(z)=p_\theta(z\mid x_i)$ — for a GMM, the responsibilities. The bound becomes tight, so $\mathcal L=\log p_\theta(x_i)$.
- **M-step:** maximize over $\theta$ with $q_i$ fixed. Only $\mathbb E_{q_i}[\log p_\theta(x_i,z)]$ depends on $\theta$; the entropy term is constant.

Since the E-step makes the bound tight and the M-step raises it, $\log p_\theta$ never decreases. **Variational inference** ([more here](@ml/variational-inference)) is the same scheme when the E-step cannot be solved exactly: restrict $q$ to a tractable family and *optimize* it instead.

The remaining problem is cost. Classical VI stores separate variational parameters $(m_i,s_i)$ for every training example and re-optimizes them whenever $\theta$ moves — hopeless for a million images. The [VAE](@ml/vaes) fixes this by **amortizing**: train one encoder network $q_\phi(z\mid x)$ that predicts $(m,s)$ from $x$ in a single forward pass.`,
    },
    {
      kind: 'match',
      prompt: 'Match each symbol to what it means in a latent-variable model.',
      pairs: [
        [String.raw`$p(z)$`, 'Prior over the hidden code, usually N(0, I)'],
        [String.raw`$p_\theta(x\mid z)$`, 'Decoder / likelihood: how a code becomes data'],
        [String.raw`$p_\theta(z\mid x)$`, 'True posterior — generally intractable'],
        [String.raw`$q(z)$ or $q_\phi(z\mid x)$`, 'Tractable approximation to the posterior'],
        [String.raw`$D_{\mathrm{KL}}(q\|p_\theta(z\mid x))$`, 'Exactly the gap between the ELBO and log p(x)'],
      ],
      why: String.raw`The generative direction is prior → decoder → data; the inference direction is data → posterior → code. The whole variational apparatus exists because that second arrow is intractable, and the price of approximating it is a KL divergence that you never get to measure directly.`,
    },
    {
      kind: 'fill',
      prompt: String.raw`The ELBO equals a ___ term minus the ___ between the approximate posterior and the ___. Its gap to $\log p_\theta(x)$ is the KL between the approximate posterior and the true ___.`,
      bank: ['reconstruction', 'KL divergence', 'prior', 'posterior', 'entropy', 'likelihood', 'decoder'],
      answer: ['reconstruction', 'KL divergence', 'prior', 'posterior'],
      why: String.raw`$\mathcal L=\mathbb E_q[\log p_\theta(x\mid z)]-D_{\mathrm{KL}}(q(z)\|p(z))$ — the KL inside the objective compares $q$ to the **prior**, and you can compute it. The KL that measures the bound's slack compares $q$ to the **true posterior**, and you cannot. Confusing the two is the single most common mistake with the ELBO.`,
    },
    {
      kind: 'order',
      prompt: 'Order the logical steps that turn an intractable marginal likelihood into a trainable objective.',
      steps: [
        String.raw`Write the model as $p_\theta(x)=\int p_\theta(x\mid z)p(z)\,dz$`,
        String.raw`Observe that both the integral and the posterior $p_\theta(z\mid x)$ are intractable`,
        String.raw`Introduce a tractable $q(z)$ and rewrite $\log p_\theta(x)$ as an expectation of importance weights under $q$`,
        String.raw`Apply Jensen to get the ELBO, and note the gap is $D_{\mathrm{KL}}(q\|p_\theta(z\mid x))$`,
        String.raw`Maximize the ELBO jointly over $q$ (inference) and $\theta$ (learning)`,
      ],
      why: String.raw`Each step is forced by the previous one. The bound is only worth having because its gap has a name and is non-negative, which is what lets a single objective serve as both an inference procedure and a learning criterion.`,
    },
    {
      kind: 'explain',
      title: 'Key takeaways',
      body: String.raw`- A latent-variable model is $p_\theta(x)=\int p_\theta(x\mid z)p(z)\,dz$: simple prior, flexible decoder.
- Discrete $z$ (a GMM) or a linear-Gaussian decoder (probabilistic PCA) keep the integral closed-form. A neural decoder does not.
- **Exact identity:** $\log p_\theta(x)=\mathcal L(q,\theta)+D_{\mathrm{KL}}\big(q(z)\|p_\theta(z\mid x)\big)$, so the **ELBO** $\mathcal L$ is a lower bound, tight iff $q$ is the true posterior.
- Implementable form: $\mathcal L=\mathbb E_q[\log p_\theta(x\mid z)]-D_{\mathrm{KL}}(q(z)\|p(z))$ — reconstruct well, stay near the prior.
- EM is coordinate ascent on the ELBO; variational inference is the version with a restricted $q$; the [VAE](@ml/vaes) is the version with an **amortized** $q_\phi(z\mid x)$.`,
    },
  ],
  references: [
    { authors: 'C. M. Bishop', title: 'Pattern Recognition and Machine Learning', year: 2006, venue: 'Springer', detail: 'Ch. 9 (Sec. 9.4), Ch. 10 (Sec. 10.1), Sec. 12.2' },
    { authors: 'M. E. Tipping & C. M. Bishop', title: 'Probabilistic Principal Component Analysis', year: 1999, venue: 'Journal of the Royal Statistical Society, Series B 61(3), 611–622' },
    { authors: 'D. M. Blei, A. Kucukelbir & J. D. McAuliffe', title: 'Variational Inference: A Review for Statisticians', year: 2017, venue: 'Journal of the American Statistical Association 112(518), 859–877', url: 'https://arxiv.org/abs/1601.00670' },
    { authors: 'D. P. Kingma & M. Welling', title: 'An Introduction to Variational Autoencoders', year: 2019, venue: 'Foundations and Trends in Machine Learning 12(4), 307–392', url: 'https://arxiv.org/abs/1906.02691' },
    { authors: 'K. P. Murphy', title: 'Probabilistic Machine Learning: Advanced Topics', year: 2023, venue: 'MIT Press', detail: 'Ch. 10, 20', url: 'https://probml.github.io/pml-book/book2.html' },
  ],
} satisfies LessonContent;
