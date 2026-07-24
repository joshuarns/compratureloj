// ─────────────────────────────────────────────────────────────────────────────
// api/register.js — Proxy de registro de usuarios
//
// Reenvía el registro al endpoint personalizado /wp-json/ctr/v1/register
// que crea el usuario y lo marca como pendiente de aprobación (wp_user_is_approved=0).
// Usa credenciales WP (no WC) porque la ruta es de la WP REST API.
// ─────────────────────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let body;
  try {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const raw = Buffer.concat(chunks).toString('utf-8');
    body = raw ? JSON.parse(raw) : {};
  } catch {
    return res.status(400).json({ error: 'Body inválido' });
  }

  // Derivar la base de la WP REST API quitando /wp/v2 del WP_BASE_URL
  const wpBase = process.env.WP_BASE_URL
    || (process.env.WC_BASE_URL || '').replace('/wc/v3', '/wp/v2');

  const wpRoot = wpBase.replace('/wp/v2', '');
  const url    = `${wpRoot}/ctr/v1/register`;

  const wpUser = process.env.WP_USER || '';
  const wpPass = process.env.WP_PASS || '';
  const auth   = Buffer.from(`${wpUser}:${wpPass}`).toString('base64');

  try {
    const upstream = await fetch(url, {
      method:  'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify(body),
    });

    const text = await upstream.text();
    let data;
    try { data = JSON.parse(text); } catch { data = { raw: text.slice(0, 300) }; }

    res.status(upstream.status).json(data);
  } catch (err) {
    res.status(502).json({ error: 'Register proxy error', detail: err.message });
  }
}
