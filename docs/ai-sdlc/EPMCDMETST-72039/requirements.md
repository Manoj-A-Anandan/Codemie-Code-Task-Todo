# Requirements Specification — EPMCDMETST-72039

## Story reference and title
- **Story ID:** EPMCDMETST-72039
- **Title:** Add Optional Due Dates and Overdue Identification to Tasks
- **Source:** Jira — https://jiraeu.epam.com/browse/EPMCDMETST-72039
- **Application/Repo:** Daylight ToDo — https://github.com/Manoj-A-Anandan/Codemie-Code-Task-Todo
- **Base branch (for reference):** `main`
- **Doc branch:** `feature/EPMCDMETST-72039-optional-due-dates`

## Business objective
Enable users to optionally assign a due date to a task and quickly identify overdue *incomplete* tasks, improving prioritization and deadline awareness **without making due dates mandatory** and **without breaking existing task management features**.

## Current application behavior (as-is)
Based on repository inspection (`index.html`, `app.js`, `styles.css`):

- Users can add a task via a single text input form.
- A task is stored as an object containing: `id`, `text`, `completed`, `createdAt`.
- Tasks are persisted in browser **localStorage** under key: `daylight-todos`.
- Users can:
  - Toggle completion (complete / mark as not done).
  - Delete a task.
  - Clear all completed tasks.
  - Filter list view: **All**, **To do** (active), **Done** (completed).
- Rendering:
  - Tasks are shown in a list; completed tasks receive `.is-completed` class (strikethrough styling).
  - Empty state appears if there are no visible tasks.
- Backward-compatibility handling already exists:
  - `loadTasks()` filters stored items and only accepts tasks with `id` (string), `text` (string), `completed` (boolean). Extra properties are currently ignored but retained if persisted.

## Problem statement
The application currently provides no mechanism to set deadlines or to distinguish tasks that are late. Users cannot prioritize tasks by deadline awareness, and overdue items are not visually indicated.

## Proposed enhancement (to-be)
Add support for an **optional due date** when creating tasks, persist it alongside existing task data, display it in the task list in a consistent format, and visually mark tasks as **overdue** when:
- They have a due date **earlier than the current local calendar date**, and
- They are **incomplete**.

Completed tasks must **never** be marked overdue. Tasks due **today** must **not** be marked overdue.

## Functional requirements

### FR-1 Add optional due date input during task creation
- Provide a due date input in the task creation UI.
- Due date selection must be optional.

**Traceability:** RQ-FR-001

### FR-2 Save tasks with a due date
- When a user selects a due date and submits the new task, the created task must include the selected due date.

**Traceability:** RQ-FR-002

### FR-3 Save tasks without a due date
- When a user submits a task without selecting a due date, the task must be saved successfully.
- In this case, the task must have no due date value stored (or an explicit null/empty value), and the UI must not display a due date label for the task.

**Traceability:** RQ-FR-003

### FR-4 Display due date for tasks that have one
- For tasks with an assigned due date, display it in the task list.
- Display format must be **DD MMM YYYY** (e.g., `05 Feb 2026`).

**Traceability:** RQ-FR-004

### FR-5 Determine overdue status using local calendar date
- The application must compute whether a task is overdue based on **the user’s local calendar date**.
- A task is overdue if its due date is **earlier than** the current local calendar date.

**Traceability:** RQ-FR-005

### FR-6 Visually mark overdue incomplete tasks
- If a task is overdue (per FR-5) and incomplete, the task must be visibly marked as overdue.
- The overdue indicator must be a visually distinguishable badge/label with sufficient contrast and accessible text (per Jira design clarification). Exact styling is not prescribed.

**Traceability:** RQ-FR-006

### FR-7 Do not mark completed tasks as overdue
- If an overdue task is completed, the task must not be marked overdue.

**Traceability:** RQ-FR-007

### FR-8 Do not mark tasks due today as overdue
- If a task’s due date equals the current local calendar date, it must not be marked overdue.

**Traceability:** RQ-FR-008

### FR-9 Persist due dates in local storage
- Due date values must persist along with tasks in browser local storage.
- After reload/reopen, tasks and their due dates must remain available.

**Traceability:** RQ-FR-009

### FR-10 Preserve existing task features and filters
- Task completion toggle, deletion, clear completed, and filters (All/To do/Done) must continue to function correctly for tasks with and without due dates.

**Traceability:** RQ-FR-010

### FR-11 Maintain compatibility with existing stored tasks
- Tasks created before introduction of due dates must continue to load and display.
- No existing task data in local storage may be lost due to this change.

**Traceability:** RQ-FR-011

## Non-functional requirements

### NFR-1 Usability & responsiveness
- The interface must remain usable on desktop and mobile viewport sizes (explicitly listed in Definition of Done).

**Traceability:** RQ-NFR-001

### NFR-2 Accessibility for overdue indicator
- Overdue marker must include accessible text and sufficient contrast (Jira design clarification).

**Traceability:** RQ-NFR-002

### NFR-3 Local-date correctness
- Overdue evaluation must be based on local calendar date boundaries (not UTC timestamps).

**Traceability:** RQ-NFR-003

### NFR-4 Reliability of persistence
- If local storage read/write fails, the app should continue to run (current behavior logs errors; enhancement must not introduce crashes).

**Traceability:** RQ-NFR-004

## Acceptance criteria (measurable, testable)

> Notes:
> - “Current local calendar date” means the date as interpreted in the user’s locale/timezone.
> - Formatting checks should validate **DD MMM YYYY** output.

### AC-72039-01 Optional due date can be saved
- **Priority:** Must
- **Given** I am creating a new task
- **When** I enter task text, select a due date, and submit
- **Then** the task is added to the list
- **And** the task’s due date is stored with the task data

**Traceability:** RQ-FR-001, RQ-FR-002, RQ-FR-009

### AC-72039-02 Tasks can be saved without due date
- **Priority:** Must
- **Given** I am creating a new task
- **When** I submit the task without selecting a due date
- **Then** the task is added to the list
- **And** no due-date label/value is displayed for that task

**Traceability:** RQ-FR-001, RQ-FR-003

### AC-72039-03 Due date is displayed in required format
- **Priority:** Must
- **Given** a task has an assigned due date
- **When** I view the task in the task list
- **Then** the due date is displayed
- **And** it is formatted as **DD MMM YYYY**

**Traceability:** RQ-FR-004

### AC-72039-04 Overdue identification for incomplete tasks
- **Priority:** Must
- **Given** a task has a due date earlier than the current local calendar date
- **And** the task is incomplete
- **When** I view the task list
- **Then** the task is visibly marked as overdue

**Traceability:** RQ-FR-005, RQ-FR-006

### AC-72039-05 Completed tasks are not marked overdue
- **Priority:** Must
- **Given** a task has a due date earlier than the current local calendar date
- **And** the task is completed
- **When** I view the task list
- **Then** the task is not marked as overdue

**Traceability:** RQ-FR-007

### AC-72039-06 Tasks due today are not marked overdue
- **Priority:** Must
- **Given** a task has a due date equal to the current local calendar date
- **When** I view the task list
- **Then** the task is not marked as overdue

**Traceability:** RQ-FR-008, RQ-FR-005

### AC-72039-07 Due dates persist after reload
- **Priority:** Must
- **Given** I created a task with a due date
- **When** I reload or reopen the application
- **Then** the task is still present
- **And** its due date is still present and displayed

**Traceability:** RQ-FR-009

### AC-72039-08 Existing task operations and filters remain functional
- **Priority:** Must
- **Given** tasks exist with and without due dates
- **When** I complete a task, delete a task, clear completed tasks, or use the All/To do/Done filters
- **Then** these controls work as they did before
- **And** the correct tasks are displayed for each filter

**Traceability:** RQ-FR-010

### AC-72039-09 Existing stored tasks remain compatible
- **Priority:** Must
- **Given** tasks were created before the due-date feature existed
- **When** I open the application after upgrading
- **Then** those tasks are still present
- **And** they are not forced to have a due date
- **And** no task data is lost

**Traceability:** RQ-FR-011

## Dependencies and assumptions

### Dependencies
- Browser **localStorage** availability and current persistence approach (`daylight-todos`).
- Existing UI rendering pipeline using `createTaskElement()` and `render()`.
- Existing filtering logic based on `completed` boolean.

### Assumptions (require confirmation if incorrect)
- Due date is captured as a date-only value (no time-of-day) since overdue uses “local calendar date”.
- The due date is associated only at creation time (story Out of Scope excludes editing due dates).
- Overdue indicator is applied in the task list item UI (no separate views/pages exist).

## Out-of-scope requirements (explicit)
- Notifications/reminders.
- Recurring tasks.
- Editing/changing due dates after creation.
- Calendar integration.
- Email/push notifications.
- Advanced deadline-based filtering or sorting.

## Risks and open questions

### Risks
- **Date parsing/formatting differences across browsers/locales:** ensure DD MMM YYYY formatting is consistent.
- **Timezone boundary bugs:** using timestamps may inadvertently shift dates; must compare by local date.
- **Backward compatibility:** current `loadTasks()` validates only id/text/completed and will drop any task objects missing those fields; adding a new due date field must not change that behavior for existing tasks.
- **Accessibility risk:** overdue marker must be perceivable for low-contrast themes and screen readers.

### Open questions (require product/design clarification)
1. **Due date UI control:** Should the due date field be a native `<input type="date">`? (Story says “optional date input” but doesn’t mandate control type.)
2. **Storage format:** Should due date be stored as ISO date string (YYYY-MM-DD) or timestamp? (Needs alignment to avoid timezone shifts.)
3. **Overdue marking location/style:** Badge text to use (e.g., “Overdue”) and whether to also apply a list item style (e.g., border/color). Jira allows designer discretion, but QA needs a deterministic check.
4. **Ordering:** Should tasks still be inserted at top (current `unshift`) regardless of due date? (Not requested; likely unchanged.)

## Existing functionality that must remain unaffected
- Add task via text input and submit.
- Completion toggle behavior and `.is-completed` styling.
- Deleting tasks.
- Clear completed button behavior.
- Filters: `all`, `active` (To do), `completed` (Done).
- Empty state visibility and counts (`YOUR TASKS`, remaining message).
- Local storage key usage: `daylight-todos`.

## Requirement traceability (summary)
- **RQ-FR-001** Optional due date input
- **RQ-FR-002** Save task with due date
- **RQ-FR-003** Save task without due date and hide label
- **RQ-FR-004** Display due date in DD MMM YYYY
- **RQ-FR-005** Overdue calculation by local date
- **RQ-FR-006** Mark overdue incomplete tasks
- **RQ-FR-007** Never mark completed tasks overdue
- **RQ-FR-008** Do not mark tasks due today overdue
- **RQ-FR-009** Persist due dates in local storage
- **RQ-FR-010** Preserve existing operations/filters
- **RQ-FR-011** Backward compatibility for existing tasks
- **RQ-NFR-001** Responsive usability
- **RQ-NFR-002** Accessible overdue indicator
- **RQ-NFR-003** Local-date correctness
- **RQ-NFR-004** Persistence reliability
