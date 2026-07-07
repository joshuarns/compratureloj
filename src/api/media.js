// ─────────────────────────────────────────────────────────────────────────────
// api/media.js
//
// Peticiones relacionadas con la subida de archivos a la Media Library de WordPress.
// ─────────────────────────────────────────────────────────────────────────────

import { axios, BASE_URL_WP, auth } from './client';

// ── comprimirImagen ───────────────────────────────────────────────────────────
// Comprime una imagen usando Canvas API antes de subirla.
//
// Por qué es necesario:
//   Las funciones serverless de Vercel tienen un límite de 4.5 MB por petición.
//   Las fotos tomadas con cámara de Android/iPhone pesan 5-15 MB. Sin comprimir,
//   el proxy las rechaza con un error 413 que se muestra como "error de conexión".
//
// Qué hace:
//   1. Si el archivo ya pesa ≤ MAX_UPLOAD_MB lo devuelve tal cual.
//   2. Si no, lo dibuja en un <canvas> (limitando dimensiones a MAX_DIM px)
//      y lo re-exporta como JPEG bajando la calidad hasta que quepa en el límite.
//   3. Devuelve un nuevo File con nombre sanitizado (sin espacios ni caracteres
//      raros que rompen el header Content-Disposition de WordPress).
//
const MAX_UPLOAD_MB  = 3.5;                       // margen bajo el límite de Vercel (4.5 MB)
const MAX_UPLOAD_BYTES = MAX_UPLOAD_MB * 1024 * 1024;
const MAX_DIM = 2000;                             // px — suficiente para cualquier reloj

const sanitizarNombre = (nombre) =>
  (nombre || 'foto.jpg').replace(/[^\w.-]/g, '_');

const comprimirImagen = (file) => new Promise((resolve) => {
  // Ya entra dentro del límite → sin tocar
  if (file.size <= MAX_UPLOAD_BYTES) {
    resolve(new File([file], sanitizarNombre(file.name), { type: file.type }));
    return;
  }

  const img   = new Image();
  const blobUrl = URL.createObjectURL(file);

  img.onload = () => {
    URL.revokeObjectURL(blobUrl);

    // Reducir dimensiones si la foto es demasiado grande
    let { width, height } = img;
    if (width > MAX_DIM || height > MAX_DIM) {
      const ratio = Math.min(MAX_DIM / width, MAX_DIM / height);
      width  = Math.round(width  * ratio);
      height = Math.round(height * ratio);
    }

    const canvas = document.createElement('canvas');
    canvas.width  = width;
    canvas.height = height;
    canvas.getContext('2d').drawImage(img, 0, 0, width, height);

    // Intentar con calidad decreciente hasta que quepa en MAX_UPLOAD_BYTES
    let quality = 0.82;
    const nombre = sanitizarNombre(file.name.replace(/\.[^.]+$/, '') + '.jpg');

    const intentar = () => {
      canvas.toBlob((blob) => {
        if (!blob) { resolve(file); return; } // fallback: subir el original
        if (blob.size <= MAX_UPLOAD_BYTES || quality <= 0.45) {
          resolve(new File([blob], nombre, { type: 'image/jpeg' }));
        } else {
          quality -= 0.12;
          intentar();
        }
      }, 'image/jpeg', quality);
    };
    intentar();
  };

  // Si el navegador no puede decodificar la imagen (HEIC, etc.) → subir original
  img.onerror = () => { URL.revokeObjectURL(blobUrl); resolve(file); };
  img.src = blobUrl;
});

// ── uploadImage ───────────────────────────────────────────────────────────────
// Sube una imagen a la Media Library de WordPress via POST /wp/v2/media.
// Devuelve el objeto de media creado, que incluye source_url — la URL pública
// que luego se guarda en el campo images[] del producto de WooCommerce.
//
// Content-Disposition es requerido por la WP REST API para nombrar el archivo.
// Sin este header WordPress rechaza la petición con 400.
// El nombre debe ir entrecomillado (RFC 6266) para soportar espacios.
export const uploadImage = async (file) => {
    if (!file) throw new Error('No hay archivo');

    const fileComprimido = await comprimirImagen(file);

    // Binary upload: más confiable a través de proxies que multipart/form-data.
    // WordPress acepta el archivo como body binario cuando se envía Content-Type
    // del archivo + Content-Disposition con el nombre.
    const arrayBuffer = await fileComprimido.arrayBuffer();

    const response = await axios.post(
        `${BASE_URL_WP}/media`,
        arrayBuffer,
        {
            headers: {
                'Content-Type':        fileComprimido.type || 'image/jpeg',
                'Content-Disposition': `attachment; filename="${fileComprimido.name}"`,
            },
            auth,
        },
    );

    return response.data;
};
