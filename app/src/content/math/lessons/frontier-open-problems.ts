import type { LessonContent } from '../../types';

const stripSvg = `<svg viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg" font-family="inherit">
  <text x="6" y="12" font-size="10" fill="var(--fg)">The complex plane of s = σ + it</text>
  <rect x="120" y="20" width="60" height="150" fill="var(--c2)" fill-opacity="0.10"/>
  <line x1="150" y1="20" x2="150" y2="170" stroke="var(--c5)" stroke-width="1.6" stroke-dasharray="4 3"/>
  <line x1="20" y1="95" x2="310" y2="95" stroke="var(--fg)" stroke-width="0.8"/>
  <line x1="120" y1="20" x2="120" y2="170" stroke="var(--muted)" stroke-width="0.8"/>
  <line x1="180" y1="20" x2="180" y2="170" stroke="var(--muted)" stroke-width="0.8"/>
  <text x="120" y="182" text-anchor="middle" font-size="9" fill="var(--muted)">σ = 0</text>
  <text x="150" y="194" text-anchor="middle" font-size="9" fill="var(--c5)">σ = 1/2</text>
  <text x="180" y="182" text-anchor="middle" font-size="9" fill="var(--muted)">σ = 1</text>
  <text x="196" y="36" font-size="9" fill="var(--c2)">critical strip</text>
  ${[36, 52, 70, 86, 104, 120, 138, 154].map((y, i) => `<circle cx="150" cy="${y}" r="3" fill="var(--c5)">
    <animate attributeName="opacity" values="0;1;1" dur="3s" begin="${i * 0.25}s" fill="freeze"/></circle>`).join('')}
  ${[60, 80, 100].map((y, i) => `<g opacity="0.55">
    <circle cx="168" cy="${y}" r="3" fill="none" stroke="var(--c3)" stroke-dasharray="2 2"/>
    <circle cx="132" cy="${200 - y - 10}" r="3" fill="none" stroke="var(--c3)" stroke-dasharray="2 2"/>
    <animate attributeName="opacity" values="0.55;0.1;0.55" dur="2.5s" begin="${i * 0.4}s" repeatCount="indefinite"/>
  </g>`).join('')}
  <text x="196" y="118" font-size="8.5" fill="var(--c3)">dashed: zeros nobody</text>
  <text x="196" y="129" font-size="8.5" fill="var(--c3)">has found, and nobody</text>
  <text x="196" y="140" font-size="8.5" fill="var(--c3)">has ruled out</text>
  <text x="20" y="92" font-size="8.5" fill="var(--muted)">t = 0</text>
</svg>`;

/** The Collatz orbit of n: halve if even, 3n+1 if odd, until it reaches 1. */
const collatz = (n: number): number[] => {
  const out = [n];
  while (n !== 1) { n = n % 2 === 0 ? n / 2 : 3 * n + 1; out.push(n); }
  return out;
};
const orbits: [number, number[], string][] = [
  [7, collatz(7), 'var(--c3)'],
  [27, collatz(27), 'var(--c5)'],
];
const maxStep = Math.max(...orbits.map(([, o]) => o.length - 1)); // 111, for n = 27
const px = (i: number) => 36 + (i / maxStep) * 274;
const py = (v: number) => 168 - (Math.log10(v) / 4) * 138;
const collatzSvg = `<svg viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg" font-family="inherit">
  <text x="6" y="12" font-size="10" fill="var(--fg)">Two Collatz orbits (vertical axis is a log scale)</text>
  ${[1, 10, 100, 1000, 10000].map((v) => `<g>
    <line x1="36" y1="${py(v)}" x2="310" y2="${py(v)}" stroke="var(--grid)" stroke-width="0.6"/>
    <text x="32" y="${py(v) + 3}" text-anchor="end" font-size="8" fill="var(--muted)">${v}</text>
  </g>`).join('')}
  <line x1="36" y1="${py(1)}" x2="36" y2="26" stroke="var(--fg)" stroke-width="0.8"/>
  <text x="310" y="182" text-anchor="end" font-size="8.5" fill="var(--muted)">steps →  (0 to ${maxStep})</text>
  ${orbits.map(([n, orb, col], k) => {
    const pts = orb.map((v, i) => `${px(i).toFixed(1)},${py(v).toFixed(1)}`).join(' ');
    return `<g>
      <polyline points="${pts}" fill="none" stroke="${col}" stroke-width="1.4" stroke-linejoin="round"
        stroke-dasharray="2000" stroke-dashoffset="2000">
        <animate attributeName="stroke-dashoffset" from="2000" to="0" dur="${5 + k * 2}s" begin="0.3s" fill="freeze"/>
      </polyline>
      <circle cx="${px(0).toFixed(1)}" cy="${py(n).toFixed(1)}" r="3" fill="${col}"/>
      <text x="${(px(0) + 5).toFixed(1)}" y="${(py(n) - 5).toFixed(1)}" font-size="8.5" fill="${col}">start ${n}</text>
    </g>`;
  }).join('')}
  <circle cx="${px(collatz(27).indexOf(9232)).toFixed(1)}" cy="${py(9232).toFixed(1)}" r="3" fill="none" stroke="var(--c5)" stroke-width="1"/>
  <text x="${(px(collatz(27).indexOf(9232)) + 6).toFixed(1)}" y="${(py(9232) + 3).toFixed(1)}" font-size="8" fill="var(--c5)">peak 9232</text>
  <text x="6" y="194" font-size="8.5" fill="var(--muted)">7 reaches 1 in 16 steps; 27 takes 111 and climbs 342× its own size first.</text>
</svg>`;

export default {
  cards: [
    {
      kind: 'explain',
      title: 'What an open problem is',
      body: String.raw`An **open problem** is a precise statement that is neither proved nor disproved. "Precise" is doing a lot of work there: a real open problem is written so that, if someone handed you a solution, you could in principle tell whether it was one.

That is why this lesson states each problem carefully, even when the statement needs a couple of extra definitions. Vague goals ("understand turbulence") are research *directions*. Open problems are yes/no questions with the answer missing.

Six of them follow. One of them you could explain to a ten-year-old — and it may be the hardest of all.`,
    },
    {
      kind: 'explain',
      title: '1. The Riemann hypothesis',
      body: String.raw`For $\mathrm{Re}(s) > 1$ define the **Riemann zeta function** by the convergent series
$$\zeta(s) = \sum_{n=1}^{\infty} \frac{1}{n^{s}}.$$
Riemann (1859) showed that this extends to a function defined (and [complex-differentiable](@math/holomorphic-functions)) on the whole plane except $s = 1$. The extended function vanishes at $s = -2, -4, -6, \dots$ — the "trivial" zeros — and at infinitely many other points, all of which lie in the **critical strip** $0 < \mathrm{Re}(s) < 1$.

> **Riemann hypothesis (RH).** Every non-trivial zero has $\mathrm{Re}(s) = \tfrac12$.

A single counterexample — one zero with real part $\ne \tfrac12$ — would disprove it. That is what makes it a problem rather than a programme.`,
      widget: { type: 'SvgDiagram', props: { svg: stripSvg } },
    },
    {
      kind: 'widget',
      title: 'Looking at the zeros',
      body: String.raw`Here is $|\zeta(\sigma + it)|$ along a vertical line. On the critical line $\sigma = \tfrac12$ the curve genuinely touches zero — the first few times at $t \approx 14.13,\ 21.02,\ 25.01,\ 30.42$. Drag $\sigma$ to the right and the dips lift off the axis: no zeros there, in this range.

The first $10^{13}$ zeros have been computed (Gourdon, 2004) and every one is on the line. That is evidence, not proof — and a later lesson shows a case where exactly this kind of evidence was misleading.`,
      widget: { type: 'MathZetaZeros', props: { tMin: 0, tMax: 50 } },
    },
    {
      kind: 'explain',
      title: 'Why anyone cares about RH',
      body: String.raw`RH is not a curiosity about one function. Let $\pi(x)$ count the primes up to $x$, and let $\mathrm{li}(x) = \int_0^x dt/\ln t$ (interpreted as a principal value). The prime number theorem says $\pi(x) \approx \mathrm{li}(x)$. RH is **equivalent** to a sharp statement about how good that approximation is: $\pi(x) - \mathrm{li}(x) = O(x^{1/2+\varepsilon})$ for every $\varepsilon > 0$. In an explicit form, Lowell Schoenfeld showed in 1976 that **if RH is true** then
$$\left|\pi(x) - \mathrm{li}(x)\right| \le \frac{\sqrt{x}\,\ln x}{8\pi} \quad \text{for } x \ge 2657.$$
(and this explicit bound in turn implies RH, so it is an equivalent formulation). So RH says: the primes are as evenly spread as a random-looking sequence could be. Hundreds of published theorems begin "assume RH". If it is false, they go with it.`,
    },
    {
      kind: 'recall',
      title: 'Recall: P vs NP',
      points: [
        'A problem is in **P** if some algorithm solves it in time bounded by a polynomial in the input size.',
        'It is in **NP** if a *claimed* solution can be checked in polynomial time.',
        'Every problem in P is in NP: if you can solve it fast, you can check it fast.',
        '**NP-complete** problems (SAT, travelling salesman as a decision problem, graph colouring) are the hardest in NP: a polynomial algorithm for one gives one for all.',
        'The question is whether P = NP — whether checking easily implies solving easily.',
      ],
      link: 'cs/p-vs-np',
    },
    {
      kind: 'explain',
      title: '2. P vs NP',
      body: String.raw`This one belongs to both mathematics and [computer science](@cs/p-vs-np), and it is on the Clay Institute's list of seven Millennium Prize Problems alongside RH.

> **P vs NP.** Is $\mathrm{P} = \mathrm{NP}$?

A solution in either direction would be recognisable. To prove $\mathrm{P} = \mathrm{NP}$ you would exhibit a polynomial-time algorithm for one NP-complete problem. To prove $\mathrm{P} \ne \mathrm{NP}$ you would prove a **lower bound**: that no algorithm whatsoever, of any design, solves some NP problem in polynomial time.

Almost everyone expects $\mathrm{P} \ne \mathrm{NP}$. Nobody can prove even far weaker lower bounds — and the reasons why are theorems in their own right, which the next lesson covers.`,
    },
    {
      kind: 'mcq',
      prompt: String.raw`Someone publishes a very fast heuristic that solves travelling-salesman instances with a million cities in minutes, on every benchmark anyone has tried. Has P = NP been established?`,
      choices: [
        'Yes — a fast algorithm for an NP-complete problem is exactly what P = NP requires.',
        'No. P = NP requires a *worst-case* polynomial bound proved for all inputs; good behaviour on the instances people happen to test says nothing about the worst case.',
        'No, because travelling salesman is not in NP.',
        'Yes, provided the code is open source and reproducible.',
      ],
      answer: 1,
      why: String.raw`P and NP are worst-case complexity classes: membership is a proved bound holding for *every* input of each size. Practical solvers for travelling salesman and for SAT are genuinely excellent on real instances and this has been true for decades without touching the question. The decision version of travelling salesman is in NP, so that is not the issue either.`,
    },
    {
      kind: 'explain',
      title: '3. Navier–Stokes regularity',
      body: String.raw`The incompressible Navier–Stokes equations model a fluid of velocity $u(x,t)$ and pressure $p$:
$$\partial_t u + (u\cdot\nabla)u = -\nabla p + \nu\,\Delta u, \qquad \nabla\cdot u = 0.$$
They are used every day in engineering. What is missing is a proof that they *always make sense*.

> **Navier–Stokes existence and smoothness.** On $\mathbb{R}^3$ (or the three-dimensional torus), given any smooth, divergence-free initial velocity that decays fast at infinity, does a smooth solution exist for all time $t > 0$? Or can one "blow up" — have some quantity become infinite — in finite time?

Either answer settles it. In two dimensions the answer has been known since the mid-twentieth century (Ladyzhenskaya and others): solutions stay smooth. Three dimensions is open. Compare our [introduction to PDE types](@math/pde-intro-classification) — this is a nonlinear equation where the usual classification gives no guarantee.`,
    },
    {
      kind: 'truefalse',
      prompt: String.raw`Because engineers simulate Navier–Stokes flows successfully every day, the regularity problem is of purely theoretical interest and a blow-up solution would have no practical meaning.`,
      answer: false,
      why: String.raw`Simulations resolve a finite grid over a finite time, so they cannot see a genuine singularity; they would just show the fine scales running off the end of the mesh. If blow-up occurs, the equations stop describing the fluid there, and every numerical scheme's error estimate — which assumes smoothness — loses its justification at exactly the moments that matter.`,
    },
    {
      kind: 'explain',
      title: '4. Birch and Swinnerton-Dyer',
      body: String.raw`An **elliptic curve** over the rationals is the solution set of $y^2 = x^3 + ax + b$ with $a, b \in \mathbb{Q}$ and no repeated roots. Its rational points form an abelian [group](@math/groups-intro), and Mordell proved in 1922 that this group is finitely generated: it is a finite part plus $r$ independent infinite directions. That $r$ is the **rank**, and there is no known general method to compute it.

Separately one builds an analytic function $L(E, s)$ out of counts of solutions modulo each prime.

> **BSD conjecture.** The rank $r$ equals the order of vanishing of $L(E, s)$ at $s = 1$.

It is known when that order of vanishing is $0$ or $1$ (Gross–Zagier 1986, Kolyvagin 1989). Rank $2$ and above is open. This is a *local-to-global* statement: counting solutions modulo every prime is supposed to determine the rational solutions.`,
    },
    {
      kind: 'explain',
      title: '5. The Hodge conjecture',
      body: String.raw`Take a smooth projective complex variety $X$ — roughly, a smooth shape cut out by polynomial equations in complex projective space. Two kinds of object live on it:

- **Algebraic cycles:** subvarieties, themselves cut out by polynomials. Concrete, geometric.
- **Cohomology classes:** topological invariants of $X$, in the sense of [topology](@math/topology-intro). On a complex variety these split by "type", and some rational classes have type $(p,p)$; these are called **Hodge classes**.

Every algebraic cycle gives a Hodge class.

> **Hodge conjecture.** Every Hodge class on a smooth projective complex variety is a rational linear combination of classes coming from algebraic cycles.

In words: every topological feature that *looks* as though it could be cut out by equations really is, up to rational multiples. It is known in low degrees and for special classes of varieties, and open in general.`,
    },
    {
      kind: 'explain',
      title: '6. The one that sounds easy',
      body: String.raw`Pick a positive integer. If it is even, halve it. If it is odd, triple it and add one. Repeat.

$$7 \to 22 \to 11 \to 34 \to 17 \to 52 \to 26 \to 13 \to 40 \to 20 \to 10 \to 5 \to 16 \to 8 \to 4 \to 2 \to 1$$

> **Collatz conjecture.** Every positive integer eventually reaches 1.

Every integer up to roughly $2.95 \times 10^{20}$ has been checked (Barina, 2020). Nobody can prove it. Paul Erdős reportedly said mathematics is not yet ready for such problems.

Look at the two orbits below. Nothing about a starting value tells you how far it will wander: 7 drops to 1 in sixteen steps, while 27 — barely larger — climbs to 9,232 before it finally falls. There is no quantity that decreases along every orbit, and finding one is essentially the whole problem.

The closest result is Terence Tao's (2022): *almost all* starting values — in the sense of logarithmic density, all but a vanishingly small proportion — eventually reach a value smaller than any function growing to infinity you like. That is a real theorem and it is still not the conjecture, because "almost all" leaves infinitely many integers unaccounted for.`,
      widget: { type: 'SvgDiagram', props: { svg: collatzSvg } },
    },
    {
      kind: 'numeric',
      prompt: String.raw`Starting from $n = 6$, how many steps of the Collatz map does it take to reach 1? (One step is "halve" or "triple and add one".)`,
      answer: 8,
      why: String.raw`$6 \to 3 \to 10 \to 5 \to 16 \to 8 \to 4 \to 2 \to 1$ — that is 8 arrows. Short orbits like this are why the conjecture looks tractable; the orbit of 27 takes 111 steps and climbs above 9{,}000 first, which is a hint of why no simple decreasing quantity exists.`,
    },
    {
      kind: 'explain',
      title: 'And one that is not a problem at all',
      body: String.raw`The **Langlands programme** is often listed with the problems above, but it is a different kind of object: a web of conjectured correspondences, proposed by Robert Langlands in a 1967 letter to André Weil, linking

- **Galois representations** — symmetries of number fields, in the spirit of [Galois theory](@math/galois-intro), recorded as matrices (see [representations](@math/representations-intro)), with
- **automorphic forms** — highly symmetric functions on certain geometric spaces.

Fermat's Last Theorem was settled by proving one instance of this kind of correspondence. The analogue over function fields was proved by Drinfeld and by Laurent Lafforgue. A proof of one form of the geometric Langlands conjecture (the de Rham version, in characteristic zero) was announced in 2024 in a series of long preprints by Gaitsgory, Raskin and collaborators; a result of this length takes the community years to digest, so check the current status before quoting it.

There is no single sentence whose proof would "solve Langlands". When you read that someone "proved Langlands", check which case.`,
    },
    {
      kind: 'multi',
      prompt: 'Which of these statements are precise enough that you could in principle recognise a correct solution?',
      choices: [
        'Every non-trivial zero of ζ has real part 1/2.',
        'Understand the deep connection between number theory and geometry.',
        'Every positive integer’s Collatz orbit reaches 1.',
        'For any smooth, fast-decaying, divergence-free initial velocity on ℝ³, a smooth Navier–Stokes solution exists for all time.',
        'Develop better tools for studying automorphic forms.',
        'There are infinitely many primes p such that p + 2 is prime.',
      ],
      answers: [0, 2, 3, 5],
      why: String.raw`A usable open problem is a single assertion that is either true or false. "Understand the connection" and "develop better tools" name research directions: no artefact could be checked against them. The other four each have a clear falsifier — one off-line zero, one divergent orbit, one blow-up solution, or a largest twin prime pair.`,
    },
    {
      kind: 'match',
      prompt: 'Match each open problem to what a *disproof* would look like.',
      pairs: [
        ['Riemann hypothesis', 'A single zero of ζ in the strip with real part ≠ 1/2'],
        ['Collatz conjecture', 'One starting integer whose orbit never reaches 1'],
        ['Navier–Stokes regularity', 'Smooth initial data whose solution blows up in finite time'],
        ['P ≠ NP', 'A polynomial-time algorithm for one NP-complete problem'],
      ],
      why: String.raw`Each of these is refutable by a single object, which is what makes them problems rather than programmes. Note the asymmetry: the counterexamples are finite, checkable things, while the proofs would have to cover infinitely many cases at once. That asymmetry is the subject of the next lesson.`,
    },
    {
      kind: 'order',
      prompt: 'Order these by how much of the statement is currently proved, from "most is known" to "least is known".',
      steps: [
        'Prime number theorem: π(x) ~ li(x). Proved in 1896.',
        'Bounded gaps: infinitely many prime pairs differ by at most 246. Proved 2013–14.',
        'Twin primes: infinitely many prime pairs differ by exactly 2. Open.',
        'Goldbach: every even number above 2 is a sum of two primes. Open, verified past 4 × 10¹⁸.',
        'Collatz: every orbit reaches 1. Open, with only an "almost all" result.',
      ],
      why: String.raw`The first two are theorems. Twin primes is the remaining step of the bounded-gaps programme, so a great deal of machinery already points at it. Goldbach has strong partial results of a different shape (every odd number above 5 is a sum of three primes: Vinogradov for large numbers, Helfgott 2013 for all). Collatz has the least structure of all: no generating function, no $L$-function, no sieve. The order of the last three is a judgement call about how much machinery exists, not a theorem.`,
    },
    {
      kind: 'explain',
      title: 'Key takeaways',
      body: String.raw`- An open problem is a **precise assertion** with a recognisable solution and, usually, a single-object counterexample.
- **RH:** all non-trivial zeros of $\zeta$ have real part $1/2$; equivalent to the sharpest possible error term for the prime counting function.
- **P vs NP:** proving equality needs one algorithm; proving inequality needs a lower bound over all possible algorithms.
- **Navier–Stokes:** does smooth 3D data stay smooth forever? Known in 2D since the mid-twentieth century.
- **BSD** and **Hodge** are both local-to-global: they claim that easily-computed local data determines hard global structure.
- **Collatz** is the warning that simple statements are not simple problems. Verification to $2.95\times10^{20}$ is not a proof.
- The **Langlands programme** is a web of conjectures, not one problem — always ask which case.

Next: [why these problems are hard](@math/frontier-why-hard).`,
    },
  ],
  references: [
    { authors: 'L. Schoenfeld', title: 'Sharper bounds for the Chebyshev functions θ(x) and ψ(x). II', year: 1976, venue: 'Mathematics of Computation 30(134), 337–360' },
    { authors: 'Clay Mathematics Institute', title: 'The Millennium Prize Problems: official problem descriptions', year: 2000, venue: 'Clay Mathematics Institute', url: 'https://www.claymath.org/millennium-problems/' },
    { authors: 'E. Bombieri', title: 'Problems of the Millennium: the Riemann Hypothesis', year: 2000, venue: 'Clay Mathematics Institute official problem description' },
    { authors: 'C. L. Fefferman', title: 'Existence and smoothness of the Navier–Stokes equation', year: 2000, venue: 'Clay Mathematics Institute official problem description' },
    { authors: 'J. C. Lagarias', title: 'The 3x+1 problem and its generalizations', year: 1985, venue: 'American Mathematical Monthly 92(1), 3–23' },
    { authors: 'T. Tao', title: 'Almost all orbits of the Collatz map attain almost bounded values', year: 2022, venue: 'Forum of Mathematics, Pi 10, e12' },
  ],
} satisfies LessonContent;
