import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BUEN_FIN_INICIO, BUEN_FIN_FIN } from "../../config/constants";
import "./BuenFinCountdown.css";

// ─────────────────────────────────────────────────────────
// BuenFinCountdown — banner con cuenta regresiva al Buen Fin.
//
// Fases (según la hora actual):
//   • antes de BUEN_FIN_INICIO → cuenta regresiva días/horas/min/seg
//   • entre INICIO y FIN       → "¡El Buen Fin ya comenzó!" + CTA
//   • después de BUEN_FIN_FIN  → no renderiza nada
// ─────────────────────────────────────────────────────────

const INICIO_MS = new Date(BUEN_FIN_INICIO).getTime();
const FIN_MS    = new Date(BUEN_FIN_FIN).getTime();

const pad = (n) => String(n).padStart(2, "0");

function partes(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  return {
    dias:     Math.floor(total / 86400),
    horas:    Math.floor((total % 86400) / 3600),
    minutos:  Math.floor((total % 3600) / 60),
    segundos: total % 60,
  };
}

function BuenFinCountdown({ className = "" }) {
  const [ahora, setAhora] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setAhora(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (ahora >= FIN_MS) return null;

  const enCurso = ahora >= INICIO_MS;
  const t = partes(INICIO_MS - ahora);
  const unidades = [
    { valor: t.dias,     etiqueta: "Días" },
    { valor: t.horas,    etiqueta: "Horas" },
    { valor: t.minutos,  etiqueta: "Min" },
    { valor: t.segundos, etiqueta: "Seg" },
  ];

  return (
    <section className={`buenFin ${className}`} aria-label="Buen Fin 2026">
      <div className="buenFinGlow" aria-hidden="true" />

      <div className="buenFinInfo">
        <span className="buenFinBadge">
          <span className="buenFinDot" aria-hidden="true" />
          {enCurso ? "En vivo" : "Muy pronto"}
        </span>
        <h2 className="buenFinTitulo">
          Buen Fin <span>2026</span>
        </h2>
        <p className="buenFinTexto">
          {enCurso
            ? "Los descuentos ya están activos. ¡Encuentra tu próximo reloj!"
            : "Los descuentos comienzan a las 12:00 a.m. No te lo pierdas."}
        </p>
      </div>

      {enCurso ? (
        <Link to="/shop" className="buenFinCta">Ver ofertas →</Link>
      ) : (
        <div
          className="buenFinReloj"
          role="timer"
          aria-label={`Faltan ${t.dias} días, ${t.horas} horas, ${t.minutos} minutos`}
        >
          {unidades.map((u, i) => (
            <div className="buenFinUnidad" key={u.etiqueta}>
              <div className="buenFinCaja">
                <span key={u.valor} className="buenFinNumero">{pad(u.valor)}</span>
              </div>
              <span className="buenFinEtiqueta">{u.etiqueta}</span>
              {i < unidades.length - 1 && <span className="buenFinSep" aria-hidden="true">:</span>}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default BuenFinCountdown;
