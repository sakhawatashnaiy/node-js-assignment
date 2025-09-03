const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");

async function fetchTasks() {
  const res = await fetch("/api/tasks");
  const tasks = await res.json();
  taskList.innerHTML = "";
  tasks.forEach(task => {
    const li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between align-items-center";
    li.innerHTML = `
      <span class="${task.completed ? "text-decoration-line-through" : ""}">
        ${task.title}
      </span>
      <div>
        <button class="btn btn-sm btn-success me-2" onclick="toggleTask('${task._id}', ${task.completed})">✔</button>
        <button class="btn btn-sm btn-danger" onclick="deleteTask('${task._id}')">✖</button>
      </div>
    `;
    taskList.appendChild(li);
  });
}

taskForm.addEventListener("submit", async e => {
  e.preventDefault();
  await fetch("/api/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: taskInput.value })
  });
  taskInput.value = "";
  fetchTasks();
});

async function toggleTask(id, completed) {
  await fetch(`/api/tasks/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ completed: !completed })
  });
  fetchTasks();
}

async function deleteTask(id) {
  await fetch(`/api/tasks/${id}`, { method: "DELETE" });
  fetchTasks();
}

// Load tasks on page load
fetchTasks();
