
const habitInput = document.getElementById("habitInput");
const addHabitBtn = document.getElementById("addHabitBtn");
const habitList = document.getElementById("habitList");

let habits = JSON.parse(localStorage.getItem("habits")) || [];

function saveHabits() {
  localStorage.setItem("habits", JSON.stringify(habits));
}

// Render habits
function renderHabits() {
  habitList.innerHTML = "";
  habits.forEach((habit, index) => {
    const li = document.createElement("li");

    // Progress bar
    let progressHTML = '<div class="progress-bar">';
    for (let i = 0; i < 7; i++) {
      progressHTML += `<div class="day ${habit.weekLog.includes(i) ? "done" : ""}"></div>`;
    }
    progressHTML += '</div>';

    li.innerHTML = `
      <span>${habit.name} 🌟 <span class="streak">Streak: ${habit.streak}</span></span>
      <div>
        <button onclick="markDone(${index})">Done</button>
        <button onclick="resetHabit(${index})">🔄 Reset</button>
        <button onclick="deleteHabit(${index})">❌</button>
      </div>
      ${progressHTML}
    `;
    habitList.appendChild(li);
  });
  saveHabits();
}

// Add habit
addHabitBtn.addEventListener("click", () => {
  const habitName = habitInput.value.trim();
  if (habitName) {
    const habit = {
      name: habitName,
      streak: 0,
      lastCompleted: null,
      weekLog: [] // store days (0-6 for Sun-Sat)
    };
    habits.push(habit);
    renderHabits();
    habitInput.value = "";
  }
});

// Mark as done


// Mark as done with consecutive streak logic
function markDone(index) {
  const today = new Date();
  const todayStr = today.toDateString();
  const dayIndex = today.getDay();

  // Prevent double marking in the same day
  if (habits[index].lastCompleted === todayStr) {
    alert("Already marked as done today ✅");
    return;
  }

  if (habits[index].lastCompleted) {
    const lastDate = new Date(habits[index].lastCompleted);
    const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      // Consecutive day → increase streak
      habits[index].streak++;
    } else if (diffDays > 1) {
      // Missed one or more days → reset streak
      habits[index].streak = 1;
    }
  } else {
    // First time marking
    habits[index].streak = 1;
  }

  habits[index].lastCompleted = todayStr;

  // Weekly log update (store unique days only)
  if (!habits[index].weekLog.includes(dayIndex)) {
    habits[index].weekLog.push(dayIndex);
  }

  renderHabits();
}











// Reset habit
function resetHabit(index) {
  habits[index].weekLog = [];
  renderHabits();
}

// Delete habit
function deleteHabit(index) {
  habits.splice(index, 1);
  renderHabits();
}

// Initial render
renderHabits();

