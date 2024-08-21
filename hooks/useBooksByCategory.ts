import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { fetchBooksByCategory, FilterOptions } from '@/utils/fetchBooksByCategory ';

export const useBooksByCategory = (
  booksPerPage: number,
  categoryKey: string | null,
  filters: FilterOptions = {},
  page: number,
  searchQuery: string
) => {
  const queryClient = useQueryClient();
  const queryKey = ['books', categoryKey, booksPerPage, filters, page, searchQuery];

  const query = useQuery({
    queryKey,
    queryFn: () => fetchBooksByCategory(booksPerPage, categoryKey, filters, page, searchQuery),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const totalBooks = query.data?.totalBooks || 0;
  const totalPages = useMemo(() => Math.ceil(totalBooks / booksPerPage), [totalBooks, booksPerPage]);

  const prefetchNextPage = useCallback(() => {
    if (page < totalPages) {
      const nextPage = page + 1;
      const nextPageQueryKey = ['books', categoryKey, booksPerPage, filters, nextPage, searchQuery];
      queryClient.prefetchQuery({
        queryKey: nextPageQueryKey,
        queryFn: () => fetchBooksByCategory(booksPerPage, categoryKey, filters, nextPage, searchQuery),
        staleTime: 5 * 60 * 1000, // 5 minutes
      });
    }
  }, [page, totalPages, categoryKey, booksPerPage, filters, searchQuery, queryClient]);

  return {
    category: query.data?.category || '',
    displayedBooks: query.data?.books || [],
    error: query.error,
    isFetching: query.isFetching,
    isLoading: query.isLoading,
    prefetchNextPage,
    totalBooks,
    totalPages,
  };
};