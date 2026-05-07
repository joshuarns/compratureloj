<?php
/**
 * Plugin Name: Compra Tu Reloj — Gestión de Usuarios
 * Description: Registro, aprobación y autenticación de vendedores para compratureloj.com.mx
 * Version:     1.0.0
 * Author:      Compra Tu Reloj
 */

if ( ! defined( 'ABSPATH' ) ) exit;

// URL del sitio React — cambiar si el dominio cambia
define( 'CTR_LOGIN_URL', 'https://compratureloj.com.mx/login' );
define( 'CTR_META_KEY',  'wp_user_is_approved' );


// ════════════════════════════════════════════════════════════════════════════
// 1. ENDPOINT DE REGISTRO  /wp-json/ctr/v1/register
//    Crea el usuario, lo marca como pendiente y notifica al admin.
//    React llama a este endpoint en lugar del nativo /wp/v2/users.
// ════════════════════════════════════════════════════════════════════════════
add_action( 'rest_api_init', function () {
    register_rest_route( 'ctr/v1', '/register', [
        'methods'             => 'POST',
        'callback'            => 'ctr_registrar_usuario',
        'permission_callback' => '__return_true',
    ] );
} );

function ctr_registrar_usuario( WP_REST_Request $request ) {
    $data = $request->get_json_params();

    $user_id = wp_insert_user( [
        'user_login' => sanitize_user( $data['username'] ?? '' ),
        'user_email' => sanitize_email( $data['email']    ?? '' ),
        'user_pass'  => $data['password']   ?? '',
        'first_name' => sanitize_text_field( $data['first_name'] ?? '' ),
        'last_name'  => sanitize_text_field( $data['last_name']  ?? '' ),
        'role'       => 'vendor',
    ] );

    if ( is_wp_error( $user_id ) ) {
        return new WP_Error( 'register_failed', $user_id->get_error_message(), [ 'status' => 400 ] );
    }

    // Marcar como pendiente de aprobación
    update_user_meta( $user_id, CTR_META_KEY, 0 );

    // Notificar al admin
    $user  = get_userdata( $user_id );
    $admin = get_option( 'admin_email' );
    wp_mail(
        $admin,
        'Nuevo vendedor pendiente de aprobación — Compra Tu Reloj',
        "Se registró un nuevo vendedor:\n\n" .
        "Nombre: {$user->display_name}\n" .
        "Usuario: {$user->user_login}\n" .
        "Email: {$user->user_email}\n\n" .
        "Apruébalo desde el panel de administración:\n" .
        admin_url( 'users.php' )
    );

    return new WP_REST_Response( [
        'id'       => $user_id,
        'username' => $user->user_login,
        'email'    => $user->user_email,
        'name'     => $user->display_name,
    ], 201 );
}


// ════════════════════════════════════════════════════════════════════════════
// 2. BLOQUEAR LOGIN REST API PARA USUARIOS NO APROBADOS
//    rest_authentication_errors corre para TODA autenticación vía REST API,
//    incluyendo Basic Auth — a diferencia de `authenticate` que solo aplica
//    al formulario nativo de WordPress.
// ════════════════════════════════════════════════════════════════════════════
add_filter( 'rest_authentication_errors', function ( $result ) {
    if ( ! empty( $result ) ) return $result;

    $user = wp_get_current_user();
    if ( ! $user || ! $user->exists() ) return $result;

    // Administradores siempre pasan — no bloquear el panel de WP
    if ( in_array( 'administrator', (array) $user->roles, true ) ) return $result;

    $aprobado = get_user_meta( $user->ID, CTR_META_KEY, true );

    if ( $aprobado === '' || (int) $aprobado === 0 ) {
        return new WP_Error(
            'user_not_approved',
            'Tu cuenta está pendiente de aprobación. Te avisaremos por email cuando esté activa.',
            [ 'status' => 401 ]
        );
    }

    return $result;
} );


// ════════════════════════════════════════════════════════════════════════════
// 3. COLUMNA "APROBACIÓN" EN LA LISTA DE USUARIOS DEL WP ADMIN
// ════════════════════════════════════════════════════════════════════════════
add_filter( 'manage_users_columns', function ( $columns ) {
    $columns['ctr_aprobado'] = 'Aprobación';
    return $columns;
} );

add_filter( 'manage_users_custom_column', function ( $output, $column, $user_id ) {
    if ( $column !== 'ctr_aprobado' ) return $output;

    $aprobado = get_user_meta( $user_id, CTR_META_KEY, true );

    if ( (int) $aprobado === 1 ) {
        return '<span style="color:#0a3622;background:#d1e7dd;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600;">✓ Aprobado</span>';
    }

    return '<span style="color:#856404;background:#fff3cd;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600;">⏳ Pendiente</span>';
}, 10, 3 );


// ════════════════════════════════════════════════════════════════════════════
// 4. ACCIONES "APROBAR / DESAPROBAR" EN CADA FILA DE USUARIO
// ════════════════════════════════════════════════════════════════════════════
add_filter( 'user_row_actions', function ( $actions, $user ) {
    // No mostrar en el propio admin
    if ( in_array( 'administrator', (array) $user->roles, true ) ) return $actions;

    $aprobado = get_user_meta( $user->ID, CTR_META_KEY, true );
    $nonce    = wp_create_nonce( 'ctr_aprobar_' . $user->ID );

    // Quitar botones de WP Approve User para evitar duplicados
    unset( $actions['approve'], $actions['unapprove'] );

    if ( (int) $aprobado === 1 ) {
        $url = admin_url( "users.php?action=ctr_desaprobar&user={$user->ID}&_wpnonce={$nonce}" );
        $actions['ctr_desaprobar'] = '<a href="' . esc_url( $url ) . '" style="color:#dc3545;">Desaprobar</a>';
    } else {
        $url = admin_url( "users.php?action=ctr_aprobar&user={$user->ID}&_wpnonce={$nonce}" );
        $actions['ctr_aprobar'] = '<a href="' . esc_url( $url ) . '" style="color:#198754;font-weight:700;">✓ Aprobar</a>';
    }

    return $actions;
}, 10, 2 );


// ════════════════════════════════════════════════════════════════════════════
// 5. PROCESAR LAS ACCIONES APROBAR / DESAPROBAR
// ════════════════════════════════════════════════════════════════════════════
add_action( 'admin_action_ctr_aprobar',    'ctr_procesar_aprobacion' );
add_action( 'admin_action_ctr_desaprobar', 'ctr_procesar_aprobacion' );

function ctr_procesar_aprobacion() {
    $action  = sanitize_text_field( $_GET['action']    ?? '' );
    $user_id = (int)( $_GET['user']      ?? 0 );
    $nonce   = sanitize_text_field( $_GET['_wpnonce'] ?? '' );

    if ( ! current_user_can( 'edit_users' ) ) wp_die( 'Sin permisos.' );
    if ( ! wp_verify_nonce( $nonce, 'ctr_aprobar_' . $user_id ) ) wp_die( 'Nonce inválido.' );
    if ( ! $user_id ) wp_die( 'Usuario no válido.' );

    if ( $action === 'ctr_aprobar' ) {
        update_user_meta( $user_id, CTR_META_KEY, 1 );
        ctr_enviar_email_aprobacion( $user_id );
    } elseif ( $action === 'ctr_desaprobar' ) {
        update_user_meta( $user_id, CTR_META_KEY, 0 );
    }

    wp_safe_redirect( admin_url( 'users.php' ) );
    exit;
}


// ════════════════════════════════════════════════════════════════════════════
// 6. ENDPOINT DE VERIFICACIÓN DE APROBACIÓN  /wp-json/ctr/v1/check-approval/{id}
//    Solo accesible con credenciales de admin. El proxy de login lo consulta
//    tras autenticar al usuario para decidir si devuelve la sesión a React.
// ════════════════════════════════════════════════════════════════════════════
add_action( 'rest_api_init', function () {
    register_rest_route( 'ctr/v1', '/check-approval/(?P<id>\d+)', [
        'methods'             => 'GET',
        'callback'            => function ( WP_REST_Request $request ) {
            $user_id  = (int) $request['id'];
            $aprobado = get_user_meta( $user_id, CTR_META_KEY, true );
            return new WP_REST_Response( [
                'approved' => (int) $aprobado === 1,
            ], 200 );
        },
        'permission_callback' => function () {
            return current_user_can( 'edit_users' );
        },
    ] );
} );


// ════════════════════════════════════════════════════════════════════════════
// 7. EMAIL DE APROBACIÓN — enlace al login de React, no de WordPress
// ════════════════════════════════════════════════════════════════════════════
function ctr_enviar_email_aprobacion( $user_id ) {
    $user = get_userdata( $user_id );
    if ( ! $user ) return;

    $nombre = $user->first_name ?: $user->user_login;

    $asunto  = '¡Tu cuenta en Compra Tu Reloj ha sido aprobada!';
    $mensaje =
        "Hola {$nombre},\n\n" .
        "Tu cuenta ha sido aprobada. Ya puedes iniciar sesión en:\n\n" .
        CTR_LOGIN_URL . "\n\n" .
        "Usuario: {$user->user_login}\n\n" .
        "Si olvidaste tu contraseña puedes restablecerla desde el mismo sitio.\n\n" .
        "¡Bienvenido a Compra Tu Reloj!\n" .
        "El equipo de Compra Tu Reloj";

    wp_mail( $user->user_email, $asunto, $mensaje );
}
