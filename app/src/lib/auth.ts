/**
 * Google Sign-In via Google Identity Services. The ID token it hands us is the only credential
 * the sync worker accepts; it lasts an hour and is renewed silently while the browser stays
 * signed in to Google. Configure VITE_GOOGLE_CLIENT_ID (and VITE_PUSH_URL for the worker).
 */
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
const WORKER_URL = import.meta.env.VITE_PUSH_URL as string | undefined;

export const syncConfigured = () => !!(CLIENT_ID && WORKER_URL);
export const syncUrl = () => `${WORKER_URL}/sync`;

export interface Session { token: string; exp: number; sub: string; name?: string; email?: string; picture?: string }

declare global {
  interface Window { google?: any }
}

const KEY = 'aha-auth';
export function loadSession(): Session | null {
  try { const s = JSON.parse(localStorage.getItem(KEY) ?? 'null'); return s && typeof s.token === 'string' ? s : null; } catch { return null; }
}
function saveSession(s: Session | null) {
  try { s ? localStorage.setItem(KEY, JSON.stringify(s)) : localStorage.removeItem(KEY); } catch { /* storage unavailable */ }
}

function decode(token: string): Session | null {
  try {
    const p = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return { token, exp: p.exp * 1000, sub: p.sub, name: p.name, email: p.email, picture: p.picture };
  } catch { return null; }
}

let gis: Promise<void> | null = null;
let pending: ((s: Session | null) => void) | null = null;
const listeners = new Set<(s: Session | null) => void>();
export const onSession = (fn: (s: Session | null) => void) => { listeners.add(fn); return () => void listeners.delete(fn); };

function loadGis(): Promise<void> {
  gis ??= new Promise<void>((resolve, reject) => {
    if (window.google?.accounts?.id) return resolve();
    const el = document.createElement('script');
    el.src = 'https://accounts.google.com/gsi/client'; el.async = true; el.defer = true;
    el.onload = () => resolve(); el.onerror = () => reject(new Error('Could not load Google Sign-In'));
    document.head.appendChild(el);
  }).then(() => {
    window.google.accounts.id.initialize({
      client_id: CLIENT_ID,
      auto_select: true,
      itp_support: true,
      callback: (r: { credential: string }) => {
        const s = decode(r.credential);
        saveSession(s);
        listeners.forEach((fn) => fn(s));
        pending?.(s); pending = null;
      },
    });
  });
  return gis;
}

/** Draw Google's own sign-in button into `el`. */
export async function renderSignInButton(el: HTMLElement) {
  await loadGis();
  window.google.accounts.id.renderButton(el, { theme: 'outline', size: 'large', shape: 'pill', text: 'signin_with', width: 260 });
}

/** Ask Google for a fresh credential without the user clicking anything. Resolves null if it can't. */
function silentRenew(): Promise<Session | null> {
  return new Promise(async (resolve) => {
    try { await loadGis(); } catch { return resolve(null); }
    const timer = setTimeout(() => { if (pending) { pending = null; resolve(null); } }, 8000);
    pending = (s) => { clearTimeout(timer); resolve(s); };
    window.google.accounts.id.prompt((n: any) => {
      // The prompt was skipped or dismissed, so no callback is coming.
      if (n.isNotDisplayed?.() || n.isSkippedMoment?.() || n.isDismissedMoment?.()) { if (pending) { pending = null; clearTimeout(timer); resolve(null); } }
    });
  });
}

/** A token the worker will accept, renewing it if it is about to expire. Null means sign in again. */
export async function getToken(): Promise<string | null> {
  const s = loadSession();
  if (!s) return null;
  if (s.exp > Date.now() + 60_000) return s.token;
  const fresh = await silentRenew();
  return fresh?.sub === s.sub ? fresh.token : null;
}

export function signOut() {
  saveSession(null);
  try { window.google?.accounts?.id?.disableAutoSelect(); } catch { /* not loaded */ }
  listeners.forEach((fn) => fn(null));
}
