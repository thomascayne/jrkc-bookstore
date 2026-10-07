import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve, sep } from 'node:path';
import test from 'node:test';
import { ESLint } from 'eslint';

const require = createRequire(import.meta.url);
const configRequire = createRequire(require.resolve('eslint-config-next'));
const pluginPath = configRequire.resolve('@next/eslint-plugin-next');
const nextPlugin = configRequire('@next/eslint-plugin-next').default;
const { getRootDirs } = require(
  join(dirname(pluginPath), 'utils/get-root-dirs.js'),
);
const filePath = 'app/lint-contract.tsx';
const navigationRule = '@next/next/no-location-assign-relative-destination';

test('the Next plugin matches the framework and retains every recommended rule', async () => {
  const pluginVersion = require(
    join(dirname(pluginPath), '../package.json'),
  ).version;
  assert.equal(pluginVersion, require('next/package.json').version);
  const config = await new ESLint().calculateConfigForFile(filePath);
  for (const ruleName of Object.keys(nextPlugin.configs.recommended.rules)) {
    assert.ok(
      config.rules[ruleName]?.[0] > 0,
      `${ruleName} must remain enabled`,
    );
  }
  assert.equal(config.rules['@next/next/no-html-link-for-pages'][0], 2);
  assert.equal(config.rules['@next/next/no-sync-scripts'][0], 2);
});

test('internal location navigation is flagged while router and external navigation remain allowed', async () => {
  const engine = new ESLint();
  for (const source of [
    "window.location.assign('/cart');",
    "window.location.href = '/checkout';",
  ]) {
    const [result] = await engine.lintText(source, { filePath });
    assert.equal(result.fatalErrorCount, 0);
    assert.ok(
      result.messages.some((message) => message.ruleId === navigationRule),
    );
  }
  const [allowed] = await engine.lintText(
    "router.push('/cart'); window.location.assign('https://payments.example.test');",
    { filePath },
  );
  assert.equal(allowed.fatalErrorCount, 0);
  assert.ok(
    !allowed.messages.some((message) => message.ruleId === navigationRule),
  );
});

function directoryFixture(context) {
  const directory = mkdtempSync(join(tmpdir(), 'jrkc-eslint-'));
  context.after(() => {
    assert.ok(resolve(directory).startsWith(resolve(tmpdir()) + sep));
    rmSync(directory, { recursive: true, force: true });
  });
  const first = join(directory, 'sites', 'first');
  const second = join(directory, 'sites', 'second');
  for (const root of [first, second]) {
    mkdirSync(join(root, 'pages'), { recursive: true });
    writeFileSync(
      join(root, 'pages', 'catalog.tsx'),
      'export default function Catalog() {}',
    );
  }
  writeFileSync(
    join(directory, 'sites', 'readme.txt'),
    'Not a project directory',
  );
  return { directory, first, second };
}

test('the installed plugin discovers directories using literal, glob, brace and array settings', (context) => {
  const { directory, first, second } = directoryFixture(context);
  const expected = [first, second].map((path) => resolve(path)).sort();
  const settingsCases = [
    join(directory, 'sites', '*'),
    join(directory, 'sites', '{first,second}'),
    [first, second],
    relative(process.cwd(), join(directory, 'sites', '*')),
  ];
  for (const rootDir of settingsCases) {
    const actual = getRootDirs({
      cwd: process.cwd(),
      settings: { next: { rootDir } },
    });
    assert.deepEqual(actual.map((path) => resolve(path)).sort(), expected);
  }
  assert.deepEqual(getRootDirs({ cwd: first, settings: {} }), [first]);
  assert.deepEqual(
    getRootDirs({
      cwd: process.cwd(),
      settings: { next: { rootDir: first } },
    }).map((path) => resolve(path)),
    [resolve(first)],
  );
  assert.deepEqual(
    getRootDirs({
      cwd: process.cwd(),
      settings: { next: { rootDir: join(directory, 'missing', '*') } },
    }),
    [],
  );
});

test('directory discovery still lets the actual Next rule reject internal HTML links', async (context) => {
  const { directory } = directoryFixture(context);
  const engine = new ESLint({
    overrideConfig: {
      settings: { next: { rootDir: join(directory, 'sites', '*') } },
    },
  });
  const [result] = await engine.lintText(
    'export default function CatalogLink() { return <a href="/catalog">Catalog</a>; }',
    { filePath },
  );
  assert.equal(result.fatalErrorCount, 0);
  assert.ok(
    result.messages.some(
      (message) =>
        message.ruleId === '@next/next/no-html-link-for-pages' &&
        message.severity === 2,
    ),
  );
});
