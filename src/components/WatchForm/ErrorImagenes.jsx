// Banner que lista los archivos rechazados durante la validación de imágenes.
// Props:
//   errores → array de { nombre, razon } devuelto por validarArchivos()
//   onClose → limpia el error en el componente padre
function ErrorImagenes({ errores, onClose }) {
  return (
    <div className="sellInputError">
      <div>
        <strong>Archivo(s) no admitidos:</strong>
        <ul>
          {errores.map((e, i) => (
            <li key={i}>
              <strong>{e.nombre}</strong> — {e.razon}
            </li>
          ))}
        </ul>
      </div>
      <button type="button" className="sellInputErrorClose" onClick={onClose} aria-label="Cerrar">
        ✕
      </button>
    </div>
  );
}

export default ErrorImagenes;
