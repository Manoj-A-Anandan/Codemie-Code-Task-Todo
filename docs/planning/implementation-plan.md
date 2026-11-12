# Implementation Plan — Optional Due Dates & Overdue Identification

## Document Control
- Project: **mm-learning-group-1**
- Repository: **Manoj-A-Anandan/Codemie-Code-Task-Todo**
- Feature: **Add Optional Due Dates and Overdue Identification to Tasks**
- Status: **Approved implementation plan (input to design)**

> Note: This is the *approved* planning output provided as input to the design step. No new tasks are introduced here.

---

## 1. Summary
Implement optional due dates for tasks and an overdue indicator for incomplete tasks whose due date is earlier than the current **local calendar date**. Persist due dates in localStorage and maintain backward compatibility and all existing features (add/toggle/delete/clear completed/filter).

---

## 2. Repository Context (verified)
- Frontend only: `index.html`, `styles.css`, `app.js`
- Persistence: `localStorage` with key `daylight-todos`
- Rendering: `render()` + `createTaskElement(task)`
- Filtering: `activeFilter` controlled by `.filter-button` (`data-filter` = `all|active|completed`)
- Actions: event delegation on `#task-list` using `button[data-action]` (`toggle|delete`)

---

## 3. Implementation Tasks

### TASK-001 — Confirm overdue visual indicator specification and finalize UI approach
- Type: ANALYSIS
- Files: `styles.css`, `app.js`, `index.html`
- Related: FR-005, FR-004, NFR-004
- Dependencies: None

**Completion criteria**
- Overdue indicator style and placement defined (badge, text, etc.)
- Accessibility considerations captured

---

### TASK-002 — Add optional due date input to the add-task form
- Type: FEATURE
- Files: `index.html`, `styles.css`
- Related: FR-001, FR-003, NFR-001, NFR-004
- Depends on: TASK-001

**Completion criteria**
- Add form includes optional date input
- Responsive layout remains usable (<=520px)
- Date input is accessible (label/aria-label)
- Task submission works without date

---

### TASK-003 — Extend task creation logic to capture and store dueDate (optional)
- Type: FEATURE
- Files: `app.js`
- Related: FR-001, FR-002, FR-003, FR-008, FR-010, NFR-002
- Depends on: TASK-002

**Completion criteria**
- New tasks store dueDate when present (recommended storage: `YYYY-MM-DD`)
- New tasks omit dueDate when not provided
- Date input reset behavior defined and implemented
- Existing empty-text validation unchanged

---

### TASK-004 — Implement local-date comparison helpers for overdue calculation
- Type: FEATURE
- Files: `app.js`
- Related: FR-005, FR-006, FR-007, NFR-002, NFR-003
- Depends on: TASK-003

**Completion criteria**
- Overdue predicate true only when dueDate < today and completed=false
- Due today not overdue
- Missing/invalid dueDate safely treated as not overdue

---

### TASK-005 — Render due date in task list (DD MMM YYYY) with conditional display
- Type: FEATURE
- Files: `app.js`, `styles.css`
- Related: FR-004, FR-003, FR-010, NFR-001
- Depends on: TASK-003

**Completion criteria**
- Tasks with dueDate display “DD MMM YYYY”
- Tasks without dueDate show no due-date UI
- Toggle/delete still work

---

### TASK-006 — Apply overdue styling/indicator to overdue incomplete tasks
- Type: FEATURE
- Files: `app.js`, `styles.css`
- Related: FR-005, FR-006, FR-007, NFR-004
- Depends on: TASK-001, TASK-004, TASK-005

**Completion criteria**
- Overdue tasks visibly distinguished
- Completed tasks never appear overdue
- Due-today tasks not overdue
- Indicator not color-only where feasible

---

### TASK-007 — Ensure persistence and backward compatibility for tasks with/without dueDate
- Type: REFACTOR
- Files: `app.js`
- Related: FR-008, FR-010, NFR-003
- Depends on: TASK-003

**Completion criteria**
- Pre-feature tasks load and render
- DueDate tasks persist and reload intact
- Malformed stored dueDate does not break rendering
- Malformed storage continues to fail gracefully

---

### TASK-008 — Regression verification: filters, toggle, delete, clear completed with mixed dueDate tasks
- Type: TEST
- Files: `app.js`, `index.html`, `styles.css`
- Related: FR-009, FR-005, FR-006, FR-008, FR-010
- Depends on: TASK-006, TASK-007

**Completion criteria**
- Filters correct regardless of dueDate
- Toggle/delete/clear completed behave correctly
- Overdue indicator updates when toggling completion

---

### TASK-009 — Add minimal test harness / documented manual test plan
- Type: DOCUMENTATION
- Files: `docs/Test-Plan.md` (recommended new)
- Related: FR-001..FR-010, NFR-003
- Depends on: TASK-006, TASK-007

**Completion criteria**
- Manual tests cover positive/negative/boundary scenarios
- Persistence and regression steps included

---

## 4. Execution Order
1. TASK-001
2. TASK-002
3. TASK-003
4. TASK-004
5. TASK-005
6. TASK-006
7. TASK-007
8. TASK-008
9. TASK-009

---

## 5. Testing Strategy (plan)
- No existing automated test framework in repository.
- Use documented manual test plan + regression checklist.
- Keep overdue logic in small helper functions to enable future unit tests.
