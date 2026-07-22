// ─────────────────────────────────────────────────────────────────────────────
// api/login.js — Valida credenciales de usuario contra WordPress
//
// Flujo:
//   1. Autentica al usuario con sus credenciales (GET /wp/v2/users/me)
//   2. Si las credenciales son válidas, verifica que la cuenta esté aprobada
//      consultando /ctr/v1/check-approval/{id} con credenciales de admin
//   3. Si no está aprobada devuelve 401 con code: user_not_approved
//   4. Si está aprobada devuelve los datos del usuario a React
// ─────────────────────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let username, password;
  try {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const raw = Buffer.concat(chunks).toString('utf-8');
    const body = raw ? JSON.parse(raw) : {};
    username = body.username;
    password = body.password;
  } catch {
    return res.status(400).json({ error: 'Body inválido' });
  }

  if (!username || !password) {
    return res.status(400).json({ error: 'Faltan credenciales' });
  }

  // Normalizar WP_BASE_URL al root del sitio (sin /wp-json ni /wp/v2)
  const wpSite  = (process.env.WP_BASE_URL || (process.env.WC_BASE_URL || '').replace('/wc/v3', ''))
    .replace('/wp/v2', '').replace('/wp-json', '').replace(/\/$/, '');
  const wpBase  = `${wpSite}/wp-json/wp/v2`;
  const wpRoot  = `${wpSite}/wp-json`;

  // Credenciales de admin para consultas internas (check-approval)
  const wpUser  = process.env.WP_USER || '';
  const wpPass  = process.env.WP_PASS || '';
  const adminAuth = Buffer.from(`${wpUser}:${wpPass}`).toString('base64');

  // ── Paso 1: Autenticar con las credenciales del usuario ──────────────────
  const userAuth = Buffer.from(`${username}:${password}`).toString('base64');

  try {
    const upstream = await fetch(`${wpBase}/users/me?context=edit`, {
      headers: { Authorization: `Basic ${userAuth}` },
    });

    const text = await upstream.text();
    let data;
    try { data = JSON.parse(text); } catch { data = { raw: text.slice(0, 300) }; }

    // Credenciales incorrectas u otro error de WP → devolver tal cual
    if (!upstream.ok) {
      return res.status(upstream.status).json(data);
    }

    const userId = data.id;

    // ── Paso 2: Verificar aprobación (saltar para administradores) ───────────
    const roles = Array.isArray(data.roles) ? data.roles : [];
    if (!roles.includes('administrator')) {
      try {
        const approvalRes  = await fetch(`${wpRoot}/ctr/v1/check-approval/${userId}`, {
          headers: { Authorization: `Basic ${adminAuth}` },
        });

        // Solo bloquear si el endpoint responde correctamente Y dice que no está aprobado.
        // Si el endpoint no existe (404) o falla, no bloqueamos al usuario.
        if (approvalRes.ok) {
          const approvalData = await approvalRes.json();
          if (approvalData.approved === false) {
            return res.status(401).json({
              code:    'user_not_approved',
              message: 'Tu cuenta está pendiente de aprobación. Te avisaremos por email cuando esté activa.',
            });
          }
        }
      } catch {
        // Si el endpoint no responde no bloqueamos (evita falsos negativos por red)
      }
    }

    // ── Paso 3: Todo OK → devolver datos del usuario a React ──────────────
    return res.status(200).json(data);

  } catch (err) {
    return res.status(502).json({ error: 'Login proxy error', detail: err.message });
  }
}
