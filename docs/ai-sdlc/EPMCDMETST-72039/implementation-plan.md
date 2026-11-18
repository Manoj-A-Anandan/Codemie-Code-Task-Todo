# Implementation Plan — EPMCDMETST-72039

## Story context
**Story:** EPMCDMETST-72039 — Add Optional Due Dates and Overdue Identification to Tasks  
**Goal:** Allow users to optionally assign a due date when creating a task, persist it in localStorage, display it in `DD MMM YYYY` format, and visually mark overdue *incomplete* tasks (due date earlier than current **local calendar date**). Maintain compatibility with existing stored tasks.

## Inputs (requirements summary)
Source of truth: `docs/ai-sdlc/EPMCDMETST-72039/requirements.md`

Key behaviors:
- Add optional due date field to task creation UI. (FR-001)
- Persist due dates per task to localStorage; tasks without due date remain valid. (FR-002/003/009/010)
- Display due dates only when present, formatted `DD MMM YYYY`. (FR-004/005)
- Determine overdue using **local calendar date**: overdue when `dueDate < today` AND `completed === false`. Due today is not overdue; completed is never overdue. (FR-006/007/008)
- Preserve all existing operations and filters. (FR-011)

## Repository analysis (verified)
**Repository root (verified):** `C:/Users/ManojA/Desktop/Epam Learning tasks/Capstones/Codemie-Code-Task-Todo`

**Technology stack:**
- Vanilla HTML/CSS/JavaScript (no bundler, no npm, no test framework).
- Persistence: browser `localStorage` under key `daylight-todos`.

**Key files / modules:**
- `index.html` — markup: add form (`#add-form`), task input (`#task-input`), list (`#task-list`), filters, footer.
- `app.js` — all state + persistence + rendering:
  - Task model currently: `{ id: string, text: string, completed: boolean, createdAt: number }`.
  - `loadTasks()` filters invalid tasks by checking `id/text/completed` types.
  - `createTaskElement(task)` renders `<li>` with toggle button, text, delete button.
- `styles.css` — styling, responsive behavior.

**Build / run conventions:**
- Open `index.html` in browser; `app.js` loaded via `<script defer>`.

## Requirements → tasks mapping

### Functional Requirements
- **FR-001** → UI: add optional due-date input control to `#add-form` in `index.html`; wire query selectors and form submit handling in `app.js`.
- **FR-002** → Extend task creation to include `dueDate` when provided; persist via existing `saveAndRender()`.
- **FR-003** → Ensure empty due date does not block submit; store no `dueDate` field or store `null` consistently.
- **FR-004** → Render due date text with explicit formatting `DD MMM YYYY`.
- **FR-005** → Conditional DOM rendering: only render due-date element when `dueDate` is present.
- **FR-006** → Overdue computation for incomplete tasks; apply CSS class (e.g., `is-overdue`) and indicator.
- **FR-007** → Ensure completed tasks never get overdue class/indicator.
- **FR-008** → Ensure due-today is not overdue by comparing *date-only* values.
- **FR-009** → Ensure serialization/deserialization includes `dueDate` (no extra work beyond including it in task objects).
- **FR-010** → Ensure `loadTasks()` accepts tasks without `dueDate` and still loads; keep defensive filtering intact.
- **FR-011** → Verify toggle/delete/clear/filter continue working; ensure rendering and event delegation still finds correct elements.

### Non-Functional Requirements
- **NFR-001** → Optional date input; no validation error when empty.
- **NFR-002** → Overdue indicator must be perceivable and have accessible text (e.g., screen-reader-only label or `aria-label`).
- **NFR-003** → Implement local-calendar-date comparisons (normalize dates to YYYY-MM-DD in local time).
- **NFR-004** → Keep `loadTasks()` robust; do not assume `dueDate` exists; validate if present.
- **NFR-005** → Ensure added UI fits existing responsive layout; minimal CSS adjustments.

### Acceptance Criteria
- **AC-001** → Covered by tasks IP-001, IP-002.
- **AC-002** → Covered by tasks IP-001, IP-002, IP-005.
- **AC-003** → Covered by tasks IP-004.
- **AC-004** → Covered by tasks IP-006, IP-007.
- **AC-005** → Covered by tasks IP-006.
- **AC-006** → Covered by tasks IP-006.
- **AC-007** → Covered by tasks IP-002, IP-003.
- **AC-008** → Covered by tasks IP-008.
- **AC-009** → Covered by tasks IP-003.

## Implementation tasks

> Note: file paths below are relative to repository root.

### IP-001 — Add optional due date input to the add form
- **Req IDs:** FR-001, NFR-001, NFR-005
- **Affected files/components:** `index.html`, `styles.css`
- **Dependencies:** none
- **Approach:**
  - Add a new `<input type="date">` (e.g., `id="due-date-input" name="dueDate"`) into the existing `.add-form`.
  - Keep it optional (no `required`).
  - Add an `sr-only` label for accessibility.
  - Add minimal styling to ensure the date input aligns with the current layout and remains usable on narrow screens.
- **Expected outcome:** User can optionally pick a date while adding a task; layout remains clean and responsive.

### IP-002 — Persist due date on task creation
- **Req IDs:** FR-002, FR-003, FR-009, NFR-001
- **Affected files/components:** `app.js`
- **Dependencies:** IP-001
- **Approach:**
  - Add `const dueDateInput = document.querySelector("#due-date-input")`.
  - In submit handler:
    - Read `const dueDate = dueDateInput.value`.
    - If empty: omit property or set to `null` (choose one representation and use consistently). Recommended: store as ISO date string `YYYY-MM-DD` or omit when empty.
    - Create task object with `dueDate` when present.
    - Clear `dueDateInput.value = ""` after successful add.
- **Expected outcome:** Tasks created with a due date have it persisted in localStorage; tasks without remain unchanged.

### IP-003 — Extend load validation to tolerate/validate dueDate
- **Req IDs:** FR-010, NFR-004
- **Affected files/components:** `app.js`
- **Dependencies:** IP-002
- **Approach:**
  - Update `loadTasks()` filter predicate to allow `dueDate` to be absent.
  - If `dueDate` exists, validate it is a string in expected shape (e.g., `/^\d{4}-\d{2}-\d{2}$/`) to preserve resilience.
  - Do **not** reject tasks just because `createdAt` is missing/invalid (current behavior).
- **Expected outcome:** Old tasks load unchanged; corrupted dueDate values are filtered out or ignored without crashing.

### IP-004 — Add due date rendering (formatted)
- **Req IDs:** FR-004, FR-005
- **Affected files/components:** `app.js`, `styles.css`
- **Dependencies:** IP-002
- **Approach:**
  - Implement helper `formatDueDate(isoDateString)` producing `DD MMM YYYY`.
    - Prefer `Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" })` and ensure month is in English short form.
    - Convert `YYYY-MM-DD` to a Date in local time: `new Date(year, monthIndex, day)` to avoid timezone shifts.
  - In `createTaskElement`:
    - Add a small metadata row/element (e.g., `<span class="task-meta">` with `<span class="task-due-date">05 Jan 2027</span>`).
    - Only append it when `task.dueDate` is present.
- **Expected outcome:** Due date displays only for tasks that have one; format matches requirement.

### IP-005 — Ensure no due-date label/placeholder when missing
- **Req IDs:** FR-005, AC-002
- **Affected files/components:** `app.js`
- **Dependencies:** IP-004
- **Approach:**
  - Ensure conditional rendering: no “Due:” prefix element is created when `dueDate` missing.
  - Ensure spacing/visual layout doesn’t leave gaps when the due date element is absent.
- **Expected outcome:** Tasks without due date show exactly as before (no extra label).

### IP-006 — Implement overdue calculation using local calendar date
- **Req IDs:** FR-006, FR-007, FR-008, NFR-003
- **Affected files/components:** `app.js`
- **Dependencies:** IP-002
- **Approach:**
  - Introduce helper(s):
    - `getLocalISODate(date = new Date()) -> "YYYY-MM-DD"` based on local components.
    - `isOverdue(task, todayIso = getLocalISODate())`:
      - return false if `task.completed`.
      - return false if no `task.dueDate`.
      - return `task.dueDate < todayIso` using lexicographic compare (safe for ISO date format).
  - In `createTaskElement`, if overdue:
    - Add class `is-overdue` to `.task-item`.
    - Add an indicator element (e.g., `<span class="task-badge task-badge--overdue">Overdue</span>`).
    - Provide accessible text via `aria-label` or visually hidden label.
- **Expected outcome:** Overdue appears only for incomplete tasks with due date before today; due today is not overdue.

### IP-007 — Add styling for overdue indicator
- **Req IDs:** FR-006, NFR-002, NFR-005
- **Affected files/components:** `styles.css`
- **Dependencies:** IP-006
- **Approach:**
  - Add styles for `.task-item.is-overdue` (e.g., subtle left border or background tint) and for overdue badge.
  - Ensure adequate contrast (e.g., dark text on light warning background), and no reliance on color alone (include “Overdue” text).
- **Expected outcome:** Overdue tasks are visually distinct and accessible.

### IP-008 — Regression verification of existing operations and filters
- **Req IDs:** FR-011, AC-008
- **Affected files/components:** `app.js` (no functional changes expected beyond earlier tasks)
- **Dependencies:** IP-001..IP-007
- **Approach:**
  - Ensure event delegation still targets the correct buttons; new DOM elements must not interfere with `closest("button[data-action]")` logic.
  - Verify toggle updates overdue state on re-render (overdue should disappear when marked completed).
  - Verify delete/clear completed continues to work with extended task object.
  - Verify filters still filter by `completed` only.
- **Expected outcome:** Existing UX unaffected; due date features integrate cleanly.

## Execution sequence (recommended)
1. **IP-001** (add date input + basic styling)
2. **IP-002** (persist due date on create)
3. **IP-003** (load compatibility + validation)
4. **IP-006** (overdue computation helpers + class application)
5. **IP-004** (due date rendering + formatting)
6. **IP-005** (confirm no label/spacing for missing date)
7. **IP-007** (overdue styling)
8. **IP-008** (regression pass)

## Testing strategy
Because the repository has no automated test framework, testing will be primarily manual + lightweight console checks.

### Unit-level (via small pure helpers in `app.js`)
- Test `getLocalISODate()` returns expected string format.
- Test `isOverdue()` with boundary cases:
  - dueDate < today, completed=false → true
  - dueDate == today, completed=false → false
  - dueDate > today, completed=false → false
  - dueDate < today, completed=true → false
  - dueDate missing → false

### Integration / UI manual tests (browser)
- Create task without due date; ensure task appears with no due date label; reload and confirm persists. (AC-002, AC-009)
- Create task with due date; ensure due date appears formatted; reload and confirm persists. (AC-001, AC-003, AC-007)
- Create task due yesterday (or set system date) and confirm overdue indicator appears when incomplete. (AC-004)
- Mark overdue task completed and confirm overdue indicator disappears. (AC-005)
- Create task due today and confirm not overdue. (AC-006)
- Verify delete, clear completed, filters All/To do/Done across tasks with/without due dates. (AC-008)

### Negative / resilience tests
- Manually edit localStorage `daylight-todos` to include:
  - task object without dueDate → loads
  - task object with invalid dueDate string → ignored or treated as no due date without crash
  - non-array stored value → app loads with empty list

## Risks and mitigations
- **Timezone / off-by-one errors** when parsing ISO date strings.
  - *Mitigation:* store date as `YYYY-MM-DD` and parse via `new Date(y, m-1, d)` for display; compare strings for overdue.
- **Accessibility regressions** due to new indicators.
  - *Mitigation:* include visible “Overdue” text; keep SR-only labels for date input; ensure contrast.
- **UI layout regressions** on mobile.
  - *Mitigation:* add minimal responsive CSS and verify at `<= 520px` breakpoints.

## In-scope / out-of-scope
**In-scope:**
- Add optional due date at creation, persist, display, overdue marking.

**Out-of-scope (must not implement):**
- Editing/changing due dates after creation.
- Notifications, reminders, calendar integrations, recurring tasks.

## Files/components expected to change
- `index.html` — add due date input.
- `app.js` — extend task model, persistence, rendering, overdue computation.
- `styles.css` — style due date + overdue indicator.
- `docs/ai-sdlc/EPMCDMETST-72039/implementation-plan.md` — this document.

## Files that must not change
- Do not modify `docs/ai-sdlc/EPMCDMETST-72039/requirements.md`.
- No changes outside docs during documentation workflow stages (per process rules).

## Completion criteria
- All FRs/NFRs/ACs mapped above are implemented as planned.
- Manual test checklist passes for AC-001..AC-009.
- No regressions in add/toggle/delete/clear/filter behavior.
- Backward compatibility verified with existing localStorage tasks.
