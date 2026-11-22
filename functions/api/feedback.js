/* TA SERIES feedback API — Cloudflare Pages Function.
 *
 * Route: POST /api/feedback (same origin as the site, no CORS needed).
 * Saves one feedback message into Cloudflare KV (binding FEEDBACK_KV).
 * One key per message: fb:<ISO time>:<random> -> {"name","message","page","time"}
 *
 * The KV namespace must be created in the Cloudflare dashboard and bound
 * to this Pages project as variable FEEDBACK_KV:
 *   Workers & Pages -> KV -> Create namespace "TA-SERIES-FEEDBACK"
 *   Workers & Pages -> taseries (Pages) -> Settings -> Functions
 *   -> KV namespace bindings -> Add binding: FEEDBACK_KV -> TA-SERIES-FEEDBACK
 */

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.FEEDBACK_KV) {
    return json({ ok: false, error: 'Feedback storage is not configured yet.' }, 500);
  }
  let body;
  try {
    body = await request.json();
  } catch (e) {
    return json({ ok: false, error: 'Body must be JSON.' }, 400);
  }
  const message = typeof body.message === 'string' ? body.message.trim() : '';
  const name = typeof body.name === 'string' ? body.name.trim().slice(0, 100) : '';
  const page = typeof body.page === 'string' ? body.page.trim().slice(0, 200) : '';
  if (!message) return json({ ok: false, error: 'Message is empty.' }, 400);
  if (message.length > 2000) return json({ ok: false, error: 'Message is too long.' }, 400);

  const time = new Date().toISOString();
  const key = 'fb:' + time + ':' + crypto.randomUUID().slice(0, 8);
  await env.FEEDBACK_KV.put(key, JSON.stringify({ name: name, message: message, page: page, time: time }));
  return json({ ok: true });
}

export async function onRequest(context) {
  // Any method other than POST gets a plain 405.
  return json({ ok: false, error: 'Method not allowed.' }, 405);
}
