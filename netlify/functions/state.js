import { getStore } from '@netlify/blobs';

// Each post's done state lives under its own blob key so concurrent
// toggles never race on a shared read-modify-write of one big JSON blob.
export default async (req) => {
  const store = getStore('viernes-state');

  if (req.method === 'GET') {
    const { blobs } = await store.list();
    const entries = await Promise.all(
      blobs.map(async (b) => [b.key, await store.get(b.key, { type: 'json' })])
    );
    const doneMap = {};
    entries.forEach(([key, value]) => { doneMap[key] = value; });
    return new Response(JSON.stringify(doneMap), {
      headers: { 'content-type': 'application/json', 'cache-control': 'no-store' }
    });
  }

  if (req.method === 'POST') {
    let body;
    try { body = await req.json(); } catch (e) {
      return new Response('Bad request', { status: 400 });
    }
    if (!body || typeof body.id !== 'string' || typeof body.done !== 'boolean') {
      return new Response('Bad request', { status: 400 });
    }
    await store.setJSON(body.id, body.done);
    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'content-type': 'application/json' }
    });
  }

  return new Response('Method not allowed', { status: 405 });
};

export const config = { path: '/api/state' };
