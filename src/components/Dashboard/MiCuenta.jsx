// ─────────────────────────────────────────────────────────────────────────────
// MiCuenta.jsx
//
// Tab "Mi cuenta" del Dashboard.
// Permite al usuario ver y editar su perfil de WordPress desde la app React.
//
// Se divide en tres cards independientes para que un error en una
// no afecte a las otras:
//   1. Datos personales → nombre, apellido, email, bio
//   2. Avatar           → muestra Gravatar; redirige a gravatar.com para cambiarlo
//   3. Contraseña       → cambia la contraseña con validación en cliente
//
// Flujo de guardado:
//   Usuario edita campo → pulsa "Guardar" → PUT /wp/v2/users/:id →
//   WordPress actualiza → actualizarDatos() sincroniza la sesión activa
//   (para que el banner "Bienvenido, X" refleje el nuevo nombre)
//
// Props recibidas:
//   usuario → objeto de sesión de AuthContext (id, nombre, email…)
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";

// actualizarDatos → actualiza el objeto de sesión en localStorage y en el estado
// sin cerrar sesión (lo usa este componente tras guardar nombre/email/password)
import { useAuth } from "../../context/AuthContext";

// showToast → muestra confirmaciones transitorias de éxito en la esquina
// de la pantalla sin necesitar estado local de éxito en este componente.
// Los errores de validación y de API siguen siendo inline (guían la corrección).
import { useToast } from "../../context/ToastContext";

// obtenerUsuario  → GET /wp/v2/users/:id → carga first_name, last_name, email…
// actualizarUsuario → PUT /wp/v2/users/:id → guarda los cambios en WordPress
import { obtenerUsuario, actualizarUsuario } from "../../api";

import "./MiCuenta.css";
import "../../App.css"; // .apiErrorCard, .apiErrorIcon, etc.

// ─────────────────────────────────────────────────────────────────────────────
function MiCuenta({ usuario }) {
  // Leemos solo actualizarDatos del contexto — el objeto usuario ya
  // viene como prop desde Dashboard para no llamar a useAuth dos veces
  const { actualizarDatos } = useAuth();
  const { showToast }       = useToast();

  // ── Estado: campos de datos personales ──────────────────────────────────
  // Se inicializan vacíos y se rellenan cuando llega la respuesta de la API
  // Pre-rellenar con datos del contexto de sesión para mostrar algo
  // mientras carga la API, y como fallback si la API falla.
  const nombrePartes = (usuario.nombre || "").trim().split(" ");
  const [firstName,   setFirstName]   = useState(nombrePartes[0] || "");
  const [lastName,    setLastName]    = useState(nombrePartes.slice(1).join(" ") || "");
  const [email,       setEmail]       = useState(usuario.email || "");
  const [descripcion, setDescripcion] = useState("");
  const [avatarUrl,   setAvatarUrl]   = useState("");

  // Estados de carga/error para la sección de datos personales.
  // exitoDatos ya no existe: el feedback de éxito lo maneja showToast().
  const [cargandoPerfil, setCargandoPerfil] = useState(true);
  const [reintento,      setReintento]      = useState(0);
  const [guardandoDatos, setGuardandoDatos] = useState(false);
  const [errorDatos,     setErrorDatos]     = useState("");

  // ── Estado: campos de contraseña ─────────────────────────────────────────
  // exitoPass ya no existe: el feedback de éxito lo maneja showToast().
  // errorPass sigue siendo inline porque incluye mensajes de validación
  // ("mínimo 8 caracteres") que deben quedar pegados al campo.
  const [nuevaPassword,     setNuevaPassword]     = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [guardandoPass,     setGuardandoPass]     = useState(false);
  const [errorPass,         setErrorPass]         = useState("");

  // ── Carga del perfil (inicial + reintentos) ──────────────────────────────
  // Se re-ejecuta cuando cambia usuario.id (no ocurre) o cuando el usuario
  // pulsa "Reintentar" (incrementa `reintento`).
  // `activo` previene setState si el componente se desmontó mientras la
  // petición estaba en vuelo — evita el warning de React y posibles leaks.
  useEffect(() => {
    let activo = true;
    setCargandoPerfil(true);
    setErrorCarga(false);

    obtenerUsuario(usuario.id)
      .then(data => {
        if (!activo) return;
        // avatar_urls["96"] → Gravatar en resolución 96×96 px
        setFirstName(data.first_name      || "");
        setLastName(data.last_name        || "");
        setEmail(data.email               || "");
        setDescripcion(data.description   || "");
        setAvatarUrl(data.avatar_urls?.["96"] || "");
      })
      .catch(() => { /* Si falla la API el form igual se muestra con datos de sesión */ })
      .finally(() => { if (activo) setCargandoPerfil(false); });

    return () => { activo = false; };
  }, [usuario.id, reintento]);

  // ── Handler: guardar datos personales ────────────────────────────────────
  const handleGuardarDatos = async (e) => {
    e.preventDefault();
    setGuardandoDatos(true);
    setErrorDatos("");

    try {
      // Enviamos todos los campos juntos en una sola petición PUT
      const updated = await actualizarUsuario(usuario.id, {
        first_name:  firstName,
        last_name:   lastName,
        email,
        description: descripcion,
        // "name" es el display name que WordPress muestra públicamente.
        // Lo construimos uniendo nombre y apellido; si ambos están vacíos
        // dejamos el nombre solo para que nunca quede en blanco.
        name: [firstName, lastName].filter(Boolean).join(" ") || firstName,
      });

      // Sincronizamos la sesión activa con el nuevo nombre y email
      // para que el banner del Dashboard diga "Bienvenido, Nombre Nuevo"
      actualizarDatos({
        nombre: updated.name,
        email:  updated.email,
      });

      showToast("Datos guardados correctamente.", "exito");
    } catch (err) {
      // err.response?.data?.message → mensaje de error de la API de WordPress
      setErrorDatos(err.response?.data?.message || "No se pudieron guardar los cambios.");
    } finally {
      setGuardandoDatos(false);
    }
  };

  // ── Handler: cambiar contraseña ──────────────────────────────────────────
  const handleCambiarPassword = async (e) => {
    e.preventDefault();
    setErrorPass("");

    // Validaciones en cliente antes de llamar a la API
    if (nuevaPassword.length < 8) {
      setErrorPass("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (nuevaPassword !== confirmarPassword) {
      setErrorPass("Las contraseñas no coinciden.");
      return;
    }

    setGuardandoPass(true);
    try {
      // WordPress acepta el campo "password" en el mismo endpoint PUT /users/:id
      await actualizarUsuario(usuario.id, { password: nuevaPassword });

      // Limpiamos los campos para no dejar la contraseña visible en pantalla
      setNuevaPassword("");
      setConfirmarPassword("");
      showToast("Contraseña actualizada correctamente.", "exito");
    } catch (err) {
      setErrorPass(err.response?.data?.message || "No se pudo cambiar la contraseña.");
    } finally {
      setGuardandoPass(false);
    }
  };


  // ── Renderizado condicional: cargando ────────────────────────────────────
  if (cargandoPerfil) return (
    <p style={{ fontFamily: "Mulish", color: "#6e6e73", paddingTop: 20 }}>
      Cargando tu perfil...
    </p>
  );

  // El error de carga ya no bloquea — el form se muestra con datos del contexto.

  // Inicial para el placeholder del avatar cuando no hay Gravatar
  const inicialAvatar = (firstName?.[0] || usuario.nombre?.[0] || "?").toUpperCase();

  // ── Renderizado principal ────────────────────────────────────────────────
  return (
    <div className="miCuentaGrid">

      {/* ════════════════════════════════════════════
          CARD 1: Datos personales
          ════════════════════════════════════════════ */}
      <div className="miCuentaCard">
        <h3 className="miCuentaCardTitle">Datos personales</h3>

        {/* onSubmit delega en handleGuardarDatos para validar antes de llamar la API */}
        <form onSubmit={handleGuardarDatos}>

          {/* Fila de dos columnas: nombre y apellido lado a lado */}
          <div className="miCuentaRow">
            <div className="miCuentaField">
              <label className="miCuentaLabel">Nombre</label>
              <input
                className="miCuentaInput"
                type="text"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                placeholder="Tu nombre"
              />
            </div>
            <div className="miCuentaField">
              <label className="miCuentaLabel">Apellido</label>
              <input
                className="miCuentaInput"
                type="text"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                placeholder="Tu apellido"
              />
            </div>
          </div>

          <div className="miCuentaField">
            <label className="miCuentaLabel">Correo electrónico</label>
            <input
              className="miCuentaInput"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="tu@email.com"
            />
          </div>

          <div className="miCuentaField">
            <label className="miCuentaLabel">Sobre mí</label>
            {/* textarea para texto largo — la clase miCuentaTextarea añade min-height */}
            <textarea
              className="miCuentaInput miCuentaTextarea"
              value={descripcion}
              onChange={e => setDescripcion(e.target.value)}
              placeholder="Cuéntanos un poco sobre ti..."
              rows={3}
            />
          </div>

          {/* Éxito → toast global. Error de API → inline para que el usuario vea qué falló. */}
          {errorDatos && <p className="miCuentaError">{errorDatos}</p>}

          <button type="submit" className="miCuentaBtn" disabled={guardandoDatos}>
            {guardandoDatos ? "Guardando..." : "Guardar cambios"}
          </button>
        </form>
      </div>

      {/* ════════════════════════════════════════════
          CARD 2: Avatar
          El avatar lo gestiona Gravatar externamente.
          Mostramos la imagen y un enlace a gravatar.com.
          Si no hay Gravatar, mostramos la inicial del nombre.
          ════════════════════════════════════════════ */}
      <div className="miCuentaCard miCuentaAvatarCard">
        <h3 className="miCuentaCardTitle">Avatar</h3>

        {/* Condicional: imagen real de Gravatar vs placeholder con inicial */}
        {avatarUrl
          ? <img src={avatarUrl} alt="Avatar" className="miCuentaAvatar" />
          : <div className="miCuentaAvatarPlaceholder">{inicialAvatar}</div>
        }

        <p className="miCuentaAvatarHint">
          Tu avatar está gestionado por{" "}
          <a
            href="https://gravatar.com"
            target="_blank"
            rel="noreferrer"      // Seguridad: evita que la nueva pestaña acceda a window.opener
            className="miCuentaLink"
          >
            Gravatar
          </a>
          . Regístrate ahí con tu mismo correo para actualizarlo.
        </p>
      </div>

      {/* ════════════════════════════════════════════
          CARD 3: Cambiar contraseña
          Validamos en cliente (largo + coincidencia)
          antes de llamar a la API para evitar peticiones innecesarias.
          ════════════════════════════════════════════ */}
      <div className="miCuentaCard">
        <h3 className="miCuentaCardTitle">Cambiar contraseña</h3>

        <form onSubmit={handleCambiarPassword}>
          <div className="miCuentaField">
            <label className="miCuentaLabel">Nueva contraseña</label>
            <input
              className="miCuentaInput"
              type="password"
              value={nuevaPassword}
              onChange={e => setNuevaPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              autoComplete="new-password" // Evita que el gestor de contraseñas autocomplete aquí
            />
          </div>
          <div className="miCuentaField">
            <label className="miCuentaLabel">Confirmar contraseña</label>
            <input
              className="miCuentaInput"
              type="password"
              value={confirmarPassword}
              onChange={e => setConfirmarPassword(e.target.value)}
              placeholder="Repite la contraseña"
              autoComplete="new-password"
            />
          </div>

          {/* Éxito → toast global. Errores (validación + API) → inline. */}
          {errorPass && <p className="miCuentaError">{errorPass}</p>}

          {/* disabled cuando no hay texto o la petición está en curso */}
          <button
            type="submit"
            className="miCuentaBtn"
            disabled={guardandoPass || !nuevaPassword}
          >
            {guardandoPass ? "Cambiando..." : "Cambiar contraseña"}
          </button>
        </form>
      </div>

    </div>
  );
}

export default MiCuenta;
