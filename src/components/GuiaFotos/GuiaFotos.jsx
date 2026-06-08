import { useEffect } from 'react';
import guiaImg from '../../assets/images/guia-reloj.jpg';
import './GuiaFotos.css';

function GuiaFotos({ onClose }) {
  // Cerrar con Escape
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div className="guiaOverlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Guía de fotos">
      <div className="guiaModal" onClick={e => e.stopPropagation()}>

        <button className="guiaClose" onClick={onClose} aria-label="Cerrar">✕</button>

        <h2 className="guiaTitulo">Consejos para tomar fotos de calidad</h2>

        <ul className="guiaLista">
          <li>Fotografía el reloj con luz natural y en un entorno claro.</li>
          <li>Fotografía tu reloj desde todos los ángulos importantes.</li>
          <li>Muestra también con transparencia cualquier defecto como arañazos o abolladuras.</li>
        </ul>

        <img
          src={guiaImg}
          alt="Guía de fotografía para relojes"
          className="guiaImagen"
          loading="lazy"
          decoding="async"
        />

      </div>
    </div>
  );
}

export default GuiaFotos;
