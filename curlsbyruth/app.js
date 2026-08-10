/* CurlsbyRuth — demo winkelwagen & productweergave
   Winkelmand draait op localStorage. Voorraad wordt gecontroleerd tegen products.js.
   In de definitieve webshop nemen WooCommerce + Mollie deze rol over
   (echte betalingen, echte voorraadadministratie, orderbevestiging per e-mail).
*/

const CART_KEY = 'cbr_cart';
const PROMO_KEY = 'cbr_promo';

const PROMOS = {
  CURLS10: { korting: 0.10, label: '10% korting' },
  WELKOM5: { korting: 0.05, label: '5% welkomstkorting' }
};

const euro = n => '€ ' + n.toFixed(2).replace('.', ',');

const byId = id => PRODUCTS.find(p => p.id === id);

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

function cartCount() {
  return getCart().reduce((som, r) => som + r.aantal, 0);
}

function cartSubtotal() {
  return getCart().reduce((som, r) => {
    const p = byId(r.id);
    return p ? som + p.prijs * r.aantal : som;
  }, 0);
}

function updateCartCount() {
  const n = cartCount();
  document.querySelectorAll('.cart-count').forEach(el => {
    el.textContent = n;
    el.style.display = n > 0 ? 'inline-flex' : 'none';
  });
}

/* ---------- gedeelde UI ---------- */

function initHeader() {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }
  updateCartCount();
}

/* Tijdelijke productafbeelding: getinte tegel met de merkinitiaal.
   Wordt vervangen zodra Ruth de echte productfoto's aanlevert. */
function mediaMarkup(product, klasse) {
  const letter = product.merk.charAt(0).toUpperCase();
  return `<div class="${klasse}" style="background:${product.tint}">
      <span class="card__initial">${letter}</span>
      <span class="card__ph">Foto volgt</span>
    </div>`;
}

function voorraadLabel(v) {
  if (v === 0) return '<span class="out-stock">Uitverkocht</span>';
  if (v <= 3) return `<span class="low-stock">Nog ${v} op voorraad</span>`;
  return '<span class="in-stock">Op voorraad</span>';
}

function cardMarkup(product) {
  const badge = product.voorraad === 0
    ? '<span class="badge badge--out">Uitverkocht</span>'
    : (product.voorraad <= 3 ? `<span class="badge">Nog ${product.voorraad}</span>` : '');

  return `<a class="card" href="product.html?id=${product.id}">
      <div style="position:relative">
        ${mediaMarkup(product, 'card__media')}
        ${badge}
      </div>
      <span class="card__brand">${product.merk}</span>
      <span class="card__name">${product.naam}</span>
      <span class="card__meta">${[product.categorie, product.inhoud].filter(Boolean).join(' · ')}</span>
      <span class="card__price">${euro(product.prijs)}</span>
    </a>`;
}

/* ---------- shop ---------- */

function initShop() {
  const grid = document.getElementById('shopGrid');
  if (!grid) return;

  const filterBar = document.getElementById('shopFilters');
  const categorieen = [...new Set(PRODUCTS.map(p => p.categorie))].sort();

  if (filterBar) {
    filterBar.innerHTML = ['Alle producten', ...categorieen]
      .map((c, i) => `<button class="btn btn--ghost" data-cat="${i === 0 ? '' : c}"
        style="padding:9px 18px;font-size:11px">${c}</button>`).join('');

    filterBar.addEventListener('click', e => {
      const knop = e.target.closest('button');
      if (!knop) return;
      render(knop.dataset.cat);
    });
  }

  function render(cat = '') {
    const lijst = cat ? PRODUCTS.filter(p => p.categorie === cat) : PRODUCTS;
    grid.innerHTML = lijst.map(cardMarkup).join('');
    const teller = document.getElementById('shopCount');
    if (teller) teller.textContent = `${lijst.length} ${lijst.length === 1 ? 'product' : 'producten'}`;
  }

  render();
}

/* ---------- homepage ---------- */

function initHome() {
  const grid = document.getElementById('homeGrid');
  if (!grid) return;
  const uitgelicht = PRODUCTS.filter(p => p.voorraad > 0).slice(0, 4);
  grid.innerHTML = uitgelicht.map(cardMarkup).join('');
}

/* ---------- productpagina ---------- */

function initProduct() {
  const root = document.getElementById('productRoot');
  if (!root) return;

  const id = new URLSearchParams(location.search).get('id');
  const product = byId(id);

  if (!product) {
    root.innerHTML = `<div class="empty-cart">
        <h2>Product niet gevonden</h2>
        <p>Dit product bestaat niet (meer).</p>
        <a class="btn" href="shop.html">Terug naar de shop</a>
      </div>`;
    return;
  }

  document.title = `${product.naam} — CurlsbyRuth`;
  const uit = product.voorraad === 0;
  const meta = [product.categorie, product.inhoud].filter(Boolean).join(' · ');

  root.innerHTML = `
    <div class="pd">
      <div>${mediaMarkup(product, 'pd__media')}</div>
      <div>
        <span class="eyebrow">${product.merk}</span>
        <h1>${product.naam}</h1>
        <p style="color:var(--muted)">${meta}</p>

        <div class="pd__price">${euro(product.prijs)}</div>
        <div class="pd__stock">${voorraadLabel(product.voorraad)}</div>

        <div class="pd__buy">
          <div class="qty">
            <button type="button" data-step="-1" aria-label="Minder">−</button>
            <input type="number" id="pdQty" value="1" min="1" max="${Math.max(product.voorraad, 1)}" aria-label="Aantal">
            <button type="button" data-step="1" aria-label="Meer">+</button>
          </div>
          <button class="btn" id="pdAdd" ${uit ? 'disabled' : ''}>
            ${uit ? 'Uitverkocht' : 'In winkelmand'}
          </button>
        </div>

        <div class="acc">
          <div class="acc__item open">
            <button class="acc__btn" type="button"><span>Omschrijving</span><span>−</span></button>
            <div class="acc__panel">
              <div class="todo">De productomschrijving voor dit artikel wordt nog aangeleverd door Ruth.</div>
            </div>
          </div>
          <div class="acc__item">
            <button class="acc__btn" type="button"><span>Ingrediënten</span><span>+</span></button>
            <div class="acc__panel">
              <div class="todo">
                De volledige ingrediëntenlijst (INCI) wordt overgenomen van de verpakking.
                Deze mag niet geschat worden — allergeneninformatie moet exact kloppen.
              </div>
            </div>
          </div>
          <div class="acc__item">
            <button class="acc__btn" type="button"><span>Gebruiksaanwijzing</span><span>+</span></button>
            <div class="acc__panel">
              <div class="todo">De gebruiksaanwijzing wordt nog aangeleverd door Ruth.</div>
            </div>
          </div>
          <div class="acc__item">
            <button class="acc__btn" type="button"><span>Verzending</span><span>+</span></button>
            <div class="acc__panel">
              Verzending met PostNL vanuit Nederland. Verzendkosten ${euro(SHIPPING_COST)};
              gratis verzending vanaf ${euro(FREE_SHIPPING_FROM)}.
              Bestellingen worden met de hand ingepakt en verstuurd.
            </div>
          </div>
        </div>

        <p style="font-size:12px;color:var(--muted);margin-top:22px">Artikelnummer: ${product.barcode}</p>
      </div>
    </div>`;

  const qty = root.querySelector('#pdQty');
  root.querySelectorAll('.qty button').forEach(knop => {
    knop.addEventListener('click', () => {
      const nieuw = Number(qty.value) + Number(knop.dataset.step);
      qty.value = Math.min(Math.max(nieuw, 1), Math.max(product.voorraad, 1));
    });
  });

  root.querySelectorAll('.acc__btn').forEach(knop => {
    knop.addEventListener('click', () => {
      const item = knop.closest('.acc__item');
      const open = item.classList.toggle('open');
      knop.querySelector('span:last-child').textContent = open ? '−' : '+';
    });
  });

  const addKnop = root.querySelector('#pdAdd');
  if (addKnop && !uit) {
    addKnop.addEventListener('click', () => {
      const gelukt = addToCart(product.id, Number(qty.value));
      addKnop.textContent = gelukt ? 'Toegevoegd' : 'Max. voorraad bereikt';
      setTimeout(() => { addKnop.textContent = 'In winkelmand'; }, 1800);
    });
  }
}

/* ---------- winkelmand ---------- */

function initCart() {
  const root = document.getElementById('cartRoot');
  if (!root) return;

  function actievePromo() {
    const code = localStorage.getItem(PROMO_KEY);
    return code && PROMOS[code] ? { code, ...PROMOS[code] } : null;
  }

  function render() {
    const cart = getCart();

    if (cart.length === 0) {
      root.innerHTML = `<div class="empty-cart">
          <h2>Je winkelmand is leeg</h2>
          <p>Ontdek de verzorgingsproducten voor jouw krullen.</p>
          <a class="btn" href="shop.html">Naar de shop</a>
        </div>`;
      return;
    }

    const subtotaal = cartSubtotal();
    const promo = actievePromo();
    const korting = promo ? subtotaal * promo.korting : 0;
    const naKorting = subtotaal - korting;
    const verzending = naKorting >= FREE_SHIPPING_FROM ? 0 : SHIPPING_COST;
    const totaal = naKorting + verzending;

    const regels = cart.map(r => {
      const p = byId(r.id);
      if (!p) return '';
      return `<div class="cart-row">
          ${mediaMarkup(p, 'cart-row__media card__media')}
          <div>
            <div class="cart-row__brand">${p.merk}</div>
            <div class="cart-row__name">${p.naam}</div>
            <div style="font-size:13px;color:var(--muted)">${euro(p.prijs)} per stuk</div>
            <button class="cart-row__remove" data-remove="${p.id}">Verwijderen</button>
          </div>
          <div class="cart-row__right">
            <div class="qty" style="margin-left:auto">
              <button type="button" data-dec="${p.id}" aria-label="Minder">−</button>
              <input type="number" value="${r.aantal}" min="1" max="${p.voorraad}" data-qty="${p.id}" aria-label="Aantal">
              <button type="button" data-inc="${p.id}" aria-label="Meer">+</button>
            </div>
            <div style="margin-top:10px">${euro(p.prijs * r.aantal)}</div>
          </div>
        </div>`;
    }).join('');

    root.innerHTML = `
      <div class="cart-layout">
        <div>
          <h1 class="serif" style="font-size:38px;margin-bottom:8px">Winkelmand</h1>
          <p style="color:var(--muted);margin-bottom:18px">${cartCount()} artikel(en)</p>
          ${regels}
        </div>
        <aside class="summary">
          <h3>Overzicht</h3>
          <div class="promo">
            <input type="text" id="promoInput" placeholder="Kortingscode" value="${promo ? promo.code : ''}">
            <button class="btn" id="promoBtn">${promo ? 'Wijzig' : 'Pas toe'}</button>
          </div>
          <div class="promo-msg" id="promoMsg">${promo ? `<span class="ok">${promo.label} toegepast</span>` : ''}</div>

          <div class="summary__line"><span>Subtotaal</span><span>${euro(subtotaal)}</span></div>
          ${promo ? `<div class="summary__line"><span>Korting (${promo.code})</span><span>− ${euro(korting)}</span></div>` : ''}
          <div class="summary__line">
            <span>Verzending (PostNL)</span>
            <span>${verzending === 0 ? 'Gratis' : euro(verzending)}</span>
          </div>
          <div class="summary__line summary__line--total"><span>Totaal</span><span>${euro(totaal)}</span></div>

          ${naKorting < FREE_SHIPPING_FROM
            ? `<p class="summary__note">Nog ${euro(FREE_SHIPPING_FROM - naKorting)} tot gratis verzending.</p>`
            : ''}

          <div style="margin-top:22px">
            <button class="btn btn--full" id="checkoutBtn">Afrekenen</button>
          </div>
          <p class="summary__note">
            In de live webshop reken je hier af met iDEAL, Bancontact, creditcard,
            Apple&nbsp;Pay of Google&nbsp;Pay via Mollie.
          </p>
        </aside>
      </div>`;

    bind();
  }

  function bind() {
    root.querySelectorAll('[data-remove]').forEach(knop =>
      knop.addEventListener('click', () => { setQty(knop.dataset.remove, 0); render(); }));

    root.querySelectorAll('[data-inc]').forEach(knop =>
      knop.addEventListener('click', () => {
        const id = knop.dataset.inc;
        const regel = getCart().find(r => r.id === id);
        setQty(id, regel.aantal + 1);
        render();
      }));

    root.querySelectorAll('[data-dec]').forEach(knop =>
      knop.addEventListener('click', () => {
        const id = knop.dataset.dec;
        const regel = getCart().find(r => r.id === id);
        setQty(id, regel.aantal - 1);
        render();
      }));

    root.querySelectorAll('[data-qty]').forEach(input =>
      input.addEventListener('change', () => {
        setQty(input.dataset.qty, Number(input.value));
        render();
      }));

    const promoBtn = root.querySelector('#promoBtn');
    if (promoBtn) {
      promoBtn.addEventListener('click', () => {
        const code = root.querySelector('#promoInput').value.trim().toUpperCase();
        const msg = root.querySelector('#promoMsg');
        if (!code) {
          localStorage.removeItem(PROMO_KEY);
          render();
          return;
        }
        if (PROMOS[code]) {
          localStorage.setItem(PROMO_KEY, code);
          render();
        } else {
          localStorage.removeItem(PROMO_KEY);
          msg.innerHTML = '<span class="err">Deze kortingscode is niet geldig.</span>';
        }
      });
    }

    const checkout = root.querySelector('#checkoutBtn');
    if (checkout) {
      checkout.addEventListener('click', () => { location.href = 'afrekenen.html'; });
    }
  }

  render();
}

/* ---------- afrekenen (demo) ---------- */

function initCheckout() {
  const root = document.getElementById('checkoutRoot');
  if (!root) return;

  const cart = getCart();
  if (cart.length === 0) {
    root.innerHTML = `<div class="empty-cart">
        <h2>Je winkelmand is leeg</h2>
        <p>Voeg eerst producten toe voordat je afrekent.</p>
        <a class="btn" href="shop.html">Naar de shop</a>
      </div>`;
    return;
  }

  const code = localStorage.getItem(PROMO_KEY);
  const promo = code && PROMOS[code] ? PROMOS[code] : null;
  const subtotaal = cartSubtotal();
  const korting = promo ? subtotaal * promo.korting : 0;
  const naKorting = subtotaal - korting;
  const verzending = naKorting >= FREE_SHIPPING_FROM ? 0 : SHIPPING_COST;
  const totaal = naKorting + verzending;

  const regels = cart.map(r => {
    const p = byId(r.id);
    return p ? `<div class="summary__line"><span>${r.aantal}× ${p.naam}</span><span>${euro(p.prijs * r.aantal)}</span></div>` : '';
  }).join('');

  root.querySelector('#checkoutSummary').innerHTML = `
    ${regels}
    ${promo ? `<div class="summary__line"><span>Korting (${code})</span><span>− ${euro(korting)}</span></div>` : ''}
    <div class="summary__line"><span>Verzending (PostNL)</span><span>${verzending === 0 ? 'Gratis' : euro(verzending)}</span></div>
    <div class="summary__line summary__line--total"><span>Totaal</span><span>${euro(totaal)}</span></div>`;

  const form = root.querySelector('#checkoutForm');
  form.addEventListener('submit', e => {
    e.preventDefault();
    root.innerHTML = `<div class="empty-cart">
        <span class="eyebrow">Demo</span>
        <h2 style="margin-top:10px">Zo ver komt de demo</h2>
        <p>
          In de live webshop word je vanaf hier doorgestuurd naar Mollie om te betalen
          met iDEAL, Bancontact, creditcard, Apple&nbsp;Pay of Google&nbsp;Pay.
          Daarna ontvang je automatisch een orderbevestiging per e-mail
          en wordt de voorraad bijgewerkt.
        </p>
        <p style="margin-bottom:28px">Er is nu niets afgeschreven en er is geen bestelling geplaatst.</p>
        <a class="btn" href="index.html">Terug naar home</a>
      </div>`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ---------- start ---------- */

document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initHome();
  initShop();
  initProduct();
  initCart();
  initCheckout();
});
