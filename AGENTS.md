# AGENTS.md — JRKC Bookstore Engineering Rules

## Project boundary

JRKC Bookstore is a Next.js application using React, TypeScript, Drizzle ORM, application-owned authentication, PostgreSQL, Stripe test-payment workflows, and role-specific inventory and sales interfaces.

## Review-first Git workflow

- Create feature/fix branches from `main` for all local development work.
- Modify `main` only through pull requests; never work directly on it.
- Do not commit, push, merge, reset, clean, or stash without explicit user approval for that exact operation.
- Preserve unrelated working-tree changes and stage files explicitly after review.
- Never commit environment files, keys, certificates, database dumps, or generated build output.
- Run `npm run hooks:install` in every clone. The tracked pre-push hook blocks direct pushes to `main`.
- Promotion is working branch -> pull request to `main`; deployments must originate from the corresponding merged pull request.

## Application rules

- Keep TypeScript strict and run `npm run typecheck`, `npm run lint`, and `npm run build` before release review.
- Use App Router server components by default and client components only when browser state or effects are required.
- Keep Drizzle and PostgreSQL access server-only. Browser code must use authenticated application API routes.
- Use versioned Drizzle migrations. Never use `drizzle-kit push` against production.
- Preserve role-based authorization, same-origin mutation checks, hashed HTTP-only sessions, and transactional inventory updates.
- Keep payment integrations in test mode unless the user explicitly authorizes a production payment change.

## Ports and deployment

- Next.js local development starts from its framework default port, `3000`.
- The custom local HTTPS server uses the zero-dependency port detector and may advance from `3000` when the port is occupied.
- Oracle production uses the fixed private upstream `127.0.0.1:3100`.
- PostgreSQL must remain on a private Docker network and must never expose port `5432` publicly.
- Caddy or another TLS reverse proxy is the only public entry point to the application.

## Dependency safety

- Prefer patch and minor updates. Treat framework majors as migrations requiring build and runtime validation.
- Do not use `npm audit fix --force` automatically.
- Keep the scoped `postcss` and `minimatch` overrides until upstream packages no longer resolve vulnerable versions.
