// ─────────────────────────────────────────────────────────────────────────────
// api/wc/[...path].js — Vercel serverless proxy para WooCommerce REST API
//
// Recibe cualquier petición a /api/wc/* desde el cliente React,
// agrega las credenciales de WooCommerce server-side y reenvía a WordPress.
// Las credenciales nunca llegan al bundle del navegador.
// ─────────────────────────────────────────────────────────────────────────────

export const config = {
  api: { bodyParser: false }, // leemos el cuerpo raw para soportar multipart/form-data
};

export default async function handler(req, res) {
  const segments   = req.query.path || [];
  const path       = Array.isArray(segments) ? segments.join('/') : segments;

  // Reconstruimos query string sin el parámetro interno 'path'
  const params = { ...req.query };
  delete params.path;
  const qs = new URLSearchParams(params).toString();

  const url  = `${process.env.WC_BASE_URL}/${path}${qs ? '?' + qs : ''}`;
  const auth = Buffer.from(`${process.env.WC_KEY}:${process.env.WC_SECRET}`).toString('base64');

  // Leemos el cuerpo raw (compatible con JSON y multipart)
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

    // Reenviar todos los headers relevantes, incluyendo x-wp-totalpages
    // que WooCommerce usa para la paginación.
    const headersToForward = [
      'content-type', 'x-wp-total', 'x-wp-totalpages',
      'x-wc-store-api-nonce', 'cache-control',
    ];
    for (const header of headersToForward) {
      const value = upstream.headers.get(header);
      if (value) res.setHeader(header, value);
    }

    const data = await upstream.arrayBuffer();
    res.status(upstream.status).send(Buffer.from(data));
  } catch {
    res.status(502).json({ error: 'WooCommerce proxy error' });
  }
}
