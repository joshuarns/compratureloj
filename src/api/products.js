// ─────────────────────────────────────────────────────────────────────────────
// api/products.js
//
// Todas las peticiones relacionadas con productos de WooCommerce.
// Incluye lectura, creación, actualización y filtrado por categoría o IDs.
// ─────────────────────────────────────────────────────────────────────────────

import { axios, BASE_URL, BASE_URL_WP, auth } from './client';

// ── obtenerProductos ──────────────────────────────────────────────────────────
// Trae el catálogo público con paginación y búsqueda opcional.
// Devuelve { productos, totalPaginas } para que el componente pueda
// renderizar los controles de paginación sin hacer una segunda petición.
//
// El header x-wp-totalpages lo inyecta WooCommerce automáticamente
// con el número total de páginas para los parámetros dados.
export const obtenerProductos = async (page = 1, perPage = 12, busqueda = "") => {
    // Con búsqueda: traemos todos los publicados y filtramos en el cliente
    // porque WooCommerce ?search= solo busca en título/descripción, no en
    // meta_data (marca, modelo, referencia).
    if (busqueda) {
        const termino = busqueda.toLowerCase().trim();

        const respuesta = await axios.get(`${BASE_URL}/products`, {
            params: { status: 'publish', per_page: 100, page: 1 },
            auth,
        });

        const todos = Array.isArray(respuesta.data) ? respuesta.data : [];

        const getMeta = (metaData, key) =>
            (metaData || []).find(m => m.key === key)?.value || '';

        const filtrados = todos.filter(p => {
            const campos = [
                p.name,
                getMeta(p.meta_data, 'marca'),
                getMeta(p.meta_data, 'modelo'),
                getMeta(p.meta_data, 'referencia'),
            ].join(' ').toLowerCase();
            return campos.includes(termino);
        });

        // Paginación client-side sobre los resultados filtrados
        const totalPaginas = Math.max(1, Math.ceil(filtrados.length / perPage));
        const inicio       = (page - 1) * perPage;
        const productos    = filtrados.slice(inicio, inicio + perPage);

        return { productos, totalPaginas };
    }

    // Sin búsqueda: paginación normal server-side
    const respuesta = await axios.get(`${BASE_URL}/products`, {
        params: { status: 'publish', per_page: perPage, page },
        auth,
    });

    const totalPaginas = parseInt(respuesta.headers['x-wp-totalpages'] || '1', 10);
    const productos    = Array.isArray(respuesta.data) ? respuesta.data : [];

    return { productos, totalPaginas };
};

// ── obtenerProducto ───────────────────────────────────────────────────────────
// Trae los datos completos de un producto por su ID.
// Usado en la página de detalle (DetalleProducto) y en EditWatch.
export const obtenerProducto = async (id) => {
    const response = await axios.get(`${BASE_URL}/products/${id}`, { auth });
    return response.data;
};

// ── obtenerProductosPorIds ────────────────────────────────────────────────────
// Trae varios productos en una sola petición usando el parámetro ?include=
// de WooCommerce. Usado en MiLista para cargar todos los favoritos a la vez.
// Si el array está vacío devuelve [] sin hacer la petición.
export const obtenerProductosPorIds = async (ids) => {
    if (!ids.length) return [];

    const response = await axios.get(`${BASE_URL}/products`, {
        params: {
            include:  ids.join(','),  // WC acepta IDs separados por coma
            per_page: ids.length,     // traemos exactamente los que pedimos
            status:   'publish',
        },
        auth,
    });

    return response.data;
};

// ── obtenerProductosPorCategoria ──────────────────────────────────────────────
// WooCommerce no acepta slugs de categoría directamente en ?category=,
// solo acepta IDs numéricos. Por eso hacemos dos peticiones:
//   Paso 1 → resolvemos el slug ("rolex") a su ID numérico
//   Paso 2 → traemos los productos de esa categoría con paginación
export const obtenerProductosPorCategoria = async (slug, page = 1, perPage = 12) => {
    // Paso 1: GET /products/categories?slug=rolex&per_page=1
    const catRespuesta = await axios.get(`${BASE_URL}/products/categories`, {
        params: { slug, per_page: 1 },
        auth,
    });

    // Si no existe la categoría devolvemos vacío sin lanzar error
    if (!catRespuesta.data.length) return { productos: [], totalPaginas: 0 };

    const categoriaId = catRespuesta.data[0].id;

    // Paso 2: GET /products?category=<id>&page=<n>&per_page=<n>
    const productosRespuesta = await axios.get(`${BASE_URL}/products`, {
        params: { status: 'publish', category: categoriaId, per_page: perPage, page },
        auth,
    });

    const totalPaginas = parseInt(productosRespuesta.headers['x-wp-totalpages'] || '1', 10);
    const productos    = Array.isArray(productosRespuesta.data) ? productosRespuesta.data : [];

    return { productos, totalPaginas };
};

// ── obtenerMisProductos ───────────────────────────────────────────────────────
// Filtra por el meta campo `vendedor_id` que FormSellWatch y EditWatch
// guardan con el ID real del vendedor. Es el único filtro confiable porque
// el filtro ?author= de WP REST API no funciona correctamente para el CPT
// `product` cuando se usan credenciales de admin.
export const obtenerMisProductos = async (vendedorId) => {
    const idStr = String(vendedorId);

    const wcRespuesta = await axios.get(`${BASE_URL}/products`, {
        params: { status: 'any', per_page: 100 },
        auth,
    });
    const todos = Array.isArray(wcRespuesta.data) ? wcRespuesta.data : [];

    return todos.filter(p => {
        const meta = (p.meta_data || []).find(m => m.key === 'vendedor_id');
        return meta?.value === idStr;
    });
};

// ── crearProducto ─────────────────────────────────────────────────────────────
// Crea un nuevo producto en WooCommerce.
// Llamado desde FormSellWatch cuando el vendedor envía el formulario.
// El objeto productoData debe seguir el esquema de la WC REST API v3.
//
// autorId (opcional): ID de WordPress del vendedor. Si se pasa, se hace una
// segunda llamada vía WP REST API para asignar el autor correcto, ya que la
// WC API siempre registra el producto bajo el dueño de las API keys (admin).
// Sin esto, todos los productos aparecerían en el dashboard del admin y ninguno
// en el de los demás vendedores.
export const crearProducto = async (productoData, autorId) => {
    const response = await axios.post(`${BASE_URL}/products`, productoData, { auth });
    const productoId = response.data.id;

    // Corregir el autor: WooCommerce REST API asigna el producto al dueño de
    // las API keys (admin). Actualizamos el campo `author` del post de WordPress
    // para que cada vendedor vea solo sus propios productos en "Mis relojes".
    if (autorId) {
        try {
            await axios.put(`${BASE_URL_WP}/product/${productoId}`, { author: autorId });
        } catch (err) {
            // No es fatal — el producto se creó correctamente, solo el autor queda
            // como admin. El vendedor puede contactar soporte para corregirlo.
            console.warn('[crearProducto] No se pudo actualizar el autor:', err?.response?.data || err.message);
        }
    }

    return response.data;
};

// ── actualizarProducto ────────────────────────────────────────────────────────
export const actualizarProducto = async (id, productoData) => {
    const response = await axios.put(`${BASE_URL}/products/${id}`, productoData, { auth });
    return response.data;
};

// ── eliminarProducto ──────────────────────────────────────────────────────────
// Mueve el producto a la papelera de WooCommerce (force=false).
// Llamado desde el Dashboard cuando el vendedor elimina un reloj.
export const eliminarProducto = async (id) => {
    const response = await axios.delete(`${BASE_URL}/products/${id}`, { params: { force: false }, auth });
    return response.data;
};

// ── _resolverProductoAncla ────────────────────────────────────────────────────
// Obtiene el ID del primer producto publicado para anclar las reseñas.
// Las reseñas en WooCommerce requieren un product_id válido; usamos el
// primer producto existente para no depender de un ID hardcodeado.
let _anclaCache = null;
const _resolverProductoAncla = async () => {
    if (_anclaCache) return _anclaCache;
    const res = await axios.get(`${BASE_URL}/products`, {
        params: { status: 'any', per_page: 1, page: 1 },
        auth,
    });
    const lista = Array.isArray(res.data) ? res.data : [];
    if (!lista.length) throw new Error('No hay productos en WooCommerce para anclar reseñas.');
    _anclaCache = lista[0].id;
    return _anclaCache;
};

// ── obtenerResenas ────────────────────────────────────────────────────────────
export const obtenerResenas = async (_ignored, perPage = 20) => {
    const productId = await _resolverProductoAncla();
    const response = await axios.get(`${BASE_URL}/products/reviews`, {
        params: { product: productId, status: 'approved', per_page: perPage },
        auth,
    });
    return Array.isArray(response.data) ? response.data : [];
};

// ── crearResena ───────────────────────────────────────────────────────────────
export const crearResena = async (_ignored, { nombre, email, resena, calificacion }) => {
    const productId = await _resolverProductoAncla();
    const response = await axios.post(`${BASE_URL}/products/reviews`, {
        product_id:      productId,
        reviewer:        nombre,
        reviewer_email:  email,
        review:          resena,
        rating:          calificacion,
    }, { auth });
    return response.data;
};

// ── obtenerTodasResenas ───────────────────────────────────────────────────────
export const obtenerTodasResenas = async (_ignored, status = 'hold') => {
    const productId = await _resolverProductoAncla();
    const response = await axios.get(`${BASE_URL}/products/reviews`, {
        params: { product: productId, status, per_page: 50 },
        auth,
    });
    return Array.isArray(response.data) ? response.data : [];
};

// ── actualizarResena ──────────────────────────────────────────────────────────
export const actualizarResena = async (id, status) => {
    const response = await axios.put(`${BASE_URL}/products/reviews/${id}`, { status }, { auth });
    return response.data;
};
