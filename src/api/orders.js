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
// Trae el historial de pedidos de un comprador filtrando por su ID de WordPress.
// El parámetro ?customer= es el único filtro confiable en WC REST API v3 —
// billing_email no es un parámetro válido y la API lo ignora silenciosamente.
export const obtenerMisPedidos = async (customerId) => {
    const response = await axios.get(`${BASE_URL}/orders`, {
        params: {
            customer: customerId,
            per_page: 20,
            orderby:  'date',
            order:    'desc',
        },
        auth,
    });
    return Array.isArray(response.data) ? response.data : [];
};
