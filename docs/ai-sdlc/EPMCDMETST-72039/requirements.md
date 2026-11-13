# Functional Requirements Document (FRD)

## 1. Story information
- **Story ID:** EPMCDMETST-72039
- **Title:** Add Optional Due Dates and Overdue Identification to Tasks
- **URL:** https://jiraeu.epam.com/browse/EPMCDMETST-72039
- **Product/Project:** Daylight ToDo
- **Status (at time of retrieval):** Open
- **Story type:** Story

## 2. Business objective
Enable users to optionally assign a due date to a task and clearly identify overdue (past-due) incomplete tasks, improving prioritization and deadline awareness, while preserving all existing task flows (create/complete/delete/filter) and maintaining backward compatibility with previously saved tasks.

## 3. User needs and affected user roles
### 3.1 User roles
- **End user / task owner:** Creates and manages personal tasks in the browser.

### 3.2 User needs
- Create tasks with or without a due date.
- See due dates displayed consistently on tasks that have them.
- Immediately recognize which incomplete tasks are overdue.
- Ensure data persists across reloads (including due dates) and older tasks remain intact.
- Continue using existing completion, deletion, clearing completed, and filters without disruption.

## 4. Existing application overview (from repository inspection)
### 4.1 Technology stack
- **Client:** Static web application
- **Languages:** HTML, CSS, JavaScript (vanilla)
- **Persistence:** Browser `localStorage`
- **Date/formatting:** Uses `Intl.DateTimeFormat` for displaying "today" label.

### 4.2 High-level architecture
- Single-page UI served from `index.html`.
- `app.js` contains:
  - DOM bindings for form, list, counters, filters.
  - In-memory `tasks` array loaded from `localStorage` key `daylight-todos`.
  - Create / toggle complete / delete / clear-completed behavior.
  - Render pipeline (`render`, `createTaskElement`).
- Styling is defined in `styles.css`.

## 5. Existing functionality (baseline)
### 5.1 Task model (current)
A task object is persisted as JSON and currently includes:
- `id` (string)
- `text` (string)
- `completed` (boolean)
- `createdAt` (number; epoch millis)

### 5.2 Create task
- User submits the add form; text is trimmed and validated non-empty.
- A task is added to the top of the list (`tasks.unshift`).
- Data is saved to `localStorage` and UI re-rendered.

### 5.3 Complete / uncomplete task
- Clicking toggle button flips `task.completed`.

### 5.4 Delete task
- Clicking delete removes task from array.

### 5.5 Clear completed
- Removes all completed tasks.

### 5.6 Filters
- UI supports filter buttons with dataset values:
  - `all`
  - `active` ("To do")
  - `completed` ("Done")

### 5.7 Persistence and backward tolerance (current)
- `loadTasks()` reads `localStorage` and filters to tasks with valid `id`, `text`, `completed`.
- Additional/unknown fields are currently tolerated (they remain in stored JSON and are preserved by `saveAndRender()`), but are not used/displayed.

## 6. Functional requirements
> Each requirement is uniquely identified (FR-###).

### 6.1 Due date capture
- **FR-001 (Optional due date input):** The task creation interface shall provide an optional due date input field for the user to select a date when creating a task.
- **FR-002 (Create with due date):** When a user submits a new task with a selected due date, the application shall save the task with the associated due date.
- **FR-003 (Create without due date):** When a user submits a new task without selecting a due date, the application shall save the task successfully with no due date value stored.

### 6.2 Persistence and compatibility
- **FR-004 (Persist due date):** The application shall persist each task’s due date (if provided) in browser `localStorage` alongside other task fields.
- **FR-005 (Backward compatibility for existing tasks):** Tasks created before introduction of due dates shall continue to load and display without requiring any migration action by the user and without data loss.

### 6.3 Due date display
- **FR-006 (Display due date):** For tasks that have a due date, the application shall display the due date in the task list.
- **FR-007 (Hide due date label when absent):** For tasks without a due date, the application shall not display any due-date label/placeholder.
- **FR-008 (Due date format):** The due date displayed in the UI shall use the format **DD MMM YYYY** (e.g., `03 Nov 2026`).

### 6.4 Overdue identification
- **FR-009 (Overdue rule - incomplete only):** The application shall mark a task as overdue when:
  1) it has a due date, **and**
  2) it is **incomplete**, **and**
  3) its due date is **earlier than the current local calendar date**.
- **FR-010 (Not overdue when completed):** The application shall not mark completed tasks as overdue even if their due date is earlier than the current local calendar date.
- **FR-011 (Not overdue when due today):** The application shall not mark tasks as overdue when their due date equals the current local calendar date.
- **FR-012 (Overdue visual indicator):** Overdue tasks shall be visually distinguished in the task list using a badge/label (or equivalent) with sufficient contrast and accessible text.

### 6.5 Preserve existing behavior
- **FR-013 (Preserve existing actions):** Task completion/uncompletion, deletion, and clear-completed operations shall continue to work for tasks with or without due dates.
- **FR-014 (Preserve filters):** The All / To do / Done filters shall continue to function correctly for tasks with or without due dates.

## 7. Non-functional requirements
> Each non-functional requirement is uniquely identified (NFR-###).

- **NFR-001 (Usability - optionality):** The due date field shall be optional and shall not add mandatory steps for creating a task.
- **NFR-002 (Local date correctness):** Overdue evaluation shall be based on the user’s **local calendar date** (not UTC time), to avoid misclassification around midnight/time zones.
- **NFR-003 (Accessibility):** Any overdue indicator shall have accessible text (e.g., readable label and/or ARIA support) and sufficient visual contrast.
- **NFR-004 (Responsive UI):** The interface (including the due date input and due date/overdue display) shall remain usable on desktop and mobile breakpoints already supported by the application.
- **NFR-005 (Resilience):** If `localStorage` read/write fails, the application shall continue to function without crashing, consistent with existing error-handling patterns.

## 8. Acceptance criteria (testable)
> Each acceptance criterion is uniquely identified (AC-###).

- **AC-001 (Add an Optional Due Date):**
  - Given I am creating a new task,
  - When I select a due date and submit the task,
  - Then the task is saved with the selected due date.

- **AC-002 (Allow Tasks Without Due Dates):**
  - Given I am creating a new task,
  - When I submit the task without selecting a due date,
  - Then the task is saved successfully without a due date,
  - And no due-date label is displayed for that task.

- **AC-003 (Display the Due Date):**
  - Given a task has an assigned due date,
  - When I view the task in the task list,
  - Then the due date is displayed in format `DD MMM YYYY`.

- **AC-004 (Identify Overdue Tasks):**
  - Given a task has a due date earlier than the current local calendar date,
  - And the task is incomplete,
  - When I view the task list,
  - Then the task is visibly marked as overdue.

- **AC-005 (Do Not Mark Completed Tasks as Overdue):**
  - Given a task has a due date earlier than the current local calendar date,
  - And the task is completed,
  - When I view the task list,
  - Then the task is not marked as overdue.

- **AC-006 (Handle Tasks Due Today):**
  - Given a task has a due date equal to the current local calendar date,
  - When I view the task list,
  - Then the task is not marked as overdue.

- **AC-007 (Persist Due Dates):**
  - Given I have created a task with a due date,
  - When I reload or reopen the application,
  - Then the task and its assigned due date remain available.

- **AC-008 (Preserve Existing Functionality):**
  - Given tasks have been created with or without due dates,
  - When I use task completion, deletion, or the All/To do/Done filters,
  - Then all existing controls continue to function correctly.

- **AC-009 (Maintain Existing Task Compatibility):**
  - Given tasks were created before the due-date feature was introduced,
  - When I open the application,
  - Then those tasks remain available without requiring a due date,
  - And no existing task data is lost.

## 9. Business rules
- **BR-001 (Optional due date):** A due date is optional for task creation; absence of a due date must not block saving a task.
- **BR-002 (Overdue evaluation - date only):** Overdue status is determined by comparing the task due date to the **current local calendar date**, ignoring time-of-day.
- **BR-003 (Overdue requires due date):** A task without a due date can never be considered overdue.
- **BR-004 (Completion overrides overdue):** Completed tasks are never shown as overdue.
- **BR-005 (Due-today not overdue):** Due date equal to the current local calendar date is not overdue.

## 10. Constraints and assumptions
### 10.1 Constraints
- **C-001:** Persistence must continue to use browser `localStorage` under the existing key (`daylight-todos`).
- **C-002:** Existing task CRUD and filter behavior must remain intact.
- **C-003:** No due date editing after creation (explicitly out of scope).

### 10.2 Assumptions
- **A-001:** Due dates will be stored in a JSON-serializable form (e.g., ISO date string like `YYYY-MM-DD` or epoch millis) and can be rendered as `DD MMM YYYY`.
- **A-002:** The definition of “current local calendar date” aligns with the end user’s device locale/timezone.
- **A-003:** Tasks are displayed in a list and can be enhanced to show additional metadata (due date and/or overdue badge) without breaking layout.

## 11. Dependencies
- **D-001:** Existing task creation form and submit handler in `app.js`.
- **D-002:** Existing `localStorage` read/write implementation (`loadTasks`, `saveAndRender`).
- **D-003:** Existing task rendering logic (`render`, `createTaskElement`).
- **D-004:** Existing completion and filter logic must support tasks with the new `dueDate` property.

## 12. Risks
- **R-001 (Date parsing/format mismatch):** Storing due dates as locale-specific strings could cause parsing failures; needs a stable storage format.
- **R-002 (Timezone boundary issues):** If comparisons use timestamps instead of local calendar dates, tasks may be marked overdue incorrectly around midnight.
- **R-003 (Backward compatibility/data validation):** `loadTasks()` currently filters tasks to required properties; adding optional `dueDate` must not cause older tasks to be dropped.
- **R-004 (UI regressions):** Adding UI elements (due date label/badge) could affect spacing, wrapping, or mobile layout.
- **R-005 (Accessibility regressions):** Overdue marking must not rely on color alone and must be perceivable to assistive technologies.

## 13. Out-of-scope items
- Notifications or reminders.
- Recurring tasks.
- Editing or changing due dates after task creation.
- Calendar integration.
- Email or push notifications.
- Advanced deadline-based filtering or sorting.

## 14. Open questions
- **Q-001:** What storage format is preferred for `dueDate` (e.g., ISO `YYYY-MM-DD` string vs epoch millis)?
- **Q-002:** Should the due date be displayed for completed tasks as well (not overdue, but still visible)?
- **Q-003:** What exact text should the overdue badge/label use (e.g., “Overdue”) and should it be localized?
- **Q-004:** Should tasks without due dates show any spacing/alignment placeholder (AC suggests no label, but layout expectation should be confirmed)?
- **Q-005:** Should the due date input default to empty always, or can it auto-suggest today/next day? (Story implies optional; default behavior not specified.)

## 15. Requirement traceability
| Type | ID | Summary | Primary AC |
|---|---|---|---|
| FR | FR-001 | Provide optional due date input | AC-001, AC-002 |
| FR | FR-002 | Save task with selected due date | AC-001 |
| FR | FR-003 | Save task without due date | AC-002 |
| FR | FR-004 | Persist due date in localStorage | AC-007 |
| FR | FR-005 | Backward compatible load/display | AC-009 |
| FR | FR-006 | Display due date on task | AC-003 |
| FR | FR-007 | No due date label when absent | AC-002 |
| FR | FR-008 | Due date format DD MMM YYYY | AC-003 |
| FR | FR-009 | Mark overdue incomplete past-due | AC-004 |
| FR | FR-010 | Completed tasks not overdue | AC-005 |
| FR | FR-011 | Due today not overdue | AC-006 |
| FR | FR-012 | Visual overdue indicator | AC-004 |
| FR | FR-013 | Preserve actions for all tasks | AC-008 |
| FR | FR-014 | Preserve filters for all tasks | AC-008 |
| NFR | NFR-001 | Optionality/usability | AC-001, AC-002 |
| NFR | NFR-002 | Local calendar date correctness | AC-004, AC-006 |
| NFR | NFR-003 | Accessible overdue indicator | AC-004 |
| NFR | NFR-004 | Responsive UI | AC-001..AC-008 |
| NFR | NFR-005 | Resilient storage handling | AC-007 |
