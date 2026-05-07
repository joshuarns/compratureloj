import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { crearPedido } from "../../api";
import { useAuth } from "../../context/AuthContext";
import PaymentConfirmation from "../PaymentConfirmation/PaymentConfirmation";
import './Checkout.css';

function Checkout() {
  const { usuario } = useAuth();
  const [carrito, setCarrito] = useState([]);
  const [pedidoEnviado, setPedidoEnviado] = useState(false);
  // Guardamos el objeto completo del pedido (no solo el ID) para mostrarlo
  // en PaymentConfirmation sin necesidad de una segunda petición a la API
  const [pedido, setPedido] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  const [datosCliente, setDatosCliente] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    address_1: "",
    city: "",
    state: "",
    postcode: "",
    country: "MX",
  });

  useEffect(() => {
    const datos = JSON.parse(localStorage.getItem("carrito")) || [];
    setCarrito(datos);
  }, []);

  const handleChange = (e) => {
    setDatosCliente({ ...datosCliente, [e.target.name]: e.target.value });
  };

  const eliminarProducto = (id) => {
    const nuevoCarrito = carrito.filter(item => item.id !== id);
    setCarrito(nuevoCarrito);
    localStorage.setItem("carrito", JSON.stringify(nuevoCarrito));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);
    setError("");

    const line_items = carrito.map(item => ({
      product_id: item.id,
      quantity: item.cantidad || 1,
    }));

    const pedidoData = {
      payment_method: "bacs",
      payment_method_title: "Transferencia bancaria",
      // set_paid: true marca el pedido como procesado y dispara los correos
      // de confirmación tanto al admin como al cliente automáticamente
      set_paid: true,
      // customer_id vincula el pedido al usuario registrado para que aparezca
      // en "Mis compras". Si no hay sesión (compra como invitado) se omite.
      ...(usuario?.id ? { customer_id: usuario.id } : {}),
      billing: { ...datosCliente },
      shipping: {
        first_name: datosCliente.first_name,
        last_name: datosCliente.last_name,
        address_1: datosCliente.address_1,
        city: datosCliente.city,
        state: datosCliente.state,
        postcode: datosCliente.postcode,
        country: datosCliente.country,
      },
      line_items,
    };

    try {
      const res = await crearPedido(pedidoData);
      setPedido(res);         // guardamos el objeto completo
      setPedidoEnviado(true);
      localStorage.removeItem("carrito");
    } catch (err) {
      setError("Ocurrió un error al procesar tu pedido. Intenta de nuevo.");
    } finally {
      setEnviando(false);
    }
  };

  if (pedidoEnviado && pedido) {
    return <PaymentConfirmation pedido={pedido} />;
  }

  const total = carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0);

  if (carrito.length === 0) {
    return (
      <div className="checkoutPage">
        <div className="container">
          <div className="emptyCart">
            <div style={{ fontSize: 48, marginBottom: 16 }}>🛒</div>
            <p>Tu carrito está vacío.</p>
            <Link to="/shop" className="btnGoShop">Ver relojes</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkoutPage">
      <div className="container">
        <h1 className="checkoutTitle">Tu pedido</h1>
        <p className="checkoutSubtitle">Completa tu información para finalizar la compra.</p>

        <div className="row g-4">

          {/* ── Columna izquierda: formulario ── */}
          <div className="col-lg-7">

            {/* Contacto */}
            <div className="checkoutCard">
              <p className="checkoutSectionTitle">Contacto</p>
              <form id="checkoutForm" className="checkoutForm" onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-6">
                    <div className="formGroup">
                      <label>Nombre</label>
                      <input type="text" name="first_name" placeholder="Tu nombre"
                        value={datosCliente.first_name} onChange={handleChange} required />
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="formGroup">
                      <label>Apellido</label>
                      <input type="text" name="last_name" placeholder="Tu apellido"
                        value={datosCliente.last_name} onChange={handleChange} required />
                    </div>
                  </div>
                </div>
                <div className="formGroup">
                  <label>Email</label>
                  <input type="email" name="email" placeholder="correo@ejemplo.com"
                    value={datosCliente.email} onChange={handleChange} required />
                </div>
                <div className="formGroup">
                  <label>Teléfono</label>
                  <input type="tel" name="phone" placeholder="+52 55 0000 0000"
                    value={datosCliente.phone} onChange={handleChange} required />
                </div>
              </form>
            </div>

            {/* Envío */}
            <div className="checkoutCard">
              <p className="checkoutSectionTitle">Dirección de envío</p>
              <form className="checkoutForm">
                <div className="formGroup">
                  <label>Calle y número</label>
                  <input type="text" name="address_1" placeholder="Av. Ejemplo 123, Col. Centro"
                    value={datosCliente.address_1} onChange={handleChange} required form="checkoutForm" />
                </div>
                <div className="row g-3">
                  <div className="col-6">
                    <div className="formGroup">
                      <label>Ciudad</label>
                      <input type="text" name="city" placeholder="Ciudad de México"
                        value={datosCliente.city} onChange={handleChange} required form="checkoutForm" />
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="formGroup">
                      <label>Código postal</label>
                      <input type="text" name="postcode" placeholder="06100"
                        value={datosCliente.postcode} onChange={handleChange} required form="checkoutForm" />
                    </div>
                  </div>
                </div>
                <div className="formGroup">
                  <label>Estado</label>
                  <select name="state" value={datosCliente.state} onChange={handleChange} required form="checkoutForm">
                    <option value="">Selecciona un estado</option>
                    <option value="AGS">Aguascalientes</option>
                    <option value="BC">Baja California</option>
                    <option value="BCS">Baja California Sur</option>
                    <option value="CAMP">Campeche</option>
                    <option value="CHIS">Chiapas</option>
                    <option value="CHIH">Chihuahua</option>
                    <option value="CDMX">Ciudad de México</option>
                    <option value="COAH">Coahuila</option>
                    <option value="COL">Colima</option>
                    <option value="DGO">Durango</option>
                    <option value="GTO">Guanajuato</option>
                    <option value="GRO">Guerrero</option>
                    <option value="HGO">Hidalgo</option>
                    <option value="JAL">Jalisco</option>
                    <option value="MEX">México</option>
                    <option value="MICH">Michoacán</option>
                    <option value="MOR">Morelos</option>
                    <option value="NAY">Nayarit</option>
                    <option value="NL">Nuevo León</option>
                    <option value="OAX">Oaxaca</option>
                    <option value="PUE">Puebla</option>
                    <option value="QRO">Querétaro</option>
                    <option value="QROO">Quintana Roo</option>
                    <option value="SLP">San Luis Potosí</option>
                    <option value="SIN">Sinaloa</option>
                    <option value="SON">Sonora</option>
                    <option value="TAB">Tabasco</option>
                    <option value="TAMPS">Tamaulipas</option>
                    <option value="TLAX">Tlaxcala</option>
                    <option value="VER">Veracruz</option>
                    <option value="YUC">Yucatán</option>
                    <option value="ZAC">Zacatecas</option>
                  </select>
                </div>
              </form>
            </div>

            {/* Método de pago */}
            <div className="checkoutCard">
              <p className="checkoutSectionTitle">Método de pago</p>
              <div className="paymentNote">
                <span>🏦</span>
                <span>
                  Aceptamos <strong>transferencia bancaria</strong>. Después de confirmar tu pedido
                  recibirás los datos para realizar el pago.
                </span>
              </div>
            </div>

            {error && (
              <div className="checkoutCard" style={{ borderLeft: "4px solid #ff3b30" }}>
                <p style={{ fontFamily: "Mulish", fontSize: 14, color: "#ff3b30", margin: 0 }}>{error}</p>
              </div>
            )}

            <button type="submit" form="checkoutForm" className="btnConfirmar" disabled={enviando}>
              {enviando ? "Procesando..." : "Confirmar pedido"}
            </button>
          </div>

          {/* ── Columna derecha: resumen ── */}
          <div className="col-lg-5">
            <div className="orderSummarySticky">
              <div className="checkoutCard">
                <p className="checkoutSectionTitle">Resumen del pedido</p>

                {carrito.map((item, index) => (
                  <div className="orderItem" key={index}>
                    {item.imagen ? (
                      <img src={item.imagen} alt={item.name} className="orderItemImage" />
                    ) : (
                      <div className="orderItemPlaceholder">⌚</div>
                    )}
                    <div className="orderItemInfo">
                      <p className="orderItemName">{item.name}</p>
                      <p className="orderItemQty">Cantidad: {item.cantidad}</p>
                    </div>
                    <p className="orderItemPrice">
                      ${(item.precio * item.cantidad).toLocaleString("es-MX")}
                    </p>
                    <button className="btnRemove" onClick={() => eliminarProducto(item.id)}
                      title="Eliminar">✕</button>
                  </div>
                ))}

                <div className="totalLine">
                  <span className="totalLabel">Total</span>
                  <span className="totalAmount">
                    ${total.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Checkout;
