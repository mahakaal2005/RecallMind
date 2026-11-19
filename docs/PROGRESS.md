# RecallMind — Progress & Where To Continue

> **Read this first in every new session.** Update it whenever something is finished.
> Last updated: 2026-11-19 (Atul Postman folder, local verification, deploy prep)

## Status in one line

All three feature slices (Atul: Knowledge CRUD & search, Vansh: Ingestion, activity, system & reflections, Rajan: Recall quiz, stats & situational retrieval) are **fully implemented end-to-end** across server routes, controllers, services, and React client pages.

## Done

### Planning & docs
- [x] PRD read and converted into a plan (`docs/RecallMind-PRD.md` unchanged)
- [x] `docs/MVP.md`: demo story, scope, decisions that differ from the PRD
- [x] `docs/TASKS.md`: work split across 3 members, event contract, timeline, git workflow
- [x] `README.md`: structure + how to run
- [x] `CLAUDE.md` (repo root) for future Claude sessions

### Server (`server/`), verified with a stubbed DB
- [x] `server.js`: cors, json, request logger, all routers mounted, 404 handler, error handler
- [x] `config/db.js`: Mongoose connection (exits on failure)
- [x] Models: `KnowledgeEntry` (nested `lessons` sub-schema, text index with weights, timestamps), `Quiz`, `Reflection`, `ActivityLog`
- [x] Middleware: `requestLogger` (→ `logs/requests.log`), `errorHandler` (handles CastError, ValidationError), `asyncHandler`, `upload` (bare multer, no filter yet), `validateInput` (basic starter)
- [x] Utils: `apiResponse` (`sendSuccess`, `ApiError`), `pagination`, `constants`, `notImplemented`
- [x] `events/appEvents.js` (EventEmitter); `eventHandlers.js` is a stub that only console.logs `knowledge:added`
- [x] All routes defined (`routes/*.js`), specific paths before `/:id`
- [x] **Working endpoint:** `GET /api/health`
- [x] `scripts/seed.js` (5 entries, 15 lessons; wipes all collections) and `scripts/sample-notes.md` (upload test file)
- [x] Smoke test: health 200, placeholders 501 with owner name, unknown route 404, request log written

### Client (`client/`), builds and lints clean
- [x] Scaffold moved from repo root; demo assets removed
- [x] `react-router-dom`, Vite proxy `/api` → `localhost:5000`
- [x] `src/api/client.js` fetch wrapper
- [x] `Layout` with nav + API status dot; `Placeholder` component
- [x] 10 placeholder pages with TODO lists: Library, EntryForm, EntryDetail, Upload, Quiz, Stats, Search, Help, Journal, Activity
- [x] Base styles with light/dark CSS variables

## Feature Implementation

### Owner: Atul
- [x] Knowledge CRUD (5 endpoints) + validation + `GET /knowledge/search` (tested against a real local MongoDB)
- [x] Pages: Library, EntryForm, EntryDetail, Search (build passes; not click-tested in a browser)

### Owner: Vansh
- [x] `middleware/upload.js` filter + size limit, `fileParser.js`, `POST /knowledge/upload`, `POST /knowledge/quick`
- [x] `eventHandlers.js` for all 4 events (file + ActivityLog collection)
- [x] `GET /activity/log`, `GET /activity/summary`, `GET /system/info`
- [x] Reflections: 4 endpoints
- [x] Pages: Upload, Activity, Journal (lint/build pass; client wired to all Vansh endpoints)

### Owner: Rajan
- [x] `recallEngine.js` + 4 quiz endpoints (generate, submit, history, stats)
- [x] `retrieveService.js` + `POST /knowledge/retrieve`
- [x] Pages: Quiz, Stats, Help
- [x] Documentation & Postman: `docs/API.md` and `docs/RecallMind.postman_collection.json` updated with Rajan's endpoints

### Shared / final
- [x] Postman collection (`docs/RecallMind.postman_collection.json`): Atul, Vansh and Rajan folders, error cases included
- [x] `docs/API.md`
- [x] Integration pass (EntryDetail ↔ reflections, Help → Journal `?entryId=&lessonId=`, events from every feature) — checked against a real MongoDB on 2026-11-19; UI not yet click-tested in a browser
- [ ] Demo rehearsal + viva prep

## Known gaps & open questions

- **Verified locally against a real MongoDB** (seed + ~40 requests across all three owners, 2026-11-19). Not yet verified on Atlas or on a deployed site.
- **Frontend is not in the PRD** (it says backend-only). Confirm with the instructor; the backend stands alone via Postman if the UI is not allowed.
- Repo: github.com/mahakaal2005/RecallMind (private).
- `server/.env` is gitignored. Copy `.env.example` and set `MONGODB_URI`.
- `client/node_modules` installed on Windows lacks Linux native bindings; run `npm install` again on the other OS.
- `npm run lint` in `client/` (oxlint) printed a "JSON parse failed" error on Linux; not investigated.

## Deployment plan

- Client on Vercel (`client/vercel.json` rewrites to `index.html`; set `VITE_API_URL` to the API origin).
- API on Render (`render.yaml`, free plan sleeps when idle; set `MONGODB_URI` in the dashboard). A persistent host is used so `logs/*.log` and `uploads/` keep working (Unit 1 features); Vercel functions have a read-only filesystem.
- Database: MongoDB Atlas free (M0) cluster; allow access from `0.0.0.0/0` because Render IPs change.

## Next steps (start here)

1. Create the Atlas cluster, seed it (`MONGODB_URI=<atlas> npm run seed` wipes that DB), deploy API to Render, then the client to Vercel.
2. Click through every page on the deployed site and fix what breaks.
3. Demo rehearsal x2 and viva prep (see the viva notes in `docs/TASKS.md`).
