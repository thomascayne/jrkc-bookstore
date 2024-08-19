// hooks/useBooksByCategory.ts

import { useQuery } from '@tanstack/react-query';
import { fetchBooksByCategory } from '@/utils/fetchBooksByCategory ';

export interface SearchFilterOptions {
  author?: string;
  discounted?: boolean;
  inStock?: boolean;
  price?: { min?: number; max?: number };
  quantity?: { min?: number; max?: number };
  percentage?: boolean;
  rating?: boolean;
  title?: string;
}

export const useBooksByCategory = (
  booksPerPage: number,
  categoryKey: string | null,
  filters: SearchFilterOptions = {},
  page: number,
  searchQuery: string
) => {
  const query = useQuery({
    queryKey: ['books', categoryKey, booksPerPage, filters, page, searchQuery],
    queryFn: () => fetchBooksByCategory(booksPerPage, categoryKey, filters, page, searchQuery),
    select: (data) => ({
      ...data,
      displayedBooks: data.books.slice((page - 1) * booksPerPage, page * booksPerPage),
    }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    category: query.data?.category || '',
    displayedBooks: query.data?.displayedBooks || [],
    error: query.error,
    isFetching: query.isFetching,
    isLoading: query.isLoading,
    totalBooks: query.data?.totalBooks || 0,
  };
};