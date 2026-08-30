import { eq, sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { assertSameOrigin, jsonError, readJsonObject } from '@/auth/http';
import { getCurrentUser } from '@/auth/session';
import { serializeBook } from '@/db/book';
import { getDatabase } from '@/db/client';
import { bookCategories, books, cartItems, carts } from '@/db/schema';

async function currentCartItems(userId: string) {
  const records = await getDatabase()
    .select({ book: books, cart: carts, category: bookCategories, item: cartItems })
    .from(cartItems)
    .innerJoin(carts, eq(cartItems.cartId, carts.id))
    .innerJoin(books, eq(cartItems.bookId, books.id))
    .leftJoin(bookCategories, eq(books.categoryId, bookCategories.id))
    .where(eq(carts.userId, userId));

  return records.map(({ book, cart, category, item }) => {
    const serializedBook = serializeBook(book, category);
    return {
      book: serializedBook,
      book_id: item.bookId,
      cart_id: cart.id,
      current_price: item.currentPrice,
      discount_percentage: book.discountPercentage,
      discounted_price: book.isPromotion
        ? book.listPrice * (1 - book.discountPercentage / 100)
        : undefined,
      id: item.id,
      is_promotion: book.isPromotion,
      quantity: item.quantity,
    };
  });
}

async function cartIdForUser(userId: string) {
  const database = getDatabase();
  const [existingCart] = await database
    .select({ id: carts.id })
    .from(carts)
    .where(eq(carts.userId, userId))
    .limit(1);
  if (existingCart) return existingCart.id;

  const [createdCart] = await database
    .insert(carts)
    .values({ userId })
    .returning({ id: carts.id });
  return createdCart.id;
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ authenticated: false, items: [] });
  }

  return NextResponse.json({
    authenticated: true,
    items: await currentCartItems(user.id),
  });
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const user = await getCurrentUser();
    if (!user) return jsonError('Authentication required.', 401);

    const body = await readJsonObject(request);
    const submittedItems = Array.isArray(body.items)
      ? body.items
      : [{ book_id: body.book_id, quantity: body.quantity }];
    if (submittedItems.length < 1 || submittedItems.length > 50) {
      return jsonError('Cart update contains an invalid number of items.', 400);
    }

    const database = getDatabase();
    const cartId = await cartIdForUser(user.id);
    await database.transaction(async (transaction) => {
      for (const submittedItem of submittedItems) {
        if (!submittedItem || typeof submittedItem !== 'object') {
          throw new Error('Invalid cart item.');
        }

        const item = submittedItem as Record<string, unknown>;
        const bookId = typeof item.book_id === 'string' ? item.book_id : '';
        const quantity = Number(item.quantity ?? 1);
        if (!bookId || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
          throw new Error('Invalid cart item.');
        }

        const [book] = await transaction
          .select()
          .from(books)
          .where(eq(books.id, bookId))
          .limit(1)
          .for('update');
        if (!book || book.availableQuantity < quantity) {
          throw new Error('Requested book is unavailable.');
        }

        const currentPrice = book.isPromotion
          ? book.listPrice * (1 - book.discountPercentage / 100)
          : book.listPrice;
        const updatedItems = await transaction
          .insert(cartItems)
          .values({ bookId, cartId, currentPrice, quantity })
          .onConflictDoUpdate({
            set: {
              currentPrice,
              quantity: sql`${cartItems.quantity} + ${quantity}`,
              updatedAt: new Date(),
            },
            setWhere: sql`${cartItems.quantity} + ${quantity} <= ${book.availableQuantity}`,
            target: [cartItems.cartId, cartItems.bookId],
          })
          .returning({ id: cartItems.id });
        if (updatedItems.length !== 1) {
          throw new Error('Requested quantity exceeds available inventory.');
        }
      }
    });

    return NextResponse.json({ items: await currentCartItems(user.id) });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : 'Unable to update cart.',
      400,
    );
  }
}

export async function PATCH(request: Request) {
  try {
    assertSameOrigin(request);
    const user = await getCurrentUser();
    if (!user) return jsonError('Authentication required.', 401);

    const body = await readJsonObject(request);
    const bookId = typeof body.book_id === 'string' ? body.book_id : '';
    const quantity = Number(body.quantity);
    if (!bookId || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
      return jsonError('Invalid cart quantity.', 400);
    }

    const database = getDatabase();
    const cartId = await cartIdForUser(user.id);
    await database.transaction(async (transaction) => {
      const [book] = await transaction
        .select({ availableQuantity: books.availableQuantity })
        .from(books)
        .where(eq(books.id, bookId))
        .limit(1)
        .for('update');
      if (!book || book.availableQuantity < quantity) {
        throw new Error('Requested quantity exceeds available inventory.');
      }

      await transaction
        .update(cartItems)
        .set({ quantity, updatedAt: new Date() })
        .where(
          sql`${cartItems.cartId} = ${cartId} and ${cartItems.bookId} = ${bookId}`,
        );
    });
    return NextResponse.json({ items: await currentCartItems(user.id) });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : 'Unable to update cart.',
      400,
    );
  }
}

export async function DELETE(request: Request) {
  try {
    assertSameOrigin(request);
    const user = await getCurrentUser();
    if (!user) return jsonError('Authentication required.', 401);

    const body = await readJsonObject(request);
    const bookId = typeof body.book_id === 'string' ? body.book_id : '';
    if (!bookId) return jsonError('Book id is required.', 400);

    const cartId = await cartIdForUser(user.id);
    await getDatabase()
      .delete(cartItems)
      .where(sql`${cartItems.cartId} = ${cartId} and ${cartItems.bookId} = ${bookId}`);
    return NextResponse.json({ items: await currentCartItems(user.id) });
  } catch {
    return jsonError('Unable to remove cart item.', 500);
  }
}
