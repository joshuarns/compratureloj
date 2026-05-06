// Endpoint de diagnóstico — eliminar después de confirmar que funciona
// Uso: https://tu-app.vercel.app/api/health
export default async function handler(req, res) {
  const auth    = Buffer.from(`${process.env.WC_KEY}:${process.env.WC_SECRET}`).toString('base64');
  const baseUrl = process.env.WC_BASE_URL || '';

  // ── Test 1: llamada directa a WooCommerce (per_page=1) ──────────────────────
  let direct1 = {};
  try {
    const url      = `${baseUrl}/products?per_page=1&status=publish`;
    const upstream = await fetch(url, { headers: { Authorization: `Basic ${auth}` } });
    const text     = await upstream.text();
    let body;
    try { body = JSON.parse(text); } catch { body = text.slice(0, 200); }
    direct1 = { status: upstream.status, isArray: Array.isArray(body), count: Array.isArray(body) ? body.length : 'N/A', raw: Array.isArray(body) ? undefined : body };
  } catch (e) { direct1 = { error: e.message }; }

  // ── Test 2: llamada directa a WooCommerce (per_page=12, page=1) ─────────────
  // Exactamente los mismos params que usa ListaProductos en Home
  let direct12 = {};
  try {
    const url      = `${baseUrl}/products?per_page=12&page=1&status=publish`;
    const upstream = await fetch(url, { headers: { Authorization: `Basic ${auth}` } });
    const text     = await upstream.text();
    let body;
    try { body = JSON.parse(text); } catch { body = text.slice(0, 200); }
    direct12 = { status: upstream.status, isArray: Array.isArray(body), count: Array.isArray(body) ? body.length : 'N/A', raw: Array.isArray(body) ? undefined : body };
  } catch (e) { direct12 = { error: e.message }; }

  // ── Test 3: llamada al PROXY /api/wc/products (lo que hace el navegador) ────
  let proxyTest = {};
  try {
    const host      = req.headers.host;
    const protocol  = host.includes('localhost') ? 'http' : 'https';
    // Nuevo endpoint: /api/wc?_path=products&... (api/wc.js en raíz)
    const proxyUrl  = `${protocol}://${host}/api/wc?_path=products&per_page=12&page=1&status=publish`;
    const upstream  = await fetch(proxyUrl);
    const text      = await upstream.text();
    let body;
    try { body = JSON.parse(text); } catch { body = text.slice(0, 200); }
    proxyTest = { status: upstream.status, isArray: Array.isArray(body), count: Array.isArray(body) ? body.length : 'N/A', raw: Array.isArray(body) ? undefined : body };
  } catch (e) { proxyTest = { error: e.message }; }

  res.status(200).json({
    wcBaseUrl:  baseUrl || 'NO DEFINIDA',
    keyPrefix:  (process.env.WC_KEY || '').slice(0, 8) + '...',
    direct1,
    direct12,
    proxyTest,
  });
}
