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

document.querySelectorAll('.card, .step, .pricing-card, .testimonial, .section-header').forEach(el => {
  el.classList.add('fade-up');
  observer.observe(el);
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
