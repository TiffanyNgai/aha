import { create } from 'zustand';
import { getToken, loadSession, onSession, signOut, syncConfigured, syncUrl, type Session } from './auth';
import { mergeProgress, toDoc, type ProgressDoc } from './merge';
import { useProgress } from '../store/progress';

/**
 * Keeps one person's progress in step across their devices. Every change is pushed a few seconds
 * later; the cloud copy is pulled and merged when the app opens or comes back to the foreground.
 * The worker never merges — it only stores — so two devices writing at once resolve on the client:
 * a stale write comes back as 409 with the newer copy, which we merge and send again.
 */
export type SyncStatus = 'off' | 'signed-out' | 'idle' | 'syncing' | 'needs-signin' | 'error';
interface SyncState { status: SyncStatus; session: Session | null; lastSyncedAt: number | null; error: string | null }
export const useSync = create<SyncState>(() => ({
  status: syncConfigured() ? (loadSession() ? 'idle' : 'signed-out') : 'off',
  session: loadSession(), lastSyncedAt: null, error: null,
}));

const PUSH_DELAY = 4000;
const PULL_INTERVAL = 60_000;
let baseUpdatedAt = 0;   // version of the cloud copy this device last saw
let dirty = false;        // local changes not yet pushed
let applying = false;     // true while we write merged state, so it does not count as a local change
let timer: ReturnType<typeof setTimeout> | null = null;
let inFlight: Promise<void> | null = null;
let lastPull = 0;

async function authed(init: RequestInit = {}): Promise<Response | null> {
  const token = await getToken();
  if (!token) { useSync.setState({ status: 'needs-signin' }); return null; }
  return fetch(syncUrl(), { ...init, headers: { ...(init.headers ?? {}), authorization: `Bearer ${token}` } });
}

function apply(doc: ProgressDoc) {
  applying = true;
  try { useProgress.setState(doc); } finally { applying = false; }
}

const sameDoc = (a: ProgressDoc, b: ProgressDoc) => JSON.stringify(a) === JSON.stringify(b);

async function run(task: () => Promise<void>) {
  // One sync at a time; a request made while one is running waits for it.
  if (inFlight) await inFlight.catch(() => {});
  useSync.setState({ status: 'syncing', error: null });
  inFlight = task();
  try {
    await inFlight;
    if (useSync.getState().status === 'syncing') useSync.setState({ status: 'idle', lastSyncedAt: Date.now() });
  } catch (e) {
    useSync.setState({ status: 'error', error: e instanceof Error ? e.message : String(e) });
  } finally { inFlight = null; }
}

async function putDoc(doc: ProgressDoc): Promise<boolean> {
  const res = await authed({ method: 'PUT', body: JSON.stringify(doc), headers: { 'content-type': 'application/json', 'x-base-updated-at': String(baseUpdatedAt) } });
  if (!res) return false;
  if (res.status === 409) {
    // Another device wrote first: merge its copy with ours and try once more from its version.
    const remote = (await res.json()) as ProgressDoc | null;
    baseUpdatedAt = Number(res.headers.get('x-updated-at') ?? 0);
    const merged = remote ? mergeProgress(toDoc(useProgress.getState()), remote) : toDoc(useProgress.getState());
    apply(merged);
    const again = await authed({ method: 'PUT', body: JSON.stringify(merged), headers: { 'content-type': 'application/json', 'x-base-updated-at': String(baseUpdatedAt) } });
    if (!again || !again.ok) throw new Error(`sync write failed (${again?.status ?? 'no token'})`);
    baseUpdatedAt = ((await again.json()) as { updatedAt: number }).updatedAt;
    return true;
  }
  if (!res.ok) throw new Error(`sync write failed (${res.status})`);
  baseUpdatedAt = ((await res.json()) as { updatedAt: number }).updatedAt;
  return true;
}

/** Fetch the cloud copy, merge it in, and push the result if that changed anything. */
export function pull() {
  return run(async () => {
    lastPull = Date.now();
    const res = await authed();
    if (!res) return;
    const local = toDoc(useProgress.getState());
    if (res.status === 204) { baseUpdatedAt = 0; await putDoc(local); dirty = false; return; }
    if (!res.ok) throw new Error(`sync read failed (${res.status})`);
    const remote = (await res.json()) as ProgressDoc;
    baseUpdatedAt = Number(res.headers.get('x-updated-at') ?? 0);
    const merged = mergeProgress(local, remote);
    if (!sameDoc(merged, local)) apply(merged);
    if (!sameDoc(merged, remote)) await putDoc(merged);
    dirty = false;
  });
}

/** Push local changes now (normally called from the debounce). */
export function push() {
  if (!dirty) return Promise.resolve();
  return run(async () => { await putDoc(toDoc(useProgress.getState())); dirty = false; });
}

function schedulePush() {
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => { timer = null; push(); }, PUSH_DELAY);
}

/** Remove this account's cloud copy. Local progress stays. */
export async function deleteCloudCopy() {
  const res = await authed({ method: 'DELETE' });
  if (res && !res.ok && res.status !== 204) throw new Error(`delete failed (${res.status})`);
  baseUpdatedAt = 0;
}

export function signOutAndStop() {
  signOut();
  dirty = false; baseUpdatedAt = 0;
}

let started = false;
/** Call once at app start. Safe to call when sync is not configured or nobody is signed in. */
export function startSync() {
  if (started || !syncConfigured()) return;
  started = true;

  useProgress.subscribe(() => {
    if (applying || !useSync.getState().session) return;
    dirty = true;
    schedulePush();
  });

  onSession((s) => {
    useSync.setState({ session: s, status: s ? 'idle' : 'signed-out', error: null });
    if (s) { dirty = true; pull(); }
  });

  const active = () => !!useSync.getState().session && useSync.getState().status !== 'needs-signin';
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') { if (dirty && active()) push(); }
    else if (active() && Date.now() - lastPull > PULL_INTERVAL) pull();
  });
  window.addEventListener('online', () => { if (active()) pull(); });

  if (active()) pull();
}
