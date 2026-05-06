// Endpoint de diagnóstico temporal — eliminar después de confirmar que funciona
// Uso: https://tu-app.vercel.app/api/health
export default async function handler(req, res) {
  const url  = `${process.env.WC_BASE_URL}/products?per_page=1&status=publish`;
  const auth = Buffer.from(`${process.env.WC_KEY}:${process.env.WC_SECRET}`).toString('base64');

  try {
    const upstream = await fetch(url, {
      headers: { Authorization: `Basic ${auth}` },
    });

    const text = await upstream.text();
    let body;
    try { body = JSON.parse(text); } catch { body = text.slice(0, 500); }

    res.status(200).json({
      status:      upstream.status,
      ok:          upstream.ok,
      isArray:     Array.isArray(body),
      sample:      Array.isArray(body) ? `${body.length} productos` : body,
      wcBaseUrl:   process.env.WC_BASE_URL || 'NO DEFINIDA',
      keyPrefix:   (process.env.WC_KEY    || '').slice(0, 8) + '...',
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
