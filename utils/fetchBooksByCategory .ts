import type { IBookInventory } from '@/interfaces/IBookInventory';
import { apiRequest } from '@/utils/apiClient';

export interface FilterOptions {
  author?: string;
  discount_percentage_min?: number;
  in_stock?: boolean;
  price?: { min?: number; max?: number };
  rating_min?: number;
  ratings_count_min?: number;
  sort_by?: 'discount_percentage' | 'price' | 'average_rating';
  sort_order?: 'ASC' | 'DESC';
}

export async function fetchBooksByCategory(
  booksPerPage: number,
  categoryKey: string | null,
  filters: FilterOptions = {},
  page: number,
  searchQuery: string,
) {
  const parameters = new URLSearchParams({
    category: categoryKey || 'all',
    limit: String(booksPerPage),
    page: String(page),
    search: searchQuery,
    sortBy: filters.sort_by || 'average_rating',
    sortOrder: filters.sort_order || 'DESC',
  });
  const optionalParameters: Array<[string, string | number | boolean | undefined]> = [
    ['author', filters.author],
    ['discountMin', filters.discount_percentage_min],
    ['inStock', filters.in_stock],
    ['priceMax', filters.price?.max],
    ['priceMin', filters.price?.min],
    ['ratingMin', filters.rating_min],
    ['ratingsCountMin', filters.ratings_count_min],
  ];

  for (const [key, value] of optionalParameters) {
    if (value !== undefined) parameters.set(key, String(value));
  }

  return apiRequest<{
    books: IBookInventory[];
    category: string;
    totalBooks: number;
  }>(`/api/books?${parameters.toString()}`);
}
