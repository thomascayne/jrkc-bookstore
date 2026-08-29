# JRKC Bookstore Management System

JRKC Bookstore is a collaborative college project created by Joshua Castillo,
Ricky Holder, Javon Kelley, and Thomas Cayne as part of the Colorado Technical
University curriculum. It is preserved as an educational team project and
should not be represented as the individual professional work of any one
contributor.

The application combines a customer storefront with inventory, checkout,
point-of-sale, sales reporting, role-aware navigation, and Supabase-backed
identity and data access. Stripe integration is limited to test-payment
workflows.

- Deployment target: <https://bookstore.thomascayne.com>
- Source: <https://github.com/thomascayne/jrkc-bookstore>
- Production deployment guide: [docs/001-oracle-docker-deployment.md](docs/001-oracle-docker-deployment.md)
- CI/CD and branch policy: [docs/002-ci-cd-branch-governance.md](docs/002-ci-cd-branch-governance.md)

## Contributors and project context

The project was developed collaboratively by:

- Joshua Castillo
- Ricky Holder
- Javon Kelley
- Thomas Cayne

The repository is public so the implementation can be reviewed and deployed
for educational or portfolio demonstrations. Public visibility alone does not
replace a software license. Anyone redistributing or adapting the project must
follow the license and permissions published by the repository owners.

## Technology

- Next.js 16 and React 19
- TypeScript
- HeroUI and Tailwind CSS
- Supabase Auth and Postgres data APIs
- Stripe test payments
- Docker Compose and Caddy deployment on Oracle Cloud

## Local development

Requirements:

- Node.js 24
- npm 11 or newer
- A Supabase project or compatible self-hosted Supabase deployment

Clone and install the locked dependencies:

```bash
git clone https://github.com/thomascayne/jrkc-bookstore.git
cd jrkc-bookstore
npm ci
```

Create an ignored `.env.local` containing the two required variables:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-endpoint.example
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anonymous-key
```

Start development:

```bash
npm run dev
```

Next.js starts from its framework default port, `3000`. The zero-dependency
development launcher selects the next available port when `3000` is already in
use and prints the selected URL.

## Optional integrations

The core application requires only the Supabase URL and anonymous key. These
variables enable additional integrations:

| Variable | Purpose | Required |
| --- | --- | --- |
| `NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY` | Raises Google Books API quota for catalog enrichment | No |
| `NEXT_PUBLIC_GOOGLE_BOOKS_API_URL` | Overrides the default Google Books volumes endpoint | No |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Enables client-side Stripe test-payment elements | No |
| `STRIPE_SECRET_KEY` | Enables server-side Stripe test PaymentIntents | No |
| `SUPABASE_SERVICE_ROLE_KEY` | Enables trusted server-only Supabase operations | No for browsing and authentication |
| `CRON_SECRET` | Protects the optional keep-alive endpoint | No |
| `CRON_SCHEDULE` | Configures an external keep-alive schedule | No |

Never expose `STRIPE_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, database
passwords, JWT secrets, or private keys through a `NEXT_PUBLIC_` variable.

## Docker deployment

Create an ignored `.env.production` with the two required Supabase variables,
plus any optional integrations you intend to enable. Then run:

```bash
npm run docker:build
npm run docker:up
npm run docker:port
```

The production container listens on Oracle loopback port `3100` by default.
Set `BOOKSTORE_HOST_PORT=3101` for an isolated staging deployment. PostgreSQL
must remain private; Caddy or another TLS reverse proxy should be the only
public entry point.

## Validation

```bash
npm run test:branch-policy
npm run typecheck
npm run lint
npm run build
npm audit --audit-level=moderate
```

## Contribution workflow

Install the tracked Git hooks in every clone:

```bash
npm run hooks:install
```

Changes follow this promotion path:

```text
working branch -> pull request -> staging -> pull request -> main
```

Direct pushes to `staging` and `main` are blocked by the tracked pre-push hook.
