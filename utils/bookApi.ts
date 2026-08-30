import { createGoogleBooksUrl } from '@/utils/googleBooks';
import type { IBookInventory } from '@/interfaces/IBookInventory';
import { apiRequest } from '@/utils/apiClient';

export async function fetchInventoryBook(bookId: string) {
  const { book } = await apiRequest<{ book: IBookInventory | null }>(
    `/api/books?id=${encodeURIComponent(bookId)}`,
  );
  return book;
}

export async function fetchBookDetails<GoogleBook>(bookId: string) {
    try {
        const response = await fetch(createGoogleBooksUrl(bookId));

        if (!response.ok) {
            console.error('Network response was not ok');
            return;
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("book api - Error fetching book details:", error);
        throw error;
    }
}
