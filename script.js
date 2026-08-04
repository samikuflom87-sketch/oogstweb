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

// ===========================
// WEBSITE GROEISCAN — MODAL
// ===========================
(() => {
  const trigger = document.getElementById('scanTrigger');
  const overlay = document.getElementById('scanOverlay');
  if (!trigger || !overlay) return;

  const modal = overlay.querySelector('.scan-modal');
  const closeBtn = document.getElementById('scanClose');
  const form = document.getElementById('scanForm');
  const fill = document.getElementById('scanProgressFill');
  const stepLabel = document.getElementById('scanStepLabel');
  const percentLabel = document.getElementById('scanPercentLabel');
  const backBtn = document.getElementById('scanBack');
  const nextBtn = document.getElementById('scanNext');
  const submitBtn = document.getElementById('scanSubmit');
  const errorBox = document.getElementById('scanError');
  const scanHead = overlay.querySelector('.scan-head');

  const TOTAL_STEPS = 5;
  let current = 1;
  const answers = { branche: '', doel: '', situatie: '', budget: '' };

  function resetScan() {
    current = 1;
    Object.keys(answers).forEach(k => answers[k] = '');
    form.reset();
    overlay.querySelectorAll('.scan-option.selected').forEach(o => o.classList.remove('selected'));
    errorBox.classList.remove('visible');
    scanHead.style.display = '';
    render();
  }

  function render() {
    form.querySelectorAll('.scan-step').forEach(step => step.classList.remove('active'));
    const stepEl = form.querySelector(`.scan-step[data-step="${current}"]`);
    if (stepEl) stepEl.classList.add('active');

    const pct = Math.round((current / TOTAL_STEPS) * 100);
    fill.style.width = pct + '%';
    stepLabel.textContent = `Stap ${current} van ${TOTAL_STEPS}`;
    percentLabel.textContent = `${pct}% voltooid`;

    backBtn.style.display = current > 1 ? 'inline-flex' : 'none';
    const isLastStep = current === TOTAL_STEPS;
    nextBtn.style.display = (current < TOTAL_STEPS) ? 'inline-flex' : 'none';
    submitBtn.style.display = isLastStep ? 'inline-flex' : 'none';
  }

  function goNext() {
    if (current < TOTAL_STEPS) {
      current++;
      render();
    }
  }
  function goBack() {
    if (current > 1) {
      current--;
      render();
    }
  }

  function openScan(e) {
    if (e) e.preventDefault();
    resetScan();
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function closeScan() {
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  trigger.addEventListener('click', openScan);
  closeBtn.addEventListener('click', closeScan);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeScan(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && overlay.classList.contains('open')) closeScan(); });

  // Single-choice options (stappen 1-4): kies -> automatisch door naar volgende stap
  overlay.querySelectorAll('.scan-options').forEach(group => {
    const field = group.dataset.field;
    group.querySelectorAll('.scan-option').forEach(btn => {
      btn.addEventListener('click', () => {
        group.querySelectorAll('.scan-option').forEach(o => o.classList.remove('selected'));
        btn.classList.add('selected');
        answers[field] = btn.textContent.trim();
        setTimeout(goNext, 320);
      });
    });
  });

  backBtn.addEventListener('click', goBack);
  nextBtn.addEventListener('click', goNext);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Verzenden...';
    errorBox.classList.remove('visible');

    const naam = document.getElementById('scanNaam').value;
    const bedrijf = document.getElementById('scanBedrijf').value;
    const email = document.getElementById('scanEmail').value;
    const telefoon = document.getElementById('scanTelefoon').value;

    try {
      const response = await fetch('https://formsubmit.co/ajax/samikuflom87@gmail.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          Naam: naam,
          Bedrijf: bedrijf,
          Email: email,
          Telefoon: telefoon,
          Branche: answers.branche,
          Doel: answers.doel,
          'Website situatie': answers.situatie,
          Budget: answers.budget,
          _subject: 'Nieuwe OogstWeb groeiscan aanvraag',
          _template: 'table',
          _captcha: 'false'
        })
      });

      if (!response.ok) throw new Error('Verzenden mislukt');

      scanHead.style.display = 'none';
      form.querySelectorAll('.scan-step').forEach(step => step.classList.remove('active'));
      form.querySelector('.scan-step[data-step="success"]').classList.add('active');
      backBtn.style.display = 'none';
      nextBtn.style.display = 'none';
      submitBtn.style.display = 'none';
    } catch (err) {
      errorBox.classList.add('visible');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Verstuur mijn groeiscan';
    }
  });
})();
