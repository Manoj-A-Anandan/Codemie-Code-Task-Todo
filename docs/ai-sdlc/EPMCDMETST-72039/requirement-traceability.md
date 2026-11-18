# Requirement Traceability — EPMCDMETST-72039

This matrix maps every Functional Requirement (FR), Non-Functional Requirement (NFR), and Acceptance Criterion (AC) from `requirements.md` to the proposed design components and implementation tasks in `implementation-plan.md`.

| Requirement ID | Acceptance Criterion ID | Requirement Summary | Design Component | Source or Proposed File | Implementation Task | Verification Approach |
|---|---|---|---|---|---|---|
| FR-001 | AC-001, AC-002 | Add optional due date input on task creation | Add-form UI extension | `index.html`, `styles.css` (proposed modifications) | IP-001 | Manual UI: date picker present; can submit with/without value |
| FR-002 | AC-001, AC-007 | Persist due date when provided | Task creation + persistence | `app.js` (proposed modifications) | IP-002 | Create task with due date; reload; due date preserved |
| FR-003 | AC-002 | Persist tasks without due date | Task creation validation | `app.js` (proposed modifications) | IP-002 | Submit task without due date; saved; reload works |
| FR-004 | AC-003 | Display due date as DD MMM YYYY | Rendering + formatting helper | `app.js` (proposed helper), `styles.css` | IP-004 | Visual check formatting; spot-check multiple dates |
| FR-005 | AC-002 | No due-date label for tasks without due date | Conditional rendering | `app.js` | IP-005 | Visual check: no placeholder/label/spacing artifacts |
| FR-006 | AC-004 | Mark overdue tasks (dueDate < today, incomplete) | Overdue predicate + render badge/class | `app.js` (proposed helpers), `styles.css` | IP-006, IP-007 | Create past-due incomplete task; verify overdue marker |
| FR-007 | AC-005 | Completed tasks are never overdue | Overdue predicate | `app.js` | IP-006 | Mark overdue task completed; verify marker removed |
| FR-008 | AC-006 | Tasks due today are not overdue | Local date comparison normalization | `app.js` | IP-006 | Create task due today; verify not overdue |
| FR-009 | AC-007 | Due dates persist across reloads | localStorage serialization | `app.js` | IP-002 | Reload browser; verify dueDate still present |
| FR-010 | AC-009 | Backward compatible with old tasks | Defensive load + dueDate tolerance | `app.js` (proposed modifications) | IP-003 | Seed localStorage with old tasks (no dueDate); verify load |
| FR-011 | AC-008 | Preserve existing operations and filters | Event delegation + render | `app.js` | IP-008 | Regression manual checks: toggle/delete/clear/filter |
| NFR-001 | AC-001, AC-002 | Due date optional; must not block creation | Form + submit logic | `index.html`, `app.js` | IP-001, IP-002 | Manual: submit succeeds without date |
| NFR-002 | AC-004 | Overdue indicator accessible and high-contrast | UI styling + text label | `styles.css`, `app.js` | IP-007, IP-006 | Manual: visible “Overdue” text; check contrast; SR label if added |
| NFR-003 | AC-004, AC-006 | Use local calendar date for overdue | Date normalization helper | `app.js` | IP-006 | Manual boundary checks; compare to system local date |
| NFR-004 | AC-009 | Resilient to malformed localStorage | Defensive parsing/validation | `app.js` | IP-003 | Negative test: corrupt localStorage; app does not crash |
| NFR-005 | AC-001, AC-002 | Responsive UI | CSS + layout | `styles.css`, `index.html` | IP-001, IP-007 | Manual: verify at <=520px and desktop |

## Gaps / notes
- No gaps identified between requirements, planned tasks, and design.
- Implementation detail decision pending: on invalid `dueDate` values from localStorage, prefer to **drop dueDate but keep task** (LLD Option A) vs filtering out entire task (Option B). This will be finalized during implementation.
