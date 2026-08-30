#!/bin/sh

set -eu

composeProject=${1:?Compose project name is required.}
environmentFile=${2:?Environment file is required.}
hostPort=${3:?Host port is required.}
releaseCommit=${4:?Release commit is required.}

case "$composeProject" in
  *[!a-z0-9_-]*|'')
    printf 'Compose project contains unsupported characters.\n' >&2
    exit 1
    ;;
esac

case "$hostPort" in
  *[!0-9]*|'')
    printf 'Host port must be numeric.\n' >&2
    exit 1
    ;;
esac

case "$releaseCommit" in
  *[!0-9a-f]*|'')
    printf 'Release commit must be lowercase hexadecimal.\n' >&2
    exit 1
    ;;
esac

if [ "${#releaseCommit}" -ne 40 ]; then
  printf 'Release commit must contain exactly 40 hexadecimal characters.\n' >&2
  exit 1
fi

containerId=$(docker compose \
  --project-name "$composeProject" \
  --env-file "$environmentFile" \
  ps -q bookstore)

if [ -z "$containerId" ]; then
  printf 'The bookstore service does not have a running container.\n' >&2
  exit 1
fi

expectedImage="${composeProject}:${releaseCommit}"
runningImage=$(docker inspect --format '{{ .Config.Image }}' "$containerId")

if [ "$runningImage" != "$expectedImage" ]; then
  printf 'Bookstore container uses %s instead of expected image %s.\n' \
    "$runningImage" "$expectedImage" >&2
  exit 1
fi

baseUrl="http://127.0.0.1:${hostPort}"
healthResponse=$(curl \
  --fail \
  --silent \
  --show-error \
  --max-time 15 \
  --header "X-Expected-Bookstore-Release: ${releaseCommit}" \
  "${baseUrl}/api/health")

case "$healthResponse" in
  *'"database":"available"'*'"release":"'"$releaseCommit"'"'*'"status":"ok"'*) ;;
  *)
    printf 'Bookstore health response does not identify the expected healthy release.\n' >&2
    exit 1
    ;;
esac

categoryResponse=$(curl \
  --fail \
  --silent \
  --show-error \
  --max-time 15 \
  "${baseUrl}/api/categories")

case "$categoryResponse" in
  *'"categories":[{'*) ;;
  *)
    printf 'Bookstore category smoke test returned no categories.\n' >&2
    exit 1
    ;;
esac

catalogResponse=$(curl \
  --fail \
  --silent \
  --show-error \
  --max-time 30 \
  "${baseUrl}/api/books?category=all&limit=1&page=1&sortBy=average_rating&sortOrder=DESC")

case "$catalogResponse" in
  *'"books":[{'*) ;;
  *)
    printf 'Bookstore catalog smoke test returned no books.\n' >&2
    exit 1
    ;;
esac

printf 'Verified running bookstore release %s with healthy database and catalog routes.\n' \
  "$releaseCommit"
