# JRKC Bookstore Management System

JRKC Bookstore is a collaborative college project created by Joshua Castillo,
Ricky Holder, Javon Kelley, and Thomas Cayne for the Colorado Technical
University curriculum. It is an educational team project, not the individual
professional work of any one contributor.

The public repository supports educational review and self-hosted portfolio
demonstrations. Public visibility does not grant rights beyond the license and
permissions published by the repository owners.

- Live application: <https://bookstore.thomascayne.com>
- Source: <https://github.com/thomascayne/jrkc-bookstore>
- Deployment guide: [docs/001-oracle-docker-deployment.md](docs/001-oracle-docker-deployment.md)
- CI and branch policy: [docs/002-ci-cd-branch-governance.md](docs/002-ci-cd-branch-governance.md)

## Technology

- Next.js 16, React 19, and strict TypeScript
- Drizzle ORM with PostgreSQL 18
- Application-owned password authentication and HTTP-only database sessions
- HeroUI and Tailwind CSS
- Stripe test-payment workflows
- Docker Compose and Caddy on Oracle Cloud

Drizzle and PostgreSQL are server-only. Browser code calls authenticated Next.js
API routes; it never receives database credentials or unrestricted query access.

The public catalog does not require seeded database records. When managed
inventory is empty or PostgreSQL is temporarily unavailable, `/api/books`
serves Google Books results and `/api/categories` serves the bundled category
list. A Google API key is optional. PostgreSQL remains required for accounts,
managed inventory, authenticated carts, orders, and sales reporting.
Google volumes without sale pricing receive a clearly labeled demonstration
price; this is portfolio data, not a live retail offer.

## Quick start with Docker

The local workflow requires only Docker with Compose:

```bash
npm ci
npm run docker:build
npm run docker:up
```

`docker:build` does not require runtime credentials. On the first `docker:up`,
the zero-dependency launcher generates strong, distinct database passwords in
the ignored `.env.docker.local` file. It reuses that file so PostgreSQL remains
accessible after rebuilds and restarts. Before migrations run, the launcher
safely synchronizes the existing local database roles with that file, allowing
credential recovery without deleting the persistent volume. Generated values
are never printed. The launcher also selects the first available loopback port
from `3100` and saves that choice in the same ignored file, preventing local
port collisions while Oracle can continue setting `BOOKSTORE_HOST_PORT=3100`
explicitly.

For Oracle or another production host, create an ignored `.env.production`
with explicit production credentials:

```dotenv
POSTGRES_OWNER_PASSWORD=replace-with-a-long-random-owner-password
POSTGRES_PASSWORD=replace-with-a-different-long-random-application-password
```

The application is published only on `127.0.0.1:3100`. PostgreSQL has no host
port and is reachable only through the private Compose network. New accounts,
profiles, carts, inventory changes, and orders persist in the named Docker
volume `jrkc-bookstore-postgres-data` across application rebuilds and restarts.
Production uses the Compose project `jrkc-bookstore-production`, including
project-specific application and migration image names and Compose-scoped
container and network names. Before changing anything, deployment verifies
that port `3100` and the persistent database volume are either unused or owned
by the expected bookstore service. It refuses to reuse another application's
Docker resources. The application health endpoint also executes a PostgreSQL
query, so a release cannot report success while only Next.js is running.

## Optional variables

| Variable | Purpose |
| --- | --- |
| `POSTGRES_DB` | Overrides the default `jrkc_bookstore` database name |
| `BOOKSTORE_DATABASE_VOLUME` | Uses a different persistent Docker volume name |
| `BOOKSTORE_HOST_PORT` | Overrides the loopback application port, default `3100` |
| `BOOKSTORE_IMAGE_REPOSITORY` | Prefixes application and migration images for an isolated deployment |
| `NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY` | Raises Google Books catalog-enrichment quota |
| `NEXT_PUBLIC_GOOGLE_BOOKS_API_URL` | Overrides the Google Books volumes endpoint |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Enables client-side Stripe test elements |
| `STRIPE_SECRET_KEY` | Enables server-side Stripe test PaymentIntents |

Never put database passwords, Stripe secret keys, SSH keys, or other private
credentials in a `NEXT_PUBLIC_` variable or commit an environment file.

## Local Node.js development

Node.js 24 and npm 11 or newer are required. Point the local Next.js process at
an independently reachable PostgreSQL database with `DATABASE_URL` or the
`POSTGRES_*` connection variables. The production Compose database is
intentionally not published to the host; use the full Docker workflow when you
want the bundled private database.

```bash
npm ci
npm run db:generate
npm run dev
```

`npm run db:generate` creates versioned SQL; it does not change a database.
Apply committed migrations with `npm run db:migrate`. Production deployments
run the migration container before starting the application.

Next.js begins with its framework default port `3000`. The zero-dependency
launcher automatically selects and prints the next available port if needed.

## Validation

```bash
npm run test:branch-policy
npm run typecheck
npm run lint
npm run build
npm audit --audit-level=moderate
```

## Contribution workflow

Install the tracked hook in every clone:

```bash
npm run hooks:install
```

Changes follow `working branch -> pull request -> main`. Direct pushes to
`main` are blocked locally, and deployment accepts only a commit associated
with a merged pull request into `main`.
