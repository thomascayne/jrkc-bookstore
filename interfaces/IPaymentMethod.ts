// interfaces/IPaymentMethod.ts

export interface IPaymentMethod {
    card_brand: string;
    card_last4: number;
    card_type: string;
    card_exp_month: number;
    card_exp_year: number;
    id: string;
    is_default: boolean;
    name_on_card: string;
    payment_processor: string;
    payment_token: string;
    user_id: string;
    internalId?: number;
}