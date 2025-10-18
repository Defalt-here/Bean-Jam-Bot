// AWS Lambda: Weather API proxy (WeatherAPI.com)
// Accepts GET /weather?q=lat,lon&days=1 or POST { q, days }
// Uses server-side WEATHER_API_KEY

function parseQuery(event) {
  try {
    const qp = (event && event.rawQueryString) ? Object.fromEntries(new URLSearchParams(event.rawQueryString)) : {};
    return qp;
  } catch { return {}; }
}

exports.handler = async (event) => {
  const headers = { 'Content-Type': 'application/json' };
  const method = (event && event.requestContext && event.requestContext.http && event.requestContext.http.method) || event.httpMethod || (event.body ? 'POST' : 'GET');

  if (method === 'OPTIONS') return { statusCode: 204, headers, body: '' };

  try {
    const apiKey = process.env.WEATHER_API_KEY;
    if (!apiKey) return { statusCode: 500, headers, body: JSON.stringify({ error: 'WEATHER_API_KEY not configured' }) };

    let q, days;
    if (method === 'GET') {
      const qp = parseQuery(event);
      q = qp.q;
      days = qp.days || '1';
    } else {
      const raw = event.isBase64Encoded ? Buffer.from(event.body||'', 'base64').toString('utf8') : (event.body||'{}');
      const body = typeof raw === 'string' ? JSON.parse(raw) : raw;
      q = body.q;
      days = String(body.days || '1');
    }
    if (!q) return { statusCode: 400, headers, body: JSON.stringify({ error: 'q (query) required' }) };

    const params = new URLSearchParams({ key: apiKey, q, days, aqi: 'no', alerts: 'yes' });
    const resp = await fetch(`https://api.weatherapi.com/v1/forecast.json?${params.toString()}`);
    if (!resp.ok) {
      const err = await resp.json().catch(()=>({}));
      return { statusCode: resp.status, headers, body: JSON.stringify({ error: err.error?.message || resp.statusText }) };
    }
    const data = await resp.json();
    return { statusCode: 200, headers, body: JSON.stringify(data) };
  } catch (e) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: e.message || 'Internal error' }) };
  }
};
