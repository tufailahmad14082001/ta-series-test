/* TA SERIES feedback admin page — Cloudflare Pages Function.
 *
 * Route: GET /admin/feedback
 * Lists saved feedback, newest first, as a simple private page.
 *
 * SECURITY: This page has NO login. It is private by obscurity only —
 * anyone who guesses the URL can read the feedback. Do not share the link,
 * do not link to it from the site, and do not put it in the sitemap.
 * If a login is wanted later, put Cloudflare Access (free) in front of
 * /admin/* — no code change needed.
 */

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

export async function onRequestGet(context) {
  const { env } = context;
  if (!env.FEEDBACK_KV) {
    return new Response('Feedback storage is not configured yet.', { status: 500 });
  }
  const listed = await env.FEEDBACK_KV.list({ prefix: 'fb:', limit: 200 });
  // Keys start with an ISO timestamp, so alphabetical order = oldest first.
  const keys = listed.keys.map(function (k) { return k.name; }).sort().reverse();
  const rows = [];
  for (const key of keys) {
    try {
      const raw = await env.FEEDBACK_KV.get(key);
      if (!raw) continue;
      rows.push(JSON.parse(raw));
    } catch (e) { /* skip one bad entry */ }
  }
  const cards = rows.map(function (f) {
    const when = new Date(f.time).toLocaleString('en-GB', {
      timeZone: 'Asia/Karachi', dateStyle: 'medium', timeStyle: 'short',
    });
    return '<div class="card"><div class="meta">' + esc(when) + ' &middot; ' + esc(f.page || 'home') + '</div>'
      + '<div class="name">' + esc(f.name || 'Anonymous') + '</div>'
      + '<p>' + esc(f.message).replace(/\n/g, '<br>') + '</p></div>';
  }).join('\n') || '<p>No feedback yet.</p>';

  const html = '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">'
    + '<meta name="viewport" content="width=device-width, initial-scale=1.0">'
    + '<meta name="robots" content="noindex, nofollow">'
    + '<title>Feedback &mdash; TA SERIES (private)</title><style>'
    + 'body{font-family:system-ui,Arial,sans-serif;margin:0;background:#f4f8f8;color:#12304a}'
    + 'header{background:#0E7C86;color:#fff;padding:16px 20px}'
    + 'header h1{font-size:19px;margin:0}header p{margin:4px 0 0;font-size:13px;opacity:.9}'
    + 'main{max-width:680px;margin:0 auto;padding:16px}'
    + '.card{background:#fff;border-radius:12px;padding:14px 16px;margin-bottom:12px;box-shadow:0 2px 8px rgba(18,48,74,.08)}'
    + '.meta{font-size:12px;color:#566676}.name{font-weight:700;margin-top:4px}'
    + '.card p{margin:8px 0 0;line-height:1.6;white-space:pre-wrap}'
    + '</style></head><body><header><h1>TA SERIES &mdash; Feedback</h1>'
    + '<p>Private page. Do not share this link &mdash; there is no login on it.</p></header>'
    + '<main><p>' + rows.length + ' message' + (rows.length === 1 ? '' : 's') + '</p>'
    + cards + '</main></body></html>';
  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

export async function onRequest(context) {
  return new Response('Method not allowed.', { status: 405 });
}
