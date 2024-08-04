// hooks/useBookFromSupabase.ts

import { IBook } from '@/interfaces/IBook';
import { fetchBookFromSupabase } from '@/utils/bookFromSupabaseApi';
import { useQuery } from '@tanstack/react-query';

export const useBookFromSupabase = (bookId: string) => {
    return useQuery<IBook, Error>({
        queryKey: ['bookFromSupabase', bookId],
        queryFn: () => fetchBookFromSupabase(bookId),
    });
};