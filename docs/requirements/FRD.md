# Functional Requirements Document (FRD)

## Document Control
- Project: **mm-learning-group-1**
- Repository: **Manoj-A-Anandan/Codemie-Code-Task-Todo**
- Feature: **Add Optional Due Dates and Overdue Identification to Tasks**
- Source: Confluence user story: **“Add Optional Due Dates and Overdue Identification to Tasks”**
- Status: **Approved requirements (input to design)**

> Note: This document is the *approved* requirement analysis provided as input to the SDLC workflow. No new requirements are introduced here.

---

## 1. Source Requirement (Confluence)
### 1.1 Page details
- Title: Add Optional Due Dates and Overdue Identification to Tasks
- Priority: Medium
- Issue Type: User Story
- Component: Task Management
- URL: `{{confluence_story_url}}`

### 1.2 User story
As a person managing daily tasks,
I want to assign an optional due date to a task and identify when it becomes overdue,
So that I can prioritize upcoming work, track deadlines, and avoid missing important tasks.

### 1.3 Acceptance criteria from source
- **AC1** Add an Optional Due Date
- **AC2** Allow Tasks Without Due Dates
- **AC3** Display the Due Date (DD MMM YYYY)
- **AC4** Identify Overdue Tasks (due date earlier than current local calendar date AND incomplete)
- **AC5** Do Not Mark Completed Tasks as Overdue
- **AC6** Handle Tasks Due Today (not overdue)
- **AC7** Persist Due Dates (reload/reopen retains due date)
- **AC8** Preserve Existing Functionality (completion, deletion, filters All/To do/Done)
- **AC9** Maintain Existing Task Compatibility (pre-existing tasks remain available; no data loss; no due date required)

### 1.4 In scope
- Optional date input when creating a task
- Store tasks with or without due date in local storage
- Display due date in list
- Visually identify overdue incomplete tasks
- Keep completed tasks from being marked overdue
- Ensure reload/reopen retains due dates
- Preserve existing behavior and compatibility

### 1.5 Out of scope
- Notifications/reminders
- Recurring tasks
- Editing due dates after creation
- Calendar integration
- Advanced deadline-based filtering/sorting

---

## 2. Current Application Summary (main branch)
### 2.1 Architecture
- Single-page, client-only TODO application.
- Persistence via **browser localStorage**.
- No backend API.

### 2.2 Key implementation details (verified)
- Storage key: `daylight-todos`
- Task creation via `#add-form` submit
- Task model currently includes: `id`, `text`, `completed`, `createdAt`
- Filtering: `activeFilter` ∈ {`all`, `active`, `completed`}
- UI actions via event delegation on `#task-list` and `button[data-action]` (`toggle`, `delete`)

---

## 3. Functional Requirements

### FR-001 Optional due date capture on task creation
System shall allow a user to optionally select a due date when creating a new task.

### FR-002 Save task with due date when provided
System shall save the selected due date with the task when the user submits a new task with a due date.

### FR-003 Save task without due date
System shall save a task successfully when submitted without selecting a due date.

### FR-004 Display due date in task list
System shall display a task’s due date in a consistent, readable format: **DD MMM YYYY**.

### FR-005 Overdue identification
System shall visibly mark a task as overdue when:
- the task has a due date earlier than the current local calendar date, **AND**
- the task is incomplete.

### FR-006 Completed tasks are never overdue
System shall not mark a task as overdue if it is completed, even if the due date is earlier than the current local calendar date.

### FR-007 Tasks due today are not overdue
System shall not mark a task as overdue when its due date equals the current local calendar date.

### FR-008 Due date persistence
System shall persist due dates alongside tasks in browser local storage so that after reload/reopen the tasks and their due dates remain available.

### FR-009 Preserve existing task actions and filters
System shall preserve existing task completion, deletion, clear-completed, and All/To do/Done filter functionality for tasks created with or without due dates.

### FR-010 Backward compatibility with existing stored tasks
System shall load tasks created prior to the due date feature without requiring a due date and without losing existing task data.

---

## 4. Non-Functional Requirements

### NFR-001 Usability (desktop and mobile)
The interface changes required to support due dates shall remain usable on desktop and mobile devices.

### NFR-002 Correctness of date comparison
Overdue status shall be calculated using the user’s **local calendar date**.

### NFR-003 Data resilience
If localStorage contains malformed or non-array data, the application shall fail gracefully by loading an empty task list (consistent with current behavior) and shall not crash.

### NFR-004 Accessibility regression avoidance
Any new due date UI controls and overdue indicators shall not break existing keyboard navigation and screen-reader labels already present.

---

## 5. Business Rules & Validations

### BR-001 Due date is optional
Due date selection is not required to create a task.

### BR-002 Overdue determination rule
A task is overdue only if it has a due date strictly earlier than the current local calendar date AND it is incomplete.

### BR-003 Completed override
Completed tasks are never considered overdue.

### BR-004 Due-today rule
A due date equal to the current local calendar date is not overdue.

### BR-005 Display rule for tasks without due date
If a task has no due date, no due-date label shall be displayed.

---

## 6. Acceptance Criteria (Testable Gherkin)

### AC-001 (FR-001, FR-002)
Given I am creating a new task,
When I select a due date and submit the task,
Then the task is saved with the selected due date.

### AC-002 (FR-003, BR-005)
Given I am creating a new task,
When I submit the task without selecting a due date,
Then the task is saved successfully without a due date,
And no due-date label is displayed.

### AC-003 (FR-004)
Given a task has an assigned due date,
When I view the task in the task list,
Then the due date is displayed in format DD MMM YYYY.

### AC-004 (FR-005)
Given a task has a due date earlier than the current local calendar date,
And the task is incomplete,
When I view the task list,
Then the task is visibly marked as overdue.

### AC-005 (FR-006)
Given a task has a due date earlier than the current local calendar date,
And the task is completed,
When I view the task list,
Then the task is not marked as overdue.

### AC-006 (FR-007)
Given a task has a due date equal to the current local calendar date,
When I view the task list,
Then the task is not marked as overdue.

### AC-007 (FR-008)
Given I have created a task with a due date,
When I reload or reopen the application,
Then the task and its assigned due date remain available.

### AC-008 (FR-009)
Given tasks have been created with or without due dates,
When I use task completion, deletion, or the All, To do, and Done filters,
Then all existing controls continue to function correctly.

### AC-009 (FR-010)
Given tasks were created before the due-date feature was introduced,
When I open the application,
Then those tasks remain available without requiring a due date,
And no existing task data is lost.
