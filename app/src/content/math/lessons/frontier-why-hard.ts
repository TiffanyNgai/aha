import type { LessonContent } from '../../types';

const blockerRows: [string, string][] = [
  ['Nothing to build with', 'BSD in rank ≥ 2, Hodge'],
  ['A theorem saying your method cannot work', 'P vs NP, twin primes'],
  ['What you control is too weak', 'Navier–Stokes'],
  ['No structure of any kind', 'Collatz'],
  ['The analogue needs an ingredient we lack', 'Riemann, Langlands'],
];
const blockerSvg = `<svg viewBox="0 0 320 ${30 + blockerRows.length * 28}" xmlns="http://www.w3.org/2000/svg" font-family="inherit">
  <text x="6" y="12" font-size="10" fill="var(--fg)">Five different reasons a problem stays open</text>
  ${blockerRows.map(([kind, who], i) => {
    const y = 30 + i * 28;
    return `<g>
      <rect x="6" y="${y - 10}" width="188" height="22" rx="4" fill="var(--c2)" fill-opacity="0.12" stroke="var(--c2)" stroke-width="0.8"/>
      <text x="14" y="${y + 4}" font-size="9" fill="var(--fg)">${kind}</text>
      <line x1="196" y1="${y + 1}" x2="210" y2="${y + 1}" stroke="var(--muted)" stroke-width="1"/>
      <circle cx="213" cy="${y + 1}" r="2.5" fill="var(--c5)">
        <animate attributeName="opacity" values="0.3;1;0.3" dur="2.4s" begin="${i * 0.35}s" repeatCount="indefinite"/>
      </circle>
      <text x="220" y="${y + 4}" font-size="9" fill="var(--c3)">${who}</text>
    </g>`;
  }).join('')}
</svg>`;

const scaleSvg = `<svg viewBox="0 0 320 170" xmlns="http://www.w3.org/2000/svg" font-family="inherit">
  <text x="6" y="12" font-size="10" fill="var(--fg)">Zooming in: the budget shrinks, the trouble does not</text>
  ${[0, 1, 2].map((i) => {
    const x = 18 + i * 100;
    const side = 64;
    const lam = [1, 10, 100][i];
    const bar = [52, 5.2, 0.52][i];
    return `<g>
      <rect x="${x}" y="28" width="${side}" height="${side}" fill="none" stroke="var(--c2)" stroke-width="1.2"/>
      <text x="${x + side / 2}" y="24" text-anchor="middle" font-size="9" fill="var(--muted)">zoom ×${lam}</text>
      ${[0, 1, 2, 3].map((k) => `<circle cx="${x + 10 + k * 15}" cy="${46 + (k % 2) * 18}" r="${4.5 - i * 1.2}" fill="var(--c5)" fill-opacity="0.5">
        <animate attributeName="cy" values="${46 + (k % 2) * 18};${52 + (k % 2) * 10};${46 + (k % 2) * 18}" dur="${2 + k * 0.3}s" repeatCount="indefinite"/>
      </circle>`).join('')}
      <rect x="${x}" y="104" width="52" height="9" fill="var(--grid)"/>
      <rect x="${x}" y="104" width="${bar}" height="9" fill="var(--c3)"/>
      <text x="${x}" y="126" font-size="8.5" fill="var(--c3)">energy ×${[1, 0.1, 0.01][i]}</text>
      <text x="${x}" y="138" font-size="8.5" fill="var(--c5)">stretching: unchanged</text>
    </g>`;
  }).join('')}
  <text x="6" y="158" font-size="9" fill="var(--fg)">The one quantity conserved for all time becomes useless at small scales.</text>
  <text x="6" y="168" font-size="9" fill="var(--muted)">That is what "supercritical" means.</text>
</svg>`;

export default {
  cards: [
    {
      kind: 'explain',
      title: 'Hard is a technical word here',
      body: String.raw`"Why is the Riemann hypothesis hard?" has a better answer than "because nobody is clever enough". For most of the problems in the [previous lesson](@math/frontier-open-problems) there is a specific, identifiable thing that is missing — and often a **theorem** saying that a whole family of methods cannot supply it.

That is one of the stranger achievements of the last fifty years: mathematics has learned to prove negative results about *proof techniques themselves*. A **barrier theorem** says "no argument of this shape can settle this question". Barriers do not make a problem unsolvable. They tell you where not to look.

This lesson takes the problems one at a time: the blocker, what has been tried, what partly worked, and why it stopped.`,
      widget: { type: 'SvgDiagram', props: { svg: blockerSvg } },
    },
    {
      kind: 'explain',
      title: 'Riemann: three roads, all short — and a twin-prime wall',
      body: String.raw`Serious attacks on RH have come from three directions, and each one gets somewhere and then stops.

**Count the zeros on the line.** Atle Selberg showed in 1942 that a positive proportion of zeros lie on the critical line. Norman Levinson pushed this to one third in 1974; Brian Conrey reached more than two fifths in 1989; and Kyle Pratt, Nicolas Robles, Alexandru Zaharescu and Dirk Zeindler pushed it to a little above five twelfths — about 41.7% — in a 2020 paper (*Research in the Mathematical Sciences* 7, article 2). The method counts, it does not exclude: going from "at least 41.7%" to "100%" is not more of the same.

**Copy the proof that works.** There is a version of RH for curves over finite fields, and it is a **theorem** — André Weil proved it in 1948, and Pierre Deligne completed the Weil conjectures in higher dimensions in 1974. In that setting you have a geometric object whose cohomology is finite-dimensional, with a symmetry (Frobenius) whose eigenvalues *are* the zeros. Over the integers nobody has found the corresponding geometry. Christopher Deninger and others have programmes aimed at building one; none has produced it.

**Find the operator.** The Hilbert–Pólya idea is that the zeros are eigenvalues of some self-adjoint operator, which would force them onto a line automatically. Hugh Montgomery's 1973 calculation of how zeros are spaced, and Andrew Odlyzko's 1987 numerics, matched the statistics of random Hermitian matrices astonishingly well. Michael Berry and Jonathan Keating proposed what the operator's classical mechanics would look like. Nobody has built the operator.

**And for twin primes the ceiling is itself a theorem.** Sieve methods cross out integers divisible by small primes; Atle Selberg observed that the resulting estimates cannot distinguish numbers with an **even** number of prime factors from those with an **odd** number. This is the **parity problem**, and it is why bounded gaps stalled at 246 instead of marching down to 2 — "$n$ and $n+2$ are both prime" is the kind of statement the parity barrier blocks. The circle method, the other great tool here, needs its "minor arcs" to be provably small, which nobody can arrange for a problem with so few variables.`,
    },
    {
      kind: 'explain',
      title: 'When the numbers lie',
      body: String.raw`The first $10^{13}$ zeros of $\zeta$ are all on the critical line. Every integer up to about $2.95 \times 10^{20}$ obeys Collatz. It is worth knowing how little that kind of evidence has been worth before.

- **Littlewood, 1914.** $\pi(x) - \mathrm{li}(x)$ is negative for every $x$ anyone has ever computed. Littlewood proved it changes sign infinitely often. Stanley Skewes later gave a first bound on where — an astronomically large number.
- **The Pólya conjecture** (1919) says that up to any $x \ge 2$, at least half the integers have an odd number of prime factors, counted with multiplicity. C. B. Haselgrove disproved it in 1958; the smallest counterexample, found by Minoru Tanaka in 1980, is 906,150,257.
- **The Mertens conjecture** (1897) survived checks into the billions. Andrew Odlyzko and Herman te Riele disproved it in 1985 — and their disproof is *non-constructive*. No explicit counterexample is known even now. Direct computation has confirmed the conjectured inequality for every $x$ up to $10^{16}$ (Greg Hurst, 2018), while the proved upper bounds on where the first counterexample must sit are astronomical: Tadej Kotnik and te Riele put it below $\exp(1.59 \times 10^{40})$ in 2006, and later work has cut that exponent without bringing it within reach of any computer.

In each case the statement failed where no computation could reach. Verification rules out what it covers. It says nothing about the rest.`,
    },
    {
      kind: 'mcq',
      prompt: String.raw`A colleague argues: "The first $10^{13}$ zeros of $\zeta$ are on the critical line. That is overwhelming evidence — if RH were false, a counterexample would almost certainly have shown up by now." How should you respond?`,
      choices: [
        'Agreed: at that scale, the absence of a counterexample makes RH near-certain.',
        'The computation rules out counterexamples in the range covered, and nothing more. In number theory the first counterexample to a plausible statement is repeatedly found to lie far beyond any feasible computation.',
        'The computation is worthless, because no finite check can bear on an infinite statement.',
        'By analogy with the Mertens conjecture, the evidence suggests RH is probably false.',
      ],
      answer: 1,
      why: String.raw`Mertens, Pólya and Littlewood's sign change are three cases where a statement checked into the billions turned out to be false somewhere unreachable. That does not make finite verification useless — it genuinely eliminates a range, and a counterexample found tomorrow would settle the problem in an afternoon. It just does not transfer probability to the uncountably many untested cases. Nor does one failed analogy make RH likely to be false; most experts expect RH to be true, on structural grounds rather than counting grounds.`,
    },
    {
      kind: 'explain',
      title: 'P vs NP: the lower-bound famine',
      body: String.raw`To prove $\mathrm{P} \ne \mathrm{NP}$ you must show that *no algorithm whatsoever* solves some NP problem quickly. The standard way to say "no algorithm whatsoever" is to talk about **Boolean circuits**: a circuit is a fixed network of AND, OR and NOT gates computing one output from $n$ input bits, and any algorithm running in time $T$ on inputs of length $n$ turns into a circuit with about $T \log T$ gates. So a proof that some NP problem needs superpolynomially many gates would do it.

Here is the state of that effort. The best proved lower bound on general circuit size for an explicit function is **linear** in $n$ — Norbert Blum got $3n - o(n)$ in 1984, and the record has since crept up only by fractions: Magnus Find, Alexander Golovnev, Edward Hirsch and Alexander Kulikov reached $\left(3 + \tfrac{1}{86}\right)n - o(n)$ in 2016, for a function called an affine disperser, and Jiatu Li and Tianqi Yang reached $3.1n - o(n)$ in 2022. We need superpolynomial. Nobody can currently rule out that every problem in NP has circuits of size $10n$.

That gap is not for want of trying. It is the subject of three barrier theorems.`,
    },
    {
      kind: 'widget',
      title: 'Barrier 1: relativisation',
      body: String.raw`In 1975 Theodore Baker, John Gill and Robert Solovay ruled out the most natural technique in a short paper. An **oracle** is a free subroutine: give every machine a magic box answering membership questions about a fixed set $A$, and write $\mathrm{P}^A$, $\mathrm{NP}^A$ for the resulting classes.`,
      widget: {
        type: 'StepReveal',
        props: {
          steps: [
            String.raw`**Diagonalisation** is the classic technique for separating complexity classes. It is how we know the halting problem is undecidable, and how the time hierarchy theorem is proved: build a machine that deliberately disagrees with every machine on some input.`,
            String.raw`Diagonalisation **relativises**: the argument never looks inside a machine, only simulates it. Hand every machine the same oracle and the proof goes through word for word.`,
            String.raw`Baker, Gill and Solovay built an oracle $A$ with $\mathrm{P}^{A} = \mathrm{NP}^{A}$ — a set so powerful that guessing buys you nothing.`,
            String.raw`They built a second oracle $B$ with $\mathrm{P}^{B} \ne \mathrm{NP}^{B}$ — a set encoding a needle you can guess at but must search for.`,
            String.raw`So the statement "$\mathrm{P} = \mathrm{NP}$" is **true relative to some oracles and false relative to others**.`,
            String.raw`Therefore no relativising argument can decide it. Any proof must do something diagonalisation never does: look at the actual structure of the computation.`,
          ],
          notes: [
            'The hierarchy theorems are the reason anyone hoped diagonalisation would be enough.',
            'This is exactly why the technique is so general — and why it is too general.',
            'Take A to be a PSPACE-complete set: both classes collapse to PSPACE.',
            'B is built by diagonalisation itself, choosing strings to withhold from any machine that looks for them.',
            '',
            'Scott Aaronson and Avi Wigderson extended this in 2008 (journal version 2009) to "algebrization", which also rules out the arithmetisation technique behind IP = PSPACE.',
          ],
        },
      },
    },
    {
      kind: 'explain',
      title: 'Barrier 2: natural proofs',
      body: String.raw`The second barrier, due to Alexander Razborov and Steven Rudich — announced in 1994 and published in full in 1997 — is stranger and sharper. Most circuit lower bounds work by finding a **property** of Boolean functions: something that the hard function has and that small circuits cannot have.

Razborov and Rudich noticed that essentially all known such properties are *constructive* (you can test for the property efficiently, given the function's full truth table) and *large* (a sizeable fraction of all functions have it). They called such a property **natural**, and proved: a natural property that excludes small circuits would also be an efficient test distinguishing a genuinely random function from one generated by a small circuit — which is precisely what a cryptographic pseudorandom generator must not permit.

So a natural proof of $\mathrm{P} \ne \mathrm{NP}$ would break sufficiently strong versions of the hardness assumptions (like the hardness of factoring) that most people cite as evidence *for* $\mathrm{P} \ne \mathrm{NP}$. The technique would refute the belief it was trying to support.`,
    },
    {
      kind: 'order',
      prompt: 'Put the steps of the Razborov–Rudich argument into logical order.',
      steps: [
        'Suppose you have a property of Boolean functions that you can test efficiently from the truth table, and that a large fraction of all functions possess.',
        'Suppose, as a lower-bound proof of this shape requires, that no function computable by a small circuit has the property.',
        'Then the property is an efficient test that says "random" for most random functions and "not random" for anything a small circuit produces.',
        'But a pseudorandom function generator is built from small circuits and is supposed to pass every efficient test of exactly this kind.',
        'So the property breaks all such generators, and with them standard hardness assumptions such as the hardness of factoring.',
        'Hence a proof of this shape would undermine the very assumptions usually offered as evidence that P ≠ NP.',
      ],
      why: String.raw`The sting is in the last two steps. The theorem does not say the property cannot exist; it says its existence has a consequence almost everyone in the field would reject. Note also what escapes the barrier: a property that is *not* large, or not efficiently testable. Ryan Williams's 2011 proof that NEXP has no ACC⁰ circuits (of polynomial size) is generally regarded as evading the barriers, by a different route: it turns a faster-than-brute-force satisfiability algorithm into a lower bound. It only separates NEXP from a restricted class, a long way from P vs NP.`,
    },
    {
      kind: 'multi',
      prompt: String.raw`A student proposes four plans for proving $\mathrm{P} \ne \mathrm{NP}$. Which ones are already known, by a published barrier theorem, to be insufficient on their own?`,
      choices: [
        'Diagonalise: construct a problem that differs from the output of every polynomial-time machine, in the style of the undecidability of the halting problem.',
        'Find a property of Boolean functions that is testable from the truth table, held by most functions, and held by no function with a small circuit.',
        'Turn circuits into low-degree polynomials and argue as in the proof that IP = PSPACE.',
        'Turn a faster-than-brute-force satisfiability algorithm for a restricted circuit class into a circuit lower bound, in the style of Ryan Williams’s 2011 result against ACC⁰ circuits.',
      ],
      why: String.raw`Diagonalisation relativises, so Baker–Gill–Solovay rules it out. The truth-table property is precisely a natural property, so Razborov–Rudich rules it out. Arithmetisation is covered by Aaronson and Wigderson's algebrization barrier. The remaining plan describes Williams's algorithmic method, which is not covered by those barrier theorems and is generally regarded as evading them; it has so far reached only a restricted circuit class.`,
      answers: [0, 1, 2],
    },
    {
      kind: 'explain',
      title: 'Navier–Stokes: controlling the wrong thing',
      body: String.raw`The fluid equations have a scaling symmetry: if $u(x,t)$ is a solution then so is
$$u_\lambda(x,t) = \lambda\, u(\lambda x, \lambda^{2} t),$$
which is the same flow viewed through a microscope of magnification $\lambda$. A blow-up, if it happens, happens by energy cascading down to smaller and smaller scales, so this symmetry is the right lens.

The only quantity we can control for *all* time is the kinetic energy $\int |u|^{2}\,dx$. Work out how it scales and you find it goes **down** like $1/\lambda$ as you zoom in. The nonlinear term that does the damage does not. So the single guarantee we hold becomes weaker and weaker exactly where the danger is. Terence Tao calls this the **supercriticality** of the problem, and treats it as the central obstruction.

In two dimensions the arithmetic comes out differently and energy is enough; that is why 2D was settled in the mid-twentieth century and 3D was not.`,
      widget: { type: 'SvgDiagram', props: { svg: scaleSvg } },
    },
    {
      kind: 'numeric',
      prompt: String.raw`Using $u_\lambda(x,t) = \lambda\,u(\lambda x, \lambda^{2} t)$ on $\mathbb{R}^{3}$, suppose you zoom in by $\lambda = 100$. By what factor is the kinetic energy $\int_{\mathbb{R}^3} |u_\lambda|^{2}\,dx$ multiplied, compared with $\int |u|^{2}\,dx$?`,
      answer: 0.01,
      tolerance: 0.0001,
      why: String.raw`Substituting, $\int |\lambda u(\lambda x)|^{2} dx = \lambda^{2}\int |u(\lambda x)|^{2} dx$, and changing variables $y = \lambda x$ in three dimensions contributes $\lambda^{-3}$. So the energy scales as $\lambda^{2-3} = \lambda^{-1}$, giving $1/100 = 0.01$. That negative exponent is the whole problem: zoom in a hundredfold and your one guaranteed bound has shrunk by a hundred, while the stretching term it is supposed to control has not.`,
      unit: '×',
    },
    {
      kind: 'explain',
      title: 'Navier–Stokes: what has been tried',
      body: String.raw`The partial results are good enough to show exactly where the wall is.

- **Jean Leray, 1934.** Weak solutions exist globally in time. But "weak" means they solve the equation only after integrating against test functions, and nothing says they are unique or smooth.
- **Caffarelli, Kohn and Nirenberg, 1982.** The set of space-time points where a suitable weak solution can misbehave has one-dimensional parabolic Hausdorff measure zero. The singular set cannot be a curve in space-time. A single point at a single instant is still allowed.
- **Escauriaza, Seregin and Šverák, 2003.** If the solution's $L^{3}$ norm stays bounded, it stays smooth. This is a *conditional* result at the exact critical scaling — and nobody can prove the hypothesis.
- **Tao, 2016.** He modified the nonlinear term into an "averaged" version with the same energy identity and the same scaling, and proved **that** equation blows up in finite time. The message is a barrier: no argument that uses only the energy identity, the scaling and standard harmonic-analysis estimates can work, because such an argument would also apply to Tao's equation, which is false.
- **Buckmaster and Vicol, 2019.** Using *convex integration* — a technique Nash invented in the 1950s for isometric embeddings — they showed that weak solutions with bounded kinetic energy are not unique. Read the class carefully: their solutions do **not** satisfy Leray's energy inequality, so they are not Leray–Hopf solutions, and uniqueness within the Leray–Hopf class is still open. What they do show is that the bare weak formulation is far too loose to pin a solution down on its own.

Real movement has come in the related **Euler** equations, where viscosity is switched off: Tarek Elgindi proved finite-time singularity formation (*Annals of Mathematics*, 2021) for velocity fields that are only $C^{1,\alpha}$ — differentiable with Hölder-continuous derivative, rather than infinitely smooth — and Jiajie Chen and Thomas Hou posted a computer-assisted proof in 2022 of finite-time, nearly self-similar blow-up for the 3D axisymmetric Euler equations in a bounded domain; as with any very long computer-assisted proof, independent verification takes time, so check its current status. If correct, these are genuine singularities, and neither is the Millennium problem: Euler is not Navier–Stokes, the general smooth-data Euler question is itself still open, and viscosity is exactly the term that might save the viscous case.`,
    },
    {
      kind: 'truefalse',
      prompt: String.raw`The Caffarelli–Kohn–Nirenberg theorem bounds the singular set of a suitable weak Navier–Stokes solution to have one-dimensional parabolic Hausdorff measure zero. Since a single space-time point is a set of measure zero, the theorem rules out a solution that first becomes infinite at one point at one instant.`,
      answer: false,
      why: String.raw`It is the other way round. The theorem *excludes* singular sets that are large — a whole curve in space-time, say — by showing the singular set is too small to have positive one-dimensional measure. A solitary point has measure zero, so it passes the test. The most likely shape of a blow-up, if one exists, is precisely the one the theorem permits.`,
    },
    {
      kind: 'explain',
      title: 'Four more shortages',
      body: String.raw`**Birch and Swinnerton-Dyer: no second point.** The conjecture is known when the $L$-function vanishes to order 0 or 1 at $s = 1$ (Benedict Gross and Don Zagier, 1986; Victor Kolyvagin, 1989). That stopping point is not an accident of effort. The proof runs on **Heegner points**, a construction that manufactures a rational point out of modular-curve geometry — and it produces essentially *one* independent point. Rank 2 needs two, and no construction makes them. The precise conjecture also involves the Tate–Shafarevich group, which is not even known to be finite in general.

**Hodge: no cycles.** The shortage is of algebraic cycles to build with. The one general tool is the Lefschetz $(1,1)$ theorem, which settles codimension one; above that the constructions run out, and Grothendieck's "standard conjectures", which also concern algebraic cycles, are open too. With a warning attached: the **integral** version of the Hodge conjecture is *false* (Michael Atiyah and Friedrich Hirzebruch, 1962), and so is the natural extension to compact Kähler manifolds (Claire Voisin, 2002). The surviving statement sits in a narrow gap between two known failures.

**Collatz: no subject.** No generating function, no $L$-function, no group, no sieve — nothing converts the iteration into an object a theory can act on. And there is a barrier: John Conway showed in 1972 that slightly more general maps of the same type (multiplier and shift chosen by the input's residue modulo a fixed $N$) give an **undecidable** reachability question. So any proof must use something specific to 3, 1 and 2.

**Langlands: no single door.** It is not one statement. The function-field case fell — Vladimir Drinfeld for $\mathrm{GL}_2$, Laurent Lafforgue for $\mathrm{GL}_n$ in 2002 — because over a function field there is an actual curve to do geometry on. Over the rationals that curve does not exist, and finding a substitute is the whole difficulty. Local cases have fallen (Michael Harris and Richard Taylor, and independently Guy Henniart, around 2000), and the geometric case was announced proved in 2024 by Dennis Gaitsgory, Sam Raskin and collaborators, in a series of five long preprints; check the current refereeing status before quoting it as settled. The number-field case is open.`,
    },
    {
      kind: 'match',
      prompt: 'Match each problem to the blocker that actually stops progress on it.',
      pairs: [
        ['Twin primes', 'Sieve estimates provably cannot detect the parity of the number of prime factors'],
        ['P ≠ NP', 'Every known technique falls to relativisation, natural proofs or algebrization'],
        ['Navier–Stokes regularity', 'The only quantity controlled for all time gets weaker as you zoom in'],
        ['BSD in rank 2', 'The one construction that produces rational points yields a single independent point'],
        ['Collatz', 'Nearby generalisations of the map are undecidable, so no general method can work'],
      ],
      why: String.raw`These are five genuinely different failure modes, and they call for different responses. Two of them (parity, the complexity barriers) are proved impossibility results about methods. One is a mismatch between what is conserved and what matters. One is a shortage of constructions. One says the problem has no general theory to belong to. Noticing which kind you are facing is most of what strategy means in this business.`,
    },
    {
      kind: 'fill',
      prompt: String.raw`The 1975 theorem of Baker, Gill and Solovay shows that an argument which stays valid when every machine is handed the same ___ cannot settle P vs NP. Razborov and Rudich's 1994 theorem shows that a ___ proof — one using an efficiently testable property that most functions have — would break pseudorandom generators. In fluid dynamics, Navier–Stokes is called ___ because the quantity we can control becomes weaker at small scales.`,
      bank: ['oracle', 'natural', 'supercritical', 'kernel', 'monotone', 'subcritical'],
      answer: ['oracle', 'natural', 'supercritical'],
      why: String.raw`Each word names a barrier rather than a difficulty. "Subcritical" would be the good case, where the controlled quantity grows stronger as you zoom in — that is roughly the two-dimensional situation, and it is why 2D was solved sixty years ago. "Monotone" circuits are a restricted class where strong lower bounds *are* known (Razborov, 1985); those methods have not been made to work for general circuits.`,
    },
    {
      kind: 'explain',
      title: 'Key takeaways',
      body: String.raw`- "Hard" usually means something specific. Ask which of five things is missing: an object to build with, a method not ruled out, a strong enough controlled quantity, any structure at all, or the ingredient that makes the analogue work.
- **RH:** counting arguments reach about 41.7% of zeros and cannot reach 100%; the function-field analogue is a theorem but has a geometry we lack over $\mathbb{Z}$; the Hilbert–Pólya operator has never been built. For twin primes the **parity problem** is a proved ceiling on sieves.
- **Numerical verification is weak evidence.** Mertens, Pólya and Littlewood's sign change all failed beyond computable range.
- **P vs NP** has three barrier theorems: relativisation (Baker–Gill–Solovay 1975), natural proofs (Razborov–Rudich 1994), algebrization (Aaronson–Wigderson 2008/09). Best proved general circuit lower bound for an explicit function: linear in $n$. Needed: superpolynomial.
- **Navier–Stokes** is supercritical — energy scales as $\lambda^{-1}$ under zoom. Tao's 2016 averaged equation proves that energy-and-scaling arguments alone cannot suffice.
- **BSD and Hodge** both lack constructions; the integral Hodge conjecture and the Kähler version are known to be *false*, which should temper confidence.
- **Collatz** has no theory to sit in, and nearby generalisations are undecidable. **Langlands** is a programme; ask which case.
- Barriers are maps, not verdicts. Williams's 2011 ACC⁰ lower bound is generally regarded as slipping past all three complexity barriers, though it proves far less than P ≠ NP.

Next: [ideas borrowed from elsewhere](@math/frontier-cross-field).`,
    },
  ],
  references: [
    { authors: 'K. Pratt, N. Robles, A. Zaharescu, D. Zeindler', title: 'More than five-twelfths of the zeros of ζ are on the critical line', year: 2020, venue: 'Research in the Mathematical Sciences 7, article 2' },
    { authors: 'T. Kotnik, H. J. J. te Riele', title: 'The Mertens conjecture revisited', year: 2006, venue: 'Algorithmic Number Theory (ANTS VII), LNCS 4076, 156–167' },
    { authors: 'S. Aaronson, A. Wigderson', title: 'Algebrization: a new barrier in complexity theory', year: 2009, venue: 'ACM Transactions on Computation Theory 1(1), article 2' },
    { authors: 'T. Baker, J. Gill, R. Solovay', title: 'Relativizations of the P =? NP question', year: 1975, venue: 'SIAM Journal on Computing 4(4), 431–442' },
    { authors: 'A. A. Razborov, S. Rudich', title: 'Natural proofs', year: 1997, venue: 'Journal of Computer and System Sciences 55(1), 24–35' },
    { authors: 'T. Tao', title: 'Finite time blowup for an averaged three-dimensional Navier–Stokes equation', year: 2016, venue: 'Journal of the American Mathematical Society 29(3), 601–674' },
    { authors: 'A. M. Odlyzko, H. J. J. te Riele', title: 'Disproof of the Mertens conjecture', year: 1985, venue: 'Journal für die reine und angewandte Mathematik 357, 138–160' },
    { authors: 'J. B. Conrey', title: 'More than two fifths of the zeros of the Riemann zeta function are on the critical line', year: 1989, venue: 'Journal für die reine und angewandte Mathematik 399, 1–26' },
  ],
} satisfies LessonContent;
