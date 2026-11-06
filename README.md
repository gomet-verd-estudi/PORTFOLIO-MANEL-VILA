# manelvila.com

Portfolio de Manel Vila, diseñador gráfico y director de arte. Es una web estática: no tiene servidor ni base de datos.

## Estructura

| Ruta | Qué es |
|---|---|
| `index.html` | Home en inglés (idioma de inicio): carrusel de portadas, índice en grid y menú |
| `projects/<slug>/` | Una página por proyecto en inglés: texto, ficha técnica y galería con visor |
| `about/` | About y contacto en inglés |
| `es/` | La misma web en español: `es/`, `es/about/`, `es/proyectos/<slug>/` |
| `proyectos/<slug>/`, `about.html` | Redirecciones de las direcciones antiguas a su versión en español |
| `assets/js/projects.js` | **Contenido**: textos, servicios, equipo, estudio y portada de cada proyecto |
| `assets/js/gallery.js` | Galería de cada proyecto, extraída del deck de Figma *Portfolio GVE* |
| `assets/js/vendor/lenis.min.js` | Scroll suave con rueda y trackpad en About, proyectos e índice ([Lenis](https://github.com/darkroomengineering/lenis) 1.3.27, licencia MIT). En móvil el scroll es el nativo |
| `content/media/` | Vídeos optimizados para la web, en AV1, HEVC y H.264 |
| `content/media/tiles/` | Vídeos ligeros de las miniaturas del índice (`tools/tiles.py`) |
| `content/uploads/` | Material original (fotos y vídeos) |

## Cambiar contenido

1. Edita `assets/js/projects.js`: arriba los textos en español; al final, el bloque `EN` con los mismos textos en inglés. Los textos de la interfaz y del About, en los dos idiomas, están en el objeto `T` de `tools/build.mjs` (y los pocos que escribe el JavaScript, al principio de `assets/js/ui.js`).
2. Regenera las páginas: `node tools/build.mjs`. No necesita instalar nada.
3. Si has añadido vídeos o fotos, prepara los medios antes de regenerar:
   - `python3 tools/videos.py` codifica cada vídeo en AV1, HEVC y H.264. El navegador elige el más ligero que puede reproducir: AV1 pesa en torno a un tercio de H.264 con la misma calidad.
   - `python3 tools/images.py` genera las versiones AVIF (60–70 % menos que el JPG) y las de 800 px para móvil.
   - `python3 tools/tiles.py` hace los vídeos ligeros de las miniaturas del índice (640×800, ya recortados a 4:5, H.264): con ellos el grid va fluido también en móvil.
   - Necesitan `ffmpeg` (con libsvtav1 y libx265) y Pillow 11 o superior.
4. Sube los cambios a `main`. Cloudflare Pages publica manelvila.com automáticamente.

`index.html`, `about/`, `projects/`, `es/`, `proyectos/` y `sitemap.xml` se generan: no los edites a mano.

El selector EN | ES del footer lleva a la misma página en el otro idioma. Cada página declara su equivalente (`hreflang`) para que Google muestre la versión correcta a cada persona.

## Publicación

Ver [PUBLICAR.md](PUBLICAR.md).
