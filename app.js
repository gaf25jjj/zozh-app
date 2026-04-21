const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
  tg.setHeaderColor('#0d1627');
  tg.setBackgroundColor('#09111f');
}

const initialStats = {
  health: 70,
  energy: 70,
  immunity: 70,
  stress: 30,
  risk: 25,
};

const scenes = [
  {
    art: '🌅',
    title: 'Утро начинается',
    text: 'Ты проснулся перед учёбой. Первый выбор влияет на концентрацию, обмен веществ и уровень энергии.',
    choices: [
      { label: 'Полезный завтрак', hint: 'Каша, яйца, вода, фрукты', effect: { health: 8, energy: 12, immunity: 4, risk: -4 }, feedback: 'Регулярный завтрак поддерживает энергию, улучшает концентрацию и помогает не переедать позже.' },
      { label: 'Пропустить завтрак', hint: 'Побегу как есть', effect: { energy: -10, stress: 4, risk: 4 }, feedback: 'Пропуск завтрака повышает утомляемость и может провоцировать переедание в течение дня.' },
      { label: 'Сладкая газировка и булочка', hint: 'Быстро, но не лучшая идея', effect: { energy: 2, health: -5, risk: 7 }, feedback: 'Избыток быстрых углеводов даёт краткий всплеск энергии, после которого часто следует спад.' },
    ]
  },
  {
    art: '🧼',
    title: 'Перед выходом',
    text: 'Ты собираешься на занятия. Вокруг много поверхностей и контактов с людьми.',
    choices: [
      { label: 'Помыть руки и взять воду', hint: 'Базовая гигиена и питьевой режим', effect: { immunity: 8, health: 4, risk: -6 }, feedback: 'Гигиена рук — один из самых простых и эффективных способов профилактики инфекций.' },
      { label: 'Просто выйти', hint: 'Без подготовки', effect: { risk: 4, immunity: -4 }, feedback: 'Игнорирование базовой гигиены повышает вероятность передачи возбудителей через руки.' },
      { label: 'Взять энергетик вместо воды', hint: 'Ложное ощущение бодрости', effect: { energy: 4, stress: 6, risk: 5, health: -3 }, feedback: 'Избыточное употребление энергетиков может усиливать тревожность и нарушать режим сна.' },
    ]
  },
  {
    art: '🚶',
    title: 'Дорога и активность',
    text: 'Тебе нужно добраться до учёбы. Есть шанс добавить немного движения в день.',
    choices: [
      { label: 'Пройти часть пути пешком', hint: 'Активность + свежий воздух', effect: { health: 8, energy: 5, stress: -4, risk: -4 }, feedback: 'Умеренная ежедневная физическая активность снижает риск сердечно‑сосудистых заболеваний и помогает справляться со стрессом.' },
      { label: 'Только сидеть и ехать', hint: 'Минимум движения', effect: { health: -4, risk: 4, stress: 2 }, feedback: 'Гиподинамия — важный фактор риска для обменных и сердечно‑сосудистых нарушений.' },
      { label: 'Побежать, потому что опаздываешь', hint: 'Стрессовый режим', effect: { energy: -6, stress: 8 }, feedback: 'Нарушение режима и хронические опоздания повышают стрессовую нагрузку в течение дня.' },
    ]
  },
  {
    art: '🍽️',
    title: 'Обеденный выбор',
    text: 'Наступил обед. От состава пищи зависит не только сытость, но и профилактика хронических заболеваний.',
    choices: [
      { label: 'Суп, второе, салат и вода', hint: 'Сбалансированный вариант', effect: { health: 10, energy: 8, immunity: 4, risk: -6 }, feedback: 'Сбалансированное питание помогает контролировать массу тела и снижает долгосрочные риски.' },
      { label: 'Фастфуд и сладкий напиток', hint: 'Быстро, вкусно, но...', effect: { energy: 3, health: -8, risk: 10, stress: 2 }, feedback: 'Частое употребление фастфуда связано с повышением риска ожирения и метаболических нарушений.' },
      { label: 'Вообще не обедать', hint: 'Потом перехвачу', effect: { energy: -12, stress: 5, risk: 5 }, feedback: 'Нерегулярное питание ухудшает работоспособность и нередко приводит к перееданию вечером.' },
    ]
  },
  {
    art: '📱',
    title: 'Вечер после учёбы',
    text: 'Ты дома. Нужно решить, как провести остаток дня: восстановиться или перегрузить организм.',
    choices: [
      { label: 'Немного отдохнуть и сделать зарядку', hint: 'Баланс отдыха и движения', effect: { health: 9, energy: 5, stress: -7, risk: -4 }, feedback: 'Короткая физическая активность вечером улучшает самочувствие и помогает снять умственное напряжение.' },
      { label: 'Лежать и листать телефон 4 часа', hint: 'Пассивный отдых', effect: { energy: -4, stress: 6, health: -4, risk: 4 }, feedback: 'Избыточное экранное время связано с гиподинамией, нарушением сна и повышенной утомляемостью.' },
      { label: 'Выпить ещё энергетик и учиться до ночи', hint: 'Цена продуктивности', effect: { energy: 3, stress: 10, immunity: -6, risk: 7 }, feedback: 'Стимуляторы и поздняя нагрузка ухудшают восстановление и могут снижать устойчивость организма.' },
    ]
  },
  {
    art: '🌙',
    title: 'Сон и восстановление',
    text: 'Финальный выбор дня — во сколько лечь спать. Именно здесь формируется качество восстановления.',
    choices: [
      { label: 'Лечь вовремя', hint: '7–9 часов сна', effect: { health: 12, energy: 10, immunity: 8, stress: -6, risk: -5 }, feedback: 'Достаточный сон важен для памяти, иммунной защиты и профилактики переутомления.' },
      { label: 'Заснуть после 2 ночи', hint: 'Режим сбивается', effect: { energy: -14, immunity: -8, stress: 6, risk: 8 }, feedback: 'Хроническое недосыпание ухудшает концентрацию, повышает стресс и снижает адаптационные возможности организма.' },
      { label: 'Смотреть видео до утра', hint: 'Почти без сна', effect: { energy: -18, health: -10, immunity: -10, stress: 8, risk: 10 }, feedback: 'Резкое ограничение сна нарушает восстановление и отрицательно влияет на общее здоровье.' },
    ]
  }
];

let stats = { ...initialStats };
let currentScene = 0;

const els = {
  sceneIndex: document.getElementById('sceneIndex'),
  sceneArt: document.getElementById('sceneArt'),
  sceneTitle: document.getElementById('sceneTitle'),
  sceneText: document.getElementById('sceneText'),
  choices: document.getElementById('choices'),
  feedbackBox: document.getElementById('feedbackBox'),
  feedbackText: document.getElementById('feedbackText'),
  nextBtn: document.getElementById('nextBtn'),
  resultBox: document.getElementById('resultBox'),
  resultIcon: document.getElementById('resultIcon'),
  resultTitle: document.getElementById('resultTitle'),
  resultText: document.getElementById('resultText'),
  recommendations: document.getElementById('recommendations'),
  restartBtn: document.getElementById('restartBtn'),
  shareBtn: document.getElementById('shareBtn'),
};

const valueEls = {
  health: document.getElementById('healthValue'),
  energy: document.getElementById('energyValue'),
  immunity: document.getElementById('immunityValue'),
  stress: document.getElementById('stressValue'),
  risk: document.getElementById('riskValue'),
};

const barEls = {
  health: document.getElementById('healthBar'),
  energy: document.getElementById('energyBar'),
  immunity: document.getElementById('immunityBar'),
  stress: document.getElementById('stressBar'),
  risk: document.getElementById('riskBar'),
};

function clamp(v) { return Math.max(0, Math.min(100, v)); }

function applyEffect(effect) {
  Object.keys(effect).forEach((key) => {
    stats[key] = clamp(stats[key] + effect[key]);
  });
}

function renderStats() {
  Object.keys(stats).forEach((key) => {
    valueEls[key].textContent = stats[key];
    barEls[key].style.width = `${stats[key]}%`;
  });
}

function renderScene() {
  const scene = scenes[currentScene];
  els.sceneIndex.textContent = `Сцена ${currentScene + 1}/${scenes.length}`;
  els.sceneArt.textContent = scene.art;
  els.sceneTitle.textContent = scene.title;
  els.sceneText.textContent = scene.text;
  els.feedbackBox.classList.add('hidden');
  els.choices.innerHTML = '';

  scene.choices.forEach((choice) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'choice-btn';
    btn.innerHTML = `<strong>${choice.label}</strong><small>${choice.hint}</small>`;
    btn.addEventListener('click', () => {
      applyEffect(choice.effect);
      renderStats();
      els.feedbackText.textContent = choice.feedback;
      els.feedbackBox.classList.remove('hidden');
      [...els.choices.querySelectorAll('button')].forEach((b) => b.disabled = true);
    });
    els.choices.appendChild(btn);
  });
}

function getResult() {
  const protective = (stats.health + stats.energy + stats.immunity) / 3;
  const adverse = (stats.stress + stats.risk) / 2;
  const score = protective - adverse;

  if (score >= 45) {
    return {
      icon: '🏆',
      title: 'Отличный профилактический результат',
      text: 'Твой выбор в течение дня соответствовал принципам здорового образа жизни. Такой режим помогает поддерживать работоспособность, снижать уровень стресса и уменьшать риск развития хронических заболеваний.',
      recs: [
        'Сохраняй регулярный режим сна и питания.',
        'Продолжай поддерживать ежедневную физическую активность.',
        'Не забывай, что простые гигиенические привычки дают большой профилактический эффект.'
      ]
    };
  }
  if (score >= 20) {
    return {
      icon: '👍',
      title: 'Хороший результат, но есть точки роста',
      text: 'У тебя уже есть полезные привычки, но часть решений повышала утомляемость, стресс или риск заболеваний. Небольшие изменения могут заметно улучшить самочувствие.',
      recs: [
        'Сделай сон более регулярным.',
        'Сократи фастфуд и сладкие напитки.',
        'Добавь больше ходьбы и коротких разминок в день.'
      ]
    };
  }
  return {
    icon: '⚠️',
    title: 'Рискованный образ дня',
    text: 'Многие решения в течение дня увеличивали стресс, снижали энергию и иммунитет. Такой режим при повторении может способствовать развитию нарушений сна, переутомления и других проблем со здоровьем.',
    recs: [
      'Начни с базового: вовремя спать и регулярно завтракать.',
      'Минимизируй энергетики и чрезмерное экранное время вечером.',
      'Не пропускай движение и базовую гигиену рук.'
    ]
  };
}

function showResult() {
  document.querySelector('.scene-card').classList.add('hidden');
  els.resultBox.classList.remove('hidden');
  const result = getResult();
  els.resultIcon.textContent = result.icon;
  els.resultTitle.textContent = result.title;
  els.resultText.textContent = result.text;
  els.recommendations.innerHTML = '';
  result.recs.forEach((r) => {
    const card = document.createElement('div');
    card.textContent = r;
    els.recommendations.appendChild(card);
  });
}

els.nextBtn.addEventListener('click', () => {
  currentScene += 1;
  if (currentScene >= scenes.length) {
    showResult();
    return;
  }
  renderScene();
});

els.restartBtn.addEventListener('click', resetGame);
els.shareBtn.addEventListener('click', () => {
  const result = getResult();
  const payload = {
    type: 'zozh_result',
    title: result.title,
    health: stats.health,
    energy: stats.energy,
    immunity: stats.immunity,
    stress: stats.stress,
    risk: stats.risk,
  };
  if (tg) {
    tg.sendData(JSON.stringify(payload));
    tg.showAlert('Результат отправлен в чат с ботом.');
  } else {
    alert('Результат готов. В Telegram его можно отправить обратно в чат.');
  }
});

function resetGame() {
  stats = { ...initialStats };
  currentScene = 0;
  renderStats();
  els.resultBox.classList.add('hidden');
  document.querySelector('.scene-card').classList.remove('hidden');
  renderScene();
}

resetGame();
