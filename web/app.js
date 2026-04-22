const GAME_DAYS = 7;

const state = {
  day: 1,
  phaseIndex: 0,
  choiceIndexInPhase: 0,
  stats: {
    health: 65,
    energy: 60,
    stress: 35,
    hydration: 55,
    sleep: 60
  },
  feedback: "",
  history: [],
  mealHistory: [],
  dailyMealOptions: {},
  previousMealSets: {},
  lastActivityChoice: null,
  activeEvent: null
};

const phaseOrder = ["morning", "day", "evening"];

const phaseContent = {
  morning: [
    {
      id: "wake_routine",
      title: "Что сделать после пробуждения?",
      choices: [
        {
          label: "Ранняя зарядка 💪",
          subtitle: "+энергия, но можно устать",
          effects: { health: 6, energy: 7, stress: -4, hydration: -5, sleep: -1 }
        },
        {
          label: "Полежать в телефоне 📱",
          subtitle: "быстрый дофамин, хуже фокус",
          effects: { health: -2, energy: -3, stress: 4, hydration: -2, sleep: -2 }
        },
        {
          label: "Пропустить рутину 😴",
          subtitle: "чуть больше сна, меньше продуктивности",
          effects: { health: -1, energy: 3, stress: 2, hydration: -1, sleep: 3 }
        }
      ]
    },
    {
      id: "breakfast",
      title: "Выбери завтрак",
      choices: []
    }
  ],
  day: [
    {
      id: "day_activity",
      title: "Чем заняться днём?",
      choices: [
        {
          label: "Прогулка 🚶",
          subtitle: "освежает, но зависит от погоды",
          effects: { health: 5, energy: 3, stress: -4, hydration: -4, sleep: 1 }
        },
        {
          label: "Учёба/работа продуктивно 📚",
          subtitle: "прогресс, но может поднять стресс",
          effects: { health: 1, energy: -2, stress: 4, hydration: -2, sleep: 0 }
        },
        {
          label: "Сидеть весь день 🪑",
          subtitle: "экономия сил сейчас, хуже самочувствие",
          effects: { health: -4, energy: -3, stress: 2, hydration: -1, sleep: -1 }
        },
        {
          label: "Встретиться с друзьями 🍻",
          subtitle: "эмоции +, режим может пострадать",
          effects: { health: -1, energy: -1, stress: -5, hydration: -3, sleep: -2 }
        }
      ]
    },
    {
      id: "lunch",
      title: "Выбери обед",
      choices: []
    }
  ],
  evening: [
    {
      id: "evening_activity",
      title: "Вечерняя активность",
      choices: [
        {
          label: "Пойти в зал 🏋️",
          subtitle: "сильный плюс здоровью, расход энергии",
          effects: { health: 7, energy: -6, stress: -3, hydration: -5, sleep: 2 }
        },
        {
          label: "Смотреть сериал 📺",
          subtitle: "отдых без нагрузки",
          effects: { health: -1, energy: 2, stress: -1, hydration: -1, sleep: -1 }
        },
        {
          label: "Соцсети 📱",
          subtitle: "легко залипнуть",
          effects: { health: -3, energy: -2, stress: 4, hydration: -1, sleep: -3 }
        },
        {
          label: "Спокойный релакс 🧘",
          subtitle: "снижает напряжение",
          effects: { health: 3, energy: 3, stress: -5, hydration: 1, sleep: 2 }
        }
      ]
    },
    {
      id: "sleep_decision",
      title: "Решение по сну",
      choices: [
        {
          label: "Лечь пораньше 😴",
          subtitle: "лучшее восстановление",
          effects: { health: 4, energy: 8, stress: -3, hydration: 0, sleep: 8 }
        },
        {
          label: "Поздно лечь 🌙",
          subtitle: "средний компромисс",
          effects: { health: -1, energy: -2, stress: 2, hydration: 0, sleep: -4 }
        },
        {
          label: "Очень поздно лечь 🌃",
          subtitle: "максимальный сбой режима",
          effects: { health: -4, energy: -7, stress: 5, hydration: -1, sleep: -9 }
        }
      ]
    }
  ]
};

const FOOD_ITEMS = [
  { name: "Овсянка 🥣", category: "healthy_meals", tags: ["meal"], effects: { health: 8, energy: 6, stress: -3, hydration: 2, sleep: 1 } },
  { name: "Яйца 🍳", category: "healthy_meals", tags: ["meal"], effects: { health: 7, energy: 7, stress: -2, hydration: 1, sleep: 0 } },
  { name: "Лосось 🐟", category: "healthy_meals", tags: ["meal"], effects: { health: 9, energy: 5, stress: -3, hydration: 1, sleep: 1 } },
  { name: "Салат 🥗", category: "healthy_meals", tags: ["meal"], effects: { health: 8, energy: 3, stress: -2, hydration: 4, sleep: 0 } },
  { name: "Смузи 🥤", category: "healthy_meals", tags: ["meal", "hydration"], effects: { health: 6, energy: 4, stress: -1, hydration: 6, sleep: 0 } },

  { name: "Бургер 🍔", category: "fast_food", tags: ["junk"], effects: { health: -8, energy: 7, stress: 2, hydration: -4, sleep: -1 } },
  { name: "Картошка фри 🍟", category: "fast_food", tags: ["junk"], effects: { health: -7, energy: 5, stress: 2, hydration: -5, sleep: -1 } },
  { name: "Пицца 🍕", category: "fast_food", tags: ["junk"], effects: { health: -7, energy: 6, stress: 1, hydration: -4, sleep: -1 } },
  { name: "Шаурма 🌯", category: "fast_food", tags: ["junk"], effects: { health: -6, energy: 6, stress: 2, hydration: -3, sleep: -1 } },

  { name: "Котлета с пюре 🍽️", category: "homemade_meals", tags: ["meal"], effects: { health: 5, energy: 6, stress: -2, hydration: 1, sleep: 0 } },
  { name: "Суп 🍲", category: "homemade_meals", tags: ["meal", "hydration"], effects: { health: 6, energy: 4, stress: -2, hydration: 5, sleep: 1 } },
  { name: "Рис с курицей 🍛", category: "homemade_meals", tags: ["meal"], effects: { health: 5, energy: 7, stress: -1, hydration: 1, sleep: 0 } },

  { name: "Лапша быстрого приготовления 🍜", category: "quick_snacks", tags: ["junk"], effects: { health: -5, energy: 4, stress: 2, hydration: -4, sleep: -1 } },
  { name: "Консервы 🥫", category: "quick_snacks", tags: ["snack"], effects: { health: -4, energy: 3, stress: 1, hydration: -2, sleep: 0 } },
  { name: "Снеки 🧂", category: "quick_snacks", tags: ["junk"], effects: { health: -6, energy: 3, stress: 2, hydration: -4, sleep: -1 } },
  { name: "Батончик 🍫", category: "quick_snacks", tags: ["snack", "stimulant"], effects: { health: -3, energy: 5, stress: 1, hydration: -1, sleep: -1 } },

  { name: "Вода 💧", category: "drinks", tags: ["drink", "hydration"], effects: { health: 3, energy: 1, stress: -1, hydration: 10, sleep: 1 } },
  { name: "Кофе ☕", category: "drinks", tags: ["drink", "stimulant"], effects: { health: -1, energy: 8, stress: 2, hydration: -3, sleep: -2 } },
  { name: "Газировка 🥤", category: "drinks", tags: ["drink", "stimulant"], effects: { health: -4, energy: 4, stress: 1, hydration: -2, sleep: -1 } },
  { name: "Энергетик ⚡", category: "drinks", tags: ["drink", "stimulant"], effects: { health: -6, energy: 10, stress: 3, hydration: -4, sleep: -3 } },
  { name: "Алкоголь 🍺", category: "drinks", tags: ["drink", "junk"], effects: { health: -8, energy: -2, stress: -1, hydration: -8, sleep: -4 } }
];

const FOOD_CATEGORY_LABELS = {
  healthy_meals: "полезное",
  fast_food: "фастфуд",
  homemade_meals: "домашнее",
  quick_snacks: "перекус",
  drinks: "напиток"
};

const randomEvents = [
  { id: "no_time_to_cook", text: "⚠️ Нет времени готовить: сегодня проще перекусить.", allowCategories: ["fast_food", "quick_snacks", "drinks"] },
  { id: "stressful_day", text: "😵 Стрессовый день: базовый стресс выше.", baselineDelta: { stress: 5 } },
  { id: "friends_invite_fast_food", text: "🍔 Позвали на фастфуд: вредные варианты соблазнительнее.", biasedCategories: ["fast_food"] },
  { id: "no_food_at_home", text: "🛒 Дома пусто: выбор сильно ограничен.", allowCategories: ["quick_snacks", "drinks"] },
  { id: "bad_weather", text: "🌧️ Погода испортилась: прогулка менее эффективна.", appliesTo: ["day_activity"] }
];

function clamp(v) {
  return Math.max(0, Math.min(100, Math.round(v)));
}

function animateValue(id, newValue) {
  const node = document.getElementById(id);
  node.classList.remove("pulse");
  void node.offsetWidth;
  node.textContent = newValue;
  node.classList.add("pulse");
}

function updateStatsDisplay(previousStats = null) {
  Object.entries(state.stats).forEach(([key, val]) => {
    const safeValue = clamp(val);
    state.stats[key] = safeValue;

    animateValue(`${key}-value`, safeValue);
    document.getElementById(`${key}-bar`).style.width = `${safeValue}%`;

    const deltaNode = document.getElementById(`${key}-delta`);
    if (previousStats) {
      const delta = safeValue - previousStats[key];
      if (delta === 0) {
        deltaNode.textContent = "";
      } else {
        deltaNode.textContent = delta > 0 ? `+${delta}` : `${delta}`;
        deltaNode.className = `stat-delta ${delta > 0 ? "plus" : "minus"}`;
      }
    } else {
      deltaNode.textContent = "";
    }
  });
}

function chooseRandomEvent() {
  const roll = Math.random();
  if (roll < 0.25) {
    return randomEvents[Math.floor(Math.random() * randomEvents.length)];
  }
  return null;
}

function isMealDecision(decisionId) {
  return decisionId === "breakfast" || decisionId === "lunch";
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(list) {
  return [...list].sort(() => Math.random() - 0.5);
}

function toFoodChoice(food) {
  return {
    id: food.name,
    label: food.name,
    subtitle: `${FOOD_CATEGORY_LABELS[food.category]} выбор`,
    effects: { ...food.effects },
    category: food.category,
    tags: [...food.tags]
  };
}

function getFoodPool(decisionId, event) {
  let pool = FOOD_ITEMS;
  if (decisionId === "breakfast") {
    pool = FOOD_ITEMS.filter((item) => item.category !== "fast_food" || Math.random() > 0.35);
  }
  if (event?.allowCategories) {
    pool = pool.filter((item) => event.allowCategories.includes(item.category));
  }
  return pool;
}

function buildMealChoices(decisionId, event) {
  const pool = shuffle(getFoodPool(decisionId, event));
  const count = randomInt(3, 5);
  const choices = pool.slice(0, count).map(toFoodChoice);

  if (event?.biasedCategories?.length) {
    choices.sort((a, b) => {
      const aScore = event.biasedCategories.includes(a.category) ? -1 : 1;
      const bScore = event.biasedCategories.includes(b.category) ? -1 : 1;
      return aScore - bScore;
    });
  }

  return choices;
}

function prepareFoodChoicesForDay() {
  ["breakfast", "lunch"].forEach((decisionId) => {
    let tries = 0;
    let nextSet = [];
    do {
      nextSet = buildMealChoices(decisionId, state.activeEvent);
      tries += 1;
    } while (
      tries < 4 &&
      state.previousMealSets[decisionId] &&
      state.previousMealSets[decisionId] === nextSet.map((item) => item.id).join("|")
    );

    state.dailyMealOptions[decisionId] = nextSet;
    state.previousMealSets[decisionId] = nextSet.map((item) => item.id).join("|");
  });
}

function currentPhaseName() {
  return phaseOrder[state.phaseIndex];
}

function currentDecision() {
  const phase = phaseContent[currentPhaseName()];
  return phase[state.choiceIndexInPhase];
}

function adaptChoiceByState(choice) {
  const adapted = {
    ...choice,
    effects: { ...choice.effects }
  };

  if (state.stats.sleep < 35 && adapted.effects.energy > 0) {
    adapted.effects.energy = Math.max(1, adapted.effects.energy - 2);
  }

  if (state.stats.stress > 70 && adapted.effects.health > 0) {
    adapted.effects.health = Math.max(0, adapted.effects.health - 2);
  }

  if (state.stats.hydration < 30) {
    Object.keys(adapted.effects).forEach((key) => {
      if (adapted.effects[key] < 0) adapted.effects[key] -= 1;
    });
  }

  if (adapted.tags?.includes("stimulant") && state.stats.energy > 75 && adapted.effects.energy > 0) {
    adapted.effects.energy = Math.max(1, adapted.effects.energy - 3);
    adapted.effects.stress += 1;
  }

  Object.keys(adapted.effects).forEach((key) => {
    adapted.effects[key] = Math.max(-12, Math.min(12, adapted.effects[key]));
  });

  if (state.activeEvent?.id === "bad_weather" && currentDecision().id === "day_activity" && adapted.label.includes("Прогулка")) {
    adapted.subtitle = `${adapted.subtitle} (холод и дождь)`;
    adapted.effects.health -= 3;
    adapted.effects.energy -= 2;
  }

  return adapted;
}

function applyComboAndProgression(nextStats, selectedChoice, decisionId) {
  const comboMessages = [];
  const hadRecentActivity = state.lastActivityChoice?.includes("Прогулка") || state.lastActivityChoice?.includes("зал");

  if (selectedChoice.category === "healthy_meals" && hadRecentActivity) {
    nextStats.health += 3;
    comboMessages.push("комбо: healthy+activity");
  }

  if (selectedChoice.category === "fast_food" && state.stats.sleep < 35) {
    nextStats.health -= 3;
    nextStats.stress += 2;
    comboMessages.push("комбо: junk+low sleep");
  }

  if (selectedChoice.tags?.includes("hydration") && hadRecentActivity) {
    nextStats.energy += 3;
    comboMessages.push("комбо: hydration+activity");
  }

  if (isMealDecision(decisionId)) {
    state.mealHistory.push({ day: state.day, choice: selectedChoice.label, category: selectedChoice.category });
    state.mealHistory = state.mealHistory.slice(-5);
    const unhealthyCount = state.mealHistory.filter((item) => item.category === "fast_food" || item.category === "quick_snacks").length;
    const healthyCount = state.mealHistory.filter((item) => item.category === "healthy_meals" || item.category === "homemade_meals").length;

    if (unhealthyCount >= 4) {
      nextStats.health -= 2;
      nextStats.energy -= 1;
      comboMessages.push("серия фастфуда: штраф");
    } else if (healthyCount >= 4) {
      nextStats.health += 2;
      nextStats.stress -= 1;
      comboMessages.push("серия полезных: бонус");
    }
  }

  if (comboMessages.length) {
    state.feedback = `${state.feedback} (${comboMessages.join(", ")})`;
  }
}

function summarizeEffects(effects) {
  const labels = {
    health: "здоровье",
    energy: "энергия",
    stress: "стресс",
    hydration: "гидратация",
    sleep: "сон"
  };

  return Object.entries(effects)
    .filter(([, v]) => v !== 0)
    .map(([k, v]) => `${labels[k]} ${v > 0 ? "+" : ""}${v}`)
    .join(" · ");
}

function renderDecision() {
  const decision = currentDecision();
  const event = state.activeEvent;
  const sourceChoices = isMealDecision(decision.id) ? state.dailyMealOptions[decision.id] || [] : decision.choices;

  const updatedChoices = sourceChoices.map((choice) => {
    let computed = adaptChoiceByState(choice);
    return computed;
  });

  document.getElementById("scene-step").textContent = `День ${state.day} · ${phaseLabel(currentPhaseName())}`;
  document.getElementById("scene-title").textContent = decision.title;

  document.getElementById("scene").innerHTML = `
    <div class="scene-panel">
      ${event ? `<p class="event-banner">${event.text}</p>` : ""}
      <p class="scene-desc">Выбор ${state.choiceIndexInPhase + 1} из ${phaseContent[currentPhaseName()].length} в фазе.</p>
      <div class="choice-grid">
        ${updatedChoices
          .map(
            (choice, index) => `
            <button class="choice-btn ${index === 0 ? "primary" : "secondary"}" onclick="pickChoice(${index})">
              <span class="btn-title">${choice.label}</span>
              <span class="btn-subtitle">${choice.subtitle}</span>
            </button>
          `
          )
          .join("")}
      </div>
      <p class="hint-text">1 тап = мгновенный эффект. Сон, стресс и вода меняют результат.</p>
    </div>
  `;

  state.currentChoices = updatedChoices;
}

function phaseLabel(phase) {
  if (phase === "morning") return "Утро";
  if (phase === "day") return "День";
  return "Вечер";
}

function pickChoice(index) {
  const choice = state.currentChoices[index];
  const decisionId = currentDecision().id;
  const previousStats = { ...state.stats };
  const nextStats = { ...state.stats };

  Object.entries(choice.effects).forEach(([stat, value]) => {
    nextStats[stat] += value;
  });

  state.feedback = `${choice.label}: ${summarizeEffects(choice.effects)}`;
  applyComboAndProgression(nextStats, choice, decisionId);

  Object.keys(nextStats).forEach((key) => {
    nextStats[key] = clamp(nextStats[key]);
  });

  state.stats = nextStats;
  if (decisionId === "day_activity" || decisionId === "evening_activity") {
    state.lastActivityChoice = choice.label;
  }

  state.history.push({
    day: state.day,
    phase: currentPhaseName(),
    decision: decisionId,
    choice: choice.label,
    feedback: state.feedback
  });

  showFeedback(previousStats);
}

function showFeedback(previousStats) {
  document.getElementById("scene").innerHTML = `
    <div class="scene-panel">
      <p class="scene-text">${state.feedback}</p>
      <p class="feedback-text">День ${state.day}, ${phaseLabel(currentPhaseName())}. Продолжаем симуляцию.</p>
      <button class="choice-btn primary" onclick="advanceGame()">
        Продолжить
      </button>
    </div>
  `;

  updateStatsDisplay(previousStats);
}

function advanceGame() {
  state.choiceIndexInPhase += 1;

  const phaseChoices = phaseContent[currentPhaseName()].length;
  if (state.choiceIndexInPhase >= phaseChoices) {
    state.choiceIndexInPhase = 0;
    state.phaseIndex += 1;
  }

  if (state.phaseIndex >= phaseOrder.length) {
    state.phaseIndex = 0;
    state.day += 1;
    state.activeEvent = chooseRandomEvent();
    if (state.activeEvent?.baselineDelta) {
      Object.entries(state.activeEvent.baselineDelta).forEach(([key, delta]) => {
        state.stats[key] = clamp(state.stats[key] + delta);
      });
    }
    if (state.day <= GAME_DAYS) {
      prepareFoodChoicesForDay();
    }
  }

  if (state.day > GAME_DAYS) {
    renderFinal();
    return;
  }

  renderDecision();
}

function finalStateText(score) {
  if (score >= 70) return { label: "Здоровый стиль жизни", tone: "good" };
  if (score >= 45) return { label: "Средний баланс", tone: "warn" };
  return { label: "Нездоровый сценарий / выгорание", tone: "bad" };
}

function buildPersonalRecommendations() {
  const rec = [];
  if (state.stats.sleep < 45) rec.push("Стабилизируй время сна: цель 7–8 часов и минимум экранов за 60 минут до сна.");
  if (state.stats.hydration < 50) rec.push("Пей воду равномерно в течение дня: держи бутылку рядом и добавь 1–2 напоминания.");
  if (state.stats.stress > 60) rec.push("Снизь стресс через короткие паузы: дыхание, 10-минутная прогулка, ограничение соцсетей вечером.");
  if (state.stats.energy < 50) rec.push("Добавь лёгкую физическую активность утром и стабильные приёмы пищи без пропусков.");
  if (state.stats.health < 55) rec.push("Соблюдай режим восстановления 3–5 дней: сон, вода, умеренная нагрузка, меньше фастфуда.");

  if (!rec.length) {
    rec.push("Хороший результат — удерживай комбинацию: сон + гидратация + умеренная активность + стресс-менеджмент.");
  }

  return rec;
}

function renderFinal() {
  const score = Math.round(
    (state.stats.health + state.stats.energy + (100 - state.stats.stress) + state.stats.hydration + state.stats.sleep) / 5
  );
  const condition = finalStateText(score);
  const recommendations = buildPersonalRecommendations();

  document.getElementById("scene-step").textContent = `Финал · ${GAME_DAYS} дней`;
  document.getElementById("scene-title").textContent = "Итог симуляции";
  document.getElementById("scene").innerHTML = `
    <div class="result-panel">
      <h3 class="result-title">Твоё состояние: ${condition.label}</h3>
      <section class="summary-card bmi-card ${condition.tone}">
        <strong>Итоговый индекс благополучия</strong>
        <p class="result-text">${score}/100 после ${GAME_DAYS} игровых дней</p>
      </section>

      <section class="summary-grid">
        <article class="summary-card"><strong>Здоровье</strong><span>${state.stats.health}</span></article>
        <article class="summary-card"><strong>Энергия</strong><span>${state.stats.energy}</span></article>
        <article class="summary-card"><strong>Стресс</strong><span>${state.stats.stress}</span></article>
        <article class="summary-card"><strong>Гидратация</strong><span>${state.stats.hydration}</span></article>
        <article class="summary-card"><strong>Сон</strong><span>${state.stats.sleep}</span></article>
      </section>

      <section class="reco-panel">
        <h4>Персональные рекомендации</h4>
        <ul>${recommendations.map((item) => `<li>${item}</li>`).join("")}</ul>
      </section>

      <button class="restart-btn" onclick="restartGame()">Сыграть заново</button>
    </div>
  `;
}

function restartGame() {
  location.reload();
}

function renderStart() {
  document.getElementById("scene-step").textContent = "Старт";
  document.getElementById("scene-title").textContent = "Симулятор привычек";
  document.getElementById("scene").innerHTML = `
    <div class="scene-panel">
      <p class="scene-text">Проживи ${GAME_DAYS} дней и собери лучший баланс жизни.</p>
      <p class="scene-desc">Каждый день: утро, день и вечер. В каждой фазе — реальные выборы с последствиями.</p>
      <button class="choice-btn primary" onclick="startGame()">
        <span class="btn-title">Начать игру</span>
        <span class="btn-subtitle">Решения влияют на здоровье, энергию, стресс, воду и сон</span>
      </button>
    </div>
  `;
}

function startGame() {
  state.activeEvent = chooseRandomEvent();
  if (state.activeEvent?.baselineDelta) {
    Object.entries(state.activeEvent.baselineDelta).forEach(([key, delta]) => {
      state.stats[key] = clamp(state.stats[key] + delta);
    });
  }
  prepareFoodChoicesForDay();
  renderDecision();
}

document.addEventListener("DOMContentLoaded", () => {
  updateStatsDisplay();
  renderStart();
});

window.pickChoice = pickChoice;
window.advanceGame = advanceGame;
window.restartGame = restartGame;
window.startGame = startGame;
