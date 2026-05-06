import { useState } from "react";
import './CalculadoraVenta.css';

// ─────────────────────────────────────────────────────────────
// CALCULADORAVENTA.JSX
// Simulador de precio para vendedores no registrados.
// El vendedor introduce el precio de su reloj y ve en tiempo
// real cuánto recibiría después de la comisión de la plataforma.
//
// Fórmula: lo que recibes = precio × (1 - COMISION)
// ─────────────────────────────────────────────────────────────

// Comisión de la plataforma (15 %). Cámbiala aquí si cambia.
const COMISION = 0.15;

// Formatea un número como moneda mexicana: 42500 → "$42,500.00"
const formatearPeso = (numero) =>
  numero.toLocaleString("es-MX", { style: "currency", currency: "MXN" });

function CalculadoraVenta() {

  // Precio que escribe el vendedor (string para manejar el input)
  const [monto, setMonto] = useState("");

  // Parseamos a número; si está vacío o inválido, usamos 0
  const precio    = parseFloat(monto) || 0;
  const comision  = precio * COMISION;
  const recibe    = precio - comision;

  return (
    <div className="calcSection">

      {/* ── Encabezado de la sección ── */}
      <div className="calcHeader">
        <h2 className="calcTitle">¿Cuánto recibirías por tu reloj?</h2>
        <p className="calcSubtitle">
          Ingresa el precio de venta y calcula tu ganancia en segundos.
        </p>
      </div>

      {/* ── Tarjeta principal ── */}
      <div className="calcCard">

        {/* ── Columna izquierda: input ── */}
        <div className="calcInputCol">

          <label className="calcLabel">Precio de venta</label>

          {/* Input con prefijo de moneda */}
          <div className="calcInputWrap">
            <span className="calcCurrency">$</span>
            <input
              type="number"
              className="calcInput"
              value={monto}
              onChange={e => setMonto(e.target.value)}
              placeholder="0"
              min="0"
              max="10000000"
            />
          </div>

          {/* Rango orientativo */}
          <p className="calcRange">Mínimo: $0 — Máximo: $10,000,000</p>

          {/* Barra de progreso visual que crece según el monto */}
          {/* Limitamos a 10M para que no desborde */}
          <div className="calcBar">
            <div
              className="calcBarFill"
              style={{ width: `${Math.min((precio / 10_000_000) * 100, 100)}%` }}
            />
          </div>

        </div>

        {/* ── Divisor vertical ── */}
        <div className="calcDivider" />

        {/* ── Columna derecha: resumen ── */}
        <div className="calcResultCol">

          <p className="calcResultLabel">Resumen</p>

          {/* Filas del desglose */}
          <div className="calcBreakdown">

            <div className="calcRow">
              <span className="calcRowLabel">Precio de venta</span>
              <span className="calcRowValue">
                {precio > 0 ? formatearPeso(precio) : "—"}
              </span>
            </div>

            <div className="calcRow">
              <span className="calcRowLabel">
                Comisión plataforma
                {/* Badge con el porcentaje */}
                <span className="calcComisionBadge">{(COMISION * 100).toFixed(0)}%</span>
              </span>
              <span className="calcRowValue calcRowNegative">
                {precio > 0 ? `− ${formatearPeso(comision)}` : "—"}
              </span>
            </div>

          </div>

          {/* Separador */}
          <hr className="calcResultDivider" />

          {/* Total destacado */}
          <div className="calcTotal">
            <span className="calcTotalLabel">Lo que recibes</span>
            {/* El número tiene animación de color al cambiar */}
            <span className={`calcTotalValue ${precio > 0 ? "calcTotalActive" : ""}`}>
              {precio > 0 ? formatearPeso(recibe) : "$0.00"}
            </span>
          </div>

          {/* Nota de pie */}
          <p className="calcNote">
            La comisión cubre gestión, verificación y publicación de tu reloj.
          </p>

        </div>
      </div>
    </div>
  );
}

export default CalculadoraVenta;
