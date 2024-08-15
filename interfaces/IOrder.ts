// src/interfaces/Order.ts

export interface IOrder {
    id?: string;
    customer_email?: string;
    customer_phone?: string;
    notes?: string;
    order_date?: string;
    order_discount_percentage?: number;
    payment_method?: string;
    sales_person_id: string;
    status: 'cancelled' | 'damaged' | 'delivered' | 'pending' | 'processing' | 'refunded' | 'removed' | 'shipped';
    total_amount: number;
    transaction_id: string;
}
