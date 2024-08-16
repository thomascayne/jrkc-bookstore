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

export async function fetchPointOfSaleBooks(searchTerm: string = '', limit: number = 12, session_token: string): Promise<BookWithThumbnail[]> {
  const url = new URL(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/inventory`);

  // Add query parameters
  url.searchParams.append('select', '*');
  url.searchParams.append('limit', limit.toString());
  
  try {
      const { data, error } = await supabase
      .rpc('fetch_point_of_sale_books', {
        search_term: searchTerm,
        limit_count: limit
      })
      .limit(limit);


    // const response = await fetch(url, {
    //   method: 'GET',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${session_token}`,
    //     'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    //   }
    // });
    
    if (error) {
      console.error('Error fetching books:', error);
      return [];
    }

    // const text = await response.text();
    // console.log('Response text:', text);

    // const inventoryBooks: BookWithThumbnail[] = text ? JSON.parse(text) : [];
    
    // console.log('inventoryBooks', inventoryBooks);

    return data;
  } catch (error) {
    console.error('Error fetching books:', error);
    return [];
  }
}

export async function createPointOfSaleOrder(order: Order) {
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
