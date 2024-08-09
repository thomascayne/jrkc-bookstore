import { IBook } from '@/interfaces/IBook';
// src/interfaces/ICart.ts

export interface ICart {
    id: string;
    created_at: string;
    items: ICartItem[];
    updated_at: string;
    user_id: string;
}
export interface ICartItem {
    id: string;
    book_id: string;
    book: IBook;
    cart_id: string;
    current_price: number;
    discount_percentage?: number;
    discounted_price?: number;
    quantity: number;
    is_promotion?: boolean;
}
