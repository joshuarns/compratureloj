import { Link } from "react-router-dom";
import '../Checkout/Checkout.css';

/**
 * PaymentConfirmation — pantalla de éxito post-checkout.
 *
 * Recibe el objeto `pedido` completo (respuesta de WooCommerce) en vez de solo
 * el ID, para poder mostrar los artículos comprados, el total y la dirección
 * sin hacer una petición adicional.
 *
 * Props:
 *   pedido  → objeto de orden WooCommerce (crearPedido ya lo devuelve completo)
 */
function PaymentConfirmation({ pedido }) {
  const { id, billing, line_items = [], total } = pedido;

  const formatPeso = (value) =>
    `$${Number(value).toLocaleString("es-MX", { minimumFractionDigits: 2 })}`;

  return (
    <div className="confirmationPage">
      <div className="confirmationCard" style={{ maxWidth: 600 }}>

        {/* ── Ícono de éxito ── */}
        <div className="confirmationIcon">✓</div>

        <h2 className="confirmationTitle">¡Pedido recibido!</h2>
        <p className="confirmationSubtitle">
          Tu pedido <strong>#{id}</strong> fue registrado correctamente.
          Realiza la transferencia para completar tu compra.
        </p>

        {/* ── Artículos comprados ── */}
        <div className="bankDetailsCard" style={{ marginBottom: 16 }}>
          <p className="bankDetailsTitle">Artículos</p>

          {line_items.map((item) => (
            <div key={item.id} className="orderItem" style={{ paddingLeft: 0, paddingRight: 0 }}>
              {/* WooCommerce incluye la imagen del producto en line_items */}
              {item.image?.src ? (
                <img src={item.image.src} alt={item.name} className="orderItemImage" />
              ) : (
                <div className="orderItemPlaceholder">⌚</div>
              )}
              <div className="orderItemInfo">
                <p className="orderItemName">{item.name}</p>
                <p className="orderItemQty">Cantidad: {item.quantity}</p>
              </div>
              <p className="orderItemPrice">{formatPeso(item.subtotal)}</p>
            </div>
          ))}

          {/* Total del pedido */}
          <div className="totalLine" style={{ borderTop: "1px solid #e8e8ed", marginTop: 8 }}>
            <span className="totalLabel">Total</span>
            <span className="totalAmount">{formatPeso(total)}</span>
          </div>
        </div>

        {/* ── Dirección de envío ── */}
        {billing?.address_1 && (
          <div className="bankDetailsCard" style={{ marginBottom: 16, textAlign: "left" }}>
            <p className="bankDetailsTitle">Dirección de envío</p>
            <p style={{ fontFamily: "Mulish", fontSize: 14, color: "#444", margin: 0, lineHeight: 1.6 }}>
              {billing.first_name} {billing.last_name}<br />
              {billing.address_1}<br />
              {billing.city}, {billing.state} {billing.postcode}<br />
              México
            </p>
          </div>
        )}

        {/* ── Datos bancarios para transferencia ── */}
        <div className="bankDetailsCard">
          <p className="bankDetailsTitle">Datos para transferencia</p>
          <div className="bankRow">
            <span className="bankRowLabel">Banco</span>
            <span className="bankRowValue">BBVA</span>
          </div>
          <div className="bankRow">
            <span className="bankRowLabel">Titular</span>
            <span className="bankRowValue">Compra Tu Reloj MX</span>
          </div>
          <div className="bankRow">
            <span className="bankRowLabel">Cuenta</span>
            <span className="bankRowValue">1234567890</span>
          </div>
          <div className="bankRow">
            <span className="bankRowLabel">CLABE</span>
            <span className="bankRowValue">012345678901234567</span>
          </div>
          <div className="bankRow">
            <span className="bankRowLabel">Referencia</span>
            {/* La referencia con el número de pedido agiliza la conciliación del pago */}
            <span className="bankRowValue">Pedido #{id}</span>
          </div>
        </div>

        <p style={{ fontFamily: "Mulish", fontSize: 13, color: "#6e6e73", margin: "20px 0 28px" }}>
          ¿Tienes dudas? Escríbenos a{" "}
          <a href="mailto:info.compratureloj@gmail.com" style={{ color: "#1c2946" }}>
            info.compratureloj@gmail.com
          </a>
        </p>

        <Link to="/" className="btnBackHome">Volver al inicio</Link>

      </div>
    </div>
  );
}

export default PaymentConfirmation;
