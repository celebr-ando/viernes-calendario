import { getStore } from '@netlify/blobs';

export default async (req) => {
  const store = getStore('viernes-state');

  if (req.method === 'GET') {
    const doneMap = (await store.get('done', { type: 'json' })) || {};
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
    const doneMap = (await store.get('done', { type: 'json' })) || {};
    doneMap[body.id] = body.done;
    await store.setJSON('done', doneMap);
    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'content-type': 'application/json' }
    });
  }

  return new Response('Method not allowed', { status: 405 });
};

export const config = { path: '/api/state' };
