import { useState } from "react";
import { useSEO } from "../hooks/useSEO";

// ─────────────────────────────────────────────────────────
// CONTACTO.JSX
// Página de contacto con formulario y datos de la empresa.
// El formulario muestra un mensaje de éxito al enviarse.
// Diseño consistente con el resto de la app (fondo #f5f5f7,
// tarjetas blancas, tipografía Bai Jamjuree / Mulish).
// ─────────────────────────────────────────────────────────

function Contacto() {
  useSEO({
    titulo: "Contacto",
    descripcion: "Ponte en contacto con el equipo de Compra Tu Reloj. Atención personalizada 24/7 por teléfono, email o WhatsApp.",
  });

  // Estado del formulario — cada campo empieza vacío
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    telefono: "",
    mensaje: "",
  });

  // Estado que controla si ya se envió el formulario
  // true → mostramos la pantalla de éxito en lugar del formulario
  const [enviado, setEnviado] = useState(false);

  // Estado para el botón mientras está "enviando"
  const [enviando, setEnviando] = useState(false);

  // handleChange actualiza el campo correspondiente en el estado
  // e.target.name → identifica el campo por su atributo name
  // e.target.value → el texto que escribió el usuario
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // handleSubmit se ejecuta al hacer clic en "Enviar mensaje"
  const handleSubmit = (e) => {
    e.preventDefault(); // Evita que el navegador recargue la página
    setEnviando(true);

    // Simulamos un pequeño delay para dar sensación de envío real
    // En producción aquí iría la llamada a la API o servicio de email
    setTimeout(() => {
      setEnviando(false);
      setEnviado(true); // Cambiamos a la pantalla de confirmación
    }, 1000);
  };

  return (
    <div style={{ backgroundColor: "#f5f5f7", minHeight: "100vh", paddingBottom: 100 }}>

      {/* ── Encabezado de página ── */}
      <div style={{
        backgroundColor: "#fff",
        borderBottom: "1px solid #e8e8ed",
        padding: "56px 0 40px",
        marginBottom: 48,
      }}>
        <div className="container">
          <h1 style={{
            fontFamily: "'Bai Jamjuree', sans-serif",
            fontSize: 38,
            fontWeight: 700,
            color: "#1d1d1f",
            marginBottom: 8,
          }}>
            Contacto
          </h1>
          <p style={{
            fontFamily: "Mulish, sans-serif",
            fontSize: 16,
            color: "#6e6e73",
            margin: 0,
          }}>
            Estamos para ayudarte. Escríbenos o visítanos.
          </p>
        </div>
      </div>

      <div className="container">
        <div className="row g-4">

          {/* ── Columna izquierda: formulario ── */}
          <div className="col-lg-7">
            <div style={{
              backgroundColor: "#fff",
              borderRadius: 18,
              padding: "36px 32px",
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            }}>

              {enviado ? (
                // ── Pantalla de éxito — reemplaza al formulario tras el envío ──
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <div style={{
                    width: 64,
                    height: 64,
                    backgroundColor: "#d1e7dd",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 28,
                    margin: "0 auto 24px",
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
                    ¡Mensaje enviado!
                  </h2>
                  <p style={{
                    fontFamily: "Mulish, sans-serif",
                    fontSize: 15,
                    color: "#6e6e73",
                    marginBottom: 28,
                  }}>
                    Gracias por contactarnos, {form.nombre}.<br />
                    Te responderemos a <strong>{form.email}</strong> a la brevedad.
                  </p>
                  {/* Botón para enviar otro mensaje */}
                  <button
                    onClick={() => { setEnviado(false); setForm({ nombre: "", email: "", telefono: "", mensaje: "" }); }}
                    style={{
                      background: "none",
                      border: "none",
                      fontFamily: "'Bai Jamjuree', sans-serif",
                      fontSize: 14,
                      color: "#1c2946",
                      fontWeight: 600,
                      cursor: "pointer",
                      textDecoration: "underline",
                    }}
                  >
                    Enviar otro mensaje
                  </button>
                </div>

              ) : (
                // ── Formulario de contacto ──
                <>
                  <p style={{
                    fontFamily: "'Bai Jamjuree', sans-serif",
                    fontSize: 13,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "#6e6e73",
                    marginBottom: 24,
                  }}>
                    Envíanos un mensaje
                  </p>

                  <form onSubmit={handleSubmit}>

                    {/* Nombre y email en la misma fila */}
                    <div className="row g-3 mb-3">
                      <div className="col-6">
                        <FormField
                          label="Nombre"
                          name="nombre"
                          type="text"
                          placeholder="Tu nombre"
                          value={form.nombre}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="col-6">
                        <FormField
                          label="Email"
                          name="email"
                          type="email"
                          placeholder="correo@ejemplo.com"
                          value={form.email}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="mb-3">
                      <FormField
                        label="Teléfono"
                        name="telefono"
                        type="tel"
                        placeholder="+52 55 0000 0000"
                        value={form.telefono}
                        onChange={handleChange}
                      />
                    </div>

                    {/* Textarea para el mensaje */}
                    <div className="mb-4">
                      <label style={labelStyle}>Mensaje</label>
                      <textarea
                        name="mensaje"
                        value={form.mensaje}
                        onChange={handleChange}
                        required
                        placeholder="¿En qué podemos ayudarte?"
                        rows={5}
                        style={{ ...inputStyle, resize: "vertical" }}
                      />
                    </div>

                    {/* Botón de envío */}
                    <button type="submit" disabled={enviando} style={{
                      width: "100%",
                      padding: "14px",
                      backgroundColor: enviando ? "#b0b0b5" : "#1c2946",
                      color: "#fff",
                      border: "none",
                      borderRadius: 12,
                      fontFamily: "'Bai Jamjuree', sans-serif",
                      fontSize: 15,
                      fontWeight: 600,
                      cursor: enviando ? "not-allowed" : "pointer",
                      transition: "background-color 0.25s",
                    }}>
                      {enviando ? "Enviando..." : "Enviar mensaje"}
                    </button>

                  </form>
                </>
              )}

            </div>
          </div>

          {/* ── Columna derecha: información de contacto ── */}
          <div className="col-lg-5">
            <div className="d-flex flex-column gap-3">

              <InfoCard
                emoji="📍"
                titulo="Dirección"
                contenido="Duraznos 65 local 407-A"
              />

              <InfoCard
                emoji="📞"
                titulo="Teléfono"
                contenido={
                  <a href="tel:5545116894" style={{ color: "#1c2946", textDecoration: "none", fontWeight: 600 }}>
                    55 4511 6894
                  </a>
                }
              />

              <InfoCard
                emoji="✉️"
                titulo="Email"
                contenido={
                  <a href="mailto:info.compratureloj@gmail.com" style={{ color: "#1c2946", textDecoration: "none", fontWeight: 600 }}>
                    info.compratureloj@gmail.com
                  </a>
                }
              />

              <InfoCard
                emoji="💬"
                titulo="WhatsApp"
                contenido={
                  <a
                    href="https://api.whatsapp.com/send/?phone=525545116894"
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: "#1c2946", textDecoration: "none", fontWeight: 600 }}
                  >
                    Escribir por WhatsApp →
                  </a>
                }
              />

              {/* Nota de tiempo de respuesta */}
              <div style={{
                backgroundColor: "#fff",
                borderRadius: 14,
                padding: "18px 20px",
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                display: "flex",
                gap: 12,
                alignItems: "flex-start",
              }}>
                <span style={{ fontSize: 20 }}>⏱</span>
                <p style={{
                  fontFamily: "Mulish, sans-serif",
                  fontSize: 13,
                  color: "#6e6e73",
                  margin: 0,
                  lineHeight: 1.6,
                }}>
                  Respondemos en menos de <strong style={{ color: "#1d1d1f" }}>24 horas</strong> en días hábiles.
                </p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}


// ─────────────────────────────────────────────────────────
// COMPONENTES AUXILIARES
// Estos componentes pequeños evitan repetir el mismo JSX
// varias veces dentro de la página principal.
// ─────────────────────────────────────────────────────────

// FormField — campo de formulario reutilizable (label + input)
// Recibe todas las propiedades del input como props
function FormField({ label, name, type, placeholder, value, onChange, required }) {
  return (
    <>
      <label style={labelStyle}>{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        style={inputStyle}
      />
    </>
  );
}

// InfoCard — tarjeta de dato de contacto (ícono + título + contenido)
function InfoCard({ emoji, titulo, contenido }) {
  return (
    <div style={{
      backgroundColor: "#fff",
      borderRadius: 14,
      padding: "20px 22px",
      boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
      display: "flex",
      alignItems: "flex-start",
      gap: 16,
    }}>
      {/* Círculo con el ícono */}
      <div style={{
        width: 44,
        height: 44,
        backgroundColor: "#f5f5f7",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 20,
        flexShrink: 0,
      }}>
        {emoji}
      </div>
      <div>
        <p style={{
          fontFamily: "'Bai Jamjuree', sans-serif",
          fontSize: 12,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          color: "#6e6e73",
          margin: "0 0 4px",
        }}>
          {titulo}
        </p>
        <div style={{
          fontFamily: "Mulish, sans-serif",
          fontSize: 15,
          color: "#1d1d1f",
        }}>
          {contenido}
        </div>
      </div>
    </div>
  );
}

// ── Estilos reutilizables como objetos JS ────────────────
// En React los estilos inline se escriben como objetos
// con propiedades en camelCase (fontSize en lugar de font-size)

const labelStyle = {
  fontFamily: "'Bai Jamjuree', sans-serif",
  fontSize: 13,
  fontWeight: 600,
  color: "#1d1d1f",
  display: "block",
  marginBottom: 6,
};

const inputStyle = {
  width: "100%",
  padding: "12px 16px",
  border: "1.5px solid #e0e0e0",
  borderRadius: 10,
  fontFamily: "Mulish, sans-serif",
  fontSize: 15,
  color: "#1d1d1f",
  outline: "none",
  boxSizing: "border-box",
  backgroundColor: "#fff",
};

export default Contacto;
