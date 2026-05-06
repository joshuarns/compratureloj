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
    const params = { status: 'publish', per_page: perPage, page };

    // WooCommerce filtra por nombre y descripción cuando se envía el param search
    if (busqueda) params.search = busqueda;

    const respuesta = await axios.get(`${BASE_URL}/products`, { params, auth });

    // parseInt con radix 10 para evitar interpretaciones octales en strings con ceros
    const totalPaginas = parseInt(respuesta.headers['x-wp-totalpages'] || '1', 10);

    return { productos: respuesta.data, totalPaginas };
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

    return { productos: productosRespuesta.data, totalPaginas };
};

// ── obtenerMisProductos ───────────────────────────────────────────────────────
// Trae los productos publicados por un vendedor específico.
// WooCommerce REST API no soporta filtrar por autor directamente,
// pero la WordPress REST API sí → hacemos dos peticiones:
//   Paso 1 → WP nos da los IDs de los posts del usuario
//   Paso 2 → WC nos da los datos completos de esos IDs
export const obtenerMisProductos = async (vendedorId) => {
    // Paso 1: GET /wp/v2/product?author=<id>&_fields=id (solo necesitamos los IDs)
    const wpRespuesta = await axios.get(`${BASE_URL_WP}/product`, {
        params: { author: vendedorId, status: 'any', per_page: 100, _fields: 'id' },
        auth,
    });

    const ids = wpRespuesta.data.map(p => p.id);
    if (ids.length === 0) return [];

    // Paso 2: GET /products?include=<ids>&status=any
    // status:any para ver todos los estados (draft, pending, publish…)
    const wcRespuesta = await axios.get(`${BASE_URL}/products`, {
        params: { include: ids.join(','), status: 'any', per_page: 100 },
        auth,
    });

    return wcRespuesta.data;
};

// ── crearProducto ─────────────────────────────────────────────────────────────
// Crea un nuevo producto en WooCommerce.
// Llamado desde FormSellWatch cuando el vendedor envía el formulario.
// El objeto productoData debe seguir el esquema de la WC REST API v3.
export const crearProducto = async (productoData) => {
    const response = await axios.post(`${BASE_URL}/products`, productoData, { auth });
    return response.data;
};

// ── actualizarProducto ────────────────────────────────────────────────────────
// Actualiza un producto existente por su ID.
// Llamado desde EditWatch cuando el vendedor guarda cambios.
// Solo se envían los campos que se quieren actualizar (PUT parcial).
export const actualizarProducto = async (id, productoData) => {
    const response = await axios.put(`${BASE_URL}/products/${id}`, productoData, { auth });
    return response.data;
};
