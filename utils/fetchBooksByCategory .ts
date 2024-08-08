// utils/fetchBooksByCategory.ts

import { BookCategory } from '@/interfaces/BookCategory';
import { IBook } from '@/interfaces/IBook';
import { createClient } from '@/utils/supabase/client';

export async function fetchBooksByCategory(categoryKey: string, booksPerLoad: number) {
  const supabase = createClient();

  try {
    // Fetch the category from Supabase using the "key"
    const { data: category, error: categoryError } = await supabase
      .from('book_categories')
      .select('id, label')
      .eq('key', categoryKey)
      .single();

    if (categoryError) {
      throw categoryError;
    }

    // Type assertion for category
    const typedCategory = category as BookCategory;

    // Fetch books from Supabase based on the category key
    const { data: books, error: booksError } = await supabase
      .from('books')
      .select('*')
      .eq('categoryId', category.id);

    if (booksError) {
      throw booksError;
    }

    // Type assertion for books
    const typedBooks = books as IBook[];

    // Filter books with available images
    const booksWithImages = typedBooks.filter(
      (book) => book.thumbnail_image_link
    );

    return {
      category: typedCategory.label,
      fetchedBooks: booksWithImages,
      books: booksWithImages,
      displayedBooks: booksWithImages.slice(0, booksPerLoad),
    };
  } catch (error) {
    console.error('fetchBooksByCategory - Error fetching books:', error);
    throw error;
  }
}