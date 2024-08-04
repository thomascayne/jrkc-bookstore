// hooks/useBooksByCategory.ts

import { fetchBooksByCategory } from '@/utils/fetchBooksByCategory ';
import { useQuery } from '@tanstack/react-query';

export const useBooksByCategory = (categoryKey: string, booksPerLoad: number) => {
    return useQuery({
        queryKey: ['booksByCategory', categoryKey, booksPerLoad],
        queryFn: () => fetchBooksByCategory(categoryKey, booksPerLoad),
    });
};