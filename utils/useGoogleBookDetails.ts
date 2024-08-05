// hooks/useGoogleBookDetails.ts

import { GoogleBook } from '@/interfaces/GoogleBook';
import { fetchBookDetails } from '@/utils/bookApi';
import { useQuery } from '@tanstack/react-query';

export const useGoogleBookDetails = (bookId: string) => {
    return useQuery<GoogleBook, Error>({
        queryKey: ['googleBookDetails', bookId],
        queryFn: () => fetchBookDetails(bookId),
    });
};