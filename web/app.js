const user = {
  name: "",
  age: 0,
  height: 0,
  weight: 0
};

const lifestyle = {
  sleepHours: 0,
  waterLiters: 0,
  stressLevel: "",
  smoking: "",
  alcohol: ""
};

let health = 100;
let energy = 100;
let immunity = 100;
let stress = 0;
let risk = 0;

let step = 0;

const questionnaire = [
  {
    title: "Сон",
    text: "Сколько часов ты обычно спишь?",
    options: [
      {
        label: "7–9 часов",
        subtitle: "Оптимальное восстановление",
        action: () => {
          lifestyle.sleepHours = 8;
          health += 8;
          energy += 12;
          stress -= 8;
        }
      },
      {
        label: "5–6 часов",
        subtitle: "Недосып может накапливаться",
        action: () => {
          lifestyle.sleepHours = 5.5;
          energy -= 8;
          stress += 8;
          risk += 8;
        }
      },
      {
        label: "< 5 часов",
        subtitle: "Высокий риск переутомления",
        action: () => {
          lifestyle.sleepHours = 4.5;
          energy -= 16;
          stress += 15;
          risk += 14;
          immunity -= 8;
        }
      }
    ]
  },
  {
    title: "Вода",
    text: "Сколько воды ты выпиваешь за день?",
    options: [
      {
        label: "1.8–2.5 л",
        subtitle: "Хороший водный баланс",
        action: () => {
          lifestyle.waterLiters = 2.1;
          health += 7;
          immunity += 5;
        }
      },
      {
        label: "1.0–1.7 л",
        subtitle: "Ниже рекомендуемого",
        action: () => {
          lifestyle.waterLiters = 1.3;
          energy -= 5;
          risk += 5;
        }
      },
      {
        label: "< 1 л",
        subtitle: "Повышенная усталость и риск",
        action: () => {
          lifestyle.waterLiters = 0.8;
          energy -= 10;
          health -= 6;
          risk += 10;
        }
      }
    ]
  },
  {
    title: "Стресс",
    text: "Какой у тебя уровень стресса последние дни?",
    options: [
      {
        label: "Низкий",
        subtitle: "Эмоциональное состояние стабильное",
        action: () => {
          lifestyle.stressLevel = "low";
          stress -= 5;
          health += 4;
        }
      },
      {
        label: "Средний",
        subtitle: "Есть эпизоды напряжения",
        action: () => {
          lifestyle.stressLevel = "mid";
          stress += 8;
          risk += 4;
        }
      },
      {
        label: "Высокий",
        subtitle: "Нужны техники разгрузки",
        action: () => {
          lifestyle.stressLevel = "high";
          stress += 18;
          immunity -= 8;
          risk += 10;
        }
      }
    ]
  },
  {
    title: "Курение",
    text: "Отметь, насколько часто ты куришь.",
    options: [
      {
        label: "Не курю",
        subtitle: "Отлично для сосудов и лёгких",
        action: () => {
          lifestyle.smoking = "none";
          immunity += 4;
          risk -= 2;
        }
      },
      {
        label: "Иногда",
        subtitle: "Нужно снижать частоту",
        action: () => {
          lifestyle.smoking = "sometimes";
          immunity -= 6;
          risk += 10;
          health -= 6;
        }
      },
      {
        label: "Каждый день",
        subtitle: "Сильный фактор риска",
        action: () => {
          lifestyle.smoking = "daily";
          immunity -= 14;
          health -= 10;
          risk += 18;
          stress += 6;
        }
      }
    ]
  },
  {
    title: "Алкоголь",
    text: "Как часто ты употребляешь алкоголь?",
    options: [
      {
        label: "Не употребляю",
        subtitle: "Минимальный риск по этому фактору",
        action: () => {
          lifestyle.alcohol = "none";
          health += 5;
          risk -= 2;
        }
      },
      {
        label: "1–2 раза в неделю",
        subtitle: "Важно контролировать дозу",
        action: () => {
          lifestyle.alcohol = "moderate";
          energy -= 4;
          risk += 6;
        }
      },
      {
        label: "3+ раза в неделю",
        subtitle: "Повышенная нагрузка на организм",
        action: () => {
          lifestyle.alcohol = "often";
          energy -= 10;
          health -= 8;
          risk += 14;
        }
      }
    ]
  }
];

function clamp(v) {
  return Math.max(0, Math.min(100, Math.round(v)));
}

function updateStats() {
  health = clamp(health);
  energy = clamp(energy);
  immunity = clamp(immunity);
  stress = clamp(stress);
  risk = clamp(risk);

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
}

function showStartScreen() {
  document.getElementById("scene-step").textContent = "Старт";
  document.getElementById("scene-title").textContent = "Добро пожаловать";

  document.getElementById("scene").innerHTML = `
    <div class="scene-panel">
      <p class="scene-text">Твоя персональная карта здоровья за 2 минуты</p>
      <p class="scene-desc">Заполни базовые данные, пройди расширенный опрос и получи персональные рекомендации.</p>
      <button class="choice-btn primary" onclick="showProfileForm()">
        <span class="btn-title">Начать опрос</span>
        <span class="btn-subtitle">сон, вода, стресс, курение, алкоголь</span>
      </button>
    </div>
  `;
}

function showProfileForm() {
  document.getElementById("scene-step").textContent = "Шаг 1";
  document.getElementById("scene-title").textContent = "Профиль";

  document.getElementById("scene").innerHTML = `
    <div class="scene-panel profile-panel">
      <p class="scene-text">Расскажи о себе</p>
      <p class="scene-desc">Это нужно для корректного расчёта ИМТ и персонализации советов.</p>

      <div class="input-grid">
        <label class="input-wrap">
          <span>Имя</span>
          <input id="name" placeholder="Например, Алина" class="input" />
        </label>
        <label class="input-wrap">
          <span>Возраст</span>
          <input id="age" placeholder="25" type="number" class="input" min="1" max="120" />
        </label>
        <label class="input-wrap">
          <span>Рост, см</span>
          <input id="height" placeholder="170" type="number" class="input" min="100" max="250" />
        </label>
        <label class="input-wrap">
          <span>Вес, кг</span>
          <input id="weight" placeholder="65" type="number" class="input" min="30" max="300" />
        </label>
      </div>

      <button class="choice-btn primary" onclick="saveProfile()">Продолжить</button>
    </div>
  `;
}

function saveProfile() {
  const name = document.getElementById("name").value.trim();
  const age = +document.getElementById("age").value;
  const height = +document.getElementById("height").value;
  const weight = +document.getElementById("weight").value;

  if (!age || !height || !weight) {
    alert("Заполни возраст, рост и вес.");
    return;
  }

  user.name = name || "Пользователь";
  user.age = age;
  user.height = height;
  user.weight = weight;

  step = 1;
  next();
}

function next() {
  const index = step - 1;

  if (index >= 0 && index < questionnaire.length) {
    showQuestion(index);
    updateStats();
    return;
  }

  finish();
  updateStats();
}

function showQuestion(index) {
  const q = questionnaire[index];
  document.getElementById("scene-step").textContent = `Шаг ${index + 2}`;
  document.getElementById("scene-title").textContent = q.title;

  document.getElementById("scene").innerHTML = `
    <div class="scene-panel">
      <p class="scene-text">${q.text}</p>
      <div class="choice-grid">
        ${q.options
          .map(
            (option, optionIndex) => `
          <button class="choice-btn ${optionIndex === 0 ? "primary" : "secondary"}" onclick="choose(${index}, ${optionIndex})">
            <span class="btn-title">${option.label}</span>
            <span class="btn-subtitle">${option.subtitle}</span>
          </button>
        `
          )
          .join("")}
      </div>
    </div>
  `;
}

function choose(questionIndex, optionIndex) {
  questionnaire[questionIndex].options[optionIndex].action();
  step += 1;
  next();
}

function getBmiMeta(bmi) {
  if (bmi < 18.5) return { label: "Ниже нормы", tone: "warn" };
  if (bmi < 25) return { label: "Норма", tone: "good" };
  if (bmi < 30) return { label: "Избыточная масса", tone: "warn" };
  return { label: "Ожирение", tone: "bad" };
}

function buildRecommendations(bmi) {
  const rec = [];

  if (bmi < 18.5) rec.push("Добавь в рацион больше белка и сложных углеводов, проконсультируйся со специалистом по питанию.");
  if (bmi >= 25) rec.push("Сфокусируйся на дефиците калорий 10–15%, ежедневной ходьбе и 2–3 силовых тренировках в неделю.");
  if (lifestyle.sleepHours < 7) rec.push("Стабилизируй режим сна: цель — минимум 7 часов, засыпание до 23:30.");
  if (lifestyle.waterLiters < 1.8) rec.push("Подними потребление воды до 30–35 мл на кг массы тела.");
  if (lifestyle.stressLevel === "high") rec.push("Добавь антистресс-практики: дыхание 4-7-8, прогулки 20 минут, цифровой детокс вечером.");
  if (lifestyle.smoking !== "none") rec.push("Построй план отказа от курения: уменьши триггеры и обсуди фармподдержку с врачом.");
  if (lifestyle.alcohol === "often") rec.push("Сократи частоту алкоголя и фиксируй самочувствие на следующий день.");

  if (!rec.length) {
    rec.push("Ты двигаешься в отличном направлении: сохраняй текущий режим сна, гидратации и активности.");
  }

  return rec;
}

function finish() {
  const bmi = user.weight / (user.height / 100) ** 2;
  const bmiMeta = getBmiMeta(bmi);
  const recommendations = buildRecommendations(bmi);

  document.getElementById("scene-step").textContent = "Готово";
  document.getElementById("scene-title").textContent = "Персональный итог";

  document.getElementById("scene").innerHTML = `
    <div class="result-panel">
      <h3 class="result-title">${user.name}, твоя карта здоровья</h3>
      <p class="result-text">Возраст: ${user.age} лет · Рост: ${user.height} см · Вес: ${user.weight} кг</p>

      <section class="summary-card bmi-card ${bmiMeta.tone}">
        <strong>Индекс массы тела (ИМТ)</strong>
        <p class="result-text">${bmi.toFixed(1)} · ${bmiMeta.label}</p>
      </section>

      <section class="summary-grid">
        <article class="summary-card"><strong>Энергия</strong><span>${energy}/100</span></article>
        <article class="summary-card"><strong>Стресс</strong><span>${stress}/100</span></article>
        <article class="summary-card"><strong>Риск</strong><span>${risk}/100</span></article>
      </section>

      <section class="reco-panel">
        <h4>Персональные рекомендации</h4>
        <ul>${recommendations.map((r) => `<li>${r}</li>`).join("")}</ul>
      </section>

      <button class="restart-btn" onclick="location.reload()">Пройти снова</button>
    </div>
  `;
}

document.addEventListener("DOMContentLoaded", () => {
  updateStats();
  showStartScreen();
});
