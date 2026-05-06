import { useSEO } from "../hooks/useSEO";

function AvisoPrivacidad() {
  useSEO({ titulo: "Aviso de Privacidad" });

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
            Aviso de Privacidad
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

          <Section title="Identificación del Responsable">
            <p>
              La empresa <strong>COMPRA TU RELOJ MX</strong> opera un portal de ventas de relojes
              ubicado en Rio Tiber 100, Cuauhtémoc, Ciudad de México. El sitio{" "}
              <strong>compratureloj.com.mx</strong> es el responsable del uso y protección de tus
              datos personales, y al respecto te informamos lo siguiente, en cumplimiento a lo
              establecido en la Ley General de Protección de Datos Personales en Posesión de Sujetos
              Obligados.
            </p>
          </Section>

          <Section title="Titular de Datos Personales">
            <p>
              Se consideran titulares todas las personas físicas que puedan ser identificadas a través
              de información relacionada con ellas, ya sean usuarios, suscriptores o colaboradores del
              sitio.
            </p>
          </Section>

          <Section title="Datos Personales Recabados">
            <p>Para los fines señalados en este aviso, recabamos los siguientes datos personales:</p>
            <ul>
              <li>Nombre completo y fecha de nacimiento</li>
              <li>Domicilio fiscal y de entrega</li>
              <li>Número de teléfono y correo electrónico</li>
              <li>Datos de pago (tarjeta de débito o crédito)</li>
              <li>Datos fiscales para facturación</li>
              <li>Datos de acceso electrónico</li>
              <li>Información sensible que por su naturaleza requiere especial protección</li>
            </ul>
          </Section>

          <Section title="Finalidades del Tratamiento">
            <p>Tus datos personales son utilizados para las siguientes finalidades:</p>
            <ul>
              <li>Cumplir con las obligaciones derivadas de la relación contractual</li>
              <li>Gestionar el envío de mercancía y el cobro correspondiente</li>
              <li>Enviarte publicidad, promociones y prospección comercial</li>
              <li>Monitorear la calidad de nuestros servicios</li>
              <li>Emitir facturas y comprobantes fiscales cuando se soliciten</li>
            </ul>
          </Section>

          <Section title="Transferencias de Datos Personales">
            <p>
              COMPRA TU RELOJ MX podrá transferir tus datos personales a terceros mexicanos o
              extranjeros, socios comerciales o colaboradores, únicamente cuando sea necesario para
              prestar los servicios contratados o cuando así lo exija la legislación aplicable.
              En todos los casos, dichos terceros estarán obligados a mantener la confidencialidad
              de la información.
            </p>
          </Section>

          <Section title="Derechos ARCO">
            <p>
              Como titular de tus datos personales, tienes derecho a <strong>Acceder</strong>,{" "}
              <strong>Rectificar</strong>, <strong>Cancelar</strong> u <strong>Oponerte</strong> al
              tratamiento de los mismos (derechos ARCO). Para ejercer cualquiera de estos derechos,
              puedes contactarnos a través de los siguientes medios:
            </p>
            <ul>
              <li>
                <strong>Teléfono:</strong>{" "}
                <a href="tel:5545116894" style={{ color: "#1c2946" }}>55 4511 6894</a>
              </li>
              <li>
                <strong>Correo electrónico:</strong>{" "}
                <a href="mailto:info.compratureloj@gmail.com" style={{ color: "#1c2946" }}>
                  info.compratureloj@gmail.com
                </a>
              </li>
            </ul>
            <p>
              Tu solicitud será atendida en un plazo máximo de 20 días hábiles a partir de su recepción.
            </p>
          </Section>

          <Section title="Cambios al Aviso de Privacidad">
            <p>
              COMPRA TU RELOJ MX se reserva el derecho de modificar este aviso de privacidad en
              cualquier momento. Cualquier cambio será notificado a través de nuestro sitio web{" "}
              <strong>compratureloj.com.mx</strong>.
            </p>
          </Section>

        </div>
      </div>

    </div>
  );
}

// Componente auxiliar para cada sección — evita repetir el mismo HTML
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

export default AvisoPrivacidad;
