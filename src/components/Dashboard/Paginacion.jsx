export default function Paginacion({ paginaActual, totalPaginas, onChange }) {
    if (totalPaginas <= 1) return null;
    return (
        <div className="dashPaginacion">
            <button
                className="dashPagBtn"
                disabled={paginaActual === 1}
                onClick={() => onChange(paginaActual - 1)}
            >
                ‹
            </button>
            {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(n => (
                <button
                    key={n}
                    className={`dashPagBtn${n === paginaActual ? " dashPagActivo" : ""}`}
                    onClick={() => onChange(n)}
                >
                    {n}
                </button>
            ))}
            <button
                className="dashPagBtn"
                disabled={paginaActual === totalPaginas}
                onClick={() => onChange(paginaActual + 1)}
            >
                ›
            </button>
        </div>
    );
}
