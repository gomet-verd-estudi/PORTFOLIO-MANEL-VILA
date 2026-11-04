/*
 * Contenido de la web. Un objeto por proyecto, en el orden en que aparecen.
 *
 * media:
 *   - { type: 'video', src: '...', mobile: '...' (opcional), poster: '...' }
 *   - { type: 'image', src: '...', mobile: '...' (opcional) }
 *   - null  → se muestra una portada tipográfica hasta que se añada el material.
 *
 * Para añadir la portada de un proyecto: sube el archivo a content/uploads/<slug>/
 * y rellena `media`.
 */
const U = 'content/uploads/2024/';
const P = 'content/posters/';

window.PROJECTS = [
  {
    slug: 'vintage-palace',
    name: 'Vintage Palace',
    tag: 'Branding',
    short: 'Identidad para Vintage Palace.',
    long: 'Creamos la identidad de Vintage Palace capturando la esencia urbana y potente de los años 80, 90 y 2000, incorporando elementos exclusivos y llamativos a partir del concepto “Palace” y manteniendo sus raíces como base para el diseño.',
    services: ['Identidad corporativa', 'RRSS', 'Packaging', '3D', 'Dirección de arte'],
    team: 'Junto a @albaocanya. Fotografía de @thisisart.',
    media: null
  },
  {
    slug: '404-studio',
    name: '404 Studio',
    tag: 'Branding + Artwork',
    short: 'Identidad y gráfica de desfile para la 080 Barcelona Fashion Week.',
    long: 'Diseño de la nueva identidad del estudio de moda 404 Studio y de la gráfica para su última colección “No me quedan lágrimas”, basada en el cine quinqui de los 80 y presentada en la 080 Barcelona Fashion Week.',
    services: ['Identidad corporativa', 'Gráfica para el desfile 080', 'Tipografía para camisetas en colaboración con Adidas'],
    team: '',
    media: { type: 'video', src: U + '404/404_portada_desktop.mp4', mobile: U + '404/404_portada_movile.mp4', poster: P + '404.jpg' }
  },
  {
    slug: 'claur-tiles',
    name: 'Claur Tiles',
    tag: 'Branding',
    short: 'Nueva identidad de Claur Tiles.',
    long: 'Diseño de la nueva identidad de Claur Tiles, un taller de fabricación de azulejos realizados a mano para cada cliente, especializado en proyectos de interiorismo y arquitectura.',
    services: ['Identidad corporativa', 'Packaging', 'Dirección de arte'],
    team: 'Fotografía de @mmariavaroo.',
    media: { type: 'video', src: U + 'claur/ct-video-inicial.mp4', poster: P + 'claur.jpg' }
  },
  {
    slug: 'bernal-vida-y-milagros',
    name: 'Bernal / Vida y Milagros',
    tag: 'Branding + Editorial',
    short: 'Universo gráfico para el segundo álbum de Bernal.',
    long: 'Para Vida y Milagros, el segundo álbum de Bernal, desarrollamos un universo gráfico inspirado en el movimiento, los paisajes y esa nostalgia que aparece mientras la vida sigue avanzando. A través de la conceptualización gráfica, el branding, el diseño del vinilo, la creación de stickers y los títulos y créditos, construimos una identidad visual que acompaña el viaje del disco y conecta todas sus piezas desde una misma mirada.',
    services: ['Conceptualización gráfica', 'Branding e identidad visual', 'Diseño de vinilo', 'Diseño de stickers', 'Diseño de títulos y créditos', 'Merchandising'],
    team: 'Junto a @d.matinada.',
    media: null
  },
  {
    slug: 'dmatinada',
    name: 'D’Matinada',
    tag: 'Branding',
    short: 'Identidad para el estudio creativo D’Matinada.',
    long: 'El estudio creativo D’Matinada nos pidió que creáramos su identidad, plasmando en ella el alma que ponen en cada proyecto y la dualidad que se genera al trabajar en un proyecto creativo: lo artesanal y cálido del proceso, sumado a la técnica y la seriedad necesarias para lograr un gran resultado.',
    services: ['Identidad corporativa', 'RRSS', 'Web (WIP)'],
    team: '',
    media: null
  },
  {
    slug: 'orbis-vacui',
    name: 'Orbis Vacui',
    tag: 'Branding',
    short: 'Identidad para la promotora sociocultural Orbis Vacui.',
    long: 'Identidad corporativa para la promotora sociocultural Orbis Vacui. Una imagen fresca, coherente, atractiva y flexible: estas son algunas de las características que se intentaron plasmar en su diseño.',
    services: ['Identidad', 'Web (WIP)'],
    team: '',
    media: null
  },
  {
    slug: 'leo-rizzi',
    name: 'Leo Rizzi · Gira 2022',
    tag: 'Lettering + Cartelería',
    short: 'Cartel de la gira “Bailando alrededor del río”.',
    long: 'El cantante Leo Rizzi nos pidió el cartel de su gira, “Bailando alrededor del río”, y su adaptación a los formatos de Instagram. Partiendo de su estilo musical y del título de la gira, planteamos como concepto las plantas que crecen alrededor del río y cómo bailan cuando las mece el viento.',
    services: ['Lettering', 'Cartelería'],
    team: 'Fotografía de @stteveenn.',
    media: { type: 'video', src: U + 'leo-rizzi/storie_2_leorizzi_1.mp4', poster: P + 'leo-rizzi.jpg' }
  },
  {
    slug: 'bernal',
    name: 'Bernal / ¿Qué tal todo allí fuera?',
    tag: 'Lettering + Editorial',
    short: 'Títulos del videoclip “Parques” y funda de vinilo hecha a mano.',
    long: 'Diseño del título y los créditos del videoclip “Parques”, del grupo Bernal, que explora la nostalgia de la infancia. En la misma línea gráfica desarrollamos la funda de su vinilo “¿Qué tal todo allí fuera?”, una edición especial de cincuenta copias hechas a mano.',
    services: ['Créditos', 'Lettering', 'Fundas para vinilo'],
    team: 'Junto a @d.matinada.',
    media: null
  },
  {
    slug: 'kaniche',
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
    name: 'Cisma',
    tag: 'Editorial',
    short: 'Fotolibro documental sobre Alzira.',
    long: 'Fotolibro documental sobre el cambio estético urbano que ha vivido la ciudad de Alzira, desde la década de 1920 hasta la actualidad.',
    services: ['Editorial', 'Tipografía (WIP)'],
    team: '',
    media: null
  },

  /* — Otros trabajos (material ya publicado en la web anterior) — */
  {
    slug: 'zelandia-walk',
    name: 'Zelandia Walk',
    tag: 'Branding + Editorial',
    short: 'Branding y editorial.',
    long: '',
    services: ['Branding', 'Editorial'],
    team: '',
    media: { type: 'video', src: U + 'zelandia/zelandia_animación_desktop.mp4', mobile: U + 'zelandia/zelandia_animación_acortada.mp4', poster: P + 'zelandia.jpg' }
  },
  {
    slug: 'way',
    name: 'Way',
    tag: '3D',
    short: 'Pieza 3D.',
    long: '',
    services: ['3D'],
    team: '',
    media: { type: 'video', src: U + 'way/inflable amorfo FINAL HORIZONTAL_1.mp4', mobile: U + 'way/inflable amorfo FINAL VERTICAL_1.mp4', poster: P + 'way.jpg' }
  },
  {
    slug: 'colapso',
    name: 'Colapso',
    tag: 'Artwork',
    short: 'Artwork.',
    long: '',
    services: ['Artwork'],
    team: '',
    media: { type: 'image', src: P + 'colapso.jpg' }
  },
  {
    slug: 'sun-and-snow',
    name: 'Sun&Snow',
    tag: 'Motion Graphics',
    short: 'Trabajo realizado en T.O.T Studio.',
    long: '',
    services: ['Motion Graphics'],
    team: 'Trabajo realizado en T.O.T Studio.',
    media: { type: 'video', src: U + 'tot/sun&snow/S&S_MOBILE_ANIMACION STORIES.mp4', poster: P + 'sunsnow.jpg' }
  },
  {
    slug: 'delta',
    name: 'Delta',
    tag: 'Motion Graphics + IA',
    short: 'Trabajo realizado en T.O.T Studio.',
    long: '',
    services: ['Motion Graphics', 'IA'],
    team: 'Trabajo realizado en T.O.T Studio.',
    media: { type: 'video', src: U + 'tot/delta/delta_video_home.mp4', poster: P + 'delta.jpg' }
  },
  {
    slug: 'pontevecchio',
    name: 'Pontevecchio',
    tag: 'Motion Graphics',
    short: 'Trabajo realizado en T.O.T Studio.',
    long: '',
    services: ['Motion Graphics'],
    team: 'Trabajo realizado en T.O.T Studio.',
    media: { type: 'video', src: U + 'tot/ponteveccio/PONTEVECCIO_WEB_LOGO_OPTIMIZADO.mp4', mobile: U + 'tot/ponteveccio/PONTEVECCIO_MOBILE_LOGO_OPTIMIZADO.mp4', poster: P + 'pontevecchio.jpg' }
  }
];

/* Une las imágenes extraídas del deck de Figma (assets/js/gallery.js) con cada proyecto.
   Si un proyecto no tiene portada propia, usa la primera imagen de su galería. */
(function () {
  const G = window.GALLERY || {};
  window.PROJECTS.forEach((p) => {
    p.gallery = G[p.slug] || [];
    if (!p.media && p.gallery.length) p.media = { type: 'image', src: p.gallery[0][0] };
  });
})();
