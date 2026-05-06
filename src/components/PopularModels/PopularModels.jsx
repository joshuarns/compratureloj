import { useNavigate } from "react-router-dom";
import './PopularModels.css';

// Importamos las imágenes de cada marca desde assets
// Al importarlas así, Webpack les asigna la ruta correcta en producción
import rolexImg        from '../../assets/images/rolex.avif';
import omegaImg        from '../../assets/images/omega.avif';
import audemarsPiguetImg from '../../assets/images/audemars-piguet.avif';
import breitlingImg    from '../../assets/images/breitling.avif';

// ─────────────────────────────────────────────────────────
// Lista de marcas populares
// slug → debe coincidir exactamente con el slug de la
//        categoría en WooCommerce (admin → Productos → Categorías)
// ─────────────────────────────────────────────────────────
const MARCAS = [
  {
    nombre: "Rolex",
    modelo: "Submariner · Daytona · GMT",
    imagen: rolexImg,
    slug: "rolex",        // ← slug de la categoría en WooCommerce
  },
  {
    nombre: "Omega",
    modelo: "Speedmaster · Seamaster",
    imagen: omegaImg,
    slug: "omega",
  },
  {
    nombre: "Audemars Piguet",
    modelo: "Royal Oak · Offshore",
    imagen: audemarsPiguetImg,
    slug: "audemars-piguet",
  },
  {
    nombre: "Breitling",
    modelo: "Navitimer · Superocean",
    imagen: breitlingImg,
    slug: "breitling",
  },
];

// ─────────────────────────────────────────────────────────
// BrandCard — tarjeta individual de una marca
// Al hacer clic navega a /shop?categoria=<slug>
// ─────────────────────────────────────────────────────────
function BrandCard({ nombre, modelo, imagen, slug, onClick }) {
  return (
    <div className="brandCard" onClick={() => onClick(slug)} role="button" tabIndex={0}
      onKeyDown={e => e.key === "Enter" && onClick(slug)}>

      {/* Imagen de fondo del reloj representativo de la marca */}
      <div className="brandCardImg">
        <img src={imagen} alt={nombre} />
      </div>

      {/* Información superpuesta en la parte inferior de la tarjeta */}
      <div className="brandCardInfo">
        <span className="brandCardMarca">{nombre}</span>
        <span className="brandCardModelo">{modelo}</span>
      </div>

      {/* Flecha que aparece al hacer hover */}
      <div className="brandCardArrow">→</div>

    </div>
  );
}

// ─────────────────────────────────────────────────────────
// PopularModels — sección completa con fondo oscuro
// ─────────────────────────────────────────────────────────
function PopularModels() {
  // useNavigate nos permite ir a otra ruta sin recargar la página
  const navigate = useNavigate();

  // Al hacer clic en una tarjeta, navegamos al shop con el filtro de marca
  const handleClick = (slug) => {
    navigate(`/shop?categoria=${slug}`);
  };

  return (
    <section className="popularSection">
      <div className="container">

        {/* Encabezado de la sección */}
        <div className="popularHeader">
          <h2 className="popularTitle">Marcas más populares</h2>
          <p className="popularSubtitle">
            Selecciona una marca y encuentra los mejores modelos disponibles.
          </p>
        </div>

        {/* Grid de tarjetas — 4 columnas en desktop, 2 en tablet, 1 en móvil */}
        <div className="brandGrid">
          {MARCAS.map(marca => (
            <BrandCard
              key={marca.slug}
              nombre={marca.nombre}
              modelo={marca.modelo}
              imagen={marca.imagen}
              slug={marca.slug}
              onClick={handleClick}
            />
          ))}
        </div>

      </div>
    </section>
  );
}

export default PopularModels;
