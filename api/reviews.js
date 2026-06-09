// ─────────────────────────────────────────────────────────────────────────────
// api/reviews.js — Crea reseñas en WooCommerce sin credenciales de admin.
//
// Flujo:
//   1. Con credenciales admin, obtiene el primer producto disponible (ancla).
//   2. Crea la reseña SIN auth → WooCommerce la pone en "hold" (pendiente)
//      independientemente de la configuración del sitio.
//   3. Devuelve la reseña creada o el error de WooCommerce.
// ─────────────────────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const wcBase = process.env.WC_BASE_URL; // ej. https://compratureloj.com.mx/wp-json/wc/v3
  const wcKey  = process.env.WC_KEY;
  const wcSec  = process.env.WC_SECRET;

  if (!wcBase || !wcKey || !wcSec) {
    return res.status(500).json({ error: 'WooCommerce env vars not configured' });
  }

  const adminAuth = 'Basic ' + Buffer.from(`${wcKey}:${wcSec}`).toString('base64');

  let body = {};
  try {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    body = JSON.parse(Buffer.concat(chunks).toString('utf-8'));
  } catch {
    return res.status(400).json({ error: 'Body inválido' });
  }

  const { nombre, email, resena, calificacion } = body;
  if (!nombre || !email || !resena || !calificacion) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }

  // ── Paso 1: obtener el primer producto disponible ─────────────────────────
  let productId;
  try {
    const prodRes = await fetch(`${wcBase}/products?status=any&per_page=1`, {
      headers: { Authorization: adminAuth },
    });
    const productos = await prodRes.json();
    if (!Array.isArray(productos) || !productos.length) {
      return res.status(500).json({ error: 'No hay productos en WooCommerce' });
    }
    productId = productos[0].id;
  } catch (err) {
    return res.status(502).json({ error: 'No se pudo obtener producto ancla', detail: err.message });
  }

  // ── Paso 2: crear reseña SIN auth → queda en hold ────────────────────────
  try {
    const reviewRes = await fetch(`${wcBase}/products/reviews`, {
      method:  'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization:  adminAuth, // necesario para usar la API, pero forzamos status hold
      },
      body: JSON.stringify({
        product_id:      productId,
        reviewer:        nombre,
        reviewer_email:  email,
        review:          resena,
        rating:          Number(calificacion),
        status:          'hold',
      }),
    });

    const data = await reviewRes.json();

    if (!reviewRes.ok) {
      // Devolver el error real de WooCommerce para facilitar el diagnóstico
      return res.status(reviewRes.status).json({ wc_error: data });
    }

    return res.status(201).json(data);
  } catch (err) {
    return res.status(502).json({ error: 'Error al crear reseña', detail: err.message });
  }
}
