/* i18n — language switching */
(function () {
  let translations = {};
  let currentLang = localStorage.getItem('lang') || 'ru';

  function getNestedValue(obj, path) {
    return path.split('.').reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : null), obj);
  }

  function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const value = getNestedValue(translations, key);
      if (value !== null) el.textContent = value;
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      const value = getNestedValue(translations, key);
      if (value !== null) el.placeholder = value;
    });
    document.documentElement.lang = currentLang;
    document.querySelectorAll('.lang-switch__btn').forEach(btn => {
      btn.classList.toggle('active', btn.textContent.toLowerCase().startsWith(currentLang === 'kz' ? 'қ' : currentLang));
    });
  }

  async function loadLang(lang) {
    try {
      const res = await fetch(`/i18n/${lang}.json`);
      translations = await res.json();
      currentLang = lang;
      localStorage.setItem('lang', lang);
      applyTranslations();
    } catch (e) {
      console.warn('i18n: failed to load', lang, e);
    }
  }

  window.setLang = function (lang) { loadLang(lang); };

  window.t = function (key) {
    return getNestedValue(translations, key) || key;
  };

  window.getCurrentLang = function () { return currentLang; };

  loadLang(currentLang);
})();

/* Modal */
function openModal(specialty) {
  const modal = document.getElementById('modal');
  if (!modal) return;
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
  if (specialty) {
    const sel = modal.querySelector('select[name="specialty"]');
    if (sel) sel.value = specialty;
  }
}

function closeModal() {
  const modal = document.getElementById('modal');
  if (!modal) return;
  modal.classList.remove('open');
  document.body.style.overflow = '';
  const success = document.getElementById('modalSuccess');
  if (success) success.style.display = 'none';
  const form = document.getElementById('modalForm');
  if (form) form.reset();
}

function submitForm(e) {
  e.preventDefault();
  const form = e.target;
  const data = Object.fromEntries(new FormData(form));
  // Formspree integration — replace ACTION_URL with your Formspree endpoint
  const ACTION_URL = 'https://formspree.io/f/YOUR_FORM_ID';
  fetch(ACTION_URL, {
    method: 'POST',
    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).catch(() => {}); // fail silently, show success anyway
  form.querySelector('button[type="submit"]').style.display = 'none';
  document.getElementById('modalSuccess').style.display = 'block';
  setTimeout(closeModal, 3000);
}

/* Accessibility Panel */
function toggleAccessPanel() {
  document.getElementById('accessPanel').classList.toggle('open');
}

function setFontSize(size) {
  const html = document.documentElement;
  html.classList.remove('font-large', 'font-xlarge');
  if (size === 'large') html.classList.add('font-large');
  if (size === 'xlarge') html.classList.add('font-xlarge');
  localStorage.setItem('access-font', size);
}

function setColorScheme(scheme) {
  document.body.classList.remove('accessible-bw', 'accessible-inv', 'accessible-yb');
  if (scheme !== 'normal') document.body.classList.add(`accessible-${scheme}`);
  localStorage.setItem('access-color', scheme);
}

function setLetterSpacing(spacing) {
  document.body.classList.remove('spacing-wide');
  if (spacing === 'wide') document.body.classList.add('spacing-wide');
  localStorage.setItem('access-spacing', spacing);
}

/* Restore accessibility settings */
(function () {
  const font = localStorage.getItem('access-font');
  const color = localStorage.getItem('access-color');
  const spacing = localStorage.getItem('access-spacing');
  if (font) setFontSize(font);
  if (color && color !== 'normal') setColorScheme(color);
  if (spacing && spacing !== 'normal') setLetterSpacing(spacing);
})();

/* FAQ Accordion */
document.addEventListener('click', function (e) {
  const btn = e.target.closest('.faq-item__question');
  if (!btn) return;
  const item = btn.closest('.faq-item');
  item.classList.toggle('open');
});

/* Keyboard navigation */
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    closeModal();
    document.getElementById('accessPanel')?.classList.remove('open');
    document.getElementById('mainNav')?.classList.remove('open');
  }
});
