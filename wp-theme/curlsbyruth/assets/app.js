/* CurlsbyRuth — kleine dingen die de shop levend maken.
   Overgenomen uit de demo: zoekbalk, mobiel menu, en secties die
   zachtjes inschuiven bij het scrollen.

   Bewust ingetogen gehouden: Ruth vroeg om rustig en elegant, en bij
   luxe zit de klasse in de terughoudendheid. */

(function () {
  'use strict';

  var rustig = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- zoekbalk open- en dichtklappen ---- */

  var zoekKnop = document.querySelector('[data-search-toggle]');
  var zoekBalk = document.querySelector('[data-search-bar]');

  if (zoekKnop && zoekBalk) {
    zoekKnop.addEventListener('click', function () {
      var open = zoekBalk.hidden;
      zoekBalk.hidden = !open;
      zoekKnop.setAttribute('aria-expanded', String(open));
      if (open) {
        var veld = zoekBalk.querySelector('input[type="search"]');
        if (veld) { veld.focus(); }
      }
    });
  }

  /* ---- mobiel menu ---- */

  var menuKnop = document.querySelector('.nav-toggle');
  var menu = document.querySelector('.nav');

  if (menuKnop && menu) {
    menuKnop.addEventListener('click', function () {
      var open = !menu.classList.contains('nav--open');
      menu.classList.toggle('nav--open', open);
      menuKnop.setAttribute('aria-expanded', String(open));
    });
  }

  /* ---- secties die inschuiven ----
     Alles staat standaard zichtbaar; de klasse wordt pas toegevoegd als
     JavaScript draait. Zo blijft de pagina leesbaar als er iets misgaat. */

  if (!rustig && 'IntersectionObserver' in window) {
    var doelen = document.querySelectorAll('.section, .card');

    doelen.forEach(function (el) { el.classList.add('reveal'); });

    var kijker = new IntersectionObserver(function (regels) {
      regels.forEach(function (regel) {
        if (regel.isIntersecting) {
          regel.target.classList.add('in');
          kijker.unobserve(regel.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });

    doelen.forEach(function (el) { kijker.observe(el); });
  }

  /* ---- winkelmandteller bijwerken na toevoegen ----
     WooCommerce stuurt dit signaal via jQuery, niet als gewone
     browsergebeurtenis. Daarom luisteren we met jQuery mee. */

  if (window.jQuery) {
    window.jQuery(document.body).on('added_to_cart', function () {
      var teller = document.querySelector('.cart-count');
      if (!teller) { return; }

      var huidig = parseInt(teller.textContent, 10) || 0;
      teller.textContent = String(huidig + 1);
      teller.style.display = '';
    });
  }

})();
