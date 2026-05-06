import { Link } from "react-router-dom";
import { useSEO } from "../hooks/useSEO";

/**
 * NotFound — página 404.
 * Se renderiza cuando ninguna otra ruta coincide (catch-all "*" en App.js).
 * Sigue el mismo sistema de diseño Apple que el resto del sitio.
 */
function NotFound() {
  useSEO({ titulo: "Página no encontrada" });

  return (
    <div style={{
      backgroundColor: "#f5f5f7",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "100px 16px",
    }}>
      <div style={{ textAlign: "center", maxWidth: 480 }}>

        {/* Número grande decorativo */}
        <p style={{
          fontFamily: "'Bai Jamjuree', sans-serif",
          fontSize: "clamp(96px, 20vw, 160px)",
          fontWeight: 700,
          color: "#e8e8ed",
          lineHeight: 1,
          margin: "0 0 8px",
          userSelect: "none",
        }}>
          404
        </p>

        <h1 style={{
          fontFamily: "'Bai Jamjuree', sans-serif",
          fontSize: "clamp(22px, 5vw, 32px)",
          fontWeight: 700,
          color: "#1d1d1f",
          marginBottom: 12,
        }}>
          Página no encontrada
        </h1>

        <p style={{
          fontFamily: "Mulish, sans-serif",
          fontSize: 16,
          color: "#6e6e73",
          lineHeight: 1.7,
          marginBottom: 40,
        }}>
          La dirección que buscas no existe o fue movida.
          Regresa al inicio para seguir explorando relojes.
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          {/* Botón principal — lleva al home */}
          <Link
            to="/"
            style={{
              display: "inline-block",
              backgroundColor: "#1c2946",
              color: "#fff",
              fontFamily: "'Bai Jamjuree', sans-serif",
              fontWeight: 700,
              fontSize: 15,
              padding: "14px 32px",
              borderRadius: 999,
              textDecoration: "none",
            }}
          >
            Ir al inicio
          </Link>

          {/* Botón secundario — lleva al catálogo */}
          <Link
            to="/shop"
            style={{
              display: "inline-block",
              backgroundColor: "transparent",
              color: "#1c2946",
              fontFamily: "'Bai Jamjuree', sans-serif",
              fontWeight: 700,
              fontSize: 15,
              padding: "14px 32px",
              borderRadius: 999,
              textDecoration: "none",
              border: "2px solid #1c2946",
            }}
          >
            Ver relojes
          </Link>
        </div>

      </div>
    </div>
  );
}

export default NotFound;
