import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { loginUsuario } from "../../api";
import { useAuth } from "../../context/AuthContext";
import './LoginForm.css';

// ─────────────────────────────────────────────────────────────────────────────
// LOGINFORM.JSX
//
// Formulario de inicio de sesión.
//
// Comportamiento especial:
//   • Si PrivateRoute redirigió aquí (state.from), tras loguearse vuelve
//     al destino original en lugar de ir siempre al dashboard.
//   • Si la sesión expiró (sesionExpirada del contexto), muestra un aviso
//     amarillo antes del formulario para explicarle al usuario por qué
//     fue deslogueado. El aviso se limpia al autenticarse de nuevo.
// ─────────────────────────────────────────────────────────────────────────────

function LoginForm() {
  const navigate  = useNavigate();
  const location  = useLocation();

  // Leemos sesionExpirada para mostrar el aviso y clearExpirada para limpiarlo
  const { login, sesionExpirada, clearExpirada } = useAuth();

  // Destino al que volver tras el login (viene de PrivateRoute vía location.state)
  const destino = location.state?.from || "/dashboard";

  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error,    setError]    = useState("");
  const [cargando, setCargando] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setCargando(true);

    // Limpiamos el aviso de sesión expirada antes de intentar el nuevo login
    clearExpirada();

    try {
      const userData = await loginUsuario(formData.username, formData.password);

      // Guardamos username y password para que AuthContext pueda revalidar
      // la sesión en background cuando el usuario vuelva a la pestaña
      // No guardamos la contraseña — la revalidación usa las credenciales
      // de admin del proxy para verificar que el usuario sigue activo.
      login({
        id:       userData.id,
        username: userData.username,
        nombre:   userData.name,
        email:    userData.email,
        roles:    userData.roles || [],
      });

      // replace:true para que el botón "atrás" no regrese al /login
      navigate(destino, { replace: true });

    } catch (error) {
      const code = error.response?.data?.code;
      if (code === 'user_not_approved') {
        setError("Tu cuenta está pendiente de aprobación. Te avisaremos por email cuando esté activa.");
      } else {
        setError("Usuario o contraseña incorrectos. Intenta de nuevo.");
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <form className="loginForm" onSubmit={handleSubmit}>

      {/* Aviso de sesión expirada — solo aparece cuando AuthContext detectó un 401
          o cuando la sesión superó SESSION_DIAS días sin actividad */}
      {sesionExpirada && (
        <div className="loginSesionExpirada">
          🔒 Tu sesión expiró. Inicia sesión de nuevo para continuar.
        </div>
      )}

      <div className="mb-3">
        <label>Usuario</label>
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          required
          placeholder="Nombre de usuario"
        />
      </div>

      <div className="mb-3">
        <label>Contraseña</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          placeholder="Tu contraseña"
        />
      </div>

      <button type="submit" className="btnLogin" disabled={cargando}>
        {cargando ? "Ingresando..." : "Iniciar sesión"}
      </button>

      {error && <p className="loginMessage error">{error}</p>}

      <p className="loginRegisterLink">
        ¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link>
      </p>
      <p className="loginForgotLink">
        <Link to="/recuperar-contrasena">¿Olvidaste tu contraseña?</Link>
      </p>
    </form>
  );
}

export default LoginForm;
