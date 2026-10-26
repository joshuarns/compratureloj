// ─────────────────────────────────────────────────────────────────────────────
// api/reset-password.js — Solicita restablecimiento de contraseña
//
// Llama al endpoint REST del plugin (ctr/v1/forgot-password) que genera
// la clave y envía el correo vía wp_mail — evita llamar a wp-login.php
// directamente, ya que SiteGround lo bloquea desde IPs de servidor.
// ─────────────────────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  res.setHeader('Cache-Control', 'no-store');

  const { user_login } = req.body || {};
  if (!user_login) return res.status(400).json({ message: 'user_login requerido' });

  const base    = process.env.WP_BASE_URL.replace('/wp/v2', '');
  const url     = `${base}/ctr/v1/forgot-password`;

  const wpUser  = (process.env.WP_USER || '').trim();
  const wpPass  = (process.env.WP_PASS || '').trim().replace(/\s+/g, ' ');
  const auth    = Buffer.from(`${wpUser}:${wpPass}`).toString('base64');

  try {
    const upstream = await fetch(url, {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Basic ${auth}`,
      },
      body: JSON.stringify({ user_login }),
    });

    const data = await upstream.json().catch(() => ({}));
    res.status(upstream.status).json(data);
  } catch {
    res.status(502).json({ message: 'Error al conectar con WordPress' });
  }
}
