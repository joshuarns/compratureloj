// ─────────────────────────────────────────────────────────────────────────────
// utils/woocommerce.js
//
// Funciones auxiliares para trabajar con los datos que devuelve la API de
// WooCommerce. Centralizar aquí evita copiar la misma lógica en cada componente.
//
// Funciones exportadas:
//   getMeta(meta_data, key)  → extrae un campo del array meta_data de WooCommerce
//   formatPeso(value)        → formatea un número como precio en pesos mexicanos
//   estadoProductoTexto      → mapa de estado WC → texto en español (para productos)
//   estadoPedidoTexto        → mapa de estado WC → texto en español (para pedidos)
//   estadoPedidoClase        → mapa de estado WC → clase CSS del badge (para pedidos)
// ─────────────────────────────────────────────────────────────────────────────


// ── validarArchivos ───────────────────────────────────────────────────────────
// Recibe un array de File objects y los separa en válidos e inválidos.
// Un archivo es inválido si no es imagen o supera MAX_BYTES.
// Devuelve { validas, rechazadas } donde cada rechazado tiene { nombre, razon }.
// Usada en FormSellWatch y EditWatch para validar imágenes antes de subirlas.
import { MAX_MB, MAX_BYTES } from "../config/constants";

export const validarArchivos = (archivos) => {
  const validas    = [];
  const rechazadas = [];
  for (const archivo of archivos) {
    if (!archivo.type.startsWith("image/")) {
      rechazadas.push({ nombre: archivo.name, razon: "no es una imagen" });
    } else if (archivo.size > MAX_BYTES) {
      const mb = (archivo.size / 1024 / 1024).toFixed(1);
      rechazadas.push({ nombre: archivo.name, razon: `pesa ${mb} MB (máx. ${MAX_MB} MB)` });
    } else {
      validas.push(archivo);
    }
  }
  return { validas, rechazadas };
};


// ── normalizarMetaValor ───────────────────────────────────────────────────────
// Convierte los valores guardados en WordPress (capitalizados, con acentos,
// con unidades) al formato interno que usan los <select> del formulario.
//
// Útil cuando los productos se crearon desde el admin de WordPress con
// etiquetas legibles ("Automático", "Solo reloj") en lugar de los valores
// internos ("automatico", "solo_reloj") que usa la app.
//
// Ejemplos:
//   normalizarMetaValor("Automático")  → "automatico"
//   normalizarMetaValor("Solo reloj")  → "solo_reloj"
//   normalizarMetaValor("Masculino")   → "hombre"
export const normalizarMetaValor = (valor) => {
  // Garantizar que siempre trabajamos con un string
  if (Array.isArray(valor)) valor = valor[0] ?? '';
  if (typeof valor !== 'string') valor = String(valor ?? '');
  // -1 es el valor que WPUF guarda cuando un select no tiene selección válida
  if (!valor || valor === '-1') return '';

  // 1) minúsculas + quitar acentos (NFD decompose → eliminar diacríticos)
  const base = valor
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim();

  // 2) Mapa de sinónimos: ACF/WordPress labels → valores internos del select de React.
  //    ACF guarda la etiqueta del choice como valor (ej. "Masculino", "Acero oro").
  //    Después del paso 1 (lowercase + sin acentos) el base ya es comparable.
  const mapa = {
    // genero — ACF choices: Masculino, Femenino, Unisex
    'masculino': 'hombre',
    'femenino':  'mujer',
    // movimiento — ACF choices: Automático, Cuerda, Cuarzo (NFD ya quita acento)
    // broche — ACF choices con espacios
    'desplegable con botones': 'desplegable_con_botones',
    'broche de gancho':        'broche_de_gancho',
    'cierre de malla':         'cierre_de_malla',
    // material — ACF choice "Acero oro" → React option value "acero_oro"
    'acero oro':         'acero_oro',
    'acero y oro':       'acero_oro',
    'acero/oro':         'acero_oro',
    'acero inoxidable':  'acero',
    // cristal — variantes
    'cristal de zafiro': 'zafiro',
    'vidrio mineral':    'mineral',
    'vidrio':            'mineral',
    'plexiglas':         'plexiglass',
    // documentacion — ACF choices con espacios
    'solo reloj':         'solo_reloj',
    'estuche original':   'estuche_original',
    'estuche y manuales': 'estuche_y_manuales',
    'full set':           'full_set',
    // estado_del_reloj — ACF choices con espacios
    'poco uso':  'poco_uso',
    'con uso':   'con_uso',
    'mucho uso': 'mucho_uso',
    // estetica_del_reloj — ACF choices con espacios
    'muy buena': 'muy_buena',
    'muy mala':  'muy_mala',
    // variantes extra
    'hule':   'caucho',
    'rubber': 'caucho',
    'cuero':  'piel',
  };

  return mapa[base] ?? base;
};

// ── stripUnidad ───────────────────────────────────────────────────────────────
// Elimina la unidad al final de un valor de medida guardado en WordPress.
// Ejemplos:
//   stripUnidad("44mm")  → "44"
//   stripUnidad("21cm")  → "21"
//   stripUnidad("10atm") → "10"
export const stripUnidad = (valor) => {
  if (Array.isArray(valor)) valor = valor[0] ?? '';
  if (typeof valor !== 'string') valor = String(valor ?? '');
  if (!valor || valor === '-1') return '';
  return valor.replace(/\s*(mm|cm|atm)\s*$/i, '').trim();
};

// ── getMeta ───────────────────────────────────────────────────────────────────
// WooCommerce guarda los campos personalizados (marca, movimiento, estado…)
// como un array de objetos: [{ key: "marca", value: "Rolex" }, ...]
// Esta función busca el objeto con la clave indicada y devuelve su valor.
// Si la clave no existe devuelve null para que el componente pueda hacer
// condicionales limpias: {marca && <span>{marca}</span>}
//
// Ejemplo:
//   getMeta(producto.meta_data, "marca")      → "Rolex"
//   getMeta(producto.meta_data, "no_existe")  → null
export const getMeta = (meta_data = [], key) => {
  const campo = meta_data.find(m => m.key === key);
  if (!campo) return null;

  let val = campo.value;

  // ACF SELECT puede guardar el valor como array ["acero"] en lugar de "acero".
  // WooCommerce REST API lo devuelve deserializado como array de JS.
  if (Array.isArray(val)) val = val[0] ?? null;

  // ACF a veces guarda PHP serializado: 'a:1:{i:0;s:5:"acero";}'
  // Extraemos el primer string entre comillas como fallback.
  if (typeof val === 'string' && val.startsWith('a:')) {
    const match = val.match(/s:\d+:"([^"]+)"/);
    val = match ? match[1] : null;
  }

  return val || null;
};


// ── formatPeso ────────────────────────────────────────────────────────────────
// Convierte un número (o string numérico) al formato de precio mexicano.
// Usa la API nativa Intl de JavaScript, no requiere ninguna librería externa.
//
// Ejemplo:
//   formatPeso(150000)    → "$150,000.00"
//   formatPeso("9500.5")  → "$9,500.50"
export const formatPeso = (value) =>
  // Number() convierte strings a número por si WooCommerce devuelve "9500.00"
  // toLocaleString("es-MX") aplica el separador de miles y decimales de México
  `$${Number(value).toLocaleString("es-MX", { minimumFractionDigits: 2 })}`;


// ── estadoProductoTexto ───────────────────────────────────────────────────────
// WooCommerce maneja los estados de producto en inglés internamente.
// Este mapa traduce esos valores al español que se muestra al vendedor
// en la tabla "Mis relojes" del Dashboard.
//
// Estados posibles en WooCommerce:
//   draft   → recién creado, no visible públicamente
//   pending → enviado para revisión, esperando aprobación del admin
//   publish → aprobado y visible en la tienda
//   private → visible solo para usuarios con sesión (no usado actualmente)
export const estadoProductoTexto = {
  draft:   "En revisión",
  pending: "Pendiente",
  publish: "En venta",
  private: "No publicado",
};


// ── estadoPedidoTexto ─────────────────────────────────────────────────────────
// Igual que el anterior pero para pedidos de WooCommerce.
// Se usa en la tabla "Mis compras" del Dashboard.
export const estadoPedidoTexto = {
  pending:    "Pendiente de pago",
  processing: "En proceso",
  on_hold:    "En espera",
  completed:  "Completado",
  cancelled:  "Cancelado",
  refunded:   "Reembolsado",
  failed:     "Fallido",
};


// ── estadoPedidoClase ─────────────────────────────────────────────────────────
// Mapa de estado de pedido → clase CSS para el badge de color.
// Las clases están definidas en Dashboard.css bajo el bloque "BADGES DE ESTADO".
// Cada color comunica visualmente el estado sin necesidad de leer el texto:
//   amarillo → pendiente, azul → en proceso, verde → completado, rojo → cancelado
export const estadoPedidoClase = {
  pending:    "statusBadge draft",       // amarillo — esperando pago
  processing: "statusBadge pending",     // azul — pago recibido, en preparación
  on_hold:    "statusBadge private",     // gris — en espera manual
  completed:  "statusBadge publish",     // verde — entregado y cerrado
  cancelled:  "statusBadge cancelled",   // rojo — cancelado
  refunded:   "statusBadge refunded",    // gris — devuelto
  failed:     "statusBadge cancelled",   // rojo — pago fallido
};
