import type { LessonContent } from '../../types';

// ½ ⊗ ½ = 1 ⊕ 0 : four product states regroup into a triplet and a singlet.
const cgSvg = String.raw`<svg viewBox="0 0 320 226" xmlns="http://www.w3.org/2000/svg" font-size="9" font-family="inherit">
  <text x="160" y="13" text-anchor="middle" font-size="10.5" font-weight="bold" fill="var(--fg)">two spin-½ particles: 2 × 2 = 3 + 1</text>

  <!-- left: the four product states -->
  <text x="14" y="32" fill="var(--muted)">product basis (4 states)</text>
  <g font-size="10">
    <rect x="14" y="40" width="74" height="20" rx="4" fill="var(--c2)" fill-opacity="0.16" stroke="var(--c2)"/>
    <text x="51" y="54" text-anchor="middle" fill="var(--fg)">↑↑</text>
    <rect x="14" y="66" width="74" height="20" rx="4" fill="var(--c2)" fill-opacity="0.16" stroke="var(--c2)"/>
    <text x="51" y="80" text-anchor="middle" fill="var(--fg)">↑↓</text>
    <rect x="14" y="92" width="74" height="20" rx="4" fill="var(--c2)" fill-opacity="0.16" stroke="var(--c2)"/>
    <text x="51" y="106" text-anchor="middle" fill="var(--fg)">↓↑</text>
    <rect x="14" y="118" width="74" height="20" rx="4" fill="var(--c2)" fill-opacity="0.16" stroke="var(--c2)"/>
    <text x="51" y="132" text-anchor="middle" fill="var(--fg)">↓↓</text>
  </g>

  <text x="100" y="92" font-size="14" fill="var(--muted)">→</text>

  <!-- right: triplet -->
  <text x="128" y="32" fill="var(--c1)">J = 1  (triplet, 3 states)</text>
  <g font-size="9.5">
    <rect x="128" y="40" width="176" height="20" rx="4" fill="var(--c1)" fill-opacity="0.14" stroke="var(--c1)"/>
    <text x="134" y="54" fill="var(--fg)">m = +1:  ↑↑</text>
    <rect x="128" y="66" width="176" height="20" rx="4" fill="var(--c1)" fill-opacity="0.14" stroke="var(--c1)"/>
    <text x="134" y="80" fill="var(--fg)">m =  0:  (↑↓ + ↓↑)/√2</text>
    <rect x="128" y="92" width="176" height="20" rx="4" fill="var(--c1)" fill-opacity="0.14" stroke="var(--c1)"/>
    <text x="134" y="106" fill="var(--fg)">m = −1:  ↓↓</text>
  </g>

  <text x="128" y="134" fill="var(--c5)">J = 0  (singlet, 1 state)</text>
  <rect x="128" y="140" width="176" height="20" rx="4" fill="var(--c5)" fill-opacity="0.14" stroke="var(--c5)"/>
  <text x="134" y="154" font-size="9.5" fill="var(--fg)">m =  0:  (↑↓ − ↓↑)/√2</text>

  <line x1="14" y1="172" x2="306" y2="172" stroke="var(--grid)"/>
  <text x="14" y="188" fill="var(--muted)">dimensions: (2·½+1)(2·½+1) = 4 = 3 + 1 = (2·1+1) + (2·0+1)</text>
  <text x="14" y="202" fill="var(--muted)">the triplet is symmetric under swapping the two particles, the singlet antisymmetric</text>
  <text x="14" y="216" fill="var(--c4)">each block is invariant under the ladder operators, and irreducible on its own</text>
</svg>`;

export default {
  cards: [
    {
      kind: 'explain',
      title: 'One algebra, every quantum system',
      body: String.raw`A Lie group rarely acts on just one space. $SO(3)$ rotates vectors in $\mathbb R^3$, but it also rotates the stress tensor of a solid, the spherical harmonics on a sphere, and the state space of a hydrogen atom. Each of those is a **representation** — a concrete linear model of the same abstract symmetry.

For $\mathfrak{su}(2) \cong \mathfrak{so}(3)$ the answer is startlingly clean: there is **exactly one** irreducible representation in each dimension $1, 2, 3, 4, \dots$, and you can build them all by hand. That list is the periodic table of angular momentum, and everything in this lesson is a consequence of three brackets.`,
    },
    {
      kind: 'recall',
      title: 'Representations, from the finite-group case',
      points: [
        String.raw`A **representation** of $G$ on a vector space $V$ is a homomorphism $\pi : G \to GL(V)$: each group element becomes an invertible matrix, and $\pi(gh) = \pi(g)\pi(h)$.`,
        String.raw`$W \subseteq V$ is **invariant** if $\pi(g)W \subseteq W$. $V$ is **irreducible** if its only invariant subspaces are $0$ and $V$.`,
        String.raw`**Maschke:** for a finite group over $\mathbb C$, every representation splits as a direct sum of irreducibles — averaging over the group makes an invariant inner product.`,
        String.raw`**Schur's lemma:** a map commuting with the whole action is zero or invertible; over $\mathbb C$, on an irreducible space it is a *scalar*.`,
      ],
      link: 'math/representations-intro',
    },
    {
      kind: 'explain',
      title: 'Groups downstairs, algebras upstairs',
      body: String.raw`A representation of a Lie group $G$ is a *smooth* homomorphism $\pi : G \to GL(V)$. A representation of a Lie algebra $\mathfrak g$ is a linear map $\rho : \mathfrak g \to \mathfrak{gl}(V)$ that respects brackets, $\rho([X,Y]) = \rho(X)\rho(Y) - \rho(Y)\rho(X)$.

The two are tied together:

- **Differentiate.** Every $\pi$ gives $\rho = d\pi$, and $\pi(\exp X) = \exp(\rho(X))$.
- **Integrate.** If $G$ is **simply connected**, every $\rho$ comes from a unique $\pi$. If it is not, some $\rho$ fail to integrate — which is exactly the $SU(2)$ versus $SO(3)$ story of the [last lesson](@math/so3-su2).

Two more simplifications. Averaging over a *compact* group with its Haar measure replaces summing over a finite group, so Maschke's theorem survives: representations of $SU(2)$ are completely reducible. And a complex-linear representation of $\mathfrak{su}(2)$ is the same thing as one of its **complexification** $\mathfrak{sl}(2,\mathbb C)$, which is easier to compute in.`,
    },
    {
      kind: 'explain',
      title: 'The three brackets, and the ladder',
      body: String.raw`Work in $\mathfrak{sl}(2,\mathbb C)$ with the standard basis
$$H = \begin{pmatrix}1&0\\0&-1\end{pmatrix},\quad E = \begin{pmatrix}0&1\\0&0\end{pmatrix},\quad F = \begin{pmatrix}0&0\\1&0\end{pmatrix},$$
$$[H,E] = 2E,\qquad [H,F] = -2F,\qquad [E,F] = H.$$

Pick any representation and diagonalise $H$ (possible over $\mathbb C$). A **weight** is an eigenvalue $\lambda$ of $H$, and the corresponding eigenvectors are **weight vectors**. Now the one computation the whole subject rests on: if $Hv = \lambda v$ then
$$H(Ev) = ([H,E] + EH)v = 2Ev + \lambda Ev = (\lambda + 2)\,Ev.$$

So $E$ **raises** the weight by $2$ and, identically, $F$ **lowers** it by $2$. The weight vectors sit on a ladder, and $E, F$ are the rungs. In physics $H \leftrightarrow 2J_z$ and $E, F \leftrightarrow J_\pm$.`,
    },
    {
      kind: 'widget',
      title: 'Climb the ladder',
      body: String.raw`Each rung is a weight: an eigenvalue $m$ of $J_z$. Press $J_+$ and $J_-$ to move the highlighted state, and read the exact matrix element
$$J_\pm\,|j,m\rangle = \sqrt{\,j(j+1) - m(m\pm1)\,}\;|j, m\pm1\rangle .$$

Notice what happens at the ends. At the top rung $m = j$ the factor $j(j+1) - j(j+1)$ is zero, so $J_+$ annihilates it; at the bottom, $J_-$ does. **The ladder terminates**, and that is the whole reason a representation can be finite-dimensional.`,
      widget: { type: 'MathWeightLadder', props: { j: 1, j2: 0.5, showTensor: true }, caption: String.raw`Switch $j$ between $\tfrac12$, $1$ and $\tfrac32$ and watch the dimension $2j+1$ and the rung spacing of $1$ in $m$ (i.e. $2$ in the weight $\lambda = 2m$).` },
    },
    {
      kind: 'mcq',
      prompt: String.raw`In a representation of $\mathfrak{sl}(2,\mathbb C)$, $v$ satisfies $Hv = 6v$. What is the weight of $F^2 v$, assuming it is nonzero?`,
      choices: [String.raw`$2$`, String.raw`$4$`, String.raw`$10$`, String.raw`$3$`],
      answer: 0,
      why: String.raw`$F$ lowers the weight by $2$ each time, so two applications give $6 - 4 = 2$. Getting $4$ means applying $F$ only once; getting $10$ means using the raising operator $E$ by mistake; and $3$ would be halving the weight, confusing $H$ with the physicists' $J_z = H/2$ (whose eigenvalue here is $3$, dropping to $1$ after two steps).`,
    },
    {
      kind: 'explain',
      title: 'The highest-weight theorem',
      body: String.raw`Let $V$ be a finite-dimensional irreducible representation. Since $\dim V < \infty$, the weights cannot climb for ever, so some weight vector $v_0$ has
$$Ev_0 = 0, \qquad Hv_0 = \lambda v_0 .$$
Call $v_0$ a **highest-weight vector** and $\lambda$ the **highest weight**. Put $v_k = F^k v_0$. Induction gives
$$Hv_k = (\lambda - 2k)\,v_k, \qquad E v_k = k(\lambda - k + 1)\,v_{k-1}.$$

Let $m$ be the largest index with $v_m \ne 0$, so $v_{m+1} = 0$. Apply $E$ to that zero:
$$0 = E v_{m+1} = (m+1)(\lambda - m)\,v_m \;\Longrightarrow\; \lambda = m .$$

> **Theorem.** The highest weight is a non-negative **integer** $m$; the vectors $v_0,\dots,v_m$ span $V$; and for each $m \ge 0$ there is exactly one irreducible representation of $\mathfrak{sl}(2,\mathbb C)$ up to isomorphism, of dimension $m+1$.

Existence is the easy direction: define $H$, $E$, $F$ on a basis $v_0,\dots,v_m$ by the formulas above and check the three brackets. No dimension is missing and none is repeated. The integrality was not assumed — it was *forced* by finite-dimensionality.`,
    },
    {
      kind: 'order',
      prompt: String.raw`Arrange the proof that the highest weight of a finite-dimensional irreducible $\mathfrak{sl}(2,\mathbb C)$-representation is a non-negative integer.`,
      steps: [
        String.raw`$H$ has an eigenvector in $V$ (we are over $\mathbb C$), and $E$ raises weights by $2$, so a finite-dimensional $V$ must contain $v_0$ with $Ev_0 = 0$ and $Hv_0 = \lambda v_0$.`,
        String.raw`Define $v_k = F^k v_0$ and prove by induction that $Hv_k = (\lambda - 2k)v_k$ and $Ev_k = k(\lambda - k + 1)v_{k-1}$.`,
        String.raw`Distinct eigenvalues give independent eigenvectors, so the nonzero $v_k$ are independent; finite dimension forces a smallest $m$ with $v_{m+1} = 0$.`,
        String.raw`Apply $E$ to $v_{m+1} = 0$: the formula gives $(m+1)(\lambda - m)v_m = 0$, and $v_m \ne 0$ with $m+1 \ne 0$ leaves $\lambda = m$.`,
        String.raw`The span of $v_0,\dots,v_m$ is invariant under $H$, $E$ and $F$, so by irreducibility it is all of $V$ and $\dim V = m+1$.`,
      ],
      why: String.raw`Each step feeds the next: you need the highest-weight vector before you can define the chain, the chain before you can see it must stop, and the stopping condition before you can pin down $\lambda$. The last step is what turns "we found some vectors" into "we found a basis" — without irreducibility the span might be a proper subrepresentation.`,
    },
    {
      kind: 'explain',
      title: 'The physicists’ labels',
      body: String.raw`Physics rescales: set $j = m/2$, so $j \in \{0, \tfrac12, 1, \tfrac32, \dots\}$, and use $J_z = H/2$, $J_\pm = E, F$. Then the **spin-$j$** representation has

- dimension $2j+1$;
- $J_z$ eigenvalues (weights) $m = j,\, j-1,\, \dots,\, -j$, spaced by $1$;
- $J_\pm|j,m\rangle = \sqrt{j(j+1)-m(m\pm1)}\,|j,m\pm1\rangle$.

The **Casimir element** $C = \tfrac12 H^2 + EF + FE$ commutes with all of $\mathfrak{sl}(2,\mathbb C)$, so by Schur's lemma it acts as a single scalar on each irreducible space. On the highest-weight vector, $C = \tfrac12 m^2 + m = \tfrac12 m(m+2)$, which in terms of $j = m/2$ is $2j(j+1)$. Physicists use the rescaled operator $J^2 = J_x^2+J_y^2+J_z^2 = \tfrac14 H^2 + \tfrac12(EF+FE) = \tfrac12 C$, whose scalar is
$$J^2 = j(j+1).$$
The two differ by the factor $2$ — keep track of which normalisation you are using.
Note $j(j+1) > j^2$: the length of the angular momentum vector always exceeds its largest measurable component, which is the geometric content of the uncertainty between $J_x$, $J_y$ and $J_z$. Compare [angular momentum in quantum mechanics](@quantum/angular-momentum), where these are derived from the physics side.`,
    },
    {
      kind: 'numeric',
      prompt: String.raw`What is the dimension of the spin-$\tfrac32$ representation of $\mathfrak{su}(2)$?`,
      answer: 4,
      why: String.raw`$\dim = 2j+1 = 2\cdot\tfrac32 + 1 = 4$, with $J_z$ values $\tfrac32, \tfrac12, -\tfrac12, -\tfrac32$. A common slip is $3$, which is $2j$ rather than $2j+1$. In the $\mathfrak{sl}_2$ labelling this is the irrep with highest weight $m = 3$, dimension $m+1 = 4$.`,
    },
    {
      kind: 'explain',
      title: 'Which of these are representations of SO(3)?',
      body: String.raw`All of them represent $\mathfrak{su}(2)$, and because $SU(2)$ is simply connected, all of them integrate to $SU(2)$. The question is which descend to $SO(3) = SU(2)/\{\pm I\}$ — and a representation $\pi$ of $SU(2)$ descends exactly when it kills the kernel, i.e. when $\pi(-I) = I$.

Writing $-I = \exp(-i\pi\sigma_3)$ and feeding it through the spin-$j$ representation gives
$$\pi_j(-I) = (-1)^{2j}\,I .$$

- **$j$ integer** ($\dim = 1, 3, 5, \dots$): $\pi_j(-I) = I$, so these are honest $SO(3)$ representations. Dimension $2l+1$ is realised concretely on the harmonic polynomials of degree $l$ in three variables — the spherical harmonics $Y_l^{m}$.
- **$j$ half-integer** ($\dim = 2, 4, 6, \dots$): $\pi_j(-I) = -I$, so these are *not* representations of $SO(3)$. They are **projective** ones: rotating by $2\pi$ multiplies the state by $-1$. These are the [spinors](@quantum/spin).

The familiar $\mathbb R^3$ is $j = 1$; the electron is $j = \tfrac12$.`,
    },
    {
      kind: 'truefalse',
      prompt: String.raw`Every finite-dimensional representation of the Lie algebra $\mathfrak{so}(3)$ comes from a representation of the group $SO(3)$.`,
      answer: false,
      why: String.raw`The spin-$\tfrac12$ representation is a perfectly good 2-dimensional representation of $\mathfrak{so}(3) \cong \mathfrak{su}(2)$, but it does not integrate to $SO(3)$: following the generator round a $2\pi$ rotation returns $-I$, not $I$. Integration is guaranteed only for the *simply connected* group in the family, here $SU(2)$. (The other direction is always fine: every group representation differentiates.)`,
    },
    {
      kind: 'explain',
      title: 'Putting two together: Clebsch–Gordan',
      body: String.raw`Combine two systems and their state space is a tensor product $V_{j_1} \otimes V_{j_2}$, on which the algebra acts by $\rho(X) = \rho_1(X)\otimes I + I \otimes \rho_2(X)$ (the derivative of $g \mapsto \pi_1(g)\otimes\pi_2(g)$ — this is why angular momenta *add*). The product is almost never irreducible, and the decomposition is the **Clebsch–Gordan series**:
$$V_{j_1} \otimes V_{j_2} \;\cong\; V_{j_1+j_2} \,\oplus\, V_{j_1+j_2-1} \,\oplus\, \cdots \,\oplus\, V_{|j_1-j_2|},$$
every value appearing exactly once. The dimensions must match:
$$(2j_1+1)(2j_2+1) \;=\; \sum_{J=|j_1-j_2|}^{j_1+j_2} (2J+1).$$

Check with $j_1 = j_2 = \tfrac12$: $2 \times 2 = 4$ and $3 + 1 = 4$. Two electrons give a spin-$1$ **triplet** and a spin-$0$ **singlet**.`,
    },
    {
      kind: 'widget',
      title: '½ ⊗ ½ = 1 ⊕ 0',
      body: String.raw`The four product states regroup into two blocks that the ladder operators never mix. The $m = 0$ line is where the interesting algebra happens: the symmetric combination belongs to the triplet, the antisymmetric one is the singlet, and no amount of raising or lowering carries you from one block to the other.

This is the pattern behind the periodic table (coupling electron spins), behind nuclear isospin, and behind every "add the angular momenta" table you will ever use — see [adding angular momentum](@quantum/adding-angular-momentum).`,
      widget: { type: 'SvgDiagram', props: { svg: cgSvg } },
    },
    {
      kind: 'match',
      prompt: 'Match each representation-theoretic object to what it is.',
      pairs: [
        [String.raw`weight`, String.raw`an eigenvalue of $H$ (equivalently of $J_z$)`],
        [String.raw`$E$ and $F$`, String.raw`ladder operators, shifting the weight by $\pm2$`],
        [String.raw`highest-weight vector`, String.raw`a weight vector killed by $E$`],
        [String.raw`Casimir $\tfrac12 H^2 + EF + FE$`, String.raw`central, so a scalar on each irreducible space`],
        [String.raw`Clebsch–Gordan series`, String.raw`the decomposition of a tensor product into irreducibles`],
      ],
      why: String.raw`Weights are the coordinates of the theory, the ladder operators move between them, the highest-weight vector is the top of the ladder that labels the whole representation, the Casimir is the invariant that distinguishes one irreducible from another by Schur's lemma, and Clebsch–Gordan is the bookkeeping for combining two of them.`,
    },
    {
      kind: 'fill',
      prompt: String.raw`In a finite-dimensional irreducible representation of $\mathfrak{sl}(2,\mathbb C)$ the highest weight must be a non-negative ___, and the dimension is one more than it. In physics labels the dimension is ___ and the physics Casimir $J^2$ acts as the scalar ___. Half-integer $j$ gives a representation of $SU(2)$ but only a ___ representation of $SO(3)$.`,
      bank: ['integer', 'real number', '$2j+1$', '$j+1$', '$j(j+1)$', '$j^2$', 'projective', 'unitary'],
      answer: ['integer', '$2j+1$', '$j(j+1)$', 'projective'],
      why: String.raw`Integrality is forced by the ladder terminating at both ends, not assumed. The dimension counts the rungs $m = j, \dots, -j$, which is $2j+1$ of them. The physics Casimir $J^2$ gives $j(j+1)$ (the $\mathfrak{sl}_2$ element $C$ gives twice that), strictly larger than $j^2$, which is why the angular momentum vector can never point exactly along an axis. And "projective" is the precise word for a representation defined only up to phase — a genuine representation of the double cover.`,
    },
    {
      kind: 'explain',
      title: 'Key takeaways',
      body: String.raw`- A Lie group representation differentiates to a Lie algebra one, with $\pi(\exp X) = \exp(\rho(X))$. The converse holds when the group is **simply connected** — which is why $SU(2)$, not $SO(3)$, carries them all.
- Work in the complexification $\mathfrak{sl}(2,\mathbb C)$ with $[H,E]=2E$, $[H,F]=-2F$, $[E,F]=H$. **Weights** are eigenvalues of $H$; $E$ raises them by $2$ and $F$ lowers them by $2$.
- **Highest-weight theorem:** a finite-dimensional irreducible representation has a vector killed by $E$, its weight is a non-negative integer $m$, and the representation is $\operatorname{span}\{v_0, Fv_0, \dots, F^m v_0\}$ of dimension $m+1$. One irreducible in every dimension, no more and no fewer.
- Physics labels: $j = m/2$, dimension $2j+1$, weights $m = j,\dots,-j$, $J_\pm|j,m\rangle = \sqrt{j(j+1)-m(m\pm1)}\,|j,m\pm1\rangle$, Casimir $J^2 = \tfrac12 C = j(j+1)$ by Schur (the $\mathfrak{sl}_2$ element $C = \tfrac12H^2+EF+FE$ acts as $2j(j+1)$).
- $\pi_j(-I) = (-1)^{2j}$: **integer** $j$ gives genuine $SO(3)$ representations (spherical harmonics); **half-integer** $j$ gives spinors, representations of $SU(2)$ only.
- **Clebsch–Gordan:** $V_{j_1}\otimes V_{j_2} \cong \bigoplus_{J=|j_1-j_2|}^{j_1+j_2} V_J$, each once; e.g. $\tfrac12\otimes\tfrac12 = 1 \oplus 0$.
- The same machinery — Cartan subalgebra, weights, a theorem of the highest weight — classifies the representations of every semisimple Lie algebra; $\mathfrak{sl}_2$ is the rank-one case everything else is built from.

Next in this unit: [symmetry and conservation laws](@math/noether-symmetry).`,
    },
  ],
  references: [
    { authors: 'B. C. Hall', title: 'Lie Groups, Lie Algebras, and Representations: An Elementary Introduction', year: 2015, venue: '2nd ed., Springer GTM 222', detail: 'Ch. 4 (basic representation theory; §4.6 the representations of sl(2;C); §4.7 group versus Lie algebra representations); Ch. 6 (the representations of SU(3) and the general highest-weight theory)' },
    { authors: 'W. Fulton, J. Harris', title: 'Representation Theory: A First Course', year: 1991, venue: 'Springer GTM 129', detail: 'Lecture 11 (representations of sl₂C: weights, raising and lowering operators, the classification) and Lecture 12 (sl₃C)' },
    { authors: 'H. Georgi', title: 'Lie Algebras in Particle Physics', year: 1999, venue: '2nd ed., Westview Press', detail: 'Ch. 3 (su(2) and its irreducible representations), Ch. 4 (tensor products and Clebsch–Gordan)' },
    { authors: 'P. Woit', title: 'Quantum Theory, Groups and Representations: An Introduction', year: 2017, venue: 'Springer', detail: 'Ch. 8 (representations of su(2) and SU(2)), Ch. 9 (tensor products, the Clebsch–Gordan decomposition)' },
    { authors: 'J. E. Humphreys', title: 'Introduction to Lie Algebras and Representation Theory', year: 1972, venue: 'Springer GTM 9', detail: '§7 (representations of sl(2,F)), §20–21 (weights, the theorem of the highest weight)' },
  ],
} satisfies LessonContent;
