import 'server-only';

import type { BookCategory } from '@/interfaces/BookCategory';
import type { GoogleBook } from '@/interfaces/GoogleBook';
import type { IBookInventory } from '@/interfaces/IBookInventory';
import { bookCategories } from '@/utils/bookCategories';
import { createGoogleBooksUrl } from '@/utils/googleBooks';

interface CatalogFilters {
  author?: string;
  categoryKey?: string;
  maximumPrice?: number | null;
  minimumPrice?: number | null;
  minimumRating?: number | null;
  minimumRatingsCount?: number | null;
  page: number;
  pageSize: number;
  search?: string;
  sortBy?: 'average_rating' | 'discount_percentage' | 'price';
  sortOrder?: 'ASC' | 'DESC';
}

interface GoogleBooksResponse {
  items?: GoogleBook[];
  totalItems?: number;
}

const defaultCatalogPrice = 19.99;
const maximumCatalogResults = 400;

function secureImageUrl(imageUrl?: string) {
  return imageUrl?.replace(/^http:\/\//, 'https://') ?? '';
}

function categoryForVolume(volume: GoogleBook, requestedCategoryKey?: string) {
  const requestedCategory = bookCategories.find(
    (category) => category.key === requestedCategoryKey,
  );
  if (requestedCategory) return requestedCategory;

  const googleCategory = volume.volumeInfo.categories?.[0]?.toLowerCase() ?? '';
  return (
    bookCategories.find((category) =>
      googleCategory.includes(category.label.toLowerCase()),
    ) ?? bookCategories.find((category) => category.key === 'fiction')!
  );
}

function identifier(volume: GoogleBook, type: string) {
  return (
    volume.volumeInfo.industryIdentifiers?.find(
      (industryIdentifier) => industryIdentifier.type === type,
    )?.identifier ?? ''
  );
}

function catalogPrice(volume: GoogleBook) {
  return (
    volume.saleInfo?.listPrice?.amount ??
    volume.saleInfo?.retailPrice?.amount ??
    defaultCatalogPrice
  );
}

function serializeGoogleBook(
  volume: GoogleBook,
  requestedCategoryKey?: string,
): IBookInventory {
  const category = categoryForVolume(volume, requestedCategoryKey);
  const listPrice = catalogPrice(volume);
  const retailPrice = volume.saleInfo?.retailPrice?.amount ?? listPrice;

  return {
    authors: volume.volumeInfo.authors?.join(', ') ?? 'Unknown author',
    available_quantity: 10,
    average_rating: volume.volumeInfo.averageRating ?? 0,
    catalog_source: 'google',
    category,
    category_id_check: category.id,
    category_label_check: category.label,
    categoryId: category.id,
    description: volume.volumeInfo.description ?? '',
    discount_percentage: 0,
    etag: volume.etag,
    id: volume.id,
    is_featured: false,
    is_promotion: false,
    isbn10: identifier(volume, 'ISBN_10'),
    isbn13: identifier(volume, 'ISBN_13'),
    language: volume.volumeInfo.language ?? 'en',
    list_price: listPrice,
    page_count: volume.volumeInfo.pageCount ?? 0,
    price: retailPrice,
    published_date: volume.volumeInfo.publishedDate ?? '',
    publisher: volume.volumeInfo.publisher ?? '',
    quantity: 10,
    ratings_count: volume.volumeInfo.ratingsCount ?? 0,
    retail_price: retailPrice,
    section: category.label,
    self_link: volume.selfLink,
    shelf: 'Online catalog',
    small_thumbnail_image_link: secureImageUrl(
      volume.volumeInfo.imageLinks?.smallThumbnail,
    ),
    subtitle: volume.volumeInfo.subtitle ?? '',
    thumbnail_image_link: secureImageUrl(
      volume.volumeInfo.imageLinks?.thumbnail,
    ),
    title: volume.volumeInfo.title,
  };
}

function googleSearchQuery(filters: CatalogFilters) {
  const searchTerms = [];
  if (filters.search) searchTerms.push(filters.search);
  if (filters.author) searchTerms.push(`inauthor:${filters.author}`);
  if (filters.categoryKey && filters.categoryKey !== 'all') {
    searchTerms.push(`subject:${filters.categoryKey.replaceAll('-', ' ')}`);
  }
  return searchTerms.join(' ') || 'subject:fiction';
}

function filterAndSortBooks(books: IBookInventory[], filters: CatalogFilters) {
  const filteredBooks = books.filter((book) => {
    if (filters.minimumPrice !== null && filters.minimumPrice !== undefined) {
      if (book.price < filters.minimumPrice) return false;
    }
    if (filters.maximumPrice !== null && filters.maximumPrice !== undefined) {
      if (book.price > filters.maximumPrice) return false;
    }
    if (filters.minimumRating !== null && filters.minimumRating !== undefined) {
      if (book.average_rating < filters.minimumRating) return false;
    }
    if (
      filters.minimumRatingsCount !== null &&
      filters.minimumRatingsCount !== undefined
    ) {
      if (book.ratings_count < filters.minimumRatingsCount) return false;
    }
    return true;
  });

  const sortProperty =
    filters.sortBy === 'price'
      ? 'price'
      : filters.sortBy === 'discount_percentage'
        ? 'discount_percentage'
        : 'average_rating';
  const sortMultiplier = filters.sortOrder === 'ASC' ? 1 : -1;
  return filteredBooks.sort(
    (firstBook, secondBook) =>
      (firstBook[sortProperty] - secondBook[sortProperty]) * sortMultiplier,
  );
}

async function getGoogleBooksResponse(requestUrl: string) {
  const response = await fetch(requestUrl, {
    next: { revalidate: 3_600 },
    signal: AbortSignal.timeout(8_000),
  });
  if (!response.ok) {
    throw new Error(`Google Books returned HTTP ${response.status}.`);
  }
  return (await response.json()) as GoogleBooksResponse;
}

export async function fetchGoogleBook(bookId: string) {
  const response = await fetch(createGoogleBooksUrl(bookId), {
    next: { revalidate: 86_400 },
    signal: AbortSignal.timeout(8_000),
  });
  if (!response.ok) return null;
  return serializeGoogleBook((await response.json()) as GoogleBook);
}

export async function fetchGoogleCatalog(filters: CatalogFilters) {
  const startIndex = (filters.page - 1) * filters.pageSize;
  const requestUrl = createGoogleBooksUrl('', {
    langRestrict: 'en',
    maxResults: Math.min(40, filters.pageSize),
    printType: 'books',
    projection: 'full',
    q: googleSearchQuery(filters),
    startIndex,
  });
  const response = await getGoogleBooksResponse(requestUrl);
  const books = filterAndSortBooks(
    (response.items ?? []).map((volume) =>
      serializeGoogleBook(volume, filters.categoryKey),
    ),
    filters,
  );

  return {
    books,
    totalBooks: Math.min(response.totalItems ?? books.length, maximumCatalogResults),
  };
}

export function fallbackCategories(): BookCategory[] {
  return bookCategories.map((category) => ({
    ...category,
    show_on_landing_page: true,
  }));
}
