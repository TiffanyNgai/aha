import type { LessonContent } from '../../types';

// A point load on a string: the solution is a tent, in H¹₀ but not C¹.
const tentSvg = String.raw`<svg viewBox="0 0 320 196" xmlns="http://www.w3.org/2000/svg" font-size="9" font-family="inherit">
  <text x="160" y="13" text-anchor="middle" font-size="10.5" font-weight="bold" fill="var(--fg)">−u″ = δ at x = ½ :  a solution with no second derivative</text>

  <!-- the load -->
  <line x1="160" y1="30" x2="160" y2="62" stroke="var(--c5)" stroke-width="2.4"/>
  <polygon points="160,66 156,56 164,56" fill="var(--c5)"/>
  <text x="168" y="42" fill="var(--c5)">point load f = δ₁⁄₂</text>

  <!-- axis -->
  <line x1="30" y1="140" x2="290" y2="140" stroke="var(--fg)" stroke-width="1.2"/>
  <text x="30" y="154" text-anchor="middle" fill="var(--muted)">0</text>
  <text x="290" y="154" text-anchor="middle" fill="var(--muted)">1</text>
  <text x="160" y="154" text-anchor="middle" fill="var(--muted)">½</text>

  <!-- the tent -->
  <path d="M 30 140 L 160 76 L 290 140" fill="var(--c2)" fill-opacity="0.12" stroke="var(--c2)" stroke-width="2.6"/>
  <circle cx="160" cy="76" r="3.4" fill="var(--c2)"/>
  <text x="196" y="88" fill="var(--c2)">u(½) = ¼</text>

  <!-- slope markers -->
  <text x="78" y="104" fill="var(--c1)">u′ = +½</text>
  <text x="222" y="104" fill="var(--c1)">u′ = −½</text>
  <text x="160" y="68" text-anchor="middle" font-size="8.5" fill="var(--c4)">slope jumps by 1 here</text>

  <line x1="14" y1="166" x2="306" y2="166" stroke="var(--grid)"/>
  <text x="14" y="180" fill="var(--muted)">u ∉ C¹, so u″ does not exist — there is no classical solution at all.</text>
  <text x="14" y="192" fill="var(--c4)">But u ∈ H¹₀(0,1) and ∫u′v′ = v(½) for every v: a perfectly good weak solution.</text>
</svg>`;

export default {
  cards: [
    {
      kind: 'explain',
      title: 'The equation has no solution — and yet the string hangs',
      body: String.raw`Pin a string at both ends and hang a single weight from its midpoint. The string takes a definite shape, so physically there is certainly an answer. Mathematically, the problem
$$-u'' = \delta_{1/2} \quad \text{on } (0,1), \qquad u(0) = u(1) = 0$$
has **no classical solution**: the shape is a tent, its slope jumps at the middle, and a function with a corner has no second derivative there.

Something is wrong with the question, not with the string. The fix — rewriting the equation so that it asks for less — is the single most useful idea in modern PDE theory. It is also the mathematics that finite element software is built on.`,
    },
    {
      kind: 'widget',
      title: 'What the string actually does',
      body: String.raw`The tent $u(x) = \tfrac12\min(x, 1-x)$, of height $\tfrac14$, is what you would measure. Its slope is $+\tfrac12$ on the left and $-\tfrac12$ on the right, so $u'$ is a step function and $u''$ is $-\delta_{1/2}$ — a measure, not a function.

So $u \notin C^2$, and the classical formulation rejects it. Yet $u$ is continuous, has a weak derivative in $L^2$, vanishes at both ends: $u \in H^1_0(0,1)$. The formulation below will accept it, and will single it out as the **unique** answer.

A classical solution is one that is smooth enough to be plugged into the equation pointwise: $u \in C^2(\Omega)\cap C(\overline\Omega)$. That demand fails for point loads and for discontinuous coefficients and sources, and even where a classical solution exists, smoothness up to the boundary is lost at re-entrant corners — all of them routine in applications.`,
      widget: { type: 'SvgDiagram', props: { svg: tentSvg }, caption: String.raw`The same tent is the [Green's function](@math/greens-functions) $G(x,\tfrac12)$ of this problem.` },
    },
    {
      kind: 'explain',
      title: 'Moving the derivative onto a test function',
      body: String.raw`Start from the model problem on a bounded domain $\Omega \subseteq \mathbb R^n$:
$$-\Delta u = f \ \text{ in } \Omega, \qquad u = 0 \ \text{ on } \partial\Omega.$$
Multiply by a smooth test function $v$ that vanishes near $\partial\Omega$, integrate, and use the divergence theorem. The point is bookkeeping: two derivatives on $u$ become one on $u$ and one on $v$.`,
      widget: {
        type: 'StepReveal',
        props: {
          steps: [
            String.raw`Multiply the equation by $v \in C_c^\infty(\Omega)$ and integrate: $\displaystyle -\int_\Omega (\Delta u)\, v = \int_\Omega f\,v$.`,
            String.raw`Green's identity: $\displaystyle -\int_\Omega (\Delta u)\,v \;=\; \int_\Omega \nabla u\cdot\nabla v \;-\; \int_{\partial\Omega} \frac{\partial u}{\partial \nu}\,v\,dS$.`,
            String.raw`$v$ vanishes near the boundary, so the surface term is zero and $\displaystyle \int_\Omega \nabla u\cdot\nabla v = \int_\Omega f\,v$.`,
            String.raw`Look at what this identity requires: **one** derivative of $u$, **one** of $v$, and $f$ merely integrable against $v$. The equation has been rebalanced.`,
            String.raw`So ask for it in the largest space where both sides make sense and the boundary condition is meaningful: $u, v \in H^1_0(\Omega)$, $f \in L^2(\Omega)$.`,
          ],
          notes: [
            String.raw`Nothing is assumed yet beyond $u$ being smooth enough for the classical equation.`,
            String.raw`This is integration by parts in $n$ dimensions; $\nu$ is the outward unit normal.`,
            String.raw`This is why test functions have compact support — the boundary term is a nuisance and they delete it.`,
            String.raw`Cauchy–Schwarz bounds both sides by $H^1$ norms, so nothing diverges.`,
            String.raw`$C_c^\infty(\Omega)$ is dense in $H^1_0(\Omega)$, so testing against all of $H^1_0$ is no stronger.`,
          ],
        },
      },
    },
    {
      kind: 'explain',
      title: 'The definition',
      body: String.raw`> **Definition.** Let $f \in L^2(\Omega)$. A function $u \in H^1_0(\Omega)$ is a **weak solution** of $-\Delta u = f$ with zero Dirichlet data if
> $$\int_\Omega \nabla u\cdot\nabla v \;=\; \int_\Omega f\,v \qquad \text{for every } v \in H^1_0(\Omega).$$

Everything in the sentence is doing work. $u \in H^1_0$ encodes "one weak derivative in $L^2$" **and** "zero boundary values" (via $H^1_0 = \ker T$, the [trace](@math/sobolev-spaces) characterisation). The identity is required for *all* test functions, which is what pins $u$ down — a single test function says almost nothing.

Three things this buys that the classical formulation cannot:

1. **Lower demands on the solution.** One derivative instead of two, and in an $L^2$ sense rather than pointwise, so corners and kinks are admissible.
2. **Lower demands on the data.** $f \in L^2$ is enough; in fact $f \in H^{-1}(\Omega)$ is enough, which is how a point load $\delta_{1/2}$ becomes legitimate data in one dimension.
3. **A good space to work in.** $H^1_0$ is a Hilbert space with compact embedding into $L^2$ — so Riesz representation, projection and compactness arguments are all available. $C^2$ offers none of this.`,
    },
    {
      kind: 'mcq',
      prompt: String.raw`Why does the weak formulation use $\int_\Omega \nabla u\cdot\nabla v$ rather than $-\int_\Omega (\Delta u)v$?`,
      choices: [
        String.raw`Because it needs only one derivative of $u$, so it makes sense for every $u \in H^1_0$ — including functions with no second derivative.`,
        String.raw`Because the two expressions are different even for smooth $u$, and the gradient form is the physically correct one.`,
        String.raw`Because $\nabla u \cdot \nabla v$ is easier to integrate numerically than $\Delta u \cdot v$.`,
        String.raw`Because the boundary term in Green's identity does not vanish for the Laplacian form.`,
      ],
      answer: 0,
      why: String.raw`For smooth $u$ and compactly supported $v$ the two expressions are **equal** — that is the content of Green's identity, and it is why the weak formulation is consistent with the classical one. The gain is entirely about what the expression still means when $u$ is rough: $\int\nabla u\cdot\nabla v$ is finite for any $u \in H^1$, while $\Delta u$ may not exist as a function at all. The boundary term does vanish, precisely because test functions have compact support.`,
    },
    {
      kind: 'explain',
      title: 'Nothing is lost',
      body: String.raw`A weaker notion of solution is only useful if it agrees with the old one where the old one applies. It does, in both directions.

- **Classical $\Rightarrow$ weak.** The derivation above is a proof: any $u \in C^2(\Omega)\cap C(\overline\Omega)$ solving the equation pointwise satisfies the integral identity.
- **Weak $+$ smooth $\Rightarrow$ classical.** If a weak solution happens to be $C^2$, integrate by parts backwards to get $\int(\Delta u + f)v = 0$ for all $v \in C_c^\infty$. A continuous function orthogonal to every test function is zero (the *fundamental lemma of the calculus of variations*), so $-\Delta u = f$ pointwise.
- **Elliptic regularity.** Smoothness is not an accident you hope for; it is a theorem. If $f \in H^m(\Omega)$ and $\partial\Omega$ is $C^{m+2}$, then the weak solution lies in $H^{m+2}(\Omega)$ with $\|u\|_{H^{m+2}} \le C\|f\|_{H^m}$. With $f$ and $\partial\Omega$ smooth, $u \in C^\infty(\overline\Omega)$: the weak solution *is* the classical one.

So the weak formulation is a strictly larger net that catches the same fish when the water is clear. Two warnings worth carrying. Regularity depends on the **domain**: on an L-shaped region, even a smooth $f$ gives a weak solution that is not in $H^2(\Omega)$: its gradient is unbounded at the re-entrant corner. The solution exists and is smooth inside, but regularity up to the boundary fails. And in the interior, regularity holds regardless of how rough the boundary is.`,
    },
    {
      kind: 'truefalse',
      prompt: String.raw`A weak solution that happens to be twice continuously differentiable is automatically a classical solution.`,
      answer: true,
      why: String.raw`Integrate by parts in the reverse direction to get $\int_\Omega(\Delta u + f)\,v = 0$ for every $v \in C_c^\infty(\Omega)$. The function $\Delta u + f$ is continuous and orthogonal to all test functions, so it is identically zero — if it were positive somewhere, a bump supported near that point would give a positive integral. This consistency is what makes "weak" a genuine generalisation rather than a different problem wearing the same name.`,
    },
    {
      kind: 'explain',
      title: 'The Lax–Milgram theorem',
      body: String.raw`The weak problem has the shape "find $u$ with $a(u,v) = F(v)$ for all $v$", where $a$ is bilinear and $F$ is a functional. One theorem settles every such problem.

> **Lax–Milgram.** Let $H$ be a real Hilbert space and $a : H\times H \to \mathbb R$ bilinear with
> - **boundedness:** $|a(u,v)| \le C\,\|u\|\,\|v\|$ for all $u,v$, and
> - **coercivity:** $a(u,u) \ge \alpha\,\|u\|^2$ for all $u$, with $\alpha > 0$.
>
> Then for every bounded linear $F \in H^{*}$ there is a **unique** $u \in H$ with
> $$a(u,v) = F(v) \quad \text{for all } v \in H, \qquad\text{and}\qquad \|u\| \le \frac{\|F\|_{H^{*}}}{\alpha}.$$

Three notes. **Symmetry of $a$ is not required** — which is what lets the theorem handle convection terms and other non-self-adjoint operators. When $a$ *is* symmetric, it is an inner product equivalent to the original one and the theorem collapses to the [Riesz representation theorem](@math/hilbert-spaces). And the final estimate is **stability**: the solution depends continuously on the data, so the problem is well posed in Hadamard's sense.`,
    },
    {
      kind: 'explain',
      title: 'Checking the two hypotheses',
      body: String.raw`Take $H = H^1_0(\Omega)$ with $\Omega$ bounded, $a(u,v) = \int_\Omega \nabla u\cdot\nabla v$ and $F(v) = \int_\Omega f v$.

**Bounded.** By Cauchy–Schwarz, $|a(u,v)| \le \|\nabla u\|_{L^2}\|\nabla v\|_{L^2} \le \|u\|_{H^1}\|v\|_{H^1}$, so $C = 1$. Likewise $|F(v)| \le \|f\|_{L^2}\|v\|_{L^2} \le \|f\|_{L^2}\|v\|_{H^1}$.

**Coercive.** This is where the [Poincaré inequality](@math/sobolev-spaces) $\|u\|_{L^2} \le C_P\|\nabla u\|_{L^2}$ (valid on $H^1_0$ for bounded $\Omega$) is indispensable:
$$\|u\|_{H^1}^2 = \|u\|_{L^2}^2 + \|\nabla u\|_{L^2}^2 \le (1 + C_P^2)\,\|\nabla u\|_{L^2}^2 = (1+C_P^2)\,a(u,u),$$
so $a(u,u) \ge \alpha\|u\|_{H^1}^2$ with $\alpha = 1/(1+C_P^2)$.

Lax–Milgram now gives a unique weak solution with $\|u\|_{H^1} \le (1+C_P^2)\|f\|_{L^2}$. Existence, uniqueness and stability for the Dirichlet problem, in half a page.

> Watch what happens without the boundary condition. On $H^1(\Omega)$ the constants have $a(u,u) = 0$ while $\|u\| \ne 0$, so coercivity fails — and correctly so: the pure Neumann problem (homogeneous Neumann data, $\Omega$ connected) is solvable only when $\int_\Omega f = 0$, and then only up to an additive constant. The hypothesis is not a technicality; it is detecting a real feature of the problem.`,
    },
    {
      kind: 'order',
      prompt: String.raw`Put the existence argument for $-\Delta u = f$, $u|_{\partial\Omega} = 0$, in order.`,
      steps: [
        String.raw`Multiply by a test function and integrate by parts to obtain the weak form $\int_\Omega \nabla u\cdot\nabla v = \int_\Omega fv$.`,
        String.raw`Choose the space $H = H^1_0(\Omega)$, in which one weak derivative is square-integrable and the Dirichlet condition is encoded.`,
        String.raw`Check boundedness of $a(u,v) = \int\nabla u\cdot\nabla v$ and of $F(v) = \int fv$ with Cauchy–Schwarz.`,
        String.raw`Check coercivity of $a$ using the Poincaré inequality on $H^1_0$.`,
        String.raw`Apply Lax–Milgram to get a unique $u \in H^1_0$ with $a(u,v) = F(v)$ for all $v$, plus the bound $\|u\| \le \|F\|/\alpha$.`,
        String.raw`Invoke elliptic regularity: if $f$ and $\partial\Omega$ are smooth, $u$ is smooth and solves the equation classically.`,
      ],
      why: String.raw`The pattern generalises to essentially every linear elliptic problem: reformulate, choose the space, verify boundedness, verify coercivity, apply the abstract theorem, then recover regularity. Coercivity is always the step that can fail, and when it fails it is telling you something true — as with the Neumann problem, where constants are in the kernel and solvability needs $\int f = 0$.`,
    },
    {
      kind: 'numeric',
      prompt: String.raw`The weak solution of $-u'' = \delta_{1/2}$ on $(0,1)$ with $u(0) = u(1) = 0$ is the tent $u(x) = \tfrac12\min(x, 1-x)$. What is its maximum value?`,
      answer: 0.25,
      tolerance: 0.005,
      why: String.raw`The maximum is at $x = \tfrac12$, giving $u(\tfrac12) = \tfrac12\cdot\tfrac12 = \tfrac14$. Check it against the definition: $u' = +\tfrac12$ then $-\tfrac12$, so $\int_0^1 u'v' = \tfrac12 v(\tfrac12) + \tfrac12 v(\tfrac12) = v(\tfrac12)$, which is exactly $\langle\delta_{1/2}, v\rangle$. Answering $0.5$ reads off the slope instead of the height. The load $\delta_{1/2}$ is admissible because point evaluation is a bounded functional on $H^1_0(0,1)$ — a one-dimensional Sobolev embedding at work.`,
    },
    {
      kind: 'explain',
      title: 'The symmetric case: minimise the energy',
      body: String.raw`When $a$ is symmetric — as it is for $-\Delta$ — the weak problem has a second, equivalent face. Define the **energy**
$$J(v) \;=\; \tfrac12\,a(v,v) \;-\; F(v) \;=\; \tfrac12\int_\Omega|\nabla v|^2 \;-\; \int_\Omega f v .$$

> $u$ solves $a(u,v) = F(v)$ for all $v$ **iff** $u$ is the unique minimiser of $J$ over $H^1_0(\Omega)$.

One direction is a one-line computation: $J(u + tv) = J(u) + t\big(a(u,v) - F(v)\big) + \tfrac{t^2}{2}a(v,v)$, and the linear term vanishes for all $v$ exactly when the weak equation holds; coercivity makes the quadratic term positive, so the critical point is a strict minimum.

This is the **Dirichlet principle**: a membrane settles into the shape of least energy. Riemann used it freely, Weierstrass pointed out that an infimum need not be attained, and Hilbert repaired it — the repair being, in modern language, to minimise over a *complete* space with the right compactness, which is to say over $H^1_0$ rather than over smooth functions. The whole of this unit is the equipment that repair needed.`,
    },
    {
      kind: 'explain',
      title: 'Galerkin: solve it in a finite-dimensional subspace',
      body: String.raw`Weak formulations are not only a proof technique; they are an algorithm. Pick a finite-dimensional subspace $V_h \subset H$ and ask the *same question* there: find $u_h \in V_h$ with
$$a(u_h, v_h) = F(v_h) \qquad \text{for all } v_h \in V_h .$$
In a basis $\{\varphi_1,\dots,\varphi_N\}$ of $V_h$ this is the linear system $A\mathbf c = \mathbf b$ with $A_{ij} = a(\varphi_j, \varphi_i)$ (the **stiffness matrix**) and $b_i = F(\varphi_i)$ (the **load vector**). Lax–Milgram applies verbatim to $V_h$, so $A$ is invertible.

How good is $u_h$? Subtracting the two problems gives **Galerkin orthogonality**, $a(u - u_h,\, v_h) = 0$ for all $v_h \in V_h$, and from it **Céa's lemma**:
$$\|u - u_h\| \;\le\; \frac{C}{\alpha}\,\inf_{v_h \in V_h}\|u - v_h\| .$$

Read that carefully: the computed answer is within a *fixed constant* of the best possible approximation in the subspace. All the analyst must then do is estimate how well the subspace approximates — a pure approximation-theory question. When $a$ is symmetric, $C/\alpha = 1$ **in the energy norm** $\|v\|_a = \sqrt{a(v,v)}$ — not in $H^1$, where the constant is still $C/\alpha$ — and $u_h$ is exactly the $a$-orthogonal projection of $u$ onto $V_h$, the best approximation in that norm.`,
    },
    {
      kind: 'widget',
      title: 'Finite elements, from the weak form',
      body: String.raw`Take $V_h$ to be the continuous piecewise-linear functions on a mesh, vanishing at both ends, with the **hat functions** $\varphi_i$ as a basis. Each hat is in $H^1_0$ (continuous, kinked, zero at the ends) but nowhere near $C^2$ — which is exactly why the weak formulation was necessary: there is no classical formulation these functions could satisfy.

The stiffness matrix comes out tridiagonal, $\frac1h\operatorname{tridiag}(-1,2,-1)$, because hats overlap only with their neighbours. Refine the mesh and watch the error fall like $h^2$.`,
      widget: { type: 'MathFemGalerkin', props: { load: 'const', n: 4 }, caption: String.raw`Try the **wiggle** load on a coarse mesh: Céa's lemma still holds, but the best approximation in a coarse $V_h$ is itself poor, and that is the whole of the error.` },
    },
    {
      kind: 'match',
      prompt: 'Match each ingredient to its role.',
      pairs: [
        [String.raw`$H^1_0(\Omega)$`, String.raw`the space: one weak derivative, zero boundary trace`],
        [String.raw`Poincaré inequality`, String.raw`supplies coercivity of $a(u,v) = \int\nabla u\cdot\nabla v$`],
        [String.raw`Lax–Milgram`, String.raw`existence, uniqueness and stability of the weak solution`],
        [String.raw`elliptic regularity`, String.raw`upgrades a weak solution to a classical one when the data is smooth`],
        [String.raw`Céa’s lemma`, String.raw`the Galerkin solution is quasi-optimal in its subspace`],
      ],
      why: String.raw`Follow the chain: the space makes the problem well posed, Poincaré supplies the one hypothesis that is not automatic, Lax–Milgram delivers the solution, regularity says you lost nothing by weakening, and Céa turns the same formulation into a convergent numerical method. Each link fails without the previous one.`,
    },
    {
      kind: 'fill',
      prompt: String.raw`A weak solution is sought in ___ and satisfies $\int\nabla u\cdot\nabla v = \int fv$ for every test function. Lax–Milgram needs the bilinear form to be bounded and ___ , the latter coming from the ___ inequality. A weak solution that is $C^2$ is also a ___ solution.`,
      bank: ['$H^1_0$', '$C^2$', 'coercive', 'symmetric', 'Poincaré', 'Cauchy–Schwarz', 'classical', 'unique'],
      answer: ['$H^1_0$', 'coercive', 'Poincaré', 'classical'],
      why: String.raw`The space must carry both a derivative and the boundary condition, which $C^2$ does not do usefully here. Symmetry is *not* a hypothesis of Lax–Milgram — dropping it is the whole point, since it lets the theorem cover non-self-adjoint operators. Cauchy–Schwarz gives boundedness, Poincaré gives coercivity, and the consistency statement runs in both directions.`,
    },
    {
      kind: 'explain',
      title: 'Key takeaways',
      body: String.raw`- A **classical solution** must be $C^2$ and satisfy the equation pointwise. Point loads and rough sources or coefficients make that impossible even when a physical answer plainly exists; re-entrant corners cost smoothness up to the boundary.
- **Weak formulation:** multiply by a test function and integrate by parts, moving one derivative onto the test function. For $-\Delta u = f$ with zero Dirichlet data: find $u \in H^1_0(\Omega)$ with $\int\nabla u\cdot\nabla v = \int fv$ for all $v \in H^1_0(\Omega)$.
- What it buys: one derivative instead of two, data as rough as $H^{-1}$, and a **Hilbert space** to work in with projections, duality and compactness.
- Nothing is lost: classical $\Rightarrow$ weak; weak $+\ C^2 \Rightarrow$ classical; and **elliptic regularity** makes the weak solution smooth whenever $f$ and $\partial\Omega$ are.
- **Lax–Milgram:** on a Hilbert space, a **bounded** and **coercive** bilinear form (symmetry not required) plus a bounded functional gives a unique $u$ with $a(u,v) = F(v)$, and $\|u\| \le \|F\|/\alpha$. Boundedness is Cauchy–Schwarz; coercivity is **Poincaré**.
- Symmetric case: the weak solution is the unique minimiser of the energy $J(v) = \tfrac12 a(v,v) - F(v)$ — the Dirichlet principle, made rigorous by minimising over $H^1_0$.
- **Galerkin:** pose the same problem in a finite-dimensional $V_h$ and solve $A\mathbf c = \mathbf b$. **Céa's lemma** makes it quasi-optimal, $\|u - u_h\| \le \frac C\alpha \inf_{v_h}\|u - v_h\|$. With piecewise-linear hats this is the finite element method.
- Learning the map $f \mapsto u$ directly, rather than assembling and solving $A\mathbf c = \mathbf b$ each time, is the premise of [operator learning](@math/operator-learning-intro).`,
    },
  ],
  references: [
    { authors: 'L. C. Evans', title: 'Partial Differential Equations', year: 2010, venue: '2nd ed., AMS Graduate Studies in Mathematics 19', detail: 'Ch. 6 (second-order elliptic equations: weak solutions §6.1, Lax–Milgram and the energy estimates §6.2, regularity §6.3); §8.1 (the direct method and the Dirichlet principle)' },
    { authors: 'H. Brezis', title: 'Functional Analysis, Sobolev Spaces and Partial Differential Equations', year: 2011, venue: 'Springer Universitext', detail: 'Ch. 5 (the Stampacchia and Lax–Milgram theorems); Ch. 8–9 (variational formulation of boundary value problems, regularity)' },
    { authors: 'P. D. Lax, A. N. Milgram', title: 'Parabolic equations', year: 1954, venue: 'Contributions to the Theory of Partial Differential Equations, Annals of Mathematics Studies 33, Princeton University Press, 167–190', detail: 'The original source of the theorem' },
    { authors: 'D. Braess', title: 'Finite Elements: Theory, Fast Solvers, and Applications in Solid Mechanics', year: 2007, venue: '3rd ed., Cambridge University Press', detail: 'Ch. I–II (variational formulation, the Dirichlet principle, Lax–Milgram, Céa’s lemma, conforming finite elements)' },
    { authors: 'S. C. Brenner, L. R. Scott', title: 'The Mathematical Theory of Finite Element Methods', year: 2008, venue: '3rd ed., Springer Texts in Applied Mathematics 15', detail: 'Ch. 0 and Ch. 2 (variational formulation, Lax–Milgram, Céa’s lemma); Ch. 1 (Sobolev spaces); Ch. 4 (approximation theory and error estimates)' },
  ],
} satisfies LessonContent;
