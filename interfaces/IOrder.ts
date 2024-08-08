// src/interfaces/IOrder.ts

import { IBook } from '@/interfaces/IBook';

export interface IOrder {
    id: string;
    user_id: string;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
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

export interface CardDetails {
    cardNumber: string;
    expiryDate: string;
    cvv: string;
}

export interface PaymentMethod {
    method: 'credit_card' | 'paypal';
    details: CardDetails;
}
