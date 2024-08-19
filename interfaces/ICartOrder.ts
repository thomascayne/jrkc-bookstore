import { IBook } from '@/interfaces/IBook';

export interface ICartOrder {
    id: string;
    user_id: string;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    total_amount: number;
    created_at: string;
    updated_at: string;
    items: ICartOrderItem[];
}

export interface ICartOrderItem {
    id: string;
    book_id: string;
    book: IBook;
    discount_percentage?: number;
    final_price: number;
    order_id: string;
    original_price: number;
    quantity: number;
}

