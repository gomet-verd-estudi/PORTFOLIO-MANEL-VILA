/*
 * UI compartida (home + about)
 * - Monograma MV que se transforma en X al abrir el menú (animación original, ahora interpolada)
 * - La "franja": píldora que se despliega en barra centrada con los enlaces escalonados
 * - Paneles de cristal (Proyectos / About / Contacto) que se abren y cierran en secuencia
 * - Intro de carga con el monograma
 * - Scroll suave (Lenis) en About y proyectos; la home lo aplica a su índice (main.js)
 */
(function () {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const listeners = [];
  const emit = () => listeners.forEach((fn) => fn(state));
  const state = { navOpen: false, panel: null };

  /* Textos que escribe el JavaScript, en el idioma de la página (inglés por defecto; español en /es/) */
  const LANG = document.documentElement.lang === 'es' ? 'es' : 'en';
  const t = {
    es: {
      openMenu: 'Abrir menú', closeMenu: 'Cerrar menú', copied: 'Copiado ✓',
      services: 'Servicios', team: 'Equipo', seeFull: 'Ver proyecto completo →',
      seeAll: 'Ver todos los proyectos', backCarousel: 'Volver al carrusel', closeAbout: 'Cerrar About',
      pause: 'Pausar pase automático', resume: 'Reanudar pase automático', goTo: 'Ir a'
    },
    en: {
      openMenu: 'Open menu', closeMenu: 'Close menu', copied: 'Copied ✓',
      services: 'Services', team: 'Team', seeFull: 'See full project →',
      seeAll: 'See all projects', backCarousel: 'Back to carousel', closeAbout: 'Close About',
      pause: 'Pause slideshow', resume: 'Resume slideshow', goTo: 'Go to'
    }
  }[LANG];

  /* ------------------------------------------------------------------
     Monograma: 4 barras descritas por centro, longitud y ángulo.
     MV (estado inicial) → X (estado final), mismas barras que el SVG original.
     ------------------------------------------------------------------ */
  const T = 81.25;
  const MV = [
    [306.64, 336.85, 673.08, -13.34],
    [518.74, 241.29, 476.69, 13.34],
    [708.06, 431.74, 477.96, -13.34],
    [94.67, 431.78, 477.96, 13.34]
  ];
  const OX = 64.65; // centra la X (viewBox 673) dentro del viewBox del MV (802)
  const X = [
    [162.46 + OX, 162.62, 378.27, -45],
    [511.04 + OX, 162.58, 378.4, 45],
    [162.46 + OX, 511.14, 378.27, 45],
    [510.98 + OX, 511.13, 378.27, -45]
  ];

  function drawBars(svg, bars) {
    const groups = svg.children;
    bars.forEach(([cx, cy, L, a], i) => {
      const g = groups[i], r = g.firstChild;
      g.setAttribute('transform', `translate(${cx} ${cy}) rotate(${a})`);
      r.setAttribute('x', -T / 2);
      r.setAttribute('y', -L / 2);
      r.setAttribute('width', T);
      r.setAttribute('height', L);
    });
  }

  function buildMark(svg) {
    svg.setAttribute('viewBox', '0 0 802.74 673.67');
    svg.innerHTML = '<g><rect/></g><g><rect/></g><g><rect/></g><g><rect/></g>';
    drawBars(svg, MV);
    svg._p = 0;
  }

  function morph(svg, to, duration = 650) {
    if (!svg) return;
    cancelAnimationFrame(svg._raf);
    const from = svg._p || 0;
    if (reduced) { svg._p = to; drawBars(svg, to ? X : MV); return; }
    const start = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const p = from + (to - from) * ease(t);
      svg._p = p;
      drawBars(svg, MV.map((m, i) => m.map((v, k) => v + (X[i][k] - v) * p)));
      if (t < 1) svg._raf = requestAnimationFrame(step);
    };
    svg._raf = requestAnimationFrame(step);
  }

  document.querySelectorAll('svg[data-mark]').forEach(buildMark);

  /* ------------------------------------------------------------------
     Franja + paneles
     ------------------------------------------------------------------ */
  const franja = document.querySelector('.franja');
  const markBtn = franja && franja.querySelector('.franja__mark');
  const markSvg = markBtn && markBtn.querySelector('svg');
  const panels = {};
  document.querySelectorAll('.panel[data-panel]').forEach((p) => { panels[p.dataset.panel] = p; });

  const PANEL_MS = 520;
  let busy = Promise.resolve();
  const wait = (ms) => new Promise((r) => setTimeout(r, reduced ? 0 : ms));
  const queue = (fn) => (busy = busy.then(fn, fn));

  /* Botón de la esquina → X mientras se está en el About (panel de la home o página About) */
  const backBtn = document.querySelector('.grid-btn[data-back]');
  const syncX = () => document.body.classList.toggle('is-x', !!backBtn || state.panel === 'about');

  function showPanel(name) {
    const p = panels[name]; if (!p) return;
    p.hidden = false;
    requestAnimationFrame(() => requestAnimationFrame(() => p.classList.add('is-open')));
    franja.querySelectorAll('[data-panel]').forEach((b) => b.classList.toggle('is-active', b.dataset.panel === name));
    state.panel = name; syncX(); emit();
  }
  async function hidePanel() {
    const name = state.panel; if (!name) return;
    const p = panels[name];
    p.classList.remove('is-open');
    franja.querySelectorAll('[data-panel]').forEach((b) => b.classList.remove('is-active'));
    state.panel = null; syncX(); emit();
    await wait(PANEL_MS);
    if (!p.classList.contains('is-open')) p.hidden = true;
  }

  function togglePanel(name) {
    return queue(async () => {
      if (state.panel === name) return hidePanel();
      if (state.panel) await hidePanel();
      if (!state.navOpen) await openNav();
      showPanel(name);
    });
  }

  async function openNav() {
    if (state.navOpen) return;
    state.navOpen = true;
    document.body.classList.add('is-nav-open');
    markBtn.setAttribute('aria-expanded', 'true');
    markBtn.setAttribute('aria-label', t.closeMenu);
    morph(markSvg, 1);
    emit();
    await wait(380);
  }
  async function closeNav() {
    if (state.panel) await hidePanel();
    if (!state.navOpen) return;
    state.navOpen = false;
    document.body.classList.remove('is-nav-open');
    markBtn.setAttribute('aria-expanded', 'false');
    markBtn.setAttribute('aria-label', t.openMenu);
    morph(markSvg, 0);
    emit();
  }

  if (franja) {
    markBtn.addEventListener('click', () => queue(() => (state.navOpen ? closeNav() : openNav())));
    franja.querySelectorAll('[data-panel]').forEach((b) =>
      b.addEventListener('click', (e) => { e.preventDefault(); togglePanel(b.dataset.panel); }));
    document.querySelectorAll('.panel__close').forEach((b) => b.addEventListener('click', () => queue(hidePanel)));
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      if (state.panel) queue(hidePanel); else if (state.navOpen) queue(closeNav);
    });
    // Clic fuera: cierra el panel abierto
    document.addEventListener('pointerdown', (e) => {
      if (!state.panel) return;
      if (e.target.closest('.panel, .franja, .grid-btn')) return;
      queue(hidePanel);
    });
    // Enlaces internos de los paneles (ej. #contacto en about)
    document.querySelectorAll('[data-close-nav]').forEach((a) => a.addEventListener('click', () => queue(closeNav)));
  }

  /* Página About: la X vuelve exactamente a donde estabas (home en carrusel o grid,
     o el proyecto), con el morph de vuelta a los cuadrados antes de salir. */
  if (backBtn) {
    const morphIn = () => { document.body.classList.remove('is-x'); requestAnimationFrame(() => requestAnimationFrame(syncX)); };
    morphIn();
    // Vuelve a la página de la que se vino de verdad, aunque por el camino haya entradas del mismo
    // About en el historial; si se entró directamente, va a la home.
    function goBackOut() {
      const nav = window.navigation;
      if (nav && nav.entries && nav.currentEntry) {
        const list = nav.entries();
        for (let k = nav.currentEntry.index - 1; k >= 0; k--) {
          const u = new URL(list[k].url);
          if (u.origin === location.origin && u.pathname !== location.pathname) { nav.traverseTo(list[k].key); return; }
        }
        location.href = backBtn.href; return;
      }
      let ref = null;
      try { ref = document.referrer ? new URL(document.referrer) : null; } catch (er) { ref = null; }
      const fromSite = ref && ref.origin === location.origin && ref.pathname !== location.pathname && history.length > 1;
      fromSite ? history.back() : (location.href = backBtn.href);
    }
    backBtn.addEventListener('click', (e) => {
      e.preventDefault();
      document.body.classList.remove('is-x');            // la X vuelve a cuadrados mientras la página cambia
      markDir(true);
      leave(goBackOut, true);
    });
    addEventListener('pageshow', (e) => { if (e.persisted) morphIn(); });
  }
  /* ------------------------------------------------------------------
     Transiciones entre páginas: nunca un corte.
     · Con View Transitions (Chrome, Edge, Safari 18.2+) el navegador funde las dos páginas;
       aquí se decide la dirección: hacia dentro (la nueva sube) o de vuelta (la vieja baja).
       Las páginas se preparan antes del clic (speculation rules, en la cabecera), así la
       transición arranca al momento y con la portada ya cargada.
     · Sin ellas, o en navegadores dentro de apps (Instagram, Facebook…), que dicen soportarlas
       pero no siempre las hacen: una hoja de papel cubre la página al salir y se retira al llegar.
     · Red de seguridad: si aun así el navegador se salta la transición, la página llega con un fundido.
     ------------------------------------------------------------------ */
  const html = document.documentElement;
  const inApp = /\bwv\b|Instagram|FBAN|FBAV|FB_IAB|Line\/|TikTok|musical_ly|Snapchat|Pinterest/i.test(navigator.userAgent);
  const VT = 'CSSViewTransitionRule' in window && !inApp;
  const homePath = new URL(html.dataset.home || './', location.href).pathname;
  const level = (u) => (u.pathname === homePath || u.pathname === homePath + 'index.html' ? 0 : 1);
  const store = (k, v) => { try { v == null ? sessionStorage.removeItem(k) : sessionStorage.setItem(k, v); } catch (e) { /* sin storage */ } };
  const take = (k) => { try { const v = sessionStorage.getItem(k); sessionStorage.removeItem(k); return v; } catch (e) { return null; } };
  /** Anota que vamos a otra página de la web y en qué dirección (la página nueva lo lee al llegar). */
  function markDir(back) {
    store('mv-dir', back ? 'back' : null);
    store('mv-nav', String(Date.now()));
  }
  /** Sale de la página con transición y luego ejecuta go() (navegar). */
  function leave(go, back) {
    if (reduced) { go(); return; }
    if (VT) { html.classList.add('is-loading'); go(); return; }     // fina barra de carga mientras llega la página
    html.classList.toggle('veil-back', !!back);
    html.classList.add('is-leaving');
    store('mv-veil', back ? 'back' : 'fwd');
    setTimeout(go, 480);
  }
  function unveil() {
    if (!html.classList.contains('is-veiled') && !html.classList.contains('is-leaving')) return;
    store('mv-veil', null);
    html.classList.remove('is-leaving');
    html.classList.add('is-veiled');
    requestAnimationFrame(() => requestAnimationFrame(() => html.classList.add('is-unveil')));
    setTimeout(() => html.classList.remove('is-veiled', 'is-unveil', 'veil-back'), 900);
  }
  /** Red de seguridad: la página aparece con un fundido en vez de de golpe. */
  function softEnter() {
    if (reduced || html.classList.contains('is-veiled')) return;
    html.classList.add('is-enter');
    setTimeout(() => html.classList.remove('is-enter'), 800);
  }
  // Enlaces internos: dirección de la transición y, si hace falta, la hoja de papel
  const internal = (a, e) => a && a.href && !a.target && !a.hasAttribute('download') && a.origin === location.origin &&
    !(a.pathname === location.pathname && a.search === location.search && a.hash) &&
    e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    // Anclas de la misma página (#contacto): se desliza hasta ellas sin dejar rastro en el historial,
    // así la X del About sigue llevando a la página anterior
    if (a && !e.defaultPrevented && a.origin === location.origin && a.pathname === location.pathname && a.search === location.search && a.hash) {
      const target = document.getElementById(decodeURIComponent(a.hash.slice(1)));
      if (target) {
        e.preventDefault();
        const lenis = window.UI && window.UI.scroller;
        lenis ? lenis.scrollTo(target, { duration: 1.4 }) : target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
      }
      return;
    }
    if (!internal(a, e)) return;
    const back = a.rel === 'prev' || a.hasAttribute('data-back') || level(new URL(a.href)) < level(location);
    markDir(back);
    if (e.defaultPrevented) return;                       // otro script se encarga (la X del About)
    if (VT || reduced) { if (VT && !reduced) html.classList.add('is-loading'); return; }   // lo funde el navegador
    e.preventDefault();
    leave(() => { location.href = a.href; }, back);
  });
  unveil();
  addEventListener('pageshow', (e) => {
    if (!e.persisted) return;
    html.classList.remove('is-loading');
    unveil();
  });
  // Llegada: dirección según de dónde se viene (y "atrás" del navegador)
  const cameFromSite = () => { const t = +take('mv-nav'); return t && Date.now() - t < 15000; };
  addEventListener('pagereveal', (e) => {
    const vt = e.viewTransition;
    let back = take('mv-dir') === 'back';
    window.UI.fromSlug = take('mv-from');               // la home la usa para devolver la portada a su sitio
    const internalNav = cameFromSite();
    if (!vt) { if (internalNav) softEnter(); return; }
    // Con la hoja de papel ya puesta (navegadores dentro de apps), no se suma otra transición
    if (html.classList.contains('is-veiled')) { vt.skipTransition(); return; }
    vt.ready.catch(() => softEnter());                   // si el navegador se la salta, fundido
    vt.finished.catch(() => {});
    const nav = window.navigation && window.navigation.activation;
    if (nav && nav.navigationType === 'traverse' && nav.from && nav.entry) back = nav.from.index > nav.entry.index;
    html.classList.toggle('vt-back', back);
    vt.finished.finally(() => html.classList.remove('vt-back'));
  });
  // Navegadores sin pagereveal (o versiones antiguas): si se llegó desde la web, fundido de llegada
  if (!('onpagereveal' in window) && !html.classList.contains('is-veiled') && cameFromSite()) softEnter();
  addEventListener('pageswap', (e) => {
    const vt = e.viewTransition; if (!vt) return;
    if (html.classList.contains('is-leaving')) { vt.skipTransition(); return; }   // ya sale con la hoja de papel
    vt.ready.catch(() => {}); vt.finished.catch(() => {});
  });
  // Al volver con "atrás" a una página que tenía el menú abierto, se deja como estaba antes de abrirlo
  addEventListener('pageshow', (e) => { if (e.persisted && (state.navOpen || state.panel)) queue(closeNav); });

  /* ------------------------------------------------------------------
     Lista de proyectos del panel + previsualización que sigue al cursor
     ------------------------------------------------------------------ */
  const list = document.querySelector('.plist');
  if (list) {
    // La lista viene escrita en el HTML (tools/build.mjs): enlaces reales a cada proyecto.
    const preview = document.createElement('div');
    preview.className = 'peek';
    preview.setAttribute('aria-hidden', 'true');
    preview.innerHTML = '<img alt="">';
    document.body.appendChild(preview);
    const pimg = preview.firstChild;
    let tx = 0, ty = 0, px = 0, py = 0, raf = 0, on = false;
    const loop = () => {
      px += (tx - px) * 0.18; py += (ty - py) * 0.18;
      preview.style.transform = `translate3d(${px}px, ${py}px, 0)`;
      if (on || Math.abs(tx - px) > 0.5) raf = requestAnimationFrame(loop); else raf = 0;
    };
    list.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      tx = e.clientX + 24; ty = e.clientY - 80;
      if (!raf) raf = requestAnimationFrame(loop);
    });
    list.addEventListener('pointerover', (e) => {
      const row = e.target.closest('.plist__row'); if (!row || e.pointerType !== 'mouse') return;
      const src = row.dataset.thumb;
      if (!src) { preview.classList.remove('is-on'); return; }
      if (pimg.getAttribute('src') !== src) pimg.src = src;
      if (!on) { px = tx = e.clientX + 24; py = ty = e.clientY - 80; }
      on = true; preview.classList.add('is-on');
      if (!raf) raf = requestAnimationFrame(loop);
    });
    list.addEventListener('pointerleave', () => { on = false; preview.classList.remove('is-on'); });
    list.addEventListener('click', () => { on = false; preview.classList.remove('is-on'); });
  }

  /* ------------------------------------------------------------------
     Scroll suave: la rueda y el trackpad se deslizan con inercia (Lenis).
     En pantallas táctiles el desplazamiento sigue siendo el nativo del móvil, que ya es fluido.
     El carrusel de la home no se toca: tiene su propio gesto.
     ------------------------------------------------------------------ */
  const SMOOTH = { lerp: 0.085, wheelMultiplier: 0.9, autoRaf: true, allowNestedScroll: true, stopInertiaOnNavigate: true };
  const scroller = window.Lenis && !document.body.classList.contains('home')
    ? new window.Lenis(SMOOTH)
    : null;
  // Al volver con el botón atrás (bfcache) la posición la restaura el navegador: se sincroniza
  if (scroller) addEventListener('pageshow', (e) => { if (e.persisted) { scroller.resize(); scroller.reset(); } });

  // La cinta del footer solo se mueve cuando se ve (ahorra trabajo y batería al resto de la página)
  if ('IntersectionObserver' in window) {
    const mio = new IntersectionObserver((en) => en.forEach((x) => x.target.classList.toggle('is-idle', !x.isIntersecting)));
    document.querySelectorAll('.marquee').forEach((m) => mio.observe(m));
  }

  /* ------------------------------------------------------------------
     Footer: hora de Valencia en directo y "volver arriba"
     ------------------------------------------------------------------ */
  const clocks = document.querySelectorAll('[data-clock]');
  if (clocks.length) {
    const fmt = new Intl.DateTimeFormat('es-ES', { timeZone: 'Europe/Madrid', hour: '2-digit', minute: '2-digit' });
    const tick = () => { const t = fmt.format(new Date()); clocks.forEach((c) => (c.textContent = t)); };
    tick(); setInterval(tick, 20000);
  }
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-top]'); if (!b) return;
    const box = b.closest('.grid');                     // en el índice, el scroll es del propio índice
    const lenis = box ? window.UI.gridScroller : scroller;
    if (lenis) lenis.scrollTo(0, { duration: 1.6, easing: (t) => 1 - Math.pow(1 - t, 4) });
    else (box || window).scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
  });

  /* ------------------------------------------------------------------
     Esquinas (Email / IG): se apartan cuando llega el footer, que ya tiene el contacto
     ------------------------------------------------------------------ */
  const ft = document.querySelector('.ft');
  if (ft && document.querySelector('.corners') && 'IntersectionObserver' in window) {
    new IntersectionObserver(([en]) => document.body.classList.toggle('is-ft', en.isIntersecting), { rootMargin: '0px 0px -48px 0px' })
      .observe(ft);
  }

  /* ------------------------------------------------------------------
     Copiar el email con un clic
     ------------------------------------------------------------------ */
  document.addEventListener('click', async (e) => {
    const b = e.target.closest('[data-copy]'); if (!b) return;
    e.preventDefault();
    const text = b.dataset.copy;
    try { await navigator.clipboard.writeText(text); }
    catch (err) {
      const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); } catch (er) { /* sin portapapeles */ }
      ta.remove();
    }
    const label = b.textContent;
    b.textContent = t.copied; b.classList.add('is-done');
    setTimeout(() => { b.textContent = label; b.classList.remove('is-done'); }, 1800);
  });

  /* ------------------------------------------------------------------
     Intro: el monograma se construye barra a barra (una vez por sesión)
     ------------------------------------------------------------------ */
  const intro = document.querySelector('.intro');
  if (intro) {
    let seen = false;
    try { seen = sessionStorage.getItem('mv-intro') === '1'; sessionStorage.setItem('mv-intro', '1'); } catch (e) { /* sin storage */ }
    if (seen || reduced) {
      intro.remove();
    } else {
      document.body.classList.add('is-intro');
      setTimeout(() => intro.classList.add('is-out'), 1350);
      setTimeout(() => { intro.remove(); document.body.classList.remove('is-intro'); emit(); }, 2200);
    }
  }

  /* ------------------------------------------------------------------
     Revelado al hacer scroll
     ------------------------------------------------------------------ */
  const reveals = document.querySelectorAll('[data-reveal]');
  if (reveals.length) {
    if (reduced || !('IntersectionObserver' in window)) {
      reveals.forEach((el) => el.classList.add('is-in'));
    } else {
      const io = new IntersectionObserver((entries) => entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      }), { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
      reveals.forEach((el) => io.observe(el));
    }
  }

  window.UI = {
    state,
    leave,
    markDir,
    lang: LANG,
    t,
    SMOOTH,
    scroller,
    onChange: (fn) => listeners.push(fn),
    closeNav: () => queue(closeNav),
    hidePanel: () => queue(hidePanel),
    morph
  };
})();
