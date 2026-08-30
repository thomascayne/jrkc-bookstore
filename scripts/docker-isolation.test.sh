#!/bin/sh

set -eu

repositoryRoot=$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)
isolationScript="$repositoryRoot/deploy/verify-docker-isolation.sh"
temporaryDirectory=$(mktemp -d)
stubDirectory="$temporaryDirectory/bin"

cleanup() {
  rm -rf -- "$temporaryDirectory"
}
trap cleanup EXIT HUP INT TERM

mkdir -p "$stubDirectory"

cat > "$stubDirectory/docker" <<'DOCKER_STUB'
#!/bin/sh

set -eu

commandName=${1:-}
shift || true

case "$commandName" in
  inspect)
    requestedFormat=${2:-}
    containerId=${3:-}
    case "$requestedFormat" in
      *Config.Labels*)
        case "$requestedFormat:$containerId" in
          *compose.project*:current-port|*compose.project*:current-volume)
            printf '%s\n' 'jrkc-bookstore-production'
            ;;
          *compose.project*:foreign-port|*compose.project*:foreign-volume)
            printf '%s\n' 'another-application'
            ;;
          *compose.service*:current-port) printf '%s\n' 'bookstore' ;;
          *compose.service*:current-volume) printf '%s\n' 'database' ;;
          *compose.service*:foreign-port|*compose.service*:foreign-volume)
            printf '%s\n' 'foreign-service'
            ;;
          *) printf '%s\n' '<no value>' ;;
        esac
        ;;
      *) printf '/%s\n' "$containerId" ;;
    esac
    ;;
  ps)
    arguments="$*"
    case "$arguments" in
      *publish=3100*) printf '%s\n' "${TEST_PORT_CONTAINER_ID:-}" ;;
      *volume=jrkc-bookstore-postgres-data*)
        printf '%s\n' "${TEST_VOLUME_CONTAINER_ID:-}"
        ;;
    esac
    ;;
  volume)
    if [ "${1:-}" != 'inspect' ]; then
      exit 1
    fi
    if [ "${TEST_VOLUME_EXISTS:-0}" != '1' ]; then
      exit 1
    fi
    if [ "${2:-}" = '--format' ]; then
      printf '%s\n' "${TEST_VOLUME_PROJECT:-<no value>}"
    fi
    ;;
  *)
    printf 'Unexpected docker command in test: %s %s\n' "$commandName" "$*" >&2
    exit 1
    ;;
esac
DOCKER_STUB

cat > "$stubDirectory/ss" <<'SS_STUB'
#!/bin/sh

set -eu

if [ "${TEST_SYSTEM_LISTENER:-0}" = '1' ]; then
  printf 'LISTEN 0 4096 127.0.0.1:3100 0.0.0.0:*\n'
fi
SS_STUB

chmod 700 "$stubDirectory/docker" "$stubDirectory/ss"
sh -n "$isolationScript"
sh -n "$repositoryRoot/deploy/deploy-release.sh"

runSuccess() {
  scenarioName=$1
  shift
  if ! env PATH="$stubDirectory:$PATH" "$@" \
    sh "$isolationScript" \
      jrkc-bookstore-production \
      3100 \
      jrkc-bookstore-postgres-data >/dev/null; then
    printf 'Expected Docker isolation scenario to succeed: %s\n' "$scenarioName" >&2
    exit 1
  fi
}

runFailure() {
  scenarioName=$1
  shift
  if env PATH="$stubDirectory:$PATH" "$@" \
    sh "$isolationScript" \
      jrkc-bookstore-production \
      3100 \
      jrkc-bookstore-postgres-data >/dev/null 2>&1; then
    printf 'Expected Docker isolation scenario to fail: %s\n' "$scenarioName" >&2
    exit 1
  fi
}

runSuccess clean-host
runSuccess existing-production-assets \
  TEST_PORT_CONTAINER_ID=current-port \
  TEST_VOLUME_CONTAINER_ID=current-volume \
  TEST_VOLUME_EXISTS=1 \
  TEST_VOLUME_PROJECT=jrkc-bookstore-production
runFailure foreign-port-owner TEST_PORT_CONTAINER_ID=foreign-port
runFailure non-docker-listener TEST_SYSTEM_LISTENER=1
runFailure foreign-volume-owner \
  TEST_VOLUME_EXISTS=1 \
  TEST_VOLUME_PROJECT=another-application
runFailure foreign-volume-attachment \
  TEST_VOLUME_CONTAINER_ID=foreign-volume \
  TEST_VOLUME_EXISTS=1

printf 'Docker isolation tests passed.\n'
