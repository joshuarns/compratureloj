import { useState } from "react";
import { Link } from "react-router-dom";
import { createUser } from "../../api";
import './RegisterForm.css';

function RegisterForm() {
  const [formData, setFormData] = useState({
    username:   "",
    email:      "",
    password:   "",
    first_name: "",
    last_name:  "",
  });

  // Controla si el usuario marcó el checkbox de términos
  const [aceptaTerminos, setAceptaTerminos] = useState(false);

  const [message, setMessage] = useState({ text: "", type: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });

    // Doble verificación por si el HTML no bloqueó el envío
    if (!aceptaTerminos) {
      setMessage({ text: "Debes aceptar los Términos y Condiciones para continuar.", type: "error" });
      return;
    }

    try {
      await createUser({
        username:   formData.username,
        email:      formData.email,
        password:   formData.password,
        first_name: formData.first_name,
        last_name:  formData.last_name,
        roles:      ["shop_manager"],
      });

      setMessage({ text: "¡Registro exitoso! Ya puedes iniciar sesión.", type: "success" });
      setFormData({ username: "", email: "", password: "", first_name: "", last_name: "" });
      setAceptaTerminos(false);

    } catch (error) {
      setMessage({
        text: error.response?.data?.message || "Error al registrar usuario.",
        type: "error",
      });
    }
  };

  return (
    <form className="registerForm" onSubmit={handleSubmit}>

      {/* Nombre y apellido en la misma fila */}
      <div className="row">
        <div className="col-6 mb-3">
          <label>Nombre</label>
          <input type="text" name="first_name" value={formData.first_name}
            onChange={handleChange} required placeholder="Tu nombre" />
        </div>
        <div className="col-6 mb-3">
          <label>Apellido</label>
          <input type="text" name="last_name" value={formData.last_name}
            onChange={handleChange} required placeholder="Tu apellido" />
        </div>
      </div>

      <div className="mb-3">
        <label>Usuario</label>
        <input type="text" name="username" value={formData.username}
          onChange={handleChange} required placeholder="Nombre de usuario" />
      </div>

      <div className="mb-3">
        <label>Email</label>
        <input type="email" name="email" value={formData.email}
          onChange={handleChange} required placeholder="email@ejemplo.com" />
      </div>

      <div className="mb-3">
        <label>Contraseña</label>
        <input type="password" name="password" value={formData.password}
          onChange={handleChange} required placeholder="Contraseña segura" />
      </div>

      {/* ── Checkbox de términos y condiciones ── */}
      {/* required en el input impide el envío si no está marcado */}
      <div className="registerTerminos">
        <input
          type="checkbox"
          id="terminos"
          checked={aceptaTerminos}
          onChange={e => setAceptaTerminos(e.target.checked)}
          required
        />
        <label htmlFor="terminos">
          He leído y acepto los{" "}
          {/* Link abre la página en una pestaña nueva para no perder el formulario */}
          <Link to="/terminos-y-condiciones" target="_blank" rel="noopener noreferrer">
            Términos y Condiciones
          </Link>
          {" "}y el{" "}
          <Link to="/aviso-de-privacidad" target="_blank" rel="noopener noreferrer">
            Aviso de Privacidad
          </Link>
        </label>
      </div>

      <button type="submit" className="btnRegister">Crear cuenta</button>

      {message.text && (
        <p className={`registerMessage ${message.type}`}>{message.text}</p>
      )}

    </form>
  );
}

export default RegisterForm;
