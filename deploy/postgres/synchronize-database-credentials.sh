#!/bin/sh

set -eu

if [ -z "${POSTGRES_APP_PASSWORD:-}" ]; then
  printf 'POSTGRES_APP_PASSWORD is required to synchronize jrkc_app.\n' >&2
  exit 1
fi

if [ -z "${POSTGRES_PASSWORD:-}" ]; then
  printf 'POSTGRES_PASSWORD is required to synchronize jrkc_owner.\n' >&2
  exit 1
fi

psql \
  --username "$POSTGRES_USER" \
  --dbname postgres \
  --set=ON_ERROR_STOP=1 \
  --set=app_password="$POSTGRES_APP_PASSWORD" \
  --set=owner_password="$POSTGRES_PASSWORD" <<'SQL'
ALTER ROLE jrkc_app WITH PASSWORD :'app_password';
ALTER ROLE jrkc_owner WITH PASSWORD :'owner_password';
SQL
