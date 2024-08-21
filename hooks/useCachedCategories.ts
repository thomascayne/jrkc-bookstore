import { useState, useEffect } from 'react';
import { BookCategory } from '@/interfaces/BookCategory';
import { fetchBookCategories } from '@/utils/bookCategoriesApi';

export const useCachedCategories = () => {
  const [categories, setCategories] = useState<BookCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const cachedCategories = sessionStorage.getItem('bookCategories');
        if (cachedCategories) {
          setCategories(JSON.parse(cachedCategories));
          setIsLoading(false);
        } else {
          const fetchedCategories = await fetchBookCategories();
          setCategories(fetchedCategories);
          sessionStorage.setItem('bookCategories', JSON.stringify(fetchedCategories));
          setIsLoading(false);
        }
      } catch (err) {
        setError(err as Error);
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, isLoading, error };
};