import { and, desc, eq, sql } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

import { assertSameOrigin, jsonError, readJsonObject } from '@/auth/http';
import { getCurrentUser } from '@/auth/session';
import { serializeBook } from '@/db/book';
import { getDatabase } from '@/db/client';
import { books, cartItems, carts, orderItems, orders } from '@/db/schema';

function currency(value: number) {
  return Math.round(value * 100) / 100;
}

function serializeOrder(order: typeof orders.$inferSelect) {
  return {
    created_at: order.createdAt.toISOString(),
    customer_email: order.customerEmail ?? undefined,
    customer_phone: order.customerPhone ?? undefined,
    id: order.id,
    notes: order.notes ?? undefined,
    order_date: order.orderDate.toISOString(),
    order_discount_percentage: order.orderDiscountPercentage,
    payment_method: order.paymentMethod ?? undefined,
    sales_person_id: order.salesPersonId ?? '',
    status: order.status,
    subtotal: order.subtotal,
    tax_amount: order.taxAmount,
    total_amount: order.totalAmount,
    transaction_id: order.transactionId ?? '',
    updated_at: order.updatedAt.toISOString(),
    user_id: order.userId ?? '',
  };
}

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return jsonError('Authentication required.', 401);

  const orderId = request.nextUrl.searchParams.get('id');
  if (orderId) {
    const [order] = await getDatabase()
      .select()
      .from(orders)
      .where(and(eq(orders.id, orderId), eq(orders.userId, user.id)))
      .limit(1);
    if (!order) return jsonError('Order not found.', 404);

    const items = await getDatabase()
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, order.id));
    return NextResponse.json({
      items: items.map((item) => ({
        book_id: item.bookId,
        id: item.id,
        price: item.finalPrice,
        quantity: item.quantity,
        subtotal: item.subtotal,
      })),
      order: serializeOrder(order),
    });
  }

  const records = await getDatabase()
    .select()
    .from(orders)
    .where(eq(orders.userId, user.id))
    .orderBy(desc(orders.orderDate));
  return NextResponse.json({ orders: records.map(serializeOrder) });
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const user = await getCurrentUser();
    if (!user) return jsonError('Authentication required.', 401);

    const body = await readJsonObject(request);
    const paymentMethod =
      typeof body.paymentMethod === 'string' ? body.paymentMethod.slice(0, 100) : '';
    const transactionId =
      typeof body.transactionId === 'string' ? body.transactionId.slice(0, 255) : null;
    if (!paymentMethod) return jsonError('Payment method is required.', 400);

    const database = getDatabase();
    const createdOrder = await database.transaction(async (transaction) => {
      const currentItems = await transaction
        .select({ book: books, item: cartItems })
        .from(cartItems)
        .innerJoin(carts, eq(cartItems.cartId, carts.id))
        .innerJoin(books, eq(cartItems.bookId, books.id))
        .where(eq(carts.userId, user.id))
        .for('update');
      if (currentItems.length === 0) throw new Error('Cart is empty.');

      let subtotal = 0;
      for (const { book, item } of currentItems) {
        if (book.availableQuantity < item.quantity) {
          throw new Error(`${book.title} does not have enough stock.`);
        }
        const unitPrice = book.isPromotion
          ? book.listPrice * (1 - book.discountPercentage / 100)
          : book.listPrice;
        subtotal += unitPrice * item.quantity;
      }

      subtotal = currency(subtotal);
      const taxAmount = currency(subtotal * 0.13);
      const totalAmount = currency(subtotal + taxAmount);
      const [order] = await transaction
        .insert(orders)
        .values({
          customerEmail: user.email,
          paymentMethod,
          status: 'paid',
          subtotal,
          taxAmount,
          totalAmount,
          transactionId,
          userId: user.id,
        })
        .returning();

      for (const { book, item } of currentItems) {
        const unitPrice = currency(
          book.isPromotion
            ? book.listPrice * (1 - book.discountPercentage / 100)
            : book.listPrice,
        );
        await transaction.insert(orderItems).values({
          bookId: book.id,
          bookSnapshot: { ...serializeBook(book, null) },
          categoryId: book.categoryId,
          discountPercentage: book.discountPercentage,
          finalPrice: unitPrice,
          isPromotion: book.isPromotion,
          isbn13: book.isbn13,
          orderId: order.id,
          originalPrice: book.listPrice,
          quantity: item.quantity,
          status: 'paid',
          subtotal: currency(unitPrice * item.quantity),
        });
        await transaction
          .update(books)
          .set({
            availableQuantity: sql`${books.availableQuantity} - ${item.quantity}`,
            quantity: sql`${books.quantity} - ${item.quantity}`,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(books.id, book.id),
              sql`${books.availableQuantity} >= ${item.quantity}`,
            ),
          );
      }

      await transaction
        .delete(cartItems)
        .where(
          sql`${cartItems.cartId} in (select ${carts.id} from ${carts} where ${carts.userId} = ${user.id})`,
        );
      return order;
    });

    return NextResponse.json({ order: createdOrder }, { status: 201 });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : 'Unable to create order.',
      400,
    );
  }
}
