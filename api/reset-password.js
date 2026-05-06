// ─────────────────────────────────────────────────────────────────────────────
// api/reset-password.js — Proxy para wp-login.php (recuperación de contraseña)
//
// wp-login.php no es parte de la REST API de WordPress, necesita su propia ruta.
// ─────────────────────────────────────────────────────────────────────────────

export const config = {
  api: { bodyParser: false },
};

export default async function handler(req, res) {
  const base = process.env.WP_BASE_URL.replace('/wp-json/wp/v2', '');
  const url  = `${base}/wp-login.php`;

  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const body = Buffer.concat(chunks);

  const headers = {};
  if (req.headers['content-type']) headers['Content-Type'] = req.headers['content-type'];

  try {
    const upstream = await fetch(url, {
      method:  req.method,
      headers,
      body:    body.length > 0 ? body : undefined,
    });

    res.status(upstream.status).end();
  } catch {
    res.status(502).end();
  }
}
