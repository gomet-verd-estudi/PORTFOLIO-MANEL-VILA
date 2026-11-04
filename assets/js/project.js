/*
 * PÁGINA DE PROYECTO
 * - Barra de lectura (progreso de scroll)
 * - Piezas de vídeo del deck: el fotograma se cambia por el vídeo al entrar en pantalla
 * - Visor a pantalla completa (lightbox) con teclado, flechas y gesto de deslizar
 * - Atajos: ← / → proyecto anterior / siguiente, Esc vuelve a los proyectos
 * - Transición entre páginas: la portada "viaja" de la home al proyecto (View Transitions)
 */
(function () {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const UI = window.UI || { state: {} };

  /* ---------- barra de lectura ---------- */
  const bar = $('.readbar');
  let ticking = false;
  const onScroll = () => {
    if (ticking) return; ticking = true;
    requestAnimationFrame(() => {
      const max = document.documentElement.scrollHeight - innerHeight;
      bar.style.transform = `scaleX(${max > 0 ? Math.min(1, scrollY / max) : 0})`;
      document.body.classList.toggle('is-scrolled', scrollY > 40);
      ticking = false;
    });
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- vídeos del deck ---------- */
  function tryVideo(fig) {
    const im = fig.querySelector('img[data-video]'); if (!im || im._tried) return;
    im._tried = true;
    const v = document.createElement('video');
    Object.assign(v, { muted: true, loop: true, playsInline: true, autoplay: true, preload: 'auto' });
    v.poster = im.currentSrc || im.src;
    v.width = im.width; v.height = im.height;
    v.setAttribute('aria-label', im.alt);
    v.addEventListener('loadeddata', () => {
      if (fig.classList.contains('g--full') && v.videoWidth < 900) fig.classList.add('g--small');
      im.replaceWith(v);
      v.play().catch(() => {});
    }, { once: true });
    v.addEventListener('error', () => v.remove(), { once: true });
    v.src = im.dataset.video;
  }
  const figs = $$('.pj__gallery .g');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((en) => en.forEach((x) => {
      if (x.isIntersecting) { tryVideo(x.target); io.unobserve(x.target); }
    }), { rootMargin: '300px 0px' });
    figs.forEach((f) => io.observe(f));
    // Pausa los vídeos que salen de pantalla (ahorra batería y CPU)
    const vio = new IntersectionObserver((en) => en.forEach((x) => {
      const v = x.target.querySelector('video'); if (!v) return;
      x.isIntersecting ? v.play().catch(() => {}) : v.pause();
    }), { threshold: 0.05 });
    figs.forEach((f) => vio.observe(f));
    const hero = $('.pj__hero'); if (hero) vio.observe(hero);
  } else figs.forEach(tryVideo);

  /* ---------- visor ---------- */
  const lb = $('.lightbox');
  const stage = lb && $('.lightbox__stage', lb);
  const count = lb && $('.lightbox__count', lb);
  let at = -1;

  function show(n) {
    at = (n + figs.length) % figs.length;
    const fig = figs[at];
    const v = fig.querySelector('video');
    const im = fig.querySelector('img');
    let el;
    if (v) {
      el = document.createElement('video');
      Object.assign(el, { muted: true, loop: true, playsInline: true, autoplay: true, controls: false, src: v.currentSrc || v.src, poster: v.poster });
    } else {
      el = new Image();
      el.alt = im.alt;
      el.src = im.src;              // la versión grande, no la de 800px
      el.decoding = 'async';
    }
    stage.replaceChildren(el);
    if (!reduced && el.animate) el.animate([{ opacity: 0, transform: 'scale(.985)' }, { opacity: 1, transform: 'none' }], { duration: 380, easing: 'cubic-bezier(.16,1,.3,1)' });
    count.textContent = `${String(at + 1).padStart(2, '0')} — ${String(figs.length).padStart(2, '0')}`;
    // precarga la siguiente
    const nx = figs[(at + 1) % figs.length].querySelector('img');
    if (nx) { const pre = new Image(); pre.src = nx.src; }
  }
  function open(n) {
    if (!lb || typeof lb.showModal !== 'function') return;
    show(n);
    lb.showModal();
    document.documentElement.classList.add('is-lightbox');
  }
  function close() {
    if (!lb || !lb.open) return;
    lb.close();
  }
  if (lb) {
    lb.addEventListener('close', () => { document.documentElement.classList.remove('is-lightbox'); stage.replaceChildren(); figs[at] && figs[at].querySelector('.g__open').focus({ preventScroll: true }); });
    figs.forEach((f, n) => f.querySelector('.g__open').addEventListener('click', () => open(n)));
    lb.addEventListener('click', (e) => {
      const b = e.target.closest('[data-lb]');
      if (b) { const a = b.dataset.lb; a === 'close' ? close() : show(at + (a === 'next' ? 1 : -1)); return; }
      if (e.target === lb || e.target === stage) close();
    });
    let sx = null;
    lb.addEventListener('pointerdown', (e) => { sx = e.clientX; });
    lb.addEventListener('pointerup', (e) => {
      if (sx === null) return;
      const dx = e.clientX - sx; sx = null;
      if (Math.abs(dx) > 50) show(at + (dx < 0 ? 1 : -1));
    });
  }

  /* ---------- teclado ---------- */
  const next = $('a[rel="next"]');
  const prev = $('a[rel="prev"]');
  const back = $('.pj__back');
  addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey || e.target.closest('input, textarea')) return;
    if (lb && lb.open) {
      if (e.key === 'ArrowRight') { e.preventDefault(); show(at + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); show(at - 1); }
      return; // Esc lo gestiona el propio <dialog>
    }
    if (UI.state.panel || UI.state.navOpen) return;
    if (e.key === 'ArrowRight' && next) next.click();
    if (e.key === 'ArrowLeft' && prev) prev.click();
    if (e.key === 'Escape' && back) back.click();
  });

  /* ---------- siguiente proyecto: la imagen sigue al cursor ---------- */
  const nx = $('.pj__next');
  const nxImg = nx && $('.pj__next-img', nx);
  if (nx && nxImg && window.matchMedia('(hover: hover) and (pointer: fine)').matches && !reduced) {
    nx.addEventListener('pointermove', (e) => {
      const r = nx.getBoundingClientRect();
      nxImg.style.setProperty('--x', `${e.clientX - r.left}px`);
      nxImg.style.setProperty('--y', `${e.clientY - r.top}px`);
    });
  }
})();
