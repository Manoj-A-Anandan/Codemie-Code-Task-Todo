# TODO Application High-Level Design (HLD)

## Document Control
- Project: **mm-learning-group-1**
- Repository: **Manoj-A-Anandan/Codemie-Code-Task-Todo**
- Baseline: **main**
- Feature: **Add Optional Due Dates and Overdue Identification to Tasks**
- Inputs:
  - Approved requirements: `docs/requirements/FRD.md`
  - Approved implementation plan: `docs/planning/implementation-plan.md`

---

## 1. Scope
### In scope
- Optional due date selection when adding a task.
- Persist due dates to localStorage.
- Display due dates in **DD MMM YYYY**.
- Identify and visually mark overdue incomplete tasks.
- Preserve all existing functionality and backward compatibility.

### Out of scope (explicit)
- Reminders/notifications
- Editing due dates after creation
- Recurrence
- Sorting/filtering by due date

---

## 2. System Context
The application runs fully in the browser.

Actors:
- End user

External systems:
- Browser localStorage (persistence)

```mermaid
flowchart LR
  user([User]) --> app[Daylight TODO\n(index.html + styles.css + app.js)]
  app <--> storage[(Browser localStorage)]
```

---

## 3. Component Overview

| Component | Type | Responsibilities (current + proposed) |
|---|---|---|
| `index.html` | UI | Contains add-task form, filter buttons, list container; **add date input** (proposed). |
| `styles.css` | UI styling | Existing layout/styling/responsive; **add styles** for date input, due-date label, overdue indicator (proposed). |
| `app.js` | Logic/state | Load/save tasks, handle events, render list; **extend task model**, compute overdue, format dates, display due date and indicator (proposed). |
| `localStorage` | Persistence | Stores tasks array JSON under key `daylight-todos`; now includes optional `dueDate` fields. |

Constraints:
- Maintain existing event delegation approach (`button[data-action]`).
- Maintain existing filter semantics (`active` means incomplete, `completed` means done).

---

## 4. Major Workflows

### 4.1 Create task (with or without due date)
**Trigger:** user submits `#add-form`.

High-level steps:
1. Validate task text is not empty (existing).
2. Read optional `dueDate` from date input (new).
3. Create task object with required fields and optional `dueDate`.
4. Persist tasks to localStorage.
5. Re-render list.

### 4.2 Render tasks with due date + overdue indicator
**Trigger:** app load, filter change, add/toggle/delete/clear.

High-level steps:
1. Filter tasks based on active filter state.
2. For each visible task:
   - Create list item DOM
   - If `dueDate` exists, format to `DD MMM YYYY` and display
   - If overdue predicate is true, apply “overdue” styling/marker

### 4.3 Toggle completion or delete
**Trigger:** click delegated to `#task-list`.

High-level steps:
1. Identify `button[data-action]` target and `data-task-id`.
2. Update state (toggle `completed` or remove task).
3. Persist and re-render.

Overdue rules automatically re-evaluated during render.

---

## 5. Data Model (high level)

### 5.1 Task schema (proposed extension)
```ts
interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
  dueDate?: string; // "YYYY-MM-DD" (optional)
}
```

### 5.2 Storage
- Storage key: `daylight-todos`
- Value: JSON array of Task objects

Backward compatibility:
- Existing stored tasks without `dueDate` remain valid and render normally.

---

## 6. Date formatting and comparison approach

### 6.1 Display formatting (FR-004)
- Use `Intl.DateTimeFormat` to format a date into **DD MMM YYYY**.
- Input string `YYYY-MM-DD` must be converted to a Date in a way that avoids timezone shifting.

> Design note: A robust approach is to parse the date-only string and construct a local date (year, monthIndex, day) to avoid UTC conversion issues.

### 6.2 Overdue predicate (FR-005/006/007)
A task is overdue if:
- `dueDate` exists and is valid
- `completed === false`
- `dueDate < todayLocalDate` (strictly earlier)

“Due today” is not overdue.

---

## 7. Error handling
Maintain existing behavior:
- Continue `try/catch` around localStorage parse and set.
- Ensure invalid/missing `dueDate` does not throw; treat as absent.

---

## 8. Security considerations
- Continue using `textContent` for task text (prevents HTML injection).
- Treat localStorage as untrusted input (continue filtering in `loadTasks()`).

No authN/authZ is present or added.

---

## 9. Dependencies & Constraints
Dependencies:
- Browser support for `localStorage` and `Intl.DateTimeFormat`.

Constraints:
- Do not introduce new frameworks.
- Do not change storage key.
- Keep UI usable on mobile (<=520px styles already present).

---

## 10. Mapping to Implementation Tasks
- UI indicator decision: **TASK-001**
- UI date input: **TASK-002**
- Task model + creation: **TASK-003**
- Date comparison helpers: **TASK-004**
- Due date rendering: **TASK-005**
- Overdue styling: **TASK-006**
- Persistence/backward compatibility: **TASK-007**
- Regression testing: **TASK-008**
- Manual test documentation: **TASK-009**
