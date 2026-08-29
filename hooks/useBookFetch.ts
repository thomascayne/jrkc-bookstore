// hooks/useBookFetch.ts

import { GoogleBook } from '@/interfaces/GoogleBook';
import { createGoogleBooksUrl } from '@/utils/googleBooks';
import { useState, useEffect } from 'react';

export function useBookFetch(category: { key: string; label: string }) {
    const [books, setBooks] = useState<GoogleBook[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchBooks = async () => {
            setIsLoading(true);

            try {
                const response = await fetch(createGoogleBooksUrl('', {
                    maxResults: 12,
                    orderBy: 'relevance',
                    q: `subject:${category.label}`,
                }));

                const data = await response.json();
                const fetchedItems = data.items || [];

                const booksWithImages = fetchedItems.filter(
                    (book: GoogleBook) =>
                        book.volumeInfo &&
                        book.volumeInfo.imageLinks &&
                        book.volumeInfo.imageLinks.thumbnail
                );

                setBooks(booksWithImages);
            } catch (error) {
                console.error("Error fetching books:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchBooks();
    }, [category]);

    return { books, isLoading };
}
