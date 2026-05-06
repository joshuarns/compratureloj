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
// GET /wp/v2/users/me con las credenciales del usuario → si son válidas,
// WordPress devuelve el objeto del usuario autenticado.
// Si son inválidas, devuelve 401 → AuthContext lo intercepta para marcar
// la sesión como expirada.
export const loginUsuario = async (username, password) => {
    const response = await axios.get(`${BASE_URL_WP}/users/me`, {
        // Aquí usamos las credenciales del usuario, NO las del admin
        auth: { username, password },
    });
    return response.data;
};

// ── createUser ────────────────────────────────────────────────────────────────
// Registra un nuevo usuario en WordPress.
// Llamado desde RegisterForm cuando el visitante completa el formulario.
// El rol "shop_manager" permite al usuario publicar y gestionar productos.
export const createUser = async (userData) => {
    const response = await axios.post(
        `${BASE_URL_WP}/users`,
        {
            username:   userData.username,
            email:      userData.email,
            password:   userData.password,
            first_name: userData.first_name,
            last_name:  userData.last_name,
            roles:      ['shop_manager'], // necesario para que pueda subir relojes
        },
        { auth },
    );
    return response.data;
};

// ── obtenerUsuario ────────────────────────────────────────────────────────────
// Obtiene el perfil completo de un usuario por su ID.
// Devuelve: first_name, last_name, email, description, avatar_urls, etc.
// Usado en MiCuenta para pre-rellenar el formulario de edición.
export const obtenerUsuario = async (id) => {
    const response = await axios.get(`${BASE_URL_WP}/users/${id}`, { auth });
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
