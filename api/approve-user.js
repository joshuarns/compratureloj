// ─────────────────────────────────────────────────────────────────────────────
// api/approve-user.js — Aprueba un usuario y le envía el correo de aprobación.
//
// Solo puede ser llamado con credenciales de admin (Authorization header).
// Body: { userId, userEmail, userName }
// ─────────────────────────────────────────────────────────────────────────────

import { enviarCorreo, templateCuentaAprobada } from './mailer.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, userEmail, userName } = req.body || {};

  if (!userId || !userEmail) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }

  const wpBase    = process.env.WP_BASE_URL || '';
  const wpApiBase = wpBase.endsWith('/wp/v2') ? wpBase : `${wpBase.replace('/wp-json', '')}/wp-json/wp/v2`;
  const wpUser    = (process.env.WP_USER || '').trim();
  const wpPass    = (process.env.WP_PASS || '').trim().replace(/\s+/g, ' ');
  const adminAuth = Buffer.from(`${wpUser}:${wpPass}`).toString('base64');

  try {
    // 1. Aprobar al usuario en WordPress
    const wpRes = await fetch(`${wpApiBase}/users/${userId}`, {
      method:  'POST',
      headers: {
        Authorization:  `Basic ${adminAuth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ meta: { wp_user_is_approved: '1' } }),
    });

    if (!wpRes.ok) {
      const err = await wpRes.text();
      return res.status(wpRes.status).json({ error: 'No se pudo aprobar el usuario', detail: err.slice(0, 300) });
    }

    // 2. Enviar correo de aprobación
    await enviarCorreo({
      to:      userEmail,
      subject: '¡Tu cuenta en Compra Tu Reloj ha sido aprobada!',
      html:    templateCuentaAprobada({ nombre: userName || userEmail }),
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(502).json({ error: 'Error al aprobar usuario', detail: err.message });
  }
}
