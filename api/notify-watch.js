// ─────────────────────────────────────────────────────────────────────────────
// api/notify-watch.js — Notificaciones de correo para eventos de relojes.
//
// Body esperado:
//   tipo         → "publicado" | "modificado"
//   relojNombre  → nombre del reloj
//   relojId      → ID del producto en WooCommerce
//   vendedorEmail → email del vendedor
//   vendedorNombre → nombre del vendedor
// ─────────────────────────────────────────────────────────────────────────────

import { enviarCorreo, templateRelojPublicado, templateRelojModificado } from './mailer.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { tipo, relojNombre, relojId, vendedorEmail, vendedorNombre } = req.body || {};

  if (!tipo || !vendedorEmail || !relojNombre) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }

  try {
    const appUrl = (process.env.APP_URL || 'https://compratureloj.com.mx').replace(/\/$/, '');
    const relojUrl = `${appUrl}/producto/${relojId}`;

    if (tipo === 'publicado') {
      await enviarCorreo({
        to:      vendedorEmail,
        subject: `¡Tu reloj "${relojNombre}" ya está publicado!`,
        html:    templateRelojPublicado({ nombre: vendedorNombre, relojNombre, relojUrl }),
      });
    } else if (tipo === 'modificado') {
      await enviarCorreo({
        to:      vendedorEmail,
        subject: `Tu reloj "${relojNombre}" ha sido actualizado`,
        html:    templateRelojModificado({ nombre: vendedorNombre, relojNombre }),
      });
    } else {
      return res.status(400).json({ error: 'Tipo de notificación inválido' });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(502).json({ error: 'Error al enviar correo', detail: err.message });
  }
}
