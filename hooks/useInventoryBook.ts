import { useQuery } from '@tanstack/react-query';

import { fetchInventoryBook } from '@/utils/bookApi';

export const useInventoryBook = (bookId: string) =>
  useQuery({
    queryFn: () => fetchInventoryBook(bookId),
    queryKey: ['inventoryBook', bookId],
  });
