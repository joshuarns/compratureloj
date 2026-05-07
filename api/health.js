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

  // ── Test 4: login con usuario de prueba (username=TEST_USER en env) ──────────
  let loginTest = {};
  try {
    const host     = req.headers.host;
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const loginUrl = `${protocol}://${host}/api/login`;
    const upstream = await fetch(loginUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'test-user-nonexistent', password: 'test123' }),
    });
    const text = await upstream.text();
    let body;
    try { body = JSON.parse(text); } catch { body = { raw: text.slice(0, 300) }; }
    loginTest = { status: upstream.status, body };
  } catch (e) { loginTest = { error: e.message }; }

  // ── Test 5: WordPress /users/me con credenciales WP_USER:WP_PASS ────────────
  let wpDirectTest = {};
  try {
    const wpBase  = process.env.WP_BASE_URL
      || (process.env.WC_BASE_URL || '').replace('/wc/v3', '/wp/v2');
    const wpAuth  = Buffer.from(
      `${process.env.WP_USER || ''}:${process.env.WP_PASS || ''}`
    ).toString('base64');
    const upstream = await fetch(`${wpBase}/users/me`, {
      headers: { Authorization: `Basic ${wpAuth}` },
    });
    const text = await upstream.text();
    let body;
    try { body = JSON.parse(text); } catch { body = { raw: text.slice(0, 300) }; }
    wpDirectTest = {
      status:  upstream.status,
      wpUser:  process.env.WP_USER ? process.env.WP_USER.slice(0, 3) + '...' : 'NO DEFINIDA',
      wpPass:  process.env.WP_PASS ? '✓ definida' : 'NO DEFINIDA',
      id:      body?.id,
      name:    body?.name,
    };
  } catch (e) { wpDirectTest = { error: e.message }; }

  // ── Test 6: meta_data de un producto (pasa ?pid=ID para uno específico) ──────
  let metaTest = {};
  try {
    const pid    = req.query.pid;
    const url    = pid
      ? `${baseUrl}/products/${pid}`
      : `${baseUrl}/products?per_page=1&status=any`;
    const upstream = await fetch(url, { headers: { Authorization: `Basic ${auth}` } });
    const data     = await upstream.json();
    const p        = Array.isArray(data) ? data[0] : data;
    if (p?.id) {
      metaTest = {
        id:        p.id,
        name:      p.name,
        status:    p.status,
        // Mostrar TODAS las keys (incluyendo privadas) para diagnóstico
        meta_data: (p.meta_data || []).map(m => ({
          key:        m.key,
          value:      m.value,
          valueType:  Array.isArray(m.value) ? 'array' : typeof m.value,
        })),
      };
    } else {
      metaTest = { error: 'Producto no encontrado', raw: data };
    }
  } catch (e) { metaTest = { error: e.message }; }

  res.status(200).json({
    wcBaseUrl:   baseUrl || 'NO DEFINIDA',
    wpBaseUrl:   process.env.WP_BASE_URL || '(derivada de WC_BASE_URL)',
    keyPrefix:   (process.env.WC_KEY || '').slice(0, 8) + '...',
    direct1,
    direct12,
    proxyTest,
    loginTest,
    wpDirectTest,
    metaTest,
  });
}
