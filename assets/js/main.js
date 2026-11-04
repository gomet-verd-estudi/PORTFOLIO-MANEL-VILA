(function () {
  const projects = window.PROJECTS || [];
  const total = projects.length;
  const $ = (s, el = document) => el.querySelector(s);
  const pad = (n) => String(n).padStart(2, '0');
  const mobileQuery = window.matchMedia('(max-width: 923px)');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const track = $('#track');
  const grid = $('#grid');
  const progress = $('#progress');
  const bar = {
    num: $('.bar__num'), name: $('.bar__name'), tag: $('.bar__tag'),
    short: $('.bar__short'), more: $('.bar__more')
  };
  const more = $('#more');
  const moreInner = $('.more__inner');
  const count = $('.view-toggle__count');
  const toggle = $('.view-toggle');

  let current = -1;

  /* ---------- helpers de render ---------- */
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const srcFor = (m) => encodeURI(mobileQuery.matches && m.mobile ? m.mobile : m.src);

  function coverHTML(p, i, { blue = false, lead = true } = {}) {
    return `
      <div class="cover${blue ? ' cover--blue' : ''}">
        <div class="chips">
          <span class="chip chip--num">${pad(i + 1)}</span>
          <span class="chip">Proyecto</span>
          <span class="chip chip--round">${esc(p.name)}</span>
        </div>
        <h2 class="cover__title">[${esc(p.name)}]</h2>
        ${lead && p.long ? `<p class="cover__lead">${esc(p.long)}</p>` : ''}
        ${lead && p.services.length ? `<p class="cover__services">${p.services.map(esc).join(' · ')}</p>` : ''}
      </div>`;
  }

  function mediaHTML(p, i) {
    const m = p.media;
    if (!m) return coverHTML(p, i);
    if (m.type === 'image') {
      return `<img src="${srcFor(m)}" alt="${esc(p.name)}" ${i > 1 ? 'loading="lazy"' : ''}>`;
    }
    // Vídeo: el src se asigna al acercarse (data-src) para no cargar 100MB de golpe.
    return `<video muted loop playsinline preload="none" poster="${encodeURI(m.poster || '')}" data-src="${srcFor(m)}" aria-label="${esc(p.name)}"></video>`;
  }

  /* ---------- construir carrusel, grid y progreso ---------- */
  track.innerHTML = projects.map((p, i) => `
    <section class="slide" id="${p.slug}" data-index="${i}" aria-label="${esc(p.name)}">
      ${mediaHTML(p, i)}
      <button class="slide__hit slide__hit--prev" aria-label="Proyecto anterior" tabindex="-1"></button>
      <button class="slide__hit slide__hit--next" aria-label="Proyecto siguiente" tabindex="-1"></button>
    </section>`).join('');

  grid.innerHTML = projects.map((p, i) => {
    const m = p.media;
    const visual = !m ? coverHTML(p, i, { lead: false })
      : `<img src="${encodeURI(m.type === 'image' ? m.src : m.poster)}" alt="" loading="lazy">`;
    return `
      <button class="tile" data-index="${i}" aria-label="${esc(p.name)}">
        ${visual}
        <span class="tile__label"><span>${pad(i + 1)}</span><span>${esc(p.name)}</span><span>${esc(p.tag)}</span></span>
      </button>`;
  }).join('');

  progress.innerHTML = projects.map((p, i) =>
    `<button data-index="${i}" aria-label="Ir a ${esc(p.name)}"></button>`).join('');

  const slides = Array.from(track.children);
  const dots = Array.from(progress.children);

  /* ---------- vídeos: solo reproduce el activo, precarga vecinos ---------- */
  function syncVideos(idx) {
    slides.forEach((s, i) => {
      const v = s.querySelector('video');
      if (!v) return;
      const near = Math.abs(i - idx) <= 1 || (idx === 0 && i === total - 1) || (idx === total - 1 && i === 0);
      if (near && !v.src) { v.src = v.dataset.src; v.preload = 'auto'; }
      if (i === idx) {
        const pr = v.play(); if (pr && pr.catch) pr.catch(() => {});
      } else if (!v.paused) {
        v.pause();
      }
    });
  }

  /* ---------- estado del proyecto activo ---------- */
  function setCurrent(idx) {
    if (idx === current || idx < 0 || idx >= total) return;
    current = idx;
    const p = projects[idx];
    bar.num.textContent = pad(idx + 1);
    bar.name.textContent = p.name;
    bar.tag.textContent = p.tag;
    bar.short.textContent = p.short;
    count.textContent = `${pad(idx + 1)} / ${pad(total)}`;
    dots.forEach((d, i) => d.classList.toggle('is-active', i === idx));

    const rows = [];
    if (p.services.length) rows.push(['Servicios', p.services.map(esc).join(' · ')]);
    if (p.team) rows.push(['Equipo', esc(p.team)]);
    moreInner.innerHTML =
      (p.long ? `<p class="more__long">${esc(p.long)}</p>` : '') +
      rows.map(([l, v]) => `<div class="more__row"><span class="more__label">${l}</span><span>${v}</span></div>`).join('');

    closeMore();
    syncVideos(idx);
    history.replaceState(null, '', '#' + p.slug);
  }

  function goTo(idx, smooth = true) {
    const i = ((idx % total) + total) % total;
    track.scrollTo({ left: i * track.clientWidth, behavior: smooth && !reduced ? 'smooth' : 'auto' });
    setCurrent(i);
  }

  /* ---------- +info ---------- */
  function openMore() { more.classList.add('is-open'); bar.more.textContent = '-info'; bar.more.setAttribute('aria-expanded', 'true'); }
  function closeMore() { more.classList.remove('is-open'); bar.more.textContent = '+info'; bar.more.setAttribute('aria-expanded', 'false'); }
  bar.more.addEventListener('click', () => (more.classList.contains('is-open') ? closeMore() : openMore()));

  /* ---------- eventos del carrusel ---------- */
  let scrollRaf;
  track.addEventListener('scroll', () => {
    cancelAnimationFrame(scrollRaf);
    scrollRaf = requestAnimationFrame(() => {
      setCurrent(Math.round(track.scrollLeft / track.clientWidth));
    });
  }, { passive: true });

  track.addEventListener('click', (e) => {
    if (e.target.closest('.slide__hit--next')) goTo(current + 1);
    else if (e.target.closest('.slide__hit--prev')) goTo(current - 1);
  });

  // Rueda vertical → paso horizontal (un proyecto por gesto)
  let wheelLock = false;
  track.addEventListener('wheel', (e) => {
    if (document.body.classList.contains('is-grid')) return;
    const d = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
    e.preventDefault();
    if (wheelLock || Math.abs(d) < 8) return;
    wheelLock = true;
    goTo(current + (d > 0 ? 1 : -1));
    setTimeout(() => { wheelLock = false; }, 750);
  }, { passive: false });

  document.addEventListener('keydown', (e) => {
    if (document.body.classList.contains('is-grid')) { if (e.key === 'Escape') setView(false); return; }
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); goTo(current + 1); }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); goTo(current - 1); }
    if (e.key === 'Escape') closeMore();
    if (e.key === 'i') (more.classList.contains('is-open') ? closeMore() : openMore());
  });

  progress.addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (b) goTo(+b.dataset.index);
  });

  /* ---------- vista grid ---------- */
  function setView(isGrid) {
    document.body.classList.toggle('is-grid', isGrid);
    toggle.setAttribute('aria-pressed', String(isGrid));
    toggle.querySelector('.sr-only').textContent = isGrid ? 'Ver carrusel' : 'Ver todos los proyectos';
    const v = slides[current] && slides[current].querySelector('video');
    if (v) { isGrid ? v.pause() : v.play().catch(() => {}); }
  }
  toggle.addEventListener('click', () => setView(!document.body.classList.contains('is-grid')));
  grid.addEventListener('click', (e) => {
    const t = e.target.closest('.tile'); if (!t) return;
    goTo(+t.dataset.index, false);
    setView(false);
  });

  // El enlace "Proyectos" del menú abre el índice en grid estando en la home.
  document.querySelectorAll('[data-open-grid]').forEach((a) =>
    a.addEventListener('click', (e) => { e.preventDefault(); setView(true); }));

  /* ---------- resize / cambio móvil-escritorio ---------- */
  window.addEventListener('resize', () => {
    track.scrollTo({ left: current * track.clientWidth, behavior: 'auto' });
  });
  mobileQuery.addEventListener('change', () => {
    slides.forEach((s, i) => {
      const v = s.querySelector('video'); const m = projects[i].media;
      if (!v || !m) return;
      v.dataset.src = srcFor(m);
      if (v.src) { v.src = v.dataset.src; }
    });
    syncVideos(current);
  });

  /* ---------- arranque (respeta #slug) ---------- */
  const fromHash = projects.findIndex((p) => '#' + p.slug === location.hash);
  const start = fromHash >= 0 ? fromHash : 0;
  requestAnimationFrame(() => {
    track.scrollTo({ left: start * track.clientWidth, behavior: 'auto' });
    setCurrent(start);
    if (location.search.includes('grid')) setView(true);
  });
})();
