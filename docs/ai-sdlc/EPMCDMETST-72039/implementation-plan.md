# Implementation Plan

## 1. Story context
- **Story ID:** EPMCDMETST-72039
- **Title:** Add Optional Due Dates and Overdue Identification to Tasks
- **Jira:** https://jiraeu.epam.com/browse/EPMCDMETST-72039
- **Project:** Daylight ToDo
- **Base branch:** `main`

### Goal
Allow users to optionally set a due date when creating tasks, display that due date in `DD MMM YYYY` format, and visually identify overdue tasks (past local calendar date + incomplete). Preserve all existing behaviors and ensure older tasks continue to load.

## 2. Input requirements document
- **Path:** `docs/ai-sdlc/EPMCDMETST-72039/requirements.md`
- **Approval:** APPROVED (per workflow input)

## 3. Repository analysis (repo-aware)
### 3.1 Technology & architecture
- **Stack:** static HTML/CSS + vanilla JS
- **Entry points:** `index.html`, `styles.css`, `app.js`
- **Persistence:** browser `localStorage` under key `daylight-todos` (`STORAGE_KEY` constant)
- **Render pipeline:** `render()` filters `tasks` by `activeFilter` and uses `createTaskElement(task)` to build `<li>` items.

### 3.2 Current task model (from `app.js`)
Currently created tasks are:
```js
{ id: string, text: string, completed: boolean, createdAt: number }
```
`loadTasks()` validates `id`, `text`, `completed` and tolerates extra fields.

### 3.3 Key files/components
- `index.html`: Add form and list container; filters.
- `styles.css`: Layout + responsive rules for `.add-form`, `.task-item`.
- `app.js`: Form submit, toggle/delete, clear completed, load/save, render/createTaskElement.

## 4. Implementation objectives
1. Add **optional** due date input to the add-task form.
2. Store `dueDate` on new tasks when provided; omit/null when not.
3. Persist `dueDate` to localStorage and keep backwards compatibility.
4. Display due date in `DD MMM YYYY` format when present.
5. Determine overdue status using **local calendar date** comparison (date-only), and show an accessible visual indicator.
6. Ensure all existing actions and filters work unchanged for tasks with/without due dates.

## 5. Requirement-to-task mapping

### Legend
- **FR-###**, **NFR-###**, **AC-###**, **BR-###** reference IDs from the requirements document.

| Plan Task ID | Summary | Related Reqs |
|---|---|---|
| T-01 | Add optional due-date field to task creation UI | FR-001, NFR-001, AC-001, AC-002 |
| T-02 | Extend task creation to capture/store dueDate | FR-002, FR-003, BR-001, AC-001, AC-002 |
| T-03 | Define dueDate storage format & normalize on read/write | FR-004, FR-005, NFR-002, AC-007, AC-009, R-001, R-002 |
| T-04 | Add local-date overdue evaluation helper | FR-009..FR-011, BR-002..BR-005, NFR-002, AC-004..AC-006 |
| T-05 | Update rendering to display due date and overdue badge | FR-006..FR-008, FR-012, NFR-003, NFR-004, AC-003, AC-004 |
| T-06 | CSS updates for due date + badge and responsive layout | FR-012, NFR-003, NFR-004 |
| T-07 | Verify existing behaviors remain intact (manual regression checklist) | FR-013, FR-014, NFR-005, AC-008 |
| T-08 | Add/update developer documentation in plan notes (no code) | NFR-002, R-001..R-005 |

## 6. Detailed implementation tasks

### T-01 — Add optional due-date field to task creation UI
- **Description:** Add a `type="date"` input to the add form. Keep it optional; do not block task creation.
- **Related requirements:** FR-001, NFR-001, AC-001, AC-002
- **Expected files:** `index.html`, `styles.css`
- **Dependencies:** none
- **Implementation approach:**
  - Update `index.html` add form to include:
    - A label (can be visually hidden via `.sr-only`) for accessibility.
    - `<input id="due-date-input" name="dueDate" type="date">` placed after the task text input.
  - Ensure tab order and spacing remain clean.
- **Expected outcome:** User can optionally pick a date while creating a task.

### T-02 — Extend task creation to capture/store dueDate
- **Description:** Read the due date field on submit and include it in the task object only when provided.
- **Related requirements:** FR-002, FR-003, BR-001, AC-001, AC-002
- **Expected files:** `app.js`
- **Dependencies:** T-01
- **Implementation approach:**
  - Add `const dueDateInput = document.querySelector("#due-date-input");`
  - On submit:
    - Read `const dueDateRaw = dueDateInput.value;` (HTML date input returns `YYYY-MM-DD` or empty string).
    - Create task object with `dueDate: dueDateRaw || undefined` (or omit property if empty).
    - Clear input after save: `dueDateInput.value = "";`
- **Expected outcome:** Tasks are created with an optional `dueDate` field.

### T-03 — Define dueDate storage format & normalize on read/write
- **Description:** Use a stable, locale-independent storage format and ensure older tasks still load.
- **Related requirements:** FR-004, FR-005, NFR-002, AC-007, AC-009; Risks R-001, R-002, R-003
- **Expected files:** `app.js`
- **Dependencies:** T-02
- **Implementation approach:**
  - **Storage format:** ISO date-only string `YYYY-MM-DD`.
  - `loadTasks()` currently validates required fields and will keep tasks with/without `dueDate`.
  - Add *non-breaking* validation for `dueDate`:
    - If present, ensure it matches `/^\d{4}-\d{2}-\d{2}$/`.
    - If invalid, coerce to `undefined` (do not drop the task).
  - Ensure `saveAndRender()` continues to persist the tasks array as-is.
- **Expected outcome:** dueDate persists and older tasks remain intact and renderable.

### T-04 — Add local-date overdue evaluation helper
- **Description:** Determine overdue status using local calendar date comparison (date-only).
- **Related requirements:** FR-009..FR-011, BR-002..BR-005, NFR-002, AC-004..AC-006
- **Expected files:** `app.js`
- **Dependencies:** T-03
- **Implementation approach:**
  - Add helper functions:
    - `toLocalDateKey(date)` => numeric key `YYYYMMDD` using local year/month/day.
    - `parseIsoDateOnly(iso)` => `new Date(y, m-1, d)` to represent local midnight.
    - `isOverdue(task, now = new Date())` implementing rules.
  - Overdue conditions:
    - `task.dueDate` exists and valid
    - `!task.completed`
    - `dueKey < todayKey` (strictly earlier; equal means due today, not overdue)
- **Expected outcome:** Accurate overdue classification across timezones and around midnight.

### T-05 — Update rendering to display due date and overdue badge
- **Description:** Show due date in `DD MMM YYYY` format and an accessible overdue indicator.
- **Related requirements:** FR-006..FR-008, FR-012, NFR-003, NFR-004, AC-003, AC-004
- **Expected files:** `app.js`, `styles.css`
- **Dependencies:** T-04, T-06
- **Implementation approach:**
  - Add helper `formatDueDate(iso)` using `Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })` to reliably output `DD MMM YYYY`.
  - Modify `createTaskElement(task)`:
    - Add a metadata container (e.g., `<span class="task-meta">`).
    - If `task.dueDate` exists: add `<span class="task-due-date">...</span>`.
    - If overdue: add `<span class="task-badge task-badge--overdue" role="status">Overdue</span>`.
    - Add `is-overdue` class to the `<li>` when overdue.
- **Expected outcome:** Due date is visible when present; overdue tasks are visibly and accessibly indicated.

### T-06 — CSS updates for due date + badge and responsive layout
- **Description:** Style due date and overdue badge without breaking layout on mobile.
- **Related requirements:** FR-012, NFR-003, NFR-004
- **Expected files:** `styles.css`
- **Dependencies:** T-01, T-05
- **Implementation approach:**
  - Add styles:
    - `.due-date-input` sizing so task text input remains primary.
    - `.task-meta` as inline-flex with gap, aligned center.
    - `.task-due-date` muted text.
    - `.task-badge--overdue` high-contrast background and readable font.
  - Update existing `@media (max-width: 520px)` if needed to keep the add form compact.
- **Expected outcome:** UI stays clean/responsive; overdue badge is clearly visible.

### T-07 — Verify existing behaviors remain intact (manual regression checklist)
- **Description:** Ensure create/toggle/delete/clear/filter all function for tasks with/without dueDate.
- **Related requirements:** FR-013, FR-014, NFR-005, AC-008
- **Expected files:** none (verification only)
- **Dependencies:** T-01..T-06
- **Implementation approach:**
  - Run the manual test checklist in Section 9.
- **Expected outcome:** No regressions to core task management.

### T-08 — Capture key implementation notes
- **Description:** Record decisions (storage format, date formatting locale, overdue compare strategy) for maintainability.
- **Related requirements:** NFR-002; Risks R-001..R-005
- **Expected files:** none (this plan)
- **Dependencies:** none
- **Expected outcome:** Fewer ambiguities during implementation.

## 7. Affected components and files (expected)
- `index.html`
  - Add optional due date input field with accessible label.
- `app.js`
  - Read due date input; store optional `dueDate`.
  - Helpers for parsing/formatting and overdue evaluation.
  - Update `createTaskElement` to render due date and overdue badge.
- `styles.css`
  - Style date input.
  - Style due date text + overdue badge + overdue row state.

## 8. Implementation sequence (execution order)
1. T-01 Add due date input to UI.
2. T-02 Capture/store due date on submit.
3. T-03 Normalize/validate dueDate in `loadTasks` (non-breaking).
4. T-04 Implement overdue computation helpers.
5. T-05 Render due date + overdue indicator.
6. T-06 Add CSS styles and responsive adjustments.
7. T-07 Manual regression + acceptance verification.

## 9. Testing strategy
> No tests will be implemented in this step (per workflow restrictions). This section defines what to test.

### 9.1 Manual functional tests mapped to acceptance criteria
- **AC-001:** Create task with due date; verify due date stored and displayed.
- **AC-002:** Create task without due date; ensure saved and no due-date label.
- **AC-003:** Verify format `DD MMM YYYY`.
- **AC-004:** Create a task with due date set to yesterday; ensure overdue marked when incomplete.
- **AC-005:** Mark that task completed; overdue marker disappears.
- **AC-006:** Set due date to today; ensure not overdue.
- **AC-007:** Reload; ensure due date persists and overdue recalculates.
- **AC-008:** Toggle, delete, clear completed, and filters work for mixed tasks.
- **AC-009:** Verify older tasks lacking dueDate still load and behave.

### 9.2 Negative/boundary scenarios
- Invalid stored `dueDate` values (e.g., `"11/03/2026"`, `null`, `""`): task should load; due date ignored.
- localStorage failures (read/write): app should not crash (existing try/catch).
- Midnight boundary: verify due-today is not overdue; due-yesterday is overdue.

## 10. Regression considerations
- Ensure delete button behavior (hover/focus) remains correct after adding metadata.
- Ensure filter logic remains based solely on `task.completed`.
- Ensure ARIA attributes remain consistent and that overdue is not conveyed by color alone.

## 11. Risks and mitigations
- **R-001 Date parsing/format mismatch**
  - *Mitigation:* store ISO `YYYY-MM-DD`; validate on load.
- **R-002 Timezone boundary bugs**
  - *Mitigation:* compare local calendar date keys; parse due date as local midnight.
- **R-003 Backward compatibility/data validation**
  - *Mitigation:* never require dueDate; ignore invalid values rather than dropping tasks.
- **R-004 UI regressions**
  - *Mitigation:* add responsive CSS; validate on <=520px breakpoint.
- **R-005 Accessibility regressions**
  - *Mitigation:* include textual badge “Overdue” and adequate contrast.

## 12. Out-of-scope activities
- Editing due dates.
- Notifications/reminders.
- Due-date sorting/filtering.
- Recurring tasks.
- Introducing frameworks/build tools.

## 13. Completion criteria
- All mapped requirements (FR-001..FR-014, NFR-001..NFR-005, BR-001..BR-005) are addressed by implemented changes.
- Acceptance criteria AC-001..AC-009 pass via manual verification.
- Existing tasks without due dates remain usable with no migration.

