/*
 * Ficha «Empezar un proyecto» (/start/, /es/empezar/)
 * La web no guarda ni envía nada: la ficha se escribe sola en el correo o en el WhatsApp de quien la
 * rellena, que solo tiene que darle a enviar. Si su aparato no abre nada, puede copiarla.
 *  · ?s=<servicio> marca el servicio (desde una página de servicio o «¿Un proyecto como…?»)
 *  · ?from=<proyecto> anota el proyecto que estaba viendo
 *  · la página por la que llegó a la web (Instagram, Google…) la apunta ui.js al entrar
 */
(function () {
  const form = document.querySelector('.brief__form');
  if (!form) return;
  const I = JSON.parse(document.getElementById('brief-i18n').textContent);
  const q = new URLSearchParams(location.search);
  const $ = (n) => form.elements[n];

  // Servicio ya marcado
  const s = q.get('s');
  if (s) form.querySelectorAll('input[name="need"]').forEach((i) => { if (i.dataset.key === s) i.checked = true; });

  // Proyecto de origen y por dónde llegó a la web
  const from = I.projects[q.get('from')] || '';
  let src = '';
  try {
    const o = JSON.parse(sessionStorage.getItem('mv-src') || '{}');
    src = o.r || '';
  } catch (e) { /* sin storage */ }
  const NAMES = [[/instagram/, 'Instagram'], [/(^|\.)google\./, 'Google'], [/bing\./, 'Bing'], [/chatgpt|openai/, 'ChatGPT'], [/perplexity/, 'Perplexity'],
    [/claude\.ai/, 'Claude'], [/linkedin|lnkd/, 'LinkedIn'], [/behance/, 'Behance'], [/facebook|fb\./, 'Facebook'], [/(^|\.)t\.co$|twitter|x\.com/, 'X'],
    [/duckduckgo/, 'DuckDuckGo'], [/^ig$/, 'Instagram'], [/whatsapp|wa\.me/, 'WhatsApp']];
  const named = (r) => { const hit = NAMES.find(([re]) => re.test(r)); return hit ? hit[1] : r; };
  if (src) src = named(src.toLowerCase());
  $('from').value = from;
  $('src').value = src;

  // El cuadro de texto crece con lo que se escribe
  const ta = $('about');
  const grow = () => { ta.style.height = 'auto'; ta.style.height = ta.scrollHeight + 2 + 'px'; };
  ta.addEventListener('input', grow);

  /** La ficha como mensaje, en el idioma de la página */
  function compose() {
    const f = new FormData(form);
    const val = (n) => String(f.get(n) || '').trim();
    const line = (k, v) => (v ? `${k}: ${v}` : '');
    const name = val('name'), brand = val('brand');
    const subject = I.subject + (brand || name ? ` — ${brand || name}` : '');
    const body = [
      [line(I.need, f.getAll('need').join(', ')), line(I.stage, val('stage')), line(I.when, val('when')), line(I.budget, val('budget'))].filter(Boolean).join('\n'),
      val('about'),
      [name + (brand ? ` · ${brand}` : ''), [val('email'), val('phone')].filter(Boolean).join(' · ')].filter(Boolean).join('\n'),
      [line(I.from, from), line(I.src, src), `${I.via}: ${I.page}`].filter(Boolean).join('\n')
    ].filter(Boolean).join('\n\n');
    return { subject, body };
  }

  const done = form.querySelector('.brief__done');
  function sent(via, m) {
    done.hidden = false;
    done.querySelector('.brief__done-msg').textContent = I.done[via];
    done.querySelector('[data-copy]').dataset.copy = `${m.subject}\n\n${m.body}`;
    requestAnimationFrame(() => done.scrollIntoView({ block: 'nearest', behavior: 'smooth' }));
  }

  // Por correo: el nombre y el email son obligatorios
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const m = compose();
    location.href = `mailto:${form.dataset.email}?subject=${encodeURIComponent(m.subject)}&body=${encodeURIComponent(m.body)}`;
    sent('email', m);
  });

  // Por WhatsApp: basta con el nombre (el teléfono ya lo da WhatsApp)
  const wa = form.querySelector('[data-via="wa"]');
  if (wa) wa.addEventListener('click', () => {
    const n = $('name');
    if (!n.value.trim()) { n.reportValidity(); n.focus(); return; }
    const m = compose();
    const url = `https://wa.me/${form.dataset.wa}?text=${encodeURIComponent(`*${m.subject}*\n\n${m.body}`)}`;
    const w = window.open(url, '_blank');
    if (w) w.opener = null; else location.href = url;
    sent('wa', m);
  });
})();
