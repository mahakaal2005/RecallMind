# RecallMind: Start Here (Vansh & Rajan)

Atul's part (knowledge CRUD, search, and the four knowledge pages) is done. This is what you need to do yours.

Repo: https://github.com/mahakaal2005/RecallMind (private; accept the collaborator invite first)

## 1. Get running (15 min)

```bash
git clone https://github.com/mahakaal2005/RecallMind.git
cd RecallMind
git checkout vansh/upload        # Vansh
git checkout rajan/quiz          # Rajan

cd server && npm install && cp .env.example .env
cd ../client && npm install
```

You need MongoDB. Easiest: a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster. Put its connection string in `server/.env` as `MONGODB_URI`. Or install MongoDB Community Server and keep the default `mongodb://127.0.0.1:27017/recallmind`.

```bash
cd server && npm run seed     # 5 books, 15 lessons (WIPES the database you point at)
npm run dev                   # API on :5000, check http://localhost:5000/api/health says "connected"
cd ../client && npm run dev   # UI on :5173
```

Never commit `server/.env`. Never point `seed` at a database you care about.

## 2. Read these first

1. `CLAUDE.md`: project conventions (CommonJS server, `asyncHandler`, `sendSuccess`, `ApiError`, events).
2. `docs/TASKS.md`: your section is your task list, with the viva prep notes at the end of it.
3. `docs/MVP.md`: what's in and out of scope.
4. `docs/API.md`: Atul's endpoints are documented; add yours under your heading.

Every unbuilt endpoint returns 501 `not implemented yet (owner: X)`. Replace `notImplemented('X')` in your controller with a real function. Routes are already wired, so you shouldn't need to touch `routes/`.

## 3. What Atul's work gives you

- `GET /api/knowledge`, `GET /api/knowledge/:id` and the other knowledge CRUD endpoints work. See `docs/API.md`.
- Create emits `knowledge:added` with `{ id, title, source }`. Vansh's handler already receives it.
- `EntryDetail.jsx` already calls your `GET /api/reflections/by-lesson/:lessonId` and expects `data` to be an array of `{ _id, mood, text }`. Until you build it, it shows nothing.
- `Library.jsx` and `Search.jsx` use `components/EntryCard.jsx` and `components/Pager.jsx`; reuse `Pager` for your paginated lists.
- Search is `$text`-based and Rajan's retrieve builds on the same text index on `KnowledgeEntry`. Don't change that index without telling the team.

## 4. Vansh's checklist

Everything is in `docs/TASKS.md` under "Vansh". In order:

1. `middleware/upload.js`: `.txt`/`.md` only, 2 MB limit, one file. Reject anything else with a 400.
2. `services/fileParser.js`: stream + `readline`, test on `server/scripts/sample-notes.md`.
3. `POST /knowledge/upload`: parse, create the entry, **delete the temp file in a `finally` block** (also when parsing fails), emit `file:uploaded` + `knowledge:added`.
4. `POST /knowledge/quick`.
5. `events/eventHandlers.js` for all four events, then `/activity/log`, `/activity/summary`, `/system/info`.
6. Reflections (4 endpoints), then pages Upload, Activity, Journal.

Security notes from review: the upload limit and file filter are not optional, and temp files must never pile up in `server/uploads/`.

## 5. Rajan's checklist

Everything is in `docs/TASKS.md` under "Rajan". In order:

1. `selectLessonsForQuiz` aggregation, then `GET /quiz/generate` (never return the answer text in the questions).
2. `POST /quiz/:quizId/submit`: positional `$` update on the nested lesson, reject a second submit, emit `quiz:completed`.
3. `GET /quiz/history`, `GET /quiz/stats`.
4. `POST /knowledge/retrieve` (`retrieveService.js`).
5. Pages Quiz, Stats, Help. Agree the Help → Journal link format (query params) with Vansh.

## 6. Rules of the road

- Work only on your own branch and in your own files (each file has an `// OWNER:` comment). Ask before editing someone else's file.
- Small commits. Pull `main` into your branch daily: `git pull origin main`.
- Open a pull request into `main` when a slice works; one teammate reviews before merge.
- Keep to Units 1–4: no auth, no AI/LLM, no extra frameworks.
- Use `asyncHandler` + `sendSuccess` / `ApiError` everywhere so responses look the same.
- When you finish something, tick it in `docs/TASKS.md` and `docs/PROGRESS.md` and add your endpoints to `docs/API.md` and the Postman collection.

## 7. Timeline

| Week | Goal |
|---|---|
| 1 | Your backend endpoints working in Postman against seeded data |
| 2 | Your React pages working against the real API |
| 3 | Integration, Postman + API.md complete, demo rehearsal, viva prep |

## 8. Gotchas

- `client/node_modules` installed on Windows won't work on Linux/macOS (and vice versa). Run `npm install` on your own machine.
- Specific routes (`/search`, `/upload`, …) stay above `/:id` in router files.
- Lessons are nested sub-documents with their own `_id`. Always address them by `lessonId`, never by array index.
- If something in this doc is wrong or missing, tell Atul.
