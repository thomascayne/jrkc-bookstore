# Oracle Docker deployment

## Runtime boundary

The production deployment contains three services:

1. `database` runs the pinned PostgreSQL 18.6 official image.
2. `migrate` applies committed Drizzle migrations and exits successfully.
3. `bookstore` starts only after PostgreSQL is healthy and migrations complete.

The application binds to `127.0.0.1:3100`. Caddy terminates public TLS for
`bookstore.thomascayne.com` and forwards requests to that loopback address.
PostgreSQL is attached only to an internal Docker network and publishes no host
port.

Production always runs under the Compose project
`jrkc-bookstore-production`. Compose therefore scopes container and network
names to the bookstore, while release images use the same project prefix.
Before a release builds or starts containers, an isolation preflight verifies
that port `3100` is either free or owned by the production `bookstore` service.
It also verifies that `jrkc-bookstore-postgres-data` is owned by the production
project and attached only to its `database` service. A foreign Compose project,
an unmanaged container, or a non-Docker listener stops the release before any
runtime resource is changed.

## Private configuration

Production stores its private configuration in the ignored
`/home/ubuntu/jrkc-bookstore/.env.production` file. The deployment creates this
file when it does not exist and generates each missing PostgreSQL password
with 256 bits of randomness. Existing nonempty values are preserved, and the
file is always restricted to mode `0600`.

The resulting private file contains:

```dotenv
POSTGRES_OWNER_PASSWORD=a-long-random-bootstrap-password
POSTGRES_PASSWORD=a-different-long-random-application-password
```

`jrkc_owner` initializes PostgreSQL. The initialization script creates the
non-superuser `jrkc_app` login, transfers ownership of the application database
and public schema, revokes public database/schema creation rights, and grants
only the access needed by the bookstore. The Next.js and migration containers
connect as `jrkc_app`, never as the bootstrap superuser.

Optional catalog and Stripe variables are documented in the repository README.
The release starts PostgreSQL by itself before migrations, synchronizes the
passwords of the existing `jrkc_owner` and `jrkc_app` roles with the private
file, and then starts the migration and application services. This makes the
bootstrap safe for both a new database and an existing persistent volume.

Environment files remain mode `0600` and outside Git. Database credentials do
not need to be added to GitHub Actions secrets.

## Persistence

Compose stores the PostgreSQL data directory in
`jrkc-bookstore-postgres-data`. Rebuilding or replacing the Next.js and
migration images does not replace this volume. Docker Compose will reuse it on
subsequent deployments, so registered users and later writes persist.

Changing `BOOKSTORE_DATABASE_VOLUME` intentionally selects a different
database. Do not change it during an ordinary release.

The preflight never deletes, renames, recreates, or copies this volume. That
preserves existing accounts and inventory while preventing another Oracle
workload from silently sharing the same PostgreSQL data directory.

## Deployment sequence

Only a pull request merged into `main` may deploy. GitHub Actions validates the
associated merged pull request, reruns CI, connects to Oracle by the configured
SSH identity, checks out the exact verified commit, validates Compose, builds
the isolated images, applies migrations, and force-recreates the `bookstore`
service from the image tagged with the exact Git commit. Runtime verification
then confirms the container image tag and calls the health endpoint with the
expected release identifier. That endpoint runs `select 1` through the same
`jrkc_app` connection pool used by authenticated APIs. The deployment also
requires nonempty responses from `/api/categories` and `/api/books`, preventing
a stale or incomplete Next.js image from producing a false green deployment.
GitHub reports a failed deployment if the release identity, PostgreSQL
connection, category route, or public catalog is unavailable.

The workflow never transmits database credentials from GitHub or the public
repository. Optional integration values can be added directly to the ignored
Oracle environment file and are preserved by future deployments.

## Backups

The named volume protects data from container replacement, but it is not a
backup against disk or host loss. Run a scheduled `pg_dump` on Oracle and copy
the resulting encrypted or access-controlled backup to a second system. A
backup is usable only after a test restore into a separate Compose project and
verification of user, book, cart, and order counts.

Recommended minimum policy:

- daily compressed custom-format database dump;
- mode `0600` on backup files;
- 14 daily restore points;
- a second encrypted storage location;
- monthly restore testing;
- backup before every migration that removes or rewrites data.

Never commit a dump. The repository ignores `*.backup`, `*.backup.gz`,
`*.dump`, and `*.sql.gz`.

## Caddy

Run `sudo sh deploy/configure-oracle-caddy.sh` on Oracle from a checked-out
release. The script validates the complete Caddy configuration, creates a
rollback copy, installs only the bookstore site, reloads Caddy, and restores the
previous configuration if validation or reload fails.

## Release verification

After deployment verify:

- `https://bookstore.thomascayne.com/api/health` reports `status: ok`,
  `database: available`, and the deployed release commit;
- category and book endpoints return nonempty catalog results;
- account creation survives an application container restart;
- sign-in issues a secure HTTP-only session cookie;
- catalog browsing and category filters return PostgreSQL records;
- inventory and sales APIs reject users without the required role;
- cart-to-order checkout decrements stock and clears the cart atomically;
- PostgreSQL has no public listener in Oracle or Cloudflare;
- the named volume remains attached to the production Compose project.
