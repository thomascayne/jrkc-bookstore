# CI/CD and branch governance

## Promotion path

The repository uses one protected release branch:

```text
working branch -> pull request -> main -> production
```

Development must start from `main` on a `feat/`, `fix/`, `ci/`, `docs/`, or
other clearly named working branch. `main` is changed only by a reviewed pull
request. A merged pull request is also the only authorized production
deployment source.

## Local protection

Run `npm run hooks:install` in every clone. This configures
`core.hooksPath=.githooks`. The tracked `pre-push` hook rejects any direct push
or deletion targeting `refs/heads/main`. It does not prevent pushing a working
branch for review.

Local hooks are a guardrail, not a substitute for review. Do not bypass the
hook with `--no-verify`.

## Continuous integration

`.github/workflows/ci.yml` runs on working-branch pushes, pull requests into
`main`, and reusable workflow calls. It:

1. tests the branch policy;
2. installs the lockfile with development dependencies;
3. type-checks strict TypeScript;
4. runs ESLint with zero warnings;
5. builds the production Next.js application;
6. audits dependencies at moderate severity;
7. validates the Dockerfile and Compose configuration.

CI uses placeholder PostgreSQL passwords only to render Compose configuration.
It does not connect to production, create a database, or receive Oracle secrets.

## Deployment authorization

`.github/workflows/deploy.yml` listens only for a push to `main`. GitHub
normally emits that event after a pull request is merged. Before SSH access, the
workflow queries GitHub for pull requests associated with the exact commit and
requires a merged working-branch pull request whose base is `main`.

The workflow then reuses CI, enters the `production` GitHub environment, checks
out the exact commit on Oracle, validates the clean checkout and ignored
`.env.production`, builds Compose images, applies Drizzle migrations, starts the
application, and force-recreates the application service from the exact
commit-tagged image. Deployment succeeds only after the running image tag and
health response identify that commit, PostgreSQL answers through the
application connection pool, and the category and book APIs return nonempty
catalog results.

The workflow uploads the release script to a unique temporary path on Oracle
before executing it and removes that file afterward. It never streams the
script into the standard input of the remote shell. This ensures the complete
script exists on Oracle before execution and prevents the SSH input transport
or a child process from ending the release after image creation but before
container replacement.

Required production environment configuration:

| Kind | Name | Purpose |
| --- | --- | --- |
| Variable | `ORACLE_DEPLOYMENT_PATH` | Absolute production checkout path |
| Secret | `ORACLE_HOST` | Oracle SSH host |
| Secret | `ORACLE_KNOWN_HOSTS` | Pinned SSH known-host record |
| Secret | `ORACLE_SSH_PRIVATE_KEY` | Deployment SSH private key |
| Secret | `ORACLE_USER` | Oracle SSH account |

Application and database credentials stay in the ignored Oracle
`.env.production`; they do not belong in repository variables, workflow logs,
or public source.

## Review sequence

1. Create or update a working branch from `main`.
2. Run the full validation suite locally.
3. Push only the working branch.
4. Open a pull request from the working branch into `main`.
5. Review the changed files and green CI results.
6. Merge the pull request.
7. Confirm the production deployment and application health.

Never deploy a working branch directly over production and never push local
commits directly to `main`.
