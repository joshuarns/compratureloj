import { useState, useEffect, useRef } from "react";
import "./InstallPWA.css";

const logo = "/logo192.png";

// ─────────────────────────────────────────────────────────────────────────────
// InstallPWA
//
// Dos flujos según plataforma:
//
//  Android Chrome → captura `beforeinstallprompt`, muestra card con botón
//    "Instalar" que llama a deferredPrompt.prompt() → diálogo nativo del SO.
//
//  iOS Safari / iOS Chrome / otros → card con instrucciones manuales paso a
//    paso (iOS no soporta beforeinstallprompt).
//
// Condiciones para mostrar:
//   - Dispositivo móvil (iOS o Android)
//   - App NO instalada (no display-mode: standalone)
//   - No descartada en los últimos 7 días
// ─────────────────────────────────────────────────────────────────────────────

const STORAGE_KEY  = "ctr_pwa_dismissed";
const DIAS_ESPERAR = 7;

function detectarPlataforma() {
  const ua = navigator.userAgent || "";
  if (/iphone|ipad|ipod/i.test(ua)) {
    return /crios/i.test(ua) ? "ios-chrome" : "ios-safari";
  }
  if (/android/i.test(ua)) {
    if (/firefox|fxios/i.test(ua)) return "android-firefox";
    return "android-chrome"; // Chrome, Samsung Browser, WebView…
  }
  return "other";
}

const PASOS_MANUALES = {
  "ios-safari": [
    { icono: "⬆️", texto: 'Toca el botón "Compartir" en la barra inferior' },
    { icono: "➕", texto: 'Selecciona "Añadir a pantalla de inicio"'        },
    { icono: "✅", texto: 'Toca "Añadir" para confirmar'                    },
  ],
  "ios-chrome": null, // Chrome en iOS no soporta instalación — mostrar aviso especial
  "android-firefox": [
    { icono: "⋮",  texto: 'Toca el menú en la esquina inferior'             },
    { icono: "📲", texto: 'Selecciona "Instalar"'                           },
    { icono: "✅", texto: 'Toca "Añadir" para confirmar'                    },
  ],
};

function InstallPWA() {
  const [visible,  setVisible]  = useState(false);
  // flujo: "native" (Chrome Android con beforeinstallprompt) | { tipo:"manual", pasos }
  const [flujo,    setFlujo]    = useState(null);
  const deferredPrompt          = useRef(null);

  useEffect(() => {
    // Ya instalada → nunca mostrar
    const yaInstalada =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;
    if (yaInstalada) return;

    // Solo mobile
    const esMobile = /iphone|ipad|ipod|android/i.test(navigator.userAgent);
    if (!esMobile) return;

    // Descartada recientemente
    const dismissedAt = localStorage.getItem(STORAGE_KEY);
    if (dismissedAt) {
      const dias = (Date.now() - Number(dismissedAt)) / (1000 * 60 * 60 * 24);
      if (dias < DIAS_ESPERAR) return;
    }

    const plataforma = detectarPlataforma();

    // ── Android Chrome: esperar el evento nativo ──────────────────────────────
    // Chrome solo dispara beforeinstallprompt cuando la PWA cumple todos los
    // criterios de instalabilidad. Capturarlo evita el mini-banner automático
    // y nos permite mostrar nuestra propia UI, llamando .prompt() al hacer click.
    if (plataforma === "android-chrome") {
      const onBeforeInstall = (e) => {
        e.preventDefault();             // suprime el banner automático de Chrome
        deferredPrompt.current = e;     // guardamos el evento para usarlo luego
        setTimeout(() => {
          setFlujo("native");
          setVisible(true);
        }, 2500);
      };
      window.addEventListener("beforeinstallprompt", onBeforeInstall);
      return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
    }

    // ── iOS Chrome: no soporta instalación, mostrar aviso para abrir Safari ──
    if (plataforma === "ios-chrome") {
      const timer = setTimeout(() => {
        setFlujo({ tipo: "ios-chrome-aviso" });
        setVisible(true);
      }, 2500);
      return () => clearTimeout(timer);
    }

    // ── iOS Safari / Firefox / otros: instrucciones manuales ──────────────────
    const pasos = PASOS_MANUALES[plataforma] || PASOS_MANUALES["ios-safari"];
    const timer = setTimeout(() => {
      setFlujo({ tipo: "manual", pasos });
      setVisible(true);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const cerrar = () => {
    localStorage.setItem(STORAGE_KEY, String(Date.now()));
    setVisible(false);
  };

  const instalarNativo = async () => {
    if (!deferredPrompt.current) return;
    deferredPrompt.current.prompt();
    await deferredPrompt.current.userChoice;
    deferredPrompt.current = null;
    cerrar();
  };

  if (!visible || !flujo) return null;

  return (
    <div className="pwaMask" onClick={cerrar}>
      <div className="pwaCard" onClick={e => e.stopPropagation()}>

        {/* Logo */}
        <div className="pwaLogoWrap">
          <img src={logo} alt="Compra Tu Reloj" className="pwaLogo" />
        </div>

        {/* Título */}
        <h2 className="pwaTitle">Instala la app</h2>
        <p className="pwaSubtitle">
          Accede a Compra Tu Reloj directo desde tu pantalla de inicio.
        </p>

        {/* ── Flujo nativo (Android Chrome) ── */}
        {flujo === "native" && (
          <button className="pwaBtnEntendido" onClick={instalarNativo}>
            📲 Añadir a pantalla de inicio
          </button>
        )}

        {/* ── Flujo manual (iOS Safari / Firefox / otros) ── */}
        {flujo?.tipo === "manual" && (
          <>
            <ol className="pwaPasos">
              {flujo.pasos.map((paso, i) => (
                <li key={i} className="pwaPaso">
                  <span className="pwaPasoIcono">{paso.icono}</span>
                  <span className="pwaPasoTexto">{paso.texto}</span>
                </li>
              ))}
            </ol>
            <button className="pwaBtnEntendido" onClick={cerrar}>
              Entendido
            </button>
          </>
        )}

        {/* ── iOS Chrome: redirigir a Safari ── */}
        {flujo?.tipo === "ios-chrome-aviso" && (
          <>
            <p className="pwaAviso">
              Chrome en iPhone no permite instalar apps. Para instalarla sigue estos pasos:
            </p>
            <ol className="pwaPasos">
              <li className="pwaPaso">
                <span className="pwaPasoIcono">🧭</span>
                <span className="pwaPasoTexto">Abre <strong>Safari</strong> y entra a <strong>compratureloj.com.mx</strong></span>
              </li>
              <li className="pwaPaso">
                <span className="pwaPasoIcono">⬆️</span>
                <span className="pwaPasoTexto">Toca el botón <strong>"Compartir"</strong> en la barra inferior</span>
              </li>
              <li className="pwaPaso">
                <span className="pwaPasoIcono">➕</span>
                <span className="pwaPasoTexto">Selecciona <strong>"Añadir a pantalla de inicio"</strong></span>
              </li>
              <li className="pwaPaso">
                <span className="pwaPasoIcono">✅</span>
                <span className="pwaPasoTexto">Toca <strong>"Añadir"</strong> para confirmar</span>
              </li>
            </ol>
            <button className="pwaBtnEntendido" onClick={cerrar}>
              Entendido
            </button>
          </>
        )}

        {/* Cerrar */}
        <button className="pwaBtnCerrar" onClick={cerrar} aria-label="Cerrar">
          ✕
        </button>

      </div>
    </div>
  );
}

export default InstallPWA;
