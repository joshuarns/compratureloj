import { Link } from 'react-router-dom';
import FormSellWatch from '../components/FormSellWatch/FormSellWatch';
import CalculadoraVenta from '../components/CalculadoraVenta/CalculadoraVenta';
import { useAuth } from '../context/AuthContext';
import { useSEO } from '../hooks/useSEO';
import '../components/FormSellWatch/FormSellWatch.css';

// ─────────────────────────────────────────────────────────────
// SELLWATCH.JSX
//
// Lógica de acceso:
//   ✅ Con sesión  → muestra el formulario de venta
//   🔒 Sin sesión → muestra la calculadora + tarjeta de login
//
// La calculadora es visible para todos (con o sin sesión)
// para que el visitante pueda simular su ganancia antes de
// decidir si se registra.
// ─────────────────────────────────────────────────────────────

function SellWatch() {
  useSEO({
    titulo: "Vender mi reloj",
    descripcion: "¿Tienes un reloj de lujo? Véndelo con nosotros. Solo aplicamos 15% de comisión. Proceso rápido, seguro y sin complicaciones.",
  });


  // usuario viene del contexto global de autenticación
  // null → no hay sesión activa
  const { usuario } = useAuth();

  return (
    <div className={usuario ? "sellPage" : "sellPageCentered"}>
      <div className="container">

        {usuario ? (

          /* ══════════════════════════════════════════════
             USUARIO AUTENTICADO → formulario de venta
             ══════════════════════════════════════════════ */
          <>
            <div className="sellPageHeader">
              <h1>Vender mi reloj</h1>
              <p>Completa el formulario y nuestro equipo revisará tu reloj antes de publicarlo.</p>
            </div>
            <FormSellWatch />
          </>

        ) : (

          /* ══════════════════════════════════════════════
             USUARIO NO AUTENTICADO
             Layout de 2 columnas:
               Izquierda (col-lg-7) → calculadora
               Derecha  (col-lg-5) → tarjeta de login
             ══════════════════════════════════════════════ */
          <>
            {/* ── Grid de dos columnas (sin encabezado) ── */}
            {/* align-items-stretch → ambas columnas adoptan la misma altura */}
            <div className="row g-4 align-items-stretch">

              {/* Columna izquierda: calculadora */}
              <div className="col-lg-7 d-flex">
                <CalculadoraVenta />
              </div>

              {/* Columna derecha: tarjeta de login */}
              <div className="col-lg-5 d-flex">
                {/* height: 100% + justify-content: center para centrar el contenido verticalmente */}
                <div className="sellCard" style={{ textAlign: "center", padding: "48px 32px", width: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>

                  <div style={{ fontSize: 48, marginBottom: 18 }}>🔐</div>

                  <h2 style={{
                    fontFamily: "'Bai Jamjuree', sans-serif",
                    fontSize: 22,
                    fontWeight: 700,
                    color: "#1d1d1f",
                    marginBottom: 10,
                  }}>
                    Inicia sesión para continuar
                  </h2>

                  <p style={{
                    fontFamily: "Mulish, sans-serif",
                    fontSize: 15,
                    color: "#6e6e73",
                    marginBottom: 32,
                  }}>
                    Para publicar tu reloj necesitas tener una cuenta activa.
                  </p>

                  {/* Botón principal */}
                  <Link to="/login" style={{
                    display: "block",
                    padding: "15px",
                    backgroundColor: "#1c2946",
                    color: "#fff",
                    borderRadius: 30,
                    fontFamily: "'Bai Jamjuree', sans-serif",
                    fontWeight: 600,
                    fontSize: 15,
                    textDecoration: "none",
                    marginBottom: 14,
                  }}>
                    Iniciar sesión
                  </Link>

                  {/* Enlace de registro */}
                  <p style={{ fontFamily: "Mulish, sans-serif", fontSize: 14, color: "#6e6e73", margin: 0 }}>
                    ¿No tienes cuenta?{" "}
                    <Link to="/register" style={{ color: "#1c2946", fontWeight: 600, textDecoration: "none" }}>
                      Regístrate gratis
                    </Link>
                  </p>

                </div>
              </div>

            </div>
          </>
        )}

      </div>
    </div>
  );
}

export default SellWatch;
