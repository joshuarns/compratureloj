import { useState } from "react";
import emailjs from "@emailjs/browser";
import { crearProducto, uploadImage } from "../../api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { validarArchivos } from "../../utils/woocommerce";
import useForm from "../../hooks/useForm";
import WatchFormFields from "../WatchForm/WatchFormFields";
import ErrorImagenes from "../WatchForm/ErrorImagenes";
import './FormSellWatch.css';

import {
  EMAILJS_SERVICE_ID,
  EMAILJS_TEMPLATE_RELOJ_NUEVO,
  EMAILJS_PUBLIC_KEY,
  MAX_IMAGENES,
} from "../../config/constants";

// Estado inicial vacío del formulario — mismo shape que usa WatchFormFields
const PRODUCTO_VACIO = {
  name: "", regular_price: "", description: "", stock_quantity: "",
  marca: "", modelo: "", referencia: "", numero_de_serie: "",
  ano_de_fabricacion: "", genero: "", movimiento: "",
  medida_de_la_caja_: "", medida_del_extensible: "", resistencia_al_agua: "",
  broche: "", material_del_bisel: "", material_de_la_caja: "",
  material_del_extensible: "", cristal: "",
  documentacion: "", estetica_del_reloj: "", estado_del_reloj: "",
};

function FormSellWatch() {
  const navigate    = useNavigate();
  const { usuario } = useAuth();

  // useForm consolida los 22 campos del formulario en un único objeto.
  // onChange está memoizado dentro del hook para no recrearse en cada render.
  const { valores: producto, onChange: handleChange } = useForm(PRODUCTO_VACIO);

  // Galería del reloj: hasta MAX_IMAGENES fotos
  const [imagenesSeleccionadas, setImagenesSeleccionadas] = useState([]);
  const [previewImagenes,       setPreviewImagenes]       = useState([]);
  const [errorGaleria,          setErrorGaleria]          = useState(null);

  // Foto con el reloj puesto en la muñeca (verificación de posesión)
  const [fotoMuneca,    setFotoMuneca]    = useState(null);
  const [previewMuneca, setPreviewMuneca] = useState(null);
  const [errorMuneca,   setErrorMuneca]   = useState(null);

  // INE / Pasaporte del vendedor
  const [fotoIdentificacion,    setFotoIdentificacion]    = useState(null);
  const [previewIdentificacion, setPreviewIdentificacion] = useState(null);
  const [errorIdentificacion,   setErrorIdentificacion]   = useState(null);

  // Estado del envío
  const [enviando,   setEnviando]   = useState(false);
  const [pasoEnvio,  setPasoEnvio]  = useState("");
  const [errorEnvio, setErrorEnvio] = useState("");

  // Acepta hasta MAX_IMAGENES imágenes contando las ya seleccionadas
  const handleImagenes = (e) => {
    const todos = Array.from(e.target.files);
    const { validas, rechazadas } = validarArchivos(todos);

    setErrorGaleria(rechazadas.length > 0 ? rechazadas : null);

    const disponibles = MAX_IMAGENES - imagenesSeleccionadas.length;
    const aAgregar    = validas.slice(0, disponibles);
    if (aAgregar.length > 0) {
      setImagenesSeleccionadas(prev => [...prev, ...aAgregar]);
      setPreviewImagenes(prev => [...prev, ...aAgregar.map(f => URL.createObjectURL(f))]);
    }
    e.target.value = "";
  };

  const eliminarImagen = (index) => {
    setImagenesSeleccionadas(prev => prev.filter((_, i) => i !== index));
    setPreviewImagenes(prev => prev.filter((_, i) => i !== index));
  };

  const handleFotoMuneca = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const { rechazadas } = validarArchivos([file]);
    if (rechazadas.length > 0) { setErrorMuneca(rechazadas); e.target.value = ""; return; }
    setErrorMuneca(null);
    setFotoMuneca(file);
    setPreviewMuneca(URL.createObjectURL(file));
  };

  const handleFotoIdentificacion = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const { rechazadas } = validarArchivos([file]);
    if (rechazadas.length > 0) { setErrorIdentificacion(rechazadas); e.target.value = ""; return; }
    setErrorIdentificacion(null);
    setFotoIdentificacion(file);
    setPreviewIdentificacion(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);
    setErrorEnvio("");

    try {
      if (imagenesSeleccionadas.length === 0) {
        throw new Error("Debes subir al menos una foto del reloj.");
      }

      // Subir galería de fotos del reloj
      const urlsImagenes = [];
      for (let i = 0; i < imagenesSeleccionadas.length; i++) {
        setPasoEnvio(`Subiendo foto ${i + 1} de ${imagenesSeleccionadas.length}...`);
        const res = await uploadImage(imagenesSeleccionadas[i]);
        urlsImagenes.push({ src: res.source_url });
      }

      setPasoEnvio("Subiendo foto de verificación...");
      const munecaData = await uploadImage(fotoMuneca);

      setPasoEnvio("Subiendo identificación oficial...");
      const identificacionData = await uploadImage(fotoIdentificacion);

      setPasoEnvio("Creando tu publicación...");
      await crearProducto({
        name:           producto.name,
        type:           "simple",
        regular_price:  producto.regular_price,
        description:    producto.description,
        manage_stock:   true,
        stock_quantity: producto.stock_quantity,
        status:         "draft", // queda en borrador hasta que el admin lo apruebe
        images:         urlsImagenes,
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
          { key: "vendedor_id",             value: String(usuario?.id || "") },
          { key: "foto_muneca",             value: munecaData.source_url },
          { key: "foto_identificacion",     value: identificacionData.source_url },
        ],
      }, usuario?.id);

      // Notificación al admin — fire-and-forget, no bloquea la navegación
      emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_RELOJ_NUEVO,
        {
          vendedor_nombre: usuario?.nombre || "—",
          vendedor_email:  usuario?.email  || "—",
          reloj_nombre:    producto.name,
          marca:           producto.marca,
          modelo:          producto.modelo,
          precio:          producto.regular_price
            ? `$${Number(producto.regular_price).toLocaleString("es-MX")}`
            : "No especificado",
          num_fotos:                  imagenesSeleccionadas.length,
          foto_muneca_url:            munecaData.source_url,
          foto_identificacion_url:    identificacionData.source_url,
          admin_url: "https://compratureloj.com.mx/wp-admin/edit.php?post_status=draft&post_type=product",
          fecha: new Date().toLocaleString("es-MX", { dateStyle: "medium", timeStyle: "short" }),
        },
        EMAILJS_PUBLIC_KEY
      ).catch(() => {});

      navigate('/product-review');

    } catch (error) {
      setPasoEnvio("");
      setErrorEnvio(
        error.message === "Debes subir al menos una foto del reloj."
          ? error.message
          : "Ocurrió un error al enviar tu reloj. Verifica tu conexión e intenta de nuevo."
      );
      setEnviando(false);
    }
  };

  return (
    <form className="sellForm" onSubmit={handleSubmit}>

      {/* ── Galería del reloj ── */}
      <div className="sellCard">
        <p className="sellSectionTitle">Fotografías del reloj</p>
        <label>
          Selecciona hasta {MAX_IMAGENES} fotos
          <span style={{ fontWeight: 400, color: "#6e6e73", marginLeft: 6 }}>
            (la primera será la imagen principal)
          </span>
        </label>
        <input
          type="file"
          onChange={handleImagenes}
          required={imagenesSeleccionadas.length === 0}
          accept="image/*"
          multiple
        />
        {errorGaleria && (
          <ErrorImagenes errores={errorGaleria} onClose={() => setErrorGaleria(null)} />
        )}
        {previewImagenes.length > 0 && (
          <div className="sellGaleria">
            {previewImagenes.map((src, i) => (
              <div key={i} className="sellGaleriaItem">
                <img src={src} alt={`Foto ${i + 1}`} />
                {i === 0 && <span className="sellGaleriaBadge">Principal</span>}
                <button type="button" className="sellGaleriaRemove"
                  onClick={() => eliminarImagen(i)} title="Eliminar foto">✕</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Verificación de posesión ── */}
      <div className="sellCard">
        <p className="sellSectionTitle">Verificación de posesión</p>
        <div className="sellVerificacionHint">
          <span className="sellVerificacionIcon">📸</span>
          <p>
            <strong>Confirma que posees el reloj.</strong> Con el reloj puesto en la muñeca,
            toma una foto con la hora puesta a las <strong>11:30</strong>.
          </p>
        </div>
        <label>Foto con el reloj puesto</label>
        <input type="file" onChange={handleFotoMuneca} required={!fotoMuneca} accept="image/*" />
        {errorMuneca && (
          <ErrorImagenes errores={errorMuneca} onClose={() => setErrorMuneca(null)} />
        )}
        {previewMuneca && (
          <div className="sellImagePreview">
            <img src={previewMuneca} alt="Vista previa muñeca" />
          </div>
        )}
      </div>

      {/* ── Identificación oficial ── */}
      <div className="sellCard">
        <p className="sellSectionTitle">Identificación oficial</p>
        <div className="sellVerificacionHint">
          <span className="sellVerificacionIcon">🪪</span>
          <p>
            Sube una foto de tu <strong>INE</strong> o <strong>Pasaporte</strong> vigente.
            Tu información está protegida y solo será usada para verificar tu identidad.
          </p>
        </div>
        <label>INE o Pasaporte</label>
        <input type="file" onChange={handleFotoIdentificacion} required={!fotoIdentificacion} accept="image/*" />
        {errorIdentificacion && (
          <ErrorImagenes errores={errorIdentificacion} onClose={() => setErrorIdentificacion(null)} />
        )}
        {previewIdentificacion && (
          <div className="sellImagePreview">
            <img src={previewIdentificacion} alt="Vista previa identificación" />
          </div>
        )}
      </div>

      {/* Las 5 secciones de campos compartidas con EditWatch */}
      <WatchFormFields producto={producto} onChange={handleChange} />

      {/* ── Error de envío ── */}
      {errorEnvio && (
        <div className="apiErrorCard" style={{ marginTop: 0 }}>
          <div className="apiErrorIcon">⚠️</div>
          <div className="apiErrorBody">
            <p className="apiErrorTitle">No se pudo enviar tu reloj</p>
            <p className="apiErrorText" style={{ marginBottom: 0 }}>{errorEnvio}</p>
          </div>
        </div>
      )}

      <button type="submit" className="btnEnviarReloj" disabled={enviando}>
        {enviando ? pasoEnvio || "Enviando..." : "Enviar reloj"}
      </button>

    </form>
  );
}

export default FormSellWatch;
