import { useState } from "react";
import { Link } from "react-router-dom";
import emailjs from "@emailjs/browser";
import { getMeta, formatPeso, decodeHtml } from "../../utils/woocommerce";
import { obtenerProductosPendientes, actualizarProducto, eliminarProducto, obtenerUsuariosPorIds } from "../../api";
import { EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_RELOJ_PUBLICADO, EMAILJS_PUBLIC_KEY } from "../../config/constants";
import { useToast } from "../../context/ToastContext";
import { useAsyncData } from "../../hooks/useAsyncData";

export default function RelojesPendientes() {
    const { showToast } = useToast();

    const { data: relojes, setData: setRelojes, cargando, error, reintentar } = useAsyncData(
        async () => {
            let data = await obtenerProductosPendientes();

            const sinDatos = data.filter(
                p => !getMeta(p.meta_data, 'vendedor_nombre') && getMeta(p.meta_data, 'vendedor_id')
            );

            if (sinDatos.length > 0) {
                const ids      = [...new Set(sinDatos.map(p => getMeta(p.meta_data, 'vendedor_id')))];
                const usuarios = await obtenerUsuariosPorIds(ids).catch(() => []);
                const mapa     = Object.fromEntries(usuarios.map(u => [String(u.id), u]));

                data = data.map(p => {
                    const vid = getMeta(p.meta_data, 'vendedor_id');
                    if (!getMeta(p.meta_data, 'vendedor_nombre') && vid && mapa[vid]) {
                        const u = mapa[vid];
                        return {
                            ...p,
                            meta_data: [
                                ...p.meta_data,
                                { key: 'vendedor_nombre', value: u.name || u.username || '' },
                                { key: 'vendedor_email',  value: u.email || '' },
                            ],
                        };
                    }
                    return p;
                });
            }

            return data;
        },
        []
    );

    const [publicando,    setPublicando]    = useState(null);
    const [eliminando,    setEliminando]    = useState(null);
    const [confirmandoId, setConfirmandoId] = useState(null);

    const publicarReloj = async (reloj) => {
        setPublicando(reloj.id);
        try {
            await actualizarProducto(reloj.id, { status: 'publish' });
            setRelojes(prev => prev.filter(r => r.id !== reloj.id));
            showToast('Reloj publicado correctamente.', 'exito');

            const vendedorEmail  = getMeta(reloj.meta_data, 'vendedor_email');
            const vendedorNombre = getMeta(reloj.meta_data, 'vendedor_nombre');
            if (vendedorEmail) {
                emailjs.send(
                    EMAILJS_SERVICE_ID,
                    EMAILJS_TEMPLATE_RELOJ_PUBLICADO,
                    {
                        to_email:        vendedorEmail,
                        vendedor_nombre: vendedorNombre || vendedorEmail,
                        reloj_nombre:    reloj.name,
                        marca:           getMeta(reloj.meta_data, 'marca')  || '—',
                        modelo:          getMeta(reloj.meta_data, 'modelo') || '—',
                        precio: reloj.regular_price
                            ? `$${Number(reloj.regular_price).toLocaleString('es-MX')}`
                            : '—',
                        fecha: new Date().toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' }),
                    },
                    EMAILJS_PUBLIC_KEY
                ).catch(() => {});
            }
        } catch {
            showToast('No se pudo publicar el reloj. Intenta de nuevo.', 'error');
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
                <p className="apiErrorTitle">No se pudieron cargar los relojes pendientes</p>
                <button className="apiErrorRetry" onClick={reintentar}>Reintentar</button>
            </div>
        </div>
    );

    if (cargando) return (
        <p style={{ fontFamily: "Mulish", color: "#6e6e73", paddingTop: 20 }}>
            Cargando relojes pendientes...
        </p>
    );

    if (relojes.length === 0) return (
        <div className="emptyDashboard">
            <div style={{ fontSize: 48, marginBottom: 16 }}>✓</div>
            <p>No hay relojes pendientes de publicación.</p>
        </div>
    );

    return (
        <div className="watchTableCard">
            <table className="watchTable">
                <thead>
                    <tr>
                        <th>Reloj</th>
                        <th>Vendedor</th>
                        <th className="colPrecio">Precio</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {relojes.map((reloj) => {
                        const marca          = getMeta(reloj.meta_data, 'marca');
                        const vendedorNombre = getMeta(reloj.meta_data, 'vendedor_nombre');
                        const vendedorEmail  = getMeta(reloj.meta_data, 'vendedor_email');
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
                                            <p className="watchTableName" dangerouslySetInnerHTML={{ __html: reloj.name }} />
                                            {marca && <p className="watchTableMarca">{marca}</p>}
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <p className="watchTableName" style={{ fontSize: 14 }}>{vendedorNombre || '—'}</p>
                                    <p className="watchTableMarca">{vendedorEmail || '—'}</p>
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
                                        <button
                                            className="btnPublicar"
                                            disabled={publicando === reloj.id}
                                            onClick={() => publicarReloj(reloj)}
                                        >
                                            {publicando === reloj.id ? '...' : 'Publicar'}
                                        </button>
                                        <button
                                            className={`btnEliminarReloj${confirmandoId === reloj.id ? ' confirmar' : ''}`}
                                            disabled={eliminando === reloj.id}
                                            onClick={() => handleEliminar(reloj)}
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
        </div>
    );
}
