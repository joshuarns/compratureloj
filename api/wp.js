// ─────────────────────────────────────────────────────────────────────────────
// api/wp.js — Vercel serverless proxy para WordPress REST API
//
// Mismo patrón que api/wc.js. Recibe el sub-path via _path query param
// inyectado por la regla en vercel.json:
//   { "src": "/api/wp/(.*)", "dest": "/api/wp?_path=$1" }
// ─────────────────────────────────────────────────────────────────────────────

export const config = {
  api: { bodyParser: false },
};

export default async function handler(req, res) {
  const path = decodeURIComponent(req.query._path || '');

  const params = { ...req.query };
  delete params._path;
  const qs = new URLSearchParams(params).toString();

  const url = `${process.env.WP_BASE_URL}/${path}${qs ? '?' + qs : ''}`;

  // Las claves WooCommerce (ck_/cs_) solo funcionan para /wc/v3/*.
  // Para la WordPress REST API (/wp/v2/*) se necesitan credenciales de WordPress.
  // WP_USER y WP_PASS se configuran en las variables de entorno de Vercel.
  const wpUser = (process.env.WP_USER || '').trim();
  // Las contraseñas de aplicación de WordPress vienen con espacios (XXXX XXXX...),
  // normalizar espacios múltiples por si se copiaron mal desde Vercel.
  const wpPass = (process.env.WP_PASS || '').trim().replace(/\s+/g, ' ');
  const auth   = Buffer.from(`${wpUser}:${wpPass}`).toString('base64');

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

    const headersToForward = [
      'content-type', 'x-wp-total', 'x-wp-totalpages', 'cache-control',
    ];
    for (const header of headersToForward) {
      const value = upstream.headers.get(header);
      if (value) res.setHeader(header, value);
    }

    const data = await upstream.arrayBuffer();
    res.status(upstream.status).send(Buffer.from(data));
  } catch (err) {
    res.status(502).json({ error: 'WordPress proxy error', detail: err.message });
  }
}
