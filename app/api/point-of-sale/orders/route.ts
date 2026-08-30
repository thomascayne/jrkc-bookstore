import { and, eq, sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { assertSameOrigin, jsonError, readJsonObject } from '@/auth/http';
import { hasAnyRole } from '@/auth/authorization';
import { getCurrentUser } from '@/auth/session';
import { getDatabase } from '@/db/client';
import { books, orderItems, orders } from '@/db/schema';
import { ROLES } from '@/utils/roles';

const salesRoles = [
  ROLES.ADMIN,
  ROLES.STORE_MANAGER,
  ROLES.SALES_ASSOCIATE,
] as const;

function currency(value: number) {
  return Math.round(value * 100) / 100;
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const user = await getCurrentUser();
    if (!user || !hasAnyRole(user, salesRoles)) {
      return jsonError('Sales access required.', 403);
    }

    const body = await readJsonObject(request);
    const submittedItems = Array.isArray(body.items) ? body.items : [];
    const paymentMethod =
      typeof body.paymentMethod === 'string' ? body.paymentMethod.slice(0, 100) : '';
    const transactionId =
      typeof body.transactionId === 'string' ? body.transactionId.slice(0, 255) : '';
    if (!paymentMethod || !transactionId || submittedItems.length === 0) {
      return jsonError('Transaction details are incomplete.', 400);
    }

    const createdOrder = await getDatabase().transaction(async (transaction) => {
      const pricedItems: Array<{
        book: typeof books.$inferSelect;
        quantity: number;
        unitPrice: number;
      }> = [];
      let subtotal = 0;

      for (const submittedItem of submittedItems) {
        if (!submittedItem || typeof submittedItem !== 'object') {
          throw new Error('Invalid transaction item.');
        }
        const item = submittedItem as Record<string, unknown>;
        const bookId = typeof item.book_id === 'string' ? item.book_id : '';
        const quantity = Number(item.quantity);
        if (!bookId || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
          throw new Error('Invalid transaction item.');
        }

        const [book] = await transaction
          .select()
          .from(books)
          .where(eq(books.id, bookId))
          .for('update')
          .limit(1);
        if (!book || book.availableQuantity < quantity) {
          throw new Error('A selected book does not have enough stock.');
        }

        const unitPrice = currency(
          book.isPromotion
            ? book.retailPrice * (1 - book.discountPercentage / 100)
            : book.retailPrice,
        );
        pricedItems.push({ book, quantity, unitPrice });
        subtotal += unitPrice * quantity;
      }

      subtotal = currency(subtotal);
      const taxAmount = currency(subtotal * 0.13);
      const [order] = await transaction
        .insert(orders)
        .values({
          paymentMethod,
          salesPersonId: user.id,
          status: 'paid',
          subtotal,
          taxAmount,
          totalAmount: currency(subtotal + taxAmount),
          transactionId,
        })
        .returning();

      for (const { book, quantity, unitPrice } of pricedItems) {
        await transaction.insert(orderItems).values({
          bookId: book.id,
          bookSnapshot: { id: book.id, title: book.title },
          categoryId: book.categoryId,
          discountPercentage: book.discountPercentage,
          finalPrice: unitPrice,
          isPromotion: book.isPromotion,
          isbn13: book.isbn13,
          orderId: order.id,
          originalPrice: book.retailPrice,
          quantity,
          status: 'paid',
          subtotal: currency(unitPrice * quantity),
        });
        await transaction
          .update(books)
          .set({
            availableQuantity: sql`${books.availableQuantity} - ${quantity}`,
            quantity: sql`${books.quantity} - ${quantity}`,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(books.id, book.id),
              sql`${books.availableQuantity} >= ${quantity}`,
            ),
          );
      }

      return order;
    });

    return NextResponse.json({ order: createdOrder, success: true });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : 'Unable to close transaction.',
      400,
    );
  }
}
