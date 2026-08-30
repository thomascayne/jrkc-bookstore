#!/bin/sh

set -eu

composeProject=${1:?Compose project name is required.}
hostPort=${2:?Host port is required.}
databaseVolume=${3:?Database volume name is required.}

case "$composeProject" in
  *[!a-z0-9_-]*|'')
    printf 'Compose project must contain only lowercase letters, numbers, underscores, and hyphens.\n' >&2
    exit 1
    ;;
esac

case "$hostPort" in
  *[!0-9]*|'')
    printf 'Host port must be numeric.\n' >&2
    exit 1
    ;;
esac

if [ "$hostPort" -lt 1024 ] || [ "$hostPort" -gt 65535 ]; then
  printf 'Host port must be between 1024 and 65535.\n' >&2
  exit 1
fi

case "$databaseVolume" in
  *[!a-zA-Z0-9_.-]*|'')
    printf 'Database volume contains unsupported characters.\n' >&2
    exit 1
    ;;
esac

if ! command -v docker >/dev/null 2>&1; then
  printf 'Docker is required to verify Oracle resource isolation.\n' >&2
  exit 1
fi

normalizeDockerLabel() {
  labelValue=$1
  case "$labelValue" in
    '<no value>'|'null') printf '\n' ;;
    *) printf '%s\n' "$labelValue" ;;
  esac
}

containerProject() {
  containerId=$1
  projectLabel=$(docker inspect \
    --format '{{ index .Config.Labels "com.docker.compose.project" }}' \
    "$containerId")
  normalizeDockerLabel "$projectLabel"
}

containerService() {
  containerId=$1
  serviceLabel=$(docker inspect \
    --format '{{ index .Config.Labels "com.docker.compose.service" }}' \
    "$containerId")
  normalizeDockerLabel "$serviceLabel"
}

containerName() {
  containerId=$1
  docker inspect --format '{{ .Name }}' "$containerId"
}

currentProjectOwnsPort=0
portContainerIds=$(docker ps \
  --filter "publish=${hostPort}" \
  --format '{{ .ID }}')

for containerId in $portContainerIds; do
  ownerProject=$(containerProject "$containerId")
  ownerService=$(containerService "$containerId")
  if [ "$ownerProject" != "$composeProject" ] || [ "$ownerService" != 'bookstore' ]; then
    printf 'Oracle host port %s is already owned by container %s from %s/%s.\n' \
      "$hostPort" "$(containerName "$containerId")" \
      "${ownerProject:-unmanaged}" "${ownerService:-unmanaged}" >&2
    exit 1
  fi
  currentProjectOwnsPort=1
done

if [ "$currentProjectOwnsPort" -eq 0 ]; then
  if ! command -v ss >/dev/null 2>&1; then
    printf 'The ss utility is required to verify host port ownership.\n' >&2
    exit 1
  fi

  if [ -n "$(ss -H -ltn "sport = :${hostPort}")" ]; then
    printf 'Oracle host port %s is already used by a non-Docker listener.\n' \
      "$hostPort" >&2
    exit 1
  fi
fi

if docker volume inspect "$databaseVolume" >/dev/null 2>&1; then
  volumeProjectLabel=$(docker volume inspect \
    --format '{{ index .Labels "com.docker.compose.project" }}' \
    "$databaseVolume")
  volumeProject=$(normalizeDockerLabel "$volumeProjectLabel")

  if [ -n "$volumeProject" ] && [ "$volumeProject" != "$composeProject" ]; then
    printf 'Database volume %s belongs to Compose project %s, not %s.\n' \
      "$databaseVolume" "$volumeProject" "$composeProject" >&2
    exit 1
  fi

  volumeContainerIds=$(docker ps \
    --all \
    --filter "volume=${databaseVolume}" \
    --format '{{ .ID }}')
  for containerId in $volumeContainerIds; do
    ownerProject=$(containerProject "$containerId")
    ownerService=$(containerService "$containerId")
    if [ "$ownerProject" != "$composeProject" ] || [ "$ownerService" != 'database' ]; then
      printf 'Database volume %s is attached to container %s from %s/%s.\n' \
        "$databaseVolume" "$(containerName "$containerId")" \
        "${ownerProject:-unmanaged}" "${ownerService:-unmanaged}" >&2
      exit 1
    fi
  done
fi

printf 'Verified Docker isolation for Compose project %s on port %s with volume %s.\n' \
  "$composeProject" "$hostPort" "$databaseVolume"
