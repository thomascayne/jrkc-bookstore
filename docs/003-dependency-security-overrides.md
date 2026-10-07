# Dependency security overrides

The October 2026 security update keeps Next.js, its ESLint configuration and
its ESLint plugin on 16.3.8. Do not downgrade the plugin to clear an audit:
14.2.35 omits the internal-navigation rule enabled by the Next.js 16 configuration.

## Temporary directory-search substitution

`package.json` overrides only the `fast-glob` dependency of
`@next/eslint-plugin-next@16.3.8` with the local `tooling/next-eslint-glob` adapter,
backed by `tinyglobby@0.2.17`. A root `fast-glob` development dependency provides
the local package; the version-scoped override references it using `$fast-glob`.
The lockfile must resolve the link to `tooling/next-eslint-glob`. Clean installs
and the lint regression tests verify this linkage. This removes the
unpatched `braces` dependency chain described in
[GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm).

The installed plugin uses this dependency only in `get-root-dirs`, calling
`globSync(pattern, { onlyDirectories: true })`. The adapter supports that API
and preserves absolute input paths while disabling implicit directory expansion.
A direct tinyglobby alias differs on both defaults, including absolute paths
across Windows drives and literal directories expanding to their descendants.
This substitution is scoped to that exact plugin version; it is not a general
replacement for every fast-glob API or consumer. All upstream Next.js lint rules
remain in use, and `eslint.config.js` uses the standard configuration without a
legacy compatibility wrapper. The Docker dependency stage copies the adapter
before `npm ci`, so the local dependency is available during clean image builds.

`npm run test:lint-config` verifies the navigation rule, recommended rule activation,
literal and wildcard root paths, brace patterns, arrays, relative paths, directory
filtering, missing paths, and actual internal-link linting with configured roots.
CI runs these tests after dependency installation.

When upgrading the plugin, inspect its glob calls again. Remove this alias when
its ordinary dependency tree passes the full audit, then run the lint regression
tests and normal release checks. Do not carry this alias forward to another
plugin version without qualifying its API use.

## Other retained security constraints

Sharp must resolve to at least 0.35.5 and source-map-js to at least 1.2.2.
The lockfile also records patched brace-expansion releases for ESLint's remaining
minimatch dependencies. Preserve the existing PostCSS and scoped minimatch
overrides. The full `npm audit --audit-level=moderate` gate remains enabled.
