import assert from 'node:assert/strict';
import test from 'node:test';

import {
  assertDeploymentSource,
  assertPullRequestFlow,
} from './branch-policy.mjs';

test('working branches may open pull requests into staging', () => {
  assert.doesNotThrow(() =>
    assertPullRequestFlow('staging', 'fix/next15-react-runtime'),
  );
});

test('only staging may open a pull request into main', () => {
  assert.doesNotThrow(() => assertPullRequestFlow('main', 'staging'));
  assert.throws(() => assertPullRequestFlow('main', 'fix/direct-production'));
});

test('protected branches cannot be recycled into staging', () => {
  assert.throws(() => assertPullRequestFlow('staging', 'main'));
  assert.throws(() => assertPullRequestFlow('staging', 'staging'));
});

test('staging deployment requires a merged working-branch pull request', () => {
  assert.doesNotThrow(() =>
    assertDeploymentSource('staging', [
      {
        base: { ref: 'staging' },
        head: { ref: 'feat/catalog-search' },
        merged_at: '2026-08-28T12:00:00Z',
      },
    ]),
  );

  assert.throws(() => assertDeploymentSource('staging', []));
});

test('production deployment requires a staging-to-main merge', () => {
  assert.doesNotThrow(() =>
    assertDeploymentSource('main', [
      {
        base: { ref: 'main' },
        head: { ref: 'staging' },
        merged_at: '2026-08-28T12:00:00Z',
      },
    ]),
  );

  assert.throws(() =>
    assertDeploymentSource('main', [
      {
        base: { ref: 'main' },
        head: { ref: 'fix/direct-production' },
        merged_at: '2026-08-28T12:00:00Z',
      },
    ]),
  );
});
