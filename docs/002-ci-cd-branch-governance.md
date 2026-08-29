# JRKC Bookstore CI/CD and Branch Governance

## Required promotion path

Every change must follow one direction:

```text
working branch -> pull request -> staging -> pull request -> main
```

- Working branches may target `staging`.
- `main` and `staging` may not target `staging`.
- Only `staging` may target `main`.
- A push event on `staging` or `main` is deployable only when GitHub associates the commit with a merged pull request that follows these rules.
- There is no manual deployment event that can bypass this promotion path.

## Local Git-hook enforcement

Enable the tracked hooks for each clone:

```bash
npm run hooks:install
git config --local --get core.hooksPath
```

The configured value must be `.githooks`. The `pre-push` hook rejects updates and deletions targeting `refs/heads/staging` or `refs/heads/main`. Push the working branch instead and create a pull request.

Git hooks are clone-local controls. They cannot stop a push made from a different clone, the GitHub UI, an administrator token, or an API client. The GitHub Actions authorization job is therefore an independent second control: an unauthorized protected-branch push fails policy validation and cannot run the deployment job. Without GitHub branch protection, the invalid Git ref would still exist and must be repaired manually; Actions cannot safely rewrite branch history.

## Continuous integration

`.github/workflows/ci.yml` runs for working-branch pushes and pull requests targeting `staging` or `main`. It performs:

1. Branch-direction policy tests.
2. Locked dependency installation with Node.js 24.
3. TypeScript validation.
4. ESLint validation with zero warnings.
5. A production Next.js build.
6. An npm vulnerability audit at moderate severity.
7. Dockerfile static validation.
8. Docker Compose configuration validation.

The workflow grants only read access to repository contents. Official GitHub actions are pinned to verified immutable release commits rather than floating major-version tags.

## Deployment authorization

`.github/workflows/deploy.yml` listens only for pushes to `staging` and `main`. Before opening an SSH connection it:

1. Calls GitHub's commit-associated pull-request API.
2. Verifies that a staging commit came from a merged working-branch pull request.
3. Verifies that a production commit came from a merged `staging -> main` pull request.
4. Re-runs the complete CI workflow against the exact release commit.
5. Selects the matching GitHub environment.

The deployment job then uses strict SSH host verification and sends `deploy/deploy-release.sh` to Oracle. The remote script refuses dirty checkouts, fetches only the target protected branch, verifies that the exact 40-character commit belongs to that remote branch, checks out the commit in detached mode, validates Compose, builds the commit-tagged image, starts the isolated Compose project, waits for container health, and verifies `/api/health` over Oracle loopback.

| Git branch | GitHub environment | Compose project | Oracle loopback port | Environment file |
| --- | --- | --- | --- | --- |
| `staging` | `staging` | `jrkc-bookstore-staging` | `3101` | `.env.staging` |
| `main` | `production` | `jrkc-bookstore-production` | `3100` | `.env.production` |

## GitHub environment configuration

Create GitHub environments named `staging` and `production`. Configure the following in each environment.

Environment variable:

- `ORACLE_DEPLOYMENT_PATH`: Absolute path to that environment's clean JRKC Git checkout on Oracle.

Environment secrets:

- `ORACLE_HOST`: Oracle hostname or IP address.
- `ORACLE_USER`: Restricted deployment account.
- `ORACLE_SSH_PRIVATE_KEY`: Private key for the restricted deployment account.
- `ORACLE_KNOWN_HOSTS`: Pre-verified OpenSSH host-key line for the Oracle host.

Do not obtain `ORACLE_KNOWN_HOSTS` blindly inside CI. Capture the host key during controlled setup and verify its fingerprint through a separate trusted channel before saving it as a GitHub secret.

The Oracle deployment account needs read access to its checkout and permission to run Docker Compose. Each deployment path must contain its ignored environment file before the first deployment. Production and staging must remain different checkouts, environment files, Compose projects, ports, credentials, and data services.

## Release sequence

For the current branch:

```bash
git push -u origin fix/next15-react-runtime
```

Then complete the release exclusively through GitHub:

1. Open `fix/next15-react-runtime -> staging`.
2. Wait for CI and review before merging.
3. Confirm the staging deployment and application health.
4. Open `staging -> main`.
5. Wait for CI and review before merging.
6. Confirm the production deployment and application health.

Never push local commits directly to either protected branch, and never deploy a working branch over staging or production.
