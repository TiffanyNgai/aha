import type { LessonContent } from '../../types';

// |x| has a weak derivative (sgn); sgn does not — its distributional derivative is 2δ₀.
const weakDerivSvg = String.raw`<svg viewBox="0 0 320 212" xmlns="http://www.w3.org/2000/svg" font-size="9" font-family="inherit">
  <text x="160" y="13" text-anchor="middle" font-size="10.5" font-weight="bold" fill="var(--fg)">one differentiation too many</text>

  <!-- panel 1: |x| -->
  <g>
    <line x1="14" y1="96" x2="100" y2="96" stroke="var(--grid)"/>
    <line x1="57" y1="34" x2="57" y2="100" stroke="var(--grid)"/>
    <path d="M 18 42 L 57 96 L 96 42" fill="none" stroke="var(--c2)" stroke-width="2.4"/>
    <circle cx="57" cy="96" r="3" fill="var(--c2)"/>
    <text x="57" y="26" text-anchor="middle" fill="var(--c2)">u(x) = |x|</text>
    <text x="57" y="112" text-anchor="middle" font-size="8.5" fill="var(--muted)">continuous, kink at 0</text>
  </g>

  <text x="106" y="70" font-size="12" fill="var(--muted)">d/dx</text>

  <!-- panel 2: sgn -->
  <g>
    <line x1="122" y1="70" x2="208" y2="70" stroke="var(--grid)"/>
    <line x1="165" y1="34" x2="165" y2="106" stroke="var(--grid)"/>
    <line x1="126" y1="92" x2="164" y2="92" stroke="var(--c1)" stroke-width="2.4"/>
    <line x1="166" y1="48" x2="204" y2="48" stroke="var(--c1)" stroke-width="2.4"/>
    <line x1="165" y1="92" x2="165" y2="48" stroke="var(--c1)" stroke-width="1" stroke-dasharray="3 3"/>
    <text x="165" y="26" text-anchor="middle" fill="var(--c1)">u′ = sgn(x)</text>
    <text x="165" y="120" text-anchor="middle" font-size="8.5" fill="var(--c1)">a genuine function</text>
    <text x="165" y="131" text-anchor="middle" font-size="8.5" fill="var(--c1)">in every L^p: u ∈ H¹</text>
  </g>

  <text x="214" y="70" font-size="12" fill="var(--muted)">d/dx</text>

  <!-- panel 3: delta -->
  <g>
    <line x1="230" y1="96" x2="310" y2="96" stroke="var(--grid)"/>
    <line x1="270" y1="34" x2="270" y2="100" stroke="var(--grid)"/>
    <line x1="270" y1="96" x2="270" y2="42" stroke="var(--c5)" stroke-width="2.6"/>
    <polygon points="270,36 266,46 274,46" fill="var(--c5)"/>
    <text x="270" y="26" text-anchor="middle" fill="var(--c5)">2δ₀</text>
    <text x="270" y="112" text-anchor="middle" font-size="8.5" fill="var(--c5)">NOT a function</text>
    <text x="270" y="123" text-anchor="middle" font-size="8.5" fill="var(--c5)">so sgn ∉ H¹, |x| ∉ H²</text>
  </g>

  <line x1="14" y1="152" x2="306" y2="152" stroke="var(--grid)"/>
  <text x="14" y="168" fill="var(--fg)">the test:  ∫ u φ′ = − ∫ v φ  for every smooth φ vanishing near the ends</text>
  <text x="14" y="182" fill="var(--muted)">v = sgn passes it for u = |x| — integrate by parts on each half and the kink costs nothing.</text>
  <text x="14" y="196" fill="var(--muted)">For u = sgn the right-hand side would have to be 2φ(0), and no L¹ function does that.</text>
  <text x="14" y="208" fill="var(--c4)">Sobolev spaces keep exactly the functions whose weak derivatives are still functions.</text>
</svg>`;

// The Sobolev number s − n/p decides everything.
const embedSvg = String.raw`<svg viewBox="0 0 320 206" xmlns="http://www.w3.org/2000/svg" font-size="9" font-family="inherit">
  <text x="160" y="13" text-anchor="middle" font-size="10.5" font-weight="bold" fill="var(--fg)">H^s(ℝⁿ): the threshold is s = n/2</text>

  <line x1="30" y1="150" x2="300" y2="150" stroke="var(--fg)" stroke-width="1.2"/>
  <polygon points="306,150 296,146 296,154" fill="var(--fg)"/>
  <text x="296" y="166" text-anchor="middle" fill="var(--muted)">s</text>
  <line x1="30" y1="146" x2="30" y2="154" stroke="var(--fg)"/>
  <text x="30" y="166" text-anchor="middle" fill="var(--muted)">0</text>

  <!-- threshold -->
  <line x1="170" y1="40" x2="170" y2="158" stroke="var(--c5)" stroke-width="1.8" stroke-dasharray="5 3"/>
  <text x="170" y="34" text-anchor="middle" fill="var(--c5)" font-weight="bold">s = n/2</text>

  <rect x="30" y="100" width="140" height="22" fill="var(--c2)" fill-opacity="0.18" stroke="var(--c2)"/>
  <text x="100" y="115" text-anchor="middle" fill="var(--fg)">H^s ⊂ L^q only, q = 2n/(n−2s)</text>
  <rect x="170" y="100" width="130" height="22" fill="var(--c1)" fill-opacity="0.18" stroke="var(--c1)"/>
  <text x="235" y="115" text-anchor="middle" fill="var(--fg)">H^s ⊂ C^{0,s−n/2}</text>

  <text x="100" y="140" text-anchor="middle" font-size="8.5" fill="var(--c2)">may be unbounded</text>
  <text x="235" y="140" text-anchor="middle" font-size="8.5" fill="var(--c1)">continuous; γ = s−n/2 when &lt; 1</text>

  <!-- examples -->
  <text x="30" y="186" fill="var(--muted)">n = 1: threshold ½, so H¹(ℝ) functions are continuous (Hölder-½).</text>
  <text x="30" y="198" fill="var(--muted)">n = 2: threshold 1, so H¹ just misses it — log log(1 + 1/|x|) is in H¹ and unbounded.</text>
  <text x="30" y="60" fill="var(--c4)">every half-derivative of smoothness buys integrability;</text>
  <text x="30" y="72" fill="var(--c4)">past n/2 it buys continuity instead.</text>
</svg>`;

export default {
  cards: [
    {
      kind: 'explain',
      title: 'The space you want does not exist yet',
      body: String.raw`Here is the problem PDE theory ran into. You want to prove that $-\Delta u = f$ has a solution. The obvious space to look in is $C^2$ — functions with two honest derivatives. But $C^2$ with its natural norm has no useful compactness, minimising sequences of smooth functions converge to kinked limits, and plenty of physically sensible solutions (a string with a point load, a membrane over a square with corners) are not $C^2$ anyway.

$L^2$, by contrast, is a beautiful [Hilbert space](@math/hilbert-spaces) — complete, with projections and bases — but you cannot differentiate in it at all.

**Sobolev spaces** are the repair: build the derivative *into the norm*, and weaken "derivative" just enough that kinks are allowed and completeness survives.`,
    },
    {
      kind: 'explain',
      title: 'The weak derivative',
      body: String.raw`The trick is to define the derivative by what it does *inside an integral*. For smooth $u$ and any $\varphi \in C_c^\infty(\Omega)$ (smooth, vanishing outside a compact subset of $\Omega$), integration by parts has no boundary term:
$$\int_\Omega u\,\varphi' \;=\; -\int_\Omega u'\,\varphi .$$

Turn that identity into a definition.

> **Definition.** Let $u \in L^1_{\mathrm{loc}}(\Omega)$. A function $v \in L^1_{\mathrm{loc}}(\Omega)$ is the **weak derivative** $D^\alpha u$ if
> $$\int_\Omega u\,D^\alpha\varphi \;=\; (-1)^{|\alpha|}\int_\Omega v\,\varphi \qquad \text{for every } \varphi \in C_c^\infty(\Omega).$$

Two remarks. The weak derivative is **unique up to a null set** (if two candidates both work, their difference integrates to zero against every test function, so it vanishes almost everywhere). And when $u$ is genuinely differentiable the two notions agree — nothing is lost, only gained.

The functions $\varphi$ are called **test functions**: you never evaluate $u'$, you only ever ask what it integrates to.`,
    },
    {
      kind: 'widget',
      title: 'One kink is fine; a jump is not',
      body: String.raw`$u(x) = |x|$ on $(-1,1)$ has no derivative at $0$ in the classical sense. But split the integral at $0$, integrate by parts on each half, and the boundary terms cancel: $\int u\varphi' = -\int \operatorname{sgn}(x)\varphi$. So $|x|$ has the weak derivative $\operatorname{sgn}(x)$, which is bounded, hence in every $L^p$.

Differentiate once more and you fall off the edge. $\int \operatorname{sgn}(x)\,\varphi' = -2\varphi(0)$, and **no** locally integrable $v$ satisfies $\int v\varphi = 2\varphi(0)$ for all $\varphi$ — squeeze $\varphi$ into a shrinking bump with $|\varphi| \le 1$ and the left side tends to $0$ while the right side stays at $2$. The object $2\delta_0$ is a measure, not a function.`,
      widget: { type: 'SvgDiagram', props: { svg: weakDerivSvg }, caption: String.raw`The same $\delta$ you met with [Green's functions](@math/greens-functions). Distributions go one step further than Sobolev spaces; $H^k$ is the part of that world where the derivatives are still ordinary functions.` },
    },
    {
      kind: 'truefalse',
      prompt: String.raw`The Heaviside step function $H(x) = \mathbf 1_{\{x>0\}}$ belongs to $H^1(-1,1)$.`,
      answer: false,
      why: String.raw`$H$ is in $L^2$, but its distributional derivative is $\delta_0$, which is not a function — no $v \in L^1_{\mathrm{loc}}$ satisfies $\int H\varphi' = -\int v\varphi = -\varphi(0)$. Being "differentiable except at one point" is not enough: the classical derivative of $H$ is $0$ away from the origin, yet $0$ fails the test, because the jump is invisible to pointwise differentiation but very visible to integration by parts. The moral: $H^1$ in one dimension forbids jumps but permits kinks.`,
    },
    {
      kind: 'explain',
      title: 'The spaces',
      body: String.raw`Fix an open $\Omega \subseteq \mathbb R^n$, an integer $k \ge 0$ and $1 \le p \le \infty$.
$$W^{k,p}(\Omega) \;=\; \{\,u \in L^p(\Omega)\;:\; D^\alpha u \text{ exists weakly and lies in } L^p(\Omega) \text{ for all } |\alpha| \le k \,\},$$
$$\|u\|_{W^{k,p}} \;=\; \Big(\sum_{|\alpha|\le k} \|D^\alpha u\|_{L^p}^p\Big)^{1/p} \quad (p < \infty).$$

- $W^{k,p}$ is a **Banach** space. The proof is short and shows why weak derivatives were the right definition: if $u_m \to u$ and $D^\alpha u_m \to v_\alpha$ in $L^p$, you may pass to the limit *inside* $\int u_m D^\alpha\varphi = (-1)^{|\alpha|}\int D^\alpha u_m\,\varphi$, so $v_\alpha = D^\alpha u$. Completeness is almost free.
- $H^k(\Omega) := W^{k,2}(\Omega)$ is a **Hilbert** space, with $\langle u,v\rangle_{H^k} = \sum_{|\alpha|\le k}\int D^\alpha u\,D^\alpha v$. This is the case PDE theory lives in.
- $W^{k,p}_0(\Omega)$ is the closure of $C_c^\infty(\Omega)$ inside $W^{k,p}(\Omega)$ — morally, "zero boundary values".
- **Meyers–Serrin** ("$H = W$"): for $p < \infty$ and *any* open $\Omega$, the functions in $C^\infty(\Omega) \cap W^{k,p}(\Omega)$ are dense in $W^{k,p}(\Omega)$. So an equivalent definition is "limits of smooth functions in the $W^{k,p}$ norm". (Smooth *inside* $\Omega$ — density of functions smooth up to the boundary needs a regular boundary, and none of this holds for $p = \infty$.)`,
    },
    {
      kind: 'widget',
      title: 'How singular may a function be?',
      body: String.raw`Take $u(x) = x^a$ on $(0,1)$, with weak derivative $a x^{a-1}$. Two integrals decide membership:
$$\int_0^1 x^{2a}\,dx < \infty \iff a > -\tfrac12, \qquad \int_0^1 a^2 x^{2a-2}\,dx < \infty \iff a > \tfrac12 .$$

So $u \in H^1(0,1)$ **exactly when $a > \tfrac12$** (the trivial case $a = 0$, a constant, aside). Slide $a$ down through $\tfrac12$ and watch the derivative (the second curve) blow up fast enough at the origin that its square is no longer integrable — even though $u$ itself still looks perfectly tame.

The lesson: $H^1$ permits unbounded derivatives, but only mildly unbounded ones. Membership is a quantitative statement about *how fast* a singularity grows, not a yes/no question about smoothness.`,
      widget: {
        type: 'FunctionPlot',
        props: {
          fns: ['x^a', 'a*x^(a-1)'],
          x: [0, 1],
          y: [0, 3],
          params: [{ name: 'a', min: 0.1, max: 1.6, value: 0.8, label: 'exponent a' }],
          labels: ['u = x^a', 'u′ = a x^(a−1)'],
          xLabel: 'x',
          yLabel: '',
        },
      },
    },
    {
      kind: 'numeric',
      prompt: String.raw`For which exponents is $u(x) = x^{a}$ in $H^1(0,1)$? The condition is $a > c$. Give $c$.`,
      answer: 0.5,
      tolerance: 0.01,
      why: String.raw`The binding condition is on the derivative: $\int_0^1 (a x^{a-1})^2 dx = a^2\int_0^1 x^{2a-2}dx$ converges iff $2a - 2 > -1$, i.e. $a > \tfrac12$. Answering $0$ would be the condition for $u$ alone to be in $L^2$ ($a > -\tfrac12$, so certainly all $a \ge 0$), and $1$ would be the condition for $u$ to be classically (one-sidedly) differentiable at $0$ ($a \ge 1$) — far stronger than $H^1$ requires.`,
    },
    {
      kind: 'explain',
      title: 'Fractional order, via Fourier',
      body: String.raw`On the whole space there is a second description that makes the *order* a real number. By Plancherel, differentiating multiplies the [Fourier transform](@math/fourier-transform) by $i\xi$, so for integer $s$
$$\|u\|_{H^s}^2 \;\asymp\; \int_{\mathbb R^n} \big(1+|\xi|^2\big)^{s}\,|\hat u(\xi)|^2\,d\xi .$$
The right-hand side makes sense for **any** real $s$, and it is taken as the definition:
$$H^s(\mathbb R^n) \;=\; \big\{\,u : (1+|\xi|^2)^{s/2}\hat u \in L^2\,\big\}.$$

Read it as a weighted budget on high frequencies: larger $s$ penalises large $|\xi|$ more harshly, so the function must be smoother. Negative $s$ is allowed and gives spaces *bigger* than $L^2$ — $\delta_0 \in H^{s}(\mathbb R^n)$ precisely for $s < -n/2$, which is how a point load is accommodated as legitimate data.

This frequency-budget picture is also what makes spectral and [Fourier neural operator](@math/fourier-neural-operator) methods natural: truncating high frequencies is a controlled error in exactly this norm.`,
    },
    {
      kind: 'explain',
      title: 'Sobolev embedding: smoothness buys you something',
      body: String.raw`A Sobolev function has one job — to be in $L^p$ along with its derivatives — but it turns out to get more than it asked for. Let $\Omega \subseteq \mathbb R^n$ be $\mathbb R^n$ itself, or bounded with a Lipschitz boundary. The quantity that governs everything is the **Sobolev number** $s - n/p$, and for $u \in W^{k,p}(\Omega)$:

1. **$kp < n$ (subcritical).** $W^{k,p} \hookrightarrow L^{p^{*}}$ with $\dfrac{1}{p^{*}} = \dfrac1p - \dfrac kn$. You gain integrability, not continuity.
2. **$kp = n$ (critical).** $W^{k,p} \hookrightarrow L^q$ for every finite $q \ge p$ — but for $p > 1$ **not** $L^\infty$ (the exception is $p = 1$, $k = n$, where $W^{n,1} \hookrightarrow C_b$).
3. **$kp > n$ (supercritical).** $W^{k,p} \hookrightarrow C^{m,\gamma}(\overline\Omega)$ with $m = k - \lfloor n/p\rfloor - 1$, and $\gamma = \lfloor n/p\rfloor + 1 - n/p$ if $n/p$ is not an integer (any $\gamma < 1$ if it is). In particular for $k = 1$, $p > n$ you get $C^{0,\gamma}$ with $\gamma = 1 - n/p$: the function has a continuous representative and point values make sense.

For $p = 2$ the rule is memorable: $H^s(\mathbb R^n)$ consists of continuous bounded functions **iff $s > n/2$**.

- $n = 1$: $H^1$ functions are continuous (indeed Hölder-$\tfrac12$) — which is why the one-dimensional examples above were so well behaved.
- $n = 2$: $H^1$ just misses the threshold, and $u(x) = \log\log\big(1 + 1/|x|\big)$ is an $H^1$ function on the unit disc that is unbounded at the origin.
- $n = 3$: you need $s > \tfrac32$, so $H^1$ solutions of a 3D PDE need not be bounded.`,
      widget: { type: 'SvgDiagram', props: { svg: embedSvg } },
    },
    {
      kind: 'mcq',
      prompt: String.raw`For which $s$ is every $u \in H^s(\mathbb R^3)$ (equal almost everywhere to) a bounded continuous function?`,
      choices: [
        String.raw`$s > 3/2$`,
        String.raw`$s > 3$`,
        String.raw`$s \ge 1$`,
        String.raw`every $s > 0$`,
      ],
      answer: 0,
      why: String.raw`The threshold is $s > n/2$, and $n = 3$ gives $s > 3/2$. The condition is not $s > n$ — that overshoots badly — and $s \ge 1$ is not enough: an $H^1$ function on a 3D domain can be unbounded, which is why nonlinear terms in 3D PDE are so much harder to control than in 1D. Note also that the statement is about a *representative*: an element of $H^s$ is an equivalence class, and the claim is that one member of the class is continuous.`,
    },
    {
      kind: 'explain',
      title: 'Rellich–Kondrachov: the compactness that does the work',
      body: String.raw`The embeddings above are *bounded*. One of them is better than that.

> **Rellich–Kondrachov.** Let $\Omega$ be bounded with $C^1$ (or Lipschitz) boundary and $1 \le p < n$. Then $W^{1,p}(\Omega) \hookrightarrow L^q(\Omega)$ is **compact** for every $1 \le q < p^{*}$. In particular, $H^1(\Omega) \hookrightarrow\hookrightarrow L^2(\Omega)$ is compact on a bounded domain with regular boundary (in every dimension). For $H^1_0(\Omega)$ no boundary regularity is needed — boundedness of $\Omega$ suffices.

"Compact" means: every bounded sequence in $H^1$ has a subsequence converging **in $L^2$**. Bounding one derivative stops a sequence from oscillating off to nothing, and boundedness of the domain stops it from escaping to infinity.

Two payoffs, both enormous:

- The inverse of the Dirichlet Laplacian (posed on $H^1_0$) is a compact self-adjoint operator, so the [spectral theorem](@math/operators-spectral) applies and a drum has a discrete set of tones.
- The **direct method** in the calculus of variations: take a minimising sequence, extract a convergent subsequence, show the limit is a minimiser. Compactness is exactly the step that would otherwise fail.

This is also the reason a bounded domain matters: on all of $\mathbb R^n$, translating a fixed bump produces a bounded sequence in $H^1$ with no convergent subsequence in $L^2$.`,
    },
    {
      kind: 'multi',
      prompt: 'Which statements about Sobolev spaces are true?',
      choices: [
        String.raw`$H^k(\Omega) = W^{k,2}(\Omega)$ is a Hilbert space.`,
        String.raw`$u(x) = |x|$ is in $H^1(-1,1)$ but not in $H^2(-1,1)$.`,
        String.raw`On a bounded Lipschitz domain, $H^1(\Omega) \hookrightarrow L^2(\Omega)$ is compact.`,
        String.raw`Every $H^1$ function on a bounded domain in $\mathbb R^2$ is bounded.`,
        String.raw`A weak derivative, when it exists, is unique up to a set of measure zero.`,
      ],
      answers: [0, 1, 2, 4],
      why: String.raw`The $p=2$ case is Hilbert because the norm comes from a sum of $L^2$ inner products; $|x|$ has weak derivative $\operatorname{sgn}$ but $\operatorname{sgn}$ has none, so one derivative is available and two are not; Rellich–Kondrachov gives the compact embedding on bounded Lipschitz domains; and uniqueness follows because a function integrating to zero against every test function vanishes almost everywhere. Boundedness in two dimensions is the false one: $n = 2$ sits exactly at the critical exponent $kp = n$, and $\log\log(1+1/|x|)$ is the standard unbounded counterexample.`,
    },
    {
      kind: 'explain',
      title: 'Boundary values of a function defined almost everywhere',
      body: String.raw`A Dirichlet condition says $u = g$ on $\partial\Omega$. But $\partial\Omega$ has measure zero, and an element of $L^2(\Omega)$ may be redefined there at will. How can the condition mean anything?

> **Trace theorem.** Let $\Omega$ be bounded with a Lipschitz boundary and $1 \le p < \infty$. There is a bounded linear operator $T : W^{1,p}(\Omega) \to L^p(\partial\Omega)$ with $Tu = u|_{\partial\Omega}$ for every $u \in W^{1,p}(\Omega) \cap C(\overline\Omega)$. Moreover $W^{1,p}_0(\Omega) = \ker T$.

The derivative is what rescues the situation: having $\nabla u \in L^p$ links the values of $u$ near the boundary to its values inside, so restriction extends continuously from the smooth functions. Sharply, the trace of $H^1(\Omega)$ is exactly $H^{1/2}(\partial\Omega)$ — half a derivative is lost on the way to the boundary. There is **no** trace theorem for $L^2$ alone.

The identity $H^1_0 = \ker T$ is what finally makes "$u = 0$ on the boundary" a precise statement about a measurable function, and $H^1_0(\Omega)$ the space in which Dirichlet problems are posed.

One more gift on $H^1_0$: the **Poincaré inequality** $\|u\|_{L^2(\Omega)} \le C(\Omega)\,\|\nabla u\|_{L^2(\Omega)}$ for bounded $\Omega$. Hence $\|\nabla u\|_{L^2}$ alone is an equivalent norm on $H^1_0$ — the fact the next lesson needs to prove that elliptic PDEs have solutions.`,
    },
    {
      kind: 'order',
      prompt: String.raw`Arrange the verification that $\operatorname{sgn}$ is the weak derivative of $u(x) = |x|$ on $(-1,1)$.`,
      steps: [
        String.raw`Take any $\varphi \in C_c^\infty(-1,1)$ and split: $\int_{-1}^{1}|x|\varphi' = \int_{-1}^{0}(-x)\varphi' + \int_{0}^{1}x\varphi'$.`,
        String.raw`On each half $u$ is smooth, so integrate by parts there: $\int_{-1}^{0}(-x)\varphi' = \big[-x\varphi\big]_{-1}^{0} + \int_{-1}^{0}\varphi$ and $\int_{0}^{1}x\varphi' = \big[x\varphi\big]_{0}^{1} - \int_{0}^{1}\varphi$.`,
        String.raw`All four boundary terms vanish: at $x = 0$ because the factor $x$ is zero, at $x = \pm1$ because $\varphi$ has compact support.`,
        String.raw`What remains is $\int_{-1}^{0}\varphi - \int_{0}^{1}\varphi = -\int_{-1}^{1}\operatorname{sgn}(x)\,\varphi(x)\,dx$.`,
        String.raw`That is the defining identity $\int u\varphi' = -\int v\varphi$ with $v = \operatorname{sgn}$, and since $\operatorname{sgn} \in L^2(-1,1)$ we conclude $u \in H^1(-1,1)$.`,
      ],
      why: String.raw`The structure is always: split at the bad point, integrate by parts where it is legal, check that the boundary terms cancel, and read off the candidate. The cancellation in the third step is the whole story — it is exactly what fails for $\operatorname{sgn}$ itself, where the two one-sided limits differ and leave behind a $2\varphi(0)$ that no integrable function can produce.`,
    },
    {
      kind: 'match',
      prompt: 'Match each theorem to what it provides.',
      pairs: [
        [String.raw`Sobolev embedding`, String.raw`$W^{k,p} \subset L^{p^{*}}$, or $\subset C^{0,\gamma}$ once $kp > n$`],
        [String.raw`Rellich–Kondrachov`, String.raw`compactness of $H^1(\Omega) \hookrightarrow L^2(\Omega)$ on bounded Lipschitz $\Omega$`],
        [String.raw`trace theorem`, String.raw`a meaning for boundary values, with $H^1_0 = \ker T$`],
        [String.raw`Poincaré inequality`, String.raw`$\|u\|_{L^2} \le C\|\nabla u\|_{L^2}$ on $H^1_0$`],
        [String.raw`Meyers–Serrin`, String.raw`$C^\infty \cap W^{k,p}$ is dense in $W^{k,p}$ for $p < \infty$`],
      ],
      why: String.raw`These five are the toolkit. Embedding converts derivatives into integrability or continuity, Rellich upgrades one embedding to compactness (and so delivers existence proofs and discrete spectra), the trace theorem makes boundary conditions meaningful, Poincaré makes the gradient alone a norm, and Meyers–Serrin lets you prove things for smooth functions and pass to the limit.`,
    },
    {
      kind: 'fill',
      prompt: String.raw`A weak derivative is defined by testing against ___ functions and moving the derivative across with integration by parts. $H^k = W^{k,2}$ is a ___ space. On $\mathbb R^n$, $H^s$ embeds in the continuous functions exactly when $s$ exceeds ___ . On a bounded Lipschitz domain the embedding $H^1 \hookrightarrow L^2$ is ___ .`,
      bank: ['test', 'measurable', 'Hilbert', 'Banach', '$n/2$', '$n$', 'compact', 'isometric'],
      answer: ['test', 'Hilbert', '$n/2$', 'compact'],
      why: String.raw`Smooth compactly supported test functions are what make the definition work, since they kill every boundary term. $W^{k,p}$ is Banach for all $p$, but the $p = 2$ case is the stronger statement: the norm comes from an inner product, so $H^k$ is Hilbert. The continuity threshold is $n/2$, not $n$. And Rellich–Kondrachov makes the embedding compact — the property that powers existence proofs.`,
    },
    {
      kind: 'explain',
      title: 'Key takeaways',
      body: String.raw`- **Weak derivative:** $v = D^\alpha u$ means $\int u\,D^\alpha\varphi = (-1)^{|\alpha|}\int v\,\varphi$ for all $\varphi \in C_c^\infty(\Omega)$. Unique up to a null set; agrees with the classical derivative when that exists.
- $W^{k,p}(\Omega)$ (all weak derivatives up to order $k$ in $L^p$) is **Banach**; $H^k = W^{k,2}$ is **Hilbert**; $W^{k,p}_0$ is the closure of $C_c^\infty$, i.e. "zero boundary values".
- Kinks are allowed, jumps are not: $|x| \in H^1(-1,1)$ with derivative $\operatorname{sgn}$, but $\operatorname{sgn} \notin H^1$ because its derivative $2\delta_0$ is a measure. And $x^a \in H^1(0,1)$ exactly when $a > \tfrac12$.
- On $\mathbb R^n$, $\|u\|_{H^s}^2 \asymp \int (1+|\xi|^2)^s|\hat u|^2$, which defines $H^s$ for real $s$, negative included ($\delta_0 \in H^s$ for $s < -n/2$).
- **Sobolev embedding** turns on $kp$ versus $n$: below, extra integrability $L^{p^*}$ with $1/p^* = 1/p - k/n$; above, continuity and Hölder regularity. For $p = 2$: $H^s(\mathbb R^n)$ is continuous **iff $s > n/2$** — so $H^1$ is continuous in 1D but not in 2D or 3D.
- **Rellich–Kondrachov:** on a bounded Lipschitz domain $H^1 \hookrightarrow L^2$ is **compact**. This single fact gives discrete spectra and the direct method of the calculus of variations.
- **Trace theorem:** $W^{1,p}(\Omega) \to L^p(\partial\Omega)$ is bounded and $W^{1,p}_0 = \ker T$, so Dirichlet conditions make sense; and **Poincaré** makes $\|\nabla u\|_{L^2}$ an equivalent norm on $H^1_0$.

Next: putting these spaces to work — [weak solutions and the Lax–Milgram theorem](@math/weak-solutions).`,
    },
  ],
  references: [
    { authors: 'L. C. Evans', title: 'Partial Differential Equations', year: 2010, venue: '2nd ed., AMS Graduate Studies in Mathematics 19', detail: 'Ch. 5 (Sobolev spaces: weak derivatives §5.2, approximation §5.3, traces §5.5, Gagliardo–Nirenberg–Sobolev and Morrey §5.6, Rellich–Kondrachov §5.7, Poincaré §5.8.1)' },
    { authors: 'H. Brezis', title: 'Functional Analysis, Sobolev Spaces and Partial Differential Equations', year: 2011, venue: 'Springer Universitext', detail: 'Ch. 8 (Sobolev spaces in one dimension, where every H¹ function is continuous); Ch. 9 (W^{1,p}(Ω): extension, density, Sobolev and Rellich–Kondrachov, traces)' },
    { authors: 'R. A. Adams, J. J. F. Fournier', title: 'Sobolev Spaces', year: 2003, venue: '2nd ed., Academic Press (Pure and Applied Mathematics 140)', detail: 'Ch. 3 (the spaces W^{m,p}), Ch. 4–6 (the embedding theorems and compact embeddings), Ch. 7 (fractional order spaces)' },
    { authors: 'G. Leoni', title: 'A First Course in Sobolev Spaces', year: 2017, venue: '2nd ed., AMS Graduate Studies in Mathematics 181', detail: 'weak derivatives, Sobolev functions of one variable (absolutely continuous representatives), the embedding theorems' },
    { authors: 'N. Meyers, J. Serrin', title: 'H = W', year: 1964, venue: 'Proceedings of the National Academy of Sciences 51(6), 1055–1056', detail: 'Density of C^∞(Ω) ∩ W^{k,p}(Ω) in W^{k,p}(Ω) for any open Ω and 1 ≤ p < ∞' },
  ],
} satisfies LessonContent;
