# RecallMind — Team Task Split

**Team:** Atul · Vansh · Rajan (3 members)
**Deadline:** Mid-Sem 2 (~3 weeks)
**Scope:** see [MVP.md](./MVP.md) · full spec: [RecallMind-PRD.md](./RecallMind-PRD.md) · current status: [PROGRESS.md](./PROGRESS.md)

---

## How the work is split

Each person owns **one feature area end to end**: the backend (routes → controller → service → Mongo) **and** the React pages for it. That way:

- the work is balanced (Atul 6 endpoints, Vansh 9 simpler ones, Rajan 5 aggregation-heavy ones),
- nobody waits on anybody else (the seed script gives everyone data from day 1),
- everyone touches Express + MongoDB, so everyone can answer viva questions,
- each person edits their own files, so there are few merge conflicts.

| | Atul | Vansh | Rajan |
|---|---|---|---|
| **Area** | Knowledge core + keyword search | Ingestion, Node core, reflections | Quiz, stats, "Help me with…" |
| **Endpoints** | 6 | 9 | 5 (hardest logic) |
| **Pages** | Library, EntryForm, EntryDetail, Search | Upload, Activity, Journal | Quiz, Stats, Help |
| **Units** | 2, 3, 4 | 1, 2, 3, 4 | 2, 4 |

### Already done (shared foundation)

You do **not** need to build these. Read them before you start.

| File | What it gives you |
|---|---|
| `server/server.js` | Express app, all routers mounted, 404 + error handler |
| `server/config/db.js` | Mongoose connection |
| `server/models/*.js` | All 4 models: `KnowledgeEntry`, `Quiz`, `Reflection`, `ActivityLog` |
| `server/middleware/` | `requestLogger`, `errorHandler`, `asyncHandler`, `upload` (multer), `validateInput` (starter) |
| `server/utils/apiResponse.js` | `sendSuccess(res, data, message, status, extra)` and `throw new ApiError(404, 'Not found')` |
| `server/utils/pagination.js` | `getPagination(req.query)` → `{ page, limit, skip }`, `paginationMeta(page, limit, total)` |
| `server/utils/constants.js` | Enums, pagination limits, recall score deltas, **event names** |
| `server/events/appEvents.js` | Shared EventEmitter instance |
| `server/scripts/seed.js` | `npm run seed` → 5 books, 15 lessons |
| `server/routes/*.js` | **All routes already defined.** You only fill in your controller functions. |
| `client/src/api/client.js` | `api.get/post/put/delete/upload` |
| `client/src/components/Layout.jsx` | Nav bar + API status dot |
| `client/src/pages/*.jsx` | One placeholder page per feature with your TODO list |
| `client/src/index.css` | Color/spacing variables (`var(--accent)` etc.), base form + button styles |

Every unfinished endpoint returns **501 "not implemented yet (owner: X)"**. Replace `notImplemented('X')` with your real function.

---

## Atul — Knowledge Core + Keyword Search

**Units:** 2 (CRUD, routing, validation middleware), 3 (document design), 4 (Mongoose CRUD, filter/sort/paginate, text index)

### Backend: `controllers/knowledgeController.js`, `middleware/validateInput.js`, `controllers/searchController.js`, `services/searchService.js`
- [x] `POST /api/knowledge`: create entry, emit `EVENTS.KNOWLEDGE_ADDED` with `{ id, title, source }`, return 201
- [x] `GET /api/knowledge`: pagination (`page`, `limit`), sorting (`sortBy`, `order`), filters (`category`, `source` partial match with regex, `tags` comma-separated → `$in`). Return `data` + `pagination` meta
- [x] `GET /api/knowledge/:id`: 404 via `ApiError` if not found
- [x] `PUT /api/knowledge/:id`: update with `{ new: true, runValidators: true }`
- [x] `DELETE /api/knowledge/:id`
- [x] Finish `validateKnowledgeEntry`: every lesson needs `lessonText`; `sourceType` must be in `SOURCE_TYPES`; `tags` must be an array
- [x] `GET /api/knowledge/search?q=`: `$text` search, sort by `{ score: { $meta: 'textScore' } }`, paginated. 400 if `q` missing

### Frontend: `Library.jsx`, `EntryForm.jsx`, `EntryDetail.jsx`, `Search.jsx`
- [x] Library: cards, category/source/tag filters, sort dropdown, pagination buttons
- [x] EntryForm: add + edit (same component; edit mode when URL has `:id`), add/remove lesson rows
- [x] EntryDetail: lessons with recall score, edit/delete buttons; reflections per lesson using Vansh's `GET /api/reflections/by-lesson/:lessonId`
- [x] Search: search box, ranked results, pagination

### Viva prep
Explain why lessons are **nested** in the entry (Unit 3: document model vs SQL tables), how `skip/limit` pagination works, and how a text index works.

---

## Vansh — Ingestion, Node.js Core & Reflection Journal

**Units:** 1 (fs, streams, buffers, events, OS module), 2 (multer middleware, CRUD), 3 (references vs embedding), 4 (references, populate, aggregation)

### Backend: `controllers/uploadController.js`, `services/fileParser.js`, `middleware/upload.js`, `events/eventHandlers.js`, `controllers/activityController.js`, `controllers/systemController.js` (`getSystemInfo` only), `controllers/reflectionController.js`
- [x] `middleware/upload.js`: allow only `.txt` / `.md`, 2 MB limit
- [x] `fileParser.js`: `fs.createReadStream` + `readline`. `# Heading` → title, `Source:` / `Category:` lines → fields, `- ` / `* ` lines → lessons. Test with `server/scripts/sample-notes.md`
- [x] `POST /api/knowledge/upload`: parse → create entry with `importedFromFile: true` → `fs.unlink` the temp file → emit `FILE_UPLOADED` + `KNOWLEDGE_ADDED`
- [x] `POST /api/knowledge/quick`: `{ lessonText, source, category? }` → entry with one lesson (category default `"uncategorized"`)
- [x] `eventHandlers.js`: handle **all 4 events**: `fs.appendFile` to `logs/activity.log` and save to the `ActivityLog` collection
- [x] `GET /api/activity/log?lines=50`: read file, return last N lines (handle "file doesn't exist yet")
- [x] `GET /api/activity/summary`: aggregation: count per `eventType`, count per day for the last 7 days
- [x] `GET /api/system/info`: OS module (PRD §8.4)
- [x] Show **Buffer** use somewhere you can explain, e.g. read the first bytes of the upload to reject binary files, or report `Buffer.byteLength` of the file
- [x] `POST /api/reflections`: validate `text`, `mood` in `MOODS`; `linkedLessons` must point at a real entry + lesson. Emit `REFLECTION_ADDED` `{ id, mood, linkedCount }`
- [x] `GET /api/reflections`: paginated, `order`, filter by `mood`; `populate('linkedLessons.knowledgeEntryId', 'title source')`
- [x] `GET /api/reflections/by-lesson/:lessonId`: query `{ 'linkedLessons.lessonId': lessonId }`
- [x] `DELETE /api/reflections/:id`

### Frontend: `Upload.jsx`, `Activity.jsx`, `Journal.jsx`
- [x] Upload: file picker + result (title, lessons parsed); quick capture form on the same page
- [x] Activity: recent log lines, summary counts, system info card
- [x] Journal: write form (text, mood, pick lessons), list with mood filter + pagination, delete

### Viva prep
Stream vs `readFile` (memory), what a Buffer is, how EventEmitter decouples logging from controllers, why reflections **reference** lessons instead of embedding them, what `populate` does.

---

## Rajan — Recall Engine (Quiz, Stats) + "Help Me With…"

**Units:** 2 (REST design), 4 (aggregation pipeline, nested array updates, `$text` + `$meta`, query operators)

### Backend: `services/recallEngine.js`, `controllers/quizController.js`, `controllers/retrieveController.js`, `services/retrieveService.js`
- [x] `selectLessonsForQuiz(count, category)`: aggregation `$match` → `$unwind: '$lessons'` → `$sort` by `lessons.recallScore` asc then `lessons.lastTestedAt` asc (never-tested first) → `$limit`. Add a little randomness so the same quiz doesn't repeat (e.g. take top `count*2`, shuffle, pick `count`)
- [x] `GET /api/quiz/generate?category=&count=5`: save a `Quiz` doc with questions (`entryRef`, `lessonId`, `prompt`, `hint`). Return questions **without** the answer text
- [x] `POST /api/quiz/:quizId/submit`: body `{ answers: [{ questionId, userAnswer, remembered }] }`. Update each lesson with positional update `KnowledgeEntry.updateOne({ _id, 'lessons._id': lessonId }, { $inc, $set })` using `RECALL` constants and clamping. Set quiz `score` + `completedAt`. Emit `QUIZ_COMPLETED` `{ quizId, score, total }`. Return the real lesson text for the reveal
- [x] Reject submitting the same quiz twice (400)
- [x] `GET /api/quiz/history`: completed quizzes, paginated, newest first
- [x] `GET /api/quiz/stats` (aggregation): total lessons, average recall, weakest 3 categories (`$group` by category, avg score), never-tested count (`lastTestedAt` missing), streak (consecutive days with a completed quiz, from `completedAt`)
- [x] `POST /api/knowledge/retrieve` body `{ problem, limit? }`: aggregation `$match $text` → `$addFields { score: { $meta: 'textScore' } }` → `$unwind lessons` → rank each lesson (count words of `problem` found in `lessonText` + `context`, combine with score) → top N lessons with `entryId`, `lessonId`, `source`, `title`. Return a friendly message when nothing matches

### Frontend: `Quiz.jsx`, `Stats.jsx`, `Help.jsx`
- [x] Quiz flow: setup (category, count) → one question at a time → type answer → **Reveal** shows real lesson → *Remembered* / *Forgot* → final score screen
- [x] Stats: stat tiles + weakest categories (simple CSS bars are fine)
- [x] Help: problem textarea → ranked lessons; "Write a reflection" button per lesson links to `/journal` (agree on the query-param format with Vansh)

### Viva prep
Walk through the aggregation pipelines stage by stage; explain the positional `$` operator for updating a nested lesson and how `$meta: "textScore"` ranks results.

---

## Shared tasks (everyone)

- [ ] Add your endpoints to the Postman collection `docs/RecallMind.postman_collection.json` (one folder per member, example body + saved example response)
- [ ] Write your section of `docs/API.md`: method, URL, query/body params, example response
- [ ] Test the **error cases** of your endpoints: bad id, missing field, empty DB
- [ ] Use `asyncHandler` + `sendSuccess` / `ApiError` everywhere so responses look the same
- [ ] Prepare 2 minutes of the demo for your feature
- [ ] Tick your boxes in this file and update [PROGRESS.md](./PROGRESS.md) when you merge

## Event contract

Emit from your controller with `appEvents.emit(EVENTS.X, payload)`. Vansh writes the listeners.

| Event | Emitted by | Payload |
|---|---|---|
| `knowledge:added` | Atul (create), Vansh (upload, quick) | `{ id, title, source }` |
| `file:uploaded` | Vansh | `{ fileName, size, lessonsParsed }` |
| `quiz:completed` | Rajan | `{ quizId, score, total }` |
| `reflection:added` | Vansh | `{ id, mood, linkedCount }` |

## Timeline

| Week | Goal | Check-in |
|---|---|---|
| **Week 1** | All your **backend** endpoints working in Postman against seeded data | End of week: each person demos their endpoints in Postman |
| **Week 2** | Your **React pages** working against the real API | End of week: full click-through of the app |
| **Week 3** | Integration (EntryDetail ↔ Reflections, Help → Journal, events firing from everywhere), Postman collection + API.md complete, bug fixing, **demo rehearsal + viva prep** | Two full rehearsals before Mid-Sem 2 |

## Git workflow

1. One repo on GitHub, `main` is always runnable.
2. Branch per feature: `atul/knowledge-crud`, `vansh/upload`, `rajan/quiz`.
3. Small commits, open a PR to `main`, one teammate looks at it before merging.
4. Pull `main` into your branch daily to catch conflicts early.
5. **Never commit `server/.env`.** Each person copies `.env.example` to `.env`.

## Definition of done (per task)

- [ ] Works in Postman, including at least one error case
- [ ] Returns the standard `{ success, message, data }` / `{ success, error }` shape
- [ ] UI page uses the real API and shows loading + error states
- [ ] No `console.log` debugging left behind
- [ ] Merged to `main` and the app still starts
