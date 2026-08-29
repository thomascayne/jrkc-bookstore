#!/usr/bin/env sh

set -eu

scriptDirectory=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
repositoryDirectory=$(CDPATH= cd -- "$scriptDirectory/../.." && pwd)
runtimeDirectory=${JRKC_SUPABASE_HOME:-"$HOME/jrkc-supabase"}
officialReleaseCommit=241bb11c0627f2981746d37033f57dbfa81d29b0
officialReleaseRef=self-hosted/v0.8.0
publicUrl=${JRKC_PUBLIC_URL:-https://bookstore.thomascayne.com}

cleanupTemporarySource() {
  if [ -n "${temporarySourceDirectory:-}" ] && [ -d "$temporarySourceDirectory" ]; then
    rm -rf "$temporarySourceDirectory"
  fi
}

replaceEnvironmentValue() {
  environmentFile=$1
  environmentName=$2
  environmentValue=$3

  if grep -q "^${environmentName}=" "$environmentFile"; then
    sed -i "s|^${environmentName}=.*|${environmentName}=${environmentValue}|" "$environmentFile"
  else
    printf '%s=%s\n' "$environmentName" "$environmentValue" >> "$environmentFile"
  fi
}

pullImageWithRetries() {
  imageReference=$1
  pullAttempt=1
  maximumAttempts=5

  while ! docker pull "$imageReference"; do
    if [ "$pullAttempt" -ge "$maximumAttempts" ]; then
      printf 'Failed to pull %s after %s attempts.\n' "$imageReference" "$maximumAttempts" >&2
      return 1
    fi

    pullAttempt=$((pullAttempt + 1))
    retryDelaySeconds=$((pullAttempt * 5))
    printf 'Retrying %s (%s/%s) in %s seconds.\n' "$imageReference" "$pullAttempt" "$maximumAttempts" "$retryDelaySeconds" >&2
    sleep "$retryDelaySeconds"
  done
}

if [ ! -f "$runtimeDirectory/docker-compose.yml" ]; then
  temporarySourceDirectory=$(mktemp -d)
  trap cleanupTemporarySource EXIT HUP INT TERM

  git clone --filter=blob:none --no-checkout --depth 1 --branch "$officialReleaseRef" \
    https://github.com/supabase/supabase "$temporarySourceDirectory/source"
  git -C "$temporarySourceDirectory/source" sparse-checkout init --cone
  git -C "$temporarySourceDirectory/source" sparse-checkout set docker
  git -C "$temporarySourceDirectory/source" checkout "$officialReleaseRef"
  resolvedReleaseCommit=$(git -C "$temporarySourceDirectory/source" rev-parse HEAD)

  if [ "$resolvedReleaseCommit" != "$officialReleaseCommit" ]; then
    printf 'Supabase release verification failed. Expected %s but received %s.\n' "$officialReleaseCommit" "$resolvedReleaseCommit" >&2
    exit 1
  fi

  mkdir -p "$runtimeDirectory"
  cp -a "$temporarySourceDirectory/source/docker/." "$runtimeDirectory/"
  cp "$runtimeDirectory/.env.example" "$runtimeDirectory/.env"
  printf 'ref=%s\n' "$officialReleaseRef" > "$runtimeDirectory/.supabase-version"

  (
    cd "$runtimeDirectory"
    sh utils/generate-keys.sh
    sh utils/add-new-auth-keys.sh
  )

  replaceEnvironmentValue "$runtimeDirectory/.env" COMPOSE_FILE 'docker-compose.yml:docker-compose.pg15.yml:docker-compose.bookstore.yml'
  replaceEnvironmentValue "$runtimeDirectory/.env" SUPABASE_PUBLIC_URL "$publicUrl"
  replaceEnvironmentValue "$runtimeDirectory/.env" API_EXTERNAL_URL "$publicUrl/auth/v1"
  replaceEnvironmentValue "$runtimeDirectory/.env" SITE_URL "$publicUrl"
  replaceEnvironmentValue "$runtimeDirectory/.env" ADDITIONAL_REDIRECT_URLS "$publicUrl/**"
  replaceEnvironmentValue "$runtimeDirectory/.env" ENABLE_EMAIL_AUTOCONFIRM true

  cleanupTemporarySource
  trap - EXIT HUP INT TERM
fi

cp "$scriptDirectory/docker-compose.bookstore.yml" "$runtimeDirectory/docker-compose.bookstore.yml"

if [ ! -f "$runtimeDirectory/.env" ]; then
  printf 'Missing %s/.env; refusing to start with default secrets.\n' "$runtimeDirectory" >&2
  exit 1
fi

chmod 600 "$runtimeDirectory/.env"

backupPassphraseFile="$runtimeDirectory/.backup-passphrase"
if [ ! -f "$backupPassphraseFile" ]; then
  umask 077
  openssl rand -base64 48 > "$backupPassphraseFile"
fi
chmod 600 "$backupPassphraseFile"

appEnvironmentFile="$repositoryDirectory/.env.production"
if [ -f "$appEnvironmentFile" ]; then
  anonymousKey=$(sed -n 's/^ANON_KEY=//p' "$runtimeDirectory/.env")
  serviceRoleKey=$(sed -n 's/^SERVICE_ROLE_KEY=//p' "$runtimeDirectory/.env")
  replaceEnvironmentValue "$appEnvironmentFile" NEXT_PUBLIC_SUPABASE_URL "$publicUrl"
  replaceEnvironmentValue "$appEnvironmentFile" NEXT_PUBLIC_SUPABASE_ANON_KEY "$anonymousKey"
  replaceEnvironmentValue "$appEnvironmentFile" SUPABASE_SERVICE_ROLE_KEY "$serviceRoleKey"
  chmod 600 "$appEnvironmentFile"
fi

(
  cd "$runtimeDirectory"
  docker compose config --quiet
  docker compose config --images | sort -u | while IFS= read -r imageReference; do
    pullImageWithRetries "$imageReference"
  done
  docker compose up --detach --wait
)

printf 'Supabase is running from %s.\n' "$runtimeDirectory"
printf 'API gateway: http://127.0.0.1:8000\n'
printf 'Postgres data: %s/volumes/db/data\n' "$runtimeDirectory"
