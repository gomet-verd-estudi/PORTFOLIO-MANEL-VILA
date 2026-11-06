/*
 * Generador estático de manelvila.com
 * -----------------------------------
 * Lee el contenido (assets/js/projects.js + assets/js/gallery.js) y escribe HTML real,
 * indexable y que funciona sin JavaScript, en dos idiomas:
 *
 *   inglés (idioma de inicio)          español
 *   index.html                         es/index.html                    home (carrusel + índice + menú)
 *   about/index.html                   es/about/index.html              about y contacto
 *   projects/<slug>/index.html         es/proyectos/<slug>/index.html   una página por proyecto
 *
 *   proyectos/<slug>/index.html, about.html   redirecciones de las direcciones antiguas (eran en español)
 *   sitemap.xml                                con las dos versiones de cada página
 *
 * Textos de la interfaz: el objeto T de este archivo. Textos de los proyectos: projects.js
 * (español) y su bloque EN (inglés).
 *
 * Uso:  node tools/build.mjs
 * No necesita dependencias. Cloudflare sirve el resultado tal cual (sin build).
 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://manelvila.com';
const TODAY = new Date().toISOString().slice(0, 10);

/* ---------- datos ---------- */
const ctx = { window: {} };
vm.createContext(ctx);
for (const f of ['assets/js/gallery.js', 'assets/js/projects.js']) {
  vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), ctx, { filename: f });
}
const BASE = ctx.window.PROJECTS;
const N = BASE.length;

const PERSON = {
  name: 'Manel Vila',
  email: 'gometverdestudi@gmail.com',
  phone: '+34 684 450 515',
  phoneHref: '+34684450515',
  instagram: 'https://www.instagram.com/gometverdestudi/',
  instagramLabel: '@gometverdestudi',
  studio: 'Gomet Verd Estudi'
};
const COLLABS = ['Jotateam Studio', 'Socis Club', 'T.O.T Studio', 'Domingo Studio', 'D’Matinada'];
const CLIENTS = ['Vintage Palace', '404 Studio', 'Claur Tiles', 'Bernal', 'D’Matinada', 'Orbis Vacui', 'Leo Rizzi', 'Kaniche Pedigree Hot Dogs'];

/* ---------- idiomas ---------- */
const LANG = {
  en: { code: 'en', dir: '', pj: 'projects', locale: 'en_GB', label: 'EN', name: 'English' },
  es: { code: 'es', dir: 'es/', pj: 'proyectos', locale: 'es_ES', label: 'ES', name: 'Español' }
};
const LANGS = ['en', 'es'];

/* Textos de la interfaz */
const T = {
  en: {
    skip: 'Skip to content', nav: 'Main', openMenu: 'Open menu',
    projects: 'Projects', about: 'About', contact: 'Contact',
    job: 'Graphic designer and art director',
    panelAbout: [
      'I’m Manel Vila, a graphic designer and art director. I studied at EASD Valencia, I’m part of Gomet Verd Estudi, and branding is where I’m happiest.',
      'I’ve also worked with Jotateam Studio, Socis Club, T.O.T Studio and Domingo Studio.'
    ],
    readMore: 'Read more →', close: 'Close', index: (n) => `Index · ${n} projects`,
    copy: 'Copy', copyEmail: 'Copy email',
    marquee: 'Always WIPing · Working In Play · Branding · Art direction · Lettering · ',
    ftChips: ['Contact', 'New projects'], ftTitle: ['Got a project', 'in mind?'],
    ftLabels: ['(01) Contact', '(02) Social', '(03) Based in', '(04) Index'],
    top: 'Back to top', member: `Member of ${PERSON.studio}`, footer: 'Footer', language: 'Language',
    igLabel: `Instagram (${PERSON.instagramLabel})`,
    home: {
      title: 'Manel Vila — Graphic design and art direction',
      desc: 'Portfolio of Manel Vila, graphic designer and art director. Branding, art direction and editorial design for Vintage Palace, 404 Studio, Claur Tiles, Bernal and more.',
      h1: 'Manel Vila — graphic designer and art director. Projects',
      featured: 'Featured projects', carousel: 'carousel', all: 'All projects', seeAll: 'See all projects',
      intro: 'Branding first; also art direction, lettering, editorial and motion graphics.', view: 'View project', pause: 'Pause slideshow'
    },
    pj: {
      image: (n, t) => `image ${n} of ${t}`, enlarge: (n, t) => `Enlarge image ${n} of ${t}`,
      cover: 'cover', coverVideo: 'cover video',
      services: 'Services', discipline: 'Discipline', studio: 'Studio', team: 'Team', year: 'Year', design: 'Design',
      pieces: (n) => `${n} pieces`, back: 'Back to projects', aboutPj: 'About the project',
      gallery: (n) => `Gallery · ${n} pieces`, more: 'More projects', next: 'Next project', all: 'All projects',
      lightbox: 'Enlarged gallery', prev: 'Previous', nextImg: 'Next',
      desc: (p) => `${p.name}: ${p.tag}. ${p.short} A project by Manel Vila, graphic designer and art director.`
    },
    ab: {
      title: 'About and contact — Manel Vila',
      desc: 'Manel Vila, graphic designer and art director specialising in branding. Member of Gomet Verd Estudi. Valencia · Barcelona.',
      close: 'Close About and go back',
      tagline: 'Graphic designer and art director. I work between Valencia and Barcelona and I’m part of Gomet Verd Estudi.',
      bio: [
        'I like brands that have something to say. My job is to find that something and give it a shape: an identity, a visual world, a system that works just as well on a poster as on a screen.',
        'I studied at EASD Valencia, and while I’m at ease in every corner of graphic design, what I truly love is branding: understanding what a brand wants to be, finding its own voice and building a system around it that makes it recognisable anywhere. Lettering, editorial and motion come after that, as different ways of telling the same story.',
        'I’m part of Gomet Verd Estudi, an independent branding and art direction studio between Valencia and Barcelona. Every project there starts with a conversation and becomes a game we play together with the client, mixing strategy, storytelling and visual exploration until we reach something you can see, hold or set in motion. Many of the projects in this portfolio were born there.',
        'We’re driven by a simple idea, ALWAYS WIPing (Working In Play): stay curious, question the usual and enjoy the process, because in the end it shows in the result.',
        'I enjoy working in a team and seeing each project through, from the first idea to the last application. If you have one in mind, <a href="#contacto">drop me a line</a>.'
      ],
      labels: { services: 'Services', studio: 'Studio', collabs: 'I’ve also worked with', clients: 'Clients', education: 'Education', contact: 'Contact', time: 'Local time' },
      services: ['Brand identity', 'Art direction', 'Lettering', 'Typography', 'Packaging', 'Editorial', 'Posters', 'Social media', 'Motion graphics', '3D'],
      education: 'EASD Valencia — School of Art and Design'
    }
  },
  es: {
    skip: 'Saltar al contenido', nav: 'Principal', openMenu: 'Abrir menú',
    projects: 'Proyectos', about: 'About', contact: 'Contacto',
    job: 'Diseñador gráfico y director de arte',
    panelAbout: [
      'Soy Manel Vila, diseñador gráfico y director de arte. Estudié en la EASD de Valencia, formo parte de Gomet Verd Estudi y donde más disfruto es en el branding.',
      'También he trabajado con Jotateam Studio, Socis Club, T.O.T Studio y Domingo Studio.'
    ],
    readMore: 'Leer más →', close: 'Cerrar', index: (n) => `Índice · ${n} proyectos`,
    copy: 'Copiar', copyEmail: 'Copiar email',
    marquee: 'Always WIPing · Working In Play · Branding · Dirección de arte · Lettering · ',
    ftChips: ['Contacto', 'Nuevos proyectos'], ftTitle: ['¿Tienes un proyecto', 'en mente?'],
    ftLabels: ['(01) Contacto', '(02) Redes', '(03) Base', '(04) Índice'],
    top: 'Volver arriba', member: `Miembro de ${PERSON.studio}`, footer: 'Pie de página', language: 'Idioma',
    igLabel: `Instagram (${PERSON.instagramLabel})`,
    home: {
      title: 'Manel Vila — Diseño gráfico y dirección de arte',
      desc: 'Portfolio de Manel Vila, diseñador gráfico y director de arte. Branding, dirección de arte y editorial para Vintage Palace, 404 Studio, Claur Tiles, Bernal y más.',
      h1: 'Manel Vila — diseñador gráfico y director de arte. Proyectos',
      featured: 'Proyectos destacados', carousel: 'carrusel', all: 'Todos los proyectos', seeAll: 'Ver todos los proyectos',
      intro: 'Branding ante todo; también dirección de arte, lettering, editorial y motion graphics.', view: 'Ver proyecto', pause: 'Pausar pase automático'
    },
    pj: {
      image: (n, t) => `imagen ${n} de ${t}`, enlarge: (n, t) => `Ampliar imagen ${n} de ${t}`,
      cover: 'portada', coverVideo: 'vídeo de portada',
      services: 'Servicios', discipline: 'Disciplina', studio: 'Estudio', team: 'Equipo', year: 'Año', design: 'Diseño',
      pieces: (n) => `${n} piezas`, back: 'Volver a los proyectos', aboutPj: 'Sobre el proyecto',
      gallery: (n) => `Galería · ${n} piezas`, more: 'Más proyectos', next: 'Siguiente proyecto', all: 'Todos los proyectos',
      lightbox: 'Galería ampliada', prev: 'Anterior', nextImg: 'Siguiente',
      desc: (p) => `${p.name}: ${p.tag}. ${p.short} Proyecto de Manel Vila, diseñador gráfico y director de arte.`
    },
    ab: {
      title: 'About y contacto — Manel Vila',
      desc: 'Manel Vila, diseñador gráfico y director de arte especializado en branding. Miembro de Gomet Verd Estudi. Valencia · Barcelona.',
      close: 'Cerrar About y volver',
      tagline: 'Diseñador gráfico y director de arte. Trabajo entre Valencia y Barcelona y formo parte de Gomet Verd Estudi.',
      bio: [
        'Me gustan las marcas que tienen algo que contar. Mi trabajo consiste en encontrar ese algo y darle forma: una identidad, un universo visual, un sistema que funcione igual de bien en un cartel que en una pantalla.',
        'Estudié en la EASD de Valencia y, aunque me muevo con soltura por cualquier rama del diseño gráfico, lo que de verdad me apasiona es el branding: entender qué quiere ser una marca, encontrarle una voz propia y construir a su alrededor un sistema que la haga reconocible en cualquier sitio. El lettering, la editorial o el motion vienen después, como maneras distintas de contar esa misma historia.',
        'Formo parte de Gomet Verd Estudi, un estudio independiente de branding y dirección de arte entre Valencia y Barcelona. Allí cada proyecto empieza con una conversación y acaba siendo un juego compartido con quien nos lo encarga: mezclamos estrategia, narrativa y exploración visual hasta llegar a algo que se pueda ver, tocar o poner en movimiento. Muchos de los trabajos de este portfolio nacieron ahí.',
        'Nos mueve una idea sencilla, ALWAYS WIPing (Working In Play): seguir siendo curiosos, cuestionar lo de siempre y disfrutar del proceso, porque al final se nota en el resultado.',
        'Me gusta trabajar en equipo y acompañar cada proyecto de principio a fin, de la primera idea a la última aplicación. Si tienes uno entre manos, <a href="#contacto">escríbeme</a>.'
      ],
      labels: { services: 'Servicios', studio: 'Estudio', collabs: 'También he trabajado con', clients: 'Clientes', education: 'Formación', contact: 'Contacto', time: 'Hora local' },
      services: ['Identidad corporativa', 'Dirección de arte', 'Lettering', 'Tipografía', 'Packaging', 'Editorial', 'Cartelería', 'RRSS', 'Motion graphics', '3D'],
      education: 'EASD — Escuela de Arte Superior de Diseño de Valencia'
    }
  }
};

/* Proyectos con los textos de cada idioma (el bloque `en` de projects.js sobrescribe al español) */
const PROJ = { es: BASE, en: BASE.map((p) => ({ ...p, ...(p.en || {}) })) };

/* ---------- rutas ---------- */
const PAGE = {
  home: (lang) => LANG[lang].dir,
  about: (lang) => `${LANG[lang].dir}about/`,
  project: (lang, p) => `${LANG[lang].dir}${LANG[lang].pj}/${p.slug}/`
};
/** Prefijo hasta la raíz del sitio (para estilos, scripts y medios). */
const up = (page) => '../'.repeat(page.split('/').filter(Boolean).length);
/** Enlace relativo de una página a otra. */
const rel = (from, to) => { const r = path.posix.relative('/' + from, '/' + to); return r ? r + '/' : './'; };

/* ---------- utilidades ---------- */
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const pad = (n) => String(n).padStart(2, '0');
const url = (p) => encodeURI(p);                 // rutas con espacios, tildes, &
const abs = (p) => SITE + '/' + url(p).replace(/^\//, '');
const exists = (p) => fs.existsSync(path.join(ROOT, p));
const small = (p) => { const s = p.replace(/\.jpg$/, '-800.jpg'); return s !== p && exists(s) ? s : null; };
const avifOf = (p) => { const a = p.replace(/\.jpg$/, '.avif'); return a !== p && exists(a) ? a : null; };

/** Dimensiones de un JPEG leyendo su cabecera (sin dependencias). */
const DIMS = {};
function dims(p) {
  if (DIMS[p]) return DIMS[p];
  const b = fs.readFileSync(path.join(ROOT, p));
  let i = 2;
  while (i < b.length) {
    if (b[i] !== 0xff) { i++; continue; }
    const m = b[i + 1], len = b.readUInt16BE(i + 2);
    if ((m >= 0xc0 && m <= 0xc3) || (m >= 0xc5 && m <= 0xc7) || (m >= 0xc9 && m <= 0xcb) || (m >= 0xcd && m <= 0xcf)) {
      return (DIMS[p] = [b.readUInt16BE(i + 7), b.readUInt16BE(i + 5)]);
    }
    i += 2 + len;
  }
  return (DIMS[p] = [1600, 900]);
}

/* Vídeos: variantes AV1 / HEVC / H.264 (tools/videos.py → content/media/manifest.json) */
const VMAN = exists('content/media/manifest.json') ? JSON.parse(fs.readFileSync(path.join(ROOT, 'content/media/manifest.json'), 'utf8')) : {};
const vOf = (p) => VMAN[p] || { h264: p };
const TYPES = { av1: `video/mp4; codecs="av01.0.08M.10"`, hevc: `video/mp4; codecs="hvc1.1.6.L120.90"`, h264: 'video/mp4' };
/** Variantes de un vídeo de la más ligera a la más pesada; H.264 siempre al final como respaldo. */
/*
 * Orden de los vídeos en las páginas: primero HEVC (los navegadores solo lo aceptan si el chip del
 * aparato lo decodifica: va fluido y gasta poca batería) y si no H.264 (lo decodifica el chip de
 * cualquier aparato). AV1 pesa menos, pero muchos móviles lo decodifican con el procesador y eso da
 * tirones; en el carrusel se usa solo donde el aparato lo decodifica bien (main.js).
 */
const ranked = (v) => (v.hevc ? ['hevc'] : []).concat('h264');
function sources(R, p, media = '') {
  const v = vOf(p);
  const mq = media ? ` media="${media}"` : '';
  // El navegador usa el primer <source> que puede reproducir: así recibe el archivo más ligero que soporta
  return ranked(v).map((k) => `<source src="${R}${url(v[k])}" type='${TYPES[k]}'${mq}>`).join('');
}

const thumbOf = (p) => (p.media ? (p.media.type === 'image' ? p.media.src : p.media.poster) : (p.gallery[0] && p.gallery[0][0]));
const plain = (s) => String(s ?? '').replace(/\s+/g, ' ').trim();
const clip = (s, n = 158) => { s = plain(s); return s.length <= n ? s : s.slice(0, s.lastIndexOf(' ', n - 1)) + '…'; };
const write = (rel, html) => {
  const f = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, html.replace(/[ \t]+\n/g, '\n'));
};

/** <picture>: AVIF (completo + 800 px) con respaldo JPG. Las medidas se leen del propio archivo. */
function img(R, src, { alt = '', sizes = '100vw', lazy = true, cls = '', extra = '', priority = false } = {}) {
  const [w, h] = dims(src);
  const s = w > 900 ? small(src) : null;
  const av = avifOf(src), avs = s ? avifOf(s) : null;
  const aset = av ? (avs ? `${R}${url(avs)} 800w, ${R}${url(av)} ${w}w` : `${R}${url(av)}`) : '';
  const jset = s ? ` srcset="${R}${url(s)} 800w, ${R}${url(src)} ${w}w" sizes="${sizes}"` : '';
  const load = priority ? ' fetchpriority="high"' : lazy ? ' loading="lazy"' : '';
  return `<picture>${aset ? `<source type="image/avif" srcset="${aset}"${avs ? ` sizes="${sizes}"` : ''}>` : ''}<img${cls ? ` class="${cls}"` : ''} src="${R}${url(src)}"${jset} width="${w}" height="${h}" alt="${esc(alt)}"${load} decoding="async"${extra}></picture>`;
}

const MARK = '<svg data-mark aria-hidden="true"></svg>';
/** Tamaños de las miniaturas del índice (la portada del proyecto los repite para reutilizar el mismo archivo). */
const TILE_SIZES = '(max-width: 923px) 100vw, 34vw';

/**
 * Contexto de una página: idioma, su ruta, la raíz del sitio (R) y su equivalente en el otro idioma.
 * Todas las piezas reciben este objeto (C) para escribir enlaces y textos correctos.
 */
function page(lang, here, alt) {
  const L = LANG[lang];
  return {
    lang, L, t: T[lang], P: PROJ[lang], here, alt,
    R: up(here),
    to: (target) => rel(here, target),
    home: rel(here, PAGE.home(lang)),
    aboutUrl: rel(here, PAGE.about(lang)),
    pj: (p) => rel(here, PAGE.project(lang, p))
  };
}

/*
 * Páginas preparadas antes del clic (Chrome, Edge): al pasar el ratón por un enlace o al empezar a
 * tocarlo, el navegador carga la página de destino en segundo plano. Al hacer clic aparece al momento
 * y la transición arranca sin esperas y con la portada ya cargada.
 */
const SPECULATION = JSON.stringify({
  prerender: [{
    where: { and: [{ href_matches: '/*' }, { not: { selector_matches: '[target], [download], [href^="mailto:"], [href^="tel:"]' } }] },
    eagerness: 'moderate'
  }]
});

/* ---------- piezas compartidas ---------- */
function head(C, { title, description, image = 'content/posters/og.jpg', type = 'website', jsonld = [], extra = '' }) {
  const { R, L, lang, here, alt } = C;
  const other = LANGS.filter((l) => l !== lang);
  return `<!DOCTYPE html>
<html lang="${lang}" data-root="${R}" data-home="${C.home}" data-pj="${L.pj}/">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <script>/* Llegada con la hoja de papel (si la página anterior salió con ella): ya cubre la página al pintarse */try{var v=sessionStorage.getItem('mv-veil');if(v){document.documentElement.classList.add('is-veiled');if(v==='back')document.documentElement.classList.add('veil-back')}}catch(e){}</script>
  <script type="speculationrules">${SPECULATION}</script>
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <meta name="author" content="${PERSON.name}">
  <meta name="theme-color" content="#0600FF">
  <link rel="canonical" href="${SITE}/${here}">
${LANGS.map((l) => `  <link rel="alternate" hreflang="${l}" href="${SITE}/${alt[l]}">`).join('\n')}
  <link rel="alternate" hreflang="x-default" href="${SITE}/${alt.en}">
  <meta property="og:type" content="${type}">
  <meta property="og:site_name" content="${PERSON.name}">
  <meta property="og:locale" content="${L.locale}">
${other.map((l) => `  <meta property="og:locale:alternate" content="${LANG[l].locale}">`).join('\n')}
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${SITE}/${here}">
  <meta property="og:image" content="${abs(image)}">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="${R}favicon.ico" sizes="32x32">
  <link rel="icon" href="${R}content/uploads/monograma/mv_monograma.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="${R}apple-touch-icon.png">
  <link rel="manifest" href="${R}site.webmanifest">
  <link rel="preload" href="${R}content/src/font/KMR-Waldenburg-Buch.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="${R}assets/css/style.css">
  <script src="${R}assets/js/host.js"></script>
${extra}${jsonld.map((j) => `  <script type="application/ld+json">${JSON.stringify(j)}</script>\n`).join('')}</head>`;
}

/** Menú: la franja con el monograma. `kind` = 'home' | 'about' | 'project'. */
function franja(C, kind) {
  const { t } = C;
  const about = kind === 'home'
    ? `<button class="franja__item" data-panel="about">${t.about}</button>`
    : `<a class="franja__item" href="${C.aboutUrl}"${kind === 'about' ? ' aria-current="page"' : ''}>${t.about}</a>`;
  const contact = kind === 'about'
    ? `<a class="franja__item" href="#contacto" data-close-nav>${t.contact}</a>`
    : `<button class="franja__item" data-panel="contact">${t.contact}</button>`;
  return `
  <a class="skip" href="#contenido">${t.skip}</a>
  <nav class="franja" aria-label="${t.nav}">
    <button class="franja__mark" aria-label="${t.openMenu}" aria-expanded="false" aria-controls="franja-items">${MARK}</button>
    <div class="franja__items" id="franja-items">
      <a class="franja__item franja__name" href="${C.home}">${PERSON.name}</a>
      <button class="franja__item" data-panel="projects">${t.projects}</button>
      ${about}
      ${contact}
    </div>
  </nav>`;
}

function projectList(C, current = -1) {
  const { R } = C;
  return C.P.map((p, i) => {
    const th0 = thumbOf(p);
    const th = th0 ? small(th0) || th0 : '';
    return `
        <a class="plist__row" href="${C.pj(p)}" data-index="${i}"${th ? ` data-thumb="${R}${url(th)}"` : ''}${i === current ? ' aria-current="page"' : ''}>
          <span class="plist__num">${pad(i + 1)}</span>
          <span class="plist__name">${esc(p.name)}</span>
          <span class="plist__tag">${esc(p.tag)}</span>
        </a>`;
  }).join('');
}

const copyable = (t) => `<span class="copyable"><a href="mailto:${PERSON.email}">${PERSON.email}</a><button class="copy" data-copy="${PERSON.email}" aria-label="${t.copyEmail}">${t.copy}</button></span>`;

function panels(C, kind, current = -1) {
  const { t } = C;
  const aboutPanel = kind === 'home' ? `
  <section class="panel" data-panel="about" hidden aria-label="${t.about}" data-lenis-prevent>
    <div class="panel__inner"><div class="panel__pad">
      ${t.panelAbout.map((x) => `<p>${x}</p>`).join('\n      ')}
      <div class="panel__foot"><a class="panel__link" href="${C.aboutUrl}">${t.readMore}</a><button class="panel__close" aria-label="${t.close}">(X)</button></div>
    </div></div>
  </section>` : '';
  const contactPanel = kind === 'about' ? '' : `
  <section class="panel" data-panel="contact" hidden aria-label="${t.contact}" data-lenis-prevent>
    <div class="panel__inner"><div class="panel__pad">
      <div class="contact-list">
        ${copyable(t)}
        <a href="tel:${PERSON.phoneHref}">${PERSON.phone}</a>
        <a href="${PERSON.instagram}" target="_blank" rel="noopener">${PERSON.instagramLabel}</a>
      </div>
      <div class="panel__foot"><span>Valencia · Barcelona</span><button class="panel__close" aria-label="${t.close}">(X)</button></div>
    </div></div>
  </section>`;
  return `
  <section class="panel" data-panel="projects" hidden aria-label="${t.projects}" data-lenis-prevent>
    <div class="panel__inner"><div class="panel__pad">
      <div class="plist">${projectList(C, current)}
      </div>
      <div class="panel__foot"><span>${t.index(pad(N))}</span><button class="panel__close" aria-label="${t.close}">(X)</button></div>
    </div></div>
  </section>${aboutPanel}${contactPanel}`;
}

const personLD = (lang) => ({
  '@type': 'Person',
  '@id': `${SITE}/#manel-vila`,
  name: PERSON.name,
  jobTitle: T[lang].job,
  url: `${SITE}/`,
  email: `mailto:${PERSON.email}`,
  telephone: PERSON.phoneHref,
  image: abs('content/posters/og.jpg'),
  address: { '@type': 'PostalAddress', addressLocality: 'Valencia', addressCountry: 'ES' },
  alumniOf: { '@type': 'CollegeOrUniversity', name: 'Escuela de Arte Superior de Diseño de Valencia (EASD)' },
  memberOf: { '@type': 'Organization', name: PERSON.studio, sameAs: [PERSON.instagram] },
  knowsAbout: lang === 'en'
    ? ['Branding', 'Art direction', 'Lettering', 'Editorial design', 'Typography', 'Motion graphics']
    : ['Branding', 'Dirección de arte', 'Lettering', 'Diseño editorial', 'Tipografía', 'Motion graphics']
});
const websiteLD = (lang) => ({ '@type': 'WebSite', '@id': `${SITE}/#web`, url: `${SITE}/`, name: PERSON.name, inLanguage: ['en', 'es'], author: { '@id': `${SITE}/#manel-vila` } });

/** Cinta que corre (la frase del estudio, repetida). */
const marquee = (text) =>
  `<div class="marquee" aria-hidden="true"><div class="marquee__track">${('<span>' + esc(text) + '</span>').repeat(4)}</div></div>`;

/** Selector de idioma: lleva a la misma página en el otro idioma. */
function langSwitch(C) {
  return `<nav class="ft__lang" aria-label="${C.t.language} · ${C.lang === 'en' ? 'Idioma' : 'Language'}">
        ${LANGS.map((l) => {
          const cur = l === C.lang;
          return `<a href="${C.to(C.alt[l])}" hreflang="${l}" lang="${l}" data-lang="${l}"${cur ? ' aria-current="true"' : ''} title="${LANG[l].name}">${LANG[l].label}</a>`;
        }).join('')}
      </nav>`;
}

/**
 * Footer editorial (común a proyectos, About y el final del índice):
 * cinta · llamada a contactar (opcional) · columnas numeradas · nombre a sangre · colofón con el selector de idioma.
 */
function footer(C, { cta = true, kind = '' } = {}) {
  const { t } = C;
  const year = TODAY.slice(0, 4);
  return `
  <footer class="ft" aria-label="${t.footer}">
    ${marquee(t.marquee)}
    ${cta ? `<div class="ft__cta">
      <p class="chips ft__chips"><span class="chip chip--num">✶</span><span class="chip">${t.ftChips[0]}</span><span class="chip chip--round">${t.ftChips[1]}</span></p>
      <h2 class="ft__title" data-reveal>${t.ftTitle.map((x) => `<span class="mask"><span>${x}</span></span>`).join('')}</h2>
      <a class="ft__mail" href="mailto:${PERSON.email}"><span>${PERSON.email}</span><span aria-hidden="true">↗</span></a>
    </div>` : ''}
    <div class="ft__cols">
      <section class="ft__col">
        <h2 class="ft__label">${t.ftLabels[0]}</h2>
        ${copyable(t)}
        <a href="tel:${PERSON.phoneHref}">${PERSON.phone}</a>
      </section>
      <section class="ft__col">
        <h2 class="ft__label">${t.ftLabels[1]}</h2>
        <a href="${PERSON.instagram}" target="_blank" rel="noopener">Instagram <span aria-hidden="true">↗</span></a>
        <span class="ft__muted">${PERSON.instagramLabel}</span>
      </section>
      <section class="ft__col">
        <h2 class="ft__label">${t.ftLabels[2]}</h2>
        <span>Valencia · Barcelona</span>
        <span class="ft__muted">Valencia <time class="ft__clock" data-clock>CET</time></span>
      </section>
      <section class="ft__col">
        <h2 class="ft__label">${t.ftLabels[3]}</h2>
        <a href="${C.home}?grid"${kind === 'grid' ? ' aria-current="page"' : ''}>${t.projects} <sup>${pad(N)}</sup></a>
        <a href="${C.aboutUrl}"${kind === 'about' ? ' aria-current="page"' : ''}>${t.about}</a>
        <button class="ft__top" data-top>${t.top} <span aria-hidden="true">↑</span></button>
      </section>
    </div>
    <p class="ft__name" data-reveal aria-hidden="true"><span class="mask"><span>[Manel Vila]</span></span></p>
    <div class="ft__legal">
      <span>© ${year} ${PERSON.name}</span>
      <span>${t.member}</span>
      <span>Always WIPing [Working In Play]</span>
      ${langSwitch(C)}
    </div>
  </footer>`;
}

/**
 * Esquinas: la interfaz vive en las cuatro esquinas. Arriba, el monograma y el botón grid;
 * abajo, a la izquierda un dato (email o el proyecto y su pieza) y a la derecha Instagram.
 */
function corners(C, left = `<a class="corner corner--l" href="mailto:${PERSON.email}">Email</a>`) {
  return `
  <div class="corners">
    ${left}
    <a class="corner corner--r" href="${PERSON.instagram}" target="_blank" rel="noopener" aria-label="${C.t.igLabel}">IG <span aria-hidden="true">↗</span></a>
  </div>`;
}

/** Ficha etiqueta / valor: una línea por dato, sin viñetas. rows = [[etiqueta, [valores] | html, attrs]] */
const kv = (rows, attrs = '') => `<dl class="kv"${attrs}>
          ${rows.map(([k, v, a = '']) => `<div class="kv__row"${a}><dt>${k}</dt><dd>${Array.isArray(v) ? v.map((x) => `<span>${x}</span>`).join('') : v}</dd></div>`).join('\n          ')}
        </dl>`;

const scripts = (R, list) => list.map((s) => `  <script src="${R}assets/js/${s}.js"></script>`).join('\n');

/* ---------- HOME ---------- */
function home(lang) {
  const C = page(lang, PAGE.home(lang), { en: PAGE.home('en'), es: PAGE.home('es') });
  const { R, t, P } = C;
  const tiles = P.map((p, i) => {
    const th = thumbOf(p);
    const vis = th
      ? img(R, th, { alt: '', sizes: TILE_SIZES })
      : `<span class="cover"><span class="cover__title">[${esc(p.name)}]</span></span>`;
    return `
      <a class="tile" href="${C.pj(p)}" data-index="${i}" style="--i:${i}">
        <span class="tile__media"${p.media && p.media.bg ? ` style="--bg:${p.media.bg}"` : ''}>${vis}</span>
        <span class="tile__cap"><span class="tile__num">${pad(i + 1)}</span><span class="tile__name">${esc(p.name)}</span><span class="tile__tag">${esc(p.tag)}</span></span>
      </a>`;
  }).join('');
  const first = P[0].media || {};
  const lcp = first.poster || (first.type === 'image' ? first.src : '');
  return `${head(C, {
    title: t.home.title,
    description: t.home.desc,
    jsonld: [{ '@context': 'https://schema.org', '@graph': [websiteLD(lang), personLD(lang), {
      '@type': 'ItemList', name: t.projects, itemListElement: P.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE}/${PAGE.project(lang, p)}`, name: p.name }))
    }] }],
    extra: `  <link rel="preload" as="image" href="${R}${url(lcp)}" fetchpriority="high">
  <noscript><style>.grid{position:static;visibility:visible;opacity:1}.tile{opacity:1;transform:none}.track,.info,.grid-btn,.intro{display:none}.home{overflow:auto;height:auto}</style></noscript>\n`
  })}
<body class="home">

  <div class="intro" aria-hidden="true">${MARK}</div>
${franja(C, 'home')}

  <button class="grid-btn" aria-pressed="false">
    <span class="grid-btn__icon" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
    <span class="grid-btn__count">01 / ${pad(N)}</span>
    <span class="sr-only">${t.home.seeAll}</span>
  </button>
${panels(C, 'home')}

  <main id="contenido">
    <h1 class="sr-only">${t.home.h1}</h1>
    <div class="track" id="track" aria-label="${t.home.featured}" aria-roledescription="${t.home.carousel}"></div>
    <nav class="grid" id="grid" aria-label="${t.home.all}">
      <header class="grid__intro">
        <h2 class="grid__title"><span>${t.projects}</span><span>(${pad(N)})</span></h2>
        <p>${t.home.intro}</p>
        <p class="grid__by">${PERSON.name} — ${t.job}</p>
      </header>${tiles}
      ${footer(C, { kind: 'grid' })}
    </nav>
  </main>

  <div class="cursor" aria-hidden="true"><span>${t.home.view}</span></div>
${corners(C)}

  <div class="info">
    <div class="more" id="more"><div class="more__inner"></div></div>
    <div class="tiempos">
      <button class="play" aria-pressed="false" aria-label="${t.home.pause}"></button>
      <div class="progress" id="progress"></div>
    </div>
    <div class="bar">
      <span class="bar__num roll"></span>
      <a class="bar__name roll" href="${C.pj(P[0])}"></a>
      <span class="bar__tag roll"></span>
      <span class="bar__short roll"></span>
      <button class="bar__more" aria-controls="more" aria-expanded="false">+info</button>
    </div>
  </div>

${scripts(R, ['gallery', 'projects', 'media', 'vendor/lenis.min', 'ui', 'main'])}
</body>
</html>
`;
}

/* ---------- PROYECTO ---------- */
function galleryKinds(gal) {
  // Horizontales a sangre; verticales/cuadradas por parejas; si queda una suelta, centrada.
  const kinds = gal.map(([, w, h]) => (w / h >= 1.2 ? 'full' : 'half'));
  kinds.forEach((k, j) => {
    if (k !== 'half') return;
    let a = j; while (a > 0 && kinds[a - 1] !== 'full') a--;
    let z = j; while (z < kinds.length - 1 && kinds[z + 1] !== 'full') z++;
    if ((z - a + 1) % 2 === 1 && j === z) kinds[j] = 'solo';
  });
  // Parejas a sangre: si las dos piezas tienen casi la misma proporción se igualan en alto (sin hueco)
  const flush = kinds.map(() => false);
  let run = [];
  const pair = () => {
    for (let k = 0; k + 1 < run.length; k += 2) {
      const [a, b] = [run[k], run[k + 1]];
      const ra = gal[a][1] / gal[a][2], rb = gal[b][1] / gal[b][2];
      if (Math.abs(ra - rb) / Math.max(ra, rb) < 0.1) flush[a] = flush[b] = true;
    }
    run = [];
  };
  kinds.forEach((k, j) => (k === 'full' ? pair() : run.push(j)));
  pair();
  return { kinds, flush };
}

/** Portada del proyecto: su vídeo/imagen, o la primera pieza de la galería si no tiene. */
const heroOf = (p) => p.media || (p.gallery[0] ? { type: 'image', src: p.gallery[0][0] } : null);

function heroHTML(C, p) {
  const { R, t } = C;
  const m = heroOf(p);
  if (!m) return '';
  const ar = m.ar || (m.type === 'image' ? dims(m.src)[0] / dims(m.src)[1] : 16 / 9);
  // La portada se ve entera, tan grande como quepa en la pantalla, sin recortes ni deformaciones
  // (en móvil con la proporción de su versión vertical, si la tiene)
  const cls = 'pj__hero';
  const style = ` style="--bg:${m.bg || (m.type === 'image' ? 'var(--paper)' : '#000')};--ar:${ar.toFixed(4)};--ar-m:${(m.mobile && m.arMobile ? m.arMobile : ar).toFixed(4)}"`;
  // .pj__media es la caja que viaja entre páginas. Bajo el vídeo va la misma imagen que mostraba la
  // miniatura del índice (mismo archivo, ya en caché): así la portada se ve desde el primer instante.
  if (m.type === 'video') {
    return `<figure class="${cls}"${style}>
      <div class="pj__media">
        ${m.poster ? img(R, m.poster, { alt: '', sizes: TILE_SIZES, lazy: false, cls: 'pj__poster' }) : ''}
        <video muted loop playsinline autoplay preload="metadata" poster="${R}${url(m.poster || '')}" aria-label="${esc(p.name)} — ${t.pj.coverVideo}">
          ${m.mobile ? sources(R, m.mobile, '(max-width: 923px)') : ''}${sources(R, m.src)}
        </video>
      </div>
    </figure>`;
  }
  return `<figure class="${cls}"${style}><div class="pj__media">${img(R, m.src, { alt: `${p.name} — ${t.pj.cover}`, lazy: false, priority: true })}</div></figure>`;
}

function videoData(R, vid) {
  const v = vOf(vid);
  const alts = ranked(v).filter((k) => k !== 'h264').map((k) => `${R}${url(v[k])} ${k}`).join(',');
  return ` data-video="${R}${url(v.h264)}"` + (alts ? ` data-alts="${alts}"` : '');
}

function project(lang, i) {
  const P = PROJ[lang];
  const p = P[i];
  const C = page(lang, PAGE.project(lang, p), { en: PAGE.project('en', p), es: PAGE.project('es', p) });
  const { R, t } = C;
  const nx = P[(i + 1) % N];
  const pv = P[(i - 1 + N) % N];
  const m = heroOf(p) || {};
  const coverKey = m.deck || m.src;
  const gal = p.gallery.filter((e) => !(e[3] && e[3] === coverKey) && e[0] !== (m.type === 'image' ? m.src : ''));
  const { kinds, flush } = galleryKinds(gal);
  const total = gal.length;
  const figs = gal.map(([src, w, h, vid], j) => {
    const alt = `${p.name} — ${t.pj.image(j + 1, total)}`;
    const sizes = kinds[j] === 'full' ? '100vw' : '(max-width: 923px) 100vw, 50vw';
    return `
      <figure class="g g--${kinds[j]}${flush[j] ? ' g--flush' : ''}" data-reveal data-n="${j}">
        <button class="g__open" aria-label="${t.pj.enlarge(j + 1, total)}">${img(R, src, { alt, sizes, extra: vid && exists(vid) ? videoData(R, vid) : '' })}</button>
      </figure>`;
  }).join('');

  const meta = [];
  if (p.services.length) meta.push([t.pj.services, p.services.map(esc)]);
  meta.push([t.pj.discipline, esc(p.tag)]);
  if (p.studio) meta.push([t.pj.studio, esc(p.studio)]);
  if (p.team) meta.push([t.pj.team, esc(p.team)]);
  if (p.year) meta.push([t.pj.year, String(p.year)]);
  meta.push([t.pj.design, PERSON.name]);

  const desc = p.long ? clip(p.long) : t.pj.desc(p);
  const imgs = [thumbOf(p), ...gal.slice(0, 5).map((e) => e[0])].filter(Boolean);
  const nxThumb = thumbOf(nx);
  // Esquina inferior izquierda: el proyecto y la pieza que se está viendo (la actualiza project.js)
  const info = `<p class="corner corner--l corner--info" aria-hidden="true"><span class="corner__name">${esc(p.name)}</span><span data-count>${total ? t.pj.pieces(pad(total)) : esc(p.tag)}</span></p>`;

  const heroPoster = m.type === 'video' ? m.poster : null;
  return `${head(C, {
    title: `${p.name} — ${p.tag} · ${PERSON.name}`,
    description: desc,
    image: thumbOf(p) || 'content/posters/og.jpg',
    type: 'article',
    extra: heroPoster ? `  <link rel="preload" as="image" href="${R}${url(heroPoster)}" fetchpriority="high">\n` : '',
    jsonld: [{ '@context': 'https://schema.org', '@graph': [
      {
        '@type': 'CreativeWork',
        '@id': `${SITE}/${C.here}#work`,
        name: p.name,
        headline: p.name,
        description: plain(p.long || p.short),
        genre: p.tag,
        keywords: p.services.join(', '),
        url: `${SITE}/${C.here}`,
        image: imgs.map(abs),
        inLanguage: lang,
        creator: { '@id': `${SITE}/#manel-vila` },
        ...(p.studio ? { producer: { '@type': 'Organization', name: p.studio } } : {}),
        ...(p.year ? { dateCreated: String(p.year) } : {}),
        isPartOf: { '@id': `${SITE}/#web` }
      },
      { ...personLD(lang) },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: t.projects, item: `${SITE}/${PAGE.home(lang)}` },
          { '@type': 'ListItem', position: 2, name: p.name, item: `${SITE}/${C.here}` }
        ]
      }
    ] }]
  })}
<body class="project" data-index="${i}" data-slug="${p.slug}">
  <div class="readbar" aria-hidden="true"></div>
${franja(C, 'project')}

  <a class="grid-btn pj__back" href="${C.home}#${p.slug}" aria-label="${t.pj.back}">
    <span class="grid-btn__icon" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
    <span class="grid-btn__count">${pad(i + 1)} / ${pad(N)}</span>
  </a>
${panels(C, 'project', i)}

  <main id="contenido" class="pj">
    <article>
      ${heroHTML(C, p)}

      <header class="pj__head sheet">
        <h1 class="pj__title">${esc(p.name)}</h1>
        <p class="pj__tag">${esc(p.tag)}</p>
      </header>

      <section class="pj__intro sheet" aria-label="${t.pj.aboutPj}">
        <p class="sheet__text" data-reveal>${esc(p.long || p.short)}</p>
        ${kv(meta, ' data-reveal')}
      </section>

      ${total ? `<section class="pj__gallery" aria-label="${t.pj.gallery(total)}">${figs}
      </section>` : ''}
    </article>

    <nav class="pj__nav" aria-label="${t.pj.more}">
      <a class="pj__next" href="${C.pj(nx)}" rel="next">
        ${nxThumb ? `<span class="pj__next-img"${nx.media && nx.media.bg ? ` style="--bg:${nx.media.bg}"` : ''}>${img(R, nxThumb, { alt: '', sizes: '100vw' })}</span>` : ''}
        <span class="pj__next-cap"><span>${t.pj.next} · ${pad(((i + 1) % N) + 1)}</span><span class="pj__next-title">${esc(nx.name)} <span aria-hidden="true">→</span></span></span>
      </a>
      <div class="pj__pn">
        <a href="${C.pj(pv)}" rel="prev">← ${esc(pv.name)}</a>
        <a href="${C.home}?grid">${t.pj.all}</a>
      </div>
    </nav>
  </main>

${footer(C)}
${corners(C, info)}

  <dialog class="lightbox" aria-label="${t.pj.lightbox}">
    <div class="lightbox__stage"></div>
    <div class="lightbox__bar">
      <span class="lightbox__count"></span>
      <span class="lightbox__nav"><button data-lb="prev" aria-label="${t.pj.prev}">←</button><button data-lb="next" aria-label="${t.pj.nextImg}">→</button></span>
      <button data-lb="close" aria-label="${t.close}">(X)</button>
    </div>
  </dialog>

${scripts(R, ['vendor/lenis.min', 'ui', 'project'])}
</body>
</html>
`;
}

/* ---------- ABOUT ---------- */
function about(lang) {
  const C = page(lang, PAGE.about(lang), { en: PAGE.about('en'), es: PAGE.about('es') });
  const { R, t } = C;
  const a = t.ab;
  const ig = `<a href="${PERSON.instagram}" target="_blank" rel="noopener">${PERSON.instagramLabel} <span aria-hidden="true">↗</span></a>`;
  const rows = [
    [a.labels.services, a.services.map(esc)],
    [a.labels.studio, [PERSON.studio, 'Valencia · Barcelona']],
    [a.labels.collabs, COLLABS.map(esc)],
    [a.labels.clients, CLIENTS.map(esc)],
    [a.labels.education, [esc(a.education)]],
    [a.labels.contact, [
      `<span class="copyable"><a href="mailto:${PERSON.email}">${PERSON.email.replace('@', '<wbr>@')}</a><button class="copy" data-copy="${PERSON.email}" aria-label="${t.copyEmail}">${t.copy}</button></span>`,
      `<a href="tel:${PERSON.phoneHref}">${PERSON.phone}</a>`,
      ig
    ], ' id="contacto"'],
    [a.labels.time, ['Valencia <time data-clock>CET</time>']]
  ];
  return `${head(C, {
    title: a.title,
    description: a.desc,
    type: 'profile',
    jsonld: [{ '@context': 'https://schema.org', '@graph': [
      { '@type': 'ProfilePage', url: `${SITE}/${C.here}`, name: a.title, inLanguage: lang, mainEntity: { '@id': `${SITE}/#manel-vila` } },
      personLD(lang)
    ] }]
  })}
<body class="about">
${franja(C, 'about')}

  <a class="grid-btn" href="${C.home}" data-back aria-label="${a.close}">
    <span class="grid-btn__icon" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
    <span class="grid-btn__count">${t.projects}</span>
  </a>
${panels(C, 'about')}

  <main id="contenido">
    <article class="sheet about__sheet" aria-labelledby="about-title">
      <header class="sheet__head">
        <h1 id="about-title">${PERSON.name}</h1>
        <span>${t.about}</span>
      </header>
      <p class="sheet__tag">${a.tagline}</p>

      <div class="sheet__text" data-reveal>
        ${a.bio.map((x) => `<p>${x}</p>`).join('\n        ')}
      </div>

      ${kv(rows, ' data-reveal')}
    </article>
  </main>
${footer(C, { cta: false, kind: 'about' })}
${corners(C)}

${scripts(R, ['vendor/lenis.min', 'ui'])}
</body>
</html>
`;
}

/* ---------- redirecciones de las direcciones antiguas (la web era solo en español) ---------- */
const redirect = (from, to, title) => { const r = rel(from, to); return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>${esc(title)}</title>
  <link rel="canonical" href="${SITE}/${to}">
  <meta name="robots" content="noindex">
  <meta http-equiv="refresh" content="0; url=${r}">
  <script>location.replace('${r}' + location.search + location.hash);</script>
</head>
<body><a href="${r}">${esc(title)}</a></body>
</html>
`; };

/* ---------- sitemap: cada página con su versión en el otro idioma ---------- */
function sitemapEntry(alt, prio, images = []) {
  const links = LANGS.map((l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${SITE}/${alt[l]}"/>`).join('\n') +
    `\n    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE}/${alt.en}"/>`;
  return LANGS.map((l) => `  <url><loc>${SITE}/${alt[l]}</loc><lastmod>${TODAY}</lastmod><priority>${prio}</priority>
${links}
${images.map((s) => `    <image:image><image:loc>${abs(s)}</image:loc></image:image>`).join('\n')}
  </url>`.replace(/\n\n/g, '\n')).join('\n');
}
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${sitemapEntry({ en: PAGE.home('en'), es: PAGE.home('es') }, '1.0')}
${sitemapEntry({ en: PAGE.about('en'), es: PAGE.about('es') }, '0.7')}
${BASE.map((p) => sitemapEntry({ en: PAGE.project('en', p), es: PAGE.project('es', p) }, '0.8',
  [thumbOf(p), ...p.gallery.map((e) => e[0])].filter(Boolean).slice(0, 30))).join('\n')}
</urlset>
`;

/* ---------- escribir ---------- */
for (const lang of LANGS) {
  write(`${PAGE.home(lang)}index.html`, home(lang));
  write(`${PAGE.about(lang)}index.html`, about(lang));
  PROJ[lang].forEach((p, i) => write(`${PAGE.project(lang, p)}index.html`, project(lang, i)));
}
// Direcciones antiguas → su equivalente en español
write('about.html', redirect('', PAGE.about('es'), `About — ${PERSON.name}`));
BASE.forEach((p) => write(`proyectos/${p.slug}/index.html`, redirect(`proyectos/${p.slug}/`, PAGE.project('es', p), `${p.name} — ${PERSON.name}`)));
write('sitemap.xml', sitemap);

// Vídeos ligeros de las miniaturas del índice (tools/tiles.py): 640×800, ya recortados a 4:5, H.264
const TILEV = Object.fromEntries(BASE.map((p) => [p.slug, `content/media/tiles/${p.slug}.mp4`]).filter(([, f]) => exists(f)));
// Mapa de medios para el navegador: variantes de vídeo y AVIF de las portadas/imágenes usadas por JS
const imgs = {};
for (const p of BASE) {
  const m = p.media || {};
  for (const src of [m.type === 'image' ? m.src : null, m.type === 'image' ? m.mobile : null, m.poster].filter(Boolean)) {
    const [w, h] = dims(src);
    const sm = w > 900 ? small(src) : null;
    imgs[src] = { w, h, avif: avifOf(src), small: sm, smallAvif: sm ? avifOf(sm) : null };
  }
}
write('assets/js/media.js', `/* Generado por tools/build.mjs: variantes AV1/HEVC/H.264 y AVIF. No editar a mano. */
window.MEDIA = ${JSON.stringify({ video: Object.fromEntries(Object.entries(VMAN).filter(([k]) => !k.startsWith('_'))), img: imgs, tile: TILEV })};
`);

// Avisa de rutas que no existen (fotos o vídeos que faltan) y de textos sin traducir
const missing = new Set();
for (const p of BASE) {
  const m = p.media || {};
  [m.src, m.mobile, m.poster, ...p.gallery.map((e) => e[0])].filter(Boolean).forEach((s) => { if (!exists(s)) missing.add(s); });
}
const untranslated = BASE.filter((p) => !p.en || !p.en.short).map((p) => p.slug);
console.log(`ok · ${N} proyectos × ${LANGS.length} idiomas · ${BASE.reduce((a, p) => a + p.gallery.length, 0)} piezas de galería`);
if (missing.size) console.log('faltan:\n  ' + [...missing].join('\n  '));
if (untranslated.length) console.log('sin traducir al inglés: ' + untranslated.join(', '));
