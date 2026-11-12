# TODO Application Requirements Traceability

## Document Control
- Project: **mm-learning-group-1**
- Repository: **Manoj-A-Anandan/Codemie-Code-Task-Todo**
- Feature: **Add Optional Due Dates and Overdue Identification to Tasks**

---

## 1. How to read this matrix
This matrix maps each approved functional requirement (FR-xxx) to:
- Acceptance criteria (AC-xxx) from the FRD
- Implementation tasks (TASK-xxx) from the approved implementation plan
- Design components impacted
- Testing activities (manual test focus, given repository has no test framework)

---

## 2. Traceability Matrix

| Requirement ID | Acceptance Criteria IDs | Implementation Task IDs | Design Components | Test Activities |
|---|---|---|---|---|
| **FR-001** Optional due date capture on task creation | AC-001 | TASK-002, TASK-003 | `index.html` add-form; `app.js` submit handler | Create task with due date; verify stored + displayed after render |
| **FR-002** Save task with due date when provided | AC-001 | TASK-003, TASK-007 | `app.js` task model + persistence | Create task with due date; reload; ensure due date persists |
| **FR-003** Save task without due date | AC-002 | TASK-002, TASK-003 | `index.html` add-form; `app.js` submit handler | Create task without due date; verify created; verify no due date label |
| **FR-004** Display due date in task list (DD MMM YYYY) | AC-003 | TASK-005 | `app.js` createTaskElement + formatter; `styles.css` | Verify format `DD MMM YYYY` across locales; tasks without due date show nothing |
| **FR-005** Overdue identification (past due + incomplete) | AC-004 | TASK-001, TASK-004, TASK-006 | `app.js` overdue predicate; `styles.css` overdue indicator | Create incomplete task with yesterday due date; verify overdue mark |
| **FR-006** Completed tasks are never overdue | AC-005 | TASK-004, TASK-006, TASK-008 | `app.js` overdue predicate + render; `styles.css` | Mark an overdue task completed; verify overdue mark removed |
| **FR-007** Tasks due today are not overdue | AC-006 | TASK-004, TASK-006 | `app.js` overdue predicate | Create task due today; verify no overdue mark |
| **FR-008** Due date persistence | AC-007 | TASK-003, TASK-007 | `app.js` saveAndRender/loadTasks | Reload app; verify tasks + due dates still present |
| **FR-009** Preserve existing task actions and filters | AC-008 | TASK-008 | `app.js` filters + event delegation; `index.html` filter buttons | Regression: filter All/To do/Done, toggle, delete, clear completed |
| **FR-010** Backward compatibility with existing stored tasks | AC-009 | TASK-007, TASK-005 | `app.js` loadTasks + rendering | Pre-populate localStorage with old schema; verify load and render without errors |

---

## 3. Coverage Notes
### 3.1 Requirements without design coverage
- None identified; all FR-001..FR-010 are covered by Architecture/HLD/LLD sections.

### 3.2 Tasks without requirement traceability
- **TASK-001** is primarily a design decision task but supports FR-005/FR-004 and NFR-004.
- **TASK-009** is documentation/testing enablement; maps to multiple FRs and NFR-003.

---

## 4. Suggested Manual Test Checklist (summary)
1. Add task with due date; verify display format and persistence.
2. Add task without due date; verify created and no label.
3. Create task due yesterday (incomplete); verify overdue.
4. Mark overdue task completed; verify overdue removed.
5. Create task due today; verify not overdue.
6. Reload page; verify tasks and due dates persist.
7. Verify All/To do/Done filters work with mixed due/no-due tasks.
8. Verify delete and clear completed.
