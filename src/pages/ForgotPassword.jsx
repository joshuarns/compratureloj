import { useState } from "react";
import { Link } from "react-router-dom";
import { solicitarResetPassword } from "../api";
import { useSEO } from "../hooks/useSEO";
import "./auth.css";

/**
 * ForgotPassword — flujo de recuperación de contraseña en dos pasos:
 *
 *  1. "formulario"  → el usuario ingresa su email o nombre de usuario
 *  2. "enviado"     → mensaje de confirmación con instrucciones
 *
 * Usa el mismo wrapper visual que Login y Register (registerPage +
 * containerNotification) para mantener coherencia en todo el sitio.
 */
function ForgotPassword() {
  useSEO({ titulo: "Recuperar contraseña" });

  // "formulario" | "enviando" | "enviado" | "error"
  const [estado, setEstado] = useState("formulario");
  const [userLogin, setUserLogin] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEstado("enviando");

    try {
      await solicitarResetPassword(userLogin.trim());
      // Con mode:'no-cors' no podemos leer la respuesta de WordPress,
      // asumimos éxito y pedimos al usuario que revise su bandeja de entrada
      setEstado("enviado");
    } catch {
      setEstado("error");
    }
  };

  return (
    <div className="registerPage">
      <div className="container d-flex justify-content-center">
        <div className="containerNotification text-center">

          {estado === "enviado" ? (
            // ── Pantalla de éxito ──────────────────────────────────
            <>
              {/* Ícono circular verde */}
              <div style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                backgroundColor: "#d1e7dd",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 28,
                margin: "0 auto 20px",
              }}>
                ✓
              </div>

              <h2 style={{
                fontFamily: "'Bai Jamjuree', sans-serif",
                fontSize: 22,
                fontWeight: 700,
                color: "#1d1d1f",
                marginBottom: 10,
              }}>
                Revisa tu correo
              </h2>

              <p style={{
                fontFamily: "Mulish, sans-serif",
                fontSize: 14,
                color: "#6e6e73",
                lineHeight: 1.6,
                marginBottom: 28,
              }}>
                Si el correo o usuario <strong>{userLogin}</strong> está
                registrado, recibirás un enlace para restablecer tu contraseña
                en los próximos minutos. Revisa también tu carpeta de spam.
              </p>

              <Link
                to="/login"
                style={{
                  display: "inline-block",
                  padding: "12px 28px",
                  backgroundColor: "#1c2946",
                  color: "#fff",
                  borderRadius: 10,
                  fontFamily: "'Bai Jamjuree', sans-serif",
                  fontWeight: 600,
                  fontSize: 15,
                  textDecoration: "none",
                }}
              >
                Volver al login
              </Link>
            </>

          ) : (
            // ── Formulario de solicitud ────────────────────────────
            <>
              <h2 className="mb-2 globalSubTitle22">Recuperar contraseña</h2>

              <p style={{
                fontFamily: "Mulish, sans-serif",
                fontSize: 14,
                color: "#6e6e73",
                marginBottom: 24,
                lineHeight: 1.6,
              }}>
                Ingresa el correo electrónico o nombre de usuario asociado a
                tu cuenta y te enviaremos un enlace para restablecerla.
              </p>

              <form onSubmit={handleSubmit}>
                <div style={{ textAlign: "left", marginBottom: 16 }}>
                  <label style={{
                    fontFamily: "'Bai Jamjuree', sans-serif",
                    fontSize: 13,
                    fontWeight: 600,
                    display: "block",
                    marginBottom: 6,
                    color: "#1d1d1f",
                  }}>
                    Email o nombre de usuario
                  </label>
                  <input
                    type="text"
                    value={userLogin}
                    onChange={e => setUserLogin(e.target.value)}
                    required
                    placeholder="correo@ejemplo.com"
                    style={{
                      width: "100%",
                      padding: "11px 14px",
                      border: "2px solid #ccc",
                      borderRadius: 8,
                      fontFamily: "Mulish, sans-serif",
                      fontSize: 15,
                      outline: "none",
                    }}
                  />
                </div>

                {/* Mensaje de error si la petición falla */}
                {estado === "error" && (
                  <p style={{
                    fontFamily: "Mulish, sans-serif",
                    fontSize: 13,
                    color: "#721c24",
                    backgroundColor: "#f8d7da",
                    border: "1px solid #f5c6cb",
                    borderRadius: 6,
                    padding: "10px 14px",
                    marginBottom: 16,
                  }}>
                    Ocurrió un error. Intenta de nuevo más tarde.
                  </p>
                )}

                <button
                  type="submit"
                  disabled={estado === "enviando"}
                  style={{
                    width: "100%",
                    padding: "12px 0",
                    backgroundColor: "#1c2946",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    fontFamily: "'Bai Jamjuree', sans-serif",
                    fontWeight: 600,
                    fontSize: 16,
                    cursor: estado === "enviando" ? "not-allowed" : "pointer",
                    opacity: estado === "enviando" ? 0.7 : 1,
                    transition: "opacity 0.2s",
                  }}
                >
                  {estado === "enviando" ? "Enviando..." : "Enviar enlace"}
                </button>
              </form>

              {/* Enlace de vuelta al login */}
              <p style={{
                fontFamily: "Mulish, sans-serif",
                fontSize: 14,
                marginTop: 20,
                color: "#555",
              }}>
                <Link
                  to="/login"
                  style={{ color: "#1a253c", fontWeight: 600, textDecoration: "none" }}
                >
                  ← Volver al inicio de sesión
                </Link>
              </p>
            </>
          )}

        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
