const stripeTestPublishableKeyPrefix = 'pk_test_';
const stripeTestSecretKeyPrefix = 'sk_test_';

function normalizedTestKey(
  value: string | null | undefined,
  expectedPrefix: string,
): string | null {
  const normalizedValue = value?.trim();

  if (
    !normalizedValue?.startsWith(expectedPrefix) ||
    normalizedValue.length <= expectedPrefix.length
  ) {
    return null;
  }

  return normalizedValue;
}

export function stripeTestPublishableKey(
  value: string | null | undefined,
): string | null {
  return normalizedTestKey(value, stripeTestPublishableKeyPrefix);
}

export function stripeTestSecretKey(
  value: string | null | undefined,
): string | null {
  return normalizedTestKey(value, stripeTestSecretKeyPrefix);
}
