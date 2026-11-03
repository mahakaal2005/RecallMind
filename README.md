# RecallMind

> Read it once, actually remember it.

An active-recall learning companion: store lessons from books and notes, get quizzed on the ones you are forgetting, and pull up relevant lessons when you face a real problem.

**Stack:** Node.js · Express · MongoDB (Mongoose) · React (Vite)

## Docs

- [Product Requirements (PRD)](docs/RecallMind-PRD.md)
- [MVP scope](docs/MVP.md)
- [Team task split](docs/TASKS.md)
- [Progress and next steps](docs/PROGRESS.md)

## Project structure

```
RecallMind/
├── server/          Express REST API (CommonJS)
│   ├── config/      DB connection
│   ├── models/      Mongoose schemas
│   ├── routes/      Express routers
│   ├── controllers/ Request handlers
│   ├── services/    Business logic (file parsing, recall engine, search)
│   ├── middleware/  Logging, validation, errors, uploads
│   ├── events/      EventEmitter + listeners
│   ├── utils/       Response helpers, pagination, constants
│   ├── scripts/     Seed data
│   └── logs/        requests.log, activity.log (generated)
├── client/          React UI (Vite), proxies /api to the server
└── docs/
```

## Getting started

**Prerequisites:** Node.js 20+, and MongoDB, either local ([Community Server](https://www.mongodb.com/try/download/community)) or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster.

### 1. Server

```bash
cd server
npm install
cp .env.example .env      # then set MONGODB_URI if you use Atlas
npm run seed              # loads sample books and lessons (wipes the DB)
npm run dev               # http://localhost:5000
```

Check it: open http://localhost:5000/api/health and you should see `"db": "connected"`.

### 2. Client

In a second terminal:

```bash
cd client
npm install
npm run dev               # http://localhost:5173
```

The nav bar shows a green **API online** dot when the server and database are reachable.

## API

All endpoints are under `/api`. See PRD §5.1 for the full list. Responses always look like:

```json
{ "success": true, "message": "OK", "data": { } }
{ "success": false, "error": "What went wrong" }
```
