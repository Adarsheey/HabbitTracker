// Load habits on page load
document.addEventListener("DOMContentLoaded", renderHabits);

// Add Habit button
document.getElementById("addHabitBtn").addEventListener("click", addHabit);

// Function to add a new habit
function addHabit() {
  const habitInput = document.getElementById("habitInput");
  const habitName = habitInput.value.trim();

  if (!habitName) return; // prevent empty input

  const habits = JSON.parse(localStorage.getItem("habits")) || [];

  const newHabit = {
    name: habitName,
    streak: 0,
    lastDate: null
  };

  habits.push(newHabit);
  localStorage.setItem("habits", JSON.stringify(habits));

  habitInput.value = ""; // clear input
  renderHabits();
}

// Function to mark a habit as done (with streak logic)
function markHabit(index) {
  const habits = JSON.parse(localStorage.getItem("habits")) || [];
  const today = new Date().toDateString();
  let message = "";

  // First time logging
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
      // consecutive day → increase streak
      habits[index].streak += 1;
    } else if (diffDays > 1) {
      // missed days → reset streak
      habits[index].streak = 1;
      message = "⚠️ Streak broken!";
    }
  }

  // Save today's log
  habits[index].lastDate = today;
  localStorage.setItem("habits", JSON.stringify(habits));

  // Refresh UI
  renderHabits();

  // Show streak broken alert
  if (message) {
    alert(message);
  }
}

// Function to render all habits
function renderHabits() {
  const habits = JSON.parse(localStorage.getItem("habits")) || [];
  const habitList = document.getElementById("habitList");

  habitList.innerHTML = ""; // clear old list

  habits.forEach((habit, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      ${habit.name} - 🔥 ${habit.streak} days
      <button onclick="markHabit(${index})">Done</button>
    `;
    habitList.appendChild(li);
  });
}
