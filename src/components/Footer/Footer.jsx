import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Logo from '../../assets/images/logo-ctr-gold.png';
import './Footer.css';

function Footer() {
  const { usuario } = useAuth(); // Para mostrar links distintos según si hay sesión o no

  return (
    <footer className="footer">
      <div className="container">
        <div className="row g-5">

          {/* ── Columna 1: Marca ── */}
          <div className="col-12 col-md-4 footerBrand">
            <img src={Logo} alt="Compra Tu Reloj" className="footerLogo" />
            <p>
              El marketplace de relojes de lujo de segunda mano más confiable de México.
            </p>
          </div>

          {/* ── Columna 2: Navegación ── */}
          <div className="col-6 col-md-2">
            <p className="footerColTitle">Explorar</p>
            <ul className="footerLinks">
              <li><Link to="/">Inicio</Link></li>
              <li><Link to="/shop">Comprar relojes</Link></li>
              <li>
                <Link to="/vender-reloj">
                  Vender reloj
                  {!usuario && <span className="footerBadge">Gratis</span>}
                </Link>
              </li>
              <li><Link to="/contacto">Contacto</Link></li>
              <li><Link to="/faq">Preguntas frecuentes</Link></li>
            </ul>
          </div>

          {/* ── Columna 3: Mi cuenta ── */}
          <div className="col-6 col-md-2">
            <p className="footerColTitle">Mi cuenta</p>
            <ul className="footerLinks">
              {usuario ? (
                <>
                  <li><Link to="/dashboard">Mi dashboard</Link></li>
                  <li><Link to="/vender-reloj">Subir reloj</Link></li>
                </>
              ) : (
                <>
                  <li><Link to="/login">Iniciar sesión</Link></li>
                  <li><Link to="/register">Registrarse</Link></li>
                </>
              )}
            </ul>
          </div>

          {/* ── Columna 4: Contacto ── */}
          <div className="col-12 col-md-4">
            <p className="footerColTitle">Contacto</p>
            <ul className="footerContact">
              <li>
                <span>📍</span>
                <span>Duraznos 65 local 407-A</span>
              </li>
              <li>
                <span>📞</span>
                <a href="tel:5545116894">55 4511 6894</a>
              </li>
              <li>
                <span>✉️</span>
                <a href="mailto:info.compratureloj@gmail.com">
                  info.compratureloj@gmail.com
                </a>
              </li>
              <li>
                <span>💬</span>
                <a
                  href="https://wa.link/6sp0dr"
                  target="_blank"
                  rel="noreferrer"
                >
                  WhatsApp
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* ── Barra inferior: copyright y legal ── */}
        <div className="footerBottom">
          <p className="footerCopy">
            © {new Date().getFullYear()} Compra Tu Reloj MX. Todos los derechos reservados.
          </p>
          <div className="footerLegal">
            <Link to="/aviso-de-privacidad">Aviso de privacidad</Link>
            <Link to="/terminos-y-condiciones">Términos y condiciones</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}

export default Footer;
