import { and, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { assertSameOrigin, jsonError, readJsonObject } from '@/auth/http';
import { getCurrentUser } from '@/auth/session';
import { getDatabase } from '@/db/client';
import { paymentMethods } from '@/db/schema';

function serializePaymentMethod(method: typeof paymentMethods.$inferSelect) {
  return {
    card_brand: method.cardBrand,
    card_exp_month: method.cardExpMonth,
    card_exp_year: method.cardExpYear,
    card_last4: method.cardLast4,
    card_type: method.cardType,
    id: method.id,
    is_default: method.isDefault,
    name_on_card: method.nameOnCard,
    payment_processor: method.paymentProcessor,
    payment_token: method.providerReference,
    user_id: method.userId,
  };
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return jsonError('Authentication required.', 401);

  const methods = await getDatabase()
    .select()
    .from(paymentMethods)
    .where(eq(paymentMethods.userId, user.id));
  return NextResponse.json({ methods: methods.map(serializePaymentMethod) });
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const user = await getCurrentUser();
    if (!user) return jsonError('Authentication required.', 401);
    const body = await readJsonObject(request);
    const providerReference =
      typeof body.payment_token === 'string' ? body.payment_token : '';
    const cardLast4 = typeof body.card_last4 === 'string' ? body.card_last4 : '';
    if (!providerReference || !/^\d{4}$/.test(cardLast4)) {
      return jsonError('Invalid payment method metadata.', 400);
    }

    const [method] = await getDatabase()
      .insert(paymentMethods)
      .values({
        cardBrand: String(body.card_brand ?? 'unknown'),
        cardExpMonth: Number(body.card_exp_month),
        cardExpYear: Number(body.card_exp_year),
        cardLast4,
        cardType: String(body.card_type ?? 'card'),
        isDefault: Boolean(body.is_default),
        nameOnCard: String(body.name_on_card ?? ''),
        paymentProcessor: String(body.payment_processor ?? 'stripe'),
        providerReference,
        userId: user.id,
      })
      .returning();
    return NextResponse.json({ method: serializePaymentMethod(method) }, { status: 201 });
  } catch {
    return jsonError('Unable to save payment method.', 500);
  }
}

export async function PATCH(request: Request) {
  try {
    assertSameOrigin(request);
    const user = await getCurrentUser();
    if (!user) return jsonError('Authentication required.', 401);
    const body = await readJsonObject(request);
    const id = typeof body.id === 'string' ? body.id : '';
    if (!id) return jsonError('Payment method id is required.', 400);

    await getDatabase().transaction(async (transaction) => {
      await transaction
        .update(paymentMethods)
        .set({ isDefault: false, updatedAt: new Date() })
        .where(eq(paymentMethods.userId, user.id));
      const updatedMethods = await transaction
        .update(paymentMethods)
        .set({ isDefault: true, updatedAt: new Date() })
        .where(
          and(
            eq(paymentMethods.id, id),
            eq(paymentMethods.userId, user.id),
          ),
        )
        .returning({ id: paymentMethods.id });
      if (updatedMethods.length !== 1) {
        throw new Error('Payment method was not found.');
      }
    });
    return NextResponse.json({ ok: true });
  } catch {
    return jsonError('Unable to update payment method.', 500);
  }
}
