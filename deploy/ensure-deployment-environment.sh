#!/bin/sh

set -eu

environmentFile=${1:?Deployment environment file is required.}

case "$environmentFile" in
  /*) ;;
  *) environmentFile="$(pwd)/$environmentFile" ;;
esac

environmentDirectory=$(dirname "$environmentFile")
if [ ! -d "$environmentDirectory" ]; then
  printf 'Deployment environment directory does not exist: %s\n' \
    "$environmentDirectory" >&2
  exit 1
fi

umask 077
if [ ! -e "$environmentFile" ]; then
  : > "$environmentFile"
fi

if [ ! -f "$environmentFile" ]; then
  printf 'Deployment environment path is not a regular file: %s\n' \
    "$environmentFile" >&2
  exit 1
fi

hasEnvironmentValue() {
  settingName=$1
  awk -v settingName="$settingName" '
    index($0, settingName "=") == 1 {
      settingValue = substr($0, length(settingName) + 2)
      gsub(/^[[:space:]]+|[[:space:]]+$/, "", settingValue)
      firstCharacter = substr(settingValue, 1, 1)
      lastCharacter = substr(settingValue, length(settingValue), 1)
      doubleQuoted = firstCharacter == "\"" && lastCharacter == "\""
      singleQuoted = firstCharacter == "\047" && lastCharacter == "\047"
      if (length(settingValue) >= 2 && (doubleQuoted || singleQuoted)) {
        settingValue = substr(settingValue, 2, length(settingValue) - 2)
      }
      found = length(settingValue) > 0 ? 1 : 0
    }
    END { exit found ? 0 : 1 }
  ' "$environmentFile"
}

generatePassword() {
  od -An -N32 -tx1 /dev/urandom | tr -d ' \n'
}

generatedSettings=''
for settingName in POSTGRES_OWNER_PASSWORD POSTGRES_PASSWORD; do
  if ! hasEnvironmentValue "$settingName"; then
    if [ -s "$environmentFile" ]; then
      printf '\n' >> "$environmentFile"
    fi
    printf '%s=%s\n' "$settingName" "$(generatePassword)" >> "$environmentFile"
    generatedSettings="${generatedSettings}${generatedSettings:+, }${settingName}"
  fi
done

chmod 600 "$environmentFile"

if [ -n "$generatedSettings" ]; then
  printf 'Generated missing deployment settings in %s: %s.\n' \
    "$environmentFile" "$generatedSettings"
else
  printf 'Deployment PostgreSQL settings are already present in %s.\n' \
    "$environmentFile"
fi
