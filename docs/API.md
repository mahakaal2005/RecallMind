# RecallMind API

Base URL `http://localhost:5000/api`. Success: `{ success: true, message, data, pagination? }`. Error: `{ success: false, error }`.
Paginated lists accept `?page=` (default 1) and `?limit=` (default 10, max 50) and add `pagination: { page, limit, total, totalPages }`.

Each member adds their own section below.

## Knowledge (Atul)

| Method | URL | Notes |
|---|---|---|
| POST | `/knowledge` | Body: `title`, `source`, `category` (required); `sourceType` (`book\|article\|podcast\|video\|personal\|other`), `tags` (string[]), `lessons` (`[{ lessonText, context?, pageNumber? }]`). Category and tags are lowercased. Recall stats cannot be set by the client. → 201 |
| GET | `/knowledge` | Query: `page`, `limit`, `sortBy` (`createdAt\|updatedAt\|title\|source\|category`, default `createdAt`), `order` (`asc\|desc`, default `desc`), `category` (exact), `source` (partial, case-insensitive), `tags` (comma-separated, matches any) |
| GET | `/knowledge/search?q=` | Ranked `$text` search over title, source, lesson text and context. Each result has `score`. 400 if `q` is missing. Paginated. |
| GET | `/knowledge/:id` | 404 if not found, 400 if the id is malformed |
| PUT | `/knowledge/:id` | Partial update. If `lessons` is sent it replaces the list: a lesson with its `_id` keeps its recall stats, one without is added, any left out is removed. |
| DELETE | `/knowledge/:id` | 404 if not found |

Validation errors return 400 with a message, e.g. `Every lesson needs a non-empty lessonText`.

`POST /knowledge` emits `knowledge:added` with `{ id, title, source }`.

Example:

```
POST /api/knowledge
{ "title": "Atomic Habits", "source": "James Clear", "category": "Habits", "tags": ["Focus"],
  "lessons": [{ "lessonText": "Make it obvious, easy, attractive, satisfying", "pageNumber": 14 }] }
→ 201 { "success": true, "message": "Entry created", "data": { "_id": "…", "category": "habits", "tags": ["focus"], "lessons": [{ "_id": "…", "recallScore": 0, … }], … } }
```

## Ingestion, activity, system, reflections (Vansh)

### Upload & Quick Capture

| Method | URL | Notes |
|---|---|---|
| POST | `/knowledge/upload` | `multipart/form-data`, field name `file`. Only `.txt` / `.md`, max 2 MB. Parses `# Heading` → title, `Source:` / `Category:` lines → fields, `- ` / `* ` lines → lessons. Fallbacks: title = filename, source = title, category = `uncategorized`. Binary/UTF-16 files rejected. Temp file always deleted. `importedFromFile: true`, `sourceType: "other"`. Emits `file:uploaded` then `knowledge:added`. → 201 |
| POST | `/knowledge/quick` | Body: `lessonText` (required, ≤1000 chars), `source` (required), `category` (optional, default `"uncategorized"`), `sourceType` (optional, must be valid, default `"other"`). Title = first 60 chars of lessonText. One lesson. Emits `knowledge:added`. → 201 |

Error cases: missing file → 400; bad extension → 400 `Only .txt and .md files are allowed`; >2 MB → 400 `File too large (max 2 MB)`; binary file → 400; no bullets → 400; missing `lessonText`/`source` → 400; invalid `sourceType` → 400.

Example:

```
POST /api/knowledge/quick
{ "lessonText": "Active recall beats re-reading", "source": "Huberman Lab", "category": "learning" }
→ 201 { "success": true, "message": "Quick capture created", "data": { "_id": "…", "title": "Active recall beats re-reading", "sourceType": "other", "lessons": [{ "_id": "…", "lessonText": "…", "recallScore": 0, … }], … } }
```

### Activity & System

| Method | URL | Notes |
|---|---|---|
| GET | `/activity/log` | Query: `lines` (1–500, default 50). Returns `{ lines: [...] }` newest first. Empty/missing file → `{ lines: [] }`. |
| GET | `/activity/summary` | Aggregation (`$facet`): `byType` (event counts), `byDay` (last 7 calendar days, zero-filled, `Asia/Kolkata`), `totalEvents`. Empty DB → zeros. |
| GET | `/system/info` | Node.js `os` module: `platform`, `architecture`, `release`, `totalMemory`, `freeMemory`, `usedMemoryPercent`, `uptime`, `cpus`, `cpuModel`, `hostname`, `nodeVersion`. |

Example:

```
GET /api/activity/summary
→ 200 { "success": true, "data": { "totalEvents": 12, "byType": [{ "eventType": "knowledge:added", "count": 8 }, …], "byDay": [{ "date": "2026-11-07", "count": 0 }, …, { "date": "2026-11-13", "count": 12 }] } }
```

### Reflections

| Method | URL | Notes |
|---|---|---|
| POST | `/reflections` | Body: `text` (required, ≤2000 chars), `mood` (optional; `inspired\|neutral\|struggling\|proud`, default `neutral`), `linkedLessons` (optional array of `{ knowledgeEntryId, lessonId }`, max 10, 24-hex IDs, deduped, each must exist). Emits `reflection:added`. → 201 |
| GET | `/reflections` | Query: `page`, `limit`, `mood` (filter), `order` (`asc\|desc`, default `desc`). Populates linked lesson text. Each item: `{ _id, text, mood, createdAt, linked: [{ entryId, title, source, lessonId, lessonText } \| { lessonId, deleted: true }] }`. Paginated. |
| GET | `/reflections/by-lesson/:lessonId` | Returns plain array `[{ _id, mood, text }]`. 400 if `lessonId` is invalid. Empty → `[]` with 200. |
| DELETE | `/reflections/:id` | 404 if not found, 400 if id is malformed. |

Error cases: missing `text` → 400; invalid `mood` → 400; invalid ID format → 400; linked lesson not found → 400 naming the bad link.

Example:

```
POST /api/reflections
{ "text": "Applied the 2-minute rule today", "mood": "proud", "linkedLessons": [{ "knowledgeEntryId": "…", "lessonId": "…" }] }
→ 201 { "success": true, "message": "Reflection saved", "data": { "_id": "…", "text": "…", "mood": "proud", "linkedLessons": […], … } }
```

## Quiz, stats, retrieve (Rajan)

### Quiz & Spaced Repetition

| Method | URL | Notes |
|---|---|---|
| GET | `/quiz/generate` | Query: `category` (optional, filter by category), `count` (optional, default 5, min 1, max 20). Selects weakest and least recently tested lessons, shuffles top pool, creates a `Quiz` document. Returns questions **without** the answers (prompt and hint only). → 201 |
| POST | `/quiz/:quizId/submit` | Body: `{ answers: [{ questionId, userAnswer, remembered }] }`. Calculates quiz score percentage, sets `completedAt`, uses positional update `KnowledgeEntry.updateOne` to update `recallScore` (+20 if remembered, -15 if forgot, clamped 0–100), `lastTestedAt`, and increments `timesRecalled` or `timesForgotten`. Returns full questions with real `lessonText` revealed. Emits `quiz:completed`. Rejects resubmission of already submitted quiz (400). → 200 |
| GET | `/quiz/history` | Query: `page`, `limit`. Returns list of past completed quizzes sorted newest first (`completedAt` desc) with populated entry titles and sources. Paginated. → 200 |
| GET | `/quiz/stats` | Aggregation pipeline: total lessons stored, average recall score across all lessons, never-tested lessons count, weakest 3 categories by average recall, and daily quiz streak. → 200 |

### Situational Retrieval ("Help Me With...")

| Method | URL | Notes |
|---|---|---|
| POST | `/knowledge/retrieve` | Body: `{ problem: "string", limit?: number }`. Performs MongoDB `$text` search with `$meta: "textScore"`, word-frequency matching across `lessonText` and `context`, and ranks lessons by composite relevance. Returns top matching lessons with `entryId`, `lessonId`, `title`, `source`, `category`, `lessonText`, `context`, and `relevanceScore`. Returns friendly 200 response if no matches. 400 if problem is missing. → 200 |

Example Generate Quiz:
```
GET /api/quiz/generate?category=habits&count=3
→ 201 {
  "success": true,
  "message": "Quiz generated successfully",
  "data": {
    "quizId": "654e12...",
    "category": "habits",
    "questions": [
      {
        "questionId": "654e12...",
        "entryRef": "654e11...",
        "lessonId": "654e10...",
        "prompt": "From \"Atomic Habits\" (James Clear), recall this lesson:",
        "hint": "Context: Habit stacking"
      }
    ]
  }
}
```

Example Submit Quiz:
```
POST /api/quiz/654e12.../submit
{
  "answers": [
    { "questionId": "654e12...", "userAnswer": "Make it obvious", "remembered": true }
  ]
}
→ 200 {
  "success": true,
  "message": "Quiz submitted successfully",
  "data": {
    "quizId": "654e12...",
    "score": 100,
    "total": 1,
    "rememberedCount": 1,
    "completedAt": "2026-11-13T16:30:00.000Z",
    "questions": [
      {
        "questionId": "654e12...",
        "prompt": "...",
        "userAnswer": "Make it obvious",
        "remembered": true,
        "lessonText": "Make it obvious, easy, attractive, satisfying",
        "newRecallScore": 20
      }
    ]
  }
}
```

Example Stats:
```
GET /api/quiz/stats
→ 200 {
  "success": true,
  "message": "Quiz stats retrieved",
  "data": {
    "totalLessons": 15,
    "averageRecall": 42,
    "neverTestedCount": 6,
    "weakestCategories": [
      { "category": "habits", "avgRecall": 20, "lessonCount": 4 }
    ],
    "streak": 3,
    "totalQuizzesCompleted": 5
  }
}
```

Example Situational Retrieval:
```
POST /api/knowledge/retrieve
{ "problem": "I keep procrastinating on my project", "limit": 3 }
→ 200 {
  "success": true,
  "message": "Found 3 relevant lesson(s) to help with your situation",
  "data": [
    {
      "entryId": "...",
      "lessonId": "...",
      "title": "Atomic Habits",
      "source": "James Clear",
      "category": "habits",
      "lessonText": "The 2-minute rule helps overcome friction to get started",
      "context": "Starting is often harder than continuing",
      "relevanceScore": 12.5
    }
  ]
}
```
