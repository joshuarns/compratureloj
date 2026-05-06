// ─────────────────────────────────────────────────────────────────────────────
// api/orders.js
//
// Peticiones relacionadas con pedidos (orders) de WooCommerce.
// ─────────────────────────────────────────────────────────────────────────────

import { axios, BASE_URL, auth } from './client';

// ── crearPedido ───────────────────────────────────────────────────────────────
// Crea un nuevo pedido en WooCommerce vía POST.
// Llamado desde el componente Checkout cuando el usuario confirma la compra.
// pedidoData debe incluir: billing, shipping, line_items, payment_method, etc.
export const crearPedido = async (pedidoData) => {
    const respuesta = await axios.post(`${BASE_URL}/orders`, pedidoData, { auth });
    return respuesta.data;
};

// ── obtenerPedido ─────────────────────────────────────────────────────────────
// Obtiene los detalles completos de un pedido por su ID.
// Usado en PaymentConfirmation para mostrar los artículos comprados,
// dirección de envío y total del pedido.
export const obtenerPedido = async (id) => {
    const response = await axios.get(`${BASE_URL}/orders/${id}`, { auth });
    return response.data;
};

// ── obtenerMisPedidos ─────────────────────────────────────────────────────────
// Trae el historial de pedidos de un comprador filtrando por email de facturación.
// WooCommerce no garantiza un customer_id consistente para todos los flujos de
// compra, así que el email es la clave más confiable para asociar pedidos a
// una persona (funciona con usuarios registrados y compradores invitados).
export const obtenerMisPedidos = async (email) => {
    const response = await axios.get(`${BASE_URL}/orders`, {
        params: {
            billing_email: email,
            per_page:      20,
            orderby:       'date',
            order:         'desc',   // más recientes primero
        },
        auth,
    });
    return response.data;
};
