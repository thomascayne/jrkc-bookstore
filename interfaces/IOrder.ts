// src/interfaces/IOrder.ts
export type OrderStatus =  'cancelled' | 'damaged' | 'delivered' | 'paid' |'pending' | 'paid' |'processing' | 'refunded' | 'removed' | 'shipped';

export interface IOrder {
    id?: string;
    customer_email?: string;
    customer_phone?: string;
    notes?: string;
    order_date?: string;
    order_discount_percentage?: number;
    payment_method?: string;
    sales_person_id: string;
    status: OrderStatus;
    subtotal?: number;
    total_amount: number;
    tax_amount?: number;
    transaction_id: string;
}
