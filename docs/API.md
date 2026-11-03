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

_To be added by Vansh._

## Quiz, stats, retrieve (Rajan)

_To be added by Rajan._
