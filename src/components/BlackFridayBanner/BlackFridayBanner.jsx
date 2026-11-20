import { useState, useEffect } from "react";
import "./BlackFridayBanner.css";

// Expira el 22 de noviembre 2026 a medianoche hora Ciudad de México (UTC-6)
const FIN = new Date("2026-11-22T06:00:00Z");

function getRemainingLabel() {
  const ahora = new Date();
  const diff   = FIN - ahora;
  if (diff <= 0) return null;

  const horas   = Math.floor(diff / 3_600_000);
  const minutos = Math.floor((diff % 3_600_000) / 60_000);
  const segs    = Math.floor((diff % 60_000) / 1_000);

  if (horas >= 24) return "Termina mañana a medianoche";
  if (horas > 0)   return `Termina en ${horas}h ${minutos}m`;
  if (minutos > 0) return `Termina en ${minutos}m ${segs}s`;
  return `Termina en ${segs}s`;
}

export default function BlackFridayBanner() {
  const [label,    setLabel]    = useState(() => getRemainingLabel());
  const [cerrado,  setCerrado]  = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      const next = getRemainingLabel();
      setLabel(next);
      if (!next) clearInterval(id);
    }, 1_000);
    return () => clearInterval(id);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!label || cerrado) return null;

  return (
    <div className="bfBanner">
      <div className="bfBannerInner">
        <span className="bfBannerIcon">🖤</span>
        <div className="bfBannerText">
          <strong>BLACK FRIDAY</strong>
          <span className="bfBannerSep">—</span>
          <span>3 y 6 meses sin intereses en todos los relojes</span>
        </div>
        <span className="bfBannerTimer">{label}</span>
      </div>
      <button
        className="bfBannerClose"
        onClick={() => setCerrado(true)}
        aria-label="Cerrar"
      >
        ✕
      </button>
    </div>
  );
}
