import { describe, expect, it } from 'vitest';
import { mergeProgress, type ProgressDoc } from '../src/lib/merge';
import { _resetCertCache, verifyGoogleToken } from '../../push-worker/src/google';

// The token tests use global WebCrypto, which needs the Node 22 this project requires (.nvmrc).

const base = (over: Partial<ProgressDoc> = {}): ProgressDoc => ({
  xp: 0, streak: 0, bestStreak: 0, lastActiveDay: null, freezes: 1, xpByDay: {}, hearts: 5, heartsUpdatedAt: 0,
  lessons: {}, resume: {}, srs: {},
  settings: { dailyGoal: 30, reminderHour: 19, pushEnabled: false, heartsEnabled: true, sound: true, theme: 'system' },
  seenInstallTip: false, ...over,
});

describe('mergeProgress', () => {
  it('keeps lessons finished on either device and takes the best of each', () => {
    const phone = base({ lessons: { 'math/a': { crowns: 1, best: 0.8, lastAt: 10 } }, xpByDay: { '2026-11-15': 20 } });
    const laptop = base({ lessons: { 'math/a': { crowns: 2, best: 0.6, lastAt: 20 }, 'ml/b': { crowns: 1, best: 1, lastAt: 30 } }, xpByDay: { '2026-11-14': 15 } });
    const m = mergeProgress(phone, laptop);
    expect(m.lessons['math/a']).toEqual({ crowns: 2, best: 0.8, lastAt: 20 });
    expect(m.lessons['ml/b'].crowns).toBe(1);
    expect(m.xpByDay).toEqual({ '2026-11-15': 20, '2026-11-14': 15 });
    expect(m.xp).toBe(35);
  });

  it('never double counts a day both copies already have', () => {
    const m = mergeProgress(base({ xpByDay: { d: 30 }, xp: 30 }), base({ xpByDay: { d: 30 }, xp: 30 }));
    expect(m.xp).toBe(30);
  });

  it('follows the most recently active copy for streak and settings', () => {
    const older = base({ lastActiveDay: '2026-11-10', streak: 9, settings: { ...base().settings, dailyGoal: 15 } });
    const newer = base({ lastActiveDay: '2026-11-15', streak: 2, bestStreak: 3, settings: { ...base().settings, dailyGoal: 50 } });
    const m = mergeProgress(older, newer);
    expect(m.streak).toBe(2);
    expect(m.bestStreak).toBe(9);
    expect(m.settings.dailyGoal).toBe(50);
    expect(mergeProgress(newer, older).streak).toBe(2);
  });

  it('drops a resume point once the lesson has been finished elsewhere', () => {
    const paused = base({ resume: { 'math/a': { idx: 4, total: 16, awarded: 1, at: 100 } } });
    const finished = base({ lessons: { 'math/a': { crowns: 1, best: 1, lastAt: 200 } } });
    expect(mergeProgress(paused, finished).resume['math/a']).toBeUndefined();
    const finishedEarlier = base({ lessons: { 'math/a': { crowns: 1, best: 1, lastAt: 50 } } });
    expect(mergeProgress(paused, finishedEarlier).resume['math/a']?.idx).toBe(4);
  });

  it('is symmetric for item-wise fields', () => {
    const a = base({ srs: { k1: { ease: 2.5, interval: 3, due: 500, reps: 2 } }, lessons: { x: { crowns: 1, best: 1, lastAt: 1 } } });
    const b = base({ srs: { k1: { ease: 2.3, interval: 1, due: 900, reps: 1 }, k2: { ease: 2.5, interval: 0, due: 1, reps: 0 } } });
    const ab = mergeProgress(a, b), ba = mergeProgress(b, a);
    expect(ab.srs).toEqual(ba.srs);
    expect(ab.srs.k1.due).toBe(900);
    expect(ab.lessons).toEqual(ba.lessons);
  });
});

// Build a real RS256 token with a throwaway key, then verify it against a fake JWKS endpoint.
const b64url = (b: ArrayBuffer | string) => {
  const bytes = typeof b === 'string' ? new TextEncoder().encode(b) : new Uint8Array(b);
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};
async function mint(payload: object, kid = 'k1') {
  const pair = await crypto.subtle.generateKey({ name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' }, true, ['sign', 'verify']);
  const jwk = await crypto.subtle.exportKey('jwk', pair.publicKey);
  const head = b64url(JSON.stringify({ alg: 'RS256', kid, typ: 'JWT' }));
  const body = b64url(JSON.stringify(payload));
  const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', pair.privateKey, new TextEncoder().encode(`${head}.${body}`));
  const fetchImpl = async () => new Response(JSON.stringify({ keys: [{ kid, kty: jwk.kty, n: jwk.n, e: jwk.e, alg: 'RS256', use: 'sig' }] }), { headers: { 'cache-control': 'max-age=60' } });
  return { token: `${head}.${body}.${b64url(sig)}`, fetchImpl };
}

describe('verifyGoogleToken', () => {
  const now = 1_700_000_000_000;
  const good = { iss: 'https://accounts.google.com', aud: 'client-1', sub: '1234567890', exp: now / 1000 + 600, email: 'a@b.c', name: 'A' };

  it('accepts a valid token for the configured client', async () => {
    _resetCertCache();
    const { token, fetchImpl } = await mint(good);
    expect(await verifyGoogleToken(token, 'client-1', fetchImpl, now)).toMatchObject({ sub: '1234567890', email: 'a@b.c' });
  });

  it('rejects the wrong audience, an expired token, a bad signature and a bad issuer', async () => {
    _resetCertCache();
    const { token, fetchImpl } = await mint(good);
    expect(await verifyGoogleToken(token, 'client-2', fetchImpl, now)).toBeNull();
    expect(await verifyGoogleToken(token, 'client-1', fetchImpl, now + 3_600_000)).toBeNull();
    const [h, p, s] = token.split('.');
    expect(await verifyGoogleToken(`${h}.${p}.${s.slice(0, -4)}AAAA`, 'client-1', fetchImpl, now)).toBeNull();
    _resetCertCache();
    const bad = await mint({ ...good, iss: 'https://evil.example' });
    expect(await verifyGoogleToken(bad.token, 'client-1', bad.fetchImpl, now)).toBeNull();
  });

  it('rejects a token signed by a key Google does not publish', async () => {
    _resetCertCache();
    const { token } = await mint(good, 'unknown-kid');
    const other = await mint(good, 'k1');
    expect(await verifyGoogleToken(token, 'client-1', other.fetchImpl, now)).toBeNull();
  });
});
