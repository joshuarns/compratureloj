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
// Trae el historial de pedidos filtrando por customer_id.
// Si no hay resultados, hace un segundo intento filtrando por email del usuario
// en caso de que el pedido se creara sin customer_id asociado.
export const obtenerMisPedidos = async (customerId, email = '') => {
    // Intento 1: filtrar por customer_id (lo más preciso)
    const porId = await axios.get(`${BASE_URL}/orders`, {
        params: {
            customer: customerId,
            per_page: 50,
            orderby:  'date',
            order:    'desc',
        },
        auth,
    });

    const resultadosId = Array.isArray(porId.data) ? porId.data : [];
    if (resultadosId.length > 0) return resultadosId;

    // Intento 2: si no hay pedidos por ID, traer todos y filtrar por email
    // (cubre pedidos creados sin customer_id, ej. cuando la sesión expiró)
    if (!email) return [];

    const todos = await axios.get(`${BASE_URL}/orders`, {
        params: { per_page: 100, orderby: 'date', order: 'desc' },
        auth,
    });

    const lista = Array.isArray(todos.data) ? todos.data : [];
    return lista.filter(o =>
        o.billing?.email?.toLowerCase() === email.toLowerCase()
    );
};
