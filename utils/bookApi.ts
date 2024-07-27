// utils/bookApi.ts

export async function fetchBookDetails(bookId: string) {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY;
    const apiUrl = process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_URL;

    try {
        const response = await fetch(`${apiUrl}/${bookId}?key=${apiKey}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching book details:", error);
        throw error;
    }
}