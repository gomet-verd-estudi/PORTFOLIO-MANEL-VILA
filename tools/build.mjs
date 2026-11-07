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
import { createHash } from 'node:crypto';

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
/* Quién es (y quién no): hay otras personas con nombre parecido (Manu Vila, ilustrador en Valencia;
   Manel Vila del Olmo, publicista). Google y las IA las mezclan si no se lo dejamos claro. */
const IDENTITY = {
  en: 'Manel Vila of Gomet Verd Estudi: graphic designer and art director in Valencia and Barcelona, focused on branding. Author of manelvila.com.',
  es: 'Manel Vila, de Gomet Verd Estudi: diseñador gráfico y director de arte en Valencia y Barcelona, especializado en branding. Autor de manelvila.com.'
};
const NOT_HIM = {
  en: 'He is a different person from others with a similar name, such as the illustrator Manu Vila (Manuel Vila Alcántara) or the advertising publisher Manel Vila del Olmo.',
  es: 'No es la misma persona que otras con un nombre parecido, como el ilustrador Manu Vila (Manuel Vila Alcántara) o el publicista Manel Vila del Olmo.'
};
const COLLABS = ['Jotateam Studio', 'Socis Club', 'T.O.T Studio', 'Domingo Studio', 'D’Matinada'];
const CLIENTS = ['Vintage Palace', '404 Studio', 'Claur Tiles', 'Bernal', 'D’Matinada', 'Orbis Vacui', 'Leo Rizzi', 'Kaniche Pedigree Hot Dogs'];

/* ==========================================================================
   CAPTACIÓN — la ficha «Empezar un proyecto», los servicios y el aviso legal
   ========================================================================== */

/*
 * Ficha «Empezar un proyecto» (/start/ y /es/empezar/). Quien la rellena la envía desde su propio
 * correo o su WhatsApp, ya escrita: no hace falta servidor ni guardar datos en la web.
 *  · whatsapp: número con prefijo y sin espacios ni «+» ('' quita el botón de WhatsApp)
 *  · budgets: tramos de presupuesto (cámbialos por los tuyos; el último deja la puerta abierta)
 *  · reply: la promesa de respuesta que se lee bajo el título
 */
const BRIEF = {
  whatsapp: '34684450515',
  budgets: {
    en: ['Under €1,500', '€1,500 – 3,000', '€3,000 – 6,000', 'Over €6,000', 'I’d rather talk about it'],
    es: ['Menos de 1.500 €', '1.500 – 3.000 €', '3.000 – 6.000 €', 'Más de 6.000 €', 'Prefiero hablarlo']
  },
  reply: { en: 'I usually reply within two working days.', es: 'Suelo responder en dos días laborables.' }
};

/* Aviso legal (LSSI-CE): titular de la web. El NIF y el domicilio solo aparecen cuando se rellenan. */
const LEGAL = { holder: PERSON.name, nif: '', address: '', updated: '2026-11-07' };

/*
 * Servicios: una página por disciplina (/services/<slug>/, /es/servicios/<slug>/) para que Google y las
 * IA respondan con Manel a búsquedas como «branding Valencia» o «dirección de arte Barcelona».
 * Los proyectos de cada servicio salen solos de la disciplina de cada proyecto (match) y de `also`.
 */
const SERVICES = [
  {
    key: 'branding', slug: { en: 'branding', es: 'branding' },
    match: (p) => /branding/i.test(p.tag), also: [],
    label: { en: 'Branding and identity', es: 'Branding e identidad' },
    name: { en: 'Branding and brand identity', es: 'Branding e identidad corporativa' },
    short: {
      en: 'Identities with something to say, from the first idea to the complete system.',
      es: 'Identidades con algo que contar, de la primera idea al sistema completo.'
    },
    text: {
      en: [
        'Branding is the part of the job I love most. Every project starts with a conversation: understanding what the brand wants to be, who it speaks to and what sets it apart. From there I look for its own voice and turn it into a visual system that works just as well on a poster, a package or a screen.',
        'It doesn’t stop at the logo. I design the whole identity — typography, colour, imagery, tone — and see it through to the last application, so the brand is recognisable anywhere.',
        'That’s how I’ve worked with a fashion studio showing at 080 Barcelona Fashion Week, a workshop that makes handmade tiles, a creative studio, a cultural promoter and a band releasing a new album, mostly through Gomet Verd Estudi.'
      ],
      es: [
        'El branding es la parte del oficio que más me apasiona. Cada proyecto empieza con una conversación: entender qué quiere ser la marca, a quién le habla y qué la hace distinta. A partir de ahí le busco una voz propia y la convierto en un sistema visual que funcione igual de bien en un cartel, en un envase o en una pantalla.',
        'No se queda en el logotipo. Diseño la identidad completa —tipografía, color, imagen, tono— y la acompaño hasta la última aplicación, para que la marca se reconozca en cualquier sitio.',
        'Así he trabajado con un estudio de moda que desfila en la 080 Barcelona Fashion Week, un taller de azulejos hechos a mano, un estudio creativo, una promotora cultural o un grupo que estrenaba disco, casi siempre desde Gomet Verd Estudi.'
      ]
    },
    includes: {
      en: ['Concept and visual strategy', 'Logo and identity system', 'Typography, colour and imagery', 'Packaging', 'Social media', 'Merchandise and applications'],
      es: ['Concepto y estrategia visual', 'Logotipo y sistema de identidad', 'Tipografía, color e imagen', 'Packaging', 'Redes sociales', 'Merchandising y aplicaciones']
    }
  },
  {
    key: 'art-direction', slug: { en: 'art-direction', es: 'direccion-de-arte' },
    match: (p) => /dirección de arte/i.test(p.tag) || p.services.some((x) => /dirección de arte/i.test(x)), also: [],
    label: { en: 'Art direction', es: 'Dirección de arte' },
    name: { en: 'Art direction', es: 'Dirección de arte' },
    short: {
      en: 'One concept and one visual world, so every piece tells the same story.',
      es: 'Un concepto y un universo visual para que cada pieza cuente la misma historia.'
    },
    text: {
      en: [
        'Art direction is what holds a project together when it passes through many hands: photography, 3D, illustration, space. I define the concept and the visual world, and I make sure every piece tells the same story.',
        'At Kaniche Pedigree Hot Dogs I designed and art-directed the restaurant’s in-store posters, blending punk attitude with a high-society air. At Vintage Palace and Claur Tiles, the imagery that goes with the identity, working alongside photographers.'
      ],
      es: [
        'La dirección de arte es lo que mantiene unido un proyecto cuando pasa por muchas manos: fotografía, 3D, ilustración, espacio. Defino el concepto y el universo visual, y me aseguro de que cada pieza cuente la misma historia.',
        'En Kaniche Pedigree Hot Dogs diseñé y dirigí la cartelería interior del restaurante, mezclando la actitud punk con el aire de la alta sociedad. En Vintage Palace y Claur Tiles, la imagen que acompaña a la identidad, junto a los fotógrafos.'
      ]
    },
    includes: {
      en: ['Concept and visual world', 'Brand imagery with photography and 3D', 'Posters and graphics for spaces', 'Consistency across pieces and formats'],
      es: ['Concepto y universo visual', 'Imagen de marca con fotografía y 3D', 'Cartelería y gráfica para espacios', 'Coherencia entre piezas y formatos']
    }
  },
  {
    key: 'editorial', slug: { en: 'editorial-design', es: 'diseno-editorial' },
    match: (p) => /editorial/i.test(p.tag), also: [],
    label: { en: 'Editorial design', es: 'Diseño editorial' },
    name: { en: 'Editorial design', es: 'Diseño editorial' },
    short: {
      en: 'Books, photobooks and record sleeves designed with the same care as an identity.',
      es: 'Libros, fotolibros y fundas de disco diseñados con el mismo cuidado que una identidad.'
    },
    text: {
      en: [
        'I like editorial design because it makes you think about rhythm: how a page turns, how much room an image needs, what tone the typography sets. I design books, photobooks and record sleeves with the same care as an identity.',
        'Cisma is a documentary photobook about how the city of Alzira has changed since the 1920s. For Bernal, the sleeve of “¿Qué tal todo allí fuera?”, a handmade edition of fifty copies, and the vinyl for “Vida y Milagros”.'
      ],
      es: [
        'Me gusta el diseño editorial porque obliga a pensar en el ritmo: cómo se pasa una página, cuánto respira una imagen, qué tono tiene la tipografía. Diseño libros, fotolibros y fundas de disco con el mismo cuidado que una identidad.',
        'Cisma es un fotolibro documental sobre cómo ha cambiado Alzira desde los años veinte. Para Bernal, la funda de «¿Qué tal todo allí fuera?», una edición de cincuenta copias hechas a mano, y el vinilo de «Vida y Milagros».'
      ]
    },
    includes: {
      en: ['Books and photobooks', 'Vinyl and record sleeves', 'Layout and typographic systems', 'Editorial pieces for brands'],
      es: ['Libros y fotolibros', 'Fundas de vinilo y disco', 'Maquetación y sistema tipográfico', 'Piezas editoriales de marca']
    }
  },
  {
    key: 'lettering', slug: { en: 'lettering-and-posters', es: 'lettering-y-carteleria' },
    match: (p) => /lettering|cartel/i.test(p.tag) || p.services.some((x) => /^(lettering|cartelería)/i.test(x)), also: ['404-studio'],
    label: { en: 'Lettering and posters', es: 'Lettering y cartelería' },
    name: { en: 'Lettering and posters', es: 'Lettering y cartelería' },
    short: {
      en: 'Letters drawn for one place: a tour poster, a music video, a T-shirt.',
      es: 'Letras dibujadas para un sitio concreto: un cartel de gira, un videoclip, una camiseta.'
    },
    text: {
      en: [
        'Letters drawn for one specific place: a tour poster, the titles of a music video, a T-shirt. Lettering gives a piece a voice no off-the-shelf typeface has.',
        'Among others: the poster for Leo Rizzi’s tour “Bailando alrededor del río” and its Instagram versions, the titles and credits for Bernal’s music video “Parques”, the in-store posters at Kaniche and the type for a line of 404 Studio T-shirts in collaboration with Adidas.'
      ],
      es: [
        'Letras dibujadas para un sitio concreto: un cartel de gira, los títulos de un videoclip, una camiseta. El lettering le da a una pieza una voz que ninguna tipografía de catálogo tiene.',
        'Entre otros: el cartel de la gira «Bailando alrededor del río» de Leo Rizzi y sus versiones para Instagram, los títulos y créditos del videoclip «Parques» de Bernal, la cartelería interior de Kaniche y la tipografía de unas camisetas de 404 Studio en colaboración con Adidas.'
      ]
    },
    includes: {
      en: ['Custom lettering', 'Tour and event posters', 'Titles and credits', 'Lettering for products and merchandise'],
      es: ['Lettering a medida', 'Carteles de gira y eventos', 'Títulos y créditos', 'Tipografía para producto y merchandising']
    }
  },
  {
    key: 'motion', slug: { en: 'motion-graphics', es: 'motion-graphics' },
    match: (p) => /motion/i.test(p.tag), also: [],
    label: { en: 'Motion graphics', es: 'Motion graphics' },
    name: { en: 'Motion graphics', es: 'Motion graphics' },
    short: {
      en: 'An identity set in motion: animated logos, social pieces, graphics for video.',
      es: 'La identidad en movimiento: logotipos animados, piezas para redes, gráficos para vídeo.'
    },
    text: {
      en: [
        'Motion takes an identity into movement: logos that come alive, pieces for social media, transitions and graphics for video. It’s another way of telling the same story.',
        'Sun&Snow, Delta and Pontevecchio were made at T.O.T Studio; Delta combines motion graphics with artificial intelligence.'
      ],
      es: [
        'El motion lleva una identidad al movimiento: logotipos que cobran vida, piezas para redes, transiciones y gráficos para vídeo. Es otra manera de contar la misma historia.',
        'Sun&Snow, Delta y Pontevecchio son trabajos realizados en T.O.T Studio; Delta combina motion graphics con inteligencia artificial.'
      ]
    },
    includes: {
      en: ['Brand and logo animation', 'Social media pieces', 'Graphics for video', 'Motion with AI'],
      es: ['Animación de marca y logotipos', 'Piezas para redes sociales', 'Gráficos para vídeo', 'Motion con IA']
    }
  }
];
/* Opciones de «Qué necesitas» en la ficha: los servicios y dos más */
const NEEDS = [
  ...SERVICES.map((s) => ({ key: s.key, label: s.label })),
  { key: 'packaging', label: { en: 'Packaging', es: 'Packaging' } },
  { key: 'unsure', label: { en: 'Not sure yet', es: 'Aún no lo sé' } }
];

/* ---------- idiomas ---------- */
const LANG = {
  en: { code: 'en', dir: '', pj: 'projects', svc: 'services', start: 'start', locale: 'en_GB', label: 'EN', name: 'English' },
  es: { code: 'es', dir: 'es/', pj: 'proyectos', svc: 'servicios', start: 'empezar', locale: 'es_ES', label: 'ES', name: 'Español' }
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
      title: 'Manel Vila — Graphic designer in Valencia & Barcelona',
      desc: 'Manel Vila, graphic designer and art director in Valencia and Barcelona. Branding and brand identity, art direction, lettering and editorial design.',
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
      lightbox: 'Enlarged gallery', prev: 'Previous', nextImg: 'Next', by: 'Manel Vila, graphic designer', byShort: 'Manel Vila, designer',
      desc: (p) => `${p.name}: ${p.tag}. ${p.short} A project by Manel Vila, graphic designer and art director.`
    },
    ab: {
      title: 'About · Manel Vila, graphic designer and art director',
      desc: 'Manel Vila is a graphic designer and art director in Valencia and Barcelona, specialising in branding. Member of Gomet Verd Estudi. Services, clients and contact.',
      close: 'Close About and go back',
      tagline: 'Graphic designer and art director. I work between Valencia and Barcelona and I’m part of Gomet Verd Estudi.',
      bio: [
        'I like brands that have something to say. My job is to find that something and give it a shape: an identity, a visual world, a system that works just as well on a poster as on a screen.',
        'I studied at EASD Valencia, and while I’m at ease in every corner of graphic design, what I truly love is branding: understanding what a brand wants to be, finding its own voice and building a system around it that makes it recognisable anywhere. Lettering, editorial and motion come after that, as different ways of telling the same story.',
        'I’m part of Gomet Verd Estudi, an independent branding and art direction studio between Valencia and Barcelona. Every project there starts with a conversation and becomes a game we play together with the client, mixing strategy, storytelling and visual exploration until we reach something you can see, hold or set in motion. Many of the projects in this portfolio were born there.',
        'We’re driven by a simple idea, ALWAYS WIPing (Working In Play): stay curious, question the usual and enjoy the process, because in the end it shows in the result.',
        'I enjoy working in a team and seeing each project through, from the first idea to the last application. If you have one in mind, <a href="{brief}">tell me about it</a>.'
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
      title: 'Manel Vila — Diseñador gráfico en Valencia y Barcelona',
      desc: 'Manel Vila, diseñador gráfico y director de arte en Valencia y Barcelona. Branding e identidad corporativa, dirección de arte, lettering y diseño editorial.',
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
      lightbox: 'Galería ampliada', prev: 'Anterior', nextImg: 'Siguiente', by: 'Manel Vila, diseñador gráfico', byShort: 'Manel Vila, diseñador',
      desc: (p) => `${p.name}: ${p.tag}. ${p.short} Proyecto de Manel Vila, diseñador gráfico y director de arte.`
    },
    ab: {
      title: 'About · Manel Vila, diseñador gráfico y director de arte',
      desc: 'Manel Vila es diseñador gráfico y director de arte en Valencia y Barcelona, especializado en branding. Miembro de Gomet Verd Estudi. Servicios, clientes y contacto.',
      close: 'Cerrar About y volver',
      tagline: 'Diseñador gráfico y director de arte. Trabajo entre Valencia y Barcelona y formo parte de Gomet Verd Estudi.',
      bio: [
        'Me gustan las marcas que tienen algo que contar. Mi trabajo consiste en encontrar ese algo y darle forma: una identidad, un universo visual, un sistema que funcione igual de bien en un cartel que en una pantalla.',
        'Estudié en la EASD de Valencia y, aunque me muevo con soltura por cualquier rama del diseño gráfico, lo que de verdad me apasiona es el branding: entender qué quiere ser una marca, encontrarle una voz propia y construir a su alrededor un sistema que la haga reconocible en cualquier sitio. El lettering, la editorial o el motion vienen después, como maneras distintas de contar esa misma historia.',
        'Formo parte de Gomet Verd Estudi, un estudio independiente de branding y dirección de arte entre Valencia y Barcelona. Allí cada proyecto empieza con una conversación y acaba siendo un juego compartido con quien nos lo encarga: mezclamos estrategia, narrativa y exploración visual hasta llegar a algo que se pueda ver, tocar o poner en movimiento. Muchos de los trabajos de este portfolio nacieron ahí.',
        'Nos mueve una idea sencilla, ALWAYS WIPing (Working In Play): seguir siendo curiosos, cuestionar lo de siempre y disfrutar del proceso, porque al final se nota en el resultado.',
        'Me gusta trabajar en equipo y acompañar cada proyecto de principio a fin, de la primera idea a la última aplicación. Si tienes uno entre manos, <a href="{brief}">cuéntamelo</a>.'
      ],
      labels: { services: 'Servicios', studio: 'Estudio', collabs: 'También he trabajado con', clients: 'Clientes', education: 'Formación', contact: 'Contacto', time: 'Hora local' },
      services: ['Identidad corporativa', 'Dirección de arte', 'Lettering', 'Tipografía', 'Packaging', 'Editorial', 'Cartelería', 'RRSS', 'Motion graphics', '3D'],
      education: 'EASD — Escuela de Arte Superior de Diseño de Valencia'
    }
  }
};

/* Textos de captación: ficha, servicios, legal y llamadas a la acción */
Object.assign(T.en, {
  services: 'Services', start: 'Start a project', talk: 'Let’s talk', legal: 'Legal & privacy', and: '&', in: 'in',
  yours: 'Your project', youCta: 'Tell me about it in a minute',
  cta: { q: (n) => `A project like ${n}?`, go: 'Let’s start yours' },
  svc: {
    title: 'Graphic design services · Manel Vila',
    desc: 'Branding and brand identity, art direction, editorial design, lettering and motion graphics in Valencia and Barcelona. Services by Manel Vila, graphic designer.',
    tagline: 'Branding first; also art direction, editorial, lettering and motion. Valencia · Barcelona.',
    text: ['I mostly work with brands that are just starting out or need to tell their story again. Every project starts with a conversation and ends in a system you can see, hold or set in motion.'],
    includes: 'Includes', works: 'Projects', start: 'Start a project', n: (k) => `${k} ${k === 1 ? 'project' : 'projects'}`,
    close: 'Close and go back', all: 'All services'
  },
  brief: {
    title: 'Start a project · Manel Vila, graphic designer',
    desc: 'Got a branding, art direction or editorial project? Tell me about it in a minute and I’ll get back to you with next steps. Valencia and Barcelona.',
    tagline: 'Tell me about it in a minute.',
    text: 'With this sheet I come to our first conversation already knowing what you need, by when and with what room to move. Fill in whatever you’re sure about; we’ll work out the rest together.',
    labels: ['What you need', 'Stage', 'Timing', 'Budget', 'The project', 'You'],
    stage: ['A new brand', 'A redesign', 'A single piece or campaign', 'Something else'],
    when: ['As soon as possible', 'In 1–3 months', 'Later on', 'No date yet'],
    about: 'What is your brand or project, and what would you like to achieve?',
    you: { name: 'Name', brand: 'Brand or company (optional)', email: 'Email', phone: 'Phone (optional)' },
    send: 'Send by email', wa: 'Send on WhatsApp', or: 'or',
    note: 'I only use these details to reply to you.',
    done: { email: 'Your email app has opened with the sheet written out: just press send.', wa: 'WhatsApp has opened with the sheet written out: just press send.' },
    fallback: 'Nothing opened? Copy the sheet and send it to', copy: 'Copy sheet',
    close: 'Close and go back',
    msg: { subject: 'New project', need: 'I need', stage: 'Stage', when: 'Timing', budget: 'Budget', from: 'Seen on', src: 'Came from', via: 'Sent from' }
  },
  lg: {
    title: 'Legal notice & privacy · Manel Vila',
    desc: 'Legal notice, privacy and cookies of manelvila.com, the portfolio of graphic designer Manel Vila.',
    updated: 'Updated'
  }
});
Object.assign(T.es, {
  services: 'Servicios', start: 'Empezar un proyecto', talk: 'Hablemos', legal: 'Aviso legal y privacidad', and: 'y', in: 'en',
  yours: 'Tu proyecto', youCta: 'Cuéntamelo en un minuto',
  cta: { q: (n) => `¿Un proyecto como ${n}?`, go: 'Empecemos el tuyo' },
  svc: {
    title: 'Servicios de diseño gráfico · Manel Vila',
    desc: 'Branding e identidad corporativa, dirección de arte, diseño editorial, lettering y motion graphics en Valencia y Barcelona. Servicios de Manel Vila, diseñador gráfico.',
    tagline: 'Branding ante todo; también dirección de arte, editorial, lettering y motion. Valencia · Barcelona.',
    text: ['Trabajo sobre todo con marcas que empiezan o que necesitan contarse de nuevo. Cada proyecto empieza con una conversación y acaba en un sistema que se puede ver, tocar o poner en movimiento.'],
    includes: 'Incluye', works: 'Proyectos', start: 'Empezar un proyecto', n: (k) => `${k} ${k === 1 ? 'proyecto' : 'proyectos'}`,
    close: 'Cerrar y volver', all: 'Todos los servicios'
  },
  brief: {
    title: 'Empezar un proyecto · Manel Vila, diseñador gráfico',
    desc: '¿Tienes un proyecto de branding, dirección de arte o editorial? Cuéntamelo en un minuto y te respondo con los siguientes pasos. Valencia y Barcelona.',
    tagline: 'Cuéntamelo en un minuto.',
    text: 'Con esta ficha llego a la primera conversación sabiendo qué necesitas, para cuándo y con qué margen. Rellena lo que tengas claro; lo demás lo vemos juntos.',
    labels: ['Qué necesitas', 'Momento', 'Plazo', 'Presupuesto', 'El proyecto', 'Tú'],
    stage: ['Una marca nueva', 'Un rediseño', 'Una pieza o campaña', 'Otra cosa'],
    when: ['Lo antes posible', 'En 1–3 meses', 'Más adelante', 'Sin fecha'],
    about: '¿Qué es tu marca o proyecto y qué te gustaría conseguir?',
    you: { name: 'Nombre', brand: 'Marca o empresa (opcional)', email: 'Email', phone: 'Teléfono (opcional)' },
    send: 'Enviar por email', wa: 'Enviar por WhatsApp', or: 'o',
    note: 'Uso estos datos solo para responderte.',
    done: { email: 'Se ha abierto tu correo con la ficha escrita: solo falta darle a enviar.', wa: 'Se ha abierto WhatsApp con la ficha escrita: solo falta darle a enviar.' },
    fallback: '¿No se ha abierto nada? Copia la ficha y envíala a', copy: 'Copiar ficha',
    close: 'Cerrar y volver',
    msg: { subject: 'Nuevo proyecto', need: 'Necesito', stage: 'Momento', when: 'Plazo', budget: 'Presupuesto', from: 'Visto en', src: 'Llegué desde', via: 'Enviado desde' }
  },
  lg: {
    title: 'Aviso legal y privacidad · Manel Vila',
    desc: 'Aviso legal, privacidad y cookies de manelvila.com, el portfolio del diseñador gráfico Manel Vila.',
    updated: 'Actualizado'
  }
});

/* Proyectos con los textos de cada idioma (el bloque `en` de projects.js sobrescribe al español) */
const PROJ = { es: BASE, en: BASE.map((p) => ({ ...p, ...(p.en || {}) })) };

/* ---------- rutas ---------- */
const PAGE = {
  home: (lang) => LANG[lang].dir,
  about: (lang) => `${LANG[lang].dir}about/`,
  project: (lang, p) => `${LANG[lang].dir}${LANG[lang].pj}/${p.slug}/`,
  services: (lang) => `${LANG[lang].dir}${LANG[lang].svc}/`,
  service: (lang, s) => `${LANG[lang].dir}${LANG[lang].svc}/${s.slug[lang]}/`,
  brief: (lang) => `${LANG[lang].dir}${LANG[lang].start}/`,
  legal: (lang) => `${LANG[lang].dir}legal/`
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

/* Servicios ↔ proyectos (se decide con los datos en español, que son la base) */
const svcProjects = (s) => BASE.map((p, i) => ({ p, i })).filter(({ p }) => s.match(p) || s.also.includes(p.slug));
/** Servicio de cada parte de la disciplina («Branding + Editorial» → [branding, editorial]) */
const tagServices = (i) => BASE[i].tag.split(/\s*\+\s*/).map((part) => SERVICES.find((s) => s.match({ tag: part, services: [] })) || null);
const mainService = (i) => tagServices(i).find(Boolean) || SERVICES.find((s) => s.match(BASE[i])) || null;
/** Enlace a la ficha con el servicio y el proyecto de origen ya marcados */
const briefHref = (C, { s = null, from = '' } = {}) => {
  const q = [s ? `s=${s.key}` : '', from ? `from=${from}` : ''].filter(Boolean).join('&');
  return C.brief + (q ? `?${q}` : '');
};
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
    brief: rel(here, PAGE.brief(lang)),
    servicesUrl: rel(here, PAGE.services(lang)),
    legalUrl: rel(here, PAGE.legal(lang)),
    svc: (s) => rel(here, PAGE.service(lang, s)),
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
function head(C, { title, description, image = 'content/posters/og.jpg', type = 'website', jsonld = [], extra = '', robots = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' }) {
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
  <meta name="robots" content="${robots}">${VERIFY.bing ? `\n  <meta name="msvalidate.01" content="${VERIFY.bing}">` : ''}${VERIFY.google ? `\n  <meta name="google-site-verification" content="${VERIFY.google}">` : ''}
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
  <link rel="icon" href="${R}favicon.ico" sizes="16x16 32x32 48x48">
  <link rel="icon" href="${R}favicon.svg" type="image/svg+xml">
  <link rel="icon" href="${R}favicon-96.png" type="image/png" sizes="96x96">
  <link rel="icon" href="${R}favicon-192.png" type="image/png" sizes="192x192">
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
        <a class="btn btn--fill contact-list__go" href="${C.brief}">${t.start} <span aria-hidden="true">→</span></a>
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

/*
 * Perfiles de Manel en otras webs (LinkedIn, Behance, Instagram personal…). Ayudan a Google y a las
 * IA a saber que todos son la misma persona. Añade aquí la dirección completa de cada uno.
 */
const PROFILES = [];

/* Verificación de propiedad en las herramientas para webmasters (el código va publicado en la web,
   no es secreto). Bing Webmaster Tools → "HTML Meta Tag"; Google Search Console → "Etiqueta HTML". */
const VERIFY = {
  bing: '2474821E95140008A4A1800498597282',
  google: ''
};

/* Datos estructurados (schema.org): quién es Manel, qué hace, dónde y con quién. Los leen Google
   (panel de conocimiento, resultados enriquecidos) y los buscadores con IA. */
const STUDIO_ID = `${SITE}/#gomet-verd-estudi`;
const studioLD = () => ({
  '@type': 'Organization',
  '@id': STUDIO_ID,
  name: PERSON.studio,
  description: 'Estudio creativo independiente de branding y dirección de arte en Valencia y Barcelona.',
  address: [{ '@type': 'PostalAddress', addressLocality: 'Valencia', addressCountry: 'ES' }, { '@type': 'PostalAddress', addressLocality: 'Barcelona', addressCountry: 'ES' }],
  sameAs: [PERSON.instagram],
  member: { '@id': `${SITE}/#manel-vila` }
});
const personLD = (lang) => {
  const en = lang === 'en';
  const city = (name) => ({ '@type': 'City', name, containedInPlace: { '@type': 'Country', name: en ? 'Spain' : 'España' } });
  return {
    '@type': 'Person',
    '@id': `${SITE}/#manel-vila`,
    name: PERSON.name,
    givenName: 'Manel',
    familyName: 'Vila',
    jobTitle: T[lang].job,
    description: T[lang].ab.tagline,
    disambiguatingDescription: IDENTITY[lang],
    url: `${SITE}/${LANG[lang].dir}`,
    email: `mailto:${PERSON.email}`,
    telephone: PERSON.phoneHref,
    image: abs('content/posters/og.jpg'),
    address: [
      { '@type': 'PostalAddress', addressLocality: 'Valencia', addressRegion: en ? 'Valencian Community' : 'Comunitat Valenciana', addressCountry: 'ES' },
      { '@type': 'PostalAddress', addressLocality: 'Barcelona', addressRegion: en ? 'Catalonia' : 'Cataluña', addressCountry: 'ES' }
    ],
    workLocation: [city('Valencia'), city('Barcelona')],
    hasOccupation: [
      { '@type': 'Occupation', name: en ? 'Graphic designer' : 'Diseñador gráfico', occupationLocation: [city('Valencia'), city('Barcelona')],
        skills: en ? 'Branding, brand identity, lettering, typography, editorial design, packaging' : 'Branding, identidad corporativa, lettering, tipografía, diseño editorial, packaging' },
      { '@type': 'Occupation', name: en ? 'Art director' : 'Director de arte', occupationLocation: [city('Valencia'), city('Barcelona')] }
    ],
    alumniOf: { '@type': 'CollegeOrUniversity', name: 'Escuela de Arte Superior de Diseño de Valencia (EASD)', address: { '@type': 'PostalAddress', addressLocality: 'Valencia', addressCountry: 'ES' } },
    memberOf: { '@id': STUDIO_ID },
    knowsAbout: en
      ? ['Branding', 'Brand identity', 'Graphic design', 'Art direction', 'Lettering', 'Typography', 'Editorial design', 'Packaging', 'Motion graphics']
      : ['Branding', 'Identidad corporativa', 'Diseño gráfico', 'Dirección de arte', 'Lettering', 'Tipografía', 'Diseño editorial', 'Packaging', 'Motion graphics'],
    makesOffer: SERVICES.map((s) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: s.name[lang], url: `${SITE}/${PAGE.service(lang, s)}` } })),
    ...(PROFILES.length ? { sameAs: PROFILES } : {})
  };
};
const websiteLD = (lang) => ({
  '@type': 'WebSite', '@id': `${SITE}/#web`, url: `${SITE}/`, name: PERSON.name,
  alternateName: lang === 'en' ? 'Manel Vila — Graphic designer and art director' : 'Manel Vila — Diseñador gráfico y director de arte',
  description: T[lang].home.desc, inLanguage: ['en', 'es'],
  author: { '@id': `${SITE}/#manel-vila` }, publisher: { '@id': `${SITE}/#manel-vila` }
});

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
      <a class="ft__mail" href="${C.brief}"><span>${t.start}</span><span aria-hidden="true">→</span></a>
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
        <span class="ft__muted">${t.ab.labels.time} <time class="ft__clock" data-clock>CET</time></span>
      </section>
      <section class="ft__col">
        <h2 class="ft__label">${t.ftLabels[3]}</h2>
        <a href="${C.home}?grid"${kind === 'grid' ? ' aria-current="page"' : ''}>${t.projects} <sup>${pad(N)}</sup></a>
        <a href="${C.servicesUrl}"${kind === 'services' ? ' aria-current="page"' : ''}>${t.services}</a>
        <a href="${C.aboutUrl}"${kind === 'about' ? ' aria-current="page"' : ''}>${t.about}</a>
        <a href="${C.brief}"${kind === 'brief' ? ' aria-current="page"' : ''}>${t.start}</a>
        <button class="ft__top" data-top>${t.top} <span aria-hidden="true">↑</span></button>
      </section>
    </div>
    <p class="ft__name" data-reveal aria-hidden="true"><span class="mask"><span>[Manel Vila]</span></span></p>
    <div class="ft__legal">
      <span>© ${year} ${PERSON.name}</span>
      <span>${t.member}</span>
      <span>Always WIPing [Working In Play]</span>
      <a class="ft__legal-link" href="${C.legalUrl}"${kind === 'legal' ? ' aria-current="page"' : ''}>${t.legal}</a>
      ${langSwitch(C)}
    </div>
  </footer>`;
}

/**
 * Esquinas: la interfaz vive en las cuatro esquinas. Arriba, el monograma y el botón grid;
 * abajo, a la izquierda un dato (email o el proyecto y su pieza) y a la derecha Instagram.
 */
function corners(C, left = `<a class="corner corner--l" href="${C.brief}">${C.t.talk}</a>`) {
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
      ? img(R, th, { alt: `${p.name} — ${p.tag}`, sizes: TILE_SIZES })
      : `<span class="cover"><span class="cover__title">[${esc(p.name)}]</span></span>`;
    return `
      <a class="tile" href="${C.pj(p)}" data-index="${i}" style="--i:${i}" aria-label="${esc(`${pad(i + 1)} ${p.name} — ${p.tag}`)}">
        <span class="tile__media"${p.media && p.media.bg ? ` style="--bg:${p.media.bg}"` : ''}>${vis}</span>
        <span class="tile__cap"><span class="tile__num">${pad(i + 1)}</span><span class="tile__name">${esc(p.name)}</span><span class="tile__tag">${esc(p.tag)}</span></span>
      </a>`;
  }).join('');
  const first = P[0].media || {};
  const lcp = first.poster || (first.type === 'image' ? first.src : '');
  return `${head(C, {
    title: t.home.title,
    description: t.home.desc,
    jsonld: [{ '@context': 'https://schema.org', '@graph': [websiteLD(lang), personLD(lang), studioLD(), {
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
        <p class="grid__by">${PERSON.name} — ${t.job}. Valencia · Barcelona</p>
      </header>${tiles}${ctaTile(C, C.brief, N + 1, N + 1)}
      ${footer(C, { kind: 'grid', cta: false })}
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
        ${m.poster ? img(R, m.poster, { alt: `${p.name} — ${t.pj.cover}`, sizes: TILE_SIZES, lazy: false, cls: 'pj__poster', extra: ' aria-hidden="true"' }) : ''}
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
    const alt = `${p.name} (${p.tag}) — ${t.pj.image(j + 1, total)}`;
    const sizes = kinds[j] === 'full' ? '100vw' : '(max-width: 923px) 100vw, 50vw';
    return `
      <figure class="g g--${kinds[j]}${flush[j] ? ' g--flush' : ''}" data-reveal data-n="${j}">
        <button class="g__open" aria-label="${t.pj.enlarge(j + 1, total)}">${img(R, src, { alt, sizes, extra: vid && exists(vid) ? videoData(R, vid) : '' })}</button>
      </figure>`;
  }).join('');

  const meta = [];
  if (p.services.length) meta.push([t.pj.services, p.services.map(esc)]);
  const parts = p.tag.split(/\s*\+\s*/), ts = tagServices(i);
  meta.push([t.pj.discipline, parts.map((x, k) => (ts[k] ? `<a href="${C.svc(ts[k])}">${esc(x)}</a>` : esc(x))).join(' + ')]);
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
    // Bing marca como error los títulos largos y Google los corta: como mucho 60 caracteres
    // (la firma «diseñador gráfico» / «graphic designer» va antes que la disciplina: así cada idioma tiene su título)
    title: [`${p.name} — ${p.tag} · ${t.pj.by}`, `${p.name} · ${t.pj.by}`, `${p.name} · ${t.pj.byShort}`, `${p.name} — ${p.tag} · ${PERSON.name}`, `${p.name} · ${PERSON.name}`].find((x) => x.length <= 60) || `${p.name} · ${PERSON.name}`,
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
        abstract: p.short,
        genre: p.tag,
        keywords: [p.tag, ...p.services].join(', '),
        thumbnailUrl: abs(thumbOf(p) || 'content/posters/og.jpg'),
        author: { '@id': `${SITE}/#manel-vila` },
        url: `${SITE}/${C.here}`,
        image: imgs.map(abs),
        inLanguage: lang,
        creator: { '@id': `${SITE}/#manel-vila` },
        ...(p.studio ? { producer: { '@type': 'Organization', name: p.studio } } : {}),
        ...(p.year ? { dateCreated: String(p.year) } : {}),
        isPartOf: { '@id': `${SITE}/#web` }
      },
      personLD(lang),
      studioLD(),
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

    <aside class="pj__cta sheet" aria-label="${t.start}">
      <span class="pj__cta-num">(${pad(N + 1)})</span>
      <p><span>${esc(t.cta.q(p.name))}</span> <a href="${briefHref(C, { s: mainService(i), from: p.slug })}">${t.cta.go} <span aria-hidden="true">→</span></a></p>
    </aside>

    <nav class="pj__nav" aria-label="${t.pj.more}">
      <a class="pj__next" href="${C.pj(nx)}" rel="next">
        ${nxThumb ? `<span class="pj__next-img"${nx.media && nx.media.bg ? ` style="--bg:${nx.media.bg}"` : ''}>${img(R, nxThumb, { alt: `${nx.name} — ${nx.tag}`, sizes: '100vw' })}</span>` : ''}
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
  // Cada servicio de la lista enlaza a su página cuando la tiene
  const svcFor = (name) => SERVICES.find((s) => s.match({ tag: name, services: [] })) ||
    ({ 'Identidad corporativa': SERVICES[0], 'Brand identity': SERVICES[0], Packaging: SERVICES[0], 'Art direction': SERVICES[1], Posters: SERVICES[3] })[name];
  const rows = [
    [a.labels.services, a.services.map((x) => { const s = svcFor(x); return s ? `<a href="${C.svc(s)}">${esc(x)}</a>` : esc(x); })],
    [a.labels.studio, [PERSON.studio, 'Valencia · Barcelona']],
    [a.labels.collabs, COLLABS.map(esc)],
    [a.labels.clients, CLIENTS.map(esc)],
    [a.labels.education, [esc(a.education)]],
    [a.labels.contact, [
      `<a href="#empezar">${t.start} <span aria-hidden="true">↓</span></a>`,
      `<span class="copyable"><a href="mailto:${PERSON.email}">${PERSON.email.replace('@', '<wbr>@')}</a><button class="copy" data-copy="${PERSON.email}" aria-label="${t.copyEmail}">${t.copy}</button></span>`,
      `<a href="tel:${PERSON.phoneHref}">${PERSON.phone}</a>`,
      ig
    ], ' id="contacto"'],
    [a.labels.time, ['Valencia · Barcelona <time data-clock>CET</time>']]
  ];
  return `${head(C, {
    title: a.title,
    description: a.desc,
    type: 'profile',
    jsonld: [{ '@context': 'https://schema.org', '@graph': [
      { '@type': 'ProfilePage', '@id': `${SITE}/${C.here}#page`, url: `${SITE}/${C.here}`, name: a.title, description: a.desc, inLanguage: lang,
        mainEntity: { '@id': `${SITE}/#manel-vila` }, isPartOf: { '@id': `${SITE}/#web` },
        breadcrumb: { '@type': 'BreadcrumbList', itemListElement: [
          { '@type': 'ListItem', position: 1, name: PERSON.name, item: `${SITE}/${PAGE.home(lang)}` },
          { '@type': 'ListItem', position: 2, name: t.about, item: `${SITE}/${C.here}` }
        ] } },
      personLD(lang),
      studioLD()
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
        ${a.bio.map((x) => `<p>${x.replace('{brief}', '#empezar')}</p>`).join('\n        ')}
      </div>

      ${kv(rows, ' data-reveal')}
    </article>

    <section class="sheet brief yours" id="empezar" aria-labelledby="empezar-title">
      <h2 class="yours__title" id="empezar-title" data-reveal>[${t.yours}]</h2>
      <div class="sheet__head yours__head"><span>(${pad(N + 1)}) ${t.start}</span><span>${t.brief.tagline}</span></div>
      <div class="sheet__text" data-reveal>
        <p>${t.brief.text}</p>
        <p class="brief__reply">${BRIEF.reply[lang]}</p>
      </div>
      ${briefForm(C)}
    </section>
  </main>
${footer(C, { cta: false, kind: 'about' })}
${corners(C, `<a class="corner corner--l" href="#empezar">${t.talk}</a>`)}

${scripts(R, ['vendor/lenis.min', 'ui', 'brief'])}
</body>
</html>
`;
}

/* ---------- PÁGINAS DE TEXTO: servicios, ficha y aviso legal (la misma hoja que el About) ---------- */
function docPage(C, { kind, title, description, jsonld = [], robots, main, back, js = [], corner }) {
  const { R, t } = C;
  return `${head(C, { title, description, jsonld, ...(robots ? { robots } : {}) })}
<body class="doc doc--${kind}">
${franja(C, 'page')}

  <a class="grid-btn" href="${C.home}" data-back aria-label="${esc(back)}">
    <span class="grid-btn__icon" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
    <span class="grid-btn__count">${t.projects}</span>
  </a>
${panels(C, 'page')}

  <main id="contenido">
${main}
  </main>
${footer(C, { cta: kind !== 'brief', kind })}
${corners(C, corner)}

${scripts(R, ['vendor/lenis.min', 'ui', ...js])}
</body>
</html>
`;
}

const crumbs = (lang, items) => ({
  '@type': 'BreadcrumbList',
  itemListElement: [[PERSON.name, PAGE.home(lang)], ...items].map(([name, at], k) => ({ '@type': 'ListItem', position: k + 1, name, item: `${SITE}/${at}` }))
});

/**
 * Casilla «[Tu proyecto]»: la portada tipográfica del proyecto que aún no existe.
 * Al final de una lista de n miniaturas ocupa justo el hueco de la última fila
 * (3 columnas en ordenador; en móvil, dos pequeñas y una grande en bucle).
 */
function ctaTile(C, href, n, num) {
  const { t } = C;
  const rd = n % 3, spanD = rd ? 3 - rd : 3, spanM = n % 3 === 1 ? 1 : 2;
  const ar = (span) => (span === 3 ? '3 / 1' : `${span * 4} / 5`);
  return `
      <a class="tcta${spanM === 1 ? ' tcta--half' : ''}" href="${href}" style="--i:${n};--span-d:${spanD};--span-m:${spanM};--ar-d:${ar(spanD)}">
        <span class="tile__media"><span class="cover"><span class="cover__title">[${t.yours}]</span><span class="cover__lead">${t.youCta} <span aria-hidden="true">→</span></span></span></span>
        <span class="tile__cap"><span class="tile__num">${pad(num)}</span><span class="tile__name">${t.yours}</span><span class="tile__tag">${t.start} <span aria-hidden="true">→</span></span></span>
      </a>`;
}

/** Miniatura de proyecto (las páginas de servicio repiten las del índice, con la misma imagen en caché) */
function workTile(C, i) {
  const p = C.P[i], th = thumbOf(p);
  const vis = th ? img(C.R, th, { alt: `${p.name} — ${p.tag}`, sizes: TILE_SIZES }) : `<span class="cover"><span class="cover__title">[${esc(p.name)}]</span></span>`;
  return `
      <a class="tile" href="${C.pj(p)}" aria-label="${esc(`${pad(i + 1)} ${p.name} — ${p.tag}`)}"${exists(`content/media/tiles/${p.slug}.mp4`) ? ` data-video="${C.R}content/media/tiles/${p.slug}.mp4"` : ''}>
        <span class="tile__media"${p.media && p.media.bg ? ` style="--bg:${p.media.bg}"` : ''}>${vis}</span>
        <span class="tile__cap"><span class="tile__num">${pad(i + 1)}</span><span class="tile__name">${esc(p.name)}</span><span class="tile__tag">${esc(p.tag)}</span></span>
      </a>`;
}

/* Servicios: índice */
function servicesHub(lang) {
  const C = page(lang, PAGE.services(lang), { en: PAGE.services('en'), es: PAGE.services('es') });
  const { t } = C;
  const rows = SERVICES.map((s) => [`<a href="${C.svc(s)}">${esc(s.label[lang])}</a>`, [esc(s.short[lang]), `<span class="kv__muted">${t.svc.n(svcProjects(s).length)}</span>`]]);
  rows.push([t.start, [`<a href="${C.brief}">${t.youCta} <span aria-hidden="true">→</span></a>`]]);
  return docPage(C, {
    kind: 'services', title: t.svc.title, description: t.svc.desc, back: t.svc.close,
    jsonld: [{ '@context': 'https://schema.org', '@graph': [
      { '@type': 'CollectionPage', '@id': `${SITE}/${C.here}#page`, url: `${SITE}/${C.here}`, name: t.svc.title, description: t.svc.desc, inLanguage: lang,
        about: { '@id': `${SITE}/#manel-vila` }, isPartOf: { '@id': `${SITE}/#web` },
        mainEntity: { '@type': 'ItemList', itemListElement: SERVICES.map((s, k) => ({ '@type': 'ListItem', position: k + 1, name: s.name[lang], url: `${SITE}/${PAGE.service(lang, s)}` })) } },
      personLD(lang), studioLD(), crumbs(lang, [[t.services, C.here]])
    ] }],
    main: `    <article class="sheet about__sheet svc" aria-labelledby="doc-title">
      <header class="sheet__head">
        <h1 id="doc-title">${t.services}</h1>
        <span>Valencia · Barcelona</span>
      </header>
      <p class="sheet__tag">${t.svc.tagline}</p>

      <div class="sheet__text" data-reveal>
        ${t.svc.text.map((x) => `<p>${x}</p>`).join('\n        ')}
      </div>

      ${kv(rows, ' data-reveal')}
    </article>`
  });
}

/* Servicios: una página por disciplina, con sus proyectos */
function servicePage(lang, s, k) {
  const C = page(lang, PAGE.service(lang, s), { en: PAGE.service('en', s), es: PAGE.service('es', s) });
  const { t } = C;
  const works = svcProjects(s);
  const title = `${s.label[lang]} ${t.in} Valencia ${t.and} Barcelona · ${PERSON.name}`;
  const description = `${s.name[lang]} ${t.in} Valencia ${t.and} Barcelona. ${s.short[lang]} ${lang === 'en' ? 'Projects by Manel Vila.' : 'Proyectos de Manel Vila.'}`;
  if (title.length > 60) console.warn(`título largo (${title.length}): ${title}`);
  if (description.length > 165) console.warn(`descripción larga (${description.length}): ${description}`);
  const rows = [
    [t.svc.includes, s.includes[lang].map(esc)],
    [t.svc.works, works.map(({ i }) => `<a href="${C.pj(C.P[i])}">${esc(C.P[i].name)}</a>`)],
    [t.svc.all, SERVICES.filter((x) => x !== s).map((x) => `<a href="${C.svc(x)}">${esc(x.label[lang])}</a>`)],
    [t.start, [`<a href="${briefHref(C, { s })}">${t.youCta} <span aria-hidden="true">→</span></a>`]]
  ];
  return docPage(C, {
    kind: 'service', title, description, back: t.svc.close,
    jsonld: [{ '@context': 'https://schema.org', '@graph': [
      { '@type': 'Service', '@id': `${SITE}/${C.here}#service`, name: s.name[lang], serviceType: s.name[lang], url: `${SITE}/${C.here}`,
        description: plain(s.text[lang].join(' ')),
        provider: { '@id': `${SITE}/#manel-vila` },
        areaServed: [{ '@type': 'City', name: 'Valencia' }, { '@type': 'City', name: 'Barcelona' }, { '@type': 'Country', name: lang === 'en' ? 'Spain' : 'España' }],
        hasOfferCatalog: { '@type': 'OfferCatalog', name: s.name[lang], itemListElement: s.includes[lang].map((x) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: x } })) } },
      personLD(lang), studioLD(), crumbs(lang, [[t.services, PAGE.services(lang)], [s.name[lang], C.here]])
    ] }],
    main: `    <article class="sheet about__sheet svc" aria-labelledby="doc-title">
      <header class="sheet__head">
        <h1 id="doc-title">${esc(s.name[lang])}</h1>
        <a href="${C.servicesUrl}">${t.services} <sup>${pad(k + 1)}/${pad(SERVICES.length)}</sup></a>
      </header>
      <p class="sheet__tag">${esc(s.short[lang])}</p>

      <div class="sheet__text" data-reveal>
        ${s.text[lang].map((x) => `<p>${esc(x)}</p>`).join('\n        ')}
      </div>

      ${kv(rows, ' data-reveal')}
    </article>

    <section class="works" aria-labelledby="works-title">
      <h2 class="works__head" id="works-title"><span>${t.svc.works}</span><span>(${pad(works.length)})</span></h2>${works.map(({ i }) => workTile(C, i)).join('')}${ctaTile(C, briefHref(C, { s }), works.length, N + 1)}
    </section>`
  });
}

/* Ficha «Empezar un proyecto»: se envía ya escrita desde el correo o el WhatsApp de quien la rellena.
   Vive en su propia página y al final del About, donde se decide escribir. */
function briefForm(C) {
  const { t, lang } = C;
  const b = t.brief;
  const num = (k) => `(${pad(k)})`;
  const picks = (name, options, type = 'radio') => `<div class="picks">${options.map((o) =>
    `<label class="pick"><input type="${type}" name="${name}" value="${esc(o.label || o)}"${o.key ? ` data-key="${o.key}"` : ''}><span>${esc(o.label || o)}</span></label>`).join('')}</div>`;
  const row = (k, body) => `
        <div class="kv__row" role="group" aria-labelledby="b${k}"><span class="kv__k" id="b${k}">${num(k)} ${b.labels[k - 1]}</span><div class="kv__v">${body}</div></div>`;
  const field = (name, label, attrs = '') => `<label class="field"><span class="sr-only">${label}</span><input name="${name}" placeholder="${esc(label)}"${attrs}></label>`;
  const i18n = { ...b.msg, labels: b.labels, done: b.done, page: `${SITE}/${C.here}`, projects: Object.fromEntries(C.P.map((p) => [p.slug, p.name])) };
  return `<form class="kv brief__form" action="mailto:${PERSON.email}?subject=${encodeURIComponent(b.msg.subject)}" method="post" enctype="text/plain" data-email="${PERSON.email}" data-wa="${BRIEF.whatsapp}">${row(1, picks('need', NEEDS.map((n) => ({ key: n.key, label: n.label[lang] })), 'checkbox'))}${row(2, picks('stage', b.stage))}${row(3, picks('when', b.when))}${row(4, picks('budget', BRIEF.budgets[lang]))}${row(5, `<label class="field field--area"><span class="sr-only">${b.about}</span><textarea name="about" rows="3" placeholder="${esc(b.about)}"></textarea></label>`)}${row(6, `<div class="fields">
          ${field('name', b.you.name, ' autocomplete="name" required')}
          ${field('brand', b.you.brand, ' autocomplete="organization"')}
          ${field('email', b.you.email, ' type="email" autocomplete="email" inputmode="email" required')}
          ${field('phone', b.you.phone, ' type="tel" autocomplete="tel" inputmode="tel"')}
        </div>`)}
        <input type="hidden" name="from"><input type="hidden" name="src">
        <div class="kv__row brief__send"><span class="kv__k" aria-hidden="true"></span><div class="kv__v">
          <div class="brief__btns">
            <button type="submit" class="btn btn--fill" data-via="email">${b.send} <span aria-hidden="true">↗</span></button>${BRIEF.whatsapp ? `
            <button type="button" class="btn" data-via="wa">${b.wa} <span aria-hidden="true">↗</span></button>` : ''}
          </div>
          <p class="brief__note">${b.note} <a href="${C.legalUrl}">${t.legal}</a>.</p>
          <div class="brief__done" role="status" aria-live="polite" hidden>
            <p class="brief__done-msg"></p>
            <p class="brief__fallback">${b.fallback} <a href="mailto:${PERSON.email}">${PERSON.email}</a>. <button type="button" class="copy" data-copy="">${b.copy}</button></p>
          </div>
        </div></div>
      </form>
      <script type="application/json" id="brief-i18n">${JSON.stringify(i18n).replace(/</g, '\\u003c')}</script>`;
}

function brief(lang) {
  const C = page(lang, PAGE.brief(lang), { en: PAGE.brief('en'), es: PAGE.brief('es') });
  const { t } = C;
  const b = t.brief;
  return docPage(C, {
    kind: 'brief', title: b.title, description: b.desc, back: b.close, js: ['brief'],
    corner: `<a class="corner corner--l" href="mailto:${PERSON.email}">Email</a>`,
    jsonld: [{ '@context': 'https://schema.org', '@graph': [
      { '@type': 'ContactPage', '@id': `${SITE}/${C.here}#page`, url: `${SITE}/${C.here}`, name: b.title, description: b.desc, inLanguage: lang,
        about: { '@id': `${SITE}/#manel-vila` }, isPartOf: { '@id': `${SITE}/#web` } },
      personLD(lang), studioLD(), crumbs(lang, [[t.start, C.here]])
    ] }],
    main: `    <article class="sheet about__sheet brief" aria-labelledby="doc-title">
      <header class="sheet__head">
        <h1 id="doc-title">${t.start}</h1>
        <span>(${pad(N + 1)}) ${t.yours}</span>
      </header>
      <p class="sheet__tag">${b.tagline}</p>

      <div class="sheet__text" data-reveal>
        <p>${b.text}</p>
        <p class="brief__reply">${BRIEF.reply[lang]}</p>
      </div>

      ${briefForm(C)}
    </article>`
  });
}

/* Aviso legal y privacidad (LSSI-CE y RGPD). No se indexa. */
const LEGAL_TEXT = {
  en: (C) => [
    ['Website owner', [
      `In accordance with Spanish Law 34/2002 on information society services (LSSI-CE): this website, manelvila.com, belongs to ${LEGAL.holder}${LEGAL.nif ? `, tax ID ${LEGAL.nif}` : ''}${LEGAL.address ? `, ${LEGAL.address}` : ''}.`,
      `Contact: <a href="mailto:${PERSON.email}">${PERSON.email}</a> · <a href="tel:${PERSON.phoneHref}">${PERSON.phone}</a>.`
    ]],
    ['Use of the website', [
      'manelvila.com is the professional portfolio of Manel Vila. The projects shown belong to their authors and clients: please don’t reproduce them without permission.'
    ]],
    ['Privacy', [
      `Data controller: ${LEGAL.holder} (<a href="mailto:${PERSON.email}">${PERSON.email}</a>).`,
      'What data: whatever you send me by email, phone or WhatsApp, or with the “Start a project” sheet: your name, email, phone, company and what you tell me about your project. The sheet doesn’t store anything on this website: it is sent from your own email or WhatsApp.',
      'What for: to reply to you and, if you ask for it, to prepare a proposal.',
      'Legal basis: your own request (steps prior to entering into a contract, art. 6.1.b GDPR).',
      'How long: for as long as our conversation or working relationship lasts, and afterwards for the periods required by law (for instance, tax obligations).',
      'Who else: nobody, unless the law requires it. Email goes through Google (Gmail) and, if you choose WhatsApp, through WhatsApp (Meta). The website is hosted on Cloudflare.',
      `Your rights: you can access, rectify or erase your data, object to or restrict its use, and ask for portability by writing to <a href="mailto:${PERSON.email}">${PERSON.email}</a>. If you think they haven’t been respected, you can complain to the Spanish Data Protection Agency (<a href="https://www.aepd.es" target="_blank" rel="noopener">aepd.es</a>).`
    ]],
    ['Cookies', [
      'This website uses no tracking, advertising or analytics cookies. Your browser only keeps technical details so the site works well (such as which page you arrived from, or which video format your device plays). They are not sent anywhere, and the page you arrived from only goes in the sheet if you decide to send it.'
    ]]
  ],
  es: (C) => [
    ['Titular', [
      `En cumplimiento de la Ley 34/2002 de servicios de la sociedad de la información (LSSI-CE): esta web, manelvila.com, es de ${LEGAL.holder}${LEGAL.nif ? `, NIF ${LEGAL.nif}` : ''}${LEGAL.address ? `, ${LEGAL.address}` : ''}.`,
      `Contacto: <a href="mailto:${PERSON.email}">${PERSON.email}</a> · <a href="tel:${PERSON.phoneHref}">${PERSON.phone}</a>.`
    ]],
    ['Uso de la web', [
      'manelvila.com es el portfolio profesional de Manel Vila. Los proyectos que se muestran son de sus autores y clientes: no los reproduzcas sin permiso.'
    ]],
    ['Privacidad', [
      `Responsable: ${LEGAL.holder} (<a href="mailto:${PERSON.email}">${PERSON.email}</a>).`,
      'Qué datos: los que me envíes por email, teléfono o WhatsApp, o con la ficha «Empezar un proyecto»: tu nombre, email, teléfono, empresa y lo que me cuentes de tu proyecto. La ficha no guarda nada en esta web: se envía desde tu propio correo o WhatsApp.',
      'Para qué: para responderte y, si me lo pides, prepararte una propuesta.',
      'Base legal: tu propia solicitud (aplicación de medidas precontractuales, art. 6.1.b del RGPD).',
      'Cuánto tiempo: mientras dure nuestra conversación o relación profesional y, después, los plazos que exija la ley (por ejemplo, obligaciones fiscales).',
      'Con quién: con nadie, salvo obligación legal. El correo pasa por Google (Gmail) y, si eliges WhatsApp, por WhatsApp (Meta). La web está alojada en Cloudflare.',
      `Tus derechos: puedes acceder a tus datos, rectificarlos o suprimirlos, oponerte a su uso o limitarlo y pedir su portabilidad escribiendo a <a href="mailto:${PERSON.email}">${PERSON.email}</a>. Si crees que no se han respetado, puedes reclamar ante la Agencia Española de Protección de Datos (<a href="https://www.aepd.es" target="_blank" rel="noopener">aepd.es</a>).`
    ]],
    ['Cookies', [
      'Esta web no usa cookies de seguimiento, publicidad ni analítica. Tu navegador solo guarda datos técnicos para que funcione bien (por ejemplo, desde qué página llegaste o qué formato de vídeo reproduce tu dispositivo). No se envían a ningún sitio, y la página de llegada solo va en la ficha si decides enviarla.'
    ]]
  ]
};
function legal(lang) {
  const C = page(lang, PAGE.legal(lang), { en: PAGE.legal('en'), es: PAGE.legal('es') });
  const { t } = C;
  const secs = LEGAL_TEXT[lang](C);
  return docPage(C, {
    kind: 'legal', title: t.lg.title, description: t.lg.desc, back: t.svc.close, robots: 'noindex, follow',
    main: `    <article class="sheet about__sheet legal" aria-labelledby="doc-title">
      <header class="sheet__head">
        <h1 id="doc-title">${t.legal}</h1>
        <span>${t.lg.updated} ${LEGAL.updated}</span>
      </header>
${secs.map(([h, ps]) => `
      <section class="legal__sec">
        <h2>${h}</h2>
        <div class="sheet__text">${ps.map((x) => `<p>${x}</p>`).join('')}</div>
      </section>`).join('')}
    </article>`
  });
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
${sitemapEntry({ en: PAGE.services('en'), es: PAGE.services('es') }, '0.8')}
${SERVICES.map((sv) => sitemapEntry({ en: PAGE.service('en', sv), es: PAGE.service('es', sv) }, '0.8')).join('\n')}
${sitemapEntry({ en: PAGE.brief('en'), es: PAGE.brief('es') }, '0.6')}
${BASE.map((p) => sitemapEntry({ en: PAGE.project('en', p), es: PAGE.project('es', p) }, '0.8',
  [thumbOf(p), ...p.gallery.map((e) => e[0])].filter(Boolean).slice(0, 30))).join('\n')}
</urlset>
`;

/* ---------- llms.txt: resumen de la web para modelos de lenguaje (ChatGPT, Claude, Perplexity…) ----------
   Formato propuesto en llmstxt.org: Markdown con quién es Manel, qué hace y enlaces a cada página.
   llms-full.txt lleva además los textos completos (About y proyectos, en inglés y en español). */
const strip = (h) => String(h).replace(/<[^>]+>/g, '');
const pjLine = (lang, p) => {
  const meta = [p.tag, p.studio, p.year].filter(Boolean).join(' · ');
  return `- [${p.name}](${SITE}/${PAGE.project(lang, p)}): ${plain(p.short)} (${meta})`;
};
const facts = (lang) => {
  const a = T[lang].ab, en = lang === 'en';
  return [
    `- ${en ? 'Role' : 'Oficio'}: ${T[lang].job}`,
    `- ${en ? 'Based in' : 'Base'}: Valencia · Barcelona (${en ? 'Spain' : 'España'})`,
    `- ${en ? 'Studio' : 'Estudio'}: ${en ? 'member of' : 'miembro de'} ${PERSON.studio}`,
    `- ${a.labels.education}: ${a.education}`,
    `- ${a.labels.services}: ${a.services.join(', ')}`,
    `- ${a.labels.collabs}: ${COLLABS.join(', ')}`,
    `- ${a.labels.clients}: ${CLIENTS.join(', ')}`,
    `- ${a.labels.contact}: ${PERSON.email} · ${PERSON.phone} · Instagram ${PERSON.instagramLabel} (${PERSON.instagram})`
  ].join('\n');
};
const llms = `# Manel Vila

> Manel Vila is a graphic designer and art director based in Valencia and Barcelona (Spain), focused on branding and brand identity. He is a member of the independent studio ${PERSON.studio} and studied at EASD Valencia (School of Art and Design). This site is his portfolio, in English (${SITE}/) and Spanish (${SITE}/es/).
>
> Manel Vila es diseñador gráfico y director de arte en Valencia y Barcelona, especializado en branding e identidad corporativa. Es miembro del estudio ${PERSON.studio} y estudió en la EASD de Valencia.
>
> Identity: ${IDENTITY.en} ${NOT_HIM.en}
> Identidad: ${IDENTITY.es} ${NOT_HIM.es}

${facts('en')}

## About

- [About Manel Vila](${SITE}/${PAGE.about('en')}): profile, services, studio, collaborations, clients and contact
- [Sobre Manel Vila (español)](${SITE}/${PAGE.about('es')}): perfil, servicios, estudio, colaboraciones, clientes y contacto
- [Start a project](${SITE}/${PAGE.brief('en')}): short brief to hire Manel Vila (sent by email or WhatsApp)
- [Empezar un proyecto (español)](${SITE}/${PAGE.brief('es')}): ficha breve para encargar un proyecto a Manel Vila

## Services

${SERVICES.map((sv) => `- [${sv.name.en}](${SITE}/${PAGE.service('en', sv)}): ${sv.short.en} (${svcProjects(sv).map(({ p }) => PROJ.en.find((x) => x.slug === p.slug).name).join(', ')})`).join('\n')}

## Servicios (español)

${SERVICES.map((sv) => `- [${sv.name.es}](${SITE}/${PAGE.service('es', sv)}): ${sv.short.es}`).join('\n')}

## Projects

${PROJ.en.map((p) => pjLine('en', p)).join('\n')}

## Proyectos (español)

${PROJ.es.map((p) => pjLine('es', p)).join('\n')}

## Optional

- [Full text of the site](${SITE}/llms-full.txt): About and every project, in English and Spanish
- [Sitemap](${SITE}/sitemap.xml)
`;
const fullProject = (lang, p) => {
  const t = T[lang];
  return [`### ${p.name}`, '', `${SITE}/${PAGE.project(lang, p)}`, '', plain(p.long || p.short), '',
    `- ${t.pj.discipline}: ${p.tag}`,
    p.services.length ? `- ${t.pj.services}: ${p.services.join(', ')}` : '',
    p.studio ? `- ${t.pj.studio}: ${p.studio}` : '',
    p.team ? `- ${t.pj.team}: ${p.team}` : '',
    p.year ? `- ${t.pj.year}: ${p.year}` : '',
    `- ${t.pj.design}: ${PERSON.name}`].filter((x) => x !== '').join('\n');
};
const fullLang = (lang) => {
  const a = T[lang].ab, en = lang === 'en';
  return `## ${en ? 'About Manel Vila' : 'Sobre Manel Vila'}

${SITE}/${PAGE.about(lang)}

${a.tagline}

${a.bio.map(strip).join('\n\n')}

${facts(lang)}

## ${en ? 'Services' : 'Servicios'}

${SERVICES.map((sv) => `### ${sv.name[lang]}\n\n${SITE}/${PAGE.service(lang, sv)}\n\n${sv.text[lang].join('\n\n')}\n\n- ${T[lang].svc.includes}: ${sv.includes[lang].join(', ')}`).join('\n\n')}

${en ? 'Start a project' : 'Empezar un proyecto'}: ${SITE}/${PAGE.brief(lang)}

## ${en ? 'Projects' : 'Proyectos'}

${PROJ[lang].map((p) => fullProject(lang, p)).join('\n\n')}`;
};
const llmsFull = `# Manel Vila — ${T.en.job} / ${T.es.job}

> Full text of manelvila.com for language models: the About page and every project, first in English and then in Spanish. Summary and links: ${SITE}/llms.txt
>
> Identity: ${IDENTITY.en} ${NOT_HIM.en}
> Identidad: ${IDENTITY.es} ${NOT_HIM.es}

${fullLang('en')}

---

${fullLang('es')}
`;

/* ---------- escribir ---------- */
for (const lang of LANGS) {
  write(`${PAGE.home(lang)}index.html`, home(lang));
  write(`${PAGE.about(lang)}index.html`, about(lang));
  PROJ[lang].forEach((p, i) => write(`${PAGE.project(lang, p)}index.html`, project(lang, i)));
  write(`${PAGE.services(lang)}index.html`, servicesHub(lang));
  SERVICES.forEach((sv, k) => write(`${PAGE.service(lang, sv)}index.html`, servicePage(lang, sv, k)));
  write(`${PAGE.brief(lang)}index.html`, brief(lang));
  write(`${PAGE.legal(lang)}index.html`, legal(lang));
}
// Direcciones antiguas → su equivalente en español
write('about.html', redirect('', PAGE.about('es'), `About — ${PERSON.name}`));
BASE.forEach((p) => write(`proyectos/${p.slug}/index.html`, redirect(`proyectos/${p.slug}/`, PAGE.project('es', p), `${p.name} — ${PERSON.name}`)));
write('sitemap.xml', sitemap);
write('llms.txt', llms);
// Huella de esta versión (páginas, estilos y scripts): el aviso a los buscadores la compara con la
// publicada en manelvila.com para saber cuándo Cloudflare ya sirve la versión nueva
{
  const h = createHash('sha1');
  const files = ['index.html', 'about/index.html', 'es/index.html', 'es/about/index.html', 'assets/css/style.css',
    ...fs.readdirSync(path.join(ROOT, 'assets/js')).filter((f) => f.endsWith('.js')).map((f) => `assets/js/${f}`)];
  files.forEach((f) => h.update(fs.readFileSync(path.join(ROOT, f))));
  write('version.txt', h.digest('hex').slice(0, 16) + '\n');
}
write('llms-full.txt', llmsFull);

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
