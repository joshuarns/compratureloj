import { useEffect } from "react";

// ─────────────────────────────────────────────────────────
// useSEO — hook para actualizar <title> y <meta description>
// en cada página sin necesidad de react-helmet.
//
// Uso:
//   useSEO({ titulo: "Catálogo", descripcion: "Explora nuestros relojes" })
//
// El título resultante será: "Catálogo | Compra Tu Reloj"
// Si titulo es null/undefined, no se toca el <title> actual
// (útil en páginas que carga datos async como el producto único).
//
// Al desmontar el componente se restaura el título base del sitio.
// ─────────────────────────────────────────────────────────

const SITE_NAME = "Compra Tu Reloj";
const DESC_DEFAULT = "Compra y vende relojes de lujo 100% originales en México. Rolex, Omega, Cartier, Audemars Piguet y más.";

// Crea o actualiza un <meta> por su atributo `name` o `property`
function setMetaTag(attr, attrValue, content) {
  let el = document.querySelector(`meta[${attr}="${attrValue}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, attrValue);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

/**
 * @param {object} params
 * @param {string|null} [params.titulo]       Título de la página (sin nombre del sitio)
 * @param {string|null} [params.descripcion]  Descripción para <meta name="description"> y og:description
 */
export function useSEO({ titulo = null, descripcion = null } = {}) {
  useEffect(() => {
    // ── <title> ──────────────────────────────────────────
    if (titulo != null) {
      document.title = `${titulo} | ${SITE_NAME}`;
    }

    const desc = descripcion || DESC_DEFAULT;

    // ── <meta name="description"> ────────────────────────
    setMetaTag("name", "description", desc);

    // ── Open Graph ───────────────────────────────────────
    // og:title y og:description mejoran cómo se ve el sitio
    // al compartirlo en redes sociales o WhatsApp
    if (titulo != null) {
      setMetaTag("property", "og:title", `${titulo} | ${SITE_NAME}`);
    }
    setMetaTag("property", "og:description", desc);
    setMetaTag("property", "og:type", "website");

    // ── Cleanup: restaura el título base al desmontar ────
    return () => {
      document.title = SITE_NAME;
    };
  }, [titulo, descripcion]);
}
