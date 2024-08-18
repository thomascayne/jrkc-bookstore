import { IBook } from '@/interfaces/IBook';
// src/interfaces/ICustomerCart.ts

export interface ICustomerCart {
    id: string;
    created_at: string;
    items: ICustomerCartItem[];
    updated_at: string;
    user_id: string;
}
export interface ICustomerCartItem {
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
