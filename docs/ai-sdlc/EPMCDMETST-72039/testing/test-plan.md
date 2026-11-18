# Test Plan — EPMCDMETST-72039 — Optional Due Dates + Overdue Identification

## Scope
Validate the feature branch implementation of optional task due dates and overdue identification.

In scope:
- Date parsing/formatting helpers
- Overdue business rules
- Persistence/backward compatibility behavior (manual)
- UI behaviors (manual: cannot open a browser in this stage)

Out of scope:
- Any new features beyond story scope (editing due dates, sorting, reminders)

## Strategy
- **Static/CLI checks (AUTOMATED):**
  - Node syntax check: `node --check app.js`
  - Helper-level verification via repository-provided harness script `date-helpers.check.js`
- **UI + persistence checks (MANUAL):**
  - Browser-based task creation with/without due dates
  - Reload persistence through localStorage
  - Overdue badge display and regression of existing controls

## Test framework / tooling discovery
- No `package.json` and no test framework detected at repository root.
- Testing performed using Node.js CLI only; no dependency installation.

## Environment
- OS: Windows (local path provided)
- Runtime: Node.js (used for `node --check` and running the helper harness)
- Repo:
  - Path: `C:/Users/ManojA/Desktop/Epam Learning tasks/Capstones/Codemie-Code-Task-Todo`
  - Branch: `feature/EPMCDMETST-72039-optional-due-dates`

## Requirement-to-test mapping (AC coverage)

| AC ID | Acceptance Criteria | Scenario(s) | Type |
|---|---|---|---|
| AC-001 | Save task with selected due date | Add task with due date; reload; verify persisted | MANUAL |
| AC-002 | Save without due date; no label shown | Add task without due date; verify no label | MANUAL |
| AC-003 | Display format DD MMM YYYY | `formatDueDate()` checks for multiple dates | AUTOMATED |
| AC-004 | Overdue marking for past date + incomplete | `isTaskOverdue()` yesterday vs today | AUTOMATED (logic); MANUAL (UI badge render) |
| AC-005 | Completed tasks not overdue | `isTaskOverdue()` completed past date | AUTOMATED (logic); MANUAL (UI) |
| AC-006 | Due today not overdue | `isTaskOverdue()` due today | AUTOMATED |
| AC-007 | Due date persists across reload | Create with date; reload | MANUAL |
| AC-008 | Existing controls/filters still work | Toggle/delete/clear-completed/filters with mixed tasks | MANUAL |
| AC-009 | Backward compatibility (old tasks) | Seed legacy tasks (no dueDate) in localStorage; reload | MANUAL; helper resilience is AUTOMATED |

## Entry criteria
- Code review report exists and is APPROVED for the current HEAD commit.
- Working tree clean (no modified tracked files).
- On feature branch (not main).

## Exit criteria
- Automated checks:
  - `node --check app.js` exit code 0
  - `date-helpers.check.js` exit code 0 and `SUMMARY ... failed=0`
  - No harness failure
- Manual checks remain **NOT_EXECUTED** (browser access not available) and are documented for human execution.
