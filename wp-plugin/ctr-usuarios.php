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

// EmailJS
define( 'CTR_EMAILJS_SERVICE_ID',     'service_feqp5lh' );
define( 'CTR_EMAILJS_PUBLIC_KEY',     'roG_GmR36UKJmh2Mz' );
define( 'CTR_EMAILJS_TPL_PUBLICADO',  'template_lrkundk' );
define( 'CTR_SITE_URL',               'https://compratureloj.com.mx' );

function ctr_emailjs_send( $template_id, $params ) {
    wp_remote_post( 'https://api.emailjs.com/api/v1.0/email/send', [
        'headers' => [ 'Content-Type' => 'application/json' ],
        'body'    => json_encode( [
            'service_id'      => CTR_EMAILJS_SERVICE_ID,
            'template_id'     => $template_id,
            'user_id'         => CTR_EMAILJS_PUBLIC_KEY,
            'template_params' => $params,
        ] ),
        'timeout' => 10,
    ] );
}


// ════════════════════════════════════════════════════════════════════════════
// NOTIFICACIÓN AL VENDEDOR CUANDO SU RELOJ ES PUBLICADO
// Se dispara cuando el admin cambia el estado del producto a "publish".
// ════════════════════════════════════════════════════════════════════════════
add_action( 'transition_post_status', function ( $new_status, $old_status, $post ) {
    if ( $post->post_type !== 'product' ) return;
    if ( $new_status !== 'publish' || $old_status === 'publish' ) return;

    $vendedor_id = get_post_meta( $post->ID, 'vendedor_id', true );
    if ( ! $vendedor_id ) return;

    $vendedor = get_userdata( (int) $vendedor_id );
    if ( ! $vendedor ) return;

    $nombre = trim( $vendedor->first_name . ' ' . $vendedor->last_name ) ?: $vendedor->user_login;

    $precio_raw = get_post_meta( $post->ID, '_regular_price', true );
    $precio     = $precio_raw ? '$' . number_format( (float) $precio_raw, 0, '.', ',' ) : '—';

    ctr_emailjs_send( CTR_EMAILJS_TPL_PUBLICADO, [
        'to_email'        => $vendedor->user_email,
        'vendedor_nombre' => $nombre,
        'reloj_nombre'    => $post->post_title,
        'marca'           => get_post_meta( $post->ID, 'marca',  true ) ?: '—',
        'modelo'          => get_post_meta( $post->ID, 'modelo', true ) ?: '—',
        'precio'          => $precio,
        'fecha'           => wp_date( 'd/m/Y H:i' ),
        'reloj_url'       => CTR_SITE_URL . '/producto/' . $post->ID,
    ] );
}, 10, 3 );


// ════════════════════════════════════════════════════════════════════════════
// 0. LIMPIEZA DE CACHÉ AL BORRAR USUARIO
//    SiteGround y otros hostings con object cache (Redis/Memcached) pueden
//    retener el email del usuario borrado, bloqueando un nuevo registro con
//    el mismo correo. Este hook limpia la caché de usuario al eliminar.
// ════════════════════════════════════════════════════════════════════════════
add_action( 'deleted_user', function ( $user_id ) {
    clean_user_cache( $user_id );
    wp_cache_flush();
} );


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

    $username = sanitize_user( $data['username'] ?? '' );
    $email    = sanitize_email( $data['email']   ?? '' );

    // Validaciones en español antes de intentar insertar
    if ( empty( $username ) ) {
        return new WP_Error( 'register_failed', 'El nombre de usuario es requerido.', [ 'status' => 400 ] );
    }
    if ( empty( $email ) || ! is_email( $email ) ) {
        return new WP_Error( 'register_failed', 'El email no es válido.', [ 'status' => 400 ] );
    }
    if ( username_exists( $username ) ) {
        return new WP_Error( 'register_failed', 'Ese nombre de usuario ya está en uso. Elige otro.', [ 'status' => 400 ] );
    }
    if ( email_exists( $email ) ) {
        $existing = get_user_by( 'email', $email );
        $aprobado = $existing ? (int) get_user_meta( $existing->ID, CTR_META_KEY, true ) : -1;
        if ( $aprobado === 0 ) {
            return new WP_Error( 'register_failed', 'Ya existe una cuenta con ese email pendiente de aprobación.', [ 'status' => 400 ] );
        }
        return new WP_Error( 'register_failed', 'Ya existe una cuenta registrada con ese email.', [ 'status' => 400 ] );
    }

    $user_id = wp_insert_user( [
        'user_login' => $username,
        'user_email' => $email,
        'user_pass'  => $data['password']   ?? '',
        'first_name' => sanitize_text_field( $data['first_name'] ?? '' ),
        'last_name'  => sanitize_text_field( $data['last_name']  ?? '' ),
        'role'       => 'vendor',
    ] );

    if ( is_wp_error( $user_id ) ) {
        return new WP_Error( 'register_failed', 'No se pudo crear la cuenta. Intenta de nuevo.', [ 'status' => 400 ] );
    }

    // Marcar como pendiente de aprobación
    update_user_meta( $user_id, CTR_META_KEY, 0 );

    // Notificar al admin por correo interno de WordPress
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
// 2. COLUMNA "APROBACIÓN" EN LA LISTA DE USUARIOS DEL WP ADMIN
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
// 3. ACCIONES "APROBAR / DESAPROBAR" EN CADA FILA DE USUARIO
// ════════════════════════════════════════════════════════════════════════════
add_filter( 'user_row_actions', function ( $actions, $user ) {
    if ( in_array( 'administrator', (array) $user->roles, true ) ) return $actions;

    $aprobado = get_user_meta( $user->ID, CTR_META_KEY, true );
    $nonce    = wp_create_nonce( 'ctr_aprobar_' . $user->ID );

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
// 4. PROCESAR LAS ACCIONES APROBAR / DESAPROBAR
//    El email de aprobación lo envía EmailJS desde React, no wp_mail.
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
    } elseif ( $action === 'ctr_desaprobar' ) {
        update_user_meta( $user_id, CTR_META_KEY, 0 );
    }

    wp_safe_redirect( admin_url( 'users.php' ) );
    exit;
}


// ════════════════════════════════════════════════════════════════════════════
// 5. ENDPOINT DE VERIFICACIÓN DE APROBACIÓN  /wp-json/ctr/v1/check-approval/{id}
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
