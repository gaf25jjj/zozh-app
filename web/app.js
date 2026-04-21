let user = {
  name: "",
  age: 0,
  height: 0,
  weight: 0
};

let health = 100;
let energy = 100;
let immunity = 100;
let stress = 0;
let risk = 0;

let step = 0;

function clamp(v){ return Math.max(0, Math.min(100, v)); }

function updateStats(){
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

  document.getElementById("health-bar").style.width = health + "%";
  document.getElementById("energy-bar").style.width = energy + "%";
  document.getElementById("immunity-bar").style.width = immunity + "%";
  document.getElementById("stress-bar").style.width = stress + "%";
  document.getElementById("risk-bar").style.width = risk + "%";
}

function showProfileForm(){
  document.getElementById("scene-title").textContent = "Профиль";

  document.getElementById("scene").innerHTML = `
    <div class="scene-panel">
      <p class="scene-text">Введи данные о себе</p>

      <input id="name" placeholder="Имя" class="input"/>
      <input id="age" placeholder="Возраст" type="number" class="input"/>
      <input id="height" placeholder="Рост (см)" type="number" class="input"/>
      <input id="weight" placeholder="Вес (кг)" type="number" class="input"/>

      <button class="choice-btn primary" onclick="saveProfile()">Начать</button>
    </div>
  `;
}

function saveProfile(){
  user.name = document.getElementById("name").value || "Пользователь";
  user.age = +document.getElementById("age").value;
  user.height = +document.getElementById("height").value;
  user.weight = +document.getElementById("weight").value;

  step = 1;
  next();
}

function next(){
  switch(step){
    case 1:
      render("Утро", "Ты позавтракал?",
        () => { energy+=10; immunity+=5; },
        () => { energy-=15; stress+=10; risk+=5; }
      );
      break;

    case 2:
      render("Вода", "Пил воду утром?",
        () => { immunity+=5; },
        () => { risk+=5; }
      );
      break;

    case 3:
      render("Движение", "Ты двигался днём?",
        () => { health+=10; stress-=5; },
        () => { stress+=10; risk+=5; }
      );
      break;

    case 4:
      render("Обед", "Что ты ел?",
        () => { health+=5; },
        () => { risk+=10; }
      );
      break;

    case 5:
      render("Стресс", "Был ли стресс?",
        () => { stress+=15; immunity-=5; },
        () => { stress-=5; }
      );
      break;

    case 6:
      render("Спорт", "Занимался спортом?",
        () => { health+=10; immunity+=5; },
        () => { risk+=5; }
      );
      break;

    case 7:
      render("Курение", "Ты курил сегодня?",
        () => { risk+=15; immunity-=10; },
        () => { }
      );
      break;

    case 8:
      render("Алкоголь", "Ты пил алкоголь?",
        () => { risk+=10; energy-=10; },
        () => { }
      );
      break;

    case 9:
      render("Вода за день", "Сколько воды выпил?",
        () => { health+=5; },
        () => { risk+=5; }
      );
      break;

    case 10:
      render("Сон", "Выспался?",
        () => { energy+=10; stress-=5; },
        () => { stress+=10; risk+=10; }
      );
      break;

    default:
      finish();
  }

  updateStats();
}

function render(title, text, good, bad){
  document.getElementById("scene-title").textContent = title;

  document.getElementById("scene").innerHTML = `
    <div class="scene-panel">
      <p class="scene-text">${text}</p>

      <div class="choice-grid">
        <button class="choice-btn primary" onclick="choose(true)">Да</button>
        <button class="choice-btn secondary" onclick="choose(false)">Нет</button>
      </div>
    </div>
  `;

  window.currentGood = good;
  window.currentBad = bad;
}

function choose(val){
  if(val){
    currentGood();
  } else {
    currentBad();
  }
  step++;
  next();
}

function finish(){
  let bmi = user.weight / ((user.height/100)**2);

  let rec = [];

  if(stress>50) rec.push("Снизить стресс");
  if(risk>50) rec.push("Снизить факторы риска");
  if(energy<50) rec.push("Нормализовать сон");
  if(immunity<50) rec.push("Укреплять иммунитет");

  document.getElementById("scene-title").textContent = "Результат";

  document.getElementById("scene").innerHTML = `
    <div class="result-panel">
      <h3>${user.name}, твой результат</h3>

      <p>ИМТ: ${bmi.toFixed(1)}</p>

      <p>Здоровье: ${health}</p>
      <p>Стресс: ${stress}</p>
      <p>Риск: ${risk}</p>

      <h4>Рекомендации:</h4>
      <ul>${rec.map(r=>`<li>${r}</li>`).join("")}</ul>

      <button class="restart-btn" onclick="location.reload()">Сначала</button>
    </div>
  `;
}

document.addEventListener("DOMContentLoaded", ()=>{
  showProfileForm();
});
