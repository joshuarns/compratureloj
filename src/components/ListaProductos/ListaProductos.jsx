import { useEffect, useState } from "react";
import { obtenerProductos, obtenerProductosPorCategoria } from "../../api";
import ProductCard from '../ProductCard/ProductCard';
import './ListaProductos.css';

// ─────────────────────────────────────────────────────────
// SkeletonCard — tarjeta animada que ocupa el lugar de un
// producto mientras se espera la respuesta de la API.
// ─────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="skeletonCard">
      <div className="skeletonImg" />
      <div className="skeletonBody">
        <div className="skeletonLine" style={{ width: "60%" }} />
        <div className="skeletonLine" style={{ width: "40%" }} />
        <div className="skeletonLine" style={{ width: "80%", marginTop: 20 }} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Paginador — fila de números de página.
// Solo se renderiza cuando totalPaginas > 1.
//
// Props:
//   paginaActual  → número de página actualmente visible (1-based)
//   totalPaginas  → total de páginas disponibles
//   onChange      → callback (nuevaPagina: number) => void
// ─────────────────────────────────────────────────────────
function Paginador({ paginaActual, totalPaginas, onChange }) {
  if (totalPaginas <= 1) return null;

  return (
    <div className="paginador">
      {/* Botón anterior */}
      <button
        className="paginadorBtn"
        disabled={paginaActual === 1}
        onClick={() => onChange(paginaActual - 1)}
        aria-label="Página anterior"
      >
        ‹
      </button>

      {/* Números de página — muestra máximo 5 alrededor de la actual */}
      {Array.from({ length: totalPaginas }, (_, i) => i + 1)
        .filter(n =>
          n === 1 ||
          n === totalPaginas ||
          Math.abs(n - paginaActual) <= 2
        )
        .reduce((acc, n, idx, arr) => {
          // Inserta "…" cuando hay salto entre páginas
          if (idx > 0 && n - arr[idx - 1] > 1) acc.push("...");
          acc.push(n);
          return acc;
        }, [])
        .map((item, idx) =>
          item === "..." ? (
            <span key={`dots-${idx}`} className="paginadorDots">…</span>
          ) : (
            <button
              key={item}
              className={`paginadorBtn${paginaActual === item ? " active" : ""}`}
              onClick={() => onChange(item)}
              aria-label={`Ir a página ${item}`}
            >
              {item}
            </button>
          )
        )
      }

      {/* Botón siguiente */}
      <button
        className="paginadorBtn"
        disabled={paginaActual === totalPaginas}
        onClick={() => onChange(paginaActual + 1)}
        aria-label="Página siguiente"
      >
        ›
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// ListaProductos — componente principal.
//
// Props:
//   limit      → número máximo de productos (para el Home, sin paginación)
//   categoria  → slug de categoría WooCommerce para filtrar (opcional)
//   busqueda   → término de búsqueda que se pasa a la API (opcional)
//   paginado   → si es true, muestra controles de paginación (para el Shop)
// ─────────────────────────────────────────────────────────
const PER_PAGE = 12; // productos por página en el shop

function ListaProductos({ limit, categoria, busqueda = "", paginado = false, paginaExterna, onPaginaChange }) {
  const [productos, setProductos]       = useState([]);
  const [cargando, setCargando]         = useState(true);
  const [error, setError]               = useState(false);
  const [paginaInterna, setPaginaInterna] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);

  const [reintento, setReintento] = useState(0);

  // Si hay control externo de página (shop), usamos esa; si no, la interna
  const paginaActual = paginaExterna ?? paginaInterna;
  const setPaginaActual = onPaginaChange ?? setPaginaInterna;

  // Al cambiar la búsqueda o la categoría volvemos siempre a la página 1 (solo modo interno)
  useEffect(() => {
    if (!onPaginaChange) setPaginaInterna(1);
  }, [busqueda, categoria]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // `activo` previene actualizaciones de estado sobre un componente ya
    // desmontado. Sin esta bandera, si el usuario navega antes de que la API
    // responda, React lanza un warning y el estado de otro componente podría
    // corromperse. La función de limpieza (return) pone activo en false.
    let activo = true;
    setCargando(true);
    setError(false);

    const perPage = paginado ? PER_PAGE : (limit || PER_PAGE);

    const peticion = categoria
      ? obtenerProductosPorCategoria(categoria, paginaActual, perPage)
      : obtenerProductos(paginaActual, perPage, busqueda);

    peticion
      .then(({ productos: data, totalPaginas: tp }) => {
        if (!activo) return;
        setProductos(limit ? data.slice(0, limit) : data);
        setTotalPaginas(tp);
      })
      .catch(err => {
        if (!activo) return;
        setError(true);
      })
      .finally(() => { if (activo) setCargando(false); });

    return () => { activo = false; };
  }, [paginaActual, limit, categoria, busqueda, paginado, reintento]);

  const handlePaginaChange = (nueva) => {
    setPaginaActual(nueva);
    if (!onPaginaChange) window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Error de API ───────────────────────────────────────────
  // Se muestra en lugar del grid cuando la petición falla.
  // El botón "Reintentar" incrementa el contador que dispara el useEffect.
  if (error) {
    return (
      <div className="apiErrorCard">
        <div className="apiErrorIcon">⚠️</div>
        <div className="apiErrorBody">
          <p className="apiErrorTitle">No se pudieron cargar los relojes</p>
          <p className="apiErrorText">
            Verifica tu conexión a internet o intenta de nuevo en unos momentos.
          </p>
          <button className="apiErrorRetry" onClick={() => setReintento(r => r + 1)}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (cargando) {
    return (
      <div className="row g-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="col-12 col-sm-6 col-lg-4 col-xl-3">
            <SkeletonCard />
          </div>
        ))}
      </div>
    );
  }

  if (productos.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "60px 0", color: "#6e6e73" }}>
        <p style={{ fontSize: 40, marginBottom: 16 }}>⌚</p>
        <p style={{ fontFamily: "'Bai Jamjuree', sans-serif", fontSize: 16, fontWeight: 600 }}>
          {busqueda
            ? `No se encontraron relojes para "${busqueda}".`
            : "No hay relojes disponibles en esta categoría por ahora."}
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Contador de resultados */}
      <p className="shopCount">
        {paginado
          ? `Página ${paginaActual} de ${totalPaginas}`
          : `${productos.length} ${productos.length === 1 ? "modelo disponible" : "modelos disponibles"}`
        }
      </p>

      {/* Grid de productos */}
      <div className="row g-4 mt-1">
        {productos.map(producto => (
          <div key={producto.id} className="col-12 col-sm-6 col-lg-4 col-xl-3">
            <ProductCard producto={producto} />
          </div>
        ))}
      </div>

      {/* Controles de paginación — solo en modo shop */}
      {paginado && (
        <Paginador
          paginaActual={paginaActual}
          totalPaginas={totalPaginas}
          onChange={handlePaginaChange}
        />
      )}
    </>
  );
}

export default ListaProductos;
