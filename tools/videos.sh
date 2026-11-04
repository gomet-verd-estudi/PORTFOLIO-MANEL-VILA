#!/usr/bin/env bash
# Optimiza los vídeos de portada para la web: H.264, sin audio, faststart y peso contenido.
# Los originales no se tocan; las versiones web van a content/media/.
# Uso: bash tools/videos.sh
set -euo pipefail
cd "$(dirname "$0")/.."
U=content/uploads/2024
FV=content/uploads/figma-video
OUT=content/media
mkdir -p "$OUT"
enc() { # origen destino ancho_max [crf]
  local src="$1" dst="$OUT/$2" w="$3" crf="${4:-25}"
  [ -f "$dst" ] && [ "$dst" -nt "$src" ] && { echo "= $2"; return; }
  ffmpeg -v error -y -i "$src" -an -vf "scale='min($w,iw)':-2:flags=lanczos,fps='min(30,source_fps)'" \
    -c:v libx264 -preset slow -crf "$crf" -profile:v high -pix_fmt yuv420p -movflags +faststart "$dst"
  # Si la versión web pesa más que el original (vídeos con mucho grano), se usa el original sin audio
  if [ "$(stat -c%s "$dst")" -gt "$(stat -c%s "$src")" ]; then
    ffmpeg -v error -y -i "$src" -an -c:v copy -movflags +faststart "$dst"
  fi
  printf '+ %-36s %6s -> %6s\n' "$2" "$(du -h "$src" | cut -f1)" "$(du -h "$dst" | cut -f1)"
}
enc "$U/404/404_portada_desktop.mp4"                         404-studio.mp4          1920
enc "$U/404/404_portada_movile.mp4"                          404-studio-movil.mp4    1080
enc "$U/claur/ct-video-inicial.mp4"                          claur-tiles.mp4         1080
enc "$U/leo-rizzi/storie_2_leorizzi_1.mp4"                   leo-rizzi.mp4           720  31
enc "$U/zelandia/zelandia_animación_desktop.mp4"             zelandia-walk.mp4       1920
enc "$U/zelandia/zelandia_animación_acortada.mp4"            zelandia-walk-movil.mp4 1080
enc "$U/way/inflable amorfo FINAL HORIZONTAL_1.mp4"          way.mp4                 1920
enc "$U/way/inflable amorfo FINAL VERTICAL_1.mp4"            way-movil.mp4           1080
enc "$U/tot/sun&snow/S&S_MOBILE_ANIMACION STORIES.mp4"       sun-and-snow.mp4        1080
enc "$U/tot/delta/delta_video_home.mp4"                      delta.mp4               720  28
enc "$U/tot/ponteveccio/PONTEVECCIO_WEB_LOGO_OPTIMIZADO.mp4" pontevecchio.mp4        1920
enc "$U/tot/ponteveccio/PONTEVECCIO_MOBILE_LOGO_OPTIMIZADO.mp4" pontevecchio-movil.mp4 1080
enc "$FV/vintage-palace/01.mp4"                              vintage-palace.mp4      720  28
