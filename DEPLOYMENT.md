# Deployment

Handan Web is a single Next.js application: it serves the UI **and** the GraphQL
API (at `/api/graphql`) from one process. There is no separate backend service to
deploy.

- **Runtime:** Node 22.12+ (pinned in `.nvmrc`)
- **Database:** PostgreSQL 16
- **Package manager:** pnpm 10

---

## 1. Local development

```bash
nvm use                 # Node 22, per .nvmrc
pnpm install
cp .env.example .env    # then edit DATABASE_URL and JWT_SECRET
pnpm db:migrate         # create the schema
pnpm db:seed            # demo company + data
pnpm dev
```

Open http://localhost:3000 and sign in with `admin@handan.dev` / `password123`.

The interactive GraphQL explorer is at http://localhost:3000/api/graphql — useful
for trying queries without going through the UI.

Postgres, if you don't already have one:

```bash
brew install postgresql@16
brew services start postgresql@16
createdb handan
```

### Useful commands

| Command | What it does |
| --- | --- |
| `pnpm dev` | Dev server, UI + API, hot reload |
| `pnpm build` / `pnpm start` | Production build and serve |
| `pnpm smoke` | End-to-end API check against a seeded DB (47 assertions) |
| `pnpm check:queries` | Runs all 40 frontend queries against the API (read-only) |
| `pnpm db:migrate` | Create/apply a migration from schema changes |
| `pnpm db:deploy` | Apply existing migrations (production) |
| `pnpm db:studio` | Browse data in a GUI |
| `pnpm db:seed` | Reset to demo data |
| `pnpm codegen` | Regenerate typed hooks from `src/server/schema.graphql` |

---

## 2. VPS deployment (recommended)

### Specs

| Use | Specs | ~Cost/mo |
| --- | --- | --- |
| Demo / staging, image built in CI | 1–2 vCPU, 2 GB, 40 GB | $6–12 |
| **Small production, built on the box** | **2 vCPU, 4 GB, 80 GB** | **$12–24** |
| Heavier load, or Postgres split out | 4 vCPU, 8 GB, 160 GB | $24–48 |

**RAM is driven by the build, not by serving traffic.** `next build` typechecks and
bundles the whole app and can exceed 2 GB; the running server idles around
150–250 MB. If you build the image in CI and only pull it on the server, 2 GB is
comfortable.

### First-time setup

```bash
# On the server, as a non-root user with docker installed
git clone <your-repo> /srv/handan
cd /srv/handan

cp .env.example .env
# Edit .env and set at minimum:
#   JWT_SECRET      -> openssl rand -base64 48
#   POSTGRES_PASSWORD -> a real password
```

`docker-compose.yml` reads these from `.env`:

```
POSTGRES_USER=handan
POSTGRES_PASSWORD=<strong password>
POSTGRES_DB=handan
JWT_SECRET=<openssl rand -base64 48>
APP_PORT=3000
```

Then:

```bash
docker compose up -d --build
```

Compose runs a one-shot `migrate` service (`prisma migrate deploy`) and waits for
it to succeed before starting the app, so a deploy that changes the schema needs
no manual step. If a migration fails, the app is never started against a database
in the wrong shape.

Seed the first company (**once**, and never on a database with real data — the
seed wipes every table). The runtime image is deliberately lean and has no Prisma
CLI, so seeding runs from the migrator image:

```bash
docker compose run --rm migrate pnpm db:seed
```

### Updating

```bash
cd /srv/handan
git pull
docker compose up -d --build
```

### How the image is built

Three stages: `deps` installs packages, `build` runs `prisma generate` and
`next build`, and `runner` carries only Next's standalone output. A fourth stage,
`migrator`, keeps the full dependency tree so the Prisma CLI can run migrations —
the runtime image does not need it.

There is no native Prisma query engine in the runtime image: Prisma 7 reaches
Postgres through the `pg` driver adapter, which is plain JavaScript. That keeps
the image small and avoids the usual engine/platform mismatches.

### Put it behind TLS

Compose publishes the app on `127.0.0.1:3000` semantics via `APP_PORT`; terminate
TLS in front of it. With Caddy, the whole config is:

```
erp.example.com {
    reverse_proxy localhost:3000
}
```

Caddy obtains and renews the certificate automatically. nginx + certbot works
equally well if you prefer it.

### Backups — do not skip this

A single VPS has no redundancy, and ERP data is the kind you cannot recreate.

```bash
crontab -e
# 02:00 daily
0 2 * * * cd /srv/handan && ./scripts/backup-db.sh >> /var/log/handan-backup.log 2>&1
```

`scripts/backup-db.sh` writes a gzipped dump into `./backups` and prunes anything
older than 14 days. **Copy those off the machine** — a backup that lives only on
the disk it is protecting is not a backup. And restore one into a scratch database
at least once, so you know the procedure works before you need it.

---

## 3. Vercel

Works, with caveats:

- **Postgres lives elsewhere** (Neon, Supabase, Vercel Postgres) and you **must**
  use the provider's *pooled* connection string. Each serverless invocation opens
  its own connection; without a pooler this survives testing and falls over under
  load. Prisma also wants the direct URL for migrations — set both.
- **Function timeouts** make long jobs (year-end reports, bulk imports) unsuitable
  for a plain request. Chunk them or move them to a worker.
- **No background workers.** Scheduled work goes through Vercel Cron, which is a
  timed HTTP request, not a daemon.
- **No writable filesystem.** Uploaded documents and generated PDFs need S3/R2/Blob.
- **Hobby is non-commercial.** If you are running a business on this, that is the
  Pro plan ($20/mo), not a technical limit but a licensing one.

Environment variables to set: `DATABASE_URL`, `JWT_SECRET`. Leave
`NEXT_PUBLIC_HANDAN_API` unset so the frontend talks to its own `/api/graphql`.

Run `pnpm db:deploy` against the production database as part of your release.

---

## 4. Environment variables

| Name | Required | Notes |
| --- | --- | --- |
| `DATABASE_URL` | yes | Postgres connection string. Use a **pooled** URL on serverless. |
| `JWT_SECRET` | yes | Signs access tokens. Rotating it logs everyone out. |
| `NEXT_PUBLIC_HANDAN_API` | no | Leave empty. Only set it if the API is on another origin. Inlined into the client bundle at build time. |
| `APP_PORT` | no | Host port for docker compose (default 3000). |
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` | compose only | Credentials for the bundled Postgres. |

---

## 5. Verifying a deployment

```bash
SMOKE_ENDPOINT=https://erp.example.com/api/graphql pnpm smoke
```

This drives a full business cycle — order, delivery, stock movement, invoice,
payment allocation, purchase receipt, BOM expansion, job cards, material
consumption — and asserts the resulting numbers. **It writes data**, so run it
against staging or a freshly seeded database, never against live books.
