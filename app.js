const STORAGE_KEY = "daylight-todos";
const taskForm = document.querySelector("#add-form");
const taskInput = document.querySelector("#task-input");
const dueDateInput = document.querySelector("#due-date-input");
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

  const dueDateRaw = dueDateInput?.value?.trim() ?? "";
  const dueDate = dueDateRaw ? parseDateOnlyString(dueDateRaw) : null;
  if (dueDateRaw && !dueDate) {
    dueDateInput?.focus();
    return;
  }

  tasks.unshift({
    id: createId(),
    text,
    completed: false,
    createdAt: Date.now(),
    ...(dueDate ? { dueDate } : {}),
  });
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

function getLocalISODate(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDateOnlyString(value) {
  if (typeof value !== "string") return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return value;
}

function formatDueDateForDisplay(isoDate) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
  if (!match) return isoDate;

  const year = match[1];
  const monthIndex = Number(match[2]) - 1;
  const day = match[3];

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = months[monthIndex] ?? match[2];

  return `${day} ${month} ${year}`;
}

function formatDueDateForAria(isoDate) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
  if (!match) return isoDate;

  const year = match[1];
  const monthIndex = Number(match[2]) - 1;
  const day = match[3];

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = months[monthIndex] ?? match[2];

  return `${month} ${day}, ${year}`;
}

function isOverdue(task, todayIso = getLocalISODate()) {
  return !task.completed && typeof task.dueDate === "string" && task.dueDate < todayIso;
}

function loadTasks() {
  try {
    const storedTasks = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    if (!Array.isArray(storedTasks)) return [];
    return storedTasks
      .filter(
        (task) =>
          task &&
          typeof task.id === "string" &&
          typeof task.text === "string" &&
          typeof task.completed === "boolean",
      )
      .map((task) => {
        const dueDate = parseDateOnlyString(task.dueDate);
        return {
          ...task,
          ...(dueDate ? { dueDate } : {}),
        };
      });
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

  const todayIso = getLocalISODate();
  taskList.replaceChildren(...visibleTasks.map((task) => createTaskElement(task, todayIso)));
}

function createTaskElement(task, todayIso = getLocalISODate()) {
  const item = document.createElement("li");
  const overdue = isOverdue(task, todayIso);
  item.className = `task-item${task.completed ? " is-completed" : ""}${overdue ? " is-overdue" : ""}`;
  item.dataset.taskId = task.id;

  const toggleButton = document.createElement("button");
  toggleButton.className = "task-toggle";
  toggleButton.type = "button";
  toggleButton.dataset.action = "toggle";
  toggleButton.setAttribute("aria-label", `${task.completed ? "Mark as not done" : "Complete"}: ${task.text}`);
  toggleButton.setAttribute("aria-pressed", String(task.completed));
  toggleButton.innerHTML = '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m3.5 8 3 3 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  const meta = document.createElement("div");
  meta.className = "task-meta";

  const text = document.createElement("span");
  text.className = "task-text";
  text.textContent = task.text;

  meta.append(text);

  if (typeof task.dueDate === "string") {
    const dueBadge = document.createElement("span");
    dueBadge.className = "task-due-date";
    dueBadge.textContent = formatDueDateForDisplay(task.dueDate);

    const ariaDue = formatDueDateForAria(task.dueDate);
    dueBadge.setAttribute("aria-label", `Due ${ariaDue}${overdue ? " (Overdue)" : ""}`);
    dueBadge.setAttribute("role", "note");

    meta.append(dueBadge);
  }

  const deleteButton = document.createElement("button");
  deleteButton.className = "delete-button";
  deleteButton.type = "button";
  deleteButton.dataset.action = "delete";
  deleteButton.setAttribute("aria-label", `Delete: ${task.text}`);
  deleteButton.textContent = "×";

  item.append(toggleButton, meta, deleteButton);
  return item;
}

render();
