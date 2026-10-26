import { useSEO } from "../hooks/useSEO";
import Logo from "../assets/images/logo-ctr-gold.png";
import "./Proximamente.css";

/**
 * Proximamente — página de "próximamente".
 * Mientras MODO_PROXIMAMENTE (config/constants.js) sea true, App.js la
 * renderiza en lugar de todo el sitio, sin navbar ni footer.
 */
function Proximamente() {
  useSEO({ titulo: "Próximamente" });

  return (
    <div className="proximamente">
      <div className="proximamenteInner">
        <img src={Logo} alt="Compra Tu Reloj" className="proximamenteLogo" />

        <h1 className="proximamenteTitulo">Próximamente</h1>
        <hr className="proximamenteLinea" />

        <p className="proximamenteTexto">
          Estamos preparando algo especial para ti. Muy pronto podrás
          comprar y vender relojes de lujo con total confianza en
          Compra Tu Reloj.
        </p>

        <div className="proximamenteContacto">
          <a
            href="https://wa.link/g5a0s0"
            target="_blank"
            rel="noopener noreferrer"
            className="proximamenteBtn proximamenteBtn--primario"
          >
            WhatsApp
          </a>
          <a href="mailto:info.compratureloj@gmail.com" className="proximamenteBtn">
            Escríbenos
          </a>
        </div>
      </div>
    </div>
  );
}

export default Proximamente;
