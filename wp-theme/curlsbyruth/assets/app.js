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
    /* Alleen verbergen wat nog onder de vouw staat. Wat al in beeld is mag
       nooit op onzichtbaar worden gezet — dan blijft het hangen als de
       waarnemer om wat voor reden dan ook niet afgaat. */
    var doelen = Array.prototype.filter.call(
      document.querySelectorAll('.section, .card'),
      function (el) { return el.getBoundingClientRect().top > window.innerHeight * 0.9; }
    );

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

/* ---------- merkenslider ----------
   Werkt op een echte horizontale scrollcontainer met scroll-snap. Daardoor
   werken vegen op de telefoon en het scrollwiel vanzelf, en schuift de dia
   die je kiest altijd netjes naar het midden.

   De dia's staan al in de pagina; dit script bedient ze alleen. Zonder
   JavaScript kun je er nog steeds doorheen scrollen. */

(function () {
  'use strict';

  var rustig = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var track = document.querySelector('[data-brand-track]');
  if (!track) { return; }

  var slides = Array.prototype.slice.call(track.querySelectorAll('.bslide'));
  if (slides.length < 2) { return; }

  var dotsBalk = document.querySelector('[data-brand-dots]');
  var balkje = document.querySelector('.brands__progress i');
  var DUUR = 4500;

  var huidig = 0;
  var timer = null;
  var dots = [];

  if (dotsBalk) {
    slides.forEach(function (slide, i) {
      var knop = document.createElement('button');
      knop.className = 'dot-btn' + (i === 0 ? ' active' : '');
      knop.setAttribute('aria-label', 'Ga naar ' + (slide.getAttribute('aria-label') || ('dia ' + (i + 1))));
      knop.addEventListener('click', function () { ga(i); });
      dotsBalk.appendChild(knop);
      dots.push(knop);
    });
  }

  /* zacht op gang komen en zacht uitlopen */
  function glijNaar(doel, duur) {
    var start = track.scrollLeft;
    var max = track.scrollWidth - track.clientWidth;
    var eind = Math.max(0, Math.min(doel, max));
    var verschil = eind - start;

    if (rustig || Math.abs(verschil) < 2) {
      track.scrollLeft = eind;
      return;
    }

    var soepel = function (t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    };

    track.classList.add('animating');
    var begin = performance.now();

    function stap(nu) {
      var t = Math.min((nu - begin) / duur, 1);
      track.scrollLeft = start + verschil * soepel(t);
      if (t < 1) {
        requestAnimationFrame(stap);
      } else {
        track.classList.remove('animating');
      }
    }
    requestAnimationFrame(stap);
  }

  function markeer(i) {
    huidig = i;
    slides.forEach(function (s, n) { s.classList.toggle('is-current', n === i); });
    dots.forEach(function (d, n) { d.classList.toggle('active', n === i); });
  }

  function schuifNaar(index, direct) {
    var i = (index + slides.length) % slides.length;
    var slide = slides[i];
    var doel = slide.offsetLeft - (track.clientWidth - slide.clientWidth) / 2;

    markeer(i);

    if (direct) {
      track.scrollLeft = Math.max(0, doel);
    } else {
      glijNaar(doel, 780);
    }
  }

  function herstartBalk() {
    if (!balkje || rustig) { return; }
    balkje.classList.remove('run');
    void balkje.offsetWidth;
    balkje.classList.add('run');
  }

  function start() {
    if (rustig) { return; }
    stop();
    herstartBalk();
    timer = setInterval(function () { schuifNaar(huidig + 1); }, DUUR);
  }

  function stop() {
    if (timer) { clearInterval(timer); }
    timer = null;
    if (balkje) { balkje.classList.remove('run'); }
  }

  /* Na een klik begint het tellen opnieuw, zodat hij niet meteen
     daarna alweer doorspringt. */
  function ga(i) {
    schuifNaar(i);
    start();
  }

  /* welke dia staat het dichtst bij het midden? */
  var scrollTimer = null;
  track.addEventListener('scroll', function () {
    if (scrollTimer) { clearTimeout(scrollTimer); }
    scrollTimer = setTimeout(function () {
      var midden = track.scrollLeft + track.clientWidth / 2;
      var dichtst = 0;
      var kleinste = Infinity;

      slides.forEach(function (s, i) {
        var afstand = Math.abs(s.offsetLeft + s.clientWidth / 2 - midden);
        if (afstand < kleinste) { kleinste = afstand; dichtst = i; }
      });

      var maxScroll = track.scrollWidth - track.clientWidth;
      if (track.scrollLeft <= 2) { dichtst = 0; }
      else if (track.scrollLeft >= maxScroll - 2) { dichtst = slides.length - 1; }

      if (dichtst !== huidig) { markeer(dichtst); }
    }, 90);
  }, { passive: true });

  var vorige = document.querySelector('[data-brand-prev]');
  var volgende = document.querySelector('[data-brand-next]');
  if (vorige) { vorige.addEventListener('click', function () { ga(huidig - 1); }); }
  if (volgende) { volgende.addEventListener('click', function () { ga(huidig + 1); }); }

  window.addEventListener('resize', function () { schuifNaar(huidig, true); });

  markeer(0);
  schuifNaar(0, true);
  start();
})();

/* ---------- nieuwsbrief ----------
   Nog niet gekoppeld aan een verzendlijst. Tot die er is zeggen we eerlijk
   dat de aanmelding genoteerd is en niet dat er iets verstuurd wordt. */

(function () {
  'use strict';

  var form = document.querySelector('[data-newsletter]');
  if (!form) { return; }

  var melding = document.querySelector('[data-newsletter-msg]');

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (melding) {
      melding.textContent = 'Dank je wel. Je hoort van ons zodra er iets te melden is.';
    }
    form.reset();
  });
})();

/* ---------- winkelmandlade ----------
   Schuift van rechts in zodra je iets toevoegt, zodat je ziet dat het gelukt
   is zonder de pagina kwijt te raken. Zonder JavaScript werkt de knop nog
   steeds: dan ga je gewoon naar de winkelmandpagina. */

(function () {
  'use strict';

  var lade = document.querySelector('[data-drawer]');
  var achtergrond = document.querySelector('[data-drawer-backdrop]');
  if (!lade || !achtergrond) { return; }

  var knop = document.querySelector('[data-cart-open]');
  var sluitKnop = lade.querySelector('[data-drawer-sluit]');
  var vorigeFocus = null;

  function open() {
    vorigeFocus = document.activeElement;
    achtergrond.hidden = false;
    /* even wachten zodat de browser de overgang oppakt */
    requestAnimationFrame(function () {
      achtergrond.classList.add('open');
      lade.classList.add('open');
    });
    lade.setAttribute('aria-hidden', 'false');
    if (knop) { knop.setAttribute('aria-expanded', 'true'); }
    document.body.style.overflow = 'hidden';
    if (sluitKnop) { sluitKnop.focus(); }
  }

  function sluit() {
    achtergrond.classList.remove('open');
    lade.classList.remove('open');
    lade.setAttribute('aria-hidden', 'true');
    if (knop) { knop.setAttribute('aria-expanded', 'false'); }
    document.body.style.overflow = '';

    /* pas verbergen als hij uit beeld geschoven is */
    setTimeout(function () {
      if (!lade.classList.contains('open')) { achtergrond.hidden = true; }
    }, 480);

    if (vorigeFocus && vorigeFocus.focus) { vorigeFocus.focus(); }
  }

  if (knop) {
    knop.addEventListener('click', function (e) {
      e.preventDefault();
      open();
    });
  }

  if (sluitKnop) { sluitKnop.addEventListener('click', sluit); }
  achtergrond.addEventListener('click', sluit);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && lade.classList.contains('open')) { sluit(); }
  });

  /* focus binnen de lade houden zolang hij open staat */
  lade.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab') { return; }

    var kan = lade.querySelectorAll('a[href], button:not([disabled]), input, select, textarea');
    if (!kan.length) { return; }

    var eerste = kan[0];
    var laatste = kan[kan.length - 1];

    if (e.shiftKey && document.activeElement === eerste) {
      e.preventDefault();
      laatste.focus();
    } else if (!e.shiftKey && document.activeElement === laatste) {
      e.preventDefault();
      eerste.focus();
    }
  });

  /* WooCommerce meldt via jQuery dat er iets is toegevoegd */
  if (window.jQuery) {
    window.jQuery(document.body).on('added_to_cart', function () { open(); });
  }
})();
