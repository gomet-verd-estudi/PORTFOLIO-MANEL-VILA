/*
 * Contenido de la web. Un objeto por proyecto, en el orden en que aparecen.
 *
 * media (la portada del proyecto; si el proyecto tiene vídeo, la portada es siempre el vídeo):
 *   - { type: 'video', src: '...', mobile: '...' (opcional), poster: '...', ar: ancho/alto, bg: '#color' }
 *     ar  → proporción del vídeo. Si no encaja con la pantalla (vertical o cuadrado en escritorio),
 *           el vídeo se muestra entero, centrado, sobre el color bg (el fondo del propio vídeo).
 *     arMobile → proporción del vídeo de móvil, si tiene uno distinto.
 *     fillMobile → en móvil ocupa toda la pantalla (se recorta por los lados, sin deformarse)
 *                  en vez de mostrarse entero sobre el color de fondo.
 *     deck → si el vídeo de portada es también una pieza de la galería del deck, su ruta allí (para no repetirlo).
 *   - { type: 'image', src: '...', mobile: '...' (opcional) }
 *   - null  → se muestra una portada tipográfica hasta que se añada el material.
 *
 * studio: estudio en el que se desarrolló el proyecto (se muestra en la ficha).
 *
 * Después de editar este archivo, regenera las páginas: `node tools/build.mjs`.
 */
const U = 'content/uploads/2024/';
const P = 'content/posters/';
const FV = 'content/uploads/figma-video/';
const M = 'content/media/'; // vídeos de portada optimizados para la web (tools/videos.sh)
const GVE = 'Gomet Verd Estudi';
const TOT = 'T.O.T Studio';

window.PROJECTS = [
  {
    slug: 'vintage-palace',
    studio: GVE,
    name: 'Vintage Palace',
    tag: 'Branding',
    short: 'Identidad para Vintage Palace.',
    long: 'Creamos la identidad de Vintage Palace capturando la esencia urbana y potente de los años 80, 90 y 2000, incorporando elementos exclusivos y llamativos a partir del concepto “Palace” y manteniendo sus raíces como base para el diseño.',
    services: ['Identidad corporativa', 'RRSS', 'Packaging', '3D', 'Dirección de arte'],
    team: 'Junto a @albaocanya. Fotografía de @thisisart.',
    media: { type: 'video', src: M + 'vintage-palace.mp4', poster: P + 'vintage-palace.jpg', ar: 720 / 1280, bg: '#fbfbfb', deck: FV + 'vintage-palace/01.mp4' }
  },
  {
    slug: '404-studio',
    studio: GVE,
    name: '404 Studio',
    tag: 'Branding + Artwork',
    short: 'Identidad y gráfica de desfile para la 080 Barcelona Fashion Week.',
    long: 'Diseño de la nueva identidad del estudio de moda 404 Studio y de la gráfica para su última colección “No me quedan lágrimas”, basada en el cine quinqui de los 80 y presentada en la 080 Barcelona Fashion Week.',
    services: ['Identidad corporativa', 'Gráfica para el desfile 080', 'Tipografía para camisetas en colaboración con Adidas'],
    team: '',
    media: { type: 'video', src: M + '404-studio.mp4', mobile: M + '404-studio-movil.mp4', poster: P + '404.jpg', ar: 16 / 9, arMobile: 1080 / 1920, bg: '#000' }
  },
  {
    slug: 'claur-tiles',
    studio: GVE,
    name: 'Claur Tiles',
    tag: 'Branding',
    short: 'Nueva identidad de Claur Tiles.',
    long: 'Diseño de la nueva identidad de Claur Tiles, un taller de fabricación de azulejos realizados a mano para cada cliente, especializado en proyectos de interiorismo y arquitectura.',
    services: ['Identidad corporativa', 'Packaging', 'Dirección de arte'],
    team: 'Fotografía de @mmariavaroo.',
    media: { type: 'video', src: M + 'claur-tiles.mp4', poster: P + 'claur.jpg', ar: 1, bg: '#000', fillMobile: true }
  },
  {
    slug: 'bernal-vida-y-milagros',
    studio: GVE,
    name: 'Bernal / Vida y Milagros',
    tag: 'Branding + Editorial',
    short: 'Universo gráfico para el segundo álbum de Bernal.',
    long: 'Para Vida y Milagros, el segundo álbum de Bernal, desarrollamos un universo gráfico inspirado en el movimiento, los paisajes y esa nostalgia que aparece mientras la vida sigue avanzando. A través de la conceptualización gráfica, el branding, el diseño del vinilo, la creación de stickers y los títulos y créditos, construimos una identidad visual que acompaña el viaje del disco y conecta todas sus piezas desde una misma mirada.',
    services: ['Conceptualización gráfica', 'Branding e identidad visual', 'Diseño de vinilo', 'Diseño de stickers', 'Diseño de títulos y créditos', 'Merchandising'],
    team: 'Junto a @d.matinada.',
    media: { type: 'video', src: FV + 'bernal-vida-y-milagros/portada.mp4', poster: P + 'bernal-vida-y-milagros.jpg', ar: 480 / 846, bg: '#fefcff' }
  },
  {
    slug: 'dmatinada',
    studio: GVE,
    name: 'D’Matinada',
    tag: 'Branding',
    short: 'Identidad para el estudio creativo D’Matinada.',
    long: 'El estudio creativo D’Matinada nos pidió que creáramos su identidad, plasmando en ella el alma que ponen en cada proyecto y la dualidad que se genera al trabajar en un proyecto creativo: lo artesanal y cálido del proceso, sumado a la técnica y la seriedad necesarias para lograr un gran resultado.',
    services: ['Identidad corporativa', 'RRSS', 'Web (WIP)'],
    team: '',
    media: { type: 'video', src: FV + 'dmatinada/01.mp4', poster: P + 'dmatinada.jpg', ar: 1, bg: '#7e95cb' }
  },
  {
    slug: 'orbis-vacui',
    studio: GVE,
    name: 'Orbis Vacui',
    tag: 'Branding',
    short: 'Identidad para la promotora sociocultural Orbis Vacui.',
    long: 'Identidad corporativa para la promotora sociocultural Orbis Vacui. Una imagen fresca, coherente, atractiva y flexible: estas son algunas de las características que se intentaron plasmar en su diseño.',
    services: ['Identidad', 'Web (WIP)'],
    team: '',
    media: { type: 'video', src: FV + 'orbis-vacui/09.mp4', poster: P + 'orbis-vacui.jpg', ar: 1, bg: '#000', fillMobile: true }
  },
  {
    slug: 'leo-rizzi',
    year: 2022,
    studio: GVE,
    name: 'Leo Rizzi · Gira 2022',
    tag: 'Lettering + Cartelería',
    short: 'Cartel de la gira “Bailando alrededor del río”.',
    long: 'El cantante Leo Rizzi nos pidió el cartel de su gira, “Bailando alrededor del río”, y su adaptación a los formatos de Instagram. Partiendo de su estilo musical y del título de la gira, planteamos como concepto las plantas que crecen alrededor del río y cómo bailan cuando las mece el viento.',
    services: ['Lettering', 'Cartelería'],
    team: 'Fotografía de @stteveenn.',
    media: { type: 'video', src: M + 'leo-rizzi.mp4', poster: P + 'leo-rizzi.jpg', ar: 9 / 16, bg: '#000' }
  },
  {
    slug: 'bernal',
    studio: GVE,
    name: 'Bernal / ¿Qué tal todo allí fuera?',
    tag: 'Lettering + Editorial',
    short: 'Títulos del videoclip “Parques” y funda de vinilo hecha a mano.',
    long: 'Diseño del título y los créditos del videoclip “Parques”, del grupo Bernal, que explora la nostalgia de la infancia. En la misma línea gráfica desarrollamos la funda de su vinilo “¿Qué tal todo allí fuera?”, una edición especial de cincuenta copias hechas a mano.',
    services: ['Créditos', 'Lettering', 'Fundas para vinilo'],
    team: 'Junto a @d.matinada.',
    media: { type: 'video', src: FV + 'bernal/03.mp4', poster: P + 'bernal-parques.jpg', ar: 628 / 356, bg: '#000' }
  },
  {
    slug: 'kaniche',
    studio: GVE,
    name: 'Kaniche Pedigree Hot Dogs',
    tag: 'Artwork + Dirección de arte',
    short: 'Cartelería interior entre la actitud punk y la alta sociedad.',
    long: 'Diseño y dirección de arte de la cartelería interior del restaurante Kaniche Pedigree Hot Dogs: carteles únicos que combinan la estética y la actitud punk con el ambiente y la personalidad de la alta sociedad.',
    services: ['Cartelería interior', 'Dirección de arte'],
    team: '3D de @pablopolar. Fotografía de @carlottakunst.',
    media: null
  },
  {
    slug: 'cisma',
    studio: GVE,
    name: 'Cisma',
    tag: 'Editorial',
    short: 'Fotolibro documental sobre Alzira.',
    long: 'Fotolibro documental sobre el cambio estético urbano que ha vivido la ciudad de Alzira, desde la década de 1920 hasta la actualidad.',
    services: ['Editorial', 'Tipografía (WIP)'],
    team: '',
    media: { type: 'image', src: 'content/uploads/figma/cisma/08.jpg' }
  },

  /* — Otros trabajos (material ya publicado en la web anterior) — */
  {
    slug: 'zelandia-walk',
    name: 'Zelandia Walk',
    tag: 'Branding + Editorial',
    short: 'Branding y editorial para Zelandia Walk.',
    long: '',
    services: ['Branding', 'Editorial'],
    team: '',
    media: { type: 'video', src: M + 'zelandia-walk.mp4', mobile: M + 'zelandia-walk-movil.mp4', poster: P + 'zelandia.jpg', ar: 16 / 9, arMobile: 1080 / 1926, bg: '#fff' }
  },
  {
    slug: 'sun-and-snow',
    studio: TOT,
    name: 'Sun&Snow',
    tag: 'Motion Graphics',
    short: 'Trabajo realizado en T.O.T Studio.',
    long: '',
    services: ['Motion Graphics'],
    team: '',
    media: { type: 'video', src: M + 'sun-and-snow.mp4', poster: P + 'sunsnow.jpg', ar: 1080 / 1854, bg: '#000' }
  },
  {
    slug: 'delta',
    studio: TOT,
    name: 'Delta',
    tag: 'Motion Graphics + IA',
    short: 'Trabajo realizado en T.O.T Studio.',
    long: '',
    services: ['Motion Graphics', 'IA'],
    team: '',
    media: { type: 'video', src: M + 'delta.mp4', poster: P + 'delta.jpg', ar: 1, bg: '#1f1f1f' }
  },
  {
    slug: 'pontevecchio',
    studio: TOT,
    name: 'Pontevecchio',
    tag: 'Motion Graphics',
    short: 'Trabajo realizado en T.O.T Studio.',
    long: '',
    services: ['Motion Graphics'],
    team: '',
    media: { type: 'video', src: M + 'pontevecchio.mp4', mobile: M + 'pontevecchio-movil.mp4', poster: P + 'pontevecchio.jpg', ar: 2050 / 1080, arMobile: 1080 / 1854, bg: '#000' }
  }
];

/* Une las imágenes extraídas del deck de Figma (assets/js/gallery.js) con cada proyecto.
   Si un proyecto no tiene portada propia, usa la primera imagen de su galería. */
(function () {
  const G = window.GALLERY || {};
  window.PROJECTS.forEach((p) => {
    p.gallery = G[p.slug] || [];
    if (!p.media && p.gallery.length) {
      // Portada: la primera imagen horizontal del deck (escritorio) y la primera vertical (móvil)
      const wide = p.gallery.find(([, w, h]) => w / h >= 1.3) || p.gallery[0];
      const tall = p.gallery.find(([, w, h]) => h / w >= 1.15) || wide;
      p.media = { type: 'image', src: wide[0], mobile: tall[0] };
    }
  });
})();

/*
 * INGLÉS — la web arranca en inglés (raíz) y el español vive en /es/.
 * Cada proyecto puede sobrescribir aquí sus textos: name, tag, short, long, services, team.
 * Lo que no se escriba se queda como en español.
 */
(function () {
  const STUDIO = 'Created at T.O.T Studio.';
  const EN = {
    'vintage-palace': {
      short: 'Brand identity for Vintage Palace.',
      long: 'We created the identity for Vintage Palace by capturing the bold, urban spirit of the ’80s, ’90s and 2000s, bringing in exclusive, eye-catching elements built around the idea of “Palace” while keeping the brand’s roots as the foundation of the design.',
      services: ['Brand identity', 'Social media', 'Packaging', '3D', 'Art direction'],
      team: 'With @albaocanya. Photography by @thisisart.'
    },
    '404-studio': {
      short: 'Identity and runway graphics for 080 Barcelona Fashion Week.',
      long: 'A new identity for fashion studio 404 Studio and the graphics for its latest collection, “No me quedan lágrimas” (I have no tears left), inspired by 1980s Spanish quinqui cinema and presented at 080 Barcelona Fashion Week.',
      services: ['Brand identity', 'Graphics for the 080 runway show', 'T-shirt typography in collaboration with Adidas']
    },
    'claur-tiles': {
      short: 'A new identity for Claur Tiles.',
      long: 'A new identity for Claur Tiles, a workshop that makes handmade tiles for each client, specialising in interior design and architecture projects.',
      services: ['Brand identity', 'Packaging', 'Art direction'],
      team: 'Photography by @mmariavaroo.'
    },
    'bernal-vida-y-milagros': {
      short: 'A visual world for Bernal’s second album.',
      long: 'For Vida y Milagros, Bernal’s second album, we built a visual world inspired by movement, landscapes and the nostalgia that creeps in while life keeps moving forward. Through the graphic concept, branding, vinyl design, stickers, titles and credits, we shaped a visual identity that travels with the record and ties all its pieces together under one way of seeing.',
      services: ['Graphic concept', 'Branding and visual identity', 'Vinyl design', 'Sticker design', 'Titles and credits', 'Merchandising'],
      team: 'With @d.matinada.'
    },
    dmatinada: {
      short: 'Identity for the creative studio D’Matinada.',
      long: 'Creative studio D’Matinada asked us to design their identity, capturing the soul they put into every project and the duality of creative work: the warm, handmade side of the process, together with the technique and rigour it takes to get a great result.',
      services: ['Brand identity', 'Social media', 'Website (WIP)']
    },
    'orbis-vacui': {
      short: 'Identity for the cultural promoter Orbis Vacui.',
      long: 'Brand identity for Orbis Vacui, a social and cultural events promoter. Fresh, coherent, attractive and flexible: these are some of the qualities we set out to capture in the design.',
      services: ['Identity', 'Website (WIP)']
    },
    'leo-rizzi': {
      name: 'Leo Rizzi · 2022 Tour',
      tag: 'Lettering + Posters',
      short: 'Poster for the “Bailando alrededor del río” tour.',
      long: 'Singer Leo Rizzi asked us for the poster for his tour, “Bailando alrededor del río” (Dancing around the river), and its adaptation to Instagram formats. Starting from his music and the tour’s title, the concept became the plants that grow along the river and the way they dance when the wind moves them.',
      services: ['Lettering', 'Posters'],
      team: 'Photography by @stteveenn.'
    },
    bernal: {
      short: 'Titles for the “Parques” music video and a handmade vinyl sleeve.',
      long: 'Title and credits design for “Parques”, a music video by Bernal that explores childhood nostalgia. In the same graphic language we created the sleeve for their vinyl “¿Qué tal todo allí fuera?”, a special edition of fifty handmade copies.',
      services: ['Credits', 'Lettering', 'Vinyl sleeves'],
      team: 'With @d.matinada.'
    },
    kaniche: {
      tag: 'Artwork + Art direction',
      short: 'In-store posters somewhere between punk attitude and high society.',
      long: 'Design and art direction of the in-store posters for Kaniche Pedigree Hot Dogs: one-off posters that blend punk aesthetics and attitude with the atmosphere and personality of high society.',
      services: ['In-store posters', 'Art direction'],
      team: '3D by @pablopolar. Photography by @carlottakunst.'
    },
    cisma: {
      short: 'A documentary photobook about Alzira.',
      long: 'A documentary photobook about the urban and aesthetic transformation of the city of Alzira, from the 1920s to the present day.',
      services: ['Editorial', 'Typography (WIP)']
    },
    'zelandia-walk': { short: 'Branding and editorial design for Zelandia Walk.' },
    'sun-and-snow': { short: STUDIO },
    delta: { tag: 'Motion Graphics + AI', short: STUDIO, services: ['Motion Graphics', 'AI'] },
    pontevecchio: { short: STUDIO }
  };
  window.PROJECTS.forEach((p) => { p.en = EN[p.slug] || {}; });
  // En el navegador, las páginas en inglés usan estos textos (el carrusel y el +info los leen de aquí)
  if (typeof document !== 'undefined' && document.documentElement.lang === 'en') {
    window.PROJECTS.forEach((p) => Object.assign(p, p.en));
  }
})();
