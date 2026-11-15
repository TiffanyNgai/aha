import type { LessonContent } from '../../types';

const tangentSvg = String.raw`<svg viewBox="0 0 320 210" xmlns="http://www.w3.org/2000/svg" font-size="9.5" font-family="inherit">
  <defs>
    <linearGradient id="la-sheet" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="var(--c2)" stop-opacity="0.18"/>
      <stop offset="1" stop-color="var(--c2)" stop-opacity="0.04"/>
    </linearGradient>
  </defs>

  <text x="160" y="14" text-anchor="middle" font-size="10.5" font-weight="bold" fill="var(--fg)">the group G (curved) and its Lie algebra g (flat)</text>

  <path d="M 24 150 C 60 92, 120 76, 168 96 C 214 115, 262 104, 296 68 L 296 150 C 262 184, 214 176, 168 162 C 120 148, 60 182, 24 150 Z"
        fill="url(#la-sheet)" stroke="var(--c2)" stroke-width="1.8"/>
  <path d="M 24 150 C 60 92, 120 76, 168 96 C 214 115, 262 104, 296 68" fill="none" stroke="var(--c2)" stroke-width="2.2"/>
  <text x="34" y="172" fill="var(--c2)" font-weight="bold">G</text>

  <g>
    <polygon points="92,96 212,76 236,104 116,124" fill="var(--c4)" fill-opacity="0.18" stroke="var(--c4)" stroke-width="1.4" stroke-dasharray="4 3"/>
    <text x="238" y="78" fill="var(--c4)" font-weight="bold">g = T_I G</text>
  </g>

  <path d="M 112 118 C 134 100, 160 96, 186 102" fill="none" stroke="var(--c1)" stroke-width="2.4"/>
  <circle cx="112" cy="118" r="4.6" fill="var(--c1)"/>
  <text x="98" y="134" fill="var(--c1)" font-weight="bold">I</text>
  <circle cx="186" cy="102" r="4" fill="var(--c1)">
    <animate attributeName="cx" values="112;186;112" dur="5s" repeatCount="indefinite"/>
    <animate attributeName="cy" values="118;102;118" dur="5s" repeatCount="indefinite"/>
  </circle>
  <text x="192" y="98" fill="var(--c1)">exp(tX)</text>

  <line x1="112" y1="118" x2="168" y2="104" stroke="var(--c5)" stroke-width="2.6"/>
  <polygon points="172,103 161,99 162,108" fill="var(--c5)"/>
  <text x="128" y="100" fill="var(--c5)" font-weight="bold">X = velocity at I</text>

  <text x="16" y="196" font-size="9" fill="var(--muted)">Differentiate a curve in G at the identity → a vector X in the flat space g.</text>
  <text x="16" y="207" font-size="9" fill="var(--muted)">Exponentiate a vector X in g → a curve exp(tX) back in G.</text>
</svg>`;

export default {
  cards: [
    {
      kind: 'explain',
      title: 'Zoom in on the identity',
      body: String.raw`A Lie group is curved and non-commutative — awkward. But zoom far enough into any smooth surface and it looks flat. Zoom into a Lie group **at the identity** and you get a vector space, where addition and scalar multiplication work as usual.

That flat picture is the **Lie algebra**. Almost all the group's structure survives the zoom, hidden in one extra operation: the bracket $[X,Y] = XY - YX$. Lie theory's central trick is to answer questions about the curved group by doing linear algebra in the flat algebra.`,
    },
    {
      kind: 'explain',
      title: 'Definition',
      body: String.raw`Let $G$ be a matrix Lie group. Its **Lie algebra** is
$$\mathfrak{g} = \{\,X : \exp(tX) \in G \text{ for all real } t\,\}.$$

Read it as: $X$ is an allowed *infinitesimal motion* if the one-parameter subgroup it generates never leaves the group. Equivalently (and this is the picture to keep), $\mathfrak g$ is the [tangent space](@math/tangent-spaces) to $G$ at the identity: the set of velocities $\gamma'(0)$ of smooth curves $\gamma$ in $G$ with $\gamma(0) = I$.

Two facts that are not obvious but are true for every matrix Lie group:

- $\mathfrak g$ is a **real vector space**: if $X, Y \in \mathfrak g$ and $s \in \mathbb R$ then $X + Y \in \mathfrak g$ and $sX \in \mathfrak g$.
- $\mathfrak g$ is closed under the bracket $[X,Y] = XY - YX$.

Lower-case fraktur letters name algebras: $\mathfrak{so}(3)$ for $SO(3)$, $\mathfrak{su}(2)$ for $SU(2)$, $\mathfrak{gl}_n$ for $GL_n$.`,
    },
    {
      kind: 'widget',
      title: 'The flat space touching the curved group',
      body: String.raw`The green curve is a one-parameter subgroup $\exp(tX)$ sitting inside the group; its velocity at the identity is the red arrow $X$. Collect every such arrow and you get the dashed plane: the Lie algebra. Differentiation takes you from the curved sheet down to the flat one, and $\exp$ takes you back up.

Crucially, a curve that *stays in* $G$ has a velocity that satisfies a *linear* condition — which is how we will now read off each algebra by hand.`,
      widget: { type: 'SvgDiagram', props: { svg: tangentSvg } },
    },
    {
      kind: 'explain',
      title: 'Reading off 𝔰𝔬(n): differentiate the constraint',
      body: String.raw`$SO(n)$ is defined by $A^{\mathsf T}A = I$. Suppose $A(t)$ is a curve inside $SO(n)$ with $A(0) = I$ and $A'(0) = X$. Then for all $t$,
$$A(t)^{\mathsf T}A(t) = I.$$
Differentiate with the product rule and set $t = 0$ (using $A(0) = I$):
$$A'(0)^{\mathsf T}A(0) + A(0)^{\mathsf T}A'(0) = 0 \;\Longrightarrow\; X^{\mathsf T} + X = 0.$$

So $\mathfrak{so}(n)$ is exactly the **skew-symmetric** real matrices, $X^{\mathsf T} = -X$. Conversely, if $X^{\mathsf T} = -X$ then $\exp(X)^{\mathsf T} = \exp(X^{\mathsf T}) = \exp(-X) = \exp(X)^{-1}$, so $\exp(X) \in O(n)$, and $\det\exp(X) = e^{\operatorname{tr}X} = e^{0} = 1$ puts it in $SO(n)$.

Note the two consequences of skewness: zero diagonal, and dimension $n(n-1)/2$ — one free entry above the diagonal for each pair.

> The same calculation applied to $O(n)$ gives the same answer. **$O(n)$ and $SO(n)$ have identical Lie algebras** — the algebra only ever sees the piece of the group containing the identity.`,
    },
    {
      kind: 'order',
      prompt: String.raw`Arrange the derivation of $\mathfrak{u}(n)$, the Lie algebra of the unitary group $U(n) = \{A : A^{*}A = I\}$.`,
      steps: [
        String.raw`Take a smooth curve $A(t)$ in $U(n)$ with $A(0) = I$, and write $X = A'(0)$ for its velocity.`,
        String.raw`The curve stays in the group, so $A(t)^{*}A(t) = I$ holds for every $t$.`,
        String.raw`Differentiate both sides at $t = 0$: $A'(0)^{*}A(0) + A(0)^{*}A'(0) = 0$.`,
        String.raw`Use $A(0) = I$ to get $X^{*} + X = 0$, i.e. $X$ is anti-Hermitian.`,
        String.raw`Conversely $X^{*} = -X$ gives $\exp(X)^{*} = \exp(-X) = \exp(X)^{-1}$, so every anti-Hermitian $X$ really does lie in $\mathfrak u(n)$.`,
      ],
      why: String.raw`The pattern is always the same: write the defining equation along a curve, differentiate once, and evaluate at the identity — a quadratic condition on the group becomes a linear condition on the algebra. The converse step matters too, since differentiating alone only shows the condition is *necessary*.`,
    },
    {
      kind: 'explain',
      title: 'The dictionary',
      body: String.raw`Same recipe, every classical group:

| group | Lie algebra | condition on $X$ | dimension |
|---|---|---|---|
| $GL_n(\mathbb R)$ | $\mathfrak{gl}_n(\mathbb R)$ | none | $n^2$ |
| $SL_n(\mathbb R)$ | $\mathfrak{sl}_n(\mathbb R)$ | $\operatorname{tr}X = 0$ | $n^2-1$ |
| $O(n),\ SO(n)$ | $\mathfrak{so}(n)$ | $X^{\mathsf T} = -X$ | $n(n-1)/2$ |
| $U(n)$ | $\mathfrak{u}(n)$ | $X^{*} = -X$ | $n^2$ |
| $SU(n)$ | $\mathfrak{su}(n)$ | $X^{*} = -X$, $\operatorname{tr}X = 0$ | $n^2-1$ |

The trace conditions come straight from $\det\exp(tX) = e^{t\operatorname{tr}X}$: this equals $1$ for all $t$ exactly when $\operatorname{tr}X = 0$.

$\mathfrak{su}(2)$ is spanned by $\begin{pmatrix}i&0\\0&-i\end{pmatrix}$, $\begin{pmatrix}0&1\\-1&0\end{pmatrix}$, $\begin{pmatrix}0&i\\i&0\end{pmatrix}$ — three real dimensions, matching $n^2-1 = 3$. Note $\mathfrak{su}(2)$ is a *real* vector space even though its matrices are complex: multiplying by $i$ would destroy the condition $X^{*} = -X$.`,
    },
    {
      kind: 'numeric',
      prompt: String.raw`What is the dimension of $\mathfrak{so}(5)$, the Lie algebra of rotations of $\mathbb{R}^5$?`,
      answer: 10,
      why: String.raw`A skew $5\times5$ matrix is determined by the entries strictly above the diagonal: $5\cdot4/2 = 10$ of them, with the diagonal forced to zero. The answer is not $25$ ($\dim\mathfrak{gl}_5$) nor $24$ ($\dim\mathfrak{sl}_5$) — skewness is a much stronger condition than tracelessness.`,
    },
    {
      kind: 'explain',
      title: 'The bracket, and why it has to be there',
      body: String.raw`A Lie algebra is a vector space, but a vector space alone could not remember a non-commutative group. The missing structure is the **commutator**
$$[X, Y] = XY - YX,$$
which measures by how much $X$ and $Y$ fail to commute.

It satisfies three axioms, and these are the definition of an abstract Lie algebra:

1. **Bilinear**: linear in each slot.
2. **Antisymmetric**: $[X,Y] = -[Y,X]$, so $[X,X] = 0$.
3. **Jacobi identity**: $\big[X,[Y,Z]\big] + \big[Y,[Z,X]\big] + \big[Z,[X,Y]\big] = 0$.

The bracket is *not* associative, and the algebra is *not* closed under plain matrix multiplication — only under the bracket. For instance a nonzero $X \in \mathfrak{so}(3)$ has $X^{\mathsf T} = -X$, but $(X^2)^{\mathsf T} = (X^{\mathsf T})^2 = X^2$ is symmetric, so $X^2 \notin \mathfrak{so}(3)$, while $[X,Y]^{\mathsf T} = Y^{\mathsf T}X^{\mathsf T} - X^{\mathsf T}Y^{\mathsf T} = YX - XY = -[X,Y]$ keeps you inside.`,
    },
    {
      kind: 'truefalse',
      prompt: String.raw`If $X$ and $Y$ lie in the Lie algebra $\mathfrak g$ of a matrix Lie group, then so does the product $XY$.`,
      answer: false,
      why: String.raw`Only the *bracket* $XY - YX$ is guaranteed to stay inside. Counterexample in $\mathfrak{so}(3)$: $X = \begin{pmatrix}0&-1&0\\1&0&0\\0&0&0\end{pmatrix}$ is skew, but $X^{2} = \begin{pmatrix}-1&0&0\\0&-1&0\\0&0&0\end{pmatrix}$ is symmetric with nonzero diagonal, so it is not skew. A Lie algebra is closed under addition, scaling and bracket — nothing else.`,
    },
    {
      kind: 'widget',
      title: 'What the bracket measures',
      body: String.raw`Flow a little along $X$, then a little along $Y$; now do it in the other order. The two results differ, and the leading difference is governed by $[X,Y]$.

More precisely, the **group commutator** obeys
$$\exp(tX)\exp(tY)\exp(-tX)\exp(-tY) = \exp\big(t^{2}[X,Y] + O(t^{3})\big).$$
Go out and come back, and you do not land where you started — you have drifted in the direction $[X,Y]$, by an amount of order $t^2$.

Below, the preset **turn + stretch** uses $X = \begin{pmatrix}0&-1\\1&0\end{pmatrix}$ (rotate) and $Y = \begin{pmatrix}0.6&0\\0&-0.6\end{pmatrix}$ (stretch one axis, squash the other). These do not commute: rotating then stretching is not stretching then rotating. Press **commuting** and the gap vanishes, because a rotation does commute with a uniform dilation.`,
      widget: { type: 'MathBchCompare', props: { A: [0, -1, 1, 0], B: [0.6, 0, 0, -0.6], s: 1 } },
    },
    {
      kind: 'explain',
      title: 'The structure constants of 𝔰𝔬(3)',
      body: String.raw`Pick the basis of $\mathfrak{so}(3)$ generating rotations about the three axes:
$$L_1 = \begin{pmatrix}0&0&0\\0&0&-1\\0&1&0\end{pmatrix},\quad
L_2 = \begin{pmatrix}0&0&1\\0&0&0\\-1&0&0\end{pmatrix},\quad
L_3 = \begin{pmatrix}0&-1&0\\1&0&0\\0&0&0\end{pmatrix}.$$
Multiply them out and you find
$$[L_1, L_2] = L_3, \qquad [L_2, L_3] = L_1, \qquad [L_3, L_1] = L_2,$$
compactly $[L_i, L_j] = \sum_k \varepsilon_{ijk} L_k$, where $\varepsilon_{ijk}$ is $+1$ for a cyclic order $123$, $-1$ for a swap, and $0$ if an index repeats. Those numbers are the **structure constants**: once you know them, you know the algebra completely.

Physicists write the angular-momentum version with an extra $i$ and $\hbar$, $[J_i, J_j] = i\hbar\,\varepsilon_{ijk}J_k$, but it is the same bracket. That is the sense in which "angular momentum is $\mathfrak{so}(3)$".`,
    },
    {
      kind: 'mcq',
      prompt: String.raw`In $\mathfrak{sl}_2(\mathbb{R})$ put $H = \begin{pmatrix}1&0\\0&-1\end{pmatrix}$ and $E = \begin{pmatrix}0&1\\0&0\end{pmatrix}$. What is $[H, E]$?`,
      choices: [String.raw`$2E$`, String.raw`$-2E$`, String.raw`$E$`, String.raw`$0$`],
      answer: 0,
      why: String.raw`$HE = \begin{pmatrix}0&1\\0&0\end{pmatrix}$ and $EH = \begin{pmatrix}0&-1\\0&0\end{pmatrix}$, so $[H,E] = HE - EH = \begin{pmatrix}0&2\\0&0\end{pmatrix} = 2E$. Getting $-2E$ means subtracting the wrong way round; getting $0$ would need $H$ and $E$ to commute, which diagonal and strictly-upper matrices do not. Together with $[H,F] = -2F$ and $[E,F] = H$ these relations define $\mathfrak{sl}_2$, the most important Lie algebra in the subject.`,
    },
    {
      kind: 'match',
      prompt: 'Match each matrix Lie group to its Lie algebra.',
      pairs: [
        [String.raw`$SL_n(\mathbb{R})$`, String.raw`real matrices with $\operatorname{tr}X = 0$`],
        [String.raw`$SO(n)$`, String.raw`real matrices with $X^{\mathsf T} = -X$`],
        [String.raw`$U(n)$`, String.raw`complex matrices with $X^{*} = -X$`],
        [String.raw`$SU(n)$`, String.raw`complex matrices with $X^{*} = -X$ and $\operatorname{tr}X = 0$`],
        [String.raw`$GL_n(\mathbb{R})$`, String.raw`all real $n\times n$ matrices`],
      ],
      why: String.raw`Each condition is the derivative at $t = 0$ of the group's defining equation. The determinant conditions turn into trace conditions through $\det\exp(tX) = e^{t\operatorname{tr}X}$, and the "preserves an inner product" conditions turn into "$X$ plus its (conjugate) transpose is zero".`,
    },
    {
      kind: 'fill',
      prompt: String.raw`The Lie algebra of $G$ is the set of $X$ such that ___ lies in $G$ for every real $t$. For $G = SU(n)$ the matrix $X$ must be ___ and also ___. The algebra is closed under addition, scalar multiples and the ___, but not under matrix multiplication.`,
      bank: ['$\\exp(tX)$', '$tX$', 'anti-Hermitian', 'Hermitian', 'traceless', 'invertible', 'bracket', 'determinant'],
      answer: ['$\\exp(tX)$', 'anti-Hermitian', 'traceless', 'bracket'],
      why: String.raw`Membership is tested by exponentiating, not by scaling: $tX$ is a matrix, not a group element. $A^{*}A = I$ differentiates to $X^{*} = -X$ and $\det A = 1$ differentiates to $\operatorname{tr}X = 0$. Hermitian matrices form the *other* half of the picture — in physics $X = -iH$ with $H$ Hermitian, which is why observables are Hermitian while generators are anti-Hermitian.`,
    },
    {
      kind: 'explain',
      title: 'What the algebra remembers — and what it forgets',
      body: String.raw`The algebra is a faithful record of the group **near the identity**, and a lossy record far away.

- If two Lie groups have isomorphic Lie algebras, they are **locally isomorphic**: identical in a neighbourhood of the identity.
- But they need not be the same group. $SU(2)$ and $SO(3)$ both have 3-dimensional algebras with brackets $[e_i,e_j] = \varepsilon_{ijk}e_k$ in a suitable basis (for $\mathfrak{su}(2)$, $e_k = -\tfrac{i}{2}\sigma_k$ with $\sigma_k$ the Pauli matrices of the next lesson) — the *same* algebra — yet $SU(2)$ is a 3-sphere and $SO(3)$ is $\mathbb{R}P^3$. The difference is global [topology](@math/topology-intro), invisible to the derivative.
- Among all connected groups with a given algebra there is exactly one **simply connected** one, and every other is a quotient of it. For this algebra the simply connected group is $SU(2)$.

That is the subject of the next lesson, and the reason electrons behave the way they do.`,
    },
    {
      kind: 'explain',
      title: 'Key takeaways',
      body: String.raw`- $\mathfrak g = \{X : \exp(tX) \in G \text{ for all } t\in\mathbb R\}$ — the tangent space to $G$ at the identity, a **real vector space**.
- Get it by differentiating the defining equation along a curve at $t = 0$: $A^{\mathsf T}A = I \Rightarrow X^{\mathsf T} = -X$; $A^{*}A = I \Rightarrow X^{*} = -X$; $\det A = 1 \Rightarrow \operatorname{tr}X = 0$.
- Dimensions: $\mathfrak{gl}_n$: $n^2$; $\mathfrak{sl}_n$: $n^2-1$; $\mathfrak{so}(n)$: $n(n-1)/2$; $\mathfrak{u}(n)$: $n^2$; $\mathfrak{su}(n)$: $n^2-1$.
- The **bracket** $[X,Y] = XY - YX$ is bilinear, antisymmetric and satisfies the Jacobi identity. The algebra is closed under it but not under matrix products.
- Geometrically the bracket is the drift of the group commutator: $\exp(tX)\exp(tY)\exp(-tX)\exp(-tY) = \exp(t^{2}[X,Y] + \cdots)$.
- $\mathfrak{so}(3)$: $[L_i,L_j] = \varepsilon_{ijk}L_k$. $\mathfrak{sl}_2$: $[H,E]=2E$, $[H,F]=-2F$, $[E,F]=H$.
- The algebra pins the group down only locally: $SU(2)$ and $SO(3)$ share one algebra.

Next: those two groups, and the famous factor of two — [rotations: SO(3) and SU(2)](@math/so3-su2).`,
    },
  ],
  references: [
    { authors: 'B. C. Hall', title: 'Lie Groups, Lie Algebras, and Representations: An Elementary Introduction', year: 2015, venue: '2nd ed., Springer GTM 222', detail: 'Ch. 3 (Lie algebras: definition, the algebras of the classical groups, the Lie bracket)' },
    { authors: 'J. Stillwell', title: 'Naive Lie Theory', year: 2008, venue: 'Springer UTM', detail: 'Ch. 5 (the tangent space) and Ch. 6 (structure of Lie algebras)' },
    { authors: 'H. Georgi', title: 'Lie Algebras in Particle Physics', year: 1999, venue: '2nd ed., Westview Press', detail: 'Ch. 1–3 (generators, structure constants, su(2))' },
    { authors: 'L. W. Tu', title: 'An Introduction to Manifolds', year: 2011, venue: '2nd ed., Springer Universitext', detail: '§15–16 (Lie groups and Lie algebras)' },
  ],
} satisfies LessonContent;
