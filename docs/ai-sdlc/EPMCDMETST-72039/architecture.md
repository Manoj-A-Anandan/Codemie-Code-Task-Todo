# Architecture — EPMCDMETST-72039

## Architectural context
**Product:** Daylight ToDo (static web ToDo app)

**Story:** EPMCDMETST-72039 — Add Optional Due Dates and Overdue Identification to Tasks

**Goal:** Extend the existing single-page ToDo app so tasks may optionally include a due date, tasks display the due date in `DD MMM YYYY` format, and incomplete tasks with a due date earlier than the current **local calendar date** are visually marked as overdue—without breaking existing CRUD, filters, persistence, or previously stored tasks.

## Current architecture (as-is)
### Architectural style
- **Client-only SPA (no backend)**: A static HTML/CSS/JS app.
- **DOM-driven rendering**: JavaScript creates DOM elements imperatively.
- **Local persistence**: Uses browser `localStorage` as a lightweight store.

### Layers / responsibilities (evidence-based)
From repository inspection (`index.html`, `app.js`, `styles.css`):

- **Presentation (HTML/CSS)**
  - `index.html` defines:
    - Task add form (`#add-form`, input `#task-input`, submit button)
    - Task list container (`#task-list`)
    - Filter buttons (`.filter-button` with `data-filter`)
    - Counters (`#task-total`, `#remaining-count`)
  - `styles.css` defines styling and responsive rules (`@media (max-width: 520px)`), and accessibility helper `.sr-only`.

- **UI/State/Domain (JavaScript - single module)**
  - `app.js` contains:
    - DOM bindings (`document.querySelector(...)`)
    - In-memory state: `tasks` array loaded by `loadTasks()`, plus `activeFilter`
    - Event handlers: submit, filter click, list click (toggle/delete), clear completed
    - Persistence: `loadTasks()`, `saveAndRender()` using `localStorage` key `daylight-todos`
    - Rendering: `render()` and `createTaskElement(task)`

### Component relationships
```mermaid
flowchart LR
  U[User] -->|interacts| UI[index.html + styles.css]
  UI -->|events| JS[app.js]
  JS -->|read/write| LS[(localStorage: "daylight-todos")]
  JS -->|renders| UI
```

### Data model (as-is)
Current task objects created in `app.js` are:
- `id: string`
- `text: string`
- `completed: boolean`
- `createdAt: number` (epoch millis)

`loadTasks()` validates presence/types of `id`, `text`, `completed` and **tolerates unknown extra fields** by filtering only on required properties.

### Existing patterns
- **Single source of truth**: in-memory `tasks` array.
- **Event delegation**: click handler on `#task-list` finds closest `button[data-action]`.
- **Re-render on state change**: `saveAndRender()` persists then calls `render()`.

## Proposed architectural changes (to-be)
This story is an incremental enhancement; no new layers or frameworks are introduced.

### 1) Extend the task model with an optional `dueDate`
- **Proposed model addition**:
  - `dueDate?: string` stored as **ISO date-only** `YYYY-MM-DD`.

**Rationale**
- Stable, locale-independent representation.
- Directly compatible with `<input type="date">` value.
- Avoids timezone errors that occur when storing timestamps for a “date-only” concept.

### 2) Add small, pure helper functions in `app.js`
Proposed additions (no new files required):
- `parseIsoDateOnly(iso: string): Date | null`
- `toLocalDateKey(date: Date): number` → `YYYYMMDD` numeric key
- `formatDueDate(iso: string): string` → `DD MMM YYYY`
- `isOverdue(task, now = new Date()): boolean`

**Rationale**
- Keeps business rules centralized.
- Makes overdue determination consistent across render and future features.
- Local date key comparison meets NFR-002.

### 3) Enhance rendering to show due date & overdue marker
- Update `createTaskElement(task)` to optionally append:
  - a due date text element (only when `dueDate` is present)
  - an overdue badge (only when overdue)
- Add an `is-overdue` class to the `<li>` element for styling.

### 4) Add optional due date input in UI
- Update `index.html` add form to include an optional `<input type="date" id="due-date-input">` plus an accessible label.

### 5) Backward compatibility safeguards
- Keep `loadTasks()` required field validation unchanged.
- Add *non-breaking* normalization for `dueDate`:
  - If missing → fine.
  - If present but invalid → set to `undefined` (do not drop the task).

## Design principles
- **Minimal change / repo-aligned**: keep the current single-module architecture.
- **Backward compatible by default**: never require `dueDate`.
- **Local-date correctness**: compare by local calendar day, not timestamps/UTC.
- **Accessible status indicators**: overdue must not be color-only; include readable label.
- **Fail-safe persistence**: keep existing `try/catch` around localStorage.

## Component responsibilities (to-be)
### `index.html`
- Provide form inputs for task text and optional due date.
- Keep existing task list/filter markup unchanged.

### `app.js`
- Own state (`tasks`, `activeFilter`).
- On submit:
  - create task with `dueDate` only when selected.
- On render:
  - compute overdue status using helpers.
  - display due date formatted.
- Persist tasks as JSON to localStorage.

### `styles.css`
- Style new due date input.
- Add styles for due date display and overdue badge.
- Ensure responsive behavior remains good at <= 520px.

## Integration boundaries
- **External APIs**:
  - Browser DOM API
  - Browser `localStorage`
  - `Intl.DateTimeFormat`
  - `crypto.randomUUID` (already used)

No network calls or server integrations.

## Architectural decisions & rationale
| Decision | Choice | Rationale | Alternatives considered |
|---|---|---|---|
| Store due date as | ISO date-only `YYYY-MM-DD` string | Avoid timezone drift; matches date input | Epoch millis (risk of timezone misclassification) |
| Determine overdue using | Local date key compare (`YYYYMMDD`) | Meets NFR-002; ignores time-of-day | Direct `Date.parse` compare (timezone pitfalls) |
| Render overdue indicator | Badge text "Overdue" + class `is-overdue` | Accessibility (NFR-003) and styling flexibility | Color-only row styling (fails accessibility) |
| Backward compatibility | Ignore invalid dueDate, don’t drop tasks | Preserve tasks; non-breaking | Migration pass that rewrites storage (unnecessary) |

## Security considerations
- App is client-only; primary concerns are DOM safety and storage integrity.
- **XSS/Injection**: existing code uses `textContent` for task text, preventing HTML injection. Continue that approach for due date and badge label.
- **localStorage**: untrusted input (may be edited). Must validate dueDate string; never assume it’s safe/valid.
- **ARIA**: overdue badge should be readable; avoid relying on color alone.

## Scalability considerations
- Current architecture re-renders list on every change (`replaceChildren`). This is acceptable for typical personal ToDo sizes.
- Overdue computation is O(n) during render; acceptable within current constraints.

## Risks & trade-offs
- **Formatting consistency**: `Intl.DateTimeFormat` depends on locale; to ensure `DD MMM YYYY`, we will use a locale that yields the desired order (e.g., `en-GB`) for due date formatting.
- **Date parsing**: `new Date('YYYY-MM-DD')` may be treated as UTC by some engines; mitigate by parsing components and constructing `new Date(y, m-1, d)`.
- **UI density**: adding due date and badge may increase line wrapping; mitigate via CSS and mobile adjustments.

## Out of scope (per requirements)
- Editing due dates.
- Sorting/filtering by due date.
- Notifications/reminders.
