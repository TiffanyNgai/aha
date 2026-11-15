import type { LessonContent } from '../../types';

const rows: [string, string][] = [
  ['1976', 'Four-colour theorem — first big computer-checked proof'],
  ['1995', 'Fermat’s Last Theorem (Wiles; Taylor–Wiles)'],
  ['2002–03', 'Poincaré conjecture — Perelman’s three arXiv preprints'],
  ['2005', 'Kepler conjecture published, with referees “99% certain”'],
  ['2013–14', 'Bounded gaps between primes (Zhang, Maynard, Polymath8)'],
  ['2014', 'Flyspeck: the Kepler proof machine-checked end to end'],
  ['2016–17', 'Sphere packing solved in 8 and 24 dimensions'],
  ['2022', 'Liquid Tensor Experiment: a 2020 result formalised in Lean'],
  ['2021–24', 'Machine-learning-guided conjectures in Nature'],
];
const timelineSvg = `<svg viewBox="0 0 320 ${26 + rows.length * 24}" xmlns="http://www.w3.org/2000/svg" font-family="inherit">
  <text x="6" y="12" font-size="10" fill="var(--fg)">Fifty years of proofs people cannot check by hand</text>
  <line x1="56" y1="22" x2="56" y2="${20 + rows.length * 24}" stroke="var(--grid)" stroke-width="2"/>
  ${rows.map(([yr, txt], i) => {
    const y = 36 + i * 24;
    return `<g>
      <circle cx="56" cy="${y - 4}" r="4" fill="var(--c2)">
        <animate attributeName="r" values="4;6;4" dur="2s" begin="${i * 0.3}s" repeatCount="indefinite"/>
      </circle>
      <text x="48" y="${y}" text-anchor="end" font-size="9" fill="var(--c3)">${yr}</text>
      <text x="66" y="${y}" font-size="9" fill="var(--fg)">${txt}</text>
    </g>`;
  }).join('')}
</svg>`;

export default {
  cards: [
    {
      kind: 'explain',
      title: 'Proofs nobody can read',
      body: String.raw`In 1976 Kenneth Appel and Wolfgang Haken announced that every map can be coloured with four colours so that no two neighbouring countries share a colour. Their argument reduced the problem to roughly 1,900 configurations and then checked each one **by computer**. The case check was too large to redo by hand, and a fully independent re-derivation (Robertson, Sanders, Seymour and Thomas, 1990s) still relied on a computer.

That was the start of something that now defines the frontier of mathematics: arguments that are too long, too intricate, or too computational for one person to verify. Mathematics has had to invent new ways of *trusting* its own results — and, separately, new ways of *finding* them.

This lesson is about what mathematics can reliably do in 2026 that it could not do a generation ago.`,
      widget: { type: 'SvgDiagram', props: { svg: timelineSvg } },
    },
    {
      kind: 'explain',
      title: 'What "proved" means now',
      body: String.raw`A **proof** is a chain of steps, each following from earlier ones by rules nobody disputes. Traditionally the chain lives in a journal article and the check is social: referees and readers.

There is now a second option. A **proof assistant** is a program (Lean, Coq/Rocq, Isabelle) in which you write the chain in a formal language; the program refuses to accept a step that does not follow. Systems of this kind go back to the 1960s and 70s, but only in the last twenty years or so have they been turned on current research mathematics. This is called **formalisation**. The payoff is that trust no longer depends on anyone being clever enough, awake enough or honest enough — only on the small "kernel" of the program being correct.

The price is labour. Formalising a research paper has typically cost months to years of human effort.`,
    },
    {
      kind: 'widget',
      title: 'What the machine actually checks',
      body: String.raw`A proof assistant does **not** find proofs for you (mostly). It checks them. Here is the pipeline, using the four-colour theorem as the example — Georges Gonthier finished a fully formal version in Coq in 2005, published in 2008.`,
      widget: {
        type: 'StepReveal',
        props: {
          steps: [
            String.raw`**State the theorem formally.** Define "planar graph" and "4-colouring" inside the system. This step alone is where most errors of *meaning* hide: if you formalise the wrong statement, the machine will happily verify it.`,
            String.raw`**Build the library.** Everything the proof uses — graphs, induction, finite sets — must already exist as checked definitions and lemmas. Shared libraries like Lean's *mathlib* exist for exactly this.`,
            String.raw`**Write the argument** as a term the system can type-check, usually with the help of tactics that automate routine steps.`,
            String.raw`**Replace the computer search** by a verified program: instead of "we ran code and it said yes", the case analysis itself is a function whose correctness is proved inside the system.`,
            String.raw`**The kernel checks it.** A small, deliberately simple piece of code read the finished term and accepts or rejects it. Only that kernel has to be trusted.`,
          ],
          notes: [
            'Formalisation moves the risk from "is the argument right?" to "did we state the right thing?"',
            'mathlib is a single shared library of formalised mathematics, with well over a million lines contributed by hundreds of people.',
            '',
            'This is why computer-assisted proofs and formal proofs are different ideas — Appel–Haken had the first, not the second.',
            'A bug in the kernel would be catastrophic, so kernels are kept deliberately tiny.',
          ],
        },
      },
    },
    {
      kind: 'mcq',
      prompt: String.raw`Thomas Hales proved the Kepler conjecture (no packing of equal spheres beats the grocer's orange stack) in 1998; the *Annals of Mathematics* published it in 2005 after referees said they were "99% certain" but could not fully check the computations. Hales then led the **Flyspeck** project, which produced a machine-checked proof in 2014. What did Flyspeck change?`,
      choices: [
        'It made the result more general, covering unequal spheres as well.',
        'It removed the reliance on referees being able to check the computer calculations, by having the calculations themselves verified inside a proof assistant.',
        'It shortened the proof so that a single mathematician could read it in a week.',
        'It showed that the 1998 proof had been wrong.',
      ],
      answer: 1,
      why: String.raw`Flyspeck did not change the statement, shorten the argument, or overturn it — the formal proof is far *longer* than the paper, and took about eleven years and many contributors. What it changed is the basis for believing it: the nonlinear inequalities that referees could not audit are now checked by the proof assistant's kernel.`,
    },
    {
      kind: 'explain',
      title: 'Landmarks that actually fell',
      body: String.raw`Formalisation is about trust. Separately, several problems that had been open for a very long time were genuinely **solved** in the last thirty years:

- **Fermat's Last Theorem** (1637 → 1995). Andrew Wiles, with a joint paper with Richard Taylor repairing a gap found in 1993, proved enough of the modularity conjecture for elliptic curves to settle it.
- **The Poincaré conjecture** (1904 → 2003). Grigori Perelman posted three preprints to arXiv — never a journal — completing Richard Hamilton's Ricci flow programme. Teams spent three years writing out the details before the community accepted it.
- **Sphere packing in 8 and 24 dimensions** (2016). Maryna Viazovska found the right "magic function" in dimension 8; within a week she and four co-authors did dimension 24. Dimensions 4 and 5 are still open.`,
    },
    {
      kind: 'truefalse',
      prompt: String.raw`Perelman's solution of the Poincaré conjecture was accepted as soon as the preprints appeared, because arXiv papers are peer-reviewed before posting.`,
      answer: false,
      why: String.raw`arXiv is a preprint server: submissions are moderated for scope and obvious crankery, not refereed. Perelman's three 2002–03 preprints were terse, and acceptance came only after several independent teams spent roughly three years writing out full expositions.`,
    },
    {
      kind: 'explain',
      title: 'Prime gaps: a frontier that moved in public',
      body: String.raw`The **twin prime conjecture** says there are infinitely many primes $p$ with $p + 2$ also prime. Nobody has proved it. But in 2013 Yitang Zhang, then little known, proved something nobody had: there is **some** finite $H$ such that infinitely many pairs of primes differ by at most $H$. His $H$ was $70{,}000{,}000$.

Within months the bound collapsed. James Maynard (and independently Terence Tao) found a different, simpler method; the **Polymath8** open online collaboration combined the ideas. The best unconditional bound is $246$ — reached in 2014, and has not been improved in the literature we are aware of — check before quoting it as current.

Note the shape of the progress: from "no finite bound at all" to 246 is enormous; from 246 to 2 is a different problem entirely.`,
    },
    {
      kind: 'numeric',
      prompt: String.raw`Zhang's 2013 bound on the gap was $H = 70{,}000{,}000$ and the Polymath8 bound is $H = 246$. By what factor, to the nearest whole number, did the bound shrink?`,
      answer: 284553,
      tolerance: 2,
      unit: '×',
      why: String.raw`$70{,}000{,}000 / 246 \approx 284{,}552.8$. The point of the arithmetic is the sense of scale: a year of intense public collaboration moved the bound by five orders of magnitude, and then stopped. Known barriers (the "parity problem" in sieve theory) mean the remaining factor of 123 is harder than everything before it.`,
    },
    {
      kind: 'explain',
      title: 'Research in the open',
      body: String.raw`In January 2009 Timothy Gowers asked on his blog whether a hard problem could be solved by massively collaborative public comment threads. The first **Polymath** project found a new, elementary proof of the density Hales–Jewett theorem in about seven weeks; it was published under the collective pseudonym "D. H. J. Polymath".

What Polymath demonstrated is narrower than it is sometimes reported to be. It works well when a problem decomposes into many checkable sub-tasks, and when a few experts anchor the thread. It has not replaced solitary work: most Polymath projects produced partial results, and the most spectacular recent advances (Zhang, Viazovska) came from individuals working alone.`,
    },
    {
      kind: 'explain',
      title: 'Machines that suggest, humans that prove',
      body: String.raw`Since 2021 machine learning has started to contribute to pure mathematics — in a specific and limited way.

- **Guiding intuition** (Davies et al., *Nature* 2021). Neural networks were trained to predict one invariant of a mathematical object from others. Looking at *which inputs the network relied on* suggested two conjectures, in knot theory and in representation theory. Mathematicians then proved the knot-theory one by hand.
- **Program search** (Romera-Paredes et al., *Nature* 2024, "FunSearch"). A language model proposes short programs that construct combinatorial objects; a verifier scores them; the best are fed back. This produced a new record construction for the cap set problem — a genuine new object, found by search, and checkable in seconds.
- **Algorithm discovery** (Fawzi et al., *Nature* 2022, "AlphaTensor"). Reinforcement learning found matrix-multiplication schemes using fewer multiplications than previously known ones in some small cases.

In all three, the machine produced a *candidate* and a human or a verifier established correctness. None of them produced an accepted proof of an open conjecture on its own.`,
    },
    {
      kind: 'mcq',
      prompt: String.raw`A colleague says: "AI has started proving theorems — a neural network proved a new result in knot theory in 2021." What is the accurate version of that claim?`,
      choices: [
        'A network was trained to predict a knot invariant; inspecting which features it used suggested a relationship, which mathematicians then stated and proved themselves.',
        'A network searched a space of formal proofs and output a complete machine-checked proof of a previously open conjecture.',
        'A network was given the conjecture and produced an English-language proof that referees accepted.',
        'Nothing happened; the report was later retracted.',
      ],
      answer: 0,
      why: String.raw`The *Nature* 2021 work is explicitly framed as guiding human intuition: the model's role was to reveal that certain geometric invariants carried information about the signature of a knot, and attribution analysis pointed at which ones. The theorem and its proof were human work. Saying the network "proved" it overstates what happened; saying nothing happened understates it.`,
    },
    {
      kind: 'explain',
      title: 'Competition problems are not research problems',
      body: String.raw`In 2024 Google DeepMind reported that a pair of systems — AlphaProof for algebra and number theory, AlphaGeometry 2 for geometry — scored at silver-medal level on that year's International Mathematical Olympiad problems, with extra computation time. In 2025 several groups reported gold-medal-level performance.

Take these seriously and read them narrowly. Olympiad problems have a known, short answer, a fixed format, and a guarantee that a solution exists using school-level tools. Research problems have none of those. As of 2026 the honest summary is: machine systems are strong at *bounded search for a known-to-exist argument*, and unproven at *deciding what is worth proving*. Several of these results were announced by the developing labs before independent refereeing, which is a reason to quote them with the date and the source attached.`,
    },
    {
      kind: 'multi',
      prompt: 'Which of these are *demonstrated* (there is a specific, checkable artefact), rather than claimed or hoped for?',
      choices: [
        'A machine-checked proof of the Kepler conjecture exists.',
        'There are infinitely many pairs of primes differing by at most 246.',
        'There are infinitely many pairs of primes differing by exactly 2.',
        'The densest packing of equal spheres in 8 dimensions is known.',
        'Machine learning systems can independently formulate and prove open research conjectures.',
        'A formal proof assistant can verify an argument without a human reading it.',
      ],
      answers: [0, 1, 3, 5],
      why: String.raw`Flyspeck (2014), Polymath8's bound of 246, and Viazovska's dimension-8 theorem (2017) are each a specific published artefact. Proof assistants verify arguments routinely. Twin primes — gap exactly 2 — remains open, and no machine learning system has independently formulated *and* proved an open research conjecture; the 2021–24 results all had a human or an external verifier closing the loop.`,
    },
    {
      kind: 'match',
      prompt: 'Match each advance to the kind of evidence that supports it.',
      pairs: [
        ['Four-colour theorem (1976)', 'A human argument plus an unverified computer case check'],
        ['Flyspeck (2014)', 'A proof term accepted by a proof assistant’s kernel'],
        ['Poincaré conjecture (2003)', 'Preprints, then years of expository work by independent teams'],
        ['FunSearch cap-set construction (2024)', 'A concrete object produced by search and checked directly'],
      ],
      why: String.raw`These are four genuinely different standards of evidence. Appel–Haken's case check was code nobody independently re-derived; Flyspeck replaced it with a kernel-checked term; Perelman's work was validated socially; FunSearch's output needs no trust in the search at all, because the object it found can be verified on its own.`,
    },
    {
      kind: 'fill',
      prompt: String.raw`A ___ proof is one whose every step has been accepted by a proof assistant's kernel. A ___ proof uses a program to settle some cases but leaves that program unverified. Peter Scholze's 2020 challenge, the ___ Tensor Experiment, was of the first kind and was completed in 2022.`,
      bank: ['formal', 'computer-assisted', 'Liquid', 'probabilistic', 'Solid', 'constructive'],
      answer: ['formal', 'computer-assisted', 'Liquid'],
      why: String.raw`Scholze asked publicly whether a recent and technically brutal theorem of his (with Dustin Clausen) could be formalised, because he was not certain it was correct. A team led by Johan Commelin completed it in Lean in 2022. The distinction between *formal* and *computer-assisted* is the central one in this lesson.`,
    },
    {
      kind: 'order',
      prompt: 'Put these events in the order they happened.',
      steps: [
        'Appel and Haken announce the four-colour theorem with a computer case check (1976).',
        'Wiles, with Taylor, completes the proof of Fermat’s Last Theorem (1995).',
        'Hales’s Kepler conjecture proof appears in the Annals with a caveat from the referees (2005).',
        'Zhang proves a finite bound on infinitely many prime gaps (2013).',
        'Viazovska solves sphere packing in dimension 8 (2016–17).',
        'The Liquid Tensor Experiment is finished in Lean (2022).',
      ],
      why: String.raw`The sequence shows two strands running in parallel: problems being solved, and the standard of verification tightening. They are independent — Zhang's and Viazovska's proofs are ordinary human arguments that referees could check line by line.`,
    },
    {
      kind: 'explain',
      title: 'Key takeaways',
      body: String.raw`- **Computer-assisted** and **formal** are different. The first uses a program inside an argument; the second has the whole argument checked by a trusted kernel. Four-colour (1976) was the first; Flyspeck (2014) is the second.
- Formalisation shifts risk from "is the argument sound?" to "did we state the right theorem?", and costs months to years per paper. Shared libraries such as Lean's *mathlib* make it cheaper each year.
- Real problems have fallen: Fermat (1995), Poincaré (2003), sphere packing in dimensions 8 and 24 (2016–17), bounded prime gaps (2013–14).
- Open collaboration (Polymath) works for decomposable problems; it has not displaced solitary work.
- Machine learning contributes by **proposing** — conjectures, constructions, algorithms — with humans or verifiers closing the loop. Olympiad performance is real but is not evidence about research problems.
- Everything here has a date. The frontier moves; quote the source and the year.

Next: [what nobody can do yet](@math/frontier-open-problems).`,
    },
  ],
  references: [
    { authors: 'T. Hales, M. Adams, G. Bauer, T. D. Dang, J. Harrison, L. T. Hoang, et al.', title: 'A formal proof of the Kepler conjecture', year: 2017, venue: 'Forum of Mathematics, Pi 5, e2' },
    { authors: 'G. Gonthier', title: 'Formal Proof — The Four-Color Theorem', year: 2008, venue: 'Notices of the AMS 55(11), 1382–1393' },
    { authors: 'A. Davies, P. Veličković, L. Buesing, S. Blackwell, D. Zheng, N. Tomašev, et al.', title: 'Advancing mathematics by guiding human intuition with AI', year: 2021, venue: 'Nature 600, 70–74' },
    { authors: 'B. Romera-Paredes, M. Barekatain, A. Novikov, M. Balog, M. P. Kumar, E. Dupont, et al.', title: 'Mathematical discoveries from program search with large language models', year: 2024, venue: 'Nature 625, 468–475' },
    { authors: 'M. S. Viazovska', title: 'The sphere packing problem in dimension 8', year: 2017, venue: 'Annals of Mathematics 185(3), 991–1015' },
  ],
} satisfies LessonContent;
