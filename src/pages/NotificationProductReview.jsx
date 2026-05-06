import watch from '../assets/images/watch.svg';
import "./auth.css";

function NotificationProductReview() {
  return (
    <>
      <div className="container h-600 containerFlex justify-content-center align-items-center">
        <div className="containerNotification text-center">
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <img src={watch} alt="Reloj en revisión" />
          <h2 className="mb-2 globalSubTitle22">Producto en revisión</h2>
          <p className="globalP">Estamos revisando que tu producto cumpla los requisitos solicitados, cuando tu producto este aprobado, podrás visualizarlo en tu dashboard.</p>
        </div>
      </div>
    </>
  );
}

export default NotificationProductReview;