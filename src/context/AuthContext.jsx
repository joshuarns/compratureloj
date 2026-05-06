import { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { obtenerUsuario } from "../api";
import {
  SESSION_MS,
  REVALIDAR_CADA_MS,
  STORAGE_KEY_USUARIO,
  STORAGE_KEY_ULTIMA_VALIDACION as ULTIMA_VALIDACION_KEY,
} from "../config/constants";

// ─────────────────────────────────────────────────────────────────────────────
// AUTHCONTEXT.JSX
//
// Gestiona la sesión del usuario a lo largo de toda la app.
//
// Flujo de sesión:
//   Login  → guarda usuario + loginAt en localStorage
//   Init   → lee localStorage; si loginAt tiene más de SESSION_MS ms → logout
//   Focus  → cuando el usuario vuelve a la pestaña, revalida las credenciales
//            contra WordPress (máx. una vez cada REVALIDAR_CADA_MS ms).
//            Si WordPress devuelve 401 → logout automático + marca sesionExpirada.
//   Logout → limpia localStorage y estado
//
// Estados expuestos al resto de la app:
//   usuario              → objeto del usuario autenticado, o null
//   sesionExpirada       → true cuando la sesión terminó por expiración o 401
//   login(data)          → inicia sesión (lo llama LoginForm tras autenticar)
//   logout()             → cierra sesión manualmente
//   clearExpirada()      → limpia el flag (lo llama LoginForm al re-autenticar)
//   actualizarDatos(obj) → actualiza campos del usuario sin cerrar sesión (MiCuenta)
// ─────────────────────────────────────────────────────────────────────────────

const AuthContext = createContext(null);

export function AuthProvider({ children }) {

  // ── Estado inicial ────────────────────────────────────────────────────────
  // Usamos lazy init para leer localStorage una sola vez y validar el timestamp
  // antes de que cualquier componente se monte. Así el usuario nunca ve un
  // parpadeo de "logueado → deslogueado" durante la carga inicial.
  const [usuario, setUsuario] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY_USUARIO);
    if (!stored) return null;

    const data = JSON.parse(stored);

    // Si la sesión superó SESSION_MS ms → la descartamos al arrancar
    if (data.loginAt && Date.now() - data.loginAt > SESSION_MS) {
      localStorage.removeItem(STORAGE_KEY_USUARIO);
      return null;
    }

    return data;
  });

  // Flag que LoginForm lee para mostrar el aviso "tu sesión expiró"
  const [sesionExpirada, setSesionExpirada] = useState(false);

  // ── Login / Logout ────────────────────────────────────────────────────────

  /**
   * Guarda el usuario en estado y localStorage.
   * Siempre sobrescribe loginAt con el momento actual para que el
   * contador de SESSION_DIAS se reinicie con cada autenticación exitosa.
   */
  const login = useCallback((userData) => {
    const data = { ...userData, loginAt: Date.now() };
    localStorage.setItem(STORAGE_KEY_USUARIO, JSON.stringify(data));
    localStorage.setItem(ULTIMA_VALIDACION_KEY, String(Date.now()));
    setUsuario(data);
  }, []);

  /**
   * Cierra la sesión: limpia localStorage y resetea el estado.
   * No toca sesionExpirada para que el componente que lo activó
   * pueda seguir mostrando el mensaje hasta que el usuario lo descarte.
   */
  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY_USUARIO);
    localStorage.removeItem(ULTIMA_VALIDACION_KEY);
    setUsuario(null);
  }, []);

  /** Limpia el flag de sesión expirada (lo llama LoginForm al re-autenticar) */
  const clearExpirada = useCallback(() => setSesionExpirada(false), []);

  /**
   * Actualiza campos del usuario en estado y localStorage sin cerrar sesión.
   * Lo llama MiCuenta tras guardar cambios de perfil (nombre, email, password…).
   */
  const actualizarDatos = useCallback((nuevosDatos) => {
    setUsuario(prev => {
      if (!prev) return prev;
      const actualizado = { ...prev, ...nuevosDatos };
      localStorage.setItem(STORAGE_KEY_USUARIO, JSON.stringify(actualizado));
      return actualizado;
    });
  }, []);

  // ── Revalidación en background ────────────────────────────────────────────
  // Referencia mutable para evitar que el efecto capture un closure viejo de `usuario`
  const usuarioRef = useRef(usuario);
  useEffect(() => { usuarioRef.current = usuario; }, [usuario]);

  useEffect(() => {
    /**
     * Verifica que las credenciales del usuario siguen siendo válidas en WordPress.
     * Se activa cuando el usuario vuelve a la pestaña (visibilitychange).
     * Está throttleado a REVALIDAR_CADA_MIN para no hacer una petición en cada
     * cambio de pestaña en una sesión de trabajo normal.
     */
    const revalidar = async () => {
      const u = usuarioRef.current;

      // Sin sesión activa no hay nada que validar
      if (!u) return;

      // Throttle: si ya validamos hace menos de REVALIDAR_CADA_MIN, salimos
      const ultimaValidacion = Number(localStorage.getItem(ULTIMA_VALIDACION_KEY) || 0);
      if (Date.now() - ultimaValidacion < REVALIDAR_CADA_MS) return;

      // Comprobación de antigüedad local (no requiere red)
      if (u.loginAt && Date.now() - u.loginAt > SESSION_MS) {
        setSesionExpirada(true);
        logout();
        return;
      }

      try {
        // Verificamos que la cuenta del usuario sigue activa en WordPress
        // usando las credenciales de admin del proxy — sin necesitar la contraseña
        // del usuario en el cliente.
        await obtenerUsuario(u.id);

        // Usuario activo → renovamos el timestamp para que la sesión no caduque
        const renovado = { ...u, loginAt: Date.now() };
        localStorage.setItem(STORAGE_KEY_USUARIO, JSON.stringify(renovado));
        localStorage.setItem(ULTIMA_VALIDACION_KEY, String(Date.now()));
        setUsuario(renovado);

      } catch (err) {
        // 401/404: cuenta eliminada o desactivada en WordPress
        if (err.response?.status === 401 || err.response?.status === 404) {
          setSesionExpirada(true);
          logout();
        }
        // Errores de red o mantenimiento: no cerramos sesión
      }
    };

    // Disparamos la revalidación cada vez que el usuario vuelve a la pestaña
    const handleVisibility = () => {
      if (!document.hidden) revalidar();
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [logout]);

  // ── API pública del contexto ──────────────────────────────────────────────
  return (
    <AuthContext.Provider value={{ usuario, sesionExpirada, login, logout, clearExpirada, actualizarDatos }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook de acceso al contexto desde cualquier componente
export const useAuth = () => useContext(AuthContext);
