// hooks/useBookFromSupabase.ts

import { IBookInventory } from '@/interfaces/IBookInventory';
import { fetchBookFromSupabase } from '@/utils/bookFromSupabaseApi';
import { useQuery } from '@tanstack/react-query';

export const useBookFromSupabase = (bookId: string) => {
    return useQuery<IBookInventory, Error>({
        queryKey: ['bookFromSupabase', bookId],
        queryFn: () => fetchBookFromSupabase(bookId),
    });
};