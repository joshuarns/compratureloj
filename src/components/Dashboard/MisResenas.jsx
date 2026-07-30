import { useState } from "react";
import { crearResena } from "../../api";
import { REVIEWS_PRODUCT_ID } from "../../config/constants";

export default function MisResenas({ usuario }) {
    const [calificacion, setCalificacion] = useState(5);
    const [resena,    setResena]    = useState('');
    const [enviando,  setEnviando]  = useState(false);
    const [enviada,   setEnviada]   = useState(false);
    const [error,     setError]     = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setEnviando(true);
        setError('');
        try {
            await crearResena(REVIEWS_PRODUCT_ID, {
                nombre: usuario.nombre,
                email:  usuario.email,
                resena,
                calificacion,
            });
            setEnviada(true);
            setResena('');
            setCalificacion(5);
        } catch {
            setError('No se pudo enviar tu reseña. Intenta de nuevo.');
        } finally {
            setEnviando(false);
        }
    };

    return (
        <div className="resenasDashCard">
            <h3 className="resenasDashTitulo">Comparte tu experiencia</h3>
            <p className="resenasDashSub">
                ¿Cómo fue tu experiencia comprando o vendiendo en Compra Tu Reloj?
                Tu reseña aparecerá en el inicio del sitio una vez aprobada.
            </p>

            {enviada ? (
                <div className="resenasDashExito">
                    <span style={{ fontSize: 40 }}>⭐</span>
                    <p>¡Gracias, {usuario.nombre}! Tu reseña fue enviada y aparecerá en el sitio una vez que la aprobemos.</p>
                    <button className="resenasDashOtra" onClick={() => setEnviada(false)}>
                        Enviar otra reseña
                    </button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="resenasDashForm">
                    <div className="resenasDashField">
                        <label>Tu calificación</label>
                        <div className="resenasDashEstrellas">
                            {[1, 2, 3, 4, 5].map(n => (
                                <button
                                    type="button"
                                    key={n}
                                    className={`resenasDashEstrella${calificacion >= n ? ' activa' : ''}`}
                                    onClick={() => setCalificacion(n)}
                                >
                                    ★
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="resenasDashField">
                        <label>Tu reseña</label>
                        <textarea
                            required
                            rows={5}
                            placeholder="Cuéntanos tu experiencia comprando o vendiendo relojes con nosotros..."
                            value={resena}
                            onChange={e => setResena(e.target.value)}
                        />
                    </div>

                    {error && <p className="resenasDashError">{error}</p>}

                    <button type="submit" disabled={enviando} className="resenasDashSubmit">
                        {enviando ? 'Enviando...' : 'Publicar reseña'}
                    </button>
                </form>
            )}
        </div>
    );
}
