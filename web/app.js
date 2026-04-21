let health = 100;
let energy = 100;
let immunity = 100;
let stress = 0;
let risk = 0;

function updateStats() {
  document.getElementById("health").innerText = health;
  document.getElementById("energy").innerText = energy;
  document.getElementById("immunity").innerText = immunity;
  document.getElementById("stress").innerText = stress;
  document.getElementById("risk").innerText = risk;
}

function choose(action) {
  if (action === "breakfast") {
    energy += 10;
    immunity += 5;
  } else if (action === "skip") {
    energy -= 15;
    stress += 10;
    risk += 5;
  }

  nextScene();
  updateStats();
}

function nextScene() {
  document.getElementById("scene").innerHTML = `
    <p>День. Что выберешь?</p>
    <button onclick="walk()">🚶 Прогулка</button>
    <button onclick="phone()">📱 Телефон</button>
  `;
}

function walk() {
  health += 10;
  stress -= 5;
  finish();
}

function phone() {
  stress += 10;
  energy -= 10;
  risk += 5;
  finish();
}

function finish() {
  let result = "";

  if (risk < 10) {
    result = "🟢 Отлично! Ты ведешь здоровый образ жизни";
  } else {
    result = "🔴 Есть риски! Обрати внимание на свои привычки";
  }

  document.getElementById("scene").innerHTML = `
    <h2>Результат</h2>
    <p>${result}</p>
    <button onclick="location.reload()">🔄 Сыграть снова</button>
  `;
}
