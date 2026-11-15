import type { LessonContent } from '../../types';

export default {
  cards: [
    {
      kind: 'explain',
      title: 'A dial you can turn, a number that will not move',
      body: String.raw`Why is momentum conserved? The honest textbook answer is "because of Newton's third law", which only pushes the question back. The real answer, found by **Emmy Noether** in 1918, is far better:

> Momentum is conserved because space looks the same here as it does one metre to the left.

Every continuous symmetry of a mechanical system produces a quantity that does not change in time, and the recipe that turns one into the other is completely explicit. This lesson states that recipe precisely — including the hypotheses, which are routinely misquoted — and shows how the conserved quantities are labelled by the Lie algebra of the symmetry group.`,
    },
    {
      kind: 'recall',
      title: 'The Lagrangian set-up',
      points: [
        String.raw`A system is described by coordinates $q = (q_1,\dots,q_n)$ and a **Lagrangian** $L(q, \dot q, t)$; for a particle, $L = T - V$ (kinetic minus potential energy).`,
        String.raw`Trajectories are the stationary points of the **action** $S[q] = \int_{t_0}^{t_1} L(q,\dot q,t)\,dt$.`,
        String.raw`Stationarity is equivalent to the **Euler–Lagrange equations** $\dfrac{d}{dt}\dfrac{\partial L}{\partial \dot q_i} = \dfrac{\partial L}{\partial q_i}$ for each $i$.`,
        String.raw`$p_i = \partial L/\partial \dot q_i$ is the **conjugate momentum** to $q_i$. For $L = \tfrac12 m|\dot{\mathbf x}|^2 - V$ it is the ordinary momentum $m\dot x_i$.`,
      ],
      link: 'physics/lagrangian-mechanics',
    },
    {
      kind: 'explain',
      title: 'Warm-up: a coordinate that is missing',
      body: String.raw`Suppose $L$ does not mention $q_k$ at all — only $\dot q_k$. Such a coordinate is called **cyclic** (or ignorable). Then $\partial L/\partial q_k = 0$, so the Euler–Lagrange equation collapses to
$$\frac{d}{dt}\,p_k = \frac{d}{dt}\frac{\partial L}{\partial \dot q_k} = 0 .$$
The conjugate momentum $p_k$ is constant. For a free particle, $L = \tfrac12 m(\dot x^2 + \dot y^2 + \dot z^2)$ mentions no position at all, so all three momenta are conserved.

That is Noether's theorem in the one case where it is obvious: a symmetry that happens to be a *shift of one coordinate*. The theorem's job is to handle symmetries that are not aligned with any coordinate — a rotation, a boost, a phase change — without having to find clever coordinates first.

> Read the conclusion carefully: it is the **momentum** $p_k$ that is frozen, not the coordinate $q_k$. A free particle has $m\dot x$ constant while $x$ runs off to infinity.`,
    },
    {
      kind: 'explain',
      title: 'Noether’s theorem, stated carefully',
      body: String.raw`Let $Q^s$ be a **smooth one-parameter family** of maps of configuration space with $Q^0 = \mathrm{id}$, and write
$$\delta q \;=\; \left.\frac{d}{ds}\right|_{s=0} Q^s(q)$$
for the *infinitesimal* version of the transformation — a vector field on configuration space.

> **Hypothesis (invariance).** For every $s$, and for **all** $(q, \dot q, t)$ — not merely along solutions —
> $$L\big(Q^s(q),\ \tfrac{d}{dt}Q^s(q),\ t\big) \;=\; L(q, \dot q, t).$$
>
> **Conclusion.** Along every solution of the Euler–Lagrange equations the **Noether charge**
> $$I \;=\; \sum_{i=1}^{n} \frac{\partial L}{\partial \dot q_i}\,\delta q_i \;=\; \mathbf p \cdot \delta q$$
> is constant in time.

Four things the statement is quietly insisting on, each of which matters: the family is *continuous* in $s$; invariance is an *identity in all variables*, not a property of one trajectory; it is the **Lagrangian** that is invariant, not the solution; and the conclusion holds **on-shell**, i.e. only for genuine solutions.`,
    },
    {
      kind: 'widget',
      title: 'Break the symmetry and watch the charge drift',
      body: String.raw`A particle in the potential $V = \tfrac12(x^2 + \omega^2 y^2)$ with $\omega = 1 + \varepsilon$. At $\varepsilon = 0$ the potential depends only on $x^2+y^2$: it is invariant under every rotation of the plane, and the angular momentum $L_z = x\dot y - y\dot x$ is flat as a board while the orbit closes into an ellipse.

Turn $\varepsilon$ up and the rotational symmetry is gone. The orbit opens into a Lissajous figure and $L_z$ visibly swings — while the energy stays flat, because the force law still does not depend on the clock. One symmetry broken, one charge lost, the other untouched.`,
      widget: { type: 'MathNoetherOrbit', props: { eps: 0, speed: 1.6 }, caption: String.raw`The drift readout is the point: Noether's charge is conserved *exactly* when the symmetry is exact, and degrades smoothly as it is broken.` },
    },
    {
      kind: 'mcq',
      prompt: String.raw`Which hypothesis does Noether's theorem actually require?`,
      choices: [
        String.raw`$L$ is unchanged by the transformation for all $(q,\dot q,t)$, and the transformation belongs to a smooth one-parameter family.`,
        String.raw`One particular solution of the equations of motion is unchanged by the transformation.`,
        String.raw`$L$ is unchanged by some transformation, continuous or discrete, such as a reflection.`,
        String.raw`$L$ has no explicit dependence on $t$.`,
      ],
      answer: 0,
      why: String.raw`Invariance must be an identity in the variables, because the proof differentiates it in $s$ *before* imposing the equations of motion; a symmetry of one orbit says nothing about the others. Discrete symmetries such as parity give no Noether charge at all — there is no parameter $s$ to differentiate with respect to. And time-independence of $L$ is one particular symmetry (time translation, giving energy), not the general requirement.`,
    },
    {
      kind: 'explain',
      title: 'The proof is two lines',
      body: String.raw`Differentiate the invariance hypothesis with respect to $s$ at $s = 0$ and use the chain rule, then substitute the Euler–Lagrange equations. The whole theorem is the observation that what comes out is a perfect time derivative.`,
      widget: {
        type: 'StepReveal',
        props: {
          steps: [
            String.raw`**Differentiate the hypothesis.** $0 = \left.\dfrac{d}{ds}\right|_{0} L = \displaystyle\sum_i \frac{\partial L}{\partial q_i}\,\delta q_i + \frac{\partial L}{\partial \dot q_i}\,\delta\dot q_i$.`,
            String.raw`**Note that $\delta$ and $d/dt$ commute**: the transformation acts pointwise on the path, so $\delta \dot q_i = \dfrac{d}{dt}\delta q_i$.`,
            String.raw`**Go on-shell.** For a solution, Euler–Lagrange says $\dfrac{\partial L}{\partial q_i} = \dfrac{d}{dt}\dfrac{\partial L}{\partial \dot q_i}$. Substitute it into the first term.`,
            String.raw`**Recognise the product rule.** $0 = \displaystyle\sum_i \left[\frac{d}{dt}\frac{\partial L}{\partial \dot q_i}\right]\delta q_i + \frac{\partial L}{\partial \dot q_i}\frac{d}{dt}\delta q_i = \frac{d}{dt}\sum_i \frac{\partial L}{\partial \dot q_i}\,\delta q_i$.`,
            String.raw`**Conclude.** $\dfrac{dI}{dt} = 0$ with $I = \mathbf p\cdot\delta q$. Every ingredient was used exactly once: the symmetry in step 1, the equations of motion in step 3.`,
          ],
          notes: [
            String.raw`This is where "for all $(q,\dot q)$" is spent — you may only differentiate an identity.`,
            '',
            String.raw`This is where "on-shell" is spent. Off a solution the charge genuinely does drift.`,
            '',
            String.raw`A **quasi-symmetry**, where step 1 gives $dF/dt$ instead of $0$, simply shifts the charge to $I - F$.`,
          ],
        },
      },
    },
    {
      kind: 'order',
      prompt: String.raw`Derive angular momentum. Put the steps in order for $L = \tfrac12 m(\dot x^2 + \dot y^2) - V(\sqrt{x^2+y^2})$.`,
      steps: [
        String.raw`Write the symmetry: $Q^s$ rotates the plane by angle $s$, so $x \mapsto x\cos s - y\sin s$ and $y \mapsto x\sin s + y\cos s$.`,
        String.raw`Check invariance for all $(x,y,\dot x,\dot y)$: a rotation preserves $\dot x^2+\dot y^2$ and preserves $x^2+y^2$, so $L$ is unchanged.`,
        String.raw`Differentiate at $s = 0$ to get the infinitesimal transformation $\delta x = -y$, $\delta y = x$.`,
        String.raw`Compute the momenta $p_x = m\dot x$, $p_y = m\dot y$.`,
        String.raw`Assemble the charge $I = p_x\,\delta x + p_y\,\delta y = m(x\dot y - y\dot x) = L_z$, the angular momentum.`,
      ],
      why: String.raw`The recipe never varies: name the one-parameter family, verify invariance as an identity, differentiate to get $\delta q$, read off the momenta, and contract. Skipping the invariance check is what lets people "derive" conservation laws for potentials like $V(x)$ that are not rotationally symmetric at all — and for those, $L_z$ really is not conserved.`,
    },
    {
      kind: 'explain',
      title: 'The dictionary',
      body: String.raw`Run the recipe on the standard symmetries and you recover the entire list of elementary conservation laws:

| symmetry | $\delta q$ | conserved quantity |
|---|---|---|
| translation along $\hat{\mathbf e}$ | $\hat{\mathbf e}$ | momentum $\mathbf p\cdot\hat{\mathbf e}$ |
| rotation about $\hat{\mathbf n}$ | $\hat{\mathbf n}\times\mathbf x$ | angular momentum $\mathbf L\cdot\hat{\mathbf n}$ |
| time translation ($\partial L/\partial t = 0$) | — | energy $h = \mathbf p\cdot\dot{\mathbf q} - L$ |
| Galilean boost | $t\,\hat{\mathbf e}$ | $\mathbf P t - M\mathbf X_{\text{cm}}$ (uniform centre-of-mass motion) |
| phase rotation $\psi \to e^{is}\psi$ | $i\psi$ | electric charge / particle number |

Two entries need a footnote. **Time translation** shifts the clock rather than the coordinates, so it falls outside the version stated above; the extended theorem covers it, and the short argument is that $dh/dt = -\partial L/\partial t$, which vanishes exactly when $L$ has no explicit $t$. The **boost** is a *quasi*-symmetry: the Lagrangian changes by a total time derivative, and the charge is correspondingly $I - F$.`,
    },
    {
      kind: 'match',
      prompt: 'Match each continuous symmetry to the quantity it conserves.',
      pairs: [
        [String.raw`invariance under $\mathbf x \mapsto \mathbf x + s\hat{\mathbf e}$`, String.raw`linear momentum along $\hat{\mathbf e}$`],
        [String.raw`invariance under rotations about the $z$-axis`, String.raw`angular momentum $L_z = m(x\dot y - y\dot x)$`],
        [String.raw`$L$ has no explicit dependence on $t$`, String.raw`energy $h = \mathbf p\cdot\dot{\mathbf q} - L$`],
        [String.raw`invariance under the global phase $\psi \mapsto e^{is}\psi$`, String.raw`electric charge / particle number`],
        [String.raw`invariance under a reflection $x \mapsto -x$`, String.raw`nothing — the symmetry is discrete`],
      ],
      why: String.raw`Each conserved quantity is $\mathbf p\cdot\delta q$ for the corresponding infinitesimal motion, so the symmetry determines the charge uniquely. The reflection is the instructive non-example: it is a genuine symmetry with real consequences (selection rules, parity quantum numbers), but there is no parameter to differentiate, so Noether's theorem has nothing to say about it.`,
    },
    {
      kind: 'numeric',
      prompt: String.raw`A particle of mass $m = 2$ moves in a central potential $V(\sqrt{x^2+y^2})$. At one instant $x = 3$, $y = 0$, $\dot x = 0$, $\dot y = 1.5$. What is the conserved angular momentum $L_z = m(x\dot y - y\dot x)$?`,
      answer: 9,
      why: String.raw`$L_z = 2\,(3 \times 1.5 - 0 \times 0) = 9$, and because $V$ depends only on the radius the system is rotationally invariant, so this value holds for all time — no need to solve the equations of motion. Forgetting the mass gives $4.5$; reading the cross product the other way gives $-9$.`,
    },
    {
      kind: 'widget',
      title: 'A symmetry is a one-parameter flow',
      body: String.raw`The transformations $Q^s$ form a one-parameter subgroup of the symmetry group: $Q^{s}Q^{r} = Q^{s+r}$, so $Q^s = \exp(sX)$ for a generator $X$ in the [Lie algebra](@math/lie-algebras). Below, the shape is carried by exactly such a flow, and the thin curves are the orbits $\{\exp(sX)p\}$ — the integral curves of the vector field $\delta q$.

This is the unifying statement of the unit. The conserved quantities of a system with symmetry group $G$ are indexed by $\mathfrak g$: the map
$$X \;\longmapsto\; I_X = \mathbf p \cdot (X\!\cdot\!q)$$
is **linear**, so a $3$-dimensional group gives at most a $3$-dimensional space of charges. For rotations of a particle in space, $\mathfrak{so}(3)$ has a basis of three generators and you get exactly $L_x, L_y, L_z$ — not more, not fewer.`,
      widget: { type: 'MathOneParamFlow', props: { gen: 'rotation', t: 0.9 } },
    },
    {
      kind: 'explain',
      title: 'The bracket survives the trip',
      body: String.raw`The correspondence $X \mapsto I_X$ does more than count. On the Hamiltonian side, functions on phase space carry the **Poisson bracket** $\{f,g\} = \sum_i \big(\partial_{q_i}f\,\partial_{p_i}g - \partial_{p_i}f\,\partial_{q_i}g\big)$, and for the charges of a symmetry group
$$\{I_X,\, I_Y\} \;=\; I_{[X,Y]} .$$

The map from the Lie algebra to the conserved quantities is a homomorphism of Lie algebras. (This map is the **momentum map**. The identity $\{I_X,I_Y\} = I_{[X,Y]}$ holds when the momentum map is *equivariant*; for charges of the form $\mathbf p\cdot\delta q$ built from a group acting on configuration space, as here, it is automatic. In general it holds only up to a constant, a central extension: for Galilean boosts $K$ and momenta $P$ the bracket is $\{K_i, P_j\} = M\delta_{ij}$ with $M$ the total mass, which is not $I_{[K,P]}$ because $[K,P]=0$ in the Lie algebra.) For rotations it reads
$$\{L_1, L_2\} = L_3, \qquad \{L_2,L_3\} = L_1, \qquad \{L_3,L_1\} = L_2,$$
which is the bracket $[L_i,L_j] = \varepsilon_{ijk}L_k$ of $\mathfrak{so}(3)$, verbatim. Replace $\{\cdot,\cdot\}$ by $\tfrac{1}{i\hbar}[\cdot,\cdot]$ and you have the angular-momentum commutators of quantum mechanics: the same algebra, three times over.`,
    },
    {
      kind: 'multi',
      prompt: 'Which statements about Noether’s theorem are correct?',
      choices: [
        String.raw`The symmetry must be continuous — a one-parameter family differentiable at $s=0$.`,
        String.raw`Invariance of $L$ up to a total time derivative $dF/dt$ is enough; the charge becomes $I - F$.`,
        String.raw`The conserved quantity is constant along every path in configuration space, solution or not.`,
        String.raw`Local (gauge) symmetries, whose parameter depends on position or time, are covered by the same theorem and give extra conserved charges.`,
        String.raw`The charge $I_X$ depends linearly on the generator $X$, so a $k$-dimensional symmetry group gives a linear map from its $k$-dimensional Lie algebra to the conserved quantities.`,
      ],
      answers: [0, 1, 4],
      why: String.raw`Continuity is essential (reflections give nothing) and the quasi-symmetry version is standard — it is what makes Galilean boosts work. But the charge is conserved only **on-shell**: the proof substitutes the Euler–Lagrange equations, and off a solution $I$ really does drift. Local symmetries are the subject of Noether's *second* theorem, which yields off-shell identities between the equations of motion rather than new conserved quantities. Finally, $I_X = \mathbf p\cdot\delta q$ is manifestly linear in the generator, which is why the charges are indexed by the Lie algebra.`,
    },
    {
      kind: 'explain',
      title: 'What the theorem does not say',
      body: String.raw`Four boundaries worth marking.

- **Discrete symmetries give nothing.** Parity and time reversal are real and useful — they give selection rules and quantum numbers — but they are not one-parameter families, so there is no charge to extract.
- **Gauge symmetries are different.** When the parameter is allowed to depend on space or time, Noether's **second** theorem applies: the output is a set of identities among the field equations (such as the contracted Bianchi identity of general relativity, or the consistency of $\partial_\mu j^\mu = 0$ with Maxwell's equations), not a new independent conservation law. The *global* part of the symmetry (constant parameter) still gives a first-theorem charge.
- **No Lagrangian, no theorem.** A system with friction has no time-independent Lagrangian of the form $T-V$, so the machinery does not start. Energy is lost — and nothing in the theorem is violated, because its hypotheses were never met.
- **The converse is true too.** For a nondegenerate system, a conserved quantity $I$ generates its own one-parameter symmetry of the dynamics through its Hamiltonian flow (a canonical transformation, not necessarily a transformation of $q$ alone). Symmetries and conservation laws are not merely linked; they are two descriptions of one thing.`,
    },
    {
      kind: 'fill',
      prompt: String.raw`Noether's theorem needs a ___ one-parameter family of transformations under which $L$ is invariant for all $(q,\dot q,t)$. The conserved quantity is $\mathbf p\cdot$ ___ , and it is constant along ___ of the Euler–Lagrange equations. Invariance under rotations gives ___ momentum.`,
      bank: ['continuous', 'discrete', '$\\delta q$', '$\\delta p$', 'solutions', 'all paths', 'angular', 'linear'],
      answer: ['continuous', '$\\delta q$', 'solutions', 'angular'],
      why: String.raw`A discrete symmetry has no parameter to differentiate, so the first step of the proof never happens. The charge pairs the momentum with the infinitesimal *displacement* $\delta q$, and it is conserved only on-shell, since the Euler–Lagrange equations are substituted midway through the proof. Translations give linear momentum; rotations give angular momentum.`,
    },
    {
      kind: 'explain',
      title: 'Key takeaways',
      body: String.raw`- **Noether's theorem.** If a smooth one-parameter family $Q^s$ (with $Q^0 = \mathrm{id}$) leaves $L$ invariant as an identity in $(q,\dot q,t)$, then $I = \sum_i \frac{\partial L}{\partial \dot q_i}\delta q_i = \mathbf p\cdot\delta q$ is constant along solutions, where $\delta q = \frac{d}{ds}\big|_0 Q^s(q)$.
- The hypotheses do the work: **continuous** family, invariance of the **Lagrangian** (not of a solution), as an identity in **all** variables; the conclusion holds **on-shell**.
- The proof is one differentiation in $s$, one substitution of Euler–Lagrange, and the recognition of a product rule.
- **Quasi-symmetry**: if $L$ changes by $dF/dt$, the charge is $I - F$. This is what Galilean boosts need.
- Dictionary: translation $\to$ momentum, rotation $\to$ angular momentum, time translation $\to$ energy, global phase $\to$ charge.
- The charges are indexed by the **Lie algebra** of the symmetry group, linearly, and the correspondence respects brackets: $\{I_X, I_Y\} = I_{[X,Y]}$, so $\mathfrak{so}(3)$ reappears as $\{L_1,L_2\} = L_3$.
- Out of scope: discrete symmetries (no charge), gauge symmetries (Noether's **second** theorem: identities, not charges), dissipative systems (no Lagrangian). The converse holds: every conserved quantity generates a symmetry.

Where this goes next: [Noether's theorem in physics](@physics/noether-theorem) for the field-theory version, and [angular momentum](@quantum/angular-momentum) for the quantum one, where $\{\cdot,\cdot\}$ becomes $\tfrac{1}{i\hbar}[\cdot,\cdot]$.`,
    },
  ],
  references: [
    { authors: 'E. Noether', title: 'Invariante Variationsprobleme', year: 1918, venue: 'Nachrichten von der Gesellschaft der Wissenschaften zu Göttingen, Mathematisch-Physikalische Klasse, 235–257', detail: 'The original paper; both theorems. English translation by M. A. Tavel, “Invariant variation problems”, Transport Theory and Statistical Physics 1(3), 186–207 (1971)' },
    { authors: 'V. I. Arnold', title: 'Mathematical Methods of Classical Mechanics', year: 1989, venue: '2nd ed., Springer GTM 60', detail: '§20 (Noether’s theorem, with the one-parameter-group statement and proof); §40 (the Lie algebra of Hamiltonian functions and Poisson brackets)' },
    { authors: 'H. Goldstein, C. Poole, J. Safko', title: 'Classical Mechanics', year: 2002, venue: '3rd ed., Addison-Wesley', detail: '§2.6–2.7 (symmetry properties and conservation theorems; the energy function); §13.7 (Noether’s theorem for fields)' },
    { authors: 'Y. Kosmann-Schwarzbach', title: 'The Noether Theorems: Invariance and Conservation Laws in the Twentieth Century', year: 2011, venue: 'Springer Sources and Studies in the History of Mathematics and Physical Sciences', detail: 'Translation of the 1918 paper with commentary; the distinction between the first and second theorems' },
    { authors: 'J. V. José, E. J. Saletan', title: 'Classical Dynamics: A Contemporary Approach', year: 1998, venue: 'Cambridge University Press', detail: 'Ch. 3 (symmetry and conservation in the Lagrangian formalism), Ch. 5 (Hamiltonian formulation, Poisson brackets and symmetry generators)' },
  ],
} satisfies LessonContent;
