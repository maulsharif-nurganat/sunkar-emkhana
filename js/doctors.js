const DAYS    = { mon:'Пн', tue:'Вт', wed:'Ср', thu:'Чт', fri:'Пт', sat:'Сб', sun:'Вс' };
const DAYS_KZ = { mon:'Дс', tue:'Сс', wed:'Ср', thu:'Бс', fri:'Жм', sat:'Сб', sun:'Жс' };

function getInitials(name) {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

function getNextAppointment(schedule) {
  if (!schedule) return null;
  const order = ['mon','tue','wed','thu','fri','sat','sun'];
  const todayIdx = (new Date().getDay() + 6) % 7;
  for (let i = 0; i < 7; i++) {
    const key = order[(todayIdx + i) % 7];
    if (schedule[key]) {
      const map = window.getCurrentLang?.() === 'kz' ? DAYS_KZ : DAYS;
      return `${map[key]} ${schedule[key]}`;
    }
  }
  return null;
}

function renderDoctorCard(doctor) {
  const lang = window.getCurrentLang?.() || 'ru';
  const name      = lang === 'kz' ? (doctor.name_kz      || doctor.name_ru)      : doctor.name_ru;
  const specialty = lang === 'kz' ? (doctor.specialty_kz || doctor.specialty_ru) : doctor.specialty_ru;
  const next = getNextAppointment(doctor.schedule);

  const card = document.createElement('a');
  card.href = `doctor.html?id=${doctor.id}`;
  card.className = 'doctor-card';
  card.innerHTML = `
    <div class="doctor-card__photo">
      ${doctor.photo
        ? `<img src="${doctor.photo}" alt="Фото врача ${name}" style="width:100%;height:100%;object-fit:cover"/>`
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

  const { data, error } = await db
    .from('doctors')
    .select('*')
    .order('order', { ascending: true })
    .limit(4);

  grid.innerHTML = '';
  if (error || !data?.length) {
    grid.innerHTML = `<p style="color:var(--text-sec)">${window.t('doctors.noResults')}</p>`;
    return;
  }
  data.forEach(doc => grid.appendChild(renderDoctorCard(doc)));
}

loadDoctorsPreview();
