# Requirement Traceability Matrix — EPMCDMETST-72039

This matrix maps each approved requirement and acceptance criterion to design elements, repository components (existing or proposed modifications), implementation plan task IDs, and verification approach.

## Legend
- **Existing component**: already present in repo.
- **Proposed change**: modification/addition to existing file.

## Traceability

| Requirement ID | Acceptance Criteria ID | Design component(s) | Repo component / proposed file change | Implementation task ID(s) | Verification approach |
|---|---|---|---|---|---|
| FR-001 Optional due date input | AC-001, AC-002 | Add-form enhancement | `index.html` (proposed: add `#due-date-input` + label); `styles.css` (date input styling) | T-01 | Manual: confirm date input exists, optional, does not block creation |
| FR-002 Create with due date | AC-001 | Submit handler captures due date | `app.js` (proposed: read `#due-date-input` on submit; set task.dueDate) | T-02 | Manual: create with date, reload, inspect UI shows due date |
| FR-003 Create without due date | AC-002 | Submit handler omits due date | `app.js` (proposed: store undefined/omit dueDate when empty) | T-02 | Manual: create without date; verify saved; verify no due label |
| FR-004 Persist due date | AC-007 | Task persistence includes dueDate | `app.js` (existing saveAndRender JSON stringify; proposed: include optional field) | T-03 | Manual: create with date; reload; due date remains |
| FR-005 Backward compatible | AC-009 | Non-breaking load + normalization | `app.js` (existing loadTasks required-field filter; proposed: ignore invalid dueDate not drop task) | T-03 | Manual: pre-seed storage with old tasks (no dueDate) and confirm load |
| FR-006 Display due date | AC-003 | Task rendering metadata | `app.js` (proposed: createTaskElement adds due date element when present) | T-05 | Manual: due date visible for tasks with dueDate |
| FR-007 Hide due date label when absent | AC-002 | Conditional UI rendering | `app.js` (proposed: only render due date element if dueDate present) | T-05 | Manual: tasks without dueDate show no placeholder/label |
| FR-008 Due date format DD MMM YYYY | AC-003 | `formatDueDate()` helper | `app.js` (proposed: `Intl.DateTimeFormat('en-GB', {day:'2-digit', month:'short', year:'numeric'})`) | T-05 | Manual: verify display e.g., `03 Nov 2026` |
| FR-009 Overdue rule (incomplete + past local date) | AC-004 | `isOverdue()` helper | `app.js` (proposed: parse ISO date-only as local midnight; compare local date keys) | T-04, T-05 | Manual: due yesterday + incomplete shows overdue |
| FR-010 Completed tasks not overdue | AC-005 | `isOverdue()` completion guard | `app.js` (proposed: if completed return false; ensure class/badge removed) | T-04, T-05 | Manual: complete a past-due task; overdue indicator disappears |
| FR-011 Due today not overdue | AC-006 | `isOverdue()` strict comparison | `app.js` (proposed: overdue only if dueKey < todayKey, not <=) | T-04 | Manual: due today + incomplete is not overdue |
| FR-012 Overdue visual indicator | AC-004 | Badge + `is-overdue` class | `app.js` (proposed: badge element `Overdue` and `.is-overdue` class); `styles.css` (badge styling, contrast) | T-05, T-06 | Manual + accessibility spot-check: badge readable, not color-only |
| FR-013 Preserve actions | AC-008 | Event delegation unchanged | `app.js` (existing: click handler on `#task-list`, toggle/delete, clear completed) | T-07 | Manual regression: toggle/delete/clear works with dueDate tasks |
| FR-014 Preserve filters | AC-008 | Filter logic unchanged | `app.js` (existing `render()` filter by completed) | T-07 | Manual: filters work with mixed dueDate/no-dueDate tasks |
| NFR-001 Optionality | AC-001, AC-002 | UX: no required due date | `index.html` (no required attribute); `app.js` (validate only text) | T-01, T-02 | Manual: create without date succeeds |
| NFR-002 Local calendar correctness | AC-004, AC-006 | Local-date parsing + compare | `app.js` (proposed: parse components; `toLocalDateKey`) | T-03, T-04 | Manual boundary: due today not overdue; due yesterday overdue in local time |
| NFR-003 Accessibility | AC-004 | Textual badge + role | `app.js` (proposed: badge text + `role="status"`); `styles.css` (contrast) | T-05, T-06 | Manual: check badge text; keyboard focus unaffected |
| NFR-004 Responsive UI | AC-001..AC-008 | Responsive CSS updates | `styles.css` (proposed additions; adjust @media <=520px if needed) | T-06 | Manual: check layout desktop + <=520px |
| NFR-005 Resilience | AC-007 | Keep try/catch | `app.js` (existing try/catch in load/save); proposed changes avoid throwing | T-07 | Manual: simulate localStorage failure (devtools) → app doesn’t crash |

## Coverage summary
- All FR-001..FR-014 and NFR-001..NFR-005 map to one or more design components and implementation tasks.
- All AC-001..AC-009 are covered by at least one verification step.
