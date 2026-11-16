/**
 * Progress sync: one row per Google account in D1, holding the learner's progress as gzip'd JSON.
 * The client merges before it writes (see app/src/lib/merge.ts); the server only stores, and
 * refuses a write whose base version is stale so the client can merge again.
 */
import { verifyGoogleToken } from './google';

export interface SyncEnv { SYNC_DB: D1Database; GOOGLE_CLIENT_ID: string }

/** Largest progress document accepted, before compression. */
export const MAX_SYNC_BODY = 1_500_000;

let ready: Promise<void> | null = null;
function ensureTable(db: D1Database) {
  // Lazy schema so deploying needs only `wrangler d1 create`, no migration step.
  ready ??= db.prepare('CREATE TABLE IF NOT EXISTS progress (sub TEXT PRIMARY KEY, data BLOB NOT NULL, updated_at INTEGER NOT NULL)').run().then(() => undefined);
  return ready;
}

async function gzip(text: string): Promise<ArrayBuffer> {
  return new Response(new Blob([text]).stream().pipeThrough(new CompressionStream('gzip'))).arrayBuffer();
}
async function gunzip(buf: ArrayBuffer): Promise<string> {
  return new Response(new Blob([buf]).stream().pipeThrough(new DecompressionStream('gzip'))).text();
}

const json = (body: unknown, status = 200, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', ...headers } });

export async function handleSync(req: Request, env: SyncEnv, cors: Record<string, string>): Promise<Response> {
  if (!env.SYNC_DB || !env.GOOGLE_CLIENT_ID) return new Response('sync not configured', { status: 501, headers: cors });
  const auth = req.headers.get('authorization') ?? '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  const who = token ? await verifyGoogleToken(token, env.GOOGLE_CLIENT_ID) : null;
  if (!who) return new Response('unauthorized', { status: 401, headers: cors });
  await ensureTable(env.SYNC_DB);

  if (req.method === 'GET') {
    const row = await env.SYNC_DB.prepare('SELECT data, updated_at FROM progress WHERE sub = ?').bind(who.sub).first<{ data: ArrayBuffer; updated_at: number }>();
    if (!row) return new Response(null, { status: 204, headers: cors });
    return new Response(await gunzip(row.data), { headers: { ...cors, 'content-type': 'application/json', 'x-updated-at': String(row.updated_at) } });
  }

  if (req.method === 'PUT') {
    const text = await req.text();
    if (text.length > MAX_SYNC_BODY) return new Response('too large', { status: 413, headers: cors });
    let doc: any;
    try { doc = JSON.parse(text); } catch { return new Response('bad json', { status: 400, headers: cors }); }
    // Store only what looks like a progress document; never arbitrary JSON.
    if (typeof doc !== 'object' || doc === null || typeof doc.xp !== 'number' || typeof doc.lessons !== 'object') return new Response('bad document', { status: 400, headers: cors });

    const base = Number(req.headers.get('x-base-updated-at') ?? 0);
    const cur = await env.SYNC_DB.prepare('SELECT updated_at FROM progress WHERE sub = ?').bind(who.sub).first<{ updated_at: number }>();
    if (cur && cur.updated_at !== base) {
      // Another device wrote since this client last pulled: hand back the newer copy to merge.
      const row = await env.SYNC_DB.prepare('SELECT data, updated_at FROM progress WHERE sub = ?').bind(who.sub).first<{ data: ArrayBuffer; updated_at: number }>();
      return new Response(row ? await gunzip(row.data) : 'null', { status: 409, headers: { ...cors, 'content-type': 'application/json', 'x-updated-at': String(row?.updated_at ?? 0) } });
    }
    const updatedAt = Date.now();
    await env.SYNC_DB.prepare('INSERT INTO progress (sub, data, updated_at) VALUES (?, ?, ?) ON CONFLICT(sub) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at')
      .bind(who.sub, await gzip(text), updatedAt).run();
    return json({ updatedAt }, 200, cors);
  }

  if (req.method === 'DELETE') {
    await env.SYNC_DB.prepare('DELETE FROM progress WHERE sub = ?').bind(who.sub).run();
    return new Response(null, { status: 204, headers: cors });
  }
  return new Response('method not allowed', { status: 405, headers: cors });
}
