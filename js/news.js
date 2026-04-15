function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
}

function renderNewsCard(item) {
  const lang  = window.getCurrentLang?.() || 'ru';
  const title = lang === 'kz' ? (item.title_kz || item.title_ru) : item.title_ru;
  const body  = lang === 'kz' ? (item.body_kz  || item.body_ru)  : item.body_ru;

  const card = document.createElement('div');
  card.className = `news-card${item.pinned ? ' news-card--pinned' : ''}`;
  card.innerHTML = `
    ${item.pinned ? `<span class="news-card__badge">${window.t('news.pinned')}</span>` : ''}
    <p class="news-card__date">${formatDate(item.date)}</p>
    <h3 class="news-card__title">${title}</h3>
    <p class="news-card__body">${body || ''}</p>
  `;
  return card;
}

async function loadNewsPreview() {
  const grid = document.getElementById('newsGrid');
  if (!grid) return;

  const { data, error } = await db
    .from('news')
    .select('*')
    .order('date', { ascending: false })
    .limit(2);

  grid.innerHTML = '';
  if (error || !data?.length) {
    grid.innerHTML = `<p style="color:var(--text-sec)">${window.t('news.noNews')}</p>`;
    return;
  }
  data.forEach(item => grid.appendChild(renderNewsCard(item)));
}

loadNewsPreview();
