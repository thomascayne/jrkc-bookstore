#!/usr/bin/env sh

set -eu

scriptDirectory=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
runtimeDirectory=${JRKC_SUPABASE_HOME:-"$HOME/jrkc-supabase"}
postgresImageVersion=15.8.1.085
supabaseCliSha256=5b3031cb297d51b25be4c284e4c852254460ec722ec221d3b81b07d55acfd158
supabaseCliVersion=2.116.0
supabaseCliPath="$runtimeDirectory/tools/supabase"
restoreMarkerPath="$runtimeDirectory/.jrkc-restore.sha256"
recoveryProjectId=jrkc-bookstore-recovery
recoveryProjectDirectory=''

if [ "$#" -ne 1 ]; then
  printf 'Usage: sh deploy/supabase/restore.sh /secure/path/to/backup.gz\n' >&2
  exit 1
fi

backupPath=$1

cleanupRecovery() {
  if [ -n "$recoveryProjectDirectory" ] && [ -d "$recoveryProjectDirectory" ]; then
    "$supabaseCliPath" --workdir "$recoveryProjectDirectory" stop --no-backup >/dev/null 2>&1 || true
    rm -rf "$recoveryProjectDirectory"
  fi
}

if [ ! -f "$backupPath" ]; then
  printf 'Backup not found: %s\n' "$backupPath" >&2
  exit 1
fi

if [ ! -f "$runtimeDirectory/docker-compose.yml" ] || [ ! -f "$runtimeDirectory/.env" ]; then
  printf 'Run %s/setup.sh before restoring the database.\n' "$scriptDirectory" >&2
  exit 1
fi

gzip --test "$backupPath"
backupSha256=$(sha256sum "$backupPath" | cut -d ' ' -f 1)

if [ -f "$restoreMarkerPath" ] && [ "$(cat "$restoreMarkerPath")" = "$backupSha256" ]; then
  printf 'This exact backup is already restored. Running verification only.\n'
  "$scriptDirectory/verify.sh"
  exit 0
fi

mkdir -p "$runtimeDirectory/tools"
if [ ! -x "$supabaseCliPath" ]; then
  cliArchivePath="$runtimeDirectory/tools/supabase_${supabaseCliVersion}_linux_amd64.tar.gz"
  curl --fail --location --silent --show-error \
    --output "$cliArchivePath" \
    "https://github.com/supabase/cli/releases/download/v${supabaseCliVersion}/supabase_${supabaseCliVersion}_linux_amd64.tar.gz"
  printf '%s  %s\n' "$supabaseCliSha256" "$cliArchivePath" | sha256sum --check
  tar --extract --gzip --file "$cliArchivePath" --directory "$runtimeDirectory/tools" supabase
  rm -f "$cliArchivePath"
fi

recoveryProjectDirectory=$(mktemp -d)
trap cleanupRecovery EXIT HUP INT TERM

"$supabaseCliPath" --workdir "$recoveryProjectDirectory" init
sed -i "s/^project_id = .*/project_id = \"${recoveryProjectId}\"/" "$recoveryProjectDirectory/supabase/config.toml"
mkdir -p "$recoveryProjectDirectory/supabase/.temp" "$recoveryProjectDirectory/portable"
printf '%s\n' "$postgresImageVersion" > "$recoveryProjectDirectory/supabase/.temp/postgres-version"
gzip --decompress --stdout "$backupPath" > "$recoveryProjectDirectory/cluster.backup"

"$supabaseCliPath" --workdir "$recoveryProjectDirectory" db start --from-backup "$recoveryProjectDirectory/cluster.backup"
"$supabaseCliPath" --workdir "$recoveryProjectDirectory" db dump --local --file "$recoveryProjectDirectory/portable/roles.sql" --role-only
"$supabaseCliPath" --workdir "$recoveryProjectDirectory" db dump --local --file "$recoveryProjectDirectory/portable/schema.sql"
"$supabaseCliPath" --workdir "$recoveryProjectDirectory" db dump --local --file "$recoveryProjectDirectory/portable/data.sql" --use-copy --data-only

recoveryContainer="supabase_db_${recoveryProjectId}"
expectedUsers=$(docker exec "$recoveryContainer" psql --username postgres --dbname postgres --tuples-only --no-align --command 'select count(*) from auth.users;')
expectedProfiles=$(docker exec "$recoveryContainer" psql --username postgres --dbname postgres --tuples-only --no-align --command 'select count(*) from public.profiles;')
expectedInventory=$(docker exec "$recoveryContainer" psql --username postgres --dbname postgres --tuples-only --no-align --command 'select count(*) from public.inventory;')

existingProfiles=$(
  docker exec supabase-db psql --username postgres --dbname postgres --tuples-only --no-align \
    --command 'select count(*) from public.profiles;' 2>/dev/null || printf '0\n'
)

if [ "$existingProfiles" -ne 0 ]; then
  printf 'Production already contains %s profiles; refusing a non-idempotent restore.\n' "$existingProfiles" >&2
  exit 1
fi

combinedRestorePath="$recoveryProjectDirectory/portable/restore.sql"
cat "$recoveryProjectDirectory/portable/roles.sql" "$recoveryProjectDirectory/portable/schema.sql" > "$combinedRestorePath"
printf '\nSET session_replication_role = replica;\n' >> "$combinedRestorePath"
cat "$recoveryProjectDirectory/portable/data.sql" >> "$combinedRestorePath"

docker cp "$combinedRestorePath" supabase-db:/tmp/jrkc-restore.sql
docker exec supabase-db psql \
  --username postgres \
  --dbname postgres \
  --single-transaction \
  --variable ON_ERROR_STOP=1 \
  --file /tmp/jrkc-restore.sql
docker exec supabase-db rm -f /tmp/jrkc-restore.sql

docker cp "$scriptDirectory/post-restore.sql" supabase-db:/tmp/jrkc-post-restore.sql
docker exec supabase-db psql \
  --username postgres \
  --dbname postgres \
  --single-transaction \
  --variable ON_ERROR_STOP=1 \
  --file /tmp/jrkc-post-restore.sql
docker exec supabase-db rm -f /tmp/jrkc-post-restore.sql

(
  cd "$runtimeDirectory"
  docker compose restart auth rest storage
  docker compose up --detach --wait
)

actualUsers=$(docker exec supabase-db psql --username postgres --dbname postgres --tuples-only --no-align --command 'select count(*) from auth.users;')
actualProfiles=$(docker exec supabase-db psql --username postgres --dbname postgres --tuples-only --no-align --command 'select count(*) from public.profiles;')
actualInventory=$(docker exec supabase-db psql --username postgres --dbname postgres --tuples-only --no-align --command 'select count(*) from public.inventory;')

if [ "$actualUsers" -ne "$expectedUsers" ] || [ "$actualProfiles" -ne "$expectedProfiles" ] || [ "$actualInventory" -ne "$expectedInventory" ]; then
  printf 'Restore verification failed: users %s/%s, profiles %s/%s, inventory %s/%s.\n' \
    "$actualUsers" "$expectedUsers" "$actualProfiles" "$expectedProfiles" "$actualInventory" "$expectedInventory" >&2
  exit 1
fi

printf '%s\n' "$backupSha256" > "$restoreMarkerPath"
chmod 600 "$restoreMarkerPath"
printf 'Restore verified: users=%s profiles=%s inventory=%s.\n' "$actualUsers" "$actualProfiles" "$actualInventory"
