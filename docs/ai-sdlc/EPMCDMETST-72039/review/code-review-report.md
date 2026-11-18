# Code Review Report — EPMCDMETST-72039

## Story
- **ID:** EPMCDMETST-72039
- **Title:** Add Optional Due Dates and Overdue Identification to Tasks
- **Jira:** https://jiraeu.epam.com/browse/EPMCDMETST-72039

## Review metadata
- **Repository:** C:/Users/ManojA/Desktop/Epam Learning tasks/Capstones/Codemie-Code-Task-Todo
- **Remote:** https://github.com/Manoj-A-Anandan/Codemie-Code-Task-Todo
- **Base branch:** main
- **Implementation branch:** feature/EPMCDMETST-72039-optional-due-dates
- **Diff range reviewed:** main...HEAD

## Commits reviewed (main..HEAD)
- 37de72a EPMCDMETST-72039: fix code review findings (date format, input guard)
- c77a031 EPMCDMETST-72039: add optional due dates and overdue badge
- 94f30a2 EPMCDMETST-72039: add requirements, implementation plan and design documents

## Documents read (complete)
- docs/ai-sdlc/EPMCDMETST-72039/requirements.md
- docs/ai-sdlc/EPMCDMETST-72039/implementation-plan.md
- docs/ai-sdlc/EPMCDMETST-72039/architecture.md
- docs/ai-sdlc/EPMCDMETST-72039/hld.md
- docs/ai-sdlc/EPMCDMETST-72039/lld.md
- docs/ai-sdlc/EPMCDMETST-72039/requirement-traceability.md
- docs/ai-sdlc/EPMCDMETST-72039/development-report.md (claims verified against code; not treated as source of truth)

## Files reviewed (source)
- index.html
- styles.css
- app.js

## Change set summary (non-doc)
- Adds optional `<input type="date" id="task-due-date">` to add form.
- Extends task model with optional `dueDate` string (`YYYY-MM-DD`) when valid.
- Adds helpers:
  - `parseIsoDateToLocalDate()` (parses Y/M/D; validates real calendar dates)
  - `getTodayLocalMidnight()` (local midnight)
  - `formatDueDate()` (locale-independent; `DD MMM YYYY`)
  - `isTaskOverdue()` (incomplete + due date strictly before today)
- Updates rendering to display due date and a text badge `Overdue` for overdue tasks.
- Adds CSS for date input, task metadata, and overdue badge.

## Acceptance criteria verification

### AC-001 — Save task with selected due date
**Status:** PASS (code-level)
- `app.js` submit handler reads `dueDateInput.value` and assigns `newTask.dueDate = dueDate` only when non-empty and `parseIsoDateToLocalDate(dueDate)` returns a valid Date.
- Persisted through unchanged `saveAndRender()`.

### AC-002 — Save without due date; no label shown
**Status:** PASS (code-level)
- Due date is optional; when empty it is not added to the task object.
- Rendering only appends `.task-meta` (and therefore `.task-due-date`) when `formatDueDate(task.dueDate)` returns non-null.

### AC-003 — Display due date as DD MMM YYYY
**Status:** PASS (code-level)
- `formatDueDate()` returns exactly ``${DD} ${MMM} ${YYYY}`` using fixed `MONTH_ABBREVIATIONS`, zero-padded day, and 4-digit year.

### AC-004 — Overdue marking for incomplete tasks due before today (local)
**Status:** PASS (code-level)
- `getTodayLocalMidnight()` uses local Y/M/D parts.
- `isTaskOverdue()` returns true only when `completed !== true` AND valid due date `< todayLocalMidnight`.
- Overdue is visible via `.badge--overdue` with textContent `Overdue`.

### AC-005 — Completed tasks not marked overdue
**Status:** PASS (code-level)
- `isTaskOverdue()` early returns false when `task.completed === true`.

### AC-006 — Due today not overdue
**Status:** PASS (code-level)
- Overdue uses strict `< todayLocalMidnight`, so tasks due today (midnight today) compare equal and are not overdue.

### AC-007 — Due dates persist across reloads
**Status:** PASS (code-level)
- Due date stored on the task object; `saveAndRender()` persists with JSON.
- `loadTasks()` does not reject tasks with additional properties (it validates only id/text/completed types), so dueDate survives loading.

### AC-008 — Existing controls and filters still work
**Status:** PASS (code-level; requires quick manual smoke test in browser)
- Verified by diff inspection that the following are unchanged in logic (no edits observed beyond surrounding context):
  - `loadTasks()`
  - toggle/delete/clear-completed handlers (event delegation)
  - filter button handlers
- DOM structure changes: `.task-text` is now wrapped in `.task-content`; event delegation uses `closest("button[data-action]")` so it should not be impacted.

### AC-009 — Backward compatibility for old tasks
**Status:** PASS (code-level)
- Old tasks without `dueDate` continue to load due to unchanged `loadTasks()` validation.
- Rendering handles `task.dueDate` missing/undefined (formatDueDate returns null -> meta omitted).

## Specific rule checks (from reviewer checklist)
- **Dates parsed from year/month/day parts (no `Date.parse` or `new Date("YYYY-MM-DD")`):** PASS — uses `parseIsoDateToLocalDate()` with `new Date(year, month-1, day)`.
- **“Today” is local midnight:** PASS — `getTodayLocalMidnight()` builds `new Date(y,m,d)`.
- **Overdue definition (incomplete AND due date strictly before today):** PASS — `isTaskOverdue()` uses `<` and checks completed.
- **`loadTasks()` and toggle/delete/clear/filter handlers unchanged:** PASS — `loadTasks()` function is present and unchanged in diff; no changes observed to the delegated click handler or filter handlers.
- **Overdue indicator has text, not color only:** PASS — badge text `Overdue`.
- **No new dependencies:** PASS — no package changes; only HTML/CSS/JS edits.
- **XSS safety:** PASS — all new user/derived strings are applied via `textContent` / DOM node append; no `innerHTML` usage added.
- **`formatDueDate` locale-independent + exact format `DD MMM YYYY`:** PASS — fixed month array and string template.

### Temporal Dead Zone / declaration order check
- `MONTH_ABBREVIATIONS` declared at **app.js:104**.
- First top-level `render()` call is at **app.js:223**.
- `render()` can call `createTaskElement()` -> `formatDueDate()` which reads `MONTH_ABBREVIATIONS`.

**Result:** INFO (safe) — the earliest top-level call site that can reach `formatDueDate()` executes after the constant declaration.

## Findings

### CRITICAL (0)
None.

### HIGH (0)
None.

### MEDIUM (1)
1) **styles.css (around `.task-content`)**
   - **Description:** New `.task-content` wrapper adds `padding: 8px 0` and `gap: 4px` which may change list row height/vertical rhythm vs previous layout.
   - **Impact:** Potential UI regression (spacing/alignment) depending on existing `.task-item` styles and button alignment; confirmable only in a browser.
   - **Recommended fix:** If visual regression is observed, adjust `.task-content` padding/gap or move padding responsibility back to `.task-item`.

### LOW (1)
1) **index.html / app.js encoding artifacts**
   - **Location:** index.html add button label shows `â†—` in diff; app.js delete button text shows `Ã—` in diff.
   - **Description:** These characters appear as mojibake in the diff output and may indicate a file encoding issue or a terminal code page mismatch.
   - **Impact:** Potential incorrect glyph rendering for the arrow / multiplication sign (UI polish/accessibility).
   - **Recommended fix:** Verify actual file encoding is UTF-8 and the intended characters render correctly in a browser; if not, replace with HTML entities (`&times;`, `&rarr;`) or plain ASCII.

### INFO (1)
1) **`loadTasks()` resilience to malformed `dueDate`**
   - **Location:** app.js `createTaskElement()` uses `formatDueDate(task.dueDate)` and `isTaskOverdue()` uses `parseIsoDateToLocalDate(task.dueDate)`.
   - **Description:** Invalid `dueDate` values in storage are handled gracefully (treated as absent). This matches NFR-004.

## Security notes
- No XSS injection points introduced: task text and due date/badge strings are appended as text nodes.
- localStorage remains user-controlled; parsing is defensive.

## Regression notes
- Event delegation should remain robust because actions are still on `button[data-action]`. The `.task-content` wrapper should not interfere.
- Overdue calculation computed per render with a single `todayLocalMidnight` snapshot (good for consistency within one render).

## Test evidence
- Syntax check executed:
  - Command: `node --check app.js`
  - Result: exit code **0**

## Manual browser checks for human (recommended)
1. Add task with no due date: ensure no extra spacing/blank meta row appears.
2. Add task with due date: due date displays as `DD MMM YYYY`.
3. Add task due yesterday and incomplete: shows visible `Overdue` badge; mark completed -> badge disappears.
4. Add task due today: not overdue.
5. Verify toggle/delete/clear-completed and All/To do/Done filters with a mix of dated/undated tasks.
6. Verify layout at widths >520px and <=520px (form wrapping, task row vertical alignment).
7. Verify arrow and delete glyphs render correctly (no mojibake) on your platform/browser.

Head commit: 37de72a95f21aa2b87dc888e7c9ab00846643da9
Rule check: CRITICAL=0, HIGH=0, failing ACs=0
Final decision: APPROVED
