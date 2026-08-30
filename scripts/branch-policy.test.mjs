import assert from 'node:assert/strict';
import test from 'node:test';

import {
  assertDeploymentSource,
  assertPullRequestFlow,
} from './branch-policy.mjs';

test('working branches may open pull requests into main', () => {
  assert.doesNotThrow(() =>
    assertPullRequestFlow('main', 'fix/postgres-runtime'),
  );
});

test('main cannot open a pull request into itself', () => {
  assert.throws(() => assertPullRequestFlow('main', 'main'));
});

test('unsupported protected base branches are rejected', () => {
  assert.throws(() => assertPullRequestFlow('staging', 'feat/catalog'));
});

test('production deployment requires a merged working-branch pull request', () => {
  assert.doesNotThrow(() =>
    assertDeploymentSource('main', [
      {
        base: { ref: 'main' },
        head: { ref: 'feat/catalog-search' },
        merged_at: '2026-08-28T12:00:00Z',
      },
    ]),
  );

  assert.throws(() => assertDeploymentSource('main', []));
  assert.throws(() =>
    assertDeploymentSource('main', [
      {
        base: { ref: 'main' },
        head: { ref: 'main' },
        merged_at: '2026-08-28T12:00:00Z',
      },
    ]),
  );
});
