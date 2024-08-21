// hooks/useBookDetails.ts


import { GoogleBook } from '@/interfaces/GoogleBook';
import { IBookInventory } from '@/interfaces/IBookInventory';
import { fetchBookDetails } from '@/utils/bookApi';
import { fetchBookFromSupabase } from '@/utils/bookFromSupabaseApi';
import { useQuery } from '@tanstack/react-query';

export const useBookDetails = (bookId: string) => {
    return useQuery<{ supabaseBook: IBookInventory; googleBook: GoogleBook }, Error>({
        queryKey: ['bookDetails', bookId],
        queryFn: async () => {
            const supabaseBook = await fetchBookFromSupabase<IBookInventory>(bookId);
            const googleBook = await fetchBookDetails<GoogleBook>(bookId);
            return { supabaseBook, googleBook };
        },
    });
};