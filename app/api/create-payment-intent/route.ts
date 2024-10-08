// pages/api/checkout-session/route.ts

import Stripe from "stripe";
import { NextResponse } from "next/server";

const { STRIPE_SECRET_KEY } = process.env;

const stripe = new Stripe(`${STRIPE_SECRET_KEY}`, {
  apiVersion: '2024-06-20',
});

export async function POST(req: Request) {
  try {
    const { amount, orderId } = await req.json();

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd', // Or your preferred currency
      metadata: { orderId },
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json({ error: 'Error creating payment intent' }, { status: 500 });
  }
}