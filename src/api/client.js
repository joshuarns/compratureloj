// ─────────────────────────────────────────────────────────────────────────────
// api/client.js
//
// En DESARROLLO (npm start) las peticiones van directo a WordPress con
// credenciales Basic Auth desde las variables de entorno.
//
// En PRODUCCIÓN (npm run build + server/index.js) el bundle no contiene
// ninguna credencial: las peticiones van a /api/wc y /api/wp (rutas del
// proxy Express), que agrega las credenciales server-side antes de
// reenviarlas a WooCommerce/WordPress.
//
// Variables requeridas en .env.development:
//   REACT_APP_WC_BASE_URL, REACT_APP_WP_BASE_URL,
//   REACT_APP_WC_KEY, REACT_APP_WC_SECRET
// ─────────────────────────────────────────────────────────────────────────────

import axios from 'axios';

const USE_PROXY = process.env.REACT_APP_USE_PROXY === 'true';

// En desarrollo: falla rápido si faltan variables.
if (!USE_PROXY && process.env.NODE_ENV !== 'test') {
  const faltantes = [
    'REACT_APP_WC_BASE_URL', 'REACT_APP_WP_BASE_URL',
    'REACT_APP_WC_KEY',      'REACT_APP_WC_SECRET',
  ].filter(k => !process.env[k]);

  if (faltantes.length > 0) {
    throw new Error(
      `[api/client] Variables de entorno faltantes: ${faltantes.join(', ')}.\n` +
      'Revisa tu archivo .env.development.'
    );
  }
}

export { axios };

// En producción: URLs relativas → el proxy las resuelve sin exponer credenciales.
// En desarrollo: URLs absolutas a localhost con autenticación directa.
export const BASE_URL    = USE_PROXY ? '/api/wc' : process.env.REACT_APP_WC_BASE_URL;
export const BASE_URL_WP = USE_PROXY ? '/api/wp' : process.env.REACT_APP_WP_BASE_URL;

// En producción auth es undefined → el proxy agrega la cabecera Authorization.
// En desarrollo auth lleva las credenciales locales.
export const auth = USE_PROXY ? undefined : {
  username: process.env.REACT_APP_WC_KEY,
  password: process.env.REACT_APP_WC_SECRET,
};
