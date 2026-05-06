import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { obtenerProducto, actualizarProducto, uploadImage } from "../../api";
import { getMeta, normalizarMetaValor, stripUnidad, validarArchivos } from "../../utils/woocommerce";
import useForm from "../../hooks/useForm";
import WatchFormFields from "../WatchForm/WatchFormFields";
import ErrorImagenes from "../WatchForm/ErrorImagenes";
import '../FormSellWatch/FormSellWatch.css';
import './EditWatch.css';

import { MAX_IMAGENES, MAX_MB } from "../../config/constants";

// Estado inicial vacío — mismo shape que WatchFormFields espera
const PRODUCTO_VACIO = {
  name: "", regular_price: "", description: "", stock_quantity: "",
  marca: "", modelo: "", referencia: "", numero_de_serie: "",
  ano_de_fabricacion: "", genero: "", movimiento: "",
  medida_de_la_caja_: "", medida_del_extensible: "", resistencia_al_agua: "",
  broche: "", material_del_bisel: "", material_de_la_caja: "",
  material_del_extensible: "", cristal: "",
  documentacion: "", estetica_del_reloj: "", estado_del_reloj: "",
};

function EditWatch() {
  const { id } = useParams();

  // Estados de pantalla
  const [cargando,  setCargando]  = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [exito,     setExito]     = useState(false);
  const [errorMsg,  setErrorMsg]  = useState("");
  const [pasoEnvio, setPasoEnvio] = useState("");

  // Galería mixta: URLs ya guardadas en WooCommerce + archivos nuevos pendientes de subir
  const [imagenesExistentes, setImagenesExistentes] = useState([]);
  const [imagenesNuevas,     setImagenesNuevas]     = useState([]);
  const [previewNuevas,      setPreviewNuevas]      = useState([]);
  const [errorGaleria,       setErrorGaleria]       = useState(null);

  // useForm consolida el estado del formulario (22 campos) en un único objeto.
  // setValores se usa en el useEffect para pre-rellenar los datos de la API.
  const { valores: producto, onChange: handleChange, setValores: setProducto } = useForm(PRODUCTO_VACIO);

  // Carga el producto desde WooCommerce y pre-rellena el formulario.
  // `activo` evita setState si el usuario navega fuera antes de que responda la API.
  useEffect(() => {
    let activo = true;

    const cargarProducto = async () => {
      try {
        const data = await obtenerProducto(id);
        if (!activo) return;
        // n() normaliza valores de select (quita acentos, mapea sinónimos)
        // u() elimina unidades de medida al final del valor ("44mm" → "44")
        const n = (key) => normalizarMetaValor(getMeta(data.meta_data, key) || "");
        const u = (key) => stripUnidad(getMeta(data.meta_data, key) || "");

        setProducto({
          name:               data.name || "",
          regular_price:      data.regular_price || "",
          description:        data.description?.replace(/<[^>]*>/g, "") || "",
          stock_quantity:     data.stock_quantity || "",
          // Campos de texto libre — sin normalización
          marca:              getMeta(data.meta_data, "marca")           || "",
          modelo:             getMeta(data.meta_data, "modelo")          || "",
          referencia:         getMeta(data.meta_data, "referencia")      || "",
          numero_de_serie:    getMeta(data.meta_data, "numero_de_serie") || "",
          ano_de_fabricacion: getMeta(data.meta_data, "ano_de_fabricacion") || "",
          // Campos select — normalizar para que coincidan con los <option value="">
          genero:             n("genero"),
          movimiento:         n("movimiento"),
          broche:             n("broche"),
          material_del_bisel:      n("material_del_bisel"),
          material_de_la_caja:     n("material_de_la_caja"),
          material_del_extensible: n("material_del_extensible"),
          cristal:                 n("cristal"),
          documentacion:           n("documentacion"),
          estetica_del_reloj:      n("estetica_del_reloj"),
          estado_del_reloj:        n("estado_del_reloj"),
          // Medidas — quitar unidades ("44mm" → "44")
          medida_de_la_caja_:    u("medida_de_la_caja_"),
          medida_del_extensible: u("medida_del_extensible"),
          resistencia_al_agua:   u("resistencia_al_agua"),
        });
        setImagenesExistentes((data.images || []).map(img => img.src));
      } catch (err) {
        if (!activo) return;
        setErrorMsg("No se pudo cargar el reloj. Intenta de nuevo.");
      } finally {
        if (activo) setCargando(false);
      }
    };

    cargarProducto();
    return () => { activo = false; };
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleImagenesNuevas = (e) => {
    const totalActual = imagenesExistentes.length + imagenesNuevas.length;
    const disponibles = MAX_IMAGENES - totalActual;
    if (disponibles <= 0) return;

    const { validas, rechazadas } = validarArchivos(Array.from(e.target.files));
    setErrorGaleria(rechazadas.length > 0 ? rechazadas : null);

    const aAgregar = validas.slice(0, disponibles);
    if (aAgregar.length > 0) {
      setImagenesNuevas(prev => [...prev, ...aAgregar]);
      setPreviewNuevas(prev => [...prev, ...aAgregar.map(f => URL.createObjectURL(f))]);
    }
    e.target.value = "";
  };

  const eliminarExistente = (index) => {
    setImagenesExistentes(prev => prev.filter((_, i) => i !== index));
  };

  const eliminarNueva = (index) => {
    URL.revokeObjectURL(previewNuevas[index]); // libera memoria del Object URL
    setImagenesNuevas(prev => prev.filter((_, i) => i !== index));
    setPreviewNuevas(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setErrorMsg("");
    setPasoEnvio("");

    try {
      // Subir las imágenes nuevas y recoger sus URLs
      const urlsSubidas = [];
      for (let i = 0; i < imagenesNuevas.length; i++) {
        setPasoEnvio(`Subiendo imagen ${i + 1} de ${imagenesNuevas.length}...`);
        const result = await uploadImage(imagenesNuevas[i]);
        urlsSubidas.push(result.source_url);
      }

      setPasoEnvio("Guardando cambios...");
      await actualizarProducto(id, {
        name:           producto.name,
        regular_price:  producto.regular_price,
        description:    producto.description,
        stock_quantity: producto.stock_quantity,
        status:         'draft', // pasa a borrador hasta que el equipo lo revise y publique
        // Existentes conservadas + nuevas subidas
        images: [
          ...imagenesExistentes.map(src => ({ src })),
          ...urlsSubidas.map(src => ({ src })),
        ],
        meta_data: [
          { key: "marca",                   value: producto.marca },
          { key: "modelo",                  value: producto.modelo },
          { key: "referencia",              value: producto.referencia },
          { key: "numero_de_serie",         value: producto.numero_de_serie },
          { key: "ano_de_fabricacion",      value: producto.ano_de_fabricacion },
          { key: "genero",                  value: producto.genero },
          { key: "movimiento",              value: producto.movimiento },
          { key: "medida_de_la_caja_",      value: producto.medida_de_la_caja_ },
          { key: "medida_del_extensible",   value: producto.medida_del_extensible },
          { key: "resistencia_al_agua",     value: producto.resistencia_al_agua },
          { key: "broche",                  value: producto.broche },
          { key: "material_del_bisel",      value: producto.material_del_bisel },
          { key: "material_de_la_caja",     value: producto.material_de_la_caja },
          { key: "material_del_extensible", value: producto.material_del_extensible },
          { key: "cristal",                 value: producto.cristal },
          { key: "documentacion",           value: producto.documentacion },
          { key: "estetica_del_reloj",      value: producto.estetica_del_reloj },
          { key: "estado_del_reloj",        value: producto.estado_del_reloj },
        ],
      });
      setExito(true);

    } catch (err) {
      setErrorMsg("No se pudieron guardar los cambios. Intenta de nuevo.");
    } finally {
      setGuardando(false);
      setPasoEnvio("");
    }
  };

  const totalImagenes = imagenesExistentes.length + imagenesNuevas.length;

  // ── Skeleton de carga ────────────────────────────────────────────────────────
  if (cargando) {
    return (
      <div className="sellPage">
        <div className="container">
          <div className="editSkeletonHeader">
            <div className="editSkeletonBlock" style={{ width: 120, height: 14, marginBottom: 12 }} />
            <div className="editSkeletonBlock" style={{ width: 260, height: 36, marginBottom: 8 }} />
            <div className="editSkeletonBlock" style={{ width: 320, height: 14 }} />
          </div>
          {[1, 2, 3].map(i => (
            <div className="sellCard" key={i} style={{ marginBottom: 20 }}>
              <div className="editSkeletonBlock" style={{ width: 100, height: 12, marginBottom: 24 }} />
              <div className="editSkeletonBlock" style={{ height: 48, marginBottom: 14 }} />
              <div className="editSkeletonBlock" style={{ height: 48 }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Pantalla de éxito ────────────────────────────────────────────────────────
  if (exito) {
    return (
      <div className="sellPage">
        <div className="container">
          <div className="editSuccessCard">
            <div className="editSuccessIcon">✓</div>
            <h2 className="editSuccessTitle">¡Cambios guardados!</h2>
            <p className="editSuccessText">
              Tu reloj <strong>{producto.name}</strong> ha sido actualizado.<br />
              El equipo revisará los cambios antes de publicarlos.
            </p>
            <div className="editSuccessActions">
              <button className="btnEnviarReloj" onClick={() => setExito(false)}>
                Seguir editando
              </button>
              <Link to="/dashboard" className="editBtnSecondary">
                Ir al dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Formulario ───────────────────────────────────────────────────────────────
  return (
    <div className="sellPage">
      <div className="container">

        <div className="sellPageHeader">
          <p className="editBreadcrumb">
            <Link to="/dashboard">Mi dashboard</Link> → Editar reloj
          </p>
          <h1>Editar reloj</h1>
          <p>Modifica la información de tu reloj. Los cambios quedan pendientes de revisión.</p>
        </div>

        {errorMsg && <div className="editErrorBanner">⚠ {errorMsg}</div>}

        <form className="sellForm" onSubmit={handleSubmit}>

          {/* ── Galería mixta (existentes + nuevas) ── */}
          <div className="sellCard">
            <p className="sellSectionTitle">
              Galería de fotos
              <span className="sellGaleriaContador"> {totalImagenes}/{MAX_IMAGENES}</span>
            </p>

            {totalImagenes > 0 && (
              <div className="sellGaleria">
                {imagenesExistentes.map((src, i) => (
                  <div className="sellGaleriaItem" key={`ex-${i}`}>
                    <img src={src} alt={`Foto ${i + 1}`} />
                    {i === 0 && <span className="sellGaleriaBadge">Principal</span>}
                    <button type="button" className="sellGaleriaRemove"
                      onClick={() => eliminarExistente(i)} aria-label="Eliminar imagen">✕</button>
                  </div>
                ))}
                {previewNuevas.map((preview, i) => (
                  <div className="sellGaleriaItem" key={`new-${i}`}>
                    <img src={preview} alt={`Nueva foto ${i + 1}`} />
                    <span className="sellGaleriaBadge" style={{ background: "rgba(52,199,89,0.88)" }}>
                      Nueva
                    </span>
                    <button type="button" className="sellGaleriaRemove"
                      onClick={() => eliminarNueva(i)} aria-label="Eliminar imagen">✕</button>
                  </div>
                ))}
              </div>
            )}

            {totalImagenes < MAX_IMAGENES && (
              <>
                <label style={{ marginTop: totalImagenes > 0 ? 16 : 0 }}>
                  {totalImagenes === 0 ? "Agregar fotos del reloj" : "Agregar más fotos"}{" "}
                  <span style={{ fontWeight: 400, color: "#b0b0b5" }}>
                    (máx. {MAX_IMAGENES - totalImagenes} más, {MAX_MB} MB por foto)
                  </span>
                </label>
                <input type="file" accept="image/*" multiple onChange={handleImagenesNuevas} />
              </>
            )}

            {errorGaleria && (
              <ErrorImagenes errores={errorGaleria} onClose={() => setErrorGaleria(null)} />
            )}
          </div>

          {/* Las 5 secciones de campos compartidas con FormSellWatch */}
          <WatchFormFields producto={producto} onChange={handleChange} />

          <div className="editActions">
            <button type="submit" className="btnEnviarReloj" disabled={guardando} style={{ borderRadius: 30 }}>
              {guardando ? (pasoEnvio || "Guardando...") : "Guardar cambios"}
            </button>
            <Link to="/dashboard" className="editBtnSecondary">
              Cancelar — volver al dashboard
            </Link>
          </div>

        </form>
      </div>
    </div>
  );
}

export default EditWatch;
