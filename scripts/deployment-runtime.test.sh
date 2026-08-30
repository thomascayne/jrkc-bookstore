#!/bin/sh

set -eu

repositoryRoot=$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)
verificationScript="$repositoryRoot/deploy/verify-release-runtime.sh"
temporaryDirectory=$(mktemp -d)
stubDirectory="$temporaryDirectory/bin"
releaseCommit='0123456789abcdef0123456789abcdef01234567'

cleanup() {
  rm -rf -- "$temporaryDirectory"
}
trap cleanup EXIT HUP INT TERM

mkdir -p "$stubDirectory"

cat > "$stubDirectory/docker" <<'DOCKER_STUB'
#!/bin/sh

set -eu

case "${1:-}" in
  compose) printf '%s\n' 'bookstore-container' ;;
  inspect)
    printf '%s\n' "${TEST_RUNNING_IMAGE:-jrkc-bookstore-production:0123456789abcdef0123456789abcdef01234567}"
    ;;
  *) exit 1 ;;
esac
DOCKER_STUB

cat > "$stubDirectory/curl" <<'CURL_STUB'
#!/bin/sh

set -eu

requestUrl=''
for argument in "$@"; do
  requestUrl=$argument
done

case "$requestUrl" in
  */api/health)
    printf '%s\n' "${TEST_HEALTH_RESPONSE:-{\"database\":\"available\",\"release\":\"0123456789abcdef0123456789abcdef01234567\",\"status\":\"ok\"}}"
    ;;
  */api/categories)
    printf '%s\n' "${TEST_CATEGORY_RESPONSE:-{\"categories\":[{\"key\":\"fiction\"}]}}"
    ;;
  */api/books*)
    printf '%s\n' "${TEST_CATALOG_RESPONSE:-{\"books\":[{\"id\":\"book-1\"}]}}"
    ;;
  *) exit 1 ;;
esac
CURL_STUB

chmod 700 "$stubDirectory/docker" "$stubDirectory/curl"
sh -n "$verificationScript"

runSuccess() {
  scenarioName=$1
  shift
  if ! env PATH="$stubDirectory:$PATH" "$@" \
    sh "$verificationScript" \
      jrkc-bookstore-production \
      .env.production \
      3100 \
      "$releaseCommit" >/dev/null; then
    printf 'Expected runtime verification scenario to succeed: %s\n' \
      "$scenarioName" >&2
    exit 1
  fi
}

runFailure() {
  scenarioName=$1
  shift
  if env PATH="$stubDirectory:$PATH" "$@" \
    sh "$verificationScript" \
      jrkc-bookstore-production \
      .env.production \
      3100 \
      "$releaseCommit" >/dev/null 2>&1; then
    printf 'Expected runtime verification scenario to fail: %s\n' \
      "$scenarioName" >&2
    exit 1
  fi
}

runSuccess expected-release
runFailure stale-image \
  TEST_RUNNING_IMAGE=jrkc-bookstore-production:stale
runFailure stale-health-response \
  TEST_HEALTH_RESPONSE='{"database":"available","release":"stale","status":"ok"}'
runFailure missing-categories \
  TEST_CATEGORY_RESPONSE='{"categories":[]}'
runFailure missing-books \
  TEST_CATALOG_RESPONSE='{"books":[]}'

printf 'Deployment runtime verification tests passed.\n'
