import type { LessonContent } from '../../types';

const stages: [string, string][] = [
  ['desk', 'the idea, and months of checking it yourself'],
  ['arXiv', 'public in a day; moderated, not refereed'],
  ['seminar', 'where the first real objections arrive'],
  ['referee', 'one anonymous specialist, often 1–3 years'],
  ['journal', 'published — and now people start using it'],
  ['use', 'cited, generalised, taught, occasionally corrected'],
  ['Lean', 'formalised, sometimes decades later'],
];
const pipelineSvg = `<svg viewBox="0 0 320 ${34 + stages.length * 24}" xmlns="http://www.w3.org/2000/svg" font-family="inherit">
  <text x="6" y="12" font-size="10" fill="var(--fg)">How a theorem becomes part of the literature</text>
  <line x1="46" y1="24" x2="46" y2="${18 + stages.length * 24}" stroke="var(--grid)" stroke-width="2"/>
  ${stages.map(([name, note], i) => {
    const y = 36 + i * 24;
    return `<g>
      <circle cx="46" cy="${y - 4}" r="4.5" fill="var(--c2)">
        <animate attributeName="opacity" values="0.35;1;0.35" dur="3s" begin="${i * 0.4}s" repeatCount="indefinite"/>
      </circle>
      <text x="38" y="${y}" text-anchor="end" font-size="9" fill="var(--c5)">${name}</text>
      <text x="56" y="${y}" font-size="9" fill="var(--muted)">${note}</text>
    </g>`;
  }).join('')}
  <text x="6" y="${32 + stages.length * 24}" font-size="8.5" fill="var(--c3)">Only one of these steps is peer review, and it is thinner than people assume.</text>
</svg>`;

const startSvg = `<svg viewBox="0 0 320 196" xmlns="http://www.w3.org/2000/svg" font-family="inherit">
  <text x="6" y="12" font-size="10" fill="var(--fg)">Where a newcomer can actually get traction</text>
  ${[
    ['mathlib lemma', 'reviewed by people who will teach you', 'var(--c2)'],
    ['database entry', 'OEIS, LMFDB — checkable by anyone', 'var(--c3)'],
    ['small construction', 'a record you can verify in seconds', 'var(--c5)'],
    ['careful exposition', 'the best way to find a real gap', 'var(--c2)'],
    ['crowdsourced project', 'when one is running, they take all comers', 'var(--c3)'],
  ].map(([title, note, col], i) => {
    const y = 28 + i * 33;
    return `<g>
      <rect x="6" y="${y}" width="308" height="26" rx="5" fill="${col}" fill-opacity="0.10" stroke="${col}" stroke-width="0.8"/>
      <circle cx="20" cy="${y + 13}" r="4" fill="${col}">
        <animate attributeName="r" values="4;5.5;4" dur="2.4s" begin="${i * 0.35}s" repeatCount="indefinite"/>
      </circle>
      <text x="32" y="${y + 11}" font-size="9" fill="var(--fg)">${title}</text>
      <text x="32" y="${y + 22}" font-size="8.5" fill="var(--muted)">${note}</text>
    </g>`;
  }).join('')}
</svg>`;

export default {
  cards: [
    {
      kind: 'explain',
      title: 'Where the frontier actually lives',
      body: String.raw`Almost nothing in the last three lessons reached you the way it reached the field. Results circulate long before they are published, get argued about in places that leave no citable record, and sometimes get accepted — or quietly doubted — for reasons that never appear in print.

If you want to follow mathematics as it happens rather than as it is taught, you need a picture of that machinery: who publishes what, what refereeing does and does not check, where disputes get settled, and what a claimed proof has to survive before people believe it.

This lesson is that picture, plus a method for reading a paper you are not qualified to referee, plus some honest suggestions about where a newcomer can contribute.`,
      widget: { type: 'SvgDiagram', props: { svg: pipelineSvg } },
    },
    {
      kind: 'explain',
      title: 'arXiv: fast, public, and not peer review',
      body: String.raw`Paul Ginsparg started a preprint server for high-energy physicists in 1991. It became **arXiv**, and today it hosts well over two million preprints across the sciences — its own statistics pages track the count. In most areas of mathematics, posting there is the real act of publication: a result is "out" the day it appears, months or years before a journal says anything.

The crucial thing to understand is what arXiv moderation is. Submissions are screened for being in scope, in the right subject class, and not obvious nonsense. **They are not refereed.** Nobody checks the proof. A paper on arXiv has one author's word behind it.

Perelman's three Poincaré preprints in 2002–03 were never submitted to a journal at all; the community's acceptance came from three independent teams spending years writing out the details. That is the arXiv model working — and it is not peer review, it is something slower and in that case better.

Two conveniences worth knowing: every paper has a version history (v1, v2, …), and a quiet v3 appearing after a prominent claim is often the most informative thing on the page.`,
    },
    {
      kind: 'explain',
      title: 'Journals, and what a referee really does',
      body: String.raw`The leading general journals are the *Annals of Mathematics*, *Inventiones Mathematicae*, *Acta Mathematica*, *Publications de l'IHÉS* and the *Journal of the AMS*, with strong specialist journals in every area. Mathematics refereeing is unusually slow: one to three years from submission to acceptance is ordinary, because one anonymous specialist has to read a long technical argument carefully, unpaid, alongside their own work.

And here is what that specialist actually does. They check the main ideas, verify the steps where the difficulty is concentrated, spot-check the routine ones, and form a judgement about whether the argument is the kind that works. **They very rarely verify every line.** The *Annals* referees for Hales's Kepler proof said they were "99% certain" and could not fully check the computations — unusual only in saying so out loud.

The economics have been contested. Timothy Gowers started the "Cost of Knowledge" boycott of Elsevier in 2012; editorial boards have resigned over pricing, including *Topology* in 2006 and the *Journal of Algebraic Combinatorics* in 2017. Gowers also founded *Discrete Analysis* in 2015 as an **overlay journal**: it referees papers and links to the arXiv versions, hosting nothing itself.`,
    },
    {
      kind: 'truefalse',
      prompt: String.raw`When a paper appears in a leading mathematics journal, you can take it that a referee has verified every line of the argument.`,
      answer: false,
      why: String.raw`Refereeing checks that the main ideas work and that the hard steps hold up; a long paper's routine lemmas are usually spot-checked at best. This is not a scandal, it is a resource limit — but it means publication is strong evidence rather than a guarantee. Wiles's 1993 Fermat argument had a gap that referees *did* find; the classification of finite simple groups was announced complete in 1983 yet had an unfinished case that took until 2004 to fill.`,
    },
    {
      kind: 'explain',
      title: 'The informal layer',
      body: String.raw`A great deal of the field's actual judgement is formed in places that do not look like publishing.

- **Seminars and workshops.** Departmental seminars are where a result meets its first hostile questions. The Mathematisches Forschungsinstitut Oberwolfach in Germany runs week-long invitation-only workshops; the IHÉS near Paris and SLMath (formerly MSRI) in Berkeley play similar roles. Since 2020 a large fraction of seminars are online and open, and researchseminars.org lists them.
- **The International Congress of Mathematicians**, every four years, where the Fields Medals (for work by mathematicians under 40) are awarded; the Abel Prize is the other major award and has no age limit.
- **MathOverflow**, launched in 2009, is a question site specifically for research-level mathematics, with signed answers and voting. Its sister site Mathematics Stack Exchange handles everything below that. A surprising number of small research obstacles get resolved there in a day.
- **Blogs.** Terence Tao's *What's new* and Gowers's *Weblog* are read by the field; many results are first explained properly in a blog post, and Polymath projects ran in comment threads.

None of this is refereed either. Its value is that it is signed, public and argued over by people who know the area.

Alongside it a **formal** layer has grown: **mathlib**, the shared Lean library, and the Lean Zulip chat where its contributors work in public. That is a different kind of record — not "this was published" but "this has been checked by a kernel" — and contributions are reviewed line by line, which is deeper scrutiny than a journal gives, applied to a narrower question. In 2024 Terence Tao and collaborators launched the **Equational Theories Project** on that basis: decide, for each ordered pair drawn from 4,694 simple algebraic laws, whether the first implies the second — about 22 million questions — and deliberately accept contributions from people with no research background. By 2025 essentially the whole table had been settled, by a mix of human and automated proofs, all checked in Lean; the final report appeared on arXiv in December 2025. Lean settles correctness without anyone having to vouch for the contributor, which lowers the cost of trusting a stranger — the cost that has always kept mathematical collaboration small.`,
    },
    {
      kind: 'widget',
      title: 'Reading a paper you cannot referee',
      body: String.raw`You will usually be reading outside your competence. That is normal, and there is a method for it that extracts real information without verifying anything.`,
      widget: {
        type: 'StepReveal',
        props: {
          steps: [
            String.raw`**Read the main theorem first, and read the hypotheses twice.** Look for "assume the generalised Riemann hypothesis", "for sufficiently large $n$", "for almost all", "there exists a constant". Each of those changes what the result is worth.`,
            String.raw`**Ask what would be false without each hypothesis.** A hypothesis with no role is a sign that the author has not understood their own argument — or that the theorem is stronger than claimed.`,
            String.raw`**Find the one new idea.** Most good papers have exactly one; the rest is machinery. If the introduction cannot name it, or you cannot find it, be careful.`,
            String.raw`**Test the statement on an extreme case.** Set a parameter to zero, take the trivial group, let the dimension be 1. Statements that are wrong are often wrong at the boundary.`,
            String.raw`**Check whether the constants are effective.** "There exists $C$" sometimes means "we could compute $C$" and sometimes means "we proved one exists but cannot find it". Siegel's theorem on class numbers is the classic ineffective result; the distinction decides whether the theorem can ever be used to compute.`,
            String.raw`**Check what it depends on.** A paper resting on an unpublished preprint, or on a case of a programme that is itself disputed, inherits that status.`,
            String.raw`**Look at the arXiv version history and the citations.** Who has used it since, and did they reprove the parts they needed?`,
          ],
          notes: [
            'Conditional theorems are still theorems — of the form "if A then B". They just cannot be applied unconditionally.',
            'This is the single most useful question to ask about any proof, including your own.',
            'Named the "one idea" test by many expositors; it also tells you what to remember.',
            '',
            'Effectivity is invisible in the statement and decisive in practice.',
            'Vladimir Voevodsky described discovering, years later, that a 1991 paper of his was wrong — a reminder that dependency chains carry risk.',
            'A result that everyone cites and nobody uses is a weaker signal than it looks.',
          ],
        },
      },
    },
    {
      kind: 'mcq',
      prompt: String.raw`Gary Miller's 1976 primality test runs in polynomial time — but only if the generalised Riemann hypothesis holds. (Manindra Agrawal, Neeraj Kayal and Nitin Saxena later gave an unconditional polynomial-time test, published in 2004.) How should you read a theorem stated under an unproved hypothesis?`,
      choices: [
        'As worthless, since its hypothesis is unproved.',
        'As a proved implication: genuine mathematics, useful for organising the field and as a test of the hypothesis, but any application must carry the hypothesis with it.',
        'As evidence that the hypothesis is true, since the conclusion has been confirmed computationally.',
        'As establishing the conclusion outright, since GRH is believed by nearly everyone.',
      ],
      answer: 1,
      why: String.raw`A conditional theorem proves "if GRH then the test is fast" — that implication is settled forever, regardless of GRH's fate. It also cuts the other way: if someone disproved the conclusion, GRH would fall with it, which is why conditional results are treated as probes of the hypothesis. What you cannot do is quietly drop the hypothesis when applying it, and the AKS story shows the alternative — an unconditional result found later by quite different means.`,
    },
    {
      kind: 'explain',
      title: 'The verification record',
      body: String.raw`Mathematics has a better replication record than most fields, and a worse one than its reputation suggests. Four cases worth carrying around:

- **Wiles, 1993.** The first announced proof of Fermat's Last Theorem had a gap in the Euler system argument, found during refereeing. Wiles and Richard Taylor repaired it in 1994. The system worked.
- **The classification of finite simple groups.** Announced complete in 1983. A case — the quasithin groups — turned out not to have been completely written down; Michael Aschbacher and Stephen Smith published the missing two volumes in 2004. Two decades between announcement and a complete proof, for the most consequential theorem of twentieth-century algebra.
- **Hsiang, 1993.** Wu-Yi Hsiang published a claimed proof of the Kepler conjecture. Specialists, Thomas Hales among them, judged it incomplete; it is not accepted. Hales proved it properly five years later.
- **Voevodsky.** Vladimir Voevodsky learned, years after the fact, that a 1991 paper he had co-authored was wrong — Carlos Simpson had published a counterexample in 1998 that Voevodsky did not initially accept. He described the episode publicly as part of his motivation for working on computer-checked foundations.

Formal retractions in mathematics are rare. Quiet non-acceptance — a paper that is published, uncited and not believed — is much commoner and leaves no trace you can search for.`,
    },
    {
      kind: 'explain',
      title: 'A live dispute: the abc conjecture',
      body: String.raw`In 2012 Shinichi Mochizuki posted a series of preprints developing "inter-universal Teichmüller theory" and claiming, as a consequence, a proof of the **abc conjecture** — a statement about how the prime factorisations of $a$, $b$ and $a + b$ constrain each other, with many consequences in number theory.

What happened next is contested, and should be described as contested.

- Very few mathematicians have claimed to understand the argument, despite more than a decade and several dedicated workshops.
- In 2018 Peter Scholze and Jakob Stix wrote a report after visiting Kyoto, arguing that a specific step — Corollary 3.12 — does not work as stated. Mochizuki published a detailed rebuttal rejecting their reading.
- The work was published in 2021 in *Publications of the Research Institute for Mathematical Sciences*, a journal where Mochizuki is chief editor. Many mathematicians regard that as a reason for additional caution rather than reassurance.
- As of 2026 the claim is **not** accepted by the broader number theory community, and there is no agreed resolution of the Scholze–Stix objection.

> The useful lesson is not about who is right. It is that publication, prestige and persistence do not add up to acceptance. In mathematics acceptance means specialists can follow the argument — and when they cannot, nothing else substitutes.

A smaller example of the same principle: Michael Atiyah presented a claimed proof of the Riemann hypothesis in 2018. Despite his enormous standing, the argument was not accepted.`,
    },
    {
      kind: 'multi',
      prompt: String.raw`You see a 90-page preprint claiming a Millennium Prize problem. Which of these are legitimate grounds for scepticism, as opposed to snobbery?`,
      choices: [
        'The paper never identifies where its central hypothesis is used.',
        'The method, applied with slightly weaker assumptions, would also prove something already known to be false.',
        'The author has no university affiliation.',
        'The argument appears to evade a published barrier theorem without explaining how.',
        'It was posted to arXiv rather than submitted to a journal first.',
        'Specialists who have read it cannot point to a specific new idea, only to rearrangements of known ones.',
      ],
      answers: [0, 1, 3, 5],
      why: String.raw`The four good grounds are all about the mathematics: unused hypotheses, a method that proves too much, an unexplained escape from a known barrier, and the absence of a new idea. Affiliation and posting route are not evidence. Yitang Zhang was working outside a research position when he proved bounded prime gaps, and Perelman never submitted the Poincaré work to a journal at all — both are now textbook results.`,
    },
    {
      kind: 'explain',
      title: 'Benchmarks, and how they get gamed',
      body: String.raw`Mathematics has no benchmark culture of its own — there is nothing like a leaderboard for theorem-proving by humans. But claims about *machines* doing mathematics are now measured on benchmarks, and if you want to read those claims you need to know how they fail.

- **miniF2F** (Zheng, Han and Polu, 2022) is a set of olympiad and competition problems with formal statements, used to score automated theorem provers.
- **FrontierMath**, released by Epoch AI in late 2024, is a set of hard, unpublished problems designed to resist memorisation.

The standard failure mode is **contamination**: if the problems or their solutions were in the training data, a high score measures recall rather than reasoning. This is not hypothetical. In January 2025 it became public that OpenAI had funded FrontierMath and had access to most of its problems — a fact absent from the original reporting of scores. Epoch AI stated it had retained a hold-out set, which is the right remedy, but the episode shows that a benchmark number's meaning depends on facts about its construction that the number does not carry.

The second failure mode is **announcement before refereeing**. The 2024 and 2025 olympiad-level results from industry labs were reported by the labs themselves, with grading arrangements they described. Take them seriously, attach the source and the date, and do not convert "silver-medal level on IMO problems" into "can do research mathematics".`,
    },
    {
      kind: 'mcq',
      prompt: String.raw`A lab reports a large jump in performance on FrontierMath. Afterwards it emerges that the same lab funded the benchmark and had access to most of its problems. What is the right reading?`,
      choices: [
        'The result is fraudulent and the benchmark is worthless.',
        'The score may well be genuine, but the argument that the problems were unseen no longer holds, so an independent evaluation on a held-out set is needed before it supports a claim about general ability.',
        'Nothing changes — who funds a benchmark has no bearing on what a score means.',
        'The score should be discounted by a standard contamination factor.',
      ],
      answer: 1,
      why: String.raw`Access to the problems does not prove the score was inflated; it removes the specific guarantee that made the score interesting. The remedy is structural — evaluate on data the developer never had — which is exactly why a retained hold-out set matters. Treating the result as fraud overreaches, and there is no "standard discount" for contamination; the effect size is unknown, which is the whole problem.`,
    },
    {
      kind: 'match',
      prompt: 'Match each channel to what it actually is.',
      pairs: [
        ['arXiv', 'A preprint server: moderated for scope and obvious nonsense, not refereed'],
        ['Annals of Mathematics', 'A journal with private referee reports, often taking one to three years'],
        ['MathOverflow', 'A public site for research-level questions, with signed, voted answers'],
        ['mathlib', 'A shared library of definitions and theorems checked by a proof assistant'],
        ['Oberwolfach', 'A residential institute running week-long invitation-only workshops'],
      ],
      why: String.raw`These five differ along two axes worth keeping separate: how public the scrutiny is, and how deep it goes. mathlib gives the deepest check on the narrowest question. A seminar at Oberwolfach gives the sharpest human scrutiny and leaves no written record. arXiv gives speed and no scrutiny at all.`,
    },
    {
      kind: 'order',
      prompt: 'Put the typical life of a research result into the order it happens.',
      steps: [
        'The author finishes the argument and spends months checking it alone.',
        'A preprint goes up on arXiv and is emailed to a handful of specialists.',
        'The result is presented in a seminar, where the first serious objections arrive.',
        'The paper is submitted, and an anonymous referee reads it over months or years.',
        'It is published, and other people start using, citing and generalising it.',
        'Years later someone formalises it in a proof assistant, or finds the gap nobody noticed.',
      ],
      why: String.raw`Two features of this order are worth noticing. The result is public and usable long before any refereeing happens, so "peer-reviewed" is a late and partial filter rather than a gate. And the deepest check — formalisation, or someone needing the result badly enough to reprove it — usually comes after everyone already believes it.`,
    },
    {
      kind: 'fill',
      prompt: String.raw`A ___ is a paper made public before refereeing. An ___ journal hosts no papers at all: it referees them and links to the arXiv versions, the model Timothy Gowers used for *Discrete Analysis* in 2015. A SAT solver's output is usable as mathematics only because it comes with a ___ that a small independent checker can replay.`,
      bank: ['preprint', 'overlay', 'certificate', 'postprint', 'abstract', 'erratum'],
      answer: ['preprint', 'overlay', 'certificate'],
      why: String.raw`Each word marks a different way of lowering the cost of trust: the preprint drops the delay, the overlay journal drops the paywall while keeping the refereeing, and the certificate drops the need to trust the program that did the work. None of them replaces a specialist reading the argument.`,
    },
    {
      kind: 'explain',
      title: 'Where a newcomer can realistically start',
      body: String.raw`Not "solve the Riemann hypothesis". These are five things people with no research position genuinely contribute, with the catch attached to each.

1. **Add a missing lemma to mathlib.** The wanted-results lists are public, the Zulip chat is welcoming, and review is careful and instructive. *Catch:* formalising is slow, and choosing the right statement is harder than proving it.
2. **Extend a computation or a database.** The On-Line Encyclopedia of Integer Sequences takes new sequences and corrections; the LMFDB collects data on $L$-functions and modular forms; verification records for Goldbach and Collatz are pure engineering. *Catch:* a record is not a theorem, and the work is judged on correctness, not insight.
3. **Find better small constructions.** Cap sets in low dimensions, Ramsey lower bounds for small cases, the no-three-in-line problem, packing and covering records: the object is small enough to verify in seconds. *Catch:* most records fall to better search code rather than better mathematics, so be honest about which you have.
4. **Write careful exposition.** A clear write-up of a proof that everyone cites and nobody has explained is real, citable work — the Stacks Project is the large-scale version. *Catch:* you need someone in the area to tell you what is genuinely under-explained.
5. **Join a crowdsourced project while one is running.** Polymath and the Equational Theories Project both absorbed contributions from outside the research community. *Catch:* they are intermittent, and they need you to read the thread properly before posting.

What these share: the contribution is **checkable without anyone having to trust you**. That is the door that is actually open.`,
      widget: { type: 'SvgDiagram', props: { svg: startSvg } },
    },
    {
      kind: 'explain',
      title: 'Key takeaways',
      body: String.raw`- **arXiv** (Ginsparg, 1991) is moderated, not refereed. In most of mathematics it is where results really appear; check the version history.
- **Refereeing** in mathematics is one anonymous specialist, often one to three years, checking the hard steps rather than every line. The Kepler referees' "99% certain" was candour, not an anomaly.
- The **informal layer** — seminars, Oberwolfach, MathOverflow, blogs — carries much of the field's real judgement, and none of it is refereed either.
- The **formal layer** (Lean, mathlib, the Equational Theories Project of 2024–25) lowers the cost of trusting a stranger, which is quietly changing who can collaborate.
- To read a paper: hypotheses twice, find where each is used, find the one new idea, test an extreme case, check whether constants are effective, check what it depends on.
- **The record:** Wiles's gap was found and fixed; the finite simple group classification had an unfinished case until 2004; Hsiang's Kepler claim was never accepted; Mochizuki's abc claim remains **contested and not accepted** as of 2026, with the Scholze–Stix objection unresolved.
- **Benchmarks** for machine mathematics fail through contamination and through announcement before independent checking. Attach the source and the date to every number.
- A newcomer's realistic entry points are the ones where the work is **checkable without trust**: mathlib, databases, small constructions, exposition, open projects.

That finishes the unit — and the frontier has moved since this was written. Go and check who has proved what, starting from [where the field stood](@math/frontier-state-of-the-art).`,
    },
  ],
  references: [
    { authors: 'T. Tao et al. (Equational Theories Project)', title: 'The Equational Theories Project: advancing collaborative mathematical research at scale', year: 2025, venue: 'arXiv:2512.07087', url: 'https://arxiv.org/abs/2512.07087' },
    { authors: 'T. C. Hales', title: 'Formal proof', year: 2008, venue: 'Notices of the AMS 55(11), 1370–1380' },
    { authors: 'P. Scholze, J. Stix', title: 'Why abc is still a conjecture', year: 2018, venue: 'Report on discussions held in Kyoto, March 2018' },
    { authors: 'M. Aschbacher, S. D. Smith', title: 'The Classification of Quasithin Groups, I–II', year: 2004, venue: 'Mathematical Surveys and Monographs 111–112, American Mathematical Society' },
    { authors: 'K. Zheng, J. M. Han, S. Polu', title: 'MiniF2F: a cross-system benchmark for formal Olympiad-level mathematics', year: 2022, venue: 'International Conference on Learning Representations (ICLR 2022)', url: 'https://arxiv.org/abs/2109.00110' },
    { authors: 'T. Tao', title: "What's new (research blog)", venue: 'https://terrytao.wordpress.com/', url: 'https://terrytao.wordpress.com/' },
  ],
} satisfies LessonContent;
