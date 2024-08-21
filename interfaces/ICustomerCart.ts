// src/interfaces/ICustomerCart.ts

import { IBookInventory } from "./IBookInventory";

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
    book: IBookInventory;
    cart_id: string;
    current_price: number;
    discount_percentage?: number;
    discounted_price?: number;
    quantity: number;
    is_promotion?: boolean;
}
