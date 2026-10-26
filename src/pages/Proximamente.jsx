import './Proximamente.css';

export default function Proximamente() {
  return (
    <div className="proximamente">
      <div className="proximamente__inner">
        <div className="proximamente__icon">⌚</div>
        <p className="proximamente__brand">Compra Tu Reloj</p>
        <h1 className="proximamente__titulo">Próximamente</h1>
        <p className="proximamente__sub">
          Estamos preparando algo especial.<br />
          Vuelve pronto.
        </p>
        <div className="proximamente__contacto">
          <a href="mailto:info.compratureloj@gmail.com">info.compratureloj@gmail.com</a>
          <span>·</span>
          <a href="https://wa.link/g5a0s0" target="_blank" rel="noreferrer">WhatsApp</a>
        </div>
      </div>
    </div>
  );
}
