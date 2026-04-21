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
      choices: [
        {
          label: "Бургер 🍔",
          subtitle: "сытно, но тяжело",
          effects: { health: -5, energy: 5, stress: 1, hydration: -3, sleep: -1 }
        },
        {
          label: "Домашняя еда 🥩",
          subtitle: "баланс вкуса и пользы",
          effects: { health: 4, energy: 6, stress: -1, hydration: 1, sleep: 0 }
        },
        {
          label: "Полезный завтрак 🥗",
          subtitle: "легко и стабильно",
          effects: { health: 6, energy: 4, stress: -2, hydration: 3, sleep: 0 }
        },
        {
          label: "Консервы 🥫",
          subtitle: "быстро, но не лучший выбор",
          effects: { health: -3, energy: 2, stress: 2, hydration: -2, sleep: 0 }
        },
        {
          label: "Пропустить завтрак ❌",
          subtitle: "экономия времени, минус энергия",
          effects: { health: -4, energy: -8, stress: 4, hydration: -2, sleep: 0 }
        }
      ]
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
      choices: [
        {
          label: "Фастфуд 🍟",
          subtitle: "быстро, но тяжеловато",
          effects: { health: -6, energy: 4, stress: 1, hydration: -4, sleep: -1 }
        },
        {
          label: "Обычный обед 🍲",
          subtitle: "нейтрально и сытно",
          effects: { health: 2, energy: 3, stress: -1, hydration: 1, sleep: 0 }
        },
        {
          label: "Полезный обед 🥗",
          subtitle: "лучше для восстановления",
          effects: { health: 5, energy: 2, stress: -2, hydration: 3, sleep: 0 }
        }
      ]
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

const randomEvents = [
  {
    id: "no_time_to_cook",
    text: "⚠️ Внезапно нет времени готовить — полезная еда сложнее.",
    appliesTo: ["breakfast", "lunch"],
    modify(choice, phaseChoiceId) {
      if (phaseChoiceId === "breakfast" && choice.label.includes("Полезный")) {
        return {
          ...choice,
          subtitle: `${choice.subtitle} (не успел нормально приготовить)`,
          effects: {
            ...choice.effects,
            health: choice.effects.health - 3,
            stress: choice.effects.stress + 2
          }
        };
      }
      if (phaseChoiceId === "lunch" && choice.label.includes("Полезный")) {
        return {
          ...choice,
          subtitle: `${choice.subtitle} (взял то, что было рядом)`,
          effects: {
            ...choice.effects,
            health: choice.effects.health - 2,
            hydration: choice.effects.hydration - 1
          }
        };
      }
      return choice;
    }
  },
  {
    id: "stressful_day",
    text: "😵 Напряжённый день: стресс набирается быстрее.",
    appliesTo: ["day_activity", "lunch", "evening_activity"],
    modify(choice) {
      return {
        ...choice,
        effects: {
          ...choice.effects,
          stress: choice.effects.stress + 2,
          energy: choice.effects.energy - 1
        }
      };
    }
  },
  {
    id: "friends_invite",
    text: "🎉 Друзья зовут встретиться после дел.",
    appliesTo: ["day_activity", "evening_activity"],
    modify(choice) {
      if (choice.label.includes("друзья") || choice.label.includes("релакс")) {
        return {
          ...choice,
          effects: {
            ...choice.effects,
            stress: choice.effects.stress - 2,
            sleep: choice.effects.sleep - 1
          }
        };
      }
      return choice;
    }
  },
  {
    id: "bad_weather",
    text: "🌧️ Погода испортилась: прогулка менее эффективна.",
    appliesTo: ["day_activity"],
    modify(choice) {
      if (choice.label.includes("Прогулка")) {
        return {
          ...choice,
          subtitle: `${choice.subtitle} (холод и дождь)`,
          effects: {
            ...choice.effects,
            health: choice.effects.health - 4,
            energy: choice.effects.energy - 2
          }
        };
      }
      return choice;
    }
  }
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
  if (roll > 0.65) {
    return randomEvents[Math.floor(Math.random() * randomEvents.length)];
  }
  return null;
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
    adapted.effects.energy = Math.max(1, adapted.effects.energy - 3);
  }

  if (state.stats.stress > 70 && adapted.effects.health > 0) {
    adapted.effects.health = Math.max(0, adapted.effects.health - 2);
  }

  if (state.stats.hydration < 30) {
    adapted.effects.stress += 2;
  }

  return adapted;
}

function applyDynamicBonuses(nextStats, selectedChoice) {
  const hydratedAndRested = nextStats.hydration > 65 && nextStats.sleep > 65;
  const lowStress = nextStats.stress < 35;

  if (hydratedAndRested && lowStress) {
    nextStats.health += 3;
    nextStats.energy += 2;
    state.feedback += " Комбо привычек сработало: +восстановление.";
  }

  if (selectedChoice.effects.sleep < 0 && state.stats.sleep < 30) {
    nextStats.stress += 3;
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

  const updatedChoices = decision.choices.map((choice) => {
    let computed = adaptChoiceByState(choice);
    if (event && event.appliesTo.includes(decision.id)) {
      computed = event.modify(computed, decision.id);
    }
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
      <p class="hint-text">Эффекты зависят от сна, стресса и гидратации предыдущих дней.</p>
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
  const previousStats = { ...state.stats };
  const nextStats = { ...state.stats };

  Object.entries(choice.effects).forEach(([stat, value]) => {
    nextStats[stat] += value;
  });

  applyDynamicBonuses(nextStats, choice);

  Object.keys(nextStats).forEach((key) => {
    nextStats[key] = clamp(nextStats[key]);
  });

  state.stats = nextStats;
  state.feedback = `Выбрано: ${choice.label}. Изменения: ${summarizeEffects(choice.effects)}.`;

  state.history.push({
    day: state.day,
    phase: currentPhaseName(),
    decision: currentDecision().id,
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
