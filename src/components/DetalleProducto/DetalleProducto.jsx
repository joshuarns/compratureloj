import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";

// getMeta viene de utils — no la duplicamos aquí
import { getMeta } from "../../utils/woocommerce";

import { obtenerProducto } from "../../api";
import { useWatchlist } from "../../context/WatchlistContext";
import { useSEO } from '../../hooks/useSEO';

import ProductInfo from "./ProductInfo";
import OfertaModal from "../OfertaModal/OfertaModal";

import bigotes from '../../assets/images/bigotes.jpg';
import '../../App.css';     // Estilos globales: .apiErrorCard, .bannerSingle
import './DetalleProducto.css';

// ─────────────────────────────────────────────────────────
// DetalleProducto.jsx
// Componente de producto único (single product).
// Lee el :id de la URL, llama a la API de WooCommerce y
// muestra: galería de imágenes, info de compra y specs técnicas.
// ─────────────────────────────────────────────────────────

function DetalleProducto() {

  // useParams() lee el :id de la URL → /producto/42 → id = "42"
  const { id } = useParams();

  // Datos del producto que vienen de la API de WooCommerce
  const [producto, setProducto]         = useState(null);
  // true mientras esperamos la respuesta, false en cuanto llega (o falla)
  const [cargando, setCargando]         = useState(true);
  // true si la petición falló — muestra tarjeta de error en lugar del skeleton eterno
  const [error, setError]               = useState(false);
  // Contador para reintentar la petición sin recargar la página
  const [reintento, setReintento]       = useState(0);

  const [estaEnCarrito, setEstaEnCarrito] = useState(false);

  const { enWatchlist, toggleWatchlist } = useWatchlist();
  const guardado = producto ? enWatchlist(producto.id) : false;

  // Índice de la imagen actualmente visible en la galería.
  // Al cambiar de producto (nuevo id) se reinicia a 0.
  const [imagenActiva, setImagenActiva] = useState(0);

  // Controla si el modal de "Haz una oferta" está abierto
  const [modalOferta, setModalOferta] = useState(false);

  // Título dinámico: null mientras carga (el hook no toca el <title> hasta tener datos)
  useSEO({
    titulo: producto?.name ?? null,
    descripcion: producto
      ? `${producto.name} — disponible en Compra Tu Reloj. Reloj de lujo 100% original con garantía de autenticidad.`
      : null,
  });

  // Se ejecuta al montar, al cambiar el :id de la URL, o al pulsar "Reintentar".
  // `activo` evita setState sobre un componente desmontado: si el usuario
  // navega a otra página mientras la petición está en vuelo, la respuesta
  // llega pero los setters no se ejecutan.
  useEffect(() => {
    let activo = true;
    setCargando(true);
    setError(false);

    obtenerProducto(id)
      .then(data => {
        if (!activo) return;
        setProducto(data);
        const carritoActual = JSON.parse(localStorage.getItem("carrito")) || [];
        setEstaEnCarrito(carritoActual.some(p => p.id === data.id));
        setImagenActiva(0);
      })
      .catch(err => {
        if (!activo) return;
        setError(true);
      })
      .finally(() => { if (activo) setCargando(false); });

    return () => { activo = false; };
  }, [id, reintento]);

  // ── Error de API ────────────────────────────────────────────
  // Reemplaza al skeleton cuando la petición falla. El botón de reintentar
  // incrementa el contador que dispara el useEffect sin recargar la página.
  if (error) return (
    <div className="singlePage">
      <Container>
        <div className="apiErrorCard">
          <div className="apiErrorIcon">⚠️</div>
          <div className="apiErrorBody">
            <p className="apiErrorTitle">No se pudo cargar el producto</p>
            <p className="apiErrorText">
              Verifica tu conexión a internet o intenta de nuevo en unos momentos.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button className="apiErrorRetry" onClick={() => setReintento(r => r + 1)}>
                Reintentar
              </button>
              {/* Botón secundario: volver al catálogo */}
              <Link to="/shop" className="apiErrorRetry"
                style={{ background: "transparent", color: "#1c2946",
                         border: "1.5px solid #1c2946", textDecoration: "none" }}>
                ← Volver al shop
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );

  // ── Skeleton loader ────────────────────────────────────────
  // Mientras la API no responde, mostramos bloques animados
  // que reproducen la forma del layout real.
  // Con cargando como estado explícito, el skeleton ya no puede
  // quedarse visible para siempre si la API falla.
  // ──────────────────────────────────────────────────────────
  if (cargando || !producto) return (
    <div className="skeletonProduct">
      <Container>
        <Row className="g-5">

          {/* Placeholder de imagen */}
          <Col lg="7">
            <div className="skeletonBlock skeletonImg" />
          </Col>

          {/* Placeholders de texto */}
          <Col lg="5">
            <div className="skeletonBlock skeletonLine" style={{ width: "30%", marginBottom: 32 }} />
            <div className="skeletonBlock skeletonLine" style={{ width: "40%", marginBottom: 12 }} />
            <div className="skeletonBlock skeletonLine" style={{ width: "80%" }} />
            <div className="skeletonBlock skeletonLine" style={{ width: "60%" }} />
            <div style={{ marginTop: 20 }}>
              <div className="skeletonBlock skeletonLine" style={{ width: "100%" }} />
              <div className="skeletonBlock skeletonLine" style={{ width: "90%" }} />
            </div>
            <div className="skeletonBlock skeletonPrice" />
            <div className="skeletonBlock skeletonBtn" />
          </Col>

        </Row>
      </Container>
    </div>
  );

  // ── Función: agregar al carrito ──────────────────────────
  // Guarda el producto en localStorage y redirige al checkout
  // ─────────────────────────────────────────────────────────
  const addToCart = () => {

    const carritoActual = JSON.parse(localStorage.getItem("carrito")) || [];
    const existe = carritoActual.find(p => p.id === producto.id);

    if (!existe) {
      // Construimos el objeto con solo los datos que necesitamos en el carrito
      const productoParaGuardar = {
        id:        producto.id,
        name:      producto.name,
        precio:    parseFloat(producto.price),   // Número para hacer cálculos en checkout
        price_html: producto.price_html,          // HTML formateado por WooCommerce
        imagen:    producto.images?.[0]?.src,     // Primera imagen (?. evita error si no hay)
        cantidad:  1,
      };

      carritoActual.push(productoParaGuardar);
      localStorage.setItem("carrito", JSON.stringify(carritoActual));
      setEstaEnCarrito(true);
    }

    // Redirige al checkout, haya o no haya agregado el producto
    window.location.href = "/checkout";
  };

  // Extraemos datos de meta_data para las pills de características rápidas
  const marca     = getMeta(producto.meta_data, "marca");
  const movimiento = getMeta(producto.meta_data, "movimiento");
  const caja      = getMeta(producto.meta_data, "medida_de_la_caja_");
  const estado    = getMeta(producto.meta_data, "estado_del_reloj");

  return (
    <div className="singlePage">
      <Container>

        {/* ════════════════════════════════════════════════════
            SECCIÓN SUPERIOR: Imagen + Info de compra
            ════════════════════════════════════════════════════ */}
        <Row className="g-5">

          {/* ── Columna izquierda: galería sticky ── */}
          {/* position: sticky en el CSS hace que la galería
              acompañe al scroll hasta terminar la columna derecha */}
          <Col lg="7">
            <div className="singleImageCard">
              {/* Imagen principal — cambia según el thumbnail seleccionado */}
              <img
                src={producto.images[imagenActiva]?.src || ""}
                alt={producto.name}
                className="singleImage"
              />
            </div>

            {/* Thumbnails — solo se muestran si hay más de 1 imagen */}
            {producto.images.length > 1 && (
              <div className="singleGalleryThumbs">
                {producto.images.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setImagenActiva(i)}
                    className={`singleGalleryThumb${imagenActiva === i ? " active" : ""}`}
                    aria-label={`Ver foto ${i + 1}`}
                  >
                    <img src={img.src} alt={`${producto.name} foto ${i + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </Col>

          {/* ── Columna derecha: información y acciones ── */}
          <Col lg="5">
            <div className="singleInfo">

              {/* Enlace de regreso a la tienda */}
              <Link to="/shop" className="singleBreadcrumb">
                ← Volver al shop
              </Link>

              {/* Badge de la marca (si existe en meta_data) */}
              {marca && <span className="singleBrandBadge">{marca}</span>}

              {/* Nombre del producto */}
              <h1 className="singleTitle">{producto.name}</h1>

              {/* Precio — dangerouslySetInnerHTML porque WooCommerce envía HTML
                  con etiquetas <span>, moneda, precio original tachado, etc. */}
              <div
                className="singlePrice"
                dangerouslySetInnerHTML={{ __html: producto.price_html }}
              />

              {/* Pills con 3 características clave del reloj */}
              <div className="singleFeatures">
                {estado     && <span className="singleFeaturePill">🏷 {estado.replace(/_/g, " ")}</span>}
                {movimiento && <span className="singleFeaturePill">⚙️ {movimiento}</span>}
                {caja       && <span className="singleFeaturePill">📐 {caja} mm</span>}
              </div>

              {/* Botón primario: Comprar ahora / En tu selección ✓ / Sin existencia */}
              {producto.stock_status === 'outofstock' ? (
                <button className="singleBtnCart outOfStock" disabled>
                  Sin existencia
                </button>
              ) : (
                <button
                  onClick={addToCart}
                  className={`singleBtnCart${estaEnCarrito ? " inCart" : ""}`}
                >
                  {estaEnCarrito ? "En tu selección ✓" : "Comprar ahora"}
                </button>
              )}

              {/* Fila: "Haz una oferta" + botón de favoritos */}
              <div className="singleActionsRow">
                {!estaEnCarrito && producto.stock_status !== 'outofstock' && (
                  <button
                    onClick={() => setModalOferta(true)}
                    className="singleBtnOferta"
                  >
                    Haz una oferta
                  </button>
                )}
                <button
                  onClick={() => toggleWatchlist(producto.id)}
                  className={`singleBtnWatchlist${guardado ? " active" : ""}`}
                  aria-label={guardado ? "Quitar de favoritos" : "Guardar en favoritos"}
                >
                  {guardado ? "♥ Guardado" : "♡ Guardar"}
                </button>
              </div>

              {/* ── Tarjeta de contacto con asesor ── */}
              <div className="singleAdvisor">
                <div className="singleAdvisorTop">

                  {/* Foto del asesor */}
                  <img src={bigotes} alt="Asesor" className="singleAdvisorImg" />

                  <div className="singleAdvisorText">
                    <h4>Contactar con un asesor</h4>
                    <p>Te ayudamos a encontrar el reloj perfecto, <strong>sin coste alguno</strong>.</p>
                    {/* Indicador de disponibilidad en tiempo real */}
                    <span className="singleAdvisorOnline">Disponible ahora</span>
                  </div>

                </div>

                {/* Botón de WhatsApp */}
                <a
                  className="singleBtnWhatsApp"
                  href="https://wa.me/525579801088"
                  target="_blank"
                  rel="noreferrer"
                >
                  💬 Escribir por WhatsApp
                </a>
              </div>

            </div>
          </Col>
        </Row>

        {/* ════════════════════════════════════════════════════
            SECCIÓN MEDIA: Especificaciones técnicas
            Se renderizan como grid de tarjetas en ProductInfo
            ════════════════════════════════════════════════════ */}
        <ProductInfo producto={producto} />

        {/* ════════════════════════════════════════════════════
            SECCIÓN INFERIOR: Descripción editorial full-width
            ════════════════════════════════════════════════════ */}
        {producto.description && (
          <div className="singleDescSection">
            <div className="singleDescLeft">
              <p className="singleDescLabel">Descripción</p>
              <h2 className="singleDescHeading">{producto.name}</h2>
            </div>
            <div
              className="singleDescBody"
              dangerouslySetInnerHTML={{ __html: producto.description }}
            />
          </div>
        )}

      </Container>

      {/* ── Modal de oferta ──────────────────────────────────
          Se monta solo cuando modalOferta === true.
          onClose vuelve a poner modalOferta en false
          lo que desmonta el componente y limpia su estado.
          ────────────────────────────────────────────────── */}
      {modalOferta && (
        <OfertaModal
          producto={producto}
          onClose={() => setModalOferta(false)}
        />
      )}

    </div>
  );
}

export default DetalleProducto;
