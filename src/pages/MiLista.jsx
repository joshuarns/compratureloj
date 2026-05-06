// ─────────────────────────────────────────────────────────
// MI LISTA.JSX
// Página de favoritos — muestra los relojes guardados por el usuario.
// No requiere login: los IDs viven en localStorage vía WatchlistContext.
// ─────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";
import { useWatchlist } from "../context/WatchlistContext";
import { obtenerProductosPorIds } from "../api";
import ProductCard from "../components/ProductCard/ProductCard";
import { useSEO } from "../hooks/useSEO";
import "./MiLista.css";

function MiLista() {
  useSEO({ titulo: "Mi lista de favoritos" });

  const { watchlist } = useWatchlist();

  const [productos, setProductos] = useState([]);
  const [cargando, setCargando]   = useState(false);
  const [error, setError]         = useState(false);
  const [reintento, setReintento] = useState(0);

  useEffect(() => {
    if (watchlist.length === 0) {
      setProductos([]);
      return;
    }

    setCargando(true);
    setError(false);

    obtenerProductosPorIds(watchlist)
      .then(setProductos)
      .catch(() => setError(true))
      .finally(() => setCargando(false));

  }, [watchlist.length, reintento]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="miListaPage">
      <div className="container-fluid bannerSingle">
        <div className="container">
          <h1 className="mb-1">Mi lista de favoritos</h1>
          <p className="mb-0">
            {watchlist.length === 0
              ? "Guarda los relojes que te interesan"
              : `${watchlist.length} ${watchlist.length === 1 ? "reloj guardado" : "relojes guardados"}`
            }
          </p>
        </div>
      </div>

      <div className="miListaContent">
        <Container>

          {/* ── Error ── */}
          {error && (
            <div className="apiErrorCard">
              <div className="apiErrorIcon">⚠️</div>
              <div className="apiErrorBody">
                <p className="apiErrorTitle">No se pudieron cargar tus favoritos</p>
                <p className="apiErrorText">Verifica tu conexión e intenta de nuevo.</p>
                <button className="apiErrorRetry" onClick={() => setReintento(r => r + 1)}>
                  Reintentar
                </button>
              </div>
            </div>
          )}

          {/* ── Cargando ── */}
          {cargando && (
            <Row className="g-4">
              {watchlist.map(id => (
                <Col key={id} xs={12} sm={6} md={4} lg={3}>
                  <div className="skeletonCard">
                    <div className="skeletonImg" />
                    <div className="skeletonBody">
                      <div className="skeletonLine" style={{ width: "70%" }} />
                      <div className="skeletonLine" style={{ width: "50%" }} />
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          )}

          {/* ── Estado vacío ── */}
          {!cargando && !error && watchlist.length === 0 && (
            <div className="miListaEmpty">
              <div className="miListaEmptyIcon">🤍</div>
              <h2 className="miListaEmptyTitle">Todavía no tienes favoritos</h2>
              <p className="miListaEmptyText">
                Toca el corazón en cualquier reloj para guardarlo aquí.
              </p>
              <Link to="/shop" className="miListaEmptyBtn">
                Explorar relojes
              </Link>
            </div>
          )}

          {/* ── Grid de productos ── */}
          {!cargando && !error && productos.length > 0 && (
            <Row className="g-4">
              {productos.map(producto => (
                <Col key={producto.id} xs={12} sm={6} md={4} lg={3}>
                  <ProductCard producto={producto} />
                </Col>
              ))}
            </Row>
          )}

        </Container>
      </div>
    </div>
  );
}

export default MiLista;
