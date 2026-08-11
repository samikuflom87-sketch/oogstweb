/* CurlsbyRuth — demo
   Dit is een visuele demo. De winkelmand draait op localStorage; er worden geen
   echte bestellingen geplaatst en er vindt geen betaling plaats.
   Backend, betalingen en voorraadadministratie volgen in een latere fase.
*/

const CART_KEY = 'cbr_cart';
const PROMO_KEY = 'cbr_promo';

const PROMOS = {
  CURLS10: { korting: 0.10, label: '10% korting' },
  WELKOM5: { korting: 0.05, label: '5% welkomstkorting' }
};

const euro = n => '€ ' + n.toFixed(2).replace('.', ',');
const byId = id => PRODUCTS.find(p => p.id === id);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* ---------- winkelmand ---------- */

function getCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
  catch { return []; }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCount();
}

function addToCart(id, aantal = 1) {
  const product = byId(id);
  if (!product || product.voorraad === 0) return false;

  const cart = getCart();
  const regel = cart.find(r => r.id === id);
  const huidig = regel ? regel.aantal : 0;
  const nieuw = Math.min(huidig + aantal, product.voorraad);

  if (nieuw === huidig) return false;
  if (regel) regel.aantal = nieuw;
  else cart.push({ id, aantal: nieuw });

  saveCart(cart);
  document.dispatchEvent(new CustomEvent('cbr:added'));
  return true;
}

function setQty(id, aantal) {
  const product = byId(id);
  let cart = getCart();
  if (aantal <= 0) {
    cart = cart.filter(r => r.id !== id);
  } else {
    const regel = cart.find(r => r.id === id);
    if (regel) regel.aantal = Math.min(aantal, product ? product.voorraad : aantal);
  }
  saveCart(cart);
}

const cartCount = () => getCart().reduce((s, r) => s + r.aantal, 0);

const cartSubtotal = () => getCart().reduce((s, r) => {
  const p = byId(r.id);
  return p ? s + p.prijs * r.aantal : s;
}, 0);

function activePromo() {
  const code = localStorage.getItem(PROMO_KEY);
  return code && PROMOS[code] ? { code, ...PROMOS[code] } : null;
}

function totals() {
  const subtotaal = cartSubtotal();
  const promo = activePromo();
  const korting = promo ? subtotaal * promo.korting : 0;
  const naKorting = subtotaal - korting;
  const verzending = naKorting >= FREE_SHIPPING_FROM || naKorting === 0 ? 0 : SHIPPING_COST;
  return { subtotaal, promo, korting, naKorting, verzending, totaal: naKorting + verzending };
}

function updateCartCount() {
  const n = cartCount();
  document.querySelectorAll('.cart-count').forEach(el => {
    el.textContent = n;
    el.style.display = n > 0 ? 'inline-flex' : 'none';
  });
}

/* ---------- gedeelde bouwstenen ---------- */

/* Tijdelijke productafbeelding in de huisstijl.
   Zodra product.images gevuld is, tonen we de echte foto. */
function tileMarkup(product, klasse = '', index = 0) {
  const info = categorieInfo(product.categorie);
  const foto = product.images && product.images[index];

  if (foto) {
    return `<img class="${klasse}" src="${esc(foto)}" alt="${esc(product.merk + ' ' + product.naam)}" loading="lazy">`;
  }
  return `<div class="tile ${klasse}" style="background:${info.zacht}">
      <span class="tile__initial" style="color:${info.kleur}">${esc(product.merk.charAt(0))}</span>
      <span class="tile__note">Foto volgt</span>
    </div>`;
}

function stockMarkup(v) {
  if (v === 0) return '<span class="stock-out"><span class="dot" style="background:currentColor"></span>Uitverkocht</span>';
  if (v <= 3) return `<span class="stock-low"><span class="dot" style="background:currentColor"></span>Nog ${v} op voorraad</span>`;
  return '<span class="stock-ok"><span class="dot" style="background:currentColor"></span>Op voorraad</span>';
}

function cardMarkup(product) {
  const info = categorieInfo(product.categorie);
  const uit = product.voorraad === 0;

  const badge = uit
    ? '<span class="badge badge--soldout">Uitverkocht</span>'
    : (product.voorraad <= 3 ? `<span class="badge" style="background:${info.kleur}">Bijna weg</span>` : '');

  return `<article class="card">
      <div class="card__top">
        <a class="card__media" href="product.html?id=${product.id}" aria-label="${esc(product.naam)}">
          ${badge}
          ${tileMarkup(product)}
        </a>
        <button class="btn card__add" data-add="${product.id}" ${uit ? 'disabled' : ''}>
          ${uit ? 'Uitverkocht' : 'In winkelmand'}
        </button>
      </div>
      <a class="card__body" href="product.html?id=${product.id}">
        <span class="card__brand">${esc(product.merk)}</span>
        <h3 class="card__name">${esc(product.naam)}</h3>
        <span class="card__size">${esc([product.categorie, product.inhoud].filter(Boolean).join(' · '))}</span>
        <span class="card__price">${euro(product.prijs)}</span>
      </a>
    </article>`;
}

/* De 'in winkelmand'-knop werkt overal waar een kaart staat. */
function bindAddButtons(root = document) {
  root.querySelectorAll('[data-add]').forEach(knop => {
    if (knop.dataset.bound) return;
    knop.dataset.bound = '1';
    knop.addEventListener('click', e => {
      e.preventDefault();
      const gelukt = addToCart(knop.dataset.add, 1);
      const origineel = knop.textContent;
      knop.textContent = gelukt ? 'Toegevoegd' : 'Max. bereikt';
      setTimeout(() => { knop.textContent = origineel; }, 1600);
    });
  });
}

/* ---------- header ---------- */

function initHeader() {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  const header = document.querySelector('.header');
  if (header) {
    let ticking = false;
    const update = () => { header.classList.toggle('stuck', window.scrollY > 30); ticking = false; };
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }, { passive: true });
    update();
  }

  initSearch();
  updateCartCount();
}

function initSearch() {
  const paneel = document.querySelector('.search');
  const knop = document.querySelector('[data-search-toggle]');
  if (!paneel || !knop) return;

  const input = paneel.querySelector('input');
  const uitvoer = paneel.querySelector('.search__results');

  knop.addEventListener('click', () => {
    const open = paneel.classList.toggle('open');
    knop.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) input.focus();
  });

  input.addEventListener('input', () => {
    const term = input.value.trim().toLowerCase();
    if (term.length < 2) { uitvoer.innerHTML = ''; return; }

    const treffers = PRODUCTS.filter(p =>
      (p.naam + ' ' + p.merk + ' ' + p.categorie).toLowerCase().includes(term)
    ).slice(0, 5);

    uitvoer.innerHTML = treffers.length
      ? treffers.map(p => `<a class="search__hit" href="product.html?id=${p.id}">
            <div style="position:relative;aspect-ratio:1">${tileMarkup(p)}</div>
            <div>
              <div style="font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted)">${esc(p.merk)}</div>
              <div style="font-family:var(--serif);font-size:16px">${esc(p.naam)}</div>
            </div>
            <span style="font-weight:700;color:var(--coral)">${euro(p.prijs)}</span>
          </a>`).join('')
      : '<p style="padding:16px 0;color:var(--muted)">Geen producten gevonden.</p>';
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && paneel.classList.contains('open')) {
      paneel.classList.remove('open');
      knop.setAttribute('aria-expanded', 'false');
    }
  });
}

/* ---------- vloeiend horizontaal schuiven ---------- */

/* De browser-eigen 'scroll-behavior: smooth' is kort en vlak. Deze versie
   duurt langer en remt geleidelijk af, wat rustiger aanvoelt. Tijdens de
   animatie zetten we scroll-snap uit, anders werkt dat ertegenin. */
function glijNaar(el, doel, duur = 720, klaar) {
  const start = el.scrollLeft;
  const max = el.scrollWidth - el.clientWidth;
  const eind = Math.max(0, Math.min(doel, max));
  const verschil = eind - start;

  if (REDUCED || Math.abs(verschil) < 2) {
    el.scrollLeft = eind;
    if (klaar) klaar();
    return;
  }

  // zacht op gang komen en zacht uitlopen
  const soepel = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  el.classList.add('animating');
  const begin = performance.now();

  function stap(nu) {
    const t = Math.min((nu - begin) / duur, 1);
    el.scrollLeft = start + verschil * soepel(t);
    if (t < 1) {
      requestAnimationFrame(stap);
    } else {
      el.classList.remove('animating');
      if (klaar) klaar();
    }
  }
  requestAnimationFrame(stap);
}

/* ---------- merkenslider ---------- */

/* Werkt met een echte horizontale scrollcontainer plus scroll-snap.
   Voordeel: vegen op mobiel en het scrollwiel werken vanzelf, en de
   dia die je kiest schuift altijd netjes op zijn plek. */
function initBrandSlider() {
  const track = document.getElementById('brandTrack');
  if (!track) return;

  const dotsBalk = document.getElementById('brandDots');
  const balkje = document.querySelector('.brands__progress i');
  const DUUR = 6000;

  track.innerHTML = MERKEN.map(merk => {
    const aantal = PRODUCTS.filter(p => p.merk === merk.naam).length;
    return `<article class="bslide" style="background:${merk.zacht}"
                     role="group" aria-roledescription="dia" aria-label="${esc(merk.naam)}">
        <div class="bslide__inner">
          <div class="bslide__copy">
            <span class="bslide__label">Onze merken</span>
            <h2 class="bslide__name">${esc(merk.naam)}</h2>
            <p class="bslide__meta">${aantal} ${aantal === 1 ? 'product' : 'producten'} in het assortiment</p>
            <a class="btn" href="shop.html?merk=${encodeURIComponent(merk.naam)}">Bekijk ${esc(merk.naam)}</a>
          </div>
          <div class="bslide__visual">
            <span class="bslide__mark" style="color:${merk.kleur}">${esc(merk.naam.charAt(0))}</span>
            <span class="bslide__note">Merkfoto volgt</span>
          </div>
        </div>
      </article>`;
  }).join('');

  if (dotsBalk) {
    dotsBalk.innerHTML = MERKEN.map((m, i) =>
      `<button class="dot-btn${i === 0 ? ' active' : ''}" data-slide="${i}"
               aria-label="Ga naar ${esc(m.naam)}"></button>`).join('');
  }

  const slides = [...track.querySelectorAll('.bslide')];
  const dots = dotsBalk ? [...dotsBalk.querySelectorAll('.dot-btn')] : [];
  let huidig = 0;
  let timer = null;

  /* de dia in het midden van de container is de actieve */
  function schuifNaar(index, direct = false) {
    const i = (index + slides.length) % slides.length;
    const slide = slides[i];
    const doel = slide.offsetLeft - (track.clientWidth - slide.clientWidth) / 2;
    /* meteen markeren, zodat de dia al oplicht terwijl hij naar voren schuift */
    markeer(i);
    if (direct) {
      track.scrollLeft = Math.max(0, doel);
    } else {
      glijNaar(track, doel, 780);
    }
  }

  function markeer(i) {
    huidig = i;
    slides.forEach((s, n) => s.classList.toggle('is-current', n === i));
    dots.forEach((d, n) => d.classList.toggle('active', n === i));
  }

  /* balkje opnieuw laten lopen: klasse verwijderen, reflow, weer toevoegen */
  function herstartBalk() {
    if (!balkje || REDUCED) return;
    balkje.classList.remove('run');
    void balkje.offsetWidth;
    balkje.classList.add('run');
  }

  function start() {
    if (REDUCED) return;
    stop();
    herstartBalk();
    timer = setInterval(() => schuifNaar(huidig + 1), DUUR);
  }

  function stop() {
    if (timer) clearInterval(timer);
    timer = null;
    if (balkje) balkje.classList.remove('run');
  }

  const ga = i => { schuifNaar(i); start(); };

  /* welke dia staat het dichtst bij het midden? */
  let scrollTimer = null;
  track.addEventListener('scroll', () => {
    if (scrollTimer) clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => {
      const midden = track.scrollLeft + track.clientWidth / 2;
      let dichtst = 0;
      let kleinste = Infinity;
      slides.forEach((s, i) => {
        const afstand = Math.abs(s.offsetLeft + s.clientWidth / 2 - midden);
        if (afstand < kleinste) { kleinste = afstand; dichtst = i; }
      });

      /* helemaal links of rechts hoort altijd bij de eerste of laatste dia,
         ook als die net niet volledig gecentreerd kan staan */
      const maxScroll = track.scrollWidth - track.clientWidth;
      if (track.scrollLeft <= 2) dichtst = 0;
      else if (track.scrollLeft >= maxScroll - 2) dichtst = slides.length - 1;

      if (dichtst !== huidig) markeer(dichtst);
    }, 90);
  }, { passive: true });

  dots.forEach(d => d.addEventListener('click', () => ga(Number(d.dataset.slide))));

  const vorige = document.getElementById('brandPrev');
  const volgende = document.getElementById('brandNext');
  if (vorige) vorige.addEventListener('click', () => ga(huidig - 1));
  if (volgende) volgende.addEventListener('click', () => ga(huidig + 1));

  const blok = document.querySelector('.brands');
  blok.addEventListener('mouseenter', stop);
  blok.addEventListener('mouseleave', start);
  blok.addEventListener('focusin', stop);
  /* tijdens het vegen niet doorspringen */
  blok.addEventListener('touchstart', stop, { passive: true });
  blok.addEventListener('touchend', () => setTimeout(start, 2500), { passive: true });

  /* bij het wisselen van schermbreedte klopt de positie niet meer */
  window.addEventListener('resize', () => schuifNaar(huidig, true));

  markeer(0);
  schuifNaar(0, true);
  start();
}

/* ---------- homepage ---------- */

function initHome() {
  const grid = document.getElementById('homeGrid');
  if (grid) {
    grid.innerHTML = PRODUCTS.map(cardMarkup).join('');
    bindAddButtons(grid);
  }

  const rail = document.getElementById('catRail');
  if (!rail) return;

  const gebruikt = CATEGORIEEN.filter(c => PRODUCTS.some(p => p.categorie === c.naam));
  rail.innerHTML = gebruikt.map(c => {
    const aantal = PRODUCTS.filter(p => p.categorie === c.naam).length;
    return `<a class="cat" href="shop.html?cat=${encodeURIComponent(c.naam)}" style="background:${c.zacht}">
        <span class="cat__shape" style="background:${c.kleur}"></span>
        <span class="cat__name">${esc(c.naam)}</span>
        <span class="cat__count">${aantal} ${aantal === 1 ? 'product' : 'producten'}</span>
      </a>`;
  }).join('');

  /* Lichtere variant van de merkenslider: geen automatische wissel,
     je schuift er zelf door met de pijlen of door te vegen. */
  const vorige = document.getElementById('catPrev');
  const volgende = document.getElementById('catNext');
  const kaarten = [...rail.querySelectorAll('.cat')];
  if (!vorige || !volgende || kaarten.length === 0) return;

  /* één kaart plus de tussenruimte */
  function stapBreedte() {
    if (kaarten.length < 2) return kaarten[0].clientWidth;
    return kaarten[1].offsetLeft - kaarten[0].offsetLeft;
  }

  function werkPijlenBij() {
    const max = rail.scrollWidth - rail.clientWidth;
    vorige.disabled = rail.scrollLeft <= 2;
    volgende.disabled = rail.scrollLeft >= max - 2;
  }

  /* twee kaarten per klik voelt natuurlijker dan één */
  vorige.addEventListener('click', () => glijNaar(rail, rail.scrollLeft - stapBreedte() * 2, 640, werkPijlenBij));
  volgende.addEventListener('click', () => glijNaar(rail, rail.scrollLeft + stapBreedte() * 2, 640, werkPijlenBij));

  let t = null;
  rail.addEventListener('scroll', () => {
    if (t) clearTimeout(t);
    t = setTimeout(werkPijlenBij, 90);
  }, { passive: true });

  window.addEventListener('resize', werkPijlenBij);
  werkPijlenBij();
}

/* ---------- shop ---------- */

function initShop() {
  const grid = document.getElementById('shopGrid');
  if (!grid) return;

  const chipBalk = document.getElementById('shopChips');
  const sorteer = document.getElementById('shopSort');
  const teller = document.getElementById('shopCount');

  const beschikbaar = CATEGORIEEN.filter(c => PRODUCTS.some(p => p.categorie === c.naam));
  const params = new URLSearchParams(location.search);
  const merkFilter = params.get('merk') || '';
  let actief = params.get('cat') || '';

  /* Kom je binnen via de merkenslider, dan tonen we alleen dat merk. */
  const basis = merkFilter ? PRODUCTS.filter(p => p.merk === merkFilter) : PRODUCTS;

  const merkLabel = document.getElementById('shopMerk');
  if (merkLabel && merkFilter) {
    merkLabel.innerHTML = `<span>Merk: <strong>${esc(merkFilter)}</strong></span>
      <a class="link-arrow" href="shop.html">Toon alle merken</a>`;
    merkLabel.style.display = 'flex';
  }

  if (chipBalk) {
    const zichtbaar = beschikbaar.filter(c => basis.some(p => p.categorie === c.naam));
    chipBalk.innerHTML = [{ naam: 'Alles', waarde: '' }]
      .concat(zichtbaar.map(c => ({ naam: c.naam, waarde: c.naam })))
      .map(c => `<button class="chip" data-cat="${esc(c.waarde)}">${esc(c.naam)}</button>`).join('');

    chipBalk.addEventListener('click', e => {
      const knop = e.target.closest('.chip');
      if (!knop) return;
      actief = knop.dataset.cat;
      render();
    });
  }

  if (sorteer) sorteer.addEventListener('change', render);

  function render() {
    let lijst = actief ? basis.filter(p => p.categorie === actief) : basis.slice();

    switch (sorteer ? sorteer.value : 'aanbevolen') {
      case 'prijs-op':   lijst.sort((a, b) => a.prijs - b.prijs); break;
      case 'prijs-af':   lijst.sort((a, b) => b.prijs - a.prijs); break;
      case 'naam':       lijst.sort((a, b) => a.naam.localeCompare(b.naam, 'nl')); break;
      default:           lijst.sort((a, b) => (b.featured === true) - (a.featured === true));
    }

    grid.innerHTML = lijst.map(cardMarkup).join('');
    bindAddButtons(grid);
    if (teller) teller.textContent = `${lijst.length} ${lijst.length === 1 ? 'product' : 'producten'}`;

    if (chipBalk) {
      chipBalk.querySelectorAll('.chip').forEach(c =>
        c.classList.toggle('active', c.dataset.cat === actief));
    }
    initReveals(grid);
  }

  render();
}

/* ---------- productpagina ---------- */

function initProduct() {
  const root = document.getElementById('productRoot');
  if (!root) return;

  const id = new URLSearchParams(location.search).get('id');
  const product = byId(id);

  if (!product) {
    root.innerHTML = `<div class="empty">
        <h2 class="serif">Dit product bestaat niet</h2>
        <p>Misschien is het van naam veranderd of uit het assortiment gehaald.</p>
        <a class="btn" href="shop.html">Terug naar de shop</a>
      </div>`;
    return;
  }

  document.title = `${product.naam} — CurlsbyRuth`;
  const uit = product.voorraad === 0;
  const aantalFotos = Math.max(product.images.length, 4);

  root.innerHTML = `
    <div class="pd">
      <div class="pd__gallery">
        <div class="pd__main" id="pdMain">${tileMarkup(product, '', 0)}</div>
        <div class="pd__thumbs" id="pdThumbs">
          ${Array.from({ length: aantalFotos }, (_, i) =>
            `<button class="pd__thumb ${i === 0 ? 'active' : ''}" data-index="${i}" aria-label="Afbeelding ${i + 1}">
              ${tileMarkup(product, '', i)}
            </button>`).join('')}
        </div>
      </div>

      <div class="pd__info">
        <span class="pd__brand">${esc(product.merk)}</span>
        <h1>${esc(product.naam)}</h1>
        <span class="pd__size">${esc([product.categorie, product.inhoud].filter(Boolean).join(' · '))}</span>

        <div class="pd__price">${euro(product.prijs)}</div>
        <div class="pd__stock">${stockMarkup(product.voorraad)}</div>

        <div class="pd__buy">
          <div class="qty">
            <button type="button" data-step="-1" aria-label="Eén minder">−</button>
            <input type="number" id="pdQty" value="1" min="1" max="${Math.max(product.voorraad, 1)}" aria-label="Aantal">
            <button type="button" data-step="1" aria-label="Eén meer">+</button>
          </div>
          <button class="btn" id="pdAdd" ${uit ? 'disabled' : ''}>
            ${uit ? 'Uitverkocht' : 'Toevoegen aan winkelmand'}
          </button>
        </div>

        <div class="acc">
          ${accItem('Omschrijving', '<div class="todo">De productomschrijving wordt nog aangeleverd door Ruth.</div>', true)}
          ${accItem('Ingrediënten', `<div class="todo">
              De volledige ingrediëntenlijst wordt letterlijk overgenomen van de verpakking.
              Deze mag niet geschat worden — allergeneninformatie moet exact kloppen.
            </div>`)}
          ${accItem('Gebruiksaanwijzing', '<div class="todo">De gebruiksaanwijzing wordt nog aangeleverd door Ruth.</div>')}
          ${accItem('Verzending', `Verzending met PostNL vanuit Nederland. Verzendkosten ${euro(SHIPPING_COST)},
              gratis vanaf ${euro(FREE_SHIPPING_FROM)}. Elke bestelling wordt met de hand ingepakt.`)}
          ${accItem('Reviews', `<div class="todo">
              Hier komen echte klantbeoordelingen zodra CurlsbyRuth die heeft.
              Verzonnen reviews plaatsen we niet.
            </div>`)}
        </div>

        <p style="font-size:13px;color:var(--muted);margin-top:22px">Artikelnummer ${esc(product.ean)}</p>
      </div>
    </div>`;

  /* galerij */
  const hoofd = root.querySelector('#pdMain');
  root.querySelectorAll('.pd__thumb').forEach(thumb => {
    thumb.addEventListener('click', () => {
      root.querySelectorAll('.pd__thumb').forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
      hoofd.innerHTML = tileMarkup(product, '', Number(thumb.dataset.index));
    });
  });

  /* aantal */
  const qty = root.querySelector('#pdQty');
  root.querySelectorAll('.qty button').forEach(knop => {
    knop.addEventListener('click', () => {
      const nieuw = Number(qty.value) + Number(knop.dataset.step);
      qty.value = Math.min(Math.max(nieuw, 1), Math.max(product.voorraad, 1));
    });
  });

  /* uitklappers */
  root.querySelectorAll('.acc__btn').forEach(knop => {
    knop.addEventListener('click', () => {
      const item = knop.closest('.acc__item');
      const open = item.classList.toggle('open');
      knop.querySelector('.acc__sign').textContent = open ? '−' : '+';
      knop.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });

  const addKnop = root.querySelector('#pdAdd');
  if (addKnop && !uit) {
    addKnop.addEventListener('click', () => {
      const gelukt = addToCart(product.id, Number(qty.value));
      addKnop.textContent = gelukt ? 'Toegevoegd' : 'Max. voorraad bereikt';
      setTimeout(() => { addKnop.textContent = 'Toevoegen aan winkelmand'; }, 1800);
    });
  }

  /* vergelijkbare producten */
  const rel = document.getElementById('relatedGrid');
  if (rel) {
    let lijst = PRODUCTS.filter(p => p.id !== product.id && p.categorie === product.categorie);
    if (lijst.length < 4) {
      lijst = lijst.concat(PRODUCTS.filter(p => p.id !== product.id && p.categorie !== product.categorie));
    }
    rel.innerHTML = lijst.slice(0, 4).map(cardMarkup).join('');
    bindAddButtons(rel);
  }
}

function accItem(titel, inhoud, open = false) {
  return `<div class="acc__item ${open ? 'open' : ''}">
      <button class="acc__btn" type="button" aria-expanded="${open}">
        <span>${titel}</span><span class="acc__sign">${open ? '−' : '+'}</span>
      </button>
      <div class="acc__panel">${inhoud}</div>
    </div>`;
}

/* ---------- winkelmandlade ---------- */

function initDrawer() {
  if (document.querySelector('.drawer')) return;

  const backdrop = document.createElement('div');
  backdrop.className = 'drawer-backdrop';

  const drawer = document.createElement('aside');
  drawer.className = 'drawer';
  drawer.setAttribute('aria-hidden', 'true');
  drawer.setAttribute('aria-label', 'Winkelmand');
  drawer.innerHTML = `
    <div class="drawer__head">
      <h3 class="serif">Winkelmand</h3>
      <button class="icon-btn" data-drawer-close aria-label="Winkelmand sluiten">
        <svg width="22" height="22" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.6" fill="none"><path d="M6 6l12 12M18 6L6 18"/></svg>
      </button>
    </div>
    <div class="drawer__body"></div>
    <div class="drawer__foot"></div>`;

  document.body.append(backdrop, drawer);

  const body = drawer.querySelector('.drawer__body');
  const foot = drawer.querySelector('.drawer__foot');

  function render() {
    const cart = getCart();

    if (cart.length === 0) {
      body.innerHTML = `<div class="empty" style="padding:60px 0">
          <h3 class="serif" style="font-size:22px">Je mandje is nog leeg</h3>
          <p>Ontdek de producten voor jouw krullen.</p>
        </div>`;
      foot.innerHTML = `<a class="btn btn--full" href="shop.html">Naar de shop</a>`;
      return;
    }

    body.innerHTML = cart.map((r, i) => {
      const p = byId(r.id);
      if (!p) return '';
      return `<div class="drawer-row" style="animation-delay:${i * 55}ms">
          <div class="drawer-row__media">${tileMarkup(p)}</div>
          <div>
            <div class="card__brand">${esc(p.merk)}</div>
            <div class="drawer-row__name">${esc(p.naam)}</div>
            <div class="qty" style="margin-top:8px;transform:scale(.82);transform-origin:left">
              <button type="button" data-dec="${p.id}" aria-label="Eén minder">−</button>
              <input type="number" value="${r.aantal}" min="1" max="${p.voorraad}" data-qty="${p.id}" aria-label="Aantal">
              <button type="button" data-inc="${p.id}" aria-label="Eén meer">+</button>
            </div>
            <button class="mini-remove" data-remove="${p.id}">Verwijderen</button>
          </div>
          <div style="font-weight:700">${euro(p.prijs * r.aantal)}</div>
        </div>`;
    }).join('');

    const t = totals();
    const pct = Math.min(100, (t.naKorting / FREE_SHIPPING_FROM) * 100);

    foot.innerHTML = `
      ${t.naKorting < FREE_SHIPPING_FROM ? `
        <p style="font-size:14px;color:var(--muted)">
          Nog <strong style="color:var(--text)">${euro(FREE_SHIPPING_FROM - t.naKorting)}</strong> tot gratis verzending
        </p>
        <div class="ship-bar"><div class="ship-bar__fill" style="width:${pct}%"></div></div>`
        : `<p style="font-size:14px;color:#3E8B6E;font-weight:500;margin-bottom:10px">Je hebt gratis verzending</p>`}
      <div class="sum-row"><span>Subtotaal</span><span>${euro(t.subtotaal)}</span></div>
      ${t.promo ? `<div class="sum-row"><span>Korting (${t.promo.code})</span><span>− ${euro(t.korting)}</span></div>` : ''}
      <a class="btn btn--full" href="winkelmand.html" style="margin-top:14px">Naar afrekenen</a>`;

    body.querySelectorAll('[data-remove]').forEach(k =>
      k.addEventListener('click', () => { setQty(k.dataset.remove, 0); render(); }));
    body.querySelectorAll('[data-inc]').forEach(k =>
      k.addEventListener('click', () => { setQty(k.dataset.inc, getCart().find(r => r.id === k.dataset.inc).aantal + 1); render(); }));
    body.querySelectorAll('[data-dec]').forEach(k =>
      k.addEventListener('click', () => { setQty(k.dataset.dec, getCart().find(r => r.id === k.dataset.dec).aantal - 1); render(); }));
    body.querySelectorAll('[data-qty]').forEach(inp =>
      inp.addEventListener('change', () => { setQty(inp.dataset.qty, Number(inp.value)); render(); }));
  }

  function open() {
    render();
    backdrop.classList.add('open');
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    backdrop.classList.remove('open');
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  backdrop.addEventListener('click', close);
  drawer.querySelector('[data-drawer-close]').addEventListener('click', close);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

  document.querySelectorAll('[data-cart-open]').forEach(k =>
    k.addEventListener('click', e => { e.preventDefault(); open(); }));

  document.addEventListener('cbr:added', () => {
    const teller = document.querySelector('.cart-count');
    if (teller) {
      teller.classList.add('pop');
      setTimeout(() => teller.classList.remove('pop'), 350);
    }
    open();
  });
}

/* ---------- winkelmandpagina ---------- */

function initCartPage() {
  const root = document.getElementById('cartRoot');
  if (!root) return;

  function render() {
    const cart = getCart();

    if (cart.length === 0) {
      root.innerHTML = `<div class="empty">
          <h2 class="serif">Je winkelmand is leeg</h2>
          <p>Ontdek de verzorgingsproducten voor jouw krullen.</p>
          <a class="btn" href="shop.html">Naar de shop</a>
        </div>`;
      return;
    }

    const t = totals();

    root.innerHTML = `
      <div class="cart-layout">
        <div>
          ${cart.map(r => {
            const p = byId(r.id);
            if (!p) return '';
            return `<div class="cart-row">
                <div class="cart-row__media">${tileMarkup(p)}</div>
                <div>
                  <div class="card__brand">${esc(p.merk)}</div>
                  <h3 class="serif" style="font-size:20px;margin:4px 0">${esc(p.naam)}</h3>
                  <div style="font-size:14px;color:var(--muted)">${euro(p.prijs)} per stuk</div>
                  <button class="mini-remove" data-remove="${p.id}">Verwijderen</button>
                </div>
                <div class="cart-row__right" style="text-align:right">
                  <div class="qty" style="margin-left:auto">
                    <button type="button" data-dec="${p.id}" aria-label="Eén minder">−</button>
                    <input type="number" value="${r.aantal}" min="1" max="${p.voorraad}" data-qty="${p.id}" aria-label="Aantal">
                    <button type="button" data-inc="${p.id}" aria-label="Eén meer">+</button>
                  </div>
                  <div style="margin-top:12px;font-weight:700;font-size:17px">${euro(p.prijs * r.aantal)}</div>
                </div>
              </div>`;
          }).join('')}
        </div>

        <aside class="summary">
          <h3 class="serif">Overzicht</h3>
          <div class="promo">
            <input type="text" id="promoInput" placeholder="Kortingscode" value="${t.promo ? t.promo.code : ''}">
            <button class="btn btn--secondary" id="promoBtn">Toepassen</button>
          </div>
          <div class="promo-msg" id="promoMsg">${t.promo ? `<span class="ok">${t.promo.label} toegepast</span>` : ''}</div>

          <div class="sum-row"><span>Subtotaal</span><span>${euro(t.subtotaal)}</span></div>
          ${t.promo ? `<div class="sum-row"><span>Korting</span><span>− ${euro(t.korting)}</span></div>` : ''}
          <div class="sum-row"><span>Verzending (PostNL)</span><span>${t.verzending === 0 ? 'Gratis' : euro(t.verzending)}</span></div>
          <div class="sum-row sum-row--total"><span>Totaal</span><span>${euro(t.totaal)}</span></div>

          <a class="btn btn--full" href="afrekenen.html" style="margin-top:20px">Afrekenen</a>
          <p style="font-size:13.5px;color:var(--muted);margin-top:14px">
            Dit is een demo — er wordt niets afgeschreven.
          </p>
        </aside>
      </div>`;

    root.querySelectorAll('[data-remove]').forEach(k =>
      k.addEventListener('click', () => { setQty(k.dataset.remove, 0); render(); }));
    root.querySelectorAll('[data-inc]').forEach(k =>
      k.addEventListener('click', () => { setQty(k.dataset.inc, getCart().find(r => r.id === k.dataset.inc).aantal + 1); render(); }));
    root.querySelectorAll('[data-dec]').forEach(k =>
      k.addEventListener('click', () => { setQty(k.dataset.dec, getCart().find(r => r.id === k.dataset.dec).aantal - 1); render(); }));
    root.querySelectorAll('[data-qty]').forEach(inp =>
      inp.addEventListener('change', () => { setQty(inp.dataset.qty, Number(inp.value)); render(); }));

    const promoBtn = root.querySelector('#promoBtn');
    promoBtn.addEventListener('click', () => {
      const code = root.querySelector('#promoInput').value.trim().toUpperCase();
      if (!code) { localStorage.removeItem(PROMO_KEY); render(); return; }
      if (PROMOS[code]) { localStorage.setItem(PROMO_KEY, code); render(); }
      else {
        localStorage.removeItem(PROMO_KEY);
        root.querySelector('#promoMsg').innerHTML = '<span class="err">Deze kortingscode is niet geldig.</span>';
      }
    });
  }

  render();
}

/* ---------- checkout (demo) ---------- */

function initCheckout() {
  const root = document.getElementById('checkoutRoot');
  if (!root) return;

  if (getCart().length === 0) {
    root.innerHTML = `<div class="empty">
        <h2 class="serif">Je winkelmand is leeg</h2>
        <p>Voeg eerst producten toe voordat je afrekent.</p>
        <a class="btn" href="shop.html">Naar de shop</a>
      </div>`;
    return;
  }

  const t = totals();
  root.querySelector('#checkoutSummary').innerHTML = `
    ${getCart().map(r => {
      const p = byId(r.id);
      return p ? `<div class="sum-row"><span>${r.aantal}× ${esc(p.naam)}</span><span>${euro(p.prijs * r.aantal)}</span></div>` : '';
    }).join('')}
    ${t.promo ? `<div class="sum-row"><span>Korting (${t.promo.code})</span><span>− ${euro(t.korting)}</span></div>` : ''}
    <div class="sum-row"><span>Verzending (PostNL)</span><span>${t.verzending === 0 ? 'Gratis' : euro(t.verzending)}</span></div>
    <div class="sum-row sum-row--total"><span>Totaal</span><span>${euro(t.totaal)}</span></div>`;

  root.querySelectorAll('.pay').forEach(pay => {
    pay.addEventListener('click', () => {
      root.querySelectorAll('.pay').forEach(p => p.classList.remove('active'));
      pay.classList.add('active');
      pay.querySelector('input').checked = true;
    });
  });

  root.querySelector('#checkoutForm').addEventListener('submit', e => {
    e.preventDefault();
    const nummer = 'CBR-' + String(Math.floor(1000 + Math.random() * 9000));
    const mail = root.querySelector('#oMail').value;

    root.innerHTML = `<div class="empty" style="max-width:620px;margin:0 auto">
        <span class="eyebrow">Demo</span>
        <h2 class="serif" style="font-size:38px">Bedankt voor je bestelling</h2>
        <p style="font-size:17px">
          Zo ziet de bevestiging eruit. Je ordernummer zou <strong>${nummer}</strong> zijn
          en de bevestiging gaat naar <strong>${esc(mail)}</strong>.
        </p>
        <div class="todo" style="text-align:left;margin-top:10px">
          <strong>Dit is een demo.</strong> Er is niets besteld, er is niets afgeschreven en er wordt
          geen e-mail verstuurd. In de echte webshop word je vanaf de betaalknop doorgestuurd naar
          Mollie, wordt de voorraad bijgewerkt en krijg je automatisch een bevestiging per e-mail.
        </div>
        <a class="btn" href="index.html" style="margin-top:20px">Terug naar de homepage</a>
      </div>`;
    localStorage.removeItem(CART_KEY);
    localStorage.removeItem(PROMO_KEY);
    updateCartCount();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ---------- nieuwsbrief + contact (demo) ---------- */

function initForms() {
  const nieuwsbrief = document.getElementById('newsletterForm');
  if (nieuwsbrief) {
    nieuwsbrief.addEventListener('submit', e => {
      e.preventDefault();
      const msg = document.getElementById('newsletterMsg');
      msg.textContent = 'Demo — je aanmelding wordt nog niet echt opgeslagen.';
      nieuwsbrief.reset();
    });
  }

  const contact = document.getElementById('contactForm');
  if (contact) {
    contact.addEventListener('submit', e => {
      e.preventDefault();
      const note = document.getElementById('contactNote');
      note.innerHTML = '<strong>Demo:</strong> je bericht is niet echt verstuurd. Zodra de webshop live staat komt dit binnen bij CurlsbyRuth.';
      note.style.color = 'var(--coral)';
    });
  }
}

/* ---------- animaties ---------- */

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let revealObserver = null;

function initReveals(root = document) {
  const kandidaten = ['.sec-head', '.card', '.cat', '.benefit', '.story__copy', '.story__visual',
                      '.social-tile', '.newsletter', '.intro', '.prose > *'];
  root.querySelectorAll(kandidaten.join(',')).forEach(el => el.classList.add('reveal'));

  root.querySelectorAll('.product-grid, .cat-rail, .benefits, .social-grid').forEach(grid => {
    [...grid.children].forEach((kind, i) => kind.setAttribute('data-delay', String((i % 4) + 1)));
  });

  if (REDUCED) {
    root.querySelectorAll('.reveal').forEach(el => el.classList.add('in'));
    return;
  }
  if (!revealObserver) {
    revealObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        obs.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });
  }
  root.querySelectorAll('.reveal:not(.in)').forEach(el => revealObserver.observe(el));
}

function initMarquee() {
  const bar = document.querySelector('.announce');
  if (!bar || bar.querySelector('.marquee')) return;

  const items = [
    'Gratis verzending vanaf € 50',
    'Met de hand ingepakt in Nederland',
    'Verzending met PostNL',
    'Speciaal geselecteerd voor krullend haar'
  ];
  const groep = () => `<div class="marquee__group">${items.map(t => `<span class="marquee__item">${t}</span>`).join('')}</div>`;
  bar.innerHTML = `<div class="marquee">${groep()}${groep()}</div>`;
}

/* ---------- start ---------- */

document.addEventListener('DOMContentLoaded', () => {
  initMarquee();
  initHeader();
  initBrandSlider();
  initHome();
  initShop();
  initProduct();
  initDrawer();
  initCartPage();
  initCheckout();
  initForms();
  bindAddButtons();
  initReveals();
  const jaar = document.getElementById('jaar');
  if (jaar) jaar.textContent = new Date().getFullYear();
});
