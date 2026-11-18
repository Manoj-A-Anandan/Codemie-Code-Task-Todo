const STORAGE_KEY = "daylight-todos";
const taskForm = document.querySelector("#add-form");
const taskInput = document.querySelector("#task-input");
const dueDateInput = document.querySelector("#task-due-date");
const taskList = document.querySelector("#task-list");
const emptyState = document.querySelector("#empty-state");
const taskTotal = document.querySelector("#task-total");
const remainingCount = document.querySelector("#remaining-count");
const clearCompletedButton = document.querySelector("#clear-completed");
const filterButtons = document.querySelectorAll(".filter-button");
const todayLabel = document.querySelector("#today-label");

let tasks = loadTasks();
let activeFilter = "all";

todayLabel.textContent = new Intl.DateTimeFormat(undefined, {
  weekday: "short",
  month: "long",
  day: "numeric",
}).format(new Date());

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = taskInput.value.trim();
  if (!text) {
    taskInput.focus();
    return;
  }

  const newTask = {
    id: createId(),
    text,
    completed: false,
    createdAt: Date.now(),
  };
  const dueDate = dueDateInput ? dueDateInput.value : "";
  if (dueDate && parseIsoDateToLocalDate(dueDate)) {
    newTask.dueDate = dueDate;
  }
  tasks.unshift(newTask);
  taskInput.value = "";
  if (dueDateInput) dueDateInput.value = "";
  saveAndRender();
  taskInput.focus();
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    filterButtons.forEach((filterButton) => {
      const selected = filterButton === button;
      filterButton.classList.toggle("is-active", selected);
      filterButton.setAttribute("aria-pressed", String(selected));
    });
    render();
  });
});

taskList.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const taskItem = button.closest("[data-task-id]");
  const task = tasks.find((item) => item.id === taskItem?.dataset.taskId);
  if (!task) return;

  if (button.dataset.action === "toggle") {
    task.completed = !task.completed;
  } else if (button.dataset.action === "delete") {
    tasks = tasks.filter((item) => item.id !== task.id);
  }
  saveAndRender();
});

clearCompletedButton.addEventListener("click", () => {
  tasks = tasks.filter((task) => !task.completed);
  saveAndRender();
});

function createId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

// Converts a "YYYY-MM-DD" string to a Date at local midnight, or null if invalid.
function parseIsoDateToLocalDate(isoString) {
  if (typeof isoString !== "string") return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoString);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }
  return date;
}

function getTodayLocalMidnight() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

const MONTH_ABBREVIATIONS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Formats a "YYYY-MM-DD" string as "DD MMM YYYY" (locale-independent), or null if invalid.
function formatDueDate(isoString) {
  const date = parseIsoDateToLocalDate(isoString);
  if (!date) return null;
  const day = String(date.getDate()).padStart(2, "0");
  const month = MONTH_ABBREVIATIONS[date.getMonth()];
  return `${day} ${month} ${date.getFullYear()}`;
}

function isTaskOverdue(task, todayLocalMidnight = getTodayLocalMidnight()) {
  if (task.completed === true) return false;
  const due = parseIsoDateToLocalDate(task.dueDate);
  if (!due) return false;
  return due < todayLocalMidnight;
}

function loadTasks() {
  try {
    const storedTasks = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    if (!Array.isArray(storedTasks)) return [];
    return storedTasks.filter(
      (task) =>
        task &&
        typeof task.id === "string" &&
        typeof task.text === "string" &&
        typeof task.completed === "boolean",
    );
  } catch (error) {
    console.error("Could not load saved tasks.", error);
    return [];
  }
}

function saveAndRender() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error("Could not save tasks to local storage.", error);
  }
  render();
}

function render() {
  const visibleTasks = tasks.filter((task) => {
    if (activeFilter === "active") return !task.completed;
    if (activeFilter === "completed") return task.completed;
    return true;
  });
  const remaining = tasks.filter((task) => !task.completed).length;
  const completed = tasks.length - remaining;

  taskTotal.textContent = String(tasks.length);
  remainingCount.textContent =
    remaining === 0
      ? "You’re all caught up ✨"
      : `${remaining} ${remaining === 1 ? "task" : "tasks"} left to do`;
  clearCompletedButton.hidden = completed === 0;
  emptyState.hidden = visibleTasks.length !== 0;
  const todayLocalMidnight = getTodayLocalMidnight();
  taskList.replaceChildren(...visibleTasks.map((task) => createTaskElement(task, todayLocalMidnight)));
}

function createTaskElement(task, todayLocalMidnight = getTodayLocalMidnight()) {
  const overdue = isTaskOverdue(task, todayLocalMidnight);
  const item = document.createElement("li");
  item.className = `task-item${task.completed ? " is-completed" : ""}${overdue ? " is-overdue" : ""}`;
  item.dataset.taskId = task.id;

  const toggleButton = document.createElement("button");
  toggleButton.className = "task-toggle";
  toggleButton.type = "button";
  toggleButton.dataset.action = "toggle";
  toggleButton.setAttribute("aria-label", `${task.completed ? "Mark as not done" : "Complete"}: ${task.text}`);
  toggleButton.setAttribute("aria-pressed", String(task.completed));
  toggleButton.innerHTML = '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m3.5 8 3 3 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  const text = document.createElement("span");
  text.className = "task-text";
  text.textContent = task.text;

  const deleteButton = document.createElement("button");
  deleteButton.className = "delete-button";
  deleteButton.type = "button";
  deleteButton.dataset.action = "delete";
  deleteButton.setAttribute("aria-label", `Delete: ${task.text}`);
  deleteButton.textContent = "×";

  const content = document.createElement("div");
  content.className = "task-content";
  content.append(text);

  const formattedDueDate = formatDueDate(task.dueDate);
  if (formattedDueDate) {
    const meta = document.createElement("span");
    meta.className = "task-meta";

    const due = document.createElement("span");
    due.className = "task-due-date";
    const dueLabel = document.createElement("span");
    dueLabel.className = "sr-only";
    dueLabel.textContent = "Due date: ";
    due.append(dueLabel, formattedDueDate);
    meta.append(due);

    if (overdue) {
      const badge = document.createElement("span");
      badge.className = "badge badge--overdue";
      badge.textContent = "Overdue";
      meta.append(badge);
    }
    content.append(meta);
  }

  item.append(toggleButton, content, deleteButton);
  return item;
}

render();
