// ─────────────────────────────────────────────────────────────────────────────
// api/index.js
//
// Punto de entrada único de la capa de API.
// Re-exporta todas las funciones de los módulos específicos para que
// los componentes puedan seguir importando desde "../../api" sin cambios.
//
// Cuando webpack (CRA) resuelve import { X } from "../../api", busca primero
// api.js y, si no existe, busca api/index.js — por eso este archivo
// actúa como reemplazo transparente del antiguo api.js.
//
// Organización de módulos:
//   products.js → obtenerProductos, obtenerProducto, obtenerProductosPorIds,
//                 obtenerProductosPorCategoria, obtenerMisProductos,
//                 crearProducto, actualizarProducto
//   orders.js   → crearPedido, obtenerPedido, obtenerMisPedidos
//   users.js    → loginUsuario, createUser, obtenerUsuario,
//                 actualizarUsuario, solicitarResetPassword
//   media.js    → uploadImage
// ─────────────────────────────────────────────────────────────────────────────

export {
    obtenerProductos,
    obtenerProducto,
    obtenerProductosPorIds,
    obtenerProductosPorCategoria,
    obtenerMisProductos,
    crearProducto,
    actualizarProducto,
    eliminarProducto,
    obtenerResenas,
    crearResena,
    obtenerTodasResenas,
    actualizarResena,
} from './products';

export {
    crearPedido,
    obtenerPedido,
    obtenerMisPedidos,
} from './orders';

export {
    loginUsuario,
    createUser,
    obtenerUsuario,
    actualizarUsuario,
    solicitarResetPassword,
} from './users';

export {
    uploadImage,
} from './media';
