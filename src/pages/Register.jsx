import RegisterForm from "../components/RegisterForm/RegisterForm";
import { useSEO } from "../hooks/useSEO";
import "./auth.css";

function Register() {
  useSEO({
    titulo: "Crear cuenta",
    descripcion: "Regístrate en Compra Tu Reloj para publicar y vender tus relojes de lujo.",
  });

  return (
    <div className="registerPage">
      <div className="container d-flex justify-content-center">
        <div className="containerNotification text-center">
          <h2 className="mb-2 globalSubTitle22">Registro</h2>
          <RegisterForm />
        </div>
      </div>
    </div>
  );

}

export default Register;