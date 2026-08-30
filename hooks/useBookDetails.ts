// hooks/useBookDetails.ts


import { GoogleBook } from '@/interfaces/GoogleBook';
import { IBookInventory } from '@/interfaces/IBookInventory';
import { fetchBookDetails, fetchInventoryBook } from '@/utils/bookApi';
import { useQuery } from '@tanstack/react-query';

export const useBookDetails = (bookId: string) => {
    return useQuery<{ inventoryBook: IBookInventory | null; googleBook: GoogleBook }, Error>({
        queryKey: ['bookDetails', bookId],
        queryFn: async () => {
            const inventoryBook = await fetchInventoryBook(bookId);
            const googleBook = await fetchBookDetails<GoogleBook>(bookId);
            return { inventoryBook, googleBook };
        },
    });
};
