/*
 * UI compartida (home + about)
 * - Monograma MV que se transforma en X al abrir el menú (animación original, ahora interpolada)
 * - La "franja": píldora que se despliega en barra centrada con los enlaces escalonados
 * - Paneles de cristal (Proyectos / About / Contacto) que se abren y cierran en secuencia
 * - Intro de carga con el monograma
 */
(function () {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const listeners = [];
  const emit = () => listeners.forEach((fn) => fn(state));
  const state = { navOpen: false, panel: null };

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

  function showPanel(name) {
    const p = panels[name]; if (!p) return;
    p.hidden = false;
    requestAnimationFrame(() => requestAnimationFrame(() => p.classList.add('is-open')));
    franja.querySelectorAll('[data-panel]').forEach((b) => b.classList.toggle('is-active', b.dataset.panel === name));
    state.panel = name; emit();
  }
  async function hidePanel() {
    const name = state.panel; if (!name) return;
    const p = panels[name];
    p.classList.remove('is-open');
    franja.querySelectorAll('[data-panel]').forEach((b) => b.classList.remove('is-active'));
    state.panel = null; emit();
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
    markBtn.setAttribute('aria-label', 'Cerrar menú');
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
    markBtn.setAttribute('aria-label', 'Abrir menú');
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

  /* ------------------------------------------------------------------
     Lista de proyectos del panel + previsualización que sigue al cursor
     ------------------------------------------------------------------ */
  const list = document.querySelector('.plist');
  if (list && window.PROJECTS) {
    const isHome = document.body.classList.contains('home');
    const pad = (n) => String(n).padStart(2, '0');
    list.innerHTML = window.PROJECTS.map((p, i) => `
      <a class="plist__row" href="${isHome ? '#' + p.slug : 'index.html#' + p.slug}" data-index="${i}">
        <span class="plist__num">${pad(i + 1)}</span>
        <span class="plist__name">${p.name}</span>
        <span class="plist__tag">${p.tag}</span>
      </a>`).join('');

    const preview = document.createElement('div');
    preview.className = 'peek';
    preview.setAttribute('aria-hidden', 'true');
    preview.innerHTML = '<img alt="">';
    document.body.appendChild(preview);
    const pimg = preview.firstChild;
    let tx = 0, ty = 0, px = 0, py = 0, raf = 0, on = false;
    const thumb = (p) => (p.media ? (p.media.type === 'image' ? p.media.src : p.media.poster) : (p.gallery && p.gallery[0]));
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
      const src = thumb(window.PROJECTS[+row.dataset.index]);
      if (!src) { preview.classList.remove('is-on'); return; }
      if (pimg.getAttribute('src') !== encodeURI(src)) pimg.src = encodeURI(src);
      if (!on) { px = tx = e.clientX + 24; py = ty = e.clientY - 80; }
      on = true; preview.classList.add('is-on');
      if (!raf) raf = requestAnimationFrame(loop);
    });
    list.addEventListener('pointerleave', () => { on = false; preview.classList.remove('is-on'); });

    list.addEventListener('click', (e) => {
      const row = e.target.closest('.plist__row'); if (!row) return;
      if (isHome && window.HOME) {
        e.preventDefault();
        const i = +row.dataset.index;
        on = false; preview.classList.remove('is-on');
        queue(closeNav).then(() => window.HOME.goTo(i, { fromMenu: true }));
      }
    });
  }

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
     Revelado al hacer scroll (about)
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
    onChange: (fn) => listeners.push(fn),
    closeNav: () => queue(closeNav),
    hidePanel: () => queue(hidePanel),
    morph
  };
})();
