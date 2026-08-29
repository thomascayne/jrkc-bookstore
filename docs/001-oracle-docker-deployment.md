# JRKC Bookstore Oracle Docker Deployment

## Production topology

Production traffic follows one controlled path:

```text
Cloudflare DNS and proxy
        |
        v
bookstore.thomascayne.com:443
        |
        v
Caddy on the Oracle host
        |
        v
127.0.0.1:3100
        |
        v
JRKC Next.js container:3100
        |
        v
Self-hosted Supabase API gateway on 127.0.0.1:8000
        |
        v
Persistent Supabase PostgreSQL 15 data directory
```

The application container is never published directly to the internet. Docker binds it only to the Oracle host's loopback interface. Caddy is the public TLS boundary, while Cloudflare remains the proxied DNS edge.

## Oracle prerequisites

- Oracle Linux or Ubuntu host with Docker Engine and the Docker Compose plugin
- The repository checked out on a feature-derived release revision
- A local `.env.production` file owned by the deployment user and excluded from Git
- Ports `80` and `443` open for Caddy
- Port `3100` closed publicly; it is loopback-only in `compose.yaml`

The production environment must define these browser-visible build values:

- `NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY`
- `NEXT_PUBLIC_GOOGLE_BOOKS_API_URL`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`

It must also define the server-only values already used by the application:

- `STRIPE_SECRET_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `CRON_SECRET`
- `CRON_SCHEDULE`

Never pass server-only secrets as Docker build arguments. They are injected only when the container starts.

## Build and start production

Run these commands from the repository root on Oracle:

```bash
docker compose --env-file .env.production config --quiet
docker compose --env-file .env.production build
docker compose --env-file .env.production up --detach
docker compose ps
curl --fail --show-error http://127.0.0.1:3100/api/health
```

The health endpoint returns HTTP `204`. The image is a multi-stage Next.js standalone build running as an unprivileged user with all Linux capabilities dropped, a read-only root filesystem, bounded local Docker logs, and writable temporary mounts only for Next.js cache data and `/tmp`.

## Caddy and Cloudflare

From the JRKC repository checkout on Oracle, install the bookstore site without overwriting other Caddy domains:

```bash
sudo sh deploy/configure-oracle-caddy.sh
```

The script installs `deploy/Caddyfile.bookstore` as `/etc/caddy/sites-enabled/jrkc-bookstore.caddy`, adds one top-level sites import when required, validates the complete active Caddy configuration, reloads Caddy, and restores the previous configuration if validation or reload fails.

Keep the existing Cloudflare `bookstore.thomascayne.com` proxied A record pointing at the Oracle host. Cloudflare SSL/TLS should use Full (strict) once Caddy has a valid origin certificate.

## Staging isolation

Staging must be a separate Compose project and bind to port `3101`. It must be deployed only from code that reached the `staging` branch through a pull request:

```bash
BOOKSTORE_HOST_PORT=3101 docker compose --project-name jrkc-bookstore-staging --env-file .env.staging up --detach --build
```

Production and staging must use different environment files, Supabase projects or schemas, Stripe keys, container project names, and Caddy hostnames. Never deploy a local working branch directly over either environment.

## Self-hosted Supabase and PostgreSQL

The current application does not speak directly to PostgreSQL. It depends on the Supabase Auth and PostgREST HTTP APIs through `@supabase/ssr` and `@supabase/supabase-js`. A plain PostgreSQL container is therefore not a drop-in replacement for the paused Supabase project.

The deployment uses the official Supabase self-hosted release `self-hosted/v0.8.0`, verified against commit `241bb11c0627f2981746d37033f57dbfa81d29b0`, with the PostgreSQL 15 compatibility override pinned to `supabase/postgres:15.8.1.085`. This matches the downloaded cluster dump's PostgreSQL 15.8 major/minor line.

The Supabase runtime lives outside the application checkout at `$HOME/jrkc-supabase` by default. Its PostgreSQL data persists under `$HOME/jrkc-supabase/volumes/db/data`. Rebuilding, replacing, or stopping the bookstore application container cannot delete this database. The application Compose project and Supabase Compose project are intentionally independent.

Run the initial Supabase installation on Oracle:

```bash
sh deploy/supabase/setup.sh
```

The setup process performs all of the following:

- Verifies the exact official Supabase release commit before copying its Docker configuration.
- Generates unique database, JWT, anonymous, service-role, dashboard, and encryption secrets.
- Enables email auto-confirmation so portfolio visitors can complete signup without a paid SMTP provider; replace this with verified SMTP before treating email ownership as trusted.
- Pins PostgreSQL 15 instead of silently initializing an incompatible PostgreSQL 17 data directory.
- Binds the API gateway, session pooler, and transaction pooler to Oracle loopback only.
- Pulls images serially with bounded retries to survive transient registry TLS failures.
- Synchronizes the generated Supabase URL and API keys into the ignored `.env.production` file when that file exists.
- Starts the stack and waits for all required services to become healthy.

### Restore the downloaded cluster

The downloaded database archive is a gzip-compressed PostgreSQL cluster SQL dump containing the Supabase roles, schemas, policies, functions, triggers, Auth identities, and bookstore records required for recovery. Keep the archive outside Git and pass its private Oracle filesystem path to the restore command.

Do not feed the raw cluster SQL directly into the production database. It contains managed Supabase roles and internal schemas that conflict with an already initialized self-hosted stack. The restore script first loads the cluster into a disposable official Supabase PostgreSQL 15 recovery container, uses Supabase CLI filtering to create portable role/schema/data dumps, and then imports those dumps into production in a single transaction with triggers disabled for the data phase.

Run the one-time restore:

```bash
sh deploy/supabase/restore.sh /secure/path/to/jrkc-backup.gz
```

The restore calculates the source backup's SHA-256 digest locally, records the completed digest in the private Supabase runtime directory, and refuses to import over a production database that already contains profiles. Re-running it with the same completed backup performs verification rather than duplicating rows. Expected and restored table counts are calculated during recovery and are never stored in the repository.

After the restore, existing users retain their email/password identities because `auth.users.encrypted_password` is present. Existing hosted Supabase access and refresh tokens are not reusable because the self-hosted deployment generates a new JWT secret; users must sign in again. New signups are handled by the self-hosted Auth service and inserted into `auth.users`. An idempotent post-restore database patch adds insert-time triggers for auto-confirmed accounts so corresponding `public.profiles` and `public.user_roles` rows are created immediately. All three records are retained in the persistent PostgreSQL data directory across container restarts and application deployments.

Verify the restored stack at any time:

```bash
sh deploy/supabase/verify.sh
```

### Durable backups

Create an on-demand roles dump and transactionally consistent database snapshot:

```bash
sh deploy/supabase/backup.sh
```

Backups are compressed and encrypted with AES-256-CBC plus PBKDF2 using a generated passphrase stored at `$HOME/jrkc-supabase/.backup-passphrase`. Encrypted files are written with mode `0600` under `$HOME/jrkc-supabase-backups`, verified by decrypting and testing the gzip stream, accompanied by SHA-256 checksums, and retained for 14 days by default. Store the passphrase separately from copied backups; losing it makes every encrypted backup unrecoverable. Install the script as an Oracle cron job only after verifying the destination has adequate disk space. Copy backups to a second machine or encrypted object store because a backup stored only on the same Oracle boot disk does not protect against host loss.

To eliminate the hosted Supabase subscription without rewriting authentication and every data call, the safe boundary is:

- Keep PostgreSQL on a private Docker network with no host port for `5432`.
- Expose only Supabase API paths through Caddy on `bookstore.thomascayne.com`; the gateway itself binds to `127.0.0.1:8000`.
- Point `NEXT_PUBLIC_SUPABASE_URL` at `https://bookstore.thomascayne.com`.
- Generate fresh JWT, anonymous, service-role, database, dashboard, and encryption secrets on Oracle.
- Restore a verified dump from the hosted JRKC project before switching application traffic.
- Verify Row Level Security policies, users, storage objects, authentication redirects, and record counts before cutover.
- Schedule encrypted `pg_dump` backups outside the database container and test restoration regularly.

Do not place a database service in the application Compose file. Keeping the data plane separate prevents an application rebuild or `docker compose down` operation from affecting the database.

The Caddy configuration routes `/auth/v1/*`, `/rest/v1/*`, `/storage/v1/*`, `/realtime/v1/*`, `/functions/v1/*`, and `/graphql/v1*` to the Supabase gateway. Every other request goes to the Next.js application on `127.0.0.1:3100`. Studio and PostgreSQL are not publicly routed.

## Release verification

Before a production PR is approved:

```bash
npm ci
npm run typecheck
npm run lint
npm run build
npm audit --audit-level=moderate
docker compose --env-file .env.production config --quiet
```

After deployment, verify the health endpoint, sign-in, role-based navigation, inventory queries, checkout with Stripe test mode, image loading, and Supabase callback URLs for `https://bookstore.thomascayne.com`.
