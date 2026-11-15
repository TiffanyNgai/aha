# AHA! build-out ledger

Live state of the content build. Update this when a unit is committed.

## Where things stand (2026-11-15)

| Subject | Written / planned |
|---|---|
| Mathematics | **99 / 99 — complete** |
| Machine learning | 89 / 120 |
| Computational drug discovery | 80 / 97 |
| Quantum | 9 / 100 |
| Biology | 8 / 125 |
| Chemistry | 8 / 107 |
| Computer science | 8 / 122 |
| Physics | 8 / 112 |
| Robotics | 8 / 117 |
| Statistics | 8 / 108 |
| **Total** | **325 / 1107 (29%)** |

Every committed lesson has been through an independent fact-check. Nothing is committed otherwise.

## Subject order (set by Tiffany)
1. math *(done)*, ml, drug
2. stats, robotics
3. chem, bio
4. the rest: physics, med, quantum, cs

Start a later tier only when the tier above has no unwritten units left.

## Still to write
- **ml:** llms, rl-foundations, value-based-rl, policy-optimization, advanced-rl, research-practice
- **drug:** quantum-drug, translational, research-practice
- then tier 2 onwards, plus a `frontiers` unit for every subject that lacks one
  (math and ml have theirs; see `docs/FRONTIERS_BRIEF.md`)

## How the pipeline runs
Writer agent per unit → independent fact-checker (a lighter model is fine for checking) → lead
verifies in a throwaway `git worktree` → commit → push. Briefs: `docs/WRITER_BRIEF.md`,
`docs/REVIEWER_BRIEF.md`, `docs/FRONTIERS_BRIEF.md`.

## Rules learned the hard way
- **Never `git stash`** while agents are running. It once yanked eight agents' untracked files
  mid-write. Verify a commit by checking out HEAD into a separate worktree instead.
- **Commit a lesson's new widgets with it.** Two commits shipped lessons whose widget files were
  still untracked; the worktree check caught "unknown widget" before it reached the site.
- **Keep these briefs in the repo.** They used to live in a session scratchpad under `/tmp`, which
  was wiped between sessions — a dozen agents then worked without them.
- **Node 22 is required** (`.nvmrc`). The build fails on Node 18.
- Content tests enforce: no positional references in `why`, and `fill` banks that repeat duplicated
  answer words. Run `npx vitest run tests/content.test.ts` and `npx tsc --noEmit` before committing.
