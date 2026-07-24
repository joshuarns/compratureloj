#!/bin/bash
# Genera el archivo tobowater-kit.zip listo para subir a WordPress/Elementor

KIT_NAME="tobowater-kit"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUTPUT="$SCRIPT_DIR/../${KIT_NAME}.zip"

echo "Empaquetando Template Kit: $KIT_NAME..."

cd "$SCRIPT_DIR"
zip -r "$OUTPUT" . \
  --exclude "*.sh" \
  --exclude ".DS_Store" \
  --exclude "__MACOSX" \
  --exclude "*.zip"

echo ""
echo "✓ Kit generado en: $OUTPUT"
echo ""
echo "Cómo importar en WordPress:"
echo "  1. Ve a Elementor > Kit Library > Upload Kit"
echo "  2. Sube el archivo ${KIT_NAME}.zip"
echo "  3. Aplica el kit en tu página"
echo ""
echo "Placeholders a reemplazar en templates/home.json:"
echo "  {{TOBOWATER_LOGO_URL}}        - Logo principal (color)"
echo "  {{TOBOWATER_LOGO_WHITE_URL}}  - Logo para footer (blanco)"
echo "  {{HERO_BACKGROUND_IMAGE_URL}} - Imagen de fondo del hero"
echo "  {{CTA_BACKGROUND_IMAGE_URL}}  - Imagen de fondo sección CTA"
echo "  {{GALLERY_IMAGE_01..12}}      - 12 fotos para la galería"
echo "  {{BEFORE_IMAGE_URL}}          - Foto alberca ANTES"
echo "  {{AFTER_IMAGE_URL}}           - Foto alberca DESPUÉS"
echo "  {{FACEBOOK_PAGE}}             - Página de Facebook"
echo "  {{INSTAGRAM_HANDLE}}          - Cuenta de Instagram"
echo "  {{YOUTUBE_CHANNEL}}           - Canal de YouTube"
echo "  wa.me/521XXXXXXXXXX           - Número de WhatsApp"
