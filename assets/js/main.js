/*
 * HOME
 * - Carrusel horizontal infinito en las dos direcciones (clones en los extremos, salto invisible)
 * - "Tiempos": barras de progreso tipo stories que avanzan solas (pausables)
 * - Franja inferior con nombre / tag / descripción que cambian con un "roll" tipográfico
 * - +info que se despliega y se recoge al hacer scroll (como en la web original)
 * - Vista grid ▢▢/▢▢ ↔ ▢ con entrada escalonada y vídeo al pasar el ratón
 * - Ficha de proyecto que sube desde abajo con el contenido del deck (texto + imágenes)
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
  const src = (m) => encodeURI(mq.matches && m.mobile ? m.mobile : m.src);
  const thumbOf = (p) => (p.media ? (p.media.type === 'image' ? p.media.src : p.media.poster) : (p.gallery && p.gallery[0] && p.gallery[0][0]));

  const track = $('#track');
  const grid = $('#grid');
  const progress = $('#progress');
  const more = $('#more');
  const moreInner = $('.more__inner');
  const gridBtn = $('.grid-btn');
  const countEl = $('.grid-btn__count');
  const playBtn = $('.play');
  const sheet = $('#sheet');
  const sheetBody = $('.sheet__body');
  const cursor = $('.cursor');
  const bar = {
    num: $('.bar__num'), name: $('.bar__name'), tag: $('.bar__tag'), short: $('.bar__short'), more: $('.bar__more')
  };

  let cur = -1;          // índice real activo
  let pos = 1;           // posición en el DOM (con clones)
  let W = track.clientWidth;
  let programmatic = false;
  const flags = { more: false, grid: false, sheet: false, hold: false, drag: false, paused: reduced };

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
    if (m.type === 'image') return `<img class="slide__media" src="${src(m)}" alt="${esc(p.name)}"${posn} ${eager ? '' : 'loading="lazy"'} decoding="async">`;
    return `<video class="slide__media" muted playsinline preload="none" poster="${encodeURI(m.poster || '')}" data-src="${src(m)}"${posn} aria-label="${esc(p.name)}"></video>`;
  }
  const slideHTML = (i, clone) => `
    <section class="slide${clone ? ' is-clone' : ''}" data-real="${i}" ${clone ? 'aria-hidden="true"' : `id="p-${projects[i].slug}" aria-label="${esc(projects[i].name)}"`}>
      ${media(projects[i], i, i < 2)}
    </section>`;

  track.innerHTML = slideHTML(N - 1, true) + projects.map((_, i) => slideHTML(i, false)).join('') + slideHTML(0, true);
  const slides = Array.from(track.children);

  grid.innerHTML = projects.map((p, i) => {
    const t = thumbOf(p);
    const vis = t ? `<img src="${encodeURI(t)}" alt="" loading="lazy" decoding="async">` : cover(p, i, false);
    return `<button class="tile" data-index="${i}" style="--i:${i}" aria-label="${esc(p.name)} — ${esc(p.tag)}">
      ${vis}<span class="tile__label"><span>${pad(i + 1)}</span><span>${esc(p.name)}</span><span>${esc(p.tag)}</span></span>
    </button>`;
  }).join('');

  progress.innerHTML = projects.map((p, i) => `<button data-index="${i}" aria-label="Ir a ${esc(p.name)}"><i></i></button>`).join('');
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
  function syncVideos() {
    slides.forEach((s, p) => {
      const v = s.querySelector('video'); if (!v) return;
      const r = +s.dataset.real;
      if (near(r) && !v.getAttribute('src')) { v.src = v.dataset.src; v.preload = 'auto'; }
      if (p === pos && !flags.grid && !flags.sheet) {
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
    roll(bar.tag, p.tag, dir);
    roll(bar.short, p.short, dir);
    countEl.textContent = `${pad(i + 1)} / ${pad(N)}`;
    dots.forEach((d, k) => { d.classList.toggle('is-active', k === i); d.style.setProperty('--p', k === i && (reduced || flags.paused) ? 1 : 0); });

    const rows = [];
    if (p.services.length) rows.push(['Servicios', p.services.map(esc).join(' · ')]);
    if (p.team) rows.push(['Equipo', esc(p.team)]);
    moreInner.innerHTML =
      (p.long ? `<p class="more__long">${esc(p.long)}</p>` : '') +
      rows.map(([l, v]) => `<div class="more__row"><span class="more__label">${l}</span><span>${v}</span></div>`).join('') +
      `<button class="more__open" data-open-sheet>Ver proyecto completo →</button>`;

    if (!first) closeMore();
    resetTimer();
    syncVideos();
    if (!flags.sheet) history.replaceState(null, '', '#' + p.slug);
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
    if (flags.grid || flags.sheet) return;
    e.preventDefault();
    const d = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
    const now = performance.now();
    if (Math.abs(d) < 6 || now < wheelLock) return;
    wheelLock = now + 800;
    d > 0 ? next() : prev();
  }, { passive: false });

  // Arrastre con ratón + mantener pulsado para pausar (también táctil)
  let down = null;
  track.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    down = { x: e.clientX, y: e.clientY, sl: track.scrollLeft, t: performance.now(), type: e.pointerType, moved: false };
    holdTimer = setTimeout(() => { if (down && !down.moved) { flags.hold = true; document.body.classList.add('is-holding'); } }, 260);
  });
  let holdTimer;
  window.addEventListener('pointermove', (e) => {
    if (!down) return;
    const dx = e.clientX - down.x;
    if (!down.moved && Math.abs(dx) > 6) { down.moved = true; clearTimeout(holdTimer); }
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
    if (flags.drag) {
      flags.drag = false;
      track.classList.remove('is-dragging');
      const dx = e.clientX - d.x;
      const v = dx / Math.max(1, performance.now() - d.t);
      if (dx < -W * 0.12 || v < -0.5) next();
      else if (dx > W * 0.12 || v > 0.5) prev();
      else goTo(cur, { dir: 0 });
      suppressClick = true;
      return;
    }
    if (wasHold) suppressClick = true;
  });
  let suppressClick = false;
  track.addEventListener('click', (e) => {
    if (suppressClick) { suppressClick = false; return; }
    if (e.target.closest('.slide')) openSheet(cur);
  });

  // Teclado
  document.addEventListener('keydown', (e) => {
    if (e.target.closest('input, textarea')) return;
    if (UI.state.panel || UI.state.navOpen) return; // los gestiona ui.js
    if (flags.sheet) { if (e.key === 'Escape') closeSheet(); return; }
    if (flags.grid) { if (e.key === 'Escape' || e.key === 'g') setGrid(false); return; }
    switch (e.key) {
      case 'ArrowRight': case 'ArrowDown': e.preventDefault(); next(); break;
      case 'ArrowLeft': case 'ArrowUp': e.preventDefault(); prev(); break;
      case ' ': e.preventDefault(); togglePause(); break;
      case 'i': flags.more ? closeMore() : openMore(); break;
      case 'g': setGrid(true); break;
      case 'Enter': if (e.target === document.body) openSheet(cur); break;
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
  const canRun = () => !flags.paused && !flags.more && !flags.grid && !flags.sheet && !flags.hold && !flags.drag &&
    !UI.state.panel && !document.hidden && !document.body.classList.contains('is-intro');
  function tick(now) {
    const dt = Math.min(100, now - last); last = now;
    const running = canRun();
    if (running) elapsed += dt;
    const d = dots[cur];
    if (d) d.style.setProperty('--p', flags.paused ? 1 : Math.min(1, elapsed / duration()));
    const v = activeVideo();
    if (v && v.getAttribute('src')) {
      if (!running && !v.paused && (flags.hold || flags.grid || flags.sheet)) v.pause();
      else if (running && v.paused && !flags.grid && !flags.sheet) v.play().catch(() => {});
    }
    if (running && elapsed >= duration()) next();
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  function togglePause() {
    flags.paused = !flags.paused;
    playBtn.setAttribute('aria-pressed', String(flags.paused));
    playBtn.setAttribute('aria-label', flags.paused ? 'Reanudar pase automático' : 'Pausar pase automático');
    document.body.classList.toggle('is-paused', flags.paused);
  }
  playBtn.addEventListener('click', togglePause);
  if (reduced) { document.body.classList.add('is-paused'); playBtn.setAttribute('aria-pressed', 'true'); }

  /* ================================================================
     +info
     ================================================================ */
  function openMore() { flags.more = true; more.classList.add('is-open'); bar.more.textContent = '-info'; bar.more.setAttribute('aria-expanded', 'true'); }
  function closeMore() { flags.more = false; more.classList.remove('is-open'); bar.more.textContent = '+info'; bar.more.setAttribute('aria-expanded', 'false'); }
  bar.more.addEventListener('click', () => (flags.more ? closeMore() : openMore()));
  more.addEventListener('click', (e) => { if (e.target.closest('[data-open-sheet]')) openSheet(cur); });

  /* ================================================================
     Vista grid
     ================================================================ */
  function setGrid(on) {
    if (on === flags.grid) return;
    flags.grid = on;
    if (on) closeMore();
    document.body.classList.toggle('is-grid', on);
    gridBtn.setAttribute('aria-pressed', String(on));
    gridBtn.querySelector('.sr-only').textContent = on ? 'Volver al carrusel' : 'Ver todos los proyectos';
    if (on) grid.scrollTop = 0;
    syncVideos();
  }
  gridBtn.addEventListener('click', () => setGrid(!flags.grid));

  // Vídeo al pasar el ratón por un tile
  grid.addEventListener('pointerover', (e) => {
    if (e.pointerType !== 'mouse') return;
    const t = e.target.closest('.tile'); if (!t || t._v) return;
    const m = projects[+t.dataset.index].media;
    if (!m || m.type !== 'video') return;
    const v = document.createElement('video');
    Object.assign(v, { muted: true, loop: true, playsInline: true, src: encodeURI(m.src) });
    v.className = 'tile__video';
    t.insertBefore(v, t.querySelector('.tile__label'));
    t._v = v;
    v.addEventListener('playing', () => v.classList.add('is-on'), { once: true });
    v.play().catch(() => {});
  });
  grid.addEventListener('pointerout', (e) => {
    const t = e.target.closest('.tile'); if (!t || !t._v || t.contains(e.relatedTarget)) return;
    const v = t._v; t._v = null; v.classList.remove('is-on');
    setTimeout(() => { v.pause(); v.remove(); }, 350);
  });

  grid.addEventListener('click', (e) => {
    const t = e.target.closest('.tile'); if (!t) return;
    const i = +t.dataset.index;
    const from = t.querySelector('img, .cover');
    const swap = () => { setGrid(false); goTo(i, { smooth: false, dir: 0 }); };
    if (document.startViewTransition && from && !reduced) {
      document.documentElement.classList.add('vt-zoom');
      from.style.viewTransitionName = 'hero';
      const vt = document.startViewTransition(() => {
        from.style.viewTransitionName = '';
        swap();
        const to = slides[pos].firstElementChild;
        if (to) to.style.viewTransitionName = 'hero';
      });
      vt.finished.finally(() => {
        document.documentElement.classList.remove('vt-zoom');
        slides.forEach((s) => s.firstElementChild && (s.firstElementChild.style.viewTransitionName = ''));
      });
    } else swap();
  });

  /* ================================================================
     Ficha de proyecto
     ================================================================ */
  function sheetHTML(i) {
    const p = projects[i];
    const nx = projects[(i + 1) % N];
    const rows = [];
    if (p.services.length) rows.push(['Servicios', p.services.map(esc).join(' · ')]);
    if (p.team) rows.push(['Equipo', esc(p.team)]);
    const items = [];
    if (p.media && p.media.type === 'video') {
      items.push(`<figure class="g g--full" data-reveal><video muted loop playsinline autoplay preload="metadata" poster="${encodeURI(p.media.poster || '')}" src="${encodeURI(p.media.src)}"></video></figure>`);
    }
    // Horizontales a sangre; verticales/cuadradas por parejas (si queda una suelta, centrada)
    const gal = p.gallery || [];
    const kinds = gal.map(([, w, h]) => (w / h >= 1.2 ? 'full' : 'half'));
    kinds.forEach((k, j) => {
      if (k !== 'half') return;
      let a = j; while (a > 0 && kinds[a - 1] !== 'full') a--;
      let z = j; while (z < kinds.length - 1 && kinds[z + 1] !== 'full') z++;
      if ((z - a + 1) % 2 === 1 && j === z) kinds[j] = 'solo';
    });
    gal.forEach(([s, w, h, vid], j) => {
      // Piezas de vídeo del deck: se muestra el fotograma y, si el .mp4 está subido, se sustituye por el vídeo
      const inner = `<img src="${encodeURI(s)}" width="${w}" height="${h}" alt="${esc(p.name)}" loading="lazy" decoding="async"${vid ? ` data-video="${encodeURI(vid)}"` : ''}>`;
      items.push(`<figure class="g g--${kinds[j]}" data-reveal>${inner}</figure>`);
    });
    if (!items.length && p.media && p.media.type === 'image') {
      items.push(`<figure class="g g--full" data-reveal><img src="${encodeURI(p.media.src)}" alt="${esc(p.name)}" loading="lazy"></figure>`);
    }
    return `
      <header class="sheet__head">
        <div class="chips">
          <span class="chip chip--num">${pad(i + 1)}</span><span class="chip">Proyecto</span><span class="chip chip--round">${esc(p.name)}</span>
        </div>
        <h2 class="sheet__title" id="sheet-title">[${esc(p.name)}]</h2>
        ${p.long ? `<p class="sheet__lead">${esc(p.long)}</p>` : ''}
        <div class="rows">
          ${rows.map(([l, v]) => `<div class="row"><span class="row__label">${l}</span><div class="row__body">${v}</div></div>`).join('')}
          <div class="row"><span class="row__label">Disciplina</span><div class="row__body">${esc(p.tag)}</div></div>
        </div>
      </header>
      <div class="sheet__gallery">${items.join('')}</div>
      <button class="sheet__next" data-next="${(i + 1) % N}">
        <span class="sheet__next-label">Siguiente proyecto</span>
        <span class="sheet__next-title">[${esc(nx.name)}] →</span>
      </button>`;
  }

  let sheetIO;
  function tryVideo(fig) {
    const img = fig.querySelector('img[data-video]'); if (!img) return;
    const v = document.createElement('video');
    Object.assign(v, { muted: true, loop: true, playsInline: true, autoplay: true, preload: 'auto', poster: img.src });
    v.width = img.width; v.height = img.height;
    v.addEventListener('loadeddata', () => { img.replaceWith(v); v.play().catch(() => {}); }, { once: true });
    v.addEventListener('error', () => v.remove(), { once: true });
    v.src = img.dataset.video;
  }
  function fillSheet(i) {
    sheetBody.innerHTML = sheetHTML(i);
    sheet.scrollTop = 0;
    if (sheetIO) sheetIO.disconnect();
    const figs = sheetBody.querySelectorAll('[data-reveal]');
    if (reduced || !('IntersectionObserver' in window)) { figs.forEach((f) => { f.classList.add('is-in'); tryVideo(f); }); return; }
    sheetIO = new IntersectionObserver((en) => en.forEach((x) => { if (x.isIntersecting) { x.target.classList.add('is-in'); tryVideo(x.target); sheetIO.unobserve(x.target); } }),
      { root: sheet, rootMargin: '0px 0px -6% 0px', threshold: 0.08 });
    figs.forEach((f) => sheetIO.observe(f));
  }
  function openSheet(i, push = true) {
    closeMore();
    fillSheet(i);
    flags.sheet = true;
    sheet.hidden = false;
    document.body.classList.add('is-sheet');
    requestAnimationFrame(() => requestAnimationFrame(() => sheet.classList.add('is-open')));
    if (push) history.pushState({ sheet: i }, '', '#' + projects[i].slug + '/ver');
    syncVideos();
    setTimeout(() => sheet.focus({ preventScroll: true }), 50);
  }
  function closeSheet(fromPop) {
    if (!flags.sheet) return;
    flags.sheet = false;
    sheet.classList.remove('is-open');
    document.body.classList.remove('is-sheet');
    setTimeout(() => { if (!flags.sheet) { sheet.hidden = true; sheetBody.innerHTML = ''; } }, 700);
    if (!fromPop && history.state && history.state.sheet !== undefined) history.back();
    else history.replaceState(null, '', '#' + projects[cur].slug);
    resetTimer();
    syncVideos();
  }
  sheet.querySelector('.sheet__close').addEventListener('click', () => closeSheet());
  sheet.addEventListener('click', (e) => {
    const b = e.target.closest('[data-next]'); if (!b) return;
    const i = +b.dataset.next;
    goTo(i, { smooth: false, dir: 1 });
    sheet.classList.add('is-swapping');
    setTimeout(() => { fillSheet(i); history.replaceState({ sheet: i }, '', '#' + projects[i].slug + '/ver'); sheet.classList.remove('is-swapping'); }, 280);
  });
  window.addEventListener('popstate', () => { if (flags.sheet) closeSheet(true); });
  // Enlaces directos a #slug o #slug/ver dentro de la misma página
  window.addEventListener('hashchange', () => {
    const [slug, view] = location.hash.slice(1).split('/');
    const i = projects.findIndex((p) => p.slug === slug);
    if (i < 0) return;
    if (view === 'ver') { if (!flags.sheet) { goTo(i, { smooth: false, dir: 0 }); openSheet(i, false); } }
    else { if (flags.sheet) closeSheet(true); if (i !== cur) goTo(i, { dir: i > cur ? 1 : -1 }); }
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
  UI.onChange((s) => { document.body.classList.toggle('is-panel', !!s.panel); });

  window.addEventListener('resize', () => {
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
     Arranque: #slug, #slug/ver, ?grid
     ================================================================ */
  const [hSlug, hView] = location.hash.slice(1).split('/');
  const fromHash = projects.findIndex((p) => p.slug === hSlug);
  const start = fromHash >= 0 ? fromHash : 0;
  requestAnimationFrame(() => {
    W = track.clientWidth;
    pos = start + 1;
    jumpSilently(pos);
    setCurrent(start, 1);
    if (hView === 'ver') openSheet(start, false);
    else if (location.search.includes('grid')) setGrid(true);
  });

  window.HOME = {
    goTo: (i, o = {}) => {
      if (flags.grid) setGrid(false);
      if (flags.sheet) closeSheet();
      goTo(i, { smooth: !o.fromMenu || Math.abs(i - cur) <= 1, dir: i > cur ? 1 : -1 });
    },
    setGrid
  };
})();
