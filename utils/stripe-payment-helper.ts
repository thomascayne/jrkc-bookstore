// utils/stripe-payment-helpers.ts

import { IOrder } from '@/interfaces/IOrder';

export async function createStripePaymentIntent(amount: number, currentOrder: IOrder | null) {
  try {
    const response = await fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        orderId: currentOrder?.id,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { success: false, error: `Failed to create payment intent: ${errorText}` };
    }

    const { clientSecret } = await response.json();
    return { success: true, clientSecret };
  } catch (error) {
    return { success: false, error: 'An error occurred while creating the payment intent' };
  }
}