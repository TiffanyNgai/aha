import type { LessonRecord, ResumePoint, Settings, SrsItem } from '../store/progress';

/** The persisted part of the progress store — what gets synced. */
export interface ProgressDoc {
  xp: number; streak: number; bestStreak: number; lastActiveDay: string | null; freezes: number;
  xpByDay: Record<string, number>; hearts: number; heartsUpdatedAt: number;
  lessons: Record<string, LessonRecord>; resume: Record<string, ResumePoint>; srs: Record<string, SrsItem>;
  settings: Settings; seenInstallTip: boolean;
}

const maxBy = <T>(a: T | undefined, b: T | undefined, key: (x: T) => number): T | undefined =>
  a === undefined ? b : b === undefined ? a : key(b) > key(a) ? b : a;

/**
 * Combine progress from two devices without losing work on either.
 *
 * Per-item fields are merged item by item (a lesson finished on the phone and another on the
 * laptop both count). Daily XP takes the larger figure for each day rather than the sum: the two
 * copies usually overlap, and the same lesson counted twice would be worse than undercounting the
 * rare day a learner used both devices. Total XP is then rebuilt from the daily figures so the
 * number on screen always equals what the history shows. Device-ish fields (hearts, settings)
 * follow whichever copy was active more recently.
 */
export function mergeProgress(a: ProgressDoc, b: ProgressDoc): ProgressDoc {
  const recent = (b.lastActiveDay ?? '') > (a.lastActiveDay ?? '') || (b.lastActiveDay === a.lastActiveDay && b.heartsUpdatedAt > a.heartsUpdatedAt) ? b : a;

  const lessons: Record<string, LessonRecord> = {};
  for (const k of new Set([...Object.keys(a.lessons), ...Object.keys(b.lessons)])) {
    const x = a.lessons[k], y = b.lessons[k];
    lessons[k] = !x ? y : !y ? x : { crowns: Math.max(x.crowns, y.crowns), best: Math.max(x.best, y.best), lastAt: Math.max(x.lastAt, y.lastAt) };
  }
  const srs: Record<string, SrsItem> = {};
  for (const k of new Set([...Object.keys(a.srs), ...Object.keys(b.srs)])) srs[k] = maxBy(a.srs[k], b.srs[k], (s) => s.due)!;
  const resume: Record<string, ResumePoint> = {};
  for (const k of new Set([...Object.keys(a.resume), ...Object.keys(b.resume)])) {
    const r = maxBy(a.resume[k], b.resume[k], (s) => s.at)!;
    if (!lessons[k] || lessons[k].lastAt < r.at) resume[k] = r;  // a finished lesson has no resume point
  }
  const xpByDay: Record<string, number> = {};
  for (const d of new Set([...Object.keys(a.xpByDay), ...Object.keys(b.xpByDay)])) xpByDay[d] = Math.max(a.xpByDay[d] ?? 0, b.xpByDay[d] ?? 0);
  const xp = Object.values(xpByDay).reduce((s, v) => s + v, 0);

  // Streak: the copy active most recently knows the current run; a longer run on the same day wins.
  const sameDay = a.lastActiveDay === b.lastActiveDay;
  const streakSrc = sameDay ? (b.streak > a.streak ? b : a) : recent;

  return {
    xp, xpByDay, lessons, srs, resume,
    streak: streakSrc.streak, freezes: streakSrc.freezes, lastActiveDay: streakSrc.lastActiveDay,
    bestStreak: Math.max(a.bestStreak, b.bestStreak, a.streak, b.streak),
    hearts: recent.hearts, heartsUpdatedAt: recent.heartsUpdatedAt,
    settings: recent.settings,
    seenInstallTip: a.seenInstallTip || b.seenInstallTip,
  };
}

/** Strip actions and anything non-persistent from the live store state. */
export function toDoc(s: object): ProgressDoc {
  const { xp, streak, bestStreak, lastActiveDay, freezes, xpByDay, hearts, heartsUpdatedAt, lessons, resume, srs, settings, seenInstallTip } = s as unknown as ProgressDoc;
  return { xp, streak, bestStreak, lastActiveDay, freezes, xpByDay, hearts, heartsUpdatedAt, lessons, resume, srs, settings, seenInstallTip };
}
