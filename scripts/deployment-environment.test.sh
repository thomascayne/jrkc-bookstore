#!/bin/sh

set -eu

repositoryRoot=$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)
helperPath="$repositoryRoot/deploy/ensure-deployment-environment.sh"
synchronizationPath="$repositoryRoot/deploy/postgres/synchronize-database-credentials.sh"
temporaryDirectory=$(mktemp -d)

cleanup() {
  rm -rf -- "$temporaryDirectory"
}
trap cleanup EXIT HUP INT TERM

sh -n "$helperPath"
sh -n "$synchronizationPath"

assertHexPassword() {
  passwordValue=$1
  settingName=$2
  case "$passwordValue" in
    *[!0-9a-f]*|'')
      printf '%s is not lowercase hexadecimal.\n' "$settingName" >&2
      exit 1
      ;;
  esac
  if [ "${#passwordValue}" -ne 64 ]; then
    printf '%s must contain exactly 64 hexadecimal characters.\n' \
      "$settingName" >&2
    exit 1
  fi
}

environmentValue() {
  settingName=$1
  environmentFile=$2
  awk -v settingName="$settingName" '
    index($0, settingName "=") == 1 {
      settingValue = substr($0, length(settingName) + 2)
    }
    END { print settingValue }
  ' "$environmentFile"
}

createdEnvironmentFile="$temporaryDirectory/created.env"
sh "$helperPath" "$createdEnvironmentFile" >/dev/null
assertHexPassword \
  "$(environmentValue POSTGRES_OWNER_PASSWORD "$createdEnvironmentFile")" \
  POSTGRES_OWNER_PASSWORD
assertHexPassword \
  "$(environmentValue POSTGRES_PASSWORD "$createdEnvironmentFile")" \
  POSTGRES_PASSWORD
if [ "$(stat -c %a "$createdEnvironmentFile")" != '600' ]; then
  printf 'Generated environment file must use mode 0600.\n' >&2
  exit 1
fi

partialEnvironmentFile="$temporaryDirectory/partial.env"
printf '%s\n' \
  'NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY=existing-catalog-key' \
  'POSTGRES_OWNER_PASSWORD=existing-owner-password' \
  'POSTGRES_PASSWORD=stale-overridden-password' \
  'POSTGRES_PASSWORD=' > "$partialEnvironmentFile"
chmod 644 "$partialEnvironmentFile"
sh "$helperPath" "$partialEnvironmentFile" >/dev/null
if [ "$(environmentValue NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY "$partialEnvironmentFile")" != \
  'existing-catalog-key' ]; then
  printf 'Existing integration settings must be preserved.\n' >&2
  exit 1
fi
if [ "$(environmentValue POSTGRES_OWNER_PASSWORD "$partialEnvironmentFile")" != \
  'existing-owner-password' ]; then
  printf 'Existing PostgreSQL settings must be preserved.\n' >&2
  exit 1
fi
assertHexPassword \
  "$(environmentValue POSTGRES_PASSWORD "$partialEnvironmentFile")" \
  POSTGRES_PASSWORD
if [ "$(stat -c %a "$partialEnvironmentFile")" != '600' ]; then
  printf 'Existing environment file must be restricted to mode 0600.\n' >&2
  exit 1
fi

idempotentEnvironmentFile="$temporaryDirectory/idempotent.env"
sh "$helperPath" "$idempotentEnvironmentFile" >/dev/null
cp "$idempotentEnvironmentFile" "$temporaryDirectory/idempotent.before"
secondOutput=$(sh "$helperPath" "$idempotentEnvironmentFile")
if ! cmp -s "$idempotentEnvironmentFile" "$temporaryDirectory/idempotent.before"; then
  printf 'Environment bootstrap must be idempotent.\n' >&2
  exit 1
fi
case "$secondOutput" in
  *'already present'*) ;;
  *)
    printf 'Idempotent bootstrap must report that settings already exist.\n' >&2
    exit 1
    ;;
esac

printf 'Deployment environment bootstrap tests passed.\n'
