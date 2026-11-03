# RecallMind

College mid-sem 2 project (Backend Servers & API Development with Databases, Units 1–4). An active-recall learning app: store lessons from books/notes, quiz on weak ones, retrieve lessons for a real-life problem.

**Start every session by reading `docs/PROGRESS.md`** (what is done / what is next), then the relevant section of `docs/TASKS.md`. Spec: `docs/RecallMind-PRD.md`. Scope decisions that differ from the PRD: `docs/MVP.md`.

## Team (3)

Atul (knowledge CRUD + keyword search), Vansh (upload, events/activity, system info, reflections), Rajan (quiz, stats, "Help me with…" retrieve). Each file has an `// OWNER:` comment. Don't edit another owner's file without asking.

## Layout

- `server/` — Express + Mongoose, **CommonJS** (`require`/`module.exports`, required by the syllabus). Run: `npm run dev` (port 5000), `npm run seed` (wipes DB, loads sample data).
- `client/` — React 19 + Vite + react-router-dom, **ESM**, plain CSS (variables in `src/index.css`), no UI library. Run: `npm run dev` (5173, proxies `/api`). Lint: `npm run lint` (oxlint).
- `docs/` — PRD, MVP, TASKS, PROGRESS.

## Server conventions

- Flow: `routes/` → `controllers/` → `services/` → `models/`. Routes are already wired; replace `notImplemented('Owner')` in controllers with real functions.
- Wrap async controllers in `asyncHandler`. Respond with `sendSuccess(res, data, message, status, extra)`; throw `new ApiError(status, msg)` for errors. Shape is always `{ success, message, data }` or `{ success: false, error }`.
- Pagination via `utils/pagination.js` (default 10, max 50). Paginated responses include a `pagination` meta block.
- Emit events with `appEvents.emit(EVENTS.X, payload)`; names and payloads are in `utils/constants.js` and `docs/TASKS.md`.
- Lessons are nested sub-documents in `KnowledgeEntry`, identified by their own `_id` (`lessonId`), never by array index. Update nested lessons with the positional operator.
- Keep to Units 1–4: no auth, no AI/LLM, no frontend frameworks beyond what's installed. Use Node core modules (fs, streams, events, os) where the PRD says so — they are graded.
- Specific routes (`/search`, `/upload`) must stay above `/:id` in router files.
- Logs: `server/logs/requests.log` (middleware), `server/logs/activity.log` (event handlers). Both gitignored.

## Client conventions

- Call the API only through `src/api/client.js` (`api.get/post/put/delete/upload`); it throws `Error(message)` on failure. Show loading and error states.
- One page file per feature in `src/pages/`; use `var(--accent)` etc. instead of hard-coded colors.

## Gotchas

- MongoDB is not installed locally; use Atlas or install Community Server, set `MONGODB_URI` in `server/.env` (copy from `.env.example`).
- Shell is Git Bash on Windows: nested heredocs and apostrophes in `bash -c` break. Prefer the Write/Edit tools for file content.
- The `/api/knowledge/retrieve` route is Rajan's (`retrieveController`); `/api/knowledge/search` is Atul's (`searchController`).

## Git

Never add `Co-Authored-By: Claude`, "Generated with Claude Code", or any Claude/Anthropic attribution to commits or PRs. Claude must not appear as co-author or committer; commits carry only the human author's identity.

## When you finish something

Tick it in `docs/TASKS.md` and `docs/PROGRESS.md`, and update the "Last updated" date in PROGRESS.md.
