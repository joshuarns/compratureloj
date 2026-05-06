// ─────────────────────────────────────────────────────────────────────────────
// WatchFormFields.jsx
//
// Las 5 secciones de campos del formulario de reloj que son idénticas en
// FormSellWatch (crear) y EditWatch (editar):
//   1. Información básica   (nombre, precio, stock, descripción)
//   2. Identificación       (marca, modelo, referencia, serie, año, género, movimiento)
//   3. Medidas              (caja, extensible, resistencia al agua)
//   4. Materiales           (caja, bisel, extensible, cristal, broche)
//   5. Condición            (estado, estética, documentación)
//
// Props:
//   producto  → objeto con todos los campos del reloj
//   onChange  → handler que actualiza el campo modificado en el estado padre
// ─────────────────────────────────────────────────────────────────────────────

function WatchFormFields({ producto, onChange }) {
  return (
    <>
      {/* ── SECCIÓN 1: Información básica ── */}
      <div className="sellCard">
        <p className="sellSectionTitle">Información básica</p>
        <div className="row g-3">
          <div className="col-12">
            <label>Nombre del reloj</label>
            <input type="text" name="name" value={producto.name} onChange={onChange}
              required placeholder="Ej. Rolex Submariner" />
          </div>
          <div className="col-md-6">
            <label>Precio</label>
            <input name="regular_price" value={producto.regular_price} onChange={onChange}
              required placeholder="Ej. 150000" />
          </div>
          <div className="col-md-6">
            <label>Stock</label>
            <input name="stock_quantity" value={producto.stock_quantity} onChange={onChange}
              required placeholder="1" />
          </div>
          <div className="col-12">
            <label>Descripción</label>
            <input name="description" value={producto.description} onChange={onChange}
              required placeholder="Describe el estado y características del reloj" />
          </div>
        </div>
      </div>

      {/* ── SECCIÓN 2: Identificación del reloj ── */}
      <div className="sellCard">
        <p className="sellSectionTitle">Identificación del reloj</p>
        <div className="row g-3">
          <div className="col-md-6">
            <label>Marca</label>
            <input name="marca" value={producto.marca} onChange={onChange}
              required placeholder="Rolex" />
          </div>
          <div className="col-md-6">
            <label>Modelo</label>
            <input name="modelo" value={producto.modelo} onChange={onChange}
              required placeholder="Submariner" />
          </div>
          <div className="col-md-6">
            <label>Referencia</label>
            <input name="referencia" value={producto.referencia} onChange={onChange}
              placeholder="126610LN" />
          </div>
          <div className="col-md-6">
            <label>Número de serie</label>
            <input name="numero_de_serie" value={producto.numero_de_serie} onChange={onChange}
              placeholder="Ej. 647381" />
          </div>
          <div className="col-md-4">
            <label>Año de producción</label>
            <input name="ano_de_fabricacion" value={producto.ano_de_fabricacion} onChange={onChange}
              placeholder="2021" />
          </div>
          <div className="col-md-4">
            <label>Género</label>
            <select name="genero" value={producto.genero} onChange={onChange} required>
              <option value="">Selecciona</option>
              <option value="hombre">Hombre</option>
              <option value="mujer">Mujer</option>
            </select>
          </div>
          <div className="col-md-4">
            <label>Movimiento</label>
            <select name="movimiento" value={producto.movimiento} onChange={onChange} required>
              <option value="">Selecciona</option>
              <option value="automatico">Automático</option>
              <option value="cuerda">Cuerda</option>
              <option value="cuarzo">Cuarzo</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── SECCIÓN 3: Medidas ── */}
      <div className="sellCard">
        <p className="sellSectionTitle">Medidas</p>
        <div className="row g-3">
          <div className="col-md-4">
            <label>Medida de la caja</label>
            <div className="input-group">
              <input name="medida_de_la_caja_" value={producto.medida_de_la_caja_}
                onChange={onChange} placeholder="41" />
              <span className="input-group-text">mm</span>
            </div>
          </div>
          <div className="col-md-4">
            <label>Medida del extensible</label>
            <div className="input-group">
              <input name="medida_del_extensible" value={producto.medida_del_extensible}
                onChange={onChange} placeholder="25" />
              <span className="input-group-text">cm</span>
            </div>
          </div>
          <div className="col-md-4">
            <label>Resistencia al agua</label>
            <div className="input-group">
              <input name="resistencia_al_agua" value={producto.resistencia_al_agua}
                onChange={onChange} placeholder="30" />
              <span className="input-group-text">atm</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── SECCIÓN 4: Materiales ── */}
      <div className="sellCard">
        <p className="sellSectionTitle">Materiales</p>
        <div className="row g-3">
          <div className="col-md-6">
            <label>Material de la caja</label>
            <select name="material_de_la_caja" value={producto.material_de_la_caja} onChange={onChange} required>
              <option value="">Selecciona</option>
              <option value="acero">Acero</option>
              <option value="oro">Oro</option>
              <option value="platino">Platino</option>
              <option value="ceramica">Cerámica</option>
              <option value="titanio">Titanio</option>
              <option value="bronce">Bronce</option>
            </select>
          </div>
          <div className="col-md-6">
            <label>Material del bisel</label>
            <select name="material_del_bisel" value={producto.material_del_bisel} onChange={onChange} required>
              <option value="">Selecciona</option>
              <option value="acero">Acero</option>
              <option value="diamantes">Diamantes</option>
              <option value="oro">Oro</option>
              <option value="platino">Platino</option>
              <option value="ceramica">Cerámica</option>
              <option value="zafiro">Zafiro</option>
              <option value="aluminio">Aluminio</option>
              <option value="titanio">Titanio</option>
            </select>
          </div>
          <div className="col-md-6">
            <label>Material del extensible</label>
            <select name="material_del_extensible" value={producto.material_del_extensible} onChange={onChange} required>
              <option value="">Selecciona</option>
              <option value="acero">Acero</option>
              <option value="acero_oro">Acero oro</option>
              <option value="oro">Oro</option>
              <option value="platino">Platino</option>
              <option value="ceramica">Cerámica</option>
              <option value="piel">Piel</option>
              <option value="caucho">Caucho</option>
              <option value="nato">Nato</option>
              <option value="titanio">Titanio</option>
              <option value="otro">Otro</option>
            </select>
          </div>
          <div className="col-md-6">
            <label>Cristal</label>
            <select name="cristal" value={producto.cristal} onChange={onChange} required>
              <option value="">Selecciona</option>
              <option value="zafiro">Zafiro</option>
              <option value="mica">Mica</option>
              <option value="plexiglass">Plexiglass</option>
              <option value="mineral">Mineral</option>
              <option value="otro">Otro</option>
            </select>
          </div>
          <div className="col-md-6">
            <label>Broche</label>
            <select name="broche" value={producto.broche} onChange={onChange} required>
              <option value="">Selecciona</option>
              <option value="corrido">Corrido</option>
              <option value="mariposa">Mariposa</option>
              <option value="desplegable">Desplegable</option>
              <option value="desplegable_con_botones">Desplegable con botones</option>
              <option value="hebilla">Hebilla</option>
              <option value="broche_de_gancho">Broche de gancho</option>
              <option value="cierre_de_malla">Cierre de malla</option>
              <option value="velcro">Velcro</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── SECCIÓN 5: Condición ── */}
      <div className="sellCard">
        <p className="sellSectionTitle">Condición del reloj</p>
        <div className="row g-3">
          <div className="col-md-4">
            <label>Estado del reloj</label>
            <select name="estado_del_reloj" value={producto.estado_del_reloj} onChange={onChange} required>
              <option value="">Selecciona</option>
              <option value="nuevo">Nuevo</option>
              <option value="poco_uso">Poco uso</option>
              <option value="con_uso">Con uso</option>
              <option value="mucho_uso">Mucho uso</option>
            </select>
          </div>
          <div className="col-md-4">
            <label>Estética del reloj</label>
            <select name="estetica_del_reloj" value={producto.estetica_del_reloj} onChange={onChange} required>
              <option value="">Selecciona</option>
              <option value="excelente">Excelente</option>
              <option value="muy_buena">Muy buena</option>
              <option value="buena">Buena</option>
              <option value="mala">Mala</option>
              <option value="muy_mala">Muy mala</option>
            </select>
          </div>
          <div className="col-md-4">
            <label>Documentación</label>
            <select name="documentacion" value={producto.documentacion} onChange={onChange} required>
              <option value="">Selecciona</option>
              <option value="solo_reloj">Solo reloj</option>
              <option value="estuche_original">Estuche original</option>
              <option value="manuales">Manuales</option>
              <option value="estuche_y_manuales">Estuche y manuales</option>
              <option value="full_set">Full set</option>
            </select>
          </div>
        </div>
      </div>
    </>
  );
}

export default WatchFormFields;
