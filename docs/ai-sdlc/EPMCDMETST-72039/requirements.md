# Requirements — EPMCDMETST-72039 — Add Optional Due Dates and Overdue Identification to Tasks

## Story information
- **Story ID:** EPMCDMETST-72039
- **Title:** Add Optional Due Dates and Overdue Identification to Tasks
- **URL:** https://jiraeu.epam.com/browse/EPMCDMETST-72039
- **Source:** Jira (retrieved via datasource)
- **Status (at retrieval):** Open
- **Project:** Daylight ToDo

## Business objective
Enable users to optionally assign due dates to tasks and clearly identify overdue (past-due) *incomplete* tasks, improving prioritization and deadline awareness while preserving the existing lightweight task workflow.

## User roles
- **Task manager / end user:** Creates tasks, optionally assigns due dates, views tasks, completes tasks, deletes tasks, filters by status.

## Verified existing functionality (from repository inspection)
**Repository evidence:** `index.html`, `app.js`, `styles.css`.

1. **Create tasks**
   - UI has an add form (`#add-form`) with a single text input (`#task-input`).
   - On submit, a task object is added to the front of the list with fields:
     - `id` (string), `text` (string), `completed` (boolean), `createdAt` (number via `Date.now()`).

2. **Persist tasks in browser local storage**
   - Uses `localStorage` key `daylight-todos`.
   - `loadTasks()` loads and validates stored array items, keeping tasks that have `id`, `text`, and `completed` with correct types.

3. **Task list actions**
   - Toggle complete/incomplete via a button with `data-action="toggle"`.
   - Delete via a button with `data-action="delete"`.
   - Clear completed removes all completed tasks.

4. **Filters**
   - Filter buttons set `activeFilter` to `all`, `active`, or `completed` and `render()` filters visible tasks accordingly.

5. **Rendering**
   - `createTaskElement(task)` creates an `li.task-item` with `.is-completed` class when `task.completed` is true.

## Requested change (from Jira story)
Add an **optional due date** when creating a task, display it in **DD MMM YYYY** format in the list, and **mark overdue** tasks when due date is earlier than the **current local calendar date**, but only if the task is **incomplete**.

## Functional requirements

### FR-001 — Optional due date input on task creation
Provide a due date input control in the task creation interface that allows the user to select a date when creating a new task.

### FR-002 — Save tasks with a due date
When the user submits a new task with a selected due date, the application shall persist the task with the due date stored alongside existing task properties.

### FR-003 — Save tasks without a due date
When the user submits a new task without selecting a due date, the application shall persist the task successfully **without** a due date value.

### FR-004 — Display due date in task list
For tasks that have a due date, the application shall display the due date next to the task text in a consistent readable format: **DD MMM YYYY** (example: `05 Jan 2027`).

### FR-005 — No due-date label when absent
For tasks without a due date, the application shall not display any due date label/placeholder.

### FR-006 — Identify overdue tasks (incomplete only)
For tasks with a due date earlier than the **current local calendar date** and `completed=false`, the application shall visibly mark the task as **overdue** in the task list.

### FR-007 — Exclude completed tasks from overdue identification
For tasks with a due date earlier than the current local calendar date and `completed=true`, the application shall **not** mark the task as overdue.

### FR-008 — Tasks due today are not overdue
For tasks with due date equal to the current local calendar date, the application shall **not** mark the task as overdue.

### FR-009 — Persist due dates across reloads
The application shall store and reload due dates from browser local storage so that tasks retain their due dates after reload/reopen.

### FR-010 — Backward compatibility with existing stored tasks
Tasks created before the due-date feature was introduced (i.e., tasks without any due date property in local storage) shall continue to load and function without data loss.

### FR-011 — Preserve existing task management controls
Task completion toggle, deletion, clear completed, and filters (**All / To do / Done**) shall continue to work correctly for tasks with and without due dates.

## Non-functional requirements

### NFR-001 — Local date correctness
Overdue evaluation shall use the **user’s local calendar date** (not UTC day boundaries).

### NFR-002 — Accessibility
Any overdue indicator (badge/label) shall have accessible text (screen-reader readable) and sufficient contrast consistent with the existing UI design.

### NFR-003 — Usability on desktop and mobile
The due date input and due date display shall remain usable and visually clear across existing responsive breakpoints (notably `@media (max-width: 520px)`).

### NFR-004 — Resilience to corrupted storage
If local storage contains tasks missing the due date or with invalid due date values, the application shall continue operating and treat those tasks as having **no due date** (no crash).

## Acceptance criteria (testable)

### AC-001 (maps to Jira AC1)
**Given** I am creating a new task,
**When** I select a due date and submit the task,
**Then** the task is saved with the selected due date (verified by reload and/or localStorage value for that task).

### AC-002 (maps to Jira AC2)
**Given** I am creating a new task,
**When** I submit the task without selecting a due date,
**Then** the task is saved successfully without a due date,
**And** no due-date label is displayed for that task.

### AC-003 (maps to Jira AC3)
**Given** a task has an assigned due date,
**When** I view the task in the task list,
**Then** the due date is displayed in **DD MMM YYYY** format.

### AC-004 (maps to Jira AC4)
**Given** a task has a due date earlier than the current **local calendar date**,
**And** the task is incomplete,
**When** I view the task list,
**Then** the task is visibly marked as overdue.

### AC-005 (maps to Jira AC5)
**Given** a task has a due date earlier than the current local calendar date,
**And** the task is completed,
**When** I view the task list,
**Then** the task is not marked as overdue.

### AC-006 (maps to Jira AC6)
**Given** a task has a due date equal to the current local calendar date,
**When** I view the task list,
**Then** the task is not marked as overdue.

### AC-007 (maps to Jira AC7)
**Given** I have created a task with a due date,
**When** I reload or reopen the application,
**Then** the task and its assigned due date remain available.

### AC-008 (maps to Jira AC8)
**Given** tasks exist with and without due dates,
**When** I complete tasks, delete tasks, clear completed, and use the **All / To do / Done** filters,
**Then** all controls continue to function correctly.

### AC-009 (maps to Jira AC9)
**Given** tasks were created before the due-date feature was introduced,
**When** I open the application,
**Then** those tasks remain available without requiring a due date,
**And** no existing task data is lost.

## Business rules
- **BR-001 (Optionality):** Due date is optional; tasks may exist without it.
- **BR-002 (Overdue definition):** A task is overdue only if:
  - it has a due date, and
  - due date is **earlier than** the current local calendar date (not including today), and
  - task is **incomplete**.
- **BR-003 (Completed override):** Completed tasks are never shown as overdue.
- **BR-004 (Date display format):** Display format is `DD MMM YYYY`.

## Constraints
- **C-001:** Persist data in browser `localStorage` (existing storage mechanism).
- **C-002:** No due-date notifications/reminders.
- **C-003:** No recurring tasks.
- **C-004:** No editing/changing due dates after creation.
- **C-005:** No calendar integration.
- **C-006:** No advanced deadline-based filtering or sorting.

## Assumptions
- **A-001:** A due date is stored as a value that can be safely serialized to JSON (e.g., an ISO date string like `YYYY-MM-DD`).
- **A-002:** “Current local calendar date” is evaluated using the device’s locale/timezone and compares dates at day granularity.
- **A-003:** Existing filters map to `all`, `active` (To do), and `completed` (Done) as implemented in `app.js`.

## Dependencies
- Existing task creation UI (`#add-form`) and list rendering (`createTaskElement`).
- Existing local storage persistence (`STORAGE_KEY = "daylight-todos"`, `saveAndRender()`, `loadTasks()`).
- Existing completion and filtering logic.

## Risks
- **R-001:** Incorrect overdue calculation if date parsing/formatting uses UTC rather than local day boundaries.
- **R-002:** Backward compatibility risk if `loadTasks()` validation rejects tasks containing new fields (must continue to accept tasks with additional properties).
- **R-003:** UI layout risk on mobile if due date display increases line length/height.
- **R-004:** Inconsistent formatting across locales if Intl formatting isn’t pinned to the requested `DD MMM YYYY` output.

## Out of scope
(As per Jira story)
- Notifications or reminders.
- Recurring tasks.
- Editing/changing due dates after creation.
- Calendar integration.
- Email/push notifications.
- Deadline-based filtering/sorting.

## Open questions
1. Should the due date input be a native `<input type="date">` (mobile friendly) or a custom control? (Story says “date input”; native seems consistent.)
2. Should overdue marking be color-only, or include text/badge (preferred for accessibility per design clarifications)?
3. Should the due date be displayed on the same line as task text or as a secondary line under it for small screens?
