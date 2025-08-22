// Elements
const habitInput = document.getElementById("habitInput");
const addHabitBtn = document.getElementById("addHabitBtn");
const habitList = document.getElementById("habitList");

// Load from storage
let habits = JSON.parse(localStorage.getItem("habits")) || [];

// ---------- Helpers ----------
const DAY_LABELS = ["S","M","T","W","T","F","S"];
const MS_PER_DAY = 24 * 60 * 60 * 1000;

function saveHabits() {
  localStorage.setItem("habits", JSON.stringify(habits));
}

function pad2(n){ return String(n).padStart(2,"0"); }
function dateKey(d){ // YYYY-MM-DD local
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  return `${x.getFullYear()}-${pad2(x.getMonth()+1)}-${pad2(x.getDate())}`;
}
function weekStartKey(d){ // start of week (Sunday) as YYYY-MM-DD
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const delta = x.getDay(); // 0..6 (Sun..Sat)
  x.setDate(x.getDate() - delta);
  return dateKey(x);
}
function ensureWeekFresh(habit) {
  const now = new Date();
  const currentWeek = weekStartKey(now);
  if (habit.weekStart !== currentWeek) {
    habit.weekStart = currentWeek;
    habit.weekLog = []; // clear last week's bars
  }
}

// ---------- Render ----------
function renderHabits() {
  habitList.innerHTML = "";
  habits.forEach((habit, index) => {
    ensureWeekFresh(habit);

    const li = document.createElement("li");

    // Top row: name + streak + controls
    const top = document.createElement("div");
    top.className = "habit-top";

    const name = document.createElement("div");
    name.className = "habit-name";
    name.textContent = habit.name + " ";
    const streak = document.createElement("span");
    streak.className = "streak";
    streak.textContent = `Streak: ${habit.streak}`;
    name.appendChild(streak);

    const controls = document.createElement("div");
    controls.className = "controls";
    controls.innerHTML = `
      <button onclick="markDone(${index})">Done</button>
      <button onclick="resetHabit(${index})">🔄 Reset</button>
      <button onclick="deleteHabit(${index})">❌</button>
    `;
    top.appendChild(name);
    top.appendChild(controls);

    // Progress bar (Sun..Sat)
    const bar = document.createElement("div");
    bar.className = "progress-bar";
    for (let i = 0; i < 7; i++) {
      const cell = document.createElement("div");
      cell.className = "day" + (habit.weekLog.includes(i) ? " done" : "");
      cell.setAttribute("data-label", DAY_LABELS[i]);
      bar.appendChild(cell);
    }

    li.appendChild(top);
    li.appendChild(bar);
    habitList.appendChild(li);
  });

  saveHabits();
}

// ---------- Add habit ----------
function addHabit() {
  const habitName = habitInput.value.trim();
  if (!habitName) return;

  const now = new Date();
  habits.push({
    name: habitName,
    streak: 0,
    lastCompleted: null,     // YYYY-MM-DD
    weekLog: [],             // [0..6] for Sun..Sat done this week
    weekStart: weekStartKey(now)
  });

  habitInput.value = "";
  renderHabits();
}

addHabitBtn.addEventListener("click", addHabit);
habitInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addHabit();
});

// ---------- Mark done (with consecutive-day logic) ----------
function markDone(index) {
  const h = habits[index];
  ensureWeekFresh(h);

  const today = new Date();
  const todayKey = dateKey(today);
  const dayIndex = today.getDay();

  // Prevent double-marking same day
  if (h.lastCompleted === todayKey) {
    alert("Already marked as done today ✅");
    return;
  }

  if (h.lastCompleted) {
    const last = new Date(h.lastCompleted);
    const diffDays = Math.floor((today - last) / MS_PER_DAY);

    if (diffDays === 1) {
      // Consecutive → continue streak
      h.streak += 1;
    } else if (diffDays > 1) {
      // Missed one or more days → streak breaks (start new streak today)
      h.streak = 1;
    } else if (diffDays < 0) {
      // Clock issues/backdated lastCompleted; just start a new streak
      h.streak = 1;
    }
  } else {
    // First completion ever
    h.streak = 1;
  }

  h.lastCompleted = todayKey;

  // Update weekly bar (store unique day indices for this week)
  if (!h.weekLog.includes(dayIndex)) h.weekLog.push(dayIndex);

  renderHabits();
}

// ---------- Reset habit (weekly + streak) ----------
function resetHabit(index) {
  const h = habits[index];
  h.weekLog = [];
  h.streak = 0;
  h.lastCompleted = null;
  h.weekStart = weekStartKey(new Date());
  renderHabits();
}

// ---------- Delete habit ----------
function deleteHabit(index) {
  habits.splice(index, 1);
  renderHabits();
}

// Initial paint
renderHabits();
