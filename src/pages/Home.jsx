import { Link } from "react-router-dom";
import { Container } from "react-bootstrap";
import ListaProductos from "../components/ListaProductos/ListaProductos";
import PopularModels from "../components/PopularModels/PopularModels";
import CarruselResenas from "../components/CarruselResenas/CarruselResenas";
import { useSEO } from "../hooks/useSEO";
import aboutImg from "../assets/images/f335eec8.jpg";
import "./Home.css";

function Home() {
  useSEO({
    titulo: "Relojes de lujo de segunda mano",
    descripcion: "Compra y vende relojes de lujo 100% originales en México. Rolex, Omega, Cartier, Audemars Piguet, Breitling y más.",
  });

  return (
    <div style={{ backgroundColor: "#f5f5f7" }}>

      {/* ════════════════════════════════════════════
          BANNER HERO — PROPUESTA APPLE
          ════════════════════════════════════════════ */}
      <div className="heroBanner">

        {/* Imagen de fondo — el degradado oscuro va en el ::after del CSS */}
        <div className="heroBannerBg" />

        {/* Contenido centrado: etiqueta + título + botones */}
        <div className="heroContent">

          {/* Etiqueta pequeña sobre el título — efecto glassmorphism */}
          <span className="heroEyebrow">Relojes de lujo · Compra y venta</span>

          {/* Titular principal — mantiene el copy original */}
          <h1 className="heroTitle">
            La vida se mide en logros,<br />las horas las ponemos nosotros
          </h1>

          {/* Botones: blanco sólido (comprar) y glass (vender) */}
          <div className="heroActions">
            <Link to="/shop"          className="heroBtnPrimary">Comprar</Link>
            <Link to="/vender-reloj"  className="heroBtnSecondary">Vender mi reloj</Link>
          </div>

        </div>

        {/* Flecha animada que indica que hay contenido abajo */}
        <div className="heroScroll">↓</div>

      </div>

      {/* ── Sección de marcas populares con fondo oscuro ── */}
      {/* Al hacer clic en una marca navega a /shop?categoria=<slug> */}
      <PopularModels />

      {/* ── Listado de los últimos productos disponibles ── */}
      <Container style={{ paddingTop: "100px", paddingBottom: "100px" }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="globalTitle mb-0">Modelos disponibles</h1>
          <Link to="/shop" style={{
            fontFamily: "'Bai Jamjuree', sans-serif",
            fontSize: 15,
            fontWeight: 600,
            color: "#1c2946",
            textDecoration: "none",
          }}>
            Ver todos →
          </Link>
        </div>
        {/* limit={8} → solo los primeros 8 productos, el resto en /shop */}
        <ListaProductos limit={8} />
      </Container>

      {/* ════════════════════════════════════════════
          SECCIÓN: ACERCA DE NOSOTROS
          Panel dividido: texto (navy) + foto de reloj
          ════════════════════════════════════════════ */}
      <section className="aboutSection">
        <Container>
          <div className="aboutCard">
            <div className="aboutLeft">
              <h2 className="aboutTitle">Acerca de nosotros</h2>
              <p className="aboutBody">
                Compra Tu Reloj es una marca 100% mexicana que nace de la unión
                de un grupo de entusiastas apasionados por el mundo de la relojería.
              </p>
              <p className="aboutBody">
                Creemos en la seguridad, educación y orientación al adquirir una
                pieza de lujo. Por eso, Compra Tu Reloj es una plataforma diseñada
                para facilitar la compra y venta de relojes de alta gama de manera
                confiable, amigable y eficiente.
              </p>
              <Link to="/shop" className="aboutCta">Compra ahora tu reloj</Link>
            </div>
            <div
              className="aboutRight"
              style={{ backgroundImage: `url(${aboutImg})` }}
              role="img"
              aria-label="Reloj de lujo en la muñeca"
            />
          </div>
        </Container>
      </section>

      {/* ════════════════════════════════════════════
          SECCIÓN: NUESTRO PROCESO
          4 pasos — íconos de línea + texto descriptivo
          ════════════════════════════════════════════ */}
      <section className="processSection">
        <Container>
          <h2 className="processSectionTitle">Nuestro Proceso</h2>
          <div className="processGrid">

            <div className="processCard">
              <svg className="processIcon" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="32" cy="38" r="16" />
                <circle cx="32" cy="38" r="8" />
                <line x1="32" y1="22" x2="32" y2="18" />
                <line x1="32" y1="54" x2="32" y2="58" />
                <line x1="16" y1="38" x2="12" y2="38" />
                <line x1="48" y1="38" x2="52" y2="38" />
                <path d="M26 18 Q32 12 38 18" />
                <path d="M32 10 Q38 4 44 10 Q38 16 32 10Z" fill="currentColor" stroke="none" opacity="0.3" />
                <path d="M29 8 Q32 4 35 8 Q32 13 29 8Z" fill="currentColor" stroke="none" />
              </svg>
              <p className="processText">
                <strong>1. Encuentra tu reloj ideal.</strong>
              </p>
            </div>

            <div className="processCard">
              <svg className="processIcon" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="16" y="8" width="32" height="48" rx="4" />
                <circle cx="32" cy="28" r="8" />
                <path d="M28 28 l3 3 l5-6" />
                <line x1="22" y1="46" x2="42" y2="46" />
                <line x1="22" y1="50" x2="36" y2="50" />
              </svg>
              <p className="processText">
                <strong>2. Paga de forma segura</strong> a través de una cuenta
                de depósito de garantía.
              </p>
            </div>

            <div className="processCard">
              <svg className="processIcon" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="32" cy="22" r="10" />
                <path d="M16 54 Q16 40 32 40 Q48 40 48 54" />
                <path d="M40 12 Q48 8 54 14 Q50 22 44 20" />
                <path d="M44 20 Q46 16 42 14" />
                <circle cx="50" cy="12" r="2" fill="currentColor" stroke="none" />
              </svg>
              <p className="processText">
                <strong>3. Tu reloj pasa por un proceso de revisión física</strong>{" "}
                en nuestras instalaciones como etapa final, con el objetivo de
                garantizar que tu pieza esté en perfectas condiciones y sea 100% original.
              </p>
            </div>

            <div className="processCard">
              <svg className="processIcon" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 36 Q14 30 22 34 L30 38 Q38 30 46 28 Q54 26 56 32 Q50 36 44 40 L30 48 Q22 44 8 36Z" />
                <path d="M22 34 Q22 26 30 24 Q38 22 40 30" />
                <circle cx="48" cy="16" r="8" />
                <path d="M44 16 l2.5 2.5 l5-5" />
              </svg>
              <p className="processText">
                <strong>4. Recibe tu nuevo reloj.</strong>
              </p>
            </div>

          </div>
        </Container>
      </section>

      {/* ════════════════════════════════════════════
          RESEÑAS — carrusel estilo Apple
          ════════════════════════════════════════════ */}
      <CarruselResenas />

    </div>
  );
}

export default Home;
