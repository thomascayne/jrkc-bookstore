// utils/fetchBooksByCategory.ts

import { BookCategory } from '@/interfaces/BookCategory';
import { IBookInventory } from '@/interfaces/IBookInventory';
import { createClient } from '@/utils/supabase/client';

interface FilterOptions {
  author?: string;
  discounted?: boolean;
  inStock?: boolean;
  price?: { min?: number; max?: number };
  quantity?: { min?: number; max?: number };
  percentage?: boolean;
  rating?: boolean;
  title?: string;
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
      category_filter: null, 
      category_id_filter: categoryId,
      discounted_filter: filters.discounted,
      in_stock_filter: filters.inStock,
      limit: booksPerPage,
      offset: (page - 1) * booksPerPage,
      percentage_filter: filters.percentage,
      price_min: filters.price?.min,
      price_max: filters.price?.max,
      quantity_min: filters.quantity?.min,
      quantity_max: filters.quantity?.max,
      rating_filter: filters.rating,
      search_query: searchQuery,
      title_filter: filters.title,
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