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
  // find() recorre el array y devuelve el primer elemento donde key coincide
  const campo = meta_data.find(m => m.key === key);
  // Si no encontró nada, campo es undefined → devolvemos null
  return campo?.value || null;
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
