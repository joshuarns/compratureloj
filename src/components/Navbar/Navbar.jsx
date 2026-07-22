// ─────────────────────────────────────────────────────────────────────────────
// NavbarV2.jsx — Navbar rediseñado estilo Apple
//
// Diferencias respecto a la versión anterior (Navbar.jsx):
//   · Sticky + frosted glass: la barra se fija en el top al hacer scroll y
//     muestra el contenido de la página "a través" del fondo semitransparente.
//   · Sin componente Navbar de Bootstrap: control total sobre markup y estilos
//     sin sobrescribir clases de Bootstrap.
//   · Reorganización de items:
//       izquierda  → logo
//       centro     → links de navegación principal (Inicio, Shop, Vender, Contacto)
//       derecha    → íconos de utilidad (♡ lista, 🛍 carrito) + auth
//   · Hamburger animado (☰ → ✕) con animación CSS pura.
//   · Menú móvil deslizante con overlay para cerrar al tocar fuera.
//
// Para revertir al navbar anterior, cambiar en App.js:
//   import NavbarMenu from "./components/Navbar/NavbarV2"
//   →
//   import NavbarMenu from "./components/Navbar/Navbar"
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useRef, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

import { useAuth }      from "../../context/AuthContext";
import { useWatchlist } from "../../context/WatchlistContext";

import Logo from "../../assets/images/logo-ctr-gold.png";
import "./Navbar.css";

// Links de navegación principal — extraídos como constante para no duplicar
// entre el menú desktop y el menú móvil.
// hideIfAuth: true → el link no se muestra cuando el usuario ya tiene sesión
const NAV_LINKS = [
  { to: "/",             label: "Inicio" ,                    end: true },
  { to: "/shop",         label: "Comprar reloj" },
  { to: "/vender-reloj", label: "Vender reloj" },
  { to: "/register",     label: "Registrarme como vendedor",  hideIfAuth: true },
  { to: "/contacto",     label: "Contacto" },
];

// ─────────────────────────────────────────────────────────────────────────────
function NavbarV2() {
  const { usuario, logout } = useAuth();
  const { watchlist }       = useWatchlist();
  const navigate            = useNavigate();

  // Controla si el menú móvil está abierto.
  // La clase .navBar--open en el <header> activa las transiciones CSS.
  const [menuAbierto,   setMenuAbierto]   = useState(false);
  const [searchAbierto, setSearchAbierto] = useState(false);
  const [searchQuery,   setSearchQuery]   = useState("");
  const searchInputRef = useRef(null);

  const cerrarMenu = () => setMenuAbierto(false);
  const toggleMenu = () => setMenuAbierto(prev => !prev);

  const abrirSearch = () => {
    setSearchAbierto(true);
    setTimeout(() => searchInputRef.current?.focus(), 50);
  };

  const cerrarSearch = () => {
    setSearchAbierto(false);
    setSearchQuery("");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    cerrarSearch();
    cerrarMenu();
    navigate(`/shop?q=${encodeURIComponent(q)}`);
  };

  // Cerrar con Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") cerrarSearch(); };
    if (searchAbierto) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [searchAbierto]);

  const handleLogout = () => {
    logout();
    navigate("/");
    cerrarMenu();
  };

  // Función de ayuda: genera className del link según si está activo
  const linkClass = ({ isActive }) =>
    `navBar__link${isActive ? " navBar__link--active" : ""}`;

  const iconClass = ({ isActive }) =>
    `navBar__iconBtn${isActive ? " navBar__iconBtn--active" : ""}`;

  const mobileLinkClass = ({ isActive }) =>
    `navBar__mobileLink${isActive ? " navBar__mobileLink--active" : ""}`;

  return (
    // .navBar--open activa la animación del hamburger y el menú deslizante
    <header className={`navBar${menuAbierto ? " navBar--open" : ""}`}>

      {/* ── Fila principal ── */}
      <div className="navBar__inner">

        {/* Logo */}
        <Link to="/" className="navBar__logo" onClick={cerrarMenu}>
          <img src={Logo} alt="Compra Tu Reloj" />
        </Link>

        {/* Links principales — solo visible en desktop (≥ 992px) */}
        <nav className="navBar__links" aria-label="Navegación principal">
          {NAV_LINKS.filter(l => !(l.hideIfAuth && usuario)).map(({ to, label, end }) => (
            <NavLink key={to} to={to} end={end} className={linkClass}>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Buscador expandible (desktop) */}
        <div className={`navBar__search${searchAbierto ? " navBar__search--open" : ""}`}>
          {searchAbierto ? (
            <form onSubmit={handleSearch} className="navBar__searchForm">
              <input
                ref={searchInputRef}
                type="text"
                className="navBar__searchInput"
                placeholder="Buscar relojes..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                aria-label="Buscar"
              />
              <button type="submit" className="navBar__searchBtn" aria-label="Buscar">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </button>
              <button type="button" className="navBar__searchClose" onClick={cerrarSearch} aria-label="Cerrar">✕</button>
            </form>
          ) : (
            <button className="navBar__searchToggle" onClick={abrirSearch} aria-label="Buscar">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </button>
          )}
        </div>

        {/* Acciones — solo visible en desktop */}
        <div className="navBar__actions">

          {/* ♡ Mi lista con badge contador */}
          <NavLink to="/mi-lista" className={iconClass} aria-label="Mi lista de favoritos">
            ♡
            {watchlist.length > 0 && (
              <span className="navBar__badge">{watchlist.length}</span>
            )}
          </NavLink>

          {/* 🛍 Mi selección (carrito) */}
          <NavLink to="/checkout" className={iconClass} aria-label="Mi selección">
            🛍
          </NavLink>

          {usuario ? (
            // Usuario autenticado: link a dashboard + botón de salir
            <>
              <NavLink to="/dashboard" className={linkClass}>
                Mi cuenta
              </NavLink>
              <button className="navBar__logout" onClick={handleLogout}>
                Salir
              </button>
            </>
          ) : (
            // Sin sesión: CTA prominente
            <NavLink to="/login" className="navBar__cta">
              Iniciar sesión
            </NavLink>
          )}
        </div>

        {/* Botón hamburger — solo visible en móvil (< 992px) */}
        <button
          className="navBar__hamburger"
          onClick={toggleMenu}
          aria-label={menuAbierto ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={menuAbierto}
          aria-controls="navMobileMenu"
        >
          {/* 3 líneas que se animan a X con CSS cuando .navBar--open está activo */}
          <span className="navBar__hamLine" />
          <span className="navBar__hamLine" />
          <span className="navBar__hamLine" />
        </button>

      </div>

      {/* ── Menú móvil deslizante ── */}
      <nav id="navMobileMenu" className="navBar__mobile" aria-label="Menú móvil">

        {/* Buscador móvil */}
        <form onSubmit={handleSearch} className="navBar__mobileSearch">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6e6e73" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            type="text"
            placeholder="Buscar relojes..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            aria-label="Buscar"
          />
        </form>

        {/* Links principales */}
        {NAV_LINKS.filter(l => !(l.hideIfAuth && usuario)).map(({ to, label, end }) => (
          <NavLink key={to} to={to} end={end} className={mobileLinkClass} onClick={cerrarMenu}>
            {label}
          </NavLink>
        ))}

        <div className="navBar__mobileDivider" />

        {/* Utilidades */}
        <NavLink to="/mi-lista" className={mobileLinkClass} onClick={cerrarMenu}>
          ♡ Mi lista
          {watchlist.length > 0 && (
            <span className="navBar__badge">{watchlist.length}</span>
          )}
        </NavLink>

        <NavLink to="/checkout" className={mobileLinkClass} onClick={cerrarMenu}>
          🛍 Mi selección
        </NavLink>

        <div className="navBar__mobileDivider" />

        {/* Auth */}
        {usuario ? (
          <>
            <NavLink to="/dashboard" className={mobileLinkClass} onClick={cerrarMenu}>
              Mi cuenta
            </NavLink>
            <button
              className="navBar__mobileLink navBar__mobileLogout"
              onClick={handleLogout}
            >
              Cerrar sesión
            </button>
          </>
        ) : (
          <NavLink to="/login" className="navBar__mobileCta" onClick={cerrarMenu}>
            Iniciar sesión
          </NavLink>
        )}

      </nav>

      {/* Overlay oscuro: cierra el menú al tocar fuera de él */}
      {menuAbierto && (
        <div
          className="navBar__overlay"
          onClick={cerrarMenu}
          aria-hidden="true"
        />
      )}

    </header>
  );
}

export default NavbarV2;
