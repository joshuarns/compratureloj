import LoginForm from "../components/LoginForm/LoginForm";
import { useSEO } from "../hooks/useSEO";
import "./auth.css";

function Login() {
  useSEO({ titulo: "Iniciar sesión" });
  return (
    <div className="registerPage">
      <div className="container d-flex justify-content-center">
        <div className="containerNotification text-center">
          <h2 className="mb-2 globalSubTitle22">Iniciar sesión</h2>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}

export default Login;
