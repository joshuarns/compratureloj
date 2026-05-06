import { useState } from "react";
import emailjs from "@emailjs/browser";
import './OfertaModal.css';

// ─────────────────────────────────────────────────────────────
// OFERTAMODAL.JSX
// Modal de "Haz una oferta" para el producto único.
//
// CONFIGURACIÓN EMAILJS (una sola vez):
// 1. Crea cuenta gratis en https://www.emailjs.com
// 2. En "Email Services" → Add New Service (conecta tu Gmail o SMTP)
// 3. En "Email Templates" → Create New Template
//    Usa estas variables en el cuerpo del template:
//      {{nombre}}      → nombre del comprador
//      {{email}}       → correo del comprador
//      {{telefono}}    → teléfono del comprador
//      {{oferta}}      → precio que ofrece
//      {{producto}}    → nombre del reloj
//      {{producto_id}} → ID en WooCommerce
//      {{precio_original}} → precio publicado
//      {{url}}         → enlace directo al producto
// 4. En "Account" → copia tu Public Key
// 5. Reemplaza las tres constantes de abajo con tus datos
// ─────────────────────────────────────────────────────────────

// Constantes centralizadas en src/config/constants.js
import {
  EMAILJS_SERVICE_ID,
  EMAILJS_TEMPLATE_OFERTA  as EMAILJS_TEMPLATE_ID,
  EMAILJS_PUBLIC_KEY,
} from "../../config/constants";

// ─────────────────────────────────────────────────────────────
// OfertaModal
// Props:
//   producto → objeto completo del producto (name, id, price_html, images)
//   onClose  → función para cerrar el modal (viene del padre)
// ─────────────────────────────────────────────────────────────
function OfertaModal({ producto, onClose }) {

  // Campos del formulario
  const [form, setForm] = useState({
    nombre:   "",
    email:    "",
    telefono: "",
    oferta:   "",
  });

  // Estado del envío: "idle" | "enviando" | "exito" | "error"
  const [estado, setEstado] = useState("idle");

  // Actualiza el campo que cambió sin tocar los demás
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ── Envío del formulario ───────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setEstado("enviando");

    try {
      // emailjs.send envía el correo directamente desde el navegador
      // Los parámetros del objeto se mapean 1:1 con las variables del template
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          nombre:           form.nombre,
          email:            form.email,
          telefono:         form.telefono,
          oferta:           form.oferta
            ? `$${Number(form.oferta).toLocaleString("es-MX")}` // formatea el número
            : "No especificada",
          producto:         producto.name,
          producto_id:      producto.id,
          precio_original:  producto.price,
          url:              window.location.href, // enlace exacto al producto
        },
        EMAILJS_PUBLIC_KEY
      );

      setEstado("exito");

    } catch (err) {
      setEstado("error");
    }
  };

  // Cierra el modal al hacer clic en el overlay oscuro (fuera de la tarjeta)
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    // Overlay oscuro que cubre toda la pantalla
    <div className="modalOverlay" onClick={handleOverlayClick}>

      {/* Tarjeta del modal — animada con CSS */}
      <div className="modalBox" role="dialog" aria-modal="true">

        {/* Botón de cerrar en la esquina superior derecha */}
        <button className="modalClose" onClick={onClose} aria-label="Cerrar">✕</button>

        {/* ══════════════════════════════════════════════════
            ESTADO: ÉXITO — reemplaza el formulario
            ══════════════════════════════════════════════════ */}
        {estado === "exito" ? (
          <div className="modalSuccess">

            {/* Ícono de confirmación */}
            <div className="modalSuccessIcon">✓</div>

            <h3 className="modalSuccessTitle">¡Oferta enviada!</h3>
            <p className="modalSuccessText">
              Gracias, <strong>{form.nombre}</strong>.<br />
              Revisaremos tu oferta por <strong>{producto.name}</strong><br />
              y te contactaremos a <strong>{form.email}</strong> a la brevedad.
            </p>

            <button className="modalBtnPrimary" onClick={onClose}>
              Cerrar
            </button>

          </div>

        ) : (
          /* ══════════════════════════════════════════════════
             FORMULARIO DE OFERTA
             ══════════════════════════════════════════════════ */
          <>

            {/* ── Encabezado: foto + nombre + precio del reloj ── */}
            <div className="modalHeader">

              {/* Thumbnail del producto */}
              {producto.images?.[0]?.src && (
                <img
                  src={producto.images[0].src}
                  alt={producto.name}
                  className="modalProductThumb"
                />
              )}

              <div className="modalProductInfo">
                {/* Etiqueta sobre el título */}
                <span className="modalLabel">Haz una oferta por</span>
                {/* Nombre del reloj */}
                <h2 className="modalProductName">{producto.name}</h2>
                {/* Precio publicado — HTML de WooCommerce */}
                <p
                  className="modalProductPrice"
                  dangerouslySetInnerHTML={{ __html: producto.price_html }}
                />
              </div>

            </div>

            {/* Línea divisoria */}
            <hr className="modalDivider" />

            {/* ── Formulario ── */}
            <form onSubmit={handleSubmit} className="modalForm">

              {/* Nombre */}
              <div className="modalField">
                <label>Nombre completo</label>
                <input
                  type="text"
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  placeholder="Tu nombre"
                  required
                />
              </div>

              {/* Correo y teléfono en la misma fila */}
              <div className="modalRow">
                <div className="modalField">
                  <label>Correo electrónico</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="correo@ejemplo.com"
                    required
                  />
                </div>
                <div className="modalField">
                  <label>Teléfono</label>
                  <input
                    type="tel"
                    name="telefono"
                    value={form.telefono}
                    onChange={handleChange}
                    placeholder="+52 55 0000 0000"
                    required
                  />
                </div>
              </div>

              {/* Monto de la oferta (opcional) */}
              <div className="modalField">
                <label>
                  Tu oferta <span className="modalOptional">(opcional)</span>
                </label>
                <div className="modalInputPrefix">
                  {/* Símbolo de moneda pegado al input */}
                  <span className="modalPrefix">$</span>
                  <input
                    type="number"
                    name="oferta"
                    value={form.oferta}
                    onChange={handleChange}
                    placeholder="Ej. 120000"
                    min="0"
                  />
                </div>
              </div>

              {/* Mensaje de error si el envío falló */}
              {estado === "error" && (
                <p className="modalError">
                  ⚠ No se pudo enviar la oferta. Intenta de nuevo o contáctanos por WhatsApp.
                </p>
              )}

              {/* Botón de envío */}
              <button
                type="submit"
                className="modalBtnPrimary"
                disabled={estado === "enviando"}
              >
                {estado === "enviando" ? "Enviando..." : "Enviar oferta"}
              </button>

              {/* Nota de privacidad */}
              <p className="modalNote">
                Tu información solo se usará para contactarte sobre esta oferta.
              </p>

            </form>
          </>
        )}

      </div>
    </div>
  );
}

export default OfertaModal;
