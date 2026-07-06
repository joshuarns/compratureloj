import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";

// ── Infraestructura — se carga SIEMPRE (forma la "carcasa" visible de la app) ──
// Estos módulos deben estar disponibles desde el primer render:
// providers de contexto, navbar, footer y la guardia de rutas privadas.
import { AuthProvider }      from "./context/AuthContext";
import { WatchlistProvider } from "./context/WatchlistContext";
import { ToastProvider }     from "./context/ToastContext";
import ErrorBoundary         from "./components/ErrorBoundary/ErrorBoundary";
import NavbarMenu            from "./components/Navbar/Navbar";
import PrivateRoute          from "./components/PrivateRoute/PrivateRoute";
import Footer                from "./components/Footer/Footer";
import InstallPWA            from "./components/InstallPWA/InstallPWA";
import ScrollToTop           from "./components/ScrollToTop";
import { Container }         from "react-bootstrap";

// ── Páginas — carga diferida (lazy) ──────────────────────────────────────────
// Cada import() genera un chunk JS separado que el navegador descarga
// solo cuando el usuario navega a esa ruta por primera vez.
// En un bundle de ~130 kB esto no es crítico, pero sienta la base para
// cuando el proyecto crezca y el bundle principal empiece a afectar el LCP.
const Home                      = lazy(() => import("./pages/Home"));
const SellWatch                 = lazy(() => import("./pages/SellWatch"));
const ShopWatch                 = lazy(() => import("./pages/ShopWatch"));
const NotificationProductReview = lazy(() => import("./pages/NotificationProductReview"));
const Register                  = lazy(() => import("./pages/Register"));
const Login                     = lazy(() => import("./pages/Login"));
const AvisoPrivacidad           = lazy(() => import("./pages/AvisoPrivacidad"));
const FAQ                       = lazy(() => import("./pages/FAQ"));
const TerminosCondiciones       = lazy(() => import("./pages/TerminosCondiciones"));
const Contacto                  = lazy(() => import("./pages/Contacto"));
const NotFound                  = lazy(() => import("./pages/NotFound"));
const ForgotPassword            = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword             = lazy(() => import("./pages/ResetPassword"));
const MiLista                   = lazy(() => import("./pages/MiLista"));
const PagoExitoso               = lazy(() => import("./pages/PagoExitoso"));
const PagoCancelado             = lazy(() => import("./pages/PagoCancelado"));

// Componentes usados directamente como rutas también se cargan bajo demanda
const DetalleProducto = lazy(() => import("./components/DetalleProducto/DetalleProducto"));
const Checkout        = lazy(() => import("./components/Checkout/Checkout"));
const Dashboard       = lazy(() => import("./components/Dashboard/Dashboard"));
const EditWatch       = lazy(() => import("./components/EditWatch/EditWatch"));

// ── Fallback de Suspense ──────────────────────────────────────────────────────
// Fondo gris idéntico al de todas las páginas para evitar un flash blanco
// mientras Webpack descarga el chunk de la nueva ruta.
// No mostramos un spinner aquí porque cada página ya tiene su propio skeleton.
function PageFallback() {
  return <div style={{ minHeight: "100vh", backgroundColor: "#f5f5f7" }} />;
}

// ── App principal ─────────────────────────────────────────────────────────────
function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <WatchlistProvider>
          {/*
            ToastProvider debe envolver al Router para que useToast()
            funcione dentro de cualquier componente de la app, incluidos
            los que están dentro de rutas.
          */}
          <ToastProvider>
            <Router>
              <ScrollToTop />
              {/* Franja de bienvenida sobre el navbar */}
              <Container className="pb-3 pt-3">
                <div className="w-100 text-center textWelcome">¡Bienvenido a Compra Tu Reloj!</div>
              </Container>

              <NavbarMenu />

              {/*
                Suspense captura el estado de carga de cualquier lazy()
                que esté renderizando dentro. Mientras el chunk no llegue,
                muestra PageFallback (fondo gris sin parpadeo).
              */}
              <Container fluid className="p-0 m-0">
                <Suspense fallback={<PageFallback />}>
                  <Routes>
                    <Route path="/"                       element={<Home />} />
                    <Route path="/producto/:id"           element={<DetalleProducto />} />
                    <Route path="/checkout"               element={<Checkout />} />
                    <Route path="/vender-reloj"           element={<SellWatch />} />
                    <Route path="/shop"                   element={<ShopWatch />} />
                    <Route path="/register"               element={<Register />} />
                    <Route path="/login"                  element={<Login />} />
                    <Route path="/recuperar-contrasena"   element={<ForgotPassword />} />
                    <Route path="/nueva-contrasena"       element={<ResetPassword />} />
                    <Route path="/mi-lista"               element={<MiLista />} />
                    <Route path="/faq"                    element={<FAQ />} />
                    <Route path="/aviso-de-privacidad"    element={<AvisoPrivacidad />} />
                    <Route path="/terminos-y-condiciones" element={<TerminosCondiciones />} />
                    <Route path="/contacto"               element={<Contacto />} />
                    <Route path="/pago-exitoso"           element={<PagoExitoso />} />
                    <Route path="/pago-cancelado"         element={<PagoCancelado />} />

                    {/* ── Rutas privadas ── */}
                    <Route element={<PrivateRoute />}>
                      <Route path="/dashboard"        element={<Dashboard />} />
                      <Route path="/editar-reloj/:id" element={<EditWatch />} />
                      <Route path="/product-review"   element={<NotificationProductReview />} />
                    </Route>

                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </Container>

              <Footer />
              <InstallPWA />
            </Router>
          </ToastProvider>
        </WatchlistProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
