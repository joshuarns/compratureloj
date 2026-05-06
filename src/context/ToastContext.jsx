// ─────────────────────────────────────────────────────────────────────────────
// ToastContext.jsx
//
// Sistema de notificaciones global basado en contexto.
//
// Problema que resuelve:
//   Sin un sistema centralizado, cada componente gestiona sus propios estados
//   de éxito/error (exitoDatos, exitoPass, errorGuardado…) y renderiza su
//   propio bloque de feedback inline. Esto genera duplicación de lógica y
//   de markup. ToastContext centraliza esa responsabilidad: el componente
//   solo llama a showToast() y se olvida.
//
// Cuándo usar toast vs. mensaje inline:
//   ✅ Toast → confirmaciones transitorias de éxito ("Datos guardados")
//              o errores de API que no requieren que el usuario edite campos
//   ❌ Toast → errores de validación de formulario (deben quedarse pegados
//              al campo problemático para guiar la corrección)
//
// API pública:
//   const { showToast } = useToast();
//   showToast("Mensaje",  "exito" | "error" | "info",  duracionMs?);
//
// Integración:
//   Envuelve <App> (o el contenido del Router) con <ToastProvider>.
//   Los toasts se renderizan en un portal al final del body automáticamente.
// ─────────────────────────────────────────────────────────────────────────────

import { createContext, useContext, useState, useCallback } from "react";
import "./Toast.css";

const ToastContext = createContext(null);

// Contador global para IDs únicos sin depender de índices de array
let _nextId = 0;

// ── ToastContainer ────────────────────────────────────────────────────────────
// Sub-componente privado; se renderiza dentro del Provider para acceder
// directamente al estado de toasts sin un segundo contexto.
function ToastContainer({ toasts, onClose }) {
  if (toasts.length === 0) return null;

  return (
    <div className="toastContainer" role="region" aria-label="Notificaciones">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast--${t.tipo}`} role="alert">
          <span className="toastMensaje">{t.mensaje}</span>
          <button
            className="toastClose"
            onClick={() => onClose(t.id)}
            aria-label="Cerrar notificación"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}

// ── ToastProvider ─────────────────────────────────────────────────────────────
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  // showToast es estable (useCallback sin deps mutables) para que los
  // componentes que lo reciben como prop no se re-rendericen innecesariamente.
  const showToast = useCallback((mensaje, tipo = "info", duracion = 4000) => {
    const id = ++_nextId;
    setToasts(prev => [...prev, { id, mensaje, tipo }]);

    // Auto-dismiss pasada la duración indicada
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duracion);
  }, []);

  const cerrarToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* ToastContainer vive aquí para renderizarse sobre todo el layout */}
      <ToastContainer toasts={toasts} onClose={cerrarToast} />
    </ToastContext.Provider>
  );
}

// ── useToast ──────────────────────────────────────────────────────────────────
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast debe usarse dentro de <ToastProvider>");
  return ctx;
}
