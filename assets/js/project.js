/*
 * PÁGINA DE PROYECTO
 * - Barra de lectura (progreso de scroll)
 * - Piezas de vídeo del deck: el fotograma se cambia por el vídeo al entrar en pantalla
 * - Visor a pantalla completa (lightbox) con teclado, flechas y gesto de deslizar
 * - Esquina inferior: el proyecto y la pieza que se está viendo (03 / 12)
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
    v.width = +im.getAttribute('width'); v.height = +im.getAttribute('height');
    v.setAttribute('aria-label', im.alt);
    v.addEventListener('loadeddata', () => {
      if (fig.classList.contains('g--full') && v.videoWidth < 900) fig.classList.add('g--small');
      (im.parentElement.tagName === 'PICTURE' ? im.parentElement : im).replaceWith(v);
      v.play().catch(() => {});
    }, { once: true });
    v.addEventListener('error', () => v.remove(), { once: true });
    // data-alts: variantes de más ligera a más pesada ("url av1,url hevc"); se usa la primera reproducible
    const TYPES = { av1: 'video/mp4; codecs="av01.0.08M.10"', hevc: 'video/mp4; codecs="hvc1.1.6.L120.90"' };
    const alt = (im.dataset.alts || '').split(',').filter(Boolean).map((x) => x.split(' '))
      .find(([, k]) => v.canPlayType(TYPES[k]));
    v.src = alt ? alt[0] : im.dataset.video;
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

  /* ---------- esquina: qué pieza cruza el centro de la pantalla ---------- */
  const count = $('[data-count]');
  if (count && figs.length && 'IntersectionObserver' in window) {
    const idle = count.textContent;
    const live = new Set();
    const pad = (n) => String(n).padStart(2, '0');
    const cio = new IntersectionObserver((en) => {
      en.forEach((x) => (x.isIntersecting ? live.add(x.target) : live.delete(x.target)));
      const cur = figs.filter((f) => live.has(f)).pop();
      count.textContent = cur ? `${pad(figs.indexOf(cur) + 1)} / ${pad(figs.length)}` : idle;
    }, { rootMargin: '-50% 0px -50% 0px' });
    figs.forEach((f) => cio.observe(f));
  }

  /* ---------- visor ---------- */
  const lb = $('.lightbox');
  const stage = lb && $('.lightbox__stage', lb);
  const lbCount = lb && $('.lightbox__count', lb);
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
      // Copia del <picture> (AVIF + JPG) pidiendo la versión grande
      el = (im.closest('picture') || im).cloneNode(true);
      el.querySelectorAll('[sizes]').forEach((n) => n.setAttribute('sizes', '100vw'));
      const ci = el.tagName === 'IMG' ? el : el.querySelector('img');
      ci.removeAttribute('loading');
    }
    stage.replaceChildren(el);
    if (!reduced && el.animate) el.animate([{ opacity: 0, transform: 'scale(.985)' }, { opacity: 1, transform: 'none' }], { duration: 380, easing: 'cubic-bezier(.16,1,.3,1)' });
    lbCount.textContent = `${String(at + 1).padStart(2, '0')} — ${String(figs.length).padStart(2, '0')}`;
  }
  // El visor aparece y desaparece con un fundido (el fondo es cristal esmerilado, como el panel del About)
  let closing = 0;
  function open(n) {
    if (!lb || typeof lb.showModal !== 'function') return;
    clearTimeout(closing);
    show(n);
    if (!lb.open) lb.showModal();
    document.documentElement.classList.add('is-lightbox');
    if (UI.scroller) UI.scroller.stop();               // la página no se mueve debajo del visor
    requestAnimationFrame(() => requestAnimationFrame(() => lb.classList.add('is-on')));
  }
  function close() {
    if (!lb || !lb.open) return;
    lb.classList.remove('is-on');
    closing = setTimeout(() => lb.close(), reduced ? 0 : 320);
  }
  if (lb) {
    lb.addEventListener('cancel', (e) => { e.preventDefault(); close(); });   // Esc también con fundido
    lb.addEventListener('close', () => { document.documentElement.classList.remove('is-lightbox'); if (UI.scroller) UI.scroller.start(); stage.replaceChildren(); figs[at] && figs[at].querySelector('.g__open').focus({ preventScroll: true }); });
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

  /* ---------- transiciones: la portada viaja entre páginas ---------- */
  // Al salir: si se va al siguiente proyecto, su imagen se convierte en la portada de la página nueva;
  // si no, la portada solo viaja cuando se ve (si estás abajo del todo, sale con la página).
  const heroEl = $('.pj__media');   // la caja de la portada (es la que viaja)
  const nextBox = $('.pj__next-img');
  let prepared = false;
  function prepLeave(toNext) {
    prepared = true;
    try { sessionStorage.setItem('mv-from', document.body.dataset.slug); } catch (e) { /* sin storage */ }
    if (nextBox) nextBox.style.viewTransitionName = '';
    if (!heroEl) return;
    if (toNext && nextBox) { heroEl.style.viewTransitionName = 'none'; nextBox.style.viewTransitionName = 'hero'; return; }
    const r = heroEl.getBoundingClientRect();
    heroEl.style.viewTransitionName = r.bottom > 0 && r.top < innerHeight ? '' : 'none';
  }
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (a && a.href && !a.target && a.origin === location.origin && !(a.pathname === location.pathname && a.hash)) prepLeave(!!a.closest('.pj__next'));
  }, true);
  addEventListener('pageswap', () => { if (!prepared) prepLeave(false); });   // "atrás" del navegador
  addEventListener('pageshow', (e) => {
    if (!e.persisted) return;
    prepared = false;
    if (heroEl) heroEl.style.viewTransitionName = '';
    if (nextBox) nextBox.style.viewTransitionName = '';
  });

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

})();
