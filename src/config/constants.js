// ─────────────────────────────────────────────────────────────────────────────
// config/constants.js
//
// Valores de configuración centralizados de la aplicación.
// Si necesitas cambiar alguno, lo tocas aquí y se propaga a todos los archivos
// que lo usan — no hay que buscar en 5 componentes distintos.
//
// Organizado en bloques por dominio:
//   1. EmailJS        → claves del servicio de envío de emails
//   2. Imágenes       → límites de tamaño y cantidad para subidas de fotos
//   3. Sesión         → duración y reglas de revalidación de la sesión
//   4. localStorage   → nombres de las claves que la app guarda en el navegador
// ─────────────────────────────────────────────────────────────────────────────


// ── 1. EMAILJS ────────────────────────────────────────────────────────────────
// Credenciales del servicio EmailJS (https://emailjs.com).
// El SERVICE_ID y PUBLIC_KEY son compartidos por todos los templates.
// Cada template tiene su propio ID según su propósito.

// ID del servicio configurado en EmailJS (pestaña "Email Services")
export const EMAILJS_SERVICE_ID = "service_feqp5lh";

// Clave pública de la cuenta EmailJS (pestaña "Account" → "Public Key")
// No es un secreto — se incluye en el bundle del cliente intencionalmente
export const EMAILJS_PUBLIC_KEY = "roG_GmR36UKJmh2Mz";

// Template que se envía al admin cuando un vendedor sube un reloj nuevo
// Incluye: nombre del reloj, precio, fotos, datos de contacto del vendedor
export const EMAILJS_TEMPLATE_RELOJ_NUEVO = "PENDIENTE";

// Template que se envía al vendedor cuando un comprador hace una oferta
export const EMAILJS_TEMPLATE_OFERTA = "template_tv0t4ud";

// Template para mensajes del formulario de contacto
// Variables esperadas: {{nombre}}, {{email}}, {{telefono}}, {{mensaje}}
export const EMAILJS_TEMPLATE_CONTACTO = "PENDIENTE";

// Templates de notificación (crear en EmailJS dashboard)
export const EMAILJS_TEMPLATE_REGISTRO          = "PENDIENTE";
export const EMAILJS_TEMPLATE_CUENTA_APROBADA   = "PENDIENTE";
export const EMAILJS_TEMPLATE_CAMBIO_CONTRASENA = "PENDIENTE";
export const EMAILJS_TEMPLATE_RELOJ_PUBLICADO   = "PENDIENTE";
export const EMAILJS_TEMPLATE_RELOJ_MODIFICADO  = "PENDIENTE";


// ── 5. RESEÑAS ────────────────────────────────────────────────────────────────
// ID del producto de WooCommerce usado como ancla para las reseñas del público.
// Crea un producto oculto en WP y pon su ID aquí.
export const REVIEWS_PRODUCT_ID = 1;


// ── 2. IMÁGENES ───────────────────────────────────────────────────────────────
// Límites aplicados en FormSellWatch y EditWatch al seleccionar fotos.
// Si el vendedor sube una foto que supera MAX_MB o selecciona más de
// MAX_IMAGENES se muestra un error visible en el formulario.

// Tamaño máximo permitido por archivo en megabytes
export const MAX_MB = 8;

// Equivalente en bytes — se compara con file.size directamente
export const MAX_BYTES = MAX_MB * 1024 * 1024;

// Número máximo de fotos por reloj
export const MAX_IMAGENES = 5;


// ── 3. SESIÓN ─────────────────────────────────────────────────────────────────
// Reglas de duración y revalidación de la sesión del usuario.
// Usadas en AuthContext para decidir cuándo cerrar la sesión automáticamente.

// Días que dura la sesión sin actividad antes de caducar
export const SESSION_DIAS = 7;

// Equivalente en milisegundos — se compara con Date.now() - loginAt
export const SESSION_MS = SESSION_DIAS * 24 * 60 * 60 * 1000;

// Minutos mínimos entre revalidaciones de credenciales con el servidor.
// Evita una petición a WordPress en cada cambio de pestaña.
export const REVALIDAR_CADA_MIN = 60;

// Equivalente en milisegundos
export const REVALIDAR_CADA_MS = REVALIDAR_CADA_MIN * 60 * 1000;

// Throttle corto para la verificación en PrivateRoute (navegación entre páginas).
// 30 segundos: detecta usuarios borrados rápidamente sin saturar la API.
export const VERIFICAR_RUTA_MS = 30 * 1000;


// ── 4. KEYS DE LOCALSTORAGE ───────────────────────────────────────────────────
// Nombres de las claves que la app escribe en localStorage del navegador.
// Centralizar los nombres evita typos y facilita limpiar el storage si es necesario.

// Objeto de sesión del usuario autenticado (nombre, email, id, password…)
export const STORAGE_KEY_USUARIO = "usuario";

// Timestamp de la última vez que se revalidaron las credenciales con WordPress
export const STORAGE_KEY_ULTIMA_VALIDACION = "ultimaValidacion";

// Array de IDs de productos guardados como favoritos (watchlist)
export const STORAGE_KEY_WATCHLIST = "watchlist";
