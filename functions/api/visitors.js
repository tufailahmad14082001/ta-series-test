// GET /api/visitors -> { total }
// Total visitors (all time) from GoatCounter, for the home-page stats strip.
// The number is cached for 1 hour, so the site shows a fresh total every hour.
// Needs the GOATCOUNTER_API_KEY environment variable (a GoatCounter API token
// with "Read statistics" permission). The key is never sent to the browser.
export async function onRequest(context) {
  const key = context.env.GOATCOUNTER_API_KEY;
  if (!key) {
    return json({ error: "missing GOATCOUNTER_API_KEY" }, 500);
  }
  const kv = context.env.FEEDBACK_KV;
  // 1-hour cache: read the stored total if it is less than 1 hour old.
  if (kv) {
    try {
      const cached = await kv.get("visitors-total", "json");
      if (cached && typeof cached.total === "number" && Date.now() - cached.at < 3600 * 1000) {
        return json({ total: cached.total, cached: true });
      }
    } catch (e) { /* fall through and fetch fresh */ }
  }
  // start=2020-01-01 so the total covers all time, not just the last week
  // (the API defaults start to one week ago).
  const gc = await fetch("https://taseries.goatcounter.com/api/v0/stats/total?start=2020-01-01T00:00:00Z", {
    headers: { Authorization: "Bearer " + key, "Content-Type": "application/json" },
  });
  if (!gc.ok) {
    return json({ error: "goatcounter " + gc.status }, 502);
  }
  const data = await gc.json();
  const total = typeof data.total === "number" ? data.total : 0;
  if (kv) {
    try { await kv.put("visitors-total", JSON.stringify({ total, at: Date.now() })); } catch (e) { /* cache is best-effort */ }
  }
  return json({ total });
  function json(obj, status) {
    return new Response(JSON.stringify(obj), {
      status: status || 200,
      headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=3600" },
    });
  }
}
