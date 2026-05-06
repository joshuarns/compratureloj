// ─────────────────────────────────────────────────────────────────────────────
// api/media.js
//
// Peticiones relacionadas con la subida de archivos a la Media Library de WordPress.
// ─────────────────────────────────────────────────────────────────────────────

import { axios, BASE_URL_WP, auth } from './client';

// ── uploadImage ───────────────────────────────────────────────────────────────
// Sube una imagen a la Media Library de WordPress via POST /wp/v2/media.
// Devuelve el objeto de media creado, que incluye source_url — la URL pública
// que luego se guarda en el campo images[] del producto de WooCommerce.
//
// Content-Disposition es requerido por la WP REST API para nombrar el archivo.
// Sin este header WordPress rechaza la petición con 400.
export const uploadImage = async (file) => {
    if (!file) throw new Error('No hay archivo');

    // FormData es el formato que espera la WP Media API para archivos binarios
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post(
        `${BASE_URL_WP}/media`,
        formData,
        {
            headers: {
                // WordPress usa este header para saber con qué nombre guardar el archivo
                'Content-Disposition': `attachment; filename=${file.name}`,
            },
            auth,
        },
    );

    return response.data;
};
