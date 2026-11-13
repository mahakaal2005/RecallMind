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

_To be added by Rajan._
