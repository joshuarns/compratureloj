require('dotenv').config();
const express               = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path                  = require('path');

const app  = express();
const PORT = process.env.PORT || 3001;

// Cabecera de autenticación Basic reutilizable
const basicAuth = () =>
  'Basic ' + Buffer.from(`${process.env.WC_KEY}:${process.env.WC_SECRET}`).toString('base64');

// ── Proxy WooCommerce REST API (/api/wc → wp-json/wc/v3) ─────────────────────
app.use('/api/wc', createProxyMiddleware({
  target:      process.env.WC_BASE_URL.replace('/wp-json/wc/v3', ''),
  changeOrigin: true,
  pathRewrite:  { '^/api/wc': '/wp-json/wc/v3' },
  onProxyReq:  (proxyReq) => proxyReq.setHeader('Authorization', basicAuth()),
}));

// ── Proxy WordPress REST API (/api/wp → wp-json/wp/v2) ───────────────────────
app.use('/api/wp', createProxyMiddleware({
  target:      process.env.WP_BASE_URL.replace('/wp-json/wp/v2', ''),
  changeOrigin: true,
  pathRewrite:  { '^/api/wp': '/wp-json/wp/v2' },
  onProxyReq:  (proxyReq) => proxyReq.setHeader('Authorization', basicAuth()),
}));

// ── Reset de contraseña (/api/reset-password → wp-login.php) ─────────────────
// wp-login.php no es parte de la REST API — necesita su propia ruta en el proxy.
app.use('/api/reset-password', createProxyMiddleware({
  target:      process.env.WP_BASE_URL.replace('/wp-json/wp/v2', ''),
  changeOrigin: true,
  pathRewrite:  { '^/api/reset-password': '/wp-login.php' },
}));

// ── Servir el build de React ──────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, '../build')));
app.get('*', (_req, res) =>
  res.sendFile(path.join(__dirname, '../build', 'index.html'))
);

app.listen(PORT, () =>
  console.log(`Proxy server corriendo en http://localhost:${PORT}`)
);
