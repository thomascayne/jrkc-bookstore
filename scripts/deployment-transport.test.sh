#!/bin/sh

set -eu

repositoryRoot=$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)
deploymentWorkflow="$repositoryRoot/.github/workflows/deploy.yml"

if grep -F '< deploy/deploy-release.sh' "$deploymentWorkflow" >/dev/null; then
  printf 'Deployment workflow must not stream the release script into remote Bash.\n' >&2
  exit 1
fi

for requiredPattern in \
  'remoteDeployScript="/tmp/jrkc-bookstore-deploy-' \
  'trap cleanupRemoteDeployScript EXIT' \
  'scp \' \
  'deploy/deploy-release.sh \' \
  'bash "$remoteDeployScript" \'
do
  if ! grep -F "$requiredPattern" "$deploymentWorkflow" >/dev/null; then
    printf 'Deployment workflow is missing transport safeguard: %s\n' \
      "$requiredPattern" >&2
    exit 1
  fi
done

printf 'Deployment script transport test passed.\n'
