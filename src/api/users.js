// ─────────────────────────────────────────────────────────────────────────────
// api/users.js
//
// Peticiones relacionadas con usuarios de WordPress.
// Incluye autenticación, registro, lectura y actualización de perfil.
//
// Nota sobre autenticación:
//   WordPress REST API usa HTTP Basic Auth. Las credenciales de admin
//   (REACT_APP_WC_KEY / REACT_APP_WC_SECRET) permiten leer y editar
//   cualquier usuario. loginUsuario es la única función que usa las
//   credenciales del propio usuario en lugar de las del admin.
// ─────────────────────────────────────────────────────────────────────────────

import { axios, BASE_URL_WP, auth } from './client';

const USE_PROXY = process.env.REACT_APP_USE_PROXY === 'true';

// ── loginUsuario ──────────────────────────────────────────────────────────────
// Valida las credenciales del usuario contra WordPress.
// En producción: POST /api/login → el proxy dedidcado reenvía las credenciales
//   del usuario a WordPress server-side (el proxy general sobreescribiría con admin).
// En desarrollo: GET /wp/v2/users/me con credenciales del usuario directamente.
export const loginUsuario = async (username, password) => {
    if (USE_PROXY) {
        // api/login.js reenvía username/password a WordPress con Basic Auth del usuario
        const response = await axios.post('/api/login', { username, password });
        return response.data;
    }

    const response = await axios.get(`${BASE_URL_WP}/users/me`, {
        // En desarrollo usamos las credenciales del usuario directamente
        auth: { username, password },
    });
    return response.data;
};

// ── createUser ────────────────────────────────────────────────────────────────
// Registra un nuevo usuario vía el endpoint personalizado /ctr/v1/register.
// Ese endpoint (definido en Code Snippets de WP) crea el usuario con wp_insert_user,
// lo marca como pendiente de aprobación (wp_user_is_approved=0) y notifica al admin.
export const createUser = async (userData) => {
    const url = USE_PROXY ? '/api/register' : (() => {
        // En desarrollo: construir la URL del endpoint personalizado
        const wpRoot = BASE_URL_WP.replace('/wp/v2', '');
        return `${wpRoot}/ctr/v1/register`;
    })();

    const response = await axios.post(
        url,
        {
            username:   userData.username,
            email:      userData.email,
            password:   userData.password,
            first_name: userData.first_name,
            last_name:  userData.last_name,
        },
        USE_PROXY ? {} : { auth },
    );

    return response.data;
};

// ── obtenerUsuario ────────────────────────────────────────────────────────────
// Obtiene el perfil completo de un usuario por su ID.
// Devuelve: first_name, last_name, email, description, avatar_urls, etc.
// Usado en MiCuenta para pre-rellenar el formulario de edición.
export const obtenerUsuario = async (id) => {
    // context=edit hace que WordPress devuelva los campos protegidos
    // (email, first_name, last_name) que el contexto "view" omite por defecto.
    const response = await axios.get(`${BASE_URL_WP}/users/${id}`, {
        params: { context: 'edit' },
        auth,
    });
    return response.data;
};

// ── actualizarUsuario ─────────────────────────────────────────────────────────
// Actualiza los datos de un usuario en WordPress vía PUT.
// Campos aceptados: first_name, last_name, email, description, password, name.
// Usado en MiCuenta para guardar cambios de perfil y contraseña.
export const actualizarUsuario = async (id, datos) => {
    const response = await axios.put(`${BASE_URL_WP}/users/${id}`, datos, { auth });
    return response.data;
};

// ── solicitarResetPassword ────────────────────────────────────────────────────
// Envía el formulario nativo de "olvidé mi contraseña" de WordPress.
// WordPress no expone un endpoint REST para esto, así que usamos
// wp-login.php directamente con mode:'no-cors'.
//
// Con no-cors la respuesta es opaca — no podemos leerla ni saber si hubo error,
// pero WordPress procesa la solicitud y envía el email internamente.
// El componente ForgotPassword asume siempre éxito y muestra un mensaje genérico.
export const solicitarResetPassword = async (userLogin) => {
    const body = new FormData();
    body.append('action',     'lostpassword');
    body.append('user_login', userLogin);

    // En producción: el proxy expone /api/reset-password → wp-login.php (server-side).
    // En desarrollo: construimos la URL directamente desde BASE_URL_WP.
    const url = USE_PROXY
        ? '/api/reset-password'
        : `${BASE_URL_WP.replace('/wp-json/wp/v2', '')}/wp-login.php`;

    await fetch(url, { method: 'POST', body, mode: 'no-cors' });
};
