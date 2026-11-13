# Low-Level Design (LLD) — EPMCDMETST-72039

## 1. Scope
Implement optional due dates and overdue identification in the existing vanilla JS app.

**In scope** (per requirements):
- Add optional due date input on task creation.
- Persist optional dueDate to localStorage.
- Display due date in `DD MMM YYYY`.
- Mark overdue when: due date < local today AND incomplete.
- Backward compatibility for existing tasks.

**Out of scope**:
- Editing due dates.
- Sorting/filtering by due date.
- Notifications.

## 2. Existing modules/files impacted
- `index.html` — add optional due-date input.
- `app.js` — task creation, load normalization, helpers, rendering.
- `styles.css` — style date input, due date display, overdue badge.

No new source files are required.

## 3. Detailed design

## 3.1 HTML changes (`index.html`)
**Current evidence:** add form exists with `#add-form` and `#task-input`.

**Proposed additions (explicitly new markup):**
- Add an accessible label (can be `.sr-only`) for the date input.
- Add a date input:
  - `id="due-date-input"`
  - `type="date"`
  - optional (no `required` attribute)

Example snippet (placement inside the existing form, after `#task-input`):
```html
<label class="sr-only" for="due-date-input">Due date (optional)</label>
<input
  id="due-date-input"
  class="due-date-input"
  name="dueDate"
  type="date"
/>
```

**Validation:** none in HTML (optional). The JS submit handler continues to validate only text.

## 3.2 Task object changes (`app.js`)
### 3.2.1 Task shape (runtime)
Existing fields remain unchanged. New optional field:
- `dueDate?: string` — ISO date-only `YYYY-MM-DD`

### 3.2.2 Task creation
**Existing logic:**
- on submit: read `taskInput`, validate non-empty, `tasks.unshift({...})`, save.

**Proposed logic:**
- Bind the new input:
  - `const dueDateInput = document.querySelector('#due-date-input');` (proposed addition)
- On submit:
  - `const dueDateRaw = dueDateInput?.value ?? ''`.
  - If empty → omit `dueDate` or set `undefined`.
  - If non-empty → store as-is (HTML date input returns ISO date-only).
- Post-submit:
  - clear both inputs: `taskInput.value = ''` and `dueDateInput.value = ''`.

**Edge cases:**
- If `#due-date-input` is not found (unexpected DOM mismatch), creation still works without due date.

## 3.3 Persistence and loading (`app.js`)
### 3.3.1 localStorage key
No change: `STORAGE_KEY = 'daylight-todos'`.

### 3.3.2 `loadTasks()` behavior
**Current behavior:**
- parses JSON array and filters tasks with valid `id/text/completed`.

**Proposed enhancement (non-breaking):**
- Keep the required-field filter.
- Normalize `dueDate` for tasks that pass required validation:
  - If `dueDate` missing → leave as-is.
  - If `dueDate` is a string matching `/^\d{4}-\d{2}-\d{2}$/` → keep.
  - Otherwise → set to `undefined` (do not drop the task).

**Rationale:**
- Meets FR-005 and NFR-002; avoids crashes on malformed storage.

### 3.3.3 `saveAndRender()`
- No architectural change; continues to `JSON.stringify(tasks)`.

## 3.4 Date handling helpers (`app.js`)
> These are **proposed additions** in `app.js`.

### 3.4.1 `isValidIsoDateOnly(iso)`
- Input: `unknown`
- Output: `boolean`
- Logic: `typeof iso === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(iso)`

### 3.4.2 `parseIsoDateOnly(iso)`
- Input: `string`
- Output: `Date | null`
- Logic:
  - Split into [y, m, d].
  - Construct `new Date(y, m-1, d)`.
  - Validate round-trip: ensure resulting date has same y/m/d in local time.
  - Return null if invalid.

**Why not** `new Date(iso)`?
- Some engines treat `YYYY-MM-DD` as UTC; this violates local-date correctness.

### 3.4.3 `toLocalDateKey(date)`
- Input: `Date`
- Output: `number` of form `YYYYMMDD`.
- Logic:
  - `y = date.getFullYear()`
  - `m = date.getMonth() + 1`
  - `d = date.getDate()`
  - return `y*10000 + m*100 + d`

### 3.4.4 `isOverdue(task, now = new Date())`
- Input: task object, optional `now` for testability.
- Output: boolean.
- Rules:
  - if no `task.dueDate` → false
  - if `task.completed` → false
  - parse due date; if invalid → false
  - overdue if `dueKey < todayKey`

### 3.4.5 `formatDueDate(iso)`
- Input: ISO date-only.
- Output: string `DD MMM YYYY`.
- Implementation:
  - parse to local date.
  - format with `Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })`.

**Note:** The app already uses `Intl.DateTimeFormat(undefined, ...)` for today label. For due dates we will force `en-GB` to guarantee order `DD MMM YYYY` as required.

## 3.5 Rendering changes (`app.js`)
### 3.5.1 `createTaskElement(task)`
**Current structure:**
- `<li class="task-item ...">`
  - toggle button
  - `span.task-text`
  - delete button

**Proposed structure additions:**
- compute `const overdue = isOverdue(task);`
- update `li` class:
  - include `is-overdue` if overdue (and not completed).
- add a metadata container near the text (proposed):
  - `<span class="task-meta">` containing:
    - due date element (optional)
    - overdue badge (optional)

Proposed DOM nodes (created with `document.createElement`):
- `.task-due-date` (only if dueDate present)
- `.task-badge.task-badge--overdue` with text "Overdue" (only if overdue)
  - Set `role="status"` so assistive tech can announce status.

**Accessibility:**
- Overdue is conveyed via visible label text; not color only.

### 3.5.2 `render()`
No filter changes. It continues to filter by completion status only.
- Overdue is purely visual; it must not affect filter behavior.

## 3.6 CSS changes (`styles.css`)
> Additions only; do not remove existing styles.

### 3.6.1 Add-form layout
- Add `.due-date-input` styles so it doesn’t consume full width:
  - e.g., `flex: 0 0 auto; max-width: ...` (exact values tuned during implementation)
  - keep the text input as `width: 100%`.

### 3.6.2 Task metadata
- `.task-meta`: inline-flex, align center, small gap.
- `.task-due-date`: muted text (`var(--muted)`), smaller font.
- `.task-badge--overdue`: high contrast background (e.g., red-ish) and readable text.
- `.task-item.is-overdue .task-text`: optional subtle emphasis (ensure not conflicting with completed state).

### 3.6.3 Responsive (<=520px)
- Ensure `.add-form` still fits; date input might reduce size or wrap.
- Ensure task meta doesn’t cause overflow; allow wrapping if needed.

## 4. API contracts (internal)
No network/API endpoints.

## 5. Validation & error handling
- On submit: continue to enforce non-empty task text.
- On load:
  - invalid JSON → catch and return `[]` (existing).
  - invalid dueDate shape/value → ignore dueDate only.
- On save:
  - localStorage write errors are logged; render still proceeds (existing).

## 6. Key edge cases
- **Due date missing**: no due date label displayed; never overdue.
- **Due date = today**: not overdue.
- **Completed + past due date**: not overdue.
- **Malformed stored dueDate**: task loads; dueDate ignored; no overdue.
- **Timezone boundaries**: parse due date into local midnight and compare via local date keys.

## 7. Implementation considerations
- Keep new logic isolated in helper functions to reduce regression risk.
- Prefer `textContent` over `innerHTML` for due date and badges.
- Ensure `createTaskElement()` remains efficient; compute overdue once per task render.
