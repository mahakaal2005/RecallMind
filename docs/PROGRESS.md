# RecallMind — Progress & Where To Continue

> **Read this first in every new session.** Update it whenever something is finished.
> Last updated: 2026-11-13 (Vansh server slice done)

## Status in one line

Shared foundation is **done and verified**. All 20 feature endpoints are still **501 placeholders**. Nothing has been tested against a real MongoDB yet. Team of 3 (Atul, Vansh, Rajan) is ready to start building feature slices.

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

## Not done (everything below is still to build)

### Owner: Atul
- [x] Knowledge CRUD (5 endpoints) + validation + `GET /knowledge/search` (tested against a real local MongoDB)
- [x] Pages: Library, EntryForm, EntryDetail, Search (build passes; not click-tested in a browser)

### Owner: Vansh
- [x] `middleware/upload.js` filter + size limit, `fileParser.js`, `POST /knowledge/upload`, `POST /knowledge/quick`
- [x] `eventHandlers.js` for all 4 events (file + ActivityLog collection)
- [x] `GET /activity/log`, `GET /activity/summary`, `GET /system/info`
- [x] Reflections: 4 endpoints
- [ ] Pages: Upload, Activity, Journal

### Owner: Rajan
- [ ] `recallEngine.js` + 4 quiz endpoints (generate, submit, history, stats)
- [ ] `retrieveService.js` + `POST /knowledge/retrieve`
- [ ] Pages: Quiz, Stats, Help

### Shared / final
- [ ] Postman collection (`docs/RecallMind.postman_collection.json`)
- [ ] `docs/API.md`
- [ ] Integration pass (EntryDetail ↔ reflections, Help → Journal link, events from every feature)
- [ ] Demo rehearsal + viva prep

## Known gaps & open questions

- **No MongoDB tested.** `mongod` is not installed on Atul's machine. Use MongoDB Atlas (free tier) or install Community Server. Put the URI in `server/.env`. Until then `npm run seed` and `/api/health` `"db": "connected"` are unverified.
- **Frontend is not in the PRD** (it says backend-only). Confirm with the instructor; the backend stands alone via Postman if the UI is not allowed.
- Repo: github.com/mahakaal2005/RecallMind (private). Vansh and Rajan start from `docs/TEAMMATE-HANDOFF.md`; collaborators not added yet.
- `server/.env` was created from `.env.example` locally and is gitignored.
- Windows quirk: the shell tool mangles nested heredocs/apostrophes; write files with the Write tool.

## Next steps (start here)

1. Get MongoDB running, set `MONGODB_URI`, run `cd server && npm run seed && npm run dev`, confirm `GET /api/health` shows `connected` and Compass shows 5 entries.
2. `git init`, push to GitHub, share with Vansh and Rajan.
3. Each member picks up their section in `docs/TASKS.md` (Week 1 = backend endpoints).
4. If Claude continues the work: pick the next unchecked item above, implement it following the conventions in `CLAUDE.md`, then tick it here.
