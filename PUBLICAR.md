# Publicar manelvila.com

La web es estática: HTML, CSS, JS, fotos y vídeos. No necesita servidor ni base de datos.

## Elección

**Dominio y hosting en Cloudflare.**

- **Dominio** con Cloudflare Registrar: se paga a precio de coste (un .com ronda los 10–11 $/año) y la renovación cuesta lo mismo que el primer año.
- **Hosting** con Cloudflare Pages, en el plan gratuito:
  - Ancho de banda sin límite, importante en una web con tantos vídeos.
  - CDN mundial y HTTPS automático.
  - Se conecta a este repositorio de GitHub y publica sola cada vez que se actualiza `main`.
  - Cada rama tiene su propia URL de vista previa.
  - Límites que cumplimos: 25 MiB por archivo (el mayor pesa 18 MB) y 20.000 archivos.
- **Alternativa sin cuentas nuevas:** GitHub Pages, que ya publica la web en `gomet-verd-estudi.github.io/PORTFOLIO-MANEL-VILA`. También admite dominio propio, aunque tiene un límite orientativo de ancho de banda de 100 GB/mes y no tiene vistas previas por rama.

## Pasos

1. **Fusionar la pull request** de la web nueva en `main`.
2. **Comprar el dominio**: entra en dash.cloudflare.com, crea una cuenta y ve a *Domain Registration → Register Domains*. Busca `manelvila.com` y págalo. Hace falta una tarjeta y los datos del titular.
3. **Crear el sitio**: ve a *Workers & Pages → Create → Pages → Connect to Git*, autoriza GitHub y elige `gomet-verd-estudi/PORTFOLIO-MANEL-VILA`.
   - Production branch: `main`
   - Framework preset: `None`
   - Build command: vacío
   - Build output directory: `/`
4. **Conectar el dominio**: en el proyecto, abre *Custom domains → Set up a custom domain* y añade `manelvila.com`. Luego repite con `www.manelvila.com`. Como el dominio está en Cloudflare, los registros DNS se crean solos y el certificado HTTPS tarda unos minutos.
5. **Redirección (opcional)**: para que `www.manelvila.com` lleve a `manelvila.com`, crea en *Rules → Redirect Rules* una redirección 301 de `www.manelvila.com/*` a `https://manelvila.com/${1}`.

A partir de aquí, cada cambio que se fusione en `main` se publica solo en manelvila.com en uno o dos minutos.

## Archivos de este repositorio relacionados

- `_headers`: caché de fotos y vídeos y cabeceras de seguridad. Lo usa Cloudflare Pages; GitHub Pages lo ignora.
- `_redirects`: redirecciones de direcciones antiguas, como `/about.html` → `/about/`. Solo Cloudflare Pages.
- `404.html`: la página que se muestra cuando una dirección no existe.
- `robots.txt` y `sitemap.xml`: para los buscadores. El sitemap incluye cada proyecto y sus imágenes, y se regenera con `node tools/build.mjs`.
- `site.webmanifest`, `favicon.ico` y `apple-touch-icon.png`: iconos para el navegador y para el móvil.
- `assets/js/host.js`: si alguien entra por la dirección antigua de GitHub Pages, lo lleva a manelvila.com, solo si el dominio responde.
- `content/posters/og.jpg`: la imagen que aparece al compartir el enlace.
