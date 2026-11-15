import type { LessonContent } from '../../types';

const inRows: [string, string][] = [
  ['string theory', 'mirror symmetry'],
  ['spin glasses', 'random SAT, assignment'],
  ['interval arithmetic', 'Lorenz attractor, Kepler'],
  ['SAT solvers', 'Ramsey-type records'],
  ['neural networks', 'conjecture generation'],
];
const outRows: [string, string][] = [
  ['elliptic curves', 'public-key cryptography'],
  ['sparse recovery', 'faster MRI scans'],
  ['the Radon transform', 'CT reconstruction'],
  ['random matrices', 'wireless channel design'],
  ['category theory', 'programming languages'],
];
const transferSvg = `<svg viewBox="0 0 320 ${44 + Math.max(inRows.length, outRows.length) * 22}" xmlns="http://www.w3.org/2000/svg" font-family="inherit">
  <text x="6" y="12" font-size="10" fill="var(--c2)">Into mathematics</text>
  ${inRows.map(([a, b], i) => {
    const y = 30 + i * 22;
    return `<g>
      <text x="6" y="${y}" font-size="9" fill="var(--muted)">${a}</text>
      <line x1="96" y1="${y - 3}" x2="128" y2="${y - 3}" stroke="var(--c2)" stroke-width="1"/>
      <polygon points="128,${y - 6} 134,${y - 3} 128,${y}" fill="var(--c2)">
        <animate attributeName="opacity" values="0.25;1;0.25" dur="2.6s" begin="${i * 0.3}s" repeatCount="indefinite"/>
      </polygon>
      <text x="138" y="${y}" font-size="9" fill="var(--fg)">${b}</text>
    </g>`;
  }).join('')}
  <line x1="6" y1="${36 + inRows.length * 22}" x2="314" y2="${36 + inRows.length * 22}" stroke="var(--grid)" stroke-width="1"/>
</svg>`;

const outSvg = `<svg viewBox="0 0 320 ${26 + outRows.length * 22}" xmlns="http://www.w3.org/2000/svg" font-family="inherit">
  <text x="6" y="12" font-size="10" fill="var(--c5)">Out of mathematics</text>
  ${outRows.map(([a, b], i) => {
    const y = 30 + i * 22;
    return `<g>
      <text x="6" y="${y}" font-size="9" fill="var(--fg)">${a}</text>
      <line x1="112" y1="${y - 3}" x2="144" y2="${y - 3}" stroke="var(--c5)" stroke-width="1"/>
      <polygon points="144,${y - 6} 150,${y - 3} 144,${y}" fill="var(--c5)">
        <animate attributeName="opacity" values="0.25;1;0.25" dur="2.6s" begin="${i * 0.3}s" repeatCount="indefinite"/>
      </polygon>
      <text x="154" y="${y}" font-size="9" fill="var(--muted)">${b}</text>
    </g>`;
  }).join('')}
</svg>`;

const replicaSvg = `<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" font-family="inherit">
  <text x="6" y="12" font-size="10" fill="var(--fg)">A random problem as a physical material</text>
  <text x="6" y="30" font-size="9" fill="var(--c2)">Combinatorics</text>
  <text x="196" y="30" font-size="9" fill="var(--c5)">Statistical physics</text>
  ${[
    ['a random formula', 'a disordered magnet'],
    ['one assignment of variables', 'one configuration of spins'],
    ['clauses it violates', 'energy of that configuration'],
    ['how many solutions?', 'the partition function Z'],
    ['typical case behaviour', 'free energy  −(1/β)·log Z'],
    ['a sharp threshold', 'a phase transition'],
  ].map(([l, r], i) => {
    const y = 50 + i * 20;
    return `<g>
      <text x="6" y="${y}" font-size="8.5" fill="var(--muted)">${l}</text>
      <line x1="150" y1="${y - 3}" x2="186" y2="${y - 3}" stroke="var(--grid)" stroke-width="1" stroke-dasharray="3 2"/>
      <circle cx="190" cy="${y - 3}" r="2" fill="var(--c3)">
        <animate attributeName="r" values="2;3.4;2" dur="2.2s" begin="${i * 0.25}s" repeatCount="indefinite"/>
      </circle>
      <text x="196" y="${y}" font-size="8.5" fill="var(--muted)">${r}</text>
    </g>`;
  }).join('')}
  <text x="6" y="174" font-size="8.5" fill="var(--c5)">The dictionary is exact. The physicists' method of solving it is not.</text>
</svg>`;

export default {
  cards: [
    {
      kind: 'explain',
      title: 'Mathematics is not sealed',
      body: String.raw`It is tempting to picture mathematics as self-contained: definitions in, theorems out, no imports needed. The record says otherwise. Several of the liveliest areas of the last forty years began when somebody outside mathematics made a prediction that mathematicians could not yet prove and could not ignore.

The transfers go both ways, and they are not all of the same quality. Some arrive with a mechanism you can inspect and eventually make rigorous. Some arrive as a correct answer with a derivation that is, by mathematical standards, meaningless. Some arrive as a machine that produces objects you can check in seconds.

This lesson looks at five transfers, and in each case asks: what exactly is being borrowed, why does it work, and where does the analogy stop?`,
      widget: { type: 'SvgDiagram', props: { svg: transferSvg } },
    },
    {
      kind: 'explain',
      title: 'Mirror symmetry: the physicists counted curves',
      body: String.raw`In string theory, space is modelled as ordinary spacetime times a tiny six-dimensional shape — a **Calabi–Yau threefold**. A standard example is the **quintic**: the set of points in five-dimensional complex projective space where a degree-5 polynomial vanishes.

An old and hard question in algebraic geometry is how many rational curves of each degree sit inside the quintic. Degree 1 (lines): 2,875, known since the nineteenth century. Degree 2 (conics): 609,250, computed in 1986. Degree 3 (twisted cubics) required serious machinery.

Physicists noticed that the string theory built on a Calabi–Yau $X$ depends on $X$ only through certain data, and that a different manifold $Y$ — the **mirror** — gives the same physics with two kinds of data swapped. On $X$ the curve count is a brutal enumeration. On $Y$ the corresponding quantity is an integral of a solution to a differential equation: hard, but *doable*.

In 1991 Philip Candelas, Xenia de la Ossa, Paul Green and Linda Parkes did that integral and read off predicted curve counts for every degree at once — including degrees nobody could count by direct geometry.`,
    },
    {
      kind: 'widget',
      title: 'What happened next',
      body: String.raw`The reception is the interesting part, because it shows what a physics prediction is and is not.`,
      widget: {
        type: 'StepReveal',
        props: {
          steps: [
            String.raw`**The prediction matched the known counts.** Degree 1 and degree 2 came out at 2,875 and 609,250, which algebraic geometers already knew independently.`,
            String.raw`**Degree 3 matched too.** The predicted 317,206,375 agreed with the independent algebraic-geometry computation of Geir Ellingsrud and Stein Arild Strømme.`,
            String.raw`**Higher degrees were beyond direct counting at the time.** For degree 4 the prediction is 242,467,530,000; the first mathematical computation of that number came from Kontsevich's stable-map methods in the mid-1990s.`,
            String.raw`**That still was not a proof.** The derivation runs through a path integral and a duality that had no mathematical definition. The numbers were a conjecture with a remarkable track record.`,
            String.raw`**Proofs arrived separately.** Alexander Givental in 1996 and, independently, Bong Lian, Kefeng Liu and Shing-Tung Yau in 1997 established the enumerative predictions using Gromov–Witten theory and localisation — methods with no physics in them.`,
            String.raw`**The general statement is still open.** Maxim Kontsevich's homological mirror symmetry (1994) and the Strominger–Yau–Zaslow picture (1996) are the two attempts to say precisely what mirror symmetry *is*. Both are proved in cases and conjectural in general.`,
          ],
          notes: [
            'Agreement on known cases is how a heuristic earns attention.',
            'A prediction that also matches a hard independent computation is much harder to write off as numerology.',
            'This is the stretch where physics was ahead: it supplied numbers that mathematics could not yet reach.',
            'Physicists were not claiming a proof. The confusion is usually downstream.',
            'Note the gap: five to six years from prediction to proof, by completely different means.',
            'Mirrors are not even known to always exist — rigid Calabi–Yau manifolds are a standing awkwardness.',
          ],
        },
      },
    },
    {
      kind: 'mcq',
      prompt: String.raw`Which description of the 1991 quintic prediction is accurate?`,
      choices: [
        'A non-rigorous physical derivation produced conjectural numbers for every degree; they matched the counts mathematicians could independently obtain, and were proved five to six years later by pure-mathematical methods.',
        'A rigorous quantum field theory argument proved the curve counts, so no separate mathematical proof was needed.',
        'The physicists fitted a formula to curve counts that algebraic geometers had already computed.',
        'The prediction was withdrawn once the degree-3 count was checked independently.',
      ],
      answer: 0,
      why: String.raw`The derivation used a path integral and a conjectural duality, neither of which has a rigorous definition — so it was a prediction, not a proof. The low-degree counts were known independently and matched, which is why the higher-degree predictions were taken seriously; Givental and Lian–Liu–Yau later supplied genuine proofs.`,
    },
    {
      kind: 'explain',
      title: 'Spin glasses: a dictionary, and a method that should not work',
      body: String.raw`A **spin glass** is a magnetic material whose atomic interactions are random: some pairs want to align, some want to oppose, and no configuration can satisfy everyone. Physicists built tools for such systems in the 1970s. Those tools turned out to describe random combinatorial problems almost word for word.

The dictionary is exact and easy to state. A random constraint satisfaction problem is a disordered material; an assignment of its variables is a configuration; the number of constraints it violates is the energy; a weighted count of configurations, dominated by the low-energy ones, is the **partition function** $Z = \sum_{\text{configs}} e^{-\beta E}$; and the sharp thresholds combinatorialists care about are phase transitions.

What is *not* exact is the calculation. To get typical behaviour you need the average of $\log Z$, which is intractable. The **replica trick** writes
$$\mathbb{E}[\log Z] = \lim_{n \to 0} \frac{\mathbb{E}[Z^{n}] - 1}{n},$$
computes $\mathbb{E}[Z^{n}]$ for *integer* $n$ (that part is honest combinatorics), and then takes $n \to 0$ — a limit of a quantity defined only at integers. As mathematics this is nonsense. As prediction it has been extraordinarily accurate.`,
      widget: { type: 'SvgDiagram', props: { svg: replicaSvg } },
    },
    {
      kind: 'explain',
      title: 'What the trick predicted, and what got proved',
      body: String.raw`Three cases, in increasing order of how uncomfortable they should make you.

- **The Sherrington–Kirkpatrick model.** Giorgio Parisi's 1979–80 solution, with its elaborate "replica symmetry breaking" structure, was regarded by many mathematicians as uninterpretable. Francesco Guerra proved half of it in 2003 (an inequality in the right direction) and Michel Talagrand proved the Parisi formula in 2006, in the *Annals of Mathematics*. Parisi shared the 2021 Nobel Prize in Physics.
- **Random satisfiability.** Marc Mézard, Giorgio Parisi and Riccardo Zecchina used the related **cavity method** in 2002 to predict where random $k$-SAT stops being satisfiable, and derived a new algorithm (survey propagation) from the same analysis. Jian Ding, Allan Sly and Nike Sun proved the threshold formula for all sufficiently large $k$ (on arXiv in 2013, published in the *Annals* in 2022). For $k = 3$ it is still open.
- **Random assignment.** Parisi conjectured in 1998 that the expected minimum cost of matching $n$ workers to $n$ jobs with independent exponential costs is exactly $\sum_{i=1}^{n} 1/i^{2}$. Proved in 2003, independently and at about the same time, by Svante Linusson and Johan Wästlund and by Chandra Nair, Balaji Prabhakar and Mayank Sharma; the journal versions appeared over the following two years.

And the honest caveat: the replica method has also produced **wrong** answers. The first, "replica-symmetric" solution of the Sherrington–Kirkpatrick model gives a negative entropy at low temperature — an impossibility, which is what forced Parisi to the more elaborate scheme. The method is a generator of conjectures with a good but not perfect record, not a proof technique.`,
    },
    {
      kind: 'numeric',
      prompt: String.raw`Parisi's random assignment formula gives an expected minimum cost of $\sum_{i=1}^{n} 1/i^{2}$. What does this tend to as $n \to \infty$? Give the numerical value to four decimal places.`,
      answer: 1.6449,
      tolerance: 0.0002,
      why: String.raw`The sum is the Basel problem: $\sum_{i\ge1} 1/i^{2} = \pi^{2}/6 \approx 1.644934$. Part of what made the conjecture striking is its exactness — a clean closed form for every finite $n$, not just asymptotically. A physics heuristic that lands on an exact finite-$n$ identity is hard to dismiss as coincidence, which helps explain why it drew so much attention.`,
      unit: '',
    },
    {
      kind: 'truefalse',
      prompt: String.raw`The replica method is a rigorous proof technique: a result derived with it does not need a separate mathematical proof.`,
      answer: false,
      why: String.raw`The step $n \to 0$ takes a limit of an expression that only has meaning for positive integers $n$, so the derivation has no mathematical content as it stands. Its predictions are conjectures. Several have since been proved by entirely different arguments — Talagrand on the Parisi formula, Ding–Sly–Sun on the satisfiability threshold — and the method has also produced answers that are demonstrably wrong.`,
    },
    {
      kind: 'explain',
      title: 'Computers: two quite different imports',
      body: String.raw`Computation enters mathematics in two ways that people often conflate.

**Rigorous numerics.** Floating-point arithmetic is approximate, so it cannot prove anything — unless you track the error. **Interval arithmetic** replaces each real number by an interval containing it and rounds *outward* at every step, so the final interval provably contains the true answer. A finite computation then establishes a genuine inequality. Warwick Tucker used this in 2002 to prove that the Lorenz attractor really exists as the pictures suggest, settling the fourteenth of Stephen Smale's problems; Thomas Hales used it for the thousands of nonlinear inequalities in the Kepler conjecture.

**Search plus certificate.** A SAT solver explores an astronomically large space, and you should not trust its code. The fix is that it emits a **certificate**: a line-by-line refutation that a tiny, independently written (and sometimes formally verified) checker replays. Marijn Heule, Oliver Kullmann and Victor Marek used this in 2016 to settle the Boolean Pythagorean triples problem; the certificate ran to about 200 terabytes. Heule later settled Schur number five the same way.

The transfer is real and the mechanism is sound. What it does not supply is understanding: the Pythagorean triples certificate tells you the answer is "no" and gives no hint why. Mathematicians count that as a genuine loss, not a quibble.`,
    },
    {
      kind: 'explain',
      title: 'Machine learning: a search for patterns, not proofs',
      body: String.raw`The 2021 *Nature* paper by Alex Davies and colleagues at DeepMind, with the mathematicians Marc Lackenby and Geordie Williamson, is worth understanding mechanically rather than as a headline. The pipeline is:

1. Pick two sets of computable invariants of some mathematical object, $X(z)$ and $y(z)$. Generate a large sample of objects and compute both.
2. Train a [neural network](@ml/neural-networks-intro) to predict $y$ from $X$. If it cannot, there is probably no simple relation and you stop.
3. If it can, use attribution methods to ask *which components of $X$ the model relies on*. This is the step that does the real work: it narrows a large space of possible relations to a handful.
4. Stare at those few invariants, form a conjecture by hand, and prove it by hand.

It produced two things: a relation between the signature of a hyperbolic knot and its cusp geometry, which was then stated and proved by the mathematicians, and progress on the combinatorial invariance conjecture in representation theory, which remains a conjecture.

Where it breaks down, plainly: the method needs a cheap way to generate thousands of examples with computed invariants, which rules out most of mathematics. Attribution methods are known to be unreliable, so step 3 can mislead. And the model never contributes to the proof — it is a very expensive way of noticing something, and the noticing still has to be converted into mathematics by a person.`,
    },
    {
      kind: 'match',
      prompt: 'Match each import to the mechanism that makes it work.',
      pairs: [
        ['Mirror symmetry', 'A physical theory sees a Calabi–Yau only through certain data, so two manifolds with the same physics must have matching invariants computed in different ways'],
        ['Replica and cavity methods', 'Treat a random combinatorial problem as a disordered material and extract typical behaviour from its partition function'],
        ['Interval arithmetic', 'Replace each number by an enclosing interval and round outward, so a finite computation yields a proved inequality'],
        ['SAT solver certificates', 'The search itself is untrusted; it emits a refutation that a small independent checker replays'],
        ['Machine learning for intuition', 'Train a model to predict one invariant from others, then inspect which inputs it depends on to narrow the space of candidate relations'],
      ],
      why: String.raw`Notice how different the guarantees are. Interval arithmetic and certificates deliver proof; the computer is inside the argument, and the trust rests on a small, auditable component. Mirror symmetry and the replica method deliver conjectures that must be proved separately. Machine learning delivers neither — it delivers a shortlist of things to look at.`,
    },
    {
      kind: 'multi',
      prompt: 'Which of these statements about cross-field transfer into mathematics are accurate as of 2026?',
      choices: [
        'Mirror symmetry in general is a conjecture rather than a theorem, although specific enumerative predictions derived from it have been proved.',
        'The replica method relies on a limit with no rigorous meaning, yet several of its predictions have later been proved by other arguments.',
        'A 200-terabyte SAT proof is trusted because the solver that produced it has been formally verified.',
        'A neural network trained on knot invariants pointed at a relation that mathematicians then stated and proved themselves.',
        'Because mirror symmetry originated in physics, mathematicians cannot test its predictions without doing physics.',
      ],
      answers: [0, 1, 3],
      why: String.raw`Trust in a SAT proof does not come from the solver — the solver is usually a large, fast, unverified program. It comes from the certificate and the small checker that replays it, which is a different and better arrangement. And the quintic episode is the counterexample to the last idea: the predictions are statements about algebraic geometry and were checked and eventually proved entirely within mathematics.`,
    },
    {
      kind: 'order',
      prompt: 'Put the quintic story in the order it happened.',
      steps: [
        'Physicists studying strings on a Calabi–Yau threefold construct a mirror manifold on which a hard curve count becomes a tractable integral.',
        'They evaluate the integral and read off predicted numbers of rational curves of every degree on the quintic.',
        'The predictions match the degree-1 and degree-2 counts that algebraic geometers already knew.',
        'The degree-3 prediction is confirmed by Ellingsrud and Strømme’s independent computation.',
        'Kontsevich’s stable-map methods give the first mathematical computation of the degree-4 number, matching the prediction.',
        'Givental, and independently Lian, Liu and Yau, prove the predictions by methods that use no physics.',
      ],
      why: String.raw`The order matters for the moral. The agreement on low degrees came first and is what made the higher-degree predictions credible; if the physics had missed degrees 1 and 2, nobody would have taken it seriously. And the proof came last, by other means — the physical derivation was never upgraded into one.`,
    },
    {
      kind: 'fill',
      prompt: String.raw`Physics handed mathematics a ___: a prediction with no valid derivation behind it, which had to be proved separately by other means. A SAT solver hands over something stronger — a ___ that a small independent checker can replay line by line. A neural network hands over neither; the Davies group used ___ methods to see which inputs the model depended on, and the mathematics came afterwards.`,
      bank: ['heuristic', 'certificate', 'attribution', 'theorem', 'counterexample', 'simulation'],
      answer: ['heuristic', 'certificate', 'attribution'],
      why: String.raw`The three words name three quite different kinds of deliverable, and confusing them is the commonest way these stories get told wrongly. A heuristic needs a proof; a certificate *is* most of a proof; an attribution is a hint with no guarantee attached at all.`,
    },
    {
      kind: 'explain',
      title: 'What mathematics sends the other way',
      body: String.raw`The export side is less romantic and more consequential, and in every case the mechanism is the same shape: a structure studied for internal reasons turns out to be exactly what some applied problem needs.

- **Elliptic curves to cryptography.** The rational points of an elliptic curve form a [group](@math/groups-intro). Over a finite field that group is finite, and computing discrete logarithms in it is believed to be much harder than in the integers modulo a prime, so you get the same security from far shorter keys. Proposed independently by Victor Miller (1985) and Neal Koblitz (1987); now standard in web and messaging protocols.
- **Sparse recovery to medical imaging.** If a signal is sparse when written in some basis, then minimising the $\ell^{1}$ norm subject to the measurements recovers it exactly from far fewer samples than the classical sampling rate requires — Emmanuel Candès, Justin Romberg and Terence Tao, and independently David Donoho, in 2006. Michael Lustig, Donoho and John Pauly applied it to MRI in 2007, and compressed-sensing acceleration is now in commercial clinical scanners. This is a theorem about convex geometry shortening the time a patient lies in a machine.
- **The Radon transform to CT.** Johann Radon worked out in 1917 how to reconstruct a function from its integrals over all lines. Computed tomography is that inversion, implemented.
- **Random matrix theory, which travels in circles.** Eugene Wigner introduced it for nuclear energy levels; it reappeared in the statistics of zeta zeros; it now underpins the capacity analysis of multi-antenna wireless channels.

> Mathematicians usually did not have the application in mind. That is not an argument for ignoring applications — it is an argument against demanding them in advance.`,
      widget: { type: 'SvgDiagram', props: { svg: outSvg } },
    },
    {
      kind: 'explain',
      title: 'Key takeaways',
      body: String.raw`- Ask of every transfer: **what is the mechanism, and what does it guarantee?** The answers range from "a proof" to "a shortlist".
- **Mirror symmetry** turns a hard count on one Calabi–Yau into a tractable integral on its mirror. It predicted the quintic curve counts in 1991, the predictions matched independent low-degree computations, and they were proved in 1996–97. The general statement remains conjectural.
- **Statistical physics** gives an exact dictionary between random combinatorics and disordered materials, with an inexact method for solving it. The replica trick's $n \to 0$ limit is meaningless; its predictions on the Parisi formula and the $k$-SAT threshold were later proved, and some of its other answers were wrong.
- **Interval arithmetic** and **SAT certificates** are real proof techniques: in both, the untrustworthy part is kept outside the chain of trust. They cost understanding.
- **Machine learning** contributes by narrowing the space of plausible relations. It needs mass-producible examples, it relies on unreliable attribution methods, and it never produces the proof.
- Exports — elliptic-curve cryptography, compressed sensing in MRI, the Radon transform in CT — came from work done for internal reasons, decades before the application existed.
- Where an analogy breaks, say so. Almost every story in this lesson has been retold somewhere as though a proof had been produced when it had not.

Next: [following the frontier](@math/frontier-reading-research).`,
    },
  ],
  references: [
    { authors: 'P. Candelas, X. C. de la Ossa, P. S. Green, L. Parkes', title: 'A pair of Calabi–Yau manifolds as an exactly soluble superconformal theory', year: 1991, venue: 'Nuclear Physics B 359(1), 21–74' },
    { authors: 'M. Talagrand', title: 'The Parisi formula', year: 2006, venue: 'Annals of Mathematics 163(1), 221–263' },
    { authors: 'W. Tucker', title: "A rigorous ODE solver and Smale's 14th problem", year: 2002, venue: 'Foundations of Computational Mathematics 2, 53–117' },
    { authors: 'M. J. H. Heule, O. Kullmann, V. W. Marek', title: 'Solving and verifying the Boolean Pythagorean triples problem via cube-and-conquer', year: 2016, venue: 'SAT 2016, Lecture Notes in Computer Science 9710, 228–245' },
    { authors: 'A. Davies, P. Veličković, L. Buesing, S. Blackwell, D. Zheng, N. Tomašev, et al.', title: 'Advancing mathematics by guiding human intuition with AI', year: 2021, venue: 'Nature 600, 70–74' },
  ],
} satisfies LessonContent;
