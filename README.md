# TS Fastify Boilerplate

A clean, well-structured TypeScript API boilerplate built on Fastify. This repository provides a minimal but production-ready layout with authentication, OAuth flows, TOTP 2FA, email sending, S3 integration, caching (NodeCache / Redis), and database handling via Drizzle ORM.

---

## Tech stack (what's being used and why)

- Node.js + TypeScript — typed language and modern JS runtime
- Fastify — fast, extensible HTTP framework
- fastify-type-provider-zod + zod — runtime and compile-time request/response validation
- tsyringe — dependency injection container for wiring services
- Drizzle ORM & drizzle-kit — database schema and migrations (Postgres)
- pg — PostgreSQL client
- fastify/swagger + @scalar/fastify-api-reference — API docs (OpenAPI/Swagger)
- jsonwebtoken — JWT auth
- nodemailer — email sending
- @aws-sdk/client-s3 — S3 uploads and presigned URLs
- redis / node-cache — caching options (Redis or in-memory)
- time2fa — TOTP for 2FA
- Vitest — unit testing
- Biome — formatting
- tsc + tsc-alias + copyfiles — build pipeline (produces `dist`)
- tsx — dev runner (hot reload)

---

## Quick start

1. Clone and install dependencies:

```bash
git clone https://github.com/cordeirogustavo/ts-fastify-boilerplate.git
cd ts-fastify-boilerplate
pnpm install
```

2. Copy and edit environment variables:

```bash
cp .env-example .env
# Edit .env values (DB, AWS, EMAIL, APP_SECRET, etc.)
```

3. Run in development mode (fast refresh):

```bash
pnpm dev
```

4. Build for production (newly added `build` script):

```bash
pnpm build
```

What the `build` script does:

- Removes old `dist`
- Runs `tsc` to compile TypeScript
- Runs `tsc-alias` to fix path aliases in compiled output
- Copies `package.json` into `dist`
- Installs production dependencies inside `dist`

5. Start the built app (production):

```bash
pnpm start
# or
node --env-file=.env dist/src/server.js
```

6. Tests & formatting:

```bash
pnpm test
pnpm run lint
```

---

## Project architecture & what each layer represents

High-level pattern: the project uses a modular, domain-driven arrangement where features live inside `domain/` and shared, cross-cutting concerns live inside `shared/`.

- `server.ts` — app bootstrap and registration of Fastify plugins (CORS, multipart, Swagger), global hooks and middlewares, and router registration.

- `config/` — produces an `AppConfig` object based on environment variables. This is where application-level configuration and secrets are centralized.

- `domain/` — business features separated by bounded context. Example: `domain/user/` contains the router, service, repository, schemas, DTOs and tests related to user flows (register, login, 2FA, password reset, social login). Each domain module typically contains:

  - router (HTTP endpoints)
  - service (business logic)
  - repository / mapper (DB interaction, in some places using Drizzle)
  - schemas / DTOs (Zod schemas and type definitions)

- `shared/` — reusable and cross-cutting code:

  - `app/` — app-level container and router wiring (registers domain routers)
  - `providers/` — provider implementations (database, cache, email, S3, token service, etc.)
  - `services/` — shared services (email service, token service, TOTP service)
  - `middlewares/` — global request middlewares (auth, language, recaptcha)
  - `schemas/` — common response/error schemas and reusable Zod schemas
  - `utils/` — helper utilities used across modules

- `database/` — Drizzle ORM schema and optionally migrations; SQL snapshots and journal live under `database/meta/`.

- `@types/` — TypeScript type augmentations (for Fastify custom decorators, etc.).

- `tests/` (co-located under each domain) — feature tests using Vitest.

This arrangement keeps business logic (domain) independent from infra and framework concerns (shared/providers), which makes it easier to test and evolve.

---

## Project tree

```
.                                   # repo root
├── package.json                     # npm scripts (build, dev, start, test, lint)
├── .env-example                     # example environment variables
├── drizzle.config.ts                # Drizzle config
├── src/
│   ├── server.ts                    # app bootstrap (Fastify config, plugins, docs)
│   ├── @types/                       # TypeScript augmentation files
│   │   └── fastify.d.ts
│   ├── config/                      # app configuration factory & container
│   │   ├── config.factory.ts
│   │   └── config.container.ts
│   ├── database/                    # Drizzle schema and migration metadata
│   │   ├── schema.ts
│   │   └── meta/
│   │       └── _journal.json
│   ├── domain/                      # features (each feature follows the same structure)
│   │   ├── user/
│   │   │   ├── user.router.ts       # HTTP routes
│   │   │   ├── user.service.ts      # business logic
│   │   │   ├── user.repository.ts   # DB interaction
│   │   │   ├── user.schema.ts       # Zod schemas / DTOs
│   │   │   └── tests/               # unit tests
│   │   └── user-login-attempts/
│   └── shared/                      # shared infra and helpers
│       ├── app/
│       │   ├── app.container.ts     # wires domain containers
│       │   └── app.router.ts        # registers routers into Fastify
│       ├── providers/               # DB, cache, email providers
│       ├── services/                # reusable services (email, token, TOTP)
│       ├── middlewares/             # auth, language, recaptcha
│       └── schemas/                 # common response / error schemas
└── vitest.config.mts                 # test runner config
```

---

## API docs

When the app runs (dev or prod), API docs are available at:

```
http://localhost:<APP_PORT>/docs
```

This includes route definitions and request/response schemas.

---

## Environment variables — quick reference

See `.env-example` for the complete list. Important ones:

- `APP_PORT`, `APP_NAME`, `APP_SECRET`
- `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_NAME`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`
- `EMAIL_*` (email provider settings)
- `AWS_*` (S3 credentials)
- `GOOGLE_RECAPTCHA_SECRET_KEY`
- `OTP_GLOBAL_ENABLED`, `OTP_TIMEOUT_IN_MINUTES`
- `CACHE_PROVIDER`, `REDIS_*`

---

## Useful commands

- Dev: `pnpm dev` (fast refresh via `tsx`)
- Build: `pnpm build` (compiles and prepares `dist`)
- Start (production from dist): `pnpm start` or `node --env-file=.env dist/src/server.js`
- Test: `pnpm test`
- Format: `pnpm run lint`

---

## Examples (quick)

Register a user (example endpoint) — adjust body to your schema:

```bash
curl -X POST "http://localhost:3000/user" \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","password":"secret"}'
```

---

## License

This project uses the ISC license.
