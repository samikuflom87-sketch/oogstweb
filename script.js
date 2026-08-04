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
  const triggers = document.querySelectorAll('#scanTrigger, .js-scan-trigger');
  const overlay = document.getElementById('scanOverlay');
  if (!triggers.length || !overlay) return;

  const introScreen = document.getElementById('scanIntroScreen');
  const startBtn = document.getElementById('scanStart');
  const quiz = document.getElementById('scanQuiz');
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
  const growthStages = overlay.querySelectorAll('.scan-growthline__stage');
  const growthLines = overlay.querySelectorAll('.scan-growthline__line');

  const MAIN_STEPS = 6; // vragenstappen die meetellen in "Stap X van 6"
  let current = 1;
  const answers = { branche: '', grootte: '', type: '', vervolg: '', kanaal: '', uitdaging: '', tijdstip: '' };

  // Vervolgvraag op stap 4 hangt af van het antwoord op stap 3 ("Waar ben je naar op zoek?")
  const followUps = {
    webshop: {
      hint: 'Goed, dan kijken we specifiek naar jouw webshop-mogelijkheden.',
      question: 'Wat verkoop je (of wil je gaan verkopen)?',
      options: ['Producten', 'Diensten', 'Digitale producten', 'Ik wil starten']
    },
    nieuw: {
      hint: '',
      question: 'Waarom wil je een nieuwe website?',
      options: ['Mijn huidige website ziet er oud uit', 'Ik krijg te weinig aanvragen', 'Mijn bedrijf is gegroeid', 'Ik heb nog geen website']
    },
    algemeen: {
      hint: '',
      question: 'Wat vind je het belangrijkst in een nieuwe website?',
      options: ['Snel online kunnen', 'Een betaalbare oplossing', 'Persoonlijk advies', 'Ik weet het nog niet']
    }
  };

  function followUpKeyFor(typeAnswer) {
    if (typeAnswer === 'Webshop' || typeAnswer === 'Website + webshop') return 'webshop';
    if (typeAnswer === 'Nieuwe bedrijfswebsite' || typeAnswer === 'Website verbeteren') return 'nieuw';
    return 'algemeen';
  }

  function applyFollowUp(typeAnswer) {
    const key = followUpKeyFor(typeAnswer);
    const data = followUps[key];
    const hintEl = document.getElementById('scanHint4');
    const questionEl = document.getElementById('scanQuestion4');
    const optionsEl = document.getElementById('scanOptions4');
    hintEl.textContent = data.hint;
    hintEl.style.display = data.hint ? '' : 'none';
    questionEl.textContent = data.question;
    optionsEl.innerHTML = data.options.map(opt => `<button type="button" class="scan-option">${opt}</button>`).join('');
    bindOptionGroup(optionsEl);
  }

  function resetScan() {
    current = 1;
    Object.keys(answers).forEach(k => answers[k] = '');
    form.reset();
    overlay.querySelectorAll('.scan-option.selected, .scan-pill.selected').forEach(o => o.classList.remove('selected'));
    errorBox.classList.remove('visible');
    scanHead.style.display = '';
    form.querySelectorAll('.scan-step').forEach(step => step.classList.remove('active'));
    introScreen.classList.add('active');
    quiz.classList.remove('active');
    applyFollowUp('');
    render();
  }

  function updateGrowthLine() {
    let stageIndex; // 0 = idee, 1 = analyse, 2 = groei
    if (current <= 2) stageIndex = 0;
    else if (current <= MAIN_STEPS) stageIndex = 1;
    else stageIndex = 2;

    growthStages.forEach((el, i) => {
      el.classList.toggle('done', i < stageIndex);
      el.classList.toggle('current', i === stageIndex);
    });
    growthLines.forEach((el, i) => {
      el.classList.toggle('done', i < stageIndex);
    });
  }

  function render() {
    form.querySelectorAll('.scan-step').forEach(step => step.classList.remove('active'));
    const stepEl = form.querySelector(`.scan-step[data-step="${current}"]`);
    if (stepEl) stepEl.classList.add('active');

    const cappedStep = Math.min(current, MAIN_STEPS);
    const pct = Math.round((cappedStep / MAIN_STEPS) * 100);
    fill.style.width = pct + '%';
    stepLabel.textContent = current <= MAIN_STEPS ? `Stap ${current} van ${MAIN_STEPS}` : 'Bijna klaar';
    percentLabel.textContent = `${pct}% voltooid`;
    updateGrowthLine();

    const isContactStep = current === MAIN_STEPS + 1;
    backBtn.style.display = current > 1 ? 'inline-flex' : 'none';
    nextBtn.style.display = (!isContactStep) ? 'inline-flex' : 'none';
    submitBtn.style.display = isContactStep ? 'inline-flex' : 'none';
  }

  function goNext() {
    if (current < MAIN_STEPS + 1) {
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
    sessionStorage.setItem('scanAutoShown', '1');
  }
  function closeScan() {
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
  }

  triggers.forEach(t => t.addEventListener('click', openScan));
  closeBtn.addEventListener('click', closeScan);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && overlay.classList.contains('open')) closeScan(); });

  startBtn.addEventListener('click', () => {
    introScreen.classList.remove('active');
    quiz.classList.add('active');
  });

  // Automatisch openen bij eerste bezoek van de sessie (niet als de gebruiker 'm al zelf geopend heeft)
  if (!sessionStorage.getItem('scanAutoShown')) {
    setTimeout(() => {
      if (!sessionStorage.getItem('scanAutoShown')) openScan();
    }, 1800);
  }

  // Single-choice options: kies -> automatisch door naar volgende stap
  function bindOptionGroup(group) {
    const field = group.dataset.field;
    group.querySelectorAll('.scan-option').forEach(btn => {
      btn.addEventListener('click', () => {
        group.querySelectorAll('.scan-option').forEach(o => o.classList.remove('selected'));
        btn.classList.add('selected');
        const label = btn.textContent.trim();
        answers[field] = label;
        if (field === 'type') applyFollowUp(label);
        setTimeout(goNext, 320);
      });
    });
  }
  overlay.querySelectorAll('.scan-options').forEach(bindOptionGroup);

  // Tijdstip-pills (geen auto-advance, onderdeel van het contactformulier)
  overlay.querySelectorAll('.scan-pills').forEach(group => {
    const field = group.dataset.field;
    group.querySelectorAll('.scan-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        group.querySelectorAll('.scan-pill').forEach(o => o.classList.remove('selected'));
        btn.classList.add('selected');
        answers[field] = btn.textContent.trim();
      });
    });
  });

  backBtn.addEventListener('click', goBack);
  nextBtn.addEventListener('click', goNext);

  function isValidPhone(value) {
    const digits = value.replace(/[^0-9]/g, '');
    return digits.length >= 8;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    const telInput = document.getElementById('scanTelefoon');
    if (!isValidPhone(telInput.value)) {
      telInput.setCustomValidity('Vul een geldig telefoonnummer in (minimaal 8 cijfers).');
      telInput.reportValidity();
      telInput.addEventListener('input', () => telInput.setCustomValidity(''), { once: true });
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Verzenden...';
    errorBox.classList.remove('visible');

    const naam = document.getElementById('scanNaam').value;
    const bedrijf = document.getElementById('scanBedrijf').value;
    const website = document.getElementById('scanWebsite').value;
    const email = document.getElementById('scanEmail').value;
    const telefoon = document.getElementById('scanTelefoon').value;

    try {
      const response = await fetch('https://formsubmit.co/ajax/samikuflom87@gmail.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          Naam: naam,
          Bedrijf: bedrijf,
          'Huidige website': website || 'Niet opgegeven',
          Email: email,
          Telefoon: telefoon,
          Branche: answers.branche,
          Bedrijfsgrootte: answers.grootte,
          'Waar naar op zoek': answers.type,
          Vervolgantwoord: answers.vervolg,
          'Hoe komen klanten binnen': answers.kanaal,
          'Grootste uitdaging': answers.uitdaging,
          'Voorkeur contactmoment': answers.tijdstip || 'Geen voorkeur',
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
      submitBtn.textContent = 'Ontvang mijn gratis website-analyse';
    }
  });

  const backToSiteBtn = document.getElementById('scanBackToSite');
  if (backToSiteBtn) backToSiteBtn.addEventListener('click', closeScan);
})();
