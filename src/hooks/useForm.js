// ─────────────────────────────────────────────────────────────────────────────
// useForm
//
// Hook genérico para manejar el estado de un formulario que vive en un único
// objeto plano (en lugar de un useState por campo).
//
// Problema que resuelve:
//   Con formularios de 20+ campos, cada `const [x, setX] = useState("")` más
//   su `handleChangeX` genera ~40 líneas de boilerplate idéntico.
//   useForm los colapsa en una sola declaración.
//
// API:
//   const { valores, onChange, reset, setValores } = useForm(ESTADO_INICIAL);
//
//   valores    → objeto con los valores actuales de todos los campos
//   onChange   → handler listo para pasar a cualquier <input name="x">
//                actualiza valores[name] sin tocar el resto del objeto
//   reset      → restaura el formulario a initialValues
//   setValores → setter directo para casos donde se necesita sobrescribir
//                el objeto completo (ej. pre-rellenar campos desde la API)
//
// Uso típico:
//   const { valores: producto, onChange, setValores: setProducto } =
//     useForm(PRODUCTO_VACIO);
//
//   // En un useEffect de carga:
//   setProducto({ name: data.name, marca: getMeta(...), ... });
//
//   // En el JSX:
//   <input name="name" value={producto.name} onChange={onChange} />
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useCallback } from "react";

function useForm(initialValues) {
  const [valores, setValores] = useState(initialValues);

  // Usamos la forma funcional del setter (prev => ...) para que onChange
  // no necesite capturar `valores` en su cierre — esto evita que el callback
  // se recree cada vez que el formulario cambia.
  const onChange = useCallback((e) => {
    const { name, value } = e.target;
    setValores(prev => ({ ...prev, [name]: value }));
  }, []);

  // initialValues es una constante definida fuera del componente (PRODUCTO_VACIO),
  // así que esta dependencia nunca cambia en la práctica.
  const reset = useCallback(() => setValores(initialValues), [initialValues]);

  return { valores, onChange, reset, setValores };
}

export default useForm;
