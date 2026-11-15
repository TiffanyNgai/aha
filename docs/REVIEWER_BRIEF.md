# Brief: fact-checking an AHA! unit

Read `docs/WRITER_BRIEF.md` first — you are checking against that bar. A unit is never committed
until someone other than its writer has been through it.

## Your job
Go card by card. You are not proofreading; you are looking for claims that are wrong.

1. **Citations.** Authors, year and venue must be real, and the work must actually support the claim
   it is attached to. The most common failure is a real paper cited for a result it does not contain.
   Check anything cited in prose but missing from the `references` array.
2. **Numbers.** Recompute every `numeric` answer yourself and check the tolerance is sane. Check
   every figure quoted in prose. Be sceptical of any quantitative claim with no named source.
3. **Answer keys.** Is the keyed answer right? Is every distractor genuinely wrong? A second
   defensible answer is a bug — either the key or the choice must change.
4. **Statements of results.** Missing hypotheses are the classic maths error (Heine–Borel only in
   R^n, Rellich–Kondrachov needs boundary regularity, Noether needs invariance as an identity).
   In empirical subjects, watch for in-silico metrics presented as experimental results.
5. **Widgets.** Read the widget source. Does the card describe what it actually does? Run it if the
   numbers matter — reviewers have caught cards instructing the reader to do things the widget
   cannot do, and quoted outputs that did not reproduce.
6. **Diagrams.** Hand-authored SVG must mean what its caption says. Check coordinates, arrow
   directions and labelled angles against the geometry actually drawn.

## Fixing
Fix what is wrong directly in the files. Where a claim cannot be sourced, weaken it until it is
defensible rather than deleting it — a hedged true statement beats a crisp false one. Never add a
citation you have not verified; an invented reference is worse than no reference.

## Reporting
Say what you fixed, what you verified, and what remains uncertain. The uncertainty list matters:
flag anything you checked from memory rather than from a source, so the lead knows what is soft.
Do not inflate confidence to look thorough.

## Hard rules
- Never run `git stash`, `git checkout`, `git commit` or anything else that changes the working
  tree. Other agents are editing other files; a stash once destroyed eight agents' in-flight work.
  The lead does all committing.
- Run `cd app && npx vitest run tests/content.test.ts` and `npx tsc --noEmit` before finishing.
  Ignore failures in files outside your unit — they belong to other agents mid-write.
- A `why` must never refer to a choice by position; choices are shuffled on screen.
- A `fill` bank must contain each answer word as many times as the answer uses it.
- `match` right-hand chips must be distinct strings.
