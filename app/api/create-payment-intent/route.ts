// pages/api/checkout-session/route.ts

import Stripe from 'stripe';
import { NextResponse } from 'next/server';

import { stripeTestSecretKey } from '@/utils/stripeTestMode';

export async function POST(req: Request) {
  const stripeSecretKey = stripeTestSecretKey(process.env.STRIPE_SECRET_KEY);
  if (!stripeSecretKey) {
    return NextResponse.json(
      {
        error:
          'Stripe test payments are unavailable. Live payments are disabled for this portfolio deployment.',
      },
      { status: 503 },
    );
  }

  try {
    const { amount, orderId } = await req.json();
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2026-08-26.dahlia',
    });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd', // Or your preferred currency
      metadata: { orderId },
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: 'Error creating payment intent' },
      { status: 500 },
    );
  }
}
