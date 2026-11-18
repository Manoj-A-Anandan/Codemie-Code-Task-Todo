# Low-Level Design (LLD) — EPMCDMETST-72039

## 1. Scope
Add optional due dates to tasks and overdue identification for incomplete tasks, while preserving existing task behaviors and backward compatibility with stored data.

## 2. Verified modules / files
- `index.html` — add form and list markup.
- `app.js` — state, persistence, rendering.
- `styles.css` — presentation and responsive behavior.

## 3. Data model changes

### 3.1 Task model extension
Current persisted task validation checks `id`, `text`, `completed`.

**Proposed field:**
- `dueDate?: string` — ISO local date string `YYYY-MM-DD`.

**Back-compat expectations:**
- Existing tasks without `dueDate` remain valid.
- If `dueDate` exists but is invalid, treat as absent (do not crash).

## 4. UI changes (index.html)

### 4.1 Add form inputs
- Existing elements:
  - `#task-input` text input (required)
  - submit button

**Proposed additions (identifiers are proposed):**
- Add optional due date control:
  - `<label class="sr-only" for="due-date-input">Due date</label>`
  - `<input id="due-date-input" name="dueDate" type="date" />`

### 4.2 Layout
- Keep add form single row on desktop.
- At `@media (max-width: 520px)`, allow wrapping or reduce widths so the new date input remains usable.

## 5. App logic changes (app.js)

### 5.1 New/updated DOM references
- Existing: `taskForm`, `taskInput`, etc.
- **Proposed:** `const dueDateInput = document.querySelector("#due-date-input");`

### 5.2 Task creation flow
Current submit handler creates:
```js
{ id, text, completed: false, createdAt: Date.now() }
```

**Proposed behavior:**
- Read `dueDateInput.value`.
- If non-empty, include `dueDate` in task object; otherwise omit.
- Clear `dueDateInput.value = ""` after successful add.

**Validation rules:**
- Task text is required (existing).
- Due date optional; if provided from date input it will be `YYYY-MM-DD`. If user agent provides other value, validate and ignore if invalid.

### 5.3 Loading tasks (defensive parsing)
`loadTasks()` currently filters:
- `task && typeof id === "string" && typeof text === "string" && typeof completed === "boolean"`

**Proposed extension:**
- If `task.dueDate` is `undefined` → OK.
- If `task.dueDate` exists → must be a string matching `/^\d{4}-\d{2}-\d{2}$/`.
  - If invalid, either:
    - Option A (recommended): drop the dueDate property but keep the task (requires mapping) (**proposed**), or
    - Option B: filter out the whole task.

> Note: Option A preserves more user data but requires a `map` step. If keeping existing filter-only pattern, Option B is simpler but may delete tasks; confirm preference during implementation.

### 5.4 Date helpers
**Proposed helper identifiers (new):**

1) `getLocalISODate(date = new Date()) => string`
- Output `YYYY-MM-DD` using local date parts:
  - `year = date.getFullYear()`
  - `month = String(date.getMonth()+1).padStart(2,"0")`
  - `day = String(date.getDate()).padStart(2,"0")`

2) `isValidIsoDateString(value) => boolean`
- Returns true if matches ISO date regex.

3) `isOverdue(task, todayIso = getLocalISODate()) => boolean`
- Return `false` if `task.completed`.
- Return `false` if no `task.dueDate`.
- Return `task.dueDate < todayIso`.

4) `formatDueDate(isoDateString) => string`
- Parse ISO pieces and create local date: `new Date(y, m-1, d)`.
- Format with `Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" })`.
- Ensure output matches `DD MMM YYYY` (e.g., `05 Jan 2027`).

### 5.5 Rendering updates (`createTaskElement`)
Current DOM structure:
- `<li class="task-item ..." data-task-id>`
  - toggle button
  - `<span class="task-text">...`
  - delete button

**Proposed additions (conditional):**
- If `task.dueDate` exists and valid:
  - add a metadata container (proposed class: `.task-meta`) containing:
    - due date text element (proposed class: `.task-due-date`)
- If overdue:
  - add CSS class `is-overdue` to `li.task-item`
  - add visible badge/label (proposed class: `.task-badge--overdue`, text `Overdue`)

**Accessibility:**
- Badge should be text-based (“Overdue”), not color-only.
- Optionally incorporate due date and overdue into `aria-label` on toggle button:
  - e.g., `Complete: <text>. Due <formatted>. Overdue.` (proposed; confirm during implementation).

### 5.6 Event handling and state updates
No changes expected to click delegation pattern:
- It already uses `closest("button[data-action]")`, so adding nested spans must not break it.
- Overdue state must update on toggle; since toggle triggers `saveAndRender()`, re-render will recompute overdue.

### 5.7 Persistence behavior
- Continue using `saveAndRender()` with `JSON.stringify(tasks)`.
- Ensure dueDate persists as part of task object.

## 6. Styling changes (styles.css)

### 6.1 Overdue styling
**Proposed CSS hooks:**
- `.task-item.is-overdue` — add left border/background highlight.
- `.task-badge--overdue` — small pill with high contrast and readable text.

### 6.2 Due date styling
- `.task-due-date` — smaller muted text.
- Keep spacing so that tasks without due dates render identically (no empty containers).

### 6.3 Responsive
- Adjust `.add-form` and input widths so date input fits.
- If needed, allow `.add-form` to wrap on small screens.

## 7. Edge cases
- Task has dueDate but completed → must not show overdue state.
- Due date equals today → not overdue.
- Invalid dueDate in localStorage → treat as absent.
- Browser locale differences → enforce formatting locale for due date display.
- Browser without `input[type=date]` support → user may type arbitrary string; validation must prevent crashes.

## 8. Testability notes
Because there is no test framework, prefer pure helper functions that can be evaluated from DevTools console.

**Manual verification checklist (maps to ACs):**
- Create with due date → saved + reload persists (AC-001, AC-007).
- Create without due date → saved + no label + reload persists (AC-002).
- Due date display format `DD MMM YYYY` (AC-003).
- Overdue only when dueDate < today and incomplete (AC-004).
- Completed never overdue (AC-005).
- Due today not overdue (AC-006).
- Filters and actions unaffected (AC-008).
- Old tasks without dueDate still load (AC-009).
