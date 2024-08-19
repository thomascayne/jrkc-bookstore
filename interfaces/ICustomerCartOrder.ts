import { OrderStatus } from './IOrder';
import { IBookInventory } from '@/interfaces/IBookInventory';

export interface ICartOrder {
    id: string;
    user_id: string;
    status: OrderStatus
    total_amount: number;
    created_at: string;
    updated_at: string;
    items: ICartOrderItem[];
}

export interface ICartOrderItem {
    id: string;
    book_id: string;
    book: IBookInventory;
    discount_percentage?: number;
    final_price: number;
    order_id: string;
    original_price: number;
    quantity: number;
}

