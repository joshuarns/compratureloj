import { useState } from "react";
import { useSEO } from "../hooks/useSEO";

const FAQS = [
  {
    categoria: "Compras y Seguridad",
    items: [
      {
        pregunta: "¿Cómo están protegidas mis compras y ventas?",
        respuesta:
          "Todas nuestras compras y ventas están 100% garantizadas y protegidas a través de nuestra plataforma. Cada reloj pasa por una inspección exhaustiva antes de ser listado para verificar su autenticidad y garantizar su correcta entrega.",
      },
      {
        pregunta: "¿Cómo sé que el reloj que compro es original?",
        respuesta:
          "Antes de publicar cualquier pieza, nuestro equipo de expertos realiza una revisión detallada de autenticidad. Solo comercializamos relojes 100% originales de marcas como Rolex, Cartier, Omega, Audemars Piguet, Breitling y más.",
      },
    ],
  },
  {
    categoria: "Presencia y Operación",
    items: [
      {
        pregunta: "¿En dónde opera Compra Tu Reloj?",
        respuesta:
          "Operamos en toda la República Mexicana. Además, contamos con convenios con joyerías asociadas en distintas ciudades para facilitar las transacciones de compra y venta de relojes de lujo.",
      },
    ],
  },
  {
    categoria: "Vender mi reloj",
    items: [
      {
        pregunta: "¿Qué comisión aplica si vendo mi reloj?",
        respuesta:
          "Aplicamos una comisión del 15% sobre el precio de venta final de tu reloj. El 85% restante es para ti.",
      },
      {
        pregunta: "¿Cómo puedo publicar mi reloj?",
        respuesta:
          "Regístrate en la plataforma, inicia sesión y dirígete a la sección \"Vender reloj\". Completa el formulario con los datos y fotos de tu pieza. Nuestro equipo revisará la información y publicará tu reloj una vez verificada su autenticidad.",
      },
    ],
  },
  {
    categoria: "Atención al cliente",
    items: [
      {
        pregunta: "¿Cuál es el horario de atención?",
        respuesta:
          "Ofrecemos atención y orientación personalizada las 24 horas del día, los 7 días de la semana, para resolver cualquier duda que tengas sobre nuestros productos o el proceso de compra y venta.",
      },
      {
        pregunta: "¿Cómo puedo contactarlos?",
        respuesta:
          "Puedes comunicarte con nosotros por teléfono al 55 4511 6894, por correo a info.compratureloj@gmail.com o directamente por WhatsApp. También tienes disponible el formulario de contacto en nuestro sitio.",
      },
    ],
  },
  {
    categoria: "Privacidad y Datos",
    items: [
      {
        pregunta: "¿Cómo protegen mis datos personales?",
        respuesta:
          "Todos tus datos están 100% protegidos y respaldados, cumpliendo con los más altos estándares de confidencialidad y en apego a la Ley General de Protección de Datos Personales en Posesión de Sujetos Obligados.",
      },
    ],
  },
  {
    categoria: "Envíos y Seguros",
    items: [
      {
        pregunta: "¿Qué cubre el seguro de envío?",
        respuesta:
          "Las compras aseguradas reciben reembolso total en caso de pérdida durante el trayecto. Los envíos con valor hasta $120,000 pesos se realizan con paqueterías de confianza; para valores superiores, la empresa se encarga de la entrega de forma personal.",
      },
      {
        pregunta: "¿Cuánto tiempo tarda en llegar mi reloj?",
        respuesta:
          "Contamos con un plazo de 10 días hábiles para entregar el producto a la empresa de paquetería una vez confirmado el pago. Los tiempos de entrega al destino final dependen de la paquetería seleccionada y la ubicación del comprador.",
      },
      {
        pregunta: "¿Quién paga el costo del seguro de envío?",
        respuesta:
          "Los costos del seguro de envío y los deducibles correspondientes corren a cargo del comprador. Te recomendamos contratar el seguro adecuado para proteger tu adquisición durante el trayecto.",
      },
    ],
  },
];

function FaqItem({ pregunta, respuesta }) {
  const [abierto, setAbierto] = useState(false);

  return (
    <div
      style={{
        borderBottom: "1px solid #e8e8ed",
        cursor: "pointer",
      }}
      onClick={() => setAbierto(!abierto)}
    >
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "20px 0",
        gap: 16,
      }}>
        <p style={{
          fontFamily: "'Bai Jamjuree', sans-serif",
          fontSize: 16,
          fontWeight: 600,
          color: "#1d1d1f",
          margin: 0,
          lineHeight: 1.4,
        }}>
          {pregunta}
        </p>
        <span style={{
          flexShrink: 0,
          width: 28,
          height: 28,
          borderRadius: "50%",
          backgroundColor: abierto ? "#1c2946" : "#f0f0f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "background-color 0.2s",
        }}>
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            style={{
              transform: abierto ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.25s ease",
            }}
          >
            <path
              d="M2 4L6 8L10 4"
              stroke={abierto ? "#fff" : "#1d1d1f"}
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </div>

      <div style={{
        maxHeight: abierto ? 400 : 0,
        overflow: "hidden",
        transition: "max-height 0.3s ease",
      }}>
        <p style={{
          fontFamily: "Mulish, sans-serif",
          fontSize: 15,
          color: "#444",
          lineHeight: 1.8,
          paddingBottom: 20,
          margin: 0,
        }}>
          {respuesta}
        </p>
      </div>
    </div>
  );
}

function FAQ() {
  useSEO({
    titulo: "Preguntas frecuentes",
    descripcion: "Resolvemos tus dudas sobre compra, venta, envíos, autenticidad y más en Compra Tu Reloj.",
  });

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
            Preguntas Frecuentes
          </h1>
          <p style={{
            fontFamily: "Mulish, sans-serif",
            fontSize: 15,
            color: "#6e6e73",
            margin: 0,
          }}>
            Todo lo que necesitas saber sobre Compra Tu Reloj.
          </p>
        </div>
      </div>

      {/* ── Contenido ── */}
      <div className="container">
        <div style={{ maxWidth: 820 }}>
          {FAQS.map((seccion) => (
            <div key={seccion.categoria} style={{ marginBottom: 48 }}>

              {/* Etiqueta de categoría */}
              <p style={{
                fontFamily: "'Bai Jamjuree', sans-serif",
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "#6e6e73",
                marginBottom: 4,
              }}>
                {seccion.categoria}
              </p>

              {/* Card blanca con los ítems */}
              <div style={{
                backgroundColor: "#fff",
                borderRadius: 18,
                padding: "0 28px",
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              }}>
                {seccion.items.map((item, i) => (
                  <FaqItem
                    key={i}
                    pregunta={item.pregunta}
                    respuesta={item.respuesta}
                  />
                ))}
              </div>

            </div>
          ))}

          {/* ── CTA de contacto ── */}
          <div style={{
            backgroundColor: "#1c2946",
            borderRadius: 18,
            padding: "40px 36px",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: 16,
          }}>
            <p style={{
              fontFamily: "'Bai Jamjuree', sans-serif",
              fontSize: 20,
              fontWeight: 700,
              color: "#fff",
              margin: 0,
            }}>
              ¿No encontraste lo que buscabas?
            </p>
            <p style={{
              fontFamily: "Mulish, sans-serif",
              fontSize: 15,
              color: "rgba(255,255,255,0.75)",
              margin: 0,
              lineHeight: 1.7,
            }}>
              Nuestro equipo está disponible 24/7 para atenderte.
            </p>
            <a
              href="https://api.whatsapp.com/send/?phone=525545116894"
              target="_blank"
              rel="noreferrer"
              style={{
                display: "inline-block",
                backgroundColor: "#dbbd86",
                color: "#1a1a1a",
                fontFamily: "'Bai Jamjuree', sans-serif",
                fontWeight: 700,
                fontSize: 14,
                padding: "12px 28px",
                borderRadius: 999,
                textDecoration: "none",
              }}
            >
              Contactar por WhatsApp
            </a>
          </div>

        </div>
      </div>

    </div>
  );
}

export default FAQ;
