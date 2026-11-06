/*
 * HOME
 * - Carrusel horizontal infinito en las dos direcciones (clones en los extremos, salto invisible)
 * - "Tiempos": barras de progreso tipo stories que avanzan solas (pausables)
 * - Franja inferior con nombre / tag / descripción que cambian con un "roll" tipográfico
 * - +info que se despliega y se recoge al hacer scroll (como en la web original)
 * - Vista grid ▢▢/▢▢ ↔ ▢ con entrada escalonada y vídeo al pasar el ratón
 * - Cada proyecto se abre en su propia página (proyectos/<slug>/), con transición de la portada
 * - Arrastre con ratón, rueda, teclado y swipe nativo en móvil
 */
(function () {
  const projects = window.PROJECTS || [];
  const N = projects.length;
  if (!N) return;
  const UI = window.UI || { state: {}, onChange() {} };
  const $ = (s, el = document) => el.querySelector(s);
  const pad = (n) => String(n).padStart(2, '0');
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const mq = window.matchMedia('(max-width: 923px)');
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* Códec más ligero que el navegador puede reproducir: AV1 → HEVC → H.264 (ver tools/videos.py) */
  const MEDIA = window.MEDIA || { video: {}, img: {} };
  const probe = document.createElement('video');
  const can = { av1: !!probe.canPlayType('video/mp4; codecs="av01.0.08M.10"'), hevc: !!probe.canPlayType('video/mp4; codecs="hvc1.1.6.L120.90"') };
  const best = (p) => {
    const v = MEDIA.video[p] || { h264: p };
    const ok = ['av1', 'hevc'].filter((k) => v[k] && can[k]).sort((a, b) => (v.bytes || {})[a] - (v.bytes || {})[b]);
    return ok.length ? v[ok[0]] : v.h264;   // el más ligero que este navegador puede reproducir
  };
  // Raíz del sitio desde esta página ('' en la home inglesa, '../' en /es/): los medios viven en la raíz
  const ROOT = document.documentElement.dataset.root || '';
  const src = (m) => ROOT + encodeURI(m.type === 'video' ? best(mq.matches && m.mobile ? m.mobile : m.src) : (mq.matches && m.mobile ? m.mobile : m.src));
  /* <picture> con AVIF para las portadas de imagen */
  function picture(path, alt, cls, eager) {
    const d = MEDIA.img[path];
    const e = (x) => ROOT + encodeURI(x);
    if (!d) return `<img class="${cls}" src="${e(path)}" alt="${esc(alt)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`;
    const sizes = '100vw';
    const aset = d.avif ? (d.smallAvif ? `${e(d.smallAvif)} 800w, ${e(d.avif)} ${d.w}w` : e(d.avif)) : '';
    const jset = d.small ? ` srcset="${e(d.small)} 800w, ${e(path)} ${d.w}w" sizes="${sizes}"` : '';
    return `<picture>${aset ? `<source type="image/avif" srcset="${aset}" sizes="${sizes}">` : ''}<img class="${cls}" src="${e(path)}"${jset} width="${d.w}" height="${d.h}" alt="${esc(alt)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async"></picture>`;
  }
  const thumbOf = (p) => (p.media ? (p.media.type === 'image' ? p.media.src : p.media.poster) : (p.gallery && p.gallery[0] && p.gallery[0][0]));

  const track = $('#track');
  const grid = $('#grid');
  const progress = $('#progress');
  const more = $('#more');
  const moreInner = $('.more__inner');
  const gridBtn = $('.grid-btn');
  const countEl = $('.grid-btn__count');
  const playBtn = $('.play');
  const cursor = $('.cursor');
  const bar = {
    num: $('.bar__num'), name: $('.bar__name'), tag: $('.bar__tag'), short: $('.bar__short'), more: $('.bar__more')
  };

  let cur = -1;          // índice real activo
  let pos = 1;           // posición en el DOM (con clones)
  let W = track.clientWidth;
  let programmatic = false;
  const flags = { more: false, grid: false, hold: false, drag: false, paused: reduced };
  // Carpeta de proyectos del idioma de la página: projects/ (inglés) o proyectos/ (español, en /es/)
  const PJ = document.documentElement.dataset.pj || 'projects/';
  const pageOf = (i) => `${PJ}${projects[i].slug}/`;
  const t = UI.t || { services: 'Services', team: 'Team', seeFull: 'See full project →', seeAll: 'See all projects', backCarousel: 'Back to carousel', closeAbout: 'Close About', pause: 'Pause slideshow', resume: 'Resume slideshow', goTo: 'Go to' };

  /* ================================================================
     Render
     ================================================================ */
  function cover(p, i, lead = true) {
    return `
      <div class="cover">
        <div class="chips">
          <span class="chip chip--num">${pad(i + 1)}</span><span class="chip">Proyecto</span><span class="chip chip--round">${esc(p.name)}</span>
        </div>
        <h2 class="cover__title">[${esc(p.name)}]</h2>
        ${lead && p.long ? `<p class="cover__lead">${esc(p.long)}</p>` : ''}
      </div>`;
  }
  function media(p, i, eager) {
    const m = p.media;
    if (!m) return cover(p, i);
    const posn = m.position ? ` style="object-position:${m.position}"` : '';
    if (m.type === 'image') return picture(mq.matches && m.mobile ? m.mobile : m.src, p.name, 'slide__media', eager);
    // El fotograma (poster) solo se pide para el primero; el resto, al acercarse (ver syncVideos)
    const poster = m.poster ? ROOT + encodeURI(m.poster) : '';
    return `<video class="slide__media" muted playsinline preload="none" ${eager ? `poster="${poster}"` : `data-poster="${poster}"`} data-src="${src(m)}"${posn} aria-label="${esc(p.name)}"></video>`;
  }
  const slideHTML = (i, clone) => `
    <section class="slide${clone ? ' is-clone' : ''}" data-real="${i}"${projects[i].media && projects[i].media.bg ? ` style="--bg:${projects[i].media.bg}"` : ''} ${clone ? 'aria-hidden="true"' : `id="p-${projects[i].slug}" aria-label="${esc(projects[i].name)}"`}>
      ${media(projects[i], i, i < 2)}
    </section>`;

  track.innerHTML = slideHTML(N - 1, true) + projects.map((_, i) => slideHTML(i, false)).join('') + slideHTML(0, true);
  const slides = Array.from(track.children);

  /* Encaje de las portadas de vídeo: si la proporción del vídeo no encaja con la pantalla
     (un vídeo vertical o cuadrado en escritorio), se muestra entero sobre su color de fondo
     en vez de recortarlo y ampliarlo. */
  function fitCovers() {
    const vr = window.innerWidth / window.innerHeight;
    slides.forEach((s) => {
      const m = projects[+s.dataset.real].media;
      const ar = m && m.type === 'video' && m.ar && !(mq.matches && (m.mobile || m.fillMobile)) ? m.ar : 0;
      s.classList.toggle('is-contain', !!ar && Math.max(ar / vr, vr / ar) > 1.4);
    });
  }
  fitCovers();

  progress.innerHTML = projects.map((p, i) => `<button data-index="${i}" aria-label="${t.goTo} ${esc(p.name)}"><i></i></button>`).join('');
  const dots = Array.from(progress.children);

  /* ================================================================
     Roll tipográfico de la franja inferior
     ================================================================ */
  function roll(el, text, dir = 1) {
    const prev = el.lastElementChild;
    if (prev && prev.textContent === text) return;
    const nu = document.createElement('span');
    nu.textContent = text;
    el.appendChild(nu);
    if (!prev || reduced || !nu.animate) { if (prev) prev.remove(); return; }
    const opts = { duration: 520, easing: 'cubic-bezier(.65,0,.35,1)', fill: 'both' };
    prev.animate([{ transform: 'translateY(0)' }, { transform: `translateY(${-100 * dir}%)` }], opts).onfinish = () => prev.remove();
    nu.animate([{ transform: `translateY(${100 * dir}%)` }, { transform: 'translateY(0)' }], opts);
  }

  /* ================================================================
     Vídeos: carga diferida y solo suena (muted) el visible
     ================================================================ */
  const near = (i) => { const d = Math.abs(i - cur); return d <= 1 || d === N - 1; };
  // Ahorro de datos del sistema (Android / Chrome): solo fotogramas, sin vídeo
  const saveData = !!(navigator.connection && navigator.connection.saveData);
  function syncVideos() {
    if (cur < 0) return;
    slides.forEach((s, p) => {
      const v = s.querySelector('video'); if (!v) return;
      const r = +s.dataset.real;
      const isCur = p === pos;
      const close = isCur || (near(r) && !s.classList.contains('is-clone'));
      if (close && v.dataset.poster && !v.getAttribute('poster')) v.poster = v.dataset.poster;
      if (saveData) return;
      // El actual se descarga entero; los vecinos solo su arranque (metadata), para entrar al instante
      if (close && !v.getAttribute('src')) { v.preload = isCur ? 'auto' : 'metadata'; v.src = v.dataset.src; }
      if (isCur && v.preload !== 'auto') v.preload = 'auto';
      if (isCur && !flags.grid) {
        const pr = v.play(); if (pr && pr.catch) pr.catch(() => {});
      } else if (!v.paused) v.pause();
    });
  }
  const activeVideo = () => { const s = slides[pos]; return s && s.querySelector('video'); };

  /* ================================================================
     Estado del proyecto activo
     ================================================================ */
  function setCurrent(i, dir = 1) {
    if (i === cur) return;
    const first = cur === -1;
    cur = i;
    const p = projects[i];
    roll(bar.num, pad(i + 1), dir);
    roll(bar.name, p.name, dir);
    bar.name.href = pageOf(i);
    roll(bar.tag, p.tag, dir);
    roll(bar.short, p.short, dir);
    countEl.textContent = `${pad(i + 1)} / ${pad(N)}`;
    dots.forEach((d, k) => { d.classList.toggle('is-active', k === i); d.style.setProperty('--p', k === i && (reduced || flags.paused) ? 1 : 0); });

    const rows = [];
    if (p.services.length) rows.push([t.services, p.services.map(esc).join(' · ')]);
    if (p.team) rows.push([t.team, esc(p.team)]);
    moreInner.innerHTML =
      (p.long ? `<p class="more__long">${esc(p.long)}</p>` : '') +
      rows.map(([l, v]) => `<div class="more__row"><span class="more__label">${l}</span><span>${v}</span></div>`).join('') +
      `<a class="more__open" href="${pageOf(i)}">${t.seeFull}</a>`;

    if (!first) closeMore();
    resetTimer();
    syncVideos();
    history.replaceState(null, '', '#' + p.slug);
  }

  /* ================================================================
     Navegación del carrusel (infinito)
     ================================================================ */
  function scrollToPos(p, smooth) {
    programmatic = true;
    track.scrollTo({ left: p * W, behavior: smooth && !reduced ? 'smooth' : 'auto' });
  }
  function jumpSilently(p) {
    track.classList.add('is-jumping');
    programmatic = true;
    track.scrollLeft = p * W;
    pos = p;
    requestAnimationFrame(() => track.classList.remove('is-jumping'));
    syncVideos();
  }
  function goTo(i, opts = {}) {
    i = ((i % N) + N) % N;
    let target = i + 1;
    if (opts.dir === 1 && cur === N - 1 && i === 0) target = N + 1;
    if (opts.dir === -1 && cur === 0 && i === N - 1) target = 0;
    const smooth = opts.smooth !== false;
    pos = target;
    scrollToPos(target, smooth);
    setCurrent(i, opts.dir || (i >= cur ? 1 : -1));
    if (!smooth) settle();
  }
  const next = () => goTo(cur + 1, { dir: 1 });
  const prev = () => goTo(cur - 1, { dir: -1 });

  function settle() {
    const p = Math.round(track.scrollLeft / W);
    if (p <= 0) jumpSilently(N);
    else if (p >= N + 1) jumpSilently(1);
    else { pos = p; syncVideos(); }
    programmatic = false;
  }

  let scrollT;
  track.addEventListener('scroll', () => {
    const p = Math.round(track.scrollLeft / W);
    const r = ((p - 1) % N + N) % N;
    if (!programmatic && r !== cur) { const dir = p > pos ? 1 : -1; pos = p; setCurrent(r, dir); }
    if (!programmatic && flags.more) closeMore(); // como en la original: el scroll recoge el +info
    clearTimeout(scrollT);
    scrollT = setTimeout(settle, 140);
  }, { passive: true });
  if ('onscrollend' in window) track.addEventListener('scrollend', () => { clearTimeout(scrollT); settle(); });

  // Rueda → un proyecto por gesto
  let wheelLock = 0;
  track.addEventListener('wheel', (e) => {
    if (flags.grid) return;
    e.preventDefault();
    const d = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
    const now = performance.now();
    if (Math.abs(d) < 6 || now < wheelLock) return;
    wheelLock = now + 800;
    d > 0 ? next() : prev();
  }, { passive: false });

  // Arrastre con ratón, mantener pulsado para pausar y, en táctil, deslizar en vertical
  // también pasa de proyecto (arriba = siguiente, abajo = anterior), igual que la rueda.
  let down = null;
  let suppressUntil = 0;                       // evita que el gesto acabe abriendo el proyecto
  const suppress = () => { suppressUntil = performance.now() + 450; };
  const endHold = () => { clearTimeout(holdTimer); flags.hold = false; document.body.classList.remove('is-holding'); };
  track.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    down = { x: e.clientX, y: e.clientY, sl: track.scrollLeft, t: performance.now(), type: e.pointerType, moved: false };
    holdTimer = setTimeout(() => { if (down && !down.moved) { flags.hold = true; document.body.classList.add('is-holding'); } }, 260);
  });
  let holdTimer;
  window.addEventListener('pointermove', (e) => {
    if (!down) return;
    const dx = e.clientX - down.x, dy = e.clientY - down.y;
    if (!down.moved && (Math.abs(dx) > 6 || Math.abs(dy) > 6)) { down.moved = true; clearTimeout(holdTimer); }
    if (down.type === 'mouse' && down.moved) {
      if (!flags.drag) { flags.drag = true; track.classList.add('is-dragging'); }
      programmatic = true;
      track.scrollLeft = down.sl - dx;
    }
  });
  window.addEventListener('pointerup', (e) => {
    if (!down) return;
    clearTimeout(holdTimer);
    const d = down; down = null;
    const wasHold = flags.hold;
    flags.hold = false; document.body.classList.remove('is-holding');
    if (d.type !== 'mouse') {
      const dx = e.clientX - d.x, dy = e.clientY - d.y;
      const v = dy / Math.max(1, performance.now() - d.t);
      if (Math.abs(dy) > Math.abs(dx) * 1.2 && (Math.abs(dy) > 40 || Math.abs(v) > 0.45)) {
        dy < 0 ? next() : prev();
        suppress();
        return;
      }
    }
    if (flags.drag) {
      flags.drag = false;
      track.classList.remove('is-dragging');
      const dx = e.clientX - d.x;
      const v = dx / Math.max(1, performance.now() - d.t);
      if (dx < -W * 0.12 || v < -0.5) next();
      else if (dx > W * 0.12 || v > 0.5) prev();
      else goTo(cur, { dir: 0 });
      suppress();
      return;
    }
    if (wasHold) suppress();
  });
  // Si el navegador toma el gesto (deslizar en horizontal), se cancela la pulsación
  window.addEventListener('pointercancel', () => { if (!down) return; down = null; endHold(); });
  track.addEventListener('click', (e) => {
    if (performance.now() < suppressUntil) return;
    if (e.target.closest('.slide')) openProject(cur);
  });

  // Teclado
  document.addEventListener('keydown', (e) => {
    if (e.target.closest('input, textarea')) return;
    if (UI.state.panel || UI.state.navOpen) return; // los gestiona ui.js
    if (flags.grid) { if (e.key === 'Escape' || e.key === 'g') setGrid(false); return; }
    switch (e.key) {
      case 'ArrowRight': case 'ArrowDown': e.preventDefault(); next(); break;
      case 'ArrowLeft': case 'ArrowUp': e.preventDefault(); prev(); break;
      case ' ': e.preventDefault(); togglePause(); break;
      case 'i': flags.more ? closeMore() : openMore(); break;
      case 'g': setGrid(true); break;
      case 'Enter': if (e.target === document.body) openProject(cur); break;
      case 'Escape': closeMore(); break;
    }
  });

  progress.addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    const i = +b.dataset.index; goTo(i, { dir: i > cur ? 1 : -1 });
  });

  /* ================================================================
     "Tiempos": autoplay tipo stories
     ================================================================ */
  let elapsed = 0, last = performance.now();
  function duration() {
    const v = activeVideo();
    if (v && isFinite(v.duration) && v.duration > 0) return Math.min(15, Math.max(5, v.duration)) * 1000;
    return 7000;
  }
  function resetTimer() { elapsed = 0; const v = activeVideo(); if (v && v.readyState > 0) v.currentTime = 0; }
  const canRun = () => !flags.paused && !flags.more && !flags.grid && !flags.hold && !flags.drag &&
    !UI.state.panel && !document.hidden && !document.body.classList.contains('is-intro');
  function tick(now) {
    const dt = Math.min(100, now - last); last = now;
    const running = canRun();
    if (running) elapsed += dt;
    const d = dots[cur];
    if (d) d.style.setProperty('--p', flags.paused ? 1 : Math.min(1, elapsed / duration()));
    const v = activeVideo();
    if (v && v.getAttribute('src')) {
      if (!running && !v.paused && (flags.hold || flags.grid)) v.pause();
      else if (running && v.paused && !flags.grid) v.play().catch(() => {});
    }
    if (running && elapsed >= duration()) next();
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  function togglePause() {
    flags.paused = !flags.paused;
    playBtn.setAttribute('aria-pressed', String(flags.paused));
    playBtn.setAttribute('aria-label', flags.paused ? t.resume : t.pause);
    document.body.classList.toggle('is-paused', flags.paused);
  }
  playBtn.addEventListener('click', togglePause);
  if (reduced) { document.body.classList.add('is-paused'); playBtn.setAttribute('aria-pressed', 'true'); }

  /* ================================================================
     +info
     ================================================================ */
  function openMore() { if (UI.state.panel && UI.hidePanel) UI.hidePanel(); flags.more = true; more.classList.add('is-open'); bar.more.textContent = '-info'; bar.more.setAttribute('aria-expanded', 'true'); }
  function closeMore() { flags.more = false; more.classList.remove('is-open'); bar.more.textContent = '+info'; bar.more.setAttribute('aria-expanded', 'false'); }
  bar.more.addEventListener('click', () => (flags.more ? closeMore() : openMore()));
  more.addEventListener('click', (e) => { const a = e.target.closest('.more__open'); if (a) { e.preventDefault(); openProject(cur); } });
  bar.name.addEventListener('click', (e) => { e.preventDefault(); openProject(cur); });

  /* ================================================================
     Vista grid
     ================================================================ */
  // Scroll suave del índice (rueda y trackpad); el carrusel conserva su gesto propio
  const gridScroller = window.Lenis && UI.SMOOTH
    ? new window.Lenis({ ...UI.SMOOTH, wrapper: grid, content: grid, eventsTarget: grid, naiveDimensions: true })
    : null;
  UI.gridScroller = gridScroller;

  function setGrid(on) {
    if (on === flags.grid) return;
    flags.grid = on;
    if (on) closeMore();
    document.body.classList.toggle('is-grid', on);
    gridBtn.setAttribute('aria-pressed', String(on));
    gridBtn.querySelector('.sr-only').textContent = on ? t.backCarousel : t.seeAll;
    if (on) {
      grid.scrollTop = restoreY != null ? restoreY : 0;
      if (gridScroller) { gridScroller.resize(); gridScroller.reset(); }   // el scroll suave parte de aquí
    }
    restoreY = null;
    // La vista queda en la dirección (?grid) para poder volver exactamente a ella
    history.replaceState(history.state, '', location.pathname + (on ? '?grid' : '') + location.hash);
    syncVideos();
    syncTiles();
  }
  gridBtn.addEventListener('click', () => {
    if (UI.state.panel === 'about' && UI.closeNav) { UI.closeNav(); return; }   // en el About, el botón es una X
    setGrid(!flags.grid);
  });
  // Posición del índice: se guarda para recuperarla al volver (desde el About o un proyecto)
  let restoreY = null;
  try { const y = sessionStorage.getItem('mv-grid-y'); if (y && location.search.includes('grid')) restoreY = +y; } catch (e) { /* sin storage */ }
  let gridSaveT;
  grid.addEventListener('scroll', () => {
    clearTimeout(gridSaveT);
    gridSaveT = setTimeout(() => { try { sessionStorage.setItem('mv-grid-y', String(grid.scrollTop)); } catch (e) { /* sin storage */ } }, 150);
  }, { passive: true });

  // Vídeos del índice: cada pieza reproduce su vídeo cuando está en pantalla (también en móvil)
  // y lo pausa al salir. Se crean al verse por primera vez, para no descargar todo de golpe.
  const tiles = Array.from(grid.querySelectorAll('.tile'));
  function tilePlay(t) {
    const m = projects[+t.dataset.index].media;
    if (!m || m.type !== 'video' || saveData) return;
    let v = t._v;
    if (!v) {
      v = document.createElement('video');
      Object.assign(v, { muted: true, loop: true, playsInline: true, preload: 'auto' });
      v.setAttribute('muted', ''); v.setAttribute('playsinline', '');
      v.className = 'tile__video';
      v.setAttribute('aria-hidden', 'true');
      v.addEventListener('playing', () => v.classList.add('is-on'));
      v.src = ROOT + encodeURI(best(m.mobile || m.src));   // las casillas son verticales: mejor la versión vertical si existe
      t.querySelector('.tile__media').appendChild(v);
      t._v = v;
    }
    const pr = v.play(); if (pr && pr.catch) pr.catch(() => {});
  }
  const tilePause = (t) => { if (t._v && !t._v.paused) t._v.pause(); };
  function syncTiles() { tiles.forEach((t) => (flags.grid && t._vis ? tilePlay(t) : tilePause(t))); }
  if ('IntersectionObserver' in window) {
    const tio = new IntersectionObserver((entries) => entries.forEach((en) => {
      en.target._vis = en.isIntersecting;
      if (flags.grid) en.isIntersecting ? tilePlay(en.target) : tilePause(en.target);
    }), { root: grid, threshold: 0.35 });
    tiles.forEach((t) => tio.observe(t));
  }

  grid.addEventListener('click', (e) => {
    const t = e.target.closest('.tile'); if (!t) return;
    const box = t.querySelector('.tile__media');
    if (box) box.style.viewTransitionName = 'hero';   // la miniatura "viaja" a la portada del proyecto
  });

  /* ================================================================
     Abrir proyecto (página propia, con transición de la portada)
     ================================================================ */
  function openProject(i) {
    const media = slides[pos] && slides[pos].querySelector('.slide__media');
    if (media) media.style.viewTransitionName = 'hero';
    closeMore();
    if (UI.markDir) UI.markDir(false);
    (UI.leave || ((go) => go()))(() => { location.href = pageOf(i); }, false);
  }
  // Al empezar a tocar (o pulsar) una diapositiva, su proyecto se prepara en segundo plano:
  // así se abre al momento y la transición arranca con la portada ya cargada (Chrome, Edge)
  const ready = new Set();
  function prepare(i) {
    const href = new URL(pageOf(i), location.href).href;
    if (ready.has(href) || !(HTMLScriptElement.supports && HTMLScriptElement.supports('speculationrules'))) return;
    ready.add(href);
    const sr = document.createElement('script');
    sr.type = 'speculationrules';
    sr.textContent = JSON.stringify({ prerender: [{ urls: [href] }] });
    document.head.appendChild(sr);
  }
  track.addEventListener('pointerdown', () => { if (!flags.grid) prepare(cur); }, { passive: true });
  if (fine.matches) track.addEventListener('pointerenter', () => { clearTimeout(track._pt); track._pt = setTimeout(() => !flags.grid && prepare(cur), 400); });
  const clearHero = () => {
    slides.forEach((s) => { const m = s.querySelector('.slide__media'); if (m) m.style.viewTransitionName = ''; });
    grid.querySelectorAll('.tile__media').forEach((b) => (b.style.viewTransitionName = ''));
  };
  // Al volver con el botón atrás (bfcache), limpiar la transición y retomar el vídeo
  addEventListener('pageshow', (e) => {
    if (!e.persisted) return;
    clearHero();
    last = performance.now(); syncVideos();
  });
  // Al volver de un proyecto, su portada regresa a su sitio: la diapositiva del carrusel o su miniatura del índice
  addEventListener('pagereveal', (e) => {
    const vt = e.viewTransition, slug = UI.fromSlug;
    if (!vt || !slug) return;
    const i = projects.findIndex((p) => p.slug === slug);
    if (i < 0) return;
    const el = flags.grid
      ? tiles[i] && tiles[i].querySelector('.tile__media')
      : cur === i && slides[pos] && slides[pos].querySelector('.slide__media');
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (r.bottom <= 0 || r.top >= innerHeight) return;
    clearHero();
    el.style.viewTransitionName = 'hero';
    vt.finished.finally(() => { el.style.viewTransitionName = ''; });
  });
  window.addEventListener('hashchange', () => {
    const [slug, view] = location.hash.slice(1).split('/');
    const i = projects.findIndex((p) => p.slug === slug);
    if (i < 0) return;
    if (view === 'ver') { location.replace(pageOf(i)); return; }
    if (flags.grid) setGrid(false);
    if (i !== cur) goTo(i, { dir: i > cur ? 1 : -1 });
  });

  /* ================================================================
     Cursor "Ver proyecto" (escritorio)
     ================================================================ */
  if (cursor && fine.matches && !reduced) {
    let cx = 0, cy = 0, tx = 0, ty = 0, raf = 0, visible = false;
    const loop = () => {
      cx += (tx - cx) * 0.22; cy += (ty - cy) * 0.22;
      cursor.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      raf = (visible || Math.abs(tx - cx) > 0.5) ? requestAnimationFrame(loop) : 0;
    };
    track.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      tx = e.clientX; ty = e.clientY;
      if (!visible) { cx = tx; cy = ty; visible = true; cursor.classList.add('is-on'); }
      if (!raf) raf = requestAnimationFrame(loop);
    });
    track.addEventListener('pointerleave', () => { visible = false; cursor.classList.remove('is-on'); });
  }

  /* ================================================================
     Integración con la franja (ui.js) y resize
     ================================================================ */
  // Desplegables excluyentes: abrir un panel del menú recoge el +info (y al revés), para que nunca se pisen
  UI.onChange((s) => {
    document.body.classList.toggle('is-panel', !!s.panel);
    gridBtn.querySelector('.sr-only').textContent = s.panel === 'about' ? t.closeAbout : flags.grid ? t.backCarousel : t.seeAll;
    if (s.panel && flags.more) closeMore();
  });

  window.addEventListener('resize', () => {
    fitCovers();
    W = track.clientWidth;
    jumpSilently(pos);
  });
  mq.addEventListener('change', () => {
    slides.forEach((s) => {
      const v = s.querySelector('video'); const m = projects[+s.dataset.real].media;
      if (!v || !m) return;
      v.dataset.src = src(m);
      if (v.getAttribute('src')) v.src = v.dataset.src;
    });
    syncVideos();
  });
  document.addEventListener('visibilitychange', () => { last = performance.now(); });

  /* ================================================================
     Arranque: #slug, ?grid (y #slug/ver de la versión anterior → página del proyecto)
     ================================================================ */
  const [hSlug, hView] = location.hash.slice(1).split('/');
  const fromHash = projects.findIndex((p) => p.slug === hSlug);
  if (hView === 'ver' && fromHash >= 0) { location.replace(pageOf(fromHash)); return; }
  const start = fromHash >= 0 ? fromHash : 0;
  requestAnimationFrame(() => {
    W = track.clientWidth;
    pos = start + 1;
    jumpSilently(pos);
    setCurrent(start, 1);
    if (location.search.includes('grid')) setGrid(true);
  });

  window.HOME = { goTo: (i) => { if (flags.grid) setGrid(false); goTo(i, { dir: i > cur ? 1 : -1 }); }, setGrid };
})();
