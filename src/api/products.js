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
// Trae los productos de un vendedor usando un enfoque híbrido:
//
//   1. Productos CON `vendedor_id` en meta_data → filtrar por ese campo.
//      Es el caso de todos los productos creados desde FormSellWatch.
//      Garantiza que el reloj de otro usuario nunca aparezca aquí.
//
//   2. Productos SIN `vendedor_id` → son productos creados directamente desde
//      el admin de WordPress. Para esos, filtramos por author vía WP REST API
//      (el autor sí se asigna bien en el admin de WP).
//
// Ambos conjuntos se fusionan y deduplicан por ID.
export const obtenerMisProductos = async (vendedorId) => {
    const idStr = String(vendedorId);

    // ── Paso 1: traer todos los productos (con meta_data incluido) ────────────
    const wcRespuesta = await axios.get(`${BASE_URL}/products`, {
        params: { status: 'any', per_page: 100 },
        auth,
    });
    const todos = Array.isArray(wcRespuesta.data) ? wcRespuesta.data : [];

    // Separar productos según tengan o no `vendedor_id`
    const conVendedorId  = [];
    const sinVendedorId  = [];

    for (const p of todos) {
        const meta = (p.meta_data || []).find(m => m.key === 'vendedor_id');
        if (meta?.value && meta.value !== '-1') {
            conVendedorId.push(p);
        } else {
            sinVendedorId.push(p);
        }
    }

    // Filtrar por vendedor_id estrictamente
    const porMeta = conVendedorId.filter(p => {
        const meta = (p.meta_data || []).find(m => m.key === 'vendedor_id');
        return meta.value === idStr;
    });

    // ── Paso 2: para los sin vendedor_id, consultar author vía WP REST API ────
    let porAutor = [];
    if (sinVendedorId.length > 0) {
        try {
            const wpRespuesta = await axios.get(`${BASE_URL_WP}/product`, {
                params: { author: vendedorId, status: 'any', per_page: 100, _fields: 'id' },
                auth,
            });
            const wpIds = new Set(
                (Array.isArray(wpRespuesta.data) ? wpRespuesta.data : []).map(p => p.id)
            );
            porAutor = sinVendedorId.filter(p => wpIds.has(p.id));
        } catch {
            // Si falla la consulta WP (p.ej. captcha), omitir silenciosamente
        }
    }

    // ── Fusionar y deduplicar por ID ──────────────────────────────────────────
    const vistos = new Set();
    return [...porMeta, ...porAutor].filter(p => {
        if (vistos.has(p.id)) return false;
        vistos.add(p.id);
        return true;
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
// Actualiza un producto existente por su ID.
// Llamado desde EditWatch cuando el vendedor guarda cambios.
// Solo se envían los campos que se quieren actualizar (PUT parcial).
export const actualizarProducto = async (id, productoData) => {
    const response = await axios.put(`${BASE_URL}/products/${id}`, productoData, { auth });
    return response.data;
};
