// ─────────────────────────────────────────────────────────
// Dashboard.jsx
//
// Vista privada del usuario autenticado. Se divide en tres tabs:
//   "Mis relojes"  → tabla de relojes que el usuario ha publicado
//   "Mis compras"  → historial de pedidos filtrado por su email
//   "Mi cuenta"    → edición de perfil, avatar y contraseña
//
// Cada tab es un sub-componente independiente (MisRelojes, MisCompras,
// MiCuenta) para mantener el estado de cada sección aislado y poder
// hacer lazy-load más adelante si el Dashboard crece más.
// ─────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

// Funciones compartidas para procesar datos de WooCommerce
import {
  getMeta,
  formatPeso,
  estadoProductoTexto,
  estadoPedidoTexto,
  estadoPedidoClase,
} from "../../utils/woocommerce";

import { useAuth } from "../../context/AuthContext";
// obtenerUsuario y actualizarUsuario se usan solo en MiCuenta → se importan allá
import { obtenerMisProductos, obtenerMisPedidos, actualizarProducto } from "../../api";

// MiCuenta vive en su propio archivo para mantener Dashboard.jsx manejable
import MiCuenta from "./MiCuenta";
import { useSEO } from "../../hooks/useSEO";
import './Dashboard.css';
import '../../App.css'; // Estilos globales: .apiErrorCard, .bannerSingle

const POR_PAGINA_RELOJES  = 8;
const POR_PAGINA_COMPRAS  = 10;

// ── Paginación reutilizable ───────────────────────────────────────────────────
function Paginacion({ paginaActual, totalPaginas, onChange }) {
  if (totalPaginas <= 1) return null;
  return (
    <div className="dashPaginacion">
      <button
        className="dashPagBtn"
        disabled={paginaActual === 1}
        onClick={() => onChange(paginaActual - 1)}
      >
        ‹
      </button>
      {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(n => (
        <button
          key={n}
          className={`dashPagBtn${n === paginaActual ? " dashPagActivo" : ""}`}
          onClick={() => onChange(n)}
        >
          {n}
        </button>
      ))}
      <button
        className="dashPagBtn"
        disabled={paginaActual === totalPaginas}
        onClick={() => onChange(paginaActual + 1)}
      >
        ›
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// SUB-COMPONENTE: Tab "Mis relojes"
// Muestra la tabla de relojes publicados por el usuario actual.
// ─────────────────────────────────────────────────────────
function MisRelojes({ usuario }) {
  const [relojes, setRelojes]   = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError]       = useState(false);
  const [reintento, setReintento] = useState(0);
  const [pagina, setPagina]     = useState(1);
  // id del reloj que está siendo publicado/despublicado en este momento
  const [publicando, setPublicando] = useState(null);

  const togglePublicar = async (reloj) => {
    const nuevoStatus = reloj.status === 'publish' ? 'draft' : 'publish';
    setPublicando(reloj.id);
    try {
      await actualizarProducto(reloj.id, { status: nuevoStatus });
      // Actualizar el estado local sin recargar toda la lista
      setRelojes(prev => prev.map(r =>
        r.id === reloj.id ? { ...r, status: nuevoStatus } : r
      ));
    } catch {
      alert('No se pudo cambiar el estado. Intenta de nuevo.');
    } finally {
      setPublicando(null);
    }
  };

  // `activo` evita setState si el componente se desmonta antes de que
  // la petición responda (ej. el usuario cambia de tab muy rápido).
  useEffect(() => {
    let activo = true;
    setCargando(true);
    setError(false);
    setPagina(1);

    obtenerMisProductos(usuario.id)
      .then(data  => { if (activo) setRelojes(data); })
      .catch(err  => {
        if (!activo) return;
        setError(true);
      })
      .finally(() => { if (activo) setCargando(false); });

    return () => { activo = false; };
  }, [usuario.id, reintento]);

  const totalPaginas  = Math.ceil(relojes.length / POR_PAGINA_RELOJES);
  const relojesPagina = relojes.slice((pagina - 1) * POR_PAGINA_RELOJES, pagina * POR_PAGINA_RELOJES);

  // Tarjeta de error con botón de reintentar
  if (error) return (
    <div className="apiErrorCard">
      <div className="apiErrorIcon">⚠️</div>
      <div className="apiErrorBody">
        <p className="apiErrorTitle">No se pudieron cargar tus relojes</p>
        <p className="apiErrorText">
          Verifica tu conexión a internet o intenta de nuevo en unos momentos.
        </p>
        <button className="apiErrorRetry" onClick={() => setReintento(r => r + 1)}>
          Reintentar
        </button>
      </div>
    </div>
  );

  if (cargando) return (
    <p style={{ fontFamily: "Mulish", color: "#6e6e73", paddingTop: 20 }}>
      Cargando tus relojes...
    </p>
  );

  if (relojes.length === 0) return (
    <div className="emptyDashboard">
      <div style={{ fontSize: 48, marginBottom: 16 }}>⌚</div>
      <p>Todavía no has enviado ningún reloj.</p>
      <Link to="/vender-reloj" className="btnSellWatch">
        Vender mi primer reloj
      </Link>
    </div>
  );

  return (
    <div className="watchTableCard">
      <table className="watchTable">
        <thead>
          <tr>
            <th>Reloj</th>
            <th>Estado</th>
            <th className="colPrecio">Precio</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {relojesPagina.map((reloj) => {
            const marca = getMeta(reloj.meta_data, "marca");
            return (
              <tr key={reloj.id}>
                <td>
                  <div className="d-flex align-items-center gap-3">
                    {reloj.images?.length > 0 ? (
                      <img src={reloj.images[0].src} alt={reloj.name} className="watchThumb" />
                    ) : (
                      <div className="watchThumbPlaceholder">⌚</div>
                    )}
                    <div>
                      <p className="watchTableName">{reloj.name}</p>
                      {marca && <p className="watchTableMarca">{marca}</p>}
                    </div>
                  </div>
                </td>
                <td>
                  {reloj.status === 'publish' && reloj.stock_status === 'outofstock' ? (
                    <span className="statusBadge outofstock">Sin existencia</span>
                  ) : (
                    <span className={`statusBadge ${reloj.status}`}>
                      {estadoProductoTexto[reloj.status] || reloj.status}
                    </span>
                  )}
                </td>
                <td className="colPrecio">
                  <span className="watchTablePrice">
                    {formatPeso(reloj.regular_price)}
                  </span>
                </td>
                <td>
                  <div className="dashAcciones">
                    <Link to={`/editar-reloj/${reloj.id}`} className="btnEditWatch">
                      Editar
                    </Link>
                    {usuario.roles?.includes('administrator') && (
                      <button
                        className={`btnPublicar ${reloj.status === 'publish' ? 'btnDespublicar' : ''}`}
                        disabled={publicando === reloj.id}
                        onClick={() => togglePublicar(reloj)}
                      >
                        {publicando === reloj.id
                          ? '...'
                          : reloj.status === 'publish' ? 'Despublicar' : 'Publicar'}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <Paginacion paginaActual={pagina} totalPaginas={totalPaginas} onChange={setPagina} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// SUB-COMPONENTE: Tab "Mis compras"
// Muestra el historial de pedidos del usuario filtrado por su email.
// Usa email de facturación porque WooCommerce no garantiza customer_id
// para usuarios con rol shop_manager.
// ─────────────────────────────────────────────────────────
function MisCompras({ usuario }) {
  const [pedidos, setPedidos]   = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError]       = useState(false);
  const [reintento, setReintento] = useState(0);
  const [pagina, setPagina]     = useState(1);

  // Mismo patrón que MisRelojes: `activo` protege los setters
  // si el componente se desmonta mientras la petición está en vuelo.
  useEffect(() => {
    let activo = true;
    setCargando(true);
    setError(false);
    setPagina(1);

    obtenerMisPedidos(usuario.id)
      .then(data  => { if (activo) setPedidos(data); })
      .catch(err  => {
        if (!activo) return;
        setError(true);
      })
      .finally(() => { if (activo) setCargando(false); });

    return () => { activo = false; };
  }, [usuario.id, reintento]);

  const totalPaginas  = Math.ceil(pedidos.length / POR_PAGINA_COMPRAS);
  const pedidosPagina = pedidos.slice((pagina - 1) * POR_PAGINA_COMPRAS, pagina * POR_PAGINA_COMPRAS);

  // Tarjeta de error con botón de reintentar
  if (error) return (
    <div className="apiErrorCard">
      <div className="apiErrorIcon">⚠️</div>
      <div className="apiErrorBody">
        <p className="apiErrorTitle">No se pudieron cargar tus compras</p>
        <p className="apiErrorText">
          Verifica tu conexión a internet o intenta de nuevo en unos momentos.
        </p>
        <button className="apiErrorRetry" onClick={() => setReintento(r => r + 1)}>
          Reintentar
        </button>
      </div>
    </div>
  );

  if (cargando) return (
    <p style={{ fontFamily: "Mulish", color: "#6e6e73", paddingTop: 20 }}>
      Cargando tus compras...
    </p>
  );

  if (pedidos.length === 0) return (
    <div className="emptyDashboard">
      <div style={{ fontSize: 48, marginBottom: 16 }}>🛍</div>
      <p>Aún no tienes compras registradas.</p>
      <Link to="/shop" className="btnSellWatch">Ver relojes</Link>
    </div>
  );

  return (
    <div className="watchTableCard">
      <table className="watchTable">
        <thead>
          <tr>
            <th>Pedido</th>
            <th>Fecha</th>
            <th>Estado</th>
            <th className="colPrecio">Total</th>
          </tr>
        </thead>
        <tbody>
          {pedidosPagina.map((pedido) => {
            // Formateamos la fecha de WooCommerce (ISO 8601) a español legible
            const fecha = new Date(pedido.date_created).toLocaleDateString("es-MX", {
              year: "numeric", month: "short", day: "numeric",
            });

            return (
              <tr key={pedido.id}>
                {/* Columna: número de pedido + primer artículo */}
                <td>
                  <p className="watchTableName">Pedido #{pedido.id}</p>
                  <p className="watchTableMarca">
                    {/* Mostramos los nombres de los artículos separados por coma */}
                    {pedido.line_items.map(i => i.name).join(", ")}
                  </p>
                </td>

                <td>
                  <span style={{ fontFamily: "Mulish", fontSize: 14, color: "#444" }}>
                    {fecha}
                  </span>
                </td>

                <td>
                  <span className={estadoPedidoClase[pedido.status] || "statusBadge private"}>
                    {estadoPedidoTexto[pedido.status] || pedido.status}
                  </span>
                </td>

                <td className="colPrecio">
                  <span className="watchTablePrice">{formatPeso(pedido.total)}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <Paginacion paginaActual={pagina} totalPaginas={totalPaginas} onChange={setPagina} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL: Dashboard
// ─────────────────────────────────────────────────────────
function Dashboard() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const [tabActivo, setTabActivo] = useState("relojes");

  useSEO({ titulo: "Mi Dashboard" });

  useEffect(() => {
    if (!usuario) navigate("/login");
  }, [usuario, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!usuario) return null;

  return (
    <>
      {/* ── Banner superior ── */}
      <div className="container-fluid bannerSingle">
        <div className="container d-flex justify-content-between align-items-center">
          <div>
            <h1 className="mb-1">Mi Dashboard</h1>
            <p className="mb-0">Bienvenido, {usuario.nombre}</p>
          </div>
          <button className="btnLogout" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
      </div>

      {/* ── Área de contenido ── */}
      <div className="dashboardContent">
        <div className="container">

          {/* ── Tabs de navegación ── */}
          <div className="dashboardTabs">
            <button
              className={`dashboardTab${tabActivo === "relojes" ? " active" : ""}`}
              onClick={() => setTabActivo("relojes")}
            >
              Mis relojes
            </button>
            <button
              className={`dashboardTab${tabActivo === "compras" ? " active" : ""}`}
              onClick={() => setTabActivo("compras")}
            >
              Mis compras
            </button>
            <button
              className={`dashboardTab${tabActivo === "cuenta" ? " active" : ""}`}
              onClick={() => setTabActivo("cuenta")}
            >
              Mi cuenta
            </button>
          </div>

          {/* ── Encabezado con botón de acción (solo en "Mis relojes") ── */}
          {tabActivo === "relojes" && (
            <div className="d-flex justify-content-end mb-4">
              <Link to="/vender-reloj" className="btnNuevoReloj">
                + Subir reloj
              </Link>
            </div>
          )}

          {/* ── Contenido del tab activo ── */}
          {tabActivo === "relojes" && <MisRelojes  usuario={usuario} />}
          {tabActivo === "compras" && <MisCompras  usuario={usuario} />}
          {tabActivo === "cuenta"  && <MiCuenta    usuario={usuario} />}

        </div>
      </div>
    </>
  );
}

export default Dashboard;
