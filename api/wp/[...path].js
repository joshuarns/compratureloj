// ─────────────────────────────────────────────────────────────────────────────
// api/wp/[...path].js — Vercel serverless proxy para WordPress REST API
//
// Recibe cualquier petición a /api/wp/* desde el cliente React,
// agrega las credenciales de WordPress server-side y reenvía.
// ─────────────────────────────────────────────────────────────────────────────

export const config = {
  api: { bodyParser: false },
};

export default async function handler(req, res) {
  const segments   = req.query.path || [];
  const path       = Array.isArray(segments) ? segments.join('/') : segments;

  const params = { ...req.query };
  delete params.path;
  const qs = new URLSearchParams(params).toString();

  const url  = `${process.env.WP_BASE_URL}/${path}${qs ? '?' + qs : ''}`;
  const auth = Buffer.from(`${process.env.WC_KEY}:${process.env.WC_SECRET}`).toString('base64');

  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const body = Buffer.concat(chunks);

  const headers = { Authorization: `Basic ${auth}` };
  if (req.headers['content-type'])        headers['Content-Type']        = req.headers['content-type'];
  if (req.headers['content-disposition']) headers['Content-Disposition'] = req.headers['content-disposition'];

  try {
    const upstream = await fetch(url, {
      method:  req.method,
      headers,
      body:    body.length > 0 ? body : undefined,
    });

    const contentType = upstream.headers.get('content-type');
    if (contentType) res.setHeader('Content-Type', contentType);

    const data = await upstream.arrayBuffer();
    res.status(upstream.status).send(Buffer.from(data));
  } catch {
    res.status(502).json({ error: 'WordPress proxy error' });
  }
}
