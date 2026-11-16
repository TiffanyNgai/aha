import { useEffect, useRef, useState } from 'react';
import { renderSignInButton, syncConfigured } from '../lib/auth';
import { deleteCloudCopy, pull, signOutAndStop, useSync } from '../lib/sync';

const ago = (t: number) => {
  const s = Math.round((Date.now() - t) / 1000);
  return s < 60 ? 'just now' : s < 3600 ? `${Math.round(s / 60)} min ago` : `${Math.round(s / 3600)} h ago`;
};

/** Sign in, see sync state, sign out, or wipe the cloud copy. */
export function AccountCard() {
  const { status, session, lastSyncedAt, error } = useSync();
  const btn = useRef<HTMLDivElement>(null);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!session && btn.current && syncConfigured()) renderSignInButton(btn.current).catch((e) => setMsg(e.message));
  }, [session]);

  if (!syncConfigured()) {
    return <div className="card account"><p className="muted" style={{ margin: 0, fontSize: 14 }}>Cross-device sync is not set up for this build. Progress stays on this device; use Export/Import to move it.</p></div>;
  }
  if (!session) {
    return (
      <div className="card account">
        <p style={{ margin: '0 0 10px', fontSize: 14 }}>Sign in to keep your progress in step across your phone, tablet and laptop. Only you can see it.</p>
        <div ref={btn} className="gsi-slot" />
        {msg && <div className="banner" style={{ marginTop: 10 }}>{msg}</div>}
      </div>
    );
  }
  const line =
    status === 'syncing' ? 'Syncing…'
    : status === 'needs-signin' ? 'Session expired — sign in again to keep syncing.'
    : status === 'error' ? `Sync problem: ${error}`
    : lastSyncedAt ? `Synced ${ago(lastSyncedAt)}` : 'Signed in';
  return (
    <div className="card account">
      <div className="row">
        {session.picture ? <img className="avatar-img" src={session.picture} alt="" referrerPolicy="no-referrer" /> : <span className="avatar-img" />}
        <div className="grow" style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{session.name ?? 'Signed in'}</div>
          <div className="muted" style={{ fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{session.email}</div>
        </div>
      </div>
      <div className={'sync-line' + (status === 'error' || status === 'needs-signin' ? ' warn' : '')}>{line}</div>
      <div className="row" style={{ flexWrap: 'wrap' }}>
        <button className="btn small blue" disabled={status === 'syncing'} onClick={() => pull()}>⟳ Sync now</button>
        <button className="btn small secondary" onClick={() => { signOutAndStop(); setMsg('Signed out. Progress stays on this device.'); }}>Sign out</button>
        <button className="btn small danger" onClick={async () => {
          if (!confirm('Delete the copy of your progress stored in your account? This device keeps its own copy, and syncing will upload it again unless you sign out.')) return;
          try { await deleteCloudCopy(); setMsg('Cloud copy deleted.'); } catch (e) { setMsg(e instanceof Error ? e.message : String(e)); }
        }}>Delete cloud copy</button>
      </div>
      {msg && <div className="banner" style={{ marginTop: 10 }}>{msg}</div>}
    </div>
  );
}
