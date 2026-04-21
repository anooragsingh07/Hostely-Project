# Hostely

Production-grade campus marketplace platform for hostel residents.

## Architecture

Clean Architecture, enforced end-to-end:

```
HTTP  ->  Controller  ->  Service  ->  Repository  ->  Model (Mongoose)
```

- **Controller** — request/response only, zero business logic
- **Service** — business rules, transactions, orchestration
- **Repository** — persistence boundary, swappable data source
- **Model** — schema + domain constraints

## Stack

| Layer        | Choice                                 |
| ------------ | -------------------------------------- |
| Frontend     | Next.js (App Router) + TypeScript      |
| Styling      | Tailwind CSS + shadcn/ui (Cal.com look)|
| Backend      | Node.js + Express + TypeScript         |
| Database     | MongoDB via Mongoose                   |
| Auth         | JWT (access) + bcrypt                  |
| Realtime     | Socket.io                              |
| File Storage | Cloudinary                             |

## Workspace

```
Hostely/
├── client/   # Next.js app
└── server/   # Express API
```

## Local setup

```bash
# Backend
cd server
cp .env.example .env      # fill in values locally, never commit
npm install
npm run dev

# Frontend
cd ../client
cp .env.example .env.local
npm install
npm run dev
```

## Security

- `.env*` is gitignored. Only `.env.example` is tracked.
- Passwords hashed with bcrypt (cost 12).
- JWT secrets and DB URIs are **environment-only**.
