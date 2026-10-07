/* ============================================================
   Barbershop Zelhem — concept
   Prijzen, team, afsprakenplanner (zonder online betalen),
   openingstijden en kleine interacties.
   ============================================================ */

const SERVICES = [
  { id: 'knippen',  cat: 'hair',  name: 'Knippen',                 desc: 'Wassen, knippen & stylen',      min: 30, price: 27.5 },
  { id: 'fade',     cat: 'hair',  name: 'Skin fade',               desc: 'Strakke fade tot op de huid',   min: 40, price: 30 },
  { id: 'tondeuse', cat: 'hair',  name: 'Tondeuse',                desc: 'Overal één lengte',             min: 15, price: 17.5 },
  { id: 'kids',     cat: 'hair',  name: 'Kinderen t/m 12',          desc: 'Knippen voor de kleine mannen', min: 25, price: 20 },
  { id: 'senior',   cat: 'hair',  name: '65+',                     desc: 'Knippen voor senioren',         min: 30, price: 22.5 },
  { id: 'baard',    cat: 'beard', name: 'Baard trimmen',           desc: 'Model, contouren & olie',       min: 20, price: 17.5 },
  { id: 'shave',    cat: 'beard', name: 'Hot towel shave',         desc: 'Klassiek scheren met mes',      min: 30, price: 25 },
  { id: 'combi',    cat: 'beard', name: 'Knippen + baard',         desc: 'De complete behandeling',       min: 50, price: 42.5 },
  { id: 'fadebrd',  cat: 'beard', name: 'Skin fade + baard',       desc: 'Fade én baard in één keer',     min: 60, price: 45 },
  { id: 'wenk',     cat: 'beard', name: 'Wenkbrauwen / lijntjes',  desc: 'Als extra bij je behandeling',  min: 5,  price: 5 },
];

const BARBERS = [
  { id: 'any',   name: 'Geen voorkeur', role: 'Eerste beschikbare barber', bio: '' },
  { id: 'mo',    name: 'Mo',     role: 'Eigenaar & master barber', bio: 'Specialist in skin fades en strakke lijnen.' },
  { id: 'daan',  name: 'Daan',   role: 'Barber',                   bio: 'Klassieke coupes en schaarwerk.' },
  { id: 'yusuf', name: 'Yusuf',  role: 'Barber',                   bio: 'Baarden, hot towel shaves en design.' },
];

// 0 = zondag … 6 = zaterdag  →  [open, dicht] in minuten
const HOURS = {
  0: null,
  1: null,
  2: [9 * 60, 18 * 60],
  3: [9 * 60, 18 * 60],
  4: [9 * 60, 21 * 60],
  5: [9 * 60, 18 * 60],
  6: [8 * 60 + 30, 16 * 60],
};

const DAYNAMES = ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za'];
const DAYNAMES_LONG = ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'];
const MONTHS = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const euro = n => '€ ' + n.toFixed(2).replace('.', ',').replace(',00', ',-');
const hhmm = m => String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* ---------- prijslijst ---------- */
function renderPrices() {
  const row = s => `
    <li>
      <div class="price-row">
        <span class="price-row__name">${s.name}</span>
        <span class="price-row__dots"></span>
        <span class="price-row__price">${euro(s.price)}</span>
      </div>
      <div class="price-row__desc"><span>${s.desc}</span><span>± ${s.min} min</span></div>
    </li>`;
  $('#priceHair').innerHTML = SERVICES.filter(s => s.cat === 'hair').map(row).join('');
  $('#priceBeard').innerHTML = SERVICES.filter(s => s.cat === 'beard').map(row).join('');
}

/* ---------- team ---------- */
function renderTeam() {
  $('#teamGrid').innerHTML = BARBERS.filter(b => b.id !== 'any').map(b => `
    <article class="member reveal">
      <div class="photo" data-label="Foto: ${b.name}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg>
      </div>
      <h3>${b.name}</h3>
      <p>${b.role}</p>
      <small>${b.bio}</small>
    </article>`).join('');
}

/* ---------- afsprakenplanner ---------- */
const state = { step: 1, service: null, barber: null, date: null, time: null };

function renderServiceOptions() {
  $('#optServices').innerHTML = SERVICES.map(s => `
    <button type="button" class="opt" data-service="${s.id}">
      <span><span class="opt__name">${s.name}</span><span class="opt__meta">± ${s.min} min</span></span>
      <span class="opt__price">${euro(s.price)}</span>
    </button>`).join('');
  $$('#optServices .opt').forEach(btn => btn.addEventListener('click', () => {
    state.service = SERVICES.find(s => s.id === btn.dataset.service);
    state.time = null;
    select('#optServices .opt', btn);
    update();
  }));
}

function renderBarberOptions() {
  $('#optBarbers').innerHTML = BARBERS.map(b => `
    <button type="button" class="opt" data-barber="${b.id}">
      <span class="opt__avatar">${b.id === 'any' ? '★' : b.name[0]}</span>
      <span class="opt__name">${b.name}</span>
      <span class="opt__meta">${b.role}</span>
    </button>`).join('');
  $$('#optBarbers .opt').forEach(btn => btn.addEventListener('click', () => {
    state.barber = BARBERS.find(b => b.id === btn.dataset.barber);
    state.time = null;
    select('#optBarbers .opt', btn);
    if (state.date) renderTimes();
    update();
  }));
}

function renderDays() {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const days = [];
  for (let i = 0; i < 21; i++) {
    const d = new Date(today); d.setDate(today.getDate() + i);
    days.push(d);
  }
  $('#optDays').innerHTML = days.map(d => `
    <button type="button" class="day" data-date="${d.toISOString()}" ${HOURS[d.getDay()] ? '' : 'disabled'}>
      <small>${DAYNAMES[d.getDay()]}</small>
      <strong>${d.getDate()}</strong>
      <small>${MONTHS[d.getMonth()]}</small>
    </button>`).join('');
  $$('#optDays .day').forEach(btn => btn.addEventListener('click', () => {
    state.date = new Date(btn.dataset.date);
    state.time = null;
    select('#optDays .day', btn);
    renderTimes();
    update();
  }));
}

// Nep-bezetting: deterministisch per dag + barber, zodat het er realistisch uitziet.
function isTaken(date, minutes, barberId) {
  const seed = date.getDate() * 31 + date.getMonth() * 7 + minutes + barberId.length * 13;
  const r = Math.abs(Math.sin(seed) * 10000) % 1;
  return r < (barberId === 'any' ? 0.18 : 0.38);
}

function renderTimes() {
  const range = HOURS[state.date.getDay()];
  const dur = state.service ? state.service.min : 30;
  const barberId = state.barber ? state.barber.id : 'any';
  const now = new Date();
  const isToday = state.date.toDateString() === now.toDateString();
  const nowMin = now.getHours() * 60 + now.getMinutes();

  const slots = [];
  for (let m = range[0]; m + dur <= range[1]; m += 15) {
    const past = isToday && m <= nowMin + 30;
    slots.push({ m, off: past || isTaken(state.date, m, barberId) });
  }
  const free = slots.filter(s => !s.off).length;

  $('#optTimes').innerHTML = slots.map(s =>
    `<button type="button" class="time" data-time="${s.m}" ${s.off ? 'disabled' : ''}>${hhmm(s.m)}</button>`
  ).join('');
  $('#timesHint').textContent = free
    ? `${free} tijden beschikbaar op ${DAYNAMES_LONG[state.date.getDay()]}.`
    : 'Geen tijden meer vrij op deze dag. Kies een andere dag.';

  $$('#optTimes .time').forEach(btn => btn.addEventListener('click', () => {
    state.time = +btn.dataset.time;
    select('#optTimes .time', btn);
    update();
  }));
}

function select(selector, btn) {
  $$(selector).forEach(b => b.classList.toggle('is-selected', b === btn));
}

function fmtDate(d) {
  return `${DAYNAMES_LONG[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

function canNext() {
  switch (state.step) {
    case 1: return !!state.service;
    case 2: return !!state.barber;
    case 3: return !!state.date && state.time !== null;
    case 4: return true;
    default: return false;
  }
}

function update() {
  const sum = key => $(`[data-sum="${key}"]`);
  sum('service').textContent = state.service ? state.service.name : '—';
  sum('barber').textContent = state.barber ? state.barber.name : '—';
  sum('date').textContent = state.date ? fmtDate(state.date) : '—';
  sum('time').textContent = state.time !== null ? hhmm(state.time) : '—';
  sum('price').textContent = state.service ? euro(state.service.price) : '€ 0';

  $$('.step').forEach(s => s.classList.toggle('is-active', +s.dataset.step === state.step));
  $$('[data-step-dot]').forEach(li => {
    const n = +li.dataset.stepDot;
    li.classList.toggle('is-active', n === state.step);
    li.classList.toggle('is-done', n < state.step);
  });

  const next = $('#btnNext');
  next.disabled = !canNext();
  next.textContent = state.step === 4 ? 'Afspraak bevestigen' : 'Volgende';
  $('#btnBack').hidden = state.step === 1 || state.step === 5;
  $('.summary__nav').hidden = state.step === 5;
}

function goto(step) {
  state.step = step;
  update();
  const top = $('#booking').getBoundingClientRect().top + window.scrollY - 90;
  if (window.scrollY > top) window.scrollTo({ top, behavior: 'smooth' });
}

function submitBooking() {
  const form = $('#bookingForm');
  const err = $('#formError');
  let ok = true;
  $$('input[required]', form).forEach(inp => {
    const valid = inp.value.trim() !== '' && inp.checkValidity();
    inp.classList.toggle('is-invalid', !valid);
    if (!valid) ok = false;
  });
  if (!ok) { err.textContent = 'Vul je naam, telefoonnummer en een geldig e-mailadres in.'; return; }
  err.textContent = '';

  const name = form.name.value.trim().split(' ')[0];
  $('#doneText').innerHTML =
    `Top ${esc(name)}! Je <strong>${esc(state.service.name)}</strong> staat op ` +
    `<strong>${fmtDate(state.date)} om ${hhmm(state.time)}</strong>` +
    (state.barber.id === 'any' ? '' : ` bij <strong>${esc(state.barber.name)}</strong>`) +
    `. Je betaalt ${euro(state.service.price)} in de zaak, met pin of contant.`;
  goto(5);
}

function resetBooking() {
  Object.assign(state, { step: 1, service: null, barber: null, date: null, time: null });
  $$('.is-selected', $('#booking')).forEach(el => el.classList.remove('is-selected'));
  $('#optTimes').innerHTML = '';
  $('#timesHint').textContent = 'Kies eerst een dag.';
  $('#bookingForm').reset();
  goto(1);
}

function initBooking() {
  renderServiceOptions();
  renderBarberOptions();
  renderDays();
  $('#btnNext').addEventListener('click', () => {
    if (!canNext()) return;
    if (state.step === 4) return submitBooking();
    if (state.step === 2 && state.date) renderTimes();
    goto(state.step + 1);
  });
  $('#btnBack').addEventListener('click', () => goto(Math.max(1, state.step - 1)));
  $('#bookAgain').addEventListener('click', resetBooking);
  $('#bookingForm').addEventListener('submit', e => { e.preventDefault(); submitBooking(); });
  update();
}

/* ---------- openingstijden ---------- */
function initHours() {
  const now = new Date();
  const day = now.getDay();
  const row = $(`#hours tr[data-day="${day}"]`);
  if (row) row.classList.add('is-today');

  const range = HOURS[day];
  const mins = now.getHours() * 60 + now.getMinutes();
  const el = $('#openNow');
  if (range && mins >= range[0] && mins < range[1]) {
    el.textContent = `Nu geopend · tot ${hhmm(range[1])}`;
    el.classList.add('is-open');
  } else if (range && mins < range[0]) {
    el.textContent = `Nu gesloten · vandaag open om ${hhmm(range[0])}`;
  } else {
    for (let i = 1; i <= 7; i++) {
      const d = (day + i) % 7;
      if (HOURS[d]) { el.textContent = `Nu gesloten · ${DAYNAMES_LONG[d]} open om ${hhmm(HOURS[d][0])}`; break; }
    }
  }
}

/* ---------- header, menu, reveal ---------- */
function initChrome() {
  const header = $('.header');
  const sticky = $('.sticky-book');
  const booking = $('#afspraak');
  const onScroll = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 40);
    const r = booking.getBoundingClientRect();
    const inBooking = r.top < window.innerHeight && r.bottom > 0;
    sticky.classList.toggle('is-hidden', window.scrollY < 300 || inBooking);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const toggle = $('.nav-toggle');
  toggle.addEventListener('click', () => {
    const open = document.body.classList.toggle('nav-open');
    toggle.setAttribute('aria-expanded', open);
  });
  $$('.nav a').forEach(a => a.addEventListener('click', () => {
    document.body.classList.remove('nav-open');
    toggle.setAttribute('aria-expanded', 'false');
  }));

  $$('.section__head, .split__text, .split__media, .prices__col, .review, .gallery .photo, .contact__info')
    .forEach(el => el.classList.add('reveal'));
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    }), { threshold: 0.12 });
    $$('.reveal').forEach(el => io.observe(el));
  } else {
    $$('.reveal').forEach(el => el.classList.add('is-in'));
  }

  $('#year').textContent = new Date().getFullYear();
}

renderPrices();
renderTeam();
initBooking();
initHours();
initChrome();
