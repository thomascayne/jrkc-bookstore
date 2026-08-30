import {
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  gt,
  ilike,
  lt,
  lte,
  or,
} from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

import { fetchGoogleBook, fetchGoogleCatalog } from '@/catalog/google-books';
import { serializeBook } from '@/db/book';
import { getDatabase } from '@/db/client';
import { bookCategories, books } from '@/db/schema';
import { exactRatingRange } from '@/utils/catalogFilters';

function optionalNumber(value: string | null) {
  if (value === null || value.trim() === '') return null;
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : null;
}

async function databaseBook(bookId: string) {
  const database = getDatabase();
  const [record] = await database
    .select({ book: books, category: bookCategories })
    .from(books)
    .leftJoin(bookCategories, eq(books.categoryId, bookCategories.id))
    .where(eq(books.id, bookId))
    .limit(1);
  return record ? serializeBook(record.book, record.category) : null;
}

async function databaseCatalog(parameters: URLSearchParams) {
  const database = getDatabase();
  const [inventoryTotal] = await database
    .select({ value: count() })
    .from(books);
  if (inventoryTotal.value < 1) return null;

  const page = Math.max(1, optionalNumber(parameters.get('page')) ?? 1);
  const requestedLimit = optionalNumber(parameters.get('limit')) ?? 20;
  const limit = Math.min(100, Math.max(1, requestedLimit));
  const conditions = [];
  const categoryKey = parameters.get('category');
  const search = parameters.get('search')?.trim();
  const author = parameters.get('author')?.trim();
  const minimumDiscount = optionalNumber(parameters.get('discountMin'));
  const minimumPrice = optionalNumber(parameters.get('priceMin'));
  const maximumPrice = optionalNumber(parameters.get('priceMax'));
  const minimumRating = optionalNumber(parameters.get('ratingMin'));
  const ratingRange = exactRatingRange(minimumRating);
  const minimumRatingsCount = optionalNumber(parameters.get('ratingsCountMin'));

  if (categoryKey && categoryKey !== 'all') {
    conditions.push(eq(bookCategories.key, categoryKey));
  }
  if (search) {
    conditions.push(
      or(
        ilike(books.title, `%${search}%`),
        ilike(books.authors, `%${search}%`),
      )!,
    );
  }
  if (author) conditions.push(ilike(books.authors, `%${author}%`));
  if (minimumDiscount !== null) {
    conditions.push(gte(books.discountPercentage, minimumDiscount));
  }
  if (parameters.get('inStock') === 'true') {
    conditions.push(gt(books.availableQuantity, 0));
  }
  if (minimumPrice !== null) conditions.push(gte(books.price, minimumPrice));
  if (maximumPrice !== null) conditions.push(lte(books.price, maximumPrice));
  if (ratingRange) {
    conditions.push(gte(books.averageRating, ratingRange.minimum));
    if (ratingRange.maximumExclusive !== undefined) {
      conditions.push(lt(books.averageRating, ratingRange.maximumExclusive));
    }
  }
  if (minimumRatingsCount !== null) {
    conditions.push(gte(books.ratingsCount, minimumRatingsCount));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;
  const sortDirection = parameters.get('sortOrder') === 'ASC' ? asc : desc;
  const sortColumn =
    parameters.get('sortBy') === 'price'
      ? books.price
      : parameters.get('sortBy') === 'discount_percentage'
        ? books.discountPercentage
        : books.averageRating;
  const records = await database
    .select({ book: books, category: bookCategories })
    .from(books)
    .leftJoin(bookCategories, eq(books.categoryId, bookCategories.id))
    .where(where)
    .orderBy(sortDirection(sortColumn), asc(books.id))
    .limit(limit)
    .offset((page - 1) * limit);
  const [total] = await database
    .select({ value: count() })
    .from(books)
    .leftJoin(bookCategories, eq(books.categoryId, bookCategories.id))
    .where(where);

  return {
    books: records.map(({ book, category }) => serializeBook(book, category)),
    category: categoryKey || 'all',
    source: 'database',
    totalBooks: total.value,
  };
}

export async function GET(request: NextRequest) {
  const parameters = request.nextUrl.searchParams;
  const bookId = parameters.get('id');

  if (bookId) {
    try {
      const book = await databaseBook(bookId);
      if (book) return NextResponse.json({ book, source: 'database' });
    } catch {
      // A Google Books result can still serve the public details page.
    }

    try {
      return NextResponse.json({
        book: await fetchGoogleBook(bookId),
        source: 'google',
      });
    } catch {
      return NextResponse.json({ book: null, source: 'unavailable' });
    }
  }

  try {
    const inventoryCatalog = await databaseCatalog(parameters);
    if (inventoryCatalog) return NextResponse.json(inventoryCatalog);
  } catch {
    // Public browsing falls back without writing to the inventory database.
  }

  const page = Math.max(1, optionalNumber(parameters.get('page')) ?? 1);
  const requestedLimit = optionalNumber(parameters.get('limit')) ?? 20;
  const pageSize = Math.min(40, Math.max(1, requestedLimit));
  const sortBy = parameters.get('sortBy');

  try {
    const catalog = await fetchGoogleCatalog({
      author: parameters.get('author')?.trim(),
      categoryKey: parameters.get('category') ?? 'all',
      inStock: parameters.get('inStock') === 'true',
      minimumDiscount: optionalNumber(parameters.get('discountMin')),
      maximumPrice: optionalNumber(parameters.get('priceMax')),
      minimumPrice: optionalNumber(parameters.get('priceMin')),
      minimumRating: optionalNumber(parameters.get('ratingMin')),
      minimumRatingsCount: optionalNumber(parameters.get('ratingsCountMin')),
      page,
      pageSize,
      search: parameters.get('search')?.trim(),
      sortBy:
        sortBy === 'price' || sortBy === 'discount_percentage'
          ? sortBy
          : 'average_rating',
      sortOrder: parameters.get('sortOrder') === 'ASC' ? 'ASC' : 'DESC',
    });
    return NextResponse.json({
      ...catalog,
      category: parameters.get('category') ?? 'all',
      source: 'google',
    });
  } catch {
    return NextResponse.json(
      {
        books: [],
        category: parameters.get('category') ?? 'all',
        error: 'The public book catalog is temporarily unavailable.',
        source: 'unavailable',
        totalBooks: 0,
      },
      { status: 503 },
    );
  }
}
