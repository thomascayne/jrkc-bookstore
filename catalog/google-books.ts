import 'server-only';

import type { BookCategory } from '@/interfaces/BookCategory';
import type { GoogleBook } from '@/interfaces/GoogleBook';
import type { IBookInventory } from '@/interfaces/IBookInventory';
import { bookCategories } from '@/utils/bookCategories';
import { matchesExactRating } from '@/utils/catalogFilters';
import { createGoogleBooksUrl } from '@/utils/googleBooks';

interface CatalogFilters {
  author?: string;
  categoryKey?: string;
  inStock?: boolean;
  minimumDiscount?: number | null;
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

const catalogBatchSize = 40;
const demoDiscountPercentages = [0, 10, 20, 30, 40, 50, 60, 70, 80];
const maximumCatalogResults = 120;

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

function currency(value: number) {
  return Math.round(value * 100) / 100;
}

function stableCatalogSeed(value: string) {
  return Array.from(value).reduce(
    (seed, character) => (seed * 31 + character.charCodeAt(0)) >>> 0,
    17,
  );
}

function commerceData(volume: GoogleBook) {
  const seed = stableCatalogSeed(volume.id);
  const googleListPrice = volume.saleInfo?.listPrice?.amount;
  const googleRetailPrice = volume.saleInfo?.retailPrice?.amount;
  const listPrice = currency(
    googleListPrice ?? googleRetailPrice ?? 9.99 + (seed % 9_000) / 100,
  );
  const googleDiscount =
    googleListPrice && googleRetailPrice && googleRetailPrice < googleListPrice
      ? Math.round((1 - googleRetailPrice / googleListPrice) * 100)
      : null;
  const discountPercentage =
    googleDiscount ??
    demoDiscountPercentages[seed % demoDiscountPercentages.length];
  const retailPrice = currency(
    googleRetailPrice ?? listPrice * (1 - discountPercentage / 100),
  );
  const isAvailable = volume.saleInfo?.saleability !== 'NOT_FOR_SALE';
  const quantity = isAvailable && seed % 5 !== 0 ? 1 + (seed % 20) : 0;

  return {
    averageRating: volume.volumeInfo.averageRating ?? 1 + (seed % 9) * 0.5,
    discountPercentage,
    listPrice,
    quantity,
    ratingsCount: volume.volumeInfo.ratingsCount ?? 10 + (seed % 2_000),
    retailPrice,
  };
}

function serializeGoogleBook(
  volume: GoogleBook,
  requestedCategoryKey?: string,
): IBookInventory {
  const category = categoryForVolume(volume, requestedCategoryKey);
  const commerce = commerceData(volume);

  return {
    authors: volume.volumeInfo.authors?.join(', ') ?? 'Unknown author',
    available_quantity: commerce.quantity,
    average_rating: commerce.averageRating,
    catalog_source: 'google',
    category,
    category_id_check: category.id,
    category_label_check: category.label,
    categoryId: category.id,
    description: volume.volumeInfo.description ?? '',
    discount_percentage: commerce.discountPercentage,
    etag: volume.etag,
    id: volume.id,
    is_featured: false,
    is_promotion: commerce.discountPercentage > 0,
    isbn10: identifier(volume, 'ISBN_10'),
    isbn13: identifier(volume, 'ISBN_13'),
    language: volume.volumeInfo.language ?? 'en',
    list_price: commerce.listPrice,
    page_count: volume.volumeInfo.pageCount ?? 0,
    price: commerce.retailPrice,
    published_date: volume.volumeInfo.publishedDate ?? '',
    publisher: volume.volumeInfo.publisher ?? '',
    quantity: commerce.quantity,
    ratings_count: commerce.ratingsCount,
    retail_price: commerce.retailPrice,
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
    if (filters.inStock && book.available_quantity < 1) return false;
    if (
      filters.minimumDiscount !== null &&
      filters.minimumDiscount !== undefined &&
      book.discount_percentage < filters.minimumDiscount
    ) {
      return false;
    }
    if (filters.minimumPrice !== null && filters.minimumPrice !== undefined) {
      if (book.price < filters.minimumPrice) return false;
    }
    if (filters.maximumPrice !== null && filters.maximumPrice !== undefined) {
      if (book.price > filters.maximumPrice) return false;
    }
    if (!matchesExactRating(book.average_rating, filters.minimumRating))
      return false;
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
  return filteredBooks.sort((firstBook, secondBook) => {
    const comparison =
      (firstBook[sortProperty] - secondBook[sortProperty]) * sortMultiplier;
    return comparison || firstBook.title.localeCompare(secondBook.title);
  });
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
  const createCatalogRequestUrl = (startIndex: number) =>
    createGoogleBooksUrl('', {
      langRestrict: 'en',
      maxResults: catalogBatchSize,
      printType: 'books',
      projection: 'full',
      q: googleSearchQuery(filters),
      startIndex,
    });
  const firstResponse = await getGoogleBooksResponse(
    createCatalogRequestUrl(0),
  );
  const availableResults = Math.min(
    firstResponse.totalItems ?? firstResponse.items?.length ?? 0,
    maximumCatalogResults,
  );
  const batchCount = Math.max(
    1,
    Math.ceil(availableResults / catalogBatchSize),
  );
  const remainingResponses = await Promise.allSettled(
    Array.from({ length: batchCount - 1 }, (_, batchIndex) =>
      getGoogleBooksResponse(
        createCatalogRequestUrl((batchIndex + 1) * catalogBatchSize),
      ),
    ),
  );
  const responses = [
    firstResponse,
    ...remainingResponses.flatMap((response) =>
      response.status === 'fulfilled' ? [response.value] : [],
    ),
  ];
  const uniqueVolumes = new Map<string, GoogleBook>();
  for (const response of responses) {
    for (const volume of response.items ?? [])
      uniqueVolumes.set(volume.id, volume);
  }
  const filteredBooks = filterAndSortBooks(
    Array.from(uniqueVolumes.values()).map((volume) =>
      serializeGoogleBook(volume, filters.categoryKey),
    ),
    filters,
  );
  const startIndex = (filters.page - 1) * filters.pageSize;

  return {
    books: filteredBooks.slice(startIndex, startIndex + filters.pageSize),
    totalBooks: filteredBooks.length,
  };
}

export function fallbackCategories(): BookCategory[] {
  return bookCategories.map((category) => ({
    ...category,
    show_on_landing_page: true,
  }));
}
