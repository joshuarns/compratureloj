import { useState } from "react";
import { obtenerTodasResenas, actualizarResena } from "../../api";
import { REVIEWS_PRODUCT_ID } from "../../config/constants";
import { useToast } from "../../context/ToastContext";
import { useAsyncData } from "../../hooks/useAsyncData";

const FILTROS = [
    { value: 'hold',     label: 'Pendientes' },
    { value: 'approved', label: 'Aprobadas'  },
    { value: 'spam',     label: 'Spam'       },
    { value: 'trash',    label: 'Eliminadas' },
];

export default function AdminResenas() {
    const { showToast } = useToast();
    const [filtro,     setFiltro]     = useState('hold');
    const [accionando, setAccionando] = useState(null);

    const { data: resenas, setData: setResenas, cargando, error } = useAsyncData(
        () => obtenerTodasResenas(REVIEWS_PRODUCT_ID, filtro),
        [filtro]
    );

    const cambiarEstado = async (id, nuevoEstado) => {
        setAccionando(id);
        try {
            await actualizarResena(id, nuevoEstado);
            setResenas(prev => prev.filter(r => r.id !== id));
        } catch {
            showToast('No se pudo actualizar la reseña. Intenta de nuevo.', 'error');
        } finally {
            setAccionando(null);
        }
    };

    return (
        <div>
            <div className="adminResenasFiltros">
                {FILTROS.map(f => (
                    <button
                        key={f.value}
                        className={`adminResenasFiltroBtn${filtro === f.value ? ' activo' : ''}`}
                        onClick={() => setFiltro(f.value)}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {error && (
                <div className="apiErrorCard">
                    <div className="apiErrorIcon">⚠️</div>
                    <div className="apiErrorBody">
                        <p className="apiErrorTitle">No se pudieron cargar las reseñas</p>
                    </div>
                </div>
            )}

            {cargando && (
                <p style={{ fontFamily: "Mulish", color: "#6e6e73", paddingTop: 20 }}>
                    Cargando reseñas...
                </p>
            )}

            {!cargando && !error && resenas.length === 0 && (
                <div className="emptyDashboard">
                    <div style={{ fontSize: 48, marginBottom: 16 }}>⭐</div>
                    <p>No hay reseñas en esta categoría.</p>
                </div>
            )}

            {!cargando && !error && resenas.length > 0 && (
                <div className="adminResenasLista">
                    {resenas.map(r => (
                        <div key={r.id} className="adminResenaCard">
                            <div className="adminResenaHeader">
                                <div>
                                    <p className="adminResenaAutor">{r.reviewer}</p>
                                    <p className="adminResenaEmail">{r.reviewer_email}</p>
                                </div>
                                <div className="adminResenaEstrellas">
                                    {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                                </div>
                            </div>
                            <p className="adminResenaTexto" dangerouslySetInnerHTML={{ __html: r.review }} />
                            <p className="adminResenaFecha">
                                {new Date(r.date_created).toLocaleDateString('es-MX', {
                                    year: 'numeric', month: 'short', day: 'numeric',
                                })}
                            </p>
                            <div className="adminResenaAcciones">
                                {filtro !== 'approved' && (
                                    <button
                                        className="adminResenaAprobar"
                                        disabled={accionando === r.id}
                                        onClick={() => cambiarEstado(r.id, 'approved')}
                                    >
                                        {accionando === r.id ? '...' : '✓ Aprobar'}
                                    </button>
                                )}
                                {filtro !== 'spam' && (
                                    <button
                                        className="adminResenaSpam"
                                        disabled={accionando === r.id}
                                        onClick={() => cambiarEstado(r.id, 'spam')}
                                    >
                                        Marcar spam
                                    </button>
                                )}
                                {filtro !== 'trash' && (
                                    <button
                                        className="adminResenaEliminar"
                                        disabled={accionando === r.id}
                                        onClick={() => cambiarEstado(r.id, 'trash')}
                                    >
                                        Eliminar
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
