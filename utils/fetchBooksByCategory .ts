// utils/fetchBooksByCategory.ts

import { IBookInventory } from '@/interfaces/IBookInventory';
import { createClient } from '@/utils/supabase/client';

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
  const supabase = createClient();

  try {
    // Fetch the category ID if a category key is provided
    let categoryId = null;
    if (categoryKey !== 'all') {
      const { data: category, error: categoryError } = await supabase
        .from('book_categories')
        .select('id')
        .eq('key', categoryKey)
        .single();

      if (categoryError) throw categoryError;
      categoryId = category.id;
    }

    const { data: books, count, error: booksError } = await supabase.rpc('get_books_by_category', {
      author_filter: filters.author,
      category_id_filter: categoryId,
      discount_percentage_min: filters.discount_percentage_min,
      in_stock_filter: filters.in_stock,
      limit: booksPerPage,
      offset: (page - 1) * booksPerPage,
      price_max: filters.price?.max,
      price_min: filters.price?.min,
      rating_min: filters.rating_min,
      ratings_count_min: filters.ratings_count_min,
      search_query: searchQuery,
      sort_by: filters.sort_by || 'average_rating',
      sort_order: filters.sort_order || 'DESC'
    });

    if (booksError) throw booksError;

    return {
      category: categoryKey,
      totalBooks: count || 0,
      books: books as IBookInventory[],
      isLoading: false,
      error: null,
    };
  } catch (error) {
    console.error('fetchBooksByCategory - Error:', error);
    return {
      category: '',
      totalBooks: 0,
      books: [],
      isLoading: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred',
    };
  }
}