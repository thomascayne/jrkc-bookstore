import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { IBookInventory } from '@/interfaces/IBookInventory';
import { fetchBooksByCategory, FilterOptions } from '@/utils/fetchBooksByCategory ';

export const useBooksByCategory = (
  booksPerPage: number,
  categoryKey: string | null,
  filters: FilterOptions = {},
  page: number,
  searchQuery: string
) => {
  const queryClient = useQueryClient();
  const [currentBooks, setCurrentBooks] = useState<IBookInventory[]>([]);
  const queryKey = ['books', categoryKey, booksPerPage, filters, page, searchQuery];

  const query = useQuery({
    queryKey,
    queryFn: () => fetchBooksByCategory(booksPerPage, categoryKey, filters, page, searchQuery),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  useEffect(() => {
    if (query.data?.books) {
      setCurrentBooks(query.data.books);
    }
  }, [query.data]);

  const refetch = async () => {
    await queryClient.invalidateQueries({ queryKey });
    return query.refetch();
  };

  console.log("useBooksByCategory hook - totalBooks:", query.data?.totalBooks, "totalPages:", query.data?.totalPages);

  return {
    category: query.data?.category || '',
    displayedBooks: currentBooks,
    totalBooks: query.data?.totalBooks || 0,
    isLoading: query.isLoading,
    error: query.error,
    isFetching: query.isFetching,
    refetch,
  };
};