import { db, collection, getDocs, query, orderBy, limit, where } from './firebase.js';

function formatDate(ts) {
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
}

function renderNewsCard(item, lang) {
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

  try {
    const lang = window.getCurrentLang?.() || 'ru';
    const q = query(collection(db, 'news'), orderBy('date', 'desc'), limit(2));
    const snap = await getDocs(q);

    grid.innerHTML = '';
    if (snap.empty) {
      grid.innerHTML = `<p style="color:var(--text-sec)">${window.t('news.noNews')}</p>`;
      return;
    }
    snap.forEach(docSnap => {
      grid.appendChild(renderNewsCard({ id: docSnap.id, ...docSnap.data() }, lang));
    });
  } catch (e) {
    console.error('news.js:', e);
    grid.innerHTML = '<p style="color:var(--text-sec)">Не удалось загрузить данные</p>';
  }
}

loadNewsPreview();
export { renderNewsCard, formatDate };
