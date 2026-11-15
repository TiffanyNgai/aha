import type { LessonContent } from '../../types';

const shapesSvg = String.raw`<svg viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg" font-size="9" font-family="inherit">
  <text x="160" y="12" text-anchor="middle" font-size="10.5" font-weight="bold" fill="var(--fg)">every Lie group is also a shape</text>

  <g>
    <circle cx="54" cy="78" r="36" fill="none" stroke="var(--c2)" stroke-width="2.4"/>
    <circle cx="90" cy="78" r="4.5" fill="var(--c2)">
      <animateTransform attributeName="transform" type="rotate" from="0 54 78" to="360 54 78" dur="6s" repeatCount="indefinite"/>
    </circle>
    <line x1="54" y1="78" x2="90" y2="78" stroke="var(--muted)" stroke-width="1" stroke-dasharray="3 2">
      <animateTransform attributeName="transform" type="rotate" from="0 54 78" to="360 54 78" dur="6s" repeatCount="indefinite"/>
    </line>
    <text x="54" y="130" text-anchor="middle" font-weight="bold" fill="var(--c2)">SO(2) = U(1)</text>
    <text x="54" y="143" text-anchor="middle" fill="var(--muted)">the circle, 1 dimension</text>
    <text x="54" y="156" text-anchor="middle" fill="var(--muted)">one dial: the angle</text>
  </g>

  <g>
    <circle cx="160" cy="78" r="36" fill="var(--c4)" fill-opacity="0.10" stroke="var(--c4)" stroke-width="2.4"/>
    <ellipse cx="160" cy="78" rx="36" ry="12" fill="none" stroke="var(--c4)" stroke-width="0.9" opacity="0.6"/>
    <ellipse cx="160" cy="78" rx="12" ry="36" fill="none" stroke="var(--c4)" stroke-width="0.9" opacity="0.6"/>
    <circle cx="160" cy="42" r="4" fill="var(--c4)"/><text x="167" y="40" fill="var(--c4)">U</text>
    <circle cx="160" cy="114" r="4" fill="var(--c5)"/><text x="167" y="120" fill="var(--c5)">−U</text>
    <text x="160" y="130" text-anchor="middle" font-weight="bold" fill="var(--c4)">SU(2) = S³</text>
    <text x="160" y="143" text-anchor="middle" fill="var(--muted)">the 3-sphere, 3 dimensions</text>
    <text x="160" y="156" text-anchor="middle" fill="var(--muted)">|α|² + |β|² = 1</text>
  </g>

  <g>
    <circle cx="266" cy="78" r="36" fill="var(--c1)" fill-opacity="0.10" stroke="var(--c1)" stroke-width="2.4" stroke-dasharray="5 3"/>
    <line x1="266" y1="78" x2="266" y2="42" stroke="var(--c1)" stroke-width="1.6"/>
    <circle cx="266" cy="42" r="4" fill="var(--c1)"/>
    <circle cx="266" cy="114" r="4" fill="var(--c1)"/>
    <path d="M 274 44 A 46 46 0 0 1 274 112" fill="none" stroke="var(--c3)" stroke-width="1.2" stroke-dasharray="3 2"/>
    <text x="292" y="80" font-size="8.5" fill="var(--c3)">glued</text>
    <text x="266" y="130" text-anchor="middle" font-weight="bold" fill="var(--c1)">SO(3) = ℝP³</text>
    <text x="266" y="143" text-anchor="middle" fill="var(--muted)">ball of radius π, 3 dimensions</text>
    <text x="266" y="156" text-anchor="middle" fill="var(--muted)">opposite surface points = same</text>
  </g>

  <text x="160" y="178" text-anchor="middle" font-size="9.5" fill="var(--fg)">A point of the shape = an element of the group. Moving on the shape = changing the symmetry smoothly.</text>
  <text x="160" y="192" text-anchor="middle" font-size="9" fill="var(--muted)">SU(2) and SO(3) are both 3-dimensional — and SU(2) wraps twice around SO(3).</text>
</svg>`;

export default {
  cards: [
    {
      kind: 'explain',
      title: 'Symmetry with a dial',
      body: String.raw`A square has 8 symmetries: you can list them. A **circle** has infinitely many — one for every angle $\theta$, and they come with a *dial* you can turn continuously. There is no "smallest" rotation.

That continuity is the whole point. Because the symmetries form a smooth family, you can **differentiate** them: ask what happens for a tiny $\theta$, and then rebuild every finite rotation by repeating the tiny one. Groups that work this way are **Lie groups** (after Sophus Lie, 1842–1899, pronounced "Lee").

They are everywhere: rotations of a molecule, phase shifts of a quantum state, Lorentz transformations of spacetime, and the symmetry layers of equivariant neural networks.`,
    },
    {
      kind: 'recall',
      title: 'Groups, in one card',
      points: [
        String.raw`A **group** is a set with an operation that is closed and associative, has an identity $e$, and gives every element an inverse.`,
        String.raw`$GL_n(\mathbb{R})$ — invertible $n \times n$ real matrices under matrix multiplication — is a group.`,
        String.raw`Groups need not be commutative: usually $AB \ne BA$ for matrices.`,
        String.raw`A **subgroup** is a subset that is itself a group under the same operation.`,
      ],
      link: 'math/groups-intro',
    },
    {
      kind: 'explain',
      title: 'What a matrix Lie group is',
      body: String.raw`We will only need groups made of matrices, which keeps everything concrete.

> A **matrix Lie group** is a subgroup $G \subseteq GL_n(\mathbb{C})$ that is **closed**: if a sequence $A_1, A_2, \dots$ of elements of $G$ converges to a matrix $A$, then either $A \in G$, or $A$ is not invertible.

"Closed" is doing real work. It rules out ragged subgroups such as the invertible matrices with only rational entries: those fill up $GL_n(\mathbb{R})$ densely without ever being a smooth surface. A theorem of Élie Cartan says every closed subgroup of $GL_n(\mathbb{C})$ is automatically a smooth [manifold](@math/manifolds-intro) — a space that looks like flat $\mathbb{R}^d$ near each of its points — on which multiplication and inversion are smooth maps.

So: **a Lie group is a group that is also a smooth shape, with the group operations smooth.**`,
    },
    {
      kind: 'widget',
      title: 'SO(2): the group you can dial',
      body: String.raw`The rotations of the plane,
$$R(\theta) = \begin{pmatrix}\cos\theta & -\sin\theta\\ \sin\theta & \cos\theta\end{pmatrix},$$
form the group $SO(2)$. Turning the dial $t$ slides you continuously along the group, and $R(s)R(t) = R(s+t)$ — a smooth path *through* the group.

Press **rotation** and drag $t$. The other buttons are other one-dial families inside $GL_2(\mathbb{R})$: hyperbolic "boosts", shears, dilations and spirals. Each is a **one-parameter subgroup**, and each is generated by a single matrix $X$ via $\exp(tX)$ — the subject of the [next lesson](@math/matrix-exponential).`,
      widget: { type: 'MathOneParamFlow', props: { gen: 'rotation', tMax: 3.2 } },
    },
    {
      kind: 'mcq',
      prompt: 'Which of these sets of real 2×2 matrices is a matrix Lie group?',
      choices: [
        String.raw`$\{A : \det A = 1\}$`,
        String.raw`$\{A : \det A = 2\}$`,
        String.raw`$\{A : \det A = 0\}$`,
        String.raw`$\{A : \det A \ne 0 \text{ and every entry of } A \text{ is rational}\}$`,
      ],
      answer: 0,
      why: String.raw`$\det A = 1$ gives $SL_2(\mathbb{R})$: products and inverses keep $\det = 1$, and the condition is a closed one. Requiring $\det A = 2$ fails at once — the identity has determinant 1, and two such matrices multiply to determinant 4. Matrices with $\det A = 0$ have no inverses. The rational invertible matrices do form a subgroup, but they are dense in $GL_2(\mathbb{R})$ and not closed, so they are not a Lie group.`,
    },
    {
      kind: 'explain',
      title: 'The classical families',
      body: String.raw`Almost every Lie group you will meet is one of these, defined by preserving something.

- $GL_n(\mathbb{R})$, $GL_n(\mathbb{C})$ — **general linear**: all invertible matrices, $\det A \ne 0$. Preserves nothing but invertibility.
- $SL_n$ — **special linear**: $\det A = 1$. Preserves volume *and* orientation.
- $O(n)$ — **orthogonal**: $A^{\mathsf T}A = I$. Preserves lengths and angles in $\mathbb{R}^n$. $SO(n)$ adds $\det A = 1$: rotations without reflections.
- $U(n)$ — **unitary**: $A^{*}A = I$, where $A^{*}$ is the conjugate transpose. Preserves the complex inner product; $SU(n)$ adds $\det A = 1$.
- $Sp(2n,\mathbb{R})$ — **symplectic**: $A^{\mathsf T}\Omega A = \Omega$ for the standard skew form $\Omega$. Preserves the area form of phase space, so it is the symmetry group of [Hamiltonian mechanics](@physics/hamiltonian-mechanics).

$U(1) = \{e^{i\theta}\}$, the unit complex numbers, is the smallest interesting one — and it is the same group as $SO(2)$.`,
    },
    {
      kind: 'match',
      prompt: 'Match each classical group to the condition that defines it.',
      pairs: [
        [String.raw`$GL_n(\mathbb{R})$`, String.raw`$\det A \ne 0$`],
        [String.raw`$SL_n(\mathbb{R})$`, String.raw`$\det A = 1$`],
        [String.raw`$O(n)$`, String.raw`$A^{\mathsf T}A = I$`],
        [String.raw`$U(n)$`, String.raw`$A^{*}A = I$ (conjugate transpose)`],
        [String.raw`$Sp(2n,\mathbb{R})$`, String.raw`$A^{\mathsf T}\Omega A = \Omega$`],
      ],
      why: String.raw`Each group is "the transformations that leave some structure alone": nothing but invertibility for $GL$, signed volume for $SL$, the real dot product for $O$, the complex inner product for $U$, and the skew form $\Omega$ of phase space for $Sp$. Note $SO(n) \subset O(n)$ and $SU(n) \subset U(n)$ add the extra condition $\det A = 1$.`,
    },
    {
      kind: 'explain',
      title: 'Counting dimensions',
      body: String.raw`The **dimension** of a Lie group is the number of independent dials — the dimension of the manifold, not the size of the matrices. Count free parameters, then subtract the constraints.

- $GL_n(\mathbb{R})$: $n^2$ entries, no equations. Dimension $n^2$.
- $SL_n(\mathbb{R})$: one equation $\det A = 1$. Dimension $n^2 - 1$.
- $O(n)$ and $SO(n)$: $A^{\mathsf T}A = I$ is a *symmetric* matrix equation, so $n(n+1)/2$ independent equations. Dimension $n^2 - n(n+1)/2 = n(n-1)/2$.
- $U(n)$: $A^{*}A = I$ is Hermitian, $n^2$ real equations out of $2n^2$ real parameters. Dimension $n^2$. And $SU(n)$: $n^2 - 1$.

Check: $SO(3)$ has dimension $3\cdot 2/2 = 3$ — pitch, roll and yaw. $SU(2)$ has dimension $2^2 - 1 = 3$ too. That coincidence is not a coincidence; it is the subject of [SO(3) and SU(2)](@math/so3-su2).`,
    },
    {
      kind: 'numeric',
      prompt: String.raw`What is the dimension of $SU(3)$, the symmetry group behind the strong nuclear force?`,
      answer: 8,
      why: String.raw`$\dim SU(n) = n^2 - 1 = 9 - 1 = 8$. (Those 8 dials correspond to the 8 gluons.) A common slip is to answer 9, the dimension of $U(3)$ — the extra condition $\det A = 1$ removes exactly one.`,
    },
    {
      kind: 'widget',
      title: 'A group you can hold',
      body: String.raw`Because a Lie group is a manifold, it *has a shape*, and the shape matters.

$SU(2)$ consists of the matrices $\begin{pmatrix}\alpha & -\bar\beta\\ \beta & \bar\alpha\end{pmatrix}$ with $|\alpha|^2 + |\beta|^2 = 1$. Writing $\alpha, \beta$ in real and imaginary parts, that equation says: four real numbers whose squares sum to 1 — the **3-sphere** $S^3$ living in $\mathbb{R}^4$.

$SO(3)$ is the solid ball of radius $\pi$ (a rotation = axis direction × angle), with opposite points of the boundary sphere glued, because turning by $+\pi$ and $-\pi$ about the same axis give the same rotation. That glued ball is called $\mathbb{R}P^3$.`,
      widget: { type: 'SvgDiagram', props: { svg: shapesSvg } },
    },
    {
      kind: 'truefalse',
      prompt: String.raw`$O(2)$, the group of all $2\times2$ orthogonal matrices, is connected: you can move continuously inside it from any element to any other.`,
      answer: false,
      why: String.raw`Taking determinants of $A^{\mathsf T}A = I$ gives $(\det A)^2 = 1$, so $\det A = \pm 1$. The determinant is continuous and never $0$ on $O(2)$, so no path can carry you from a rotation ($\det = +1$) to a reflection ($\det = -1$). $O(2)$ has two separate pieces; $SO(2)$ is one of them, and it *is* connected.`,
    },
    {
      kind: 'explain',
      title: 'Compact? Connected?',
      body: String.raw`Two shape questions decide much of a Lie group's behaviour.

**Compact** means closed and bounded — the group does not run off to infinity. $O(n)$, $SO(n)$, $U(n)$, $SU(n)$ are compact: every entry of an orthogonal or unitary matrix has absolute value $\le 1$. $GL_n(\mathbb{R})$, $SL_n(\mathbb{R})$ and the Lorentz group are **not**: you can stretch without limit. Compactness is why rotation groups have tidy [representation theory](@math/representations-intro): every finite-dimensional representation can be made unitary and splits into irreducibles. The Lorentz group has no nontrivial finite-dimensional unitary representations.

**Connected** means in one piece. $SO(n)$, $U(n)$, $SU(n)$ and $GL_n(\mathbb{C})$ are connected; $O(n)$ and $GL_n(\mathbb{R})$ have two components each, split by the sign of the determinant.`,
    },
    {
      kind: 'multi',
      prompt: 'Which of these Lie groups are compact?',
      choices: [
        String.raw`$O(3)$`,
        String.raw`$SU(2)$`,
        String.raw`$SL_2(\mathbb{R})$`,
        String.raw`$U(1)$`,
        String.raw`$GL_2(\mathbb{R})$`,
      ],
      answers: [0, 1, 3],
      why: String.raw`Orthogonal and unitary matrices have entries bounded by 1 and are cut out by closed equations, so $O(3)$, $SU(2)$ and $U(1)$ (the unit circle) are compact. In $SL_2(\mathbb{R})$ the matrices $\operatorname{diag}(t, 1/t)$ run off to infinity while keeping $\det = 1$, so it is unbounded; $GL_2(\mathbb{R})$ contains those too, and in addition its elements can creep arbitrarily close to non-invertible matrices.`,
    },
    {
      kind: 'fill',
      prompt: String.raw`A matrix Lie group is a ___ subgroup of $GL_n(\mathbb{C})$. The real matrices with $A^{\mathsf T}A = I$ form the group ___, whose dimension is ___.`,
      bank: ['closed', 'open', 'finite', '$O(n)$', '$U(n)$', '$n(n-1)/2$', '$n^2$'],
      answer: ['closed', '$O(n)$', '$n(n-1)/2$'],
      why: String.raw`Closedness is what makes the subgroup a smooth manifold (Cartan). $A^{\mathsf T}A = I$ with real entries defines the orthogonal group $O(n)$; the condition is symmetric, imposing $n(n+1)/2$ equations on $n^2$ entries and leaving $n(n-1)/2$ dimensions. $U(n)$ needs complex entries, and $n^2$ is the dimension of $GL_n(\mathbb{R})$ or $U(n)$, not of $O(n)$.`,
    },
    {
      kind: 'explain',
      title: 'Why "smooth" changes everything',
      body: String.raw`Here is the payoff of adding calculus to group theory.

Take any smooth path $A(t)$ inside $G$ with $A(0) = I$, and differentiate: $X = A'(0)$ is a *velocity at the identity*. The set of all such velocities is the [tangent space](@math/tangent-spaces) at $I$ — a plain **vector space** you can do linear algebra in. It is called the **Lie algebra** $\mathfrak{g}$.

That is a spectacular simplification: a curved, non-commutative group gets replaced by a flat vector space. Almost nothing is lost, because the exponential map sends the algebra back onto (a neighbourhood of the identity in) the group. The rest of this unit works out that dictionary.`,
    },
    {
      kind: 'order',
      prompt: String.raw`Put the reasoning in order: why is $SO(n)$ a compact, connected Lie group of dimension $n(n-1)/2$?`,
      steps: [
        String.raw`$SO(n) = \{A \in GL_n(\mathbb{R}) : A^{\mathsf T}A = I,\ \det A = 1\}$ is a subgroup, since products and inverses of such matrices satisfy the same two conditions.`,
        String.raw`The conditions are equations between continuous functions of the entries, so the subgroup is closed — hence a matrix Lie group, hence a smooth manifold.`,
        String.raw`$A^{\mathsf T}A = I$ forces every column to be a unit vector, so all entries lie in $[-1,1]$: the group is bounded, and being closed and bounded it is compact.`,
        String.raw`$A^{\mathsf T}A = I$ is a symmetric matrix equation, so it imposes $n(n+1)/2$ independent conditions on the $n^2$ entries, leaving dimension $n^2 - n(n+1)/2 = n(n-1)/2$.`,
      ],
      why: String.raw`You first check it is a group, then that it is closed (which buys you the manifold structure for free), then read off compactness from boundedness and the dimension from counting equations. Reversing the first two steps would mean talking about the dimension of something not yet known to be a manifold.`,
    },
    {
      kind: 'explain',
      title: 'Key takeaways',
      body: String.raw`- A **Lie group** is a group that is also a smooth manifold, with smooth multiplication and inversion. A **matrix Lie group** is a *closed* subgroup of $GL_n(\mathbb{C})$ — closedness is what makes it smooth.
- The classical families are defined by what they preserve: $GL$ (nothing), $SL$ (volume), $O/SO$ (lengths), $U/SU$ (complex inner product), $Sp$ (the symplectic form).
- Dimensions: $\dim GL_n(\mathbb{R}) = n^2$, $\dim SL_n = n^2-1$, $\dim O(n) = \dim SO(n) = n(n-1)/2$, $\dim U(n) = n^2$, $\dim SU(n) = n^2-1$.
- The group *has a shape*: $SO(2)$ is a circle, $SU(2)$ is the 3-sphere, $SO(3)$ is $\mathbb{R}P^3$. $O(n)$ and $GL_n(\mathbb{R})$ come in two pieces; orthogonal and unitary groups are compact.
- Differentiating a path at the identity gives a vector space, the **Lie algebra** — the flat shadow of the curved group.

Next: the machine that turns an infinitesimal motion into a finite one — [the matrix exponential](@math/matrix-exponential).`,
    },
  ],
  references: [
    { authors: 'B. C. Hall', title: 'Lie Groups, Lie Algebras, and Representations: An Elementary Introduction', year: 2015, venue: '2nd ed., Springer GTM 222', detail: 'Ch. 1 (matrix Lie groups: definitions, the classical groups, compactness and connectedness)' },
    { authors: 'J. Stillwell', title: 'Naive Lie Theory', year: 2008, venue: 'Springer UTM', detail: 'Ch. 2–3 (groups, generalised rotation groups)' },
    { authors: 'J. M. Lee', title: 'Introduction to Smooth Manifolds', year: 2013, venue: '2nd ed., Springer GTM 218', detail: 'Ch. 7 (Lie groups) and Ch. 20 (the closed subgroup theorem)' },
    { authors: 'M. Artin', title: 'Algebra', year: 2011, venue: '2nd ed., Pearson', detail: 'Ch. 9 (linear groups)' },
  ],
} satisfies LessonContent;
