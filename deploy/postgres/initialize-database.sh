#!/bin/sh

set -eu

if [ -z "${POSTGRES_APP_PASSWORD:-}" ]; then
  printf 'POSTGRES_APP_PASSWORD is required to initialize the application role.\n' >&2
  exit 1
fi

psql \
  --set ON_ERROR_STOP=1 \
  --set app_password="$POSTGRES_APP_PASSWORD" \
  --set database_name="$POSTGRES_DB" \
  --username "$POSTGRES_USER" \
  --dbname "$POSTGRES_DB" <<'SQL'
CREATE ROLE jrkc_app
  LOGIN
  NOSUPERUSER
  NOCREATEDB
  NOCREATEROLE
  NOINHERIT
  NOREPLICATION
  PASSWORD :'app_password';

ALTER DATABASE :"database_name" OWNER TO jrkc_app;
ALTER SCHEMA public OWNER TO jrkc_app;
REVOKE ALL ON DATABASE :"database_name" FROM PUBLIC;
GRANT CONNECT ON DATABASE :"database_name" TO jrkc_app;
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
GRANT USAGE, CREATE ON SCHEMA public TO jrkc_app;
SQL
