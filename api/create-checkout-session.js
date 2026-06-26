// ─────────────────────────────────────────────────────────────────────────────
// api/create-checkout-session.js
//
// Flujo:
//   1. Recibe carrito + datosCliente + usuarioId desde el frontend
//   2. Crea un pedido en WooCommerce con status "pending" (sin pagar aún)
//   3. Crea una Stripe Checkout Session con el total del carrito
//   4. Guarda el WC order ID en los metadata de Stripe para enlazarlos luego
//   5. Devuelve { url } — el frontend redirige ahí
//
// El webhook stripe-webhook.js recibe el evento checkout.session.completed
// y marca el pedido de WooCommerce como pagado.
// ─────────────────────────────────────────────────────────────────────────────

import Stripe from 'stripe';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Vercel parsea el body JSON automáticamente; req.body ya es el objeto
  const { carrito, datosCliente, usuarioId } = req.body || {};

  if (!carrito?.length) {
    return res.status(400).json({ error: 'Carrito vacío' });
  }

  const wcBase = process.env.WC_BASE_URL;
  const wcAuth = Buffer.from(`${process.env.WC_KEY}:${process.env.WC_SECRET}`).toString('base64');

  // ── Paso 1: Crear pedido en WooCommerce (pendiente de pago) ──────────────
  let wcOrder;
  try {
    const wcRes = await fetch(`${wcBase}/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${wcAuth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        payment_method:       'stripe',
        payment_method_title: 'Tarjeta de crédito / débito',
        set_paid:             false,   // se marca pagado desde el webhook
        status:               'pending',
        ...(usuarioId ? { customer_id: usuarioId } : {}),
        billing:  { ...datosCliente },
        shipping: {
          first_name: datosCliente.first_name,
          last_name:  datosCliente.last_name,
          address_1:  datosCliente.address_1,
          city:       datosCliente.city,
          state:      datosCliente.state,
          postcode:   datosCliente.postcode,
          country:    datosCliente.country,
        },
        line_items: carrito.map(item => ({
          product_id: item.id,
          quantity:   item.cantidad || 1,
        })),
      }),
    });

    if (!wcRes.ok) {
      const err = await wcRes.text();
      return res.status(502).json({ error: 'Error creando pedido en WooCommerce', detail: err });
    }

    wcOrder = await wcRes.json();
  } catch (err) {
    return res.status(502).json({ error: 'Error conectando con WooCommerce', detail: err.message });
  }

  // ── Paso 2: Crear Stripe Checkout Session ────────────────────────────────
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const appUrl = process.env.APP_URL || 'https://compratureloj.vercel.app';

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      currency: 'mxn',
      line_items: carrito.map(item => ({
        price_data: {
          currency:     'mxn',
          unit_amount:  Math.round(item.precio * 100), // centavos
          product_data: {
            name:   item.name,
            images: item.imagen ? [item.imagen] : [],
          },
        },
        quantity: item.cantidad || 1,
      })),
      // metadata vincula la sesión de Stripe con el pedido de WooCommerce
      metadata: {
        wc_order_id: String(wcOrder.id),
      },
      customer_email: datosCliente.email || undefined,
      success_url: `${appUrl}/pago-exitoso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${appUrl}/pago-cancelado`,
      // Localización para compradores mexicanos
      locale: 'es',
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    return res.status(502).json({ error: 'Error creando sesión de Stripe', detail: err.message });
  }
}
