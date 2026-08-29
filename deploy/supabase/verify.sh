#!/usr/bin/env sh

set -eu

runtimeDirectory=${JRKC_SUPABASE_HOME:-"$HOME/jrkc-supabase"}

docker exec supabase-db psql \
  --username postgres \
  --dbname postgres \
  --set ON_ERROR_STOP=1 \
  --no-align \
  --tuples-only \
  --command "
    select 'auth.users=' || count(*) from auth.users;
    select 'public.profiles=' || count(*) from public.profiles;
    select 'public.inventory=' || count(*) from public.inventory;
    select 'rls.policies=' || count(*) from pg_policies;
    select 'rls.enabled_tables=' || count(*) from pg_class where relrowsecurity;
  "

(
  cd "$runtimeDirectory"
  docker compose ps
)

printf 'Auth health HTTP status: '
curl --silent --show-error --output /dev/null --write-out '%{http_code}\n' http://127.0.0.1:8000/auth/v1/health
