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

  const wpBase    = process.env.WP_BASE_URL.replace('/wp/v2', '').replace('/wp-json', '');
  const wpApiBase = `${wpBase}/wp-json/wp/v2`;
  const wpUser    = process.env.WP_USER || '';
  const wpPass    = process.env.WP_PASS || '';
  const adminAuth = Buffer.from(`${wpUser}:${wpPass}`).toString('base64');

  try {
    // 1. Cambiar la contraseña
    const wpRes = await fetch(`${wpBase}/wp-json/ctr/v1/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, login, password }),
    });

    const data = await wpRes.json();

    if (!wpRes.ok) {
      return res.status(wpRes.status).json(data);
    }

    // 2. Re-aprobar al usuario (el reset de contraseña puede limpiar el flag de aprobación)
    try {
      // Buscar el usuario por su login para obtener el ID
      const searchRes = await fetch(`${wpApiBase}/users?search=${encodeURIComponent(login)}&context=edit`, {
        headers: { Authorization: `Basic ${adminAuth}` },
      });
      if (searchRes.ok) {
        const users = await searchRes.json();
        const user  = users.find(u => u.slug === login || u.name === login || u.email === login);
        if (user?.id) {
          // Actualizar wp_user_is_approved directamente via WP REST API
          await fetch(`${wpApiBase}/users/${user.id}`, {
            method: 'POST',
            headers: { Authorization: `Basic ${adminAuth}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ meta: { wp_user_is_approved: '1' } }),
          }).catch(() => {});
        }
      }
    } catch {
      // Si la re-aprobación falla no bloqueamos el flujo
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(502).json({ error: 'Error al conectar con WordPress', detail: err.message });
  }
}
