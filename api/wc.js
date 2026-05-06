// ─────────────────────────────────────────────────────────────────────────────
// api/wc.js — Vercel serverless proxy para WooCommerce REST API
//
// Vercel no resuelve correctamente catch-alls en subdirectorios
// (api/wc/[...path].js) cuando existe un rewrite SPA. Este archivo vive
// en la raíz de /api y recibe el sub-path via el query param _path,
// inyectado por la regla en vercel.json:
//   { "src": "/api/wc/(.*)", "dest": "/api/wc?_path=$1" }
// ─────────────────────────────────────────────────────────────────────────────

export const config = {
  api: { bodyParser: false },
};

export default async function handler(req, res) {
  // _path puede estar URL-encoded cuando incluye '/' (ej. products%2Fcategories)
  const path = decodeURIComponent(req.query._path || '');

  // Reconstruimos query string eliminando el parámetro interno _path
  const params = { ...req.query };
  delete params._path;
  const qs = new URLSearchParams(params).toString();

  const url  = `${process.env.WC_BASE_URL}/${path}${qs ? '?' + qs : ''}`;
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

    // Reenviar headers relevantes incluyendo x-wp-totalpages (paginación WC)
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
  } catch (err) {
    res.status(502).json({ error: 'WooCommerce proxy error', detail: err.message });
  }
}
