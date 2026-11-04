// Píldora de navegación: en táctil se abre con un toque en el monograma.
(function () {
  const nav = document.querySelector('.nav');
  if (!nav) return;
  const mark = nav.querySelector('.nav__mark');
  const setOpen = (open) => {
    nav.classList.toggle('is-open', open);
    document.body.classList.toggle('is-nav-open', open);
    mark.setAttribute('aria-expanded', String(open));
  };
  mark.addEventListener('click', (e) => {
    e.preventDefault();
    setOpen(!nav.classList.contains('is-open'));
  });
  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target)) setOpen(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setOpen(false);
  });
})();
