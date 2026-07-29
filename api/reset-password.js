// ─────────────────────────────────────────────────────────────────────────────
// api/reset-password.js — Proxy para wp-login.php (recuperación de contraseña)
// ─────────────────────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  res.setHeader('Cache-Control', 'no-store');

  const { user_login } = req.body || {};
  if (!user_login) return res.status(400).json({ message: 'user_login requerido' });

  const base = process.env.WP_BASE_URL.replace('/wp-json/wp/v2', '');
  const url  = `${base}/wp-login.php`;

  const body = `action=lostpassword&user_login=${encodeURIComponent(user_login)}`;

  try {
    const upstream = await fetch(url, {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
      redirect: 'manual',
    });

    // wp-login.php devuelve 302 redirect al completar — eso es éxito
    res.status(200).json({ success: true });
  } catch {
    res.status(502).json({ message: 'Error al conectar con WordPress' });
  }
}
