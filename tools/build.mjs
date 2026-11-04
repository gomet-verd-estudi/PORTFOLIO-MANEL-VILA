/*
 * Generador estático de manelvila.com
 * -----------------------------------
 * Lee el contenido (assets/js/projects.js + assets/js/gallery.js) y escribe HTML real,
 * indexable y que funciona sin JavaScript:
 *   index.html                 home (carrusel + índice en grid + menú)
 *   proyectos/<slug>/index.html  una página por proyecto
 *   about/index.html           about y contacto
 *   about.html                 redirección de la dirección antigua
 *   sitemap.xml
 *
 * Uso:  node tools/build.mjs
 * No necesita dependencias. Cloudflare Pages sirve el resultado tal cual (sin build).
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
const PROJECTS = ctx.window.PROJECTS;
const N = PROJECTS.length;

const PERSON = {
  name: 'Manel Vila',
  job: 'Diseñador gráfico y director de arte',
  email: 'gometverdestudi@gmail.com',
  phone: '+34 684 450 515',
  phoneHref: '+34684450515',
  instagram: 'https://www.instagram.com/gometverdestudi/',
  instagramLabel: '@gometverdestudi',
  studio: 'Gomet Verd Estudi'
};
const COLLABS = ['Jotateam Studio', 'Socis Club', 'T.O.T Studio', 'Domingo Studio', 'D’Matinada'];
const SERVICES = ['Identidad corporativa', 'Dirección de arte', 'Lettering', 'Tipografía', 'Packaging', 'Editorial', 'Cartelería', 'RRSS', 'Motion graphics', '3D'];
const CLIENTS = ['Vintage Palace', '404 Studio', 'Claur Tiles', 'Bernal', 'D’Matinada', 'Orbis Vacui', 'Leo Rizzi', 'Kaniche Pedigree Hot Dogs'];

/* ---------- utilidades ---------- */
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const pad = (n) => String(n).padStart(2, '0');
const url = (p) => encodeURI(p);                 // rutas con espacios, tildes, &
const abs = (p) => SITE + '/' + url(p).replace(/^\//, '');
const exists = (p) => fs.existsSync(path.join(ROOT, p));
const small = (p) => { const s = p.replace(/\.jpg$/, '-800.jpg'); return s !== p && exists(s) ? s : null; };
const thumbOf = (p) => (p.media ? (p.media.type === 'image' ? p.media.src : p.media.poster) : (p.gallery[0] && p.gallery[0][0]));
const plain = (s) => String(s ?? '').replace(/\s+/g, ' ').trim();
const clip = (s, n = 158) => { s = plain(s); return s.length <= n ? s : s.slice(0, s.lastIndexOf(' ', n - 1)) + '…'; };
const projectPath = (p) => `proyectos/${p.slug}/`;
const write = (rel, html) => {
  const f = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, html.replace(/[ \t]+\n/g, '\n'));
};

/** <img> con srcset si existe la versión ligera (-800). */
function img(R, src, { w, h, alt = '', sizes = '100vw', lazy = true, cls = '', extra = '' } = {}) {
  const s = small(src);
  const set = s && w > 900 ? ` srcset="${R}${url(s)} 800w, ${R}${url(src)} ${w}w" sizes="${sizes}"` : '';
  const dims = w && h ? ` width="${w}" height="${h}"` : '';
  return `<img${cls ? ` class="${cls}"` : ''} src="${R}${url(src)}"${set}${dims} alt="${esc(alt)}"${lazy ? ' loading="lazy"' : ''} decoding="async"${extra}>`;
}

const MARK = '<svg data-mark aria-hidden="true"></svg>';

/* ---------- piezas compartidas ---------- */
function head({ R, title, description, canonical, image = 'content/posters/og.jpg', type = 'website', jsonld = [], extra = '' }) {
  return `<!DOCTYPE html>
<html lang="es" data-root="${R}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <meta name="author" content="${PERSON.name}">
  <meta name="theme-color" content="#0600FF">
  <link rel="canonical" href="${SITE}/${canonical}">
  <meta property="og:type" content="${type}">
  <meta property="og:site_name" content="${PERSON.name}">
  <meta property="og:locale" content="es_ES">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${SITE}/${canonical}">
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

/** Menú: la franja con el monograma. `here` = 'home' | 'about' | 'project'. */
function franja(R, here) {
  const about = here === 'home'
    ? '<button class="franja__item" data-panel="about">About</button>'
    : `<a class="franja__item" href="${R}about/"${here === 'about' ? ' aria-current="page"' : ''}>About</a>`;
  const contact = here === 'about'
    ? '<a class="franja__item" href="#contacto" data-close-nav>Contacto</a>'
    : '<button class="franja__item" data-panel="contact">Contacto</button>';
  return `
  <a class="skip" href="#contenido">Saltar al contenido</a>
  <nav class="franja" aria-label="Principal">
    <button class="franja__mark" aria-label="Abrir menú" aria-expanded="false" aria-controls="franja-items">${MARK}</button>
    <div class="franja__items" id="franja-items">
      <a class="franja__item franja__name" href="${R || './'}">${PERSON.name}</a>
      <button class="franja__item" data-panel="projects">Proyectos</button>
      ${about}
      ${contact}
    </div>
  </nav>`;
}

function projectList(R, current = -1) {
  return PROJECTS.map((p, i) => {
    const t = thumbOf(p);
    const th = t ? small(t) || t : '';
    return `
        <a class="plist__row" href="${R}${projectPath(p)}" data-index="${i}"${th ? ` data-thumb="${R}${url(th)}"` : ''}${i === current ? ' aria-current="page"' : ''}>
          <span class="plist__num">${pad(i + 1)}</span>
          <span class="plist__name">${esc(p.name)}</span>
          <span class="plist__tag">${esc(p.tag)}</span>
        </a>`;
  }).join('');
}

function contactLinks(cls = 'contact-list') {
  return `<div class="${cls}">
        <span class="copyable"><a href="mailto:${PERSON.email}">${PERSON.email}</a><button class="copy" data-copy="${PERSON.email}" aria-label="Copiar email">Copiar</button></span>
        <a href="tel:${PERSON.phoneHref}">${PERSON.phone}</a>
        <a href="${PERSON.instagram}" target="_blank" rel="noopener">${PERSON.instagramLabel}</a>
      </div>`;
}

function panels(R, here, current = -1) {
  const aboutPanel = here === 'home' ? `
  <section class="panel" data-panel="about" hidden aria-label="About">
    <div class="panel__inner"><div class="panel__pad">
      <p>Soy Manel Vila, diseñador gráfico y director de arte, graduado por la EASD de Valencia y miembro de Gomet Verd Estudi. Me he especializado en branding y lettering.</p>
      <p>He colaborado con estudios como Jotateam Studio, Socis Club, T.O.T Studio y Domingo Studio.</p>
      <div class="panel__foot"><a class="panel__link" href="${R}about/">About completo →</a><button class="panel__close" aria-label="Cerrar">(X)</button></div>
    </div></div>
  </section>` : '';
  const contactPanel = here === 'about' ? '' : `
  <section class="panel" data-panel="contact" hidden aria-label="Contacto">
    <div class="panel__inner"><div class="panel__pad">
      ${contactLinks()}
      <div class="panel__foot"><span>Valencia · Barcelona</span><button class="panel__close" aria-label="Cerrar">(X)</button></div>
    </div></div>
  </section>`;
  return `
  <section class="panel" data-panel="projects" hidden aria-label="Proyectos">
    <div class="panel__inner"><div class="panel__pad">
      <div class="plist">${projectList(R, current)}
      </div>
      <div class="panel__foot"><span>Índice · ${pad(N)} proyectos</span><button class="panel__close" aria-label="Cerrar">(X)</button></div>
    </div></div>
  </section>${aboutPanel}${contactPanel}`;
}

const personLD = () => ({
  '@type': 'Person',
  '@id': `${SITE}/#manel-vila`,
  name: PERSON.name,
  jobTitle: PERSON.job,
  url: `${SITE}/`,
  email: `mailto:${PERSON.email}`,
  telephone: PERSON.phoneHref,
  image: abs('content/posters/og.jpg'),
  address: { '@type': 'PostalAddress', addressLocality: 'Valencia', addressCountry: 'ES' },
  alumniOf: { '@type': 'CollegeOrUniversity', name: 'Escuela de Arte Superior de Diseño de Valencia (EASD)' },
  memberOf: { '@type': 'Organization', name: PERSON.studio, sameAs: [PERSON.instagram] },
  knowsAbout: ['Branding', 'Lettering', 'Dirección de arte', 'Diseño editorial', 'Tipografía', 'Motion graphics']
});
const websiteLD = () => ({ '@type': 'WebSite', '@id': `${SITE}/#web`, url: `${SITE}/`, name: PERSON.name, inLanguage: 'es', author: { '@id': `${SITE}/#manel-vila` } });

const scripts = (R, list) => list.map((s) => `  <script src="${R}assets/js/${s}.js"></script>`).join('\n');

/* ---------- HOME ---------- */
function home() {
  const R = '';
  const tiles = PROJECTS.map((p, i) => {
    const t = thumbOf(p);
    const vis = t
      ? img(R, t, { w: 1600, alt: '', sizes: '(max-width: 923px) 50vw, 50vw' })
      : `<span class="cover"><span class="cover__title">[${esc(p.name)}]</span></span>`;
    return `
      <a class="tile" href="${projectPath(p)}" data-index="${i}" style="--i:${i}">
        ${vis}
        <span class="tile__label"><span>${pad(i + 1)}</span><span>${esc(p.name)}</span><span>${esc(p.tag)}</span></span>
      </a>`;
  }).join('');
  return `${head({
    R,
    title: `${PERSON.name} — Diseño gráfico y dirección de arte`,
    description: 'Portfolio de Manel Vila, diseñador gráfico y director de arte. Branding, lettering y editorial para Vintage Palace, 404 Studio, Claur Tiles, Bernal y más.',
    canonical: '',
    jsonld: [{ '@context': 'https://schema.org', '@graph': [websiteLD(), personLD(), {
      '@type': 'ItemList', name: 'Proyectos', itemListElement: PROJECTS.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE}/${projectPath(p)}`, name: p.name }))
    }] }],
    extra: '  <noscript><style>.grid{position:static;visibility:visible;opacity:1;padding-top:6rem}.tile{opacity:1;transform:none}.tile__label{transform:none}.track,.info,.grid-btn,.intro{display:none}.home{overflow:auto;height:auto}</style></noscript>\n'
  })}
<body class="home">

  <div class="intro" aria-hidden="true">${MARK}</div>
${franja(R, 'home')}

  <button class="grid-btn" aria-pressed="false">
    <span class="grid-btn__icon" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
    <span class="grid-btn__count">01 / ${pad(N)}</span>
    <span class="sr-only">Ver todos los proyectos</span>
  </button>
${panels(R, 'home')}

  <main id="contenido">
    <h1 class="sr-only">${PERSON.name} — diseñador gráfico y director de arte. Proyectos</h1>
    <div class="track" id="track" aria-label="Proyectos destacados" aria-roledescription="carrusel"></div>
    <nav class="grid" id="grid" aria-label="Todos los proyectos">${tiles}
    </nav>
  </main>

  <div class="cursor" aria-hidden="true"><span>Ver proyecto</span></div>

  <div class="info">
    <div class="more" id="more"><div class="more__inner"></div></div>
    <div class="tiempos">
      <button class="play" aria-pressed="false" aria-label="Pausar pase automático"></button>
      <div class="progress" id="progress"></div>
    </div>
    <div class="bar">
      <span class="bar__num roll"></span>
      <a class="bar__name roll" href="${projectPath(PROJECTS[0])}"></a>
      <span class="bar__tag roll"></span>
      <span class="bar__short roll"></span>
      <button class="bar__more" aria-controls="more" aria-expanded="false">+info</button>
    </div>
  </div>

${scripts(R, ['gallery', 'projects', 'ui', 'main'])}
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
  return kinds;
}

function heroHTML(R, p) {
  const m = p.media;
  if (!m) return '';
  const ar = m.ar || 16 / 9;
  const tall = ar < 1.2;
  const style = ` style="--bg:${m.bg || '#000'};--ar:${ar.toFixed(4)};--ar-m:${(m.mobile && m.arMobile ? m.arMobile : ar).toFixed(4)}"`;
  if (m.type === 'video') {
    return `<figure class="pj__hero${tall ? ' is-tall' : ''}"${style}>
      <video muted loop playsinline autoplay preload="metadata" poster="${R}${url(m.poster || '')}" aria-label="${esc(p.name)} — vídeo de portada">
        ${m.mobile ? `<source src="${R}${url(m.mobile)}" type="video/mp4" media="(max-width: 923px)">` : ''}
        <source src="${R}${url(m.src)}" type="video/mp4">
      </video>
    </figure>`;
  }
  const g = p.gallery.find((e) => e[0] === m.src);
  return `<figure class="pj__hero"${style}>${img(R, m.src, { w: g ? g[1] : 1600, h: g ? g[2] : undefined, alt: `${p.name} — portada`, lazy: false })}</figure>`;
}

function project(p, i) {
  const R = '../../';
  const nx = PROJECTS[(i + 1) % N];
  const pv = PROJECTS[(i - 1 + N) % N];
  const m = p.media || {};
  const coverKey = m.deck || m.src;
  const gal = p.gallery.filter((e) => !(e[3] && e[3] === coverKey) && e[0] !== (m.type === 'image' ? m.src : ''));
  const kinds = galleryKinds(gal);
  const total = gal.length;
  const figs = gal.map(([src, w, h, vid], j) => {
    const alt = `${p.name} — imagen ${j + 1} de ${total}`;
    const sizes = kinds[j] === 'full' ? '100vw' : '(max-width: 923px) 100vw, 50vw';
    return `
      <figure class="g g--${kinds[j]}" data-reveal data-n="${j}">
        <button class="g__open" aria-label="Ampliar imagen ${j + 1} de ${total}">${img(R, src, { w, h, alt, sizes, extra: vid && exists(vid) ? ` data-video="${R}${url(vid)}"` : '' })}</button>
        <figcaption>${pad(j + 1)} — ${pad(total)}</figcaption>
      </figure>`;
  }).join('');

  const meta = [];
  if (p.services.length) meta.push(['Servicios', `<ul class="list-inline">${p.services.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>`]);
  meta.push(['Disciplina', esc(p.tag)]);
  if (p.studio) meta.push(['Estudio', esc(p.studio)]);
  if (p.team) meta.push(['Equipo', esc(p.team)]);
  if (p.year) meta.push(['Año', String(p.year)]);
  meta.push(['Diseño', PERSON.name]);

  const desc = p.long ? clip(p.long) : `${p.name}: ${p.tag}. ${p.short} Proyecto de ${PERSON.name}, diseñador gráfico y director de arte.`;
  const imgs = [thumbOf(p), ...gal.slice(0, 5).map((e) => e[0])].filter(Boolean);
  const nxThumb = thumbOf(nx);

  return `${head({
    R,
    title: `${p.name} — ${p.tag} · ${PERSON.name}`,
    description: desc,
    canonical: projectPath(p),
    image: thumbOf(p) || 'content/posters/og.jpg',
    type: 'article',
    jsonld: [{ '@context': 'https://schema.org', '@graph': [
      {
        '@type': 'CreativeWork',
        '@id': `${SITE}/${projectPath(p)}#trabajo`,
        name: p.name,
        headline: p.name,
        description: plain(p.long || p.short),
        genre: p.tag,
        keywords: p.services.join(', '),
        url: `${SITE}/${projectPath(p)}`,
        image: imgs.map(abs),
        inLanguage: 'es',
        creator: { '@id': `${SITE}/#manel-vila` },
        ...(p.studio ? { producer: { '@type': 'Organization', name: p.studio } } : {}),
        ...(p.year ? { dateCreated: String(p.year) } : {}),
        isPartOf: { '@id': `${SITE}/#web` }
      },
      { ...personLD() },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Proyectos', item: `${SITE}/` },
          { '@type': 'ListItem', position: 2, name: p.name, item: `${SITE}/${projectPath(p)}` }
        ]
      }
    ] }]
  })}
<body class="project" data-index="${i}" data-slug="${p.slug}">
  <div class="readbar" aria-hidden="true"></div>
${franja(R, 'project')}

  <a class="grid-btn pj__back" href="${R}#${p.slug}" aria-label="Volver a los proyectos">
    <span class="grid-btn__icon" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
    <span class="grid-btn__count">${pad(i + 1)} / ${pad(N)}</span>
  </a>
${panels(R, 'project', i)}

  <main id="contenido" class="pj">
    <article>
      <header class="pj__head">
        <nav class="chips" aria-label="Ruta">
          <a class="chip chip--num" href="${R}#${p.slug}" aria-label="Proyecto ${i + 1} de ${N}">${pad(i + 1)}</a>
          <a class="chip" href="${R}?grid">Proyectos</a>
          <span class="chip chip--round">${esc(p.tag)}</span>
        </nav>
        <h1 class="pj__title"><span class="mask"><span>[${esc(p.name)}]</span></span></h1>
      </header>

      ${heroHTML(R, p)}

      <section class="pj__intro" aria-label="Sobre el proyecto">
        ${p.long ? `<p class="pj__lead" data-reveal>${esc(p.long)}</p>` : `<p class="pj__lead" data-reveal>${esc(p.short)}</p>`}
        <dl class="pj__meta" data-reveal>
          ${meta.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('\n          ')}
        </dl>
      </section>

      ${total ? `<section class="pj__gallery" aria-label="Galería · ${total} piezas">${figs}
      </section>` : ''}
    </article>

    <nav class="pj__nav" aria-label="Más proyectos">
      <a class="pj__next" href="${R}${projectPath(nx)}" rel="next">
        <span class="pj__next-label">Siguiente proyecto · ${pad(((i + 1) % N) + 1)}</span>
        <span class="pj__next-title">[${esc(nx.name)}]</span>
        ${nxThumb ? `<span class="pj__next-img">${img(R, nxThumb, { w: 1600, alt: '', sizes: '40vw' })}</span>` : ''}
      </a>
      <div class="pj__pn">
        <a href="${R}${projectPath(pv)}" rel="prev">← ${esc(pv.name)}</a>
        <a href="${R}?grid">Todos los proyectos</a>
      </div>
    </nav>
  </main>

  <footer class="site-foot">
    ${contactLinks('site-foot__links')}
    <span>${PERSON.name} · Valencia · Barcelona</span>
  </footer>

  <dialog class="lightbox" aria-label="Galería ampliada">
    <div class="lightbox__stage"></div>
    <div class="lightbox__bar">
      <span class="lightbox__count"></span>
      <span class="lightbox__nav"><button data-lb="prev" aria-label="Anterior">←</button><button data-lb="next" aria-label="Siguiente">→</button></span>
      <button data-lb="close" aria-label="Cerrar">(X)</button>
    </div>
  </dialog>

${scripts(R, ['ui', 'project'])}
</body>
</html>
`;
}

/* ---------- ABOUT ---------- */
function about() {
  const R = '../';
  const list = (a) => `<ul class="list-inline">${a.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`;
  return `${head({
    R,
    title: `About y contacto — ${PERSON.name}`,
    description: 'Manel Vila, diseñador gráfico y director de arte especializado en branding y lettering. Miembro de Gomet Verd Estudi. Valencia · Barcelona.',
    canonical: 'about/',
    type: 'profile',
    jsonld: [{ '@context': 'https://schema.org', '@graph': [
      { '@type': 'ProfilePage', url: `${SITE}/about/`, name: `About — ${PERSON.name}`, mainEntity: { '@id': `${SITE}/#manel-vila` } },
      personLD()
    ] }]
  })}
<body class="about">
${franja(R, 'about')}

  <a class="grid-btn" href="${R}?grid" aria-label="Ver todos los proyectos">
    <span class="grid-btn__icon" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
    <span class="grid-btn__count">Proyectos</span>
  </a>
${panels(R, 'about')}

  <main id="contenido">
    <section class="page" aria-labelledby="about-title">
      <div class="chips">
        <span class="chip chip--num">00</span>
        <span class="chip">About</span>
        <span class="chip chip--round">Valencia · Barcelona</span>
      </div>

      <h1 class="display" id="about-title" data-reveal><span class="mask"><span>[Manel Vila]</span></span></h1>

      <p class="lead" data-reveal>
        Diseñador gráfico y director de arte. Construyo identidades con personalidad y algo que contar,
        con el branding y el lettering como especialidad y la curiosidad como método.
      </p>

      <div class="rows" data-reveal>
        <div class="row">
          <h2 class="row__label">Perfil</h2>
          <div class="row__body">
            <p>Soy Manel Vila, diseñador gráfico y director de arte, graduado por la EASD (Escuela de Arte Superior de Diseño) de Valencia. Trabajo con soltura en cualquier rama del diseño gráfico, aunque me he especializado en branding y lettering.</p>
            <p>Me considero una persona comprometida, con capacidad para trabajar en equipo y bajo presión, y disfruto acompañando cada proyecto desde la idea hasta su última aplicación.</p>
          </div>
        </div>

        <div class="row">
          <h2 class="row__label">Gomet Verd Estudi</h2>
          <div class="row__body">
            <p>Soy miembro de Gomet Verd Estudi, un estudio creativo independiente afincado en Valencia y Barcelona y especializado en branding y dirección de arte. El estudio combina estrategia, narrativa y exploración visual, y entiende cada proyecto como un proceso de experimentación y juego compartido con el cliente, desde la idea inicial hasta su desarrollo gráfico y audiovisual. Buena parte de los proyectos de este portfolio nacen ahí.</p>
            <p>ALWAYS WIPing (Working In Play) es su manera de trabajar: mantener la curiosidad, cuestionar lo establecido y disfrutar del proceso tanto como del resultado.</p>
          </div>
        </div>

        <div class="row">
          <h2 class="row__label">Colaboraciones</h2>
          <div class="row__body">
            <p>Además de mi trabajo en el estudio, he colaborado con otros estudios y equipos creativos:</p>
            ${list(COLLABS)}
          </div>
        </div>

        <div class="row">
          <h2 class="row__label">Servicios</h2>
          <div class="row__body">${list(SERVICES)}</div>
        </div>

        <div class="row">
          <h2 class="row__label">Clientes</h2>
          <div class="row__body">${list(CLIENTS)}</div>
        </div>
      </div>
    </section>

    <section class="contact" id="contacto" aria-labelledby="contact-title">
      <div class="chips">
        <span class="chip chip--num">✶</span>
        <span class="chip">Contacto</span>
        <span class="chip chip--round">Hablemos</span>
      </div>
      <h2 class="contact__title" id="contact-title" data-reveal>¿Tienes un proyecto en mente?</h2>

      <div class="contact__big" data-reveal>
        <span class="copyable"><a href="mailto:${PERSON.email}">${PERSON.email}</a><button class="copy" data-copy="${PERSON.email}" aria-label="Copiar email">Copiar</button></span>
        <a href="tel:${PERSON.phoneHref}">${PERSON.phone}</a>
        <a href="${PERSON.instagram}" target="_blank" rel="noopener">${PERSON.instagramLabel}</a>
      </div>

      <footer class="foot">
        <span>Always WIPing [Working In Play]</span>
        <span>Valencia · Barcelona</span>
        <span>© ${TODAY.slice(0, 4)} ${PERSON.name}</span>
      </footer>
    </section>
  </main>

${scripts(R, ['ui'])}
</body>
</html>
`;
}

/* ---------- redirección de la URL antigua ---------- */
const legacyAbout = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>About — ${PERSON.name}</title>
  <link rel="canonical" href="${SITE}/about/">
  <meta name="robots" content="noindex">
  <meta http-equiv="refresh" content="0; url=about/">
  <script>location.replace('about/' + location.hash);</script>
</head>
<body><a href="about/">About — ${PERSON.name}</a></body>
</html>
`;

/* ---------- sitemap ---------- */
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url><loc>${SITE}/</loc><lastmod>${TODAY}</lastmod><priority>1.0</priority></url>
  <url><loc>${SITE}/about/</loc><lastmod>${TODAY}</lastmod><priority>0.7</priority></url>
${PROJECTS.map((p) => {
  const imgs = [thumbOf(p), ...p.gallery.map((e) => e[0])].filter(Boolean).slice(0, 30);
  return `  <url><loc>${SITE}/${projectPath(p)}</loc><lastmod>${TODAY}</lastmod><priority>0.8</priority>
${imgs.map((s) => `    <image:image><image:loc>${abs(s)}</image:loc></image:image>`).join('\n')}
  </url>`;
}).join('\n')}
</urlset>
`;

/* ---------- escribir ---------- */
write('index.html', home());
write('about/index.html', about());
write('about.html', legacyAbout);
PROJECTS.forEach((p, i) => write(`${projectPath(p)}index.html`, project(p, i)));
write('sitemap.xml', sitemap);

// Avisa de rutas que no existen (fotos o vídeos que faltan)
const missing = new Set();
for (const p of PROJECTS) {
  const m = p.media || {};
  [m.src, m.mobile, m.poster, ...p.gallery.map((e) => e[0])].filter(Boolean).forEach((s) => { if (!exists(s)) missing.add(s); });
}
console.log(`ok · ${N} proyectos · ${PROJECTS.reduce((a, p) => a + p.gallery.length, 0)} piezas de galería`);
if (missing.size) console.log('faltan:\n  ' + [...missing].join('\n  '));
