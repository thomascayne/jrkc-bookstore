#!/usr/bin/env sh

set -eu

backupDirectory=${JRKC_BACKUP_HOME:-"$HOME/jrkc-supabase-backups"}
backupPassphraseFile=${JRKC_BACKUP_PASSPHRASE_FILE:-"${JRKC_SUPABASE_HOME:-$HOME/jrkc-supabase}/.backup-passphrase"}
retentionDays=${JRKC_BACKUP_RETENTION_DAYS:-14}
timestamp=$(date -u '+%Y%m%dT%H%M%SZ')

if [ ! -f "$backupPassphraseFile" ]; then
  printf 'Backup passphrase file not found: %s\n' "$backupPassphraseFile" >&2
  exit 1
fi

umask 077
mkdir -p "$backupDirectory"
chmod 700 "$backupDirectory"

temporaryRolesPath=$(mktemp "$backupDirectory/.roles-XXXXXX.sql.gz")
temporaryDatabasePath=$(mktemp "$backupDirectory/.database-XXXXXX.sql.gz")
rolesBackupPath="$backupDirectory/${timestamp}-roles.sql.gz.enc"
databaseBackupPath="$backupDirectory/${timestamp}-database.sql.gz.enc"

cleanupTemporaryBackups() {
  rm -f "$temporaryRolesPath" "$temporaryDatabasePath"
}
trap cleanupTemporaryBackups EXIT HUP INT TERM

docker exec supabase-db pg_dumpall --username postgres --roles-only | gzip --best > "$temporaryRolesPath"
docker exec supabase-db pg_dump --username postgres --dbname postgres --format plain --no-owner --no-privileges | gzip --best > "$temporaryDatabasePath"

openssl enc -aes-256-cbc -pbkdf2 -iter 200000 -salt -pass "file:$backupPassphraseFile" -in "$temporaryRolesPath" -out "$rolesBackupPath"
openssl enc -aes-256-cbc -pbkdf2 -iter 200000 -salt -pass "file:$backupPassphraseFile" -in "$temporaryDatabasePath" -out "$databaseBackupPath"

openssl enc -decrypt -aes-256-cbc -pbkdf2 -iter 200000 -pass "file:$backupPassphraseFile" -in "$rolesBackupPath" | gzip --test
openssl enc -decrypt -aes-256-cbc -pbkdf2 -iter 200000 -pass "file:$backupPassphraseFile" -in "$databaseBackupPath" | gzip --test

cleanupTemporaryBackups
trap - EXIT HUP INT TERM
chmod 600 "$rolesBackupPath" "$databaseBackupPath"

find "$backupDirectory" -type f -name '*-roles.sql.gz.enc' -mtime "+$retentionDays" -delete
find "$backupDirectory" -type f -name '*-database.sql.gz.enc' -mtime "+$retentionDays" -delete

sha256sum "$rolesBackupPath" "$databaseBackupPath" > "$backupDirectory/${timestamp}.sha256"
chmod 600 "$backupDirectory/${timestamp}.sha256"

printf 'Created consistent PostgreSQL backups:\n%s\n%s\n' "$rolesBackupPath" "$databaseBackupPath"
