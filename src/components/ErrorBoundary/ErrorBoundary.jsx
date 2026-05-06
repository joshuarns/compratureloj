import { Component } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// ErrorBoundary
//
// Captura errores de JavaScript en el árbol de componentes hijos y muestra
// una pantalla de error controlada en lugar de dejar la app en blanco.
//
// React solo soporta error boundaries como class components (limitación del API).
//
// Uso en App.js:
//   <ErrorBoundary>
//     <Router>...</Router>
//   </ErrorBoundary>
// ─────────────────────────────────────────────────────────────────────────────

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { tieneError: false, error: null };
  }

  // Se llama cuando un componente hijo lanza durante el render o un lifecycle.
  // Actualiza el estado para que el siguiente render muestre la pantalla de error.
  static getDerivedStateFromError(error) {
    return { tieneError: true, error };
  }

  // Se llama después de que el error fue capturado.
  // Ideal para enviar el error a un servicio de monitoreo (Sentry, etc.).
  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (!this.state.tieneError) return this.props.children;

    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        padding: "40px 24px",
        background: "#f5f5f7",
        textAlign: "center",
      }}>
        <div style={{ fontSize: 52, marginBottom: 24 }}>⚠️</div>
        <h1 style={{
          fontFamily: "'Bai Jamjuree', sans-serif",
          fontSize: 26,
          fontWeight: 700,
          color: "#1d1d1f",
          marginBottom: 12,
        }}>
          Algo salió mal
        </h1>
        <p style={{
          fontFamily: "'Mulish', sans-serif",
          fontSize: 15,
          color: "#6e6e73",
          maxWidth: 420,
          marginBottom: 32,
          lineHeight: 1.6,
        }}>
          Ocurrió un error inesperado. Intenta recargar la página. Si el problema
          persiste, contáctanos.
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: "12px 28px",
            background: "#1c2946",
            color: "#fff",
            border: "none",
            borderRadius: 10,
            fontFamily: "'Bai Jamjuree', sans-serif",
            fontSize: 15,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Recargar página
        </button>
      </div>
    );
  }
}

export default ErrorBoundary;
