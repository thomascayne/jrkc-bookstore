#!/bin/sh

set -eu

bookstoreDomain='bookstore.thomascayne.com'
caddyConfig='/etc/caddy/Caddyfile'
caddyImportPattern='/etc/caddy/sites-enabled/*.caddy'
caddySiteDirectory='/etc/caddy/sites-enabled'
caddySiteTarget="${caddySiteDirectory}/jrkc-bookstore.caddy"

if [ "$(id -u)" -ne 0 ]; then
  printf 'Run this script with sudo: sudo sh deploy/configure-oracle-caddy.sh\n' >&2
  exit 1
fi

if ! command -v caddy >/dev/null 2>&1; then
  printf 'Caddy is not installed or is not available on PATH.\n' >&2
  exit 1
fi

if ! command -v systemctl >/dev/null 2>&1; then
  printf 'systemctl is required to reload the Caddy service.\n' >&2
  exit 1
fi

if [ ! -f "$caddyConfig" ]; then
  printf 'Active Caddy configuration was not found: %s\n' "$caddyConfig" >&2
  exit 1
fi

temporaryDirectory=$(mktemp -d)
caddySiteSource="${temporaryDirectory}/jrkc-bookstore.caddy"
caddyConfigBackup="${temporaryDirectory}/Caddyfile"
caddySiteBackup="${temporaryDirectory}/jrkc-bookstore.caddy"
caddySiteExisted=0
rollbackRequired=1

cat > "$caddySiteSource" <<'CADDY_SITE'
bookstore.thomascayne.com {
	encode zstd gzip

	@supabase path /auth/v1/* /functions/v1/* /graphql/v1 /graphql/v1/* /realtime/v1/* /rest/v1/* /storage/v1/*
	handle @supabase {
		reverse_proxy 127.0.0.1:8000
	}

	handle {
		reverse_proxy 127.0.0.1:3100
	}
}
CADDY_SITE

cp "$caddyConfig" "$caddyConfigBackup"

if [ -f "$caddySiteTarget" ]; then
  cp "$caddySiteTarget" "$caddySiteBackup"
  caddySiteExisted=1
fi

restoreConfiguration() {
  cp "$caddyConfigBackup" "$caddyConfig"

  if [ "$caddySiteExisted" -eq 1 ]; then
    cp "$caddySiteBackup" "$caddySiteTarget"
  else
    rm -f "$caddySiteTarget"
  fi

  if caddy validate --config "$caddyConfig" --adapter caddyfile >/dev/null 2>&1; then
    systemctl reload caddy >/dev/null 2>&1 || true
  fi
}

handleExit() {
  exitStatus=$?
  trap - EXIT

  if [ "$exitStatus" -ne 0 ] && [ "$rollbackRequired" -eq 1 ]; then
    printf 'Caddy configuration failed; restoring the previous configuration.\n' >&2
    restoreConfiguration
  fi

  rm -rf "$temporaryDirectory"
  exit "$exitStatus"
}

trap handleExit EXIT

install -d -m 0755 "$caddySiteDirectory"
install -m 0644 "$caddySiteSource" "$caddySiteTarget"
caddy fmt --overwrite "$caddySiteTarget" >/dev/null

if ! grep -Eq '^[[:space:]]*import[[:space:]]+/etc/caddy/sites-enabled/\*\.caddy[[:space:]]*$' "$caddyConfig"; then
  printf '\nimport %s\n' "$caddyImportPattern" >> "$caddyConfig"
fi

caddy validate --config "$caddyConfig" --adapter caddyfile
systemctl reload caddy
systemctl is-active --quiet caddy

rollbackRequired=0

printf 'Configured https://%s through Caddy.\n' "$bookstoreDomain"
printf 'Next.js upstream: http://127.0.0.1:3100\n'
printf 'Supabase API upstream: http://127.0.0.1:8000\n'
printf 'Installed site file: %s\n' "$caddySiteTarget"
