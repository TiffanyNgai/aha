# Brief: writing an AHA! lesson

Read `app/src/content/SCHEMA.md` first — it is the authoritative card format. This file covers tone,
scope and the quality bar. `app/src/content/HOME_LESSONS.md` says which subject owns ("is home to")
each shared concept, so you link rather than re-teach.

> These briefs live in the repo on purpose. An earlier copy sat in a scratchpad under `/tmp` and was
> wiped between sessions, leaving a dozen agents to work without them.

## Who is reading
A motivated learner with no background in the subject, working on a phone, a few minutes at a time.
They are bright and they are not an expert. Assume curiosity, not prior knowledge.

## Tone
Plain, warm, concrete. Short sentences. Lead with the idea, then the formalism — never the reverse.
Define every term the first time it appears, including ones the field treats as too obvious to state.
No hype, no breathless adjectives, no "simply" or "obviously". Prefer a worked example to a
generality. British spelling.

## Shape of a lesson
- **14–17 cards.** Fewer feels thin; more does not fit a phone session.
- **At least 2 widget cards.** Reuse what exists in `app/src/widgets/` — read a few neighbouring
  lessons to see how widgets are invoked. Write a new widget only when it earns its place, and give
  it a doc comment saying what is real and what is illustrative.
- **6–8 exercises spanning at least 4 kinds** (mcq, multi, truefalse, fill, order, match, numeric).
- **A `why` on every exercise.** This is where the teaching lands — explain the reasoning, and say
  why the tempting wrong answers are wrong.
- **A "Key takeaways" card** near the end.
- **3–5 references**, real ones.

## Cross-subject links
Use `[text](@subject/lesson-id)` to link, and a `recall` card (3–5 bullets) to refresh an idea in
place. Check the target id exists in that subject's `index.ts` before linking. Re-explain fully only
in the concept's home lesson.

## Accuracy
- Never invent a citation, an author list, a venue or a benchmark score. If you cannot source a
  number, describe the direction of the effect instead and say the figure is not pinned down.
- Separate what was *demonstrated* from what was *claimed*: name the benchmark or experiment.
- Prefer review articles for "the field thinks X", primary papers for specific results.
- Say plainly where a result is contested, failed to replicate, or is an in-silico metric rather
  than an experimental one.
- Prefer a hedge you can defend over a precise number you cannot.

## Traps that have actually bitten us
- **`$` always starts KaTeX math.** Never write a bare dollar for money — write "USD 2.6 billion".
- **Choices are shuffled on screen.** A `why` must never say "option A" or "the first choice".
  A content test enforces this.
- **`fill` banks must repeat duplicated answer words.** If the answer uses `Kp` twice the bank needs
  two. A content test enforces this; without it the card is unanswerable.
- **`match` right-hand chips must be distinct strings.** Matching grades by index, so two identical
  chips make a correct pairing score as wrong.
- **`caption` belongs inside the `widget` object**, not on the card. Card-level `caption` fails the
  typecheck.
- **Check the widget before describing it.** Several lessons have told the reader to do something the
  widget does not do. Read the source; run it if the numbers matter.
- **Hand-authored SVG: check the geometry means what the caption says.** Reviewers have found an
  arrow drawn backwards, a residual skip wired to the wrong node, and bond lengths contradicting
  their own labels.

## Process
Writers do not commit and never run `git stash`, `git checkout` or anything else that changes the
working tree — other agents are editing other files at the same time. The lead commits, and only
after an independent fact-checker has been through the unit.

Before you finish: `cd app && npx vitest run tests/content.test.ts && npx tsc --noEmit`.
Failures outside your own files belong to other agents; leave them alone.
