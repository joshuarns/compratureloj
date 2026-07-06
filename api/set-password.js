// ─────────────────────────────────────────────────────────────────────────────
// api/set-password.js — Completa el restablecimiento de contraseña.
//
// Recibe { key, login, password } y llama al endpoint personalizado
// /wp-json/ctr/v1/reset-password que valida la clave y cambia la contraseña.
// ─────────────────────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let body = {};
  try {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    body = JSON.parse(Buffer.concat(chunks).toString('utf-8'));
  } catch {
    return res.status(400).json({ error: 'Body inválido' });
  }

  const { key, login, password } = body;
  if (!key || !login || !password) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }

  const wpBase = process.env.WP_BASE_URL.replace('/wp/v2', '').replace('/wp-json', '');

  try {
    const wpRes = await fetch(`${wpBase}/wp-json/ctr/v1/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, login, password }),
    });

    const data = await wpRes.json();

    if (!wpRes.ok) {
      return res.status(wpRes.status).json(data);
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(502).json({ error: 'Error al conectar con WordPress', detail: err.message });
  }
}
