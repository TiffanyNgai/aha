import type { LessonContent } from '../../types';

const stages: [string, string][] = [
  ['Idea → experiments', 'Tuning budget spent unevenly on method vs baseline'],
  ['arXiv preprint', 'Public, uncited, unreviewed — and often press-released'],
  ['Submission & review', '3–5 reviewers, high noise, ~20–30% accepted'],
  ['Rebuttal & decision', 'Extra experiments; reviewers rarely re-run anything'],
  ['Camera-ready + code', 'Code may be partial; weights and data often absent'],
  ['Community re-test', 'Tuned baselines and fresh test sets shrink the gain'],
];
const pipeSvg = `<svg viewBox="0 0 320 ${28 + stages.length * 30}" xmlns="http://www.w3.org/2000/svg" font-family="inherit">
  <text x="6" y="12" font-size="10" fill="var(--fg)">How a result reaches you, and what it picks up on the way</text>
  <line x1="18" y1="24" x2="18" y2="${18 + stages.length * 30}" stroke="var(--grid)" stroke-width="2"/>
  ${stages.map(([s, risk], i) => {
    const y = 24 + i * 30;
    return `<g>
      <circle cx="18" cy="${y + 8}" r="4" fill="var(--c2)">
        <animate attributeName="r" values="4;6;4" dur="2.4s" begin="${i * 0.35}s" repeatCount="indefinite"/>
      </circle>
      <text x="30" y="${y + 7}" font-size="9.5" fill="var(--fg)">${s}</text>
      <text x="30" y="${y + 19}" font-size="8" fill="var(--c5)">${risk}</text>
    </g>`;
  }).join('')}
</svg>`;

export default {
  cards: [
    {
      kind: 'explain',
      title: 'A field that publishes faster than it checks',
      body: String.raw`Machine learning has an unusual publication culture, and you need to understand it before you can read it. Results appear as preprints first, often with a press release, sometimes months before review. The main venues are conferences, not journals, with a single review round and a fixed deadline. Submission volumes have grown roughly tenfold in a decade while the reviewer pool grew from the same community.

The consequence is not that the literature is untrustworthy. It is that **the filter is applied after publication, by readers, and unevenly**. Learning to apply it yourself is the skill this lesson is about.

We finish with three to five questions a newcomer could actually work on — chosen because they need judgement and a modest machine, not a data centre.`,
      widget: { type: 'SvgDiagram', props: { svg: pipeSvg } },
    },
    {
      kind: 'explain',
      title: 'Where the field publishes',
      body: String.raw`- **The big three general venues:** NeurIPS (December), ICML (July) and ICLR (spring). These are conferences, but they function as the field's journals of record: a paper there is "published", with a page limit, a single review round and a rebuttal.
- **Subfield venues:** CVPR, ICCV and ECCV for vision; ACL, EMNLP and NAACL for language; AISTATS and UAI for statistical and probabilistic methods; CoRL and RSS for robotics; AAAI and KDD more broadly.
- **Journals:** JMLR is long-established. **TMLR** (Transactions on Machine Learning Research) is worth knowing because of its unusual criterion: it accepts on *correctness and whether the claims are supported*, explicitly not on novelty or expected impact. Papers that would be rejected elsewhere as "not exciting" — careful negative results, replications — have a home there.
- **arXiv** (cs.LG, cs.CL, cs.CV, stat.ML) is where nearly everything appears first, usually at submission time or earlier. It is not reviewed. An arXiv number is a timestamp, not a certification.
- **Technical reports from labs.** Many of the most-discussed results of the 2020s were released as company reports rather than peer-reviewed papers. They are often detailed and honest; they are also not independently reviewed, and the ones describing closed models cannot be checked at all.

**OpenReview**, used by ICLR and now by several other venues, publishes the reviews and the authors' responses. For a paper you care about, reading its reviews is frequently more informative than reading the paper's own limitations section.`,
    },
    {
      kind: 'explain',
      title: 'Peer review here is noisy, and measurably so',
      body: String.raw`The field has run the experiment on itself. At **NeurIPS 2014**, about 10% of submissions were assigned to two independent program committees that did not see each other's verdicts. Of the papers accepted by one committee, roughly **half were rejected by the other** (the 2021 reanalysis by Cortes and Lawrence puts it near 50%; commonly quoted figures run from a half to two-thirds depending on how it is counted). Roughly a quarter of papers were accepted. The experiment was repeated at **NeurIPS 2021** (reported by **Beygelzimer, Dauphin, Liang and Wortman Vaughan, 2023**) at far larger scale, with similar levels of disagreement — the process had not become noticeably more arbitrary with growth, but it had not become reliable either.

Both numbers need the right comparison, which the next exercise makes you compute. Review is substantially better than a coin flip. It is nowhere near a verdict on whether a result is correct.

Two practical consequences:
1. **Acceptance is weak evidence.** A rejected paper may be excellent; an accepted one may be wrong. Treat the venue as a weak prior and read the paper.
2. **Reviewers almost never re-run anything.** Review in this field checks whether the argument is coherent and the experiments are the ones you would want. It does not verify that the numbers are real. Nothing in the process would catch a benchmark contaminated by the training data.`,
    },
    {
      kind: 'numeric',
      prompt: String.raw`Suppose a committee accepts 25% of papers, and imagine two committees deciding completely at random and independently. Of the papers accepted by committee A, what percentage would committee B reject? (Give a number in percent.)`,
      answer: 75,
      tolerance: 0.5,
      why: String.raw`Under independence, B accepts 25% of anything, so it rejects 75% of A's accepts. The observed figure was roughly half, which is the interesting part: substantially better than chance (75%), and nothing like consistent (0%). Quoting the disagreement rate without the chance baseline makes review sound like a lottery, which it is not.`,
    },
    {
      kind: 'explain',
      title: 'The preprint culture, honestly assessed',
      body: String.raw`Posting to arXiv before review has clear benefits. Results circulate in days rather than a year. Anyone can read them without a subscription. Errors are often caught by readers faster than by reviewers, and corrected in a new version with the old one still visible.

It also has costs that are easy to understate:
- Journalists and social media treat a preprint as a published result, and a retraction-by-silence — the paper simply never appears at a venue — is invisible to the public record.
- There is no filter on claim strength. Abstracts are written for attention.
- Because preprints establish priority, there is pressure to post early, before the ablations are done.

A useful habit: when you encounter a striking arXiv claim, check whether it was published anywhere afterwards, whether the current version is v1 or v5, and whether anyone cites it as having been reproduced. The absence of all three, two years on, is informative.`,
    },
    {
      kind: 'mcq',
      prompt: 'You find a 2024 arXiv preprint reporting a large improvement on a well-known benchmark. It is still at v1, has no published venue, has 300 citations, and you cannot find anyone reporting a reproduction. What is the most reasonable reading?',
      choices: [
        'The citation count establishes the result; 300 citations is strong validation',
        'The result is almost certainly wrong, since it was never published',
        'The claim is unverified: citations mostly measure attention, and the absence of both peer review and any reproduction after two years leaves the central number untested',
        'The work must be under review somewhere, so judgement should be suspended entirely',
      ],
      answer: 2,
      why: String.raw`Citations track interest, not correctness — papers are frequently cited for their framing by authors who never ran the code. But the opposite conclusion overshoots too: plenty of excellent work never gets submitted, and non-publication is not evidence of error. The accurate statement is that the number has not been tested, and you should treat it as untested.`,
    },
    {
      kind: 'explain',
      title: 'How benchmarks get gamed',
      body: String.raw`Rarely by fraud. Almost always by a series of individually defensible choices that all point the same way.

- **Unequal tuning.** Your method gets a hyperparameter sweep; the baseline gets the numbers from its own paper, tuned for a different setting. The single most common source of illusory gains ([previous lesson](@ml/frontier-why-hard)).
- **Unequal compute.** A comparison at equal parameter count but unequal training compute, or vice versa, where the fair comparison is the one you did not report.
- **Contamination.** The test set is in the training corpus. Often genuinely unknown to the authors.
- **Selective reporting.** Best of several seeds; best of several prompts; the subset of tasks where the method wins. Reporting "we used the best prompt per model" sounds fair and is not, if the search effort differed.
- **Metric choice.** Reporting pass@10 when prior work reported pass@1, or switching to a metric that happens to favour your method, without reporting both.
- **Cherry-picked qualitative results.** Eight beautiful images, from an unstated number of attempts.
- **Leaderboard effects.** **Singh et al. (2025)** argued that on a major pairwise-comparison leaderboard, providers able to test many private variants and publish only the best gained a systematic advantage, and that data access was unequal. The platform disputed the characterisation. **Contested**, and a useful illustration of the general mechanism regardless of how that specific dispute resolves.

Benchmarks also get **repaired**, which is a healthy sign. SWE-bench, a code-fixing benchmark, was found to contain instances that were unsolvable or whose tests were under-specified; a human-validated 500-problem subset, SWE-bench Verified, was released in 2024 in response.`,
    },
    {
      kind: 'multi',
      prompt: 'Which of these practices would make a reported benchmark gain less trustworthy, even if every individual step was done in good faith? (Select all that apply.)',
      choices: [
        'Hyperparameters for the new method were searched; the baseline used numbers quoted from its original paper',
        'Results are the best of eight random seeds for the new method and a single seed for the baseline',
        'The authors released code and model weights',
        'Each model was evaluated with the prompt that worked best for it, with no record of how many prompts were tried per model',
        'The evaluation set has been public for four years',
      ],
      answers: [0, 1, 3, 4],
      why: String.raw`Unequal tuning, best-of-N on one side only, unlogged prompt search and an aged public benchmark each bias the comparison in the same direction without anyone lying. Releasing code and weights is the opposite: it is the single most useful thing authors can do, because it lets a third party redo the comparison fairly.`,
    },
    {
      kind: 'widget',
      title: 'Reading an ML paper critically',
      body: String.raw`A pass that takes about twenty minutes and catches most of what matters. Do it in this order; you will often stop early.`,
      widget: {
        type: 'StepReveal',
        props: {
          steps: [
            String.raw`**Find the claim.** Write down, in one sentence, what the paper says is true that was not known before. If you cannot, that is already a finding. Lipton and Steinhardt (2018) list a related failure among their troubling trends: not identifying the sources of empirical gains.`,
            String.raw`**Find the evidence for that exact claim.** Which table, which figure? Papers often make a broad claim in the abstract and support a narrow one in the experiments. The gap between them is where most overclaiming lives.`,
            String.raw`**Check the baseline.** Is it the strongest current method, or a convenient one? Was it tuned with the same budget? Are compute and data matched? If a simple well-tuned baseline is missing, assume it would have been close.`,
            String.raw`**Check the variance.** How many seeds? Is a spread reported, and is the claimed gain larger than it? A single number with no interval, next to a 0.3-point improvement, is not a result (Henderson et al. 2018; Agarwal et al. 2021).`,
            String.raw`**Check the evaluation for contamination.** How old is the benchmark, is it on the public web, and does the paper say anything about decontamination? For a model trained on web text, assume overlap unless the paper argues otherwise.`,
            String.raw`**Check the ablations.** Does any experiment isolate the mechanism the paper says is responsible? A method with five changes and one aggregate improvement has not shown which change mattered.`,
            String.raw`**Check what is not there.** Negative results, failure cases, the tasks where it lost. A limitations section that lists only "future work" is a limitations section with nothing in it.`,
          ],
          notes: [
            'Do this before reading the method section. It takes two minutes and changes how you read everything else.',
            'Abstract says “reasoning”; table shows one benchmark at one size.',
            'This step alone resolves a large share of “is this real?” questions.',
            '',
            'Especially for anything a language model is evaluated on.',
            'Ablation tables are where authors are most honest, because the numbers are internal comparisons.',
            'And check the appendix: inconvenient results are often there, reported accurately.',
          ],
        },
      },
    },
    {
      kind: 'explain',
      title: 'The reproducibility record',
      body: String.raw`It is poor, improving in parts, and structurally hopeless in others.

**Improving.** NeurIPS introduced a reproducibility checklist in 2019 and ran a reproducibility programme whose results were written up by **Pineau et al. (2021, JMLR)**; code submission with accepted papers rose substantially afterwards and is now near-normal at the main venues. The **ML Reproducibility Challenge** organises students and researchers to reproduce accepted papers and publish the reports. **Agarwal et al. (2021)** changed reporting norms in reinforcement learning by making better interval statistics easy to run.

**Still poor.** The replication studies named in the previous lesson — tuned LSTM baselines, neural recommenders, deep metric learning — all found that a substantial fraction of published improvements did not survive a fair comparison. There is no reason to think those three subfields were unusual.

**Structurally hopeless.** For a frontier model with closed weights, undisclosed training data and an API that changes underneath you, external reproduction is impossible in principle, not merely expensive. An evaluation you ran in March may not be re-runnable in June. This is a genuinely new situation: the most-discussed results in the field are the least checkable ones, and the open-weights releases — which can be checked — are therefore disproportionately valuable to researchers even when they are not the strongest models.`,
    },
    {
      kind: 'truefalse',
      prompt: 'Because major venues now require code submission, published machine-learning results are generally reproducible.',
      answer: false,
      why: String.raw`Code availability is necessary and far from sufficient. Reproducing a result also needs the data, the exact preprocessing, the random seeds, the compute, and often undocumented details; and reproducing the *number* is not the same as reproducing the *claim*, which requires an equally tuned baseline. Code release has improved the situation measurably and has not solved it.`,
    },
    {
      kind: 'match',
      prompt: 'Match each warning sign in a paper to what it usually indicates.',
      pairs: [
        ['A 0.3-point gain with no error bars and one seed', 'The effect may be inside the seed-to-seed noise'],
        ['Baseline numbers quoted from the original paper', 'Unequal tuning budget; the gap may be tuning, not method'],
        ['Abstract claims a general capability; one benchmark is reported', 'The claim is broader than the evidence'],
        ['Eight hand-picked generated samples, no metric', 'Unknown selection rate; no estimate of typical quality'],
        ['A four-year-old public benchmark, no decontamination discussion', 'Possible train/test overlap inflating the absolute score'],
      ],
      why: String.raw`None of these proves a paper is wrong — each is a question you now know to ask, and good papers answer them pre-emptively. Noticing that a paper *does* report seeds, matched compute and a tuned baseline is the fastest way to decide it deserves careful reading.`,
    },
    {
      kind: 'explain',
      title: 'Questions a newcomer could actually work on',
      body: String.raw`These are chosen because they are open, they need judgement rather than a data centre, and a careful answer would be publishable. All assume a single GPU or a small cluster.

1. **Measure contamination properly on a fully open model.** The Pythia suite (**Biderman et al., 2023, ICML**) was built for this: public weights, public training data, known data ordering, and intermediate checkpoints. Take a benchmark, find its overlap with the training corpus, and quantify how much the score changes when overlapping items are removed — and whether the model's *ranking* against others survives.
2. **Replicate a claimed improvement with an equally tuned baseline.** Pick a subfield's recent papers, give every method the same search budget and compute, and report what remains. This is the Melis / Musgrave / Dacrema genre, it is consistently valuable, and nobody is competing with you for it.
3. **Test whether interpretability features are stable.** Train sparse autoencoders on a small open model at several dictionary widths and random seeds, and measure how much the discovered feature set agrees across runs. Non-identifiability is the stated blocker; nobody has a good measurement of how bad it is.
4. **Measure loss of plasticity, and whether the proposed remedies hold.** Dohare et al. (2024) gave a protocol. Run it on a different task family and see whether continual backpropagation and its alternatives behave the same way.
5. **Do more with less data.** The **BabyLM Challenge** restricts pretraining to roughly the amount of language a child hears — about 100 million words — and runs as a shared task with a workshop. It is small enough to enter and aimed squarely at the sample-efficiency problem.
6. **Calibration of reasoning.** Take an open reasoning model, measure whether the confidence implied by its chain of thought predicts correctness, and test whether [conformal prediction](@ml/calibration-uncertainty) can give usable coverage over its answers.

Notice what these have in common: each produces a *measurement* where the field currently has an impression.`,
    },
    {
      kind: 'order',
      prompt: 'Order a realistic first research project on contamination, from first step to last.',
      steps: [
        'Choose a model whose training corpus is fully public, so overlap can be measured at all',
        'Define precisely what counts as overlap — exact n-grams, near-duplicates, paraphrases — and justify the choice',
        'Measure overlap between the benchmark and the corpus, and report how much of the benchmark is affected',
        'Re-score the model on the uncontaminated subset and compare against the published number',
        'Check whether the ranking against other models changes, not just the absolute score',
      ],
      why: String.raw`The order matters: without a fully open corpus there is nothing to measure, and without a stated overlap definition the measurement means nothing. The last step is the one most people skip and the most informative — Recht et al. (2019) found absolute scores moved a lot and rankings barely at all, and whether that holds for contamination in language models is genuinely open.`,
    },
    {
      kind: 'fill',
      prompt: String.raw`At NeurIPS 2014, about half of one committee's accepted papers were rejected by the other, against a chance baseline of about ___%. Peer review in this field checks whether the experiments are sensible; it does not ___ the numbers. And an arXiv identifier is a ___, not a certification.`,
      bank: ['75', '25', 're-run', 'publish', 'timestamp', 'guarantee'],
      answer: ['75', 're-run', 'timestamp'],
      why: String.raw`With a roughly 25% acceptance rate, independent committees would disagree on about 75% of accepts, so roughly half is meaningfully better than chance. The other two blanks name the two things readers most often assume review and arXiv provide, and neither does.`,
    },
    {
      kind: 'explain',
      title: 'How to be useful quickly',
      body: String.raw`Three habits that compound, none of which require a large machine.

**Re-derive one equation per paper you care about.** Not all of them. The one the paper's claim rests on. You will find errors, and more often you will find that the equation is fine and the assumption beneath it is the interesting part.

**Run the smallest version of the experiment.** Many results have a version that fits on one GPU. Running it teaches you more about a method in an afternoon than a week of reading, and the gap between your result and the paper's is the most informative number you will get.

**Write down negative results.** The field's blind spot is the file drawer: methods that did not work are not published, so everyone retries them. TMLR, workshop tracks and the ML Reproducibility Challenge all accept careful negative and replication results, and they are read by exactly the people who need them.

A last note on tone. The habit of scepticism in this lesson is not cynicism about the field. The results in the [state-of-the-art lesson](@ml/frontier-state-of-the-art) are real, and some of them are among the most striking scientific achievements of the decade. Scepticism is how you tell which ones.`,
    },
    {
      kind: 'explain',
      title: 'Key takeaways',
      body: String.raw`- Machine learning publishes as preprints first and reviews at conferences in a single round. Review is noisy — measured at roughly half of accepts reversed by an independent committee at NeurIPS 2014, against a ~75% chance baseline — and reviewers do not re-run experiments.
- An arXiv number is a timestamp. A venue acceptance is a weak prior. Open reviews, version history and whether anyone reproduced the work tell you more.
- Benchmarks degrade through use: unequal tuning, unequal compute, contamination, selective reporting, metric switching. Almost none of this requires bad faith. Benchmarks also get repaired (SWE-bench Verified, 2024), which is a healthy sign.
- Read a paper by finding the claim, then the evidence for *that* claim, then the baseline, the variance, contamination and the ablations — in that order.
- Reproducibility is improving where code release and better statistics took hold (Pineau et al. 2021; Agarwal et al. 2021), and is impossible by construction for closed frontier models.
- Good newcomer projects turn an impression into a measurement: contamination audits on fully open models like Pythia, equally tuned replications, feature stability in interpretability, plasticity loss, and data-constrained pretraining (BabyLM).`,
    },
  ],
  references: [
    { authors: 'C. Cortes & N. D. Lawrence', title: 'Inconsistency in Conference Peer Review: Revisiting the 2014 NeurIPS Experiment', year: 2021, venue: 'arXiv:2109.09774', url: 'https://arxiv.org/abs/2109.09774' },
    { authors: 'S. Singh, Y. Nan, A. Wang, et al.', title: 'The Leaderboard Illusion', year: 2025, venue: 'arXiv:2504.20879 (NeurIPS 2025)', url: 'https://arxiv.org/abs/2504.20879' },
    { authors: 'Z. C. Lipton & J. Steinhardt', title: 'Troubling Trends in Machine Learning Scholarship', year: 2018, venue: 'arXiv:1807.03341', url: 'https://arxiv.org/abs/1807.03341' },
    { authors: 'A. Beygelzimer, Y. Dauphin, P. Liang & J. Wortman Vaughan', title: 'Has the Machine Learning Review Process Become More Arbitrary as the Field Has Grown? The NeurIPS 2021 Consistency Experiment', year: 2023, venue: 'arXiv:2306.03262', url: 'https://arxiv.org/abs/2306.03262' },
    { authors: 'J. Pineau, P. Vincent-Lamarre, K. Sinha, V. Larivière, A. Beygelzimer, F. d’Alché-Buc, E. Fox & H. Larochelle', title: 'Improving Reproducibility in Machine Learning Research (A Report from the NeurIPS 2019 Reproducibility Program)', year: 2021, venue: 'JMLR 22(164)' },
    { authors: 'S. Biderman, H. Schoelkopf, Q. Anthony, et al.', title: 'Pythia: A Suite for Analyzing Large Language Models Across Training and Scaling', year: 2023, venue: 'ICML', url: 'https://arxiv.org/abs/2304.01373' },
    { authors: 'A. Warstadt, A. Mueller, L. Choshen, et al.', title: 'Findings of the BabyLM Challenge: Sample-Efficient Pretraining on Developmentally Plausible Corpora', year: 2023, venue: 'CoNLL (BabyLM Challenge)' },
  ],
} satisfies LessonContent;
