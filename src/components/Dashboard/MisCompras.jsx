import { useState } from "react";
import { Link } from "react-router-dom";
import { formatPeso, estadoPedidoTexto, estadoPedidoClase, decodeHtml } from "../../utils/woocommerce";
import { obtenerMisPedidos } from "../../api";
import { useAsyncData } from "../../hooks/useAsyncData";
import Paginacion from "./Paginacion";

const POR_PAGINA = 10;

export default function MisCompras({ usuario }) {
    const { data: pedidos, cargando, error, reintentar } = useAsyncData(
        () => obtenerMisPedidos(usuario.id, usuario.email),
        [usuario.id, usuario.email]
    );

    const [pagina, setPagina] = useState(1);

    if (error) return (
        <div className="apiErrorCard">
            <div className="apiErrorIcon">⚠️</div>
            <div className="apiErrorBody">
                <p className="apiErrorTitle">No se pudieron cargar tus compras</p>
                <p className="apiErrorText">Verifica tu conexión e intenta de nuevo.</p>
                <button className="apiErrorRetry" onClick={reintentar}>Reintentar</button>
            </div>
        </div>
    );

    if (cargando) return (
        <p style={{ fontFamily: "Mulish", color: "#6e6e73", paddingTop: 20 }}>
            Cargando tus compras...
        </p>
    );

    if (pedidos.length === 0) return (
        <div className="emptyDashboard">
            <div style={{ fontSize: 48, marginBottom: 16 }}>🛍</div>
            <p>Aún no tienes compras registradas.</p>
            <Link to="/shop" className="btnSellWatch">Ver relojes</Link>
        </div>
    );

    const totalPaginas  = Math.ceil(pedidos.length / POR_PAGINA);
    const pedidosPagina = pedidos.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

    return (
        <div className="watchTableCard">
            <table className="watchTable">
                <thead>
                    <tr>
                        <th>Pedido</th>
                        <th>Fecha</th>
                        <th>Estado</th>
                        <th className="colPrecio">Total</th>
                    </tr>
                </thead>
                <tbody>
                    {pedidosPagina.map((pedido) => {
                        const fecha = new Date(pedido.date_created).toLocaleDateString("es-MX", {
                            year: "numeric", month: "short", day: "numeric",
                        });
                        return (
                            <tr key={pedido.id}>
                                <td>
                                    <p className="watchTableName">Pedido #{pedido.id}</p>
                                    <p className="watchTableMarca">
                                        {pedido.line_items.map(i => i.name.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')).join(", ")}
                                    </p>
                                </td>
                                <td>
                                    <span style={{ fontFamily: "Mulish", fontSize: 14, color: "#444" }}>
                                        {fecha}
                                    </span>
                                </td>
                                <td>
                                    <span className={estadoPedidoClase[pedido.status] || "statusBadge private"}>
                                        {estadoPedidoTexto[pedido.status] || pedido.status}
                                    </span>
                                </td>
                                <td className="colPrecio">
                                    <span className="watchTablePrice">{formatPeso(pedido.total)}</span>
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
