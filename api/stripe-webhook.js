// ─────────────────────────────────────────────────────────────────────────────
// api/stripe-webhook.js
//
// Recibe eventos de Stripe. Solo procesa checkout.session.completed.
//
// Cuando el pago es confirmado por Stripe:
//   1. Verifica la firma del webhook (STRIPE_WEBHOOK_SECRET)
//   2. Lee el wc_order_id de los metadata de la sesión
//   3. Marca el pedido en WooCommerce como pagado (set_paid: true)
//
// Para configurar el webhook en Stripe Dashboard:
//   Developers → Webhooks → Add endpoint
//   URL: https://compratureloj.vercel.app/api/stripe-webhook
//   Evento: checkout.session.completed
//   Copia el Signing secret → Vercel env var STRIPE_WEBHOOK_SECRET
// ─────────────────────────────────────────────────────────────────────────────

import Stripe from 'stripe';

export const config = {
  api: { bodyParser: false }, // Stripe requiere el body crudo para verificar la firma
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig    = req.headers['stripe-signature'];
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  // Leer body crudo (necesario para verificar la firma de Stripe)
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const rawBody = Buffer.concat(chunks);

  const stripe = new Stripe((process.env.STRIPE_SECRET_KEY || '').trim(), { apiVersion: '2026-06-24.dahlia' });
  let event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, secret);
  } catch (err) {
    // Firma inválida → posible petición falsa
    return res.status(400).json({ error: `Webhook signature inválida: ${err.message}` });
  }

  if (event.type !== 'checkout.session.completed') {
    // Ignorar otros eventos que Stripe pueda enviar
    return res.status(200).json({ received: true });
  }

  const session    = event.data.object;
  const wcOrderId  = session.metadata?.wc_order_id;

  if (!wcOrderId) {
    return res.status(400).json({ error: 'wc_order_id no encontrado en metadata' });
  }

  // ── Marcar pedido como pagado en WooCommerce ──────────────────────────────
  const wcBase = process.env.WC_BASE_URL;
  const wcAuth = Buffer.from(`${process.env.WC_KEY}:${process.env.WC_SECRET}`).toString('base64');

  try {
    const wcRes = await fetch(`${wcBase}/orders/${wcOrderId}`, {
      method: 'PUT',
      headers: {
        Authorization:  `Basic ${wcAuth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        set_paid:             true,
        status:               'processing',
        transaction_id:       session.payment_intent || session.id,
        payment_method:       'stripe',
        payment_method_title: 'Tarjeta de crédito / débito (Stripe)',
      }),
    });

    if (!wcRes.ok) {
      const err = await wcRes.text();
      return res.status(502).json({ error: 'Error actualizando pedido en WooCommerce', detail: err });
    }

    return res.status(200).json({ received: true, wc_order_id: wcOrderId });
  } catch (err) {
    return res.status(502).json({ error: 'Error conectando con WooCommerce', detail: err.message });
  }
}
