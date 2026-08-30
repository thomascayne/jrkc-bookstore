import { stripeTestPublishableKey } from '@/utils/stripeTestMode';

export function getStripePublishableKey() {
  return stripeTestPublishableKey(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  );
}
