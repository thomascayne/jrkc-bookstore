import { asc, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { fallbackCategories } from '@/catalog/google-books';
import { serializeCategory } from '@/db/book';
import { getDatabase } from '@/db/client';
import { bookCategories } from '@/db/schema';

export async function GET() {
  try {
    const categories = await getDatabase()
      .select()
      .from(bookCategories)
      .where(eq(bookCategories.show, true))
      .orderBy(asc(bookCategories.key));

    if (categories.length > 0) {
      return NextResponse.json({
        categories: categories.map(serializeCategory),
        source: 'database',
      });
    }
  } catch {
    // The public catalog remains available while PostgreSQL is offline.
  }

  return NextResponse.json({
    categories: fallbackCategories(),
    source: 'bundled',
  });
}
