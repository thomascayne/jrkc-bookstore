// utils/PointOfSaleApi.ts

import { BookWithThumbnail } from '@/interfaces/BookWithThumbnail';
import { supabase } from '@/utils/supabase/client';

interface OrderItem {
  book_id: string;
  quantity: number;
  price: number;
}

interface Order {
  items: OrderItem[];
  total: number;
  transactionId: string;
}

export async function fetchPointOfSaleBooks(searchTerm: string = '', limit: number = 12): Promise<BookWithThumbnail[]> {
  try {

    // const { data: inventoryBooks, error: inventoryBooksError } = await supabase
    // .from('inventory')
    // .select('*')
    // .limit(limit)
    // .order('title', { ascending: true });

    // console.log('inventoryBooks', inventoryBooks);

    const { data, error } = await supabase
      .rpc('fetch_point_of_sale_books', {
        search_term: searchTerm,
        limit_count: limit
      })
      .limit(limit);

    if (error) {
      console.error('Error fetching books:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching books:', error);
    return [];
  }
}

export async function createOrder(order: Order) {
  try {
    const { data, error } = await supabase
      .rpc('create_pos_order', {
        items: order.items,
        total: order.total,
        transaction_id: order.transactionId,
      });

    if (error) {
      return []
    }

    return data;
  } catch (error) {
    console.error('Error creating order:', error);
    return []
  }
}

export async function cancelPointOfSaleTransaction(orderId: string): Promise<{ success: boolean; error: any }> {

  try {
    const { data, error } = await supabase
      .rpc('cancel_point_of_sale_transaction', { order_id: orderId });

    if (error) {
      console.error('Error cancelling transaction:', error);
      return { success: false, error };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Error cancelling transaction:', error);
    return { success: false, error };
  }
}
