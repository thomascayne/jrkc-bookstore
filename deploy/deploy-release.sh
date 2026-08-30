#!/bin/sh

set -eu

deploymentPath=${1:?Deployment path is required.}
releaseCommit=${2:?Release commit is required.}
releaseBranch=${3:?Release branch is required.}
environmentFile=${4:?Environment file is required.}
composeProject=${5:?Compose project name is required.}
hostPort=${6:?Host port is required.}

case "$deploymentPath" in
  /*) ;;
  *)
    printf 'Deployment path must be absolute: %s\n' "$deploymentPath" >&2
    exit 1
    ;;
esac

case "$releaseCommit" in
  *[!0-9a-f]*|'')
    printf 'Release commit must be a lowercase hexadecimal Git SHA.\n' >&2
    exit 1
    ;;
esac

if [ "${#releaseCommit}" -ne 40 ]; then
  printf 'Release commit must contain exactly 40 hexadecimal characters.\n' >&2
  exit 1
fi

case "$releaseBranch" in
  main) ;;
  *)
    printf 'Release branch must be main.\n' >&2
    exit 1
    ;;
esac

case "${releaseBranch}:${environmentFile}" in
  main:.env.production) ;;
  *)
    printf 'Environment file %s is not valid for branch %s.\n' \
      "$environmentFile" "$releaseBranch" >&2
    exit 1
    ;;
esac

case "$hostPort" in
  *[!0-9]*|'')
    printf 'Host port must be numeric.\n' >&2
    exit 1
    ;;
esac

cd "$deploymentPath"

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  printf 'Deployment path is not a Git checkout: %s\n' "$deploymentPath" >&2
  exit 1
fi

unexpectedUntrackedFiles=$(git ls-files \
  --others \
  --exclude-standard \
  -- \
  . \
  ":(exclude)${environmentFile}")

if ! git diff --quiet || \
  ! git diff --cached --quiet || \
  [ -n "$unexpectedUntrackedFiles" ]; then
  printf 'Deployment checkout contains uncommitted files; refusing to overwrite it.\n' >&2
  if [ -n "$unexpectedUntrackedFiles" ]; then
    printf 'Unexpected untracked files:\n%s\n' "$unexpectedUntrackedFiles" >&2
  fi
  exit 1
fi

git fetch --prune origin \
  "+refs/heads/${releaseBranch}:refs/remotes/origin/${releaseBranch}"

if ! git cat-file -e "${releaseCommit}^{commit}"; then
  printf 'Release commit is not available after fetch: %s\n' "$releaseCommit" >&2
  exit 1
fi

if ! git merge-base --is-ancestor "$releaseCommit" "origin/${releaseBranch}"; then
  printf 'Release commit is not contained in origin/%s.\n' "$releaseBranch" >&2
  exit 1
fi

git checkout --detach "$releaseCommit"

sh deploy/ensure-deployment-environment.sh "$environmentFile"

databaseVolume=$(awk '
  index($0, "BOOKSTORE_DATABASE_VOLUME=") == 1 {
    settingValue = substr($0, length("BOOKSTORE_DATABASE_VOLUME=") + 1)
    gsub(/^[[:space:]]+|[[:space:]]+$/, "", settingValue)
    firstCharacter = substr(settingValue, 1, 1)
    lastCharacter = substr(settingValue, length(settingValue), 1)
    if (length(settingValue) >= 2 &&
        ((firstCharacter == "\"" && lastCharacter == "\"") ||
         (firstCharacter == "\047" && lastCharacter == "\047"))) {
      settingValue = substr(settingValue, 2, length(settingValue) - 2)
    }
  }
  END { print settingValue }
' "$environmentFile")
databaseVolume=${databaseVolume:-jrkc-bookstore-postgres-data}

export BOOKSTORE_DATABASE_VOLUME=$databaseVolume
export BOOKSTORE_HOST_PORT=$hostPort
export BOOKSTORE_IMAGE_REPOSITORY=$composeProject
export BOOKSTORE_IMAGE_TAG=$releaseCommit
export BOOKSTORE_ENV_FILE=$environmentFile

sh deploy/verify-docker-isolation.sh \
  "$composeProject" \
  "$hostPort" \
  "$databaseVolume"

docker compose \
  --project-name "$composeProject" \
  --env-file "$environmentFile" \
  config --quiet

docker compose \
  --project-name "$composeProject" \
  --env-file "$environmentFile" \
  build

docker compose \
  --project-name "$composeProject" \
  --env-file "$environmentFile" \
  up --detach --wait database

docker compose \
  --project-name "$composeProject" \
  --env-file "$environmentFile" \
  exec -T database sh /usr/local/bin/synchronize-bookstore-credentials

docker compose \
  --project-name "$composeProject" \
  --env-file "$environmentFile" \
  up --detach --wait

healthAttempt=1
maximumHealthAttempts=12

while ! curl --fail --silent --show-error "http://127.0.0.1:${hostPort}/api/health" >/dev/null; do
  if [ "$healthAttempt" -ge "$maximumHealthAttempts" ]; then
    printf 'Deployment health check failed after %s attempts.\n' "$maximumHealthAttempts" >&2
    docker compose --project-name "$composeProject" --env-file "$environmentFile" ps >&2
    docker compose \
      --project-name "$composeProject" \
      --env-file "$environmentFile" \
      logs --tail 100 database migrate bookstore >&2
    exit 1
  fi

  healthAttempt=$((healthAttempt + 1))
  sleep 5
done

printf 'Deployed %s from %s on 127.0.0.1:%s.\n' \
  "$releaseCommit" "$releaseBranch" "$hostPort"
