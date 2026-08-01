// Side nav dots
const sideDots = document.querySelectorAll('.side-dot');
function updateDots() {
  let current = '';
  sections.forEach(s => {
    if (window.scrollY >= s.offsetTop - window.innerHeight / 2) current = s.id;
  });
  sideDots.forEach(dot => {
    dot.classList.toggle('active', dot.getAttribute('href') === `#${current}`);
  });
}

// Nav scroll effect + active link highlight (merged into one listener)
const nav = document.getElementById('nav');
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav__links a');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
  updateDots();
  let current = '';
  sections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 100) current = s.id;
  });
  navLinks.forEach(a => {
    a.style.color = a.getAttribute('href') === `#${current}` ? 'var(--accent)' : '';
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

document.querySelectorAll('.card, .pricing-card, .testimonial, .section-header, .process-card, .faq-item').forEach(el => {
  el.classList.add('fade-up');
  observer.observe(el);
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
// CONTACT FORM — verstuurt naar info@oogstweb.nl via FormSubmit
// ===========================
const contactForm = document.getElementById('contactForm');
contactForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const success = document.getElementById('formSuccess');
  const errorBox = document.getElementById('formError');
  const btn = e.target.querySelector('button[type="submit"]');
  const btnText = btn.querySelector('.btn-text');

  btn.disabled = true;
  btnText.textContent = 'Verzenden...';
  if (errorBox) errorBox.classList.remove('visible');

  try {
    const response = await fetch('https://formsubmit.co/ajax/samikuflom87@gmail.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        Naam: contactForm.naam.value,
        Email: contactForm.email.value,
        Dienst: contactForm.dienst.value || 'Niet opgegeven',
        Bericht: contactForm.bericht.value,
        _subject: 'Nieuwe aanvraag via oogstweb.nl',
        _template: 'table',
        _captcha: 'false'
      })
    });

    if (!response.ok) throw new Error('Verzenden mislukt');

    success.classList.add('visible');
    contactForm.reset();
    success.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  } catch (err) {
    if (errorBox) {
      errorBox.classList.add('visible');
      errorBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  } finally {
    btn.disabled = false;
    btnText.textContent = 'Verstuur aanvraag';
  }
});
