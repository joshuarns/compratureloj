// ─────────────────────────────────────────────────────────────────────────────
// api/reset-password.js — Proxy para solicitar restablecimiento de contraseña
//
// Llama al endpoint REST del plugin (ctr/v1/forgot-password) en lugar de
// wp-login.php, que SiteGround puede bloquear al ser llamado server-side.
// ─────────────────────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  res.setHeader('Cache-Control', 'no-store');

  const { user_login } = req.body || {};

  if (!user_login) return res.status(400).json({ message: 'user_login requerido' });

  const base = process.env.WP_BASE_URL.replace('/wp/v2', '');
  const url  = `${base}/ctr/v1/forgot-password`;

  const creds = Buffer.from(
    `${process.env.WP_USER}:${process.env.WP_APP_PASSWORD}`
  ).toString('base64');

  try {
    const upstream = await fetch(url, {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Basic ${creds}`,
      },
      body: JSON.stringify({ user_login }),
    });

    const data = await upstream.json().catch(() => ({}));
    res.status(upstream.status).json(data);
  } catch {
    res.status(502).json({ message: 'Error al conectar con WordPress' });
  }
}
