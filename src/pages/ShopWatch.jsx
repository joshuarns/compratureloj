import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import ListaProductos from "../components/ListaProductos/ListaProductos";
import { useSEO } from "../hooks/useSEO";
import './ShopWatch.css';

// ─────────────────────────────────────────────────────────
// ShopWatch — página de catálogo completo.
//
// Soporta:
//   • Filtro por categoría vía query string (?categoria=rolex)
//   • Búsqueda por nombre/referencia con debounce de 400 ms
//   • Paginación delegada a ListaProductos
// ─────────────────────────────────────────────────────────

// Tiempo (ms) que esperamos tras el último carácter tecleado antes de
// lanzar la búsqueda. Evita una petición por cada tecla presionada.
const DEBOUNCE_MS = 400;

function ShopWatch() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoria = searchParams.get("categoria");
  const pageParam = parseInt(searchParams.get("page") || "1", 10);
  const qParam    = searchParams.get("q") || "";

  const handlePageChange = (nueva) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (nueva === 1) next.delete("page");
      else next.set("page", String(nueva));
      return next;
    }, { replace: false });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Valor del input (se actualiza en cada tecla)
  const [inputBusqueda, setInputBusqueda] = useState(qParam);
  // Valor que se pasa a la API (solo se actualiza tras el debounce)
  const [busqueda, setBusqueda] = useState(qParam);

  // Sincronizar con el parámetro ?q= cuando cambia (ej. búsqueda desde el navbar)
  useEffect(() => {
    setInputBusqueda(qParam);
    setBusqueda(qParam);
  }, [qParam]); // eslint-disable-line react-hooks/exhaustive-deps

  const timerRef = useRef(null);

  // Aplica debounce: cancela el timer anterior y crea uno nuevo cada vez que
  // el usuario teclea. Solo cuando deja de teclear por DEBOUNCE_MS se lanza
  // la búsqueda real (que provoca una nueva petición a la API).
  const handleBusqueda = (e) => {
    const valor = e.target.value;
    setInputBusqueda(valor);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setBusqueda(valor), DEBOUNCE_MS);
  };

  // Limpia el timer al desmontar el componente para evitar memory leaks
  useEffect(() => () => clearTimeout(timerRef.current), []);

  // Al cambiar de categoría limpiamos la búsqueda y reseteamos la página
  useEffect(() => {
    setInputBusqueda("");
    setBusqueda("");
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.delete("page");
      return next;
    }, { replace: true });
  }, [categoria]); // eslint-disable-line react-hooks/exhaustive-deps

  // Título dinámico según si hay categoría activa
  const nombreCategoria = categoria
    ? categoria.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase())
    : null;

  // useSEO va después de nombreCategoria para poder usarlo en el título
  useSEO({
    titulo: nombreCategoria ? `Relojes ${nombreCategoria}` : "Catálogo de relojes",
    descripcion: nombreCategoria
      ? `Descubre los mejores relojes ${nombreCategoria} de segunda mano en México. 100% originales y garantizados.`
      : "Explora nuestra selección de relojes de lujo de segunda mano. Rolex, Omega, Cartier, AP, Breitling y más.",
  });

  return (
    <div className="shopPage">
      <div className="container">

        {/* ── Encabezado ── */}
        <div className="shopHeader">
          <h1>{nombreCategoria ? `Relojes ${nombreCategoria}` : "Nuestros relojes"}</h1>
          <p>
            {nombreCategoria
              ? `Mostrando todos los relojes de la marca ${nombreCategoria}.`
              : "Encuentra el reloj de tus sueños."}
          </p>
        </div>

        {/* ── Buscador ── */}
        <div className="shopSearchWrap">
          <div className="shopSearchBox">
            <span className="shopSearchIcon">🔍</span>
            <input
              type="text"
              className="shopSearchInput"
              placeholder="Buscar por nombre, marca o referencia..."
              value={inputBusqueda}
              onChange={handleBusqueda}
              aria-label="Buscar relojes"
            />
            {inputBusqueda && (
              <button
                className="shopSearchClear"
                onClick={() => { setInputBusqueda(""); setBusqueda(""); }}
                aria-label="Limpiar búsqueda"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* ── Grid de productos con paginación ── */}
        <ListaProductos
          categoria={categoria}
          busqueda={busqueda}
          paginado
          paginaExterna={pageParam}
          onPaginaChange={handlePageChange}
        />

      </div>
    </div>
  );
}

export default ShopWatch;
