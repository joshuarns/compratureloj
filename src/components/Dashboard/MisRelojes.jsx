import { useState } from "react";
import { Link } from "react-router-dom";
import { getMeta, formatPeso, estadoProductoTexto } from "../../utils/woocommerce";
import { obtenerMisProductos, actualizarProducto, eliminarProducto } from "../../api";
import { useToast } from "../../context/ToastContext";
import { useAsyncData } from "../../hooks/useAsyncData";
import Paginacion from "./Paginacion";

const POR_PAGINA = 8;

export default function MisRelojes({ usuario }) {
    const { showToast } = useToast();
    const { data: relojes, setData: setRelojes, cargando, error, reintentar } = useAsyncData(
        () => obtenerMisProductos(usuario.id),
        [usuario.id]
    );

    const [pagina,        setPagina]        = useState(1);
    const [publicando,    setPublicando]    = useState(null);
    const [eliminando,    setEliminando]    = useState(null);
    const [confirmandoId, setConfirmandoId] = useState(null);

    const togglePublicar = async (reloj) => {
        const nuevoStatus = reloj.status === 'publish' ? 'draft' : 'publish';
        setPublicando(reloj.id);
        try {
            await actualizarProducto(reloj.id, { status: nuevoStatus });
            setRelojes(prev => prev.map(r =>
                r.id === reloj.id ? { ...r, status: nuevoStatus } : r
            ));
        } catch {
            showToast('No se pudo cambiar el estado. Intenta de nuevo.', 'error');
        } finally {
            setPublicando(null);
        }
    };

    const handleEliminar = async (reloj) => {
        if (confirmandoId !== reloj.id) {
            setConfirmandoId(reloj.id);
            return;
        }
        setConfirmandoId(null);
        setEliminando(reloj.id);
        try {
            await eliminarProducto(reloj.id);
            setRelojes(prev => prev.filter(r => r.id !== reloj.id));
            showToast('Reloj eliminado.', 'exito');
        } catch {
            showToast('No se pudo eliminar el reloj. Intenta de nuevo.', 'error');
        } finally {
            setEliminando(null);
        }
    };

    if (error) return (
        <div className="apiErrorCard">
            <div className="apiErrorIcon">⚠️</div>
            <div className="apiErrorBody">
                <p className="apiErrorTitle">No se pudieron cargar tus relojes</p>
                <p className="apiErrorText">Verifica tu conexión e intenta de nuevo.</p>
                <button className="apiErrorRetry" onClick={reintentar}>Reintentar</button>
            </div>
        </div>
    );

    if (cargando) return (
        <p style={{ fontFamily: "Mulish", color: "#6e6e73", paddingTop: 20 }}>
            Cargando tus relojes...
        </p>
    );

    if (relojes.length === 0) return (
        <div className="emptyDashboard">
            <div style={{ fontSize: 48, marginBottom: 16 }}>⌚</div>
            <p>Todavía no has enviado ningún reloj.</p>
            <Link to="/vender-reloj" className="btnSellWatch">Vender mi primer reloj</Link>
        </div>
    );

    const totalPaginas  = Math.ceil(relojes.length / POR_PAGINA);
    const relojesPagina = relojes.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

    return (
        <div className="watchTableCard">
            <table className="watchTable">
                <thead>
                    <tr>
                        <th>Reloj</th>
                        <th>Estado</th>
                        <th className="colPrecio">Precio</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {relojesPagina.map((reloj) => {
                        const marca = getMeta(reloj.meta_data, "marca");
                        return (
                            <tr key={reloj.id}>
                                <td>
                                    <div className="d-flex align-items-center gap-3">
                                        {reloj.images?.length > 0 ? (
                                            <img src={reloj.images[0].src} alt={reloj.name} className="watchThumb" />
                                        ) : (
                                            <div className="watchThumbPlaceholder">⌚</div>
                                        )}
                                        <div>
                                            <p className="watchTableName">{reloj.name}</p>
                                            {marca && <p className="watchTableMarca">{marca}</p>}
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    {reloj.status === 'publish' && reloj.stock_status === 'outofstock' ? (
                                        <span className="statusBadge outofstock">Sin existencia</span>
                                    ) : (
                                        <span className={`statusBadge ${reloj.status}`}>
                                            {estadoProductoTexto[reloj.status] || reloj.status}
                                        </span>
                                    )}
                                </td>
                                <td className="colPrecio">
                                    <span className="watchTablePrice">{formatPeso(reloj.regular_price)}</span>
                                </td>
                                <td>
                                    <div className="dashAcciones">
                                        <Link to={`/producto/${reloj.id}`} className="btnPreviewWatch" target="_blank" rel="noopener noreferrer">
                                            Ver
                                        </Link>
                                        <Link to={`/editar-reloj/${reloj.id}`} className="btnEditWatch">
                                            Editar
                                        </Link>
                                        {usuario.roles?.includes('administrator') && (
                                            <button
                                                className={`btnPublicar ${reloj.status === 'publish' ? 'btnDespublicar' : ''}`}
                                                disabled={publicando === reloj.id}
                                                onClick={() => togglePublicar(reloj)}
                                            >
                                                {publicando === reloj.id ? '...' : reloj.status === 'publish' ? 'Despublicar' : 'Publicar'}
                                            </button>
                                        )}
                                        <button
                                            className={`btnEliminarReloj${confirmandoId === reloj.id ? ' confirmar' : ''}`}
                                            disabled={eliminando === reloj.id}
                                            onClick={() => handleEliminar(reloj)}
                                            title="Eliminar reloj"
                                        >
                                            {eliminando === reloj.id
                                                ? '...'
                                                : confirmandoId === reloj.id
                                                    ? '¿Seguro?'
                                                    : 'Eliminar'}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            <Paginacion paginaActual={pagina} totalPaginas={totalPaginas} onChange={setPagina} />
        </div>
    );
}
