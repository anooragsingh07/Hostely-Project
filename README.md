# Hostely

Production-grade campus marketplace platform for hostel residents.

## Monorepo

```
Hostely/
├── client/   # Next.js (App Router) + TypeScript + Tailwind + shadcn/ui
├── server/   # Node.js + Express + Mongoose + Socket.io
└── shared/   # @hostely/shared — types + constants used by both apps
```

npm workspaces tie these together. `@hostely/shared` is consumed as a normal
package (`import { HTTP_STATUS, type PublicUser } from "@hostely/shared"`).

## Architecture

Clean Architecture, enforced end-to-end on the server:

```
HTTP  ->  Controller  ->  Service  ->  Repository  ->  Model (Mongoose)
```

- **Controller** — request/response only, zero business logic
- **Service** — business rules, transactions, orchestration
- **Repository** — persistence boundary, swappable data source
- **Model** — schema + domain constraints

## UI

Cal.com-inspired shell:

```
[ Sidebar ] | [ Topbar              ]
            | [ Content (per-route) ]
```

- Inter font, HSL CSS variables, light/dark via `next-themes`
- `rounded-xl`, `shadow-subtle`, 150–250ms transitions
- No unnecessary color — neutral palette first

## Tech stack

| Layer        | Choice                                 |
| ------------ | -------------------------------------- |
| Frontend     | Next.js (App Router) + TypeScript      |
| Styling      | Tailwind CSS + shadcn/ui               |
| Backend      | Node.js + Express + TypeScript         |
| Database     | MongoDB via Mongoose                   |
| Auth         | JWT (access) + bcrypt                  |
| Realtime     | Socket.io                              |
| File Storage | Cloudinary                             |

## Local setup

```bash
# From repo root
npm install          # installs all workspaces

# Server
cp server/.env.example server/.env    # fill values locally, never commit
npm run dev:server

# Client
cp client/.env.example client/.env.local
npm run dev:client
```

## Scripts (root)

| Script             | What it does                                      |
| ------------------ | ------------------------------------------------- |
| `npm run dev:client` | Start the Next.js dev server                    |
| `npm run dev:server` | Start the Express dev server (tsx watch)        |
| `npm run build`      | Build every workspace that defines a `build`    |
| `npm run typecheck`  | `tsc --noEmit` across all workspaces            |
| `npm run lint`       | ESLint across client, server, shared            |
| `npm run format`     | Prettier write across the repo                  |

## Tooling

- **ESLint** — root config with `@typescript-eslint`, extended by each workspace
- **Prettier** — single root config, Tailwind class sorting via plugin
- **Husky + lint-staged** — pre-commit hook runs ESLint + Prettier on staged files
- **EditorConfig** — consistent whitespace across editors

## Security

- `.env*` is gitignored. Only `.env.example` is tracked.
- Passwords hashed with bcrypt (cost 12).
- JWT secrets and DB URIs are **environment-only**.
