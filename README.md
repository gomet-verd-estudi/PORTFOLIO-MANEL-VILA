# manelvila.com

Portfolio de Manel Vila, diseñador gráfico y director de arte. Es una web estática: no tiene servidor ni base de datos.

## Estructura

| Ruta | Qué es |
|---|---|
| `index.html` | Home: carrusel de portadas, índice en grid y menú |
| `proyectos/<slug>/` | Una página por proyecto: texto, ficha técnica y galería con visor |
| `about/` | About y contacto |
| `assets/js/projects.js` | **Contenido**: textos, servicios, equipo, estudio y portada de cada proyecto |
| `assets/js/gallery.js` | Galería de cada proyecto, extraída del deck de Figma *Portfolio GVE* |
| `content/media/` | Vídeos optimizados para la web, en AV1, HEVC y H.264 |
| `content/uploads/` | Material original (fotos y vídeos) |

## Cambiar contenido

1. Edita `assets/js/projects.js` (o los textos del about en `tools/build.mjs`).
2. Regenera las páginas: `node tools/build.mjs`. No necesita instalar nada.
3. Si has añadido vídeos o fotos, prepara los medios antes de regenerar:
   - `python3 tools/videos.py` codifica cada vídeo en AV1, HEVC y H.264. El navegador elige el más ligero que puede reproducir: AV1 pesa en torno a un tercio de H.264 con la misma calidad.
   - `python3 tools/images.py` genera las versiones AVIF (60–70 % menos que el JPG) y las de 800 px para móvil.
   - Necesitan `ffmpeg` (con libsvtav1 y libx265) y Pillow 11 o superior.
4. Sube los cambios a `main`. Cloudflare Pages publica manelvila.com automáticamente.

`index.html`, `about/`, `proyectos/` y `sitemap.xml` se generan: no los edites a mano.

## Publicación

Ver [PUBLICAR.md](PUBLICAR.md).
