import { Link } from 'react-router-dom';

// getMeta viene de utils — no la duplicamos aquí
import { getMeta } from '../../utils/woocommerce';
import { useWatchlist } from '../../context/WatchlistContext';
import './ProductCard.css';

function ProductCard({ producto }) {
  const marca = getMeta(producto.meta_data, "marca");
  const movimiento = getMeta(producto.meta_data, "movimiento");
  const imagen = producto.images?.[0]?.src;

  const { enWatchlist, toggleWatchlist } = useWatchlist();
  const guardado = enWatchlist(producto.id);

  return (
    <div className="productCard">
      {/* Imagen */}
      <div className="productCardImgWrap">
        {imagen ? (
          <img src={imagen} alt={producto.name} className="productCardImg" />
        ) : (
          <div className="productCardImgPlaceholder">⌚</div>
        )}
        {marca && <span className="productCardBadge">{marca}</span>}

        {/* Botón corazón — stopPropagation evita que el click active el Link */}
        <button
          className={`heartBtn${guardado ? " active" : ""}`}
          onClick={e => { e.preventDefault(); e.stopPropagation(); toggleWatchlist(producto.id); }}
          aria-label={guardado ? "Quitar de favoritos" : "Guardar en favoritos"}
          title={guardado ? "Quitar de favoritos" : "Guardar en favoritos"}
        >
          {guardado ? "♥" : "♡"}
        </button>
      </div>

      {/* Contenido */}
      <div className="productCardBody">
        <p className="productCardName">{producto.name}</p>
        {movimiento && (
          <p className="productCardMeta">
            {movimiento.charAt(0).toUpperCase() + movimiento.slice(1)}
          </p>
        )}
        <p className="productCardPrice"
          dangerouslySetInnerHTML={{ __html: producto.price_html }}
        />
        {producto.stock_status === 'outofstock' ? (
          <span className="btnVerProducto btnVerProductoAgotado">Sin existencia</span>
        ) : (
          <Link to={`/producto/${producto.id}`} className="btnVerProducto">
            Ver detalles
          </Link>
        )}
      </div>
    </div>
  );
}

export default ProductCard;
