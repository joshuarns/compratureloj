// ─────────────────────────────────────────────────────────
// TERMINOSCONDICIONES.JSX
// Página de Términos y Condiciones.
// Mismo sistema de diseño que AvisoPrivacidad.jsx:
// fondo #f5f5f7, tarjeta blanca centrada, secciones con
// componente Section reutilizable.
// ─────────────────────────────────────────────────────────

import { useSEO } from "../hooks/useSEO";

function TerminosCondiciones() {
  useSEO({ titulo: "Términos y Condiciones" });

  return (
    <div style={{ backgroundColor: "#f5f5f7", minHeight: "100vh", paddingBottom: 100 }}>

      {/* ── Encabezado ── */}
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
            Términos y Condiciones
          </h1>
          <p style={{
            fontFamily: "Mulish, sans-serif",
            fontSize: 15,
            color: "#6e6e73",
            margin: 0,
          }}>
            Última actualización: 13 de diciembre de 2022
          </p>
        </div>
      </div>

      {/* ── Contenido ── */}
      <div className="container">
        <div style={{
          backgroundColor: "#fff",
          borderRadius: 18,
          padding: "48px 56px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          maxWidth: 820,
        }}>

          <Section title="Introducción">
            <p>
              <strong>COMPRATURELOJ MX</strong> opera una aplicación móvil y sitio web
              ubicado en <strong>www.compratureloj.com.mx</strong>, dedicado a la compra y
              venta de relojes de lujo de segunda mano 100% originales de marcas como Rolex,
              Cartier y Omega, entre otras. Al acceder o usar nuestra plataforma, aceptas
              quedar vinculado por estos Términos y Condiciones.
            </p>
          </Section>

          <Section title="Elegibilidad y Edad Mínima">
            <p>
              Para utilizar los servicios de COMPRATURELOJ MX debes ser mayor de 18 años y
              tener plena capacidad legal para celebrar contratos vinculantes conforme a la
              legislación mexicana aplicable. Al registrarte, declaras y garantizas que
              cumples con estos requisitos.
            </p>
          </Section>

          <Section title="Responsabilidad de la Cuenta">
            <p>
              El usuario es el único responsable de mantener la confidencialidad de su
              contraseña y de todas las actividades realizadas bajo su cuenta. COMPRATURELOJ MX
              no será responsable por cualquier pérdida o daño derivado del incumplimiento de
              esta obligación. Notifícanos de inmediato si sospechas de un acceso no autorizado
              a tu cuenta.
            </p>
          </Section>

          <Section title="Usos Prohibidos">
            <p>Queda expresamente prohibido utilizar la plataforma para:</p>
            <ul>
              <li>Realizar actividades ilegales o que infrinjan derechos de terceros.</li>
              <li>Vulnerar derechos de propiedad intelectual o industrial.</li>
              <li>Hostigar, abusar, insultar, dañar o discriminar a otros usuarios.</li>
              <li>Enviar o transmitir malware, virus o cualquier código dañino.</li>
              <li>Enviar comunicaciones no solicitadas (spam) o publicidad engañosa.</li>
              <li>Suplantar la identidad de terceros o de la propia empresa.</li>
            </ul>
          </Section>

          <Section title="Política de Devoluciones">
            <p>
              La mercancía adquirida mediante descuento en la tienda en línea no tiene derecho
              a cambios ni devoluciones. Para productos adquiridos a precio regular, consulta
              directamente con nuestro equipo de atención al cliente.
            </p>
          </Section>

          <Section title="Tiempos de Envío">
            <p>
              COMPRATURELOJ MX cuenta con un plazo de <strong>10 días hábiles</strong> para
              entregar el producto a la empresa de paquetería una vez confirmado el pago. Los
              tiempos de entrega al destino final dependerán de la empresa de paquetería
              seleccionada y la ubicación del comprador.
            </p>
          </Section>

          <Section title="Reclamaciones por Entrega">
            <p>
              El cliente dispone de un plazo máximo de <strong>20 minutos</strong> después de
              recibir el producto para presentar cualquier reclamación relacionada con el estado
              del mismo. Transcurrido este plazo, se entenderá que el cliente acepta el producto
              como completamente satisfactorio.
            </p>
          </Section>

          <Section title="Seguros de Envío">
            <p>
              Los costos de seguro de envío y los deducibles correspondientes correrán a cargo
              del comprador. Te recomendamos contratar el seguro adecuado para proteger tu
              adquisición durante el trayecto.
            </p>
          </Section>

          <Section title="Limitación de Responsabilidad">
            <p>
              COMPRATURELOJ MX no garantiza que los productos recibidos sean exactamente
              iguales a como se visualizan en el sitio web, dado que las pantallas y
              dispositivos pueden variar en la representación de colores y texturas.
            </p>
            <p>
              En ningún caso COMPRATURELOJ MX será responsable por daños directos, indirectos,
              incidentales, especiales o consecuentes derivados del uso o la imposibilidad de
              uso de la plataforma o de los productos adquiridos.
            </p>
          </Section>

          <Section title="Disponibilidad de Productos">
            <p>
              Los productos se ofrecen mientras haya existencias disponibles. En caso de que
              varios clientes adquieran el mismo producto de manera simultánea y no sea posible
              satisfacer todos los pedidos, COMPRATURELOJ MX podrá cancelar los pedidos
              excedentes y emitir un reembolso o un vale electrónico con vigencia de 6 meses.
            </p>
          </Section>

          <Section title="Modificaciones a los Términos">
            <p>
              COMPRATURELOJ MX se reserva el derecho de modificar estos Términos y Condiciones
              en cualquier momento. Las modificaciones entrarán en vigor en el momento de su
              publicación en el sitio web. El uso continuado de la plataforma después de
              cualquier cambio constituye la aceptación de los nuevos términos.
            </p>
          </Section>

          <Section title="Contacto">
            <p>Si tienes dudas sobre estos Términos y Condiciones, contáctanos:</p>
            <ul>
              <li>
                <strong>Correo:</strong>{" "}
                <a href="mailto:info.compratureloj@gmail.com" style={{ color: "#1c2946" }}>
                  info.compratureloj@gmail.com
                </a>
              </li>
              <li>
                <strong>Teléfono:</strong>{" "}
                <a href="tel:5545116894" style={{ color: "#1c2946" }}>55 4511 6894</a>
              </li>
              <li><strong>Dirección:</strong> Rio Tiber 100, Cuauhtémoc, Ciudad de México</li>
            </ul>
          </Section>

        </div>
      </div>

    </div>
  );
}

// Componente auxiliar — igual que en AvisoPrivacidad.jsx
// Evita repetir el mismo HTML para cada sección
function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 40 }}>
      <h2 style={{
        fontFamily: "'Bai Jamjuree', sans-serif",
        fontSize: 20,
        fontWeight: 700,
        color: "#1d1d1f",
        borderBottom: "2px solid #f0f0f0",
        paddingBottom: 10,
        marginBottom: 16,
      }}>
        {title}
      </h2>
      <div style={{
        fontFamily: "Mulish, sans-serif",
        fontSize: 15,
        color: "#444",
        lineHeight: 1.8,
      }}>
        {children}
      </div>
    </div>
  );
}

export default TerminosCondiciones;
