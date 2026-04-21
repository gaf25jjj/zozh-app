let health = 100;
let energy = 100;
let immunity = 100;
let stress = 0;
let risk = 0;
let step = 1;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function updateStats() {
  health = clamp(health, 0, 100);
  energy = clamp(energy, 0, 100);
  immunity = clamp(immunity, 0, 100);
  stress = clamp(stress, 0, 100);
  risk = clamp(risk, 0, 100);

  document.getElementById("health-value").textContent = health;
  document.getElementById("energy-value").textContent = energy;
  document.getElementById("immunity-value").textContent = immunity;
  document.getElementById("stress-value").textContent = stress;
  document.getElementById("risk-value").textContent = risk;

  document.getElementById("health-bar").style.width = `${health}%`;
  document.getElementById("energy-bar").style.width = `${energy}%`;
  document.getElementById("immunity-bar").style.width = `${immunity}%`;
  document.getElementById("stress-bar").style.width = `${stress}%`;
  document.getElementById("risk-bar").style.width = `${risk}%`;

  document.getElementById("scene-step").textContent = `Этап ${step}`;
}

function renderScene({ title, text, desc = "", feedback = "", options = [] }) {
  document.getElementById("scene-title").textContent = title;

  const feedbackBlock = feedback
    ? `
      <div class="feedback-box tip-panel">
        <p class="feedback-label">Профилактический комментарий</p>
        <p class="feedback-text">${feedback}</p>
      </div>
    `
    : "";

  const buttons = options
    .map(
      (option) => `
        <button class="choice-btn ${option.variant || "secondary"}" onclick="${option.action}">
          <span class="btn-title">${option.title}</span>
          ${option.subtitle ? `<span class="btn-subtitle">${option.subtitle}</span>` : ""}
        </button>
      `
    )
    .join("");

  document.getElementById("scene").innerHTML = `
    <div class="scene-panel">
      <p class="scene-text">${text}</p>
      ${desc ? `<p class="scene-desc">${desc}</p>` : ""}
      ${feedbackBlock}
      <div class="choice-grid">
        ${buttons}
      </div>
    </div>
  `;
}

function startGame() {
  step = 1;
  renderScene({
    title: "Сценарий дня",
    text: "Ты проснулся утром. Что будешь делать?",
    desc: "Первое решение дня влияет на уровень энергии, стресс и общее самочувствие.",
    options: [
      {
        title: "🍳 Полезно позавтракать",
        subtitle: "Получить энергию на утро",
        action: "chooseBreakfast()",
        variant: "primary"
      },
      {
        title: "❌ Пропустить завтрак",
        subtitle: "Поспешить и уйти без еды",
        action: "skipBreakfast()",
        variant: "secondary"
      }
    ]
  });
  updateStats();
}

function chooseBreakfast() {
  energy += 10;
  immunity += 5;
  stress -= 5;
  step = 2;

  renderScene({
    title: "День",
    text: "Наступил день. Как ты проведёшь свободное время?",
    desc: "Физическая активность снижает стресс и помогает профилактике гиподинамии.",
    feedback:
      "Регулярный завтрак поддерживает уровень энергии и помогает лучше концентрироваться в течение дня.",
    options: [
      {
        title: "🚶 Пойти на прогулку",
        subtitle: "Активность и свежий воздух",
        action: "walk()",
        variant: "primary"
      },
      {
        title: "📱 Листать телефон лёжа",
        subtitle: "Минимум движения",
        action: "phone()",
        variant: "secondary"
      }
    ]
  });

  updateStats();
}

function skipBreakfast() {
  energy -= 15;
  stress += 10;
  risk += 5;
  step = 2;

  renderScene({
    title: "День",
    text: "Ты уже чувствуешь усталость. Что выберешь дальше?",
    desc: "Даже после неудачного начала дня можно улучшить показатели полезными действиями.",
    feedback:
      "Пропуск завтрака может приводить к слабости, снижению концентрации и повышению уровня стресса.",
    options: [
      {
        title: "🚶 Пойти на прогулку",
        subtitle: "Компенсировать усталость движением",
        action: "walk()",
        variant: "primary"
      },
      {
        title: "📱 Остаться в телефоне",
        subtitle: "Пассивный отдых без движения",
        action: "phone()",
        variant: "secondary"
      }
    ]
  });

  updateStats();
}

function walk() {
  health += 10;
  stress -= 10;
  immunity += 5;
  risk -= 5;
  step = 3;

  finishGame(
    "🟢 Отличный результат",
    "Ты сделал выбор в пользу полезных привычек. Это помогает поддерживать здоровье, снижать стресс и уменьшать риск заболеваний.",
    true
  );
}

function phone() {
  stress += 10;
  energy -= 10;
  risk += 10;
  health -= 5;
  step = 3;

  finishGame(
    "🔴 Есть над чем поработать",
    "Некоторые решения повысили стресс и риск заболеваний. Полезные привычки формируются постепенно — главное, начать менять режим дня.",
    false
  );
}

function finishGame(title, text, isGoodResult) {
  document.getElementById("scene-title").textContent = "Итог дня";
  document.getElementById("scene-step").textContent = "Результат";

  document.getElementById("scene").innerHTML = `
    <div class="result-panel">
      <div class="result-top">
        <div class="result-icon ${isGoodResult ? "good" : "bad"}">
          ${isGoodResult ? "✅" : "⚠️"}
        </div>
        <div style="flex:1;">
          <h3 class="result-title">${title}</h3>
          <p class="result-text">${text}</p>
        </div>
      </div>

      <div class="summary-grid">
        <div class="summary-card">
          <strong>Что это показывает</strong>
          Привычки напрямую влияют на физическое и психоэмоциональное состояние человека.
        </div>
        <div class="summary-card">
          <strong>Профилактический вывод</strong>
          Рациональное питание, движение и снижение гиподинамии помогают профилактике многих нарушений здоровья.
        </div>
      </div>

      <button class="restart-btn" onclick="restartGame()">🔄 Пройти ещё раз</button>
    </div>
  `;

  updateStats();
}

function restartGame() {
  health = 100;
  energy = 100;
  immunity = 100;
  stress = 0;
  risk = 0;
  startGame();
}

document.addEventListener("DOMContentLoaded", () => {
  startGame();
});
