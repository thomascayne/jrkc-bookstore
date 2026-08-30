import type { BookCategory } from '@/interfaces/BookCategory';
import { apiRequest } from '@/utils/apiClient';

export async function fetchBookCategories(): Promise<BookCategory[]> {
  const { categories } = await apiRequest<{ categories: BookCategory[] }>(
    '/api/categories',
  );
  return categories;
}
