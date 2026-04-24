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
  activeEvent: null,
  feedbackTimeoutId: null,
  characterState: "neutral",
  characterSwapTimeoutId: null,
  recentBadChoiceTurns: 0,
  overeatingTurns: 0,
  focusedTurns: 0,
  socialTurns: 0,
  inactivityTurns: 0,
  wastedTimeTurns: 0,
  goodHabitStreak: 0,
  badHabitStreak: 0,
  endOfDayLog: [],
  hasStarted: false,
  selectedChoiceIndex: null,
  player: { name: "", heroId: "lena" }
};

const STAGES = [
  { key: "chaos",    min: 0,  label: "Chaos" },
  { key: "unstable", min: 25, label: "Unstable" },
  { key: "normal",   min: 45, label: "Normal" },
  { key: "balanced", min: 60, label: "Balanced" },
  { key: "peak",     min: 80, label: "Peak" }
];

const LEADERBOARD_KEY = "zdorovlife.leaderboard.v1";
const MAX_LEADERBOARD = 20;

const HEROES = [
  {
    id: "lena",
    name: "Лена",
    trait: "Йог · спокойствие",
    avatar: "/assets/assets/characters/character-calm.png",
    statMods: { health: 5, stress: -5 }
  },
  {
    id: "max",
    name: "Макс",
    trait: "Спортсмен · энергия",
    avatar: "/assets/assets/characters/character-energized.png",
    statMods: { energy: 8, hydration: 5, sleep: -5 }
  },
  {
    id: "artem",
    name: "Артём",
    trait: "Студент · фокус",
    avatar: "/assets/assets/characters/character-focused.png",
    statMods: { energy: 5, sleep: -5, stress: 4 }
  },
  {
    id: "nika",
    name: "Ника",
    trait: "Креатив · социум",
    avatar: "/assets/assets/characters/character-social.png",
    statMods: { stress: -3, hydration: -3, energy: 3 }
  }
];

function getHeroById(id) {
  return HEROES.find((h) => h.id === id) || HEROES[0];
}

function getTelegramName() {
  try {
    const tg = window.Telegram && window.Telegram.WebApp;
    const u = tg?.initDataUnsafe?.user;
    if (u) {
      const full = [u.first_name, u.last_name].filter(Boolean).join(" ").trim();
      return full || u.username || "";
    }
  } catch (_) {}
  return "";
}

function getPlayerName() {
  if (state.player?.name) return state.player.name;
  return getTelegramName() || "Игрок";
}

function loadLeaderboard() {
  try {
    const raw = localStorage.getItem(LEADERBOARD_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch (_) {
    return [];
  }
}

function saveScoreToLeaderboard(score, ending) {
  try {
    const entry = { name: getPlayerName(), score, ending, at: Date.now() };
    const list = loadLeaderboard();
    list.push(entry);
    list.sort((a, b) => b.score - a.score);
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(list.slice(0, MAX_LEADERBOARD)));
  } catch (_) {}
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[<>&"]/g, (c) => ({"<":"&lt;",">":"&gt;","&":"&amp;","\"":"&quot;"}[c]));
}

function renderLeaderboard() {
  const list = document.getElementById("leaderboard-list");
  if (!list) return;
  const entries = loadLeaderboard().sort((a, b) => b.score - a.score);
  if (!entries.length) {
    list.innerHTML = `<p class="leaderboard-empty">Пока нет результатов</p>`;
    return;
  }
  list.innerHTML = entries.map((e, i) => {
    const rank = i + 1;
    const topClass = rank <= 3 ? `is-top${rank}` : "";
    return `<div class="leaderboard-row ${topClass}">
      <span class="leaderboard-rank">${rank}</span>
      <span>
        <span class="leaderboard-name">${escapeHtml(e.name || "Игрок")}</span>
        <span class="leaderboard-ending">${escapeHtml(e.ending || "")}</span>
      </span>
      <span class="leaderboard-score">${Number(e.score) || 0}</span>
    </div>`;
  }).join("");
}

function renderHeroGrid() {
  const grid = document.getElementById("hero-grid");
  if (!grid) return;
  const selectedId = state.player.heroId || HEROES[0].id;
  grid.innerHTML = HEROES.map((h) => {
    const mods = Object.entries(h.statMods).map(([key, delta]) => {
      const sign = delta > 0 ? "+" : "";
      const cls = delta > 0 ? "up" : "down";
      const label = ({
        health: "Здоровье", energy: "Энергия", stress: "Стресс",
        hydration: "Вода", sleep: "Сон"
      })[key] || key;
      return `<span class="hero-mod-chip ${cls}">${label} ${sign}${delta}</span>`;
    }).join("");
    return `<button type="button" class="hero-card ${h.id === selectedId ? "is-selected" : ""}" data-hero-id="${h.id}" role="radio" aria-checked="${h.id === selectedId}">
      <span class="hero-avatar"><img src="${h.avatar}" alt="${escapeHtml(h.name)}" /></span>
      <span class="hero-card-name">${escapeHtml(h.name)}</span>
      <span class="hero-card-trait">${escapeHtml(h.trait)}</span>
      <span class="hero-card-mods">${mods}</span>
    </button>`;
  }).join("");

  grid.querySelectorAll(".hero-card").forEach((card) => {
    card.addEventListener("click", () => selectHero(card.dataset.heroId));
  });
}

function selectHero(heroId) {
  const hero = getHeroById(heroId);
  state.player.heroId = hero.id;
  const grid = document.getElementById("hero-grid");
  grid?.querySelectorAll(".hero-card").forEach((card) => {
    const isMatch = card.dataset.heroId === hero.id;
    card.classList.toggle("is-selected", isMatch);
    card.setAttribute("aria-checked", isMatch ? "true" : "false");
  });
  const input = document.getElementById("hero-name-input");
  if (input && !input.value.trim()) {
    input.placeholder = `Например: ${hero.name}`;
  }
}

function showHeroSelect() {
  const welcome = document.getElementById("welcome-screen");
  const heroScreen = document.getElementById("hero-select-screen");
  renderHeroGrid();
  const input = document.getElementById("hero-name-input");
  if (input && !input.value) {
    const tgName = getTelegramName();
    if (tgName) input.value = tgName;
  }
  welcome?.classList.add("is-hidden");
  heroScreen?.classList.add("is-visible");
}

function hideHeroSelect() {
  const welcome = document.getElementById("welcome-screen");
  const heroScreen = document.getElementById("hero-select-screen");
  heroScreen?.classList.remove("is-visible");
  welcome?.classList.remove("is-hidden");
}

function confirmHeroAndStart() {
  if (state.hasStarted) return;
  const input = document.getElementById("hero-name-input");
  const typed = (input?.value || "").trim();
  const hero = getHeroById(state.player.heroId);
  state.player.name = typed || getTelegramName() || hero.name;

  Object.entries(hero.statMods).forEach(([key, delta]) => {
    if (state.stats[key] != null) {
      state.stats[key] = clamp(state.stats[key] + delta);
    }
  });

  const heroScreen = document.getElementById("hero-select-screen");
  const gameScreen = document.getElementById("game-screen");
  state.hasStarted = true;
  startGame();
  updateStatsDisplay();
  updateBalanceDisplay();

  const nameNode = document.getElementById("hud-player-name");
  if (nameNode) nameNode.textContent = state.player.name;

  heroScreen?.classList.remove("is-visible");
  gameScreen?.classList.add("is-visible");
}

function showLeaderboard() {
  renderLeaderboard();
  const welcome = document.getElementById("welcome-screen");
  const board = document.getElementById("leaderboard-screen");
  welcome?.classList.add("is-hidden");
  board?.classList.add("is-visible");
}

function hideLeaderboard() {
  const welcome = document.getElementById("welcome-screen");
  const board = document.getElementById("leaderboard-screen");
  board?.classList.remove("is-visible");
  welcome?.classList.remove("is-hidden");
}

function computeLifeBalance() {
  const { health, energy, stress, sleep, hydration } = state.stats;
  const score = Math.round((health + energy + (100 - stress) + hydration + sleep) / 5);
  const stage = [...STAGES].reverse().find((s) => score >= s.min) || STAGES[0];
  return { score, stage };
}

function updateBalanceDisplay() {
  const { score, stage } = computeLifeBalance();
  const chip = document.getElementById("balance-chip");
  const valueNode = document.getElementById("balance-value");
  const stageNode = document.getElementById("balance-stage");
  if (valueNode) valueNode.textContent = score;
  if (stageNode) stageNode.textContent = stage.label;
  if (chip) {
    chip.classList.remove("is-chaos","is-unstable","is-normal","is-balanced","is-peak");
    chip.classList.add(`is-${stage.key}`);
  }
}

const phaseOrder = ["morning", "day", "evening"];

const phaseContent = {
  morning: [
    {
      id: "wake_routine",
      title: "Раннее утро",
      choices: [
        {
          label: "💪 Бодрый старт",
          subtitle: "Лёгкая зарядка и душ",
          effects: { health: 6, energy: 7, stress: -4, hydration: -5, sleep: -1 }
        },
        {
          label: "📱 Лента в кровати",
          subtitle: "Быстрый дофамин, слабый фокус",
          effects: { health: -2, energy: -3, stress: 4, hydration: -2, sleep: -2 }
        },
        {
          label: "😴 Ещё 20 минут",
          subtitle: "Чуть легче проснуться, но день смещается",
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
      title: "Дневной блок",
      choices: [
        {
          label: "🚶 Перезагрузка на улице",
          subtitle: "Короткая прогулка и свежий воздух",
          effects: { health: 5, energy: 3, stress: -4, hydration: -4, sleep: 1 }
        },
        {
          label: "📚 Глубокий фокус",
          subtitle: "Продвигаешь дела, но устаёшь",
          effects: { health: 1, energy: -2, stress: 4, hydration: -2, sleep: 0 }
        },
        {
          label: "🪑 Режим «не вставать»",
          subtitle: "Комфортно сейчас, хуже по ощущениям",
          effects: { health: -4, energy: -3, stress: 2, hydration: -1, sleep: -1 }
        },
        {
          label: "🍻 Вылазка с друзьями",
          subtitle: "Настроение вверх, режим плавает",
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
      title: "Вечерний ритм",
      choices: [
        {
          label: "🏋️ Тренировка",
          subtitle: "Сильный буст формы, трата ресурса",
          effects: { health: 7, energy: -6, stress: -3, hydration: -5, sleep: 2 }
        },
        {
          label: "📺 Серия перед сном",
          subtitle: "Небольшой отдых без перегруза",
          effects: { health: -1, energy: 2, stress: -1, hydration: -1, sleep: -1 }
        },
        {
          label: "📱 Скролл без стопа",
          subtitle: "Залипание и поздний отбой",
          effects: { health: -3, energy: -2, stress: 4, hydration: -1, sleep: -3 }
        },
        {
          label: "🧘 Тихое восстановление",
          subtitle: "Сбрасываешь напряжение и выдыхаешь",
          effects: { health: 3, energy: 3, stress: -5, hydration: 1, sleep: 2 }
        }
      ]
    },
    {
      id: "sleep_decision",
      title: "Финал дня",
      choices: [
        {
          label: "😴 Ранний отбой",
          subtitle: "Лучшее восстановление",
          effects: { health: 4, energy: 8, stress: -3, hydration: 0, sleep: 8 }
        },
        {
          label: "🌙 Ещё немного дел",
          subtitle: "Компромисс между задачами и отдыхом",
          effects: { health: -1, energy: -2, stress: 2, hydration: 0, sleep: -4 }
        },
        {
          label: "🌃 Ночной марафон",
          subtitle: "Сильный сбой режима",
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
  { id: "bad_weather", text: "🌧️ Погода испортилась: прогулка менее эффективна.", appliesTo: ["day_activity"] },
  { id: "bad_sleep_night", text: "🌙 Плохо спал ночью: старт дня тяжёлый.", baselineDelta: { sleep: -8, energy: -4, stress: 3 } }
];

function clamp(v) {
  return Math.max(0, Math.min(100, Math.round(v)));
}

function animateValue(id, newValue) {
  const node = document.getElementById(id);
  if (!node) return;
  node.classList.remove("pulse");
  void node.offsetWidth;
  node.textContent = newValue;
  node.classList.add("pulse");
}

const CHARACTER_FILENAMES = {
  neutral: "character-neutral.png",
  stressed: "character-stressed.png",
  energized: "character-energized.png",
  sleeping: "character-sleeping.png",
  procrastinating: "character-procrastinating.png",
  sick: "character-sick.png",
  optimal: "character-optimal.png",
  calm: "character-calm.png",
  focused: "character-focused.png",
  social: "character-social.png",
  guilty: "character-guilty.png",
  overeating: "character-overeating.png",
  apathetic: "character-apathetic.png",
  overstimulated: "character-overstimulated.png"
};

const CHARACTER_ASSETS_BASE_PATH = "/assets/assets/characters";

const CHARACTER_ASSETS = Object.fromEntries(
  Object.entries(CHARACTER_FILENAMES).map(([stateKey, filename]) => [stateKey, `${CHARACTER_ASSETS_BASE_PATH}/${filename}`])
);

const CHARACTER_LABELS = {
  neutral: "Нейтральное",
  stressed: "Стресс",
  energized: "Подъём",
  sleeping: "Сонливость",
  procrastinating: "Прокрастинация",
  sick: "Недомогание",
  optimal: "Оптимальное",
  calm: "Спокойствие",
  focused: "Фокус",
  social: "Социальность",
  guilty: "Вина",
  overeating: "Переедание",
  apathetic: "Апатия",
  overstimulated: "Перевозбуждение"
};

const CHARACTER_STATE_CLASSES = Object.keys(CHARACTER_ASSETS).map((name) => `state-${name}`);

function isBalancedProfile(stats) {
  const values = [stats.health, stats.energy, stats.hydration, stats.sleep];
  const max = Math.max(...values);
  const min = Math.min(...values);
  return (
    stats.health >= 55 &&
    stats.energy >= 52 &&
    stats.hydration >= 50 &&
    stats.sleep >= 52 &&
    stats.stress <= 42 &&
    max - min <= 22
  );
}

function computeCharacterState() {
  const { health, energy, stress, sleep, hydration } = state.stats;

  if (health <= 20) return "sick";
  if (state.overeatingTurns > 0) return "overeating";
  if (state.recentBadChoiceTurns > 0) return "guilty";
  if (energy >= 78 && stress >= 72) return "overstimulated";
  if (stress >= 75) return "stressed";
  if (sleep <= 22 || (sleep <= 30 && hydration <= 30 && energy <= 42)) return "apathetic";
  if (sleep <= 30 || hydration <= 24) return "sleeping";
  if (state.focusedTurns > 0) return "focused";
  if (state.socialTurns > 0) return "social";
  if (state.inactivityTurns >= 2 || state.wastedTimeTurns >= 2) return "procrastinating";
  if (stress <= 28 && energy >= 40 && energy <= 72) return "calm";
  if (energy >= 72 && stress <= 36) return "energized";
  if (isBalancedProfile(state.stats)) return "optimal";
  return "neutral";
}

function decayMoodFlags() {
  state.recentBadChoiceTurns = Math.max(0, state.recentBadChoiceTurns - 1);
  state.overeatingTurns = Math.max(0, state.overeatingTurns - 1);
  state.focusedTurns = Math.max(0, state.focusedTurns - 1);
  state.socialTurns = Math.max(0, state.socialTurns - 1);
}

function updateChoiceDrivenFlags(choice, decisionId) {
  const looksWasted = /Лента в кровати|Скролл|не вставать/i.test(choice.label);
  const studyingChoice = decisionId === "day_activity" && /Глубокий фокус/i.test(choice.label);
  const socialChoice = /друзья/i.test(choice.label);
  const junkMeal = isMealDecision(decisionId) && (choice.category === "fast_food" || choice.category === "quick_snacks");
  const badByEffects = (choice.effects.health ?? 0) <= -5 || (choice.effects.sleep ?? 0) <= -4 || (choice.effects.stress ?? 0) >= 5;

  if (looksWasted) {
    state.wastedTimeTurns = Math.min(3, state.wastedTimeTurns + 1);
  } else {
    state.wastedTimeTurns = Math.max(0, state.wastedTimeTurns - 1);
  }

  const activityChoice = decisionId === "day_activity" || decisionId === "evening_activity";
  if (activityChoice && (/не вставать|Скролл|Серия/i.test(choice.label))) {
    state.inactivityTurns = Math.min(3, state.inactivityTurns + 1);
  } else if (activityChoice) {
    state.inactivityTurns = Math.max(0, state.inactivityTurns - 1);
  }

  if (studyingChoice) state.focusedTurns = 2;
  if (socialChoice) state.socialTurns = 2;
  if (junkMeal) state.overeatingTurns = 2;
  if (badByEffects || junkMeal || looksWasted) state.recentBadChoiceTurns = 2;

  const isGoodChoice =
    choice.category === "healthy_meals" ||
    choice.category === "homemade_meals" ||
    (choice.tags?.includes("hydration") && choice.category === "drinks") ||
    /Бодрый старт|Тихое восстановление|Тренировка|Прогулка|Перезагрузка на улице|Ранний отбой/i.test(choice.label);
  const isBadChoice =
    junkMeal || looksWasted ||
    /Ночной марафон|Энергетик|Алкоголь/i.test(choice.label);

  if (isGoodChoice && !isBadChoice) {
    state.goodHabitStreak += 1;
    state.badHabitStreak = Math.max(0, state.badHabitStreak - 1);
  } else if (isBadChoice) {
    state.badHabitStreak += 1;
    state.goodHabitStreak = Math.max(0, state.goodHabitStreak - 1);
  }
}

function applyEndOfDayProgression() {
  const notes = [];
  if (state.goodHabitStreak >= 4) {
    state.stats.health = clamp(state.stats.health + 3);
    state.stats.stress = clamp(state.stats.stress - 3);
    notes.push("серия здоровых привычек: +3 здоровье, −3 стресс");
  }
  if (state.badHabitStreak >= 4) {
    state.stats.health = clamp(state.stats.health - 3);
    state.stats.energy = clamp(state.stats.energy - 2);
    state.stats.stress = clamp(state.stats.stress + 3);
    notes.push("серия плохих привычек: −3 здоровье, +3 стресс");
  }
  state.endOfDayLog.push({ day: state.day, notes });
}

function updateCharacterState() {
  const character = document.getElementById("character");
  const characterImage = document.getElementById("character-image");
  const stateText = document.getElementById("character-state-text");
  if (!character || !characterImage || !stateText) return;

  const nextState = computeCharacterState();
  const nextImage = CHARACTER_ASSETS[nextState] ?? CHARACTER_ASSETS.neutral;
  const finalImageUrl = new URL(nextImage, window.location.origin).href;
  const label = CHARACTER_LABELS[nextState] ?? "Нейтральное";

  if (state.characterSwapTimeoutId) {
    clearTimeout(state.characterSwapTimeoutId);
    state.characterSwapTimeoutId = null;
  }

  if (state.characterState !== nextState) {
    character.classList.add("is-swapping");
    state.characterSwapTimeoutId = setTimeout(() => {
      characterImage.src = finalImageUrl;
      characterImage.alt = `Состояние персонажа: ${label}`;
      state.characterSwapTimeoutId = null;
      requestAnimationFrame(() => character.classList.remove("is-swapping"));
    }, 120);
  } else {
    characterImage.src = finalImageUrl;
    characterImage.alt = `Состояние персонажа: ${label}`;
  }

  character.classList.remove(...CHARACTER_STATE_CLASSES);
  character.classList.add(`state-${nextState}`);
  stateText.textContent = `Состояние: ${label}`;
  state.characterState = nextState;
}

function updateStatsDisplay(previousStats = null) {
  Object.entries(state.stats).forEach(([key, val]) => {
    const safeValue = clamp(val);
    state.stats[key] = safeValue;

    animateValue(`${key}-value`, safeValue);
    const bar = document.getElementById(`${key}-bar`);
    if (bar) {
      bar.style.width = `${safeValue}%`;
    }

    const deltaNode = document.getElementById(`${key}-delta`);
    if (!deltaNode) return;
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

  updateCharacterState();
  updateBalanceDisplay();
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

  if (selectedChoice.category === "drinks" && selectedChoice.tags?.includes("hydration") && hadRecentActivity) {
    nextStats.health += 1;
    comboMessages.push("комбо: вода+активность");
  }

  if (selectedChoice.category === "healthy_meals" && state.stats.sleep >= 65) {
    nextStats.health += 2;
    nextStats.stress -= 2;
    comboMessages.push("комбо: сон+полезное (восстановление)");
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

function phaseSituationText(phase, decisionId) {
  if (decisionId === "wake_routine") return "Будильник стих. Как запускаешь день?";
  if (decisionId === "breakfast") return "Первый приём пищи задаст ритм утра.";
  if (decisionId === "day_activity") return "Середина дня. Нужен ход, который двинет тебя дальше.";
  if (decisionId === "lunch") return "Пауза на питание: восстановиться или перегрузиться?";
  if (decisionId === "evening_activity") return "Вечер. Выбирай между зарядом и шумом.";
  if (decisionId === "sleep_decision") return "До конца дня один выбор. Закрепи результат.";

  if (phase === "morning") return "Утро задаёт тон всему дню.";
  if (phase === "day") return "Днём твои решения сильнее всего влияют на баланс.";
  return "Вечером решения влияют на восстановление и сон.";
}

function renderDecision() {
  const decision = currentDecision();
  const event = state.activeEvent;
  const phase = currentPhaseName();
  const sourceChoices = isMealDecision(decision.id) ? state.dailyMealOptions[decision.id] || [] : decision.choices;

  const updatedChoices = sourceChoices.map((choice) => {
    let computed = adaptChoiceByState(choice);
    return computed;
  });

  document.getElementById("scene-step").textContent = `День ${state.day}/${GAME_DAYS} · ${phaseLabel(phase)}`;
  document.getElementById("scene-title").textContent = decision.title;

  setSceneContent(`
    <div class="scene-panel">
      ${event ? `<p class="event-banner">${event.text}</p>` : ""}
      <p class="scene-context">${phaseSituationText(phase, decision.id)}</p>
      <p class="scene-desc">Шаг ${state.choiceIndexInPhase + 1} из ${phaseContent[phase].length} в фазе ${phaseLabel(phase)}.</p>
      <div class="choice-grid">
        ${updatedChoices
          .map(
            (choice, index) => `
            <button id="choice-${index}" class="choice-btn ${index === 0 ? "primary" : "secondary"}" onclick="pickChoice(${index})">
              <span class="choice-icon">${extractChoiceIcon(choice.label)}</span>
              <span>
                <span class="btn-title">${cleanChoiceTitle(choice.label)}</span>
                <span class="btn-subtitle">${choice.subtitle}</span>
              </span>
            </button>
          `
          )
          .join("")}
      </div>
      <p class="hint-text">Эффект применяется сразу после выбора.</p>
      <div id="inline-feedback" class="inline-feedback" aria-live="polite"></div>
    </div>
  `);

  state.currentChoices = updatedChoices;
  state.selectedChoiceIndex = null;
}

function extractChoiceIcon(label) {
  const icon = (label.match(/\p{Extended_Pictographic}/u) || [])[0];
  return icon || "✨";
}

function cleanChoiceTitle(label) {
  return label.replace(/\p{Extended_Pictographic}/gu, "").trim();
}

function setSceneContent(markup) {
  const scene = document.getElementById("scene");
  if (!scene) return;

  const nextView = document.createElement("div");
  nextView.className = "scene-view is-entering";
  nextView.innerHTML = markup;

  const currentView = scene.querySelector(".scene-view");

  if (!currentView) {
    scene.innerHTML = "";
    scene.appendChild(nextView);
    requestAnimationFrame(() => {
      nextView.classList.remove("is-entering");
      nextView.classList.add("is-active");
    });
    return;
  }

  const stableHeight = Math.max(currentView.offsetHeight, nextView.offsetHeight);
  scene.style.minHeight = `${stableHeight}px`;

  currentView.classList.add("is-leaving");
  scene.appendChild(nextView);

  requestAnimationFrame(() => {
    nextView.classList.remove("is-entering");
    nextView.classList.add("is-active");
  });

  setTimeout(() => {
    if (currentView.parentNode === scene) {
      scene.removeChild(currentView);
    }
    scene.style.minHeight = "";
  }, 280);
}

function phaseLabel(phase) {
  if (phase === "morning") return "Утро";
  if (phase === "day") return "День";
  return "Вечер";
}

function pickChoice(index) {
  state.selectedChoiceIndex = index;
  const selectedBtn = document.getElementById(`choice-${index}`);
  if (selectedBtn) {
    selectedBtn.classList.add("is-picked");
  }

  decayMoodFlags();
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
  updateChoiceDrivenFlags(choice, decisionId);
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
  updateStatsDisplay(previousStats);
  const feedbackNode = document.getElementById("inline-feedback");
  if (!feedbackNode) {
    advanceGame();
    return;
  }

  if (state.feedbackTimeoutId) {
    clearTimeout(state.feedbackTimeoutId);
  }

  feedbackNode.innerHTML = `
    <p class="feedback-text subtle">${state.feedback}</p>
    <button class="continue-btn" onclick="advanceGame()">Продолжить</button>
  `;

  state.feedbackTimeoutId = setTimeout(() => {
    if (document.getElementById("inline-feedback") === feedbackNode) {
      advanceGame();
    }
  }, 1200);
}

function advanceGame() {
  if (state.feedbackTimeoutId) {
    clearTimeout(state.feedbackTimeoutId);
    state.feedbackTimeoutId = null;
  }

  state.choiceIndexInPhase += 1;

  const phaseChoices = phaseContent[currentPhaseName()].length;
  if (state.choiceIndexInPhase >= phaseChoices) {
    state.choiceIndexInPhase = 0;
    state.phaseIndex += 1;
  }

  if (state.phaseIndex >= phaseOrder.length) {
    applyEndOfDayProgression();
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
  if (score >= 75) return { label: "Peak — пик баланса жизни", tone: "good" };
  if (score >= 55) return { label: "Balanced — устойчивый баланс", tone: "good" };
  if (score >= 30) return { label: "Average — средний результат", tone: "warn" };
  return { label: "Burnout — выгорание", tone: "bad" };
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
  const { score, stage } = computeLifeBalance();
  const condition = finalStateText(score);
  saveScoreToLeaderboard(score, condition.label);
  const recommendations = buildPersonalRecommendations();

  document.getElementById("scene-step").textContent = `Финал · ${GAME_DAYS} дней`;
  document.getElementById("scene-title").textContent = "Итог симуляции";
  setSceneContent(`
    <div class="result-panel">
      <h3 class="result-title">Твоё состояние: ${condition.label}</h3>
      <section class="summary-card bmi-card ${condition.tone}">
        <strong>Life Balance · ${stage.label}</strong>
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
  `);
}

function restartGame() {
  location.reload();
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

function transitionToGame() {
  if (state.hasStarted) return;

  const welcomeScreen = document.getElementById("welcome-screen");
  const gameScreen = document.getElementById("game-screen");

  if (!welcomeScreen || !gameScreen) {
    state.hasStarted = true;
    startGame();
    return;
  }

  state.hasStarted = true;
  startGame();

  welcomeScreen.classList.add("is-leaving");
  gameScreen.classList.add("is-visible");

  setTimeout(() => {
    welcomeScreen.classList.add("is-hidden");
  }, 420);
}

function setupTelegramWebApp() {
  const tg = window.Telegram && window.Telegram.WebApp;
  if (!tg) return;
  try {
    tg.ready();
    tg.expand();
    if (typeof tg.requestFullscreen === "function") {
      try { tg.requestFullscreen(); } catch (_) {}
    }
    const applyViewport = () => {
      const h = tg.viewportStableHeight || tg.viewportHeight || window.innerHeight;
      document.documentElement.style.setProperty("--tg-vh", `${h}px`);
    };
    applyViewport();
    tg.onEvent && tg.onEvent("viewportChanged", applyViewport);
    if (tg.themeParams && tg.themeParams.bg_color) {
      document.documentElement.style.setProperty("--tg-bg", tg.themeParams.bg_color);
    }
  } catch (_) {}
}

document.addEventListener("DOMContentLoaded", () => {
  setupTelegramWebApp();
  updateStatsDisplay();

  const startBtn = document.getElementById("welcome-start-btn");
  if (startBtn) {
    startBtn.addEventListener("click", showHeroSelect);
  } else {
    startGame();
  }

  document.getElementById("welcome-leaderboard-btn")?.addEventListener("click", showLeaderboard);
  document.getElementById("leaderboard-back-btn")?.addEventListener("click", hideLeaderboard);
  document.getElementById("hero-back-btn")?.addEventListener("click", hideHeroSelect);
  document.getElementById("hero-confirm-btn")?.addEventListener("click", confirmHeroAndStart);
});

window.pickChoice = pickChoice;
window.advanceGame = advanceGame;
window.restartGame = restartGame;
window.startGame = startGame;
