// Nav scroll effect + active link highlight (merged into one listener)
const nav = document.getElementById('nav');
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav__links a');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
  let current = '';
  sections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 100) current = s.id;
  });
  navLinks.forEach(a => {
    a.style.color = a.getAttribute('href') === `#${current}` ? 'var(--green)' : '';
  });
}, { passive: true });

// Mobile menu
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
hamburger.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
});
mobileMenu.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => mobileMenu.classList.remove('open'));
});

// Scroll-in animations
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 80);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.card, .step, .pricing-card, .testimonial, .section-header, .pcard').forEach(el => {
  el.classList.add('fade-up');
  observer.observe(el);
});

// ===========================
// PORTFOLIO FILTER
// ===========================
document.querySelectorAll('.ptab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.ptab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const filter = tab.dataset.filter;
    document.querySelectorAll('.pcard').forEach(card => {
      const match = filter === 'all' || card.dataset.cat === filter;
      if (match) {
        card.style.display = '';
        card.classList.remove('hidden');
      } else {
        card.classList.add('hidden');
        setTimeout(() => { if (card.classList.contains('hidden')) card.style.display = 'none'; }, 400);
      }
    });
  });
});

// ===========================
// BEFORE / AFTER SLIDER
// ===========================
const baSlider  = document.getElementById('baSlider');
const baAfter   = document.getElementById('baAfter');
const baDivider = document.getElementById('baDivider');
let dragging = false;

function setSliderPos(x) {
  const rect = baSlider.getBoundingClientRect();
  let pct = (x - rect.left) / rect.width;
  pct = Math.max(0.04, Math.min(0.96, pct));
  baAfter.style.clipPath = `inset(0 ${(1 - pct) * 100}% 0 0)`;
  baDivider.style.left = `${pct * 100}%`;
}

baSlider.addEventListener('mousedown', e => { dragging = true; setSliderPos(e.clientX); });
window.addEventListener('mousemove', e => { if (dragging) setSliderPos(e.clientX); });
window.addEventListener('mouseup', () => { dragging = false; });

baSlider.addEventListener('touchstart', e => { dragging = true; setSliderPos(e.touches[0].clientX); }, { passive: true });
window.addEventListener('touchmove', e => { if (dragging) setSliderPos(e.touches[0].clientX); }, { passive: true });
window.addEventListener('touchend', () => { dragging = false; });

// Before/after project tabs — swap mock content per project
const baProjects = [
  {
    oldHTML: `<div class="ba-mock old-mock">
      <div class="old-topbar"><span style="color:#aaa;font-size:8px;font-family:Arial">www.loodgieterhenk.nl</span></div>
      <div class="old-nav2"><div class="old-nav2-logo">LOODGIETER HENK</div><div class="old-nav2-links"><span>Home</span><span>Over ons</span><span>Diensten</span><span>Contact</span></div></div>
      <div class="old-marquee">⭐ SPOEDSERVICE BESCHIKBAAR ⭐ BEL ONS NU: 06-1234567 ⭐ GRATIS OFFERTE ⭐</div>
      <div class="old-body2">
        <div class="old-sidebar"><div class="old-sb-title">MENU</div><div class="old-sb-item">▶ Home</div><div class="old-sb-item">▶ Diensten</div><div class="old-sb-item">▶ Tarieven</div><div class="old-sb-item">▶ Contact</div><div class="old-sb-item">▶ Links</div><div class="old-sb-img">🔧</div></div>
        <div class="old-main2"><div class="old-h1">Welkom op onze website!</div><div class="old-p">Loodgieter Henk is al meer dan 20 jaar actief in de regio. Neem vandaag nog contact met ons op voor een gratis offerte!</div><div class="old-counter">Bezoekers: <span style="color:#ff0">004821</span></div></div>
      </div>
    </div>`,
    newHTML: `<div class="ba-mock new-mock">
      <div class="new-topbar"><span class="ntb-dot r"></span><span class="ntb-dot y"></span><span class="ntb-dot g"></span><span class="new-url">loodgieterhenk.nl</span></div>
      <div class="new-nav2"><div class="new-nav2-logo">🔧 Loodgieter Henk</div><div class="new-nav2-links"><span>Diensten</span><span>Reviews</span><span>Over ons</span><span class="new-nav2-btn">Bel direct</span></div></div>
      <div class="new-hero2">
        <div class="new-hero2-text">
          <div class="new-hero2-tag">⚡ 24/7 Spoedservice — ook in het weekend</div>
          <div class="new-hero2-h1">Loodgieter nodig?<br>Wij zijn er direct.</div>
          <div class="new-hero2-sub">Betrouwbaar, snel en voor een eerlijke prijs. Al 15 jaar actief in de regio.</div>
          <div style="display:flex;gap:6px;flex-wrap:wrap"><div class="new-hero2-btn">Gratis offerte →</div><div class="new-hero2-btn" style="background:transparent;border:1.5px solid rgba(255,255,255,.3);color:white">Bel: 06-1234567</div></div>
          <div style="margin-top:8px;font-size:7px;color:rgba(255,255,255,.5)">★★★★★ 4.9 · 63 reviews op Google</div>
        </div>
        <div class="new-hero2-img" style="font-size:36px;display:flex;flex-direction:column;align-items:center;gap:4px">🔧<div style="font-size:6.5px;color:rgba(255,255,255,.5);text-align:center">Beschikbaar<br>vandaag</div></div>
      </div>
      <div class="new-services">
        <div class="new-svc"><div class="new-svc-icon">💧</div><div class="new-svc-name">Lekkage</div></div>
        <div class="new-svc"><div class="new-svc-icon">🔥</div><div class="new-svc-name">CV-ketel</div></div>
        <div class="new-svc"><div class="new-svc-icon">🚿</div><div class="new-svc-name">Installatie</div></div>
        <div class="new-svc"><div class="new-svc-icon">🔩</div><div class="new-svc-name">Reparatie</div></div>
        <div class="new-svc"><div class="new-svc-icon">⚡</div><div class="new-svc-name">Spoed</div></div>
      </div>
    </div>`
  },
  {
    oldHTML: `<div class="ba-mock old-mock">
      <div class="old-topbar"><span style="color:#aaa;font-size:8px;font-family:Arial">www.bloemenvanroos.nl</span></div>
      <div class="old-nav2"><div class="old-nav2-logo">BLOEMEN VAN ROOS</div><div class="old-nav2-links"><span>Home</span><span>Assortiment</span><span>Bestellen</span><span>Contact</span></div></div>
      <div class="old-marquee">🌸 VERSE BLOEMEN DAGELIJKS 🌸 GRATIS BEZORGING BOVEN €40 🌸</div>
      <div class="old-body2">
        <div class="old-sidebar"><div class="old-sb-title">CATEGORIEËN</div><div class="old-sb-item">▶ Rozen</div><div class="old-sb-item">▶ Tulpen</div><div class="old-sb-item">▶ Boeketten</div><div class="old-sb-item">▶ Planten</div><div class="old-sb-img">🌷</div></div>
        <div class="old-main2"><div class="old-h1">Welkom bij Bloemen van Roos!</div><div class="old-p">Wij leveren verse bloemen voor elk moment. Bekijk ons assortiment en bestel vandaag nog!</div><div class="old-counter">Bezoekers: <span style="color:#ff0">002134</span></div></div>
      </div>
    </div>`,
    newHTML: `<div class="ba-mock new-mock" style="background:#0d0a0f">
      <div class="new-topbar"><span class="ntb-dot r"></span><span class="ntb-dot y"></span><span class="ntb-dot g"></span><span class="new-url">bloemenvanroos.nl</span></div>
      <div class="new-nav2" style="background:#160d1f"><div class="new-nav2-logo" style="color:#e879f9">🌸 Bloemen van Roos</div><div class="new-nav2-links"><span>Shop</span><span>Abonnement</span><span class="new-nav2-btn" style="background:#9333ea">Bestel nu</span></div></div>
      <div class="new-hero2" style="background:linear-gradient(135deg,#3b0764,#6b21a8)">
        <div class="new-hero2-text">
          <div class="new-hero2-tag" style="background:rgba(255,255,255,.1);color:#f5d0fe">Vandaag besteld, morgen in huis</div>
          <div class="new-hero2-h1">Verse bloemen,<br>direct bij je thuis.</div>
          <div class="new-hero2-sub">Seizoensboeketten, trouwbloemen en abonnementen. Vers van de kweker.</div>
          <div style="display:flex;gap:6px"><div class="new-hero2-btn" style="background:#9333ea">Shop boeketten →</div><div class="new-hero2-btn" style="background:transparent;border:1.5px solid rgba(255,255,255,.3);color:white">Gratis bezorging</div></div>
        </div>
        <div class="new-hero2-img" style="font-size:38px">💐</div>
      </div>
      <div class="new-services" style="background:#160d1f">
        <div class="new-svc"><div class="new-svc-icon">🌹</div><div class="new-svc-name">Rozen</div></div>
        <div class="new-svc"><div class="new-svc-icon">🌷</div><div class="new-svc-name">Tulpen</div></div>
        <div class="new-svc"><div class="new-svc-icon">💐</div><div class="new-svc-name">Boeketten</div></div>
        <div class="new-svc"><div class="new-svc-icon">🌿</div><div class="new-svc-name">Planten</div></div>
        <div class="new-svc"><div class="new-svc-icon">🎁</div><div class="new-svc-name">Cadeaus</div></div>
      </div>
    </div>`
  },
  {
    oldHTML: `<div class="ba-mock old-mock">
      <div class="old-topbar"><span style="color:#aaa;font-size:8px;font-family:Arial">www.coachingmetlisa.nl</span></div>
      <div class="old-nav2"><div class="old-nav2-logo">COACHING MET LISA</div><div class="old-nav2-links"><span>Home</span><span>Over Lisa</span><span>Diensten</span><span>Contact</span></div></div>
      <div class="old-marquee">✨ PERSOONLIJKE COACHING ✨ GRATIS KENNISMAKING ✨ BELLEN OF MAILEN ✨</div>
      <div class="old-body2">
        <div class="old-sidebar"><div class="old-sb-title">MENU</div><div class="old-sb-item">▶ Life coaching</div><div class="old-sb-item">▶ Business</div><div class="old-sb-item">▶ Tarieven</div><div class="old-sb-item">▶ Contact</div><div class="old-sb-img">💬</div></div>
        <div class="old-main2"><div class="old-h1">Welkom bij Coaching met Lisa</div><div class="old-p">Wil jij meer uit je leven of werk halen? Ik help je verder. Al 8 jaar actief als coach. Neem contact op!</div><div class="old-counter">Bezoekers: <span style="color:#ff0">001293</span></div></div>
      </div>
    </div>`,
    newHTML: `<div class="ba-mock new-mock" style="background:#040f1f">
      <div class="new-topbar"><span class="ntb-dot r"></span><span class="ntb-dot y"></span><span class="ntb-dot g"></span><span class="new-url">coachingmetlisa.nl</span></div>
      <div class="new-nav2" style="background:#050f20"><div class="new-nav2-logo" style="color:white;font-size:7px">Lisa van Houten — Coach</div><div class="new-nav2-links"><span>Over mij</span><span>Programma's</span><span class="new-nav2-btn" style="background:#3b82f6">Plan gesprek</span></div></div>
      <div class="new-hero2" style="background:linear-gradient(135deg,#0c1f3f,#1e3a6b)">
        <div class="new-hero2-text">
          <div class="new-hero2-tag" style="background:rgba(59,130,246,.2);color:#93c5fd">Business & Life Coach · Utrecht</div>
          <div class="new-hero2-h1">Klaar voor de<br>volgende stap?</div>
          <div class="new-hero2-sub">Ik help ondernemers en professionals groeien — in werk én in leven. Resultaatgericht en persoonlijk.</div>
          <div style="display:flex;gap:6px"><div class="new-hero2-btn" style="background:#3b82f6">Gratis kennismaking</div><div class="new-hero2-btn" style="background:transparent;border:1.5px solid rgba(255,255,255,.3);color:white">Mijn aanpak</div></div>
          <div style="margin-top:8px;font-size:7px;color:rgba(255,255,255,.5)">★★★★★ 4.9 · 41 beoordelingen</div>
        </div>
        <div class="new-hero2-img" style="font-size:36px">🧠</div>
      </div>
      <div class="new-services" style="background:#050f20">
        <div class="new-svc"><div class="new-svc-icon">🎯</div><div class="new-svc-name">Doelen</div></div>
        <div class="new-svc"><div class="new-svc-icon">💼</div><div class="new-svc-name">Business</div></div>
        <div class="new-svc"><div class="new-svc-icon">⚖️</div><div class="new-svc-name">Balans</div></div>
        <div class="new-svc"><div class="new-svc-icon">🚀</div><div class="new-svc-name">Groei</div></div>
        <div class="new-svc"><div class="new-svc-icon">🤝</div><div class="new-svc-name">1-op-1</div></div>
      </div>
    </div>`
  }
];

const baOld = document.getElementById('baOld');
const baNew = document.getElementById('baNew');

document.querySelectorAll('.ba-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.ba-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const idx = parseInt(tab.dataset.project);
    baOld.innerHTML = baProjects[idx].oldHTML;
    baNew.innerHTML = baProjects[idx].newHTML;
    baAfter.style.clipPath = 'inset(0 50% 0 0)';
    baDivider.style.left = '50%';
  });
});

// ===========================
// FAQ ACCORDION
// ===========================
document.querySelectorAll('.faq-q').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => {
      i.classList.remove('open');
      i.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
    });
    if (!isOpen) {
      item.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
    }
  });
});

// ===========================
// CONTACT FORM
// ===========================
document.getElementById('contactForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const success = document.getElementById('formSuccess');
  const btn = e.target.querySelector('button[type="submit"]');
  btn.disabled = true;
  btn.querySelector('.btn-text').textContent = 'Verzenden...';
  setTimeout(() => {
    success.classList.add('visible');
    btn.disabled = false;
    btn.querySelector('.btn-text').textContent = 'Verstuur aanvraag';
    e.target.reset();
    success.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 1200);
});
