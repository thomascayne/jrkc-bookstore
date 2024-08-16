// interfaces/IOrderItem.ts

export interface IOrderItem {
    id?: string;
    book_id: string;
    category_id: number;
    discount_percentage?: number;
    is_promotion?: boolean;
    isbn13: string | null;
    notes?: string;
    order_id?: string;
    order_item_date?: string;
    price_per_unit: number;
    price: number;
    quantity: number;
    status: 'cancelled' | 'damaged' | 'delivered' | 'pending' | 'processing' | 'refunded' | 'removed' | 'shipped';
}
