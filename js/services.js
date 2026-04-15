/* Renders services from data/services.json grouped by category */
async function loadServices(containerId, maxCategories) {
  const container = document.getElementById(containerId);
  if (!container) return;

  try {
    const lang = window.getCurrentLang?.() || 'ru';
    const res = await fetch('/data/services.json');
    const services = await res.json();

    // Group by category
    const grouped = services.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {});

    const categories = Object.keys(grouped);
    const toRender = maxCategories ? categories.slice(0, maxCategories) : categories;

    container.innerHTML = toRender.map(cat => `
      <div class="services-category">
        <p class="services-category__title">${cat}</p>
        <div class="services-category__items">
          ${grouped[cat].map(s => `
            <div class="service-item">${lang === 'kz' ? (s.kz || s.ru) : s.ru}</div>
          `).join('')}
        </div>
      </div>
    `).join('');
  } catch (e) {
    console.error('services.js:', e);
  }
}

loadServices('servicesList', 3);
