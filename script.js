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
function markHabit(index) {
  const habits = JSON.parse(localStorage.getItem("habits")) || [];
  const today = new Date().toDateString();
  let message = "";

  // First time logging → just set streak = 1
  if (!habits[index].lastDate) {
    habits[index].streak = 1;
  } else {
    const lastDate = new Date(habits[index].lastDate);
    const diffDays = Math.floor(
      (new Date(today) - lastDate) / (1000 * 60 * 60 * 24)
    );

    if (habits[index].lastDate === today) {
      // already logged today → do nothing
      return;
    } else if (diffDays === 1) {
      // consecutive day
      habits[index].streak += 1;
    } else if (diffDays > 1) {
      // missed days
      habits[index].streak = 1;
      message = "⚠ Streak broken!";
    }
  }

  // Save today's log
  habits[index].lastDate = today;
  localStorage.setItem("habits", JSON.stringify(habits));

  // Refresh UI
  renderHabits();

  // Show streak broken alert AFTER updating
  if (message) {
    alert(message);
  }
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

