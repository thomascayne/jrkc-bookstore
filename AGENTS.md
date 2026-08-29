# AGENTS.md — JRKC Bookstore Engineering Rules

## Project boundary

JRKC Bookstore is a Next.js application using React, TypeScript, Supabase Auth and data APIs, Stripe test-payment workflows, and role-specific inventory and sales interfaces.

## Review-first Git workflow

- Create feature/fix branches from `main` for all local development work.
- Modify `staging` and `main` only through pull requests; never work directly on either branch.
- Do not commit, push, merge, reset, clean, or stash without explicit user approval for that exact operation.
- Preserve unrelated working-tree changes and stage files explicitly after review.
- Never commit environment files, keys, certificates, database dumps, or generated build output.
- Run `npm run hooks:install` in every clone. The tracked pre-push hook blocks direct pushes to `staging` and `main`.
- Promotion is working branch -> pull request to `staging` -> pull request from `staging` to `main`; deployments must originate from the corresponding merged pull request.

## Application rules

- Keep TypeScript strict and run `npm run typecheck`, `npm run lint`, and `npm run build` before release review.
- Use App Router server components by default and client components only when browser state or effects are required.
- Use `@supabase/ssr` for browser and server clients; do not reintroduce the deprecated Supabase auth-helper packages.
- Keep Supabase URLs and keys in environment configuration. Never embed credentials in source code.
- Preserve role-based access, Row Level Security assumptions, and authentication callback behavior when changing data access.
- Keep payment integrations in test mode unless the user explicitly authorizes a production payment change.

## Ports and deployment

- Next.js local development starts from its framework default port, `3000`.
- The custom local HTTPS server uses the zero-dependency port detector and may advance from `3000` when the port is occupied.
- Oracle production uses the fixed private upstream `127.0.0.1:3100`.
- Oracle staging uses the fixed private upstream `127.0.0.1:3101`.
- PostgreSQL must remain on a private Docker network and must never expose port `5432` publicly.
- Caddy or another TLS reverse proxy is the only public entry point to the application.

## Dependency safety

- Prefer patch and minor updates. Treat framework majors as migrations requiring build and runtime validation.
- Do not use `npm audit fix --force` automatically.
- Keep the scoped `postcss` and `minimatch` overrides until upstream packages no longer resolve vulnerable versions.
