# RecallMind — MVP Scope

> What we must have working and demo-able at **Mid-Sem 2**. Full spec lives in [RecallMind-PRD.md](./RecallMind-PRD.md).

## The demo story (what the examiner will see)

1. **Add knowledge**: type in a book's lessons, upload a `.md` notes file, or quick-capture one lesson.
2. **Browse**: Library page with filter by category/source/tags, sorting and pagination.
3. **Quiz yourself**: RecallMind picks your weakest / never-tested lessons, you try to recall each one, then mark *Remembered* or *Forgot*. Scores update.
4. **See progress**: Stats dashboard (average recall, weakest categories, never-tested lessons, streak).
5. **Get help with a real problem**: type *"I keep procrastinating"* and get your most relevant stored lessons.
6. **Reflect**: write a journal entry about applying a lesson, linked to that lesson.
7. **Under the hood**: activity log file written by EventEmitter + fs, system info from the OS module, request log from middleware, Postman collection hitting every endpoint.

## In scope

| Area | Endpoints (all from PRD §5.1) | UI page |
|---|---|---|
| Knowledge CRUD | `POST/GET /api/knowledge`, `GET/PUT/DELETE /api/knowledge/:id` | Library, Add/Edit, Entry detail |
| Ingestion | `POST /api/knowledge/upload`, `POST /api/knowledge/quick` | Upload |
| Search | `GET /api/knowledge/search`, `POST /api/knowledge/retrieve` | Search, Help Me |
| Quiz | `GET /api/quiz/generate`, `POST /api/quiz/:quizId/submit`, `GET /api/quiz/history`, `GET /api/quiz/stats` | Quiz, Stats |
| Reflections | `POST/GET /api/reflections`, `GET /api/reflections/by-lesson/:lessonId`, `DELETE /api/reflections/:id` | Journal |
| Activity & system | `GET /api/activity/log`, `GET /api/activity/summary`, `GET /api/health`, `GET /api/system/info` | Activity |

## Decisions we made (differences from the PRD)

| Decision | Why |
|---|---|
| **Quiz grading is self-assessed.** Question shows source + context as a hint; user types what they remember, the real lesson is revealed, user clicks *Remembered* or *Forgot*. | Automatic text matching is unreliable without AI. Self-grading is how Anki works and keeps the logic simple. |
| **Score update**: Remembered → `recallScore + 20`, Forgot → `recallScore − 15`, clamped 0–100. Also bump `timesRecalled` / `timesForgotten`, set `lastTestedAt`. | Simple spaced-repetition rule. Values live in `server/utils/constants.js` (`RECALL`). |
| **Lessons are referenced by their sub-document `_id`** (`lessonId`), not by array index. | Index breaks when a lesson is deleted or reordered. Mongoose gives each nested lesson its own `_id` for free. |
| `timesForotten` typo fixed to `timesForgotten`. | Typo in PRD. |
| `createdAt`/`updatedAt` via Mongoose `{ timestamps: true }`. | `updatedAt` updates automatically on save. |
| Request log goes to `logs/requests.log`; app events go to `logs/activity.log`. | Keeps the activity log readable for `GET /api/activity/log`. |
| **Simple React UI added** (`client/`). | Makes the demo far clearer than Postman alone. Backend remains the graded focus. |

## Out of scope

Authentication / users (Unit 5), AI / LLM, deployment, websockets, rate limiting. Single-user app.

## Done means

- Every endpoint above works and is in the Postman collection with an example request.
- Every UI page works against the real API (no hard-coded data).
- `npm run seed` gives a fresh database the whole team can demo from.
- Each member can explain their code **and** which syllabus unit it covers.
