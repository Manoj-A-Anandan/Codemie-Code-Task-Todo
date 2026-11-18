# Architecture — EPMCDMETST-72039

- **Story:** EPMCDMETST-72039 — Add Optional Due Dates and Overdue Identification to Tasks
- **Repository:** Codemie-Code-Task-Todo (Daylight ToDo)
- **Base branch:** `main`
- **Implementation branch:** `feature/EPMCDMETST-72039-optional-due-dates`
- **Document purpose:** Describe the verified current architecture and the proposed design changes needed to implement optional due dates and overdue identification.

## 1. Business context
The Daylight ToDo application is a lightweight, client-side task list. The requested enhancement allows users to optionally attach a due date to a task at creation time and to visually identify overdue tasks (only when incomplete), improving prioritization without adding backend complexity.

### Goals
- Add an optional due date when creating a task.
- Persist due dates in existing localStorage model.
- Display due dates using format **DD MMM YYYY**.
- Mark overdue tasks using **local calendar date** comparison.
- Preserve existing features and stored data.

### Out of scope
- Editing due dates after creation.
- Notifications/reminders.
- Sorting by date, recurring tasks, calendar integrations.

## 2. Verified existing architecture (as-is)
Verified by repository inspection of these files:
- `index.html`
- `app.js`
- `styles.css`

### Application type
- Static, single-page web application.
- No build step; runs by opening `index.html` in a browser.

### Runtime components
- **UI (DOM)**: markup in `index.html` and styling in `styles.css`.
- **State + controller logic**: `app.js` maintains in-memory `tasks` array and `activeFilter`.
- **Persistence**: browser `localStorage` with key `daylight-todos`.

### Current data model (persisted)
In `app.js`, tasks are persisted to localStorage as JSON array; `loadTasks()` filters invalid objects using:
- `id: string`
- `text: string`
- `completed: boolean`

`createdAt` is currently set on create but not validated on load.

### Existing behavior (high level)
- Create task via `#add-form` submit.
- Render list via `render()` + `createTaskElement(task)`.
- Handle toggle/delete via click delegation on `#task-list` for `button[data-action]`.
- Filters: all/active/completed.

## 3. Proposed architecture (to-be)
The enhancement is implemented as a **backward-compatible extension** of the task model and DOM rendering.

### Key architectural choices
- **Store due dates as ISO local date string `YYYY-MM-DD`** in the task object (proposed field: `dueDate?: string`).
  - Rationale: Enables safe lexicographic compare for overdue checks and avoids timezone drift when comparing.
- **Compute overdue using local calendar date only**.
  - Normalize “today” to local ISO date (`YYYY-MM-DD`) and compare date strings.
- **Conditional rendering**: due date and overdue badge appear only when applicable.
- **Preserve resilience**: extend `loadTasks()` validation to accept missing `dueDate` and validate format when present.

### Proposed updated task model
> **Proposed** persisted shape (existing fields + extension):

```ts
type Task = {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
  dueDate?: string; // proposed: "YYYY-MM-DD"
};
```

### Components impacted
- **UI form** (`index.html`): add `<input type="date">` (optional).
- **App controller/state** (`app.js`):
  - include `dueDate` when creating task
  - validate `dueDate` during load
  - format and render due date
  - compute overdue and render marker
- **Styles** (`styles.css`): add overdue styles and (optionally) due-date metadata styles.

## 4. Data and integration design

### Persistence
- Continue using `localStorage` under `daylight-todos`.
- No schema migration step required.
- Backward compatibility: tasks missing `dueDate` remain valid and render as before.

### Date handling
- **Storage**: `dueDate` stored as `YYYY-MM-DD` (from native date input value).
- **Display**: convert `YYYY-MM-DD` to local `Date(year, monthIndex, day)` and format to `DD MMM YYYY`.
- **Overdue rule**: overdue when:
  - `!task.completed`
  - `task.dueDate` exists and is valid
  - `task.dueDate < todayIso`

### External integrations
- None (no backend).
- Uses browser APIs:
  - `localStorage`
  - `Intl.DateTimeFormat`
  - `crypto.randomUUID` (already used)

## 5. Security considerations
- No authentication/authorization.
- Data stored in localStorage is user-local and can be modified by the user.
- Defensive loading is important to avoid runtime errors caused by malformed localStorage contents.
- Avoid XSS: task text is assigned via `textContent` (already used); due date and overdue labels must also use `textContent`.

## 6. Compatibility
- Existing stored tasks (without `dueDate`) must still load and function.
- Browsers without `crypto.randomUUID` are supported via fallback already present.
- `input[type=date]` fallback: in unsupported browsers it behaves as a text input; validation rules should be tolerant and avoid crashing.

## 7. Decisions (record)
1. **Due date storage format**: store as `YYYY-MM-DD` string (proposed).
2. **Overdue comparison**: compare ISO date strings against local “today” ISO (proposed).
3. **No migration**: keep persisted array; only extend schema.
4. **No due date label when absent**: implement via conditional DOM element creation.

## 8. Risks and mitigations
| Risk | Impact | Mitigation |
|---|---:|---|
| Timezone/off-by-one when converting date strings | Incorrect overdue marking / display date | Store date-only ISO string; parse for display using `new Date(y, m-1, d)`; compare strings for overdue |
| Invalid localStorage data | App crash or broken render | Extend `loadTasks()` validation to accept missing dueDate and validate when present; keep try/catch |
| Accessibility regression for overdue indicator | Poor UX for screen readers or low-vision users | Use visible “Overdue” label + contrast; include accessible text via `aria-label` if needed |
| UI layout regression | Form overflow on narrow screens | Minimal CSS adjustments; verify at existing `@media (max-width: 520px)` |

## 9. Assumptions
- No requirement to edit due dates after creation.
- Overdue marking is purely visual and does not change filtering logic.
- Locale for due-date display can be enforced (e.g., `en-GB`) to achieve `DD MMM YYYY` output.

## 10. Open questions
1. Confirm final due-date storage representation: omit `dueDate` vs store `null` when empty (current recommendation: omit).
2. Confirm desired overdue styling (badge only vs badge + border/background).
3. Confirm whether overdue badge should show for completed tasks in “Done” filter (requirements say **never** overdue when completed).
