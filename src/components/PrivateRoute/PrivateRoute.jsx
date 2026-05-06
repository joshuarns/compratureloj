import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/**
 * PrivateRoute — guarda todas las rutas que requieren sesión activa.
 *
 * Uso en App.js:
 *   <Route element={<PrivateRoute />}>
 *     <Route path="/dashboard" element={<DashboardPage />} />
 *     <Route path="/editar-reloj/:id" element={<EditWatchPage />} />
 *   </Route>
 *
 * Si el usuario NO está autenticado:
 *   - Lo redirige a /login
 *   - Guarda en `state.from` la ruta que intentaba visitar
 *   - LoginForm lee ese state y, tras iniciar sesión, lleva al usuario
 *     de vuelta a donde intentaba ir (en vez de siempre a /dashboard)
 *
 * Si el usuario SÍ está autenticado:
 *   - Renderiza <Outlet />, que React Router reemplaza con el hijo correspondiente
 */
function PrivateRoute() {
  const { usuario } = useAuth();
  const location = useLocation();

  if (!usuario) {
    // replace:true evita que la ruta protegida quede en el historial del navegador,
    // así el botón "atrás" no lleva de vuelta a una página bloqueada
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <Outlet />;
}

export default PrivateRoute;
