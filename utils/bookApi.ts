import { createGoogleBooksUrl } from '@/utils/googleBooks';

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
