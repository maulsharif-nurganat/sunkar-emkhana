import { db, collection, getDocs, query, orderBy, limit } from './firebase.js';

const DAYS = { mon: 'Пн', tue: 'Вт', wed: 'Ср', thu: 'Чт', fri: 'Пт', sat: 'Сб', sun: 'Вс' };
const DAYS_KZ = { mon: 'Дс', tue: 'Сс', wed: 'Ср', thu: 'Бс', fri: 'Жм', sat: 'Сб', sun: 'Жс' };

function getInitials(name) {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

function getNextAppointment(schedule) {
  const order = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  const today = new Date().getDay();
  const todayKey = order[(today === 0 ? 6 : today - 1)];
  const startIdx = order.indexOf(todayKey);
  for (let i = 0; i < 7; i++) {
    const key = order[(startIdx + i) % 7];
    if (schedule[key]) {
      const dayLabel = window.getCurrentLang?.() === 'kz' ? DAYS_KZ[key] : DAYS[key];
      return `${dayLabel} ${schedule[key]}`;
    }
  }
  return null;
}

function renderDoctorCard(doctor, lang) {
  const name = lang === 'kz' ? (doctor.name_kz || doctor.name_ru) : doctor.name_ru;
  const specialty = lang === 'kz' ? (doctor.specialty_kz || doctor.specialty_ru) : doctor.specialty_ru;
  const next = doctor.schedule ? getNextAppointment(doctor.schedule) : null;

  const card = document.createElement('a');
  card.href = `doctor.html?id=${doctor.id}`;
  card.className = 'doctor-card';
  card.innerHTML = `
    <div class="doctor-card__photo">
      ${doctor.photo
        ? `<img src="${doctor.photo}" alt="Фото врача ${name}" style="width:100%;height:100%;object-fit:cover" />`
        : `<span>${getInitials(name)}</span>`}
    </div>
    <p class="doctor-card__name">${name}</p>
    <p class="doctor-card__specialty">${specialty}</p>
    ${next ? `<p class="doctor-card__schedule">${window.t('doctors.nextAppointment')} ${next}</p>` : ''}
  `;
  return card;
}

async function loadDoctorsPreview() {
  const grid = document.getElementById('doctorsGrid');
  if (!grid) return;

  try {
    const lang = window.getCurrentLang?.() || 'ru';
    const q = query(collection(db, 'doctors'), orderBy('order'), limit(4));
    const snap = await getDocs(q);

    grid.innerHTML = '';
    if (snap.empty) {
      grid.innerHTML = `<p style="color:var(--text-sec)">${window.t('doctors.noResults')}</p>`;
      return;
    }
    snap.forEach(docSnap => {
      grid.appendChild(renderDoctorCard({ id: docSnap.id, ...docSnap.data() }, lang));
    });
  } catch (e) {
    console.error('doctors.js:', e);
    grid.innerHTML = '<p style="color:var(--text-sec)">Не удалось загрузить данные</p>';
  }
}

loadDoctorsPreview();
export { renderDoctorCard, getNextAppointment, DAYS, DAYS_KZ };
