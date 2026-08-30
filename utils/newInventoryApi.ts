import type { BookCategory } from '@/interfaces/BookCategory';
import type { IBookInventory } from '@/interfaces/IBookInventory';
import { apiRequest } from '@/utils/apiClient';

interface BookWithCategory extends IBookInventory {
  category_name: string;
}

export const fetchInventory = async (): Promise<BookWithCategory[]> => {
  const { inventory } = await apiRequest<{ inventory: IBookInventory[] }>(
    '/api/inventory',
  );
  return inventory.map((book) => ({
    ...book,
    category_name: book.category?.label ?? '',
  }));
};

export const fetchCategories = async (): Promise<BookCategory[]> => {
  const { categories } = await apiRequest<{ categories: BookCategory[] }>(
    '/api/categories',
  );
  return categories;
};

export const addBookToInventory = async (
  book_id: string,
  quantity: number,
  price: number,
  categoryId: string,
  title: string,
) =>
  apiRequest('/api/inventory', {
    body: JSON.stringify({
      book_id,
      category_id: Number(categoryId),
      price,
      quantity,
      title,
    }),
    method: 'POST',
  });

export const updateInventoryQuantity = async (id: string, quantity: number) => {
  await apiRequest('/api/inventory', {
    body: JSON.stringify({ id, quantity }),
    method: 'PATCH',
  });
  return true;
};

export const updateBookPrice = async (id: string, price: number) => {
  await apiRequest('/api/inventory', {
    body: JSON.stringify({ id, price }),
    method: 'PATCH',
  });
  return true;
};
