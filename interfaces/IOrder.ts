import { IBook } from '@/interfaces/IBook';
// src/interfaces/IOrder.ts

export interface IOrder {
    id: string;
    user_id: string;
    status: 'pending' | 'processing' | 'completed' | 'cancelled';
    total_amount: number;
    created_at: string;
    updated_at: string;
    items: IOrderItem[];
}

export interface IOrderItem {
    id: string;
    book_id: string;
    book: IBook;
    discount_percentage?: number;
    final_price: number;
    order_id: string;
    original_price: number;
    quantity: number;
}
