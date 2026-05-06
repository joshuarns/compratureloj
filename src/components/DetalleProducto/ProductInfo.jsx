// ─────────────────────────────────────────────────────────
// PRODUCTINFO.JSX
// Sección de especificaciones técnicas del reloj.
// Los datos vienen en producto.meta_data:
//   array de objetos { key: "marca", value: "Rolex" }
//
// Diseño: grid de tarjetas agrupadas por categoría
// (Identificación, Calibre, Materiales, Condición)
// ─────────────────────────────────────────────────────────

// Helper: busca un valor dentro del array meta_data por clave
// Devuelve el valor o "—" si el campo no existe o está vacío
const getMeta = (meta_data = [], key) => {
  const campo = meta_data.find(m => m.key === key);
  return campo?.value || "—";
};

// ─────────────────────────────────────────────────────────
// SpecCard — Tarjeta de un grupo de especificaciones
// Props:
//   title → nombre del grupo (ej. "Materiales")
//   rows  → array de { label, value } para cada especificación
// ─────────────────────────────────────────────────────────
function SpecCard({ title, rows }) {
  // Filtramos las filas que tienen valor real (distintas de "—")
  // para no mostrar cards vacías si el usuario no llenó esos campos
  const filasConDatos = rows.filter(r => r.value && r.value !== "—");
  if (filasConDatos.length === 0) return null;

  return (
    <div className="specsCard">

      {/* Título del grupo en mayúsculas pequeñas (estilo iOS) */}
      <p className="specsCardTitle">{title}</p>

      {/* Lista de pares etiqueta / valor */}
      {filasConDatos.map((fila, i) => (
        <div className="specsRow" key={i}>
          <span className="specsLabel">{fila.label}</span>
          <span className="specsValue">{fila.value}</span>
        </div>
      ))}

    </div>
  );
}

// ─────────────────────────────────────────────────────────
// ProductInfo — Componente principal
// Recibe el objeto "producto" completo de WooCommerce
// ─────────────────────────────────────────────────────────
function ProductInfo({ producto }) {

  // Si no hay meta_data, no mostramos la sección
  if (!producto?.meta_data?.length) return null;

  // Extraemos todos los campos que nos interesan del array meta_data
  const m = producto.meta_data; // Alias corto para no repetir el nombre largo

  return (
    <div className="specsSection">

      {/* Título de la sección */}
      <h2 className="specsTitle">Especificaciones del reloj</h2>

      {/* Grid: 2 columnas en desktop, 1 en móvil (ver CSS) */}
      <div className="specsGrid">

        {/* ── Tarjeta 1: Identificación ── */}
        <SpecCard
          title="Identificación"
          rows={[
            { label: "Marca",             value: getMeta(m, "marca") },
            { label: "Modelo",            value: getMeta(m, "modelo") },
            { label: "Referencia",        value: getMeta(m, "referencia") },
            { label: "Número de serie",   value: getMeta(m, "numero_de_serie") },
            { label: "Año de producción", value: getMeta(m, "ano_de_fabricacion") },
            { label: "Género",            value: getMeta(m, "genero") },
          ]}
        />

        {/* ── Tarjeta 2: Calibre y medidas ── */}
        <SpecCard
          title="Calibre"
          rows={[
            { label: "Movimiento",          value: getMeta(m, "movimiento") },
            { label: "Medida de la caja",   value: getMeta(m, "medida_de_la_caja_") !== "—" ? `${getMeta(m, "medida_de_la_caja_")} mm` : "—" },
            { label: "Medida extensible",   value: getMeta(m, "medida_del_extensible") !== "—" ? `${getMeta(m, "medida_del_extensible")} cm` : "—" },
            { label: "Resistencia al agua", value: getMeta(m, "resistencia_al_agua") !== "—" ? `${getMeta(m, "resistencia_al_agua")} atm` : "—" },
          ]}
        />

        {/* ── Tarjeta 3: Materiales ── */}
        <SpecCard
          title="Materiales"
          rows={[
            { label: "Caja",        value: getMeta(m, "material_de_la_caja") },
            { label: "Bisel",       value: getMeta(m, "material_del_bisel") },
            { label: "Extensible",  value: getMeta(m, "material_del_extensible") },
            { label: "Cristal",     value: getMeta(m, "cristal") },
            { label: "Broche",      value: getMeta(m, "broche") },
          ]}
        />

        {/* ── Tarjeta 4: Condición ── */}
        <SpecCard
          title="Condición"
          rows={[
            { label: "Estado del reloj", value: getMeta(m, "estado_del_reloj").replace(/_/g, " ") },
            { label: "Estética",         value: getMeta(m, "estetica_del_reloj").replace(/_/g, " ") },
            { label: "Documentación",    value: getMeta(m, "documentacion").replace(/_/g, " ") },
          ]}
        />

      </div>
    </div>
  );
}

export default ProductInfo;
