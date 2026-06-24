// Nav scroll effect
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
});

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
        requestAnimationFrame(() => card.classList.remove('hidden'));
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
const baSlider = document.getElementById('baSlider');
const baAfter  = document.getElementById('baAfter');
const baDivider = document.getElementById('baDivider');
let dragging = false;

function setSliderPos(x) {
  const rect = baSlider.getBoundingClientRect();
  let pct = (x - rect.left) / rect.width;
  pct = Math.max(0.04, Math.min(0.96, pct));
  const rightPct = (1 - pct) * 100;
  baAfter.style.clipPath = `inset(0 ${rightPct}% 0 0)`;
  baDivider.style.left = `${pct * 100}%`;
}

baSlider.addEventListener('mousedown', e => { dragging = true; setSliderPos(e.clientX); });
window.addEventListener('mousemove', e => { if (dragging) setSliderPos(e.clientX); });
window.addEventListener('mouseup', () => { dragging = false; });

baSlider.addEventListener('touchstart', e => { dragging = true; setSliderPos(e.touches[0].clientX); }, { passive: true });
window.addEventListener('touchmove', e => { if (dragging) setSliderPos(e.touches[0].clientX); }, { passive: true });
window.addEventListener('touchend', () => { dragging = false; });

// Project data for before/after tabs
const baProjects = [
  {
    oldStyle: 'background: linear-gradient(135deg,#d4d4d4,#b0b0b0)',
    newStyle: 'background: linear-gradient(135deg,#1a1a2e,#16213e)',
    oldNav: '#003580',
    oldHero: '#ffd700',
    newHeroClass: 'nm0-hero',
    label: 'Bloem & Stijl'
  },
  {
    oldStyle: 'background: linear-gradient(135deg,#c8d6c8,#aab8aa)',
    newStyle: 'background: linear-gradient(135deg,#0f2027,#203a43)',
    oldNav: '#2c5a2c',
    oldHero: '#a8c5a8',
    newHeroClass: 'nm1-hero',
    label: 'De Groene Loodgieter'
  },
  {
    oldStyle: 'background: linear-gradient(135deg,#e0d0e0,#c0b0c0)',
    newStyle: 'background: linear-gradient(135deg,#1c1c3a,#2d2d5e)',
    oldNav: '#6d3d6d',
    oldHero: '#e8c8e8',
    newHeroClass: 'nm2-hero',
    label: 'Studio Rosa'
  }
];

document.querySelectorAll('.ba-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.ba-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const idx = +tab.dataset.project;
    const p = baProjects[idx];
    const oldScreen = baSlider.querySelector('.ba-screen--old');
    const newScreen = baSlider.querySelector('.ba-screen--new');
    oldScreen.style.cssText = p.oldStyle;
    newScreen.style.cssText = p.newStyle;
    oldScreen.querySelector('.old-nav').style.background = p.oldNav;
    oldScreen.querySelector('.old-hero').style.background = p.oldHero;
    // reset slider to 50%
    baAfter.style.clipPath = 'inset(0 50% 0 0)';
    baDivider.style.left = '50%';
  });
});

// Contact form
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

// Smooth nav active state
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav__links a');
window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 100) current = s.id;
  });
  navLinks.forEach(a => {
    a.style.color = a.getAttribute('href') === `#${current}` ? 'var(--green)' : '';
  });
}, { passive: true });
