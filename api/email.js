// ─────────────────────────────────────────────────────────────────────────────
// api/email.js — Endpoint unificado de correos transaccionales.
//
// Maneja dos tipos de operaciones:
//   tipo = "notify-watch"   → notifica al vendedor (publicado / modificado)
//   tipo = "approve-user"   → aprueba un usuario en WP y le envía correo
// ─────────────────────────────────────────────────────────────────────────────

import {
  enviarCorreo,
  templateCuentaAprobada,
  templateRelojPublicado,
  templateRelojModificado,
} from './mailer.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { tipo, ...datos } = req.body || {};

  // ── Notificaciones de reloj ─────────────────────────────────────────────────
  if (tipo === 'publicado' || tipo === 'modificado') {
    const { relojNombre, relojId, vendedorEmail, vendedorNombre } = datos;
    if (!vendedorEmail || !relojNombre) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }
    try {
      const appUrl  = (process.env.APP_URL || 'https://compratureloj.com.mx').replace(/\/$/, '');
      const relojUrl = `${appUrl}/producto/${relojId}`;

      if (tipo === 'publicado') {
        await enviarCorreo({
          to:      vendedorEmail,
          subject: `¡Tu reloj "${relojNombre}" ya está publicado!`,
          html:    templateRelojPublicado({ nombre: vendedorNombre, relojNombre, relojUrl }),
        });
      } else {
        await enviarCorreo({
          to:      vendedorEmail,
          subject: `Tu reloj "${relojNombre}" ha sido actualizado`,
          html:    templateRelojModificado({ nombre: vendedorNombre, relojNombre }),
        });
      }
      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(502).json({ error: 'Error al enviar correo', detail: err.message });
    }
  }

  // ── Aprobación de usuario ───────────────────────────────────────────────────
  if (tipo === 'approve-user') {
    const { userId, userEmail, userName } = datos;
    if (!userId || !userEmail) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    const wpBase    = process.env.WP_BASE_URL || '';
    const wpApiBase = wpBase.endsWith('/wp/v2') ? wpBase : `${wpBase.replace('/wp-json', '')}/wp-json/wp/v2`;
    const wpUser    = (process.env.WP_USER || '').trim();
    const wpPass    = (process.env.WP_PASS || '').trim().replace(/\s+/g, ' ');
    const adminAuth = Buffer.from(`${wpUser}:${wpPass}`).toString('base64');

    try {
      const wpRes = await fetch(`${wpApiBase}/users/${userId}`, {
        method:  'POST',
        headers: { Authorization: `Basic ${adminAuth}`, 'Content-Type': 'application/json' },
        body:    JSON.stringify({ meta: { wp_user_is_approved: '1' } }),
      });

      if (!wpRes.ok) {
        const err = await wpRes.text();
        return res.status(wpRes.status).json({ error: 'No se pudo aprobar el usuario', detail: err.slice(0, 300) });
      }

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

  return res.status(400).json({ error: 'Tipo de operación inválido' });
}
