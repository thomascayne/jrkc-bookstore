import assert from 'node:assert/strict';
import test from 'node:test';

import {
  stripeTestPublishableKey,
  stripeTestSecretKey,
} from '../utils/stripeTestMode.ts';

test('test-mode Stripe keys are accepted and normalized', () => {
  assert.equal(
    stripeTestPublishableKey('  pk_test_public-example  '),
    'pk_test_public-example',
  );
  assert.equal(
    stripeTestSecretKey('  sk_test_secret-example  '),
    'sk_test_secret-example',
  );
});

test('live Stripe keys are rejected', () => {
  assert.equal(stripeTestPublishableKey('pk_live_public-example'), null);
  assert.equal(stripeTestSecretKey('sk_live_secret-example'), null);
});

test('missing, malformed, and prefix-only Stripe keys are rejected', () => {
  assert.equal(stripeTestPublishableKey(undefined), null);
  assert.equal(stripeTestPublishableKey('pk_test_'), null);
  assert.equal(stripeTestPublishableKey('public-example'), null);
  assert.equal(stripeTestSecretKey(null), null);
  assert.equal(stripeTestSecretKey('sk_test_'), null);
  assert.equal(stripeTestSecretKey('secret-example'), null);
});
