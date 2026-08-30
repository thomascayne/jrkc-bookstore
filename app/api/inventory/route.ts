import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { assertSameOrigin, jsonError, readJsonObject } from '@/auth/http';
import { getCurrentUser } from '@/auth/session';
import { hasAnyRole } from '@/auth/authorization';
import { serializeBook } from '@/db/book';
import { getDatabase } from '@/db/client';
import { bookCategories, books } from '@/db/schema';
import { ROLES } from '@/utils/roles';

const inventoryRoles = [
  ROLES.ADMIN,
  ROLES.STORE_MANAGER,
  ROLES.INVENTORY_MANAGER,
] as const;

async function authorizedUser() {
  const user = await getCurrentUser();
  return user && hasAnyRole(user, inventoryRoles) ? user : null;
}

export async function GET() {
  if (!(await authorizedUser())) {
    return jsonError('Inventory access required.', 403);
  }

  const records = await getDatabase()
    .select({ book: books, category: bookCategories })
    .from(books)
    .leftJoin(bookCategories, eq(books.categoryId, bookCategories.id));

  return NextResponse.json({
    inventory: records.map(({ book, category }) => serializeBook(book, category)),
  });
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    if (!(await authorizedUser())) {
      return jsonError('Inventory access required.', 403);
    }

    const body = await readJsonObject(request);
    const id = typeof body.book_id === 'string' ? body.book_id.trim() : '';
    const title = typeof body.title === 'string' ? body.title.trim() : '';
    const quantity = Number(body.quantity);
    const price = Number(body.price);
    const categoryId = Number(body.category_id);
    if (
      !id ||
      !title ||
      !Number.isInteger(quantity) ||
      quantity < 0 ||
      !Number.isFinite(price) ||
      price < 0 ||
      !Number.isInteger(categoryId)
    ) {
      return jsonError('Invalid inventory item.', 400);
    }

    const [book] = await getDatabase()
      .insert(books)
      .values({
        availableQuantity: quantity,
        categoryId,
        id,
        price,
        quantity,
        title,
      })
      .returning();
    return NextResponse.json({ book }, { status: 201 });
  } catch {
    return jsonError('Unable to add inventory item.', 500);
  }
}

export async function PATCH(request: Request) {
  try {
    assertSameOrigin(request);
    if (!(await authorizedUser())) {
      return jsonError('Inventory access required.', 403);
    }

    const body = await readJsonObject(request);
    const id = typeof body.id === 'string' ? body.id : '';
    if (!id) return jsonError('Book id is required.', 400);

    const updates: { availableQuantity?: number; price?: number; quantity?: number; updatedAt: Date } = {
      updatedAt: new Date(),
    };
    if ('quantity' in body) {
      const quantity = Number(body.quantity);
      if (!Number.isInteger(quantity) || quantity < 0) {
        return jsonError('Quantity must be a non-negative integer.', 400);
      }
      updates.availableQuantity = quantity;
      updates.quantity = quantity;
    }
    if ('price' in body) {
      const price = Number(body.price);
      if (!Number.isFinite(price) || price < 0) {
        return jsonError('Price must be non-negative.', 400);
      }
      updates.price = price;
    }

    const [book] = await getDatabase()
      .update(books)
      .set(updates)
      .where(eq(books.id, id))
      .returning();
    return NextResponse.json({ book });
  } catch {
    return jsonError('Unable to update inventory item.', 500);
  }
}
