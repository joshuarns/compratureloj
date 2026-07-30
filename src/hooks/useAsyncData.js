import { useState, useEffect } from "react";

// Encapsula el patrón fetch/loading/error/reintento usado en los tabs del Dashboard.
// `fn`   — función async que devuelve el array de datos.
// `deps` — dependencias externas que disparan un nuevo fetch (ej. [usuario.id]).
export function useAsyncData(fn, deps = []) {
    const [data,     setData]     = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error,    setError]    = useState(false);
    const [reintento, setReintento] = useState(0);

    useEffect(() => {
        let activo = true;
        setCargando(true);
        setError(false);
        fn()
            .then(d  => { if (activo) setData(d); })
            .catch(() => { if (activo) setError(true); })
            .finally(() => { if (activo) setCargando(false); });
        return () => { activo = false; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [...deps, reintento]);

    return {
        data,
        setData,
        cargando,
        error,
        reintentar: () => setReintento(r => r + 1),
    };
}
