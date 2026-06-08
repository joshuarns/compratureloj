import { useEffect, useState, useRef } from 'react';
import { obtenerResenas } from '../../api';
import { REVIEWS_PRODUCT_ID } from '../../config/constants';
import './CarruselResenas.css';

// ── Tarjeta individual ─────────────────────────────────────
function TarjetaResena({ resena }) {
  return (
    <div className="resenaTarjeta">
      <div className="resenaTarjetaEstrellas">
        {'★'.repeat(resena.rating)}{'☆'.repeat(5 - resena.rating)}
      </div>
      <p className="resenaTarjetaTexto" dangerouslySetInnerHTML={{ __html: resena.review }} />
      <p className="resenaTarjetaAutor">— {resena.reviewer}</p>
    </div>
  );
}

// ── Carrusel principal ────────────────────────────────────
function CarruselResenas() {
  const [resenas, setResenas] = useState([]);
  const [actual, setActual]   = useState(0);
  const intervalRef           = useRef(null);

  const cargar = () => {
    obtenerResenas(REVIEWS_PRODUCT_ID).then(data => {
      setResenas(data);
      setActual(0);
    }).catch(() => {});
  };

  useEffect(() => { cargar(); }, []);

  // Auto-avance cada 5 s
  useEffect(() => {
    if (resenas.length <= 1) return;
    intervalRef.current = setInterval(() => {
      setActual(a => (a + 1) % resenas.length);
    }, 5000);
    return () => clearInterval(intervalRef.current);
  }, [resenas.length]);

  const irA = (idx) => {
    clearInterval(intervalRef.current);
    setActual(idx);
  };

  return (
    <section className="resenasSection">
      <div className="container">

        <div className="resenasHeader">
          <div>
            <h2 className="resenasTitle">Lo que dicen nuestros clientes</h2>
            <p className="resenasSubtitle">Experiencias reales de personas que confían en nosotros.</p>
          </div>
        </div>

        {resenas.length === 0 ? (
          <p className="resenasVacio">Aún no hay reseñas. ¡Sé el primero en compartir tu experiencia!</p>
        ) : (
          <>
            <div className="resenasCarrusel">
              <button
                className="resenasArrow resenasArrowLeft"
                onClick={() => irA((actual - 1 + resenas.length) % resenas.length)}
                aria-label="Anterior"
              >‹</button>

              <div className="resenasTrack">
                <TarjetaResena resena={resenas[actual]} />
              </div>

              <button
                className="resenasArrow resenasArrowRight"
                onClick={() => irA((actual + 1) % resenas.length)}
                aria-label="Siguiente"
              >›</button>
            </div>

            <div className="resenasIndicadores">
              {resenas.map((_, i) => (
                <button
                  key={i}
                  className={`resenaDot${i === actual ? ' activo' : ''}`}
                  onClick={() => irA(i)}
                  aria-label={`Ir a reseña ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}

      </div>
    </section>
  );
}

export default CarruselResenas;
