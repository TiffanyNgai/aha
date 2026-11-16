/**
 * Verifies a Google Sign-In ID token (RS256 JWT) with WebCrypto, no library.
 * Returns the stable Google account id (`sub`) and profile fields on success, null otherwise.
 */
export interface GoogleIdentity { sub: string; email?: string; name?: string; picture?: string }

interface Jwk { kid: string; kty: string; n: string; e: string; alg?: string; use?: string }

const CERTS_URL = 'https://www.googleapis.com/oauth2/v3/certs';
const ISSUERS = new Set(['https://accounts.google.com', 'accounts.google.com']);

// Google rotates keys; cache them for the lifetime its Cache-Control header allows.
let cache: { keys: Jwk[]; until: number } | null = null;

export type FetchLike = (url: string) => Promise<Response>;

async function keys(fetchImpl: FetchLike): Promise<Jwk[]> {
  if (cache && Date.now() < cache.until) return cache.keys;
  const res = await fetchImpl(CERTS_URL);
  if (!res.ok) throw new Error(`certs ${res.status}`);
  const maxAge = /max-age=(\d+)/.exec(res.headers.get('cache-control') ?? '')?.[1];
  const body = (await res.json()) as { keys: Jwk[] };
  cache = { keys: body.keys, until: Date.now() + Math.min(+(maxAge ?? 3600), 86400) * 1000 };
  return cache.keys;
}

const b64urlToBytes = (s: string) => {
  const pad = '='.repeat((4 - (s.length % 4)) % 4);
  return Uint8Array.from(atob((s + pad).replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0));
};
const decodeJson = (s: string) => JSON.parse(new TextDecoder().decode(b64urlToBytes(s)));

export async function verifyGoogleToken(token: string, clientId: string, fetchImpl: FetchLike = fetch, now = Date.now()): Promise<GoogleIdentity | null> {
  if (typeof token !== 'string' || token.length > 4096) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  let header: any, payload: any;
  try { header = decodeJson(parts[0]); payload = decodeJson(parts[1]); } catch { return null; }
  if (header?.alg !== 'RS256' || typeof header.kid !== 'string') return null;

  const jwk = (await keys(fetchImpl)).find((k) => k.kid === header.kid);
  if (!jwk) return null;
  const key = await crypto.subtle.importKey('jwk', { kty: jwk.kty, n: jwk.n, e: jwk.e, alg: 'RS256', ext: true }, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
  const ok = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, b64urlToBytes(parts[2]), new TextEncoder().encode(`${parts[0]}.${parts[1]}`));
  if (!ok) return null;

  const sec = Math.floor(now / 1000);
  if (!ISSUERS.has(payload.iss) || payload.aud !== clientId) return null;
  if (typeof payload.exp !== 'number' || payload.exp < sec - 60) return null;  // a minute of clock skew
  if (typeof payload.sub !== 'string' || !/^\d{1,64}$/.test(payload.sub)) return null;
  return { sub: payload.sub, email: payload.email, name: payload.name, picture: payload.picture };
}

/** Test hook: forget cached certificates. */
export const _resetCertCache = () => { cache = null; };
