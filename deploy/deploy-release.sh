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
  main|staging) ;;
  *)
    printf 'Release branch must be main or staging.\n' >&2
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

if [ ! -f "$environmentFile" ]; then
  printf 'Required deployment environment file is missing: %s\n' "$environmentFile" >&2
  exit 1
fi

if ! git diff --quiet || ! git diff --cached --quiet || [ -n "$(git ls-files --others --exclude-standard)" ]; then
  printf 'Deployment checkout contains uncommitted files; refusing to overwrite it.\n' >&2
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

export BOOKSTORE_HOST_PORT=$hostPort
export BOOKSTORE_IMAGE_TAG=$releaseCommit

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
  up --detach --wait

healthAttempt=1
maximumHealthAttempts=12

while ! curl --fail --silent --show-error "http://127.0.0.1:${hostPort}/api/health" >/dev/null; do
  if [ "$healthAttempt" -ge "$maximumHealthAttempts" ]; then
    printf 'Deployment health check failed after %s attempts.\n' "$maximumHealthAttempts" >&2
    docker compose --project-name "$composeProject" --env-file "$environmentFile" ps >&2
    exit 1
  fi

  healthAttempt=$((healthAttempt + 1))
  sleep 5
done

printf 'Deployed %s from %s on 127.0.0.1:%s.\n' \
  "$releaseCommit" "$releaseBranch" "$hostPort"
