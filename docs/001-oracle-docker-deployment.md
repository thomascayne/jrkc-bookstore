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

## Required private configuration

The ignored `/home/ubuntu/jrkc-bookstore/.env.production` requires:

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
Environment files must remain mode `0600` and outside Git.

## Persistence

Compose stores the PostgreSQL data directory in
`jrkc-bookstore-postgres-data`. Rebuilding or replacing the Next.js and
migration images does not replace this volume. Docker Compose will reuse it on
subsequent deployments, so registered users and later writes persist.

Changing `BOOKSTORE_DATABASE_VOLUME` intentionally selects a different
database. Do not change it during an ordinary release.

## Deployment sequence

Only a pull request merged into `main` may deploy. GitHub Actions validates the
associated merged pull request, reruns CI, connects to Oracle by the configured
SSH identity, checks out the exact verified commit, validates Compose, builds
the images, applies migrations, and waits for the application health check.

The remote checkout must already contain its ignored `.env.production` file.
The workflow never transmits database or integration secrets from the public
repository.

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

- `https://bookstore.thomascayne.com/api/health` responds successfully;
- account creation survives an application container restart;
- sign-in issues a secure HTTP-only session cookie;
- catalog browsing and category filters return PostgreSQL records;
- inventory and sales APIs reject users without the required role;
- cart-to-order checkout decrements stock and clears the cart atomically;
- PostgreSQL has no public listener in Oracle or Cloudflare;
- the named volume remains attached to the production Compose project.
