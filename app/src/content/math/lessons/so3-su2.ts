import type { LessonContent } from '../../types';

// S³ double-covering ℝP³: antipodal points of the sphere are glued, so a loop that joins
// antipodes is a CLOSED loop downstairs but an OPEN path upstairs.
const coverSvg = String.raw`<svg viewBox="0 0 320 212" xmlns="http://www.w3.org/2000/svg" font-size="9" font-family="inherit">
  <text x="160" y="13" text-anchor="middle" font-size="10.5" font-weight="bold" fill="var(--fg)">upstairs: SU(2) = S³ — downstairs: SO(3) = ℝP³</text>

  <!-- upstairs sphere -->
  <circle cx="86" cy="72" r="46" fill="var(--c2)" fill-opacity="0.10" stroke="var(--c2)" stroke-width="1.6"/>
  <ellipse cx="86" cy="72" rx="46" ry="15" fill="none" stroke="var(--c2)" stroke-width="0.8" stroke-dasharray="3 3"/>
  <circle cx="86" cy="26" r="3.6" fill="var(--c1)"/>
  <circle cx="86" cy="118" r="3.6" fill="var(--c5)"/>
  <text x="94" y="25" fill="var(--c1)">U</text>
  <text x="94" y="124" fill="var(--c5)">−U</text>
  <path d="M 86 26 C 128 44, 128 100, 86 118" fill="none" stroke="var(--c4)" stroke-width="2.2"/>
  <text x="132" y="76" fill="var(--c4)">path, not a loop</text>

  <!-- arrow down -->
  <line x1="86" y1="130" x2="86" y2="152" stroke="var(--muted)" stroke-width="1.4"/>
  <polygon points="86,158 82,148 90,148" fill="var(--muted)"/>
  <text x="96" y="148" fill="var(--muted)">Φ: U ↦ R, 2-to-1</text>

  <!-- downstairs: both marked points land on one -->
  <circle cx="86" cy="180" r="4.6" fill="var(--c3)"/>
  <text x="96" y="184" fill="var(--c3)">R = Φ(U) = Φ(−U)</text>
  <ellipse cx="86" cy="180" rx="30" ry="11" fill="none" stroke="var(--c4)" stroke-width="2"/>
  <text x="18" y="203" fill="var(--muted)">the 360° loop in SO(3) closes up…</text>

  <!-- right panel: the two kinds of loop -->
  <line x1="196" y1="22" x2="196" y2="196" stroke="var(--grid)" stroke-width="1"/>
  <text x="206" y="34" font-weight="bold" fill="var(--fg)">loops in SO(3)</text>
  <circle cx="258" cy="76" r="30" fill="none" stroke="var(--c4)" stroke-width="2.4"/>
  <text x="206" y="118" fill="var(--c4)">turn by 360°: cannot</text>
  <text x="206" y="129" fill="var(--c4)">be shrunk to a point</text>
  <circle cx="258" cy="162" r="26" fill="none" stroke="var(--c1)" stroke-width="2.2"/>
  <circle cx="258" cy="162" r="18" fill="none" stroke="var(--c1)" stroke-width="2.2"/>
  <text x="206" y="200" fill="var(--c1)">720°: shrinks away</text>
</svg>`;

export default {
  cards: [
    {
      kind: 'explain',
      title: 'Turn it round once — and something is different',
      body: String.raw`Hold a mug of coffee flat on your palm and rotate your arm a full turn without spilling it. The mug is back where it started, but your arm is twisted. Turn it a *second* full time in the same direction and the twist unwinds: you are genuinely back where you began.

Something in the world distinguishes **one** full turn from **two**, even though a rotation by $360°$ is the identity rotation. This lesson makes that precise. The space of rotations, $SO(3)$, is not simply connected, and the group that fixes the problem — its **double cover** $SU(2)$ — is what the electron actually responds to.

From [Lie groups](@math/lie-groups-intro) you already know the two players as *shapes*: $SO(3) = \{R : R^{\mathsf T}R = I, \det R = 1\}$ is $\mathbb{R}P^3$, the solid ball of radius $\pi$ with antipodal boundary points glued; and $SU(2) = \left\{\begin{pmatrix}\alpha & -\bar\beta\\ \beta & \bar\alpha\end{pmatrix} : |\alpha|^2+|\beta|^2 = 1\right\}$ is the 3-sphere $S^3$. Same dimension $3$, same Lie algebra, different global shape. Everything interesting lives in that gap.`,
    },
    {
      kind: 'explain',
      title: 'Building the map: Pauli matrices as a copy of ℝ³',
      body: String.raw`Here is the construction that links them. Use the **Pauli matrices**
$$\sigma_1 = \begin{pmatrix}0&1\\1&0\end{pmatrix},\quad
\sigma_2 = \begin{pmatrix}0&-i\\ i&0\end{pmatrix},\quad
\sigma_3 = \begin{pmatrix}1&0\\0&-1\end{pmatrix},$$
and send a vector $\mathbf x = (x_1,x_2,x_3) \in \mathbb R^3$ to the matrix
$$X = x_1\sigma_1 + x_2\sigma_2 + x_3\sigma_3 = \begin{pmatrix} x_3 & x_1 - ix_2\\ x_1 + ix_2 & -x_3\end{pmatrix}.$$

This is a bijection between $\mathbb R^3$ and the real vector space $V$ of **traceless Hermitian** $2\times2$ matrices. And it converts length into determinant:
$$\det X = -x_3^2 - (x_1^2 + x_2^2) = -\|\mathbf x\|^2 .$$

So "preserve the length of $\mathbf x$" becomes "preserve $\det X$" — a condition matrices are good at.`,
    },
    {
      kind: 'explain',
      title: 'The homomorphism Φ : SU(2) → SO(3)',
      body: String.raw`Given $U \in SU(2)$, define its action on $V$ by **conjugation**:
$$X \;\longmapsto\; U X U^{*}.$$

Three checks, each one line:

1. $(UXU^{*})^{*} = UX^{*}U^{*} = UXU^{*}$ and $\operatorname{tr}(UXU^{*}) = \operatorname{tr}X = 0$, so the result is still in $V$. Conjugation is a linear map $V \to V$, i.e. a real $3\times3$ matrix $\Phi(U)$.
2. $\det(UXU^{*}) = \det U \cdot \det X \cdot \det U^{*} = \det X$, so $\|\mathbf x\|$ is preserved: $\Phi(U) \in O(3)$.
3. $SU(2)$ is connected and $\Phi$ is continuous with $\Phi(I) = I$, so $\det\Phi(U)$ cannot jump from $+1$ to $-1$: $\Phi(U) \in SO(3)$.

And $\Phi(UV) = \Phi(U)\Phi(V)$, because conjugating twice is conjugating by the product. So $\Phi$ is a Lie group **homomorphism**.`,
    },
    {
      kind: 'explain',
      title: 'Kernel ±I, and onto',
      body: String.raw`**Which $U$ act trivially?** $\Phi(U) = I$ means $UXU^{*} = X$, i.e. $UX = XU$, for every traceless Hermitian $X$ — in particular for all three Pauli matrices, which span $M_2(\mathbb C)$ over $\mathbb C$ together with $I$. A matrix commuting with everything is a scalar, $U = \lambda I$, and $\det U = \lambda^2 = 1$ forces $\lambda = \pm1$. Hence
$$\ker\Phi = \{I, -I\} \cong \mathbb Z/2 .$$

**Is it onto?** Yes. The image is a subgroup containing a neighbourhood of the identity (the derivative $d\Phi$ is an isomorphism $\mathfrak{su}(2) \to \mathfrak{so}(3)$), and a subgroup of a connected group containing a neighbourhood of $I$ is the whole group.

By the first isomorphism theorem for Lie groups, using [quotients](@math/normal-subgroups-quotients),
$$SO(3) \;\cong\; SU(2)/\{\pm I\}.$$
Exactly **two** elements of $SU(2)$, namely $U$ and $-U$, sit above each rotation. That is what "**double cover**" means.`,
    },
    {
      kind: 'mcq',
      prompt: String.raw`What is the kernel of $\Phi : SU(2) \to SO(3)$, $\Phi(U)\mathbf x \leftrightarrow UXU^{*}$?`,
      choices: [
        String.raw`$\{I, -I\}$`,
        String.raw`$\{I\}$ — the map is injective`,
        String.raw`the diagonal matrices in $SU(2)$, a circle`,
        String.raw`all of $SU(2)$ — conjugation never changes $\mathbf x$`,
      ],
      answer: 0,
      why: String.raw`Conjugation by $U$ and by $-U$ give the same map, since the two minus signs cancel: $(-U)X(-U)^{*} = UXU^{*}$. So the map cannot be injective. Conversely a $U$ acting trivially commutes with all three Pauli matrices and so is a scalar $\lambda I$ with $\lambda^2 = \det U = 1$. The diagonal circle $\operatorname{diag}(e^{i\theta}, e^{-i\theta})$ does act non-trivially — it produces exactly the rotations about the $x_3$-axis.`,
    },
    {
      kind: 'explain',
      title: 'The half-angle formula',
      body: String.raw`Make the covering completely explicit. Let $\hat{\mathbf n}$ be a unit vector and write $\hat{\mathbf n}\cdot\boldsymbol\sigma = n_1\sigma_1 + n_2\sigma_2 + n_3\sigma_3$. A one-line computation gives $(\hat{\mathbf n}\cdot\boldsymbol\sigma)^2 = I$, so the exponential series splits into cosine and sine exactly as $e^{i\theta}$ does:
$$U(\theta,\hat{\mathbf n}) \;=\; \exp\!\Big(\!-\tfrac{i\theta}{2}\,\hat{\mathbf n}\cdot\boldsymbol\sigma\Big) \;=\; \cos\tfrac{\theta}{2}\,I \;-\; i\sin\tfrac{\theta}{2}\,(\hat{\mathbf n}\cdot\boldsymbol\sigma).$$

$\Phi$ sends this to the rotation by angle $\theta$ about the axis $\hat{\mathbf n}$. Look at the **half-angles**:

- $\theta = 0$: $U = I$.
- $\theta = 2\pi$ (one full turn): $\cos\pi = -1$, $\sin\pi = 0$, so $U = -I$. The rotation is the identity, the $SU(2)$ element is **not**.
- $\theta = 4\pi$ (two full turns): $U = +I$ at last.

This is the mug on your palm, in two lines of algebra.`,
    },
    {
      kind: 'widget',
      title: 'Watch the two dials run at different speeds',
      body: String.raw`The left dial carries an object through a rotation $R(\theta) \in SO(3)$. The right dial shows the phase of $U(\theta) = \exp(-i\theta\sigma_3/2) = \operatorname{diag}(e^{-i\theta/2}, e^{i\theta/2})$, the element of $SU(2)$ above it.

The right dial turns at **half** the rate. At $\theta = 360°$ the object is home but the $SU(2)$ element has reached $-I$; only at $\theta = 720°$ do both return. Two elements $\pm U$ sitting over one rotation, seen as one revolution of difference.`,
      widget: { type: 'MathDoubleCover', props: { theta: 0, speed: 90 }, caption: String.raw`Stop the animation at $360°$ and compare the two "returned to start" markers on the track.` },
    },
    {
      kind: 'numeric',
      prompt: String.raw`A rotation by $\theta = 120°$ about an axis $\hat{\mathbf n}$ lifts to $U = \cos\frac{\theta}{2}I - i\sin\frac{\theta}{2}(\hat{\mathbf n}\cdot\boldsymbol\sigma)$. What is the coefficient $\cos(\theta/2)$ of the identity? Give 3 decimal places.`,
      answer: 0.5,
      tolerance: 0.002,
      why: String.raw`Half of $120°$ is $60°$, and $\cos 60° = 1/2$. The common slip is to use the full angle and write $\cos 120° = -1/2$ — but every $SU(2)$ formula runs on half-angles, which is precisely why one full turn ($\theta = 360°$, half-angle $180°$) lands on $-I$ rather than $I$.`,
    },
    {
      kind: 'explain',
      title: 'The same Lie algebra, seen twice',
      body: String.raw`Differentiating $\Phi$ at the identity gives a Lie algebra isomorphism $d\Phi : \mathfrak{su}(2) \to \mathfrak{so}(3)$. Concretely, put
$$E_k = -\tfrac{i}{2}\sigma_k \in \mathfrak{su}(2) \qquad (k = 1,2,3),$$
which are anti-Hermitian and traceless, as $\mathfrak{su}(2)$ requires. Their brackets are
$$[E_1,E_2] = E_3,\qquad [E_2,E_3] = E_1,\qquad [E_3,E_1] = E_2,$$
identical to the brackets $[L_i,L_j] = \varepsilon_{ijk}L_k$ of the rotation generators $L_k \in \mathfrak{so}(3)$.

> $\mathfrak{su}(2) \cong \mathfrak{so}(3)$ as Lie algebras, but $SU(2) \not\cong SO(3)$ as groups.

That is the sharpest illustration of the slogan from the last lesson: the Lie algebra sees the group **only near the identity**. The factor of $\tfrac12$ in $E_k = -\tfrac i2\sigma_k$ is where the half-angle comes from.`,
    },
    {
      kind: 'truefalse',
      prompt: String.raw`Because $\mathfrak{su}(2)$ and $\mathfrak{so}(3)$ are isomorphic Lie algebras, the groups $SU(2)$ and $SO(3)$ are isomorphic.`,
      answer: false,
      why: String.raw`Isomorphic algebras only force the groups to be **locally** isomorphic — identical in a neighbourhood of the identity. Globally they differ: $SU(2) \cong S^3$ is simply connected while $SO(3) \cong \mathbb{R}P^3$ is not, and $SO(3) \cong SU(2)/\{\pm I\}$ is a genuine 2-to-1 quotient. A topological invariant such as the fundamental group can tell them apart even though no derivative can.`,
    },
    {
      kind: 'widget',
      title: 'Why the 360° loop cannot be shrunk',
      body: String.raw`Take the path in $SU(2)$ from $I$ to $-I$ given by $\theta$ running from $0$ to $2\pi$. Downstairs in $SO(3)$ it is a **closed loop** (you end at the identity rotation). Upstairs it is an open path between two *different* points, and no continuous deformation of the loop can change which endpoint it lifts to.

That is the proof that the $360°$ loop is not contractible: $\pi_1(SO(3)) = \mathbb Z/2$. Run the same path twice and it lifts to a loop upstairs — which, $S^3$ being simply connected, contracts. Hence $720°$ is trivial and $360°$ is not, and $\mathbb{Z}/2$ (not $\mathbb Z$) is the right answer: there are only ever two classes.`,
      widget: { type: 'SvgDiagram', props: { svg: coverSvg }, caption: String.raw`The [fundamental group](@math/fundamental-group) of a space counts exactly this: loops up to continuous deformation.` },
    },
    {
      kind: 'explain',
      title: 'Universal cover: the canonical representative',
      body: String.raw`Among all connected Lie groups sharing one Lie algebra, there is exactly one that is **simply connected** — the *universal cover* — and every other is a quotient of it by a discrete central subgroup.

For $\mathfrak{su}(2) \cong \mathfrak{so}(3)$ the universal cover is $SU(2)$, and the only quotients are $SU(2)$ itself and $SU(2)/\{\pm I\} = SO(3)$. So the complete list of connected groups with this algebra is two items long.

Two reasons to care:

- **Representations.** Every representation of the Lie algebra integrates to a representation of the *simply connected* group, and only some of them descend to $SO(3)$. That split is the whole content of the next lesson.
- **Computation.** Unit quaternions are $SU(2)$ in disguise ($\alpha = a + bi$, $\beta = c + di$ with $a^2+b^2+c^2+d^2 = 1$). Graphics and robotics interpolate rotations as quaternions precisely because $S^3$ is a nicer space to move around in than $\mathbb{R}P^3$ — at the cost of remembering that $q$ and $-q$ mean the same rotation.`,
    },
    {
      kind: 'order',
      prompt: String.raw`Arrange the construction of the double cover $SU(2) \to SO(3)$.`,
      steps: [
        String.raw`Identify $\mathbb R^3$ with $V$, the traceless Hermitian $2\times2$ matrices, via $\mathbf x \mapsto X = \mathbf x \cdot \boldsymbol\sigma$; note $\det X = -\|\mathbf x\|^2$.`,
        String.raw`For $U \in SU(2)$ let $\Phi(U)$ be the map $X \mapsto UXU^{*}$; check it sends $V$ into $V$ and is linear, so it is a real $3\times3$ matrix.`,
        String.raw`Determinants are unchanged, so $\Phi(U)$ preserves $\|\mathbf x\|$ and lies in $O(3)$; connectedness of $SU(2)$ upgrades this to $SO(3)$.`,
        String.raw`$\Phi$ is a homomorphism, and its kernel is the set of $U$ commuting with every Pauli matrix, namely $\{\pm I\}$.`,
        String.raw`$\Phi$ is onto because its image is a subgroup containing a neighbourhood of $I$ in the connected group $SO(3)$; therefore $SO(3) \cong SU(2)/\{\pm I\}$.`,
      ],
      why: String.raw`The order is forced: you need the model of $\mathbb R^3$ before you can say what $\Phi(U)$ *is*, you need $\Phi(U) \in SO(3)$ before calling $\Phi$ a map into $SO(3)$, and the kernel and surjectivity are what the isomorphism theorem needs as input. Computing the kernel first would be describing the fibres of a map not yet known to land in the right place.`,
    },
    {
      kind: 'explain',
      title: 'Spin: where this stops being a curiosity',
      body: String.raw`Quantum mechanics only cares about a state up to an overall phase, so a symmetry group may act by a **projective** representation — $\pi(g)\pi(h) = c(g,h)\,\pi(gh)$ for some phase $c$. For $SO(3)$ the possible phases are exactly the $\pm1$ of the double cover, so "projective representations of $SO(3)$" = "honest representations of $SU(2)$".

Nature uses both kinds. Particles whose states return to themselves after $360°$ are **bosons** with integer spin; particles whose states pick up a factor $-1$ are **fermions** with half-integer [spin](@quantum/spin) — electrons, protons, neutrons. The minus sign is not a bookkeeping convention: it is measurable.

> In 1975 two groups passed a beam of neutrons through a magnetic field that rotated their spins by $2\pi$ and interfered the beam with an unrotated one. The interference pattern inverted, confirming the sign change, and returned to normal only after $4\pi$.

The spin–statistics theorem of relativistic quantum field theory links half-integer spin to antisymmetric multi-particle wavefunctions, hence the Pauli exclusion principle, hence chemistry. (That link is a separate theorem, not a consequence of the $-1$ alone.)`,
    },
    {
      kind: 'match',
      prompt: 'Match each object to the correct description.',
      pairs: [
        [String.raw`$SU(2)$ as a manifold`, String.raw`the 3-sphere $S^3$ — simply connected`],
        [String.raw`$SO(3)$ as a manifold`, String.raw`$\mathbb{R}P^3$ — with $\pi_1 = \mathbb{Z}/2$`],
        [String.raw`$\ker\Phi$`, String.raw`$\{I, -I\}$, the centre of $SU(2)$`],
        [String.raw`$\exp(-i\theta\,\hat{\mathbf n}\cdot\boldsymbol\sigma/2)$ at $\theta = 2\pi$`, String.raw`$-I$, not $I$`],
        [String.raw`$\mathfrak{su}(2)$ and $\mathfrak{so}(3)$`, String.raw`isomorphic as Lie algebras`],
      ],
      why: String.raw`The whole lesson in one table: the two groups agree infinitesimally (isomorphic algebras) and differ globally (different fundamental groups), and the discrepancy is measured by the two-element kernel of the covering map, which is visible as the half-angle in the exponential.`,
    },
    {
      kind: 'fill',
      prompt: String.raw`$SU(2)$ acts on $\mathbb R^3$ by ___ on traceless Hermitian matrices. The map $\Phi$ is 2-to-1 with kernel ___. Consequently $SO(3) \cong SU(2)/\{\pm I\}$, and the exponential contains the angle ___. Because $S^3$ is ___, $SU(2)$ is the universal cover.`,
      bank: ['conjugation', 'multiplication', '$\\{\\pm I\\}$', '$\\{I\\}$', '$\\theta/2$', '$2\\theta$', 'simply connected', 'compact'],
      answer: ['conjugation', '$\\{\\pm I\\}$', '$\\theta/2$', 'simply connected'],
      why: String.raw`Conjugation, not left multiplication, is what preserves the set of traceless Hermitian matrices. The kernel being two elements is the "double" in double cover, and it shows up analytically as the half-angle $\theta/2$, which is why one full turn gives $-I$. $S^3$ is both compact *and* simply connected, but it is simple connectedness — no non-contractible loops — that makes it the universal cover.`,
    },
    {
      kind: 'explain',
      title: 'Key takeaways',
      body: String.raw`- Identify $\mathbb R^3$ with traceless Hermitian $2\times2$ matrices $X = \mathbf x\cdot\boldsymbol\sigma$; then $\det X = -\|\mathbf x\|^2$.
- $U \in SU(2)$ acts by **conjugation** $X \mapsto UXU^{*}$. This gives a surjective homomorphism $\Phi : SU(2)\to SO(3)$ with $\ker\Phi = \{\pm I\}$, so $SO(3) \cong SU(2)/\{\pm I\}$: a **double cover**.
- Explicitly $\exp\!\big(\!-\tfrac{i\theta}{2}\hat{\mathbf n}\cdot\boldsymbol\sigma\big) = \cos\tfrac\theta2 I - i\sin\tfrac\theta2(\hat{\mathbf n}\cdot\boldsymbol\sigma)$ covers the rotation by $\theta$ about $\hat{\mathbf n}$. At $\theta = 2\pi$ it equals $-I$; only $\theta = 4\pi$ returns to $I$.
- $\mathfrak{su}(2) \cong \mathfrak{so}(3)$ (take $E_k = -\tfrac i2\sigma_k$), yet the groups differ: $SU(2) \cong S^3$ is simply connected, $SO(3) \cong \mathbb{R}P^3$ has $\pi_1 = \mathbb Z/2$.
- $SU(2)$ is the **universal cover**: every representation of the algebra integrates on $SU(2)$, and only some descend to $SO(3)$.
- Physically: integer spin $\to$ $SO(3)$ representations (bosons); half-integer spin $\to$ genuinely $SU(2)$ (fermions), with a measurable sign change after one full turn.

Next: which representations exist, and how the half-integers appear — [representations of Lie groups and algebras](@math/lie-representations).`,
    },
  ],
  references: [
    { authors: 'B. C. Hall', title: 'Lie Groups, Lie Algebras, and Representations: An Elementary Introduction', year: 2015, venue: '2nd ed., Springer GTM 222', detail: 'Ch. 1 (SU(2), SO(3) and the covering homomorphism between them); §4.7 (group versus Lie algebra representations)' },
    { authors: 'J. Stillwell', title: 'Naive Lie Theory', year: 2008, venue: 'Springer UTM', detail: 'Ch. 1 (quaternions and rotations), Ch. 2 (the 2-to-1 map from SU(2) to SO(3)), Ch. 8 (simple connectivity and the universal cover)' },
    { authors: 'S. L. Altmann', title: 'Rotations, Quaternions, and Double Groups', year: 1986, venue: 'Oxford University Press (Dover reprint 2005)', detail: 'the half-angle, spinors and the double group' },
    { authors: 'H. Rauch, A. Zeilinger, G. Badurek, A. Wilfing, W. Bauspiess, U. Bonse', title: 'Verification of coherent spinor rotation of fermions', year: 1975, venue: 'Physics Letters A 54(6), 425–427' },
    { authors: 'S. A. Werner, R. Colella, A. W. Overhauser, C. F. Eagen', title: 'Observation of the phase shift of a neutron due to precession in a magnetic field', year: 1975, venue: 'Physical Review Letters 35(16), 1053–1055' },
  ],
} satisfies LessonContent;
