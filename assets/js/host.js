/* Dominio único: si alguien entra por la dirección antigua de GitHub Pages y manelvila.com
   responde, se le lleva a la misma página en manelvila.com. Si el dominio no respondiera,
   no se hace nada y la web sigue funcionando en GitHub Pages. */
(function () {
  var h = location.hostname;
  if (!/\.github\.io$/.test(h)) return;
  var path = location.pathname.replace(/^\/PORTFOLIO-MANEL-VILA/i, '') || '/';
  var probe = new Image();
  probe.onload = function () { location.replace('https://manelvila.com' + path + location.search + location.hash); };
  probe.src = 'https://manelvila.com/favicon.ico?ping=' + Date.now();
})();
