# Development Report — EPMCDMETST-72039

**Story:** Add Optional Due Dates and Overdue Identification to Tasks
**Branch:** `feature/EPMCDMETST-72039-optional-due-dates` (base: `main`)

## Summary
Implemented all tasks IP-01..IP-06 from `implementation-plan.md`, following `lld.md`. Due dates are stored as `YYYY-MM-DD` strings, displayed as `DD MMM YYYY`, and incomplete tasks due strictly before the local calendar date show an "Overdue" badge.

## Changes
| Task | Files | What changed |
|---|---|---|
| IP-01 | `index.html`, `styles.css` | Optional `<input type="date" id="task-due-date">` with sr-only label in `#add-form`; styled; form wraps on viewports ≤ 520px. |
| IP-02 | `app.js` | Submit handler reads the date, sets `dueDate` only when non-empty and valid, clears the field after add. |
| IP-03 | `app.js` | Added `parseIsoDateToLocalDate`, `getTodayLocalMidnight`, `formatDueDate` (Intl `formatToParts`, so the output is always `DD MMM YYYY`). |
| IP-04 | `app.js`, `styles.css` | Added `isTaskOverdue`; `render()` computes today once; `createTaskElement` builds `.task-content` > `.task-text` + `.task-meta` (`.task-due-date`, `.badge--overdue`) and adds `is-overdue`. |
| IP-05 | `app.js` | `loadTasks()` is unchanged, and `dueDate` is not required. Missing or malformed values are treated as "no due date" (no label, not overdue). |
| IP-06 | this file | Verification checklist below. |

Toggle, delete, clear-completed and filter handlers were not modified. No sorting, editing or notifications were added (out of scope).

## Verification
No test framework exists in the repo. I ran the following:
- `node --check app.js`: passes.
- Helper logic was run in Node (extracted from `app.js`); all 8 checks passed:
  - `05 Jan 2026` format.
  - Invalid inputs (`2026-99-99`, `foo`, non-string) return null.
  - Yesterday + incomplete is overdue.
  - Yesterday + completed is not overdue.
  - Today is not overdue.
  - Tomorrow is not overdue.
  - A legacy task with no `dueDate` is not overdue.
  - A malformed `dueDate` is not overdue.

**Not done:** I did not open the app in a browser, so the visual layout (desktop and mobile), the date picker, and the click-through regression of toggle/delete/clear/filter are untested. The reviewer should run the checklist below.

## Manual test checklist (AC coverage)
1. Add a task with a due date, then reload. The date persists and shows as `DD MMM YYYY` (AC-001/003/007).
2. Add a task without a due date. No date label or badge appears (AC-002).
3. Add a task due yesterday. It shows "Overdue". Mark it done and the badge disappears (AC-004/005).
4. Add a task due today. No badge (AC-006).
5. Toggle, delete, clear completed, and use All / To do / Done with mixed tasks (AC-008).
6. In devtools, store a task without `dueDate`, and one with `"dueDate":"foo"`. Reload. Both render and the app shows no errors (AC-009, NFR-005).
7. Resize below 520px. The date input wraps under the text field, and the meta and badge wrap without overlap (NFR-004).

## Notes
- Overdue badge colours are `#a12622` on `#fde8e7`, which gives roughly 6:1 contrast (estimated, not measured with a tool). The state is shown as text, not colour alone.
- The overdue state is computed at render time. A page left open past midnight updates on the next render.
