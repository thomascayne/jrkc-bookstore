// hooks/useBookDetails.ts


import { GoogleBook } from '@/interfaces/GoogleBook';
import { IBook } from '@/interfaces/IBook';
import { fetchBookDetails } from '@/utils/bookApi';
import { fetchBookFromSupabase } from '@/utils/bookFromSupabaseApi';
import { useQuery } from '@tanstack/react-query';

export const useBookDetails = (bookId: string) => {
    return useQuery<{ supabaseBook: IBook; googleBook: GoogleBook }, Error>({
        queryKey: ['bookDetails', bookId],
        queryFn: async () => {
            const supabaseBook = await fetchBookFromSupabase<IBook>(bookId);
            const googleBook = await fetchBookDetails<GoogleBook>(bookId);
            return { supabaseBook, googleBook };
        },
    });
};