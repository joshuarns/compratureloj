import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useSEO } from "../hooks/useSEO";
import "./auth.css";

function ResetPassword() {
  useSEO({ titulo: "Nueva contraseña" });

  const [searchParams] = useSearchParams();
  const key   = searchParams.get("key")   || "";
  const login = searchParams.get("login") || "";

  const [password,  setPassword]  = useState("");
  const [password2, setPassword2] = useState("");
  const [estado,    setEstado]    = useState("formulario"); // formulario | enviando | exito | error
  const [errorMsg,  setErrorMsg]  = useState("");

  if (!key || !login) {
    return (
      <div className="registerPage">
        <div className="container d-flex justify-content-center">
          <div className="containerNotification text-center">
            <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
            <h2 className="globalSubTitle22" style={{ marginBottom: 12 }}>Enlace inválido</h2>
            <p style={{ fontFamily: "Mulish, sans-serif", fontSize: 14, color: "#6e6e73", marginBottom: 24 }}>
              Este enlace de recuperación no es válido o ya expiró.
              Solicita uno nuevo desde la pantalla de inicio de sesión.
            </p>
            <Link to="/recuperar-contrasena" style={btnStyle}>
              Solicitar nuevo enlace
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== password2) {
      setErrorMsg("Las contraseñas no coinciden.");
      return;
    }
    if (password.length < 8) {
      setErrorMsg("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    setErrorMsg("");
    setEstado("enviando");

    try {
      const res = await fetch("/api/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, login, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || "Error al cambiar la contraseña");
      }

      setEstado("exito");
    } catch (err) {
      setErrorMsg(err.message || "Ocurrió un error. Intenta de nuevo.");
      setEstado("formulario");
    }
  };

  if (estado === "exito") {
    return (
      <div className="registerPage">
        <div className="container d-flex justify-content-center">
          <div className="containerNotification text-center">
            <div style={{
              width: 64, height: 64, borderRadius: "50%",
              backgroundColor: "#d1e7dd", display: "flex",
              alignItems: "center", justifyContent: "center",
              fontSize: 28, margin: "0 auto 20px",
            }}>✓</div>
            <h2 style={{ fontFamily: "'Bai Jamjuree', sans-serif", fontSize: 22, fontWeight: 700, color: "#1d1d1f", marginBottom: 10 }}>
              Contraseña actualizada
            </h2>
            <p style={{ fontFamily: "Mulish, sans-serif", fontSize: 14, color: "#6e6e73", lineHeight: 1.6, marginBottom: 28 }}>
              Tu contraseña se cambió correctamente. Ya puedes iniciar sesión con tu nueva contraseña.
            </p>
            <Link to="/login" style={btnStyle}>
              Iniciar sesión
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="registerPage">
      <div className="container d-flex justify-content-center">
        <div className="containerNotification">
          <h2 className="globalSubTitle22 text-center" style={{ marginBottom: 8 }}>
            Nueva contraseña
          </h2>
          <p style={{ fontFamily: "Mulish, sans-serif", fontSize: 14, color: "#6e6e73", marginBottom: 24, textAlign: "center" }}>
            Elige una contraseña segura para tu cuenta.
          </p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Nueva contraseña</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="Mínimo 8 caracteres"
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Confirmar contraseña</label>
              <input
                type="password"
                value={password2}
                onChange={e => setPassword2(e.target.value)}
                required
                placeholder="Repite la contraseña"
                style={inputStyle}
              />
            </div>

            {errorMsg && (
              <p style={{ fontFamily: "Mulish, sans-serif", fontSize: 13, color: "#721c24", backgroundColor: "#f8d7da", border: "1px solid #f5c6cb", borderRadius: 6, padding: "10px 14px", marginBottom: 16 }}>
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={estado === "enviando"}
              style={{ ...btnStyle, width: "100%", border: "none", cursor: estado === "enviando" ? "not-allowed" : "pointer", opacity: estado === "enviando" ? 0.7 : 1 }}
            >
              {estado === "enviando" ? "Guardando..." : "Guardar contraseña"}
            </button>
          </form>

          <p style={{ fontFamily: "Mulish, sans-serif", fontSize: 14, marginTop: 20, textAlign: "center", color: "#555" }}>
            <Link to="/login" style={{ color: "#1a253c", fontWeight: 600, textDecoration: "none" }}>
              ← Volver al inicio de sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const btnStyle = {
  display: "inline-block",
  padding: "12px 28px",
  backgroundColor: "#1c2946",
  color: "#fff",
  borderRadius: 8,
  fontFamily: "'Bai Jamjuree', sans-serif",
  fontWeight: 600,
  fontSize: 15,
  textDecoration: "none",
};

const labelStyle = {
  fontFamily: "'Bai Jamjuree', sans-serif",
  fontSize: 13,
  fontWeight: 600,
  display: "block",
  marginBottom: 6,
  color: "#1d1d1f",
};

const inputStyle = {
  width: "100%",
  padding: "11px 14px",
  border: "2px solid #ccc",
  borderRadius: 8,
  fontFamily: "Mulish, sans-serif",
  fontSize: 15,
  outline: "none",
};

export default ResetPassword;
