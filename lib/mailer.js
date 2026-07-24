// ─────────────────────────────────────────────────────────────────────────────
// api/mailer.js — Helper de correo con Nodemailer (SMTP propio)
//
// Variables de entorno requeridas:
//   SMTP_HOST  → host del servidor (ej. mail.compratureloj.com.mx)
//   SMTP_PORT  → puerto (465 para SSL, 587 para TLS)
//   SMTP_USER  → correo remitente (ej. noreply@compratureloj.com.mx)
//   SMTP_PASS  → contraseña SMTP
// ─────────────────────────────────────────────────────────────────────────────

import nodemailer from 'nodemailer';

const FROM = `"Compra Tu Reloj" <${process.env.SMTP_USER}>`;
const SITE = 'https://compratureloj.com.mx';

function crearTransporter() {
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  return nodemailer.createTransport({
    host:   process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

// ── Wrapper base — para reutilizar en todos los envíos ────────────────────────
export async function enviarCorreo({ to, subject, html }) {
  const transporter = crearTransporter();
  await transporter.sendMail({ from: FROM, to, subject, html });
}

// ── Layout HTML base ──────────────────────────────────────────────────────────
function layout(contenido) {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Compra Tu Reloj</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f7;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f7;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;">

        <!-- Header -->
        <tr>
          <td style="background:#1c2946;padding:28px 40px;text-align:center;">
            <p style="margin:0;font-size:22px;font-weight:700;color:#c4a03b;letter-spacing:0.02em;">
              Compra Tu Reloj
            </p>
          </td>
        </tr>

        <!-- Cuerpo -->
        <tr>
          <td style="padding:40px 40px 32px;">
            ${contenido}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f5f5f7;padding:24px 40px;text-align:center;border-top:1px solid #e8e8ed;">
            <p style="margin:0;font-size:12px;color:#6e6e73;">
              © ${new Date().getFullYear()} Compra Tu Reloj ·
              <a href="${SITE}" style="color:#c4a03b;text-decoration:none;">compratureloj.com.mx</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function titulo(texto) {
  return `<h1 style="margin:0 0 16px;font-size:24px;font-weight:700;color:#1c2946;">${texto}</h1>`;
}

function parrafo(texto) {
  return `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#3a3a3c;">${texto}</p>`;
}

function boton(texto, url) {
  return `
  <table cellpadding="0" cellspacing="0" style="margin:24px 0;">
    <tr>
      <td style="background:#1c2946;border-radius:10px;padding:0;">
        <a href="${url}" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;">${texto}</a>
      </td>
    </tr>
  </table>`;
}

function linea() {
  return `<hr style="border:none;border-top:1px solid #e8e8ed;margin:24px 0;" />`;
}


// ── Templates ─────────────────────────────────────────────────────────────────

export function templateRegistro({ nombre }) {
  return layout(`
    ${titulo('¡Bienvenido a Compra Tu Reloj!')}
    ${parrafo(`Hola <strong>${nombre}</strong>, gracias por registrarte.`)}
    ${parrafo('Tu cuenta está siendo revisada por nuestro equipo. Te notificaremos por correo en cuanto sea aprobada y puedas comenzar a comprar y vender.')}
    ${linea()}
    ${parrafo('Si tienes dudas, puedes escribirnos a <a href="mailto:contacto@compratureloj.com.mx" style="color:#c4a03b;">contacto@compratureloj.com.mx</a>')}
  `);
}

export function templateCuentaAprobada({ nombre }) {
  return layout(`
    ${titulo('¡Tu cuenta ha sido aprobada!')}
    ${parrafo(`Hola <strong>${nombre}</strong>, ¡buenas noticias!`)}
    ${parrafo('Hemos verificado tu cuenta. Ya puedes iniciar sesión y comenzar a publicar y comprar relojes en nuestra plataforma.')}
    ${boton('Iniciar sesión', `${SITE}/login`)}
    ${linea()}
    ${parrafo('Si tienes alguna pregunta, estamos aquí para ayudarte.')}
  `);
}

export function templateCambioContrasena({ nombre }) {
  return layout(`
    ${titulo('Contraseña actualizada')}
    ${parrafo(`Hola <strong>${nombre}</strong>.`)}
    ${parrafo('Te confirmamos que tu contraseña ha sido cambiada exitosamente.')}
    ${parrafo('Si no realizaste este cambio, contáctanos de inmediato en <a href="mailto:contacto@compratureloj.com.mx" style="color:#c4a03b;">contacto@compratureloj.com.mx</a>')}
    ${boton('Ir a mi cuenta', `${SITE}/dashboard`)}
  `);
}

export function templateRelojPublicado({ nombre, relojNombre, relojUrl }) {
  return layout(`
    ${titulo('¡Tu reloj ya está publicado!')}
    ${parrafo(`Hola <strong>${nombre}</strong>.`)}
    ${parrafo(`Tu reloj <strong>${relojNombre}</strong> ha sido aprobado y ya está visible en nuestra tienda. Los compradores ya pueden encontrarlo.`)}
    ${boton('Ver mi reloj', relojUrl || SITE)}
    ${linea()}
    ${parrafo('Puedes editar o gestionar tus relojes desde tu dashboard.')}
  `);
}

export function templateRelojModificado({ nombre, relojNombre }) {
  return layout(`
    ${titulo('Reloj actualizado')}
    ${parrafo(`Hola <strong>${nombre}</strong>.`)}
    ${parrafo(`Los cambios en tu reloj <strong>${relojNombre}</strong> han sido guardados correctamente.`)}
    ${boton('Ver mi dashboard', `${SITE}/dashboard`)}
  `);
}
