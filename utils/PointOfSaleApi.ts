import type { BookWithThumbnail } from '@/interfaces/BookWithThumbnail';
import { apiRequest } from '@/utils/apiClient';

interface OrderItem {
  book_id: string;
  price: number;
  quantity: number;
}

interface Order {
  items: OrderItem[];
  total: number;
  transactionId: string;
}

export async function fetchPointOfSaleBooks(
  searchTerm: string = '',
  limit: number = 12,
  _sessionToken?: string,
): Promise<BookWithThumbnail[]> {
  const parameters = new URLSearchParams({
    inStock: 'true',
    limit: String(limit),
    search: searchTerm,
  });
  const { books } = await apiRequest<{ books: BookWithThumbnail[] }>(
    `/api/books?${parameters.toString()}`,
  );
  return books.map((book) => ({
    ...book,
    discountPercentage: book.discount_percentage,
    isPromotion: book.is_promotion,
    thumbnail: book.thumbnail_image_link || book.small_thumbnail_image_link,
  }));
}

export async function createPointOfSaleOrder(order: Order) {
  return apiRequest('/api/point-of-sale/orders', {
    body: JSON.stringify({
      items: order.items,
      paymentMethod: 'card',
      transactionId: order.transactionId,
    }),
    method: 'POST',
  });
}

export async function cancelPointOfSaleTransaction(_orderId: string) {
  return { error: null, success: true };
}
