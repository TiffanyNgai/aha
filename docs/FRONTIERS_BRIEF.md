# Brief: the "Frontiers & open problems" unit

Every subject gets ONE extra unit, appended as the **last** unit of its curriculum. Read
`docs/WRITER_BRIEF.md` first — everything in it still applies. This file only adds what is different.

## What this unit is for
A researcher-facing finish to each subject: where the field actually stands, what nobody can do yet,
why those things are hard, and what has been tried. It is the lesson a curious outsider reads to find
out what is genuinely open — not a survey, and not a hype reel.

## Who is reading
Someone who has worked through this subject but may have **no background in it professionally**, and
no background in the fields you borrow ideas from. So:
- Keep the ordinary AHA! tone: plain, warm, concrete. No insider shorthand, no breathless adjectives.
- Define every term the moment you use it, even ones the field treats as obvious.
- When you lean on another subject, add a `recall` card or an inline `[text](@subject/lesson)` link.
- Repeating something already covered elsewhere in the app is fine here. Say it again briefly rather
  than sending the reader away mid-argument.

## Curriculum entry (you add this yourself)
You MAY edit your own subject's `index.ts` — and only that file — to append this unit at the end:

```ts
{
  id: 'frontiers',
  title: 'Frontiers & open problems',
  summary: 'Where the field stands today, what nobody can do yet, and why it is hard.',
  references: [ /* 3–5 real survey/review/roadmap works for this subject */ ],
  lessons: [
    { id: 'frontier-state-of-the-art', title: 'The state of the art', summary: '…', prereqs: [...] },
    { id: 'frontier-open-problems',    title: 'What nobody can do yet',  summary: '…', prereqs: [...] },
    { id: 'frontier-why-hard',         title: 'Why these problems are hard', summary: '…', prereqs: [...] },
    { id: 'frontier-cross-field',      title: 'Ideas borrowed from elsewhere', summary: '…', prereqs: [...] },
    { id: 'frontier-reading-research', title: 'Following the frontier', summary: '…', prereqs: [...] },
  ],
},
```
Keep those five ids exactly; write your own titles/summaries if better ones fit the subject. Prereqs
should point at the subject's own core lessons (and cross-subject home lessons) that a reader needs.
Re-read `index.ts` immediately before editing — other agents write lessons for the same subject.

## What each lesson covers
1. **The state of the art.** What the field can reliably do now that it could not ~10 years ago, and
   what the current best methods actually are. Separate *demonstrated* from *claimed*: name the
   benchmark or experiment behind each claim, and say where results are contested.
2. **What nobody can do yet.** The 4–6 headline open problems, stated precisely enough that the reader
   would recognise a solution. Include at least one that sounds easy but isn't.
3. **Why these problems are hard.** For each: the actual blocker — missing data, unmeasurable
   quantity, combinatorial explosion, no theory, no ground truth, cost, irreproducibility. Then what
   has been *tried*: which approaches failed, which partly worked and why they stalled, and any that
   recently broke through. This is the heart of the unit; be specific and name papers.
4. **Ideas borrowed from elsewhere.** Concrete cross-field transfers in or out of this subject —
   methods from physics/ML/statistics/biology that changed it, and ideas this subject exported. Give
   the mechanism of the analogy, not just the name-drop, and be honest where an analogy breaks down.
5. **Following the frontier.** How this field actually communicates: key venues and preprint servers,
   the benchmarks that matter and how they get gamed, replication record, how to read a paper in this
   field critically, and 3–5 open questions a newcomer could realistically work on.

## Accuracy rules (stricter than usual here)
- Your knowledge has a cutoff. Say plainly that the frontier moves, date your claims, and never
  claim to know the very newest result.
- Every SOTA claim needs a named source and a date. If you cannot pin the source, describe the
  direction of progress without the number.
- Prefer review articles and roadmap papers for "the field thinks X"; prefer primary papers for
  specific results. Never invent a citation, a benchmark score or an author list.
- Mark contested claims as contested. Where a famous result failed to replicate, say so.
- No hype. If a technology is oversold, say what it does and does not do.

## Shape
Same bar as any other lesson: 14–17 cards, ≥2 widget cards, 6–8 exercises across ≥4 kinds, a `why` on
every exercise, a "Key takeaways" card, 3–5 references. Exercises here should test judgement —
"which claim is actually supported by this evidence?", "what is the blocker in this case?" — not
recall of names. Widgets: reuse existing ones wherever possible (timelines and progress curves with
SvgDiagram or FunctionPlot, StepReveal for an argument). Build a new one only if it earns its place.
